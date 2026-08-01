# Onym Recovery Trustee Seat

**Architecture draft 0.1 — August 2026**

> A recovery trustee holds only the authority the identity holder enrolled.
> It can help satisfy a recovery policy; it does not become the identity.

This document defines the technology-neutral contract surface for an Onym
recovery trustee. A trustee may be a person, an organization, a hardware
device, a hosted custody service, or an automated service. Anyone may publish
a conforming offer, and an identity holder may combine trustees from different
operators and trust domains.

The first implementation profiles are:

- [Recovery-Trustee-Cloud.md](Recovery-Trustee-Cloud.md), a deliberately
  custodial single-provider service that stores an encrypted recovery artifact
  and can release the key after its recovery policy is satisfied; and
- [Recovery-Trustee-Shamir.md](Recovery-Trustee-Shamir.md), a threshold
  arrangement in which independently selected trustees hold Shamir shares and
  no one trustee can recover the protected secret.

This boundary extends the recovery ceremony required by
[../identity/UI-Identity.md](../identity/UI-Identity.md). It does not change
the normal identity capability port and does not grant a trustee ordinary
signing, decryption, messaging, group, banking, or notary authority.

## 1. Decision

Onym makes recovery an open, replaceable service seat rather than a hidden
privilege of the UI publisher or identity-vault vendor.

- The **identity holder** chooses a recovery policy while the identity is
  healthy and can rotate or revoke it.
- The **vault** creates and consumes recovery artifacts locally. It never
  gives a requester ambient access to the root secret.
- A **recovery trustee** holds one declared recovery contribution and releases
  it only through the enrolled policy.
- A **recovery coordinator** transports session objects and trustee responses.
  It need not be trusted with plaintext recovery material.
- A **recovery candidate** controls the new destination device and asks the
  trustees to recover to that device.
- An **implementation-profile author** defines how artifacts and trustee
  contributions are protected and combined.
- A **directory or UI publisher** may recommend providers under its own
  policy, but cannot make direct use of a compatible trustee invalid.

One party may occupy several roles, but their authority remains explicit. A
cloud provider may be both coordinator and trustee. A family member may be a
trustee through an app. A UI publisher may operate a default trustee, but it
does not gain recovery authority unless the holder actually enrolls that
component.

Payment purchases the declared custody, availability, notification, or
recovery service. It is not ownership of the identity, a permanent royalty on
the recovered person, permission to inspect other identity activity, or a
right to veto migration.

## 2. What recovery means

Every recovery profile must declare one of two materially different modes:

1. **secret restoration** returns the same root or recovery secret to a new
   vault. It preserves deterministic keys, but any undiscovered copy or prior
   compromise of that secret remains effective; or
2. **authority migration** authorizes a new root or operational key under a
   previously published recovery authority. It can retire the old key, but
   downstream groups, registries, seats, and chains follow only if their own
   protocols recognize the migration.

Satisfying a trustee policy proves only that the enrolled recovery conditions
were met. It does not prove a timeless fact about who the “real person” is.
Trustees can be deceived, coerced, compromised, unavailable, or colluding.

For either mode, successful recovery should lead immediately to:

- binding fresh device authenticators;
- revoking the recovery session and one-time factors;
- rotating the recovery enrollment and all trustee contributions;
- publishing any supported identity-key rotation or compromise record; and
- re-evaluating high-value financial and group relationships separately.

Restoring a stolen mnemonic does not make it secret again. Where authority
migration is unsupported, the UI must say that clearly rather than displaying
“identity secured.”

## 3. Scope and non-goals

The seat provides:

1. discovery of signed trustee manifests and offers;
2. enrollment under a versioned recovery policy;
3. durable storage of a provider- or share-specific contribution;
4. policy-bound recovery sessions addressed to a fresh destination key;
5. approval, refusal, timeout, cancellation, and notification;
6. signed receipts sufficient to diagnose and dispute service behavior;
7. rotation, revocation, export, and closure; and
8. explicit payment, lapse, retention, and deletion semantics.

The seat does not:

- continuously back up chats, attachments, app settings, or device state;
- silently escrow a mnemonic merely because a user installed a UI;
- decide who may control a group, registry name, bank account, or blockchain
  asset after identity recovery;
- guarantee legal succession, inheritance, incapacity, or death handling;
- make plaintext email, chat messages, or support tickets safe channels for a
  seed or trustee share;
