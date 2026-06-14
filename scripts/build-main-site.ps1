# JA Experiences & Discovery
# Main website build script
# This script rebuilds the shared style, shared header/footer, preview page and main blank pages.

Set-Location "C:\GitHub\JA-EXPERIENCES-DISCOVERY"

# Create folders
New-Item -ItemType Directory -Force -Path public | Out-Null
New-Item -ItemType Directory -Force -Path public\assets\css | Out-Null
New-Item -ItemType Directory -Force -Path public\assets\js | Out-Null
New-Item -ItemType Directory -Force -Path public\coming-soon | Out-Null
New-Item -ItemType Directory -Force -Path public\preview | Out-Null

# Shared CSS
@'
:root {
  --navy: #0b2447;
  --blue: #145da0;
  --deep-blue: #174f8f;
  --orange: #f59e0b;
  --cream: #f8f4ec;
  --white: #ffffff;
  --soft: #f5f7fb;
  --text: #172033;
  --muted: #53627a;
  --border: #dbe3ee;
  --shadow: 0 18px 45px rgba(11, 36, 71, 0.10);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: var(--text);
  background: var(--white);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid var(--border);
  padding: 14px 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  backdrop-filter: blur(14px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--navy);
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--navy), var(--blue));
}

.brand strong {
  display: block;
  font-size: 1rem;
}

.brand span {
  display: block;
  color: var(--muted);
  font-size: 0.78rem;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}

.main-nav a {
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  font-size: 0.92rem;
}

.main-nav a:hover {
  color: var(--blue);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions a {
  text-decoration: none;
  font-weight: 800;
}

.sign-in {
  color: var(--text);
}

.cta-small {
  background: var(--deep-blue);
  color: var(--white);
  padding: 10px 16px;
  border-radius: 8px;
}

.hero {
  min-height: 560px;
  display: grid;
  align-items: center;
  padding: 90px 6%;
  color: var(--white);
  background:
    linear-gradient(90deg, rgba(11,36,71,0.92), rgba(20,93,160,0.74)),
    radial-gradient(circle at right, rgba(245,158,11,0.25), transparent 34%),
    linear-gradient(135deg, #0b2447, #145da0);
}

.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 18px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.24);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
}

.hero h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(2.8rem, 6vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.hero p {
  max-width: 720px;
  margin: 24px 0 0;
  font-size: 1.12rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.92);
}

.actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 9px;
  text-decoration: none;
  font-weight: 800;
}

.button-primary {
  background: var(--white);
  color: var(--navy);
}

.button-secondary {
  border: 1px solid rgba(255,255,255,0.4);
  color: var(--white);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border);
  background: var(--white);
}

.stat {
  text-align: center;
  padding: 26px 18px;
}

.stat strong {
  display: block;
  color: var(--deep-blue);
  font-size: 1.4rem;
}

.stat span {
  color: var(--muted);
  font-size: 0.9rem;
}

.section {
  padding: 76px 6%;
}

.section.alt {
  background: var(--soft);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.section-heading {
  text-align: center;
  max-width: 780px;
  margin: 0 auto 38px;
}

.section-heading h2 {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.9rem, 4vw, 3rem);
  letter-spacing: -0.04em;
}

.section-heading p {
  color: var(--muted);
  line-height: 1.7;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #eaf3ff;
  color: var(--deep-blue);
  font-weight: 900;
  margin-bottom: 18px;
}

.card h3 {
  margin: 0 0 10px;
  color: var(--text);
}

.card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
  text-align: center;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  background: var(--deep-blue);
  color: var(--white);
  font-weight: 900;
}

.notice {
  margin-top: 40px;
  padding: 24px;
  border-radius: 12px;
  background: #fff7e6;
  border: 1px solid #f7d891;
  color: #7a3b00;
  text-align: center;
  line-height: 1.6;
}

.cta-band {
  background: var(--deep-blue);
  color: var(--white);
  padding: 58px 6%;
  text-align: center;
}

.cta-band h2 {
  margin: 0 0 14px;
  font-size: clamp(1.8rem, 4vw, 2.7rem);
}

.cta-band p {
  margin: 0 auto 26px;
  max-width: 650px;
  line-height: 1.7;
  color: rgba(255,255,255,0.88);
}

.site-footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 42px 6% 28px;
}

.footer-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 40px;
}

