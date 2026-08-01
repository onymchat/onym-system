---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Recovery Trustee: Cloud Custody Implementation

**Implementation profile draft 0.1 — August 2026**

> This is the simple “store recovery on our servers” profile. It improves
> availability, but the selected provider remains capable of recovery and is
> therefore a custodian.

This document maps the abstract
[Recovery Trustee seat](Recovery-Trustee.md) to a single hosted provider. The
client encrypts a canonical recovery artifact. The provider stores that
ciphertext and a server-wrapped recovery-unlock key, then releases the unlock
key to a fresh recovery destination after the enrolled policy is satisfied.

The profile is deliberately explicit about trust: the provider operates the
unwrap service and can technically recover the protected artifact. Encryption
at rest limits disk, backup, and database exposure; it does not make the
provider non-custodial. Multiple replicas, regions, or hardware security
modules under the same operator remain one trustee.

This is a protocol profile, not a claim that any third-party product or vendor
uses, endorses, or conforms to it.

## 1. Conformance declaration

| Abstract concept | Cloud custody mapping |
|---|---|
| Implementation profile | `onym:recovery-implementation:cloud-custody-v1` |
| Custody class | Single-provider custodial, 1-of-1 cryptographic authority |
| Trustee | One signed cloud service component |
| Recovery contribution | Recovery-unlock key protected by provider-controlled wrapping |
| Protected object | AEAD-encrypted canonical `RecoveryArtifact` |
| Recovery destination | Fresh HPKE encryption key and Ed25519 proof key generated on the recovering device |
| Candidate authorization | Pre-enrolled factors, cooldown, notification, and veto policy |
| Provider evidence | Signed enrollment, lifecycle, release, and deletion receipts |
| Availability boundary | Provider service, backups, key service, and policy operations |
| Recovery modes | Secret restoration; authority migration when the identity profile supports it |

The profile maps:

```text
onym:recovery-profile:trustee-v1
    -> onym:recovery-implementation:cloud-custody-v1
```

A provider must use the profile identifier. A generic cloud-backup claim,
encrypted database, or support-driven account reset is not sufficient.

## 2. Trust statement shown before enrollment

A conforming UI displays the equivalent of:

> This provider can technically recover your protected identity material. If
> its systems, staff controls, recovery process, or legal environment fail, an
> attacker or the provider may take over the identity. If the provider loses
> its stored key or refuses service, recovery may fail. Choose this for
> convenience, not threshold independence.

The holder acknowledges this statement separately from pricing and terms. A
UI must not hide it behind “advanced,” call the service self-custody, or count
the holder's login factors as independent cryptographic trustees.

## 3. Ownership and authority

- The **holder** owns the identity and authorizes the initial enrollment.
- The **vault** creates the artifact and performs restore or migration locally.
- The **cloud operator** owns the service, custody controls, recovery policy,
  jurisdiction, retention, support, and availability claims.
- The **key-service operator**, if subcontracted, protects the server wrapping
  key but does not create a second trustee when controlled through the same
  cloud service.
- The **billing channel** proves payment for the service only. It receives no
  artifact, unlock key, recovery factor, or release decision.
- The **UI publisher** presents the offer and may receive a disclosed split;
  it cannot initiate or approve recovery unless separately enrolled as a
  factor under the policy.

The provider's power is bounded operationally and contractually, not removed
cryptographically. Hardware-backed keys, separation of duties, audit logs,
and dual staff approval can reduce misuse, but the profile remains 1-of-1.

## 4. Cryptographic construction

### 4.1 Required suites

The v1 client-side format uses:

- a 256-bit recovery-unlock key (`RUK`) from a cryptographically secure random
  source;
- AES-256-GCM for the protected recovery artifact, with a fresh 96-bit nonce;
- SHA-256 for profile object and ciphertext digests;
- RFC 9180 HPKE Base mode for transit to the provider and to the recovery
  destination, using DHKEM(X25519, HKDF-SHA256), HKDF-SHA256, and AES-256-GCM;
  and
- Ed25519 for the fresh session proof and signed enrollment/trustee objects.

All canonical encodings, byte order, HPKE `info`, AEAD associated data, and
test vectors must be published before the profile is marked operational. An
algorithm or encoding change requires a new implementation-profile version.

### 4.2 Artifact encryption

