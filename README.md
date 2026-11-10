# screenRIG

Free, agent-driven digital signage. Your AI agent does the work: it pulls in
your docs, sheets and calendar, builds every screen and keeps it current, on
the screens you already have.

A menu board for tonight. A welcome for the lobby. A check-in kiosk that runs
itself. This plugin gives your agent the official screenRIG skill and the
bundled CLI it runs.

## Install

In Claude Code:

```text
/plugin install screenrig --marketplace screenrig/plugin
```

Or from a terminal:

```console
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user && claude plugin install screenrig@screenrig --scope user
```

In ChatGPT Codex:

```console
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json && codex plugin add screenrig@screenrig --json
```

With the [skills](https://skills.sh/screenrig/plugin) CLI:

```console
npx skills add screenrig/plugin --skill screenrig -g
```

On first use the skill installs the plugin and its bundled CLI.

Setup guides: [Claude](https://screenrig.ai/docs/start?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs),
[Codex](https://screenrig.ai/docs/start?utm_source=codex&utm_medium=package&utm_campaign=tof-libs),
[Grok](https://screenrig.ai/docs/start?utm_source=grok&utm_medium=package&utm_campaign=tof-libs),
[skills.sh](https://screenrig.ai/docs/start?utm_source=skills-sh&utm_medium=package&utm_campaign=tof-libs).

Any other agent:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
Install it in this agent before running any screenRIG command; use only its registered bundled commands.
If runtime approval blocks you, ask me immediately for approval of that action and reason, then wait without using more tools.
```

Then install a Player on your screen and ask your agent to set up your first
screen. Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x) is
required.

[Set up your agent](https://screenrig.ai/docs/start?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Install the Player](https://screenrig.ai/docs/players?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs)

## You ask. Your agent does the rest.

```text
You: Put our café menu on the counter TV: breakfast until 11, lunch until 4,
     dinner after that. The salmon is sold out.
Agent: Done. The counter TV switches menus on its own clock, and the salmon is
       marked sold out. Here is a screenshot from the screen.
```

```text
You: Show this week's sales sheet on the office TV and keep it current.
Agent: The office TV shows your sales as a ranked table. When a row changes in
       the sheet, the screen updates without republishing.
```

- **Free, with unlimited screens.** Paid plans add business tools, more people,
  people to talk to, governance and contract terms. Downloads are free, and each
  screen replays what it downloads from its own storage.
- **Runs on cheap sticks and the TVs you already have.** Players for Android
  and Google TV, the Amazon Signage Stick and Fire TV Sticks, Apple TV, macOS,
  Windows, Linux, Raspberry Pi, Samsung Smart Signage, LG webOS Signage and
  BrightSign, or the Player web app in any browser.
- **Up to 4K** on Android, Amazon and Raspberry Pi 5 Players, with smooth video.
- **200+ ready-made apps.** Menus, queues, weather, schedules and KPI boards,
  live on every Player in nine themes. When a screen has a real job
  (check-in, orders, a factory line), your agent builds a custom application.
- **Connected to your work.** Email, calendar, docs, sheets and photos become
  what the screen shows, and routines keep every screen current as your data
  changes.

Publishing reports whether each screen is actually playing the new content,
and your agent can take a screenshot from any screen to show you.

[See it working](https://screenrig.ai/digital-signage/menu-boards?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[200+ apps](https://screenrig.ai/apps?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Use cases](https://screenrig.ai/use-cases?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Pricing](https://screenrig.ai/upgrades?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs)

## Players

Install a Player from [Downloads](https://screenrig.ai/downloads?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs), launch it,
and give your agent the pairing code it shows. The Player web app runs at
[play.screenrig.ai](https://play.screenrig.ai) in any browser.

## Sell the airtime on your screens

Pick the screens and the breaks, set your price for 15 seconds of finished
playback, and invite advertisers by email. They buy from your inventory in the
dashboard Marketplace, accept a quote before a campaign runs and pay only for
plays the Player reports as completed.

## Interactive views

The plugin includes a remote screenRIG connection for compatible Claude and
Codex plugin hosts. When a view needs authorization, sign in to screenRIG and
approve the project you use with the CLI. Fresh screenshot capture needs
Propose or Manage access; the Manage access the plugin requests also allows
writes within the approved capabilities. Read-only connections display saved
previews. The host stores the connection; you never copy a token or enter the
server URL. The CLI handles enrollment, media preparation, pairing and
changes. Interactive cards appear in hosts that support interactive views;
other hosts return text results.

## What the plugin runs, sends and stores

- **Runs:** the bundled screenRIG CLI on Node.js, through the skill's helper
  script; ffmpeg and ffprobe on your machine to prepare video and images; a
  local Chromium or Chrome, offline, for card previews. It downloads and
  installs no code.
- **Sends to screenRIG** (api.screenrig.ai, the service behind the connector):
  the commands you ask for, the media you upload (straight to screenRIG's
  storage through signed upload links), playlists, screen details, and the
  contact email and organization name you give when you enroll.
- **Sends elsewhere, only when you ask:**
  - `screenrig migrate` reads your account at the signage system you name
    (Screenly, Yodeck, Xibo, OptiSigns, ScreenCloud or an Anthias device) with
    the key in your `--credentials` file. The key goes only to that system.
  - The helper checks for plugin updates by reading this repository's public
    marketplace file on GitHub (raw.githubusercontent.com).
  - `screenrig status` reads screenRIG's public status monitor
    (monitor.screenrig.ai), and the CLI reads public files on screenrig.ai.
  - Integrations you set up (Slack, Microsoft Teams, Dropbox, Google Drive,
    Power BI, Tableau, webhooks) are connected by the screenRIG service, not
    from your machine.
- **Stores on your machine:** the sign-in and settings in a user-only config
  file (`~/.config/screenrig/config.json`), and the exports and downloads you
  request.
- **Personal data:** your account name and email, your organization members'
  emails, and the screen locations you enter. screenRIG keeps them while the
  account or project exists, as the privacy policy describes.

## Privacy, terms and support

[Privacy policy](https://screenrig.ai/privacy?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Terms](https://screenrig.ai/terms?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Support](https://screenrig.ai/contact?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs) ·
[Documentation](https://screenrig.ai/docs?utm_source=claude-directory&utm_medium=package&utm_campaign=tof-libs)

## Contributing

This repository contains the canonical skill and the generated plugin
distribution. See [AGENTS.md](https://github.com/screenrig/plugin/blob/main/AGENTS.md)
for source layout, regeneration and checks. Report vulnerabilities using the
[security policy](SECURITY.md). The [Apache-2.0 license](LICENSE) covers this
plugin and bundled CLI, not the hosted service.
