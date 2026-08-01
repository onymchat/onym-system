---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym UI ↔ Identity Vault Boundary

**Architecture draft 0.1 — August 2026**

> The identity vault holds the keys. The UI presents choices. Applications
> request narrow operations. None of them becomes the owner of the person.

This document defines the technology-neutral boundary between an Onym
frontend, its applications, and the identity vault that controls a user's
root secret and purpose-specific keys. It does not require a particular
mnemonic standard, derivation function, curve set, storage hardware, custody
arrangement, or recovery ceremony.

A concrete implementation may use a locally generated mnemonic, a hardware
wallet, an operating-system keystore, a threshold custody service, or another
mechanism that satisfies the profile's custody, derivation, consent,
disclosure, and rotation semantics. The current BIP-39 implementation is
specified separately in [UI-Identity-BIP39.md](UI-Identity-BIP39.md).
Optional external recovery custody is a separate open seat defined in
[../recovery/Recovery-Trustee.md](../recovery/Recovery-Trustee.md); enrolling a
trustee does not add it to this normal capability port.

Here **UI** means the frontend application layer, not a screen calling a key
store. Views send intent to flows, view-models, repositories, or interactors.
Those components request typed capabilities from the vault; they do not read
key bytes and re-implement cryptography beside it.

Message delivery is a separate boundary defined in
[../message/UI-Message.md](../message/UI-Message.md). Encrypted media storage
is defined in [../blob/UI-Blob.md](../blob/UI-Blob.md). Shared-state
validation is defined in [../notary/UI-Notary.md](../notary/UI-Notary.md).
Names and credentials issued about an identity are association-registry
claims, not vault contents.

## 1. Decision

Onym treats the identity holder, vault implementation, custody hardware,
capability requesters, and association registries as independently owned
components joined by versioned interfaces.

- The **identity holder** owns the identity by controlling its root secret
  and recovery material. Every other party acts only through capabilities the
  holder grants.
- The **vault implementation author** publishes software that generates,
  stores, derives, and uses key material under local policy and consent. It
  does not thereby acquire the identities created with it.
- The **custody or hardware provider**, when present, owns its device or
  service and its security claims. It executes operations; it does not become
  the identity.
- The **capability requester**—a chat flow, seat adapter, billing
  coordinator, or external application—owns its own product and legal duties.
  It receives typed results, never key material.
- The **association registry** owns its namespace and issuance policy. It
  asserts names and credentials about an identity without controlling it.
- The **UI publisher** presents identities, consent prompts, and route
  choices. It is a window, not an account authority.

One organization may occupy several roles, but their authorities remain
separate. A user can change UI without re-creating identity. An application
can be revoked without rotating the root secret. A vault implementation can
be replaced through holder-controlled export and recovery, not through a
provider's decision.

The boundary has two interfaces:

1. the local **UI/application ↔ vault** capability port, which carries typed
   requests, consent decisions, and typed results; and
2. the public **identity ↔ verifier** surface, which carries the signed
   identity descriptor, proofs, and signatures that third parties verify.

Neither interface may expose the root secret, recovery material, derived
private keys, or the derivation state that reconstructs them.

## 2. What the identity vault does

The vault provides custody and controlled use of key material:

1. generate or import a root secret and derive purpose-specific keys under
   declared, versioned derivation domains;
2. authenticate the holder locally before use;
3. publish and update a signed public identity descriptor;
4. evaluate capability requests against local policy and explicit consent;
5. execute narrow operations—sign, decrypt, prove, derive—and return typed
   results;
6. maintain per-context and per-seat keys that are unlinkable by default;
7. record grants and support their revocation; and
8. perform rotation, recovery, and compromise procedures defined by its
   implementation profile.

It does not send messages, store conversations, resolve human names, decide
group membership rules, validate purchases, or evaluate the honesty of the
application whose request the holder approves.

## 3. Why this boundary is necessary

### 3.1 It prevents every application from becoming a custodian

If a chat flow, wallet feature, or third-party extension reads the mnemonic
or a raw private key even once, the holder's security reduces to the most
careless component that ever touched it. A capability port makes "uses the
identity" and "holds the identity" different powers.

### 3.2 It prevents the UI from becoming the account authority

Screens and domain flows should not know curves, derivation paths, seed
formats, or storage locations. A narrow port allows another vault—hardware,
threshold, or future post-quantum—without rewriting identity, chat, and
payment flows, and prevents any single UI build from being technically
indispensable.

