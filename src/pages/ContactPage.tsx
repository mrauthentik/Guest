import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  MapPin, Phone, Mail, Clock, Send,
  CheckCircle2, MessageSquare, User, AtSign,
} from 'lucide-react';
import { contactService } from '@/services/contactService';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'Booking Inquiry',
  'Payment Issue',
  'Complaint About Room',
  'Complaint About Service',
  'Refund Request',
  'General Inquiry',
  'Emergency / Urgent',
  'Other',
];

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    subject: '',
    room_details: '',
    message: '',
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject) { toast.error('Please select a subject.'); return; }
    setLoading(true);
    try {
      await contactService.submitComplaint({
        name:    form.name,
        email:   form.email,
        phone:   form.phone || undefined,
        subject: form.subject,
        message: form.room_details ? `[Room Details: ${form.room_details}]\n\n${form.message}` : form.message,
      });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', room_details: '', message: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const contactInfo = [
    { icon: MapPin, label: 'Address',       value: 'Kwali, Abuja, Nigeria',  color: '#10bc96' },
    { icon: Phone,  label: 'Phone',         value: '+234 800 HOREMOW',       color: '#f0b429' },
    { icon: Mail,   label: 'Email',         value: 'info@horemow.com',       color: '#10bc96' },
    { icon: Clock,  label: 'Reception',     value: '24 / 7 — Always Open',   color: '#f0b429' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-0" style={{ background: '#f8fffe' }}>

      {/* ── HERO STRIP ── */}
      <div
        className="relative py-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #042e28 0%, #0a4f43 50%, #0d5c4a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
              style={{ background: 'rgba(16,188,150,0.15)', border: '1px solid rgba(16,188,150,0.3)', color: '#5eeac7' }}>
              <MessageSquare className="w-4 h-4" />
              We're Here to Help
            </span>
            <h1
              className="text-4xl md:text-6xl font-black text-white mb-4"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Contact &amp; <span style={{
                background: 'linear-gradient(90deg,#10bc96,#f0b429)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Complaints</span>
            </h1>
            <p className="text-[#5eeac7]/75 text-lg max-w-2xl mx-auto">
              Have a concern or complaint? We take every piece of feedback seriously.
              Send us a message and our team will respond within 2 hours.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── CONTACT CARDS ── */}
      <div style={{ background: '#07090f' }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactInfo.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>{label}</p>
                <p className="text-sm font-medium text-white">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM + MAP ── */}
      <div style={{ background: '#f8fffe' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ── Contact Form ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-black mb-2" style={{ color: '#0a0a1a', fontFamily: '"Playfair Display", serif' }}>
                Send Us a Message
              </h2>
              <p className="mb-8" style={{ color: '#6b7280' }}>
                Fill in the form below and our team will get back to you as soon as possible.
              </p>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-16 px-8 rounded-3xl"
                  style={{ background: 'rgba(16,188,150,0.06)', border: '1px solid rgba(16,188,150,0.2)' }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ background: 'rgba(16,188,150,0.15)' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: '#10bc96' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#0a0a1a' }}>Message Sent!</h3>
                  <p style={{ color: '#6b7280' }} className="mb-6 max-w-sm">
                    Thank you for reaching out. Our team will review your message and respond within 2 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-3 rounded-xl font-bold text-white text-sm"
                    style={{ background: '#10bc96' }}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                        Full Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User style={{
                          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                          width: '16px', height: '16px', color: '#10bc96', pointerEvents: 'none',
                        }} />
                        <input
                          type="text"
                          value={form.name}
                          onChange={update('name')}
                          placeholder="John Doe"
                          required
                          style={{
                            width: '100%', paddingTop: '12px', paddingBottom: '12px',
                            paddingLeft: '38px', paddingRight: '16px',
                            borderRadius: '12px', fontSize: '14px', outline: 'none',
                            background: 'white', border: '1px solid #e5e7eb', color: '#1a1a2e',
                            fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#10bc96'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,188,150,0.12)'; }}
                          onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb';  e.currentTarget.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                        Email Address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <AtSign style={{
                          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                          width: '16px', height: '16px', color: '#10bc96', pointerEvents: 'none',
                        }} />
                        <input
                          type="email"
                          value={form.email}
                          onChange={update('email')}
                          placeholder="you@example.com"
                          required
                          style={{
                            width: '100%', paddingTop: '12px', paddingBottom: '12px',
                            paddingLeft: '38px', paddingRight: '16px',
                            borderRadius: '12px', fontSize: '14px', outline: 'none',
                            background: 'white', border: '1px solid #e5e7eb', color: '#1a1a2e',
                            fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#10bc96'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,188,150,0.12)'; }}
                          onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb';  e.currentTarget.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Phone Number <span style={{ color: '#9ca3af' }}>(optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={{
                        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                        width: '16px', height: '16px', color: '#10bc96', pointerEvents: 'none',
                      }} />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        placeholder="+234 800 000 0000"
                        style={{
                          width: '100%', paddingTop: '12px', paddingBottom: '12px',
                          paddingLeft: '38px', paddingRight: '16px',
                          borderRadius: '12px', fontSize: '14px', outline: 'none',
                          background: 'white', border: '1px solid #e5e7eb', color: '#1a1a2e',
                          fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#10bc96'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,188,150,0.12)'; }}
                        onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb';  e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Subject *
                    </label>
                    <select
                      value={form.subject}
                      onChange={update('subject')}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
                      style={{ background: 'white', border: '1px solid #e5e7eb', color: form.subject ? '#1a1a2e' : '#9ca3af' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#10bc96'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,188,150,0.12)'; }}
                      onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <option value="" disabled>Select a subject…</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Room Details (Conditional) */}
                  {['Complaint About Room', 'Booking Inquiry'].includes(form.subject) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                        Room Details *
                      </label>
                      <input
                        type="text"
                        value={form.room_details}
                        onChange={update('room_details')}
                        placeholder="e.g. Room Number 4A or Room Name"
                        required
                        style={{
                          width: '100%', paddingTop: '12px', paddingBottom: '12px',
                          paddingLeft: '16px', paddingRight: '16px',
                          borderRadius: '12px', fontSize: '14px', outline: 'none',
                          background: 'white', border: '1px solid #e5e7eb', color: '#1a1a2e',
                          fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#10bc96'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,188,150,0.12)'; }}
                        onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb';  e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    </motion.div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Your Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={update('message')}
                      placeholder="Please describe your concern or complaint in detail…"
                      rows={5}
                      required
                      minLength={20}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                      style={{ background: 'white', border: '1px solid #e5e7eb', color: '#1a1a2e' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#10bc96'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,188,150,0.12)'; }}
                      onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-base transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #10bc96, #079679)', boxShadow: '0 8px 30px rgba(16,188,150,0.3)' }}
                  >
                    {loading ? 'Sending…' : (<><Send className="w-5 h-5" /> Send Message</>)}
                  </button>
                </form>
              )}
            </motion.div>

            {/* ── Map ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-3xl font-black mb-2" style={{ color: '#0a0a1a', fontFamily: '"Playfair Display", serif' }}>
                  Find Us Here
                </h2>
                <p style={{ color: '#6b7280' }}>
                  Holiness Camp Ground, Kwali, Abuja, Nigeria.
                </p>
              </div>

              {/* Google Maps embed */}
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex-1 min-h-[420px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4101.680289894372!2d7.058128710712214!3d8.829093292049345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e8a458c737ff9%3A0x8547b10178d75a9c!2sHoliness%20Camp%20Ground%2C%20Kwali%20Abuja!5e1!3m2!1sen!2sng!4v1776097995948!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '420px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Horemow Guest House Location"
                />
              </div>

              {/* Quick info card */}
              <div
                className="rounded-2xl p-5"
                style={{ background: '#042e28', border: '1px solid rgba(16,188,150,0.2)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5eeac7' }}>
                  Response Time
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Messages',  val: '&lt; 2h' },
                    { label: 'Calls',     val: 'Instant' },
                    { label: 'Emails',    val: '&lt; 4h'  },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-white font-black text-lg" dangerouslySetInnerHTML={{ __html: val }} />
                      <p className="text-xs" style={{ color: '#5eeac7' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
