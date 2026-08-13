---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Discovery Contract Boundary

**Architecture draft 0.1 — August 2026**

> Discovery helps a user find compatible instances of every seat. It may
> curate and recommend, but it cannot approve participation, rewrite a
> provider's manifest, or prevent direct use.

This document defines the technology-neutral boundary for the **Discovery
seat**: independently operated catalogs through which users and groups find
concrete service, application, and institutional instances for any Onym seat.

A seat is a protocol role. An **instance** is one concrete operator,
deployment, application, institution, or offer for that role, described by a
signed manifest under [whitepaper §16](../WHITEPAPER.md). Discovery indexes
references to those manifests. It does not turn the catalog into a root of
trust.

This contract does not require a search engine, DNS system, transport, storage
layer, ranking algorithm, payment rail, jurisdiction, or business model. A
concrete implementation profile must define canonical encodings, transport,
pagination, signatures, and test vectors.

This is proposed architecture. No current Onym repository implements this
contract or a conforming Discovery profile.

## 1. Decision

Onym separates finding an instance from trusting or selecting it.

- Any operator may publish a signed manifest for an instance of a defined
  seat.
- Any Discovery provider may publish a signed catalog of manifest references
  under a visible inclusion and ranking policy.
- A client may use one Discovery provider, combine several, use a pinned local
  catalog, or import a provider manifest directly.
- Catalog inclusion is a recommendation by the named Discovery provider. It
  is not protocol approval, certification, or proof that the instance is safe
  or currently available.
- The client verifies the selected instance's own manifest, compatibility,
  expiry, operator signature, and applicable evidence before use.
- The user or group selects the downstream instance. A Discovery provider
  cannot select it merely by returning or ranking it.
- A Discovery provider may earn only under a disclosed catalog, curation, or
  placement offer chosen by the paying party. Payment never creates protocol
  authority over listed or unlisted instances.

Discovery is a seat because catalog policy, availability, conflicts, privacy,
and commercial incentives belong to an accountable operator that users can
replace. It is not a singleton system service.

## 2. Roles and authority

- The **instance operator** controls one concrete seat instance and signs its
  service or institutional manifest.
- The **Discovery provider** selects manifest references under its published
  policy, signs catalog snapshots, answers queries, and discloses ranking and
  commercial relationships.
- The **catalog sponsor**, when present, funds a catalog intended for a
  community, enterprise, jurisdiction, accessibility need, or other declared
  audience. Funding does not silently change the provider's policy.
- The **auditor or attestation issuer** signs scoped evidence about an exact
  instance or artifact under the [audit contract](../audit/Audit.md).
  Discovery may cite that evidence but cannot speak for its issuer.
- The **client** verifies catalogs and manifests, applies local compatibility
  checks, preserves direct import, and presents the source and basis of
  recommendations.
- The **user or group** chooses which Discovery sources to consult and which
  downstream instance, if any, to select.

One party may hold several roles, but the signed objects keep their authorities
separate. A Discovery provider that also operates, audits, sponsors, or earns
from a listed instance discloses that relationship on the affected entry.

## 3. Coverage: every seat

Discovery is cross-cutting. A catalog can contain instances for every
versioned `seatType`, including:

| Seat family | Example discoverable instance |
|---|---|
| Interface | a web, desktop, or mobile client publisher |
| Message carriage | a relay or sealed-message delivery service |
| Media storage | a sealed-blob storage provider |
| Group verification | a notary deployment and its compatible profile |
| Naming and credentials | an association registry or credential issuer |
| Banking and payments | a provider and its custody/payment class |
| Audit and attestation | an auditor and offered methodology classes |
| Arbitration | an arbiter or dispute-resolution institution |
| Charitable coordination | an application or campaign coordinator |
| Distribution | a lead-generation provider and its offer |
| Acquisition | a landing or store-evidence provider |
| Recruitment | a recruitment provider or public opening source |
| Recovery trustee | a trustee provider and custody profile |
| Sponsorship | a foundation or commons-funding program |
| Discovery | another Discovery provider or catalog |

