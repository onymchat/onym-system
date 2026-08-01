# Onym Acquisition Contract Boundary

**Architecture draft 0.1 — August 2026**

> An acquisition provider may host a landing experience and earn for a
> declared conversion outcome. Onym measures only an order-sized aggregate;
> it does not tell the installed app who acquired the user.

This document defines the technology-neutral contract between an Onym
campaign sponsor, an independent acquisition provider, and the publisher of
the advertised application. It starts with an aggregate hot lead and ends
with the strongest privacy-preserving acquisition event a selected app store
can report.

The contract does not require a particular landing-page stack, app store,
analytics vendor, payment rail, settlement currency, or campaign sponsor. The
first store mappings are specified in
[Acquisition-App-Store.md](Acquisition-App-Store.md) and
[Acquisition-Google-Play.md](Acquisition-Google-Play.md).

This is proposed architecture. No current Onym repository implements this
contract, its store evidence adapters, or its settlement flow.

## 1. Decision

Onym permits aggregate acquisition measurement but rejects person-level
install attribution.

- Anyone may publish an acquisition-provider offer and host a conforming
  landing page.
- A sponsor chooses whether to accept the offer, reserves a finite budget,
  and authorizes one acquisition order.
- Every visitor in an order uses the same landing route and the same
  store-campaign cohort token. Neither value identifies a visitor.
- The app store may internally connect a store visit with a download or
  acquisition under its own published rules.
- Only a delayed, thresholded aggregate leaves the store boundary.
- The installed app receives no acquisition-order, landing-provider,
  campaign, referral, advertising, or visitor identifier.
- Payment follows the metric and uncertainty rules fixed by the order. It
  creates no ownership interest in an acquired user or their future activity.

This is privacy-preserving attribution, not a claim that the app store
observes nothing. Apple or Google necessarily handles account, device,
network, and download data to operate its store. The Onym guarantee is that
the acquisition protocol does not export or reconstruct a person-level join
between the landing visit, store event, and app identity.

## 2. Division of ownership

- The **campaign sponsor** defines the goal, approves the experience, accepts
  an offer, and funds a capped order.
- The **acquisition provider** owns or lawfully operates the landing origin,
  presents the approved experience, and routes hot leads to the selected
  store.
- The **application publisher** controls the store listing and authorizes a
  shared campaign cohort for the order.
- The **store evidence oracle** reads privacy-preserving aggregate reports
  under delegated publisher authority and signs a normalized snapshot.
- The **settlement provider or escrow**, when used, reserves and pays the
  order without receiving visitor or app-user records.
- The **prospective user** may arrive, continue, download, install, launch, or
  leave without becoming an Onym attribution record.
- The **app store** defines the observable acquisition event, attribution
  window, reporting delay, privacy threshold, suppression, correction, and
  counter semantics.

One party may hold several roles, but evidence must continue to identify the
authority behind each statement. Anyone can host a page; only the application
publisher or its delegated oracle can obtain authoritative store aggregates
for that application. Open participation does not bypass store ownership or
grant access to a publisher's console.

## 3. Boundary with lead generation

The lead-generation contract produces aggregate cold exposure, landing, and
hot-intent evidence. Its declared hot-lead action—normally “Continue to
install”—is the acquisition contract's input.

```text
lead-generation seat                         acquisition seat

cold exposure -> landing arrival -> hot lead | -> store listing
                                             | -> store acquisition aggregate
                                             | -> capped settlement
                                             |
                                             `-> installed app gets no cohort
