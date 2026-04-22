import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Booking, BookingForm, BookingStatus } from '@/types';

// Generate booking reference like GH-2026-000123
function generateReference(): string {
  const year   = new Date().getFullYear();
  const seq    = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `GH-${year}-${seq}`;
}

export const bookingService = {
  // ── Create booking ─────────────────────────────────────────────────────────
  // PM § 5.2 — New bookings enter PENDING_REVIEW with a 72-hour window
  async createBooking(
    userId: string,
    form: BookingForm,
    totalAmount: number,
  ): Promise<Booking> {
    // Availability check
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', form.room_id)
      .not('status', 'in', '("CANCELLED","CHECKED_OUT","REJECTED")')
      .lt('check_in_date', form.check_out_date)
      .gt('check_out_date', form.check_in_date);

    if (conflicts && conflicts.length > 0) {
      throw new Error('Room is not available for the selected dates.');
    }

    const now             = Date.now();
    const reviewExpiresAt = new Date(now + 72 * 60 * 60 * 1000).toISOString(); // +72h
    const expiresAt       = new Date(now + 74 * 60 * 60 * 1000).toISOString(); // grace past review

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        id:                uuidv4(),
        user_id:           userId,
        room_id:           form.room_id,
        check_in_date:     form.check_in_date,
        check_out_date:    form.check_out_date,
        total_amount:      totalAmount,
        status:            'PENDING_REVIEW' as BookingStatus,
        booking_reference: generateReference(),
        review_expires_at: reviewExpiresAt,
        expires_at:        expiresAt,
      }])
      .select(`
        *,
        room:rooms(*),
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data as Booking;
  },

  // ── User: get own bookings ─────────────────────────────────────────────────
  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*),
        payments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Booking[];
  },

  // ── Admin: get all bookings ───────────────────────────────────────────────
  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*),
        profile:profiles(*),
        payments(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Booking[];
  },

  // ── Get single booking ────────────────────────────────────────────────────
  async getBooking(id: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*),
        profile:profiles(*),
        payments(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Booking;
  },

  // ── Update status ─────────────────────────────────────────────────────────
  async updateStatus(id: string, status: BookingStatus, adminNote?: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status, ...(adminNote !== undefined ? { admin_note: adminNote } : {}) })
      .eq('id', id);
    if (error) throw error;
  },

  // ── PM § 5.2 — Admin: Approve during review window ────────────────────────
  // Approval moves booking to PENDING_PAYMENT so user can pay
  async approveBooking(id: string, adminNote?: string): Promise<void> {
    const now             = Date.now();
    const paymentDeadline = new Date(now + 48 * 60 * 60 * 1000).toISOString(); // 48h to pay

    const { error } = await supabase
      .from('bookings')
      .update({
        status:     'PENDING_PAYMENT' as BookingStatus,
        expires_at: paymentDeadline,
        admin_note: adminNote ?? 'Approved by admin.',
      })
      .eq('id', id)
      .in('status', ['PENDING_REVIEW', 'APPROVED']);

    if (error) throw error;
  },

  // ── PM § 5.2 — Admin: Reject during review window ────────────────────────
  async rejectBooking(id: string, adminNote?: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        status:     'REJECTED' as BookingStatus,
        admin_note: adminNote ?? 'Rejected by admin.',
      })
      .eq('id', id);
    if (error) throw error;
  },

  // ── User / Admin: Cancel ──────────────────────────────────────────────────
  async cancelBooking(id: string): Promise<void> {
    await bookingService.updateStatus(id, 'CANCELLED');
  },

  // ── PM § 5.2 — Auto-confirm: expire review window on frontend ─────────────
  // (Database-side auto-confirm runs via auto_confirm_pending_bookings() function)
  async cancelExpiredPayments(): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('status', 'PENDING_PAYMENT')
      .lt('expires_at', now);
    if (error) console.error('Failed to cancel expired payment bookings:', error);
  },

  // ── PM § 5.2 — Auto-confirm: trigger from frontend (client-side fallback) ──
  async autoConfirmExpiredReviews(): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('bookings')
      .update({
        status:     'CONFIRMED' as BookingStatus,
        admin_note: 'Auto-confirmed after 72-hour review window.',
      })
      .eq('status', 'PENDING_REVIEW')
      .lt('review_expires_at', now);
    if (error) console.error('Failed to auto-confirm bookings:', error);
  },
};
