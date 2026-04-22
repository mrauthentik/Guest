import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ArrowLeft,
  CheckCircle, Globe, Heart, Users, Stethoscope, MessageSquare,
} from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

// ── Field style helper ────────────────────────────────────────────────────────
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

// ── Step progress indicator ───────────────────────────────────────────────────
const STEPS = ['Account', 'Personal', 'Residency', 'Health'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done   ? 'bg-[#10bc96] text-white' :
                  active ? 'bg-[#10bc96]/20 border-2 border-[#10bc96] text-[#10bc96]' :
                           'bg-white/5 border border-white/15 text-gray-500'
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-[#10bc96]' : done ? 'text-[#10bc96]/70' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-0.5 mx-1 mb-5 transition-colors duration-300 ${done ? 'bg-[#10bc96]' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Helper: Select field ──────────────────────────────────────────────────────
function SelectField({
  label, value, onChange, options, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="input-label">{label}{required && ' *'}</label>
      <select
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Default form state ────────────────────────────────────────────────────────
interface RegForm {
  // Step 1 — Account
  full_name: string;
  email:     string;
  phone:     string;
  password:  string;
  confirm:   string;
  // Step 2 — Personal
  gender:         string;
  marital_status: string;
  age_bracket:    string;
  nationality:    string;
  // Step 3 — Residency & Stay
  residency_status: string;
  check_in_date:    string;
  check_out_date:   string;
  check_in_time:    string;
  check_out_time:   string;
  // Step 4 — Health & Requests
  health_status:    string;
  health_notes:     string;
  special_requests: string;
}

const INIT: RegForm = {
  full_name: '', email: '', phone: '', password: '', confirm: '',
  gender: '', marital_status: '', age_bracket: '', nationality: '',
  residency_status: '', check_in_date: '', check_out_date: '', check_in_time: '14:00', check_out_time: '11:00',
  health_status: '', health_notes: '', special_requests: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form,     setForm]    = useState<RegForm>(INIT);
  const [step,     setStep]    = useState(0);
  const [showPwd,  setShowPwd] = useState(false);
  const [loading,  setLoading] = useState(false);

  function set<K extends keyof RegForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  // ── Per-step validation ───────────────────────────────────────────────────
  function validateStep(): boolean {
    if (step === 0) {
      if (!form.full_name.trim()) { toast.error('Full name is required.'); return false; }
      if (!form.email.trim())     { toast.error('Email is required.');     return false; }
      if (!form.phone.trim())     { toast.error('Phone is required.');     return false; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return false; }
      if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return false; }
    }
    if (step === 1) {
      if (!form.gender)         { toast.error('Please select a gender.'); return false; }
      if (!form.marital_status) { toast.error('Please select marital status.'); return false; }
      if (!form.age_bracket)    { toast.error('Please select an age bracket.'); return false; }
      if (!form.nationality.trim()) { toast.error('Nationality is required.'); return false; }
    }
    if (step === 2) {
      if (!form.residency_status) { toast.error('Please select your residency status.'); return false; }
    }
    return true;
  }

  function next() { if (validateStep()) setStep(s => s + 1); }
  function prev() { setStep(s => s - 1); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      await authService.signUp({
        full_name: form.full_name,
        email:     form.email,
        phone:     form.phone,
        password:  form.password,
        // extra profile fields stored in raw_user_meta_data → picked up by trigger + profile update
        gender:           form.gender,
        marital_status:   form.marital_status,
        age_bracket:      form.age_bracket,
        nationality:      form.nationality,
        residency_status: form.residency_status,
        health_status:    form.health_status,
        health_notes:     form.health_notes,
        special_requests: form.special_requests,
      } as Parameters<typeof authService.signUp>[0]);
      toast.success('Account created! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      {/* BG orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(16,188,150,0.06)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(240,180,41,0.05)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/10">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img src="/logo.png" alt="Horemow" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span className="font-display font-bold text-white">HOREMOW</span>
              <span className="text-[10px] tracking-[0.2em] uppercase -mt-1" style={{ color: '#10bc96' }}>Guest House</span>
            </Link>
          </div>

          <h1 className="text-2xl font-display font-bold text-white text-center mb-1">Create Account</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Join Horemow — complete all 4 steps to reserve your stay.</p>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">

            {/* ──────────────────────────────────────────────────────────────
                STEP 0 — Account credentials
            ────────────────────────────────────────────────────────────── */}
            {step === 0 && (
              <motion.form
                key="step0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                onSubmit={e => { e.preventDefault(); next(); }}
                className="space-y-4"
              >
                {/* Full Name */}
                <div>
                  <label className="input-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User style={ICON_STYLE} />
                    <input type="text" className="input-icon-left" placeholder="John Doe"
                      value={form.full_name} onChange={set('full_name')} required />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="input-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={ICON_STYLE} />
                    <input type="email" className="input-icon-left" placeholder="you@example.com"
                      value={form.email} onChange={set('email')} required />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="input-label">Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={ICON_STYLE} />
                    <input type="tel" className="input-icon-left" placeholder="+234 800 0000 000"
                      value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="input-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={ICON_STYLE} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="input-icon-both"
                      placeholder="Min. 6 characters"
                      value={form.password} onChange={set('password')} required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {showPwd ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="input-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={ICON_STYLE} />
                    <input type={showPwd ? 'text' : 'password'} className="input-icon-left" placeholder="Repeat password"
                      value={form.confirm} onChange={set('confirm')} required />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base mt-2">
                  Next: Personal Info <ArrowRight className="w-5 h-5" />
                </button>
              </motion.form>
            )}

            {/* ──────────────────────────────────────────────────────────────
                STEP 1 — Personal details
            ────────────────────────────────────────────────────────────── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                onSubmit={e => { e.preventDefault(); next(); }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Gender" value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))}
                    required
                    options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
                  />
                  <SelectField
                    label="Marital Status" value={form.marital_status} onChange={v => setForm(f => ({ ...f, marital_status: v }))}
                    required
                    options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'widowed', label: 'Widowed' }]}
                  />
                </div>

                <SelectField
                  label="Age Bracket" value={form.age_bracket} onChange={v => setForm(f => ({ ...f, age_bracket: v }))}
                  required
                  options={[
                    { value: '18-25', label: '18–25 years' },
                    { value: '26-35', label: '26–35 years' },
                    { value: '36-45', label: '36–45 years' },
                    { value: '46-55', label: '46–55 years' },
                    { value: '56-65', label: '56–65 years' },
                    { value: '65+',   label: '65+ years' },
                  ]}
                />

                <div>
                  <label className="input-label">Nationality *</label>
                  <div style={{ position: 'relative' }}>
                    <Globe style={ICON_STYLE} />
                    <input type="text" className="input-icon-left" placeholder="e.g. Nigerian, British…"
                      value={form.nationality} onChange={set('nationality')} required />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prev} className="btn-ghost flex-1 justify-center">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* ──────────────────────────────────────────────────────────────
                STEP 2 — Residency & stay dates
            ────────────────────────────────────────────────────────────── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                onSubmit={e => { e.preventDefault(); next(); }}
                className="space-y-4"
              >
                {/* Residency — card-style toggle */}
                <div>
                  <label className="input-label mb-2 block">Residency Status *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'foreigner',          label: 'Foreigner',              icon: Globe },
                      { value: 'nigerian_resident',   label: 'Resident in Nigeria',    icon: Users },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, residency_status: value }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          form.residency_status === value
                            ? 'border-[#10bc96] bg-[#10bc96]/10 text-[#10bc96]'
                            : 'border-white/10 bg-white/3 text-gray-400 hover:border-white/25'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-semibold text-center leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Check-in / Check-out */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Preferred Check-in Date</label>
                    <input type="date" className="input" value={form.check_in_date}
                      onChange={set('check_in_date')}
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="input-label">Check-out Date</label>
                    <input type="date" className="input" value={form.check_out_date}
                      onChange={set('check_out_date')}
                      min={form.check_in_date || new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Check-in Time</label>
                    <input type="time" className="input" value={form.check_in_time} onChange={set('check_in_time')} />
                  </div>
                  <div>
                    <label className="input-label">Check-out Time</label>
                    <input type="time" className="input" value={form.check_out_time} onChange={set('check_out_time')} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prev} className="btn-ghost flex-1 justify-center">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* ──────────────────────────────────────────────────────────────
                STEP 3 — Health & Special Requests
            ────────────────────────────────────────────────────────────── */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <SelectField
                  label="Health Status"
                  value={form.health_status}
                  onChange={v => setForm(f => ({ ...f, health_status: v }))}
                  options={[
                    { value: 'excellent',        label: 'Excellent' },
                    { value: 'good',             label: 'Good' },
                    { value: 'fair',             label: 'Fair — minor conditions' },
                    { value: 'with_disability',  label: 'With physical disability' },
                    { value: 'medical_support',  label: 'Requires medical support' },
                  ]}
                />

                <div>
                  <label className="input-label flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-gray-500" />
                    Health Explanation (optional)
                  </label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    placeholder="Describe any health conditions, allergies, or medical needs we should know about…"
                    value={form.health_notes}
                    onChange={set('health_notes')}
                  />
                </div>

                <div>
                  <label className="input-label flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    Special Requests / Requirements (optional)
                  </label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    placeholder="Accessibility needs, dietary requirements, room preferences, special occasion arrangements…"
                    value={form.special_requests}
                    onChange={set('special_requests')}
                  />
                </div>

                {/* Privacy notice */}
                <div className="bg-[#10bc96]/6 border border-[#10bc96]/20 rounded-xl p-3 text-xs text-gray-400 leading-relaxed">
                  Your health and personal information is treated with strict confidentiality and used solely
                  to prepare for your stay. We do not share your data with third parties.
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prev} className="btn-ghost flex-1 justify-center">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 justify-center py-3.5"
                  >
                    {loading ? 'Creating Account…' : 'Create Account'}
                    {!loading && <CheckCircle className="w-5 h-5" />}
                  </button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Sign in link */}
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
