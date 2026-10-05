# Future Spark International School website

Website for Future Spark International School: home, about, academics, admissions, careers, the MCB page, a contact page, and a photo gallery with auto-scrolling event albums. Enquiry and careers forms are saved to a Google Sheet through a Google Apps Script web app.

## Tech stack

- React 19, TypeScript, Vite 6
- React Router 7 (single-page app)
- Recharts for the stats charts
- Tailwind CSS (via CDN in `index.html`)
- Google Apps Script + Google Sheets / Drive for forms and online gallery albums
- Hosted on Netlify

## Run locally

Prerequisite: Node.js.

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:3000. Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Environment variables

Create `.env.local` (not committed). All are optional for local browsing; the related feature is disabled when a variable is missing.

| Variable | Used for |
|---|---|
| `VITE_ENQUIRY_ENDPOINT` | Apps Script URL that receives enquiry and careers forms |
| `VITE_ENQUIRY_TOKEN` | Optional token appended to enquiry requests |
| `VITE_EVENTS_ENDPOINT` | Apps Script URL that returns the events list (`?type=events`) |
| `VITE_GALLERY_ENDPOINT` | Apps Script URL that returns online gallery albums (`?type=gallery`) |

Anything starting with `VITE_` is embedded in the public JavaScript bundle, so never put a secret in these variables.

## Project structure

```
src/
  App.tsx, index.tsx, index.css   app entry, routes, global styles
  components/                     pages and sections (Home, Gallery, Admissions, ...)
    images/                       photos bundled into the build (gallery, hero, campus)
  services/enquiryApi.ts          form submission to Apps Script
public/                           static files (icons, sitemap, robots, videos, _redirects)
apps-script/                      Google Apps Script source (enquiries, careers, events, gallery)
scripts/                          image import / compression helpers (Node)
  legacy/                         one-off PowerShell helpers kept for reference
docs/                             operational notes and an events CSV template
```

## Deployment

Netlify builds with `npm run build` and publishes `dist/` (see `netlify.toml`). Single-page-app routing is handled by `netlify.toml` and `public/_redirects`. Set the `VITE_*` variables in the Netlify site settings.

## Google Apps Script

The server-side code is in `apps-script/`:

- `ENQUIRY_SHEET.gs` handles enquiries, careers applications and the events list. Events writes require an `EVENTS_TOKEN` script property; do not store tokens in this file.
- `gallery.gs` serves gallery albums from Google Drive. Upload and delete actions require the `ADMIN_TOKEN` script property.

Deploy each as a web app (execute as the owner, access: anyone) and put the resulting URLs in the matching `VITE_*` variables.

See `docs/NOTES.md` for where data lives and troubleshooting tips.
