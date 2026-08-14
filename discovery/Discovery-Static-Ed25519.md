---
status: draft
proposed: Claude & @rinat-enikeev
date: 13.08.2026
---

# Onym Discovery: Static Snapshot / Ed25519 Implementation Profile

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Discovery boundary onto signed
> static JSON files served over HTTPS: an Ed25519-signed provider manifest
> and append-only, expiring catalog snapshots that a client downloads whole
> and filters locally.

This document is a concrete implementation of
[Discovery.md](Discovery.md), which remains authoritative for roles,
authority, privacy, economics, and error semantics. The abstract contract
recommends exactly this shape for a first profile: "signed static snapshots
over account-based remote search, because that makes verification, caching,
mirroring, comparison, and local private filtering straightforward" (§16).

The document distinguishes:

- **profile requirements**, which are required for a complete conforming
  implementation; and
- **gaps** — as of this draft the entire profile is unimplemented: no
  publisher tooling, no deployed catalog, and no client support exist. The
  planned reference implementation is the `onym-discovery` CLI.

## 1. Conformance declaration

| Abstract concept | This profile's mapping |
|---|---|
| Provider identity | `onym:key:<64-lowercase-hex Ed25519 public key>` |
| Provider manifest | Static `manifest.json`, self-signed, served byte-for-byte |
| Catalog snapshot | Static JSON file per catalog, signed by the same operator key |
| Snapshot chain | `sequence` strictly increasing by 1; `previousDigest` over prior published bytes |
| Query | None server-side; client downloads the full snapshot and filters locally |
| Signature suite | Ed25519 over canonical bytes (§3) |
| Digest | `sha256:<64-lowercase-hex>` over exact published bytes |
| Transport | HTTPS static file hosting; no accounts, cookies, or query endpoints |
| Capabilities | `signed-snapshot-v1`, `local-filtering-v1` |

The implementation profile identifier is:

```text
onym:discovery-implementation:static-ed25519-v1
```

Out of scope for v1, stated here so their absence reads as a decision and
not an oversight: server-side query, pagination, and transparency-log
profiles (an oversized snapshot is split into multiple declared catalogs);
**private or authenticated catalogs** (the abstract §10 permits them —
this profile serves public catalogs only, and `audience` is informational
free text with `"public"` the only value given meaning); and **operator
key rotation** (§6 — re-adding the source is the only path).

A naming note: the field is `implementationProfile`, where sibling seat
profiles write `implementationProfileId`. The divergence is acknowledged
and kept for v1 — the conformance fixtures and three client
implementations pin these exact bytes — and a rename rides the next
profile version, which changes signatures anyway.

## 2. Identifiers

- **Operator key**: `onym:key:<hex>` where `<hex>` is the 64-character
  lowercase hex encoding of a 32-byte Ed25519 public key. The same syntax
  used across Onym seats.
- **Provider ID**: `onym:component:<id>` where `<id>` is a stable,
  operator-chosen token matching `[a-z0-9-]{1,64}`. The provider ID names
  the service; the operator key holds its authority.
- **Digest**: the string `sha256:` followed by 64 lowercase hex characters,
  always computed over the **exact published bytes** of the referenced
  document, never over its canonical form. Byte-for-byte serving is what
  makes digests stable.
- **Timestamps**: RFC 3339 / ISO-8601 UTC with `Z` suffix, second
  precision (`2026-08-13T12:00:00Z`).

## 3. Canonical encoding and signing

Signing bytes are produced exactly as in the moderation seat's reference
implementation (`onym-moderation` `authority/src/canonical.rs` /
`apple/src/canonical.rs`), which is the system's precedent for
cross-language byte agreement:

1. decode the document as UTF-8 JSON; the top level must be an object;
2. remove the `signature` field **structurally** (never by string surgery
   — planted signature copies elsewhere in the document make textual
   removal forgeable);
3. re-serialize compactly (no insignificant whitespace) with all object
   keys, at every nesting level, sorted by UTF-8 byte order; the `/`
   character is not escaped.

