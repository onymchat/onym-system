---
status: draft
proposed: Claude & @rinat-enikeev
date: 08.08.2026
---

# Onym Moderation Authority Contract Boundary

**Proposal draft 0.3 — August 2026**

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
6. conduct the declared ordinary and new-holder review paths, route an
   external appeal to the separately named appellate authority, and issue
   signed reversal verdicts for the reviews it decides; and
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
physical device. That is also why the sanction is grave: a device mark
punishes hardware that may later carry a different, innocent person. The
contract answers with the tightest bounds in this repository — declared
durations, mandatory appeal and new-holder review, and a dismissal default that
does not depend on a silent Authority returning.

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
from stored, authority-authenticated verdicts. Deadline passage requires
dismissal and clears `case-open` through the Interface-side default even if the
Authority never returns.
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
      "upload-evidence",
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
  "mandateSchema": "onym-moderation-mandate-v1",
  "mandateReceiptSchema": "onym-moderation-mandate-receipt-v1",
  "reportSchema": "onym-moderation-report-v1",
  "reportReceiptSchema": "onym-moderation-report-receipt-v1",
  "evidenceUploadSchema": "onym-moderation-evidence-upload-v1",
  "evidenceUploadReceiptSchema": "onym-moderation-evidence-upload-receipt-v1",
  "caseResponseSchema": "onym-moderation-case-response-v1",
  "caseResponseReceiptSchema": "onym-moderation-case-response-receipt-v1",
  "appealSchema": "onym-moderation-appeal-v1",
  "appealReceiptSchema": "onym-moderation-appeal-receipt-v1",
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
this authority profile: they belong to the separately versioned enforcement
profile implemented by the interface vendor and selected by each signed
mandate. One Authority profile can therefore serve Apple and Android
Interfaces without pretending their platform bindings are the same. Sharing a
deployment or transport never erases which key and role authorize an
operation. `CaseNotice` belongs to the mandate-pinned enforcement profile
because it is a gate projection produced by the interface, not an object
crossing an authority wire. The earlier monolithic
`operations`/`markStates` shape was an undeployed, unpersisted draft. This
replacement is wire-incompatible with that draft even
though it retains `consent-bound-v1`/version 1; validators must reject the old
shape rather than silently interpreting it as `surfaces`. Reusing version 1 is
safe only because there were no deployed consumers or persisted profile
objects.

`upload-evidence` was added to `surfaces` under that same condition,
which still holds: the reference is the only implementation and it ships
the route. Recording why it did not bump the version, since the standing
rule is that it should have. The surface is mandatory but its content is
optional — an authority declaring no `acceptedMedia` (§5.2 constraint 9)
conforms by refusing every upload. Said plainly rather than as a
softening clause: a deployment that was conforming before this change is
nonconforming until it answers the route. What the narrow scope buys is
that the remedy is a route returning refusals, not a change to any
authority's decisions. That is the last
change this condition is available for: with a deployed consumer, the
same addition bumps the version.

The Authority-side `Verdict.marks` vocabulary is fixed by §5.7 to exactly
`case-open` and `banned`; it is part of `verdictSchema`, not a profile-declared
extension point. The rejected `markStates` key mixed that abstract vocabulary
with platform storage. Each enforcement profile instead maps the same two
names to its own physical values through `markBindings`.

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
    "digest": "<sha256-of-published-model-profile>",
    "inputs": { "mediaTypes": ["image/jpeg", "image/png"], "maxItemsPerRequest": 8 }
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
  "acceptedMedia": {
    "mediaTypes": ["image/jpeg", "image/png"],
    "maxObjectBytes": 4194304,
    "maxItemsPerFiling": 8,
    "maxItemsPerCase": 24,
    "maxUnreferencedUploads": 16
  },
  "retention": {
    "policy": "<hash-or-url: the published schedule>",
    "unreferencedUpload": "P1D",
    "caseMedia": "P30D",
    "caseRecord": "P400D",
    "auditRecord": "P400D",
    "sanctionRecord": "P400D",
    "preservation": {
      "csam": { "period": "P400D", "referral": "<hash-or-url: the procedure>" }
    }
  },
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
   not execute until the ban verdict's `appealDeadline`, defined in §5.6 as
   `decidedAt + appealWindow`; filing or pending review does not move that
   timestamp; `non-suspensive`: the ban executes at once and appeal can only
   reverse it). In v1, `suspensive` means a fixed pre-execution appeal interval,
   not tolling until review completes: if review is still pending at
   `appealDeadline`, execution proceeds and a later successful appeal reverses
   it. A class missing any of the five terms is invalid at mandate validation;
2. `banTerm` is `permanent` or a declared duration. A permanent term is valid
   only where the class definition justifies it and `appellate` names a
   well-formed, non-empty `onym:component:` reference to an authority other than
   the issuer. The permanent ban remains appealable there for as long as it is
   in force, not merely during the ordinary appeal window. `appellate: self` is
   valid only when the manifest declares no permanent class;
3. `newHolderAppeal` is mandatory: every authority publishes how a person who
   acquires a marked device can obtain review without the former holder's key;
4. an authority that permits model-assisted or autonomous decisions declares
   `modelProfile`. Its digest binds the published model repository/revision,
   prompt, output adapter, thresholds, class mapping, invalid-output
   behavior, **and the input modalities the profile enables** — which
   media types the model inspects and how many items per request.
   Replacing any of those terms requires a new manifest and fresh
   consent; a human-only authority omits the field.

   Modality is a consented term because it decides what a verdict means.
   A profile whose declared inputs do not cover a case's evidence must
   not classify the part it can read and sign a verdict that reads as
   though it had reviewed the whole — a text-only model shown a reported
   image scoring its caption alone is the specific failure this forbids,
   and it is worse than no decision because nothing in the record
   reveals it. Silently dropping an evidence item it cannot process is
   the same failure by omission.

   Two different things follow, and conflating them is a trap the merged
   reference fell into and had to be pulled back out of.

   Where the model cannot inspect that **kind** of input at all, an authority
   whose profile output *is* the decision — no human merits review before the
   verdict — **must refuse such evidence at intake** rather than accept it and
   reach the undecided outcome later. An authority whose model only advises, or
   which decides by hand, may accept it: a person can read what the model could
   not, so the case has a decider and nobody can strand it by choosing what to
   disclose.

   No manifest field distinguishes those two, and none is added: whether
   a deployment runs its model advisory or autonomous is operational
   configuration an operator changes without republishing, and a term
   that can move under a live mandate is not a term. What a reporter
   reads instead is `acceptedMedia`, which is why constraint 9 forbids
   declaring acceptance of a modality nothing will read: an authority
   that must refuse at intake discharges this duty by not declaring the
   modality at all, and one that declares it has committed to having a
   decider for it. The duty is on the authority; the legible surface is
   what it accepts, not how it decides.

   The undecided outcome remains correct for anything already on
   file, but it cannot be the plan: a case that can never be decided is
   dismissed at its decision deadline, and `CaseResponse` counter-evidence is
   held to these same rules (§5.5), so accepting unreadable evidence
   hands the
   accused the same acquittal the over-count rule below is written to deny
   them. Refusing at intake is the only form of this that is not choosable by a
   party to the case.

   Where the model can inspect the kind but the case carries **more
   items than the profile permits**, the case is decided on as many as
   the profile takes, and the record names the rest as not shown.

   Which ones is part of the rule, not an implementation choice. The
   subset is the **first N in evidence order, report items before
   response items**. Any selection that lets later items displace
   earlier ones — last-N being the obvious one — reopens the door this
   paragraph closes from the other side: the accused attaches items past
   the limit and pushes the reporter's evidence out of what the model
   sees, reaching the same self-acquittal by a different route.
   Counter-evidence fills whatever budget the report's items leave,
   in filing order. It
   must *not* be left undecided. An undecided case is dismissed at its
   decision deadline (§3.5), so "refuse to decide" is an outcome anyone
   able to add evidence to a case can choose — including the accused,
   who can sign their own disclosed content, and who can therefore
   acquit themselves by attaching one more picture than the model
   accepts. A guard meant to stop a model judging what it cannot see
   becomes a way to guarantee acquittal. Deciding on a disclosed subset,
   with what was withheld recorded, is the lesser harm and the only one
   an accused cannot trigger at will;

   `inputs` restates, in the manifest, what the profile document already
   says: the media types the model inspects and how many items it takes
   per request. The restatement is not redundant — a value reachable only
   by fetching and parsing an opaque profile document cannot be compared
   against what the authority says it accepts, and constraint 9 requires
   exactly that comparison to be possible before anyone files. The two
   must agree with the profile document, and the digest is what makes
   disagreement detectable.

   This describes the model, not the authority. What the authority takes
   at intake is `acceptedMedia`; a human-only authority omits
   `modelProfile` entirely and still has somewhere to say what it
   accepts.

   Declared support and a declared maximum are one predicate, not two.
   A profile claiming a modality while permitting zero items of it takes
   none, and a caller reading only the capability flag will send a
   request with no attachment and record the answer as a review of
   evidence it never saw;
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
   nonconforming;
