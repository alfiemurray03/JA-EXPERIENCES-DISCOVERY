const state = {
  currentSection: "overview",
  data: {},
  selectedPolicy: null,
  favourites: [],
  branding: {},
  adminRole: "Administrator",
  allowedSections: ["overview"],
  adminRecentSections: [],
  dashboardPreferences: {},
  notificationPreferences: {},
  preferredLandingPage: "overview",
  themePreference: "system",
  planDraft: null,
  planDirty: false,
  planSaving: false,
  initialWorkspaceApplied: false
};

const sectionTitles = {
  overview: "Overview",
  operations: "Operations",
  admins: "Admin Users",
  roles: "Roles",
  customers: "CRM",
  plans: "Plans & Prices",
  stripe: "Stripe",
  branding: "Branding",
  policies: "Policies",
  support: "Support",
  system: "System",
  datarequests: "Data Protection Requests",
  systemreports: "System Reports",
  closures: "Closure Requests",
  analytics: "Analytics",
  status: "Status Centre",
  affiliate: "Affiliate Content",
  appearance: "Appearance",
  email: "Email",
  audit: "Audit Log",
  comingsoon: "Coming Soon",
  maintenance: "Maintenance Mode",
  sessions: "Sessions"
};

const sectionDescriptions = {
  overview: "Executive summary of your customer and platform operations.",
  operations: "Dedicated operational dashboard for senior oversight.",
  analytics: "Review account, enquiry, request and plan activity.",
  status: "Monitor live service health, incidents and maintenance from Atlassian Statuspage.",
  audit: "Trace sensitive administrative activity across the platform.",
  sessions: "View and revoke active admin sessions.",
  admins: "Manage authorised administrators and access records.",
  roles: "Create, clone and edit roles plus their permissions.",
  customers: "Search customer profiles, memberships and account history.",
  datarequests: "Manage UK GDPR and data rights workflows.",
  systemreports: "Review customer-reported website and account issues.",
  closures: "Process account closure requests safely and consistently.",
  support: "Review and manage customer support enquiries.",
  plans: "Configure service plans, prices and public availability.",
  stripe: "Review Stripe configuration and connection status.",
  email: "Configure outbound email and test notifications.",
  system: "Monitor operational issues and platform records.",
  branding: "Manage business identity and public-facing brand assets.",
  appearance: "Control the public website colour theme.",
  affiliate: "Manage affiliate notices, widgets and content blocks.",
  policies: "Maintain legal, privacy and compliance content.",
  comingsoon: "Control the public pre-launch experience.",
  maintenance: "Control maintenance mode and service messaging."
};

const iconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>',
  shield: '<path d="M12 3l7 3v5c0 4.5-2.9 8.4-7 10-4.1-1.6-7-5.5-7-10V6l7-3z"></path><path d="M12 8v5"></path><path d="M12 17h.01"></path>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path>',
  alert: '<path d="M10.3 4.3L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
  plans: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h10"></path><path d="M7 12h10"></path><path d="M7 16h6"></path>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h3"></path>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z"></path>',
  clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path>',
  chart: '<path d="M3 3v18h18"></path><path d="M8 17V9"></path><path d="M13 17V5"></path><path d="M18 17v-6"></path>',
  pulse: '<path d="M3 12h4l2-7 4 14 2-7h6"></path>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 1 0 12 20.1l1.1-1.1"></path>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2a10 10 0 0 0 0 20h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2a8 8 0 0 0 0-16z"></path>'
};

const dprStatuses = ["Received", "Verifying Identity", "In Progress", "Ready to Send", "Sent", "Closed", "Rejected"];
const systemReportStatuses = ["Open", "In Progress", "Resolved", "Rejected"];
const closureStatuses = ["Open", "In Progress", "Approved", "Rejected", "Completed"];
const priorities = ["Low", "Normal", "High", "Urgent"];

document.addEventListener("DOMContentLoaded", () => {
  applyAdminBranding();
  decorateIcons();
  bindNav();
  bindMobileSidebar();
  bindAccountMenu();
  bindAdminActions();
  bindFavouriteActions();
  bindWorkspaceActions();
  loadSection("overview");
});

function iconSvg(name) {
  const paths = iconPaths[name] || iconPaths.dashboard;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}

function decorateIcons() {
  document.querySelectorAll(".admin-nav button[data-icon]").forEach((button) => {
    if (button.querySelector(".nav-icon")) return;
    button.insertAdjacentHTML("afterbegin", `<span class="nav-icon" aria-hidden="true">${iconSvg(button.dataset.icon)}</span>`);
  });

}

function bindNav() {
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      loadSection(button.dataset.section);
      closeMobileSidebar();
    });
  });
}

function bindMobileSidebar() {
  const openButton = document.getElementById("mobileMenuButton");
  const closeButton = document.getElementById("sidebarCloseButton");
  const scrim = document.getElementById("sidebarScrim");
  openButton?.addEventListener("click", () => {
    document.body.classList.add("sidebar-open");
    openButton.setAttribute("aria-expanded", "true");
  });
  closeButton?.addEventListener("click", closeMobileSidebar);
  scrim?.addEventListener("click", closeMobileSidebar);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileSidebar();
  });
}

function closeMobileSidebar() {
  document.body.classList.remove("sidebar-open");
  document.getElementById("mobileMenuButton")?.setAttribute("aria-expanded", "false");
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

    if (type === "suspend-admin") {
      await api("admins", { method: "POST", body: JSON.stringify({ action: "suspend", email: action.dataset.email }) });
      await loadSection("admins");
    }

    if (type === "reactivate-admin") {
      await api("admins", { method: "POST", body: JSON.stringify({ action: "reactivate", email: action.dataset.email }) });
      await loadSection("admins");
    }

    if (type === "open-admin-profile") {
      openAdminProfileModal(action.dataset.email);
    }

    if (type === "create-role") {
      openRoleEditor(null);
    }

    if (type === "edit-role") {
      const role = getCurrentRoles().find((item) => String(item.name) === String(action.dataset.name));
      openRoleEditor(role || null);
    }

    if (type === "clone-role") {
      const role = getCurrentRoles().find((item) => String(item.name) === String(action.dataset.name));
      if (!role) return;
      const name = window.prompt(`Clone "${role.name}" as:`, `${role.name} Copy`);
      if (!name) return;
      await api("roles", { method: "POST", body: JSON.stringify({ action: "clone", source: role.name, name }) });
      await loadSection("roles");
    }

    if (type === "rename-role") {
      const role = getCurrentRoles().find((item) => String(item.name) === String(action.dataset.name));
      if (!role) return;
      const name = window.prompt(`Rename role "${role.name}" to:`, role.name);
      if (!name || name === role.name) return;
      await api("roles", { method: "POST", body: JSON.stringify({ action: "rename", from: role.name, to: name }) });
      await loadSection("roles");
    }

    if (type === "delete-role") {
      const role = getCurrentRoles().find((item) => String(item.name) === String(action.dataset.name));
      if (!role) return;
      if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
      await api("roles", { method: "POST", body: JSON.stringify({ action: "delete", name: role.name }) });
      await loadSection("roles");
    }

    if (type === "revoke-session") {
      if (!window.confirm("Revoke this administrator session?")) return;
      await api("sessions", { method: "POST", body: JSON.stringify({ action: "revoke", token_hash: action.dataset.token }) });
      await loadSection("sessions");
    }

    if (type === "open-customer") {
      openCustomerDrawer(action.dataset.email);
    }

    if (type === "open-plan") {
      openPlanModal(action.dataset.id || "");
    }

    if (type === "open-admin-record") {
      openAdminRecordModal(action.dataset.section, action.dataset.id);
    }

    if (type === "open-support") {
      openSupportModal(action.dataset.id);
    }

    if (type === "open-closure") {
      openClosureModal(action.dataset.id || "");
    }

    if (type === "open-affiliate-block") {
      openAffiliateModal(action.dataset.id || "");
    }

    if (type === "delete-affiliate-block") {
      deleteAffiliateBlock(action.dataset.id);
    }

    if (type === "import-affiliate-content") {
      importAffiliateContent();
    }

    if (type === "create-bypass") {
      createAdminBypass();
    }

    if (type === "remove-bypass") {
      removeAdminBypass();
    }

    if (type === "export-records") {
      exportRecords(action.dataset.section, action.dataset.format || "csv");
    }

    if (type === "reset-microsoft-password") {
      const email = action.dataset.email || "";
      if (!window.confirm(`Open the Microsoft Entra admin centre for ${email || "this customer"} in a new tab? This will not reset the password directly.`)) return;
      window.open("https://entra.microsoft.com/", "_blank", "noopener,noreferrer");
    }

    if (type === "export-customer-data") {
      exportCustomerData(action.dataset.email, action.dataset.format || "json");
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

    if (type === "load-section-retry") {
      loadSection(state.currentSection);
    }

    if (type === "select-policy") {
      selectPolicy(action.dataset.slug);
    }

    if (type === "toggle-policy-published") {
      await togglePolicyPublished(action.dataset.slug, action.checked);
    }

    if (type === "save-plan-changes") {
      await savePlanChanges();
    }

    if (type === "cancel-plan-changes") {
      await cancelPlanChanges();
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
  renderFavourites();

  const panel = document.getElementById("adminPanel");
  panel.innerHTML = `<div class="admin-loading">Loading ${escapeHtml(sectionTitles[section] || section)}...</div>`;

  try {
    if (section === "status") {
      const data = await api("status");
      state.data.status = data;
      renderSection(section, data);
      return;
    }

    if (section === "analytics") {
      const [data, status] = await Promise.all([api(section), fetchLiveStatus().catch(() => null)]);
      state.data[section] = data;
      if (status) state.data.status = { status };
      if (data.admin) setAdmin(data.admin);
      renderSection(section, { ...data, status });
      return;
    }

    const data = await api(section);
    state.data[section] = data;
    if (section === "plans") {
      state.planDraft = null;
      state.planDirty = false;
    }
    if (data.admin) setAdmin(data.admin);
    touchRecentSection(section);
    renderSection(section, data);
  } catch (error) {
    panel.innerHTML = `
      <div class="admin-card">
        <div class="section-head"><div><h2>${escapeHtml(sectionTitles[section] || section)}</h2><p>We couldn't load this section.</p></div></div>
        ${renderInlineStatus("error", error.message || "Something went wrong while loading this section.", "load-section-retry")}
      </div>
    `;
    panel.querySelector('[data-action="load-section-retry"]')?.addEventListener("click", () => loadSection(section));
  }
}

function bindWorkspaceActions() {
  document.getElementById("sidebarToggleButton")?.addEventListener("click", async () => {
    document.body.classList.toggle("sidebar-collapsed");
    await persistWorkspacePreferences();
  });

  document.querySelector(".notification-button")?.addEventListener("click", () => {
    const notifications = [
      { label: "System alerts", value: state.data.overview?.overview?.openIssues || 0 },
      { label: "New enquiries", value: state.data.analytics?.analytics?.totalEnquiries || 0 },
      { label: "Support tickets", value: state.data.overview?.overview?.supportTickets || 0 },
      { label: "Plan changes", value: state.data.analytics?.analytics?.planChanges || 0 },
      { label: "Audit events", value: Array.isArray(state.data.audit?.audit) ? state.data.audit.audit.length : 0 }
    ];
    openModal(`
      <div class="modal-head">
        <div><h2>Notification Centre</h2><p>Operational notifications and activity highlights.</p></div>
        <button class="drawer-close" type="button" data-action="close-modal">×</button>
      </div>
      <div class="admin-grid">
        ${notifications.map((item) => `<article class="admin-stat"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(String(item.value))}</strong><span>Visible according to your permissions</span></article>`).join("")}
      </div>
    `);
  });
}

async function persistWorkspacePreferences() {
  try {
    await api("prefs", {
      method: "POST",
      body: JSON.stringify({
        favourites: state.favourites || [],
        recently_used: state.adminRecentSections || [],
        preferred_landing_page: state.preferredLandingPage || "overview",
        sidebar_collapsed: document.body.classList.contains("sidebar-collapsed"),
        theme_preference: state.themePreference || "system",
        dashboard_preferences: state.dashboardPreferences || {},
        notification_preferences: state.notificationPreferences || {}
      })
    });
  } catch {
    // Preferences are best-effort only.
  }
}

async function touchRecentSection(section) {
  if (!sectionTitles[section] || section === "overview") return;
  const current = Array.isArray(state.favourites) ? state.favourites : [];
  const recent = Array.isArray(state.adminRecentSections) ? state.adminRecentSections.filter((item) => item !== section) : [];
  recent.unshift(section);
  state.adminRecentSections = recent.slice(0, 10);
  try {
    await api("prefs", {
      method: "POST",
      body: JSON.stringify({
        favourites: current,
        recently_used: state.adminRecentSections,
        preferred_landing_page: state.preferredLandingPage || "overview",
        sidebar_collapsed: document.body.classList.contains("sidebar-collapsed"),
        theme_preference: state.themePreference || "system",
        dashboard_preferences: state.dashboardPreferences || {},
        notification_preferences: state.notificationPreferences || {}
      })
    });
  } catch {
    // Preference tracking should never block admin work.
  }
}

function setTopbar(section) {
  const title = sectionTitles[section] || "Overview";
  document.querySelector(".admin-topbar-title strong").textContent = title;
  document.querySelector(".admin-topbar-title span").textContent = sectionDescriptions[section] || "JA Experiences & Discovery administration.";
  updatePinButton();
}

function getServiceName() {
  const branding = state.branding || {};
  return branding.service_name || branding.trading_name || "JA Experiences & Discovery";
}

async function applyAdminBranding() {
  try {
    const response = await fetch("/site-settings", { credentials: "include", cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    state.branding = data.branding || {};
  } catch {
    state.branding = {};
  }

  const branding = state.branding || {};
  const serviceName = getServiceName();
  const businessName = branding.business_name || "JA Group Services Ltd";

  document.title = `Admin Control Centre | ${serviceName}`;
  document.querySelectorAll(".admin-brand span").forEach((element) => {
    element.textContent = serviceName;
  });
  document.querySelectorAll(".admin-topbar-title span").forEach((element) => {
    element.textContent = sectionDescriptions[state.currentSection] || `${serviceName} administration.`;
  });

  const logo = document.querySelector(".admin-logo");
  if (logo && branding.logo_url) {
    logo.innerHTML = `<img src="${escapeAttr(branding.logo_url)}" alt="${escapeAttr(serviceName)} logo">`;
    logo.classList.add("has-image");
  }

  let favicon = document.querySelector('link[rel="icon"]');
  if (branding.favicon_url) {
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = branding.favicon_url;
  }

  document.querySelectorAll("[data-business-name]").forEach((element) => {
    element.textContent = businessName;
  });
}

function setAdmin(admin) {
  const email = admin.email || "";
  const name = admin.name && admin.name !== email ? admin.name : email.split("@")[0] || "JA admin";
  setText("adminName", name);
  setText("adminEmail", email);
  setText("adminStatus", "Admin access verified");
  setText("sidebarAdminName", name);
  setText("sidebarAdminEmail", email);
  setText("sidebarAdminAccess", admin.role || "Admin Access Verified");
  document.querySelectorAll(".avatar").forEach((avatar) => {
    avatar.textContent = (name || email || "A").slice(0, 1).toUpperCase();
  });
  state.adminName = name;
  state.adminRole = admin.role || state.adminRole || "Administrator";
  state.allowedSections = Array.isArray(admin.allowed_sections) && admin.allowed_sections.length ? admin.allowed_sections : ["overview"];
  state.favourites = Array.isArray(admin.preferences?.favourites) ? admin.preferences.favourites : state.favourites;
  state.adminRecentSections = Array.isArray(admin.preferences?.recently_used) ? admin.preferences.recently_used : state.adminRecentSections;
  state.dashboardPreferences = admin.preferences?.dashboard_preferences || state.dashboardPreferences || {};
  state.notificationPreferences = admin.preferences?.notification_preferences || state.notificationPreferences || {};
  state.preferredLandingPage = admin.preferences?.preferred_landing_page || state.preferredLandingPage || "overview";
  state.themePreference = admin.preferences?.theme_preference || state.themePreference || "system";
  document.body.classList.toggle("sidebar-collapsed", Boolean(admin.preferences?.sidebar_collapsed));
  syncNavigationAccess();
  renderFavourites();
  if (!state.initialWorkspaceApplied) {
    state.initialWorkspaceApplied = true;
    const landing = state.preferredLandingPage || admin.workspace?.default_landing_page || "overview";
    if (landing && landing !== state.currentSection && sectionTitles[landing]) {
      setTimeout(() => loadSection(landing), 0);
    }
  }
}

function dashboardQuickCards() {
  const widgets = [
    ["customers", "users", "View CRM", "Search and manage customer profiles"],
    ["status", "pulse", "Status Centre", "Review live service health and incidents"],
    ["maintenance", "shield", "Maintenance mode", "Manage public maintenance controls"],
    ["comingsoon", "clock", "Publish website", "Review Coming Soon visibility"],
    ["stripe", "card", "Stripe dashboard", "Review connection and API controls"],
    ["audit", "clock", "Audit logs", "Review sensitive administrative activity"],
    ["datarequests", "file", "Data requests", "Process UK GDPR rights requests"],
    ["plans", "plans", "Plans & Prices", "Review plan visibility and pricing"],
    ["admins", "shield", "Admin Users", "Manage administrator access"],
    ["roles", "users", "Roles", "Manage roles and permissions"],
    ["analytics", "chart", "Analytics", "Review operational performance"]
  ];
  const allowed = new Set(state.allowedSections || ["overview"]);
  return widgets.filter(([section]) => allowed.has(section)).map(([section, icon, title, text]) => quick(section, icon, title, text));
}

function syncNavigationAccess() {
  const allowed = new Set(state.allowedSections || ["overview"]);
  document.querySelectorAll("[data-section]").forEach((button) => {
    const section = button.dataset.section;
    const permitted = allowed.has(section);
    button.hidden = !permitted;
    button.setAttribute("aria-hidden", permitted ? "false" : "true");
    button.disabled = !permitted;
  });
  document.querySelectorAll("[data-section]").forEach((button) => {
    const permitted = allowed.has(button.dataset.section);
    if (!permitted) button.classList.remove("active");
  });
}

function bindFavouriteActions() {
  document.getElementById("pinSectionButton")?.addEventListener("click", toggleCurrentFavourite);
}

function renderFavourites() {
  const group = document.getElementById("favouritesGroup");
  const nav = document.getElementById("favouritesNav");
  if (!group || !nav) return;
   const allowed = new Set(state.allowedSections || ["overview"]);
   const favourites = state.favourites.filter((section) => sectionTitles[section] && allowed.has(section));
  group.hidden = favourites.length === 0;
  nav.innerHTML = favourites.map((section, index) => `
    <button data-section="${escapeAttr(section)}" data-icon="dashboard" class="${state.currentSection === section ? "active" : ""}">
      <span>${escapeHtml(sectionTitles[section])}</span>
      <span style="margin-left:auto;display:inline-flex;gap:.25rem;">
        <span data-fav-move="${escapeAttr(section)}" data-dir="-1" title="Move up">↑</span>
        <span data-fav-move="${escapeAttr(section)}" data-dir="1" title="Move down">↓</span>
      </span>
    </button>
  `).join("");
  decorateIcons();
  nav.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (event.target.closest("[data-fav-move]")) return;
      loadSection(button.dataset.section);
    });
  });
  nav.querySelectorAll("[data-fav-move]").forEach((control) => {
    control.addEventListener("click", async (event) => {
      event.stopPropagation();
      const section = control.dataset.favMove;
      const from = state.favourites.indexOf(section);
      const to = from + Number(control.dataset.dir || 0);
      if (from < 0 || to < 0 || to >= state.favourites.length) return;
      const next = [...state.favourites];
      next.splice(from, 1);
      next.splice(to, 0, section);
      await saveFavourites(next);
    });
  });
  updatePinButton();
}

