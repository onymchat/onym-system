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
validated, and enforced without choosing a device-attestation vendor or
client architecture. The implementation profiles in §13 map those
invariants onto a platform. Where a profile describes current code, that
description is informative: an incomplete implementation does not weaken
the normative boundary, and a convenient implementation detail does not
silently become a cross-platform requirement.

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
  mechanically — it decides nothing, delays nothing, and adds nothing.
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

§6 groups these five logical interfaces into three transport facets by
caller, direction, and owner; it does not collapse their responsibilities.

## 2. What the moderation seat does

A conforming moderation authority can:

1. publish a signed manifest declaring its violation classes, per-class
   procedure and ban terms, evidence rules, decision timelines,
   confidentiality policy, fee offers, and appeal path;
2. accept designation by interfaces whose users may consent to its published
   manifest at onboarding; this is an interface–authority governance
   relationship, not a per-user acceptance call or authority countersignature;
3. receive signed `Report` objects from consented users, weighted by the
   reporter's authority-local track record;
4. open a case, serve notice to the accused through the interface, and
   hold the response window its manifest declares;
5. issue a signed, reasoned `Verdict` — case opening (interim), dismissal,
   or ban — within the decision deadline;
6. conduct the declared appeal path, including reversal verdicts; and
7. answer status queries about its own cases within its confidentiality
   rules, and publish the anonymized statistics its manifest promises.

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
physical device.
That is also why the sanction is grave: a device mark punishes hardware
that may later carry a different, innocent person. The contract answers
with the tightest bounds in this repository — declared durations,
mandatory appeal, a new-holder appeal class, and a default disposition
of dismissal when the authority goes silent.

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

Authorities fail: they vanish, stall, or are compromised. If a stalled
case leaves a device marked indefinitely, the authority has acquired
hostage power the seat must not hold. Every case therefore carries a
decision deadline from the manifest, and the default disposition at the
deadline is **dismissal with the case mark cleared** — the worst-case
authority is an absent one, never an omnipotent one (the same rule the
arbitration seat applies to absent arbiters).

## 4. Logical topology

```text
onboarding (before any case)
     │  user signs ModerationMandate
     │  naming the interface's declared authority
     v
┌─────────────┐  signed Report        ┌─────────────────────────────┐
│ Reporter    │──────────────────────>│ Moderation Authority        │
│ (discloses  │  disclosed content    │ manifest · procedure ·      │
│  own copy + │  + authenticity proof │ judgment · reputation       │
│  authenticity│                      └───────┬──────────────▲──────┘
│  proof)     │                               │ CaseNotice   │ Response,
└─────────────┘                               v              │ evidence
                                      ┌──────────────────────┴──────┐
                                      │ Accused                     │
                                      │ notice · response window ·  │
                                      │ appeal                      │
                                      └─────────────────────────────┘
                                              │ signed Verdict
                                              v
┌─────────────────────────────────────────────────────────────────┐
│ Interface (enforcement rail)                                    │
│ validates verdict shape + mandate · executes mechanically       │
└──────────────┬──────────────────────────────┬───────────────────┘
               │ device-mark write            │ identity refusal
               v                              v
   ┌───────────────────────┐      ┌───────────────────────────┐
   │ Device-mark platform  │      │ This interface refuses    │
   │ mark 1: open case     │      │ the named identity keys   │
   │ mark 2: banned        │      │ (its own surface only)    │
   └───────────────────────┘      └───────────────────────────┘

   No verdict reaches a user who never signed the mandate. No mark
   moves without a signed verdict. Absent authority -> dismissal and
   a cleared case mark at the deadline.
```

## 5. Boundary objects

