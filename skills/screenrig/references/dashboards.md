# Live dashboards on screens

A Grafana dashboard or panel, or a Power BI report, plays as an `iframe`
primitive ([Power BI](#power-bi) below). A Grafana view: the server draws it
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
- Tableau is not available through this command group; use a public link in an
  `iframe` `src`, or an application.

## Power BI

A report plays as an `iframe` primitive that embeds it with a view-only token
the server generates (Power BI "app owns data") and renews before it expires. A
screen never holds the client secret, and the report needs no Power BI sign-in.

### What the user does in Microsoft, once

1. In Microsoft Entra, register an app (single tenant, no redirect URI, **no API
   permissions**) and add a **client secret**. Ask the user to save the secret's
   **Value** (not its ID) to a file for you; never take it as an argument or print
   it. Note the app's **Application (client) ID** and the **Directory (tenant)
   ID**.
2. A Power BI admin opens the admin portal, Tenant settings, Developer settings,
   and turns on **Embed content in apps** and **Service principals can call
   Fabric public APIs** (older portals call the second one "Allow service
   principals to use Power BI APIs" or "Service principals can use Fabric APIs")
   for the organization or a security group that holds the app.
3. In each workspace to show: Workspace access, add the app as **Member** or
   **Admin**. My workspace is not available to an app.
4. For production the workspace must sit on a **Fabric (F), Power BI Embedded
   (A) or Premium (P/EM)** capacity. Commercial cloud only.

### The flow

```sh
screenrig bi connection create powerbi --tenant-id TENANT --client-id APP_ID --secret-file secret.txt
screenrig bi connection test bic_ID                       # counts the workspaces the app sees
screenrig bi connection browse bic_ID                     # workspaces and their ids
screenrig bi connection browse bic_ID --workspace WS_ID   # that workspace's reports
screenrig bi view create --connection-id bic_ID --workspace WS_ID --report REPORT_ID --refresh 5m
screenrig bi view test biv_ID                             # generates a real embed token
```

`--url` takes a report address copied from Power BI
(`https://app.powerbi.com/groups/WS/reports/REPORT`, optionally ending in a
`/ReportSection...` page). `--page NAME` (repeat it, by page name or display
name) picks pages and `--all-pages` takes every visible one; two or more pages
need `--rotate 10s..1h`, and `--rotate` needs two or more pages. `--refresh` is
60s to 24h (default 5m), or `0` for a report that updates itself (DirectQuery,
automatic page refresh). Put `embed_url` in an `iframe` primitive as above.

A **Publish to web** link, `bi view create --public-url 'https://app.powerbi.com/view?r=KEY'`,
needs no connection and plays as Power BI serves it, reloaded every `--refresh`,
without page rotation. Publish to web makes the report public to anyone with the
link: tell the user before using it.

### Power BI errors

- `bi_upstream_refused` on the connection test or `bi view test`: the detail
  names the cause. 401 or 403 is the Developer tenant settings or the app's role
  in the workspace. An `AADSTS7000215` code is a secret ID given instead of its
  Value; `AADSTS700016` or `AADSTS90002` is a wrong client or tenant ID. Fix with
  `bi connection update ID --secret-file FILE` (or `--client-id`, `--tenant-id`).
- A test that sees no workspaces fails: add the app to a workspace.
- A dataset with row-level security cannot be shown: Power BI refuses its embed
  token, and the test shows its message.
- A test does not judge capacity or what the report shows; look at the screen.