function updatePinButton() {
  const button = document.getElementById("pinSectionButton");
  if (!button) return;
  button.textContent = state.favourites.includes(state.currentSection) ? "Unpin Page" : "Pin Page";
}

async function toggleCurrentFavourite() {
  const section = state.currentSection;
  if (!sectionTitles[section]) return;
  const next = state.favourites.includes(section)
    ? state.favourites.filter((item) => item !== section)
    : [...state.favourites, section];
  await saveFavourites(next);
}

async function saveFavourites(favourites) {
  const data = await api("prefs", { method: "POST", body: JSON.stringify({ favourites }) });
  state.favourites = data.preferences?.favourites || favourites;
  renderFavourites();
}

function renderSection(section, data) {
  if (section === "overview") renderOverview(data.overview);
  if (section === "operations") renderOperations(data.operations);
  if (section === "analytics") renderAnalytics(data.analytics, data.status);
  if (section === "status") renderStatusCentre(data.status);
  if (section === "admins") renderAdmins(data.admins);
  if (section === "roles") renderRoles(data.roles, data.permission_catalog);
  if (section === "customers") renderCustomers(data.customers);
  if (section === "plans") renderPlans(data.plans);
  if (section === "stripe") renderStripe(data.stripe);
  if (section === "branding") renderBranding(data.branding);
  if (section === "policies") renderPolicies(data.policies);
  if (section === "support") renderSupport(data.support);
  if (section === "comingsoon") renderComingSoon(data.comingsoon);
  if (section === "maintenance") renderMaintenance(data.maintenance);
  if (section === "system") renderSystem(data.system);
  if (section === "datarequests") renderDataRequests(data.datarequests);
  if (section === "systemreports") renderSystemReports(data.systemreports);
  if (section === "closures") renderClosures(data.closures);
  if (section === "affiliate") renderAffiliate(data.affiliate);
  if (section === "appearance") renderAppearance(data.appearance);
  if (section === "email") renderEmail(data.email, data.test);
  if (section === "audit") renderAudit(data.audit);
  if (section === "sessions") renderSessions(data.sessions);
}

function renderOverview(overview) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = state.adminName || "Administrator";
  const roleName = state.adminRole || "Administrator";
  const widgets = Array.isArray(state.data.overview?.admin?.workspace?.widgets) ? state.data.overview.admin.workspace.widgets : [];
  const recentAudit = Array.isArray(overview.recentAudit) ? overview.recentAudit : [];
  const latestCustomers = Array.isArray(overview.latestCustomers) ? overview.latestCustomers : [];
  const latestSupport = Array.isArray(overview.latestSupport) ? overview.latestSupport : [];
  const latestReports = Array.isArray(overview.latestReports) ? overview.latestReports : [];
  const sessions = Array.isArray(overview.sessions) ? overview.sessions : [];
  const activeAdmins = Array.isArray(overview.activeAdmins) ? overview.activeAdmins : [];
  const maintenanceOn = String(overview.maintenanceStatus).toLowerCase() === "on";
  const comingSoonOn = String(overview.comingSoonStatus).toLowerCase() === "on";
  const websiteLabel = maintenanceOn ? "Maintenance" : comingSoonOn ? "Coming soon" : "Online";
  const websiteTone = maintenanceOn ? "critical" : comingSoonOn ? "warning" : "online";
  const widgetCards = widgets.map((widget) => `
    <article class="admin-card widget-card">
      <div class="section-head"><div><h3>${escapeHtml(widget.label)}</h3><p>${escapeHtml(widget.section)}</p></div></div>
      <div class="widget-body">
        <strong>${escapeHtml(widget.section === "stripe" ? "Open section" : widget.section === "sessions" ? "Session management" : widget.section === "audit" ? "Audit review" : "Workspace card")}</strong>
      </div>
    </article>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <header class="dashboard-welcome">
      <div>
        <p class="eyebrow">Operations dashboard</p>
        <h1>${escapeHtml(greeting)}, ${escapeHtml(name)}</h1>
        <p class="eyebrow">${escapeHtml(roleName)}</p>
        <p>Here is the latest operational view of JA Experiences &amp; Discovery.</p>
      </div>
      <div class="website-state">
        <span class="status-dot is-${escapeAttr(websiteTone)}"></span>
        <div><strong>Website ${escapeHtml(websiteLabel)}</strong><span>Public experience status</span></div>
      </div>
    </header>

    <section class="kpi-grid" aria-label="Key performance indicators">
      ${kpi("Total customers", overview.customers, "All customer profiles")}
      ${kpi("Lifetime members", overview.lifetimeUsers, "Lifetime access enabled")}
      ${kpi("Active plans", overview.activePlans, `${overview.plans || 0} plans configured`)}
      ${kpi("Revenue", "Not available", "No revenue API is connected")}
      ${kpi("Pending data requests", overview.dataProtectionRequests, "Active rights requests")}
      ${kpi("Support tickets", overview.supportTickets, "All recorded tickets")}
      ${kpi("Website status", websiteLabel, maintenanceOn ? "Maintenance mode enabled" : comingSoonOn ? "Coming Soon enabled" : "Public site available")}
      ${kpi("Worker status", "Online", "Admin API responded successfully")}
    </section>

    <section class="admin-card">
      <div class="section-head">
        <div><h2>Workspace</h2><p>Your personalised dashboard layout is driven by your role and preferences.</p></div>
      </div>
      <div class="workspace-grid">
        ${widgetCards}
      </div>
    </section>

    <div class="dashboard-layout">
      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head">
            <div><h2>Quick actions</h2><p>Common operational tasks and platform controls.</p></div>
          </div>
          <div class="quick-grid">
            ${dashboardQuickCards().join("")}
          </div>
        </section>

        <section class="admin-card">
          <div class="section-head">
            <div><h2>Recent activity</h2><p>Platform events will appear here when an activity feed is available.</p></div>
            <button class="mini-button" type="button" data-action="load-section" data-section="audit">View audit log</button>
          </div>
          <div class="activity-empty">
            <div><span class="activity-empty-icon">&#8596;</span><strong>No recent activity feed</strong><p>Use the audit log for the current administrative history.</p></div>
          </div>
        </section>
      </div>

      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head"><div><h2>Platform health</h2><p>Current signals from this admin session.</p></div></div>
          <div class="health-list">
            ${health("Website", websiteLabel, websiteTone)}
            ${health("API", "Operational", "online")}
            ${health("Database", "Connected", "online")}
            ${health("Email", "Check settings", "warning")}
            ${health("Workers", "Operational", "online")}
            ${health("Cloudflare", "Access verified", "online")}
          </div>
        </section>

        <section class="admin-card">
          <div class="section-head"><div><h2>Website access</h2><p>Preview or manage secure access to the public website.</p></div></div>
          <div class="section-actions">
            <button class="admin-button" type="button" data-action="create-bypass">Enter as Admin</button>
            <a class="admin-button secondary" href="/?preview_public_block=1" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href, '_blank', 'noopener,noreferrer'); return false;">Preview Public View</a>
            <button class="admin-button secondary" type="button" data-action="remove-bypass">Exit Admin Access</button>
          </div>
        </section>
      </div>
    </div>

    <div class="dashboard-layout" style="margin-top:1rem;">
      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head"><div><h2>Recent Audit Events</h2><p>Latest privileged activity.</p></div></div>
          ${table(["Action", "Actor", "Entity", "Record", "Date"], recentAudit.map((item) => `
            <tr><td><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.summary || "")}</span></td><td>${escapeHtml(item.actor_email || "system")}</td><td>${escapeHtml(item.entity_type || "")}</td><td>${escapeHtml(item.entity_id || "")}</td><td>${escapeHtml(formatDate(item.created_at))}</td></tr>
          `).join(""))}
        </section>
        <section class="admin-card">
          <div class="section-head"><div><h2>Active Administrators</h2><p>Administrators currently marked as active.</p></div></div>
          ${table(["Name", "Role", "Email", "Updated"], activeAdmins.map((item) => `
            <tr><td><strong>${escapeHtml(item.name || item.email)}</strong></td><td>${escapeHtml(item.role || "")}</td><td>${escapeHtml(item.email || "")}</td><td>${escapeHtml(formatDate(item.updated_at))}</td></tr>
          `).join(""))}
        </section>
      </div>
      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head"><div><h2>Latest Customer Activity</h2><p>Recently updated customer records.</p></div></div>
          ${table(["Customer", "Contact", "Updated"], latestCustomers.map((item) => `
            <tr><td><strong>${escapeHtml(item.display_name || item.verified_name || item.email)}</strong></td><td>${escapeHtml(item.contact_email || item.email || "")}</td><td>${escapeHtml(formatDate(item.updated_at))}</td></tr>
          `).join(""))}
        </section>
        <section class="admin-card">
          <div class="section-head"><div><h2>Latest Support Activity</h2><p>Recent support ticket updates.</p></div></div>
          ${table(["Subject", "Priority", "Status", "Updated"], latestSupport.map((item) => `
            <tr><td><strong>${escapeHtml(item.subject || item.id || "")}</strong></td><td>${escapeHtml(item.priority || "")}</td><td>${escapeHtml(item.status || "")}</td><td>${escapeHtml(formatDate(item.updated_at))}</td></tr>
          `).join(""))}
        </section>
        <section class="admin-card">
          <div class="section-head"><div><h2>Latest System Reports</h2><p>Recent platform report activity.</p></div></div>
          ${table(["Title", "Status", "Updated"], latestReports.map((item) => `
            <tr><td><strong>${escapeHtml(item.title || item.id || "")}</strong></td><td>${escapeHtml(item.status || "")}</td><td>${escapeHtml(formatDate(item.updated_at))}</td></tr>
          `).join(""))}
        </section>
      </div>
      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head"><div><h2>Active Sessions</h2><p>Current bypass and access sessions.</p></div></div>
          ${table(["Administrator", "Created", "Last used", "Status"], sessions.map((session) => `
            <tr><td><strong>${escapeHtml(session.admin_email || "")}</strong></td><td>${escapeHtml(formatDate(session.created_at))}</td><td>${escapeHtml(formatDate(session.last_used_at || session.created_at))}</td><td>${session.revoked_at ? "Revoked" : "Active"}</td></tr>
          `).join(""))}
        </section>
      </div>
    </div>
  `;
}

