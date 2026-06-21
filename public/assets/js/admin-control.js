const state = {
  currentSection: "overview",
  data: {},
  selectedPolicy: null
};

const sectionTitles = {
  overview: "Dashboard",
  admins: "Admin Users / Access Control",
  customers: "CRM / Customers",
  plans: "Plans & Prices",
  stripe: "Stripe API Controls",
  branding: "Company Branding",
  policies: "Legal Policies",
  support: "Support",
  system: "System / Issues",
  comingsoon: "Coming Soon Page",
  maintenance: "Maintenance Mode"
};

document.addEventListener("DOMContentLoaded", () => {
  bindNav();
  bindAccountMenu();
  bindAdminActions();
  loadSection("overview");
});

function bindNav() {
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => loadSection(button.dataset.section));
  });
}

function bindAccountMenu() {
  const button = document.getElementById("accountMenuButton");
  const menu = document.getElementById("accountMenu");
  const settings = document.getElementById("accountSettingsButton");

  if (!button || !menu) return;

  button.addEventListener("click", (event) => {
    if (event.target.closest("#accountMenu a") || event.target.closest("#accountMenu button")) return;
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!button.contains(event.target)) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }
  });

  settings?.addEventListener("click", () => {
    menu.hidden = true;
    openAccountModal();
  });
}

function bindAdminActions() {
  document.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;

    const type = action.dataset.action;

    if (type === "load-section") {
      loadSection(action.dataset.section);
    }

    if (type === "remove-admin") {
      removeAdmin(action.dataset.email);
    }

    if (type === "open-customer") {
      openCustomerDrawer(action.dataset.email);
    }

    if (type === "open-plan") {
      openPlanModal(action.dataset.id || "");
    }

    if (type === "close-modal") {
      closeModal();
    }

    if (type === "close-customer") {
      closeCustomerDrawer();
    }

    if (type === "refresh-stripe") {
      refreshStripe();
    }

    if (type === "select-policy") {
      selectPolicy(action.dataset.slug);
    }

    if (type === "toggle-policy-published") {
      await togglePolicyPublished(action.dataset.slug, action.checked);
    }
  });

  document.addEventListener("change", async (event) => {
    const target = event.target;

    if (target.matches("[data-plan-toggle]")) {
      await togglePlan(target.dataset.planToggle, target.checked);
    }

    if (target.matches("[data-record-status]")) {
      await updateRecordStatus(target.dataset.section, target.dataset.id, target.value);
    }
  });
}

async function api(section, options = {}) {
  const response = await fetch(`/admin/api?section=${encodeURIComponent(section)}`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Admin API problem.");
  return data;
}

async function loadSection(section) {
  state.currentSection = section;
  setTopbar(section);

  document.querySelectorAll("[data-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === section);
  });

  const panel = document.getElementById("adminPanel");
  panel.innerHTML = `<div class="admin-loading">Loading ${escapeHtml(sectionTitles[section] || section)}...</div>`;

  try {
    const data = await api(section);
    state.data[section] = data;
    if (data.admin) setAdmin(data.admin);
    renderSection(section, data);
  } catch (error) {
    panel.innerHTML = `<div class="admin-alert">${escapeHtml(error.message)}</div>`;
  }
}

function setTopbar(section) {
  const title = sectionTitles[section] || "Dashboard";
  document.querySelector(".admin-topbar-title strong").textContent = title;
  document.querySelector(".admin-topbar-title span").textContent = "JA Experiences & Discovery Administration";
}

function setAdmin(admin) {
  const email = admin.email || "";
  const name = admin.name && admin.name !== email ? admin.name : email.split("@")[0] || "JA admin";
  setText("adminName", name);
  setText("adminEmail", email);
  setText("adminStatus", "Admin access verified");
  document.querySelectorAll(".avatar").forEach((avatar) => {
    avatar.textContent = (name || email || "A").slice(0, 1).toUpperCase();
  });
}

function renderSection(section, data) {
  if (section === "overview") renderOverview(data.overview);
  if (section === "admins") renderAdmins(data.admins);
  if (section === "customers") renderCustomers(data.customers);
  if (section === "plans") renderPlans(data.plans);
  if (section === "stripe") renderStripe(data.stripe);
  if (section === "branding") renderBranding(data.branding);
  if (section === "policies") renderPolicies(data.policies);
  if (section === "support") renderSupport(data.support);
  if (section === "comingsoon") renderComingSoon(data.comingsoon);
  if (section === "maintenance") renderMaintenance(data.maintenance);
  if (section === "system") renderSystem(data.system);
}