```

The acquisition provider may also be the landing operator used by the lead
contract. That does not merge the two payment obligations:

- the lead generator is paid under the lead order's delivery metric;
- the acquisition provider is paid under its own offer and order; and
- neither receives a continuing royalty attached to a person.

The two reports may share `campaignId`, compatible windows, and a signed
handoff aggregate. They never share a visitor-level event or capability.

## 4. What can and cannot be measured

### 4.1 Portable stages

The abstract funnel contains these aggregates:

- **eligible hot leads:** valid redemptions of the lead contract's declared
  landing intent action;
- **store intents:** eligible outbound selections of a store link, when this
  is distinct from the hot-lead action;
- **store listing events:** store-defined product-page visits, impressions,
  or install-button selections, when available; and
- **store acquisitions:** the selected store profile's acquisition event,
  such as a first-time download or store-listing acquisition.

An implementation must use the store's exact term. `storeAcquisition` is a
portable category, not permission to relabel a download, button click,
redownload, device installation, launch, account creation, or retained user as
the same thing.

### 4.2 Why exact universal install counting is unavailable

An exact hot-lead-to-device-install join normally requires a shared token to
reach the installed app, an advertising identifier, a device fingerprint, a
receipt correlation, or a platform attribution postback. Those mechanisms
either create person/device-level linkage or rely on a platform-specific
privacy system with materially different semantics.

The portable Onym baseline therefore accepts store-reported aggregate
acquisition evidence. It can answer:

> How many acquisitions did the store attribute to this shared order cohort?

It cannot answer:

> Which visitor installed, which Onym identity they became, or what they did
> after installation?

### 4.3 Efficiency

For compatible aggregates and one measurement window:

```text
hotToStoreIntentRate = eligibleStoreIntents / eligibleHotLeads
hotToAcquisitionRate = eligibleStoreAcquisitions / eligibleHotLeads
intentToAcquisitionRate = eligibleStoreAcquisitions / eligibleStoreIntents
costPerAcquisition = settledAcquisitionAmount / eligibleStoreAcquisitions
```

Division by zero or a suppressed denominator yields `undefined`. A report
must also be `incomplete` when the store has not finalized the window, the
cohort is below its privacy threshold, required data is grouped as “Other,”
or the store no longer supports the pinned breakdown.

## 5. Privacy profiles

### 5.1 Aggregate cohort profile

The baseline profile requires:

1. one opaque acquisition-order route shared by every visitor in the order;
2. one store-campaign cohort token shared by the whole order;
3. no visitor-specific query parameter, cookie, storage identifier, pixel,
   fingerprint, advertising ID, email, account, or device identifier;
4. no deferred deep link or install-referrer value delivered to the app;
5. no clipboard, receipt, login, or network-timing correlation;
6. aggregate store evidence only;
7. delayed release and suppression below the declared privacy threshold;
8. no attempt to subtract overlapping reports to reveal a small cohort;
9. a generic application launch with no campaign callback; and
10. deletion of ephemeral landing capabilities after redemption or expiry.

The order token may be visible to the store because the store needs a cohort
label. It must not be unique per person and must terminate at the store
reporting boundary.

### 5.2 Network-observation limitation

A directly visited landing host and network intermediaries can observe
connection metadata while serving the page. A conforming provider commits not
to retain, export, enrich, or join that metadata for acquisition measurement.
Necessary security logs must have declared fields, access, and maximum
retention and must never enter campaign evidence.

This commitment is auditable policy, not a cryptographic guarantee against a
malicious host. A stronger implementation may place an oblivious HTTP relay,
trusted privacy proxy, or equivalent separation in front of the provider so
the page operator does not receive the visitor's network address. Such a
profile must state what the relay learns and must remain replaceable.

### 5.3 Small-cohort protection

An order declares `minimumReportableCohort`. The effective threshold is the
maximum of:

- the contract's declared minimum;
- the store's applicable threshold; and
- any higher threshold selected by the evidence oracle.

Below that threshold, evidence reports `suppressed`; it does not disclose an
exact zero or positive count. The order must choose in advance whether a
suppressed cohort rolls into a wider time bucket, combines with compatible
orders for analytics only, earns a fixed fee, or remains non-settleable.
Combining cohorts must not be used to allocate hidden individual conversions
back to providers.

## 6. Contract objects

### 6.1 Acquisition Profile

```json
{
  "profileVersion": 1,
  "profileId": "onym:acquisition-profile:aggregate-store-v1",
  "interface": "onym-acquisition-v1",
  "inputStage": "hot-lead",
  "outputStage": "store-acquisition",
  "privacy": "shared-cohort-no-app-attribution-v1",
  "evidenceSchema": "onym:acquisition-evidence-v1",
  "settlementSchema": "onym:acquisition-settlement-v1",
  "errorSchema": "onym:acquisition-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

### 6.2 Store Implementation Profile

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:acquisition-implementation:<store>-v1",
  "acquisitionProfileId": "onym:acquisition-profile:aggregate-store-v1",
  "storeEvent": "<exact-store-defined-event>",
  "cohortParameter": "<store-specific-shared-token>",
  "attributionWindow": "<store-defined-or-order-bounded-window>",
  "reportingDelay": "<store-defined-delay>",
  "privacyThreshold": "<store-defined-and-order-minimum>",
  "evidenceSource": "<store-report-and-version>",
  "oracleModel": "<delegated-reader-and-signature-policy>",
  "appReceivesCohort": false,
  "signature": "<implementation-profile-publisher-signature>"
}
```

### 6.3 Provider Offer

Anyone may publish a signed `AcquisitionProviderOffer`:

```json
{
  "version": 1,
  "offerId": "<random-id>",
  "provider": "onym:key:<acquisition-provider>",
  "landingOrigin": "https://<provider-origin>",
  "supportedProfiles": ["onym:acquisition-profile:aggregate-store-v1"],
  "supportedStores": ["<implementation-profile-id>"],
  "experienceBundle": "<content-addressed-template-or-capabilities>",
  "privacyProfile": "shared-cohort-no-app-attribution-v1",
  "retentionPolicy": "<content-addressed-policy>",
  "paymentModels": ["fixed-window", "per-hot-lead", "per-store-intent", "per-store-acquisition"],
  "payoutCoordinates": "<payment-rail-specific-reference>",
  "validUntil": "2026-08-01T00:00:00Z",
  "signature": "<provider-signature>"
}
```

Publishing an offer creates no entitlement to traffic or payment. The sponsor
may reject an origin, template, price, privacy profile, jurisdiction, or
evidence arrangement.

### 6.4 Acquisition Order

The accepted and funded order binds:

```json
{
  "version": 1,
  "orderId": "<random-id>",
  "campaignId": "onym:campaign:<random-id>",
  "leadOrderIds": ["<compatible-lead-order>"],
  "sponsor": "onym:key:<sponsor>",
  "provider": "onym:key:<acquisition-provider>",
  "applicationPublisher": "onym:key:<publisher>",
  "implementationProfileId": "onym:acquisition-implementation:<store>-v1",
  "applicationReference": "<store-app-id-or-package>",
  "landingRouteId": "<opaque-order-route>",
  "storeCohortId": "<opaque-order-cohort>",
  "experienceHash": "<approved-content-and-behavior-hash>",
  "window": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z",
    "finalizesAfter": "2026-08-15T00:00:00Z"
  },
  "privacy": {
    "minimumReportableCohort": 20,
    "appReceivesCohort": false,
    "smallCohortPolicy": "roll-forward-or-unknown"
  },
  "settlement": {
    "billableMetric": "eligible-store-acquisition",
    "rate": {"minorUnits": 250, "per": 1},
    "currency": "<declared-currency-or-asset>",
    "maximumBillableUnits": 1000,
    "maximumAmount": 250000,
    "paymentRail": "<direct-payment-profile>",
    "escrow": "<optional-escrow>"
  },
  "authorizedOracles": ["onym:key:<store-evidence-oracle>"],
  "evidenceThreshold": 1,
  "sponsorSignature": "<signature>",
  "providerSignature": "<signature>",
  "publisherSignature": "<signature>"
}
```

`minimumReportableCohort` is a protocol floor, not a promise that the store
will report at that size. A production profile may set a higher minimum than
the illustrative value above.

The publisher signature confirms only that the application reference and
store cohort are authorized. It does not make the publisher liable for
settlement unless the order explicitly assigns that role.

### 6.5 Landing Handoff Aggregate

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "acquisitionOrderId": "<order-id>",
  "window": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "eligibleHotLeads": 418,
  "eligibleStoreIntents": 401,
  "hotLeadAction": "continue-to-install-v1",
  "countingPolicy": "onym:tracker-free-landing-v1",
  "rawVisitorEventsExported": false,
  "operator": "onym:key:<acquisition-provider>",
  "signature": "<provider-signature>"
}
```

