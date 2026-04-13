import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload, CreditCard, Building2, Copy, CheckCircle2,
  AlertTriangle, Clock, X,
} from 'lucide-react';
import { useBooking, useSubmitPayment } from '@/hooks/useQueries';
import { PageLoader, ErrorMessage } from '@/components/ui/LoadingStates';
import { BookingStatusBadge, BookingTimeline } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, calcNights, formatCountdown } from '@/utils/format';
import toast from 'react-hot-toast';

const BANK = {
  name:    'Access Bank',
  account: '0123456789',
  holder:  'Horemow Guest House Ltd',
};

export default function PaymentPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading, error } = useBooking(id!);
  const submitPayment = useSubmitPayment();

  const [form, setForm] = useState({
    transaction_ref: '',
    sender_name:     '',
  });
  const [proofFile,   setProofFile]   = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied,       setCopied]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function copyRef(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be less than 5 MB.'); return; }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    if (!form.transaction_ref.trim()) { toast.error('Please enter the transaction reference.'); return; }
    if (!form.sender_name.trim())     { toast.error('Please enter the sender name.'); return; }
    if (!proofFile)                   { toast.error('Please upload your payment screenshot.'); return; }

    submitPayment.mutate(
      { booking_id: booking.id, ...form, proof_file: proofFile, amount: booking.total_amount },
      { onSuccess: () => navigate('/my-bookings') },
    );
  }

  if (isLoading) return <PageLoader />;
  if (error || !booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorMessage error={error ?? new Error('Booking not found')} />
    </div>
  );

  const nights = calcNights(booking.check_in_date, booking.check_out_date);
  const alreadyPaid = booking.status !== 'PENDING_PAYMENT';

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container-max px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Complete Payment</h1>
          <p className="text-gray-400 mb-8">Transfer funds and upload your payment proof below.</p>

          {/* Booking summary card */}
          <div className="card mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Booking Reference</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-brand-400">{booking.booking_reference}</span>
                  <button onClick={() => copyRef(booking.booking_reference)} className="btn-ghost px-2 py-1">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div><p className="text-gray-500">Room</p><p className="text-white font-medium">{booking.room?.name}</p></div>
              <div><p className="text-gray-500">Nights</p><p className="text-white font-medium">{nights}</p></div>
              <div><p className="text-gray-500">Check-in</p><p className="text-white font-medium">{formatDate(booking.check_in_date)}</p></div>
              <div><p className="text-gray-500">Check-out</p><p className="text-white font-medium">{formatDate(booking.check_out_date)}</p></div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/8">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Clock className="w-4 h-4" />
                Expires in {formatCountdown(booking.expires_at)}
              </div>
              <div className="text-xl font-bold text-brand-400">{formatCurrency(booking.total_amount)}</div>
            </div>

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-white/8">
              <BookingTimeline status={booking.status} />
            </div>
          </div>

          {alreadyPaid ? (
            <div className="card text-center py-10">
              <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Payment Submitted</h3>
              <p className="text-gray-400 mb-6">Your payment is under review. You'll be notified once confirmed.</p>
              <button onClick={() => navigate('/my-bookings')} className="btn-primary mx-auto">
                View My Bookings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bank details */}
              <div className="card space-y-4">
                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-400" />
                  Bank Transfer Details
                </h3>

                <div className="glass-brand rounded-xl p-5 space-y-3">
                  {[
                    { label: 'Bank',           value: BANK.name    },
                    { label: 'Account Number', value: BANK.account },
                    { label: 'Account Name',   value: BANK.holder  },
                    { label: 'Amount',         value: formatCurrency(booking.total_amount) },
                    { label: 'Reference',      value: booking.booking_reference },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium font-mono">{value}</span>
                        <button onClick={() => copyRef(value)} className="text-gray-500 hover:text-brand-400 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-500/8 border border-yellow-500/20 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  Use your booking reference as the transfer narration to ensure swift verification.
                </div>
              </div>

              {/* Payment form */}
              <form onSubmit={handleSubmit} className="card space-y-4">
                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-400" />
                  Submit Payment Proof
                </h3>

                <div>
                  <label className="input-label">Transaction Reference *</label>
                  <input
                    className="input font-mono"
                    placeholder="e.g. TRN20260413XXXXXX"
                    value={form.transaction_ref}
                    onChange={e => setForm(f => ({ ...f, transaction_ref: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Sender's Name *</label>
                  <input
                    className="input"
                    placeholder="Name on bank account"
                    value={form.sender_name}
                    onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
                    required
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="input-label">Payment Screenshot *</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                  />

                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-brand-500/30">
                      <img src={proofPreview} alt="Proof preview" className="w-full h-40 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setProofFile(null); setProofPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/15 hover:border-brand-500/50 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-400 hover:text-brand-400 transition-all duration-200"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Click to upload screenshot</span>
                      <span className="text-xs text-gray-600">PNG, JPG up to 5 MB</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitPayment.isPending}
                  className="btn-primary w-full justify-center py-3.5"
                >
                  {submitPayment.isPending ? 'Submitting…' : 'Submit Payment'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