function renderOverview(overview) {
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-grid">
      ${stat("Customers", overview.customers)}
      ${stat("Plans", overview.plans)}
      ${stat("Active plans", overview.activePlans)}
      ${stat("Policies", overview.policies)}
      ${stat("Support tickets", overview.supportTickets)}
      ${stat("Open issues", overview.openIssues)}
      ${stat("Coming Soon", overview.comingSoonStatus)}
      ${stat("Maintenance", overview.maintenanceStatus)}
      ${stat("Admins", overview.admins)}
    </div>

    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Admin Control Centre</h2>
          <p>Manage CRM records, access control, service plans, Stripe checks, company details, policies, support, system issues and public site status.</p>
        </div>
      </div>
      <div class="quick-grid">
        ${quick("admins", "⛨", "Admin Users / Access", "Manage authorised admin accounts")}
        ${quick("customers", "👥", "CRM / Customers", "Review customer records and Lifetime access")}
        ${quick("plans", "▣", "Plans & Prices", "Configure service plan cards and Stripe IDs")}
        ${quick("stripe", "▤", "Stripe API Controls", "Store keys and test account status")}
        ${quick("comingsoon", "◌", "Coming Soon Page", "Control the public pre-launch page")}
        ${quick("maintenance", "⛨", "Maintenance Mode", "Control public maintenance mode")}
        ${quick("policies", "▧", "Legal Policies", "Edit draft and published policy records")}
        ${quick("system", "⚠", "System / Issues", "Track operational issues")}
      </div>
    </div>
  `;
}

function quick(section, icon, title, text) {
  return `
    <button class="quick-card" type="button" data-action="load-section" data-section="${escapeAttr(section)}">
      <span class="quick-icon">${icon}</span>
      <span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></span>
    </button>
  `;
}

function renderAdmins(admins = []) {
  const rows = admins.map((admin) => `
    <tr>
      <td><strong>${escapeHtml(admin.email)}</strong><span>${escapeHtml(admin.name || "Admin user")}</span></td>
      <td>${badge(admin.source === "default" ? "Default" : "Portal", admin.source === "default" ? "green" : "")}</td>
      <td>${escapeHtml(admin.created_by || "system")}</td>
      <td>${escapeHtml(formatDate(admin.updated_at || admin.created_at))}</td>
      <td><button class="mini-button" type="button" data-action="remove-admin" data-email="${escapeAttr(admin.email)}">Remove</button></td>
    </tr>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Admin Users / Access Control</h2>
          <p>Add or remove Cloudflare Access-authenticated admin email addresses. Default environment admins remain protected.</p>
        </div>
      </div>

      <form class="admin-form" id="adminUserForm">
        ${input("Admin email", "new_admin_email", "email")}
        ${input("Display name", "new_admin_name")}
        <button class="admin-button" type="submit">Add admin</button>
      </form>

      <div id="adminUserSaved" class="admin-success" hidden></div>
      ${table(["Admin", "Source", "Added by", "Updated", "Actions"], rows)}
    </div>
  `;

  document.getElementById("adminUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await api("admins", {
      method: "POST",
      body: JSON.stringify({ email: getValue("new_admin_email"), name: getValue("new_admin_name") })
    });
    await loadSection("admins");
    const notice = document.getElementById("adminUserSaved");
    if (notice) {
      notice.hidden = false;
      notice.textContent = "Admin added. They can access once their Microsoft Entra / Cloudflare Access account is authorised.";
    }
  });
}

async function removeAdmin(email) {
  const ok = window.confirm(`Remove admin access for ${email}?`);
  if (!ok) return;
  try {
    await api("admins", {
      method: "POST",
      body: JSON.stringify({ action: "remove", email })
    });
    loadSection("admins");
  } catch (error) {
    window.alert(error.message);
  }
}

function renderCustomers(customers = []) {
  const rows = customers.map((c) => {
    const name = c.display_name || c.verified_name || c.email;
    const lifetime = Number(c.admin_lifetime || 0) === 1;
    const planSuffix = lifetime && c.admin_lifetime_plan_id ? ` (${c.admin_lifetime_plan_id})` : "";
    return `
      <tr class="customer-row-click" data-action="open-customer" data-email="${escapeAttr(c.email)}">
        <td><strong>${escapeHtml(name)}</strong><span>${escapeHtml(c.email || "")}</span></td>
        <td>${escapeHtml(c.contact_email || c.email || "")}</td>
        <td>${lifetime ? badge(`Lifetime${planSuffix}`, "amber") : badge(c.admin_customer_status || "Standard")}</td>
        <td>${escapeHtml(c.phone || "Not added")}</td>
        <td>${escapeHtml(c.communication_preference || "Email")}</td>
        <td>${escapeHtml(formatDate(c.updated_at || c.created_at))}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>CRM / Customers</h2>
          <p>Customer profile records from D1. Open a customer to manage Lifetime status and internal admin notes.</p>
        </div>
      </div>
      <div class="admin-alert">Customer data displayed here is confidential and subject to UK GDPR. Access is logged by the platform perimeter; use it only for legitimate business purposes.</div>
      ${table(["Customer", "Contact email", "Status", "Phone", "Preference", "Updated"], rows)}
    </div>
  `;
}

function renderPlans(plans = []) {
  const cards = plans.map((plan) => `
    <article class="plan-card">
      <div class="plan-top">
        <div>
          <strong>${escapeHtml(plan.plan_name)}</strong>
          <span>${escapeHtml(plan.plan_type || "Service plan")}</span>
        </div>
        <label class="switch" title="Toggle plan active status">
          <input type="checkbox" data-plan-toggle="${escapeAttr(plan.id)}" ${Number(plan.is_active) === 1 ? "checked" : ""}>
          <span></span>
        </label>
      </div>
      <div class="plan-meta">
        <div><span>Price</span><strong>${escapeHtml(plan.price_label || "Not set")}</strong></div>
        <div><span>Delivery</span><strong>${escapeHtml(plan.delivery_time || "Not set")}</strong></div>
        <div><span>Revisions</span><strong>${escapeHtml(plan.revisions || "Not set")}</strong></div>
        <div><span>Stripe product</span><strong>${escapeHtml(plan.stripe_product_id || "Not stored")}</strong></div>
        <div><span>Stripe price</span><strong>${escapeHtml(plan.stripe_price_id || "Not stored")}</strong></div>
      </div>
      <div class="section-actions">
        ${Number(plan.is_active) === 1 ? badge("Active", "green") : badge("Inactive", "red")}
        ${Number(plan.is_featured) === 1 ? badge("Featured", "amber") : ""}
        <button class="mini-button" type="button" data-action="open-plan" data-id="${escapeAttr(plan.id)}">Edit</button>
      </div>
    </article>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="section-head">
      <div>
        <h2>Manage Plans</h2>
        <p>Configure subscription-style plan cards and stored Stripe product/price IDs.</p>
      </div>
      <button class="admin-button" type="button" data-action="open-plan">New plan</button>
    </div>
    <div class="plan-grid">${cards || emptyCard("No plans yet.")}</div>
  `;
}

async function togglePlan(id, isActive) {
  const plan = (state.data.plans?.plans || []).find((item) => item.id === id);
  if (!plan) return;
  await savePlan({ ...plan, is_active: isActive, is_featured: Number(plan.is_featured) === 1 });
}

function openPlanModal(id = "") {
  const plan = (state.data.plans?.plans || []).find((item) => item.id === id) || {};
  openModal(`
    <div class="modal-head">
      <div><h2>${id ? "Edit plan" : "New plan"}</h2><p>Plan settings are stored in D1 and do not alter public pricing output unless separately wired.</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <form class="admin-form" id="planForm">
      ${input("Plan ID", "plan_id")}
      ${input("Plan name", "plan_name")}
      ${input("Plan type", "plan_type")}
      ${input("Price label", "price_label")}
      ${input("Price pence", "price_pence", "number")}
      ${input("Delivery time", "delivery_time")}
      ${input("Revisions", "revisions")}
      ${input("Stripe product ID", "stripe_product_id")}
      ${input("Stripe price ID", "stripe_price_id")}
      ${input("Button label", "button_label")}
      ${input("Sort order", "sort_order", "number")}
      ${textarea("Description", "description")}
      <label class="check"><input id="is_active" type="checkbox"> Active</label>
      <label class="check"><input id="is_featured" type="checkbox"> Featured</label>
      <button class="admin-button" type="submit">Save plan</button>
    </form>
  `);

  const derivedId = plan.id || `plan_${Date.now()}`;
  setValue("plan_id", derivedId);
  document.getElementById("plan_id").disabled = Boolean(id);
  ["plan_name", "plan_type", "price_label", "price_pence", "delivery_time", "revisions", "stripe_product_id", "stripe_price_id", "button_label", "sort_order", "description"].forEach((key) => {
    setValue(key, plan[key] || "");
  });
  document.getElementById("is_active").checked = Number(plan.is_active ?? 1) === 1;
  document.getElementById("is_featured").checked = Number(plan.is_featured || 0) === 1;

  document.getElementById("planForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await savePlan({
      id: getValue("plan_id") || derivedId,
      plan_name: getValue("plan_name"),
      plan_type: getValue("plan_type"),
      price_label: getValue("price_label"),
      price_pence: Number(getValue("price_pence") || 0),
      delivery_time: getValue("delivery_time"),
      revisions: getValue("revisions"),
      stripe_product_id: getValue("stripe_product_id"),
      stripe_price_id: getValue("stripe_price_id"),
      button_label: getValue("button_label"),
      sort_order: Number(getValue("sort_order") || 100),
      description: getValue("description"),
      is_active: document.getElementById("is_active").checked,
      is_featured: document.getElementById("is_featured").checked
    });
    closeModal();
  });
}

async function savePlan(plan) {
  const data = await api("plans", { method: "POST", body: JSON.stringify(plan) });
  state.data.plans = data;
  renderPlans(data.plans);
}

function renderStripe(stripe = {}) {
  const productRows = (stripe.products || []).map((product) => `
    <tr>
      <td><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.id)}</span></td>
      <td>${escapeHtml(product.price_id)}</td>
      <td>${escapeHtml(formatMoney(product.amount, product.currency))}</td>
      <td>${escapeHtml(product.interval || "")}</td>
      <td>${product.active ? badge("Active", "green") : badge("Inactive", "red")}</td>
    </tr>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Stripe API Controls</h2>
          <p>Store Stripe keys securely in D1-compatible settings. Secret values are masked after saving.</p>
        </div>
        <div class="section-actions">
          ${badge(stripe.mode || "Unknown", stripe.mode === "Live" ? "green" : "amber")}
          <button class="admin-button secondary" type="button" data-action="refresh-stripe">Refresh status</button>
        </div>
      </div>

      <div class="admin-grid">
        ${stat("Configured", stripe.configured ? "Yes" : "No")}
        ${stat("Charges", stripe.account?.charges_enabled ? "Enabled" : "Check")}
        ${stat("Payouts", stripe.account?.payouts_enabled ? "Enabled" : "Check")}
      </div>

      <form class="admin-form" id="stripeForm">
        ${input("Publishable key", "stripe_publishable_key")}
        ${input("Secret key", "stripe_secret_key", "password")}
        ${input("Webhook signing secret", "stripe_webhook_secret", "password")}
        <div class="admin-alert">Leave secret fields blank to keep existing values. Do not paste live keys unless you intend the admin platform to use them.</div>
        <button class="admin-button" type="submit">Save Stripe settings</button>
      </form>

      <div class="admin-card" style="margin-top:1rem;">
        <h2>Connection Status</h2>
        <p>${escapeHtml(stripe.message || "Stripe has not been checked yet.")}</p>
        <p>Publishable key: ${escapeHtml(stripe.publishable_key_masked || "Missing")} · Secret key: ${escapeHtml(stripe.secret_key_masked || "Missing")} · Webhook: ${escapeHtml(stripe.webhook_secret_masked || "Missing")}</p>
      </div>

      ${table(["Product", "Price ID", "Amount", "Interval", "Status"], productRows)}
    </div>
  `;

  setValue("stripe_publishable_key", stripe.publishable_key_masked || "");
  document.getElementById("stripeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const publishable = getValue("stripe_publishable_key");
    const body = {
      publishable_key: publishable.includes("••") ? "" : publishable,
      secret_key: getValue("stripe_secret_key"),
      webhook_signing_secret: getValue("stripe_webhook_secret"),
      test_connection: true
    };
    const data = await api("stripe", { method: "POST", body: JSON.stringify(body) });
    state.data.stripe = data;
    renderStripe(data.stripe);
  });
}

async function refreshStripe() {
  const response = await fetch("/admin/api?section=stripe&test=1", { credentials: "include", cache: "no-store" });
  const data = await response.json();
  if (!response.ok) window.alert(data.error || "Stripe check failed.");
  else renderStripe(data.stripe);
}

function renderBranding(branding = {}) {
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Company Branding</h2><p>Edit business and service information stored in D1. Public branding is not changed by this screen unless wired separately.</p></div>
      </div>
      <form class="admin-form" id="brandingForm">
        ${input("Business name", "business_name")}
        ${input("Trading name", "trading_name")}
        ${input("Service name", "service_name")}
        ${input("Support email", "support_email", "email")}
        ${input("Contact email", "contact_email", "email")}
        ${input("Phone", "phone")}
        ${input("Website", "website")}
        ${textarea("Registered notice", "registered_notice")}
        ${textarea("Footer notice", "footer_notice")}
        <button class="admin-button" type="submit">Save branding</button>
      </form>
      <div id="brandingSaved" class="admin-success" hidden></div>
    </div>
  `;

  ["business_name", "trading_name", "service_name", "support_email", "contact_email", "phone", "website", "registered_notice", "footer_notice"].forEach((key) => {
    setValue(key, branding[key] || "");
  });

  document.getElementById("brandingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = {};
    ["business_name", "trading_name", "service_name", "support_email", "contact_email", "phone", "website", "registered_notice", "footer_notice"].forEach((key) => {
      body[key] = getValue(key);
    });
    await api("branding", { method: "POST", body: JSON.stringify(body) });
    setSaved("brandingSaved", "Branding saved.");
  });
}

