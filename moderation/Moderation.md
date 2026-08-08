---
status: draft
proposed: Claude & @rinat-enikeev
date: 08.08.2026
---

# Onym Moderation Authority Contract Boundary

**Proposal draft 0.4 — August 2026**

> A moderation authority decides published violation classes over users who
> consented to its mandate before any case existed. Its verdicts are
> executed mechanically by the interface that carries them, reach exactly
> one device and the identities named in the case, and expire or fall to
> appeal on the schedule the user could read before agreeing.

This document proposes the technology-neutral boundary for the
**moderation seat**: the institutional service that receives signed reports
of prohibited content or behavior (child sexual abuse material, credible
violence, and the other classes its manifest declares), conducts a case
with notice and a response window, and issues signed verdicts that a
conforming interface executes as **device marks** — durable per-device
state such as Apple DeviceCheck bits or Android Play Integrity device
recall values — and as identity refusals inside that interface.

The seat exists because the interface seat cannot ship without it: every
major distribution channel requires user-generated-content applications to
provide reporting, blocking, and abuser removal. Onym accepts the
requirement and refuses its usual shape — a hidden trust-and-safety desk
inside the app vendor with unreviewable power. Moderation here is a
**separately owned, competing, consent-bound seat** whose entire authority
is enumerated in this contract.

This document is the abstract contract. It defines what must be bound,
validated, and enforced without choosing a device-attestation vendor or client
architecture. The merged `onym-moderation` reference defines the concrete v1
wire shapes and implemented lifecycle recorded in §13; it does not waive the
MUSTs in this document. An implementation gap is reported as a gap, not turned
into a weaker cross-platform contract, and an implementation detail becomes
normative only where this document explicitly adopts it as the v1 wire form.

Two scope statements up front:

1. **This is an interface-layer sanction, not a protocol one.** A banned
   device cannot use the interfaces that consented users selected; the
   underlying protocol remains open, and a determined abuser with custom
   software is out of this seat's reach. The seat removes abuse from the
   surfaces people actually use and raises its cost everywhere else; it
   does not claim to expel anyone from an open protocol, and manifests
   must not pretend otherwise.
2. **The moderation authority is not a court of the protocol.** It has no
   standing over users who never accepted its mandate, no power over other
   seats' state, no protocol-wide blacklist, and no authority to amend the
   contracts under which existing groups operate. Where conduct is also a
   crime, lawful reporting obligations to real authorities are untouched
   and outrank everything in this document.

## 1. Decision

Onym treats the reporter, the moderation authority, the interface, the
device-mark platform, and the accused as independently owned components
joined by versioned interfaces.

- The **user** consents at onboarding to the moderation authority (or
  authorities, by violation class) named in the interface's manifest. The
  mandate is signed before any case exists — consent precedes the
  conflict, exactly as an arbitration clause precedes its dispute
  ([../arbitration/Arbitration.md](../arbitration/Arbitration.md) §3.2).
- The **reporter** is a user who received or witnessed violating content
  and chooses to disclose it. Disclosure is voluntary, comes from the
  reporter's own device, and carries cryptographic proof of authenticity.
  Nothing in this seat weakens end-to-end encryption to make reporting
  possible.
- The **moderation authority** owns its procedure, violation-class
  definitions, professional judgment, and reputation. It sells case
  disposition under its published manifest. Anyone may operate one;
  authorities compete for selection by interfaces and their users.
