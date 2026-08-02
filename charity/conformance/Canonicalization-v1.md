---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 02.08.2026
---

# Onym Charity JSON Canonicalization v1

This profile makes the illustrative JSON boundary objects in
[`Charity.md`](../Charity.md) byte-exact and testable.

The media type for a canonical boundary object is
`application/onym-charity+json;profile=v1`. Schema resources use
`application/schema+json`. A transport may compress bytes after authorization,
but signatures, digests, and size limits always apply to the uncompressed
canonical representation.

## Canonical representation

1. Input must validate against the selected definition in
   [`charity-v1.schema.json`](../schemas/charity-v1.schema.json) and every
   stricter implementation-profile schema before canonicalization.
2. JSON is canonicalized according to RFC 8785 (JCS) and encoded as UTF-8.
3. Duplicate object keys, lone Unicode surrogates, non-finite numbers, and
   values rejected by I-JSON are invalid before canonicalization.
4. Monetary amounts and rates are decimal strings. Implementations do not
   canonicalize them through binary floating-point values.
5. The abstract v1 schemas reject unknown properties. A later extension must
   publish a new schema/profile digest; an unknown field never silently changes
   authorization, value, trust, or privacy semantics.

## Digests and authorization payloads

The digest of canonical object `O` of schema definition `T` is:

```text
SHA-256(UTF8("onym:charity:object:v1\0" + T + "\0") || JCS(O))
```

It is rendered as lowercase `sha256:` followed by 64 hexadecimal characters.

For an object containing a top-level `signature` or `authorization`, the
signing payload omits that one proof field, canonicalizes the remaining
object, and uses the following digest:

```text
SHA-256(UTF8("onym:charity:authorization:v1\0" + T + "\0") || JCS(unsigned-O))
```

The selected signature suite signs that 32-byte digest and defines key
resolution and encoding. The final object digest includes the proof field,
which prevents a receipt from treating two different authorizations as the
same authorized object. Nested evidence is never implicitly omitted.

The baseline signature suite is `onym:charity-signature:ed25519-v1`:

- keys are Ed25519 keys whose profile-defined key descriptor exposes the raw
  32-byte public key;
- the exact 32-byte authorization digest above is signed directly, without an
  additional prehash or text encoding; and
- signatures are encoded as `ed25519:` plus 128 lowercase hexadecimal
  characters.

Profiles may add suites, but the suite identifier and key-resolution rule are
authorization-critical and must be pinned. The fixed-seed signing and
verification case in `fixtures/signature-vector.ed25519.json` is test material
only; its private key must never be used outside conformance tests.

## Baseline size limits

Limits apply before signature verification or rendering:

| Object | Maximum canonical bytes |
|---|---:|
| profile, deployment, trust policy, credential | 65,536 |
| campaign, quote, intent, donation receipt | 65,536 |
| eligibility presentation | 1,048,576 |
| aid claim or disbursement receipt | 1,048,576 |
| aggregate fund-flow report | 262,144 |

A concrete profile may set smaller limits. Referenced descriptions, reports,
and media larger than these limits cross the Blob boundary; they are never
embedded to evade an object limit.

## Profile refinement

`OpaqueValue` marks fields whose exact shape belongs to a financial, proof,
notary, delivery, or other selected profile. A concrete deployment cannot use
the permissive abstract definition directly. It publishes a schema that
replaces every reachable `OpaqueValue`, pins that schema's digest, and supplies
positive and negative fixtures.

The vectors in [`fixtures/manifest.json`](fixtures/manifest.json) fix canonical
bytes and digests for the baseline. Run `npm ci && npm test` in this directory.
