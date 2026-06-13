/**
 * SupportChatbot — floating chat bubble for all users.
 *
 * Logged-in users:
 *   - See their existing tickets and can continue conversations with admin
 *   - Can open a new ticket
 *   - Unread admin replies shown as a red badge
 *
 * Anonymous users:
 *   - Step-by-step form to submit a new ticket
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, ChevronDown, Loader2, CheckCircle2,
  ChevronLeft, Plus, Clock, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  sender_type: 'admin' | 'customer';
  sender_name: string;
  message: string;
  created_at: string;
}

type AnonStep = 'name' | 'email' | 'subject' | 'message' | 'sending' | 'done' | 'error';

interface AnonMsg {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  open:        'text-blue-500',
  in_progress: 'text-amber-500',
  resolved:    'text-green-500',
  closed:      'text-gray-400',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  open:        Clock,
  in_progress: AlertTriangle,
  resolved:    CheckCircle2,
  closed:      X,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SupportChatbot() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [open, setOpen]         = useState(false);
  const [unreadCount, setUnread] = useState(0);

  // Logged-in views: 'list' | 'thread' | 'new'
  const [view, setView]         = useState<'list' | 'thread' | 'new'>('list');
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [threadMsgs, setThreadMsgs]         = useState<TicketMessage[]>([]);
  const [loadingThread, setLoadingThread]   = useState(false);
  const [replyText, setReplyText]           = useState('');
  const [sendingReply, setSendingReply]     = useState(false);
  const [userName, setUserName]             = useState('');

  // New ticket form (logged-in)
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);
  const [newDone, setNewDone]       = useState(false);

  // Anonymous flow
  const [anonStep, setAnonStep]   = useState<AnonStep>('name');
  const [anonMsgs, setAnonMsgs]   = useState<AnonMsg[]>([]);
  const [anonInput, setAnonInput] = useState('');
  const [anonName, setAnonName]   = useState('');
  const [anonEmail, setAnonEmail] = useState('');
  const [anonSubject, setAnonSubject] = useState('');

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [threadMsgs, anonMsgs]);

  // Focus input
  useEffect(() => {
    if (open && !isLoggedIn && anonStep !== 'sending' && anonStep !== 'done' && anonStep !== 'error') {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [anonStep, open, isLoggedIn]);

  // Load tickets for logged-in users
  const loadTickets = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/support/tickets', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets ?? []);
        // Count unread admin replies
        // We'll check via thread messages — for now just show badge if any in_progress
        const unread = (data.tickets ?? []).filter((t: Ticket) => t.status === 'in_progress').length;
        setUnread(unread);
      }
    } catch { /* ignore */ }
    finally { setLoadingTickets(false); }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && open) loadTickets();
  }, [isLoggedIn, open, loadTickets]);

  // Resolve user display name
  useEffect(() => {
    if (user) setUserName(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email);
  }, [user]);

  async function openThread(ticket: Ticket) {
    setSelectedTicket(ticket);
    setView('thread');
    setReplyText('');
    setThreadMsgs([]);
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticket.id}/messages`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setThreadMsgs(data.messages ?? []);
    } catch { /* ignore */ }
    finally { setLoadingThread(false); }
  }

  async function sendReply() {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setThreadMsgs(data.messages ?? []);
        setReplyText('');
      }
    } finally {
      setSendingReply(false);
    }
  }

  async function submitNewTicket() {
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSubmittingNew(true);
    try {
      const res = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: userName,
          email: user?.email ?? '',
          subject: newSubject.trim(),
          message: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewDone(true);
        await loadTickets();
      }
    } finally {
      setSubmittingNew(false);
    }
  }

  // ── Anonymous flow ──────────────────────────────────────────────────────────

  function initAnon() {
    setAnonStep('name');
    setAnonMsgs([{
      id: 'intro',
      role: 'bot',
      text: "Hi! I'm the JA Document Hub support assistant. I'll pass your message straight to our team. What's your name?",
    }]);
    setAnonInput('');
    setAnonName(''); setAnonEmail(''); setAnonSubject('');
  }

  async function handleAnonSend() {
    const val = anonInput.trim();
    if (!val) return;
    setAnonInput('');
    const addUser = (t: string) => setAnonMsgs(p => [...p, { id: Date.now() + 'u', role: 'user', text: t }]);
    const addBot  = (t: string) => setAnonMsgs(p => [...p, { id: Date.now() + 'b', role: 'bot',  text: t }]);

    switch (anonStep) {
      case 'name': {
        setAnonName(val); addUser(val); setAnonStep('email');
        addBot(`Nice to meet you, ${val}! What's your email address so our team can reply?`);
        break;
      }
      case 'email': {
        if (!val.includes('@')) { addBot("That doesn't look like a valid email. Please try again."); return; }
        setAnonEmail(val); addUser(val); setAnonStep('subject');
        addBot('Got it. What\'s the subject of your enquiry?');
        break;
      }
      case 'subject': {
        setAnonSubject(val); addUser(val); setAnonStep('message');
        addBot('Almost there — please describe your issue or question in detail.');
        break;
      }
      case 'message': {
        addUser(val); setAnonStep('sending');
        addBot('Sending your message to our support team…');
        try {
          const res = await fetch('/api/support/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: anonName, email: anonEmail, subject: anonSubject, message: val }),
          });
          const data = await res.json() as { success: boolean };
          if (data.success) {
            setAnonStep('done');
            addBot(`Your message has been received! Our team will reply to ${anonEmail} as soon as possible.`);
          } else throw new Error();
        } catch {
          setAnonStep('error');
          addBot("Sorry, I couldn't send your message right now. Please try again in a moment.");
        }
        break;
      }
      default: break;
    }
  }

  function handleAnonKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleAnonSend(); }
  }

  // ── Open/close ──────────────────────────────────────────────────────────────

  function openWidget() {
    setOpen(true);
    setUnread(0);
    if (!isLoggedIn && anonStep === 'name' && anonMsgs.length === 0) initAnon();
    if (isLoggedIn) { setView('list'); setNewDone(false); setNewSubject(''); setNewMessage(''); }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={open ? () => setOpen(false) : openWidget}
          aria-label={open ? 'Close support chat' : 'Open support chat'}
          className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {open ? <ChevronDown className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          {!open && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {isLoggedIn && view !== 'list' && (
                <button
                  onClick={() => { setView('list'); setSelectedTicket(null); setNewDone(false); }}
                  className="text-primary-foreground/70 hover:text-primary-foreground mr-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {isLoggedIn
                    ? view === 'thread' ? selectedTicket?.subject ?? 'Ticket' : view === 'new' ? 'New Ticket' : 'Support'
                    : 'JA Support'}
                </p>
                <p className="text-[10px] text-primary-foreground/70 leading-tight">
                  {isLoggedIn ? 'We typically reply within 24 hours' : 'We typically reply within 24 hours'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          {isLoggedIn ? (
            <>
              {/* ── Ticket list ── */}
              {view === 'list' && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    {loadingTickets ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-foreground">No support tickets yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Open a ticket and our team will get back to you.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {tickets.map(t => {
                          const Icon = STATUS_ICONS[t.status] ?? Clock;
                          return (
                            <button
                              key={t.id}
                              onClick={() => openThread(t)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-medium text-foreground truncate flex-1">{t.subject}</p>
                                <span className={`text-[10px] flex items-center gap-1 shrink-0 ${STATUS_COLORS[t.status]}`}>
                                  <Icon className="w-3 h-3" />
                                  {t.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Updated {fmtDate(t.updatedAt)}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-border shrink-0">
                    <Button size="sm" className="w-full gap-1.5" onClick={() => { setView('new'); setNewDone(false); }}>
                      <Plus className="w-3.5 h-3.5" /> New Support Ticket
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Thread view ── */}
              {view === 'thread' && selectedTicket && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                    {loadingThread ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : threadMsgs.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No replies yet. Our team will respond soon.</p>
                    ) : threadMsgs.map(msg => {
                      const isAdmin = msg.sender_type === 'admin';
                      return (
                        <div key={msg.id} className={`flex gap-2 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isAdmin ? 'bg-primary text-primary-foreground' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {isAdmin ? <ShieldCheck className="w-3 h-3" /> : msg.sender_name.charAt(0)}
                          </div>
                          <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? 'bg-white border border-border text-foreground rounded-bl-sm shadow-sm'
                              : 'bg-primary text-primary-foreground rounded-br-sm'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {selectedTicket.status !== 'closed' ? (
                    <div className="px-3 py-3 border-t border-border bg-white shrink-0">
                      <div className="flex gap-2 items-end">
                        <Textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Reply to support team…"
                          rows={2}
                          className="flex-1 text-sm resize-none min-h-0"
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendReply(); } }}
                        />
                        <Button size="sm" onClick={sendReply} disabled={sendingReply || !replyText.trim()} className="shrink-0 h-9 w-9 p-0">
                          {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border-t border-border text-center">
                      <p className="text-xs text-muted-foreground">This ticket is closed.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── New ticket form ── */}
              {view === 'new' && (
                <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {newDone ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                      <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                      <p className="text-sm font-medium text-foreground">Ticket submitted!</p>
                      <p className="text-xs text-muted-foreground mt-1">Our team will reply to your email soon.</p>
                      <Button size="sm" variant="outline" className="mt-4" onClick={() => { setView('list'); loadTickets(); }}>
                        View my tickets
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1">Subject</label>
                        <Input
                          value={newSubject}
                          onChange={e => setNewSubject(e.target.value)}
                          placeholder="e.g. Billing question, Template issue…"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-foreground block mb-1">Message</label>
                        <Textarea
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Describe your issue in detail…"
                          className="text-sm min-h-[120px]"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={submitNewTicket}
                        disabled={submittingNew || !newSubject.trim() || !newMessage.trim()}
                      >
                        {submittingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {submittingNew ? 'Submitting…' : 'Submit Ticket'}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            /* ── Anonymous flow ── */
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                {anonMsgs.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mr-2 mt-0.5">
                        <MessageCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-white text-foreground border border-border rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {anonStep === 'sending' && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mr-2 mt-0.5">
                      <MessageCircle className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    </div>
                  </div>
                )}
                {anonStep === 'done' && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Message sent successfully
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-3 py-3 border-t border-border bg-white shrink-0">
                {anonStep === 'done' || anonStep === 'error' ? (
                  <Button size="sm" variant="outline" onClick={initAnon} className="w-full text-xs">
                    Send another message
                  </Button>
                ) : anonStep === 'sending' ? (
                  <div className="flex items-center justify-center py-1">
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin mr-2" />
                    <span className="text-xs text-muted-foreground">Sending…</span>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end">
                    {anonStep === 'message' ? (
                      <Textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={anonInput}
                        onChange={e => setAnonInput(e.target.value)}
                        onKeyDown={handleAnonKey}
                        placeholder="Describe your issue…"
                        rows={3}
                        className="flex-1 text-sm resize-none min-h-0"
                      />
                    ) : (
                      <Input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        value={anonInput}
                        onChange={e => setAnonInput(e.target.value)}
                        onKeyDown={handleAnonKey}
                        placeholder={anonStep === 'name' ? 'Your name…' : anonStep === 'email' ? 'your@email.com' : 'Subject…'}
                        type={anonStep === 'email' ? 'email' : 'text'}
                        className="flex-1 text-sm"
                      />
                    )}
                    <Button size="sm" onClick={() => void handleAnonSend()} disabled={!anonInput.trim()} className="shrink-0 h-9 w-9 p-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground text-center mt-2">Powered by JA Document Hub Support</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
