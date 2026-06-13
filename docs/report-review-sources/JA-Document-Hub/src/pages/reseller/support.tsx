import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LifeBuoy, Plus, Send, Loader2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface Ticket { uuid: string; subject: string; status: string; priority: string; createdAt: string; updatedAt: string; }
interface Message { id: number; senderType: string; senderName: string | null; body: string; createdAt: string; }

export default function ResellerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ subject: '', body: '', priority: 'normal' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  function loadTickets() {
    fetch('/api/reseller/support/tickets', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setTickets(d.tickets); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadTickets(); }, []);

  async function openTicket(t: Ticket) {
    setSelectedTicket(t);
    const r = await fetch(`/api/reseller/support/tickets/${t.uuid}/messages`, { credentials: 'include' });
    const d = await r.json();
    if (d.success) setMessages(d.messages);
  }

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch('/api/reseller/support/tickets', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      const d = await r.json();
      if (d.success) { setShowNew(false); setNewForm({ subject: '', body: '', priority: 'normal' }); loadTickets(); }
      else setError(d.error ?? 'Failed to submit.');
    } catch { setError('Network error.'); }
    finally { setSubmitting(false); }
  }

  async function sendReply() {
    if (!reply.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      await fetch(`/api/reseller/support/tickets/${selectedTicket.uuid}/messages`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      });
      setReply('');
      const r = await fetch(`/api/reseller/support/tickets/${selectedTicket.uuid}/messages`, { credentials: 'include' });
      const d = await r.json();
      if (d.success) setMessages(d.messages);
    } finally { setReplying(false); }
  }

  return (
    <ComingSoonOverlay>
    <ResellerLayout>
      <Helmet><title>Support — Reseller Portal</title></Helmet>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support</h1>
            <p className="text-muted-foreground text-sm mt-1">Get help from our reseller support team.</p>
          </div>
          <Button onClick={() => setShowNew(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* New ticket dialog */}
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Support Ticket</DialogTitle></DialogHeader>
            <form onSubmit={submitNew} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={newForm.subject} onChange={e => setNewForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea rows={5} value={newForm.body} onChange={e => setNewForm(f => ({ ...f, body: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Ticket'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Ticket thread dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={v => { if (!v) setSelectedTicket(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base">{selectedTicket?.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.senderType === 'reseller' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.senderType === 'reseller' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    <div className="font-medium text-xs mb-1 opacity-70">{m.senderName ?? (m.senderType === 'admin' ? 'Support' : 'You')}</div>
                    <div className="whitespace-pre-wrap">{m.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Textarea rows={2} placeholder="Type a reply…" value={reply} onChange={e => setReply(e.target.value)} className="resize-none" />
              <Button onClick={sendReply} disabled={replying || !reply.trim()} size="sm" className="self-end">
                {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ticket list */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading tickets…</div>
            ) : !tickets.length ? (
              <div className="p-8 text-center">
                <LifeBuoy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No support tickets yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {tickets.map(t => (
                  <button key={t.uuid} onClick={() => openTicket(t)} className="w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">{t.subject}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{new Date(t.updatedAt).toLocaleDateString('en-GB')}</div>
                      </div>
                      <Badge className={`text-xs shrink-0 ${STATUS_STYLES[t.status] ?? ''}`}>{t.status.replace('_', ' ')}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResellerLayout>
    </ComingSoonOverlay>
  );
}
