# Onym Lead Generation: Telegram Implementation

**Implementation profile draft 0.1 — August 2026**

> A Telegram promoter earns direct payment for the agreed increase in a
> channel post's view counter. A tracker-free landing page measures aggregate
> cold-to-hot intent, while the installed app learns nothing about the
> campaign or promoter.

This document is a concrete implementation of
[Lead-Generation.md](Lead-Generation.md). The abstract specification remains
authoritative for ownership, privacy, stage meaning, payment calculation,
evidence, and disputes. This document maps those concepts to Telegram channel
posts, Telegram's MTProto view counter, an Onym landing route, and direct
settlement.

The landing operator may also implement the separately owned
[acquisition contract](../acquisition/Acquisition.md). That optional contract
can measure a shared order cohort at the app-store boundary without changing
Telegram view settlement.

This profile is proposed architecture. No current Onym repository implements
the campaign, Telegram measurement, landing aggregation, or settlement
components described here.

## 1. Conformance declaration

| Abstract concept | Telegram mapping |
|---|---|
| Distribution surface | Telegram broadcast channel |
| Placement | One channel post with approved creative and landing link |
| Stable placement reference | Numeric channel ID plus channel-scoped message ID |
| Human locator | Observed public `t.me/<username>/<message-id>` URL |
| Cold-exposure counter | Telegram channel-post `views` counter |
| Cold snapshot source | MTProto `messages.getMessagesViews` with `increment=false` |
| Optional corroboration | Message `views` field, view updates, or authorized channel statistics |
| Landing arrival | Aggregate request to one order-scoped Onym route |
| Hot lead | Redemption of an anonymous landing intent capability |
| Install attribution | Deliberately absent |
| Billable metric | Eligible Telegram counter delta |
| Payment | Direct sponsor/escrow payment per view unit, capped by order |

The implementation profile identifier is:

```text
onym:lead-implementation:telegram-channel-views-v1
```

It maps this portable profile:

```text
onym:lead-profile:aggregate-funnel-v1
```

Telegram describes each channel post as having a view counter. This profile
pays for units in that platform counter. It does not reinterpret the count as
unique humans, verified attention, landing visits, installs, accounts, or
retained users.

## 2. Trust and evidence model

Telegram is the source of the counter but does not issue a portable
cryptographic receipt for each snapshot. An authorized MTProto session can
query `messages.getMessagesViews`, and an Onym `TelegramViewObserver` signs the
normalized result.

The observer signature proves:

- which observer made the query;
- which channel and message it queried;
- that it requested non-incrementing observation;
- what counter it reported; and
- when and under which profile it reported it.

It does not prove that Telegram's counter represents unique humans or that
traffic was organic. Several observers can reduce one observer's ability to
misreport, but they still depend on Telegram as a common upstream source.

The campaign order chooses one of these evidence policies:

- **single designated observer:** simplest and cheapest, with direct oracle
  trust;
- **sponsor and generator agreement:** both sign the same snapshot;
- **threshold observers:** a declared quorum signs an identical or
  tolerance-compatible value; or
- **escrow observer:** the settlement provider queries and signs the value.

Screenshots are useful dispute attachments but are not canonical counter
evidence because they are easy to edit and difficult to normalize.

## 3. Ownership mapping

- The **campaign sponsor** funds the budget, approves content and channels,
  operates or selects the landing page, and pays valid statements.
- The **lead generator** controls or is authorized to publish in the declared
  Telegram channel and supplies payout coordinates.
- The **channel owner** may be the generator or a separately consenting party.
- The **Telegram view observer** uses an MTProto user session to query public
  counter state without incrementing it.
- The **landing operator**, optionally an independent acquisition provider,
  counts only order aggregates and anonymous intent-capability redemption.
- The **settlement provider or escrow** reserves and releases the finite
  campaign budget.
- **Telegram** operates the distribution network and counter semantics; it is
  not an Onym identity or settlement authority.

Anyone can offer a channel placement. The sponsor remains free to accept or
reject it under published campaign terms. Anyone can also promote Onym without
an order, but unpaid organic promotion creates no retroactive claim.

