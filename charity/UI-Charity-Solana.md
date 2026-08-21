---
status: draft
proposed: Claude & @rinat-enikeev
date: 21.08.2026
---

# Onym Charity ↔ Solana Implementation Profile

**Implementation profile draft 0.1 — 21 August 2026**

> This profile maps the notary and eligibility bindings of the
> technology-neutral Onym charity boundary onto Solana: one immutable Anchor
> program per charity deployment, Groth16 eligibility evidence over BN254
> verified through the `alt_bn128` syscalls, the Solana Attestation Service
> (SAS) as the issuer and policy layer, and the Onym relayer operating as the
> declared fee-paying submitter. It deliberately maps **no** financial
> binding: custody, settlement, and disbursement stay with the financial
> provider under its own legal authority, and the on-chain settlement question
> is deferred to a separate profile ID with the preconditions named in §1.

This document is a concrete implementation profile for
[Charity.md](Charity.md). The abstract boundary remains authoritative for
object meaning and trust semantics; [UI-Charity.md](UI-Charity.md) remains
authoritative for what the user application shows and refuses. The
[BNB/EVM profile](UI-Charity-BNB.md) is the merged sibling this document
mirrors section by section, so the two can be read against each other;
Stellar/Soroban and Cardano are unwritten sibling profiles over BLS12-381.
No sibling gates this one and this one gates none. UI-Charity.md §8.3 states
the conformance bar for selecting any ledger: "uses X" is an implementation
choice and not evidence of conformance until the implementation profile
exists and passes conformance tests. This document is that profile for
Solana.

Section numbering follows UI-Charity-BNB.md so shared concerns sit at the
same number, with one insertion: **§12 (SAS credential binding)** has no EVM
counterpart, and every later section is therefore one higher than its BNB
equivalent.

The document distinguishes:

- **accepted decisions**, settled for this profile;
- **profile requirements** (MUST / MUST NOT / SHOULD / MAY, per RFC 2119
  usage), required for a complete conforming implementation;
- **open questions**, explicitly undecided, each with its decision criteria;
  and
- **gaps**, where no code exists. As of this draft the entire charity path is
  unimplemented on every chain: `onym-contracts` contains no charity programs
  or contracts, no charity circuits exist on any curve, and `onym-relayer`
  has no charity operations and no Solana backend.

Two requirements in this document are **measurement-gated** and marked as
such where they appear: the verifier path and its compute-unit request
(§10), and the Poseidon instance (§6). Both are pinned by fixtures that do
not exist yet. A conforming implementation cannot exist before those
measurements do, which is the honest reading of this draft's status.

## 1. Scope: where the notary boundary ends

This profile implements, on Solana, exactly the notary uses that
UI-Charity.md §8.1 scopes the notary port to:

1. campaign status and revision commitments;
2. donation and disbursement receipt commitments;
3. aggregate fund-flow state commitments;
4. nullifier uniqueness within a campaign and epoch;
5. inspectable, authorized policy and status changes; and
6. public audit/report commitments.

Item 5 maps indirectly in the same way it does on the EVM: the program has
no dedicated destination record, so a destination change is a material
campaign update under Charity.md §6.3 and MUST surface as a new campaign
revision, whose commitment `advance_campaign_revision` anchors.

It additionally implements one `eligibilityBindings` entry: verification of
eligibility presentations under Groth16/BN254, atomically coupled to
nullifier consumption (§7), with the issuer and policy layer bound to SAS
(§12).

**Out of scope, deliberately — and this is the section a reader of the
Solana documentation page should check first.** Under this profile ID the
program holds no lamports beyond the rent-exemption of its own accounts,
owns no token accounts, mints nothing, and executes no transfer of SOL or
any SPL asset. It MUST NOT be extended with token accounts, escrow, vaults,
or disbursement logic under this profile ID; a program instruction that
performs a transfer is out of conformance regardless of what it also does.
What this program records about a settlement is a **commitment to a signed
off-chain receipt**, which proves the operator anchored those exact bytes at
that time — never that money moved, and never that aid arrived.

The on-chain settlement question is real on this ledger in a way it is not
on the siblings — sub-cent fees, SPL-USDC, and a transaction-level fee payer
make small disbursement economically sensible — and this profile answers it
by **deferring it to a separate profile ID**, reserved here:

```text
onym:charity-implementation:solana-cha-settlement-v1   [not defined]
```

That profile MUST NOT be declared by any deployment until it supplies, at
minimum:

1. a **named custodial legal counterparty** and the Charity.md §11
   disclosures that go with it — an irreversible SPL transfer cannot
   implement the donation machine's `refund-pending`, `refunded`, and
   `reversed` states by itself; a party with an obligation implements them;
2. a decision on **what the settlement transaction publishes**. An SPL-USDC
   transfer in the same *transaction* as a claim anchor publishes the
   destination token account in that transaction's account list, joined to
   the scoped nullifier. Splitting it into a separate *instruction* changes
   nothing, because the account list is transaction-scoped. The candidate
   shapes are: settle through the delivery provider off-rail (this profile's
   position); settle to a fresh, never-reused recipient account per claim;
   or settle in a transaction separated from the anchor. Each MUST be stated
   in the deployment's privacy profile and disclosed by the UI before the
   claimant authorizes (Charity.md §11);
3. its own finality, refund, and reversal mapping, its own fixtures, and its
   own audit.

Until then, value movement has no instruction here by design, and a
deployment declaring only this profile ID is a notary-and-eligibility
deployment.

Two write authorities exist, and the program keeps them distinct:

- **Operator-attested writes** (campaign lifecycle, receipt and report
  anchors) require the campaign's registered admin as a transaction signer.
  They are tamper-evident operator statements: the chain proves *who signed
  it and when*, not that it is true.
- **Proof-authorized writes** (aid-claim anchoring) are signer-agnostic. Any
  fee payer may submit them; validity comes from the eligibility proof and
  the program's own state, never from who signed.

A third, narrower authority is introduced by SAS and does not exist on the
EVM sibling: **root updates** (§12), authorized against the SAS credential's
current authorized signers rather than against a key fixed at registration,
so that removing a signer stops future extension of the eligibility tree.

## 2. Conformance declaration

| Abstract concept (Charity.md / UI-Charity.md) | Solana mapping |
|---|---|
| Notary binding (`CharityDeployment.notaryBindings[]`) | One deployed, **immutable** `cha_anchor` program instance |
| Eligibility binding (`CharityDeployment.eligibilityBindings[]`) | Groth16/BN254 verification inside the same program, via `alt_bn128` syscalls |
| Organization credential / eligibility policy issuer layer | Solana Attestation Service Credential and Schema accounts (§12) |
| Canonical system | Solana cluster selected by **genesis hash**, never by display name |
| Campaign revision commitment | 32-byte keccak-256 digest of the canonical signed campaign record |
| Receipt / report commitment | 32-byte keccak-256 digest of the canonical signed off-chain object |
| Claim reference | 32-byte keccak-256 digest of the canonical authorized `AidClaim` |
| Scoped nullifier | BN254 field element, campaign- and epoch-scoped (§6), realized as a nullifier PDA (§7) |
| Recipient commitment | 32-byte randomized, claim-scoped commitment (§8) |
| Implementation identity | Genesis hash + program ID + program-data hash + upgrade authority `None` + profile/release (§3) |
| Submission provider | Fee-paying `onym-relayer` HTTP service (Solana backend), or any other fee payer for claim writes |
| Read provider | Solana JSON-RPC / indexer; relayer proxy permitted but never canonical |
| Submission reference | Transaction signature (provisional) + stable operation ID (§11) |
| Finality | `finalized` commitment level |
| Maintenance | Rent-exemption deposits on every created account; **nullifier accounts are never closed** (§7) |
| Campaign machine (Charity.md §8.1) | `register_campaign` = draft→active; `set_campaign_status` = the remaining edges (§4) |
| Aid-claim machine (Charity.md §8.3) | `prepared`/`submitted`/`eligibility-verified` collapse into the atomic `anchor_aid_claim` write, whose anchor is the on-chain evidence of `eligibility-verified`; `approved` is an **off-chain operator state** with no on-chain record; `disbursed` = `DisbursementAnchored` |

Profile identifiers:

```text
onym:charity-implementation:solana-cha-groth16-bn254-v1
onym:charity-eligibility:membership-set-groth16-bn254-v1
```

