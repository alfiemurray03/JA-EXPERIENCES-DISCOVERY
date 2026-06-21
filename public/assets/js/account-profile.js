async function loadAccessProfile() {
  bindDashboardShell();
  await applyAccountBranding();
  try {
    const response = await fetch("/account/profile", {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Profile response was not available.");
    }

    const data = await response.json();
    const profile = data.profile;

    updateProfile(profile);
    populateForm(profile);
    populateConsent(data.consent || {});
    bindProfileForm(profile);
    await loadAccountRequests();
    bindAccountRequestForms();
  } catch (error) {
    showProfileError();
  }
}

async function applyAccountBranding() {
  let branding = {};
  try {
    const response = await fetch("/site-settings", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      branding = data.branding || {};
      if (data.theme) document.documentElement.dataset.siteTheme = data.theme;
    }
  } catch {
    branding = {};
  }

  const serviceName = branding.service_name || branding.trading_name || "JA Experiences & Discovery";
  const shortName = serviceName.replace(/\s*&\s*Discovery$/i, "");
  const businessName = branding.business_name || "JA Group Services Ltd";

  document.title = `My Account | ${serviceName}`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = `Secure ${serviceName} customer account dashboard protected by JA Secure Access.`;
  }

  document.querySelectorAll(".brand strong, .mobile-topbar strong").forEach((element) => {
    element.textContent = shortName || serviceName;
  });
  document.querySelectorAll(".brand span").forEach((element) => {
    element.textContent = "Customer account";
  });
  document.querySelectorAll("[data-service-name]").forEach((element) => {
    element.textContent = serviceName;
  });
  document.querySelectorAll("[data-business-name]").forEach((element) => {
    element.textContent = businessName;
  });

  const footerNote = document.getElementById("accountFooterNotice");
  if (footerNote) {
    footerNote.textContent = branding.footer_notice || `${serviceName} account data is managed by ${businessName}.`;
  }

  if (branding.logo_url) {
    document.querySelectorAll(".brand-mark").forEach((element) => {
      element.replaceChildren();
      const image = document.createElement("img");
      image.src = branding.logo_url;
      image.alt = `${serviceName} logo`;
      element.appendChild(image);
      element.classList.add("has-logo");
    });
  }

  if (branding.favicon_url) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = branding.favicon_url;
  }
}

function updateProfile(profile) {
  setText("profileName", profile.displayName);
  setText("profileEmail", profile.email);
  setText("sidebarName", profile.displayName);
  setText("sidebarEmail", profile.email);
  setText("welcomeName", firstName(profile.displayName, profile.email));
  setText("profileNameDetail", profile.displayName);
  setText("profileLegalName", profile.verifiedName);
  setText("profileEmailDetail", profile.email);
  setText("profileContactEmail", profile.contactEmail);
  setText("profilePhone", profile.phone || "Not added");
  setText("profileComms", profile.communicationPreference || "Email");
  setText("profileProvider", "JA Secure Access / Microsoft Entra");
  setText("profileInitials", initials(profile.displayName, profile.email));
  setText("sidebarInitials", initials(profile.displayName, profile.email));
  setText("currentPlanName", profile.currentPlan || "Standard");
  setText("currentPlanType", profile.currentPlanType || profile.customerStatus || "Standard");
  setText("statBenefitsText", profile.lifetimeAccess ? "Lifetime access" : "Secure access");
  setText("benefitsSummary", profile.lifetimeAccess
    ? "Lifetime access is active on this account, alongside secure customer profile management, data rights requests and system reporting."
    : "Secure account access, customer profile management, data rights requests and system reporting.");
  setText("lifetimeAccessText", profile.lifetimeAccess ? "Enabled" : "Not enabled");
  setText("statBenefits", profile.lifetimeAccess ? "2" : "1");

  setBadge("profilePlanBadge", profile.lifetimeAccess ? "Lifetime" : (profile.currentPlanType || profile.customerStatus || "Standard"), profile.lifetimeAccess ? "amber" : "");
  setBadge("planStatusBadge", profile.lifetimeAccess ? "Lifetime" : "Active", profile.lifetimeAccess ? "amber" : "green");

  const lifetimeBadge = document.getElementById("lifetimeBadge");
  if (lifetimeBadge) {
    lifetimeBadge.hidden = !profile.lifetimeAccess;
  }

  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.classList.remove("loading-pulse");
  }

  window.dispatchEvent(new Event("ja-profile-updated"));
}

