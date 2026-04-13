import { motion } from 'framer-motion';
import {
  BookOpen, CreditCard, BedDouble, Users,
  TrendingUp, Clock, CheckCircle2, XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAllBookings, useAllPayments, useAllRooms } from '@/hooks/useQueries';
import { TableSkeleton } from '@/components/ui/LoadingStates';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5 },
  }),
};

export default function AdminDashboard() {
  const { data: bookings,  isLoading: loadingB } = useAllBookings();
  const { data: payments,  isLoading: loadingP } = useAllPayments();
  const { data: rooms,     isLoading: loadingR } = useAllRooms();

  const totalRevenue    = (bookings ?? []).filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT').reduce((s, b) => s + b.total_amount, 0);
  const pendingPayments = (bookings ?? []).filter(b => b.status === 'PAYMENT_UPLOADED').length;
  const activeBookings  = (bookings ?? []).filter(b => b.status === 'CHECKED_IN').length;
  const totalRooms      = (rooms ?? []).length;
  const activeRooms     = (rooms ?? []).filter(r => r.is_active).length;
  const occupiedRooms   = activeBookings;
  const availableRooms  = activeRooms - occupiedRooms;

  const stats = [
    { label: 'Total Revenue',    value: formatCurrency(totalRevenue), icon: TrendingUp,   color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { label: 'Total Bookings',   value: (bookings ?? []).length,      icon: BookOpen,     color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20'  },
    { label: 'Pending Review',   value: pendingPayments,              icon: AlertCircle,  color: 'text-yellow-400',bg: 'bg-yellow-500/10',border: 'border-yellow-500/20'},
    { label: 'Guests Checked In',value: activeBookings,               icon: Users,        color: 'text-purple-400',bg: 'bg-purple-500/10',border: 'border-purple-500/20'},
    { label: 'Available Rooms',  value: availableRooms,               icon: BedDouble,    color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { label: 'Total Payments',   value: (payments ?? []).length,      icon: CreditCard,   color: 'text-gold-400',  bg: 'bg-gold-400/10',  border: 'border-gold-400/20'  },
  ];

  const recentBookings = [...(bookings ?? [])].slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">Dashboard Overview</h2>
        <p className="text-gray-400 text-sm">Real-time snapshot of bookings and operations.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <div className={`card border ${s.border} flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Room occupancy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="font-semibold text-white mb-4">Room Occupancy</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 bg-dark-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: totalRooms > 0 ? `${(occupiedRooms / totalRooms) * 100}%` : '0%' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full"
            />
          </div>
          <span className="text-sm text-white font-medium">
            {occupiedRooms}/{totalRooms} occupied
          </span>
        </div>
        <div className="flex gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-brand-400">
            <div className="w-2 h-2 rounded-full bg-brand-400" />
            {occupiedRooms} Occupied
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            {availableRooms} Available
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <div className="w-2 h-2 rounded-full bg-gray-700" />
            {totalRooms - activeRooms} Inactive
          </span>
        </div>
      </motion.div>

      {/* Recent bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            View all →
          </Link>
        </div>

        {loadingB ? (
          <TableSkeleton rows={5} />
        ) : recentBookings.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Reference</th>
                  <th className="text-left py-3 pr-4">Guest</th>
                  <th className="text-left py-3 pr-4">Room</th>
                  <th className="text-left py-3 pr-4">Dates</th>
                  <th className="text-left py-3 pr-4">Amount</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-mono text-brand-400 font-medium">{b.booking_reference}</td>
                    <td className="py-3 pr-4 text-gray-300">{b.profile?.full_name ?? '–'}</td>
                    <td className="py-3 pr-4 text-gray-300">{b.room?.name ?? '–'}</td>
                    <td className="py-3 pr-4 text-gray-400">
                      {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                    </td>
                    <td className="py-3 pr-4 text-white font-medium">{formatCurrency(b.total_amount)}</td>
                    <td className="py-3"><BookingStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
