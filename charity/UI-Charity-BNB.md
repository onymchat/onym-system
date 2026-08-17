---
status: draft
proposed: Claude & @rinat-enikeev
date: 15.08.2026
---

# Onym Charity ↔ BNB Chain (EVM) Implementation Profile

**Implementation profile draft 0.1 — 15 August 2026**

> This profile maps the notary and eligibility bindings of the
> technology-neutral Onym charity boundary onto BNB Smart Chain: one
> non-upgradeable Solidity anchor contract per charity deployment, PLONK
> eligibility evidence over BN254, and the Onym relayer operating as the
> declared submitting operator. It deliberately maps **no** financial binding:
> custody, settlement, and disbursement stay with the financial provider under
> its own legal authority.

This document is a concrete implementation profile for
[Charity.md](Charity.md). The abstract boundary remains authoritative for
object meaning and trust semantics; [UI-Charity.md](UI-Charity.md) remains
authoritative for what the user application shows and refuses. The
The Stellar/Soroban and Cardano charity bindings are separate, unwritten
sibling profiles; both verify over BLS12-381, and neither gates this one.
UI-Charity.md §8.3 states, for Soroban, that "uses X" is an implementation
choice and not evidence of conformance until the implementation profile
exists and passes conformance tests; this document adopts the same
principle for BNB — the attribution is to the principle, since §8.3
itself addresses only the Soroban case.

The document distinguishes:

- **accepted decisions**, settled for this profile;
- **profile requirements** (MUST / MUST NOT / SHOULD / MAY, per RFC 2119
  usage), required for a complete conforming implementation;
- **open questions**, explicitly undecided, each with its decision criteria;
  and
- **gaps**, where no code exists. As of this draft the entire charity path is
  unimplemented on every chain: `onym-contracts` contains no charity
  contracts, no charity circuits exist, and `onym-relayer` has no charity
  operations.

## 1. Scope: where the notary boundary ends

This profile implements, on an EVM rail, exactly the notary uses that
UI-Charity.md §8.1 scopes the notary port to:

1. campaign status and revision commitments;
2. donation and disbursement receipt commitments;
3. aggregate fund-flow state commitments;
4. nullifier uniqueness within a campaign and epoch;
5. inspectable, authorized policy and status changes; and
6. public audit/report commitments.

One mapping in item 5 is indirect and worth naming: UI-Charity.md §8.1
speaks of policy *or destination* changes, and this contract has no
dedicated destination record. A destination change is a material campaign
update under Charity.md §6.3, so it MUST surface as a new campaign
revision, whose commitment `advanceCampaignRevision` anchors — that anchor
is what makes the destination change inspectable here.

It additionally implements one `eligibilityBindings` entry: verification of
eligibility presentations under PLONK/BN254, atomically coupled to nullifier
consumption (§7).

**Out of scope, deliberately.** The contract holds no funds, mints no assets,
and executes no transfers. It MUST NOT be extended with payable entrypoints,
token balances, escrow, or disbursement logic under this profile ID. The
financial provider quotes, settles, refunds, and disburses under its own
legal and operational authority (Charity.md §1); what this contract records
about a settlement is a **commitment to a signed off-chain receipt**, which
proves the operator anchored those exact bytes at that time — never that
money moved, and never that aid arrived. A future on-chain settlement rail
(e.g. a stablecoin disbursement binding) is a separate `financialBindings`
profile with its own finality, refund, and reversal mapping and a different
profile ID; nothing in this document defines it.

Two write authorities exist, and the contract keeps them distinct:

- **Operator-attested writes** (campaign lifecycle, receipt and report
  anchors) are gated on the operator admin address. They are tamper-evident
  operator statements: the chain proves *who said it and when*, not that it
  is true.
- **Proof-authorized writes** (aid-claim anchoring) are sender-agnostic. Any
  account may submit them; validity comes from the eligibility proof and the
  contract's own state, never from `msg.sender`.

## 2. Conformance declaration

| Abstract concept (Charity.md / UI-Charity.md) | BNB/EVM mapping |
|---|---|
| Notary binding (`CharityDeployment.notaryBindings[]`) | One deployed non-upgradeable `cha-anchor` contract instance |
| Eligibility binding (`CharityDeployment.eligibilityBindings[]`) | PLONK/BN254 verification inside the same instance |
| Canonical system | BNB Smart Chain network selected by EIP-155 chain ID |
| Campaign revision commitment | `bytes32` keccak-256 digest of the canonical signed campaign record |
| Receipt / report commitment | `bytes32` keccak-256 digest of the canonical signed off-chain object |
| Claim reference | `bytes32` keccak-256 digest of the canonical authorized `AidClaim` |
| Scoped nullifier | BN254 field element, campaign- and epoch-scoped (§6) |
| Recipient commitment | `bytes32` randomized, claim-scoped commitment (§8) |
| Implementation identity | Chain ID + contract address + deployed runtime code hash + profile/release |
| Submission provider | Gas-paying `onym-relayer` HTTP service (EVM backend) |
| Read provider | BNB JSON-RPC / indexer; relayer proxy permitted but never canonical |
| Submission reference | EVM transaction hash (provisional) + stable operation ID |
| Finality | BSC fast-finality checkpoint (`finalized` block tag) |
| Maintenance | None; EVM state persists without rent |
| Campaign machine (Charity.md §8.1) | `registerCampaign` = draft→active; `setCampaignStatus` = the remaining edges (§4) |
| Aid-claim machine (Charity.md §8.3) | `prepared`/`submitted`/`eligibility-verified` collapse into the atomic `anchorAidClaim` write, whose anchor is the on-chain evidence of `eligibility-verified`; `approved` is an **off-chain operator state** with no contract record — its evidence is the operator's signed decision leading to the disbursement receipt; `disbursed` = `DisbursementAnchored`. The two anchors are what lets a UI show approval and disbursement as separate states (UI-Charity.md §5.6) |

Profile identifiers:

```text
onym:charity-implementation:bnb-evm-cha-plonk-bn254-v1
onym:charity-eligibility:membership-set-plonk-bn254-v1
```

The first identifies this notary/eligibility binding; the second identifies
the initial eligibility predicate family (§9).

### 2.1 Canonical bytes and digests

Charity.md §6 requires deterministic canonicalization with a stable digest
and assigns the concrete scheme to the profile (Charity.md §5.1), and its
§15 requires canonicalization and signature test vectors. This profile
pins both:

- **Canonical bytes** of a boundary object are its RFC 8785 (JCS)
  serialization: UTF-8, lexicographically key-sorted members, no
  insignificant whitespace, JCS number and string canonicalization. This
  is the same canonicalization family the deployed operator manifest
  already signs under (signature-field-dropped, key-sorted compact JSON —
  verifiable today against the served bytes at
  `relayer.onym.app/manifest.json`).
- **Signing input** for a signed object is
  `dsTag ‖ 0x00 ‖ JCS(object with its signature member structurally
  removed)`, where `dsTag` is the object's Charity.md §6 domain-separation
  tag.
- **Anchor digests** (`revisionCommitment`, `receiptDigest`,
  `claimDigest`, `disbursementReceiptDigest`, `periodDigest`) are
  `keccak256("onym:charity:bnb:anchor:v1" ‖ 0x00 ‖ JCS(object))`, where
  the object **includes** its signature member(s): the anchor attests the
  signed artifact, so two objects differing only in signature MUST digest
  differently. Digest-over-signed and sign-over-unsigned are deliberately
  different serializations of the same object, and the fixtures pin both.