function bindDashboardShell() {
  const button = document.getElementById("mobileMenuButton");
  if (button && !button.dataset.bound) {
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });
  }

  document.querySelectorAll("[data-account-nav]").forEach((link) => {
    if (link.dataset.bound) return;
    link.dataset.bound = "true";
    link.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
      document.querySelectorAll("[data-account-nav]").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

function populateForm(profile) {
  setValue("displayNameInput", profile.displayName);
  setValue("contactEmailInput", profile.contactEmail);
  setValue("phoneInput", profile.phone);
  setValue("communicationPreferenceInput", profile.communicationPreference || "Email");
  setValue("supportNotesInput", profile.supportNotes);
}

function populateConsent(consent) {
  setChecked("termsAcceptedInput", Boolean(consent.termsAccepted));
  setChecked("privacyAcceptedInput", Boolean(consent.privacyAccepted));
  setChecked("marketingConsentInput", Boolean(consent.marketingConsent));
}

function bindProfileForm(profile) {
  const form = document.getElementById("profileForm");
  const resetButton = document.getElementById("resetProfileButton");
  const savedMessage = document.getElementById("profileSavedMessage");

  if (form && !form.dataset.bound) {
    form.dataset.bound = "true";

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (savedMessage) {
        savedMessage.hidden = true;
      }

      const updatedProfile = {
        displayName: getValue("displayNameInput") || profile.verifiedName || profile.email,
        contactEmail: getValue("contactEmailInput") || profile.email,
        phone: getValue("phoneInput"),
        communicationPreference: getValue("communicationPreferenceInput") || "Email",
        supportNotes: getValue("supportNotesInput"),
        termsAccepted: getChecked("termsAcceptedInput"),
        privacyAccepted: getChecked("privacyAcceptedInput"),
        marketingConsent: getChecked("marketingConsentInput")
      };

      if (!updatedProfile.termsAccepted || !updatedProfile.privacyAccepted) {
        if (savedMessage) {
          savedMessage.textContent = "Please confirm the Terms of Service and Privacy Notice before saving.";
          savedMessage.hidden = false;
        }
        return;
      }

      try {
        const response = await fetch("/account/profile", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedProfile)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Profile could not be saved.");
        }

        updateProfile(data.profile);
        populateForm(data.profile);
        populateConsent(data.consent || {});

        if (savedMessage) {
          savedMessage.textContent = "Profile saved successfully. These details now sync through your JA Secure Access account.";
          savedMessage.hidden = false;
        }
      } catch (error) {
        if (savedMessage) {
          savedMessage.textContent = error.message;
          savedMessage.hidden = false;
        }
      }
    });
  }

  if (resetButton && !resetButton.dataset.bound) {
    resetButton.dataset.bound = "true";

    resetButton.addEventListener("click", async function () {
      setValue("displayNameInput", profile.verifiedName || profile.email);
      setValue("contactEmailInput", profile.email);
      setValue("phoneInput", "");
      setValue("communicationPreferenceInput", "Email");
      setValue("supportNotesInput", "");

      if (savedMessage) {
        savedMessage.textContent = "Fields reset. Click Save profile to confirm.";
        savedMessage.hidden = false;
      }
    });
  }
}

async function loadAccountRequests() {
  try {
    const response = await fetch("/account/requests", {
      credentials: "include",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Requests could not be loaded.");
    renderDataProtectionRequests(data.dataProtectionRequests || []);
    renderSystemReports(data.systemReports || []);
    updateRequestStats(data.dataProtectionRequests || [], data.systemReports || []);
  } catch (error) {
    setText("dprList", error.message);
    setText("sysList", error.message);
  }
}

function updateRequestStats(dataRequests, systemReports) {
  const totalSupport = dataRequests.length + systemReports.length;
  setText("statSupport", String(totalSupport));
  setText("statMessages", String(totalSupport));
}

function bindAccountRequestForms() {
  const dprForm = document.getElementById("dataProtectionForm");
  const sysForm = document.getElementById("systemReportForm");

  if (dprForm && !dprForm.dataset.bound) {
    dprForm.dataset.bound = "true";
    dprForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!dprForm.reportValidity()) return;
      await submitAccountRequest({
        type: "data_protection",
        request_type: getValue("dprTypeInput"),
        customer_message: getValue("dprMessageInput"),
        confirmed: getChecked("dprConfirmInput")
      }, "dprSavedMessage", () => {
        setValue("dprTypeInput", "");
        setValue("dprMessageInput", "");
        setChecked("dprConfirmInput", false);
      });
    });
  }

  if (sysForm && !sysForm.dataset.bound) {
    sysForm.dataset.bound = "true";
    sysForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!sysForm.reportValidity()) return;
      await submitAccountRequest({
        type: "system_report",
        issue_type: getValue("sysTypeInput"),
        affected_url: getValue("sysAffectedInput"),
        device_browser: getValue("sysDeviceInput"),
        description: getValue("sysDescriptionInput")
      }, "sysSavedMessage", () => {
        setValue("sysTypeInput", "");
        setValue("sysAffectedInput", "");
        setValue("sysDeviceInput", "");
        setValue("sysDescriptionInput", "");
      });
    });
  }
}

