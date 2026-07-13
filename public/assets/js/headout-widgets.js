(function () {
  const SCRIPT_SRC = "https://partner.headout.com/embed/script?affiliate_code=JL2D9u&currency=GBP&utm_source=https://tours.jagroupservices.co.uk&language=en";

  const headoutDestinations = [
    { slug: "london", name: "London", cityCode: "LONDON" },
    { slug: "lisbon", name: "Lisbon", cityCode: "LISBON" },
    { slug: "new-york", name: "New York", cityCode: "NEW_YORK" },
    { slug: "paris", name: "Paris", cityCode: "PARIS" },
    { slug: "rome", name: "Rome", cityCode: "ROME" },
    { slug: "barcelona", name: "Barcelona", cityCode: "BARCELONA" },
    { slug: "dubai", name: "Dubai", cityCode: "DUBAI" },
    { slug: "amsterdam", name: "Amsterdam", cityCode: "AMSTERDAM" },
    { slug: "orlando", name: "Orlando", cityCode: "ORLANDO" },
    { slug: "singapore", name: "Singapore", cityCode: "SINGAPORE" },
    { slug: "abu-dhabi", name: "Abu Dhabi", cityCode: "ABU_DHABI" },
    { slug: "edinburgh", name: "Edinburgh", cityCode: "EDINBURGH" },
    { slug: "venice", name: "Venice", cityCode: "VENICE" },
    { slug: "florence", name: "Florence", cityCode: "FLORENCE" },
    { slug: "madrid", name: "Madrid", cityCode: "MADRID" },
    { slug: "prague", name: "Prague", cityCode: "PRAGUE" },
    { slug: "vienna", name: "Vienna", cityCode: "VIENNA" },
    { slug: "berlin", name: "Berlin", cityCode: "BERLIN" },
    { slug: "athens", name: "Athens", cityCode: "ATHENS" },
    { slug: "istanbul", name: "Istanbul", cityCode: "ISTANBUL" },
    { slug: "bangkok", name: "Bangkok", cityCode: "BANGKOK" },
    { slug: "tokyo", name: "Tokyo", cityCode: "TOKYO" },
    { slug: "porto", name: "Porto", cityCode: "PORTO" },
    { slug: "algarve", name: "Algarve", cityCode: "ALGARVE" },
    { slug: "funchal", name: "Funchal", cityCode: "FUNCHAL" },
    { slug: "madeira", name: "Madeira", cityCode: "FUNCHAL" },
    { slug: "manchester", name: "Manchester", cityCode: "MANCHESTER" },
    { slug: "liverpool", name: "Liverpool", cityCode: "LIVERPOOL" },
    { slug: "york", name: "York", cityCode: "YORK" },
    { slug: "alicante", name: "Alicante", cityCode: "ALICANTE" },
    { slug: "rhodes", name: "Rhodes", cityCode: "RHODES" },
    { slug: "tenerife", name: "Tenerife", cityCode: "TENERIFE" },
    { slug: "santorini", name: "Santorini", cityCode: "SANTORINI" },
    { slug: "sao-paulo", name: "Sao Paulo", cityCode: "SAO_PAULO" },
    { slug: "rotterdam", name: "Rotterdam", cityCode: "ROTTERDAM" },
    { slug: "normandy", name: "Normandy", cityCode: "NORMANDY" },
    { slug: "marrakech", name: "Marrakech", cityCode: "MARRAKESH" },
    { slug: "malaga", name: "Malaga", cityCode: "MALAGA" },
    { slug: "las-vegas", name: "Las Vegas", cityCode: "LAS_VEGAS" },
    { slug: "ibiza", name: "Ibiza", cityCode: "IBIZA" },
    { slug: "dublin", name: "Dublin", cityCode: "DUBLIN" },
    { slug: "cape-town", name: "Cape Town", cityCode: "CAPE_TOWN" },
    { slug: "budapest", name: "Budapest", cityCode: "BUDAPEST" },
    { slug: "belfast", name: "Belfast", cityCode: "BELFAST" },
    { slug: "albufeira", name: "Albufeira", cityCode: "ALBUFEIRA" }
  ];

  const madeiraLinks = [
    {
      title: "Yellow Bus Madeira, Funchal, Camara de Lobos and Cabo Girao",
      href: "https://www.headout.com/hop-on-hop-off-bus-tours/yellow-bus-madeira-funchal-camara-de-lobos-cabo-girao-3-in-1-hop-on-hop-off-bus-tour-e-19695/?utm_source=https%3A%2F%2Ftours.jagroupservices.co.uk&utm_medium=affiliate&affiliate_code=JL2D9u&utm_campaign=madeira&languageCode=en&currencyCode=GBP&utm_content=link"
    },
    {
      title: "City Sightseeing Funchal hop-on hop-off bus tour",
      href: "https://www.headout.com/hop-on-hop-off-bus-tours/city-sightseeing-funchal-hop-on-hop-off-bus-tour-e-33226/?utm_source=https%3A%2F%2Ftours.jagroupservices.co.uk&utm_medium=affiliate&affiliate_code=JL2D9u&utm_campaign=madeira&languageCode=en&currencyCode=GBP&utm_content=link"
    }
  ];

  const headoutCountries = [
    country("GB", "United Kingdom", "Tours and experiences for selected UK destinations.", ["london", "edinburgh", "manchester", "liverpool", "york", "belfast"]),
    country("PT", "Portugal", "Tours and experiences across Portugal, Madeira and the Algarve.", ["lisbon", "porto", "algarve", "funchal", "madeira", "albufeira"]),
    country("ES", "Spain", "Tours and experiences for mainland Spain and selected islands.", ["barcelona", "madrid", "alicante", "malaga", "tenerife", "ibiza"]),
    country("FR", "France", "Tours and experiences for selected French destinations.", ["paris", "normandy"]),
    country("IT", "Italy", "Tours and experiences for selected Italian cities.", ["rome", "venice", "florence"]),
    country("GR", "Greece", "Tours and experiences for selected Greek destinations.", ["athens", "rhodes", "santorini"]),
    country("AE", "United Arab Emirates", "Tours and experiences for Dubai and Abu Dhabi.", ["dubai", "abu-dhabi"]),
    country("US", "United States", "Tours and experiences for selected United States destinations.", ["new-york", "orlando", "las-vegas"]),
    country("NL", "Netherlands", "Tours and experiences for selected Netherlands destinations.", ["amsterdam", "rotterdam"]),
    country("DE", "Germany", "Tours and experiences for selected German destinations.", ["berlin"]),
    country("AT", "Austria", "Tours and experiences for selected Austrian destinations.", ["vienna"]),
    country("CZ", "Czech Republic", "Tours and experiences for Prague and nearby highlights.", ["prague"]),
    country("TR", "Turkey", "Tours and experiences for selected Turkish destinations.", ["istanbul"]),
    country("TH", "Thailand", "Tours and experiences for selected Thai destinations.", ["bangkok"]),
    country("JP", "Japan", "Tours and experiences for selected Japanese destinations.", ["tokyo"]),
    country("SG", "Singapore", "Tours and experiences for Singapore.", ["singapore"]),
    country("MA", "Morocco", "Tours and experiences for selected Moroccan destinations.", ["marrakech"]),
    country("ZA", "South Africa", "Tours and experiences for selected South African destinations.", ["cape-town"]),
    country("HU", "Hungary", "Tours and experiences for selected Hungarian destinations.", ["budapest"]),
    country("BR", "Brazil", "Tours and experiences for selected Brazilian destinations.", ["sao-paulo"])
  ];

  const affiliateData = window.JA_AFFILIATE_WIDGET_DATA;
  const widgetRecords = headoutCountries.flatMap(function (item) {
    return item.destinationSlugs.map(function (slug) {
      const destination = getDestinationBySlug(slug);
      return {
        countryName: item.name,
        countryCode: item.code,
        city: destination?.name || slug,
        destinationName: destination?.name || slug,
        destinationSlug: slug,
        widgetName: `${destination?.name || slug} Headout gallery`,
        category: "activities attractions tours experiences tickets",
        searchKeywords: [item.description, "Headout", "things to do"],
        widgetCode: destination?.cityCode || "",
        affiliateLink: slug === "madeira" ? madeiraLinks[0]?.href : "",
        availabilityStatus: destination ? "available" : "unavailable"
      };
    });
  });
  if (affiliateData) affiliateData.register("Headout", widgetRecords);

  let selectedHeadoutCountry = null;
  let selectedHeadoutDestination = null;

  function country(code, name, description, destinationSlugs) {
    return { code, name, description, destinationSlugs };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function getDestinationBySlug(slug) {
    return headoutDestinations.find(function (destination) {
      return destination.slug === slug;
    });
  }

  function renderGallery(destination) {
    return `
      <div class="headout-gallery" data-headout-city="${escapeHtml(destination.cityCode)}">
        <div data-hawt="gallery" data-city="${escapeHtml(destination.cityCode)}" data-max-count="100" data-show-read-more="[object Object]"></div>
      </div>`;
  }

  function countryImage(name) {
    const images = {
      "United Kingdom": "united-kingdom",
      "Portugal": "portugal",
      "Spain": "spain",
      "France": "france",
      "Italy": "italy",
      "Greece": "greece",
      "United Arab Emirates": "united-arab-emirates",
      "United States": "united-states",
      "Netherlands": "europe",
      "Germany": "europe",
      "Austria": "europe",
      "Czech Republic": "europe",
      "Turkey": "middle-east",
      "Thailand": "asia",
      "Japan": "japan",
      "Singapore": "asia",
      "Morocco": "morocco",
      "South Africa": "travel",
      "Hungary": "europe",
      "Brazil": "travel"
    };
    return `/assets/images/destinations/${images[name] || "travel"}.jpg`;
  }

  function countryMeta(name) {
    const meta = {
      "United Kingdom": ["Best for: 3–5 days", ["culture", "family", "attractions"], "Historic cities, major landmarks, theatre, museums and easy-to-combine city breaks."],
      "Portugal": ["Best for: 4–7 days", ["food", "coast", "islands"], "Colourful cities, Atlantic coast, island scenery and relaxed cultural discovery."],
      "Spain": ["Best for: 4–7 days", ["beaches", "food", "nightlife"], "Vibrant cities, Mediterranean coast, island breaks and lively neighbourhoods."],
      "France": ["Best for: 3–5 days", ["culture", "food", "attractions"], "Classic city sights, museums, food, neighbourhoods and memorable day trips."],
      "Italy": ["Best for: 4–7 days", ["culture", "history", "food"], "Ancient landmarks, art, piazzas, food and city-to-city cultural routes."],
      "Greece": ["Best for: 5–7 days", ["history", "islands", "beaches"], "Ancient sites, island views, blue seas and relaxed Mediterranean days."],
      "United Arab Emirates": ["Best for: 3–5 days", ["attractions", "family", "desert"], "Modern skylines, beaches, landmark attractions and desert experiences."],
      "United States": ["Best for: 4–7 days", ["attractions", "cities", "family"], "Big-city icons, entertainment, observation decks and landmark experiences."]
    };
    return meta[name] || ["Best for: 2–4 days", ["culture", "attractions", "day trips"], "A useful starting point for tours, tickets and memorable things to do."];
  }

  function loadHeadoutScript() {
    if (document.querySelector('script[src*="partner.headout.com/embed/script"]')) {
      initialiseHeadoutWidgets();
      return;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = SCRIPT_SRC;
    script.onload = function () {
      try {
        if (typeof HWS !== "undefined" && HWS.init) HWS.init();
      } catch (error) {
        console.warn("Headout partner content could not be initialised.", error);
      }
    };
    script.onerror = function () {
      console.warn("Headout partner content could not be loaded.");
      document.querySelectorAll(".headout-gallery").forEach(function (gallery) {
        if (gallery.querySelector(".provider-widget-fallback")) return;
        gallery.insertAdjacentHTML("beforeend", '<p class="provider-widget-fallback" role="status">Live Headout activities could not be loaded. Please try again later or use an available provider link.</p>');
      });
    };
    document.body.appendChild(script);
  }

  function initialiseHeadoutWidgets() {
    window.setTimeout(function () {
      try {
        if (typeof HWS !== "undefined" && HWS.init) HWS.init();
      } catch (error) {
        console.warn("Headout partner content could not be initialised.", error);
      }
    }, 0);
  }

  function renderDestinationWidget() {
    const root = document.getElementById("destinationGuide");
    if (!root) return false;
    const destination = getDestinationBySlug(root.dataset.slug);
    if (!destination) return false;
    const supportSection = document.getElementById("support");
    const section = document.createElement("section");
    section.className = "section alt headout-destination-section";
    section.id = "headout-activities";
    section.innerHTML = `
      <div class="container">
        <div class="section-heading left">
          <span class="kicker">Headout activities</span>
          <h2>Browse ${escapeHtml(destination.name)} experiences</h2>
          <p>Use the Headout gallery to view current third-party attractions, tours and activity options for ${escapeHtml(destination.name)}.</p>
        </div>
        ${renderGallery(destination)}
        ${destination.slug === "madeira" ? renderMadeiraLinks() : ""}
        <div class="notice affiliate-notice"><strong>Affiliate disclosure:</strong> Bookings made through Headout are made with Headout or the relevant third-party provider. JA Group Services Ltd may receive a commission where eligible.</div>
      </div>`;
    if (supportSection) {
      supportSection.before(section);
    } else {
      root.appendChild(section);
    }
    return true;
  }

  function renderMadeiraLinks() {
    return `
      <div class="headout-link-grid">
        ${madeiraLinks.map(function (link) {
          return `<a class="headout-link-card" href="${escapeHtml(link.href)}" target="_blank" rel="sponsored noopener noreferrer"><span>Madeira affiliate link</span><strong>${escapeHtml(link.title)}</strong></a>`;
        }).join("")}
      </div>`;
  }

  function renderHeadoutDirectory() {
    const grid = document.getElementById("headoutWidgetGrid");
    if (!grid) return false;
    const search = document.getElementById("headoutDestinationSearch");
    const searchStatus = document.getElementById("headoutSearchStatus");
    const title = document.getElementById("headoutBrowserTitle");
    const help = document.getElementById("headoutBrowserHelp");
    const back = document.getElementById("headoutBrowserBack");

    function renderCountries(filter) {
      selectedHeadoutCountry = null;
      selectedHeadoutDestination = null;
      const term = String(filter || "").trim().toLocaleLowerCase("en-GB");
      const visibleCountries = headoutCountries.filter(function (item) {
        const records = widgetRecords.filter(function (record) { return record.countryName === item.name; });
        return !term || records.some(function (record) {
          return affiliateData ? affiliateData.matches(record, term) : (`${item.name} ${item.code} ${item.description} ${item.destinationSlugs.join(" ")} activities attractions tours experiences`).toLowerCase().includes(term);
        });
      });
      if (title) title.textContent = term ? "Search results" : "Countries";
      if (help) help.textContent = term ? `Showing Headout countries and destinations matching "${String(filter).trim()}".` : "Choose a country to view available destinations.";
      if (searchStatus) searchStatus.textContent = visibleCountries.length ? `${visibleCountries.length} ${visibleCountries.length === 1 ? "country" : "countries"} shown.` : "No matching Headout widgets found.";
      if (back) back.classList.remove("show");
      grid.className = "partner-browser-grid headout-widget-grid";
      grid.innerHTML = visibleCountries.length ? visibleCountries.map(function (item) {
        const destinations = item.destinationSlugs.map(getDestinationBySlug).filter(Boolean);
        return `
          <button class="partner-browser-card" type="button" data-headout-country="${escapeHtml(item.name)}" style="--partner-card-image:url('${escapeHtml(countryImage(item.name))}')">
            <div class="partner-browser-card-top"><span class="partner-country-code" aria-label="Country code ${escapeHtml(item.code)}">${escapeHtml(item.code)}</span><span>${destinations.length} ${destinations.length === 1 ? "destination" : "destinations"}</span></div>
            <div class="partner-browser-card-copy"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p></div>
            <span class="partner-card-action">Open country</span>
          </button>`;
      }).join("") : '<div class="partner-empty" role="status"><h3>No Headout widgets found</h3><p>Try another country, city, attraction, activity or tour name.</p></div>';
    }

    function renderCountryPage(item, destinationSlug) {
      const destinations = item.destinationSlugs.map(getDestinationBySlug).filter(Boolean);
      const destination = destinationSlug ? getDestinationBySlug(destinationSlug) : null;
      const meta = countryMeta(item.name);
      const tags = meta[1].map(function (tag) { return `<span>${escapeHtml(tag)}</span>`; }).join("");
      selectedHeadoutCountry = item;
      selectedHeadoutDestination = destination || null;
      if (title) title.textContent = item.name;
      if (help) help.textContent = item.description;
      if (back) back.classList.add("show");
      grid.className = "partner-browser-result";
      grid.innerHTML = `
        <section class="partner-country-page">
          <div class="partner-country-hero">
            <div>
              <span class="kicker">Choose a destination</span>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.description)} Select a destination below to browse current experiences.</p>
              <div class="partner-country-meta"><strong>${escapeHtml(meta[0])}</strong><div>${tags}</div></div>
              <div class="partner-why-visit"><h4>Why visit</h4><p>${escapeHtml(meta[2])}</p></div>
            </div>
            <img src="${escapeHtml(countryImage(item.name))}" alt="${escapeHtml(item.name)} destination scenery" loading="lazy">
          </div>
          <div class="partner-destination-tabs" aria-label="${escapeHtml(item.name)} destinations">
            ${destinations.map(function (entry) {
              return `<button class="${destination && entry.slug === destination.slug ? "active" : ""}" type="button" data-headout-destination="${escapeHtml(entry.slug)}">${escapeHtml(entry.name)}</button>`;
            }).join("")}
          </div>
          <div class="partner-widget-stage">
            ${destination ? `
              <div class="partner-widget-heading">
                <span class="kicker">Now showing</span>
                <h4>${escapeHtml(destination.name)}</h4>
                <p>Browse current Headout activities, attractions and tours for ${escapeHtml(destination.name)}.</p>
              </div>
              ${renderGallery(destination)}
              ${destination.slug === "madeira" ? renderMadeiraLinks() : ""}
            ` : `
              <div class="partner-widget-empty">
                <span class="kicker">Select a destination</span>
                <h4>Choose a city or area above.</h4>
                <p>Tours and experiences will appear here after you choose a destination.</p>
              </div>
            `}
          </div>
        </section>`;
      if (destination) loadHeadoutScript();
    }

    grid.addEventListener("click", function (event) {
      const countryButton = event.target.closest("[data-headout-country]");
      const destinationButton = event.target.closest("[data-headout-destination]");
      if (countryButton) {
        const item = headoutCountries.find(function (entry) { return entry.name === countryButton.dataset.headoutCountry; });
        if (item) renderCountryPage(item);
      }
      if (destinationButton && selectedHeadoutCountry) {
        renderCountryPage(selectedHeadoutCountry, destinationButton.dataset.headoutDestination);
      }
    });

    if (back) {
      back.addEventListener("click", function () {
        if (search) search.value = "";
        renderCountries("");
      });
    }

    search?.addEventListener("input", function () {
      renderCountries(search.value);
    });

    renderCountries("");
    return true;
  }

  function renderLegacyHeadoutDirectory() {
    const grid = document.getElementById("headoutWidgetGrid");
    if (!grid) return false;
    grid.innerHTML = headoutDestinations.map(function (destination) {
      return `
        <article class="headout-widget-section">
          <div class="section-heading left">
            <span class="kicker">Headout</span>
            <h2>${escapeHtml(destination.name)}</h2>
          </div>
          ${renderGallery(destination)}
        </article>`;
    }).join("");
    return true;
  }

  const renderedDestinationWidget = renderDestinationWidget();
  const renderedDirectory = renderHeadoutDirectory();
  if (renderedDestinationWidget || (!renderedDirectory && document.querySelector("[data-hawt]"))) loadHeadoutScript();

  window.JA_HEADOUT_DESTINATIONS = headoutDestinations;
})();
