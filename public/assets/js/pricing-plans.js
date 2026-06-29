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
    try {
      const response = await fetch("/plans-data", {
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan data could not be loaded.");

      renderPricing(data);
    } catch {
      renderPricing({ plans: [], show_free_plan: false });
    }
  }

  function renderPricing(data) {
    const showFreePlan = data.show_free_plan !== false;
    const plans = Array.isArray(data.plans) ? data.plans : [];
    const standardPlans = plans.filter((plan) => !isFreePlan(plan) && String(plan.plan_type || "").toLowerCase() !== "social tariff");
    const socialPlans = plans.filter((plan) => String(plan.plan_type || "").toLowerCase() === "social tariff");
    const freePlan = plans.find((plan) => isFreePlan(plan));

    applyFreePlanVisibility(showFreePlan);
    renderSummary(showFreePlan, freePlan, standardPlans, socialPlans);
    renderGrid(document.getElementById("pricingStandardGrid"), standardPlans, false);
    renderGrid(document.getElementById("pricingSocialGrid"), socialPlans, true);
  }

  function renderSummary(showFreePlan, freePlan, standardPlans, socialPlans) {
    const heroCopy = document.getElementById("pricingHeroCopy");
    const beforeCopy = document.getElementById("pricingBeforeYouBuy");
    const finalCopy = document.getElementById("pricingFinalCopy");
    const freeCta = document.getElementById("pricingFreeCta");
    const finalCta = document.getElementById("pricingFinalCta");
    const strip = document.getElementById("pricingStrip");

    if (heroCopy) {
      heroCopy.textContent = showFreePlan
        ? "Start with a free enquiry, or buy a paid guidance plan securely through Stripe. JA Experiences & Discovery provides guidance and planning support only."
        : "Choose from the available paid guidance plans securely through Stripe. JA Experiences & Discovery provides guidance and planning support only.";
    }

    if (beforeCopy) {
      beforeCopy.textContent = showFreePlan
        ? "If you are unsure which plan fits your request, start with the free enquiry. We can point you towards the right level of support before you pay."
        : "If you are unsure which plan fits your request, review the paid plans above or contact JA Experiences & Discovery for help choosing the right support route.";
    }

    if (finalCopy) {
      finalCopy.textContent = showFreePlan
        ? "Choose a paid plan above, or start with the free enquiry if you need help choosing the right service."
        : "Choose the paid plan that best fits your request.";
    }

    if (freeCta) {
      freeCta.hidden = !showFreePlan;
    }

    if (finalCta) {
      finalCta.hidden = !showFreePlan;
    }

    if (strip) {
      const items = [];
      if (showFreePlan && freePlan) items.push(summaryItem(freePlan.price_label || "£0", "Free enquiry"));
      if (standardPlans.length) items.push(summaryItem("From £49", "Standard plans"));
      if (socialPlans.length) items.push(summaryItem("From £29", "Social tariff"));
      items.push(summaryItem("Email/PDF", "Written delivery"));
      strip.replaceChildren(...items);
    }
  }

  function renderGrid(container, plans, social) {
    if (!container) return;
    if (!plans.length) {
      container.replaceChildren(summaryItem("No plans available", "Please try again shortly."));
      return;
    }

    container.replaceChildren(...plans.map((plan, index) => createPlanCard(plan, social, index)));
  }

  function summaryItem(value, label) {
    const item = document.createElement("div");
    item.className = "pricing-strip-item";
    item.innerHTML = `<strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span>`;
    return item;
  }

  function createPlanCard(plan, social, index) {
    const article = document.createElement("article");
    article.className = `pricing-card${index === 0 && !social ? " featured" : ""}`;
    const active = Number(plan.is_active || 0) === 1;
    article.innerHTML = `
      <span class="pricing-pill">${escapeHtml(plan.plan_type || (social ? "Social tariff" : "Service plan"))}</span>
      <h3>${escapeHtml(plan.plan_name || "Service plan")}</h3>
      <p>${escapeHtml(plan.description || "")}</p>
      <div class="pricing-price">
        <strong>${escapeHtml(plan.price_label || "Price on request")}</strong>
        <span>${escapeHtml(plan.plan_type || "")}</span>
      </div>
      <ul class="pricing-features">
        ${plan.delivery_time ? `<li>Delivery: ${escapeHtml(plan.delivery_time)}</li>` : ""}
        ${plan.revisions ? `<li>Includes ${escapeHtml(plan.revisions)}</li>` : ""}
        <li>${escapeHtml(social ? "Minimum evidence requested" : "Secure Stripe checkout")}</li>
      </ul>
      ${active && plan.payment_available ? `<a class="pricing-button ${index === 0 && !social ? "orange" : ""} stripe-direct-link" href="/create-checkout-session?plan=${encodeURIComponent(plan.id)}">${escapeHtml(plan.button_label || "Buy now securely")}</a>` : `<span class="pricing-button disabled" aria-disabled="true">Currently unavailable</span>`}
      ${social ? '<a class="pricing-small-link" href="/social-tariff/">Read social tariff terms</a>' : ""}
    `;
    return article;
  }

  function applyFreePlanVisibility(showFreePlan) {
    if (window.JAFreePlanVisibility && typeof window.JAFreePlanVisibility.apply === "function") {
      window.JAFreePlanVisibility.apply(showFreePlan);
    }
  }

  function isFreePlan(plan) {
    const text = `${plan.id || ""} ${plan.plan_name || ""} ${plan.plan_type || ""} ${plan.price_label || ""}`.toLowerCase();
    return text.includes("free") || Number(plan.price_pence || 0) === 0;
  }

  document.addEventListener("click", function (event) {
    const disabledLink = event.target.closest(".stripe-direct-link.disabled");
    if (disabledLink) event.preventDefault();
  });

  document.addEventListener("DOMContentLoaded", hydratePricing);
})();