This statement does not prove unique people. Its counts may be affected by
reloads, automation, shared devices, and the provider's implementation.

### 6.6 Store Acquisition Snapshot

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "acquisitionOrderId": "<order-id>",
  "applicationReference": "<store-app-id-or-package>",
  "store": "<store-id>",
  "storeCohortIdHash": "<hash-of-authorized-cohort>",
  "window": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "eventName": "<exact-store-defined-event>",
  "eventCount": 137,
  "reportingStatus": "final",
  "storeThresholdApplied": true,
  "statisticalNoisePossible": true,
  "sourceReport": "<report-name-version-and-content-hash>",
  "observedAt": "2026-08-15T00:00:00Z",
  "oracle": "onym:key:<store-evidence-oracle>",
  "signature": "<oracle-signature>"
}
```

For a suppressed cohort, `eventCount` is omitted and `reportingStatus` is
`suppressed`. For an unavailable or unfinished report, status is `pending`,
`unavailable`, or `incomplete`; it is never fabricated as zero.

The oracle signature proves what the oracle reported from a named source. It
does not turn proprietary store analytics into independent cryptographic
ground truth.

### 6.7 Efficiency Report

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<random-id>",
  "acquisitionOrderId": "<order-id>",
  "eligibleHotLeads": 418,
  "eligibleStoreIntents": 401,
  "eligibleStoreAcquisitions": 137,
  "storeEventName": "<exact-store-defined-event>",
  "rates": {
    "hotToIntent": "0.959330",
    "hotToAcquisition": "0.327751",
    "intentToAcquisition": "0.341646"
  },
  "settledAmount": {"minorUnits": 34250, "currency": "<declared>"},
  "costPerAcquisition": "250.000000",
  "personLevelAttribution": false,
  "appReceivedCohort": false,
  "status": "final",
  "evidence": ["<handoff-hash>", "<store-snapshot-hash>"],
  "signature": "<report-publisher-signature>"
}
```

