import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BedDouble, Mail, Phone, MapPin,
  ArrowRight, Globe, Share2, Link2,
  Star,
} from 'lucide-react';

// ── column data ──────────────────────────────────────────────────────────────
const ROOMS = [
  { to: '/rooms', label: 'Executive Suite'     },
  { to: '/rooms', label: 'Presidential Suite'  },
  { to: '/rooms', label: 'Deluxe Double Room'  },
  { to: '/rooms', label: 'Honeymoon Suite'     },
  { to: '/rooms', label: 'Family Suite'        },
  { to: '/rooms', label: 'Standard Room'       },
];

const LEGAL = [
  { to: '/terms',              label: 'Terms of Service'   },
  { to: '/privacy',            label: 'Privacy Policy'     },
  { to: '/refund-policy',      label: 'Refund Policy'      },
  { to: '/booking-conditions', label: 'Booking Conditions' },
  { to: '/cookie-policy',      label: 'Cookie Policy'      },
];

const COMPANY = [
  { to: '/about',       label: 'About Us'        },
  { to: '/rooms',       label: 'Our Rooms'        },
  { to: '/contact',     label: 'Contact Us'       },
  { to: '/my-bookings', label: 'My Bookings'      },
  { to: '/register',    label: 'Create Account'   },
  { to: '/login',       label: 'Sign In'          },
];

const SOCIAL = [Globe, Share2, Link2];

export default function Footer() {
  return (
    <footer style={{ background: '#060810' }}>

      {/* ── TOP CTA BAND ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #042e28 0%, #0a4f43 40%, #0d5c4a 70%, #063325 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),
                              linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,188,150,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(240,180,41,0.07) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-[#5eeac7] text-sm font-semibold uppercase tracking-widest mb-3">
                  Premium Stays · Kwali, Abuja
                </p>
                <h2
                  className="text-4xl md:text-5xl font-black text-white leading-tight mb-5"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  Experience Luxury<br />
                  <span style={{
                    background: 'linear-gradient(90deg, #10bc96, #f0b429)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    Like Never Before
                  </span>
                </h2>
                <p className="text-[#5eeac7]/70 text-base leading-relaxed max-w-lg mb-8 mx-auto lg:mx-0">
                  Whether it's business or leisure, Horemow Guest House offers a sanctuary where premium
                  comfort meets authentic Nigerian hospitality. Book your room today.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link
                    to="/rooms"
                    className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-xl text-[#07070e] text-sm transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #10bc96, #2dd6ae)',
                      boxShadow: '0 8px 30px rgba(16,188,150,0.35)',
                    }}
                  >
                    Book Your Stay
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/rooms"
                    className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-xl text-white text-sm border border-white/20 hover:bg-white/8 transition-all"
                  >
                    View All Rooms
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right room image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="shrink-0 w-full max-w-sm lg:max-w-[380px]"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <img
                  src="/images/cta-room.jpg"
                  alt="Horemow Guest House room"
                  className="w-full h-56 object-cover"
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    const p = t.parentElement!;
                    p.style.height = '224px';
                    p.style.background = 'linear-gradient(160deg, #0a4f43 0%, #042e28 100%)';
                    p.style.display = 'flex'; p.style.alignItems = 'center'; p.style.justifyContent = 'center';
                    p.innerHTML = `<div style="text-align:center;color:#10bc96"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 10px"><path d="M2 22V9l10-7 10 7v13"/><rect x="8" y="15" width="8" height="7"/></svg><p style="font-weight:700;font-size:0.9rem">HOREMOW<br/>Premium Rooms</p></div>`;
                  }}
                />
                {/* Rating overlay */}
                <div
                  className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(to top, rgba(4,46,40,0.95), transparent)' }}
                >
                  <div>
                    <p className="text-white font-bold text-sm">Horemow Guest House</p>
                    <p className="text-[#5eeac7] text-xs">Kwali, Abuja · Nigeria</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#f0b429] text-[#f0b429]" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── MAIN LINKS SECTION ─────────────────────────────────────────── */}
      <div
        className="border-y"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#07090f' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10">

            {/* Rooms */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
                Our Rooms
              </h4>
              <ul className="space-y-2.5">
                {ROOMS.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#6b7280' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#10bc96')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {LEGAL.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#6b7280' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#10bc96')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
                Company
              </h4>
              <ul className="space-y-2.5">
                {COMPANY.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#6b7280' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#10bc96')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Social */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
                Contact
              </h4>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: MapPin, text: 'Kwali, Abuja, Nigeria' },
                  { icon: Phone,  text: '+234 800 HOREMOW'      },
                  { icon: Mail,   text: 'info@horemow.com'      },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm" style={{ color: '#6b7280' }}>
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#10bc96' }} />
                    {text}
                  </li>
                ))}
              </ul>

              {/* Social icons */}
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3">
                Follow Us
              </h4>
              <div className="flex items-center gap-2">
                {SOCIAL.map((Icon, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#10bc96';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,188,150,0.4)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(16,188,150,0.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = '#6b7280';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ────────────────────────────────────────────────── */}
      <div style={{ background: '#060810' }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10bc96, #f0b429)' }}
              >
                <BedDouble className="w-4 h-4" style={{ color: '#07070e' }} />
              </div>
              <div>
                <span className="font-black text-sm text-white block leading-tight">HOREMOW</span>
                <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: '#10bc96' }}>
                  Guest House
                </span>
              </div>
            </Link>

            {/* Copyright */}
            <p className="text-xs order-last sm:order-none" style={{ color: '#4b5563' }}>
              © {new Date().getFullYear()} Horemow Guest House. All rights reserved.
            </p>

            {/* "Rating" badge — Trustpilot-style */}
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#f0b429] text-[#f0b429]" />
                  ))}
                </div>
                <p className="text-[10px] leading-none" style={{ color: '#6b7280' }}>Trusted by 500+ guests</p>
              </div>
              <div
                className="h-8 w-px"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
              <div className="text-center">
                <p className="text-white font-black text-sm leading-tight">5.0</p>
                <p className="text-[10px] leading-none" style={{ color: '#10bc96' }}>Rating</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
}
