---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Lead Generation Contract Boundary

**Architecture draft 0.1 — August 2026**

> A lead generator is paid for declared, measurable distribution. Onym may
> measure aggregate interest, but it does not identify which viewer installed
> the app or attach a promoter to a user.

This document defines the technology-neutral contract between an Onym campaign
sponsor and an independent lead generator. It does not require a particular
social network, advertising platform, view counter, landing-page stack,
payment rail, escrow, or settlement currency.

Anyone may propose or fulfill a lead-generation campaign. Payment requires a
sponsor-authorized order with a finite budget; permissionless participation is
not permission to spend another party's money or use the Onym name
misleadingly.

A concrete implementation may use a public broadcast channel, newsletter,
website, event, podcast, or another distribution surface that supplies the
declared aggregate evidence. The first Telegram implementation is specified in
[Lead-Generation-Telegram.md](Lead-Generation-Telegram.md).

The optional next stage is defined by
[../acquisition/Acquisition.md](../acquisition/Acquisition.md). An independent
acquisition provider may operate the landing page and use one store cohort
shared by the whole order. That cohort terminates at the store boundary and is
never delivered into the installed app.

## 1. Decision

Onym separates lead generation from user identity and install attribution.

- The **campaign sponsor** funds a campaign and defines the approved creative,
  audience constraints, measurement window, evidence, rate, cap, and terms.
- The **lead generator** owns or lawfully controls a distribution surface and
  publishes the approved placement.
- The **distribution adapter** maps a channel's aggregate evidence into the
  common contract.
- The **view-evidence provider** observes channel counters and signs bounded
  snapshots when the channel does not provide portable signed evidence.
- The **landing operator**, which may be an independently owned acquisition
  provider, serves an order-scoped tracker-free page and reports aggregate
  arrivals and hot-intent actions.
- The **settlement provider or escrow**, when used, holds campaign funds and
  pays verified statements without learning prospective-user identities.
- The **prospective user** may view, visit, continue to an app store, or leave
  without becoming an attributed record.

One party may occupy several roles, but their authorities and evidence remain
separate. A sponsor cannot claim an install occurred from a view. A lead
generator cannot claim a view identifies a person. A landing operator cannot
turn campaign measurement into cross-site or in-app tracking.

The Telegram reference offer pays directly for eligible aggregate post views.
Landing conversion measures efficiency but does not change that payout basis.

## 2. What the contract does

The contract surface can:

1. publish a signed, budget-capped campaign offer;
2. let any lead generator submit a signed placement offer;
3. bind sponsor and generator through an accepted campaign order;
4. verify that approved creative appeared on the agreed distribution surface;
5. receive aggregate cold-exposure evidence over a fixed window;
6. receive aggregate landing-arrival and hot-intent counts;
7. calculate order-level and campaign-level efficiency without tracking a
   person;
8. calculate direct payment from the agreed billable metric;
9. issue signed settlement statements and prevent duplicate settlement; and
10. preserve disputes, uncertainty, fraud limits, and audit evidence.

It does not identify viewers, detect an installation on a device, connect an
app user to a campaign, create a user referral graph, grant identity or group
authority, or promise that an exposure causes adoption.

## 3. Why payout is not install attribution

Install attribution normally creates a join key across at least three places:
an advertisement or post, a landing or store visit, and the installed app.
That key can become a durable record of who responded to which message.

Onym does not place that join key in the app. In particular, the contract does
not require:

- per-viewer referral identifiers;
- advertising identifiers or device fingerprints;
- cookies, local-storage identifiers, tracking pixels, or analytics SDKs;
- deferred deep links or campaign tokens delivered into the app;
- clipboard-based attribution;
- contact uploads, account matching, or store-receipt correlation; or
- an app callback naming the campaign that acquired a user.

The landing page uses one opaque order-scoped route shared by every viewer of
that placement. It can count aggregate arrivals and anonymous intent actions
for that order, then send the visitor either to a generic store location or to
an acquisition-contract link carrying one cohort value shared by the whole
order. The cohort may be visible to the store but is never delivered into the
app. This measures each generator's funnel without creating person-level
attribution.