- turn a checksum into proof that an honest trustee approved; or
- guarantee deletion from a custodian's historical backups.

Succession and inheritance require a separate policy with jurisdiction,
evidence, delay, challenge, and fiduciary rules. They must not be smuggled into
ordinary device-loss recovery.

## 4. Logical topology

```text
healthy identity vault
  |-- creates canonical RecoveryArtifact
  |-- protects it under the selected implementation profile
  |-- enrolls provider contribution(s)
  `-- records signed enrollment receipt(s)

later, on a new device
  recovery candidate
      | creates fresh destination key + random session ID
      v
  recovery coordinator (untrusted transport is allowed)
      | forwards one bound RecoverySession
      +----------------------+----------------------+
      v                      v                      v
   trustee A              trustee B              trustee N
   verify policy          verify policy          verify policy
   approve/refuse         approve/refuse         approve/refuse
      +----------------------+----------------------+
                             |
                             | contribution encrypted to destination key
                             v
                    recovery vault on new device
                    reconstructs or unwraps locally
                    verifies artifact and identity
                    rotates enrollment and keys
```

The coordinator may observe timing, trustee choices, network addresses, and
session size. An implementation that claims coordinator blindness must define
the routing and padding mechanism that provides it. End-to-end encryption of
trustee contributions does not by itself hide this metadata.

## 5. Boundary objects

### 5.1 Recovery Trustee Profile

A `RecoveryTrusteeProfile` fixes portable semantics without selecting a
custody or threshold technology:

```json
{
  "profileVersion": 1,
  "profileId": "onym:recovery-profile:trustee-v1",
  "interface": "onym-recovery-trustee-v1",
  "recoveryModes": ["secret-restoration", "authority-migration"],
  "operations": [
    "enroll",
    "read-enrollment",
    "bootstrap-recovery",
    "begin-recovery",
    "contribute-recovery",
    "read-recovery",
    "cancel-recovery",
    "finalize-recovery",
    "rotate-enrollment",
    "revoke-enrollment",
    "export-enrollment",
    "close-enrollment"
  ],
  "policySchema": "onym-recovery-policy-v1",
  "sessionSchema": "onym-recovery-session-v1",
  "receiptSchema": "onym-recovery-receipt-v1",
  "errorSchema": "onym-recovery-errors-v1",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

Two implementations conform to the same abstract profile only if they preserve
the operation meanings, holder controls, destination binding, state changes,
receipts, and failure semantics below. Both storing something called a
“backup” is not compatibility.

### 5.2 Recovery Implementation Profile

A `RecoveryImplementationProfile` maps the abstract surface to one concrete
construction:

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:recovery-implementation:<technology>-v1",
  "recoveryProfileId": "onym:recovery-profile:trustee-v1",
  "custodyClass": "<single-provider-custodial-or-threshold>",
  "recoveryModes": ["<supported-mode>"],
  "artifactProtection": "<content-addressed-cryptographic-suite>",
  "contributionFormat": "<content-addressed-format>",
  "destinationBinding": "<content-addressed-protocol>",
  "verification": "<integrity-and-authenticity-rules>",
  "rotation": "<implemented-rotation-semantics>",
  "testVectors": "<content-addressed-fixture-set>",
  "signature": "<implementation-publisher-signature>"
}
```

An implementation profile must state exactly which combinations of parties
can recover, deny recovery, or destroy availability. “Encrypted” and
“decentralized” are not custody descriptions.

### 5.3 Trustee Service Manifest

Each operator publishes a signed manifest:

```json
{
  "version": 1,
  "componentId": "onym:component:<trustee-id>",
  "seat": "identity.recovery-trustee",
  "operator": "onym:key:<operator-id>",
  "recoveryProfileId": "onym:recovery-profile:trustee-v1",
  "implementationProfileIds": [
    "onym:recovery-implementation:<technology>-v1"
  ],
  "endpoints": ["<enrollment-and-recovery-endpoint>"],
  "trustDomain": "<operator-declared-administrative-domain>",
  "jurisdiction": "<operator-declared-jurisdiction-or-none>",
  "retention": "<content-addressed-retention-policy>",
  "recoveryFactors": ["<supported-factor-classes>"],
  "notificationChannels": ["<supported-independent-channels>"],
  "offers": ["<seat-offer-id>"],
  "validUntil": "2027-08-01T00:00:00Z",
  "signature": "<operator-signature>"
}
```

`trustDomain` is a provider assertion used to help users avoid accidental
concentration; it is not proof of independence. A directory may verify
corporate control, infrastructure, audits, insurance, jurisdiction, or
incident history under a separately published listing policy.

### 5.4 Recovery Policy

The holder approves a canonical, versioned policy before enrollment:

```json
{
  "policyVersion": 1,
  "policyId": "<random-id>",
  "recoveryMode": "secret-restoration",
  "identityBindingCommitment": "<enrollment-scoped-opaque-commitment>",
  "implementationProfileId": "onym:recovery-implementation:<technology>-v1",
  "trustees": [
    {
      "componentId": "onym:component:<trustee-id>",
      "slot": "<opaque-slot>",
      "authorizationPublicKey": "<trustee-scoped-public-key>"
    }
  ],
  "approvalRule": "<implementation-defined-rule>",
  "candidateFactors": ["<pre-enrolled-factor-requirements>"],
  "cooldown": "P2D",
  "sessionLifetime": "P7D",
  "maximumAttempts": 3,
  "notifications": ["<independent-destination-references>"],
  "holderVeto": "<veto-method-and-deadline>",
  "lapsePolicy": "<grace-export-destruction-rule>",
  "createdAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2027-08-01T00:00:00Z",
  "authorization": "<healthy-vault-authorization-from-recovery-scoped-key>"
}
```

The policy is part of the security boundary. An operator cannot substitute a
shorter delay, weaker factors, different destination rule, different
trustees, lower threshold, or later policy version during recovery. More
protective emergency action—such as refusing after detecting fraud—is allowed
only under a predeclared rule and must produce a reasoned receipt.

The canonical policy, including the complete `trustees` array, is holder-
private by default. A single-custodian profile may send the full policy to its
only trustee. A multi-trustee profile instead sends each trustee a signed
`TrusteeEnrollmentAuthorization` containing only the common parameters and
that trustee's slot and enforcement terms:

```json
{
  "authorizationVersion": 1,
  "recoveryProfileId": "onym:recovery-profile:trustee-v1",
  "implementationProfileId": "onym:recovery-implementation:<technology>-v1",
  "enrollmentId": "<random-256-bit-id>",
  "enrollmentSequence": 1,
  "policyDigest": "<digest-of-canonical-private-policy>",
  "identityBindingCommitment": "<opaque-commitment-from-policy>",
  "artifactDigest": "<digest-of-protected-artifact>",
  "recoveryMode": "secret-restoration",
  "trustee": {
    "componentId": "onym:component:<this-trustee-id>",
    "slot": "<this-opaque-slot>"
  },
  "trusteeChallenge": "<fresh-single-use-challenge-issued-for-this-slot>",
  "contributionParameters": "<profile-defined-threshold-or-custody-parameters>",
  "trusteePolicy": {
    "candidateFactors": ["<this-trustee-factor-bindings>"],
    "cooldown": "P2D",
    "sessionLifetime": "P7D",
    "maximumAttempts": 3,
    "notifications": ["<this-trustee-destination-references>"],
    "holderVeto": "<this-trustee-veto-method-and-deadline>",
    "lapsePolicy": "<this-trustee-grace-export-destruction-rule>"
  },
  "expiresAt": "2027-08-01T00:00:00Z",
  "authorizationPublicKey": "<this-trustee-scoped-public-key-from-private-policy>",
  "holderAuthorization": "<signature-over-canonical-object-with-this-field-omitted>"
}
```

The trustee verifies this signature, its own component and slot, the current
enrollment sequence, the profile and artifact bindings, and the exact local
policy it must enforce. It also consumes an unexpired, single-use challenge
that it issued after accepting the invitation or authenticating an authorized
service enrollment; possession of its published encryption key alone cannot
create an accepted record. It treats `policyDigest` as an opaque binding
because it cannot recompute the private full-policy digest. The holder and
recovering vault verify the full policy and require every contribution to bind
the same digest. A directory, coordinator, or trustee receives no other
trustee entry merely to validate one slot.

The healthy vault authorizes each enrollment slot with a distinct trustee-
scoped key recorded in the private policy. Separate trustees therefore do not
receive a shared authorization key that trivially links them. A provider need
not learn the root public identity. The subject commitment uses a random
binding salt held inside the encrypted artifact, so providers cannot use it as
a stable cross-enrollment identity tag. That healthy authorization is not
required to begin recovery, because recovery handles loss of the old signing
ability.

### 5.5 Recovery Artifact

A `RecoveryArtifact` is a canonical vault export consumed only by a recovery
implementation:

```json
{
  "artifactVersion": 1,
  "artifactId": "<random-256-bit-id>",
  "recoveryMode": "secret-restoration",
  "identitySubject": "onym:key:<self-certifying-id>",
  "descriptorDigest": "<digest-of-enrollment-descriptor>",
  "identityBindingSalt": "<random-256-bit-value>",
  "payloadSchema": "<vault-export-schema>",
  "payload": "<root-secret-or-migration-authority-inside-encryption-only>",
  "createdAt": "2026-08-01T00:00:00Z"
}
```

The plaintext form never crosses the recovery boundary. The vault serializes
it canonically and immediately protects it under the implementation profile.
The portable network/storage form is a `ProtectedRecoveryArtifact`:

```json
{
  "protectedArtifactVersion": 1,
  "implementationProfileId": "onym:recovery-implementation:<technology>-v1",
  "enrollmentId": "<random-256-bit-id>",
  "enrollmentSequence": 1,
  "policyDigest": "<digest-of-canonical-private-policy>",
  "identityBindingCommitment": "<opaque-commitment-from-policy>",
  "recoveryMode": "secret-restoration",
  "artifactId": "<same-random-256-bit-id-as-plaintext-artifact>",
  "protectionParameters": "<profile-defined-suite-nonce-and-version>",
  "ciphertext": "<authenticated-encryption-of-RecoveryArtifact>",
  "artifactDigest": "<digest-over-canonical-object-with-this-field-omitted>"
}
```

Every field needed to reconstruct the implementation profile's associated
data is outside the ciphertext in this object. The values are not secret keys,
but they are private recovery metadata and are disclosed only through an
authorized bootstrap path or opaque artifact location. After decryption, the
vault requires the internal `artifactId`, recovery mode, subject commitment,
and descriptor binding to match the protected header.

The vault computes the policy's subject commitment from a domain separator,
`identityBindingSalt`, `identitySubject`, and `descriptorDigest`. A recovering
vault recomputes it after authenticated decryption; a trustee treats the
commitment as an opaque enrollment binding.

Profiles should protect a random recovery-unlock key and use that key to
AEAD-encrypt the artifact, instead of applying ad hoc encryption directly to
a human mnemonic. This gives the client a uniform integrity check and keeps
the trustee construction independent of the vault's seed format.

### 5.6 Recovery Enrollment

```json
{
  "enrollmentVersion": 1,
  "enrollmentId": "<random-256-bit-id>",
  "policy": "<canonical-RecoveryPolicy>",
  "artifactId": "<same-id-as-ProtectedRecoveryArtifact>",
  "artifactDigest": "<digest-of-encrypted-artifact-and-associated-data>",
  "artifactLocators": ["<opaque-content-location>"],
  "contributions": [
    {
      "componentId": "onym:component:<trustee-id>",
      "slot": "<opaque-slot>",
      "contributionDigest": "<digest-of-sealed-contribution>"
    }
  ],
  "enrollmentSequence": 1,
  "status": "active",
  "createdAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2027-08-01T00:00:00Z",
  "holderAuthorization": "<healthy-vault-authorization-from-recovery-scoped-key>",
  "trusteeReceipts": ["<signed-enrollment-receipt>"]
}
```

The random enrollment ID, policy digest, sequence, artifact digest, and
trustee slot are bound into every contribution. This prevents an old share,
old artifact, or response for another identity from being silently accepted.
Public discovery should not expose enrollment IDs or trustee relationships.

An enrollment is active only after the client has verified enough signed
receipts to satisfy the implementation's availability rule. “Upload
succeeded” is not equivalent to a recoverable enrollment.

### 5.7 Recovery Session

A new device has no enrollment state from which to construct a session. Every
implementation profile therefore defines an authorized bootstrap mechanism
that returns this private `RecoveryBootstrap` object before `begin-recovery`:

```json
{
  "bootstrapVersion": 1,
  "recoveryProfileId": "onym:recovery-profile:trustee-v1",
  "implementationProfileId": "onym:recovery-implementation:<technology>-v1",
  "enrollmentLocator": "<opaque-account-offline-or-trustee-lookup-token>",
  "enrollmentId": "<current-enrollment-id>",
  "enrollmentSequence": 1,
  "policyDigest": "<current-private-policy-digest>",
  "artifactId": "<current-artifact-id>",
  "artifactDigest": "<current-protected-artifact-digest>",
  "protectedArtifact": "<ProtectedRecoveryArtifact-or-authorized-private-locator>",
  "trusteeDiscovery": "<profile-defined-private-routes-or-provider-reference>",
  "issuedAt": "2026-08-01T00:00:00Z",
  "bootstrapProof": "<provider-signature-or-enrollment-time-holder-signed-map-proof>"
}
```

The bootstrap path may be an authenticated provider-account lookup, an
encrypted offline recovery map, or trustee-side resolution of an opaque token.
It must define enumeration resistance, rate limits, privacy, rollback
protection, and how the candidate obtains the current sequence and protected
artifact without the old identity key. If every bootstrap copy and lookup path
is lost, private trustee discovery may be impossible even when all shares
still exist; the enrollment ceremony must test and disclose that failure mode.

```json
{
  "sessionVersion": 1,
  "sessionId": "<random-256-bit-id>",
  "enrollmentId": "<opaque-enrollment-id>",
  "enrollmentSequence": 1,
  "policyDigest": "<expected-private-policy-digest>",
  "artifactId": "<expected-artifact-id>",
  "artifactDigest": "<expected-digest>",
  "destination": {
    "encryptionSuite": "<profile-defined-public-key-encryption-suite>",
    "encryptionPublicKey": "<fresh-recovery-destination-public-key>",
    "proofSuite": "<profile-defined-signature-suite>",
    "proofPublicKey": "<fresh-session-proof-public-key>"
  },
  "candidateEvidence": ["<policy-permitted-factor-presentations>"],
  "requestedAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2026-08-08T00:00:00Z",
  "candidateProof": "<signature-by-fresh-proof-key-over-canonical-request-with-this-field-omitted>"
}
```

Both destination keys are generated on the recovering device for this
session. The proof signature demonstrates control of the request without
pretending to authenticate the old identity; the encryption key receives the
sealed contribution. Every trustee contribution is cryptographically bound to
the exact session, enrollment sequence, policy digest, artifact ID and digest,
and both destination keys. A coordinator or support agent must not receive
plaintext recovery material.

Trustees evaluate the enrolled factors and policy, apply rate limits and the
cooldown, notify the holder or designees through independent channels, and
then contribute, refuse, or allow the session to expire. A code copied into a
website or sent manually is not phishing-resistant merely because it expires.

### 5.8 Trustee Contribution

```json
{
  "contributionVersion": 1,
  "sessionId": "<same-session-id>",
  "enrollmentId": "<same-enrollment-id>",
  "enrollmentSequence": 1,
  "policyDigest": "<same-policy-digest>",
  "artifactId": "<same-artifact-id>",
  "artifactDigest": "<same-artifact-digest>",
  "componentId": "onym:component:<trustee-id>",
  "slot": "<opaque-slot>",
  "decision": "approved",
  "destinationKeysDigest": "<digest-of-both-session-destination-keys>",
  "sealedContribution": "<encrypted-only-to-session-destination>",
  "decidedAt": "2026-08-03T00:00:00Z",
  "expiresAt": "2026-08-08T00:00:00Z",
  "signature": "<trustee-signature>"
}
```

The signature proves which component made the contribution and what session
it addressed. It does not reveal the contribution. Refusals use the same
object with a bounded reason code and no `sealedContribution`.

### 5.9 Recovery Receipt

Every state-changing operation returns a signed receipt containing:

- operation and unique request ID;
- component, enrollment, sequence, and session references as applicable;
- accepted policy and implementation-profile digests;
- old and new state;
- time, expiry, and bounded result or refusal code;
- evidence digest without secret or candidate factor values; and
- operator signature.

Receipts prove what a component asserted. They do not prove secure erasure,
honest human review, correct backup replication, or that an operator retained
no undeclared copy.

## 6. Common contract surface

| Operation | Caller and input | Result |
|---|---|---|
| `enroll` | Healthy vault; policy, protected artifact, trustee contribution | Active or pending enrollment plus signed receipt |
| `read-enrollment` | Holder or authorized recovery client; enrollment reference | Current sequence, status, policy digest, expiry, and service health |
| `bootstrap-recovery` | Candidate; profile-defined account, offline map, or trustee lookup evidence | Private current `RecoveryBootstrap` or non-enumerating refusal |
| `begin-recovery` | Candidate; fresh destination key and permitted factors | Pending session with cooldown and notification state |
| `contribute-recovery` | Enrolled trustee; session decision | Destination-bound sealed contribution or refusal |
| `read-recovery` | Candidate or trustee; session reference | Non-secret session state and contribution receipts |
| `cancel-recovery` | Holder veto or authorized candidate | Cancelled terminal session |
| `finalize-recovery` | Recovering vault; artifact verification evidence | Final receipt; never plaintext secret |
| `rotate-enrollment` | Healthy or just-recovered vault; new sequence and contributions | New active enrollment; old sequence superseded |
| `revoke-enrollment` | Healthy vault or profile-defined recovery authority | Enrollment can no longer approve new sessions |
| `export-enrollment` | Holder ceremony | Portable encrypted artifact, policy, and receipts where supported |
| `close-enrollment` | Holder under retention policy | Closed state and deletion schedule/receipt |

Operations are idempotent by request ID. Retrying cannot create a second
enrollment, shorten a delay, count the same trustee twice, or produce multiple
billable recoveries.

## 7. State machines

### 7.1 Enrollment

| Current state | Event or operation | Next state |
|---|---|---|
| `draft` | First trustee accepts | `pending_receipts` |
| `draft` or `pending_receipts` | Holder cancels/closes | `closed` |
| `pending_receipts` | Activation rule and bootstrap test succeed | `active` |
| `active` | Holder starts a fully authorized replacement sequence | `rotating` |
| `rotating` | Replacement sequence becomes active | `superseded` |
| `rotating` | Replacement is abandoned before activation | `active` |
| `rotating` | Holder invokes `close-enrollment` | `closed` |
| `active` | Revocation authority invokes `revoke-enrollment` | `revoked` |
| `active` | Declared term ends without renewal | `expired` |
| `active` | Holder invokes `close-enrollment` | `closed` |
| `superseded`, `revoked`, or `expired` | Holder/provider records logical closure and deletion schedule | `closed` |

Only one sequence is current. A client refuses rollback to a lower sequence,
even when a trustee presents a valid old signature. Rotation creates fresh
cryptographic contributions; renaming an old share is not rotation. Entering
`closed` blocks new recovery contributions immediately even when physical
deletion continues under a declared retention schedule.

### 7.2 Recovery session

```text
requested -> cooling_down -> collecting -> threshold_satisfied -> finalized
     |             |             |                 |
     +-------------+-------------+-----------------+--> cancelled
                   +-------------+--------------------> expired
                                 +--------------------> refused
