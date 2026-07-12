(function () {
  "use strict";

  var DEFAULTS = {
    platformName: "JA Plan Studio",
    headline: "Coming Soon",
    subtext: "We are putting the finishing touches on something great.",
    description: "JA Plan Studio is a self-service experience planning platform that helps you build, save and manage everyday, travel and support planning outputs.",
    features: [
      "Guided Experience Builders",
      "Guided planning tools",
      "Saved Plans and outputs",
      "Destination discovery tools",
      "Accessibility and support planning",
      "Membership plans and add-ons"
    ]
  };
  var timer = null;

  function byId(id) { return document.getElementById(id); }
  function setText(id, value) {
    var element = byId(id);
    if (element && typeof value === "string" && value.trim()) element.textContent = value;
  }
  function pad(value) { return String(Math.max(0, Number(value) || 0)).padStart(2, "0"); }
  function setFallback(message) {
    var fallback = byId("countdownFallback");
    if (!fallback) return;
    fallback.textContent = message;
    fallback.classList.remove("hidden");
  }
  function hideFallback() {
    var fallback = byId("countdownFallback");
    if (fallback) fallback.classList.add("hidden");
  }
  function hideCountdown() {
    var wrap = byId("countdownWrap");
    if (wrap) wrap.classList.add("hidden");
    if (timer) { clearInterval(timer); timer = null; }
  }
  function getCountdown(targetTime) {
    var diff = targetTime - Date.now();
    if (diff <= 0) return { expired: true };
    var totalSeconds = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      expired: false
    };
  }
  function renderCountdown(targetIso) {
    hideCountdown();
    hideFallback();
    if (typeof targetIso !== "string" || !targetIso.trim()) return;
    var targetTime = new Date(targetIso).getTime();
    if (!Number.isFinite(targetTime)) {
      setFallback("The launch countdown is currently unavailable.");
      return;
    }
    var wrap = byId("countdownWrap");
    var complete = byId("countdownComplete");
    var countdown = wrap && wrap.querySelector(".countdown");
    var valueElements = [byId("days"), byId("hours"), byId("minutes"), byId("seconds")];
    if (!wrap || !complete || !countdown || valueElements.some(function (element) { return !element; })) {
      setFallback("The launch countdown is currently unavailable.");
      return;
    }

    function tick() {
      var parts = getCountdown(targetTime);
      if (parts.expired) {
        countdown.classList.add("hidden");
        complete.classList.remove("hidden");
        wrap.classList.remove("hidden");
        if (timer) { clearInterval(timer); timer = null; }
        return;
      }
      valueElements[0].textContent = pad(parts.days);
      valueElements[1].textContent = pad(parts.hours);
      valueElements[2].textContent = pad(parts.minutes);
      valueElements[3].textContent = pad(parts.seconds);
      complete.classList.add("hidden");
      countdown.classList.remove("hidden");
      wrap.classList.remove("hidden");
    }

    tick();
    if (targetTime > Date.now()) timer = setInterval(tick, 1000);
  }
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character];
    });
  }
  function checkIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
  }
  function renderFeatures(features) {
    var list = byId("featureList");
    if (!list) return;
    var safeFeatures = Array.isArray(features) && features.length ? features : DEFAULTS.features;
    list.innerHTML = safeFeatures.map(function (feature) {
      return '<div class="feature-card">' + checkIcon() + "<span>" + escapeHtml(feature) + "</span></div>";
    }).join("");
  }
  function applyContent(config) {
    var data = Object.assign({}, DEFAULTS, config || {});
    setText("brandEyebrow", data.platformName);
    setText("comingSoonTitle", data.headline);
    setText("comingSoonSubtext", data.subtext);
    setText("comingSoonDescription", data.description);
    document.title = (data.headline || DEFAULTS.headline) + " — JA Plan Studio";
    try { renderFeatures(data.features); } catch (_) { renderFeatures(DEFAULTS.features); }
    try { renderCountdown(data.countdownEnabled === true ? data.launchDate : ""); } catch (_) {
      hideCountdown();
      setFallback("The launch countdown is currently unavailable.");
    }
  }

  renderFeatures(DEFAULTS.features);
  fetch("/api/coming-soon-config", {
    cache: "no-store",
    headers: { "Accept": "application/json", "Cache-Control": "no-cache" }
  }).then(function (response) {
    if (!response.ok || !(response.headers.get("content-type") || "").includes("application/json")) throw new Error("Invalid response");
    return response.json();
  }).then(function (data) {
    if (!data || data.success === false) throw new Error("Unavailable configuration");
    applyContent(data);
  }).catch(function () {
    applyContent(DEFAULTS);
    setFallback("The launch countdown is currently unavailable. Please check back shortly.");
  });
})();
