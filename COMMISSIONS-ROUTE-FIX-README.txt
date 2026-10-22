Creative Studio 5.0 — Commissions Route Fix

Changed:
- app/commissions/page.jsx: /commissions now redirects to /admin?tab=commissions instead of the public request form.
- app/admin/page.jsx: accepts a tab query parameter and preserves it through sign-in.
- components/StudioAdmin.jsx: opens the specified authorised tab on initial load.
- components/AuthForm.jsx: preserves staff /admin?tab destinations after sign-in.

Visit /commissions to open the staff commission management list. Only authorised admins/designers can view records.
Visit /commission to display the public commission enquiry form.

To deploy on GitHub/Vercel, overwrite those FOUR source files with the matching files from this ZIP, commit and push to the connected branch. No database change is necessary.

Note: records show only when imported to the same MongoDB database/commissions collection configured in Vercel.
