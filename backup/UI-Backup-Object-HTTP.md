---
status: draft
proposed: Claude & @rinat-enikeev
date: 19.08.2026
---

# Onym UI ↔ Backup: Object-HTTP Implementation

**Implementation profile draft 0.1 — August 2026**

> The device seals a whole snapshot under a key derived from the person's own
> recovery phrase, addresses it by a digest over the sealed bytes, and hands an
> operator opaque chunks over HTTPS. The operator authenticates a public key,
> counts bytes, and can do nothing else with what it holds.

This document is a concrete implementation of
[UI-Backup.md](UI-Backup.md). The abstract specification remains authoritative
for operation meaning, retention and erasure semantics, restore authorization,
terms binding, payment isolation, and the disclosure obligations. This document
pins the wire mapping, the sealing and digest suites, the key derivation, the
proof-of-possession construction, the erasure-receipt semantics, the portable
export container, and the payment-refusal mapping — the seven items
[UI-Backup.md](UI-Backup.md) §17 names as preconditions for the boundary being
executable at all.

The document distinguishes:

- **profile requirements**, which are required for a conforming adapter or
  operator;
- **rationale**, which explains a choice that is not forced; and
- **gaps**, where the profile knowingly stops short.

**A conforming operator exists; a conforming client does not.**
[onym-backup](https://github.com/onymchat/onym-backup) implements §9's routes,
§11's receipts and §12's container, and every amendment in this document since
draft 0.1 came from building it. The iOS client of
[UI-Backup.md](UI-Backup.md) §5 is not yet wired to a live operator, and §18's
fixtures are not written. Where this document describes behaviour neither side
has exercised — the payment mapping of §10 above all — it is still a design,
and is marked as such. Unlike
[UI-Blob-Blossom.md](../blob/UI-Blob-Blossom.md), this profile does not yet
carry an "implemented behavior" column, so which side has exercised a given
sentence has to be read from §18 rather than from the sentence.

## 1. Conformance declaration

| Abstract concept | Object-HTTP mapping |
|---|---|
| Operator endpoint | HTTPS origin, operations under `/v1/` |
| Snapshot reference | `sha256:<64 lowercase hex>` over the exact sealed byte sequence |
| Sealing | AES-256-GCM over 1 MiB plaintext chunks under a per-snapshot key |
| Key derivation | HKDF-SHA256 from the holder's BIP39 seed |
| Access authorization | Request-bound Ed25519 proof of possession, single-use |
| Holder identity at the operator | An Ed25519 public key and nothing else |
| Increment model | None; whole snapshot, transfer-chunked |
| Upload | `POST /v1/preflight`, `PUT /v1/uploads/{id}/chunks/{n}`, `POST /v1/uploads/{id}/commit` |
| List | `GET /v1/snapshots` |
| Download | `GET /v1/snapshots/{digest}`, `Range` supported |
| Erase | `POST /v1/erasures` returning a signed receipt |
| Export | `GET /v1/exports`, `GET /v1/exports/{digest}` |
| Outcome reconciliation | `GET /v1/operations/{operationId}` |
| Payment refusal | HTTP `402` with a `PaymentRequired` body |
| Entitlement | Broker-signed `SeatEntitlement`, verified locally by the operator |

The implementation profile identifier is:

```text
onym:backup-implementation:object-http-v1
```

It maps this portable profile:

```text
onym:backup-profile:sealed-device-archive-v1
```

## 2. Physical topology

```text
device                         operator origin              billing broker
  |                                  |                            |
  |-- GET /manifest.json ----------->|                            |
  |-- GET /terms/{termsId}.json ---->|                            |
  |-- POST /v1/preflight ----------->|                            |
  |<-- 402 PaymentRequired ----------|                            |
  |                                                               |
  |-- purchase evidence + seat key ----------------------------->|
  |<-- sealed SeatEntitlement -----------------------------------|
  |                                                               |
  |-- POST /v1/entitlements -------->|                            |
  |                                  |-- GET /v1/revocations ---->|
  |-- PUT chunks, POST commit ------>|   (signed, cacheable,      |
  |<-- outcome ----------------------|    unauthenticated)        |
```

There is no operator-to-broker request path and no broker-to-operator webhook.
The operator's only dependency on the broker is a public, signed, cacheable JSON
document it verifies against a key pinned at boot (§10.4). This is what makes
the operator's access decisions independent of broker goodwill, and it is a
profile requirement, not a deployment detail.

## 3. Pinned suites

| Suite | Value |
|---|---|
| `digestSuite` | `sha-256/lowercase-hex`, rendered `sha256:<hex>` |
| `sealingSuite` | `aes-256-gcm/hkdf-sha256-from-bip39-seed` |
| `incrementModel` | `whole-snapshot-transfer-chunked-v1` |
| `authentication` | `holder-scoped-capability/ed25519-request-bound-v1` |
| `receiptSchema` | `per-operation-backup-outcome-v1` |
| `erasureReceiptSchema` | `onym-backup-erasure-receipt-v1` (§11) |
| `errorSchema` | `onym-backup-errors-v1` |
| `paymentRefusal` | `onym-payment-required-v1` |

*Rationale — hex, not base64url.* Every other content address in this system is
`sha256:<lowercase hex>`: the service manifest digest, the mandate hash, the
contracts manifest. A second encoding for one seat would buy nothing and cost a
class of comparison bugs.

*Rationale — AES-GCM, not XChaCha20-Poly1305.* AES-GCM is what the platform
crypto libraries on both current clients expose natively and what the rest of
this system already seals with. A nonce-misuse-resistant construction would be
preferable in the abstract, but the per-snapshot key and the counter nonce of
§5.4 make nonce reuse impossible by construction rather than by discipline.

## 4. Operator declaration

### 4.1 Served documents

A conforming operator serves, over HTTPS, without authentication:

| Path | Content |
|---|---|
| `/manifest.json` and `/manifest.json.sig` | the `ServiceManifest` of [UI-Backup.md](UI-Backup.md) §5.3, `seat: "storage.backup"`, with a detached Ed25519 signature over the exact served bytes |
| `/profile.json` | the `BackupImplementationProfile` of §5.2, naming this document's identifier |
| `/terms/{termsId}.json` and `/terms/{termsId}.json.sig` | the `BackupTerms` of §5.4 |
| `/health` | liveness, current terms digest, and revocation-epoch staleness |

`termsId` is `sha256:<hex>` over the canonical bytes of the terms document with
`termsId` and `signature` omitted (§6.3 defines canonical bytes).

**The path carries the bare hex, not the prefixed form**: a `termsId` of
`sha256:1b78…` is served at `/terms/1b78….json`. The prefix names the algorithm
and the algorithm is already pinned by §6.1, so repeating it in a path segment
buys nothing and costs an escaping question. §12's container paths use the same
bare hex, so a container member's name is its URL's last segment.

**Every terms document the operator has ever accepted a snapshot under must
remain served, forever, at its content-addressed path.** Retained snapshots pin
a `termsId`, and a holder who cannot fetch the terms its snapshot was accepted
under cannot check what it was promised. An operator that stops serving a
historical terms document has broken the pinning of [UI-Backup.md](UI-Backup.md)
§5.4, whatever its current terms say.

### 4.2 Free and paid operators are the same implementation

An operator that declares no `entitlementIssuers` never returns `402` and never
consults an entitlement. That is the self-hosting path required by
[UI-Backup.md](UI-Backup.md) §15, and it must be the same binary with the same
routes — entitlement enforcement is a declared capability, not a build flavour.

## 5. Sealing and key derivation

### 5.1 Root

All backup key material derives from the holder's BIP39 seed: the 64-byte
PBKDF2-HMAC-SHA512 output over the mnemonic, salt `"mnemonic"` plus the optional
passphrase, 2048 iterations.

**The seed must be the root, not a device-scoped key.** A snapshot sealed under
key material that a device cannot export is unrestorable by construction on the
replacement device, which is the only device that will ever need it. This sounds
obvious and is the single most likely implementation mistake: a client whose
local at-rest encryption uses a device-bound key must perform a **logical
export** — decrypt through its own stores, re-serialise, and re-seal under §5.3
— not copy its encrypted database files.

### 5.2 Derivations

All derivations are `HKDF-SHA256(ikm, salt, info, 32)`.

| Key | ikm | salt | info |
|---|---|---|---|
| Archive root | BIP39 seed | `app.onym.bip39` | `backup-archive-v1` |
| Snapshot key | archive root | the snapshot's 32-byte `snapshotSalt` | `backup-snapshot-v1` |
| Access signing (Ed25519) | BIP39 seed | `app.onym.bip39` | `backup-access-ed25519-v1\|<componentId>\|r<rotation>` |
| Access agreement (X25519) | BIP39 seed | `app.onym.bip39` | `backup-access-x25519-v1\|<componentId>\|r<rotation>` |

`<componentId>` is the operator's `componentId` verbatim; `<rotation>` is a
decimal counter starting at `0`.

The **signing** key is what this profile authenticates with (§8). The
**agreement** key is not used against the operator at all — it is the key a
billing broker seals a `SeatEntitlement` to, so a purchased credential travels to
one seat and is readable by one device
([../WHITEPAPER.md](../WHITEPAPER.md) §17.5,
[../settlement/ChannelOffer.md](../settlement/ChannelOffer.md) §9). It is derived
here, beside its sibling, because both are seat-scoped and both must survive a
restore from the recovery phrase alone; an operator never sees it. A free
operator's holder derives it and never uses it, which is correct rather than
wasteful. Binding the access key to `componentId` means
one operator never receives a key another operator can recognise
([UI-Backup.md](UI-Backup.md) §14.12), and no operator receives anything linkable
to the holder's identity keys.

The holder handle the operator stores and shards on is:

```text
holderHandle = sha256("onym-backup-holder-v1" ‖ accessSigningPublicKeyRaw)
```

rendered as lowercase hex. The raw public key still appears in request headers —
it must, to verify a signature — but nothing the operator persists or logs is the
key itself.

### 5.3 Snapshot key freshness

Each snapshot draws a fresh 32-byte `snapshotSalt` from a CSPRNG and derives its
key through it. The salt is stored in the clear in the sealed header (§5.4).

This is what satisfies [UI-Backup.md](UI-Backup.md) §5.6's prohibition on
convergent keying: two holders sealing byte-identical archives produce unrelated
ciphertext and unrelated digests, so no observer can confirm that a holder
possesses a known file. **The cost is that cross-holder deduplication is
impossible, permanently, and storage cost is strictly linear in holders.** That
cost is deliberate and must reach the operator's pricing rather than being
engineered away later.

### 5.4 Sealed container

```text
"ONYMSEAL1"          9 bytes, ASCII magic
u8   suiteId         0x01 = aes-256-gcm/hkdf-sha256-from-bip39-seed
u8   reserved        0x00
u32  chunkPlainBytes big-endian; 1048576 for suite 0x01
u32  chunkCount      big-endian
byte snapshotSalt    32 bytes
repeat chunkCount times:
     AES-256-GCM combined chunk: nonce(12) ‖ ciphertext ‖ tag(16)
```

Nonce for chunk *i* is `0x00000000 ‖ bigEndianU64(i)`. Under a per-snapshot key
this is unique by construction; a random nonce would also be sound but would add
a birthday argument where none is needed.

Every chunk but the last holds exactly `chunkPlainBytes` of plaintext. The last
chunk holds the remainder. The plaintext being chunked is the **padded** archive
of §7, so the last chunk's true length is not a signal.

1 MiB is chosen so a client can seal and open a multi-hundred-megabyte archive
in bounded memory. It is a property of the sealing layer only and has nothing to
do with the 8 MiB transfer framing of §9.3.

### 5.5 Access-key rotation

Rotation increments `<rotation>` in §5.2, which changes the access keypair and
therefore the holder handle. **A rotation orphans every snapshot retained under
the previous handle unless the operator supports re-binding**, and this profile
does **not** define a re-bind operation.

A conforming client must therefore either:

- present rotation as "start a new archive; the old one becomes unreachable and
  should be erased first", performing the erase under the old key before
  rotating; or
- not offer rotation, and say plainly that the access key is not rotatable.

Silently rotating and stranding a holder's snapshots does not conform. See §16.2
for why this profile takes the cost rather than adding a re-bind.

## 6. Snapshot reference and canonical forms

### 6.1 Reference

```json
{
  "referenceVersion": 1,
  "algorithm": "sha-256/lowercase-hex",
  "digest": "sha256:<64 lowercase hex>",
  "sealedByteSize": 41235904
}
```

`digest` is SHA-256 over the **exact** sealed byte sequence of §5.4, beginning at
the `O` of `ONYMSEAL1` and ending at the final tag byte. It covers no local state,
no decoded archive, no locator, and no mutable metadata.

`sealedByteSize` is the length of that same sequence. An operator must reject a
commit whose received byte count differs, before recomputing anything.

### 6.2 Digest scope

**A snapshot's identity is the pair `(holder, digest)`, never the digest alone.**

Within one holder, a `digest` already retained is `already_retained`: the
operator does not accept a second upload under it and does not overwrite.

Across holders there is no collision concept at all, and an operator must not
invent one. The same digest legitimately appears under two handles whenever
sealed bytes move — a migration under §12, a re-upload of an exported archive, or
the destructive rotation flow of §5.5, all of which are supposed to preserve the
bytes and therefore the reference verbatim. An operator seeing a familiar digest
arrive under a new handle is watching the export path work.

It follows that the operator must not deduplicate across holders (§14.6 of the
abstract forbids it independently), must not refuse the second upload, must never
serve one holder's bytes to another, and must not treat the coincidence as
evidence about either holder. The last of those is the one worth stating: two
handles holding one digest is exactly what a person migrating between operators,
or restoring their own archive under a rotated key, produces — and an operator
that logged or acted on the observation would be building the cross-holder
linkage this seat is shaped to prevent.

### 6.3 Canonical bytes

Wherever this profile says "canonical bytes" of a signed JSON document, it means:
parse to a JSON value, remove the named signature field **structurally** (never
by string editing), re-serialise with object keys sorted by **UTF-8 byte order**,
no insignificant whitespace, and integer-only numbers.

Byte-order sorting is not the same as case-insensitive, locale, or
Unicode-scalar sorting. The trap is that **every document this profile defines
today sorts identically under all four**, because their keys are all lowercase
ASCII — so an implementation can choose the wrong rule, pass every test it has,
and break the first time a field arrives with an uppercase initial (`Z` precedes
`a` by byte order and follows it case-insensitively) or a character above
U+FFFF (where UTF-8 byte order and **UTF-16 code-unit** order diverge, because
the surrogate code units `0xD800`–`0xDBFF` sort below `0xE000`–`0xFFFF` while
the scalars they encode are the largest — so a runtime whose default string
comparison is UTF-16, such as Java or JavaScript, sorts U+1D400 *before*
U+FED6, which both UTF-8 byte order and codepoint order put the other way).

UTF-8 byte order and codepoint order never diverge: UTF-8 was designed so
byte-wise comparison reproduces scalar comparison exactly. The rule could
therefore be stated either way; it is stated as byte order because that is what
an implementation actually does to the serialized document.

The rule is therefore pinned now, before anything depends on it, and the
conformance fixtures must include a document whose keys actually distinguish the
orderings — not only the real documents, which cannot (§18.11).

Floating-point numbers are prohibited in every signed document this profile
touches, matching the service-manifest rule. A fractional value is published as
a string or a scaled integer.

## 7. Padding

The plaintext archive is padded before sealing, to the Padmé bucket of its
length. For a length `L` with `E = floor(log2(L))` and `S = floor(log2(E)) + 1`,
`L` is rounded up to the next multiple of `2^(E - S)`. The padding bytes are
zero, and the archive's true length is recorded in its own header, inside the
seal.

Worked example: `L = 41_000_000` gives `E = 25`, `S = 5`, so `L` rounds up to a
multiple of `2^20 = 1_048_576`, yielding `41_943_040` — 2.3% overhead.

*Rationale.* Padmé caps overhead at about 12% while leaving `sealedByteSize` a
coarse bucket rather than a measurement of a person's history. A power-of-two
ladder leaks less but can double the stored bytes, and storage cost here is
already linear in holders and unhedgeable by deduplication (§5.3); doubling it to
buy a marginal reduction in an already-coarse signal is the wrong trade.

An operator sees `sealedByteSize` and cannot avoid seeing it. What it must not do
is retain a time series of it per holder beyond the snapshot's own retention
(§15).

## 8. Proof of possession

### 8.1 Construction

Every `/v1/` request carries:

| Header | Value |
|---|---|
| `X-Onym-Holder` | `onym:seat-key:<64 lowercase hex>`, the access signing public key |
| `X-Onym-Timestamp` | RFC 3339, UTC, second precision, no fractional seconds |
| `X-Onym-Nonce` | 16 random bytes, lowercase hex |
| `X-Onym-Signature` | base64 Ed25519 over the bytes below |

The signed bytes are the concatenation, each field prefixed by its big-endian
`u32` length:

```text
"onym-backup-v1" | method | path | holder | timestamp | nonce | sha256(body)
```

`method` is the uppercase HTTP method. `path` is the request path with its query
string, exactly as sent. `sha256(body)` is the 32 raw bytes of the digest of the
request body, or the digest of the empty string for a body-less request.

Length prefixing is not decoration: without it, a signature over concatenated
fields can be reinterpreted by shifting a boundary between two adjacent
attacker-influenced fields.

The `onym:seat-key:` prefix is deliberate and must be carried verbatim. Every
other identifier in this profile — issuer, operator, component — uses
`onym:key:` or `onym:component:`, and the holder's is the one place the wire
says *this key is seat-scoped and is not an identity key*, which is §5.2's
anti-correlation rule made visible rather than merely intended. It is also the
byte-for-byte value a `SeatEntitlement`'s `subject` must equal (§10.4), so the
two documents share one spelling of one key.

### 8.2 Verification

The operator recomputes the byte string from the request it actually received —
never from a client-supplied copy — verifies the signature against the key in
`X-Onym-Holder`, requires `|now - timestamp| <= 300s`, and requires that the
signature has not been seen before.

**Seen signatures are retained for at least twice the freshness window — 600s —
not once.** The window is two-sided to tolerate a client clock running fast, so a
signature timestamped 300s ahead of the operator's clock is accepted now and
stays acceptable until `now + 300s`: it is live for up to 600s from first sight.
A cache swept at 300s would drop it while it is still valid and reopen exactly
the replay this check exists to close. The alternative — refusing any
future-dated timestamp — closes it too, at the cost of failing every client whose
clock is a few seconds fast, which is most of them.

Because `path` and `sha256(body)` are inside the signature, a chunk PUT cannot be
replayed into a different chunk index, a different upload, or a different
operation.

### 8.3 There is no other authority

A holder is an Ed25519 public key. There is no account, no email address, no
support identifier, no password, and no recovery question. This is the mechanical
content of [UI-Backup.md](UI-Backup.md) §11 and §18.6, and it means a conforming
operator can be checked for it rather than trusted about it:

- no route accepts a credential other than the proof above;
- no route, authenticated or otherwise, changes the holder a snapshot belongs to;
- no administrative route exists — not a token-gated one, not a localhost-only
  one;
- no per-holder access log exists (§15).

An operator that adds any of these has left this seat and must say so before the
capability exists, not after.

## 9. Wire mapping

All request and response bodies are JSON with camelCase keys, RFC 3339 UTC
timestamps, and base64 for opaque bytes — except chunk uploads, which are
`application/octet-stream`. All responses to a failed operation use the error
body of §14.

### 9.1 Register an entitlement — `POST /v1/entitlements`

Body: `{"version": 1, "entitlement": { … the SeatEntitlement document … }}`.

The operator verifies it per §10.4 and stores it against the presenting holder.
Registering is idempotent by `entitlementId`.

### 9.2 Preflight — `POST /v1/preflight`

```json
{
  "version": 1,
  "operationId": "<random 128-bit, lowercase hex>",
  "snapshotReference": {"referenceVersion": 1, "algorithm": "sha-256/lowercase-hex",
                        "digest": "sha256:…", "sealedByteSize": 41943040},
  "acceptedTermsId": "sha256:…",
  "supersedes": "sha256:… or null"
}
```

Checked in this order, each failing closed:

1. `acceptedTermsId` is not the operator's current terms → `409 terms_changed`,
   with `currentTermsId`. The client stops and re-presents consent.
2. entitlement required and absent, expired, or revoked → `402 payment_required`
   (§10).
3. digest already retained for this holder → `200` with an `already_retained`
   outcome.
4. a live grant already exists for this `(holder, digest)` → `200` returning
   **that** grant, with its original `expiresAt` and a `missingChunks` list in
   the ranges of §14. The operator may mint a new `uploadId` only once the
   existing grant has expired.
5. `sealedByteSize` exceeds `maximumSealedSnapshotBytes` → `413 snapshot_too_large`.
6. retained count or bytes would exceed the declared limits → `409 quota_exceeded`,
   reporting the limit and current usage. The operator **must not** silently drop
   an older snapshot to make room. Grants issued and not yet committed count
   against the limit, or a client could preflight repeatedly against a count
   that has not moved and commit past it.
7. otherwise → `200 {"uploadId": …, "chunkBytes": 8388608, "chunkCount": …,
   "expiresAt": …}`.

The resumed grant carries `missingChunks` because otherwise the only way to
learn what arrived is to send a commit expecting it to fail. That works, and an
implementation would converge on it, which is the problem: a protocol whose
progress query is a deliberately failing write is one every implementer
discovers separately and none writes down. Preflight already knows the answer.
A fresh grant carries every index as one range, so the field is present on both
paths and a client needs no special case.

**The grant's own values stand.** A re-preflight whose `sealedByteSize`
disagrees with the live grant's is `400 invalid_reference` — the digest is over
the sealed bytes, so two byte counts for one digest is a contradiction, and
guessing which is right is not the operator's job. A re-preflight whose
`supersedes` differs is *not* refused: the grant keeps what it was minted with,
because refusing would strand the holder until expiry with quota headroom they
cannot release. A client that needs different `supersedes` waits out the grant.
Silently taking the new value is the one option ruled out — the committed
snapshot would pin something no accepted request asked for.

The returned `expiresAt` is the original, not an extension. A client that lost
the grant response has already burned part of its window, so an unextended
deadline can expire mid-retry — and that is the bounded outcome: the grant
lapses, the partial bytes are discarded, and the next preflight mints a fresh
grant with a full window. Permitting extension instead would make the sentence
above unbounded, since a holder could hold quota headroom indefinitely by
re-preflighting, which is the abuse step 6 exists to prevent.

§9.8 does not cover this case, despite also existing for lost responses: it
returns a recorded *outcome*, and a grant that was issued and never committed
has no outcome to record. What the client needs back is a resumable grant, and
only preflight can return one.

Step 4 is the same reconciliation as step 3, one stage earlier. A grant whose
response was lost is an upload the holder cannot finish and cannot abandon; if a
re-preflight minted a second grant, the orphan would count against the quota
until it expired, and the holder would be refused on the strength of a response
they never received.

The general rule behind that ordering: **every check that only matters when new
bytes would be accepted runs after the digest lookup.** Both limits — size and
quota — bound acceptance, and a re-preflight for a digest the operator already
holds accepts nothing, so neither may refuse it. Idempotent reconciliation has to
keep working *at* the limit, which is exactly where a client will need it, and
`maximumSealedSnapshotBytes` is a manifest-level declaration an operator can
lower without any `terms_changed` to warn the holder — so a snapshot accepted
under an older, higher limit must still be reconcilable afterwards.

**Preflight is the entire point of the payment mapping.** A `402` must cost one
small request, not a completed multi-hundred-megabyte upload. An operator that
declines to implement preflight does not conform to this profile.

### 9.3 Upload — `PUT /v1/uploads/{uploadId}/chunks/{index}`

`application/octet-stream`, `index` zero-based. Every chunk but the last is
exactly `chunkBytes`; the last is the remainder. Chunks may be sent in any order
and retried idempotently; a chunk already received with a matching body digest is
a `200`, and one with a differing digest is `409 chunk_mismatch`.

A chunk sent after the grant's `expiresAt` is `409 upload_expired`, the same as
at commit. This route will meet expiry far more often than commit does — it is
the one a long upload spends its time in — so leaving it to be inferred from the
commit ordering would leave the common case unstated.

Transfer chunking is independent of the AEAD chunking of §5.4. It exists so an
interrupted upload resumes, and so an operator can bound a single request body.

`POST /v1/uploads/{uploadId}/commit` with an empty body. The operator:

0. asserts the grant has not expired — `409 upload_expired`, and the partial
   upload is discarded;
1. asserts every index received — a gap is `409 upload_incomplete`, carrying
   `missingChunks` and `chunkCount`, and **the grant survives**;
2. asserts the total byte count equals `sealedByteSize`;
3. recomputes SHA-256 over the concatenation in index order and compares to
   `digest` — mismatch is `409 digest_mismatch` and the partial upload is
   discarded;
4. only then moves the bytes into place and records the snapshot.

Steps 1 and 3 fail differently on purpose. A commit sent one chunk early is an
ordinary consequence of a lost chunk response, and discarding what has arrived
would make one missing chunk cost a re-upload of the whole snapshot; the
operator names the gap and the client sends what is missing. A digest that
disagrees at step 3 is not recoverable by sending more — every index is already
present — so those bytes are discarded rather than left occupying disk that no
retry can use.

Expiry is step 0 rather than a note beside the list because the answers
conflict: a commit on an expired grant that is also missing a chunk could
otherwise conform by returning either code, and they tell the client opposite
things — `upload_incomplete` promises the grant survives and the gap is worth
sending, while `upload_expired` means the bytes are gone. Expiry decides first.

`upload_expired` and `upload_not_found` are recovered the same way: the partial
bytes are discarded either way, so the client re-preflights and re-transfers.
The distinction is diagnostic rather than procedural — it lets a client tell a
correct id that went stale from an id that was never right, which is the
difference between a slow upload and a bug. An operator whose grant record has
already been discarded (§15 bounds it at `expiresAt`) answers
`upload_not_found`, and that is conforming: the profile does not require
retaining expired grants in order to name them, because retaining them would
mean keeping a list of digests a holder started and abandoned.

A crash between step 4's move and its record leaves an orphan, which a startup
reconciliation sweep resolves — deleting bytes with no record, and marking a
record with no bytes as unavailable.
**A record whose bytes are missing is never reported as `retained`.**

### 9.4 List — `GET /v1/snapshots`

`200` with an array of `{snapshotReference, acceptedTermsId, retainedAt,
retainedUntil, supersedes, status}`. Scoped to the presenting holder; there is no
parameter that widens it.

### 9.5 Download — `GET /v1/snapshots/{digest}`

`200` or `206` with `application/octet-stream`; `Range` is supported. The client
verifies the full digest before treating any byte as restorable, and a partial or
mismatching download is `incomplete_snapshot` locally — never a partial restore.

### 9.6 Erase — `POST /v1/erasures`

```json
{"version": 1, "operationId": "<random 128-bit, lowercase hex>",
 "scope": "sha256:…"}                        // one snapshot
{"version": 1, "operationId": "…", "scope": "all"}   // every snapshot under this holder
```

`200` with a JSON **array** of the signed receipts of §11 — one per distinct
`acceptedTermsId` in scope.

An array rather than a single receipt because §11's receipt carries one
`termsId`, and a `scope: "all"` spanning snapshots accepted under different
terms cannot honestly be one document. Citing whichever terms happen to be
current would sign a promise the holder never accepted, and citing one of
several would misdescribe the rest. The erasure always covers the whole scope;
only the number of receipts varies. A single-digest scope therefore yields an
array of exactly one.

`operationId` is client-chosen, like every other operation's. §9.8
reconciliation is keyed on an id the *client* knows: an operator-invented one
cannot be asked about, so a lost erase response would leave the holder unable
to discover whether the erasure happened — and unable to obtain the receipt.

**Erasure is idempotent.** Re-erasing a scope whose snapshots are already gone
returns the receipts already issued for that scope, not `404`. A holder whose
response was lost is retrying, and answering "no such snapshot" is the same
silence §9.4 avoids by reporting `erased` rather than omitting the row.

Receipts age out on the `erasureReceipts` window of §15, and idempotency ends
with them: once the last receipt for a scope has been discarded, a re-erase of
that scope is `410 retention_expired` — held once, no longer held, said of the
receipt rather than the snapshot. It is not `404`, because the snapshot rows
still record the erasure and the operator has no business pretending otherwise.
A holder past that window has their own copy: the receipt was handed to them in
the response and exported in the §12 container, and the operator's copy exists
to re-serve it, not to be its only instance.

### 9.7 Export — `GET /v1/exports`, `GET /v1/exports/{digest}`

`/v1/exports` returns the manifest of the portable container (§12);
`/v1/exports/{digest}` streams one snapshot's sealed bytes in portable form;
`/v1/exports/receipts/{receiptId}` returns one issued erasure receipt.

**The operator serves the members; the client assembles the container.** Every
path `manifest.json` names must be fetchable while the operator lives, or the
manifest describes a container nobody can build:

| Container path | Served at |
|---|---|
| `snapshots/<digest-hex>.seal` | `GET /v1/exports/{digest}` |
| `receipts/<receiptId>.json` | `GET /v1/exports/receipts/{receiptId}` |
| `terms/<termsId-hex>.json` | the manifest snapshot entry's `termsUrl` (§12) |
| `terms/<termsId-hex>.json.sig` | `termsUrl` with `.sig` appended |

`termsUrl` is a field of §12's export manifest, not of §9.4's list — which
returns `acceptedTermsId` and leaves the client to construct the path. Both
forms name the same document.

The receipt route is not only a container member. Without it a holder whose
erase response was lost could never obtain the receipt they earned, and a
receipt is the only evidence they hold that the erasure was acknowledged at
all.

That terms are served from `/terms/` rather than from under `/v1/exports/` does
not contradict §12: the container is assembled while the operator is alive, and
it is the container — not the route — that has to outlive it.

**These two routes must not consult entitlements at all.** Not "consult and
allow" — not consult. [UI-Backup.md](UI-Backup.md) §14.15 makes export
unconditional, and the only way that survives future edits is for the code path
to have no access to entitlement state. A conformance fixture asserts export
succeeds for a holder with zero entitlements (§18).

### 9.8 Outcome reconciliation — `GET /v1/operations/{operationId}`

Returns the outcome recorded for that operation, or `404` if the operator has no
record. A client that lost a response uses this to reconcile rather than
relabelling silence. `unknown` is preserved as `unknown`
([UI-Backup.md](UI-Backup.md) §14.9).

The operator declares how long it keeps outcome records in `metadataRetention`,
and a `404` after that window is not evidence the operation failed — a client
that has aged past it reconciles by *reference* instead, through `listSnapshots`.
The window exists to be short (§15).

## 10. Payment mapping

### 10.1 Refusal

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
```

```json
{
  "error": "payment_required",
  "message": "This operator requires a valid entitlement to accept a snapshot.",
  "paymentRequired": {
    "version": 1,
    "componentId": "onym:component:<operator>",
    "offers": ["<offerId>"],
    "entitlementIssuers": ["onym:key:<issuer>"],
    "manifestUrl": "https://<operator>/manifest.json"
  }
}
```

The refusal carries **no price, no currency, no storefront, and no product
identifier.** Pricing belongs to the frontend's channel agreement, not to the
operator's refusal ([UI-Backup.md](UI-Backup.md) §12). An operator that puts a
price in a `402` is asserting terms it is not party to.

### 10.2 Retry preserves the bytes

After obtaining an entitlement the client retries the **same** `operationId` with
the **same** sealed bytes and the **same** reference. Re-sealing would mint a new
`snapshotSalt` and therefore a new digest, defeating both the retry and
`already_retained`.

### 10.3 Lapse and grace

Lapse is derived from entitlement expiry. It is never derived from a failed
charge, because the operator has no charge to fail — it is not the seller.

On lapse, **each retained snapshot is governed by the `endOfPayment` clause of
its own pinned terms.** Its notice, its grace, and its post-grace fate come from
the terms it was accepted under, and from nothing else.

There is no single account-wide clause to apply, and reaching for one gets the
direction wrong. Forward-only binding means a client refuses to upload under
terms weaker than those a retained snapshot already pins, so across a holder's
retained snapshots the terms **strengthen** with age: the oldest snapshot pins
the *least* protective set, not the strictest. An operator applying the oldest
snapshot's clause account-wide would hand every newer snapshot a shorter notice
and a shorter grace than the person consented to.

The one thing that must be decided holder-wide is which operations stay
available, because a route is either open or closed. It is the **union** across
retained snapshots: an operation any snapshot's `duringGrace` promises stays
available while that snapshot is in grace. Refusing wholesale what the holder is
owed on one snapshot is the same under-delivery in another form. `preflight` and
upload refuse for the whole holder, because a lapsed holder is not owed new
retention by any snapshot's terms.

This must be an explicit allowlist in the authorization path, not an emergent
property of which routes happen to check an entitlement.

### 10.4 Entitlement verification

The operator verifies a presented `SeatEntitlement`
([WHITEPAPER.md](../WHITEPAPER.md) §17.5) entirely locally:

1. compute canonical bytes per §6.3, omitting `signature`;
2. verify the Ed25519 signature against an issuer pinned at boot and published in
   the manifest's `entitlementIssuers` — never against a key from the response;
3. `audience` equals the operator's own `componentId`;
4. `subject` equals the presenting `X-Onym-Holder` — **as an exact string,
   prefix included**. Both are `onym:seat-key:<64 lowercase hex>`; there is no
   normalization step, and an implementation that needs one has a spelling
   mismatch to fix rather than a comparison to loosen;
5. `notBefore <= now <= expiresAt`;
6. `entitlementId` is absent from the cached revocation epoch.

The revocation epoch is a broker-signed document the operator polls on its own
schedule and verifies against the same pinned key. **If the poll fails, the
operator keeps using the last good epoch and does not refuse.** A broker outage
must not delete anyone's access; the failure mode of a stale epoch is a refund
honoured late, which the terms' grace and the channel agreement's reserve already
absorb. Staleness is exposed in `/health`.

The maximum revocation latency an operator can honestly claim is its poll
interval plus the broker's epoch interval. That number, not the entitlement TTL,
is what belongs in the channel agreement.

## 11. Erasure receipts

Schema identifier `onym-backup-erasure-receipt-v1`, pinned in §3 beside the
outcome schema — the two are different documents and were previously covered by
one name.

```json
{
  "receiptVersion": 1,
  "receiptId": "<random 128-bit, lowercase hex>",
  "operator": "onym:key:<operator>",
  "scope": "<echoed scope>",
  "acknowledgedAt": "2026-08-19T10:00:05Z",
  "completionCommittedBy": "2026-08-26T10:00:05Z",
  "coveredScope": "<from the pinned terms>",
  "excludedScope": "<from the pinned terms; non-empty>",
  "termsId": "sha256:…",
  "signature": "<base64 Ed25519 over canonical bytes>"
}
```

`completionCommittedBy` is `acknowledgedAt` plus the pinned terms' completion
deadline. Terms that declare no completion deadline are a malformed document,
not a licence to choose a period and sign it: a defaulted deadline is a
commitment the holder never accepted, signed by the operator, and afterwards
indistinguishable from one they did. `coveredScope` and `excludedScope` are copied from the pinned terms of
the erased snapshot — not from current terms, and not composed at request time.

**`excludedScope` must be non-empty**, and a receipt with an empty one is
malformed rather than generous. There is always something excluded: at minimum,
copies held by the other participants in every conversation the snapshot
contained, and copies the holder exported. An operator that cannot name what its
erasure does not reach has not understood what it is signing.

A receipt is a signed commitment measured against pinned terms. It is not proof
of destruction, and a client must not render it as one
([UI-Backup.md](UI-Backup.md) §10.3).

## 12. Portable export container

A `tar` archive, no compression:

```text
manifest.json
snapshots/<digest-hex>.seal
receipts/<receiptId>.json
terms/<termsId-hex>.json
terms/<termsId-hex>.json.sig
```

`manifest.json`:

```json
{
  "exportVersion": 1,
  "exportedAt": "2026-08-19T10:00:00Z",
  "operator": "onym:key:<operator>",
  "snapshots": [
    {"snapshotReference": { … }, "acceptedTermsId": "sha256:…",
     "termsUrl": "https://…/terms/<termsId>.json", "retainedAt": "…",
     "file": "snapshots/<digest-hex>.seal"}
  ],
  "receipts": ["receipts/<receiptId>.json"],
  "terms": [
    {"termsId": "sha256:…", "file": "terms/<termsId-hex>.json",
     "signature": "terms/<termsId-hex>.json.sig"}
  ]
}
```

**The terms bytes travel with the container, not just their digest.** One entry
per distinct `acceptedTermsId` referenced by any exported snapshot, with the
operator's detached signature beside it.

The `.seal` files are the sealed bytes verbatim — byte-identical to what was
uploaded, digest unchanged. Migration to another conforming operator is therefore
an upload of the same bytes under the same reference, with **no re-sealing and no
cooperation from the operator being left**, which is
[UI-Backup.md](UI-Backup.md) §18.3.

This closes what would otherwise be a hole in the one scenario the export path
exists for. §4.1 obliges an operator to serve every historical terms document
forever — but only for as long as the operator exists, and §16.3 concedes that a
shut-down operator serves nothing. A container carrying `termsUrl` and a digest
would leave a holder, after shutdown, with sealed bytes they can verify and a
`termsId` whose preimage is gone: no way to check what retention, what
jurisdiction, or what erasure scope the snapshot was actually accepted under.
Pinning would survive as an unresolvable reference, which is not pinning. Since
the whole point of `shutdownNotice` is that export outlives the operator, the
export has to carry everything the pin needs.

Beyond that, the container carries no operator-specific field, no locator, and no
credential. `termsUrl` remains as a convenience for as long as it resolves; the
bytes beside it are what make the pin checkable afterwards.

## 13. Limits

An operator declares, in its manifest: `maximumSealedSnapshotBytes`,
`maximumRetainedSnapshots`, concurrent uploads per holder, request rate, and
upload expiry. This profile pins only the shapes:

| Limit | Requirement |
|---|---|
| JSON request body | at most 256 KiB; exceeded is `413` |
| Chunk body | exactly the granted `chunkBytes`, or the remainder for the last |
| Upload lifetime | declared; expiry discards the partial upload |
| Redirects | a client follows none, on any operation |
| Response size | a client bounds **every** response body |
| Sealed streams | `/v1/snapshots/{digest}` and `/v1/exports/{digest}` are bounded by the declared `maximumSealedSnapshotBytes`, not by a fixed cap |
| List and manifest bodies | `/v1/snapshots` and `/v1/exports` are bounded by `maximumRetainedSnapshots` × a per-entry ceiling, with a hard client maximum above which the response is discarded as `operator_unavailable` |

The three rows are separate because the paths are four categorically different
things, and one prefix would have exempted all of them. Exempting the two byte
streams from a fixed cap is right — `maximumSealedSnapshotBytes` is signed policy
the holder verified at enrolment, and a profile-level number would only get in
the way. Exempting the two JSON bodies is not: their only soft bound is
`maximumRetainedSnapshots`, an operator-supplied figure with no per-response
signature behind it, so an operator declaring ten thousand and returning a
billion fabricated entries would meet a client with no cap at all.

A client treats every locator, retention date, receipt field, and diagnostic as
untrusted input ([UI-Backup.md](UI-Backup.md) §7.12) — which is precisely why the
size of the envelope carrying them cannot be left to the sender.

## 14. Error mapping

```json
{"error": "<code>", "message": "<safe, bounded diagnostic>", "...": "<per-code fields>"}
```

`error` and `message` are always present. Some codes carry additional
**top-level** fields, and their names are pinned here rather than left to each
operator — §9.2's re-consent flow depends on a client reliably reading
`currentTermsId` out of a refusal, and three conforming operators putting it in
three different places (top level, nested under `details`, interpolated into
`message`) would leave clients unable to parse a response the protocol requires
them to act on.

| Code | Additional top-level fields |
|---|---|
| `terms_changed` | `currentTermsId` |
| `payment_required` | `paymentRequired` (§10.1) |
| `snapshot_too_large` | `maximumSealedSnapshotBytes` |
| `quota_exceeded` | `retainedSnapshots`, `maximumRetainedSnapshots`, `retainedBytes`, `limitBytes`, `openGrants`, `openGrantBytes` |
| `upload_incomplete` | `missingChunks`, `chunkCount` |
| `invalid_entitlement` | `entitlementIssuers` |

`openGrants` and `openGrantBytes` are on `quota_exceeded` because §9.2 step 6
counts issued grants against the limit — and against *both* limits, so both need
a term. Without them a client sees `retainedSnapshots` below
`maximumRetainedSnapshots`, or `retainedBytes` below `limitBytes`, with a `409`
beside it and nothing in the body naming what consumed the headroom. The refusal
must be legible from the refusal: the operator compares
`retainedSnapshots + openGrants` and `retainedBytes + openGrantBytes` against
their limits, and reports every term it compared.

`missingChunks` is an array of **inclusive `[first, last]` index ranges**, not
an array of indices. A 5 GiB snapshot at 8 MiB chunks is 640 indices, and a
client that has sent nothing would otherwise receive all of them — so an
operator would be tempted to truncate, and a truncated gap list cannot be acted
on in one round trip. Ranges are compact for the common case (one interrupted
run) and complete in every case, so no truncation rule is needed:

```json
{"error": "upload_incomplete", "message": "…",
 "missingChunks": [[4, 4], [11, 27]], "chunkCount": 640}
```

Ranges are **ascending, non-overlapping, and non-adjacent**: `[[4, 4], [5, 9]]`
is not conforming and must be written `[[4, 9]]`. Without that the "acted on in
one round trip" argument does not hold — a client would have to sort and merge
before it could tell whether the list it received was complete or a partial view
of the same gap described twice.

Every other code carries `error` and `message` only. A client ignores unknown
top-level fields rather than refusing the response.

| Code | HTTP | Abstract error | Meaning |
|---|---|---|---|
| `unsupported_profile` | 400 | `unsupported_profile` | The client asked for a profile this operator does not implement |
| `invalid_reference` | 400 | `invalid_reference` | Reference syntax, algorithm, or byte count is malformed |
| `terms_changed` | 409 | `terms_changed` | `acceptedTermsId` is not current |
| `signature_invalid` | 401 | — | Proof of possession failed, stale, or replayed |
| `payment_required` | 402 | `payment_required` | No valid entitlement (§10) |
| `invalid_entitlement` | 401 | `invalid_entitlement` | Entitlement malformed, wrong audience/subject, expired, or revoked |
| `snapshot_too_large` | 413 | `snapshot_too_large` | Exceeds the declared maximum |
| `quota_exceeded` | 409 | `quota_exceeded` | Retained count or bytes limit reached |
| `chunk_mismatch` | 409 | — | A chunk index was re-sent with different bytes |
| `upload_incomplete` | 409 | — | Commit arrived before every index did; the grant survives and `missingChunks` names the gap |
| `upload_expired` | 409 | — | The grant's `expiresAt` has passed; the upload accepts nothing further |
| `digest_mismatch` | 409 | `incomplete_snapshot` | Commit recomputation disagreed with the reference |
| `snapshot_not_found` | 404 | — | No such snapshot for this holder |
| `upload_not_found` | 404 | — | No such `uploadId` for this holder, or it was never issued |
| `receipt_not_found` | 404 | — | No such `receiptId` for this holder, or it aged past `erasureReceipts` |
| `retention_expired` | 410 | `retention_expired` | Retained once; no longer held |
| `export_withheld` | 403 | `export_withheld` | **Non-conforming.** A client records it as an operator violation |
| `operator_unavailable` | 503 | `unreachable` | Try later; nothing was decided |

`export_withheld` exists in the table so a client can name what happened, not
because an operator may return it. A client that receives it must preserve its
local evidence and must not soften the wording it shows.

**`terms_regression` is not in the table, because the operator cannot compute
it.** A regression is a comparison against the terms
*this holder's retained snapshots pinned* — state the operator may not even have,
since after a §12 migration the snapshots were accepted by someone else
entirely. The operator's honest response to changed terms is `terms_changed`,
which is in the table; the client then fetches the new document and runs
`regresses(against:)` over its own pinned set. An operator returning
`terms_regression` is reporting a conclusion it is not positioned to draw.

**`erasure_unconfirmed` is not in the table, because it is not an operator
response.** Erase returns `200` with a signed receipt (§9.6), and that receipt is
*always* an acknowledgment rather than proof of destruction — there is no second,
worse kind of acknowledgment for the operator to signal. `erasure_unconfirmed` is
a **client-side state**, derived from the receipt by comparing
`completionCommittedBy` against the clock: until that deadline passes the client
shows "acknowledged, not proven destroyed", and it never shows "erased". An
operator that misses its own committed deadline has violated the terms it signed,
which the client detects from the receipt it already holds rather than from a
status code the operator would have to volunteer against its own interest.

A timeout or transport failure is `unknown`, reconciled through §9.8. It is never
`retained` and never `erased`.

## 15. Logging and retained metadata

Two different things are governed here, and conflating them is how a
`metadataRetention` declaration ends up understating what an operator holds.

**Logs** are diagnostic and are discarded. A conforming operator logs route,
status, byte count, and duration. It does **not** log the holder key, the holder
handle, a snapshot digest, an upload id, an operation id, or a client address,
and it does not aggregate any of these per holder over time. There is no
access-log table; that absence is a design commitment, and an operator adding one
has changed what it is.

**Records** are the state the profile's own operations require, and they must be
declared rather than wished away:

| Record | Declared as | Why it must exist | Bound |
|---|---|---|---|
| Holder handle | `holderIdentifiers` | the only identity this seat has | while any snapshot or receipt is held |
| `sealedByteSize`, `retainedAt`, `acceptedTermsId`, `supersedes` per snapshot | `sizeAndTiming` | `listSnapshots`, quota, lapse, and terms pinning | while the snapshot is retained |
| Outcome per `operationId` | `operationOutcomes` | §9.8 exists so a lost response is reconciled rather than relabelled | a declared window past the operation, then discarded |
| Issued erasure receipts | `erasureReceipts` | §12 exports them, and a holder may need to re-present one | a declared window, disclosed as outliving the erased snapshot |
| Live entitlement records | `entitlementRecords` | §10.4 | to `expiresAt` plus one revocation-epoch interval |
| Upload grant per `uploadId`: holder, digest, `expiresAt`, indices received | `uploadGrants` | §9.2 step 4 resumes it, step 6 counts it against the quota, and §9.3 refuses chunks after `expiresAt` | to `expiresAt`, then discarded with the partial bytes |

Those are the field names of `metadataRetention` in
[UI-Backup.md](UI-Backup.md) §5.4, which this profile extends from two fields to
seven so the declaration can actually say what an operator holds.

`uploadGrants` is the newest of them, and it is here because §9.2 promoted grant
state from transient to required: a grant that can be resumed and that consumes
quota is a record the operator holds *about a holder*, whatever its lifetime,
and §15's rule is that such records are declared rather than wished away. Its
bound is the tightest in the table — an expired grant is discarded along with
its partial bytes, so the operator does not retain a list of digests a holder
started uploading and abandoned. An operator that kept expired grants to
distinguish "expired" from "never issued" would be keeping exactly that list;
it must answer `upload_not_found` instead once the record is gone.

`accessLogs` is the one field with no row in the table above, and under this
profile its only conforming value is `none` — which is why it is worth keeping
rather than dropping: a signed, content-addressed
`none` is a checkable claim that the table of §8.3 does not exist, where silence
would be indistinguishable from an operator that simply never mentioned it.

The outcome record is the awkward one, and it is worth naming rather than
hiding: keeping an operation id long enough to answer §9.8 is precisely the
per-holder timing trace §15 otherwise forbids. The resolution is a **bound, not
an exception** — the window is declared in `metadataRetention`, it is measured in
hours rather than months, and nothing is retained past it. An operator that finds
this uncomfortable is reading it correctly; the alternative is a client that
converts silence into `retained`, which is worse.

An operator's `metadataRetention` declaration must cover every row of that table.
Declaring less than it holds is the exact failure this field exists to prevent.

## 16. Corrections to the abstract boundary

Three claims in [UI-Backup.md](UI-Backup.md) cannot be implemented as written.
All three are wording problems rather than design problems, and this PR amends
the abstract document alongside publishing this profile.

### 16.1 §14.1 — "group secrets never enter operator requests"

A snapshot that restores a person's conversations necessarily *contains* group
secrets and per-blob content keys; that is what makes it a restore rather than a
transcript. The invariant is sound as an opacity rule and unsatisfiable as a
containment rule. It should read: such material never appears **in the clear, in
metadata, in a locator, in a receipt, or in a log**. Under this profile that is
mechanically true — everything sensitive is inside the AEAD, and the operator
sees a handle, a digest, a byte count, and a date.

### 16.2 §5.8 and §14.4 — the access key "separate from the identity signing key"

§5.8 said a backup credential "can be rotated or abandoned without touching the
identity", §7.10 required a client to "offer its rotation", and §14.4 stated
rotation as a property of the seat. This profile derives the access key from the
same BIP39 seed as the identity keys, through a distinct HKDF context and per
`componentId`. Half of the claim is met: it is a different key, it is unlinkable
to the identity keys, and abandoning it touches nothing else.

Rotation is the half that is not. §5.5 above makes it destructive in the absence
of a re-binding proof, so all three sections are amended to state rotation as a
profile decision with a disclosed cost rather than a property of the seat.

The spirit is not fully met, and the profile should say so rather than claim it
is. Because the root is shared, **"lost access key" and "lost identity" are one
event**. The alternative — an independently generated access key the person must
store separately from their recovery phrase — is more faithful to §11's intent and
substantially worse in practice: it doubles the number of secrets a person must
survive, and the second one exists only for backup, so it is the one they will
lose. This profile takes the shared root deliberately. A future profile may take
the other side of that trade; it should not pretend the trade does not exist.

### 16.3 §14.15 — "export survives operator shutdown"

It cannot. A shut-down operator serves nothing, and no wire protocol changes that.
The honest invariant is that export is never withheld for non-payment, and that
shutdown carries a declared notice window during which export works. Operators
under this profile declare `shutdownNotice` in their terms, and a client shows it
on the consent surface alongside retention and grace.

## 17. Known gaps

1. **No incremental upload.** [UI-Backup.md](UI-Backup.md) §17 names a scheme
   that is verifiable against a whole-snapshot reference without leaking a change
   map as unsolved design work, and this profile does not solve it. Every snapshot
   is a full upload. On a large history that is a real cost — in bytes, in time,
   and in battery — and a client must tell the person so rather than discovering
   it for them.
2. **No re-bind after rotation** (§5.5). Rotation is therefore either destructive
   or absent, and both options are worse than a re-bind operation that this
   profile is not yet confident enough to specify. A re-bind proven by a signature
   from *both* the old and the new key is the obvious shape; what is not obvious
   is what it does to the "no operator-controlled reset path" argument of §8.3,
   which is exactly why it is deferred rather than guessed.
3. **`sealedByteSize` remains observable.** Padding coarsens it; nothing here
   hides it. An operator that retains a long series of a holder's snapshot sizes
   learns the shape of a history's growth. §15 forbids retaining the series, and
   nothing but the operator's conduct enforces that.
4. **The disclosure pattern of §10.4 is still unsolved.** This profile requires
   the third-party consequence to be stated plainly and first (§18.7); it does not
   claim that is a *good* pattern, only an honest one. [UI-Backup.md](UI-Backup.md)
   §17 lists finding a pattern that is honest without being unusable as open work,
   and it remains open.
5. **The fixtures of §18 are not written.** An operator implements the routes
   and tests them against itself; that is not the same as two independently
   built sides agreeing, which is what §19 asks for and what only a shared
   fixture suite can show. Until then conformance is a claim rather than a
   result.

## 18. Conformance tests

A conforming implementation ships fixtures for each of these. They are the
executable content of [UI-Backup.md](UI-Backup.md) §18.

1. **Seal round trip.** Seal, digest, upload, download, verify, open, compare.
2. **Tamper.** Flip one bit in any chunk; the AEAD fails and no plaintext is
   produced. Truncate; the commit fails before any state is written.
3. **Non-convergence.** Seal identical plaintext twice; the digests differ.
4. **Padding.** Two archives of substantially different length round to the same
   `sealedByteSize`, and overhead never exceeds 12%.
5. **Reference discipline.** An upload whose caller-supplied reference disagrees
   with the bytes is refused by the *client* before it reaches the network.
6. **Terms.** Pinning survives a terms change; `terms_changed` stops uploads; and
   a weakened terms document is refused on each axis independently — longer
   retention, narrowed erasure scope, added jurisdiction, added sub-processor,
   removed export path.
7. **Consent surface.** The rendered enrolment text contains the retention
   period, the jurisdictions, and the sentence stating that the snapshot extends
   this history's life for every participant in it. Asserted by fixture, not by
   review.
8. **Restore refusal.** A partial or unverified snapshot leaves local state
   untouched.
9. **Eligibility.** Compose over a source seeded with a known mnemonic; assert the
   seed, every one of its words, the identity key material, and any per-invite
   private keys are absent from the *plaintext* archive.
10. **Proof of possession.** An upload signature cannot be replayed as an erase
    signature, into another chunk index, or after the freshness window.
11. **Entitlement and canonical bytes.** Forged issuer, mutated field, expired
    window, wrong `audience`, wrong `subject`, and revoked id are each refused.
    Canonical-byte fixtures are **byte-identical** across the broker, the
    operator, and the client, and include at least one document whose keys
    distinguish UTF-8 byte order from case-insensitive and **UTF-16 code-unit**
    order — an uppercase-initial key, and a key above U+FFFF to catch a
    UTF-16-sorting runtime. The real documents cannot
    distinguish them (§6.3), which is exactly why the fixture must.
12. **Payment loop.** `402` at preflight, entitlement obtained, retry with the
    same operation id and the same bytes, `retained`.
13. **Export while unpaid.** A holder with zero entitlements exports successfully.
14. **No reset path.** The operator's route table equals §9's, and no code path
    reassigns a snapshot's holder.
15. **Receipts.** An erasure receipt with an empty `excludedScope` is rejected as
    malformed.
16. **Metadata declaration.** Every record class in §15's table appears in the
    operator's declared `metadataRetention`, asserted against the running
    operator's own storage rather than against its prose.
17. **Unknown.** A lost response is reconciled through `queryOutcome` and never
    rendered as `retained` or `erased`.
18. **Migration.** Export from one operator, upload to a second, restore — with no
    re-sealing and no digest change.

19. **Grant resume.** Preflight, receive a grant, discard the response, send
    some chunks, preflight the same reference again: the same `uploadId` comes
    back with the original `expiresAt` and a `missingChunks` list naming exactly
    what has not arrived. Re-preflighting with a different `sealedByteSize` is
    `invalid_reference`; with a different `supersedes`, the grant's own value
    survives to the committed snapshot.
20. **A gap survives its commit.** Send every chunk but one, commit, and assert
    `upload_incomplete` naming the gap as ascending non-adjacent ranges — then
    send the missing chunk on the same grant and commit successfully. The bytes
    already sent are never re-transmitted.
21. **Erasure is idempotent.** Erase a scope twice: both calls return `200` with
    the same `receiptId` and the same signature. Erase with a fresh
    `operationId` and reconcile *that* id through §9.8. After the
    `erasureReceipts` window, the third call is `retention_expired` rather than
    `404`.
22. **Receipts outlive their response.** Fetch an issued receipt by id from
    §9.7's route; assert another holder gets `receipt_not_found` for the same
    id; assert every path named by the export manifest — snapshots, receipts and
    terms — resolves, including the terms of a snapshot that has been erased.
23. **Re-upload after erasure.** Erase a snapshot, upload the same sealed bytes
    under the same reference, and download them. `retained` must mean readable:
    an operator whose erased row silently swallows the re-upload reports success
    and stores nothing. This is §12's migration path pointed at the operator it
    started from.
24. **Declared records match held records.** For each row of §15's table,
    including `uploadGrants`, assert the operator holds nothing the declaration
    does not name and nothing past the bound it declares — an issued grant
    disappears at `expiresAt` along with its partial bytes.

## 19. Acceptance criteria

This profile is complete when a client and an operator built independently from
this document alone can perform §18.18 — export from one, import to the other,
restore on a third device holding only a recovery phrase — with byte-identical
references throughout, and when every fixture in §18 passes on both.

## References

- [UI-Backup.md](UI-Backup.md) — the abstract boundary this profile implements
- [../WHITEPAPER.md](../WHITEPAPER.md) §16.1, §17 — channel offers, the billing
  broker, and the `SeatEntitlement` credential
- [../interface/Interface.md](../interface/Interface.md) §8, §13 — the eligible
  set and the error vocabulary
- [../blob/UI-Blob.md](../blob/UI-Blob.md) — live attachment storage, which this
  seat archives references to but never replaces
- [../recovery/Recovery-Trustee.md](../recovery/Recovery-Trustee.md) — where the
  access key may be protected, and what that discloses
