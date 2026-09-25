# Command inventory

Use `screenrig --help` to confirm flags against the installed executable.

### Command names and discovery

Use `show` to inspect a resource, `list` for collections, and `kv get` / `kv set`
for values. Use `--name` for display names, `--screen-id`, `--app-id`,
`--playlist-id`, and `--release-id` for resource selectors, `--expect-rev` for
revision guards, and `--after` for event cursors. The group is `app`; “application”
is the resource name. Comments keep `comment ACTION screen|playlist ID`.

Compatibility aliases remain: `operations get`, `playlist get`, `--if-match`,
K/V `--application-id`, screen pair/provision `--label`, playlist init `--screen`,
and events `--cursor`. Supply only one spelling of an option. Response field
names are unchanged.

Use `screenrig help --all` for the full inventory or `screenrig playlist init
--help` for focused help. Add `--json` for argument metadata, choices, defaults,
examples, aliases, and option relationships. `exactlyOne`, `atLeastOne`, and
`together` groups are checked before configuration or network access; `requires`
means the first option requires all remaining options. Read stdin only where
command help explicitly supports `-`.

### Enroll: create a new project (default)

```sh
screenrig agent enroll --email ADDRESS --project-name NAME
```

Default first-run is enroll, and enroll always creates a new project — even when
the contact email already signs in to another screenRIG project. Propose a
project name, confirm it with the user, and use the user's actual contact email.
The human receives a member invitation by email automatically; say so. They
follow it in the dashboard, sign in with their own passkey or password, and
switch between their projects there. Do not open `agent connect` unless the user
says this installation should join an existing project. If an unwanted
existing-project connection is already pending, `screenrig agent enroll --force
--email ADDRESS` discards it and enrolls so the path is not dead-ended. Resume
`agent connect` only for an intentional existing-project reconnect. An already
enrolled installation reuses its project. The Player pairing code is the only
glass-side human step after enroll.

### Invite people and advertising buyers

```sh
screenrig invitations create --email ADDRESS[,ADDRESS]
screenrig invitations create --kind ad-buyer --email ADDRESS[,ADDRESS] --screen-id ID --slot-id ID --policy trusted|review_required
screenrig invitations list [--kind member|ad-buyer] [--status STATUS]
screenrig invitations revoke ID
```

Member invitations are the default kind and are delivered by email; email
delivery is requested, not proof a message reached the inbox. Advertising
buyers are invited with `--kind ad-buyer`, an explicit `--screen-id` /
`--slot-id` scope, and a `trusted` or `review_required` policy; their
invitations are email-only. Email invitations expire after seven days, and at
most 50 invitations may be outstanding per project.

`--link` is available only for member invitations and only when the user
explicitly asks for a link: it prints one member invitation URL once instead of
emailing. The link is a bearer grant, not email-bound, and expires after 24
hours. Print it once and deliver it only to the intended person; never store or
log it and never send it anywhere else. `invitations list` filters by kind and
status, and `invitations revoke ID` revokes an outstanding invitation without
touching accepted memberships.

### Dashboard and sign-in reset

```sh
screenrig dashboard open
screenrig dashboard reset-sign-in --email ADDRESS
```

`dashboard` (bare) and `dashboard open` open the dashboard origin without
minting a credential and without a network request. The human signs in with
their own login — a passkey or a password — and switches between their projects
there. If no browser can open, the CLI prints the public origin.

`dashboard reset-sign-in --email ADDRESS` is unauthenticated and works on a
fresh installation: it never enrolls, sends a stored credential, or changes the
stored project or enrollment. The acknowledgment is neutral whether or not the
address is known; if the address can receive sign-in instructions, the human
checks its inbox. Delivery is not confirmed, instructions expire after one
hour, and an ambiguous retry reuses its saved Idempotency-Key.

### Connect an existing project

```sh
screenrig agent connect
```

By default, this starts or resumes an approval request and reads one status
snapshot for at most one second. A successful pending result means submission,
not activation: `data.request_submitted` is `true` and `data.connection_complete`
is `false`. Send the handoff from `data.approval_url` to the intended user, then
resume with `data.next.argv` or `screenrig agent connect`. The human approves in
the dashboard with their own login (a passkey or a password in production); the
CLI never receives that credential. The argument array preserves the selected
config and API origin. Activation returns `data.status: active` and
`data.connection_complete: true`, without returning a credential.

