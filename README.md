# 24xzvibx Creative Studio 5.0

A complete **Next.js / React** creative portfolio + content dashboard + secure sign-in + client commission portal. Built for Vercel, MongoDB Atlas, and optional Cloudinary/Discord/email integrations. This is an editable source-code project, not a precompiled `.exe`.

## What is implemented

- **Public website:** responsive creative homepage; searchable 4:3 portfolio; categories, favourites, full-screen inspector, project case studies; services; studio journal; about; contact; commission forms; public resources/downloads; published testimonials; Discord presence; optional background music.
- **Personalisation:** light/dark appearance, four accent colours, effects toggle, keyboard command palette (`Ctrl/Cmd+K`), saved favourites, SEO, sitemap, reduced-motion styles and mobile navigation.
- **Admin:** overview and basic analytics, audit activity, project/news/service editors, testimonials, custom text pages, media catalogue, Cloudinary uploads, commission tracking, client-facing messages, private notes, quotes, progress, delivery URLs, enquiries, site settings, user creation and disable/enable.
- **Client portal:** email/password registration, login, order status, progress, quotes, messages, delivery links, proof approvals and revision requests, notifications, profile updates and password changes.
- **Backend:** MongoDB Atlas, per-role access controls (`admin`, `designer`, `client`), bcrypt password hashing, signed HTTP-only session cookies, server-side access checks, login and public-form rate limits, origin checks, safe field validation, audit logs, indexes, private full-backup and explicit-restore scripts.
- **Integrations:** optional Discord webhook for new enquiries/commissions, optional Resend email support, optional Cloudinary uploads. Links to existing Discord/Lanyard presence and hosted audio are included but depend on those external services.

**Not a payment processor:** pricing/quotes are recorded, but no card charging or Stripe checkout is implemented. **Not a WYSIWYG drag-and-drop page builder:** editable text pages and sections are available. **No email verification or password-reset mailer yet:** do not advertise the client portal as email-verified or claim that guest commissions automatically attach to a newly created account. Only confirmed signed-in requests become linked orders. The user must complete production policy/terms review before opening a commercial site.

## Start locally (Windows PowerShell)

Requirements: **Node.js 20.9+** (Node 22 LTS preferred), an Atlas database and its database user, and internet for the initial npm install.

```powershell
cd path\to\24xzvibx-creative-studio-5.0
npm install
Copy-Item .env.example .env.local
```

Open `.env.local` and replace its placeholders with **your own** MongoDB URI, secure session secret, and administrator details. Generate a fresh secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never put passwords, MongoDB URIs, service keys or webhook URLs inside source files, `NEXT_PUBLIC_*` variables, or GitHub. Never reuse credentials that were pasted into public locations. **Rotate any previously exposed database password.**

In MongoDB Atlas: create the cluster, a database user with access to the selected database, and configure network access so **the deployment can reach it**. Atlas connections need allowed source addresses. For Vercel deployments without fixed egress IPs, follow Atlas/Vercel network guidance and consider a secure connectivity product or fixed egress. Allowing `0.0.0.0/0` is a broad exposure and should not be your default security setting. Use TLS and a strong scoped database password.

```powershell
npm run setup
npm run dev
```

Open `http://localhost:3000`, then sign in at `http://localhost:3000/login` with the **admin credentials you chose**. There is no hard-coded default admin code or password.

### Keep your original portfolio photos

Copy the old site's `assets/` PNG artwork into **`public/assets/`**, preserving spelling and capitalization. The 33 paths appear in `lib/projects.js`. The ZIP does **not** include original artworks because the supplied code referenced the assets but did not contain their image bytes. Gallery tiles gracefully fall back to branded placeholders if files are absent.

### Initial data

`npm run setup` creates the indexes, original 33 artwork records, default services, one studio journal entry, settings, and your admin account (only if that email is not already used). It does not replace existing records. After setup, edit records using `/admin`.

## Deploy to Vercel

1. Put this project in a **private GitHub repository** (do not include `.env.local`), or import it using the Vercel CLI.
2. In Vercel, import the repo as a **Next.js project**. The standard build command is `npm run build`, output is automatic for Next.js.
3. Set `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET`, and `SITE_URL=https://your-actual-domain.example` in Vercel's project environment variables. Configure optional Cloudinary, Resend and Discord variables only when using those features.
4. Run `npm run setup` **from your own computer** with `.env.local` pointing to the production database before using the deployed administration panel. Do **not** deploy `ADMIN_PASSWORD` or `ADMIN_EMAIL` into Vercel environment settings: setup runs locally.
5. Deploy and test login, form submissions, project publishing, client messaging, and upload/delivery with separate client and admin accounts.
6. Configure a custom domain, TLS, backups, and legal terms before inviting clients.

