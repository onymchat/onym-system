---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Association Naming Contract Boundary

**Proposal draft 0.1 — August 2026**

> An association may name an identity; it may never become the identity. The
> holder decides which names to accept, which registries to appear in, and
> when to walk away with the identity intact.

This document proposes the technology-neutral boundary for **association
naming**: the service seat that attaches human-readable names, roles, and
memberships to cryptographic identities as signed, consent-bound claims. It
expands section 6 of the [whitepaper](../WHITEPAPER.md) into a contract that
independent registry operators, associations, subjects, and verifying clients
can implement against.

It does not require a particular ledger, database, resolution transport,
signature suite, or jurisdiction. A concrete implementation profile may use
signed static documents, a replicated log, a smart contract, or an ordinary
web service that satisfies the profile's issuance, consent, resolution,
expiry, and revocation semantics. No concrete profile exists yet; this
proposal defines what one must satisfy.

Here **naming provider** and **registry** are used interchangeably for the
operator of one namespace. The term *identity provider* is deliberately
avoided: identities are provided by the holder's own vault
([../identity/UI-Identity.md](../identity/UI-Identity.md)); a registry
provides names about them.

Message delivery, media storage, and shared-state validation are separate
boundaries ([../message/UI-Message.md](../message/UI-Message.md),
[../blob/UI-Blob.md](../blob/UI-Blob.md),
[../notary/UI-Notary.md](../notary/UI-Notary.md)). A registry participates in
none of them.

## 1. Decision

Onym treats the subject, the registry operator, the association, the
verifying client, and directories as independently owned components joined by
versioned interfaces.

- The **subject** is the identity holder. A name attaches to their identity
  only through their explicit, revocable acceptance. They may hold names in
  many registries, or in none, and neither choice affects their identity's
  validity.
- The **registry operator** owns one namespace: its trust root, issuance
  policy, records, resolution service, pricing, and disputes. It is the
  issuer of assertions, not the custodian of subjects.
- The **association** is the community whose social meaning a name carries—a
  professional body, employer, family, municipality, game, or anonymous
  collective. It defines who deserves a name under its policy. An association
  may operate its own registry or designate an independent operator.
- The **verifying client** (UI or application) resolves, verifies, and
  displays qualified names without conflating any of them with the identity
  itself.
- **Directories** may recommend registries. Recommendation is curation, not
  validity.

One organization may occupy several roles—most commonly association and
registry operator—but the authorities remain separate: operating the
namespace never implies controlling the subject's keys, and naming a subject
never implies the subject endorses the namer.

The boundary has three interfaces:

1. the **subject ↔ registry** issuance interface: request, offer, acceptance,
   renewal, disavowal;
2. the **verifier ↔ registry** resolution interface: forward and reverse
   lookup, verification material, freshness; and
3. the **association ↔ member** enrollment interface: the declared naming
   policy a person accepts when joining (see §10).

None of these interfaces may carry the subject's root secret, private keys,
or vault capability results beyond the specific signatures this contract
defines.

## 2. What association naming does

A conforming registry can:

1. publish a signed manifest declaring its namespace, trust root, issuance
   policy, and endpoints;
2. issue signed `AssociationRecord`s binding a local name, role, or
   membership scope to a subject identifier;
3. record the subject's countersigned acceptance, without which a record is
   a claim about someone, not a name of them;
4. resolve a qualified name to its current record and acceptance;
5. reverse-resolve a subject to the names it has accepted for publication in
   that registry;
6. renew, supersede, expire, and revoke its own records; and
7. accept and publish subject disavowals.

It does not create identities, store or recover keys, relay messages,
authorize group state, vouch for other registries, or decide whether its own
policy is socially deserved. A registry that loses its database loses its
assertions; every subject's identity survives it untouched.

## 3. Why this boundary is necessary

### 3.1 Names must not become account authority

Systems that start by naming users end by owning them: the namespace becomes
the login, the login becomes the account, and the account becomes something
an operator can suspend. Keeping the name a separable, signed claim—issued by
a registry, accepted by a subject, verifiable by anyone—means losing or
leaving a registry costs exactly the name, never the identity, groups,
messages, or funds behind it.

### 3.2 One global namespace is the wrong goal

