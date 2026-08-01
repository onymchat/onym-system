---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym UI ↔ Identity: BIP-39 Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Onym identity boundary onto a
> locally generated BIP-39 mnemonic, domain-separated multi-curve derivation,
> and platform secure storage as shipped in the current mobile clients.

This document is a concrete implementation of
[UI-Identity.md](UI-Identity.md). The abstract specification remains
authoritative for capability semantics, consent, descriptor meaning,
rotation, disclosure, and payment isolation. This document defines the
BIP-39 root, the derived key domains, and records where the present iOS,
Android, and SDK code does not yet implement the complete boundary.

The document distinguishes:

- **implemented behavior**, which exists in the current Onym repositories;
- **profile requirements**, which are required for a conforming BIP-39 vault
  implementation; and
- **gaps**, where current code still needs to converge on the profile.

## 1. Conformance declaration

| Abstract concept | BIP-39 mapping |
|---|---|
| Root secret | Twelve-word BIP-39 mnemonic generated locally, per identity |
| Root import | Mnemonic re-entry through the recovery flow |
| Derivation tree | Deterministic, domain-separated derivation from the BIP-39 seed |
| Key domain: event operations | secp256k1 key with Schnorr signing (Nostr-compatible) |
| Key domain: membership proofs | BLS12-381 key for private group trees and proof witnesses |
| Key domain: ledger authorization | Ed25519 key and its Stellar account ID |
| Key domain: sealed delivery | X25519 key for inbox envelopes and invitations |
| Key domain: transport discovery | Derived inbox tag, no readable account name |
| Storage and unlock | Hardware-backed platform keystore and OS-level authentication |
| Identity descriptor | Not yet published (gap; see §8) |
| Capability port | Informal in-process boundaries (gap; see §7) |
| Seat keys | Not yet derived (gap; see §10) |
| Rotation and revocation | None; root is fixed for the identity's lifetime (see §9) |
| Recovery | Full re-derivation from the mnemonic on a new device |

The implementation profile identifier is:

```text
onym:identity-implementation:bip39-multikey-v1
```

It maps this portable profile:

```text
onym:identity-profile:vault-capability-v1
```

The derivation domains, compatibility constants, and inbox-tag construction
are Onym conventions. They are not implied by generic BIP-39 support: another
wallet reading the same mnemonic produces none of these keys unless it
implements this exact tree. A vault claims this implementation profile rather
than inferring compatibility from a twelve-word phrase.

## 2. Ownership mapping

- The **identity holder** generates the mnemonic on their own device and is
  the only party that ever sees it.
- The **vault implementation author** is currently the mobile-client author:
  the identity code ships inside `onym-ios` and `onym-android`, backed by
  shared primitives in `onym-sdk-swift` and `onym-sdk-kotlin`.
- The **custody provider** is the device platform: the OS keystore and its
  hardware protections hold secrets at rest.
- **Capability requesters** are today the in-process messaging, group,
  invitation, and contract flows of the same applications.
- **Association registries and external applications** do not yet integrate;
  nothing outside the client requests capabilities in the current code.

This concentration—UI publisher and vault author being the same party—is the
implementation's largest ownership deviation from the abstract boundary. The
profile exists so that this can become a separation of components rather than
a permanent identity of them.

## 3. Physical topology

```text
UI flow / repository
  |-- identity store: create, unlock, select identity
  `-- domain flows: chat, groups, invitations, contracts
            |
            | in-process key requests (informal port)
            v
      Identity core (client + SDK)
            |
            |-- BIP-39 mnemonic -> seed
            |-- domain-separated derivation
            |     |-- secp256k1/Schnorr  (events)
            |     |-- BLS12-381          (membership proofs)
            |     |-- Ed25519/Stellar    (ledger authorization)
            |     |-- X25519             (sealed inbox)
            |     `-- inbox tag          (transport discovery)
            v
      Platform secure storage
      (hardware-backed keystore, OS unlock)
```

The clients support multiple local identities; each has its own mnemonic,
derivation state, and encrypted local records. Selecting an identity selects
which derivation root serves subsequent flows.

