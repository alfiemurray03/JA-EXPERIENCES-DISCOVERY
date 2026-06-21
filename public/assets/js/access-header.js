(function () {
  const PROFILE_STORAGE_KEY = "ja_secure_profile_v1";
  const LAST_IDENTITY_KEY = "ja_secure_last_identity_v1";

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors.
    }
  }

  function bestEmail(identity) {
    return (
      identity.email ||
      identity.user_email ||
      identity.username ||
      identity.common_name ||
      ""
    );
  }

  function bestName(identity) {
    const email = bestEmail(identity);
    const savedProfiles = readJson(PROFILE_STORAGE_KEY);
    const savedProfile = savedProfiles[email];

    if (savedProfile && savedProfile.displayName) {
      return savedProfile.displayName;
    }

    return (
      identity.name ||
      identity.user_name ||
      identity.preferred_username ||
      identity.common_name ||
      email ||
      ""
    );
  }

  function updateAccountLinks(label, signedIn) {
    const links = document.querySelectorAll(
      'a[href="/account/"], a[href="/account"], .header-login'
    );

    links.forEach((link) => {
      link.textContent = signedIn && label ? label : "Sign in";
      link.setAttribute(
        "aria-label",
        signedIn && label ? "Open account for " + label : "Sign in to account"
      );
      link.setAttribute(
        "title",
        signedIn && label ? "Signed in as " + label : "Sign in to account"
      );
    });
  }

  async function tryLiveIdentity() {
    const response = await fetch("/cdn-cgi/access/get-identity", {
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("No live Access identity available on this page.");
    }

    const identity = await response.json();
    const email = bestEmail(identity);
    const name = bestName(identity);

    if (email || name) {
      writeJson(LAST_IDENTITY_KEY, {
        email,
        name,
        savedAt: new Date().toISOString()
      });
    }

    return { email, name };
  }

  function showSavedIdentity() {
    const saved = readJson(LAST_IDENTITY_KEY);

    if (saved && saved.name) {
      updateAccountLinks(saved.name, true);
      return true;
    }

    updateAccountLinks("Sign in", false);
    return false;
  }

  async function refreshAccountHeader() {
    showSavedIdentity();

    try {
      const identity = await tryLiveIdentity();
      if (identity.name) {
        updateAccountLinks(identity.name, true);
      }
    } catch {
      showSavedIdentity();
    }
  }

  function start() {
    refreshAccountHeader();

    const observer = new MutationObserver(refreshAccountHeader);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("ja-profile-updated", refreshAccountHeader);

    setTimeout(refreshAccountHeader, 500);
    setTimeout(refreshAccountHeader, 1200);
    setTimeout(refreshAccountHeader, 2500);
  }

  document.addEventListener("DOMContentLoaded", start);
})();
