# Advertising

Advertising runs on the same account, the same balance, and the same CLI as
signage. `advertiser` and `screens` are independent account features, not account
types and not billing plans: an account can buy ads, sell its own inventory,
do both, or do neither. Read the effective capabilities first, never infer
permission from a plan name or a screen quota of zero.

```bash
screenrig account capabilities
```

Capabilities are named `media`, `credits`, `signage.pairing`,
`signage.playlists`, `signage.publish`, and `advertising`. Advertising-only
accounts (`advertiser=true`, `screens=false`) buy and manage campaigns and create
media, but cannot pair devices, author playlists, or publish. Selling also
requires owned, opted-in inventory. A server denial wins over anything cached
here; refresh capabilities to diagnose instead of retrying through another route.

## Credits: one balance, and what is not available

Every account has one prepaid balance shared by ordinary usage, AI generation,
and advertising. Ad purchase is charged per completed play at the seller's
advertised rate: a reservation is held before the play and the charge is settled
only for a valid full completion.

| Credit source | AI generation | Paid ad spend | Withdrawal |
| --- | --- | --- | --- |
| Purchased | Yes | Yes, with valid funding lineage | No |
| Ad-earned | Yes | Yes, in another invited network | Unspent, matured portion only |
| Promotional, included, or manual grant | Under the grant's rules | No | No |

Ad-earned credits automatically pay normal platform costs. Self-promotion uses
ordinary playlist content, never a paid campaign against the account's own
network.

```bash
screenrig billing balance
screenrig billing statement --limit 20
```

`billing balance` reports remaining, reserved, and available credits with their
source breakdown, plus the withdrawal section as the server states it. Unmatured
earned credits are available for usage but not for cash-out, and they are not a
second balance. `billing statement` pages posted journal entries by a stable
cursor: top-ups, generation, gross ad income, the ad-serving fee, ordinary usage,
corrections, and completed withdrawals. Reservations appear as holds, not as
posted spend.

Cash is not available through this CLI. While the payment rails are unconfigured,
the server reports `withdrawal.rails_available: false` with
`unavailable_reason: financial_rails_unavailable`, and the buyer/seller checkout
and payout routes answer `billing_unavailable`. Do not retry those operations,
do not invent a payment command, and do not describe a displayed balance or an
"eligible" amount as money already paid out: a payout and its bank settlement are
separate facts, and a verified financial administrator performs them in the
dashboard with a fresh confirmation. There is no credited-income shortcut here.

## Buying ads

1. **Membership.** A human claims an email-bound invitation in the dashboard;
   the claiming user's own verified email must match the invited address. After
   claiming, the dashboard's Marketplace lists the sellers this account has
   been invited to and each seller's permitted inventory and rates; admission
   stays invitation-only, with no public listings to browse. The CLI reads the
   resulting membership and never handles an invitation as a credential or
   assumes the seller's identity.

   ```bash
   screenrig ads networks list
   screenrig ads networks show SELLER_ACCOUNT_ID
   ```

2. **Inventory and rates.** `ads networks show` lists the screens, slots, tags,
   formats, duration limits, and per-completed-play prices this membership
   permits. Screen count is not a guaranteed number of impressions, and an empty
   screen or slot list means no permission.

3. **Balance and spend authority.** Read `billing balance` before drafting.
   Campaign budgets are distinct from AI generation and other account usage even
   though both draw on the one balance.

4. **Creative.** Create or upload the media with the normal media commands, then
   bind the ready media to a creative. Binding does not upload or charge the
   media again, and generated copy or imagery is billed to this account.

   ```bash
   screenrig media upload poster.png --tag Lobby
   screenrig ads creatives create --media-id MEDIA_ID --copy "Half-price passes this week"
   screenrig ads creatives show CREATIVE_ID
   ```

5. **Draft.** A campaign draft selects the creative versions, networks, inventory
   scope, flight and dayparts, image display duration, maximum play price, and
   daily and lifetime credit caps. The image duration is chosen here
   (`image_duration_ms`, 5000–30000 ms, ten seconds when omitted; a video plays
   to its own verified length), and `max_play_price_mcr` optionally caps the
   per-play price as a decimal mcr string with no ceiling when omitted. Drafting
   is free: a draft reserves no credits, is not deliverable, and no request in
   this CLI creates a paid booking or a prepaid invoice. Money is decimal mcr
   strings, never numbers, and both price knobs live at the campaign root — the
   creative binds only `media_id` and `copy`, and a network entry carries only
   scope, identifiers, and its optional `network_cap_mcr`.

   ```json
   {
     "name": "September lobby sponsor",
     "daily_cap_mcr": "20000000",
     "lifetime_cap_mcr": "200000000",
     "image_duration_ms": 10000,
     "max_play_price_mcr": "250000",
     "flight_start": "2026-09-23T00:00:00Z",
     "flight_end": "2026-09-30T23:59:59Z",
     "networks": [
       {
         "seller_account_id": "acc_SELLER",
         "screen_ids": ["scr_LOBBY"],
         "slot_ids": ["ads_LOBBY"],
         "creative_ids": ["cre_LOBBY_POSTER"],
         "network_cap_mcr": "100000000"
       }
     ]
   }
   ```

   ```bash
   screenrig ads campaigns create campaign.json
   screenrig ads campaigns show CAMPAIGN_ID
   ```