9. an authority that accepts media evidence declares `acceptedMedia`,
   and one that declares none accepts none.

   This is the **only** surface for that fact, and it has to be a
   manifest field rather than anything else, because the alternatives do
   not fit. `surfaces` lives in the shared moderation profile that every
   manifest pins by id, so it says what the v1 interface contains and
   cannot say what one authority does with it. `modelProfile.inputs`
   describes what a model is shown, and a human-only authority omits
   `modelProfile` altogether (constraint 4) — leaving it no way to speak
   at all.

   `acceptedMedia` also carries the intake bounds, because a limit that
   refuses a report is a term of the service and not an implementation
   detail:

   - `mediaTypes` — what will be decoded at all. An empty list, or the
     field's absence, is a complete refusal.
   - `maxObjectBytes` — the ceiling on one uploaded object.
   - `maxItemsPerFiling` — how many items one report or response may
     commit to.
   - `maxItemsPerCase` — how many a case may accumulate, which the
     per-filing bound cannot cover because reports join and responses
     accrue.
   - `maxUnreferencedUploads` — how many uploaded objects one key may
     hold that no filing has named.

   Where an authority's decider cannot review a declared type and its
   output is the decision, the pairing is self-contradictory: it publishes
   that it accepts material nothing will read. A conforming authority does
   not publish that combination. `media_unreviewable` is nonetheless an
   ordinary intake refusal, not a rarity: whether a deployment's pinned
   model can read images is operational configuration, so a manifest
   that was conforming when published can be paired with a decider that
   cannot read what it declares. The code exists for exactly that drift,
   and it is refused at intake rather than accepted and left undecided.
   Its difference from `media_class_refused` is what a client can act
   on: one says another authority might take the same report, the other
   says the class refuses the modality wherever it is declared.

   Between them, `acceptedMedia` and `preservation` are what make a
   decline legible before filing rather than discovered by being refused —
   for a modality and for a class respectively;
10. an authority that deletes material on a schedule declares
    `retention`.

    It names five periods and a map, each a `P<n>D` **tail
    measured from the moment the thing it governs is finished** rather
    than a lifetime from arrival. The anchors are what make a duration
    resolvable, so they are part of the term:

    - `unreferencedUpload` — bytes uploaded that no filing ever named,
      from the upload. The one value that is not per case, and therefore
      the one value read from the **currently published** manifest rather
      than from a pinned snapshot. An upload no filing named belongs to
      no case, so there is no mandate whose terms could govern it; the
      uploader holds a mandate, but a mandate is consent to be judged
      under the published classes, not a contract over unclaimed bytes.
      The consequence is real and worth naming: an authority can shorten
      this period after a key consented, and nothing in the schedule
      stops it. What bounds the harm is what the period can reach —
      bytes no filing has named. The moment one does, the material is a
      case's, every period governing it comes from that case's pinned
      manifest, and a shortened value cannot reach anything an
      adjudication rests on. An authority wanting this bound pinned too
      would have to make it a term of something a mandate covers, which
      v1 does not attempt.
    - `caseMedia` — a case's disclosed media, from the later of its appeal
      and decision deadlines.
    - `caseRecord` — its reports, responses, assessments and the document
      a model read, from the same instant.
    - `auditRecord` — its non-content events, from the same instant.
    - `sanctionRecord` — the verdicts of a decided case and the mandate
      snapshot its periods are resolved from, whether or not it produced
      a sanction. For a case that marked a device, from the moment the
      last mark expires or is cleared, and never while one is in force;
      for one that ended in dismissal, from the decision itself, since
      there is no mark to outlive. It has to cover the dismissed case
      too, or the pinned snapshot has no period at all: an unresolvable
      period retains, so the case record would be kept forever waiting
      on terms nothing was ever going to delete.

      The mandate row is not the snapshot, and dropping it is separately
      gated: a mandate several cases pin is not one case's to discard,
      and a consent still inside its manifest's `validUntil` is a live
      agreement whose deletion silently revokes a user's standing. So
      the mandate goes only when no remaining case pins it *and* its own
      consent has expired — a case's tail is not a clock over anybody's
      consent. It must be at least as long as
      `caseRecord` and `auditRecord`: an authority that discards the
      mandate first loses the terms the other two are resolved from, and
      the record it published a period for is then kept indefinitely.
    - `preservation.<classId>.period` — from the moment the hold is
      placed, not from the case, since the duty attaches to the material.

    A case that produced a sanction still in force takes its
    `caseRecord` and `auditRecord` anchor from `sanctionRecord` instead of
    from its own deadlines. Otherwise the two schedules contradict
    constraint 2: a permanent ban is appealable for as long as it is in
    force, and an appellate authority 400 days later would be reviewing a
    mark whose reports, responses and events this authority had already
    deleted on time. `caseMedia` is deliberately not extended with them —
    the appeal is heard on the record of what was decided and why, and
    keeping a photograph alive for the lifetime of a permanent mark is the
    opposite of what the shortest period on the list is for.

    The inline durations govern. `policy` is the human-readable document
    those numbers are explained in, and a mandate pins the manifest, so a
    document that disagreed with the bytes would be describing terms
    nobody consented to. An authority publishing both must keep them
    equal; where they diverge the manifest is what was agreed and the
    document is what needs correcting.

    A period read from
    today's published document rather than from the one a case's accused
    pinned is the silent substitution this constraint exists to forbid,
    and it is worse there because the consequence is destruction rather
    than a decision. A period that cannot be resolved for a case — a
    missing mandate, an unparseable value — retains the material;
    guessing at terms in order to delete is not a conforming failure
    mode. An authority declaring no schedule deletes nothing on a timer,
    which is a coherent position that must be published as such: a period
    named but not enforced is the one thing worse than naming none,
    because the people whose material it is would be relying on a
    deletion that never happens. `preservation` names the classes an
    authority preserves and refers. A class that declares `lawfulReporting`
    accepts media evidence only where `preservation` also carries terms for
    it: for those classes the absence of terms is a refusal rather than an
    omission, because taking custody of material an authority cannot
    retain, refer and destroy on a stated basis is a harm in itself.
    Classes carrying no reporting duty are unaffected and accept media on
    the ordinary rules. An absent `preservation` and an empty one mean the
    same thing — no class is preserved — the way an absent and an empty
    `interfaceAffiliations` both mean none.

    `preservation` lives inside `retention` and cannot be declared
    without it. That is a real restriction and it is deliberate: an
    authority declaring no schedule promises nothing about when this
    material is destroyed, and taking custody of material that carries a
    statutory reporting duty while promising nothing about its
    destruction is the posture this constraint exists to refuse. It also
    means v1 has no way to say "kept, with no period" — every value is a
    duration, there is no never sentinel, and an authority whose posture
    is genuinely indefinite retention therefore declines media on these
    classes. Naming the limitation rather than leaving it to be
    discovered: it is the price of making the schedule the thing a
    mandate pins.

    Declining media does not decline the class. Text reports under it are
    filed, decided and appealed on the ordinary rules, and their record is
    retained under `caseRecord` and `auditRecord` like any other case's —
    there is no third schedule, because there is no material of a third
    kind. §7 obligation 7 is unaffected either way: the duty is to perform
    the reporting the class declares, on whatever the authority actually
    holds, and a report describing material it never took custody of is
    what it has to work from. An authority concluding it could not
    discharge that duty on text alone would be declining the class rather
    than the modality, and would say so by not publishing the class.

    Declaring `preservation` has consequences beyond
    this seat: an operator who is not a provider with the protections and
    reporting relationship that role carries may commit an offence merely by
    holding such material, and a conforming profile says so where an operator
    will read it;


