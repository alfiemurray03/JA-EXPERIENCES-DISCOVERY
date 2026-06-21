document.addEventListener("DOMContentLoaded", async () => {
  const main = document.querySelector("main");
  const headerTarget = document.querySelector("#siteShellHeader, #site-header");
  const footerTarget = document.querySelector("#siteShellFooter, #site-footer");

  if (main && !main.id) main.id = "main";

  function loadSharedStyles(path) {
    if (document.querySelector(`link[href="${path}"]`)) return;

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = path;
    document.head.appendChild(stylesheet);
  }

  loadSharedStyles("/assets/includes/header.css?v=20260621-1");
  loadSharedStyles("/assets/includes/footer.css?v=20260621-1");

  async function loadPartial(target, path) {
    if (!target) return;

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Could not load shared website section: ${path}`);
    }

    target.innerHTML = await response.text();
  }

  try {
    await Promise.all([
      loadPartial(headerTarget, "/assets/includes/header.html?v=20260621-1"),
      loadPartial(footerTarget, "/assets/includes/footer.html?v=20260621-1")
    ]);
  } catch (error) {
    console.error(error);
    return;
  }

  const page = document.body.dataset.page || "";
  const activeLink = document.querySelector(`[data-nav-page="${page}"]`);
  activeLink?.setAttribute("aria-current", "page");

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#siteNav");

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      nav.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.focus();
    }
  });
});

/* JA Secure Access header account label */
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
  window.addEventListener("ja-profile-updated", run);
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
