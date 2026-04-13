import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, BedDouble, Users, Wifi, Wind, Tv, Coffee,
  ArrowRight, ChevronDown, Shield, Clock, Award,
} from 'lucide-react';

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words: string[], speed = 80, pause = 2000) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx,   setWordIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(0);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= word.length) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx));
        setCharIdx(c => c + 1);
      }, speed);
    } else if (!deleting && charIdx > word.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setWordIdx(i => (i + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
}

// ── Counter animation ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = Date.now();
      const dur   = 1800;
      const tick  = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        setCount(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} className="counter">{count}{suffix}</span>;
}

// ── Room Amenity Icons ────────────────────────────────────────────────────────
const amenityIcons: Record<string, typeof Wifi> = {
  'WiFi': Wifi, 'AC': Wind, 'TV': Tv, 'Coffee': Coffee,
};

export default function HomePage() {
  const heroRef    = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY      = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const typeword   = useTypewriter(['Luxury Comfort', 'Premium Experience', 'Timeless Elegance', 'Royal Retreat']);

  const stats = [
    { value: 500,  suffix: '+', label: 'Happy Guests'   },
    { value: 20,   suffix: '+', label: 'Premium Rooms'  },
    { value: 98,   suffix: '%', label: 'Satisfaction'   },
    { value: 5,    suffix: '★', label: 'Star Rating'    },
  ];

  const features = [
    { icon: Shield, title: 'Secure Bookings',    desc: 'End-to-end encrypted bookings and payments with instant confirmation.' },
    { icon: Clock,  title: '24/7 Concierge',     desc: 'Round-the-clock support to ensure your stay is absolutely perfect.' },
    { icon: Award,  title: 'Award Winning',       desc: 'Recognized as Nigeria\'s premier guest house for three consecutive years.' },
    { icon: Star,   title: 'Premium Amenities',  desc: 'Every room stocked with luxury amenities for the ultimate comfort experience.' },
  ];

  const testimonials = [
    { name: 'Amaka Osei', role: 'Business Executive', text: 'Horemow redefined what I expect from a guest house. Absolutely stunning!', stars: 5 },
    { name: 'Chidi Nwosu', role: 'Frequent Traveller', text: 'The rooms are immaculate and the service is world-class. Highly recommended.', stars: 5 },
    { name: 'Fatima Al-Rashid', role: 'Event Planner', text: 'Perfect venue for corporate guests. The amenities are spectacular.', stars: 5 },
  ];

  return (
    <div className="overflow-hidden">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax BG */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800" />
          {/* Decorative orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-400/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/4 rounded-full blur-3xl" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(16,188,150,0.8) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(16,188,150,0.8) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-brand text-brand-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            Now Accepting Reservations · Lagos, Nigeria
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-4 leading-[1.05] tracking-tight"
          >
            Where Every Stay
            <br />
            <span className="gradient-text">Becomes </span>
            <span className="text-white relative">
              {typeword}
              <span className="inline-block w-[3px] h-[0.85em] bg-brand-400 ml-1 align-middle animate-pulse" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Experience unrivalled luxury at Horemow Guest House — where premium rooms,
            impeccable service, and timeless elegance converge.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/rooms" className="btn-primary px-8 py-4 text-base group">
              Explore Rooms
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-4 text-base">
              Book Now
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-10 border-y border-white/8 bg-dark-800/40 backdrop-blur-sm">
        <div className="container-max px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-display font-black gradient-text mb-1">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-gray-400 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="container-max px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="divider mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Why Choose <span className="gradient-text">Horemow</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We set the standard for premium guest house experiences in Nigeria.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="card group cursor-default h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section bg-dark-800/30">
        <div className="container-max px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="divider mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Guest <span className="gradient-text">Stories</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="card h-full flex flex-col gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center">
                      <span className="font-bold text-dark-900 text-sm">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="section">
        <div className="container-max px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/50 via-dark-800 to-dark-900 rounded-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,188,150,0.12),transparent_70%)]" />
            <div className="absolute top-0 left-0 w-full h-full border border-brand-500/10 rounded-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
                <BedDouble className="w-4 h-4" />
                Limited Rooms Available
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4">
                Ready for Your <span className="gradient-text">Dream Stay?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                Book your room today and experience the Horemow difference.
                Unforgettable memories await you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/rooms" className="btn-gold px-10 py-4 text-base">
                  <BedDouble className="w-5 h-5" />
                  Browse Rooms
                </Link>
                <Link to="/register" className="btn-secondary px-10 py-4 text-base">
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
