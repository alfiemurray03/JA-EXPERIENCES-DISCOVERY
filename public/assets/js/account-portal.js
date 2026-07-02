const portalState = { profile: null, requests: null, pins: null, saved: null };

const navItems = [
  ["/account/dashboard/", "Overview"],
  ["/account/profile/", "My Profile"],
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

window.JAPortal = { shell, loadProfile, loadRequests, loadPins, loadSaved, updateShared, timelineItems, timelineMarkup, fmt, escapeHtml, initials, state: portalState };

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.portalPage || "dashboard";
  const needsRequests = new Set(["dashboard", "membership", "support", "messages", "data", "bookings", "saved"]);
  const needsPins = page === "security";
  const needsSaved = new Set(["dashboard", "membership", "bookings", "saved"]);
  const titleMap = {
    dashboard: ["Overview", "Live overview of your account activity, support and membership."],
    profile: ["Profile", "Your master customer record, identity and preferences."],
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
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-8">
          <h2>Quick actions</h2>
          <div class="portal-quick-actions">
            <a class="portal-action" href="/account/profile/"><strong>View profile</strong><span>Master customer record</span></a>
            <a class="portal-action" href="/account/security/"><strong>Security centre</strong><span>Sessions and PINs</span></a>
            <a class="portal-action" href="/account/support/"><strong>Support centre</strong><span>Tickets and requests</span></a>
            <a class="portal-action" href="/account/downloads/"><strong>Downloads</strong><span>Invoices and exports</span></a>
          </div>
        </article>
        <article class="portal-card portal-span-4">
          <h2>Membership summary</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Plan</span><strong>${escapeHtml(profile.currentPlan || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Lifetime access</span><strong>${profile.lifetimeAccess ? "Enabled" : "Not enabled"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Stripe status</span><strong>${profile.stripeCustomerId ? "Linked" : "Not linked"}</strong></div>
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
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-12">
          <details open>
            <summary><strong>Personal details</strong></summary>
            <div class="portal-form-grid">
              <label class="portal-field"><span class="portal-label">Display name</span><input id="profileDisplayName" value="${escapeHtml(profile.displayName || "")}"></label>
              <label class="portal-field"><span class="portal-label">Contact email</span><input id="profileContactEmail" value="${escapeHtml(profile.contactEmail || profile.email || "")}"></label>
              <label class="portal-field"><span class="portal-label">Phone</span><input id="profilePhone" value="${escapeHtml(profile.phone || "")}"></label>
              <label class="portal-field"><span class="portal-label">Communication preference</span><select id="profileComms"><option>Email</option><option>Phone</option><option>Email first, phone if urgent</option></select></label>
            </div>
          </details>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Microsoft Entra identity</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Tenant ID</span><strong>${escapeHtml(profile.microsoftTenantId || "Not provided")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Object ID</span><strong>${escapeHtml(profile.microsoftObjectId || "Not provided")}</strong></div>
            <label class="portal-field"><span class="portal-label">Preferred username</span><input value="${escapeHtml(profile.microsoftPreferredUsername || "")}" disabled><small>Managed by Microsoft Entra</small></label>
            <label class="portal-field"><span class="portal-label">Preferred language</span><input value="${escapeHtml(profile.microsoftPreferredLanguage || "")}"><small>Editable where Microsoft Graph permits.</small></label>
            <div class="portal-entry"><span class="portal-label">Last sync</span><strong>${escapeHtml(fmt(profile.microsoftUpdatedAt))}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Account metadata</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Current plan</span><strong>${escapeHtml(profile.currentPlan || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Stripe customer</span><strong>${escapeHtml(profile.stripeCustomerId || "Not provided")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Verification</span><strong>${escapeHtml(profile.verificationStatus || "Not provided")}</strong></div>
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
        contactEmail: document.getElementById("profileContactEmail").value,
        phone: document.getElementById("profilePhone").value,
        communicationPreference: document.getElementById("profileComms").value,
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
            <div class="portal-entry"><span class="portal-label">Stripe customer</span><strong>${profile.stripeCustomerId ? "Linked" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Accessibility</span><strong>Readable, keyboard-friendly layout</strong></div>
          </div>
        </article>
      </section>`;
    return;
  }

  if (page === "security") {
    const pins = await loadPins(true).catch(() => ({ pins: [] }));
    const activePinRecord = (pins.pins || []).find((pin) => pin.active_pin) || (pins.pins || [])[0] || null;
    const activePinValue = activePinRecord?.active_pin || "PIN UNAVAILABLE";
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
              ${(pins.pins || []).map((pin) => `<div class="portal-entry" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#fff"><strong>${escapeHtml(pin.active_pin || activePin || `${pin.status || "Active"} PIN`)}</strong><small>Status: ${escapeHtml(pin.status || "Active")} · Created ${escapeHtml(fmt(pin.created_at))} · Expires ${escapeHtml(fmt(pin.expires_at))}</small></div>`).join("") || `<div class="portal-note inline" style="color:#fff;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)">Your support PIN is ready and will appear here automatically.</div>`}
            </div>
          </div>
          <div class="portal-actions" style="margin-top:1rem">
            <button class="portal-action" type="button" data-pin-action="rotate"><strong>Rotate PIN</strong><span>Refresh the active PIN</span></button>
            <button class="portal-action" type="button" data-pin-action="revoke"><strong>Revoke PIN</strong><span>Disable this PIN</span></button>
            <button class="portal-action" type="button" data-pin-action="copy"><strong>Copy PIN</strong><span>Copy the active PIN to your clipboard</span></button>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Security history</h2>
          ${timelineMarkup(timelineItems(profile, requests).slice(0, 6))}
        </article>
      </section>`;
    pageRoot.querySelectorAll("[data-pin-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.pinAction;
        const target = pins.pins?.[0]?.id || "";
        if (action === "copy") {
          const currentPin = activePinRecord?.active_pin || activePinValue;
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
    return;
  }

  if (page === "membership") {
    const saved = portalState.saved || { items: [] };
    const savedDestinations = (saved.items || []).filter((item) => item.item_type === "destination");
    const savedExperiences = (saved.items || []).filter((item) => item.item_type === "experience");
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Plan</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Current plan</span><strong>${escapeHtml(profile.currentPlan || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Membership tier</span><strong>${escapeHtml(profile.membershipStatus || profile.customerStatus || "Standard")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Billing interval</span><strong>${escapeHtml(profile.membershipInterval || "Monthly")}</strong></div>
            <div class="portal-entry"><span class="portal-label">Status</span><strong>${escapeHtml(profile.subscriptionStatus || (profile.stripeCustomerId ? "Active" : "Not linked"))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Renewal date</span><strong>${escapeHtml(fmt(profile.membershipRenewalAt || profile.updatedAt))}</strong></div>
            <div class="portal-entry"><span class="portal-label">Cancellation date</span><strong>${escapeHtml(fmt(profile.membershipCancellationAt))}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Benefits</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Included services</span><strong>Support, data protection requests, downloads and account management</strong></div>
            <div class="portal-entry"><span class="portal-label">Latest invoice</span><strong>${profile.stripeCustomerId ? "Available in Stripe-backed records" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Payment status</span><strong>${profile.subscriptionStatus || "Not available"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Payment history</span><strong>${profile.stripeCustomerId ? "Shown from existing Stripe data" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Saved destinations</span><strong>${savedDestinations.length}</strong></div>
            <div class="portal-entry"><span class="portal-label">Saved experiences</span><strong>${savedExperiences.length}</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-12">
          <h2>Billing history</h2>
          <div class="portal-note inline">${profile.stripeCustomerId ? "Invoices, receipts and payment confirmations are surfaced from existing Stripe records." : "No Stripe customer is linked yet, so billing history is not available."}</div>
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
    pageRoot.innerHTML = `
      <section class="portal-grid">
        <article class="portal-card portal-span-6">
          <h2>Downloads</h2>
          <div class="portal-stack">
            <div class="portal-entry"><span class="portal-label">Invoices</span><strong>${profile.stripeCustomerId ? "Available from Stripe records" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Receipts</span><strong>${profile.stripeCustomerId ? "Available from Stripe records" : "Not linked"}</strong></div>
            <div class="portal-entry"><span class="portal-label">Exported data</span><strong>Available on request</strong></div>
          </div>
        </article>
        <article class="portal-card portal-span-6">
          <h2>Documents</h2>
          <div class="portal-note inline">Invoices, receipts, itineraries, reports and exported data are shown here when available.</div>
        </article>
      </section>`;
    return;
  }

  pageRoot.innerHTML = `<div class="portal-note inline">This section is not available right now.</div>`;
}
