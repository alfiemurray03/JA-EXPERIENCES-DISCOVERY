import { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  Activity, AlertTriangle, Bot, CheckCircle2, CircleOff, Database,
  Eye, Loader2, MessageCircle, Paintbrush, Plus, RefreshCw, Save,
  Search, Settings2, ShieldCheck, Sparkles, Trash2, UserRound, Wrench,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Article {
  id: string; category: string; title: string; summary: string; answer: string;
  keywords: string[]; steps: string[]; href: string;
}

interface ChatbotSettings {
  enabled: boolean; maintenanceEnabled: boolean; maintenanceMessage: string;
  allowAnonymous: boolean; selfHelpEnabled: boolean; escalationEnabled: boolean;
  debugEnabled: boolean; assistantName: string; welcomeMessage: string;
  responseTime: string; maxSelfHelpTurns: number; provider: 'built_in' | 'workers_ai';
  model: string; tone: 'friendly' | 'professional' | 'concise'; escalationPrompt: string;
  position: 'bottom-right' | 'bottom-left'; primaryColor: string; accentColor: string;
  panelWidth: number; panelHeight: number; borderRadius: number; launcherSize: number;
  launcherLabel: string; inputPlaceholder: string; showPoweredBy: boolean;
  autoOpenDelaySeconds: number; knowledge: Article[];
}

interface Conversation {
  session_id: string; customer_email?: string; visitor_type: string; status: string;
  category?: string; provider?: string; model?: string; message_count: number;
  last_user_message?: string; last_assistant_message?: string; matched_article?: string;
  enquiry_reference?: string; page_path?: string; country?: string; user_agent?: string;
  started_at: string; last_activity: string; ended_at?: string;
}

interface TranscriptMessage {
  id: string; role: string; message: string; response_source?: string;
  matched_article?: string; escalated?: number; created_at: string;
}

interface ChatbotStats {
  total: number; active: number; escalated: number; resolved: number;
  abandoned: number; anonymous: number; authenticated: number; today: number; messages: number;
}

interface Diagnostics {
  database: boolean; workersAiBinding: boolean; provider: string; model: string;
  debugEnabled: boolean; maintenanceEnabled: boolean;
}

type Tab = 'overview' | 'behaviour' | 'design' | 'knowledge' | 'conversations' | 'diagnostics';

const BASE_ARTICLES: Article[] = [
  {
    id: 'sign-in', category: 'Account & access', title: 'Sign-in and Microsoft account help',
    summary: 'Resolve common JA Group Services ID sign-in problems.',
    answer: 'Use Log In and complete Microsoft sign-in in the same browser. Close duplicate tabs and allow essential cookies before trying again.',
    keywords: ['login', 'sign in', 'microsoft', 'session', 'cookies'],
    steps: ['Close duplicate sign-in tabs.', 'Choose Log In.', 'Complete Microsoft sign-in in the same browser.'], href: '/help-centre',
  },
  {
    id: 'billing', category: 'Billing & subscriptions', title: 'Subscriptions, plans and invoices',
    summary: 'Understand plans, renewals and invoices.',
    answer: 'Open Settings and choose Billing to review your plan, renewal information and invoices.',
    keywords: ['billing', 'plan', 'invoice', 'stripe', 'payment'],
    steps: ['Open Settings.', 'Choose Billing.', 'Review your plan and invoices.'], href: '/help-centre',
  },
  {
    id: 'technical', category: 'Technical support', title: 'Website or builder not working',
    summary: 'Safe checks for loading, saving and preview problems.',
    answer: 'Refresh once, confirm you are signed in and retry in one browser tab. Create an enquiry if the same error continues.',
    keywords: ['error', 'not working', 'loading', 'save', 'preview'],
    steps: ['Refresh once.', 'Confirm sign-in.', 'Create an enquiry if it continues.'], href: '/help-centre',
  },
];

const DEFAULT_SETTINGS: ChatbotSettings = {
  enabled: true,
  maintenanceEnabled: false,
  maintenanceMessage: 'The Help Centre assistant is undergoing maintenance. You can still send a Contact Enquiry.',
  allowAnonymous: true,
  selfHelpEnabled: true,
  escalationEnabled: true,
  debugEnabled: false,
  assistantName: 'JA Support Assistant',
  welcomeMessage: 'Hello! I can help you find an answer in the JA Plan Studio Help Centre. What do you need help with?',
  responseTime: 'within 2 working days',
  maxSelfHelpTurns: 3,
  provider: 'built_in',
  model: '',
  tone: 'friendly',
  escalationPrompt: 'I can send this to the JA Plan Studio team as a Contact Enquiry.',
  position: 'bottom-right',
  primaryColor: '#2563eb',
  accentColor: '#dbeafe',
  panelWidth: 430,
  panelHeight: 680,
  borderRadius: 18,
  launcherSize: 56,
  launcherLabel: 'Help',
  inputPlaceholder: 'Ask a Help Centre question…',
  showPoweredBy: true,
  autoOpenDelaySeconds: 0,
  knowledge: BASE_ARTICLES,
};

const EMPTY_STATS: ChatbotStats = {
  total: 0, active: 0, escalated: 0, resolved: 0, abandoned: 0,
  anonymous: 0, authenticated: 0, today: 0, messages: 0,
};

function bool(value: string | undefined, fallback: boolean) {
  return value === undefined ? fallback : value === 'true';
}

function parseKnowledge(value?: string): Article[] {
  try {
    const parsed = JSON.parse(value || '[]') as Article[];
    return Array.isArray(parsed) && parsed.length ? parsed : BASE_ARTICLES;
  } catch {
    return BASE_ARTICLES;
  }
}

function fromRecord(record: Record<string, string>): ChatbotSettings {
  return {
    enabled: bool(record.ai_chatbot_enabled, true),
    maintenanceEnabled: bool(record.ai_chatbot_maintenance_enabled, false),
    maintenanceMessage: record.ai_chatbot_maintenance_message || DEFAULT_SETTINGS.maintenanceMessage,
    allowAnonymous: bool(record.ai_chatbot_allow_anonymous, true),
    selfHelpEnabled: bool(record.ai_chatbot_self_help_enabled, true),
    escalationEnabled: bool(record.ai_chatbot_escalation_enabled, true),
    debugEnabled: bool(record.ai_chatbot_debug_enabled, false),
    assistantName: record.ai_chatbot_name || DEFAULT_SETTINGS.assistantName,
    welcomeMessage: record.ai_chatbot_welcome_message || DEFAULT_SETTINGS.welcomeMessage,
    responseTime: record.ai_chatbot_response_time || DEFAULT_SETTINGS.responseTime,
    maxSelfHelpTurns: Number(record.ai_chatbot_max_self_help_turns || 3),
    provider: record.ai_chatbot_provider === 'workers_ai' ? 'workers_ai' : 'built_in',
    model: record.ai_chatbot_model || '',
    tone: ['friendly', 'professional', 'concise'].includes(record.ai_chatbot_tone)
      ? record.ai_chatbot_tone as ChatbotSettings['tone'] : 'friendly',
    escalationPrompt: record.ai_chatbot_escalation_prompt || DEFAULT_SETTINGS.escalationPrompt,
    position: record.ai_chatbot_position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
    primaryColor: record.ai_chatbot_primary_color || '#2563eb',
    accentColor: record.ai_chatbot_accent_color || '#dbeafe',
    panelWidth: Number(record.ai_chatbot_panel_width || 430),
    panelHeight: Number(record.ai_chatbot_panel_height || 680),
    borderRadius: Number(record.ai_chatbot_border_radius || 18),
    launcherSize: Number(record.ai_chatbot_launcher_size || 56),
    launcherLabel: record.ai_chatbot_launcher_label || 'Help',
    inputPlaceholder: record.ai_chatbot_input_placeholder || DEFAULT_SETTINGS.inputPlaceholder,
    showPoweredBy: bool(record.ai_chatbot_show_powered_by, true),
    autoOpenDelaySeconds: Number(record.ai_chatbot_auto_open_delay_seconds || 0),
    knowledge: parseKnowledge(record.ai_chatbot_knowledge_json),
  };
}

function toRecord(settings: ChatbotSettings): Record<string, string> {
  return {
    ai_chatbot_enabled: String(settings.enabled),
    ai_chatbot_maintenance_enabled: String(settings.maintenanceEnabled),
    ai_chatbot_maintenance_message: settings.maintenanceMessage,
    ai_chatbot_allow_anonymous: String(settings.allowAnonymous),
    ai_chatbot_self_help_enabled: String(settings.selfHelpEnabled),
    ai_chatbot_escalation_enabled: String(settings.escalationEnabled),
    ai_chatbot_debug_enabled: String(settings.debugEnabled),
    ai_chatbot_name: settings.assistantName,
    ai_chatbot_welcome_message: settings.welcomeMessage,
    ai_chatbot_response_time: settings.responseTime,
    ai_chatbot_max_self_help_turns: String(settings.maxSelfHelpTurns),
    ai_chatbot_provider: settings.provider,
    ai_chatbot_model: settings.model,
    ai_chatbot_tone: settings.tone,
    ai_chatbot_escalation_prompt: settings.escalationPrompt,
    ai_chatbot_position: settings.position,
    ai_chatbot_primary_color: settings.primaryColor,
    ai_chatbot_accent_color: settings.accentColor,
    ai_chatbot_panel_width: String(settings.panelWidth),
    ai_chatbot_panel_height: String(settings.panelHeight),
    ai_chatbot_border_radius: String(settings.borderRadius),
    ai_chatbot_launcher_size: String(settings.launcherSize),
    ai_chatbot_launcher_label: settings.launcherLabel,
    ai_chatbot_input_placeholder: settings.inputPlaceholder,
    ai_chatbot_show_powered_by: String(settings.showPoweredBy),
    ai_chatbot_auto_open_delay_seconds: String(settings.autoOpenDelaySeconds),
    ai_chatbot_knowledge_json: JSON.stringify(settings.knowledge),
  };
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (value: boolean) => void; label: string; description: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/40">
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800', escalated: 'bg-amber-100 text-amber-800',
    resolved: 'bg-blue-100 text-blue-800', completed: 'bg-violet-100 text-violet-800',
    abandoned: 'bg-slate-200 text-slate-700',
  };
  return <Badge className={classes[status] || 'bg-slate-100 text-slate-700'}>{status}</Badge>;
}

