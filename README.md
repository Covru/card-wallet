# Wallet — Local Cards

A private, **offline** wallet for your membership and loyalty cards. Photos and
card numbers are stored **on your device only**. No account, no sign-in, no
cloud, no tracking, no network calls. Everything — barcode generation, camera
scanning, storage — runs locally.

## Design
A premium dark interface with deep jewel-toned cards (real material: sheen +
grain), a champagne-gold accent, and two layouts you can switch between:
- **Stack** (default) — cards overlap like a real wallet; tap one to open it.
- **List** — compact rows, best when you have lots of cards.

## Features
- Store cards by category (gym, grocery, transit, library, cafe, events, loyalty…)
- Generate a **real scannable barcode or QR** from the number (Code 128, EAN-13, UPC-A, Code 39, QR)
- **One tap to the barcode** — tapping a card opens it and flips straight to its scannable code; tap **Enlarge** for a big, bright "Show at checkout" view (the ⓘ button opens details/edit). Keeps the screen awake for the scanner.
- **Most-used cards float to the top automatically** (along with pinned ★ cards), so your everyday cards are always within reach. Tap **Arrange** to switch to **Custom** order and drag every card into the exact position you want.
- **Scan to add** — point the camera at a card's barcode to fill the number automatically
- Search, pin favourites, edit, delete
- **Persistent storage** is requested so the browser won't evict your cards, plus a periodic **backup reminder**
- **Backup / restore** to a single JSON file you control (your only safety net — local-only means no cloud)

Your wallet starts empty on first launch — tap **Add card** to create your first
one (by scanning, photo, or typing the number).

## Run it
The app needs to be served over **https or localhost** for camera scanning,
installation, and offline caching to work (browsers require a secure context).

**Quickest local test:**
```bash
cd card-wallet
python3 -m http.server 8000
# then open http://localhost:8000
```

**On your phone / to keep forever:** host the folder on any free static host
(Netlify drop, GitHub Pages, Vercel, Cloudflare Pages). Open the URL once on your
phone, then use the browser's **"Add to Home Screen."** After that first load it
runs fully offline, like a normal app, with nothing leaving the device.

> Opening `index.html` directly with `file://` shows the UI, but the browser
> blocks the camera, install, and offline cache in that mode. Serve it instead.

## Files
- `index.html`, `styles.css`, `app.js` — the app
- `manifest.webmanifest`, `service-worker.js` — installable + offline
- `lib/` — bundled offline libraries (JsBarcode, qrcode, ZXing scanner)
- `icons/` — app icons, favicons, apple-touch icon
- `resources/` — icon + splash sources for the Android build (`@capacitor/assets`)
- `store/` — Play Store assets (512 icon, 1024×500 feature graphic, screenshots)
- `capacitor.config.json`, `package.json` — Android wrapper config
- `DEPLOY.md` — step-by-step Google Play deployment guide
- `PRIVACY.md` — privacy policy (host it and link it on Play)

## Publish to the Play Store
See **`DEPLOY.md`**. In short: the app is wrapped with Capacitor so all web files
are bundled inside the Android package (no hosting, fully offline), then built as
a signed `.aab` in Android Studio and uploaded to Play Console. A no-Android-Studio
alternative (PWABuilder) is also described.

## Privacy
There is no backend. After the first load the app makes zero network requests.
Your data lives in the browser's on-device database (IndexedDB) and never goes
anywhere unless you export a backup yourself.
