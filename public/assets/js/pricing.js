const services = [
  {
    name: "Free Discovery Enquiry",
    description: "Tell us what you are considering and receive an initial recommendation for the most suitable next step.",
    price: "£0",
    socialPrice: "£0",
    delivery: "1 to 3 working days",
    revisions: "No revisions",
    features: ["Initial enquiry review", "A simple service recommendation", "No detailed research or itinerary work"]
  },
  {
    name: "Destination Discovery Plan",
    description: "For customers who want to travel or enjoy an experience but need help deciding where to go.",
    price: "£49",
    socialPrice: "£29",
    delivery: "3 to 5 working days",
    revisions: "One minor revision",
    features: ["Preferences and budget review", "Destination options", "Practical advantages and considerations", "Clear next steps"]
  },
  {
    name: "Itinerary and Experience Planning Plan",
    description: "For customers who know their destination and want a practical structure for what to do.",
    price: "£89",
    socialPrice: "£55",
    delivery: "5 to 7 working days",
    revisions: "One minor revision",
    features: ["Suggested day-by-day structure", "Activity and experience ideas", "Local area and practical notes", "Rest and flexible time"]
  },
  {
    name: "Complete Discovery and Planning Guidance Plan",
    description: "Our fullest destination discovery and planning service for a more detailed request.",
    price: "£149",
    socialPrice: "£95",
    delivery: "7 to 10 working days",
    revisions: "Two minor revisions",
    featured: true,
    features: ["Destination and hotel-area research", "Accommodation examples", "Activity and itinerary research", "Indicative cost breakdowns", "General preparation notes"]
  }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  })[character]);
}

const grid = document.querySelector("#pricingGrid");
if (grid) {
  grid.innerHTML = services.map(service => `
    <article class="price-card${service.featured ? " featured" : ""}">
      <span class="tag">${service.featured ? "Most comprehensive" : "Approved guidance plan"}</span>
      <h2>${escapeHtml(service.name)}</h2>
      <p>${escapeHtml(service.description)}</p>
      <div class="price">${escapeHtml(service.price)} <small>standard price</small></div>
      <p class="social-price"><strong>${escapeHtml(service.socialPrice)}</strong> social tariff price</p>
      <ul class="feature-list">
        ${service.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}
        <li>${escapeHtml(service.delivery)}</li>
        <li>${escapeHtml(service.revisions)}</li>
      </ul>
      <a class="button" href="/contact/?plan=${encodeURIComponent(service.name)}">Enquire about this plan</a>
    </article>
  `).join("");
}
