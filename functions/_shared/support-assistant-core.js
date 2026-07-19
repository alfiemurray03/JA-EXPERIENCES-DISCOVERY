export const DEFAULT_CONFIG = {
  enabled: true,
  maintenanceEnabled: false,
  maintenanceMessage: "The Help Centre assistant is undergoing maintenance. You can still send a Contact Enquiry.",
  maintenanceStart: "",
  maintenanceEnd: "",
  maintenanceAllowEnquiries: true,
  allowAnonymous: true,
  selfHelpEnabled: true,
  escalationEnabled: true,
  debugEnabled: false,
  assistantName: "JA Support Assistant",
  logoUrl: "",
  avatarUrl: "",
  fontFamily: "inherit",
  welcomeMessage: "Hello! I can help you find an answer in the JA Plan Studio Help Centre. What do you need help with?",
  responseTime: "within 2 working days",
  maxSelfHelpTurns: 3,
  provider: "built_in",
  model: "",
  tone: "friendly",
  escalationPrompt: "I can send this to the JA Plan Studio team as a Contact Enquiry.",
  position: "bottom-right",
  primaryColor: "#2563eb",
  accentColor: "#dbeafe",
  panelWidth: 430,
  panelHeight: 680,
  borderRadius: 18,
  launcherSize: 56,
  launcherLabel: "Help",
  inputPlaceholder: "Ask a Help Centre question…",
  showPoweredBy: true,
  autoOpenDelaySeconds: 0
};

export const DEFAULT_ARTICLES = [
  {
    id: "sign-in",
    category: "Account & access",
    title: "Sign-in and Microsoft account help",
    summary: "Resolve common JA Group Services ID sign-in and account-access problems.",
    answer: "Use the Log In button and complete Microsoft sign-in in the same browser. If you return without being signed in, close duplicate tabs, allow essential cookies and try once more.",
    keywords: ["login", "log in", "sign in", "microsoft", "session", "pin", "cookies"],
    steps: ["Close duplicate sign-in tabs.", "Return to JA Plan Studio and choose Log In.", "Complete Microsoft sign-in in the same browser."],
    href: "/help-centre"
  },
  {
    id: "billing",
    category: "Billing & subscriptions",
    title: "Subscriptions, plans and invoices",
    summary: "Understand your plan, renewal date, invoices and Stripe billing access.",
    answer: "Open Settings and choose Billing. Review the active plan, renewal information and invoices, or open the secure Stripe billing portal where available.",
    keywords: ["billing", "subscription", "plan", "invoice", "payment", "stripe", "renewal", "refund"],
    steps: ["Open Settings and choose Billing.", "Review the plan and renewal information.", "Use the secure billing portal for supported changes."],
    href: "/help-centre"
  },
  {
    id: "builders",
    category: "Builders & plans",
    title: "Create, save and preview a plan",
    summary: "Choose a builder, answer its guided questions, preview the result and save your plan.",
    answer: "Open Explore Builders, choose a planning template and complete each guided step. Use Preview before saving, then save the plan to your customer account.",
    keywords: ["builder", "plan", "template", "save", "preview", "download", "guided"],
    steps: ["Open Explore Builders.", "Choose a template and complete the questions.", "Preview the result, then save it."],
    href: "/help-centre"
  },
  {
    id: "privacy",
    category: "Privacy & data",
    title: "Privacy and data requests",
    summary: "Request access, correction, deletion or another data-protection action.",
    answer: "Open Privacy & Data in your account and choose the appropriate request type. Provide enough detail for the team to identify the information and track the request from the same page.",
    keywords: ["privacy", "data", "gdpr", "delete", "deletion", "dsar", "correction"],
    steps: ["Open Privacy & Data.", "Choose the request type.", "Provide the requested details and track the request."],
    href: "/privacy"
  },
  {
    id: "technical",
    category: "Technical support",
    title: "Website or builder not working",
    summary: "Try safe checks for loading, saving, preview and browser errors.",
    answer: "Refresh the page once, confirm you are still signed in and retry in one browser tab. If the same error continues, create an enquiry with the page, time and exact message shown.",
    keywords: ["error", "not working", "broken", "blank", "loading", "save", "preview", "download", "browser"],
    steps: ["Refresh the affected page once.", "Confirm you are signed in and use one tab.", "Create an enquiry if the error continues."],
    href: "/help-centre"
  },
  {
    id: "accessibility",
    category: "Accessibility",
    title: "Accessibility and additional support",
    summary: "Find accessibility controls and request an adjustment.",
    answer: "Use the website accessibility controls where available. For additional support, create an enquiry and explain the adjustment or alternative format that would help.",
    keywords: ["accessibility", "disability", "screen reader", "contrast", "font", "adjustment"],
    steps: ["Open the accessibility controls.", "Choose the adjustment you need.", "Create an enquiry for further support."],
    href: "/help-centre"
  }
];

