# Onym UI ↔ Blob: Blossom Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Onym blob boundary onto Blossom
> HTTPS endpoints, SHA-256 content addresses, BUD-11 Nostr authorization, and
> the current Onym encrypted-media flow.

This document is a concrete implementation of
[UI-Blob.md](UI-Blob.md). The abstract specification remains authoritative for
UI-facing operations, ownership, content-integrity meaning, per-provider
outcomes, payment isolation, and deletion uncertainty. This document defines
the Blossom wire mapping and records where the present iOS, Android, and
reference-server code does not yet implement the complete boundary.

The document distinguishes:

- **implemented behavior**, which exists in the current Onym repositories;
- **profile requirements**, which are required for a conforming Blossom
  adapter or provider; and
- **gaps**, where current code still needs to converge on the profile.

## 1. Conformance declaration

| Abstract concept | Blossom mapping |
|---|---|
| Provider endpoint | Blossom HTTPS origin with endpoints at its root |
| Content reference | Lowercase hexadecimal SHA-256 of exact stored bytes |
| Upload | BUD-02 `PUT /upload` |
| Probe | BUD-01 `HEAD /<sha256>` |
| Complete download | BUD-01 `GET /<sha256>` |
| Ranged download | `Range` request and `206 Partial Content` |
| Provider upload receipt | BUD-02 Blob Descriptor |
| Retention observation | Optional HTTP `Sunset` response header |
| Delete | BUD-12 `DELETE /<sha256>` when declared |
| Provider account listing | BUD-12 `GET /list/<pubkey>` when declared |
| Access authorization | BUD-11 kind-`24242` signed Nostr event |
| Direct protocol payment | BUD-07 HTTP 402 payment-method headers |
| Onym channel payment | HTTP 402 plus profile-declared `PaymentRequired` and seat registration |

The implementation profile identifier is:

```text
onym:blob-implementation:blossom-v1
```

It maps this portable profile:

```text
onym:blob-profile:opaque-content-addressed-v1
```

The Blossom BUDs used by this profile are published as drafts. A production
manifest therefore pins a content-addressed wire specification or exact BUD
revision; a mutable `master` branch cannot silently change an already selected
provider's contract.

## 2. Ownership mapping

- The **application-protocol author** defines the encrypted attachment bytes,
  protected key, plaintext metadata, and authenticated attachment descriptor.
- The **Blossom adapter author** maps the common blob port to HTTPS methods,
  paths, headers, Nostr tokens, descriptors, redirects, and status codes.
- The **Blossom operator** controls its origin, storage, CDN or object-store
  indirection, limits, retention, deletion, offers, and settlement terms.
- The **billing broker** validates platform purchases and registers a
  provider-scoped seat entitlement; it does not receive blob keys.
- The **UI publisher** presents providers and compatible offers without
  becoming content owner or storage authority.
- The **user or group** selects providers and the number of required copies.

A signed BUD-11 token authorizes one declared provider action. It does not
prove ownership of plaintext, attachment readership, group membership, or a
notary transition.

## 3. Physical topology

```text
UI media flow
  |-- validate / encode plaintext
  |-- encrypt with fresh application key
  |-- SHA-256(exact encrypted bytes)
  `-- abstract blob port
            |
            v
      Blossom adapter
      BUD request + optional BUD-11 authorization
            |
            | HTTPS
            v
      Blossom server origin
      |-- local persistent storage
      `-- optional redirect / CDN / object store
```

The application encryption and Blossom authorization signatures are separate.
Current Onym media uses a fresh encryption key per object and a fresh Nostr key
per upload authorization. A paid provider may instead need a stable but
provider-scoped access key for quota and entitlement continuity.

## 4. Pinned Blossom documents

| Document | Use in this profile | Status in upstream repository |
|---|---|---|
| BUD-01 | Root endpoints, retrieval, probe, ranges, redirects, `Sunset`, common errors | Draft, mandatory |
| BUD-02 | Upload and Blob Descriptor | Draft, optional |
| BUD-07 | Direct HTTP 402 payment negotiation | Draft, optional |
| BUD-11 | Nostr authorization tokens | Draft, optional |
| BUD-12 | List and delete management endpoints | Draft, optional |

