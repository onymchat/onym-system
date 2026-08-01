# Onym UI ↔ Notary: Stellar/Soroban Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Onym notary boundary onto Stellar
> ledgers, Soroban smart contracts, PLONK authorization evidence, and the
> current Onym HTTP transaction relayer.

This document is a concrete implementation of
[UI-Notary.md](UI-Notary.md). The abstract specification remains authoritative
for UI-facing semantics. This document defines how its objects, operations,
receipts, evidence, finality, errors, and maintenance map to the current
Stellar solution.

The document distinguishes:

- **implemented behavior**, which exists in the present Onym repositories;
- **profile requirements**, which are required for a complete conforming
  Stellar implementation; and
- **gaps**, where current code does not yet satisfy the complete boundary.

## 1. Conformance declaration

| Abstract concept | Stellar/Soroban mapping |
|---|---|
| Canonical system | Stellar network selected by network passphrase |
| Policy engine | One deployed Soroban `sep-*` contract instance |
| Canonical state | Soroban persistent/instance ledger entries |
| State commitment | `BytesN<32>` group commitment |
| Revision | `u64` epoch |
| Authorization evidence | 1601-byte TurboPLONK proof plus ordered 32-byte public inputs |
| Implementation identity | Network, contract ID, Wasm/code hash, profile/release |
| Submission provider | Fee-paying `onym-relayer` HTTP service |
| Read provider | Current relayer proxy; direct Stellar RPC/indexer is the target alternative |
| Submission reference | Stellar transaction hash |
| Acceptance/finality evidence | Successful transaction in a closed Stellar ledger plus resulting state/event |
| Maintenance | Soroban persistent/instance/code TTL extension and restoration behavior |

The implementation profile identifier is:

```text
onym:notary-implementation:stellar-soroban-sep-plonk-v1
```

Each governance flavor has its own logical `NotaryProfile` because its state
and authorization predicate differ:

```text
onym:notary-profile:sep-anarchy-plonk-v1
onym:notary-profile:sep-oneonone-plonk-v1
onym:notary-profile:sep-democracy-plonk-v1
onym:notary-profile:sep-oligarchy-plonk-v1
onym:notary-profile:sep-tyranny-plonk-v1
```

Sharing the Soroban call names does not make the five policies one profile.

## 2. Ownership mapping

- The **policy author** publishes the `sep-*` Rust contract, prover shape,
  verifying keys, fixtures, source revision, and release artifacts in
  `onym-contracts`.
- The **notary deployer** deploys a selected Wasm artifact to a selected Stellar
  network and controls only the operator powers encoded by that contract.
- The **Stellar validator set** establishes canonical ledgers through Stellar
  Consensus Protocol.
- The **transaction-relayer operator** holds a funded Stellar account, selects
  RPC endpoints, simulates and submits invocations, pays network/resource fees,
  and exposes an HTTP API.
- The **RPC or indexer operator** serves recent transactions, events, and ledger
  entries but does not independently define canonical contract state.
- The **group** pins network, governance flavor, contract ID, release/profile,
  and genesis evidence.
- The **UI publisher** presents selection and may broker payment, but is not a
  contract authority.

The same organization can operate the deployment, HTTP relayer, and RPC, but a
client must not treat their combined API response as independent canonical
evidence.

## 3. Physical topology

```text
┌──────────────────────────────────────────────────────────────────────┐
│ iOS / Android                                                        │
│                                                                      │
│ View / flow / interactor                                             │
│        ├────────> Onym identity and group state                      │
│        ├────────> Swift/Kotlin SDK + Rust FFI prover                 │
│        ├────────> SepContractClient / SEPContractClient              │
│        └────────> canonical relayer JSON invocation                  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS POST
                               v
                    ┌────────────────────────┐
                    │ onym-relayer           │
                    │ auth · rate limit      │
                    │ allowlist · validation │
                    │ Stellar fee account    │
                    └───────────┬────────────┘
                                │ stellar contract invoke
                                │ simulate / sign / submit
                                v
                    ┌────────────────────────┐
                    │ Stellar RPC + Core     │
                    │ transaction lifecycle  │
                    └───────────┬────────────┘
                                │ InvokeHostFunction
                                v
                    ┌────────────────────────┐
                    │ sep-* Soroban contract │
                    │ validate PI + PLONK    │
                    │ update persistent state│
                    │ emit contract event    │
                    └───────────┬────────────┘
                                │ ledger close / RPC / indexer
                                v
                         client reconciliation
```

