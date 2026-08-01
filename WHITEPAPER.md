# Onym System

## A Protocol for Divided Ownership

**Discussion draft 0.5 — August 2026**

> Onym is not one messenger owned by one company. It is a set of compatible
> roles that can be owned and operated by different people: identity,
> interface, transport, notary, naming, lead generation, acquisition, charity,
> and sponsorship, with recruitment across every seat and an open application
> layer.
> Anyone may build a component, operate a service, or assemble a complete
> route. Users decide which participants earn from their use.

This document describes the intended system architecture and economic model.
It distinguishes the software that exists today from proposed protocol work.
It is not an investment prospectus, a claim of production security, or a
promise of financial return.

---

## Abstract

Most online systems concentrate four powers in one operator: the power to name
the user, present the interface, carry the data, and decide whether a shared
action is valid. Even when message content is end-to-end encrypted, that
operator can usually suspend accounts, observe social relationships, change
server behavior, or make the service disappear.

Onym separates these powers.

- **Identity** belongs to the person or organization controlling its keys.
- **Messenger and UI** are interchangeable clients, not account authorities.
- **Transport** carries encrypted envelopes and media without owning identity
  or group rules.
- **Notary** records and verifies shared state without storing conversations or
  a readable membership roster.
- **Association registries** attach human-meaningful names and credentials to
  cryptographic identities without becoming the identities themselves.
- **Applications** such as charitable coordination, payments, commerce, or
  regulated financial services request narrow capabilities from identity
  rather than taking custody of its root secret.
- **Lead generation** lets independent promoters earn for measurable,
  aggregate distribution without learning which people install or use Onym.
- **Acquisition** lets independent landing providers optimize aggregate
  hot-lead-to-store conversion without sending attribution into the app.
- **Sponsorship** lets contributors fund a foundation, receive bounded
  recognition, and enter a defined sponsor-governance class without buying
  authority over users or the protocol.
- **Recruitment** lets every seat publish a participation need and lets anyone
  recruit—with candidate consent, direct self-application, finite rewards, and
  no power to appoint on the destination seat's behalf.

The result is a division of ownership as well as a division of labor. No role
is an exclusive franchise. Anyone can publish a compatible UI, operate a
transport, deploy a notary contract, maintain a name registry, or create a new
application. Anyone may also offer an audience for a funded lead-generation
campaign or host a conforming landing experience for a funded acquisition
order. Anyone may also apply to support a foundation under its published
sponsor and endowment policy. Every seat may publish an opening, and anyone may
self-apply or offer candidate-consented recruiting under a funded order. Each
seat defines its own offers, payment models, credentials, and commercial
terms. A messenger may adapt user-facing service offers to Apple In-App
Purchase, Google Play Billing, or another rail; a campaign sponsor may pay lead
and acquisition providers directly for agreed aggregate outcomes. These
payments are service consideration and voluntary revenue shares, not a tax on
permissionless use of open-source code.

Onym begins as a private messenger because messaging exercises every important
boundary: identity, local secrets, shared groups, delivery, storage,
authorization, and human trust. The same identity and component model can then
support other systems without collapsing them into one super-application or
one owner.

## 1. The thesis: ownership should follow responsibility

Onym uses the word **ownership** in an operational sense.

- A user owns an identity by controlling its private keys.
- A client author owns and publishes a UI implementation.
- A courier operator owns its relay and storage infrastructure.
- A notary provider owns its deployment, funding, service policy, and support
  relationship, while the selected contract code constrains what it may do.
- A registry operator owns its namespace and the policy by which names or
  associations are issued.
- An application provider owns its product, integrations, and legal duties.
- A lead generator owns or lawfully controls its distribution surface and may
  sell a finite, measurable campaign placement without owning the resulting
  users.
- An acquisition provider owns or lawfully operates its landing experience
  and may sell a bounded aggregate conversion service without learning which
  Onym identity a visitor becomes.
- A foundation owns its treasury and controlled recognition resources. A
  sponsor may support them and qualify for a bounded governance path without
  acquiring ownership of the protocol or its users.
- A recruiter owns its search and introduction service. It may earn for
  accepted finite milestones without owning a candidate or the appointment
  decision.

None of these is ownership of the entire network. A **seat** is therefore an
open role in a transaction path, not equity in Onym, a governance token, a
limited validator slot, or a license granted by a central company. There may
be many providers in every seat, and one participant may occupy several seats.
Users should be able to replace one participant without abandoning the whole
system.

This produces a simple rule:

> A component may exercise the minimum authority required for its role, and it
> may earn only when a user or group chooses it for that role.

## 2. Why the messenger is only the first application

A messenger is the most legible expression of Onym, but it is not the system
boundary. The system boundary is a user-controlled identity capable of:

1. authenticating locally;
2. deriving or controlling purpose-specific keys;
3. receiving names and credentials from independent associations;
4. participating in groups governed by verifiable rules;
5. sending encrypted data over replaceable transports;
6. authorizing actions in external applications; and
7. directing payments to selected service providers.

Messaging uses all seven. A charitable association can use the same identity
to establish membership, publish a receiving address, approve disbursements,
and communicate privately. A financial application can use it to present an
account address or request a transaction signature. Neither application needs
the recovery phrase, nor should it learn every other address derived from the
same identity.

Onym is therefore better understood as a **composition protocol**: a way to
assemble user-owned identity, independently operated infrastructure, public
verification, and specialized applications into one route.

## 3. Design principles

### 3.1 No indispensable operator

The default services may make Onym convenient, but the protocol must not make
them sovereign. A user must be able to run or select another compatible
transport and transaction relayer. A group must be able to select another
compatible notary deployment when it is created. A developer must be able to
ship another client without asking permission.

Replaceability does not mean a switch is always free. Moving a group's
canonical state to a different ledger or contract requires an explicit
migration rule. Moving a local identity may require recovery and local data
transfer. The promise is the absence of artificial lock-in, not the absence of
state-transition costs.

### 3.2 Secrets stay at the edge

Private keys and recovery material belong in the user's device, hardware
wallet, or explicitly chosen custody system. UI snapshots, transports,
registries, notaries, plugins, logs, and analytics must not receive raw secret
material.

### 3.3 Public identity is not a public dossier

A cryptographic identity is a stable root of control, not an instruction to
publish a person's names, accounts, relationships, and balances in one global
record. Public keys, names, addresses, and credentials should be revealed per
context and only when necessary.

### 3.4 Protocols before providers

Interoperable request, response, manifest, and test-vector formats define a
seat. A provider is one implementation of that seat. The protocol should remain
usable when the original implementation disappears.

### 3.5 Verifiable claims, explicit trust

Cryptography can prove control of keys, validity of signatures, knowledge of a
group witness, and conformance of an on-chain transition. It cannot prove that
a chosen name is socially deserved, a charity is virtuous, a bank is solvent,
or a UI is honest. Those are policy and trust decisions and must identify the
party making them.

### 3.6 Incentives must not require surveillance

Compensation cannot depend on a public receipt for every private message.
Metering should occur at the coarsest practical boundary—such as a storage
purchase, a notarized operation, or a prepaid service period—and settlement
should be aggregated where possible.

### 3.7 Interoperability is permissionless; endorsement is not

Anyone may implement the public protocols. A curated directory may apply
security, availability, legal, or quality criteria before recommending a
provider. Other parties may publish competing directories. Failure to enter a
default directory must not make a conforming component invalid.

## 4. System model

The system exposes independently replaceable service and governance seats
around an open-ended application layer.

