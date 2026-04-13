// Shared legal page component used for Terms, Privacy, Refund, Booking Conditions, Cookie Policy
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

interface Section { title: string; body: string[]; }

interface LegalPageProps {
  title:       string;
  subtitle:    string;
  updated:     string;
  sections:    Section[];
}

export function LegalPage({ title, subtitle, updated, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: '#f8fffe' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #042e28 0%, #0a4f43 60%, #0d5c4a 100%)' }} className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm mb-6 hover:text-white transition-colors" style={{ color: '#5eeac7' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,188,150,0.2)', border: '1px solid rgba(16,188,150,0.3)' }}>
              <FileText className="w-5 h-5" style={{ color: '#10bc96' }} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#5eeac7' }}>Legal</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>{title}</h1>
          <p style={{ color: '#5eeac7' }} className="text-base">{subtitle}</p>
          <p className="text-xs mt-3" style={{ color: '#5eeac7/60', opacity: 0.6 }}>Last updated: {updated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          {sections.map(({ title: st, body }, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mb-3" style={{ color: '#0a0a1a' }}>{i + 1}. {st}</h2>
              {body.map((para, j) => (
                <p key={j} className="leading-relaxed mb-3 text-sm" style={{ color: '#4b5563' }}>{para}</p>
              ))}
            </div>
          ))}
        </motion.div>

        <div className="mt-16 p-6 rounded-2xl text-center" style={{ background: 'rgba(16,188,150,0.06)', border: '1px solid rgba(16,188,150,0.15)' }}>
          <p className="text-sm mb-4" style={{ color: '#374151' }}>Have questions about our policies?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: '#10bc96' }}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Individual Pages ──────────────────────────────────────────────────────────

export function TermsPage() {
  return <LegalPage
    title="Terms of Service"
    subtitle="Please read these terms carefully before booking."
    updated="April 2026"
    sections={[
      { title: 'Acceptance of Terms', body: ['By accessing or using the Horemow Guest House booking platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.'] },
      { title: 'Booking Policy', body: ['All bookings are subject to room availability. A booking is only confirmed once you receive a confirmation email from Horemow Guest House.', 'Bookings must be paid within 2 hours of creation or they will be automatically cancelled.'] },
      { title: 'Check-in & Check-out', body: ['Standard check-in time is 2:00 PM. Standard check-out time is 12:00 PM (noon). Early check-in and late check-out are subject to availability and may incur additional charges.'] },
      { title: 'Guest Conduct', body: ['Guests are expected to respect the property and other guests. Horemow Guest House reserves the right to request guests to vacate the premises in cases of misconduct without a refund.'] },
      { title: 'Liability', body: ['Horemow Guest House is not liable for loss of personal belongings. Guests are advised to use the in-room safe or request secure storage where available.'] },
      { title: 'Amendments', body: ['We reserve the right to modify these terms at any time. Continued use of our service after changes constitutes acceptance of the new terms.'] },
    ]}
  />;
}

export function PrivacyPage() {
  return <LegalPage
    title="Privacy Policy"
    subtitle="Your privacy is important to us. Here's how we handle your data."
    updated="April 2026"
    sections={[
      { title: 'Information We Collect', body: ['We collect information you provide directly, including your name, email address, phone number, and payment details during booking.'] },
      { title: 'How We Use Your Data', body: ['Your data is used to process bookings, communicate with you about your reservation, and improve our services. We do not sell your data to third parties.'] },
      { title: 'Data Security', body: ['We use industry-standard encryption (SSL/TLS) to protect your data. Payment information is processed securely and not stored on our servers.'] },
      { title: 'Cookies', body: ['Our website uses cookies to enhance your experience. You can control cookie settings through your browser. See our Cookie Policy for details.'] },
      { title: 'Your Rights', body: ['You have the right to access, update, or delete your personal data. Contact us at info@horemow.com to exercise these rights.'] },
      { title: 'Contact', body: ['For privacy-related inquiries, contact our Data Protection Officer at info@horemow.com or call +234 800 HOREMOW.'] },
    ]}
  />;
}

export function RefundPolicyPage() {
  return <LegalPage
    title="Refund Policy"
    subtitle="We aim to make refunds fair and straightforward."
    updated="April 2026"
    sections={[
      { title: 'Cancellation Window', body: ['Guests may cancel their booking free of charge up to 48 hours before the check-in date. Cancellations made within 48 hours are subject to a 50% charge.'] },
      { title: 'No-Show Policy', body: ['If a guest does not check in on the scheduled date and has not notified us, the full booking amount will be forfeited.'] },
      { title: 'Refund Processing', body: ['Approved refunds are processed within 5-7 business days to the original payment method. Bank transfer fees are borne by the guest.'] },
      { title: 'Payment Rejection', body: ['If an uploaded payment proof is rejected by our team, your booking will revert to PENDING_PAYMENT status and you may re-submit a correct proof.'] },
      { title: 'How to Request a Refund', body: ['To request a refund, contact us via the Contact page or email info@horemow.com with your booking reference number.'] },
    ]}
  />;
}

export function BookingConditionsPage() {
  return <LegalPage
    title="Booking Conditions"
    subtitle="Important conditions that apply to all reservations."
    updated="April 2026"
    sections={[
      { title: 'Age Requirement', body: ['The primary guest must be at least 18 years old. Guests under 18 must be accompanied by an adult.'] },
      { title: 'Identification', body: ['A valid government-issued ID (National ID, International Passport, or Driver\'s License) must be presented at check-in.'] },
      { title: 'Payment', body: ['Full payment is required at the time of booking. We accept bank transfers with proof of payment.', 'Bookings expire 2 hours after creation if payment is not received.'] },
      { title: 'Room Changes', body: ['Room type changes are subject to availability and may require a price adjustment. Please contact us at least 24 hours before arrival.'] },
      { title: 'Special Requests', body: ['Special requests (e.g., specific floor, extra bedding) are noted but cannot be guaranteed. We will do our best to accommodate.'] },
      { title: 'Force Majeure', body: ['In cases of force majeure (natural disasters, government restrictions), bookings may be rescheduled or refunded in full at management\'s discretion.'] },
    ]}
  />;
}

export function CookiePolicyPage() {
  return <LegalPage
    title="Cookie Policy"
    subtitle="How we use cookies on the Horemow Guest House website."
    updated="April 2026"
    sections={[
      { title: 'What Are Cookies?', body: ['Cookies are small text files stored on your device when you visit our website. They help us provide a better experience.'] },
      { title: 'Types of Cookies We Use', body: ['Strictly Necessary Cookies: Required for the website to function (e.g., session management, authentication).', 'Analytics Cookies: Help us understand how visitors use our website so we can improve it.', 'Preference Cookies: Remember your settings and preferences for future visits.'] },
      { title: 'Managing Cookies', body: ['You can control or delete cookies through your browser settings. Note that disabling certain cookies may affect site functionality.'] },
      { title: 'Third-Party Cookies', body: ['We use Google Maps which may set its own cookies. These are governed by Google\'s Privacy Policy.'] },
      { title: 'Updates', body: ['We may update this Cookie Policy from time to time. Continued use of our website constitutes acceptance.'] },
    ]}
  />;
}