- Unknown critical fields fail closed at schema validation, **before**
  digesting — a digest of an object the implementation would refuse is
  never computed, so "anchored" implies "schema-valid at anchoring time".

Without this section, two conforming implementations could compute
different `claimDigest`s for the same `AidClaim` and §16's third-party
interoperability criterion would be unachievable; the §13 canonicalization
fixtures are the proof that they cannot. The `-bn254-` segment is the
circuit-type discriminator and is load-bearing: a BLS12-381 eligibility proof
is not valid evidence under this profile, and a BN254 proof is not valid
evidence under any BLS12-381 charity profile. Fixtures MUST prove both
rejections (§13, `neg-cross-curve-*`).

Curve separation is necessary but never sufficient, and it does no work at all
between two sibling profiles that share a curve. The planned Stellar/Soroban
and Cardano bindings both verify over BLS12-381, so nothing distinguishes them
from each other by curve; separation there rests entirely on the statement tag
and the profile ID. Every profile in this family MUST therefore treat
statement-tag domain separation (§13, `neg-foreign-statement`) as load-bearing
in its own right, not as a redundant second check behind the curve.

## 3. Deployment identity and hardening

Restated here in full, not referenced, because every rule is normative for
this contract too:

1. **Identity is three-part.** A deployment is identified by EIP-155 chain
   ID, contract address, and the keccak-256 hash of the deployed runtime
   bytecode. All three MUST appear in the `CharityDeployment.notaryBindings`
   entry and all three MUST be verified by the client before first use.
   Network identity is the chain ID, never a display name. This profile is
   scoped to BSC mainnet (56) and BSC testnet (97); opBNB is a distinct
   namespace with L2 finality semantics and is **not covered** — a
   deployment there requires its own profile.
2. **The verifier and admin are in the bytecode.** The eligibility verifier
   address and the operator admin address are Solidity `immutable` values,
   embedded in the deployed runtime bytecode — never constructor-set
   storage. This is what makes the runtime-code-hash pin actually cover
   which verifier runs and who holds operator powers. The contract exposes
   `getVerifier()` and `getOperatorAdmin()` views, and client deployment
   verification MUST compare both against the operator manifest before
   first use.
3. **Proxies are prohibited.** Upgradeable proxies, `delegatecall`-based
   dispatch, and metamorphic deployment patterns are prohibited under this
   profile ID. A profile that permits upgrade must declare the upgrade
   power in the operator manifest and take a different implementation ID.
4. **Verifier contracts are generated, not hand-written.** Eligibility
   verifiers are toolchain-generated per predicate family, deployed
   immutably, and referenced by address plus code hash. Verifying keys are
   content-addressed in the deployment's `verifierAnchors`.

## 4. Contract interface

One contract instance (`cha-anchor`) per charity deployment.

Typing convention, applied uniformly: values that are **BN254 field
elements** (`campaignId`, `nullifier`, `policyRoot`) are `uint256`, with
the same in-range check (§5) at their entry point; **opaque 32-byte
digests and commitments** (`revisionCommitment`, `policyDigest`,
`receiptDigest`, `claimDigest`, `recipientCommitment`,
`disbursementReceiptDigest`, `periodDigest`, `sourceCommitment`) are
`bytes32` and carry no range constraint. Interface, normative for a
conforming implementation:

```solidity
interface ICharityAnchor {
    // ---- operator-attested writes: msg.sender must equal getOperatorAdmin() ----

    /// Register a campaign at revision 1. `campaignId` MUST be a BN254
    /// field element (§5). `epochStart`/`epochSeconds` fix the claim-window
    /// schedule for §6; `epochSeconds` MUST be nonzero
    /// (`InvalidEpochSchedule` otherwise), and `epochStart` MAY lie in the
    /// future — claims before it revert `CampaignNotStarted`. Registration
    /// IS the abstract machine's draft→active edge: `draft` exists only
    /// off-chain as the operator's unsigned working state, and a registered
    /// campaign is `active` at revision 1 from this call onward.
    function registerCampaign(
        uint256 campaignId,
        bytes32 revisionCommitment,
        uint64  epochStart,
        uint32  epochSeconds
    ) external;

    /// Advance the campaign to `newRevision`. Revisions MUST increase by
    /// exactly one; the commitment is the digest of the new signed record.
    /// Status-gated: permitted while active or paused (pausing to amend
    /// terms is the normal workflow); reverts `CampaignNotActive` on a
    /// closed or revoked campaign, whose record is frozen.
    function advanceCampaignRevision(
        uint256 campaignId,
        uint32  newRevision,
        bytes32 revisionCommitment
    ) external;

    /// Status codes cover the on-chain states of Charity.md §8.1:
    /// 0 = active, 1 = paused, 2 = closed, 3 = revoked. The machine's
    /// `draft` state has no code — see registerCampaign. An illegal
    /// transition (any exit from closed or revoked, or a `status` byte
    /// above 3) reverts `InvalidStatusTransition`.
    function setCampaignStatus(uint256 campaignId, uint8 status) external;

    /// Bind an eligibility policy (by digest of its canonical bytes) and its
    /// family-specific public parameter (§9; for membership-set-v1, the
    /// issuer set root). `policyRoot` feeds the public-input vector directly
    /// from storage, so it MUST be a BN254 field element and the contract
    /// MUST reject out-of-range roots with `ValueNotInField` here — an
    /// unchecked root would make every proof against the policy fail
    /// opaquely as `InvalidProof`.
    function registerEligibilityPolicy(
        uint256 campaignId,
        bytes32 policyDigest,
        uint256 policyRoot
    ) external;

    /// Anchor the digest of a finalized, signed DonationReceipt. Keyed by
    /// `receiptDigest`: re-anchoring the same digest with the same
    /// `campaignId` and `campaignRevision` is an idempotent no-op;
    /// re-anchoring it with either differing is `AnchorConflict` (a
    /// donation-anchor conflict is a metadata conflict under the digest
    /// key — the digest itself cannot collide with a different value,
    /// because it IS the key).
    function anchorDonationReceipt(
        uint256 campaignId,
        uint32  campaignRevision,
        bytes32 receiptDigest
    ) external;

    /// Anchor the digest of a signed AidDisbursementReceipt against a
    /// previously anchored claim. Deliberately EXEMPT from the campaign
    /// status gate: aid is routinely delivered after a campaign pauses or
    /// closes, the claim it records was authorized while the campaign was
    /// active, and refusing the anchor would truncate the audit trail
    /// exactly when scrutiny matters most (including on revoked campaigns,
    /// where the anchored evidence of what was disbursed is the point).
    /// The only preconditions are an anchored claim and the AnchorConflict
    /// rules.
    function anchorDisbursement(
        bytes32 claimDigest,
        bytes32 disbursementReceiptDigest
    ) external;

    /// Anchor a fund-flow report's source commitment for a period. Keyed by
    /// (campaignId, periodDigest); a differing sourceCommitment under an
    /// anchored key is `AnchorConflict`.
    function anchorFundFlowReport(
        uint256 campaignId,
        bytes32 periodDigest,
        bytes32 sourceCommitment
    ) external;

    /// Deployment administration; never campaign governance. Restricted
    /// mode gates EXACTLY ONE entrypoint: anchorAidClaim, which reverts
    /// `RestrictedMode` while enabled. Operator-attested writes and all
    /// views are unaffected — the audit trail keeps recording during an
    /// emergency stop. The power is equivalent in authority to pausing
    /// every campaign at once (a power the admin already holds via
    /// setCampaignStatus), packaged as one auditable switch; it is not a
    /// new or selective censorship power, and it MUST be declared in the
    /// operator manifest (§12). Ordering: the stop gates the ENTRYPOINT,
    /// not the pipeline — it precedes even the §7 idempotence precheck, so
    /// a byte-identical resubmission during a stop also reverts
    /// `RestrictedMode`. Reconciliation of prior submissions during a stop
    /// uses reads (getClaimAnchor), which are unaffected.
    function setRestrictedMode(bool enabled) external;

    // ---- proof-authorized write: sender-agnostic ----

    /// Verify an eligibility presentation and atomically consume its
    /// nullifier while anchoring the claim. The contract derives the full
    /// public-input vector itself (§10); the caller supplies only the values
    /// below plus the proof. Idempotence precheck, first among state
    /// checks (only the restricted-mode entrypoint gate precedes it — see
    /// setRestrictedMode): if `claimDigest` is already anchored and every supplied field
    /// matches the stored anchor byte-for-byte, return as a success no-op
    /// (the stored anchor was proof-authorized when written; re-verification
    /// buys nothing); if anchored with any differing field, revert
    /// `AnchorConflict`. Only an unanchored `claimDigest` proceeds to the
    /// status/revision/epoch/nullifier/proof pipeline.
    function anchorAidClaim(
        uint256 campaignId,
        uint32  campaignRevision,
        bytes32 policyDigest,
        uint64  epochIndex,
        uint256 nullifier,
        bytes32 claimDigest,
        bytes32 recipientCommitment,
        bytes   calldata proof
    ) external;

    // ---- views ----

    function getCampaign(uint256 campaignId) external view returns (
        uint32  revision,
        bytes32 revisionCommitment,
        uint8   status,
        uint64  epochStart,
        uint32  epochSeconds
    );
    function currentEpoch(uint256 campaignId) external view returns (uint64);
    function isNullifierUsed(
        uint256 campaignId, uint64 epochIndex, uint256 nullifier
    ) external view returns (bool);
    /// `registeredAt == 0` means unregistered. This is the pre-build read
    /// clients use to obtain the registered root, and the pre-use
    /// verification hook §16 item 1 presumes.
    function getEligibilityPolicy(uint256 campaignId, bytes32 policyDigest)
        external view returns (uint256 policyRoot, uint64 registeredAt);
    /// The claim anchor stores EVERY field of the anchoring call (except
    /// the proof bytes), so the §7 idempotence precheck's byte-for-byte
    /// comparison over all supplied fields is implementable from storage.
    function getClaimAnchor(bytes32 claimDigest) external view returns (
        uint256 campaignId,
        uint32  campaignRevision,
        bytes32 policyDigest,
        uint64  epochIndex,
        uint256 nullifier,
        bytes32 recipientCommitment,
        bytes32 disbursementReceiptDigest   // zero until anchored
    );
    function getDonationAnchor(bytes32 receiptDigest)
        external view returns (uint256 campaignId, uint32 campaignRevision, uint64 anchoredAt);
    function getFundFlowAnchor(uint256 campaignId, bytes32 periodDigest)
        external view returns (bytes32 sourceCommitment, uint64 anchoredAt);
    function getVerifier() external view returns (address);
    function getOperatorAdmin() external view returns (address);
    function isRestricted() external view returns (bool);
}
```

