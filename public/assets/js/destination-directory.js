const countrySlugs = new Set([
  "albania", "australia", "austria", "bahamas", "barbados", "belgium", "bosnia-and-herzegovina", "bulgaria", "canada", "croatia", "cyprus", "czech-republic", "denmark", "dominican-republic", "egypt", "estonia", "finland", "france", "germany", "greece", "hungary", "iceland", "india", "indonesia", "ireland", "italy", "jamaica", "japan", "jordan", "kenya", "latvia", "lithuania", "luxembourg", "malaysia", "malta", "mexico", "montenegro", "morocco", "netherlands", "new-zealand", "norway", "poland", "portugal", "qatar", "romania", "serbia", "singapore", "slovakia", "slovenia", "south-africa", "south-korea", "spain", "sweden", "switzerland", "thailand", "turkiye", "united-arab-emirates", "united-kingdom", "united-states", "vietnam"
]);

const popularSlugs = new Set(["united-kingdom", "london", "portugal", "lisbon", "spain", "barcelona", "france", "paris", "italy", "rome", "japan", "tokyo", "united-arab-emirates", "dubai", "united-states", "new-york", "greece", "athens"]);
const ukSlugs = new Set(["united-kingdom", "england", "scotland", "wales", "northern-ireland", "london", "bath", "belfast", "birmingham", "brighton", "cambridge", "cardiff", "edinburgh", "glasgow", "liverpool", "manchester", "oxford", "york"]);
const europeCountries = new Set(["albania", "austria", "belgium", "bosnia-and-herzegovina", "bulgaria", "croatia", "cyprus", "czech-republic", "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "iceland", "ireland", "italy", "latvia", "lithuania", "luxembourg", "malta", "montenegro", "netherlands", "norway", "poland", "portugal", "romania", "serbia", "slovakia", "slovenia", "spain", "sweden", "switzerland", "turkiye", "united-kingdom"]);
const europeKeywords = ["algarve", "alicante", "amalfi", "amsterdam", "athens", "azores", "balearic", "barcelona", "berlin", "brussels", "budapest", "canary", "copenhagen", "crete", "dubrovnik", "dublin", "edinburgh", "florence", "funchal", "geneva", "lisbon", "london", "madeira", "madrid", "malaga", "mallorca", "milan", "munich", "paris", "porto", "prague", "reykjavik", "rhodes", "rome", "santorini", "sicily", "tenerife", "venice", "vienna", "zurich"];
const islandKeywords = ["island", "islands", "azores", "bali", "balearic", "canary", "corfu", "crete", "fuerteventura", "gozo", "gran-canaria", "hvar", "ibiza", "jamaica", "kos", "lanzarote", "madeira", "mallorca", "malta", "menorca", "mykonos", "phuket", "rhodes", "santorini", "sardinia", "sicily", "tenerife", "zakynthos", "zanzibar"];
const regionKeywords = ["algarve", "amalfi", "azores", "balearic", "canary", "cinque", "french-riviera", "lake-bled", "madeira", "middle-east", "north-america", "oceania", "sardinia", "sicily"];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  })[character]);
}

function titleFromSlug(slug) {
  return slug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function classifyDestination(destination) {
  const slug = destination.slug;
  const name = destination.name || titleFromSlug(slug);
  const haystack = `${slug} ${name}`.toLocaleLowerCase("en-GB");
  const isCountry = countrySlugs.has(slug);
  const isIsland = islandKeywords.some(keyword => haystack.includes(keyword));
  const isRegion = !isCountry && (regionKeywords.some(keyword => haystack.includes(keyword)) || haystack.includes("coast") || haystack.includes("riviera"));
  const type = isCountry ? "Country" : isIsland ? "Island" : isRegion ? "Region" : "City";
  const area = ukSlugs.has(slug) ? "UK" : (europeCountries.has(slug) || europeKeywords.some(keyword => haystack.includes(keyword))) ? "Europe" : "Worldwide";
  const description = isCountry
    ? `${name} planning board for routes, practical checks, activity ideas and saved member plans.`
    : `${name} guide for local planning notes, activity ideas, accessibility checks and discovery boards.`;
  return {
    name,
    slug,
    type,
    area,
    popular: popularSlugs.has(slug),
    description,
    keywords: `${haystack} ${type} ${area} ${isIsland ? "islands" : ""} ${isRegion ? "regions" : ""}`.toLocaleLowerCase("en-GB")
  };
}

function matchesFilter(destination, filter) {
  if (filter === "all") return true;
  if (filter === "countries") return destination.type === "Country";
  if (filter === "cities") return destination.type === "City";
  if (filter === "regions") return destination.type === "Region";
  if (filter === "islands") return destination.type === "Island";
  if (filter === "popular") return destination.popular;
  if (filter === "europe") return destination.area === "Europe";
  if (filter === "uk") return destination.area === "UK";
  if (filter === "worldwide") return destination.area === "Worldwide";
  return true;
}

function renderDestinations() {
  const grid = document.querySelector("#allDestinations");
  const search = document.querySelector("#destinationSearch");
  const count = document.querySelector("#destinationCount");
  const activeFilter = document.querySelector("#destinationFilters .filter-chip[aria-pressed='true']")?.dataset.filter || "all";
  if (!grid || !search || !count) return;
  if (!Array.isArray(window.JA_DESTINATIONS)) {
    grid.innerHTML = `
    <div class="saas-panel saas-empty">
      <h3>Destination boards are not available</h3>
      <p>Please refresh the page. If the issue continues, contact support.</p>
    </div>`;
    count.textContent = "Destination data could not be loaded";
    return;
  }

  const query = search.value.trim().toLocaleLowerCase("en-GB");
  const destinations = window.JA_DESTINATIONS.map(classifyDestination);
  const matches = destinations.filter(destination => {
    return (!query || destination.keywords.includes(query)) && matchesFilter(destination, activeFilter);
  });

  grid.innerHTML = matches.length ? matches.map(destination => `
    <a class="destination-card" href="/destinations/${escapeHtml(destination.slug)}/">
      <div>
        <div class="destination-card-meta">
          <span>${escapeHtml(destination.type)}</span>
          <span>${escapeHtml(destination.area)}</span>
          ${destination.popular ? "<span>Popular</span>" : ""}
        </div>
        <h3>${escapeHtml(destination.name)}</h3>
        <p>${escapeHtml(destination.description)}</p>
      </div>
      <span class="destination-card-action">${destination.type === "Country" ? "Open board" : "View guide"}</span>
    </a>`).join("") : `
    <div class="saas-panel saas-empty">
      <h3>No destination boards found</h3>
      <p>Try a broader search term or switch back to the All filter.</p>
    </div>`;
  count.textContent = `${matches.length} destination ${matches.length === 1 ? "board" : "boards"} shown`;
}

function initDestinationDirectory() {
  const initialQuery = new URLSearchParams(window.location.search).get("q");
  const search = document.querySelector("#destinationSearch");
  if (initialQuery && search) {
    search.value = initialQuery;
  }

  search?.addEventListener("input", renderDestinations);
  document.querySelector("#destinationClear")?.addEventListener("click", () => {
    if (search) search.value = "";
    renderDestinations();
  });
  document.querySelector("#destinationFilters")?.addEventListener("click", event => {
    const button = event.target.closest(".filter-chip");
    if (!button) return;
    document.querySelectorAll("#destinationFilters .filter-chip").forEach(item => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    renderDestinations();
  });
  renderDestinations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDestinationDirectory, { once: true });
} else {
  initDestinationDirectory();
}
