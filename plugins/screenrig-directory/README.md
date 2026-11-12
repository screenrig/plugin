# screenRIG

Free, agent-driven digital signage. Ask Claude for a menu board, a lobby
welcome, an office dashboard or a kiosk, and it builds the screen, publishes it
to your TVs and keeps it current, on the screens you already have.

## What you can ask

```text
You: Put our café menu on the counter TV: breakfast until 11, lunch until 4,
     dinner after that. The salmon is sold out.
Claude: Done. The counter TV switches menus on its own clock, and the salmon is
        marked sold out. Here is a screenshot from the screen.
```

- **Pair a screen.** Install a Player, read Claude the code on the screen, and
  it is yours.
- **Build content from 200+ ready-made apps.** Menus, queues, weather,
  schedules, room calendars and KPI boards, live on every Player in nine themes.
- **Schedule it.** Dayparts, dated campaigns, urgent takeovers and playlists
  across one screen or thousands.
- **Keep it current.** Sheets, calendars and other sources feed the screen
  without republishing.
- **Check the glass.** Claude takes a screenshot from any screen, reads alerts
  and playback, and reports uptime and proof of play.

Free, with unlimited screens. Players for Android and Google TV, the Amazon
Signage Stick and Fire TV Sticks, Apple TV, macOS, Windows, Linux, Raspberry Pi,
Samsung Smart Signage, LG webOS Signage and BrightSign, or the Player web app in
any browser.

[Install the Player](https://screenrig.ai/docs/players?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Documentation](https://screenrig.ai/docs?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Pricing](https://screenrig.ai/pricing?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs)

## How it works

This plugin holds the screenRIG skill and the screenRIG connector, a remote MCP
server at `https://api.screenrig.ai/mcp`. Add the plugin, connect the connector
from its Connectors tab, sign in or create a free account, and choose the
project and access level Claude gets. The plugin contains no program and runs
nothing on your computer.

## Want the CLI too?

The screenRIG CLI works with files and programs on your computer: it converts
and uploads photos and video in bulk, syncs a Google Drive, Dropbox or
Microsoft 365 folder, builds custom applications such as a check-in kiosk, sets
up webhooks, sells and buys advertising, and migrates screens from another
signage system. It ships in the full screenRIG
plugin, which you can install yourself from
[github.com/screenrig/plugin](https://github.com/screenrig/plugin); see
[Set up your agent](https://screenrig.ai/docs/start?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) and the
[CLI reference](https://screenrig.ai/docs/cli?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs). Both work on the same account.

## Data

Claude sends what you ask it to create or change (screen names, playlists,
card content, schedules) to your screenRIG account through
`api.screenrig.ai`, and reads your screens, media and reports from it. The
plugin stores nothing itself. [Privacy](https://screenrig.ai/privacy?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Terms](https://screenrig.ai/terms?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) · [Support](https://screenrig.ai/contact?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs)
