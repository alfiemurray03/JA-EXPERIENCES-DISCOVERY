async function loadAccessProfile() {
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
  } catch (error) {
    showProfileError();
  }
}

function updateProfile(profile) {
  setText("profileName", profile.displayName);
  setText("profileEmail", profile.email);
  setText("profileNameDetail", profile.displayName);
  setText("profileLegalName", profile.verifiedName);
  setText("profileEmailDetail", profile.email);
  setText("profileContactEmail", profile.contactEmail);
  setText("profilePhone", profile.phone || "Not added");
  setText("profileComms", profile.communicationPreference || "Email");
  setText("profileProvider", "JA Secure Access / Microsoft Entra");
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

document.addEventListener("DOMContentLoaded", loadAccessProfile);
