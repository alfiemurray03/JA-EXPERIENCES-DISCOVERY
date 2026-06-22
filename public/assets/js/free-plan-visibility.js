(function () {
  if (window.JAFreePlanVisibility && window.JAFreePlanVisibility.ready) return;

  function setFreePlanVisibility(showFreePlan) {
    document.querySelectorAll("[data-free-plan-public]").forEach(function (element) {
      element.hidden = !showFreePlan;
      element.setAttribute("aria-hidden", showFreePlan ? "false" : "true");
    });

    document.querySelectorAll('a[href="/enquiry/"]').forEach(function (link) {
      if (!/free/i.test(link.textContent || "")) return;
      const target = link.closest(".cta-band") || link;
      target.hidden = !showFreePlan;
      target.setAttribute("aria-hidden", showFreePlan ? "false" : "true");
    });

    document.querySelectorAll("[data-free-plan-hidden]").forEach(function (element) {
      element.hidden = showFreePlan;
      element.setAttribute("aria-hidden", showFreePlan ? "true" : "false");
    });
  }

  async function loadFreePlanVisibility() {
    try {
      const response = await fetch("/plans-data", {
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan data could not be loaded.");
      setFreePlanVisibility(data.show_free_plan !== false);
    } catch {
      // Leave static content visible if settings cannot be reached.
    }
  }

  window.JAFreePlanVisibility = {
    apply: setFreePlanVisibility,
    load: loadFreePlanVisibility,
    ready: true
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadFreePlanVisibility);
  } else {
    loadFreePlanVisibility();
  }
})();
