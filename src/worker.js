const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function submitEnquiry(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Please check the form and try again." }, 400);
  }

  if (clean(body.website, 100)) {
    return json({ ok: true, reference: "JA-RECEIVED" });
  }

  const submittedAt = Number(body.startedAt);
  if (!submittedAt || Date.now() - submittedAt < 2500) {
    return json({ ok: false, message: "Please wait a moment and submit the form again." }, 400);
  }

  const enquiry = {
    name: clean(body.name, 100),
    email: clean(body.email, 160).toLowerCase(),
    telephone: clean(body.telephone, 40),
    formType: clean(body.formType, 80),
    enquiryType: clean(body.enquiryType, 120),
    plan: clean(body.plan, 120),
    destination: clean(body.destination, 120),
    dates: clean(body.dates, 120),
    travellers: clean(body.travellers, 120),
    travellerType: clean(body.travellerType, 120),
    budget: clean(body.budget, 120),
    supportNeeds: clean(body.supportNeeds, 1500),
    message: clean(body.message, 4000),
    socialTariff: Boolean(body.socialTariff),
    specialCategoryConsent: Boolean(body.specialCategoryConsent),
    transportConfirmed: Boolean(body.transportConfirmed),
    privacyAccepted: Boolean(body.privacyAccepted)
  };

  if (!enquiry.name || !isValidEmail(enquiry.email) || !enquiry.message || !enquiry.privacyAccepted) {
    return json({ ok: false, message: "Please complete your name, email, enquiry and privacy confirmation." }, 400);
  }

  if (enquiry.supportNeeds && !enquiry.specialCategoryConsent) {
    return json({ ok: false, message: "Sensitive-information consent is required when support needs are included." }, 400);
  }

  if (enquiry.formType === "Free Discovery Enquiry" && !enquiry.transportConfirmed) {
    return json({ ok: false, message: "Please confirm that you understand the travel and transport responsibility." }, 400);
  }

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO_EMAIL || !env.ENQUIRY_FROM_EMAIL) {
    console.error("Enquiry email environment variables are not configured.");
    return json({
      ok: false,
      message: "Online forms are temporarily unavailable. Please try again later."
    }, 503);
  }

  const reference = `JED-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const rows = [
    ["Reference", reference],
    ["Form", enquiry.formType || "Website enquiry"],
    ["Enquiry type", enquiry.enquiryType || "Not specified"],
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Telephone", enquiry.telephone || "Not provided"],
    ["Requested plan", enquiry.plan || "Free Discovery Enquiry"],
    ["Destination", enquiry.destination || "Not decided"],
    ["Dates", enquiry.dates || "Not provided"],
    ["Travellers", enquiry.travellers || "Not provided"],
    ["Traveller type", enquiry.travellerType || "Not provided"],
    ["Budget", enquiry.budget || "Not provided"],
    ["Social tariff requested", enquiry.socialTariff ? "Yes" : "No"],
    ["Support or access needs", enquiry.supportNeeds || "None provided"],
    ["Enquiry", enquiry.message]
  ];
  const htmlRows = rows.map(([label, value]) =>
    `<tr><th style="padding:8px;text-align:left;vertical-align:top;background:#f4f7fa">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
  ).join("");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM_EMAIL,
      to: [env.ENQUIRY_TO_EMAIL],
      reply_to: enquiry.email,
      subject: `${reference}: ${enquiry.enquiryType || enquiry.formType || "Website enquiry"} from ${enquiry.name}`,
      html: `<h1>New JA Experiences &amp; Discovery enquiry</h1><table style="border-collapse:collapse;width:100%;max-width:760px" border="1" cellpadding="0" cellspacing="0">${htmlRows}</table>`
    })
  });

  if (!emailResponse.ok) {
    console.error("Resend rejected enquiry email", emailResponse.status, await emailResponse.text());
    return json({
      ok: false,
      message: "We could not send your form. Please try again later."
    }, 502);
  }

  return json({
    ok: true,
    reference,
    message: "Thank you. Your form has been sent to JA Experiences & Discovery."
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const redirects = {
      "/activities": "/experiences/",
      "/activities/": "/experiences/",
      "/plans": "/pricing/",
      "/plans/": "/pricing/",
      "/free-enquiry": "/enquiry/",
      "/free-enquiry/": "/enquiry/"
    };

    if (redirects[url.pathname]) {
      return Response.redirect(new URL(redirects[url.pathname], url.origin), 301);
    }

    if (url.pathname === "/api/enquiries") {
      if (request.method !== "POST") {
        return json({ ok: false, message: "Method not allowed." }, 405);
      }
      return submitEnquiry(request, env);
    }

    if (url.pathname === "/health") {
      return json({ ok: true, service: "ja-experiences-discovery" });
    }

    return env.ASSETS.fetch(request);
  }
};
