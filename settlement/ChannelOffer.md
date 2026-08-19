---
status: draft
proposed: Claude & @rinat-enikeev
date: 19.08.2026
---

# Onym Channel Offer

**Commercial boundary draft 0.1 — August 2026**

> A seat owner publishes what its service costs. A frontend publisher decides
> whether it can sell that through its distribution channel. The signed document
> between them says what each is owed, on what basis, and by when — before the
> first customer pays, and in terms neither can restate afterwards.

[WHITEPAPER.md](../WHITEPAPER.md) §16.1 names the fields a `ChannelOffer` must
carry and §17.6 describes the settlement waterfall in prose. This document pins
both into a signed, content-addressed object, and defines the statement and
payout cycle that measures performance against it.

A `ChannelOffer` is a commercial agreement between two named parties. It is not
a protocol permission: direct protocol use, self-hosting, and zero-priced access
remain permissionless, and nothing here gates them. What it governs is one
specific arrangement — this seat's offer, sold through this frontend, on this
platform channel.

## 1. Decision

Three authorities stay separate, and the offer is where they meet:

- The **seat operator** owns its service, its terms, and its price. It publishes
  a `SeatOffer` in its signed service manifest.
- The **frontend publisher** owns its distribution channel, its store products,
  and its customer relationship. It decides whether it can sell a given seat
  offer at all.
- The **billing broker** validates purchases with the platform and issues the
  entitlement the operator verifies. In an Apple-backed channel the publisher and
  the broker are the same legal entity, because Apple remits to the publisher.

Neither party can unilaterally alter signed commercial terms. An operator cannot
turn its manifest into a new store product at runtime; a publisher cannot reduce
an operator's share by restating the basis after proceeds arrive.

## 2. Why this document exists separately

**Because the settlement basis is the whole argument.** A percentage is
meaningless without saying what it is a percentage *of*. "70% of the price"
and "70% of what the platform actually remits" differ by the platform's
commission and by every store-collected tax — routinely a third of the number,
and more on some storefronts. [WHITEPAPER.md](../WHITEPAPER.md) §17.6 insists the
basis be defined from platform reports rather than an assumed universal
percentage, and that is the single most common way these agreements go wrong.

**Because the operator cannot see the money.** Proceeds move platform → publisher
under a contract the operator is not party to, reported in files the operator
cannot read, on a schedule the publisher does not control. The operator's
protections are therefore contractual and procedural, not observational: a signed
basis, a statement it can dispute, a reserve that bounds clawback, a payout
deadline, and the ability to stop serving. This document specifies those, and is
honest that it cannot specify verification of the underlying number (§7.3).

**Because the person buying deserves to see it.** The consent surface shows the
operator, the service, the price, the commission, and who settles
([WHITEPAPER.md](../WHITEPAPER.md) §16.2). That requires the commission to be a
published field rather than an internal arrangement.

## 3. The document

Canonical bytes are the object with `signatures` omitted, keys sorted by UTF-8
byte order, no insignificant whitespace, integer-only numbers. The
`channelOfferId` is `sha256:<hex>` over those bytes.

