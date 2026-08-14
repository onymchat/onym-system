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
- **gaps** — §11 is the single source of truth for implementation
  status; no other section makes status claims.

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

`version` is exactly `1` in every document of this profile; any other
value — including a higher major — is `provider_manifest_invalid` /
`snapshot_invalid` for the document carrying it, per the abstract §16
unknown-major rule.

The implementation profile identifier is:

```text
onym:discovery-implementation:static-ed25519-v1
```

Out of scope for v1, stated here so their absence reads as a decision and
not an oversight: server-side query, pagination, and transparency-log
profiles (an oversized snapshot is split into multiple declared catalogs);
**private or authenticated catalogs** (the abstract §10 permits them —
this profile serves public catalogs only; a v1 client **skips** any
catalog whose `audience` is not exactly `"public"` — skipped, not
`provider_manifest_invalid`, so future audience values do not brick v1
clients, and no soft private-catalog path exists — and the client must
surface the skipped-catalog count on the source, so a manifest whose
catalogs are all skipped reads as an empty-by-policy source, never a
silently empty one); and **operator
key rotation** (§6 — re-adding the source is the only path).

The field name is `implementationProfileId`, matching the sibling seat
profiles' convention. (An earlier draft used `implementationProfile`;
it was renamed while no deployed provider had signed any bytes; the
migration cost fell on the already-written client packages, which
adopted the rename and regenerated fixtures — see §11.)

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
2. remove the `signature` field **structurally and at the top level
   only** — a nested `signature` key anywhere deeper is ordinary signed
   content, canonicalized like any other key (never string surgery:
   planted signature copies elsewhere in the document make textual
   removal forgeable, which is also why removal must not recurse);
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
- strings are valid UTF-8, and escaping is pinned, not delegated to a
  serializer (the same divergence class §3 rejects for key sorting):
  escape exactly `"` , `\\`, and control characters U+0000–U+001F —
  using the two-character forms `\"` `\\` `\b` `\f` `\n` `\r` `\t`
  where defined and `\u00xx` with **lowercase** hex otherwise — and
  escape nothing else: no `/`, no non-ASCII, no U+007F. (This is Rust
  `serde_json`'s exact behavior; any other serializer must prove
  agreement via the §10 item-1 escaping vector.)

The **signature** is Ed25519 over the canonical bytes, embedded in the
document's `signature` field as base64 (unpadded or padded both accepted on
read; writers emit standard padded base64). A detached sibling file
`<name>.json.sig` MAY be published for tooling that verifies before
parsing; its content is exactly the embedded signature's standard padded
base64 followed by one newline — never raw bytes. Agreement between the
embedded and detached forms is defined **after base64 decoding**: both
must decode to the same 64 signature bytes, regardless of padding
differences on the embedded side. A client that fetches the detached
form MUST fail closed on disagreement — `provider_manifest_invalid` /
`snapshot_invalid` for that document — a stale or attacker-served
`.sig` is never ignorable.

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
  "implementationProfileId": "onym:discovery-implementation:static-ed25519-v1",
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

`privacyProfile` + `privacyProfileUri` and every descriptor's
`policyUri` are **required**: the abstract contract obliges a provider
to declare and follow a privacy profile (§10, §14.1) and to publish the
exact pinned policy (§14.1) — a public catalog has no reason to omit
either, and without `policyUri` the `policy_unavailable` error is
unreachable and rank could never be shown as policy-backed.

