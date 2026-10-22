# Advanced error page for 24xzvibx Creative Studio

This is a Next.js App Router **route error boundary** (app/error.jsx), styled to match the advanced 404 page. It catches rendering errors within route segments below its boundary; it does not replace app/not-found.jsx or handle every root layout/server failure. A root-level error boundary would require app/global-error.jsx.

## Install

Copy these two files into your existing Next.js project:
- app/error.jsx — replace the basic existing component
- app/error.module.css — new standalone CSS module

The existing global Studio CSS variables and lucide-react package are reused. No new package installations. Then commit to GitHub and deploy on Vercel.

## Behaviour

- **Try again** invokes Next.js's `reset()` callback.
- **Reload page** refreshes the browser tab.
- **Back to the studio** and the four navigation cards use Next.js `Link`.
- When Next.js supplies an opaque `error.digest`, it is shown as an optional reference for support. Raw exception messages and stack traces are not displayed publicly.
- Errors are logged to browser devtools only in development, not transmitted to a remote service.
- Responsive layout, keyboard-visible focus and reduced-motion fallback.

## Testing

Trigger a route render error in a local development environment, verify buttons and links, then remove the test error. A 404 will not trigger this error boundary; test 404 separately using a missing URL.

No live website, GitHub repo, or database has been modified by the archive creation.