Reports are comparable only when store event, attribution window, privacy
threshold, reporting status, cohort rules, and profile versions are
compatible. Apple first-time downloads and Google store-listing acquisitions
must not be combined as though their definitions were identical.

## 7. Common contract surface

| Operation | Input | Result |
|---|---|---|
| `publishAcquisitionOffer` | Provider capabilities, privacy, price | Signed discoverable offer |
| `proposeAcquisitionOrder` | Campaign, app, provider, selected terms | Pending order |
| `authorizeStoreCohort` | Order and application-publisher authority | Store link and cohort commitment |
| `fundAcquisitionOrder` | Maximum liability and payment rail | Reserved budget |
| `activateLanding` | Funded order and approved experience | Order-scoped route |
| `snapshotHotLeadHandoff` | Order and compatible window | Aggregate hot/intention count |
| `snapshotStoreAcquisition` | Finalized store report | Signed aggregate or status |
| `calculateAcquisitionEfficiency` | Compatible aggregates | Aggregate funnel report |
| `calculateAcquisitionSettlement` | Order, store evidence, prior settlement | Capped statement |
| `settleAcquisition` | Accepted statement | Payment reference |
| `disputeAcquisition` | Statement and bounded evidence | Open dispute state |
| `closeAcquisitionOrder` | Final or timeout policy | Closed order and released budget |

There is no operation for `identifyInstaller`, `readInstallReferrer`,
`attachProviderToIdentity`, `callbackFromApp`, or `shareAppActivity`.

## 8. Payment models

The provider's offer declares one or more payment models. The accepted order
pins exactly one or a deterministic combination:

- **fixed window:** payment for operating an approved experience for a fixed
  period and service level;
- **per eligible hot lead:** payment for an aggregate landing handoff under a
  declared counting policy;
- **per eligible store intent:** payment for an aggregate outbound store
  action;
- **per eligible store acquisition:** payment for the store's final,
  reportable acquisition count; or
- **hybrid:** a fixed hosting amount plus a capped performance component.

The model must name who controls the evidence. Provider self-reported hot
leads are weaker evidence than a store-reported acquisition and should be
priced and audited accordingly.

For a cumulative acquisition counter:

```text
cumulativeEligible = min(storeReportedAcquisitions, maximumBillableUnits)
newEligible         = max(0, cumulativeEligible - previouslySettledUnits)
cumulativeGross     = floor(cumulativeEligible * rateMinorUnits / rateUnit)
newGross            = max(0, cumulativeGross - previouslySettledGross)
payableMinorUnits   = min(max(0, newGross + signedAdjustments),
                          remainingOrderBudget)
```

All arithmetic uses checked integers. The statement binds the store event
definition and report hash. Suppressed, pending, noisy, corrected, or
conflicting data follows the order's explicit policy. The settlement engine
must not reverse-engineer a hidden exact count.

