# Onym Acquisition: Google Play Implementation

**Implementation profile draft 0.1 — August 2026**

> One acquisition order uses one shared UTM campaign value. A publisher-
> authorized oracle reports only Google Play's aggregate store-acquisition
> result; the Onym app never reads an install referrer.

This document implements [Acquisition.md](Acquisition.md) with a UTM-tagged
Google Play store-listing link and aggregate Play Console reports. The
abstract contract remains authoritative for ownership, privacy, offer,
settlement, and dispute behavior.

This profile is proposed architecture. It has not been implemented in the
current Onym repositories.

## 1. Conformance declaration

| Abstract concept | Google Play mapping |
|---|---|
| Application reference | Android package name and Play developer commitment |
| Shared store cohort | One opaque `utm_campaign` value per order |
| Source class | Fixed non-personal `utm_source` such as `onym-acquisition` |
| Store destination | Google Play app store-listing URL |
| Preferred acquisition event | `Store listing acquisitions` |
| Legacy compatible event | `Installers`, only under a separately pinned legacy report profile |
| Evidence source | Play Console Statistics/export or supported acquisition CSV |
| Privacy behavior | Low-volume UTM values may be grouped as `Other` |
| Evidence oracle | Publisher or delegated private report-bucket reader |
| App install-referrer read | Prohibited |

Implementation profile identifier:

```text
onym:acquisition-implementation:google-play-utm-store-acquisition-v1
```

Google Play's metric definition and reporting surface are evolving. From July
2026 its main store-performance reporting emphasizes unique install/open/
pre-registration button clicks rather than successful acquisition outcomes.
Google states that Store listing acquisitions remain available in Statistics
and exports, while legacy acquisition CSVs continue to support their original
metrics. An order must pin one exact report and event definition; it cannot
mix click and acquisition counters.

## 2. Exact event meaning

The preferred v1 output is Google's `Store listing acquisitions` metric:

> the aggregate number of users who visited the store listing and installed
> the app while not already having it installed on another device, as defined
> by the current Play Console report.

This is stronger than an install-button click, but it is still a proprietary
store-defined acquisition. It is not proof of a retained installation, app
launch, Onym identity, unique device for all time, or later activity.

If the preferred metric cannot be broken down by the authorized UTM cohort in
the pinned report, the result is `unsupported` or `unavailable`. The oracle
must not substitute Unique user Install Clicks or a global app-install total.

A legacy profile may instead use the acquisition report's `Installers` field.
That requires a different implementation-profile ID because the cohort,
window, availability, and uniqueness semantics differ.

## 3. Store-link construction

The publisher authorizes a link based on Google's store-listing format:

```text
https://play.google.com/store/apps/details?id=<package-name>&utm_source=onym-acquisition&utm_campaign=<opaque-order-cohort>
```

The final URL is validated against Google's current link and reporting rules.
All visitors in the order receive the same `utm_source` and `utm_campaign`.

- `id` is the advertised application package.
- `utm_source` identifies this protocol/source class, not a visitor.
- `utm_campaign` is the opaque acquisition-order cohort.
- the link contains no `referrer` parameter and no visitor-specific value.

The order commits to the package name, normalized destination hash, source,
and campaign-value hash. A provider cannot swap the application, append its
own referral value, or create a child cohort.

## 4. Install Referrer is outside the privacy profile

Google's Play Install Referrer API can let an installed Android application
retrieve referral content plus click and installation timestamps. That is
precisely an app-facing cross-boundary attribution path.

This profile therefore requires that the Onym Android build:

1. does not include the Play Install Referrer client for acquisition;
2. never calls the Install Referrer service;
3. never reads or uploads a referrer URL or click/install timestamp;
4. never maps a UTM value to an Onym identity, key, account, or device; and
5. has no post-install campaign callback.

Whether Google Play internally retains referral information is part of the
store's operation. Onym does not retrieve it into the application or export
it through this contract.

## 5. Landing behavior

The provider serves one shared route:

```text
https://<provider-origin>/a/<opaque-acquisition-route>
```

After the declared hot-lead action, it opens the authorized UTM-tagged Play
listing. The provider:

- uses no cookies, persistent browser storage, fingerprint, advertising ID,
  analytics pixel, login requirement, or per-visitor parameter;
- does not embed `utm_campaign` in an Onym deep link;
- does not use forced redirects or misleading install UI;
- expires any in-memory landing capability quickly;
- records only aggregate hot-lead and store-intent counters; and
- never receives a callback from the installed app.

Google receives the shared UTM cohort and normal store request/account/device
data under its own terms. The provider and sponsor receive only the normalized
aggregate report.

## 6. Publisher authorization

```json
{
  "version": 1,
  "acquisitionOrderId": "<order-id>",
  "implementationProfileId": "onym:acquisition-implementation:google-play-utm-store-acquisition-v1",
  "packageName": "<android-package>",
  "playDeveloperIdHash": "<publisher-commitment>",
  "utmSource": "onym-acquisition",
  "utmCampaignHash": "<order-cohort-commitment>",
  "destinationUrlHash": "<normalized-url-hash>",
  "authorizedWindow": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "publisher": "onym:key:<application-publisher>",
  "signature": "<publisher-signature>"
}
```

Publisher authorization proves that the package and reporting cohort belong
to the order. It does not give the landing provider access to Play Console.

## 7. Evidence retrieval

The order pins one currently supported source:

### 7.1 Statistics or Store Performance export

The oracle selects the order's UTM source/campaign and reads Store listing
acquisitions for the declared window. Because Google Play's primary 2026 UI
now emphasizes store-intent clicks, the oracle must record the metric name and
must reject a result containing only `Unique user Install Clicks` when the
order bills acquisitions.

### 7.2 Private Cloud Storage report

Google Play makes aggregate reports available in a private Cloud Storage
bucket for the developer account. Current documentation says data is captured
daily and monthly CSV files are posted after a delay, commonly three to seven
days. Supported acquisition exports include UTM source/campaign dimensions and
installer or store-listing-acquisition fields depending on report generation.

A publisher may grant a service account access to the report bucket. The
recommended Onym oracle runs behind a publisher-controlled gateway because a
bucket can contain unrelated applications, cohorts, and commercially
sensitive metrics. The gateway emits only an order aggregate.

The normalized source record includes:

- report family and file/schema version;
- package name;
- report month, row date/window, and processing time;
- acquisition metric name;
- UTM source and campaign commitment;
- exact count or grouping/suppression status;
- source object checksum; and
- documented reporting delay or correction status.

## 8. Normalized snapshot

```json
{
  "version": 1,
  "campaignId": "onym:campaign:<id>",
  "acquisitionOrderId": "<order-id>",
  "applicationReference": "google-play:<android-package>",
  "store": "google-play",
  "storeCohortIdHash": "<utm-campaign-hash>",
  "window": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "eventName": "google-play-store-listing-acquisition",
  "eventCount": 151,
  "reportingStatus": "final",
  "minimumReportableCohort": 20,
  "utmGroupedAsOther": false,
  "source": {
    "report": "<pinned-statistics-or-export-report>",
    "schemaVersion": "<observed-version>",
    "contentHash": "<normalized-source-hash>"
  },
  "observedAt": "2026-08-15T00:00:00Z",
  "oracle": "onym:key:<google-play-evidence-oracle>",
  "signature": "<oracle-signature>"
}
```

If Google groups the UTM value into `Other`, `eventCount` is omitted and
`reportingStatus` is `grouped`. If the report is unfinished, status is
`pending`; if the selected report no longer exposes the metric/dimension pair,
status is `unsupported`. None is equivalent to zero.

## 9. Efficiency and settlement

For one final compatible window:

```text
hotToPlayAcquisitionRate = playStoreListingAcquisitions / eligibleHotLeads
intentToPlayAcquisitionRate = playStoreListingAcquisitions / eligibleStoreIntents
costPerPlayAcquisition = settledAcquisitionAmount / playStoreListingAcquisitions
```

