const destinationProfiles = {
  "united-kingdom": {
    type: "Country", region: "Europe", capital: "London", currency: "Pound sterling (GBP)", languages: "English; Welsh is also official in Wales", suggestedStay: "5–14 days",
    summary: "A varied destination for city breaks, coast, countryside, heritage, theatre and family attractions, with extensive rail and road connections.",
    highlights: ["London and its museums, theatre and landmarks", "Historic cities including Bath, York and Edinburgh", "Coastal breaks, national parks and countryside", "Family attractions and accessible visitor venues"],
    plan: ["Begin with the region and pace that suit you", "Group nearby attractions to reduce unnecessary travel", "Keep one weather-proof alternative each day", "Check rail engineering work and venue access before travel"]
  },
  spain: {
    type: "Country", region: "Europe", capital: "Madrid", currency: "Euro (EUR)", languages: "Spanish; regional languages are also used", suggestedStay: "5–14 days",
    summary: "Spain offers major cultural cities, Mediterranean and Atlantic coastlines, islands, food-focused breaks and varied regional identities.",
    highlights: ["Barcelona architecture and coast", "Madrid museums and neighbourhoods", "Andalusia's historic cities", "Balearic and Canary Island breaks"],
    plan: ["Choose one region for a shorter trip", "Allow for later dining times and seasonal heat", "Pre-book high-demand landmarks", "Check local and regional transport options"]
  },
  portugal: {
    type: "Country", region: "Europe", capital: "Lisbon", currency: "Euro (EUR)", languages: "Portuguese", suggestedStay: "4–12 days",
    summary: "Portugal combines compact historic cities, Atlantic coast, island landscapes and relaxed food-led travel.",
    highlights: ["Lisbon viewpoints and neighbourhoods", "Porto and the Douro", "Algarve beaches and towns", "Madeira and the Azores"],
    plan: ["Use public transport in the main cities", "Allow extra time for hills and cobbled streets", "Check seasonal island weather", "Build coastal plans around realistic transfer times"]
  },
  france: {
    type: "Country", region: "Europe", capital: "Paris", currency: "Euro (EUR)", languages: "French", suggestedStay: "5–14 days",
    summary: "France supports city, coast, countryside, food, arts and family travel, with strong intercity rail links.",
    highlights: ["Paris museums and neighbourhoods", "The French Riviera", "Loire and Provence", "Alpine and Atlantic regions"],
    plan: ["Avoid trying to cover too many regions", "Reserve major museums and long-distance trains", "Check local opening days", "Consider a city-plus-region itinerary"]
  },
  italy: {
    type: "Country", region: "Europe", capital: "Rome", currency: "Euro (EUR)", languages: "Italian", suggestedStay: "6–14 days",
    summary: "Italy is best planned region by region, combining historic cities, food, coast, lakes and countryside.",
    highlights: ["Rome's ancient and religious sites", "Florence and Tuscany", "Venice and the Veneto", "Naples, islands and southern coastlines"],
    plan: ["Select two or three bases at most", "Pre-book major cultural sites", "Check city visitor charges and local rules", "Allow transfer time between regions"]
  },
  greece: {
    type: "Country", region: "Europe", capital: "Athens", currency: "Euro (EUR)", languages: "Greek", suggestedStay: "6–14 days",
    summary: "Greece combines ancient sites, mainland landscapes and islands with very different transport and seasonal patterns.",
    highlights: ["Athens and the Acropolis", "Cycladic islands", "Crete and Rhodes", "Mainland heritage and nature"],
    plan: ["Keep island combinations realistic", "Confirm ferry schedules close to travel", "Plan around summer heat", "Allow weather contingency for sea transfers"]
  },
  japan: {
    type: "Country", region: "Asia", capital: "Tokyo", currency: "Japanese yen (JPY)", languages: "Japanese", suggestedStay: "8–16 days",
    summary: "Japan rewards careful route planning, with efficient transport, major cities, historic districts, food culture and seasonal landscapes.",
    highlights: ["Tokyo's contrasting districts", "Kyoto temples and gardens", "Osaka food and entertainment", "Regional rail journeys and nature"],
    plan: ["Choose a logical rail route", "Avoid changing hotels every night", "Research luggage forwarding and station access", "Book seasonal or limited-entry experiences early"]
  },
  thailand: {
    type: "Country", region: "Asia", capital: "Bangkok", currency: "Thai baht (THB)", languages: "Thai", suggestedStay: "8–16 days",
    summary: "Thailand combines Bangkok, northern culture and a wide choice of island and coastal areas with strong seasonal differences.",
    highlights: ["Bangkok temples, markets and food", "Chiang Mai and northern Thailand", "Andaman coast and Gulf islands", "Nature and cultural day trips"],
    plan: ["Match coast choice to season", "Avoid overloading a short trip with domestic flights", "Use licensed transport providers", "Check animal-experience welfare standards"]
  },
  "united-states": {
    type: "Country", region: "North America", capital: "Washington, DC", currency: "US dollar (USD)", languages: "English is most widely used; Spanish is also common", suggestedStay: "7–21 days",
    summary: "The United States requires region-led planning because distances, transport and trip styles vary substantially.",
    highlights: ["New York and major east-coast cities", "California cities and coast", "Florida attractions", "National parks and scenic routes"],
    plan: ["Plan one region at a time", "Check entry requirements using official sources", "Budget for taxes, tips and resort charges", "Confirm travel insurance and healthcare cover"]
  },
  canada: {
    type: "Country", region: "North America", capital: "Ottawa", currency: "Canadian dollar (CAD)", languages: "English and French", suggestedStay: "7–18 days",
    summary: "Canada offers city breaks, rail and road trips, mountain landscapes and wildlife, with very large distances between regions.",
    highlights: ["Toronto and Niagara", "Montréal and Québec City", "Vancouver and the west coast", "Rockies and national parks"],
    plan: ["Choose east or west for a shorter trip", "Plan seasonal clothing carefully", "Reserve popular park accommodation early", "Check realistic driving times"]
  },
  australia: {
    type: "Country", region: "Oceania", capital: "Canberra", currency: "Australian dollar (AUD)", languages: "English is the principal language", suggestedStay: "10–28 days",
    summary: "Australia needs realistic distance planning, whether the focus is major cities, coast, wildlife, reef or inland landscapes.",
    highlights: ["Sydney and New South Wales", "Melbourne and Victoria", "Queensland coast and reef", "Western Australia and the Red Centre"],
    plan: ["Limit a shorter trip to one or two regions", "Factor domestic flights into the budget", "Check weather by region", "Use official guidance for wildlife and remote travel"]
  },
  "united-arab-emirates": {
    type: "Country", region: "Middle East", capital: "Abu Dhabi", currency: "UAE dirham (AED)", languages: "Arabic; English is widely used in visitor settings", suggestedStay: "4–9 days",
    summary: "The UAE offers modern city breaks, beaches, cultural attractions and desert experiences, with strong heat and local-law considerations.",
    highlights: ["Dubai architecture and attractions", "Abu Dhabi museums and landmarks", "Beach and resort areas", "Desert landscapes"],
    plan: ["Plan indoor breaks during hotter months", "Read current local-law guidance", "Check attraction transfer distances", "Choose reputable licensed activity providers"]
  },
  morocco: {
    type: "Country", region: "North Africa", capital: "Rabat", currency: "Moroccan dirham (MAD)", languages: "Arabic and Amazigh; French is widely used", suggestedStay: "5–12 days",
    summary: "Morocco combines historic cities, Atlantic coast, mountains and desert routes, with a pace and culture that benefit from preparation.",
    highlights: ["Marrakech medina and gardens", "Fes and historic centres", "Atlas Mountains", "Atlantic coast and desert routes"],
    plan: ["Choose accommodation location carefully", "Use licensed guides and transport", "Plan conservatively around long road journeys", "Review local customs and current official advice"]
  }
};

