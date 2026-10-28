# Android device owner by QR code

A factory-reset Android 10+ device with a camera becomes the Player's device owner
and a screen of the project with no pairing code and no device manager. The
person opens the fleet link in the dashboard (Settings, Fleet links, Android
device owner, Show QR code), taps the device's Welcome screen six times and scans
the code. The Player runs full screen as the home app with no navigation bar,
notifications or lock screen. Create the link first (`fleet-links create`; its
URL creates screens, and so does the code: give it only to the person at the
device).

To hand the person the payload instead of the dashboard, build this JSON (the
dashboard's Copy provisioning JSON copies the same):

```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "PACKAGE/ai.screenrig.player.managed.ScreenRigDeviceAdminReceiver",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "DOWNLOAD_URL",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "CHECKSUM",
  "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": { "fleet_link": "FLEET_LINK_URL" }
}
```

`PACKAGE`, `path` and `signer_sha256` come from the `managed` entry of
`https://screenrig.ai/android/manifest.json` (another environment: its own apex).
`DOWNLOAD_URL` is `https://screenrig.ai` followed by `path`; `CHECKSUM` is
`signer_sha256` as URL-safe base64 without padding:

```bash
jq -r .managed.signer_sha256 manifest.json | xxd -r -p | openssl base64 -A | tr '+/' '-_' | tr -d '='
```

No `managed` entry means the site lists no device-owner build; say so rather than
using the `player` entry, whose package has no device administrator.