The healthy vault constructs the canonical plaintext artifact defined by the
abstract contract, then computes:

```text
identityBindingCommitment = SHA-256(canonical(
  "onym-recovery-identity-binding-v1",
  identityBindingSalt,
  identitySubject,
  descriptorDigest
))

AAD = canonical(
  implementationProfileId,
  enrollmentId,
  enrollmentSequence,
  policyDigest,
  identityBindingCommitment,
  recoveryMode,
  artifactId
)

artifactCiphertext = AES-256-GCM-Seal(
  key = RUK,
  nonce = fresh 96-bit nonce,
  plaintext = canonical RecoveryArtifact,
  associatedData = AAD
)
```

The client places the ciphertext, nonce, every AAD field, and a digest over the
canonical header and ciphertext into the abstract `ProtectedRecoveryArtifact`.
It sends `RUK` only inside HPKE ciphertext sealed to the provider enrollment
key, with the same enrollment and policy bindings in HPKE `info`.

The mnemonic, seed, root key, migration authority, plaintext artifact, and
`RUK` never appear in an HTTP field, support form, log, analytics event, push
notification, or billing record.

### 4.3 Server wrapping

The provider opens the enrollment HPKE ciphertext in its controlled key
service and immediately wraps `RUK` under a non-exportable provider key. The
artifact/key record contains at least the complete protected-artifact header
and these custody fields:

```json
{
  "protectedArtifactVersion": 1,
  "implementationProfileId": "onym:recovery-implementation:cloud-custody-v1",
  "enrollmentId": "<random-256-bit-id>",
  "enrollmentSequence": 1,
  "policyDigest": "<sha256>",
  "identityBindingCommitment": "<opaque-commitment-from-policy>",
  "recoveryMode": "secret-restoration",
  "artifactId": "<random-256-bit-id>",
  "artifactDigest": "<sha256>",
  "artifactCiphertext": "<aes-gcm-ciphertext>",
  "artifactNonce": "<96-bit-nonce>",
  "wrappedRuk": "<provider-key-service-ciphertext>",
  "wrappingKeyVersion": "<provider-key-version>",
  "status": "active",
  "createdAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2027-08-01T00:00:00Z"
}
```

The server wrapping scheme must provide confidentiality and integrity, bind
the full enrollment context, and support auditable key rotation. The provider
declares its KMS/HSM boundary, administrative access model, backups, region,
subprocessors, and restore tests in its service policy.

Provider wrapping is allowed to differ operationally across providers because
it is behind the contract boundary. It cannot weaken the wire and artifact
suites or change who has custody.

## 5. Enrollment

### 5.1 Preconditions

Enrollment occurs only from an unlocked healthy vault after explicit holder
confirmation. The client verifies:

1. the abstract and cloud implementation profiles;
2. the current signed provider manifest and enrollment HPKE key;
3. the selected seat offer, term, lapse, export, and deletion policy;
4. the exact candidate factors, cooldown, notifications, and veto; and
5. that the identity descriptor and recovery mode are the values shown to the
   holder.

The cloud account credential must not be only the Onym key being recovered.
The holder enrolls independent recovery access such as a passkey available on
another device, an offline saved recovery code, and/or pre-verified recovery
contacts under the provider policy. A provider may require stronger proof for
high-value profiles.

### 5.2 Request

```json
{
  "requestVersion": 1,
  "requestId": "<random-id>",
  "operation": "enroll",
  "implementationProfileId": "onym:recovery-implementation:cloud-custody-v1",
  "enrollment": "<holder-signed-RecoveryEnrollment-without-receipt>",
  "artifactCiphertext": "<aes-256-gcm-ciphertext>",
  "artifactNonce": "<nonce>",
  "sealedRuk": "<hpke-ciphertext-to-provider-enrollment-key>",
  "factorBindings": ["<provider-specific-encrypted-bindings>"],
  "holderAuthorization": "<healthy-vault-authorization-from-recovery-scoped-key>"
}
```

The provider verifies every digest and signature before unwrapping `sealedRuk`.
It writes the artifact and wrapped key durably, verifies read-back, activates
the enrolled factors and notifications, then returns a signed receipt. A
receipt produced before durable write is nonconforming.

### 5.3 Activation test