.site-footer h3,
.site-footer h4 {
  margin: 0 0 12px;
  color: var(--text);
}

.site-footer p,
.site-footer a {
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.94rem;
}

.site-footer a {
  display: block;
  text-decoration: none;
  margin: 8px 0;
}

.site-footer a:hover {
  color: var(--blue);
}

.footer-bottom {
  max-width: 1100px;
  margin: 30px auto 0;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.88rem;
}

.page {
  padding: 80px 6%;
  min-height: 60vh;
}

.page h1 {
  color: var(--navy);
  font-size: clamp(2.2rem, 5vw, 4rem);
  letter-spacing: -0.05em;
}

.placeholder {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--soft);
  color: var(--muted);
}

@media (max-width: 900px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats,
  .card-grid,
  .steps,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
    padding: 70px 6%;
  }
}
'@ | Set-Content -Path public\assets\css\styles.css -Encoding UTF8

# Shared header/footer JS
@'
document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  if (header) {
    header.innerHTML = `
      <header class="site-header">
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>
            <strong>JA Experiences &amp; Discovery</strong>
            <span>by JA Group Services Ltd</span>
          </span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
          <a href="/about/">About</a>
          <a href="/plans-pricing/">Plans</a>
          <a href="/activities/">Activities</a>
          <a href="/destinations/">Destinations</a>
          <a href="/affiliate-partners/">Partners</a>
        </nav>

        <div class="header-actions">
          <a class="sign-in" href="/login/">Sign in</a>
          <a class="cta-small" href="/contact/">Reach Out</a>
        </div>
      </header>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-grid">
          <div>
            <h3>JA Experiences &amp; Discovery</h3>
            <p>Destination discovery, activity signposting and online planning guidance operated by JA Group Services Ltd.</p>
            <p><strong>Important:</strong> Customers remain responsible for arranging their own travel and transport.</p>
          </div>

          <div>
            <h4>Explore</h4>
            <a href="/about/">About</a>
            <a href="/plans-pricing/">Plans &amp; Pricing</a>
            <a href="/activities/">Activities</a>
            <a href="/destinations/">Destinations</a>
            <a href="/affiliate-partners/">Affiliate Partners</a>
          </div>

          <div>
            <h4>Support</h4>
            <a href="/contact/">Contact</a>
            <a href="/login/">Sign In</a>
            <a href="/account/">Create Account</a>
          </div>
        </div>

        <div class="footer-bottom">
          &copy; JA Group Services Ltd and its licensors. JA Experiences &amp; Discovery is being prepared as a division/service line of JA Group Services Ltd.
        </div>
      </footer>
    `;
  }
});
'@ | Set-Content -Path public\assets\js\site-shell.js -Encoding UTF8

# Root redirects to coming soon while site is under development
@'
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=/coming-soon/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JA Experiences & Discovery</title>
</head>
<body>
</body>
</html>
'@ | Set-Content -Path public\index.html -Encoding UTF8