## 4. Physical topology

```text
sponsor                         lead generator
  | signed offer                  | placement offer + channel control
  +---------------+---------------+
                  v
           funded campaign order
                  |
                  v
         Telegram channel post
           |              |
           | views        | shared order URL
           v              v
   MTProto view      tracker-free landing
   observer          | arrival aggregate
     |                | hot-intent aggregate
     +--------+-------+
              v
       efficiency report
              |
              v
   view-based settlement statement
              |
              v
   direct sponsor/escrow payment to generator

generic or shared-cohort store link -> app receives no campaign identifier
```

View settlement does not depend on the landing operator being online. Landing
failure makes the efficiency report incomplete but does not silently change
the agreed view-based rate.

## 5. Channel and placement identity

### 5.1 Eligible channel

The default profile uses a public Telegram broadcast channel so the placement
and counter can be independently observed. A private channel may be allowed
only when every designated observer has legitimate access and the order
discloses the reduced auditability.

The placement binds:

```json
{
  "platform": "telegram",
  "channelId": "<numeric-channel-id>",
  "usernameAtAcceptance": "<public-username-or-null>",
  "messageId": 1042,
  "publicUrl": "https://t.me/<username>/1042"
}
```

Telegram message IDs are scoped to a channel. A mutable username or public URL
is not sufficient identity, so evidence binds the numeric channel ID and
message ID. Session-specific access hashes and observer credentials are never
published in Onym objects.

### 5.2 Channel-control evidence

Before accepting an unknown generator, the sponsor verifies channel control
through a profile-defined challenge. A typical flow is:

1. sponsor issues a random order challenge;
2. generator signs the challenge with its Onym campaign key;
3. the channel publishes the challenge or a digest in a temporary or intended
   campaign post;
4. one or more observers bind the Telegram channel ID to that challenge; and
5. the final order records the evidence hash.

Telegram does not cryptographically bind a channel to the generator's Onym
key. The observed challenge establishes operational control at that time, not
permanent legal ownership.

## 6. Campaign order mapping

A Telegram order adds these implementation fields to the abstract
`CampaignOrder`:

```json
{
  "implementation": {
    "profileId": "onym:lead-implementation:telegram-channel-views-v1",
    "channelId": "<numeric-channel-id>",
    "usernameAtAcceptance": "<public-username>",
    "messageId": "<assigned-after-publication-or-null>",
    "placementMode": "new-channel-post",
    "creativeHash": "<canonical-telegram-creative-hash>",
    "landingUrl": "https://onym.example/c/<campaign-id>/<opaque-order-route-id>",
    "viewCounter": "telegram-channel-post-views",
    "forwardedViewPolicy": "included-as-reported-by-telegram",
    "viewObservers": ["onym:key:<observer-a>", "onym:key:<observer-b>"],
    "observerThreshold": 2,
    "snapshotToleranceSeconds": 60
  },
  "window": {
    "baselineAt": "2026-08-01T12:00:00Z",
    "endsAt": "2026-08-08T12:00:00Z",
    "finalSnapshotGraceSeconds": 60
  },
  "settlement": {
    "rate": {"minorUnits": 500, "perViews": 1000},
    "maximumBillableViews": 100000,
    "maximumAmount": 50000,
    "currency": "<declared-currency-or-asset>",
    "paymentRail": "<direct-rail-profile>"
  }
}
```

The order states whether Telegram-reported views arising from forwards are
included. If the platform counter cannot separate them, a policy claiming to
exclude them is not implementable and must not be offered.

The rate is often displayed as cost per thousand views, but settlement uses
integer rational arithmetic for the exact number of billable counter units.

## 7. Creative and publication evidence

The sponsor supplies a canonical creative bundle containing:

- exact text and text-entity representation;
- exact media bytes or content hash;
- required sponsorship label;
- the shared order landing URL;
- allowed preview and button behavior;
- language and material claims;
- edit policy; and
- minimum placement duration.