### 5.1 Moderation Profile

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
    "authorityOutbound": [
      "serve-notice",
      "issue-verdict"
    ],
    "interfaceEnforcement": [
      "enroll-device",
      "countersign-mandate",
      "gate-check"
    ]
  },
  "mandateSchema": "onym-moderation-mandate-v1",
  "reportSchema": "onym-moderation-report-v1",
  "reportReceiptSchema": "onym-moderation-report-receipt-v1",
  "caseNoticeSchema": "onym-moderation-case-notice-v1",
  "caseResponseSchema": "onym-moderation-case-response-v1",
  "appealSchema": "onym-moderation-appeal-v1",
  "caseStatusSchema": "onym-moderation-case-status-v1",
  "verdictSchema": "onym-moderation-verdict-v1",
  "markStates": ["case-open", "banned"],
  "errorSchema": "onym-moderation-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The facets are ownership boundaries, not alternate names for one service.
`authorityClient` contains requests a user initiates toward the authority.
`authorityOutbound` contains signed authority objects delivered through the
interface. `interfaceEnforcement` belongs to the interface vendor and is the
only surface allowed to enroll a device, countersign a mandate, read or write
device marks, or decide the app's gate state. An authority implementation may
share transport with an interface implementation, but conformance never lets
that erase which key and role authorize an operation.

### 5.2 Authority Manifest

```json
{
  "version": 1,
  "componentId": "onym:component:<authority-id>",
  "seat": "moderation",
  "operator": "onym:key:<authority-identity>",
  "moderationProfileId": "onym:moderation-profile:consent-bound-v1",
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
   not execute until the appeal window passes unused or the appeal
   concludes; `non-suspensive`: the ban executes at once and appeal can
   only reverse it); a class missing any of them is invalid at mandate
   validation. Where appeals are heard is the manifest-level `appellate`
   declaration, shared by all classes;
2. `banTerm` is `permanent` or a declared duration; permanent terms are
   only valid on classes whose definition the manifest justifies as
   warranting them, **and only where the manifest's `appellate` names
   a well-formed, non-empty `onym:component:` reference to an authority
   other than the issuer** (`self` remains valid only for manifests
   declaring no permanent class) — a permanent ban remains
   appealable at that external appellate for as long as it is in
   force, not merely within the appeal window, and remains subject to
   the new-holder procedure, so no permanent sanction depends on its
   issuer staying alive (on issuer failure the appellate is
   successor-of-record under §5.7's forum rule);
3. `newHolderAppeal` is mandatory: device marks can survive a transfer to
   a different person, so every manifest must publish the procedure by
   which that person can obtain review;
4. class definitions are content-addressed: a user consents to exact
   wording, and the authority cannot edit the definition under existing
   mandates;
5. an authority operated by (or affiliated with) an interface vendor
   states so in the manifest, or is nonconforming;
6. `validUntil` bounds the authority's power to accept new mandates and
   open new cases, not to finish live process: cases opened before
   expiry proceed to their declared deadlines, appeals of in-force bans
   remain hearable for as long as the ban runs, and an authority whose
   manifest lapses without renewal or declared succession is defunct —
   open cases fall to the dismissal default and interfaces revoke the
   designation under §5.7's bounded procedure; and
7. authenticity and consent bind one byte artifact: the manifest fields
   used to derive mandate classes, the bytes whose hash the mandate pins,
   the bytes authenticated by the authority, and the bytes retained for
   later display and verdict validation are the same artifact. Pairing the
   decoded fields of one manifest with the bytes of another is
   nonconforming.

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
   client to persist the rebuilt object; and
7. withdrawal is leaving the interface. Withdrawal ends exposure to new
   cases; it does not clear marks already set by valid verdicts —
   otherwise every ban would be voidable by re-onboarding — and it
   neither dissolves a case already opened nor tolls its windows:
   notice is constructively served when made available on the
   interface's declared notice path for the enrollment, the case
   proceeds on the record as `no_response`, and the resulting verdict
   binds and executes under the profiles' queued-write rules. Going
   dark mid-case is a weak defense, not an exit.

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
   scales intake priority and, per manifest, may gate case-opening for
   lesser classes;
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
   outside this seat. An authority MAY, with the reporter's consent,
   countersign and forward the disclosed evidence to the accused's own
   authority, which treats it as a report with no local track record:
   lowest intake weight, identical authenticity verification, never an
   anonymous accusation.

### 5.5 Case Notice and Response

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
  "signature": "<authority-signature>"
}
```

