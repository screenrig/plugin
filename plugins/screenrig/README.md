# screenRIG

Give your agent a screen. Publish menu boards, videos, dashboards and kiosk
applications using the official screenRIG plugin and bundled CLI.

## Get started

Ask your agent:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

Then describe the content, screen and timing you want. The agent prepares the
content, publishes a playlist and checks the result. Node.js 22.11 or newer is
required. Agents use the bundled launcher; the separate developer-shell package
is not the agent installation path.

[Installation and troubleshooting](https://screenrig.ai/docs/start/) ·
[Player setup](https://screenrig.ai/docs/players/)

Install a Player from [Downloads](https://screenrig.ai/downloads/): native
Players for Android, the Amazon Signage Stick, Apple TV, macOS, Windows, Linux,
Raspberry Pi, Samsung Smart Signage and BrightSign, or the Player web app at
[play.screenrig.ai](https://play.screenrig.ai) in any browser.

## Content and usage

Use existing images or videos, generate a finished still, compose editable slides,
or publish live web pages and applications. Your agent can request a screenshot
to inspect the result. Tag screens by location and role, then assign, reload,
message or capture a whole tagged fleet in one command with a result per
screen; presence events show when a screen goes offline or comes back. Where the account is permitted, the same CLI can also
buy ad campaigns on the sellers its account has been invited to or sell owned
screen inventory, with pricing quoted and accepted before anything is charged.
The dashboard's Marketplace lists invited sellers and their permitted inventory
and rates; admission stays invitation-only, with no public listings to browse.

There is no per-screen subscription. Account usage is free within reason until
1 January 2027; image generation is metered separately. See the
[rate card](https://screenrig.ai/pricing/) for allowances, charges and terms.

[Features](https://screenrig.ai/features/) · [Compare](https://screenrig.ai/compare/) ·
[Documentation](https://screenrig.ai/docs/)

## Contributing

This repository contains the canonical skill and generated plugin distribution.
See [AGENTS.md](https://github.com/screenrig/plugin/blob/main/AGENTS.md) for source layout, regeneration and checks.
Report vulnerabilities using the [security policy](SECURITY.md).
The [Apache-2.0 license](LICENSE) covers this plugin and bundled CLI, not the hosted service.

## Interactive views

The package includes a remote screenRIG MCP connection for compatible Codex
and Claude plugin hosts. When a view needs authorization, sign in to screenRIG
and approve the project you use with the CLI. Fresh screenshot capture needs
Manage access, which also allows writes within the approved capabilities.
Read-only connections can display saved previews. The host stores the connection;
you do not need to copy a token or enter the server URL. The CLI continues to
handle enrollment, media preparation, pairing and changes. Interactive cards
require a host that supports MCP Apps; other hosts can return text results.