- The **interface** is the enforcement rail. Its vendor holds the only
  write path to the device-mark platform (the platform scopes marks to
  the app vendor's credentials), and it executes valid verdicts
  mechanically — it adds no judgment. A mark write may wait for the target
  device's next attested session.
- The **device-mark platform** (Apple DeviceCheck, Google Play Integrity
  device recall) is durable per-device storage attested by the platform
  vendor. It stores two states this contract defines; it judges nothing.
- The **accused** holds identity keys and a device. They receive notice,
  a response window, a reasoned verdict, and a declared appeal path.

One organization may occupy several roles, but the profile does not merge
their authority: an interface vendor that also operates a moderation
authority discloses this in both manifests, and its verdicts remain
subject to every constraint here — the merged organization gains no
shortcut past notice, reasoning, expiry, or appeal.

The boundary has five interfaces:

1. the **mandate** interface: how a user consents to a named authority's
   published manifest at onboarding, before any case exists;
2. the **report** interface: how a reporter files signed, voluntarily
   disclosed evidence;
3. the **case** interface: notice, response, evidence, decision deadline;
4. the **verdict** interface: the signed object that dismisses, marks, or
   bans — with reasoning, duration, and appeal path; and
5. the **enforcement** interface: how a verdict becomes exactly two
   device-mark states and an identity refusal inside consenting
   interfaces, and nothing else.

§6 maps these five logical interfaces onto the authority's three wire facets
and references the separately owned interface-enforcement profile; it does not
collapse their responsibilities.

## 2. What the moderation seat does

A conforming moderation authority can:

1. publish a signed manifest declaring its violation classes, per-class
   procedure and ban terms, evidence rules, decision timelines,
   confidentiality policy, fee offers, and appeal path;
2. accept designation by interfaces whose users may consent to its published
   manifest at onboarding, and register the resulting user-signed,
   interface-countersigned mandates without adding an authority signature;
3. receive signed `Report` objects from consented users, weighted by the
   reporter's authority-local track record;
4. open a case, serve notice to the accused through the interface, and
   hold the response window its manifest declares;
5. issue a signed, reasoned `Verdict` — case opening (interim), dismissal,
   or ban — within the decision deadline;
6. conduct the declared ordinary, external-appellate, and new-holder review
   paths, including signed reversal verdicts; and
7. answer authenticated status queries within its confidentiality rules and
   publish the anonymized statistics its manifest promises.

It does not solicit reports, monitor content, scan devices, hold keys,
read anything a reporter did not disclose, ban outside its consented
population, write device marks itself, maintain a protocol-wide
blacklist, or acquire jurisdiction over anyone by deciding one case well.

## 3. Why this boundary is necessary

### 3.1 Distribution requires moderation; moderation must not require a master

App store review guidelines make reporting, blocking, and abuser removal
a condition of distributing any user-generated-content application. An
interface without this seat does not ship. The conventional answer — the
vendor's own opaque enforcement desk — concentrates exactly the power
Onym exists to separate: one party naming the user, presenting the
interface, and deciding who may exist on the network. This contract
supplies the required function as a bounded, replaceable, consent-bound
seat instead.

### 3.2 Consent must precede the case

A moderator imposed after the offense is chosen by the accuser. The
mandate is signed at onboarding, when the user is nobody's accused and
nobody's accuser: which authority, which violation classes, what
procedure, what ban terms, what appeal. After signing, neither the
interface nor the authority can swap the rules for existing users without
fresh consent. A user who dislikes an authority's record chooses an
interface that names a different one — that market choice is the
system's check on moderation power.

### 3.3 Identity bans are free to evade; device marks are not

Identity keys cost nothing to mint, so a key-only ban invites instant
reincarnation. Platform device marks survive app reinstallation and are
designed by the platform vendors to survive device resets — a
persistence claim each implementation profile must verify and disclose
rather than assume — making the cheapest reliable evasion path cost a
physical device. That is also why the sanction is grave: a device mark punishes hardware
that may later carry a different, innocent person. The contract answers
with the tightest bounds in this repository — declared durations, mandatory
appeal and new-holder review, and a dismissal default that does not depend on a
silent Authority returning.

### 3.4 Evidence must not become surveillance

End-to-end encryption is load-bearing for every other seat. The only
conforming evidence is what a **recipient** of the content voluntarily
discloses from their own device, with proof the accused actually
authored it — a sender signature or envelope commitment the disclosed
plaintext verifies against. The authority sees single messages that one
party to the conversation chose to reveal; it never sees mailboxes,
keys, or anything undisclosed. Report thresholds, scanning obligations,
or client-side detection are nonconforming per se.

### 3.5 Undecided must be a defined outcome

Authorities fail: they vanish, stall, or are compromised. If a stalled case
leaves a device marked indefinitely, the authority has acquired hostage power
the seat must not hold. Every case therefore carries a decision deadline from
the manifest, and the default disposition at the deadline is **dismissal with
the case mark cleared**.

The merged reference enforces the no-late-ban half and emits a signed dismissal
when its deadline sweep runs. Its Interface has no independent default, so
permanent Authority disappearance can still strand `case-open`. That is a
conformance gap, not a different abstract outcome.

## 4. Logical topology

```text
Reporter ── signed Report ───────────────────────> Authority
Accused  ── signed response / appeal / status ──> Authority
Interface ─ finalized countersigned mandate ────> Authority
Authority ─ signed verdict + pinned manifest ───> Interface
Interface ─ notice / ban state through gate ────> Accused device
Interface ─ device-mark read / write ───────────> Device-mark platform

The interface also refuses the verdict's named identity keys on its own
surfaces while the ban is in force.

No authority case opens until the finalized mandate is registered. Marks move
from stored verdicts; deployments must enable authority-signature enforcement,
although the reference Apple service defaults it off. An overdue open case
becomes a signed default dismissal when the Authority sweep runs.
```

## 5. Boundary objects

### 5.1 Moderation Profile — authority surface

```json
{
  "profileVersion": 1,
  "profileId": "onym:moderation-profile:consent-bound-v1",
  "interface": "onym-moderation-v1",
  "surfaces": {
    "authorityClient": [
      "file-report",
      "respond",
      "appeal",
      "query-status"
    ],
    "interfaceToAuthority": [
      "register-mandate"
    ],
    "authorityToInterface": [
      "deliver-verdict"
    ]
  },
  "interfaceEnforcementProfileId": "onym:moderation-enforcement-profile:device-mark-v1",
  "mandateSchema": "onym-moderation-mandate-v1",
  "mandateReceiptSchema": "onym-moderation-mandate-receipt-v1",
  "reportSchema": "onym-moderation-report-v1",
  "reportReceiptSchema": "onym-moderation-report-receipt-v1",
  "caseResponseSchema": "onym-moderation-case-response-v1",
  "appealSchema": "onym-moderation-appeal-v1",
  "caseStatusSchema": "onym-moderation-case-status-v1",
  "verdictSchema": "onym-moderation-verdict-v1",
  "verdictSubmissionSchema": "onym-moderation-verdict-submission-v1",
  "verdictReceiptSchema": "onym-moderation-verdict-receipt-v1",
  "errorSchema": "onym-moderation-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

This is the profile an authority implements and its manifest references.
`authorityClient` contains requests a user initiates toward the authority.
`interfaceToAuthority` registers the exact finalized mandate after the
interface countersigns it. `authorityToInterface` delivers signed interim and
terminal verdicts to the enforcement rail. Device enrollment, mandate
countersigning, gate checks, mark writes, and app gating are not operations in
this authority profile: they belong to the separately versioned
`interfaceEnforcementProfileId` implemented by the interface vendor. Sharing a
deployment or transport never erases which key and role authorize an operation.
`CaseNotice` belongs to the referenced enforcement profile because it is a
gate projection produced by the interface, not an object crossing an authority
wire. The earlier monolithic `operations`/`markStates` shape was an unpublished,
undeployed draft. This replacement is wire-incompatible with that draft even
though it retains `consent-bound-v1`/version 1; validators must reject the old
shape rather than silently interpreting it as `surfaces`. Reusing version 1 is
safe only because there were no deployed consumers or persisted profile
objects. Any further incompatible change bumps the version normally.

### 5.2 Authority Manifest

```json
{
  "version": 1,
  "componentId": "onym:component:<authority-id>",
  "seat": "moderation",
  "operator": "onym:key:<authority-identity>",
  "moderationProfileId": "onym:moderation-profile:consent-bound-v1",
  "modelProfile": {
    "id": "gpt-oss-safeguard-20b",
    "digest": "<sha256-of-published-model-profile>"
  },
  "violationClasses": [
    {
      "classId": "csam",
      "definition": "<hash-or-url: exact prohibited-content definition>",
      "responseWindow": "P3D",
      "decisionDeadline": "P7D",
      "banTerm": "permanent",
      "appealWindow": "P30D",
      "appealEffect": "non-suspensive",
      "lawfulReporting": "<hash-or-url: statutory reporting the authority performs>"
    },
    {
      "classId": "credible-violence",
      "definition": "<hash-or-url>",
      "responseWindow": "P7D",
      "decisionDeadline": "P14D",
      "banTerm": "P365D",
      "appealWindow": "P30D",
      "appealEffect": "non-suspensive"
    },
    {
      "classId": "unsolicited-pornography",
      "definition": "<hash-or-url>",
      "responseWindow": "P7D",
      "decisionDeadline": "P14D",
      "banTerm": "P90D",
      "appealWindow": "P30D",
      "appealEffect": "suspensive"
    }
  ],
  "evidenceRules": "<hash-or-url: disclosure and authenticity requirements>",
  "reputationPolicy": "<hash-or-url: how reporter track records weight intake>",
  "newHolderAppeal": "<hash-or-url: procedure for a device's new owner>",
  "appellate": "onym:component:<external-appellate-authority-id>",
  "interfaceAffiliations": ["onym:component:<affiliated-interface-id>"],
  "confidentiality": "<hash-or-url: what is published, what stays private>",
  "statistics": "<hash-or-url: promised anonymized transparency reporting>",
  "offers": ["<fee-offer-ids>"],
  "validUntil": "2027-06-30T23:59:59Z"
}
```

The JSON above is the manifest body, not a self-signing envelope. In the
current `consent-bound-v1` asset realization, the designating interface
publishes an authority directory entry containing the authority's `componentId`,
manifest URL, and pinned Ed25519 operator key. The authority publishes a
detached signature at `<manifest-url>.sig` over the **exact manifest
response bytes**. The interface verifies that signature against the
directory-pinned key, requires the decoded `componentId` and `operator` to
match the directory entry, and computes `manifestHash` as lowercase
hexadecimal SHA-256 over those same exact bytes. A future transport may
carry the signature in another envelope, but it must preserve these
bindings and define its byte representation before claiming conformance.

Normative constraints:

1. every class declares five terms — response window, decision deadline,
   ban term, appeal window, and appeal effect (`suspensive`: the ban does
   not execute until `appealDeadline`; filing an appeal does not move that
   timestamp; `non-suspensive`: the ban executes at once and appeal can only
   reverse it); a class missing any of them is invalid at mandate
   validation;
2. `banTerm` is `permanent` or a declared duration. A permanent term is valid
   only where the class definition justifies it and `appellate` names a
   well-formed, non-empty `onym:component:` reference to an authority other than
   the issuer. The permanent ban remains appealable there for as long as it is
   in force, not merely during the ordinary appeal window;
3. `newHolderAppeal` is mandatory: every authority publishes how a person who
   acquires a marked device can obtain review without the former holder's key;
4. an authority that permits model-assisted or autonomous decisions declares
   `modelProfile`. Its digest binds the published model repository/revision,
   prompt, output adapter, thresholds, class mapping, and invalid-output
   behavior. Replacing any of those terms requires a new manifest and fresh
   consent; a human-only authority omits the field;
5. class definitions are content-addressed: a user consents to exact
   wording, and the authority cannot edit the definition under existing
   mandates;
6. an authority operated by or affiliated with an interface vendor lists every
   such interface in `interfaceAffiliations`; omitting a material affiliation
   is nonconforming. An unaffiliated authority omits the field or publishes an
   empty list;
7. `validUntil` bounds the authority's power to accept new mandates and open
   new cases, not to finish live process. Cases opened before expiry proceed to
   their fixed deadlines. A lapse without renewal or declared succession makes
   the designation defunct and invokes §5.7's bounded failure procedure; and
8. authenticity and consent bind one byte artifact: the manifest fields
   used to derive mandate classes, the bytes whose hash the mandate pins,
   the bytes authenticated by the authority, and the bytes retained for
   later display and verdict validation are the same artifact. Pairing the
   decoded fields of one manifest with the bytes of another is
   nonconforming.

**Merged-reference status.** `onym-moderation` main treats `appellate`,
`newHolderAppeal`, and `interfaceAffiliations` as optional/unvalidated
metadata; it records local appeals and unauthenticated new-holder claims, but
has no external-appellate router or designation-revocation protocol. It permits
configured triage without a manifest `modelProfile` after a startup warning;
when the field is present, cases are bound to it. It does enforce the concrete
`validUntil` intake boundary: the published and
mandate-pinned manifests must be live for registration and new case intake,
while already-open cases continue. The missing checks and routes are
conformance gaps; they do not relax constraints 2, 3, 4, 6, or 7.

### 5.3 Moderation Mandate

Signed by the user at onboarding, countersigned by the interface:

```json
{
  "mandateVersion": 1,
  "user": "onym:key:<user-identity>",
  "interface": "onym:component:<interface-id>",
  "authority": "onym:component:<authority-id>",
  "manifestHash": "<hash-of-authority-manifest-consented-to>",
  "classes": ["csam", "credible-violence", "unsolicited-pornography"],
  "deviceBinding": "<platform-scoped-device-reference>",
  "acceptedAt": "2026-08-06T00:00:00Z",
  "signatures": ["<user>", "<interface>"]
}
```

Normative constraints:

1. the interface presents one authenticated manifest snapshot — classes,
   terms, appeal paths, and its computed hash — before signing, with the
   same prominence its own contract requires for economics disclosures
   ([../interface/Interface.md](../interface/Interface.md) §7). The
   implementation retains that reviewed artifact across the user's
   decision and passes it to signing; it must not fetch the manifest again
   when the user agrees. If the authority changes the hosted file during
   review, the new bytes require a new review;
2. only the validation boundary that authenticated the manifest may mint
   the reviewed-consent artifact accepted by the signer. A caller-created
   pair of decoded fields and raw bytes is not a consent artifact, even if
   its types look structurally identical;
3. the mandate binds the user only for the classes and manifest hash it
   names; manifest changes bind new mandates, never existing ones;
4. `deviceBinding` is a platform-scoped reference (the profile defines
   it); it lets a verdict name the device without creating a global
   device identifier;
5. a mandate binds one identity–device pair: a user running the
   interface on several devices signs one mandate per device, and a
   case names the mandate(s) whose devices the evidence concerns —
   device marks reach only the devices so named, while the identity
   refusal in a ban verdict covers the named keys on every surface of
   the consenting interface for the ban's duration;
6. the interface countersigns the exact user-signed mandate. A
   countersigning service returns only its signature (or an equivalently
   immutable envelope); it cannot replace mandate fields and ask the
   client to persist the rebuilt object;
7. signed consent becomes usable authority jurisdiction only after the
   finalized mandate is registered. A signed but unregistered mandate remains
   the user's consent artifact, but the authority has no row from which it can
   verify jurisdiction and therefore refuses reports about that user. The
   interface must retry registration and keep enrollment fail-closed; and
8. the reference exposes no mandate withdrawal or deregistration operation.
   Once registered, the mandate remains in the Authority store and can support
   new cases while its pinned manifest is live. Uninstalling or ceasing gate
   sessions neither revokes jurisdiction nor clears marks; it can prevent a
   queued device write from reaching that hardware, while identity refusal and
   case processing continue.

### 5.4 Report

```json
{
  "reportVersion": 1,
  "reportId": "<random-id>",
  "reporter": "onym:key:<reporter-identity>",
  "reporterMandate": "<hash-of-reporter's-mandate>",
  "accused": "onym:key:<accused-identity>",
  "classId": "unsolicited-pornography",
  "evidence": [
    {
      "disclosedContent": "<the specific message or media, from the reporter's device>",
      "authenticityProof": "<sender-signature-or-envelope-commitment binding content to accused key>",
      "context": "<hash-or-inline: conversation context the reporter chooses to add>"
    }
  ],
  "filedAt": "2026-08-06T00:00:00Z",
  "signature": "<reporter-signature>"
}
```

Normative constraints:

1. every evidence item verifies against the accused's key — content
   without an authenticity proof is a complaint, not evidence, and
   cannot alone support a verdict;
2. the reporter discloses only items they legitimately received; an
   authority that requests broader disclosure ("send us the whole
   conversation") is nonconforming;
3. reports are free to file — no bond, no fee — and carry weight per
   the authority's published reputation policy: a reporter's
   authority-local track record of upheld versus dismissed reports
   produces the `intakeWeight` returned in the receipt. The reference
   authority records that weight but every otherwise valid report opens or
   joins a case; weight does not currently gate intake;
4. reporter identity is visible to the authority, never to the accused
   unless the reporter consents; retaliation against inferred reporters
   is itself a violation class authorities should declare; and
5. jurisdiction follows the accused's mandate and standing follows the
   reporter's: a conforming authority accepts reports only against
   accused who mandated it, and only from reporters whose own mandate
   names it. Abuse arriving from a user of a different interface or
   authority is outside the reporter's authority's reach — the honest
   disposition is refusal (`no_jurisdiction`), with the reporter's
   local remedies (blocking, filtering) remaining interface features
   outside this seat. The reference authority has no forwarding operation. A
   reporter may cite any still-stored mandate registered for their key, while
   accused jurisdiction uses that user's latest active mandate; replaying an
   older mandate does not restore broader classes.

#### 5.4.1 Authority client DTOs

The remaining authority-client schemas are complete boundary objects, not
implementation-local return types:

```json
{
  "reportId": "<same random report ID>",
  "receivedAt": "2026-08-06T00:00:01Z",
  "caseId": "case-<random-id>",
  "intakeWeight": 1.0,
  "responseDeadline": "2026-08-13T00:00:01Z",
  "decisionDeadline": "2026-08-20T00:00:01Z"
}
```

`ReportReceipt` is the reference authority's actual filing result: every valid
report opens or joins a case immediately, so the receipt names that case and
its current deadlines and exposes the authority-local `intakeWeight`. It does
not assert merit. An exact-byte retry returns the same case and deadlines with
`"duplicate": true` and omits `intakeWeight`; reusing `(reporter, reportId)`
for different raw bytes is refused as an attempted rewrite.

There is at most one open case per `(accused, classId)`. A later valid report
joins it. Byte-identical evidence is attached without another notice; distinct
evidence issues a revised open-case verdict, restarts only the response window,
and is refused once the case has emitted eight notices. The decision deadline
fixed at initial opening never moves, and a report arriving after it is refused
rather than reviving the case.

```json
{
  "caseId": "case-<random-id>",
  "statement": "<accused statement>",
  "evidence": [
    {
      "disclosedContent": "<counter-evidence>",
      "authenticityProof": "<signature-or-envelope-commitment>",
      "context": "<optional context>"
    }
  ],
  "signature": "<accused-signature>"
}
```

`CaseResponse.caseId` must equal the routed case ID and is inside the canonical
signed bytes. The reference authority stores the complete raw response, accepts
up to 32 responses while the case remains open, and marks a filing as late when
it arrives after `responseDeadline`; lateness does not discard it. Each
counter-evidence item's proof must verify against the accused key.

```json
{
  "caseId": "case-<random-id>",
  "kind": "appeal | new-holder-claim",
  "statement": "<grounds for review>",
  "signature": "<accused signature for appeal; ignored for new-holder-claim>"
}
```

`AppealSubmission.caseId` likewise equals the routed case ID and is inside the
canonical bytes for an ordinary appeal, whose signature must verify against the
accused identity. Ordinary appeals are accepted only against a ban, within its
appeal window, and are bounded to 32 filings per case.

A `new-holder-claim` is intentionally unauthenticated in the reference
authority: that service does not possess a device-holder proof. It returns the
same successful envelope whether the case exists, is banned, or the claim was
stored; only claims against a ban are recorded, with at most eight stored per
case. Those slots are exhaustible by a stranger. This is an accepted reference
limit, not proof of ownership or a complete anti-burning remedy. The moderator
`reverse` command can reverse any stored ban and does not transactionally
require an appeal or new-holder event to exist.

```json
{
  "caseId": "<case ID>",
  "stage": "open | decided",
  "classId": "unsolicited-pornography",
  "openedAt": "2026-08-06T00:00:00Z",
  "responseDeadline": "2026-08-13T00:00:00Z",
  "decisionDeadline": "2026-08-20T00:00:00Z",
  "responded": true,
  "responsesOnFile": 1,
  "disposition": null,
  "appealDeadline": null,
  "appealState": "none",
  "newHolderState": "none",
  "claimRevision": 0,
  "assessment": null,
  "events": [{"at": "2026-08-06T00:00:00Z", "kind": "case_opened"}]
}
```

`CaseStatus` is returned to the accused, any reporter attached to the case, or
a moderator. A party sends `X-Onym-Key`, `X-Onym-Timestamp`, and
`X-Onym-Signature`; the signature covers
`query-status:<caseId>:<timestamp>` and is fresh for five minutes. Every failed
credential and a missing case return the same not-found shape. `stage` is the
coarse store state (`open | decided`); `disposition` distinguishes terminal
outcomes (`ban | dismiss | reversed`). `reverse` is an operator command, not a
wire-verdict disposition: it stores case disposition `reversed` while issuing a
new `dismiss` verdict to clear marks. `appealState` is
`none | pending | upheld | reversed`; `newHolderState` is
`none | pending | refused | granted`; and `claimRevision` changes whenever
either human-remedy record is filed, supplemented, or decided so a moderator
can reject a stale review. `assessment` is `null` for reporters and when no
model assessment exists. For the accused or moderator it may contain the
merged reference's stored model/profile digests, repository and revision,
class, input digest, evidence/response counts, case revision, bounded raw
output, adapter outcome/score/labels/note, assessment time, and the case
document; reporter-authored context is redacted from an accused's copy. The
event list exposes timestamps and kinds but not private event details. Optional
deadlines may be absent when not applicable.

#### 5.4.2 Interface–authority envelopes

After the interface returns its detached countersignature, it registers the
client's exact finalized `ModerationMandate` with the named authority. The
authority verifies the user signature, the configured interface key's
countersignature, its own component ID, the current exact manifest hash,
non-empty declared classes, and the bounded `acceptedAt` timestamp before
returning:

```json
{
  "mandateRef": "<hash-of-unsigned-canonical-mandate>",
  "accepted": true
}
```

`MandateReceipt` means the authority durably recorded that exact mandate; it is
not another signature and grants no terms beyond the mandate. The
countersignature authenticates registration; the reference route has no
additional transport bearer token. Registration is idempotent by `mandateRef`
and fails closed when the interface verification key is unavailable. The
authority stores the exact mandate and a snapshot of the manifest bytes it
pinned.

The authority delivers each interim or terminal verdict to the interface in a
`VerdictSubmission`:

```json
{
  "verdict": {"<exact signed Verdict object>": "<...>"},
  "consentedManifest": "<base64 of exact manifest bytes pinned by mandate>"
}
```

The manifest bytes are selected by `verdict.mandateRef`, not by whichever
manifest the authority currently publishes. The interface hashes them against
the stored mandate before trusting either the class terms or operator key. A
successful interface response is:

```json
{
  "verdictRef": "<hash-of-unsigned-canonical-verdict>",
  "status": "queued | stored"
}
```

`queued` means execution awaits an eligible target-device session; `stored`
means a suspensive verdict is retained until its consented execution condition.
Neither status permits the authority to write a mark itself. Delivery is
idempotent by `verdictRef`; permanent refusal is distinguished from retryable
unavailability so identical invalid bytes are not retried forever. The
Authority counts only structured `bad_request`, `verdict_invalid`, and
`class_outside_mandate` 4xx responses as permanent; authentication failures,
rate limits, `no_mandate`, `verdict_not_yet_valid`, unknown 4xx, 5xx, and
network failures remain retryable. Three permanent refusals mark a verdict
undeliverable until a moderator requeues it.

Every Rust service failure uses the shared error envelope:

```json
{
  "error": "<stable snake_case code>",
  "message": "<human-readable detail>"
}
```

The stable codes and retry meanings are listed in §10. Case-party endpoints
deliberately collapse missing objects and failed credentials to `not_found`.

### 5.5 Case Notice

```json
{
  "noticeVersion": 1,
  "caseId": "<random-id>",
  "authority": "onym:component:<authority-id>",
  "accused": "onym:key:<accused-identity>",
  "mandateRef": "<hash-of-accused's-mandate>",
  "classId": "unsolicited-pornography",
  "evidenceSummary": "<hash: the disclosed items the case rests on>",
  "responseDeadline": "2026-08-13T00:00:00Z",
  "decisionDeadline": "2026-08-20T00:00:00Z",
  "signature": "<authority-signature-on-governing-open-case-verdict>"
}
```

`CaseNotice` is the interface's display projection of a validated interim
`open-case` verdict and its mandate-pinned manifest, not a second independently
signed authority object. `signature` carries the governing verdict signature;
the interface retains that verdict and derives the notice's authority, case,
mandate, accused, and class from the verdict. It maps `verdict.reasoning` to
`evidenceSummary`, and computes `responseDeadline = verdict.decidedAt +
class.responseWindow` and `decisionDeadline = verdict.decidedAt +
class.decisionDeadline` using the mandate-pinned class. A joined report with
new evidence issues a new open-case verdict whose `decidedAt` restarts the
response window; the authority's stored terminal decision deadline remains the
one fixed when the case first opened. Consequently, after a revised notice the
reference gate's displayed `decisionDeadline` can be later than the Authority's
actual fixed deadline; this is a current reference limitation. The interface
must not copy a verdict signature onto unrelated or independently supplied
notice fields.

The interface serves the projection with the evidence, consented class
definition, and response path. A response contains signed statements and
counter-evidence (for example, context that changes a disclosed item's
meaning). A missing response does not concede the case; decision proceeds on
the record. The governing interim verdict sets the **case-open mark**; it is
procedural state, not a sanction, and the interface must not degrade service
beyond displaying the case's existence to the device holder.

### 5.6 Verdict

```json
{
  "verdictVersion": 1,
  "caseId": "<same-id>",
  "authority": "onym:component:<authority-id>",
  "mandateRef": "<hash-of-accused's-mandate>",
  "accusedKeys": ["onym:key:<accused-identity>"],
  "deviceBinding": "<platform-scoped-device-reference>",
  "classId": "unsolicited-pornography",
  "disposition": "open-case | dismiss | ban",
  "marks": {"case-open": false, "banned": true},
  "banExpires": "2026-12-16T00:00:00Z",
  "executeAfter": "2026-09-17T00:00:00Z",
  "reasoning": "<content-address: findings against the consented class definition>",
  "appealDeadline": "2026-09-17T00:00:00Z",
  "decidedAt": "2026-08-18T00:00:00Z",
  "signature": "<authority-signature>",
  "final": false
}
```

Normative constraints:

1. a verdict names exactly one case, the identity keys the evidence
   verified against, and the device from the accused's mandate; it
   cannot add devices, keys, or classes the case never contained;
2. `reasoning` is mandatory — an unexplained ban is nonconforming even
   where confidentiality keeps it private between authority and accused;
3. `banExpires` is required unless the consented class term is
   `permanent`, and the served term is always the class's `banTerm`
   measured from **execution**, never from decision: a
   `non-suspensive` ban executes at `decidedAt`; a `suspensive` ban
   executes when its appeal window lapses. The verdict's `banExpires` is
   `decidedAt + banTerm`, or
   `appealDeadline + banTerm` for suspensive classes — the example
   above shows the suspensive case: decided 2026-08-18, appeal window
   to 2026-09-17, ban served to 2026-12-16. Filing an appeal records a
   human-review request but does not rewrite these immutable timestamps;
   a later reversal clears the sanction. The
   interface clears the banned mark at expiry on the verdict's own
   authority, no further object needed;
4. `executeAfter` makes execution timing machine-checkable: required on
   every ban verdict, it must equal `decidedAt` in a `non-suspensive`
   class and `appealDeadline` in a `suspensive` one — the example above
   shows the suspensive case, where the marks field states the target
   state and `executeAfter` says when writing it becomes conforming. A
   missing or inconsistent `executeAfter` is `verdict_invalid`; no
   interface writes the banned mark before it;
5. the reference authority emits bans with `final: false` and does not issue a
   later finalization object merely because the appeal window elapsed. A
   reversal on appeal is a new final `dismiss` verdict that clears marks;
6. dismissals clear the case-open mark and are reported to the reporter
   (adjusting their track record) without disclosing the accused's
   response beyond the outcome; and
7. an `open-case` verdict is the interim object issued at case opening:
   its only permitted effect is `marks: {"case-open": true}`; its
   `reasoning` is required and states the intake basis — the verified
   reports the case rests on; it carries no `banExpires`, no
   `executeAfter`, and no `appealDeadline` (the response window is the
   accused's remedy), it is never `final`, and it is superseded by the
   case's terminal verdict, including the Authority sweep's
   decision-deadline dismissal.

### 5.7 Device marks and enforcement binding

The abstract rail is two per-device states scoped to the interface
vendor's platform credentials:

| Mark | Meaning | Set by | Cleared by |
|---|---|---|---|
| `case-open` | A moderation case exists against this device | Valid interim `open-case` verdict (§5.6) | Dismissal, superseding ban verdict, decision-deadline default, or designation revocation |
| `banned` | An executed ban verdict is in force | Valid ban verdict, at or after its `executeAfter` (§5.6 constraints 3–4) | Duration expiry, reversal, successful new-holder review, or designation revocation where no living forum survives |

The interface executes verdicts mechanically:

- it validates verdict shape — including the authority signature, mandate reference to
  a mandate its user actually signed, class within the mandate, marks
  consistent with disposition, expiry present where required, and
  `executeAfter` present, consistent with the class's `appealEffect`
  (§5.6 constraint 4), and already reached — a valid ban before its
  `executeAfter` is stored, not executed, and writing its mark early is
  nonconforming — never the verdict's wisdom;
- a device whose `banned` mark is set is refused service by this interface: the
  application declines to operate and displays the verdict reference,
  authority contact, expiry, ordinary appeal path, and new-holder path. A
  silent brick or a ban screen with no usable recourse is nonconforming;
- the named identity keys are refused within this interface's surfaces
  for the ban's duration — on every device, not only the marked ones —
  while device marks reach only the devices the verdict names; the
  interface does not propagate the refusal to couriers, notaries, or
  any other seat; and
- an authority may publish verdicts only as its consented confidentiality
  policy permits. Other interfaces may consult them but are bound only by
  verdicts under mandates their own users signed.

The authority's key can sign verdicts; it can never write marks. The
interface can write marks; it can never originate them.

A compromised or absent authority cannot retain marks merely because it is the
only party able to clear them. An interface must revoke a designation on either
of two bounded, auditable triggers: the authority reports its own compromise
with a compromise time, or signed status attempts remain unanswered for the
declared unreachability window (default: twice the manifest's longest decision
deadline). Attempts, determination, and resulting writes are logged and made
audit-attestable. Open cases then dismiss and clear. Existing bans continue
only while a living forum can hear a claim against them: a declared external
appellate acts as successor-of-record; a ban with no surviving forum clears.

**Merged-reference status.** The Apple service defaults authority-signature
enforcement off and currently returns no `appealUrl` or `newHolderUrl`. Neither
service implements designation revocation, bounded unreachability, compromise
notification, or external-appellate succession. Its implemented clearing paths
are a delivered signed dismissal/reversal and duration expiry; its deadline
default clears only after the Authority sweep signs and delivers a dismissal.
These are profile gaps against the requirements above.

Because both device marks are aggregate while verdicts are case-scoped, the
reference Interface folds every non-superseded verdict for the enrollment. It
orders same-case causality by the signed, parsed `decidedAt` rather than arrival
time, gives a terminal verdict precedence at an equal timestamp, and ignores a
late-arriving object already superseded by a newer case decision. A dismissal
clears only its own case; other open cases and bans continue to contribute to
the two aggregate bits. Each Apple write log entry stores that provenance in
`authorized_by`: normally the governing `verdictRef`, or `expiry` for expiry
reconciliation. The audit response exposes it as `authorizedBy` alongside the
requested aggregate state, write outcome, and the previous/current hashes in
the tamper-evident chain.

## 6. Authority contract surfaces

The authority profile has three wire facets. The interface-enforcement profile
is a fourth, separately owned dependency referenced by ID rather than inlined
into the authority's versioned operations.

### 6.1 User → authority client

| Operation | Input | Result |
|---|---|---|
| `file-report` | Signed `Report` with authenticity proofs | `ReportReceipt` naming the opened/joined case, current deadlines, and intake weight; not a merits decision |
| `respond` | Routed case ID + signed `CaseResponse` containing the same case ID | `{caseId, recorded, late}` or a typed refusal |
| `appeal` | Routed case ID + `AppealSubmission` containing the same case ID | `{caseId, filed, kind, note}`; ordinary appeals are authenticated, new-holder claims deliberately are not |
| `query-status` | Case ID + fresh party-signature headers, or moderator bearer token | The concrete `CaseStatus` in §5.4.1 |

The client selects the implementation for the authority named by the active
mandate. `respond` carries later evidence as additional `EvidenceItem`s; there
is no separate client-side `submit-evidence` operation. The reference signing
form removes `signature` structurally, sorts JSON object keys by UTF-8 byte
order, and serializes without escaping slashes. `caseId` is inside response and
ordinary-appeal signing bytes. The authority retains each complete raw object
it says entered the record. New-holder claims are the one unauthenticated
mutation and have the bounded, privacy-preserving behavior in §5.4.1.

### 6.2 Interface → authority registration

| Operation | Input | Result |
|---|---|---|
| `register-mandate` | Exact user-signed and interface-countersigned `ModerationMandate` | `MandateReceipt`, idempotent by `mandateRef` |

Registration is how a finalized mandate becomes operational authority
jurisdiction. The
authority does not add a signature or rebuild the object: it authenticates the
interface by its countersignature, verifies both existing signatures, confirms
that the currently published manifest bytes reproduce the mandate's hash and
that every class is declared, and stores the exact mandate plus manifest
snapshot needed to adjudicate future cases under those immutable terms.
Designation of an authority in the interface directory remains the separate
governance act that permits this registration relationship.

### 6.3 Authority → interface delivery

| Operation | Input | Result |
|---|---|---|
| `deliver-verdict` | `VerdictSubmission` containing a signed interim or terminal `Verdict` and the exact consented manifest bytes | `VerdictReceipt`; validated state is queued, stored, or executed according to the enforcement profile |

`issue-verdict` remains the authority's logical case action; `deliver-verdict`
is its cross-owner wire effect. An interim `open-case` verdict makes the case
available to the interface. At the next gate, the interface derives and serves
the `CaseNotice` from that validated verdict and its mandate-pinned manifest,
sets `case-open`, and leaves normal operation available. A terminal verdict
clears or schedules marks according to §5.6. The authority never writes a
platform mark and never sends unvalidated display state directly to the app.
The Rust delivery binding uses an authority bearer token. With no configured
token the Interface refuses delivery unless an operator deliberately enables
the unauthenticated-development override. Transport authentication is separate
from verdict-signature validation, whose enforcement switch currently defaults
off.

### 6.4 Referenced interface-enforcement profile

The authority profile references, but does not version or implement, the
interface vendor's `enroll-device`, `countersign-mandate`, and `gate-check`
operations. Their Apple and Android bindings are defined in
[Moderation-DeviceCheck.md](Moderation-DeviceCheck.md) §5 and
[Moderation-Device-Recall.md](Moderation-Device-Recall.md) §5. Those profiles
also bind `register-mandate` after countersigning and receive
`deliver-verdict`; changing an interface-only operation versions the
enforcement profile, not this authority profile.

All facets follow the manifest's windows. A blown decision deadline is a
dismissal, never a sweep interval in which a late ban remains possible. Case
opening, joined notice issuance, and terminal decisions commit atomically.
Mandates and verdicts are content-addressed; report retry identity is stricter
and requires byte-identical raw JSON for the same `(reporter, reportId)`.
Delivery is detached, at least once, and intentionally not single-flight:
prompt drains and the deadline sweep may attempt the same backlog concurrently,
relying on interface idempotency. Retryable delivery failure cannot undo the
already committed case transition.
Transport bindings publish endpoint discovery, authentication, canonical
signed bytes, replay domains, typed errors, retry classification, and fixtures
before claiming cross-vendor wire conformance; an in-process protocol or
`Codable` model alone is only a seam.

## 7. Incentives

### 7.1 Why the authority is paid, and how it must not be

Authorities publish fee offers as `SeatOffer`s. The merged reference implements
no billing, offer resolution, grant, or payout path; `offers` is metadata there.
Two conforming revenue sources exist:

- **interface fees**: interfaces (whose distribution depends on this
  seat existing and whose users demand a habitable network) pay their
  designated authorities by flat subscription or per **report
  adjudicated**; and
- **foundation grants**: moderation of the gravest classes is a public
  good; the sponsor seat ([../sponsor/Sponsor.md](../sponsor/Sponsor.md))
  may fund conforming authorities so that no interface skips designating
  one on cost grounds.

The invariants: fees are **outcome- and stage-independent** — per
report adjudicated or by subscription, never per case opened and never
per ban issued. Per-opened-case pricing is forbidden outright: opening
a case sets a device mark before any response, so an authority paid at
opening would profit from opening weak cases and dismissing them at no
cost to itself. No bounty, forfeiture, or volume bonus may make banning
more profitable than dismissing, and no party to a live case may pay
the authority anything beyond the pre-published rate. An authority
whose income rises with its ban rate — or its case-opening rate — has a
business model this contract rejects.

### 7.2 Why the reporter reports

Reporting is free, low-friction, and consequential: decided reports update
the reporter's authority-local track record and the resulting weight is
returned on later filings, although it does not currently change intake.
There is deliberately **no reporter
bounty** — paid reporting industrializes false accusation. Track records
are pseudonymous, local to one authority, non-transferable, and not a
purchasable asset; the reputation policy is published so reporters know
what their standing means.

### 7.3 Why the user respects the mandate

The mandate is legitimate to its subjects because it is:

- **consented** — signed at onboarding against exact, content-addressed
  class definitions, never imposed retroactively;
- **symmetric** — the same signature that exposes the user to cases
  gives them standing to report, and every user is likelier to need
  protection than to face a case;
- **procedural** — notice before sanction, a response window, reasoned
  verdicts, declared durations, and appeal are rights no conventional
  platform gives its banned users;
- **bounded to the consenting interface** — the outcome is a declared duration
  or permanent term on one interface, with local human reversal available; and
- **competitive** — authorities are inspectable before consent (track
  record and code; the reference does not publish aggregate statistics or an
  audit attestation), and an authority that bans capriciously loses the
  interfaces that carry it, because those interfaces lose users.

The interface's incentive closes the loop: it needs a designated
authority to be distributable at all, and it needs a *fair* one to keep
users who read the mandate before signing. Competition among
authorities disciplines both overreach and neglect.

## 8. Party obligations

Conforming interfaces must:

1. present the authority's manifest — classes, terms, appeal — before
   mandate signing, with consent-surface prominence, and never bury it
   in unrelated terms;
2. store valid verdicts and reconcile them at a target-device session, while
   refusing invalid shape, authority signature, mandate, class, and timing;
3. serve notices to the accused faithfully and provide a working
   response path even to users the interface finds odious;
4. display ban state honestly — verdict reference, authority contact, appeal
   path, new-holder path, and expiry — and never silently degrade service
   instead;
5. clear marks on dismissal, expiry, reversal, decision-deadline default, and
   applicable designation revocation without waiting for authority or user
   discretion; and
6. never write marks absent a valid verdict, including under pressure
   from stores, states, or its own commercial interest — an interface
   that needs to remove content for other lawful reasons does so under
   its own contract's disclosed policies, not by forging this seat's
   sanction.

Conforming moderation authorities must:

1. publish and follow the manifest: definitions, windows, terms,
   confidentiality, statistics, fees, affiliations, and appeal paths;
2. open cases only on conforming reports from consented reporters
   against consented accused, within declared classes;
3. verify authenticity proofs before treating disclosed content as
   evidence of authorship;
4. serve notice and hold the response window before any ban verdict —
   the case-open mark is the only pre-verdict effect;
5. decide on the record, against the consented class definition, within
   the deadline, with signed reasoning;
6. keep case materials under the declared confidentiality terms, retain
   disclosed content no longer than the case and appeal require — except for
   exactly the material and period an applicable declared statutory
   preservation duty requires — and never reuse it commercially;
7. perform the lawful statutory reporting the manifest declares, and nothing
   beyond it;
8. publish promised anonymized statistics consistently, not only the numbers
   that flatter the authority; and
9. operate verdict-signing keys separately from operational keys and report
   compromise immediately to designating interfaces.

**Merged-reference status.** The Authority enforces obligations 2–5 and the
class windows/terms portion of obligation 1. It stores complete report,
response, case-document, and assessment bytes in SQLite, but has no automatic
retention/deletion scheduler or commercial-reuse control; does not execute
`lawfulReporting`, publish promised statistics, validate affiliation or
external-appellate metadata, or notify interfaces of key compromise. Its
signing seed is a dedicated secret. The Apple reference also defaults signature
enforcement off and omits recourse URLs. Each missing behavior is a conformance
gap against the corresponding MUST above.

Conforming reporters must disclose only what they received, only
truthfully, and accept that a track record of dismissed reports reduces
their weight; conforming accused parties respond through the signed
path, without out-of-band pressure on the authority or retaliation
against suspected reporters.

## 9. Relationship to other seats

- **The interface seat** gains the reporting/blocking/removal capability
  its distribution channels require
  ([../interface/Interface.md](../interface/Interface.md)), without
  acquiring judicial power itself; designating an authority is part of
  its disclosed manifest.
- **The identity seat** is untouched: no verdict reaches root material,
  rotation, or recovery, and a banned identity's keys remain
  cryptographically valid everywhere the mandate does not reach.
- **The arbitration seat** is the structural sibling — chosen ex ante,
  bounded stake, default disposition — but the seats never merge:
  arbitration disposes of escrowed money between order parties;
  moderation disposes of interface access for mandate signers. An
  authority's fee disputes with an interface are arbitrable like any
  other order.
- **The audit seat** ([../audit/Audit.md](../audit/Audit.md)) attests
  authorities (procedure conformance, deadline performance, statistics
  honesty) and interfaces (mark handling matches verdicts). An attested
  track record could make pre-consent inspection real; no reference integration
  currently produces that attestation.
- **Discovery providers**
  ([../discovery/Discovery.md](../discovery/Discovery.md)) may list
  authorities and their attested records; listing is curation, never a
  license.
- **The sponsor seat** may grant-fund gravest-class moderation as a
  public good under its existing recognition bounds.

## 10. Errors and lifecycle

| Error | Origin | Response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse designation at interface |
| `bad_request` | Malformed or inconsistent request | HTTP 400; caller must correct bytes |
| `signature_invalid` | User, reporter, interface, authority, or moderator authentication | HTTP 401, except case-party paths use indistinguishable `not_found` |
| `no_mandate` | Verdict validation | Interface refuses execution; authority notified |
| `class_outside_mandate` | Verdict validation | Refused; only consented classes bind |
| `authenticity_unverified` | Evidence intake | Item is complaint, not evidence; cannot alone support a verdict |
| `reporter_unconsented` | Report intake | Report refused; reporting requires a mandate |
| `no_jurisdiction` | Report intake | Accused has no currently registered mandate naming this authority, or the consented manifest expired; refused |
| `window_closed` | Time | Late response enters the record; late appeal or post-deadline joined report is refused with HTTP 410 |
| `case_state` | Requested transition does not fit the stored case | HTTP 409; do not retry unchanged |
| `not_found` | Missing case or failed case-party proof | HTTP 404 with the same shape to avoid an existence/party oracle |
| `no_response` | Accused | Decide on record per manifest |
| `decision_overdue` | Authority sweep | Authority signs and delivers a dismissal; the interface clears `case-open` when that verdict is received and reconciled |
| `verdict_invalid` | Interface validation | Not executed; bad shape, signature, or bounds |
| `verdict_not_yet_valid` | Signed `decidedAt` is beyond allowed clock skew | HTTP 425; retry the same bytes later |
| `mark_write_failed` | Platform | Retry; verdict remains valid; identity refusal applies meanwhile |
| `appeal_filed` | Within window | Filing is recorded for human review; it does not change the immutable `executeAfter`, and only a later reversal clears the ban |
| `new_holder_claim` | Unauthenticated claim against a case ID | Always acknowledges; stores only against a ban, bounded to eight claims |
| `internal_error` | Store or invariant failure | HTTP 500; retry only after operator inspection |

Case lifecycle:

```text
mandate_signed (onboarding, before any case)
  -> mandate_registered (authority jurisdiction becomes usable)
       -> report_filed (authenticity verified, reputation weight recorded)
       -> case_opened or joined by (accused, class)
            -> open-case verdict delivered -> case-open mark set -> notice served at gate
            -> new distinct joined evidence -> revised notice; response window restarts
               (decision deadline remains fixed; at most eight notices)
            -> responded (up to 32, including late) | no_response
            -> decided within deadline
                 -> dismissed -> marks cleared -> closed
                 -> banned -> banned mark set -> [appeal?]
                      -> ordinary appeal recorded (up to 32) -> moderator review
                      -> new-holder claim optionally recorded (up to 8)
                      -> reversed -> dismissal verdict -> marks cleared -> closed
                      -> otherwise runs to banExpires, or forever if permanent
            -> decision_overdue -> dismissed -> marks cleared -> closed
```

No late ban can commit after the fixed decision deadline. Termination still
depends on the Authority eventually running its deadline sweep and delivering
the resulting dismissal; permanent disappearance can strand an open-case mark.

## 11. Security and privacy invariants

1. **Jurisdiction is registered signed consent.** An authority decides only
   cases against users whose verified two-signature mandate is registered in
   its store, names it, lists the class, and pins the manifest snapshot used;
   a client-local signed mandate the authority never received is not usable
   jurisdiction.
2. **Marks move only on verdicts.** No interface discretion, no authority write
   access, no platform-initiated state; every mark transition traces to one
   signed, validated verdict or a declared clearing default — duration expiry,
   decision deadline, or bounded revocation of a dead or compromised
   designation. Defaults only ever clear marks; nothing but a verdict sets one.
3. **Evidence is recipient-disclosed or it is nothing.** No scanning,
   no client-side detection, no key or plaintext demands, no metadata
   dragnets; the E2EE floor of every other seat is the floor of every
   case.
4. **Notice precedes sanction.** The authority refuses a ban until every
   open-case verdict issued for the case has reached the interface and the
   current response window has elapsed; the case-open mark is procedural and
   must not degrade service.
5. **Every ban has a shape.** Named keys, one device, a consented
   class, signed reasoning, a duration or justified permanent term,
   an execution timestamp honoring the class's appeal effect, and an
   appeal path — a sanction missing any element is invalid at every
   conforming interface.
6. **Undecided is dismissal.** Deadline passage makes dismissal the required
   outcome and clears the procedural mark without authority discretion. The
   merged reference rejects a late ban and signs the dismissal when its sweep
   runs, but lacks the independent Interface fallback needed for permanent
   Authority disappearance.
7. **Verdicts bind the consenting surface only.** No protocol-wide
   blacklist exists; other seats may consult published verdicts but are
   bound only by their own users' mandates; couriers, notaries, and
   registries are unreachable by this seat.
8. **Fees are ban-independent and stage-independent.** Permitted economics are
   per report adjudicated or subscription, never per ban or case opened; no
   bounty or revenue path may pay for severity. The merged reference implements
   no billing path at all.
9. **Reputation is local and unownable.** Reporter track records are
   per-authority, pseudonymous, non-transferable, and not a market.
10. **The device is not the person.** A published new-holder review is
    mandatory and must provide a usable remedy without the former identity.
    The merged reference's unauthenticated path cannot prove ownership, stores
    at most eight claims, and may silently drop later ones; that is a
    conformance gap, not a proof-backed transfer remedy.
11. **Law outranks the label.** Authorities perform the statutory reporting
    their manifests declare, and nothing beyond it; no mandate waives the
    accused's or reporter's legal rights. The merged reference does not yet
    automate reporting or statutory preservation.
12. **The seat is optional at the protocol layer.** Direct protocol
    use never requires a mandate; an interface that ships without a
    designated authority answers to its distribution channel, not to
    this contract.

## 12. Versioning and conformance

- `ModerationProfile` changes when an authority surface operation or
  mandate, report, receipt, response, appeal, status, verdict, or
  inter-service envelope meaning changes. The referenced interface-enforcement
  profile versions its own enrollment, countersigning, gate, `CaseNotice`, and
  mark meanings independently. Violation classes are additive per authority manifest, and
  class definitions are immutable once consented.
- Mandates are immutable; a manifest change binds only mandates signed
  after it. Verdicts are immutable; corrections travel as reversal
  verdicts through the declared appeal path, never edits.
- Cross-platform fixtures cover: mandate validation (manifest hash mismatch,
  missing class terms, directory/manifest component and operator mismatch,
  invalid detached manifest signature, user/interface signature failure,
  future `acceptedAt`, raw-bytes/decoded-fields mismatch, rejection of the old
  `operations`/`markStates` profile shape, and a hosted manifest changing
  between review and agreement);
  report authenticity verification
  (valid proof, forged proof, proofless complaint); notice and window
  arithmetic including timezone-hostile boundaries; verdict shape
  validation at interfaces (no mandate, class outside mandate, missing
  expiry, marks inconsistent with disposition, missing or inconsistent
  `executeAfter`, open-case verdicts carrying sanction effects or
  lacking intake reasoning); suspensive versus non-suspensive appeal
  execution including early-write refusal; decision-deadline
  default execution; expiry clearing; reversal clearing; and
  new-holder claim recording. Surface fixtures also cover §6:
  receipt-is-not-a-merits-decision semantics, exact-byte report retries,
  complete evidence retention in a signed response, ordinary versus
  unauthenticated bounded new-holder filing, authenticated
  status confidentiality, idempotent mandate registration, mandate-pinned
  manifest selection for verdict delivery, notice derivation through the gate,
  joined-evidence notice dedupe/caps and fixed terminal deadlines,
  signature-only interface countersigning, UTF-8 byte-order canonicalization,
  replay/idempotency behavior, concurrent at-least-once delivery, and
  refusal of every cross-role operation (including authority mark writes and
  authority mandate countersigning).
- An authority, an interface, and reporter/accused clients from three
  different authors must interoperate using only published profiles and
  fixtures.

## 13. Concrete implementation profiles and reference

Two device-mark platform profiles accompany this boundary:

- **[Moderation-DeviceCheck.md](Moderation-DeviceCheck.md)** — Apple
  DeviceCheck: two per-device bits scoped to the interface vendor's
  Apple developer account, written server-side on verdict execution. It
  also records the current Onym iOS client slice and distinguishes that
  code from the still-missing production enforcement backend; and
- **[Moderation-Device-Recall.md](Moderation-Device-Recall.md)** —
  Google Play Integrity device recall: per-device recall values scoped
  to the interface vendor's Google Play developer account, written
  server-side and read inside integrity verdicts.

Both platforms scope marks to the interface vendor's credentials, which
matches this contract's rule that verdicts bind the consenting surface
only: vendor A's marks are physically invisible to vendor B.

The merged [`onym-moderation` reference on
main](https://github.com/onymchat/onym-moderation/tree/9a5f50a80d58e7093f407a0a141c6358691ce74c)
(PR #2 plus PR #4) is the concrete reference for the current v1 Authority and
Apple-enforcement wire shapes. It is not a substitute for the abstract MUSTs;
the status below makes its nonconformance explicit. Its HTTP routes map as
follows:

| Reference route | Contract operation |
|---|---|
| `GET /manifest.json` | Fetch exact authority-manifest bytes; detached authenticity remains the directory binding |
| `POST /v1/mandates` | `register-mandate` |
| `POST /v1/reports` | `file-report` |
| `POST /v1/cases/:caseId/respond` | `respond` |
| `POST /v1/cases/:caseId/appeal` | `appeal` |
| `GET /v1/cases/:caseId/status` | `query-status` |
| authority POST to interface `/v1/verdicts` | `deliver-verdict` |
| `GET /v1/write-log` on the interface | Audit-token-protected hash-chain view; each entry exposes storage `authorized_by` as wire `authorizedBy` |
| `POST /v1/cases/:caseId/decide` | Authority-operator command, not a cross-owner profile operation |
| `POST /v1/verdicts/:verdictRef/requeue` | Authority-operator repair command for a permanently refused delivery |
| `GET/POST /admin...` | Shared-token moderator panel and appeal/new-holder review workflow; operator UI, not a cross-owner profile operation |
| `GET /health` on either service | Informative operator health, key, and delivery state; not a case operation |

The implementation stores immutable mandate-pinned manifest snapshots, opens or
joins a case for every valid report, requires every issued notice to reach the
interface before a ban, keeps a joined case's terminal deadline fixed, and
commits opening, renoticing, decisions, and claim review transactionally. PR #4
adds off/advisory/autonomous local-model triage modes, consent-bound model
profiles, a shared-token moderator panel, human appeal/new-holder review, and
the extended `CaseStatus` assessment and claim fields in §5.4.1.

The implementation gaps are equally part of its status: new-holder claims are
unauthenticated and eight-slot exhaustible; prompt backlog drains are not
single-flight; external appellate routing, affiliation validation,
designation-revocation, retention/deletion, statutory-reporting, statistics,
and compromise-notification mechanisms do not exist; the Authority is
configured for one interface key, delivery URL, and token; all human deciders
share deployment tokens with no individual moderator identity; the Apple
service's authority-signature enforcement defaults off; numeric
manifest/mandate/report/verdict version fields are decoded but not rejected
when they differ from 1; Authority startup does not validate the moderation
seat/profile ID; and no current iOS call registers the finalized mandate with
the Authority. There is no production deployment. The current iOS authority
client remains a typed seam with no network transport, as the DeviceCheck
profile records.

## 14. Acceptance criteria

The moderation seat is successfully specified when:

1. a user can read one authenticated snapshot of an authority's classes,
   terms, appeal path, and hash before consenting; the exact retained
   snapshot — not a second fetch — supplies the classes, hash, and stored
   bytes of the signed mandate, so no case can reach the user under terms
   they never saw;
2. a report with verified authenticity proof can proceed through
   notice, response, verdict, and mark execution using only published
   profiles and fixtures;
3. no ban verdict lacking a mandate, reasoning, duration (or justified
   permanent term), execution timestamp, or appeal path executes at any
   conforming interface, and no interim `open-case` verdict lacking a
   mandate or its intake reasoning sets the case-open mark;
4. open cases dismiss and clear on fixed decision deadlines even if the
   Authority never returns; a dead or compromised designation follows §5.7's
   bounded, audit-attestable forum rule. The merged reference's lack of an
   independent Interface fallback and successor mechanism remains a gap;
5. no conforming object or endpoint scans undisclosed content, requests keys,
   pays for a ban/case opening, offers reporter bounties, or authorizes evidence
   reuse beyond declared adjudication, retention, and lawful-reporting bounds;
6. a banned device holder receives the governing verdict, authority contact,
   duration, ordinary appeal path, and new-holder path at the gate. The merged
   Apple backend's absent `appealUrl` and `newHolderUrl` are a gap;
7. reporter, accused, and new-holder clients can use the four authority-client
   operations; the Authority accepts exact countersigned mandate registration
   even though no current iOS path calls it;
   notices and verdict state arrive only through validated interface delivery;
   and no authority call can countersign a user mandate or write a device mark;
8. a second authority and a second interface can adopt the profiles
   without coordination with the first; and
9. the protocol remains fully usable by clients that never signed any
   mandate, and every document in this seat says so plainly.

## 15. Justification in one sentence

> The moderation seat gives every interface the abuse-removal power its
> distribution requires, as a service its users chose while they were
> nobody's accused — one whose whole authority is a reasoned, signed,
> expiring verdict against terms they could read, and whose worst
> failure mode is a dismissal on schedule.

## References

1. Onym system whitepaper, §1 and §3 (the governing minimum-authority
   rule and the design principles), §7 (interface seat), §17
   (economics): [../WHITEPAPER.md](../WHITEPAPER.md)
2. Onym interface contract (consent surfaces, disclosed economics):
   [../interface/Interface.md](../interface/Interface.md)
3. Onym arbitration boundary (consent-ex-ante, default dispositions):
   [../arbitration/Arbitration.md](../arbitration/Arbitration.md)
4. Onym audit seat (attested authority track records):
   [../audit/Audit.md](../audit/Audit.md)
5. Onym discovery boundary (listing without gatekeeping):
   [../discovery/Discovery.md](../discovery/Discovery.md)
6. Onym sponsor contract (public-good funding path):
   [../sponsor/Sponsor.md](../sponsor/Sponsor.md)
7. Apple DeviceCheck (per-device two-bit state):
   <https://developer.apple.com/documentation/devicecheck>
8. Google Play Integrity device recall:
   <https://developer.android.com/google/play/integrity/device-recall>
9. App Store Review Guidelines §1.2 (user-generated content
   requirements):
   <https://developer.apple.com/app-store/review/guidelines/#user-generated-content>