The first identifies this notary/eligibility binding; the second identifies
the initial eligibility predicate family (§9). The `-groth16-bn254-`
segment is a **two-part discriminator** and both parts are load-bearing: a
BLS12-381 proof is not valid evidence under this profile, and — unlike the
curve check alone — the proof-system segment separates this profile from the
BNB sibling, which shares the curve and uses PLONK. Fixtures MUST prove both
rejections (§14, `neg-cross-curve-*`, `neg-cross-system-*`).

Curve and system separation are still not sufficient. Per UI-Charity.md
§8.3, every profile in this family carries a separation that holds
independently of the proof system, and this profile satisfies it through the
**statement-tag constant** bound into the proven statement (§5). The
fixture that exercises it is §14's `neg-foreign-statement`.

### 2.1 Canonical bytes and digests

Charity.md §6 requires deterministic canonicalization with a stable digest
and assigns the concrete scheme to the profile (Charity.md §5.1). This
profile pins the **same scheme as the BNB sibling**, deliberately and
without variation, so that one canonicalization fixture set serves both and
a campaign object digests identically whichever ledger anchors it:

- **Canonical bytes** of a boundary object are its RFC 8785 (JCS)
  serialization.
- **Signing input** for a signed object is
  `dsTag ‖ 0x00 ‖ JCS(object with its signature member structurally
  removed)`, where `dsTag` is the object's Charity.md §6 domain-separation
  tag.
- **Anchor digests** (`revisionCommitment`, `receiptDigest`, `claimDigest`,
  `disbursementReceiptDigest`, `periodDigest`) are
  `keccak256("onym:charity:sol:anchor:v1" ‖ 0x00 ‖ JCS(object))`, where the
  object **includes** its signature member(s).
- Unknown critical fields fail closed at schema validation, **before**
  digesting.

Two consequences are specific to this ledger and normative:

1. **keccak-256, not the cheaper syscall.** Solana exposes both keccak-256
   and SHA-256 syscalls; anchor digests use keccak-256 to keep the digest
   scheme identical to the sibling profile. The saving from switching is a
   few hundred compute units; the cost would be a second canonicalization
   fixture set and a family of objects that digest differently per ledger.
2. **The anchor tag differs from BNB's** (`:sol:` versus `:bnb:`), so the
   same signed object anchored on both ledgers produces two distinct anchor
   digests. This is intended: an anchor digest identifies *an anchoring on a
   named rail*, and the fixtures pin both values side by side.

## 3. Deployment identity and hardening

Every rule here is normative, and the first two carry the weight the EVM
sibling puts on `immutable` values inside hashed bytecode.

1. **Identity is four-part.** A deployment is identified by the cluster
   **genesis hash**, the **program ID**, the **hash of the deployed program
   data**, and the **upgrade authority**. All four MUST appear in the
   `CharityDeployment.notaryBindings` entry and all four MUST be verified by
   the client before first use. Network identity is the genesis hash, never
   a display name or an RPC URL. This profile is scoped to mainnet-beta and
   devnet; testnet is **not covered**.
2. **The upgrade authority MUST be `None`.** Solana programs deploy
   upgradeable by default, so a client that pins a program ID has pinned
   nothing about the code that will execute tomorrow. Under this profile ID
   the program's upgrade authority MUST be revoked before the deployment is
   declared, and the client MUST verify that the on-chain `ProgramData`
   account's `upgrade_authority_address` is `None` — not that a manifest
   says so. A deployment with a retained authority is a different security
   model; it MUST take a different profile ID and declare the authority (and
   its multisig members) in the manifest.
3. **Build verifiability.** The deployment SHOULD publish a verifiable
   build mapping the on-chain program-data hash to reviewable source. The
   hash proves the bytes have not changed; only the build mapping says what
   they do.
4. **The verifier is in the program, and the verifying keys are pinned.**
   Groth16 verification runs inside `cha_anchor` against verifying keys that
   are compile-time constants of the program — never mutable account state
   — so the program-data hash covers which key verifies. Verifying keys are
   additionally content-addressed in the deployment's `verifierAnchors`,
   together with the identity of the trusted-setup ceremony that produced
   them (§15.4).
5. **No dynamic dispatch.** The program MUST NOT invoke a verifier at a
   caller-supplied program ID, and MUST NOT read verifying keys from an
   account whose authority is not `None`.
6. **Program-derived addresses only.** All state accounts are PDAs of this
   program under the seed schemes in §4; the program MUST reject any account
   whose address does not re-derive.

## 4. Program interface

One program instance (`cha_anchor`) per charity deployment, with one
`Deployment` account and per-campaign, per-policy, per-claim, and
per-nullifier PDAs.

Typing convention, applied uniformly: values that are **BN254 field
elements** (`campaign_id`, `nullifier`, `policy_root`) are `[u8; 32]`
big-endian with the in-range check of §5 at their entry point; **opaque
32-byte digests and commitments** are `[u8; 32]` and carry no range
constraint.

PDA seed schemes, normative:

```text
Deployment      ["cha", "deployment"]
Campaign        ["cha", "campaign", campaign_id]
Policy          ["cha", "policy",   campaign_id, policy_digest]
ClaimAnchor     ["cha", "claim",    claim_digest]
Nullifier       ["cha", "null",     campaign_id, epoch_index_le, nullifier]
DonationAnchor  ["cha", "don",      receipt_digest]
FundFlowAnchor  ["cha", "flow",     campaign_id, period_digest]
```

Every seed is either a program constant, a public campaign-scoped value, or
an already-public claim value. **No seed may be derived from
credential-linked data**: a PDA address is permanent, indexable public
state, and a credential-derived seed would make the address the
cross-campaign identifier §6 is built to avoid.

Instructions, normative for a conforming implementation:

```text
// ---- operator-attested writes: the campaign admin must sign ----

register_campaign(campaign_id, revision_commitment, epoch_start,
                  epoch_seconds, admin, sas_credential)
    Creates the Campaign PDA at revision 1, active. `epoch_seconds` MUST be
    nonzero (InvalidEpochSchedule); `epoch_start` MAY be in the future —
    claims before it fail CampaignNotStarted. Registration IS the abstract
    machine's draft→active edge. `admin` is the pubkey whose signature the
    operator-attested instructions below require; `sas_credential` is the
    SAS Credential account whose authorized signers may update this
    campaign's eligibility roots (§12). Signed by the deployment authority.

advance_campaign_revision(campaign_id, new_revision, revision_commitment)
    Revisions MUST increase by exactly one. Permitted while active or
    paused; CampaignNotActive on closed or revoked.

set_campaign_status(campaign_id, status)
    0 = active, 1 = paused, 2 = closed, 3 = revoked. No exit from closed or
    revoked, and no status byte above 3 (InvalidStatusTransition).

register_eligibility_policy(campaign_id, policy_digest, policy_root)
    Creates the Policy PDA binding a policy's canonical digest to its
    family-specific public parameter. `policy_root` feeds the public-input
    vector from account state, so it MUST be a BN254 field element and MUST
    be rejected with ValueNotInField here — an unchecked root surfaces later
    as opaque InvalidProof for every honest prover.

anchor_donation_receipt(campaign_id, campaign_revision, receipt_digest)
    Creates the DonationAnchor PDA. Re-anchoring identical values is an
    idempotent no-op; differing metadata under an anchored digest is
    AnchorConflict.

anchor_disbursement(claim_digest, disbursement_receipt_digest)
    Writes the disbursement digest into the ClaimAnchor PDA. Deliberately
    EXEMPT from the campaign status gate: aid is routinely delivered after a
    campaign pauses or closes, and refusing the anchor would truncate the
    audit trail exactly when scrutiny matters most.

anchor_fund_flow_report(campaign_id, period_digest, source_commitment)
    Creates the FundFlowAnchor PDA.

set_restricted_mode(enabled)
    Deployment-wide emergency stop (Charity.md §14). Gates EXACTLY ONE
    instruction — anchor_aid_claim, which fails RestrictedMode while
    enabled, before the idempotence precheck. Operator-attested writes and
    all reads are unaffected: the audit trail records through the stop. MUST
    be declared in the operator manifest (§13).

// ---- root update: authorized against SAS, not against the admin ----

update_eligibility_root(campaign_id, policy_digest, new_policy_root)
    Replaces the Policy PDA's root. Authorized by checking the signer
    against the campaign's SAS credential's current authorized signers
    (§12), NOT against the campaign admin. Fails SasSignerUnauthorized if
    the signer is absent from the credential, SasCredentialMismatch if the
    supplied credential account is not the campaign's registered one, and
    SasCredentialPaused if the referenced schema is paused.

// ---- proof-authorized write: signer-agnostic ----

anchor_aid_claim(campaign_id, campaign_revision, policy_digest,
                 epoch_index, nullifier, claim_digest,
                 recipient_commitment, proof)
    Verifies the eligibility presentation and atomically creates the
    Nullifier PDA and the ClaimAnchor PDA. The program derives the full
    public-input vector itself (§10); the caller supplies only the values
    above plus the proof. Any fee payer may submit. Ordering is normative
    and given in §7.
```

