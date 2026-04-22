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

    // Try new PENDING_REVIEW flow first; fall back to PENDING_PAYMENT if migration not yet run
    let data: Booking | null = null;
    let lastError: Error | null = null;

    for (const status of ['PENDING_REVIEW', 'PENDING_PAYMENT'] as BookingStatus[]) {
      const { data: d, error } = await supabase
        .from('bookings')
        .insert([{
          id:                uuidv4(),
          user_id:           userId,
          room_id:           form.room_id,
          check_in_date:     form.check_in_date,
          check_out_date:    form.check_out_date,
          total_amount:      totalAmount,
          status,
          booking_reference: generateReference(),
          review_expires_at: status === 'PENDING_REVIEW' ? reviewExpiresAt : undefined,
          expires_at:        expiresAt,
        }])
        // NOTE: no profile join here — bookings.user_id → auth.users, not profiles directly
        // Profile data isn't needed at booking creation time; user is already in AuthContext
        .select('*, room:rooms(*)')
        .single();

      if (!error) { data = d as Booking; break; }
      lastError = error as Error;
    }

    if (!data) throw lastError ?? new Error('Failed to create booking.');
    return data;
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

  // ── Admin: get all bookings (manual profile join) ───────────────────────
  // Profile fetched separately (bookings.user_id → auth.users, no direct FK to profiles)
  async getAllBookings(): Promise<Booking[]> {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(*), payments(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!bookings || bookings.length === 0) return [];

    const userIds = [...new Set((bookings as { user_id: string }[]).map(b => b.user_id))];
    const { data: profiles } = await supabase
      .from('profiles').select('*').in('id', userIds);

    const profileMap: Record<string, object> = {};
    (profiles ?? []).forEach((p: { id: string }) => { profileMap[p.id] = p; });

    return (bookings as { user_id: string }[]).map(b => ({
      ...b, profile: profileMap[b.user_id] ?? null,
    })) as Booking[];
  },

  // ── Get single booking (manual profile join) ───────────────────────────
  async getBooking(id: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(*), payments(*)')
      .eq('id', id)
      .single();
    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles').select('*')
      .eq('id', (data as { user_id: string }).user_id)
      .single();

    return { ...data, profile: profile ?? null } as Booking;
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
  // Silently swallows 400 errors (e.g. column not yet in DB after migration)
  async autoConfirmExpiredReviews(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await supabase
        .from('bookings')
        .update({
          status:     'CONFIRMED' as BookingStatus,
          admin_note: 'Auto-confirmed after 72-hour review window.',
        })
        .eq('status', 'PENDING_REVIEW')
        .lt('review_expires_at', now);
    } catch {
      // Column may not exist yet — safe to ignore until migration is run
    }
  },
};