The relayer currently shells out to Stellar CLI. That is an implementation
choice behind the profile; a direct Stellar SDK implementation can replace it
without changing the abstract notary port.

## 4. Deployment identity

### 4.1 Target deployment object

The abstract `NotaryDeployment` maps as follows:

```json
{
  "deploymentVersion": 1,
  "deploymentId": "onym:notary:stellar:<network-hash>:<contract-id>",
  "profileId": "onym:notary-profile:sep-tyranny-plonk-v1",
  "operator": "onym:key:<deployment-operator>",
  "backend": {
    "kind": "onym:notary-implementation:stellar-soroban-sep-plonk-v1",
    "namespace": "stellar:<network-passphrase-hash>",
    "instance": "C...",
    "implementationHash": "<deployed-wasm-hash>"
  },
  "release": "vX.Y.Z",
  "proofSystem": "turbo-plonk-bls12-381-kzg",
  "verifierAnchors": "<content-addressed-vk-anchor-set>",
  "submitEndpoints": ["onym:component:<transaction-relayer>"],
  "readEndpoints": ["onym:component:<stellar-rpc-or-indexer>"],
  "offers": ["<notary-offer-id>"],
  "signature": "<operator-signature>"
}
```

Network identity is not a display label alone. It is bound by the Stellar
network passphrase or a canonical digest of it. `public`, `testnet`, and local
networks with different passphrases are different namespaces even if a UI
gives them similar names.

The contract ID selects one deployed instance. The Wasm hash identifies its
implementation. Both are required to prevent an address, release label, or
manifest entry from standing in for code verification.

### 4.2 Current manifest

The current `contracts-manifest.json` contains historical releases with:

```json
{
  "version": 1,
  "releases": [
    {
      "release": "vX.Y.Z",
      "publishedAt": "<timestamp>",
      "contracts": [
        {
          "network": "testnet",
          "type": "tyranny",
          "id": "C..."
        }
      ]
    }
  ]
}
```

The mobile clients decode known network/type pairs and select a release. The
relayer flattens the cumulative history into an allowlist. This is useful
discovery, but it is not yet the target deployment object: it lacks the signed
profile, Wasm/code hash, network-passphrase binding, verifier anchors,
capabilities, privacy profile, and offers.

## 5. Group binding

The current clients persist an `AnchorBinding`:

```json
{
  "network": "testnet",
  "governanceType": "tyranny",
  "contractId": "C...",
  "release": "vX.Y.Z"
}
```

This already establishes the critical sticky-binding rule: settings changes
select defaults for new groups and do not mutate existing group anchors.

The complete Stellar `GroupNotaryBinding` also needs:

- abstract and Stellar profile versions;
- network-passphrase identity;
- deployed Wasm hash and verifier-anchor set;
- genesis commitment and epoch zero;
- creation transaction hash and ledger sequence;
- contract event or state evidence for creation; and
- declared migration/recovery policy.

An invitation carries enough information to reconstruct and verify the same
binding. A receiver must not resolve “latest contract for this governance
type” in place of the inviter's pinned contract.

## 6. State mapping

Every `sep-*` deployment stores its operator admin and restricted-mode control
in contract instance storage. Group state uses persistent storage keyed by a
32-byte group ID. Most mutable profiles also keep bounded history and
proof-replay markers.

The abstract snapshot maps to:

```json
{
  "snapshotVersion": 1,
  "groupId": "<base64-32-byte-id>",
  "deploymentId": "onym:notary:stellar:<network>:<contract-id>",
  "profileId": "onym:notary-profile:sep-tyranny-plonk-v1",
  "revision": 12,
  "stateCommitment": "<base64-32-byte-field-element>",
  "policyState": {
    "timestamp": 1785580800,
    "tier": 1,
    "active": true,
    "publicValues": "<flavor-specific-fields>"
  },
  "canonicalReference": {
    "network": "stellar:<network-passphrase-hash>",
    "contractId": "C...",
    "ledger": 123456,
    "transactionHash": "<64-hex-hash-or-read-reference>"
  },
  "evidence": "<transaction-meta-event-or-ledger-entry-evidence>"
}
```