function renderOperations(operations) {
  renderOverview(operations);
}

function kpi(label, value, meta) {
  return `<article class="kpi-card"><span class="kpi-label">${escapeHtml(label)}</span><strong class="kpi-value">${escapeHtml(value)}</strong><span class="kpi-meta">${escapeHtml(meta)}</span></article>`;
}

function health(label, status, tone = "online") {
  return `<div class="health-item"><span class="status-dot is-${escapeAttr(tone)}"></span><strong>${escapeHtml(label)}</strong><span>${escapeHtml(status)}</span></div>`;
}

function quick(section, icon, title, text) {
  return `
    <button class="quick-card" type="button" data-action="load-section" data-section="${escapeAttr(section)}">
      <span class="quick-icon">${iconSvg(icon)}</span>
      <span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></span>
    </button>
  `;
}

function renderAnalytics(analytics = {}, statusData = null) {
  const status = statusData?.status || statusData || state.data.status?.status || {};
  const summary = status.summary || {};
  const overall = status.overall || {};
  const rows = Object.entries({
    "Total users": analytics.totalUsers,
    "New users this month": analytics.newUsersThisMonth,
    "Active users": analytics.activeUsers,
    "Lifetime users": analytics.lifetimeUsers,
    "Free users": analytics.freeUsers,
    "Paid users": analytics.paidUsers,
    "Bookings or referrals": analytics.totalBookingsOrReferrals,
    "Total enquiries": analytics.totalEnquiries,
    "Open support requests": analytics.openSupportRequests,
    "Open data requests": analytics.openDataRequests,
    "Open closure requests": analytics.openClosureRequests,
    "Website/system reports": analytics.systemReportsSubmitted,
    "Plan changes": analytics.planChanges,
    "Email notification status": analytics.emailNotificationStatus
  }).map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value ?? 0)}</td></tr>`).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="section-head">
      <div><h2>Analytics</h2><p>Operational dashboard for account, request, enquiry, notification and live service activity.</p></div>
      <div class="section-actions">
        <button class="admin-button secondary" type="button" data-action="load-section" data-section="status">Open Status Centre</button>
        <button class="admin-button secondary" type="button" data-action="export-records" data-section="analytics" data-format="csv">Export CSV</button>
      </div>
    </div>
    <div class="admin-grid">
      ${stat("Total users", analytics.totalUsers || 0)}
      ${stat("New this month", analytics.newUsersThisMonth || 0)}
      ${stat("Lifetime users", analytics.lifetimeUsers || 0)}
      ${stat("Total enquiries", analytics.totalEnquiries || 0)}
      ${stat("Open data requests", analytics.openDataRequests || 0)}
      ${stat("System reports", analytics.systemReportsSubmitted || 0)}
      ${stat("Overall System Status", overall.label || "Status unavailable")}
      ${stat("Operational Components", `${summary.operationalComponents || 0}/${summary.totalComponents || 0}`)}
      ${stat("Active Incidents", summary.activeIncidents || 0)}
      ${stat("Scheduled Maintenance", summary.scheduledMaintenance || 0)}
    </div>
    <div class="admin-card">
      <div class="section-head"><div><h2>Performance Summary</h2><p>Use this table for a quick management snapshot. Date-range filters can be extended once booking/referral event data is available.</p></div></div>
      ${table(["Metric", "Value"], rows)}
    </div>
  `;
}

function renderStatusCentre(statusData = {}) {
  const status = statusData.status || statusData;
  const summary = status?.summary || {};
  const overall = status?.overall || {};
  const components = Array.isArray(status?.components) ? status.components : [];
  const incidents = status?.incidents || {};
  const maintenance = status?.maintenance || {};
  const source = status?.source || {};
  const latestUpdated = status?.lastUpdated || source.updatedAt || new Date().toISOString();

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Status Centre</h2>
          <p>Live operational dashboard from Atlassian Statuspage. The same feed powers the public status page.</p>
        </div>
        <div class="section-actions">
          <button class="admin-button secondary" type="button" data-action="refresh-status-centre">Refresh Status</button>
          <a class="admin-button secondary" href="/status/" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href, '_blank', 'noopener,noreferrer'); return false;">Open Public Status Page</a>
          <a class="admin-button" href="https://jagroupservices.statuspage.io" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href, '_blank', 'noopener,noreferrer'); return false;">Open Atlassian Statuspage</a>
        </div>
      </div>
      <div class="admin-grid">
        ${stat("Overall System Status", overall.label || "Status unavailable")}
        ${stat("Component Status", `${summary.operationalComponents || 0}/${summary.totalComponents || 0} operational`)}
        ${stat("Current Incidents", incidents.active?.length || summary.activeIncidents || 0)}
        ${stat("Scheduled Maintenance", maintenance.scheduled?.length || summary.scheduledMaintenance || 0)}
        ${stat("Last Updated", formatDate(latestUpdated))}
        ${stat("Automatic Refresh", `${Math.max(Number(status?.refreshAfter || 60), 30)}s`)}
      </div>
      <div class="admin-card" style="margin-top:1rem;">
        <div class="section-head"><div><h2>System Health Summary</h2><p>${escapeHtml(overall.description || "Live service status supplied by the official portal.")}</p></div></div>
        <div class="health-list">
          ${health("Overall", overall.label || "Status unavailable", overall.tone || "online")}
          ${health("API feed", status?.ok ? "Connected" : "Unavailable", status?.ok ? "online" : "warning")}
          ${health("Operational components", `${summary.operationalComponents || 0} of ${summary.totalComponents || 0}`, Number(summary.affectedComponents || 0) ? "warning" : "online")}
          ${health("Active incidents", String(incidents.active?.length || 0), incidents.active?.length ? "critical" : "online")}
          ${health("Maintenance", String((maintenance.active?.length || 0) + (maintenance.scheduled?.length || 0)), maintenance.active?.length || maintenance.scheduled?.length ? "maintenance" : "online")}
          ${health("Source", source.name || "Atlassian Statuspage", "online")}
        </div>
      </div>
    </div>
    <div class="dashboard-layout">
      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head"><div><h2>Component Status</h2><p>Current status for each published service component.</p></div></div>
          <div class="component-grid">
            ${components.map((component) => `
              <article class="component-card">
                <div class="component-card-head">
                  <div>
                    <h3>${escapeHtml(component.name)}</h3>
                    <p>${escapeHtml(component.description || "No component description provided.")}</p>
                  </div>
                  ${badge(component.statusLabel || component.status || "Unknown", statusColour(component.status))}
                </div>
                <p>Updated ${escapeHtml(formatDate(component.updatedAt || latestUpdated))}</p>
              </article>
            `).join("") || `<div class="admin-alert">No components are currently published by the official status service.</div>`}
          </div>
        </section>
      </div>
      <div class="dashboard-stack">
        <section class="admin-card">
          <div class="section-head"><div><h2>Current Incidents</h2><p>Active incidents and the latest published updates.</p></div></div>
          ${renderStatusEventList(incidents.active || [], "No active incidents", "The official status service has not published any active incidents.")}
        </section>
        <section class="admin-card">
          <div class="section-head"><div><h2>Scheduled Maintenance</h2><p>Upcoming or in-progress maintenance events.</p></div></div>
          ${renderStatusEventList([...(maintenance.active || []), ...(maintenance.scheduled || [])], "No scheduled maintenance", "The official status service has not published any maintenance events.")}
        </section>
        <section class="admin-card">
          <div class="section-head"><div><h2>Status History</h2><p>Recently resolved incidents and completed maintenance.</p></div></div>
          ${renderStatusEventList([...(incidents.history || []), ...(maintenance.history || [])], "No recent history", "No resolved incidents or completed maintenance are currently published.")}
        </section>
      </div>
    </div>
  `;

  document.querySelector('[data-action="refresh-status-centre"]')?.addEventListener("click", async () => {
    const data = await api("status");
    state.data.status = data;
    renderStatusCentre(data);
  });
}

function renderStatusEventList(events = [], emptyTitle, emptyDescription) {
  if (!events.length) {
    return `<div class="admin-alert">${escapeHtml(emptyTitle)}: ${escapeHtml(emptyDescription)}</div>`;
  }

  return `<div class="activity-list">${events.map((event) => `
    <article class="activity-card">
      <div class="section-head">
        <div>
          <h3>${escapeHtml(event.name || "Service event")}</h3>
          <p>${escapeHtml(event.eventType || "Service update")}</p>
        </div>
        ${badge(event.statusLabel || event.status || "Unknown", statusColour(event.status))}
      </div>
      <p>${escapeHtml(event.body || event.description || "Live status update available from the official portal.")}</p>
      <p>${escapeHtml(formatDate(event.updatedAt || event.resolvedAt || event.createdAt || event.scheduledFor))}</p>
    </article>
  `).join("")}</div>`;
}

async function fetchLiveStatus(skipCache = false) {
  const response = await fetch("/api/status", {
    cache: skipCache ? "no-store" : "no-store",
    headers: { "Accept": "application/json" }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.message || "Status data could not be loaded.");
  return data;
}

function renderAdmins(admins = []) {
  const roles = Array.isArray(state.data.admins?.roles) ? state.data.admins.roles : [];
  const canAssignPlatformOwner = Boolean(state.data.admins?.admin?.is_platform_owner);
  const roleOptions = roles
    .filter((role) => canAssignPlatformOwner || role.name !== "Platform Owner")
    .map((role) => `<option value="${escapeAttr(role.name)}">${escapeHtml(role.name)}</option>`)
    .join("") || `<option value="Administrator">Administrator</option>`;
  const rows = admins.map((admin) => {
    const isDefault = admin.source === "default";
    const permissions = parseAdminPermissions(admin.permissions);
    const canRemove = !isDefault && admin.role !== "Platform Owner";
    return `
      <tr>
        <td><strong>${escapeHtml(admin.name || "Admin user")}</strong><span>${escapeHtml(admin.email)}</span></td>
        <td>${badge(admin.role || "Admin")}</td>
        <td>${badge(permissions.includes("*") ? "All permissions" : `${permissions.length} permissions`)}</td>
        <td>${badge(admin.status || "Active", String(admin.status || "Active").toLowerCase() === "active" ? "green" : "amber")}</td>
        <td>${badge(isDefault ? "Protected default" : "Portal", isDefault ? "green" : "")}</td>
        <td>${escapeHtml(formatDate(admin.updated_at || admin.created_at))}</td>
        <td>
          <div class="section-actions">
            <button class="mini-button" type="button" data-action="open-admin-profile" data-email="${escapeAttr(admin.email)}">Edit profile</button>
            ${canRemove ? `<button class="mini-button" type="button" data-action="suspend-admin" data-email="${escapeAttr(admin.email)}">Suspend</button>` : ""}
            ${(admin.status || "Active") === "Suspended" && !isDefault ? `<button class="mini-button" type="button" data-action="reactivate-admin" data-email="${escapeAttr(admin.email)}">Reactivate</button>` : ""}
            ${canRemove ? `<button class="mini-button danger" type="button" data-action="remove-admin" data-email="${escapeAttr(admin.email)}">Delete</button>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Identity Management</h2>
          <p>Add, review and update Microsoft Entra-authenticated administrators. Cloudflare Access continues to protect the portal while the application authorises access from the admin_users table.</p>
        </div>
        <div class="section-actions">
          <a class="admin-button secondary" href="https://entra.microsoft.com/" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href, '_blank', 'noopener,noreferrer'); return false;">Open Microsoft Entra</a>
        </div>
      </div>

      <form class="admin-form" id="adminUserForm">
        ${input("Admin email", "new_admin_email", "email")}
        ${input("Display name", "new_admin_name")}
        <label class="admin-label">Role
          <select id="new_admin_role">${roleOptions}</select>
        </label>
        <button class="admin-button" type="submit">Add admin</button>
      </form>

      <div id="adminUserSaved" class="admin-success" hidden></div>
      <div class="admin-form" style="margin-bottom:1rem;">
        <label class="admin-label">Search administrators<input id="adminSearch" type="search" placeholder="Search name, email, role or status"></label>
      </div>
      <div id="adminTableWrap">${table(["Administrator", "Role", "Permissions", "Status", "Source", "Updated", "Actions"], rows)}</div>
    </div>
  `;

  document.getElementById("adminUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await api("admins", {
      method: "POST",
      body: JSON.stringify({ email: getValue("new_admin_email"), name: getValue("new_admin_name"), role: getValue("new_admin_role") })
    });
    await loadSection("admins");
    const notice = document.getElementById("adminUserSaved");
    if (notice) {
      notice.hidden = false;
      notice.textContent = "Admin added. They can access once their Microsoft Entra / Cloudflare Access account is authorised.";
    }
  });
  setValue("new_admin_role", "Administrator");

  const refresh = () => {
    const search = getValue("adminSearch").toLowerCase();
    const filtered = admins.filter((admin) => {
      const text = `${admin.name || ""} ${admin.email || ""} ${admin.role || ""} ${admin.status || ""}`.toLowerCase();
      return !search || text.includes(search);
    });
    const filteredRows = filtered.map((admin) => {
      const isDefault = admin.source === "default";
      const permissions = parseAdminPermissions(admin.permissions);
      const canRemove = !isDefault && admin.role !== "Platform Owner";
      return `
        <tr>
          <td><strong>${escapeHtml(admin.name || "Admin user")}</strong><span>${escapeHtml(admin.email)}</span></td>
          <td>${badge(admin.role || "Admin")}</td>
          <td>${badge(permissions.includes("*") ? "All permissions" : `${permissions.length} permissions`)}</td>
          <td>${badge(admin.status || "Active", String(admin.status || "Active").toLowerCase() === "active" ? "green" : "amber")}</td>
          <td>${badge(isDefault ? "Protected default" : "Portal", isDefault ? "green" : "")}</td>
          <td>${escapeHtml(formatDate(admin.updated_at || admin.created_at))}</td>
          <td>
            <div class="section-actions">
              <button class="mini-button" type="button" data-action="open-admin-profile" data-email="${escapeAttr(admin.email)}">Edit administrator</button>
              ${canRemove ? `<button class="mini-button" type="button" data-action="suspend-admin" data-email="${escapeAttr(admin.email)}">Suspend</button>` : ""}
              ${(admin.status || "Active") === "Suspended" && !isDefault ? `<button class="mini-button" type="button" data-action="reactivate-admin" data-email="${escapeAttr(admin.email)}">Reactivate</button>` : ""}
              ${canRemove ? `<button class="mini-button danger" type="button" data-action="remove-admin" data-email="${escapeAttr(admin.email)}">Delete</button>` : ""}
            </div>
          </td>
        </tr>
      `;
    }).join("");
    document.getElementById("adminTableWrap").innerHTML = table(["Administrator", "Role", "Permissions", "Status", "Source", "Updated", "Actions"], filteredRows);
  };
  document.getElementById("adminSearch")?.addEventListener("input", refresh);
}

