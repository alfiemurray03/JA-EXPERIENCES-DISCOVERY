const TRIAGE_MARKER = "Escalation check";

const FLOWS = {
  account: {
    label: "Account or sign-in",
    category: "Technical Support",
    priority: "High",
    questions: [
      "Are you trying to access the customer account or the Admin Centre?",
      "What happens when you try to sign in, including the exact error message if one appears?",
      "Which device and browser are you using?",
      "When did the problem begin, and does it happen every time?"
    ]
  },
  billing: {
    label: "Billing or subscription",
    category: "Billing",
    priority: "High",
    questions: [
      "Which subscription plan or transaction is affected?",
      "Was a payment taken? If so, provide the date, amount and invoice or receipt reference only.",
      "Is this about a renewal, cancellation, trial, failed payment or unexpected charge?",
      "What outcome would you like the support team to investigate?"
    ]
  },
  builders: {
    label: "Builders or saved plans",
    category: "Technical Support",
    priority: "Normal",
    questions: [
      "Which planning builder or saved plan is affected?",
      "Were you trying to save, preview, edit or download the plan?",
      "What happened, including any exact error message shown?",
      "Can you reproduce the problem, and which device and browser are you using?"
    ]
  },
  privacy: {
    label: "Privacy or data",
    category: "Data Protection",
    priority: "High",
    questions: [
      "Does this concern access, correction, deletion, objection, restriction or a suspected data incident?",
      "Which account, record or information is affected? Please do not include passwords or authentication codes.",
      "When did you first become aware of the issue?",
      "Is there any immediate risk to your personal data or account security?"
    ]
  },
  technical: {
    label: "Technical problem",
    category: "Technical Support",
    priority: "Normal",
    questions: [
      "Which page or feature is affected?",
      "What were you trying to do when the problem occurred?",
      "What exact error message or unexpected behaviour appeared?",
      "Are you using the installed app or the website, and which device and browser are you using?",
      "What time did it happen, and does it happen repeatedly?"
    ]
  },
  general: {
    label: "General support",
    category: "General Enquiry",
    priority: "Normal",
    questions: [
      "Please briefly describe what you need the support team to help with.",
      "Which page, account or service does this concern?",
      "What have you already tried, and what outcome do you need?"
    ]
  }
};

function text(value) {
  return String(value || "").trim();
}

function normaliseHistory(history) {
  return Array.isArray(history)
    ? history.slice(-20).map((item) => ({
        role: item?.role === "assistant" ? "assistant" : "user",
        content: text(item?.content || item?.text)
      })).filter((item) => item.content)
    : [];
}

function detectFlow(message, history) {
  const all = `${history.map((item) => item.content).join(" ")} ${message}`.toLowerCase();
  if (/privacy|data|gdpr|delete|deletion|dsar|breach|personal information/.test(all)) return "privacy";
  if (/bill|subscription|payment|charge|invoice|refund|stripe|renewal|trial/.test(all)) return "billing";
  if (/builder|saved plan|preview|download|save|template|itinerary/.test(all)) return "builders";
  if (/login|log in|sign in|account|microsoft|pin|authentication/.test(all)) return "account";
  if (/error|broken|not working|loading|blank|website|app|browser|technical/.test(all)) return "technical";
  return "general";
}

function triageStarted(history) {
  return history.some((item) => item.role === "assistant" && item.content.includes(TRIAGE_MARKER));
}

function escalationRequested(message) {
  return /\b(no|not solved|did not work|didn't work|still|human|person|agent|contact|enquiry|escalate|support team)\b/i.test(message);
}

function answeredQuestionCount(history) {
  let count = 0;
  for (let index = 0; index < history.length; index += 1) {
    const item = history[index];
    if (item.role !== "assistant" || !item.content.includes(TRIAGE_MARKER)) continue;
    const next = history[index + 1];
    if (next?.role === "user" && next.content) count += 1;
  }
  return count;
}

function urgentPriority(flowKey, message, history) {
  const all = `${history.map((item) => item.content).join(" ")} ${message}`.toLowerCase();
  if (/data breach|account takeover|hacked|security incident|fraud|immediate risk|service-wide|everyone|all users/.test(all)) return "Urgent";
  if (/payment taken|charged twice|locked out|cannot access paid|paid service unavailable|suspended/.test(all)) return "High";
  return FLOWS[flowKey].priority;
}

export function guidedEscalation(config, message, rawHistory) {
  if (!config?.escalationEnabled) return null;
  const history = normaliseHistory(rawHistory);
  const started = triageStarted(history);
  if (!started && !escalationRequested(message)) return null;

  const flowKey = detectFlow(message, history);
  const flow = FLOWS[flowKey];
  const answered = answeredQuestionCount(history);

  if (answered < flow.questions.length) {
    const questionNumber = answered + 1;
    return {
      reply: `${TRIAGE_MARKER} ${questionNumber} of ${flow.questions.length} — ${flow.label}\n\n${flow.questions[answered]}\n\nFor your security, never provide a password, full payment-card number, security code or authentication code.`,
      suggestions: [],
      category: flow.category,
      suggestedSubject: `${flow.label} support request`,
      escalate: false,
      resolved: false,
      source: "guided_triage"
    };
  }

  const priority = urgentPriority(flowKey, message, history);
  return {
    reply: `Thank you — I have collected the relevant details. I can now escalate this to the JA Plan Studio team.\n\nCategory: ${flow.label}\nPriority: ${priority}\n\nI will now escalate this issue to the JA Plan Studio Support Team. Signed-in customers will receive an ENQ reference automatically. If you are signed out, I will only ask for the contact details needed for the team to reply. The full conversation and your answers will be attached automatically.`,
    suggestions: ["Continue escalation", "Try another question"],
    category: flow.category,
    suggestedSubject: `[${priority}] ${flow.label} support request`,
    escalate: true,
    resolved: false,
    priority,
    source: "guided_triage"
  };
}
