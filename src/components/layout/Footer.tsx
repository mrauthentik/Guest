import { Link } from 'react-router-dom';
import { BedDouble, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-dark-900/80 backdrop-blur-xl mt-auto">
      <div className="container-max px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-dark-900" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white block">HOREMOW</span>
                <span className="text-[10px] font-medium text-brand-400 tracking-[0.2em] uppercase">Guest House</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Experience unparalleled luxury and comfort at Horemow Guest House. 
              Your premium home away from home, where every stay is a masterpiece.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/',            label: 'Home' },
                { to: '/rooms',       label: 'Our Rooms' },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/login',       label: 'Sign In' },
                { to: '/register',    label: 'Register' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-brand-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: '15 Victoria Island, Lagos, Nigeria' },
                { icon: Phone,  text: '+234 800 HOREMOW' },
                { icon: Mail,   text: 'info@horemow.com' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-gray-400">
                  <Icon className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Horemow Guest House. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs text-gray-500">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
