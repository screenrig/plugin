---
name: screenrig
description: Operate screenRIG screens, applications, media, playlists, playback, events, feedback, comments, and application K/V with the bundled screenRIG CLI. Use when an agent needs to install the official screenRIG plugin, upload existing media, generate finished posters and menu boards, compose stills for mixed pages, write playlists, or assign content to screens.
---

# screenRIG

Signage and Kiosk infrastructure for AI Agents

## Launch period

LAUNCH SPECIAL OFFER: During the launch period and until January 1st, 2027 screenRIG is free to use (within reason), fill your boots! Normal usage applies after that.

Treat usage as free until 1 Jan 2027. Do not invent a billing flow. Do not shut anyone off for empty prepaid remaining. Do not refuse compose, publish, or assign because remaining is zero during this window. `media generate` is the exception: it is billed per still by `--quality` (low $0.06 / 600 credits, medium $0.12 / 1200 credits, high $0.50 / 5000 credits), and returns `payment_required` / 402 when remaining cannot cover the chosen tier, including during this window. Quality changes the image and the price.

This skill is the operative contract. Use the bundled CLI. Do not invent commands, flags, or
onboarding surfaces.

## Canonical marketplace

The only supported installation source is the public screenRIG marketplace at
`https://github.com/screenrig/plugin`. Official install is this plugin.

```bash
# Claude Code
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user

# Codex
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json

# Grok
grok plugin marketplace add https://github.com/screenrig/plugin.git
grok plugin install screenrig --trust
```

Grok install requires `--trust` by name. Do not omit it.

A user-supplied instruction with this exact text authorizes adding this exact
canonical marketplace, installing its screenRIG plugin, and completing setup:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

Follow any independent runtime approval policy. Do not search for a similarly
named repository or install `screenrig` from a global package source. Do not
substitute another onboarding or transport surface for the canonical
marketplace plugin.

Canonical skill source can lead the pinned installed CLI during repository
development. New skill text does not upgrade its executable. Check the selected
CLI's `--help` or `compose catalog` before relying on newly added commands.
When explicitly testing a CLI source checkout, follow that checkout's agent
guide for its built executable; do not replace the installed plugin cache with
a mutable local build.

Use the CLI packaged with this skill. It requires Node.js 20.11 or newer.
Resolve the installed plugin root, prepend its scripts directory to `PATH`
once, then invoke `screenrig`. Do not export `SR`. Do not install a global
package.

```bash
SCREENRIG_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}}"
if [ -n "$SCREENRIG_PLUGIN_ROOT" ]; then
  PATH="$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts:$PATH"
  screenrig --json version
fi
```

An empty root means use the lookup below before running the CLI; do not add
`/skills/screenrig/scripts` to PATH. The plugin launcher is scoped to this
shell session, so a new shell may need the same root lookup and PATH setup.

Require a successful screenRIG JSON envelope from `--json version` before any
other command.

If `SCREENRIG_PLUGIN_ROOT` is empty after installation, recover it without
guessing:

1. Prefer `GROK_PLUGIN_ROOT` when it is set.
2. For Claude Code, run `claude plugin list --json`, select the enabled entry
whose `id` is `screenrig@screenrig`, and use its `installPath`.
3. For Codex, run `codex plugin list --json`, select the enabled installed
entry whose `pluginId` is `screenrig@screenrig`, and use its `source.path`.
4. For Grok, run `grok plugin list` and use the installed screenRIG plugin
path, then export it as `GROK_PLUGIN_ROOT` for this session.
5. Prepend `<plugin-root>/skills/screenrig/scripts` to `PATH` and run
`screenrig --json version`. Require a successful screenRIG JSON envelope
before the requested command. Do not export `SR`.

If there is no matching entry, run the exact canonical marketplace add/install
commands above and repeat this lookup. If installation or lookup still fails,
report the failing runtime command and the canonical repository URL to the
user. Do not substitute a globally installed command or download an
executable.

Use `--json` for agent work. Branch on `ok`, `error.status`, and `error.code`;
do not parse prose.

## After install

Work in this order. Do not skip `version` or `doctor`.

```bash
screenrig --json version
screenrig --json doctor
screenrig --json agent enroll --email ADDRESS --name "Office MacBook Codex"
screenrig --json screen pair ABC234
# then put content on a playlist page using the authoring tree below
screenrig --json playlist create ./playlist.json
screenrig --json screen list
screenrig --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
```

1. Prepend the plugin scripts directory to `PATH` and require `screenrig --json version`.
2. Run `doctor`. Read `data.status` and `data.checks`. On a fresh install the
   `token` row is `warn`, not `fail`, and `data.next.command` is
   `screenrig agent enroll --email ADDRESS`: that is the expected first-run
   result, not a broken install. Name missing toolchain parts before the
   first `media upload`.
3. Enrol once (`agent enroll`) and pair each native player (`screen pair`) as
   described under "First run: enrol and pair".
4. Put content on a playlist page using the authoring tree below: the
   customer's own image or video when they have one, `media generate` when an
   informational screen (poster, menu board, announcement, opening hours,
   wayfinding) needs making, and local compose only for its named exceptions.
5. Write a playlist that places `med_…` ids (and iframe/application primitives
   when the page needs them).
6. Assign that playlist to a screen with `screen assign` and the current
   `--if-match` revision.

Text never travels on the playlist wire. It is either drawn into a generated
still by the image model or painted locally by compose; either way the result
is a raster placed as `image`. Do not emit native `text`, `box`, or `line` on
the playlist wire.

## First run: enrol and pair

Every account command needs a credential. Until one exists, authenticated
commands fail with `error.code` `not_enrolled` (exit 3) and an
`error.next.command` you can run directly. Enrolment is an explicit step; no
other command enrols as a side effect.

### Enrol

```bash
screenrig --json agent enroll --email owner@example.com --name "Office MacBook Codex"
screenrig --json agent status
```

- `--email ADDRESS` is required for a new enrolment. The address is unverified
  contact metadata for the account, not authentication or recovery authority.
  The CLI keeps it only in private retry state and never prints it.
- `--name NAME` labels this installation in the dashboard Agents view.
  `--open-dashboard` opens the account dashboard after enrolment succeeds.
- If the server asks for a beta key, pass the global `--beta-key KEY` flag (or
  set `SCREENRIG_BETA_KEY`). It is sent as `beta_key` and omitted when unset.
- Enrolment is idempotent: running `agent enroll` again with the same email on
  an installation that already holds an active agent succeeds and returns that
  agent. It does not create a second account. A 409 `email_conflict` is
  terminal for that address; report it and use `agent connect` to join the
  existing account instead. Never retry it automatically.
- The result is `data.status` `active` with `data.agent`. No token appears in
  any envelope; the credential is written to the user-private config file.
- `agent status` never enrols. `data.status` is one of `not_enrolled`,
  `connecting` (a connection is waiting for approval; `phase` and
  `expires_at` say where it stands), `active`, or `disconnected`.
  `connection_ready` is true only when the account holds a persisted
  dashboard passkey that can approve another agent; `false` right after a
  fresh enrolment is normal.

### Add another installation to the same account

```bash
screenrig --json agent connect --name "Studio Automation" --print-url --timeout 300000
```

`agent connect` needs a human. The CLI opens (or with `--print-url` writes to
stderr) a dashboard approval URL, then blocks waiting for a signed-in
dashboard user to approve with a fresh passkey. Tell the user to open that
URL and approve; you cannot complete it yourself. When `--timeout MS` expires
before approval, the command returns 408 `timeout` with the detail "Retry
agent connect to resume the same request": the pending connection is kept, and
running `agent connect` again resumes it. `agent status` shows `connecting`
meanwhile. A cancelled or expired connection clears the local pending state;
start again. Do not copy `config.json` between machines; each installation
gets its own revocable credential through this flow.

### Disconnect

```bash
screenrig --json agent disconnect --yes
```

Revokes only the calling agent on the server first, then removes the local
credential. Screens, content, and other agents are untouched. Disconnecting
the last active agent is refused with `agent_lockout_risk`; `--allow-lockout`
overrides it only when the user has confirmed a registered dashboard passkey
or accepts losing the account. Without a stored credential the command is a
`usage_error` and changes nothing.

### Pair a native player

```bash
screenrig --json screen pair ABC234 --label "Lobby"
```

A native player (Qt, Android, Apple, Windows) shows a pairing code on the
glass as six characters with a dash, `ABC-234`. Type it into `screen pair`
without the dash: the command accepts exactly six characters. Reading the
code off the glass always works; some players also put the undashed code in
their own operation log as `params.pairing_code` on the `pairing.start` row,
so an agent watching that log can pair without a person at the screen. See
"Read a player's operation log" below for where each player writes it and
what to do when the row does not carry the code. Do not confuse the pairing
code with the public locator on the homepage handoff, which is a different
clock: a native pairing code stays
claimable for 72 hours unclaimed, and a successful claim opens a fresh 72-hour
collection window for the player; the public locator lasts 30 minutes. The
server owns those clocks; the CLI does not time the code locally.

