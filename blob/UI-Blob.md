---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym UI ↔ Blob Transport Boundary

**Architecture draft 0.2 — August 2026**

> The UI chooses and encrypts the media. Blob transport stores opaque,
> content-addressed bytes. It does not own the media, its key, or the message
> that refers to it.

This document defines the technology-neutral boundary between an Onym
frontend and a large-object courier. It does not require a particular hash,
encryption algorithm, request protocol, server implementation, authorization
format, storage engine, or addressing syntax.

A concrete implementation may use content-addressed HTTP storage, an object
network, an institutional archive, peer-to-peer transfer, local mesh storage,
or another mechanism that satisfies the profile's integrity, opacity,
availability, receipt, and error semantics. The current Blossom implementation
is specified separately in [UI-Blob-Blossom.md](UI-Blob-Blossom.md).

Here **UI** means the frontend application layer, not a screen issuing a
network request. Views send intent to flows, view-models, repositories, or
interactors. Those components validate, encode, encrypt, and content-address
media before invoking the blob port.

Small encrypted messages and invitations use
[../message/UI-Message.md](../message/UI-Message.md). Shared-state validation
uses [../notary/UI-Notary.md](../notary/UI-Notary.md).

## 1. Decision

Onym treats the UI, application media protocol, blob adapter, and storage
operator as independently owned components joined by versioned interfaces.

- The **UI owner** controls media presentation, local preparation, billing
  integration, supported profiles, and release distribution.
- The **application-protocol author** controls attachment descriptors,
  authenticated encryption, key handling, and plaintext-media validation.
- The **blob-adapter author** maps the common Onym port to a concrete storage
  protocol.
- The **blob operator** owns endpoints, capacity, retention, deletion,
  moderation, backups, availability, privacy practices, and its payment model.
- The **user or group** selects providers and replication policy.

One organization may occupy several roles, but their authorities remain
separate. A user can change UI without re-encrypting a still-available object.
A UI can use a compatible third-party provider without importing its SDK. A
provider can serve several frontends without learning group governance or
holding decryption keys.

The boundary has two interfaces:

1. the local **UI/application ↔ blob adapter** port, which carries encrypted
   bytes, content references, retention intent, and typed outcomes; and
2. the network **blob adapter ↔ storage provider** implementation profile,
   which defines request framing, retrieval, authorization, payment refusal,
   limits, receipts, retention observations, and deletion.

Neither interface may carry plaintext media, filenames, captions, group
secrets, seed material, or decryption keys. A key protected inside an
end-to-end encrypted attachment descriptor travels through the separate
message boundary as opaque ciphertext, never as provider metadata.

## 2. What blob transport does

The base blob port can:

1. validate and connect to a selected set of provider components;
2. upload already encrypted bytes under a declared content reference;
3. probe whether a provider currently serves a reference;
4. retrieve complete or ranged encrypted bytes;
5. replicate the exact same encrypted bytes to another provider;
6. request deletion when the selected implementation supports it; and
7. report per-provider storage, availability, refusal, and uncertainty.

It does not encode media, encrypt or decrypt application content, hold keys,
interpret captions, decide who may view an attachment, authenticate group
membership, resolve human names, carry chat messages, or authorize notary
state.

## 3. Why this boundary is necessary

### 3.1 It prevents storage from becoming media custody

The provider retains ciphertext addressed by a digest. It does not receive the
key, plaintext type, caption, sender identity, recipient list, group name, or
permission to reconstruct the attachment.

### 3.2 It prevents the UI from becoming a storage protocol

Screens and domain flows should not know request paths, signed headers,
redirect rules, range syntax, server descriptors, or wire-specific errors. A
narrow port permits a different storage technology without rewriting chat and
media flows.

### 3.3 It gives durable meaning to an attachment reference

A provider locator is mutable and operator-controlled. A collision-resistant
digest of the exact encrypted stored bytes is stable and independently
verifiable. A sealed message can refer to the content while treating provider
locations as replaceable hints.

### 3.4 It makes retention and deletion claims honest

Content addressing proves byte integrity, not continued availability or
erasure. Operators declare retention, backups, mirrors, cache behavior,
deletion scope, and measurable service levels instead of hiding them behind a
generic upload-success state.

