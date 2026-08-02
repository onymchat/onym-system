---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 02.08.2026
---

# Onym Charity Interface Attribution Extension

**Optional extension draft 0.1 — August 2026**

> Attribution is a separately accepted, weak aggregate claim. It is not part
> of donation validity and never identifies or owns a donor.

This extension lets a deployment measure qualifying donation volume carrying
a shared interface-channel label such as `onym-messenger`. It is not part of
the base [Charity Contract Boundary](Charity.md). The validity and meaning of a
base donation do not change when this extension is absent, unsupported, or
declined. A provider that offers only an attributed route discloses that limit
before selection and does not describe it as a base protocol requirement.

The extension cannot prove that someone installed an application, saw a
particular message, was newly acquired, or was uniquely influenced by one
party. The label is intentionally copyable and supplies only weak aggregate
source evidence.

## 1. Selection and authority

The deployment advertises this extension in the optional
`CharityDeployment.extensions` array using the exact extension profile ID,
digest, and authenticated endpoint. A Discovery catalog advertises the
extension only by referencing that signed deployment; catalog inclusion is not
acceptance. Before the donor accepts it, the UI shows:

- the shared channel label and its publisher;
- the campaign and quote to which it applies;
- every party that receives the label or aggregate evidence;
- retention and public-disclosure rules;
- the data controller, finite retention period, deletion policy, and
  authenticated withdrawal route;
- the offer or measurement purpose; and
- that declining attribution does not invalidate the base donation.

The extension must not change amount, asset, fees, recipient, destination,
priority, eligibility, refund rights, or service. If a provider will not offer
an unattributed route, that limitation is disclosed during provider selection,
not presented as a property of the charity protocol.

## 2. Extension objects

The objects below travel beside, not inside, the base quote, intent, and
receipt. This avoids cyclic digests and lets a base-only implementation reject
or ignore the extension without changing payment semantics.

### 2.1 Attribution Binding

```json
{
  "attributionVersion": 1,
  "extensionProfile": "<profile-id-and-digest>",
  "bindingId": "<provider-unique-id>",
  "baseQuote": "<quote-id-and-digest>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "channelId": "onym-messenger",
  "publisher": "onym:key:<channel-publisher>",
  "recipients": ["onym:key:<evidence-recipient>"],
  "controller": "onym:key:<attribution-data-controller>",
  "purpose": "aggregate-campaign-volume",
  "retentionPeriod": "P90D",
  "deletionPolicy": "<content-addressed-deletion-policy>",
  "withdrawalEndpoint": "<authenticated-withdrawal-endpoint>",
  "expiresAt": "<timestamp>",
  "financialProvider": "onym:key:<provider-id>",
  "signature": "<financial-provider-signature>"
}
```

`channelId` is a short allow-listed shared value. It is never generated per
person, device, install, contact, message, deep link, wallet, or donation.
`retentionPeriod` is finite and cannot exceed `P365D` in this v1 profile; a
deployment may choose a shorter maximum. “Indefinite” is invalid. The
controller, purpose, recipients, retention, deletion policy, and withdrawal
endpoint inherit the controller/purpose/retention duties of the Charity privacy
boundary and are covered by the binding signature and donor acceptance.

### 2.2 Attribution Acceptance

```json
{
  "acceptanceVersion": 1,
  "baseIntentId": "<intent-id>",
  "baseIntentDigest": "<authorized-intent-digest>",
  "attributionBindingDigest": "<binding-digest>",
  "privacyDisclosureDigest": "<disclosure-digest>",
  "expiresAt": "<timestamp>",
  "authorization": "<operation-scoped-user-authorization>"
}
```

This authorization covers only the attribution attachment. Failure or refusal
does not alter the base intent authorization. A provider never treats an
attribution acceptance as financial authorization.

### 2.3 Attribution Receipt Evidence

```json
{
  "evidenceVersion": 1,
  "evidenceId": "<issuer-unique-id>",
  "baseReceipt": "<receipt-id-and-digest>",
  "baseIntentDigest": "<authorized-intent-digest>",
  "attributionBindingDigest": "<binding-digest>",
  "attributionAcceptanceDigest": "<acceptance-digest>",
  "channelId": "onym-messenger",
  "qualifyingAmount": "<profile-defined-net-amount>",
  "asset": "<asset-and-network-id>",
  "status": "qualifying | corrected | excluded",
  "correctsEvidenceDigest": null,
  "reasonCode": "<profile-defined-reason>",
  "recordedAt": "<timestamp>",
  "issuer": "onym:key:<evidence-issuer>",
  "signature": "<evidence-issuer-signature>"
}
```

A `qualifying` record uses `correctsEvidenceDigest: null`. A `corrected` or
`excluded` record requires the digest of the immediately preceding evidence for
the same receipt, creating an append-only correction chain. `corrected`
replaces the prior qualifying amount with the exact remaining amount after
refunds or reversals; it is not a delta. `excluded` sets `qualifyingAmount` to
zero. Failed, pending, or duplicate base outcomes that never had qualifying
evidence are excluded by omission. If evidence was already issued, exclusion
requires an `excluded` correction rather than deletion or mutation of the
signed history.