function renderPolicies(policies = []) {
  if (!state.selectedPolicy || !policies.some((policy) => policy.slug === state.selectedPolicy)) {
    state.selectedPolicy = policies[0]?.slug || null;
  }
  const selected = policies.find((policy) => policy.slug === state.selectedPolicy) || policies[0] || {};
  const selectedPublished = selected.status === "published" || Number(selected.is_published) === 1;

  const cards = policies.map((policy) => `
    <button class="policy-card ${policy.slug === selected.slug ? "active" : ""}" type="button" data-action="select-policy" data-slug="${escapeAttr(policy.slug)}">
      <div class="policy-top">
        <div>
          <strong>${escapeHtml(policy.title)}</strong>
          <span>${escapeHtml(policy.slug)}</span>
          <span>v${escapeHtml(policy.version || "1.0")} · Effective ${escapeHtml(policy.effective_date || "Not set")}</span>
        </div>
        ${badge(policy.status === "published" || Number(policy.is_published) === 1 ? "Published" : "Draft", policy.status === "published" || Number(policy.is_published) === 1 ? "green" : "")}
      </div>
    </button>
  `).join("");

  const tabs = policies.map((policy) => `
    <button class="tab-button ${policy.slug === selected.slug ? "active" : ""}" type="button" data-action="select-policy" data-slug="${escapeAttr(policy.slug)}">${escapeHtml(shortPolicyName(policy.title))}</button>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="section-head">
      <div><h2>Legal Policies</h2><p>Manage policy content, versioning and draft/published status in D1.</p></div>
    </div>
    <div class="policy-grid">${cards}</div>
    <div class="tabs">${tabs}</div>
    <div class="admin-card">
      <div class="section-head">
        <div><h2>${escapeHtml(selected.title || "Policy")}</h2><p>Edit the slug, content, version and publication status.</p></div>
        <div class="section-actions">
          <label class="switch" title="Publish or unpublish policy">
            <input type="checkbox" data-action="toggle-policy-published" data-slug="${escapeAttr(selected.slug || "")}" ${selectedPublished ? "checked" : ""}>
            <span></span>
          </label>
          ${selectedPublished ? `<a class="admin-button secondary" href="/policies/${escapeAttr(selected.slug)}" target="_blank" rel="noopener">Public link</a>` : `<button class="admin-button secondary" type="button" disabled>Unpublished</button>`}
        </div>
      </div>
      <form class="admin-form" id="policyForm">
        <input type="hidden" id="policy_original_slug">
        ${input("Policy title", "policy_title")}
        ${input("Policy slug", "policy_slug")}
        ${input("Version", "policy_version")}
        ${input("Effective date", "policy_effective_date", "date")}
        <label class="admin-label">Status
          <select id="policy_status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label class="admin-label">Content type
          <select id="policy_content_type">
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="text">Plain text</option>
          </select>
        </label>
        ${textarea("Policy content", "policy_content")}
        <button class="admin-button" type="submit">Save policy</button>
      </form>
      <div id="policySaved" class="admin-success" hidden></div>
    </div>
  `;

  setValue("policy_original_slug", selected.slug || "");
  setValue("policy_slug", selected.slug || "");
  setValue("policy_title", selected.title || "");
  setValue("policy_version", selected.version || "1.0");
  setValue("policy_effective_date", selected.effective_date || "");
  setValue("policy_status", selected.status || (Number(selected.is_published) === 1 ? "published" : "draft"));
  setValue("policy_content_type", selected.content_type || "markdown");
  setValue("policy_content", selected.content || "");

  document.getElementById("policyForm").addEventListener("submit", savePolicy);
}

function shortPolicyName(title) {
  return String(title || "Policy").replace(" Policy", "").replace("Terms of Service", "Terms");
}

function selectPolicy(slug) {
  state.selectedPolicy = slug;
  renderPolicies(state.data.policies?.policies || []);
}

async function savePolicy(event) {
  event.preventDefault();
  const slug = slugify(getValue("policy_slug"));
  const body = {
    original_slug: getValue("policy_original_slug"),
    slug,
    title: getValue("policy_title"),
    version: getValue("policy_version"),
    effective_date: getValue("policy_effective_date"),
    status: getValue("policy_status"),
    content_type: getValue("policy_content_type"),
    content: getValue("policy_content"),
    is_published: getValue("policy_status") === "published"
  };
  const data = await api("policies", { method: "POST", body: JSON.stringify(body) });
  state.data.policies = data;
  state.selectedPolicy = slug;
  renderPolicies(data.policies);
  setSaved("policySaved", "Policy saved. Public pages update immediately when the policy is published.");
}

async function togglePolicyPublished(slug, isPublished) {
  const policy = (state.data.policies?.policies || []).find((item) => item.slug === slug);
  if (!policy) return;

  const body = {
    original_slug: policy.slug,
    slug: policy.slug,
    title: policy.title,
    version: policy.version || "1.0",
    effective_date: policy.effective_date || "",
    status: isPublished ? "published" : "draft",
    content_type: policy.content_type || "markdown",
    content: policy.content || "",
    is_published: isPublished
  };

  const data = await api("policies", { method: "POST", body: JSON.stringify(body) });
  state.data.policies = data;
  state.selectedPolicy = slug;
  renderPolicies(data.policies);
  setSaved("policySaved", isPublished ? "Policy published. The public URL is now live." : "Policy unpublished. The public URL now returns 404.");
}

function renderSupport(items = []) {
  renderRecordSection("Support", "Customer support requests and admin-created support records.", items, "support", [
    ["Customer email", "support_customer_email", "email"],
    ["Subject", "support_subject", "text"],
    ["Status", "support_status", "text"],
    ["Priority", "support_priority", "text"],
    ["Notes", "support_notes", "textarea"]
  ]);
  setValue("support_status", "Open");
  setValue("support_priority", "Normal");
}

function renderSystem(items = []) {
  renderRecordSection("System / Issues", "Track site issues, deployment notes, bugs and operational events.", items, "system", [
    ["Title", "system_title", "text"],
    ["Type", "system_type", "text"],
    ["Severity", "system_severity", "text"],
    ["Status", "system_status", "text"],
    ["Message", "system_message", "textarea"]
  ]);
  setValue("system_type", "General");
  setValue("system_severity", "Info");
  setValue("system_status", "Open");
}

function renderRecordSection(title, description, items, section, fields) {
  const rows = items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.subject || item.title)}</strong><span>${escapeHtml(item.customer_email || item.message || "")}</span></td>
      <td>
        <select data-record-status data-section="${escapeAttr(section)}" data-id="${escapeAttr(item.id)}">
          ${["Open", "In Progress", "Resolved", "Closed"].map((status) => `<option value="${status}" ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </td>
      <td>${escapeHtml(item.priority || item.severity || "")}</td>
      <td>${escapeHtml(formatDate(item.updated_at || item.created_at))}</td>
    </tr>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div></div>
      <form class="admin-form" id="${section}Form">
        ${fields.map(([label, id, type]) => type === "textarea" ? textarea(label, id) : input(label, id, type)).join("")}
        <button class="admin-button" type="submit">Save ${section === "support" ? "support ticket" : "system issue"}</button>
      </form>
      ${table([section === "support" ? "Ticket" : "Issue", "Status", "Priority", "Updated"], rows)}
    </div>
  `;

  document.getElementById(`${section}Form`).addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = section === "support"
      ? {
          customer_email: getValue("support_customer_email"),
          subject: getValue("support_subject"),
          status: getValue("support_status"),
          priority: getValue("support_priority"),
          notes: getValue("support_notes")
        }
      : {
          title: getValue("system_title"),
          type: getValue("system_type"),
          severity: getValue("system_severity"),
          status: getValue("system_status"),
          message: getValue("system_message")
        };
    await api(section, { method: "POST", body: JSON.stringify(body) });
    loadSection(section);
  });
}