Events, all with the campaign or claim key as an indexed topic:

```solidity
event CampaignRegistered(uint256 indexed campaignId, bytes32 revisionCommitment, uint64 epochStart, uint32 epochSeconds);
event CampaignRevisionAdvanced(uint256 indexed campaignId, uint32 revision, bytes32 revisionCommitment);
event CampaignStatusChanged(uint256 indexed campaignId, uint8 status);
event EligibilityPolicyRegistered(uint256 indexed campaignId, bytes32 policyDigest, uint256 policyRoot);
event DonationReceiptAnchored(uint256 indexed campaignId, uint32 campaignRevision, bytes32 receiptDigest);
event AidClaimAnchored(uint256 indexed campaignId, uint32 campaignRevision, bytes32 indexed claimDigest, uint64 epochIndex, uint256 nullifier, bytes32 recipientCommitment);
event DisbursementAnchored(bytes32 indexed claimDigest, bytes32 disbursementReceiptDigest);
event RestrictedModeChanged(bool enabled);
```

Block timestamps in events and `anchoredAt` fields are consensus metadata,
never user-authored time.

Every state field and event parameter is a fixed-width word. The interface
has **no `string` parameter, no variable-length payload except `proof`**,
and the proof bytes are consumed by the verifier, never stored. This is the
contract-shape half of the zero-PII invariant; the fixture half is §13.

### 4.1 Custom errors and retry semantics

The full error set, each with its selector's normative retry class:

| Solidity error | Retry class | Meaning |
|---|---|---|
| `CampaignExists(uint256 campaignId)` | refuse-as-defect | Operator tooling attempted a duplicate registration. Not retryable; fix the caller. |
| `CampaignNotFound(uint256 campaignId)` | refuse-as-defect | The pinned deployment has no such campaign. A client holding a signed campaign that anchors nowhere treats this as `DEPLOYMENT_INVALID`, not a retry. |
| `CampaignNotActive(uint256 campaignId, uint8 status)` | terminal for this campaign state | A *new claim* (`anchorAidClaim`) or policy registration against a paused, closed, or revoked campaign; also `advanceCampaignRevision` against a closed or revoked one (a frozen record — advancing stays legal while paused, since pausing to amend terms is the normal workflow). Maps to `CAMPAIGN_NOT_ACTIVE`; the UI blocks new action and preserves history. Paused MAY become active again; closed/revoked never do. The gate scopes to new authorizations only: receipt, disbursement, and report anchors record already-authorized operations and are exempt, so closing a campaign can never truncate its audit trail. |
| `InvalidStatusTransition(uint8 from, uint8 to)` | refuse-as-defect | `setCampaignStatus` attempting an exit from closed or revoked, or a `to` byte above 3. Operator tooling bug; never retryable. |
| `InvalidEpochSchedule(uint64 epochStart, uint32 epochSeconds)` | refuse-as-defect | `registerCampaign` with `epochSeconds == 0`. Rejected at registration so `currentEpoch` is total for every registered campaign — division by zero is unreachable by construction. |
| `CampaignNotStarted(uint256 campaignId, uint64 epochStart)` | retry-after-start | A claim (or `currentEpoch` call) before the registered `epochStart`. Pre-registration of future campaigns is legal; claiming against one is not yet. The client surfaces the start time and retries no earlier. |
| `RevisionNotSequential(uint32 expected, uint32 supplied)` | refuse-as-defect | Operator attempted a revision skip or rewind. |
| `StaleCampaignRevision(uint32 current, uint32 supplied)` | refresh-and-rebuild / refuse-as-defect | One selector, two decidable cases, split client-side from the carried values. `supplied < current`: the presentation was built against a superseded revision — the client re-resolves the campaign, re-obtains user consent for the new revision (UI-Charity.md §5.6 requires the fresh decision; Charity.md §6.7 binds the presentation to the exact revision), rebuilds, and resubmits. `supplied > current`: a revision from the future is a generator defect — rebuilding cannot help and MUST NOT be attempted in a retry loop. |
| `EpochNotCurrent(uint64 current, uint64 supplied)` | refresh-and-rebuild | The claim window rolled over between preparation and inclusion. Rebuild against the current epoch — which also derives a new nullifier, so the retry cannot collide with the stale attempt. |
| `UnknownPolicy(uint256 campaignId, bytes32 policyDigest)` | refuse-as-defect | The presentation references a policy this campaign never registered. |
| `ValueNotInField(uint8 argIndex)` | refuse-as-defect | A value that must be a BN254 field element (§5) is out of range. `argIndex` is the **zero-based position of the offending argument in the failing external function's own parameter list** (e.g. `campaignId` in `anchorAidClaim` is 0; `policyRoot` in `registerEligibilityPolicy` is 2) — per-function, not a global registry, so fixtures and clients decode it from the ABI they already hold. A generator bug in the caller, never a transient condition. |
| `NullifierUsed(uint256 nullifier)` | terminal scoped refusal | The entitlement was already claimed in this campaign and epoch **by a different claim**. Maps to `NULLIFIER_USED`: the UI shows a scoped duplicate refusal and MUST NOT expose a person identifier or retry. Replay protection on the claim path is two-layered: a byte-identical resubmission of an already-anchored claim short-circuits as an idempotent no-op at the `claimDigest` precheck (§4, §7) and never reaches this check; a *distinct* claim reusing the nullifier lands here. There is deliberately no separate proof-replay record — between the precheck and the nullifier, both replay shapes are covered. |
| `InvalidProof()` | refuse-as-defect | The verifier rejected the proof against the contract-derived public inputs. Maps to `PROOF_INVALID`; diagnostics stay private (UI-Charity.md §13). |
| `AnchorConflict(bytes32 key, bytes32 stored, bytes32 supplied)` | security event | A value differing from the stored one was submitted under an already-anchored key. Three shapes, one selector: a different disbursement digest under an anchored `claimDigest`; a claim resubmission differing in any stored field under its `claimDigest` (`stored`/`supplied` then carry the digest of the stored versus supplied field tuple); and a donation or fund-flow *metadata* conflict — same digest key, different `campaignId`/`campaignRevision` or `sourceCommitment` (the donation digest itself cannot conflict, because it is the key). Never retried, never overwritten; the client records evidence and raises the incident path. Re-anchoring identical values is an idempotent success, not an error. |
| `ClaimNotAnchored(bytes32 claimDigest)` | refuse-as-defect | Disbursement anchor for a claim this contract never saw. |
| `OperatorOnly(address sender)` | refuse-as-defect | Operator-attested write from a non-admin sender. |
| `RestrictedMode()` | retry-after-reopen | `anchorAidClaim` — and only `anchorAidClaim` — while the deployment's emergency stop is enabled (§4); the gate precedes even the idempotence precheck, and operator-attested writes and views are unaffected. This is Charity.md §14's explicit, authenticated, auditable **emergency pause**, surfaced as a deployment-wide pause — no client action clears it; the client waits for `RestrictedModeChanged(false)` and reconciles prior submissions via reads meanwhile. It is NOT a payment or compliance gate: `PAYMENT_REQUIRED`/`COMPLIANCE_REQUIRED` are relayer-layer refusals issued before submission under the manifest's declared offers, and never map to this selector. |

