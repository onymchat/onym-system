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

The deployment advertises this extension by profile ID and digest. Before the
donor accepts it, the UI shows:

- the shared channel label and its publisher;
- the campaign and quote to which it applies;
- every party that receives the label or aggregate evidence;
- retention and public-disclosure rules;
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
  "purpose": "aggregate-campaign-volume",
  "expiresAt": "<timestamp>",
  "financialProvider": "onym:key:<provider-id>",
  "signature": "<financial-provider-signature>"
}
```

`channelId` is a short allow-listed shared value. It is never generated per
person, device, install, contact, message, deep link, wallet, or donation.

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
  "baseReceipt": "<receipt-id-and-digest>",
  "baseIntentDigest": "<authorized-intent-digest>",
  "attributionBindingDigest": "<binding-digest>",
  "attributionAcceptanceDigest": "<acceptance-digest>",
  "channelId": "onym-messenger",
  "qualifyingAmount": "<profile-defined-net-amount>",
  "asset": "<asset-and-network-id>",
  "status": "qualifying | corrected",
  "recordedAt": "<timestamp>",
  "issuer": "onym:key:<evidence-issuer>",
  "signature": "<evidence-issuer-signature>"
}
```

A correction references the original evidence and accounts for exact refunds
or reversals under the selected measurement profile. Receipt-level attribution
evidence is private to the accepted recipients by default because its amount,
time, and receipt reference can expose transaction linkage even without PII.
Publishing it requires a separate explicit disclosure and is not required for
conformance. Public aggregate reports suppress or bucket small counts and
contain no receipt, donor, beneficiary, device, or message identifiers.

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

## 4. Conformance

A conforming implementation tests that:

1. removing every extension object leaves the base donation valid and
   byte-identical;
2. a changed quote, campaign, channel, recipient, purpose, disclosure, or
   expiry invalidates the extension acceptance without invalidating payment;
3. user-, device-, install-, contact-, message-, and donation-specific channel
   fixtures fail;
4. failed, pending, duplicate, refunded, and reversed value is excluded or
   corrected under declared arithmetic;
5. small-count reports are suppressed or bucketed; and
6. receipt-level attribution evidence is private by default and public
   aggregates contain no transaction references; and
7. a base-only UI can verify the donation while making no attribution claim.