const cityProfiles = {
  london: ["United Kingdom", "Pound sterling (GBP)", "3–5 days", "World-class museums, theatre, royal landmarks, neighbourhoods and extensive public transport."],
  lisbon: ["Portugal", "Euro (EUR)", "3–4 days", "A hilly, characterful city known for viewpoints, historic trams, food and easy day trips."],
  barcelona: ["Spain", "Euro (EUR)", "3–5 days", "Mediterranean city combining Gaudí architecture, neighbourhood culture, food and coast."],
  paris: ["France", "Euro (EUR)", "3–5 days", "Major museums, architecture, neighbourhoods and food, best approached by grouping nearby sights."],
  rome: ["Italy", "Euro (EUR)", "3–5 days", "Ancient sites, religious landmarks, neighbourhoods and food, with high-demand attractions requiring planning."],
  tokyo: ["Japan", "Japanese yen (JPY)", "4–6 days", "A large, efficient and varied city where district-based planning keeps each day manageable."],
  "new-york": ["United States", "US dollar (USD)", "4–6 days", "Dense neighbourhoods, major museums, observation decks, theatre and extensive public transport."],
  dubai: ["United Arab Emirates", "UAE dirham (AED)", "3–5 days", "Modern attractions, beaches, shopping and desert experiences, with substantial travel between areas."],
  amsterdam: ["Netherlands", "Euro (EUR)", "3–4 days", "Canals, museums and compact neighbourhoods, with busy central areas and advance-book attractions."],
  madeira: ["Portugal", "Euro (EUR)", "5–8 days", "Mountain, coast and garden travel with changing weather and drive-time considerations."]
};