The economic consequence is deliberate: no lead generator receives a
per-install royalty or a cut of a user's later activity. A declared delivery
metric—such as eligible channel views—funds the work. Aggregate conversion is
diagnostic evidence for campaign quality, not surveillance-based commission.

## 4. Funnel semantics

This contract uses three distinct aggregate stages:

- **cold exposure:** an implementation-defined eligible view or impression of
  the campaign placement;
- **landing arrival:** a request to the shared order landing route that
  passes the campaign's coarse validity rules; and
- **hot lead:** one anonymous, short-lived landing capability redeemed through
  an explicit intent action, such as selecting “Continue to install.”

A hot lead is an aggregate expression of interest. It is not a unique human,
verified install, account creation, retained user, or purchaser.

For one measurement window:

```text
coldToLandingRate = eligibleLandingArrivals / eligibleColdExposures
coldToHotRate     = eligibleHotLeads / eligibleColdExposures
landingToHotRate  = eligibleHotLeads / eligibleLandingArrivals
costPerHotLead    = settledCampaignAmount / eligibleHotLeads
```

Division by zero yields `undefined`, not zero or infinity. Counts and rates
carry their window, policy version, evidence sources, and confidence limits.
They must not be combined across incompatible definitions.

The base contract never calls these values unique-person conversion rates.
Repeated views, shared devices, bots, reloads, forwarded content, and platform
counter behavior can affect them.

## 5. Logical topology

```text
campaign sponsor
  |-- signed campaign offer + finite budget
  v
lead generator
  |-- approved placement
  v
distribution surface
  |                        no user identifier crosses this line
  | aggregate cold views  ------------------------------------+
  v                                                            |
shared order landing route                                     |
  |-- aggregate arrival counter                                |
  |-- anonymous one-time intent capability                     |
  `-- generic or shared-cohort app-store link                  |
                                                               v
                                                   measurement statement
                                                               |
                                                               v
                                                direct capped settlement

installed Onym app receives no campaign or lead-generator identifier
```

The sponsor can compare aggregate delivery and intent without learning which
person moved between stages. The lead generator receives settlement evidence,
not a list of visitors or installs.

The landing host and network intermediaries necessarily observe connection
metadata while serving a request. The privacy guarantee is that campaign
measurement does not retain, export, or join that metadata to create a visitor
record; any exceptional short-lived security logging is separately declared.

## 6. Contract objects

### 6.1 Lead Generation Profile

A `LeadGenerationProfile` defines portable campaign semantics:

```json
{
  "profileVersion": 1,
  "profileId": "onym:lead-profile:aggregate-funnel-v1",
  "interface": "onym-lead-v1",
  "stages": ["cold-exposure", "landing-arrival", "hot-lead"],
  "privacy": "aggregate-no-install-attribution-v1",
  "evidenceSchema": "onym-lead-evidence-v1",
  "settlementSchema": "onym-lead-settlement-v1",
  "errorSchema": "onym-lead-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

It fixes stage meanings, aggregation, privacy, evidence, calculation, and
settlement behavior. It does not choose a distribution network, oracle,
landing host, price, currency, audience, or creative.

### 6.2 Lead Implementation Profile

A `LeadImplementationProfile` maps the abstract contract to one distribution
technology:

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:lead-implementation:<channel>-v1",
  "leadProfileId": "onym:lead-profile:aggregate-funnel-v1",
  "placementMapping": "<content-addressed-specification>",
  "coldEvidence": "<aggregate-counter-profile>",
  "landingMeasurement": "onym:tracker-free-landing-v1",
  "proofModel": "<platform-signed-or-declared-oracle-model>",
  "signature": "<implementation-profile-publisher-signature>"
}
```

Channel posts, account handles, platform APIs, screenshots, and oracle
credentials remain inside the implementation adapter.

### 6.3 Campaign Offer

A sponsor publishes a finite `LeadCampaignOffer`:

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "sponsor": "onym:key:<sponsor-id>",
  "leadProfileId": "onym:lead-profile:aggregate-funnel-v1",
  "allowedImplementations": ["onym:lead-implementation:<channel>-v1"],
  "creative": {
    "bundleHash": "<content-addressed-approved-creative>",
    "landingBase": "https://example.org/c/<campaign-id>",
    "disclosures": ["sponsored-placement"]
  },
  "eligibility": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z",
    "allowedLanguages": ["en"],
    "allowedRegions": ["<campaign-policy>"],
    "prohibitedContexts": ["<brand-safety-policy>"]
  },
  "settlement": {
    "billableMetric": "eligible-cold-exposure",
    "rate": {"minorUnits": 500, "per": 1000},
    "currency": "<declared-currency-or-asset>",
    "maximumBillableExposures": 100000,
    "maximumAmount": 50000,
    "paymentRail": "<direct-payment-profile>",
    "escrow": "<optional-escrow-component>"
  },
  "evidencePolicy": "<content-addressed-policy>",
  "landingPolicy": "onym:tracker-free-landing-v1",
  "validUntil": "2026-08-01T00:00:00Z",
  "signature": "<sponsor-signature>"
}
```

