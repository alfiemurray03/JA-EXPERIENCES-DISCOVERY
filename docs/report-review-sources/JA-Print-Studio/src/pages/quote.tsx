import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, X, CheckCircle, FileText, ArrowRight, Mail, AlertCircle, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const PRODUCTS = [
  'Business Cards', 'Flyers & Leaflets', 'Posters', 'Banners', 'Stickers & Labels',
  'Menus', 'Booklets & Brochures', 'Letterheads', 'Compliment Slips', 'Envelopes',
  'Notepads', 'Document Printing', 'Custom Print',
];

const FINISHES = ['Gloss Laminate', 'Matte Laminate', 'Soft-Touch', 'Spot UV', 'Uncoated', 'Gloss Vinyl', 'Matte Vinyl', 'Clear Vinyl', 'Other'];
const DESIGN_SUPPORT = [
  { value: 'none', label: 'I have print-ready artwork', desc: 'PDF, PNG, JPG, SVG, AI, or PSD ready to go' },
  { value: 'minor', label: 'Minor edits needed', desc: 'Small changes to existing artwork' },
  { value: 'full', label: 'Full design needed', desc: "Create artwork from scratch — we'll quote for design too" },
];

// Files above this threshold won't be attached to the email — customer is asked to send separately
const EMAIL_ATTACH_LIMIT = 20 * 1024 * 1024; // 20 MB total before we skip attaching
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB per file (client-side guard)
const MAX_TOTAL_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB total (client-side guard)

