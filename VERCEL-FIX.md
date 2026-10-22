# Vercel build fix — 22 October 2026

## Cause

The Vercel build for the earlier release failed in `components/StudioAdmin.jsx` because `await` was used inside two synchronous React `setItems(previous => ...)` callbacks. The surrounding `load` handler was async, but that does not make nested callbacks async.

## Fix

`load` now awaits the relevant API response **before** calling `setItems`, then synchronously updates the state. This fixes both the `/api/admin/users` and generic `/api/admin/[resource]` loading paths without changing any admin tabs or API endpoints.

## Deploy to GitHub / Vercel

1. Copy the **contents** of this project folder into your `itx-w4sley/24` repository (including the modified `components/StudioAdmin.jsx`). Don't nest the entire project folder inside the GitHub repository root.
2. Commit the changes to the `main` branch.
3. Vercel will automatically start a deployment. Alternatively, open Vercel > Project > Deployments > Redeploy.
4. Verify the build log reaches `Compiled successfully` and the deployment status is Ready. If another error appears, share the first error, not just `exit code 1`.

If you're updating just one file: replace `components/StudioAdmin.jsx` in GitHub with the corrected version included in the ZIP.

## Verification

- `npm run check`: PASS (33 original portfolio entries and 11 critical project files).
- Static JSX/JS syntax scan: PASS for 80 code files, with no `await` inside synchronous functions.
- A full `next build` has **not** been run here because external npm registry access was unavailable. This fix addresses the exact compiler error shown in the Vercel log; other build/runtime issues cannot be ruled out until Vercel runs again.

## Environment

Make sure production variables from `.env.example` are set in Vercel's project settings. Never commit `.env.local` or actual secrets. The Node engine `>=20.9.0` and `cache-dir` warnings shown in the log are warnings, not the error that stopped this build.
