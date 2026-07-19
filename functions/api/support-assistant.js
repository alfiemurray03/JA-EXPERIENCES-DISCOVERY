import {
  builtInAnswer,
  clean,
  configFrom,
  knowledgeFrom,
  loadAssistantSettings,
  workersAiAnswer
} from "../_shared/support-assistant-core.js";
import { guidedEscalation } from "../_shared/support-assistant-triage.js";
import {
  recordAssistantEvent,
  recordAssistantExchange
} from "../_shared/support-assistant-monitor.js";

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

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function onRequest(context) {
  const { request, env } = context;
  const settings = await loadAssistantSettings(env.DB);
  const config = configFrom(settings);
  const articles = knowledgeFrom(settings);
  const identityEmail = clean(request.headers.get("x-ja-auth-email"), 254).toLowerCase();
  const now = Date.now();
  const scheduledStart = config.maintenanceStart ? Date.parse(config.maintenanceStart) : 0;
  const scheduledEnd = config.maintenanceEnd ? Date.parse(config.maintenanceEnd) : 0;
  const scheduledMaintenance = Boolean(scheduledStart && now >= scheduledStart && (!scheduledEnd || now <= scheduledEnd));
  const maintenanceActive = config.maintenanceEnabled || scheduledMaintenance;

  if (request.method === "GET") {
    return json({
      success: true,
      config: {
        enabled: config.enabled,
        maintenanceEnabled: maintenanceActive,
        maintenanceMessage: config.maintenanceMessage,
        maintenanceStart: config.maintenanceStart,
        maintenanceEnd: config.maintenanceEnd,
        maintenanceAllowEnquiries: config.maintenanceAllowEnquiries,
        allowAnonymous: config.allowAnonymous,
        selfHelpEnabled: config.selfHelpEnabled,
        escalationEnabled: config.escalationEnabled,
        assistantName: config.assistantName,
        logoUrl: config.logoUrl,
        avatarUrl: config.avatarUrl,
        fontFamily: config.fontFamily,
        welcomeMessage: config.welcomeMessage,
        responseTime: config.responseTime,
        maxSelfHelpTurns: config.maxSelfHelpTurns,
        position: config.position,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        panelWidth: config.panelWidth,
        panelHeight: config.panelHeight,
        borderRadius: config.borderRadius,
        launcherSize: config.launcherSize,
        launcherLabel: config.launcherLabel,
        inputPlaceholder: config.inputPlaceholder,
        showPoweredBy: config.showPoweredBy,
        autoOpenDelaySeconds: config.autoOpenDelaySeconds
      },
      categories: Array.from(new Set(articles.map((article) => article.category))).filter(Boolean),
      articleCount: articles.length,
      articles: articles.map((article) => ({
        id: article.id,
        category: article.category,
        title: article.title,
        summary: article.summary,
        answer: article.answer,
        steps: article.steps,
        href: article.href || "/help-centre"
      }))
    });
  }

  if (request.method !== "POST") return json({ success: false, error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ success: false, error: "Request origin was rejected." }, 403);

  const body = await request.json().catch(() => ({}));
  const event = clean(body.event, 40).toLowerCase();
  if (["open", "heartbeat", "close"].includes(event)) {
    await recordAssistantEvent(env.DB, request, body, event);
    return json({ success: true, event });
  }

  if (!config.enabled) return json({ success: false, error: "The support assistant is currently unavailable." }, 503);
  if (maintenanceActive) {
    return json({ success: false, error: config.maintenanceMessage, maintenance: true }, 503);
  }
  if (!identityEmail && !config.allowAnonymous) {
    return json({ success: false, error: "Please sign in to use the support assistant." }, 401);
  }

  const message = clean(body.message, 2000);
  if (message.length < 2) return json({ success: false, error: "Please enter a question." }, 400);

  let result = guidedEscalation(config, message, body.history);
  if (!result) result = await workersAiAnswer(env, config, articles, message, body.history);
  if (!result) result = builtInAnswer(config, articles, message, body.history);
  await recordAssistantExchange(env.DB, request, body, result, config.provider === "workers_ai" ? config.model : "");

  return json({
    success: true,
    assistantName: config.assistantName,
    responseTime: config.responseTime,
    ...result
  });
}