All arithmetic uses integer minor units and the declared rounding rule. The
maximum amount is authoritative if rate and counter caps could otherwise
exceed it. An offer is not a promise to pay unaccepted placements.

### 6.4 Placement Offer and Campaign Order

Any lead generator may submit:

```json
{
  "version": 1,
  "placementOfferId": "<random-id>",
  "campaignId": "onym:campaign:<random-id>",
  "generator": "onym:key:<generator-id>",
  "implementationProfileId": "onym:lead-implementation:<channel>-v1",
  "surface": "<implementation-specific-public-reference>",
  "channelControlEvidence": "<profile-defined-evidence>",
  "estimatedCapacity": 25000,
  "payoutCoordinates": "<payment-rail-specific-reference>",
  "validUntil": "2026-08-01T00:00:00Z",
  "signature": "<generator-signature>"
}
```

The sponsor accepts it by issuing a `CampaignOrder` that binds:

- campaign and placement-offer IDs;
- sponsor and generator keys;
- exact implementation profile;
- approved surface and creative hash;
- opaque order-scoped landing route;
- start, end, snapshot, and settlement times;
- baseline, cap, rate, currency, and rounding;
- authorized evidence providers and signature threshold;
- content-edit, deletion, outage, and fraud rules;
- dispute window and governing settlement terms; and
- sponsor and generator signatures.

Acceptance may be automatic under a signed policy or explicit. Either way,
the budget is reserved before eligible delivery begins. A generator who posts
without an accepted order may still promote Onym but has no payment claim.

### 6.5 Placement Receipt

The implementation adapter produces:

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "orderId": "<order-id>",
  "placementReference": "<channel-and-item-reference>",
  "creativeHash": "<observed-approved-creative-hash>",
  "publishedAt": "2026-08-01T00:05:00Z",
  "observedBy": ["onym:key:<evidence-provider>"],
  "evidence": "<profile-defined-placement-evidence>",
  "signature": "<evidence-signature>"
}
```

It proves only what the implementation profile and observer can establish. It
does not prove a person noticed, understood, or acted on the placement.

### 6.6 Cold Exposure Snapshot

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "orderId": "<order-id>",
  "placementReference": "<channel-and-item-reference>",
  "counter": 18342,
  "counterUnit": "<profile-defined-view-unit>",
  "counterSemantics": "<content-addressed-definition>",
  "observedAt": "2026-08-08T00:00:00Z",
  "source": "<implementation-source>",
  "observer": "onym:key:<evidence-provider>",
  "signature": "<observer-signature>"
}
```

Snapshots are monotonic observations, not a list of viewers. When the
platform does not sign counts, the observer signature proves who reported a
value, not that the platform's counter is fraud-free.

### 6.7 Landing Aggregate

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "orderId": "<order-id>",
  "window": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "eligibleLandingArrivals": 1240,
  "eligibleHotLeads": 418,
  "hotLeadAction": "continue-to-install-v1",
  "countingPolicy": "onym:tracker-free-landing-v1",
  "rawEventRetention": "ephemeral-unlinked-capabilities-only",
  "operator": "onym:key:<landing-operator>",
  "signature": "<landing-operator-signature>"
}
```

The aggregate contains no network address, user agent, cookie, capability,
store transaction, or app identity. Counts below a declared privacy threshold
may be suppressed or combined into a larger time bucket.

### 6.8 Efficiency Report

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "orderId": "<order-id>",
  "eligibleColdExposures": 18000,
  "eligibleLandingArrivals": 1240,
  "eligibleHotLeads": 418,
  "rates": {
    "coldToLanding": "0.068888",
    "coldToHot": "0.023222",
    "landingToHot": "0.337096"
  },
  "settledAmount": {"minorUnits": 9000, "currency": "<declared>"},
  "costPerHotLead": "21.531100",
  "notInstallAttribution": true,
  "evidence": ["<snapshot-hashes>", "<landing-aggregate-hash>"],
  "signature": "<report-publisher-signature>"
}
```