Success returns the new `data.screen` (`id` `scr_…`, `state`
`pairing_pending`) and the player comes online within seconds; `screen show`
reports `online: true` once it has. `--label` names the screen at pairing
time; `screen update --name` renames later. The revision moves on its own
when the player first reports its surface, so refetch before `--if-match`.
A code the server cannot find is 404 `not_found` with "Pairing session was
not found or is no longer claimable": re-read the six characters on the
glass, or wait for the player to show a fresh code.

### Read a player's operation log

A player's operation log is a separate stream from the CLI's. Each process
writes to its own sink; there is no combined feed and no API that returns a
player's log. Follow the sink belonging to the player you are pairing or
debugging. Every line is one v1 NDJSON object with `tag`, optional resource
`id`, optional scalar `params`, and `correlation_id` pairing a start with its
finish.

| Player | Where it writes | How to read it |
|---|---|---|
| Linux/Wayland native player | Unix socket, `SCREENRIG_PLAYER_LOG_SOCKET` when set, else `$XDG_RUNTIME_DIR/screenrig-player-log.sock`, else `/tmp/screenrig-player-log.sock` | Listen on that path, then start the player |
| Apple native player | Unix socket, `SCREENRIG_PLAYER_LOG_SOCKET` when set, else `screenrig-player-log.sock` in the player's Application Support directory | Listen on that path, then start the player |
| Android player | Android system log, tag `ScreenRigOp` at info | `adb logcat -s ScreenRigOp:I` on the confirmed device serial |
| Windows player | `Trace` / `Debug` output | A debug output viewer attached to the running player |
| Browser player | One NDJSON object per `console.debug` line | The browser devtools console |

The two socket players connect as **clients** and never create the socket
themselves. A consumer must already be listening on that path when the player
starts, or the lines are dropped silently; a missing listener never breaks
playback. Start a listener first, then start or restart the player:

```bash
socat -u UNIX-LISTEN:"$XDG_RUNTIME_DIR/screenrig-player-log.sock",fork -
```

To pair from the log, watch for the `pairing.start` row and read
`params.pairing_code`. Not every player publishes it: some deliberately keep
the code out of their log, and on those the row arrives with no
`pairing_code` at all. When the row is absent or carries no code after the
player has shown a code on screen, stop waiting and ask the person at the
screen to read the six characters. Do not screenshot the player to hunt for
the code, and never copy any other field out of a log line: pairing material
beyond that one code, session credentials, `Authorization` headers, signed
URLs, and object keys are not yours to print, store, or relay.

### Open the dashboard

```bash
screenrig --json dashboard
screenrig --json dashboard --print-url
```

`dashboard` mints one link and opens it. The link is single use and stops
being claimable ten minutes after it is minted; a fresh one is one more
`dashboard` call away, so let one expire rather than keeping it. The
credential rides the URL fragment, so the whole URL is a secret: the CLI
prints it only when the opener cannot start a browser or you passed
`--print-url` because the browser is on another machine. Hand that line to
the user the way you would a password; never write it to a file or a log.

## Playlist authoring

How to put content on a playlist page. The order of preference is fixed: use
the customer's own media when they have it; generate the artefact when they
need one made; compose only for the exceptions named in step 3. Do not wire
an external image API as the default.

1. **You already have the image or video.** Easiest path: `media upload`
   (declare → PUT exact bytes → commit) and reference `med_…` on the
   playlist. Do it yourself. No compositor. No generate.

```bash
screenrig --json media upload ./lobby.jpg --tag LobbyPhoto
screenrig --json media list --tag LobbyPhoto --primitive image
```

2. **You need an informational screen made**: a poster, a menu board, an
   announcement, opening hours, a wayfinding notice, a promotion. Reach for
   `media generate` first. It draws the entire finished artefact, all of the
   text included, in an art style chosen for the business, and returns a
   ready `med_…` to place as one `image`. Nothing is layered on top of it.
   Read "Generate the artefact" below before writing the prompt. Generating
   with a model you already prefer and then `media upload` is also valid.

```bash
screenrig --json media generate --prompt "…" --aspect-ratio 16:9 --quality medium --tag SpringMenu
```

3. **The page genuinely needs local composition.** Compose (`compose
   render`) is local, unbilled, and right for exactly these cases: several
   live primitives on one page (a `video` or `iframe`/`webapp` hole with
   copy beside it); dense data that must be exact and cannot be proofread
   item by item on a generated still (a long timetable or stock list copied
   from the customer's source); and iterating a layout without spending
   credits. Compose writes region stills and holes; upload the stills and
   place them as `image`. Wanting animation is not a reason to compose: a
   generated still takes `enter`, `motion`, and page transitions exactly
   like any other image.

```bash
screenrig --json compose catalog
screenrig --json compose render ./exec-intro.json --output ./exec-intro
screenrig --json media upload ./exec-intro/left.png --tag ExecIntro
```

`--output` is a directory, not a `.png` / `.webp` / `.jpg` file. `card` is a
plate (`fit` `region` or `ink`). `cards` (plural) is an array of items. Region
`video`, `iframe`, and `webapp` are holes, not painted PNGs.

If you find yourself composing text over a generated image, stop: that is
the inverted workflow. Put the copy in the prompt and regenerate so the
model draws the words as part of the artwork.

## Generate the artefact

`media generate` is the default tool for any informational screen. It sends
one prompt to the backend image model and stores the finished still in the
account media store: the whole poster or menu board, headline, body copy,
items, prices, and decoration drawn together in one art style. The result
should look like a real poster hanging in the store or a real menu board on
a restaurant television, quick service or sit down, not a slide. Nothing is
layered on top of it. If you are adding text over a generated image, you
have used the wrong tool; put the words in the prompt.

Each call is billed, so make the prompt complete the first time.

### Write the prompt

Vague prompts give generic results. State the copy; do not leave it to the
model.

**Describe the artwork, never the screen it will play on.** The model draws
what you name. Ask for a menu "on a television above the till" and it draws a
television, bezel and all, and you have put a picture of a screen on a screen.
Never mention a television, monitor, display, screen, kiosk, wall, or where
the sign hangs. Say what the piece is — "landscape 16:9 menu board artwork",
"portrait 9:16 event poster artwork" — and close every prompt by ruling the
device out: no television, screen, frame, bezel, border, or mounting, artwork
filling the image edge to edge. Check the result for a border or a rounded
corner before you place it; that is the model drawing furniture you did not
want.

A strong prompt names, in this order:

- **The business and the venue type.** "A menu board for Bella Trattoria, a
  sit-down Italian restaurant"; "a window poster for Northgate Books, an
  independent bookshop". The model takes its conventions from the genre.
- **The art style**, chosen to suit that business and varied across
  businesses so four artefacts for four venues do not look like one
  template: letterpress, chalkboard, mid-century travel poster, Swiss grid,
  hand-painted shop sign, neon diner, risograph, editorial photography,
  botanical illustration, brutalist type.
- **The palette**, as named colours or hex values.
- **The exact copy**: the headline, every section name, every item with its
  description and price, the dates and times, the address or call to
  action. Spell prices and times the way they must appear (`€14`,
  `7:30 pm`). Say "no other text" so the model does not invent filler.
- **The typography feel**: "condensed sans headline, humanist serif body";
  "tall Didone display type"; "hand-lettered script for the title only".
- **The aspect ratio in words** as well as the `--aspect-ratio` flag, naming
  the artwork and never the device: "landscape 16:9 menu board artwork";
  "portrait 9:16 poster artwork". Never write "television", "screen", or
  "display" here; that is the phrasing that makes the model draw one.
- **What to exclude**: "no photographs", "no people", "no logos", "no
  watermark", "no placeholder text", and the device exclusion above: no
  television, screen, frame, bezel, border, or mounting, artwork filling the
  image edge to edge.

Write for a viewer at distance: few words, large type, one clear hierarchy.
A menu board carrying twelve dishes with descriptions and prices is the dense
end of what works well; forty rows of tabular data is not a poster and
belongs in compose or a web application.

### Two worked prompts

Quick-service menu board, `16:9`, `high` because the text is dense:

```bash
screenrig --json media generate --aspect-ratio 16:9 --quality high --tag BurgerBoard --prompt "Landscape 16:9 menu board artwork for Hank's Burger Counter, a quick-service burger stand. Full bleed, artwork only. Style: bold retro American diner signage, flat vector shapes, thick outlines, slight halftone texture. Palette: mustard yellow #E8B324 background, ketchup red #C8281E accents, cream #FFF6E0 type, charcoal #1E1E1E outlines. Layout: restaurant name as a large arched headline top centre, then three columns. Column one, BURGERS: Classic Smash, double patty, American cheese, pickles, \$9; Bacon Deluxe, smoked bacon, cheddar, onion jam, \$11; Garden Stack, grilled halloumi, roasted pepper, herb mayo, \$10. Column two, SIDES: Skin-on Fries \$4; Onion Rings \$5; Slaw \$3. Column three, DRINKS: Vanilla Shake \$6; Root Beer Float \$5; Lemonade \$3. Footer line: Order at the counter, we call your number. Typography: condensed heavy sans for headings, clean rounded sans for items, prices right-aligned and bold. No photographs, no people, no logos, no other text. Do not draw a television, screen, frame, bezel, border, or mounting: the artwork fills the whole image, edge to edge."
```

Store event poster, `9:16`, `medium`:

```bash
screenrig --json media generate --aspect-ratio 9:16 --quality medium --tag AuthorNight --prompt "Portrait 9:16 event poster artwork for Northgate Books, an independent bookshop. Full bleed, artwork only. Style: two-colour risograph print, grainy ink, slightly off-register overlap, generous margins, mid-century book-jacket feel. Palette: paper white #F4EFE6, teal ink #1B6F79, coral ink #E4633C. Copy, exactly this and nothing else: headline 'Author Night'; subhead 'Maya Okafor reads from The Tide Clock'; date line 'Thursday 24 September, 7 pm'; line 'Free entry, signed copies available'; footer 'Northgate Books, 12 Market Row'. Illustration: one stylised open book with waves rising from its pages, placed behind the headline. Typography: tall geometric display type for the headline, small caps for the date, humanist serif for the rest. No photographs, no people, no logos, no other text. Do not draw a television, screen, frame, bezel, border, or mounting: the artwork fills the whole image, edge to edge."
```

The same brief in a different venue asks for a different style: the same
author night at a university library reads better as a Swiss grid in black,
white, and one signal colour; at a children's bookshop as a bright
hand-painted sign. Change the style with the business, not just the colours.
A sit-down trattoria menu wants cream stock, serif headings, thin gold rules,
and olive motifs; a burger counter wants the diner board above. Different
businesses, different pictures.

### Quality and cost

| quality | credits | usd | when |
|---|---|---|---|
| `low` | 600 | $0.06 | backgrounds and unimportant images |
| `medium` | 1200 | $0.12 | the default for most work |
| `high` | 5000 | $0.50 | artefacts carrying a lot of text, such as a restaurant menu |

Medium is the default for most work. High is for artefacts carrying a lot of
text, such as a restaurant menu, where every item must come out legible. Low
is for backgrounds and unimportant images. Quality changes the image and the
price. `--quality` defaults to `medium`. A 402 / `payment_required` means
stop; do not retry generate, and point money at
https://screenrig.ai/pricing/.

### Budget for the blocking call

`media generate` is one blocking call and it is slow on purpose: the image is
drawn while the request is open. The command blocks until the server returns
`201` MediaGeneration; there is no 202 poll and no client PUT. Expect about
15 s at `low`, 35 s at `medium`, and 80 s at `high`. Do not treat a slow call
as a hang, and allow at least three minutes in any wrapper that imposes a
timeout of its own.

Do not pass `--timeout` on generate. The CLI budgets 150 s for this call by
default, above the server's own budget, so plain `screenrig --json media
generate …` completes at `high`. Under `--json` the command writes one
`media_generate_started` line to stderr before it blocks, carrying `quality`,
`typical_seconds`, and `timeout_ms` and never the prompt; `--no-progress`
suppresses it. The success envelope reports `elapsed_ms` beside `media_id`.

If generate times out or the connection drops, do not assume nothing
happened: the still may have been created and billed. Re-run the *identical*
command. The CLI persists the idempotency key before the request goes out and
replays the request under it, so a still that was created comes back instead
of a second one being billed; changing the prompt, aspect ratio, quality, or
tag starts a fresh key, and a server answer clears the stored one. Or run the
`media list` command named in `error.next.command` on the timeout problem to
see what the account actually holds. `--idempotency-key KEY` still pins the
key explicitly when you want to name it.

### Read the result

`--prompt` is required (1 to 4000 characters). `--aspect-ratio` defaults to
`16:9` (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`). Optional `--tag`
is the same 1–32 letter-or-digit tag as upload. Success is `201` with
`{ media, usage }`: `data.media.id` / `data.media_id` is `med_…`, and
`usage` shows credits and usd for the chosen tier. Never print pixels or the
prompt.

