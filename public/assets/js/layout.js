document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");
  const current = document.body.dataset.page || "";

  const nav = [
    ["home", "/", "Home"],
    ["plan", "/plan-your-trip/", "Plan Your Trip"],
    ["support", "/ja-travel-support/", "JA Travel Support"],
    ["destinations", "/destinations/", "Destinations"],
    ["activities", "/activities/", "Activities"],
    ["transfers", "/transfers/", "Transfers"],
    ["accommodation", "/accommodation/", "Accommodation"],
    ["account", "/account/", "Account"]
  ];

  if (header) {
    header.innerHTML = `
      <div class="prelaunch-bar">Pre-launch development site: public booking and direct travel support services are not yet open.</div>
      <header class="site-header">
        <div class="wrap nav">
          <a class="brand" href="/">
            <span class="brand-mark">JA</span>
            <span>JA Travel &amp; Experiences<small>A trading name of JA Group Services Ltd</small></span>
          </a>
          <button class="menu-button" id="menuButton" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
          <nav class="nav-links" id="navLinks" aria-label="Main navigation">
            ${nav.map(([id, href, label]) => `<a href="${href}"${current === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
            <a class="nav-cta" href="/contact/"${current === "contact" ? ' aria-current="page"' : ""}>Contact</a>
          </nav>
        </div>
      </header>`;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-brand">
              <a class="brand" href="/"><span class="brand-mark">JA</span><span>JA Travel &amp; Experiences<small>JA Group Services Ltd</small></span></a>
              <p>A pre-launch travel discovery, planning, information and support platform being developed by JA Group Services Ltd.</p>
            </div>
            <div class="footer-column"><strong>Our Divisions</strong><a href="https://jagroupservices.co.uk">JA Group Services Ltd</a><a href="/ja-travel-support/">JA Travel Support</a><a href="/contact/">Contact / Support</a></div>
            <div class="footer-column"><strong>Website</strong><a href="/">Home</a><a href="/plan-your-trip/">Plan Your Trip</a><a href="/destinations/">Destinations</a><a href="/how-it-works/">How It Works</a></div>
            <div class="footer-column"><strong>Travel Platform</strong><a href="/activities/">Activities</a><a href="/transfers/">Transfers</a><a href="/accommodation/">Accommodation</a><a href="/local-transport/">Local Transport</a><a href="/account/">Account</a></div>
            <div class="footer-column"><strong>Legal &amp; Resources</strong><a href="/booking-partners/">Booking Partners</a><a href="/affiliate-disclosure/">Affiliate Disclosure</a><a href="/legal/privacy/">Privacy Notice</a><a href="/legal/cookies/">Cookie Policy</a><a href="/legal/terms/">Terms of Use</a><a href="/legal/provider-disclaimer/">Provider Disclaimer</a><a href="/legal/travel-insurance/">Travel Insurance Notice</a></div>
          </div>
          <div class="legal-identity">JA Travel &amp; Experiences is a trading name of JA Group Services Ltd and is not a separate legal entity.</div>
          <div class="copyright">© 2026 JA Group Services Ltd and its licensors. All rights reserved.</div>
        </div>
      </footer>`;
  }

  const menuButton = document.querySelector("#menuButton");
  const navLinks = document.querySelector("#navLinks");
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }
});
