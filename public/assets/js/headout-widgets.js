(function () {
  const SCRIPT_SRC = "https://partner.headout.com/embed/script?affiliate_code=JL2D9u&currency=GBP&utm_source=https%3A%2F%2Ftours.jagroupservices.co.uk&language=en";

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
        <div data-hawt="gallery" data-city="${escapeHtml(destination.cityCode)}" data-max-count="100"></div>
      </div>`;
  }

  function loadHeadoutScript() {
    if (document.querySelector('script[src*="partner.headout.com/embed/script"]')) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = SCRIPT_SRC;
    document.body.appendChild(script);
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
    grid.innerHTML = headoutDestinations.map(function (destination) {
      return `
        <article class="partner-experience-card headout-card">
          <div class="partner-card-top">
            <span class="partner-card-icon">HD</span>
            <span class="partner-card-pill">${escapeHtml(destination.name)}</span>
          </div>
          <h4>${escapeHtml(destination.name)} experiences</h4>
          <p>Browse current Headout activity and attraction options for ${escapeHtml(destination.name)}.</p>
          ${renderGallery(destination)}
        </article>`;
    }).join("");
    return true;
  }

  const rendered = renderDestinationWidget() || renderHeadoutDirectory() || document.querySelector("[data-hawt]");
  if (rendered) loadHeadoutScript();

  window.JA_HEADOUT_DESTINATIONS = headoutDestinations;
})();