```

`threshold_satisfied` means enough implementation-specific contributions are
available to the destination client. It is not permission for a server to log
or display the recovered secret.

## 8. Holder and UI obligations

A conforming vault and UI must:

1. enroll recovery only in a dedicated holder-facing ceremony while the vault
   is healthy;
2. show the custody class in plain language, including exactly who can recover
   alone and how many trustees can collude or disappear before failure;
3. require the holder to verify enough trustee receipts before declaring the
   identity recoverable;
4. keep recovery artifacts, keys, shares, mnemonics, candidate factors, and
   trustee relationships out of analytics, logs, screenshots, clipboard
   history, and crash reports;
5. generate fresh destination encryption and proof keys for every session and
   keep both private keys on the recovering device;
6. verify profile, manifest, policy, enrollment sequence, artifact digest,
   destination binding, trustee signatures, distinct slots, expiry, and final
   artifact integrity before import;
7. display cooldown, notifications, outstanding approvals, refusal, expiry,
   and cancellation honestly;
8. support rotation, provider replacement, export where promised, and closure
   without an ordinary capability requester observing the ceremony;
9. warn that exact-secret restoration cannot neutralize another surviving
   copy of that secret; and
10. after success, bind fresh local authentication and guide the holder through
    recovery rotation and downstream compromise review.

The UI must not describe a 1-of-1 provider as threshold recovery, a group of
brands under common control as independent, or an artifact stored in several
backups under one key as multi-trustee custody.

## 9. Trustee obligations

A conforming trustee must:

1. verify the selected profile, enrollment sequence, contribution binding,
   and either the holder-signed full policy or its signed trustee-specific
   enrollment authorization before accepting custody;
2. authenticate state-changing requests over a protected channel and prevent
   replay;
3. protect its contribution according to the implementation profile and keep
   it out of routine operator access, logs, support tools, and backups not
   covered by the declared controls;
4. evaluate only pre-enrolled recovery factors and policy—support discretion
   cannot silently replace the policy;
5. bind an approval to both fresh destination keys, one session, artifact
   digest, enrollment sequence, and expiry;
6. notify every enrolled independent channel at the declared lifecycle events;
7. enforce attempt limits, cooldown, veto, expiry, and terminal session state;
8. issue signed receipts without publishing identity, factor, or social-graph
   data;
9. disclose incidents, key/control changes, outages, subcontractors, and
   retention changes that affect the offer;
10. support rotation, revocation, lapse, export, and closure exactly as
    declared; and
11. never condition emergency export or migration on an undisclosed fee,
    identity disclosure, product purchase, or future royalty.

A trustee may lawfully refuse under its declared policy or applicable law. It
must represent this censorship and jurisdiction risk in its offer; protocol
conformance cannot remove it.

## 10. Privacy boundary

Trustee recovery necessarily exposes some relationship metadata. Depending on
the profile, a provider may learn that:

- one opaque enrollment exists and remains active;
- a recovery attempt occurred at a time and network location;
- particular factors or trustee approvals were presented;
- a recovery reached a terminal state; and
- payment for the seat was made, lapsed, reversed, or refunded.

The minimum public evidence is an operator manifest. Enrollments, trustee
sets, recovery sessions, notifications, receipts, and payment links remain
private to their participants unless disclosure is required for a dispute.
They must not be placed on a public notary or blockchain by default.

Trustee-specific pseudonymous keys and opaque slot identifiers should be used
so separate providers cannot trivially join the holder's other seat activity.
Payment credentials must not be placed in recovery artifacts or identity
descriptors. A directory or billing broker does not receive candidate factors
or recovery contributions.

## 11. Security invariants and threats

| Invariant or threat | Required treatment |
|---|---|
| Trustee self-appointment | Only a holder-authorized enrollment sequence grants a slot |
| Coordinator compromise | Contributions are encrypted to the fresh destination; coordinator cannot combine them |
| Replay or rollback | Bind every object to random IDs, sequence, artifact digest, destination, and expiry |
| Trustee collusion | UI states the exact collusion threshold; profiles cannot claim to eliminate it |
| Trustee unavailability | UI states the exact availability threshold and encourages independent failure domains |
| Candidate phishing | Prefer session-bound cryptographic factors; manual codes are not labelled phishing-resistant |
| Malicious contribution | Verify signatures and final artifact integrity; profile declares whether individual shares are verifiable |
| Artifact substitution | AEAD associated data binds identity, policy, enrollment, mode, sequence, and artifact ID; `artifactDigest` commits to the protected header and ciphertext |
| Root compromise | Same-secret restoration cannot revoke an attacker's copy; migrate authority where supported |
| Silent policy downgrade | Client compares the enrolled canonical policy and refuses weaker recovery behavior |
| Metadata correlation | Keep enrollment/session records private and use scoped identifiers and minimal receipts |
| Provider shutdown or lapse | Predeclare grace, export, migration, retention, and terminal deletion behavior |
| Deletion claim | Receipt is an operator assertion; backups and compelled copies remain disclosed risks |

No recovery scheme protects against a malicious vault that steals the secret
before it is protected or after it is reconstructed. Endpoint integrity remains
decisive.

## 12. Offers, payment, and open participation

Anyone may offer a trustee seat directly or through competing directories. A
`SeatOffer` may charge:

- once per enrollment or rotation;
- periodically for custody and availability;
- per initiated or completed recovery;
- for higher assurance, independent notifications, hardware protection, or
  audited operations; or
- nothing, including reciprocal or family trustees.

The offer must declare at least:

- custody and recovery service being purchased;
- price, rail, term, renewal, refund, taxes, and settlement recipient;
- recovery fees and caps known before enrollment;
- grace period and exact behavior after lapse;
- export and migration rights;
- retention and deletion schedule;
- operator jurisdiction and complaint path; and
- any UI publisher, billing broker, directory, or other disclosed split.

Each provider receives only its selected offer revenue after disclosed channel
fees, taxes, refunds, and agreed splits. It acquires no claim on future UI,
transport, bank, charity, notary, or identity revenue. A trustee may not sell
or transfer its enrolled role to a new operator without the holder-authorized
rotation required by the policy.

Open participation means permissionless compatibility, not automatic trust.
A UI or directory may require audits, legal identity, insurance, hardware
controls, uptime, incident response, or conformance tests before recommending
a provider. A holder remains free to import a compatible manifest directly.

## 13. Portability and replacement

Replaceability depends on custody class:

- In a **single-provider custodial** profile, export requires the provider to
  release or rewrap material. The service is therefore technically capable of
  refusing migration; this is a disclosed custody risk, not abstracted away.
- In a **threshold** profile, the holder can migrate when enough trustees
  cooperate. A single old trustee is replaceable only through a fresh
  re-sharing ceremony; copying one old share into a renamed slot is not safe
  rotation.
- In a **holder-second-factor** profile, both the service and holder factor may
  be necessary. Losing either can make export and recovery impossible.

Portable export contains no plaintext secret. It includes the protected
artifact, canonical policy, implementation profile, enrollment sequence,
necessary private receipts, and declared contribution envelopes. Import into
another implementation is allowed only when that implementation understands
the exact cryptographic format and custody semantics.

## 14. Conformance

An implementation claiming `onym:recovery-profile:trustee-v1` must publish
fixtures that test at least:

1. canonical object encoding and signatures;
2. enrollment receipt and activation thresholds;
3. authorized fresh-device bootstrap, current-sequence discovery, privacy,
   enumeration resistance, and bootstrap-loss behavior;
4. stale sequence and artifact substitution refusal;
5. duplicate trustee/slot rejection;
6. fresh destination-key binding;
7. retry idempotency and replay refusal;
8. cooldown, veto, notification, attempt limit, expiry, and cancellation;
9. successful recovery and corrupted-artifact failure;
10. rotation and inability to use superseded contributions;
11. lapse, export, closure, and declared retention outcomes; and
12. redaction of secrets and factors from errors, logs, telemetry, and
    receipts.

Security review must evaluate the concrete implementation profile. Passing
the abstract state-machine tests does not validate cryptography, operational
custody, human trustee judgment, or cloud controls.

## 15. Errors

At minimum, implementations normalize failures to:

- `unsupported_profile`
- `invalid_manifest`
- `invalid_policy`
- `invalid_enrollment`
- `enrollment_pending`
- `enrollment_expired`
- `enrollment_revoked`
- `stale_enrollment_sequence`
- `artifact_mismatch`
- `invalid_destination`
- `bootstrap_unavailable`
- `invalid_candidate_factor`
- `recovery_cooling_down`
- `recovery_rate_limited`
- `recovery_vetoed`
- `recovery_refused`
- `recovery_expired`
- `insufficient_contributions`
- `invalid_contribution`
- `payment_required`
- `service_lapsed`
- `export_unavailable`
- `temporarily_unavailable`

Errors reveal no mnemonic, share, recovery code, factor value, candidate
evidence, trustee-set membership, or existence of an enrollment to an
unauthorized caller.

## 16. Status

This contract surface and both initial implementation profiles are proposals.
They do not claim that current Onym clients, vaults, providers, or identities
already implement recoverable enrollment. No production UI should advertise
the seat until canonical encodings, cryptographic test vectors, independent
review, incident procedures, and end-to-end recovery/rotation drills exist.

## References

1. Adi Shamir, “How to Share a Secret,” *Communications of the ACM* 22(11),
   1979: <https://doi.org/10.1145/359168.359176>
2. SatoshiLabs, “SLIP-0039: Shamir's Secret-Sharing for Mnemonic Codes”:
   <https://github.com/satoshilabs/slips/blob/master/slip-0039.md>
3. NIST SP 800-63B-4, “Authentication and Authenticator Management,” account
   recovery and notification requirements:
   <https://pages.nist.gov/800-63-4/sp800-63b.html>
4. IETF RFC 9180, “Hybrid Public Key Encryption”:
   <https://www.rfc-editor.org/rfc/rfc9180>
