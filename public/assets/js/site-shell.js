document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main";
  const header = document.querySelector("#siteShellHeader");
  const footer = document.querySelector("#siteShellFooter");

  if (header) {
    const links = [
      ["home", "/", "Home"],
      ["services", "/planning-services/", "Guidance plans"],
      ["destinations", "/destinations/", "Destinations"],
      ["experiences", "/experiences/", "Activities"],
      ["how", "/how-it-works/", "How it works"],
      ["about", "/about/", "About"]
    ];

    header.innerHTML = `
      <a class="skip-link" href="#main">Skip to main content</a>
      <div class="service-bar">Destination discovery, experience guidance and customer support from JA Group Services Ltd.</div>
      <header class="site-header">
        <div class="container nav-shell">
          <a class="brand" href="/">
            <span class="brand-mark">JA</span>
            <span>JA Experiences &amp; Discovery<small>A trading division of JA Group Services Ltd</small></span>
          </a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="siteNav">Menu</button>
          <nav class="site-nav" id="siteNav" aria-label="Main navigation">
            ${links.map(([key, href, label]) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
            <a class="nav-cta" href="/contact/">Free enquiry</a>
          </nav>
        </div>
      </header>`;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="/"><span class="brand-mark">JA</span><span>JA Experiences &amp; Discovery<small>A trading division of JA Group Services Ltd</small></span></a>
              <p>Clear destination guidance, itinerary ideas and access to independent activity providers.</p>
              <p><a href="mailto:hello@jagroupservices.co.uk">hello@jagroupservices.co.uk</a><br><a href="tel:+442038342790">020 3834 2790</a></p>
            </div>
            <div class="footer-col"><h3>Get started</h3><a href="/contact/">Free Discovery Enquiry</a><a href="/planning-services/">Guidance plans</a><a href="/pricing/">Plans and prices</a><a href="/social-tariff/">Social tariff</a><a href="/how-it-works/">How it works</a></div>
            <div class="footer-col"><h3>Discover</h3><a href="/destinations/">Destination guides</a><a href="/experiences/">Activities &amp; experiences</a><a href="/accommodation/">Selected partner hotels</a><a href="/booking-partners/">Booking partners</a><a href="/affiliate-disclosure/">Affiliate disclosure</a></div>
            <div class="footer-col"><h3>Company</h3><a href="/about/">About the service</a><a href="/accessibility-support/">Accessibility support</a><a href="/faqs/">Frequently asked questions</a><a href="/complaints/">Complaints</a><a href="/sitemap/">Sitemap</a></div>
            <div class="footer-col"><h3>Legal</h3><a href="/legal/terms/">Terms of use</a><a href="/legal/privacy/">Privacy notice</a><a href="/legal/cookies/">Cookie policy</a><a href="/legal/provider-disclaimer/">Provider disclaimer</a></div>
          </div>
          <div class="footer-legal">© 2026 JA Group Services Ltd. Registered in England and Wales, company number 16314179.</div>
        </div>
      </footer>`;
  }

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#siteNav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
});