```text
       optional human meaning                 aggregate growth path
+-----------------------------+       +-----------------------------+
| Association registries      |       | Lead generation             |
| names · roles · credentials |       | placements · views · intent |
+--------------+--------------+       +--------------+--------------+
               |                                     |
               |                            aggregate hot lead
               |                                     v
               |                      +--------------+--------------+
               |                      | Acquisition                 |
               |                      | landing · store cohort      |
               |                      +--------------+--------------+
               |                                     |
               v                         download, no cohort to app
+----------------+       +---------+---------+       +-------------------+
| Identity vault |<----->| Messenger / UI    |<----->| Applications      |
| keys · consent |       | policy presentation|      | charity · finance |
| local records  |       | local state        |      | community · trade |
+-------+--------+       +----+-----------+---+       +---------+---------+
        |                     |           |                     |
        | encrypted envelopes |           | proof / operation   | capability
        v                     v           v                     requests
+-------+---------------------+--+    +---+---------------------+---------+
| Courier layer                 |    | Notary layer                       |
| message relay · blob storage  |    | contracts · ledger · state proofs |
| replaceable · multi-provider  |    | group-selected trust bundle       |
+-------------------------------+    +----------------+------------------+
                                                     |
                                                     v
                                    +----------------+------------------+
                                    | Transaction relayers / fee payers |
                                    | submit operations · pay chain fees|
                                    +-----------------------------------+

         Service seats publish offers and accepted payment rails.
         Acquisition campaigns reserve finite direct-payment budgets.

         Foundation sponsorship is a governance/support path outside
         message, identity, notary, and provider authority.
         +-------------------------------------------------------+
         | Foundation support: recognition · endowment · board  |
         +-------------------------------------------------------+

         +-------------------------------------------------------+
         | Recruitment: openings · consented introductions      |
         | reaches every seat; appointment remains at the seat  |
         +-------------------------------------------------------+
```

The **courier** and **transaction relayer** are deliberately separate terms.
A courier moves message or media ciphertext. A transaction relayer submits a
notary operation and may pay its ledger fee. One operator may run both, as the
current default infrastructure does, but the protocols and trust effects are
different.

### 4.1 What changes independently

| Decision | Selected by | Normal replacement boundary |
|---|---|---|
| Identity vault or custody mode | Individual | Key rotation, recovery, or migration |
| UI/client | Individual | At any time, if wire and local export formats match |
| Message relay | Individual or group policy | At any time; multiple relays may be used together |
| Media/blob server | Sender, group, or client policy | Per object or configuration epoch |
| Transaction relayer | Submitter or client policy | Per notary operation |
| Notary contract and ledger | Group at creation | By an explicit group migration operation |
| Association registry | Viewer and identity holder | Per displayed name or credential |
| Application module | Individual or group | Per capability grant or session |
| Charity deployment, credential-issuer policy, and financial binding | User or application under the campaign profile | Per campaign resolution or value-moving authorization |
| Lead-generation placement | Campaign sponsor and generator | Per funded campaign order |
| Acquisition landing provider | Campaign sponsor, publisher, and provider | Per funded acquisition order |
| Foundation sponsorship | Sponsor and foundation under its legal policy | Per contribution, status term, or board term |
| Recruitment provider | Any seat requester and recruiter; candidate may self-apply | Per funded recruitment order or direct application |

This table prevents a common category error: decentralization does not require
every choice to be individual. A group needs one agreed source of canonical
group state. The freedom lies in choosing it and defining migration, not in
pretending contradictory ledgers are simultaneously canonical.

## 5. The identity seat

The technology-neutral vault boundary—custody, capability requests, consent,
descriptors, rotation, and recovery—is specified in
[identity/UI-Identity.md](identity/UI-Identity.md). The current BIP-39
mnemonic and multi-curve derivation implementation is specified separately in
[identity/UI-Identity-BIP39.md](identity/UI-Identity-BIP39.md).

### 5.1 Root secret and recovery

The current Onym clients generate a twelve-word BIP-39 mnemonic locally. BIP-39
turns mnemonic words into a binary seed; it is not itself an identity protocol
and it does not make private material safe to publish. Onym uses
domain-separated derivation to create purpose-specific keys from the seed.

The mnemonic, seed, and derived private keys **must never appear in a public
identity record**. A public identity may contain or reference only public keys,
addresses, service endpoints, and signed claims.

The present mobile derivation produces:

| Key or identifier | Purpose |
|---|---|
| secp256k1 / Schnorr key | Nostr-compatible event operations |
| BLS12-381 key | Private group-membership trees and proof witnesses |
| Ed25519 key and Stellar account ID | Stellar-facing authorization and address representation |
| X25519 key | Sealed inbox envelopes and invitation delivery |
| Inbox tag | Transport discovery without exposing a readable account name |

The present implementation has compatibility constants inherited from the
first clients. Future identity versions should specify their derivation tree,
domain separation, rotation, and test vectors independently of any one mobile
platform.

### 5.2 Public identity document

A future `IdentityDescriptor` should be signed by a currently authorized
identity key and contain a minimal, versioned capability surface:

```json
{
  "version": 1,
  "subject": "onym:key:<self-certifying-id>",
  "sequence": 7,
  "validFrom": "2026-08-01T00:00:00Z",
  "verificationMethods": ["<public-key-descriptor>"],
  "services": ["<encrypted-inbox-or-resolution-hint>"],
  "addressClaims": ["<optional-chain-address-proof>"],
  "previous": "<hash-of-prior-descriptor>",
  "signature": "<identity-signature>"
}
```

This resembles the separation used by decentralized identifier systems—an
identifier resolves to verification methods and optional service endpoints—but
Onym does not need to claim universal DID compatibility in its first version.
Compatibility should be adopted only with a concrete method, privacy analysis,
and test suite.

### 5.3 Blockchain addresses

A BIP-39 seed can be the root from which multiple chain-specific keys are
derived, but it does not automatically produce “any blockchain address.” Each
chain has its own curve, derivation path, encoding, signing rules, and recovery
risks. An Onym chain adapter must therefore define:

1. a versioned derivation or imported-key rule;
2. a chain and network identifier;
3. a public address encoding;
4. a proof-of-control format;
5. a signing capability with human-readable intent;
6. rotation and revocation behavior; and
7. test vectors shared across clients.

To limit cross-application correlation, the preferred default is a distinct
key or account per context. An identity should reveal a binding between two
addresses only when the user explicitly chooses to do so.

### 5.4 Capability boundary

Applications do not request “the seed.” They request a narrow operation:

- sign this human-readable transaction;
- prove control of this address;
- decrypt this envelope;
- prove possession of this credential;
- derive a fresh receiving address for this context; or
- prove current membership in this group.

The identity vault returns a result after local policy and consent checks. This
is the boundary that allows banking, charity, and other applications to connect
without becoming custodians of the whole person.

### 5.5 Recovery and compromise

One mnemonic controlling many domains is convenient but increases blast
radius. A later identity profile should support:

- key rotation without changing every public relationship at once;
- device-specific operational keys beneath an offline recovery authority;
- optional social, hardware, or threshold recovery;
- revocation notifications;
- separate high-value financial keys; and
- migration to post-quantum algorithms when mature profiles exist.

Recovery design is protocol work, not a phrase on a backup screen. Until such
work is implemented, loss or compromise of the recovery phrase must be treated
as catastrophic.

## 6. Association registries: names without identity capture

Cryptographic identifiers are durable but not friendly. An association
registry adds a name, role, membership, or credential as a signed claim about
an identity.

The name is not the identity. The registry is not the owner of the identity.
It is the issuer of one assertion that a client may choose to trust.

### 6.1 Qualified names

Onym should not begin with one universal namespace. Different associations
have legitimate but incompatible naming policies: a professional body, a
family, a game, a municipality, and an anonymous community may all name the
same identity differently.

Clients should therefore display the source of a name, for example:

```text
alice@writers.tallinn
treasurer@helping-hands
0xA17F… · self-described
```

An unqualified `Alice` is local presentation, not a globally unique protocol
fact.

### 6.2 Association record

A minimum record contains:

```json
{
  "registry": "onym:registry:<registry-id>",
  "name": "alice",
  "subject": "onym:key:<subject-id>",
  "scope": ["display-name", "member"],
  "issuedAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2027-08-01T00:00:00Z",
  "sequence": 3,
  "policy": "<hash-or-url-of-issuance-policy>",
  "signature": "<registry-signature>"
}
```

Records must support expiration, supersession, and revocation. Sensitive
personal information should normally be carried in selectively disclosed
credentials rather than a public registry entry.

### 6.3 Registry participation and income

Anyone can operate a registry and publish its trust root, policy, resolution
endpoint, pricing, and settlement address. A registry may charge for issuance,
renewal, dispute handling, or high-availability resolution. Clients and
communities decide which registries to recommend. A paid name does not become
more cryptographically true; it only reflects the stated policy of its issuer.

## 7. Messenger and UI seat

The UI is the user's window into the system, not the user's account provider.
A conforming client may be a native mobile app, desktop app, command-line tool,
accessibility-first interface, institutional console, or embedded component.

Its responsibilities include:

- presenting identities and qualified claims without conflating them;
- keeping secrets behind the identity-vault boundary;
- rendering the exact transport, notary, registry, and price route selected;
- constructing and validating protocol objects;
- maintaining encrypted local state;
- obtaining meaningful consent for signatures and payments;
- exposing export and migration paths; and
- warning when a component is incompatible, unaudited, unavailable, or
  privacy-degrading.

A malicious UI can steal secrets or lie about transaction intent. Open source,
reproducible builds, signed releases, independent distributions, hardware-backed
key isolation, and conformance tests reduce this risk but do not eliminate it.

UI authors may earn their own client fee and, when they operate a billing
channel, the marketplace commission disclosed in its `ChannelOffer`. A UI must
never silently redirect a user's service choice to maximize commission.

## 8. Courier seat: message and media transport

The courier layer moves opaque payloads. It must not interpret group governance,
hold identity secrets, or decide whether a group transition is authorized.

The courier boundary is specified separately for its two service types:

- [message/UI-Message.md](message/UI-Message.md) defines the
  technology-neutral small-message boundary, with the current Nostr mapping in
  [message/UI-Message-Nostr.md](message/UI-Message-Nostr.md); and
- [blob/UI-Blob.md](blob/UI-Blob.md) defines the technology-neutral encrypted
  blob boundary, with the current Blossom mapping in
  [blob/UI-Blob-Blossom.md](blob/UI-Blob-Blossom.md).

Onym currently uses:

- Nostr-compatible WebSocket relays for encrypted events and invitations; and
- Blossom-compatible HTTP servers for encrypted, content-addressed media.

Clients can use multiple message relays, add custom endpoints, and self-host.
The transport interface is intentionally narrower than Nostr so another
backend—Tor hidden services, store-and-forward mesh, local radio, or a future
privacy network—can implement the same courier contract.

A courier may learn IP addresses, timing, payload size, selected topics, and
access patterns. Encryption does not hide these observations. Ephemeral outer
event keys reduce stable sender linkage but do not defeat traffic analysis.
Couriers may also drop, delay, replay, or selectively retain data. Multi-relay
fan-out, deduplication, expiration, padding, privacy networks, and availability
receipts are separate mitigations.

Transport operators can charge by bandwidth, retained byte-time, availability
class, or prepaid service period. Per-message public billing is discouraged
because it creates the metadata trail the courier abstraction is meant to
minimize.

## 9. Notary seat: shared state without a readable roster

The notary answers a narrow public question: **is this proposed transition
valid under the group's chosen rules?** It does not carry conversation content.

The technology-neutral interface and justification for keeping frontend and
notary independently owned are specified in
[notary/UI-Notary.md](notary/UI-Notary.md). The current Stellar/Soroban mapping
is specified separately in
[notary/UI-Notary-Stellar.md](notary/UI-Notary-Stellar.md).

The current implementation anchors group state in Stellar Soroban contracts.
A group is represented by a cryptographic commitment and epoch rather than a
readable member list. A member or quorum generates a zero-knowledge proof on
the client, and the contract verifies that proof before accepting the next
commitment.

### 9.1 Governance flavors

Current contract code defines five group policies:

| Policy | State-transition authority |
|---|---|
| One-on-one | Exactly two members; immutable after creation |
| Anarchy | Any current member |
| Democracy | A threshold of members |
| Oligarchy | A threshold of a hidden administrator set |
| Founder / tyranny | One pinned administrator |

The blunt internal contract names describe authorization topology, not a moral
judgment. User interfaces may present `tyranny` as `founder` while preserving
the exact wire identifier.

### 9.2 Notary bundle

A provider claiming the notary seat publishes a signed bundle containing:

- ledger and network identifier;
- contract addresses and exact code hashes;
- verification-key or parameter anchors;
- supported governance flavors and capacity tiers;
- RPC and indexing endpoints;
- transaction relayer endpoints;
- fee schedule and settlement asset;
- finality, retention, and liveness expectations;
- audit and build-provenance statements; and
- migration or shutdown policy.

Anyone may deploy a compatible contract bundle. A directory may recommend
deployments, but clients verify code and parameter identities rather than trust
a display name alone.

### 9.3 Transaction relayer

The transaction relayer wraps a valid operation in the ledger's transaction
format, submits it, and may pay the network fee. This allows a user to act
without maintaining a funded on-chain account for each messaging identity.

The relayer can refuse service, observe submission metadata, or reorder
competing operations. It cannot create a valid membership proof without the
required witness, and it cannot change an immutable deployed contract's rules.
Users can switch relayers or run their own. Groups should avoid making a single
relayer address part of permanent authorization unless that centralization is
explicitly desired.

### 9.4 Ledger leakage

Zero knowledge is not zero metadata. Depending on the selected policy and
contract, the public ledger may reveal:

- that a group identifier exists;
- contract and governance flavor;
- capacity tier or some count information;
- update timing and frequency;
- current epoch and commitment;
- fee payer and contract target; and
- correlations produced by public transaction ordering.

The notary should publish a machine-readable privacy profile so a UI can show
these disclosures before group creation.

## 10. Connected applications

The identity and notary primitives support more than chat, but extensions must
remain separate applications rather than privileged features baked into the
identity root.

### 10.1 Charity systems

Charity is an open application seat with its own division of responsibility.
Any party may build a donor interface, operate a humanitarian program, issue
organization or eligibility credentials, provide a financial rail, deploy a
notary, or publish audit and impact reports. Open participation does not make
every issuer trusted or every campaign eligible for display: the user or
application selects an explicit issuer and deployment policy.

The boundary is defined in:

- [charity/Charity.md](charity/Charity.md), the technology-neutral campaign,
  donation, beneficiary eligibility, fund-flow evidence, privacy, and
  responsibility contract; and
- [charity/UI-Charity.md](charity/UI-Charity.md), the Onym Messenger user
  interface, private-message, local-authorization, receipt, and aid-claim
  profile.

The split is strict. The user application presents authenticated claims and
exact transaction intent, requests scoped local authorization, and verifies
evidence. The charity side remains responsible for organization verification,
campaign truth, beneficiary selection, allocation, custody, compliance,
refunds, regulators, and real-world delivery. The notary can prove narrow
public state; it cannot prove that an organization is benevolent or that aid
created impact.

“Verified organization” is therefore always qualified: a named issuer attested
that a subject satisfied a named policy, version, scope, and validity period.
Onym does not convert that issuer claim into an unqualified Onym endorsement.

Privacy differs across roles. A campaign receiving address or aggregate fund
flow may be public while a beneficiary identity, source credential, private
conversation, or payout coordinate must not be. Eligibility profiles should
use derived proofs and campaign-scoped nullifiers where possible. Financial
rails may still reveal addresses, values, timing, or regulated identity data;
the UI discloses those limits before authorization.

The collaboration metric “funds through Onym” is defined as qualifying,
finalized value received by verified campaigns under a pinned measurement
profile, net of refunds and reversals by default. It is measured from financial
and notary evidence without messenger PII or behavioral analytics. A shared
`onym-messenger` channel marker can provide weak aggregate source evidence but
cannot prove an install, a unique user, or causation and cannot support a
person-level royalty.

Stellar/Soroban may implement the financial or notary bindings, but it is not
part of the abstract charity contract. A concrete adapter must separately pin
network, contracts, code and deployment hashes, authorization coverage,
events, privacy leakage, administrative powers, finality, and conformance
vectors. Another compatible rail may occupy the same seat.

Each charity participant may define a signed service offer: organization
verification, proof computation, financial settlement, notary operation,
audit, UI, or campaign work may be free, grant-funded, fixed-price,
subscription-funded, or earn a disclosed operation share. Compensation is
never automatic. An authorized buyer accepts it, every deduction appears in
the donor's gross-to-net quote, and payment creates no trust authority or
permanent royalty over a donor or beneficiary.

### 10.2 Payments and banking

A wallet or financial service may use an Onym identity to request proofs of
control, display verified counterparty claims, or ask the local vault to sign a
transaction. It must not receive the mnemonic merely because both systems use
BIP-39.

Onym is not itself a bank, deposit guarantee, exchange, lender, or compliance
authority. A provider offering regulated or custodial services occupies its
own application seat and remains responsible for licensing, disclosures,
sanctions policy, consumer protection, custody, and jurisdictional obligations.
The protocol should make that provider visible rather than laundering its trust
through the Onym name.

### 10.3 General extension contract

Every extension declares:

1. the capabilities it requests;
2. the information it will learn;
3. the parties that operate it;
4. its own offers, accepted payment rails, and settlement terms;
5. its revocation and data-retention policy; and
6. the protocol version and test suite it satisfies.