The sort is **UTF-8 byte order**, stated normatively rather than by
reference to any library: Rust `serde_json`'s `BTreeMap` ordering conforms;
Foundation's `.sortedKeys` does **not** in general, because it sorts
case-insensitively — and this profile's keys are camelCase, so two keys
differing only by case at a discriminating position would diverge. A Swift
implementation must therefore either sort explicitly by UTF-8 bytes or
prove, via the mandatory case-divergence fixture (§10 item 1), that its
serializer agrees on every document shape this profile can produce.

Constraints that keep canonicalization trivial:

- all numbers are non-negative integers within 2^53 − 1; no floats, no
  exponents, no leading zeros;
- no duplicate keys; a document with duplicate keys is invalid;
- strings are valid UTF-8; escaping follows the serializer's minimal form.

The **signature** is Ed25519 over the canonical bytes, embedded in the
document's `signature` field as base64 (unpadded or padded both accepted on
read; writers emit standard padded base64). A detached sibling file
`<name>.json.sig` MAY be published for tooling that verifies before
parsing; its content is exactly the embedded signature's standard padded
base64 followed by one newline — never raw bytes — and when both exist
they must agree.

Both the provider manifest and every catalog snapshot are signed by the
**same operator key** named in the provider manifest's `operator` field.

## 4. Document shapes

The abstract objects of `Discovery.md` §5 are used with these
profile-pinned refinements. Unknown top-level fields are rejected
(`provider_manifest_invalid` / `snapshot_invalid`); unknown fields inside a
`CatalogEntry` cause only that entry to be skipped (lossy entry decoding).

### 4.1 Provider manifest

```json
{
  "version": 1,
  "implementationProfile": "onym:discovery-implementation:static-ed25519-v1",
  "providerId": "onym:component:onym-discovery",
  "operator": "onym:key:<hex>",
  "seat": "discovery",
  "catalogs": [
    {
      "catalogId": "public-all-seats",
      "snapshot": "https://discovery.onym.app/catalogs/public-all-seats.json",
      "audience": "public",
      "seatTypes": ["transport.message", "notary", "moderation"],
      "policy": "sha256:<policy-document-digest>",
      "policyUri": "https://discovery.onym.app/policies/public-all-seats.md"
    }
  ],
  "capabilities": ["signed-snapshot-v1", "local-filtering-v1"],
  "privacyProfile": "sha256:<privacy-profile-digest>",
  "privacyProfileUri": "https://discovery.onym.app/privacy.md",
  "offers": [],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<base64-ed25519>"
}
```

`catalogId` matches `[a-z0-9-]{1,64}` and is unique within the manifest.
Every `snapshot`, `policyUri`, and `privacyProfileUri` obeys the URI rules
of §7.

### 4.2 Catalog snapshot

```json
{
  "version": 1,
  "implementationProfile": "onym:discovery-implementation:static-ed25519-v1",
  "catalogId": "public-all-seats",
  "providerId": "onym:component:onym-discovery",
  "sequence": 42,
  "previousDigest": "sha256:<bytes-of-snapshot-41>",
  "policyDigest": "sha256:<policy-document-digest>",
  "generatedAt": "2026-08-13T12:00:00Z",
  "expiresAt": "2026-09-13T12:00:00Z",
  "entries": [
    {
      "componentId": "onym:component:onym-relayer",
      "seatType": "notary",
      "manifest": {
        "uri": "https://relayer.onym.app/manifest.json",
        "digest": "sha256:<manifest-bytes>"
      },
      "operator": "onym:key:<hex>",
      "profiles": ["onym:notary-implementation:stellar-soroban-sep-plonk-v1"],
      "evidence": [],
      "listedAt": "2026-08-13T00:00:00Z",
      "reviewedAt": "2026-08-13T00:00:00Z",
      "relationship": "common-owner",
      "placement": "policy-ranked"
    }
  ],
  "signature": "<base64-ed25519>"
}
```

Chain rules:

- `sequence` starts at 1 and increases by exactly 1 per published snapshot
  of the same `catalogId`; gaps and repeats are `snapshot_invalid`;
- `previousDigest` is the SHA-256 of the previous snapshot's exact
  published bytes; it is absent (field omitted) only when `sequence` is 1;
- a correction is a new sequence; published snapshot bytes are immutable;
- `policyDigest` must equal the `policy` digest the provider manifest
  declares for this `catalogId`; a snapshot citing a policy the manifest
  never declared is `snapshot_invalid`;
