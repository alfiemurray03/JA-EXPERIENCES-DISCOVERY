document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main";
  const header = document.querySelector("#siteShellHeader, #site-header");
  const footer = document.querySelector("#siteShellFooter, #site-footer");

  if (header) {
    const links = [
      ["home", "/", "Home"],
      ["destinations", "/destinations/", "Discover"],
      ["experiences", "/experiences/", "Experiences"],
      ["services", "/planning-services/", "Planning support"],
      ["about", "/about/", "About"],
      ["contact", "/contact/", "Contact"]
    ];

    const legacyShell = header.id === "site-header";
    header.innerHTML = legacyShell ? `
      <header class="site-header">
        <a class="brand" href="/coming-soon/"><span class="brand-mark">JA</span><span><strong>JA Experiences &amp; Discovery</strong><small>A trading division of JA Group Services Ltd</small></span></a>
        <nav class="main-nav" aria-label="Coming soon navigation"><a href="https://tours.jagroupservices.co.uk">Browse current activities</a><a href="mailto:hello@jagroupservices.co.uk">Contact</a></nav>
      </header>` : `
      <a class="skip-link" href="#main">Skip to main content</a>
      <header class="site-header">
        <div class="container nav-shell">
          <a class="brand" href="/">
            <span class="brand-mark" aria-hidden="true">JA</span>
            <span>Experiences <i>&amp;</i> Discovery<small>by JA Group Services</small></span>
          </a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="siteNav">Menu</button>
          <nav class="site-nav" id="siteNav" aria-label="Main navigation">
            ${links.map(([key, href, label]) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
            <a class="nav-cta" href="/enquiry/">Start free enquiry <span aria-hidden="true">→</span></a>
          </nav>
        </div>
      </header>`;
  }

  if (footer) {
    footer.innerHTML = footer.id === "site-footer" ? `
      <footer class="site-footer"><div class="container"><div class="footer-grid"><div><a class="brand" href="/coming-soon/"><span class="brand-mark">JA</span><span>JA Experiences &amp; Discovery<small>A trading division of JA Group Services Ltd</small></span></a><p>This service is being prepared by JA Group Services Ltd.</p></div><div class="footer-col"><h3>Contact</h3><a href="mailto:hello@jagroupservices.co.uk">hello@jagroupservices.co.uk</a><a href="tel:+442038342790">020 3834 2790</a></div></div><div class="footer-legal">Copyright JA Group Services Ltd &amp; its Licensors.</div></div></footer>` : `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="/"><span class="brand-mark">JA</span><span>JA Experiences &amp; Discovery<small>A trading division of JA Group Services Ltd</small></span></a>
              <p>Remarkable places, memorable experiences and practical guidance for the journey ahead.</p>
              <p><a href="mailto:hello@jagroupservices.co.uk">hello@jagroupservices.co.uk</a><br><a href="tel:+442038342790">020 3834 2790</a></p>
            </div>
            <div class="footer-col"><h3>Discover</h3><a href="/destinations/">Destinations</a><a href="/experiences/">Experiences</a><a href="/activities/">Experience types</a><a href="/getyourguide/">GetYourGuide</a><a href="/headout/">Headout</a></div>
            <div class="footer-col"><h3>Planning</h3><a href="/planning-services/">Planning support</a><a href="/pricing/">Plans &amp; pricing</a><a href="/enquiry/">Free enquiry</a><a href="/social-tariff/">Social tariff</a><a href="/accessibility-support/">Accessibility support</a></div>
            <div class="footer-col"><h3>Company</h3><a href="/about/">About</a><a href="/how-it-works/">How it works</a><a href="/important-information/">Important information</a><a href="/complaints/">Complaints</a><a href="/contact/">Contact</a></div>
            <div class="footer-col"><h3>Legal</h3><a href="/affiliate-disclosure/">Affiliate disclosure</a><a href="/legal/privacy/">Privacy</a><a href="/legal/terms/">Terms</a><a href="/legal/cookies/">Cookies</a><a href="/sitemap/">Sitemap</a></div>
          </div>
          <div class="footer-company">
            <p>JA Experiences &amp; Discovery is a trading division/service line of JA Group Services Ltd.</p>
            <p>JA Group Services Ltd is incorporated in England and Wales, Company Number 16314179.</p>
            <p>Registered Office: 167–169 Great Portland Street, 5th Floor, London, W1W 5PF, United Kingdom.</p>
          </div>
          <div class="footer-legal">Copyright JA Group Services Ltd &amp; its Licensors.</div>
        </div>
      </footer>`;
  }

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#siteNav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      nav.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.focus();
    }
  });
});