Reads are account fetches, not instructions: `Campaign`, `Policy`,
`ClaimAnchor`, `DonationAnchor`, and `FundFlowAnchor` are deserialized from
their PDAs, and nullifier consumption is tested by the **existence** of the
Nullifier PDA. The program MUST expose the current epoch computation as a
pure client-side function of `Campaign` fields, so that reading it costs no
transaction.

Events are Anchor event records emitted through program logs, one per state
change, each carrying the campaign or claim key:

```text
CampaignRegistered(campaign_id, revision_commitment, epoch_start, epoch_seconds)
CampaignRevisionAdvanced(campaign_id, revision, revision_commitment)
CampaignStatusChanged(campaign_id, status)
EligibilityPolicyRegistered(campaign_id, policy_digest, policy_root)
EligibilityRootUpdated(campaign_id, policy_digest, policy_root, signer)
DonationReceiptAnchored(campaign_id, campaign_revision, receipt_digest)
AidClaimAnchored(campaign_id, campaign_revision, claim_digest, epoch_index,
                 nullifier, recipient_commitment)
DisbursementAnchored(claim_digest, disbursement_receipt_digest)
RestrictedModeChanged(enabled)
```

Every event field is a fixed-width value. The instruction surface has **no
string parameter and no variable-length payload except `proof`**, and the
proof bytes are consumed by the verifier, never stored. Program logs carry
these enumerated events and nothing else: a conforming program MUST NOT
`msg!` instruction arguments, proof diagnostics, or error context beyond the
typed error code. This is the program-shape half of the zero-PII invariant;
the fixture half is §14.

### 4.1 Custom errors and retry semantics

Anchor custom error codes are returned in the transaction result and are
decodable by clients, so this profile keeps the sibling's model: the retry
class is decided **from the chain**, not from a relayer's classification.

| Error | Retry class | Meaning |
|---|---|---|
| `CampaignExists` | refuse-as-defect | Duplicate registration; the PDA already exists. Fix the caller. |
| `CampaignNotFound` | refuse-as-defect | The pinned deployment has no such campaign. A client holding a signed campaign that anchors nowhere treats this as `DEPLOYMENT_INVALID`. |
| `CampaignNotActive` | terminal for this campaign state | A new claim or policy registration against a paused, closed, or revoked campaign; also revision advance on a closed or revoked one. Maps to `CAMPAIGN_NOT_ACTIVE`. Receipt, disbursement, and report anchors are exempt. |
| `InvalidStatusTransition` | refuse-as-defect | Exit from closed or revoked, or a status byte above 3. |
| `InvalidEpochSchedule` | refuse-as-defect | `epoch_seconds == 0` at registration, so the epoch division is total for every registered campaign. |
| `CampaignNotStarted` | retry-after-start | A claim before `epoch_start`. Pre-registration of future campaigns is legal; claiming against one is not yet. |
| `RevisionNotSequential` | refuse-as-defect | Revision skip or rewind. |
| `StaleCampaignRevision` | refresh-and-rebuild / refuse-as-defect | Carries current and supplied. `supplied < current`: re-resolve, re-consent, rebuild, resubmit. `supplied > current`: generator defect; MUST NOT be retried. |
| `EpochNotCurrent` | refresh-and-rebuild | The window rolled over between preparation and inclusion. Rebuilding derives a new nullifier, so the retry cannot collide with the stale attempt. |
| `UnknownPolicy` | refuse-as-defect | The presentation references a policy this campaign never registered. |
| `ValueNotInField` | refuse-as-defect | A value that must be a BN254 field element (§5) is out of range. Carries the zero-based argument index within the failing instruction. |
| `NullifierUsed` | terminal scoped refusal | The entitlement was already claimed in this campaign and epoch by a *different* claim: the Nullifier PDA exists. Maps to `NULLIFIER_USED`; the UI shows a scoped duplicate refusal and MUST NOT expose a person identifier or retry. The program MUST test existence explicitly and return this code — allowing the runtime's account-already-initialized failure to surface instead would give clients an undecodable error for the single most user-visible refusal in the design. |
| `InvalidProof` | refuse-as-defect | The verifier rejected the proof against the program-derived public inputs. Maps to `PROOF_INVALID`; diagnostics stay private. |
| `AnchorConflict` | security event | A value differing from the stored one was submitted under an already-anchored key. Never retried, never overwritten; record evidence and raise the incident path. Re-anchoring identical values is an idempotent success. |
| `ClaimNotAnchored` | refuse-as-defect | Disbursement anchor for a claim this program never saw. |
| `OperatorOnly` | refuse-as-defect | Operator-attested write without the campaign admin's signature. |
| `SasCredentialMismatch` | refuse-as-defect | The supplied SAS credential account is not the one registered for this campaign. |
| `SasSignerUnauthorized` | terminal scoped refusal | The signer is not among the credential's current authorized signers — including the case where it *was* and was removed. This is what revocation looks like at the instruction boundary (§12). |
| `SasCredentialPaused` | retry-after-reopen | The referenced schema is paused; roots cannot be extended until it resumes. |
| `RestrictedMode` | retry-after-reopen | `anchor_aid_claim` while the deployment's emergency stop is enabled. No client action clears it; the client waits for `RestrictedModeChanged(false)` and reconciles prior submissions via reads. Never a payment or compliance gate. |
| `AccountNotDerived` | refuse-as-defect | A supplied account address does not re-derive from its declared seeds (§4). |

Three failure conditions are **not program errors** and MUST NOT be
presented as one:

- **Blockhash expiry / dropped transaction** — the transaction never
  executed and nothing was consumed. Class: *retry-as-transport*.
  Resubmitting the same operation is correct, and a durable nonce is the
  profile's option for slow provers on poor connections (§15.6).
- **Compute-budget exhaustion** — deterministic, not transient. It fails
  identically on retry until the requested limit is raised, so it is
  *refuse-as-defect* and belongs to the client's compute-budget
  configuration (§10), not to a retry loop.
- **Insufficient fee-payer balance or rent** — a relayer operational
  condition surfaced before submission wherever possible; never a claim
  refusal.

### 4.2 Abstract error mapping

| Charity.md §12 code | Program / transport source |
|---|---|
| `DEPLOYMENT_INVALID` | Identity mismatch on any of the four parts of §3, a non-`None` upgrade authority, or `CampaignNotFound` for a signed campaign |
| `CAMPAIGN_NOT_ACTIVE` | `CampaignNotActive` |
| `TERMS_CHANGED` | `StaleCampaignRevision` after re-resolve shows changed terms |
| `PROOF_INVALID` | `InvalidProof` |
| `NULLIFIER_USED` | `NullifierUsed` |
| `PAYMENT_REQUIRED` / `COMPLIANCE_REQUIRED` | Relayer-layer refusal before submission, under the manifest's declared offers — never `RestrictedMode` |
| `SUBMISSION_UNKNOWN` | Signature unresolvable, blockhash expired, transaction dropped; reconcile by operation ID (§11) |
| `FINALITY_PENDING` | Executed at `confirmed` but not yet `finalized` |
| `AUTHORIZATION_INVALID` | `OperatorOnly`, `SasSignerUnauthorized`; also local vault refusal before submission |
| `PROFILE_UNSUPPORTED` | Unknown profile ID, proof system, or verifier anchors |

### 4.3 Canonical wire-operation mapping

