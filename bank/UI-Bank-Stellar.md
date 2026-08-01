# Onym UI ↔ Bank: Stellar Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Onym bank boundary onto Stellar
> accounts, transaction envelopes, trustlines, and anchors—reusing the
> identity's BIP-39-derived Ed25519 key as the holder's non-custodial
> Stellar account.

This document is a concrete implementation of [UI-Bank.md](UI-Bank.md). The
abstract specification remains authoritative for custody classes, intent
binding, authorization, outcomes, evidence bases, compliance attribution,
and payment isolation. This document defines the Stellar mapping and records
where the present clients—which already derive the Stellar key and use it
for contract authorization—do not yet implement any bank flow.

The document distinguishes:

- **implemented behavior**, which exists in the current Onym repositories;
- **profile requirements**, which are required for a conforming Stellar bank
  adapter or provider; and
- **gaps**, where current code still needs to converge on the profile.

## 1. Conformance declaration

| Abstract concept | Stellar mapping |
|---|---|
| Settlement layer | A Stellar network, identified by its network passphrase |
| Non-custodial account | The identity's Ed25519 domain key as a funded Stellar account (`G…`) |
| Account control proof | Vault signature over a challenge bound to the account and network |
| Receiving coordinates | `G…` address; optionally a muxed `M…` sub-address (see §5.2) |
| Asset | Native XLM or an issued asset (code + issuer), held via a trustline |
| Quoted operation | One unsigned XDR `TransactionEnvelope` with pinned sequence and time bounds |
| Quote expiry | Envelope `timeBounds.maxTime`, enforced by the ledger itself |
| Authorization | Vault Ed25519 signature over the envelope hash, domain-separated by network passphrase |
| Network fee | Stellar fee in stroops; optionally borne by a fee-bump relayer |
| Settlement evidence | Transaction result in a closed ledger, via Horizon/RPC |
| Finality | Ledger close under Stellar consensus; no reorganizations |
| Balance basis | `ledger-observed` from Horizon/RPC; anchor balances are `provider-attested` |
| Custodial provider | An anchor serving deposits/withdrawals under SEP-6/SEP-24 |
| Escrow class | Native multisignature accounts with declared signers and thresholds |
| Compliance hold | Anchor policy result, or SEP-8 regulated-asset approval refusal |

The implementation profile identifier is:

```text
onym:bank-implementation:stellar-v1
```

It maps this portable profile:

```text
onym:bank-profile:account-payment-v1
```

The account reuse, envelope display rules, relayer integration, and
sub-address conventions below are Onym conventions. They are not implied by
generic Stellar support: a wallet holding the same Ed25519 key implements
none of this contract's consent, custody-disclosure, or evidence semantics
by virtue of speaking Stellar.

## 2. Ownership mapping

- The **account holder**'s vault derives the Ed25519 key from the BIP-39
  root ([../identity/UI-Identity-BIP39.md](../identity/UI-Identity-BIP39.md))
  and signs envelopes as a displayed-intent capability.
- The **bank provider** operates quoting, records, and (if an anchor)
  custody and compliance. For a purely non-custodial account, the "provider"
  may be as thin as a read service plus quoting logic.
- The **Stellar network** validators settle transactions; they are
  infrastructure, not a counterparty.
- The **transaction relayer** ([../notary/UI-Notary-Stellar.md](../notary/UI-Notary-Stellar.md))
  may wrap payments in fee-bump transactions and pay fees, as it already
  does for contract operations. It can refuse or observe; it cannot forge
  the holder's signature.
- The **anchor**, when used, is a regulated custodial provider bridging
  Stellar assets and external value. Its duties are its own (whitepaper
  §10.2).
- The **UI publisher** presents accounts, quotes, and consent without
  becoming any of the above.

## 3. Physical topology

```text
UI flow / repository
  |-- identity vault: Ed25519 sign (displayed intent), control proofs
  `-- bank port
        |
        v
  Stellar bank adapter
        |-- XDR encode/decode · display rendering
        |-- sequence & time-bounds management
        |-- quote verification · idempotency
        v
  ┌─────────────────────┬──────────────────────┬───────────────────┐
  │ Horizon / RPC       │ Transaction relayer  │ Anchor (optional) │
  │ reads · submission  │ fee-bump submission  │ SEP-6/24 ramps    │
  └─────────────────────┴──────────────────────┴───────────────────┘
                    │
                    v
             Stellar network
