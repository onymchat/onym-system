---
status: draft
proposed: Claude & @rinat-enikeev
date: 13.08.2026
---

# Onym UI ↔ Notary: BNB Chain (EVM) Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Onym notary boundary onto BNB
> Smart Chain, Solidity `sep-*` contracts, PLONK authorization evidence over
> BN254, and the Onym relayer operating as a declared notary-seat operator.

This document is a concrete implementation of
[UI-Notary.md](UI-Notary.md). The abstract specification remains authoritative
for UI-facing semantics. The Stellar/Soroban implementation is specified in
[UI-Notary-Stellar.md](UI-Notary-Stellar.md); this profile is its EVM sibling,
not its replacement.

The document distinguishes:

- **accepted decisions**, which are settled for this profile;
- **profile requirements**, which are required for a complete conforming BNB
  implementation; and
- **gaps**, where no code exists yet. As of this draft the entire BNB path is
  unimplemented: `onym-relayer` speaks only Stellar CLI, `onym-contracts`
  contains no Solidity, and no BN254 circuits exist.

## 1. Accepted decision: BN254 re-target

Two proof-system options were evaluated for the EVM port:

1. keep the existing TurboPLONK/BLS12-381 circuits and hand-write a Solidity
   verifier against the EIP-2537 precompiles (available on BSC since the
   Pascal hardfork); or
2. **re-target the circuits to BN254** and use standard PLONK with
   toolchain-generated Solidity verifiers over the battle-tested alt_bn128
   precompiles.

**Option 2 is accepted.** Rationale: the BN254 pairing precompiles have years
of production exposure; PLONK verifier generation for them is automated and
audited in widely used toolchains; gas cost is lower; and the bespoke-verifier
audit surface of option 1 is avoided. The cost is a circuit migration: new
constraint systems, a new setup, new verifying keys, and a second prover
backend in the mobile Rust FFI.

Because the evidence scheme differs, this profile does **not** reuse the
Stellar profile IDs. A BLS12-381 proof is not valid evidence under this
profile and a BN254 proof is not valid under the Stellar one. The abstract
specification (§16) requires exactly this separation.

## 2. Conformance declaration

| Abstract concept | BNB/EVM mapping |
|---|---|
| Canonical system | BNB Smart Chain network selected by EIP-155 chain ID |
| Policy engine | One deployed non-upgradeable Solidity `sep-*` contract instance |
| Canonical state | Contract storage under the group ID key |
| State commitment | `bytes32` group commitment (BN254 field element) |
| Revision | `uint64` epoch |
| Authorization evidence | PLONK proof over BN254 (KZG) plus ordered `bytes32` public inputs |
| Implementation identity | Chain ID, contract address, deployed runtime code hash, profile/release |
| Submission provider | Gas-paying `onym-relayer` HTTP service (EVM backend) |
| Read provider | BNB JSON-RPC / indexer; relayer proxy permitted but not canonical |
| Submission reference | EVM transaction hash |
| Acceptance/finality evidence | Successful transaction receipt in a fast-finalized block plus resulting state/event |
| Maintenance | None; EVM state persists without rent (`maintainState` unsupported) |

The implementation profile identifier is:

```text
onym:notary-implementation:bnb-evm-sep-plonk-bn254-v1
```

Each governance flavor has its own logical `NotaryProfile`:

```text
onym:notary-profile:sep-anarchy-plonk-bn254-v1
onym:notary-profile:sep-oneonone-plonk-bn254-v1
onym:notary-profile:sep-democracy-plonk-bn254-v1
onym:notary-profile:sep-oligarchy-plonk-bn254-v1
onym:notary-profile:sep-tyranny-plonk-bn254-v1
```

The `-bn254-` segment is the circuit-type discriminator. It is load-bearing:
it is what the manifest, the UI selection surface, and the group binding pin.

## 3. Circuit type in the notary manifest

The contracts manifest gains an explicit, user-visible proof-system
declaration. A manifest entry for this profile is:

```json
{
  "network": "bnb-testnet",
  "chainId": 97,
  "type": "tyranny",
  "id": "0x...",
  "proofSystem": "plonk-bn254-kzg",
  "verifier": "0x...",
  "runtimeCodeHash": "0x...",
  "verifierCodeHash": "0x...",
  "profileId": "onym:notary-profile:sep-tyranny-plonk-bn254-v1"
}
```

Existing Stellar entries are retroactively understood to carry
`"proofSystem": "turbo-plonk-bls12-381-kzg"`; an absent field means exactly
that value and nothing else. A manifest consumer must never interpret an
unknown `proofSystem` as a known one with defaults.

### 3.1 User selection

The app user selects the circuit type when creating a group, alongside
network and governance flavor. The UI must:

1. list only circuit types whose manifest entries it can fully verify
   (profile, verifier anchors, code hashes, operator signature);
2. display the circuit type with its practical consequences — which canonical
   system the group will live on, its metadata exposure, fee model, and
   finality behavior — not only a cryptographic label;
3. pin the selected circuit type into the group binding at creation; and
4. treat the selection as sticky. A settings change selects defaults for new
   groups only. An existing group never changes circuit type outside the
   declared migration protocol (§15).

A joiner does not select a circuit type; the invitation carries the pinned
binding and the joining client verifies it or refuses. Prover availability is
a capability, not a preference: a client lacking the BN254 prover must refuse
to join a `-bn254-` group rather than substitute evidence.

## 4. Ownership mapping

- The **policy author** publishes the `sep-*` Solidity contracts, BN254
  circuits, setup transcript, verifying keys, fixtures, source revision, and
  release artifacts in `onym-contracts`.
- The **notary deployer** deploys selected bytecode to a selected BNB network.
  Contracts are non-upgradeable; the deployer holds only the operator powers
  encoded in the constructor.
- The **BNB validator set** establishes canonical blocks and fast finality.
- The **notary operator** — the `onym-relayer` operator — is a declared seat
  operator (§8). It holds a funded EVM account, signs and submits
  transactions, pays gas, exposes the HTTP API, and controls the
  deployment-administration entrypoints its manifest declares.
- The **RPC or indexer operator** serves blocks, receipts, logs, and state
  but does not independently define canonical contract state.
- The **group** pins chain ID, governance flavor, circuit type, contract
  address, runtime code hash, release/profile, and genesis evidence.
- The **UI publisher** presents selection and may broker payment, but is not
  a contract authority.

## 5. Deployment identity

The abstract `NotaryDeployment` maps as:

```json
{
  "deploymentVersion": 1,
  "deploymentId": "onym:notary:bnb:<chain-id>:<contract-address>",
  "profileId": "onym:notary-profile:sep-tyranny-plonk-bn254-v1",
  "operator": "onym:key:<notary-operator>",
  "backend": {
    "kind": "onym:notary-implementation:bnb-evm-sep-plonk-bn254-v1",
    "namespace": "eip155:<chain-id>",
    "instance": "0x<contract-address>",
    "implementationHash": "0x<runtime-code-hash>"
  },
  "release": "vX.Y.Z",
  "proofSystem": "plonk-bn254-kzg",
  "verifierAnchors": "<content-addressed-vk-anchor-set>",
  "submitEndpoints": ["onym:component:onym-relayer"],
  "readEndpoints": ["onym:component:<bnb-rpc-or-indexer>"],
  "offers": ["<notary-offer-id>"],
  "signature": "<operator-signature>"
}
```

Network identity is the EIP-155 chain ID, not a display name. This profile
is scoped to BSC mainnet (56) and BSC testnet (97): its finality rule (§10)
and reorg model are BSC-L1 fast-finality semantics. opBNB (204) is a
distinct namespace with L2 finality semantics — soft confirmation by the
sequencer, then L1 settlement — and is **not covered** by this profile; a
deployment there requires a separate implementation profile declaring its
own finality, sequencer-trust, and reorg rules. The contract address selects
one instance; the keccak-256 hash of the deployed runtime bytecode
identifies its implementation. Both are required.

Upgradeable proxies are **prohibited** for `sep-*` deployments under this
profile. If a future profile permits them, the upgrade power is an operator
power that must appear in the operator manifest and the trust model, and that
profile needs a different implementation ID.

## 6. Group binding