The user grants capabilities per identity and may revoke them without rotating
the root secret unless a key has actually been compromised.

## 11. Lead generation without install attribution

Lead generation is an open service seat. Anyone may offer a lawful distribution
surface and fulfill a campaign after the sponsor accepts a signed, budget-capped
order. Open participation does not force a sponsor to buy every offer or make
unapproved use of trademarks compensable.

The boundary is defined in:

- [lead/Lead-Generation.md](lead/Lead-Generation.md), the channel-neutral
  campaign, privacy, evidence, efficiency, and settlement contract; and
- [lead/Lead-Generation-Telegram.md](lead/Lead-Generation-Telegram.md), the
  Telegram channel-post implementation.

The design refuses person-level install attribution. It does not put referral
IDs, advertising identifiers, fingerprints, deferred deep links, campaign
cookies, or promoter tokens into the app. A lead generator therefore receives
no perpetual cut attached to a user and learns nothing about the user's later
messages, providers, purchases, or identity.

Instead, a campaign measures an aggregate funnel:

```text
cold exposure
  -> shared tracker-free landing route
  -> anonymous “continue to install” intent
  -> generic or order-shared store cohort link

installed app receives no campaign identifier
```

Each accepted placement receives an opaque order route shared by all of its
viewers rather than unique to a person. It can count aggregate arrivals and
short-lived anonymous intent actions for that generator. A “hot lead” means
that declared landing action, not a unique person or verified installation.
The sponsor can compare cold-to-hot efficiency while the app remains unable to
identify who came from the campaign.

The landing operator may be a separately owned acquisition provider. A store
cohort used by the acquisition contract is shared by the whole order, visible
only as an aggregate outside the store, and never passed into the app. Lead
generation still settles on its own declared delivery metric.

For Telegram, the paid service is the agreed increase in one channel post's
view counter. A designated observer reads the cumulative counter without
intentionally incrementing it, signs baseline/final snapshots, and applies the
order's price per view, view cap, amount cap, and window. Telegram counters are
not proof of unique human attention and can be manipulated, so orders use
finite prepaid budgets, explicit evidence rules, and dispute windows.

Payment is direct from campaign sponsor or escrow to the lead generator. It is
not an In-App Purchase by the prospective user, an install bounty, or a share
of future user activity. Aggregate landing conversion evaluates campaign
efficiency but does not silently replace views as the settlement basis.

## 12. Acquisition without person-level attribution

Acquisition is a separate open service seat. Anyone may offer to host a lawful,
conforming landing experience and convert aggregate hot leads toward an app
store acquisition. The sponsor chooses an offer, the application publisher
authorizes the advertised store listing and cohort, and the order reserves a
finite budget before service begins.

The boundary and initial store mappings are defined in:

- [acquisition/Acquisition.md](acquisition/Acquisition.md), the store-neutral
  privacy, evidence, efficiency, payment, and dispute contract;
- [acquisition/Acquisition-App-Store.md](acquisition/Acquisition-App-Store.md),
  using one shared Apple campaign link and aggregate First-Time Downloads; and
- [acquisition/Acquisition-Google-Play.md](acquisition/Acquisition-Google-Play.md),
  using one shared UTM campaign and an aggregate Google Play acquisition
  report without reading Install Referrer in the app.

The privacy-preserving path is:

```text
aggregate hot lead
  -> acquisition provider's order-scoped landing experience
  -> one store cohort shared by every order visitor
  -> store-defined acquisition aggregate

installed app receives no order, cohort, or provider identifier
```

This does not mean the app store observes nothing. Apple or Google necessarily
handles account, device, network, and download data while operating its store.
The boundary prevents that event from becoming a person-level record shared
with Onym, the sponsor, the landing host, or the lead generator. A directly
visited host can also observe connection metadata, so a conforming provider
must not retain or join it for attribution; a stronger profile can interpose a
privacy proxy or oblivious relay.

There is no universal, exact cross-store “installed app” event. The Apple
profile uses campaign-attributed First-Time Downloads. The Google profile uses
the pinned Store listing acquisitions metric when it remains available for a
UTM cohort. Downloads, button clicks, acquisitions, device installations,
launches, and retained users are not interchangeable.

Low-volume results may be delayed, suppressed, statistically perturbed, or
grouped as “Other.” Such evidence is `pending`, `suppressed`, `grouped`, or
`unavailable`, never silently zero. Orders declare a minimum reportable
cohort, finalization timeout, and small-cohort payment policy before launch.
The protocol forbids subtracting overlapping aggregates to reveal a hidden
small count.

Each acquisition provider defines its offered payment model: fixed hosting,
per aggregate hot lead, per store intent, per reportable store acquisition, or
a capped hybrid. Payment is direct sponsor/escrow consideration for the
declared service. It gives the provider no royalty on the acquired person and
no access to their identity, messages, subscriptions, or later activity.

Anyone can host, but only the application publisher or a narrowly delegated
oracle can obtain authoritative store analytics for that application. This is
an explicit trust boundary, not a hidden Onym monopoly. The oracle signs only
an order aggregate and exposes neither publisher credentials nor unrelated
store reports.

## 13. Sponsorship, recognition, and endowment governance

Sponsorship is an open support seat for foundations built around the protocol.
Anyone may submit a pledge under a published offer. A foundation may accept or
reject it under its lawful gift-acceptance policy, issue transparent sponsor
status, and recognize the sponsor only on resources the foundation actually
controls.

The boundary is defined in:

- [sponsor/Sponsor.md](sponsor/Sponsor.md), the foundation-neutral
  contribution, recognition, board, conflict, endowment, and spending
  contract; and
- [sponsor/Sponsor-Onym.md](sponsor/Sponsor-Onym.md), the proposed Onym
  Foundation implementation.

An accepted sponsor may contribute to operating funds, restricted funds,
board-designated reserves, or permanent endowment. The receipt names the real
fund class; it does not call every donation an endowment or promise a tax
deduction, investment return, token, equity, or future user revenue.

Recognition is bounded to a signed inventory such as a foundation sponsor
page, annual report, hosted event, grant page, newsletter, or nonintrusive
acknowledgements screen in a foundation-published client. It is visibly
labelled and grants no provider ranking, conformance mark, security approval,
protocol privilege, or placement in independently owned resources.

A board is finite, so contribution cannot create unlimited automatic seats.
The proposed Onym implementation uses a nine-director board:

```text
3 Sponsor Directors
3 Ecosystem Directors
3 Independent Public-Interest Directors
```

Qualifying sponsors join a Sponsor Council and may nominate, elect, and stand
for the three Sponsor Director seats. Each seated director receives one equal
vote and can propose, deliberate, and vote on budgets and endowment spending.
The sponsor class cannot form a majority; the chair and treasurer come from
the non-sponsor classes.

Sponsor Directors are fiduciaries of the foundation, not instructed delegates
of their donors or employers. They disclose conflicts and do not deliberate,
vote, or count toward unconflicted quorum when a grant, procurement, or other
decision could benefit themselves, their sponsor, or an affiliate.

The proposed Onym endowment policy caps ordinary annual appropriation at four
percent of the trailing twelve quarter-end market values, further limited by
law, donor restrictions, prudence, liquidity, and the approved budget. Normal
spending requires six of nine votes including two non-sponsor directors. A
bounded exceptional draw requires seven votes including four non-sponsor
directors and a public rationale.

The Onym profile is not yet a live foundation or fundraising offer. It remains
`proposed_non_operational` until a legal entity, jurisdiction, governing
documents, custody, policies, initial lawful board, and valid signed manifest
exist. The legal documents and applicable law prevail over protocol records.

Other people may form independent foundations using the same abstract
contract. They may publish different lawful recognition, board, contribution,
and spending policies. They do not need permission or a signature from the
Onym Foundation, and they do not inherit its treasury, trademark, board, or
liability.

## 14. Recruitment across every seat

Every seat needs participants: authors, operators, reviewers, organizations,
vendors, contributors, sponsors, and governance candidates. Recruitment is a
cross-cutting service that helps discover them without becoming an appointment
authority or a toll gate on participation.

The boundary is defined in
[recruitment/Recruitment.md](recruitment/Recruitment.md). It supports openings
for identity, UI, message and blob transport, notary, transaction relaying,
association registries, applications, lead generation, acquisition,
sponsorship, foundation governance, and protocol maintenance.