function renderRoles(roles = [], permissionCatalog = {}) {
  const rows = roles.map((role) => {
    const permissions = Array.isArray(role.permissions) ? role.permissions : [];
    const summary = permissions.includes("*") ? "All permissions" : `${permissions.length} permissions`;
    return `
      <tr>
        <td><strong>${escapeHtml(role.name)}</strong><span>${escapeHtml(role.description || "Role definition")}</span></td>
        <td>${badge(role.is_system ? "System" : "Custom", role.is_system ? "green" : "amber")}</td>
        <td>${badge(summary)}</td>
        <td>${escapeHtml(String(role.assigned_count || 0))}</td>
        <td>${escapeHtml(formatDate(role.updated_at))}</td>
        <td>
          <div class="section-actions">
            <button class="mini-button" type="button" data-action="edit-role" data-name="${escapeAttr(role.name)}">Edit</button>
            ${role.is_system ? "" : `<button class="mini-button" type="button" data-action="clone-role" data-name="${escapeAttr(role.name)}">Clone</button>`}
            ${role.is_system ? "" : `<button class="mini-button" type="button" data-action="rename-role" data-name="${escapeAttr(role.name)}">Rename</button>`}
            ${role.is_system ? "" : `<button class="mini-button danger" type="button" data-action="delete-role" data-name="${escapeAttr(role.name)}">Delete</button>`}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  const categories = Object.entries(permissionCatalog || {});
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Roles &amp; Permissions</h2>
          <p>Create, clone and edit access roles using grouped permission categories.</p>
        </div>
        <div class="section-actions">
          <button class="admin-button" type="button" data-action="create-role">Create role</button>
        </div>
      </div>
      <div class="admin-grid" style="margin-bottom:1rem;">
        ${roles.map((role) => `
          <article class="admin-stat">
            <span>${escapeHtml(role.name)}</span>
            <strong>${escapeHtml(String(role.assigned_count || 0))} members</strong>
            <span>${escapeHtml(role.is_system ? "System role" : `${(Array.isArray(role.permissions) ? role.permissions.length : 0)} permissions`)}</span>
          </article>
        `).join("")}
      </div>
      <div class="admin-form" style="margin-bottom:1rem;">
        <label class="admin-label">Search roles<input id="roleSearch" type="search" placeholder="Search by role name or description"></label>
        <label class="admin-label">Filter type<select id="roleTypeFilter"><option value="">All</option><option value="system">System</option><option value="custom">Custom</option></select></label>
      </div>
      <div id="roleTableWrap">${table(["Role", "Type", "Permissions", "Assigned users", "Updated", "Actions"], rows)}</div>
    </div>
    <div class="admin-card" style="margin-top:1rem;">
      <div class="section-head"><div><h2>Permission catalog</h2><p>These permissions power the navigation, route security and dashboard visibility.</p></div></div>
      <div class="permission-catalog">
        ${categories.map(([group, permissions]) => `
          <article class="list-card">
            <strong>${escapeHtml(group)}</strong>
            <div class="permission-tags">
              ${permissions.map((permission) => `<span class="badge">${escapeHtml(permission)}</span>`).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  const refresh = () => {
    const search = getValue("roleSearch").toLowerCase();
    const type = getValue("roleTypeFilter");
    const filtered = roles.filter((role) => {
      const text = `${role.name} ${role.description || ""}`.toLowerCase();
      const matchesType = !type || (type === "system" ? Number(role.is_system || 0) === 1 : Number(role.is_system || 0) === 0);
      return (!search || text.includes(search)) && matchesType;
    });
    const filteredRows = filtered.map((role) => {
      const permissions = Array.isArray(role.permissions) ? role.permissions : [];
      const summary = permissions.includes("*") ? "All permissions" : `${permissions.length} permissions`;
      return `
        <tr>
          <td><strong>${escapeHtml(role.name)}</strong><span>${escapeHtml(role.description || "Role definition")}</span></td>
          <td>${badge(role.is_system ? "System" : "Custom", role.is_system ? "green" : "amber")}</td>
          <td>${badge(summary)}</td>
          <td>${escapeHtml(String(role.assigned_count || 0))}</td>
          <td>${escapeHtml(formatDate(role.updated_at))}</td>
          <td>
            <div class="section-actions">
              <button class="mini-button" type="button" data-action="edit-role" data-name="${escapeAttr(role.name)}">Edit</button>
              ${role.is_system ? "" : `<button class="mini-button" type="button" data-action="clone-role" data-name="${escapeAttr(role.name)}">Clone</button>`}
              ${role.is_system ? "" : `<button class="mini-button" type="button" data-action="rename-role" data-name="${escapeAttr(role.name)}">Rename</button>`}
              ${role.is_system ? "" : `<button class="mini-button danger" type="button" data-action="delete-role" data-name="${escapeAttr(role.name)}">Delete</button>`}
            </div>
          </td>
        </tr>
      `;
    }).join("");
    document.getElementById("roleTableWrap").innerHTML = table(["Role", "Type", "Permissions", "Assigned users", "Updated", "Actions"], filteredRows);
  };
  document.getElementById("roleSearch")?.addEventListener("input", refresh);
  document.getElementById("roleTypeFilter")?.addEventListener("change", refresh);
}

function getCurrentRoles() {
  return Array.isArray(state.data.roles?.roles) ? state.data.roles.roles : Array.isArray(state.data.admins?.roles) ? state.data.admins.roles : [];
}

function getPermissionCatalog() {
  return state.data.roles?.permission_catalog || state.data.admins?.permission_catalog || {};
}

function buildPermissionGroups(selected = []) {
  const catalog = getPermissionCatalog();
  return Object.entries(catalog).map(([group, permissions]) => `
    <fieldset class="permission-group">
      <legend>${escapeHtml(group)}</legend>
      <div class="permission-grid">
        ${permissions.map((permission) => `
          <label class="permission-item">
            <input type="checkbox" value="${escapeAttr(permission)}" ${selected.includes(permission) ? "checked" : ""}>
            <span>${escapeHtml(permission)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("");
}

function getRoleDefaultPermissions(roleName) {
  const role = getCurrentRoles().find((item) => String(item.name) === String(roleName));
  return Array.isArray(role?.permissions) ? role.permissions : [];
}

function renderPermissionEditor(selected = [], filter = "", locked = false) {
  const catalog = getPermissionCatalog();
  const query = String(filter || "").toLowerCase();
  const groups = Object.entries(catalog)
    .map(([group, permissions]) => {
      const filtered = permissions.filter((permission) => !query || `${group} ${permission}`.toLowerCase().includes(query));
      if (!filtered.length) return "";
      return `
        <fieldset class="permission-group">
          <legend>${escapeHtml(group)}</legend>
          <div class="permission-grid">
            ${filtered.map((permission) => `
              <label class="permission-item">
                <input type="checkbox" value="${escapeAttr(permission)}" ${selected.includes(permission) ? "checked" : ""} ${locked ? "disabled" : ""}>
                <span>${escapeHtml(permission)}</span>
              </label>
            `).join("")}
          </div>
        </fieldset>
      `;
    })
    .filter(Boolean)
    .join("");

  return `
    <div class="admin-card" style="margin:0;">
      <div class="section-head">
        <div><h3>Permissions</h3><p>${locked ? "Platform Owner permissions are fixed and cannot be reduced." : "Choose the effective permissions for this administrator."}</p></div>
        <div class="section-actions">
          <button class="mini-button" type="button" data-action="select-all-permissions" ${locked ? "disabled" : ""}>Select All</button>
          <button class="mini-button" type="button" data-action="clear-all-permissions" ${locked ? "disabled" : ""}>Clear All</button>
        </div>
      </div>
      <label class="admin-label">Search permissions<input id="adminPermissionSearch" type="search" placeholder="Filter permissions" value="${escapeAttr(filter)}" ${locked ? "disabled" : ""}></label>
      <div class="permission-catalog">${groups || `<div class="admin-alert">No permissions match this filter.</div>`}</div>
    </div>
  `;
}

function openRoleEditor(role = null) {
  const isEdit = Boolean(role);
  const permissions = Array.isArray(role?.permissions) ? role.permissions : [];
  openModal(`
    <div class="modal-head">
      <div><h2>${isEdit ? `Edit role: ${escapeHtml(role.name)}` : "Create role"}</h2><p>${isEdit ? "Update the role definition and assign permissions." : "Create a custom role from grouped permissions."}</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <form class="admin-form" id="roleForm">
      ${input("Role name", "role_name")}
      <label class="admin-label">Description<textarea id="role_description"></textarea></label>
      <div class="permission-catalog">${buildPermissionGroups(permissions)}</div>
      <div class="section-actions">
        <button class="admin-button" type="submit">${isEdit ? "Save role" : "Create role"}</button>
      </div>
      <div id="roleSaved" class="admin-success" hidden></div>
    </form>
  `);

  setValue("role_name", role?.name || "");
  setValue("role_description", role?.description || "");
  if (isEdit) {
    const roleNameInput = document.getElementById("role_name");
    if (roleNameInput) roleNameInput.readOnly = true;
  }

  document.getElementById("roleForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = [...document.querySelectorAll('#roleForm input[type="checkbox"]:checked')].map((input) => input.value);
    try {
      const action = isEdit ? "update" : "create";
      const data = await api("roles", {
        method: "POST",
        body: JSON.stringify({
          action,
          name: getValue("role_name"),
          description: getValue("role_description"),
          permissions: selected
        })
      });
      const nextRoles = Array.isArray(data.roles) ? data.roles : [];
      state.data.roles = { roles: nextRoles, permission_catalog: data.permission_catalog || getPermissionCatalog() };
      state.data.admins = { ...(state.data.admins || {}), roles: nextRoles, permission_catalog: data.permission_catalog || getPermissionCatalog() };
      await loadSection("roles");
      closeModal();
    } catch (error) {
      setSaved("roleSaved", error.message, true);
    }
  });
}

function parseAdminPermissions(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function openAdminProfileModal(email, options = {}) {
  let adminList = state.data.admins?.admins || [];
  if (!adminList.length) {
    try {
      const data = await api("admins");
      state.data.admins = data;
      adminList = data.admins || [];
    } catch (error) {
      openModal(`<div class="modal-head"><div><h2>Admin profile</h2><p>Profile details could not be loaded.</p></div><button class="drawer-close" type="button" data-action="close-modal">×</button></div><div class="admin-alert">${escapeHtml(error.message)}</div>`);
      return;
    }
  }

  const admin = adminList.find((item) => String(item.email).toLowerCase() === String(email).toLowerCase());
  if (!admin) {
    openModal(`<div class="modal-head"><div><h2>Admin profile</h2><p>The requested administrator was not found.</p></div><button class="drawer-close" type="button" data-action="close-modal">×</button></div>`);
    return;
  }

  const isDefault = admin.source === "default";
  const isOwnProfile = Boolean(options.isOwnProfile);
  const isPlatformOwner = String(admin.role || "") === "Platform Owner";
  const roleOptions = getCurrentRoles()
    .filter((role) => state.data.admins?.admin?.is_platform_owner || role.name !== "Platform Owner")
    .map((role) => `<option value="${escapeAttr(role.name)}">${escapeHtml(role.name)}</option>`)
    .join("") || `<option value="Administrator">Administrator</option>`;
  const currentRoleDefaultPermissions = getRoleDefaultPermissions(admin.role);
  const initialPermissions = isPlatformOwner ? ["*"] : (parseAdminPermissions(admin.permissions).length ? parseAdminPermissions(admin.permissions) : currentRoleDefaultPermissions);
  const permissionSummary = initialPermissions;
  const loginHistory = Array.isArray(admin.login_history) ? admin.login_history : [];
  const isSuspended = String(admin.status || "").toLowerCase() === "suspended";
  openModal(`
    <div class="modal-head">
      <div><h2>${isOwnProfile ? "Account settings" : "Admin profile"}</h2><p>${isOwnProfile ? "Manage your supported display details. Your sign-in identity remains controlled by Cloudflare Access." : "Review and update this administrator's supported profile details."}</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <form class="admin-form single admin-profile-form" id="adminProfileForm">
      ${input("Display name", "admin_profile_name")}
      <label class="admin-label">Admin email<input id="admin_profile_email" type="email" value="${escapeAttr(admin.email)}"></label>
      <label class="admin-label">Access source<input type="text" value="${escapeAttr(isDefault ? "Protected environment admin" : "Admin portal")}" readonly></label>
      <label class="admin-label">Role
        <select id="admin_profile_role" ${isDefault ? "disabled" : ""}>${roleOptions}</select>
      </label>
      <label class="admin-label">Status
        <select id="admin_profile_status" ${isDefault ? "disabled" : ""}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </label>
      <div id="permissionEditorWrap">${renderPermissionEditor(permissionSummary, "", isPlatformOwner)}</div>
      <div class="section-actions">
        ${isDefault ? "" : `<button class="mini-button" type="button" data-action="profile-status-toggle">${isSuspended ? "Reactivate administrator" : "Suspend administrator"}</button>`}
        ${isOwnProfile ? `<a class="mini-button secondary" href="/admin/logout">Sign out</a>` : ""}
      </div>
      <div class="admin-card" style="margin:0;">
        <div class="section-head"><div><h3>Login history</h3><p>Recent access and role-related events.</p></div></div>
        ${table(["Event", "Entity", "Date"], loginHistory.map((item) => `
          <tr><td><strong>${escapeHtml(item.action || "")}</strong><span>${escapeHtml(item.summary || "")}</span></td><td>${escapeHtml(item.entity_type || "")}</td><td>${escapeHtml(formatDate(item.created_at))}</td></tr>
        `).join(""))}
      </div>
      <div class="admin-alert">${isDefault ? "This is a protected environment administrator. Email, role and status are read-only; only the display name can be updated." : "Email changes and separate internal admin notes are not supported by the current admin API, so they are not editable here."}</div>
      <div class="section-actions">
        <button class="admin-button" type="submit">Save profile</button>
      </div>
      <div id="adminProfileSaved" class="admin-success" hidden></div>
    </form>
  `);

  setValue("admin_profile_name", admin.name || admin.email);
  setValue("admin_profile_email", admin.email || "");
  setValue("admin_profile_role", admin.role || "Administrator");
  setValue("admin_profile_status", admin.status || "Active");
  document.getElementById("admin_profile_role")?.addEventListener("change", () => {
    if (isPlatformOwner) return;
    const nextRole = getValue("admin_profile_role");
    const defaults = nextRole === "Platform Owner" ? ["*"] : getRoleDefaultPermissions(nextRole);
    const wrap = document.getElementById("permissionEditorWrap");
    if (wrap) wrap.innerHTML = renderPermissionEditor(defaults, getValue("adminPermissionSearch"), nextRole === "Platform Owner");
  });
  document.getElementById("adminPermissionSearch")?.addEventListener("input", (event) => {
    if (isPlatformOwner) return;
    const current = [...document.querySelectorAll('#permissionEditorWrap input[type="checkbox"]:checked')].map((input) => input.value);
    const nextRole = getValue("admin_profile_role");
    const wrap = document.getElementById("permissionEditorWrap");
    if (wrap) wrap.innerHTML = renderPermissionEditor(current, event.target.value, false);
  });
  document.querySelector('[data-action="select-all-permissions"]')?.addEventListener("click", () => {
    document.querySelectorAll('#permissionEditorWrap input[type="checkbox"]').forEach((checkbox) => { checkbox.checked = true; });
  });
  document.querySelector('[data-action="clear-all-permissions"]')?.addEventListener("click", () => {
    document.querySelectorAll('#permissionEditorWrap input[type="checkbox"]').forEach((checkbox) => { checkbox.checked = false; });
  });

  document.getElementById("adminProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const selectedPermissions = isPlatformOwner ? ["*"] : [...document.querySelectorAll('#permissionEditorWrap input[type="checkbox"]:checked')].map((input) => input.value);
    try {
      const data = await api("admins", {
        method: "POST",
        body: JSON.stringify({
          action: "update",
          original_email: admin.email,
          email: getValue("admin_profile_email"),
          name: getValue("admin_profile_name"),
          role: isDefault ? (admin.role || "Admin") : getValue("admin_profile_role"),
          status: isDefault ? (admin.status || "Active") : getValue("admin_profile_status"),
          permissions: selectedPermissions
        })
      });
      state.data.admins = { ...(state.data.admins || {}), admins: data.admins || [] };
      const updated = (data.admins || []).find((item) => String(item.email).toLowerCase() === String(getValue("admin_profile_email")).toLowerCase()) || (data.admins || []).find((item) => String(item.email).toLowerCase() === String(admin.email).toLowerCase());
      const identity = state.data[state.currentSection]?.admin;
      if (updated && identity && String(identity.email).toLowerCase() === String(updated.email).toLowerCase()) {
        setAdmin({ ...identity, name: updated.name });
      }
      if (state.currentSection === "admins") renderAdmins(data.admins || []);
      closeModal();
    } catch (error) {
      setSaved("adminProfileSaved", error.message, true);
    }
  });
  document.querySelector('[data-action="profile-status-toggle"]')?.addEventListener("click", async () => {
    await api("admins", {
      method: "POST",
      body: JSON.stringify({
        action: isSuspended ? "reactivate" : "suspend",
        email: admin.email
      })
    });
    await loadSection("admins");
    closeModal();
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
  const customerRow = (c) => {
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
  };

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div>
          <h2>Customer relationship management</h2>
          <p>Search customer profiles and open a record to review account details, Lifetime access and internal notes.</p>
        </div>
      </div>
      <div class="admin-alert">Customer data displayed here is confidential and subject to UK GDPR. Access is logged by the platform perimeter; use it only for legitimate business purposes.</div>
      <div class="table-tools" style="margin-top:1rem;">
        <div class="table-filters">
          <label class="table-search"><span class="sr-only">Search customers</span><input id="customerSearch" type="search" placeholder="Search name, email or phone" autocomplete="off"></label>
          <label><span class="sr-only">Filter by membership</span><select id="customerStatusFilter"><option value="all">All customers</option><option value="lifetime">Lifetime members</option><option value="standard">Standard customers</option></select></label>
        </div>
        <span class="table-count" id="customerResultCount"></span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Contact email</th><th>Status</th><th>Phone</th><th>Preference</th><th>Updated</th></tr></thead>
          <tbody id="customerTableBody"></tbody>
        </table>
      </div>
      <div class="table-pagination" aria-label="Customer table pagination">
        <button class="mini-button" id="customerPreviousPage" type="button">Previous</button>
        <span id="customerPageStatus">Page 1 of 1</span>
        <button class="mini-button" id="customerNextPage" type="button">Next</button>
      </div>
    </div>
  `;

  const pageSize = 12;
  let currentPage = 1;
  const search = document.getElementById("customerSearch");
  const status = document.getElementById("customerStatusFilter");
  const previous = document.getElementById("customerPreviousPage");
  const next = document.getElementById("customerNextPage");

  const refresh = () => {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = status.value;
    const filtered = customers.filter((customer) => {
      const searchable = [customer.display_name, customer.verified_name, customer.email, customer.contact_email, customer.phone]
        .filter(Boolean).join(" ").toLowerCase();
      const lifetime = Number(customer.admin_lifetime || 0) === 1;
      const matchesStatus = selectedStatus === "all" || (selectedStatus === "lifetime" && lifetime) || (selectedStatus === "standard" && !lifetime);
      return matchesStatus && (!query || searchable.includes(query));
    });
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, pages);
    const start = (currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);
    document.getElementById("customerTableBody").innerHTML = visible.map(customerRow).join("") || `<tr><td colspan="6">No customers match these filters.</td></tr>`;
    document.getElementById("customerResultCount").textContent = `${filtered.length} ${filtered.length === 1 ? "customer" : "customers"}`;
    document.getElementById("customerPageStatus").textContent = `Page ${currentPage} of ${pages}`;
    previous.disabled = currentPage <= 1;
    next.disabled = currentPage >= pages;
  };

  search.addEventListener("input", () => { currentPage = 1; refresh(); });
  status.addEventListener("change", () => { currentPage = 1; refresh(); });
  previous.addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); refresh(); });
  next.addEventListener("click", () => { currentPage += 1; refresh(); });
  refresh();
}

function renderPlans(plans = []) {
  state.data.plans = { plans: Array.isArray(plans) ? plans : [] };
  const draft = state.planDraft || buildPlanDraft(state.data.plans.plans || []);
  const cards = draft.map((plan) => `
    <article class="plan-card" data-plan-card data-plan-id="${escapeAttr(plan.id)}">
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
        <p>Toggle changes are staged locally. Save Changes writes every plan state in one update.</p>
      </div>
      <div class="section-actions">
        <button class="admin-button secondary" type="button" data-action="cancel-plan-changes" ${state.planDirty ? "" : "disabled"}>Cancel Changes</button>
        <button class="admin-button" type="button" data-action="save-plan-changes" ${state.planDirty ? "" : "disabled"}>${state.planSaving ? "Saving…" : "Save Changes"}</button>
        <button class="admin-button" type="button" data-action="open-plan">New plan</button>
      </div>
    </div>
    <div class="admin-alert ${state.planDirty ? "" : "hidden"}" data-plan-unsaved>${state.planDirty ? "You have unsaved changes." : ""}</div>
    <div class="admin-note" data-plan-save-proof hidden></div>
    <div class="plan-grid">${cards || emptyCard("No plans yet.")}</div>
  `;
  syncPlanControls();
}

async function togglePlan(id, isActive) {
  const draft = ensurePlanDraft();
  const plan = draft.find((item) => item.id === id);
  if (!plan) return;
  plan.is_active = isActive ? 1 : 0;
  state.planDraft = draft;
  state.planDirty = true;
  updatePlanCardFromState(id);
  syncPlanControls();
  setSaved("plansSaved", "You have unsaved changes.");
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

function setPlanSaving(card, checkbox, saving) {
  if (checkbox) checkbox.disabled = saving;
  if (card) card.classList.toggle("is-saving", saving);
}

function updatePlanCardFromState(id) {
  const plan = (state.planDraft || state.data.plans?.plans || []).find((item) => item.id === id);
  const card = document.querySelector(`[data-plan-card][data-plan-id="${CSS.escape(id)}"]`);
  if (!plan || !card) return;

  const checkbox = card.querySelector("[data-plan-toggle]");
  const title = card.querySelector("strong");
  const type = card.querySelector(".plan-top span");
  const price = card.querySelector(".plan-meta div:nth-child(1) strong");
  const delivery = card.querySelector(".plan-meta div:nth-child(2) strong");
  const revisions = card.querySelector(".plan-meta div:nth-child(3) strong");
  const product = card.querySelector(".plan-meta div:nth-child(4) strong");
  const stripePrice = card.querySelector(".plan-meta div:nth-child(5) strong");
  const statusBadge = card.querySelector(".section-actions .badge");

  if (checkbox) checkbox.checked = Number(plan.is_active) === 1;
  if (title) title.textContent = plan.plan_name || title.textContent;
  if (type) type.textContent = plan.plan_type || "Service plan";
  if (price) price.textContent = plan.price_label || "Not set";
  if (delivery) delivery.textContent = plan.delivery_time || "Not set";
  if (revisions) revisions.textContent = plan.revisions || "Not set";
  if (product) product.textContent = plan.stripe_product_id || "Not stored";
  if (stripePrice) stripePrice.textContent = plan.stripe_price_id || "Not stored";
  if (statusBadge) statusBadge.textContent = Number(plan.is_active) === 1 ? "Active" : "Inactive";
  card.classList.toggle("is-saving", false);
}

function buildPlanDraft(plans) {
  return plans.map((plan) => ({ ...plan, is_active: Number(plan.is_active || 0) }));
}

function ensurePlanDraft() {
  if (!Array.isArray(state.planDraft)) {
    state.planDraft = buildPlanDraft(state.data.plans?.plans || []);
  }
  return state.planDraft.map((plan) => ({ ...plan }));
}

function syncPlanControls() {
  const saveButton = document.querySelector('[data-action="save-plan-changes"]');
  const cancelButton = document.querySelector('[data-action="cancel-plan-changes"]');
  const notice = document.querySelector("[data-plan-unsaved]");
  if (saveButton) {
    saveButton.disabled = !state.planDirty || state.planSaving;
    saveButton.textContent = state.planSaving ? "Saving…" : "Save Changes";
  }
  if (cancelButton) cancelButton.disabled = !state.planDirty || state.planSaving;
  if (notice) notice.hidden = !state.planDirty;
}

async function savePlanChanges() {
  if (!state.planDirty || state.planSaving) return;
  state.planSaving = true;
  syncPlanControls();
  try {
    const plans = (state.planDraft || []).map((plan) => ({ id: plan.id, is_active: Number(plan.is_active || 0) }));
    const data = await api("plans", {
      method: "POST",
      body: JSON.stringify({ action: "save_visibility", plans })
    });
    if (!data || data.success !== true || !Array.isArray(data.plans)) {
      throw new Error("The server did not confirm the saved plan state.");
    }
    state.planDraft = null;
    state.planDirty = false;
    state.data.plans = data;
    renderPlans(data.plans);
    showPlanSaveProof(data.database_after_save || []);
    setSaved("plansSaved", "Changes saved successfully.");
  } catch (error) {
    setSaved("plansSaved", error.message || "Unable to save plan changes.", true);
  } finally {
    state.planSaving = false;
    syncPlanControls();
  }
}

function showPlanSaveProof(rows) {
  const proof = document.querySelector("[data-plan-save-proof]");
  if (!proof) return;
  if (!Array.isArray(rows) || !rows.length) {
    proof.hidden = true;
    proof.textContent = "";
    return;
  }
  proof.hidden = false;
  proof.innerHTML = rows.map((row) => `<div>${escapeHtml(row.id)}: ${escapeHtml(String(row.is_active))}</div>`).join("");
}

async function cancelPlanChanges() {
  if (state.planSaving) return;
  state.planDraft = null;
  state.planDirty = false;
  const data = await api("plans");
  state.data.plans = data;
  renderPlans(data.plans);
  setSaved("plansSaved", "Unsaved changes discarded.");
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
        <div><h2>Company Branding</h2><p>Edit business and service information used by the public website, customer portal, admin portal and notification templates where supported.</p></div>
      </div>
      <form class="admin-form" id="brandingForm">
        ${input("Business name", "business_name")}
        ${input("Trading name", "trading_name")}
        ${input("Service name", "service_name")}
        ${input("Support email", "support_email", "email")}
        ${input("Contact email", "contact_email", "email")}
        ${input("Phone", "phone")}
        ${input("Website", "website")}
        ${textarea("Public brand text", "public_brand_text")}
        ${input("Logo URL", "logo_url", "url")}
        ${input("Favicon URL", "favicon_url", "url")}
        ${textarea("Registered notice", "registered_notice")}
        ${textarea("Footer notice", "footer_notice")}
        <button class="admin-button" type="submit">Save branding</button>
      </form>
      <div id="brandingSaved" class="admin-success" hidden></div>
    </div>
  `;

  ["business_name", "trading_name", "service_name", "support_email", "contact_email", "phone", "website", "public_brand_text", "logo_url", "favicon_url", "registered_notice", "footer_notice"].forEach((key) => {
    setValue(key, branding[key] || "");
  });

  document.getElementById("brandingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = {};
    ["business_name", "trading_name", "service_name", "support_email", "contact_email", "phone", "website", "public_brand_text", "logo_url", "favicon_url", "registered_notice", "footer_notice"].forEach((key) => {
      body[key] = getValue(key);
    });
    const data = await api("branding", { method: "POST", body: JSON.stringify(body) });
    state.data.branding = data;
    state.branding = data.branding || body;
    await applyAdminBranding();
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
  const rows = items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.subject || "Support request")}</strong><span>${escapeHtml(item.customer_email || "No customer email")}</span></td>
      <td>${badge(item.status || "Open", statusColour(item.status || "Open"))}</td>
      <td>${escapeHtml(item.priority || "Normal")}</td>
      <td>${escapeHtml(formatDate(item.created_at || item.updated_at))}</td>
      <td><button class="mini-button" type="button" data-action="open-support" data-id="${escapeAttr(item.id)}">Open / reply</button></td>
    </tr>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Support requests</h2><p>Review customer requests, manage their workflow status and prepare staff replies.</p></div>
      </div>
      ${table(["Request", "Status", "Priority", "Submitted", "Actions"], rows)}
    </div>
    <div class="admin-card">
      <div class="section-head"><div><h2>Create internal support record</h2><p>Add a support item received through another approved channel.</p></div></div>
      <form class="admin-form" id="supportForm">
        ${input("Customer email", "support_customer_email", "email")}
        ${input("Subject", "support_subject", "text")}
        <label class="admin-label">Status<select id="support_status"><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></label>
        <label class="admin-label">Priority<select id="support_priority"><option>Low</option><option selected>Normal</option><option>High</option><option>Urgent</option></select></label>
        ${textarea("Request details / notes", "support_notes")}
        <button class="admin-button" type="submit">Save support record</button>
      </form>
    </div>
  `;

  document.getElementById("supportForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await api("support", {
      method: "POST",
      body: JSON.stringify({
        customer_email: getValue("support_customer_email"),
        subject: getValue("support_subject"),
        status: getValue("support_status"),
        priority: getValue("support_priority"),
        notes: getValue("support_notes")
      })
    });
    loadSection("support");
  });
}

function openSupportModal(id) {
  const item = (state.data.support?.support || []).find((record) => record.id === id);
  if (!item) return;

  openModal(`
    <div class="modal-head">
      <div><h2>${escapeHtml(item.subject || "Support request")}</h2><p>Staff support workspace</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <div class="support-request-summary">
      <div class="drawer-grid">
        <div class="drawer-field"><span>Customer</span><strong>${escapeHtml(item.customer_email || "Not supplied")}</strong></div>
        <div class="drawer-field"><span>Submitted</span><strong>${escapeHtml(formatDate(item.created_at || item.updated_at))}</strong></div>
        <div class="drawer-field"><span>Current status</span><strong>${escapeHtml(item.status || "Open")}</strong></div>
        <div class="drawer-field"><span>Priority</span><strong>${escapeHtml(item.priority || "Normal")}</strong></div>
      </div>
      <section class="support-message-panel">
        <span>Request details</span>
        <p>${escapeHtml(item.notes || "No request message is stored on this record.")}</p>
      </section>
    </div>
    <form class="admin-form single support-workspace-form" id="supportWorkspaceForm">
      <div class="admin-form two-column-form">
        <label class="admin-label">Status<select id="support_workspace_status">${["Open", "In Progress", "Resolved", "Closed"].map((status) => `<option value="${status}" ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
        <label class="admin-label">Priority<select id="support_workspace_priority">${priorities.map((priority) => `<option value="${priority}" ${priority === item.priority ? "selected" : ""}>${priority}</option>`).join("")}</select></label>
      </div>
      <label class="admin-label">Reply draft (not saved)<textarea id="support_reply_draft" placeholder="Draft a reply to copy into your approved email channel"></textarea></label>
      <div class="admin-alert">Reply sending is not connected yet. This draft is not saved or sent. A separate internal-note field is also not available in the current support API.</div>
      <div class="section-actions">
        <button class="admin-button" type="submit">Save status</button>
        <button class="admin-button secondary" type="button" disabled>Send reply</button>
      </div>
      <div id="supportWorkspaceSaved" class="admin-success" hidden></div>
    </form>
  `);

  document.getElementById("supportWorkspaceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const data = await api("support", {
        method: "POST",
        body: JSON.stringify({
          id: item.id,
          customer_email: item.customer_email || "",
          subject: item.subject || "",
          status: getValue("support_workspace_status"),
          priority: getValue("support_workspace_priority"),
          notes: item.notes || ""
        })
      });
      state.data.support = { ...(state.data.support || {}), support: data.support || [] };
      closeModal();
      if (state.currentSection === "support") renderSupport(data.support || []);
    } catch (error) {
      setSaved("supportWorkspaceSaved", error.message, true);
    }
  });
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

function renderDataRequests(items = []) {
  renderAdminRecordSection({
    section: "datarequests",
    title: "Data Protection Requests",
    description: "Review and manage formal UK GDPR and Data Protection Act 2018 customer requests.",
    items,
    statuses: dprStatuses,
    columns: ["Reference", "Customer", "Type", "Status", "Due", "Updated"],
    row: (item) => `
      <tr>
        <td><strong>${escapeHtml(item.reference)}</strong><span>${escapeHtml(formatDate(item.submitted_at || item.created_at))}</span></td>
        <td><strong>${escapeHtml(item.customer_name || "Customer")}</strong><span>${escapeHtml(item.customer_email || item.user_id || "")}</span></td>
        <td>${escapeHtml(item.request_type || "")}</td>
        <td>${badge(item.status || "New", statusColour(item.status))}</td>
        <td>${escapeHtml(formatDate(item.due_at))}</td>
        <td><button class="mini-button" type="button" data-action="open-admin-record" data-section="datarequests" data-id="${escapeAttr(item.id)}">Open</button></td>
      </tr>
    `
  });
}

function renderSystemReports(items = []) {
  renderAdminRecordSection({
    section: "systemreports",
    title: "System Reports",
    description: "Review customer technical, website, account and checkout issue reports.",
    items,
    statuses: systemReportStatuses,
    columns: ["Reference", "Customer", "Issue", "Status", "Priority", "Updated"],
    row: (item) => `
      <tr>
        <td><strong>${escapeHtml(item.reference)}</strong><span>${escapeHtml(formatDate(item.submitted_at || item.created_at))}</span></td>
        <td><strong>${escapeHtml(item.customer_name || "Customer")}</strong><span>${escapeHtml(item.customer_email || item.user_id || "")}</span></td>
        <td>${escapeHtml(item.issue_type || "")}</td>
        <td>${badge(item.status || "New", statusColour(item.status))}</td>
        <td>${badge(item.priority || "Normal", priorityColour(item.priority))}</td>
        <td><button class="mini-button" type="button" data-action="open-admin-record" data-section="systemreports" data-id="${escapeAttr(item.id)}">Open</button></td>
      </tr>
    `
  });
}

function renderClosures(items = []) {
  renderAdminRecordSection({
    section: "closures",
    title: "Closure Requests",
    description: "Create, review, approve, reject and complete customer account closure requests.",
    items,
    statuses: closureStatuses,
    columns: ["Reference", "Customer", "Status", "Assigned", "Updated", "Actions"],
    row: (item) => `
      <tr>
        <td><strong>${escapeHtml(item.reference)}</strong><span>${escapeHtml(formatDate(item.created_at))}</span></td>
        <td><strong>${escapeHtml(item.customer_name || "Customer")}</strong><span>${escapeHtml(item.customer_email || "")}</span></td>
        <td>${badge(item.status || "Open", statusColour(item.status))}</td>
        <td>${escapeHtml(item.assigned_admin_id || "Unassigned")}</td>
        <td>${escapeHtml(formatDate(item.updated_at || item.created_at))}</td>
        <td><button class="mini-button" type="button" data-action="open-closure" data-id="${escapeAttr(item.id)}">Open</button></td>
      </tr>
    `,
    extraActions: `<button class="admin-button" type="button" data-action="open-closure">New closure request</button>`
  });
}

function renderAffiliate(items = []) {
  const rows = items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.block_type || "Content")} · Order ${escapeHtml(item.sort_order || 100)}</span></td>
      <td>${Number(item.is_enabled) === 1 ? badge("Enabled", "green") : badge("Disabled", "red")}</td>
      <td>${Number(item.is_published) === 1 ? badge("Published", "green") : badge("Draft", "")}</td>
      <td>${escapeHtml(formatDate(item.updated_at || item.created_at))}</td>
      <td>
        <button class="mini-button" type="button" data-action="open-affiliate-block" data-id="${escapeAttr(item.id)}">Edit</button>
        <button class="mini-button" type="button" data-action="open-affiliate-block" data-id="${escapeAttr(item.id)}">Preview</button>
        <button class="mini-button" type="button" data-action="delete-affiliate-block" data-id="${escapeAttr(item.id)}">Delete</button>
      </td>
    </tr>
  `).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Affiliate Content</h2><p>Manage affiliate page headings, widgets, CTA buttons, disclaimers, referral notices, featured content and FAQs without hardcoding.</p></div>
        <div class="section-actions">
          <button class="admin-button secondary" type="button" data-action="import-affiliate-content">Import Existing Affiliate Content</button>
          <button class="admin-button secondary" type="button" data-action="export-records" data-section="affiliate" data-format="csv">Export CSV</button>
          <button class="admin-button" type="button" data-action="open-affiliate-block">New block</button>
        </div>
      </div>
      <div class="admin-alert">Widget code is validated before saving. Script tags, javascript URLs and inline event handlers are blocked to reduce injection risk.</div>
      ${table(["Block", "Enabled", "Published", "Updated", "Actions"], rows)}
    </div>
  `;
}

function renderAppearance(settings = {}) {
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Appearance</h2><p>Control the website-wide colour mode for customer-facing pages, the customer account area and the admin portal where supported.</p></div>
        ${badge((settings.site_theme_mode || "dark").replace(/^./, (c) => c.toUpperCase()))}
      </div>
      <form class="admin-form" id="appearanceForm">
        <label class="admin-label">Colour mode
          <select id="site_theme_mode">
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="system">System Default</option>
          </select>
        </label>
        <button class="admin-button" type="submit">Save appearance</button>
      </form>
      <div id="appearanceSaved" class="admin-success" hidden></div>
    </div>
  `;
  setValue("site_theme_mode", settings.site_theme_mode || "dark");
  document.getElementById("appearanceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = await api("appearance", { method: "POST", body: JSON.stringify({ site_theme_mode: getValue("site_theme_mode") }) });
    state.data.appearance = data;
    document.documentElement.dataset.siteTheme = data.appearance?.site_theme_mode || getValue("site_theme_mode");
    renderAppearance(data.appearance);
    setSaved("appearanceSaved", "Appearance settings saved.");
  });
}

function renderEmail(email = {}, test = null) {
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Email (SMTP)</h2><p>Configure outbound email delivery for notifications and confirmations.</p></div>
        ${email.configured ? badge("Configured", "green") : badge("Incomplete", "amber")}
      </div>
      <form class="admin-form" id="emailForm">
        <label class="admin-label">Cloudflare Email Provider
          <select id="email_provider"><option value="resend">Resend</option><option value="sendgrid">SendGrid</option><option value="postmark">Postmark</option><option value="brevo">Brevo</option><option value="mailchannels">MailChannels</option></select>
        </label>
        ${input("Provider API Key", "email_api_key", "password")}
        ${input("Provider API Endpoint", "email_api_endpoint")}
        ${input("Admin Notification Email", "admin_notification_email", "email")}
        ${input("SMTP Host", "smtp_host")}
        ${input("SMTP Port", "smtp_port", "number")}
        ${input("SMTP Username", "smtp_username", "email")}
        ${input("SMTP Password", "smtp_password", "password")}
        ${input("From Name", "smtp_from_name")}
        ${input("From Email", "smtp_from_email", "email")}
        <label class="admin-label">Encryption/Security
          <select id="smtp_security"><option>STARTTLS</option><option>TLS</option><option>None</option></select>
        </label>
        <div class="admin-alert">Cloudflare Pages Functions send mail through an HTTPS email provider. SMTP fields are still stored for service configuration, but raw SMTP sockets are not used by the edge runtime. Leave password/API key fields blank to keep existing values.</div>
        <button class="admin-button" type="submit">Save email settings</button>
      </form>
      <div id="emailSaved" class="admin-success" hidden></div>
    </div>
    <div class="admin-card">
      <div class="section-head"><div><h2>Test Notifications</h2><p>Fire a real test email to ADMIN_NOTIFICATION_EMAIL to verify the notification pipeline end-to-end.</p></div></div>
      <form class="admin-form" id="testNotificationForm">
        <label class="admin-label">Notification Type
          <select id="notification_type"><option>New Signup</option><option>New Message</option><option>Support Request</option><option>Plan Change</option></select>
        </label>
        <div class="drawer-field"><span>ADMIN_NOTIFICATION_EMAIL</span><strong>${escapeHtml(email.admin_notification_email || "Not configured")}</strong></div>
        <button class="admin-button" type="submit">Send Test Email</button>
      </form>
      ${test ? `<div class="${test.sent ? "admin-success" : "admin-alert"}" style="margin-top:1rem;">${escapeHtml(test.message || "")}</div>` : ""}
    </div>
  `;

  setValue("smtp_host", email.smtp_host || "smtp.jagroupservices.co.uk");
  setValue("email_provider", email.email_provider || "resend");
  setValue("email_api_key", email.email_api_key_masked || "");
  setValue("email_api_endpoint", email.email_api_endpoint || "");
  setValue("admin_notification_email", email.admin_notification_email || "");
  setValue("smtp_port", email.smtp_port || "587");
  setValue("smtp_username", email.smtp_username || "noreply@jagroupservices.co.uk");
  setValue("smtp_password", email.smtp_password_masked || "");
  setValue("smtp_from_name", email.smtp_from_name || "JA Smart Profile");
  setValue("smtp_from_email", email.smtp_from_email || "noreply@jagroupservices.co.uk");
  setValue("smtp_security", email.smtp_security || "STARTTLS");

  document.getElementById("emailForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = getValue("smtp_password");
    const apiKey = getValue("email_api_key");
    const data = await api("email", { method: "POST", body: JSON.stringify({
      email_provider: getValue("email_provider"),
      email_api_key: apiKey.includes("••") ? "" : apiKey,
      email_api_endpoint: getValue("email_api_endpoint"),
      admin_notification_email: getValue("admin_notification_email"),
      smtp_host: getValue("smtp_host"),
      smtp_port: getValue("smtp_port"),
      smtp_username: getValue("smtp_username"),
      smtp_password: password.includes("••") ? "" : password,
      smtp_from_name: getValue("smtp_from_name"),
      smtp_from_email: getValue("smtp_from_email"),
      smtp_security: getValue("smtp_security")
    }) });
    state.data.email = data;
    renderEmail(data.email);
    setSaved("emailSaved", "Email settings saved.");
  });

  document.getElementById("testNotificationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = await api("email", { method: "POST", body: JSON.stringify({ action: "test", notification_type: getValue("notification_type") }) });
    state.data.email = data;
    renderEmail(data.email, data.test);
  });
}

