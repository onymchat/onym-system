---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Audit Contract Boundary

**Architecture draft 0.1 — August 2026**

> An auditor examines exact bytes under a declared scope and signs what it
> found. The attestation is one institution's visible opinion—never a
> license, a gate, or a substitute for the reader's own trust decision.

This document proposes the technology-neutral boundary for the **audit
seat**: the institutional service that examines protocol components—code,
builds, deployments, privacy profiles, conformance claims—and issues signed
**attestations** other participants may choose to rely on. It gives a
defined carrier to the audit statements the
[whitepaper](../WHITEPAPER.md) already assumes: notary bundles carry "audit
and build-provenance statements" (§9.2), Discovery implies vetting (§15.2),
the roadmap funds audits before promoting paid listings (Phase 3), and the
current system's own limitation list says no production-grade independent
audit program has completed (§19).

It does not require a particular audit firm, methodology, jurisdiction,
report format, or assurance framework. Anyone may offer audit services; a
concrete implementation profile defines report formats and
methodology-specific evidence. No concrete profile exists yet.

The product of this seat is the **attestation**, not approval. The word
*certification* is deliberately avoided: certification implies an authority
whose refusal excludes, and this seat must never hold that power
(whitepaper §3.7: interoperability is permissionless; endorsement is not).

## 1. Decision

Onym treats the auditor, the audit subject, the sponsor of the engagement,
Discovery providers, and relying parties as independently owned components
joined by versioned interfaces.

- The **auditor** owns its methodology, staffing, professional judgment,
  liability, and reputation. It sells examinations and signs attestations.
  It never acquires authority over the subject's release, operation, or
  participation.
- The **subject** is the owner of the examined component—a UI publisher,
  courier operator, notary provider, registry, bank provider, or SDK
  author. It cooperates with an engagement it accepted; it does not gain a
  veto over honest findings beyond the disclosure terms both parties signed.
- The **engagement sponsor** pays. It may be the subject itself, a
  foundation's commons fund, a Discovery provider, or a third party. Who paid
  is part of the attestation.
- **Discovery providers** may cite attestations in their inclusion policies. A
  provider citing an attestation adopts a visible input, not a delegated
  authority.
- The **relying party**—a user, group, provider, or another institution—
  decides what any attestation is worth, per issuer, per scope, per its own
  stakes.

One organization may occupy several roles, but the profile does not merge
their authority: an auditor that also operates Discovery discloses that
conflict; a foundation that funds an audit does not co-sign its findings.

The boundary has three interfaces:

1. the **engagement** interface between sponsor, subject, and auditor: the
   signed order defining artifact, scope, methodology, fees, and disclosure
   terms;
2. the **attestation** interface between auditor and the world: the signed,
   verifiable statement and its revocation channel; and
3. the **reliance** interface between attestation and verifier: how a
   client matches an attestation to the exact component in front of it.

## 2. What the audit seat does

A conforming auditor can:

1. publish a signed manifest declaring its identity, methodology classes,
   scopes offered, independence policy, and fee offers;
2. accept a signed `AuditOrder` binding an exact artifact, scope,
   methodology, timeline, disclosure policy, and price;
3. examine the artifact and produce a content-addressed findings report
   under the order's disclosure rules;
4. issue a signed `Attestation` stating exactly what was examined, how, to
   what result class, with what limitations, and until when;
5. supersede or revoke its own attestations when new information
   invalidates them; and
6. answer freshness queries about its attestations' current status.

Methodology classes are open-ended; the initial set this proposal names:

| Class | What is attested |
|---|---|
| `security-review` | Manual/assisted examination of code or deployment for vulnerability classes in scope |
| `conformance-run` | A component passed a named, versioned conformance suite (§15.3 of the whitepaper) |
| `build-provenance` | A distributed artifact reproducibly derives from stated source revisions |
| `privacy-review` | A published privacy profile matches observed component behavior in scope |
| `availability-measurement` | Declared service levels were measured over a stated window and method |

It does not approve releases, license participants, rank providers, operate
Discovery catalogs under this seat, fix the defects it finds, or acquire any
standing over components it was not engaged to examine.