The notice is served through the interface, which must present it to the
accused with the evidence, the class definition consented to, and the
response path. The response mirrors the report's shape: signed
statements and counter-evidence (for example, proof of context that
changes the disclosed item's meaning). A missing response does not
concede the case; it proceeds to decision on the record — no-show is a
weakness, not a confession. On case opening, the authority issues an
interim `open-case` verdict (§5.6) setting the **case-open mark**; it is procedural state,
not a sanction, and the interface must not degrade service on it beyond
displaying the case's existence to the device holder.

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
   executes only when the appeal window lapses unused or the declared
   appeal concludes upholding it. The verdict's `banExpires` states
   the unappealed path (`decidedAt + banTerm`, or
   `appealDeadline + banTerm` for suspensive classes — the example
   above shows the suspensive case: decided 2026-08-18, appeal window
   to 2026-09-17, ban served to 2026-12-16); when an actual appeal
   shifts execution, the interface derives the operative expiry as
   execution time plus `banTerm` and records it in its write log. The
   interface clears the banned mark at expiry on the verdict's own
   authority, no further object needed;
4. `executeAfter` makes execution timing machine-checkable: required on
   every ban verdict, it must equal `decidedAt` in a `non-suspensive`
   class and `appealDeadline` in a `suspensive` one — the example above
   shows the suspensive case, where the marks field states the target
   state and `executeAfter` says when writing it becomes conforming. A
   missing or inconsistent `executeAfter` is `verdict_invalid`; no
   interface writes the banned mark before it; a filed appeal
   supersedes the timestamp per the class's appeal effect;
5. `final` is false until the appeal deadline passes or the declared
   appeal concludes; whether a non-final ban executes meanwhile follows
   the class's consented `appealEffect`; a reversal on appeal is a new
   verdict that clears marks;
6. dismissals clear the case-open mark and are reported to the reporter
   (adjusting their track record) without disclosing the accused's
   response beyond the outcome; and
7. an `open-case` verdict is the interim object issued at case opening:
   its only permitted effect is `marks: {"case-open": true}`; its
   `reasoning` is required and states the intake basis — the verified
   reports the case rests on; it carries no `banExpires`, no
   `executeAfter`, and no `appealDeadline` (the response window is the
   accused's remedy), it is never `final`, and it is superseded by the
   case's terminal verdict or by the decision-deadline default.

### 5.7 Device marks and enforcement binding

The abstract rail is two per-device states scoped to the interface
vendor's platform credentials:

| Mark | Meaning | Set by | Cleared by |
|---|---|---|---|
| `case-open` | A moderation case exists against this device | Valid interim `open-case` verdict (§5.6) | Dismissal, ban verdict (superseded), decision-deadline default, or designation revocation |
| `banned` | An executed ban verdict is in force | Valid ban verdict, at or after its `executeAfter` (§5.6 constraints 3–4) | Verdict expiry, reversal on appeal, new-holder appeal verdict, or designation revocation where no forum survives (§5.7) |

The interface executes verdicts mechanically:

- it validates verdict shape — authority signature, mandate reference to
  a mandate its user actually signed, class within the mandate, marks
  consistent with disposition, expiry present where required, and
  `executeAfter` present, consistent with the class's `appealEffect`
  (§5.6 constraint 4), and already reached — a valid ban before its
  `executeAfter` is stored, not executed, and writing its mark early is
  nonconforming — never the verdict's wisdom;
- a device whose `banned` mark is set is refused service by this
  interface: the application declines to operate and displays the
  verdict reference, the authority's contact, and the appeal path
  (including the new-holder path) — a silent brick is nonconforming;
- the named identity keys are refused within this interface's surfaces
  for the ban's duration — on every device, not only the marked ones —
  while device marks reach only the devices the verdict names; the
  interface does not propagate the refusal to couriers, notaries, or
  any other seat; and
- the authority may publish its verdicts (anonymized per its
  confidentiality policy); other interfaces and seats MAY consult them
  but are bound only by verdicts under mandates their own users signed.

The authority's key can sign verdicts; it can never write marks. The
interface can write marks; it can never originate them. A compromised
authority key is bounded to its consented population, and the remedy
depends neither on the authority's candor nor on the interface's
discretion. An interface **must** revoke a designation on exactly two
triggers, and on no other:

1. the authority reports its own compromise (naming the compromise
   time — marks set after that time clear immediately even where the
   designation itself survives); or
2. a bounded unreachability procedure completes: signed status queries
   unanswered for a declared window (default: twice the manifest's
   longest `decisionDeadline`), every attempt recorded in the
   interface's write log, and the determination published before any
   mark changes.

Revocation is a public, disclosed, write-logged act, and the record is
audit-attestable — a premature or pretextual revocation (store
pressure, commercial interest, a vendor voiding its own authority's
inconvenient verdicts) is provable nonconformance, not a quiet switch.
Its effect on marks follows one rule, stated here and applied wherever
authority failure appears in this document:

> **A mark stands only while a living forum can hear a claim against
> it.**

On revocation: open cases fall to the dismissal default and their
case-open marks clear. Issued bans persist exactly as long as their
appeal recourse does — a ban whose manifest names an external
`appellate` (mandatory for permanent classes, §5.2 constraint 2) runs
to its declared expiry or permanent term with that appellate acting as
successor-of-record for appeals and new-holder claims; a ban whose only
forum was the dead issuer clears with the revocation.

## 6. Common moderation surfaces

The moderation boundary is not one authority RPC interface. It has three
facets whose direction and ownership remain distinct in every transport.

### 6.1 User → authority client

| Operation | Input | Result |
|---|---|---|
| `file-report` | Signed `Report` with authenticity proofs | `ReportReceipt` (`reportId`, `receivedAt`) acknowledging receipt for intake; not a case opening or merits decision |
| `respond` | Case ID + signed `CaseResponse` (statement and zero or more `EvidenceItem`s) | Acknowledgement that the response/evidence entered the record, or a typed refusal |
| `appeal` | Case ID + signed `AppealSubmission` (`appeal` or `new-holder-claim`) | Acknowledgement that review opened, or a typed refusal such as `window_closed` |
| `query-status` | Case ID + party credential | `CaseStatus`: case ID, lifecycle stage, and applicable response/decision deadlines, bounded by confidentiality |

This is the authority contract surface visible to a reporter, accused party,
or device holder. The client selects the implementation for the authority named
by the active mandate; callers cannot redirect a signed case object to an
unrelated authority and acquire jurisdiction there.

`respond` carries later evidence as additional `EvidenceItem`s in the same
signed shape. There is no separate client-side `submit-evidence` operation:
splitting identical signed submissions into two methods would add transport
surface without adding authority. An authority may represent the two actions
separately inside its case system, but both cross this boundary as `respond`.

`ReportReceipt` proves only that the authority received the report for intake.
It does not assert that authenticity passed, that a case opened, or that the
report will be upheld. Mutating calls are signed by the initiating identity;
`query-status` authenticates the requesting party and reveals no more than the
manifest's confidentiality policy allows.

A `CaseResponse` or `AppealSubmission` signature binds a domain separator, the
operation name, case ID, and every submitted field. Signing only the body while
passing `caseId` beside it would permit replay into another case and is
nonconforming. The same whole-object rule applies to a `Report` and its
`reportId`.

### 6.2 Authority → interface delivery

| Operation | Authority object | Interface result |
|---|---|---|
| `serve-notice` | Signed `CaseNotice` after case opening | Notice is made available to the accused; a valid interim verdict sets `case-open`; normal operation continues |
| `issue-verdict` | Signed terminal `Verdict` after record closure, or signed interim `open-case` verdict at case opening | Interface validates it mechanically, stores it until `executeAfter` where required, and returns the resulting case/ban display state through its gate |

These are authority actions, not methods a user calls. The authority delivers
signed objects to the interface vendor's enforcement backend; it never writes
platform marks and never tells an app to trust an unvalidated display state.
The app receives notices and verdict state through the interface gate. The
reporter receives only the permitted outcome, through authenticated status or
notification, not the accused's confidential response.

### 6.3 User → interface enforcement

| Operation | Input | Result |
|---|---|---|
| `enroll-device` | Attested device request signed by the user identity | Opaque vendor-local `deviceBinding` after existing mark state is resolved |
| `countersign-mandate` | Exact user-signed `ModerationMandate` | Interface signature only; never a rebuilt mandate |
| `gate-check` | Attested, identity-signed request with active mandate reference when present | `clear`, `case-open` with notices, `banned` with recourse state, or `check-required` |

The authority does **not** accept or countersign each user's mandate. Its
published manifest is the offer; the user's signature accepts it, and the
interface countersigns the exact mandate because the interface owns the
enforcement rail. Authority designation is a separate interface-governance
decision recorded in the interface's directory, not a per-user authority RPC.

All three facets follow the manifest's windows. A blown decision deadline is a
dismissal, not an extension nobody consented to. Transport bindings must
publish endpoint discovery, authentication, canonical signed bytes, replay and
idempotency rules, typed errors, and fixtures before claiming cross-vendor wire
conformance; an in-process protocol or `Codable` model alone is only a seam.

## 7. Incentives

### 7.1 Why the authority is paid, and how it must not be

Authorities publish fee offers as `SeatOffer`s. Two conforming revenue
sources exist:

- **interface fees**: interfaces (whose distribution depends on this
  seat existing and whose users demand a habitable network) pay their
  designated authorities by flat subscription or per **report
  adjudicated** — a declined intake counts the same as a decided case,
  so triage earns exactly what escalation earns; and
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

Reporting is free, low-friction, and consequential: upheld reports build
the reporter's authority-local track record, which raises the priority
and weight of their future reports. There is deliberately **no reporter
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
- **bounded** — the worst outcome is losing one interface on one device
  for a declared term, with the path back written down in advance; and
- **competitive** — authorities are inspectable before consent (track
  records, statistics, audit-seat attestations of procedure
  conformance), and an authority that bans capriciously loses the
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
2. execute valid verdicts promptly and mechanically, and refuse invalid
   ones (bad signature, no mandate, class outside mandate, missing
   expiry) with the error surfaced to the authority;
3. serve notices to the accused faithfully and provide a working
   response path even to users the interface finds odious;
4. display ban state honestly — verdict reference, authority contact,
   appeal path, expiry — and never silently degrade service instead;
5. clear marks on dismissal, expiry, reversal, and decision-deadline
   default without waiting to be asked; and
6. never write marks absent a valid verdict, including under pressure
   from stores, states, or its own commercial interest — an interface
   that needs to remove content for other lawful reasons does so under
   its own contract's disclosed policies, not by forging this seat's
   sanction.

Conforming moderation authorities must:

1. publish and follow the manifest: definitions, windows, terms,
   confidentiality, statistics, fees;
2. open cases only on conforming reports from consented reporters
   against consented accused, within declared classes;
3. verify authenticity proofs before treating disclosed content as
   evidence of authorship;
4. serve notice and hold the response window before any ban verdict —
   the case-open mark is the only pre-verdict effect;
5. decide on the record, against the consented class definition, within
   the deadline, with signed reasoning;
6. keep case materials under the declared confidentiality terms, retain
   disclosed content no longer than the case and its appeal require —
   except where the declared lawful-reporting path (obligation 7)
   imposes statutory preservation duties, which govern for exactly the
   material and period the law names — and never reuse it commercially;
7. perform the lawful statutory reporting its manifest declares for
   classes such as CSAM, and nothing beyond it;
8. publish the promised anonymized statistics consistently — not only
   the numbers that flatter it; and
9. operate verdict-signing keys separately from operational keys and
   report compromise immediately to designating interfaces.

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
  track record is what makes pre-consent inspection real.
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
| `no_mandate` | Verdict validation | Interface refuses execution; authority notified |
| `class_outside_mandate` | Verdict validation | Refused; only consented classes bind |
| `authenticity_unverified` | Evidence intake | Item is complaint, not evidence; cannot alone support a verdict |
| `reporter_unconsented` | Report intake | Report refused; reporting requires a mandate |
| `no_jurisdiction` | Report intake | Accused holds no mandate naming this authority; refused, with consented forwarding per §5.4 constraint 5 |
| `window_closed` | Time | Late response enters record at authority's declared discretion; late filing of appeal is refused |
| `no_response` | Accused | Decide on record per manifest |
| `decision_overdue` | Authority | Dismissal; interface clears case-open mark |
| `verdict_invalid` | Interface validation | Not executed; bad shape, signature, or bounds |
| `mark_write_failed` | Platform | Retry; verdict remains valid; identity refusal applies meanwhile |
| `appeal_filed` | Within window | Ban executes or suspends per the class's consented `appealEffect` |
| `new_holder_claim` | Device transfer | New-holder appeal per manifest; expedited review |
| `authority_key_compromise` | Authority report or interface determination | Marks set after compromise time cleared; unremedied compromise escalates to revocation |
| `authority_defunct` | Manifest lapsed, or §5.7's bounded unreachability procedure completed | New mandates and cases refused; open cases fall to deadline default; marks follow the forum rule — bans with a living external appellate persist under it as successor-of-record, all others clear on revocation |

Case lifecycle:

```text
mandate_signed (onboarding, before any case)
  -> report_filed (authenticity verified, reputation weighted)
       -> intake_declined -> closed (reporter record adjusted)
       -> case_opened -> notice_served -> case-open mark set
            -> responded | no_response
            -> decided within deadline
                 -> dismissed -> marks cleared -> closed
                 -> banned -> banned mark set -> [appeal?]
                      -> upheld -> runs to banExpires -> mark cleared -> closed
                      -> reversed -> marks cleared -> closed
            -> decision_overdue -> dismissed -> marks cleared -> closed
```

Every path terminates. There is no state in which a mark waits on a
silent authority forever, and no path in which silence bans anyone.

## 11. Security and privacy invariants

1. **Jurisdiction is signed consent.** An authority decides only cases
   against users whose mandate names it, for classes the mandate lists,
   under the manifest hash consented to; nothing can be moderated into
   its docket afterward.
2. **Marks move only on verdicts.** No interface discretion, no
   authority write access, no platform-initiated state; every mark
   transition traces to one signed, validated object or a declared
   default — expiry, decision deadline, or the bounded revocation of a
   dead or compromised designation, whose effect on marks follows
   §5.7's forum rule. Defaults only ever clear marks; nothing but a
   verdict sets one.
3. **Evidence is recipient-disclosed or it is nothing.** No scanning,
   no client-side detection, no key or plaintext demands, no metadata
   dragnets; the E2EE floor of every other seat is the floor of every
   case.
4. **Notice precedes sanction.** The banned mark is set only after the
   response window a consented class declared; the case-open mark is
   procedural and must not degrade service.
5. **Every ban has a shape.** Named keys, one device, a consented
   class, signed reasoning, a duration or a justified permanent term,
   an execution timestamp honoring the class's appeal effect, and an
   appeal path — a sanction missing any element is invalid at every
   conforming interface.
6. **Undecided is dismissal.** Deadline passage clears marks by
   default; authority absence is a scheduled non-event, never a freeze.
7. **Verdicts bind the consenting surface only.** No protocol-wide
   blacklist exists; other seats may consult published verdicts but are
   bound only by their own users' mandates; couriers, notaries, and
   registries are unreachable by this seat.
8. **Fees are ban-independent and stage-independent.** Per report
   adjudicated or by subscription — never per ban, never per case
   opened; no bounties
   for reporters; no revenue path that pays for severity.
9. **Reputation is local and unownable.** Reporter track records are
   per-authority, pseudonymous, non-transferable, and not a market.
10. **The device is not the person, and the contract knows it.** New-
    holder appeal is mandatory, ban terms are declared, and permanent
    terms are the justified exception — the mark's persistence across
    resale is treated as the liability it is.
11. **Law outranks the label.** Statutory reporting duties for the
    gravest content are performed as declared; no mandate waives the
    accused's legal rights or the reporter's; manifests must not claim
    otherwise.
12. **The seat is optional at the protocol layer.** Direct protocol
    use never requires a mandate; an interface that ships without a
    designated authority answers to its distribution channel, not to
    this contract.

## 12. Versioning and conformance

- `ModerationProfile` changes when a surface operation or mandate, report,
  receipt, notice, response, appeal, status, verdict, or mark meaning changes;
  violation classes are additive per authority manifest, and class definitions
  are immutable once consented.
- Mandates are immutable; a manifest change binds only mandates signed
  after it. Verdicts are immutable; corrections travel as reversal
  verdicts through the declared appeal path, never edits.
- Cross-platform fixtures cover: mandate validation (manifest hash
  mismatch, missing class terms, directory/manifest component and
  operator mismatch, invalid detached signature, raw-bytes/decoded-fields
  mismatch, and a hosted manifest changing between review and agreement);
  report authenticity verification
  (valid proof, forged proof, proofless complaint); notice and window
  arithmetic including timezone-hostile boundaries; verdict shape
  validation at interfaces (no mandate, class outside mandate, missing
  expiry, marks inconsistent with disposition, missing or inconsistent
  `executeAfter`, open-case verdicts carrying sanction effects or
  lacking intake reasoning); suspensive versus non-suspensive appeal
  execution including early-write refusal; revocation-trigger
  validation (unreachability window arithmetic, logged attempt records,
  forum-rule mark disposition); decision-deadline
  default execution; expiry clearing; reversal clearing; and
  new-holder appeal progression. Surface fixtures also cover the three
  ownership facets in §6: receipt-is-not-intake semantics, evidence folded
  into a signed response, ordinary versus new-holder appeal, authenticated
  status confidentiality, signed notice/verdict delivery through the gate,
  signature-only interface countersigning, replay/idempotency behavior, and
  refusal of every cross-role operation (including authority mark writes and
  authority mandate countersigning).
- An authority, an interface, and reporter/accused clients from three
  different authors must interoperate using only published profiles and
  fixtures.

## 13. Concrete implementation profiles

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
4. an authority that disappears costs the accused nothing that outlives
   it: open cases clear on schedule without its participation, and
   issued bans follow §5.7's forum rule — they persist exactly as long
   as a living appellate can hear claims against them, and clear the
   moment no forum remains;
5. no conforming object can express scanning obligations, key or
   plaintext demands, per-ban or per-opened-case compensation, or
   reporter bounties;
6. a banned device holder can see why, until when, and how to appeal —
   including as the device's new owner;
7. reporter, accused, and new-holder clients can use the four
   authority-client operations while notices and verdicts arrive only through
   validated interface delivery, and no authority call can countersign a user
   mandate or write a device mark;
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