`StaleCampaignRevision` and `EpochNotCurrent` versus `InvalidProof` is the
charity rendering of the notary profile's `StaleRevision` versus
`PublicInputsMismatch` requirement: the conditions with *different retry
guidance* MUST be distinct selectors, decidable without re-proving. Because
this contract derives its own public-input vector (§10), the notary's
"misordered statement" failure mode cannot arise here by construction, and
there is intentionally no `PublicInputsMismatch` selector; each bindable
field has its own named check instead.

### 4.2 Abstract error mapping

| Charity.md §12 code | Contract / transport source |
|---|---|
| `DEPLOYMENT_INVALID` | Identity-triple mismatch, `getVerifier()`/`getOperatorAdmin()` vs manifest mismatch, `CampaignNotFound` for a signed campaign |
| `CAMPAIGN_NOT_ACTIVE` | `CampaignNotActive` |
| `TERMS_CHANGED` | `StaleCampaignRevision` (after re-resolve shows changed terms) |
| `PROOF_INVALID` | `InvalidProof` |
| `NULLIFIER_USED` | `NullifierUsed` |
| `PAYMENT_REQUIRED` / `COMPLIANCE_REQUIRED` | Relayer-layer refusal before submission, under the manifest's declared offers — never the contract's `RestrictedMode`, which is the Charity.md §14 emergency pause |
| `SUBMISSION_UNKNOWN` | Transaction hash unresolvable; reconcile by operation ID (§11) |
| `FINALITY_PENDING` | Receipt included but block not yet at the `finalized` checkpoint |
| `AUTHORIZATION_INVALID` | `OperatorOnly`; also local vault refusal before submission |
| `PROFILE_UNSUPPORTED` | Unknown profile ID, proof system, or verifier anchors |

Transport-layer failures (RPC outage, gas estimation, nonce, mempool) map to
`SUBMISSION_UNKNOWN`/`FINALITY_PENDING` and are never presented as campaign
or proof failures.

### 4.3 Canonical wire-operation mapping

Charity.md §7 defines ten canonical wire operations. This binding's
surface for each — including the ones it deliberately has no entrypoint
for:

| Charity.md §7 operation | This profile's surface |
|---|---|
| `resolve-campaign` | Off-chain resolution of the signed campaign record, verified against `getCampaign` (status, revision) and the anchored `revisionCommitment` |
| `quote-donation` | Financial provider; **no contract surface** (§1 scope) |
| `prepare-donation` | Financial provider / client; no contract surface |
| `submit-donation` | Financial provider; no contract surface — only the finalized receipt's digest reaches `anchorDonationReceipt` |
| `read-donation` | Financial provider evidence, cross-checkable against `getDonationAnchor` / `DonationReceiptAnchored` once anchored |
| `request-refund` | Financial provider; no contract surface. A refund/reversal changes report arithmetic (Charity.md §10), never an anchored digest |
| `present-eligibility` | Local proof construction; its successful outcome is the `anchorAidClaim` write (§7) |
| `claim-aid` | `anchorAidClaim` — atomic with `present-eligibility`'s on-chain half |
| `read-aid-claim` | `getClaimAnchor` + `AidClaimAnchored`/`DisbursementAnchored` events, alongside the operator's signed receipts |
| `read-fund-flow` | `getFundFlowAnchor` + the signed off-chain report whose `sourceCommitment` it anchors |

The absent rows are the scope boundary of §1 restated operation by
operation: value movement has no entrypoint here by design.

## 5. Client-chosen 32-byte values: encoding and domain separation

The BN254 scalar field modulus is

```text
r = 21888242871839275222246405745257275088548364400416034343698204186575808495617
```

and a 32-byte word is not automatically a field element. Modular reduction of
client-supplied words is **forbidden everywhere** in this profile: reduction
is non-injective over 32 bytes, so two distinct 32-byte values could share a
proof-bound field element, letting evidence bound to one authorize a record
under the other. Two encoding rules replace it:

1. **Freely chosen identifiers are drawn in-field.**
   `campaignId` (operator-drawn) and any other freely random identifier MUST
   be generated by rejection sampling: draw 32 uniform bytes, interpret as a
   big-endian integer, redraw while `>= r`. The contract MUST reject
   out-of-range values with `ValueNotInField` at the entrypoint —
   registration for `campaignId`, claim anchoring for `nullifier`, policy
   registration for `policyRoot` (accumulator roots are field elements by
   construction, but the contract checks anyway: an unchecked root would
   surface later as opaque `InvalidProof` failures for every honest prover)
   — so a non-conforming generator fails closed rather than colliding.