6. **Preview, then accept.** `ads campaigns preview` returns a time-bounded quote
   with each cell's play price and fee. The quote is the acceptance artifact and
   it spends nothing. Present the prices, flight, and caps to the user, and treat
   "draft an ad" as no permission to buy.

   ```bash
   screenrig ads campaigns preview CAMPAIGN_ID
   ```

7. **Activate under explicit authority.** Activation submits that exact quote ID
   with the campaign revision it priced. Repeating it returns the same accepted
   purchase; the same key with different input is a conflict. Activation accepts
   the terms and reserves nothing: the per-occurrence hold is placed when the
   runtime resolves a play, and it settles only on the verified completion. A
   campaign may be pending review after price acceptance; pending review is not
   running.

   ```bash
   screenrig ads campaigns activate CAMPAIGN_ID --quote-id QUOTE_ID --expect-rev REVISION
   ```

8. **Verify and operate.** Campaign state, creative review, delivery evidence and
   credit debits are separate facts. `ads reports spend` shows this account's own
   debit and campaign evidence, not a seller's other income. Only authorized
   completed-play evidence establishes billable delivery. `pause` and `resume`
   each require the current campaign revision, and `resume` clears only a manual
   pause — a `price_change_pending` block needs the fresh quote accepted below.

   ```bash
   screenrig ads reports spend --campaign-id CAMPAIGN_ID
   screenrig ads campaigns pause CAMPAIGN_ID --expect-rev REVISION
   screenrig ads campaigns resume CAMPAIGN_ID --expect-rev REVISION
   ```

When credits are insufficient, explain the restriction and send the user to the
dashboard to add credits. Adding credits restores future affordability; it never
clears a price-change pause, a revoked membership, or a pending review.

### Price changes require fresh acceptance

A seller rate change pauses every affected campaign with `price_change_pending`,
including a decrease, and the block is sticky: a top-up, a price ceiling, a
schedule tick, or an ordinary `ads campaigns resume` cannot clear it. Re-quote and
let the buyer explicitly accept:

```bash
screenrig ads campaigns preview CAMPAIGN_ID
screenrig ads campaigns accept-rates CAMPAIGN_ID --quote-id NEW_QUOTE_ID --expect-rev REVISION
```

An expired or stale quote is rejected with `quote_stale`, never accepted at
another price. Already-issued plays finish at their reserved price, and spent or
reserved counters survive pause, resume, and reacceptance. Accepting a quote is
not a promise of playback and does not clear an outstanding review.

## Selling inventory

Sellers can manage buyer access without an agent: open **Invitations** in the
dashboard to send email invitations, list the invited buyers, edit inventory
access, cancel pending invitations, or revoke a buyer's access. The list retains
revoked buyers and financial history. The CLI workflow below is optional.

1. **Network and default rate.** A seller sets its own positive default rate per
   15 seconds of completed playback before enabling paid supply. ScreenRig does
   not invent a market price, and the serving fee is separate and
   ScreenRig-controlled (Standard 30%, Premium 20%, Enterprise 10%).

   ```bash
   screenrig ads network show
   screenrig ads network create --name "Main Street Centre"
   screenrig ads network rate --rate-mcr-per-15s 150000 --expect-rev REVISION
   ```

2. **Inventory.** Opt each owned screen in and describe the venue, placement, and
   public audience tags. Tags are public metadata, at most 20 normalized tokens;
   never invent individual demographics. A rate override on a screen or slot
   inherits from the next level when cleared.

   ```bash
   screenrig ads inventory list
   screenrig ads inventory update SCREEN_ID --enabled --site-name "Main Street Centre" --city Winnipeg --region MB
   screenrig ads inventory update SCREEN_ID --rate-mcr-per-15s 200000
   screenrig ads inventory update SCREEN_ID --clear-rate
   ```

3. **Slots and play prices.** A slot definition carries accepted media kinds,
   duration limits, and an enabled state: a new slot is enabled, `--disabled`
   keeps it unavailable for paid playback, and an update writes the stored
   definition back whole under its current revision, so flags you omit keep the
   stored values. Its rate is a pricing unit per 15 seconds, not a required
   creative duration: the charge for a play is the rate scaled by the approved
   duration, rounded up once. Images run 5–30 seconds and are muted; videos are
   played to their natural end and overlong creatives are rejected, not
   truncated.

   ```bash
   screenrig ads slots list
   screenrig ads slots create --name "Lobby break" --accepted-media image,video
   screenrig ads slots update SLOT_ID --max-video-duration-ms 60000 --expect-rev REVISION
   ```