| Charity.md §7 operation | This profile's surface |
|---|---|
| `resolve-campaign` | Off-chain resolution of the signed record, verified against the `Campaign` PDA and its anchored `revision_commitment` |
| `quote-donation` | Financial provider; **no program surface** (§1) |
| `prepare-donation` | Financial provider / client; no program surface |
| `submit-donation` | Financial provider; only the finalized receipt's digest reaches `anchor_donation_receipt` |
| `read-donation` | Financial provider evidence, cross-checkable against the `DonationAnchor` PDA |
| `request-refund` | Financial provider; no program surface |
| `present-eligibility` | Local proof construction; its successful outcome is the `anchor_aid_claim` write |
| `claim-aid` | `anchor_aid_claim` — atomic with `present-eligibility`'s on-chain half |
| `read-aid-claim` | `ClaimAnchor` PDA + `AidClaimAnchored`/`DisbursementAnchored` events, alongside the operator's signed receipts |
| `read-fund-flow` | `FundFlowAnchor` PDA + the signed off-chain report whose `source_commitment` it anchors |

The absent rows are §1's scope boundary restated operation by operation.

## 5. Client-chosen 32-byte values: encoding and domain separation

The BN254 scalar field modulus is

```text
r = 21888242871839275222246405745257275088548364400416034343698204186575808495617
```

and a 32-byte word is not automatically a field element. **Modular reduction
of client-supplied words is forbidden everywhere** in this profile:
reduction is non-injective over 32 bytes, so two distinct words could share
a proof-bound field element, letting evidence bound to one authorize a
record under the other. Two encoding rules replace it, identical to the BNB
sibling's:

1. **Freely chosen identifiers are drawn in-field** by rejection sampling,
   and the program rejects out-of-range values with `ValueNotInField` at the
   entry point — `campaign_id` at registration, `nullifier` at claim
   anchoring, `policy_root` at policy registration and root update.
2. **Digests are limb-split, never reduced or ground**: keccak-256 digests
   enter the public-input vector as two 128-bit big-endian limbs
   (`hi = digest[0..16]`, `lo = digest[16..32]`), split by the program
   itself (§10), so no caller supplies a pre-encoded digest.

One Solana-specific consequence: **PDA seeds are raw bytes, and seeding does
not reduce.** A `nullifier` seed is the same 32 bytes the range check
accepted, so the aliasing route closed at the door in rule 1 stays closed at
the address layer too — `nullifier` and `nullifier + r` cannot both be
accepted, hence cannot produce two distinct nullifier accounts for one
field element.

Domain separation: every derived value carries an ASCII tag hashed into its
derivation. The tags of this profile, fixed and fixture-pinned:

```text
onym:charity:sol:nullifier:v1
onym:charity:sol:recipient-commitment:v1
onym:charity:sol:eligibility-statement:v1
```

A tag change is a profile change. Circuits bind the statement tag as a
constant, so a proof generated for any other statement family — including a
notary group-transition proof, or a BNB charity proof over the same
curve — cannot verify here even if the encoding coincides.

## 6. Nullifier derivation and scoping

The nullifier is computed **in-circuit**:

```text
nullifier = H(T_n, credentialSecret, campaignId, epochIndex)
```

where `T_n` is the field constant derived from
`onym:charity:sol:nullifier:v1`, `credentialSecret` is the private witness
bound to the beneficiary's eligibility credential, `campaignId` is the
in-field campaign identifier, and `epochIndex` is the claim window computed
from the campaign's registered schedule:

```text
epochIndex = floor((unixTimestamp - epochStart) / epochSeconds)
```

taken from the `Clock` sysvar's `unix_timestamp`, defined only for
`unixTimestamp >= epochStart` and `epochSeconds > 0`. Both preconditions are
program-enforced: `register_campaign` rejects a zero `epoch_seconds`, and a
claim before `epoch_start` fails `CampaignNotStarted`. The program requires
`epoch_index == current_epoch` at claim anchoring, else `EpochNotCurrent`
(grace behavior is an open question, §15.1).

**`H` is Poseidon, and its instance is the syscall's — not a choice.** This
is the single most consequential requirement in this document, and it is
measurement-gated. The circuit's Poseidon MUST be byte-compatible with
Solana's `sol_poseidon` syscall in field, parameters, endianness, input
framing, and domain separation, so that a commitment computed in-circuit is
reproduced deterministically on-chain. Selecting "Poseidon" on both sides
does not give this: implementations differ in all five respects, and at
least one widely used standard-library Poseidon is not byte-compatible with
the syscall. A conforming implementation MUST ship
`fix-poseidon-syscall-differential` (§14.1), and the instance parameters are
pinned by that fixture rather than restated here — a hand-copied parameter
table in prose is exactly the artifact that drifts from the syscall it
claims to match.

**Why the scoping holds — and what it rests on.** The derivation gives the
nullifier the properties Charity.md §6.7 and §13.8 require:

- *One claim per campaign per epoch*: the nullifier is deterministic for
  fixed `(credentialSecret, campaignId, epochIndex)`, so a second
  presentation in the same scope re-derives it and the Nullifier PDA already
  exists.
- *Stable across campaign revisions*: `campaignRevision` is deliberately
  **not** an input, so a policy or campaign update cannot mint a fresh
  nullifier and enable a second claim in the same window.
- *Not a cross-campaign identifier*: nullifiers for different campaigns or
  epochs differ in a hashed input, so linking them requires the credential
  secret or a break of the hash's pseudorandomness. This is a stated
  cryptographic assumption, not something a fixture can prove; the fixtures
  prove the *derivation* is scoped.
- *Not a permanent identifier*: no derivation input is a person identifier,
  `credentialSecret` never leaves the device, and no PDA seed anywhere in
  §4 is credential-derived.

The circuit MUST constrain the nullifier's derivation from the same
`credentialSecret` that satisfies the eligibility predicate; a nullifier
merely *asserted* alongside a valid predicate proof would let one credential
mint arbitrary nullifiers and claim without bound.

## 7. Atomic claim anchoring, and why nullifier accounts are permanent

Charity.md §7 places the duplicate rule at `claim-aid`. `anchor_aid_claim`
implements it in one instruction, and an instruction either succeeds
entirely or fails entirely — there is no separate verify write that could
open a time-of-check/time-of-use window. The normative order is:

1. **Restricted-mode entrypoint gate** — fails `RestrictedMode` before
   anything else, including the idempotence precheck.
2. **Account derivation checks** — every supplied account re-derives from
   its declared seeds, else `AccountNotDerived`.
3. **Idempotence precheck** — if the `ClaimAnchor` PDA exists and every
   supplied field matches it byte-for-byte, return success as a no-op: the
   stored anchor was proof-authorized when written, and re-verification buys
   nothing. If it exists with any differing field, `AnchorConflict`.
4. **Field-range checks** (§5), then **campaign status**, **revision**,
   **policy registration**, and **epoch** — each with its own named error,
   all decided before the expensive verification.
5. **Nullifier check** — if the Nullifier PDA exists, `NullifierUsed`.
6. **Proof verification** against the program-derived public-input vector
   (§10), else `InvalidProof`.
7. **State writes** — create the Nullifier PDA and the `ClaimAnchor` PDA,
   emit `AidClaimAnchored`.

Steps 3 and 5 are the two replay layers, and they cover different shapes: a
byte-identical resubmission — a retry after an unknown outcome, a replayed
transaction, a copied-instruction front-run — short-circuits at step 3
without touching the nullifier or the verifier; a *distinct* claim reusing
the entitlement lands at step 5. Without step 3, §11's "retry terminates in
an idempotent anchor" guarantee would be unsatisfiable, because the retried
claim would always meet its own consumed nullifier.

**Nullifier accounts MUST never be closed.** This has no EVM counterpart and
is the sharpest way to destroy this design's central guarantee. Solana lets
an account be closed and its rent-exemption lamports reclaimed; closing a
Nullifier PDA makes a spent entitlement claimable again, silently, with a
rent refund as the only public trace. Therefore:

- the program MUST expose no instruction that closes, reallocates to zero,
  or reassigns a Nullifier PDA, under any authority — including the
  deployment authority and including restricted mode;
- the rent-exemption deposit on a Nullifier PDA is **not a deposit**; it is
  the cost of the guarantee, and the deployment's privacy and cost
  disclosures MUST state that it is unrecoverable;
- `neg-nullifier-account-close` (§14.2) attempts closure through every
  authority the deployment holds and asserts failure;
- who pays that rent — relayer, operator, or campaign — is declared in the
  manifest, because a fee payer who cannot fund rent cannot submit claims,
  which is a liveness property beneficiaries feel.

The same reasoning applies with less force to `ClaimAnchor` PDAs: closing
one erases audit evidence rather than re-enabling a claim, and it is
prohibited under this profile ID for that reason.