2. **Digests are limb-split, never reduced or ground.**
   keccak-256 digests of canonical objects (`policyDigest`, `claimDigest`,
   `recipientCommitment` when it enters the circuit) are not freely
   re-drawable — their preimages are meaningful signed bytes — so they enter
   the public-input vector as **two 128-bit big-endian limbs**
   (`hi = digest[0..16]`, `lo = digest[16..32]`), each trivially below `r`.
   The split is injective, needs no grinding, and the contract performs it
   itself in Solidity when deriving public inputs (§10), so no caller ever
   supplies a "pre-encoded" digest.

Domain separation: every derived value carries an ASCII tag hashed into its
derivation. The tags of this profile, fixed and fixture-pinned:

```text
onym:charity:bnb:nullifier:v1
onym:charity:bnb:recipient-commitment:v1
onym:charity:bnb:eligibility-statement:v1
```

A tag change is a profile change. Circuits bind the statement tag as a
constant, so a proof generated for any other statement family — including a
notary group-transition proof — cannot verify here even if lengths match.

## 6. Nullifier derivation and scoping

The nullifier is computed **in-circuit**:

```text
nullifier = H(T_n, credentialSecret, campaignId, epochIndex)
```

where `H` is the circuit-native hash over BN254 (Poseidon; the exact
instance parameters are pinned by the conformance fixtures, §13), `T_n` is
the field constant derived from `onym:charity:bnb:nullifier:v1`,
`credentialSecret` is the private witness bound to the beneficiary's
eligibility credential, `campaignId` is the in-field campaign identifier,
and `epochIndex` is the claim window computed from the campaign's registered
schedule:

```text
epochIndex = floor((blockTimestamp - epochStart) / epochSeconds)
```

defined only for `blockTimestamp >= epochStart` and `epochSeconds > 0`.
Both preconditions are contract-enforced rather than assumed:
`registerCampaign` rejects a zero `epochSeconds` with
`InvalidEpochSchedule`, so the division is total for every registered
campaign, and a claim (or `currentEpoch` call) before `epochStart` reverts
`CampaignNotStarted` — a campaign MAY be registered ahead of its start,
but nothing can be claimed against it until the schedule begins.

The contract computes `currentEpoch(campaignId)` from consensus time and
requires `epochIndex == currentEpoch` at claim anchoring, else
`EpochNotCurrent` (grace behavior is an open question, §14.1).

**Why the scoping holds — and what it rests on.** The derivation gives the
nullifier exactly the properties Charity.md §6.7 and §13.8 require:

- *One claim per campaign per epoch*: for fixed `(credentialSecret,
  campaignId, epochIndex)` the nullifier is deterministic, so a second
  presentation from the same credential in the same scope reproduces it and
  reverts with `NullifierUsed`.
- *Stable across campaign revisions*: `campaignRevision` is deliberately
  **not** an input, so a policy or campaign update cannot mint a fresh
  nullifier and enable a second claim in the same window.
- *Not a cross-campaign identifier*: nullifiers for different campaigns (or
  epochs) differ in a hashed input, so linking them requires either the
  credential secret or a break of the hash's pseudorandomness. This is a
  stated cryptographic assumption, not something a fixture can prove; the
  fixtures prove the *derivation* is scoped (§13), and the adversary page in
  the documentation states the residual assumption plainly.
- *Not a permanent identifier*: no derivation input is a person identifier,
  and `credentialSecret` never leaves the device; the nullifier reveals
  membership of the scope, not identity within it.

The circuit MUST constrain the nullifier's derivation from the same
`credentialSecret` that satisfies the eligibility predicate; a nullifier
merely *asserted* alongside a valid predicate proof would let one credential
mint arbitrary nullifiers and claim without bound.

## 7. Atomic claim anchoring

Charity.md §7 places the duplicate rule at `claim-aid`. This profile
implements that atomically: `anchorAidClaim` verifies the eligibility proof,
checks campaign status/revision/epoch, consumes the nullifier, and records
the claim anchor in one transaction. There is no separate
"verify-presentation" write that could open a time-of-check/time-of-use
window between eligibility verification and nullifier consumption, and a
revert at any step writes nothing. `present-eligibility` remains a
client/operator-side operation whose successful outcome is this single
on-chain write; a read-only pre-check MAY use `isNullifierUsed` and a local
proof verification, but the on-chain call is the only consumption point.

Atomicity and idempotency compose in a fixed order: the restricted-mode
entrypoint gate, then the `claimDigest` precheck, then the state
pipeline (§4). A byte-identical resubmission of an anchored
claim — a retry after an unknown outcome, a replayed transaction, a
front-run with copied calldata — returns as a success no-op without
touching the nullifier or the verifier; a resubmission differing in any
field is `AnchorConflict`; and only an unanchored digest enters the
verify-and-consume pipeline. Without this precheck, §11's "retry
terminates in an idempotent anchor" guarantee would be unsatisfiable,
since the retried claim would always meet its own consumed nullifier.

One staleness gate is deliberately **not** on-chain: the `expiresAt`
fields of the eligibility presentation and the aid claim (Charity.md
§6.7/§6.8) are enforced by the verifying operator and the client before
submission, not by the contract. Enforcing them on-chain would require
carrying the expiry timestamps as calldata or public inputs — expanding
permanent public metadata to police a bound the epoch gate already
enforces more coarsely (a presentation cannot outlive its claim window,
because the window is part of its statement). The operator MUST check
both expiries off-chain per the abstract boundary; the chain bounds
staleness at epoch granularity only.

## 8. Recipient commitments

```text
recipientCommitment = keccak256(T_rc ‖ deliveryBindingDigest ‖ rho)
```

where `T_rc` is the ASCII tag above, `deliveryBindingDigest` is the digest
of the claim's private delivery binding (Charity.md §6.8), and `rho` is 32
bytes of fresh randomness drawn per claim and shared only with the delivery
provider. The commitment is *binding-only*: the circuit includes it as a
public input to bind it under the claimant's proof but proves nothing about
its opening; the claimant opens it privately to the delivery provider by
revealing `(deliveryBindingDigest, rho)`.

What it hides: the delivery coordinate, and — because `rho` is fresh per
claim — whether two claims share a coordinate. Repeated delivery to the same
address across epochs or campaigns produces unlinkable commitments.

What it does **not** hide, and the UI MUST disclose before the claimant
authorizes: that a claim exists; its campaign, epoch, and timing; and the
join between claim and disbursement (the `claimDigest` key linking
`AidClaimAnchored` to `DisbursementAnchored` is public by design — that join
is the audit trail).

## 9. Eligibility predicate families and public inputs

The initial family is `membership-set-v1`
(`onym:charity-eligibility:membership-set-plonk-bn254-v1`): the claimant
proves knowledge of `credentialSecret` such that a commitment derived from
it is a member of an issuer-published accumulator (Merkle set over the
circuit-native hash) whose root the operator registered for the policy
(`policyRoot`), and that the nullifier is correctly derived (§6). This is
the minimal family that supports "eligible under policy P" with duplicate
prevention and no identity disclosure.

The full public-input vector, in order, all values BN254 field elements:

```text
 1. campaignId                      (in-field identifier, §5 rule 1)
 2. campaignRevision               (uint32, trivially in-field)
 3. policyDigest.hi                (limb, §5 rule 2)
 4. policyDigest.lo                (limb)
 5. epochIndex                     (uint64, trivially in-field)
 6. nullifier                      (in-field by construction, §6)
 7. claimDigest.hi                 (limb)
 8. claimDigest.lo                 (limb)
 9. recipientCommitment.hi         (limb)
10. recipientCommitment.lo         (limb)
11. policyRoot                     (from contract storage, §4)
```