The BNB `GroupNotaryBinding` pins:

```json
{
  "bindingVersion": 1,
  "groupId": "<base64-32-byte-id>",
  "deploymentId": "onym:notary:bnb:97:0x...",
  "profileId": "onym:notary-profile:sep-tyranny-plonk-bn254-v1",
  "backendNamespace": "eip155:97",
  "backendInstance": "0x...",
  "proofSystem": "plonk-bn254-kzg",
  "runtimeCodeHash": "0x...",
  "verifierAnchors": "<content-addressed-vk-anchor-set>",
  "policy": "sep-tyranny",
  "genesis": {
    "revision": 0,
    "stateCommitment": "<base64-32-byte-field-element>",
    "canonicalReference": {
      "transactionHash": "0x...",
      "blockNumber": 123456,
      "logIndex": 3
    },
    "evidence": "<creation-receipt-and-event-evidence>"
  }
}
```

The sticky-binding rule from the abstract specification applies unchanged: a
cheaper chain, a newer circuit, or a UI default cannot move an existing
group. An invitation carries enough of this object to reconstruct and verify
the same binding; a receiver must not resolve "latest contract for this
flavor" in place of the inviter's pinned address.

## 7. Contract family, state, and evidence mapping

The five governance flavors keep their Stellar semantics — the policy
predicates are the constraint systems, and re-targeting the curve must not
change what they prove.

| Abstract operation | Solidity entrypoint | Availability |
|---|---|---|
| `createState` | `createGroup` | Anarchy, one-on-one, democracy, tyranny |
| `createState` | `createOligarchyGroup` | Oligarchy |
| `transitionState` | `updateCommitment` | All except one-on-one |
| `verifyStatement` | `verifyMembership` (`view`) | All five |
| `readState` | `getCommitment` (`view`) | All five |
| `readHistory` | `getHistory` (`view`) | All except one-on-one |
| Flavor read | `getAdminCommitment` (`view`) | Tyranny only |
| `maintainState` | — | Unsupported; capability flag explicitly `false` |
| Deployment administration | `setRestrictedMode` | All five; operator only; not group governance |

Evidence rules:

- Public inputs keep the exact ordered statements defined in the Stellar
  profile (§9 there), re-encoded as BN254 field elements. Client-chosen
  identifiers and commitments (`group_id`, group and occupancy commitments)
  must be **canonically in-field**: generated below the BN254 scalar modulus
  by rejection sampling, and rejected by the contract when out of range.
  Reduction modulo the field is forbidden for these values — it is
  non-injective over 32 bytes, so a crafted `group_id' = group_id + r` would
  share a proof-bound field element with a different storage key and let
  evidence for one group authorize a second. A declared, fixture-pinned
  reduction rule is permitted only for values the client cannot choose
  (e.g. epoch counters, which are far below the modulus by construction);
  silent truncation is a conformance failure everywhere.
- The contract reads prior state from storage and compares it to the ordered
  public inputs before calling the verifier. `c_new` and the next epoch are
  proof-bound or storage-derived, never trusted from a separate caller field.
- Verifier contracts are toolchain-generated per flavor (and per tier where
  applicable), deployed immutably, and referenced by address plus code hash
  in the manifest. Verifying keys are content-addressed in `verifierAnchors`.
- The verifier address and the operator admin address are Solidity
  `immutable` values, embedded in the deployed runtime bytecode — never
  constructor-set storage. This is what makes the `runtimeCodeHash` pin in
  §5/§6 actually cover which verifier runs and who holds operator powers;
  a storage-configured verifier would sit outside the hash and void the
  binding check. The contract additionally exposes `getVerifier()` and
  `getOperatorAdmin()` view functions, and the client's binding verification
  compares both against the manifest before first use.
- Replay protection stores the keccak-256 hash of the proof bytes per group
  for state-changing calls; a repeated proof reverts with `ProofReplay`.
  Read-only `verifyMembership` does not consume the proof.