One staleness gate is deliberately **not** on-chain: the `expiresAt` fields
of the eligibility presentation and the aid claim (Charity.md §6.7/§6.8) are
enforced by the verifying operator and the client before submission.
Carrying them on-chain would expand permanent public metadata to police a
bound the epoch gate already enforces more coarsely. **Beneficiary-level
credential expiry is different** and is enforced *in-circuit* (§9), because
this profile writes no per-beneficiary attestation that could carry an
expiry field (§12).

## 8. Recipient commitments

```text
recipientCommitment = keccak256(T_rc ‖ deliveryBindingDigest ‖ rho)
```

where `T_rc` is the ASCII tag of §5, `deliveryBindingDigest` is the digest
of the claim's private delivery binding (Charity.md §6.8), and `rho` is 32
bytes of fresh randomness drawn per claim and shared only with the delivery
provider. The commitment is *binding-only*: the circuit includes it as a
public input to bind it under the claimant's proof but proves nothing about
its opening.

What it hides: the delivery coordinate, and — because `rho` is fresh per
claim — whether two claims share one.

What it does **not** hide, and the UI MUST disclose before the claimant
authorizes: that a claim exists; its campaign, epoch, and timing; the join
between claim and disbursement, which is the audit trail by design; and —
this row is specific to a ledger where settlement is even possible — that if
the deployment ever declares the settlement profile of §1, the payout
address becomes public and joined to this claim. The commitment protects the
delivery *binding*, never the settlement *destination*.

## 9. Eligibility predicate families and public inputs

The initial family is `membership-set-v1`
(`onym:charity-eligibility:membership-set-groth16-bn254-v1`): the claimant
proves knowledge of `credentialSecret` such that a commitment derived from
it is a member of an issuer-published accumulator (Merkle set over Poseidon)
whose root the operator registered for the policy (`policy_root`); that the
nullifier is correctly derived (§6); and — the deviation from the BNB
sibling — that the committed **leaf expiry** is later than the campaign's
current epoch boundary.

The expiry conjunct is not optional here, and §12 explains why: this profile
writes no per-beneficiary attestation on-chain, so SAS's per-attestation
expiry field is unavailable by construction, and in-circuit expiry is the
only beneficiary-level invalidation the design has.

The full public-input vector, in order, all values BN254 field elements:

```text
 1. campaignId                      (in-field identifier, §5 rule 1)
 2. campaignRevision                (u32, trivially in-field)
 3. policyDigest.hi                 (limb, §5 rule 2)
 4. policyDigest.lo                 (limb)
 5. epochIndex                      (u64, trivially in-field)
 6. nullifier                       (in-field by construction, §6)
 7. claimDigest.hi                  (limb)
 8. claimDigest.lo                  (limb)
 9. recipientCommitment.hi          (limb)
10. recipientCommitment.lo          (limb)
11. policyRoot                      (from Policy PDA state, §4)
12. epochBoundaryUnix               (u64, program-derived from Campaign state)
```

Positions 1–10 bind the claim, 11 binds the predicate instance, and 12 binds
the expiry comparison to consensus time rather than to a prover-supplied
value. Position 12 is this profile's only public-input divergence from the
BNB sibling's vector, and it is deliberate: a prover-chosen expiry bound
would make the constraint decorative.

Family-specific extensions append after position 12 and require a new family
ID. Which additional families ship, and in what order, is an open question
(§15.3).

Proof size and byte encoding are fixed by the chosen proving toolchain
release and pinned by the conformance fixtures; this draft deliberately does
not hardcode them.

## 10. Program-derived public inputs, the verifier path, and compute

The program constructs the public-input vector itself from instruction
arguments and account state — limb-splitting digests on-chain, reading
`policy_root` from the Policy PDA, deriving `epochBoundaryUnix` from
`Campaign` — and passes the constructed vector to the verifier. The caller
never supplies a raw public-input array. The consequences are the sibling's:
a misordered or padded public-input attack is impossible by construction;
every bindable field mismatch has a named error decidable *before* the
pairing check; and `InvalidProof` therefore means exactly one thing.

Verification uses the `alt_bn128` pairing and G1 syscalls. Two properties of
this ledger make the cost a **budgeting** question rather than a feasibility
one, and both must be stated with their caveats:

1. Published upstream benchmarks for Groth16 verification on Solana
   (`groth16-solana`, cited at a pinned commit in §18) measure the plain
   verifier in the range of roughly 78k–109k compute units for one to eight
   public inputs, and the BSB22 single-commitment path at roughly 211k–242k
   over the same range, under `mollusk` with deterministically regenerated
   proofs and keys. **These are upstream measurements of a verifier, not of
   this profile's circuit.**
2. Which path applies is a property of how the circuit is generated,
   together with the public-input count and serialization overhead. The
   plain path fits inside the default per-instruction compute allocation;
   the BSB22 path requires an explicitly raised limit.

Therefore, normatively:

- The profile's release notes MUST state **which verifier path the shipped
  circuit requires**, and MUST report this circuit's measured cost against
  the corresponding upstream figure — plain against plain, BSB22 against
  BSB22 — measured under the same methodology so the two are comparable.
  Comparing against the flattering path is a reporting defect.
- The **requested compute-unit limit is fixed by the profile**, not chosen
  per client: a `ComputeBudget` instruction with the profile's declared
  limit precedes `anchor_aid_claim` in the transaction. Clients MUST NOT
  guess, and the relayer MUST NOT silently raise it — a raised limit is a
  profile revision, because it changes what a claim costs to submit.
- The measurement is a **release gate** (§17 item 5): until
  `fix-cu-benchmark` (§14.1) exists and reports a figure with its path, the
  verifier half of this profile is unpinned and no deployment may be
  declared conforming.

## 11. Submission, confirmation, finality, and forks

The relayer gains charity operations on a Solana backend (itself unbuilt;
§16). The rules:

1. **The transaction signature is mandatory and provisional.** Every write
   response carries the signature. It is provisional in a way the EVM's hash
   is not: a rebuild after blockhash expiry produces a *different signature
   for the same logical operation*, and so does any change of fee payer. The
   stable reconciliation key is the client-generated `operationId`;
   `GET /operations/:operationId` returns the current signature, every
   superseded signature, and the current status. A client that polls a
   signature and finds nothing MUST fall back to the operation query before
   concluding anything — on this ledger, "not found" is the *expected*
   result for an expired attempt, not an anomaly.
2. **Idempotency.** Duplicate client retries with the same `operationId` map
   to the same logical operation. For the claim path the program adds its
   own backstop: a byte-identical duplicate lands as a success no-op at the
   `claimDigest` precheck (§7), and a distinct claim reusing the entitlement
   fails `NullifierUsed`.
3. **Commitment levels are client-visible states.** `processed` and
   `confirmed` are progress, not finality; nothing may be shown as final
   before reconciliation at `finalized`. A UI showing a claim or
   disbursement as final at `confirmed` is non-conforming.
4. **A fork is a security event.** A previously observed anchor that does
   not survive to `finalized`, or any finalized read contradicting the
   pinned binding, is the `conflicting_state` event: preserve evidence,
   surface the incident path, MUST NOT silently resubmit. For claim writes
   the rebuild path terminates in either an idempotent identical anchor or
   `NullifierUsed`, both correct; the event is still reported.
5. **A failure is a named refusal.** Failed transactions are decoded by
   Anchor error code into §4.1's taxonomy. Program logs are diagnostics,
   never control flow — and per §4 they carry no argument values to read.
6. **Blockhash lifetime is a first-class client concern.** Proof generation
   on a low-end Android device can exceed a blockhash's validity window. The
   client MUST fetch the blockhash *after* proof generation, not before, and
   the profile permits a durable nonce account under the relayer's control
   as the fallback for slow provers (§15.6). A blockhash-expired submission
   consumed nothing and is retried as transport (§4.1).
7. **Reads need independence.** The relayer may proxy reads, but a TLS
   response from the party that submitted the write is not evidence; the
   client MUST be able to verify against a second RPC provider at the
   `finalized` commitment.

## 12. SAS credential binding and root authority

This section has no EVM counterpart. The Solana Attestation Service is a
Foundation-maintained public good whose Credential and Schema accounts carry
authorized issuer signers, versioned schemas, and per-attestation expiry.
This profile composes with it rather than re-deriving it.

The mapping onto the abstract objects, with the boundary stated where it
stops:

| Abstract object | SAS carrier | What this profile still supplies |
|---|---|---|
| `OrganizationCredential` (Charity.md §6.2) | A Credential account naming the issuing organization and its authorized signers; a Schema account fixing the attested shape | The canonical signed object and its digest. SAS proves an issuer is registered; it does not carry Onym's canonical bytes |
| `EligibilityPolicy` (§6.7) | A Schema account, versioned, referenced by campaign state | The predicate, its circuit, its public-input layout, and the nullifier derivation. SAS names a policy; it does not verify one |
| `TrustPolicy` (§6.1) | **Nothing** — it stays local to the user's application | The client check that the campaign's SAS credential is one the user pinned. "Registered in SAS" is not "accepted by this user", and issuer trust is never transitive |
| Per-beneficiary eligibility attestation | **Deliberately nothing** | The issuer-signed beneficiary leaf, delivered to the device over the Onym transport, and its membership proof |

**The empty row is normative.** A conforming deployment MUST NOT write a
per-beneficiary SAS attestation for eligibility under this profile ID.
Doing so would publish, next to a wallet address, that a named issuer
attested that subject under an aid policy — a public beneficiary roster in
all but name, which Charity.md §9.2 forbids.

Two costs follow, and both MUST appear in the deployment's privacy
disclosure rather than only here:

1. **Expiry moves into the circuit.** SAS's per-attestation expiry is
   unavailable by construction, so beneficiary-level validity is committed
   into the signed leaf and enforced in-circuit (§9, position 12).
2. **There is no per-beneficiary revocation.** Removing a credential's
   authorized signers stops *future* root extension; every leaf already
   inside a posted root stays claimable, because a membership proof is
   proved against a root that does not un-publish. An issuer that must
   withdraw one person's eligibility before it expires MUST post a new root
   under a policy whose predicate excludes them, which invalidates
   in-flight presentations built against the old root — the operator
   therefore SHOULD schedule root replacement at an epoch boundary, and the
   UI MUST surface the resulting `StaleCampaignRevision`/`InvalidProof`
   outcomes as a rebuild, never as a refusal of eligibility.

The authority chain the program enforces:

1. A SAS Credential names the organization and carries its authorized signer
   set; a SAS Schema fixes the policy and its scope.
2. The issuer signs a beneficiary commitment **off-chain**, under an
   authorized signer key of that credential, and delivers it to the device
   over the Onym transport.
3. An authorized signer posts the resulting eligibility root through
   `update_eligibility_root`.
4. The program authorizes that write by reading the campaign's registered
   SAS credential account and checking the transaction signer against its
   **current** authorized signers, so an on-chain root is only ever as
   trusted as the SAS-registered issuer behind it.

Step 4's consequence for clients is the honest cost of composing with a
mutable external account, and it MUST be carried rather than hidden:
**pinning the program does not pin who may extend the tree.** Deployment
verification therefore includes the SAS credential account (§13), and a
client that verifies the program but not the credential has verified half of
the authority model.

## 13. Operator manifest bindings

The relayer's signed operator manifest (`GET /manifest.json`, byte-served,
hash-pinned; as of this draft the deployed relayer declares Stellar notary
support only — the served bytes, not this document, are the authoritative
statement of what is declared) gains:

- `onym:charity-implementation:solana-cha-groth16-bn254-v1` in
  `implementationProfiles`;
- the `cha_anchor` deployment(s) it administers, each with genesis hash,
  program ID, program-data hash, the assertion that the upgrade authority is
  `None`, the verifying-key anchors with their ceremony identity, and the
  profile ID;
- `solana` network entries binding the ed25519 operator identity to the
  **fee-payer accounts** that pay for submission and fund rent, and to the
  **admin account** whose signature the operator-attested instructions
  accept. Solana accounts are ed25519 like the operator identity, which
  removes the EVM's cross-scheme awkwardness — the profile still MUST NOT
  conflate them: the manifest identity and an on-chain fee payer are
  different capabilities that happen to share a signature scheme, and a
  deployment that reuses one key for both MUST say so;
- the **SAS credential account** each campaign's root authority resolves to
  (§12);
- the declared **compute-unit limit** (§10) and **who funds nullifier rent**
  (§7);
- the restricted-mode power (§4); and
- a privacy profile declaring what the operator observes (IP, timing, proof
  size, submitted values), the public exposure of the chain itself, and —
  because a relayer that declines to submit is a party that can withhold aid
  without on-chain trace — the fact that claim anchoring is signer-agnostic,
  so a claimant who can pay fees or find another submitter is never locked
  out by one relayer's refusal.

Client verification MUST compare the manifest's declared admin against the
`Campaign` PDA's stored admin, the declared program-data hash against the
chain, the upgrade authority against `None`, and the declared SAS credential
against the one the campaign actually registered. Without those four
comparisons, declared powers are not checkable against program-enforced
reality. A deployment absent from the manifest does not exist for clients,
whatever is on the chain.

The governing invariant:

> The operator's keys can pay for, submit, gate, and *attest* — campaign
> records, receipt anchors, report anchors, all visibly under the campaign
> admin — and can **pause claim intake deployment-wide** through the
> restricted-mode emergency stop, a declared, auditable power equivalent to
> pausing every campaign at once. An authorized SAS signer can extend or
> replace an eligibility root. Neither can make an ineligible claimant
> eligible, consume or un-consume a nullifier, close a nullifier account,
> alter an anchored digest, or convert an anchor into proof that money moved
> or aid arrived.

## 14. Conformance fixtures

A conforming implementation ships the fixtures below, named as listed, each
executable from this section alone. The negative set is deliberately larger:
the profile's value is what it refuses.

### 14.1 Positive fixtures

- `fix-poseidon-syscall-differential` — **the gating fixture** (§6). For a
  published vector set, assert that in-circuit Poseidon commitments equal
  `sol_poseidon` output byte-for-byte, across field encoding, input framing,
  and domain separation. A failure here invalidates §6, §9, and §10.
- `fix-cu-benchmark` — measure verification cost for this profile's compiled
  circuit at its actual public-input layout, report the verifier path it
  requires, and compare against the corresponding upstream figure under the
  same methodology. Publish the harness; the figure is meaningless without
  it (§10).
- `fix-campaign-lifecycle` — register; advance 1→2; pause; advance 2→3 while
  paused; reactivate; close. Assert each event and each account read, and
  the refusals by error code: closed→active and a status byte above 3 fail
  `InvalidStatusTransition`; a revision skip fails `RevisionNotSequential`;
  advancing a closed campaign fails `CampaignNotActive`.
- `fix-claim-happy-path` — issuer publishes a set root; an authorized SAS
  signer posts it; operator registers the policy; claimant derives nullifier
  and recipient commitment and builds the `membership-set-v1` proof;
  `anchor_aid_claim` succeeds **with an arbitrary fee payer that is not the
  operator**; assert the event fields, the Nullifier PDA's existence, and
  the `ClaimAnchor` contents.
- `fix-disbursement-join` — anchor a disbursement digest against the claim;
  assert the public `claimDigest` join.
- `fix-idempotent-anchor` — re-anchor the identical donation receipt digest,
  and resubmit the byte-identical `anchor_aid_claim`. Assert both are
  success no-ops via the prechecks of §7 — the claim resubmission MUST NOT
  reach the nullifier check or the verifier — and that no account changed.
- `fix-disbursement-after-close` — anchor a claim while active, close the
  campaign, anchor its disbursement; assert success and the intact join.
  Repeat with a revoked campaign.
- `fix-cross-campaign-derivation` and `fix-cross-epoch-derivation` — one
  credential across two campaigns, and across two epochs of one campaign:
  both claims succeed and the nullifiers differ. Each fixture proves the
  *derivation is scoped*; it does not and cannot prove unlinkability, which
  rests on the hash assumption of §6 — the caveat MUST ship with the
  fixture verbatim.
- `fix-epoch-rollover-rebuild` — build in epoch *k*, cross the boundary,
  submit, receive `EpochNotCurrent`; rebuild for *k+1*; assert the new
  nullifier differs and the retry succeeds.
- `fix-blockhash-expiry-retry` — hold a built transaction past its
  blockhash's validity, submit, assert the failure classifies as
  *retry-as-transport* (§4.1), that no account changed, and that resubmission
  with a fresh blockhash succeeds under the same operation ID with a
  different signature.
