import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
'@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare, Mail, Clock, CheckCircle2, AlertTriangle,
  FileText, CreditCard, Settings, HelpCircle, Loader2 } from
'lucide-react';

const CATEGORIES = [
{ value: 'general', label: 'General enquiry' },
{ value: 'billing', label: 'Billing & subscriptions' },
{ value: 'technical', label: 'Technical issue' },
{ value: 'templates', label: 'Templates & documents' },
{ value: 'account', label: 'Account & access' },
{ value: 'feedback', label: 'Feedback & suggestions' },
{ value: 'other', label: 'Other' }];


const PRIORITIES = [
{ value: 'low', label: 'Low — general question' },
{ value: 'normal', label: 'Normal — standard request' },
{ value: 'high', label: 'High — affecting my work' },
{ value: 'urgent', label: 'Urgent — cannot use the platform' }];


const QUICK_LINKS = [
{ icon: CreditCard, title: 'Billing & Plans', description: 'Upgrade, downgrade, or cancel your subscription.', href: '/pricing' },
{ icon: Settings, title: 'Account Settings', description: 'Update your profile, password, and preferences.', href: '/settings' },
{ icon: FileText, title: 'Document Builders', description: 'Browse 10 professional document builders with 100+ templates.', href: '/builders' },
{ icon: HelpCircle, title: 'Plans & Pricing', description: 'Compare plans and see what\'s included.', href: '/pricing' }];


export default function ContactPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    email: user?.email ?? '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = (await res.json()) as {success: boolean;error?: string;};
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error ?? 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Support — JA Document Hub</title>
        <meta name="description" content="Get help with JA Document Hub. Submit a support request and our team will be in touch." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Contact Support</h1>
            <p className="text-muted-foreground">
              Have a question or need help? Fill in the form below and our team will get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Form */}
            <div className="lg:col-span-2">
              {success ?
              <div className="bg-card border border-border rounded-2xl p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Request submitted</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Thank you — we've received your support request and will be in touch shortly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={() => {setSuccess(false);setForm((f) => ({ ...f, subject: '', message: '' }));}}>
                      Submit another request
                    </Button>
                    {user &&
                  <Button variant="outline" asChild>
                        <Link to="/dashboard">Back to dashboard</Link>
                      </Button>
                  }
                  </div>
                </div> :

              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
                  <h2 className="text-base font-bold text-foreground">Submit a support request</h2>

                  {error &&
                <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                }

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
                      <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Your name"
                      required />
                    
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
                      <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="you@example.com"
                      required />
                    
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="category">Category</Label>
                      <Select value={form.category} onValueChange={(v) => update('category', v)}>
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) =>
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={form.priority} onValueChange={(v) => update('priority', v)}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) =>
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                    <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    placeholder="Brief description of your issue"
                    required />
                  
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                    <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="Please describe your issue in as much detail as possible…"
                    className="min-h-[140px]"
                    required />
                  
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-destructive">*</span> Required fields
                    </p>
                    <Button type="submit" disabled={submitting} className="gap-2">
                      {submitting ?
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> :
                    <><MessageSquare className="w-4 h-4" />Submit request</>}
                    </Button>
                  </div>
                </form>
              }
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Response time */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Response times</h3>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                  { label: 'Urgent', time: 'Within 4 hours', color: 'text-red-500' },
                  { label: 'High', time: 'Within 24 hours', color: 'text-amber-500' },
                  { label: 'Normal', time: 'Within 2 days', color: 'text-blue-500' },
                  { label: 'Low', time: 'Within 5 days', color: 'text-slate-400' }].
                  map((r) =>
                  <div key={r.label} className="flex items-center justify-between">
                      <span className={`font-medium ${r.color}`}>{r.label}</span>
                      <span className="text-muted-foreground">{r.time}</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
                  Priority support customers (Professional &amp; Organisation plans) receive faster responses.
                </p>
              </div>

              {/* Email */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Email us directly</h3>
                </div>
                <a
                  href="mailto:support@jadocumenthub.com"
                  className="text-sm text-primary hover:underline font-medium">Hello@jagroupservices.co.uk


                </a>
                <p className="text-xs text-muted-foreground">
                  For sensitive account issues, email us directly.
                </p>
              </div>

              {/* Quick links */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Quick links</h3>
                <div className="space-y-2">
                  {QUICK_LINKS.map((ql) => {
                    const Icon = ql.icon;
                    return (
                      <Link
                        key={ql.title}
                        to={ql.href}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                        
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{ql.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{ql.description}</p>
                        </div>
                      </Link>);

                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              JA Document Hub provides document creation tools only. We do not provide legal, financial, or professional advice.
              For legal or professional matters, please consult a qualified professional.
            </p>
          </div>

        </div>
      </div>
    </>);

}