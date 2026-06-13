(function () {
  const PARTNER_ID = "ZSEVDSG";

  const featuredWidgets = [
    { icon: "🎡", country: "United Kingdom", title: "United Kingdom Experience", text: "Discover selected activities and availability in the United Kingdom.", tourId: "16403", variant: "horizontal", link: "https://www.getyourguide.com/london-l57/" },
    { icon: "👑", country: "United Kingdom", title: "United Kingdom Featured Tour", text: "Discover another selected United Kingdom activity with live availability.", tourId: "53844", variant: "vertical", link: "https://www.getyourguide.com/london-l57/" },
    { icon: "🌿", country: "United Kingdom", title: "United Kingdom Countryside", text: "Discover selected countryside activities and availability in the United Kingdom.", tourId: "1020796", variant: "vertical", link: "https://www.getyourguide.com/norfolk-l651/" },
    { icon: "🌊", country: "Portugal", title: "Portugal Experience", text: "Discover selected activities and availability in Portugal.", tourId: "1170912", variant: "vertical", link: "https://www.getyourguide.com/canical-l142615/" },
    { icon: "🏖️", country: "Spain", title: "Spain Experience", text: "Discover selected activities and availability in Spain.", tourId: "1177", variant: "vertical", link: "https://www.getyourguide.com/barcelona-l45/" },
    { icon: "🥐", country: "France", title: "France Experience", text: "Discover selected activities and availability in France.", tourId: "203038", variant: "vertical", link: "https://www.getyourguide.com/nice-l314/" },
    { icon: "🏟️", country: "Italy", title: "Italy Experience", text: "Discover selected activities and availability in Italy.", tourId: "709427", variant: "vertical", link: "https://www.getyourguide.com/rome-l33/" },
    { icon: "🏛️", country: "Greece", title: "Greece Experience", text: "Discover selected activities and availability in Greece.", tourId: "698", variant: "horizontal", link: "https://www.getyourguide.com/athens-l91/" },
    { icon: "🦒", country: "Kenya", title: "Kenya Experience", text: "Discover selected activities and availability in Kenya.", tourId: "479163", variant: "horizontal", link: "https://www.getyourguide.com/nakuru-l154676/" },
    { icon: "🏙️", country: "United Arab Emirates", title: "United Arab Emirates Experience", text: "Discover selected activities and availability in the United Arab Emirates.", tourId: "60673", variant: "vertical", link: "https://www.getyourguide.com/dubai-l173/" },
    { icon: "🗼", country: "Japan", title: "Japan Experience", text: "Discover selected activities and availability in Japan.", tourId: "1035544", variant: "vertical", link: "https://www.getyourguide.com/tokyo-l193/" },
    { icon: "🌴", country: "Thailand", title: "Thailand Experience", text: "Discover selected activities and availability in Thailand.", tourId: "1027531", variant: "vertical", link: "https://www.getyourguide.com/pattaya-l182/" },
    { icon: "🐠", country: "Australia", title: "Australia Experience", text: "Discover selected activities and availability in Australia.", tourId: "454397", variant: "vertical", link: "https://www.getyourguide.com/port-douglas-l2075/" },
    { icon: "🇧🇷", country: "Brazil", title: "Brazil Experience", text: "Discover selected activities and availability in Brazil.", tourId: "530101", variant: "vertical", link: "https://www.getyourguide.com/rio-de-janeiro-l9/" }
  ];

  const cities = [
    { icon: "🎡", name: "London", locationId: "57" },
    { icon: "🗽", name: "New York", locationId: "16" },
    { icon: "🌋", name: "Tenerife", locationId: "2603" },
    { icon: "🏟️", name: "Rome", locationId: "33" },
    { icon: "🏖️", name: "Barcelona", locationId: "45" },
    { icon: "🏙️", name: "Dubai", locationId: "173" },
    { icon: "🛶", name: "Amsterdam", locationId: "59" },
    { icon: "🥨", name: "Munich", locationId: "36" },
    { icon: "🌉", name: "San Francisco", locationId: "200" },
    { icon: "🎭", name: "Paris", locationId: "42" },
    { icon: "🎰", name: "Las Vegas", locationId: "67" },
    { icon: "🏛️", name: "Athens", locationId: "91" }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function renderFeatured() {
    const grid = document.getElementById("jaFeaturedGrid");
    if (!grid) return false;
    grid.innerHTML = featuredWidgets.map(function (item) {
      return `
        <article class="partner-experience-card">
          <div class="partner-card-top">
            <span class="partner-card-icon">${escapeHtml(item.icon)}</span>
            <span class="partner-card-pill">${escapeHtml(item.country)}</span>
          </div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.text)}</p>
          <div class="provider-widget">
            <div
              data-gyg-href="https://widget.getyourguide.com/default/availability.frame"
              data-gyg-tour-id="${escapeHtml(item.tourId)}"
              data-gyg-locale-code="en-US"
              data-gyg-currency="GBP"
              data-gyg-widget="availability"
              data-gyg-variant="${escapeHtml(item.variant)}"
              data-gyg-partner-id="${PARTNER_ID}">
              <span>Powered by <a target="_blank" rel="sponsored noopener noreferrer" href="${escapeHtml(item.link)}">GetYourGuide</a></span>
            </div>
          </div>
        </article>`;
    }).join("");
    return true;
  }

  function renderCities() {
    const grid = document.getElementById("jaCityGrid");
    if (!grid) return false;
    grid.innerHTML = cities.map(function (city) {
      return `
        <article class="partner-experience-card">
          <div class="partner-card-top">
            <span class="partner-card-icon">${escapeHtml(city.icon)}</span>
            <span class="partner-card-pill">${escapeHtml(city.name)}</span>
          </div>
          <h4>${escapeHtml(city.name)} City Guide</h4>
          <p>Browse activities, attractions and tours for ${escapeHtml(city.name)}.</p>
          <div class="provider-widget">
            <div
              data-gyg-href="https://widget.getyourguide.com/default/city.frame"
              data-gyg-location-id="${escapeHtml(city.locationId)}"
              data-gyg-locale-code="en-US"
              data-gyg-widget="city"
              data-gyg-partner-id="${PARTNER_ID}">
            </div>
          </div>
        </article>`;
    }).join("");
    return true;
  }

  function renderDestinationSearch() {
    const form = document.getElementById("gygDestinationForm");
    const input = document.getElementById("gygDestination");
    const result = document.getElementById("gygDestinationResult");
    if (!form || !input || !result) return false;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      result.hidden = false;
      result.innerHTML = `
        <div class="destination-widget-heading"><span class="kicker">Activities for</span><h3>${escapeHtml(query)}</h3></div>
        <div class="provider-widget destination-provider-widget">
          <div
            data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
            data-gyg-widget="activities"
            data-gyg-partner-id="${PARTNER_ID}"
            data-gyg-q="${escapeHtml(query)}"
            data-gyg-locale-code="en-GB"
            data-gyg-currency="GBP"
            data-gyg-number-of-items="5"
            data-gyg-cmp="jags-find-activities-tours">
          </div>
        </div>`;
      loadPartnerScript();
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return true;
  }

  let partnerScriptLoaded = false;
  function loadPartnerScript() {
    if (partnerScriptLoaded || document.querySelector('script[src*="widget.getyourguide.com/dist/pa.umd.production.min.js"]')) return;
    partnerScriptLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
    script.setAttribute("data-gyg-partner-id", PARTNER_ID);
    document.body.appendChild(script);
  }

  const featuredRendered = renderFeatured();
  const citiesRendered = renderCities();
  renderDestinationSearch();
  const renderedDynamicWidgets = featuredRendered || citiesRendered;
  if (renderedDynamicWidgets || document.querySelector("[data-gyg-widget]")) {
    loadPartnerScript();
  }
})();