- `fix-operation-reconciliation` — submit; force a rebuild that changes the
  signature; assert the original signature resolves to nothing,
  `GET /operations/:operationId` returns both, and the final result
  reconciles under the operation ID at `finalized`.
- `fix-sas-root-update` — an authorized SAS signer updates the eligibility
  root; assert the event, the new root in the Policy PDA, and that a
  presentation against the new root verifies.
- `fix-canonicalization-vectors` — the §2.1 byte-level vectors, asserted to
  be **identical to the BNB profile's** for signing inputs and canonical
  bytes, and *deliberately different* for anchor digests because the anchor
  tag differs. Both values ship side by side.

### 14.2 Negative fixtures

**Scope and duplicate refusal**

- `neg-nullifier-replay` — same credential, same campaign, same epoch, two
  distinct claims: the second fails `NullifierUsed` as a *decodable program
  error*, not a runtime account-already-in-use failure. Assert no account
  changed and that the error surface contains no value derived from the
  credential beyond the already-public nullifier.
- `neg-revision-stability` — claim at revision *n*; advance to *n+1*;
  rebuild the second attempt against *n+1* with fresh consent; assert the
  rebuilt nullifier is byte-identical and the attempt fails `NullifierUsed`.
  This is the fixture proving a policy update cannot mint a second claim.
- `neg-nullifier-account-close` — attempt to close a Nullifier PDA through
  every authority the deployment holds: the campaign admin, the deployment
  authority, an authorized SAS signer, and the rent payer, with restricted
  mode both enabled and disabled. Assert every attempt fails, that no
  instruction exists that could succeed, and — the point of the
  fixture — that the entitlement remains unclaimable afterward (§7).
- `neg-claim-anchor-close` — the same, for a `ClaimAnchor` PDA.

**Curve, system, and statement separation**

- `neg-cross-curve-bls-under-bn254` — a well-formed BLS12-381 eligibility
  proof submitted to `anchor_aid_claim`: rejected by length/decode or
  `InvalidProof`, never anchored. Until a BLS12-381 sibling profile exists,
  the vector is generated from this profile's own circuit re-instantiated
  over BLS12-381 and ships marked "sibling-encoding pending".
- `neg-cross-system-plonk-under-groth16` — a valid **BN254 PLONK** proof
  built for the BNB sibling's `membership-set-v1` statement, submitted here:
  rejected. This fixture is the one the curve check cannot supply, because
  the curve is shared with that sibling; it is required in both directions
  once the BNB circuits exist, and ships one-directional with a
  "counterpart unimplemented" marker until then.
- `neg-foreign-statement` — a valid BN254 proof for a different statement
  family of the *same* proof system (the notary `sep-*` circuits are the
  natural donor): `InvalidProof`, because the statement tag constant
  differs.

**Encoding**

- `neg-out-of-field-campaign-id`, `neg-out-of-field-nullifier`,
  `neg-out-of-field-policy-root` — each fails `ValueNotInField` at its entry
  point, before any verifier call. The `campaign_id` fixture adds the
  aliasing attack: register a valid id, then attempt `campaign_id + r` as a
  32-byte value, and assert it is rejected out-of-range rather than
  colliding — and, this ledger's addition, that no second Nullifier PDA can
  be derived from an aliased nullifier (§5).
- `neg-invalid-epoch-schedule` — `epoch_seconds == 0`: `InvalidEpochSchedule`,
  campaign absent afterward, epoch division total for every registered
  campaign.
- `neg-claim-before-start` — claim before `epoch_start`:
  `CampaignNotStarted`; then assert success after the start.
- `neg-reduction-forbidden` — feed the client SDK a 32-byte value `>= r` for
  a freely chosen identifier and assert it *redraws* rather than reduces;
  assert digests are limb-split by recomposing the limbs to the exact digest.

**Authority**

- `neg-operator-gate` — every operator-attested instruction submitted
  without the campaign admin's signature: `OperatorOnly`. Complemented
  in-fixture by the positive assertion that `anchor_aid_claim` succeeds from
  an arbitrary fee payer, proving the authority classes are distinct.
- `neg-sas-signer-removed` — an authorized signer posts a root successfully;
  the signer is removed from the SAS credential; the same signer attempts
  another root update: `SasSignerUnauthorized`. Then the fixture asserts the
  half that matters for honesty: **leaves inside the previously posted root
  remain claimable**, because removal stops extension and does not
  un-publish a root (§12).
- `neg-sas-credential-mismatch` — a root update supplying a credential
  account other than the campaign's registered one:
  `SasCredentialMismatch`.
- `neg-expired-leaf` — a beneficiary leaf whose committed expiry precedes
  the campaign's current epoch boundary: the proof fails to satisfy the
  predicate, and the claim fails `InvalidProof`. This is the fixture that
  makes §9's expiry conjunct real rather than decorative.
- `neg-upgrade-authority-retained` — a deployment whose program upgrade
  authority is not `None`: the client's deployment verification MUST refuse
  it with `DEPLOYMENT_INVALID` before first use, and the fixture asserts the
  refusal happens at verification time, not at first failure.
- `neg-account-not-derived` — an instruction supplying a look-alike account
  whose address does not re-derive from its declared seeds:
  `AccountNotDerived`.

**State protection**

- `neg-anchor-conflict` — every conflict shape: a different disbursement
  digest under an anchored `claimDigest`; a claim resubmission differing in
  one stored field; a donation re-anchor with different metadata. Each
  asserts `AnchorConflict`, nothing overwritten, and the client mapping to a
  security event rather than a retry.
- `neg-status-gate` — new claims and policy registrations against paused,
  closed, and revoked campaigns: `CampaignNotActive` with the correct status
  each time, and the exempt paths still succeeding.
- `neg-restricted-mode` — with restricted mode enabled, `anchor_aid_claim`
  fails `RestrictedMode` for a fresh claim **and** for a byte-identical
  resubmission of an anchored one (the gate precedes the precheck); every
  operator-attested write and every read still succeeds; the manifest
  declares the power; disabling restores intake without state loss.
- `neg-canonicalization-drift` — mutations of the §2.1 vectors: reordered
  members re-canonicalize identically; an added unknown critical field is
  refused before any digest is computed; a signature-only change changes the
  anchor digest while leaving the signing input unchanged; a non-JCS
  serialization is detected by byte comparison.

**PII exclusion**