```

## 4. Account mapping

### 4.1 The reused identity key

The holder's Stellar account is the Ed25519 domain key already derived by
the BIP-39 identity profile; its public key is the account ID. This gives
every Onym identity a non-custodial account address at zero additional
derivation cost, with signing available through the existing vault
capability.

The reuse has consequences this profile must state plainly:

1. **One account per identity.** Until the identity profile supports
   per-context derivation, all Stellar activity of one identity shares one
   public address. Payments, contract fee history, and any published
   address claim are correlatable by anyone; the abstract boundary's
   context-isolation invariant is *not yet satisfiable* on this profile
   (see §12).
2. **Shared blast radius.** The key that spends funds is derived from the
   same root as messaging and membership keys. Domain separation isolates
   the key material, but root compromise loses everything at once, per the
   identity profile's declared compromise model.
3. **Contract-flow adjacency.** The same key already authorizes Soroban
   group operations. An observer of the ledger can connect an identity's
   group activity and its payment activity through the shared account.

A successor identity profile with per-context Ed25519 derivation upgrades
this profile to real context isolation; the bank port is already shaped for
it (`context` on every account).

### 4.2 Account existence and reserves

A Stellar account exists only after funding: the minimum balance is
`(2 + subentries) × base reserve` (currently 0.5 XLM base reserve, so 1 XLM
for a bare account, +0.5 XLM per trustline or other subentry). A conforming
adapter:

1. distinguishes "key derived" from "account funded" and never renders an
   unfunded address as a working account;
2. reports `insufficient_reserve` in the ledger's terms—spendable balance
   is total minus reserve minus liabilities—rather than as generic
   insufficient funds; and
3. discloses who funds account creation (the holder, a provider's
   `CreateAccount` service offer, or the relayer) as a declared offer, not
   an invisible subsidy.

### 4.3 Trustlines

Issued assets require a `ChangeTrust` operation, which is itself a signed,
reserve-consuming, publicly visible act. The adapter treats trustline
creation as a first-class intent through the same quote → display →
authorize flow as payments: which asset, which issuer, what reserve cost,
and the fact that holding the asset becomes public ledger state.

## 5. Receiving coordinates

### 5.1 Plain account address

The default receiving coordinate is the `G…` account address, displayable
and QR-encodable. Address reuse warnings apply per abstract obligation §7.6,
with the honest caveat that on this profile all contexts currently share
the address anyway (§4.1).

### 5.2 Muxed sub-addresses

The profile may use muxed accounts (`M…` strkey): a 64-bit ID multiplexed
over the one Ed25519 account. These give the holder or a provider
per-context *attribution*—distinguishing payers, invoices, or contexts at
receipt time—without new keys or reserves.

They are attribution, not privacy: the underlying `G…` account is plainly
visible in the muxed address and on the ledger. A conforming client never
presents an `M…` address as unlinkable from the identity's account. Fresh
per-context privacy requires per-context keys, which this profile defers to
the identity layer.

### 5.3 Memos

Classic memo-based attribution (`MEMO_ID`, `MEMO_TEXT`) remains necessary
with some anchors and exchanges. Memos are public ledger content: the
adapter must warn before any user-supplied memo text and must never place
names, identity identifiers, entitlement data, or invoice descriptions in
memos by default.

## 6. Payment mapping

### 6.1 Quote

A quote's `operation` is one unsigned XDR `TransactionEnvelope` containing:

- source account (the holder's, or the relayer flow of §7);
- a pinned sequence number valid at quoting time;
- `timeBounds.maxTime` equal to the quote's `expiresAt`, so expiry is
  enforced by every validator, not just client courtesy;
- the payment operation: `Payment`, `CreateAccount` (when the destination
  is unfunded—rendered as such), or `PathPaymentStrictSend/Receive` for
  conversions, with the path and minimum-received rendered; and
- the network fee in stroops, distinct in the quote from any provider fee.

### 6.2 Display and authorization

The adapter decodes the envelope and renders every operation through a
**whitelist renderer**: operation types it can display faithfully
(`Payment`, `CreateAccount`, `ChangeTrust`, `PathPayment*`,
`AccountMerge`—the last with maximal warning) are shown field by field;
any envelope containing an operation outside the whitelist, more operations
than displayed, or unexpected source accounts is refused before the vault
is ever invoked. `intentDecoding` conformance means: there is no envelope
the renderer displays as less than it does.

The vault signs the envelope hash domain-separated by the network
passphrase—so testnet signatures cannot replay on the public network—and
the adapter submits exactly the signed envelope. Stellar's sequence numbers
make replay of a settled envelope impossible, giving the abstract
idempotency requirement ledger-level teeth: a resubmitted duplicate fails
with a sequence error rather than double-paying.

### 6.3 Outcomes and evidence

- `submitted`: accepted by a Horizon/RPC endpoint into the queue.
- `pending`: not yet in a closed ledger.
- `settled`: transaction result present in a closed ledger; the evidence is
  the result and its ledger number. Stellar consensus does not reorganize,
  so `settled` is final and the abstract `settlement_reorged` error is
  structurally unreachable on this profile.
- `failed`: a result code in a closed ledger (rendered by code:
  underfunded, no trustline, missing destination, bad auth, too late).
- `unknown`: submission timeout—resolved by querying for the transaction
  hash before any re-quote, never by re-signing blind.

`expired` maps to `tx_too_late`: an envelope past its time bounds can never
settle, so expiry is a safe terminal state.

## 7. Fees and the relayer

The holder may pay network fees natively, or the profile may reuse the
existing fee-paying transaction relayer via **fee-bump transactions**: the
relayer wraps the holder's signed envelope in a fee-bump envelope and pays
the fee from its own account.

Profile requirements:

1. the inner envelope the holder signed is untouched—the relayer adds fee
   payment, never operations;
2. the relayer's service, refusal behavior, and observation surface follow
   its existing manifest (it sees the transaction and submission metadata,
   as it already does for contract operations); and
3. the quote states who pays the fee; a relayer subsidy is a declared offer
   term, not magic.

## 8. Custodial class: anchors

Custodial accounts on this profile are anchor balances: deposits and
withdrawals bridged under SEP-6 (programmatic) or SEP-24 (interactive),
authenticated by SEP-10 web auth—a challenge transaction the vault signs as
a `prove-address-control` capability (it must be rendered as a login proof,
never as a payment; a conforming renderer shows SEP-10 challenges as
authentication with zero value movement).

An anchor account's manifest declares `custodyClass: custodial`, its
regulatory self-declaration, protection scheme, and withdrawal terms per
the abstract §5.3/§10. Anchor balances are `provider-attested`; the
on-ledger tokens an anchor issues are ledger-observed, but their
redeemability is exactly the anchor's liability. Clients render that
distinction—token in your account (non-custodial, ledger-observed) versus
balance at the anchor (custodial claim)—without collapsing it.

SEP-8 regulated assets, where an issuer's approval server must co-sign
transactions, map to the abstract `compliance_hold`: attributed to the
issuer's published policy, machine-readable, and rendered as a policy
decision rather than a network failure.

## 9. Escrow class: native multisignature

Stellar's signer weights and thresholds implement the `escrow` class
natively: an account whose declared movements need multiple signers
(holder + provider, holder + recovery service, N-of-M arrangements). The
manifest names signers, weights, thresholds, and the unilateral exit path
if any. Setting signers and thresholds (`SetOptions`) is itself a
displayed, authorized intent with maximal warning: it changes who controls
the account, and a hostile threshold change is account theft.

## 10. Privacy

Everything on Stellar is public: balances, trustlines, every payment's
source, destination, amount, asset, memo, time, and the account's whole
history. Zero-knowledge protections in the Onym notary contracts do not
extend to payments. On this profile:

- the ledger is a permanent public record correlating all activity of the
  reused account (§4.1);
- memos and muxed IDs add attribution on top of that record;
- Horizon/RPC providers additionally observe the holder's queries—balance
  checks and history reads leak interest and IP metadata to the read
  endpoint, which the manifest's privacy profile must declare; and
- anchors learn what their KYC policy collects, bounded by their published
  policy per abstract §9.7–9.8.

A conforming client says this before first use of the bank feature, in the
same register the whitepaper uses for ledger leakage (§9.4): zero knowledge
is not zero metadata, and payments here have no zero knowledge at all.

## 11. Current implementation mapping

| Boundary role | Current implementation |
|---|---|
| Ed25519/Stellar key derivation | Identity modules of `onym-ios` / `onym-android` over the SDKs |
| Stellar-facing authorization | Implemented for Soroban contract flows via `onym-relayer` |
| Fee-bump relaying | `onym-relayer` fee payment for contract operations |
| Bank port, adapter, quotes, display renderer | Not implemented |
| Anchor/SEP integrations | Not implemented |
| Read services (Horizon/RPC selection) | Present for contract flows; no balance/statement surface |

Implemented today: the key, its Stellar account representation, envelope
signing for contract authorization, and relayer submission. No payment,
balance, trustline, or anchor flow exists in any client. This document is
therefore a design profile validated against Stellar's rules, not a
description of shipped behavior.

## 12. Known gaps

Current code and the current identity profile are not yet a conforming
implementation:

1. no bank port, adapter, quote flow, or XDR display renderer exists in the
   clients—the entire §6 pipeline is unbuilt;
2. context isolation is unsatisfiable until the identity profile derives
   per-context Stellar keys; one shared account correlates all payment,
   contract, and published-address activity (§4.1), and this is the
   profile's most user-visible privacy limitation;
3. envelope signing for contract flows does not yet go through a typed
   displayed-intent capability—the vault capability port itself is an
   identity-profile gap that this profile inherits and depends on;
4. no `ServiceManifest` format exists for bank providers, anchors, or read
   services, so custody class, regulatory declarations, and fee schedules
   have no verified carrier;
5. reserve handling (funding, trustline costs, spendable-vs-total) has no
   UX or adapter logic;
6. SEP-10/6/24/8 integrations, and the login-vs-payment rendering split for
   SEP-10 challenges, are unimplemented;
7. statement export, `provider-attested` versus `ledger-observed` labeling,
   and outcome idempotency logic do not exist; and
8. there is no fixture suite: envelope rendering (including adversarial
   envelopes that must refuse), signature domain separation, sequence and
   time-bounds handling, and outcome mapping all need vectors a third-party
   adapter can pass.

These gaps are build order, not open questions: the identity capability
port and per-context derivation (identity profile), then the adapter and
renderer with fixtures, then providers and anchors.

## 13. Conformance tests

A shared fixture suite covers, at minimum:

1. envelope encode/decode round-trips for every whitelisted operation type,
   byte-exact across platforms;
2. adversarial rendering vectors: hidden extra operations, unexpected
   source accounts, non-whitelisted operations, oversized memos—all must
   refuse before signing;
3. signature vectors: envelope hash, network-passphrase domain separation,
   and cross-network replay rejection;
4. sequence and time-bounds vectors: stale sequence, future sequence,
   expired bounds (`tx_too_late`), and duplicate-submission behavior;
5. fee-bump wrapping: inner-envelope immutability under relayer fees;
6. outcome mapping for the principal result codes, including
   `unknown`-then-query resolution;
7. reserve arithmetic: minimum balance, per-subentry costs, spendable
   calculation;
8. muxed address encode/decode and the `M…`-implies-`G…` disclosure rule;
9. SEP-10 challenge rendering as zero-value authentication; and
10. custody-class display decisions for ledger tokens versus anchor
    claims.

## 14. Acceptance criteria

This Stellar profile satisfies the abstract boundary when:

1. a third-party adapter can implement it from the profile and fixtures
   alone, and spend the same non-custodial account as the official client
   with the same vault;
2. no envelope settles that the renderer did not display in full, and no
   rendering vector can be constructed that understates an envelope;
3. quote expiry, replay, and duplicates are enforced by ledger semantics
   (time bounds, sequences) and verified by fixtures;
4. relayer fee payment leaves holder-signed operations untouched and
   declared;
5. anchor balances, ledger tokens, and escrow arrangements render as their
   distinct custody classes with the anchor's declarations visible;
6. SEP-10 authentication is never confusable with a payment;
7. the shared-account correlation limitation is disclosed in-product until
   per-context keys remove it; and
8. the profile upgrades to per-context accounts without changing the
   abstract port's shape.

## References

1. Abstract Onym bank boundary: [UI-Bank.md](UI-Bank.md)
2. Onym BIP-39 identity implementation:
   [../identity/UI-Identity-BIP39.md](../identity/UI-Identity-BIP39.md)
3. Onym Stellar notary implementation:
   [../notary/UI-Notary-Stellar.md](../notary/UI-Notary-Stellar.md)
4. Stellar developer documentation, “Accounts” (reserves, subentries):
   <https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts>
5. Stellar developer documentation, “Transactions and operations”:
   <https://developers.stellar.org/docs/learn/fundamentals/transactions>
6. CAP-15, “Fee-Bump Transactions”:
   <https://github.com/stellar/stellar-protocol/blob/master/core/cap-0015.md>
7. CAP-27 / SEP-23, “Muxed Accounts”:
   <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md>
8. SEP-10, “Stellar Web Authentication”:
   <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md>
9. SEP-24, “Hosted Deposit and Withdrawal”:
   <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md>
10. SEP-8, “Regulated Assets”:
    <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0008.md>
11. Onym transaction relayer: <https://github.com/onymchat/onym-relayer>
