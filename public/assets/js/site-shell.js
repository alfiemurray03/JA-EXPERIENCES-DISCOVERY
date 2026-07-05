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
    const version = "20260704-1";
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
    themeColor.content = "#0f2f57";
  }

  function loadSharedScript(path) {
    if (document.querySelector(`script[src^="${path}"]`)) return;

    const script = document.createElement("script");
    script.src = path;
    script.defer = true;
    document.body.appendChild(script);
  }

  loadSharedStyles("/assets/includes/header.css?v=20260702-1");
  loadSharedStyles("/assets/includes/footer.css?v=20260702-1");
  applySiteFavicons();

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
      loadPartial(headerTarget, "/assets/includes/header.html?v=20260702-1"),
      loadPartial(footerTarget, "/assets/includes/footer.html?v=20260702-1")
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
  const brandText = branding.public_brand_text || "Curated discovery, planning and experience guidance.";
  const currentTitle = document.title || "";
  if (currentTitle.includes("JA Experiences & Discovery")) {
    document.title = currentTitle.replaceAll("JA Experiences & Discovery", serviceName);
  }
  if (branding.favicon_url) {
    const favicon = ensureFaviconLink("icon", { href: branding.favicon_url, type: "image/svg+xml" });
    favicon.href = branding.favicon_url;
  }
  if (branding.logo_url) {
    document.querySelectorAll(".service-mark, .footer-service-mark").forEach((element) => {
      element.replaceChildren();
      const image = document.createElement("img");
      image.src = branding.logo_url;
      image.alt = `${serviceName} logo`;
      element.appendChild(image);
      element.classList.add("has-logo");
    });
  }
  document.querySelectorAll(".brand-name, [data-brand-name], .service-brand-text strong, .footer-service-brand-text strong").forEach((element) => {
    element.textContent = serviceName;
  });
  document.querySelectorAll("[data-brand-text]").forEach((element) => {
    element.textContent = brandText;
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

  if (window.JAFreePlanVisibility && typeof window.JAFreePlanVisibility.load === "function") {
    window.JAFreePlanVisibility.load();
  } else {
    loadSharedScript("/assets/js/free-plan-visibility.js?v=20260629-3");
  }

  initCookieConsent();
});

function initCookieConsent() {
  const CONSENT_KEY = "ja-cookie-consent";
  const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // To be replaced with actual ID

  const getConsent = () => {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY));
    } catch {
      return null;
    }
  };

  const setConsent = (consent) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
  };

  const applyConsent = (consent) => {
    if (consent?.analytics) {
      loadGoogleAnalytics();
    } else {
      disableGoogleAnalytics();
    }
  };

  const loadGoogleAnalytics = () => {
    if (window.ga_loaded) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { 'anonymize_ip': true });
    window.ga_loaded = true;
  };

  const disableGoogleAnalytics = () => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  };

  const renderBanner = () => {
    if (getConsent()) {
      applyConsent(getConsent());
      return;
    }

    const banner = document.createElement("div");
    banner.id = "cookieConsentBanner";
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <div class="container">
        <div class="cookie-content">
          <h3>Cookie Consent</h3>
          <p>We use cookies to enhance your browsing experience and analyze our traffic. Essential cookies are always enabled.</p>
          <div class="cookie-actions">
            <button id="acceptAllCookies" class="clean-button primary">Accept All</button>
            <button id="rejectNonEssentialCookies" class="clean-button secondary">Reject Non-Essential</button>
            <button id="manageCookiePrefs" class="clean-button secondary">Manage Preferences</button>
          </div>
        </div>
        <div id="cookiePrefs" class="cookie-prefs" hidden>
          <label><input type="checkbox" checked disabled> Essential (Always On)</label>
          <label><input type="checkbox" id="analyticsConsent"> Analytics</label>
          <button id="saveCookiePrefs" class="clean-button primary">Save Preferences</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("acceptAllCookies").onclick = () => {
      setConsent({ essential: true, analytics: true });
      banner.remove();
    };

    document.getElementById("rejectNonEssentialCookies").onclick = () => {
      setConsent({ essential: true, analytics: false });
      banner.remove();
    };

    document.getElementById("manageCookiePrefs").onclick = () => {
      document.getElementById("cookiePrefs").hidden = false;
    };

    document.getElementById("saveCookiePrefs").onclick = () => {
      setConsent({
        essential: true,
        analytics: document.getElementById("analyticsConsent").checked
      });
      banner.remove();
    };
  };

  renderBanner();

  // Add "Manage Cookies" to footer if possible
  const footer = document.querySelector("#site-footer, #siteShellFooter");
  if (footer) {
    const manageBtn = document.createElement("button");
    manageBtn.textContent = "Manage Cookie Preferences";
    manageBtn.className = "manage-cookies-link";
    manageBtn.style.cssText = "background:none;border:none;color:inherit;font:inherit;cursor:pointer;text-decoration:underline;padding:0;margin-top:1rem;display:block;";
    manageBtn.onclick = () => {
      localStorage.removeItem(CONSENT_KEY);
      renderBanner();
    };
    footer.appendChild(manageBtn);
  }
}









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
