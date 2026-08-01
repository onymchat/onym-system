# Onym UI ↔ Notary Boundary

**Architecture draft 0.2 — August 2026**

> The UI presents intent. The notary decides whether shared state may change.
> Neither becomes the owner of the other.

This document defines the technology-neutral boundary between an Onym
frontend and a notary. It does not require a blockchain, smart contract,
specific proof system, ledger address, transaction format, or RPC protocol.

A notary implementation may use a replicated state machine, public smart
contract, threshold-operated service, verifiable log, or another mechanism
that satisfies the profile's state, authorization, evidence, and consistency
requirements. The current Stellar/Soroban implementation is specified
separately in [UI-Notary-Stellar.md](UI-Notary-Stellar.md).

Here **UI** means the frontend application layer, not a screen calling a notary
endpoint directly. Views send user intent to flows, view-models, repositories,
or interactors. Those components obtain current state, construct authorization
evidence, and invoke a narrow notary port.

## 1. Decision

Onym treats the UI, policy implementation, notary deployment, and submission
provider as independently owned components joined by versioned protocols.

- The **UI owner** controls presentation, local orchestration, billing
  integration, supported profiles, and release distribution.
- The **policy author** controls the semantics and version of a governance
  rule and its authorization-evidence schema.
- The **notary operator** controls a deployment, availability, retention,
  operational policy, and offers, but only within the authority declared by
  its profile.
- The **submission provider** transports operations and may supply execution
  resources or fees. It is not automatically an authority over validity.
- The **read provider** serves state and evidence. It is an observer, not an
  alternative canonical source unless the profile explicitly says otherwise.
- The **group** selects and pins its notary binding and owns any governed
  migration decision.

One organization may occupy several roles, but their authorities and payment
offers remain logically separate. A group created through one conforming UI
must remain under the same notary binding when opened in another. A frontend
may support several notary profiles. A notary may serve several frontends
without making their publisher an authority over group state.

## 2. What the notary does

The notary answers narrow questions about shared state:

1. Does a state object already exist under this identifier?
2. What canonical state and revision does it currently have?
3. Is this proposed transition authorized under the pinned policy and prior
   state?
4. If accepted, what is the next canonical state and revision?
5. Is a supplied statement valid against a selected state snapshot?
6. What verifiable evidence supports the answer?

The notary does not carry chat ciphertext, store local identity secrets,
interpret UI navigation, resolve human names, sell app-store products, or
decide which transport delivers a message.

The minimum Onym group state is an opaque state commitment and monotonic
revision. A policy may add explicitly public committed values—such as an
occupancy commitment, authority commitment, threshold, status, or policy
version—but must declare each field and its privacy effect.

## 3. Why this boundary is necessary

### 3.1 It prevents the UI from becoming the real administrator

If governance rules exist only in frontend code or the frontend publisher's
server, an apparently open application retains a hidden kill switch. A pinned
notary profile makes transition validity independent of later UI releases,
defaults, and company policy.

### 3.2 It prevents the notary from capturing the user experience

The notary should know only the state, revision, evidence, and public policy
metadata needed to validate its rule. It should not know screen routes,
contacts, local message history, app-store accounts, transport topics, or
which client brand assembled an operation.

### 3.3 It makes the authorization seam reviewable

A mathematically valid proof or signature can still authorize the wrong
operation if a state-changing parameter is not bound to it. Every profile must
enumerate:

1. the user's displayed intent;
2. the canonical operation bytes;
3. the expected prior state and revision;
4. the proposed next state;
5. every public input or authenticated parameter;
6. provider-controlled inputs;
7. the exact authorization predicate; and
8. the canonical state and evidence produced after acceptance.

### 3.4 It supports independent ownership and payment

Each seat defines its own service model. A notary operator may be free,
subscription-funded, funded by an institution, or charge per retained state
or transition. A submission provider may charge separately for transport,
execution resources, or fees. The UI decides which offers it can present.
Payment buys the declared service; it does not change authorization validity.

### 3.5 It isolates failure

- A broken UI can be replaced without moving canonical group state.
- A censoring submission provider can be replaced when the binding permits
  another compatible path.
- A failing read provider can be replaced without choosing a new canonical
  state.
- A policy defect requires explicit migration or recovery, not a silent
  frontend redirect.
