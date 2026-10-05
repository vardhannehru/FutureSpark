# Future Spark International School website

Website for Future Spark International School: home, about, academics, admissions, careers, the MCB page, a contact page and a photo gallery with auto-scrolling event albums. Enquiry and careers forms are saved to a Google Sheet through a Google Apps Script web app.

Live site: https://www.futurespark.in

## Tech stack

- React 19, TypeScript, Vite 6
- React Router 7 (single-page app)
- Recharts for the stats charts
- Tailwind CSS (loaded from a CDN in `index.html`)
- Google Apps Script with Google Sheets and Drive for forms and online gallery albums
- Hosted on Netlify

## Getting started

Prerequisite: Node.js.

```bash
npm install
npm run dev       # dev server on http://localhost:3000
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

`npm run build` is the check that matters before a release. `npx tsc --noEmit` currently reports two harmless errors in `Hero.tsx` ("cannot find module ... .JPG"); they do not affect the build.

## Environment variables

Create `.env.local` (it is not committed). Each variable is optional for local browsing; the related feature is simply disabled when it is missing.

| Variable | Used for |
|---|---|
| `VITE_ENQUIRY_ENDPOINT` | Apps Script URL that receives enquiry and careers forms |
| `VITE_ENQUIRY_TOKEN` | Optional token appended to enquiry requests |
| `VITE_EVENTS_ENDPOINT` | Apps Script URL that returns the events list (`?type=events`) |
| `VITE_GALLERY_ENDPOINT` | Apps Script URL that returns online gallery albums (`?type=gallery`) |

Anything that starts with `VITE_` is copied into the public JavaScript bundle and can be read by every visitor. Never put a secret in these variables.

## Project structure

```
src/
  App.tsx, index.tsx, index.css   app entry, routes, global styles
  constants.tsx, types.ts         academic programs and achievements, shared types
  components/                     pages and sections (Home, Gallery, Admissions, ...)
    images/                       photos bundled into the build (gallery, hero, campus)
  services/enquiryApi.ts          form submission to Apps Script
public/                           static files: icons, sitemap, robots, videos, _redirects
apps-script/                      Google Apps Script source
scripts/                          Node helpers to import and compress photos
  legacy/                         one-off PowerShell helpers kept for reference
docs/                             operational notes and an events CSV template
```

## Maintaining the site

| To change | Where |
|---|---|
| Wording on a page | the matching file in `src/components/` (`Home.tsx`, `About.tsx`, `Academics.tsx`, `Admissions.tsx`, `Careers.tsx`, `MCB.tsx`) |
| Academic programs and achievements | `src/constants.tsx` |
| Phone numbers, email, social links | `src/components/Footer.tsx` |
| Home page hero pictures | `src/components/Hero.tsx` |
| Upcoming events on the home page | edit the Events sheet in Google Sheets (template: `docs/events-template.csv`) |
| Gallery: add photos to an existing album | drop image files into `src/components/images/gallery/<album>/` |
| Gallery: add a new bundled album | add a folder under `src/components/images/gallery/`, then add a matching `import.meta.glob` and an entry in `defaultGalleries` in `src/components/Gallery.tsx` |
| Gallery: online albums | create a sub-folder in the Google Drive gallery folder (see `docs/NOTES.md`) |
| Page title and search appearance | `index.html`, `public/sitemap.xml`, `public/robots.txt` |

When you add a new page, also add its route in `src/App.tsx` and its address in `public/sitemap.xml`.

### Photos

Large photos slow the site down. Compress images before committing them; `scripts/compress-images.mjs` does this for everything under `src/components/images/` (run it from the repository root: `node scripts/compress-images.mjs`). A good target is well under 500 KB per image.

## Deployment

Netlify builds with `npm run build` and publishes `dist/` (see `netlify.toml`). Single-page-app routing is handled by `netlify.toml` and `public/_redirects`, so deep links do not 404 on refresh. Set the `VITE_*` variables in the Netlify site settings. Pull requests get an automatic deploy preview; check it before merging.

## Google Apps Script

The server-side code is in `apps-script/`:

- `ENQUIRY_SHEET.gs` handles enquiries, careers applications and the events list. Reading events is public; writing events requires an `EVENTS_TOKEN` script property.
- `gallery.gs` serves gallery albums from Google Drive. Upload and delete actions require an `ADMIN_TOKEN` script property.

Deploy each as a web app (execute as the owner, access: anyone) and put the resulting URLs in the matching `VITE_*` variables. Set tokens only in Script Properties inside the Apps Script project, never in the code or in a `VITE_` variable. The files in this repository are copies: changing them does nothing until the code is pasted into Apps Script and a new version is deployed.

## Handover checklist

Whoever maintains the site needs access to:

- the GitHub repository
- the Netlify site (hosting and environment variables)
- the Google account that owns the Apps Script projects, the Sheet and the Drive gallery folder
- the domain registrar for `futurespark.in`

See `docs/NOTES.md` for where data lives and troubleshooting tips.