Positions 1–10 bind the claim; position 11 binds the predicate instance.
Family-specific extensions append after position 11 and require a new
family ID. Which additional families ship, and in what order, is an open
question (§14.3); candidates are listed there rather than half-specified
here.

Proof size and byte encoding (point order, field serialization) are fixed by
the chosen toolchain release and pinned by the conformance fixtures — this
draft deliberately does not hardcode them, for the same reason the notary
BNB profile does not: toolchains disagree, and the fixture chain owns the
exact bytes.

## 10. Contract-derived public inputs

The contract constructs the public-input vector itself from call arguments
and storage — limb-splitting the digests in Solidity, reading `policyRoot`
from the policy registration — and passes the constructed vector to the
verifier. The caller never supplies a raw public-input array.

Consequences, all deliberate:

- a *misordered* or *padded* public-input attack is impossible by
  construction rather than detected by comparison;
- every bindable field mismatch has a named selector (§4.1) decidable
  *before* the verifier runs, so the expensive pairing check happens only on
  well-formed, current statements; and
- `InvalidProof` therefore means exactly one thing: the proof does not prove
  this statement.

## 11. Submission, receipts, finality, and reorgs

The relayer gains charity operations on its existing EVM backend (which is
itself unbuilt; §15). The rules are restated from the notary EVM profile
because they are normative here too:

1. **The transaction hash is mandatory and provisional.** Every write
   response carries the EVM transaction hash from the first release. It is
   provisional: a stuck-transaction replacement (same nonce, byte-identical
   calldata, bumped fee) produces a different hash for the same logical
   operation. The stable reconciliation key is the client-generated
   `operationId`; `GET /operations/:operationId` returns the current hash,
   every superseded hash, and the current receipt status. A client that
   polls a hash and finds nothing MUST fall back to the operation query
   before concluding anything.
2. **Idempotency.** Duplicate client retries with the same `operationId`
   map to the same logical operation, never a second execution. For the
   claim path the contract adds its own backstop: a byte-identical
   duplicated claim write lands as a success no-op at the `claimDigest`
   precheck (§7), and a *distinct* claim reusing the entitlement reverts
   `NullifierUsed`.
3. **Receipt is not finality.** A receipt with `status == 1` in an included
   block means *executed*; `finalized` means the block is at or below BSC's
   fast-finality checkpoint. The two are distinct client-visible states,
   and no UI shows a donation receipt anchor, claim, or disbursement as
   final before reconciliation against the `finalized` tag.
4. **A reorg is a security event.** A previously seen receipt whose block is
   later orphaned, or any finalized-state read contradicting the pinned
   binding, is the `conflicting_state` event: the client preserves
   evidence, surfaces the incident path, and MUST NOT silently resubmit.
   For claim writes this matters concretely — a claimant whose anchor was
   orphaned rebuilds through the normal path and either lands the identical
   anchor (idempotent) or receives `NullifierUsed` from a competing
   inclusion, both of which are correct outcomes; the *event* is still
   reported.
5. **A revert is a named refusal.** `status == 0` receipts are decoded by
   selector into §4.1's taxonomy; raw revert data and HTTP status are
   diagnostics, never control flow.
6. **Reads need independence.** The relayer may proxy reads, but a TLS
   response from the party that submitted the write is not evidence; the
   client MUST be able to verify against a second RPC provider, using the
   `finalized` block tag for canonical snapshots.

## 12. Operator manifest bindings

The relayer's signed operator manifest (`GET /manifest.json`, byte-served,
hash-pinned; the machinery is merged on the Stellar side via
onym-relayer#13, and as of this draft's date the deployed relayer serves a
signed manifest declaring Stellar notary support only — the served bytes,
not this document, are always the authoritative statement of what is
declared) gains:

- `onym:charity-implementation:bnb-evm-cha-plonk-bn254-v1` in
  `implementationProfiles`;
- the `cha-anchor` deployment(s) it administers, each with chain ID,
  address, runtime code hash, verifier address and code hash, and profile
  ID;
- `eip155` network entries binding the ed25519 operator identity to the
  secp256k1 `submitterAccount` (pays gas) and `adminAccount` (the
  `msg.sender` the operator-attested entrypoints accept). Client
  verification MUST compare `adminAccount` against `getOperatorAdmin()`;
  without that comparison, declared powers are not checkable against
  contract-enforced reality; and
- a privacy profile declaring what the operator observes (IP, timing, proof
  size, submitted values) and the public exposure of the chain itself.

Manifest expiry ends new reliance only; superseded versions stay
retrievable by hash; a key change without a rotation statement signed by
the old key is a different operator. A deployment absent from the manifest
does not exist for clients, whatever is on the chain.

The governing invariant, adapted from the notary seat:

> The operator's key can pay for, submit, gate, and *attest* — campaign
> records, receipt anchors, report anchors, all visibly under its admin
> address — and it can **pause claim intake deployment-wide** through the
> restricted-mode emergency stop, a declared, auditable power equivalent
> to pausing every campaign at once, never a selective one. It can never
> make an ineligible claimant eligible, consume or unconsume a nullifier,
> alter an anchored digest, or convert an anchor into proof that money
> moved or aid arrived.

## 13. Conformance fixtures

A conforming implementation ships the fixtures below, named as listed, each
executable from this section alone. The negative set is deliberately larger
than the positive set: the profile's value is what it refuses.

### 13.1 Positive fixtures

- `fix-campaign-lifecycle` — register a campaign (assert it exists at
  revision 1, active); advance revision 1→2; pause; advance 2→3 while
  paused (legal); reactivate; close. Assert each event, each storage
  read, and the refusals by selector: `setCampaignStatus(closed→active)`
  and a status byte above 3 revert `InvalidStatusTransition`; a revision
  skip reverts `RevisionNotSequential`; `advanceCampaignRevision` on the
  closed campaign reverts `CampaignNotActive`.
- `fix-claim-happy-path` — full chain from credential to anchor: issuer
  publishes a set root; operator registers policy; claimant derives
  nullifier and recipient commitment, builds the `membership-set-v1` proof;
  `anchorAidClaim` from a *non-operator* sender succeeds; assert the
  `AidClaimAnchored` event fields, `isNullifierUsed == true`, and
  `getClaimAnchor` contents.
- `fix-disbursement-join` — anchor a disbursement receipt digest against
  the claim; assert the public join (`claimDigest` key) and that
  `getClaimAnchor` returns the receipt digest.
- `fix-idempotent-anchor` — re-anchor the identical donation receipt
  digest, and resubmit the byte-identical `anchorAidClaim` call for an
  already-anchored claim. Assert both land as success no-ops via the
  `claimDigest`/anchor prechecks (§7) — the claim resubmission MUST NOT
  reach the nullifier check or the verifier — and that storage is
  unchanged.
- `fix-disbursement-after-close` — anchor a claim while active, close the
  campaign, then anchor its disbursement receipt; assert success (the
  status-gate exemption of §4) and the intact public join. Repeat with a
  revoked campaign.
- `fix-cross-campaign-derivation` — one credential, two campaigns, same
  epoch schedule: assert both claims succeed and the two nullifiers
  differ. The fixture proves the *derivation is scoped*; it does not and
  cannot prove unlinkability, which rests on the hash assumption stated in
  §6 — the fixture description MUST carry this caveat verbatim.
- `fix-cross-epoch-derivation` — one credential, one campaign, two epochs:
  both succeed, nullifiers differ, same caveat.
- `fix-operation-reconciliation` — submit; force a same-nonce fee-bump
  replacement with byte-identical calldata; assert the original hash
  resolves to nothing, `GET /operations/:operationId` returns both hashes,
  and the final receipt reconciles under the operation ID.