async function updateRecordStatus(section, id, status) {
  const collection = state.data[section]?.[section] || [];
  const item = collection.find((record) => record.id === id);
  if (!item) return;

  const body = section === "support"
    ? { ...item, status }
    : { ...item, status };

  await api(section, { method: "POST", body: JSON.stringify(body) });
  loadSection(section);
}

function renderComingSoon(settings = {}) {
  renderStatusForm("comingsoon", settings, {
    title: "Coming Soon Page",
    description: "Switch the public website into a pre-launch page while keeping the admin portal available.",
    enabledKey: "comingsoon_enabled",
    titleKey: "comingsoon_title",
    messageKey: "comingsoon_message",
    etaKey: "comingsoon_eta",
    enabledLabel: "Coming soon page enabled",
    titleLabel: "Public coming soon title",
    messageLabel: "Public coming soon message",
    etaLabel: "Estimated launch time"
  });
}

function renderMaintenance(settings = {}) {
  renderStatusForm("maintenance", settings, {
    title: "Maintenance Mode",
    description: "Bring the public website down for maintenance while keeping the admin portal available.",
    enabledKey: "maintenance_enabled",
    titleKey: "maintenance_title",
    messageKey: "maintenance_message",
    etaKey: "maintenance_eta",
    enabledLabel: "Maintenance mode enabled",
    titleLabel: "Public maintenance title",
    messageLabel: "Public maintenance message",
    etaLabel: "Estimated return time"
  });
}