Payment is direct campaign consideration from sponsor or escrow to provider.
It is not an app-store purchase by the prospective user, a perpetual royalty,
or a claim on later subscriptions, messages, identity, or financial activity.

## 9. Trust and evidence

The application publisher is the unavoidable authorization bridge to store
analytics. The recommended evidence arrangement is:

1. the publisher creates or authorizes a shared order cohort;
2. the publisher delegates the narrowest available read-only reporting role
   to an oracle;
3. the oracle retrieves only the required aggregate report;
4. the oracle records report identity, version, processing date, checksum,
   cohort, window, suppression status, and count;
5. the oracle signs the canonical snapshot; and
6. sponsor and provider can reproduce settlement from the signed objects.

An oracle must never publish store credentials, raw detailed rows, account
data, device data, or unrelated application metrics. Where a store cannot
scope access narrowly enough, the publisher should operate the oracle itself
or use a constrained export gateway.

Threshold or mutually selected oracles can reduce unilateral misreporting,
but several oracles reading the same store report do not create independent
ground truth.

## 10. Abuse and limitations

### 10.1 Copied cohort links

A shared store link can be copied to another site or channel. Store evidence
then proves acquisition for the cohort, not that the approved landing host
caused every acquisition. Orders must use short windows, secret-before-launch
opaque cohorts, creative checks, caps, anomaly review, and dispute rules.
Visitor-specific tokens are not an acceptable anti-copying measure.

### 10.2 Provider manipulation

A provider can fabricate landing counters, use dark patterns, redirect to the
wrong application, change creative, automate store traffic, or buy installs.
Store acquisition evidence is stronger than provider counters but is not
proof of lawful or organic conduct. The order defines eligibility, audits,
corrections, and suspension.

### 10.3 Store ambiguity

Stores may delay reports, revise counts, apply statistical noise, suppress
small rows, change attribution rules, group data as “Other,” or discontinue a
dimension. `unknown` and `incomplete` are normal outcomes. A sponsor cannot
make the provider bear unlimited reporting risk after the agreed finalization
timeout.

### 10.4 Install is not retention

A download or store acquisition does not prove the app remains installed,
opens successfully, creates an Onym identity, sends a message, or becomes a
paying user. Measuring those events would be a separate, opt-in, privacy-
reviewed contract and is outside this profile.

## 11. Errors and state

| Error | Origin | Required response |
|---|---|---|
| `unsupported_store_profile` | Provider/publisher | Refuse incompatible order |
| `publisher_authority_missing` | Store adapter | Do not activate cohort |
| `budget_unavailable` | Sponsor/escrow | Do not activate landing |
| `landing_origin_unverified` | Provider | Reject or require control proof |
| `experience_mismatch` | Landing audit | Suspend new eligibility |
| `store_target_mismatch` | Landing/store adapter | Stop redirect and dispute |
| `cohort_token_mismatch` | Store adapter | Reject evidence |
| `cohort_token_exposed_to_app` | Privacy audit | Suspend and treat as privacy violation |
| `report_pending` | Store | Wait until bounded finalization time |
| `report_suppressed` | Store/privacy policy | Apply declared small-cohort policy |
| `report_grouped_other` | Store | Mark order non-separable |
| `report_corrected` | Store | Issue append-only correction |
| `report_unavailable` | Store/oracle | Apply timeout, never assume zero |
| `evidence_conflict` | Oracles | Freeze settlement and dispute |
| `traffic_suspected` | Sponsor/store | Quarantine disputed aggregate |
| `settlement_duplicate` | Settlement | Reject replay |
| `payment_failed` | Payment rail | Preserve liability and retry |

Order state:

```text
offered
  -> proposed
  -> publisher_authorized
  -> funded
  -> active
  -> awaiting_store_finalization
  -> reportable | suppressed | incomplete | disputed
  -> statement_accepted
  -> settled
  -> closed
```

A privacy, creative, domain-control, or store-target violation may suspend an
active order. Suspension stops new eligibility but does not erase valid prior
evidence.

## 12. Obligations

### 12.1 Acquisition provider

A conforming provider must:

1. control the declared origin and serve the approved experience;
2. use only the order-scoped shared route and authorized store link;
3. comply with the pinned privacy and retention profile;
4. avoid dark patterns, impersonation, malware, forced redirects, spam, and
   misleading install claims;