The Telegram adapter derives `creativeHash` from that canonical bundle, not a
screenshot. After publication, an observer verifies the post and emits:

```json
{
  "version": 1,
  "profileId": "onym:lead-implementation:telegram-channel-views-v1",
  "campaignId": "onym:campaign:<id>",
  "orderId": "<order-id>",
  "telegram": {
    "channelId": "<numeric-channel-id>",
    "username": "<observed-username>",
    "messageId": 1042,
    "publishedAt": "2026-08-01T11:59:45Z",
    "editDate": null
  },
  "observedCreativeHash": "<matching-hash>",
  "landingUrl": "https://onym.example/c/<campaign-id>/<opaque-order-route-id>",
  "observedAt": "2026-08-01T12:00:00Z",
  "observer": "onym:key:<observer-id>",
  "signature": "<observer-signature>"
}
```

Material edits after the baseline stop eligibility until the sponsor approves
a new creative hash and order amendment. Deletion, access restriction,
moderation, or link replacement also stops new accrual. A cosmetic change may
remain eligible only when the original order defines its canonicalization.

## 8. Telegram view snapshots

### 8.1 Canonical query

The observer uses Telegram's MTProto method:

```text
messages.getMessagesViews(
  peer = <channel InputPeer>,
  id = [<message-id>],
  increment = false
)
```

The method is available to Telegram user sessions rather than ordinary bots.
The profile requires `increment=false`, so observation does not deliberately
increase the counter. A Bot API integration may help publish or identify the
post, but it does not replace the canonical view snapshot.

The response supplies a `MessageViews` value containing the current `views`
counter when available. The observer cross-checks channel ID, message ID,
existence, content hash, and edit state before signing.

### 8.2 Snapshot object

```json
{
  "version": 1,
  "profileId": "onym:lead-implementation:telegram-channel-views-v1",
  "campaignId": "onym:campaign:<id>",
  "orderId": "<order-id>",
  "telegram": {
    "channelId": "<numeric-channel-id>",
    "messageId": 1042,
    "views": 18342
  },
  "query": "messages.getMessagesViews",
  "increment": false,
  "apiLayer": "<observed-MTProto-layer>",
  "creativeHash": "<still-approved-hash>",
  "observedAt": "2026-08-08T12:00:00Z",
  "observer": "onym:key:<observer-id>",
  "signature": "<observer-signature>"
}
```

The snapshot contains no Telegram user list, subscriber list, session token,
phone number, IP address, or viewer identifier.

### 8.3 Baseline and final observation

The baseline is captured only after the placement is verified and at the
order's start boundary. A new campaign-specific post normally begins near
zero, but the observed baseline remains authoritative. This permits an order
to use an existing post without paying historical views.

The final snapshot is taken at the end boundary within the declared tolerance.
Because a cumulative counter cannot reveal the exact time of every increment,
a late final snapshot may include post-window views and an early one may omit
eligible views. The order's tolerance, grace, correction, and dispute policy
must state how this uncertainty is handled; the observer cannot reconstruct
per-view timestamps.

Intermediate snapshots support budget monitoring and milestone settlement.
They do not reset the platform counter.

## 9. Billable-view calculation

For final settlement:

```text
rawCounterDelta       = max(0, finalViews - baselineViews)
cumulativeBillable    = min(rawCounterDelta, maximumBillableViews)
newBillableViews      = max(0, cumulativeBillable - alreadySettledViews)
cumulativeGross       = floor(cumulativeBillable * rateMinorUnits / perViews)
newGross              = max(0, cumulativeGross - previouslySettledGross)
payableMinorUnits     = min(max(0, newGross + signedAdjustments),
                            remainingBudgetMinorUnits)
```

For example:

```text
baseline views       = 342
final views          = 18,342
billable delta       = 18,000
rate                 = 500 minor units per 1,000 views
direct gross payment = 9,000 minor units
```

