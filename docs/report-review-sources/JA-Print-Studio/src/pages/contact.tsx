import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <title>Contact — JA Print Studio</title>
      <meta name="description" content="Get in touch with JA Print Studio. Contact us for print enquiries, file specifications, or general support." />

      {/* Hero */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Get In Touch</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl lg:text-7xl font-heading font-bold text-background leading-none mb-4">
              Contact
            </motion.h1>
            <motion.p variants={fadeUp} className="text-background/50 text-lg max-w-xl">
              Have a question about a print job, file specs, or a quote? Send us a message and we'll get back to you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-8"
            >
              <motion.div variants={fadeUp}>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Studio Info</h2>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: 'Email', value: 'hello@japrintstudio.co.uk' },
                    { icon: Phone, label: 'Phone', value: '+44 (0) 20 0000 0000' },
                    { icon: MapPin, label: 'Location', value: 'London, United Kingdom' },
                    { icon: Clock, label: 'Hours', value: 'Mon–Fri, 9am–6pm GMT' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-foreground/50" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold tracking-widest uppercase text-foreground/30 mb-0.5">{label}</div>
                        <div className="text-sm text-foreground/70">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="p-6 bg-muted/40 rounded-sm border border-border/40">
                <h3 className="font-bold text-foreground mb-2">File Specifications</h3>
                <ul className="text-sm text-foreground/55 space-y-1">
                  <li>• PDF, PNG, JPG, SVG, AI, PSD accepted</li>
                  <li>• Minimum 300 DPI for print quality</li>
                  <li>• 3mm bleed on all sides recommended</li>
                  <li>• CMYK colour mode preferred</li>
                  <li>• Fonts embedded or outlined</li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-2"
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle size={48} className="text-primary mb-4" />
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Message Sent</h2>
                  <p className="text-foreground/55">We'll get back to you within one business day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="+44 ..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Subject</label>
                      <input
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Business card quote"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your print requirements..."
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-3.5 bg-primary text-primary-foreground text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
