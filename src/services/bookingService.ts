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
  async createBooking(
    userId: string,
    form: BookingForm,
    totalAmount: number,
  ): Promise<Booking> {
    // Check availability first
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', form.room_id)
      .not('status', 'in', '("CANCELLED","CHECKED_OUT")')
      .lt('check_in_date', form.check_out_date)
      .gt('check_out_date', form.check_in_date);

    if (conflicts && conflicts.length > 0) {
      throw new Error('Room is not available for the selected dates.');
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // +2h

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        id:                uuidv4(),
        user_id:           userId,
        room_id:           form.room_id,
        check_in_date:     form.check_in_date,
        check_out_date:    form.check_out_date,
        total_amount:      totalAmount,
        status:            'PENDING_PAYMENT' as BookingStatus,
        booking_reference: generateReference(),
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

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async cancelBooking(id: string): Promise<void> {
    await bookingService.updateStatus(id, 'CANCELLED');
  },

  async cancelExpiredBookings(): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('status', 'PENDING_PAYMENT')
      .lt('expires_at', now);
    if (error) console.error('Failed to cancel expired bookings:', error);
  },
};
