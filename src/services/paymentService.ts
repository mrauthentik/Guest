import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Payment, PaymentStatus } from '@/types';

export const paymentService = {
  async uploadProof(file: File, bookingRef: string): Promise<string> {
    const ext      = file.name.split('.').pop();
    const filename = `${bookingRef}-${uuidv4()}.${ext}`;
    const path     = `payment-proofs/${filename}`;

    const { error } = await supabase.storage
      .from('payments')
      .upload(path, file, { upsert: false });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('payments')
      .getPublicUrl(path);

    return urlData.publicUrl;
  },

  async submitPayment(payload: {
    booking_id:      string;
    transaction_ref: string;
    sender_name:     string;
    proof_url:       string;
    amount:          number;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...payload, status: 'pending' as PaymentStatus }])
      .select()
      .single();
    if (error) throw error;

    // Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'PAYMENT_UPLOADED' })
      .eq('id', payload.booking_id);
    if (bookingError) throw bookingError;

    return data as Payment;
  },

  async getPaymentsForBooking(bookingId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Payment[];
  },

  async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*, room:rooms(*), profile:profiles(*))
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Payment[];
  },

  async verifyPayment(paymentId: string, bookingId: string): Promise<void> {
    const { error: pErr } = await supabase
      .from('payments')
      .update({ status: 'verified' as PaymentStatus })
      .eq('id', paymentId);
    if (pErr) throw pErr;

    const { error: bErr } = await supabase
      .from('bookings')
      .update({ status: 'CONFIRMED' })
      .eq('id', bookingId);
    if (bErr) throw bErr;
  },

  async rejectPayment(paymentId: string, bookingId: string): Promise<void> {
    const { error: pErr } = await supabase
      .from('payments')
      .update({ status: 'rejected' as PaymentStatus })
      .eq('id', paymentId);
    if (pErr) throw pErr;

    const { error: bErr } = await supabase
      .from('bookings')
      .update({ status: 'PENDING_PAYMENT' })
      .eq('id', bookingId);
    if (bErr) throw bErr;
  },
};