What generate stores: a lossy WebP (quality 90) at the exact aspect size with
a 1080 px short edge, so `16:9` is 1920×1080, `9:16` 1080×1920, `1:1`
1080×1080, `4:3` 1440×1080, `3:4` 1080×1440, `3:2` 1620×1080, and `2:3`
1080×1620. The vendor canvas is centre-cropped and resampled to that size.
The filename is distinctive per generation, `generated-16x9-1a2b3c4d.webp`,
with the suffix taken from the media id; a generated still has no
`source_filename`. Read `data.media.width` / `height` from the envelope.

Place the returned `med_…` on the playlist as one full-canvas `image`
primitive with `content_fit` `contain`; the still already is the page. Then
proof it: `media download <id> --output FILE` writes the stored rendition to
disk (verified against the row's `bytes` and `sha256`) so you can read it
with vision before it goes on glass, and `screen screenshot` shows it in
place afterwards. Check every item, price, and date against the copy you
sent. A misspelling or a missing dish is fixed by sharpening the prompt and
regenerating, not by composing a correction over the top. Never print the
downloaded bytes.

```bash
screenrig --json media download med_EXAMPLE --output ./burger-board.webp
```

`--output` is a file path, not a directory; the default is `./<id>.<ext>` in
the current directory with the extension from the content type. An existing
file is overwritten. The envelope is `media_id`, `path`, `bytes`, `sha256`,
`content_type`, `primitive`, `filename`, optional `source_filename`, and
`width` / `height`. It never carries pixels.

Downloading also lets a generated still serve as a region `image` inside a
`compose render` spec for the exception cases in step 3, for example a
`low`-quality generated background behind a live video hole. That is compose
using a generated picture, not text layered over a generated poster.

## Output, configuration, and credential state

Use `--json` envelopes. Branch on `ok`, `error.status`, `error.code`, and
`warnings[].code`. Do not parse prose.

Never pass a bearer, token flag, or pasted secret on the command line. The
credential is a user-private file outside the
replaceable plugin directory. `SCREENRIG_CONFIG` overrides the path. Otherwise
the CLI uses `config.local-dev.json` in the config directory when that file
exists, else `config.json`. The directory is `$XDG_CONFIG_HOME/screenrig`
when `XDG_CONFIG_HOME` is set, `%APPDATA%\screenrig` on Windows, or
`~/.config/screenrig` otherwise, so the ordinary fallback is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json`. The directory and file are restricted to
the current user. This state survives plugin upgrade or uninstall.

Never print, log, echo, or summarize credentials, Authorization headers,
signed upload headers, cookies, object keys, or protected asset URLs.
Preserve request and operation IDs in reports. Reuse an idempotency key after
an ambiguous mutation retry and use `--if-match` only with the current
resource revision.

## Meter and Standard prepaid

Until 1 Jan 2027, the launch-period rules above override empty remaining and
HTTP 402 / `payment_required` as a reason to refuse compose, publish, or
assign. `media generate` still 402s when underfunded in that window. After
that date, the meter rules below apply.

Usage is metered in credits. One credit is $0.0001. Remaining is a whole
integer. Read it from `data.credit_remaining` on `account show`.

Standard is prepaid. People add Standard prepaid bundles on
https://screenrig.ai/pricing/ before screens run on a paid meter. Point money
there. Do not invent a pay command in this CLI.

A 1-credit control-plane tax applies to each billed authenticated command and
each billed account-listen-stream event. Compose catalog/render, `doctor`,
and `version` do not debit that tax. `media generate` is billed per still by
`--quality`: low $0.06 (600 credits), medium $0.12 (1200 credits), high
$0.50 (5000 credits). Quality changes the image and the price.

- `warnings[].code === "credits_low"`: remaining is below 1000 credits. Surface
  remaining. Do not retry the same billed command as a fix. Send the user to
  https://screenrig.ai/pricing/.
- `error.code === "payment_required"` or `error.status === 402`: remaining is
  below 1 credit. Stop. Do not retry billed commands. Point money at
  https://screenrig.ai/pricing/.

Bandwidth is $0.09/GB. Storage is $0.14/GB-month. Same rates on every tier.

## Doctor

```bash
screenrig --json doctor
```

Read `data.status` and `data.checks`. Each check is `pass`, `warn`, or `fail`.
Only `fail` changes the exit code. `data.status` is the worst row. A success
envelope with `data.status` `warn` is a usable host, not a broken install.

Run `doctor` before enrolling. On a fresh install the `token` row is `warn`
with detail `(none); this installation is not enrolled`, the row carries
`next.command` `screenrig agent enroll --email ADDRESS`, and the same `next`
is repeated at `data.next`. A disconnected installation or one with a pending
approval warns the same way with `screenrig agent connect`. `fail` is
reserved for damage: a config file other users can read
(`config_permissions`), a Node below 20, a missing `ffmpeg`/`ffprobe` or
`libx264`, or a control plane that does not answer. Read the `ready` row's
detail too: a `warn` there names each degraded server dependency and prints
the server's own sentence for it verbatim (for example that application
upload is unavailable and `POST /api/v1/applications` answers 503
`dependency_unavailable` until the workers run). Relay that sentence to the
user instead of attempting the `app upload` and reporting the 503.

A build that reports `ffmpeg` and `ffprobe` converts media before upload.

On a build that converts:

- `media upload <file>` encodes video to an H.264 (High profile) MP4 by
  default and images to lossy WebP, then uploads the converted bytes.
  Stills are quality 90, keep alpha (`yuva` / `-alpha_q 100`), bound each
  edge to 3840 px, never upscale, and never write lossless VP8L. An oversize
  source (for example 9000×9000) is accepted and scaled down to 3840 on its
  longest edges, not rejected; the envelope then carries an `image_resized`
  warning naming the source and delivered sizes, and `data.transcode` carries
  `source_width` / `source_height` beside `width` / `height`. Tell the user
  when their still was resized.
- `--content-type TYPE` is checked against the file's bytes before anything
  runs. A declared type the container contradicts (`photo.png --content-type
  video/mp4`) fails locally with `usage_error` naming both types; nothing is
  transcoded or uploaded. Omit `--content-type` when the extension is right.
- Optional `--tag TAG` stores a 1 to 32 letter-or-digit tag on the ready
  object. Hyphens are rejected; `ExecIntro2026` is valid and `exec-intro`
  is not. `media list --tag TAG [--primitive image|video]` filters by that tag
  and is the reliable filename → id map after upload.
  `media update <id> (--tag TAG | --clear-tag) --if-match REVISION` changes
  or clears it. Untagged objects are omitted when `--tag` is present on
  `media list`.
- The conversion runs `ffmpeg` and `ffprobe`. They must be on `PATH`, or their
  absolute paths must be in `SCREENRIG_FFMPEG` and `SCREENRIG_FFPROBE`.
- Image encode prefers ffmpeg `libwebp` / `libwebp_anim`. If those encoders
  are missing, the CLI falls back to `cwebp` on `PATH`, or `SCREENRIG_CWEBP`.
  Do not convert the still yourself.
- `doctor` reports the `ffmpeg`, `ffprobe`, `encoder_libx264`,
  `encoder_libx265`, `encoder_libwebp`, `cwebp`, and `filter_hdr_tonemap`
  checks. Use it to name the missing part before you ask the user for anything.
  The default video path needs `libx264` (`fail` when that encoder is missing).
  Image transcode works when `encoder_libwebp` or `cwebp` is `pass`. The other
  of those two is `warn` when it is absent, because stills still convert.
  `cwebp` is `warn` when ffmpeg has `libwebp`. Both are `fail` only when the
  host has neither. `encoder_libwebp` reports the ffmpeg encoder only.
  `encoder_libx265` and `filter_hdr_tonemap` are `warn` when missing.

A missing or unusable toolchain fails `media upload` alone. It returns a usage
error, not a plugin installation failure. Playlist, kv, doctor, compose, and
every other command keep working, so do not reinstall the plugin and do not
stop the wider task. Treat `doctor` as unhealthy only when a check is `fail`.
A `warn` row, including optional `cwebp` beside an ffmpeg with `libwebp`,
does not make `doctor` exit non-zero.

When the toolchain is missing, tell the user which check failed and ask them to
install ffmpeg 6.0 or newer, with `ffmpeg` and `ffprobe` reachable on `PATH`.
Point them at their platform package manager or `https://ffmpeg.org/download.html`.
An `encoder_libx264` failure means the installed ffmpeg build lacks that
encoder. `encoder_libx265` missing is `warn`; only `--codec hevc` needs it.
`doctor` can pass `ffmpeg` and still `warn` `encoder_libwebp`. Name that
check. If `cwebp` is `pass`, stills still convert; do not ask the user to
rebuild ffmpeg for images and do not use `--no-transcode` as the recovery.
`--no-transcode` is only for a source that is already accepted delivery WebP.
Do not upload lossless WebP. Players expect WebP. If `doctor` `ready` fails,
stop. A 503 / `transport_error` on `media upload` means the service is not
ready, not a bad PNG. Do not install software on the user's computer without
their explicit request.

`media upload` produces an H.264 MP4 by default. Every current browser and
every screenRIG player decodes it. `--codec hevc` opts in to H.265 for a
smaller file at the same quality. Use it only when every screen that will play
the media is a native player (Qt/GStreamer or Android/MediaCodec).

The filename is the human-readable handle. Ask once for a distinctive name
before uploading. The CLI only warns (`generic_filename`); it will not rename.
The CLI declares the caller's file name as `source_filename`, and the server
keeps it on the ready object and derives the stored `filename` from it when
the extension changed: `photo.png` transcoded to WebP is stored as
`photo.png.webp`, `photo.jpg` as `photo.jpg.webp`, and a source `photo.webp`
stays `photo.webp`. Distinct sources no longer collide. `media list` and
`media show` return both `filename` and `source_filename`; use
`source_filename` when the user names a file. When `media upload` succeeds,
the ready id is `data.media_id`. The same value is `data.id` and
`data.operation.result.media_id`. `data.upload.filename` is the name the
server stored, so `photo.png` reads back as `photo.png.webp`;
`data.upload.declared_filename` is what the CLI sent and
`data.upload.source_filename` is the caller's original. Quote
`source_filename` to the user and carry `filename` when you mean the stored
object. Dimensions of the accepted object are under `data.transcode.width` /
`height`. After a tagged upload, `media list --tag TAG` is the filename → id
map.

For many local files, point bulk work at `media upload-batch --state`; do
not loop `media upload` by hand. The manifest is
`{ "items": [ { "path": "./a.png", "tag"?: "lobby", "content_type"?: "image/png" } ] }`
with 1 to 1000 items. Paths are relative to the manifest file. `--state FILE`
is required: a 0600 JSON file keyed by the SHA-256 of each source file's
local bytes. Items already present with a `media_id` are reported as
`resumed`. Do not share one state file across accounts.

```bash
screenrig --json media upload-batch ./images.json --state ./upload-state.json
```

The envelope carries `data.items[]`, one row per item that reached the
account, in manifest order, each with `path`, `source_filename`, `sha256`,
`outcome` (`accepted` or `resumed`), and `media_id`. Read the ids from there;
a batch no longer needs a follow-up `media list --tag` to learn what it
created. `data.failed[]` carries the items that did not land, with their
problem code and status.

Run `doctor --json` for local diagnostics. Use
`doctor --repair-config --json` only to repair an existing credential file
whose permissions are too broad.

## Local compose

Compose is authoring path 3, the exception path. It paints named regions of
type and imagery into local PNGs, and it is right for three kinds of page:
several live primitives on one page, such as a `video` or `iframe`/`webapp`
hole with copy beside it; dense data that must be exact and cannot be
proofread item by item on a generated still, such as a long timetable or
stock list copied from the customer's source; and iterating a layout without
spending credits. It is local and unbilled.

It is not the tool for a poster, a menu board, an announcement, or any other
informational screen a viewer should read as one printed piece: those are
generated as one artefact (see "Generate the artefact"). Choosing compose to
make a slide-deck-looking page should be unusual, and wanting animation is
not a reason: `enter`, `motion`, and transitions apply to a generated still
exactly as to a composed one. Never compose text over a generated poster.

When a page does belong in compose, read
[Composition and visual direction](references/composition.md) before
choosing a layout. It covers reference research, useful density, independent
artwork, readability, and playlist-wide visual review; most of it also
sharpens a generation prompt.

Write JSON, `compose render`, look at the PNGs, iterate. Compose is not billed.
Uploads and playlist writes are billed. Iterate `compose render` and read
`manifest.json` before any `media upload`.

`--output` is a directory, not a `.png` / `.webp` / `.jpg` file. Stem it
before `compose render` so the directory name is the human handle. Default
`--output` follows the spec filename without `.json`. The CLI
`generic_filename` warning will not rename on upload.

```bash
screenrig --json compose catalog
screenrig --json compose render ./exec-intro.json --output ./exec-intro
# read ./exec-intro/manifest.json and the region PNGs
# agent reads the PNGs with vision; do not cat pixels into chat
# iterate the JSON and re-render
screenrig --json media upload ./exec-intro/left.png --tag TAG
screenrig --json media list --tag TAG --primitive image
# playlist page: image primitives at the manifest rects, or one combined image
# many files: media upload-batch ./images.json --state ./upload-state.json
```

`compose catalog` prints the fail-closed page language: page keys
`width`/`height`/`font`/`background`/`brand`/`text`/`image`/`video`/`motion`/`pages`/`viewing`/`logo`,
regions `fullpage|left|right|left-third|middle-third|right-third|middle-half|top-half|bottom-half|top|bottom`,
and inner fields `title|subtitle|text|footer|image|video|iframe|webapp|cards|card|table`
plus `enter`/`stagger`/`motion`/`align`/`valign`/`fill`/`color`/`z`/`shadow`/`outline`.
Author only catalog fields. Unknown keys fail the whole spec. Do not author
`fontSize`. Do not author `x`/`y`. Do not author Frame trees, recipes, or
`.layout.json`. On the page, `text` is the copy color. In a
region, `text` is body copy (a string or an array of lines). Type size is
procedural from `min(width, height)` and optional `viewing` `near|mid|far`
(default `mid`). Titles default to `brand`. Body (`subtitle`, `text`, `footer`)
defaults to `text`. Optional region or `card` `color` overrides every role in
that box. Text over a page `image` or `video` with no `fill` gets a 1 px
unblurred drop shadow (`#000000E6` on light type, `#FFFFFFE6` on dark type).
Set `shadow` to `"none"` or `{ x, y, color }` to override. `outline` is
`{ width: 0.5-12, color }` and is off unless set. A card plate is backing, so
type on a card does not get the automatic shadow.
On 1920×1080 mid, body wish is about 45 px and title wish is 86 px. A region
then applies one scale (about 0.65–1.35) so type fills the box; a single line
is not grown. Footer stays on the bottom edge. If the region holds image or a
placeholder, type stays at scale 1 and media takes the leftover. Copy that
still does not fit at the minimum scale is a `usage_error` naming the region
(`bottom.card` for an ink plate) and no PNG is written for that page; shorten
the copy, drop a block, or use a taller region. Regions that sit side by side
with the same top and height (`left` and `right`, or the three thirds) form a
row: with automatic vertical alignment they share one type scale and one
starting line, so menu column titles sit on one baseline whatever each
column's body length.

`card` (singular) is a plate. `card.fit` is `region` (default: fill the whole
region rect) or `ink` (hug measured type plus 24 px pad, placed with the
region's `align`/`valign`). Default fill is the page background + B3 (30%
transparency). Override with `card.fill`. Inner fields: `title`, `subtitle`,
`text`, `footer`, `image`, `cards`, `table`, `fill`, `color`, `fit`. `cards`
(plural) is `[{ title, subtitle?, text?, price?, image? }]` and can sit inside
`card`. No nested `card`. Sibling `title`/`text`/`cards` are not allowed next
to `card`. Use a card to bring type forward over photo or video; do not wrap
every region. Cutout and image-only regions stay un-carded. Copy strings
accept `**bold**`, `*italic*`, and `__underline__` only. Nesting
`***bold italic***` is allowed. Unmatched markers stay literal. No links,
lists, or headings. `table` is `{ columns, rows }` with 1 to 8 columns; every
column is sized. Page `logo` is a path or `{ src, corner }`
(`top-left|top-right|bottom-left|bottom-right`, default `bottom-right`). The
mark sits 32 px inset from that corner, contained max 200×100, never
upscaled, never stretched, above regions. Type, card, and iframe holes inset
so they do not overlap the mark. `iframe`, `webapp`, and region `video` reserve leftover space
like an image and are not painted. Manifest `media` is
`{ type: iframe|application|video, src, rect }` in page coordinates. Omit the PNG
`file` when the layer is only a hole. URLs are allowed for iframe and webapp src
fields. Page-level `video` stays a transparent background for the player. `enter` is a playlist enter type with optional `stagger` 0 through 8.
`motion` is playlist `spin` or `drift`. Image paths are local filesystem paths
relative to the spec file, never a URL. The CLI does not fetch. The envelope
is structured JSON, not pixels.

A named `font` must be installed on this host. A missing family is
`usage_error`, not a silent fallback. Omit `font` to walk catalog fallbacks.
Set page `background`, `brand`, and `text` as hex colors. Muted copy is mixed
from `text` toward `background`.

`compose render` writes one PNG per region and `manifest.json`
(`version`, `canvas`, `layers[]` each `{ id, file?, z, rect, enter?, motion?, media? }`).
Rects are integers, field-for-field with playlist `PlaylistRect`.
`--combined` writes a flattened PNG for inspection. Default for agent work is
layered. Never print PNG bytes, pixels, or image data. `--open` opens the
combined PNG on this computer only when the user asked to view the still here.
Agent vision uses the file path, not `--open`. Raster a diagram to PNG or WebP
at canvas size, upload it, and place it as `image`. HTML is not a primitive.

Plan the canvas from the user's intended output, orientation, and content
viewport. Honor a requested 1920×1080 deliverable even when reviewing on a
larger monitor; desktop dimensions alone do not change the brief. For final
physical display quality, choose raster dimensions for the **physical content
viewport**, excluding letterboxing. A 1920×1080 slide displayed in a
3840×2160 viewport enlarges every flattened element 2×, even when its original
logo is high resolution. Region images cover their box. Source images must
support their actual painted pixel dimensions, including the part cropped by
cover. Re-render from originals at the target density; enlarging the finished
PNG cannot recover detail.

Current compose output dimensions equal the page `width`/`height`. To adapt a
1920×1080 spec for 3840×2160, double `width` and `height`. Type scales with
the shorter edge. Inspect the result on the physical screen at 1:1 pixels;
native screenshots are reduced resolution and can hide pixelation.

Pass `--target-width 3840 --target-height 2160` to `compose render` when the
physical content viewport is known. These flags check quality; they do not
resize the PNG. Read envelope `warnings` and `data.quality`.
`image_upscaled` reports decoded source enlargement above 1.25× using actual
paint bounds. `compose_output_upscaled` reports output magnification above
1.25× at the target. Fix the source or render dimensions before uploading.
With no target, quality reports `target_status: "unknown"`; this is not
evidence of adequate display resolution. Upload transcoding can change
dimensions, so inspect the accepted media dimensions too.

Use optional `--safe-area` for a TV that may crop edges: it warns when
measured text crosses the 5% margin. Warnings are nonblocking, and full-bleed
imagery stays valid. `compose catalog` lists page keys, regions, inner fields,
enter/motion enums, viewing, installed fonts, and examples in this language.

### Compose a deck with fewer corrective steps

Prefer region `title`/`text`/`cards`/`table` for titles, copy, cards and
tables so type fitting, font checks and safe-area diagnostics still run.
Keep illustrations as image assets in a region. A deck is `{ "pages": [ {
"id": "intro", ...page overrides, regions } ] }`. `compose render` of that
file is enough. `compose batch` adds a contact sheet and `--only ID`.

```json
{
  "width": 1920,
  "height": 1080,
  "background": "#1C1410",
  "brand": "#C9A227",
  "text": "#F3E6D0",
  "pages": [
    {
      "id": "intro",
      "left": { "title": "A clear introduction", "text": "One useful idea, explained simply." }
    },
    {
      "id": "comparison",
      "fullpage": {
        "title": "Compare the outcomes",
        "cards": [
          { "title": "Prepare", "text": "Validate before publishing." },
          { "title": "Verify", "text": "Inspect the target screen." }
        ]
      }
    }
  ]
}
```

```bash
screenrig --json compose render ./deck.json --output ./rendered --target-width 3840 --target-height 2160 --safe-area
screenrig --json compose batch ./deck.json --output ./rendered --target-width 3840 --target-height 2160 --safe-area
```

`compose batch` accepts 1 to 2000 pages and returns ordered page results,
layered PNG paths, a contact-sheet preview, and a batch manifest. Fix one
page and run the same command with `--only comparison`: only that page
renders, the others are explicitly `not_selected`. This is selective
rendering, not an automatic cache-validity promise.

Read `data.quality.text` for measured ink. Image upscale warnings remain
separate. Inspect individual full-resolution region PNGs and the combined
composition before claiming pixel quality.

Font checks compare rendered characters with the font's missing-glyph raster.
`font_glyph_fallback` reports a replacement font for that run; choose the
named font explicitly for consistent typography. `font_glyph_missing` means
no installed fallback covers the text. Install a suitable font or change the
family; do not accept missing-character boxes. This check is not a proof of
every language's shaping or typography quality.

Validate the separate wire playlist locally before expensive upload/publication
work, and again after replacing draft references with accepted resource IDs:

```bash
screenrig --json playlist validate ./playlist.json
```

This uses backend-generated schema and semantics, including application
controllers, selectors, duplicate IDs, object `enter` (type plus optional
`stagger`), and object `motion`. Errors name exact JSON paths. It is local and does not require authentication or make
HTTP requests. Create/update also run this check before their write. A pass
means local shape and cross-field semantics are valid; authorization, media
readiness, dynamic selector counts, durations and remote availability still
require server checks. Raster QA alone never proves the playlist is valid.

### Slide, overlay, and wordmark

For text over images or video, put copy in a `card` so the plate brings type
forward. Default `card.fit` `region` fills the region (a column, a half).
`fit: "ink"` hugs the measured type plus 24 px; use it for lower thirds and
short copy so a two-line `bottom` card does not paint a full-width opaque
band. The type is sized inside the plate's padding, so the plate contains
every line, title and body alike. Default fill is the page background + B3.
Override with `card.fill`.
Keep text opaque. Check contrast over changing bright and dark frames; a
poor type-on-plate contrast warns (`card_low_contrast`) and does not block
render. Do not wrap every region in a card.

Overlay still (transparent page, ink-fit lower third):

```json
{
  "width": 1920,
  "height": 1080,
  "background": "#00000000",
  "brand": "#C9A227",
  "text": "#FFFFFF",
  "video": "./clip.mp4",
  "bottom": {
    "enter": "fade-up",
    "valign": "bottom",
    "card": {
      "fit": "ink",
      "title": "Lower third",
      "text": "Keep copy on a snug plate over the picture."
    }
  }
}
```

Author the overlay at the full slide resolution (1920×1080 in this example),
so the type ramp stays at the intended scale. A `bottom` card with
`fit: "region"` is a full-width band; that is not the default for short copy.
Keep any separate wordmark clear of the copy and preserve its proportions.

For a side rail, put a `card` in `left` or `right`. Do not author `x`/`y`.

```json
{
  "width": 1920,
  "height": 1080,
  "background": "#00000000",
  "brand": "#C9A227",
  "text": "#FFFFFF",
  "left": {
    "card": {
      "title": "Side title",
      "text": "What, when, where, and the next action."
    }
  }
}
```

Page `logo` is the identity mark: 32 px inset from the chosen corner, contain
inside 200×100, never upscaled. Prefer `logo` over a hand-placed playlist
wordmark when composing the still.

Playlist: photo `layer` 0 + overlay `layer` 1 on a 1920×1080 canvas. Use
`content_fit: "fill"` for a matching-aspect full-canvas overlay; preserve the
photo proportions with `contain` or intentional `cover` cropping. Eight-digit
hex is how the page stays transparent and the plate keeps alpha. Layered
region PNGs can sit as image primitives at their manifest rects. Inspect with
`--combined`; default agent output stays layered.

## Playlist writes

Four wire primitives exist: `image`, `video`, `iframe`, and `application`.
Static is `image`, motion is `video`, and web is `iframe` or `application`.
Do not author native `text`, `box`, or `line` on the wire. Text reaches the
wire only as pixels inside an `image`: a generated still, or a locally
composed one uploaded with `media upload`.

A full page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
and `primitives`. A primitive is flat: `id`, a `primitive` field naming one of
the four, that primitive's own fields, then `rect`, `layer`, `content_fit`,
optional `enter`, and optional `motion`. There is no nested content object.

Image and video primitives require a `selector`. `iframe` and `application`
do not take one. Do not put `media_id` on the primitive itself; it belongs
inside the selector. Do not send server-resolved `items`. Advance with
`media_end`, never `video_end`.

`canvas.background` is a solid uppercase `#RRGGBBAA` or a top-to-bottom
linear gradient. The gradient is `{ "type": "linear", "stops": [...] }` with
2 through 8 stops, strictly increasing `at` in `[0, 1]`, first `at` 0, last
`at` 1, and no angle field. A solid string stays valid.

Selector `by` values:

- `id`: one ready `media_id`. `one_at_a_time` must be false.
- `ids`: 1–32 unique ready IDs.
- `all`: every ready object of that primitive, image or video.
- `tag`: ready objects of that primitive whose tag matches
  `^[A-Za-z0-9]{1,32}$`.

`media_end` is valid only on a page with exactly one image or video primitive.
Video `loop` must be false. An image on `media_end` requires `dwell_ms`.
`dwell_ms` is rejected on duration and application pages. A video plus a
lower-third image is two primitives: that page must use `advance.mode`
`duration`, not `media_end`. Set `after_ms` longer than the clip, or set
`loop: true`. If `after_ms` equals the clip length, the page cuts when the
film ends.

Default `transition` is `{ "type": "crossfade", "duration_ms": 200 }`. Use
swipe types, object `enter`, and object `motion` sparingly.

```json
{
  "name": "Lobby loop",
  "pages": [
    {
      "id": "poster",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "duration", "after_ms": 8000 },
      "primitives": [
        {
          "id": "hero",
          "primitive": "image",
          "selector": { "by": "id", "media_id": "med_01EXAMPLEIMAGE0000000000" },
          "alt": "Lobby poster",
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    },
    {
      "id": "clip",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "media_end" },
      "primitives": [
        {
          "id": "feature",
          "primitive": "video",
          "selector": { "by": "id", "media_id": "med_01EXAMPLEVIDEO0000000000" },
          "muted": true,
          "loop": false,
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    }
  ]
}
```

Use `data.media_id` from `media upload` or `media generate` (same value as
`data.id`). Do not invent one. After a tagged upload or generate,
`media list --tag TAG` is the filename → id map. Do not re-upload a generated
still; `media download` it when a composed page needs the file.

Photo plus overlay still:

```json
{
  "id": "hero",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "duration", "after_ms": 8000 },
  "primitives": [
    {
      "id": "photo",
      "primitive": "image",
      "selector": { "by": "id", "media_id": "med_01EXAMPLEPHOTO0000000000" },
      "alt": "Hero photo",
      "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "layer": 0,
      "content_fit": "fill"
    },
    {
      "id": "overlay",
      "primitive": "image",
      "selector": { "by": "id", "media_id": "med_01EXAMPLEOVERLAY000000000" },
      "alt": "Lower third",
      "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "layer": 1,
      "content_fit": "fill"
    }
  ]
}
```

Video plus a lower-third image uses the same two-layer shape with
`advance.mode` `duration`. Do not use `media_end` there.

### Page motion

These are playlist document fields the CLI sends. The control plane accepts
swipe types, object `enter`, and object `motion`.

Default pages: `transition` is `{ "type": "crossfade", "duration_ms": 200 }`.
Author crossfade unless swipe or `enter` is the intended emphasis. Select
foreground artwork or a short headline for restrained entrances; leave menu
items, prices, and other information stationary. Video already supplies
motion. Choose animated layers by purpose, without a fixed layer quota or
an entrance on every primitive.

`transition.type` is `crossfade`, `swipe-left`, `swipe-right`, `swipe-up`, or
`swipe-down`. `duration_ms` is required and runs from 0 through 60000. When
you choose a swipe type, write `duration_ms: 600`.

Swipe is the incoming page's type. The outgoing page follows so the edges
stay touching. The name is motion direction: `swipe-left` moves content
left.

Optional object `enter` is `{ "type": "...", "stagger"?: 0 }` with that same
object name on playlist JSON. Types: `fade-up`, `fade-down`, `fade-left`,
`fade-right`, `fade-in`, `zoom-in`, `zoom-out`. Optional integer `stagger`
is 0 through 8. Absent means no object animation.

Object enter starts invisible. It runs 500 ms after the page occupies the
full viewport, for 400 ms, plus `stagger * 120` ms when `stagger` is
present. Those delays are contract constants, not author fields and not CLI
flags. Do not send duration or delay inside `enter`; `stagger` is the only
extra author field.

To slide a headline in over video, compose the text and its translucent
plate into a transparent PNG, place that image above the video's layer, and
apply `enter` to the overlay image. Keep the background independent. A
generated poster does not need this: apply `enter` to the poster image
itself rather than composing text over it.
The same mechanism works for independent foreground artwork with alpha.
Leave transparent breathing room around moving ink within its raster and
primitive rect so entry motion does not clip its edges; do not stretch the
asset to compensate. Keep supported timing constants unchanged.
Preview the first activation and a loop replay on each intended player; check
that the overlay begins hidden, enters within its rect, and retains the
expected layer order. A settled screenshot alone cannot verify animation.

Optional object `motion` is a discriminated object on `type`: `spin`,
`path`, or `drift`. Absent means the primitive stays at rest after enter.
Persistent motion is for designs that call for it; one moving element per page is the norm. Prefer a panning background or one accent over several moving objects.

`spin` takes `direction` `cw` or `ccw` and `speed` `slow`, `medium`, or
`fast`, and applies to `image` and `video` only:

```json
{
  "id": "badge",
  "primitive": "image",
  "selector": { "by": "id", "media_id": "med_01EXAMPLEBADGE00000000000" },
  "rect": { "x": 1640, "y": 80, "width": 200, "height": 200 },
  "layer": 1,
  "content_fit": "contain",
  "motion": { "type": "spin", "direction": "cw", "speed": "slow" }
}
```

`path` takes 1 through 64 `points`, `rate` greater than 0 and at most 10000,
and optional `loop` `loop`, `ping-pong`, or `once`. It applies to `image`,
`video`, `application`, and `iframe`. The authored `rect` is the start pose;
`points` are later top-left waypoints in canvas units:

```json
{
  "id": "background",
  "primitive": "image",
  "selector": { "by": "id", "media_id": "med_01EXAMPLEBACKGROUND000000" },
  "rect": { "x": 0, "y": 0, "width": 2400, "height": 1080 },
  "layer": 0,
  "content_fit": "cover",
  "motion": {
    "type": "path",
    "points": [{ "x": -480, "y": 0 }],
    "rate": 40,
    "loop": "loop"
  }
}
```

`drift` is a Ken Burns pan-and-zoom. It takes `zoom` `in` or `out`,
`direction` `left`, `right`, `up`, `down`, or `none`, and the same `speed`
tokens. It applies to `image` and `video` only:

```json
{
  "id": "photo",
  "primitive": "image",
  "selector": { "by": "id", "media_id": "med_01EXAMPLEPHOTO0000000000" },
  "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
  "layer": 0,
  "content_fit": "cover",
  "motion": {
    "type": "drift",
    "zoom": "in",
    "direction": "right",
    "speed": "slow"
  }
}
```

### Operator navigation while a web page is active

On Qt and Android, plain Space, N/P, Enter, and arrows belong to an active iframe or
application so typing and kiosk navigation remain usable. Operator shortcuts
are Ctrl+Alt+Left/Right for Previous/Next and Ctrl+Alt+Space for Pause/Resume.
Escape opens Settings with Previous page, Pause/Resume playback, and Next page
menu controls. On Qt, use Up/Down to select a row and Enter to choose it.
A paused web page stays paused until explicit resume or the player's existing
60-minute expiry. Rapid navigation while the next page prepares keeps only the
latest pending direction and applies it once after activation; it does not
queue an unbounded series of stale key presses.

## Page scheduling with visibility

A page may carry an optional `visibility` object that limits when the page
plays. It is a sibling of `advance`.

- Every playlist must keep at least one page with no `visibility` field at
  all.
- A screen running a scheduled playlist must have a timezone.

```json
{
  "id": "after-hours",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "duration", "after_ms": 8000 },
  "visibility": {
    "enabled": true,
    "from": "2026-09-01T00:00",
    "until": "2026-12-31T23:59",
    "windows": [
      { "days": ["mon", "tue", "wed", "thu"], "start": "09:00", "end": "17:00" },
      { "days": ["fri"], "start": "22:00", "end": "02:00" },
      { "days": ["sun"] }
    ]
  },
  "primitives": []
}
```

- `enabled` is required and boolean. `false` hides the page unconditionally.
- `from` and `until` are optional civil bounds, `YYYY-MM-DDTHH:MM`, minute
  precision, **no offset and no zone suffix**. `from` is inclusive, `until` is
  exclusive.
- `windows` is an optional array of 1 to 16 recurring windows.
- `days` is 1 to 7 unique values from `mon`, `tue`, `wed`, `thu`, `fri`, `sat`,
  `sun`.
- `start` and `end` are civil `HH:MM`. Set both or omit both. Omitting both
  selects the whole day.

A page is eligible when `enabled` is `true`, the current civil time is inside
`[from, until)`, and `windows` is absent or at least one window matches.

An overnight window is written `end` at or before `start`, and the start day
owns it. `{"days": ["fri"], "start": "22:00", "end": "02:00"}` runs Friday
22:00 through Saturday 02:00.

```bash
screenrig --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match 3
```

`--timezone` is an IANA identifier such as `America/Los_Angeles` or
`Europe/Berlin`. Set the timezone before assigning a scheduled playlist.
`screen update` accepts the same `--timezone`.

## Playlist bundle export and import

Use a `screenrig.playlist-bundle/v1` directory to move one playlist and every
referenced image or video rendition together.

```bash
screenrig --json playlist export pl_EXAMPLE --output ./lobby-bundle
screenrig --json playlist import ./lobby-bundle
screenrig --json playlist import ./lobby-bundle --update pl_TARGET --if-match REVISION
```

The export destination must not exist. The bundle contains
`screenrig-bundle.json`, `playlist.json`, and content-addressed
`media/<sha256>.<canonical-ext>` files. Export snapshots dynamic `all` and `tag`
selectors to exact `id` or `ids` selectors. Application primitives stop export
before any media download. Import creates a new playlist by default. Playlist
names are unique per account, so importing an account's own export unchanged
is refused with 409 `resource_conflict` ("playlist name is already in use");
that problem's `error.next` names the two ways forward. `--name NAME` (1 to
120 characters) imports the bundle as a new playlist under that name;
`--update ID --if-match REVISION` replaces the existing playlist instead.
Updating requires both `--update` and the current `--if-match` revision.