### 3.3 It makes disclosure reviewable

A cryptographic identity is a root of control, not a public dossier. Each
capability names what a requester learns: one signature, one address, one
membership proof. A named profile must state which values cross the boundary
so cross-context correlation is a reviewable decision rather than an
accident of shared keys.

### 3.4 It bounds the blast radius of compromise

When operational keys, seat keys, and context addresses are separated from
the recovery root, one stolen device or one malicious requester compromises a
declared scope. Rotation and revocation then repair that scope without
abandoning every relationship the identity has.

### 3.5 It keeps names and identities separable

Registries, directories, and applications attach meaning to an identity. The
vault boundary guarantees the reverse never holds: losing a name, a registry,
or an application does not lose the identity, and no issuer can rotate,
freeze, or transfer keys it never held.

## 4. Logical topology

```text
┌──────────────────────────────────────────────────────────────────────┐
│ UI process                                                           │
│                                                                      │
│ View / Composable                                                    │
│        │ user intent                                                 │
│        v                                                             │
│ Flow / ViewModel                                                     │
│        │ application command                                         │
│        v                                                             │
│ Repository / Interactor ──────────────┐                              │
│        │ typed capability request     │ sealed envelopes, proofs,    │
│        v                              │ signatures (results only)    │
│ ┌──────────────────────────┐          │                              │
│ │ Identity vault           │──────────┘                              │
│ │ root secret · derivation │                                         │
│ │ policy · consent · log   │                                         │
│ └──────────┬───────────────┘                                         │
│            │ optional custody operations                             │
└────────────┼─────────────────────────────────────────────────────────┘
             v
   ┌───────────────────────┐        ┌────────────────────────────┐
   │ Hardware / custody    │        │ Public verifiers           │
   │ keystore · signer     │        │ descriptor · signatures ·  │
   │ threshold service     │        │ proofs · address claims    │
   └───────────────────────┘        └────────────────────────────┘
```

The vault is inside the holder's trust boundary; requesters are not, even
when they run in the same process. A capability result is evidence of one
approved operation—not a session of ambient authority, and not proof that
the requesting application is honest.

## 5. Boundary objects

### 5.1 Identity Profile

An `IdentityProfile` defines the portable interface independently of a
mnemonic standard, curve set, or storage technology:

```json
{
  "profileVersion": 1,
  "profileId": "onym:identity-profile:vault-capability-v1",
  "interface": "onym-identity-v1",
  "capabilities": [
    "sign-transaction",
    "prove-address-control",
    "decrypt-envelope",
    "prove-credential",
    "derive-context-address",
    "prove-membership",
    "derive-seat-key"
  ],
  "descriptorSchema": "onym-identity-descriptor-v1",
  "consentModel": "explicit-per-request-or-scoped-grant-v1",
  "derivationDisclosure": "<content-addressed-domain-catalog>",
  "rotationModel": "<declared-rotation-and-revocation-semantics>",
  "recoveryModel": "<declared-recovery-semantics>",
  "errorSchema": "onym-identity-errors-v1",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes capability semantics, descriptor meaning, consent
requirements, and rotation behavior. It does not select a seed format,
key-derivation function, storage hardware, or UI.

Two implementation profiles are compatible only when a conforming requester
receives the same capability semantics, result formats, and disclosure
guarantees from both. Both deriving keys from a seed is not sufficient
compatibility.

### 5.2 Identity Implementation Profile

An `IdentityImplementationProfile` maps the abstract interface onto one
concrete custody and derivation technology:

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:identity-implementation:<technology>-v1",
  "identityProfileId": "onym:identity-profile:vault-capability-v1",
  "rootSecret": "<generation-and-import-rule>",
  "derivationTree": "<content-addressed-specification>",
  "keyDomains": ["<declared-purpose-key-descriptors>"],
  "storage": "<declared-storage-and-unlock-model>",
  "testVectors": "<content-addressed-fixture-set>",
  "rotation": "<implemented-rotation-behavior-or-none>",
  "recovery": "<implemented-recovery-behavior>",
  "signature": "<implementation-profile-publisher-signature>"
}
```

Seed bytes, derivation paths, curve operations, and storage handles stay
inside the vault. The abstract application receives capability results, never
the material that produced them.

### 5.3 Identity Descriptor

The public face of an identity is a signed, versioned `IdentityDescriptor`:

```json
{
  "version": 1,
  "subject": "onym:key:<self-certifying-id>",
  "sequence": 7,
  "validFrom": "2026-08-01T00:00:00Z",
  "verificationMethods": ["<public-key-descriptor>"],
  "services": ["<encrypted-inbox-or-resolution-hint>"],
  "addressClaims": ["<optional-chain-address-proof>"],
  "previous": "<hash-of-prior-descriptor>",
  "signature": "<identity-signature>"
}
```

The subject identifier is self-certifying: it is derived from key material,
so a descriptor proves its own control chain without a registry. A descriptor
contains or references only public keys, addresses, endpoints, and signed
claims. It never contains secrets, and omission is meaningful: keys,
addresses, and relationships the holder has not published are not implied by
the ones it has.

`sequence` and `previous` order descriptor updates so a verifier can detect
rollback. How descriptors are distributed and how freshness is proven are
implementation-profile concerns; the abstract rule is that an old descriptor
is evidence of a past state, not the current one.

### 5.4 Capability request

Every use of the identity is a typed request:

```json
{
  "requestVersion": 1,
  "requestId": "<random-id>",
  "requester": "onym:component:<requester-id>",
  "capability": "sign-transaction",
  "context": "onym:context:<derivation-domain-or-seat>",
  "intent": {
    "display": "<human-readable-summary-shown-to-holder>",
    "payload": "<canonical-bytes-or-structured-operation>",
    "chain": "<chain-and-network-id-when-applicable>"
  },
  "grantRef": "<existing-grant-id-or-null>",
  "expiresAt": "2026-08-01T00:05:00Z"
}
```

`intent.display` and `intent.payload` must describe the same operation; a
vault signs what it displayed, not what a requester substituted. Requests
name their context so the vault selects the scoped key; a requester cannot
address "whatever key is most linkable."

### 5.5 Capability grant

A holder may pre-approve a bounded scope for a requester:

```json
{
  "grantVersion": 1,
  "grantId": "<random-id>",
  "requester": "onym:component:<requester-id>",
  "capabilities": ["decrypt-envelope"],
  "contexts": ["onym:context:<specific-domain>"],
  "constraints": {"maximumOperations": 1000, "requireUnlockedSession": true},
  "issuedAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2026-09-01T00:00:00Z",
  "revocable": true
}
```

Grants are local policy objects. They are narrower than the identity, bound
to named contexts, individually revocable, and never a substitute for
per-operation consent where the profile requires it (signing value-bearing
transactions always does). Revoking a grant must not require rotating the
root secret unless a key was actually compromised.

### 5.6 Capability result

```json
{
  "requestId": "<same-random-id>",
  "status": "completed",
  "capability": "sign-transaction",
  "context": "onym:context:<same-context>",
  "result": "<signature-proof-plaintext-or-derived-public-value>",
  "resultSchema": "<capability-defined-format>",
  "executedAt": "2026-08-01T00:00:03Z"
}
```

The result carries exactly the value the capability defines: a signature, a
decrypted payload, a proof, a fresh public address, a scoped public key. It
never carries the private key that produced it, a sibling key, or derivation
material. A result is single-use evidence; possession of a past result grants
no future authority.

### 5.7 Seat keys

Paid or authenticated seats require an access key that must not be the
holder's long-lived identity key. The `derive-seat-key` capability returns a
pseudonymous public key scoped to one `componentId`:

- the same component always resolves to the same seat key, so entitlements
  survive reinstall and recovery;
- two components' seat keys are unlinkable without the vault; and
- a seat key signs access challenges and entitlement subjects, never group
  operations or descriptor updates.

This is the identity-side half of the entitlement model in the courier,
blob, and notary boundaries: providers authenticate a customer, not a
person's whole identity.

### 5.8 Rotation and revocation records

Rotation replaces a verification method or operational key under the
authority of the descriptor chain; revocation declares a key invalid from a
stated time. Both are signed records referenced by descriptor updates:

```json
{
  "recordVersion": 1,
  "type": "revocation",
  "subject": "onym:key:<self-certifying-id>",
  "method": "<public-key-descriptor>",
  "effectiveFrom": "2026-08-01T00:00:00Z",
  "reason": "compromise-suspected",
  "successor": "<replacement-method-or-null>",
  "signature": "<authorized-identity-signature>"
}
```

