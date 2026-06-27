/* Mirror the root web bundle into www/ (Capacitor's webDir).
   The editable source lives at the project root; www/ is what Capacitor
   copies into the Android app. Run this before `cap sync` so the build
   never ships a stale www/. Directories are wiped first so removed files
   (e.g. an old font) don't linger in the bundle. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const www = path.join(root, "www");

const FILES = ["index.html", "styles.css", "app.js", "manifest.webmanifest", "service-worker.js"];
const DIRS = ["lib", "icons"];

fs.mkdirSync(www, { recursive: true });

for (const f of FILES) {
  fs.copyFileSync(path.join(root, f), path.join(www, f));
}
for (const d of DIRS) {
  const dest = path.join(www, d);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(path.join(root, d), dest, { recursive: true });
}

console.log("Copied web bundle -> www/  (" + FILES.join(", ") + "; " + DIRS.join("/, ") + "/)");