A `Unique user Install Clicks` report can be included as an intermediate store
intent metric. It cannot settle an order whose billable metric is Store
listing acquisitions.

Small UTM cohorts may become `Other`, making exact per-provider acquisition
settlement impossible. The order therefore chooses before activation whether
to:

- wait for a wider compatible reporting window;
- use a fixed hosting component;
- pay from a declared reportable tier; or
- close the performance component after a bounded timeout.

The parties must not subtract global totals or adjacent UTM cohorts to infer a
hidden count. Corrections are signed append-only evidence and follow the
order's declared reconciliation policy.

## 10. Privacy and security properties

1. Every order visitor receives the same UTM campaign value.
2. The app neither links the Install Referrer library nor queries its service.
3. No UTM/referrer data is stored with an Onym identity.
4. Only aggregate Play Console/export evidence leaves the publisher gateway.
5. Low-volume `Other` grouping is preserved.
6. A store click is distinguished from a store acquisition.
7. The report reader receives the minimum feasible bucket access and never
   exposes credentials or unrelated rows.
8. Landing metadata is not joined to Play account, device, or install data.

The app's absence of Install Referrer behavior should be testable from source,
dependency manifests, binaries, and observed network traffic. A written
promise alone is insufficient for a default curated directory.

## 11. Failure and dispute mapping

| Condition | Required outcome |
|---|---|
| Package or UTM authorization absent | Order cannot activate |
| Landing redirects to wrong package | Suspend and dispute |
| Provider adds per-visitor referrer | Privacy violation |
| App calls Install Referrer | Privacy violation and profile nonconformance |
| Report contains clicks but not acquisitions | `unsupported` for acquisition billing |
| UTM campaign grouped as `Other` | `grouped`, not zero |
| Export not posted yet | `pending` |
| Metric/dimension removed | `unsupported`; apply timeout policy |
| Report corrected | Append corrected snapshot |
| Shared link copied elsewhere | Quarantine disputed aggregate |
| Oracle bucket access fails | `unavailable`; never assume zero |
| Oracles normalize different rows | Freeze performance settlement |

## 12. Required implementation components

1. Publisher-controlled UTM cohort authorizer;
2. order-scoped tracker-free landing host;
3. Play URL and package validator;
4. private report-bucket or export gateway;
5. versioned Store listing acquisitions normalizer;
6. explicit detector for click-only, `Other`, pending, and unavailable data;
7. signed evidence and append-only correction store;
8. deterministic efficiency and settlement engine; and
9. build-time and runtime checks proving the app does not read Install
   Referrer data.

## 13. Conformance tests

A conforming implementation proves that:

1. all test visitors receive identical UTM source/campaign values;
2. visitor-specific values and `referrer` parameters are rejected;
3. the destination binds the publisher-authorized package;
4. the Android app has no acquisition Install Referrer dependency or calls;
5. no UTM value enters identity, account, message, or app analytics state;
6. Store listing acquisitions and install-button clicks cannot be confused;
7. `Other`, pending, unsupported, and unavailable outcomes do not become zero;
8. report credentials and unrelated rows cannot be recovered from evidence;
9. corrections and duplicate snapshots cannot double-pay; and
10. a change in Google metric semantics requires a new pinned profile.

## 14. Official references

- Google, [Understand and grow your app's user base](https://support.google.com/googleplay/android-developer/answer/9859173?hl=en-EN)
- Google, [Download and export monthly reports](https://support.google.com/googleplay/android-developer/answer/6135870?hl=en)
- Android Developers, [Linking to Google Play](https://developer.android.com/distribute/marketing-tools/linking-to-google-play)
- Android Developers, [Google Play Install Referrer](https://developer.android.com/google/play/installreferrer)

These pages are external platform specifications and may change. Production
orders must pin the observed report, schema, metric, and attribution semantics.
