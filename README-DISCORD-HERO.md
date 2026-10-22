# 24xzvibx Studio — Join Discord homepage button

This release adds **Join our Discord** as the third CTA in the homepage hero.

- The button uses Site Settings > Discord invitation URL (settings.discordUrl), falling back to the existing invite in lib/site.js.
- It opens in a new tab with rel="noopener noreferrer".
- A guard prevents non-Discord URLs stored in settings from being used by this button.
- Preserves existing Explore the work and Start a project buttons.
- Includes responsive styling, hover and keyboard focus states.

## Patch installation
Replace `app/page.jsx` and `app/globals.css` with the copies inside the PATCH ZIP.
Keep the directory structure intact. Commit and deploy in Vercel.

## Changing the link
Open Studio Admin > Site settings > Discord invitation URL.
If no override has been saved, the default is defined in `lib/site.js` and currently points to `https://discord.gg/P9wjyGFwFF`.

## Test
1. Open the homepage and click Join our Discord.
2. Confirm it opens a new tab pointing to your invite.
3. Change the Discord URL in Site settings and confirm the new link after refresh.
4. Test on mobile.

Note: Only source files changed. No live GitHub/Vercel/DB changes made.