An implementation profile states which authority may sign rotation (the same
key, an offline recovery root, a threshold), how verifiers learn of it, and
what happens to group memberships, seat keys, and address claims that
referenced the rotated method. A profile without rotation must say so
explicitly rather than implying it.

## 6. Common identity surface

| Operation | Input | Result |
|---|---|---|
| `create` | Implementation profile, local policy | New identity and initial descriptor |
| `import` | Recovery material via profile-defined ceremony | Restored identity |
| `unlock` | Local authentication | Bounded unlocked session |
| `descriptor` | Identity reference | Current signed `IdentityDescriptor` |
| `request` | `CapabilityRequest` | Consent flow, then `CapabilityResult` |
| `grant` | Requester, capabilities, contexts, constraints | Stored `CapabilityGrant` |
| `revokeGrant` | Grant ID | Grant invalidation |
| `listGrants` | Identity reference | Active grants for holder review |
| `rotate` | Method, successor, authority per profile | Rotation record and descriptor update |
| `revoke` | Method, effective time, authority per profile | Revocation record and descriptor update |
| `export` | Holder-only ceremony per profile | Migration material, never via a requester |
| `wipe` | Holder confirmation | Local destruction of secrets and state |

`unlock` is a local session, not a capability: an unlocked vault still
evaluates every request against policy, grants, and consent. `export` and
`wipe` are holder ceremonies that no capability requester can invoke,
reference, or observe.

## 7. UI/application obligations

A conforming frontend and application layer must:

1. verify the identity and implementation profiles of the vault it embeds or
   connects to;
2. route every key use through the capability port; no component beside the
   vault may hold, cache, derive, or log private key material;
3. render consent prompts from the vault's canonical intent, naming the
   requester, capability, context, and human-readable effect;
4. never re-word, pre-approve, auto-accept, or replay a consent decision, and
   never present a signing request while obscuring its display;
5. keep recovery ceremonies (creation, backup confirmation, import, export)
   in dedicated holder-facing flows that no requester can trigger or watch;
6. request the narrowest capability and context that satisfies the task, and
   request fresh context addresses rather than reusing linkable ones;
7. treat every requester—including the publisher's own features—as scoped:
   first-party code receives no ambient bypass of grants or consent;
8. surface active grants, their usage, and one-step revocation to the holder;
9. present rotation, revocation, and compromise flows without burying them
   behind support channels;
10. propagate descriptor updates it learns of and treat stale descriptors as
    stale, not invalid;
11. never place identity identifiers, seat-key linkages, or descriptor
    history into analytics, crash reports, store metadata, or ordinary logs;
    and
12. warn before any action that publicly links two previously unlinked
    contexts, addresses, or names.

Requester names, intent text, and descriptor service endpoints are untrusted
input. They must not execute code, drive unsafe navigation, or impersonate
consent UI.

## 8. Vault implementation obligations

A conforming vault must:

1. generate root secrets with a cryptographically secure source and store
   them under the strongest local protection the platform provides;
2. implement the declared derivation tree with domain separation such that
   no two declared purposes share a key, and publish that tree with test
   vectors;
3. return capability results only after policy, grant, and consent checks
   bound to the specific request;
4. bind every signature to the intent that was displayed, using canonical
   encodings that a requester cannot ambiguate;
5. enforce context scoping so a requester cannot obtain a key, address, or
   proof outside its named context;
6. derive seat keys deterministically per component while revealing no
   linkage between them, or to the identity, without holder action;
7. keep secrets out of results, errors, logs, backups it does not encrypt,
   memory it does not zero, and interprocess surfaces;
8. rate-limit and bound capability execution so a compromised requester
   cannot silently drain signatures or decryptions;
9. maintain an append-only local record of grants, uses, rotations, and
   revocations that the holder can inspect;
10. implement its declared rotation, revocation, recovery, and wipe
    semantics exactly, and refuse operations its profile does not declare;
11. fail closed: an unverifiable request, unknown requester, or ambiguous
    intent is refused, not guessed at; and
12. remain replaceable: holder-ceremony export produces material sufficient
    to restore the identity in another conforming implementation.

Custody hardware and platform keystores are implementation details behind
these obligations; delegating storage does not delegate consent.

## 9. Capability requester obligations

A conforming requester—seat adapter, application module, or extension—must:

1. identify itself stably and declare, per the extension contract, the
   capabilities it requests and the information it will learn;
2. submit intents whose display and payload match, with canonical payload
   encoding;
3. request per-context material rather than engineering cross-context
   correlation;
