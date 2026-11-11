import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/host-settings.js
function processSettings() {
  const settings = {
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
    APPDATA: process.env.APPDATA,
    PROGRAMFILES: process.env.PROGRAMFILES,
    TMPDIR: process.env.TMPDIR,
    DISPLAY: process.env.DISPLAY,
    WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY,
    SCREENRIG_CONFIG: process.env.SCREENRIG_CONFIG,
    SCREENRIG_API_URL: process.env.SCREENRIG_API_URL,
    SCREENRIG_BROWSER: process.env.SCREENRIG_BROWSER,
    SCREENRIG_FFMPEG: process.env.SCREENRIG_FFMPEG,
    SCREENRIG_FFPROBE: process.env.SCREENRIG_FFPROBE,
    SCREENRIG_CWEBP: process.env.SCREENRIG_CWEBP,
    SCREENRIG_VERSION: process.env.SCREENRIG_VERSION,
    SCREENRIG_INSTALL_SOURCE: process.env.SCREENRIG_INSTALL_SOURCE,
    SCREENRIG_SDK_RUNTIME: process.env.SCREENRIG_SDK_RUNTIME
  };
  for (const name of Object.keys(settings))
    if (settings[name] === void 0)
      delete settings[name];
  return settings;
}

export {
  processSettings
};
