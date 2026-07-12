const PUBLIC_BUILDERS = [
  ["day-trip", "Day Trip Builder", "Small", "Everyday Experience Builders", 10, "trial", "Build a practical day trip outline with timings, budget prompts and checklist notes."],
  ["family-day-out", "Family Day Out Builder", "Standard", "Everyday Experience Builders", 15, "trial", "Plan a family day out with pace, facilities, accessibility and weather alternatives."],
  ["school-holiday", "School Holiday Planner", "Standard", "Everyday Experience Builders", 15, "paid", "Organise school holiday ideas across dates, budgets and family priorities."],
  ["occasion", "Occasion Planner", "Standard", "Everyday Experience Builders", 15, "paid", "Plan a birthday, anniversary or special occasion with tasks and provider checks."],
  ["local-discovery", "Local Discovery Builder", "Small", "Everyday Experience Builders", 10, "trial", "Create a local discovery shortlist with suitability checks."],
  ["budget-experience", "Budget Experience Builder", "Small", "Everyday Experience Builders", 10, "paid", "Shape ideas around a realistic budget and priority list."],
  ["rainy-day", "Rainy Day Plan Builder", "Small", "Everyday Experience Builders", 10, "paid", "Prepare an indoor or weather-resilient plan."],
  ["date-night", "Date Night Builder", "Small", "Everyday Experience Builders", 10, "paid", "Build a date-night plan with timings, budget and booking prompts."],
  ["birthday-plan", "Birthday Plan Builder", "Standard", "Everyday Experience Builders", 15, "paid", "Create a birthday plan with guests, venue checks and tasks."],
  ["travel-itinerary", "Travel Itinerary Builder", "Travel", "Travel Experience Builders", 35, "paid", "Create a self-service travel itinerary outline and checklist."],
  ["country-brief", "Country Travel Brief Builder", "Travel", "Travel Experience Builders", 35, "paid", "Summarise official-source checks a member should complete before travel."],
  ["europe-entry", "Europe Entry Readiness Builder", "Travel", "Travel Experience Builders", 35, "paid", "Organise Europe entry-readiness prompts without immigration advice."],
  ["travel-checklist", "Travel Checklist Builder", "Travel", "Travel Experience Builders", 35, "paid", "Build a travel checklist for documents, packing, operator checks and responsibilities."],
  ["tube-notes", "Tube Planning Notes Builder", "Travel", "Travel Experience Builders", 35, "paid", "Create general Tube planning notes; customers must check operators before travel."],
  ["bus-notes", "Bus Planning Notes Builder", "Travel", "Travel Experience Builders", 35, "paid", "Create general bus planning notes; customers must check operators before travel."],
  ["destination-board", "Destination Board Builder", "Travel", "Travel Experience Builders", 35, "paid", "Create a destination board with ideas, notes and provider checks."],
  ["airport-assistance", "Airport Assistance Request Builder", "Accessibility/support", "Accessibility and Support Builders", 40, "paid", "Prepare general assistance request notes for the customer to check with providers."],
  ["accessible-travel-checklist", "Accessible Travel Checklist", "Accessibility/support", "Accessibility and Support Builders", 35, "paid", "Build a general accessible travel planning checklist."],
  ["mobility-equipment", "Mobility Equipment Planner", "Accessibility/support", "Accessibility and Support Builders", 40, "paid", "Organise mobility equipment planning prompts without medical or safety advice."],
  ["hidden-disabilities", "Hidden Disabilities Support Planner", "Accessibility/support", "Accessibility and Support Builders", 40, "paid", "Prepare general hidden-disability support planning notes."],
  ["accessible-destination", "Accessible Destination Checklist", "Accessibility/support", "Accessibility and Support Builders", 35, "paid", "Create accessibility checks for destinations and providers."],
  ["accessible-venue-questions", "Accessible Venue Questions Builder", "Accessibility/support", "Accessibility and Support Builders", 35, "paid", "Prepare questions to ask venues directly."],
  ["support-confirmation", "Support Confirmation Tracker", "Accessibility/support", "Accessibility and Support Builders", 35, "paid", "Track support confirmations and follow-up tasks."],
  ["my-plans", "My Plans", "Organisation", "Organisation Tools", 0, "trial", "View and organise saved plans."],
  ["my-discovery-boards", "My Discovery Boards", "Organisation", "Organisation Tools", 0, "trial", "View and organise discovery boards."],
  ["saved-experiences", "Saved Experiences", "Organisation", "Organisation Tools", 0, "trial", "View saved experiences."],
  ["budget-planner", "Budget Planner", "Small", "Organisation Tools", 10, "paid", "Create a simple budget planning output."],
  ["booking-tracker", "Booking Tracker", "Small", "Organisation Tools", 10, "paid", "Create a booking tracker output for member-managed bookings."],
  ["checklists", "Checklists", "Small", "Organisation Tools", 10, "trial", "Create a reusable checklist."]
].map(([id, name, builder_type, category, token_cost, visibility, description]) => ({
  id,
  name,
  builder_type,
  category,
  token_cost,
  visibility,
  status: "Active",
  description
}));

