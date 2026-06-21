const JA_PROFILE_STORAGE_KEY = "ja_secure_profile_v1";

async function loadAccessProfile() {
  try {
    const response = await fetch("/cdn-cgi/access/get-identity", {
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Identity response was not available.");
    }

    const identity = await response.json();

    const email =
      identity.email ||
      identity.user_email ||
      identity.username ||
      identity.common_name ||
      "Signed in";

    const legalName =
      identity.name ||
      identity.user_name ||
      identity.preferred_username ||
      identity.common_name ||
      email ||
      "JA Secure Access user";

    const provider =
      identity.idp && identity.idp.name
        ? identity.idp.name
        : "JA Secure Access / Microsoft Entra";

    const savedProfile = getSavedProfile(email);
    const displayName = savedProfile.displayName || legalName;

    const profile = {
      email,
      legalName,
      displayName,
      provider,
      contactEmail: savedProfile.contactEmail || email,
      phone: savedProfile.phone || "",
      communicationPreference: savedProfile.communicationPreference || "Email",
      supportNotes: savedProfile.supportNotes || ""
    };

    updateProfile(profile);
    populateForm(profile);
    bindProfileForm(profile);
  } catch (error) {
    showProfileError();
  }
}

function getSavedProfile(email) {
  try {
    const allProfiles = JSON.parse(localStorage.getItem(JA_PROFILE_STORAGE_KEY) || "{}");
    return allProfiles[email] || {};
  } catch {
    return {};
  }
}

function saveProfile(email, profile) {
  const allProfiles = JSON.parse(localStorage.getItem(JA_PROFILE_STORAGE_KEY) || "{}");
  allProfiles[email] = profile;
  localStorage.setItem(JA_PROFILE_STORAGE_KEY, JSON.stringify(allProfiles));
}

function updateProfile(profile) {
  setText("profileName", profile.displayName);
  setText("profileEmail", profile.email);
  setText("profileNameDetail", profile.displayName);
  setText("profileLegalName", profile.legalName);
  setText("profileEmailDetail", profile.email);
  setText("profileContactEmail", profile.contactEmail);
  setText("profilePhone", profile.phone || "Not added");
  setText("profileComms", profile.communicationPreference);
  setText("profileProvider", profile.provider);
  setText("profileInitials", initials(profile.displayName, profile.email));

  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.classList.remove("loading-pulse");
  }

  window.dispatchEvent(new Event("ja-profile-updated"));
}

function populateForm(profile) {
  setValue("displayNameInput", profile.displayName);
  setValue("contactEmailInput", profile.contactEmail);
  setValue("phoneInput", profile.phone);
  setValue("communicationPreferenceInput", profile.communicationPreference);
  setValue("supportNotesInput", profile.supportNotes);
}

function bindProfileForm(profile) {
  const form = document.getElementById("profileForm");
  const resetButton = document.getElementById("resetProfileButton");
  const savedMessage = document.getElementById("profileSavedMessage");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const updatedProfile = {
        displayName: getValue("displayNameInput") || profile.legalName,
        contactEmail: getValue("contactEmailInput") || profile.email,
        phone: getValue("phoneInput"),
        communicationPreference: getValue("communicationPreferenceInput") || "Email",
        supportNotes: getValue("supportNotesInput")
      };

      saveProfile(profile.email, updatedProfile);

      const mergedProfile = {
        ...profile,
        ...updatedProfile
      };

      updateProfile(mergedProfile);

      if (savedMessage) {
        savedMessage.textContent = "Profile saved on this device.";
        savedMessage.hidden = false;
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      const allProfiles = JSON.parse(localStorage.getItem(JA_PROFILE_STORAGE_KEY) || "{}");
      delete allProfiles[profile.email];
      localStorage.setItem(JA_PROFILE_STORAGE_KEY, JSON.stringify(allProfiles));
      window.location.reload();
    });
  }
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

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value || "";
  }
}

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function initials(name, email) {
  const source = name && name !== "JA Secure Access user" ? name : email;
  const parts = String(source || "JA")
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

document.addEventListener("DOMContentLoaded", loadAccessProfile);
