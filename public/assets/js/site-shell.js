document.addEventListener("DOMContentLoaded", async () => {
  const main = document.querySelector("main");
  const headerTarget = document.querySelector("#siteShellHeader, #site-header");
  const footerTarget = document.querySelector("#siteShellFooter, #site-footer");

  if (main && !main.id) main.id = "main";

  // Load Theme CSS
  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = "/assets/css/theme.css?v=" + new Date().getTime();
  document.head.appendChild(themeLink);

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
      setupThemeToggle();
      setupMobileMenu();
      updateActiveLinks();
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
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#siteNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
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
    loadPartial(headerTarget, "/assets/includes/header.html?v=20260707-1"),
    loadPartial(footerTarget, "/assets/includes/footer.html?v=20260707-1")
  ]);

  // Load legacy scripts if needed
  if (!window.JAFreePlanVisibility) {
    const script = document.createElement("script");
    script.src = "/assets/js/free-plan-visibility.js?v=20260629-3";
    script.defer = true;
    document.body.appendChild(script);
  }
});
