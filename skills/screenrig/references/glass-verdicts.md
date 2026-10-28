# Glass verdicts

ScreenRig also checks what a screen shows, from the reports it receives and never by asking the Player. A verdict appears in `screen show ID` (`data.glass`), in `alerts` and in `notifications`. Each check prefers missing a problem to raising a false one: no verdict means "fine or not judged", never "proven playing".

## loop_stalled: the playlist stopped advancing

The screen is online, its display is on, its content is current and its Player reports nothing wrong, yet no image or video start has reached ScreenRig for 1.5 times its loop's longest run between media starts (at least a minute) plus three minutes of reporting slack. That points to a hung renderer, a stalled decoder or a Player that stopped advancing. It says what `not_playing` (the Player reports an error), `content_stuck` (the update), `screen_offline` and `display_disconnected` cannot.

- Read it: `screen show ID` prints "Playlist stalled since ..." and `data.glass.playback` has `verdict` `stalled`, `since`, `last_media_start_at` and `threshold_s`. `alerts list` shows it as condition `loop_stalled`; `notifications create ... --conditions loop_stalled` announces it after `--hold` minutes.
- Act on it: look with `screen screenshot ID`, then `screen reload ID`. It clears by itself when the next media start arrives (`verdict` `playing`), or when the screen stops being judged (`unjudged`: it went offline, was archived, or a takeover began).
- Late reports: Players report in batches, so a screen that kept playing can look stalled until its reports land. The clearing event carries `late_reports` when the Player's play numbers show it.

It does not judge a screen whose Player sends no play numbers, a loop of one page, a loop with no page that always starts media or with a page of unknown length (adslot break, application-timed page, media chosen when the loop runs), a video wall, a display that is off, standing by or disconnected, a takeover or suspension, an offline screen, an error status, an update that is not current, or anything while no screen at all reported a media start in two minutes. New content (a playlist edit, an update, the end of any state above) restarts the clock.
