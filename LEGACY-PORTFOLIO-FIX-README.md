# FIX: Show original 33 portfolio assets alongside MongoDB projects

## What was wrong
`lib/projects.js` contained the 33 old asset references, but `lib/content.js` only returned MongoDB records when a database was connected. As a result, `/portfolio` hid the original archive.

## What is changed
- `lib/content.js` now combines the 33 original archive items with **published** MongoDB projects. Duplicate matches by slug, category + name or image URL are removed.
- Old artwork appears under Banners, Generic Banners, Logos, Posters, and Photography, using the exact legacy image filenames.
- The homepage uses this combined public portfolio data too.
- Original archive artwork no longer incorrectly displays the "Planned" project stage. Project status badges are shown only if a real stage exists.
- Individual `/portfolio/[slug]` pages work for both types.
- Private commissions remain private and are **not** shown as portfolio projects.

## Required images — important
The source archive did **not** include the actual original image files. `public/assets/` only contained `PUT_IMAGES_HERE.txt`. You MUST place all 33 original PNG files there for the artwork to appear. Missing images show a placeholder tile; JavaScript cannot conjure images from filenames.

Examples (case sensitive on Vercel):
- public/assets/banner1.png
- public/assets/TechuraSolutionsC2_Dashboard.png
- public/assets/Australia Roleplay Banners.png
- public/assets/Port (1).png
- public/assets/Photo1.png

You do NOT need to import these 33 entries to MongoDB: this patch loads them from the built-in manifest. Keep your existing `projects` collection for your newer digital projects.

## To deploy
1. Copy patch files into matching paths in your GitHub `main` branch, or replace source with the full ZIP.
2. Add your original PNG files under `public/assets/` with the exact names from `lib/projects.js`.
3. Commit and deploy on Vercel.
4. View `https://24xzvibx.vercel.app/portfolio` and check the five design/photo categories.
5. If pictures show fallback titles, check image URL directly (`https://24xzvibx.vercel.app/assets/banner1.png`). A 404 means the image file was not deployed.

## Validation
Run `npm run check`. For gallery logic run `node scripts/check-legacy-assets.mjs` to list missing original images.
