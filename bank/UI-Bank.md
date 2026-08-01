---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym UI ↔ Bank Boundary

**Architecture draft 0.1 — August 2026**

> The identity signs. The bank serves accounts, payments, and records. It does
> not become the identity, and a non-custodial bank never becomes the money.

This document defines the technology-neutral boundary between an Onym
frontend, the holder's identity vault, and a **bank seat**: a financial
application provider offering accounts, balances, payments, statements, and
optionally regulated services against a user-controlled identity. It does not
require a particular ledger, asset, banking license model, custody
arrangement, or payment network.

A concrete implementation may use a public ledger, a private core-banking
system, an e-money provider, or a hybrid, provided it satisfies the profile's
custody-disclosure, authorization, intent-binding, receipt, and privacy
semantics. The current Stellar implementation is specified separately in
[UI-Bank-Stellar.md](UI-Bank-Stellar.md).

Here **UI** means the frontend application layer, not a screen calling a
payment API. Views send intent to flows, view-models, repositories, or
interactors. Those components obtain authorization through the identity
vault's capability port
([../identity/UI-Identity.md](../identity/UI-Identity.md)) before invoking
the bank port.

Onym is not itself a bank. This boundary makes a provider's financial role
visible and replaceable; it does not confer a license, guarantee deposits, or
transfer the provider's legal duties to the protocol (whitepaper §10.2).

## 1. Decision

Onym treats the account holder, identity vault, bank provider, ledger or
payment network, and UI publisher as independently owned components joined by
versioned interfaces.

- The **account holder** owns the identity whose keys authorize payments. In
  non-custodial classes they also own the funds at the ledger layer; in
  custodial classes they own a claim against the provider.
- The **identity vault** holds the keys and executes typed capabilities:
  `sign-transaction`, `prove-address-control`, and
  `derive-context-address`. It never surrenders the root secret to a bank
  (whitepaper §5.4). These names are the normative capability vocabulary from
  [UI-Identity.md](../identity/UI-Identity.md).
- The **bank provider** owns its product: account services, records, quotes,
  compliance program, support, and—in custodial classes—custody itself, with
  every legal duty that entails.
- The **ledger or payment network** settles what valid, authorized
  operations submit. It is infrastructure the provider uses, not a party
  that acquires the identity.
- The **bank adapter author** maps the common bank port onto one concrete
  ledger or provider API.
- The **UI publisher** presents accounts, quotes, and consent flows without
  becoming the custodian or the compliance authority.

One organization may occupy several roles, but their authorities remain
separate. A holder can replace the UI without moving funds, replace a
non-custodial provider without the provider's permission, and exit a
custodial provider through its declared withdrawal process rather than its
goodwill.

The boundary has two interfaces:

1. the local **UI/application ↔ bank adapter** port, which carries accounts,
   intents, quotes, authorizations, outcomes, and statements as typed
   objects; and
2. the network **bank adapter ↔ provider/ledger** implementation profile,
   which defines wire formats, submission, confirmation, and record access.

Neither interface may expose the mnemonic, seed, derived private keys, vault
capability internals, or signing material beyond the specific signed
artifacts this contract defines.

## 2. What the bank seat does

A conforming bank seat can:

1. present one or more **accounts** bound to holder-controlled or
   provider-held addresses, each with a declared custody class;
2. produce **receiving addresses** or payment coordinates for the holder,
   fresh per context through `derive-context-address` where the identity
   profile supports it;
3. quote a **payment**: amount, asset, fees, rate, expiry, and the exact
   operation that will be submitted;
4. obtain **authorization** exclusively through the vault's
   `sign-transaction` displayed-intent capability;
5. submit authorized operations and report typed **outcomes** with
   settlement evidence;
6. serve **balances and statements** with declared freshness and evidence
   basis; and
7. display **counterparty claims**—qualified names and credentials from
   association registries—without conflating them with addresses.

