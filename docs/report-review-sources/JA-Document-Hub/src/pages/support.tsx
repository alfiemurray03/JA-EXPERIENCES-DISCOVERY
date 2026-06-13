import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { useSiteSettings } from '@/lib/site-settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  MessageSquare, Plus, Send, Clock, CheckCircle2, AlertCircle,
  Loader2, ChevronRight, RefreshCw, HelpCircle, Mail, Phone,
  ExternalLink, Info, X,
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date-utils';

interface SupportTicket {
  id: number;
  uuid: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  senderType: 'admin' | 'customer';
  senderName: string;
  message: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RefreshCw },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-600 border-gray-200',    icon: X },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-600 border-gray-200' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  high:   { label: 'High',   color: 'bg-orange-100 text-orange-600 border-orange-200' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600 border-red-200' },
};

const CATEGORIES = [
  { value: 'general',   label: 'General Enquiry' },
  { value: 'billing',   label: 'Billing & Subscription' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'templates', label: 'Templates & Builders' },
  { value: 'account',   label: 'Account & Access' },
  { value: 'feedback',  label: 'Feedback & Suggestions' },
  { value: 'other',     label: 'Other' },
];

export default function SupportPage() {
  const { user } = useAuth();
  const { siteName, supportEmail } = useSiteSettings();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New ticket form
  const [showNewForm, setShowNewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({
    subject: '', message: '', category: 'general', priority: 'normal',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Ticket detail / reply
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/support/tickets', { credentials: 'include' });
      const data = await res.json() as { success: boolean; tickets?: SupportTicket[]; error?: string };
      if (data.success && data.tickets) setTickets(data.tickets);
      else setError(data.error ?? 'Failed to load tickets.');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const loadMessages = useCallback(async (ticketId: number) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, { credentials: 'include' });
      const data = await res.json() as { success: boolean; messages?: TicketMessage[] };
      if (data.success && data.messages) setMessages(data.messages);
    } catch {
      // silent
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      void loadMessages(selectedTicket.id);
    }
  }, [selectedTicket, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    else if (form.subject.trim().length < 5) errs.subject = 'Subject must be at least 5 characters.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 20) errs.message = 'Please provide more detail (at least 20 characters).';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Customer',
          email: user?.email ?? '',
          subject: form.subject.trim(),
          message: form.message.trim(),
          category: form.category,
          priority: form.priority,
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setSubmitSuccess(true);
        setForm({ subject: '', message: '', category: 'general', priority: 'normal' });
        setShowNewForm(false);
        void loadTickets();
      } else {
        setFormErrors({ _global: data.error ?? 'Failed to submit. Please try again.' });
      }
    } catch {
      setFormErrors({ _global: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setReplyText('');
        void loadMessages(selectedTicket.id);
      } else {
        setReplyError(data.error ?? 'Failed to send reply.');
      }
    } catch {
      setReplyError('Network error. Please try again.');
    } finally {
      setReplying(false);
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const closedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <>
      <Helmet>
        <title>Support Centre — {siteName}</title>
        <meta name="description" content="Get help, submit support tickets, and track your requests." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Support Centre</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Get help with your account, documents, and billing.
              </p>
            </div>
            <Button
              onClick={() => { setShowNewForm(true); setSubmitSuccess(false); }}
              className="gap-2 self-start sm:self-auto"
              aria-label="Create new support ticket"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              New Ticket
            </Button>
          </div>

          {/* Success banner */}
          {submitSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              <AlertDescription className="text-green-700">
                Your support ticket has been submitted. We'll be in touch shortly. You can track it below.
              </AlertDescription>
            </Alert>
          )}

          {/* Contact info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Email Support</p>
                    <a href={`mailto:${supportEmail}`}
                      className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                      {supportEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Response Time</p>
                    <p className="text-xs text-muted-foreground">Within 1–2 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Help Centre</p>
                    <a href="/contact" className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded inline-flex items-center gap-1">
                      Contact page <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New ticket form */}
          {showNewForm && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    New Support Ticket
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}
                    aria-label="Close new ticket form">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => void handleSubmit(e)} noValidate aria-label="New support ticket form">
                  {formErrors._global && (
                    <Alert variant="destructive" className="mb-4" role="alert">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>{formErrors._global}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="ticket-category">Category</Label>
                      <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger id="ticket-category" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ticket-priority">Priority</Label>
                      <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                        <SelectTrigger id="ticket-priority" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="ticket-subject">
                      Subject <span className="text-destructive" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="ticket-subject"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className={`mt-1 ${formErrors.subject ? 'border-destructive' : ''}`}
                      aria-required="true"
                      aria-describedby={formErrors.subject ? 'subject-error' : undefined}
                      maxLength={500}
                    />
                    {formErrors.subject && (
                      <p id="subject-error" className="text-xs text-destructive mt-1" role="alert">{formErrors.subject}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="ticket-message">
                      Message <span className="text-destructive" aria-hidden="true">*</span>
                    </Label>
                    <Textarea
                      id="ticket-message"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
                      rows={5}
                      className={`mt-1 resize-none ${formErrors.message ? 'border-destructive' : ''}`}
                      aria-required="true"
                      aria-describedby={formErrors.message ? 'message-error' : undefined}
                    />
                    {formErrors.message && (
                      <p id="message-error" className="text-xs text-destructive mt-1" role="alert">{formErrors.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowNewForm(false)} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="gap-2">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                      {submitting ? 'Submitting…' : 'Submit Ticket'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Ticket list */}
          {loading ? (
            <div className="flex items-center justify-center py-12" aria-live="polite" aria-label="Loading tickets">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="ml-2 text-muted-foreground">Loading tickets…</span>
            </div>
          ) : error ? (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground mb-1">No support tickets yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  If you need help, create a ticket and we'll get back to you within 1–2 business days.
                </p>
                <Button onClick={() => setShowNewForm(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {openTickets.length > 0 && (
                <section aria-labelledby="open-tickets-heading">
                  <h2 id="open-tickets-heading" className="text-sm font-semibold text-foreground mb-2">
                    Active Tickets ({openTickets.length})
                  </h2>
                  <div className="space-y-2">
                    {openTickets.map(ticket => (
                      <TicketRow key={ticket.id} ticket={ticket} onOpen={() => setSelectedTicket(ticket)} />
                    ))}
                  </div>
                </section>
              )}
              {closedTickets.length > 0 && (
                <section aria-labelledby="closed-tickets-heading">
                  <h2 id="closed-tickets-heading" className="text-sm font-semibold text-foreground mb-2">
                    Resolved / Closed ({closedTickets.length})
                  </h2>
                  <div className="space-y-2">
                    {closedTickets.map(ticket => (
                      <TicketRow key={ticket.id} ticket={ticket} onOpen={() => setSelectedTicket(ticket)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Ticket detail dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={open => { if (!open) setSelectedTicket(null); }}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
            <DialogTitle className="text-base font-semibold pr-8">
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {selectedTicket && (
                <span className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={selectedTicket.status} />
                  <PriorityBadge priority={selectedTicket.priority} />
                  <span>·</span>
                  <span>{CATEGORIES.find(c => c.value === selectedTicket.category)?.label ?? selectedTicket.category}</span>
                  <span>·</span>
                  <span>Opened {formatDistanceToNow(selectedTicket.createdAt)} ago</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0" role="log" aria-label="Ticket conversation" aria-live="polite">
            {/* Original message */}
            {selectedTicket && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(selectedTicket.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{selectedTicket.name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(selectedTicket.createdAt)} ago</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap">
                    {selectedTicket.message}
                  </div>
                </div>
              </div>
            )}

            {messagesLoading ? (
              <div className="flex justify-center py-4" aria-label="Loading messages">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.senderType === 'customer' ? '' : 'flex-row-reverse'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.senderType === 'admin' ? 'bg-accent' : 'bg-primary'}`}>
                  {msg.senderType === 'admin' ? 'S' : (msg.senderName ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 min-w-0 ${msg.senderType === 'admin' ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${msg.senderType === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-medium text-foreground">
                      {msg.senderType === 'admin' ? 'Support Team' : msg.senderName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(msg.createdAt)} ago</span>
                  </div>
                  <div className={`rounded-lg p-3 text-sm whitespace-pre-wrap ${msg.senderType === 'admin' ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'}`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply form */}
          {selectedTicket && selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
            <div className="border-t p-4 shrink-0">
              {replyError && (
                <p className="text-xs text-destructive mb-2" role="alert">{replyError}</p>
              )}
              <form onSubmit={(e) => void handleReply(e)} className="flex gap-2" aria-label="Reply to ticket">
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply…"
                  rows={2}
                  className="resize-none flex-1 text-sm"
                  aria-label="Reply message"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      void handleReply(e as unknown as React.FormEvent);
                    }
                  }}
                />
                <Button type="submit" disabled={replying || !replyText.trim()} className="self-end gap-1.5" aria-label="Send reply">
                  {replying ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                  Send
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground mt-1">Press Ctrl+Enter to send</p>
            </div>
          )}
          {selectedTicket && (selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
            <div className="border-t p-4 shrink-0">
              <p className="text-xs text-muted-foreground text-center">
                This ticket is {selectedTicket.status}. Create a new ticket if you need further assistance.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function TicketRow({ ticket, onOpen }: { ticket: SupportTicket; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left"
      aria-label={`View ticket: ${ticket.subject}`}
    >
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="text-[10px] text-muted-foreground">
                  {CATEGORIES.find(c => c.value === ticket.category)?.label ?? ticket.category}
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(ticket.updatedAt)} ago
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.normal;
  return (
    <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
