import { motion } from 'framer-motion';
import type { BookingStatus, PaymentStatus } from '@/types';
import {
  Clock, CreditCard, CheckCircle2,
  LogIn, LogOut, XCircle, AlertCircle,
} from 'lucide-react';

const bookingConfig: Record<BookingStatus, { label: string; icon: typeof Clock; color: string; bg: string; border: string }> = {
  PENDING_PAYMENT: {
    label:  'Pending Payment',
    icon:   Clock,
    color:  'text-yellow-400',
    bg:     'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  PAYMENT_UPLOADED: {
    label:  'Payment Uploaded',
    icon:   CreditCard,
    color:  'text-blue-400',
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  CONFIRMED: {
    label:  'Confirmed',
    icon:   CheckCircle2,
    color:  'text-brand-400',
    bg:     'bg-brand-500/10',
    border: 'border-brand-500/30',
  },
  CHECKED_IN: {
    label:  'Checked In',
    icon:   LogIn,
    color:  'text-purple-400',
    bg:     'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  CHECKED_OUT: {
    label:  'Checked Out',
    icon:   LogOut,
    color:  'text-gray-400',
    bg:     'bg-gray-500/10',
    border: 'border-gray-500/30',
  },
  CANCELLED: {
    label:  'Cancelled',
    icon:   XCircle,
    color:  'text-red-400',
    bg:     'bg-red-500/10',
    border: 'border-red-500/30',
  },
};

const paymentConfig: Record<PaymentStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: 'Pending',  color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  verified: { label: 'Verified', color: 'text-brand-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/30' },
  rejected: { label: 'Rejected', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = bookingConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = paymentConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <AlertCircle className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ── Status Timeline ───────────────────────────────────────────────────────────

const steps: { status: BookingStatus; label: string; icon: typeof Clock }[] = [
  { status: 'PENDING_PAYMENT',  label: 'Booked',    icon: Clock        },
  { status: 'PAYMENT_UPLOADED', label: 'Paid',      icon: CreditCard   },
  { status: 'CONFIRMED',        label: 'Confirmed', icon: CheckCircle2 },
  { status: 'CHECKED_IN',       label: 'Check-in',  icon: LogIn        },
  { status: 'CHECKED_OUT',      label: 'Check-out', icon: LogOut       },
];

const ORDER: BookingStatus[] = [
  'PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT',
];

export function BookingTimeline({ status }: { status: BookingStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <XCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Booking Cancelled</span>
      </div>
    );
  }

  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const completed = idx <= currentIdx;
        const active    = idx === currentIdx;
        const Icon      = step.icon;

        return (
          <div key={step.status} className="flex items-center gap-2 shrink-0">
            <motion.div
              initial={false}
              animate={completed ? { scale: [1, 1.15, 1] } : {}}
              className={`flex flex-col items-center gap-1 cursor-default`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                completed
                  ? active
                    ? 'bg-brand-500 border-brand-400 shadow-[0_0_15px_rgba(16,188,150,0.5)]'
                    : 'bg-brand-700 border-brand-600'
                  : 'bg-dark-700 border-white/10'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${completed ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${completed ? 'text-brand-400' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </motion.div>

            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded-full transition-all duration-500 mb-4 ${idx < currentIdx ? 'bg-brand-600' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