- The outer transaction sender (`msg.sender`, the relayer's account) is never
  a group authority. `setRestrictedMode` is the only entrypoint gated on an
  address, and that address is the constructor-set operator admin.

Proof size and encoding (exact byte length, point encoding, field order) are
fixed by the toolchain release and pinned in the profile fixtures; this draft
deliberately does not hardcode a number the way 1601 was hardcoded for
TurboPLONK — the conformance suite owns it.

## 8. The relayer as notary-seat operator

This is the second structural change this profile makes, and it mirrors the
Authority seat in `onym-moderation`. There, an independent authority operator
publishes a signed manifest that declares exactly what it may do, the
manifest is served byte-for-byte because consent pins its hash, and the
governing invariant is a power split: *the authority's key can sign verdicts;
it can never write marks*.

`onym-relayer` becomes the same kind of declared operator for group metadata
and governance-with-ZK. The equivalent invariant:

> **The operator's key can pay for, submit, and gate the creation of group
> state; it can never author a group transition.** Transitions are authorized
> only by BN254 evidence under the pinned policy.

### 8.1 NotaryOperatorManifest

The relayer publishes and serves a signed manifest at `GET /manifest.json`,
byte-for-byte, because group bindings and entitlements pin its hash:

```json
{
  "version": 1,
  "componentId": "onym:component:onym-relayer",
  "seat": "notary",
  "operator": "onym:key:<hex-ed25519-public>",
  "implementationProfiles": [
    "onym:notary-implementation:stellar-soroban-sep-plonk-v1",
    "onym:notary-implementation:bnb-evm-sep-plonk-bn254-v1"
  ],
  "networks": [
    { "namespace": "eip155:97", "submitterAccount": "0x...", "adminAccount": "0x...", "role": "gas-payer" },
    { "namespace": "stellar:<passphrase-hash>", "submitterAccount": "G...", "role": "fee-payer" }
  ],
  "powers": {
    "gateCreation": true,
    "setRestrictedMode": ["<deployment-id>..."],
    "allowlistControl": "manifest-mirror",
    "canAuthorTransitions": false,
    "canRewriteState": false,
    "canCensorSubmission": true
  },
  "privacyProfile": "<hash-or-url>",
  "availabilityProfile": "<hash-or-url>",
  "offers": ["<seat-offer-id>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<ed25519-signature>"
}
```

Rules carried over from the Authority pattern:

1. the `operator` key must equal the public half of the service's signing
   seed; the service refuses to start on mismatch;
2. the manifest is canonicalized (signature field structurally dropped,
   key-sorted serialization) for signing, identically across languages, with
   shared byte-level fixtures;
3. powers are exhaustive — a power not declared is a power the operator does
   not have, and `canCensorSubmission: true` is declared honestly because any
   submitter can refuse; the abstract boundary already makes censorship
   survivable, not impossible;
4. the manifest hash referenced by a binding or entitlement freezes those
   bytes; changed terms mean a new manifest version and hash, never an edit
   in place;
5. the manifest's ed25519 `operator` key and the EVM secp256k1 accounts are
   different keys, and the manifest is what binds them: each `networks`
   entry declares the `adminAccount` whose `msg.sender` the contracts'
   `setRestrictedMode` accepts (matching the contract's immutable operator
   admin, §7) and the `submitterAccount` that pays gas. The client's
   deployment verification compares the manifest's `adminAccount` against
   the contract's `getOperatorAdmin()` — without this comparison, "declared
   powers match contract-enforced reality" (§19.3) is not verifiable; and
6. `validUntil` expiry ends *new* reliance only: no new group may bind and
   no new entitlement may reference an expired manifest, but bindings and
   consent records pinning its hash remain verifiable against those exact
   bytes forever, and the operator must keep superseded manifest versions
   retrievable by hash. A successor manifest is signed by the same
   `operator` key, or by a new key via an explicit rotation statement signed
   by the old key; an unsigned key change is a different operator, not a
   rotation.

The operator manifest describes the **service seat**. It does not replace the
per-deployment `NotaryDeployment` object (§5); a deployment references the
operator, and the operator manifest lists which deployments it administers.

### 8.2 What the operator seat does and does not decide

The operator (like the Authority within its mandate) has real, bounded
authority:

- it may refuse creation globally via `setRestrictedMode` where its manifest
  declares that power;
- it may allowlist which deployments it submits to, mirroring the published
  contracts manifest;
- it may require payment or entitlement before spending gas; and
- it may rate-limit, size-limit, and authenticate its own API.

It cannot: advance or rewrite any group's commitment or epoch, forge
evidence, substitute circuit types, move a binding, or make a paid-but-
invalid operation valid. These are contract-enforced, not policy promises.

## 9. Relayer protocol (EVM backend)

The relayer gains an EVM invocation backend beside the Stellar CLI backend.
The request shape extends the current protocol:

```json
{
  "operationVersion": 1,
  "operationId": "<client-random-id>",
  "network": "bnb-testnet",
  "chainId": 97,
  "deploymentId": "onym:notary:bnb:97:0x...",
  "contractId": "0x...",
  "runtimeCodeHash": "0x...",
  "contractType": "tyranny",
  "proofSystem": "plonk-bn254-kzg",
  "function": "updateCommitment",
  "expected": { "revision": 12, "stateCommitment": "<base64-32-bytes>" },
  "payload": {
    "group_id": "<base64-32-bytes>",
    "proof": "<base64-proof-bytes>",
    "publicInputs": ["<base64-32-bytes>", "..."]
  },
  "entitlement": "<seat-entitlement-or-null>"
}
```

The `contractId` spelling replaces the legacy Stellar `contractID`; the EVM
request uses `chainId`-consistent camel case throughout. The relayer
validates operator-manifest scope, allowlist membership
(network × flavor × address × proofSystem), that the client's pinned
`deploymentId` and `runtimeCodeHash` match the allowlisted deployment — a
mismatch is `deployment_mismatch`, refused before gas is spent, so a client
holding a stale or wrong binding cannot be silently served a different
contract — function/flavor compatibility, field lengths, and encodings; ABI-encodes the call; signs
with its funded account; submits; and returns the transaction hash
immediately:

```json
{
  "operationId": "<same-id>",
  "status": "submitted",
  "submissionProvider": "onym:component:onym-relayer",
  "transactionHash": "0x...",
  "canonicalReference": null,
  "acceptedRevision": null,
  "acceptedStateCommitment": null,
  "evidence": null
}
```

Unlike the current Stellar write path, returning the transaction hash on the
success path is **mandatory** from the first EVM release. It is, however,
**provisional**: a stuck-transaction replacement (same-nonce gas bump)
produces a different hash for the same logical operation, so the hash in the
submission receipt may never be mined. The stable reconciliation key is
`operationId`, not the hash. The outcome-query endpoint
(`GET /operations/:operationId`) returns the current transaction hash, every
superseded hash, and the current receipt status; a client that polls a
receipt by hash and finds nothing must fall back to the operation query
before concluding anything.

Gas note: the relayer's EOA nonce serializes its submissions; the
implementation must manage nonce assignment and replacement without ever
changing the logical operation — a replacement carries byte-identical
calldata, only fee fields differ. Duplicate client retries with the same
`operationId` map to the same logical operation, not a second execution.

## 10. Write lifecycle, finality, and receipt

```text
1. UI reads and verifies current contract state via an RPC/read provider.
2. Local SDK creates the new commitment and BN254 PLONK proof.
3. UI serializes the profile-pinned operation.
4. Relayer validates manifest scope, allowlist, function, payload, entitlement.
5. Relayer ABI-encodes, estimates gas, signs with its funded account.
6. Relayer submits and returns the (provisional) transaction hash.
7. Client polls eth_getTransactionReceipt for that hash, falling back to
   GET /operations/:operationId when the hash resolves to nothing, since a
   nonce replacement may have superseded it.
8. status == 1 in an included block means executed; the client then waits for
   the binding's finality rule.
9. Client decodes the GroupCreated / CommitmentUpdated event, confirms
   expected epoch and commitment against a state read.
10. Client commits optimistic state locally.
```

Finality rule: a transaction is `finalized` when its block is at or below the
chain's fast-finality checkpoint (the `finalized` block tag on BSC). The
profile treats `accepted` (receipt with `status == 1`) and `finalized` as
distinct states; on BSC the gap is seconds, but the UI still must not show
completion before reconciliation, and a receipt in a later-orphaned block is
the `conflicting_state` security event, not a retry.

A `status == 0` receipt (revert) is a named rejection; the adapter decodes
the custom error selector into the abstract error taxonomy (§13). An HTTP
success from the relayer is transport progress only, exactly as in the
abstract specification.

## 11. Read lifecycle and evidence

Reads target the BNB JSON-RPC surface: `eth_call` against the pinned contract
for state, `eth_getLogs` for events, `eth_getTransactionReceipt` for
acceptance evidence, with the `finalized` block tag for canonical snapshots.
The normalized snapshot is:

```json
{
  "snapshotVersion": 1,
  "groupId": "<base64-32-byte-id>",
  "deploymentId": "onym:notary:bnb:97:0x...",
  "profileId": "onym:notary-profile:sep-tyranny-plonk-bn254-v1",
  "revision": 12,
  "stateCommitment": "<base64-32-byte-field-element>",
  "policyState": { "status": "active", "publicValues": "<flavor-specific>" },
  "canonicalReference": {
    "namespace": "eip155:97",
    "contractId": "0x...",
    "blockNumber": 123456,
    "blockHash": "0x...",
    "transactionHash": "0x..."
  },
  "observedAt": "<client-observation-time>",
  "evidence": "<receipt-log-or-proof-evidence>"
}
```

The relayer may proxy reads for convenience, but a TLS response from the
party that also submitted the write is not independent evidence. The client
must be able to point at a second RPC provider and compare. Higher-assurance
modes may verify Merkle-Patricia storage proofs (`eth_getProof`) against a
finalized block hash; the baseline mode compares state reads with decoded
event evidence across providers.

Standard RPC nodes serve full state but bounded log ranges; long-term audit
needs the client, operator, or an indexer to retain canonical references and
receipts, exactly as in the Stellar profile.

## 12. Events, history, and maintenance

Contracts emit typed events for group creation, commitment update, and
restricted-mode changes, with the group ID as an indexed topic and
flavor-specific data (commitment, epoch, tier, occupancy commitment,
threshold, timestamp) in the data field. Block timestamps are consensus
metadata, never user-authored time.

Contract-retained bounded history maps to `getHistory` where the flavor
supports it. RPC log retention is an operator window, not history.

There is no TTL, archival, or rent on BNB Chain: state persists once written.
`maintainState` is therefore **unsupported**, and the deployment's
capabilities declare it explicitly as `"maintainState": false`. An absent
flag is not a statement — it is indistinguishable from an older manifest —
so clients must treat absence as unknown and refuse, per the §3 rule against
defaulting unknown fields, rather than assume either the Stellar behavior or
this one.
The corresponding operational cost moves to write time (gas per state slot),
which the operator's offers may price accordingly.

## 13. Error mapping

| Abstract error | BNB/EVM source |
|---|---|
| `unsupported_profile` | Unknown release/profile/code hash/verifier anchors/proofSystem |
| `deployment_mismatch` | Wrong chain ID, address, flavor, or runtime code hash |
| `payment_required` | Relayer refusal with signed seat offer |
| `auth_required` | Relayer bearer/entitlement missing |
| `invalid_entitlement` | Relayer/broker entitlement rejection |
| `state_exists` | Contract `GroupAlreadyExists()` revert |
| `state_not_found` | Contract `GroupNotFound()` revert |
| `invalid_evidence` | Contract `InvalidProof()` revert or verifier failure |
| `public_input_mismatch` | Contract `PublicInputsMismatch()` revert (malformed or misordered statement) |
| `stale_revision` | Contract `StaleRevision()` revert (well-formed statement bound to a superseded epoch/commitment) |
| `replay` | Contract `ProofReplay()` revert or duplicate operationId mapping |
| `unauthorized` | `OperatorOnly()` revert or restricted-mode refusal |
| `submission_failed` | HTTP, gas estimation, nonce, mempool, or inclusion failure |
| `outcome_unknown` | Transaction hash not yet resolvable to a receipt |
| `finality_timeout` | Included but not yet below the finalized checkpoint |
| `conflicting_state` | Receipt/state contradicts finalized evidence or the binding |
| `state_unavailable` | RPC unavailable or log window exceeded |

Custom Solidity errors (four-byte selectors) are the stable contract-level
taxonomy; raw revert data and HTTP status remain diagnostics. `StaleRevision`
and `PublicInputsMismatch` are distinct selectors by requirement — the
Stellar profile collapses them into one comparison, but here the adapter's
retry guidance differs (refresh-and-rebuild versus refuse-as-defect), so the
contract must make them decidable.

## 14. Payment and fee mapping

The three paid layers from the abstract model apply: notary deployment
service, transaction relayer (gas), and RPC/indexer. The relayer pays BNB gas
from its own account; the mobile operation contains no user EVM key, so the
fee-abstraction boundary matches Stellar. Off-chain billing follows the
abstract `PaymentRequired` / `SeatEntitlement` flow, with the entitlement
scoped to the operator manifest hash.

Native user-paid gas is not part of this profile: it would put a user-funded
EVM address adjacent to group activity on a public chain, which is exactly
the linkability §10.2 of the abstract specification warns about. A profile
that wants it must be declared separately.

No payment mechanism may bypass proof verification, prior-state checks,
replay protection, or restricted-mode rules.

## 15. Migration and coexistence with the Stellar profile

Both implementations run behind the same abstract port and the same relayer
component. A group lives on exactly one; the circuit type in its binding says
which. Cross-implementation migration (a Stellar-pinned group moving to BNB
or back) is a governed migration under §14 of the abstract specification: it
needs an authorization under the old policy, export of the old final state
and evidence, and a new genesis that binds it. This profile does not define
that protocol yet; until it exists, migration between circuit types is
**unsupported** and UIs must present a re-created group as a new group linked
by claim, not the same group.

## 16. Security and privacy properties

1. Proof witnesses and group secrets remain in the mobile SDK/FFI boundary;
   the BN254 prover runs locally.
2. The contract receives only profile-declared commitments, proof, public
   inputs, group ID, and public policy values.
3. The relayer can observe IP, time, chain, contract, function, group ID,
   proof bytes, public inputs, and payload size — and now declares that
   exposure in its operator manifest's privacy profile.
4. BNB Chain observers can inspect calldata, state, and events of every
   successful invocation, indexed by public block explorers. This is broader
   practical exposure than Stellar's and the UI's circuit-type selection
   screen must say so.
5. The relayer's submitting EOA links all groups it serves to one on-chain
   payer. This is an accepted metadata property of the shared-operator model
   and must appear in the privacy profile.
6. Relayer credentials, entitlements, and payment evidence never become
   calldata or contract state.
7. Verifier addresses, verifying keys, and runtime code hashes are pinned;
   "latest release" never substitutes for a pinned binding.
8. The ed25519 operator key signs the manifest; the manifest-declared
   secp256k1 `adminAccount` signs administrative transactions. Neither
   appears in group authorization evidence.
9. Client state is durable only after receipt, event, and finalized-state
   reconciliation.

## 17. Versioning and conformance

The BNB profile pins:

- chain ID, contract address, deployed runtime code hash;
- governance flavor, circuit type, abstract profile version;
- Solidity ABI and contract release;
- proof encoding, public-input order and field-mapping rule, tier, verifier
  contract addresses and anchors;
- relayer request/response version and operator-manifest hash;
- state and event schemas;
- receipt, finality, and reconciliation rules; and
- payment/entitlement capability.

Cross-component fixtures must execute:

```text
Swift/Kotlin input
  -> Rust BN254 proof/PI bytes
  -> relayer JSON
  -> ABI-encoded calldata
  -> contract verification/state/event
  -> RPC receipt/log/state
  -> normalized NotaryStateSnapshot and NotaryReceipt
```

The prover toolchain is deliberately unpinned by this draft, but toolchains
disagree on proof point order and public-input serialization, so the fixture
chain above is a **ship-blocker, not an afterthought**: no client may ship
against this profile until the end-to-end fixtures exist and pin the chosen
toolchain's exact byte encoding.

Fixtures cover all five flavors, every tier, create/read/update or
immutability, membership verification, invalid proof, wrong public-input
order, stale epoch, replay, restricted creation, revert-selector decoding
(including `StaleRevision` versus `PublicInputsMismatch`), out-of-field
identifier rejection, nonce-replacement safety and superseded-hash outcome
queries, reorg-before-finality handling, receipt reconciliation, and unknown
outcome. Canonicalization fixtures for the
operator manifest are shared byte-for-byte between the relayer and any
verifier, following the `onym-moderation` pattern.

## 18. Current implementation gaps

Everything below is unbuilt; this list is the work plan, not a polish list:

- **Circuits**: no BN254 constraint systems, setup, or verifying keys exist;
  the five flavors' predicates must be re-expressed and cross-checked against
  the BLS12-381 circuits with shared logical fixtures.
- **Prover**: the mobile Rust FFI has no BN254 PLONK backend.
- **Contracts**: `onym-contracts` contains no Solidity; the `sep-*` family,
  generated verifiers, custom errors, events, and replay records must be
  written and audited.
- **Relayer**: `onym-relayer` is hardwired to the Stellar CLI (`C…` contract
  IDs, `S…` secrets); it needs an EVM backend (signing, nonce management, gas
  estimation, receipt tracking), `chainId`/`proofSystem`-aware allowlisting,
  a mandatory transaction hash in write responses, and an outcome-query
  endpoint.
- **Operator seat**: no operator manifest exists for the relayer — no signing
  seed handling, canonicalization, `GET /manifest.json`, or boot-time
  key-match check. The Authority implementation in `onym-moderation` is the
  reference.
- **Manifest**: `contracts-manifest.json` has no `chainId`, `proofSystem`,
  `verifier`, code-hash, or profile fields, and is unsigned.
- **Clients**: no EVM read path, receipt reconciliation, finality tracking,
  or circuit-type selection UI; `AnchorBinding` lacks every BNB field.
- **Migration**: the cross-implementation migration protocol (§15) is
  undefined.
- **Conformance**: no BNB fixtures or end-to-end suite.

## 19. Acceptance criteria

The BNB implementation satisfies `UI-Notary.md` when:

1. each deployment is cryptographically bound to chain ID, address, runtime
   code hash, verifier anchors, profile, circuit type, and operator;
2. the circuit type is selectable at group creation from verified manifest
   entries, displayed with its consequences, pinned in the binding, and
   immovable afterward;
3. the relayer serves a signed, byte-frozen operator manifest whose declared
   powers match the contract-enforced reality, and refuses to start on
   key mismatch;
4. every write returns a stable operation ID and EVM transaction hash, and
   unknown outcomes are resolvable by operation ID;
5. submission, inclusion (`status == 1`), and fast finality are distinct
   client-visible states;
6. the client reconciles receipt, event, epoch, and finalized state before
   durable local commit, and treats post-inclusion contradiction as a
   security event;
7. all five flavors have lossless state, operation, error, and conformance
   mappings on BN254;
8. a BLS12-381 proof is rejected by every BN254 deployment and vice versa,
   with distinct errors, in fixtures;
9. payment entitlement is scoped to the operator-manifest hash and never
   enters calldata or state;
10. `maintainState` is declared explicitly `false` in deployment
    capabilities, and clients honor the declaration; and
11. a third-party UI, relayer, RPC provider, and deployment interoperate
    using the published profile and test suite.

## 20. References

1. Technology-neutral Onym notary boundary: [UI-Notary.md](UI-Notary.md)
2. Stellar implementation profile: [UI-Notary-Stellar.md](UI-Notary-Stellar.md)
3. Onym contract family: <https://github.com/onymchat/onym-contracts>
4. Onym transaction relayer: <https://github.com/onymchat/onym-relayer>
5. Onym moderation seat (Authority manifest pattern):
   <https://github.com/onymchat/onym-moderation>
6. BNB Chain documentation: <https://docs.bnbchain.org/>
7. EIP-155 (chain ID): <https://eips.ethereum.org/EIPS/eip-155>
8. EIP-196/197 (BN254 precompiles):
   <https://eips.ethereum.org/EIPS/eip-196>,
   <https://eips.ethereum.org/EIPS/eip-197>
9. BSC fast finality:
   <https://docs.bnbchain.org/bnb-smart-chain/introduction/>
