import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  LifeBuoy,
  Loader2,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AssistantConfig {
  enabled: boolean;
  allowAnonymous: boolean;
  selfHelpEnabled: boolean;
  escalationEnabled: boolean;
  assistantName: string;
  welcomeMessage: string;
  responseTime: string;
  maxSelfHelpTurns: number;
}

interface ArticleLink {
  id: string;
  title: string;
  category: string;
  summary: string;
  href: string;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  article?: ArticleLink;
  suggestions?: string[];
}

interface AssistantReply {
  success: boolean;
  error?: string;
  reply?: string;
  suggestions?: string[];
  article?: ArticleLink;
  category?: string;
  suggestedSubject?: string;
  escalate?: boolean;
}

interface EnquiryForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  consent: boolean;
}

const DEFAULT_CONFIG: AssistantConfig = {
  enabled: true,
  allowAnonymous: true,
  selfHelpEnabled: true,
  escalationEnabled: true,
  assistantName: 'JA Support Assistant',
  welcomeMessage: 'Hello! I can help you find an answer in the JA Plan Studio Help Centre. What do you need help with?',
  responseTime: 'within 2 working days',
  maxSelfHelpTurns: 3,
};

const STARTER_SUGGESTIONS = [
  'Account or sign-in',
  'Billing or subscription',
  'Builders or saved plans',
  'Privacy or data',
  'Technical problem',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function id(prefix: string) {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function displayName(user: { firstName?: string | null; lastName?: string | null; email: string } | null | undefined) {
  if (!user) return '';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email;
}

export default function AIHelpChatbot() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AssistantConfig>(DEFAULT_CONFIG);
  const [configReady, setConfigReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'enquiry' | 'sent'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState('');
  const [reference, setReference] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [suggestedSubject, setSuggestedSubject] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('Technical Support');
  const [form, setForm] = useState<EnquiryForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'Technical Support',
    consent: false,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openedAtRef = useRef(Date.now());
  const sessionIdRef = useRef(id('support-session'));

  const hiddenForPortal = typeof window !== 'undefined'
    && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/reseller'));

  useEffect(() => {
    let active = true;
    fetch('/api/support-assistant', { credentials: 'include' })
      .then(async response => {
        const data = await response.json() as {
          success?: boolean;
          config?: Partial<AssistantConfig>;
        };
        if (active && data.success && data.config) {
          setConfig({ ...DEFAULT_CONFIG, ...data.config });
        }
      })
      .catch(() => {
        // The built-in defaults keep the assistant available if config loading fails.
      })
      .finally(() => {
        if (active) setConfigReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm(current => ({
      ...current,
      name: current.name || displayName(user),
      email: current.email || user.email,
    }));
  }, [user]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, mode, thinking]);

  useEffect(() => {
    if (open && mode === 'chat') {
      window.setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, mode]);

  const conversationHistory = useMemo(
    () => messages.slice(-10).map(message => ({ role: message.role, content: message.text })),
    [messages],
  );

  function initialiseConversation() {
    if (messages.length) return;
    setMessages([{
      id: id('assistant'),
      role: 'assistant',
      text: config.welcomeMessage,
      suggestions: STARTER_SUGGESTIONS,
    }]);
  }

  function openWidget() {
    openedAtRef.current = Date.now();
    setOpen(true);
    setMode('chat');
    setChatError('');
    initialiseConversation();
  }

  function appendAssistant(text: string, options: Partial<ChatMessage> = {}) {
    setMessages(current => [...current, {
      id: id('assistant'),
      role: 'assistant',
      text,
      article: options.article,
      suggestions: options.suggestions,
    }]);
  }

  function startEnquiry(subject = suggestedSubject, category = suggestedCategory) {
    const lastUserMessage = [...messages].reverse().find(message => message.role === 'user')?.text ?? '';
    setForm(current => ({
      ...current,
      name: current.name || displayName(user),
      email: current.email || user?.email || '',
      subject: current.subject || subject || 'Help with JA Plan Studio',
      message: current.message || lastUserMessage,
      category: category || 'Technical Support',
    }));
    setFieldErrors({});
    setSubmitError('');
    setMode('enquiry');
  }

  async function sendMessage(rawValue = input) {
    const value = rawValue.trim();
    if (!value || thinking) return;

    if (value === 'Create an enquiry') {
      startEnquiry();
      return;
    }
    if (value === 'Open the Help Centre') {
      window.location.assign('/support');
      return;
    }
    if (value === 'Ask another question' || value === 'Try another question') {
      appendAssistant('Of course. What else can I help you with?', { suggestions: STARTER_SUGGESTIONS });
      setInput('');
      return;
    }

    const userMessage: ChatMessage = { id: id('user'), role: 'user', text: value };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setThinking(true);
    setChatError('');

    try {
      const response = await fetch('/api/support-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: value,
          email: user?.email || '',
          history: nextMessages.slice(-10).map(message => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });
      const data = await response.json().catch(() => ({})) as AssistantReply;
      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data.error || 'The Help Centre assistant could not answer that question.');
      }

      if (data.suggestedSubject) setSuggestedSubject(data.suggestedSubject);
      if (data.category) setSuggestedCategory(data.category);
      appendAssistant(data.reply, {
        article: data.article,
        suggestions: data.escalate
          ? Array.from(new Set(['Create an enquiry', ...(data.suggestions || [])]))
          : data.suggestions,
      });
    } catch (reason) {
      const message = reason instanceof Error
        ? reason.message
        : 'The Help Centre assistant could not answer that question.';
      setChatError(message);
      appendAssistant(
        'I could not complete the self-help check. You can still send a Contact Enquiry to the JA Plan Studio team.',
        { suggestions: ['Create an enquiry', 'Try another question'] },
      );
    } finally {
      setThinking(false);
    }
  }

  function validateEnquiry() {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = 'Enter your name.';
    if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
    if (form.subject.trim().length < 3) errors.subject = 'Enter a subject of at least 3 characters.';
    if (form.message.trim().length < 10) errors.message = 'Please give at least 10 characters of detail.';
    if (!form.consent) errors.consent = 'Confirm the Terms of Service and Privacy Notice.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function transcript() {
    const lines = conversationHistory
      .map(message => `${message.role === 'assistant' ? config.assistantName : 'Visitor'}: ${message.content}`)
      .join('\n\n');
    return lines ? `\n\n--- AI Help Centre conversation ---\n${lines}` : '';
  }

  async function submitEnquiry() {
    setSubmitError('');
    if (!validateEnquiry()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: `${form.message.trim()}${transcript()}`.slice(0, 6000),
          category: form.category,
          termsAccepted: true,
          privacyAccepted: true,
          marketingConsent: false,
          startedAt: openedAtRef.current,
          website: '',
          idempotencyKey: `${sessionIdRef.current}-${form.subject.trim().toLowerCase()}`.slice(0, 120),
        }),
      });
      const data = await response.json().catch(() => ({})) as {
        success?: boolean;
        reference?: string;
        error?: string;
        errors?: string[];
      };
      if (!response.ok || !data.success || !data.reference) {
        throw new Error(data.error || data.errors?.[0] || 'The enquiry could not be sent.');
      }
      setReference(data.reference);
      setMode('sent');
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'The enquiry could not be sent.');
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    sessionIdRef.current = id('support-session');
    openedAtRef.current = Date.now();
    setReference('');
    setInput('');
    setSuggestedSubject('');
    setSuggestedCategory('Technical Support');
    setForm({
      name: displayName(user),
      email: user?.email || '',
      subject: '',
      message: '',
      category: 'Technical Support',
      consent: false,
    });
    setMessages([{
      id: id('assistant'),
      role: 'assistant',
      text: config.welcomeMessage,
      suggestions: STARTER_SUGGESTIONS,
    }]);
    setMode('chat');
  }

  if (hiddenForPortal || !configReady || !config.enabled) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[70]">
        <button
          type="button"
          onClick={open ? () => setOpen(false) : openWidget}
          aria-label={open ? 'Close AI Help Centre assistant' : 'Open AI Help Centre assistant'}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {open ? <ChevronDown className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          {!open && (
            <span className="absolute -left-1 -top-1 rounded-full bg-white p-1 text-blue-600 shadow">
              <Sparkles className="h-3 w-3" />
            </span>
          )}
        </button>
      </div>

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={`${config.assistantName} chat`}
          className="fixed inset-x-3 bottom-20 z-[69] flex h-[calc(100dvh-6rem)] max-h-[680px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl [color-scheme:light] sm:left-auto sm:right-5 sm:w-[430px]"
        >
          <header className="flex shrink-0 items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              {mode !== 'chat' && (
                <button
                  type="button"
                  onClick={() => setMode('chat')}
                  aria-label="Back to the Help Centre conversation"
                  className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {mode === 'enquiry' ? 'Contact Enquiry' : mode === 'sent' ? 'Enquiry received' : config.assistantName}
                </p>
                <p className="truncate text-[11px] text-blue-100">
                  AI-assisted Help Centre · Team replies {config.responseTime}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {mode === 'chat' && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4" aria-live="polite">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[88%]">
                      <div className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-blue-600 text-white'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-900'
                      }`}>
                        {message.text}
                      </div>

                      {message.article && (
                        <a
                          href={message.article.href || '/support'}
                          className="mt-2 block rounded-xl border border-blue-200 bg-blue-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-100"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                                Help Centre · {message.article.category}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{message.article.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">{message.article.summary}</p>
                            </div>
                            <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                          </div>
                        </a>
                      )}

                      {!!message.suggestions?.length && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map(suggestion => (
                            <button
                              key={`${message.id}-${suggestion}`}
                              type="button"
                              onClick={() => void sendMessage(suggestion)}
                              className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      Searching the Help Centre…
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <footer className="shrink-0 border-t border-slate-200 bg-white p-3">
                {chatError && (
                  <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{chatError}</p>
                )}
                <div className="flex items-end gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder="Ask a Help Centre question…"
                    className="h-10 flex-1 border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400"
                    aria-label="Question for the Help Centre assistant"
                  />
                  <Button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={thinking}
                    className="h-10 w-10 shrink-0 bg-blue-600 p-0 text-white hover:bg-blue-700"
                    aria-label="Send question"
                  >
                    {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-500">
                  <span>AI answers may be checked before acting.</span>
                  <button
                    type="button"
                    onClick={() => startEnquiry()}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Contact the team
                  </button>
                </div>
              </footer>
            </>
          )}

          {mode === 'enquiry' && (
            <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="flex gap-2">
                  <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-blue-950">Send this to Contact Enquiries</p>
                    <p className="mt-1 text-xs leading-relaxed text-blue-800">
                      This creates an ENQ reference in the Admin Centre. Signed-out visitors can submit as well.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="ai-enquiry-name" className="mb-1 block text-xs font-semibold text-slate-800">Name</label>
                  <Input
                    id="ai-enquiry-name"
                    value={form.name}
                    onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                    className="border-slate-300 bg-white text-slate-900"
                    autoComplete="name"
                  />
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="ai-enquiry-email" className="mb-1 block text-xs font-semibold text-slate-800">Email address</label>
                  <Input
                    id="ai-enquiry-email"
                    type="email"
                    value={form.email}
                    onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                    className="border-slate-300 bg-white text-slate-900"
                    autoComplete="email"
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="ai-enquiry-subject" className="mb-1 block text-xs font-semibold text-slate-800">
                    Subject <span className="font-normal text-slate-500">({form.subject.trim().length}/180)</span>
                  </label>
                  <Input
                    id="ai-enquiry-subject"
                    value={form.subject}
                    maxLength={180}
                    onChange={event => setForm(current => ({ ...current, subject: event.target.value }))}
                    className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="What do you need help with?"
                  />
                  {fieldErrors.subject && <p className="mt-1 text-xs text-red-600">{fieldErrors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="ai-enquiry-message" className="mb-1 block text-xs font-semibold text-slate-800">
                    Message <span className="font-normal text-slate-500">({form.message.trim().length}/6000)</span>
                  </label>
                  <Textarea
                    id="ai-enquiry-message"
                    value={form.message}
                    maxLength={6000}
                    rows={6}
                    onChange={event => setForm(current => ({ ...current, message: event.target.value }))}
                    className="min-h-[130px] resize-y border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="Give enough detail for the team to understand the problem."
                  />
                  {fieldErrors.message && <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
                </div>

                <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={event => setForm(current => ({ ...current, consent: event.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-xs leading-relaxed text-slate-700">
                    I accept the <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline">Terms of Service</a> and confirm that I have read the <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline">Privacy Notice</a>.
                  </span>
                </label>
                {fieldErrors.consent && <p className="text-xs text-red-600">{fieldErrors.consent}</p>}

                {submitError && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => void submitEnquiry()}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {submitting ? 'Sending enquiry…' : 'Send enquiry'}
                </Button>

                <p className="text-center text-[10px] leading-relaxed text-slate-500">
                  The button remains available. Any missing or too-short information is explained above after you press Send.
                </p>
              </div>
            </div>
          )}

          {mode === 'sent' && (
            <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-950">Enquiry received</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your message is now in the Admin Centre’s Contact Enquiries section.
              </p>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900">{reference}</p>
              </div>
              <p className="mt-3 text-xs text-slate-500">The team normally replies {config.responseTime}.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {user && (
                  <a
                    href="/account/enquiries/"
                    className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    My enquiries
                  </a>
                )}
                <Button type="button" size="sm" onClick={restart}>Start another conversation</Button>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
