const portalState = { profile: null, requests: null, pins: null, saved: null, billing: null, builders: null };

const navItems = [
  ["/account/dashboard/", "Overview"],
  ["/account/profile/", "My Profile"],
  ["/account/tokens/", "Builder Usage Tokens"],
  ["/account/builders/", "My Builders"],
  ["/account/settings/", "Settings"],
  ["/account/security/", "Security"],
  ["/account/bookings/", "Bookings"],
  ["/account/subscription/", "Membership"],
  ["/account/saved/", "Saved Experiences"],
  ["/account/messages/", "Messages"],
  ["/account/enquiries/", "Support"],
  ["/account/data-protection/", "Data Protection"],
  ["/account/downloads/", "Downloads"]
];

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const initials = (value) => String(value || "JA").trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "JA";
const fmt = (value) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not available";
const money = (value, currency = "gbp") => Number.isFinite(Number(value))
  ? new Intl.NumberFormat("en-GB", { style: "currency", currency: String(currency || "gbp").toUpperCase() }).format(Number(value) / 100)
  : "Not available";

function shell(title, lead) {
  const root = document.getElementById("portalRoot");
  if (!root) return;
  const active = (href) => href === window.location.pathname ? "active" : "";
  root.innerHTML = `
    <div class="portal-shell">
      <aside class="portal-sidebar">
        <div class="portal-brand">
          <div class="portal-mark">JA</div>
          <div class="portal-brand-copy">
            <strong>JA Experiences &amp; Discovery</strong>
            <span>Customer account centre</span>
          </div>
        </div>
        <div class="portal-person">
          <div class="portal-avatar" id="sidebarAvatar">JA</div>
          <div>
            <strong id="sidebarName">Customer account</strong>
            <span id="sidebarEmail">Signed in securely</span>
          </div>
          <span class="portal-status" id="sidebarStatus">Secure</span>
        </div>
        <nav class="portal-nav" aria-label="Customer portal navigation">
          <div class="portal-nav-group">
            <div class="portal-nav-heading">Portal</div>
            ${navItems.map(([href, label]) => `<a class="portal-nav-link ${active(href)}" href="${href}">${label}</a>`).join("")}
          </div>
        </nav>
        <div class="portal-sidebar-footer">
          <a class="portal-button secondary" href="/">&larr; Back to JA Experiences &amp; Discovery</a>
          <a class="portal-button" href="/account/profile/">View profile</a>
          <a class="portal-button secondary" href="/account/logout">Sign out</a>
        </div>
      </aside>
      <main class="portal-main">
        <div class="portal-wrap" id="portalContent"></div>
      </main>
    </div>`;

  const content = document.getElementById("portalContent");
  content.innerHTML = `
    <section class="portal-hero">
      <div>
        <span class="portal-eyebrow">Customer portal</span>
        <h1>${escapeHtml(title)}</h1>
        <p class="portal-lead">${escapeHtml(lead)}</p>
      </div>
      <div class="portal-hero-panel">
        <div class="portal-entry"><span class="portal-label">Account</span><strong id="heroAccount">Loading…</strong></div>
        <div class="portal-entry"><span class="portal-label">Status</span><strong id="heroStatus">Loading…</strong></div>
        <div class="portal-entry"><span class="portal-label">Last sync</span><strong id="heroSync">Loading…</strong></div>
        <div class="portal-entry"><span class="portal-label">Notifications</span><strong id="heroNotifications">Loading…</strong></div>
      </div>
    </section>
    <section id="portalPage"></section>`;
}

