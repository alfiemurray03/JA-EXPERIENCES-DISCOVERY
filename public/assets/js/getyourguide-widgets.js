(function () {
  const PARTNER_ID = "ZSEVDSG";
  const LOCALE = "en-GB";
  const CURRENCY = "GBP";
  const ITEMS = "5";

  const featuredWidgets = [
    { icon: "01", country: "United Kingdom", title: "United Kingdom Experience", text: "Discover selected activities and availability in the United Kingdom.", tourId: "16403", variant: "horizontal", link: "https://www.getyourguide.com/london-l57/" },
    { icon: "02", country: "United Kingdom", title: "United Kingdom Featured Tour", text: "Discover another selected United Kingdom activity with live availability.", tourId: "53844", variant: "vertical", link: "https://www.getyourguide.com/london-l57/" },
    { icon: "03", country: "United Kingdom", title: "United Kingdom Countryside", text: "Discover selected countryside activities and availability in the United Kingdom.", tourId: "1020796", variant: "vertical", link: "https://www.getyourguide.com/norfolk-l651/" },
    { icon: "04", country: "Portugal", title: "Portugal Experience", text: "Discover selected activities and availability in Portugal.", tourId: "1170912", variant: "vertical", link: "https://www.getyourguide.com/canical-l142615/" },
    { icon: "05", country: "Spain", title: "Spain Experience", text: "Discover selected activities and availability in Spain.", tourId: "1177", variant: "vertical", link: "https://www.getyourguide.com/barcelona-l45/" },
    { icon: "06", country: "France", title: "France Experience", text: "Discover selected activities and availability in France.", tourId: "203038", variant: "vertical", link: "https://www.getyourguide.com/nice-l314/" },
    { icon: "07", country: "Italy", title: "Italy Experience", text: "Discover selected activities and availability in Italy.", tourId: "709427", variant: "vertical", link: "https://www.getyourguide.com/rome-l33/" },
    { icon: "08", country: "Greece", title: "Greece Experience", text: "Discover selected activities and availability in Greece.", tourId: "698", variant: "horizontal", link: "https://www.getyourguide.com/athens-l91/" },
    { icon: "09", country: "Kenya", title: "Kenya Experience", text: "Discover selected activities and availability in Kenya.", tourId: "479163", variant: "horizontal", link: "https://www.getyourguide.com/nakuru-l154676/" },
    { icon: "10", country: "United Arab Emirates", title: "United Arab Emirates Experience", text: "Discover selected activities and availability in the United Arab Emirates.", tourId: "60673", variant: "vertical", link: "https://www.getyourguide.com/dubai-l173/" },
    { icon: "11", country: "Japan", title: "Japan Experience", text: "Discover selected activities and availability in Japan.", tourId: "1035544", variant: "vertical", link: "https://www.getyourguide.com/tokyo-l193/" },
    { icon: "12", country: "Thailand", title: "Thailand Experience", text: "Discover selected activities and availability in Thailand.", tourId: "1027531", variant: "vertical", link: "https://www.getyourguide.com/pattaya-l182/" },
    { icon: "13", country: "Australia", title: "Australia Experience", text: "Discover selected activities and availability in Australia.", tourId: "454397", variant: "vertical", link: "https://www.getyourguide.com/port-douglas-l2075/" },
    { icon: "14", country: "Brazil", title: "Brazil Experience", text: "Discover selected activities and availability in Brazil.", tourId: "530101", variant: "vertical", link: "https://www.getyourguide.com/rio-de-janeiro-l9/" }
  ];

  const cities = [
    { icon: "01", name: "London", locationId: "57" },
    { icon: "02", name: "New York", locationId: "16" },
    { icon: "03", name: "Tenerife", locationId: "2603" },
    { icon: "04", name: "Rome", locationId: "33" },
    { icon: "05", name: "Barcelona", locationId: "45" },
    { icon: "06", name: "Dubai", locationId: "173" },
    { icon: "07", name: "Amsterdam", locationId: "59" },
    { icon: "08", name: "Munich", locationId: "36" },
    { icon: "09", name: "San Francisco", locationId: "200" },
    { icon: "10", name: "Paris", locationId: "42" },
    { icon: "11", name: "Las Vegas", locationId: "67" },
    { icon: "12", name: "Athens", locationId: "91" }
  ];

  const countries = [
    country("GB", "United Kingdom", "Historic cities, royal landmarks, countryside, coastlines, culture and iconic attractions.", "London|Edinburgh|Manchester|Liverpool|Birmingham|Bath|Oxford|Cambridge|York|Cardiff|Belfast|Glasgow|Brighton|Windsor|Stonehenge|Isle of Wight|Lake District|Isle of Skye|Inverness"),
    country("ES", "Spain", "Sunny beaches, vibrant cities, historic streets, food, islands and colourful culture.", "Barcelona|Madrid|Seville|Valencia|Granada|Malaga|Ibiza|Tenerife|Playa Blanca|Lanzarote|Alicante"),
    country("PT", "Portugal", "Sunny coastlines, colourful cities, islands, food, culture and relaxed Atlantic charm.", "Lisbon|Porto|Sintra|Cascais|Algarve|Madeira|Azores|Coimbra|Braga|Evora"),
    country("FR", "France", "Romantic cities, sunny coastlines, art, food, wine, landmarks and timeless charm.", "Paris|Nice|Lyon|Marseille|Bordeaux|Strasbourg|Toulouse|Mont Saint-Michel"),
    country("IT", "Italy", "Ancient cities, art, food, coastlines, piazzas, romance and world-famous landmarks.", "Rome|Venice|Florence|Milan|Naples|Pisa|Verona|Amalfi Coast"),
    country("GR", "Greece", "Sunny islands, ancient ruins, blue seas, whitewashed villages and relaxed Mediterranean beauty.", "Athens|Santorini|Mykonos|Crete|Rhodes"),
    country("IE", "Ireland", "Green landscapes, lively cities, coastal views, castles, music and warm local charm.", "Dublin|Galway|Cork|Killarney|Kilkenny|Limerick|Dingle|Waterford|Sligo"),
    country("AE", "United Arab Emirates", "Luxury skylines, desert adventures, beaches, shopping, landmarks and sunny city escapes.", "Dubai|Abu Dhabi"),
    country("US", "United States", "Famous cities, national landmarks, beaches, entertainment, culture and wide-open adventures.", "New York|Las Vegas|Los Angeles|Orlando|Miami|San Francisco|Washington DC|Chicago|Boston|New Orleans|Honolulu|Grand Canyon"),
    country("NL", "Netherlands", "Canals, cycling culture, museums, modern cities and charming historic streets.", "Amsterdam|Rotterdam|The Hague"),
    country("DE", "Germany", "Historic cities, castles, culture, rivers, museums and lively city experiences.", "Berlin|Munich|Hamburg|Frankfurt|Cologne|Dresden|Nuremberg|Heidelberg"),
    country("AT", "Austria", "Elegant cities, alpine scenery, classical music, historic streets and mountain views.", "Vienna|Salzburg"),
    country("CZ", "Czech Republic", "Fairytale streets, castles, historic squares and beautiful city views.", "Prague"),
    country("BE", "Belgium", "Charming cities, medieval squares, chocolate, culture, canals and historic architecture.", "Brussels|Bruges"),
    country("TR", "Turkey", "Historic cities, coastlines, bazaars, ancient sites, landscapes and rich cultural mix.", "Istanbul|Antalya|Cappadocia|Izmir|Bodrum"),
    country("TH", "Thailand", "Tropical beaches, temples, street food, islands, markets and warm sunny adventures.", "Bangkok|Phuket|Chiang Mai|Krabi|Pattaya|Koh Samui"),
    country("JP", "Japan", "Temples, neon cities, gardens, food, culture, technology and seasonal scenery.", "Tokyo|Kyoto|Osaka|Hiroshima"),
    country("SG", "Singapore", "Modern skyline, gardens, food markets, attractions, waterfronts and clean city energy.", "Singapore"),
    country("AU", "Australia", "Sunny coastlines, iconic cities, beaches, wildlife, reefs and outdoor adventures.", "Sydney|Melbourne|Brisbane|Gold Coast|Perth"),
    country("MA", "Morocco", "Souks, desert landscapes, colourful cities, mountains, coastlines and traditional charm.", "Marrakech|Casablanca|Fes|Chefchaouen|Rabat|Agadir"),
    country("ZA", "South Africa", "Coastlines, wildlife, mountains, cities, vineyards and safari experiences.", "Cape Town|Johannesburg|Durban|Pretoria|Kruger National Park"),
    country("CA", "Canada", "Nature, lakes, mountains, modern cities and outdoor experiences.", "Toronto|Vancouver|Montreal|Quebec City|Ottawa|Niagara Falls|Calgary|Banff"),
    country("MX", "Mexico", "Sunny beaches, ancient ruins, colourful towns, vibrant cities and rich cultural heritage.", "Mexico City|Cancun|Tulum|Playa del Carmen|Chichen Itza|Cozumel|Guadalajara"),
    country("HR", "Croatia", "Clear blue waters, historic coastal towns, island escapes and Mediterranean charm.", "Dubrovnik|Split"),
    country("EG", "Egypt", "Ancient temples, desert landscapes, Red Sea escapes and world-famous historic treasures.", "Cairo|Luxor|Aswan|Hurghada|Sharm El Sheikh|Giza"),
    country("IS", "Iceland", "Waterfalls, volcanic landscapes, glaciers, hot springs and unforgettable natural scenery.", "Reykjavik"),
    country("CH", "Switzerland", "Lakes, mountains, alpine towns, scenic railways and picture-perfect landscapes.", "Zurich|Geneva|Lucerne|Interlaken"),
    country("NO", "Norway", "Fjords, mountains, harbour cities, dramatic views and peaceful Nordic scenery.", "Oslo|Bergen"),
    country("SE", "Sweden", "Stylish cities, islands, waterfronts, museums, nature and calm Nordic atmosphere.", "Stockholm"),
    country("PL", "Poland", "Historic cities, old towns, castles, culture, food and heritage sites.", "Krakow|Warsaw"),
    country("DK", "Denmark", "Stylish cities, harbours, royal history, cosy culture and scenic waterfronts.", "Copenhagen"),
    country("NZ", "New Zealand", "Mountains, lakes, adventure activities, scenic roads and natural landscapes.", "Auckland|Queenstown"),
    country("BR", "Brazil", "Vibrant cities, golden beaches, music, rainforest wonders and energetic culture.", "Rio de Janeiro|Sao Paulo|Salvador|Brasilia|Foz do Iguacu"),
    country("VN", "Vietnam", "Lively cities, street food, historic sites, rivers, coastlines and beautiful landscapes.", "Hanoi|Ho Chi Minh City"),
    country("IN", "India", "Colourful cities, palaces, temples, markets, food, history and cultural richness.", "Delhi|Mumbai|Agra|Jaipur"),
    country("ID", "Indonesia", "Tropical islands, temples, beaches, forests, culture and island experiences.", "Bali|Jakarta"),
    country("MY", "Malaysia", "City skylines, tropical islands, markets, food, rainforests and cultural mix.", "Kuala Lumpur"),
    country("KR", "South Korea", "Lively cities, temples, food, culture, shopping, history and modern attractions.", "Seoul"),
    country("PH", "Philippines", "Tropical islands, beaches, clear waters, friendly cities and island adventures.", "Manila"),
    country("GG", "Channel Islands", "Coastal beauty, island heritage, beaches, harbour towns and relaxed seaside charm.", "Jersey|Guernsey|Alderney|Sark|Herm")
  ];

  const locationIds = {
    "Spain|Lanzarote": "421",
    "Spain|Alicante": "414",
    "Ireland|Cork": "1605",
    "Ireland|Killarney": "1621",
    "Ireland|Kilkenny": "1585",
    "Ireland|Limerick": "3477",
    "Ireland|Dingle": "32451",
    "Ireland|Waterford": "1643",
    "Ireland|Sligo": "32408"
  };

  const affiliateData = window.JA_AFFILIATE_WIDGET_DATA;
  const widgetRecords = countries.flatMap(function (item) {
    return item.destinations.map(function (destination) {
      return {
        countryName: item.name,
        countryCode: item.code,
        city: destination,
        destinationName: destination,
        destinationSlug: destination.toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        widgetName: `${destination} activities`,
        category: "activities attractions tours experiences",
        searchKeywords: [item.description, "GetYourGuide", "tickets", "things to do"],
        widgetCode: locationIds[`${item.name}|${destination}`] || "search-query",
        affiliateLink: getSearchUrl(`${destination}, ${item.name}`),
        availabilityStatus: "available"
      };
    });
  }).concat(featuredWidgets.map(function (item) {
    return {
      countryName: item.country,
      widgetName: item.title,
      category: "featured activity tour experience",
      searchKeywords: [item.text],
      widgetCode: item.tourId,
      affiliateLink: item.link,
      availabilityStatus: "available"
    };
  }));
  if (affiliateData) affiliateData.register("GetYourGuide", widgetRecords);

  const suggestions = ["London", "Paris", "Dubai", "New York", "Madeira", "Rome", "Barcelona", "Alicante", "Lanzarote", "Tenerife", "Lisbon", "Edinburgh", "Amsterdam", "Malaga", "Orlando", "Las Vegas", "Madrid", "Ibiza", "Porto", "Venice", "Florence", "Prague", "Berlin", "Vienna", "Bruges", "York", "Bath", "Windsor", "Stonehenge", "Abu Dhabi", "Singapore", "Bangkok", "Phuket", "Bali", "Cancun", "Marrakech", "Cape Town", "Dublin", "Galway", "Cork"];

  let selectedCountry = null;
  let selectedDestination = null;

  function country(code, name, description, destinations) {
    return { code, name, description, destinations: destinations.split("|") };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function countryImage(name) {
    const images = {
      "United Kingdom": "united-kingdom",
      "Spain": "spain",
      "Portugal": "portugal",
      "France": "france",
      "Italy": "italy",
      "Greece": "greece",
      "Ireland": "united-kingdom",
      "United Arab Emirates": "united-arab-emirates",
      "United States": "united-states",
      "Netherlands": "europe",
      "Germany": "europe",
      "Austria": "europe",
      "Czech Republic": "europe",
      "Belgium": "europe",
      "Turkey": "middle-east",
      "Thailand": "asia",
      "Japan": "japan",
      "Singapore": "asia",
      "Australia": "australia",
      "Morocco": "morocco",
      "South Africa": "travel",
      "Canada": "canada",
      "Mexico": "north-america",
      "Croatia": "europe",
      "Egypt": "middle-east",
      "Iceland": "europe",
      "Switzerland": "europe",
      "Norway": "europe",
      "Sweden": "europe",
      "Poland": "europe",
      "Denmark": "europe",
      "New Zealand": "oceania",
      "Brazil": "travel",
      "Vietnam": "asia",
      "India": "asia",
      "Indonesia": "asia",
      "Malaysia": "asia",
      "South Korea": "asia",
      "Philippines": "asia",
      "Channel Islands": "united-kingdom"
    };
    return `/assets/images/destinations/${images[name] || "travel"}.jpg`;
  }

  function countryMeta(name) {
    const meta = {
      "United Kingdom": ["Best for: 3–7 days", ["culture", "family", "attractions"], "Historic cities, royal landmarks, museums, theatre, countryside and easy day trips."],
      "Spain": ["Best for: 4–7 days", ["beaches", "food", "nightlife"], "Warm city breaks, coast, islands, architecture, food and lively local culture."],
      "Portugal": ["Best for: 4–7 days", ["food", "coast", "islands"], "Colourful cities, Atlantic coast, island landscapes and relaxed food-led travel."],
      "France": ["Best for: 3–7 days", ["culture", "food", "attractions"], "Museums, neighbourhoods, food, landmark attractions and varied regional day trips."],
      "Italy": ["Best for: 4–8 days", ["culture", "history", "food"], "Ancient cities, art, piazzas, food and memorable city-to-city routes."],
      "Greece": ["Best for: 5–7 days", ["history", "islands", "beaches"], "Ancient sites, island scenery, blue seas and relaxed Mediterranean experiences."],
      "United Arab Emirates": ["Best for: 3–5 days", ["attractions", "family", "desert"], "Modern skylines, beaches, landmark attractions, shopping and desert experiences."],
      "United States": ["Best for: 4–10 days", ["attractions", "cities", "family"], "Major cities, observation decks, entertainment, museums and memorable landmark experiences."],
      "Japan": ["Best for: 7–12 days", ["culture", "food", "cities"], "Contrasting cities, temples, gardens, food culture and efficient rail connections."]
    };
    return meta[name] || ["Best for: 2–5 days", ["culture", "attractions", "day trips"], "A useful starting point for tours, tickets and memorable things to do."];
  }

  function getSearchUrl(query) {
    return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${encodeURIComponent(PARTNER_ID)}&locale=${encodeURIComponent(LOCALE)}&currency=${encodeURIComponent(CURRENCY)}`;
  }

  let partnerScriptLoaded = false;
  function showWidgetFailure() {
    document.querySelectorAll(".provider-widget").forEach(function (widget) {
      if (widget.querySelector(".provider-widget-fallback")) return;
      widget.insertAdjacentHTML("beforeend", '<p class="provider-widget-fallback" role="status">Live GetYourGuide activities could not be loaded. Use the provider link to continue securely.</p>');
    });
  }

  function loadPartnerScript() {
    if (partnerScriptLoaded || document.querySelector('script[src*="widget.getyourguide.com/dist/pa.umd.production.min.js"]')) return;
    partnerScriptLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
    script.setAttribute("data-gyg-partner-id", PARTNER_ID);
    script.onerror = function () {
      console.warn("GetYourGuide partner content could not be loaded.");
      showWidgetFailure();
    };
    document.body.appendChild(script);
  }

  function renderBrowser() {
    const content = document.getElementById("gygBrowserContent");
    const search = document.getElementById("gygDestinationSearch");
    const suggestionsRoot = document.getElementById("gygSuggestions");
    const back = document.getElementById("gygBrowserBack");
    if (!content || !search || !suggestionsRoot || !back) return false;

    suggestionsRoot.innerHTML = suggestions.slice(0, 12).map(function (item) {
      return `<button type="button" data-suggestion="${escapeHtml(item)}">${escapeHtml(item)}</button>`;
    }).join("");

    function setTitle(title, help) {
      document.getElementById("gygBrowserTitle").textContent = title;
      document.getElementById("gygBrowserHelp").textContent = help;
    }

    function renderCountries(filter) {
      selectedCountry = null;
      selectedDestination = null;
      back.classList.remove("show");
      const term = (filter || "").trim().toLowerCase();
      const list = countries.filter(function (item) {
        const records = widgetRecords.filter(function (record) { return record.countryName === item.name; });
        return !term || records.some(function (record) {
          return affiliateData ? affiliateData.matches(record, term) : (`${item.name} ${item.code} ${item.description} ${item.destinations.join(" ")} activities attractions tours experiences`).toLowerCase().includes(term);
        });
      });
      setTitle(term ? "Search results" : "Countries", term ? `Showing matching countries and destinations for "${filter}".` : "Choose a country to view available destinations.");
      content.className = "partner-browser-grid";
      content.innerHTML = list.length ? list.map(function (item) {
        return `
          <button class="partner-browser-card" type="button" data-country="${escapeHtml(item.name)}" style="--partner-card-image:url('${escapeHtml(countryImage(item.name))}')">
            <div class="partner-browser-card-top"><span class="partner-country-code" aria-label="Country code ${escapeHtml(item.code)}">${escapeHtml(item.code)}</span><span>${item.destinations.length} ${item.destinations.length === 1 ? "destination" : "destinations"}</span></div>
            <div class="partner-browser-card-copy"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p></div>
            <span class="partner-card-action">Open country</span>
          </button>`;
      }).join("") : `<div class="partner-empty">No matching countries or destinations found.</div>`;
    }

    function renderCountryPage(country, destination) {
      selectedCountry = country;
      selectedDestination = destination || null;
      const meta = countryMeta(country.name);
      const tags = meta[1].map(function (tag) { return `<span>${escapeHtml(tag)}</span>`; }).join("");
      const query = selectedDestination ? `${selectedDestination}, ${country.name}` : "";
      const locationId = selectedDestination ? locationIds[`${country.name}|${selectedDestination}`] : "";
      const url = selectedDestination ? getSearchUrl(query) : "";
      back.classList.add("show");
      setTitle(country.name, country.description);
      content.className = "partner-browser-result";
      content.innerHTML = `
        <section class="partner-country-page">
          <div class="partner-country-hero">
            <div>
              <span class="kicker">Choose a destination</span>
              <h3>${escapeHtml(country.name)}</h3>
              <p>${escapeHtml(country.description)} Select a destination below to browse current experiences.</p>
              <div class="partner-country-meta"><strong>${escapeHtml(meta[0])}</strong><div>${tags}</div></div>
              <div class="partner-why-visit"><h4>Why visit</h4><p>${escapeHtml(meta[2])}</p></div>
            </div>
            <img src="${escapeHtml(countryImage(country.name))}" alt="${escapeHtml(country.name)} destination scenery" loading="lazy">
          </div>
          <div class="partner-destination-tabs" aria-label="${escapeHtml(country.name)} destinations">
            ${country.destinations.map(function (item) {
              return `<button class="${item === selectedDestination ? "active" : ""}" type="button" data-destination="${escapeHtml(item)}">${escapeHtml(item)}</button>`;
            }).join("")}
          </div>
          <div class="partner-widget-stage">
            ${selectedDestination ? `
              <div class="partner-widget-heading">
                <span class="kicker">Now showing</span>
                <h4>${escapeHtml(query)}</h4>
                <p>Browse activities, attractions, tours and experiences for this destination.</p>
              </div>
              <div class="provider-widget destination-provider-widget">
                <div
                  data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                  data-gyg-widget="activities"
                  data-gyg-partner-id="${PARTNER_ID}"
                  ${locationId ? `data-gyg-location-id="${escapeHtml(locationId)}"` : `data-gyg-q="${escapeHtml(query)}"`}
                  data-gyg-locale-code="${LOCALE}"
                  data-gyg-currency="${CURRENCY}"
                  data-gyg-number-of-items="${ITEMS}"
                  data-gyg-cmp="jags-find-activities-tours">
                  <span>Powered by <a target="_blank" rel="sponsored noopener noreferrer" href="${escapeHtml(url)}">GetYourGuide</a></span>
                </div>
              </div>
              <a class="button accent" href="${escapeHtml(url)}" target="_blank" rel="sponsored noopener noreferrer">View more ${escapeHtml(selectedDestination)} activities</a>
            ` : `
              <div class="partner-widget-empty">
                <span class="kicker">Select a destination</span>
                <h4>Choose a city or area above.</h4>
                <p>Tours and experiences will appear here after you choose a destination.</p>
              </div>
            `}
          </div>
        </section>`;
      if (selectedDestination) loadPartnerScript();
    }

    content.addEventListener("click", function (event) {
      const countryButton = event.target.closest("[data-country]");
      const destinationButton = event.target.closest("[data-destination]");
      if (countryButton) {
        const country = countries.find(function (item) { return item.name === countryButton.dataset.country; });
        if (country) renderCountryPage(country);
      }
      if (destinationButton && selectedCountry) {
        renderCountryPage(selectedCountry, destinationButton.dataset.destination);
      }
    });

    back.addEventListener("click", function () {
      selectedCountry = null;
      selectedDestination = null;
      search.value = "";
      renderCountries("");
    });

    search.addEventListener("input", function () {
      renderCountries(search.value);
    });

    suggestionsRoot.addEventListener("click", function (event) {
      const button = event.target.closest("[data-suggestion]");
      if (!button) return;
      search.value = button.dataset.suggestion;
      renderCountries(search.value);
    });

    renderCountries("");
    return true;
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

  renderBrowser();
})();