function renderAudit(items = []) {
  const baseItems = Array.isArray(items) ? items : [];
  const rows = items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.summary || "")}</span></td>
      <td>${escapeHtml(item.actor_email || "system")}</td>
      <td>${escapeHtml(item.entity_type || "")}</td>
      <td>${escapeHtml(item.entity_id || "")}</td>
      <td>${escapeHtml(formatDate(item.created_at))}</td>
    </tr>
  `).join("");
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Audit Log</h2><p>Review sensitive admin activity including Lifetime access, plan, privacy, closure, SMTP and affiliate changes.</p></div>
        <div class="section-actions">
          <button class="admin-button secondary" type="button" data-action="export-records" data-section="audit" data-format="csv">Export CSV</button>
        </div>
      </div>
      <div class="admin-form" style="margin-bottom:1rem;">
        <label class="admin-label">Administrator<input id="audit_filter_administrator" type="search" placeholder="Filter by email"></label>
        <label class="admin-label">Role<input id="audit_filter_role" type="search" placeholder="Filter by role"></label>
        <label class="admin-label">Action<input id="audit_filter_action" type="search" placeholder="Filter by action"></label>
        <label class="admin-label">Module<input id="audit_filter_module" type="search" placeholder="Filter by module"></label>
        <label class="admin-label">From<input id="audit_filter_from" type="date"></label>
        <label class="admin-label">To<input id="audit_filter_to" type="date"></label>
        <label class="admin-label">Outcome<input id="audit_filter_outcome" type="search" placeholder="success / failure"></label>
      </div>
      <div id="auditResults">${table(["Action", "Actor", "Entity", "Record", "Date"], rows)}</div>
    </div>
  `;

  const refresh = async () => {
    const filters = {
      administrator: getValue("audit_filter_administrator").toLowerCase(),
      role: getValue("audit_filter_role").toLowerCase(),
      action: getValue("audit_filter_action").toLowerCase(),
      module: getValue("audit_filter_module").toLowerCase(),
      date_from: getValue("audit_filter_from"),
      date_to: getValue("audit_filter_to"),
      outcome: getValue("audit_filter_outcome").toLowerCase()
    };
    const filtered = baseItems.filter((item) => {
      const created = item.created_at ? String(item.created_at).slice(0, 10) : "";
      const outcome = String(item?.metadata ? (typeof item.metadata === "string" ? item.metadata : JSON.stringify(item.metadata)) : "success").toLowerCase();
      return (!filters.administrator || String(item.actor_email || "").toLowerCase().includes(filters.administrator))
        && (!filters.role || String(item.role || "").toLowerCase().includes(filters.role))
        && (!filters.action || String(item.action || "").toLowerCase().includes(filters.action))
        && (!filters.module || String(item.entity_type || "").toLowerCase().includes(filters.module))
        && (!filters.date_from || created >= filters.date_from)
        && (!filters.date_to || created <= filters.date_to)
        && (!filters.outcome || outcome.includes(filters.outcome));
    });
    document.getElementById("auditResults").innerHTML = table(["Action", "Actor", "Entity", "Record", "Date"], filtered.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.summary || "")}</span></td>
        <td>${escapeHtml(item.actor_email || "system")}</td>
        <td>${escapeHtml(item.entity_type || "")}</td>
        <td>${escapeHtml(item.entity_id || "")}</td>
        <td>${escapeHtml(formatDate(item.created_at))}</td>
      </tr>
    `).join(""));
  };
  ["administrator", "role", "action", "module", "from", "to", "outcome"].forEach((name) => {
    document.getElementById(`audit_filter_${name}`)?.addEventListener("input", refresh);
    document.getElementById(`audit_filter_${name}`)?.addEventListener("change", refresh);
  });
}

function renderSessions(sessions = []) {
  const rows = sessions.map((session) => `
    <tr>
      <td><strong>${escapeHtml(session.admin_email || "")}</strong><span>${escapeHtml(session.token_hash || "")}</span></td>
      <td>${escapeHtml(formatDate(session.created_at))}</td>
      <td>${escapeHtml(formatDate(session.last_used_at || session.created_at))}</td>
      <td>${escapeHtml(formatDate(session.expires_at))}</td>
      <td>${badge(session.revoked_at ? "Revoked" : "Active", session.revoked_at ? "amber" : "green")}</td>
      <td>
        ${session.revoked_at ? "" : `<button class="mini-button danger" type="button" data-action="revoke-session" data-token="${escapeAttr(session.token_hash)}">Revoke</button>`}
      </td>
    </tr>
  `).join("");
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>Administrator Sessions</h2><p>View active bypass sessions and revoke them remotely.</p></div>
      </div>
      ${table(["Administrator", "Created", "Last used", "Expires", "Status", "Actions"], rows)}
    </div>
  `;
}

