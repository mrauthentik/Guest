import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Star, Quote, MessageCircle, ThumbsUp, Send, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Testimonial } from '@/types';
import { CardSkeleton } from '@/components/ui/LoadingStates';
import toast from 'react-hot-toast';

// ── Fetch testimonials ─────────────────────────────────────────────────────────
async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

// ── Star rating picker ────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < (hover || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${filled ? 'text-[#f0b429] fill-[#f0b429]' : 'text-gray-600'}`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ── Single testimonial card ───────────────────────────────────────────────────
function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="glass rounded-2xl p-6 border border-white/8 hover:border-brand-500/25 transition-all duration-300 flex flex-col gap-4"
    >
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-[#10bc96]/40 shrink-0" />

      {/* Rating */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < t.rating ? 'text-[#f0b429] fill-[#f0b429]' : 'text-gray-700'}`}
          />
        ))}
      </div>

      {/* Message */}
      <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.message}"</p>

      {/* Guest footer */}
      <div className="flex items-center gap-3 pt-3 border-t border-white/8">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10bc96] to-[#f0b429] flex items-center justify-center shrink-0">
          <span className="text-black font-black text-sm">
            {t.guest_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{t.guest_name}</p>
          <p className="text-gray-500 text-xs">
            {new Date(t.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────────
function SubmitForm({ onSuccess }: { onSuccess: () => void }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState(profile?.full_name ?? '');

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('testimonials').insert([{
        user_id:    user?.id ?? null,
        guest_name: guestName.trim() || 'Anonymous Guest',
        rating,
        message:    message.trim(),
        is_visible: true,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Thank you! Your review has been submitted.');
      setMessage('');
      setRating(5);
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { toast.error('Please write a message.'); return; }
    if (rating < 1)      { toast.error('Please select a rating.'); return; }
    submit.mutate();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 border border-[#10bc96]/20"
    >
      <h3 className="text-lg font-display font-bold text-white mb-1 flex items-center gap-2">
        <ThumbsUp className="w-5 h-5 text-[#10bc96]" />
        Share Your Experience
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Stayed with us? We'd love to hear from you.
        {!user && <span className="text-[#10bc96]"> (Sign in to link your stay)</span>}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-500" />
            Your Name
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Amara O."
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
          />
        </div>

        <div>
          <label className="input-label">Your Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div>
          <label className="input-label">Your Review *</label>
          <textarea
            rows={4}
            className="input resize-none"
            placeholder="Tell future guests what made your stay special…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submit.isPending}
          className="btn-primary w-full justify-center"
        >
          {submit.isPending ? 'Submitting…' : 'Submit Review'}
          {!submit.isPending && <Send className="w-4 h-4" />}
        </button>
      </form>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function TestimoniesPage() {
  const qc = useQueryClient();
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn:  fetchTestimonials,
    staleTime: 2 * 60 * 1000,
  });

  // Overall average rating
  const avgRating = testimonials && testimonials.length > 0
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container-max px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="divider mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4">
            Guest <span className="gradient-text">Testimonies</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-6">
            Real experiences from real guests. See why Horemow is the gold standard for
            campground hospitality in Kwali, Abuja.
          </p>

          {/* Overall rating pill */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-[#f0b429]/20">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#f0b429] fill-[#f0b429]" />
              ))}
            </div>
            <span className="text-white font-black text-xl">{avgRating}</span>
            <span className="text-gray-400 text-sm">
              · {testimonials?.length ?? 0} reviews
            </span>
          </div>
        </motion.div>

        {/* Two-column layout: reviews grid + submit form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Reviews grid — takes 2 columns */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : !testimonials || testimonials.length === 0 ? (
              <div className="text-center py-20">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
                <p className="text-gray-400">Be the first to share your experience!</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="columns-1 sm:columns-2 gap-5 space-y-5">
                  {testimonials.map((t, i) => (
                    <div key={t.id} className="break-inside-avoid">
                      <TestimonialCard t={t} index={i} />
                    </div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Submit form — sticks to right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <SubmitForm onSuccess={() => qc.invalidateQueries({ queryKey: ['testimonials'] })} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