If no snapshot arrives, `data.status_checked` is `false`; do not infer current
approval state from that result. The CLI tries to open the approval URL in a
browser and prints the handoff URL only when no browser can be opened. `--no-wait`
explicitly selects the default behavior. `--wait` waits up to 30000 ms;
`--wait --timeout 10000` sets a shorter approval wait. Timeout accepts
1–86400000 ms. Without `--wait`, it can shorten but cannot extend the one-second
snapshot budget. Budget expiry is resumable; approval requests expire after 24
hours. Denial, cancellation, and expiry return errors.

## Commands

```text
project show
project capabilities
project rename NAME
invitations create --email ADDRESS[,ADDRESS] [--link]
invitations create --kind ad-buyer --email ADDRESS[,ADDRESS]
                  [--screen-id IDS] [--slot-id IDS] [--policy trusted|review_required]
invitations list [--kind member|ad-buyer] [--status STATUS]
invitations revoke ID
agent status
agent enroll --email EMAIL [--project-name NAME] [--name NAME]
             [--intent signage|advertising] [--force]
agent connect [--name NAME] [--wait | --no-wait] [--timeout MS]
agent disconnect --yes [--allow-lockout]
dashboard open
dashboard reset-sign-in --email ADDRESS
app pack <directory> [--output FILE]
app upload <directory> [--name NAME] [--no-wait] [--poll-ms MS]
app update <id> <directory> [--expect-rev REVISION] [--no-wait] [--poll-ms MS]
app list
app show <id>
media generate (--prompt TEXT | --prompt-file FILE) [--aspect-ratio RATIO] [--quality low|medium|high] [--tag TAG]
                [--no-progress]
media upload <file> [--content-type TYPE] [--tag TAG] [--no-wait] [--poll-ms MS]
                    [--no-transcode] [--codec h264|hevc] [--max-fps N]
                    [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]
                    [--preset signage-1080p30|signage-4k30] [--no-audio]
media upload-batch <manifest.json> [--state FILE] [--concurrency N]
                   [--no-transcode] [--tag TAG] [--no-progress]
media show <id>
media download <id> [--output FILE]
media list [--tag TAG] [--primitive image|video]
media update <id> (--tag TAG | --clear-tag) [--expect-rev REVISION]
media delete <id> [--expect-rev REVISION]
compose catalog
compose render <file> [--output DIRECTORY] [--combined] [--target-width PX --target-height PX] [--safe-area]
                      [--open] [--lint-only]
compose batch <file> --output DIRECTORY [--only ID] [--target-width PX --target-height PX]
                      [--safe-area] [--lint-only]
playlist init <inputs...> --name NAME --output FILE [--overwrite] [--screen-id ID]
              [--target-width PX --target-height PX] [--duration-ms MS] [--fit contain|cover|fill]
              [--no-transcode] [--no-progress] [--poll-ms MS]
playlist replace-release <id> --page ID --primitive ID --release-id ID
                         [--apply] [--expect-rev REVISION] [--expect-impact TOKEN]
playlist preview <file|id> --output DIRECTORY [--contact-sheet] [--frame-ms MS] [--lint-only]
playlist templates
playlist validate <file>
playlist create <file>
playlist update <id> <file> [--expect-rev REVISION]
playlist export <id> --output DIRECTORY [--skip-applications]
playlist import <directory> [--name NAME] [--update ID [--expect-rev REVISION]]
playlist show <id> [--output FILE | --editable] [--overwrite]
playlist list
playlist delete <id> [--expect-rev REVISION]
screen pair <code> [--name NAME]
screen provision [--open | --print-url] [--name NAME]
browser setup --code CODE [--open]
screen update <id> [--name NAME] [--playlist-id ID] [--timezone ZONE] [--expect-rev REVISION]
screen list [--state archived] [--tag TAG]
screen show <id>
screen storage-forecast <id> --playlist-id ID [--playlist-rev REVISION]
screen publish <id> <file> [--expect-rev REVISION]
screen assign <id> --playlist-id ID [--expect-rev REVISION]
screen assign (<id> <id>... | --tag TAG) --playlist-id ID
screen tag <id> (--set TAGS | --add TAGS | --remove TAGS | --clear) [--expect-rev REVISION]
screen tag (<id> <id>... | --tag TAG) (--set TAGS | --add TAGS | --remove TAGS | --clear)
screen set-timezone <id> --timezone ZONE [--expect-rev REVISION]
screen archive <id> [--expect-rev REVISION]
screen unarchive <id> [--expect-rev REVISION]
screen recover <id> [--expect-rev REVISION]
screen reload <id> [--expect-rev REVISION]
screen reload (<id> <id>... | --tag TAG)
screen delete <id> [--expect-rev REVISION]
screen rotate-public-id <id> [--expect-rev REVISION]
screen toast (<id>... | --tag TAG) --text TEXT [--level info|alert|error] [--duration-ms MS]
screen screenshot <id> [--output FILE] [--timeout MS] [--poll-ms MS]
screen screenshot (<id> <id>... | --tag TAG) [--output DIRECTORY] [--concurrency 1-8]
                  [--timeout MS] [--poll-ms MS]
kv get --app-id ID <key>
kv set --app-id ID <key> --json-value JSON [--expect-rev REVISION]
kv set --app-id ID <key> --file FILE [--content-type TYPE] [--expect-rev REVISION]
kv set --app-id ID <key> --value-base64 BASE64 [--content-type TYPE] [--expect-rev REVISION]
kv delete --app-id ID <key> [--expect-rev REVISION]
kv list --app-id ID
comment show screen <id>
comment show playlist <id> [--page PAGE_ID]
comment set screen <id> (--json-value JSON | --file FILE)
comment set playlist <id> [--page PAGE_ID] (--json-value JSON | --file FILE)
comment delete screen <id>
comment delete playlist <id> [--page PAGE_ID]
operations show <id>
operations wait <id> [--timeout MS] [--poll-ms MS]
operations cancel <id>
webhooks create --url URL --event-types TYPES [--description TEXT] [--disabled]
webhooks list
webhooks show <id>
webhooks update <id> [--url URL] [--event-types TYPES] [--description TEXT | --clear-description]
                [--enable | --disable] [--expect-rev REVISION]
webhooks delete <id> [--expect-rev REVISION]
webhooks rotate-secret <id> [--expect-rev REVISION]
webhooks test <id>
webhooks deliveries <id> [--before CURSOR] [--limit N]
events list [--after CURSOR] [--limit N]
events follow [--after CURSOR] [--timeout MS]
playback list [--screen-id ID] [--media-id ID] [--day YYYY-MM-DD]
feedback bug <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback feature <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback list [--kind bug|feature]
doctor [--repair-config]
recovery list
recovery show <id>
recovery reconcile <id>
ads networks list
ads networks show <seller-project-id>
ads network show
ads network create --name NAME
ads network rate --rate-mcr-per-15s MCR --expect-rev REVISION
ads inventory list
ads inventory update <screen-id> [--enabled | --disabled] [--site-name NAME] [--city CITY]
                     [--region REGION] [--venue-type TYPE] [--audience-tags TOKENS]
                     [--placement TEXT] [--public-description TEXT]
                     [--rate-mcr-per-15s MCR | --clear-rate] [--expect-rev REVISION]
ads slots list
ads slots create --name NAME [--enabled | --disabled] [--accepted-media image,video]
                     [--max-image-duration-ms MS] [--max-video-duration-ms MS]
                     [--rate-mcr-per-15s MCR]
ads slots update <slot-id> [--enabled | --disabled] [--name NAME] [--accepted-media image,video]
                     [--max-image-duration-ms MS] [--max-video-duration-ms MS]
                     [--rate-mcr-per-15s MCR | --clear-rate] --expect-rev REVISION
ads memberships list
ads memberships update <membership-id> [--policy trusted|review_required]
                     [--screen-id IDS] [--slot-id IDS] --expect-rev REVISION
ads memberships revoke <membership-id>
ads creatives list
ads creatives create --media-id ID --copy TEXT
ads creatives show <creative-id>
ads campaigns list
ads campaigns show <campaign-id>
ads campaigns create <file>
ads campaigns update <campaign-id> <file> --expect-rev REVISION
ads campaigns preview <campaign-id> [--expect-rev REVISION]
ads campaigns activate <campaign-id> --quote-id ID --expect-rev REVISION
ads campaigns pause <campaign-id> --expect-rev REVISION
ads campaigns resume <campaign-id> --expect-rev REVISION
ads campaigns accept-rates <campaign-id> --quote-id ID --expect-rev REVISION
ads reviews list
ads reviews show <review-id>
ads reviews approve <review-id>
ads reviews reject <review-id> --reason TEXT
ads reports spend [--campaign-id ID]
ads reports delivery --from RFC3339 --to RFC3339
billing balance
billing statement [--cursor CURSOR] [--limit N]
version
```

