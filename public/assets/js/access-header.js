(function () {
  const STORAGE_KEY = "ja_secure_profile_v1";

  async function fetchIdentity() {
    const response = await fetch("/cdn-cgi/access/get-identity", {
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Not signed in");
    }

    return response.json();
  }

  function readProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function getDisplayName(identity) {
    const profile = readProfile();
    const email = identity.email || identity.user_email || identity.username || "";
    const saved = profile[email];

    if (saved && saved.displayName) {
      return saved.displayName;
    }

    return identity.name || identity.common_name || email || "Account";
  }

  function firstName(name) {
    return String(name || "Account").trim().split(/\s+/)[0] || "Account";
  }

  function updateHeaderName(name, signedIn) {
    const accountLinks = document.querySelectorAll(
      'a[href="/account/"], a[href="/account"], .header-login'
    );

    accountLinks.forEach((link) => {
      link.textContent = signedIn ? firstName(name) : "Sign in";
      link.setAttribute("aria-label", signedIn ? "Open account profile" : "Sign in to account");
      link.setAttribute("title", signedIn ? "Signed in as " + name : "Sign in to account");
    });
  }

  async function run() {
    try {
      const identity = await fetchIdentity();
      const name = getDisplayName(identity);
      updateHeaderName(name, true);
    } catch {
      updateHeaderName("", false);
    }
  }

  document.addEventListener("DOMContentLoaded", run);
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
