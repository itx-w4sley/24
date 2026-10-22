# Creative Studio 5.0 — CSS repair

## What was broken

The application root layout correctly imported `app/globals.css`, but the original stylesheet included selectors from an older site version such as `.topnav` and `.home-hero`. The current application uses `.app-shell`, `.sidebar`, `.topbar`, `.hero`, `.grid-projects` and `.project-card`. As a result, the site looked mostly unstyled even though the CSS file was present.

## Fix

Replace the entire `app/globals.css` in your GitHub repository with the included `app/globals.css`. Keep the existing import in `app/layout.jsx`:

```jsx
import './globals.css';
```

Commit the change to `main`. Vercel will build a new commit. Do not redeploy an older commit; a redeploy does not pick up recent source changes.

After the new deployment is Ready, open the site in an incognito/private window or do a hard refresh (Ctrl+Shift+R). If it still appears unstyled, open DevTools > Network > CSS and inspect failing `/_next/static/css/...` files and the Console tab. Check that the deployment's commit ID matches the commit containing the CSS change.

## Test results

- All CSS rules/declarations parsed without errors.
- The stylesheet includes rules for all static class names found in the application's current JSX.
- `node scripts/check.mjs` passed (11 essential files, 33 projects).
- Offline Chromium preview rendered desktop (1440 px) and mobile (390 px) with dark background, navigation, typography and cards; no horizontal overflow detected.
- **A live Vercel production deployment has not been tested here.**

## What's included

The full-project ZIP includes the corrected `app/globals.css` and the previously fixed `components/StudioAdmin.jsx`. Your environment files and actual artwork image assets must be supplied separately; do not commit secrets or passwords.
