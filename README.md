# Lana Insulation

Marketing site for Lana Insulation, built with **React + Vite** and ready to
deploy on **Vercel**. Converted from a single-file HTML export into modular
React components.

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Project structure

```
index.html                 # Vite entry HTML (fonts, #root, loads main.jsx)
vite.config.js             # Vite + @vitejs/plugin-react
src/
  main.jsx                 # React entry point
  App.jsx                  # Page composition (section order)
  styles.css               # All styles (global + component classes + responsive)
  siteConfig.js            # Phone / email / links in one place
  data.js                  # Section content (services, benefits, steps, FAQs)
  assets/                  # Images, imported by components (Vite hashes them)
  components/
    Header.jsx  Logo.jsx  Hero.jsx  Services.jsx  About.jsx
    WhyUs.jsx   HowItWorks.jsx  Contact.jsx  Faq.jsx  Footer.jsx  Media.jsx
```

## Where the assets live

Images now live in **`src/assets/`** and are `import`ed by the components, so
Vite fingerprints them for cache-busting and fails the build if a path is wrong.
The original cryptic filenames were renamed to describe their content:

| New name                      | Used in            |
| ----------------------------- | ------------------ |
| `service-blown-in.png`        | Services card      |
| `service-mold-removal.png`    | Services card      |
| `service-debris-removal.png`  | Services card      |
| `about-cellulose.png`         | About section      |
| `how-it-works.png`            | How it works       |

To swap an image, drop the new file in `src/assets/` and update the `import` in
`src/data.js` (services) or the relevant component (`About.jsx`, `HowItWorks.jsx`).

### Logo note

The original HTML referenced `assets/lana-logo.png`, but **no logo file was
included** in the export. `src/components/Logo.jsx` is a clean CSS/SVG wordmark
standing in for it. When you have a real logo, either replace the SVG inside
`Logo.jsx` or import a `lana-logo.png` there.

## Deploying to Vercel

Vercel auto-detects Vite — no config needed. Either:

- **Dashboard:** "Add New → Project", import the repo. Framework preset = **Vite**,
  Build command = `npm run build`, Output directory = `dist`.
- **CLI:** `npm i -g vercel && vercel` (then `vercel --prod`).

## Note on image sizes

The source photos are large (~2.5–7 MB each). For faster loads, consider
compressing them or converting to WebP before shipping to production.

## Referral program (unlisted)

A QR-code referral funnel that sits alongside the main site. Nothing on the
main site links to it. The sign-up and friend pages send `noindex, nofollow`; the
terms page is public.

The offer is **$75 CAD to the referrer** and **$75 CAD off for the referred customer**,
paid or applied only once a qualifying installation is completed and fully paid.

| What | Where |
| --- | --- |
| Sign-up page (the QR code opens this) | `https://www.lanainsulation.com/velvet-caribou-7nQ4pT9k2M` |
| Referred friend's page | `https://www.lanainsulation.com/warmth/WARM-XXXXXX` |
| Terms & Conditions (public) | `https://www.lanainsulation.com/referral-terms` |
| Salesperson QR code | `marketing/referral-signup-qr.png` (phones) and `.svg` (print) |
| Amounts, terms versions, texting number, business details | `src/referralConfig.js` |
| Full terms text | `src/referral/TermsPage.jsx` |
| Database schema | `db/schema.sql` |

How it works: a homeowner scans the QR code, enters their name, email and (optionally)
phone, ticks "I have read and agree to the Referral Program Terms & Conditions", and
gets a personal link. A friend who opens that link taps **Text Us**, and their own
messaging app opens addressed to the business number with the referral code already
in the message. Nothing is sent automatically. The team matches the code in each
incoming text to the referrer, then handles discounts and the $75 rewards by hand.

The URL is unlisted, not secret. It keeps the page out of search results and
navigation, but it isn't access control.

### Files

