const liveDestinations = new Set(["london", "lisbon", "madeira", "new-york"]);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderDestinations() {
  const grid = document.querySelector("#allDestinations");
  const search = document.querySelector("#destinationSearch");
  const status = document.querySelector("#destinationStatus");
  if (!grid || !search || !status || !Array.isArray(window.JA_DESTINATIONS)) return;

  const query = search.value.trim().toLocaleLowerCase("en-GB");
  const selectedStatus = status.value;
  const matches = window.JA_DESTINATIONS.filter(destination => {
    const isLive = liveDestinations.has(destination.slug);
    return (!query || destination.name.toLocaleLowerCase("en-GB").includes(query))
      && (selectedStatus === "all" || (selectedStatus === "live" ? isLive : !isLive));
  });

  grid.innerHTML = matches.map(destination => {
    const isLive = liveDestinations.has(destination.slug);
    return `
      <a class="directory-card" href="/destinations/${escapeHtml(destination.slug)}/">
        <span class="directory-status ${isLive ? "live" : ""}">${isLive ? "Available now" : "Coming soon"}</span>
        <strong>${escapeHtml(destination.name)}</strong>
        <small>${isLive ? "Browse activities and experiences" : "Open destination preview"}</small>
      </a>`;
  }).join("");

  document.querySelector("#destinationCount").textContent = `${matches.length} destination${matches.length === 1 ? "" : "s"}`;
}

document.querySelector("#destinationSearch")?.addEventListener("input", renderDestinations);
document.querySelector("#destinationStatus")?.addEventListener("change", renderDestinations);
renderDestinations();
