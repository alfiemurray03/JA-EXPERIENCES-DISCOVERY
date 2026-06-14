# JA Experiences & Discovery Website

<<<<<<< HEAD
Public website for **JA Experiences & Discovery**, a trading division and service line of JA Group Services Ltd.

Production domain: `experiences.jagroupservices.co.uk`

## Local preview

```powershell
python -m http.server 4174 --directory public
```

Static previews do not run the enquiry API. Use Wrangler to test the complete Worker:

```powershell
Copy-Item .dev.vars.example .dev.vars
npx wrangler dev
```

## Enquiry email setup

The form at `/contact/` submits to the Cloudflare Worker endpoint `/api/enquiries`.

1. Verify `experiences.jagroupservices.co.uk` or the chosen sending subdomain in Resend.
2. Create a Resend API key.
3. Add the production secrets:

```powershell
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ENQUIRY_FROM_EMAIL
```

`ENQUIRY_FROM_EMAIL` should use the verified domain, for example:

```text
JA Experiences & Discovery <enquiries@experiences.jagroupservices.co.uk>
```

`ENQUIRY_TO_EMAIL` is defined in `wrangler.jsonc` and currently points to `hello@jagroupservices.co.uk`.

## Generate the XML sitemap

```powershell
node scripts/generate-sitemap.mjs
```

## Deploy

```powershell
npx wrangler deploy
```

## Launch notes

- Activity bookings are completed with the named third-party provider.
- No flights, visas, transfers, transport or package holidays are sold.
- The enquiry and contact forms require the Cloudflare Worker email secrets described above.
- Headout content will be added when the relevant approved partner material is ready.
- The Privacy Policy, Terms and Conditions and Cookie Policy pages are holding pages and require final approved policies before the relevant public service features are fully launched.
- No selected partner hotels are currently listed.
=======
## Purpose
Public website for JA Experiences & Discovery, a trading division/service line of JA Group Services Ltd.

## Local preview
Open `index.html` in a browser, or use a simple static server from this folder:

```bash
python -m http.server 3000
```

Then visit http://localhost:3000/

## Cloudflare Pages
This site is built as static HTML, CSS and JavaScript and is ready for deployment to Cloudflare Pages from GitHub.

## Production domain
experiences.jagroupservices.co.uk

## Notes
- Form endpoints are configured as future-ready placeholders such as `/api/enquiries` and `/api/contact`.
- Headout content will be added once partner material is available.
- Legal pages are intentionally marked as coming soon until final approved policies are available.
>>>>>>> eff9dcc (Build public JA Experiences & Discovery website)
