const state = {
  profile: null,
  requests: null
};

const setText = (id, value) => {
  const node = document.getElementById(id);
  if (node) node.textContent = value || "—";
};

const initials = (value) => String(value || "JA").trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "JA";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const escapeMarkup = (value) => String(value || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const readNativeIdentity = () => {
  const content = document.querySelector('meta[name="ja-native-identity"]')?.getAttribute("content");
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const activityLabel = (item) => item.request_type || item.issue_type || item.reference || "Activity";

async function loadProfile() {
  const response = await fetch("/account/profile", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Profile data is unavailable.");
  const payload = await response.json().catch(() => {
    throw new Error("Profile data is unavailable.");
  });
  state.profile = payload.profile || payload;
}

async function loadRequests() {
  const response = await fetch("/account/requests", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) return;
  state.requests = await response.json().catch(() => ({}));
}

function renderProfile() {
  const profile = state.profile || {};
  const fullName = profile.displayName || profile.verifiedName || profile.name || "Customer";
  const email = profile.email || "";
  const verification = profile.verificationStatus || (email ? "Verified" : "Not provided");
  const stripeStatus = profile.stripeCustomerId ? "Linked" : "Not provided";
  const communication = profile.communicationPreference || "Not provided";
  const lastSignIn = formatDate(profile.microsoftUpdatedAt || profile.updatedAt || profile.createdAt);
  const membershipDate = formatDate(profile.createdAt || profile.updatedAt);
  const country = profile.microsoftCountry || profile.country || "Not provided";
  const language = profile.microsoftPreferredLanguage || profile.microsoftLocale || "Not provided";

  setText("heroGreeting", `Welcome back, ${profile.verifiedName || fullName}`);
  setText("heroIntro", "Manage your account, bookings, support and privacy requests from one secure place.");
  setText("heroName", fullName);
  setText("heroCaption", email ? `Signed in as ${email}` : "Signed in securely with Microsoft Entra ID");
  setText("heroVerified", verification);
  setText("heroStatus", profile.customerStatus || "Active session");
  setText("heroStripe", stripeStatus);
  setText("heroAvatar", initials(fullName));
  setText("sidebarAvatar", initials(fullName));
  setText("sidebarName", fullName);
  setText("sidebarEmail", email || "Signed in securely");
  setText("lastSignIn", lastSignIn);
  setText("membershipDate", membershipDate);
  setText("country", country);
  setText("language", language);
  setText("statEmail", email || "Not available");
  setText("statVerification", verification);
  setText("statStripe", stripeStatus);
  setText("statComms", communication);
  setText("summaryName", fullName);
  setText("summaryDisplayName", profile.displayName || fullName);
  setText("summaryObjectId", profile.microsoftObjectId || profile.objectId || "Not provided");
  setText("summaryTenantId", profile.microsoftTenantId || profile.tenantId || "Not provided");
  setText("summaryPhone", profile.phone || "Not provided");
  setText("summaryVerified", verification);
  setText("summaryStripe", profile.stripeCustomerId || "Not provided");
  setText("summaryJobTitle", profile.microsoftJobTitle || profile.jobTitle || "Not provided");
  setText("summaryDepartment", profile.microsoftDepartment || profile.department || "Not provided");
  setText("summaryCompanyName", profile.microsoftCompanyName || profile.companyName || "Not provided");
  setText("summaryMobilePhone", profile.microsoftMobilePhone || profile.mobilePhone || "Not provided");
  setText("summaryBusinessPhone", profile.microsoftBusinessPhone || profile.businessPhone || "Not provided");
  setText("summaryCountry", country);
  setText("summaryLanguage", language);
  setText("summaryLocale", profile.microsoftLocale || profile.locale || "Not provided");
  setText("profilePhoto", profile.photoUrl || profile.microsoftPhotoUrl ? "Available" : "Not available");
  setText("profileFullName", fullName);
  setText("profileDisplayName", profile.displayName || fullName);
  setText("profileGivenName", profile.microsoftGivenName || profile.givenName || "Not provided");
  setText("profileFamilyName", profile.microsoftFamilyName || profile.familyName || "Not provided");
  setText("profileEmail", email || "Not available");
  setText("profileUsername", profile.microsoftPreferredUsername || profile.preferredUsername || email || "Not provided");
  setText("profileStripeId", profile.stripeCustomerId || "Not provided");
  setText("profileVerification", verification);
  setText("profileLastSignIn", lastSignIn);
  setText("profileMembershipDate", membershipDate);
  setText("profileCommunication", communication);
}

function renderActivity() {
  const requests = state.requests || {};
  const dataRequests = Array.isArray(requests.dataProtectionRequests) ? requests.dataProtectionRequests : [];
  const systemReports = Array.isArray(requests.systemReports) ? requests.systemReports : [];
  const items = [...dataRequests.slice(0, 3).map((item) => ({
    title: activityLabel(item),
    detail: item.customer_message || "Data protection request",
    when: item.updated_at || item.submitted_at || item.created_at || ""
  })), ...systemReports.slice(0, 3).map((item) => ({
    title: activityLabel(item),
    detail: item.description || "Website or account issue",
    when: item.updated_at || item.submitted_at || item.created_at || ""
  }))];

  const list = document.getElementById("activityList");
  if (!list) return;
  if (!items.length) {
    list.innerHTML = '<li class="activity-row"><div class="activity-meta"><strong>No recent requests yet</strong><small>Your latest account activity will appear here after you submit requests or support messages.</small></div><span>Ready</span></li>';
    setText("activityNote", "Open My Enquiries, Data Protection Requests or Support to create activity.");
    return;
  }
  list.innerHTML = items.map((item) => `
    <li class="activity-row">
      <div class="activity-meta">
        <strong>${escapeMarkup(item.title)}</strong>
        <small>${escapeMarkup(item.detail)}</small>
      </div>
      <span>${escapeMarkup(formatDate(item.when))}</span>
    </li>
  `).join("");
  setText("activityNote", "Recent activity is drawn from your secure account records.");
}

async function loadDashboard() {
  state.profile = readNativeIdentity() || {};
  renderProfile();
  renderActivity();

  const profileTask = loadProfile().then(renderProfile).catch((error) => {
    setText("activityNote", error.message || "Profile data could not be loaded.");
  });
  const requestsTask = loadRequests().then(renderActivity).catch((error) => {
    const list = document.getElementById("activityList");
    if (list) list.innerHTML = '<li class="activity-row"><div class="activity-meta"><strong>Unable to load recent activity</strong><small>Please refresh the page or contact support if the problem continues.</small></div><span>Error</span></li>';
    setText("activityNote", error.message || "Recent activity could not be loaded.");
  });
  await Promise.allSettled([profileTask, requestsTask]);
}

document.addEventListener("DOMContentLoaded", loadDashboard);