An operator may omit optional BUDs only when its signed manifest omits the
corresponding capability. `nostr` authorization, paid access, list, and delete
must never be inferred merely because an origin serves BUD-01 downloads.

## 5. Provider declaration

### 5.1 Target manifest

A conforming provider publishes a signed abstract `ServiceManifest` whose
Blossom mapping includes at least:

```json
{
  "version": 1,
  "componentId": "onym:component:<blossom-provider-id>",
  "seat": "transport.blob",
  "operator": "onym:key:<operator-id>",
  "blobProfileId": "onym:blob-profile:opaque-content-addressed-v1",
  "implementationProfileId": "onym:blob-implementation:blossom-v1",
  "wireSpecification": "<content-addressed-BUD-revision-set>",
  "endpoints": [
    {"uri": "https://blobs.example.org", "role": "read-write"}
  ],
  "capabilities": [
    "bud01-get",
    "bud01-head",
    "bud01-range",
    "bud02-upload",
    "bud11-auth",
    "bud12-delete"
  ],
  "limits": {
    "maximumBlobBytes": "<declared-limit>",
    "maximumRedirects": "<declared-limit>",
    "maximumConcurrentOperations": "<declared-limit>"
  },
  "retention": {
    "class": "<declared-class>",
    "deletion": "<declared-scope>"
  },
  "privacyProfile": "<hash-or-url>",
  "entitlementIssuers": ["onym:key:<issuer-id>"],
  "offers": ["<storage-offer-id>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The endpoint is an HTTPS origin, not an arbitrary path. Blossom endpoints are
served from the origin root. The adapter canonicalizes the origin once and
does not permit path traversal, user information, fragments, insecure scheme
downgrade, or manifest-escaping redirects.

For browser interoperability, the provider applies BUD-01 cross-origin
headers to all responses. Its preflight response permits the `Authorization`
header and the `GET`, `HEAD`, `PUT`, and `DELETE` methods. Native clients do
not depend on browser CORS enforcement, but a conforming provider implements
the same public wire contract for independently owned web frontends.

### 5.2 Current server selection

Current mobile configuration stores `name`, `url`, and `isDefault`, plus a
local user-interaction flag. Both apps instantiate one `BlossomClient` using
the first configured endpoint at startup and otherwise fall back to
`https://blossom.onym.app`. Other listed endpoints are alternatives for manual
selection, not replicas.

This preference record is not the target manifest: it does not bind operator,
BUD revision set, capabilities, limits, retention, indirection, privacy,
offers, or entitlement issuers. The default and known-server catalog are
discovery hints, not proof of ownership.

## 6. Content reference and Onym ciphertext

### 6.1 SHA-256 reference

The Blossom reference is exactly 32 digest bytes rendered as 64 lowercase
hexadecimal characters:

```text
sha256 = lowercase_hex(SHA-256(exact_request_body_bytes))
```

Clients reject uppercase, malformed, truncated, overlong, or algorithm-ambiguous
references at the wire boundary, while an application importer may normalize a
legacy value only before it becomes a pinned `ContentReference`.

The digest covers encrypted bytes, not plaintext media, its decoded pixels,
the Blob Descriptor, a URL, or response headers. Identical encrypted bytes can
be uploaded to several Blossom providers without changing the attachment
reference.

### 6.2 Current application encryption

The current iOS and Android application layer seals images, video, posters,
and voice recordings with AES-256-GCM under a fresh 32-byte key. The stored
layout is:

```text
12-byte nonce || ciphertext || 16-byte authentication tag
```

The key and plaintext media metadata are placed in the sealed attachment
message. This layout is an Onym application format, not a Blossom requirement.
The Blossom adapter sees only the combined encrypted bytes and their SHA-256.

