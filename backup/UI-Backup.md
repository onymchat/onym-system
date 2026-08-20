---
status: draft
proposed: Claude & @rinat-enikeev
date: 11.08.2026
---

# Onym UI ↔ Device Backup Boundary

**Architecture draft 0.1 — August 2026**

> The device seals its own history. A backup operator retains opaque snapshots
> under terms it published before the first byte arrived. It holds no key, no
> seed, and no path to open what it stores.

This document defines the technology-neutral boundary between an Onym frontend
and an operator that retains a copy of that frontend's local state so a lost,
stolen, replaced, or wiped device does not mean a lost history. It does not
require a particular hash, encryption algorithm, chunking strategy, request
protocol, storage engine, or billing rail.

A concrete implementation may use object storage, a content-addressed network,
an institutional archive, a self-hosted server, removable media, or another
mechanism that satisfies the profile's opacity, integrity, retention,
erasure, export, and error semantics.
[UI-Backup-Object-HTTP.md](UI-Backup-Object-HTTP.md) is the first such profile;
§17 records what any profile must settle and what that one still leaves open.

Here **UI** means the frontend application layer, not a screen issuing a
network request. Views send intent to flows, view-models, repositories, or
interactors. Those components decide what is eligible, seal it, and address it
before invoking the backup port.

This seat is deliberately narrow, and two neighbours define it by contrast.
[../identity/UI-Identity.md](../identity/UI-Identity.md) and
[../recovery/Recovery-Trustee.md](../recovery/Recovery-Trustee.md) cover the
root secret and the authority to act as a person; **this boundary never carries
seed material and never restores an identity** (§16.1). Live encrypted
attachments belong to [../blob/UI-Blob.md](../blob/UI-Blob.md) and sealed
messages in flight to [../message/UI-Message.md](../message/UI-Message.md);
this boundary retains a device's own archive of what it already holds.

## 1. Decision

Onym treats the UI, the local backup composer, the backup adapter, and the
retention operator as independently owned components joined by versioned
interfaces.

- The **UI owner** controls what is eligible for backup, the consent surface,
  scheduling, local preparation, billing integration, and supported profiles.
- The **application-protocol author** controls snapshot composition, sealing,
  key derivation, and the restore validation rules.
- The **backup-adapter author** maps the common Onym port to a concrete
  retention protocol.
- The **backup operator** owns endpoints, capacity, declared retention,
  erasure execution, jurisdictions, sub-processors, availability, breach
  disclosure, and its payment model.
- The **user** decides whether a backup exists at all, under which declared
  terms, for how long, and when it is destroyed.

One organization may occupy several roles, but their authorities remain
separate. A person can change UI and still restore an existing snapshot. A UI
can use a compatible third-party operator without importing its SDK. An
operator can serve several frontends without learning what it stores.

The boundary has two interfaces:

1. the local **UI/application ↔ backup adapter** port, which carries sealed
   snapshot bytes, snapshot references, declared-policy bindings, restore
   authorizations, erasure requests, and typed outcomes; and
2. the network **backup adapter ↔ operator** implementation profile, which
   defines request framing, retrieval, authorization, payment refusal, limits,
   receipts, retention observations, erasure, and export.

Neither interface may carry plaintext state, message plaintext, contact
labels, filenames, group secrets, decryption keys, recovery artifacts, or seed
material. A backup that requires any of those to be legible by the operator is
not an implementation of this contract.

## 2. What device backup does

The base backup port can:

1. validate and connect to a selected operator under a verified manifest and a
   pinned declared policy;
2. upload an already sealed snapshot, whole or as opaque increments, under a
   declared snapshot reference;
3. list the snapshots the holder's own access key can enumerate;
4. retrieve a snapshot's sealed bytes for restore on a device that proves
   possession of the holder's backup key;
5. request erasure of a snapshot or of every snapshot under the access key;
6. export every retained snapshot in the profile's portable form for migration
   to another operator or to the person's own storage; and
7. report retention, availability, refusal, erasure, and uncertainty per
   operation.

It does not compose snapshots, seal or open application state, hold keys,
derive key material, interpret history, decide what is eligible, authenticate
group membership, restore an identity, adjudicate a report, or authorize
notary state.

## 3. Why this boundary is necessary

### 3.1 Durability is the one service that outlives its own consent

Every other seat in this system handles data in motion or under a live
selection: stop paying a courier and the courier stops carrying. A backup's
product is a copy that persists precisely when the person is absent — after a
device is lost, a subscription lapses, or attention moves on. Terms that can be
restated after the data arrives are therefore not a pricing detail but the
whole substance of the seat, which is why §5.4 pins them to the snapshot and
§10 forbids retroactive extension.

### 3.2 It prevents an archive from becoming an account