Rates use a canonical decimal representation and declared precision. The
report is comparable only with reports using compatible stage definitions and
windows.

### 6.9 Settlement Statement

```json
{
  "version": 1,
  "statementId": "<nonreusable-id>",
  "campaignId": "onym:campaign:<random-id>",
  "orderId": "<order-id>",
  "baselineCounter": 342,
  "settledThroughCounter": 18342,
  "cumulativeBillableExposures": 18000,
  "newBillableExposures": 18000,
  "rate": {"minorUnits": 500, "per": 1000},
  "cumulativeGrossAmount": {"minorUnits": 9000, "currency": "<declared>"},
  "previouslySettledGrossAmount": {"minorUnits": 0, "currency": "<declared>"},
  "newGrossAmount": {"minorUnits": 9000, "currency": "<declared>"},
  "adjustments": [],
  "payableAmount": {"minorUnits": 9000, "currency": "<declared>"},
  "evidence": ["<placement-and-counter-snapshot-hashes>"],
  "payee": "onym:key:<generator-id>",
  "sponsorSignature": "<signature>",
  "generatorSignature": "<signature-or-dispute>"
}
```

`statementId`, order state, and `settledThroughCounter` prevent the same views
from being paid twice.

## 7. Common contract surface

| Operation | Input | Result |
|---|---|---|
| `publishCampaign` | Signed offer and reserved budget | Campaign reference |
| `offerPlacement` | Generator, surface, capacity, control evidence | Placement offer |
| `acceptPlacement` | Offer plus final terms | Mutually bound order |
| `recordPlacement` | Observed content and channel evidence | Placement receipt |
| `snapshotColdExposure` | Order and placement | Signed aggregate counter |
| `snapshotLanding` | Order and window | Signed arrival/hot aggregate |
| `calculateEfficiency` | Compatible snapshots | Aggregate funnel report |
| `calculateSettlement` | Order, baseline, latest counter, prior settlements | Capped statement |
| `settle` | Accepted statement | Payment reference |
| `dispute` | Statement and bounded evidence | Open dispute state |
| `closeCampaign` | End condition and final reconciliation | Closed budget and audit record |

The common surface has no operation for `attributeInstall`, `identifyViewer`,
or `attachCampaignToUser`.

## 8. Tracker-free landing profile

One shared route identifies the campaign order, not the visitor:

```text
https://<landing-origin>/c/<campaign-id>/<opaque-order-route-id>
```

The landing operator:

1. validates the campaign order and time window;
2. increments only aggregate order/time-bucket arrival state;
3. issues an unlinkable random page capability held only in page memory or a
   form, never durable browser storage;
4. counts at most one declared hot action for that capability;
5. deletes or irreversibly marks the capability immediately after redemption
   and expires unused capabilities quickly;
6. does not bind capabilities to network addresses, user agents, accounts, or
   fingerprints;
7. uses no third-party analytics, advertising pixels, cookies, local storage,
   or cross-site resources capable of correlation;
8. sends only aggregate signed buckets into measurement;
9. strips unexpected parameters and applies a strict referrer policy; and
10. sends the visitor to either a generic store URL or a conforming acquisition
    URL whose order-shared cohort terminates at the store and never enters the
    app.

The one-time capability limits accidental repeat actions within one page load.
It does not prove a unique human and cannot fully prevent scripted reloads.
Aggregate anomaly controls may reject obviously invalid traffic, but must not
quietly reintroduce fingerprinting.

Operational network logs are disabled or reduced to nonidentifying counters.
If short-lived security logs are unavoidable, their fields, access, maximum
retention, and deletion are declared and they never enter campaign reports.

## 9. Payment and calculation

The implementation profile declares the billable counter. For a cumulative
counter:

```text
cumulativeEligible = max(0, observedCounter - baselineCounter)
cumulativeBillable = min(cumulativeEligible, maximumBillableExposures)
newBillable         = max(0, cumulativeBillable - previouslySettledExposures)
cumulativeGross     = floor(cumulativeBillable * rateMinorUnits / rateUnit)
newGross            = max(0, cumulativeGross - previouslySettledGross)
payableMinorUnits   = min(max(0, newGross + signedAdjustments),
                          remainingCampaignBudget)
```

Every intermediate uses checked integers. Calculating the cumulative gross
before subtracting prior settlement makes rounding independent of milestone
size. Negative counters, overflow, counter resets, evidence outside the window,
and incompatible snapshots move the statement to dispute rather than guessing.

Payment is direct campaign consideration from sponsor or escrow to generator.
It is not an in-app purchase by the prospective user, a perpetual royalty, an
install bounty, or a share of future user transactions. The order declares the
rail, fees, taxes, withholding, currency conversion, finality, refund, and
dispute terms.

Pre-funded escrow is preferred for permissionless generators because it limits
sponsor nonpayment and ensures accepted orders cannot exceed budget. The
escrow learns campaign, generator, amount, and evidence references; it does not
learn prospective-user data.

## 10. Sponsor obligations

A conforming sponsor must:

1. publish truthful, lawful creative and required sponsorship disclosures;
2. state eligibility, measurement, edit, fraud, payment, and dispute rules
   before accepting a placement;
3. reserve a finite budget and never invite unlimited uncompensated delivery;
4. accept or reject offers without claiming direct-use permission is revoked;
5. use aggregate funnel measurements without requesting user attribution;
6. calculate settlement deterministically from pinned evidence;
7. pay accepted statements on the declared schedule;
8. avoid changing a campaign definition after delivery begins; and
9. not rank generators using secret tracking or undisclosed downstream data.

## 11. Lead-generator obligations

A conforming generator must:

1. control or have permission to use the declared surface;
2. obtain an accepted order before claiming payment;
3. publish only approved creative, link, and disclosures;
4. preserve the placement for the agreed window;
5. report edits, deletion, moderation, or platform restrictions;
6. not purchase, automate, or fabricate billable views;
7. not generate fake landing actions to improve efficiency reports;
8. not use dark patterns, impersonation, malware, spam, or misleading install
   claims;
9. not add viewer-level referral or tracking parameters; and
10. accept that views are the paid service while installs remain unknown.

## 12. Measurement-provider obligations

An evidence or landing provider must:

- publish a signed manifest, implementation profile, methods, keys, and
  retention policy;
- observe only the fields needed for aggregate evidence;
- use canonical counters, timestamps, placement references, and content hashes;
- never call a measurement method in a mode that fabricates a billable view;
- distinguish platform evidence from its own signature and inference;
- sign every snapshot and make corrections append-only;
- prevent replay and double settlement;
- disclose outage, counter reset, API drift, and uncertainty;
- expose no individual events in reports; and
- remain replaceable by another conforming observer.

Multiple observers can reduce one oracle's ability to lie, but they may still
depend on the same distribution platform and do not create independent ground
truth about unique humans.

## 13. Errors and state machines

| Error | Origin | Required response |
|---|---|---|
| `unsupported_profile` | Sponsor/generator | Refuse incompatible placement |
| `offer_expired` | Offer | Do not accept or deliver |
| `budget_unavailable` | Sponsor/escrow | Do not activate order |
| `surface_unverified` | Adapter/oracle | Reject until control is established |
| `creative_mismatch` | Placement | Pause eligibility and open dispute |
| `placement_missing` | Channel | Stop accrual; preserve last evidence |
| `counter_unavailable` | Platform/oracle | Keep outcome pending, not zero |
| `counter_regressed` | Platform/oracle | Freeze settlement and reconcile |
| `evidence_conflict` | Multiple observers | Apply threshold/dispute policy |
| `window_mismatch` | Evidence | Exclude incompatible observation |
| `traffic_suspected` | Aggregate fraud checks | Quarantine disputed increment |
| `landing_unavailable` | Landing operator | Mark efficiency incomplete; view payout follows order |
| `privacy_violation` | Any component | Stop campaign and preserve minimal audit evidence |
| `settlement_duplicate` | Settlement | Reject replayed statement |
| `payment_failed` | Payment rail | Preserve payable liability and retry |
| `outcome_unknown` | Network/provider | Reconcile before another settlement |