const basicCountryData = {
  albania: ["Europe", "Tirana", "Albanian lek (ALL)", "Albanian", "5–10 days"],
  austria: ["Europe", "Vienna", "Euro (EUR)", "German", "4–10 days"],
  bahamas: ["Caribbean", "Nassau", "Bahamian dollar (BSD)", "English", "5–10 days"],
  barbados: ["Caribbean", "Bridgetown", "Barbadian dollar (BBD)", "English", "5–10 days"],
  belgium: ["Europe", "Brussels", "Euro (EUR)", "Dutch, French and German", "3–7 days"],
  "bosnia-and-herzegovina": ["Europe", "Sarajevo", "Convertible mark (BAM)", "Bosnian, Croatian and Serbian", "5–10 days"],
  bulgaria: ["Europe", "Sofia", "Confirm current currency before travel", "Bulgarian", "5–10 days"],
  croatia: ["Europe", "Zagreb", "Euro (EUR)", "Croatian", "5–12 days"],
  cyprus: ["Europe", "Nicosia", "Euro (EUR) in the Republic of Cyprus", "Greek and Turkish", "5–10 days"],
  "czech-republic": ["Europe", "Prague", "Czech koruna (CZK)", "Czech", "4–9 days"],
  denmark: ["Europe", "Copenhagen", "Danish krone (DKK)", "Danish", "4–8 days"],
  "dominican-republic": ["Caribbean", "Santo Domingo", "Dominican peso (DOP)", "Spanish", "6–12 days"],
  egypt: ["North Africa", "Cairo", "Egyptian pound (EGP)", "Arabic", "6–12 days"],
  estonia: ["Europe", "Tallinn", "Euro (EUR)", "Estonian", "3–7 days"],
  finland: ["Europe", "Helsinki", "Euro (EUR)", "Finnish and Swedish", "5–10 days"],
  germany: ["Europe", "Berlin", "Euro (EUR)", "German", "5–12 days"],
  hungary: ["Europe", "Budapest", "Hungarian forint (HUF)", "Hungarian", "4–8 days"],
  iceland: ["Europe", "Reykjavik", "Icelandic króna (ISK)", "Icelandic", "5–10 days"],
  india: ["Asia", "New Delhi", "Indian rupee (INR)", "Hindi and English are widely used alongside many regional languages", "8–16 days"],
  indonesia: ["Asia", "Check current official capital information", "Indonesian rupiah (IDR)", "Indonesian", "8–16 days"],
  ireland: ["Europe", "Dublin", "Euro (EUR)", "Irish and English", "5–10 days"],
  jamaica: ["Caribbean", "Kingston", "Jamaican dollar (JMD)", "English", "6–12 days"],
  jordan: ["Middle East", "Amman", "Jordanian dinar (JOD)", "Arabic", "5–10 days"],
  kenya: ["Africa", "Nairobi", "Kenyan shilling (KES)", "Swahili and English", "7–14 days"],
  latvia: ["Europe", "Riga", "Euro (EUR)", "Latvian", "3–7 days"],
  lithuania: ["Europe", "Vilnius", "Euro (EUR)", "Lithuanian", "3–7 days"],
  luxembourg: ["Europe", "Luxembourg", "Euro (EUR)", "Luxembourgish, French and German", "2–5 days"],
  malaysia: ["Asia", "Kuala Lumpur", "Malaysian ringgit (MYR)", "Malay; English is widely used in visitor settings", "7–14 days"],
  malta: ["Europe", "Valletta", "Euro (EUR)", "Maltese and English", "4–8 days"],
  mexico: ["North America", "Mexico City", "Mexican peso (MXN)", "Spanish is most widely used alongside recognised Indigenous languages", "7–16 days"],
  montenegro: ["Europe", "Podgorica", "Euro (EUR)", "Montenegrin", "5–10 days"],
  netherlands: ["Europe", "Amsterdam", "Euro (EUR)", "Dutch", "4–9 days"],
  "new-zealand": ["Oceania", "Wellington", "New Zealand dollar (NZD)", "English, Māori and New Zealand Sign Language", "10–21 days"],
  norway: ["Europe", "Oslo", "Norwegian krone (NOK)", "Norwegian", "6–14 days"],
  poland: ["Europe", "Warsaw", "Polish złoty (PLN)", "Polish", "5–12 days"],
  qatar: ["Middle East", "Doha", "Qatari riyal (QAR)", "Arabic; English is widely used in visitor settings", "3–6 days"],
  romania: ["Europe", "Bucharest", "Romanian leu (RON)", "Romanian", "5–12 days"],
  serbia: ["Europe", "Belgrade", "Serbian dinar (RSD)", "Serbian", "4–9 days"],
  singapore: ["Asia", "Singapore", "Singapore dollar (SGD)", "English, Malay, Mandarin and Tamil", "3–6 days"],
  slovakia: ["Europe", "Bratislava", "Euro (EUR)", "Slovak", "3–7 days"],
  slovenia: ["Europe", "Ljubljana", "Euro (EUR)", "Slovene", "4–9 days"],
  "south-africa": ["Africa", "Pretoria, Cape Town and Bloemfontein have capital functions", "South African rand (ZAR)", "South Africa has multiple official languages", "8–16 days"],
  "south-korea": ["Asia", "Seoul", "South Korean won (KRW)", "Korean", "7–14 days"],
  sweden: ["Europe", "Stockholm", "Swedish krona (SEK)", "Swedish", "5–10 days"],
  switzerland: ["Europe", "Bern", "Swiss franc (CHF)", "German, French, Italian and Romansh", "5–12 days"],
  turkiye: ["Europe and Asia", "Ankara", "Turkish lira (TRY)", "Turkish", "6–14 days"],
  vietnam: ["Asia", "Hanoi", "Vietnamese đồng (VND)", "Vietnamese", "8–16 days"]
};