function renderAdminRecordSection(config) {
  const rows = config.items.map(config.row).join("");
  const statusOptions = ["", ...config.statuses].map((status) => `<option value="${escapeAttr(status)}">${escapeHtml(status || "All statuses")}</option>`).join("");

  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card">
      <div class="section-head">
        <div><h2>${escapeHtml(config.title)}</h2><p>${escapeHtml(config.description)}</p></div>
        <div class="section-actions">
          ${config.extraActions || ""}
          <button class="admin-button secondary" type="button" data-action="export-records" data-section="${escapeAttr(config.section)}" data-format="csv">Export CSV</button>
        </div>
      </div>
      <div class="admin-form" style="margin-bottom:1rem;">
        <label class="admin-label">Search<input id="${config.section}_search" type="search" placeholder="Search reference, customer or type"></label>
        <label class="admin-label">Status<select id="${config.section}_status">${statusOptions}</select></label>
      </div>
      <div id="${config.section}_table">${table(config.columns, rows)}</div>
    </div>
  `;

  const refresh = () => {
    const search = getValue(`${config.section}_search`).toLowerCase();
    const status = getValue(`${config.section}_status`);
    const filtered = config.items.filter((item) => {
      const text = JSON.stringify(item).toLowerCase();
      return (!search || text.includes(search)) && (!status || item.status === status);
    });
    document.getElementById(`${config.section}_table`).innerHTML = table(config.columns, filtered.map(config.row).join(""));
  };

  document.getElementById(`${config.section}_search`).addEventListener("input", refresh);
  document.getElementById(`${config.section}_status`).addEventListener("change", refresh);
}

function openAdminRecordModal(section, id) {
  const collection = state.data[section]?.[section] || [];
  const item = collection.find((record) => record.id === id);
  if (!item) return;

  const isDpr = section === "datarequests";
  const statuses = isDpr ? dprStatuses : systemReportStatuses;
  const title = isDpr ? item.request_type : item.issue_type;
  const message = isDpr ? item.customer_message : item.description;
  const audit = parseAudit(item.audit_log);

  openModal(`
    <div class="modal-head">
      <div><h2>${escapeHtml(item.reference)}</h2><p>${escapeHtml(title || "")}</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <div class="drawer-grid">
      <div class="drawer-field"><span>Customer</span><strong>${escapeHtml(item.customer_name || "Customer")}</strong></div>
      <div class="drawer-field"><span>Email</span><strong>${escapeHtml(item.customer_email || item.user_id || "")}</strong></div>
      <div class="drawer-field"><span>User ID</span><strong>${escapeHtml(item.user_id || "")}</strong></div>
      <div class="drawer-field"><span>Submitted</span><strong>${escapeHtml(formatDate(item.submitted_at || item.created_at))}</strong></div>
      ${isDpr ? `<div class="drawer-field"><span>Due date</span><strong>${escapeHtml(formatDate(item.due_at))}</strong></div>` : `<div class="drawer-field"><span>Affected URL/page</span><strong>${escapeHtml(item.affected_url || "Not supplied")}</strong></div>`}
      ${isDpr ? "" : `<div class="drawer-field"><span>Device/browser</span><strong>${escapeHtml(item.device_browser || "Not supplied")}</strong></div>`}
      <div class="drawer-field"><span>Attachments</span><strong>Not supported yet</strong></div>
    </div>
    <div class="admin-card" style="margin-top:1rem;"><h2>Customer message</h2><p style="white-space:pre-wrap;">${escapeHtml(message || "")}</p></div>
    ${isDpr ? `<div class="section-actions" style="margin:1rem 0;">
      <button class="admin-button secondary" type="button" data-action="export-customer-data" data-email="${escapeAttr(item.customer_email || item.user_id || "")}" data-format="json">Export Customer Data</button>
      <button class="admin-button secondary" type="button" data-action="export-customer-data" data-email="${escapeAttr(item.customer_email || item.user_id || "")}" data-format="csv">Export Customer CSV</button>
    </div>` : ""}
    <form class="admin-form single" id="adminRecordForm">
      <label class="admin-label">Status<select id="record_status">${statuses.map((status) => `<option value="${escapeAttr(status)}" ${status === item.status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></label>
      ${isDpr ? "" : `<label class="admin-label">Priority<select id="record_priority">${priorities.map((priority) => `<option value="${escapeAttr(priority)}" ${priority === item.priority ? "selected" : ""}>${escapeHtml(priority)}</option>`).join("")}</select></label>`}
      <label class="admin-label">Assigned admin<input id="record_assigned" type="email" value="${escapeAttr(item.assigned_admin_id || "")}"></label>
      ${textarea("Internal admin notes", "record_notes")}
      <button class="admin-button" type="submit">Save record</button>
      ${isDpr ? `<button class="admin-button secondary" type="button" id="sendToDataSubjectButton">Send to Data Subject</button>` : ""}
      <div id="recordSaved" class="admin-success" hidden></div>
    </form>
    <div class="admin-card" style="margin-top:1rem;">
      <h2>Audit history</h2>
      ${audit.length ? `<div class="audit-list">${audit.map((event) => `<div class="drawer-field"><span>${escapeHtml(formatDate(event.timestamp))} - ${escapeHtml(event.actor || "system")}</span><strong>${escapeHtml(event.type || "Event")}${event.previousValue || event.newValue ? `: ${escapeHtml(event.previousValue || "")} -> ${escapeHtml(event.newValue || "")}` : ""}</strong></div>`).join("")}</div>` : `<p>No audit events yet.</p>`}
    </div>
  `);

  setValue("record_notes", item.internal_notes || "");
  document.getElementById("adminRecordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = {
      id: item.id,
      reference: item.reference,
      status: getValue("record_status"),
      assigned_admin_id: getValue("record_assigned"),
      internal_notes: getValue("record_notes")
    };
    if (!isDpr) body.priority = getValue("record_priority");
    const data = await api(section, { method: "POST", body: JSON.stringify(body) });
    state.data[section] = data;
    setSaved("recordSaved", "Record saved.");
    renderSection(section, data);
    closeModal();
  });

  document.getElementById("sendToDataSubjectButton")?.addEventListener("click", async () => {
    try {
      const body = {
        id: item.id,
        reference: item.reference,
        action: "mark_sent",
        status: "Sent",
        assigned_admin_id: getValue("record_assigned"),
        internal_notes: getValue("record_notes")
      };
      const data = await api(section, { method: "POST", body: JSON.stringify(body) });
      state.data[section] = data;
      closeModal();
      renderSection(section, data);
    } catch (error) {
      setSaved("recordSaved", error.message, true);
    }
  });
}