```text
seat requester -> signed opening + finite recruitment budget
                         |
        +----------------+----------------+
        |                                 |
        v                                 v
candidate applies directly       recruiter offers search
                                          |
                                  candidate signs consent
                                          |
                                          v
                                  scoped introduction
        |                                 |
        +----------------+----------------+
                         v
             destination seat evaluates
                         |
                         v
           selection / activation milestone

recruiter never receives appointment authority or future participant revenue
```

An opening declares the participation form—employee, contractor, provider,
vendor, maintainer, grantee, volunteer, governance candidate, sponsor prospect,
auditor, or another versioned form. The protocol label does not override the
real relationship or applicable law.

Anyone may offer recruiting, but payment requires an accepted, budget-capped
order. Models may include fixed search, candidate-consented qualified
introduction, selection, activation, or short bounded retention milestones.
The baseline rejects application fees, payment for scraped profiles, hidden
percentages of candidate compensation, and perpetual cuts of participant or
seat revenue.

Every public opening preserves direct self-application. A recruiter cannot
reserve a candidate merely by naming them first; the baseline attribution rule
lets the candidate choose the recruiter. Identifying information is forwarded
only through signed, purpose-specific consent, and disclosure expands only as
the candidate advances.

Recruitment never requests an identity root key, BIP-39 phrase, message history,
address book, unrelated blockchain address, advertising identifier, or covert
behavioral profile. Rejected outcomes stay private, retention is bounded, and
a separate opt-in is required for a future talent pool.

The destination authority remains unchanged. A recruiter cannot appoint a
director, bind a group to a notary, authorize an app-store cohort, trust a
registry issuer, or add a relay to a user's route. Automated ranking or
selection requires a separately disclosed legal and risk profile, meaningful
human accountability, correction, and appeal; hidden automated rejection is
nonconforming.

## 15. Open participation and discovery

Permissionless participation requires two different mechanisms that are often
mistaken for one another.

### 15.1 Direct use

A user can enter or import a component manifest directly. If it passes local
validation and speaks the protocol, it can be used without approval from Onym,
a foundation, an app store, or a default directory.

### 15.2 Directories

A directory helps users discover components. Each directory signs a list of
manifests and states its inclusion policy. Examples include:

- an Onym-maintained default directory;
- a national or community directory;
- an enterprise-approved directory;
- an audit firm's security-rated directory; or
- a user's own pinned list.

Directories are replaceable curators, not consensus authorities. A manifest's
valid signature proves who published it; directory inclusion expresses a
curator's recommendation.

### 15.3 Conformance

Each seat needs:

- a versioned specification;
- canonical encodings;
- adversarial and cross-platform test vectors;
- a conformance test suite;
- feature and privacy capability flags; and
- a compatibility and deprecation policy.

This is the practical foundation of “anyone can participate.” Source
availability alone does not create interoperability.

## 16. Service manifests and seat-defined offers

Every paid or discoverable component publishes a signed `ServiceManifest`.
There is no global Onym price schedule. The owner of each seat decides whether
the seat is free, donation-supported, subscription-funded, consumable, metered,
or sold under another model.

```json
{
  "version": 1,
  "componentId": "onym:component:<hash>",
  "seat": "transport",
  "operator": "onym:key:<operator-id>",
  "implementation": {
    "source": "https://example.org/repository",
    "revision": "<commit-or-release-hash>",
    "artifactHash": "<reproducible-build-hash>"
  },
  "endpoints": ["wss://relay.example.org"],
  "capabilities": ["message-relay-v1", "nip42-auth"],
  "privacyProfile": "<hash-or-url>",
  "offers": [
    {
      "offerId": "relay-monthly-v1",
      "model": "subscription",
      "period": "P1M",
      "service": {"reads": "unlimited", "writes": "unlimited"},
      "entitlement": "relay-access-v1",
      "acceptedChannels": ["apple-iap", "direct"],
      "settlementTerms": "<hash-or-url>"
    },
    {
      "offerId": "relay-100k-events-v1",
      "model": "consumable",
      "service": {"acceptedEvents": 100000},
      "entitlement": "relay-credit-v1",
      "acceptedChannels": ["apple-iap", "direct"]
    }
  ],
  "payout": "<operator-payout-coordinates>",
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The manifest describes what the seat owner is willing to sell. A payment
channel describes how a particular frontend can sell it. These are separate
objects because an iOS publisher, Android publisher, web client, and direct
protocol client have different processors, product catalogs, taxes, refund
rules, and settlement duties.

### 16.1 Channel offer

Before a frontend sells a seat's offer, the frontend publisher and seat owner
agree on a signed `ChannelOffer` containing:

- the seat's `componentId` and `offerId`;
- the frontend and billing-broker identities;
- the platform product identifier or direct payment method;
- storefront price or price-mapping rule;
- the messenger publisher's commission;
- the provider's settlement basis and payout schedule;
- currency conversion, payout fees, withholding, reserve, and tax treatment;
- refund, revocation, service-failure, and dispute rules;
- entitlement issuer key and relay verification method; and
- validity period and signatures of both commercial parties.

The seat defines the service model. The frontend decides whether it can offer
that model through its distribution channel. Neither can unilaterally alter the
signed commercial terms.

For Apple In-App Purchase, product identifiers and prices are configured in App
Store Connect before StoreKit can sell them. An arbitrary new relay cannot turn
its manifest into a new StoreKit product at runtime. It must be onboarded and
mapped to an approved product by the messenger publisher. Direct protocol use,
self-hosting, and zero-priced access remain permissionless; inclusion in a
particular app's commercial catalog is a curated business relationship.
Whether a multi-provider relay catalog is accepted by App Review under the
rules in force for each storefront remains a deployment question; the protocol
architecture cannot guarantee store approval.

### 16.2 Route construction

A client constructs a **route** from compatible service manifests, but each
seat in the route may have its own independent entitlement. A route need not be
sold as one bundle. The user may use a free UI, a paid Nostr relay, a donated
Blossom server, and a separately funded notary.

Before purchase, the frontend displays the seat operator, service received,
duration or quota, storefront price, renewal behavior, privacy effect, and the
frontend through which the purchase is settled. A provider cannot silently
substitute an endpoint, offer, or entitlement scope without a new signed offer.

## 17. Seat payment, entitlement, and settlement model

### 17.1 What the incentive pays for

In Onym, the primary incentive is payment to the owner of a selected seat for
the value that seat provides. It may reward:

- relay bandwidth and retention;
- encrypted-media storage and egress;
- proof generation or transaction submission;
- name issuance or registry resolution;
- UI development, distribution, and customer support;
- privacy-preserving lead-generation placements measured through aggregate
  delivery;
- application-specific services; or
- another service explicitly described by the seat.

The messenger publisher may retain a disclosed commission for presenting,
selling, validating, supporting, refunding, and settling the purchase. The seat
owner may divide its own proceeds among its operator, code contributors,
auditors, or other collaborators. Onym does not impose one universal split
across all seats.

A payment is **not** ownership of user data, protocol voting power, guaranteed
income, or a mandatory fee for all implementations of an open standard.

### 17.2 The open-source boundary

The existing Onym repositories are MIT-licensed. MIT permits copying,
modification, redistribution, and commercial use without an ongoing royalty.
The protocol cannot honestly promise compulsory code royalties while retaining
that license.

Onym can create incentives through service revenue, frontend distribution,
voluntary contributor splits, support contracts, and transparent commons
funding. If mandatory royalties for redistribution are desired, that component
needs a different commercial or dual license and must not be described as
MIT-only.

### 17.3 Paid Nostr relay flow

A paid Nostr transport illustrates the complete flow:

```text
Onym client              Nostr relay          Billing broker       Apple
     |                         |                     |                 |
     |-- REQ / EVENT --------->|                     |                 |
     |<-- payment-required ----|                     |                 |
     |                         |                     |                 |
     |-- StoreKit purchase ----------------------------------------->|
     |<-- StoreKit signed transaction -------------------------------|
     |-- transaction + offer + scoped access key ->|                 |
     |                         |      validate with Apple ----------->|
     |                         |<------------- valid / invalid -------|
     |<-- signed SeatEntitlement ------------------|                 |
     |-- AUTH + entitlement ---->|                 |                 |
     |<-- accepted / credential -|                 |                 |
     |-- encrypted relay use --->|                 |                 |
     |                         |                     |<-- proceeds ----|
     |                         |<-- provider payout -|                 |