It does not generate or store identity keys, request recovery material,
approve its own payment intents, rewrite displayed intent after consent,
resolve human names by itself, or acquire authority over the holder's
messaging, groups, or other seats.

## 3. Why this boundary is necessary

### 3.1 Both systems speak BIP-39; that must not merge them

A wallet or bank built on seed phrases is one careless integration away from
asking for the user's mnemonic "to link accounts." The boundary forbids the
question: a bank receives signatures, proofs, and addresses from the vault's
capability port, and nothing else. Using the same root standard is a
convenience of derivation, never a license to share the root
(whitepaper §10.2).

### 3.2 Custody must be a visible class, not a vibe

The difference between "your keys authorize every movement" and "we owe you
a balance" is the difference between infrastructure and a regulated
counterparty. Providers must declare a custody class per account, clients
must display it, and no marketing layer may present a custodial claim as
holder-controlled funds.

### 3.3 The UI must not become a ledger implementation

Chat flows and screens should not know transaction envelopes, sequence
rules, fee markets, or confirmation heuristics. A narrow port lets one
frontend serve different ledgers and providers, and lets a provider change
its backend without rewriting every client.

### 3.4 Regulated duties need a named bearer

Licensing, deposit protection, sanctions screening, tax reporting, consumer
protection, and complaint handling belong to the provider that performs
them, in its stated jurisdictions. The protocol's job is to make that party
and its declarations visible—never to launder its obligations through the
Onym name (whitepaper §10.2).

### 3.5 It bounds failure

A failed provider, frozen API, or discontinued app must strand as little as
its custody class implies: a non-custodial account remains spendable with
the holder's keys through any conforming adapter; a custodial account
degrades to the provider's declared insolvency and withdrawal terms rather
than to silence.

## 4. Logical topology

```text
┌──────────────────────────────────────────────────────────────────────┐
│ UI process                                                           │
│                                                                      │
│ View / Composable                                                    │
│        │ user intent                                                 │
│        v                                                             │
│ Flow / ViewModel                                                     │
│        │ application command                                         │
│        v                                                             │
│ Repository / Interactor                                              │
│        ├────────> Identity vault: sign-transaction,                  │
│        │          prove-address-control, derive-context-address      │
│        └────────> Bank port: accounts · quotes · authorized ops ·    │
│                   outcomes · statements                              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ implementation-neutral operation
                               v
                    ┌────────────────────────┐
                    │ Bank adapter           │
                    │ map · encode · verify  │
                    │ submit · normalize     │
                    └───────────┬────────────┘
                                │ implementation profile
                                v
              ┌─────────────────┴──────────────────┐
              │ Bank provider / ledger network     │
              │ accounts · settlement · records ·  │
              │ compliance (custodial classes)     │
              └────────────────────────────────────┘
```

The vault is the only component that touches keys; the adapter is inside the
client trust boundary but handles untrusted network data; the provider and
ledger are outside it. A provider response is evidence of that provider's
statement—not proof of settlement finality, counterparty honesty, or legal
solvency—unless the implementation profile defines stronger evidence.

## 5. Boundary objects

### 5.1 Bank Profile

```json
{
  "profileVersion": 1,
  "profileId": "onym:bank-profile:account-payment-v1",
  "interface": "onym-bank-v1",
  "operations": [
    "list-accounts",
    "derive-receiving-address",
    "quote-payment",
    "authorize-payment",
    "submit-payment",
    "query-outcome",
    "balance",
    "statement",
    "close-or-withdraw"
  ],
  "custodyClasses": ["non-custodial", "custodial", "escrow"],
  "intentBinding": "vault-displayed-intent-v1",
  "outcomeSchema": "onym-bank-outcomes-v1",
  "errorSchema": "onym-bank-errors-v1",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes operation semantics, custody-class meaning, authorization
binding, and outcome meaning. It does not select a ledger, asset, provider,
or price.

### 5.2 Bank Implementation Profile

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:bank-implementation:<technology>-v1",
  "bankProfileId": "onym:bank-profile:account-payment-v1",
  "settlementLayer": "<ledger-network-or-core-system-id>",
  "addressModel": "<address-derivation-and-encoding-rule>",
  "operationEncoding": "<canonical-transaction-format>",
  "intentDecoding": "<rule-mapping-operations-to-human-readable-display>",
  "finality": "<declared-settlement-and-reorg-model>",
  "feeModel": "<network-and-provider-fee-declaration>",
  "recordAccess": "<balance-and-history-evidence-basis>",
  "signature": "<implementation-profile-publisher-signature>"
}
```

