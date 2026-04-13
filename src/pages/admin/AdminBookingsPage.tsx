import { motion } from 'framer-motion';
import { useState } from 'react';
import { Filter, Search, LogIn, LogOut } from 'lucide-react';
import { useAllBookings, useUpdateBookingStatus } from '@/hooks/useQueries';
import { TableSkeleton, ErrorMessage } from '@/components/ui/LoadingStates';
import { BookingStatusBadge, BookingTimeline } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, calcNights } from '@/utils/format';
import type { BookingFilter, BookingStatus } from '@/types';

const FILTERS: { label: string; value: BookingFilter }[] = [
  { label: 'All',              value: 'ALL'              },
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
  const [filter, setFilter] = useState<BookingFilter>('ALL');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

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

  function canCheckIn(s: BookingStatus)  { return s === 'CONFIRMED'; }
  function canCheckOut(s: BookingStatus) { return s === 'CHECKED_IN'; }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">Bookings Management</h2>
        <p className="text-gray-400 text-sm">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} shown.</p>
      </div>

      {/* Controls */}
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

      {/* Filters */}
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
            const open = expanded === b.id;
            const nights = calcNights(b.check_in_date, b.check_out_date);
            return (
              <motion.div
                key={b.id}
                layout
                className="card cursor-pointer"
                onClick={() => setExpanded(open ? null : b.id)}
              >
                {/* Summary row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-brand-400 text-sm font-semibold">{b.booking_reference}</span>
                    <BookingStatusBadge status={b.status} />
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
                      <div><p className="text-gray-500 text-xs">Created</p><p className="text-white">{formatDate(b.created_at)}</p></div>
                    </div>

                    {/* Timeline */}
                    <div className="overflow-x-auto">
                      <BookingTimeline status={b.status} />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {canCheckIn(b.status) && (
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'CHECKED_IN' })}
                          disabled={updateStatus.isPending}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          <LogIn className="w-4 h-4" />
                          Mark Checked In
                        </button>
                      )}
                      {canCheckOut(b.status) && (
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'CHECKED_OUT' })}
                          disabled={updateStatus.isPending}
                          className="btn-secondary text-sm px-4 py-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Mark Checked Out
                        </button>
                      )}
                      {!['CANCELLED', 'CHECKED_OUT'].includes(b.status) && (
                        <button
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'CANCELLED' })}
                          disabled={updateStatus.isPending}
                          className="btn-danger text-sm"
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