If you change your `SITE_URL`, update it in Vercel. The `sameOrigin` check enforces same-origin mutations. Vercel needs egress access to Atlas; a MongoDB `ETIMEDOUT` or server selection timeout normally indicates DNS/network access or invalid credentials, not an HTML problem.

## Pages & access

| Page | Access | Purpose |
|---|---|---|
| `/` | Everyone | Studio dashboard and featured artwork |
| `/portfolio` | Everyone | Searchable gallery; 33 seeded entries |
| `/portfolio/[slug]` | Everyone | Project case study |
| `/services` | Everyone | Services |
| `/news` & `/news/[slug]` | Everyone | Journal and announcements |
| `/resources` | Everyone | Published resource pages and public downloads |
| `/about`, `/contact`, `/commission` | Everyone | Studio, enquiry and brief forms |
| `/login`, `/register` | Everyone | Authentication and client registration |
| `/portal` | Signed-in | Client orders, messages, account controls |
| `/admin` | Admin or designer | Back-office console (role restricted) |

Admins add team members under **Team & clients**. Designers can publish and manage authorised creative resources; the administrator manages accounts and global site settings. Clients cannot enter the admin console. Disabling an account prevents new requests using its prior session token because users are checked against MongoDB on each authenticated request.

## Images, media and delivery

- Add an image by editing a project and entering `Image URL` or by uploading it in **Media library** and pasting the returned URL.
- Optional Cloudinary requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. The uploader permits PNG/JPG/WebP/GIF/PDF up to 10 MB. Cloudinary's default upload mode stores files publicly; do **not** upload confidential client deliverables there unless you configure private authenticated delivery separately.
- For a public downloadable resource, create a media entry with category **`Public downloads`** and `published` status. Other categories do not appear on the public resources page.
- Admins set `downloadUrl` for commission deliveries. `/api/app/delivery/[id]` checks logged-in order ownership before redirecting to that link. **The destination's access control is still the storage provider's responsibility.** For sensitive files use short-lived signed private links from your storage provider.
- Live Discord presence relies on the public Lanyard service; it may show as unavailable if the ID is not tracked or the service is down. Music relies on the supplied external audio links and requires user interaction before playback.

## Optional notifications

- `DISCORD_WEBHOOK_URL`: Discord channel alerts when contact forms or commission briefs arrive.
- `RESEND_API_KEY` and `NOTIFICATION_FROM`: email support for specific order-status changes; sender domain must be verified by your mail provider.
- Notification records are stored in MongoDB for signed-in users. Full push notifications, browser push subscriptions and mass marketing mail are not configured.

## Backup and restore

```powershell
npm run backup
npm run restore -- --file backups/studio-backup-EXAMPLE.json --confirm
# WARNING: replacement restore removes records in included collections first
npm run restore -- --file backups/studio-backup-EXAMPLE.json --confirm --replace
```

Full backups contain **password hashes, client information, private messages and internal records**. Store them encrypted with restrictive access, never in a shared repository. Backup scripts only save MongoDB documents; external media files are **not** included. Practice restore against a separate database first, then check user roles and collection indexes.

## Checks

```powershell
npm run check
npm run build
```

The included check script validates core files and the 33 imported artwork mappings. A production `npm run build` and interactive tests should be run after dependency installation. If the server environment is incomplete, the public gallery can show bundled demo metadata, but login and database actions require MongoDB and the session secret.

## Project layout

- `app/` — Next.js app router pages and API endpoints
- `components/` — React pages, gallery and control components
- `lib/` — authentication, database, validation, project seed data and server helpers
- `scripts/` — secure initial setup, backup, restore, validation
- `public/assets/` — **your** original portfolio files go here

## Safe production notes

Use a unique admin password, HTTPS, a scoped Atlas user, Cloudinary signed/private delivery for sensitive files, configured content and privacy policies, and verified DNS. Monitor authentication abuse and MongoDB costs. Disable unused public sign-up if you want an invite-only portal. Do not share ZIPs containing `.env.local` or real customer data.
