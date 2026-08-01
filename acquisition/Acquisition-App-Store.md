---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Acquisition: Apple App Store Implementation

**Implementation profile draft 0.1 — August 2026**

> One acquisition order uses one shared App Store campaign link. A delegated
> oracle reports only the privacy-protected aggregate of first-time downloads;
> the installed app receives no campaign value.

This document implements [Acquisition.md](Acquisition.md) with Apple App Store
campaign links and App Store Connect Analytics. The abstract contract remains
authoritative for ownership, privacy, offer, settlement, and dispute behavior.

This profile is proposed architecture. It has not been implemented in the
current Onym repositories.

## 1. Conformance declaration

| Abstract concept | App Store mapping |
|---|---|
| Application reference | Apple app ID and bundle ID commitment |
| Shared store cohort | One App Store Connect campaign token (`ct`) per order |
| Publisher/store token | App Store provider token (`pt`) |
| Store destination | App Store product-page campaign link |
| Store acquisition | Campaign-attributed **First-Time Download** |
| Attribution window | Apple's current campaign-link rule, pinned in evidence |
| Privacy floor | Onym order minimum plus Apple's applicable threshold |
| Evidence source | App Store Connect campaign analytics or Analytics Reports API |
| Evidence oracle | Publisher or delegated App Store Connect report reader |
| App callback | Absent |

Implementation profile identifier:

```text
onym:acquisition-implementation:apple-campaign-first-download-v1
```

Apple calls the selected outcome a First-Time Download. This profile must not
rename it a launch, retained installation, account, or unique Onym user.

## 2. Official platform semantics

Apple documents that App Store campaign links use URL campaign parameters and
can measure campaign-attributed downloads. A first download within 24 hours of
using a campaign link or token is currently counted as a First-Time Download;
if more than one campaign link is used in the applicable period, the most
recent link receives credit.

Campaign data appears only after the campaign is old enough and has reached
Apple's minimum number of attributed first-time downloads. At the time of this
profile, Apple states a minimum of five individual users/first-time downloads.
The order may and normally should require a higher Onym privacy threshold.

Apple's downloadable Analytics Reports use privacy-enhancing techniques. Its
documentation states that small rows can be omitted, detailed reports receive
additional safeguards, and a small amount of statistical noise may be added.
Those properties are preserved in the normalized evidence instead of being
treated as errors.

## 3. Store-link construction

The application publisher creates or authorizes a campaign link of the form:

```text
https://apps.apple.com/app/apple-store/id<apple-app-id>?pt=<provider-token>&ct=<order-cohort>&mt=8
```

The final URL must be generated and validated against Apple's current rules;
the example is descriptive, not a permanent URL grammar.

- `pt` is Apple's provider token associated with the application publisher.
  It does not identify the independent Onym acquisition provider.
- `ct` is the campaign token. This profile uses one opaque token for the
  entire acquisition order.
- `mt` is Apple's media-type parameter where required by the current campaign
  link format.

The order commits to a normalized hash of the exact destination. The
acquisition provider receives the authorized URL only after publisher
authorization and funding.

The campaign token:

- contains no identity key, landing-session value, IP-derived value, or human
  readable provider name;
- is never varied per visitor;
- is never written to Onym application state; and
- is not reused across acquisition orders.

## 4. Landing behavior

The acquisition provider serves an order-scoped route shared by all visitors:

```text
https://<provider-origin>/a/<opaque-acquisition-route>
```

After the declared hot-lead action, the provider directs the browser to the
authorized App Store campaign link. The page:

1. uses no cookies, local storage, advertising ID, fingerprint, or analytics
   pixel;
2. does not append a visitor identifier to `ct` or any other parameter;
3. does not require an Onym login or wallet connection;
4. applies a restrictive referrer policy;
5. uses no automatic or deceptive App Store redirect;
6. keeps any one-page capability only until action or short expiry; and
7. reports only aggregate hot leads and outbound store intents.

Apple receives the shared campaign token and its normal store request data.
The landing provider and sponsor do not receive Apple's user-level event.

## 5. Publisher authorization

An `AppleCampaignAuthorization` binds:

```json
{
  "version": 1,
  "acquisitionOrderId": "<order-id>",
  "implementationProfileId": "onym:acquisition-implementation:apple-campaign-first-download-v1",
  "appleAppId": "<numeric-app-id>",
  "bundleIdHash": "<bundle-id-commitment>",
  "providerTokenHash": "<pt-commitment>",
  "campaignTokenHash": "<ct-commitment>",
  "destinationUrlHash": "<normalized-url-hash>",
  "authorizedWindow": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "publisher": "onym:key:<application-publisher>",
  "signature": "<publisher-signature>"
}
```

The public contract need not reveal `pt` or `ct` before activation. Evidence
uses commitments so observers can later verify that the reported campaign is
the authorized cohort without making unused tokens easy to copy.

## 6. Evidence retrieval

The order chooses one source:

### 6.1 App Store Connect campaign view

An authorized publisher operator reads the campaign's First-Time Downloads
after the reporting delay and signs the normalized result. This is suitable
for manual or low-volume pilots, but screenshots alone are dispute attachments
rather than canonical machine evidence.

### 6.2 Analytics Reports API

For automation, a publisher-controlled gateway or delegated oracle downloads
the applicable App Store Downloads analytics report and selects the authorized
campaign cohort and window. The evidence records:

- report request and report names;
- report category and content level;
- processing date and granularity;
- downloaded segment checksums;
- campaign dimension and application reference;
- First-Time Download event definition;
- count or suppression state; and
- whether Apple documents noise for the selected report.

Apple currently requires an Admin role to make the initial analytics-report
request. Once requested, API keys with Sales and Reports or Finance roles can
download generated reports. Because those roles may expose more than one
order, the recommended production design keeps the Apple credential inside a
publisher-operated gateway and returns only an order-scoped signed aggregate.

No Apple credential, raw report segment, or unrelated campaign data is
published in the acquisition protocol.

## 7. Normalized snapshot

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<id>",
  "acquisitionOrderId": "<order-id>",
  "applicationReference": "app-store:<apple-app-id>",
  "store": "apple-app-store",
  "storeCohortIdHash": "<campaign-token-hash>",
  "window": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "eventName": "apple-first-time-download",
  "eventCount": 137,
  "attributionRule": "campaign-link-last-touch-within-24-hours",
  "reportingStatus": "final",
  "minimumReportableCohort": 20,
  "appleThresholdApplied": true,
  "statisticalNoisePossible": true,
  "source": {
    "report": "App Store Downloads",
    "processingDate": "2026-08-11",
    "contentHash": "<normalized-source-hash>"
  },
  "observedAt": "2026-08-12T00:00:00Z",
  "oracle": "onym:key:<apple-evidence-oracle>",
  "signature": "<oracle-signature>"
}
```

The attribution-rule string is versioned. If Apple changes the window or
credit rule, a new implementation profile is required for new orders.

When the campaign does not meet the effective threshold, `eventCount` is
omitted and `reportingStatus` is `suppressed`. When Apple has not completed
processing, the status is `pending`. Neither state is a zero.

## 8. Settlement

A per-acquisition order may pay only the final reportable First-Time Download
count, after applying the order cap. Store suppression means exact
per-acquisition settlement may be unavailable for a small provider.

The order must choose one of these policies before launch:

- wait and roll the same order into a longer compatible window;
- pay the fixed hosting component only;
- settle a declared tier after the cohort becomes reportable; or
- close without a performance component after a bounded timeout.

It must not infer an exact hidden count from Apple totals, adjacent campaigns,
or a before/after subtraction. Apple corrections produce an append-only Onym
correction and follow the order's overpayment policy.

## 9. Privacy and security properties

1. All visitors use the same `ct` value.
2. The installed app receives no `ct`, acquisition order, or provider ID.
3. Onym never asks the app to upload an App Store receipt for attribution.
4. Campaign data is reported only after the effective privacy threshold.
5. Noise, omission, delay, and opt-in restrictions remain visible.
6. The provider learns aggregate outcome, not an Apple account or device.
7. The oracle uses the minimum feasible reporting access and exposes only the
   authorized cohort aggregate.
8. Landing-network metadata is not used to join an App Store event.

This profile does not use post-download usage, sales, subscriptions, sessions,
retention, or deletion reports for settlement. Some Apple analytics in those
areas depend on users opting to share diagnostics and usage data and have
different privacy semantics.

## 10. Failure and dispute mapping

| Condition | Required outcome |
|---|---|
| Missing publisher authorization | Order cannot activate |
| Wrong app ID, `pt`, or `ct` | Stop redirect; reject evidence |
| Campaign below Apple/effective threshold | `suppressed`, not zero |
| Campaign not yet visible | `pending` until bounded finalization |
| Detailed row omitted | Preserve suppression; do not infer |
| Report contains statistical noise | Mark it and apply pinned policy |
| Apple report corrected | Append corrected snapshot |
| Token copied outside approved origin | Quarantine disputed increment |
| App receives campaign data | Privacy violation and suspension |
| Oracle loses report access | `unavailable`; apply timeout policy |
| Two oracles disagree | Freeze performance settlement |

## 11. Required implementation components

1. App Store campaign-link authorizer controlled by the application publisher;
2. order-scoped tracker-free landing host;
3. campaign-token commitment and URL validator;
4. App Store Connect report gateway with least practical privilege;
5. normalizer for First-Time Download campaign aggregates;
6. signed evidence and correction store;
7. deterministic efficiency and settlement engine; and
8. privacy, copy-abuse, dispute, and credential-rotation controls.

## 12. Conformance tests

A conforming implementation proves that:

1. every test visitor receives an identical campaign token;
2. per-visitor query parameters are rejected;
3. the destination binds the authorized app and provider tokens;
4. no campaign value appears in installed-app state or callback traffic;
5. First-Time Download is not relabeled as launch or retained install;
6. thresholds and suppression survive normalization;
7. pending or missing reports do not become zero;
8. noisy and corrected reports retain their metadata;
9. duplicate snapshots cannot pay twice; and
10. the Apple credential cannot be recovered from an Onym object.

## 13. Official references

- Apple, [Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links)
- Apple, [Acquisition analytics](https://developer.apple.com/help/app-store-connect-analytics/acquisition/acquisition)
- Apple, [Analytics Reports API overview](https://developer.apple.com/help/app-store-connect-analytics/overview/analytics-reports-api)
- Apple, [Downloading Analytics Reports](https://developer.apple.com/documentation/AppStoreConnectAPI/downloading-analytics-reports)

These pages are external platform specifications and may change. Production
orders must pin the observed semantics and report version rather than relying
only on this draft.