async function submitAccountRequest(body, messageId, reset) {
  const message = document.getElementById(messageId);
  if (message) {
    message.hidden = true;
  }

  try {
    const response = await fetch("/account/requests", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The request could not be submitted.");

    if (message) {
      const record = data.record || {};
      const type = record.request_type || record.issue_type || "Submitted";
      const due = record.due_at ? ` Expected response deadline: ${formatDate(record.due_at)}.` : "";
      message.textContent = `Submitted ${record.reference}. ${type}. Status: ${record.status || "New"}. Submitted: ${formatDate(record.submitted_at || record.created_at)}.${due}`;
      message.hidden = false;
    }

    reset();
    await loadAccountRequests();
  } catch (error) {
    if (message) {
      message.textContent = error.message;
      message.hidden = false;
    }
  }
}

function renderDataProtectionRequests(records) {
  const list = document.getElementById("dprList");
  if (!list) return;
  list.innerHTML = records.length ? records.map((record) => `
    <article class="account-record">
      <strong>${escapeHtml(record.reference)} - ${escapeHtml(record.request_type)}</strong>
      <span>Status: ${escapeHtml(record.status || "New")}</span>
      <span>Submitted: ${escapeHtml(formatDate(record.submitted_at || record.created_at))}</span>
      <span>Expected response deadline: ${escapeHtml(formatDate(record.due_at))}</span>
      <span class="account-status">${escapeHtml(record.status || "New")}</span>
    </article>
  `).join("") : `<article class="account-record"><strong>No data protection requests yet.</strong><span>Your submitted requests will appear here.</span></article>`;
}

function renderSystemReports(records) {
  const list = document.getElementById("sysList");
  if (!list) return;
  list.innerHTML = records.length ? records.map((record) => `
    <article class="account-record">
      <strong>${escapeHtml(record.reference)} - ${escapeHtml(record.issue_type)}</strong>
      <span>Status: ${escapeHtml(record.status || "New")}</span>
      <span>Submitted: ${escapeHtml(formatDate(record.submitted_at || record.created_at))}</span>
      <span>Last updated: ${escapeHtml(formatDate(record.updated_at || record.created_at))}</span>
      <span class="account-status">${escapeHtml(record.status || "New")}</span>
    </article>
  `).join("") : `<article class="account-record"><strong>No system reports yet.</strong><span>Your submitted reports will appear here.</span></article>`;
}

function showProfileError() {
  setText("profileName", "Sign-in details unavailable");
  setText("profileEmail", "Please sign out and sign back in.");
  setText("profileNameDetail", "Unavailable");
  setText("profileLegalName", "Unavailable");
  setText("profileEmailDetail", "Unavailable");
  setText("profileContactEmail", "Unavailable");
  setText("profilePhone", "Unavailable");
  setText("profileComms", "Unavailable");
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "";
  }
}

function setBadge(id, text, colour) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text || "";
  element.className = `badge ${colour || ""}`.trim();
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value || "";
  }
}

function setChecked(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.checked = Boolean(value);
  }
}

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function getChecked(id) {
  const element = document.getElementById(id);
  return element ? Boolean(element.checked) : false;
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name, email) {
  const source = name || email || "JA";
  const parts = String(source)
    .replace(/@.*/, "")
    .split(/[.\s_-]+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "JA";
}

function firstName(name, email) {
  const source = String(name || email || "there").trim();
  if (!source || source.includes("@")) return "there";
  return source.split(/\s+/)[0] || "there";
}

document.addEventListener("DOMContentLoaded", loadAccessProfile);
