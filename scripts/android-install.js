/* Build + install the debug APK to a connected device, from the android/
   project. Routed through Node so it works the same from cmd, PowerShell,
   or bash (a bare `gradlew` in an npm script is resolved inconsistently). */
const { spawnSync } = require("child_process");
const path = require("path");

const androidDir = path.join(__dirname, "..", "android");
const isWin = process.platform === "win32";
// Use the wrapper's absolute path: some Windows cmd configs don't search the
// working directory for the executable, so a bare `gradlew.bat` isn't found.
const [bin, args] = isWin
  ? ["cmd", ["/c", path.join(androidDir, "gradlew.bat"), "installDebug"]]
  : [path.join(androidDir, "gradlew"), ["installDebug"]];

const r = spawnSync(bin, args, { cwd: androidDir, stdio: "inherit" });
if (r.status !== 0) {
  console.error("\nBuild/install failed. Is a device connected? Check `adb devices`.");
  process.exit(r.status || 1);
}