4. **Invitations.** Invite intended recipients with an explicit inventory scope
   and a trusted or review-required policy. Each response item carries its claim
   token exactly once: treat that token as a secret, deliver it only to its
   recipient, and never paste it into chat, logs, or a ticket. The invitation is
   single use and expires after seven days; sending one changes no account.

   ```bash
   screenrig ads invites create --email buyer@example.com --screen-id SCREEN_ID --slot-id SLOT_ID --policy review_required
   screenrig ads invites list
   screenrig ads invites revoke INVITATION_ID
   ```

5. **Memberships.** Scope changes and revocations stop new selections and
   invalidate unstarted decisions while preserving financial history. Revoking one
   network membership does not clear the buyer's advertiser flag or its other
   memberships.

   ```bash
   screenrig ads memberships list
   screenrig ads memberships update MEMBERSHIP_ID --policy trusted --expect-rev REVISION
   screenrig ads memberships revoke MEMBERSHIP_ID
   ```

6. **Reviews.** Review-required members need approval of the exact submitted
   version. `ads reviews show` returns that submission's review and the exact
   creative it decided on — never the buyer's wider media library, budgets, or
   other campaigns. Approval does not choose the buyer's budget and does not
   grant access to its media library.

   ```bash
   screenrig ads reviews list
   screenrig ads reviews show REVIEW_ID
   screenrig ads reviews approve REVIEW_ID
   screenrig ads reviews reject REVIEW_ID --reason "Logo is unreadable at ten seconds"
   ```

7. **Place the ad break.** A slot definition alone does not put an ad break into a
   playlist. Place an adslot page through playlist authoring, keeping at least one
   ordinary page with no visibility rule as the fallback, and check that the
   assigned Players support the adslot capability: a Player without it is served
   the same playlist's house content only, never a paid ad. Adslot pages accept
   `id`, `type`, `adslot_id`, and an optional `visibility` schedule only — no
   canvas, primitives, creative, price, or client-chosen duration is stored.

   ```bash
   screenrig playlist create ad-breaks.json
   screenrig playlist validate ad-breaks.json
   screenrig screen publish SCREEN_ID ad-breaks.json
   ```

   A v1 read or write of an ad-bearing playlist answers with the explicit
   `version_required` conflict and the CLI retries the v2 union; the CLI never
   filters an ad break out of a document.

8. **Report.** A seller sees gross ad income, the serving-fee debit, and net
   credits for its own delivery, plus eligible, empty, failed, and completed
   outcomes. That is playback evidence, not an audited human audience count.

   ```bash
   screenrig ads reports delivery --from 2026-09-01T00:00:00Z --to 2026-09-08T00:00:00Z
   ```

9. **Withdrawals.** Explain unused earned credits, the threshold, and any holds;
   route the verified financial administrator to the dashboard step-up flow. This
   agent does not hold payout or bank-change authority, and current rails are
   reported unavailable. For owned-screen observation use the existing
   screenshot and device tools; API acceptance is not observed playback.

## Failure cases

- `capability_required` — the account's capability set does not grant this
  operation. Do not route around it.
- `capability_unavailable` — the capability set could not be read, so a
  capability-gated write was refused rather than attempted.
- `price_change_pending` — affected by a seller rate change; a fresh accepted
  quote is required.
- `self_deal` — the campaign would buy placement on the account's own network;
  promote that content through ordinary playlist pages instead.
- `quote_stale` — the quote expired or pricing moved; re-preview.
- `insufficient_credits` — no affordable reservation; the dashboard adds credits.
- `revision_conflict` — someone changed the resource; refetch, reconcile, retry.
- `idempotency_mismatch` — same key, different body; never reuse a key for a
  changed request.
- `invitation_invalid`, `invitation_expired`, `invitation_consumed` — the claim
  link is not usable; issue a new invitation.
- `billing_unavailable` — payment or payout rails are unconfigured. Report it
  truthfully; do not fabricate a receipt or a balance.
- Empty selection with no affordable campaign is a successful empty result, not
  an error and not a billable play.
- Runtime ad routes are for paired Players only; an account bearer is never a
  Player identity.

## Secrets and reporting

Invitation claim tokens, dashboard links, credentials, and signed media URLs stay
out of retained conversation and logs. The tokens in `ads invites create` output
are the one-time delivery material; hand them over directly. Keep request and
operation IDs for diagnosis, and never print Authorization headers, cookies, or
image bytes.

For every command's flags, see the [command inventory](commands.md) and
`screenrig <command> --help`.
