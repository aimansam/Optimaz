# PWA & Installability

TaskFlow uses a lightweight manual PWA setup. It does not use `next-pwa` or Workbox.

## Files

- `public/manifest.json` defines app name, icons, display mode, colors, and start URL.
- `public/sw.js` is the manual service worker.
- `src/components/service-worker-registrar.tsx` registers `/sw.js` in the browser.
- `src/components/InstallPWAButton.tsx` listens for `beforeinstallprompt` and shows the install button.

## Service Worker Behavior

The current service worker is intentionally minimal:

- It calls `skipWaiting()` on install.
- It deletes existing caches on activate, which helps replace old `next-pwa`/Workbox caches.
- It claims clients after activation.
- It handles `SKIP_WAITING` messages.

The service worker does not implement offline page caching. The app is installable, but authenticated data still depends on Supabase/network availability.

## Production Checks

After deployment, verify:

```bash
curl -I https://task-flow-ashy-nu.vercel.app/manifest.json
curl -I https://task-flow-ashy-nu.vercel.app/sw.js
```

Both should return `200`. The service worker body should include `install` and `activate` handlers.

## Push Notifications

Push notification endpoints exist at:

- `/api/push/subscribe`
- `/api/push/send`

Push requires VAPID variables in the deployment environment:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:you@example.com
```