5. never add a visitor-specific token or app callback;
6. sign aggregate landing handoffs and append-only corrections;
7. disclose outage, compromise, content change, and third-party subresources;
8. preserve bounded audit evidence without visitor records; and
9. accept only the payment rights stated in the order.

### 12.2 Sponsor

A conforming sponsor must:

1. approve lawful creative and accurate disclosures;
2. reserve the maximum order liability before activation;
3. state payment, evidence, suppression, correction, and timeout rules;
4. not demand exact hidden counts or user-level proof;
5. not combine small cohorts to isolate a visitor;
6. calculate settlement deterministically and idempotently;
7. pay valid statements on the declared rail; and
8. not treat acquisition as ownership of future user activity.

### 12.3 Application publisher and evidence oracle

They must:

1. authorize the exact application, cohort, store, and window;
2. use least-privilege report access where the store permits it;
3. keep console/API credentials out of protocol objects;
4. normalize the store's exact event rather than renaming it;
5. preserve suppression, noise, delay, correction, and uncertainty metadata;
6. expose only the minimum aggregate needed by the order;
7. sign source identity and content hash; and
8. never send the cohort into the installed app.

## 13. Security, privacy, and economic invariants

1. **The app is outside attribution.** It receives no order or cohort value.
2. **One order, one shared cohort.** No value varies per visitor.
3. **Store terms remain visible.** A store event is never called a universal
   verified install.
4. **Small cohorts do not leak.** Suppression is preserved through reports and
   settlement.
5. **Missing is not zero.** Pending, suppressed, noisy, grouped, and
   unavailable data are explicit states.
6. **No subtraction attack.** Overlapping aggregates cannot be differenced to
   reveal a small order.
7. **Anyone may offer; the sponsor chooses.** Permissionless participation
   does not authorize spending or publisher-console access.
8. **Finite liability.** Every order has a metric, rate, cap, budget, window,
   and finalization rule.
9. **Payment is idempotent.** Each reportable unit is settled at most once.
10. **No downstream ownership.** Acquisition payment grants no identity,
    messaging, notary, registry, app, or governance authority.
11. **Evidence remains scoped.** Oracles reveal only order aggregates and
    source metadata required to audit them.
12. **Provider replacement is possible.** Another conforming host can offer a
    new order without migrating user identities or app data.

## 14. Versioning and conformance

- `AcquisitionProfile` changes when stage, privacy, evidence, settlement, or
  error semantics change.
- `StoreImplementationProfile` changes when cohort parameters, store events,
  attribution rules, report format, thresholds, or oracle behavior change.
- Every active order pins exact versions; a later platform change cannot
  silently rewrite historical settlement.
- Store corrections produce signed append-only snapshots referencing the
  superseded evidence.
- Test fixtures cover canonical objects, signatures, suppression, pending
  reports, incompatible event definitions, integer arithmetic, caps,
  duplicate settlement, copied links, oracle conflict, and privacy failure.

## 15. Concrete implementations

- [Acquisition-App-Store.md](Acquisition-App-Store.md) maps an order cohort to
  an Apple campaign link and aggregate first-time-download evidence.
- [Acquisition-Google-Play.md](Acquisition-Google-Play.md) maps an order cohort
  to UTM-tagged Google Play reporting while excluding the app-facing Install
  Referrer API.

Future profiles may use another store or a reviewed aggregate-attribution
system. They must disclose whether the output is a download, acquisition,
installation, install intent, activation, or modeled result.

## 16. Acceptance criteria

The acquisition boundary is successfully separated when:

1. anyone can publish a conforming landing-provider offer;
2. a sponsor and publisher can authorize and fund a finite order;
3. all visitors in an order receive the same store cohort value;
4. the app receives no cohort or provider identifier;
5. the store oracle returns only a signed aggregate or explicit non-result;
6. hot-to-acquisition efficiency can be calculated when definitions and
   thresholds permit it;
7. no UI or report calls a suppressed value zero or a store-specific event a
   stronger event;
8. a provider can be paid under its declared model without receiving app-user
   data;
9. copied links, delayed reports, corrections, oracle conflicts, privacy
   failure, and duplicate settlement have explicit handling; and
10. another store can implement the interface without importing Apple or
    Google objects into the abstract contract.

## 17. Justification in one sentence

> Onym can measure and reward a landing provider's aggregate contribution to
> store acquisition without turning the installed person into the provider's
> trackable asset.