The portable minimum is `(commitment, epoch)`. Other current public fields
vary by flavor:

| Flavor | Additional public state |
|---|---|
| Anarchy | tier, active, timestamp, informational `member_count` |
| One-on-one | timestamp; epoch remains zero because no transition exists |
| Democracy | tier, active, occupancy commitment, threshold numerator, timestamp |
| Oligarchy | tier, active, occupancy commitment, admin threshold numerator, timestamp |
| Tyranny | tier, timestamp, separately readable admin public-key commitment |

The client must preserve “absent” versus “false/zero.” Current mobile
`SepCommitmentEntry` models only commitment and epoch as mandatory and a subset
of the remaining fields as optional, so it is not yet a lossless common state
representation for all five profiles.

## 7. Contract family and policy semantics

| Profile | Who can create | Who can transition | Current limits/shape |
|---|---|---|---|
| Anarchy | Relayer-funded caller, subject to deployment restriction | Any member who produces valid membership-based update evidence | Tiers 32/256/2048; member count stored as informational |
| One-on-one | Relayer-funded caller, subject to deployment restriction | Nobody; immutable after creation | Exactly two-party circuit; no update/history entrypoint |
| Democracy | Relayer-funded caller, subject to deployment restriction | Member quorum proven in one PLONK proof | Hidden occupancy commitment; current circuit threshold bound is limited |
| Oligarchy | Relayer-funded caller, subject to deployment restriction | Admin quorum proven in one PLONK proof | Hidden admin/member structure; public stored threshold and occupancy commitment |
| Tyranny | Relayer-funded caller, subject to deployment restriction | Holder of the pinned group-admin secret, proven without revealing it | Admin commitment and group ID are bound into update evidence |

“Relayer-funded caller” means the current HTTP relayer supplies its Stellar
source account and signs the outer transaction. It does not mean that source
account is the group's transition authority. Post-creation authorization comes
from PLONK evidence except where a contract entrypoint explicitly calls Stellar
address authorization.

Every deployment also has an operator admin established by the constructor.
Its `set_restricted_mode` power gates new group creation. It cannot advance or
rewrite existing group state under the current contract code.

## 8. Soroban operation mapping

| Abstract operation | Soroban entrypoint | Availability |
|---|---|---|
| `createState` | `create_group` | Anarchy, one-on-one, democracy, tyranny |
| `createState` | `create_oligarchy_group` | Oligarchy |
| `transitionState` | `update_commitment` | All except one-on-one |
| `verifyStatement` | `verify_membership` | All five |
| `readState` | `get_commitment` | All five |
| `readHistory` | `get_history` | All except one-on-one |
| Flavor read | `get_admin_commitment` | Tyranny only |
| `maintainState` | `bump_group_ttl` | All five |
| Deployment administration | `set_restricted_mode` | All five; not group governance |

The HTTP relayer allowlists contract IDs per network and flavor, verifies the
requested function is supported for that flavor, validates field lengths and
encodings, and invokes Stellar CLI.

`set_restricted_mode` is exposed only when relayer bearer authentication is
configured, because the relayer's Stellar identity signs the administrative
call. This is an operator control plane and must remain separate from ordinary
group operations and user entitlements.

## 9. Authorization evidence mapping

The current PLONK profile uses:

- a 1601-byte proof;
- an ordered vector of 32-byte public inputs;
- per-flavor and, where applicable, per-tier verifying keys baked into Wasm;
- BLS12-381 verification through Soroban host primitives;
- proof replay records for state-changing calls; and
- read-only membership verification that does not consume the proof.

The important public-input bindings are:

| Flavor/operation | Ordered public statement |
|---|---|
| Anarchy create | `[commitment, be32(0)]` |
| Anarchy update | `[c_old, be32(epoch_old), c_new]` |
| One-on-one create | `[commitment, be32(0)]` |
| Democracy create | `[commitment, be32(0), occupancy_initial]` |
| Democracy update | `[c_old, be32(epoch_old), c_new, occupancy_old, occupancy_new, threshold]` |
| Oligarchy create | `[commitment, be32(0), occupancy_initial]` |
| Oligarchy update | `[c_old, be32(epoch_old), c_new, occupancy_old, occupancy_new, admin_threshold]` |
| Tyranny create | `[commitment, be32(0), admin_commitment, group_id_fr]` |
| Tyranny update | `[c_old, be32(epoch_old), c_new, admin_commitment, group_id_fr]` |
| Membership verification | `[current_commitment, be32(current_epoch)]` |

The contract reads prior state and policy values from storage and compares them
to the ordered public inputs before verifying the proof. For update operations,
`c_new` comes from the proof-bound public inputs and the next epoch is derived
as stored epoch plus one. A separate client-supplied new epoch or unbound next
commitment must not be forwarded.

Each public-input schema needs a content-addressed identifier. A bare JSON
array plus contract flavor is the current de facto convention but is too easy
to misorder across client, relayer, prover, and contract releases.

## 10. Current relayer protocol

The mobile client sends:

```json
{
  "network": "testnet",
  "contractID": "C...",
  "contractType": "tyranny",
  "function": "update_commitment",
  "payload": {
    "group_id": "<base64-32-bytes>",
    "proof": "<base64-1601-bytes>",
    "publicInputs": [
      "<base64-32-byte-c-old>",
      "<base64-32-byte-epoch>",
      "<base64-32-byte-c-new>",
      "<base64-32-byte-admin-commitment>",
      "<base64-32-byte-group-id-field>"
    ]
  }
}
```

Byte fields may arrive as base64 or hex at the relayer. Current mobile clients
emit base64. The relayer converts fixed-size values to the hex representation
expected by Stellar CLI and normalizes selected byte fields back to base64 in
read responses.

The top-level request selects network, contract ID, flavor, function, and
payload. The relayer rejects mismatched flavor/function/contract combinations
using a per-network allowlist.

### 10.1 Target operation mapping

Before the current request can be a complete implementation of abstract
`NotaryOperation`, it needs:

- operation/profile/schema versions;
- stable client `operationId` and idempotency semantics;
- complete pinned deployment identity rather than only ID/type/network label;
- explicit expected state at the abstract layer;
- canonical public-statement schema identifier;
- component-scoped entitlement field;
- structured result/error codes; and
- unknown-outcome query support.

The function-specific payload remains the implementation mapping, not the UI's
generic domain type.

## 11. Write lifecycle and receipt

The target lifecycle is:

```text
1. UI reads and verifies the current contract state.
2. Local SDK creates the new commitment and PLONK proof.
3. UI serializes the profile-pinned operation.
4. Relayer validates auth, rate limit, allowlist, function, and payload.
5. Relayer simulates/prepares the Soroban invocation and estimates resources.
6. Relayer signs with its funded Stellar source account.
7. Relayer submits the transaction and returns its transaction hash.
8. Client or relayer polls Stellar RPC `getTransaction`.
9. `SUCCESS` identifies the closed ledger containing the transaction.
10. Client reads contract state or event evidence and confirms expected epoch
    and commitment.
11. Client commits optimistic state locally.
```

Stellar RPC `sendTransaction` means queued/submitted, not successful execution;
the transaction hash must be checked with `getTransaction`. A conforming
receipt therefore includes:

```json
{
  "operationId": "<client-operation-id>",
  "status": "finalized",
  "submissionProvider": "onym:component:<relayer-id>",
  "transactionHash": "<64-hex-hash>",
  "ledger": 123456,
  "contractId": "C...",
  "event": "<group-created-or-commitment-updated-event>",
  "acceptedRevision": 13,
  "acceptedStateCommitment": "<base64-commitment>",
  "resultEvidence": "<XDR-or-content-addressed-evidence>"
}
```

The current relayer write response is only:

