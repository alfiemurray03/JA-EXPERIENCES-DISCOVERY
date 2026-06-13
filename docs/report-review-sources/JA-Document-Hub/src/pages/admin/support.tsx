/**
 * Admin Support Centre
 * Full ticket management with real-time admin ↔ customer chat.
 * Theme-aware (light/dark). No mock data — all from live DB.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare, Search, RefreshCw, AlertTriangle,
  Clock, CheckCircle2, XCircle, ChevronRight, User,
  Mail, Calendar, Tag, Save, Send, ShieldCheck, Lock,
} from 'lucide-react';

interface Ticket {
  id: number;
  uuid: string;
  userId: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_type: 'admin' | 'customer';
  sender_name: string;
  sender_email: string;
  message: string;
  read_by_admin: boolean;
  read_by_customer: boolean;
  is_internal: boolean | number;
  created_at: string;
}

interface Stats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
  total: number;
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  open:        Clock,
  in_progress: AlertTriangle,
  resolved:    CheckCircle2,
  closed:      XCircle,
};

export default function AdminSupport() {

  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [stats, setStats]         = useState<Stats>({ open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0, total: 0 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [priorityFilter, setPri]  = useState('all');
  const [selected, setSelected]   = useState<Ticket | null>(null);
  const [saving, setSaving]       = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');

  // Chat state
  const [messages, setMessages]   = useState<TicketMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Theme tokens
  const card    = 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700';
  const text    = 'text-gray-900 dark:text-white';
  const muted   = 'text-gray-500 dark:text-slate-400';
  const subtle  = 'text-gray-400 dark:text-slate-600';
  const inputCls = 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500';
  const selectCls = 'bg-white border-gray-300 text-gray-900 dark:bg-slate-800 dark:border-slate-600 dark:text-white';
  const selectContent = 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700';
  const selectItem = 'text-gray-700 focus:text-gray-900 focus:bg-gray-100 dark:text-slate-300 dark:focus:text-white dark:focus:bg-slate-700';
  const divider = 'border-gray-200 dark:border-slate-700';

  const STATUS_STYLES: Record<string, string> = {
    open:        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
    resolved:    'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
    closed:      'bg-gray-100 text-gray-600 border-gray-300 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30',
  };

  const PRIORITY_STYLES: Record<string, string> = {
    low:    'bg-gray-100 text-gray-600 dark:bg-slate-600/40 dark:text-slate-300',
    normal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    high:   'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    urgent: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/support/tickets', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function openTicket(t: Ticket) {
    setSelected(t);
    setEditNotes(t.adminNotes ?? '');
    setEditStatus(t.status);
    setEditPriority(t.priority);
    setReplyText('');
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${t.id}/messages`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setMessages(data.messages ?? []);
    } catch { /* ignore */ }
    finally { setLoadingMsgs(false); }
  }

  async function saveTicket() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: editStatus, priority: editPriority, adminNotes: editNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === selected.id ? data.ticket : t));
        setSelected(data.ticket);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${selected.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: replyText.trim(), isInternal: isInternalNote }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages ?? []);
        setReplyText('');
        // Refresh ticket list to update status
        await load();
      }
    } finally {
      setSendingReply(false);
    }
  }

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.subject.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPri    = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPri;
  });

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      <Helmet>
        <title>Support Centre — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Support Centre" subtitle="Manage support requests and communicate with customers">
        <div className="space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total',       value: stats.total,       color: text },
              { label: 'Open',        value: stats.open,        color: 'text-blue-500' },
              { label: 'In Progress', value: stats.in_progress, color: 'text-amber-500' },
              { label: 'Urgent',      value: stats.urgent,      color: 'text-red-500' },
              { label: 'Resolved',    value: stats.resolved,    color: 'text-green-500' },
            ].map(s => (
              <Card key={s.label} className={card}>
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
                  <p className={`text-xs ${muted}`}>{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <Input
                placeholder="Search by subject, name, or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`pl-9 ${inputCls}`}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatus}>
                <SelectTrigger className={`${selectCls} text-sm w-36`}><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent className={selectContent}>
                  {['all','open','in_progress','resolved','closed'].map(s => (
                    <SelectItem key={s} value={s} className={`${selectItem} capitalize`}>
                      {s === 'all' ? 'All Status' : s.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPri}>
                <SelectTrigger className={`${selectCls} text-sm w-32`}><SelectValue placeholder="All Priority" /></SelectTrigger>
                <SelectContent className={selectContent}>
                  {['all','urgent','high','normal','low'].map(p => (
                    <SelectItem key={p} value={p} className={`${selectItem} capitalize`}>
                      {p === 'all' ? 'All Priority' : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}
                className={`gap-1.5 ${'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700'}`}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Ticket list */}
          <Card className={`${card} overflow-hidden`}>
            {filtered.length === 0 ? (
              <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                <MessageSquare className={`w-10 h-10 mb-3 ${subtle}`} />
                <p className={`font-medium ${text}`}>
                  {tickets.length === 0 ? 'No support tickets yet' : 'No tickets match your filters'}
                </p>
                <p className={`text-sm mt-1 max-w-sm ${muted}`}>
                  {tickets.length === 0
                    ? 'Tickets submitted through the contact form will appear here.'
                    : 'Try adjusting your search or filters.'}
                </p>
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${divider} ${'bg-gray-50 dark:bg-slate-900/50'}`}>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${muted}`}>Ticket</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${muted} hidden md:table-cell`}>Customer</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${muted}`}>Priority</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${muted}`}>Status</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${muted} hidden lg:table-cell`}>Received</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => {
                      const Icon = STATUS_ICONS[t.status] ?? Clock;
                      return (
                        <tr
                          key={t.id}
                          className={`border-b ${divider} hover:${'bg-gray-50 dark:bg-slate-700/30'} transition-colors cursor-pointer`}
                          onClick={() => openTicket(t)}
                        >
                          <td className="px-4 py-3">
                            <p className={`text-xs font-medium truncate max-w-[200px] ${text}`}>{t.subject}</p>
                            <p className={`text-[10px] mt-0.5 capitalize ${subtle}`}>{t.category}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className={`text-xs ${'text-gray-700 dark:text-slate-300'}`}>{t.name}</p>
                            <p className={`text-[10px] ${muted}`}>{t.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[t.priority]}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 w-fit ${STATUS_STYLES[t.status]}`}>
                              <Icon className="w-2.5 h-2.5" />
                              {t.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-xs hidden lg:table-cell ${muted}`}>
                            {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <ChevronRight className={`w-4 h-4 ${subtle}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>
      </AdminLayout>

      {/* Ticket detail + chat dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className={`${'bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white'} max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0`}>
          <DialogHeader className={`px-5 py-4 border-b ${divider} shrink-0`}>
            <DialogTitle className={`flex items-center gap-2 ${text}`}>
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Ticket #{selected?.id} — {selected?.subject}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Two-column layout: chat left, controls right */}
              <div className="flex flex-1 overflow-hidden">

                {/* Chat panel */}
                <div className="flex flex-col flex-1 min-w-0 border-r border-inherit" style={{ borderColor: '#e5e7eb dark:#334155' }}>
                  {/* Customer info bar */}
                  <div className={`px-4 py-2.5 border-b ${divider} ${'bg-gray-50 dark:bg-slate-800/50'} shrink-0`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className={`w-3 h-3 ${muted}`} />
                        <span className={`text-xs ${text}`}>{selected.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className={`w-3 h-3 ${muted}`} />
                        <span className={`text-xs ${muted}`}>{selected.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className={`w-3 h-3 ${muted}`} />
                        <span className={`text-xs ${muted}`}>
                          {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className={`w-3 h-3 ${muted}`} />
                        <span className={`text-xs capitalize ${muted}`}>{selected.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                    {/* Original message */}
                    <div className="flex gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                        {(selected.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${text}`}>{selected.name}</span>
                          <span className={`text-[10px] ${subtle}`}>Original message</span>
                        </div>
                        <div className={`rounded-lg px-3 py-2 text-sm ${'bg-gray-100 dark:bg-slate-800'} ${text}`}>
                          {selected.message}
                        </div>
                        <p className={`text-[10px] mt-1 ${subtle}`}>{formatTime(selected.createdAt)}</p>
                      </div>
                    </div>

                    {/* Thread messages */}
                    {loadingMsgs ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className={`w-4 h-4 animate-spin ${muted}`} />
                      </div>
                    ) : messages.map(msg => {
                      const isAdmin    = msg.sender_type === 'admin';
                      const isInternal = Boolean(msg.is_internal);
                      return (
                        <div key={msg.id} className={`flex gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isInternal
                              ? ('bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400')
                              : isAdmin
                                ? ('bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary')
                                : ('bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400')
                          }`}>
                            {isInternal ? <Lock className="w-3.5 h-3.5" /> : isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : (msg.sender_name ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div className={`flex-1 min-w-0 ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                              <span className={`text-xs font-medium ${text}`}>
                                {isInternal ? 'Internal Note' : isAdmin ? 'Support Team' : msg.sender_name}
                              </span>
                              {isInternal && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                  Internal only
                                </span>
                              )}
                              <span className={`text-[10px] ${subtle}`}>{formatTime(msg.created_at)}</span>
                            </div>
                            <div className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                              isInternal
                                ? ('bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border dark:border-amber-500/30')
                                : isAdmin
                                  ? ('bg-primary/10 text-primary dark:bg-primary/20 dark:text-white')
                                  : ('bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-white')
                            }`}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply box */}
                  {selected.status !== 'closed' && (
                    <div className={`px-4 py-3 border-t ${divider} shrink-0`}>
                      {/* Internal note toggle */}
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setIsInternalNote(v => !v)}
                          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors ${
                            isInternalNote
                              ? ('bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-400')
                              : ('bg-gray-100 border-gray-300 text-gray-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400')
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          {isInternalNote ? 'Internal note (not emailed)' : 'Reply to customer (emailed)'}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder={isInternalNote ? 'Add an internal note (not visible to customer)…' : 'Type your reply to the customer…'}
                          className={`flex-1 text-sm min-h-[60px] max-h-[120px] resize-none ${inputCls} ${
                            isInternalNote ? ('border-amber-300 dark:border-amber-500/40') : ''
                          }`}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              sendReply();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={sendReply}
                          disabled={sendingReply || !replyText.trim()}
                          className={`self-end gap-1.5 shrink-0 ${isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                        >
                          {sendingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : isInternalNote ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                          {isInternalNote ? 'Save Note' : 'Send'}
                        </Button>
                      </div>
                      <p className={`text-[10px] mt-1 ${subtle}`}>Ctrl+Enter to send</p>
                    </div>
                  )}
                  {selected.status === 'closed' && (
                    <div className={`px-4 py-3 border-t ${divider} text-center`}>
                      <p className={`text-xs ${muted}`}>This ticket is closed. Change status to re-open it.</p>
                    </div>
                  )}
                </div>

                {/* Controls panel */}
                <div className="w-56 shrink-0 flex flex-col overflow-y-auto">
                  <div className="p-4 space-y-4">
                    <div>
                      <p className={`text-[10px] uppercase tracking-wide mb-1.5 ${muted}`}>Status</p>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger className={`${selectCls} text-sm h-8`}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContent}>
                          {['open','in_progress','resolved','closed'].map(s => (
                            <SelectItem key={s} value={s} className={`${selectItem} capitalize text-xs`}>
                              {s.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wide mb-1.5 ${muted}`}>Priority</p>
                      <Select value={editPriority} onValueChange={setEditPriority}>
                        <SelectTrigger className={`${selectCls} text-sm h-8`}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContent}>
                          {['low','normal','high','urgent'].map(p => (
                            <SelectItem key={p} value={p} className={`${selectItem} capitalize text-xs`}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wide mb-1.5 ${muted}`}>Internal Notes</p>
                      <Textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder="Notes (not visible to customer)…"
                        className={`${inputCls} text-xs min-h-[80px] resize-none`}
                      />
                    </div>
                    <Button size="sm" onClick={saveTicket} disabled={saving} className="w-full gap-1.5">
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </Button>

                    {selected.resolvedAt && (
                      <div className={`text-[10px] pt-2 border-t ${divider} ${subtle}`}>
                        Resolved {new Date(selected.resolvedAt).toLocaleDateString('en-GB')}
                        {selected.resolvedBy && ` by ${selected.resolvedBy}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
