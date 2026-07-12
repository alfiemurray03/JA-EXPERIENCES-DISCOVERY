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
  ["checklists", "Checklists", "Small", "Organisation Tools", 10, "trial", "Create a reusable checklist."],
  ["holiday-planner", "Holiday Planner", "Travel", "Travel Experience Builders", 5, "paid", "Organise holiday ideas, budgets and family priorities into a complete travel plan."]
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

  requestId: "",

  // Guided runner properties
  guidedRunnerActive: false,
  guidedQuestions: [],
  guidedAnswers: {},
  guidedStep: 0,
  legacyFormHtml: ""
=======
  search: "",
  requestId: ""
  ,wizardStep: 1
 main
};

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const loginUrl = "/account/login/?return_to=%2Fbuilders%2F%3Fclaim_trial%3D1";

function categoryGroup(builder) {
  if (String(builder.builder_type || builder.category).includes("Travel")) return "Travel";
  if (String(builder.builder_type || builder.category).includes("Accessibility")) return "Accessibility/support";
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

// --- Guided Runner Interactive rendering ---

function getVisibleQuestions() {
  return builderState.guidedQuestions.filter(q => {
    if (!q.conditional) return true;
    const condVal = builderState.guidedAnswers[q.conditional.field];
    return condVal === q.conditional.value;
  });
}

function autosaveGuidedDraft() {
  if (!builderState.selected || !builderState.signedIn) return;
  fetch("/account/api/builders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save_draft",
      builder_id: builderState.selected.id,
      answers: builderState.guidedAnswers,
      current_step: builderState.guidedStep
    })
  }).catch(err => console.error("Failed to autosave guided draft:", err));
}

