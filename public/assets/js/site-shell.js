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

  let siteSettings = { branding: {}, theme: document.documentElement.dataset.siteTheme || "dark" };

  try {
    const settingsResponse = await fetch("/site-settings", { cache: "no-store" });
    if (settingsResponse.ok) siteSettings = await settingsResponse.json();
    if (siteSettings.theme) document.documentElement.dataset.siteTheme = siteSettings.theme;
  } catch (error) {
    console.warn("Site settings unavailable", error);
  }

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

  const branding = siteSettings.branding || {};
  const serviceName = branding.service_name || branding.trading_name || "JA Experiences & Discovery";
  document.querySelectorAll(".brand-name, [data-brand-name]").forEach((element) => {
    element.textContent = serviceName;
  });
  document.querySelectorAll("[data-footer-notice]").forEach((element) => {
    element.textContent = branding.footer_notice || "JA Experiences & Discovery is operated by JA Group Services Ltd.";
  });

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









/* JA Secure Access header account label loader */
(function () {
  function loadAccessHeaderScript() {
    if (document.querySelector('script[src*="/assets/js/access-header.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "/assets/js/access-header.js?v=20260621-20";
    script.defer = true;
    document.body.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAccessHeaderScript);
  } else {
    loadAccessHeaderScript();
  }
})();