```json
{
  "accepted": true,
  "transactionHash": null,
  "message": "<optional-stellar-cli-output>"
}
```

Because the current success path does not populate the transaction hash,
clients cannot implement independent transaction-status reconciliation from
that response. `accepted: true` currently means the relayer's CLI invocation
returned success; it must not be treated as the complete abstract receipt.

## 12. Read lifecycle and evidence

The present relayer invokes read-only functions through Stellar CLI with
`--send no`, parses the output, and returns normalized JSON. The mobile
`ChainStateReading` seam fetches `(commitment, epoch)` for selected flows; a
short-lived cache and bounded retry reduce request bursts.

The target read path must identify:

- network passphrase and contract ID;
- ledger or checkpoint observed;
- contract code/instance identity;
- exact state key and decoded schema;
- state value and revision;
- evidence needed to establish the value against canonical Stellar state; and
- RPC freshness/retention window.

A TLS response from the same company that submitted the write is not
independent evidence. At minimum, the client should compare the returned state
to transaction/event evidence and be able to use another RPC or indexer. High
assurance profiles may require stronger ledger-header or proof verification.

Stellar RPC retains recent transactions and events for a bounded operator-set
window; it is not a permanent history index. Long-term audit requires the
client, notary provider, or an independent indexer to retain the necessary
canonical references and evidence.

## 13. Events and history

Current mutable contracts emit typed events for:

- group creation;
- commitment update; and
- restricted-mode changes.

Events include a group ID topic and profile-specific data such as commitment,
epoch, tier, occupancy commitment, threshold, and timestamp. A conforming
adapter maps them to abstract receipts without treating the ledger timestamp
as a user-authored time.

The contracts also retain bounded profile-specific commitment history where
supported. Contract history and RPC event retention are different:

- contract history is state explicitly retained by the contract and subject to
  its own cap and TTL; and
- RPC history is an operator's recent query window over canonical ledgers.

Neither should be labeled complete history unless its explicit bounds are
satisfied.

## 14. Stellar authorization layers

The solution has three distinct authorization layers:

1. **Group authorization evidence.** PLONK proof and public inputs authorize a
   transition under the selected `sep-*` policy.
2. **Stellar address authorization.** Constructors, creation callers, and
   deployment-administration calls use Soroban address authorization where the
   contract invokes `require_auth()`.
3. **Relayer service access.** The HTTP service may require a host-scoped bearer
   token or future `SeatEntitlement` before it spends resources.

These layers must not be conflated. Possessing the current relayer bearer token
does not authorize a group transition without valid PLONK evidence. A valid
group proof does not authorize `set_restricted_mode`. An App Store purchase is
neither a Soroban signature nor a group proof.

The current app credential is a build/deployment bearer token scoped to the
configured relayer host. It is not yet the per-user, per-seat entitlement
described by the economic model.

## 15. State TTL, archival, and maintenance

Soroban contract code, instances, and contract-data entries have ledger-based
lifetimes. The current family uses:

- instance storage for operator admin, restricted mode, and deployment-level
  counters;
- persistent storage for group state, history, and proof-replay entries; and
- permissionless `bump_group_ttl(group_id)` maintenance for group state.

Persistent and instance entries can become archived when their TTL expires and
require restoration before normal access; exact limits and fees are network
parameters, not constants for the Onym abstract protocol. Temporary state, if
introduced by a future profile, has different deletion semantics and must not
be used where permanent loss violates group correctness.

The Stellar profile must declare:

- which keys each operation reads and writes;
- which keys `bump_group_ttl` extends;
- whether proof-replay markers live as long as the state they protect;
- code and instance lifetime management;
- restoration behavior and payer;
- what the UI sees when state is archived; and
- how monitoring prevents unexpected unavailability.

TTL extension is maintenance, not governance. It cannot change a commitment,
epoch, threshold, authority, or group status.

## 16. Payment and fee mapping

There are three possible paid layers:

- **notary deployment service:** availability, monitoring, upgrades permitted
  by profile, and retained state support;
- **transaction relayer:** simulation, source account, Stellar resource and
  inclusion fees, submission, and status service; and