4. treat results as single-use evidence and re-request rather than replaying
   or stockpiling signatures, proofs, or plaintext;
5. tolerate refusal: `consent_denied` and `policy_refused` are outcomes, not
   errors to retry until the holder relents;
6. never request export, recovery display, raw keys, or a capability broader
   than its declared purpose; and
7. handle rotation and revocation by re-resolving the descriptor, not by
   caching verification methods indefinitely.

A requester that receives plaintext or a signature owns its subsequent legal
and privacy duties for that value. The vault boundary limits what leaves; it
cannot police what a recipient does afterward.

## 10. Rotation, recovery, and compromise

The abstract boundary requires every implementation profile to answer, not
necessarily to solve identically:

- **Operational separation.** Which keys are used daily, and which authority
  can replace them? A profile should place routine use below a recovery
  authority that is used rarely and stored more safely.
- **Rotation reach.** When a method rotates, which relationships follow
  automatically (descriptor verifiers), which need re-proof (address claims,
  registry credentials), and which need group operations (memberships)?
- **Recovery ceremony.** What restores the identity after device loss—one
  secret, social shares, hardware, a threshold—and what can an attacker with
  partial material do?
- **Compromise declaration.** How does a holder revoke, from what timestamp
  are past signatures still meaningful, and how do verifiers learn?
- **Catastrophic scope.** What is lost when the root itself is exposed? A
  profile must state this plainly; "restore from backup" is not an answer to
  theft.

An implementation that supports external trustees uses the
[Recovery Trustee boundary](../recovery/Recovery-Trustee.md). It declares
whether the ceremony restores the same secret or authorizes a replacement,
and it keeps trustee enrollment, shares, release factors, and reconstruction
outside the ordinary requester interface.

Until a profile implements graduated rotation, its documentation must state
that root compromise is total and unrecoverable, and clients must present
recovery material accordingly.

## 11. Payment at the identity boundary

The vault itself is normally holder-owned software with no per-operation
fee. Payment appears at this boundary in three bounded ways:

1. **Custody services.** A hardware vendor or threshold custodian sells its
   product under its own seat offer. Its payment buys custody service, never
   co-ownership of the identity or a veto on migration.
2. **Seat entitlements.** Other seats authenticate purchased access against
   vault-derived seat keys. Store evidence, broker identity, and entitlement
   state stay in the billing flow; they never enter descriptors, contexts, or
   capability results.
3. **Registry and application fees.** Issuers and applications charge for
   their own services. A paid name or paid feature obtains no capability the
   holder did not grant.

No payment, subscription lapse, refund, or provider dispute can lock, seize,
rotate, or destroy an identity. An identity with zero paid services remains a
complete identity.

## 12. Errors and state machine

| Error | Origin | UI/application response |
|---|---|---|
| `unsupported_profile` | Vault/client | Refuse and explain required implementation |
| `locked` | Vault session | Prompt local authentication; never queue silent retries |
| `consent_denied` | Holder | Accept the decision; no re-prompt loops |
| `policy_refused` | Vault policy | Explain the constraint; do not disguise as failure |
| `unknown_requester` | Vault | Refuse; registration precedes capability use |
| `unknown_context` | Vault | Refuse; contexts come from the declared catalog |
| `intent_mismatch` | Vault validation | Drop request; repeated mismatch indicates hostile requester |
| `grant_expired` | Vault | Re-request grant through holder-visible flow |
| `rate_limited` | Vault | Back off; investigate requester behavior |
| `rotation_in_progress` | Vault | Retry after descriptor update |
| `method_revoked` | Vault/verifier | Re-resolve descriptor; never pin revoked methods |
| `recovery_required` | Vault | Enter holder recovery ceremony |
| `storage_unavailable` | Platform | Surface plainly; never fall back to weaker storage silently |

Capability flow:

```text
request
  -> requester_verified
  -> profile_and_context_validated
  -> policy_checked
  -> grant_matched | consent_prompted
  -> approved | consent_denied
  -> executed
  -> result_returned (typed, secret-free)
```

Identity lifecycle:

```text
created | imported
  -> provisioned (descriptor published)
  -> active <-> locked
  -> rotating -> active
  -> compromised? -> revoked methods -> active | superseded
  -> exported (holder ceremony) | wiped
```

Failure at any validation stage refuses the request. A trusted, first-party,
or frequently approved requester does not receive weaker validation.

## 13. Security and privacy invariants