Transaction envelopes, sequence rules, and network primitives stay inside
the adapter. `intentDecoding` is normative: it defines how a raw operation
becomes the human-readable display the vault will show and bind, so a
provider cannot craft an operation the profile renders misleadingly.

### 5.3 Bank Service Manifest

A provider claims the seat with a signed manifest:

```json
{
  "version": 1,
  "componentId": "onym:component:<bank-id>",
  "seat": "application.bank",
  "operator": "onym:key:<provider-id>",
  "bankProfileId": "onym:bank-profile:account-payment-v1",
  "implementationProfileId": "onym:bank-implementation:<technology>-v1",
  "custodyClass": "non-custodial",
  "assets": ["<supported-asset-descriptors>"],
  "endpoints": [{"uri": "<service-endpoint>", "role": "read-write"}],
  "regulatory": {
    "status": "<licensed-registered-exempt-or-unregulated>",
    "jurisdictions": ["<where-it-may-serve>"],
    "disclosures": "<hash-or-url-of-legal-disclosures>",
    "protection": "<deposit-or-safeguarding-scheme-or-none>"
  },
  "kycPolicy": "<hash-or-url-or-none>",
  "feeSchedule": "<hash-or-url>",
  "withdrawalPolicy": "<custodial-exit-terms-or-not-applicable>",
  "privacyProfile": "<hash-or-url>",
  "offers": ["<seat-offer-ids>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<provider-signature>"
}
```

`regulatory.status` is the provider's own signed claim, verifiable only
against the named jurisdiction's registers—the manifest makes the claim
auditable and lying expensive, it does not make it true. `unregulated` is a
valid, honest value that clients display as such.

### 5.4 Account

```json
{
  "accountVersion": 1,
  "accountId": "<provider-or-local-account-id>",
  "componentId": "onym:component:<bank-id>",
  "custodyClass": "non-custodial",
  "address": "<ledger-address-or-provider-account-coordinates>",
  "controlProof": "<vault-proof-of-address-control-or-null-for-custodial>",
  "assets": ["<asset-descriptors>"],
  "context": "onym:context:<derivation-domain-or-seat>",
  "openedAt": "2026-08-01T00:00:00Z"
}
```

A non-custodial account carries a control proof produced by the vault; a
custodial account is the provider's liability and carries its terms instead.
The `context` ties the account to an identity derivation context so distinct
financial relationships need not share an address (whitepaper §5.3).

### 5.5 Payment Intent and Quote

The UI constructs an intent; the provider answers with a binding quote:

```json
{
  "intentVersion": 1,
  "intentId": "<random-id>",
  "accountId": "<paying-account>",
  "destination": "<address-or-payment-coordinates>",
  "counterpartyClaims": ["<optional-registry-claims-displayed>"],
  "amount": {"value": "25.00", "asset": "<asset-descriptor>"},
  "purpose": "<optional-user-visible-reference>",
  "quote": {
    "quoteRevision": 1,
    "networkFee": {"value": "0.00001", "asset": "<asset>"},
    "providerFee": {"value": "0.10", "asset": "<asset>"},
    "rate": "<conversion-rate-or-null>",
    "operation": "<canonical-encoded-operation>",
    "expiresAt": "2026-08-01T00:05:00Z",
    "quoteSignature": "<provider-signature>"
  }
}
```