The client verifies the receipt and performs a non-secret recovery-readiness
check that proves the current wrapping key can access the stored key record
without releasing `RUK`. The provider signs the artifact digest, policy digest,
key version, replica state, and test time.

This proves only that the provider reports a readable record at that moment.
It is not proof against insider recovery or future data loss.

## 6. Candidate authorization policy

The provider publishes its supported factor classes. A selected policy must
state the exact combination required. Examples include:

- phishing-resistant passkey on a second or syncable device plus an offline
  saved recovery code;
- two recovery codes delivered through independently enrolled contact
  methods, with a mandatory cooldown;
- one surviving bound authenticator plus one independent recovery contact;
  or
- repeated identity proofing only when equivalent proofing was performed at
  enrollment and the privacy/legal consequences were disclosed.

Manual recovery codes and email/SMS delivery are not labelled
phishing-resistant. Support questions, public profile data, device identifiers,
knowledge of an identity name, a purchase receipt, or control of the lost
identity key alone cannot replace the selected policy.

Every policy also declares:

- attempt throttling and lockout behavior;
- cooldown before release;
- notification to at least two enrolled channels where available;
- holder/designee veto before the deadline;
- factor-change delay and notification;
- session lifetime and one-time use; and
- exceptional refusal rules required by law or incident response.

These controls follow the current NIST account-recovery principles of
prearranged methods, throttling, binding new authenticators, and independent
notification, but this pseudonymous key-recovery profile does not claim NIST
identity-assurance certification.

## 7. Recovery flow

### 7.1 Bootstrap

On a fresh device, the candidate first presents an opaque provider-account
locator and the profile's initial pre-enrolled factor over an authenticated
protected channel. The provider resolves only the highest active enrollment
sequence and returns a signed abstract `RecoveryBootstrap` containing the
complete stored `ProtectedRecoveryArtifact`, its digest, current policy digest,
and non-secret session requirements. It does not release `RUK`, satisfy the
remaining factors, or start the cooldown merely by returning bootstrap data.

Lookup failures are rate-limited and indistinguishable to an unauthorized
caller, so the endpoint cannot enumerate enrollments. The provider account,
offline recovery code, or other lookup method cannot depend solely on the
Onym key being recovered. A candidate that cannot satisfy any declared lookup
path cannot discover the private enrollment from this provider.

### 7.2 Begin

The new vault generates an ephemeral HPKE destination key pair and a fresh
Ed25519 session-proof key pair. It signs the canonical `RecoverySession` with
the proof key, binding the HPKE key without pretending to authenticate the old
identity. The candidate presents only policy-permitted factor evidence over an
authenticated protected channel.

The provider returns:

```json
{
  "sessionId": "<random-256-bit-id>",
  "status": "cooling_down",
  "enrollmentSequence": 1,
  "destinationKeysDigest": "<sha256-of-hpke-and-proof-keys>",
  "cooldownEndsAt": "2026-08-03T00:00:00Z",
  "expiresAt": "2026-08-08T00:00:00Z",
  "notificationsDispatched": ["<channel-class-only>"],
  "remainingAttempts": 2,
  "signature": "<provider-signature>"
}
```

The provider sends notifications independently of the candidate's current
session. Notification payloads contain no secret, factor value, or automatic
approval link.

### 7.3 Veto and delay

During cooldown, the enrolled holder or designee can cancel through the
declared veto method. Updating notification destinations or factors cannot
shorten a session already in progress. Provider staff cannot bypass the delay
without invoking a separately declared emergency policy whose use is logged
and independently reviewed.

### 7.4 Release

After successful factors, cooldown, no veto, and final policy evaluation, the
provider unwraps `RUK` inside its key service and immediately seals it to the
session destination:

```text
info = canonical(
  "onym-cloud-recovery-release-v1",
  sessionId,
  enrollmentId,
  enrollmentSequence,
  policyDigest,
  artifactId,
  artifactDigest,
  destinationKeysDigest,
  expiresAt
)

sealedContribution = HPKE-Seal(
  destinationPublicKey,
  info,
  RUK
)
```

The provider returns the abstract `TrusteeContribution`, protected artifact,
and signed release receipt. It does not return `RUK` in plaintext and does not
decrypt the artifact in an application server or support console.

### 7.5 Local completion

The recovering vault:

1. verifies provider manifest, session, sequence, policy digest, artifact ID
   and digest, destination binding, signatures, and receipt;
2. opens the HPKE contribution using the ephemeral destination private key;
3. reconstructs the exact enrolled AAD from the signed protected-artifact
   header and opens the artifact with AES-256-GCM;
4. verifies the recovered identity subject and known descriptor fingerprint;
5. imports or migrates under a holder-facing ceremony;
6. binds fresh local authenticators; and
7. destroys the ephemeral HPKE key, session-proof key, and `RUK` from memory
   on a best-effort basis.

The client then rotates the recovery enrollment. In secret-restoration mode it
also warns that any previous copy of the root secret remains usable.

## 8. Operation mapping

| Abstract operation | Cloud endpoint behavior |
|---|---|
| `enroll` | Store protected artifact and provider-wrapped `RUK`; bind factors |
| `read-enrollment` | Return signed status, sequence, expiry, readiness, and policy digests |
| `bootstrap-recovery` | Resolve the current private enrollment after initial account/factor authorization |
| `begin-recovery` | Verify candidate factors; create delayed destination-bound session |
| `contribute-recovery` | Provider releases HPKE-sealed `RUK` after policy satisfaction |
| `read-recovery` | Return non-secret session and notification state |
| `cancel-recovery` | Record veto/candidate cancellation and prevent release |
| `finalize-recovery` | Record client confirmation; never receive recovered plaintext |
| `rotate-enrollment` | Create new artifact/`RUK`/sequence, then revoke the old record |
| `revoke-enrollment` | Block all new and pending releases for the sequence |
| `export-enrollment` | Rewrap `RUK` only to a holder-approved fresh export destination |
| `close-enrollment` | Revoke, schedule deletion, and issue a retention-aware receipt |

All calls are idempotent by request ID and require protected transport. Read
endpoints avoid confirming whether an enrollment exists to an unauthenticated
caller.

## 9. Rotation, export, lapse, and deletion

### 9.1 Rotation

Rotation creates a fresh `RUK`, artifact nonce, artifact ciphertext,
enrollment sequence, provider wrapping, and receipts. The provider activates
the new sequence only after durable verification, then revokes pending
sessions and the old sequence. Rewrapping the same `RUK` is wrapping-key
maintenance, not holder recovery rotation.

### 9.2 Export

Export is itself a high-risk recovery release. The healthy holder authorizes a
fresh destination key with the active identity and satisfies the offer's
declared export factors. The provider rewraps `RUK` to that destination and
returns the protected artifact and receipts.

The provider is technically capable of refusing export. The UI and Discovery
provider must retain this fact in the provider's risk description even when
contracts promise portability.

### 9.3 Service lapse

The seat offer specifies:

- renewal deadline and grace period;
- whether new recoveries are blocked during grace;
- how long holder-authorized export remains available;
- when factor and artifact records become read-only, revoked, or deleted;
- whether payment can restore a lapsed record; and
- the final date after which recovery is impossible.

The service cannot invent an emergency ransom fee after enrollment. A UI
warns through independent channels before a recoverable enrollment becomes
irrecoverable.

### 9.4 Deletion

Closure first revokes release authority, then deletes online records and
schedules removal under the published backup-retention window. The receipt
lists categories, active deletion time, maximum backup expiry, and legal holds
known to the operator.

This is an auditable operator statement, not cryptographic proof of erasure.
The holder should rotate the identity or recovery authority if surviving
copies would remain dangerous.

## 10. Provider controls

A conforming provider documents and tests:

1. separation between application, factor-verification, release, and billing
   systems;
2. non-exportable wrapping keys, key versioning, dual-control administration,
   and emergency access review;
3. encrypted, authenticated backups and periodic restore drills;
4. least-privilege operator access and tamper-evident lifecycle logs;
5. protected-channel authentication and session-bound factor presentation;
6. code and configuration change approval for recovery policy;
7. incident detection, holder notification, key rotation, and compromise
   response;
8. regional, jurisdictional, subcontractor, and compelled-disclosure risks;
9. capacity and disaster recovery for rare correlated recovery events; and
10. independent security assessment appropriate to the custody claim.

An audit report increases evidence about controls; it does not change the
1-of-1 authority model.

## 11. Privacy and metadata