export default function AIChatbotControlCenter() {
  const [tab, setTab] = useState<Tab>('overview');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [selectedArticle, setSelectedArticle] = useState(0);
  const [testQuestion, setTestQuestion] = useState('');
  const [testReply, setTestReply] = useState('');
  const [testing, setTesting] = useState(false);

  const article = settings.knowledge[selectedArticle] || settings.knowledge[0];
  const liveState = !settings.enabled ? 'Off' : settings.maintenanceEnabled ? 'Maintenance' : 'Live';

  function patch<K extends keyof ChatbotSettings>(key: K, value: ChatbotSettings[K]) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  function patchArticle<K extends keyof Article>(key: K, value: Article[K]) {
    setSettings(current => ({
      ...current,
      knowledge: current.knowledge.map((item, index) => index === selectedArticle ? { ...item, [key]: value } : item),
    }));
  }

  async function loadSettings() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/site-settings', { credentials: 'include' });
      const data = await response.json() as { success?: boolean; settings?: Record<string, string>; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Chatbot settings could not be loaded.');
      setSettings(fromRecord(data.settings || {}));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chatbot settings could not be loaded.');
    } finally { setLoading(false); }
  }

  async function saveSettings() {
    setSaving(true); setNotice(''); setError('');
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ settings: toRecord(settings) }),
      });
      const data = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Chatbot settings could not be saved.');
      setNotice('Chatbot settings saved and published.');
      await loadMonitor();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chatbot settings could not be saved.');
    } finally { setSaving(false); }
  }

  async function loadMonitor() {
    setMonitorLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, search, limit: '100' });
      const response = await fetch(`/api/admin/support-assistant?${params}`, { credentials: 'include' });
      const data = await response.json() as {
        success?: boolean; error?: string; conversations?: Conversation[];
        stats?: ChatbotStats; diagnostics?: Diagnostics;
      };
      if (!response.ok || !data.success) throw new Error(data.error || 'Conversation monitoring could not be loaded.');
      setConversations(data.conversations || []);
      setStats(data.stats || EMPTY_STATS);
      setDiagnostics(data.diagnostics || null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Conversation monitoring could not be loaded.');
    } finally { setMonitorLoading(false); }
  }

  async function openConversation(item: Conversation) {
    setSelected(item); setMessages([]);
    try {
      const response = await fetch(`/api/admin/support-assistant/${encodeURIComponent(item.session_id)}`, { credentials: 'include' });
      const data = await response.json() as { success?: boolean; messages?: TranscriptMessage[]; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Transcript could not be loaded.');
      setMessages(data.messages || []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Transcript could not be loaded.');
    }
  }

  async function changeConversation(item: Conversation, action: 'status' | 'delete', nextStatus = 'completed') {
    if (action === 'delete' && !window.confirm('Delete this chatbot conversation and transcript?')) return;
    const response = await fetch(`/api/admin/support-assistant/${encodeURIComponent(item.session_id)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(action === 'delete' ? { action: 'delete' } : { action: 'set_status', status: nextStatus }),
    });
    const data = await response.json() as { success?: boolean; error?: string };
    if (!response.ok || !data.success) { setError(data.error || 'Conversation could not be updated.'); return; }
    setSelected(null); setMessages([]); await loadMonitor();
  }

  async function purgeAbandoned() {
    if (!window.confirm('Delete abandoned conversations older than 30 days?')) return;
    const response = await fetch('/api/admin/support-assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ action: 'purge_abandoned', days: 30 }),
    });
    const data = await response.json() as { success?: boolean; deleted?: number; error?: string };
    if (!response.ok || !data.success) { setError(data.error || 'Old conversations could not be deleted.'); return; }
    setNotice(`${data.deleted || 0} old abandoned conversations deleted.`); await loadMonitor();
  }

  async function runTest() {
    if (testQuestion.trim().length < 2) return;
    setTesting(true); setTestReply('');
    try {
      const response = await fetch('/api/support-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ sessionId: `admin-test-${Date.now()}`, message: testQuestion, history: [], pagePath: '/admin/ai-chatbot' }),
      });
      const data = await response.json() as { success?: boolean; reply?: string; error?: string };
      setTestReply(data.success ? data.reply || 'No reply returned.' : data.error || 'Test failed.');
    } catch { setTestReply('The runtime test could not be completed.'); }
    finally { setTesting(false); }
  }

  useEffect(() => { void Promise.all([loadSettings(), loadMonitor()]); }, []);
  useEffect(() => {
    if (tab !== 'conversations') return;
    const timer = window.setInterval(() => void loadMonitor(), 15_000);
    return () => window.clearInterval(timer);
  }, [tab, statusFilter, search]);

  const nav = useMemo(() => [
    ['overview', 'Overview', Activity], ['behaviour', 'Behaviour', Settings2],
    ['design', 'Design', Paintbrush], ['knowledge', 'Knowledge', Sparkles],
    ['conversations', 'Conversations', MessageCircle], ['diagnostics', 'Diagnostics', Wrench],
  ] as const, []);

  const statCards = [
    ['Active now', stats.active, Activity], ['Today', stats.today, MessageCircle],
    ['Escalated', stats.escalated, AlertTriangle], ['Resolved', stats.resolved, CheckCircle2],
    ['Anonymous', stats.anonymous, UserRound], ['Messages', stats.messages, Bot],
  ] as const;

  return (
    <>
      <Helmet><title>AI Chatbot Control Centre — Admin Portal</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <AdminLayout title="AI Chatbot" subtitle="Control, monitor and debug the JA Plan Studio Help Centre assistant">
        <div className="mx-auto max-w-7xl space-y-6 pb-20 lg:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">AI Chatbot Control Centre</h1><Badge className={liveState === 'Live' ? 'bg-green-100 text-green-800' : liveState === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}>{liveState}</Badge></div>
              <p className="mt-1 text-sm text-muted-foreground">Full operational control, design, Help Centre knowledge and live conversation monitoring.</p>
            </div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => void Promise.all([loadSettings(), loadMonitor()])}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button><Button onClick={() => void saveSettings()} disabled={saving || loading}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save & publish</Button></div>
          </div>

          {notice && <Alert className="border-green-200 bg-green-50 text-green-800"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{notice}</AlertDescription></Alert>}
          {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          <div className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-2">
            {nav.map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setTab(value)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === value ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-4 w-4" />{label}</button>)}
          </div>

          {loading ? <Card><CardContent className="flex h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card> : <>
            {tab === 'overview' && <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{statCards.map(([label, value, Icon]) => <Card key={label}><CardContent className="p-4"><Icon className="h-4 w-4 text-blue-600" /><p className="mt-3 text-2xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></CardContent></Card>)}</div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card><CardHeader><CardTitle className="text-base">Service state</CardTitle></CardHeader><CardContent className="space-y-3"><Toggle checked={settings.enabled} onChange={value => patch('enabled', value)} label="Chatbot enabled" description="Master switch for the public chatbot." /><Toggle checked={settings.maintenanceEnabled} onChange={value => patch('maintenanceEnabled', value)} label="Maintenance mode" description="Show a maintenance message while retaining enquiry escalation." /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Access</CardTitle></CardHeader><CardContent className="space-y-3"><Toggle checked={settings.allowAnonymous} onChange={value => patch('allowAnonymous', value)} label="Anonymous visitors" description="Allow signed-out visitors to use the chatbot and submit enquiries." /><Toggle checked={settings.escalationEnabled} onChange={value => patch('escalationEnabled', value)} label="Contact Enquiry escalation" description="Allow unresolved conversations to create an ENQ reference." /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Provider</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span>Selected engine</span><strong>{settings.provider === 'workers_ai' ? 'Workers AI' : 'Built-in'}</strong></div><div className="flex justify-between"><span>AI binding</span><strong>{diagnostics?.workersAiBinding ? 'Connected' : 'Not connected'}</strong></div><div className="flex justify-between"><span>Knowledge articles</span><strong>{settings.knowledge.length}</strong></div><div className="flex justify-between"><span>Debug logging</span><strong>{settings.debugEnabled ? 'On' : 'Off'}</strong></div></CardContent></Card>
              </div>
            </div>}

            {tab === 'behaviour' && <div className="grid gap-5 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Availability and access</CardTitle></CardHeader><CardContent className="space-y-3"><Toggle checked={settings.enabled} onChange={value => patch('enabled', value)} label="Enable chatbot" description="Display and run the assistant on public and customer pages." /><Toggle checked={settings.maintenanceEnabled} onChange={value => patch('maintenanceEnabled', value)} label="Maintenance mode" description="Pause AI answers while keeping the maintenance notice and optional enquiry form." /><Toggle checked={settings.allowAnonymous} onChange={value => patch('allowAnonymous', value)} label="Allow anonymous visitors" description="No Microsoft sign-in is required for help or Contact Enquiries." /><Toggle checked={settings.selfHelpEnabled} onChange={value => patch('selfHelpEnabled', value)} label="Help Centre self-service" description="Search configured articles before escalation." /><Toggle checked={settings.escalationEnabled} onChange={value => patch('escalationEnabled', value)} label="Escalate to Contact Enquiries" description="Create ENQ references for unresolved requests." /><Toggle checked={settings.debugEnabled} onChange={value => patch('debugEnabled', value)} label="Debug logging" description="Log provider failures and detailed runtime diagnostics." /></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Messages and reasoning</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Assistant name</Label><Input value={settings.assistantName} onChange={event => patch('assistantName', event.target.value)} /></div><div><Label>Welcome message</Label><Textarea rows={4} value={settings.welcomeMessage} onChange={event => patch('welcomeMessage', event.target.value)} /></div><div><Label>Maintenance message</Label><Textarea rows={3} value={settings.maintenanceMessage} onChange={event => patch('maintenanceMessage', event.target.value)} /></div><div><Label>Escalation message</Label><Textarea rows={3} value={settings.escalationPrompt} onChange={event => patch('escalationPrompt', event.target.value)} /></div><div className="grid grid-cols-2 gap-3"><div><Label>Published response time</Label><Input value={settings.responseTime} onChange={event => patch('responseTime', event.target.value)} /></div><div><Label>Self-help attempts</Label><Input type="number" min={1} max={8} value={settings.maxSelfHelpTurns} onChange={event => patch('maxSelfHelpTurns', Number(event.target.value))} /></div></div><div className="grid grid-cols-2 gap-3"><div><Label>Answer tone</Label><Select value={settings.tone} onValueChange={value => patch('tone', value as ChatbotSettings['tone'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="friendly">Friendly</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="concise">Concise</SelectItem></SelectContent></Select></div><div><Label>Response engine</Label><Select value={settings.provider} onValueChange={value => patch('provider', value as ChatbotSettings['provider'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="built_in">Built-in Help Centre</SelectItem><SelectItem value="workers_ai">Cloudflare Workers AI</SelectItem></SelectContent></Select></div></div>{settings.provider === 'workers_ai' && <div><Label>Workers AI model</Label><Input value={settings.model} onChange={event => patch('model', event.target.value)} placeholder="@cf/meta/llama-3.1-8b-instruct" /></div>}</CardContent></Card>
            </div>}

            {tab === 'design' && <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
              <Card><CardHeader><CardTitle className="text-base">Widget appearance</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><Label>Primary colour</Label><div className="flex gap-2"><Input type="color" value={settings.primaryColor} onChange={event => patch('primaryColor', event.target.value)} className="w-14 p-1" /><Input value={settings.primaryColor} onChange={event => patch('primaryColor', event.target.value)} /></div></div><div><Label>Accent colour</Label><div className="flex gap-2"><Input type="color" value={settings.accentColor} onChange={event => patch('accentColor', event.target.value)} className="w-14 p-1" /><Input value={settings.accentColor} onChange={event => patch('accentColor', event.target.value)} /></div></div></div><div className="grid grid-cols-2 gap-3"><div><Label>Screen position</Label><Select value={settings.position} onValueChange={value => patch('position', value as ChatbotSettings['position'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bottom-right">Bottom right</SelectItem><SelectItem value="bottom-left">Bottom left</SelectItem></SelectContent></Select></div><div><Label>Launcher label</Label><Input value={settings.launcherLabel} onChange={event => patch('launcherLabel', event.target.value)} /></div></div><div><Label>Input placeholder</Label><Input value={settings.inputPlaceholder} onChange={event => patch('inputPlaceholder', event.target.value)} /></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><div><Label>Panel width</Label><Input type="number" min={340} max={560} value={settings.panelWidth} onChange={event => patch('panelWidth', Number(event.target.value))} /></div><div><Label>Panel height</Label><Input type="number" min={480} max={820} value={settings.panelHeight} onChange={event => patch('panelHeight', Number(event.target.value))} /></div><div><Label>Corner radius</Label><Input type="number" min={0} max={32} value={settings.borderRadius} onChange={event => patch('borderRadius', Number(event.target.value))} /></div><div><Label>Button size</Label><Input type="number" min={44} max={72} value={settings.launcherSize} onChange={event => patch('launcherSize', Number(event.target.value))} /></div></div><div><Label>Auto-open delay in seconds</Label><Input type="number" min={0} max={120} value={settings.autoOpenDelaySeconds} onChange={event => patch('autoOpenDelaySeconds', Number(event.target.value))} /><p className="mt-1 text-xs text-muted-foreground">Use 0 to disable automatic opening.</p></div><Toggle checked={settings.showPoweredBy} onChange={value => patch('showPoweredBy', value)} label="Show service attribution" description="Show the JA Plan Studio Help Centre attribution under the input." /></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Live preview</CardTitle></CardHeader><CardContent><div className="overflow-hidden border bg-white text-slate-950 shadow-xl" style={{ borderRadius: settings.borderRadius }}><div className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: settings.primaryColor }}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Bot className="h-5 w-5" /></span><div><p className="text-sm font-bold">{settings.assistantName}</p><p className="text-[11px] text-white/80">Team replies {settings.responseTime}</p></div></div><div className="min-h-64 bg-slate-50 p-4"><div className="max-w-[88%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm">{settings.welcomeMessage}</div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full border bg-white px-3 py-1.5 text-xs" style={{ color: settings.primaryColor, borderColor: settings.accentColor }}>Account or sign-in</span><span className="rounded-full border bg-white px-3 py-1.5 text-xs" style={{ color: settings.primaryColor, borderColor: settings.accentColor }}>Technical problem</span></div></div><div className="border-t border-slate-200 p-3"><div className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-400">{settings.inputPlaceholder}</div></div></div></CardContent></Card>
            </div>}

            {tab === 'knowledge' && <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
              <Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Help Centre articles</CardTitle><Button size="sm" variant="outline" onClick={() => { const next: Article = { id: `article-${Date.now()}`, category: 'General', title: 'New article', summary: '', answer: '', keywords: [], steps: [], href: '/help-centre' }; setSettings(current => ({ ...current, knowledge: [...current.knowledge, next] })); setSelectedArticle(settings.knowledge.length); }}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button></div></CardHeader><CardContent className="space-y-2">{settings.knowledge.map((item, index) => <button key={item.id} type="button" onClick={() => setSelectedArticle(index)} className={`w-full rounded-lg border p-3 text-left ${selectedArticle === index ? 'border-blue-500 bg-blue-50' : 'border-border hover:bg-muted'}`}><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.category}</p></button>)}</CardContent></Card>
              {article && <Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Edit article</CardTitle><Button variant="destructive" size="sm" disabled={settings.knowledge.length <= 1} onClick={() => { setSettings(current => ({ ...current, knowledge: current.knowledge.filter((_, index) => index !== selectedArticle) })); setSelectedArticle(Math.max(0, selectedArticle - 1)); }}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button></div></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><Label>Article ID</Label><Input value={article.id} onChange={event => patchArticle('id', event.target.value)} /></div><div><Label>Category</Label><Input value={article.category} onChange={event => patchArticle('category', event.target.value)} /></div></div><div><Label>Title</Label><Input value={article.title} onChange={event => patchArticle('title', event.target.value)} /></div><div><Label>Search-result summary</Label><Textarea rows={2} value={article.summary} onChange={event => patchArticle('summary', event.target.value)} /></div><div><Label>Approved self-help answer</Label><Textarea rows={5} value={article.answer} onChange={event => patchArticle('answer', event.target.value)} /></div><div><Label>Keywords, separated by commas</Label><Input value={article.keywords.join(', ')} onChange={event => patchArticle('keywords', event.target.value.split(',').map(value => value.trim()).filter(Boolean))} /></div><div><Label>Steps, one per line</Label><Textarea rows={5} value={article.steps.join('\n')} onChange={event => patchArticle('steps', event.target.value.split('\n').map(value => value.trim()).filter(Boolean))} /></div><div><Label>Help Centre link</Label><Input value={article.href} onChange={event => patchArticle('href', event.target.value)} /></div></CardContent></Card>}
            </div>}

            {tab === 'conversations' && <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{statCards.map(([label, value, Icon]) => <Card key={label}><CardContent className="p-4"><Icon className="h-4 w-4 text-blue-600" /><p className="mt-3 text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></CardContent></Card>)}</div>
              <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="text-base">Conversation monitor</CardTitle><div className="flex flex-wrap gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Email, message, ENQ or session" className="w-64 pl-9" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="escalated">Escalated</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="abandoned">Abandoned</SelectItem></SelectContent></Select><Button variant="outline" onClick={() => void loadMonitor()} disabled={monitorLoading}>{monitorLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Refresh</Button><Button variant="outline" onClick={() => void purgeAbandoned()}><Trash2 className="mr-2 h-4 w-4" />Purge old</Button></div></div></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="p-3">Visitor</th><th className="p-3">Status</th><th className="p-3">Last question</th><th className="p-3">Provider</th><th className="p-3">Activity</th><th className="p-3">Action</th></tr></thead><tbody>{conversations.map(item => <tr key={item.session_id} className="border-b last:border-0"><td className="p-3"><p className="font-medium text-foreground">{item.customer_email || 'Anonymous visitor'}</p><p className="text-xs text-muted-foreground">{item.country || '—'} · {item.page_path || '/'}</p></td><td className="p-3"><StatusBadge status={item.status} />{item.enquiry_reference && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{item.enquiry_reference}</p>}</td><td className="max-w-md p-3"><p className="line-clamp-2">{item.last_user_message || 'Conversation opened'}</p><p className="mt-1 text-xs text-muted-foreground">{item.message_count || 0} messages</p></td><td className="p-3">{item.provider || 'built-in'}</td><td className="p-3 text-xs">{new Date(item.last_activity).toLocaleString('en-GB')}</td><td className="p-3"><Button size="sm" variant="outline" onClick={() => void openConversation(item)}><Eye className="mr-1 h-3.5 w-3.5" />View</Button></td></tr>)}{!conversations.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No chatbot conversations match the current filters.</td></tr>}</tbody></table></div></CardContent></Card>
              {selected && <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base">Conversation transcript</CardTitle><p className="mt-1 font-mono text-xs text-muted-foreground">{selected.session_id}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void changeConversation(selected, 'status', 'resolved')}>Mark resolved</Button><Button size="sm" variant="outline" onClick={() => void changeConversation(selected, 'status', 'completed')}>Complete</Button><Button size="sm" variant="destructive" onClick={() => void changeConversation(selected, 'delete')}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button></div></div></CardHeader><CardContent><div className="space-y-3">{messages.map(message => <div key={message.id} className={`rounded-xl border p-3 ${message.role === 'user' ? 'ml-8 border-blue-200 bg-blue-50' : 'mr-8 border-border bg-muted/40'}`}><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide">{message.role}</p><p className="text-[10px] text-muted-foreground">{new Date(message.created_at).toLocaleString('en-GB')}</p></div><p className="mt-2 whitespace-pre-wrap text-sm">{message.message}</p>{message.response_source && <p className="mt-2 text-[10px] text-muted-foreground">Source: {message.response_source}{message.matched_article ? ` · Article: ${message.matched_article}` : ''}</p>}</div>)}{!messages.length && <p className="text-sm text-muted-foreground">No transcript messages are available.</p>}</div></CardContent></Card>}
            </div>}

            {tab === 'diagnostics' && <div className="grid gap-5 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Runtime diagnostics</CardTitle></CardHeader><CardContent className="space-y-3">{[['Database monitoring', diagnostics?.database, Database], ['Workers AI binding', diagnostics?.workersAiBinding, Sparkles], ['Chatbot enabled', settings.enabled, Bot], ['Maintenance mode off', !settings.maintenanceEnabled, Wrench], ['Anonymous access', settings.allowAnonymous, ShieldCheck], ['Debug logging', settings.debugEnabled, Activity]].map(([label, healthy, Icon]) => { const TypedIcon = Icon as typeof Activity; return <div key={String(label)} className="flex items-center justify-between rounded-lg border border-border p-3"><span className="flex items-center gap-2 text-sm"><TypedIcon className="h-4 w-4 text-muted-foreground" />{String(label)}</span>{healthy ? <Badge className="bg-green-100 text-green-800">Available</Badge> : <Badge className="bg-slate-200 text-slate-700">Unavailable / off</Badge>}</div>; })}<div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground"><p>Provider: <strong className="text-foreground">{diagnostics?.provider || settings.provider}</strong></p><p className="mt-1">Model: <strong className="text-foreground">{diagnostics?.model || settings.model || 'Not configured'}</strong></p></div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Live runtime test</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Send a test question through the same production assistant endpoint used by visitors.</p><Textarea rows={4} value={testQuestion} onChange={event => setTestQuestion(event.target.value)} placeholder="For example: I cannot sign in with Microsoft" /><Button onClick={() => void runTest()} disabled={testing || testQuestion.trim().length < 2}>{testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Run test</Button>{testReply && <div className="whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 text-sm">{testReply}</div>}<Alert><CircleOff className="h-4 w-4" /><AlertDescription>Tests are recorded as Admin test conversations so provider failures and answer quality can be audited.</AlertDescription></Alert></CardContent></Card>
            </div>}
          </>}
        </div>
      </AdminLayout>
    </>
  );
}