The quoted `operation` is the exact bytes that will be submitted. The vault
displays it through the implementation profile's `intentDecoding` and binds
its signature to those bytes: what the holder saw is what settles, and an
expired quote authorizes nothing.

### 5.6 Payment Authorization and Outcome

```json
{
  "authorizationVersion": 1,
  "intentId": "<same-id>",
  "quoteRevision": 1,
  "operationHash": "<hash-of-quoted-operation>",
  "signature": "<vault-produced-signature>",
  "authorizedAt": "2026-08-01T00:00:03Z"
}
```

```json
{
  "intentId": "<same-id>",
  "status": "settled",
  "settlement": {
    "reference": "<ledger-transaction-id-or-provider-record-id>",
    "evidence": "<profile-defined-settlement-proof>",
    "finality": "<declared-finality-class>",
    "settledAt": "2026-08-01T00:00:09Z"
  }
}
```

Valid outcome classes are `quoted`, `authorized`, `revision_required`,
`submitted`, `pending`, `settled`, `failed`, `expired`, and `unknown`.
`quoteRevision` increases whenever canonical operation bytes change; an
authorization covers exactly one revision. `unknown` is a first-class state:
an adapter that cannot determine a submitted payment's fate queries
`query-outcome` before any resubmission, and idempotency keys make retries safe.
A provider acknowledgement is not settlement unless the profile's evidence
says so.

### 5.7 Balance and Statement

```json
{
  "accountId": "<account>",
  "balances": [{"asset": "<asset-descriptor>", "amount": "125.40"}],
  "basis": "ledger-observed | provider-attested",
  "observedAt": "2026-08-01T00:00:00Z",
  "signature": "<provider-signature-when-attested>"
}
```

Statements are ordered, signed (when provider-attested), and exportable in a
documented format. `basis` keeps the epistemics honest: a ledger-observed
balance is verifiable; a provider-attested balance is a counterparty's
statement of its own liability.

## 6. Common bank surface

| Operation | Input | Result |
|---|---|---|
| `list-accounts` | Verified manifest, holder session | Accounts with custody class and control proofs |
| `derive-receiving-address` | Account, context | Fresh coordinates via vault `derive-context-address` |
| `quote-payment` | Draft intent | Signed quote with exact operation and expiry |
| `authorize-payment` | Quote | Vault consent flow, then `PaymentAuthorization` |
| `submit-payment` | Authorization | Typed outcome progression |
| `query-outcome` | Intent or settlement reference | Current outcome with evidence |
| `balance` | Account | Balances with declared basis and freshness |
| `statement` | Account, range | Ordered, exportable, signed-when-attested records |
| `close-or-withdraw` | Account, per custody class | Non-custodial: local removal; custodial: declared exit process |

`authorize-payment` is the only step that touches keys, and it happens
inside the vault, not the bank port. No bank operation can invoke a vault
capability directly; the UI mediates every request through the capability
port with its own consent rules.

## 7. UI/application obligations

A conforming frontend and application layer must:

1. verify the bank profile, implementation profile, and provider manifest—
   including custody class and regulatory self-declaration—before showing an
   account;
2. display custody class, provider identity, regulatory status, protection
   scheme (or its absence), and fee schedule where the holder decides, not
   in fine print behind the decision;
3. construct intents locally and treat provider quotes as offers: amount,
   fees, rate, destination, and expiry render before any signature request;
4. pass only the quoted canonical operation to the vault, and submit only
   what the vault signed—no post-consent mutation, batching, or "equivalent"
   substitution. If a provider proposes revised operation bytes, invalidate
   the prior authorization, issue a new quote revision, display every change,
   and request fresh authorization before submission;
5. render counterparty registry claims per the association-naming rules and
   never derive a destination from a display name alone;
6. request fresh receiving addresses per context where the identity profile
   supports it, and warn before reusing an address across contexts;
7. keep balances, history, addresses, and account existence out of logs,
   analytics, crash reports, and store metadata;
