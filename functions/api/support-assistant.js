const DEFAULT_CONFIG = {
  enabled: true,
  allowAnonymous: true,
  selfHelpEnabled: true,
  escalationEnabled: true,
  assistantName: "JA Support Assistant",
  welcomeMessage: "Hello! I can help you find an answer in the JA Plan Studio Help Centre. What do you need help with?",
  responseTime: "within 2 working days",
  maxSelfHelpTurns: 3,
  provider: "built_in",
  model: "",
  tone: "friendly",
  escalationPrompt: "I can send this to the JA Plan Studio team as a Contact Enquiry."
};

const DEFAULT_ARTICLES = [
  {
    id: "account-details",
    category: "Account & access",
    title: "Update your personal details",
    summary: "Change your name, contact details and Microsoft account information safely.",
    answer: "Open your customer Settings and select Profile. Update the available fields, save the changes, and wait for the confirmation before leaving the page.",
    keywords: ["account", "profile", "personal", "name", "email", "details", "change", "update"],
    steps: ["Open Settings and choose Profile.", "Update the details you need.", "Select Save changes and wait for confirmation."],
    href: "/support"
  },
  {
    id: "sign-in",
    category: "Account & access",
    title: "Sign-in and Microsoft account help",
    summary: "Resolve common JA Group Services ID sign-in, session and account-access problems.",
    answer: "Use the Log In button and complete Microsoft sign-in in the same browser. If you are returned to the website without being signed in, close duplicate tabs, allow essential cookies, and try once more.",
    keywords: ["login", "log in", "sign in", "microsoft", "oidc", "session", "pin", "account access", "cookies"],
    steps: ["Close duplicate JA Plan Studio sign-in tabs.", "Return to the website and choose Log In.", "Complete Microsoft sign-in without opening a second browser window."],
    href: "/support"
  },
  {
    id: "billing",
    category: "Billing & subscriptions",
    title: "Subscriptions, plans and invoices",
    summary: "Understand your plan, renewal date, invoices and secure Stripe billing access.",
    answer: "Open Settings and choose Billing. You can review the active plan, renewal information and invoices, or open the secure Stripe billing portal where available.",
    keywords: ["billing", "subscription", "plan", "invoice", "payment", "stripe", "renewal", "charge", "refund"],
    steps: ["Open Settings and choose Billing.", "Review the plan, renewal date and invoices.", "Use the secure billing portal for supported changes."],
    href: "/support"
  },
  {
    id: "builders",
    category: "Builders & plans",
    title: "Create, save and preview a plan",
    summary: "Choose a builder, answer its guided questions, preview the result and save your plan.",
    answer: "Open Explore Builders, choose a planning template and complete each guided step. Use Preview before saving, then save the plan to your customer account.",
    keywords: ["builder", "plan", "template", "save", "preview", "download", "create", "guided", "questions"],
    steps: ["Open Explore Builders.", "Choose a template and complete the guided questions.", "Preview the result, then save it to your account."],
    href: "/support"
  },
  {
    id: "usage",
    category: "Builders & plans",
    title: "Builder usage and plan access",
    summary: "Understand plan access, usage limits and why a builder may not be available.",
    answer: "Builder availability depends on your active subscription and any usage controls shown in your account. Check your Membership and Customer Usage pages, then reopen the builder.",
    keywords: ["usage", "limit", "credits", "tokens", "allowance", "unlimited", "locked", "access", "membership"],
    steps: ["Open Membership to confirm the active plan.", "Review Customer Usage for current usage.", "Return to Explore Builders and reopen the builder."],
    href: "/support"
  },
  {
    id: "privacy",
    category: "Privacy & data",
    title: "Privacy and data requests",
    summary: "Request access, correction, deletion or another data-protection action.",
    answer: "Open Privacy & Data in your account and choose the appropriate request type. Provide enough detail for the team to identify the information and track the request from the same page.",
    keywords: ["privacy", "data", "gdpr", "delete", "deletion", "access request", "dsar", "correction", "information"],
    steps: ["Open Privacy & Data.", "Choose the request type and provide the requested details.", "Track the request from your account."],
    href: "/privacy-settings"
  },
  {
    id: "technical",
    category: "Technical support",
    title: "Website or builder not working",
    summary: "Try safe checks for loading, saving, preview and browser errors.",
    answer: "Refresh the page once, confirm you are still signed in, and retry in a single browser tab. Do not repeatedly clear all browser data. If the same error continues, create an enquiry with the page, time and exact message shown.",
    keywords: ["error", "not working", "broken", "blank", "loading", "load", "save", "preview", "download", "browser"],
    steps: ["Refresh the affected page once.", "Confirm you are signed in and use one browser tab.", "If it continues, create an enquiry with the affected page and exact error."],
    href: "/support"
  },
  {
    id: "accessibility",
    category: "Accessibility",
    title: "Accessibility and additional support",
    summary: "Find accessibility controls and ask for additional assistance.",
    answer: "Use the website accessibility controls where available. For support with a particular builder or plan, create an enquiry and explain the adjustment or alternative format that would help.",
    keywords: ["accessibility", "disabled", "disability", "screen reader", "contrast", "font", "additional support", "adjustment"],
    steps: ["Open the accessibility controls.", "Select the display or motion adjustment you need.", "Create an enquiry if you need an additional adjustment."],
    href: "/support"
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function clean(value, max = 4000) {
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

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function settingsMap(DB) {
  if (!DB) return {};
  try {
    const result = await DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'ai_chatbot_%'").all();
    return Object.fromEntries((result.results || []).map((row) => [row.key, row.value]));
  } catch {
    return {};
  }
}

function configFrom(settings) {
  return {
    enabled: bool(settings.ai_chatbot_enabled, DEFAULT_CONFIG.enabled),
    allowAnonymous: bool(settings.ai_chatbot_allow_anonymous, DEFAULT_CONFIG.allowAnonymous),
    selfHelpEnabled: bool(settings.ai_chatbot_self_help_enabled, DEFAULT_CONFIG.selfHelpEnabled),
    escalationEnabled: bool(settings.ai_chatbot_escalation_enabled, DEFAULT_CONFIG.escalationEnabled),
    assistantName: clean(settings.ai_chatbot_name || DEFAULT_CONFIG.assistantName, 80),
    welcomeMessage: clean(settings.ai_chatbot_welcome_message || DEFAULT_CONFIG.welcomeMessage, 500),
    responseTime: clean(settings.ai_chatbot_response_time || DEFAULT_CONFIG.responseTime, 120),
    maxSelfHelpTurns: integer(settings.ai_chatbot_max_self_help_turns, DEFAULT_CONFIG.maxSelfHelpTurns, 1, 8),
    provider: ["built_in", "workers_ai"].includes(settings.ai_chatbot_provider) ? settings.ai_chatbot_provider : DEFAULT_CONFIG.provider,
    model: clean(settings.ai_chatbot_model || DEFAULT_CONFIG.model, 180),
    tone: ["friendly", "professional", "concise"].includes(settings.ai_chatbot_tone) ? settings.ai_chatbot_tone : DEFAULT_CONFIG.tone,
    escalationPrompt: clean(settings.ai_chatbot_escalation_prompt || DEFAULT_CONFIG.escalationPrompt, 500)
  };
}

function knowledgeFrom(settings) {
  try {
    const parsed = JSON.parse(settings.ai_chatbot_knowledge_json || "[]");
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_ARTICLES;
    return parsed.slice(0, 100).map((article, index) => ({
      id: clean(article.id || `article-${index + 1}`, 80),
      category: clean(article.category || "General", 80),
      title: clean(article.title, 160),
      summary: clean(article.summary, 500),
      answer: clean(article.answer || article.summary, 2400),
      keywords: Array.isArray(article.keywords)
        ? article.keywords.map((item) => clean(item, 80)).filter(Boolean).slice(0, 30)
        : clean(article.keywords, 800).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30),
      steps: Array.isArray(article.steps)
        ? article.steps.map((item) => clean(item, 300)).filter(Boolean).slice(0, 10)
        : clean(article.steps, 1600).split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 10),
      href: clean(article.href || "/support", 300)
    })).filter((article) => article.title && article.answer);
  } catch {
    return DEFAULT_ARTICLES;
  }
}

function tokens(value) {
  return clean(value, 4000)
    .toLowerCase()
    .replace(/[^a-z0-9@]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function articleScore(article, message) {
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

function bestArticles(articles, message) {
  return articles
    .map((article) => ({ article, score: articleScore(article, message) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function looksNegative(message) {
  return /\b(no|nope|not solved|did not work|didn't work|still|human|person|agent|contact|enquiry|support team)\b/i.test(message);
}

function looksPositive(message) {
  return /\b(yes|yep|solved|fixed|worked|thank you|thanks|helpful)\b/i.test(message);
}

function categoryFor(article) {
  const value = String(article?.category || "General Enquiry").toLowerCase();
  if (value.includes("billing") || value.includes("subscription")) return "Billing";
  if (value.includes("privacy") || value.includes("data")) return "Data Protection";
  if (value.includes("accessibility")) return "Accessibility";
  if (value.includes("technical") || value.includes("builder") || value.includes("account")) return "Technical Support";
  return "General Enquiry";
}

function builtInAnswer(config, articles, message, history) {
  const turnCount = Array.isArray(history)
    ? history.filter((item) => item && item.role === "user").length
    : 0;

  if (looksPositive(message)) {
    return {
      reply: "I’m glad that helped. You can ask another question at any time.",
      suggestions: ["Ask another question", "Open the Help Centre"],
      escalate: false,
      resolved: true
    };
  }

  if (looksNegative(message)) {
    return {
      reply: config.escalationEnabled
        ? config.escalationPrompt
        : "Please use the Help Centre or email japlanstudio@jagroupservices.co.uk for further assistance.",
      suggestions: config.escalationEnabled ? ["Create an enquiry", "Try another question"] : ["Open the Help Centre"],
      escalate: config.escalationEnabled,
      resolved: false
    };
  }

  const matches = bestArticles(articles, message);
  const best = matches[0];

  if (!config.selfHelpEnabled) {
    return {
      reply: config.escalationEnabled
        ? config.escalationPrompt
        : "Self-help answers are currently unavailable. Please email japlanstudio@jagroupservices.co.uk.",
      suggestions: config.escalationEnabled ? ["Create an enquiry"] : [],
      escalate: config.escalationEnabled,
      resolved: false
    };
  }

  if (!best || best.score < 3) {
    const shouldEscalate = turnCount >= config.maxSelfHelpTurns;
    return {
      reply: shouldEscalate && config.escalationEnabled
        ? `I have not found a confident Help Centre answer after ${config.maxSelfHelpTurns} attempts. ${config.escalationPrompt}`
        : "I can help, but I need a little more detail. Which area is your question about?",
      suggestions: shouldEscalate && config.escalationEnabled
        ? ["Create an enquiry", "Try another question"]
        : CATEGORY_SUGGESTIONS,
      escalate: shouldEscalate && config.escalationEnabled,
      resolved: false
    };
  }

  const article = best.article;
  const steps = (article.steps || []).filter(Boolean);
  const reply = [
    article.answer,
    steps.length ? `Try these steps:\n${steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}` : "",
    "Did this solve the problem?"
  ].filter(Boolean).join("\n\n");

  return {
    reply,
    suggestions: ["Yes, that solved it", "No, I still need help", "Open the Help Centre"],
    article: {
      id: article.id,
      title: article.title,
      category: article.category,
      summary: article.summary,
      href: article.href || "/support"
    },
    category: categoryFor(article),
    suggestedSubject: article.title,
    escalate: false,
    resolved: false
  };
}

async function workersAiAnswer(env, config, articles, message, history) {
  if (
    config.provider !== "workers_ai" ||
    !config.model ||
    !env.AI ||
    typeof env.AI.run !== "function"
  ) return null;

  const matches = bestArticles(articles, message).filter((item) => item.score > 0).slice(0, 3);
  const context = matches.length
    ? matches.map(({ article }) => [
        `TITLE: ${article.title}`,
        `CATEGORY: ${article.category}`,
        `ANSWER: ${article.answer}`,
        `STEPS: ${(article.steps || []).join(" | ")}`,
        `LINK: ${article.href || "/support"}`
      ].join("\n")).join("\n\n")
    : "No confident Help Centre article matched.";

  const recent = Array.isArray(history)
    ? history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: clean(item.content || item.text, 1200)
      })).filter((item) => item.content)
    : [];

  try {
    const result = await env.AI.run(config.model, {
      messages: [
        {
          role: "system",
          content: [
            `You are ${config.assistantName}, the JA Plan Studio Help Centre assistant.`,
            "Answer only from the supplied Help Centre context.",
            "Do not invent account, billing, legal, travel-booking or service information.",
            "Give short practical steps. If the context is insufficient, say so and offer a Contact Enquiry.",
            `Tone: ${config.tone}.`
          ].join(" ")
        },
        { role: "system", content: `HELP CENTRE CONTEXT:\n${context}` },
        ...recent,
        { role: "user", content: message }
      ]
    });
    const response = clean(result?.response || result?.result?.response || result?.text || "", 3500);
    if (!response) return null;
    const best = matches[0]?.article;
    return {
      reply: response,
      suggestions: ["Yes, that solved it", "No, I still need help", "Open the Help Centre"],
      article: best ? {
        id: best.id,
        title: best.title,
        category: best.category,
        summary: best.summary,
        href: best.href || "/support"
      } : undefined,
      category: categoryFor(best),
      suggestedSubject: best?.title || clean(message, 120),
      escalate: false,
      resolved: false,
      source: "workers_ai"
    };
  } catch (error) {
    console.error(JSON.stringify({
      event: "support_assistant_ai_failed",
      message: clean(error?.message || error, 240)
    }));
    return null;
  }
}

async function recordConversation(DB, request, body, result) {
  if (!DB) return;
  try {
    await DB.prepare(`CREATE TABLE IF NOT EXISTS support_ai_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      customer_email TEXT,
      role TEXT,
      message TEXT,
      response_source TEXT,
      matched_article TEXT,
      escalated INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`).run();
    const sessionId = clean(body.sessionId || request.headers.get("cf-ray") || crypto.randomUUID(), 120);
    const email = clean(request.headers.get("x-ja-auth-email") || body.email, 254).toLowerCase();
    await DB.prepare(`INSERT INTO support_ai_messages
      (id,session_id,customer_email,role,message,response_source,matched_article,escalated)
      VALUES (?,?,?,?,?,?,?,?)`)
      .bind(
        crypto.randomUUID(),
        sessionId,
        email || null,
        "user",
        clean(body.message, 2000),
        result.source || "built_in",
        result.article?.id || null,
        result.escalate ? 1 : 0
      ).run();
  } catch {
    // Conversation analytics must never prevent the visitor receiving help.
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const settings = await settingsMap(env.DB);
  const config = configFrom(settings);
  const articles = knowledgeFrom(settings);
  const identityEmail = clean(request.headers.get("x-ja-auth-email"), 254).toLowerCase();

  if (request.method === "GET") {
    return json({
      success: true,
      config: {
        enabled: config.enabled,
        allowAnonymous: config.allowAnonymous,
        selfHelpEnabled: config.selfHelpEnabled,
        escalationEnabled: config.escalationEnabled,
        assistantName: config.assistantName,
        welcomeMessage: config.welcomeMessage,
        responseTime: config.responseTime,
        maxSelfHelpTurns: config.maxSelfHelpTurns
      },
      categories: Array.from(new Set(articles.map((article) => article.category))).filter(Boolean),
      articleCount: articles.length
    });
  }

  if (request.method !== "POST") return json({ success: false, error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ success: false, error: "Request origin was rejected." }, 403);
  if (!config.enabled) return json({ success: false, error: "The support assistant is currently unavailable." }, 503);
  if (!identityEmail && !config.allowAnonymous) {
    return json({ success: false, error: "Please sign in to use the support assistant." }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const message = clean(body.message, 2000);
  if (message.length < 2) return json({ success: false, error: "Please enter a question." }, 400);

  let result = await workersAiAnswer(env, config, articles, message, body.history);
  if (!result) {
    result = {
      ...builtInAnswer(config, articles, message, body.history),
      source: "built_in"
    };
  }

  await recordConversation(env.DB, request, body, result);
  return json({
    success: true,
    assistantName: config.assistantName,
    responseTime: config.responseTime,
    ...result
  });
}
