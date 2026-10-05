# Operational notes

## Where data lives

1. **Enquiries and careers forms**
   - Stored in a Google Sheet through the enquiry Apps Script.
   - Frontend variable: `VITE_ENQUIRY_ENDPOINT`.

2. **Events (home page)**
   - Stored in the `Events` sheet of the same spreadsheet. The home page reads them from the Apps Script (`VITE_EVENTS_ENDPOINT`) and falls back to the published sheet CSV.
   - To add or remove an event, edit the Google Sheet. A template with the expected columns is in `docs/events-template.csv`.

3. **Gallery photos** come from two sources:
   - **Bundled photos** live in `src/components/images/gallery/` (for example `campus`, `childrens-day`, `annual-day-2026`). They are included in every build.
   - **Online albums** live in a Google Drive folder, one sub-folder per album. The site reads them from the gallery Apps Script (`VITE_GALLERY_ENDPOINT?type=gallery`). Drive files must be shared as "Anyone with the link" or the images will look broken.

## Hosting (Netlify)

- Build command: `npm run build`; publish directory: `dist`.
- Add the `VITE_*` variables under Site settings, then Environment variables.
- SPA routing is handled by `public/_redirects` and `netlify.toml`, so deep links do not 404 on refresh.

## Apps Script

- Enquiry / careers / events script: `apps-script/ENQUIRY_SHEET.gs`. Script property `EVENTS_TOKEN` protects event writes.
- Gallery script: `apps-script/gallery.gs`. Script properties: `ADMIN_TOKEN` (secret) and `GALLERY_ROOT_FOLDER_ID`.
- Never commit token values; set them only in the Apps Script project.

## Image helpers

Node scripts in `scripts/` import and compress photos into `src/components/images/`. Run them from the repository root, for example `node scripts/compress-images.mjs`.

## Troubleshooting

- "Page can't be reached" in development: the dev server stopped; run `npm run dev` again.
- Gallery images look broken: check the Drive files are shared as "Anyone with the link".
- Forms not arriving in the sheet: confirm `VITE_ENQUIRY_ENDPOINT` is set in Netlify and the Apps Script deployment is current.

## Credit

The footer credits the website developer, Penkey Vardhan Sai Raghavendra Nehru.