For opaque storage, the target request uses
`Content-Type: application/octet-stream`, and returned location hints normally
use an opaque extension such as `.bin`. Current clients instead pass the
plaintext `image/jpeg`, `video/mp4`, or `audio/mp4` type when uploading
ciphertext; that metadata leak is listed as a gap.

## 7. Upload mapping

### 7.1 Request

A conforming upload is:

```http
PUT /upload HTTP/1.1
Host: blobs.example.org
Content-Type: application/octet-stream
Content-Length: <exact-byte-count>
X-SHA-256: <lowercase-sha256>
Authorization: Nostr <unpadded-base64url-kind-24242-event>

<exact encrypted bytes>
```

`Authorization` is included only when the manifest requires BUD-11. The
adapter computes `Content-Length` and `X-SHA-256` locally and rejects a blob
above the signed manifest limit before creating an authorization or sending a
body. Providers do not modify, transcode, decompress, resize, or otherwise
rewrite the request bytes.

An optional `HEAD /upload` preflight uses the same content metadata and an
upload-scoped authorization when required, but no body. A provider handles
`PUT /upload` correctly whether or not preflight occurred.

### 7.2 Response and Blob Descriptor

The expected success codes are:

- `201 Created` when the provider newly stored the blob; and
- `200 OK` when the exact blob already existed.

Both return a BUD-02 descriptor:

```json
{
  "url": "https://blobs.example.org/<sha256>.bin",
  "sha256": "<same-lowercase-sha256>",
  "size": 184292,
  "type": "application/octet-stream",
  "uploaded": 1785580800
}
```

Before returning `stored` or `already_stored`, the adapter requires:

1. valid bounded JSON and every required descriptor field;
2. exact digest equality with the locally computed reference;
3. exact byte-size equality;
4. an absolute HTTPS locator allowed by the profile;
5. the same digest in the locator path, allowing the declared extension; and
6. a wire type compatible with opaque encrypted storage.

`uploaded` and the locator are provider observations. They do not replace the
digest or prove retention. Optional descriptor fields are ignored or exposed
only through bounded implementation diagnostics.

### 7.3 Upload status mapping

| HTTP status | Abstract outcome |
|---:|---|
| 200 | `already_stored` after descriptor verification |
| 201 | `stored` after descriptor verification |
| 400 | `upload_rejected` or invalid payment proof by context |
| 401 | `auth_required` or `invalid_entitlement` |
| 402 | `payment_required` |
| 403 | `upload_rejected` / `unauthorized` |
| 409 | `descriptor_mismatch` or `invalid_reference` |
| 411 | `upload_rejected` because length is required |
| 413 | `payload_too_large` |
| 415 | `unsupported_wire_type` |
| 429 | `rate_limited` |
| 5xx | `unreachable` or provider failure |

An optional `X-Reason` is human-readable diagnostic text. It is never parsed
for control flow or treated as a payment link.

## 8. Probe and retrieval mapping

### 8.1 Probe

`HEAD /<sha256>` checks current availability without returning a body. On
success it carries the same `Content-Type` and `Content-Length` as `GET` and
may advertise `Accept-Ranges: bytes` and `Sunset`.

The result is an observation:

```json
{
  "componentId": "onym:component:<provider-id>",
  "available": true,
  "encryptedByteSize": 184292,
  "wireMediaType": "application/octet-stream",
  "acceptRanges": true,
  "sunset": "2026-09-01T00:00:00Z",
  "observedAt": "2026-08-01T00:00:00Z"
}
```

`Sunset` is advisory. It neither guarantees availability until that instant
nor permanent deletion afterward. A later probe is definitive for then-current
availability.

### 8.2 Complete retrieval

The adapter requests:

```http
GET /<sha256> HTTP/1.1
Host: blobs.example.org
```

An optional extension is permitted after the digest, but it does not affect
content identity. The adapter bounds `Content-Length` before allocation when
present, bounds streamed bytes regardless, computes SHA-256 incrementally,
and returns usable complete bytes only after exact digest and expected-size
verification.

