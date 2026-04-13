import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        toast.error(
          'Email not confirmed. Go to Supabase Dashboard → Authentication → Settings and disable "Enable email confirmations".',
          { duration: 8000 }
        );
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        toast.error('Incorrect email or password. Please try again.');
      } else {
        toast.error(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(16,188,150,0.06)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(240,180,41,0.05)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/10">

          <div className="flex justify-center mb-8">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img
                src="/logo.png"
                alt="Horemow Guest House"
                style={{ width: '72px', height: '72px', objectFit: 'contain' }}
              />
              <span className="font-display font-bold text-white">HOREMOW</span>
              <span className="text-[10px] tracking-[0.2em] uppercase -mt-1" style={{ color: '#10bc96' }}>Guest House</span>
            </Link>
          </div>

          <h1 className="text-2xl font-display font-bold text-white text-center mb-1">Welcome Back</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Sign in to manage your reservations.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#6b7280', pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  className="input-icon-left"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#6b7280', pointerEvents: 'none',
                }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-icon-both"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? 'Signing In…' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