- A payment outage does not make an invalid transition valid or roll back an
  accepted one.

## 4. Logical topology

```text
┌──────────────────────────────────────────────────────────────────────┐
│ UI process                                                           │
│                                                                      │
│ View / Composable                                                    │
│        │ user intent                                                 │
│        v                                                             │
│ Flow / ViewModel                                                     │
│        │ application command                                        │
│        v                                                             │
│ Repository / Interactor                                              │
│        ├────────> Identity vault: scoped signing capability          │
│        ├────────> Evidence adapter: proof / quorum / capability      │
│        ├────────> State reader: snapshot + canonical evidence        │
│        └────────> Notary port: canonical operation                   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ implementation-neutral protocol
                               v
                    ┌────────────────────────┐
                    │ Submission provider    │
                    │ validate · queue · fund│
                    └───────────┬────────────┘
                                │ canonical invocation
                                v
                    ┌────────────────────────┐
                    │ Notary policy engine   │
                    │ verify evidence + state│
                    │ accept or reject       │
                    └───────────┬────────────┘
                                │ canonical record / evidence
                                v
                    ┌────────────────────────┐
                    │ Read provider(s)       │
                    │ snapshot · history     │
                    └───────────┬────────────┘
                                │ independently checked observation
                                v
                         local reconciliation
```

This diagram is logical. An implementation may combine the submission,
execution, record, and read roles or distribute them across many parties.
Combining roles does not combine their authority in the abstract protocol.

The submission provider can refuse, delay, duplicate, reorder, or fail to
submit an operation. It must not be able to make an invalid operation valid.
A read response is not trusted merely because it uses an authenticated
connection; the profile defines how the UI verifies canonical evidence.

## 5. Boundary objects

### 5.1 Notary Profile

A `NotaryProfile` defines policy meaning independently of a deployment:

```json
{
  "profileVersion": 1,
  "profileId": "onym:notary-profile:<policy-family>-v1",
  "interface": "onym-notary-v1",
  "policy": "<governance-policy-id>",
  "operations": [
    "create-state",
    "read-state",
    "transition-state",
    "verify-statement",
    "read-history"
  ],
  "stateSchema": "<content-addressed-schema>",
  "operationSchemas": "<content-addressed-schema-set>",
  "authorization": {
    "scheme": "<proof-signature-or-capability-scheme>",
    "statementSchemas": "<content-addressed-schema-set>"
  },
  "consistency": {
    "model": "<declared-model>",
    "finality": "<declared-finality-rule>",
    "evidence": "<canonical-evidence-schema>"
  },
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes meanings, byte shapes, verification rules, consistency, and
evidence. It does not select an operator, endpoint, backend technology,
deployment identifier, price, or frontend.

Two deployments are profile-compatible only if a conforming client can
produce, submit, read, and verify the same logical operations and evidence.
Similar marketing language or shared function names are not compatibility.

### 5.2 Notary Deployment

A `NotaryDeployment` binds a profile to an operated system:

```json
{
  "deploymentVersion": 1,
  "deploymentId": "onym:notary:<deployment-id>",
  "profileId": "onym:notary-profile:<policy-family>-v1",
  "operator": "onym:key:<notary-provider>",
  "backend": {
    "kind": "<implementation-profile-id>",
    "namespace": "<backend-namespace>",
    "instance": "<backend-instance-id>",
    "implementationHash": "<code-config-or-rules-hash>"
  },
  "submitEndpoints": ["<submission-component-id>"],
  "readEndpoints": ["<read-component-id>"],
  "evidenceRoots": ["<verification-root-or-key>"],
  "availabilityProfile": "<hash-or-url>",
  "privacyProfile": "<hash-or-url>",
  "offers": ["<offer-id>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<notary-provider-signature>"
}
```

The UI verifies the profile, operator signature, backend binding,
implementation identity, evidence roots, and validity period before offering
the deployment. A directory entry or friendly name is insufficient.

The deployment manifest declares operator powers. If the operator can upgrade
rules, pause transitions, censor creation, rewrite state, rotate verification
material, or delete history, those powers must be explicit and reflected in
the trust and migration model.

### 5.3 Group Notary Binding

At creation, the group pins the state it considers canonical:

```json
{
  "bindingVersion": 1,
  "groupId": "<opaque-group-id>",
  "deploymentId": "onym:notary:<deployment-id>",
  "profileId": "onym:notary-profile:<policy-family>-v1",
  "backendNamespace": "<backend-namespace>",
  "backendInstance": "<backend-instance-id>",
  "policy": "<governance-policy-id>",
  "genesis": {
    "revision": 0,
    "stateCommitment": "<opaque-commitment>",
    "canonicalReference": "<creation-reference>",
    "evidence": "<creation-evidence>"
  }
}
```

The binding is durable group state. The UI must not replace it because another
deployment is cheaper, newer, more available, or preferred by its publisher.
A settings change affects new groups only. An existing binding changes solely
through its declared migration or recovery protocol.

### 5.4 State Snapshot

Every read normalizes into a `NotaryStateSnapshot`:

```json
{
  "snapshotVersion": 1,
  "groupId": "<opaque-group-id>",
  "deploymentId": "onym:notary:<deployment-id>",
  "profileId": "onym:notary-profile:<policy-family>-v1",
  "revision": 12,
  "stateCommitment": "<opaque-commitment>",
  "policyState": {
    "status": "active",
    "publicValues": "<profile-defined-object>"
  },
  "canonicalReference": "<backend-reference>",
  "observedAt": "<client-observation-time>",
  "evidence": "<canonical-evidence>"
}
```

`observedAt` is not canonical time. The profile defines which fields are
authoritative, how evidence is verified, and how stale or conflicting reads
are detected. Optional public values must never be guessed or defaulted when
their absence changes policy meaning.

### 5.5 Notary Operation

The UI-side adapter constructs a canonical operation before choosing a
physical submission provider:

```json
{
  "operationVersion": 1,
  "operationId": "<random-id>",
  "deploymentId": "onym:notary:<deployment-id>",
  "profileId": "onym:notary-profile:<policy-family>-v1",
  "groupId": "<opaque-group-id>",
  "operation": "transition-state",
  "expected": {
    "revision": 12,
    "stateCommitment": "<old-commitment>",
    "policyStateDigest": "<old-policy-state-digest>"
  },
  "proposed": {
    "revision": 13,
    "stateCommitment": "<new-commitment>",
    "policyState": "<profile-defined-next-values>"
  },
  "authorizationEvidence": {
    "scheme": "<profile-defined-scheme>",
    "statementSchema": "<schema-id>",
    "statement": "<canonical-public-statement>",
    "evidence": "<proof-signatures-or-capability>"
  },
  "clientNonce": "<random-or-profile-defined-nonce>",
  "expiresAt": "<optional-expiry>",
  "entitlement": "<submission-or-notary-entitlement-or-null>"
}
```

The `expected` object is a precondition, not descriptive metadata. The notary
must compare the operation's prior state to canonical state before accepting a
transition. The authorization statement must bind every proposed value that
the policy depends on. A profile that derives next revision or other values
inside the notary must say so and forbid conflicting caller-supplied values.

`operationId` supports idempotency and diagnosis. It does not become an
authority unless the profile binds it into replay protection.

### 5.6 Notary Receipt

A submission response distinguishes transport progress from canonical state:

```json
{
  "operationId": "<same-random-id>",
  "status": "submitted",
  "submissionProvider": "onym:component:<submitter-id>",
  "submissionReference": "<provider-reference>",
  "canonicalReference": null,
  "acceptedRevision": null,
  "acceptedStateCommitment": null,
  "evidence": null
}
```

Valid statuses are profile-mapped forms of:

- `received`: the provider parsed the request;
- `submitted`: the provider sent it toward the canonical notary;
- `accepted`: the policy engine accepted and recorded it;
- `finalized`: it satisfies the binding's finality rule;
- `rejected`: a named policy or execution rule refused it; and
- `unknown`: outcome cannot yet be determined safely.

An HTTP success is not finality. `accepted` and `finalized` may be equivalent
only when the profile explicitly defines immediate finality and supplies
verifiable evidence. The UI reconciles the receipt with an independently
verified state snapshot before committing durable local state.

## 6. Common notary surface

The technology-neutral port exposes semantic operations rather than backend
function names:

| Operation | Class | Meaning |
|---|---|---|
| `createState` | Write | Create revision zero under a pinned profile and genesis commitment |
| `readState` | Read | Return canonical snapshot and evidence |
| `transitionState` | Write | Validate expected prior state and authorization, then record next state |
| `verifyStatement` | Verification | Check profile-defined evidence against a selected snapshot without mutating state |
| `readHistory` | Read | Return verifiable retained transitions when supported |
| `maintainState` | Maintenance | Preserve backend availability without changing policy state |
| `readCapabilities` | Discovery | Return signed profile/deployment capabilities, never inferred behavior |

Not every policy supports transition, history, or maintenance. An immutable
two-party policy, for example, may support creation, reads, and membership
verification but no post-creation transition. Capability flags are explicit;
the UI must not infer support from another profile.

Provider administration—such as onboarding, restricted creation, billing,
capacity, or deployment upgrades—is not ordinary group governance. It belongs
to a separate administrative surface with separately disclosed authority.

## 7. UI/application obligations

A conforming frontend and notary adapter must:

1. verify the `NotaryProfile`, deployment, signatures, implementation binding,
   and evidence roots;
2. pin the complete group binding at creation or join;
3. read and verify current canonical state before constructing a transition;
4. show governance semantics, operator powers, consistency/finality, public
   metadata, availability, and expected fees;
5. construct authorization evidence locally through a narrow adapter;
6. keep private keys, BIP-39 material, group secrets, witnesses, Merkle paths,
   and unnecessary proof internals outside UI state, logs, payment objects,
   and submission metadata;
7. serialize the exact operation and public statement defined by the profile;
8. confirm that displayed intent matches every state-changing field;
9. preserve machine-readable provider, policy, evidence, and finality errors;
10. retry stale-state failure only after reading state and rebuilding evidence;
11. preserve operation identity for safe unknown-outcome recovery;
12. reconcile against canonical evidence before committing optimistic state;
13. reject invitations or announcements whose claimed binding and state cannot
    be verified;
14. support export of the binding, profile, and required verification roots;
15. require explicit governed migration before changing a binding; and
16. never select a notary or submitter merely to maximize frontend commission.

The screen itself should not perform these tasks. Domain interactors coordinate
the identity, evidence, notary, payment, and persistence ports.

## 8. Notary profile obligations

A conforming profile must:

1. define state and transition semantics unambiguously;
2. define canonical identifiers, encodings, operation arguments, results, and
   evidence;
3. define each authorization statement and every public input in order;
4. bind every authorized state-changing value into evidence or an explicitly
   authenticated notary input;
5. compare prior canonical state and reject stale or replayed transitions;
6. define replay protection, idempotency, and unknown-outcome recovery;
7. reject malformed lengths, encodings, policy values, and unsupported
   operations;
8. emit enough deterministic evidence for independent reconciliation;
9. define consistency, finality, conflict, reorganization, and rollback
   behavior;
10. separate deployment-operator powers from group-state authority;
11. publish metadata exposure, retention, history, shutdown, upgrade, and
    recovery behavior; and
12. define migration into and out of the profile.

The profile must not require an Onym UI publisher signature for ordinary group
validity unless it openly defines that publisher as an authority. Core Onym
profiles should derive validity from group evidence and pinned policy, not the
brand of client that assembled an operation.

## 9. Submission and read provider obligations

A conforming submission provider must:

- validate envelope size and profile compatibility before expensive work;
- preserve the exact canonical operation or expose any deterministic mapping;
- distinguish parse, queue, submit, accept, finalize, and unknown outcomes;
- prevent duplicate retry from becoming duplicate logical execution;
- return structured refusal and payment requirements;
- scope credentials to its own component and endpoint;
- avoid logging secrets or unnecessary public statement data; and
- never claim its response is canonical evidence unless the profile makes it
  independently verifiable.

A conforming read provider must:

- return snapshots with canonical references and verification evidence;
- expose freshness or checkpoint information;
- support comparison across independent providers where the profile permits;
- never silently synthesize missing policy fields; and
- make stale, pruned, archived, unavailable, and invalid evidence distinct.

## 10. Payment at the UI ↔ notary boundary

Notary, submission, read, and evidence-generation providers are separate seats
and may publish separate offers:

- a notary may charge for creation, retained state, transitions, or a service
  period;
- a submission provider may charge for routing, execution resources, or fees;
- a read provider may charge for queries, indexing, history, or availability;
- an evidence service may charge for computation while never receiving the
  secret witness if local generation is required by the profile.

### 10.1 Off-path entitlement

The provider can reject with a canonical `PaymentRequired`. The UI uses its
billing adapter; the broker validates payment and issues a component-scoped
`SeatEntitlement`; the UI retries the same logical operation.

```text
UI -> provider: NotaryOperation
UI <- provider: PaymentRequired(component + signed offer)
UI -> billing channel: purchase
UI <- billing broker: SeatEntitlement
UI -> provider: same logical operation + entitlement
UI <- provider: submitted / accepted / rejected receipt
UI -> read path: verify canonical state and finality
```

Store transaction identifiers, app-store accounts, and global identity keys do
not belong in authorization evidence, public state, history, or canonical
records.

### 10.2 Native implementation fee

An implementation may require a fee within its own canonical operation. This
can make payment publicly linkable to group activity. The implementation
profile must disclose the asset or unit, payer, recipient, visibility, refund
behavior, resource estimation, and whether the payment is authorization-bound.

### 10.3 Payment does not change validity

Payment answers whether a provider will submit, execute, retain, or serve the
operation. It never answers whether the transition satisfies group policy. A
paid invalid operation remains invalid. A valid but unpaid operation may use
another compatible provider when the pinned deployment permits it.

## 11. Errors and state machine

The adapter normalizes failures without erasing origin:

| Error | Origin | UI response |
|---|---|---|
| `unsupported_profile` | Client/profile | Refuse and explain required version |
| `deployment_mismatch` | Client verification | Refuse; never silently redirect |
| `binding_mismatch` | Operation/client | Refuse and preserve pinned binding |
| `payment_required` | Provider | Present referenced signed seat offer |
| `auth_required` | Provider | Perform component-scoped authentication |
| `invalid_entitlement` | Provider/broker | Refresh or repurchase; do not submit |
| `state_exists` | Policy engine | Reconcile the existing genesis state; do not overwrite |
| `state_not_found` | Policy engine/read path | Refuse the operation or verify creation status |
| `invalid_evidence` | Policy engine | Reject; regenerate only from verified state |
| `public_input_mismatch` | Policy engine | Treat as implementation or malicious-input error |
| `stale_revision` | Policy engine | Refresh state and rebuild authorization evidence |
| `replay` | Policy engine | Reconcile original operation; do not blind-retry |
| `unauthorized` | Policy engine | Explain policy; do not retry without changed evidence |
| `submission_failed` | Provider/network | Preserve operation ID and safely try another path |
| `outcome_unknown` | Provider/network | Query by operation/reference before resubmission |
| `finality_timeout` | Canonical system/read path | Keep state pending |
| `conflicting_state` | Read/reconciliation | Quarantine and surface a security error |
| `state_unavailable` | Read/provider | Distinguish temporary, archived, pruned, and lost state |

Local write state:

```text
draft
  -> state_verified
  -> evidence_ready
  -> payment_required? -> entitled
  -> submitted
  -> accepted
  -> finalized
  -> snapshot_verified
  -> committed_locally
```

Only `snapshot_verified` authorizes durable local reconciliation. A profile
with immediate finality may collapse `accepted` and `finalized`, but it may not
skip evidence verification.

## 12. Security and privacy invariants

1. **Secrets stay at the edge.** Private keys, seed material, group secrets,
   witnesses, and unneeded paths stay inside identity and evidence boundaries.
2. **Every changed value is authorized.** Evidence or explicit authenticated
   input binds prior state, next state, group identifier, revision, policy
   authority, and every policy-dependent public value.
3. **Expected state is enforced.** A transition built against stale state is
   rejected rather than applied to a different revision.
4. **The submitter is not an oracle.** Its success response is not canonical
   state without independently verified evidence.
5. **The binding is sticky.** UI, directory, price, default, or endpoint changes
   cannot silently move an existing group.
6. **Payment and identity are scoped.** Billing evidence and access keys do not
   reveal global identity, transport topics, or message relationships.
7. **Errors fail closed.** Decode, evidence, read, consistency, and finality
   failures never mean verification passed.
8. **Optimism is reversible.** UI progress may be optimistic; durable group
   state changes only after reconciliation.
9. **Operator powers are bounded and visible.** Service controls do not imply
   group-state authority.
10. **History is not secretly stronger than declared.** Pruned or unavailable
    history cannot be presented as complete.
11. **Maintenance is not governance.** Availability renewal cannot change the
    committed group state or authorization policy.
12. **Migration is an authorized transition.** No provider or frontend may
    redirect canonical state outside the pinned recovery rules.

## 13. Consistency and reconciliation

Every implementation profile declares one consistency and finality model. At a
minimum it defines:

- what uniquely identifies a canonical state version;
- whether forks or conflicting accepted versions can occur;
- when a version is final enough for local commitment;
- what evidence proves inclusion and finality;
- how a client detects stale, equivocated, or rolled-back reads;
- how long evidence remains verifiable;
- whether history can be pruned or archived; and
- what the UI does when providers disagree.

The UI stores the last verified canonical reference and revision. A later
snapshot with a lower revision, incompatible predecessor, invalid evidence, or
different state at the same supposedly final revision is a security event, not
ordinary cache staleness.

Caching can reduce read load but must be bounded and labeled. Cached state may
defer progress; it must not cause a transition or incoming announcement to be
accepted as current after its freshness policy expires.

## 14. Migration and recovery

A migration protocol states:

1. who can authorize migration under the old policy;
2. the old final state and canonical evidence being exported;
3. the new profile and deployment being selected;
4. how the new genesis state binds the old final state;
5. how incomplete or disputed migration is resolved;
6. whether a rollback window exists;
7. how clients discover the migration without trusting one UI; and
8. what happens when the old notary is unavailable.

Migration should preserve group identity only when both profiles define a
verifiable continuity statement. Otherwise the UI presents the result as a
new group linked by an explicit claim, not the same group by assumption.

Emergency recovery powers are part of the original profile. They cannot be
invented after deployment merely because recovery would be convenient.

## 15. Versioning and conformance

- `NotaryProfile` changes when state, operation, authorization, evidence,
  consistency, finality, or error meaning changes.
- `NotaryDeployment` changes when endpoints, operator metadata, implementation
  identity, evidence roots, capabilities, or offers change.
- Existing group bindings remain pinned to their selected profile version and
  deployment until governed migration.
- Unknown policies are never interpreted as a known policy with defaults.
- Optional fields may be ignored only when the profile says their absence
  cannot change authorization or reconciliation.
- Ordered public statements require content-addressed schemas; matching vector
  length is insufficient.
- Conformance fixtures cover state encoding, operation bytes, authorization
  statements, replay, stale state, errors, receipts, finality, conflicting
  reads, migration, and payment interruption.
- Each concrete implementation publishes a mapping from every abstract object,
  operation, status, error, and invariant to its physical protocol.

## 16. Concrete implementation profiles

This specification is deliberately incomplete without an implementation
profile. A profile must state how the abstract boundary becomes executable.

The current implementation is:

- [UI-Notary-Stellar.md](UI-Notary-Stellar.md) — Stellar network, Soroban
  contracts, PLONK evidence, HTTP fee-paying relayer, and Stellar RPC/read
  reconciliation.

Future profiles may use different canonical systems while preserving the same
UI-facing semantics. They must not reuse the same profile ID if state,
authorization, finality, or migration meaning differs.

## 17. Acceptance criteria

The UI ↔ notary boundary is successfully separated when:

1. a third-party UI can create, read, transition, verify, and reconcile state
   using public profiles and conformance tests;
2. a conforming UI can use another compatible deployment without changing
   view or domain logic;
3. a group can replace a submission or read provider without changing its
   binding when the implementation profile permits it;
4. no implementation-specific address, transaction, RPC, fee, storage, or
   finality type leaks through the abstract notary port;
5. every state-changing intent has a documented state/evidence binding table;
6. no UI publisher, billing account, submitter, or store identity is required
   for ordinary group validity;
7. an operation cannot be shown as complete before canonical evidence and
   finality are reconciled;
8. payment refusal is distinguishable from authorization invalidity;
9. an existing group cannot be redirected by a manifest, default, or UI update;
10. a second backend technology can implement the abstract conformance suite
    without pretending to be the first; and
11. migration continuity is verified rather than inferred from matching group
    names or identifiers.

## 18. Justification in one sentence

> Separating UI from notary lets people replace the software that presents a
> group without replacing the public rules that own its shared state—and lets
> them replace service infrastructure without granting it authority over those
> rules.