Every milestone statement records the counter and cumulative gross through
which it settled. A later statement pays the cumulative entitlement less prior
gross payment, so statement frequency cannot change rounding. Counter
regression, overflow, conflicting threshold snapshots, missing creative, or
exhausted budget opens a dispute rather than producing a guessed value.

Landing arrivals and hot leads are not inputs to this formula. That protects
the prospective user from install attribution and the generator from a payout
rule based on data the contract intentionally refuses to collect.

## 10. Tracker-free Telegram landing

### 10.1 Shared route

The approved post contains one order-scoped URL shared by all its viewers:

```text
https://onym.example/c/<campaign-id>/<opaque-order-route-id>
```

It contains no viewer, channel subscriber, Telegram account, device, or
per-viewer referral token. The opaque route maps to one accepted placement
order, so it supports aggregate per-generator comparison without identifying
any person.

Unexpected query parameters and fragments are discarded before counting. The
page uses no Telegram Login, advertising identifier, analytics SDK, tracking
pixel, fingerprint, third-party font, third-party script, cookie, or durable
local storage.

### 10.2 Arrival count

The landing edge or origin increments an aggregate order/time-bucket count
for eligible page responses. If a CDN is used, every cache-served response
must reach the aggregate counter or caching is disabled for this route.

The counter does not attempt to identify unique humans. Coarse protocol checks
may exclude malformed or obviously automated requests only when declared.
No exclusion rule may create or retain a visitor fingerprint.

The HTTPS endpoint and network intermediaries necessarily see transient source
address, timing, and request metadata while serving the page. The landing
service does not retain or join those fields for campaign attribution. Any
short-lived security log is separately declared, access-limited, excluded from
reports, and deleted on a fixed maximum schedule.

### 10.3 Hot-intent count

The page presents an explicit action such as:

```text
Continue to install Onym
```

With the page response, the landing service creates a random, short-lived,
unlinkable capability. The capability is:

- unrelated to network address, user agent, Telegram account, or Onym identity;
- held only in the page or form, not durable browser storage;
- accepted once for the declared hot action;
- retained only as an opaque spent/expiry record long enough to prevent replay;
  and
- deleted at expiry without entering the campaign report.

Successful redemption increments only `eligibleHotLeads`. Reloading can obtain
another capability, so the result is an intent-action count, not unique-person
proof. Aggregate abuse controls may flag implausible traffic without tracking
individual visitors.

### 10.4 Outbound install path

After the hot action, the visitor receives either a generic official store or
project URL, or a link authorized by the separate Onym acquisition contract.
An acquisition link may carry one opaque cohort shared by the entire order so
the store can return a privacy-thresholded aggregate. It never carries a
visitor-specific value and terminates at the store boundary. The page sets a
strict `Referrer-Policy` such as `no-referrer`.

The installed app does not read an install referrer, deferred deep link,
clipboard token, campaign cookie, or broker record. It cannot report which
Telegram view or campaign led to installation.

## 11. Efficiency report