interface UploadedFile {
  name: string;
  size: number;
  data: string;
  mimeType: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function QuotePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    product: '',
    quantity: '',
    size: '',
    finish: '',
    sides: '',
    paperStock: '',
    designSupport: 'none',
    deadline: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');

  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);
  const filesExceedEmailLimit = totalFileSize > EMAIL_ATTACH_LIMIT;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const oversized = selected.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      setError(`File too large: ${oversized.map((f) => f.name).join(', ')}. Maximum is 2 GB per file.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const currentTotal = files.reduce((sum, f) => sum + f.size, 0);
    const newTotal = selected.reduce((sum, f) => sum + f.size, currentTotal);
    if (newTotal > MAX_TOTAL_BYTES) {
      setError('Total file size exceeds 5 GB. Please remove some files before adding more.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setError('');
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFiles((prev) => [...prev, { name: file.name, size: file.size, data: base64, mimeType: file.type }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product) { setError('Please select a product.'); return; }
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.email.trim()) { setError('Please enter your email address.'); return; }
    setSubmitting(true);
    setError('');

    // If files are large, don't send them in the payload — just send file names
    const filesToSend = filesExceedEmailLimit
      ? files.map(({ name, size, mimeType }) => ({ name, size, mimeType, data: '' }))
      : files;

    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, files: filesToSend, filesAreLarge: filesExceedEmailLimit }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || 'Failed to submit');
      }
      const data = await res.json() as { reference: string };
      setReference(data.reference);
      
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function copyReference() {
    navigator.clipboard.writeText(reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-lg px-6"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-3">Request Sent!</h1>
          <p className="text-foreground/55 mb-2 text-lg">
            Thanks, <span className="font-semibold text-foreground">{form.name}</span>.
          </p>
          <p className="text-foreground/55 mb-6">
            We've received your quote request for <span className="font-medium text-foreground">{form.product}</span> and will get back to you at{' '}
            <span className="font-medium text-foreground">{form.email}</span> within one business day.
          </p>

          {/* Reference number */}
          <div className="mb-6 p-5 bg-muted/50 border border-border/60 rounded-sm">
            <p className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Your Reference Number</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-heading font-bold text-primary tracking-wider">{reference}</span>
              <button
                onClick={copyReference}
                className="p-1.5 rounded-sm border border-border/60 text-foreground/40 hover:text-foreground hover:border-foreground/30 transition-colors"
                title="Copy reference"
              >
                {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-foreground/40 mt-2">Keep this for your records. Quote it in any emails to us.</p>
          </div>

          {/* File sending instructions — always shown */}
          <div className="mb-6 p-5 bg-muted/40 border border-border/60 rounded-sm text-left">
            <p className="text-sm font-semibold text-foreground mb-1">Need to send artwork files?</p>
            <p className="text-sm text-foreground/60 mb-4">
              Email your files to us quoting your reference number and we'll match them to this request instantly.
            </p>
            <div className="bg-background/60 rounded-sm p-3 text-sm space-y-1.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-foreground/40 text-xs w-16 shrink-0">Email to:</span>
                <span className="font-semibold text-foreground text-sm">Hello@jagroupservices.co.uk</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-foreground/40 text-xs w-16 shrink-0 mt-0.5">Subject:</span>
                <span className="font-mono text-xs text-foreground/70 break-all">Artwork for {reference} — {form.product}</span>
              </div>
            </div>
            <a
              href={`mailto:Hello@jagroupservices.co.uk?subject=${encodeURIComponent(`Artwork for ${reference} — ${form.product}`)}&body=${encodeURIComponent(`Hi,\n\nPlease find attached my artwork files for quote reference ${reference}.\n\nProduct: ${form.product}\n\nThanks,\n${form.name}`)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors w-full justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Open Pre-filled Email
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors"
            >
              Back to Home <ArrowRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border/60 text-foreground text-sm font-semibold rounded-sm hover:bg-muted transition-colors"
            >
              Send an Enquiry
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <title>Get a Quote — JA Print Studio</title>
      <meta name="description" content="Request a custom print quote from JA Print Studio. Fill in your details and we'll get back to you with a tailored price." />

      {/* Hero */}
      <section className="py-16 bg-foreground">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">No Fixed Pricing</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-background leading-none mb-3">Get a Quote</h1>
            <p className="text-background/50 max-w-xl">
              Fill in the details below and we'll email you a custom price — no automated pricing, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-8">

              {/* Product */}
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground mb-4 pb-3 border-b border-border/40">1. What do you need printed?</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, product: p })}
                      className={`px-3 py-2.5 text-sm font-medium rounded-sm border text-left transition-all ${
                        form.product === p
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border/60 text-foreground/60 hover:border-foreground/30 hover:text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground mb-4 pb-3 border-b border-border/40">2. Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'quantity', label: 'Quantity', placeholder: 'e.g. 500' },
                    { key: 'size', label: 'Size', placeholder: 'e.g. A5, 85×55mm, Custom' },
                    { key: 'sides', label: 'Sides', placeholder: 'Single-sided / Double-sided' },
                    { key: 'paperStock', label: 'Paper Stock', placeholder: 'e.g. 350gsm, 170gsm' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">{label}</label>
                      <input
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Finish</label>
                    <select
                      value={form.finish}
                      onChange={(e) => setForm({ ...form, finish: e.target.value })}
                      className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Select a finish...</option>
                      {FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">Deadline</label>
                    <input
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="e.g. 10 June 2026, ASAP"
                    />
                  </div>
                </div>
              </div>

              {/* Design Support */}
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground mb-4 pb-3 border-b border-border/40">3. Design Support</h2>
                <div className="space-y-2">
                  {DESIGN_SUPPORT.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, designSupport: opt.value })}
                      className={`w-full flex items-start gap-4 p-4 rounded-sm border text-left transition-all ${
                        form.designSupport === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 hover:border-foreground/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${form.designSupport === opt.value ? 'border-primary' : 'border-foreground/30'}`}>
                        {form.designSupport === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                        <div className="text-xs text-foreground/50 mt-0.5">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground mb-1 pb-3 border-b border-border/40">
                  4. Upload Artwork <span className="text-foreground/30 font-normal text-sm">(optional)</span>
                </h2>
                <p className="text-xs text-foreground/40 mb-4">
                  Attach files up to 20 MB total directly here. For larger files, see the instructions below.
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-sm p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all"
                >
                  <Upload size={28} className="mx-auto mb-3 text-foreground/30" />
                  <p className="text-sm font-medium text-foreground/60 mb-1">Click to attach artwork files</p>
                  <p className="text-xs text-foreground/40">PDF, PNG, JPG, SVG, AI, PSD — up to 2 GB per file</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,.psd" className="hidden" onChange={handleFileChange} />

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/40 rounded-sm">
                        <FileText size={16} className="text-foreground/40 shrink-0" />
                        <span className="text-sm text-foreground/70 flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-foreground/40">{formatBytes(file.size)}</span>
                        <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-foreground/30 hover:text-foreground/60 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {/* Large file notice */}
                    {filesExceedEmailLimit && (
                      <div className="mt-2 p-4 bg-accent/10 border border-accent/40 rounded-sm">
                        <div className="flex items-start gap-2 mb-3">
                          <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-foreground">
                            Your files are too large to attach ({formatBytes(totalFileSize)} total)
                          </p>
                        </div>
                        <ol className="text-xs text-foreground/70 space-y-1.5 pl-1 list-none">
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-accent/30 text-foreground font-bold text-[10px] flex items-center justify-center mt-0.5">1</span>
                            <span>Remove your files using the <span className="font-semibold text-foreground">✕</span> buttons above</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-accent/30 text-foreground font-bold text-[10px] flex items-center justify-center mt-0.5">2</span>
                            <span>Submit the form — you'll get a <span className="font-semibold text-foreground">reference number</span> instantly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-accent/30 text-foreground font-bold text-[10px] flex items-center justify-center mt-0.5">3</span>
                            <span>Email your files to <span className="font-semibold text-foreground">Hello@jagroupservices.co.uk</span> with your reference number in the subject line — or use the button on the confirmation screen to open a pre-filled email</span>
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground mb-4 pb-3 border-b border-border/40">5. Additional Notes</h2>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Any other details, special requirements, or questions..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact details */}
              <div className="p-6 border border-border/60 rounded-sm">
                <h3 className="font-heading font-bold text-foreground mb-1">Your Details</h3>
                <p className="text-xs text-foreground/40 mb-4">We'll email your quote to the address below.</p>
                <div className="space-y-3">
                  {[
                    { key: 'name', label: 'Name', placeholder: 'Your name', required: true, type: 'text' },
                    { key: 'email', label: 'Email', placeholder: 'your@email.com', required: true, type: 'email' },
                    { key: 'phone', label: 'Phone', placeholder: '+44 ...', required: false, type: 'tel' },
                  ].map(({ key, label, placeholder, required, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-1.5">
                        {label}{required && ' *'}
                      </label>
                      <input
                        type={type}
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-3 py-2.5 border border-border/60 rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 border border-border/60 rounded-sm">
                <h3 className="font-heading font-bold text-foreground mb-4">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Product</span>
                    <span className="text-foreground font-medium">{form.product || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Quantity</span>
                    <span className="text-foreground font-medium">{form.quantity || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Finish</span>
                    <span className="text-foreground font-medium">{form.finish || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Files</span>
                    <span className={`font-medium ${filesExceedEmailLimit ? 'text-accent' : 'text-foreground'}`}>
                      {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} (${formatBytes(totalFileSize)})` : '—'}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border/40">
                    <div className="flex justify-between">
                      <span className="text-foreground/50">Price</span>
                      <span className="text-foreground font-bold">Custom Quote</span>
                    </div>
                    <p className="text-xs text-foreground/40 mt-1">We'll email you a tailored price.</p>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="p-5 bg-muted/40 rounded-sm border border-border/40">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={14} className="text-primary" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-foreground/50">How it works</span>
                </div>
                <ol className="space-y-2 text-xs text-foreground/60">
                  <li className="flex gap-2"><span className="text-primary font-bold shrink-0">1.</span> Submit your request — you'll get a reference number</li>
                  <li className="flex gap-2"><span className="text-primary font-bold shrink-0">2.</span> Email large files separately quoting your reference</li>
                  <li className="flex gap-2"><span className="text-primary font-bold shrink-0">3.</span> We review and send you a custom price within 1 business day</li>
                  <li className="flex gap-2"><span className="text-primary font-bold shrink-0">4.</span> Reply to approve and we get started</li>
                </ol>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                  <AlertCircle size={15} className="text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !form.product}
                className="w-full py-4 bg-primary text-primary-foreground text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Sending...' : 'Send Quote Request'}
                {!submitting && <ArrowRight size={14} />}
              </button>
              <p className="text-xs text-foreground/40 text-center">No payment required. We'll email you a quote first.</p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
