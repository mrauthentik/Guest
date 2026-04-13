import { Link } from 'react-router-dom';
import { BedDouble, Mail, Phone, MapPin, Globe, Share2, Link2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#07070e' }} className="border-t border-white/6">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10bc96] to-[#f0b429] flex items-center justify-center shadow-[0_0_20px_rgba(16,188,150,0.4)]">
                <BedDouble className="w-5 h-5 text-[#07070e]" />
              </div>
              <div>
                <span className="font-black text-lg text-white block leading-tight tracking-tight">HOREMOW</span>
                <span className="text-[10px] font-semibold text-[#10bc96] tracking-[0.2em] uppercase">Guest House</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Experience unparalleled luxury and comfort at Horemow Guest House.
              Your premium home away from home — where every stay is a masterpiece.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Globe, Share2, Link2].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#10bc96] hover:border-[#10bc96]/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {[
                { to: '/',            label: 'Home'        },
                { to: '/rooms',       label: 'Our Rooms'   },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/login',       label: 'Sign In'     },
                { to: '/register',    label: 'Register'    },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-[#10bc96] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: 'Kwali Abuja, Nigeria' },
                { icon: Phone,  text: '+234 800 HOREMOW'                   },
                { icon: Mail,   text: 'info@horemow.com'                   },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-gray-400">
                  <Icon className="w-4 h-4 text-[#10bc96] mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Horemow Guest House. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10bc96] animate-pulse" />
            
          </div>
        </div>
      </div>
    </footer>
  );
}