## 4. Root secret

### 4.1 Generation

A new identity generates a twelve-word BIP-39 mnemonic locally using the
platform's cryptographically secure random source. The mnemonic-to-seed step
follows BIP-39. BIP-39 is a seed-encoding standard, not an identity protocol:
it makes the root portable and recoverable, and nothing more.

Profile requirements:

1. generation happens on-device; no network call, log, analytics event, or
   backup service observes the mnemonic or seed;
2. the checksum is validated on import, and invalid mnemonics are refused
   rather than silently corrected; and
3. the mnemonic is displayed only in dedicated holder-facing backup and
   recovery flows, per the abstract boundary's ceremony rule.

### 4.2 Storage and unlock

Derived key material and identity state are protected by hardware-backed
platform storage where the device provides it, gated by OS authentication.
The mnemonic exists to be written down by the holder; the running vault
operates from stored derived material and does not require mnemonic re-entry
per session.

A conforming implementation must not silently fall back to weaker storage
when hardware protection is unavailable; the abstract `storage_unavailable`
error applies.

## 5. Derivation tree and key domains

From one seed, the implementation deterministically derives one key per
declared purpose, using domain separation so no two purposes share a key:

| Domain | Algorithm | Purpose |
|---|---|---|
| Event operations | secp256k1, Schnorr (BIP-340) | Outer Nostr-compatible event signing and identity-level event operations |
| Membership proofs | BLS12-381 | Private group-membership trees and zero-knowledge proof witnesses |
| Ledger authorization | Ed25519 | Stellar-facing authorization; the public key doubles as the Stellar account ID representation |
| Sealed delivery | X25519 | Sealed inbox envelopes and invitation delivery |
| Transport discovery | Derived tag | Inbox discovery on couriers without a readable account name |

Profile requirements:

1. the derivation of every domain is deterministic and identical across
   platforms: the same mnemonic must produce byte-identical keys on iOS,
   Android, and any future implementation claiming this profile;
2. domain separation is structural—removing or compromising one domain's key
   must not reveal another's; and
3. the exact derivation paths, domain-separation constants, and encodings are
   normative parts of this profile and must be published as test vectors
   (see §12); prose is not sufficient to implement them.

The current constants include compatibility values inherited from the first
clients. They are frozen by this profile: changing any of them is a new
implementation profile ID, because it changes which identity a mnemonic
denotes.

### 5.1 What this tree deliberately does not provide

- **No general chain fan-out.** A BIP-39 seed can root many chain-specific
  keys, but this profile derives only the domains above. "Any blockchain
  address" requires a chain adapter with its own versioned derivation rule,
  address encoding, proof-of-control format, and vectors, per the abstract
  boundary and the whitepaper's chain-adapter requirements.
- **No per-context sub-addresses yet.** The abstract
  `derive-context-address` capability expects fresh, unlinkable addresses per
  context. The current tree derives one key per domain, so contexts within a
  domain are presently linkable (gap 6).

## 6. Capability mapping

| Abstract capability | Current mechanism |
|---|---|
| `sign-transaction` | Ed25519 signing for Stellar-facing operations inside contract and relayer flows |
| `prove-membership` | Client-side BLS witness and zero-knowledge proof generation for the group contracts |
| `decrypt-envelope` | X25519 unsealing of inbox envelopes and invitations |
| `derive-context-address` | Not implemented; one key per domain (gap) |
| `prove-address-control` | Implicit in Stellar operations; no standalone proof format (gap) |
| `prove-credential` | Not implemented; no credential support yet (gap) |
| `derive-seat-key` | Not implemented (gap; see §10) |

Today these operations execute in-process where the flows need them, with OS
unlock as the effective consent gate. The typed request/grant/consent objects
of the abstract boundary do not exist yet; §7 records this as the profile's
central structural gap.

## 7. Capability port status

The abstract boundary requires a capability port: typed requests, named
requesters, per-request consent for value-bearing operations, grants, and
secret-free typed results.

Current state:

- key use is mediated by internal interfaces of the clients and SDKs, which
  do keep raw seed material inside identity code paths;
