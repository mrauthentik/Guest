import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, BedDouble, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

const ICON_STYLE = {
  position: 'absolute' as const,
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '16px',
  height: '16px',
  color: '#6b7280',
  pointerEvents: 'none' as const,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email:     '',
    phone:     '',
    password:  '',
    confirm:   '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await authService.signUp({
        full_name: form.full_name,
        email:     form.email,
        phone:     form.phone,
        password:  form.password,
      });
      toast.success('Account created! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  const textFields = [
    { key: 'full_name' as const, label: 'Full Name',    type: 'text',  Icon: User,  placeholder: 'John Doe' },
    { key: 'email'     as const, label: 'Email Address', type: 'email', Icon: Mail,  placeholder: 'you@example.com' },
    { key: 'phone'     as const, label: 'Phone Number',  type: 'tel',   Icon: Phone, placeholder: '+234 800 0000 000' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(16,188,150,0.06)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(240,180,41,0.05)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/10">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,188,150,0.3)]"
                style={{ background: 'linear-gradient(135deg, #10bc96, #f0b429)' }}>
                <BedDouble className="w-7 h-7" style={{ color: '#08080f' }} />
              </div>
              <span className="font-display font-bold text-white">HOREMOW</span>
              <span className="text-[10px] tracking-[0.2em] uppercase -mt-1" style={{ color: '#10bc96' }}>Guest House</span>
            </Link>
          </div>

          <h1 className="text-2xl font-display font-bold text-white text-center mb-1">Create Account</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Join Horemow and start booking premium rooms.</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Text fields */}
            {textFields.map(({ key, label, type, Icon, placeholder }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon style={ICON_STYLE} />
                  <input
                    type={type}
                    className="input-icon-left"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={update(key)}
                    required
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={ICON_STYLE} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-icon-both"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={6}
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
                  {showPwd
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye    style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={ICON_STYLE} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-icon-left"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={update('confirm')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