### 3.5 It supports independent ownership and payment

One storage seat may be free, another may charge for retained byte-time or
egress, and another may be institutionally funded. The UI chooses which signed
offers it can present. Payment buys the declared storage service; it does not
buy a decryption key or authority over messages and groups.

### 3.6 It isolates failure

- A failing provider can be supplemented by another copy with the same
  content reference.
- Corrupted or malicious bytes are rejected before decryption.
- A broken adapter can be replaced without changing attachment crypto.
- A payment failure does not require a new key or logical attachment.
- Loss or deletion of a blob does not mutate a message or canonical notary
  state.

## 4. Logical topology

```text
UI process
  |
  | user intent
  v
application media flow
  |-- validate and encode plaintext locally
  |-- seal with a fresh application key
  |-- compute profile-pinned content reference over stored bytes
  `-- invoke blob port with opaque bytes
            |
            v
      blob adapter
      map · authorize · bound · verify · normalize
            |
            v
      selected storage provider(s)
      retain · serve · refuse · delete within declared policy
```

The adapter is inside the client trust boundary but handles untrusted network
input, locators, redirects, descriptors, headers, and bytes. Providers are
outside it. A successful provider response is evidence only of the provider's
declared action—not future availability, complete deletion, media validity,
recipient access, or group authorization.

## 5. Boundary objects

### 5.1 Blob Profile

A `BlobProfile` defines portable semantics independently of a wire technology
or operator:

```json
{
  "profileVersion": 1,
  "profileId": "onym:blob-profile:opaque-content-addressed-v1",
  "interface": "onym-blob-v1",
  "operations": [
    "upload",
    "probe",
    "download",
    "delete",
    "replicate"
  ],
  "contentReferenceSchema": "<content-addressed-schema>",
  "delivery": "provider-scoped-best-effort-storage",
  "receiptSchema": "per-provider-blob-outcome-v1",
  "errorSchema": "onym-blob-errors-v1",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes operation meaning, content-reference semantics, verification,
receipts, and errors. It does not choose a digest algorithm, endpoint,
protocol, authorization scheme, price, retention period, replica count, or UI.

### 5.2 Blob Implementation Profile

A `BlobImplementationProfile` maps the abstract interface to one storage
technology:

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:blob-implementation:<technology>-v1",
  "blobProfileId": "onym:blob-profile:opaque-content-addressed-v1",
  "wireProtocol": "<protocol-id>",
  "digestSuite": "<digest-and-encoding>",
  "wireMapping": "<content-addressed-specification>",
  "connectionModel": "<declared-model>",
  "authentication": ["anonymous", "provider-scoped-capability"],
  "paymentRefusal": "onym-payment-required-v1",
  "signature": "<implementation-profile-publisher-signature>"
}
```

Wire request objects, server descriptors, authorization tokens, sockets, and
protocol headers stay inside the adapter.

### 5.3 Blob Provider Manifest

A `ServiceManifest` binds an implementation profile to an operator:

```json
{
  "version": 1,
  "componentId": "onym:component:<blob-provider-id>",
  "seat": "transport.blob",
  "operator": "onym:key:<operator-id>",
  "blobProfileId": "onym:blob-profile:opaque-content-addressed-v1",
  "implementationProfileId": "onym:blob-implementation:<technology>-v1",
  "endpoints": [
    {"uri": "<technology-specific-endpoint>", "role": "read-write"}
  ],
  "capabilities": ["upload", "probe", "download", "delete"],
  "limits": {
    "maximumOpaqueBlobBytes": "<operator-declared-limit>",
    "maximumConcurrentOperations": "<operator-declared-limit>"
  },
  "retention": {
    "class": "<best-effort-or-measurable-class>",
    "deletion": "<declared-scope>"
  },
  "privacyProfile": "<hash-or-url>",
  "entitlementIssuers": ["onym:key:<issuer-id>"],
  "offers": ["<blob-offer-id>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The UI verifies the signature, profiles, endpoint syntax, capabilities,
limits, validity, retention, privacy declaration, entitlement issuers, and
selected offer. Discovery catalog presence and a friendly name are
insufficient.

Mutable capacity and health observations remain separate from signed policy.
They cannot silently replace an operator, endpoint, profile, or offer.

### 5.4 Blob Route

A `BlobRoute` is the user's local storage and retrieval policy:

```json
{
  "routeVersion": 1,
  "routeId": "<local-random-id>",
  "blobProfileId": "onym:blob-profile:opaque-content-addressed-v1",
  "components": [
    "onym:component:<blob-a>",
    "onym:component:<blob-b>"
  ],
  "uploadPolicy": {"mode": "replicate", "minimumStored": 2},
  "downloadPolicy": {"mode": "first-verified"},
  "selectedBy": "user",
  "selectedAt": "2026-08-01T00:00:00Z"
}
```

The route is configuration, not identity or group state. The UI preserves the
selection and warns when a change reduces redundancy, retention, privacy,
compatibility, or paid coverage.

An authenticated message may include location hints. A hint permits a fetch
attempt; it does not add the hinted operator to a permanent route, authorize
an upload, or imply endorsement.

### 5.5 Content Reference

A `ContentReference` identifies the exact encrypted bytes:

```json
{
  "referenceVersion": 1,
  "algorithm": "<implementation-profile-digest-id>",
  "digest": "<canonical-digest-value>",
  "encryptedByteSize": 184292
}
```

The implementation profile pins algorithm, digest encoding, canonical form,
and collision-response policy. The digest covers the exact provider-facing
byte sequence. It does not cover plaintext before encryption, a decoded media
object, a locator, or mutable metadata.

### 5.6 Sealed Blob

The application produces a sealed operation before calling the adapter:

```json
{
  "blobVersion": 1,
  "operationId": "<random-id>",
  "contentReference": {
    "algorithm": "<profile-pinned-algorithm>",
    "digest": "<canonical-digest>",
    "encryptedByteSize": 184292
  },
  "bytes": "<opaque-encrypted-bytes>",
  "wireMediaType": "<opaque-wire-type>",
  "requestedRetention": "<declared-class-or-null>"
}
```

The adapter recomputes the reference before network use. The encryption key,
plaintext type, dimensions, duration, filename, caption, and group context are
not part of this object.

### 5.7 Provider outcomes and Blob Descriptor

After upload, the adapter returns the durable reference and per-provider
outcomes:

```json
{
  "operationId": "<same-random-id>",
  "contentReference": {
    "algorithm": "<profile-pinned-algorithm>",
    "digest": "<canonical-digest>",
    "encryptedByteSize": 184292
  },
  "outcomes": [
    {
      "componentId": "onym:component:<blob-a>",
      "status": "stored",
      "locator": "<profile-specific-location-hint>",
      "retentionUntil": "<provider-observation-or-null>",
      "evidence": "<profile-defined-evidence-or-null>"
    },
    {
      "componentId": "onym:component:<blob-b>",
      "status": "unreachable",
      "locator": null,
      "retentionUntil": null,
      "evidence": null
    }
  ]
}
```

Valid outcome classes include:

- `queued_locally`: accepted into a bounded local upload queue;
- `submitted`: the request body was handed to the network implementation;
- `accepted`: the provider explicitly accepted the operation;
- `stored`: the provider confirmed a matching stored object under its policy;
- `already_stored`: the same reference was already available;
- `rejected`: the provider explicitly refused;
- `unreachable`: no meaningful provider response was obtained; and
- `unknown`: the request may have succeeded, but its result is inconclusive.

A provider locator is a hint, not the content identity. `stored` is not a
recipient-delivery state or proof of future retention.

### 5.8 Attachment Descriptor

The application—not the blob adapter—constructs the descriptor placed inside
the sealed message:

```json
{
  "attachmentVersion": 1,
  "contentReference": {
    "algorithm": "<profile-pinned-algorithm>",
    "digest": "<canonical-digest>",
    "encryptedByteSize": 184292
  },
  "plaintextMediaType": "<sealed-media-type>",
  "decryption": {
    "suite": "<application-encryption-suite>",
    "key": "<key-protected-by-the-sealed-message>"
  },
  "presentation": "<sealed-optional-metadata>",
  "locations": ["onym:component:<blob-a>"]
}
```

This descriptor is sensitive. Keys and plaintext media metadata remain inside
the authenticated, end-to-end encrypted message envelope and never become
storage-provider metadata.

## 6. Common blob surface

| Operation | Input | Result |
|---|---|---|
| `connect` | Verified route and scoped access context | Per-provider readiness |
| `uploadBlob` | Sealed blob and selected route | Verified per-provider outcomes |
| `probeBlob` | Reference and provider | Availability and provider observations |
| `downloadBlob` | Reference, selected locations, optional range | Verified complete bytes or explicitly unverified range |
| `deleteBlob` | Reference and provider-scoped authorization | Narrow provider outcome |
| `replicateBlob` | Existing verified bytes and target providers | New per-provider outcomes |
| `queryOutcome` | Operation/reference/provider | Outcome when supported |

The port never returns complete downloaded bytes as usable until their content
reference is verified. Ranged or streamed bytes remain explicitly
`unverified` until the full object is assembled and checked, unless a future
profile defines a verifiable chunk tree.

## 7. UI/application obligations

A conforming frontend and application layer must:

1. verify the blob and implementation profiles plus every selected manifest;
2. preserve route and replication choices across UI and catalog updates;
3. display operator, price, quota, retention, deletion scope, egress policy,
   replica count, limits, and privacy exposure before selection or purchase;
4. validate and bound plaintext media before encoding;
5. encrypt each blob with fresh application key material and authenticated
   encryption before invoking transport;
6. compute the content reference over the exact encrypted stored bytes;
7. keep plaintext, filenames, captions, group names, decryption keys, seed
   material, notary witnesses, and global identity credentials out of blob
   requests and logs;
8. place keys and plaintext metadata only inside a sealed attachment message;
9. preserve per-provider outcomes, refusals, and payment requirements;
10. retain encrypted outbox bytes until the required storage policy is met;
11. decrypt only after complete reference verification, then validate decoded
    media before rendering;
12. treat locators, types, redirects, retention dates, and provider
    descriptors as untrusted observations;
13. label `submitted`, `stored`, `replicated`, `available`, `downloaded`, and
    `received` accurately;
14. retry idempotently by reference and operation ID rather than creating a
    new logical attachment;
15. support route export, provider migration, and exact-byte replication; and
16. never redirect storage merely to increase frontend commission.

Provider diagnostics, locator fields, redirects, and filenames are untrusted
input. They cannot drive unsafe navigation, execution, or payment.

## 8. Blob adapter obligations

A conforming adapter must:

1. implement its mapping without leaking wire-specific objects through the
   common port;
2. accept only opaque encrypted bytes and avoid application-media parsing;
3. validate reference syntax, byte count, endpoint identity, and limits;
4. recompute the content reference before upload;
5. verify every provider response against the expected reference and size;
6. verify complete downloads before exposing usable bytes;
7. enforce redirect or indirection limits and credential-origin policy;
8. expose per-provider outcomes rather than collapse replication failures;
9. keep each provider's entitlement, token, and authorization material scoped
   to that provider;
10. normalize implementation failures into stable domain errors while
    preserving bounded safe diagnostics;
11. bound response bodies, descriptors, metadata, indirection, range assembly,
    queues, timeouts, and retry;
12. preserve unknown outcomes instead of converting silence to success;
13. avoid logging blobs, contextualized references, credentials, signed
    authorizations, or sensitive descriptor data; and
14. remain replaceable without changing attachment encryption or meaning.

The adapter verifies storage-wire properties. It does not decide who may read
an attachment; the authenticated application envelope and protected key do.

## 9. Blob operator obligations

A conforming operator publishes:

- a signed manifest and supported implementation profile;
- endpoint identities and indirection policy;
- supported operations and optional capabilities;
- maximum size, wire types, range/chunk support, concurrency, and rate limits;
- access-control and entitlement-issuer policy;
- minimum, maximum, or best-effort retention semantics;
- deletion scope, backups, mirrors, caches, and garbage-collection policy;
- metadata, network, credential, access-log, and usage-retention policy;
- measurable availability and durability claims;
- seat offers and settlement terms when paid; and
- migration, export, and shutdown notice policy.

The operator must not claim that a content digest proves plaintext type,
ownership, legal permission, recipient access, or removal from third-party
copies.

## 10. Integrity, availability, replication, and deletion

Content addressing provides integrity, not availability.

- A valid object can disappear under best-effort service.
- The exact ciphertext may exist at several providers under one reference.
- A successful probe or download proves availability only when observed.
- A retention date is a provider statement, not cryptographic proof.
- A provider can serve corrupted bytes; the client rejects them by reference.
- A cache, mirror, backup, recipient, or observer may retain another copy.
- A delete acknowledgement covers only the provider's declared scope.
- A timeout after upload or delete creates an unknown outcome.

Replication uses the exact same encrypted bytes. Re-encrypting produces a new
content reference and therefore a new attachment version. Migration copies and
verifies ciphertext, updates location hints if needed, and never exposes the
decryption key.

A receiver tries authenticated descriptor locations, locally selected
compatible providers, or explicit trusted discovery. It never substitutes a
different reference because bytes decode to apparently similar media.

## 11. Access control and payment

Provider access is separate from attachment readership and global identity. A
provider may require a component-scoped key or capability to upload, download,
probe, list, or delete. That credential proves only the declared service
access.

The operator publishes a `SeatOffer`. A frontend sells it only through a
compatible signed `ChannelOffer`; product mapping, validation, platform fees,
taxes, refunds, and provider settlement remain outside blob framing.

```text
UI/application -> blob adapter: preflight or encrypted-blob operation
UI/application <- blob adapter: PaymentRequired(component + offer)
UI -> billing channel: purchase approved product
UI -> billing broker: purchase evidence + provider-scoped access key
UI <- billing broker: SeatEntitlement
UI/broker -> provider control path: register entitlement or obtain capability
UI/application -> blob adapter: retry exact operation by content reference
UI/application <- blob adapter: verified per-provider outcome
```

When possible, payment refusal occurs in a lightweight preflight before a
large upload or download. A retry preserves the exact encrypted bytes,
content reference, and logical attachment. Store evidence and global identity
never enter ordinary storage requests, object paths, or provider logs.

Payment cannot make a reference mismatch valid, strengthen inner
authorization, or prove retention. An unpaid object may use another selected
provider.

## 12. Errors and state machines

| Error | Origin | UI/application response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse and explain required adapter |
| `invalid_endpoint` | Manifest/configuration | Refuse; never silently rewrite |
| `invalid_plaintext` | Application validation | Reject before encryption or upload |
| `invalid_reference` | Application/adapter | Reject noncanonical or mismatched reference |
| `payload_too_large` | Client/provider | Transform locally or choose compatible provider |
| `unreachable` | Network/provider | Retry with backoff or another selected provider |
| `auth_required` | Provider | Complete component-scoped authentication |
| `payment_required` | Provider | Present referenced signed offer when supported |
| `invalid_entitlement` | Provider/broker | Refresh without leaking another credential |
| `rate_limited` | Provider | Honor retry guidance and preserve outbox bytes |
| `upload_rejected` | Provider | Preserve reason and try allowed alternative |
| `descriptor_mismatch` | Adapter | Fail closed; do not publish attachment descriptor |
| `partial_replication` | Route | Report stored providers and retry missing copies |
| `outcome_unknown` | Network/provider | Probe by reference before resubmitting |
| `not_found` | Provider | Try another authenticated location |
| `invalid_indirection` | Adapter | Refuse destination and withhold credentials |
| `digest_mismatch` | Adapter | Discard bytes, flag provider, try another location |
| `retention_expired` | Provider | Re-upload verified bytes or locate another copy |
| `delete_unconfirmed` | Provider | Preserve uncertainty; do not claim erasure |

Upload state:

```text
selected
  -> validated
  -> encoded
  -> encrypted
  -> addressed
  -> route_validated
  -> preflight
  -> auth_required? -> authenticated
  -> payment_required? -> entitled -> authenticated
  -> submitted
  -> response_verified
  -> partially_replicated | replicated | rejected | unknown
  -> attachment_descriptor_ready
```

The application releases the attachment message only under its declared
policy—for example, after one verified copy or a two-provider target.

Download state:

```text
sealed_attachment_descriptor
  -> descriptor_authenticated
  -> location_selected
  -> downloading
  -> size_bounded
  -> content_reference_verified
  -> authenticated_decryption
  -> media_validated
  -> rendered
```

Unverified complete bytes never reach a decoder or renderer.

## 13. Security and privacy invariants

1. **Only sealed blobs cross the boundary.** Plaintext media, keys, captions,
   filenames, and group secrets never enter provider requests.
2. **The reference covers stored bytes.** It is recomputed before upload and
   checked after a complete download.
3. **The key travels separately.** It stays local or inside an authenticated,
   end-to-end encrypted attachment descriptor.
4. **Wire type does not reveal plaintext type.** The profile uses an opaque
   wire type where the technology permits it.
5. **A locator is not integrity.** Endpoint security, provider identity,
   indirection, and success codes never replace reference verification.
6. **Credentials are component-scoped.** One provider never receives
   another's entitlement, token, key, or authorization.
7. **Billing is separate from content.** Store evidence and global billing
   identifiers never enter content, locators, or ordinary access logs.
8. **Untrusted input is bounded.** Uploads, downloads, metadata, indirection,
   ranges, decoders, and decompression have explicit limits.
9. **Route changes are visible.** Defaults, catalogs, payment failure, and
   commission cannot silently move storage.
10. **Replication has a privacy cost.** More providers expose timing, size,
    reference, and access metadata to more operators.
11. **Deletion claims are narrow.** No acknowledgement proves removal from
    recipients, observers, mirrors, caches, or undeclared backups.
12. **Blob state is not group state.** Upload, loss, payment, retention, or
    deletion cannot authorize or roll back a notary transition.
13. **Unknown is not success.** Lost responses are reconciled by reference
    rather than relabeled as stored or deleted.

## 14. Versioning and conformance

- `BlobProfile` changes when operation, reference, receipt, availability,
  deletion, or error meaning changes.
- `BlobImplementationProfile` changes when digest suite, wire mapping,
  framing, authentication, indirection, or refusal mapping changes.
- `ServiceManifest` changes when endpoints, capabilities, limits, retention,
  offers, entitlement issuers, or operator keys change.
- Attachment-descriptor versions change independently from storage profiles.
- Unknown implementations are never inferred from endpoint syntax.
- Adding a provider location is additive only when the content reference is
  unchanged; re-encryption creates a new reference and attachment version.
- New defaults apply to new selection, not silently to existing routes.
- Cross-platform fixtures cover reference construction, uploads, descriptors,
  downloads, ranges, indirection, authorization, payment refusal, retry,
  replication, deletion uncertainty, and corrupt data.
- Paid and free providers of one implementation remain technically
  compatible; entitlement enforcement is a declared capability.

## 15. Concrete implementation profiles

The abstract boundary becomes executable through a concrete profile. The
current implementation is:

- [UI-Blob-Blossom.md](UI-Blob-Blossom.md) — Blossom BUD-01/02/07/11/12,
  SHA-256 addressing, HTTPS requests, Nostr authorization, redirects, and
  current mobile/reference-server behavior.

Future implementations may preserve the common port while using another
storage technology. They use another implementation profile ID when digest,
metadata, availability, deletion, or receipt semantics differ.

## 16. Acceptance criteria

The UI ↔ blob boundary is successfully separated when:

1. a third-party UI can store, retrieve, verify, and migrate encrypted Onym
   attachments using public profiles and tests;
2. the official UI can use a compatible third-party provider after manifest
   verification without media-flow changes;
3. providers can be replaced or combined without changing identity, group
   state, application encryption, or an existing content reference;
4. wire requests, tokens, descriptors, locators, and indirection do not leak
   into view or domain APIs;
5. plaintext, decryption keys, and global identity keys never reach a provider;
6. every upload result states what each selected provider confirmed;
7. no complete downloaded object is decrypted or rendered before reference
   verification;
8. payment refusal is distinct from authorization, quota, retention, missing
   data, reference mismatch, and network failure;
9. payment does not reveal store evidence or grant message/notary authority;
10. corrupt responses, indirection, partial replication, retry, provider loss,
    and deletion uncertainty pass shared fixtures; and
11. a second storage technology can implement the abstract suite without
    pretending to be the first.

## 17. Justification in one sentence

> Separating UI from blob transport lets people replace who presents media
> without replacing who stores its ciphertext—and replace the storage provider
> without giving it the key, the message, or authority over the group.
