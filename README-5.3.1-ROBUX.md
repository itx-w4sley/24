# Creative Studio 5.3.1 — ROBUX currency update

Robux is the studio's currency for new project requests and pricing. "R$" denotes Robux, not Brazilian real. No USD/AUD conversion, payment collection, or automatic Robux checkout is implemented.

## Files changed
- `components/ProjectRequestWizard.jsx`
- `components/StudioForms.jsx`
- `app/api/public/commission/route.js`
- `components/StudioAdmin.jsx`
- `lib/site.js`
- `components/ClientPortal.jsx`
- `app/page.jsx`
- `package.json`

## Install
Upload the changed files preserving their directories into the same GitHub repository you use with Vercel, or deploy the full website archive. No schema migration is required for new enquiries.

## New project submissions
- Wizard at `/start`: budget ranges and review are in Robux.
- Simple commission form at `/commission`: budget ranges are in Robux.
- `/api/public/commission` now sets `currency: "ROBUX"` for newly submitted requests. The budget field is still a descriptive text range, not a paid amount.
- Admin price and package price fields are labelled in Robux.
- Packages and homepage show `R$` instead of AUD.
- Client portal formats quoted amounts in their stored currency. Old records marked `AUD` continue to display AUD until you explicitly review and correct them. This avoids silently pretending dollar amounts are the same number of Robux.

## Existing MongoDB records
This update does NOT change existing documents. If you previously imported project placeholders into `commissions`, move them to `projects` as appropriate. If an existing commission's values were actually intended as Robux, manually edit its `currency` to `ROBUX` and review its budget and price. Do not bulk change or convert real AUD charges.

## Verification
Syntax and archive checks are performed on prepared files. Full production build and live submissions must be verified after deployment.