The provider can observe the account/enrollment relationship, payment state,
network metadata, factors it verifies, notification destinations, recovery
time, destination public key, and outcome. Because it controls unwrapping, it
can also decrypt the artifact and learn its identity content if it violates or
is compelled beyond the intended service path. It must minimize and segregate
routine metadata, but the cryptographic profile cannot prevent that custodial
power.

The provider must not:

- place the Onym identity subject in billing or analytics when an opaque
  account reference is sufficient;
- send factor values, artifact locators, or session authorization in
  notifications;
- use recovery events to enrich advertising, credit, social, or identity
  profiles;
- disclose enrollment existence to Discovery providers or other seats; or
- join this seat's scoped identity to messages, names, banking addresses, or
  charity activity without separate holder action and a lawful purpose.

Provider terms state retention for factor records, network logs, receipts,
support data, security logs, and backups separately. “We delete your backup”
is not a complete retention policy.

## 12. Payment

A cloud provider may offer a one-time backup term, subscription, institution-
funded custody, paid recovery, or capped hybrid. The signed offer names:

- included storage and readiness checks;
- maximum artifact size and retention;
- recovery and export fees known at enrollment;
- grace and deletion rules;
- refunds and service credits;
- billing channel and taxes; and
- disclosed UI, Discovery provider, broker, or contributor splits.

Payment success changes entitlement state; it does not release `RUK`. The
billing broker cannot call the release path and the recovery service does not
receive an app-store receipt containing more identity information than needed
to validate its scoped entitlement.

## 13. Threat summary

| Failure | Consequence | Mitigation or honest limit |
|---|---|---|
| Provider/key-service compromise | Attacker may recover every reachable enrolled identity | Isolation, non-exportable keys, dual control, audit, incident response; custody risk remains |
| Weak account recovery | Attacker satisfies provider policy | Pre-enrolled independent factors, throttling, cooldown, notification, veto |
| Provider disappearance | Holder cannot obtain `RUK` | Replication helps operator availability; holder needs another recovery profile for operator independence |
| Database-only theft | Artifact and wrapped `RUK` exposed | AEAD, provider wrapping, context binding, rate-limited key service |
| Malicious support employee | Attempts policy bypass or release | No discretionary bypass, dual approval, tamper-evident logs, independent review |
| Old-record rollback | Recovery returns stale or compromised material | Client-pinned enrollment sequence and artifact/policy digests |
| Backup survives deletion | Prior material may remain recoverable | Disclosed retention, deletion schedule, identity/recovery rotation |
| Same root was previously stolen | Recovery succeeds but attacker still controls a copy | Migrate authority and downstream relationships where possible |

## 14. Conformance fixtures

In addition to the abstract suite, this profile requires fixtures for:

1. canonical AAD and SHA-256 digests;
2. authenticated bootstrap of the current sequence and complete protected-
   artifact header, plus non-enumerating lookup refusal;
3. AES-256-GCM artifact encryption and corruption refusal;
4. provider-enrollment and recovery-destination HPKE vectors;
5. wrong profile, sequence, policy, identity, artifact, and destination
   bindings;
6. server wrapping-key rotation without changing enrollment semantics;
7. factor throttling, cooldown, multi-channel notification, and veto;
8. idempotent release and inability to release after cancellation or expiry;
9. fresh holder recovery rotation and old-record refusal;
10. export to a fresh destination; and
11. lapse, closure, backup-retention, and deletion receipts.

Test logs are scanned for artifacts, mnemonics, root keys, `RUK`, candidate
factors, destination private keys, and unredacted notification destinations.

## 15. Status

This is a proposed implementation profile. It is not a deployed Onym custody
service and is not safe to market until its canonical fixtures, clients,
provider operations, legal terms, independent security assessment, and live
recovery/rotation drills are complete.

## References

1. NIST SP 800-63B-4, account recovery, authenticator binding, and independent
   notification: <https://pages.nist.gov/800-63-4/sp800-63b.html>
2. IETF RFC 9180, “Hybrid Public Key Encryption”:
   <https://www.rfc-editor.org/rfc/rfc9180>
3. NIST SP 800-38D, “Recommendation for Block Cipher Modes of Operation:
   Galois/Counter Mode (GCM) and GMAC”:
   <https://csrc.nist.gov/pubs/sp/800/38/d/final>