```
velvet-caribou-7nQ4pT9k2M/index.html   # sign-up page entry (folder name = URL path)
warmth/index.html                      # friend page entry (served for /warmth/*)
referral-terms/index.html              # public terms page entry
src/referralConfig.js                  # central settings, terms versions, short summaries
src/referral/                          # pages, SMS link builder, shared validation, styles
api/referrals/register.js              # POST: create a referrer
api/referrals/lookup.js                # GET: code -> first name (public, nothing private)
api/referrals/click.js                 # POST: count "Text Us" taps (best effort)
server/                                # DB client, rate limiting, referral queries
db/schema.sql                          # tables
scripts/                               # db:migrate and QR generator
vercel.json                            # rewrites + noindex headers
```

### One-time setup

1. **Business details.** These live in `src/referralConfig.js`:
   - `businessTextNumber` is `506-721-9278`.
   - `businessDetails.payoutMethod` is `Interac e-Transfer`.
   - Optional: `legalName`, `mailingAddress` and `privacyPolicyUrl`. While one is
     `null`, its line is left off the terms page.

   `npm run build` **fails** if any value is placeholder text such as `[NAME]`, so
   placeholders can't reach the live site.
2. **Database.** In the Vercel dashboard, open the project and go to Storage →
   Create/Connect → **Neon** (Postgres). Connect it to Production and Preview. This
   adds `DATABASE_URL` to the project automatically.
3. **Create the tables.** Run `vercel link`, then `vercel env pull .env.local`, then
   `npm run db:migrate`. You can also paste `db/schema.sql` into the Neon SQL editor.
   The script is safe to run more than once.
4. Deploy as usual.

Until `DATABASE_URL` exists, sign-ups show a friendly "try again later" message.
The friend page still works without a first name, because the code comes from the link.

### Local development

`npm run dev` serves both pages at their real URLs, but it doesn't run `/api`. For
the full flow, use `vercel dev` (after `vercel env pull .env.local`). That runs Vite
and the API functions together.

### Changing things

- **Amounts or terms text.** Every sign-up stores the terms version it accepted, the
  time it was accepted, and the amounts in that version. To change anything after
  launch, add a **new entry** to `termsVersions` in `src/referralConfig.js` with a new
  version and effective date. Then update `src/referral/TermsPage.jsx` if the wording
  changes. Never edit a published entry. Existing records keep what people agreed to.
  All page copy, summaries, the terms page and the SMS text read the amounts from the
  newest entry. An open sign-up page that still shows old terms is refused, and the
  person is asked to refresh and review the new terms.
- **Domain or paths.** Edit `src/referralConfig.js`, rename the matching folder,
  update `vercel.json`, run `npm run qr`, and reprint any QR codes.

### Working with referrals

The team works directly in the Neon SQL editor or console. Common lookups:

```sql
-- Who referred this texter?
SELECT full_name, email, phone, created_at FROM referrers WHERE referral_code = 'WARM-7KQ2DX';

-- Everyone, newest first (with rough activity counts and the terms they accepted)
SELECT id, full_name, email, phone, referral_code, terms_version, terms_accepted_at,
       referrer_reward_cad, friend_discount_cad, landing_views, sms_clicks, created_at
FROM referrers ORDER BY created_at DESC;
```

- `sms_clicks` counts taps on **Text Us**. It can't confirm that anyone actually sent a text.
- **"Resend my link" requests.** If an email is already registered, the sign-up page
  won't show its link. It asks the person to text or email you instead. Send the
  link **only to the email or phone number on file**, never to whoever asked.

### Spam protection

- Server-side validation of every field.
- A hidden honeypot field.
- Same-origin checks on POSTs.
- Per-IP rate limits, stored in Postgres with hashed IPs: 10 sign-ups per 15 minutes,
  60 lookups per minute, and 30 click pings per minute.
- A database-level unique constraint on email.

For extra protection you can add a Vercel Firewall rate-limit rule on `/api/referrals/*`.
