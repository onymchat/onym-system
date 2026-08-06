---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Interface Contract Boundary

**Architecture draft 0.1 — August 2026**

> The interface is a window, not a gatekeeper. It presents the network and
> the user's choices honestly, holds no accounts, owns no users, and can
> always be replaced without asking anyone.

This document defines the technology-neutral boundary for the **interface
seat**: the applications through which people use the Onym network. A
conforming interface may be a native mobile app, desktop app, web client,
command-line tool, accessibility-first interface, institutional console, or
embedded component.

The **interface seat** is the same seat that [whitepaper
§7](../WHITEPAPER.md#7-messenger-and-ui-seat) calls the **Messenger and UI
seat**; it is not an additional role. `Interface.md` defines that seat's
user-facing obligations, while the sibling `UI-X.md` documents define its
boundaries with particular counterparties.

The interface is the one seat that is party to every other UI ↔ seat
boundary — [identity](../identity/UI-Identity.md),
[message](../message/UI-Message.md), [blob](../blob/UI-Blob.md),
[notary](../notary/UI-Notary.md), and the service and institutional seats.
Those documents fix what the interface may ask of each counterparty. This
document fixes the obligations the interface owes the **user**: honest
presentation, bounded authority, disclosed economics, and a permanent exit.

This contract does not require a platform, UI toolkit, distribution channel,
programming language, update mechanism, or business model. A concrete
implementation profile must define its supported seat profiles, release
integrity mechanism, and conformance evidence.

This is proposed architecture. The current Onym clients implement parts of
this contract; §18 records the known gaps honestly.

## 1. Decision

Onym separates presenting the system from owning the user.

- Anyone may build, distribute, and charge for an interface without
  permission from the Foundation, the protocol authors, or any other seat.
- An interface authenticates nothing about the person except what the
  identity vault proves; it maintains no server-side account of its own as a
  condition of use.
- The user's identity, conversations, groups, funds, names, and service
  selections survive the interface: switching or running several interfaces
  concurrently requires no one's consent and loses no protocol state.
- An interface earns from its own pricing and from disclosed marketplace
  commissions — never from the user's data, attention, or captivity.

The governing rule of the whitepaper applies with full force: the interface
may exercise the minimum authority required to present choices and construct
protocol objects, and it may earn only when a user chooses it.

## 2. Roles and authority

| Role | Holds | Must never hold |
|---|---|---|
| Interface publisher | Source, releases, pricing, its own brand and support channel | User accounts as a gate, root secrets, a veto over the user's seat selections |
| Distribution channel | Store listing, payment processing for the app itself | Authority over protocol state or other seats' revenue |
| Identity vault | Root secret and purpose keys (its [own boundary](../identity/UI-Identity.md)) | — |
| User | Every selection: interface, couriers, notary, registries, services | — |
| Other seats | Their own boundaries, invoked by the interface on the user's instruction | Influence over how the interface renders competitors |

One organization may publish an interface and also operate other seats. The
authorities remain separate: operating a courier gives its interface no right
to preselect that courier silently, and publishing an interface gives its
operator no right to read what the courier carries.

## 3. What the interface does

A conforming interface:

1. presents identities and qualified claims without conflating them — a
   display name, a registry claim, and a key are three different things and
   are rendered as such;
2. keeps secrets behind the identity-vault boundary and invokes typed vault
   capabilities instead of handling raw key material;
3. renders the exact transport, notary, registry, service route, and price
   the user selected — what is shown is what will be used;
4. constructs and validates protocol objects, and refuses to render invalid
   ones as valid;
5. maintains local state encrypted at rest;
6. obtains meaningful consent for every signature and payment through
   protected consent surfaces (§7);
7. exposes export and migration paths (§10) in the running product, not in a
   support document; and
8. warns — plainly, before the action — when a selected component is
   incompatible, unaudited, unavailable, or privacy-degrading relative to the
   user's current selection.

## 4. What the interface must not do

1. **No account gate.** It must not require registration with the publisher,
   a phone number, an email address, or any publisher-held identifier as a
   condition of using the protocol.
2. **No silent steering.** It must not redirect, reorder, default, or delay a
   user's service choice to favor a commission, an affiliate, or the
   publisher's own seats. A default must be labeled as a default and be
   replaceable in place.
3. **No surveillance revenue.** It must not collect, sell, or monetize
   person-level behavioral data. Diagnostics are opt-in, aggregate,
   documented, and off by default.
4. **No dark patterns on protected surfaces.** Consent, payment, safety
   warnings, recovery, and export surfaces carry no advertising, no
   sponsorship placement, no urgency theater, and no design that makes
   refusal harder than acceptance.
5. **No retention hostage.** It must not degrade export, migration, or
   concurrent use of another interface, and must not treat leaving as a
   failure mode to be interrupted.
6. **No invented authority.** It must not claim approval, verification, or
   endorsement it does not have, and must not present a Discovery listing,
   audit attestation, or registry claim as anything stronger than what the
   signed object actually says.

## 5. Boundary objects

The interface's counterparty objects are defined by the seat boundaries it
invokes. Two objects are its own:

### 5.1 Release manifest

Every distributed build is described by a signed release manifest:

| Field | Meaning |
|---|---|
| `manifestId` | Stable unique identifier for this manifest |
| `publisher` | Signing identity of the interface publisher |
| `profileVersion` | Interface contract and implementation-profile version used by the build |
| `version` | Human-readable version and monotonic build identifier |
| `artifacts` | Content hashes of the distributed binaries or bundles |
| `sourceRef` | Source revision the build claims to correspond to, when source is published |
| `profiles` | Seat implementation profiles this build supports |
| `channels` | Distribution channels this release is published to |
| `issuedAt` | Manifest issuance time |
| `supersedes` | Prior manifest identifier, or null for the first release |
| `signature` | Publisher signature over the canonical manifest |

The manifest lets an auditor, a distribution channel, or a cautious user
bind "the app I run" to "the code that was reviewed". Where reproducible
builds are not yet achieved, the manifest must say so rather than imply
verification that does not exist.

A release manifest is the publisher's signed claim, not an independent
assurance result. Exact-artifact review, build-provenance claims, expiry,
supersession, and revocation are owned by the [audit
boundary](../audit/Audit.md). An audit attestation references the exact
manifest and artifact hashes it examined; an interface must never render the
publisher's manifest alone as an audit.

### 5.2 Commission disclosure

When the interface operates a billing channel for other seats, the
commission is defined by its signed
[`ChannelOffer`](../WHITEPAPER.md#161-channel-offer), and the interface
renders it as a line item before consent. There is no undisclosed spread: the
price the provider offered, the commission, and the total the user pays are
all visible on the payment surface.

## 6. Selection and presentation

The interface is how competition between seats becomes real:

- every replaceable component — courier, media store, notary, registry,
  bank, discovery provider — is replaceable *from the interface*, by the
  user, at any time;
- comparison views show the signed facts (price, terms, attestations,
  availability) and never a secretly weighted order;
- Discovery catalogs may be integrated, with the provider and its inclusion
  policy identified, and direct manual entry always available beside them;
- warnings from §3.8 appear at selection time and again at first use, not
  buried in settings.

## 7. Consent surfaces

Signatures move funds, change group state, enroll [recovery
trustees](../recovery/Recovery-Trustee.md), and bind names. The surfaces that
obtain this consent are **protected**:

1. the object being signed is summarized in the user's language, with the
   full canonical object one gesture away;
2. the counterparty, the price, the commission, and the irreversibility of
   the action are stated before the confirming gesture;
3. nothing on the surface is sponsored, animated toward acceptance, or
   defaulted to the more expensive choice; and
4. a declined consent leaves no protocol trace and triggers no retaliation
   in the interface's behavior.

The [sponsorship contract](../sponsor/Sponsor.md) permits recognition only on
resources in a signed `RecognitionInventory`, which may include a specifically
declared acknowledgement area in a foundation-published app. Under this
interface contract, a protected consent surface is never eligible for that
inventory: any acknowledgement area must be separate from consent, payment,
safety, recovery, and export surfaces. No sponsor recognition, sponsored
placement, or consideration for placement may reach a protected surface.

## 8. Data and privacy boundary

The interface necessarily sees more than any other seat: plaintext after
decryption, drafts, contact labels, usage rhythm. Therefore:

- local state is encrypted at rest and excluded from cloud backup unless the
  user explicitly includes it;
- plaintext, keys, and social graphs never leave the device except as
  protocol objects the user chose to send;
- crash and performance diagnostics, if offered, are opt-in, stripped of
  message content and identifiers, and documented field by field;
- the interface adds no tracking pixels, third-party analytics SDKs, or
  fingerprinting to any surface, including its web presence inside the app.

If the publisher also operates a billing broker or support service, it may
hold the minimum subscription, entitlement, refund/revocation, tax, support,
and provider-settlement records required for that service. Each
`ChannelOffer` or support contract declares the fields and retention period:
only for the active commercial relationship plus a stated dispute, accounting,
or legally required retention period, after which records are deleted or
lawfully anonymized. This state is neither a publisher account required for
protocol use nor a behavioral record, and it cannot gate direct or free seat
access.

If the publisher designates a moderation authority
([../moderation/Moderation.md](../moderation/Moderation.md)), it may
additionally hold **sanction state**: mandate enrollments, the signed
verdicts it executed, the device-mark write log, and platform device marks
(which by design survive uninstall). Like billing state, this is disclosed
at consent, bounded by the moderation contract's own retention and expiry
rules, and is neither an account required for protocol use nor a behavioral
record — it records adjudicated cases, not usage. It never gates direct
protocol use, and outside an executed verdict's terms it grants the
publisher no authority.

What the interface cannot hide: the platform it runs on may observe app
usage, notifications, and network timing. A conforming interface documents
this honestly instead of promising privacy it cannot deliver.

## 9. Economics

An interface may earn from:

| Source | Condition |
|---|---|
| App pricing | Purchase, subscription, or feature tiers for the interface itself |
| Marketplace commission | Disclosed per §5.2, only on channels the user knowingly bills through |
| Support and deployment services | Institutional contracts that grant no protocol privilege |

An interface must not earn from selling defaults, ranking, user data,
attention, or exclusivity. A publisher's other businesses buy no placement
its competitors cannot have for free.

## 10. Replaceability and exit

1. Export produces the user's protocol state — identity material via the
   vault's own ceremony, conversations, group descriptors, selections — in
   documented formats, without fee, delay, or account.
2. The same identity may run in several interfaces concurrently; the
   interface must tolerate state it did not author.
3. Uninstalling the interface deletes its local state and nothing else. No
   publisher-held account or behavioral record exists to delete. Billing or
   support state described in §8 may remain until its disclosed retention
   period expires; the interface exposes cancellation and any available
   deletion request, and states what must be retained and until when.
   Sanction state described in §8 — including platform device marks —
   deliberately survives uninstall for exactly the terms the executed
   verdicts declare; it clears by expiry, reversal, and the moderation
   contract's defaults, not by reinstalling.
4. A discontinued interface strands nothing: the publisher's disappearance
   removes support, not access.

## 11. Distribution and build integrity

- Releases are signed; the signing identity is published and stable.
- Source-available publication and reproducible builds are the goal; until
  achieved, the release manifest records the gap (§5.1).
- Distribution through app stores follows the
  [acquisition](../acquisition/Acquisition.md) boundary's aggregate-only
  measurement: the interface does not tell the publisher who installed it.
- An update must not silently change the user's selections, weaken a privacy
  default, or re-ask a consent the user already refused, without presenting
  the change as a change.

## 12. Common contract surface

| Operation | Input | Result |
|---|---|---|
| `inspectRelease` | Distributed artifact | Validated publisher manifest, exact-artifact audit attestations, or explicit absence |
| `listComponents` | Seat type and optional discovery catalogs | Signed candidates plus a direct-entry path |
| `selectComponent` | User choice and implementation profile | Persisted local selection or typed incompatibility |
| `prepareAction` | User intent and selected profiles | Canonical unsigned protocol object and validation result |
| `requestConsent` | Canonical object, effects, price, and counterparty | Decline, or one bounded authorization for that exact action |
| `invokeComponent` | Selected component and authorized object | Unmodified typed counterparty result; never a silent substitute |
| `quoteChannelOffer` | `SeatOffer` and signed `ChannelOffer` | Provider price, commission, total, and retention terms |
| `exportState` | Holder ceremony and export scope | Documented portable protocol and local state |
| `importState` | Documented portable state | Validated local reconstruction without an ownership change |
| `eraseLocalState` | Holder confirmation | Local deletion result plus any separate billing/support retention notice |

These operations are local unless they explicitly invoke a selected seat or
billing broker. There is no operation for `createPublisherAccount`,
`silentlySubstitute`, `autoPay`, `sellBehavior`, or `blockExport`.

## 13. Error semantics

The interface normalizes its own and counterparty failures to stable,
technology-neutral codes while preserving any signed or profile-specific
detail. Concrete profiles may map transport statuses such as HTTP `402` to
these codes; the abstract interface uses `payment_required`.

| Error | Responsible party | Required remedy |
|---|---|---|
| `counterparty_unavailable` | Selected seat or network | Preserve the real pending/failed outcome; offer retry or a user-chosen route change |
| `counterparty_rejected` | Selected seat | Render its typed reason and authoritative state; do not blame or rewrite it |
| `payment_required` | Provider and selected billing channel | Show the `ChannelOffer` price, payee, commission, and total; require fresh consent before retry |
| `unsupported_profile` | Interface or selected seat | Refuse with both version facts and the compatible choices |
| `vault_refused` | Identity vault or holder policy | Render the refusal and constraint; never re-ask in a loop |
| `manifest_invalid` | Interface publisher or distribution channel | Do not treat the release as verified or claim conformance |
| `artifact_mismatch` | Publisher, distribution channel, or auditor claim | Treat the manifest or attestation as inapplicable to the running artifact |
| `consent_denied` | User | Stop without a signature, payment, protocol trace, or retaliation |
| `selection_unavailable` | Interface | Preserve the user's selection; never substitute the publisher's choice |
| `export_unavailable` | Interface publisher | Preserve state, show the failure, and repair export before claiming conformance |

An interface must not fabricate success, retry a signature without fresh
consent, or blame a competitor's seat without evidence it renders.

## 14. Threat model

| Threat | Control |
|---|---|
| Malicious interface steals secrets | Vault boundary, hardware-backed keys, signed releases, source publication, independent distributions |
| Interface lies about signing intent | Protected consent surfaces, canonical object inspection, conformance fixtures |
| Commission steering | Disclosure line items, labeled and replaceable defaults, §4.2 prohibition |
| Surveillance monetization | §4.3 prohibition, opt-in aggregate diagnostics, no third-party analytics |
| Update attack | Signed releases, release manifests, change-presentation duty (§11) |
| Lock-in by friction | Export/exit obligations (§10), concurrent-interface tolerance |
| Fake endorsement | §4.6 — signed objects rendered no stronger than they are |

No contract makes a compromised device or a hostile publisher harmless.
Open source, reproducible builds, independent audits, and the ability to
walk away remain the real controls; this boundary exists so that walking
away is always possible.

## 15. Obligations

### 15.1 Interface publisher

1. Honor every UI ↔ seat boundary this interface invokes.
2. Publish signed release manifests for every distributed build.
3. Keep protected surfaces free of any third-party or self-interested
   influence.
4. Disclose all revenue mechanics of §9 in the product, before they bind.
5. Ship export, migration, and warning surfaces as working features.

### 15.2 Distribution channel

1. Carries the app under its own store contract; gains no authority over
   protocol state, seat selection, or other seats' revenue.
2. Measured only in aggregates, per the acquisition boundary.

### 15.3 User-facing claims

Marketing may claim conformance only for the profiles listed in the release
manifest, and must repeat the unaudited/alpha status honestly while it is
true.

## 16. Security, privacy, and economic invariants

- **I1.** No publisher-held account is required to use the protocol.
- **I2.** Secrets stay behind the vault boundary; the interface handles
  capabilities, not keys.
- **I3.** What is rendered as selected is what is used; what is rendered as
  a price is what is charged.
- **I4.** Protected surfaces carry no sponsorship, placement, or steering —
  at any price.
- **I5.** Person-level behavioral data is neither collected by default nor
  ever sold.
- **I6.** Export and concurrent use of competing interfaces are permanent
  capabilities, not negotiable features.
- **I7.** The interface earns only when chosen: app pricing and disclosed
  commissions, nothing structural.

## 17. Versioning and conformance

This boundary versions as `onym:interface:v1`. An implementation profile
declares the seat profiles it supports, its release-integrity mechanism, and
its conformance evidence. Conformance fixtures for consent surfaces, export,
and error rendering are open work (whitepaper §21); until they exist,
claims of conformance are self-assessed and must say so.

## 18. Known gaps

The current Onym iOS and Android clients, honestly measured against this
contract:

- release manifests and reproducible builds are not yet implemented;
- export exists for identity material via the vault ceremony, but full
  conversation/state export formats are undocumented;
- conformance fixtures for protected surfaces do not yet exist;
- diagnostics are absent (which conforms), but so is the documented
  opt-in mechanism this contract expects;
- no independent [audit](../audit/Audit.md) attestation of any client has
  occurred.

## 19. Acceptance criteria

An interface conforms when:

1. it passes the boundary contracts of every seat profile it declares;
2. a reviewer can bind a distributed artifact to a signed release manifest;
3. protected surfaces satisfy §7 under the conformance fixtures, once they
   exist, and under manual review until then;
4. export and concurrent-use behaviors of §10 are demonstrable; and
5. its pricing and commission disclosures match what users are actually
   charged.

## 20. Justification in one sentence

The interface sees the most and must therefore own the least: a window with
published prices, protected consent, and a door that always opens outward.

## References

1. Onym system whitepaper, §7, §16–§17, and §21:
   [../WHITEPAPER.md](../WHITEPAPER.md)
2. Onym identity-vault boundary:
   [../identity/UI-Identity.md](../identity/UI-Identity.md)
3. Onym message and blob boundaries:
   [../message/UI-Message.md](../message/UI-Message.md) and
   [../blob/UI-Blob.md](../blob/UI-Blob.md)
4. Onym notary boundary:
   [../notary/UI-Notary.md](../notary/UI-Notary.md)
5. Onym Recovery Trustee boundary:
   [../recovery/Recovery-Trustee.md](../recovery/Recovery-Trustee.md)
6. Onym audit boundary for exact-artifact attestations and build provenance:
   [../audit/Audit.md](../audit/Audit.md)
7. Onym acquisition boundary for aggregate-only distribution measurement:
   [../acquisition/Acquisition.md](../acquisition/Acquisition.md)
8. Onym sponsor boundary for bounded recognition:
   [../sponsor/Sponsor.md](../sponsor/Sponsor.md)