```bash
screenrig --json playlist import ./lobby-bundle --name "Lobby loop (copy)"
```

## Putting a web app on a screen

Provide visible in-app Back and Reset controls for kiosk navigation. Do not
rely on Escape or the platform Back key: the Qt player reserves them for
operator Settings. Verify keyboard focus and key handling inside the native
player as well as in browser preview before advertising keyboard shortcuts.

### 1. Upload the app and read its release id

`app upload` takes one already-built static directory with a root `index.html`.
It packs the directory itself, so run `app pack` only when you want to inspect
the archive first. The packer injects the screenRIG browser SDK at
`_screenrig/runtime.js` and adds its script tag to `index.html`, so the app
reaches `window.screenrig` at runtime with no build step and no dependency to
install.

```bash
screenrig --json app upload ./lobby-board --name "Lobby board"
```

`app upload` waits for the publication operation by default. Read three fields
from the envelope:

- `data.operation.state` is `succeeded`.
- `data.application.release_id` is the `rel_...` release id. This is the only
  value an application primitive needs.
- `data.application.id` is the `app_...` application id. `kv` commands take this
  one; a playlist primitive never does.

With `--no-wait` run `operations wait <operation_id>` before pinning the
release into a playlist. Every `app upload` creates a new application and a
first immutable release. To repair or improve the same app, read its current
revision with `app show`, then publish a new release:

```bash
screenrig --json app show app_EXAMPLE
screenrig --json app update app_EXAMPLE ./lobby-board --if-match 3
```

`app update` preserves application identity, name, and application K/V. It uses
the same packer, upload limits, operation wait, and release result as upload.
Wait for `operation.state: "succeeded"`, then explicitly replace the intended
playlist primitive's `release_id` and update the playlist with its revision.
Existing playlists remain pinned to their old immutable release until edited.
On a revision conflict, read the app again before deciding whether to retry;
do not create a replacement application just to bypass the conflict.

### 2. Write the application primitive

```json
{
  "id": "board",
  "primitive": "application",
  "release_id": "rel_01EXAMPLERELEASE00000000",
  "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
  "layer": 0,
  "content_fit": "fill",
  "controller": true
}
```

- `release_id` is required on an `application` primitive. `application_id` is
  an optional ownership assertion; omit it.
- An `application` primitive takes no `selector`.
- `content_fit` must be `fill` for `application` and `iframe`.
- `iframe` is `{ "primitive": "iframe", "src": "https://...", "title": "..." }`
  and takes no `selector`. `src` must be a public `https://` URL without
  credentials. An `iframe` can never be a controller.

### 3. Choose how the page advances

Use `duration` when the app never signals that it is finished:

```json
{ "mode": "duration", "after_ms": 15000 }
```

Use `application` when the app calls `window.screenrig.nextPage()`:

```json
{ "mode": "application", "max_ms": 60000 }
```

For an interactive kiosk, use application mode with a `max_ms` long enough
for the intended visit. A duration page advances at its deadline even while a
visitor is using the app; pointer activity does not extend that deadline.
Call `nextPage()` after completion or a deliberate idle reset, and explain the
bounded fallback in the experience. `await window.screenrig.ready()` completes
the bridge handshake; it does not prove the candidate page is active. Use
`await window.screenrig.waitUntilActive()` before starting a visitor idle clock
or sending active-page events. Use `await window.screenrig.emitConfirmed(code)`
when the UI promises that an event was accepted, and handle its rejection;
plain `emit(code)` is a send attempt. Choose a shorter duration only for a
preview that is supposed to rotate regardless of input.

On an `application` page exactly one primitive must carry `controller: true`,
and it must be an `application` primitive. `media_end` forbids `application`
and `iframe` primitives on that page.

### 4. Create the playlist and assign it to a screen

```bash
screenrig --json playlist create ./lobby-board.json
screenrig --json screen list
screenrig --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match 3
```

Take `--playlist-id` from `data.id` of the `playlist create` result. Take
`--if-match` from the screen's current `revision`, which both `screen list` and
`screen show` return. `revision_conflict` means refetch and retry. Do not
invent the revision.

