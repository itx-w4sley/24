# 24xzvibx Creative Studio 5.4 — Error and Recovery Suite

This update builds eight requested screens and integrates core fallbacks with the existing Next.js App Router application.

## Error pages
- `/401` — sign-in required; safe internal return URL (`?next=/portal`)
- `/403` — insufficient permissions, shown to authenticated non-staff on `/admin`
- `/500` — general troubleshooting information; **a visit to `/500` itself is not an actual HTTP 500**
- `/database-unavailable` — database/API recovery advice
- `/session-expired` — re-authentication flow for expired sessions
- `/maintenance` — scheduled maintenance landing page
- `/offline` — connectivity problem with an interactive connection check
- `/429` — rate-limit advice (without an invented countdown)

Additional Next.js boundaries: `app/global-error.jsx` handles root layout errors, `app/error.jsx` (existing) handles route errors, and `admin`, `portal`, `support` use scoped error fallbacks. Loading skeletons provided for these routes.

## Optional maintenance
Set `STUDIO_MAINTENANCE_MODE=1` in Vercel environment settings and redeploy. `middleware.js` rewrites normal page requests to the maintenance route and requests a 503 status. `/maintenance`, assets, framework files and APIs are excluded. Revert to `0` or unset and redeploy to disable. No automatic maintenance scheduler or accurate return time is provided.

## Integration
- `/admin` unauthenticated -> `/401?next=/admin`; signed-in non-staff -> `/403`.
- API error formatting differentiates database outages (503), configuration issues (503) and unexpected errors (500). Clients can act on `code` and HTTP status.
- Client portal and support desk catch authenticated API 401 and redirect to `/session-expired`; authenticated API 403 -> `/403`; database outages on background reads -> `/database-unavailable`. Forms still show errors inline to avoid losing unsent input.
- Sign-in, support and request wizard present dedicated rate-limit and outage advice after API responses rather than silently failing.
- `/api/health` supports a basic connectivity check; no technical database details exposed publicly.

## Limits
- These screens do not create automatic monitoring or change all API endpoints. API handlers still respond with JSON and proper HTTP codes, not HTML pages.
- The offline screen cannot guarantee internet connectivity; browser status and health checks are indicators.
- The 500 route is a friendly page, while unexpected rendering errors are handled by `error.jsx` / `global-error.jsx`.
- Manual testing against a Vercel deployment and MongoDB is required. No live deployment or database changes were performed.

## Install
Upload patch files into matching paths in your existing GitHub repository, or deploy the full-site ZIP contents. Do not upload secrets or `.env` values. The patch ZIP contains only new/modified files.
