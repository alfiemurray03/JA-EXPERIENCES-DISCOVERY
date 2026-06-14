const countrySlugs = new Set([
  "albania","australia","austria","bahamas","barbados","belgium","bosnia-and-herzegovina","bulgaria","canada","croatia","cyprus","czech-republic","denmark","dominican-republic","egypt","estonia","finland","france","germany","greece","hungary","iceland","india","indonesia","ireland","italy","jamaica","japan","jordan","kenya","latvia","lithuania","luxembourg","malaysia","malta","mexico","montenegro","morocco","netherlands","new-zealand","norway","poland","portugal","qatar","romania","serbia","singapore","slovakia","slovenia","south-africa","south-korea","spain","sweden","switzerland","thailand","turkiye","united-arab-emirates","united-kingdom","united-states","vietnam"
]);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  })[character]);
}

function renderDestinations() {
  const grid = document.querySelector("#allDestinations");
  const search = document.querySelector("#destinationSearch");
  const filter = document.querySelector("#destinationStatus");
  const count = document.querySelector("#destinationCount");
  if (!grid || !search || !filter || !Array.isArray(window.JA_DESTINATIONS)) return;

  const query = search.value.trim().toLocaleLowerCase("en-GB");
  const type = filter.value;
  const matches = window.JA_DESTINATIONS.filter(destination => {
    const isCountry = countrySlugs.has(destination.slug);
    return (!query || destination.name.toLocaleLowerCase("en-GB").includes(query))
      && (type === "all" || (type === "country" ? isCountry : !isCountry));
  });

  grid.innerHTML = matches.map(destination => `
    <a class="directory-link" href="/destinations/${escapeHtml(destination.slug)}/">
      <strong>${escapeHtml(destination.name)}</strong>
      <small>${countrySlugs.has(destination.slug) ? "Country planning guide" : "City or region planning guide"}</small>
    </a>`).join("");
  count.textContent = `${matches.length} guide${matches.length === 1 ? "" : "s"} shown`;
}

const initialQuery = new URLSearchParams(window.location.search).get("q");
if (initialQuery && document.querySelector("#destinationSearch")) {
  document.querySelector("#destinationSearch").value = initialQuery;
}
document.querySelector("#destinationSearch")?.addEventListener("input", renderDestinations);
document.querySelector("#destinationStatus")?.addEventListener("change", renderDestinations);
renderDestinations();
