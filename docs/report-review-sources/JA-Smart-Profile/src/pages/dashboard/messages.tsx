/**
 * Dashboard — Messages
 * Full messaging app: enable/disable toggle, 2-way live chat.
 * Polls for new messages every 6 seconds when a thread is open.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Send, Lock, Unlock, Trash2, ArrowLeft,
  Mail, RefreshCw, AlertCircle, UserCheck, Clock, ExternalLink, Copy,
  CheckCheck, ToggleLeft, ToggleRight, Settings2, ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Thread {
  id: number;
  profile_id: number;
  sender_name: string;
  sender_email: string;
  subject: string | null;
  status: 'open' | 'closed';
  visitor_accepted: number;
  visitor_token: string;
  last_message_at: string;
  created_at: string;
  unread_count: number;
  last_message: string | null;
  profile_username: string;
  profile_name: string | null;
}

interface Message {
  id: number;
  thread_id: number;
  sender: 'visitor' | 'owner';
  body: string;
  is_read: number;
  created_at: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<Thread | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [messagingEnabled, setMessagingEnabled] = useState<boolean>(true);
  const [togglingMessaging, setTogglingMessaging] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeThreadRef = useRef<Thread | null>(null);
  activeThreadRef.current = activeThread;

  // Load profile ID + messaging toggle status
  useEffect(() => {
    fetch('/api/profiles/me', { credentials: 'include' })
      .then(r => r.json())
      .then(async d => {
        if (d.success && d.data.length > 0) {
          const pid = d.data[0].id;
          setProfileId(pid);
          const ps = await fetch(`/api/profiles/${pid}/pin/status`, { credentials: 'include' }).then(r => r.json());
          if (ps.success) setMessagingEnabled(!!ps.data.messaging_enabled);
        }
      });
  }, [user]);

  const loadThreads = useCallback(() => {
    fetch('/api/messages/threads', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setThreads(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/messages/threads', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setThreads(d.data); })
      .finally(() => setLoading(false));
  }, [user]);

  // Poll for new messages in the active thread every 6s
  useEffect(() => {
    if (!activeThread || activeThread.status === 'closed') return;
    const interval = setInterval(async () => {
      const t = activeThreadRef.current;
      if (!t || t.status === 'closed') return;
      try {
        const res = await fetch(`/api/messages/threads/${t.id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data.messages);
          loadThreads();
        }
      } catch { /* silent */ }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeThread?.id, activeThread?.status, loadThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openThread = async (thread: Thread) => {
    setActiveThread(thread);
    setThreadLoading(true);
    setReply('');
    setReplyError('');
    const res = await fetch(`/api/messages/threads/${thread.id}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setMessages(data.data.messages);
      setActiveThread(prev => prev ? { ...prev, ...data.data.thread } : thread);
      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
    }
    setThreadLoading(false);
  };

  const acceptVisitor = async () => {
    if (!activeThread || accepting) return;
    setAccepting(true);
    try {
      await fetch(`/api/messages/threads/${activeThread.id}/accept`, {
        method: 'PATCH', credentials: 'include',
      });
      const updated = { ...activeThread, visitor_accepted: 1 };
      setActiveThread(updated);
      setThreads(prev => prev.map(t => t.id === activeThread.id ? updated : t));
    } finally {
      setAccepting(false);
    }
  };

  const sendReply = async () => {
    if (!activeThread || !reply.trim() || replying) return;
    const body = reply.trim();
    setReplyError('');
    setReplying(true);
    setReply('');
    try {
      const res = await fetch(`/api/messages/threads/${activeThread.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.some(m => m.id === data.data.id) ? prev : [...prev, data.data]);
        setThreads(prev => prev.map(t => t.id === activeThread.id
          ? { ...t, last_message: body, last_message_at: new Date().toISOString() }
          : t
        ));
      } else {
        setReplyError(data.error || 'Failed to send reply');
        setReply(body);
      }
    } catch {
      setReplyError('Network error — please try again');
      setReply(body);
    } finally {
      setReplying(false);
    }
  };

  const toggleStatus = async (thread: Thread) => {
    const newStatus = thread.status === 'open' ? 'closed' : 'open';
    await fetch(`/api/messages/threads/${thread.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    const updated = { ...thread, status: newStatus as 'open' | 'closed' };
    setThreads(prev => prev.map(t => t.id === thread.id ? updated : t));
    if (activeThread?.id === thread.id) setActiveThread(updated);
  };

  const deleteThread = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    await fetch(`/api/messages/threads/${deleteDialog.id}`, { method: 'DELETE', credentials: 'include' });
    setThreads(prev => prev.filter(t => t.id !== deleteDialog.id));
    if (activeThread?.id === deleteDialog.id) setActiveThread(null);
    setDeleteDialog(null);
    setDeleting(false);
  };

  const copyConversationLink = (thread: Thread) => {
    const url = `${window.location.origin}/conversation/${thread.id}?token=${encodeURIComponent(thread.visitor_token)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleToggleMessaging = async (enabled: boolean) => {
    if (!profileId || togglingMessaging) return;
    setTogglingMessaging(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/messaging`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) setMessagingEnabled(!!data.messaging_enabled);
    } finally {
      setTogglingMessaging(false);
    }
  };

  const totalUnread = threads.reduce((s, t) => s + (t.unread_count || 0), 0);

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            {totalUnread > 0 && (
              <Badge className="bg-primary text-white border-0">{totalUnread} new</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">2-way direct messages from your public card visitors</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { loadThreads(); if (activeThread) openThread(activeThread); }}
            className="border-border gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-border gap-1.5">
                <Settings2 className="w-3.5 h-3.5" /> Settings
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border-border">
              <div className="px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Messaging</p>
                  <p className="text-xs text-muted-foreground">Allow visitors to send you messages</p>
                </div>
                <Switch
                  checked={messagingEnabled}
                  onCheckedChange={handleToggleMessaging}
                  disabled={togglingMessaging}
                  className="flex-shrink-0"
                />
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Toggle messaging on/off from your Profile settings too.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messaging disabled banner */}
      {!messagingEnabled && (
        <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <ToggleLeft className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Messaging is turned off</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Visitors cannot send new messages to your card. Existing conversations are still accessible.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-shrink-0 gap-1.5"
            onClick={() => handleToggleMessaging(true)}
            disabled={togglingMessaging}
          >
            <ToggleRight className="w-4 h-4" /> Enable
          </Button>
        </div>
      )}

      {/* Conversation layout */}
      <div className="grid lg:grid-cols-5 gap-4 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Thread list */}
        <div className={`lg:col-span-2 flex flex-col gap-2 overflow-y-auto ${activeThread ? 'hidden lg:flex' : 'flex'}`}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : threads.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  When someone sends you a message from your card, it'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            threads.map(thread => (
              <button
                key={thread.id}
                onClick={() => openThread(thread)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeThread?.id === thread.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                      {thread.sender_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{thread.sender_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{thread.sender_email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{formatTime(thread.last_message_at)}</span>
                    {thread.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {thread.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                {thread.subject && (
                  <p className="text-xs font-medium text-foreground mb-0.5 truncate pl-10">{thread.subject}</p>
                )}
                {thread.last_message && (
                  <p className="text-xs text-muted-foreground truncate pl-10">{thread.last_message}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 pl-10">
                  <Badge className={`text-xs border-0 ${thread.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {thread.status === 'open' ? '● Open' : '● Closed'}
                  </Badge>
                  {!thread.visitor_accepted && thread.status === 'open' && (
                    <Badge className="text-xs border-0 bg-amber-500/10 text-amber-400">Pending</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">@{thread.profile_username}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Thread detail */}
        <div className={`lg:col-span-3 flex flex-col ${activeThread ? 'flex' : 'hidden lg:flex'}`}>
          {!activeThread ? (
            <Card className="bg-card border-border flex-1 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a conversation to view</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border flex-1 flex flex-col overflow-hidden">
              {/* Thread header */}
              <CardHeader className="border-b border-border pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveThread(null)} className="lg:hidden p-1 rounded-lg hover:bg-muted text-muted-foreground">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <CardTitle className="text-base">{activeThread.sender_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a href={`mailto:${activeThread.sender_email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />{activeThread.sender_email}
                        </a>
                        <span className="text-xs text-muted-foreground">· @{activeThread.profile_username}</span>
                      </div>
                      {activeThread.subject && (
                        <p className="text-xs text-muted-foreground mt-0.5">Re: {activeThread.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border gap-1 text-xs h-8"
                      title="Copy visitor conversation link"
                      onClick={() => copyConversationLink(activeThread)}
                    >
                      {copiedLink ? <CheckCheck className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <a
                      href={`/conversation/${activeThread.id}?token=${encodeURIComponent(activeThread.visitor_token)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="border-border h-8 w-8 p-0" title="Open visitor view">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`border-border gap-1.5 text-xs h-8 ${activeThread.status === 'open' ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10' : 'text-green-400 border-green-500/30 hover:bg-green-500/10'}`}
                      onClick={() => toggleStatus(activeThread)}
                    >
                      {activeThread.status === 'open'
                        ? <><Lock className="w-3 h-3" /> Close</>
                        : <><Unlock className="w-3 h-3" /> Reopen</>
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                      onClick={() => setDeleteDialog(activeThread)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Accept banner */}
              {!activeThread.visitor_accepted && activeThread.status === 'open' && (
                <div className="border-b border-border bg-amber-500/5 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">New message from an unverified visitor</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Accept to open 2-way live chat. The visitor will be able to reply directly in their browser.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={acceptVisitor}
                    disabled={accepting}
                    className="bg-primary gap-1.5 flex-shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {accepting ? 'Accepting…' : 'Accept'}
                  </Button>
                </div>
              )}

              {/* Accepted badge */}
              {activeThread.visitor_accepted && activeThread.status === 'open' && (
                <div className="border-b border-border bg-green-500/5 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-green-400" />
                  <p className="text-xs text-green-400">Live 2-way conversation — visitor can reply in their browser</p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {threadLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.sender === 'owner'
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'owner' ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              <div className="border-t border-border p-4 flex-shrink-0">
                {activeThread.status === 'closed' ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground flex-1">This conversation is closed.</p>
                    <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 flex-shrink-0 gap-1"
                      onClick={() => toggleStatus(activeThread)}>
                      <Unlock className="w-3 h-3" /> Reopen
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {replyError && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive mb-2">
                          <AlertCircle className="w-3.5 h-3.5" />{replyError}
                        </div>
                      )}
                      <Textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Type your reply… (⌘+Enter to send)"
                        className="bg-background border-border resize-none text-sm"
                        rows={3}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={sendReply}
                      disabled={replying || !reply.trim()}
                      className="bg-primary self-end gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      {replying ? 'Sending…' : 'Send'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" /> Delete Conversation
            </DialogTitle>
            <DialogDescription>
              Delete the conversation with <strong>{deleteDialog?.sender_name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="border-border">Cancel</Button>
            <Button onClick={deleteThread} disabled={deleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