- there is no requester identity, no grant store, no per-capability consent
  prompt, and no canonical intent binding for signatures; and
- nothing external to the client can request a capability at all, which
  incidentally enforces "no third-party custody" by offering no third-party
  surface.

For a messenger whose only requesters are its own flows this is coherent,
but every proposed extension—charity, payments, registries, paid seats—
depends on the port existing. Implementing it is prerequisite work for the
application layer, not polish.

## 8. Descriptor mapping

No `IdentityDescriptor` is published today. Public keys reach counterparties
ad hoc: invitations and group flows carry the key material the recipient
needs, and the inbox tag makes delivery discoverable without a name.

Consequences, which a conforming implementation must not misrepresent:

1. there is no descriptor chain, so there is no rollback detection, no
   rotation signal, and no standard way for a verifier to learn a key was
   replaced or revoked;
2. there is no standard resolution path from a self-certifying identifier to
   current verification methods; and
3. address claims and service hints have no signed, versioned carrier.

When the descriptor is implemented, its `verificationMethods` must cover the
domains of §5, and its distribution must not turn the descriptor into the
public dossier the abstract boundary forbids: publishing remains selective
and per-context.

## 9. Rotation, revocation, recovery, and compromise

This profile currently implements the simplest possible answers, and states
them plainly per the abstract boundary's honesty rule:

- **Rotation: none.** Every domain key is fixed by the mnemonic. There is no
  operational/recovery key split, no successor mechanism, and no way to
  replace one domain's key while keeping the identity.
- **Revocation: none.** No signed revocation record exists and no verifier
  checks for one.
- **Recovery: full re-derivation.** Entering the mnemonic on a new device
  reproduces every domain key. Local state not otherwise synchronized or
  re-derivable does not return by itself.
- **Compromise: total.** Anyone holding the mnemonic is the identity in
  every domain—messages, group membership witnesses, and ledger
  authorization simultaneously. There is no partial containment.

Clients must therefore treat the mnemonic as catastrophically sensitive in
every flow and must not describe backups in language implying revocability.
The abstract boundary's graduated model (device-specific operational keys
under an offline recovery authority, threshold options, post-quantum
migration) is the successor design; it will be a new implementation profile,
because it changes recovery semantics.

## 10. Seat keys

The abstract `derive-seat-key` capability—deterministic, component-scoped,
mutually unlinkable access keys for paid or authenticated seats—is not
implemented. The courier profile's NIP-42 authentication and the entitlement
model in the payment specifications assume it exists.

Until it does, any interim use of a long-lived domain key (for example the
secp256k1 event key) as a relay access key would let providers correlate one
person across seats and across roles. This profile forbids that shortcut:
implementing paid access requires implementing seat keys first.

## 11. Current implementation mapping

| Boundary role | Current implementation |
|---|---|
| Vault + derivation | Identity modules of `onym-ios` and `onym-android` |
| Shared cryptographic primitives | `onym-sdk-swift` and `onym-sdk-kotlin` |
| Proof generation (BLS witnesses) | Client-side paths over the shared SDK primitives |
| Ledger authorization consumer | Contract flows targeting `onym-contracts` via `onym-relayer` |
| Secure storage | Platform keystores with hardware backing where available |
| Recovery flow | Mnemonic display at creation; mnemonic entry on restore |

Implemented today on both platforms:

- local twelve-word mnemonic generation and restore;
- deterministic, cross-platform derivation of the five domains in §5;
- multiple local identities with per-identity encrypted local state;
- hardware-backed storage of identity material; and
- in-app use of event signing, membership proof generation, sealed inbox
  decryption, and Stellar-facing authorization.

The exact file- and class-level mapping belongs to the repositories' own
documentation; this profile pins behavior, constants, and vectors rather
than source layout.

## 12. Known gaps

Current code is not yet a complete conforming implementation:

1. the derivation tree, domain-separation constants, compatibility values,
   and encodings are implemented but not published as a frozen normative
   specification with cross-platform test vectors—the single highest-priority
   gap, since every other identity commitment builds on it;
