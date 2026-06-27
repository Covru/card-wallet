/* Caches everything on install so the app runs with zero network afterwards.
   IMPORTANT: bump VERSION on EVERY release - any change to index.html, app.js,
   styles.css, the bundled libs, or the Android versionCode. The cache name is
   derived from it, so a new VERSION makes this service worker reinstall and
   re-precache the updated files. Without a bump, returning users (and the
   Capacitor WebView after a Play Store update) keep serving the old cached app. */
const VERSION = "11";
const CACHE = "wallet-v" + VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./lib/fonts/newsreader-500.woff2",
  "./lib/fonts/newsreader-600.woff2",
  "./lib/fonts/inter-400.woff2",
  "./lib/fonts/inter-500.woff2",
  "./lib/fonts/inter-600.woff2",
  "./lib/fonts/inter-700.woff2",
  "./lib/fonts/plexmono-400.woff2",
  "./lib/fonts/plexmono-500.woff2",
  "./lib/fonts/plexmono-600.woff2",
  "./lib/jsbarcode.min.js",
  "./lib/qrcode.min.js",
  "./lib/zxing.min.js",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
     .then(() => self.clients.matchAll({ type: "window" }))
     .then((cs) => cs.forEach((c) => c.postMessage({ type: "sw-updated", version: VERSION })))
  );
});

// Cache-first: once installed, the network is never required.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