- **RPC/indexer:** reads, event access, and retained history.

The current transaction relayer pays Stellar fees from its configured account.
The mobile operation does not contain an end-user Stellar secret key. This is a
useful fee-abstraction boundary but makes the relayer a service dependency, not
a validity authority.

Off-chain Apple or other billing follows the abstract `PaymentRequired` and
`SeatEntitlement` flow. Store evidence stays at the billing broker. The relayer
receives a component-scoped entitlement or derived credential.

An alternative profile may make the user pay a Stellar asset or native fee in
the canonical transaction. That changes privacy, signing, simulation, refund,
and authorization semantics and must be declared as another payment channel or
profile capability.

No payment mechanism may bypass PLONK verification, prior-state checks, proof
replay protection, or contract authorization.

## 17. Error mapping

The adapter maps distinct layers rather than returning one free-form message:

| Abstract error | Stellar source |
|---|---|
| `unsupported_profile` | Unknown release/profile/Wasm/verifier anchors |
| `deployment_mismatch` | Wrong network, contract ID, flavor, or code hash |
| `payment_required` | HTTP relayer/notary gateway refusal |
| `auth_required` | Relayer bearer/entitlement or Soroban authorization missing |
| `state_exists` | Contract `GroupAlreadyExists` |
| `state_not_found` | Contract `GroupNotFound` |
| `invalid_evidence` | Contract `InvalidProof` or verifier failure |
| `public_input_mismatch` | Contract `PublicInputsMismatch` |
| `stale_revision` | Stored commitment/epoch differs from public inputs |
| `replay` | Contract `ProofReplay` or duplicate operation mapping |
| `unauthorized` | `AdminOnly`, address authorization, or policy refusal |
| `state_unavailable` | Archived entry, missing RPC window, or unavailable read |
| `submission_failed` | HTTP, CLI, simulation, fee, RPC enqueue, or transaction failure |
| `outcome_unknown` | Lost response or transaction hash not yet resolved |
| `conflicting_state` | Read value contradicts verified transaction/event/binding |

Contract error numbers are implementation details that the Stellar adapter
normalizes with the profile version. Raw CLI stderr and HTTP status remain
diagnostic context, not the stable domain error.

Malformed but well-sized proof bytes can fail through different host or
contract paths. A client must distinguish `valid = false`, contract error,
transaction failure, and unavailable result without treating any failure as
membership success.

## 18. Security and privacy properties

1. Proof witnesses and group secrets remain in the mobile SDK/FFI boundary.
2. The contract receives only profile-declared commitments, proof, public
   inputs, group ID, and public policy values.
3. The relayer can observe IP, time, network, contract, function, group ID,
   proof bytes, public inputs, and payload size.
4. Stellar observers can inspect successful invocation inputs, contract state,
   and events included in public ledgers.
5. A policy claiming hidden membership must disclose every remaining public
   value, including tier, epoch, occupancy/authority commitments, thresholds,
   and group identifiers where applicable.
6. Relayer credentials and payment evidence never become public inputs or
   ledger state.
7. The source account that pays and submits does not become group authority
   merely by appearing in the outer transaction.
8. Verifier keys and Wasm identity are pinned; an unverified “latest” release
   cannot replace an existing binding.
9. A proof or operation is accepted only against the state and policy values it
   cryptographically binds.
10. Client state is durable only after transaction and state reconciliation.

Public-ledger metadata is a property of this implementation, not of the
technology-neutral notary boundary. Another implementation may expose a
different set of metadata and must use a different implementation profile.

## 19. Versioning and conformance

The Stellar profile pins:

- network passphrase identity;
- contract ID and deployed Wasm hash;
- governance flavor and abstract profile version;
- Soroban ABI and contract release;
- proof length, field encoding, public-input order, tier, and verifier anchors;
- relayer request/response version;
- state and event schemas;
- transaction receipt and reconciliation rules;
- TTL and restoration behavior; and
- payment/entitlement capability.

Cross-component fixtures must execute this path:

```text
Swift/Kotlin input
  -> Rust proof/PI bytes
  -> relayer JSON
  -> Soroban ABI values
  -> contract verification/state/event
  -> RPC/relayer response
  -> normalized NotaryStateSnapshot and NotaryReceipt
```

