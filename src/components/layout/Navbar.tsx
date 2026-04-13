import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, BedDouble, BookOpen, LayoutDashboard,
  LogOut, LogIn, Menu, X, User, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/',        label: 'Home',     icon: Home },
  { to: '/rooms',   label: 'Rooms',    icon: BedDouble },
];

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-900/90 backdrop-blur-xl border-b border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max">
        <nav className="flex items-center justify-between h-20 px-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,188,150,0.4)] group-hover:shadow-[0_0_30px_rgba(16,188,150,0.6)] transition-all duration-300">
                <BedDouble className="w-5 h-5 text-dark-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold-400 animate-pulse-slow" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white block leading-tight">
                HOREMOW
              </span>
              <span className="text-[10px] font-medium text-brand-400 tracking-[0.2em] uppercase">
                Guest House
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}

            {user && (
              <Link
                to="/my-bookings"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/my-bookings'
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                My Bookings
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-gold-400/15 text-gold-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-white/20 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
                    <span className="text-dark-900 font-bold text-xs">
                      {profile?.full_name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-300 max-w-[100px] truncate">
                    {profile?.full_name ?? user.email}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-white/10 p-2 shadow-2xl"
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-white/8 mb-1" />
                    <button
                      onClick={() => { handleSignOut(); setDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg glass hover:border-white/20 transition-all"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/8 bg-dark-900/95 backdrop-blur-xl"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-5 h-5 text-brand-400" />
                {label}
              </Link>
            ))}

            {user && (
              <>
                <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                  <BookOpen className="w-5 h-5 text-brand-400" />
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                    <LayoutDashboard className="w-5 h-5 text-gold-400" />
                    Admin Dashboard
                  </Link>
                )}
                <div className="h-px bg-white/8 my-2" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}

            {!user && (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login"    className="btn-secondary justify-center">Sign In</Link>
                <Link to="/register" className="btn-primary  justify-center">Get Started</Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