```

The detailed sequence is:

1. The client authenticates with a relay-specific access key and attempts a
   subscription or event write.
2. The relay determines that the key has no valid entitlement and returns a
   machine-readable `PaymentRequired` referencing its signed offer.
3. The frontend presents the relay's subscription or consumable plan and the
   StoreKit price mapped by the applicable `ChannelOffer`.
4. The user approves the In-App Purchase. StoreKit returns an App Store-signed
   transaction to the application.
5. The application sends the signed transaction, seat offer identifier, and
   relay-scoped access public key to the messenger publisher's billing broker.
6. The broker validates the transaction and idempotency with Apple's server
   interfaces. A client-generated “paid” flag is never sufficient.
7. The broker issues a signed `SeatEntitlement` whose audience is that relay
   and whose subject is the scoped access key.
8. The client presents the entitlement while authenticating to the relay, or
   the broker notifies the relay through an agreed webhook. The relay verifies
   the broker signature and grants the purchased quota or subscription access.
9. The relay may issue its own short-lived access credential so ordinary relay
   reconnects do not expose StoreKit evidence.
10. The broker processes renewals, expirations, refunds, and revocations and
    updates the relay's entitlement state.
11. The messenger publisher periodically pays the relay owner according to the
    signed settlement agreement.

Apple's App Store Server API returns signed transaction and subscription
information, while App Store Server Notifications report lifecycle events such
as renewals, refunds, and revocations. The billing broker, not the mobile client
or relay, owns that integration.

### 17.4 `402 Payment Required` over Nostr

HTTP `402 Payment Required` is appropriate when access is rejected at an HTTP
endpoint or before a WebSocket upgrade. Once the connection is a Nostr
WebSocket, the relay is no longer sending HTTP response statuses for each Nostr
operation.

NIP-01 and NIP-42 already define the relevant response shapes:

- a refused event write receives `OK` with `accepted = false`; and
- a refused subscription receives `CLOSED` with a machine-readable prefix.

An Onym relay profile should map both wire forms to the same domain object:

```text
["OK", "<event-id>", false,
 "payment-required: <base64url-PaymentRequired>"]

["CLOSED", "<subscription-id>",
 "payment-required: <base64url-PaymentRequired>"]
```

If authentication has not happened, the relay first uses NIP-42's
`auth-required:` flow. After the client proves control of its scoped key, the
relay may respond with `payment-required:` if that key lacks an entitlement.
The UI may label this state “402 Payment Required,” but the WebSocket wire form
must remain valid Nostr framing.

### 17.5 Entitlement credential

The broker-issued credential should contain no Apple account, receipt, original
transaction identifier, global Onym identity, group identifier, or message
metadata.

```json
{
  "version": 1,
  "type": "SeatEntitlement",
  "issuer": "onym:key:<billing-broker>",
  "audience": "onym:component:<relay-id>",
  "subject": "onym:seat-key:<scoped-public-key>",
  "offerId": "relay-monthly-v1",
  "entitlementId": "<random-nonreusable-id>",
  "notBefore": "2026-08-01T00:00:00Z",
  "expiresAt": "2026-09-01T00:00:00Z",
  "quota": null,
  "status": "<privacy-limited-revocation-endpoint-or-epoch>",
  "signature": "<broker-signature>"
}
```

For a consumable, `quota` states the purchased unit and the relay keeps a
replay-protected balance keyed by `entitlementId`. For a subscription, expiry
and renewal state control access. Credentials should be short-lived enough to
bound refund and revocation delay but not so short-lived that the billing broker
can observe every relay connection.

The access key must be unique to the seat. Reusing the long-lived Nostr,
Stellar, BLS, or association identity key would let providers correlate the
same person across roles. A future identity capability should derive or store a
pseudonymous key for each `componentId` and reveal no link between them.

### 17.6 Store proceeds and provider settlement

Apple does not transfer an In-App Purchase directly to the relay owner. Apple
remits App Store proceeds to the legal entity publishing the messenger. That
publisher is the billing broker and settlement counterparty for an Apple-backed
channel.

A conceptual settlement waterfall is:

```text
customer storefront price
  − Apple commission
  − applicable store-collected taxes and store adjustments
= proceeds reported/remitted to the messenger publisher
  − disclosed messenger marketplace commission
  − agreed refund reserve, payout, foreign-exchange, and withholding amounts
