import { motion } from 'framer-motion';
import { useState } from 'react';
import { Filter, Search, LogIn, LogOut, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useAllBookings, useUpdateBookingStatus } from '@/hooks/useQueries';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import { TableSkeleton, ErrorMessage } from '@/components/ui/LoadingStates';
import { BookingStatusBadge, BookingTimeline } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, calcNights } from '@/utils/format';
import type { BookingFilter, BookingStatus } from '@/types';
import toast from 'react-hot-toast';

const FILTERS: { label: string; value: BookingFilter }[] = [
  { label: 'All',              value: 'ALL'              },
  { label: '⏳ Pending Review', value: 'PENDING_REVIEW'  },
  { label: 'Approved',         value: 'APPROVED'         },
  { label: 'Rejected',         value: 'REJECTED'         },
  { label: 'Pending Payment',  value: 'PENDING_PAYMENT'  },
  { label: 'Payment Uploaded', value: 'PAYMENT_UPLOADED' },
  { label: 'Confirmed',        value: 'CONFIRMED'        },
  { label: 'Checked In',       value: 'CHECKED_IN'       },
  { label: 'Checked Out',      value: 'CHECKED_OUT'      },
  { label: 'Cancelled',        value: 'CANCELLED'        },
];

export default function AdminBookingsPage() {
  const { data: bookings, isLoading, error, refetch } = useAllBookings();
  const updateStatus = useUpdateBookingStatus();
  const qc = useQueryClient();

  const [filter,   setFilter]   = useState<BookingFilter>('ALL');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteMap,  setNoteMap]  = useState<Record<string, string>>({});

  // ── Approve mutation ───────────────────────────────────────────────────────
  const approveBooking = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      bookingService.approveBooking(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking approved — guest notified to proceed with payment.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Reject mutation ───────────────────────────────────────────────────────
  const rejectBooking = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      bookingService.rejectBooking(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking rejected.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (bookings ?? []).filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.booking_reference.toLowerCase().includes(q) ||
        b.profile?.full_name?.toLowerCase().includes(q) ||
        b.room?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Count pending-review bookings for badge ────────────────────────────────
  const pendingCount = (bookings ?? []).filter(b => b.status === 'PENDING_REVIEW').length;

  function canApprove(s: BookingStatus)   { return s === 'PENDING_REVIEW'; }
  function canReject(s: BookingStatus)    { return s === 'PENDING_REVIEW'; }
  function canCheckIn(s: BookingStatus)   { return s === 'CONFIRMED'; }
  function canCheckOut(s: BookingStatus)  { return s === 'CHECKED_IN'; }
  function canCancel(s: BookingStatus)    { return !['CANCELLED', 'CHECKED_OUT', 'REJECTED'].includes(s); }

  function exportToCSV() {
    if (!bookings || bookings.length === 0) return;
    
    // Create CSV header
    const headers = [
      'Booking Reference', 'Status', 'Room', 'Check-in', 'Check-out', 
      'Nights', 'Total Amount', 'Guest Name', 'Email', 'Phone', 'Created At'
    ];
    
    // Map data
    const rows = filtered.map(b => [
      b.booking_reference,
      b.status,
      b.room?.name || 'Unknown Room',
      b.check_in_date,
      b.check_out_date,
      calcNights(b.check_in_date, b.check_out_date),
      b.total_amount,
      b.profile?.full_name || 'N/A',
      b.profile?.email || 'N/A',
      b.profile?.phone || 'N/A',
      new Date(b.created_at).toISOString().split('T')[0]
    ]);

    // Escape CSV values
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Horemow_Bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const isBusy = approveBooking.isPending || rejectBooking.isPending || updateStatus.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Bookings Management</h2>
          <p className="text-gray-400 text-sm">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} shown.</p>
        </div>

        {/* Pending review alert badge */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} booking{pendingCount !== 1 ? 's' : ''} awaiting your review
          </div>
        )}

        <button 
          onClick={exportToCSV}
          disabled={!bookings || bookings.length === 0}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input pl-11 text-sm"
            placeholder="Search by reference, guest, room…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <Filter className="w-4 h-4 text-gray-500 self-center" />
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.value ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
            {f.value === 'PENDING_REVIEW' && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorMessage error={error} retry={refetch} />
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const open   = expanded === b.id;
            const nights = calcNights(b.check_in_date, b.check_out_date);

            // 72h review countdown
            const reviewMs = b.review_expires_at ? new Date(b.review_expires_at).getTime() - Date.now() : 0;
            const reviewHrs = Math.max(0, Math.ceil(reviewMs / 3_600_000));

            return (
              <motion.div
                key={b.id}
                layout
                className={`card cursor-pointer ${b.status === 'PENDING_REVIEW' ? 'border-yellow-500/30' : ''}`}
                onClick={() => setExpanded(open ? null : b.id)}
              >
                {/* Summary row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-brand-400 text-sm font-semibold">{b.booking_reference}</span>
                    <BookingStatusBadge status={b.status} />
                    {b.status === 'PENDING_REVIEW' && reviewHrs > 0 && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {reviewHrs}h left to review
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-300 hidden md:inline">{b.profile?.full_name ?? '–'}</span>
                    <span className="text-gray-400 hidden md:inline">{b.room?.name ?? '–'}</span>
                    <span className="text-white font-semibold">{formatCurrency(b.total_amount)}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/8 space-y-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-gray-500 text-xs">Guest</p><p className="text-white">{b.profile?.full_name ?? '–'}</p></div>
                      <div><p className="text-gray-500 text-xs">Room</p><p className="text-white">{b.room?.name ?? '–'}</p></div>
                      <div><p className="text-gray-500 text-xs">Check-in</p><p className="text-white">{formatDate(b.check_in_date)}</p></div>
                      <div><p className="text-gray-500 text-xs">Check-out</p><p className="text-white">{formatDate(b.check_out_date)}</p></div>
                      <div><p className="text-gray-500 text-xs">Nights</p><p className="text-white">{nights}</p></div>
                      <div><p className="text-gray-500 text-xs">Total</p><p className="text-brand-400 font-bold">{formatCurrency(b.total_amount)}</p></div>
                      <div><p className="text-gray-500 text-xs">Phone</p><p className="text-white">{b.profile?.phone ?? '–'}</p></div>
                      <div><p className="text-gray-500 text-xs">Residency</p><p className="text-white capitalize">{(b.profile as { residency_status?: string })?.residency_status?.replace('_', ' ') ?? '–'}</p></div>
                    </div>

                    {/* Admin note display */}
                    {b.admin_note && (
                      <div className="bg-white/4 rounded-xl px-4 py-3 text-sm text-gray-300">
                        <p className="text-xs text-gray-500 mb-1">Admin note</p>
                        {b.admin_note}
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="overflow-x-auto">
                      <BookingTimeline status={b.status} />
                    </div>

                    {/* Admin note input (shown when approve/reject available) */}
                    {(canApprove(b.status) || canReject(b.status)) && (
                      <div>
                        <label className="input-label">Note to guest (optional)</label>
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder="Reason for approval / rejection…"
                          value={noteMap[b.id] ?? ''}
                          onChange={e => setNoteMap(m => ({ ...m, [b.id]: e.target.value }))}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      {/* Approve */}
                      {canApprove(b.status) && (
                        <button
                          onClick={() => approveBooking.mutate({ id: b.id, note: noteMap[b.id] })}
                          disabled={isBusy}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Booking
                        </button>
                      )}

                      {/* Reject */}
                      {canReject(b.status) && (
                        <button
                          onClick={() => rejectBooking.mutate({ id: b.id, note: noteMap[b.id] })}
                          disabled={isBusy}
                          className="btn-danger text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      )}

                      {/* Check in */}
                      {canCheckIn(b.status) && (
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'CHECKED_IN' })}
                          disabled={isBusy}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          <LogIn className="w-4 h-4" />
                          Mark Checked In
                        </button>
                      )}

                      {/* Check out */}
                      {canCheckOut(b.status) && (
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'CHECKED_OUT' })}
                          disabled={isBusy}
                          className="btn-secondary text-sm px-4 py-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Mark Checked Out
                        </button>
                      )}

                      {/* Cancel */}
                      {canCancel(b.status) && (
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'CANCELLED' })}
                          disabled={isBusy}
                          className="btn-ghost text-sm text-red-400 hover:bg-red-500/10"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">No bookings match your filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
