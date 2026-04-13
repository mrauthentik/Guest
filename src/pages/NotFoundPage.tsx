import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BedDouble, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/4 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-400/4 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[120px] md:text-[180px] font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-500/30 to-gold-400/20 leading-none mb-4 select-none"
        >
          404
        </motion.div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-gold-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,188,150,0.3)]">
          <BedDouble className="w-8 h-8 text-dark-900" />
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 max-w-sm mx-auto mb-10">
          The room you're looking for seems to have checked out. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/rooms" className="btn-secondary">
            <Search className="w-4 h-4" />
            Browse Rooms
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