**Merged-reference status.** `onym-moderation` main treats `appellate`,
`newHolderAppeal`, and `interfaceAffiliations` as optional/unvalidated
metadata; it records local appeals and unauthenticated new-holder claims, but
has no external-appellate router or designation-revocation protocol. It permits
configured triage without a manifest `modelProfile` after a startup warning;
when the field is present, cases are bound to it. It does enforce the concrete
`validUntil` intake boundary: the published and
mandate-pinned manifests must be live for registration and new case intake,
while already-open cases continue. The missing checks and routes are
conformance gaps; they do not relax constraints 2, 3, 4, 6, or the
succession/revocation requirement in constraint 7.

### 5.3 Moderation Mandate

Signed by the user at onboarding, countersigned by the interface:

```json
{
  "mandateVersion": 1,
  "user": "onym:key:<user-identity>",
  "interface": "onym:component:<interface-id>",
  "interfaceEnforcementProfileId": "onym:moderation-enforcement-profile:<platform-binding>-v1",
  "interfaceEnforcementProfileVersion": 1,
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
4. `interfaceEnforcementProfileId` and
   `interfaceEnforcementProfileVersion` select the exact authenticated
   platform-binding profile published for the named Interface. The pair is
   immutable, and the Interface verifies it against its directory entry before
   countersigning. `deviceBinding` has the platform-scoped meaning that profile
   defines; it lets a verdict name the device without creating a global device
   identifier;
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
   interface keeps enrollment fail-closed and retries transient registration
   failures with the same bytes. If the Authority has published different
   manifest bytes, that mandate can no longer register in merged v1: the
   interface must return through authenticated manifest review, obtain fresh
   consent, and create a new signed/countersigned mandate rather than retry
   forever or silently substitute terms; and
8. withdrawal is leaving the interface. It ends exposure to new cases but does
   not clear marks already set by valid verdicts, dissolve an already-open
   case, or toll its windows. Notice is constructively served when made
   available on the interface's declared notice path for the enrollment; an
   absent accused proceeds on the record as `no_response`, and any resulting
   verdict binds under the queued-write rules. Going dark mid-case is not a way
   to void the process.

**Merged-reference status.** The current iOS and Rust mandate DTOs omit the
enforcement-profile ID/version pair, so neither side validates that pin. The
Authority also exposes no mandate withdrawal or deregistration operation. A
registered mandate can therefore support new cases while its pinned manifest
remains live. Uninstalling or ceasing gate sessions neither removes that
jurisdiction nor clears marks and can prevent queued writes from reaching the
hardware. These are conformance gaps against constraints 4 and 8.

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
      "disclosedContent": "<the exact bytes the accused signed, verbatim>",
      "authenticityProof": "<sender-signature-or-envelope-commitment binding content to accused key>",
      "context": "<hash-or-inline: conversation context the reporter chooses to add>"
    }
  ],
  "filedAt": "2026-08-06T00:00:00Z",
  "signature": "<reporter-signature>"
}
```

**`EvidenceItem`.** One disclosed item, and the only place evidence
enters this contract — a `CaseResponse` carries counter-evidence in the
same shape (§5.5), held to the same rules.

`disclosedContent` is an opaque string. Its meaning belongs to the
sender's commitment format — which the authority names in its published
`evidenceRules`, because a version discriminator inside the string only
helps a verifier that already knows which format's versions it is
reading — and not to this object: the authority verifies
`authenticityProof` over its exact bytes and does not reconstruct,
normalize, re-serialize, or re-encode it. An authority that
canonicalizes disclosed content before verifying has broken the
signature it was checking.

That opacity is what lets the same object carry media without a second
version of this schema. A commitment format that binds attachment bytes
puts their digest, media type and byte length *inside* the signed
string, so the reporter's signature over the report covers the image
identity for free and no `content` union, `blobRef` field, or
`reportVersion` bump is required. A conforming commitment format must
satisfy these four **commitment properties**, numbered here and cited by
that name so they are not confused with this section's normative
constraints:

1. carry a version discriminator, and be read by that discriminator
   rather than by which fields happen to be present — otherwise a
   sender chooses which rules apply to their own signed bytes;
2. bind the item to one concrete send, so a disclosed
   (content, signature) pair cannot be replayed onto another message;
3. for media, bind the digest of the exact bytes a recipient decrypts
   and sees, its media type, and its byte length. A digest over
   ciphertext alone does not identify what was received, and a URL,
   storage locator, or provider identifier is not an authenticity
   commitment at all; and
4. bind every property the authority will later present as a fact about
   the material. Pixel dimensions are the concrete case: a case document
   and a reviewer's screen show them as attributes of the evidence, so a
   commitment that omitted them would have those numbers attributed to a
   signature that never covered them. Either the commitment binds them
   or the authority must not display them as attested.

**Media bytes do not travel in the report.** They exceed any sane JSON
body bound, and base64 in a signed object would make the report's
canonical bytes depend on an encoder's line-wrapping. An authority that
accepts media declares a separate content-addressed route and names the
bytes in the report by the digest the accused signed. Content addressing
carries the integrity: an upload is immutable because its name is its
hash, arriving twice is idempotent, and bytes hashing to anything else
are not the reported material regardless of who uploaded them.

An upload therefore needs no ownership scoping, sealing ceremony, or
single-use token to be safe to **accept** — referencing another
reporter's upload is useless without a signature over that same digest,
and such a signature *is* the evidence. Whatever authentication the
route carries is resource control, and a profile should say so rather
than present it as the integrity story.

**`EvidenceUpload` and `EvidenceUploadReceipt`.** The request is not a
JSON object: `evidenceUploadSchema` names a route shape, because the body
is the raw bytes and the only field is the digest, which is in the path.
The reference is `PUT /v1/evidence-blobs/:sha256` carrying
`x-onym-key`, `x-onym-timestamp` and `x-onym-signature` over
`evidence-blob:<sha256>:<timestamp>`, from a key holding a mandate,
within a freshness window. Per the paragraph above, that credential is
resource control and not the integrity story.

`evidenceUploadReceiptSchema` is a JSON object, and it is what the
uploader needs in order to write a commitment that will verify:

```json
{
  "sha256": "<lowercase hex of the plaintext bytes>",
  "mimeType": "image/jpeg",
  "byteLength": 51234,
  "width": 1200,
  "height": 1600,
  "derivativeSha256": "<sha256 of the normalized copy, if one was made>",
  "derivativeVersion": 1
}
```

There is deliberately no `expiresAt`. An uploader can compute one:
`unreferencedUpload` is the single deployment-wide period, it is in the
published manifest, and the upload time is the uploader's own. Stamping
it into the receipt would not make it more reliable, because the period
it derives from can be republished shorter — so a stamped deadline is
exactly as stale as the value behind it, while looking like a promise.
What is a promise is the obligation below: an acknowledgement means the
bytes are there, and an authority that answers success to a re-upload
restarts the clock. The residual sharp edge is real and stated here
rather than papered over — a period shortened after an upload is not
observable in anything the uploader already holds, and only re-reading
the published manifest reveals it.

`width` and `height` are the reason this receipt is specified rather
than left as "describes what was stored": constraint 4 below requires
the commitment to bind them, the authority compares the signed values
against what it decoded, and a mismatch is an authenticity failure. An
uploader that cannot read back what the authority measured is guessing
at values it must sign.

Three obligations come with that route, each one a place the merged
reference got it wrong before getting it right.

**An acknowledgement must mean the bytes will still be there.** If an
authority expires unreferenced uploads, a re-upload that answers success
has to restart that clock. Answering success while leaving the original
expiry in place lets the authority delete, moments later, bytes it just
confirmed it held, and the report naming them then fails against its own
acknowledgement.

**Deleting on refusal must be scoped to the uploader.** An authority
that refuses a filing and discards the bytes it named must discard only
uploads made by the filing key. The digests in a commitment are written
by the *sender* of the material, who therefore knows the digest of bytes
somebody else is about to report them for; unscoped, a refusal is a way
to destroy another party's pending evidence before their report lands,
repeatable until no report about that material can ever be filed.