function renderGuidedStep() {
  const visible = getVisibleQuestions();
  const step = builderState.guidedStep;

  if (step >= visible.length) {
    renderGuidedReview();
    return;
  }

  const q = visible[step];
  const progressPercent = Math.round(((step + 1) / visible.length) * 100);

  // Generate question HTML based on type
  let inputHtml = "";
  const currentVal = builderState.guidedAnswers[q.id];

  switch (q.type) {
    case "short_text":
      inputHtml = `<input type="text" id="guided_${q.id}" class="form-input w-full" placeholder="${esc(q.placeholder || "")}" value="${esc(currentVal || "")}">`;
      break;
    case "long_text":
      inputHtml = `<textarea id="guided_${q.id}" rows="4" class="form-input w-full" placeholder="${esc(q.placeholder || "")}">${esc(currentVal || "")}</textarea>`;
      break;
    case "number":
      inputHtml = `<input type="number" id="guided_${q.id}" min="${q.min ?? ""}" max="${q.max ?? ""}" class="form-input w-full" placeholder="${esc(q.placeholder || "")}" value="${esc(currentVal ?? "")}">`;
      break;
    case "date":
      inputHtml = `<input type="date" id="guided_${q.id}" class="form-input w-full" value="${esc(currentVal || "")}">`;
      break;
    case "yes_no":
      inputHtml = `
        <div class="flex gap-4">
          <button type="button" class="btn ${currentVal === true ? 'btn-primary' : 'btn-outline'} flex-1" id="yes_btn_${q.id}">Yes</button>
          <button type="button" class="btn ${currentVal === false ? 'btn-primary' : 'btn-outline'} flex-1" id="no_btn_${q.id}">No</button>
        </div>
      `;
      break;
    case "single_choice":
      inputHtml = `
        <div class="space-y-2">
          ${(q.options || []).map(opt => `
            <label class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-primary/5 cursor-pointer">
              <input type="radio" name="guided_${q.id}" value="${esc(opt.value)}" ${currentVal === opt.value ? 'checked' : ''}>
              <span>${esc(opt.label)}</span>
            </label>
          `).join("")}
        </div>
      `;
      break;
    case "multiple_choice":
      inputHtml = `
        <div class="space-y-2">
          ${(q.options || []).map(opt => {
            const checked = Array.isArray(currentVal) && currentVal.includes(opt.value);
            return `
              <label class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-primary/5 cursor-pointer">
                <input type="checkbox" name="guided_${q.id}" value="${esc(opt.value)}" ${checked ? 'checked' : ''}>
                <span>${esc(opt.label)}</span>
              </label>
            `;
          }).join("")}
        </div>
      `;
      break;
    case "selectable_cards":
      inputHtml = `
        <div class="grid grid-2 gap-3">
          ${(q.options || []).map(opt => {
            const checked = Array.isArray(currentVal) && currentVal.includes(opt.value);
            return `
              <button type="button" class="p-4 rounded-xl border text-center transition-all cursor-pointer ${checked ? 'border-primary bg-primary/10' : 'border-default bg-white'}" id="card_${q.id}_${esc(opt.value)}">
                <span class="text-2xl block mb-1">${esc(opt.icon || "📋")}</span>
                <span class="text-sm font-bold block">${esc(opt.label)}</span>
              </button>
            `;
          }).join("")}
        </div>
      `;
      break;
    default:
      inputHtml = `<input type="text" id="guided_${q.id}" class="form-input w-full" value="${esc(currentVal || "")}">`;
  }

  $("builderForm").innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <span class="text-xs muted font-bold uppercase tracking-wider">Step ${step + 1} of ${visible.length}</span>
        <span class="text-xs font-bold text-primary">${progressPercent}% Complete</span>
      </div>
      <div class="w-full bg-default rounded-full h-1.5 overflow-hidden">
        <div class="bg-primary h-full" style="width: ${progressPercent}%"></div>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-bold">${esc(q.label)} ${q.required ? `<span class="text-primary">*</span>` : `<span class="text-xs muted">(Optional)</span>`}</h3>
        ${q.help ? `<p class="text-xs muted">${esc(q.help)}</p>` : ""}
      </div>

      <div class="p-4 bg-white/50 rounded-xl border border-default">
        ${inputHtml}
      </div>

      <div id="guidedError" class="text-xs text-primary font-semibold" hidden></div>

      <div class="flex gap-3">
        <button type="button" class="btn btn-outline flex-1" id="guidedBackBtn" ${step === 0 ? "disabled" : ""}>Back</button>
        <button type="button" class="btn btn-primary flex-1" id="guidedNextBtn">${step === visible.length - 1 ? "Review Answers" : "Continue"}</button>
      </div>
    </div>
  `;

  // Bind step interactive elements
  if (q.type === "yes_no") {
    $("yes_btn_" + q.id).addEventListener("click", () => {
      builderState.guidedAnswers[q.id] = true;
      autosaveGuidedDraft();
      renderGuidedStep();
    });
    $("no_btn_" + q.id).addEventListener("click", () => {
      builderState.guidedAnswers[q.id] = false;
      autosaveGuidedDraft();
      renderGuidedStep();
    });
  } else if (q.type === "selectable_cards") {
    (q.options || []).forEach(opt => {
      $("card_" + q.id + "_" + opt.value).addEventListener("click", () => {
        let currentArr = Array.isArray(builderState.guidedAnswers[q.id]) ? [...builderState.guidedAnswers[q.id]] : [];
        if (currentArr.includes(opt.value)) {
          currentArr = currentArr.filter(v => v !== opt.value);
        } else {
          currentArr.push(opt.value);
        }
        builderState.guidedAnswers[q.id] = currentArr;
        autosaveGuidedDraft();
        renderGuidedStep();
      });
    });
  }

  $("guidedBackBtn").addEventListener("click", () => {
    saveCurrentStepAnswer(q);
    builderState.guidedStep--;
    autosaveGuidedDraft();
    renderGuidedStep();
  });

  $("guidedNextBtn").addEventListener("click", () => {
    if (saveCurrentStepAnswer(q)) {
      builderState.guidedStep++;
      autosaveGuidedDraft();
      renderGuidedStep();
    }
  });

  buildPreview();
}

function saveCurrentStepAnswer(q) {
  const el = $("guided_" + q.id);
  const errorEl = $("guidedError");
  if (errorEl) errorEl.hidden = true;

  let val = builderState.guidedAnswers[q.id];

  if (q.type === "short_text" || q.type === "long_text" || q.type === "date") {
    val = el ? el.value.trim() : "";
    builderState.guidedAnswers[q.id] = val;
  } else if (q.type === "number") {
    const rawVal = el ? el.value.trim() : "";
    val = rawVal === "" ? undefined : Number(rawVal);
    builderState.guidedAnswers[q.id] = val;
  } else if (q.type === "single_choice") {
    const checkedInput = document.querySelector(`input[name="guided_${q.id}"]:checked`);
    val = checkedInput ? checkedInput.value : undefined;
    builderState.guidedAnswers[q.id] = val;
  } else if (q.type === "multiple_choice") {
    const checkedInputs = document.querySelectorAll(`input[name="guided_${q.id}"]:checked`);
    val = Array.from(checkedInputs).map(i => i.value);
    builderState.guidedAnswers[q.id] = val;
  }

  // Validate answer
  if (q.required) {
    if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
      if (errorEl) {
        errorEl.textContent = "This field is required.";
        errorEl.hidden = false;
      }
      return false;
    }
  }

  if (q.type === "number" && val !== undefined) {
    if (isNaN(val)) {
      if (errorEl) { errorEl.textContent = "Please enter a valid number."; errorEl.hidden = false; }
      return false;
    }
    if (q.min !== undefined && val < q.min) {
      if (errorEl) { errorEl.textContent = `Minimum value is ${q.min}.`; errorEl.hidden = false; }
      return false;
    }
    if (q.max !== undefined && val > q.max) {
      if (errorEl) { errorEl.textContent = `Maximum value is ${q.max}.`; errorEl.hidden = false; }
      return false;
    }
  }

  return true;
}

function renderGuidedReview() {
  const visible = getVisibleQuestions();

  const rowsHtml = visible.map(q => {
    const val = builderState.guidedAnswers[q.id];
    let displayVal = "Not answered";
    if (val === true) displayVal = "Yes";
    else if (val === false) displayVal = "No";
    else if (Array.isArray(val)) displayVal = val.length ? val.join(", ") : "Not answered";
    else if (val !== undefined && val !== "") displayVal = String(val);

    return `
      <div class="py-2 border-b border-default last:border-0">
        <span class="block text-xs muted font-bold">${esc(q.label)}</span>
        <span class="text-sm font-semibold">${esc(displayVal)}</span>
      </div>
    `;
  }).join("");

  $("builderForm").innerHTML = `
    <div class="space-y-6">
      <div>
        <span class="badge mb-2">Review</span>
        <h3 class="text-lg font-bold">Review your answers</h3>
        <p class="text-xs muted">Please confirm all choices are correct before generating your plan.</p>
      </div>

      <div class="p-4 bg-white/50 rounded-xl border border-default space-y-3">
        ${rowsHtml}
      </div>

      <div class="p-4 bg-primary-soft rounded-lg text-xs font-semibold text-primary">
        Token Cost: ${builderState.selected.token_cost ?? 5} Builder Usage Tokens will be deducted upon final creation.
      </div>

      <div id="guidedError" class="text-xs text-primary font-semibold" hidden></div>

      <div class="flex gap-3">
        <button type="button" class="btn btn-outline flex-1" id="reviewBackBtn">Back to edit</button>
        <button type="button" class="btn btn-primary flex-1 font-bold" id="guidedSubmitBtn">Save Finished Output</button>
      </div>
    </div>
  `;

  $("reviewBackBtn").addEventListener("click", () => {
    builderState.guidedStep = visible.length - 1;
    renderGuidedStep();
  });

  $("guidedSubmitBtn").addEventListener("click", submitGuidedOutput);
  buildPreview();
}

async function submitGuidedOutput() {
  if (builderState.saving) return;
  builderState.saving = true;
  const submitBtn = $("guidedSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
  }

  try {
    const response = await fetch("/account/api/builders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: builderState.selected.id,
        title: "Holiday Plan: " + (builderState.guidedAnswers.destination || "Personalised trip"),
        fields: builderState.guidedAnswers,
        request_id: builderState.requestId
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errEl = $("guidedError");
      if (errEl) {
        errEl.textContent = data.error || "Output could not be saved.";
        errEl.hidden = false;
      }
      if (data.token_summary) {
        builderState.summary = data.token_summary;
        renderSummary();
      }
      return;
    }

    builderState.summary = data.token_summary || builderState.summary || {};
    builderState.outputs.unshift(data.output || { title: "Holiday Plan" });
    builderState.requestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    // Clear draft state
    builderState.guidedAnswers = {};
    builderState.guidedStep = 0;

    // Success view
    $("builderForm").innerHTML = `
      <div class="space-y-6 text-center py-6">
        <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto text-success text-2xl font-bold">✓</div>
        <div class="space-y-2">
          <h3 class="text-xl font-extrabold">Finished Plan Saved!</h3>
          <p class="text-sm muted">Tokens were deducted. You can find your plan inside "My Builders" in your customer portal anytime.</p>
        </div>
        <button class="btn btn-secondary w-full" id="startFreshGuidedBtn">Start a new fresh plan</button>
      </div>
    `;
    $("startFreshGuidedBtn").addEventListener("click", () => {
      renderGuidedStep();
    });

    renderSummary();
  } catch (error) {
    const errEl = $("guidedError");
    if (errEl) {
      errEl.textContent = error.message || "Output could not be saved.";
      errEl.hidden = false;
    }
  } finally {
    builderState.saving = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Finished Output";
    }
  }
}

// --- End of Guided Runner logic ---

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

  // Store legacy template HTML once
  if (!builderState.legacyFormHtml) {
    builderState.legacyFormHtml = $("builderForm").innerHTML;
  }

  // Detect and initialize guided questionnaire or fallback
  let parsedSchema = [];
  try {
    parsedSchema = builder.form_schema ? JSON.parse(builder.form_schema) : [];
  } catch (e) {
    parsedSchema = [];
  }

  if (Array.isArray(parsedSchema) && parsedSchema.length > 0) {
    builderState.guidedRunnerActive = true;
    builderState.guidedQuestions = parsedSchema;
    builderState.guidedAnswers = {};
    builderState.guidedStep = 0;

    // Load persistent draft if it exists in D1
    fetch("/account/api/builders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_draft", builder_id: builder.id })
    })
    .then(r => r.json())
    .then(data => {
      if (data.draft) {
        const resume = confirm("You have an unfinished draft for the Holiday Planner. Would you like to resume it?");
        if (resume) {
          builderState.guidedAnswers = typeof data.draft.answers === "string" ? JSON.parse(data.draft.answers) : (data.draft.answers || {});
          builderState.guidedStep = Number(data.draft.current_step || 0);
        }
      }
      renderGuidedStep();
    })
    .catch(() => {
      renderGuidedStep();
    });

  } else {
    // Legacy flat form mode
    builderState.guidedRunnerActive = false;
    $("builderForm").innerHTML = builderState.legacyFormHtml;
    // Bind legacy inputs
    $("builderForm").addEventListener("submit", saveOutput);
  }

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
    idea: $("builderIdea") ? $("builderIdea").value.trim() : "",
    timing: $("builderTiming") ? $("builderTiming").value.trim() : "",
    budget: $("builderBudget") ? $("builderBudget").value.trim() : "",
    support: $("builderSupport") ? $("builderSupport").value.trim() : "",
    notes: $("builderNotes") ? $("builderNotes").value.trim() : ""
  };
}

function buildPreview() {
  if (!builderState.selected) {
    $("builderFormStatus").textContent = "Select a builder first.";
    return false;
  }

  if (builderState.guidedRunnerActive) {
    // Generate beautiful interactive preview page
    const dest = esc(builderState.guidedAnswers.destination || "Destination");
    const dates = esc(builderState.guidedAnswers.travel_dates || "Travel Dates");
    const nights = esc(builderState.guidedAnswers.trip_duration || "3");
    const adults = esc(builderState.guidedAnswers.num_adults || "1");
    const hasChildren = builderState.guidedAnswers.has_children ? "Yes" : "No";
    const budget = esc(builderState.guidedAnswers.budget || "moderate");
    const accom = esc(builderState.guidedAnswers.accommodation || "hotel");
    const transport = esc(Array.isArray(builderState.guidedAnswers.transport) ? builderState.guidedAnswers.transport.join(", ") : builderState.guidedAnswers.transport || "None");
    const interests = esc(Array.isArray(builderState.guidedAnswers.interests) ? builderState.guidedAnswers.interests.join(", ") : builderState.guidedAnswers.interests || "Sightseeing");
    const pace = esc(builderState.guidedAnswers.preferred_pace || "moderate");
    const access = builderState.guidedAnswers.has_accessibility ? esc(builderState.guidedAnswers.accessibility_details || "None") : "No requirements reported.";
    const dietary = builderState.guidedAnswers.has_dietary ? esc(builderState.guidedAnswers.dietary_details || "None") : "No requirements reported.";

    $("builderPreview").innerHTML = `
      <div class="builder-preview-page">
        <p class="builder-kicker">${esc(builderState.selected.name)} Preview</p>
        <h3 class="text-xl font-extrabold mb-1">Trip to: ${dest}</h3>
        <p class="text-xs muted mb-4">Dates: ${dates} (${nights} nights) · ${adults} Adult(s)</p>

        <div class="space-y-4">
          <div>
            <h4 class="font-bold text-sm text-primary mb-1">Preferences & Pace</h4>
            <p class="text-xs text-gray-700">Budget: <strong>${budget}</strong> · Pace: <strong>${pace}</strong> · Style: <strong>${accom}</strong></p>
            <p class="text-xs text-gray-700">Transport: <strong>${transport}</strong></p>
            <p class="text-xs text-gray-700">Interests: <strong>${interests}</strong></p>
          </div>

          <div>
            <h4 class="font-bold text-sm text-primary mb-1">Support & Accessibility</h4>
            <p class="text-xs text-gray-700">Accessibility: ${access}</p>
            <p class="text-xs text-gray-700">Dietary: ${dietary}</p>
          </div>
        </div>

        <div class="builder-preview-note mt-4">This is a dynamic, multi-step self-service preview. No tokens are charged for drafting, editing, or previewing questions. Tokens are spent only upon final save.</div>
      </div>
    `;
    return true;
  }

  const title = $("builderTitle") ? $("builderTitle").value.trim() : "";
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
  if (event) event.preventDefault();
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
        title: $("builderTitle") ? $("builderTitle").value.trim() : "",
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

  const autoBuilder = new URLSearchParams(window.location.search).get("builder");
  if (autoBuilder) {
    setTimeout(() => selectBuilder(autoBuilder), 800);
  }
}

init();