const builderState = {
  builders: PUBLIC_BUILDERS,
  outputs: [],
  summary: null,
  selected: null,
  signedIn: false,
  loadingAuth: true,
  saving: false,
  activatingTrial: false,
  filter: "all",
  search: "",
  requestId: ""
  ,wizardStep: 1
};

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const loginUrl = "/account/login/?return_to=%2Fbuilders%2F%3Fclaim_trial%3D1";

function categoryGroup(builder) {
  if (String(builder.builder_type).includes("Travel")) return "Travel";
  if (String(builder.builder_type).includes("Accessibility")) return "Accessibility/support";
  if (String(builder.category).includes("Organisation")) return "Organisation";
  return "Everyday";
}

function iconText(builder) {
  if (categoryGroup(builder) === "Travel") return "TR";
  if (categoryGroup(builder) === "Accessibility/support") return "AS";
  if (categoryGroup(builder) === "Organisation") return "OT";
  return "EB";
}

function statusClass(kind = "") {
  if (kind === "success") return "builder-alert builder-alert-success";
  if (kind === "error") return "builder-alert builder-alert-error";
  if (kind === "info") return "builder-alert builder-alert-info";
  return "builder-alert";
}

function showStatus(message, kind = "info") {
  const status = $("builderStatus");
  if (!status) return;
  status.hidden = !message;
  status.className = statusClass(kind);
  status.textContent = message || "";
}

function showStatusHtml(html, kind = "info") {
  const status = $("builderStatus");
  if (!status) return;
  status.hidden = !html;
  status.className = statusClass(kind);
  status.innerHTML = html || "";
}

function renderSummary(summary = builderState.summary) {
  const active = summary?.trial_active;
  $("availableBuilderCount").textContent = String(builderState.builders.length);
  $("tokensRemaining").textContent = builderState.signedIn ? String(summary?.remaining_tokens ?? 0) : "Sign in";
  $("trialStatus").textContent = builderState.signedIn ? (active ? "Active" : summary?.trial ? "Expired/used" : "Not active") : "Not signed in";
  $("savedOutputCount").textContent = builderState.signedIn ? String(builderState.outputs.length) : "Sign in";
  const createAccountLink = $("createAccountTrialLink");
  if (createAccountLink) createAccountLink.hidden = builderState.signedIn;
}

function renderBuilders() {
  const skeleton = $("builderSkeleton");
  const grid = $("builderGrid");
  if (skeleton) skeleton.hidden = true;
  const filtered = builderState.builders.filter((builder) => {
    const categoryMatch = builderState.filter === "all" || categoryGroup(builder) === builderState.filter;
    const haystack = `${builder.name} ${builder.description} ${builder.category} ${builder.builder_type}`.toLowerCase();
    return categoryMatch && (!builderState.search || haystack.includes(builderState.search));
  });
  grid.innerHTML = filtered.map((builder) => `
    <article class="builder-card">
      <div class="builder-card-top">
        <div class="builder-icon">${esc(iconText(builder))}</div>
        <div>
          <span class="builder-card-category">${esc(categoryGroup(builder))}</span>
          <h3>${esc(builder.name)}</h3>
          <p>${esc(builder.description || "")}</p>
        </div>
      </div>
      <div class="builder-card-output"><small>You'll create</small><span>${esc(builder.description || "A practical personalised planning output.")}</span></div>
      <div class="builder-card-meta"><span>◷ ${builder.token_cost >= 35 ? "10" : builder.token_cost >= 15 ? "7" : "5"} min</span><span>ϟ ${esc(String(builder.token_cost ?? 0))} tokens</span></div>
      <div class="builder-card-badges"><span class="builder-badge ${builder.visibility === "trial" ? "builder-badge-success" : "builder-badge-primary"}">${builder.visibility === "trial" ? "Free Trial" : "Paid plan"}</span></div>
      <button class="builder-card-action" type="button" data-builder="${esc(builder.id)}">Start Builder →</button>
    </article>
  `).join("");
  if (!filtered.length) {
    grid.innerHTML = `<div class="builder-alert">No builders match this category.</div>`;
  }
  renderSummary();
}

