import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '@/services/roomService';
import { bookingService } from '@/services/bookingService';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import type { BookingForm, PaymentForm } from '@/types';
import toast from 'react-hot-toast';

// ── ROOMS ─────────────────────────────────────────────────────────────────────

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn:  roomService.getRooms,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn:  () => roomService.getRoom(id),
    enabled:  !!id,
  });
}

export function useAllRooms() {
  return useQuery({
    queryKey: ['rooms', 'all'],
    queryFn:  roomService.getAllRooms,
  });
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────

export function useUserBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookings', 'user', user?.id],
    queryFn:  () => bookingService.getUserBookings(user!.id),
    enabled:  !!user,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn:  bookingService.getAllBookings,
    refetchInterval: 30_000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn:  () => bookingService.getBooking(id),
    enabled:  !!id,
  });
}

export function useCreateBooking() {
  const qc     = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ form, total }: { form: BookingForm; total: number }) =>
      bookingService.createBooking(user!.id, form, total),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking submitted! It is under 72-hour admin review.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingService.updateStatus(id, status as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking status updated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────

export function useAllPayments() {
  return useQuery({
    queryKey: ['payments', 'all'],
    queryFn:  paymentService.getAllPayments,
    refetchInterval: 30_000,
  });
}

export function useSubmitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: PaymentForm) => {
      // 1. Get booking to get reference
      const booking = await import('@/services/bookingService').then(m =>
        m.bookingService.getBooking(form.booking_id)
      );
      // 2. Upload proof to storage
      let proofUrl = '';
      if (form.proof_file) {
        proofUrl = await paymentService.uploadProof(form.proof_file, booking.booking_reference);
      }
      // 3. Submit payment record
      return paymentService.submitPayment({
        booking_id:      form.booking_id,
        transaction_ref: form.transaction_ref,
        sender_name:     form.sender_name,
        proof_url:       proofUrl,
        amount:          form.amount,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment submitted! Awaiting verification.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, bookingId }: { paymentId: string; bookingId: string }) =>
      paymentService.verifyPayment(paymentId, bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment verified! Booking confirmed.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRejectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, bookingId }: { paymentId: string; bookingId: string }) =>
      paymentService.rejectPayment(paymentId, bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment rejected.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── AUTO-CONFIRM (client-side fallback) ───────────────────────────────────────
// Run once on app load; the real job runs via Supabase Edge Function / pg_cron
export function useAutoConfirmReviews() {
  const { isAdmin } = useAuth();
  return useMutation({
    mutationFn: () => bookingService.autoConfirmExpiredReviews(),
    onSuccess: () => {
      // Silent — no toast; this is background housekeeping
    },
    onError: () => {
      // Silent — non-critical
    },
  });
}