Campaign state:

```text
draft
  -> offered
  -> placement_proposed
  -> accepted_and_funded
  -> placement_verified
  -> active
  -> measuring
  -> final_snapshot
  -> statement_proposed
  -> accepted | disputed
  -> settled
  -> closed
```

Privacy or creative violations can move any active state to `suspended`.
Suspension stops new accrual but does not erase prior evidence or automatically
forfeit valid earned payment.

## 14. Security, privacy, and economic invariants

1. **No install attribution.** The app never receives a campaign, placement,
   generator, or per-viewer token.
2. **No user-level funnel.** Only order/time-bucket aggregates cross the
   measurement boundary.
3. **Hot means intent, not install.** Reports use the declared action name and
   never relabel it as a unique user or installation.
4. **Payment follows the order.** Efficiency cannot silently replace the
   agreed billable view metric.
5. **No infinite liability.** Every order has a view cap, amount cap, window,
   and reserved budget.
6. **Anyone may offer; sponsors choose spend.** Open participation does not
   force acceptance or endorsement.
7. **Evidence is scoped.** Snapshots bind campaign, order, surface, placement,
   counter definition, window, observer, and time.
8. **Counters are not people.** Platform views and landing actions may be
   duplicated or manipulated and are described honestly.
9. **Settlement is idempotent.** A counter increment is payable at most once.
10. **Creative is pinned.** Material edits require a new approval or stop
    eligibility.
11. **Direct payment grants no protocol authority.** A paid generator gains no
    identity, message, notary, registry, or governance power.
12. **Diagnostics cannot become surveillance.** Fraud control uses aggregate,
    declared evidence and cannot quietly add fingerprinting.

## 15. Versioning and conformance

- `LeadGenerationProfile` changes when stage, privacy, evidence, efficiency,
  settlement, or error meaning changes.
- `LeadImplementationProfile` changes when placement identity, counter,
  oracle, or channel behavior changes.
- Offers and orders pin exact profile versions, creative, landing policy, and
  evidence rules.
- New defaults do not alter active or historical orders.
- Evidence corrections are signed append-only objects that reference what
  they supersede.
- Cross-implementation fixtures cover canonical objects, signatures,
  arithmetic, caps, counter regression, duplicate settlement, missing data,
  landing aggregation, privacy failure, and disputes.
- A directory may curate generator offers; direct signed offers remain valid
  independently of directory inclusion.

## 16. Concrete implementation profiles

The first implementation is:

- [Lead-Generation-Telegram.md](Lead-Generation-Telegram.md) — Telegram
  channel placements, MTProto view snapshots, tracker-free order landing
  routes, view-based direct settlement, and aggregate funnel efficiency.

Future implementations may define another eligible exposure counter while
preserving the no-install-attribution boundary.

Aggregate hot-lead-to-store-acquisition measurement belongs to the separate
[Onym Acquisition Contract Boundary](../acquisition/Acquisition.md), not to a
lead generator's view-settlement calculation.

## 17. Acceptance criteria

The lead-generation boundary is successfully separated when:

1. anyone can publish a conforming placement offer and fulfill an accepted,
   funded order;
2. the sponsor can verify aggregate delivery and calculate a capped direct
   payment from public profiles;
3. the sponsor can measure aggregate cold-to-hot efficiency through the
   landing page;
4. no prospective-user identifier crosses from placement through landing into
   the installed app;
5. no report or UI calls a view, landing action, or hot lead a verified install;
6. the lead generator receives no list of viewers, visitors, app users, or
   downstream activity;
7. payment remains correct when landing measurement is unavailable;
8. evidence conflict, counter manipulation, cap exhaustion, replay, and
   payment failure have explicit states;
9. a third-party observer and settlement implementation can reproduce the
   canonical calculation; and
10. another distribution technology can implement the abstract suite without
    importing Telegram objects.

## 18. Justification in one sentence

> Onym can pay anyone who measurably introduces the app to an audience and
> compare aggregate campaign efficiency without constructing a record of who
> installed it, who referred them, or what they later did.