**Bounds belong before the work, and cover the case as well as the
filing.** A commitment's length is chosen by whoever signed it, so the
count is bounded while reading it rather than after resolving it. And
because reports join an open case and responses accumulate on one, a
per-filing bound alone leaves a case able to gather an unbounded total —
every item of which is resolved each time the case document is built.

Normative constraints:

1. every evidence item verifies against the accused's key — content
   without an authenticity proof is a complaint, not evidence, and
   cannot alone support a verdict. For media this has a second half:
   the authority recomputes the digest of the bytes it holds and
   requires it to equal the one inside the signed commitment, together
   with the media type and byte length that commitment declares. A
   mismatch is an authenticity failure, not a format one — the bytes
   may be a perfectly good image, just not the one the proof attests
   to. Media an authority cannot decode, or whose declared media type
   is outside what it accepts, is refused rather than stored
   unexamined.

   An authority may also decline media for a class that declares
   `lawfulReporting` while still accepting text reports for it, and it
   declines by publishing — the `retention.preservation` map of §5.2
   constraint 10 is the surface, and a class needing terms it does not
   carry is refused. The
   permission is exactly as wide as that surface on purpose: a class with
   no reporting duty has nowhere to express a decline, so it accepts
   media on the ordinary rules, and an authority that takes no media at
   all says so once in `acceptedMedia` (§5.2 constraint 9) rather than
   class by class. Refusing on those grounds says
   nothing about the report's merit, and it must be legible before
   filing rather than discovered by being refused. Legible means
   readable in the authority's own manifest, without fetching a linked
   document and without filing to find out: `acceptedMedia` for a
   modality (§5.2 constraint 9), `retention.preservation` for a class
   (§5.2 constraint 10). Both are inside the bytes a mandate pins, so a
   decline that appears after consent is a term that was changed rather
   than a term that was published;