A professional body, a family, a game, and an anonymous community may all
legitimately name the same person differently, under incompatible policies.
Forcing them into one unique global table either recreates a central naming
authority or launches a land-grab for scarce strings. Qualified names make
the issuer part of the displayed name, so uniqueness is only required within
one registry, where its policy actually governs.

### 3.3 Consent must be structural, not assumed

Anyone can sign a statement about a public key; nothing can prevent that. The
boundary therefore distinguishes an **assertion** (registry-signed) from a
**name** (registry-signed and subject-accepted). Verifying clients enforce
the difference at display time, which removes the value of unsolicited or
adversarial naming: a claim the subject never accepted is never rendered as
the subject's name.

### 3.4 It makes the trust decision visible

`alice@writers.tallinn` tells the viewer exactly who is vouching: the
`writers.tallinn` registry, under its published policy. Whether that policy
means careful vetting or five euros and a checkbox is the registry's
disclosed business. Cryptography proves who signed; it cannot prove a name is
deserved—so the party making the social claim must be visible in the name
itself.

### 3.5 It lets associations require without capturing

An association may reasonably want members to be nameable in its own
registry—a bar association naming licensed lawyers, an employer naming staff.
The boundary allows that as a disclosed membership condition while keeping it
bounded: the requirement binds the membership name, not the person's other
names, other registries, or root keys, and it ends when membership ends.

## 4. Logical topology

```text
                    ┌────────────────────────────┐
                    │ Association                │
                    │ community · policy · roles │
                    └───────┬────────────────────┘
                            │ designates / operates
                            v
┌───────────────┐   ┌────────────────────────────┐
│ Subject       │   │ Registry (naming provider) │
│ identity vault│──>│ namespace · trust root     │
│ consent       │<──│ records · resolution       │
└───────┬───────┘   └───────┬────────────────────┘
        │ accepted names    │ signed records + acceptances
        │ (countersigned)   v
        │           ┌────────────────────────────┐
        └──────────>│ Verifying clients          │
                    │ resolve · verify · display │
                    │ qualified names            │
                    └────────────────────────────┘

     Directories recommend registries; they do not validate names.
     A registry failure deletes assertions, never identities.
```

The subject's signatures come from vault capabilities (a `prove-credential` /
acceptance signing operation); the vault, not the registry, holds the keys.
The registry is outside the subject's trust boundary. A verifier trusts a
registry's records exactly as far as it trusts that registry's published
policy—a per-registry, per-viewer decision.

## 5. Boundary objects

### 5.1 Naming Profile

A `NamingProfile` defines the portable interface independently of storage or
transport technology:

```json
{
  "profileVersion": 1,
  "profileId": "onym:naming-profile:qualified-association-v1",
  "interface": "onym-naming-v1",
  "operations": [
    "resolve-name",
    "resolve-subject",
    "request-issuance",
    "accept-record",
    "renew-record",
    "revoke-record",
    "disavow-record"
  ],
  "nameSyntax": "onym-qualified-name-v1",
  "recordSchema": "onym-association-record-v1",
  "acceptanceSchema": "onym-subject-acceptance-v1",
  "freshness": "<declared-staleness-and-revocation-checking-model>",
  "errorSchema": "onym-naming-errors-v1",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

### 5.2 Registry Manifest

A registry claims the seat by publishing a signed manifest:

```json
{
  "version": 1,
  "componentId": "onym:component:<registry-id>",
  "seat": "naming.association",
  "operator": "onym:key:<operator-id>",
  "namespace": "writers.tallinn",
  "trustRoot": "<registry-signing-key-descriptor>",
  "namingProfileId": "onym:naming-profile:qualified-association-v1",
  "implementationProfileId": "onym:naming-implementation:<technology>-v1",
  "endpoints": [
    {"uri": "<resolution-endpoint>", "role": "resolve"},
    {"uri": "<issuance-endpoint>", "role": "issue"}
  ],
  "issuancePolicy": "<hash-or-url-of-human-and-machine-readable-policy>",
  "association": "onym:key:<association-id-or-same-as-operator>",
  "localNameRules": "<syntax-normalization-and-confusable-policy>",
  "reverseResolution": "accepted-and-published-records-only",
  "retention": "<record-and-log-retention-policy>",
  "privacyProfile": "<hash-or-url>",
  "offers": ["<issuance-or-resolution-offer-ids>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The namespace string is claimed, not allocated by a global authority; two
registries may claim colliding namespaces, and clients disambiguate by
`componentId` and trust root, warning on collision. A directory may refuse to
list a squatter; it cannot make the squatter's signatures invalid—only
untrusted.

### 5.3 Qualified name

The displayable unit is a **qualified name**:

```text
alice@writers.tallinn        (accepted record, resolvable registry)
treasurer@helping-hands      (role scope within an association)
0xA17F… · self-described     (no registry: local presentation only)
```

Syntax `onym-qualified-name-v1` requires:

- a registry-normalized local part, with the registry's declared confusable
  and normalization rules applied at issuance, not at display;
- the namespace as displayed suffix, never elided by a conforming client;
  and
- no protocol meaning for an unqualified string: bare `Alice` is local
  presentation (a petname), not a resolvable protocol fact.

Uniqueness of the local part is guaranteed only within one registry at one
time. Cross-registry collisions are expected and legitimate; the qualifier is
the disambiguation.

### 5.4 Association Record

The registry's half of a name (extending whitepaper §6.2):

```json
{
  "recordVersion": 1,
  "registry": "onym:registry:<registry-id>",
  "name": "alice",
  "subject": "onym:key:<subject-id>",
  "scope": ["display-name", "member"],
  "issuedAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2027-08-01T00:00:00Z",
  "sequence": 3,
  "policy": "<hash-or-url-of-issuance-policy-version-applied>",
  "membershipCondition": "<hash-of-membership-naming-policy-or-null>",
  "signature": "<registry-signature>"
}
```

`scope` bounds what the record asserts: a display name, a membership, a role,
an office. Sensitive personal attributes do not belong in public records;
they are future selective-disclosure credentials, adopted only after their
own privacy review.

`sequence` orders records for the same (registry, name) pair; a higher
sequence supersedes. `membershipCondition` links a record issued under §10 to
the policy the subject enrolled under.

### 5.5 Subject Acceptance

The subject's half. Without it, the record must not be displayed as the
subject's name:

```json
{
  "acceptanceVersion": 1,
  "record": "<hash-of-association-record>",
  "subject": "onym:key:<subject-id>",
  "publish": true,
  "acceptedAt": "2026-08-01T00:00:00Z",
  "expiresAt": "2027-08-01T00:00:00Z",
  "signature": "<subject-signature-via-vault-capability>"
}
```

- `publish: true` permits the registry to serve this record in reverse
  resolution (subject → names). `publish: false` accepts the name for
  contexts where the subject presents it, while keeping the registry from
  volunteering it.
- Acceptance binds a specific record hash; a superseding record needs a new
  acceptance.
- The signature is produced through the subject's vault as a typed
  capability with displayed intent—the registry never holds subject keys.

### 5.6 Disavowal

The subject may unilaterally unbind:

```json
{
  "disavowalVersion": 1,
  "record": "<hash-of-association-record>",
  "subject": "onym:key:<subject-id>",
  "effectiveFrom": "2026-08-01T00:00:00Z",
  "signature": "<subject-signature>"
}
```

A conforming registry publishes disavowals it receives for its own records; a
conforming client stops displaying a disavowed name even if the registry
stalls. Disavowal needs no registry permission and no reason. The symmetric
right—registry revocation—needs no subject permission. A name exists only
while both sides maintain it.

### 5.7 Membership Naming Policy

The object behind §10. An association that conditions membership on naming
publishes, before enrollment:

```json
{
  "policyVersion": 1,
  "association": "onym:key:<association-id>",
  "designatedRegistries": ["onym:component:<registry-id>"],
  "requiredScopes": ["member"],
  "namingRequired": true,
  "publicationRequired": false,
  "onExit": "revocation-of-membership-scoped-records-only",
  "exclusivity": "none",
  "signature": "<association-signature>"
}
```

Constraints on what such a policy may demand are normative in §10.

### 5.8 Resolution results

Forward resolution (`resolve-name`) returns the current record, its
acceptance status, and verification material:

```json
{
  "query": "alice@writers.tallinn",
  "record": "<association-record>",
  "acceptance": "<subject-acceptance-or-null>",
  "status": "active",
  "supersededBy": null,
  "checkedAt": "2026-08-01T00:00:00Z"
}
```

`status` is one of `active`, `unaccepted`, `expired`, `superseded`,
`revoked`, `disavowed`. Reverse resolution (`resolve-subject`) returns only
records that are accepted with `publish: true`; a registry must not
enumerate a subject's unaccepted or unpublished records to third parties.

Resolution responses are registry-signed and dateable so verifiers can apply
the profile's freshness rules; a stale cached record is evidence of a past
state, not the current one.

## 6. Common naming surface

| Operation | Input | Result |
|---|---|---|
| `resolve-name` | Qualified name | Record, acceptance, status, freshness |
| `resolve-subject` | Subject ID | Published accepted records in this registry |
| `request-issuance` | Desired name, subject ID, policy evidence | Offer or refusal under the registry's policy |
| `accept-record` | `SubjectAcceptance` | Activated name |
| `renew-record` | Record reference, per policy | Successor record awaiting acceptance |
| `revoke-record` | Registry authority, per policy | Revocation visible in resolution |
| `disavow-record` | `Disavowal` | Published disavowal; name inactive |
| `verify` | Record + acceptance + manifest | Local validity decision, offline-capable |

`verify` is local: given the registry manifest, a record, and an acceptance,
a client can validate signatures and expiry without contacting the registry,
subject to the profile's freshness rules for revocation and supersession.

## 7. Verifying client obligations

A conforming UI or application must:

1. verify the registry manifest, record, and acceptance signatures before
   attributing a name;
2. never display an unaccepted, expired, superseded, revoked, or disavowed
   record as the subject's current name—`unaccepted` renders as a claim by
   the registry, if at all;
3. always display the qualifier; two names from different registries are
   different names even when local parts match;
4. keep local petnames visually distinct from registry names and from
   self-described labels;
5. warn on namespace collisions, confusable local parts across the viewer's
   trusted registries, and registry trust-root changes;
6. let the viewer choose which registries to trust for display, per context,
   without a hardcoded default becoming mandatory;
7. treat resolution answers as registry-signed observations with declared
   freshness, and re-check per profile before high-stakes display;
8. never derive routing, authorization, or payment targets from a name
   alone—names annotate identities; keys and records authorize;
9. avoid leaking the viewer's social graph through resolution queries beyond
   the profile's declared exposure, and disclose that exposure; and
10. keep names out of transport addresses, logs, and analytics, per the
    courier boundary's rule that human names are not routing material.

Registry display names, policy URLs, and record contents are untrusted
input. They must not execute code, spoof consent UI, or impersonate other
registries' qualified forms.

## 8. Registry operator obligations

A conforming registry must:

1. publish and honor its manifest: policy version, name rules, endpoints,
   pricing, retention, and privacy profile;
2. issue records only under the policy version referenced in the record, and
   apply normalization and confusable rules at issuance;
3. obtain and store the subject's acceptance before representing a name as
   held—an issued-but-unaccepted record is served as `unaccepted`;
4. serve resolution answers that are signed, dateable, and consistent: no
   equivocation between viewers about the current record for a name;
5. publish supersession, expiry, revocation, and received disavowals
   promptly and irreversibly in resolution results;
6. restrict reverse resolution to accepted, `publish: true` records, and
   resist enumeration and scraping of its subject population;
7. collect only the personal data its published policy requires for
   issuance, keep it out of public records, and bound its retention;
8. never request root secrets, recovery material, unrelated addresses,
   message history, or vault capabilities beyond acceptance signatures;
9. keep issuance fees, renewal fees, and disputes inside its published
   offers—payment buys process under the policy, never truth; and
10. declare its shutdown behavior: how records, acceptances, and disavowals
    remain verifiable (for example, a final signed archive) after the
    service ends.

A registry that equivocates—serving different current records for the same
name to different viewers—is misbehaving in a detectable way, and clients
comparing signed responses may treat its records as untrusted.

## 9. Association obligations

An association, when distinct from its registry operator, must:

1. publish which registry it designates and the policy hash under which
   names carry its meaning;
2. keep the social claim honest: a `member` scope means whatever its
   published policy says membership means, and nothing more;
3. request revocation only through the registry's declared process, leaving
   a signed trail; and
4. follow §10 whenever naming is a condition of membership.

## 10. Membership-conditioned naming

People may enroll in associations, and an association may require, as a
condition of membership, that the member hold a name in its designated
registry. This proposal permits that pattern and bounds it.

A conforming membership naming requirement:

1. is disclosed before enrollment as a signed `MembershipNamingPolicy`
   (§5.7), referenced from every record it produces;
2. binds only membership-scoped records in the designated registries—it
   cannot demand disavowal of the member's names elsewhere, exclusivity
   across registries, or the member's other contexts, addresses, or keys;
3. still requires the member's acceptance signature per record; enrollment
   consent is to the policy, acceptance is to each concrete name;
4. may require publication (`publicationRequired: true`) only where the
   association's function genuinely requires public membership (for
   example, a professional license register), and must say so in the
   pre-enrollment policy;
5. ends with membership: `onExit` revokes membership-scoped records only,
   and exit never touches the identity, other registries' names, groups, or
   funds; and
6. cannot be retroactively broadened—expanding the requirement is a new
   policy version that existing members explicitly re-accept or decline by
   leaving.

Declining such a policy costs the membership and its benefits, never the
identity. An association may choose its registry; it may not choose the
member's vault, and a registry designated by one association gains no
standing over the member's participation anywhere else.

## 11. Payment at the naming boundary

A registry may charge for issuance, renewal, dispute handling, expedited
process, or high-availability resolution, under its published seat offers
and, where sold through a frontend, a signed `ChannelOffer` per the
whitepaper's settlement model.

- Payment buys the registry's declared process under its declared policy. A
  paid name is not more cryptographically true, and display rank in a
  conforming client is not for sale.
- Resolution of accepted public records should have a free or at-cost tier
  wherever feasible; a registry whose names can only be verified behind a
  paywall is disclosing that limitation in its manifest, and clients weigh
  it.
- No payment state—lapse, refund, dispute—revokes the subject's identity or
  any name in any other registry. Non-payment consequences are bounded to
  the purchased record's renewal per the published policy.

## 12. Errors and state machine

| Error | Origin | Client/subject response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse; explain required profile |
| `namespace_collision` | Resolution/trust store | Disambiguate by componentId; warn viewer |
| `name_unavailable` | Registry policy | Report; policy governs, not the protocol |
| `policy_refused` | Registry | Report the referenced policy version |
| `unaccepted` | Resolution | Display as registry claim at most, never as the name |
| `acceptance_mismatch` | Verification | Treat as invalid; possible substitution attempt |
| `expired` | Verification | Stop displaying; offer renewal path to subject |
| `superseded` | Resolution | Re-resolve; display successor only after its acceptance |
| `revoked` | Resolution | Stop displaying; show issuer action, not subject fault |
| `disavowed` | Resolution/subject | Stop displaying regardless of registry state |
| `equivocation_detected` | Cross-checking clients | Distrust registry records pending explanation |
| `resolution_unavailable` | Network/registry | Use cached signed answers within freshness bounds |
| `payment_required` | Registry offer | Present signed offer via billing flow; never inline |

Name lifecycle:

```text
requested
  -> offered (registry policy check)
  -> issued (registry-signed record)
  -> accepted (subject-countersigned)      <- only here does it become a name
  -> active
       -> renewed -> issued' -> accepted' -> active
       -> expired
       -> superseded (higher sequence, needs new acceptance)
       -> revoked   (registry authority)
       -> disavowed (subject authority)
```

Both terminal authorities are unilateral: the registry can always revoke its
assertion; the subject can always disavow their acceptance. Nothing in the
lifecycle can strand a subject inside a name they no longer want, or force a
registry to keep asserting what it no longer believes.

## 13. Security and privacy invariants

1. **The name is not the identity.** No registry operation—issuance,
   revocation, shutdown, sale, compromise—changes who controls the subject's
   keys.
2. **A name requires both signatures.** Registry assertion plus subject
   acceptance; either side's absence or withdrawal ends display.
3. **Qualification is mandatory.** Conforming clients never render a
   registry name without its source; trust in the name is trust in the
   named issuer's policy.
4. **No global namespace.** Uniqueness is per registry; collisions across
   registries are legitimate and disambiguated, not raced for.
5. **Reverse lookup is opt-in.** Only accepted, publication-consented
   records connect a subject to its names; registries resist enumeration.
6. **Consent is per record.** Enrollment in an association authorizes a
   policy; each concrete name still needs its own acceptance, and
   supersession needs re-acceptance.
7. **Membership conditions are bounded.** Designated-registry requirements
   bind membership-scoped names only, end at exit, and never reach other
   registries, contexts, or keys.
8. **Registries hold no subject keys.** Acceptance and disavowal signatures
   come from the subject's vault as typed capabilities; issuance never
   requests secrets or recovery material.
9. **Public records carry no dossier.** Scopes bound assertions; sensitive
   attributes await selective-disclosure credentials rather than riding in
   public records.
10. **Equivocation is detectable.** Signed, dateable resolution answers let
    clients compare views; a registry cannot silently show different truths
    to different viewers.
11. **Payment buys process, not truth.** Fees, tiers, and disputes are
    disclosed offers; display and validity are not purchasable.
12. **Registry death is survivable.** Records verify from archives, names
    are re-issuable elsewhere, and every identity continues without
    interruption.

## 14. Versioning and conformance

- `NamingProfile` changes when operation, record, acceptance, status, or
  freshness meaning changes.
- `RegistryManifest` changes when trust root, namespace, policy, endpoints,
  or offers change; trust-root rotation is a manifest event clients surface.
- Records are ordered by `sequence` per (registry, name); acceptances bind
  record hashes, so no record content changes silently under an old
  acceptance.
- Policy versions are content-addressed; a record always names the policy it
  was issued under.
- Cross-platform fixtures cover: record and acceptance canonical encodings
  and signatures; unaccepted/expired/superseded/revoked/disavowed display
  decisions; qualifier rendering; normalization and confusable handling;
  collision warnings; reverse-resolution consent filtering; equivocation
  detection from conflicting signed answers; membership-policy binding and
  exit revocation scope; and archive verification after registry shutdown.
- A registry, a subject vault, and a verifying client from three different
  authors must interoperate using only published profiles and fixtures.

## 15. Concrete implementation profiles

No concrete profile exists yet. The first reference profile
(`onym:naming-implementation:<technology>-v1`) should be chosen for
auditability of the resolution log—equivocation resistance is the property
that most distinguishes candidate technologies—and specified in a separate
document following the seat's abstract/implementation pattern.

A minimal first registry (for example, an Onym contributor namespace) is the
natural proving ground before any association with real-world stakes
designates one.

## 16. Acceptance criteria

The association naming seat is successfully specified when:

1. a subject can hold zero names and lose nothing but human-readable
   presentation;
2. a subject can accept names in several registries without any registry
   learning of, or gaining standing over, the others;
3. no record displays as a person's name without their vault-signed
   acceptance, and disavowal stops display even against a stalling registry;
4. two registries can issue the same local part to different subjects and
   conforming clients never confuse them;
5. an association can require a designated registry for membership names,
   and a member who leaves keeps their identity and every other name;
6. a registry compromise or shutdown invalidates at most that registry's
   assertions, verifiably and survivably;
7. equivocation between viewers is detectable from signed answers alone;
8. a paid issuance renders identically to a free one of the same status; and
9. a second registry technology can implement the abstract suite without
   pretending to be the first.

## 17. Justification in one sentence

> Association naming lets any community attach human meaning to an identity
> its holder alone controls—so a person can be `alice@writers.tallinn`,
> `treasurer@helping-hands`, and nobody at all, in the same network, at the
> same time, by their own choice.

## References

1. Onym system whitepaper, section 6:
   [../WHITEPAPER.md](../WHITEPAPER.md)
2. Abstract Onym identity boundary:
   [../identity/UI-Identity.md](../identity/UI-Identity.md)
3. W3C, “Decentralized Identifiers (DIDs) v1.0”:
   <https://www.w3.org/TR/did-core/>
4. W3C, “Verifiable Credentials Data Model v2.0”:
   <https://www.w3.org/TR/vc-data-model-2.0/>
5. M. Stiegler, “An Introduction to Petname Systems”:
   <http://www.skyhunter.com/marcs/petnames/IntroPetNames.html>
6. Zooko Wilcox-O'Hearn, “Names: Decentralized, Secure, Human-Meaningful”
   (Zooko's triangle):
   <https://web.archive.org/web/20011020191610/http://zooko.com/distnames.html>
7. Unicode Technical Standard #39, “Unicode Security Mechanisms”
   (confusables): <https://www.unicode.org/reports/tr39/>