function renderStatusForm(section, settings, labels) {
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>${escapeHtml(labels.title)}</h2><p>${escapeHtml(labels.description)}</p></div>
        ${badge(settings[labels.enabledKey] === "true" ? "On" : "Off", settings[labels.enabledKey] === "true" ? "green" : "")}
      </div>
      <form class="admin-form" id="${section}Form">
        <label class="check">
          <span class="switch"><input id="${labels.enabledKey}" type="checkbox"><span></span></span>
          ${escapeHtml(labels.enabledLabel)}
        </label>
        ${input(labels.titleLabel, labels.titleKey)}
        ${textarea(labels.messageLabel, labels.messageKey)}
        ${input(labels.etaLabel, labels.etaKey)}
        <button class="admin-button" type="submit">Save ${escapeHtml(labels.title.toLowerCase())} settings</button>
      </form>
      <div id="${section}Saved" class="admin-success" hidden></div>
      <div class="admin-alert" style="margin-top:1rem;">Maintenance Mode takes priority over Coming Soon Mode. The admin portal and Cloudflare Access routes remain available.</div>
    </div>
  `;

  document.getElementById(labels.enabledKey).checked = settings[labels.enabledKey] === "true";
  setValue(labels.titleKey, settings[labels.titleKey] || "");
  setValue(labels.messageKey, settings[labels.messageKey] || "");
  setValue(labels.etaKey, settings[labels.etaKey] || "");

  document.getElementById(`${section}Form`).addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = {
      [labels.enabledKey]: document.getElementById(labels.enabledKey).checked,
      [labels.titleKey]: getValue(labels.titleKey),
      [labels.messageKey]: getValue(labels.messageKey),
      [labels.etaKey]: getValue(labels.etaKey)
    };
    const data = await api(section, { method: "POST", body: JSON.stringify(body) });
    renderSection(section, data);
  });
}

async function openCustomerDrawer(email) {
  closeCustomerDrawer();
  const drawer = document.createElement("div");
  drawer.className = "customer-drawer-backdrop";
  drawer.id = "customerDrawer";
  drawer.innerHTML = `
    <aside class="customer-drawer">
      <div class="drawer-head">
        <div><h2>Customer profile</h2><p>Loading customer record...</p></div>
        <button class="drawer-close" type="button" data-action="close-customer">×</button>
      </div>
      <div class="drawer-body"><div class="admin-loading">Loading customer...</div></div>
    </aside>
  `;
  document.body.appendChild(drawer);

  try {
    const response = await fetch(`/admin/customer?email=${encodeURIComponent(email)}`, {
      credentials: "include",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load customer.");
    renderCustomerDrawer(data.customer, data.plans || []);
  } catch (error) {
    drawer.querySelector(".drawer-body").innerHTML = `<div class="admin-alert">${escapeHtml(error.message)}</div>`;
  }
}

function closeCustomerDrawer() {
  document.getElementById("customerDrawer")?.remove();
}

function renderCustomerDrawer(customer, plans = []) {
  const drawer = document.getElementById("customerDrawer");
  if (!drawer) return;

  const displayName = customer.display_name || customer.verified_name || customer.email;
  const isLifetime = Number(customer.admin_lifetime || 0) === 1;
  const planOptions = plans.map((plan) => {
    const label = `${plan.plan_name || plan.id} - ${plan.plan_type || "Service plan"}${Number(plan.is_active || 0) === 1 ? "" : " (inactive)"}`;
    return `<option value="${escapeAttr(plan.id)}" ${customer.admin_lifetime_plan_id === plan.id ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");

  drawer.querySelector(".drawer-head p").textContent = customer.email || "";
  drawer.querySelector(".drawer-body").innerHTML = `
    <div class="customer-profile-head">
      <div class="customer-avatar">${escapeHtml((displayName || "C").slice(0, 1).toUpperCase())}</div>
      <div><strong>${escapeHtml(displayName)}</strong><span>${escapeHtml(customer.email || "")}</span></div>
      <span class="customer-status ${isLifetime ? "lifetime" : ""}">${isLifetime ? "Lifetime" : "Standard"}</span>
    </div>
    <div class="drawer-grid">
      <div class="drawer-field"><span>Contact email</span><strong>${escapeHtml(customer.contact_email || customer.email || "Not added")}</strong></div>
      <div class="drawer-field"><span>Phone</span><strong>${escapeHtml(customer.phone || "Not added")}</strong></div>
      <div class="drawer-field"><span>Communication</span><strong>${escapeHtml(customer.communication_preference || "Email")}</strong></div>
      <div class="drawer-field"><span>Verified name</span><strong>${escapeHtml(customer.verified_name || "Not added")}</strong></div>
      <div class="drawer-field"><span>Support notes</span><strong>${escapeHtml(customer.support_notes || "None recorded")}</strong></div>
      <div class="drawer-field"><span>Lifetime plan</span><strong>${escapeHtml(customer.admin_lifetime_plan_id || "Not assigned")}</strong></div>
      <div class="drawer-field"><span>Updated</span><strong>${escapeHtml(formatDate(customer.updated_at || customer.created_at))}</strong></div>
    </div>
    <form class="admin-form single" id="customerAdminForm">
      <label class="check"><input id="customer_lifetime" type="checkbox" ${isLifetime ? "checked" : ""}> Mark this customer as Lifetime</label>
      <label>
        Lifetime service plan
        <select id="customer_lifetime_plan" ${isLifetime ? "" : "disabled"}>
          <option value="">Select a Lifetime plan</option>
          ${planOptions}
        </select>
      </label>
      ${textarea("Internal admin notes", "customer_admin_notes")}
      <button class="admin-button" type="submit">Save customer changes</button>
    </form>
    <div id="customerSaved" class="admin-success" hidden></div>
  `;

  setValue("customer_admin_notes", customer.admin_notes || "");
  document.getElementById("customer_lifetime").addEventListener("change", (event) => {
    const planSelect = document.getElementById("customer_lifetime_plan");
    if (planSelect) planSelect.disabled = !event.target.checked;
  });
  document.getElementById("customerAdminForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const lifetimeChecked = document.getElementById("customer_lifetime").checked;
    const response = await fetch(`/admin/customer?email=${encodeURIComponent(customer.email)}`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_lifetime: lifetimeChecked,
        admin_lifetime_plan_id: lifetimeChecked ? getValue("customer_lifetime_plan") : "",
        admin_notes: getValue("customer_admin_notes")
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setSaved("customerSaved", data.error || "Unable to save customer.", true);
      return;
    }
    renderCustomerDrawer(data.customer, data.plans || plans);
    if (state.currentSection === "customers") loadSection("customers");
  });
}