2. the reporter discloses only items they legitimately received; an
   authority that requests broader disclosure ("send us the whole
   conversation") is nonconforming;
3. reports are free to file — no bond, no fee — and carry weight per the
   authority's published reputation policy: a reporter's authority-local track
   record of upheld versus dismissed reports scales intake priority and, where
   the manifest says so, may gate case opening for lesser classes. The merged
   reference returns `intakeWeight` but every otherwise valid report opens or
   joins a case; it does not implement the optional gate;
4. reporter identity is visible to the authority, never to the accused
   unless the reporter consents; retaliation against inferred reporters
   is itself a violation class authorities should declare; and
5. jurisdiction follows the accused's mandate and standing follows the
   reporter's: a conforming authority accepts reports only against
   accused who mandated it, and only from reporters whose own mandate
   names it. Abuse arriving from a user of a different interface or
   authority is outside the reporter's authority's reach — the honest
   disposition is refusal (`no_jurisdiction`), with the reporter's
   local remedies (blocking, filtering) remaining interface features outside
   this seat. With the reporter's consent, an authority may countersign and
   forward the disclosed evidence to the accused's own authority, which treats
   it as a report with no local track record: lowest intake weight, identical
   authenticity verification, never an anonymous accusation. The merged
   reference has no forwarding operation. It permits a reporter to cite any
   still-stored mandate registered for their key, while accused jurisdiction
   uses that user's latest active mandate; replaying an older mandate does not
   restore broader classes.

#### 5.4.1 Authority client DTOs

The remaining authority-client schemas are complete boundary objects, not
implementation-local return types:

**Adoption boundary.** The JSON field shapes and authentication/error meanings
in this subsection are the v1 contract. Byte-exact retry identity and the
numeric limits of 32 responses, 32 appeals, eight notices, and eight
new-holder claims are merged-reference resource policy, not limits another
Authority inherits merely by implementing these DTOs.

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
not assert merit. `receivedAt` is only the receipt audit timestamp; it does not
anchor either window. `responseDeadline` reports the value derived from the
governing open-case verdict's signed `decidedAt`, and `decisionDeadline`
reports that verdict's signed fixed timestamp. The equal seconds in the example
are a possible atomic commit, not a derivation rule. An exact-byte retry returns
the same case and deadlines with `"duplicate": true` and omits
`intakeWeight`; reusing `(reporter, reportId)` for different raw bytes is
refused as an attempted rewrite.

There is at most one open case per `(accused, classId)`. A later valid report
joins it. Byte-identical evidence is attached without another notice; distinct
evidence issues a revised open-case verdict, restarts only the response window,
and, in the merged reference, is refused once the case has emitted eight
notices. The decision deadline fixed at initial opening never moves, and a
report arriving after it is refused rather than reviving the case.

The fixed decision deadline wins over every later procedural event. If a
distinct join restarts the response window so that it reaches or crosses the
decision deadline, the Authority may not truncate that response window, extend
the terminal deadline, or ban on an incomplete record: the case dismisses at
the fixed deadline. The same rule applies when any applicable open-case notice
is still undelivered or has become permanently undeliverable. Notice-before-ban
and no-late-ban therefore resolve the conflict toward dismissal.

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
  "recorded": true,
  "late": false
}
```

`CaseResponseReceipt` is the versioned result of `respond`; `late` reports how
the Authority classified the stored response and does not erase it.

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
appeal window; the merged reference bounds them to 32 filings per case.

```json
{
  "caseId": "case-<random-id>",
  "filed": true,
  "kind": "appeal | new-holder-claim",
  "note": "<non-sensitive filing status>"
}
```

`AppealReceipt` is the versioned result of `appeal`. Its indistinguishable
new-holder response must not reveal whether the named case or ban exists.

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

**Input digest.** Where a model profile records one — and every profile
that permits a model-assisted decision should, since it is what lets an
appeal establish what was judged — the value is a
digest over **everything the model was shown**, not over a textual
rendering of the case. It covers the document text, the identity of
every media item in evidence order, and — where the model is sent a
normalized derivative rather than the original bytes — the identity of
that derivative and the version of the transformation that produced it.
Two assessments differing in the image, the ordering, or the
normalization must not be able to record the same digest.

The simplest conforming construction is to write those identities into
the document text and hash that, so one digest keeps one meaning.
Hashing a rendering that omits the media is nonconforming: it claims to
pin what was reviewed while pinning only its captions, and an appeal
reconstructing the record from it reconstructs the wrong thing.

This document does not yet give the digest a field of its own in §5.6:
the merged reference carries it on the assessment above, and the
reference policy's own wording ("input-evidence digest") is what the
verdict's `reasoning` content-address resolves to. A profile that puts it
on the verdict directly should say so; either way the rule is about what
the value covers, not about which object holds it.

Where original and derivative differ, the original is the authenticated
evidence and the derivative is what was classified. Both identities are
recorded and neither substitutes for the other — "this is what the
accused sent" and "this is what the model saw" are different claims, and
a record that cannot distinguish them cannot answer an appeal about
either.

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

### 5.5 Case Notice and Response

```json
{
  "noticeVersion": 1,
  "caseId": "<random-id>",
  "authority": "onym:component:<authority-id>",
  "accused": "onym:key:<accused-identity>",
  "mandateRef": "<hash-of-accused's-mandate>",
  "classId": "unsolicited-pornography",
  "evidenceSummary": "<content-address: verified intake basis in verdict.reasoning>",
  "responseDeadline": "2026-08-13T00:00:00Z",
  "decisionDeadline": "2026-08-20T00:00:00Z",
  "signature": "<authority-signature-on-governing-open-case-verdict>"
}
```

`CaseNotice` is the interface's display projection of validated interim
`open-case` verdicts and the mandate-pinned manifest, not a second independently
signed authority object. Its fields have four provenance classes:

- `caseId`, `authority`, `accused`, `mandateRef`, `classId`, and
  `evidenceSummary` are projections of the governing signed verdict's `caseId`,
  `authority`, `accusedKeys`, `mandateRef`, `classId`, and `reasoning`;
- `responseDeadline` is derived from the governing verdict's signed
  `decidedAt` plus the class response window in the exact manifest
  authenticated and pinned by the mandate;
- `decisionDeadline` is copied from the governing verdict's signed, fixed
  `decisionDeadline`; and
- `noticeVersion` is a constant of the pinned interface-enforcement profile,
  not a field signed by the Authority.

`signature` is the governing verdict's signature; it is **not** a detached
signature over the serialized `CaseNotice`. The Interface must validate the
source verdict or verdicts, mandate, and manifest, then recompute every notice
field. It maps `verdict.reasoning` to `evidenceSummary` and computes
`responseDeadline = governingVerdict.decidedAt + class.responseWindow`. It
copies `decisionDeadline` from the authenticated verdict. Every open-case
revision carries the same fixed timestamp, so the Interface does not need the
original notice to survive unordered or permanently failed delivery. A joined
report with new evidence issues a revised open-case verdict whose `decidedAt`
restarts only the response window; its signed `decisionDeadline` never moves.

`evidenceSummary` is the notice name for that exact signed intake-basis value,
not a second hash or a summary invented by the Interface. Because a notice is
projected only from `open-case`, its source is §5.6 constraint 7 intake
reasoning; terminal findings are never projected into this field.

**Merged-reference status.** The current Authority verdict omits the fixed
`decisionDeadline`, and the Apple gate derives both displayed deadlines from
the latest governing verdict. After a revised notice it can therefore promise
a terminal deadline later than the Authority's actual one. Both halves are a
conformance gap against the authenticated derivation above. A consumer must
never accept an independently supplied notice merely because its `signature`
bytes validate as some verdict's signature.

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
  "disposition": "ban",
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

That is a terminal ban. The same schema has this distinct interim shape:

```json
{
  "verdictVersion": 1,
  "caseId": "<same-id>",
  "authority": "onym:component:<authority-id>",
  "mandateRef": "<hash-of-accused's-mandate>",
  "accusedKeys": ["onym:key:<accused-identity>"],
  "deviceBinding": "<platform-scoped-device-reference>",
  "classId": "unsolicited-pornography",
  "disposition": "open-case",
  "marks": {"case-open": true, "banned": false},
  "reasoning": "<content-address: verified intake basis>",
  "decisionDeadline": "2026-08-20T00:00:00Z",
  "decidedAt": "2026-08-06T00:00:00Z",
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
   a later reversal clears the sanction. A review-affirmation verdict under
   constraint 5 repeats the original `banExpires` value, including its absence
   for a permanent class, and never derives a new expiry from its later
   `decidedAt`. The interface clears the banned mark at expiry on the verdict's
   own authority, no further object needed;
4. `executeAfter` makes execution timing machine-checkable: required on
   every ban verdict, it must equal `decidedAt` in a `non-suspensive`
   class and `appealDeadline` in a `suspensive` one — the example above
   shows the suspensive case, where the marks field states the target
   state and `executeAfter` says when writing it becomes conforming. A
   missing or inconsistent `executeAfter` is `verdict_invalid`; no
   interface writes the banned mark before it. A review affirmation repeats
   the original `appealDeadline` and `executeAfter` verbatim; the timing formula
   is checked against the original ban, not the affirmation's later
   `decidedAt`;
5. `final` describes the issuing authority's ordinary-review state at the
   moment this immutable verdict is signed; it never controls execution timing,
   which comes only from `executeAfter`. An `open-case` verdict is never final.
   A dismissal is final. A ban issued while ordinary appeal remains available
   or pending has `final: false`; a later verdict affirming a completed review
   may carry `final: true` only when it repeats the original ban's
   `appealDeadline`, `executeAfter`, and `banExpires` verbatim. Its later
   `decidedAt` records the review decision but starts or extends no sanction.
   A reversal is a new final `dismiss` verdict. External-appellate and
   new-holder remedies may remain available even after the issuer's verdict is
   final. The merged reference emits initial bans with `final: false` and does
   not issue a later finalization object merely because the ordinary appeal
   window elapsed;
6. dismissals clear the case-open mark and are reported to the reporter
   (adjusting their track record) without disclosing the accused's
   response beyond the outcome; and
7. an `open-case` verdict is the interim object issued at case opening:
   its only permitted effect is `marks: {"case-open": true}`; its
   `reasoning` is required and states the intake basis — the verified
   reports the case rests on. It carries a signed `decisionDeadline` equal to
   the case's immutable initial deadline, and every revised open-case verdict
   repeats that exact timestamp. It carries no `banExpires`, no
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

- it validates verdict shape — including the authority signature and mandate
  reference to a mandate its user actually signed, class within the mandate,
  marks consistent with disposition, expiry present where required, and
  `executeAfter` present, consistent with the class's `appealEffect`
  (§5.6 constraint 4), and already reached — a valid ban before its
  `executeAfter` is stored, not executed, and writing its mark early is
  nonconforming. A final affirmation must also preserve the original ban's
  timing fields (§5.6 constraint 5). The Interface validates these mechanics,
  never the verdict's wisdom;
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
only party able to clear them. An interface **must** revoke a designation on
exactly two triggers, and on no other:

1. the authority reports its own compromise and names the compromise time.
   Marks set after that time clear immediately even if the designation itself
   survives; or
2. signed status queries remain unanswered for the declared bounded
   unreachability window (default: twice the manifest's longest
   `decisionDeadline`). Every attempt is recorded in the Interface write log,
   and the determination is published before any mark changes.

Revocation is public, disclosed, write-logged, and audit-attestable. Premature
or pretextual revocation — including store pressure, commercial interest, or an
interface vendor voiding its own affiliated Authority's inconvenient verdicts
— is provable nonconformance, not a quiet switch.

Its effect follows one rule:

> **A mark stands only while a living forum can hear a claim against it.**

Open cases dismiss and clear. Existing bans continue only while their appeal
recourse survives: a declared external appellate acts as successor-of-record
for appeals and new-holder claims; a ban with no surviving forum clears.

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
the two aggregate bits. Every enforcement profile records the provenance of
each platform write: the governing verdict reference or declared clearing
rule, requested aggregate state, write outcome, and tamper-evident chain
position. Field names and clearing-rule sentinels belong to the platform
profile rather than this abstract rail.

## 6. Authority contract surfaces

The authority profile has three wire facets. The interface-enforcement profile
is a fourth, separately owned dependency selected by ID/version in each signed
mandate rather than inlined into the Authority operations.

### 6.1 User → authority client

| Operation | Input | Result |
|---|---|---|
| `file-report` | Signed `Report` with authenticity proofs | `ReportReceipt` naming the opened/joined case, current deadlines, and intake weight; not a merits decision |
| `respond` | Routed case ID + signed `CaseResponse` containing the same case ID | `CaseResponseReceipt` or a typed refusal |
| `appeal` | Routed case ID + `AppealSubmission` containing the same case ID | `AppealReceipt`; ordinary appeals are authenticated, new-holder claims deliberately are not |
| `upload-evidence` | Content address + the exact bytes, from a consented key | `EvidenceUploadReceipt` (§5.4): digest, media type, byte length and the dimensions the authority decoded, which the commitment must then bind. Part of the v1 interface; whether a given authority accepts anything through it is its manifest's `acceptedMedia` (§5.2 constraint 9), not this list |
| `query-status` | Case ID + fresh party-signature headers, or moderator bearer token | The concrete `CaseStatus` in §5.4.1 |

The client selects the implementation for the authority named by the active
mandate. `respond` carries later evidence as additional `EvidenceItem`s; there
is no separate client-side `submit-evidence` operation — an evidence
*item* enters only through `file-report` or `respond`. `upload-evidence`
is not an exception to that: it carries no item, no claim and no
signature over content, only the bytes a later item will name by digest,
and an upload nobody names is adjudicated against nobody. Every conforming
authority exposes it, because `surfaces` describes the interface rather
than one deployment; what an authority will actually take through it is
`acceptedMedia` in its own manifest. The reference signing
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

A transient failure is retried with the identical finalized mandate. A
manifest-hash mismatch is not transient: because merged v1 accepts only the
currently published artifact, the interface abandons that enrollment attempt,
presents the new authenticated manifest for review, and obtains fresh consent
and signatures. It must not wedge indefinitely, register unseen terms, or
rewrite the old mandate. A future profile may instead permit registration
against a still-live archived manifest, but only with an authenticated lookup
and explicit retention semantics.

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

### 6.4 Mandate-pinned interface-enforcement profile

The Interface publishes and signs a platform-specific object with this shape:

```json
{
  "profileVersion": 1,
  "profileId": "onym:moderation-enforcement-profile:<platform-binding>-v1",
  "platform": "<device-mark platform>",
  "bindings": {
    "enroll-device": {"requestSchema": "<schema ID>", "resultSchema": "<schema ID>"},
    "countersign-mandate": {"requestSchema": "onym-moderation-mandate-v1", "resultSchema": "<platform-scoped schema ID>"},
    "register-mandate": {"requestSchema": "onym-moderation-mandate-v1", "resultSchema": "onym-moderation-mandate-receipt-v1"},
    "gate-check": {"requestSchema": "<schema ID>", "resultSchema": "<schema ID>"},
    "deliver-verdict": {"requestSchema": "onym-moderation-verdict-submission-v1", "resultSchema": "onym-moderation-verdict-receipt-v1"}
  },
  "caseNoticeSchema": "<platform-scoped CaseNotice schema ID>",
  "markBindings": {"case-open": "<platform value>", "banned": "<platform value>"},
  "specification": "<content-addressed-platform-specification>"
}
```

The directory entry for the Interface binds its profile URL and publisher key.
As with the Authority manifest, a detached signature at `<profile-url>.sig`
authenticates the exact response bytes. The mandate signs the profile ID and
version after the client authenticates that object; a given pair is immutable.
The `bindings` map registers every operation and request/result schema at the
integration boundary. `caseNoticeSchema` attaches the gate projection whose
meaning §12 versions. Its schema ID is platform-scoped; profiles may initially
share the field layout in §5.5 but never share a version namespace.
`markBindings` assigns the two abstract states to platform storage without
granting the Authority a write path.

Every Interface-owned enrollment, countersignature-result, gate-result, and
notice schema ID is platform-scoped. The mandate/mandate-receipt and
verdict-submission/verdict-receipt schemas remain shared because the Authority
profile owns those two cross-owner joins and registers their versions.

The Apple and Android instances are defined in
[Moderation-DeviceCheck.md](Moderation-DeviceCheck.md) §1 and
[Moderation-Device-Recall.md](Moderation-Device-Recall.md) §1. Their enrollment,
countersigning, and gate operations belong to the Interface. Registration and
delivery remain the cross-owner facets already declared in the Authority
profile; listing them here pins the schemas at those joins and does not transfer
ownership. Changing an interface-only binding, schema, `CaseNotice`, or mark
meaning versions the enforcement profile, not the Authority profile.

All facets follow the manifest's windows. A blown decision deadline is a
dismissal, never a sweep interval in which a late ban remains possible. Case
opening, joined notice issuance, and terminal decisions commit atomically.
Mandates and verdicts are content-addressed; report retry identity is stricter
and requires byte-identical raw JSON for the same `(reporter, reportId)`.
Delivery is detached and at least once: an Interface must tolerate an
identical verdict being attempted more than once. Whether an Authority
serializes its local queue drains is not a wire-contract property. Retryable
delivery failure cannot undo the already committed case transition.

**Merged-reference status.** The current prompt drain is single-flight and
re-arms when new work arrives, but the independent deadline sweep may overlap
it. Interface idempotency absorbs an exact duplicate; this implementation
detail is not required concurrency behavior for another Authority.

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
  adjudicated** — a declined intake counts the same as a decided case, so
  intake refusal, dismissal, and escalation do not change compensation; and
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
returned on later filings. There is deliberately **no reporter
bounty** — paid reporting industrializes false accusation. Track records
are pseudonymous, local to one authority, non-transferable, and not a
purchasable asset; the reputation policy is published so reporters know
what their standing means.

**Merged-reference status.** The Authority calculates and returns reporter
weight but does not currently use it to gate intake, as §5.4 constraint 3
records.

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
   preservation duty requires — and never reuse it commercially. Disclosed
   media is retained and deleted as one artifact: an original and every
   derivative made from it go together, since a deletion that leaves a
   legible copy behind has not deleted the material. Bytes uploaded for a
   report that was never filed are not case material and expire on their
   own bound. Nothing is deleted while a review that would examine it is
   pending — a deadline is not authority to decide a live appeal by
   destroying its subject.

   Two things outlive every period. The **mandate and verdicts behind a
   live mark** are kept while it is in force, because a device's marks
   carry no explanation and that record is the only thing that says what
   they mean or lets one be lifted — a permanent sanction therefore means
   a permanent record, which is not an exception to a schedule but the
   reason to have one. And the **identity of a filed report** may outlive
   its content: where an authority refuses a second filing under an id
   already used, deleting the row frees the id and lets a filing be
   rewritten, so the content goes and the claim on the identifier does
   not;
7. perform the lawful statutory reporting the manifest declares, and nothing
   beyond it. Where such a duty attaches, three properties follow, and
   each of them is a place a schedule and a duty pull in opposite
   directions:

   **A preservation hold outranks every declared period.** Its release
   date is fixed when the hold is placed, from the terms in force then,
   so a later and shorter period cannot cut a running duty short — the
   same reasoning that makes a case be judged by the manifest it pinned.

   **A period does not discharge a duty that was never performed.** The
   release date bounds how long material must be kept *after* it has
   been referred; it is not permission to discard evidence nobody passed
   on. An authority that releases on the date alone loses the material,
   loses the referral from whatever queue tracks it, and loses the
   ability to record the reference afterwards — an unperformed obligation
   disappearing behind a log line indistinguishable from a discharged
   one. Holding indefinitely and saying so is the conforming failure;
   holding quietly is not.

   **Referral is not gated on the case.** Response and appeal windows
   exist to give an accused a fair chance to answer. They are not a
   reason to delay a referral, and an authority whose deadlines held one
   up would have its case machinery working against the thing the
   referral is for.

   An authority need not perform the submission itself. Sealing a signed
   package for an operator to submit, and recording what the receiving
   body returned, is conforming and is the honest shape where the
   authority holds no credentials for the channel — provided the export
   is auditable, since it is the one path by which the material leaves;
8. publish promised anonymized statistics consistently, not only the numbers
   that flatter the authority; and
9. operate verdict-signing keys separately from operational keys and report
   compromise immediately to designating interfaces.

**Merged-reference status.** The Authority enforces obligations 2–5 and the
class windows/terms portion of obligation 1. It stores complete report,
response, case-document, and assessment bytes in SQLite. It applies the
retention schedule its manifest declares — resolving each per-case period
from the manifest that case's accused pinned, and treating a preservation
hold as outranking every period — but has no commercial-reuse control,
and does not execute
`lawfulReporting` itself beyond sealing a signed referral package for an
operator to submit; it does not publish promised statistics, validate affiliation or
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
| `authenticity_unverified` | Evidence intake | Item is complaint, not evidence; cannot alone support a verdict. Media whose bytes do not match what the commitment describes lands here rather than under a media code: the format is fine, the proof is not |
| `media_missing` | Media evidence names bytes the authority does not hold | Retryable once uploaded; distinct from a conflict, which on a content-addressed route means agreement |
| `media_unsupported` | Media type outside what the authority decodes, or bytes it cannot parse | Refused rather than stored unexamined |
| `media_too_large` | Upload exceeds `acceptedMedia.maxObjectBytes` | Refused; about the object, not the caller |
| `media_too_many` | The filing commits to more items than `acceptedMedia.maxItemsPerFiling`, or the case would pass `maxItemsPerCase` | About the count, and the two are distinguished in the message: one is retryable by filing fewer, the other is not retryable on that case at all |
| `media_quota_exceeded` | Uploader already holds `acceptedMedia.maxUnreferencedUploads` uploads no filing has named | Retryable after filing or abandoning them. Deliberately not a size code: a client reading only a size refusal shrinks the image and retries forever against a limit that is not about size |
| `media_class_refused` | The class carries a reporting duty (`lawfulReporting`) and this authority publishes no `preservation` terms for it, so it declines the material | Terminal here, not everywhere: declining is a per-authority declared term, so another authority may accept the same report. Text reports for the class are unaffected |
| `media_unreviewable` | This authority's pinned profile cannot review the modality | Not the same as the class refusing it — the identical report at an authority pinned to a capable profile would be accepted, and a client can act on that difference |
| `reporter_unconsented` | Report intake | Report refused; reporting requires a mandate |
| `no_jurisdiction` | Report intake | Accused has no currently registered mandate naming this authority, or the consented manifest expired; refused locally, with consented forwarding permitted by §5.4 constraint 5 |
| `window_closed` | Time | Reference v1 records a late response; a late appeal or post-deadline joined report is refused with HTTP 410 |
| `case_state` | Requested transition does not fit the stored case | HTTP 409; do not retry unchanged |
| `not_found` | Missing case or failed case-party proof | HTTP 404 with the same shape to avoid an existence/party oracle |
| `no_response` | Accused | Decide on record per manifest |
| `decision_overdue` | Authority sweep | Authority signs and delivers a dismissal; the interface clears `case-open` when that verdict is received and reconciled |
| `verdict_invalid` | Interface validation | Not executed; bad shape, signature, or bounds |
| `verdict_not_yet_valid` | Signed `decidedAt` is beyond allowed clock skew | HTTP 425; retry the same bytes later |
| `mark_write_failed` | Platform | Retry; verdict remains valid; identity refusal applies meanwhile |
| `appeal_filed` | Within window | Filing is recorded for human review; it does not change the immutable `executeAfter`, and only a later reversal clears the ban |
| `new_holder_claim` | Unauthenticated claim against a case ID | Reference v1 always acknowledges, stores only against a ban, and bounds storage to eight claims |
| `authority_key_compromise` | Authority report or Interface determination | Clear marks set after the named compromise time; unresolved compromise escalates to the exhaustive revocation procedure in §5.7 |
| `authority_defunct` | Manifest lapse without succession, or completed bounded-unreachability procedure | Refuse new mandates/cases; open cases dismiss; bans follow the living-forum rule and clear where no appellate survives |
| `internal_error` | Store or invariant failure | HTTP 500; retry only after operator inspection |

`authority_key_compromise` and `authority_defunct` are required contract
signals for the §5.7 procedure. The merged services do not yet emit or consume
them; that absence is part of the revocation conformance gap, not permission to
substitute an untyped administrative action.

Case lifecycle:

```text
mandate_signed (onboarding, before any case)
  -> mandate_registered (authority jurisdiction becomes usable)
       -> report_filed (authenticity verified, reputation weight recorded)
            -> intake_declined -> closed (where the manifest gates intake)
            -> case_opened or joined by (accused, class)
                 -> open-case verdict delivered -> case-open mark set -> notice served at gate
                 -> new distinct joined evidence -> revised notice; response window restarts
                    (decision deadline remains fixed)
                 -> responded (including late) | no_response
                 -> decided within deadline
                      -> dismissed -> marks cleared -> closed
                      -> banned -> banned mark set -> [appeal?]
                           -> ordinary appeal recorded -> moderator review
                           -> new-holder claim recorded -> review
                           -> reversed -> dismissal verdict -> marks cleared -> closed
                           -> otherwise runs to banExpires, or forever if permanent
                 -> decision_overdue -> dismissed -> marks cleared -> closed
```

No late ban can commit after the fixed decision deadline. **Every conforming
path terminates:** deadline passage is dismissal, and the Interface-side
default clears `case-open` even if the Authority never returns.

**Merged-reference status.** The current Authority must eventually run its
deadline sweep and deliver the dismissal because the Apple Interface has no
independent default. Permanent disappearance can therefore strand
`case-open`; that is the conformance gap described in §3.5 and §5.7, not the
contract lifecycle.

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
  inter-service envelope meaning changes. The mandate-pinned
  interface-enforcement profile versions its own enrollment, countersigning,
  gate, `CaseNotice`, and mark meanings independently. Violation classes are
  additive per authority manifest, and class definitions are immutable once
  consented.
- Version 1 has no deployed consumer or persisted profile object. Its first
  usable definition therefore includes the `surfaces` shape, the mandate
  enforcement-profile pin, and the signed open-case `decisionDeadline`;
  earlier repository sketches are not supported wire versions. Validators
  require `surfaces`, reject the old `operations`/`markStates` keys, require the
  mandate pin, and require the fixed deadline on every open-case verdict. Once
  a consumer deploys or persists this profile, every further incompatible
  change bumps the affected profile/schema normally.
- Mandates are immutable; a manifest change binds only mandates signed
  after it. Verdicts are immutable; corrections travel as reversal
  verdicts through the declared appeal path, never edits.
- Cross-platform fixtures cover: Authority-profile validation (required
  `surfaces`, request/receipt schema IDs for every operation, and rejection of
  the old `operations`/`markStates` shape);
  enforcement-profile validation (authenticated immutable ID/version, complete
  operation/schema registry, `CaseNotice` registration, and mark bindings);
  mandate validation (manifest hash or enforcement-profile pin mismatch,
  missing class terms, directory/manifest component and operator mismatch,
  invalid detached manifest signature, user/interface signature failure,
  future `acceptedAt`, raw-bytes/decoded-fields mismatch, and a hosted manifest
  changing between review and agreement);
  report authenticity verification
  (valid proof, forged proof, proofless complaint); media evidence
  (exact commitment preimage bytes for every version the format
  defines, a flipped byte in the referenced object, a commitment
  misstating media type or byte length, a media array inside a version
  that does not define one, an unknown version, evidence naming bytes
  the authority does not hold, and a class that declines media) — the
  preimage bytes in particular are a cross-implementation fixture,
  because a signer and a verifier written in different languages agree
  on them by construction and nothing else would catch the drift — the
  merged reference now carries one such vector, duplicated in both
  repositories so that changing either half breaks both;
  input-digest sensitivity to the media item, its ordering, and the
  normalization version; modality handling (a profile that cannot review
  the modality issues no model request at all, while a case over the
  permitted count is decided on the subset with the remainder recorded —
  and a test that only covers the first of those misses the acquittal
  route entirely); retention (a period resolved from the case's pinned
  manifest rather than the published one, a preservation hold blocking
  each deletion path *individually*, a hold not released while its
  referral is unrecorded, a live mark keeping its sanction record, and a
  report identifier still claimed after its content expires); notice and window
  arithmetic including timezone-hostile boundaries; verdict shape
  validation at interfaces (no mandate, class outside mandate, missing
  expiry, marks inconsistent with disposition, missing or inconsistent
  `executeAfter`, open-case verdicts carrying sanction effects or
  lacking intake reasoning or the signed fixed `decisionDeadline`);
  suspensive versus non-suspensive appeal execution including early-write
  refusal and affirmation timestamp preservation; revocation-trigger validation
  (exhaustive trigger selection, compromise-time clearing, unreachability
  window arithmetic, logged attempts, publication-before-write, and
  living-forum mark disposition); decision-deadline
  default execution; expiry clearing; reversal clearing; and
  new-holder claim recording. Surface fixtures also cover §6:
  receipt-is-not-a-merits-decision semantics, exact-byte report retries,
  complete evidence retention in a signed response, ordinary versus
  unauthenticated bounded new-holder filing, authenticated
  status confidentiality, idempotent mandate registration, mandate-pinned
  manifest selection for verdict delivery, notice derivation through the gate,
  joined-evidence notice dedupe/caps and fixed terminal deadlines,
  signature-only interface countersigning, UTF-8 byte-order canonicalization,
  replay/idempotency behavior, duplicate at-least-once delivery, and
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
main](https://github.com/onymchat/onym-moderation/tree/d08e55cc2dac8a3db90f70d3445552366b4ec9ef)
(through PR #10) is the concrete reference for the current v1 Authority and
Apple-enforcement wire shapes. It is not a substitute for the abstract MUSTs;
the status below makes its nonconformance explicit. Its HTTP routes map as
follows:

Those merged builds predate the first usable v1 definition in §12. Their
legacy objects are implementation evidence, not wire-compatible
`consent-bound-v1` merely because they carry the same version string;
validators must reject them whenever required `surfaces`, mandate pins, signed
fixed deadlines, or other current fields are absent.

| Reference route | Contract operation |
|---|---|
| `GET /manifest.json` | Fetch exact authority-manifest bytes; detached authenticity remains the directory binding |
| `POST /v1/mandates` | `register-mandate` |
| `POST /v1/reports` | `file-report` |
| `PUT /v1/evidence-blobs/:sha256` | `upload-evidence`. Content-addressed evidence bytes for a report that names them by digest; its own body limit, and idempotent by construction — a repeat restarts the object's expiry rather than merely answering success |
| `POST /v1/cases/:caseId/respond` | `respond` |
| `POST /v1/cases/:caseId/appeal` | `appeal` |
| `GET /v1/cases/:caseId/status` | `query-status` |
| authority POST to interface `/v1/verdicts` | `deliver-verdict` |
| `GET /v1/write-log` on the interface | Audit-token-protected hash-chain view; each entry exposes storage `authorized_by` as wire `authorizedBy` |
| `POST /v1/cases/:caseId/decide` | Authority-operator command, not a cross-owner profile operation |
| `POST /v1/verdicts/:verdictRef/requeue` | Authority-operator repair command for a permanently refused delivery |
| `GET/POST /admin...` | Shared-token moderator panel, appeal/new-holder review, and the referral workflow — sealing the signed package for an operator to submit and recording what the receiving body returned, with the export audited as the one path by which preserved material leaves. Operator UI, not a cross-owner profile operation |
| `GET /health` on either service | Informative operator health, key, and delivery state; not a case operation |

The implementation stores immutable mandate-pinned manifest snapshots, opens or
joins a case for every valid report, requires every issued notice to reach the
interface before a ban, keeps a joined case's terminal deadline fixed, and
commits opening, renoticing, decisions, and claim review transactionally.
PR #4 adds off/advisory/autonomous local-model triage modes, consent-bound
model profiles, a shared-token moderator panel, human appeal/new-holder review,
and the extended `CaseStatus` assessment and claim fields in §5.4.1.

`onym-moderation` PR #38 and `onym-ios` PRs #238/#239 add reported images;
PR #39 adds the retention schedule, preservation holds and referral.
The commitment format is the iOS chat proof preimage at version 2, which
adds a `media` array binding each attachment's plaintext digest, media
type, byte length and pixel dimensions, which satisfies commitment
property 4 of §5.4: the authority refuses an image commitment that carries no
dimensions and compares the signed pair against what it decoded, so the
numbers a case document prints are the numbers the accused signed.
Version 1 preimages are unchanged byte for byte,
and a `media` array inside one is refused. Bytes travel on
`PUT /v1/evidence-blobs/:sha256` under its own body limit, and the report
names them by the digest the accused signed. The case document carries
each image's original digest, derivative digest, transformation version
and dimensions inline, so the existing document hash satisfies the input
digest rule above without a second digest scheme. `ModelProfile` gained
an enforced image capability and per-profile maximum drawn from the
published profile documents, which already stated both; a profile
declaring support with a zero maximum is treated as taking none, and a
case over the maximum is decided on the subset with the remainder named
on the assessment rather than left undecided.

Its manifest declares a `retention` schedule and enforces it, resolving
each per-case tail from the manifest that case's accused pinned. The
unreferenced-upload period is the one deployment-wide value, because an
upload no report named belongs to no case. Preservation holds outrank
every period, are not released while a referral is unrecorded, and gate
every deletion path through one predicate. `csam` accepts media only
where the manifest declares preservation for it, and the reference
manifest declares none — so the reference behaviour is still refusal,
with the bytes deleted before the refusal returns.

Four conformance nuances. Its manifest carries neither `acceptedMedia`
nor `modelProfile.inputs`: what it accepts, its 4 MiB object ceiling,
its bounds of 8 items per filing and 24 per case, and its 16
unreferenced uploads are all compiled-in constants, so a client cannot
learn any of them without filing and being refused. The direct breach
is §5.2 constraint 9, which requires the field; §5.4 constraint 1 is
what that field exists to satisfy. Its intake bounds also answer with
`bad_request`
rather than `media_too_many`, which is the same fact reaching the client
in a shape it cannot act on. Its retention anchors do not lengthen
`caseRecord` for a case whose sanction is still in force, so on a
permanent ban the record would go at 400 days while the mark stayed
appealable; the reference manifest declares no permanent class, so the
combination is unreachable there today. The §5.2 example does declare
`banTerm: "permanent"` for `csam`, which is not an oversight in either
place — the example is what a manifest exercising the full contract
looks like, and the reference deployment is a narrower one. An operator
copying the example onto the current reference would reach the gap.

And the reference decides *which*
classes need
preservation terms from a hardcoded list rather than from the manifest's
`lawfulReporting` declarations, as §5.2 constraint 10 specifies. Its list
and those declarations currently name the same single class, so the
behaviour agrees; a manifest that declared `lawfulReporting` for another
class would diverge, and the list is what would have to change.

The implementation gaps are equally part of its status: **the repository
has no continuous integration at all**, so every test result claimed for
the media and retention work was produced locally by its author and
verified by no second party — which for changes whose failure modes are
retaining material against a published promise or destroying it against a
duty is the gap most worth closing first. The multimodal request shape is
asserted only against a stub, never against a real inference server, so
in autonomous mode the input format of a pipeline that signs bans without
human review is untested. Attachments sent
before commitment version 2 existed cannot be authenticated at all and are
permanently unreportable, which is a property of the commitment rather
than a missing feature; video, album and voice attachments are signed at
send time but no authority accepts them as evidence; a referred case is
never decided and so is dismissed at its decision deadline, which the
reference publishes but which leaves the seat with no sanction of its own
for that class; the moderator panel authenticates with a shared
deployment token, so nothing records *which* person exported a referral
or reviewed an appeal; decode runs off the async runtime under a permit
but total memory across concurrent uploads is bounded only by that
permit count; the reference
authority declares no `preservation` terms and therefore declines media
for `csam`, so its most serious class remains text-only; nothing verifies
that a deletion propagated to an operator's backups, and the schedule
speaks only for the service's own storage; new-holder claims are
unauthenticated and eight-slot exhaustible; external appellate routing,
affiliation validation, designation-revocation,
statutory-reporting execution, statistics, and compromise-notification
mechanisms do not exist; mandate withdrawal, reputation-gated intake, and consented report
forwarding are absent; current Authority verdicts omit the signed fixed
`decisionDeadline`, and revised Apple notices derive a misleadingly late
displayed terminal deadline; the Authority is configured for one interface
key, delivery URL, and token; all human deciders share deployment tokens with
no individual moderator identity; current iOS and Rust mandate DTOs omit the
enforcement-profile pin; the Apple
service's authority-signature enforcement defaults off; numeric
manifest/mandate/report/verdict version fields are decoded but not rejected
when they differ from 1; Authority startup does not validate the moderation
seat/profile ID. There is no production deployment. The iOS authority client
is URLSession-backed and registers the finalized two-signature mandate with
the Authority from the consent flow, as the DeviceCheck profile records.

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
   mandate, its intake reasoning, or its signed fixed `decisionDeadline` sets
   the case-open mark; no review affirmation extends the original execution or
   expiry horizon;
4. open cases dismiss and clear on fixed decision deadlines even if the
   Authority never returns; a dead or compromised designation follows §5.7's
   bounded, audit-attestable forum rule;
5. no conforming object or endpoint scans undisclosed content, requests keys,
   pays for a ban/case opening, offers reporter bounties, or authorizes evidence
   reuse beyond declared adjudication, retention, and lawful-reporting bounds.
   Every period an authority applies is one it published and one the
   affected case's accused consented to; no declared period deletes
   material under an unperformed preservation duty; and no party able to
   add evidence to a case can, by doing so, choose its outcome;
6. a banned device holder receives the governing verdict, authority contact,
   duration, ordinary appeal path, and new-holder path at the gate;
7. reporters can file reports and query cases to which they are attached;
8. accused users can respond, appeal, and query status, while new holders can
   invoke the declared remedy without the former holder's key;
9. the Authority accepts exact countersigned mandate registration, including
   its authenticated enforcement-profile pin;
10. notices and verdict state arrive only through validated Interface delivery,
    and no Authority call can countersign a user mandate or write a device mark;
11. a second Authority and a second Interface can adopt the profiles
   without coordination with the first; and
12. the protocol remains fully usable by clients that never signed any
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