### 8.3 Ranges

A ranged request uses `Range: bytes=<start>-<end>` and expects `206 Partial
Content` with a valid `Content-Range`. Ranges improve seeking and bandwidth,
but an ordinary SHA-256 of the whole object cannot verify an isolated range.
The adapter labels range output unverified until it assembles and hashes the
complete object. A future chunk-tree profile uses another content-reference
scheme and implementation profile ID.

### 8.4 Redirects

BUD-01 permits temporary or permanent redirects. The redirect locator contains
the same SHA-256. A conforming adapter also:

- permits only the declared schemes and a bounded redirect count;
- rejects digest-changing or downgrade redirects;
- never forwards BUD-11, entitlement, billing, upload, or delete credentials
  across origins without a separately authorized destination;
- applies the same size and digest verification to final bytes; and
- reports the selected provider as origin even when a CDN serves the body.

TLS, a matching URL path, `200`, ETag, media type, or provider signature never
replaces verification of the final bytes.

## 9. BUD-11 authorization

### 9.1 Token shape

A BUD-11 token is a signed Nostr event of kind `24242`:

```json
{
  "kind": 24242,
  "created_at": 1785580800,
  "tags": [
    ["t", "upload"],
    ["expiration", "1785581100"],
    ["x", "<lowercase-sha256>"],
    ["server", "blobs.example.org"]
  ],
  "content": "Upload encrypted Onym blob"
}
```

The complete event also contains the canonical Nostr `id`, x-only `pubkey`,
and BIP-340 signature. Its `content` is human-readable. `created_at` is in the
past, `expiration` is in the future, and the action verb matches the endpoint:

| Endpoint | `t` verb | Matching `x` required |
|---|---|---|
| `GET /<sha256>` | `get` | Optional by BUD-11; required by this scoped profile when auth is used |
| `HEAD /<sha256>` | `get` | Optional by BUD-11; required by this scoped profile when auth is used |
| `PUT /upload` | `upload` | Required; implied digest comes from `X-SHA-256` |
| `HEAD /upload` | `upload` | Required; implied digest comes from `X-SHA-256` |
| `DELETE /<sha256>` | `delete` | Required |
| `GET /list/<pubkey>` | `list` | Not applicable |

Although BUD-11 makes `server` optional, this profile includes the lowercase
domain-only server tag to prevent replay at another provider. It includes one
matching `x` whenever the operation concerns a known object.

### 9.2 HTTP encoding and validation

The JSON event is encoded as URL-safe Base64 without padding and placed in:

```http
Authorization: Nostr <base64url-without-padding>
```

The provider verifies event ID, Schnorr signature, kind, timestamps, action,
server scope, digest scope, and endpoint relation before granting the action.
The token is short-lived and never logged in full.

### 9.3 Key policy

Current upload tokens use a fresh ephemeral key. This reduces correlation but
cannot later prove that the same user may list or delete the uploaded blob.
Free write-only providers can accept that tradeoff. Providers offering quota,
subscriptions, listing, or deletion use a pseudonymous key scoped to their
`componentId`, or issue narrower capabilities from it. They never require the
global Onym, association, message, or notary key.

## 10. List and deletion mapping

BUD-12 optionally provides:

- `GET /list/<pubkey>` with cursor/limit pagination; and
- `DELETE /<sha256>` for one object.

Listing reveals every object associated with one provider public key and is
not required for ordinary content-addressed Onym retrieval. A UI enables it
only when the provider manifest, privacy disclosure, and use case require it.

Delete authorization uses `t=delete`, a matching `x`, expiration, server
scope, and the provider-scoped key associated with the object. Successful
`200` or `204` means only that this provider accepted deletion under its
declared scope. `404` means absent or unavailable for deletion; it does not
prove erasure. Copies may remain with a CDN, mirror, cache, backup, recipient,
or another provider.