8. label `pending`, `settled`, and provider attestations by their evidence
   basis, and never present `submitted` as final;
9. use idempotent intent identity across retries so a network failure cannot
   double-pay;
10. surface statement export and—custody class permitting—complete exit
    paths as ordinary features, not support tickets;
11. keep billing for the bank's own seat offers separate from payment
    flows: a subscription lapse degrades service per the offer, never fund
    access beyond it; and
12. treat any provider request for mnemonics, seeds, private keys, vault
    internals, or unrelated-context proofs as a protocol violation to
    surface, not a feature to accommodate.

Provider names, quote fields, memo text, and statement entries are untrusted
input. They must not execute code, spoof consent UI, or masquerade as vault
prompts.

## 8. Bank adapter obligations

A conforming adapter must:

1. implement its mapping without leaking ledger or provider wire types
   through the common port;
2. encode operations canonically so the bytes the vault displays are the
   bytes submitted, and verify quote signatures and expiry before offering
   them for authorization;
3. decode operations for display exactly per the implementation profile's
   `intentDecoding`, refusing operations it cannot render faithfully;
4. bind submissions to authorizations: no unsigned, silently re-signed, or
   modified operation ever leaves the adapter. A provider-proposed revision
   returns to quote, display, and fresh authorization as new canonical bytes;
5. track outcome state per intent with idempotency keys, and resolve
   `unknown` by query before resubmission;
6. validate inbound records—balances, statements, settlement evidence—
   against the profile's evidence rules before surfacing them as facts;
7. enforce bounded queues, timeouts, retry backoff, and response-size limits
   against hostile or failing endpoints;
8. isolate provider credentials and session tokens per component, never
   reusing them across providers or leaking them into logs;
9. normalize provider refusals into stable domain errors, preserving
   compliance-hold and rate-limit semantics distinctly; and
10. remain replaceable: for non-custodial accounts, another conforming
    adapter with the same vault must be able to spend the same funds.

## 9. Provider obligations

A conforming provider must:

1. publish and honor its manifest: custody class, assets, fees, regulatory
   self-declaration, KYC policy, withdrawal terms, and privacy profile;
2. quote payments as exact operations with expiry, and settle exactly what
   was authorized, fail the intent, or propose a new quote revision requiring
   full re-display and fresh authorization—no silent repricing or rerouting;
3. accept authorization only in the profile's signed form; a provider that
   asks the holder to "confirm" out-of-band is outside the contract;
4. serve settlement evidence, balances, and statements per the declared
   evidence basis, and support statement export;
5. run its compliance program—KYC, sanctions, reporting, holds—under its
   published policy, attributing every hold or refusal to that policy in
   machine-readable form rather than disguising it as technical failure;
6. keep custodial funds segregated and withdrawable per its declared terms,
   and never rehypothecate a `non-custodial` label;
7. request from the identity only what its declared services require:
   proofs of control, context-scoped addresses, and displayed-intent
   signatures—never root material or cross-context linkage;
8. bound data retention to its published policy and keep holder financial
   data out of any advertising or cross-seat correlation;
9. price through seat offers and (when store-sold) channel offers, with
   service fees distinct from network fees in every quote; and
10. declare wind-down behavior: notice period, statement availability, and
    the exit path for each custody class.

## 10. Custody classes

Every account carries exactly one declared class; clients render it always.

- **`non-custodial`.** The holder's vault keys are necessary for every
  outgoing movement. The provider offers construction, submission, records,
  and interface services around funds it cannot move. Provider failure
  leaves funds spendable through any conforming adapter. The provider's
  regulatory surface is typically narrower but not necessarily empty.
- **`custodial`.** The provider controls the settlement-layer assets and
  owes the holder a balance. Authorization signatures instruct the provider;
  they do not move ledger funds directly. Everything then depends on the
  provider's solvency, license, protection scheme, and withdrawal terms—
  which is why the manifest must declare them and clients must show them.