- `expiresAt` − `generatedAt` must not exceed 90 days — a hard ceiling,
  not a default. Providers SHOULD publish much shorter windows (days to a
  few weeks): expiry is the abstract contract's primary defense (§13)
  against a removed or compromised instance remaining recommended, and a
  quarter-long window defeats it. Expired snapshots are
  `snapshot_expired` and a client must not treat their entries as
  current recommendations.

Entry rules:

- `entries` is ordered; the order is the provider's declared policy rank;
- duplicate `componentId` values within one snapshot are `snapshot_invalid`;
- `manifest.digest` binds the destination manifest bytes the provider
  reviewed; a fetched manifest that hashes differently is
  `entry_manifest_mismatch` — the entry is rejected, never "refreshed" by
  trusting newer bytes the provider did not review;
- `operator` repeats the destination operator key for indexing; the fetched
  manifest remains authoritative (`Discovery.md` §5.3);
- the accepted `relationship` values for this profile version are pinned
  inline: `none`, `catalog-subscriber`, `listing-fee`,
  `sponsored-placement`, `common-owner`, `catalog-sponsor`,
  `other-disclosed`. The abstract contract calls this set extensible
  (§5.3); this profile deliberately **fails closed** against it — an
  entry with an unknown `relationship`, or an undecodable `placement`, is
  skipped rather than defaulted, because a commercial disclosure the
  client cannot render is a disclosure the user never saw. Admitting a
  new relationship value is a profile version bump, not a soft addition.

### 4.3 Destination seat manifests

`manifest.uri` points at the instance's own signed `ServiceManifest`,
served byte-for-byte under its destination seat's contract:

- **moderation** — the authority manifest (`onym-moderation`), already
  served at `GET /manifest.json` with a detached `.sig`;
- **notary** — the notary operator manifest specified in
  [`../notary/UI-Notary-BNB.md`](../notary/UI-Notary-BNB.md) §8.1;
- **transport.message** — the courier manifest of
  [`../message/UI-Message.md`](../message/UI-Message.md) §5.3 (a courier
  whose endpoint is a WebSocket relay hosts its HTTPS manifest elsewhere,
  e.g. on the provider's static host, signed by the courier's own operator
  key);
- **blob storage** and other seats — their seat contracts' manifests as
  they gain signed forms.

Discovery verification stops at the digest and the destination operator's
signature; whether the manifest satisfies the *destination seat's* rules is
that seat's contract, applied by the client after discovery.

## 5. Serving

- All files are served over HTTPS as static content, byte-for-byte; any
  re-serialization breaks digests and signatures and is a conforming
  client's reason to reject.
- The provider manifest lives at a stable HTTPS URL chosen by the operator
  (recommended: `https://<host>/manifest.json`). Snapshot URLs come only
  from the verified provider manifest, and each catalog's `snapshot` URL
  always serves the latest snapshot.
- A provider SHOULD additionally retain recent superseded snapshots at
  `<snapshot-url minus .json>/<sequence>.json` so auditors and gapped
  clients can walk the chain; this is optional in v1, which is why a
  forward jump past unretained history is accepted-with-note rather than
  rejected (§6).
- No cookies, no authentication, no per-user URLs for public catalogs
  (abstract §10 baseline). `Cache-Control` is operator's choice; clients
  bound staleness by `expiresAt`, not by HTTP caching.
- Mirroring is explicitly permitted: signatures and digests make bytes
  location-independent. A mirror is not a new provider; the operator key
  is the identity.

## 6. Client verification procedure

On adding a provider (by URL entry, QR, file, or deep link):

1. fetch the manifest within the size bounds of §7;
2. parse and check `version`, `implementationProfile`, `seat`,
   `providerId`, and `validUntil`;
3. verify the embedded signature against the manifest's own `operator`
   key;
4. display the operator key fingerprint for user confirmation and **pin
   the key** (trust-on-first-use; a later manifest signed by a different
   key is `provider_manifest_invalid`, never a silent rotation).
   **Key rotation is out of scope for v1 of this profile**: there is no
   rotation-statement document, and the only path to a new key is the
   user removing the source and re-adding it — a fresh, explicit TOFU
   decision. A future profile version may define an old-key-signed
   rotation statement; until it does, nothing may be interpreted as one.

