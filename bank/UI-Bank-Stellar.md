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
| Settlement layer | `stellar:<network-passphrase-hash>`, the shared namespace form for a Stellar network |
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

Its `settlementLayer` is the same
`stellar:<network-passphrase-hash>` namespace used by
[UI-Notary-Stellar.md](../notary/UI-Notary-Stellar.md). The canonical hash is
derived from the exact network passphrase; a display label such as `public` or
`testnet` is not a network identity.

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
  and signs envelopes through the identity profile's `sign-transaction`
  displayed-intent capability.
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
  |-- identity vault: sign-transaction, prove-address-control
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
4. **Account-control operations cross seats.** `AccountMerge` can remove the
   account, while signer or threshold changes through `SetOptions` can disable
   or transfer its authorization. Both affect bank payments and any Soroban
   contract-flow transactions sourced by this account.

A successor identity profile with per-context Ed25519 derivation upgrades
this profile to real context isolation; the bank port is already shaped for
it (`context` on every account).

### 4.2 Account existence and reserves

A Stellar account exists only after funding. Its reserve requirement is:

```text
(2 + numSubEntries + numSponsoring - numSponsored) * baseReserve
```

Selling liabilities also reduce the spendable balance. `baseReserve` is a
live network parameter; clients read it rather than hard-code a nominal XLM
value. A conforming adapter:

1. distinguishes "key derived" from "account funded" and never renders an
   unfunded address as a working account;
2. maps `insufficient_reserve` to the abstract
   `available_balance_restricted` error and shows total balance, reserve,
   sponsorship counters, liabilities, and resulting spendable balance; and
3. discloses who funds account creation and reserves as a declared offer, not
   an invisible subsidy. CAP-33 sponsorship uses paired
   `BeginSponsoringFutureReserves` / `EndSponsoringFutureReserves` operations
   and changes `numSponsoring` / `numSponsored`; it does not erase the reserve
   or turn a fee-bump relayer into a sponsor by implication.

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

- the holder's account as the **inner transaction source**; a §7 fee-bump
  relayer can become only the outer fee source and never replaces this value;
- a pinned sequence number allocated under the serialization rule below;
- `timeBounds.maxTime` equal to the quote's `expiresAt`, so expiry is
  enforced by every validator, not just client courtesy;
- the payment operation: `Payment`, `CreateAccount` (when the destination
  is unfunded—rendered as such), or `PathPaymentStrictSend/Receive` for
  conversions, with the path and minimum-received rendered; and
- the network fee in stroops, distinct in the quote from any provider fee.

#### 6.1.1 Sequence allocation and concurrency

This profile permits at most one live quoted or authorized transaction per
underlying `G…` source account. The adapter acquires a per-account sequence
lease, reads the current sequence and observation ledger, assigns the next
sequence, and holds the lease until the intent settles, fails, expires, or is
explicitly cancelled. It does not issue several independent quotes with the
same sequence or assume they will be submitted in order.

The account is shared with current Soroban contract flows and may also be used
by another wallet, so an operation outside the bank adapter can advance the
sequence and invalidate the lease. The adapter re-reads account state before
authorization and submission. On `tx_bad_seq`, it first queries the authorized
transaction hash to rule out an already accepted submission; otherwise it
returns abstract `operation_conflict`, discards the stale quote, and obtains a
fresh quote and authorization. It never edits or blindly re-signs the old
envelope.

This lease rule applies to transactions intended for ledger submission.
SEP-10 authentication challenges are deliberately non-submittable, use the
protocol-required sequence number zero, and follow the separate validation
path in §8.

### 6.2 Display and authorization

The adapter decodes the envelope and renders every operation through a
**whitelist renderer**. The whitelist and minimum rendering rules are:

| Operation | Required rendering and checks |
|---|---|
| `Payment` | source, destination, exact asset and amount |
| `CreateAccount` | source, destination, starting balance, reserve and sponsorship effect |
| `ChangeTrust` | holder, asset code and issuer, limit, reserve and public-linkability effect |
| `PathPaymentStrictSend` / `PathPaymentStrictReceive` | source/destination assets and amounts, full path, limits, slippage, destination |
| `ManageData` | key, value digest, source, and zero-value effect; accepted for SEP-10 only after full challenge validation and rendered as authentication, never payment |
| `AllowTrust` | issuer source, trustor, asset, and authorization value; accepted only as an issuer-sourced SEP-8 compliance operation |
| `BeginSponsoringFutureReserves` / `EndSponsoringFutureReserves` / `RevokeSponsorship` | every source, sponsored party or ledger entry, pairing, and reserve-liability change |
| `SetOptions` | every signer addition/removal, signer weight, master weight, threshold, flag, home domain, and other changed field, with maximal account-control warning |
| `AccountMerge` | source, destination, whole-balance transfer, account deletion, and maximal irreversible warning |

Any envelope containing an operation outside the whitelist, more operations
than displayed, an unexpected source account, or a whitelisted operation that
fails its context-specific checks is refused before the vault is invoked.
`intentDecoding` conformance means there is no envelope the renderer displays
as less than it is.

