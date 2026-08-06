---
status: draft
proposed: Claude & @rinat-enikeev
date: 06.08.2026
---

# Onym Moderation Authority Contract Boundary

**Proposal draft 0.1 — August 2026**

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

## 2. What the moderation seat does

A conforming moderation authority can:

1. publish a signed manifest declaring its violation classes, per-class
   procedure and ban terms, evidence rules, decision timelines,
   confidentiality policy, fee offers, and appeal path;
2. accept mandate designation by interfaces whose users will consent to
   it at onboarding;
3. receive signed `Report` objects from consented users, weighted by the
   reporter's authority-local track record;
4. open a case, serve notice to the accused through the interface, and
   hold the response window its manifest declares;
5. issue a signed, reasoned `Verdict` — dismissal, case closure, or ban —
   within the decision deadline;
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
reincarnation. Platform device marks survive app reinstallation and
device reset, making the cheapest evasion path cost a physical device.
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
  "operations": [
    "accept-mandate",
    "file-report",
    "serve-notice",
    "respond",
    "submit-evidence",
    "issue-verdict",
    "appeal",
    "query-status"
  ],
  "mandateSchema": "onym-moderation-mandate-v1",
  "reportSchema": "onym-moderation-report-v1",
  "verdictSchema": "onym-moderation-verdict-v1",
  "markStates": ["case-open", "banned"],
  "errorSchema": "onym-moderation-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

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
      "lawfulReporting": "<hash-or-url: statutory reporting the authority performs>"
    },
    {
      "classId": "credible-violence",
      "definition": "<hash-or-url>",
      "responseWindow": "P7D",
      "decisionDeadline": "P14D",
      "banTerm": "P365D",
      "appealWindow": "P30D"
    },
    {
      "classId": "unsolicited-pornography",
      "definition": "<hash-or-url>",
      "responseWindow": "P7D",
      "decisionDeadline": "P14D",
      "banTerm": "P90D",
      "appealWindow": "P30D"
    }
  ],
  "evidenceRules": "<hash-or-url: disclosure and authenticity requirements>",
  "reputationPolicy": "<hash-or-url: how reporter track records weight intake>",
  "newHolderAppeal": "<hash-or-url: procedure for a device's new owner>",
  "appellate": "self | onym:component:<appellate-authority-id>",
  "confidentiality": "<hash-or-url: what is published, what stays private>",
  "statistics": "<hash-or-url: promised anonymized transparency reporting>",
  "offers": ["<fee-offer-ids>"],
  "validUntil": "2027-06-30T23:59:59Z",
  "signature": "<authority-signature>"
}
```

Normative constraints:

1. every class declares all five time terms — response window, decision
   deadline, ban term, appeal window, and (via `appellate`) where appeal
   goes; a class missing any of them is invalid at mandate validation;
2. `banTerm` is `permanent` or a declared duration; permanent terms are
   only valid on classes whose definition the manifest justifies as
   warranting them, and every permanent ban remains appealable and
   subject to the new-holder procedure;
3. class definitions are content-addressed: a user consents to exact
   wording, and the authority cannot edit the definition under existing
   mandates; and
4. an authority operated by (or affiliated with) an interface vendor
   states so in the manifest, or is nonconforming.

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

1. the interface presents the manifest's classes, terms, and appeal
   paths before signing, with the same prominence its own contract
   requires for economics disclosures
   ([../interface/Interface.md](../interface/Interface.md) §7);
2. the mandate binds the user only for the classes and manifest hash it
   names; manifest changes bind new mandates, never existing ones;
3. `deviceBinding` is a platform-scoped reference (the profile defines
   it); it lets a verdict name the device without creating a global
   device identifier; and
4. withdrawal is leaving the interface. Withdrawal ends exposure to new
   cases; it does not clear marks already set by valid verdicts —
   otherwise every ban would be voidable by re-onboarding.

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
   lesser classes; and
4. reporter identity is visible to the authority, never to the accused
   unless the reporter consents; retaliation against inferred reporters
   is itself a violation class authorities should declare.

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
interim verdict setting the **case-open mark**; it is procedural state,
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
  "disposition": "dismiss | ban",
  "marks": {"case-open": false, "banned": true},
  "banExpires": "2026-11-06T00:00:00Z",
  "reasoning": "<content-address: findings against the consented class definition>",
  "appealDeadline": "2026-09-05T00:00:00Z",
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
   `permanent`; the interface clears the banned mark at expiry on the
   verdict's own authority, no further object needed;
4. `final` is false until the appeal deadline passes or the declared
   appeal concludes; a reversal on appeal is a new verdict that clears
   marks; and
5. dismissals clear the case-open mark and are reported to the reporter
   (adjusting their track record) without disclosing the accused's
   response beyond the outcome.

### 5.7 Device marks and enforcement binding

The abstract rail is two per-device states scoped to the interface
vendor's platform credentials:

| Mark | Meaning | Set by | Cleared by |
|---|---|---|---|
| `case-open` | A moderation case exists against this device | Valid interim verdict at case opening | Dismissal, ban verdict (superseded), or decision-deadline default |
| `banned` | A final ban verdict is in force | Valid ban verdict | Verdict expiry, reversal on appeal, or new-holder appeal verdict |

The interface executes verdicts mechanically:

- it validates verdict shape — authority signature, mandate reference to
  a mandate its user actually signed, class within the mandate, marks
  consistent with disposition, expiry present where required — never the
  verdict's wisdom;
- a device whose `banned` mark is set is refused service by this
  interface: the application declines to operate and displays the
  verdict reference, the authority's contact, and the appeal path
  (including the new-holder path) — a silent brick is nonconforming;
- the named identity keys are refused within this interface's surfaces
  for the ban's duration; the interface does not propagate the refusal
  to couriers, notaries, or any other seat; and
- the authority may publish its verdicts (anonymized per its
  confidentiality policy); other interfaces and seats MAY consult them
  but are bound only by verdicts under mandates their own users signed.

The authority's key can sign verdicts; it can never write marks. The
interface can write marks; it can never originate them. A compromised
authority key is bounded to its consented population and is remedied by
interfaces revoking the designation and clearing marks set after the
compromise time the authority reports.

## 6. Common moderation surface

| Operation | Input | Result |
|---|---|---|
| `accept-mandate` | Interface designation, manifest hash | Authority countersignature or refusal |
| `file-report` | Signed `Report` with authenticity proofs | Intake per reputation policy |
| `serve-notice` | Case opened | `CaseNotice` to accused via interface; case-open mark set |
| `respond` | Accused response within window | Case at issue |
| `submit-evidence` | Signed items per evidence rules | Entered into record |
| `issue-verdict` | Closed record, within deadline | Signed `Verdict` to accused, reporter (outcome only), and interface |
| `appeal` | Within appeal window, per declared path | Review; reversal verdict on success |
| `query-status` | Case ID, party credential | Stage and deadlines, per confidentiality |

Every operation is deadline-bearing, and the manifest's windows drive
the calendar. A blown decision deadline is a dismissal, not an
extension nobody consented to.

## 7. Incentives

### 7.1 Why the authority is paid, and how it must not be

Authorities publish fee offers as `SeatOffer`s. Two conforming revenue
sources exist:

- **interface fees**: interfaces (whose distribution depends on this
  seat existing and whose users demand a habitable network) pay their
  designated authorities by subscription or per-decided-case rates; and
- **foundation grants**: moderation of the gravest classes is a public
  good; the sponsor seat ([../sponsor/Sponsor.md](../sponsor/Sponsor.md))
  may fund conforming authorities so that no interface skips designating
  one on cost grounds.

The invariants: fees are **outcome-independent** — per case decided,
never per ban issued; no bounty, forfeiture, or volume bonus may make
banning more profitable than dismissing; and no party to a live case may
pay the authority anything beyond the pre-published rate. An authority
whose income rises with its ban rate has a business model this contract
rejects.

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
   disclosed content no longer than the case and its appeal require,
   and never reuse it commercially;
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
| `window_closed` | Time | Late response enters record at authority's declared discretion; late filing of appeal is refused |
| `no_response` | Accused | Decide on record per manifest |
| `decision_overdue` | Authority | Dismissal; interface clears case-open mark |
| `verdict_invalid` | Interface validation | Not executed; bad shape, signature, or bounds |
| `mark_write_failed` | Platform | Retry; verdict remains valid; identity refusal applies meanwhile |
| `appeal_filed` | Within window | Ban executes or suspends per manifest's declared appeal effect |
| `new_holder_claim` | Device transfer | New-holder appeal per manifest; expedited review |
| `authority_key_compromise` | Authority report | Interfaces suspend designation; marks set after compromise time cleared |

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
   expiry or deadline default.
3. **Evidence is recipient-disclosed or it is nothing.** No scanning,
   no client-side detection, no key or plaintext demands, no metadata
   dragnets; the E2EE floor of every other seat is the floor of every
   case.
4. **Notice precedes sanction.** The banned mark is set only after the
   response window a consented class declared; the case-open mark is
   procedural and must not degrade service.
5. **Every ban has a shape.** Named keys, one device, a consented
   class, signed reasoning, a duration or a justified permanent term,
   and an appeal path — a sanction missing any element is invalid at
   every conforming interface.
6. **Undecided is dismissal.** Deadline passage clears marks by
   default; authority absence is a scheduled non-event, never a freeze.
7. **Verdicts bind the consenting surface only.** No protocol-wide
   blacklist exists; other seats may consult published verdicts but are
   bound only by their own users' mandates; couriers, notaries, and
   registries are unreachable by this seat.
8. **Fees are ban-independent.** Per-case, never per-ban; no bounties
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

- `ModerationProfile` changes when operation, mandate, report, verdict,
  or mark meaning changes; violation classes are additive per authority
  manifest, and class definitions are immutable once consented.
- Mandates are immutable; a manifest change binds only mandates signed
  after it. Verdicts are immutable; corrections travel as reversal
  verdicts through the declared appeal path, never edits.
- Cross-platform fixtures cover: mandate validation (manifest hash
  mismatch, missing class terms); report authenticity verification
  (valid proof, forged proof, proofless complaint); notice and window
  arithmetic including timezone-hostile boundaries; verdict shape
  validation at interfaces (no mandate, class outside mandate, missing
  expiry, marks inconsistent with disposition); decision-deadline
  default execution; expiry clearing; reversal clearing; and
  new-holder appeal progression.
- An authority, an interface, and reporter/accused clients from three
  different authors must interoperate using only published profiles and
  fixtures.

## 13. Concrete implementation profiles

Two device-mark platform profiles accompany this boundary:

- **[Moderation-DeviceCheck.md](Moderation-DeviceCheck.md)** — Apple
  DeviceCheck: two per-device bits scoped to the interface vendor's
  Apple developer account, written server-side on verdict execution;
  and
- **[Moderation-Device-Recall.md](Moderation-Device-Recall.md)** —
  Google Play Integrity device recall: per-device recall values scoped
  to the app, written server-side, read inside integrity verdicts.

Both platforms scope marks to the interface vendor's credentials, which
matches this contract's rule that verdicts bind the consenting surface
only: vendor A's marks are physically invisible to vendor B.

## 14. Acceptance criteria

The moderation seat is successfully specified when:

1. a user can read an authority's classes, terms, and appeal path
   before consenting, and no case can reach them under terms they never
   saw;
2. a report with verified authenticity proof can proceed through
   notice, response, verdict, and mark execution using only published
   profiles and fixtures;
3. no verdict lacking a mandate, reasoning, duration (or justified
   permanent term), or appeal path executes at any conforming
   interface;
4. an authority that disappears costs the accused nothing: marks clear
   on schedule without its participation;
5. no conforming object can express scanning obligations, key or
   plaintext demands, per-ban compensation, or reporter bounties;
6. a banned device holder can see why, until when, and how to appeal —
   including as the device's new owner;
7. a second authority and a second interface can adopt the profiles
   without coordination with the first; and
8. the protocol remains fully usable by clients that never signed any
   mandate, and every document in this seat says so plainly.

## 15. Justification in one sentence

> The moderation seat gives every interface the abuse-removal power its
> distribution requires, as a service its users chose while they were
> nobody's accused — one whose whole authority is a reasoned, signed,
> expiring verdict against terms they could read, and whose worst
> failure mode is a dismissal on schedule.

## References

1. Onym system whitepaper, §1 (minimum authority), §7 (interface seat),
   §17 (economics): [../WHITEPAPER.md](../WHITEPAPER.md)
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