- **`escrow`.** Bounded two-key or threshold arrangements—payment channels,
  conditional escrow, recovery co-signing—where declared movements need
  multiple parties. The manifest names the parties, the conditions, and the
  unilateral exit path if one exists; without a declared exit analysis, an
  escrow account is presented with the custodial warnings.

A provider may operate accounts of different classes. What it may not do is
blur them: the class is per account, machine-readable, and load-bearing in
every display and every failure analysis.

## 11. Payment at the bank boundary

The bank seat has two money flows the contract keeps distinct:

1. **The holder's payments** — the subject matter of §5.5–§5.6, priced by
   the quoted network and provider fees.
2. **The provider's service offers** — subscriptions, premium tiers, or
   per-service fees for the seat itself, sold as `SeatOffer`s and through
   frontend `ChannelOffer`s like any other seat (whitepaper §16–17).

Store-billing evidence and entitlement state never enter payment
operations, addresses, memos, or statements. A lapsed premium tier degrades
premium features per the offer; it cannot hold funds hostage, and no
frontend commission may bias which provider's quote the UI presents as
best.

## 12. Errors and state machine

| Error | Origin | UI/application response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse; explain required adapter |
| `custody_undeclared` | Manifest | Refuse the account entirely |
| `quote_expired` | Provider/time | Re-quote; never sign stale operations |
| `quote_mismatch` | Adapter verification | Drop provider quote; possible manipulation |
| `consent_denied` | Vault/holder | Accept; the intent dies unsigned |
| `insufficient_funds` | Provider/ledger | Report against declared balance basis |
| `available_balance_restricted` | Provider/settlement rule | Show the named hold, reserve, collateral, or minimum-balance rule and resulting spendable amount |
| `operation_conflict` | Provider/settlement concurrency | Re-read current state and re-quote; never resubmit stale authorized bytes blindly |
| `authorization_revision_required` | Provider/compliance | Treat revised bytes as a new quote; compare, re-display, and obtain fresh authorization |
| `compliance_hold` | Provider policy | Show the policy basis and the provider's process |
| `destination_invalid` | Adapter/provider | Refuse before authorization, not after |
| `rate_limited` | Provider | Back off with idempotent intent identity |
| `submission_failed` | Network/ledger | Retry the same authorized bytes or fail the intent |
| `outcome_unknown` | Network/provider | Query before any resubmission |
| `settlement_reorged` | Ledger | Follow the profile's finality rules; re-evaluate receipts |
| `withdrawal_refused` | Custodial provider | Surface declared terms; escalate as a legal matter, not a bug |

Payment lifecycle:

```text
draft -> quoted -> displayed -> authorized
displayed -> consent_denied
authorized -> revision_required -> quoted (new revision)
authorized -> submitted -> pending -> settled | failed | unknown
settled -> receipt (evidence per profile)
```

Only profile-defined settlement evidence produces `settled`. Failure or
expiry at any stage before `submitted` is free; after `submitted`, the
adapter's idempotency and outcome queries decide, never a blind retry.

## 13. Security and privacy invariants

1. **The root never banks.** Mnemonics, seeds, and private keys never reach
   a provider, adapter, quote, memo, or statement; the vault capability port
   is the only key surface (whitepaper §10.2).
2. **What was displayed is what settles.** Signatures bind to the exact
   quoted operation through canonical encoding and profile-defined intent
   decoding. Provider revisions are new operations requiring fresh display
   and authorization, never mutations of an accepted signature.
3. **Custody class is always visible.** Non-custodial, custodial, and
   escrow are machine-readable, per account, and rendered at every decision
   point.
4. **A provider statement is a statement.** Balances and receipts carry
   their evidence basis; attestation by a counterparty is never displayed
   as ledger fact.
5. **Contexts do not correlate.** Accounts bind to identity contexts;
   fresh receiving addresses are the default; linking two financial
   contexts is the holder's explicit act.