function openClosureModal(id = "") {
  const item = (state.data.closures?.closures || []).find((record) => record.id === id) || {};
  openModal(`
    <div class="modal-head">
      <div><h2>${id ? "Closure Request" : "New Closure Request"}</h2><p>Create, approve, reject or complete a customer account closure workflow.</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <form class="admin-form single" id="closureForm">
      ${input("Customer email", "closure_customer_email", "email")}
      ${input("Customer name", "closure_customer_name")}
      <label class="admin-label">Status<select id="closure_status">${closureStatuses.map((status) => `<option value="${escapeAttr(status)}">${escapeHtml(status)}</option>`).join("")}</select></label>
      ${input("Assigned admin", "closure_assigned_admin", "email")}
      ${textarea("Reason", "closure_reason")}
      ${textarea("Internal notes", "closure_internal_notes")}
      <button class="admin-button" type="submit">Save closure request</button>
    </form>
    ${item.audit_log ? `<div class="admin-card" style="margin-top:1rem;"><h2>Request history</h2>${parseAudit(item.audit_log).map((event) => `<div class="drawer-field"><span>${escapeHtml(formatDate(event.timestamp))}</span><strong>${escapeHtml(event.type || "Event")}</strong></div>`).join("") || "<p>No history yet.</p>"}</div>` : ""}
  `);
  setValue("closure_customer_email", item.customer_email || "");
  setValue("closure_customer_name", item.customer_name || "");
  setValue("closure_status", item.status || "Open");
  setValue("closure_assigned_admin", item.assigned_admin_id || "");
  setValue("closure_reason", item.reason || "");
  setValue("closure_internal_notes", item.internal_notes || "");

  document.getElementById("closureForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = await api("closures", { method: "POST", body: JSON.stringify({
      id: item.id || "",
      customer_email: getValue("closure_customer_email"),
      customer_name: getValue("closure_customer_name"),
      status: getValue("closure_status"),
      assigned_admin_id: getValue("closure_assigned_admin"),
      reason: getValue("closure_reason"),
      internal_notes: getValue("closure_internal_notes")
    }) });
    state.data.closures = data;
    closeModal();
    renderClosures(data.closures);
  });
}