On each refresh, per catalog:

1. fetch the snapshot from the pinned manifest's `snapshot` URL within
   bounds;
2. verify the signature against the pinned operator key;
3. check `catalogId`/`providerId` match, `version`, profile, expiry;
4. compare `sequence` and `previousDigest` against the last retained
   acceptance, distinguishing three cases:
   - **rollback** — `sequence` lower than or equal to the retained one:
     `snapshot_invalid`, surfaced as a source integrity warning;
   - **fork** — `sequence` is retained + 1 but `previousDigest` does not
     match the retained snapshot's digest, or the same sequence appears
     with different bytes: `snapshot_invalid`, evidence of equivocation,
     never silently resolved toward either side;
   - **forward jump** — `sequence` is more than retained + 1 (the client
     missed intermediate publications and cannot check continuity):
     **accept**, with a source-integrity note that continuity was
     unverified across the gap. Only the latest snapshot is required to
     be served (§5), so a client that skips publications must not
     permanently reject an honest catalog;
5. decode entries lossily; retain at least the digest of the accepted
   snapshot for future chain comparison.

Before presenting or selecting an instance:

1. fetch the destination manifest from `manifest.uri` within bounds;
2. verify its bytes against `manifest.digest`
   (`entry_manifest_mismatch` on failure);
3. verify the destination operator's signature under its seat's rules;
4. apply the destination seat's own compatibility and consent flow.

Direct import of a destination manifest (no provider) follows only the
last block, with the digest supplied by the user's source or skipped in
favor of the operator-signature check — the abstract contract's §8
obligation that absence from every catalog never blocks use.

## 7. Bounds and URI rules

| Bound | Value |
|---|---|
| Provider manifest size | ≤ 64 KiB |
| Catalog snapshot size | ≤ 1 MiB |
| Entries per snapshot | ≤ 512 |
| Destination manifest size | ≤ 256 KiB |
| Policy / privacy document size | ≤ 1 MiB |
| Redirects per fetch | ≤ 3, HTTPS-to-HTTPS only |
| Fetch timeout | client-declared, ≤ 60 s |

URI rules for every URI in these documents (`snapshot`, `manifest.uri`,
`policyUri`, `privacyProfileUri`, evidence URIs):

- scheme `https` only; no `http`, no custom schemes;
- host is a DNS name — IP literals (v4 or v6) are invalid, which closes
  the obvious SSRF-to-local-network path; clients additionally refuse to
  follow redirects to IP literals or non-HTTPS targets;
- no userinfo, no query, no fragment;
- no explicit port: writers must omit it. A verifier MUST reject any URI
  carrying a non-default explicit port, and MAY treat a redundant
  explicit `:443` as equivalent to omission (URL libraries commonly
  normalize the default port away before the check is reachable).

These mirror and tighten the checks in `onym-relayer`'s
`scripts/validate-*.py`, today's de facto catalog validators.

## 8. Freshness and retention on the client

- The client retains, per source, at least: pinned operator key, last
  accepted snapshot digest + sequence per catalog, and the timestamps of
  acceptance — enough to detect rollback and equivocation across
  refreshes and to satisfy abstract §9's state distinctions.
- A removed source's pins are deleted only on explicit user removal, and
  a removed default source is never silently restored (abstract §8).
- Entries from an expired snapshot may be shown only as stale history,
  clearly distinct from current recommendations.

## 9. Error mapping

The abstract error table (`Discovery.md` §12) applies unchanged. Profile-
specific sources:

| Abstract error | This profile's trigger |
|---|---|
| `provider_manifest_invalid` | Signature/key-pin failure, unknown top-level field, bad version/profile/seat, expired `validUntil`, oversize, URI violation |
| `snapshot_invalid` | Signature failure, rollback, fork/`previousDigest` mismatch, `policyDigest` ≠ manifest's declared policy, duplicate `componentId`, unknown top-level field, oversize (forward jumps are accepted-with-note, §6) |
| `snapshot_expired` | `expiresAt` in the past |
| `policy_unavailable` | `policyUri` unreachable or bytes ≠ `policyDigest` |
| `entry_manifest_unavailable` | Destination fetch failure/timeout/oversize |
| `entry_manifest_mismatch` | Fetched bytes ≠ `manifest.digest` |
| `entry_manifest_invalid` | Destination seat signature/schema/expiry failure |
| `query_unsupported` | Always, for server-side filters — this profile has none; filter locally |
| `rate_limited` | HTTP 429 from static host; honor `Retry-After` |
| `source_conflict` | Two configured sources bind the same `componentId` to different manifest digests |

