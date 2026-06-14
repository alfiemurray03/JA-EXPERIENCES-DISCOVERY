document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main";
  const header = document.querySelector("#siteShellHeader");
  const footer = document.querySelector("#siteShellFooter");

  if (header) {
    const links = [
      ["home", "/", "Home"],
      ["about", "/about/", "About"],
      ["services", "/pricing/", "Plans & Pricing"],
      ["enquiry", "/enquiry/", "Free Enquiry"],
      ["experiences", "/experiences/", "Activities"],
      ["destinations", "/destinations/", "Destinations"],
      ["contact", "/contact/", "Contact"]
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
            <a class="nav-cta" href="/enquiry/">Start free</a>
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
              <p>Online destination discovery, activity guidance and experience signposting.</p>
              <p><a href="mailto:hello@jagroupservices.co.uk">hello@jagroupservices.co.uk</a><br><a href="tel:+442038342790">020 3834 2790</a></p>
            </div>
            <div class="footer-col"><h3>Explore</h3><a href="/">Home</a><a href="/about/">About</a><a href="/pricing/">Plans &amp; Pricing</a><a href="/enquiry/">Free Enquiry</a><a href="/contact/">Contact</a></div>
            <div class="footer-col"><h3>Discover</h3><a href="/experiences/">Activities</a><a href="/getyourguide/">GetYourGuide</a><a href="/headout/">Headout</a><a href="/destinations/">Destinations</a><a href="/accommodation/">Selected Partner Hotels</a></div>
            <div class="footer-col"><h3>Information</h3><a href="/important-information/">Important Information</a><a href="/affiliate-disclosure/">Affiliate Disclosure</a><a href="/complaints/">Complaints</a><a href="/sitemap/">Sitemap</a></div>
            <div class="footer-col"><h3>Legal</h3><a href="/legal/privacy/">Privacy</a><a href="/legal/terms/">Terms</a><a href="/legal/cookies/">Cookies</a></div>
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
});