- `fix-epoch-rollover-rebuild` — build a presentation in epoch *k*, mine
  past the boundary, submit, receive `EpochNotCurrent(k+1, k)`; rebuild for
  *k+1*; assert the new nullifier differs and the retry succeeds.
- `fix-canonicalization-vectors` — the §2.1 byte-level vectors, shared
  across every implementation: for each boundary object (campaign,
  donation receipt, aid claim, disbursement receipt, fund-flow report),
  the exact JCS bytes, the signing input with its `dsTag`, the anchor
  digest over the signed object, and a cross-language assertion that
  independent serializers produce identical bytes. This is the fixture
  §16's third-party-interop criterion rests on.

### 13.2 Negative fixtures

**Scope and duplicate refusal**

- `neg-nullifier-replay` — same credential, same campaign, same epoch, two
  distinct claims (different `claimId`, so different `claimDigest`): the
  second reverts `NullifierUsed`. Assert the selector, that no storage
  changed, and that the error surface contains no value derived from the
  credential beyond the already-public nullifier.
- `neg-revision-stability` — claim at revision *n*; advance the campaign
  to *n+1*; **rebuild the second attempt against revision *n+1*** (fresh
  consent, fresh proof — the §4 pipeline checks revision before the
  nullifier, so an un-rebuilt attempt would revert
  `StaleCampaignRevision` and assert nothing about nullifiers). Assert
  the rebuilt attempt's nullifier is byte-identical to the first
  (derivation excludes revision) and that it reverts `NullifierUsed`.
  This is the fixture that proves a policy update cannot mint a second
  claim.
(The cross-campaign and cross-epoch derivation checks assert *successes*
and live in §13.1 as `fix-cross-campaign-derivation` and
`fix-cross-epoch-derivation`.)

**Curve and statement separation**

- `neg-cross-curve-bls-under-bn254` — a well-formed BLS12-381 eligibility
  proof (valid under a future BLS12-381 sibling profile's encoding — Stellar
  or Cardano; the fixture MUST record which sibling's encoding produced the
  vector, because the two are not interchangeable) submitted to
  `anchorAidClaim`: rejected — by length/decode where lengths differ, by
  `InvalidProof` where they coincide — and never anchored.
- `neg-cross-curve-bn254-under-bls` — the converse fixture, shipped with this
  profile and executed against each BLS12-381 charity binding as that binding
  arrives. Until the first one exists it is a published vector with an
  explicit "counterpart unimplemented" marker, not silently omitted; once one
  exists, the marker is retired only for the sibling actually run against, and
  remains for the other. (Named `neg-cross-curve-bn254-under-stellar` in draft
  0.1, when Stellar was the only planned counterpart.)
- `neg-foreign-statement` — a valid BN254 proof for a *different* statement
  family with a compatible shape (the notary `sep-*` transition circuits
  are the natural donor): `InvalidProof`, because the statement tag
  constant differs. This is the domain-separation fixture.

**Encoding**

- `neg-out-of-field-campaign-id` — `registerCampaign` with
  `campaignId >= r`: `ValueNotInField`. Then the injectivity attack:
  register a valid `campaignId`, attempt a second registration with
  `campaignId + r` (as a 32-byte value): rejected out-of-range, proving
  the aliasing route is closed at the door rather than by reduction.
- `neg-out-of-field-nullifier` — claim with `nullifier >= r`:
  `ValueNotInField` before any verifier call.
- `neg-out-of-field-policy-root` — `registerEligibilityPolicy` with
  `policyRoot >= r`: `ValueNotInField` at registration. The companion
  assertion is the rationale made testable: with the check removed in a
  harness build, an honest prover against the malformed policy fails as
  opaque `InvalidProof` — which is exactly the failure mode the
  registration-time check exists to prevent.
- `neg-invalid-epoch-schedule` — `registerCampaign` with
  `epochSeconds == 0`: `InvalidEpochSchedule`; assert the campaign does
  not exist afterward and `currentEpoch` on a registered campaign never
  divides by zero.
- `neg-claim-before-start` — register a campaign with a future
  `epochStart`; claim immediately: `CampaignNotStarted`. Mine past the
  start; assert the same presentation strategy succeeds in epoch 0.
- `neg-reduction-forbidden` — a harness-level fixture: feed the client SDK
  a 32-byte value `>= r` for a freely chosen identifier and assert it
  *redraws* rather than reduces; assert digests are limb-split by asserting
  the two limbs recompose to the exact digest.

**Staleness and policy binding**

- `neg-stale-campaign-revision` — proof bound to revision *n*, campaign
  advanced to *n+1* before inclusion: `StaleCampaignRevision(n+1, n)`;
  assert the client's mapped behavior is re-resolve → re-consent → rebuild,
  and that rebuilding succeeds.
- `neg-unknown-policy` — presentation referencing a policy digest never
  registered for the campaign: `UnknownPolicy`, verifier never invoked.
- `neg-wrong-policy-root` — policy registered with root A, proof built
  against root B: `InvalidProof` (the root is storage-derived into the
  public inputs; the mismatch is cryptographic, not comparative).

**State protection**

- `neg-anchor-conflict` — all three conflict shapes of §4.1, each
  asserting `AnchorConflict`, nothing overwritten, and the client
  taxonomy mapping to a security event, not a retry: (a) anchor a
  disbursement receipt digest, then submit a *different* digest under
  the same `claimDigest`; (b) resubmit an anchored claim with one stored
  field changed (e.g. a different `recipientCommitment`); (c) re-anchor
  an anchored donation receipt digest with a different
  `campaignRevision` — the metadata conflict, since the digest is the
  key and cannot itself collide.
- `neg-status-gate` — new claims and policy registrations against paused,
  closed, and revoked campaigns: `CampaignNotActive` with the correct
  status code each time. The gate's *scope* is asserted from both sides:
  the exempt paths (receipt, disbursement, and report anchors on
  non-active campaigns) succeed, per `fix-disbursement-after-close`.
- `neg-operator-gate` — every operator-attested entrypoint called from a
  non-admin account: `OperatorOnly`. Complemented in-fixture by the
  positive assertion that `anchorAidClaim` succeeds from an arbitrary
  account, proving the two authority classes are actually distinct.
- `neg-restricted-mode` — with restricted mode enabled: `anchorAidClaim`
  reverts `RestrictedMode` for a fresh claim **and** for a byte-identical
  resubmission of an already-anchored one (the entrypoint gate precedes
  the idempotence precheck, §4); every operator-attested write (receipt,
  disbursement, report anchors, status changes) and every view still
  succeeds — the audit trail records through the emergency stop. Assert
  the `RestrictedModeChanged` events, that the manifest declares the
  power, and that disabling restores claim intake without state loss.
- `neg-canonicalization-drift` — mutations of the §2.1 vectors that MUST
  change or refuse the digest: reordered members re-canonicalize to the
  identical digest (order never matters); an added unknown critical field
  is refused at schema validation before any digest is computed; a
  signature-only change DOES change the anchor digest (digest-over-signed)
  while leaving the signing input unchanged; and a non-JCS serialization
  of the same object is detected by byte comparison against the vector.

**PII exclusion**

