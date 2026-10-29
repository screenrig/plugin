import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
var e=`Credits:
  Remaining is a nonnegative whole number (never negative; empty remaining
  displays 0). Responses warn credits_low when the server marks credit low
  (some credit left, below 1000 credits); an empty free balance is not low.
  Downloads are free and the first 1 GB of storage is free. Until
  1 Jan 2027 08:00 UTC (midnight PT), production fails open: billed
  commands are not rejected for empty remaining and do not return
  HTTP 402. After that instant, a Standard project with no credit left
  gets payment_required (402) for an upload that would store more than
  1 GB, and for paid extras past the free 10,000 agent requests every
  month; stored content keeps playing.
  Premium and Enterprise are never refused for their balance. Empty
  remaining never stops screens or closes a project.
  media generate is billed per token.
  Text input is $10 / 1M tokens, image input is $16 / 1M, image output is
  $60 / 1M. Quality changes how detailed the still is and therefore how
  many tokens it uses. Remaining that cannot cover the debit returns
  payment_required / 402, including during this window.`,t=`Invitations:
  Email delivery is requested, not proof a message arrived.
  Email invitations expire after seven days; member links after 24 hours.
  At most 50 invitations may be outstanding per project.
  --link prints one member invitation URL once; deliver it privately to the
  intended person and never store or log it. The link names no recipient,
  so it takes no --email.
  Retrying an ambiguous write with unchanged input reuses its Idempotency-Key.`,n=`Page transitions: crossfade, swipe-left, swipe-right, swipe-up, swipe-down, dip, wipe-left, wipe-right, wipe-up, wipe-down, slide-left, slide-right, slide-up, slide-down, stinger. Edit each page's transition in the playlist JSON; type and duration_ms (integer 0 through 60000) are required. ease is optional: linear, in, out, in-out; it is forbidden on stinger. color is an optional #RRGGBB fill only on dip. stinger \
requires duration_ms 2000 through 6000 (typical lengths 2700 to 4000) and a stinger object; that object is forbidden on other types. All stinger members are optional: theme (neomustard, cyanotype, propaganda, signal, avant-garde, bloom, primetime), title (at most 40 characters), subtitle (at most 60), logo (media: reference), accent (#RRGGBB), hang_ms (integer 0 through 6000, at most 60% of duration_ms). Example transition: {"type":"dip","duration_ms":800,"ease":"in-out","color":"#000000"}.`;export{e as a,t as b,n as c};