```json
{
  "version": 1,
  "type": "ChannelOffer",
  "channelOfferId": "sha256:<hex>",

  "componentId": "onym:component:<seat-operator>",
  "offerId": "<offer-id-from-the-operator-manifest>",
  "manifestDigest": "sha256:<hex>",
  "frontend": "onym:component:<frontend>",
  "billingBroker": "onym:key:<broker-issuer>",
  "operator": "onym:key:<operator>",
  "operatorLegalName": "<registered name>",
  "operatorJurisdiction": "<jurisdiction of incorporation>",

  "channel": {
    "kind": "apple-iap",
    "productId": "<store product identifier>",
    "productType": "auto-renewable-subscription",
    "bundleId": "<app bundle identifier>",
    "storefronts": "all-available"
  },

  "price": {
    "basis": "platform-price-schedule",
    "referencePriceMinor": 299,
    "referenceCurrency": "USD",
    "scheduleDigest": "sha256:<hex of the price schedule as configured>"
  },

  "commission": {
    "shareBase": "publisher-proceeds",
    "operatorShareBps": 7000,
    "frontendCommissionBps": 3000
  },

  "settlement": {
    "basis": "platform-financial-reports",
    "basisDefinition": "<the exact report, line, and definition; see §5.1>",
    "period": "P1M",
    "periodCloses": "last-day-of-calendar-month",
    "statementDueDays": 15,
    "payoutDueDays": 45,
    "minimumPayoutMinor": 5000,
    "minimumPayoutCurrency": "USD",
    "refundReserveBps": 500,
    "reserveReleaseDays": 120,
    "fx": {
      "policy": "publisher-reported",
      "source": "<named rate source and fixing date>",
      "conversionCostBearer": "operator"
    },
    "payoutFees": {"bearer": "operator", "itemised": true},
    "withholding": {
      "policy": "as-required-by-publisher-jurisdiction",
      "treatyReliefRequires": ["<tax residency certificate>", "<platform form>"],
      "grossUp": false
    },
    "taxTreatment": "<who is deemed supplier for VAT/GST, and what each party owes; see §5.4>"
  },

  "retention": {
    "publisherBillingRecords": "<duration and what is kept>",
    "publisherLinkageRecords": "<duration for account-to-seat-key linkage>"
  },

  "serviceFailure": {
    "availabilityTarget": "<measurable target>",
    "measuredBy": "<named probe or evidence>",
    "creditBps": 1000
  },

  "refunds": {
    "platformUnilateral": true,
    "clawback": "netted against the next period's payable, capped at that period's payable plus the held reserve"
  },

  "revocation": {
    "entitlementIssuer": "onym:key:<broker-issuer>",
    "verificationMethod": "ed25519-detached-over-canonical-json",
    "revocationEpochUrl": "<https url>",
    "maximumRevocationLatency": "PT1H15M"
  },

  "dispute": {
    "notice": "P30D",
    "forum": "<per ../arbitration/Arbitration.md>",
    "governingLaw": "<jurisdiction>"
  },

  "anchor": {
    "mode": "anchor-and-attest",
    "network": "<chain>",
    "contract": "<contract address>",
    "asset": "<settlement asset, or null under anchor-and-attest>"
  },

  "validFrom": "2026-10-01T00:00:00Z",
  "validUntil": "2027-09-30T23:59:59Z",
  "terminationNotice": "P90D",

  "signatures": [
    {"party": "onym:key:<broker-issuer>", "signature": "<base64 ed25519>"},
    {"party": "onym:key:<operator>", "signature": "<base64 ed25519>"}
  ]
}
```

**Both signatures are required.** A single-signed offer is a proposal. A frontend
that presents a paid offer whose `ChannelOffer` carries only its own signature is
selling terms the operator has not agreed to.

## 4. Fields that decide money

### 4.1 `commission.shareBase`

The only conforming value in a platform-billed channel is `publisher-proceeds`:
what the platform actually reports as remittable to the publisher, after platform
commission and store-collected taxes, before any publisher deduction.

`storefront-price` is **non-conforming** as a share base in a platform channel.
It describes a number the publisher never receives, and an agreement written
against it either bankrupts the publisher or is quietly reinterpreted later —
which is the same failure with a delay.

`operatorShareBps + frontendCommissionBps` must equal `10000`. Stating both is
redundant and deliberate: the redundancy is a consistency check, and the
frontend's commission must be a published number because the consent surface
shows it.

### 4.2 `settlement.basisDefinition`

Free text, and the most important field in the document. It names the exact
platform report, the exact line within it, and the exact definition being used —
not "proceeds", which is a word several reports use for different quantities. A
`ChannelOffer` whose `basisDefinition` cannot be resolved to a specific reported
figure by a reader holding the reports is not finished.

### 4.3 `refundReserveBps` and `reserveReleaseDays`

The platform refunds unilaterally and retroactively, after the operator has
already spent the storage or bandwidth. The reserve is withheld from each
period's payable and released after `reserveReleaseDays`, netting refunds that
arrive in the interval. `clawback` bounds the operator's downside to the current
payable plus the held reserve — without that cap, a refund wave in a quiet month
turns a payable into a debt, which no operator should sign.

### 4.4 `revocation.maximumRevocationLatency`

The honest value is the operator's revocation-poll interval plus the broker's
epoch-publication interval — not the entitlement lifetime. A broker that
publishes hourly to an operator polling every fifteen minutes states `PT1H15M`.
Stating the entitlement TTL here overstates responsiveness by orders of
magnitude, and a refund dispute is exactly where that gets tested.