2. no capability port exists: no typed requests, requester identities,
   grants, consent prompts, or canonical intent binding for signatures;
3. no `IdentityDescriptor` is published, so verification methods, rotation
   signals, and address claims have no signed carrier and no rollback
   detection;
4. rotation and revocation are absent; root compromise is total and this is
   currently a property, not a bug, of the profile;
5. seat keys are not derived, blocking conforming paid-seat authentication
   (§10);
6. per-context addresses within a domain are not supported, so activity
   inside one domain is linkable by default;
7. `prove-address-control` and `prove-credential` have no standalone
   formats;
8. chain adapters beyond the Stellar-facing Ed25519 domain are unspecified;
9. there is no holder-visible record of key uses, and no grant store to
   review or revoke;
10. export is equivalent to knowing the mnemonic; there is no richer
    migration ceremony carrying local state between conforming vaults; and
11. conformance relies on the two clients mirroring each other rather than a
    fixture suite a third implementation could pass.

These gaps are specification and security work, not alternate semantics that
third parties should copy.

## 13. Conformance tests

A shared fixture suite covers, at minimum:

1. mnemonic → seed vectors, including checksum-invalid inputs that must be
   refused;
2. seed → per-domain key vectors for all five domains, byte-exact across
   platforms, including the frozen compatibility constants;
3. inbox-tag construction vectors;
4. Schnorr, Ed25519, and X25519 operation vectors (sign/verify, seal/unseal)
   against the derived keys;
5. BLS witness and proof-input vectors consistent with the notary profile's
   verification fixtures;
6. Stellar account-ID encoding vectors for the Ed25519 domain;
7. multiple-identity isolation: two mnemonics never produce overlapping
   keys, tags, or storage keys;
8. restore round-trip: mnemonic re-entry reproduces every vector-pinned
   value; and
9. negative vectors: cross-domain key reuse, truncated seeds, wrong-curve
   material, and mismatched constants must fail loudly.

Once the capability port, descriptor, and seat keys exist, their request,
grant, chaining, and unlinkability fixtures extend this suite per the
abstract boundary.

## 14. Acceptance criteria

This BIP-39 profile satisfies the abstract boundary when:

1. a third-party vault can re-implement it from the published tree and
   vectors alone, and a holder can move a mnemonic between the two vaults
   with identical results;
2. every domain key derives deterministically and identically on all
   platforms, and no two domains share key material;
3. mnemonic and seed material appear only in generation, backup, and restore
   ceremonies, and never cross any in-process or network surface;
4. all client key use flows through the typed capability port, with intent
   binding for value-bearing signatures;
5. a published descriptor lets verifiers resolve, chain, and reject rolled
   back verification methods;
6. seat keys authenticate paid access without linking seats to each other or
   to domain keys;
7. documentation and UI state the profile's compromise model exactly as §9
   defines it; and
8. successor profiles (rotation-capable, hardware-rooted, post-quantum) can
   import an identity from this profile through a declared holder ceremony.

## References

1. Abstract Onym identity boundary: [UI-Identity.md](UI-Identity.md)
2. Onym iOS client: <https://github.com/onymchat/onym-ios>
3. Onym Android client: <https://github.com/onymchat/onym-android>
4. Onym Swift SDK: <https://github.com/onymchat/onym-sdk-swift>
5. Onym Kotlin SDK: <https://github.com/onymchat/onym-sdk-kotlin>
6. Bitcoin Improvement Proposal 39, “Mnemonic code for generating
   deterministic keys”:
   <https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki>
7. Bitcoin Improvement Proposal 340, “Schnorr Signatures for secp256k1”:
   <https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki>
8. IETF RFC 7748, “Elliptic Curves for Security” (X25519):
   <https://www.rfc-editor.org/rfc/rfc7748>
9. IETF RFC 8032, “Edwards-Curve Digital Signature Algorithm (EdDSA)”:
   <https://www.rfc-editor.org/rfc/rfc8032>
10. Stellar developer documentation, “Accounts”:
    <https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts>