async function loadAuthenticatedBuilders() {
  try {
    const response = await fetch("/account/api/builders", {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      builderState.signedIn = false;
      builderState.loadingAuth = false;
      builderState.builders = PUBLIC_BUILDERS;
      builderState.outputs = [];
      builderState.summary = null;
      showStatusHtml('You can browse the builder catalogue while signed out. Sign in or create an account to claim the once-only 14-day trial and save finished outputs.', "info");
      return;
    }
    if (!response.ok) throw new Error(data.error || "Builder account data could not be loaded.");
    builderState.signedIn = true;
    builderState.loadingAuth = false;
    builderState.builders = Array.isArray(data.builders) && data.builders.length ? data.builders : PUBLIC_BUILDERS;
    builderState.outputs = Array.isArray(data.outputs) ? data.outputs : [];
    builderState.summary = data.token_summary || {};
    showStatus("", "info");
    if (builderState.summary?.trial && !builderState.summary?.trial_active) {
      showStatusHtml('A free trial has already been used on this customer account. Your free trial has expired. <a href="/pricing/">View Plans</a> or <a href="/account/subscription/">Upgrade Membership</a>.', "info");
    }
    if (new URLSearchParams(window.location.search).get("claim_trial") === "1" && !builderState.summary?.trial) {
      $("claimIntentNotice").hidden = false;
      $("claimTrialButton")?.focus();
    } else {
      $("claimIntentNotice").hidden = true;
    }
    if (builderState.signedIn) {
      document.querySelectorAll(".builder-head-actions a, .builder-head-actions button").forEach((btn) => {
        if (btn.textContent.toLowerCase().includes("free trial") || btn.textContent.toLowerCase().includes("start free trial") || btn.href.includes("claim_trial")) {
          btn.style.display = "none";
        }
      });
      const heroCard = document.querySelector(".builder-hero-card");
      if (heroCard) heroCard.style.display = "none";
    }
  } catch (error) {
    builderState.signedIn = false;
    builderState.loadingAuth = false;
    builderState.builders = PUBLIC_BUILDERS;
    showStatus("Browse the public builder catalogue. Sign in when you are ready to start and save an output.", "info");
  } finally {
    renderBuilders();
    renderSummary();
  }
}

function selectBuilder(id) {
  const builder = builderState.builders.find((item) => item.id === id) || PUBLIC_BUILDERS.find((item) => item.id === id);
  if (!builder) return;
  if (!builderState.signedIn) {
    window.location.href = loginUrl;
    return;
  }
  builderState.selected = builder;
  builderState.requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  $("selectedBuilderId").value = builder.id;
  $("selectedBuilderIcon").textContent = iconText(builder);
  $("selectedBuilderName").textContent = builder.name;
  $("selectedBuilderDescription").textContent = builder.description || "Complete the guided fields and preview before saving.";
  $("selectedBuilderCost").textContent = `${builder.token_cost ?? 0} Builder Usage Tokens`;
  $("builderFormStatus").textContent = "Builder opened. No tokens have been deducted.";
  setWizardStep(1);
  $("builderEditor").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setWizardStep(step) {
  builderState.wizardStep = Math.max(1, Math.min(4, Number(step) || 1));
  const fieldSteps = { builderTitle: 1, builderIdea: 1, builderTiming: 2, builderBudget: 2, builderSupport: 3, builderNotes: 3 };
  Object.entries(fieldSteps).forEach(([id, fieldStep]) => {
    const label = $(id)?.closest("label");
    if (label) label.hidden = fieldStep !== builderState.wizardStep;
  });
  document.querySelectorAll("[data-wizard-marker]").forEach((marker) => marker.classList.toggle("is-active", Number(marker.dataset.wizardMarker) <= builderState.wizardStep));
  $("builderBackButton").hidden = builderState.wizardStep === 1;
  $("builderContinueButton").hidden = builderState.wizardStep === 4;
  $("previewBuilderButton").hidden = builderState.wizardStep !== 4;
  $("saveBuilderButton").hidden = builderState.wizardStep !== 4;
  document.querySelector(".builder-preview-panel")?.classList.toggle("is-reviewing", builderState.wizardStep === 4);
  if (builderState.wizardStep === 4) buildPreview();
}

function collectFields() {
  return {
    idea: $("builderIdea").value.trim(),
    timing: $("builderTiming").value.trim(),
    budget: $("builderBudget").value.trim(),
    support: $("builderSupport").value.trim(),
    notes: $("builderNotes").value.trim()
  };
}

function buildPreview() {
  if (!builderState.selected) {
    $("builderFormStatus").textContent = "Select a builder first.";
    return false;
  }
  const title = $("builderTitle").value.trim();
  const fields = collectFields();
  if (!title && !fields.idea) {
    $("builderFormStatus").textContent = "Add a title or main idea before previewing.";
    return false;
  }
  const rows = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => `<li><strong>${esc(key.replace(/[_-]+/g, " "))}:</strong> ${esc(value)}</li>`)
    .join("");
  $("builderPreview").innerHTML = `
    <div class="builder-preview-page">
      <p class="builder-kicker">${esc(builderState.selected.name)}</p>
      <h3>${esc(title || `${builderState.selected.name} output`)}</h3>
      <p>Self-service preview created from your supplied details.</p>
      ${rows ? `<ul>${rows}</ul>` : ""}
      <div class="builder-preview-note">Opening, typing and previewing do not deduct Builder Usage Tokens. Tokens are deducted only after a finished output is saved successfully.</div>
      <h4>Responsibility notes</h4>
      <ul>
        <li>Check prices, opening times, availability, accessibility, suitability and provider terms before relying on this plan.</li>
        <li>JA Group Services Ltd provides planning support only and does not arrange third-party bookings.</li>
      </ul>
    </div>
  `;
  $("builderFormStatus").textContent = "Preview created. No tokens have been deducted.";
  return true;
}

async function activateTrial() {
  if (!builderState.signedIn) {
    window.location.href = loginUrl;
    return;
  }
  if (builderState.activatingTrial) return;
  builderState.activatingTrial = true;
  const button = $("claimTrialButton");
  button.disabled = true;
  button.textContent = "Activating...";
  try {
    const response = await fetch("/account/api/builders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ action: "activate_trial" })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showStatus(response.status === 409 ? "A free trial has already been used on this customer account." : (data.error || "Trial could not be activated."), response.status === 409 ? "info" : "error");
      if (data.trial) builderState.summary = { ...(builderState.summary || {}), trial: data.trial, trial_active: false };
      return;
    }
    builderState.summary = data.token_summary || builderState.summary || {};
    $("claimIntentNotice").hidden = true;
    showStatus("Trial activated. 30 Builder Usage Tokens were added once only.", "success");
    await loadAuthenticatedBuilders();
  } catch (error) {
    showStatus(error.message || "Trial could not be activated.", "error");
  } finally {
    builderState.activatingTrial = false;
    button.disabled = false;
    button.textContent = "Claim 14-Day Free Trial";
    renderSummary();
  }
}

async function saveOutput(event) {
  event.preventDefault();
  if (!builderState.signedIn) {
    window.location.href = loginUrl;
    return;
  }
  if (!builderState.selected) {
    $("builderFormStatus").textContent = "Select a builder first.";
    return;
  }
  if (!buildPreview() || builderState.saving) return;
  builderState.saving = true;
  $("saveBuilderButton").disabled = true;
  $("builderFormStatus").textContent = "Saving finished output...";
  try {
    const response = await fetch("/account/api/builders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: builderState.selected.id,
        title: $("builderTitle").value.trim(),
        fields: collectFields(),
        request_id: builderState.requestId
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      $("builderFormStatus").textContent = data.error || "Output could not be saved.";
      if (data.token_summary) {
        builderState.summary = data.token_summary;
        renderSummary();
      }
      return;
    }
    builderState.summary = data.token_summary || builderState.summary || {};
    builderState.outputs.unshift(data.output || { title: $("builderTitle").value.trim() || builderState.selected.name });
    builderState.requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    $("builderFormStatus").textContent = "Finished output saved. Builder Usage Tokens were deducted and a ledger entry was created.";
    renderSummary();
  } catch (error) {
    $("builderFormStatus").textContent = error.message || "Output could not be saved.";
  } finally {
    builderState.saving = false;
    $("saveBuilderButton").disabled = false;
  }
}

function bindEvents() {
  $("claimTrialButton")?.addEventListener("click", activateTrial);
  $("previewBuilderButton")?.addEventListener("click", buildPreview);
  $("builderBackButton")?.addEventListener("click", () => setWizardStep(builderState.wizardStep - 1));
  $("builderContinueButton")?.addEventListener("click", () => setWizardStep(builderState.wizardStep + 1));
  $("builderForm")?.addEventListener("submit", saveOutput);
  $("backToBuildersButton")?.addEventListener("click", () => $("builderGrid")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  $("builderTabs")?.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-filter]");
    if (!tab) return;
    builderState.filter = tab.dataset.filter || "all";
    document.querySelectorAll(".builder-tab").forEach((button) => button.classList.toggle("is-active", button === tab));
    renderBuilders();
  });
  $("builderSearch")?.addEventListener("input", (event) => {
    builderState.search = String(event.target.value || "").trim().toLowerCase();
    renderBuilders();
  });
  $("builderGrid")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-builder]");
    if (button) selectBuilder(button.dataset.builder);
  });
}

function init() {
  bindEvents();
  setWizardStep(1);
  if (new URLSearchParams(window.location.search).get("claim_trial") === "1") {
    $("claimIntentNotice").hidden = false;
  }
  renderSummary();
  loadAuthenticatedBuilders();
}

init();
