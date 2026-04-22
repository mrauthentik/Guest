import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, ArrowRight, XCircle, QrCode, X, Download, Filter, BookOpen, BedDouble,
} from 'lucide-react';
import { useUserBookings, useCancelBooking } from '@/hooks/useQueries';
import { TableSkeleton, ErrorMessage, EmptyState } from '@/components/ui/LoadingStates';
import { BookingStatusBadge, BookingTimeline } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, calcNights, formatCountdown } from '@/utils/format';
import type { Booking, BookingFilter } from '@/types';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useState, useRef } from 'react';

const BarcodeStrips = () => (
  <div className="flex h-12 w-full justify-between items-center opacity-80 mt-2 px-4">
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} className="bg-[#ffffff] h-full" style={{ width: `${Math.max(1, Math.random() * 4)}px`, opacity: Math.random() * 0.5 + 0.5 }} />
    ))}
  </div>
);

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
  const [showTicket, setShowTicket] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const downloadPass = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Horemow_Pass_${booking.booking_reference}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const nights = calcNights(booking.check_in_date, booking.check_out_date);
  const canCancel = ['PENDING_REVIEW', 'PENDING_PAYMENT', 'PAYMENT_UPLOADED'].includes(booking.status);
  const canPay    = booking.status === 'PENDING_PAYMENT';
  const hasTicket = ['PAYMENT_UPLOADED', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status);

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
          {hasTicket && (
            <button
              onClick={() => setShowTicket(true)}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10bc96, #5eeac7)', color: '#042e28' }}
            >
              <QrCode className="w-5 h-5" />
              View Digital Pass
            </button>
          )}

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

      {/* Ticket Modal */}
      <AnimatePresence>
        {showTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTicket(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm flex flex-col items-center"
            >
              {/* Ticket UI */}
              <div ref={ticketRef} className="bg-[#f0f4f8] rounded-[24px] overflow-hidden shadow-2xl relative w-full">
                {/* Top Section */}
                <div className="bg-[#079679] p-8 text-center text-[#ffffff] relative">
                  <button onClick={() => setShowTicket(false)} className="absolute top-4 right-4 text-[rgba(255,255,255,0.7)] hover:text-[#ffffff]" data-html2canvas-ignore>
                    <X className="w-6 h-6" />
                  </button>
                  <p className="text-[#99f5dd] text-xs font-bold uppercase tracking-widest mb-1">Horemow Campground</p>
                  <h3 className="font-display font-black text-3xl mb-4 text-[#ffffff]">Guest Pass</h3>
                  
                  <div className="inline-block bg-[rgba(255,255,255,0.2)] px-6 py-2 rounded-full border border-[rgba(255,255,255,0.3)]">
                    <p className="font-mono text-xl font-bold tracking-wider">{booking.booking_reference}</p>
                  </div>
                </div>

                {/* Scalloped edge effect */}
                <div className="flex justify-between items-center -mt-4 relative px-2">
                   <div className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.8)] -ml-4 shadow-inner" />
                   <div className="flex-1 border-t-2 border-dashed border-[#d1d5db] mx-2" />
                   <div className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.8)] -mr-4 shadow-inner" />
                </div>

                {/* Details Section */}
                <div className="p-8 pb-10 text-[#1f2937]">
                  <div className="mb-6 text-center">
                    <p className="text-[#6b7280] text-xs font-bold uppercase tracking-wider mb-1">Room</p>
                    <p className="text-xl font-bold">{booking.room?.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="text-[#6b7280] text-[10px] font-bold uppercase mb-1">Check-in</p>
                      <p className="font-semibold text-sm">{format(new Date(booking.check_in_date), 'd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#6b7280] text-[10px] font-bold uppercase mb-1">Check-out</p>
                      <p className="font-semibold text-sm">{format(new Date(booking.check_out_date), 'd MMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="text-center bg-[#1f2937] text-[#ffffff] rounded-xl py-4 flex flex-col items-center">
                     <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest mb-1">Scan at Reception</p>
                     <BarcodeStrips />
                     <p className="font-mono text-xs text-[#9ca3af] mt-2 tracking-[0.2em]">{booking.id.split('-')[0].toUpperCase()}-{booking.booking_reference}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={downloadPass}
                disabled={isDownloading}
                className="mt-6 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 font-bold transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {isDownloading ? 'Generating PDF…' : 'Download as PDF'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