Multiple `x` tags never turn one BUD-12 request into bulk deletion. Each
object receives its own request and per-provider outcome.

## 11. Payment mapping

### 11.1 Direct Blossom payments

BUD-07 permits a Blossom endpoint to return HTTP `402 Payment Required` with
one or more payment-method headers, currently including `X-Cashu` and
`X-Lightning`. A direct-protocol client validates a supported challenge,
obtains the method-specific proof, and retries as required by that method.

`HEAD /upload` or `HEAD /<sha256>` can reveal a requirement before transferring
the large body. Under BUD-07, payment proof is not sent by retrying the `HEAD`;
the client proceeds to the corresponding `PUT` or `GET`.

### 11.2 Onym platform-channel payments

StoreKit and Play Billing are not BUD-07 Cashu or Lightning payments. An Onym
provider can additionally declare `onym-seat-entitlement-v1`. Its HTTP 402
returns a canonical, bounded `PaymentRequired` document or signed reference
that names the provider component and `SeatOffer`.

```text
application -> Blossom adapter: HEAD preflight or blob operation
application <- adapter: 402 + PaymentRequired(provider + offer)
UI -> platform channel: approved subscription or consumable purchase
UI -> billing broker: signed purchase + provider-scoped access public key
UI <- billing broker: SeatEntitlement
billing broker -> provider control plane: validate/register entitlement
provider -> client: short-lived capability, or active key binding
application -> adapter: retry exact operation with scoped BUD-11 proof
application <- adapter: verified provider outcome
```

The browser/mobile adapter does not treat a client-side “paid” flag as proof.
The billing broker validates the platform transaction, handles idempotency,
renewal, refund, and revocation, and settles the provider according to the
signed `ChannelOffer`. Apple or Google fees, taxes, the UI owner's disclosed
commission, reserves, and payout occur outside Blossom content requests.

The provider receives a seat entitlement, webhook registration, or derived
credential—not the App Store receipt, account, global identity, group ID,
attachment key, or plaintext metadata. A BUD-11 signature proves control of
the registered provider-scoped key when the request is retried.

This is an Onym extension layered over HTTP 402, not a claim that StoreKit is a
standard Blossom payment method. Direct BUD-07 methods and Onym channel offers
remain separate capabilities in the manifest.

## 12. Retention and replication

Blossom SHA-256 addressing allows the same exact ciphertext to be stored at
multiple providers. The route returns one outcome per origin and considers the
application's `minimumStored` policy separately from each individual success.

A BUD-02 descriptor proves a matching provider response at upload time. A
BUD-01 `HEAD` or verified `GET` proves availability when observed. None proves
future durability. A paid minimum-retention offer needs its own signed terms,
monitoring, and evidence; the optional `Sunset` header remains advisory.

If one provider is missing the object, a receiver tries authenticated
attachment locations and then explicitly selected compatible alternatives.
It does not assume the receiver's default server has the digest. Replication
and migration reuse verified encrypted bytes; re-encryption creates another
SHA-256 and attachment version.

## 13. Limits and resource control

The signed manifest declares complete limits. Clients bound request bodies,
response bodies, descriptor JSON, header counts and lengths, redirects,
range assembly, concurrent calls, retries, authorization lifetimes, and local
outbox retention.

The current reference deployment runs `ghcr.io/hzrd149/blossom-server:latest`
behind Caddy. Caddy's request-body limit for the Blossom origin is configured
as `100MB`. That is an ingress ceiling, not a promise that every provider or
backend accepts an object of that size, and an unpinned `latest` image is not a
stable implementation identity.

Current application encoders impose additional media-specific limits, such as
image resizing, but those are application policy rather than Blossom limits.
The adapter checks the selected provider's smaller effective limit before
upload.

## 14. HTTP and domain error mapping

