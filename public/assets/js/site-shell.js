document.addEventListener("DOMContentLoaded", async () => {
  const main = document.querySelector("main");
  const headerTarget = document.querySelector("#siteShellHeader, #site-header");
  const footerTarget = document.querySelector("#siteShellFooter, #site-footer");

  if (main && !main.id) main.id = "main";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  const themeLink = document.querySelector('link[href^="/assets/css/theme.css"]') || document.createElement("link");
  if (!themeLink.parentNode) {
    themeLink.rel = "stylesheet";
    themeLink.href = "/assets/css/theme.css?v=20260709-airo-2";
    document.head.appendChild(themeLink);
  }
  const publicThemeLink = document.querySelector('link[href^="/assets/css/public-saas.css"]') || document.createElement("link");
  if (!publicThemeLink.parentNode) {
    publicThemeLink.rel = "stylesheet";
    publicThemeLink.href = "/assets/css/public-saas.css?v=20260710-partners-1";
    document.head.appendChild(publicThemeLink);
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

  function setupAccountDropdown() {
    const identity = nativeIdentity();
    const actions = document.querySelector(".site-header-actions, .site-nav-actions");
    if (!identity?.email || !actions) return;
    const label = identity.name || identity.email;
    actions.innerHTML = `
      <div class="site-account-menu">
        <button class="site-button primary" type="button" id="siteAccountMenuButton" aria-expanded="false" aria-controls="siteAccountMenu">
          ${escapeHtml(label)}
        </button>
        <div class="site-account-dropdown" id="siteAccountMenu" hidden>
          <a href="/account/profile/">Profile</a>
          <a href="/account/dashboard/">Account</a>
          <a href="/builders/">Builders dashboard</a>
          <a href="/account/logout">Sign out</a>
        </div>
      </div>
    `;
    const button = document.querySelector("#siteAccountMenuButton");
    const menu = document.querySelector("#siteAccountMenu");
    button?.addEventListener("click", () => {
      const next = menu.hidden;
      menu.hidden = !next;
      button.setAttribute("aria-expanded", String(next));
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest(".site-account-menu")) return;
      if (menu) menu.hidden = true;
      button?.setAttribute("aria-expanded", "false");
    });
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
    loadPartial(headerTarget, "/assets/includes/header.html?v=20260710-partners-1"),
    loadPartial(footerTarget, "/assets/includes/footer.html?v=20260709-shell-1")
  ]);

  setupThemeToggle();
  setupMobileMenu();
  setupNavDropdowns();
  setupAccountDropdown();
  updateActiveLinks();

  // Load legacy scripts if needed
  if (!window.JAFreePlanVisibility) {
    const script = document.createElement("script");
    script.src = "/assets/js/free-plan-visibility.js?v=20260629-3";
    script.defer = true;
    document.body.appendChild(script);
  }
});
