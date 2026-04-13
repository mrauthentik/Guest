import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Search, ExternalLink, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { useAllPayments, useVerifyPayment, useRejectPayment } from '@/hooks/useQueries';
import { TableSkeleton, ErrorMessage } from '@/components/ui/LoadingStates';
import { PaymentStatusBadge, BookingStatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import type { PaymentStatus } from '@/types';

const FILTERS: { label: string; value: PaymentStatus | 'all' }[] = [
  { label: 'All',      value: 'all'     },
  { label: 'Pending',  value: 'pending' },
  { label: 'Verified', value: 'verified'},
  { label: 'Rejected', value: 'rejected'},
];

export default function AdminPaymentsPage() {
  const { data: payments, isLoading, error, refetch } = useAllPayments();
  const verify = useVerifyPayment();
  const reject = useRejectPayment();

  const [filter,   setFilter]   = useState<PaymentStatus | 'all'>('all');
  const [search,   setSearch]   = useState('');
  const [preview,  setPreview]  = useState<string | null>(null);

  const filtered = (payments ?? []).filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.transaction_ref.toLowerCase().includes(q) ||
        p.sender_name.toLowerCase().includes(q) ||
        (p.booking?.booking_reference ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">Payments Verification</h2>
        <p className="text-gray-400 text-sm">Review and verify guest payment proofs.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input pl-11 text-sm"
            placeholder="Search by reference, sender…"
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
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorMessage error={error} retry={refetch} />
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: payment details */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-brand-400 text-sm font-semibold">
                      {p.booking?.booking_reference ?? '–'}
                    </span>
                    <PaymentStatusBadge status={p.status} />
                    {p.booking && <BookingStatusBadge status={p.booking.status} />}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-500 text-xs">Transaction Ref</p><p className="text-white font-mono">{p.transaction_ref}</p></div>
                    <div><p className="text-gray-500 text-xs">Sender Name</p><p className="text-white">{p.sender_name}</p></div>
                    <div><p className="text-gray-500 text-xs">Amount</p><p className="text-brand-400 font-bold">{formatCurrency(p.amount)}</p></div>
                    <div><p className="text-gray-500 text-xs">Submitted</p><p className="text-white">{formatDate(p.created_at)}</p></div>
                    <div><p className="text-gray-500 text-xs">Guest</p><p className="text-white">{p.booking?.profile?.full_name ?? '–'}</p></div>
                    <div><p className="text-gray-500 text-xs">Room</p><p className="text-white">{p.booking?.room?.name ?? '–'}</p></div>
                  </div>

                  {/* Actions */}
                  {p.status === 'pending' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => verify.mutate({ paymentId: p.id, bookingId: p.booking_id })}
                        disabled={verify.isPending}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verify Payment
                      </button>
                      <button
                        onClick={() => reject.mutate({ paymentId: p.id, bookingId: p.booking_id })}
                        disabled={reject.isPending}
                        className="btn-danger text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  {p.status === 'verified' && (
                    <div className="flex items-center gap-2 text-sm text-brand-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Payment verified — booking confirmed.
                    </div>
                  )}
                  {p.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <XCircle className="w-4 h-4" />
                      Payment rejected.
                    </div>
                  )}
                </div>

                {/* Right: proof image */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Payment Proof</p>
                  {p.proof_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 cursor-pointer group"
                      onClick={() => setPreview(p.proof_url)}
                    >
                      <img
                        src={p.proof_url}
                        alt="Payment proof"
                        className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-white">
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Full Size
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-gray-600 text-sm">
                      No proof uploaded
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">No payments match your filter.</div>
          )}
        </div>
      )}

      {/* Image preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={preview}
              alt="Payment proof"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