async function loadProfile() {
  if (portalState.profile) return portalState.profile;
  const response = await fetch("/account/profile", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Profile data unavailable.");
  const payload = await response.json();
  portalState.profile = payload.profile || payload;
  return portalState.profile;
}

async function loadRequests() {
  if (portalState.requests) return portalState.requests;
  const response = await fetch("/account/requests", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) return {};
  portalState.requests = await response.json().catch(() => ({}));
  return portalState.requests;
}

async function loadPins(force = false) {
  if (!force && portalState.pins) return portalState.pins;
  const response = await fetch("/account/pins", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) return { pins: [] };
  portalState.pins = await response.json().catch(() => ({ pins: [] }));
  return portalState.pins;
}

async function loadSaved() {
  if (portalState.saved) return portalState.saved;
  const response = await fetch("/account/saved", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) return { items: [] };
  portalState.saved = await response.json().catch(() => ({ items: [] }));
  return portalState.saved;
}

async function loadBilling() {
  if (portalState.billing) return portalState.billing;
  const response = await fetch("/account/billing", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Billing data unavailable.");
  portalState.billing = payload;
  return payload;
}

async function loadBuilders(force = false) {
  if (!force && portalState.builders) return portalState.builders;
  const response = await fetch("/account/builders", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) return { builders: [], outputs: [], ledger: [], blocked_attempts: [], token_summary: {} };
  portalState.builders = await response.json().catch(() => ({ builders: [], outputs: [], ledger: [], blocked_attempts: [], token_summary: {} }));
  return portalState.builders;
}

async function openStripeBillingPortal() {
  const response = await fetch("/account/billing", {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: "{}"
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) throw new Error(payload.error || "Stripe Billing Portal could not be opened.");
  window.location.assign(payload.url);
}

function updateShared(profile = {}) {
  const name = profile.displayName || profile.verifiedName || profile.name || "Customer";
  const email = profile.email || "";
  document.getElementById("sidebarName").textContent = name;
  document.getElementById("sidebarEmail").textContent = email || "Signed in securely";
  document.getElementById("sidebarAvatar").textContent = initials(name);
  document.getElementById("heroAccount").textContent = name;
  document.getElementById("heroStatus").textContent = profile.lifetimeAccess ? "Lifetime access" : (profile.customerStatus || "Active session");
  document.getElementById("heroSync").textContent = fmt(profile.microsoftUpdatedAt || profile.updatedAt || profile.createdAt);
  document.getElementById("heroNotifications").textContent = `${(portalState.requests?.notifications || []).filter((n) => n.status !== "Read" && n.status !== "Archived").length} unread`;
}

function timelineItems(profile = {}, requests = {}) {
  const items = [
    { label: "Account created", detail: fmt(profile.createdAt) },
    { label: "Microsoft sign in", detail: fmt(profile.microsoftUpdatedAt || profile.updatedAt) },
    { label: "Profile updated", detail: fmt(profile.updatedAt) }
  ];

  (requests.dataProtectionRequests || []).slice(0, 2).forEach((request) => {
    items.push({ label: "GDPR request submitted", detail: `${escapeHtml(request.reference || "Request")} · ${fmt(request.submitted_at || request.created_at)}` });
  });

  (requests.systemReports || []).slice(0, 2).forEach((report) => {
    items.push({ label: "Website issue reported", detail: `${escapeHtml(report.reference || "Report")} · ${fmt(report.submitted_at || report.created_at)}` });
  });

  return items;
}

function timelineMarkup(items = []) {
  if (!items.length) {
    return '<div class="portal-note inline">No timeline activity yet.</div>';
  }

  return `<div class="portal-timeline">${items.map((item) => `
    <article class="portal-timeline-item">
      <span class="portal-timeline-dot" aria-hidden="true"></span>
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.detail)}</small>
      </div>
    </article>
  `).join("")}</div>`;
}

function portalTable(headers, rows = []) {
  if (!rows.length) return '<div class="portal-note inline">No records yet.</div>';
  return `
    <div class="portal-table-wrap">
      <table class="portal-table">
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell || "").startsWith("<") ? cell : escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

window.JAPortal = { shell, loadProfile, loadRequests, loadPins, loadSaved, loadBilling, loadBuilders, updateShared, timelineItems, timelineMarkup, fmt, escapeHtml, initials, state: portalState };

document.addEventListener("click", async (event) => {
  const archive = event.target.closest('[data-action="archive-builder-output"]');
  if (archive) {
    archive.disabled = true;
    await fetch("/account/builders", {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive_output", id: archive.dataset.id })
    });
    portalState.builders = null;
    await loadBuilders(true);
    await renderPage("builders");
    return;
  }

  const button = event.target.closest('[data-action="manage-stripe-billing"]');
  if (!button) return;
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "Opening Stripe…";
  try {
    await openStripeBillingPortal();
  } catch (error) {
    button.disabled = false;
    button.textContent = originalText;
    window.alert(error.message || "Stripe Billing Portal could not be opened.");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("portalRoot")) return;

  const page = document.body.dataset.portalPage || "dashboard";
  const needsRequests = new Set(["dashboard", "membership", "support", "messages", "data", "bookings", "saved"]);
  const needsPins = page === "security";
  const needsSaved = new Set(["dashboard", "membership", "bookings", "saved", "builders"]);
  const needsBuilders = new Set(["dashboard", "profile", "tokens", "builders", "membership"]);
  const needsBilling = new Set(["membership", "downloads"]);
  const titleMap = {
    dashboard: ["Overview", "Live overview of your account activity, support and membership."],
    profile: ["Profile", "Your master customer record, identity and preferences."],
    tokens: ["Builder Usage Tokens", "View your token balance, allowance, usage ledger and blocked attempts."],
    builders: ["My Builders", "Saved builder outputs, plans and self-service planning history."],
    settings: ["Settings", "Control preferences, accessibility and session behaviour."],
    security: ["Security", "Manage sessions, sign-ins and support access settings."],
    bookings: ["Bookings", "Your upcoming, past and cancelled bookings."],
    membership: ["Membership", "Plan, benefits, Stripe status and billing history."],
    support: ["Support", "Tickets, enquiries, issues and conversation history."],
    data: ["Data Protection", "Subject access, deletion and other privacy requests."],
    downloads: ["Downloads", "Invoices, receipts, exports and support documents."],
    saved: ["Saved Experiences", "Wishlists, favourites and recently viewed items."],
    messages: ["Messages", "Notifications and conversations in one inbox."],
    notifications: ["Notifications", "System, support and membership notifications."]
  };

  shell(...(titleMap[page] || ["Customer portal", "Secure customer account centre."]));

  try {
    const bootstrap = [loadProfile()];
    if (needsRequests.has(page)) bootstrap.push(loadRequests());
    if (needsPins) bootstrap.push(loadPins());
    if (needsSaved.has(page)) bootstrap.push(loadSaved());
    if (needsBuilders.has(page)) bootstrap.push(loadBuilders());
    if (needsBilling.has(page)) bootstrap.push(loadBilling());
    await Promise.all(bootstrap);
    updateShared(portalState.profile || {});
    await renderPage(page);
  } catch (error) {
    document.getElementById("portalPage").innerHTML = `<div class="portal-note inline">${escapeHtml(error.message || "Unable to load account data.")}</div>`;
  }
});

async function renderPage(page) {
  const profile = portalState.profile || {};
  const requests = portalState.requests || {};
  const pageRoot = document.getElementById("portalPage");
  if (!pageRoot) return;

  if (page === "dashboard") {
    const builderData = portalState.builders || {};
    const tokenSummary = builderData.token_summary || {};
    const outputs = Array.isArray(builderData.outputs) ? builderData.outputs : [];
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-8">
          <h2>Quick actions</h2>
          <div class="portal-quick-actions">
            <a class="portal-action" href="/account/profile/"><strong>View profile</strong><span>Master customer record</span></a>
            <a class="portal-action" href="/account/tokens/"><strong>Builder Usage Tokens</strong><span>${escapeHtml(String(tokenSummary.remaining_tokens ?? "0"))} remaining</span></a>
            <a class="portal-action" href="/builders/"><strong>Open builders</strong><span>Opening/viewing does not deduct tokens</span></a>
            <a class="portal-action" href="/account/security/"><strong>Security centre</strong><span>Sessions and PINs</span></a>
            <a class="portal-action" href="/account/support/"><strong>Support centre</strong><span>Tickets and requests</span></a>
            <a class="portal-action" href="/account/downloads/"><strong>Downloads</strong><span>Invoices and exports</span></a>
          </div>
        </article>
        <article class="portal-card portal-span-4">
          <h2>Membership summary</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Plan</span><strong>${escapeHtml(profile.currentPlan || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Builder Usage Tokens</span><strong>${escapeHtml(String(tokenSummary.remaining_tokens ?? "0"))} remaining</strong></div>
            <div class="portal-entry"><span class="portal-label">Saved builder outputs</span><strong>${escapeHtml(String(outputs.length))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Lifetime access</span><strong>${profile.lifetimeAccess ? "Enabled" : "Not enabled"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Stripe status</span><strong>${profile.stripeLinked ? "Linked" : "Not linked"}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Recent activity</h2>
          ${timelineMarkup(timelineItems(profile, requests).slice(0, 5))}
        </article>
        <article class="portal-card portal-span-6">
          <h2>Latest support activity</h2>
          <div class="portal-stack">
            ${(requests.dataProtectionRequests || []).slice(0, 2).map((request) => `
              <div class="portal-entry"><strong>${escapeHtml(request.reference)}</strong><small>${escapeHtml(request.request_type || "Data request")} · ${escapeHtml(request.status || "New")}</small></div>
            `).join("") || '<div class="portal-note inline">No recent requests yet.</div>'}
          </div>
        </article>
      </section>`;
    return;
  }

  if (page === "profile") {
    const builderData = portalState.builders || {};
    const tokenSummary = builderData.token_summary || {};
    const builderOutputs = Array.isArray(builderData.outputs) ? builderData.outputs : [];
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-12">
          <details open>
            <summary><strong>Personal details</strong></summary>
            <div class="portal-form-grid">
              <label class="portal-field"><span class="portal-label">Display name</span><input id="profileDisplayName" value="${escapeHtml(profile.displayName || "")}"></label>
              <label class="portal-field"><span class="portal-label">Given name</span><input id="profileGivenName" value="${escapeHtml(profile.microsoftGivenName || "")}"></label>
              <label class="portal-field"><span class="portal-label">Surname</span><input id="profileFamilyName" value="${escapeHtml(profile.microsoftFamilyName || "")}"></label>
              <label class="portal-field"><span class="portal-label">Phone</span><input id="profilePhone" value="${escapeHtml(profile.phone || "")}"></label>
              <label class="portal-field"><span class="portal-label">Communication preference</span><select id="profileComms"><option>Email</option><option>Phone</option><option>Email first, phone if urgent</option></select></label>
              <label class="portal-field"><span class="portal-label">Preferred language</span><input id="profilePreferredLanguage" value="${escapeHtml(profile.microsoftPreferredLanguage || "")}"></label>
              <label class="portal-field"><span class="portal-label">Mobile phone</span><input id="profileMobilePhone" value="${escapeHtml(profile.microsoftMobilePhone || "")}"></label>
              <label class="portal-field"><span class="portal-label">Office location</span><input id="profileOfficeLocation" value="${escapeHtml(profile.microsoftOfficeLocation || "")}"></label>
              <label class="portal-field"><span class="portal-label">City</span><input id="profileCity" value="${escapeHtml(profile.microsoftCity || "")}"></label>
              <label class="portal-field"><span class="portal-label">State</span><input id="profileState" value="${escapeHtml(profile.microsoftState || "")}"></label>
              <label class="portal-field"><span class="portal-label">Country</span><input id="profileCountry" value="${escapeHtml(profile.microsoftCountry || "")}"></label>
              <label class="portal-field"><span class="portal-label">Postal code</span><input id="profilePostalCode" value="${escapeHtml(profile.microsoftPostalCode || "")}"></label>
              <label class="portal-field"><span class="portal-label">Street address</span><input id="profileStreetAddress" value="${escapeHtml(profile.microsoftStreetAddress || "")}"></label>
            </div>
          </details>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Microsoft Entra identity</h2>
            <div class="portal-stack">
              <div class="portal-entry"><span class="portal-label">Tenant ID</span><strong>${escapeHtml(profile.microsoftTenantId || "Not provided")}</strong></div>
              <div class="portal-entry"><span class="portal-label">Object ID</span><strong>${escapeHtml(profile.microsoftObjectId || "Not provided")}</strong></div>
              <label class="portal-field"><span class="portal-label">Preferred username</span><input value="${escapeHtml(profile.microsoftPreferredUsername || "")}" disabled><small>Managed by Microsoft Entra</small></label>
              <div class="portal-entry"><span class="portal-label">Last sync</span><strong>${escapeHtml(fmt(profile.microsoftUpdatedAt))}</strong></div>
              <div class="portal-entry"><span class="portal-label">Graph sync</span><strong>${profile.graphSyncSuccess ? "Success" : "Not confirmed"}</strong></div>
              <div class="portal-entry"><span class="portal-label">Last Graph sync</span><strong>${escapeHtml(fmt(profile.graphSyncLastAt || profile.microsoftUpdatedAt))}</strong></div>
              <div class="portal-entry"><span class="portal-label">Last Graph HTTP status</span><strong>${escapeHtml(profile.graphSyncLastHttpStatus ? String(profile.graphSyncLastHttpStatus) : "Not available")}</strong></div>
              <div class="portal-entry"><span class="portal-label">Last Graph failure</span><strong>${escapeHtml(profile.graphSyncFailureReason || "None")}</strong></div>
            </div>
          </article>
        <article class="portal-card portal-span-6">
          <h2>Account metadata</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Current plan</span><strong>${escapeHtml(profile.currentPlan || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Stripe billing</span><strong>${profile.stripeLinked ? "Linked" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Verification</span><strong>${escapeHtml(profile.verificationStatus || "Not provided")}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Builder Usage Tokens</h2>
          <div class="portal-grid mini">
            <div class="portal-entry"><span class="portal-label">Remaining tokens</span><strong>${escapeHtml(String(tokenSummary.remaining_tokens ?? 0))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Used tokens</span><strong>${escapeHtml(String(tokenSummary.used_tokens ?? 0))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Trial tokens</span><strong>${escapeHtml(String(tokenSummary.trial_tokens ?? 0))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Purchased tokens</span><strong>${escapeHtml(String(tokenSummary.purchased_addon_tokens ?? 0))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Trial status</span><strong>${tokenSummary.trial_active ? "Active" : tokenSummary.trial ? "Used/expired" : "Not activated"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Saved outputs</span><strong>${escapeHtml(String(builderOutputs.length))}</strong></div>
          </div>
          <p class="portal-note inline">${escapeHtml(tokenSummary.deduction_rule || "Builder Usage Tokens are deducted only when a finished builder output is saved successfully. Opening, selecting, typing and previewing do not deduct tokens.")}</p>
          <div class="portal-form-actions">
            <a class="portal-button" href="/builders/">Open Experience Builders</a>
            <a class="portal-button secondary" href="/account/tokens/">View token ledger</a>
          </div>
          <div class="portal-stack">
            ${builderOutputs.slice(0, 4).map((output) => `
              <div class="portal-entry"><strong>${escapeHtml(output.title || output.builder_name || "Builder output")}</strong><small>${escapeHtml(output.builder_name || "Experience Builder")} · ${escapeHtml(fmt(output.created_at))}</small></div>
            `).join("") || '<div class="portal-note inline">No saved builder outputs yet.</div>'}
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Privacy and consent</h2>
          <div class="portal-form-grid">
            <label class="portal-field"><span class="portal-label">Support notes</span><textarea id="profileSupportNotes">${escapeHtml(profile.supportNotes || "")}</textarea></label>
            <div class="portal-stack">
              <div class="portal-entry"><span class="portal-label">Microsoft display name</span><strong>${escapeHtml(profile.microsoftDisplayName || "Not provided")}</strong></div>
              <div class="portal-entry"><span class="portal-label">Country</span><strong>${escapeHtml(profile.microsoftCountry || "Not provided")}</strong></div>
              <div class="portal-entry"><span class="portal-label">Job title</span><strong>${escapeHtml(profile.microsoftJobTitle || "Not provided")}</strong></div>
              <div class="portal-entry"><span class="portal-label">Graph sync status</span><strong>${profile.graphSyncSuccess ? "Latest values confirmed" : "Last sync needs attention"}</strong></div>
            </div>
          </div>
          <div class="portal-form-actions">
            <button class="portal-button" type="button" id="saveProfileBtn">Save changes</button>
          </div>
        </article>
      </section>`;
    document.getElementById("profileComms").value = profile.communicationPreference || "Email";
    document.getElementById("saveProfileBtn").addEventListener("click", async () => {
      const payload = {
        displayName: document.getElementById("profileDisplayName").value,
        givenName: document.getElementById("profileGivenName").value,
        familyName: document.getElementById("profileFamilyName").value,
        phone: document.getElementById("profilePhone").value,
        communicationPreference: document.getElementById("profileComms").value,
        preferredLanguage: document.getElementById("profilePreferredLanguage").value,
        mobilePhone: document.getElementById("profileMobilePhone").value,
        officeLocation: document.getElementById("profileOfficeLocation").value,
        city: document.getElementById("profileCity").value,
        state: document.getElementById("profileState").value,
        country: document.getElementById("profileCountry").value,
        postalCode: document.getElementById("profilePostalCode").value,
        streetAddress: document.getElementById("profileStreetAddress").value,
        supportNotes: document.getElementById("profileSupportNotes").value,
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent: false
      };
      const response = await fetch("/account/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "Profile could not be saved.");
        return;
      }
      portalState.profile = data.profile;
      updateShared(portalState.profile);
      await renderPage("profile");
    });
    return;
  }

  if (page === "settings") {
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Appearance</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Theme</span><strong>Default portal theme</strong></div>
            <div class="portal-entry"><span class="portal-label">Density</span><strong>Comfortable</strong></div>
            <div class="portal-entry"><span class="portal-label">Motion</span><strong>Reduced where preferred</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Communication and privacy</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Language</span><strong>${escapeHtml(profile.microsoftPreferredLanguage || "English (United Kingdom)")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Marketing consent</span><strong>${profile.marketingConsent ? "Enabled" : "Disabled"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Privacy preferences</span><strong>Managed in your account record</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Notifications</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Account alerts</span><strong>On</strong></div>
            <div class="portal-entry"><span class="portal-label">Support updates</span><strong>On</strong></div>
            <div class="portal-entry"><span class="portal-label">Membership updates</span><strong>On</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Connected account</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Microsoft Entra</span><strong>${profile.microsoftEmail ? "Connected" : "Not connected"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Stripe customer</span><strong>${profile.stripeLinked ? "Linked" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Accessibility</span><strong>Readable, keyboard-friendly layout</strong></div>
          </div>
        </article>
      </section>`;
    return;
  }

  if (page === "security") {
    const pins = await loadPins(true).catch(() => ({ pins: [] }));
    const activePinRecord = (pins.pins || []).find((pin) => pin.active_pin) || (pins.pins || [])[0] || null;
    let activePinValue = activePinRecord?.active_pin || "";
    let activePinList = pins.pins || [];
    const securityQuestions = pins.security_questions || [];

    if (!activePinValue) {
      const generated = await fetch("/account/pins", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" })
      }).then((response) => response.json().catch(() => ({}))).catch(() => ({}));
      if (generated?.pin) {
        activePinValue = generated.pin;
        activePinList = [{
          id: generated.id || "generated",
          active_pin: generated.pin,
          pin_last4: generated.pin.slice(-4),
          status: "Active",
          expires_at: generated.expiresAt || "",
          used_at: null,
          revoked_at: null,
          revoked_by: null,
          last_used_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }];
        portalState.pins = { pins: activePinList };
      }
    }

    if (!activePinValue) activePinValue = "PIN UNAVAILABLE";
    const activePinId = activePinList[0]?.id || activePinRecord?.id || "";
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Microsoft Entra connection</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Connected</span><strong>${profile.microsoftEmail ? "Yes" : "Unknown"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Last sign-in</span><strong>${escapeHtml(fmt(profile.microsoftUpdatedAt || profile.updatedAt))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Account verification</span><strong>${escapeHtml(profile.verificationStatus || "Not provided")}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>One-time PINs</h2>
          <div class="portal-note inline">Support staff may request this PIN to verify identity before discussing the account. The backend stores only hashed PINs.</div>
          <div class="portal-surface" style="background:rgba(9,14,30,.82);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:1.25rem;color:#fff;box-shadow:0 20px 50px rgba(3,8,25,.2)">
            <div class="portal-eyebrow" style="color:rgba(255,255,255,.68);">ONE TIME SUPPORT PIN</div>
            <div style="font-size:2rem;font-weight:800;letter-spacing:.2em;margin:.25rem 0 1rem;">
              ${escapeHtml(activePinValue)}
            </div>
            <div class="portal-stack" id="pinHistory">
              ${activePinList.map((pin) => `<div class="portal-entry" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#fff"><strong>${escapeHtml(pin.active_pin || activePinValue || `${pin.status || "Active"} PIN`)}</strong><small>Status: ${escapeHtml(pin.status || "Active")} · Created ${escapeHtml(fmt(pin.created_at))} · Expires ${escapeHtml(fmt(pin.expires_at))}</small></div>`).join("") || `<div class="portal-note inline" style="color:#fff;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)">Your support PIN is ready and will appear here automatically.</div>`}
            </div>
          </div>
          <div class="portal-actions" style="margin-top:1rem">
            <button class="portal-action" type="button" data-pin-action="rotate"><strong>Rotate PIN</strong><span>Refresh the active PIN</span></button>
            <button class="portal-action" type="button" data-pin-action="revoke"><strong>Revoke PIN</strong><span>Disable this PIN</span></button>
            <button class="portal-action" type="button" data-pin-action="copy"><strong>Copy PIN</strong><span>Copy the active PIN to your clipboard</span></button>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Security Questions</h2>
          <div class="portal-note inline">Configure recovery questions for support identity verification. Stored answers are hashed and are never displayed.</div>
          <form class="portal-stack" id="securityQuestionsForm">
            ${[0, 1, 2].map((index) => `
              <div class="portal-entry">
                <label>Question ${index + 1}<input id="security_question_${index}" type="text" value="${escapeHtml(securityQuestions[index]?.question_label || "")}" autocomplete="off"></label>
                <label>Answer ${index + 1}<input id="security_answer_${index}" type="password" autocomplete="off"></label>
              </div>
            `).join("")}
            <button class="portal-button" type="submit">Save Security Questions</button>
          </form>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Security history</h2>
          ${timelineMarkup(timelineItems(profile, requests).slice(0, 6))}
        </article>
      </section>`;
    pageRoot.querySelectorAll("[data-pin-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.pinAction;
        const target = activePinId;
        if (action === "copy") {
          const currentPin = activePinValue;
          if (!currentPin || currentPin === "PIN UNAVAILABLE") {
            alert("Generate or rotate the PIN first.");
            return;
          }
          await navigator.clipboard.writeText(currentPin).catch(() => {});
          alert("Support PIN copied.");
          return;
        }
        const response = await fetch("/account/pins", {
          method: "POST",
          credentials: "include",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ action, id: target })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          alert(data.error || "PIN action failed.");
          return;
        }
        portalState.pins = null;
        await renderPage("security");
      });
    });
    document.getElementById("securityQuestionsForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const questions = [0, 1, 2].map((index) => ({
        question: document.getElementById(`security_question_${index}`)?.value || "",
        answer: document.getElementById(`security_answer_${index}`)?.value || ""
      })).filter((item) => item.question.trim() && item.answer.trim());
      const response = await fetch("/account/pins", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_questions", questions })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "Security questions could not be saved.");
        return;
      }
      portalState.pins = null;
      alert("Security questions saved.");
      await renderPage("security");
    });
    return;
  }

  if (page === "tokens") {
    const data = portalState.builders || await loadBuilders();
    const summary = data.token_summary || {};
    const ledger = Array.isArray(data.ledger) ? data.ledger : [];
    const attempts = Array.isArray(data.blocked_attempts) ? data.blocked_attempts : [];
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card"><h2>Token balance</h2><div class="portal-stack">
          <div class="portal-entry"><span class="portal-label">Plan</span><strong>${escapeHtml(summary.plan_name || "Not available")}</strong></div>
          <div class="portal-entry"><span class="portal-label">Monthly allowance</span><strong>${escapeHtml(String(summary.monthly_allowance ?? 0))}</strong></div>
          <div class="portal-entry"><span class="portal-label">Remaining tokens</span><strong>${escapeHtml(String(summary.remaining_tokens ?? 0))}</strong></div>
          <div class="portal-entry"><span class="portal-label">Used tokens</span><strong>${escapeHtml(String(summary.used_tokens ?? 0))}</strong></div>
          <div class="portal-entry"><span class="portal-label">Purchased add-on tokens</span><strong>${escapeHtml(String(summary.purchased_addon_tokens ?? 0))}</strong></div>
          <div class="portal-entry"><span class="portal-label">Trial expiry</span><strong>${escapeHtml(fmt(summary.trial?.expires_at))}</strong></div>
        </div></article>
        <article class="portal-card"><h2>How tokens work</h2><p>${escapeHtml(summary.deduction_rule || "Builder Usage Tokens are deducted only on completed saved outputs.")}</p><a class="portal-button" href="/builders/">Open Experience Builders</a></article>
      </section>
      <section class="portal-card"><h2>Token ledger</h2>${portalTable(["Date", "Amount", "Source", "Reason", "Balance"], ledger.map((item) => [fmt(item.created_at), item.amount, item.source, item.reason, item.balance_after]))}</section>
      <section class="portal-card"><h2>Blocked attempts</h2>${portalTable(["Date", "Builder", "Reason", "Available", "Required", "Action"], attempts.map((item) => [fmt(item.created_at), item.builder_name, item.reason, item.tokens_available, item.tokens_required, item.action_offered]))}</section>
    `;
    return;
  }

  if (page === "builders") {
    const data = portalState.builders || await loadBuilders();
    const outputs = Array.isArray(data.outputs) ? data.outputs : [];
    pageRoot.innerHTML = `
      <section class="portal-card"><h2>Saved builder outputs and plans</h2>
        ${portalTable(["Created", "Builder", "Title", "Tokens used", "Status", "Action"], outputs.map((item) => [fmt(item.created_at), item.builder_name, item.title, item.token_cost, item.status, `<button class="portal-button secondary" type="button" data-action="archive-builder-output" data-id="${escapeHtml(item.id)}">Archive</button>`]))}
      </section>
    `;
    return;
  }

  if (page === "membership") {
    const saved = portalState.saved || { items: [] };
    const billing = portalState.billing || {};
    const subscription = billing.subscription;
    const savedDestinations = (saved.items || []).filter((item) => item.item_type === "destination");
    const savedExperiences = (saved.items || []).filter((item) => item.item_type === "experience");
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-12">
          <div class="portal-card-heading">
            <div><h2>Manage Membership</h2><p>Payments, invoices, billing details and subscription controls are securely managed by Stripe.</p></div>
            <button class="portal-button" type="button" data-action="manage-stripe-billing" ${billing.portalAvailable ? "" : "disabled"}>Manage Billing with Stripe</button>
          </div>
          ${billing.portalAvailable ? "" : '<div class="portal-note inline">No Stripe billing account is linked to this customer profile.</div>'}
        </article>
        <article class="portal-card portal-span-6">
          <h2>Live membership</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Current plan</span><strong>${escapeHtml(subscription?.plan || profile.currentPlan || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Membership status</span><strong>${escapeHtml(subscription?.membershipStatus || profile.customerStatus || "Not active")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Billing status</span><strong>${escapeHtml(subscription?.billingStatus || "Not available")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Billing interval</span><strong>${escapeHtml(subscription?.billingInterval || "Not available")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Renewal date</span><strong>${escapeHtml(fmt(subscription?.renewalDate))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Next payment date</span><strong>${escapeHtml(fmt(subscription?.nextPaymentDate))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Subscription start</span><strong>${escapeHtml(fmt(subscription?.subscriptionStartDate))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Subscription reference</span><strong>${escapeHtml(subscription?.subscriptionReference || "Not available")}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Billing details</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Payment method</span><strong>${escapeHtml(subscription?.paymentMethod || "Not available")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Trial status</span><strong>${escapeHtml(subscription?.trialStatus || "No trial")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Trial end</span><strong>${escapeHtml(fmt(subscription?.trialEndDate))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Cancellation</span><strong>${escapeHtml(subscription?.cancellationStatus || "Not scheduled")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Scheduled cancellation</span><strong>${escapeHtml(fmt(subscription?.scheduledCancellationDate))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Saved destinations</span><strong>${savedDestinations.length}</strong></div>
            <div class="portal-entry"><span class="portal-label">Saved experiences</span><strong>${savedExperiences.length}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Billing responsibility</h2>
          <div class="portal-note inline">Stripe securely manages payment methods, invoices, billing details, subscription changes and cancellations. JA Experiences &amp; Discovery displays synchronised status only.</div>
        </article>
      </section>`;
    return;
  }

  if (page === "support" || page === "messages") {
    const supportCases = requests.supportCases || [];
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Search knowledge base</h2>
          <div class="portal-note inline">Search support articles, travel help, payments, memberships, refunds, accessibility and account guidance.</div>
          <div class="portal-actions">
            <a class="portal-action" href="/enquiry/"><strong>Create request</strong><span>Open a new support case</span></a>
            <a class="portal-action" href="/account/data-protection/"><strong>GDPR request</strong><span>Use the privacy centre</span></a>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Tickets</h2>
          <div class="portal-stack">
            ${supportCases.slice(0, 3).map((request) => `
              <div class="portal-entry"><strong>${escapeHtml(request.reference)}</strong><small>Status: ${escapeHtml(request.status || "New")} · Team: ${escapeHtml(request.assigned_department || "Support")} · Updated ${escapeHtml(fmt(request.updated_at || request.created_at))}</small></div>
            `).join("") || '<div class="portal-note inline">No support tickets yet. Create a request and the team will respond here.</div>'}
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Categories</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Membership</span><strong>Plan help and entitlement questions</strong></div>
            <div class="portal-entry"><span class="portal-label">Billing</span><strong>Stripe payments, invoices and receipts</strong></div>
            <div class="portal-entry"><span class="portal-label">Technical</span><strong>Website errors and account issues</strong></div>
            <div class="portal-entry"><span class="portal-label">Data Protection</span><strong>Privacy and rights requests</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Conversation history</h2>
          <div class="portal-stack">${timelineMarkup((requests.timeline || []).slice(0, 6))}</div>
        </article>
      </section>`;
    return;
  }

  if (page === "data") {
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Information</h2>
          <div class="portal-note inline">The Data Protection Act 2018 and UK GDPR give you rights over your personal information. JA Group Services Ltd and its trading names are registered with the ICO.</div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Rights</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Access</span><strong>Subject Access Request</strong></div>
            <div class="portal-entry"><span class="portal-label">Rectification</span><strong>Request corrections to your details</strong></div>
            <div class="portal-entry"><span class="portal-label">Erasure</span><strong>Request deletion where lawful</strong></div>
            <div class="portal-entry"><span class="portal-label">Portability</span><strong>Request a portable copy of your data</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Request history</h2>
          <div class="portal-stack">
            ${(requests.dataProtectionRequests || []).map((request) => `
              <div class="portal-entry"><strong>${escapeHtml(request.reference)}</strong><small>${escapeHtml(request.request_type || "Request")} · ${escapeHtml(request.status || "New")} · Due ${escapeHtml(fmt(request.due_at || request.updated_at))}</small></div>
            `).join("") || '<div class="portal-note inline">No privacy requests yet. Submit one through the support team when needed.</div>'}
          </div>
        </article>
      </section>`;
    return;
  }

  if (page === "notifications") {
    const notifications = requests.notifications || [];
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Notification summary</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Unread</span><strong>${notifications.filter((n) => n.status !== "Read").length}</strong></div>
            <div class="portal-entry"><span class="portal-label">Read</span><strong>${notifications.filter((n) => n.status === "Read").length}</strong></div>
            <div class="portal-entry"><span class="portal-label">Archived</span><strong>${notifications.filter((n) => n.status === "Archived").length}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Notification inbox</h2>
          <div class="portal-stack">
            ${(notifications.slice(0, 5).map((notification) => `
              <div class="portal-entry"><strong>${escapeHtml(notification.title)}</strong><small>${escapeHtml(notification.category)} · ${escapeHtml(notification.priority || "Normal")} · ${escapeHtml(notification.status || "Unread")}</small></div>
            `).join("")) || '<div class="portal-note inline">No notifications yet.</div>'}
          </div>
        </article>
      </section>`;
    return;
  }

  if (page === "saved") {
    const saved = portalState.saved || { items: [] };
    const savedDestinations = (saved.items || []).filter((item) => item.item_type === "destination");
    const savedExperiences = (saved.items || []).filter((item) => item.item_type === "experience");
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Favourite destinations</h2>
          <div class="portal-stack">
            ${savedDestinations.map((item) => `<div class="portal-entry"><strong>${escapeHtml(item.item_title)}</strong><small>${escapeHtml(item.category || item.source_page || "Destination")}</small><button class="portal-mini" type="button" data-saved-remove="destination" data-item-key="${escapeHtml(item.item_key)}">Remove</button></div>`).join("") || '<div class="portal-note inline">No favourite destinations yet. Save destinations while browsing to build your shortlist.</div>'}
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Saved experiences</h2>
          <div class="portal-stack">
            ${savedExperiences.map((item) => `<div class="portal-entry"><strong>${escapeHtml(item.item_title)}</strong><small>${escapeHtml(item.category || item.source_page || "Experience")}</small><button class="portal-mini" type="button" data-saved-remove="experience" data-item-key="${escapeHtml(item.item_key)}">Remove</button></div>`).join("") || '<div class="portal-note inline">No saved experiences yet. Add experiences to keep them in one place.</div>'}
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Recently viewed</h2>
          <div class="portal-note inline">Recently viewed destinations and experiences will appear here as you browse the site.</div>
        </article>
      </section>`;
    pageRoot.querySelectorAll("[data-saved-remove]").forEach((button) => {
      button.addEventListener("click", async () => {
        const response = await fetch("/account/saved", {
          method: "POST",
          credentials: "include",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove",
            item_type: button.dataset.savedRemove,
            item_key: button.dataset.itemKey,
            item_title: button.closest(".portal-entry")?.querySelector("strong")?.textContent || button.dataset.itemKey
          })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          alert(data.error || "Unable to remove saved item.");
          return;
        }
        portalState.saved = data;
        await renderPage("saved");
      });
    });
    return;
  }

  if (page === "bookings") {
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>My travel planner</h2>
          <div class="portal-note inline">Save trip ideas, favourite destinations, experiences and notes here while you plan your visit.</div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Planning checklist</h2>
          <div class="portal-note inline">No trips are saved yet. Add destinations and experiences to create a personal shortlist.</div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Recent activity</h2>
          ${timelineMarkup(timelineItems(profile, requests).slice(0, 4))}
        </article>
      </section>`;
    return;
  }

  if (page === "downloads") {
    const billing = portalState.billing || {};
    const invoices = Array.isArray(billing.invoices) ? billing.invoices : [];
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-12">
          <div class="portal-card-heading">
            <div><h2>Recent invoices</h2><p>Recent Stripe invoice references cached for your account.</p></div>
            <button class="portal-button" type="button" data-action="manage-stripe-billing" ${billing.portalAvailable ? "" : "disabled"}>View All Invoices in Stripe</button>
          </div>
          <div class="portal-stack">
            ${invoices.slice(0, 5).map((invoice) => `
              <div class="portal-entry">
                <div><strong>${escapeHtml(invoice.reference)}</strong><small>${escapeHtml(fmt(invoice.date))} · ${escapeHtml(invoice.status)}</small></div>
                <strong>${escapeHtml(money(invoice.amountPaid ?? invoice.amountDue, invoice.currency))}</strong>
              </div>
            `).join("") || '<div class="portal-note inline">No cached Stripe invoices are available.</div>'}
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Other documents</h2>
          <div class="portal-note inline">Customer data exports and support documents remain available through their relevant portal sections. Stripe remains the source of truth for invoices and receipts.</div>
        </article>
      </section>`;
    return;
  }

  pageRoot.innerHTML = `<div class="portal-note inline">This section is not available right now.</div>`;
}
