# JA Experiences & Discovery

Production website for **JA Experiences & Discovery**, a trading division and service line of JA Group Services Ltd.

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

## Operational boundaries

- Activity bookings are completed with the named third-party provider.
- No flights, visas, transfers, transport or package holidays are sold.
- No selected partner hotel payments may be accepted until written supplier authority and the required operational controls are in place.
- Stripe payment links must not be activated until the applicable customer terms, cancellation process and internal reconciliation controls are approved.
