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
