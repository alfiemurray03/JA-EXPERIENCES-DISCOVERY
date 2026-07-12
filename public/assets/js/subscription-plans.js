(function () {
  "use strict";
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character];
    });
  }
  function planCard(plan) {
    var action = "/create-checkout-session?plan=" + encodeURIComponent(plan.id);
    var label = plan.button_label || "Choose plan";
    return '<article class="pricing-live-card ' + (plan.is_featured ? "is-featured" : "") + '">' +
      (plan.is_featured ? '<span class="pricing-popular">Most popular</span>' : "") +
      '<p class="text-xs font-semibold uppercase tracking-wide text-muted">' + escapeHtml(plan.plan_type || "Subscription") + '</p>' +
      '<h2 class="mt-2 text-xl font-semibold">' + escapeHtml(plan.plan_name) + '</h2>' +
      '<p class="mt-4 text-3xl font-semibold">' + escapeHtml(plan.price_label || "") + '</p>' +
      '<p class="mt-4 text-sm leading-6 text-muted">' + escapeHtml(plan.description || "") + '</p>' +
      '<ul class="pricing-live-features"><li>Paid membership access</li><li>Account usage and billing records</li><li>Secure Stripe checkout</li></ul>' +
      '<a class="btn btn-primary mt-6 w-full" href="' + action + '">' + escapeHtml(label) + '</a></article>';
  }
  document.addEventListener("DOMContentLoaded", function () {
    var lists = Array.from(document.querySelectorAll("[data-subscription-plans], #subscriptionPlans"));
    if (!lists.length) return;
    fetch("/plans-data", { cache: "no-store", headers: { Accept: "application/json" } })
      .then(function (response) { if (!response.ok) throw new Error("Plans unavailable"); return response.json(); })
      .then(function (data) {
        var plans = (Array.isArray(data.plans) ? data.plans : []).filter(function (plan) { return Number(plan.price_pence || 0) > 0; });
        if (!plans.length) throw new Error("No active plans");
        lists.forEach(function (list) { list.innerHTML = plans.map(planCard).join(""); });
      })
      .catch(function () {
        lists.forEach(function (list) {
          list.innerHTML = '<p class="col-span-full rounded-xl border border-line bg-white p-5 text-sm text-muted">Subscription Plans are temporarily unavailable. Please contact us for assistance.</p>';
        });
      });
  });
})();