const CATEGORY_SUGGESTIONS = [
  "Account or sign-in",
  "Billing or subscription",
  "Builders or saved plans",
  "Privacy or data",
  "Technical problem",
  "Something else"
];

export function clean(value, max = 4000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function bool(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function integer(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function colour(value, fallback) {
  const candidate = clean(value, 20);
  return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate : fallback;
}

function safeAssetUrl(value) {
  const candidate = clean(value, 500);
  if (!candidate) return "";
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function dateTime(value) {
  const candidate = clean(value, 40);
  return candidate && !Number.isNaN(Date.parse(candidate)) ? candidate : "";
}

export async function loadAssistantSettings(DB) {
  if (!DB) return {};
  try {
    const result = await DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'ai_chatbot_%'").all();
    return Object.fromEntries((result.results || []).map((row) => [row.key, row.value]));
  } catch {
    return {};
  }
}

export function configFrom(settings) {
  return {
    enabled: bool(settings.ai_chatbot_enabled, DEFAULT_CONFIG.enabled),
    maintenanceEnabled: bool(settings.ai_chatbot_maintenance_enabled, DEFAULT_CONFIG.maintenanceEnabled),
    maintenanceMessage: clean(settings.ai_chatbot_maintenance_message || DEFAULT_CONFIG.maintenanceMessage, 500),
    maintenanceStart: dateTime(settings.ai_chatbot_maintenance_start),
    maintenanceEnd: dateTime(settings.ai_chatbot_maintenance_end),
    maintenanceAllowEnquiries: bool(settings.ai_chatbot_maintenance_allow_enquiries, DEFAULT_CONFIG.maintenanceAllowEnquiries),
    allowAnonymous: bool(settings.ai_chatbot_allow_anonymous, DEFAULT_CONFIG.allowAnonymous),
    selfHelpEnabled: bool(settings.ai_chatbot_self_help_enabled, DEFAULT_CONFIG.selfHelpEnabled),
    escalationEnabled: bool(settings.ai_chatbot_escalation_enabled, DEFAULT_CONFIG.escalationEnabled),
    debugEnabled: bool(settings.ai_chatbot_debug_enabled, DEFAULT_CONFIG.debugEnabled),
    assistantName: clean(settings.ai_chatbot_name || DEFAULT_CONFIG.assistantName, 80),
    logoUrl: safeAssetUrl(settings.ai_chatbot_logo_url),
    avatarUrl: safeAssetUrl(settings.ai_chatbot_avatar_url),
    fontFamily: ["inherit", "Segoe UI", "Arial", "Atkinson Hyperlegible", "Georgia"].includes(settings.ai_chatbot_font_family) ? settings.ai_chatbot_font_family : DEFAULT_CONFIG.fontFamily,
    welcomeMessage: clean(settings.ai_chatbot_welcome_message || DEFAULT_CONFIG.welcomeMessage, 500),
    responseTime: clean(settings.ai_chatbot_response_time || DEFAULT_CONFIG.responseTime, 120),
    maxSelfHelpTurns: integer(settings.ai_chatbot_max_self_help_turns, DEFAULT_CONFIG.maxSelfHelpTurns, 1, 8),
    provider: ["built_in", "workers_ai"].includes(settings.ai_chatbot_provider) ? settings.ai_chatbot_provider : DEFAULT_CONFIG.provider,
    model: clean(settings.ai_chatbot_model || DEFAULT_CONFIG.model, 180),
    tone: ["friendly", "professional", "concise"].includes(settings.ai_chatbot_tone) ? settings.ai_chatbot_tone : DEFAULT_CONFIG.tone,
    escalationPrompt: clean(settings.ai_chatbot_escalation_prompt || DEFAULT_CONFIG.escalationPrompt, 500),
    position: settings.ai_chatbot_position === "bottom-left" ? "bottom-left" : "bottom-right",
    primaryColor: colour(settings.ai_chatbot_primary_color, DEFAULT_CONFIG.primaryColor),
    accentColor: colour(settings.ai_chatbot_accent_color, DEFAULT_CONFIG.accentColor),
    panelWidth: integer(settings.ai_chatbot_panel_width, DEFAULT_CONFIG.panelWidth, 340, 560),
    panelHeight: integer(settings.ai_chatbot_panel_height, DEFAULT_CONFIG.panelHeight, 480, 820),
    borderRadius: integer(settings.ai_chatbot_border_radius, DEFAULT_CONFIG.borderRadius, 0, 32),
    launcherSize: integer(settings.ai_chatbot_launcher_size, DEFAULT_CONFIG.launcherSize, 44, 72),
    launcherLabel: clean(settings.ai_chatbot_launcher_label || DEFAULT_CONFIG.launcherLabel, 40),
    inputPlaceholder: clean(settings.ai_chatbot_input_placeholder || DEFAULT_CONFIG.inputPlaceholder, 120),
    showPoweredBy: bool(settings.ai_chatbot_show_powered_by, DEFAULT_CONFIG.showPoweredBy),
    autoOpenDelaySeconds: integer(settings.ai_chatbot_auto_open_delay_seconds, DEFAULT_CONFIG.autoOpenDelaySeconds, 0, 120)
  };
}

export function knowledgeFrom(settings) {
  try {
    const parsed = JSON.parse(settings.ai_chatbot_knowledge_json || "[]");
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_ARTICLES;
    return parsed.slice(0, 100).map((article, index) => ({
      id: clean(article.id || `article-${index + 1}`, 80),
      category: clean(article.category || "General", 80),
      title: clean(article.title, 160),
      summary: clean(article.summary, 500),
      answer: clean(article.answer || article.summary, 2400),
      keywords: Array.isArray(article.keywords) ? article.keywords.map((item) => clean(item, 80)).filter(Boolean).slice(0, 30) : clean(article.keywords, 800).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30),
      steps: Array.isArray(article.steps) ? article.steps.map((item) => clean(item, 300)).filter(Boolean).slice(0, 10) : clean(article.steps, 1600).split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 10),
      href: clean(article.href || "/help-centre", 300)
    })).filter((article) => article.title && article.answer);
  } catch {
    return DEFAULT_ARTICLES;
  }
}

function tokens(value) {
  return clean(value, 4000).toLowerCase().replace(/[^a-z0-9@]+/g, " ").split(/\s+/).filter((word) => word.length > 2);
}

function scoreArticle(article, message) {
  const lower = message.toLowerCase();
  const inputTokens = new Set(tokens(message));
  let score = 0;
  for (const keyword of article.keywords || []) {
    const key = String(keyword).toLowerCase();
    if (lower.includes(key)) score += key.includes(" ") ? 8 : 5;
  }
  for (const word of tokens(`${article.title} ${article.category} ${article.summary}`)) {
    if (inputTokens.has(word)) score += 2;
  }
  return score;
}

function bestMatches(articles, message) {
  return articles.map((article) => ({ article, score: scoreArticle(article, message) })).sort((a, b) => b.score - a.score).slice(0, 3);
}

function categoryFor(article) {
  const value = String(article?.category || "General Enquiry").toLowerCase();
  if (value.includes("billing") || value.includes("subscription")) return "Billing";
  if (value.includes("privacy") || value.includes("data")) return "Data Protection";
  if (value.includes("accessibility")) return "Accessibility";
  if (value.includes("technical") || value.includes("builder") || value.includes("account")) return "Technical Support";
  return "General Enquiry";
}

export function builtInAnswer(config, articles, message, history) {
  const turns = Array.isArray(history) ? history.filter((item) => item?.role === "user").length : 0;
  if (/\b(yes|solved|fixed|worked|thank you|thanks|helpful)\b/i.test(message)) {
    return { reply: "I’m glad that helped. You can ask another question at any time.", suggestions: ["Ask another question", "Open the Help Centre"], escalate: false, resolved: true, source: "built_in" };
  }
  if (/\b(no|not solved|did not work|didn't work|still|human|person|agent|contact|enquiry)\b/i.test(message)) {
    return { reply: config.escalationEnabled ? config.escalationPrompt : "Please use the Help Centre for further assistance.", suggestions: config.escalationEnabled ? ["Create an enquiry", "Try another question"] : ["Open the Help Centre"], escalate: config.escalationEnabled, resolved: false, source: "built_in" };
  }
  if (!config.selfHelpEnabled) {
    return { reply: config.escalationEnabled ? config.escalationPrompt : "Self-help answers are currently unavailable.", suggestions: config.escalationEnabled ? ["Create an enquiry"] : [], escalate: config.escalationEnabled, resolved: false, source: "built_in" };
  }
  const best = bestMatches(articles, message)[0];
  if (!best || best.score < 3) {
    const escalate = turns >= config.maxSelfHelpTurns && config.escalationEnabled;
    return { reply: escalate ? `I have not found a confident answer. ${config.escalationPrompt}` : "I need a little more detail. Which area is your question about?", suggestions: escalate ? ["Create an enquiry", "Try another question"] : CATEGORY_SUGGESTIONS, escalate, resolved: false, source: "built_in" };
  }
  const article = best.article;
  const steps = article.steps?.length ? `Try these steps:\n${article.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}` : "";
  return {
    reply: [article.answer, steps, "Did this solve the problem?"].filter(Boolean).join("\n\n"),
    suggestions: ["Yes, that solved it", "No, I still need help", "Open the Help Centre"],
    article: { id: article.id, title: article.title, category: article.category, summary: article.summary, href: article.href || "/help-centre" },
    category: categoryFor(article),
    suggestedSubject: article.title,
    escalate: false,
    resolved: false,
    source: "built_in",
    matchScore: best.score
  };
}

export async function workersAiAnswer(env, config, articles, message, history) {
  if (config.provider !== "workers_ai" || !config.model || !env.AI?.run) return null;
  const matches = bestMatches(articles, message).filter((item) => item.score > 0).slice(0, 3);
  const context = matches.length ? matches.map(({ article }) => `TITLE: ${article.title}\nANSWER: ${article.answer}\nSTEPS: ${(article.steps || []).join(" | ")}`).join("\n\n") : "No confident article matched.";
  try {
    const result = await env.AI.run(config.model, {
      messages: [
        { role: "system", content: `You are ${config.assistantName}. Answer only from the supplied Help Centre context. Give practical steps. If context is insufficient, offer a Contact Enquiry. Tone: ${config.tone}.` },
        { role: "system", content: context },
        ...(Array.isArray(history) ? history.slice(-8).map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: clean(item.content || item.text, 1200) })) : []),
        { role: "user", content: message }
      ]
    });
    const response = clean(result?.response || result?.result?.response || result?.text, 3500);
    if (!response) return null;
    const article = matches[0]?.article;
    return { reply: response, suggestions: ["Yes, that solved it", "No, I still need help", "Open the Help Centre"], article: article ? { id: article.id, title: article.title, category: article.category, summary: article.summary, href: article.href || "/help-centre" } : undefined, category: categoryFor(article), suggestedSubject: article?.title || clean(message, 120), escalate: false, resolved: false, source: "workers_ai", matchScore: matches[0]?.score || 0 };
  } catch (error) {
    if (config.debugEnabled) console.error(JSON.stringify({ event: "support_assistant_ai_failed", message: clean(error?.message || error, 240) }));
    return null;
  }
}
