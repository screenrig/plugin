# Keep a SharePoint or OneDrive folder, or a Canva design, in step with the library

Use it when a person's images, videos or audio live in a SharePoint or OneDrive
for work folder, or when a Canva design is the content, and screens must follow
it without uploading again. A sync imports the files into a media folder,
replaces the bytes of a changed file under the same media ID (every playlist
that plays it updates, with no republish) and takes a file removed at the source
out of play. SharePoint reads through the customer's own Microsoft Entra app;
Canva reads through a person's Canva account (see "A Canva design" below).
Office files and PDFs are not media: show those with a document link in a
playlist.

## The app, done by a Microsoft 365 administrator

Ask the person to do this once and give you three values, never the secret in
chat if a file will do:

1. Microsoft Entra admin center, App registrations, New registration: one
   tenant only, no redirect URI. Note the **Directory (tenant) ID** and the
   **Application (client) ID**.
2. Certificates & secrets, New client secret. Copy its **Value** (not the
   Secret ID) into a file such as `secret.txt`. A secret expires, so note when.
3. API permissions, Add, Microsoft Graph, **Application permissions**, then
   one of:
   - **Sites.Selected** (the narrow choice). Then grant the app each site with
     `POST https://graph.microsoft.com/v1.0/sites/SITE-ID/permissions` and body
     `{"roles": ["read"], "grantedToIdentities": [{"application": {"id":
     "CLIENT-ID", "displayName": "screenRIG sync"}}]}`, sent by an
     administrator (Graph Explorer or a script).
   - **Files.Read.All**: every site and drive, and the only grant a sharing
     link needs.
4. Grant admin consent for the tenant.

## The flow

```sh
screenrig media sync account add microsoft365 --name Contoso \
  --tenant-id contoso.onmicrosoft.com --client-id CLIENT-ID --secret-file secret.txt
screenrig media sync account test msa_ID          # credentials and the roles the token carries
screenrig media sync create sharepoint --account-id msa_ID \
  --url "https://TENANT.sharepoint.com/sites/SITE/LIBRARY/FOLDER" [--every 15m]
screenrig media sync show msy_ID                  # what the last run did
```

- Paste the folder's address from the browser, or its sharing link (Share, Copy
  link). A site address works with Sites.Selected once the site is granted; a
  sharing link or an OneDrive for work address needs Files.Read.All. Personal
  OneDrive (onedrive.live.com, 1drv.ms) cannot be read.
- Create reads the folder first. `media_sync_source_refused` names the grant to
  fix; nothing is stored until it works. The first run starts within about 30
  seconds; `media sync run ID` runs one now.
- Only files directly in the folder sync; subfolders are skipped. png, jpeg,
  webp, gif, mp4, webm and mp3 import; others appear in `data.last_run.skipped`
  with the reason (`unsupported_type`, `too_large`, `unreadable`, `storage`,
  `download_failed`, `subfolder`, `in_use`). A run is `partial` while a file
  that should sync did not; the next run tries again.
- The sync fills a media folder (`--folder-id mfd_ID`, or a new one named after
  the source). Play it with a `folder` selector in an `image` or `video`
  primitive, once; it then follows the source, and a page of several files needs
  `one_at_a_time: true` unless it is a `media_end` page:
  `"selector": {"by": "folder", "folder_id": "mfd_ID", "one_at_a_time": true}`.
- A file removed at the source is deleted. While a screen still shows it, it
  waits in a `Removed` subfolder (selectors stop playing it) and a later run
  deletes it (`pending_delete` counts these).
- `state: error` needs a repair: the media folder was deleted (`media sync
  update ID --folder-id mfd_ID`) or the source folder was deleted or moved
  (delete the sync and create one for its new address).
- Replace an expiring secret with `media sync account update msa_ID
  --secret-file new.txt`. `media sync delete ID` stops the sync and keeps the
  media; `media sync account delete ID` is refused while a sync uses it.

Creating accounts and syncs needs Manage access. Accounts and syncs belong to
one project. The secret is sealed on the server and shown only as its last four
characters; pass it only with `--secret-file`.

## A Canva design

A sync can follow a Canva design: its pages become images (or one video) in a
media folder and are replaced under the same media IDs whenever the design
changes in Canva. screenRIG is the Canva integration; a person signs in to Canva
once and the connection belongs to the project, so syncs keep running when
people change.

```sh
screenrig media sync account add canva --name "Marketing Canva"   # prints data.authorize_url
```

Send that link to the person who owns the Canva account (or open it yourself if
that is you). They open it in a browser signed in to Canva and allow access; the
page then says Canva is connected. The link works once, for about 15 minutes,
and the CLI never opens a browser. Then:

```sh
screenrig media sync account show msa_ID                  # state ready once they consented
screenrig media sync account designs msa_ID --query menu  # ids, titles, page counts
screenrig media sync create canva --account-id msa_ID --design DESIGN_ID_OR_URL \
  [--pages 1,3-5] [--format png|mp4] [--folder-id mfd_ID] [--every 15m]
```

- `png` (default) makes one image per page named "TITLE - page N.png"; `mp4`
  makes one video. Pass a design id or its canva.com/design/ID/... address.
  Documents and presentations export as page images; there is no PDF format.
- Each run asks Canva when the design last changed and exports only when it
  moved (`media sync run msy_ID --force` exports anyway). Long videos take
  minutes. A page the design no longer has leaves play like a removed file.
  Play the folder with a `folder` selector, as above.
- `canva_reconnect_required` (the person left Canva or revoked access): run
  `media sync account connect msa_ID` and send the new link. `state: error` with
  `design_unavailable` means the connected person can no longer open the design;
  the media is kept.
- `media sync account delete msa_ID` (after deleting its syncs) ends the
  connection at Canva; the imported media stays.
- `canva_not_configured` means this server has no Canva integration: tell the
  person; nothing can be done from the CLI.