function openAffiliateModal(id = "") {
  const item = (state.data.affiliate?.affiliate || []).find((record) => record.id === id) || {};
  openModal(`
    <div class="modal-head">
      <div><h2>${id ? "Edit Affiliate Block" : "New Affiliate Block"}</h2><p>Blocks can be previewed in this admin record before being published by your public rendering layer.</p></div>
      <button class="drawer-close" type="button" data-action="close-modal">×</button>
    </div>
    <form class="admin-form" id="affiliateForm">
      <label class="admin-label">Block type<select id="affiliate_block_type"><option>Page heading</option><option>Intro text</option><option>Affiliate widget</option><option>CTA button</option><option>Disclaimer</option><option>Referral notice</option><option>Featured experience</option><option>FAQ</option><option>Legal notice</option></select></label>
      ${input("Title", "affiliate_title")}
      ${textarea("Body / intro text", "affiliate_body")}
      ${textarea("Widget or integration code", "affiliate_widget_code")}
      ${input("CTA label", "affiliate_cta_label")}
      ${input("CTA URL", "affiliate_cta_url")}
      ${textarea("Legal / referral notice", "affiliate_legal_notice")}
      ${input("Sort order", "affiliate_sort_order", "number")}
      <label class="check"><input id="affiliate_is_enabled" type="checkbox"> Enabled</label>
      <label class="check"><input id="affiliate_is_published" type="checkbox"> Published</label>
      <button class="admin-button" type="submit">Save affiliate block</button>
      <div id="affiliateSaved" class="admin-success" hidden></div>
    </form>
    <div class="admin-card" style="margin-top:1rem;"><h2>Preview</h2><p>${escapeHtml(item.body || "Preview appears here after saving content.")}</p></div>
  `);
  setValue("affiliate_block_type", item.block_type || "Intro text");
  setValue("affiliate_title", item.title || "");
  setValue("affiliate_body", item.body || "");
  setValue("affiliate_widget_code", item.widget_code || "");
  setValue("affiliate_cta_label", item.cta_label || "");
  setValue("affiliate_cta_url", item.cta_url || "");
  setValue("affiliate_legal_notice", item.legal_notice || "");
  setValue("affiliate_sort_order", item.sort_order || 100);
  document.getElementById("affiliate_is_enabled").checked = Number(item.is_enabled ?? 1) === 1;
  document.getElementById("affiliate_is_published").checked = Number(item.is_published || 0) === 1;

  document.getElementById("affiliateForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const data = await api("affiliate", { method: "POST", body: JSON.stringify({
        id: item.id || "",
        block_type: getValue("affiliate_block_type"),
        title: getValue("affiliate_title"),
        body: getValue("affiliate_body"),
        widget_code: getValue("affiliate_widget_code"),
        cta_label: getValue("affiliate_cta_label"),
        cta_url: getValue("affiliate_cta_url"),
        legal_notice: getValue("affiliate_legal_notice"),
        sort_order: Number(getValue("affiliate_sort_order") || 100),
        is_enabled: document.getElementById("affiliate_is_enabled").checked,
        is_published: document.getElementById("affiliate_is_published").checked
      }) });
      state.data.affiliate = data;
      closeModal();
      renderAffiliate(data.affiliate);
    } catch (error) {
      setSaved("affiliateSaved", error.message, true);
    }
  });
}

async function deleteAffiliateBlock(id) {
  if (!id || !window.confirm("Delete this affiliate content block?")) return;
  const data = await api("affiliate", { method: "POST", body: JSON.stringify({ action: "delete", id }) });
  state.data.affiliate = data;
  renderAffiliate(data.affiliate);
}

async function importAffiliateContent() {
  const data = await api("affiliate", { method: "POST", body: JSON.stringify({ action: "import_existing" }) });
  state.data.affiliate = data;
  renderAffiliate(data.affiliate);
}

async function createAdminBypass() {
  const data = await api("bypass", { method: "POST", body: JSON.stringify({ action: "create" }) });
  window.location.href = data.bypass?.redirect || "/";
}

async function removeAdminBypass() {
  await api("bypass", { method: "POST", body: JSON.stringify({ action: "remove" }) });
  window.alert("Admin website access has been removed.");
}

async function exportCustomerData(email, format = "json") {
  if (!email) return window.alert("Customer email is missing.");
  const data = await api("datarequests", { method: "POST", body: JSON.stringify({ action: "export_customer_data", customer_email: email, format }) });
  downloadText(data.export.filename, data.export.content, format === "csv" ? "text/csv" : "application/json");
}

function exportRecords(section, format = "csv") {
  const payload = state.data[section]?.[section] || state.data[section]?.[section === "analytics" ? "analytics" : section] || state.data[section] || {};
  const records = Array.isArray(payload) ? payload : [payload];
  const content = format === "json" ? JSON.stringify(records, null, 2) : rowsToCsv(records);
  downloadText(`${section}-export.${format}`, content, format === "json" ? "application/json" : "text/csv");
}

function rowsToCsv(rows) {
  if (!rows.length) return "";
  const flatRows = rows.map((row) => flattenRecord(row));
  const headers = [...new Set(flatRows.flatMap((row) => Object.keys(row)))];
  return [headers.join(","), ...flatRows.map((row) => headers.map((key) => csvEscape(row[key])).join(","))].join("\n");
}

function flattenRecord(row) {
  const output = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    output[key] = typeof value === "object" && value !== null ? JSON.stringify(value) : value;
  });
  return output;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadText(filename, content, type) {
  const blob = new Blob([content || ""], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseAudit(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function statusColour(status = "") {
  const text = String(status).toLowerCase();
  if (text.includes("completed") || text.includes("fixed") || text.includes("closed")) return "green";
  if (text.includes("awaiting") || text.includes("review") || text.includes("progress") || text.includes("investigating")) return "amber";
  if (text.includes("refused") || text.includes("duplicate") || text.includes("escalated")) return "red";
  return "";
}

function priorityColour(priority = "") {
  const text = String(priority).toLowerCase();
  if (text === "urgent" || text === "high") return "red";
  if (text === "low") return "green";
  return "amber";
}

function renderComingSoon(settings = {}) {
  renderStatusForm("comingsoon", settings, {
    title: "Coming Soon Page",
    description: "Switch the public website into a pre-launch page while keeping the admin portal available.",
    enabledKey: "comingsoon_enabled",
    modeKey: "comingsoon_content_mode",
    contentKey: "comingsoon_content",
    enabledLabel: "Enable Coming Soon page",
    contentLabel: "Coming Soon page content",
    previewLabel: "Preview Coming Soon Page",
    saveLabel: "Save Coming Soon Page"
  });
}

function renderMaintenance(settings = {}) {
  renderStatusForm("maintenance", settings, {
    title: "Maintenance Mode",
    description: "Bring the public website down for maintenance while keeping the admin portal available.",
    enabledKey: "maintenance_enabled",
    modeKey: "maintenance_content_mode",
    contentKey: "maintenance_content",
    enabledLabel: "Enable Maintenance page",
    contentLabel: "Maintenance page content",
    previewLabel: "Preview Maintenance Page",
    saveLabel: "Save Maintenance Page"
  });
}

function renderStatusForm(section, settings, labels) {
  const enabled = settings[labels.enabledKey] === "true";
  document.getElementById("adminPanel").innerHTML = `
    <div class="admin-card status-page-editor">
      <div class="section-head">
        <div><h2>${escapeHtml(labels.title)}</h2><p>${escapeHtml(labels.description)}</p></div>
        ${badge(enabled ? "Enabled" : "Disabled", enabled ? "green" : "amber")}
      </div>
      <form class="admin-form single status-editor-form" id="${section}Form">
        <div class="status-editor-controls">
          <label class="check">
            <span class="switch"><input id="${labels.enabledKey}" type="checkbox"><span></span></span>
            ${escapeHtml(labels.enabledLabel)}
          </label>
          <label class="admin-label">Content mode
            <select id="${labels.modeKey}">
              <option value="plain">Plain text</option>
              <option value="html">HTML</option>
            </select>
          </label>
        </div>
        <label class="admin-label status-content-field">
          <span id="${section}ContentLabel">${escapeHtml(labels.contentLabel)}</span>
          <textarea id="${labels.contentKey}" aria-describedby="${section}ModeHelp"></textarea>
        </label>
        <div class="admin-alert" id="${section}ModeHelp">Plain text mode escapes HTML and preserves line breaks.</div>
        <div class="section-actions">
          <button class="admin-button" type="submit">${escapeHtml(labels.saveLabel)}</button>
          <a class="admin-button secondary" href="/?preview_public_block=1" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href, '_blank', 'noopener,noreferrer'); return false;">${escapeHtml(labels.previewLabel)}</a>
        </div>
        <div id="${section}Saved" class="admin-success" hidden></div>
      </form>
    </div>
  `;

  document.getElementById(labels.enabledKey).checked = enabled;
  setValue(labels.modeKey, settings[labels.modeKey] || "plain");
  setValue(labels.contentKey, settings[labels.contentKey] || "");

  applyStatusEditorMode(section, labels);
  document.getElementById(labels.modeKey).addEventListener("change", () => applyStatusEditorMode(section, labels));

  document.getElementById(`${section}Form`).addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const body = {
        [labels.enabledKey]: document.getElementById(labels.enabledKey).checked,
        [labels.modeKey]: getValue(labels.modeKey),
        [labels.contentKey]: document.getElementById(labels.contentKey).value
      };
      const data = await api(section, { method: "POST", body: JSON.stringify(body) });
      state.data[section] = { ...(state.data[section] || {}), ...data };
      renderSection(section, data);
      setSaved(`${section}Saved`, `${labels.title} saved.`);
    } catch (error) {
      setSaved(`${section}Saved`, error.message, true);
    }
  });
}

function applyStatusEditorMode(section, labels) {
  const mode = getValue(labels.modeKey) === "html" ? "html" : "plain";
  const isHtml = mode === "html";
  const field = document.getElementById(labels.contentKey);
  const label = document.getElementById(`${section}ContentLabel`);
  const help = document.getElementById(`${section}ModeHelp`);
  if (field) {
    field.placeholder = isHtml
      ? "<!doctype html>\n<html lang=\"en-GB\">\n...\n</html>"
      : "Enter the public page message...";
    field.dataset.editorMode = mode;
  }
  if (label) label.textContent = isHtml ? `${labels.contentLabel} (complete HTML document)` : labels.contentLabel;
  if (help) {
    help.textContent = isHtml
      ? "HTML mode returns this content exactly as saved. Include the complete document, styling and scripts you require."
      : "Plain text mode escapes HTML and preserves line breaks in a simple responsive page.";
  }
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
    <div class="drawer-section-grid">
      <section class="drawer-section-card">
        <h3>Membership</h3>
        <p>${isLifetime ? `Lifetime access is enabled${customer.admin_lifetime_plan_id ? ` on ${escapeHtml(customer.admin_lifetime_plan_id)}` : ""}.` : "This customer has standard account access."}</p>
      </section>
      <section class="drawer-section-card">
        <h3>Orders</h3>
        <p>No order history is exposed by the current customer API.</p>
      </section>
      <section class="drawer-section-card">
        <h3>Timeline</h3>
        <p>Profile last updated ${escapeHtml(formatDate(customer.updated_at || customer.created_at))}.</p>
      </section>
      <section class="drawer-section-card">
        <h3>GDPR &amp; support</h3>
        <p>${escapeHtml(customer.support_notes || "No linked support history is available on this profile.")}</p>
      </section>
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
    <div class="section-actions" style="margin-top:1rem;">
      <button class="admin-button secondary" type="button" data-action="open-closure" data-id="" id="customerClosureButton">Closure Request</button>
      <button class="admin-button secondary" type="button" data-action="export-customer-data" data-email="${escapeAttr(customer.email)}" data-format="json">Export JSON</button>
      <button class="admin-button secondary" type="button" data-action="export-customer-data" data-email="${escapeAttr(customer.email)}" data-format="csv">Export CSV</button>
      <button class="admin-button" type="button" data-action="reset-microsoft-password" data-email="${escapeAttr(customer.email)}">Reset Microsoft Password</button>
    </div>
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

  document.getElementById("customerClosureButton")?.addEventListener("click", () => {
    state.data.closures = state.data.closures || { closures: [] };
    openClosureModal("");
    setValue("closure_customer_email", customer.email || "");
    setValue("closure_customer_name", displayName || "");
  });
}

async function openAccountModal() {
  const identity = state.data[state.currentSection]?.admin || {};
  if (!identity.email) {
    openModal(`<div class="modal-head"><div><h2>Account settings</h2><p>Your signed-in administrator profile is not available yet.</p></div><button class="drawer-close" type="button" data-action="close-modal">×</button></div>`);
    return;
  }
  await openAdminProfileModal(identity.email, { isOwnProfile: true });
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
        <tbody>${rows || `<tr><td colspan="${headers.length}"><div class="empty-state"><span class="activity-empty-icon" aria-hidden="true">∅</span><strong>No records yet.</strong><p>This section will populate once there is data to display.</p></div></td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function badge(label, colour = "") {
  return `<span class="badge ${escapeHtml(colour)}">${escapeHtml(label)}</span>`;
}

function emptyCard(text) {
  return `<div class="list-card empty-state"><span class="activity-empty-icon" aria-hidden="true">∅</span><strong>${escapeHtml(text)}</strong><p>There is nothing to show here just yet.</p></div>`;
}

function renderInlineStatus(kind, message, retryAction = "") {
  const tone = kind === "success" ? "admin-success" : "admin-alert";
  return `<div class="${tone}" role="status">${escapeHtml(message)}${retryAction ? ` <button class="mini-button" type="button" data-action="${escapeAttr(retryAction)}">Retry</button>` : ""}</div>`;
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
