# Device health, reboot and display power

## What a screen can do

What a screen supports depends on its Player platform and hardware. Read the
host capabilities in `screen show` before promising a reboot or a
display power method; never infer them from the platform name alone.

```bash
screenrig screen show scr_EXAMPLE
```

## Device health

Every paired Player reports device health on session start and every five
minutes. `screen show` returns it as `data.health`; a field the Player did not
send is absent.

| Field | Meaning |
| --- | --- |
| `reported_at` | Server time of the latest report |
| `stale` | `true` after 15 minutes without a report; the last report stays visible |
| `uptime_s`, `app_uptime_s` | Device and Player uptime in seconds |
| `memory.used_bytes`, `memory.total_bytes` | Memory in use |
| `cpu.load_1m`, `cpu.cores` | CPU load and cores |
| `temperature_c` | Device temperature |
| `display.connected`, `display.power` | Display connection and power (`on`, `off`, `standby`, `unknown`) |
| `network.kind`, `network.wifi_rssi_dbm` | `ethernet`, `wifi`, `cellular` or `unknown`, and Wi-Fi signal |
| `crashes_24h`, `renderer_restarts_24h` | Crashes and renderer restarts in the last 24 hours |

A screen needs attention when its display is disconnected, it runs hot (80 °C
or more), it is crashing (3 or more crashes in 24 hours), or its health is
stale. `screen list --human` adds a `HEALTH` column naming those conditions.
Health is read-only information, never authorization.

Stale health with `online: false` is a dead or unplugged screen; see
[dead screens](operations.md#detect-dead-screens). Stale health on an online
screen means the Player stopped reporting health; check events and a
screenshot before acting.

### Alert on health changes

Transitions arrive as `screen.health_changed` events with `details.changes`, a
list of `{change, ...}`:

- `display_disconnected`, `display_reconnected`
- `display_power` (`from`, `to`)
- `temperature_high` (at or above 80 °C), `temperature_normal` (below 75 °C
  again)
- `crash_spike`, `renderer_restart_spike` (the 24-hour count rose by 3 or more
  since the last spike event)

Read them with `events list` or `events follow`. To page someone or wake an
agent without holding a stream open, point a webhook at them:

```bash
screenrig webhooks create --url https://hooks.example.com/screens --event-types "screen.health_changed,screen.offline"
```

See [webhooks](webhooks.md). `screen.*` events are unbilled.

## Reboot

```bash
screenrig screen reboot scr_LOBBY [--expect-rev REVISION]
screenrig screen reboot scr_A scr_B --yes
screenrig screen reboot --tag Lobby --yes
```

- Only a Player that declares the `reboot` capability in its host report
  receives a reboot. Any other screen is refused with `reboot_unsupported`
  (exit 5) and nothing is sent. `screen reload` refreshes content without a
  device reboot; try it first for stale content.
- The answer carries `reboot_id` and `expires_at`: the request expires after
  ten minutes, and a Player acts on one `reboot_id` at most once.
- Each screen accepts at most 2 reboots per 10 minutes. A refused or failed
  request and an exact replay do not count.
- The CLI never prompts, so several ids or `--tag` require `--yes`. Confirm a
  fleet reboot with the user first: every screen goes dark while it restarts.
- Fleet results follow the [fleet rules](operations.md#fleets-tags-and-fleet-actions).
- Verify with `screen.reboot_requested` in `events list`, then the screen's
  `screen.online` and a fresh `health.reported_at` with a small `uptime_s`.

## Display power

### Turn a display on or off now

```bash
screenrig screen display scr_LOBBY --power off --for 2h
screenrig screen display scr_LOBBY --power off --until 2026-10-01T07:00:00Z
screenrig screen display --tag Lobby --power on
screenrig screen display clear scr_LOBBY
screenrig screen display clear --tag Lobby
```

`screen display` is a manual override of the display schedule. `--power on|off`
sets it (a trailing `on` or `off` after the ids is the same).

- `--until` takes a strict RFC 3339 instant, in the future and at most 7 days
  ahead. `--for` takes a duration up to `6d23h59m`.
- Without either, the override ends at the display schedule's next boundary.
  A later schedule or timezone change moves that end to the new boundary.
  With no boundary in the next eight days (for example no enabled schedule),
  it holds until `screen display clear` or a replacement.
- `screen display clear` ends the override; the schedule applies again, and
  without one the display is on.
- A screen still waiting to pair answers `resource_conflict` (exit 5). A
  display schedule can still be set before pairing.

### Display schedule

```bash
screenrig screen display-schedule show scr_LOBBY
screenrig screen display-schedule set scr_LOBBY --file hours.json [--expect-rev REVISION]
screenrig screen display-schedule set --tag Cafe --file hours.json
screenrig screen display-schedule clear scr_LOBBY
```

A display schedule lists 1 to 16 windows when the display is **on**, in the
screen timezone (set one first with `screen set-timezone`). Outside every
window the display goes to standby. The Player evaluates it offline, so it
keeps working when the network drops.

```json
{"enabled": true, "windows": [{"days": ["mon", "tue", "wed", "thu", "fri"], "start": "07:00", "end": "19:00"}, {"days": ["sat"]}]}
```

A window whose `end` is at or before its `start` crosses midnight; a window
without `start` and `end` covers the whole day. `enabled: false` keeps the
windows and leaves the display on. The output of `display-schedule show` can be
edited and sent back with `set --file`.

This controls the panel's power. To change what plays by time of day, use
[playlist schedules](schedules.md).

### Requested versus reported power

`screen show` returns `display`:

- `requested` (`on` or `off`) is what the screen should show now: the active
  override, else the enabled schedule, else on; `source` says which
  (`override`, `schedule` or `default`), and `until` when that next changes.
- `reported` is what the Player achieved: `power` (`on`, `off`, `standby`,
  `unknown`), `connected`, `reported_at`, and `stale` after 15 minutes without
  a report.

The Player applies every change at once and reports the result. Compare
`requested` with `reported.power`; a mismatch means the display did not follow.
How the Player switches the panel (HDMI-CEC, DDC/CI, backlight, or a black
scrim over the content) depends on the Player platform and the connected
display; a scrim darkens the picture while the panel stays powered. Check the
host capabilities in `screen show`, and confirm with the human at the display
before telling the user a panel is physically off. `screen.display_changed`
events record each change.