An operator that can reset access to a history has taken custody of it. This
boundary requires restore to prove possession of holder-held key material and
forbids an operator-controlled reset path (§11). An operator that offers one is
not filling this seat; it has moved into the recovery and custody boundaries,
where that capability is disclosed as custodial (§16.1).

### 3.3 It keeps a longer-lived copy under the same opacity rule as a shorter one

The courier cannot read the letter, and neither can the storage provider. A
copy that lives for years earns a stronger obligation than one that lives for
days, not a weaker one, so the snapshot crosses the boundary sealed with fresh
key material and addressed by a digest over the sealed bytes.

### 3.4 It makes retention and erasure claims narrow and checkable

A backup cannot promise erasure of what other parties hold, and it cannot
prove continued availability of what it holds. It can declare a retention
period, an erasure deadline, the scope erasure covers, and what its own
historical copies mean — and be measured against those statements instead of a
generic "backup enabled" state.

### 3.5 It makes the cost to third parties visible instead of silent

A snapshot of one device extends the life of both sides of every conversation
in it. The other participants never chose this operator, this jurisdiction, or
this retention period. This contract cannot give them a veto without breaking
the person's own access to their own history, so it requires the choice to be
opt-in, disclosed in those terms, and reported honestly (§10.4, §14.11).

### 3.6 It supports independent ownership and payment

One operator may be free and self-hosted, another may charge for retained
byte-time, another may be funded by an institution for its own members. The UI
presents signed offers with their declared terms. Payment buys retention and
availability; it never buys the ability to read a snapshot or authority over
the identity that made it.

### 3.7 It isolates failure

- A failed upload leaves the previous snapshot intact and restorable.
- A partially received snapshot is rejected before restore rather than merged.
- A broken adapter can be replaced without re-sealing existing snapshots.
- A lapsed payment triggers declared notice and grace, never silent deletion.
- Loss of every snapshot costs history; it never costs the identity, the
  groups, or the ability to keep using the network.

## 4. Logical topology

```text
UI process
  |
  | user consent + schedule
  v
application backup composer
  |-- select eligible local state
  |-- seal with fresh snapshot key material derived from holder-held input
  |-- compute profile-pinned snapshot reference over sealed bytes
  |-- bind the operator's declared-policy digest
  `-- invoke backup port with opaque bytes
            |
            v
      backup adapter
      map · authorize · bound · verify · normalize
            |
            v
      selected backup operator
      retain · serve · refuse · erase within declared policy
