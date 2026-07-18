(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const pad = (value) => String(Math.max(0, Number(value) || 0)).padStart(2, "0");
  const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>';
  const brandIcon = '<rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 8h8M8 12h8M8 16h5"></path>';
  let countdownTimer = null;

  function straightenBrandMark() {
    const icon = document.querySelector(".brand-mark svg");
    if (!icon) return;

    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.innerHTML = brandIcon;
    icon.style.display = "block";
    icon.style.transform = "none";
  }

  function setText(id, value) {
    const element = byId(id);
    if (element && typeof value === "string" && value.trim()) element.textContent = value.trim();
  }

  function renderFeatures(features) {
    const list = byId("coming-soon-features");
    if (!list || !Array.isArray(features)) return;
    const values = features.map((item) => String(item || "").trim()).filter(Boolean);
    if (!values.length) return;

    list.replaceChildren(...values.map((value) => {
      const item = document.createElement("li");
      item.className = "feature";
      item.innerHTML = checkIcon;
      const text = document.createElement("span");
      text.textContent = value;
      item.append(text);
      return item;
    }));
  }

  function stopCountdown() {
    if (countdownTimer) window.clearInterval(countdownTimer);
    countdownTimer = null;
  }

  function startCountdown(launchDate, enabled) {
    const countdown = byId("countdown");
    if (!countdown) return;

    stopCountdown();
    const target = launchDate ? new Date(launchDate).getTime() : Number.NaN;
    if (!enabled || !launchDate || Number.isNaN(target)) {
      countdown.hidden = true;
      return;
    }

    function tick() {
      const remaining = target - Date.now();
      if (remaining <= 0) {
        countdown.hidden = true;
        stopCountdown();
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      setText("days", pad(Math.floor(totalSeconds / 86400)));
      setText("hours", pad(Math.floor((totalSeconds % 86400) / 3600)));
      setText("minutes", pad(Math.floor((totalSeconds % 3600) / 60)));
      setText("seconds", pad(totalSeconds % 60));
      countdown.hidden = false;
    }

    tick();
    countdownTimer = window.setInterval(tick, 1000);
  }

  async function loadConfiguration() {
    try {
      const response = await fetch("/api/coming-soon-config", {
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!response.ok) return;
      const config = await response.json();
      if (!config || config.success === false) return;

      setText("platform-name", config.platformName || "JA Plan Studio");
      setText("coming-soon-title", config.headline || "Coming Soon");
      setText("coming-soon-subtext", config.subtext || "We are putting the finishing touches on something great.");
      setText("coming-soon-description", config.description || "");
      renderFeatures(config.features);
      startCountdown(config.launchDate, config.countdownEnabled === true);

      const title = String(config.headline || "Coming Soon").trim();
      document.title = `${title} — ${String(config.platformName || "JA Plan Studio").trim()}`;
    } catch (error) {
      console.warn("Coming Soon configuration could not be loaded.", error instanceof Error ? error.message : error);
    }
  }

  async function loadBrowserBranding() {
    for (const endpoint of ["/site-settings", "/api/site-settings/public"]) {
      try {
        const response = await fetch(endpoint, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "same-origin"
        });
        if (!response.ok) continue;
        const data = await response.json();
        const tabName = String(data.browser?.tab_name || data.settings?.browser_tab_name || "JA Plan Studio").trim();
        const faviconUrl = String(data.browser?.favicon_url || data.settings?.favicon_url || "").trim();
        if (faviconUrl) {
          document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]').forEach((link) => {
            link.href = faviconUrl;
          });
        }
        const headline = String(byId("coming-soon-title")?.textContent || "Coming Soon").trim();
        document.title = `${headline} — ${tabName || "JA Plan Studio"}`;
        return;
      } catch {
        // Try the next public settings endpoint.
      }
    }
  }

  async function initialisePage() {
    straightenBrandMark();
    await loadConfiguration();
    await loadBrowserBranding();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisePage, { once: true });
  } else {
    void initialisePage();
  }
})();