1. **The root never crosses the boundary.** Mnemonics, seeds, derived private
   keys, and derivation state do not appear in requests, results, errors,
   logs, descriptors, or backups the vault did not encrypt.
2. **Every use is a typed capability.** There is no "get key" operation, no
   generic signing oracle, and no ambient authority from an unlocked session.
3. **Consent binds to displayed intent.** What the holder saw is what was
   signed; canonical encoding makes substitution detectable.
4. **Contexts are unlinkable by default.** Distinct purposes, seats, and
   applications receive distinct keys and addresses; linking them is an
   explicit holder act.
5. **The descriptor is a disclosure, not an inventory.** Publishing an
   identity publishes chosen public facts, never the existence of undisclosed
   keys, addresses, or relationships.
6. **Grants are narrower than the identity.** Scoped, constrained, expiring,
   individually revocable—and revocation does not require root rotation.
7. **Names are claims, not control.** No registry, directory, or application
   holds authority over keys by virtue of naming or paying.
8. **Rotation has declared reach.** Every profile states what a rotation
   repairs, what it re-proves, and what it cannot fix.
9. **Recovery is a holder ceremony.** No capability requester can trigger,
   observe, or intercept export, backup, or import flows.
10. **Compromise scope is honest.** A profile that cannot rotate says so; a
    result of "your identity is gone" is stated, not softened.
11. **Billing stays outside identity.** Store evidence and entitlement state
    never enter descriptors, contexts, or capability results; seat keys keep
    providers from correlating a person across roles.
12. **The vault is replaceable.** The holder can migrate to another
    conforming implementation; no vendor, registry, or payment failure can
    prevent it.

## 14. Versioning and conformance

- `IdentityProfile` changes when capability semantics, descriptor meaning,
  consent requirements, or error meaning changes.
- `IdentityImplementationProfile` changes when root-secret generation,
  derivation tree, key domains, storage model, rotation, or recovery
  behavior changes.
- `IdentityDescriptor` versions are ordered by `sequence` and `previous`;
  verifiers reject forks and rollbacks they can detect.
- New derivation domains are additive capabilities; changing an existing
  domain's meaning requires a new implementation profile, not a silent remap.
- Unknown implementations are never inferred from a mnemonic word count or
  address format.
- Cross-platform fixtures cover derivation vectors, descriptor signing and
  chaining, capability request/result encodings, intent binding, consent
  refusal, grant expiry, seat-key determinism and unlinkability, rotation
  records, and recovery round-trips.
- A vault, a requester, and a verifier from three different authors must
  interoperate using only published profiles and fixtures.

## 15. Concrete implementation profiles

The abstract boundary becomes executable only through a concrete profile.
The current implementation is:

- [UI-Identity-BIP39.md](UI-Identity-BIP39.md) — locally generated BIP-39
  mnemonic, domain-separated derivation of secp256k1/Schnorr, BLS12-381,
  Ed25519/Stellar, and X25519 key material, platform secure storage, and the
  current mobile recovery model.

Future profiles may use hardware-rooted keys, threshold custody, or
post-quantum algorithms while preserving the capability port. They must use
another implementation profile ID when derivation, custody, rotation, or
recovery semantics differ.

## 16. Acceptance criteria

The UI ↔ identity boundary is successfully separated when:

1. a third-party application can obtain signatures, proofs, decryptions, and
   context addresses using only published profiles and the capability port;
2. no component outside the vault—first-party or third-party—can read,
   derive, or reconstruct private key material;
3. the holder can review and revoke any requester's grant without rotating
   the root secret or losing unrelated relationships;
4. two seats, two applications, or two contexts cannot correlate the same
   holder through keys or addresses the vault issued them;
5. every signature a verifier accepts corresponds to an intent the holder
   was shown;
6. descriptors chain, rotate, and revoke such that verifiers detect rollback
   and stop honoring revoked methods;
7. a holder can restore the identity on a new device, and existing grants,
   seat entitlements, and memberships behave exactly as the profile declared;
8. replacing the vault implementation preserves the identity through a
   holder-controlled ceremony;
9. no payment state can lock or seize an identity; and
10. a second custody technology can implement the abstract suite without
    pretending to be the first.

## 17. Justification in one sentence

> Separating the UI and its applications from the identity vault lets a
> person use one identity everywhere without any app, seat, registry, or
> vendor ever holding it—so every other Onym boundary can assume keys that
> no one but their owner controls.
