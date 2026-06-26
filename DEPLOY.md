# Deploying Wallet to the Google Play Store

This app is a self-contained, **offline** web app. To put it on Play Store you
wrap it in a native Android package (an `.aab`). The recommended wrapper is
**Capacitor**, which bundles all the web files *inside* the app so it needs no
hosting and no internet — matching the app's privacy goal.

> What you can't skip: building the `.aab` needs **Android Studio + the Android
> SDK** on your computer, and uploading needs a **Google Play Console** account
> (one-time $25). Those steps happen on your machine and in your account.

---

## A. Build the Android app with Capacitor (recommended)

### 1. Install prerequisites
- [Node.js](https://nodejs.org) 18+
- [Android Studio](https://developer.android.com/studio) (includes the Android SDK)
- JDK 17 (bundled with recent Android Studio)

### 2. Put the web files in `www/`
From inside this `card-wallet` folder:
```bash
mkdir -p www
cp index.html app.js styles.css manifest.webmanifest service-worker.js www/
cp -r lib icons www/
```
(The `resources/` and `store/` folders stay at the project root — they're build
inputs and store-listing images, not part of the app.)

### 3. Set your app identity
Open `capacitor.config.json` and change `appId` from `com.yourname.wallet` to your
own reverse-domain id (e.g. `com.jordan.wallet`). This id is permanent on Play.

### 4. Install and add Android
```bash
npm install
npx cap init "Wallet" "com.yourname.wallet" --web-dir=www   # if not already set
npx cap add android
npx cap sync android
```

### 5. Generate every icon + the splash screen
The polished sources are already in `resources/` (icon + adaptive layers + splash).
```bash
npx capacitor-assets generate --android
```
This creates all launcher densities, the adaptive icon, and the splash images
from `resources/icon-only.png`, `resources/icon-foreground.png`,
`resources/icon-background.png`, and `resources/splash.png`.

### 6. (Optional) Enable camera "Scan barcode"
The whole app works without this — you can always type a number in. To enable
on-device camera scanning, add to `android/app/src/main/AndroidManifest.xml`,
just above `<application>`:
```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-feature android:name="android.hardware.camera" android:required="false"/>
```
Capacitor's WebView grants the in-page camera once the OS permission is granted;
if a device denies it, the app falls back to manual entry automatically.

### 7. Open in Android Studio and set the version
```bash
npx cap open android
```
In `android/app/build.gradle` confirm `applicationId`, and set
`versionCode 1` / `versionName "1.0.0"` (bump these every release).

### 8. Create a signing key and build the .aab
In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**.
Create a new keystore the first time and **keep it safe** — you need the same key
for every future update. Output is `app-release.aab`.

(Or enroll in Play App Signing and let Google manage the key.)

---

## B. Publish on Play Console

1. Create the app at [play.google.com/console](https://play.google.com/console).
2. **Store listing** — use the assets in `store/`:
   - App icon: `store/playstore-icon-512.png` (512×512)
   - Feature graphic: `store/feature-graphic-1024x500.png` (1024×500)
   - Phone screenshots: `store/screenshot-1.png`, `store/screenshot-2.png`
     (add a couple more from the app if you like; 2–8 required)
   - Short + full description (draft below).
3. **Privacy policy** — host `PRIVACY.md` as a public web page and paste its URL.
   (A free GitHub Pages/Gist page is fine.)
4. **Data safety form** — declare **no data collected and no data shared**
   (true: the app is offline and stores everything locally). If you enabled
   camera, note it's used on-device only and not collected.
5. **Content rating** — complete the questionnaire (this app rates "Everyone").
6. **App access** — all features available without special access/login.
7. Upload the `.aab` to a track (Internal testing first, then Production).
8. Submit for review.

### Suggested listing copy
**Short description**
> Your membership and loyalty cards in one private, offline wallet.

**Full description**
> Wallet keeps all your membership, loyalty, gym, transit, and library cards in
> one place — and everything stays on your device. No account, no sign-in, no
> cloud, no tracking.
>
> • Add a card by scanning its barcode, typing the number, or snapping a photo
> • Tap a card to flip it and show a crisp, scannable barcode or QR at checkout
> • Your most-used cards rise to the top automatically; drag to arrange your own order
> • Works completely offline — nothing ever leaves your phone
> • Export a backup file you control, stored only where you choose
>
> Private by design: there are no servers and no analytics. Your cards live only
> on your device.

---

## C. Easiest alternative: PWABuilder (no Android Studio)
If you'd rather not build locally, host this folder on any HTTPS static host
(Netlify, GitHub Pages, Vercel), then go to **[pwabuilder.com](https://www.pwabuilder.com)**,
enter your URL, and it packages a signed Play-ready `.aab` for you (a Trusted Web
Activity). Note this path requires the site to stay hosted; the Capacitor path
above bundles everything into the app with no hosting.

---

## Release checklist
- [ ] `appId` set to your own reverse-domain id (permanent)
- [ ] Icons + splash generated (`capacitor-assets generate`)
- [ ] versionCode / versionName set
- [ ] Signed `.aab` built with a keystore you've backed up
- [ ] Privacy policy hosted and URL added
- [ ] Data safety = no data collected/shared
- [ ] Store listing images added from `store/`
- [ ] Tested on a real device from the Internal testing track
