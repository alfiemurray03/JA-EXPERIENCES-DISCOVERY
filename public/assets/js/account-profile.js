async function loadAccessProfile() {
  const fallbackName = "JA Secure Access user";
  const fallbackEmail = "Signed in";

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
      fallbackEmail;

    const name =
      identity.name ||
      identity.user_name ||
      identity.preferred_username ||
      identity.common_name ||
      email ||
      fallbackName;

    const provider =
      identity.idp && identity.idp.name
        ? identity.idp.name
        : "JA Secure Access / Microsoft Entra";

    updateProfile(name, email, provider);
  } catch (error) {
    updateProfile(fallbackName, fallbackEmail, "JA Secure Access / Microsoft Entra");
  }
}

function updateProfile(name, email, provider) {
  const displayName = name || "JA Secure Access user";
  const displayEmail = email || "Signed in";

  setText("profileName", displayName);
  setText("profileEmail", displayEmail);
  setText("profileNameDetail", displayName);
  setText("profileEmailDetail", displayEmail);
  setText("profileProvider", provider);
  setText("profileInitials", initials(displayName, displayEmail));

  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.classList.remove("loading-pulse");
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
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
