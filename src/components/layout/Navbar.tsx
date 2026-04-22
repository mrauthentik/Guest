import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, BedDouble, BookOpen, LayoutDashboard,
  LogOut, LogIn, Menu, X, ChevronDown,
  Users2, MessageSquare, Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/',            label: 'Home',        icon: Home          },
  { to: '/rooms',       label: 'Rooms',       icon: BedDouble     },
  { to: '/testimonies', label: 'Testimonies', icon: Star          },
  { to: '/about',       label: 'About',       icon: Users2        },
  { to: '/contact',     label: 'Contact',     icon: MessageSquare },
];

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open,         setOpen]    = useState(false);
  const [scrolled,     setScrolled] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);

  // Is this the homepage (light hero behind us)?
  const isHome = location.pathname === '/';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setOpen(false); setDropdown(false); }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  // Style logic: on homepage and not scrolled → white bg with dark text
  //              scrolled or not homepage     → dark bg with white text
  const lightMode  = isHome && !scrolled;
  const textColor  = lightMode ? '#1a1a2e'     : 'white';
  const mutedColor = lightMode ? '#6b7280'     : '#9ca3af';
  const hoverBg    = lightMode ? 'rgba(16,188,150,0.08)' : 'rgba(255,255,255,0.05)';
  const borderColor = lightMode ? 'rgba(16,188,150,0.2)' : 'rgba(255,255,255,0.08)';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: lightMode
          ? 'rgba(248,255,254,0.85)'
          : 'rgba(8,8,15,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${borderColor}`,
        transition: 'background 0.4s ease, border-color 0.4s ease',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <nav className="flex items-center justify-between h-[72px] px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Horemow Guest House"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <div>
              <span
                className="font-black text-base block leading-tight tracking-tight"
                style={{ color: textColor }}
              >
                HOREMOW
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#10bc96' }}>
                Guest House
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    color: active ? '#10bc96' : mutedColor,
                    background: active ? 'rgba(16,188,150,0.08)' : 'transparent',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {label}
                </Link>
              );
            })}

            {user && (
              <Link
                to="/my-bookings"
                style={{
                  color: location.pathname === '/my-bookings' ? '#10bc96' : mutedColor,
                  background: location.pathname === '/my-bookings' ? 'rgba(16,188,150,0.08)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  My Bookings
                </span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  color: location.pathname.startsWith('/admin') ? '#f0b429' : mutedColor,
                  background: location.pathname.startsWith('/admin') ? 'rgba(240,180,41,0.10)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </span>
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                  style={{ background: 'rgba(16,188,150,0.08)', border: '1px solid rgba(16,188,150,0.2)' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10bc96, #f0b429)' }}
                  >
                    <span className="text-[#07070e] font-black text-xs">
                      {profile?.full_name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium max-w-[90px] truncate" style={{ color: textColor }}>
                    {profile?.full_name?.split(' ')[0] ?? 'Account'}
                  </span>
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ color: mutedColor, transform: dropdownOpen ? 'rotate(180deg)' : '' }}
                  />
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl p-2 shadow-2xl"
                    style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>
                    <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
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
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: mutedColor }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = textColor; (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = mutedColor; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: '#10bc96',
                    boxShadow: '0 4px 20px rgba(16,188,150,0.35)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2dd6ae'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#10bc96'; }}
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg transition-all"
            style={{ color: textColor, background: hoverBg }}
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
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#08080f' }}
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-5 h-5 text-[#10bc96]" />
                {label}
              </Link>
            ))}

            {user && (
              <>
                <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                  <BookOpen className="w-5 h-5 text-[#10bc96]" />
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                    <LayoutDashboard className="w-5 h-5 text-[#f0b429]" />
                    Admin Dashboard
                  </Link>
                )}
                <div className="h-px my-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
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
