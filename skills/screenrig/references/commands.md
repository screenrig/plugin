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

### Connect an existing account

```sh
screenrig agent connect --print-url
```

By default, this starts or resumes an approval request and reads one status
snapshot for at most one second. A successful pending result means submission,
not activation: `data.request_submitted` is `true` and `data.connection_complete`
is `false`. Send the handoff from `data.approval_url` to the intended user, then
resume with `data.next.argv` or `screenrig agent connect`. The argument array
preserves the selected config and API origin. Activation returns `data.status:
active` and `data.connection_complete: true`, without returning a credential.

If no snapshot arrives, `data.status_checked` is `false`; do not infer current
approval state from that result. Without `--print-url`, the CLI tries to open the
browser and includes the handoff URL only if opening fails. `--no-wait` explicitly
selects the default behavior. `--wait` waits up to 30000 ms; `--wait --timeout 10000`
sets a shorter approval wait. Timeout accepts 1–86400000 ms. Without `--wait`, it
can shorten but cannot extend the one-second snapshot budget. Budget expiry is
resumable; approval requests expire after 24 hours. Denial, cancellation, and
expiry return errors.

## Commands

```text
account show
agent status
agent enroll --email EMAIL
agent connect [--name NAME] [--print-url] [--wait | --no-wait] [--timeout MS]
agent disconnect --yes [--allow-lockout]
dashboard [--print-url]
app pack <directory> [--output FILE]
app upload <directory> [--name NAME] [--no-wait] [--poll-ms MS]
app update <id> <directory> --expect-rev REVISION [--no-wait] [--poll-ms MS]
app list
app show <id>
media generate (--prompt TEXT | --prompt-file FILE) [--aspect-ratio RATIO] [--quality low|medium|high] [--tag TAG]
                [--no-progress]
media upload <file> [--content-type TYPE] [--tag TAG] [--no-wait] [--poll-ms MS]
                    [--no-transcode] [--codec h264|hevc] [--max-fps N]
                    [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]
                    [--preset signage-1080p30|signage-4k30] [--no-audio]
media upload-batch <manifest.json> --state FILE [--concurrency N]
                   [--no-transcode] [--tag TAG] [--no-progress]
media show <id>
media download <id> [--output FILE]
media list [--tag TAG] [--primitive image|video]
media update <id> (--tag TAG | --clear-tag) --expect-rev REVISION
media delete <id> --expect-rev REVISION
compose catalog
compose render <file> [--output DIRECTORY] [--combined] [--target-width PX --target-height PX] [--safe-area]
                      [--open] [--lint-only]
compose batch <file> --output DIRECTORY [--only ID] [--target-width PX --target-height PX]
                      [--safe-area] [--lint-only]
playlist init <inputs...> --name NAME --output FILE [--screen-id ID]
              [--target-width PX --target-height PX] [--duration-ms MS] [--fit contain|cover|fill]
              [--no-transcode] [--no-progress] [--poll-ms MS]
playlist replace-release <id> --page ID --primitive ID --release-id ID
                         [--apply --expect-rev REVISION --expect-impact TOKEN]
playlist preview <file|id> --output DIRECTORY [--contact-sheet] [--frame-ms MS] [--lint-only]
playlist templates
playlist validate <file>
playlist create <file>
playlist update <id> <file> --expect-rev REVISION
playlist export <id> --output DIRECTORY
playlist import <directory> [--name NAME] [--update ID --expect-rev REVISION]
playlist show <id> [--output FILE | --editable]
playlist list
playlist delete <id> --expect-rev REVISION
screen pair <code> [--name NAME]
screen provision (--open | --print-url) [--name NAME]
screen update <id> [--name NAME] [--playlist-id ID] [--timezone ZONE]
                   --expect-rev REVISION
screen list [--state archived]
screen show <id>
screen publish <id> <file> --expect-rev REVISION
screen assign <id> --playlist-id ID --expect-rev REVISION
screen set-timezone <id> --timezone ZONE --expect-rev REVISION
screen archive <id> --expect-rev REVISION
screen unarchive <id> --expect-rev REVISION
screen delete <id> --expect-rev REVISION
screen rotate-public-id <id> --expect-rev REVISION
screen toast <id> --text TEXT [--level info] [--duration-ms MS]
screen screenshot <id> [--output FILE] [--timeout MS] [--poll-ms MS]
kv get --app-id ID <key>
kv set --app-id ID <key> --json-value JSON [--expect-rev REVISION]
kv set --app-id ID <key> --file FILE --content-type TYPE [--expect-rev REVISION]
kv set --app-id ID <key> --value-base64 BASE64 --content-type TYPE [--expect-rev REVISION]
kv delete --app-id ID <key> --expect-rev REVISION
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
