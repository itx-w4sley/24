# Creative Studio 5.3 — Expanded Project Request Wizard

## What changed
- `components/ProjectRequestWizard.jsx` — six-step request workflow with service-specific feature checklists, scope, budget/timing, contact options, review and explicit acknowledgement.
- `app/globals.css` — responsive styling for progress meter, feature selections and project snapshot.
- `app/api/public/commission/route.js` — backwards-compatible support for `requestDetails` stored with each commission document.

## Install
Copy the three changed files into the same paths in your existing site, or deploy the full ZIP. Use Node 20.9+ with your normal Vercel environment variables. No new npm packages, MongoDB migrations or environment variables are needed.

## Saving and admin compatibility
The request is still sent to `POST /api/public/commission`, and the existing `commissions` collection is used. The new `requestDetails` subdocument is stored alongside a readable text summary in `description`, so the existing Studio Admin commission detail remains usable.

## Important
- No price estimate, booking or payment is promised.
- Reference links are text; file uploads are not enabled.
- Client ownership is linked only to an authenticated user with a matching email, per the existing server behaviour.
- Do not solicit Discord bot tokens, passwords, API keys or credentials in the form.
- The full Next.js build and live MongoDB/Vercel behaviour must be validated on deployment. Changes are local; your live site is not updated.