Operational commands default to JSON envelopes. `--json` remains supported;
`--human` selects text and conflicts with `--json`. Help and bare command groups
remain readable by default; use `screenrig --json --help` for structured help.
`events follow` emits NDJSON. Progress goes to stderr, separately from stdout.

Global flags include `--json`, `--human`, `--api-url URL`, `--config PATH`,
`--request-id ID`, `--idempotency-key KEY`, and `--timeout MS`.

On `revision_conflict`, fetch the resource, reapply the intended change, and
retry with the returned revision. On an ambiguous transport failure, reuse the
same idempotency key.

`--if-match` remains an alias for `--expect-rev`; do not supply both.

### Fleet targeting

`screen assign`, `screen reload`, `screen toast`, and `screen tag` take several
screen ids or `--tag TAG`, never both, as one metered request for up to 500
screens. `--tag` selects active screens only. One screen id keeps the
single-screen route and envelope; `--expect-rev` applies only there. The fleet
envelope stays `ok: true` with `data.action`, `matched`, `succeeded`, `failed`,
and `results[]`; the exit code is the first failed screen's, with warning
`fleet_partial_failure`, and no match is exit 0 with `fleet_no_match`. Every
fleet request carries an automatic Idempotency-Key: after an interrupted
request (timeout or ambiguous transport failure), the identical rerun replays
finished screens. After a definite partial failure, retry only the failed ids.
Fleet `reload` and `toast` share a per-project budget of 600 screens per
minute: a larger request is refused whole with 429 `rate_limited` and
`Retry-After` before any screen is touched. Per-screen limits (reload 6 per
minute, toast 20 per minute) still apply, so single ids can fail with
`rate_limited`; retry them later. `screen screenshot` with
several ids or `--tag` writes `<screen_id>.webp` per screen into the
`--output` directory and refuses `--idempotency-key`. `--tag` matches at most
500 active screens with one billed list request; the captures are free.
Several ids must all be `scr_…` screen ids. An unexpected local failure
reports `unexpected_error` for that screen, starts no new captures, marks the
unstarted screens `not_attempted`, and exits 1. `screen publish` stays single-screen. See
[fleets](operations.md#fleets-tags-and-fleet-actions).

### Webhooks

`webhooks create` registers a public HTTPS endpoint (port 443 or 8443) for
exact event types or `prefix.*` prefixes, at most 10 per project. `create` and
`rotate-secret` return `data.secret` once with warning
`webhook_secret_shown_once`; store it in the receiver's secret store only.
`update` needs at least one change. A rejected URL is `webhook_url_rejected`
(exit 8), an eleventh webhook `webhook_limit_reached` (exit 5), and more than
20 `webhooks test` calls per minute `rate_limited` (exit 7). See
[webhooks](webhooks.md).

### Storage dry run

`screen storage-forecast <id> --playlist-id ID` answers whether a playlist fits
that screen's last reported storage before assignment. It writes nothing.
`fit` is `unknown` when the screen never reported storage or the playlist's
content is not ready. `--playlist-rev` refuses a playlist that changed since
you read it with `revision_conflict`. See
[Player storage](operations.md#player-storage).

### Browser setup

`browser setup --code CODE` claims a browser Player setup code for this
project and returns `player_public_url`, the fragment-free Player address for
the new screen; `--open` opens it. `screen provision --open` starts the same
handoff from the CLI side, and `--print-url` returns its handoff URL instead.
Treat a handoff URL as a credential: deliver it only to the intended display.

### Local write recovery

An ambiguous write keeps its idempotency key in the private config so the same
rerun replays instead of writing twice. `recovery list` and `recovery show ID`
read that local state without network requests: opaque recovery IDs,
timestamps, replay status and command names, never request contents or keys.
After checking the remote outcome, `recovery reconcile ID` removes that entry's
local retry protection. It does not retry, cancel, or undo the remote write.