The evidence `issuer` must exactly equal the Attribution Binding's
`financialProvider`. A recipient is authorized to receive evidence, not mint
it. Evidence from any other key is `ATTRIBUTION_EVIDENCE_INVALID`, even if that
key appears in `recipients`.

Receipt-level attribution evidence is private to the accepted recipients by
default because its amount, time, and receipt reference can expose transaction
linkage even without PII. Publishing it requires a separate explicit
disclosure and is not required for conformance. Public aggregate reports
suppress or bucket small counts and contain no receipt, donor, beneficiary,
device, or message identifiers.

### 2.4 Attribution Withdrawal

```json
{
  "withdrawalVersion": 1,
  "withdrawalId": "<user-generated-random-id>",
  "attributionAcceptanceDigest": "<acceptance-digest>",
  "latestEvidenceDigest": null,
  "requestedAt": "<timestamp>",
  "expiresAt": "<timestamp>",
  "authorization": "<operation-scoped-user-authorization>"
}
```

The donor may withdraw before or after receipt evidence is issued. When no
evidence exists, `latestEvidenceDigest` is `null` and the provider stops future
processing. When evidence exists, the withdrawal pins its latest digest; the
provider appends an `excluded` correction, removes the value from subsequent
aggregates, stops future use, and deletes private receipt-level attribution
data from active stores under the accepted deletion policy. Every accepted
recipient has the same deletion duty. `withdrawalId` makes retry idempotent, and
an expired withdrawal authorization is never replayed as a new request.

Withdrawal cannot erase signed copies already exported or records a named law
requires a controller to retain. Those limits and their retention deadline must
have been disclosed before acceptance; immutable evidence is corrected rather
than rewritten. Withdrawal never cancels, refunds, delays, or otherwise changes
the base donation.

## 3. Privacy and misuse rules

1. No per-person, per-device, per-install, per-contact, or persistent referral
   value is permitted.
2. The channel cannot affect price, service, eligibility, ordering, or trust.
3. Donation amount and timing may still be linkable through a public financial
   rail; the UI discloses this correlation risk before acceptance.
4. Evidence recipients receive only the accepted extension objects or an
   aggregate proof, never chats, contacts, credentials, or local history.
5. A channel cannot create a permanent royalty or downstream relationship to a
   donor or beneficiary.
6. Reports describe the label as copyable weak evidence and never as verified
   acquisition or unique influence.
7. The controller and every recipient stop use and delete private evidence at
   withdrawal or the finite retention deadline, subject only to a specifically
   disclosed legal-retention exception.

## 4. Errors

Attribution errors are separate from base Charity errors:

| Code | Meaning | Required handling |
|---|---|---|
| `ATTRIBUTION_UNSUPPORTED` | the client or provider does not implement the selected extension profile | skip attribution and continue or reconcile the valid base donation |
| `ATTRIBUTION_BINDING_INVALID` | the binding signature, profile, endpoint, purpose, recipient, retention, or expiry is invalid | reject the extension binding only; do not change price, service, or base authorization |
| `ATTRIBUTION_ACCEPTANCE_INVALID` | the scoped authorization does not cover the exact binding, disclosure, intent, or expiry | make no attribution claim; preserve the base intent and payment path |
| `ATTRIBUTION_EVIDENCE_INVALID` | issuer, correction link, base reference, amount, asset, or status is invalid | exclude the evidence from aggregates; retain the base receipt and settlement result |
| `ATTRIBUTION_WITHDRAWAL_FAILED` | the provider cannot authenticate or complete the requested withdrawal/deletion action | disable attribution locally, preserve request evidence, show the authenticated controller route, and leave the base donation unchanged |

No `ATTRIBUTION_*` code is a reason to reject, retry, delay, reprice, refund, or
reauthorize the base donation. A UI presents it as an extension-only result and
continues base reconciliation independently.

## 5. Conformance

A conforming implementation tests that:

1. removing the binding, acceptance, evidence, and withdrawal objects leaves
   the base quote, intent, receipt, and payment outcome valid and byte-identical;
2. a changed quote, campaign, channel, recipient, purpose, disclosure, or
   expiry invalidates the extension acceptance without invalidating payment;
3. user-, device-, install-, contact-, message-, and donation-specific channel
   fixtures fail;
4. failed, pending, duplicate, refunded, and reversed value is excluded or
   corrected through an exact `correctsEvidenceDigest` chain under declared
   arithmetic;
5. only the binding's `financialProvider` can issue receipt evidence;
6. retention above the profile maximum fails, and authorized withdrawal before
   or after evidence issuance stops processing, creates any required exclusion,
   and exercises the accepted deletion policy without changing payment;
7. each `ATTRIBUTION_*` failure leaves base authorization, submission,
   settlement, refund rights, price, eligibility, and service unchanged;
8. small-count reports are suppressed or bucketed;
9. receipt-level attribution evidence is private by default and public
   aggregates contain no transaction references; and
10. a base-only UI can verify the donation while making no attribution claim.
