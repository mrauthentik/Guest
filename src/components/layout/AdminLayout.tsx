import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CreditCard, BedDouble,
  LogOut, ChevronRight, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/admin',          label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { to: '/admin/bookings', label: 'Bookings',    icon: BookOpen },
  { to: '/admin/payments', label: 'Payments',    icon: CreditCard },
  { to: '/admin/rooms',    label: 'Rooms',       icon: BedDouble },
];

interface Props { children: React.ReactNode }

export default function AdminLayout({ children }: Props) {
  const { profile, isAdmin, signOut } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const Sidebar = () => (
    <aside className="w-64 h-full flex flex-col glass border-r border-white/8">
      {/* Logo */}
      <div className="p-6 border-b border-white/8">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
            <BedDouble className="w-4.5 h-4.5 text-dark-900" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">HOREMOW</p>
            <p className="text-[9px] text-gold-400 tracking-widest uppercase">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile footer */}
      <div className="p-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl glass mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0">
            <span className="font-bold text-dark-900 text-xs">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-[10px] text-gold-400 uppercase tracking-wider">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access this area.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="glass border-b border-white/8 px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg glass hover:border-white/20"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white">
                {navItems.find(n => n.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.to))?.label ?? 'Admin'}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Horemow Guest House Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs text-gray-400 hidden sm:inline">Live</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
