import { motion } from 'framer-motion';
import { BedDouble, Users, Award, Heart, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Pastor Paul Rika', role: 'Founder ',        img: '/images/guest (4).jpg' },
  { name: 'Amaka Nwosu',          role: 'Director of Hospitality', img: '/images/guest (5).jpg' },
  { name: 'Ibrahim Musa',          role: 'Head of Operations',   img: '/images/guest (6).jpg' },
];

const milestones = [
  { year: '2022', event: 'Horemow Guest House founded with 4 rooms in Kwali, Abuja.' },
  { year: '2023', event: 'Expanded to 12 rooms with good hospitality.' },
  { year: '2024', event: 'Added more rooms and facilities.' },
  { year: '2025', event: '500+ guests served. With good accomodation experience.' },
  { year: '2026', event: 'Full digital transformation with real-time booking & payment.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24" style={{ background: '#f8fffe' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #042e28 0%, #0a4f43 50%, #0d5c4a 100%)' }} className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              About <span style={{ background: 'linear-gradient(90deg,#10bc96,#f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Horemow</span>
            </h1>
            <p className="text-[#5eeac7]/80 text-lg max-w-2xl mx-auto">
              A decade of premium hospitality in the heart of Kwali, Abuja — built on love, service, and an unwavering commitment to excellence.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#07090f' }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BedDouble, val: '20+',  label: 'Premium Rooms',  color: '#10bc96' },
              { icon: Users,     val: '500+', label: 'Guests Served',  color: '#f0b429' },
              { icon: Award,     val: '5.0',  label: 'Star Rating',    color: '#10bc96' },
              { icon: Heart,     val: '10+',  label: 'Years of Love',  color: '#f0b429' },
            ].map(({ icon: Icon, val, label, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <p className="font-black text-3xl text-white mb-1">{val}</p>
                <p className="text-sm" style={{ color: '#6b7280' }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-20" style={{ background: '#f8fffe' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#10bc96' }}>Our Journey</p>
              <h2 className="text-4xl font-black mb-6" style={{ color: '#0a0a1a', fontFamily: '"Playfair Display", serif' }}>Built with Heart,<br />Run with Excellence</h2>
              <p className="leading-relaxed mb-4" style={{ color: '#4b5563' }}>
                Horemow Guest House was born from a simple belief: that every traveller attending our conferences or programs deserves a premium experience, regardless of whether they're at a multinational hotel or an independent guest house.
              </p>
              <p className="leading-relaxed mb-6" style={{ color: '#4b5563' }}>
                From our humble beginnings in Kwali, Abuja, we have served many guests and we are proud of our track record.
              </p>
              {['Award-winning hospitality since 2015', 'Voted Best Guest House in Abuja 2023', 'Fully digital booking & secure payments', '24/7 dedicated guest support'].map((pt, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#10bc96' }} />
                  <span className="text-sm" style={{ color: '#374151' }}>{pt}</span>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
                <img src="/images/guest (8).jpg" alt="Horemow Guest House" className="w-full h-[440px] object-cover" />
              </div>
            </motion.div>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-center mb-12" style={{ color: '#0a0a1a', fontFamily: '"Playfair Display", serif' }}>Our Milestones</h2>
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, #10bc96, #f0b429)' }} />
              <div className="space-y-10">
                {milestones.map(({ year, event }, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="inline-block p-5 rounded-2xl shadow-md" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
                        <p className="font-black text-2xl mb-1" style={{ color: '#10bc96' }}>{year}</p>
                        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{event}</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full shrink-0 z-10" style={{ background: 'linear-gradient(135deg, #10bc96, #f0b429)', boxShadow: '0 0 12px rgba(16,188,150,0.4)' }} />
                    <div className="flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#042e28' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Ready to Experience Horemow?</h2>
          <p className="mb-8" style={{ color: '#5eeac7' }}>Browse our premium rooms and book your stay today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/rooms" className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-[#07070e] text-sm"
              style={{ background: 'linear-gradient(135deg, #10bc96, #2dd6ae)', boxShadow: '0 8px 30px rgba(16,188,150,0.35)' }}>
              <BedDouble className="w-5 h-5" /> Browse Rooms
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-white text-sm border border-white/20 hover:bg-white/8 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