```

The adapter is inside the client trust boundary but handles untrusted network
input, locators, receipts, retention observations, and bytes. The operator is
outside it. A successful operator response is evidence only of the operator's
declared action — not future availability, complete erasure, snapshot
integrity, restorability, or any statement about copies held elsewhere.

## 5. Boundary objects

### 5.1 Backup Profile

A `BackupProfile` defines portable semantics independently of a wire
technology or operator:

```json
{
  "profileVersion": 1,
  "profileId": "onym:backup-profile:sealed-device-archive-v1",
  "interface": "onym-backup-v1",
  "operations": [
    "upload",
    "list",
    "download",
    "erase",
    "export"
  ],
  "snapshotReferenceSchema": "<content-addressed-schema>",
  "sealing": "holder-keyed-authenticated-encryption",
  "restoreAuthorization": "holder-key-possession-only",
  "receiptSchema": "per-operation-backup-outcome-v1",
  "errorSchema": "onym-backup-errors-v1",
  "declaredTermsSchema": "onym-backup-terms-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes operation meaning, reference semantics, sealing
requirements, restore authorization, declared-terms structure, receipts, and
errors. It does not choose a digest algorithm, cipher suite, chunking scheme,
endpoint, price, retention period, or UI.

### 5.2 Backup Implementation Profile

A `BackupImplementationProfile` maps the abstract interface to one retention
technology:

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:backup-implementation:<technology>-v1",
  "backupProfileId": "onym:backup-profile:sealed-device-archive-v1",
  "wireProtocol": "<protocol-id>",
  "digestSuite": "<digest-and-encoding>",
  "sealingSuite": "<aead-and-key-derivation>",
  "incrementModel": "<whole-snapshot-or-opaque-increment-scheme>",
  "wireMapping": "<content-addressed-specification>",
  "authentication": ["holder-scoped-capability"],
  "erasureEvidence": "<receipt-semantics>",
  "paymentRefusal": "onym-payment-required-v1",
  "signature": "<implementation-profile-publisher-signature>"
}
```

Wire request objects, storage descriptors, authorization tokens, and protocol
headers stay inside the adapter.

### 5.3 Backup Operator Manifest

A `ServiceManifest` binds an implementation profile and one set of declared
terms to an operator:

```json
{
  "version": 1,
  "componentId": "onym:component:<backup-operator-id>",
  "seat": "storage.backup",
  "operator": "onym:key:<operator-id>",
  "backupProfileId": "onym:backup-profile:sealed-device-archive-v1",
  "implementationProfileId": "onym:backup-implementation:<technology>-v1",
  "endpoints": [
    {"uri": "<technology-specific-endpoint>", "role": "read-write"}
  ],
  "capabilities": ["upload", "list", "download", "erase", "export"],
  "limits": {
    "maximumSealedSnapshotBytes": "<operator-declared-limit>",
    "maximumRetainedSnapshots": "<operator-declared-limit>"
  },
  "declaredTerms": "<digest-of-BackupTerms>",
  "privacyProfile": "<hash-or-url>",
  "entitlementIssuers": ["onym:key:<issuer-id>"],
  "offers": ["<backup-offer-id>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The UI verifies the signature, profiles, endpoint syntax, capabilities,
limits, validity, declared terms, privacy declaration, entitlement issuers,
and selected offer. Discovery catalog presence and a friendly name are
insufficient.

Mutable capacity and health observations remain separate from signed policy.
They cannot silently replace an operator, endpoint, profile, offer, or term.

### 5.4 Backup Terms

`BackupTerms` is the declared policy this seat exists to make legible. It is
signed, content-addressed, and pinned into every snapshot the person entrusts
to the operator:

```json
{
  "termsVersion": 1,
  "termsId": "<content-addressed-digest>",
  "operator": "onym:key:<operator-id>",
  "retention": {
    "class": "<measurable-or-best-effort>",
    "maximumRetentionPeriod": "<declared-duration-or-until-erased>",
    "snapshotsRetained": "<declared-count-or-policy>",
    "expiryBehavior": "<erase-or-notify-then-erase>"
  },
  "erasure": {
    "acknowledgementDeadline": "<declared-duration>",
    "completionDeadline": "<declared-duration>",
    "scope": "<primary-plus-declared-replicas-and-operator-backups>",
    "excluded": "<what-erasure-provably-does-not-cover>"
  },
  "jurisdictions": ["<storage-and-processing-jurisdictions>"],
  "subProcessors": [
    {"role": "<storage-or-processing-role>", "jurisdiction": "<jurisdiction>"}
  ],
  "lawfulAccess": {
    "disclosureWhatIsProduced": "sealed-bytes-and-declared-metadata-only",
    "notifyHolderWhenPermitted": true,
    "transparencyReporting": "<declared-cadence-or-null>"
  },
  "breachDisclosure": {"holderNotice": "<declared-duration>"},
  "export": {
    "format": "<portable-sealed-form>",
    "availableWhileUnpaid": true
  },
  "shutdownNotice": "<declared-duration-export-remains-available>",
  "endOfPayment": {
    "notice": "<declared-duration>",
    "grace": "<declared-duration>",
    "duringGrace": ["download", "export", "erase"],
    "afterGrace": "<erase-or-declared-cold-state>"
  },
  "metadataRetention": {
    "accessLogs": "<declared-duration-or-none>",
    "sizeAndTiming": "<declared-duration>",
    "holderIdentifiers": "<declared-duration>",
    "operationOutcomes": "<declared-duration>",
    "erasureReceipts": "<declared-duration>",
    "entitlementRecords": "<declared-duration>",
    "uploadGrants": "<declared-duration>"
  },
  "signature": "<operator-signature>"
}
```

Terms bind forward, never backward. An operator may publish new terms at any
time; the new digest applies to snapshots accepted after the holder consents to
it. Snapshots already retained keep the terms they were accepted under, and no
new term may extend their retention, narrow their erasure scope, add a
jurisdiction or sub-processor, or remove an export path. An operator that
cannot honour the terms a retained snapshot pins must offer export and erasure,
not a unilateral restatement.

### 5.5 Snapshot Reference

A `SnapshotReference` identifies the exact sealed bytes:

```json
{
  "referenceVersion": 1,
  "algorithm": "<implementation-profile-digest-id>",
  "digest": "<canonical-digest-value>",
  "sealedByteSize": 41235904
}
```

The implementation profile pins algorithm, digest encoding, canonical form,
increment composition, and collision-response policy. The digest covers the
exact operator-facing byte sequence. It does not cover local state before
sealing, a decoded archive, a locator, or mutable metadata.

### 5.6 Sealed Snapshot

The application produces a sealed snapshot before calling the adapter:

```json
{
  "snapshotVersion": 1,
  "operationId": "<random-id>",
  "snapshotReference": {
    "algorithm": "<profile-pinned-algorithm>",
    "digest": "<canonical-digest>",
    "sealedByteSize": 41235904
  },
  "bytes": "<opaque-sealed-bytes>",
  "sealedAt": "2026-08-11T00:00:00Z",
  "acceptedTermsId": "<content-addressed-digest-of-BackupTerms>",
  "supersedes": "<previous-snapshot-reference-or-null>"
}
```

Sealing uses fresh key material for each snapshot, derived from input the
holder possesses. Convergent or content-derived keying is prohibited: it makes
two people's identical files identically addressed and lets an operator or
observer confirm that a holder possesses a known file. Deduplication is
permitted only within one holder's own snapshots.

What the sealed bytes contain is an application decision, but the eligible set
is bounded by the interface contract: local state is excluded from backup
unless the person explicitly includes it
([../interface/Interface.md](../interface/Interface.md) §8). Seed material,
recovery artifacts, and trustee shares are never eligible (§16.1).

### 5.7 Operation outcomes

The adapter returns the durable reference and the operator's outcome:

```json
{
  "operationId": "<same-random-id>",
  "snapshotReference": {
    "algorithm": "<profile-pinned-algorithm>",
    "digest": "<canonical-digest>",
    "sealedByteSize": 41235904
  },
  "outcome": {
    "componentId": "onym:component:<backup-operator-id>",
    "status": "retained",
    "locator": "<profile-specific-location-hint>",
    "retainedUntil": "<operator-observation-or-null>",
    "termsId": "<terms-the-operator-accepted-it-under>",
    "evidence": "<profile-defined-receipt-or-null>"
  }
}
```

Valid outcome classes include:

- `queued_locally`: accepted into a bounded local upload queue;
- `submitted`: the request body was handed to the network implementation;
- `accepted`: the operator explicitly accepted the operation;
- `retained`: the operator confirmed a matching stored snapshot under pinned
  terms;
- `already_retained`: the same reference was already held;
- `rejected`: the operator explicitly refused;
- `erased`: the operator acknowledged erasure within its declared scope, and
  the deadline it committed to has passed without contradiction — an
  acknowledgement alone is not this state;
- `unreachable`: no meaningful operator response was obtained; and
- `unknown`: the request may have succeeded, but its result is inconclusive.

`retained` is not a restorability proof, a durability guarantee, or a
statement about any copy the operator does not control. `erased` is bounded by
the declared scope and never covers other parties' copies.

### 5.8 Restore Authorization

A restore is authorized by possession, proven on the recovering device:

```json
{
  "restoreVersion": 1,
  "snapshotReference": {
    "algorithm": "<profile-pinned-algorithm>",
    "digest": "<canonical-digest>",
    "sealedByteSize": 41235904
  },
  "accessProof": "<proof-of-possession-of-holder-backup-access-key>",
  "destination": "<fresh-device-public-key>",
  "requestedAt": "2026-08-11T00:00:00Z"
}
```

The access key is held by the person, not by the operator, and is separate
from the identity signing key, so abandoning a backup credential touches
nothing else. Whether it can also be *rotated* is a profile decision with real
costs on both sides — a rotation that changes how an operator recognises a
holder strands every snapshot retained under the previous credential unless the
profile also defines a re-binding proof — and a profile that omits rotation, or
makes it destructive, must say so at enrolment rather than imply the property
(§14.4). The operator verifies the proof and
serves bytes. It cannot issue, reset, escrow, or recover the access key, and it
cannot open the snapshot with anything it holds — a failed restore is a lost
history, which is the honest price of the previous sentence and must be
disclosed at enrolment (§11).

### 5.9 Erasure Request and Receipt

```json
{
  "erasureVersion": 1,
  "scope": "<one-snapshot-reference-or-all-under-access-key>",
  "accessProof": "<proof-of-possession-of-holder-backup-access-key>",
  "requestedAt": "2026-08-11T00:00:00Z"
}
```

```json
{
  "receiptVersion": 1,
  "scope": "<echoed-scope>",
  "acknowledgedAt": "2026-08-11T00:00:05Z",
  "completionCommittedBy": "<deadline-from-pinned-terms>",
  "coveredScope": "<primary-plus-declared-replicas-and-operator-backups>",
  "excludedScope": "<what-this-receipt-does-not-cover>",
  "signature": "<operator-signature>"
}
```

A receipt is a signed commitment measured against the pinned terms. It is not
proof of destruction, and its `excludedScope` is mandatory rather than
decorative.

### 5.10 Export

Export returns every retained snapshot in the profile's portable sealed form,
with its references, `acceptedTermsId` values, and receipts, so migration to
another operator or to the person's own storage needs no re-sealing and no
cooperation from the operator being left. Export remains available during the
declared end-of-payment grace period; withholding export for non-payment turns
retention into leverage over a person's own history and does not conform.

## 6. Common backup surface

| Operation | Input | Result |
|---|---|---|
| `connect` | Verified manifest, pinned terms, holder-scoped access context | Readiness and accepted terms digest |
| `uploadSnapshot` | Sealed snapshot and pinned terms | Verified outcome and receipt |
| `listSnapshots` | Access proof | References, sizes, dates, pinned terms per snapshot |
| `downloadSnapshot` | Reference, access proof, destination | Verified sealed bytes or explicit failure |
| `eraseSnapshot` | Scope and access proof | Signed erasure receipt with declared scope |
| `exportSnapshots` | Access proof | Portable sealed forms with references and receipts |
| `queryOutcome` | Operation or reference | Outcome when supported |

The port never presents downloaded bytes as restorable until the snapshot
reference is verified in full. Incremental composition is verified against the
whole-snapshot reference before any local state is replaced.

## 7. UI/application obligations

A conforming frontend and application layer must:

1. treat backup as off until the person turns it on, and never enable it as a
   side effect of an update, migration, or default change;
2. verify the backup and implementation profiles, the operator manifest, and
   the declared terms before the first upload;
3. display retention period, erasure deadlines and scope, jurisdictions,
   sub-processors, lawful-access practice, breach-notice period, export
   availability, the shutdown-notice window, metadata retention, price, and
   end-of-payment behaviour on the consent surface — before enrolment, not on
   first failure;
4. state plainly that a snapshot extends how long this history exists for
   every participant in it, including people who did not choose the operator;
5. bound the eligible set to what the person included, and exclude seed
   material, recovery artifacts, and trustee shares unconditionally;
6. seal each snapshot with fresh key material derived from holder-held input,
   and never with content-derived keys;
7. compute the snapshot reference over the exact sealed bytes;
8. pin the accepted terms digest into every snapshot and re-obtain consent
   before uploading under new terms;
9. keep plaintext state, keys, contact labels, filenames, group secrets, and
   identity credentials out of backup requests, metadata, and logs;
10. hold the backup access key locally, explain that no operator can recover
    it, and — where the selected profile defines rotation — offer it, and state
    what it does to snapshots already retained under the previous credential;
11. verify a complete snapshot reference before replacing any local state, and
    never merge a partial or unverified snapshot;
12. treat locators, receipts, retention dates, and operator descriptors as
    untrusted observations;
13. label `submitted`, `retained`, `erased`, `restored`, and `exported`
    accurately, and never render `unknown` as success;
14. retry idempotently by reference and operation ID rather than sealing a new
    snapshot;
15. surface a lapsed, expiring, failing, or long-stale backup as a state the
    person can see rather than a silent no-op;
16. support export and operator migration without re-sealing; and
17. never redirect backup to increase frontend commission, and never present a
    paid operator as more private than a self-hosted one on that basis.

Operator diagnostics, locator fields, redirects, and filenames are untrusted
input. They cannot drive unsafe navigation, execution, or payment.

## 8. Backup adapter obligations

A conforming adapter must:

1. implement its mapping without leaking wire-specific objects through the
   common port;
2. accept only sealed bytes and avoid parsing application state;
3. validate reference syntax, byte count, endpoint identity, terms digest, and
   limits;
4. recompute the snapshot reference before upload;
5. verify every operator response against the expected reference, size, and
   pinned terms digest;
6. verify a complete snapshot, including composed increments, before exposing
   restorable bytes;
7. enforce redirect or indirection limits and credential-origin policy;
8. keep the holder's access proof, entitlement, and authorization material
   scoped to one operator;
9. normalize implementation failures into stable domain errors while
   preserving bounded safe diagnostics;
10. bound response bodies, receipts, metadata, indirection, increment
    assembly, queues, timeouts, and retry;
11. preserve unknown outcomes instead of converting silence into `retained` or
    `erased`;
12. preserve every erasure receipt with its excluded scope intact;
13. avoid logging snapshots, references bound to a holder, credentials, or
    signed authorizations; and
14. remain replaceable without re-sealing existing snapshots.

The adapter verifies retention-wire properties. It does not decide what may be
backed up, nor who may restore it; the eligible set and the holder's access key
do.

## 9. Backup operator obligations

A conforming operator publishes:

- a signed manifest, supported implementation profile, and content-addressed
  terms;
- endpoint identities and indirection policy;
- supported operations and optional capabilities;
- maximum sealed snapshot size, snapshot count, concurrency, and rate limits;
- holder-scoped access-control and entitlement-issuer policy;
- retention class, maximum retention period, and expiry behaviour;
- erasure acknowledgement and completion deadlines, covered scope, and the
  scope erasure provably excludes;
- storage and processing jurisdictions, and every sub-processor with its role
  and jurisdiction;
- what a lawful-access demand can produce, whether holders are notified when
  permitted, and any transparency-reporting cadence;
- breach-notice period and channel;
- access-log, size, and timing metadata retention;
- export format and its availability while unpaid;
- end-of-payment notice, grace, and post-grace behaviour;
- measurable availability and durability claims; and
- migration, export, and shutdown notice policy.

The operator must not claim that a retained snapshot proves restorability,
that an erasure receipt proves destruction beyond its declared scope, that it
can recover a holder's access key, or that its retention limits copies held by
anyone else. An operator that acquires the ability to open snapshots — by
holding an unwrap key, escrowing an access key, or offering an
operator-controlled reset — has left this seat and must say so before, not
after, that capability exists.

## 10. Retention, erasure, and the copies this seat creates

### 10.1 Retention is a declaration, not a proof

A snapshot can be lost under best-effort service, and a retention date is an
operator statement. `retained` reflects the operator's declared action at one
moment.

### 10.2 Terms bind forward only

A retained snapshot keeps the terms it was accepted under. New terms govern new
snapshots after fresh consent. Retroactive extension of retention, narrowing of
erasure scope, addition of a jurisdiction or sub-processor, or removal of an
export path does not conform (§5.4).

### 10.3 Erasure is narrow and honest

An erasure receipt covers the primary copy plus the declared replicas and the
operator's own historical copies, within the deadline the pinned terms state.
It cannot cover recipients, observers, caches outside the operator's control,
or copies the person made themselves. A timeout after erasure creates an
`unknown` outcome, reconciled by reference rather than relabelled.

### 10.4 A backup creates a copy other people did not choose

A snapshot of one device extends the lifetime of both sides of every
conversation it contains, under an operator and a jurisdiction the other
participants never selected. Message and blob retention limits describe the
route; they do not describe copies at its ends. This contract does not give
other participants a veto, because that would take a person's own history
hostage to everyone they ever spoke with. It requires the opposite discipline:
the choice is explicit, the terms are visible, and the UI says in plain words
what the snapshot does for everyone in it (§7.4).

## 11. Restore authorization and the absent reset path

Restore proves possession of the holder's backup access key. The operator
verifies a proof and serves bytes; it holds nothing that opens a snapshot.

This has a cost, and pretending otherwise is how backup products become
custody: a lost access key means a permanently unreadable archive. There is no
operator recourse, because every mechanism that would provide one — an escrowed
key, a wrapped key the operator can unwrap, a support-driven reset, a
knowledge-based challenge the operator can satisfy alone — makes the operator
able to read the history it stores.

A person who wants a recoverable fallback is choosing a different, disclosed
arrangement: an enrolled recovery policy under
[../recovery/Recovery-Trustee.md](../recovery/Recovery-Trustee.md), where a
custodial single-provider profile states its custody class openly. A conforming
backup UI may offer to protect the *access key* through such a policy, provided
it says which trustees would then be able to reach the archive. What it may not
do is present an operator-recoverable backup as sealed.

## 12. Access control and payment

Operator access is separate from what a snapshot contains and from global
identity. The operator may require a holder-scoped capability to upload, list,
download, erase, or export. That credential proves only the declared service
access.

The operator publishes a `SeatOffer`. A frontend sells it only through a
compatible signed `ChannelOffer`; product mapping, validation, platform fees,
taxes, refunds, and operator settlement remain outside backup framing.

```text
UI/application -> backup adapter: preflight or sealed-snapshot operation
UI/application <- backup adapter: PaymentRequired(component + offer)
UI -> billing channel: purchase approved product
UI -> billing broker: purchase evidence + holder-scoped access key
UI <- billing broker: SeatEntitlement
UI/broker -> operator control path: register entitlement or obtain capability
UI/application -> backup adapter: retry exact operation by snapshot reference
UI/application <- backup adapter: verified outcome and receipt
```

Payment refusal occurs in a lightweight preflight before a large upload or
restore where the implementation permits it. A retry preserves the exact sealed
bytes, reference, and logical snapshot. Store evidence and global identity
never enter ordinary backup requests, object paths, or operator logs.

End of payment follows the pinned terms: declared notice, then a grace period
during which download, export, and erasure all remain available, then the
declared post-grace behaviour. Silent deletion on a failed charge, and
withholding export until arrears are paid, are both non-conforming. Payment
cannot make a reference mismatch valid, strengthen restore authorization, or
prove retention.

## 13. Errors and state machines

| Error | Origin | UI/application response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse and explain the required adapter |
| `invalid_endpoint` | Manifest/configuration | Refuse; never silently rewrite |
| `terms_unavailable` | Manifest/operator | Refuse enrolment; terms are a precondition |
| `terms_changed` | Operator | Stop uploading, re-present terms, obtain consent |
| `terms_regression` | Client verification | Refuse: new terms weaken a retained snapshot |
| `ineligible_content` | Application validation | Reject before sealing; never upload seed material |
| `invalid_reference` | Application/adapter | Reject noncanonical or mismatched reference |
| `snapshot_too_large` | Client/operator | Reduce eligible set or choose a compatible operator |
| `unreachable` | Network/operator | Retry with backoff; preserve the local queue |
| `auth_required` | Operator | Complete holder-scoped authentication |
| `payment_required` | Operator | Present the referenced signed offer |
| `invalid_entitlement` | Operator/broker | Refresh without leaking another credential |
| `rate_limited` | Operator | Honour retry guidance and preserve sealed bytes |
| `quota_exceeded` | Operator | Report; never silently drop older snapshots |
| `upload_rejected` | Operator | Preserve the reason and try an allowed alternative |
| `access_proof_invalid` | Operator | Fail closed; never offer an operator-side reset |
| `access_key_lost` | Client | State that the archive is unreadable; do not imply recourse |
| `digest_mismatch` | Adapter | Discard bytes, flag the operator, do not restore |
| `incomplete_snapshot` | Adapter | Refuse restore; never merge partial state |
| `retention_expired` | Operator | Report the gap; re-upload a fresh snapshot |
| `erasure_unconfirmed` | Client verification | Preserve uncertainty; do not claim destruction |
| `outcome_unknown` | Network/operator | Reconcile by reference before resubmitting |
| `export_withheld` | Operator | Report non-conformance; retain local evidence |

Backup state:

```text
disabled
  -> consented (terms pinned)
  -> eligible_set_selected
  -> sealed
  -> addressed
  -> preflight
  -> auth_required? -> authenticated
  -> payment_required? -> entitled -> authenticated
  -> submitted
  -> response_verified
  -> retained | rejected | unknown
  -> receipt_stored
```

Restore state:

```text
snapshot_listed
  -> access_proof_presented
  -> downloading
  -> size_bounded
  -> increments_composed
  -> snapshot_reference_verified
  -> authenticated_opening
  -> state_validated
  -> restored
```

Erasure state:

```text
erasure_requested
  -> acknowledged (deadline committed)
  -> receipt_stored
  -> completion_deadline_passed
  -> erased | erasure_unconfirmed
```

Unverified or partially composed snapshots never replace local state.

## 14. Security and privacy invariants

1. **Only sealed snapshots cross the boundary.** Plaintext state, keys,
   contact labels, filenames, and group secrets never appear in the clear, in
   metadata, in a locator, in a receipt, or in a log. A restorable snapshot
   necessarily *contains* group secrets and content keys — that is what makes
   it a restore rather than a transcript — so the rule this invariant states is
   opacity, not absence.
2. **No seed material, ever.** Recovery artifacts, trustee shares, and root
   secrets are ineligible for backup under this contract (§16.1).
3. **The operator holds no opening capability.** No escrowed key, no wrapped
   key it can unwrap, no operator-controlled reset.
4. **Restore is possession, not identity.** The access key is holder-held and
   separate from the identity signing key. Whether it is *independently*
   rotatable is a profile decision with a real cost either way, and a profile
   that shares a root with the identity keys, or that omits rotation because it
   would strand retained snapshots, must say so rather than claim the property
   (see [UI-Backup-Object-HTTP.md](UI-Backup-Object-HTTP.md) §16.2).
5. **The reference covers sealed bytes.** It is recomputed before upload and
   verified in full before any restore.
6. **Sealing keys are fresh and holder-derived.** Convergent or
   content-derived keying is prohibited; deduplication stays within one
   holder's snapshots.
7. **Terms are pinned and bind forward.** A retained snapshot keeps the terms
   it was accepted under.
8. **Erasure claims are narrow.** No receipt proves removal from recipients,
   observers, or copies outside the declared scope.
9. **Unknown is not success.** Lost responses are reconciled by reference
   rather than relabelled as retained or erased.
10. **Backup is opt-in and visible.** It never begins, resumes, widens its
    eligible set, or changes operator without an explicit choice.
11. **The third-party cost is disclosed.** The consent surface states that a
    snapshot extends this history's life for everyone in it, under a
    jurisdiction they did not choose.
12. **Credentials are operator-scoped.** One operator never receives
    another's entitlement, token, access proof, or authorization.
13. **Billing is separate from content.** Store evidence and global billing
    identifiers never enter snapshots, locators, or ordinary access logs.
14. **Lapse is disclosed, never silent.** Notice, grace, download, export, and
    erasure precede any post-grace deletion.
15. **Export is unconditional.** Retention is never leverage: export is never
    withheld for non-payment, and it keeps working through notice and grace. It
    cannot survive shutdown — a shut-down operator serves nothing — so an
    operator declares a `shutdownNotice` window during which export works, and
    the consent surface shows it beside retention and grace.
16. **A snapshot is not evidence and not group state.** The operator
    adjudicates nothing, discloses nothing legible, and no backup operation
    authorizes or rolls back a notary transition.

## 15. Versioning and conformance

- `BackupProfile` changes when operation, reference, sealing, restore
  authorization, receipt, erasure, or error meaning changes.
- `BackupImplementationProfile` changes when digest suite, sealing suite,
  increment model, wire mapping, authentication, or refusal mapping changes.
- `ServiceManifest` changes when endpoints, capabilities, limits, terms
  digest, offers, entitlement issuers, or operator keys change.
- `BackupTerms` changes are new terms, never edits: a new digest, applying to
  new snapshots after consent.
- New defaults apply to new enrolment, not silently to existing backups.
- Cross-platform fixtures cover sealing, reference construction, increment
  composition, terms pinning and regression refusal, restore proof, restore of
  a partial snapshot, erasure receipts and excluded scope, payment refusal and
  retry, lapse and grace, export, operator migration, and corrupt data.
- Paid and self-hosted operators of one implementation remain technically
  compatible; entitlement enforcement is a declared capability.

## 16. Boundary against neighbouring seats

### 16.1 Identity, recovery, and custody

This seat restores **history**, never **identity**. Seed material, recovery
artifacts, and trustee shares are ineligible for a snapshot, and no backup
operation can authorize a key, migrate authority, or satisfy a recovery policy.
The root secret and the authority to act as a person belong to
[../identity/UI-Identity.md](../identity/UI-Identity.md) and
[../recovery/Recovery-Trustee.md](../recovery/Recovery-Trustee.md), where the
custodial cloud profile states its 1-of-1 custody class openly. Restoring a
snapshot onto a device that has no identity yields readable-to-nobody bytes
until that identity is recovered through those contracts.

### 16.2 Message carriage and blob storage

Carriage moves sealed messages; blob storage retains sealed attachments for
live use; both declare their own retention. A backup is a device's archive of
what it already holds. It may contain attachment ciphertext, references, or
both, but it never becomes an attachment source for other participants and
never substitutes for a blob route.

### 16.3 Interface

The eligible set is bounded by [../interface/Interface.md](../interface/Interface.md)
§8: local state is encrypted at rest and excluded from cloud backup unless the
person explicitly includes it. This contract does not relax that rule; it
defines what an operator owes once the person has included something.

### 16.4 Moderation

A snapshot is not a report and not evidence. A backup operator receives no
disclosure surface, adjudicates nothing, and cannot be asked to produce
legible content because it holds none. Where a person chooses to disclose a
message to an authority, that act happens under
[../moderation/Moderation.md](../moderation/Moderation.md) from the person's
own device, whether or not the message came back from a snapshot.

## 17. Concrete implementation profiles

[UI-Backup-Object-HTTP.md](UI-Backup-Object-HTTP.md)
(`onym:backup-implementation:object-http-v1`) is the first, and it is draft. This
abstract boundary is not executable until a profile pins:

- the digest suite, canonical sealed form, and increment composition rules;
- the sealing suite and the key derivation from holder-held input, including
  access-key rotation;
- the proof-of-possession construction for restore, erasure, and export;
- the wire framing for upload, list, download, erase, and export, with limits
  and indirection policy;
- erasure receipt semantics and what evidence an operator can honestly sign;
- the portable export container; and
- the payment-refusal mapping.

*Known gaps.* No implementation exists in any Onym client today, so nothing in
this document is a claim about running code, and the profile above is a
specification rather than a report. Two gaps are design work, not profile
detail, and the first profile solves neither: an incremental scheme that is
verifiable against a whole-snapshot reference without leaking a change map to
the operator, and a disclosure pattern for §10.4 that is honest without being
unusable. Until fixtures exist, the interface rule stands unchanged — local
state stays out of any cloud backup unless the person explicitly includes it.

## 18. Acceptance criteria

The UI ↔ backup boundary is successfully separated when:

1. a third-party UI can seal, upload, list, restore, erase, and export
   snapshots against a compatible operator using public profiles and tests;
2. the official UI can use a compatible third-party operator after manifest
   and terms verification, without changes to application state handling;
3. operators can be replaced, or a snapshot moved to the person's own storage,
   without re-sealing and without the outgoing operator's cooperation;
4. sealed bytes, references, and receipts do not leak wire objects into view
   or domain APIs;
5. plaintext state, sealing keys, access keys, and seed material never reach
   an operator;
6. restore succeeds only with holder key possession, and every reset path an
   implementation could offer is provably absent;
7. a snapshot's pinned terms are checkable after the fact, and an attempt to
   apply weaker terms to it is refused by fixtures rather than by trust;
8. erasure produces a signed receipt whose excluded scope is explicit, and an
   unconfirmed erasure is never displayed as destruction;
9. lapse, grace, export, and post-grace behaviour follow the pinned terms
   under test, including while unpaid;
10. the consent surface states the retention, jurisdiction, and third-party
    consequences before enrolment, verified by fixture rather than by review;
    and
11. a second retention technology can implement the abstract suite without
    pretending to be the first.

## 19. Justification in one sentence

> Separating the UI from device backup lets people keep a history that
> survives a lost phone without handing anyone the ability to read it, and
> makes the terms of that durability — how long, where, under whose law, erased
> how, exported how — a published part of the contract rather than a setting an
> operator can restate once the data has already arrived.
