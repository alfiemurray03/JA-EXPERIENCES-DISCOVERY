import { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Database,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface KnowledgeArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  answer: string;
  keywords: string[];
  steps: string[];
  href: string;
}

interface ChatbotSettings {
  enabled: boolean;
  allowAnonymous: boolean;
  selfHelpEnabled: boolean;
  escalationEnabled: boolean;
  assistantName: string;
  welcomeMessage: string;
  responseTime: string;
  maxSelfHelpTurns: number;
  provider: 'built_in' | 'workers_ai';
  model: string;
  tone: 'friendly' | 'professional' | 'concise';
  escalationPrompt: string;
  knowledge: KnowledgeArticle[];
}

const DEFAULT_KNOWLEDGE: KnowledgeArticle[] = [
  {
    id: 'account-details',
    category: 'Account & access',
    title: 'Update your personal details',
    summary: 'Change your name, contact details and Microsoft account information safely.',
    answer: 'Open your customer Settings and select Profile. Update the available fields, save the changes, and wait for the confirmation before leaving the page.',
    keywords: ['account', 'profile', 'personal', 'name', 'email', 'details', 'change', 'update'],
    steps: ['Open Settings and choose Profile.', 'Update the details you need.', 'Select Save changes and wait for confirmation.'],
    href: '/support',
  },
  {
    id: 'sign-in',
    category: 'Account & access',
    title: 'Sign-in and Microsoft account help',
    summary: 'Resolve common JA Group Services ID sign-in, session and account-access problems.',
    answer: 'Use the Log In button and complete Microsoft sign-in in the same browser. If you are returned to the website without being signed in, close duplicate tabs, allow essential cookies, and try once more.',
    keywords: ['login', 'log in', 'sign in', 'microsoft', 'session', 'account access', 'cookies'],
    steps: ['Close duplicate sign-in tabs.', 'Return to the website and choose Log In.', 'Complete Microsoft sign-in in the same browser.'],
    href: '/support',
  },
  {
    id: 'billing',
    category: 'Billing & subscriptions',
    title: 'Subscriptions, plans and invoices',
    summary: 'Understand your plan, renewal date, invoices and secure Stripe billing access.',
    answer: 'Open Settings and choose Billing. You can review the active plan, renewal information and invoices, or open the secure Stripe billing portal where available.',
    keywords: ['billing', 'subscription', 'plan', 'invoice', 'payment', 'stripe', 'renewal', 'refund'],
    steps: ['Open Settings and choose Billing.', 'Review the plan, renewal date and invoices.', 'Use the secure billing portal for supported changes.'],
    href: '/support',
  },
  {
    id: 'builders',
    category: 'Builders & plans',
    title: 'Create, save and preview a plan',
    summary: 'Choose a builder, answer its guided questions, preview the result and save your plan.',
    answer: 'Open Explore Builders, choose a planning template and complete each guided step. Use Preview before saving, then save the plan to your customer account.',
    keywords: ['builder', 'plan', 'template', 'save', 'preview', 'download', 'create', 'guided'],
    steps: ['Open Explore Builders.', 'Choose a template and complete the guided questions.', 'Preview the result, then save it to your account.'],
    href: '/support',
  },
  {
    id: 'privacy',
    category: 'Privacy & data',
    title: 'Privacy and data requests',
    summary: 'Request access, correction, deletion or another data-protection action.',
    answer: 'Open Privacy & Data in your account and choose the appropriate request type. Provide enough detail for the team to identify the information and track the request from the same page.',
    keywords: ['privacy', 'data', 'gdpr', 'delete', 'deletion', 'access request', 'dsar', 'correction'],
    steps: ['Open Privacy & Data.', 'Choose the request type and provide the requested details.', 'Track the request from your account.'],
    href: '/privacy-settings',
  },
  {
    id: 'technical',
    category: 'Technical support',
    title: 'Website or builder not working',
    summary: 'Try safe checks for loading, saving, preview and browser errors.',
    answer: 'Refresh the page once, confirm you are still signed in, and retry in a single browser tab. If the same error continues, create an enquiry with the page, time and exact message shown.',
    keywords: ['error', 'not working', 'broken', 'blank', 'loading', 'save', 'preview', 'download', 'browser'],
    steps: ['Refresh the affected page once.', 'Confirm you are signed in and use one browser tab.', 'Create an enquiry if the same error continues.'],
    href: '/support',
  },
];