For the reused account, the maximal warnings for `SetOptions` and
`AccountMerge` explicitly say that the operation can disable, transfer, or
destroy both bank control and the identity's account-based authorization for
Soroban contract-flow transactions. A generic “account settings” or “close
account” label is nonconforming.

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
  underfunded, low reserve, no trustline, missing destination, bad auth, bad
  sequence, too late).
- `unknown`: submission timeout—resolved by querying for the transaction
  hash before any re-quote, never by re-signing blind.

`expired` maps to `tx_too_late`: an envelope past its time bounds can never
settle, so expiry is a safe terminal state.

Stellar-specific result mapping extends the abstract errors:

| Stellar result | Abstract result |
|---|---|
| `tx_bad_seq` | `operation_conflict`, after transaction-hash reconciliation |
| `tx_insufficient_balance` or an operation-specific `*_low_reserve` | `available_balance_restricted` with reserve and sponsorship detail |
| an operation-specific `*_underfunded` | `insufficient_funds` |
| `tx_too_late` | `quote_expired` |

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

SEP-8 regulated assets require an explicit approval loop:

1. The holder authorizes the initially displayed envelope, and the adapter
   sends those exact bytes to the issuer's approval server rather than to the
   network.
2. A `success` response may add issuer signatures but must preserve the
   transaction bytes and holder operations; the adapter verifies this before
   submission.
3. A `revised` response is `authorization_revision_required`, not approval of
   the old intent. The adapter preserves it as a new quote revision, verifies
   every original holder-sourced operation is byte-for-byte unchanged, rejects
   any added holder-sourced operation, decodes and displays every added
   issuer-sourced operation, compares the revisions, and requests a fresh
   holder signature over the complete revised envelope.
4. `pending`, `action_required`, and `rejected` remain attributed
   `compliance_hold` states under the issuer's published policy. Resubmission
   after action or delay reuses the same authorized bytes unless the server
   returns a separately displayed revision.

The revised envelope never inherits the original signature as consent. The
fresh authorization covers the complete transaction, including SEP-8
`AllowTrust` operations or other issuer-added compliance operations. This is a
new authorization cycle, not post-consent mutation.

## 9. Escrow class: native multisignature

Stellar's signer weights and thresholds implement the `escrow` class
natively: an account whose declared movements need multiple signers
(holder + provider, holder + recovery service, N-of-M arrangements). The
manifest names signers, weights, thresholds, and the unilateral exit path
if any. Setting signers and thresholds (`SetOptions`) is itself a
displayed, authorized intent with maximal warning: it changes who controls
the account, and a hostile threshold change is account theft. Because this
profile reuses the same account for current Soroban flows, the warning also
states that changing master weight, signers, or thresholds can disable or hand
another signer the account authorization used by those contract transactions.
`AccountMerge` carries the corresponding warning that deleting the account
also destroys that cross-seat authorization surface until a separately
verified recovery or recreation flow succeeds.

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
5. reserve handling (including CAP-33 sponsorship counters, trustline costs,
   and spendable-vs-total calculation) has no UX or adapter logic;
6. SEP-10/6/24/8 integrations, and the login-vs-payment rendering split for
   SEP-10 challenges, are unimplemented;
7. statement export, `provider-attested` versus `ledger-observed` labeling,
   sequence leasing across bank and Soroban flows, SEP-8 revision handling,
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
   expired bounds (`tx_too_late`), duplicate-submission behavior, concurrent
   quote refusal, and invalidation by an external Soroban transaction;
5. fee-bump wrapping: inner-envelope immutability under relayer fees;
6. outcome mapping for the principal result codes, including
   `unknown`-then-query resolution;
7. reserve arithmetic: `numSubEntries`, `numSponsoring`, `numSponsored`,
   selling liabilities, spendable calculation, and CAP-33 begin/end pairing;
8. muxed address encode/decode and the `M…`-implies-`G…` disclosure rule;
9. SEP-10 `ManageData` challenge validation and rendering as zero-value
   authentication;
10. `SetOptions` and `AccountMerge` rendering with the bank-and-Soroban
    cross-seat authority warning;
11. SEP-8 `success`, `revised`, `pending`, `action_required`, and `rejected`
    flows, including byte comparison and fresh authorization of revisions;
12. result mapping for `tx_bad_seq`, reserve restrictions, underfunding, and
    expiry; and
13. custody-class display decisions for ledger tokens versus anchor claims.

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
7. SEP-8 revisions cannot bypass a complete diff, re-display, and fresh
   authorization cycle;
8. shared-account sequence conflicts cannot cause blind resubmission or
   hidden re-signing;
9. the shared-account correlation and cross-seat account-control limitations
   are disclosed in-product until per-context keys remove them; and
10. the profile upgrades to per-context accounts without changing the
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
7. CAP-33, “Sponsored Reserves”:
   <https://github.com/stellar/stellar-protocol/blob/master/core/cap-0033.md>
8. CAP-27 / SEP-23, “Muxed Accounts”:
   <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md>
9. SEP-10, “Stellar Web Authentication”:
   <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md>
10. SEP-24, “Hosted Deposit and Withdrawal”:
   <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md>
11. SEP-8, “Regulated Assets”:
    <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0008.md>
12. Onym transaction relayer: <https://github.com/onymchat/onym-relayer>