This table is illustrative, not a closed registry. A new seat becomes
discoverable by publishing a versioned seat contract and signed manifests; it
does not need a change to the Discovery authority model.

Some instances have network endpoints. Others are institutions, applications,
or offers reached through a contact or order interface. Discovery indexes the
manifest defined by the destination seat and does not require every seat to
pretend to be a network daemon.

## 4. Logical topology

```text
instance operator                         audit / measurement issuer
      | signs manifest                              | signs evidence
      v                                             v
+--------------------+                    +--------------------+
| Instance manifest  |<-------------------| scoped attestation |
+----------+---------+      citation      +--------------------+
           |
           | digest + retrieval location
           v
+-----------------------------+       signed policy + snapshot
| Discovery provider          |--------------------------------+
| catalog · query · ranking   |                                |
+--------------+--------------+                                v
               |                                      +----------------+
               +------------------------------------->| Client         |
                                                      | verify · merge |
direct manifest import ------------------------------>| filter · show  |
                                                      +-------+--------+
                                                              |
                                                              | explicit choice
                                                              v
                                                      selected instance
```

No arrow from Discovery grants operating authority to an instance. No missing
arrow prevents a client from importing a conforming manifest directly.

## 5. Boundary objects

The JSON below is explanatory. An implementation profile defines canonical
encoding, identifier syntax, signature suite, and transport.

### 5.1 Discovery provider manifest

A provider first publishes a signed `DiscoveryProviderManifest`:

