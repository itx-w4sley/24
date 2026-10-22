# 24xzvibx Studio 5.4.2 — Private maintenance admin

This update implements the requested setup:
- `STUDIO_MAINTENANCE_MODE=1`: public HTML pages display the maintenance screen (503 requested by middleware), and public APIs reject traffic with HTTP 503 rather than accepting new orders.
- During maintenance, only requests from an explicitly approved **PUBLIC** IP can reach `/admin`, `/login`, `/401`, `/403`, `/session-expired`, and the admin/auth/app APIs needed by the dashboard.
- The ordinary Studio account login and existing role controls STILL APPLY. Only the `admin` role can operate the maintenance control, and the toggle requires the account password again.
- Admins can select **Maintenance control** (`/admin?tab=maintenance`) to request enable/disable. The server uses Vercel's REST API to change the Production environment variable, then a secret Deploy Hook queues a Production build.
- The button does **NOT** immediately flip a running deployment. Wait until the newly queued Production deployment succeeds before expecting the site state to change. Check Vercel Deployments.
- The old `/500` special-numbered route was renamed to `/system-error` to avoid the Next.js 15 `ENOENT .next/export/500.html` export conflict.

## Critical: public IP != local IP

Do NOT set `192.168.0.6` or any `192.168.x.x`, `10.x.x.x`, or `172.16-31.x.x` LAN IP. Vercel sees your **public router/ISP IP**. All devices behind the same public IP appear equivalent at this access-control layer. If you need one physical device, use device-bound authentication / a trusted VPN or certificate, in addition to Studio login.

Obtain the PUBLIC IPv4 (or IPv6) address of your router while connected to your trusted network. If your ISP rotates the public IP, you may get locked out; recovery requires changing the allowlist in Vercel and redeploying. Avoid broad CIDR allowlists.

## Vercel Production environment variables

Set these from Vercel Project -> Settings -> Environment Variables; scope to **Production**:

```
STUDIO_MAINTENANCE_MODE=1
STUDIO_MAINTENANCE_ADMIN_IPS=YOUR_ACTUAL_PUBLIC_IP
VERCEL_API_TOKEN=<your server-side Vercel token>
VERCEL_PROJECT_ID=<the Vercel project ID>
VERCEL_TEAM_ID=<team ID only if the project belongs to a Vercel team>
VERCEL_DEPLOY_HOOK_URL=<production Deploy Hook for branch main>
```

Security: VERCEL_API_TOKEN and VERCEL_DEPLOY_HOOK_URL are secrets. NEVER put them in code, a public repository, a client-side component, or `NEXT_PUBLIC_*`. They remain accessible **only** to the Node.js server route `app/api/admin/maintenance/route.js`. Use a least-privilege token if account permissions allow it; rotate it if exposed.

How to create a Deploy Hook: Vercel Project -> Settings -> Git -> Deploy Hooks -> new hook targeting `main`. Copy the generated URL into `VERCEL_DEPLOY_HOOK_URL`. Treat the URL like a password.

For teams: supply `VERCEL_TEAM_ID`; otherwise leave blank.

**Bootstrap requirement:** Set up the allowlist, token, project ID and hook BEFORE enabling maintenance. Test from your network. If you enable maintenance without a valid public IP, the app intentionally fails closed for admin and you must use Vercel Settings to recover.

## How to use

1. Deploy this source version to Production while maintenance is disabled (`STUDIO_MAINTENANCE_MODE=0`).
2. From your approved home network, log in as an Admin at `/admin`.
3. Open `/admin?tab=maintenance` (Maintenance control tab).
4. Select **Enable maintenance**, type `ENABLE`, enter your Studio login password again and submit.
5. The API updates the Production env var from `0` to `1` and triggers a production deployment. When it succeeds, normal visitors get the maintenance screen and public API requests return 503.
6. On the same approved public IP, open `/admin` and sign in normally (if not already signed in); select **Maintenance control**.
7. Select **Disable maintenance**, type `DISABLE`, re-enter your password and submit.
8. The API changes the Production env var to `0` and triggers another deployment. Public traffic resumes only after the new deployment succeeds.

## Limitations / recovery

- This is *network* allowlisting, not physical device identification. Studio account login is mandatory; for device-specific security add passkeys/MFA or another second factor.
- Public IP changes (including mobile networks, VPN changes, dynamic home IPs) can lock you out. Keep emergency access to Vercel dashboard.
- Environment-variable updates DO NOT take effect in an already-running deployment. A deployment can fail; the UI says it is queued, not completed. Inspect Vercel Deployments.
- A successful environment update followed by a failed webhook leaves the env var changed but the old site live. Manually redeploy in Vercel; do not assume the site state changed.
- Admin also depends on MongoDB for authentication; if MongoDB is unavailable, you may not be able to sign in regardless of IP.
- This does not implement device certificates, MFA, Vercel Global Config/Edge Config or an instant emergency switch. For near-instant maintenance toggling without redeploy, use Vercel Global Config (previously called Edge Config) instead.
- Do not give Vercel API tokens to designers or clients; only the admin role can see the new tab.
- Validate the result of the status code and the whitelist with real Vercel Production tests before relying on it for an incident.

## Updated files

- `middleware.js` — middleware maintenance/IP enforcement for pages and APIs
- `app/api/admin/maintenance/route.js` — server-only Vercel env PATCH and Deploy Hook, password recheck, audit and rate limiting
- `components/MaintenanceControl.jsx` — admin UI with explicit confirmation
- `components/StudioAdmin.jsx` — admin-only Maintenance control tab
- `.env.example` — required settings template
- `app/system-error/page.jsx` — formerly `app/500/page.jsx`; **delete** the old `app/500/` directory from GitHub if present.

## Test checklist

- Maintenance OFF: public pages load; admin toggle from approved network requires login and password.
- Maintenance ON: anonymous `/`, `/portfolio`, `/start`, and `/api/public/commission` return maintenance/503; new commissions cannot be created.
- Maintenance ON: approved IP `/login` and `/admin` work; approved IP `/api/admin/maintenance` is accessible to logged-in admin.
- Maintenance ON: non-approved IP `/admin` and `/api/admin/maintenance` are blocked; no confidential admin data is returned.
- An admin on a disallowed IP cannot toggle even with a valid login cookie.
- A designer/guest cannot toggle; a wrong password or wrong confirmation is rejected.
- Enabling/disabling queues deployment; check that Vercel promotes it to Production before reporting a new state.