function openAccountModal() {
  const admin = state.data[state.currentSection]?.admin || {};
  openModal(`
    <div class="modal-head">
      <div><h2>Account settings</h2><p>Your admin identity is provided by Cloudflare Access and Microsoft Entra-compatible sign-in.</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <div class="drawer-grid">
      <div class="drawer-field"><span>Name</span><strong>${escapeHtml(admin.name || "JA admin")}</strong></div>
      <div class="drawer-field"><span>Email</span><strong>${escapeHtml(admin.email || "")}</strong></div>
      <div class="drawer-field"><span>Session</span><strong>Cloudflare Access</strong></div>
      <div class="drawer-field"><span>Role</span><strong>Admin</strong></div>
    </div>
    <a class="admin-button" href="/cdn-cgi/access/logout" style="display:inline-flex;align-items:center;text-decoration:none;">Sign out</a>
  `);
}

function openModal(content) {
  closeModal();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "adminModal";
  backdrop.innerHTML = `<div class="modal">${content}</div>`;
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.body.appendChild(backdrop);
}

function closeModal() {
  document.getElementById("adminModal")?.remove();
}

function stat(label, value) {
  return `<article class="admin-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function input(label, id, type = "text") {
  return `<label class="admin-label">${escapeHtml(label)}<input id="${escapeHtml(id)}" type="${escapeHtml(type)}"></label>`;
}

function textarea(label, id) {
  return `<label class="admin-label">${escapeHtml(label)}<textarea id="${escapeHtml(id)}"></textarea></label>`;
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
        <tbody>${rows || `<tr><td colspan="${headers.length}">No records yet.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function badge(label, colour = "") {
  return `<span class="badge ${escapeHtml(colour)}">${escapeHtml(label)}</span>`;
}

function emptyCard(text) {
  return `<div class="list-card">${escapeHtml(text)}</div>`;
}

function setSaved(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.className = isError ? "admin-alert" : "admin-success";
  el.textContent = message;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return "";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: (currency || "gbp").toUpperCase()
  }).format(Number(amount) / 100);
}
