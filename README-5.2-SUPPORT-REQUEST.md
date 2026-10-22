# 24xzvibx Creative Studio 5.2 — Support Centre + Project Request Wizard

This is an extension of your existing Next.js 15 / MongoDB / Vercel project. It preserves the studio's existing portfolio, 33 legacy artwork references, services, pricing, journal, 5.1 project features, commissions, portal and administration. It does not include missing artwork PNGs; please provide these separately in `public/assets` as instructed in the existing portfolio README.

## What's new

### `/support` — Customer Support Centre
- Public support introduction, issue-specific guidance and sign-in / register links.
- Signed-in clients can create a private ticket, choose the service and severity, and follow responses.
- Saved to `supportTickets` MongoDB collection. Includes customer identity from verified login, subject, category, priority, timestamps, status and reply history.
- Client access is limited to their own tickets. Staff can view all tickets.
- Replies are saved and notify staff/client in the app; external email or Discord notification integrations depend on existing environment settings.
- Ticket status: Open, In Progress, Waiting on Client, Resolved or Closed.
- Staff manage status, priority and replies through `/admin?tab=tickets`.
- Account required to submit tickets; this protects customer messages from being accessed by anyone who simply knows an email address. Contact page remains available to guests.
- This is **not** a real-time uptime status page, live-chat service, or guaranteed SLA. Attachments are not implemented. Users can include non-sensitive screenshot URLs in their message.

### `/start` — Project Request Wizard
- Four guided steps: Select Service → Project Brief → Contact and Timing → Review/Submit.
- Services offered: Discord bot development, Discord server development, hosting, website/app development, logos/brand identity, banners/graphics, photography/photo editing.
- Collects scope, optional deliverables, reference links, budget range, deadline, name and email.
- Reuses existing POST `/api/public/commission`, saves to the existing `commissions` collection and sends existing staff notifications.
- Does not request payment or automatically accept an order.
- Signed-in users whose verified account email matches the request email can view requests via their client portal. Guest requests stay unlinked until ownership verification.
- The original `/commission` request form is kept for backward compatibility.

## Installation — choose one option

**PATCH ZIP:** Extract into the root of your existing GitHub repository, preserving directories. Overwrite matching files. New route and component files need to be added.

**FULL ZIP:** Use as a complete source replacement (does **not** contain `node_modules`, `.env.local`, database contents, your actual original artwork images, or private keys). Review your existing configuration before switching.

1. Commit changed code to the repository branch connected to Vercel (`main` if configured that way).
2. Verify the Vercel environment has `MONGODB_URI`, `MONGODB_DB` (your actual database name), `SESSION_SECRET` and `SITE_URL` per existing README. Do not paste any secrets into the public source.
3. The `supportTickets` collection is created automatically when the first ticket is filed. MongoDB indexes are optional but recommended: run `npm run support:indexes` from a securely configured local project (creates indexes only, does NOT re-run setup or reseed projects).
4. Deploy; visit `https://24xzvibx.vercel.app/support` and `https://24xzvibx.vercel.app/start`.
5. Sign in with a client account to create a test ticket. Sign in as admin or designer and open `/admin?tab=tickets` to see it and reply.
6. Submit a sample wizard request; verify it appears in `commissions` through Admin and, if signed in with matching email, in the client portal. Delete test data when finished.

## Files added

- `app/start/page.jsx`
- `app/support/page.jsx`
- `app/api/app/support/route.js`
- `app/api/app/support/[id]/route.js`
- `components/ProjectRequestWizard.jsx`
- `components/SupportCentre.jsx`
- `components/SupportDeskAdmin.jsx`
- `scripts/support-indexes.mjs`

## Files updated

- `components/SiteShell.jsx` (navigation + version)
- `components/StudioAdmin.jsx` (Tickets tab)
- `components/ClientPortal.jsx` (link to new wizard)
- `app/globals.css` (responsive page styling)
- `app/page.jsx` (homepage call to action)
- `app/sitemap.js` (routes)
- `lib/db.js` (support collection and recommended indexes)
- `package.json` (script + version)

## Testing and operational notes

- Syntax parse checked across all JavaScript and JSX files; `node scripts/check.mjs` passes.
- A full Next.js build was **not** possible in this environment because npm registry DNS access failed. Run `npm install` and `npm run build` before production deployment.
- No live database edits, GitHub commits or Vercel deployments performed.
- Responses and notifications are not guaranteed to arrive instantly and depend on the connected database and optional notification configuration.
- Anyone signing in may create a private ticket; set account registration policies appropriately if you need members-only support. Audit logs record ticket create/reply/status changes.