```json
{
  "version": 1,
  "providerId": "onym:component:<discovery-provider-id>",
  "operator": "onym:key:<operator-id>",
  "seat": "discovery",
  "catalogs": [
    {
      "catalogId": "public-all-seats",
      "snapshot": "https://discover.example/catalog.json",
      "audience": "public",
      "seatTypes": ["*"],
      "policy": "sha256:<inclusion-and-ranking-policy>"
    }
  ],
  "capabilities": ["signed-snapshot-v1", "local-filtering-v1"],
  "privacyProfile": "sha256:<privacy-profile>",
  "offers": [],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The manifest states exactly which catalogs and protocol profiles the provider
operates. `seatTypes: ["*"]` means the policy accepts every defined seat type;
it is not a claim that the current snapshot contains an instance for each one.

### 5.2 Catalog snapshot

A `CatalogSnapshot` is an immutable, signed view of one catalog:

```json
{
  "version": 1,
  "catalogId": "public-all-seats",
  "providerId": "onym:component:<discovery-provider-id>",
  "sequence": 42,
  "previousDigest": "sha256:<snapshot-41>",
  "policyDigest": "sha256:<inclusion-and-ranking-policy>",
  "generatedAt": "2026-08-01T12:00:00Z",
  "expiresAt": "2026-08-02T12:00:00Z",
  "entries": ["<CatalogEntry>", "<CatalogEntry>"],
  "signature": "<discovery-provider-signature>"
}
```

The monotonically increasing sequence and previous digest make removal,
replacement, and equivocation observable to clients that retain or compare
snapshots. They do not create global consensus: two Discovery providers may
publish different catalogs, and one provider may intentionally publish
different named catalogs for different declared audiences.

### 5.3 Catalog entry

A catalog entry points to an operator-signed manifest without rewriting it:

```json
{
  "componentId": "onym:component:<instance-id>",
  "seatType": "transport.message",
  "manifest": {
    "uri": "https://relay.example/.well-known/onym-manifest.json",
    "digest": "sha256:<manifest-bytes>"
  },
  "profiles": ["onym-message-nostr-v1"],
  "evidence": [
    {
      "type": "audit-attestation",
      "uri": "https://auditor.example/attestations/123",
      "digest": "sha256:<attestation-bytes>"
    }
  ],
  "listedAt": "2026-07-20T09:00:00Z",
  "reviewedAt": "2026-07-31T09:00:00Z",
  "relationship": "none",
  "placement": "policy-ranked"
}
```

The entry may repeat bounded, non-authoritative fields such as `seatType` and
profiles for indexing. The fetched manifest remains authoritative. A mismatch
between the entry and the signed manifest is an error, not permission for the
catalog to override the operator.

`relationship` and `placement` disclose why the entry appears where it does.
Profiles define an extensible set including `none`, `catalog-subscriber`,
`listing-fee`, `sponsored-placement`, `common-owner`, `catalog-sponsor`, and
`other-disclosed`.

### 5.4 Query and result

The portable query is deliberately small:

```json
{
  "version": 1,
  "catalogId": "public-all-seats",
  "seatTypes": ["transport.message"],
  "requiredProfiles": ["onym-message-nostr-v1"],
  "requiredCapabilities": ["nip42-auth"],
  "jurisdictions": [],
  "languages": [],
  "limit": 25,
  "cursor": null
}
```

A result identifies the exact snapshot and preserves entry order:

```json
{
  "version": 1,
  "catalogId": "public-all-seats",
  "snapshotDigest": "sha256:<snapshot-42>",
  "policyDigest": "sha256:<inclusion-and-ranking-policy>",
  "entries": ["<CatalogEntry>", "<CatalogEntry>"],
  "nextCursor": null
}
```

The baseline publishes complete signed snapshots so a client can download once
and filter locally. A server-side query profile may return proofs or a signed
result binding it to a snapshot. An unsigned, mutable search response must not
be presented as if it were the provider's signed catalog.

## 6. Publication and verification flow

1. An instance operator publishes a signed manifest under its destination-seat
   contract.
2. The Discovery provider retrieves and verifies the manifest, applies its
   published inclusion policy, and records only a digest-bound reference.
3. The provider publishes a signed, expiring catalog snapshot.
4. The client obtains the Discovery provider manifest through direct import,
   a user-selected source, or a replaceable application default.
5. The client verifies provider identity, snapshot signature, sequence,
   policy digest, expiry, bounds, and requested seat type.
6. The client fetches candidate instance manifests, verifies their operator
   signatures and digests, and evaluates compatibility locally.
7. The UI shows catalog source, relevant evidence, commercial relationship,
   and material risk or compatibility information.
8. The user or group explicitly selects an instance under that seat's own
   contract.

Discovery completion is not service selection. Fetching, viewing, or ranking
an entry grants the instance no capability and creates no downstream order.

## 7. Inclusion, ranking, and presentation

Each catalog pins a human-readable and machine-identifiable policy that states:

- eligible seat types, profiles, jurisdictions, and audiences;
- required manifest freshness and availability checks;
- required attestations, methodologies, issuers, and maximum ages, if any;
- legal, safety, quality, accessibility, or service-level criteria;
- listing, subscription, sponsorship, referral, and common-ownership terms;
- ranking inputs and their relative priority or deterministic ordering rule;
- removal, correction, appeal, emergency, and conflict processes;
- review cadence and catalog expiry; and
- what the provider does not verify.

The provider may curate. It is not required to list every technically
compatible instance. It must not claim completeness unless the claim defines a
reproducible source population and measurement time.

Paid placement is allowed only when the affected entries say so and the UI can
distinguish it without relying on color alone. A paid entry still has to meet
the catalog's published minimum criteria. Payment cannot be described as an
audit, certification, popularity measure, or organic rank.

A client may re-rank locally, but it must not attribute the resulting order to
the Discovery provider. When a client merges catalogs, each entry retains its
sources and conflicting claims remain visible.

## 8. Direct use and provider replacement

Every conforming client supports a direct manifest path appropriate to its
platform: paste, scan, file import, deep link, local configuration, or another
profile-defined mechanism. Direct import applies the same signature, schema,
compatibility, and safety validation used for catalog results.

A client may ship with a default Discovery provider when it:

1. identifies that provider and its operator;
2. lets the user add, remove, and replace sources;
3. does not silently restore a removed source;
4. labels which source produced each recommendation;
5. preserves direct import; and
6. does not treat absence from the default as protocol invalidity.

Discovery itself bootstraps through direct import or a replaceable application
default. A Discovery provider may list other Discovery providers, but no
provider is required to list itself and no recursive catalog establishes a
root authority.

## 9. Freshness, removal, and disputes

Catalog snapshots expire. Clients must distinguish:

- an active entry in a fresh snapshot;
- a previously listed entry absent from a newer snapshot;
- an entry whose destination manifest expired or changed;
- an unreachable manifest or instance;
- an entry under a disclosed warning or review; and
- an invalid signature or digest.

Removal means only that the named catalog no longer recommends or indexes the
entry. It does not revoke the operator's manifest or prevent direct use. The
provider should publish a bounded reason code such as `manifest_expired`,
`policy_mismatch`, `evidence_expired`, `unreachable`, `operator_request`,
`security_response`, or `commercial_term_ended`.

Policies provide correction and appeal channels where practical. Emergency
removal may precede a detailed explanation when disclosure would worsen an
active vulnerability, violate law, or expose private reports. The catalog must
still identify the governing policy and record that an emergency path was
used.

A dispute over inclusion or ranking does not give an arbiter authority over
the destination seat. Any order under the
[arbitration contract](../arbitration/Arbitration.md) is bounded to the catalog
agreement and its escrowed stake.

## 10. Privacy boundary

Public catalog discovery should not require an account or stable identifier.
The baseline prefers complete snapshots and local filtering because a remote
query can reveal which seat, jurisdiction, capability, bank, charity, recovery
provider, or other sensitive service interests a person.

A conforming privacy profile states:

- whether queries are local or server-side;
- network metadata visible to the provider and intermediaries;
- query and access-log fields, purpose, retention, and deletion;
- whether rate limiting uses anonymous, rotating, or account-bound state;
- whether results are personalized and from which explicit inputs;
- proxy, cache, padding, batching, or private-retrieval behavior, if any; and
- subprocessors and cross-border handling.

The baseline forbids:

1. requiring an identity root key, recovery secret, message key, or group
   membership proof for public discovery;
2. using a stable identifier shared with a destination instance;
3. joining queries across seat types into a behavioral profile;
4. selling or disclosing query histories for advertising, eligibility,
   pricing, credit, employment, insurance, or surveillance;
5. encoding a user or query identifier into a returned manifest URI;
6. making undisclosed personalized rank look like catalog policy; and
7. telling a listed instance who viewed, rejected, or selected alternatives.

Private enterprise or group catalogs may require authentication, but the
credential is scoped to that catalog and does not become a cross-seat user
identifier.

## 11. Economics and conflicts

A Discovery provider may offer:

- a user, organization, or community subscription for maintained catalogs;
- fixed-fee catalog construction or policy administration;
- monitoring, availability measurement, or change alerts;
- operator-paid listing review under published criteria;
- clearly labeled sponsored placement; or
- zero-priced public catalogs funded by a disclosed sponsor or commons grant.

Every offer states payer, service, period, price, refund terms, data handling,
and maximum liability. Operator payment or common ownership is attached to the
affected entries. A provider cannot receive an undisclosed downstream
commission, fabricate selection evidence, or claim a perpetual share of an
instance's future revenue merely because it listed the instance.

The Discovery service earns when its catalog or curation offer is chosen. The
destination instance earns separately when the user or group chooses and uses
that seat. These are independent decisions and orders.

## 12. Error semantics

| Error | Meaning | Client behavior |
|---|---|---|
| `provider_manifest_invalid` | Discovery provider identity, signature, schema, or expiry failed | Reject the source |
| `snapshot_invalid` | Snapshot signature, sequence, digest, bounds, or schema failed | Reject the snapshot; retain last valid snapshot only within its expiry |
| `snapshot_expired` | Catalog freshness window ended | Mark stale; refresh or use another source |
| `policy_unavailable` | Pinned inclusion/ranking policy cannot be retrieved or matched | Do not present rank as policy-backed |
| `entry_manifest_unavailable` | Destination manifest cannot be fetched | Mark unavailable; do not invent current fields |
| `entry_manifest_mismatch` | Entry fields or fetched bytes conflict with the pinned manifest digest | Reject the entry and report source conflict |
| `entry_manifest_invalid` | Destination signature, schema, seat type, or expiry failed | Reject the entry |
| `profile_incompatible` | Client cannot use the declared implementation profile | Hide only under an explicit compatibility filter |
| `query_unsupported` | Provider does not support a requested server-side filter | Download and filter locally or use another source |
| `rate_limited` | Declared query limit reached | Respect bounded retry metadata; do not change identity to evade policy |
| `result_incomplete` | A bounded result omitted entries or could not prove completeness | Show incompleteness; never claim no instances exist |
| `source_conflict` | Selected catalogs disagree about an instance or evidence | Preserve source-specific claims for user evaluation |

An empty result means only that this catalog returned no matching entry under
this query and snapshot. It does not prove that no compatible instance exists.

## 13. Threat model

| Threat | Consequence | Required response |
|---|---|---|
| Catalog capture | One operator becomes a practical gate | Multiple sources, source visibility, direct import, exportable pins |
| Equivocation | Provider shows different signed catalogs to different users | Sequence and previous digest, snapshot comparison, optional transparency profile |
| Manifest substitution | Catalog redirects a trusted name to attacker bytes | Operator signature and digest verification after retrieval |
| Stale catalog | Removed, compromised, or incompatible instance remains recommended | Short expiry, refresh, destination-manifest revalidation |
| Sybil flooding | Low-quality instances bury useful results | Published inclusion costs and evidence criteria; never call curation completeness |
| Pay-to-rank deception | Advertising appears organic | Entry-level relationship and placement disclosure; distinct UI treatment |
| Hidden personalization | Users receive manipulative or discriminatory orderings | Baseline non-personalized rank; explicit inputs and local controls for variants |
| Query surveillance | Seat interests reveal sensitive intent | Local filtering, minimal logs, no cross-seat joining or destination callbacks |
| Audit laundering | Catalog turns a narrow attestation into broad approval | Exact attestation issuer, subject, scope, artifact, result, expiry, and status |
| Common ownership | Catalog favors its operator's other seats | Entry-level conflict disclosure and replaceable sources |
| Availability spoofing | Listed endpoint is dead or intermittently hostile | Timestamped measurements as evidence, not promises; client runtime checks |
| Malicious URI | Fetch reaches local networks, oversized bodies, or downgrade redirects | Profile-defined schemes, SSRF protections, size limits, TLS, redirect bounds |

Discovery reduces search cost; it cannot make adversarial providers harmless.

## 14. Obligations

### 14.1 Discovery provider

A conforming provider must:

1. sign its provider manifest and every catalog snapshot;
2. publish the exact inclusion, ranking, commercial, conflict, removal, and
   appeal policy pinned by each snapshot;
3. preserve operator-signed manifests rather than rewriting their claims;
4. bind entries to manifest digests and verify them before inclusion;
5. disclose sponsored placement, listing payments, sponsorship, and common
   ownership at entry level;
6. expire snapshots and remove or warn on known-invalid entries promptly;
7. bound catalog size, entry size, pagination, redirects, and fetched content;
8. follow its declared privacy and retention profile;
9. avoid claims of certification, completeness, or availability it cannot
   substantiate; and
10. provide exportable signed snapshots so exit does not depend on continued
    access to its service.

### 14.2 Instance operator

A listed operator must:

1. sign and publish the destination seat's conforming manifest;
2. keep operator identity, endpoints, profiles, capabilities, offers, privacy,
   limits, and expiry accurate;
3. rotate, supersede, or revoke its own manifest under that seat's rules;
4. not treat listing as certification or user selection;
5. disclose its relationship with the Discovery provider; and
6. not receive query or viewer identity outside a separately selected service
   interaction.

### 14.3 Client

A conforming client must:

1. verify Discovery and destination signatures, digests, versions, and expiry;
2. identify the catalog source and distinguish catalog claims from instance
   claims and third-party attestations;
3. preserve direct import and source replacement;
4. apply compatibility and safety checks after discovery;
5. distinguish sponsored placement and material conflicts accessibly;
6. avoid turning absence from a default catalog into protocol invalidity;
7. not identify the user to the destination before explicit selection; and
8. report stale, incomplete, conflicting, and unavailable states honestly.

## 15. Security, privacy, and economic invariants

1. **Discovery is not permission.** Inclusion grants no seat authority.
2. **Absence is not invalidity.** Directly imported conforming manifests remain
   usable.
3. **Every claim keeps its author.** Operator manifests, Discovery policy,
   audits, measurements, and client-local ranking are never collapsed into one
   endorsement.
4. **The destination manifest wins.** A catalog cannot rewrite operator-signed
   fields.
5. **Selection is separate.** A result or rank cannot activate an instance,
   grant a capability, or create a downstream order.
6. **All seats fit one boundary.** Discovery indexes versioned manifest
   references without acquiring destination-seat powers.
7. **Commercial influence is visible.** Listing fees, sponsorship, placement,
   referral terms, and common ownership are attached to affected entries.
8. **Public search needs no stable identity.** Cross-seat query profiling and
   destination callbacks are forbidden by the baseline.
9. **Snapshots are bounded and expiring.** Stale or incomplete data is never
   presented as current or complete.
10. **Sources are plural and replaceable.** Clients can add, remove, merge, and
    leave Discovery providers without migrating identity or downstream state.
11. **Empty is source-scoped.** An empty result from one catalog is not proof
    that no instance exists.
12. **Revenue follows a chosen Discovery service.** It does not create a tax on
    every future interaction with a listed instance.

## 16. Versioning and conformance

- `DiscoveryContract` changes when role, authority, object, privacy, ranking,
  error, or economic semantics change.
- A `DiscoveryImplementationProfile` pins canonical encoding, signature suite,
  transport, URI rules, snapshot limits, pagination, query behavior, and
  compatibility identifiers.
- Every provider manifest and catalog snapshot states exact versions and
  expiry. Clients reject unknown critical fields or unsupported major versions.
- Catalog corrections append a new sequence and previous digest; they do not
  mutate a signed historical snapshot.
- Conformance fixtures cover signatures, canonicalization, sequence rollback,
  equivocation, expiry, manifest mismatch, duplicate entries, pagination,
  unsupported filters, sponsored placement, source conflicts, malicious URIs,
  oversized content, and privacy-profile behavior.

A first implementation profile is in draft:
[Discovery-Static-Ed25519.md](Discovery-Static-Ed25519.md) — Ed25519-signed
static snapshots over HTTPS with full-download local filtering. It follows
this contract's recommendation to prefer signed static snapshots over
account-based remote search, because that makes verification, caching,
mirroring, comparison, and local private filtering straightforward.

## 17. Acceptance criteria

The Discovery boundary is successfully separated when:

1. an operator can publish a conforming instance manifest for any defined
   seat without asking a Discovery provider;
2. independent providers can publish different signed catalogs under visible
   policies;
3. a client can verify, merge, compare, and replace those sources;
4. every result points to an independently verified operator manifest;
5. users can filter by seat and compatibility without revealing a stable
   identity under the baseline profile;
6. paid placement and common ownership cannot appear as organic rank;
7. an expired, removed, conflicting, or unreachable entry has explicit
   semantics;
8. direct import works when every catalog omits the instance;
9. viewing a result neither identifies the user to the instance nor selects
   it; and
10. a Discovery provider can earn for chosen catalog or curation service
    without becoming a toll gate on downstream seat revenue.

## 18. Justification in one sentence

> Onym needs a replaceable way to find instances of every seat, while keeping
> trust, compatibility, and final selection with the user rather than the
> catalog.
