(function () {
  async function fetchProfile() {
    const response = await fetch("/account/profile", {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Not signed in");
    }

    const data = await response.json();
    return data.profile;
  }

  function updateAccountLinks(label, signedIn) {
    const links = document.querySelectorAll(
      'a[href="/account/"], a[href="/account"], .header-login'
    );

    links.forEach((link) => {
      const newText = signedIn && label ? label : "Sign in";

      if (link.textContent.trim() !== newText) {
        link.textContent = newText;
      }

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

  async function refreshAccountHeader() {
    try {
      const profile = await fetchProfile();
      const label =
        profile.displayName ||
        profile.verifiedName ||
        profile.email ||
        "Account";

      updateAccountLinks(label, true);
    } catch {
      updateAccountLinks("Sign in", false);
    }
  }

  function runSafely() {
    refreshAccountHeader();
    setTimeout(refreshAccountHeader, 400);
    setTimeout(refreshAccountHeader, 1200);
    setTimeout(refreshAccountHeader, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSafely);
  } else {
    runSafely();
  }

  window.addEventListener("ja-profile-updated", refreshAccountHeader);
})();