## 3. Why this boundary is necessary

### 3.1 Trust claims need an accountable author

The system's security story repeatedly reaches the same edge: cryptography
proves who signed and what hash, but whether code is safe, a build is
honest, or a privacy profile is true is a judgment (whitepaper §3.5). Today
those judgments float unattributed—"audited," says a README. This seat
forces every such claim into a signed object with a named issuer, an exact
artifact, a scope, and an expiry, so misplaced trust at least has a return
address.

### 3.2 Discovery needs inputs, not opinions of its own

A Discovery provider that vets in private becomes an unaccountable quality
authority. When Discovery providers cite attestations, their inclusion policy
becomes auditable—"we list message couriers with a current
`conformance-run` from issuers on this list"—and competing providers can
weigh the same attestations differently. Curation stays replaceable
(§15.2) because its evidence is portable.

### 3.3 Attestation must not become gatekeeping

The failure mode of every audit regime is drift into licensure: no stamp,
no market. The boundary blocks the mechanical half of that drift: clients
must not refuse direct manifest import for lack of attestations, absence of
an attestation is rendered as absence—not as failure—and no auditor gains
protocol standing over unexamined components. The social half—users
preferring attested components—is the point, not the problem.

### 3.4 Bytes drift; opinions must not follow silently

"Audited" is meaningless across releases. Binding every attestation to
exact hashes means a new build carries no inherited halo: the attestation
for revision A displays only against revision A. This is what makes the
seat mechanically checkable by clients rather than a marketing adjective.

### 3.5 Paid examination is a conflict to manage, not deny

Someone pays the auditor, usually the subject—true of every audit industry.
The boundary makes the payer, the fee model, and declared relationships
part of the attestation, and makes verdict-independent payment the
baseline, so relying parties can discount accordingly instead of
discovering the conflict later.

## 4. Logical topology

```text
┌────────────────┐   signed AuditOrder    ┌──────────────────────────┐
│ Sponsor        │───────────────────────>│ Auditor                  │
│ subject, fund, │                        │ methodology · judgment   │
│ or third party │                        │ liability · reputation   │
└────────────────┘                        └───────┬──────────────────┘
        │ artifact access,                        │ examines exact bytes
        │ cooperation                             v
┌───────┴────────┐                        ┌──────────────────────────┐
│ Subject        │                        │ Findings report          │
│ component owner│<───disclosure terms────│ (content-addressed,      │
└────────────────┘                        │  order-scoped)           │
                                          └───────┬──────────────────┘
                                                  │ issues
                                                  v
                                          ┌──────────────────────────┐
                     cite as inputs       │ Attestation              │
┌────────────────┐<───────────────────────│ signed · scoped · bound  │
│ Discovery      │                        │ to hashes · expiring ·   │
└────────────────┘                        │ revocable                │
┌────────────────┐    verify + match      └──────────────────────────┘
│ Relying clients│<──────────────────────────────┘
└────────────────┘

  No path grants the auditor authority over the subject's participation.
  Direct manifest import (whitepaper §15.1) never requires this seat.
```

## 5. Boundary objects

### 5.1 Audit Profile