| Abstract error | Blossom source |
|---|---|
| `unsupported_profile` | Missing required BUD/profile capability |
| `invalid_endpoint` | Invalid origin, manifest mismatch, TLS failure, or downgrade |
| `invalid_reference` | Noncanonical SHA-256 or `X-SHA-256` mismatch |
| `payload_too_large` | Local manifest limit or HTTP 413 |
| `unreachable` | DNS, TLS, timeout, connection, or 5xx failure |
| `auth_required` | HTTP 401 without a usable authorization |
| `payment_required` | HTTP 402 with supported signed offer/challenge |
| `invalid_entitlement` | Rejected registered key, capability, or payment proof |
| `rate_limited` | HTTP 429 |
| `unsupported_wire_type` | HTTP 415 |
| `upload_rejected` | HTTP 400/403/411 or other explicit refusal |
| `descriptor_mismatch` | Missing/wrong descriptor digest, size, URL, or type |
| `outcome_unknown` | Lost response after request body may have been accepted |
| `not_found` | HTTP 404 on probe/download |
| `invalid_indirection` | Unsafe, excessive, or digest-changing redirect |
| `digest_mismatch` | Complete returned bytes hash to another value |
| `range_invalid` | HTTP 416 or inconsistent `Content-Range` |
| `delete_unconfirmed` | Lost response, 404 ambiguity, or unsupported deletion evidence |

Provider `X-Reason` and bodies are bounded diagnostics. They cannot become an
executable locator, product mapping, or authorization rule.

## 15. Current implementation mapping

| Boundary role | Current implementation |
|---|---|
| Blob seam | `BlossomClient` in `onym-ios` and `onym-android` |
| Production adapter | `URLSessionBlossomClient` and `OkHttpBlossomClient` |
| Encryption and digest | `ChatImageCrypto` on both platforms |
| Attachment descriptors | Image, video, and voice attachment types |
| Download verification | Media loaders call `ChatImageCrypto.open` |
| Provider selection | `BlossomServersRepository` and selection stores |
| Retry source | Encrypted chat outbox retains exact uploaded bytes |
| Reference deployment | `blossom-server` behind Caddy in `onym-infra` |

Implemented today on both platforms:

- AES-256-GCM encrypted image, video, poster, and voice blobs;
- SHA-256 over exact combined ciphertext bytes;
- `PUT /upload` and `GET /<sha256>`;
- kind-`24242` upload tokens with `t=upload`, `x`, and five-minute
  `expiration`, signed by a fresh ephemeral Nostr key;
- BUD-02-inspired `sha256`, `url`, and `size` response decoding;
- encrypted outbox preservation for upload retry; and
- separate user-selectable Blossom server configuration.

## 16. Known gaps

Current code is not yet a complete conforming implementation:

1. each app uses only the first configured server instead of executing a
   replicated `BlobRoute` with per-provider outcomes;
2. the common seam exposes only upload and complete download—no `HEAD`, range,
   delete, list, replication, outcome query, retention, or payment operations;
3. upload requests omit `X-SHA-256`, even though current BUD-11 uses it as the
   implied hash for `PUT /upload` authorization;
4. BUD-11 events are encoded with ordinary padded Base64, while the current
   document requires URL-safe Base64 without padding;
5. tokens omit the optional `server` tag, so they are not provider-scoped at
   the wire level, and their generic `Upload chat image` content is inaccurate
   for video and voice;
6. fresh ephemeral upload keys provide no durable continuity for subscription,
   quota, list, or later delete authorization;
7. response decoding accepts missing `sha256`, `url`, and `size` by substituting
   local digest, empty URL, and zero size; it ignores required BUD-02 `type`
   and `uploaded` fields and does not fully verify the returned descriptor;
8. clients accept any HTTP 2xx upload response rather than the profile's
   explicit 200/201 semantics;
9. encrypted objects are uploaded with their plaintext media MIME type rather
   than `application/octet-stream`;
10. download digest verification occurs later inside media decryption callers,
    not in the blob port's return type, and downloads lack a declared network
    size bound and explicit redirect validation;
11. status failures collapse into small platform-specific error models, so
    auth, payment, quota, rate, missing content, and mismatch are not stable
    domain results;