### 4.5 `retention`

[Interface.md](../interface/Interface.md) §8 permits a publisher that also
operates a billing broker to hold the minimum records for the commercial
relationship, and requires each `ChannelOffer` to declare the fields and the
retention period. Two clocks, because they are two different records:

- **Linkage records** — which platform account bought access for which seat key.
  This is the privacy-sensitive one. It should outlive the refund window and a
  plausible dispute, and nothing more.
- **Billing records** — the commercial and accounting trail, carrying no seat
  key. This is governed by statutory retention, which is measured in years.

Declaring one number for both is a declaration that the longer one applies to the
sensitive record. State both.

## 5. What the platform rail forces

### 5.1 Proceeds are private and late

The settlement basis is a report the operator cannot read, arriving on the
platform's schedule. `statementDueDays` and `payoutDueDays` are measured from
period close for exactly this reason, and periodic settlement is not a
convenience — it is the only shape available.

### 5.2 The publisher is the seller of record

The platform remits to the entity publishing the frontend. That entity is
therefore the settlement counterparty, the refund counterparty, and the party the
customer's dispute reaches. An operator selling through this channel accepts that
counterparty risk, and may publish a direct-payment offer for people who prefer
another rail — but a frontend distributed through a store with anti-steering
rules **must not render that direct offer**. The operator publishes it; the
frontend does not show it.

### 5.3 A curated catalog is not a permissionless one

Store products are configured before they can be sold, so an arbitrary new seat
cannot become a purchasable product at runtime. Inclusion in a particular app's
commercial catalog is a business relationship, and this document is that
relationship. Whether a store's review process accepts a *multi-operator* catalog
at all is a deployment question the protocol cannot answer
([WHITEPAPER.md](../WHITEPAPER.md) §16.1), and the low-risk shape is a single
operator the publisher is contractually responsible for delivering — which, with
this document signed, is precisely true.

### 5.4 Tax is not one thing

`taxTreatment` must distinguish, by name: the platform's role as deemed supplier
or commissionaire for consumption tax on storefronts where it acts as one; the
publisher-to-operator leg, which is ordinarily a business-to-business supply the
operator invoices for; withholding, which depends on the publisher's jurisdiction
and the operator's residency; and corporate income tax, which is each party's own
and must not be conflated with any of the above.

## 6. Statement and payout cycle

```text
period closes
  -> publisher receives platform reports          (platform schedule)
  -> publisher computes and signs a Statement     (within statementDueDays)
  -> publisher publishes the statement digest     (§7)
  -> operator acknowledges or disputes            (within dispute.notice)
  -> publisher pays                               (within payoutDueDays)
  -> reserve for the period releases              (after reserveReleaseDays)
```

A `Statement` is signed by the publisher and content-addressed:

```json
{
  "version": 1,
  "type": "Statement",
  "channelOfferId": "sha256:<hex>",
  "periodId": 202610,
  "currency": "USD",
  "proceedsMinor": 412300,
  "operatorShareMinor": 288610,
  "reserveHeldMinor": 14431,
  "clawbackMinor": 0,
  "payableMinor": 274179,
  "lines": [{"productId": "…", "units": 1420, "proceedsMinor": 412300}],
  "signature": "<base64 ed25519>"
}
```

All amounts are integer minor units. The operator either `acknowledges` the
digest or `disputes` it with a reason digest; silence past `dispute.notice` is
acceptance. A disputed period is still paid to the extent it is undisputed —
withholding an entire payable over a contested line is a lever this cycle does
not grant.

## 7. Anchoring

`anchor.mode` takes two values.

**`anchor-and-attest`** — the agreement digest and each period's statement digest
and figures are recorded on chain by the publisher, and acknowledged or disputed
on chain by the operator. Money moves off chain by ordinary commercial rails.

**`anchor-and-pay`** — the same, plus the payout executes on chain in
`anchor.asset`, so the transfer is verifiable against the statement it settles.

### 7.1 What anchoring proves

That the publisher published these figures, at this time, permanently, and that
the operator accepted or disputed them. A publisher cannot quietly revise a
statement it has anchored, and cannot later claim an operator agreed to something
it disputed. That is a real property and it is the reason to anchor.

