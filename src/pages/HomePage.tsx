import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Star, CheckCircle, BedDouble, Shield,
  Clock, Award, Users, ChevronRight, TrendingUp,
  Wifi, Coffee, MapPin, Phone, CalendarCheck,
} from 'lucide-react';

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal]   = useState(0);
  const ref             = useRef<HTMLSpanElement>(null);
  const started         = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const dur = 2000;
      const t0  = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        setVal(Math.round(p * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function TypeWriter({ words }: { words: string[] }) {
  const [txt,      setTxt]      = useState('');
  const [wi,       setWi]       = useState(0);
  const [ci,       setCi]       = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wi];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && ci <= word.length) {
      t = setTimeout(() => { setTxt(word.slice(0, ci)); setCi(c => c + 1); }, 80);
    } else if (!deleting && ci > word.length) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && ci > 0) {
      t = setTimeout(() => { setTxt(word.slice(0, ci - 1)); setCi(c => c - 1); }, 45);
    } else {
      setDeleting(false);
      setWi(i => (i + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [ci, deleting, wi, words]);

  return (
    <span>
      {txt}
      <span className="inline-block w-0.5 h-[1em] bg-[#10bc96] ml-0.5 align-middle animate-pulse" />
    </span>
  );
}

export default function HomePage() {
  const heroRef   = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imgY        = useTransform(scrollY, [0, 500], [0, 60]);

  const missionPoints = [
    'Award-winning hospitality since 2015',
    'Luxury rooms equipped with premium amenities',
    'Transparent, secure online reservations',
    'Round-the-clock concierge & support',
  ];

  const whyItems = [
    { icon: Shield,       title: 'Secure Booking',      desc: 'Bank-grade encrypted payments with instant confirmation emails.' },
    { icon: Clock,        title: '24/7 Concierge',      desc: 'Our team is always on standby to make your stay perfect.' },
    { icon: Award,        title: 'Award Winning',        desc: 'Voted Nigeria\'s best boutique guest house three years running.' },
    { icon: CalendarCheck,title: 'Flexible Check-in',   desc: 'Early check-in and late check-out available on request.' },
  ];

  return (
    <div className="overflow-x-hidden bg-white text-[#1a1a2e]">

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen pt-24 pb-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f8fffe 0%, #f0fdf9 50%, #fefce8 100%)' }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#10bc96 1px,transparent 1px),linear-gradient(90deg,#10bc96 1px,transparent 1px)`,
            backgroundSize: '72px 72px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 min-h-[calc(100vh-6rem)]">

          {/* ── Left copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-1 flex flex-col justify-center z-10"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10bc96]/10 border border-[#10bc96]/30 text-[#079679] text-sm font-semibold w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-[#10bc96] animate-pulse" />
              Now Booking · Lagos, Nigeria
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.08] tracking-tight text-[#0a0a1a] mb-5">
              The Future of<br />
              <span
                className="text-[#10bc96]"
                style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}
              >
                Premium Hospitality
              </span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-xl mb-8">
              Experience world-class comfort at Horemow Guest House — where thoughtfully designed
              rooms, seamless online booking, and impeccable service redefine what a stay should feel like.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#10bc96] text-white font-bold rounded-xl text-base shadow-[0_10px_40px_rgba(16,188,150,0.3)] hover:bg-[#2dd6ae] hover:-translate-y-0.5 transition-all duration-200"
              >
                Explore Rooms
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[#10bc96] text-[#10bc96] font-bold rounded-xl text-base hover:bg-[#10bc96]/8 hover:-translate-y-0.5 transition-all duration-200"
              >
                Book Now
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#10bc96]" />
                Instant confirmation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#10bc96]" />
                Secure payment
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#10bc96]" />
                Free cancellation window
              </span>
            </div>
          </motion.div>

          {/* ── Right image ── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            className="flex-1 relative flex justify-center items-center min-h-[520px] z-10"
          >
            {/* Main image */}
            <motion.div
              style={{ y: imgY }}
              className="relative w-full max-w-[520px]"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(16,188,150,0.15)]">
                <img
                  src="/images/hero-room.jpg"
                  alt="Luxury room at Horemow Guest House"
                  className="w-full h-[440px] object-cover"
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    t.parentElement!.style.background =
                      'linear-gradient(135deg, #0d1a15 0%, #0a4f43 40%, #1c4b36 100%)';
                    t.parentElement!.style.display = 'flex';
                    t.parentElement!.style.alignItems = 'center';
                    t.parentElement!.style.justifyContent = 'center';
                    t.parentElement!.innerHTML = `<div style="text-align:center;color:#10bc96;padding:60px 40px">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px"><path d="M2 22V9l10-7 10 7v13"/><rect x="8" y="15" width="8" height="7"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
                      <p style="font-size:1.1rem;font-weight:600;margin:0">HOREMOW<br/>GUEST HOUSE</p>
                    </div>`;
                  }}
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a4f43]/60 to-transparent" />
              </div>

              {/* Floating card — top right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -top-5 -right-6 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-4 flex items-center gap-3 min-w-[180px]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#10bc96]/10 flex items-center justify-center shrink-0">
                  <BedDouble className="w-6 h-6 text-[#10bc96]" />
                </div>
                <div>
                  <p className="font-bold text-[#0a0a1a] text-sm leading-tight">500+ Stays</p>
                  <p className="text-gray-400 text-xs">Memorable moments</p>
                </div>
              </motion.div>

              {/* Floating card — bottom left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-4 min-w-[200px]"
              >
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-[#f0b429] fill-[#f0b429]" />
                  ))}
                </div>
                <p className="font-bold text-[#0a0a1a] text-sm">5.0 Rating</p>
                <p className="text-gray-400 text-xs">From 320+ verified guests</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Hero bottom stats bar ── */}
        <div className="max-w-7xl mx-auto px-6 pb-0 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BedDouble,    value: '20+',  label: 'Premium Rooms',   color: '#10bc96' },
              { icon: Users,        value: '500+', label: 'Happy Guests',    color: '#f0b429' },
              { icon: Star,         value: '5.0',  label: 'Guest Rating',    color: '#10bc96' },
              { icon: CalendarCheck,value: '98%',  label: 'Satisfaction',    color: '#f0b429' },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.07)] flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-200"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-black text-[#0a0a1a] text-xl leading-tight">{value}</p>
                  <p className="text-gray-400 text-xs font-medium">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OUR MISSION
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[#10bc96] font-semibold text-sm uppercase tracking-widest mb-3">
                Our Purpose
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-[#0a0a1a] leading-tight mb-6">
                Our Mission
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                At Horemow Guest House, we believe every traveller deserves more than just a bed.
                Our mission is to create a sanctuary where luxury, comfort, and authentic hospitality
                converge — giving each guest an experience they will cherish long after checkout.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-10">
                From meticulously designed rooms to a booking process built on transparency,
                we have reimagined what a premium guest house should be in modern Nigeria.
              </p>

              {/* Bullet points */}
              <ul className="space-y-3">
                {missionPoints.map((pt, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="flex items-center gap-3 text-gray-700 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#10bc96]/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10bc96]" />
                    </span>
                    {pt}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(16,188,150,0.1)]">
                <img
                  src="/images/mission-room.jpg"
                  alt="Horemow Guest House interior"
                  className="w-full h-[480px] object-cover"
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    const p = t.parentElement!;
                    p.style.height = '480px';
                    p.style.background = 'linear-gradient(160deg, #f0fdf9 0%, #ccfbee 100%)';
                    p.style.display = 'flex';
                    p.style.alignItems = 'center';
                    p.style.justifyContent = 'center';
                    p.innerHTML = `<div style="text-align:center;color:#10bc96">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M3 11V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/></svg>
                      <p style="font-weight:700;font-size:1rem">Our Premium Rooms</p>
                    </div>`;
                  }}
                />
              </div>
              {/* Accent card overlay */}
              <div className="absolute -bottom-6 -left-6 bg-[#0a4f43] rounded-2xl p-5 text-white shadow-xl">
                <p className="font-black text-3xl mb-1">10+</p>
                <p className="text-[#5eeac7] text-sm font-medium">Years of Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OUR STORY
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#fafbff]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[#10bc96] font-semibold text-sm uppercase tracking-widest mb-2">
              Who We Are
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a0a1a] leading-tight max-w-2xl">
              Our Story
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left large image block */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="rounded-3xl overflow-hidden mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <img
                  src="/images/story-1.jpg"
                  alt="Horemow founding story"
                  className="w-full h-72 object-cover"
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    const p = t.parentElement!;
                    p.style.height = '18rem';
                    p.style.background = 'linear-gradient(135deg, #0d1a15 0%, #0a4f43 100%)';
                    p.style.display = 'flex';
                    p.style.alignItems = 'center';
                    p.style.justifyContent = 'center';
                    p.innerHTML = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10bc96" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
                  }}
                />
              </div>
              <p className="text-gray-500 text-base leading-relaxed">
                Founded in 2015 by hospitality enthusiasts with a vision to fill a gap in Lagos'
                premium short-stay market, Horemow Guest House began with just four rooms and a
                relentless commitment to service.
              </p>
            </motion.div>

            {/* Right: text + image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                In building our guest house, we challenged the notion that premium hospitality
                requires a multinational hotel chain. We proved that with the right team, design,
                and heart — an independent guest house can compete at the highest level.
              </p>
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <img
                  src="/images/story-2.jpg"
                  alt="Horemow modern room design"
                  className="w-full h-64 object-cover"
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    const p = t.parentElement!;
                    p.style.height = '16rem';
                    p.style.background = 'linear-gradient(135deg, #1c4b36 0%, #0d1a15 100%)';
                    p.style.display = 'flex';
                    p.style.alignItems = 'center';
                    p.style.justifyContent = 'center';
                    p.innerHTML = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2dd6ae" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY CHOOSE HOREMOW (dark section)
      ══════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: '#0d1117' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: heading + reasons */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#10bc96] font-semibold text-sm uppercase tracking-widest mb-3">
                  The Horemow Difference
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-12">
                  Why Choose<br />Our Guest House
                </h2>
              </motion.div>

              <div className="space-y-5">
                {whyItems.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-5 rounded-2xl border border-white/6 hover:border-[#10bc96]/30 hover:bg-[#10bc96]/4 transition-all duration-300 group cursor-default"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#10bc96]/10 flex items-center justify-center shrink-0 group-hover:bg-[#10bc96]/20 transition-colors">
                      <Icon className="w-5 h-5 text-[#10bc96]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base mb-1">{title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#10bc96] ml-auto shrink-0 self-center transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: "Trusted Network" card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Big card */}
              <div
                className="rounded-3xl p-8 overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #0a4f43 0%, #1c4b36 50%, #042e28 100%)' }}
              >
                {/* decorative orbs */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#10bc96]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#f0b429]/8 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#10bc96]/20 border border-[#10bc96]/30 flex items-center justify-center mb-6">
                    <TrendingUp className="w-7 h-7 text-[#10bc96]" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3">
                    Trusted by 500+<br />Satisfied Guests
                  </h3>
                  <p className="text-[#5eeac7]/80 text-sm leading-relaxed mb-8">
                    From corporate executives to family travellers, our guests return again and again —
                    testament to our unwavering commitment to delivering the finest hospitality experience in Lagos.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { icon: Wifi,   label: 'High-speed WiFi' },
                      { icon: Coffee, label: 'In-room dining' },
                      { icon: Shield, label: 'CCTV security' },
                      { icon: MapPin, label: 'Prime location' },
                    ].map(({ icon: Icon, label }, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#5eeac7]">
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-1.5 pt-4 border-t border-white/10">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#f0b429] fill-[#f0b429]" />
                    ))}
                    <span className="text-white font-bold ml-2">5.0</span>
                    <span className="text-gray-400 text-sm ml-1">/ 320 reviews</span>
                  </div>
                </div>
              </div>

              {/* image below card */}
              <div className="mt-6 rounded-2xl overflow-hidden h-44 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <img
                  src="/images/why-room.jpg"
                  alt="Horemow premium facilities"
                  className="w-full h-full object-cover"
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                    const p = t.parentElement!;
                    p.style.background = 'linear-gradient(135deg, #131325 0%, #252545 100%)';
                    p.style.display = 'flex';
                    p.style.alignItems = 'center';
                    p.style.justifyContent = 'center';
                    p.innerHTML = `<p style="color:#10bc96;font-weight:600;font-size:0.9rem">Premium Facilities</p>`;
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS COUNTER BAR (dark)
      ══════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#07070e' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { end: 500,  suffix: '+', label: 'Total Guests Served'  },
              { end: 20,   suffix: '+', label: 'Premium Rooms'        },
              { end: 98,   suffix: '%', label: 'Satisfaction Rate'    },
              { end: 10,   suffix: '+', label: 'Years of Excellence'  },
            ].map(({ end, suffix, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="text-5xl md:text-6xl font-black mb-2"
                  style={{ color: i % 2 === 0 ? '#10bc96' : '#f0b429' }}
                >
                  <Counter end={end} suffix={suffix} />
                </div>
                <p className="text-gray-400 text-sm font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA (dark with image)
      ══════════════════════════════════════════════════════ */}
      <section className="py-0 overflow-hidden" style={{ background: '#0d1117' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">

            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center px-8 lg:px-16 py-20"
            >
              <p className="text-[#10bc96] font-semibold text-sm uppercase tracking-widest mb-4">
                Ready to stay?
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                Want to experience<br />
                <span style={{ color: '#f0b429' }}>the future of luxury</span><br />
                guest house stays?
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-md">
                Join hundreds of satisfied guests who have made Horemow their home away from home.
                Your perfect stay is just a few clicks away.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#10bc96] text-white font-bold rounded-xl text-base hover:bg-[#2dd6ae] hover:-translate-y-0.5 shadow-[0_10px_40px_rgba(16,188,150,0.3)] transition-all duration-200"
                >
                  <BedDouble className="w-5 h-5" />
                  Browse Rooms
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-bold rounded-xl text-base hover:bg-white/5 transition-all duration-200"
                >
                  Create Free Account
                </Link>
              </div>
            </motion.div>

            {/* Right image — full height */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden"
              style={{ minHeight: '400px' }}
            >
              <img
                src="/images/cta-room.jpg"
                alt="Book your stay at Horemow"
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = 'none';
                  const p = t.parentElement!;
                  p.style.background = 'linear-gradient(160deg, #0a4f43 0%, #042e28 60%, #07070e 100%)';
                  p.style.display = 'flex';
                  p.style.alignItems = 'center';
                  p.style.justifyContent = 'center';
                  p.innerHTML = `<div style="text-align:center;color:#10bc96;padding:40px">
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px"><path d="M2 22V9l10-7 10 7v13"/><rect x="8" y="15" width="8" height="7"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
                    <p style="font-size:1.25rem;font-weight:800">HOREMOW<br/>GUEST HOUSE</p>
                  </div>`;
                }}
              />
              {/* Dark overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, rgba(13,17,23,0.4) 0%, transparent 50%)' }}
              />
              {/* Floating badge */}
              <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-[#10bc96]" />
                  <span className="text-sm font-semibold">Call to Reserve</span>
                </div>
                <p className="text-[#10bc96] font-black text-lg">+234 800 HOREMOW</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