Looking at the screen stays the only proof of layout. `screen screenshot <id>`
blocks on a WebP. Do not print pixels.

## Screens

```bash
screenrig --json screen list
screenrig --json screen show scr_EXAMPLE
screenrig --json screen update scr_EXAMPLE --name "Lobby" --playlist-id pl_EXAMPLE --if-match REVISION
screenrig --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
screenrig --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match REVISION
screenrig --json screen archive scr_EXAMPLE --if-match REVISION
screenrig --json screen unarchive scr_EXAMPLE --if-match REVISION
screenrig --json screen toast scr_EXAMPLE --text "Updated lobby loop" --level info
screenrig --json screen screenshot scr_EXAMPLE --output ./lobby.webp
```

`screen list` omits archived screens. `screen list --state archived` lists
archived screens only. `screen show <id>` still returns an archived row.
`screen archive` hides the screen. `screen unarchive` restores it. `screen
delete` is not a de-associate; it returns `screen_archive_required`.

`screen show <id>` prints the GET screen JSON. After a player reports a
playback surface, the body may include optional `observation`: `observed_at`
and `surfaces`. The same GET always includes `online`. Optional
`last_online_at` and `last_ip` appear after the first connect. They are
read-only.

`screen screenshot <id>` blocks until a still WebP is on disk. The default
path is `./<id>.webp`. `--timeout` defaults to 35000 ms and `--poll-ms`
defaults to 500 ms. There is no `--no-wait`. Do not print pixels.