12. provider preferences do not bind signed identity, BUD revisions, limits,
    retention, deletion, redirects, privacy, offers, or entitlement issuers;
13. `PaymentRequired`, `SeatEntitlement`, preflight, broker registration,
    renewal, revocation, and storage/egress quota accounting are not
    implemented;
14. attachment locations are incomplete, and missing-server behavior can fall
    back to the receiver's current default without evidence that it stores the
    digest;
15. source comments call signed upload authorization “BUD-01 auth,” while the
    current protocol assigns retrieval to BUD-01, upload to BUD-02,
    authorization to BUD-11, and management to BUD-12; and
16. the reference deployment uses an unpinned `latest` server image, while
    conformance relies on mirrored application tests rather than one public
    suite runnable by third-party clients and providers.

These gaps are interoperability, privacy, and correctness work, not alternate
Blossom semantics that third parties should copy.

## 17. Conformance tests

A shared fixture suite covers:

1. cross-platform AES-GCM layout and SHA-256 reference construction;
2. lowercase digest validation and path/extension handling;
3. upload headers, exact bytes, 200-versus-201 outcomes, and strict descriptor
   validation;
4. BUD-11 canonical event ID/signature and unpadded Base64url encoding;
5. action, expiration, server, and digest authorization scoping;
6. `HEAD`, complete `GET`, optional extension, `Sunset`, and not-found cases;
7. ranges, full-object assembly, and refusal to decrypt an isolated
   unverified range;
8. redirect bounds, same-digest enforcement, and cross-origin credential
   stripping;
9. HTTP status and safe `X-Reason` mapping;
10. BUD-07 direct payment and Onym seat-payment separation;
11. timeout-after-upload, probe-before-retry, and idempotent existing-object
    response;
12. partial replication, provider loss, receiver-location selection, and
    exact-byte migration;
13. list/delete authorization and narrow deletion outcomes; and
14. manifest identity, capability, limit, retention, offer, and expiry checks.

## 18. Acceptance criteria

This Blossom profile satisfies the abstract boundary when:

1. a third-party adapter can implement it from pinned public documents and
   fixtures without inspecting Onym mobile code;
2. a third-party Blossom provider can offer paid or free storage without
   becoming an Onym identity, message, or notary authority;
3. HTTP methods, paths, descriptors, status codes, Nostr events, and headers
   remain behind the abstract blob port;
4. each selected provider outcome states exactly what its response proved;
5. all usable complete downloads are size-bounded and SHA-256 verified before
   decryption;
6. authorization uses only short-lived or provider-scoped keys and is never
   forwarded to an unauthorized origin;
7. payment never sends platform receipts, plaintext metadata, or blob keys to
   the provider;
8. redirects, ranges, retry, partial replication, missing content, digest
   corruption, and deletion uncertainty pass shared fixtures; and
9. replacing Blossom does not alter abstract operations or the encrypted Onym
   attachment format.

## References

1. Abstract Onym blob boundary: [UI-Blob.md](UI-Blob.md)
2. Onym iOS client: <https://github.com/onymchat/onym-ios>
3. Onym Android client: <https://github.com/onymchat/onym-android>
4. Onym infrastructure: <https://github.com/onymchat/onym-infra>
5. Blossom protocol and BUD index: <https://github.com/hzrd149/blossom>
6. BUD-01, server requirements and blob retrieval:
   <https://github.com/hzrd149/blossom/blob/master/buds/01.md>
7. BUD-02, blob upload:
   <https://github.com/hzrd149/blossom/blob/master/buds/02.md>
8. BUD-07, paid upload and download:
   <https://github.com/hzrd149/blossom/blob/master/buds/07.md>
9. BUD-11, Nostr authorization:
   <https://github.com/hzrd149/blossom/blob/master/buds/11.md>
10. BUD-12, blob management endpoints:
    <https://github.com/hzrd149/blossom/blob/master/buds/12.md>