Fixtures cover all five governance flavors, every tier, create/read/update or
immutability, membership verification, invalid proof, wrong public-input
order, stale epoch, replay, restricted creation, TTL, receipt reconciliation,
and unknown outcome.

## 20. Current implementation gaps

The repositories implement a substantial portion of this profile, but the
following gaps prevent full abstract conformance:

- deployment discovery lacks signed profiles, Wasm hashes,
  network-passphrase binding, verifier anchors, privacy declarations, offers,
  and operator signatures;
- `AnchorBinding` lacks profile/version, Wasm hash, genesis transaction/ledger,
  and creation evidence;
- relayer JSON is the de facto wire spec and has no version, operation ID,
  schema ID, entitlement, or outcome-query endpoint;
- write responses currently omit the Stellar transaction hash and therefore
  cannot drive independent `getTransaction` reconciliation;
- `accepted: true` collapses CLI completion, submission, execution, and
  finality into one ambiguous field;
- client read verification primarily trusts the selected HTTP relayer and is
  currently narrow—`ChainStateReading` covers selected tyranny flows rather
  than all governance profiles;
- the common client state type omits flavor-specific fields needed for a
  lossless snapshot;
- mobile and relayer errors rely on HTTP bodies and CLI strings instead of a
  stable profile error taxonomy;
- proof/public-input schema identities are implicit in flavor/function/release;
- the relayer holds one configured source identity and optional bearer-token
  set rather than component-scoped user entitlements;
- `PaymentRequired`, purchase validation, entitlement issuance, quota,
  renewal, refund, and revocation are not implemented;
- long-term transaction/event evidence and independent read-provider selection
  are not implemented as a complete audit path;
- code/instance TTL monitoring, archived-state recovery UX, and payment for
  restoration are not expressed through the client boundary;
- migration between contract deployments or notary implementations is not
  specified; and
- cross-platform tests mirror many shapes but do not yet run one complete
  abstract-notary conformance suite.

## 21. Acceptance criteria

The Stellar implementation satisfies `UI-Notary.md` when:

1. each deployment is cryptographically bound to network, contract ID, Wasm,
   verifier anchors, profile, and operator;
2. every group persists genesis and binding evidence, not only a release label
   and contract ID;
3. the UI can switch compatible transaction relayers and RPC providers without
   changing the contract binding;
4. every write returns a stable operation ID and Stellar transaction hash;
5. `sendTransaction`/submission is distinct from successful closed-ledger
   inclusion;
6. the client reconciles successful transaction, contract event/state, epoch,
   and commitment before durable local commit;
7. all five governance profiles have lossless state, operation, error, and
   conformance mappings;
8. proof/public-input order is identified by a content-addressed schema;
9. payment entitlement is scoped to the selected service and never enters
   group evidence or the ledger;
10. TTL/archive/restore behavior is visible and cannot silently look like
    group deletion;
11. operator restricted mode can gate creation but cannot transition existing
    group state; and
12. a third-party UI, relayer, RPC provider, and deployment can interoperate
    using the published profile and test suite.

## 22. References

1. Technology-neutral Onym notary boundary:
   [UI-Notary.md](UI-Notary.md)
2. Onym contract family: <https://github.com/onymchat/onym-contracts>
3. Onym transaction relayer: <https://github.com/onymchat/onym-relayer>
4. Onym iOS client: <https://github.com/onymchat/onym-ios>
5. Onym Android client: <https://github.com/onymchat/onym-android>
6. Stellar, “Smart Contracts”:
   <https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/contracts>
7. Stellar, “Transaction Lifecycle”:
   <https://developers.stellar.org/docs/learn/fundamentals/transactions/transaction-lifecycle>
8. Stellar RPC, `sendTransaction`:
   <https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction>
9. Stellar RPC, `getTransaction`:
   <https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransaction>
10. Stellar, “State Archival”:
    <https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival>
11. Stellar, “Smart contract authorization”:
    <https://developers.stellar.org/docs/build/guides/auth/contract-authorization>
