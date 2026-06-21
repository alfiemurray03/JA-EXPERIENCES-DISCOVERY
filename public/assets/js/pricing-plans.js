(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];
    });
  }

  function getPlanId(link) {
    try {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      return url.searchParams.get("plan") || "";
    } catch {
      return "";
    }
  }

  function featureList(plan) {
    const items = [
      plan.delivery_time ? "Delivery: " + plan.delivery_time : "",
      plan.revisions ? "Includes " + plan.revisions : "",
      plan.plan_type || "",
      Number(plan.payment_available) === 1 ? "Secure Stripe checkout" : "Checkout currently paused"
    ].filter(Boolean);

    return items.map((item) => "<li>" + escapeHtml(item) + "</li>").join("");
  }

  function updateCard(card, plan, link) {
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const price = card.querySelector(".pricing-price strong");
    const priceCaption = card.querySelector(".pricing-price span");
    const features = card.querySelector(".pricing-features");
    const pill = card.querySelector(".pricing-pill");

    if (title) title.textContent = plan.plan_name || title.textContent;
    if (description) description.textContent = plan.description || description.textContent;
    if (price) price.textContent = plan.price_label || price.textContent;
    if (priceCaption) priceCaption.textContent = plan.plan_type || priceCaption.textContent;
    if (features) features.innerHTML = featureList(plan);
    if (pill && Number(plan.is_active) !== 1) pill.textContent = "Currently unavailable";

    card.classList.toggle("featured", Number(plan.is_featured || 0) === 1);
    card.classList.toggle("pricing-card-unavailable", Number(plan.payment_available || 0) !== 1);

    if (Number(plan.payment_available || 0) === 1) {
      link.href = "/create-checkout-session?plan=" + encodeURIComponent(plan.id);
      link.textContent = plan.button_label || "Buy now securely";
      link.removeAttribute("aria-disabled");
      link.classList.remove("disabled");
      return;
    }

    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.classList.add("disabled");
    link.textContent = Number(plan.is_active || 0) === 1 ? "Not connected yet" : "Currently unavailable";
  }

  async function hydratePricing() {
    const links = Array.from(document.querySelectorAll(".stripe-direct-link"));
    if (!links.length) return;

    try {
      const response = await fetch("/plans-data", {
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan data could not be loaded.");

      const plans = new Map((data.plans || []).map((plan) => [plan.id, plan]));
      links.forEach((link) => {
        const plan = plans.get(getPlanId(link));
        const card = link.closest(".pricing-card");
        if (plan && card) updateCard(card, plan, link);
      });
    } catch {
      links.forEach((link) => {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
        link.classList.add("disabled");
        link.textContent = "Not connected yet";
      });
    }
  }

  document.addEventListener("click", function (event) {
    const disabledLink = event.target.closest(".stripe-direct-link.disabled");
    if (disabledLink) event.preventDefault();
  });

  document.addEventListener("DOMContentLoaded", hydratePricing);
})();