Field requirements and strictness, normatively (levels not shown for
`CatalogEntry` follow §4.2's entry-lossy rule):

| Document / level | Required | Optional | Unknown keys |
|---|---|---|---|
| Provider manifest (top) | version, implementationProfileId, providerId, operator, seat, catalogs, capabilities, offers, privacyProfile, privacyProfileUri, validUntil, signature | — | document invalid |
| `catalogs[]` descriptor | catalogId, snapshot, audience, seatTypes, policy, policyUri | — | descriptor skipped (surfaced in the source's skipped-catalog count); a manifest where zero descriptors even **decode** is `provider_manifest_invalid` — audience-based skips (§1) do NOT count toward invalidity: a manifest of decodable but all-non-public catalogs is a valid, empty-by-policy source |
| Snapshot (top) | version, implementationProfileId, catalogId, providerId, sequence, policyDigest, generatedAt, expiresAt, entries, signature; previousDigest **required when sequence > 1, forbidden at 1** | — | document invalid |
| `CatalogEntry` + its nested `manifest{}` | componentId, seatType, manifest{uri,digest}, operator, listedAt, relationship, placement | profiles, evidence, reviewedAt, status | entry skipped (lossy) |

`catalogId` matches `[a-z0-9-]{1,64}`; a duplicate among the decoded
descriptors is `provider_manifest_invalid` (pinned, like duplicate
`componentId`, for cross-client determinism).
Every `snapshot`, `policyUri`, and `privacyProfileUri` obeys the URI rules
of §7. `seatTypes` members are either seat-type tokens matching
`[a-z0-9.-]{1,64}` or the literal `"*"` wildcard the abstract §5.1
defines (policy accepts every seat type; not a claim the snapshot
contains one of each); `"*"` must appear alone if present. A member
matching neither form **skips the descriptor** (aligned with the
unknown-key rule — one lossiness model per level), surfaced in the
skipped-catalog count.

### 4.2 Catalog snapshot

```json
{
  "version": 1,
  "implementationProfileId": "onym:discovery-implementation:static-ed25519-v1",
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
  of the same `catalogId`. This is a **publisher** rule — a provider MUST
  NOT publish a gap or a repeat; what a *verifier* does on observing a
  repeat (no-op refresh vs fork) or a gap (continuity walk, then
  accept-with-note) is defined solely by §6;
- `previousDigest` is the SHA-256 of the previous snapshot's exact
  published bytes; it is absent (field omitted) only when `sequence` is 1;
- a correction is a new sequence; published snapshot bytes are immutable;
- `policyDigest` must equal the `policy` digest the provider manifest
  declares for this `catalogId` — **or the immediately previous
  declaration** the client retained for it before the last manifest
  refresh, accepted with a surfaced policy-transition note. Two static
  files cannot be swapped atomically, so publishers MUST update the
  manifest first and the snapshot next, and the one-generation grace is
  what keeps conforming clients from rejecting the catalog inside that
  window. Any other digest is `snapshot_invalid`;
- `expiresAt` must be strictly after `generatedAt`; a snapshot born
  expired is `snapshot_invalid`;
- `generatedAt` must not lie in the verifier's future beyond a 10-minute
  clock-skew allowance; a future-dated snapshot is `snapshot_invalid`
  (otherwise the 90-day ceiling could be minted forward);
- `expiresAt` − `generatedAt` must not exceed 90 days — a hard ceiling,
  not a default. Providers SHOULD publish much shorter windows (days to a
  few weeks): expiry is the abstract contract's primary defense (§13)
  against a removed or compromised instance remaining recommended, and a
  quarter-long window defeats it. Expiry is evaluated with the same 10-minute clock-skew allowance as
  `generatedAt` (a fast clock must not reject a fresh snapshot).
  Expired snapshots are `snapshot_expired` and a client must not treat
  their entries as current recommendations.

Entry rules:

- `entries` is ordered; the order is the provider's declared policy rank;
- duplicate `componentId` values are `snapshot_invalid`, detected over
  the **decoded-and-surviving** entries after lossy skipping (pinned so
  byte-identical fixtures verify identically on every client: a
  duplicate hidden inside a skipped-malformed entry does not invalidate
  the snapshot);
- `manifest.digest` binds the destination manifest bytes the provider
  reviewed; a fetched manifest that hashes differently is
  `entry_manifest_mismatch` — the entry is rejected, never "refreshed" by
  trusting newer bytes the provider did not review;
- `operator` repeats the destination operator key for indexing; the fetched
  manifest remains authoritative (`Discovery.md` §5.3);
- `status`, when present, is `{"state": "warning" | "review", "uri":
  "<https-informational-uri>"}` (`uri` optional) — **defined in v1**,
  optional for writers, and rendered distinctly by clients when present
  (abstract §9's disclosed-warning-or-review requirement). It is defined
  now rather than deferred because entry-lossy decoding would make a
  later addition silently drop the very entries carrying warnings. An
  undecodable `status` skips the entry like any other malformed field;
- `evidence` must be absent or the empty array in v1: its member shape
  (issuer, subject, scope, artifact, result, expiry, status — the
  abstract §13 audit-laundering fields) is deferred to v2, and an
  unrenderable attestation is exactly what that row forbids presenting.
  A non-empty `evidence` skips the entry;
- within one provider, entries for the same `componentId` across its
  catalogs must carry the same `manifest.digest`; a mismatch is
  provider-level equivocation, surfaced as a source integrity warning
  — the cheapest equivocation must not be the one nobody checks;
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
- A provider **MUST** retain every superseded snapshot that has not yet
  expired as a sibling file named `<catalogId>-<sequence>.json` (e.g.
  `public-all-seats-41.json` beside `public-all-seats.json` — a flat
  scheme, because `<name>.json` and a `<name>/` directory cannot coexist
  on filesystem-backed static hosts). This retention window is what makes
  forward jumps auditable: without it, an equivocator could publish
  divergent branches that always skip a sequence and never face a
  continuity check. Retention beyond expiry is optional.
- No cookies, no authentication, no per-user URLs for public catalogs
  (abstract §10 baseline). `Cache-Control` is operator's choice; clients
  bound staleness by `expiresAt`, not by HTTP caching.
- Mirroring is explicitly permitted: signatures and digests make bytes
  location-independent. A mirror is not a new provider; the operator key
  is the identity.

## 6. Client verification procedure

On adding a provider (by URL entry, QR, file, or deep link):

1. fetch the manifest within the size bounds of §7;
2. parse and check `version`, `implementationProfileId`, `seat`,
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

On each refresh cycle, **first re-fetch the provider manifest** from its
stable URL: unchanged bytes are a no-op; changed bytes are verified
against the pinned operator key (§6 add-time rules — a different key is
`provider_manifest_invalid`, never a silent rotation), require
`providerId`, `seat`, and `implementationProfileId` to match the pinned
source (a mismatch is `provider_manifest_invalid` — the URL now serves a
different provider), and, when valid, replace the working manifest (catalogs added/removed/re-pointed, policy
digests updated). Retained per-catalog sequence state is keyed by
`(providerId, catalogId)` and is **never deleted when a catalogId
disappears** from the manifest: if the catalog later returns, chain
comparison resumes against the retained digest and sequence, so a
returning catalog at a lower sequence is a rollback, not a fresh
catalog. A pinned manifest whose `validUntil` has passed puts
the **source into an expired state**: existing data may be shown only as
clearly stale history, no new snapshot is accepted, and the state is
surfaced on the source — this is what makes §9's expired-`validUntil`
trigger reachable after add time.

Then, per catalog:

1. fetch the snapshot from the current manifest's `snapshot` URL within
   bounds;
2. verify the signature against the pinned operator key;
3. check `catalogId`/`providerId` match, `version`, profile, expiry;
4. compare `sequence` and `previousDigest` against the last retained
   acceptance, distinguishing four cases:
   - **no-op refresh** — `sequence` equal to the retained one and bytes
     hashing to the retained digest: the provider simply hasn't
     published since; keep the retained acceptance, no warning;
   - **rollback** — `sequence` strictly lower than the retained one:
     `snapshot_invalid`, surfaced as a source integrity warning;
   - **fork** — the same `sequence` with different bytes, or
     `sequence` retained + 1 whose `previousDigest` does not match the
     retained snapshot's digest: `snapshot_invalid`, evidence of
     equivocation, never silently resolved toward either side;
   - **forward jump** — `sequence` more than retained + 1 (the client
     missed intermediate publications): the client MUST first attempt to
     fetch the intermediate files (§5 requires their retention within
     the expiry window), each URL derived normatively by replacing the
     final path segment of the manifest's `snapshot` URL with
     `<catalogId>-<sequence>.json` — the derived URL must itself pass
     the §7 rules, walking at most the §7 length bound (a larger gap
     degrades to accept-with-note). Three outcomes: the chain verifies
     through the intermediates (full acceptance); intermediates are
     unavailable (accept-with-note, below); or intermediates fetch but
     the chain **provably breaks** — that is equivocation,
     `snapshot_invalid`, the strongest signal here, never a note.
     Intermediates are **chain-continuity evidence only**:
     signature, chain, and schema are checked but `expiresAt` is NOT
     evaluated (a superseded snapshot is expected to age out) — and verify chain
     continuity through them, in which case the jump verifies fully.
     Only when intermediates are unavailable does the client **accept
     with a source-integrity note.** The note asserts a provider
     retention failure only when the missing intermediate lies within
     the §5 retention window (its sequence's snapshot would not yet
     have expired); a gap older than the window is stated as
     unverifiable-by-construction, with no blame — §5 never required
     those files to exist. A client that skips publications still must not permanently
     reject an honest catalog;
5. decode entries lossily; retain at least the digest of the accepted
   snapshot for future chain comparison.

Before presenting or selecting an instance:

1. fetch the destination manifest from `manifest.uri` within bounds;
2. verify its bytes against `manifest.digest`
   (`entry_manifest_mismatch` on failure);
3. compare the entry's indexing fields against the fetched manifest:
   a conflict on `seatType`, `operator`, or any `profiles` member is
   also `entry_manifest_mismatch` — the catalog must not advertise
   capabilities the operator's signed manifest does not declare
   (exactly the extrapolation the notary operator-manifest rules
   forbid);
4. verify the destination operator's signature under its seat's rules;
5. apply the destination seat's own compatibility and consent flow.

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
| Fetch timeout | ≤ 60 s per request |
| Continuity-walk length | ≤ 64 intermediates per refresh; a larger gap degrades to accept-with-note (never rejection) |

URI rules for every URI in these documents (`snapshot`, `manifest.uri`,
`policyUri`, `privacyProfileUri`, evidence URIs):

- scheme `https` only; no `http`, no custom schemes;
- host is a DNS name — IP literals (v4 or v6) are invalid, which closes
  the obvious SSRF-to-local-network path; clients additionally refuse to
  follow redirects to IP literals or non-HTTPS targets;
- no userinfo, no query, no fragment;
- no explicit port of any kind, including a redundant `:443`: writers
  must omit it, and a verifier MUST reject a URI whose **raw string**
  contains a port component. The raw-string requirement exists because
  URL libraries commonly normalize `:443` away before a parsed-port
  check is reachable; a verifier relying only on the parsed port does
  not conform. One outcome per URI, on every client.

These mirror and tighten the checks in `onym-relayer`'s
`scripts/validate-*.py`, today's de facto catalog validators.

## 8. Freshness and retention on the client

- The client retains, per source, at least: pinned operator key; per
  catalog the last accepted snapshot digest + sequence, **its decoded
  entry set** (required to distinguish "previously listed, now absent"
  — abstract §9), and **the previous `policy` digest declared before
  the last manifest refresh** (required by the §4.2 policy-transition
  grace); and the timestamps of acceptance.
- A removed source's pins are deleted only on explicit user removal, and
  a removed default source is never silently restored (abstract §8).
- Entries from an expired snapshot may be shown only as stale history,
  clearly distinct from current recommendations.

## 9. Error mapping

The abstract error table (`Discovery.md` §12) applies unchanged. Profile-
specific sources:

| Abstract error | This profile's trigger |
|---|---|
| `provider_manifest_invalid` | Signature/key-pin failure, detached-`.sig` disagreement, unknown top-level field, bad version/profile/seat, refresh identity mismatch, zero decodable catalog descriptors (audience skips excluded), expired `validUntil`, oversize, URI violation |
| `snapshot_invalid` | Signature or detached-`.sig` failure, rollback, fork/`previousDigest` mismatch or `previousDigest` missing at sequence > 1 / present at sequence 1, more than 512 entries, `policyDigest` ≠ manifest's declared policy, future-dated or born-expired `generatedAt`/`expiresAt`, duplicate `componentId`, unknown top-level field, oversize (unverifiable forward jumps are accepted-with-note; a proven discontinuity through fetched intermediates is `snapshot_invalid`, §6) |
| `snapshot_expired` | `expiresAt` more than 10 minutes in the past (the §4.2 skew allowance — one outcome per client) |
| `policy_unavailable` | `policyUri` unreachable or bytes ≠ the **manifest's current** `policy` digest. During the §4.2 grace window a snapshot legitimately cites the previous digest; the policy fetch is evaluated only against the current manifest pair, and the transition note stands in until the next snapshot aligns |
| `entry_manifest_unavailable` | Destination fetch failure/timeout/oversize |
| `entry_manifest_mismatch` | Fetched bytes ≠ `manifest.digest`, or an entry-vs-manifest field conflict on `seatType`/`operator`/`profiles` (§6) |
| `entry_manifest_invalid` | Destination seat signature/schema/expiry failure |
| `result_incomplete` | One or more entries were skipped by lossy decode or the fail-closed relationship rule — the client must surface the skip count and never present the shrunken set as the whole catalog |
| `profile_incompatible` | An entry's `profiles` contains nothing the client implements — hidden only under an explicit compatibility filter, never silently |
| `query_unsupported` | Always, for server-side filters — this profile has none; filter locally |
| `rate_limited` | HTTP 429 from static host; honor `Retry-After` |
| `source_conflict` | Two configured sources bind the same `componentId` to different manifest digests — both claims preserved, per the abstract §12. Clients MAY grade severity (routine review lag when only one digest matches the currently served bytes, versus both manifests fetchable with conflicting signed contents) but must not suppress the error |

## 10. Conformance fixtures

The reference implementation publishes, and every client consumes
byte-identically (the moderation seat's fixture-pinning pattern):

1. canonical-bytes vectors: document → canonical bytes → signature, for
   the provider manifest and a snapshot, including a key-order-scrambled
   input that must canonicalize identically **and a case-divergence
   vector whose keys differ only by letter case at a discriminating
   position** — necessarily a *synthetic, non-conforming document*
   (every schema key in this profile is camelCase with no case-only
   pairs), because it exercises the serializer layer in isolation: the
   vector a case-insensitive sort fails on (§3), guarding the layer
   before schema validation ever runs — plus an **escaping vector**
   containing every §3 escape class (two-char forms, `\u00xx` control
   characters, `/`, non-ASCII, U+007F), likewise synthetic;
2. a valid three-snapshot chain (sequences 1–3);
3. tamper set, each expected to fail with a named error: bad signature;
   resigned-by-different-key manifest; sequence rollback; forked
   `previousDigest` (also how a skipped link fails when the claimed
   predecessor's bytes are supplied — a forward jump *without* them is
   the acceptance fixture, item 8, not a tamper case);
   expired snapshot; duplicate `componentId`;
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

10. a policy-transition pair: manifest updated to a new policy digest,
    snapshot still citing the previous one — accepted with the
    transition note; any third digest fails;
11. a no-op refresh: identical latest snapshot re-fetched — no warning;
12. same-provider cross-catalog digest equivocation — surfaced;
13. an audience-skip manifest (single non-public catalog) — valid,
    empty-by-policy, skip count surfaced; and
14. detached-`.sig` disagreement — fails closed.

Two fixtures the abstract §16 lists are discharged as **not applicable**
rather than omitted: pagination and unsupported server-side filters —
this profile has no server-side query surface at all (`query_unsupported`
is unconditional, §9).

Item 9 is likewise discharged rather than published as bytes: it is a
**client network-behavior obligation**, not an offline byte fixture —
there are no reference bytes to pin, so the obligation is met by tests
and traces in each consuming client (§11), not by a vector in the
reference set.

## 11. Gaps

What exists as of this revision (reference CLI and both client
packages on open review branches), grouped for line-by-line audit:

**Fixtures (§10, in the `onym-discovery` reference CLI):**

- items 1 (all three canonical sub-vectors: scrambled-order,
  case-divergence, escaping), 2, 5, 6, 7, 10, 12, 13, and 14 as
  published byte-pinned fixtures;
- items 3–4 as in-repo tests;
- items 8 and 11 (forward-jump acceptance, no-op refresh) as tests
  over the chain fixtures;
- item 9 (the privacy fetch trace) is discharged as a client
  network-behavior obligation, not an offline byte fixture.

**Shared by all three implementations:**

- the §6 four-case chain comparison against retained per-catalog
  state (no-op refresh without warning, rollback and forks rejected,
  forward jumps accepted with a surfaced source-integrity note, any
  sequence accepted on first acceptance of a source);
- the §4.2 one-generation policy-transition grace via a retained
  previous policy digest, surfaced as a note;
- future-dated `generatedAt` rejection and the strictly-after
  born-expired rule;
- audience-based skipping of non-public catalogs (counted, never
  invalid — zero *decodable* descriptors is the invalidity bar) and
  `seatTypes` member validation;
- the entry `status` field decoded (`warning`/`review`, optional URI)
  and surfaced — a valid status never skips its entry — with both
  clients rendering it as a distinct chip;
- non-empty `evidence` skipping the entry;
- the closed relationship set failing closed;
- optional `profiles`/`evidence`;
- the §7 raw-string port check (a redundant `:443` is rejected before
  URL-library normalization) plus integer- and hex-form IPv4 literal
  rejection;
- oversize destination manifests mapped to
  `entry_manifest_unavailable`;
- skip counts surfaced — both clients now attach per-source refresh
  notes (skipped catalogs and entries / `result_incomplete`, audience
  skips, forward-jump and policy-transition notes) to their UI models.

**Client-specific (and reference-only):**

- the iOS canonicalizer no longer delegates to Foundation's
  `.sortedKeys` — it serializes with UTF-8-byte-order key sorting and
  the §3 pinned escaping, proven against the case-divergence and
  escaping vectors;
- both clients enforce the §7 redirect bounds (≤ 3, HTTPS-to-HTTPS,
  IP-literal targets refused) and the 60 s timeout;
- the reference implementation rejects §3 duplicate keys at any
  depth, has a detached-`.sig` verify path that fails closed, ships
  cross-catalog equivocation and `source_conflict` detection helpers
  with fixtures, and its builder publishes the §5 retention siblings
  (`<catalogId>-<sequence>.json`);
- the relayer's operator manifest is in review (the deployed relayer
  does not serve it yet).

Remaining gaps:

- the Onym provider deployment (`discovery.onym.app`) is not live: no
  operator keys, no signed catalog, no hosted courier/blossom manifests
  (templates and runbook exist in the reference repo);
- the inclusion/ranking policy and privacy-profile documents this
  profile's `policyDigest`/`privacyProfile` fields must pin are unwritten;
- the §6 intermediate-fetch continuity walk is implemented nowhere:
  every implementation degrades a forward jump directly to
  accept-with-note without first attempting the retained-sibling
  fetches §6 requires (the note §6 reserves for *unavailable*
  intermediates), so a provably-broken chain hidden behind a jump is
  currently indistinguishable from a retention failure — and the §7
  walk-length bound is consequently unexercised;
- the §3 duplicate-key rejection is enforced by the reference
  implementation but remains unenforced in both client decoders (last
  key wins), and clients do not fetch the detached `.sig` at all, so
  the §3 agreement check has a verify path only in the reference CLI;
- the §10 item 9 privacy trace is asserted by construction in client
  tests (fake fetchers, no query surface) but no client test records
  an actual network trace proving the no-cookies/no-identifier
  obligation;
- cross-catalog equivocation and `source_conflict` detection exist as
  reference-implementation helpers and fixtures, but neither client
  yet runs those comparisons over its aggregate (graded
  source-conflict severity is likewise unimplemented); the
  entry-vs-manifest field conflict checks exist partially in both
  clients' consent flows (`operator` and `seatType`, not `profiles`)
  and are not surfaced as `entry_manifest_mismatch`;
- the §6 expired-`validUntil` source state (existing data shown only
  as clearly stale history, surfaced on the source) is approximated on
  both clients as a refresh failure plus retained-snapshot expiry
  filtering, not as the distinct source-level state §6 describes;
- the Android instrumented-test branch (`discovery-uitests`,
  onym-android#208) is now in open review alongside the other client
  branches; a pre-existing androidTest compile break on `main` in
  three legacy identity/nostr test files (internal-visibility,
  unrelated to discovery) blocks *running* the full instrumented
  suite, not pushing it — the discovery suite itself assembles
  (`assembleDebugAndroidTest`), and execution additionally requires a
  device;
- several §9 codes remain declared but unreachable in the clients
  (`policy_unavailable` among them — policy documents are never
  fetched because none are published);
- no snapshot field carries the abstract §9 removal reason codes
  (`manifest_expired`, `policy_mismatch`, …); since top-level decoding
  is strict, adding one is a profile version bump, deferred to v2; and
- migration off the unsigned legacy catalogs (`relayers.json`,
  `nostr-relays.json`, `blossom-servers.json`, `authorities.json`),
  which remain the operational path until then.

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