`screen toast` is the agent mark on a live wall. `--level` is `info`,
`alert`, or `error`. Omitted `--level` defaults to `info`. Production glass
shows error toasts only; alert and info only off production. `--text` is 1 to
120 characters. `--duration-ms` is optional, 2000 through 60000; omitted
values default to 10000 on the server.

`playback list` returns daily playback aggregates for this account. One row
per screen, media, and UTC day. Newest days first. `--screen-id`,
`--media-id`, and `--day YYYY-MM-DD` filter the caller's own rows. Each row
carries the server-resolved `filename` and `primitive` (`image` or `video`);
`primitive` is absent on rows last aggregated before players reported image
starts, so do not require it.

## Comments

Comments are the agent's own structured JSON object on a screen, a playlist,
or one playlist page. Compact UTF-8 of that object is at most 1 KiB. The
value must be an object. screenRIG does not read or use it and never sends it
to players.

```bash
screenrig --json comment set screen scr_EXAMPLE --json-value '{"note":"lobby hours"}'
screenrig --json comment show screen scr_EXAMPLE
screenrig --json comment set playlist pl_EXAMPLE --page poster --file ./note.json
screenrig --json comment delete screen scr_EXAMPLE
```

`--json-value` is a JSON object. `--file` reads a JSON object from disk.
Exactly one of those on set. Last write wins; do not send `--if-match`.
Unset show is `{ "comments": null }`.

## Application K/V

Application K/V is binary-safe. Use exactly one value mode.

```bash
screenrig --json kv set --application-id app_EXAMPLE lobby --json-value '{"open":true}'
screenrig --json kv get --application-id app_EXAMPLE lobby
screenrig --json kv list --application-id app_EXAMPLE
screenrig --json kv delete --application-id app_EXAMPLE lobby --if-match REVISION
```

## Events

Human `events list` and `events follow` print one logfmt line per event.
`--json events list` is one JSON page envelope. `--json events follow` is a
JSON stream of envelopes.

An `application.event` line leads its details with `code` and `primitive_id`,
the id of the primitive that emitted it.

`events list` returns one page of `items`, oldest first, plus `next_cursor`.
While newer events already exist, `next_cursor` is the cursor of the last
returned event: pass it back as `--after CURSOR` for the next page. At the end
of the history it is `null`; stop there. `null` is the normal end, not an
error. `--limit` defaults to 50 and accepts 1 through 200; the CLI forwards
it unchanged, so a value outside that range is the server's 400
`invalid_request` with `error.errors[].field` equal to `limit`. There is no
silent cap. Every row carries `type`, a snake_case `tag`, and `id` when a
resource is involved (`scr_…`, `pl_…`, `med_…`, `op_…`).

`events follow` reconnects on disconnect or a transient failure, with
backoff, and resumes from the last SSE id via `--after`. `--timeout` ends the
whole follow, including backoff; 401, 403, 404, and other non-transient 4xx
problems stop the command.

Exempt listen-stream events (not billed after subscribe): `screen.*`,
`runtime.*`, `application.event`, and heartbeats. Opening `events follow`
costs 1 credit as the listen subscribe. Later billed events on that stream
cost 1 credit each.

On `stream.resync_required`, refetch authoritative state and resume from the
supplied cursor.

## Feedback

```bash
screenrig --json feedback bug "Playlist stalls after assign" \
  --body-file ./report.md --command "screen assign"
screenrig --json feedback feature "Add a dry-run flag" --body "Preview a change first."
screenrig --json feedback list [--kind bug|feature]
```

`--body` is inline text. `--body-file` reads a file. A title is at most 120
characters and a body is at most 4000. `--command` is the command the
feedback is about. Probe support through `capabilities.features.feedback`;
`doctor` reports that check.

## Commands

```text
account show
agent enroll --email ADDRESS [--name NAME] [--open-dashboard]
agent connect [--name NAME] [--print-url] [--timeout MS]
agent status
agent disconnect --yes [--allow-lockout]
dashboard [--print-url]
app pack <directory> [--output FILE]
app upload <directory> [--name NAME] [--no-wait] [--poll-ms MS]
app update <id> <directory> --if-match REVISION [--no-wait] [--poll-ms MS]
app list
app show <id>
media generate --prompt TEXT [--aspect-ratio RATIO] [--quality low|medium|high] [--tag TAG]
                [--no-progress]
media upload <file> [--content-type TYPE] [--tag TAG] [--no-wait] [--poll-ms MS]
                    [--no-transcode] [--codec h264|hevc] [--max-fps N]
                    [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]
media upload-batch <manifest.json> --state FILE [--concurrency N]
                   [--no-transcode] [--tag TAG] [--no-progress]
media show <id>
media download <id> [--output FILE]
media list [--tag TAG] [--primitive image|video]
media update <id> (--tag TAG | --clear-tag) --if-match REVISION
media delete <id> --if-match REVISION
compose catalog
compose render <file> [--output DIRECTORY] [--combined] [--target-width PX --target-height PX] [--safe-area]
                      [--open] [--lint-only]
compose batch <file> --output DIRECTORY [--only ID] [--target-width PX --target-height PX]
                      [--safe-area] [--lint-only]
playlist validate <file>
playlist create <file>
playlist update <id> <file> --if-match REVISION
playlist export <id> --output DIRECTORY
playlist import <directory> [--name NAME] [--update ID --if-match REVISION]
playlist show <id>
playlist list
playlist delete <id> --if-match REVISION
screen pair CODE [--label LABEL]
screen update <id> [--name NAME] [--playlist-id ID] [--timezone ZONE]
                   --if-match REVISION
screen list [--state archived]
screen show <id>
screen assign <id> --playlist-id ID --if-match REVISION
screen set-timezone <id> --timezone ZONE --if-match REVISION
screen archive <id> --if-match REVISION
screen unarchive <id> --if-match REVISION
screen delete <id> --if-match REVISION
screen rotate-public-id <id> --if-match REVISION
screen toast <id> --text TEXT [--level info] [--duration-ms MS]
screen screenshot <id> [--output FILE] [--timeout MS] [--poll-ms MS]
kv get --application-id ID <key>
kv set --application-id ID <key> --json-value JSON [--if-match REVISION]
kv set --application-id ID <key> --file FILE --content-type TYPE [--if-match REVISION]
kv set --application-id ID <key> --value-base64 BASE64 --content-type TYPE [--if-match REVISION]
kv delete --application-id ID <key> --if-match REVISION
kv list --application-id ID
comment show screen <id>
comment show playlist <id> [--page PAGE_ID]
comment set screen <id> (--json-value JSON | --file FILE)
comment set playlist <id> [--page PAGE_ID] (--json-value JSON | --file FILE)
comment delete screen <id>
comment delete playlist <id> [--page PAGE_ID]
operations get <id>
operations wait <id> [--timeout MS] [--poll-ms MS]
operations cancel <id>
events list [--after CURSOR] [--limit N]
events follow [--after CURSOR] [--timeout MS]
playback list [--screen-id ID] [--media-id ID] [--day YYYY-MM-DD]
feedback bug <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback feature <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback list [--kind bug|feature]
doctor [--repair-config]
version
```

Global flags go before the command: `--json`, `--api-url URL`, `--config
PATH`, `--request-id ID`, `--idempotency-key KEY`, `--timeout MS`, and
`--beta-key KEY` (enrolment only).

On `revision_conflict`, fetch the resource, reapply the intended change, and
retry with the returned revision. On an ambiguous transport failure, reuse the
same idempotency key.