### 7.2 What anchoring does not prove

**That the figures are correct.** Proceeds originate at the platform, are private,
and arrive in files no chain can read. There is no oracle. A chain records what
the publisher chose to publish — signed, timestamped, and permanent — which is
notarisation, not trust minimisation. Describing an anchored statement as
"verified on chain" would be false, and this document forbids that
characterisation in any surface shown to an operator or a person.

### 7.3 What actually protects the operator

The signed agreement, which is enforceable; the reserve cap, which bounds
clawback; the payout deadline, which makes default legible; the dispute forum;
and the ability to stop serving. Anchoring makes the record undeniable. It does
not make the number true, and it must not be sold as if it did.

### 7.4 Choosing `anchor-and-pay`

On-chain payout adds verifiable settlement and a set of real costs: the publisher
holds a funded hot key; on-ramping is a regulated activity performed by a third
party; the payee address may be subject to screening obligations and, for a
permissioned asset, to freezing by its issuer; several jurisdictions treat each
payout as a taxable disposal; and the operator must be willing and able to hold
and off-ramp the asset in order to be paid at all.

`anchor-and-attest` is the recommended default because it delivers the property
of §7.1 in full and carries none of these. `anchor-and-pay` is the operator's
election, per agreement, and a publisher should offer it rather than impose it.

## 8. Versioning and conformance

- A `ChannelOffer` is immutable. Changed terms are a new document with a new
  `channelOfferId`, a new `validFrom`, and both signatures.
- Terms bind forward. A purchase settles under the offer in force when it was
  made, and a superseding offer does not restate a period already closed.
- `terminationNotice` runs from written notice; entitlements already issued run
  to their own expiry, and the final period settles on the ordinary cycle.
- A frontend refuses to present a paid offer when: either signature is missing or
  invalid; `manifestDigest` does not match the manifest it verified;
  `shareBase` is not `publisher-proceeds`; the share fields do not sum to
  `10000`; `now` is outside `validFrom`/`validUntil`; or the store product is
  unknown to it.

## 9. Boundary against neighbouring documents

**Seats.** A `ChannelOffer` never alters what a seat does, what it retains, or
what it discloses. The operator's `ServiceManifest` and its seat-specific terms
remain the authority on the service; this document governs only how it is sold
and settled. In particular, a backup operator's `BackupTerms`
([../backup/UI-Backup.md](../backup/UI-Backup.md) §5.4) is unaffected by the
commercial arrangement, and a snapshot's pinned terms are not a commercial
document.

**Entitlements.** The credential the broker issues
([WHITEPAPER.md](../WHITEPAPER.md) §17.5) carries no platform account, no
transaction identifier, and no global identity — the commercial relationship
recorded here and the access credential presented to an operator are deliberately
disjoint, and the operator learns the seat key and the plan, never the buyer.

**Interface.** [Interface.md](../interface/Interface.md) §5.2 requires the
frontend's commission to be disclosed on any channel a person knowingly bills
through, §8 governs what billing state the publisher may hold, and §13 maps a
refusal to `payment_required` with the price, payee, commission, and total shown
before retry. This document supplies the numbers those requirements display.

**Arbitration.** [../arbitration/Arbitration.md](../arbitration/Arbitration.md)
supplies the dispute forum named in `dispute.forum`. This document does not
define one.

## 10. Acceptance criteria

A `ChannelOffer` is complete when:

1. a reader holding the platform reports can resolve `basisDefinition` to a
   specific reported figure without asking either party;
2. both signatures verify over canonical bytes, and `channelOfferId` matches;
3. the share fields sum to `10000` and `shareBase` is `publisher-proceeds`;
4. an operator can compute its own expected payable from a period's reports and
   this document alone, and reconcile it against the publisher's statement;
5. every retention period the publisher relies on is declared here, in the two
   classes of §4.5;
6. the maximum revocation latency stated is one an operator can meet with its
   configured poll interval; and
7. no surface anywhere describes an anchored statement as verification of the
   underlying figures.

## 11. Justification in one sentence

> Writing the commercial terms of a seat sale into a signed, content-addressed
> document — with the settlement basis defined against the platform's own reports
> rather than a headline price — lets a small operator sell through someone
> else's storefront without having to trust that the split it was promised is the
> split it will be paid.
