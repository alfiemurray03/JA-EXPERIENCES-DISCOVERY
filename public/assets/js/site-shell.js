async function initialiseSiteShell() {
  const main = document.querySelector("main");
  const headerTarget = document.querySelector("#siteShellHeader, #site-header");
  const footerTarget = document.querySelector("#siteShellFooter, #site-footer");

  if (main && !main.id) main.id = "main";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  const tailwindLink = document.querySelector('link[href^="/assets/css/tailwind.css"]') || document.createElement("link");
  tailwindLink.rel = "stylesheet";
  tailwindLink.href = "/assets/css/tailwind.css?v=20260711-launch-1";
  if (!tailwindLink.parentNode) document.head.appendChild(tailwindLink);

  const CONSENT_VERSION = "2026-07-launch-reset-1";
  const CONSENT_MARKER = "ja-cookiebot-consent-version";
  function setupCookiebotConsentRenewal() {
    const completed = localStorage.getItem(CONSENT_MARKER);
    let renewalRequested = false;
    const requestRenewal = () => {
      if (renewalRequested || completed === CONSENT_VERSION || typeof window.Cookiebot?.renew !== "function") return;
      renewalRequested = true;
      window.Cookiebot.renew();
    };
    const recordChoice = () => localStorage.setItem(CONSENT_MARKER, CONSENT_VERSION);
    window.addEventListener("CookiebotOnLoad", requestRenewal, { once: true });
    window.addEventListener("CookiebotOnAccept", recordChoice);
    window.addEventListener("CookiebotOnDecline", recordChoice);
    if (window.Cookiebot) requestRenewal();
  }

  function ensureFaviconLink(rel, attrs = {}) {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    Object.entries(attrs).forEach(([name, value]) => {
      if (value) link.setAttribute(name, value);
    });
    return link;
  }

  function applySiteFavicons() {
    const version = "20260707-1";
    const base = "/assets/favicons";
    ensureFaviconLink("icon", { href: `${base}/favicon.svg?v=${version}`, type: "image/svg+xml", sizes: "any" });
    ensureFaviconLink("shortcut icon", { href: `${base}/favicon.ico?v=${version}`, type: "image/x-icon" });
    ensureFaviconLink("apple-touch-icon", { href: `${base}/apple-touch-icon.png?v=${version}` });
    ensureFaviconLink("manifest", { href: `${base}/site.webmanifest?v=${version}` });

    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      document.head.appendChild(themeColor);
    }
    themeColor.content = "#1c2e4a";
  }

  applySiteFavicons();
  setupCookiebotConsentRenewal();

  // Handle Theme Toggle
  const initTheme = () => {
    const savedTheme = localStorage.getItem("ja-theme") || "light";
    document.documentElement.dataset.siteTheme = savedTheme;
  };
  initTheme();

  async function loadPartial(target, path) {
    if (!target) return;
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      target.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  }

  function setupThemeToggle() {
    const toggle = document.querySelector("#themeToggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.siteTheme;
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.siteTheme = next;
      localStorage.setItem("ja-theme", next);
    });
  }

  function setupMobileMenu() {
    const toggle = document.querySelector("#siteMenuToggle") || document.querySelector(".menu-toggle");
    const nav = document.querySelector("#siteMobileMenu") || document.querySelector("#siteNav");
    if (!toggle || !nav) return;

    const closeMobileMenu = () => {
      nav.classList.remove("open", "is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };

    toggle.addEventListener("click", () => {
      const isOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("open", isOpen);
      nav.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeMobileMenu();
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".site-header")) return;
      closeMobileMenu();
    });
  }

  function setupNavDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
    if (!dropdowns.length) return;

    const closeDropdown = (dropdown) => {
      const button = dropdown.querySelector(".nav-dropdown-toggle");
      dropdown.classList.remove("open");
      button?.setAttribute("aria-expanded", "false");
    };

    const closeAllDropdowns = (except = null) => {
      dropdowns.forEach((dropdown) => {
        if (dropdown !== except) closeDropdown(dropdown);
      });
    };

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector(".nav-dropdown-toggle");
      const menu = dropdown.querySelector(".nav-dropdown-menu");
      if (!button || !menu) return;

      button.addEventListener("click", (event) => {
        event.preventDefault();
        const shouldOpen = !dropdown.classList.contains("open");
        closeAllDropdowns(dropdown);
        dropdown.classList.toggle("open", shouldOpen);
        button.setAttribute("aria-expanded", String(shouldOpen));
      });

      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => closeDropdown(dropdown));
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".nav-dropdown")) return;
      closeAllDropdowns();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeAllDropdowns();
    });
  }

  function nativeIdentity() {
    const meta = document.querySelector('meta[name="ja-native-identity"]');
    if (!meta?.content) return null;
    try {
      return JSON.parse(meta.content);
    } catch {
      return null;
    }
  }

  async function setupAccountDropdown() {
    let identity = nativeIdentity();
    const actions = document.querySelector(".site-header-actions, .site-nav-actions");
    let accountData = null;
    if (!identity?.email) {
      try {
        const response = await fetch("/account/api/builders", {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" }
        });
        if (response.ok) {
          accountData = await response.json();
          identity = { email: "signed-in-customer", name: "Your account" };
        }
      } catch {
        return;
      }
    }
    if (!identity?.email || !actions) return;
    const label = identity.name || (identity.email === "signed-in-customer" ? "Your account" : identity.email);
    actions.innerHTML = `
      <span class="site-account-name">${escapeHtml(label)}</span>
      <a class="site-button primary" href="/account/dashboard/">Dashboard</a>
    `;

    document.querySelectorAll('.site-mobile-menu a[href="/login/"], .site-footer a[href="/login/"]').forEach((link) => {
      link.href = "/account/dashboard/";
      link.textContent = "Customer portal";
    });
    document.querySelectorAll('.site-mobile-menu a[href*="claim_trial"], .site-footer a[href="/pricing/#trial"]').forEach((link) => {
      link.style.display = "none";
    });

    try {
      if (!accountData) {
        const response = await fetch("/account/api/builders", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
        if (response.ok) accountData = await response.json();
      }
      if (accountData) {
        const data = accountData;
        const hasTrial = data.token_summary?.trial;
        if (hasTrial || data.token_summary?.subscription_active) {
          document.querySelectorAll("a, button").forEach((el) => {
            if (el.textContent.toLowerCase().includes("free trial") || el.href?.includes("claim_trial")) {
              el.style.display = "none";
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  function updateActiveLinks() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll(`[data-nav-page="${page}"]`).forEach(link => {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    });
  }

  await Promise.all([
    loadPartial(headerTarget, "/assets/includes/header.html?v=20260711-airo-nav-1"),
    loadPartial(footerTarget, "/assets/includes/footer.html?v=20260711-tailwind-footer-1")
  ]);

  setupThemeToggle();
  setupMobileMenu();
  setupNavDropdowns();
  await setupAccountDropdown();
  updateActiveLinks();

  [
    "/assets/js/accessibility.js?v=20260715-document-theme-1",
    "/assets/js/support-chat.js?v=20260715-document-theme-1"
  ].forEach((src) => {
    if (document.querySelector(`script[src^="${src.split("?")[0]}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  });

  // Load legacy scripts if needed
  if (!window.JAFreePlanVisibility) {
    const script = document.createElement("script");
    script.src = "/assets/js/free-plan-visibility.js?v=20260629-3";
    script.defer = true;
    document.body.appendChild(script);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseSiteShell, { once: true });
} else {
  initialiseSiteShell();
}