# Cloudflare redirects: keep public on coming soon, allow preview and assets
@'
/coming-soon/ /coming-soon/index.html 200
/coming-soon/* /coming-soon/:splat 200
/preview/ /preview/index.html 200
/preview/* /preview/:splat 200
/assets/* /assets/:splat 200
/* /coming-soon/ 302
'@ | Set-Content -Path public\_redirects -Encoding UTF8

# Coming soon page
@'
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Coming Soon | JA Experiences & Discovery</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <div id="site-header"></div>

  <main>
    <section class="hero">
      <div class="hero-inner">
        <span class="eyebrow">Coming soon</span>
        <h1>We are bringing exciting things.</h1>
        <p>
          JA Group Services Ltd is creating a new division which is coming soon.
          You can still browse our affiliate partner offers powered by GetYourGuide,
          which offer a range of tours and activities in the UK and worldwide.
        </p>
        <div class="actions">
          <a class="button button-primary" href="https://tours.jagroupservices.co.uk">Browse GetYourGuide Offers</a>
          <a class="button button-secondary" href="/contact/">Reach Out</a>
        </div>
      </div>
    </section>

    <section class="cta-band">
      <h2>Check back here for updates.</h2>
      <p>The full JA Experiences & Discovery website is being prepared.</p>
    </section>
  </main>

  <div id="site-footer"></div>
  <script src="/assets/js/site-shell.js"></script>
</body>
</html>
'@ | Set-Content -Path public\coming-soon\index.html -Encoding UTF8

# Preview homepage
@'
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Preview | JA Experiences & Discovery</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <div id="site-header"></div>

  <main>
    <section class="hero">
      <div class="hero-inner">
        <span class="eyebrow">Operated by JA Group Services Ltd</span>
        <h1>Discover places, activities and ideas with clearer guidance.</h1>
        <p>
          JA Experiences & Discovery helps customers explore destinations, compare activity ideas
          and receive practical online guidance before making their own travel, accommodation and activity arrangements.
        </p>
        <div class="actions">
          <a class="button button-primary" href="/affiliate-partners/">Browse Partner Offers</a>
          <a class="button button-secondary" href="/contact/">Reach Out</a>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stat"><strong>UK</strong><span>and worldwide ideas</span></div>
      <div class="stat"><strong>Online</strong><span>guidance and support</span></div>
      <div class="stat"><strong>Partners</strong><span>affiliate offers</span></div>
      <div class="stat"><strong>Clear</strong><span>customer information</span></div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <h2>Support for planning, exploring and comparing options</h2>
          <p>
            The service is being prepared to support customers who want simple, practical help
            before making their own decisions about destinations, activities and experiences.
          </p>
        </div>

        <div class="card-grid">
          <article class="card">
            <div class="icon">01</div>
            <h3>Destination discovery</h3>
            <p>Support to explore destination ideas, compare locations and understand what may suit your plans.</p>
          </article>

          <article class="card">
            <div class="icon">02</div>
            <h3>Activity signposting</h3>
            <p>Browse selected affiliate partner offers for tours, tickets and activities in the UK and worldwide.</p>
          </article>

          <article class="card">
            <div class="icon">03</div>
            <h3>Planning guidance</h3>
            <p>Future online guidance to help customers organise ideas, priorities, timeframes and next steps.</p>
          </article>
        </div>

        <div class="notice">
          JA Experiences & Discovery does not arrange travel, transport, flights, visas, package holidays,
          taxis, car hire, coaches, ferries or transfers. Customers remain responsible for their own travel and transport.
        </div>
      </div>
    </section>

    <section class="cta-band">
      <h2>We are bringing exciting things.</h2>
      <p>You can still browse affiliate partner offers powered by GetYourGuide.</p>
      <a class="button button-primary" href="https://tours.jagroupservices.co.uk">Browse GetYourGuide Offers</a>
    </section>
  </main>

  <div id="site-footer"></div>
  <script src="/assets/js/site-shell.js"></script>
</body>
</html>
'@ | Set-Content -Path public\preview\index.html -Encoding UTF8

function New-SimplePage {
  param(
    [string]$Path,
    [string]$Title,
    [string]$Text
  )

  New-Item -ItemType Directory -Force -Path (Split-Path $Path) | Out-Null

@"
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$Title | JA Experiences & Discovery</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <div id="site-header"></div>

  <main class="page">
    <div class="container">
      <h1>$Title</h1>
      <p>$Text</p>
      <div class="placeholder">This page is being prepared and will be developed further.</div>
    </div>
  </main>

  <div id="site-footer"></div>
  <script src="/assets/js/site-shell.js"></script>
</body>
</html>
"@ | Set-Content -Path $Path -Encoding UTF8
}

New-SimplePage "public\about\index.html" "About" "Learn more about JA Experiences & Discovery and how the service is being prepared."
New-SimplePage "public\plans-pricing\index.html" "Plans & Pricing" "Plans and pricing information will be added when ready."
New-SimplePage "public\activities\index.html" "Activities" "Activity and experience signposting will be added here."
New-SimplePage "public\destinations\index.html" "Destinations" "Destination discovery pages will be developed here."
New-SimplePage "public\affiliate-partners\index.html" "Affiliate Partners" "Affiliate partner information will be added here."
New-SimplePage "public\contact\index.html" "Contact" "Contact and reach out options will be added here."
New-SimplePage "public\login\index.html" "Sign In" "Customer sign in will be added later."
New-SimplePage "public\account\index.html" "Customer Account" "Customer account features will be added later."
New-SimplePage "public\account\profile\index.html" "Customer Profile" "Customer profile features will be added later."

# Public admin placeholder only
New-SimplePage "public\admin\index.html" "Admin Portal" "This area is reserved for future secure administration and is not available yet."

git status