6. **Compliance is attributed.** Holds and refusals cite the provider's
   published policy machine-readably; they are never disguised as network
   errors—and the reverse deception is equally nonconforming.
7. **Names annotate, keys authorize.** Registry claims about a counterparty
   inform the holder; only addresses and signed operations move value.
8. **Retries cannot double-pay.** Intent identity, idempotent submission,
   and `unknown`-before-resubmit are mandatory, not quality goals.
9. **Service billing cannot touch funds.** Seat entitlements, store
   evidence, and commissions stay out of operations, addresses, and
   statements, and cannot gate fund access.
10. **Exit is a declared path.** Non-custodial: any conforming adapter.
    Custodial: published withdrawal and wind-down terms. Undeclared exit is
    a nonconforming account.
11. **Financial data is not exhaust.** No cross-seat correlation, ad reuse,
    or analytics leakage of balances, flows, or account existence.
12. **The protocol confers no trust.** A conforming manifest proves
    conformance claims, not solvency, licensure, or honesty; those remain
    the provider's, verified in the provider's jurisdiction.

## 14. Versioning and conformance

- `BankProfile` changes when operation, custody-class, authorization, or
  outcome meaning changes.
- `BankImplementationProfile` changes when settlement layer, address model,
  operation encoding, intent decoding, finality, or fee model changes.
- `ServiceManifest` changes when custody class, assets, endpoints,
  regulatory declarations, fees, or operator keys change—custody-class
  changes on an existing account are migrations requiring fresh holder
  consent, never silent updates.
- Asset descriptors are versioned and canonical; an adapter never infers an
  asset from a display symbol.
- Cross-platform fixtures cover: canonical operation encoding and intent
  decoding (including adversarial operations that must refuse to render);
  quote verification, revision, and expiry; authorization binding including
  fresh consent after provider revision; idempotent retry, operation-conflict,
  and `unknown` resolution; settlement evidence and reorg handling;
  custody-class display decisions; compliance-hold attribution; statement
  export round-trips; and context isolation of addresses.
- A provider, an adapter, and a vault from three different authors must
  interoperate using only published profiles and fixtures.

## 15. Concrete implementation profiles

The abstract boundary becomes executable only through a concrete profile.
The current implementation target is:

- [UI-Bank-Stellar.md](UI-Bank-Stellar.md) — the Stellar ledger, reusing
  the identity's derived Ed25519/Stellar account from the BIP-39 profile,
  with Stellar transaction envelopes, trustlines, the fee-paying
  transaction relayer, and anchor-based custodial ramps.

Future profiles may target other ledgers or conventional core-banking
providers while preserving the common port. They must use another
implementation profile ID when settlement, encoding, finality, or custody
semantics differ.

## 16. Acceptance criteria

The UI ↔ bank boundary is successfully separated when:

1. a third-party bank provider can serve accounts and payments to Onym
   identities using only published profiles and the capability port;
2. no provider, adapter, or flow can obtain root material, and every
   payment settles exactly the bytes the holder saw and signed;
3. custody class is machine-readable everywhere and a custodial liability
   is never rendered as holder-controlled funds;
4. a non-custodial provider's disappearance leaves funds spendable through
   another conforming adapter with the same vault;
5. compliance holds, fees, rates, and regulatory status are attributed,
   displayed, and never disguised;
6. two of the holder's financial contexts cannot be correlated by
   providers through addresses or proofs the boundary issued;
7. retries, timeouts, and unknown outcomes cannot double-pay;
8. statements export completely enough to reconstruct account history
   without the provider's continued cooperation;
9. seat billing failures degrade service features only, never fund access;
   and
10. a second settlement technology can implement the abstract suite without
    pretending to be the first.

## 17. Justification in one sentence

> Separating the UI, the identity vault, and the bank lets a person hold
> money against keys no bank ever sees, see exactly what every payment will
> do before signing it, and replace the bank—custodial or not—without
> replacing who they are.
