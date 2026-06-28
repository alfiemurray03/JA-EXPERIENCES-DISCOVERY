(function () {
  const DEFAULT_REFRESH_SECONDS = 60;
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London"
  });

  let refreshTimer;
  let requestInFlight = false;

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("retryStatus")?.addEventListener("click", () => loadStatus(true));
    loadStatus();
  });

  async function loadStatus(userInitiated = false) {
    if (requestInFlight) return;
    requestInFlight = true;
    window.clearTimeout(refreshTimer);

    const dashboard = document.getElementById("statusDashboard");
    const loading = document.getElementById("statusLoading");
    const errorPanel = document.getElementById("statusError");
    const content = document.getElementById("statusContent");
    const retryButton = document.getElementById("retryStatus");

    dashboard?.setAttribute("aria-busy", "true");
    if (userInitiated && retryButton) retryButton.disabled = true;
    if (!content || content.hidden) loading.hidden = false;
    errorPanel.hidden = true;

    try {
      const response = await fetch("/api/status", {
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) throw new Error(data.message || "Status unavailable");
      renderStatus(data);
      loading.hidden = true;
      content.hidden = false;
    } catch (error) {
      loading.hidden = true;
      errorPanel.hidden = false;
      document.getElementById("statusErrorMessage").textContent =
        "We could not retrieve live service information. Please try again shortly or use the official status portal.";
      console.warn("Live service status is temporarily unavailable.");
    } finally {
      requestInFlight = false;
      dashboard?.setAttribute("aria-busy", "false");
      if (retryButton) retryButton.disabled = false;
      const delay = Math.max(Number(document.body.dataset.statusRefreshSeconds || DEFAULT_REFRESH_SECONDS), 30) * 1000;
      refreshTimer = window.setTimeout(() => loadStatus(), delay);
    }
  }

  function renderStatus(data) {
    const refreshSeconds = Math.max(Number(data.refreshAfter || DEFAULT_REFRESH_SECONDS), 30);
    document.body.dataset.statusRefreshSeconds = String(refreshSeconds);

    const overall = data.overall || {};
    const overallCard = document.getElementById("overallStatus");
    overallCard.dataset.tone = safeTone(overall.tone);
    document.getElementById("overallStatusTitle").textContent = overall.label || "Service status available";
    document.getElementById("overallStatusDescription").textContent = overall.description || "Live status supplied by JA Group Services.";

    const updatedText = formatDate(data.lastUpdated);
    document.getElementById("lastUpdated").textContent = updatedText;
    document.getElementById("lastUpdatedHero").textContent = `Updated ${updatedText}. Refreshes every ${refreshSeconds} seconds.`;

    renderSummary(data.summary || {}, refreshSeconds);
    renderComponents(Array.isArray(data.components) ? data.components : []);
    renderEvents(
      document.getElementById("activeIncidents"),
      (data.incidents?.active || []).map((event) => ({ ...event, eventType: "Incident" })),
      "No active incidents",
      "There are no active incidents reported by the official status service."
    );

    const maintenanceEvents = [
      ...(data.maintenance?.active || []).map((event) => ({ ...event, eventType: "Maintenance in progress" })),
      ...(data.maintenance?.scheduled || []).map((event) => ({ ...event, eventType: "Scheduled maintenance" }))
    ];
    renderEvents(
      document.getElementById("maintenanceEvents"),
      maintenanceEvents,
      "No maintenance scheduled",
      "There is no active or upcoming maintenance in the official status service."
    );

    const history = [
      ...(data.incidents?.history || []).map((event) => ({ ...event, eventType: "Resolved incident" })),
      ...(data.maintenance?.history || []).map((event) => ({ ...event, eventType: "Completed maintenance" }))
    ].sort((a, b) => dateValue(b.resolvedAt || b.updatedAt) - dateValue(a.resolvedAt || a.updatedAt));
    renderEvents(
      document.getElementById("incidentHistory"),
      history,
      "No recent history",
      "No resolved incidents or completed maintenance events are currently published."
    );
  }

  function renderSummary(summary, refreshSeconds) {
    const availability = Number.isFinite(Number(summary.currentAvailabilityPercent))
      ? `${Number(summary.currentAvailabilityPercent).toFixed(Number(summary.currentAvailabilityPercent) % 1 ? 1 : 0)}%`
      : "—";
    const eventCount = Number(summary.activeIncidents || 0) + Number(summary.activeMaintenance || 0);
    const cards = [
      {
        label: "Current availability",
        value: availability,
        detail: `${Number(summary.operationalComponents || 0)} of ${Number(summary.totalComponents || 0)} components operational`,
        tone: "operational"
      },
      {
        label: "Affected components",
        value: String(Number(summary.affectedComponents || 0)),
        detail: "Includes disruption and planned maintenance",
        tone: Number(summary.affectedComponents || 0) ? "warning" : "operational"
      },
      {
        label: "Active events",
        value: String(eventCount),
        detail: `${Number(summary.activeIncidents || 0)} incidents · ${Number(summary.activeMaintenance || 0)} maintenance`,
        tone: eventCount ? "maintenance" : "operational"
      },
      {
        label: "Automatic refresh",
        value: `${refreshSeconds}s`,
        detail: "Live data with efficient edge caching",
        tone: "information"
      }
    ];

    const grid = document.getElementById("summaryGrid");
    grid.replaceChildren(...cards.map(createSummaryCard));
  }

  function createSummaryCard(item) {
    const article = element("article", "summary-card");
    article.dataset.tone = safeTone(item.tone);
    article.append(
      element("span", "summary-card-label", item.label),
      element("strong", "summary-card-value", item.value),
      element("p", "summary-card-detail", item.detail)
    );
    return article;
  }

  function renderComponents(components) {
    const grid = document.getElementById("componentGrid");
    const summary = document.getElementById("componentSummary");
    summary.textContent = `${components.length} published service component${components.length === 1 ? "" : "s"}, updated live.`;

    if (!components.length) {
      grid.replaceChildren(createEmptyState("No components published", "The official status service has not published any components."));
      return;
    }

    grid.replaceChildren(...components.map((component) => {
      const card = element("article", "component-card");
      card.dataset.tone = safeTone(component.tone);

      const header = element("div", "component-card-head");
      header.append(element("h3", "", component.name || "Service component"), createStatusChip(component.statusLabel, component.tone));
      card.append(header);

      if (component.description) card.append(element("p", "component-description", component.description));
      const updated = element("p", "component-updated", `Updated ${formatDate(component.updatedAt)}`);
      card.append(updated);
      return card;
    }));
  }

  function renderEvents(container, events, emptyTitle, emptyDescription) {
    if (!events.length) {
      container.replaceChildren(createEmptyState(emptyTitle, emptyDescription));
      return;
    }

    container.replaceChildren(...events.map(createEventCard));
  }

  function createEventCard(event) {
    const article = element("article", "event-card");
    article.dataset.tone = eventTone(event);

    const header = element("div", "event-card-head");
    const titleGroup = element("div", "event-title-group");
    titleGroup.append(
      element("span", "event-type", event.eventType || "Service event"),
      element("h3", "", event.name || "Service update")
    );
    header.append(titleGroup, createStatusChip(event.statusLabel || humanise(event.status), eventTone(event)));
    article.append(header);

    const timings = element("div", "event-timings");
    if (event.scheduledFor) timings.append(createTiming("Starts", formatDate(event.scheduledFor)));
    if (event.scheduledUntil) timings.append(createTiming("Expected end", formatDate(event.scheduledUntil)));
    if (!event.scheduledFor && event.createdAt) timings.append(createTiming("Reported", formatDate(event.createdAt)));
    if (event.resolvedAt) timings.append(createTiming("Resolved", formatDate(event.resolvedAt)));
    if (timings.childElementCount) article.append(timings);

    if (Array.isArray(event.components) && event.components.length) {
      article.append(element("p", "affected-components", `Affected services: ${event.components.join(", ")}`));
    }

    const updates = Array.isArray(event.updates) ? event.updates : [];
    if (updates.length) {
      article.append(createUpdate(updates[0], true));
      if (updates.length > 1) {
        const details = element("details", "event-update-details");
        details.append(element("summary", "", `View ${updates.length - 1} earlier update${updates.length === 2 ? "" : "s"}`));
        const timeline = element("div", "event-timeline");
        timeline.append(...updates.slice(1).map((update) => createUpdate(update, false)));
        details.append(timeline);
        article.append(details);
      }
    }
    return article;
  }

  function createUpdate(update, latest) {
    const item = element("div", latest ? "event-update latest" : "event-update");
    const meta = element("p", "event-update-meta");
    meta.append(
      element("strong", "", latest ? `Latest · ${update.statusLabel || humanise(update.status)}` : update.statusLabel || humanise(update.status)),
      document.createTextNode(` · ${formatDate(update.displayedAt)}`)
    );
    item.append(meta, element("p", "event-update-body", update.body || "Status update published."));
    return item;
  }

  function createTiming(label, value) {
    const item = element("span", "");
    item.append(element("strong", "", label), document.createTextNode(value));
    return item;
  }

  function createStatusChip(label, tone) {
    const chip = element("span", "status-chip");
    chip.dataset.tone = safeTone(tone);
    chip.append(element("span", "status-chip-dot"), document.createTextNode(label || "Status available"));
    return chip;
  }

  function createEmptyState(title, description) {
    const empty = element("div", "empty-state");
    empty.append(
      element("span", "empty-state-mark", "✓"),
      element("div", "", "")
    );
    empty.lastElementChild.append(element("h3", "", title), element("p", "", description));
    return empty;
  }

  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function formatDate(value) {
    if (!value) return "Not specified";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not specified" : dateFormatter.format(date);
  }

  function dateValue(value) {
    const timestamp = value ? new Date(value).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function humanise(value) {
    const text = String(value || "Status").replaceAll("_", " ");
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function eventTone(event) {
    if (event.impact === "critical" || event.impact === "major") return "critical";
    if (event.impact === "maintenance" || String(event.eventType).toLowerCase().includes("maintenance")) return "maintenance";
    if (event.status === "resolved" || event.status === "completed") return "operational";
    return "warning";
  }

  function safeTone(value) {
    return ["operational", "warning", "critical", "maintenance", "information", "unknown"].includes(value)
      ? value
      : "unknown";
  }
})();
