---
name: screenrig
description: Operate ScreenRig screens, applications, media, playlists, events, and application K/V with the bundled ScreenRig CLI. Use when an agent needs to pair or manage digital-signage screens, upload content, or inspect ScreenRig state.
---

# ScreenRig

Use the CLI packaged with this skill. Resolve the installed plugin root and
invoke the wrapper by its package-relative path:

```bash
SCREENRIG_PLUGIN_ROOT="${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
"$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts/screenrig" --json screen list
```

Stop with a configuration error if `SCREENRIG_PLUGIN_ROOT` is empty. Do not
substitute a globally installed command or download an executable.

Use `--json` for agent work. Branch on `ok`, `error.status`, and `error.code`;
do not parse prose. The first authenticated command enrolls automatically when
the durable user credential is absent, stores that credential outside the
replaceable plugin directory, and resumes the same command. Do not add a
separate setup step or request identity or credential material from the user.

Pair only with the six-character code displayed at `https://play.screenrig.ai`.
Run `screen pair CODE [--label LABEL]`; the CLI accepts lowercase input only by
normalizing it to canonical uppercase, and rejects characters outside
`23456789ABCDEFGHJKMNPQRSTUVWXYZ`. Report the paired screen returned by the
command. Do not invent a URL-transfer, token-copy, browser-consent, account,
email, `npx`, `curl`, MCP, or other default onboarding branch.

## Homepage browser handoff

When the user supplies a public `https://screenrig.ai/ABC-234` browser setup
instruction, run `browser setup --code ABC-234 [--open]`. Accept dashed or
undashed ambiguity-safe input and report only the normalized `ABC-234` code,
claim status, and fragment-free Player public URL. `--open` opens the same
public handoff URL only. Never request, print, store, or relay the browser-link
cookie, continuation response, provisioning fragment, device credential, or
runtime credential. This creates the first pending screen for that browser; it
is not device recovery and is never used by Android or Qt.

## Optional browser demo provisioning

Use browser provisioning only when the user explicitly asks to create a new
browser screen for a local demo or test. It is browser-only, new-screen-only,
and never recovery; Android and Qt always use six-character pairing.

- Prefer `screen provision --open [--label LABEL]`. It launches the one-time
  link with an argv-only platform opener and reports only the safe screen ID,
  public URL, expiry, and opened status.
- Use `screen provision --print-url [--label LABEL]` only when the user
  explicitly requests the sensitive one-time URL. Do not repeat it in chat,
  logs, summaries, or configuration.
- Exactly one mode is required. The CLI persists only the idempotency key and
  normalized label for ambiguous retry; it never persists the raw grant.
- A lost browser cookie is recovered with a fresh six-character Player code,
  not by reopening or regenerating a provisioning link for an existing screen.

Never print account credentials, Authorization headers, signed upload headers,
device credentials, runtime cookies, completion nonces, launch
tickets, object keys, or protected asset URLs. Preserve request and operation
IDs in reports. Reuse an idempotency key after an ambiguous mutation retry and
use `--if-match` only with the current resource revision.

## Commands

```text
account show
auth status

app pack <directory> [--output FILE]
app upload <directory> [--no-wait] [--poll-ms MS]
app list
app show <id>

media upload <file> [--content-type TYPE] [--no-wait]
media show <id>
media list
media delete <id> --if-match REVISION

playlist create <json-file>
playlist update <id> <json-file> --if-match REVISION
playlist show|get <id>
playlist list
playlist delete <id> --if-match REVISION

screen pair CODE [--label LABEL]
screen provision (--open | --print-url) [--label LABEL]
browser setup --code CODE [--open]
screen update <id> --if-match REVISION [--name NAME] [--playlist-id ID]
screen assign <id> --playlist-id ID --if-match REVISION
screen show <id>
screen list
screen rotate-public-id <id> --if-match REVISION
screen revoke-credential <id> --if-match REVISION
screen delete <id> --if-match REVISION

operations get <id>
operations wait <id> [--timeout MS] [--poll-ms MS]
operations cancel <id>

events list [--after CURSOR] [--limit N]
events follow [--after CURSOR] [--timeout MS]

kv list --application-id ID
kv get --application-id ID <key>
kv set --application-id ID <key> --json-value JSON [--if-match REVISION]
kv set --application-id ID <key> --file FILE --content-type TYPE [--if-match REVISION]
kv set --application-id ID <key> --value-base64 BASE64 --content-type TYPE [--if-match REVISION]
kv delete --application-id ID <key> --if-match REVISION

doctor [--repair-config]
version
```

Use the same `screen pair CODE` flow for first use and recovery. Application upload
accepts one already-built static directory with a root `index.html`. Media upload keeps
the signed transfer private and returns metadata only. Application K/V is
binary-safe; use exactly one value mode.

On `revision_conflict`, fetch the resource, reapply the intended change, and
retry with the returned revision. On an ambiguous transport failure, reuse the
same idempotency key. On `stream.resync_required`, refetch authoritative state
and resume from the supplied cursor. Run `doctor --json` for local diagnostics;
use `doctor --repair-config --json` only to repair an existing credential file
whose permissions are too broad.
