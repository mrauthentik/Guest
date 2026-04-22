import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Calendar, ArrowRight, Filter,
  BedDouble, Clock, XCircle,
} from 'lucide-react';
import { useUserBookings, useCancelBooking } from '@/hooks/useQueries';
import { TableSkeleton, ErrorMessage, EmptyState } from '@/components/ui/LoadingStates';
import { BookingStatusBadge, BookingTimeline } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, calcNights, formatCountdown } from '@/utils/format';
import type { Booking, BookingFilter } from '@/types';

const FILTERS: { label: string; value: BookingFilter }[] = [
  { label: 'All',              value: 'ALL'              },
  { label: 'Pending Review',   value: 'PENDING_REVIEW'   },
  { label: 'Approved',         value: 'APPROVED'         },
  { label: 'Rejected',         value: 'REJECTED'         },
  { label: 'Pending Payment',  value: 'PENDING_PAYMENT'  },
  { label: 'Payment Uploaded', value: 'PAYMENT_UPLOADED' },
  { label: 'Confirmed',        value: 'CONFIRMED'        },
  { label: 'Checked In',       value: 'CHECKED_IN'       },
  { label: 'Checked Out',      value: 'CHECKED_OUT'      },
  { label: 'Cancelled',        value: 'CANCELLED'        },
];

function BookingCard({ booking }: { booking: Booking }) {
  const cancelBooking = useCancelBooking();
  const nights = calcNights(booking.check_in_date, booking.check_out_date);
  const canCancel = ['PENDING_REVIEW', 'PENDING_PAYMENT', 'PAYMENT_UPLOADED'].includes(booking.status);
  const canPay    = booking.status === 'PENDING_PAYMENT';

  // Review window countdown (72h)
  const reviewMs  = booking.review_expires_at ? new Date(booking.review_expires_at).getTime() - Date.now() : 0;
  const reviewHrs = Math.max(0, Math.ceil(reviewMs / 3_600_000));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
    >
      <div className="card group">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-brand-400 font-bold text-sm">
                {booking.booking_reference}
              </span>
              <BookingStatusBadge status={booking.status} />
            </div>
            <h3 className="text-white font-display font-semibold text-lg">
              {booking.room?.name ?? 'Room'}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-brand-400">{formatCurrency(booking.total_amount)}</div>
            <div className="text-xs text-gray-500">{nights} night{nights !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4 text-brand-400" />
            <div>
              <p className="text-xs text-gray-500">Check-in</p>
              <p className="text-white">{formatDate(booking.check_in_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4 text-brand-400" />
            <div>
              <p className="text-xs text-gray-500">Check-out</p>
              <p className="text-white">{formatDate(booking.check_out_date)}</p>
            </div>
          </div>
        </div>

        {/* Review window notice */}
        {booking.status === 'PENDING_REVIEW' && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2 mb-4">
            <Clock className="w-3.5 h-3.5" />
            {reviewHrs > 0
              ? `Under review — admin has ${reviewHrs}h to approve or reject your booking.`
              : 'Review window passed — booking will be auto-confirmed shortly.'}
          </div>
        )}

        {/* Expiry notice */}
        {booking.status === 'PENDING_PAYMENT' && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/8 border border-yellow-500/20 rounded-lg px-3 py-2 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Expires in {formatCountdown(booking.expires_at)} — pay to secure your room!
          </div>
        )}

        {/* Timeline */}
        <div className="mb-4 overflow-x-auto">
          <BookingTimeline status={booking.status} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-white/8">
          {canPay && (
            <Link to={`/bookings/${booking.id}/payment`} className="btn-primary text-sm px-4 py-2">
              <ArrowRight className="w-4 h-4" />
              Pay Now
            </Link>
          )}
          {canCancel && (
            <button
              onClick={() => cancelBooking.mutate(booking.id)}
              disabled={cancelBooking.isPending}
              className="btn-danger text-sm"
            >
              <XCircle className="w-4 h-4" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const { data: bookings, isLoading, error, refetch } = useUserBookings();
  const [filter, setFilter] = useState<BookingFilter>('ALL');

  const filtered = (bookings ?? []).filter(
    b => filter === 'ALL' || b.status === filter,
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container-max px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="divider mb-4" />
          <h1 className="text-4xl font-display font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">Track all your reservations in one place.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <Filter className="w-4 h-4 text-gray-500 self-center" />
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-brand-500 text-white'
                  : 'glass text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <ErrorMessage error={error} retry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description={filter === 'ALL' ? "You haven't made any bookings yet. Browse our rooms to get started." : `No ${filter.toLowerCase().replace('_', ' ')} bookings.`}
            icon={<BookOpen className="w-8 h-8" />}
            action={
              filter === 'ALL' ? (
                <Link to="/rooms" className="btn-primary">
                  <BedDouble className="w-4 h-4" />
                  Browse Rooms
                </Link>
              ) : undefined
            }
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-6">
              {filtered.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