The landing operator signs one aggregate per order/window:

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<id>",
  "orderId": "<order-id>",
  "window": {
    "startsAt": "2026-08-01T12:00:00Z",
    "endsAt": "2026-08-08T12:00:00Z"
  },
  "landingArrivals": 1240,
  "hotIntentActions": 418,
  "hotAction": "continue-to-install-v1",
  "visitorIdentifiersCollected": false,
  "installAttribution": false,
  "capabilityRetentionMaximum": "PT30M",
  "operator": "onym:key:<landing-operator>",
  "signature": "<operator-signature>"
}
```

Combined with 18,000 billable Telegram views:

```text
view -> landing rate = 1,240 / 18,000 = 6.888889%
view -> hot rate     =   418 / 18,000 = 2.322222%
landing -> hot rate  =   418 / 1,240  = 33.709677%
cost per hot intent  = settled amount / 418
```

The report labels missing landing data as incomplete. It never estimates
missing values from installs or app accounts. Small aggregate buckets may be
suppressed according to the campaign privacy threshold.

These measures can guide future campaign selection, creative testing, and
budget allocation. Because aggregate counts can still be manipulated, they
must not become an opaque automatic reputation score without declared fraud,
confidence, and appeal rules.

## 12. Direct settlement

The sponsor reserves the order's maximum amount before the campaign starts.
After an evidence threshold is met, sponsor or escrow signs a canonical
`SettlementStatement` and pays the generator through the declared direct rail.

The payment rail may use a bank transfer, payment processor, Lightning,
stable-value asset, or another agreed mechanism. If the generator exposes a
blockchain receiving address through an Onym identity capability, only the
address scoped to this settlement context is revealed. No native Onym token is
required.

The prospective user pays nothing and is not part of settlement. This is a
business payment for distribution service, so StoreKit or Play Billing is not
used merely because the advertised app is mobile.

The order declares:

- gross rate and view unit;
- currency or asset;
- network and payout coordinate;
- fees, conversion, taxes, withholding, and invoice duties;
- confirmation/finality rule;
- milestone and final payout schedule;
- correction and overpayment handling;
- dispute period and arbitrator; and
- treatment of platform outage or campaign suspension.

Neither sponsor nor escrow may withhold an undisputed view payment because the
aggregate landing conversion was lower than hoped.

## 13. Counter abuse and disputes

A Telegram view counter is useful but not fraud-proof. It can be affected by
automated accounts, purchased traffic, repeated exposure, forwarding,
platform bugs, API lag, or behavior not visible to Onym.

Risk is bounded through contract design:

- finite prepaid budget and maximum billable views;
- a new, content-pinned campaign post where practical;
- baseline and end snapshots from declared observers;
- periodic snapshots and spend alerts;
- public or observer-accessible channel and post;
- declared minimum placement duration;
- aggregate-only anomaly checks such as impossible counter jumps relative to
  the accepted channel history;
- a bounded disputed increment rather than withholding all earned payment;
- independent re-observation during a dispute window; and
- signed manual adjustments with reasons and both parties' acceptance.

Anomaly checks do not prove fraud. They open a dispute. They may not inspect
viewer identities, demand subscriber lists, place tracking code, or correlate
landing visitors with Telegram accounts.

The generator can also dispute sponsor behavior such as a missing final
snapshot, landing outage, depleted escrow contrary to the order, or refusal to
settle an undisputed counter delta.

## 14. Privacy and security properties

1. The Telegram observer reads a placement and aggregate counter, not viewer or
   subscriber identities.
2. The post uses one order link shared by every viewer of that placement.
3. Landing counters are order/time aggregates, not visitor event exports.
4. Page capabilities are random, short-lived, unlinked, single-purpose, and
   absent from signed reports.
5. The outbound store link is generic or contains only an order-shared
   acquisition cohort that terminates at the store.
6. The app receives no campaign, acquisition cohort, Telegram, generator, or
   capability value.
7. The lead generator receives view and settlement statements, not landing
   logs, install records, users, or later activity.
8. The sponsor receives aggregate efficiency, not person-level journeys.
9. Observer Telegram sessions and phone/account data never enter campaign
   evidence.
10. Payout coordinates identify the generator for settlement only and are not
    attached to prospective users.
11. A paid placement grants no Onym identity, naming, transport, notary, or
    governance authority.
12. Creative, APIs, landing input, and payment references are untrusted and
    bounded.

## 15. Error mapping

| Abstract error | Telegram implementation source |
|---|---|
| `surface_unverified` | Channel-control challenge not observed |
| `placement_missing` | Channel/message unavailable or deleted |
| `creative_mismatch` | Text, entities, media, disclosure, or URL changed |
| `counter_unavailable` | MTProto error, access loss, flood wait, or missing `views` |
| `counter_regressed` | Later counter below accepted earlier snapshot |
| `evidence_conflict` | Observer values disagree beyond tolerance |
| `window_mismatch` | Snapshot outside the order boundary/tolerance |
| `traffic_suspected` | Aggregate anomaly exceeds declared policy |
| `landing_unavailable` | Campaign route or aggregate counter unavailable |
| `privacy_violation` | Tracking parameter, pixel, identifier, or app attribution detected |
| `budget_exhausted` | Maximum views or amount already accrued |
| `settlement_duplicate` | Statement overlaps paid counter interval |
| `payment_failed` | Direct rail rejected or remains unfinalized |
| `outcome_unknown` | Placement/counter/payment result cannot be reconciled yet |

Telegram rate limits such as flood-wait responses are availability conditions,
not zero views. The observer retries within the declared snapshot tolerance
and reports uncertainty when it cannot obtain evidence.

## 16. Required implementation components

A deployable reference implementation needs:

| Component | Responsibility |
|---|---|
| Campaign registry/API | Signed offers, placement offers, orders, budgets, state |
| Creative canonicalizer | Telegram text/entity/media/link hash fixtures |
| Telegram placement adapter | Channel control and publication verification |
| Telegram view observer | Non-incrementing MTProto snapshots and signatures |
| Landing service | Tracker-free page, aggregate arrivals, intent capabilities |
| Report calculator | Canonical funnel rates and confidence annotations |
| Settlement engine | Integer view calculation, caps, statements, replay defense |
| Optional escrow | Budget reservation and direct payout |
| Public audit log | Offers, orders, aggregate evidence hashes, statements, corrections |

Secrets are isolated: MTProto credentials stay in the observer, landing
capabilities stay in the landing service, and payment keys stay in escrow or
the settlement signer. No component needs all three.

## 17. Conformance tests

A shared suite covers:

1. canonical campaign, offer, order, placement, snapshot, report, and
   settlement signatures;
2. Telegram channel/message identity and mutable username handling;
3. creative canonicalization, edits, deleted posts, and changed links;
4. `messages.getMessagesViews` observation with `increment=false`;
5. baseline, boundary tolerance, counter delta, cap, rational rate, rounding,
   overflow, milestone, and duplicate-settlement vectors;
6. observer threshold agreement, conflict, outage, and correction;
7. tracker-free landing headers, stripped parameters, and absence of
   third-party tracking;
8. anonymous capability issue, single redemption, expiry, replay, and deletion;
9. aggregate arrival/hot counts and zero-denominator calculations;
10. proof that outbound links and app startup contain no campaign value;
11. landing outage without loss of valid view payment;
12. fraud dispute without person-level telemetry; and
13. direct payment success, failure, finality, and idempotent retry.

## 18. Acceptance criteria

The Telegram implementation conforms when:

1. any channel controller can submit an offer using the public profile;
2. an accepted generator can publish the approved post and receive direct,
   capped payment for the agreed Telegram view-counter delta;
3. all canonical view observations use a non-incrementing MTProto query and
   identify observer, channel, post, time, creative, and counter;
4. settlement never claims the counter represents unique humans or installs;
5. the landing service reports aggregate view-to-arrival and view-to-hot
   efficiency without cookies, fingerprints, analytics pixels, or user IDs;
6. the outbound app path contains no campaign information and the app performs
   no install-attribution callback;
7. missing landing data cannot silently reduce an otherwise valid view payout;
8. budget cap, view cap, counter interval, and settlement IDs prevent unlimited
   liability and double payment;
9. observer conflict, platform outage, content edits, suspicious traffic, and
   payment failure enter explicit dispute states; and
10. sponsor, generator, observer, landing operator, and settlement provider can
    be independently owned and replaced.

## References

1. Abstract Onym lead-generation boundary:
   [Lead-Generation.md](Lead-Generation.md)
2. Optional aggregate acquisition boundary:
   [../acquisition/Acquisition.md](../acquisition/Acquisition.md)
3. Telegram channels and per-post view counters:
   <https://core.telegram.org/api/channel>
4. Telegram `messages.getMessagesViews`:
   <https://core.telegram.org/method/messages.getMessagesViews>
5. Telegram `MessageViews` type:
   <https://core.telegram.org/type/MessageViews>
6. Telegram message `views` field:
   <https://core.telegram.org/constructor/message>
7. Telegram channel statistics:
   <https://core.telegram.org/api/stats>