const DEFAULT_SETTINGS: ChatbotSettings = {
  enabled: true,
  allowAnonymous: true,
  selfHelpEnabled: true,
  escalationEnabled: true,
  assistantName: 'JA Support Assistant',
  welcomeMessage: 'Hello! I can help you find an answer in the JA Plan Studio Help Centre. What do you need help with?',
  responseTime: 'within 2 working days',
  maxSelfHelpTurns: 3,
  provider: 'built_in',
  model: '',
  tone: 'friendly',
  escalationPrompt: 'I can send this to the JA Plan Studio team as a Contact Enquiry.',
  knowledge: DEFAULT_KNOWLEDGE,
};

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === 'true';
}

function parseKnowledge(value?: string) {
  if (!value) return DEFAULT_KNOWLEDGE;
  try {
    const parsed = JSON.parse(value) as KnowledgeArticle[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_KNOWLEDGE;
  } catch {
    return DEFAULT_KNOWLEDGE;
  }
}

function settingsFromRecord(record: Record<string, string>): ChatbotSettings {
  return {
    enabled: bool(record.ai_chatbot_enabled, DEFAULT_SETTINGS.enabled),
    allowAnonymous: bool(record.ai_chatbot_allow_anonymous, DEFAULT_SETTINGS.allowAnonymous),
    selfHelpEnabled: bool(record.ai_chatbot_self_help_enabled, DEFAULT_SETTINGS.selfHelpEnabled),
    escalationEnabled: bool(record.ai_chatbot_escalation_enabled, DEFAULT_SETTINGS.escalationEnabled),
    assistantName: record.ai_chatbot_name || DEFAULT_SETTINGS.assistantName,
    welcomeMessage: record.ai_chatbot_welcome_message || DEFAULT_SETTINGS.welcomeMessage,
    responseTime: record.ai_chatbot_response_time || DEFAULT_SETTINGS.responseTime,
    maxSelfHelpTurns: Math.max(1, Math.min(8, Number(record.ai_chatbot_max_self_help_turns || DEFAULT_SETTINGS.maxSelfHelpTurns))),
    provider: record.ai_chatbot_provider === 'workers_ai' ? 'workers_ai' : 'built_in',
    model: record.ai_chatbot_model || '',
    tone: ['friendly', 'professional', 'concise'].includes(record.ai_chatbot_tone)
      ? record.ai_chatbot_tone as ChatbotSettings['tone']
      : DEFAULT_SETTINGS.tone,
    escalationPrompt: record.ai_chatbot_escalation_prompt || DEFAULT_SETTINGS.escalationPrompt,
    knowledge: parseKnowledge(record.ai_chatbot_knowledge_json),
  };
}

function recordFromSettings(settings: ChatbotSettings): Record<string, string> {
  return {
    ai_chatbot_enabled: String(settings.enabled),
    ai_chatbot_allow_anonymous: String(settings.allowAnonymous),
    ai_chatbot_self_help_enabled: String(settings.selfHelpEnabled),
    ai_chatbot_escalation_enabled: String(settings.escalationEnabled),
    ai_chatbot_name: settings.assistantName,
    ai_chatbot_welcome_message: settings.welcomeMessage,
    ai_chatbot_response_time: settings.responseTime,
    ai_chatbot_max_self_help_turns: String(settings.maxSelfHelpTurns),
    ai_chatbot_provider: settings.provider,
    ai_chatbot_model: settings.model,
    ai_chatbot_tone: settings.tone,
    ai_chatbot_escalation_prompt: settings.escalationPrompt,
    ai_chatbot_knowledge_json: JSON.stringify(settings.knowledge),
  };
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

export default function AdminAIChatbotPage() {
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_SETTINGS);
  const [selectedArticle, setSelectedArticle] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [testQuestion, setTestQuestion] = useState('');
  const [testReply, setTestReply] = useState('');
  const [testing, setTesting] = useState(false);

  const article = settings.knowledge[selectedArticle] || settings.knowledge[0];
  const categories = useMemo(
    () => Array.from(new Set(settings.knowledge.map(item => item.category))).filter(Boolean),
    [settings.knowledge],
  );

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/site-settings', { credentials: 'include' });
      const data = await response.json() as { success?: boolean; settings?: Record<string, string>; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Chatbot settings could not be loaded.');
      setSettings(settingsFromRecord(data.settings || {}));
      setSelectedArticle(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chatbot settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function patch(patchValue: Partial<ChatbotSettings>) {
    setSettings(current => ({ ...current, ...patchValue }));
    setNotice('');
  }

  function patchArticle(patchValue: Partial<KnowledgeArticle>) {
    setSettings(current => ({
      ...current,
      knowledge: current.knowledge.map((item, index) => (
        index === selectedArticle ? { ...item, ...patchValue } : item
      )),
    }));
    setNotice('');
  }

  function addArticle() {
    const next: KnowledgeArticle = {
      id: `help-${Date.now()}`,
      category: 'General',
      title: 'New Help Centre answer',
      summary: '',
      answer: '',
      keywords: [],
      steps: [],
      href: '/support',
    };
    setSettings(current => ({ ...current, knowledge: [...current.knowledge, next] }));
    setSelectedArticle(settings.knowledge.length);
    setNotice('');
  }

  function removeArticle() {
    if (settings.knowledge.length <= 1) {
      setError('Keep at least one Help Centre answer.');
      return;
    }
    setSettings(current => ({
      ...current,
      knowledge: current.knowledge.filter((_, index) => index !== selectedArticle),
    }));
    setSelectedArticle(Math.max(0, selectedArticle - 1));
    setNotice('');
  }

  async function save() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const cleaned: ChatbotSettings = {
        ...settings,
        assistantName: settings.assistantName.trim() || DEFAULT_SETTINGS.assistantName,
        welcomeMessage: settings.welcomeMessage.trim() || DEFAULT_SETTINGS.welcomeMessage,
        responseTime: settings.responseTime.trim() || DEFAULT_SETTINGS.responseTime,
        escalationPrompt: settings.escalationPrompt.trim() || DEFAULT_SETTINGS.escalationPrompt,
        knowledge: settings.knowledge.map((item, index) => ({
          ...item,
          id: item.id.trim() || slug(item.title) || `article-${index + 1}`,
          title: item.title.trim(),
          category: item.category.trim() || 'General',
          summary: item.summary.trim(),
          answer: item.answer.trim(),
          keywords: item.keywords.map(keyword => keyword.trim()).filter(Boolean),
          steps: item.steps.map(step => step.trim()).filter(Boolean),
          href: item.href.trim() || '/support',
        })).filter(item => item.title && item.answer),
      };
      if (!cleaned.knowledge.length) throw new Error('Add at least one Help Centre answer with a title and answer.');

      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: recordFromSettings(cleaned) }),
      });
      const data = await response.json().catch(() => ({})) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Chatbot settings could not be saved.');
      setSettings(cleaned);
      setNotice('AI Chatbot settings and Help Centre knowledge have been saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chatbot settings could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function testAssistant() {
    if (testQuestion.trim().length < 2) {
      setTestReply('Enter a question to test.');
      return;
    }
    setTesting(true);
    setTestReply('');
    try {
      const response = await fetch('/api/support-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: `admin-preview-${Date.now()}`,
          message: testQuestion.trim(),
          history: [],
        }),
      });
      const data = await response.json().catch(() => ({})) as { success?: boolean; reply?: string; error?: string };
      setTestReply(response.ok && data.success ? data.reply || 'No reply was returned.' : data.error || 'The assistant test failed.');
    } catch {
      setTestReply('The assistant test could not connect.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <Helmet><title>AI Chatbot Settings — Admin Portal</title></Helmet>
      <AdminLayout title="AI Chatbot Settings">
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Bot className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950">AI Chatbot Settings</h1>
                <p className="text-sm text-slate-500">
                  Control anonymous access, Help Centre self-service, AI generation and Contact Enquiry escalation.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void load()} disabled={loading || saving}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Reload
              </Button>
              <Button onClick={() => void save()} disabled={loading || saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save settings
              </Button>
            </div>
          </div>

          {notice && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{notice}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {[0, 1, 2].map(item => <div key={item} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Chatbot enabled', settings.enabled, 'Show the assistant on customer and public pages.', 'enabled'],
                  ['Anonymous visitors', settings.allowAnonymous, 'Allow signed-out visitors to ask questions and escalate.', 'allowAnonymous'],
                  ['Help Centre self-service', settings.selfHelpEnabled, 'Search the configured knowledge before escalation.', 'selfHelpEnabled'],
                  ['Contact Enquiries', settings.escalationEnabled, 'Allow unresolved conversations to create ENQ records.', 'escalationEnabled'],
                ].map(([label, checked, description, key]) => (
                  <Card key={String(key)} className="border-slate-200 bg-white">
                    <CardContent className="p-5">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(checked)}
                          onChange={event => patch({ [String(key)]: event.target.checked } as Partial<ChatbotSettings>)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{String(label)}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">{String(description)}</span>
                        </span>
                      </label>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageCircle className="h-4 w-4 text-blue-600" />Assistant behaviour
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="chatbot-name">Assistant name</Label>
                      <Input id="chatbot-name" className="mt-1" value={settings.assistantName}
                        onChange={event => patch({ assistantName: event.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="chatbot-response">Published response time</Label>
                      <Input id="chatbot-response" className="mt-1" value={settings.responseTime}
                        onChange={event => patch({ responseTime: event.target.value })} />
                    </div>
                    <div>
                      <Label>Reply tone</Label>
                      <Select value={settings.tone} onValueChange={value => patch({ tone: value as ChatbotSettings['tone'] })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="concise">Concise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="chatbot-turns">Self-help attempts before escalation</Label>
                      <Input id="chatbot-turns" type="number" min={1} max={8} className="mt-1"
                        value={settings.maxSelfHelpTurns}
                        onChange={event => patch({ maxSelfHelpTurns: Math.max(1, Math.min(8, Number(event.target.value))) })} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="chatbot-welcome">Welcome message</Label>
                      <Textarea id="chatbot-welcome" className="mt-1 min-h-[90px]" value={settings.welcomeMessage}
                        onChange={event => patch({ welcomeMessage: event.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="chatbot-escalation">Escalation message</Label>
                      <Textarea id="chatbot-escalation" className="mt-1 min-h-[80px]" value={settings.escalationPrompt}
                        onChange={event => patch({ escalationPrompt: event.target.value })} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-blue-600" />AI engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Provider</Label>
                      <Select value={settings.provider} onValueChange={value => patch({ provider: value as ChatbotSettings['provider'] })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="built_in">Built-in Help Centre AI</SelectItem>
                          <SelectItem value="workers_ai">Cloudflare Workers AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {settings.provider === 'workers_ai' && (
                      <div>
                        <Label htmlFor="chatbot-model">Workers AI model identifier</Label>
                        <Input id="chatbot-model" className="mt-1 font-mono text-xs" value={settings.model}
                          onChange={event => patch({ model: event.target.value })}
                          placeholder="Configured model identifier" />
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          The Cloudflare Pages project must also have an AI binding named <code>AI</code>. If it is absent or the model fails, the chatbot automatically uses the built-in Help Centre engine.
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
                      The assistant is constrained to the Help Centre knowledge below. It must not invent account, billing, legal or service information.
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="h-4 w-4 text-blue-600" />Help Centre knowledge
                    </CardTitle>
                    <p className="mt-1 text-xs text-slate-500">{settings.knowledge.length} answers across {categories.length} categories.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addArticle}>
                    <Plus className="mr-2 h-4 w-4" />Add answer
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                    <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
                      {settings.knowledge.map((item, index) => (
                        <button
                          key={`${item.id}-${index}`}
                          type="button"
                          onClick={() => setSelectedArticle(index)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            selectedArticle === index
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">{item.category || 'General'}</p>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{item.title || 'Untitled answer'}</p>
                        </button>
                      ))}
                    </div>

                    {article && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="article-title">Title</Label>
                          <Input id="article-title" className="mt-1" value={article.title}
                            onChange={event => patchArticle({ title: event.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="article-category">Category</Label>
                          <Input id="article-category" className="mt-1" value={article.category}
                            onChange={event => patchArticle({ category: event.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="article-summary">Summary</Label>
                          <Textarea id="article-summary" className="mt-1 min-h-[70px]" value={article.summary}
                            onChange={event => patchArticle({ summary: event.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="article-answer">Self-help answer</Label>
                          <Textarea id="article-answer" className="mt-1 min-h-[120px]" value={article.answer}
                            onChange={event => patchArticle({ answer: event.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="article-keywords">Keywords, separated by commas</Label>
                          <Textarea id="article-keywords" className="mt-1 min-h-[90px]"
                            value={article.keywords.join(', ')}
                            onChange={event => patchArticle({ keywords: event.target.value.split(',').map(value => value.trim()) })} />
                        </div>
                        <div>
                          <Label htmlFor="article-steps">Steps, one per line</Label>
                          <Textarea id="article-steps" className="mt-1 min-h-[90px]"
                            value={article.steps.join('\n')}
                            onChange={event => patchArticle({ steps: event.target.value.split('\n') })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="article-link">Help Centre link</Label>
                          <Input id="article-link" className="mt-1" value={article.href}
                            onChange={event => patchArticle({ href: event.target.value })} />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={removeArticle}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete answer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="h-4 w-4 text-blue-600" />Test the live assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input value={testQuestion} onChange={event => setTestQuestion(event.target.value)}
                      placeholder="For example: Why can’t I save my plan?" />
                    <Button variant="outline" onClick={() => void testAssistant()} disabled={testing}>
                      {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Test
                    </Button>
                  </div>
                  {testReply && (
                    <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                      {testReply}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">Save changes before testing newly edited knowledge or behaviour.</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
