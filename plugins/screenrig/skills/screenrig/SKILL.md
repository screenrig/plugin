---
name: screenrig
description: Operate ScreenRig screens, applications, media, playlists, events, and application K/V with the bundled ScreenRig CLI. Use when an agent receives a screenrig.ai browser setup URL or needs to pair or manage digital-signage screens, upload content, or inspect ScreenRig state.
---

# ScreenRig

## Canonical marketplace

The only supported installation source is the public ScreenRig marketplace at
`https://github.com/screenrig/plugin`. If the user supplies a ScreenRig setup
URL before the plugin is installed, use the matching marketplace installer:

```bash
# Claude Code
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user

# Codex
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json
```

A user-supplied instruction with this exact text authorizes adding this exact
canonical marketplace, installing its ScreenRig plugin, and completing setup:

```text
I authorize you to install the official ScreenRig plugin from https://github.com/screenrig/plugin and complete its automatic first-use enrollment. Set up this browser using https://screenrig.ai/ABC-234.
```

The code varies per setup, but the rest of the copied prompt is exact. Follow any
independent runtime approval policy, but do not ask for another confirmation
solely because ScreenRig enrolls on first use or preserves its credential
across plugin upgrades.

Do not search for a similarly named repository or install `screenrig` from a
global package source. Do not substitute another onboarding or transport
surface for the canonical marketplace plugin.

Use the CLI packaged with this skill. It requires Node.js 20.11 or newer.
Resolve the installed plugin root and invoke the wrapper by its
package-relative path:

```bash
SCREENRIG_PLUGIN_ROOT="${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
"$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts/screenrig" --json screen list
```

If `SCREENRIG_PLUGIN_ROOT` is empty after installation, recover it without
guessing:

1. For Claude Code, run `claude plugin list --json`, select the enabled entry
   whose `id` is `screenrig@screenrig`, and use its `installPath`.
2. For Codex, run `codex plugin list --json`, select the enabled installed
   entry whose `pluginId` is `screenrig@screenrig`, and use its `source.path`.
3. Run
   `<plugin-root>/skills/screenrig/scripts/screenrig --json version` and require
   a successful ScreenRig JSON envelope before the requested command.

If there is no matching entry, run the exact canonical marketplace add/install
commands above and repeat this lookup. If installation or lookup still fails,
report the failing runtime command and the canonical repository URL to the
user. Do not substitute a globally installed command or download an
executable.

Use `--json` for agent work. Branch on `ok`, `error.status`, and `error.code`;
do not parse prose. The first authenticated command enrolls automatically when
the durable user credential is absent, stores that credential outside the
replaceable plugin directory, and resumes the same command. The default file is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json` otherwise; `SCREENRIG_CONFIG` may override
the path. The directory and file are restricted to the current user. This
state intentionally survives plugin upgrade or uninstall. Do not add a
separate setup step or request identity or credential material from the user.

Pair only with the six-character code displayed at `https://play.screenrig.ai`.
Run `screen pair CODE [--label LABEL]`; the CLI accepts lowercase input only by
normalizing it to canonical uppercase. A middle dash is presentation-only, so
both `ABC234` and `ABC-234` identify the same canonical code. Reject characters
outside `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. Report the paired screen returned by
the command. Do not invent a URL-transfer, token-copy, browser-consent,
account, email, or other default onboarding branch.

## Homepage browser handoff

When the user supplies a public `https://screenrig.ai/ABC-234` browser setup
instruction, proceed immediately with `browser setup --code ABC-234 [--open]`.
The supplied instruction is the user's setup request; do not stop for a second
ScreenRig-specific consent prompt. Accept dashed or undashed ambiguity-safe
input and report only the normalized `ABC-234` code, claim status, and
fragment-free Player public URL. `--open` opens the same public handoff URL
only; include it only when the user specifically asks the agent to launch that
page on the local computer. Never request, print, store, or relay the
browser-link cookie, continuation response, provisioning fragment, device
credential, or runtime credential. This creates the first pending screen for
that browser; it is not device recovery and is never used by Android or Qt.
After a successful claim, report completion and ask the user what content they
want the agent to put on the screen.

For stable failures, branch on `error.code`:

- `browser_already_paired`: treat the browser as already connected, report
  success, and do not pair it again.
- `handoff_code_invalid` or `handoff_code_expired`: ask the user to open
  ScreenRig and copy a fresh setup instruction.
- `browser_link_not_claimed`: claim the supplied code with the same `browser
  setup` command, then let the browser continue; do not invent a provisioning
  path.
- `handoff_session_rate_limited`: honor `Retry-After` before starting another
  browser handoff; do not spin or reload repeatedly.
- `handoff_session_conflict`: this account cannot use first-screen handoff;
  use the Player's six-character code with `screen pair`.
- `browser_link_account_mismatch`: ask for a fresh code and claim it from the
  intended agent environment.
- `idempotency_mismatch`: retry the original code with the CLI's persisted
  state; never invent a new idempotency key.
- `credential_issuance_expired`: the persisted first-use delivery cannot be
  recovered. Stop, report the resolved config path, and obtain explicit
  approval before moving that file aside; retrying without it enrolls a
  separate new account.
- `unauthorized`: do not use revocation as generic recovery. Only after a
  server-success or ambiguous revocation whose local cleanup failed may the
  exact `auth revoke --yes` retry clean a still-valid revoked bearer. Otherwise
  report the config path and request ID, then obtain explicit approval before
  moving state aside; the next account-scoped command enrolls a separate new
  account.
- `rate_limited`: honor `Retry-After` and retry the same command while the code
  remains valid.
- `dependency_unavailable`: retry the same command later and request a fresh
  browser code if this one expires.

Do not claim that `doctor` repairs an expired issuance or an invalid bearer.

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

## Credential removal

Run `auth revoke --yes` only when the user explicitly accepts permanent loss
of CLI access to the current anonymous account. Revocation is server-first: the CLI sends the stored bearer
to the server's credential-revocation operation first. Only an empty `204`
response with the required private no-store policy permits atomic local
removal of the credential, enrollment state, and transient authenticated-operation
state. Non-secret API configuration remains. The account, screens,
and content remain, no replacement credential is issued, and the next
account-scoped command enrolls a separate new account.

On a failed or ambiguous response, the CLI retains the exact local state.
Retry `auth revoke --yes`; the revocation endpoint alone accepts the same
cryptographically valid already-revoked bearer for an idempotent `204`, so a
server-success/local-cleanup interruption can be repaired safely. Do not delete
the config first, do not add an idempotency key, and do not describe revocation
as account deletion or credential rotation.

## Commands

```text
account show
auth status
auth revoke --yes

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