const imageSets = {
  Europe: "/assets/images/destinations/europe.jpg",
  Asia: "/assets/images/destinations/asia.jpg",
  "North America": "/assets/images/destinations/north-america.jpg",
  Oceania: "/assets/images/destinations/oceania.jpg",
  "Middle East": "/assets/images/destinations/middle-east.jpg",
  "North Africa": "/assets/images/destinations/travel.jpg",
  default: "/assets/images/destinations/travel.jpg"
};

const destinationImages = new Set([
  "australia", "canada", "france", "greece", "italy", "japan", "morocco",
  "portugal", "spain", "united-arab-emirates", "united-kingdom", "united-states"
]);

function titleCase(slug) {
  return slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function renderDestination() {
  const root = document.querySelector("#destinationGuide");
  if (!root) return;
  const slug = root.dataset.slug;
  const name = root.dataset.name || titleCase(slug);
  const basicCountry = basicCountryData[slug];
  const country = destinationProfiles[slug] || (basicCountry ? {
    type: "Country",
    region: basicCountry[0],
    capital: basicCountry[1],
    currency: basicCountry[2],
    languages: basicCountry[3],
    suggestedStay: basicCountry[4],
    summary: `${name} can support a varied itinerary built around its main cities, regional culture, landscapes and local experiences. A realistic route should reflect travel times, season and the needs of everyone travelling.`,
    highlights: ["A carefully chosen main city or base", "Regional culture and local food", "Landscapes or coastal areas where relevant", "Day trips that fit the available time"],
    plan: ["Choose one or two regions for a shorter trip", "Check seasonal weather and local closures", "Confirm intercity transport before fixing the route", "Review current official travel and entry advice"]
  } : null);
  const city = cityProfiles[slug];
  const profile = country || {
    type: city ? "City or region" : "Destination",
    region: "International",
    capital: city ? city[0] : "Check current official sources",
    currency: city ? city[1] : "Confirm before travel",
    languages: "Check destination-specific visitor information",
    suggestedStay: city ? city[2] : "3–10 days depending on route",
    summary: city ? city[3] : `${name} can form part of a personalised city break, regional trip or wider itinerary. The right plan depends on your dates, pace, budget and support needs.`,
    highlights: ["Main sights and neighbourhoods", "Local culture and food", "Suitable day trips", "Experiences matched to your interests"],
    plan: ["Choose a realistic base", "Group nearby sights together", "Check local transport before arrival", "Keep time for rest and unexpected changes"]
  };

  const image = destinationImages.has(slug)
    ? `/assets/images/destinations/${slug}.jpg`
    : (imageSets[profile.region] || imageSets.default);
  const highlights = (profile.highlights || ["Major sights", "Local culture", "Food and neighbourhoods", "Day-trip options"]).map(item => `<li>${item}</li>`).join("");
  const plan = (profile.plan || []).map(item => `<li>${item}</li>`).join("");
  document.title = `${name} Destination Guide | JA Experiences & Discovery`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", `Practical ${name} destination guidance, suggested trip structure and personalised research support from JA Experiences & Discovery.`);

  root.innerHTML = `
    <section class="destination-hero" style="--destination-image:url('${image}')">
      <div class="container destination-hero-content">
        <span class="eyebrow">${profile.type} planning guide</span>
        <h1>${name}</h1>
        <p>${profile.summary}</p>
        <div class="actions"><a class="button light" href="/contact/?destination=${encodeURIComponent(name)}">Ask us to plan ${name}</a><a class="button destination-outline" href="/pricing/">View planning prices</a></div>
      </div>
    </section>
    <nav class="guide-nav" aria-label="On this page"><div class="container guide-nav-inner"><a href="#overview">Overview</a><a href="#highlights">What to include</a><a href="#sample-plan">Suggested plan</a><a href="#practical">Practical checks</a><a href="#support">Planning support</a></div></nav>
    <section class="section" id="overview"><div class="container">
      <div class="fact-grid">
        <div class="fact"><span>Region / country</span><strong>${profile.region || profile.capital}</strong></div>
        <div class="fact"><span>${country ? "Capital" : "Country"}</span><strong>${profile.capital}</strong></div>
        <div class="fact"><span>Currency</span><strong>${profile.currency}</strong></div>
        <div class="fact"><span>Suggested trip length</span><strong>${profile.suggestedStay}</strong></div>
      </div>
      <div class="split destination-copy"><div><div class="section-heading left"><span class="kicker">Planning overview</span><h2>Is ${name} right for your trip?</h2><p>${profile.summary}</p></div><p>JA can research the areas, travel pace, attractions and practical considerations that match your circumstances. We do not make the booking or guarantee that a destination or provider is suitable.</p></div><aside class="panel"><h3>Language information</h3><p>${profile.languages}</p><h3>Best for</h3><p>Customers who want a clearer route, manageable daily plan and a shortlist based on their own interests rather than generic rankings.</p></aside></div>
    </div></section>
    <section class="section alt" id="highlights"><div class="container split"><div class="destination-image" style="background-image:url('${image}')"></div><div><div class="section-heading left"><span class="kicker">What to include</span><h2>Build the trip around a few strong priorities</h2></div><ul class="check-list">${highlights}</ul><p class="subtle">Attractions, prices, opening arrangements and access information can change. Confirm all important details with the provider before booking.</p></div></div></section>
    <section class="section" id="sample-plan"><div class="container"><div class="section-heading"><span class="kicker">Example structure</span><h2>A sensible ${name} planning approach</h2><p>This is a planning framework, not a fixed package or booking.</p></div><div class="itinerary-grid"><article class="itinerary-day"><span>Stage 1</span><h3>Arrive and orientate</h3><p>Keep arrival day light. Learn the immediate area, collect essentials and avoid committing to a time-sensitive activity after a long journey.</p></article><article class="itinerary-day"><span>Stage 2</span><h3>Core experiences</h3><p>Group the most important sights by area. Balance pre-booked attractions with flexible neighbourhood time and realistic meal breaks.</p></article><article class="itinerary-day"><span>Stage 3</span><h3>Wider exploration</h3><p>Add one day trip, cultural experience or slower local day only when transfer times and energy levels make sense.</p></article><article class="itinerary-day"><span>Stage 4</span><h3>Departure buffer</h3><p>Leave enough time for luggage, transport disruption and provider check-in requirements. Avoid a distant activity immediately before departure.</p></article></div><div class="panel plan-points"><h3>Destination-specific planning points</h3><ul class="check-list">${plan}</ul></div></div></section>
    <section class="section mist" id="practical"><div class="container"><div class="section-heading"><span class="kicker">Before you book</span><h2>Important checks for ${name}</h2></div><div class="card-grid"><article class="card"><span class="card-icon">01</span><h3>Official travel advice</h3><p>Check current FCDO advice, entry requirements, local laws, health information and safety updates.</p><a href="https://www.gov.uk/foreign-travel-advice" target="_blank" rel="noopener">Open GOV.UK advice</a></article><article class="card"><span class="card-icon">02</span><h3>Accessibility</h3><p>Ask venues and transport providers to confirm step-free access, assistance, seating, toilets and any individual requirements.</p></article><article class="card"><span class="card-icon">03</span><h3>Costs and terms</h3><p>Read cancellation rules, taxes, deposits, card charges and what is included before paying a provider.</p></article></div></div></section>
    <section class="cta-band" id="support"><div class="container"><div><h2>Want a ${name} plan built around you?</h2><p>Tell us your dates, interests, pace, budget range and any accessibility or family requirements.</p></div><a class="button light" href="/contact/?destination=${encodeURIComponent(name)}">Request personalised research</a></div></section>`;
}

renderDestination();

if (document.querySelector("#destinationGuide")) {
  const headoutScript = document.createElement("script");
  headoutScript.src = "/assets/js/headout-widgets.js?v=20260620-2";
  document.body.appendChild(headoutScript);
}