- `neg-pii-in-public-state` — the strongest invariant gets the bluntest
  fixture, in three layers:
  1. *interface layer*: assert by ABI inspection that no external function
     accepts a `string` or variable-length `bytes` other than `proof`, and
     that no event declares one;
  2. *client layer*: feed the SDK's anchor-preparation path objects whose
     fields contain planted PII patterns (a name, an IBAN, an email, a
     phone number, a street address — the fixture ships the exact planted
     set) and assert every value that reaches calldata is a fixed-width
     digest, commitment, or field element in which no planted pattern's
     bytes appear;
  3. *chain layer*: run the full happy path, dump every emitted log and
     every storage slot the contract wrote, and grep for the planted
     patterns in raw and UTF-8-decoded form. Zero hits is the pass
     condition.
  The fixture MUST also assert the `encryptedRecipient` payload of the
  delivery binding never appears in calldata at all — sealed bytes are
  excluded from the transaction, not merely encrypted within it.
- `neg-reorg-before-finality` — orphan a block containing a claim anchor;
  assert the client reports `conflicting_state`, does not auto-resubmit,
  and that the manual rebuild path terminates in an idempotent anchor or
  `NullifierUsed` as §11.4 requires.

## 14. Open questions

Each is genuinely undecided; the criteria state what settles it.

1. **Epoch boundary grace.** Should `anchorAidClaim` accept
   `epochIndex == currentEpoch - 1` within a short window after rollover?
   Accepting it removes a boundary-race failure for slow submissions;
   rejecting it (the current text) keeps the invariant "one claim per
   credential per epoch" exact, because a grace window lets one credential
   claim in both *k* (late) and *k+1* (early). Decide by: whether pilot
   policies use epochs as hard entitlement windows (no grace) or as
   rate-limiting (grace acceptable); measured submission-to-inclusion tail
   latency on BSC.
2. **Circuit hash instance.** Poseidon over BN254 is the working choice for
   nullifier derivation and the membership accumulator; the exact instance
   (width, rounds, MDS parameters) is unpinned. Decide by: which audited
   instance the chosen proving toolchain ships natively — a hand-ported
   instance would reintroduce exactly the bespoke-audit surface the BN254
   re-target avoids.
3. **Second predicate family.** Candidates beyond `membership-set-v1`:
   revocation-aware membership (root plus non-membership in a revocation
   set), attribute threshold over an issuer-signed committed attribute, and
   credential-expiry binding. Decide by: what the first real eligibility
   issuers can actually attest and revoke, not by circuit ambition.
4. **Campaign-scoped fields in claim anchors.** Charity.md §6.8 says public
   state "may contain only the claim digest, scoped nullifier, and
   recipient commitment required by the profile"; this profile's claim
   anchor also carries `campaignId`, `campaignRevision`, and `epochIndex`
   — campaign-scoped, not beneficiary-scoped, and arguably outside §6.8's
   intent, but the sentence does not say so. Needs an upstream
   clarification in Charity.md; this profile proceeds on the reading that
   §6.8 constrains beneficiary-derived values and flags the reading
   explicitly rather than silently assuming it.
5. **Anchor timing versus small-count inference.** Anchors carry no
   amounts and no identities, but their counts and timing are public, and a
   campaign with three claims in a small community is a correlation risk
   Charity.md §6.9 addresses only for *reports* (bucketing/suppression).
   Whether the operator SHOULD batch anchors on a declared schedule, and at
   what minimum batch, is undecided. Decide by: pilot community sizes and a
   written analysis of what batching actually buys against an adversary
   with off-chain knowledge — batching must not be promised as a mitigation
   before that analysis exists.
6. **Disbursement anchor authority.** This draft makes `anchorDisbursement`
   operator-attested. An alternative requires a claimant countersignature
   (binding the claimant's acknowledgment into the anchored digest) so the
   operator cannot unilaterally anchor a disbursement the claimant
   disputes. Decide by: whether the receipt-acknowledgment flow in
   UI-Charity.md §5.4/§5.6 gains a signed acknowledgment object; if it
   does, the countersigned variant is strictly better and this profile
   should adopt it before first deployment.
7. **Proof encoding.** Deliberately unpinned; the conformance suite owns
   the toolchain release and exact bytes, inherited rationale from the
   notary EVM profile. Decided when the fixture chain first goes green.

## 15. Current implementation gaps

Everything below is unbuilt; this list is the work plan, not a polish list:

- **Contracts**: `onym-contracts` contains no charity Solidity — no
  `cha-anchor`, no generated eligibility verifiers, no custom errors, no
  events.
- **Circuits**: no `membership-set-v1` constraint system, setup, or
  verifying keys; no Poseidon instance selection.
- **Prover**: the mobile Rust FFI has no charity proof backend (and no
  BN254 backend at all — that gap is shared with the notary EVM profile
  and MUST be built once, not twice).
- **Relayer**: `onym-relayer` has no charity operations and no EVM
  backend; the operator manifest it serves (as of this draft's date)
  declares Stellar notary support only — the served bytes are
  authoritative, and no manifest anywhere declares a charity profile.
- **BLS12-381 siblings**: neither `UI-Charity-Stellar.md` nor
  `UI-Charity-Cardano.md` exists, so the `neg-cross-curve-bn254-under-bls`
  fixture has no counterpart to run against in either direction. Whichever
  sibling profile is written first supplies the counterpart; the other keeps
  the "counterpart unimplemented" marker until it arrives. Neither sibling
  gates this profile, and this profile gates neither.
- **Clients**: no charity module implements the UI-Charity.md port; no
  eligibility flow, no anchor reconciliation.
- **Fixtures**: none of §13 exists in any repository.

## 16. Acceptance criteria

This profile is satisfied when:

1. a `cha-anchor` deployment is cryptographically bound to chain ID,
   address, runtime code hash, verifier anchors, and operator, and a client
   verifies all of it plus `getVerifier()`/`getOperatorAdmin()` against the
   signed manifest before first use;
2. the two write-authority classes are contract-enforced: every
   operator-attested entrypoint refuses non-admin senders, and claim
   anchoring succeeds from arbitrary senders on proof validity alone;
3. one credential yields exactly one anchored claim per campaign per epoch,
   across campaign revisions, proven by the §13.2 scope fixtures;
4. every error in §4.1 is a distinct decodable selector whose mapped retry
   class the client actually implements;
5. the §13.2 PII fixture passes at all three layers on the full happy path;
6. cross-curve and cross-statement proofs are rejected in fixtures, in both
   directions once a BLS12-381 sibling exists — and cross-statement rejection
   is required on its own terms, since it is the only separation available
   between two siblings that share a curve;
7. write reconciliation survives nonce replacement, unknown outcomes, and
   pre-finality reorgs with the operation ID as the stable key and
   `conflicting_state` treated as a security event; and
8. a third-party client, relayer, RPC provider, and deployment interoperate
   from the published profile and fixtures alone.

## 17. References

1. Technology-neutral charity boundary: [Charity.md](Charity.md)
2. Messenger application profile: [UI-Charity.md](UI-Charity.md)
3. Notary EVM implementation profile (source of the shared EVM rules,
   restated in §3, §5, §11, §12): [../notary/UI-Notary-BNB.md](../notary/UI-Notary-BNB.md)
4. Abstract notary boundary: [../notary/UI-Notary.md](../notary/UI-Notary.md)
5. Onym contracts repository: <https://github.com/onymchat/onym-contracts>
6. Onym transaction relayer: <https://github.com/onymchat/onym-relayer>
7. RFC 8785, JSON Canonicalization Scheme (JCS):
   <https://www.rfc-editor.org/rfc/rfc8785>
8. EIP-155 (chain ID): <https://eips.ethereum.org/EIPS/eip-155>
9. EIP-196/197 (BN254 precompiles):
   <https://eips.ethereum.org/EIPS/eip-196>,
   <https://eips.ethereum.org/EIPS/eip-197>
