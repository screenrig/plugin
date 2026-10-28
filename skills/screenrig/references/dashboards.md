# Live dashboards on screens

A Grafana dashboard or panel plays as an `iframe` primitive. The server draws it
as a PNG through Grafana's image renderer on a cadence and shares each render
among screens of the same size; a screen never talks to Grafana and keeps the
last image if Grafana fails. A connection's token stays on the server, sealed,
and no playlist holds a credential.

## What the user does in Grafana

1. Install the **Grafana Image Renderer**, as the plugin or as the remote
   rendering service. Without it nothing renders.
2. Create a **service account** with the **Viewer** role and add a token. Ask
   the user to save the token to a file for you; never take it as an argument
   or print it.
3. For a **public dashboard** (no connection needed), the user sets
   `allow_embedding` in Grafana's settings, because that page plays live from
   Grafana.

Grafana must be reachable from the public Internet: a private or reserved
address is refused.

## The flow

```sh
screenrig bi connection create grafana --url https://grafana.example.com --token-file token.txt
screenrig bi connection test bic_ID
screenrig bi connection browse bic_ID --query lobby      # dashboards and uids
screenrig bi connection browse bic_ID --dashboard UID    # its panels
screenrig bi view create --connection-id bic_ID --dashboard UID --panel 4 --from now-6h --var host=web1 --refresh 5m
screenrig bi view test biv_ID --output check.png         # open the image before publishing
```

`--url` accepts a dashboard address copied from the browser (quote it:
`--url 'https://grafana.example.com/d/UID/name?viewPanel=4&var-host=web1'`) and
reads the panel, time range, variables and theme from it. A public dashboard is
`bi view create --public-url URL` with no connection. `--refresh` is 30s to 24h
(default 5m); `--fit contain|cover|fill` sets how the image fills the screen.

`bi view create` prints `embed_url`. Put it in an `iframe` primitive:

```json
{"id": "kpis", "primitive": "iframe", "src": "EMBED_URL", "title": "Ops dashboard", "rect": {"x": 0, "y": 0, "width": 1920, "height": 1080}, "layer": 0, "content_fit": "fill"}
```

Then publish as usual (`playlist create`, `screen assign`). Edit a view with
`bi view update`: screens pick up a new target at their next refresh without a
republish.

## Rules and errors

- `bi connection test` checks the token and lists the Image Renderer plugin; a
  plugin that is not listed only warns, because a remote renderer does not show
  as one. `bi view test` renders for real and is the check that counts.
- `bi_upstream_refused` (exit 5): Grafana refused the token; fix it with
  `bi connection update ID --token-file FILE`. `bi_upstream_unavailable`
  (exit 9): Grafana is unreachable, not public, timed out or has no renderer; the
  detail says which.
- A view plays only on screens of its own project. A playlist exported to
  another project shows `forbidden` there: create a view in that project.
- Deleting a view leaves screens showing it with `not_found` until their
  playlist changes. A connection that views use cannot be deleted.
- The page on glass shows no text except an error code, or the time of a stale
  image in a corner: read `bi view show ID` for `status.last_error`.
- Power BI and Tableau are not available through this command group; use a
  public link in an `iframe` `src`, or an application.