## 10. Conformance fixtures

The reference implementation publishes, and every client consumes
byte-identically (the moderation seat's fixture-pinning pattern):

1. canonical-bytes vectors: document → canonical bytes → signature, for
   the provider manifest and a snapshot, including a key-order-scrambled
   input that must canonicalize identically **and a case-divergence
   vector whose keys differ only by letter case at a discriminating
   position** (the vector a case-insensitive sort fails on — §3);
2. a valid three-snapshot chain (sequences 1–3);
3. tamper set, each expected to fail with a named error: bad signature;
   resigned-by-different-key manifest; sequence rollback; sequence gap;
   forked `previousDigest`; expired snapshot; duplicate `componentId`;
   oversize snapshot; entry with digest-mismatched destination manifest;
   URI-rule violations (http, IP literal, query string); planted-signature
   canonicalization attack per §3;
4. a lossy-decoding snapshot: one malformed entry among valid ones —
   valid entries survive, the malformed one is skipped;
5. a direct-import destination manifest with no catalog context;
6. a sponsored-placement entry whose `relationship`/`placement`
   disclosure must survive into the client's rendered attribution;
7. a `source_conflict` pair: two providers binding the same
   `componentId` to different manifest digests, both claims preserved;
8. a forward-jump acceptance: latest snapshot at sequence N versus a
   retained acceptance at N−2, accepted with the integrity note; and
9. privacy-profile behavior: a fetch trace showing snapshot download +
   local filtering issues no per-query requests and carries no cookies
   or identifiers.

## 11. Gaps

Everything is unbuilt; this list is the work plan:

- the `onym-discovery` reference CLI (keygen, sign, snapshot build,
  chain/fixture verification, static-dir output);
- the Onym provider deployment (`discovery.onym.app`) and its first
  catalog (moderation, notary, transport entries);
- signed seat manifests for the notary operator and courier (the
  authority already serves one);
- client support (iOS `OnymDiscovery` package): fetching, TOFU key
  pinning, chain verification, source management, direct import;
- the inclusion/ranking policy and privacy-profile documents this
  profile's `policyDigest`/`privacyProfile` fields must pin;
- migration off the unsigned legacy catalogs (`relayers.json`,
  `nostr-relays.json`, `blossom-servers.json`, `authorities.json`),
  which remain the operational path until then;
- fixture items 1 (case-divergence vector), 6–9 of §10 do not exist yet
  in the reference implementation; and
- current client implementations treat every non-successor sequence as
  invalid — the §6 forward-jump acceptance (and its fixture) is
  specified here but not yet implemented anywhere.

## 12. Acceptance criteria

This profile satisfies `Discovery.md` when:

1. a second, independently keyed provider can publish a conforming
   manifest + snapshot chain that the same client code verifies;
2. rollback, equivocation, and re-keying are detected and surfaced, in
   fixtures and in the client;
3. a destination manifest that drifts from its reviewed digest is
   rejected with `entry_manifest_mismatch`, not refreshed;
4. direct import works with zero configured providers;
5. removing a source removes it durably;
6. all fixtures pass byte-identically in the reference implementation
   and every consuming client; and
7. no step of public catalog use requires an account, cookie, or stable
   client identifier.

## 13. References

1. Abstract contract: [Discovery.md](Discovery.md)
2. Canonicalization precedent: `onym-moderation`
   `authority/src/canonical.rs` (and its byte-identical `apple/` twin)
3. Notary operator manifest: [../notary/UI-Notary-BNB.md](../notary/UI-Notary-BNB.md) §8.1
4. Courier manifest: [../message/UI-Message.md](../message/UI-Message.md) §5.3
5. Legacy catalog validators: `onym-relayer/scripts/validate-*.py`
6. RFC 8032 (Ed25519), RFC 3339 (timestamps)