```json
{
  "profileVersion": 1,
  "profileId": "onym:audit-profile:attestation-v1",
  "interface": "onym-audit-v1",
  "operations": [
    "offer-engagement",
    "accept-order",
    "issue-attestation",
    "supersede-attestation",
    "revoke-attestation",
    "query-status"
  ],
  "methodologyClasses": [
    "security-review",
    "conformance-run",
    "build-provenance",
    "privacy-review",
    "availability-measurement"
  ],
  "attestationSchema": "onym-attestation-v1",
  "resultClasses": ["clear", "findings-noted", "fail", "inconclusive"],
  "freshness": "<status-endpoint-and-staleness-model>",
  "errorSchema": "onym-audit-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

### 5.2 Auditor Manifest

```json
{
  "version": 1,
  "componentId": "onym:component:<auditor-id>",
  "seat": "audit",
  "operator": "onym:key:<auditor-identity>",
  "auditProfileId": "onym:audit-profile:attestation-v1",
  "methodologies": [
    {
      "class": "security-review",
      "specification": "<hash-or-url-of-published-methodology>",
      "scopesOffered": ["<seat-and-technology-scopes>"]
    }
  ],
  "independencePolicy": "<hash-or-url: conflicts, ownership, recusal rules>",
  "unsolicitedPolicy": "<hash-or-url: disclosure, embargo, and contact rules, or none>",
  "liability": "<hash-or-url-of-engagement-liability-terms>",
  "statusEndpoint": "<attestation-freshness-and-revocation-endpoint>",
  "offers": ["<engagement-fee-offer-ids>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<auditor-signature>"
}
```

The manifest is the auditor's standing claim about itself. Like a
registry's policy or a bank's regulatory self-declaration, it is signed and
auditable, not self-proving: an auditor's competence is established by its
published methodologies, its track record of attestations, and—
recursively but honestly—what other institutions attest about it.

### 5.3 Audit Order

The engagement contract all parties sign before work begins:

```json
{
  "orderVersion": 1,
  "orderId": "<random-id>",
  "auditor": "onym:component:<auditor-id>",
  "subject": "onym:component:<subject-component-id>",
  "sponsor": "onym:key:<payer-identity>",
  "artifact": {
    "source": "<repository-url-or-archive-hash>",
    "revision": "<commit-or-release-hash>",
    "artifactHash": "<build-hash-when-applicable>"
  },
  "methodologyClass": "security-review",
  "scope": "<hash-or-url: precise inclusion and exclusion list>",
  "disclosure": {
    "findingsToSubjectFirst": true,
    "embargoDays": 90,
    "attestationPublication": "public-on-issuance",
    "failPublication": "public-after-embargo"
  },
  "timeline": {"start": "2026-08-01", "reportDue": "2026-10-01"},
  "fee": {"model": "fixed-verdict-independent", "offerId": "<offer-id>"},
  "signatures": ["<auditor>", "<subject>", "<sponsor>"]
}
```

Normative constraints:

1. **Fees are verdict-independent.** No bonus for `clear`, no forfeiture on
   `fail`. Contingent-verdict pricing is nonconforming, full stop.
2. **Scope is exact and content-addressed** before work begins; scope creep
   or shrinkage is a signed order amendment, not an editorial decision in
   the report.
3. **Disclosure terms are declared up front**, including whether and when a
   `fail` result becomes public, and the embargo protecting responsible
   disclosure of exploitable findings.
4. **The subject's cooperation duties** (artifact access, environment,
   questions answered) are part of the order; obstruction converts the
   result to `inconclusive` with the obstruction noted, not to silence.

### 5.4 Attestation

The seat's product:

```json
{
  "attestationVersion": 1,
  "attestationId": "<random-nonreusable-id>",
  "auditor": "onym:component:<auditor-id>",
  "subject": "onym:component:<subject-component-id>",
  "artifact": {
    "source": "<repository-url-or-archive-hash>",
    "revision": "<commit-or-release-hash>",
    "artifactHash": "<build-hash-when-applicable>"
  },
  "methodologyClass": "security-review",
  "methodology": "<hash-of-methodology-version-applied>",
  "scope": "<hash-of-examined-scope>",
  "exclusions": "<hash-or-inline-list-of-what-was-not-examined>",
  "result": "findings-noted",
  "severityScale": "<hash-or-url-of-named-ordered-severity-scale>",
  "severityFloor": "medium",
  "findingsReport": "<content-address-or-null-under-embargo>",
  "findingsSummary": {"critical": 0, "high": 1, "resolved": 1},
  "engagement": "commissioned",
  "sponsor": "onym:key:<payer-identity>",
  "relationships": "<declared-conflicts-or-none>",
  "orderRef": "<hash-of-audit-order-or-null-when-unsolicited>",
  "issuedAt": "2026-10-01T00:00:00Z",
  "expiresAt": "2027-10-01T00:00:00Z",
  "supersedes": "<prior-attestation-id-or-null>",
  "status": "<freshness-endpoint-or-epoch>",
  "signature": "<auditor-signature>"
}
```

Normative constraints:

1. The attestation binds **exact hashes**. It says nothing about any other
   revision, build, fork, or deployment of the same name.
2. `scope` and `exclusions` together are the complete statement of what was
   and was not examined; a relying party reading only the result class must
   not be more reassured than one reading the full scope.
3. `result` classes mean: `clear`—nothing in scope found at or above
   `severityFloor` on the named `severityScale`; `findings-noted`—issues
   found, enumerated, possibly resolved; `fail`—the artifact did not meet
   the scope's stated bar; `inconclusive`—examination could not complete,
   with the reason. `severityScale` names the ordered scale that
   `severityFloor` and the `findingsSummary` buckets use; a `clear` or
   `findings-noted` result without both fields is nonconforming, because a
   relying party could not compare it.
4. `sponsor` and `relationships` make the money and conflicts visible in
   the object itself, not in a footnote elsewhere.
5. `expiresAt` is mandatory for the judgment classes (`security-review`,
   `privacy-review`, `conformance-run`, `availability-measurement`), whose
   opinions age with the threat landscape, suite versions, and measurement
   windows. A `build-provenance` attestation may set it to null: it
   records a reproduction event over fixed bytes, which does not age—
   though it remains revocable like any attestation.

### 5.5 Supersession and revocation

An auditor may supersede (new attestation, `supersedes` set—typically after
re-examination or fix verification) or revoke:

```json
{
  "revocationVersion": 1,
  "attestationId": "<attestation-id>",
  "auditor": "onym:component:<auditor-id>",
  "issuedAt": "2026-11-15T00:00:00Z",
  "statusEpoch": 42,
  "effectiveFrom": "2026-11-15T00:00:00Z",
  "reason": "methodology-error | new-information | compromise-of-auditor-key | withdrawal",
  "detail": "<hash-or-url-or-null>",
  "signature": "<auditor-signature>"
}
```

Revocation is the auditor's unilateral right and duty: an attestation the
auditor no longer stands behind must not keep circulating with its
signature.

The status endpoint serves a **signed status list**: a timestamped document
with a monotonically increasing `statusEpoch` covering the current status of
every unexpired attestation the auditor has issued. Clients enforce epoch
monotonicity—a status answer carrying a lower epoch than one already seen
is a rollback and is rejected—and treat a list older than the profile's
freshness bounds as *stale*, never as `active`. Because the list covers all
of an issuer's attestations at once, a subject, Discovery provider, or another
provider can
**staple** the latest signed list alongside a component manifest, letting
relying clients verify current status without contacting the auditor at
selection time. Clients apply these freshness rules before high-stakes
reliance, exactly as they do for registry records.

### 5.6 Findings report

The report is content-addressed, referenced from the attestation, and
released per the order's disclosure terms. Under embargo, the attestation
may circulate while `findingsReport` is null and `findingsSummary` carries
severity counts only—reliers know something was found and its weight,
without a public exploit map. After the embargo, the hash link makes the
published report tamper-evident. A report that never becomes public in a
`public-after-embargo` order is a disclosure-term violation attributable to
whoever withheld it.

### 5.7 Unsolicited attestations

Independent research needs a conforming carrier: if every attestation
required the subject's order signature, every component owner would hold a
veto over being examined at all—the mirror image of the gatekeeping this
seat refuses—and unsolicited security research would remain the unsigned
rumor this seat exists to replace. An attestation may therefore issue
without an order when all of the following hold:

1. `engagement` is `"unsolicited"`, `orderRef` is null, and the scope
   states that subject cooperation was none;
2. the examined artifact is publicly available exactly as hashed—private
   artifacts cannot be examined uninvited;
3. disclosure follows the auditor's published `unsolicitedPolicy`, which
   must include a responsible-disclosure embargo for exploitable findings
   and a documented attempt to reach the subject through its published
   security contact before publication;
4. the sponsor, if any, is named as in any attestation; and
5. the subject has a right of reply: a signed `SubjectResponse` referencing
   the attestation, which the auditor's status endpoint must serve
   alongside it and conforming clients display with it.

Obstruction semantics do not apply—an uncooperative subject owes an
uninvited examiner nothing, and `inconclusive` here means only that the
public artifact did not suffice. Offering to withhold, soften, or delay an
unsolicited attestation in exchange for payment is nonconforming
(extortion)—the sharpest case of the rule that neither verdicts nor
silence are for sale.

## 6. Common audit surface

| Operation | Input | Result |
|---|---|---|
| `offer-engagement` | Methodology class, scope request | Fee offer, timeline, disclosure defaults |
| `accept-order` | Signed `AuditOrder` | Engagement begins |
| `issue-attestation` | Completed examination | Signed `Attestation`, report per disclosure terms |
| `supersede-attestation` | New examination of successor artifact | New attestation with `supersedes` |
| `revoke-attestation` | Auditor decision with reason | Published revocation |
| `query-status` | Attestation ID, or none for the full signed status list | Status-list entry: `active`, `superseded`, `revoked`, `expired` |
| `verify` | Attestation + auditor manifest + target manifest | Local match/no-match decision |

`verify` is local and mechanical: signature valid, auditor manifest
current, and—decisively—the attestation's artifact hashes equal to the
hashes in the component manifest the client is actually about to use.
Anything less than exact equality is a non-match.

## 7. Relying client obligations

A conforming UI or application must:

1. verify auditor signature, attestation status, expiry, and exact artifact
   match before displaying any attestation as applying to a component;
2. display the issuer, methodology class, scope, result class, sponsor, and
   age—an attestation renders as "*who* attested *what*, *how*, *paid by
   whom*," never as a bare checkmark;
3. render a hash mismatch as **no attestation** for the component at hand
   (with an optional note that another revision was attested), never as a
   degraded pass;
4. render absence as absence: an unattested component is unattested, not
   failed, and remains directly importable per whitepaper §15.1;
5. render `fail` and `findings-noted` results when published—hiding adverse
   attestations while showing favorable ones from the same issuer is
   nonconforming curation;
6. apply freshness rules before purchase, group-creation, custody, and
   other high-stakes selections;
7. let users choose which auditors they credit, as they choose registries
   and Discovery providers, without a hardcoded mandatory issuer; and
8. prefer stapled status lists or full-list retrieval over per-attestation
   queries: a `query-status` call for one attestation ID tells the auditor
   exactly which component the user is about to rely on, so per-ID queries
   are a disclosed last resort, not the default path.

Attestation summaries, scope text, and report URLs are untrusted input.
They must not execute code or impersonate client UI.

## 8. Auditor obligations

A conforming auditor must:

1. publish and follow its manifest: methodologies, independence policy,
   liability terms, offers, and status endpoint;
2. examine what the order binds—exact artifact, exact scope—and attest
   nothing broader than it examined;
3. price verdict-independently and state the sponsor and relationships in
   every attestation;
4. refuse engagements its independence policy forbids, and recuse from
   subjects it owns, operates, or competes with, unless disclosed and
   accepted by the sponsor in the order;
5. protect embargoed findings, disclose them per the order's terms, and
   never trade on them;
6. issue `inconclusive` rather than silence when an engagement cannot
   complete, and `fail` rather than a quiet non-issuance when the order's
   publication terms say so—an auditor's silence must not be purchasable
   after the fact;
7. maintain its status endpoint and revoke attestations it no longer
   stands behind, including after auditor key compromise;
8. keep examination access bounded to the engagement: artifact and
   environment access is not a license to retain subject secrets,
   credentials, or unrelated data; and
9. state its own limits: an attestation is professional judgment under a
   methodology at a point in time, and its manifest's liability terms say
   what the auditor answers for when judgment fails.

## 9. Subject and sponsor obligations

- The subject provides the bound artifact honestly—attested source must be
  the shipped source, which is what `build-provenance` attestations exist
  to check—and cooperates per the order.
- The subject may commission re-examination after fixes; it may not demand
  un-issuance of honest results beyond the disclosure terms it signed.
- A sponsor funding audits of components it did not author (a foundation's
  commons program, a Discovery provider raising its bar) gains attribution in
  the attestation and nothing else: no findings pre-approval, no verdict
  influence, no early exploit access beyond the order's disclosure terms.
- **Verdict shopping** — commissioning serial engagements and publishing
  only the favorable one — is constrained, not prevented: conforming
  auditors publish per their signed disclosure terms (including `fail`
  results where the order says so), and relying parties may weigh an
  attestation more by what its issuer's terms would have published had it
  gone badly. The boundary makes selective silence expensive and
  detectable, not impossible.

## 10. Discovery and attestations

A Discovery provider's inclusion policy may cite attestation requirements. A
conforming citation names accepted issuers (or issuer criteria), required
methodology classes and scopes, and maximum age. The provider remains a
replaceable curator under the
[Discovery contract](../discovery/Discovery.md): it adopts attestations as
visible inputs; it neither issues them under this seat nor gains any power to
make an unattested component invalid. A Discovery provider that also operates
an audit seat, or accepts payment from subjects it lists, discloses those
conflicts in its own policy.

## 11. Payment at the audit boundary

Auditors publish engagement offers as `SeatOffer`s: fixed-fee reviews,
per-suite conformance runs, measurement subscriptions, retainer programs.
Settlement follows the whitepaper's ordinary seat-payment model; store
channels are unlikely for institutional engagements but nothing forbids
them.

The invariant is direction-of-payment transparency plus verdict
independence: payment buys examination effort under a methodology; it
cannot buy a result class, an early un-embargoed exploit, suppression of a
signed attestation, or display priority in conforming clients. Commons
funding (a foundation buying audits of widely used components, per roadmap
Phase 3) uses the same order object with the foundation as sponsor—
attributed, conflict-checked against its own board rules, and without
co-signing the findings.

## 12. Errors and lifecycle

| Error | Origin | Response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse; explain required profile |
| `scope_unavailable` | Auditor | Decline engagement; no partial silent scope |
| `artifact_mismatch` | Verification | Attestation does not apply; render as absence |
| `attestation_expired` | Time | Render as expired; prompt re-examination interest |
| `attestation_revoked` | Status endpoint | Stop displaying; show reason class |
| `attestation_superseded` | Status endpoint | Re-resolve; display successor |
| `status_unavailable` | Network/auditor | Apply the cached signed status list within freshness bounds and epoch monotonicity; degrade honestly |
| `order_breached` | Any party | Surface as the signed order's dispute matter, not a protocol event |
| `obstruction` | Subject | `inconclusive` result with obstruction noted |
| `issuer_untrusted` | Relying party policy | Display attestation as from an uncredited issuer, or omit per user policy |

Attestation lifecycle:

```text
order_signed
  -> examination
  -> report_drafted (disclosure terms govern)
  -> issued: clear | findings-noted | fail | inconclusive
  -> active
       -> superseded (new artifact or re-examination)
       -> revoked   (auditor withdrawal, with reason)
       -> expired
```

Both exits from `active` besides expiry are the auditor's unilateral acts;
no subject, sponsor, or Discovery provider can revoke or extend an attestation
it did not sign.

## 13. Security and privacy invariants

1. **Attestations bind bytes, not brands.** Exact source revision and
   artifact hash; nothing is inherited by other builds, forks, or names.
2. **The issuer is always visible.** Every rendered attestation shows who
   judged, under what methodology, at whose expense.
3. **Scope is the whole claim.** What was excluded travels with what was
   examined; a result class never outruns its scope.
4. **Absence is not failure, and attestation is not permission.** Direct
   use needs no auditor; no client, Discovery provider, or auditor can convert this
   seat into licensure.
5. **Verdicts are not for sale.** Fees are verdict-independent; sponsors
   are named; conflicts are declared in the attestation itself.
6. **Opinions expire and can be withdrawn.** Judgment classes carry
   mandatory expiry, provenance facts remain revocable, and epoch-monotonic
   signed status lists make rollback of a revocation detectable.
7. **Mismatch means silence.** An attestation for other bytes never
   decorates the component at hand.
8. **Adverse results are as visible as favorable ones**, per the signed
   disclosure terms—selective display is nonconforming wherever it occurs.
9. **Embargoes protect users, not reputations.** Delay windows exist for
   responsible disclosure; suppression past the signed terms is a breach
   with a named breacher.
10. **Examination access is bounded.** Auditors keep engagement materials
    confidential, retain no subject credentials, and gain no standing over
    anything they did not examine.
11. **The seat composes with itself.** Auditors can be subjects: their
    tooling, methodology conformance, and key handling are attestable by
    other auditors, and nothing makes any issuer final.
12. **Consent is not a veto.** Public artifacts are examinable uninvited
    under the unsolicited form's disclosure duties, with the subject's
    signed reply served alongside; paying for suppression is as
    nonconforming as paying for a verdict.

## 14. Versioning and conformance

- `AuditProfile` changes when operation, result-class, or freshness meaning
  changes; methodology classes are additive capabilities.
- Auditor manifests change on methodology, policy, liability, or key
  changes; auditor key rotation republishes the status endpoint's trust
  root and is surfaced to relying parties.
- Attestations are immutable once signed; corrections are supersessions or
  revocations, never edits.
- Cross-platform fixtures cover: attestation canonical encoding and
  signature verification; exact-hash matching including near-miss vectors
  (right repo, wrong revision; right revision, wrong build); expiry,
  supersession, and revocation display decisions; status-list epoch
  monotonicity, rollback rejection, and stapled-status verification;
  unsolicited-form validation and subject-response display;
  embargoed-report handling;
  sponsor and conflict rendering; absence-vs-fail rendering; and
  issuer-trust filtering.
- A relying client, an auditor, and a Discovery provider from three different
  authors must interoperate using only published profiles and fixtures.

## 15. Concrete implementation profiles

No concrete profile exists yet. The natural first profile is
`conformance-run` attestation over the conformance suites the roadmap's
Phase 1 creates: it is the most mechanical methodology class (suite
version + artifact hash + pass/fail evidence), needs the least professional
judgment to verify, and exercises the full object lifecycle. `security-review`
and `build-provenance` profiles follow once report-format and
reproducibility conventions are fixed.

## 16. Acceptance criteria

The audit seat is successfully specified when:

1. an institution can publish a manifest, take an order, and issue an
   attestation that any conforming client verifies and correctly matches—
   or refuses to match—against a component manifest, using published
   profiles and fixtures alone;
2. no path exists by which an attestation's absence blocks direct manifest
   import, or by which any issuer becomes mandatory;
3. every rendered attestation exposes issuer, scope, exclusions, sponsor,
   relationships, result, and age;
4. a new release of an attested component displays as unattested until
   re-examined;
5. revocations and supersessions propagate to relying clients within the
   profile's freshness bounds;
6. adverse results published under signed disclosure terms are rendered
   wherever favorable ones would be;
7. verdict-contingent fee arrangements are expressible nowhere in the
   conforming objects;
8. an unsolicited attestation of a public artifact verifies and displays
   like any other, with the subject's signed response beside it and no
   subject signature required anywhere; and
9. two auditors can attest the same artifact under different methodologies
   and both attestations display side by side without either becoming
   final.

## 17. Justification in one sentence

> The audit seat turns "trust us, it's audited" into a signed, expiring,
> revocable claim about exact bytes by a named institution at a disclosed
> payer's expense—so every other seat's trust story gains an accountable
> author without anyone gaining a gate.

## References

1. Onym system whitepaper, §3.5, §3.7, §9.2, §15, §17.10, §19:
   [../WHITEPAPER.md](../WHITEPAPER.md)
2. Onym association naming proposal (claim/issuer display pattern) —
   forward reference to `association/Association-Naming.md`, an unmerged
   draft on the `worktree-association-naming` branch
3. SLSA, “Supply-chain Levels for Software Artifacts”:
   <https://slsa.dev/spec/>
4. in-toto attestation framework:
   <https://github.com/in-toto/attestation>
5. Reproducible Builds project:
   <https://reproducible-builds.org/>
6. IETF RFC 9116, “A File Format to Aid in Security Vulnerability
   Disclosure” (security.txt):
   <https://www.rfc-editor.org/rfc/rfc9116>
7. ISO/IEC 17029, “Conformity assessment — General principles and
   requirements for validation and verification bodies”:
   <https://www.iso.org/standard/29352.html>