- `neg-pii-in-public-state` — the strongest invariant gets the bluntest
  fixture, in three layers, over the **five surfaces this profile ID
  governs** (account data, instruction data, program logs, account addresses
  and PDA seeds, and the transaction's auxiliary instructions):
  1. *interface layer*: assert from the IDL that no instruction accepts a
     string or a variable-length payload other than `proof`, and that no
     event declares one;
  2. *client layer*: feed the SDK's anchor-preparation path objects with
     planted PII patterns (a name, an IBAN, an email, a phone number, a
     street address — the fixture ships the exact planted set) and assert
     every value reaching instruction data is a fixed-width digest,
     commitment, or field element containing none of them;
  3. *chain layer*: run the full happy path and grep **every account the
     program wrote, all instruction data, and the complete log output of
     every instruction** for the planted patterns in raw and UTF-8-decoded
     form. Zero hits passes.
  The fixture MUST additionally assert that the `encryptedRecipient` payload
  never appears in instruction data at all — sealed bytes are excluded from
  the transaction, not merely encrypted within it — and that **no PDA seed
  anywhere derives from credential-linked data** (§4).
- `neg-memo-instruction` — a transaction carrying a Memo-program
  instruction alongside `anchor_aid_claim` is non-conforming; the client
  MUST refuse to build it and the fixture asserts the refusal. A conforming
  charity transaction contains only the `ComputeBudget` instruction of §10,
  optionally a durable-nonce advance, and the program instruction itself.
- `neg-log-leak` — a harness build that adds an argument-echoing `msg!` to
  the claim path is asserted to fail the chain-layer grep, demonstrating
  that the log discipline of §4 is what the fixture actually enforces.
- `neg-fork-before-finality` — a claim anchor observed at `confirmed` that
  does not survive to `finalized`: assert the client reports
  `conflicting_state`, does not auto-resubmit, and that the manual rebuild
  path terminates in an idempotent anchor or `NullifierUsed` per §11.4.

## 15. Open questions

Each is genuinely undecided; the criteria state what settles it.

1. **Epoch boundary grace.** Should `anchor_aid_claim` accept
   `epoch_index == current_epoch - 1` within a short window after rollover?
   Accepting removes a boundary-race failure; rejecting (the current text)
   keeps "one claim per credential per epoch" exact, because a grace window
   lets one credential claim late in *k* and early in *k+1*. Decide by:
   whether pilot policies use epochs as hard entitlement windows or as rate
   limiting, and by measured proof-generation-to-inclusion tail latency on
   real devices — which on this ledger interacts with blockhash expiry
   (§11.6) rather than with fee markets.
2. **Nullifier-set construction.** This profile specifies a PDA per
   nullifier: self-contained, runtime-enforced, rent-bearing, permanent
   (§7). ZK Compression address trees prove non-membership before insertion
   at a far lower state cost, verified through the same BN254 syscalls.
   Decide by: a published measurement of compute, state cost, and
   concurrent-claim behaviour for both — **and** an explicit decision to
   accept an indexer and proof-service dependency in the path between a
   beneficiary and their aid, which is a liveness and censorship question,
   not a cost question. Promotion to the production path requires a new
   profile ID, because it changes the account model this document is written
   against.
3. **Second predicate family.** Candidates beyond `membership-set-v1`:
   revocation-aware membership (root plus non-membership in a revocation
   set — which is also the only route to the per-beneficiary revocation §12
   currently lacks), attribute threshold over an issuer-signed committed
   attribute, and richer expiry semantics. Decide by: what the first real
   eligibility issuers can attest and revoke.
4. **Trusted-setup governance.** Groth16 requires a per-circuit ceremony;
   PLONK's universal SRS does not carry over, so this is new cost the BNB
   sibling does not pay. Undecided: who runs it per circuit, who
   participates, where the transcript is published, and what happens to
   deployed campaigns when a circuit is revised. Decide by: naming an owner
   before circuits are compiled — a verifying key whose origin nobody can
   audit is a forgery surface for claims on real aid, and §3.4 requires the
   ceremony identity in `verifierAnchors`.
5. **Root-update authority resolution cost.** §12 requires the client to
   verify the SAS credential in addition to the program. Whether a mobile
   client can afford that round-trip on every campaign resolution, or
   whether the manifest may carry a signed snapshot with a declared
   staleness bound, is undecided. Decide by: measured client latency against
   the failure mode a stale snapshot permits (accepting a root posted by a
   signer removed since the snapshot).
6. **Durable nonce versus rebuild.** Whether the relayer maintains durable
   nonce accounts for slow provers, or clients always rebuild after
   blockhash expiry. Decide by: measured proof-generation time on the
   lowest-tier supported Android device against the blockhash validity
   window, and by whether a relayer-held nonce account creates a
   correlation surface worth avoiding.
7. **Fee-payer count and concentration.** How many relayer fee-payer keys, and
   whether they are declared per campaign. The count is simultaneously a
   privacy parameter (the fee payer is public on every claim and is the
   account claims contend on) and a throughput parameter (§11). Decide by:
   pilot claim rates and a written analysis of what key rotation buys
   against an observer with off-chain knowledge.
8. **Anchor timing versus small-count inference.** Anchors carry no amounts
   and no identities, but their counts and timing are public, and Charity.md
   §6.9 addresses small counts only for *reports*. Whether the operator
   SHOULD batch anchors on a declared schedule is undecided, and it is
   sharper here than on the siblings because a future settlement binding
   would batch money as well as claims. Decide by: pilot community sizes and
   a written analysis; batching MUST NOT be promised as a mitigation before
   that analysis exists.
9. **Campaign-scoped fields in claim anchors.** Charity.md §6.8 says public
   state "may contain only the claim digest, scoped nullifier, and recipient
   commitment required by the profile"; this profile's claim anchor also
   carries `campaign_id`, `campaign_revision`, and `epoch_index`. The BNB
   profile flags the same reading upstream (§14.4 there) and this profile
   inherits it unchanged: campaign-scoped, not beneficiary-scoped, flagged
   rather than silently assumed.
10. **Disbursement anchor authority.** As on the sibling,
    `anchor_disbursement` is operator-attested; a claimant-countersigned
    variant would prevent an operator anchoring a disbursement the claimant
    disputes. Decide by: whether UI-Charity.md §5.4/§5.6 gains a signed
    acknowledgment object.

## 16. Current implementation gaps

Everything below is unbuilt; this list is the work plan, not a polish list:

- **Programs**: `onym-contracts` contains no charity Solana program — no
  `cha_anchor`, no verifier integration, no error enum, no events.
- **Circuits**: no `membership-set-v1` constraint system over BN254, no
  Groth16 setup, no verifying keys, no ceremony, and no Poseidon instance
  selection validated against `sol_poseidon`.
- **Prover**: the mobile Rust FFI has **no BN254 Groth16 backend**. This gap
  is *not* shared with the BNB profile: that profile needs BN254 PLONK, and
  the existing `plonk/prover` in `onym-contracts` is TurboPLONK over
  BLS12-381. Nothing in the repository is reused by this profile except
  canonicalization.
- **Relayer**: `onym-relayer` has no charity operations and no Solana
  backend — no transaction building, no fee-payer key management, no
  blockhash or durable-nonce handling, no commitment-level reconciliation,
  no fork watching. No other Onym binding shares this backend today.
- **Measurements**: neither gating measurement exists — no Poseidon
  differential test, no compute-unit benchmark of a compiled circuit (§10).
- **SAS integration**: no credential, no schema, no issuer, and no client
  code that resolves either.
- **Clients**: no charity module implements the UI-Charity.md port.
- **Fixtures**: none of §14 exists in any repository.

## 17. Acceptance criteria

This profile is satisfied when:

1. a `cha_anchor` deployment is bound to genesis hash, program ID,
   program-data hash, and an upgrade authority of `None`, with verifying-key
   anchors and ceremony identity, and a client verifies all of it — plus the
   campaign's SAS credential — against the signed manifest before first use;
2. the write-authority classes are program-enforced: operator-attested
   instructions refuse absent the campaign admin's signature, root updates
   refuse signers absent from the SAS credential, and claim anchoring
   succeeds from an arbitrary fee payer on proof validity alone;
3. one credential yields exactly one anchored claim per campaign per epoch,
   across campaign revisions, proven by the §14.2 scope fixtures — and no
   authority can close a nullifier account to undo that;
4. every error in §4.1 is a distinct decodable code whose mapped retry class
   the client implements, including the three non-program conditions
   classified rather than surfaced as claim failures;
5. both gating measurements are published: `fix-poseidon-syscall-differential`
   passes, and `fix-cu-benchmark` reports this circuit's cost with its
   verifier path against the corresponding upstream figure (§10);
6. cross-curve, cross-proof-system, and cross-statement proofs are rejected
   in fixtures — the middle one on its own terms, since the curve check
   cannot separate this profile from its BN254 sibling;
7. the §14.2 PII fixture passes at all three layers across all five
   surfaces, with no PDA seed derived from credential-linked data and no
   memo instruction present;
8. write reconciliation survives blockhash expiry, rebuilds, unknown
   outcomes, and pre-finality forks with the operation ID as the stable key
   and `conflicting_state` treated as a security event; and
9. a third-party client, relayer, RPC provider, and deployment interoperate
   from the published profile and fixtures alone.

## 18. References

1. Technology-neutral charity boundary: [Charity.md](Charity.md)
2. Messenger application profile: [UI-Charity.md](UI-Charity.md)
3. BNB/EVM charity implementation profile — the sibling this document
   mirrors: [UI-Charity-BNB.md](UI-Charity-BNB.md)
4. Abstract notary boundary: [../notary/UI-Notary.md](../notary/UI-Notary.md)
5. Onym contracts repository: <https://github.com/onymchat/onym-contracts>
6. Onym transaction relayer: <https://github.com/onymchat/onym-relayer>
7. RFC 8785, JSON Canonicalization Scheme (JCS):
   <https://www.rfc-editor.org/rfc/rfc8785>
8. Solana Attestation Service: <https://attest.solana.com>
9. `groth16-solana` — the upstream Groth16 verifier and its published
   compute-unit benchmarks. Cite the repository at a **pinned commit**, not
   crates.io or docs.rs: published crate metadata and secondary sources
   carry stale figures and stale paths.
   <https://github.com/Lightprotocol/groth16-solana>
10. Solana `alt_bn128` and `poseidon` syscalls, and the Compute Budget
    program: <https://docs.solana.com>