= relay-owner payable
```

The exact order and tax treatment varies by storefront, provider jurisdiction,
contract, and Apple agreement. A `ChannelOffer` must define the settlement base
using platform reports rather than assuming one universal percentage. Corporate
income tax is the responsibility of each participant and should not be confused
with VAT, sales tax, withholding, or App Store commission.

Settlement is normally periodic rather than immediate because platform
proceeds, refunds, and reports arrive on platform schedules. The relay owner
accepts this counterparty risk when it signs an Apple channel offer. It may also
publish a direct-payment offer for clients or users that prefer another rail.

### 17.7 StoreKit product constraints

Two initial mappings are natural:

- **Auto-renewable subscription:** continuing relay access. The plan must
  provide ongoing value and follow App Store subscription disclosure and
  renewal rules.
- **Consumable:** a repurchasable quota such as retained byte-time or accepted
  operations. Because consumables are not durable access records by themselves,
  the billing broker and relay must maintain the credited balance and prevent
  transaction replay.

Every StoreKit product has an app-specific product identifier configured in App
Store Connect. The frontend publisher therefore needs an onboarding and catalog
process for third-party seats. The open Onym protocol and the official iOS
commercial catalog are related but not identical trust domains.

Subscription access must restore across the user's supported devices. The
broker therefore needs a privacy-preserving rebind flow that validates the
current StoreKit entitlement and binds it to the recovered per-seat access key.
Consumable balances require the broker's own durable, idempotent ledger because
the client cannot treat a one-time local transaction callback as the balance's
only source of truth.

### 17.8 Privacy boundaries

In the Apple-backed flow:

- Apple learns that an Apple account purchased a product in the messenger app.
- The billing broker learns the App Store transaction, selected relay offer,
  and scoped entitlement subject.
- The relay learns the scoped access key, purchased plan, entitlement status,
  IP address, timing, and relay usage.
- The relay should not learn the Apple transaction identifier or Apple account.
- The broker should not learn group identifiers, transport topics, recipients,
  message contents, or ordinary connection history.

The frontend should use a random, seat-scoped account token when it needs to
associate StoreKit state with a broker record. It must not place the user's
global Onym identity into App Store metadata.

### 17.9 No native token is required

The settlement channel should use assets already supported by the applicable
platform and payout system. Creating an Onym token is not necessary for seat
discovery, provider payment, governance, or technical interoperability. A
future token proposal would require a separate security, legal, concentration,
liquidity, and governance analysis; it is not implied by this architecture.

### 17.10 Economic abuse

Open participation creates Sybil listings, fake usage, transaction replay,
self-referral loops, quote bait-and-switch, refund abuse, non-delivery, and
reputation farming. Platform billing additionally creates chargeback,
subscription-state, catalog-review, payout, sanctions, and tax failure modes.

Mitigations may include signed and idempotent entitlements, refund reserves,
service-level evidence, rate limits, independent directories, contractual
onboarding for store channels, challenge periods, and reputation scoped to a
directory. None should become a hidden gate on direct protocol use.

The proposed contract boundary for deciding the disputes these challenge
periods create—party-chosen arbiters with authority bounded to one order's
escrowed stake—is specified in
[arbitration/Arbitration.md](arbitration/Arbitration.md).

## 18. Governance of the protocol

Onym needs governance of specifications, not governance of users.

Proposals should be public, versioned, and accompanied by:

- a problem statement;
- wire-format changes;
- security and privacy effects;
- backwards-compatibility and migration behavior;
- test vectors or a reference implementation;
- intellectual-property and licensing declarations; and
- an account of which seats gain or lose authority or revenue.

Implementations may adopt competing proposals. A practical standards index can
coordinate names and versions, but clients may follow another index or support
multiple profiles. Existing groups remain governed by the exact contract and
profile they selected; a protocol committee cannot retroactively rewrite them.

A future legal entity may fund work or curate defaults, but it should not own
identities, hold an exclusive trademark gate over compatible implementations,
or become technically necessary for identity, resolution, direct protocol
access, or non-store settlement. A store-mediated purchase necessarily trusts
the publisher of that particular billing channel; it must not become the only
way to use the underlying seat.

A foundation board, including any Sponsor Directors, governs only that
foundation's legal entity, treasury, and controlled resources. It does not
become the standards authority for all compatible implementations. The
[Sponsor contract](sponsor/Sponsor.md) makes that separation explicit.

## 19. Security and privacy model

Division of ownership reduces the power of one operator. It does not eliminate
trust, compromised endpoints, collusion, or global observation.

| Party or failure | Can do | Should not be able to do |
|---|---|---|
| Malicious UI build | Misrepresent intent; attempt to steal local secrets | Be trusted merely because it uses the Onym name |
| Identity compromise | Impersonate the identity within compromised key scopes | Be silently repaired by an operator that never held recovery authority |
| Message relay | Observe network metadata; delay, drop, replay, or retain ciphertext | Read correctly encrypted plaintext or authorize notary state |
| Blob server | Observe access patterns; withhold encrypted media | Read media without its separately delivered content key |
| Transaction relayer | Observe IP, time, target, size; censor submissions | Forge a valid zero-knowledge witness or rewrite deployed rules |
| Notary ledger observer | See public contract metadata and ordering | Read conversation content that is never placed on chain |
| Association registry | Misissue, refuse, revoke, or equivocate about its own names | Become the cryptographic controller of the named identity |
| Directory | Promote poor or conflicted providers; censor discovery | Prevent direct use of a compatible manifest |
| Store and billing broker | Link a platform purchase to a seat offer; delay or reverse entitlement and settlement | Learn message plaintext or become mandatory for direct/free seat access |
| Acquisition landing host | Observe direct connection metadata; alter creative or store target; fabricate its own counters | Receive the store's person-level acquisition event or attach a cohort to the app |
| Store acquisition oracle | Misreport a proprietary aggregate; expose unrelated publisher reports | Learn an Onym identity or prove a universal retained install |
| Charity operator, credential issuer, or financial provider | Misstate a campaign or credential; correlate disclosed data; censor, delay, or refuse an operation | Receive identity root secrets or unrelated chats; silently substitute trust policy, destination, or authorized terms; make fund flow prove impact |
| Foundation or sponsor director | Misallocate controlled resources; hide conflicts; overstate recognition | Own user identities, rewrite protocol conformance, or force independent resources to display recognition |
| Recruiter or fake requester | Scrape candidates; misstate an opening; spam; expose applications; claim duplicate referrals | Own a candidate, appoint for a seat, request identity secrets, or acquire future participant revenue |
| Automated selection provider | Encode bias, infer sensitive traits, produce opaque rankings, or drift | Become an unnamed final authority or bypass correction, accommodation, and appeal |
| Malicious group member | Read group data available during membership; leak or screenshot it | Exceed the group's cryptographically enforced authorization policy |
| Colluding providers | Combine timing, payment, naming, and endpoint observations | Be defeated by component separation alone |

Important current limitations include:

- endpoint security remains decisive;
- traffic analysis is not solved;
- small groups have small anonymity sets;
- directly visited landing hosts and app stores still observe data needed to
  serve their respective requests;
- privacy-preserving store reports may be delayed, noisy, suppressed, grouped,
  or unavailable and do not define one universal installation event;
- recruitment necessarily processes candidate data once a person applies, and
  policy/signatures cannot guarantee that a malicious recipient deletes it;
- automated recruitment can create discrimination, opacity, and legal duties
  that cryptographic evidence alone cannot resolve;
- the public ledger exposes group-level metadata;
- current classical curves are not post-quantum secure;
- current integration and contracts have not completed a production-grade
  independent audit program; and
- availability still depends on enough selected couriers, RPC providers,
  transaction relayers, and ledger validators remaining reachable.

The current per-recipient X25519 and AES-GCM envelope model provides encrypted
delivery but should not be described as offering the full forward-secrecy and
post-compromise guarantees of a ratcheting group protocol. A future messaging
profile may adopt Messaging Layer Security (MLS) or another reviewed protocol,
provided it preserves Onym's replaceable delivery-service boundary.

## 20. What exists today and what is proposed

### 20.1 Implemented or present in the current repositories

- iOS and Android clients with locally generated BIP-39 recovery material and
  hardware-backed platform storage.
- Cross-platform deterministic derivation of secp256k1, BLS12-381, Ed25519,
  and X25519 key material.
- Multiple local identities and encrypted local identity, group, invitation,
  and message state.
- Narrow message and inbox transport interfaces with Nostr adapters.
- Encrypted media upload and retrieval through Blossom servers.
- Custom relay, media-server, transaction-relayer, and contract selection
  surfaces, plus published discovery manifests.
- A standalone fee-paying Stellar transaction relayer that third parties can
  run.
- A family of Stellar Soroban contracts for one-on-one, anarchy, democracy,
  oligarchy, and founder/tyranny governance.
- Mobile SDKs exposing shared proof and cryptographic primitives.
- Local proof generation and commitment verification paths.

Contract code existing in a repository is not the same as uniform end-to-end
support in every client. Mobile FFI, product flows, and chat support currently
cover governance flavors unevenly. The system remains alpha-grade, and
testnet/repository availability must not be presented as audited production
deployment.

### 20.2 Proposed by this paper

The abstract charity contract and Onym Messenger profile are now published in
[charity/Charity.md](charity/Charity.md) and
[charity/UI-Charity.md](charity/UI-Charity.md). Their deployed implementations
remain proposed, but publishing those specifications is no longer a roadmap
item.

- A stable, implementation-independent identity descriptor.
- A capability API that extensions can use without receiving root secrets.
- Competing association registries and qualified name resolution.
- Signed service, notary, directory, privacy, seat-offer, and channel-offer
  manifests.
- Nostr `payment-required:` responses and relay-scoped access keys.
- Broker-signed subscription and consumable entitlement credentials.
- StoreKit transaction validation, lifecycle notifications, provider
  settlement, and auditable commercial statements.
- Seat-owner contributor splits and commons reward policies compatible with
  open-source licensing.
- Privacy-preserving lead campaigns with aggregate landing conversion and
  direct view-based Telegram settlement.
- A replaceable acquisition-provider contract with shared store cohorts,
  privacy thresholds, Apple campaign-download evidence, and Google Play
  aggregate acquisition evidence that never enters the app.
- A portable foundation sponsor contract and proposed Onym Foundation policy
  for bounded recognition, endowment gifts, sponsor-council elections, sponsor
  directors, conflicts, and transparent spending.
- A recruitment contract spanning every seat, with direct self-application,
  candidate-consented introductions, progressive disclosure, declared
  selection authority, private outcomes, and finite recruiter milestones.
- Conformance suites for every open seat.
- A non-custodial payment capability profile and additional financial-services
  application profiles.
- Group-state migration between notary deployments.
- Stronger recovery, operational-key rotation, and post-quantum migration.
- A reviewed ratcheting messaging profile with forward secrecy and
  post-compromise security.

## 21. Roadmap

### Phase 0 — make the existing system legible

- Freeze and document current cross-platform wire formats and derivation test
  vectors.
- Publish one canonical architecture and threat model across the repositories.
- Mark implemented, experimental, and planned features in machine-readable
  release manifests.
- Complete independent review of the identity, envelope, proof, contract, and
  transaction-relayer seams.

### Phase 1 — make every current seat substitutable

- Publish conformance suites for UI adapters, message relays, blob servers,
  transaction relayers, and notary bundles.
- Support direct manifest import and multiple signed directories.
- Add notary code-hash and parameter verification in clients.
- Define export/import formats for local group and message state.

### Phase 2 — identity and association layer

- Specify `IdentityDescriptor`, rotation, revocation, and capability requests.
- Implement qualified name resolution and one reference association registry.
- Add selective-disclosure credential support only after a privacy review.
- Specify chain-adapter derivation and address-control proofs.

### Phase 3 — incentives

- Specify `ServiceManifest`, `SeatOffer`, `ChannelOffer`, `PaymentRequired`, and
  `SeatEntitlement` canonical formats.
- Implement NIP-42 relay authentication with `payment-required:` handling and
  relay-scoped pseudonymous keys.
- Implement an Apple billing broker with StoreKit transaction validation,
  App Store Server Notifications, refund/revocation handling, and idempotent
  entitlement issuance.
- Implement periodic relay-owner statements and settlement; do not create a
  native token by default.
- Implement the tracker-free order landing aggregate, Telegram view
  observer, capped campaign escrow, and direct lead-generator settlement.
- Implement publisher-authorized Apple and Google Play acquisition-evidence
  gateways, aggregate cohort reports, suppression handling, and capped
  acquisition-provider settlement without app callbacks.
- Keep the Onym sponsor profile non-operational until a legal entity,
  jurisdiction, governing documents, lawful initial board, custody, accounting,
  and signed foundation manifest exist; then implement receipts, recognition,
  Sponsor Council elections, conflict records, and spending reports.
- Implement seat opening, direct application, candidate-consent, encrypted
  application, evaluation, activation, recruiter-settlement, retention, and
  appeal fixtures before operating a recruitment directory.
- Add an Android billing adapter under its own current platform terms.
- Fund audits and conformance infrastructure before promoting open paid
  listings to non-technical users.

### Phase 4 — application ecosystem

- Implement and test the published [abstract charity contract](charity/Charity.md)
  and [Onym Messenger charity profile](charity/UI-Charity.md) as the first
  non-messaging reference application.
- Publish a non-custodial payment capability profile.
- Define the additional duties of regulated or custodial financial providers.
- Allow applications to compose identity, association, transport, notary, and
  settlement without receiving ambient authority over the other seats.

## 22. Decisions this draft intentionally leaves open

The following questions require explicit community and implementation work:

1. Which identity identifier and resolution method should become canonical?
2. Should operational keys derive from one mnemonic, from an offline root, or
   from multiple independently recoverable roots?
3. What exact recovery and rotation model preserves group membership?
4. Which message-security protocol supplies forward secrecy and
   post-compromise security?
5. What is the minimum privacy-preserving entitlement and revocation format?
6. Does each relay require a dedicated StoreKit product, or can reviewed
   product tiers safely map to multiple mutually agreed seat offers?
7. Who curates the first default directories, under what appeal and conflict
   policies?
8. Which seats should use subscriptions, consumable quotas, direct payment,
   donations, or zero-priced access?
9. How can a group migrate notary state without letting the old or new provider
   seize authority?
10. Which legal entity, if any, administers trademarks, audit funds, and shared
    infrastructure without becoming a technical root of trust?
11. Which observer and dispute policy provides acceptable Telegram counter
    evidence without pretending the counter proves unique human views?
12. What minimum aggregate threshold and retention policy best preserve landing
    privacy while keeping campaign-efficiency reports useful?
13. Which store-event definitions, minimum cohorts, reporting delays, and
    small-cohort payment rules make acquisition settlement both useful and
    privacy-preserving?
14. In which jurisdiction and legal form, if any, should an Onym Foundation be
    created, and how must its governing documents alter the proposed sponsor
    board and endowment profile?
15. Are the proposed sponsor thresholds, three-of-nine sponsor representation,
    four-percent ordinary draw, and conflict safeguards appropriate at the
    Foundation's actual scale?
16. Which recruiter-attribution rule, milestone schedule, and short retention
    period best reward participant discovery without creating candidate
    ownership or hiring pressure?
17. Which jurisdictions and participation forms should receive the first
    concrete recruitment profiles, and which automated tools must remain out of
    selection until their equality, privacy, and high-risk-system duties are
    implemented?

## 23. Conclusion

Onym's fundamental unit is not a company account. It is a route assembled from
independently owned components around a user-controlled cryptographic identity.

The identity holds the keys. The UI presents choices. Couriers move encrypted
data. Notaries verify shared rules. Associations attach names and credentials.
Applications request narrow capabilities. Settlement rewards the parties the
user actually selected. Lead generators can earn for measurable distribution
without becoming owners of the people who later install the app. Acquisition
providers can improve a landing experience while learning only a store
aggregate. Sponsors can receive recognition and a bounded path into foundation
governance without purchasing the protocol or its users. Recruiters can help
every seat find participants while candidates retain control of introductions
and the destination seat retains appointment authority.

This is the intended division of ownership: not one decentralized brand that
still controls every default, but an interoperable economy in which anyone can
offer a service seat, no protocol role is an exclusive franchise, authority is
bounded by protocol, and compensation follows visible contribution. Legal
boards remain finite and accountable under their governing documents.

## Appendix A. Current repository map

The present implementation is divided across repositories that already mirror
the system's ownership boundaries:

| Repository | Current responsibility |
|---|---|
| [`onym-ios`](https://github.com/onymchat/onym-ios) | Native iOS client, local identity, messaging flows, service selection |
| [`onym-android`](https://github.com/onymchat/onym-android) | Native Android client with the cross-platform protocol twin |
| [`onym-sdk-swift`](https://github.com/onymchat/onym-sdk-swift) | Swift boundary for shared proof and cryptographic primitives |
| [`onym-sdk-kotlin`](https://github.com/onymchat/onym-sdk-kotlin) | Kotlin/JNI boundary for the same primitives |
| [`onym-contracts`](https://github.com/onymchat/onym-contracts) | Soroban verifier and group-governance contract family |
| [`onym-relayer`](https://github.com/onymchat/onym-relayer) | Fee-paying contract relayer and service-discovery manifests |
| [`onym-infra`](https://github.com/onymchat/onym-infra) | One replaceable deployment of Nostr, Blossom, relayer, and TLS infrastructure |
| [`onym-website`](https://github.com/onymchat/onym-website) | Public product explanation, threat model, privacy disclosures, and QA entry points |
| [`onym-papers`](https://github.com/onymchat/onym-papers) | Research papers and protocol proposals |
| `onym-system` | This cross-repository architecture and economic design draft |

## References

1. Bitcoin Improvement Proposal 39, “Mnemonic code for generating deterministic
   keys”: <https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki>
2. Nostr NIP-01, “Basic protocol flow description”:
   <https://github.com/nostr-protocol/nips/blob/master/01.md>
3. Blossom protocol and BUD index:
   <https://github.com/hzrd149/blossom>
4. W3C, “Decentralized Identifiers (DIDs) v1.0”:
   <https://www.w3.org/TR/did-core/>
5. IETF RFC 9420, “The Messaging Layer Security (MLS) Protocol”:
   <https://www.rfc-editor.org/rfc/rfc9420>
6. Stellar developer documentation, “Authorization”:
   <https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization>
7. Nostr NIP-42, “Authentication of clients to relays”:
   <https://github.com/nostr-protocol/nips/blob/master/42.md>
8. Apple, “App Review Guidelines,” section 3.1:
   <https://developer.apple.com/app-store/review/guidelines/>
9. Apple, “App Store Server API”:
   <https://developer.apple.com/documentation/appstoreserverapi>
10. Apple, “App Store Server Notifications”:
    <https://developer.apple.com/documentation/appstoreservernotifications>
11. Apple, “In-App Purchase information”:
    <https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information/>
12. Telegram, “Channels, supergroups, gigagroups and basic groups”:
    <https://core.telegram.org/api/channel>
13. Telegram, `messages.getMessagesViews`:
    <https://core.telegram.org/method/messages.getMessagesViews>
14. Apple, “Campaign links”:
    <https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links>
15. Apple, “Analytics Reports API”:
    <https://developer.apple.com/help/app-store-connect-analytics/overview/analytics-reports-api>
16. Google Play, “Understand and grow your app's user base”:
    <https://support.google.com/googleplay/android-developer/answer/9859173?hl=en-EN>
17. Android Developers, “Google Play Install Referrer”:
    <https://developer.android.com/google/play/installreferrer>
18. US Internal Revenue Service, “Purpose of a conflict of interest policy”:
    <https://www.irs.gov/charities-non-profits/form-1023-purpose-of-conflict-of-interest-policy>
19. Charity Commission for England and Wales, “Conflicts of interest: a guide
    for charity trustees”:
    <https://www.gov.uk/government/publications/identifying-and-managing-conflicts-of-interest-in-a-charity-cc29/conflicts-of-interest-a-guide-for-charity-trustees>
20. European Union, General Data Protection Regulation, Article 5:
    <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679>
21. European Union, Artificial Intelligence Act:
    <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32024R1689>
22. UK Information Commissioner's Office, “Employment practices and data
    protection: recruitment and selection”:
    <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/recruitment-and-selection>
23. US Equal Employment Opportunity Commission, “I'm recruiting, hiring or
    promoting employees”:
    <https://www.eeoc.gov/employers/small-business/3-im-recruiting-hiring-or-promoting-employees>
24. Onym source repositories: <https://github.com/onymchat>
