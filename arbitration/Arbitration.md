---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Arbitration Contract Boundary

**Proposal draft 0.1 — August 2026**

> An arbiter decides one named dispute over one bounded stake, under rules
> every party signed before the dispute existed. It is chosen per order,
> paid regardless of outcome, and owns nothing outside the orders that
> chose it.

This document proposes the technology-neutral boundary for the
**arbitration seat**: the institutional service that resolves disputes
arising inside other seats' signed orders—lead-generation campaigns,
acquisition orders, recruitment milestones, channel-offer settlements,
escrow accounts—by issuing signed, enforceable-within-the-stake decisions.

The [whitepaper](../WHITEPAPER.md) already assumes this seat without naming
it: Telegram lead orders carry "dispute windows" (§11), the acquisition
contract includes a "dispute" component (§12), economic-abuse mitigations
list "challenge periods" (§17.10), and the bank boundary's escrow class
([../bank/UI-Bank.md](../bank/UI-Bank.md) §10) reserves a seat for exactly
the tie-breaking party this document specifies.

It does not require a particular legal-arbitration framework, jurisdiction,
panel size, evidence technology, or enforcement rail. No concrete
implementation profile exists yet.

Two scope statements up front:

1. **This is contractual dispute disposition over a bounded stake**, chosen
   ex ante by the parties. Whether such a clause is also a legally binding
   arbitration agreement is a matter of the applicable law and the clause's
   own drafting; the protocol label does not override the real relationship
   or any party's statutory rights (the same stance the recruitment
   contract takes toward participation forms).
2. **The arbiter is not a court of the protocol.** It has no standing over
   users, seats, or orders that did not name it, and no power to amend
   protocol rules, seize funds outside its escrow, or sanction anyone's
   participation.

## 1. Decision

Onym treats the disputing parties, the arbiter, the enforcement rail, and
evidence sources as independently owned components joined by versioned
interfaces.

- The **parties** are the signers of an underlying order—sponsor and lead
  generator, publisher and acquisition provider, requester and recruiter,
  buyer and seller in an escrow. They choose whether to include an
  arbitration clause at all, and which arbiter it names.
- The **arbiter** owns its procedure, calendar, professional judgment, and
  reputation. It sells dispute disposition under its published procedure
  and the clause's evidence rules. It may be one institution or a declared
  panel.
- The **enforcement rail** is whatever holds the stake: a bank-seat escrow
  account, a multisignature arrangement, a foundation's escrow service, or
  the parties' ordinary payment obligations. The rail executes awards
  mechanically within the stake; it decides nothing.
- **Evidence sources** are the observers and oracles the underlying order
  already defines—the Telegram view observer, the store acquisition
  oracle, audit-seat attestations
  ([../audit/Audit.md](../audit/Audit.md))—plus the parties' own signed
  submissions.
- The **underlying seat contract** (lead, acquisition, recruitment,
  channel offer, escrow) defines what was promised and what evidence
  counts. Arbitration interprets that contract; it does not rewrite it.

One organization may occupy several roles, but the profile does not merge
their authority: an arbiter that operates an escrow rail, or that has a
relationship with a party, discloses the conflict in its manifest and the
clause, or is nonconforming.

The boundary has three interfaces:

1. the **clause** interface: how an underlying order names an arbiter,
   evidence rules, deadlines, fees, and default dispositions before any
   dispute exists;
2. the **proceeding** interface: filing, response, evidence, decision, and
   any declared appeal; and
3. the **enforcement** interface: how a signed award becomes a movement of
   the bounded stake and nothing else.

## 2. What the arbitration seat does

A conforming arbiter can:

1. publish a signed manifest declaring its procedures, dispute classes,
   fee offers, conflict policy, and decision timelines;
2. accept designation in an order's `ArbitrationClause` before the order
   activates;
3. receive a `DisputeFiling` within the clause's window, and the response
   within the response window;
4. receive signed evidence under the clause's evidence rules, including
   oracle reports and attestations the underlying order already defines;
5. issue a signed, reasoned `Award` disposing of the disputed stake within
   the clause's bounds;
6. participate in the declared appeal path, when one exists; and
7. answer status queries about proceedings it conducts, within its
   confidentiality rules.

It does not solicit disputes, reopen settled orders outside declared
windows, adjust stakes upward, join third parties who never signed the
clause, publish party identities beyond the clause's disclosure terms, or
acquire jurisdiction over anything by deciding one dispute well.

## 3. Why this boundary is necessary

### 3.1 Dispute windows without deciders are dead letters

Every economic seat contract in the system declares evidence rules, caps,
and dispute windows—and then stops. Without a named decider, a "dispute"
is a negotiation in which the party holding the money wins. A seat for
chosen, bounded adjudication is what makes finite prepaid budgets and
challenge periods mean something.

### 3.2 Consent must precede the conflict

An adjudicator imposed after a dispute arises is chosen by the stronger
party. The clause is signed with the order, when interests are still
aligned: arbiter identity, evidence rules, deadlines, fee split, and—
critically—what happens to the stake if nobody decides. After signing,
neither party can swap the arbiter or the rules alone.

### 3.3 Authority must be the size of the stake

The whitepaper's rule—minimum authority for the role (§1)—applies
sharply here: the arbiter's entire power is disposition of the named,
bounded stake under the named order. It cannot touch other funds, other
orders, identities, group state, or reputations beyond publishing what the
clause allows. A bad arbiter costs the parties one stake and itself its
future selection; that is the whole blast radius.

### 3.4 Undecided must be a defined outcome

Arbiters fail: they vanish, stall, or are compromised. If arbiter failure
freezes funds indefinitely, the arbiter has acquired hostage power the seat
must not hold. Every clause therefore declares a **default disposition**—
where the stake goes if no valid award issues by the deadline—so the
worst-case arbiter is an absent one, not an omnipotent one.

### 3.5 The legal system is not displaced

Parties may have statutory rights no clause can waive, and real courts may
review, enforce, or ignore an award depending on jurisdiction and drafting.
The boundary keeps the protocol honest about this: the award binds the rail
within the stake; everything beyond the stake is ordinary law between the
parties.

## 4. Logical topology

```text
underlying order (lead · acquisition · recruitment · channel · escrow)
        │ includes, at signing
        v
┌──────────────────────────────┐
│ ArbitrationClause            │
│ arbiter · rules · deadlines  │
│ fees · default disposition   │
└──────┬───────────────────────┘
       │ dispute window opens
       v
┌──────────────┐  filing/response   ┌──────────────────────────┐
│ Party A      │───────────────────>│ Arbiter (or panel)       │
│ Party B      │<───────────────────│ procedure · judgment     │
└──────┬───────┘   signed evidence  └───────────┬──────────────┘
       │            + oracle reports            │ signed Award
       │            + attestations              v
       │                            ┌──────────────────────────┐
       └───────────────────────────>│ Enforcement rail         │
             stake escrowed         │ escrow / multisig /      │
             at order funding       │ payment obligation       │
                                    │ executes within stake    │
                                    └──────────────────────────┘

   No award reaches beyond the stake. No arbiter is reachable by a
   dispute whose order never named it. Absent arbiter -> default
   disposition at deadline.
```

## 5. Boundary objects

### 5.1 Arbitration Profile

```json
{
  "profileVersion": 1,
  "profileId": "onym:arbitration-profile:bounded-stake-v1",
  "interface": "onym-arbitration-v1",
  "operations": [
    "accept-designation",
    "file-dispute",
    "respond",
    "submit-evidence",
    "issue-award",
    "appeal",
    "query-status"
  ],
  "clauseSchema": "onym-arbitration-clause-v1",
  "awardSchema": "onym-arbitration-award-v1",
  "panelModels": ["single", "declared-panel-majority"],
  "errorSchema": "onym-arbitration-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

### 5.2 Arbiter Manifest

```json
{
  "version": 1,
  "componentId": "onym:component:<arbiter-id>",
  "seat": "arbitration",
  "operator": "onym:key:<arbiter-identity>",
  "arbitrationProfileId": "onym:arbitration-profile:bounded-stake-v1",
  "procedure": "<hash-or-url: filing, response, evidence, reasoning rules>",
  "disputeClasses": [
    "aggregate-delivery-evidence",
    "milestone-completion",
    "settlement-calculation",
    "service-nonperformance",
    "escrow-condition"
  ],
  "panelModel": "single",
  "timelines": {"response": "P14D", "decision": "P30D"},
  "conflictPolicy": "<hash-or-url: relationships, recusal, disclosure>",
  "confidentiality": "<hash-or-url: what is published, what stays private>",
  "jurisdictionNote": "<hash-or-url: legal form and enforceability stance>",
  "offers": ["<fee-offer-ids>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<arbiter-signature>"
}
```

Dispute classes describe what the arbiter is competent and willing to
decide—counter-evidence disagreements are a different skill from milestone
quality judgments. A clause naming an arbiter outside its declared classes
is invalid at order validation, not discovered at filing.

### 5.3 Arbitration Clause

Embedded in, and signed with, the underlying order:

```json
{
  "clauseVersion": 1,
  "orderRef": "<hash-of-underlying-order>",
  "arbiter": "onym:component:<arbiter-id>",
  "disputeClass": "aggregate-delivery-evidence",
  "stake": {
    "description": "escrowed-campaign-budget",
    "maximum": {"value": "5000.00", "asset": "<asset-descriptor>"},
    "rail": "onym:component:<escrow-or-rail-id>"
  },
  "windows": {
    "filing": "P21D-after-settlement-report",
    "response": "P14D",
    "evidenceClose": "P14D-after-response",
    "decision": "P30D-after-evidence-close"
  },
  "evidenceRules": "<hash: what counts, per the underlying order>",
  "fees": {
    "amount": {"value": "200.00", "asset": "<asset-descriptor>"},
    "deposit": "split-at-filing",
    "allocation": "clause-defined (e.g., decided-with-award)"
  },
  "appeal": "none | <declared-appeal-arbiter-and-window>",
  "defaultDisposition": "return-remaining-stake-to-sponsor",
  "disclosure": "parties-and-award-private; anonymized-award-publishable",
  "signatures": ["<party-a>", "<party-b>", "<arbiter-acceptance>"]
}
```

Normative constraints:

1. the arbiter countersigns designation before the order activates—no
   party can bind an arbiter that never accepted, and no arbiter can be
   surprised into jurisdiction;
2. `stake.maximum` bounds every award; the clause cannot authorize
   punitive amounts beyond the escrowed or declared stake;
3. `defaultDisposition` is mandatory: a clause with no answer to "what if
   nobody decides" is invalid;
4. fee **amount** is outcome-independent; `allocation` (who ultimately
   bears it, such as loser-pays) may be clause-defined and award-applied;
   and
5. `evidenceRules` reference the underlying order's own evidence and
   observer definitions—arbitration inherits the order's epistemics rather
   than inventing new surveillance.

### 5.4 Dispute Filing and Response

```json
{
  "filingVersion": 1,
  "disputeId": "<random-id>",
  "clauseRef": "<hash-of-clause>",
  "claimant": "onym:key:<party>",
  "claim": "<hash-or-inline: what outcome is sought and why>",
  "reliefSought": {"value": "1200.00", "asset": "<asset-descriptor>"},
  "filedAt": "2026-08-01T00:00:00Z",
  "feeDeposit": "<payment-evidence-per-clause>",
  "signature": "<claimant-signature>"
}
```

The response mirrors the filing. A missing response within the window does
not automatically award the claim; it proceeds to decision on the evidence
present, per the arbiter's published default-of-appearance procedure—
no-show is a weakness, not a confession.

### 5.5 Evidence

Evidence is signed material within the clause's rules: the underlying
order's oracle reports and observer snapshots, settlement statements,
courier receipts, audit-seat attestations, and party declarations. The
arbiter weighs evidence; it does not collect surveillance. A conforming
proceeding never demands identity root material, message plaintext,
unrelated account history, or de-anonymization of aggregate evidence
beyond what the underlying order already made legible—the privacy floor of
the underlying seat is the privacy floor of its disputes
(suppressed or grouped store aggregates stay suppressed, per §12 of the
whitepaper).

### 5.6 Award

```json
{
  "awardVersion": 1,
  "disputeId": "<same-id>",
  "clauseRef": "<hash-of-clause>",
  "arbiter": "onym:component:<arbiter-id>",
  "disposition": [
    {"to": "onym:key:<party-a>", "amount": {"value": "800.00", "asset": "<asset>"}},
    {"to": "onym:key:<party-b>", "amount": {"value": "400.00", "asset": "<asset>"}}
  ],
  "feeAllocation": {"bearer": "onym:key:<party-b>", "basis": "clause-rule"},
  "reasoning": "<content-address: findings against the order's terms>",
  "decidedAt": "2026-09-10T00:00:00Z",
  "panelSignatures": ["<arbiter-or-majority-signatures>"],
  "final": true
}
```

Normative constraints:

1. the disposition sums to at most the stake; anything else is invalid at
   the rail and everywhere else;
2. `reasoning` is mandatory—an unexplained award is nonconforming even
   when the clause keeps it private between the parties;
3. the award interprets the underlying order's terms and evidence rules;
   it cannot amend the order, create new obligations, or bind non-parties;
   and
4. `final` reflects the clause's appeal structure; a declared appeal
   window suspends enforcement only as the clause states.

### 5.7 Enforcement binding

The rail executes valid awards mechanically:

- a **bank-seat escrow account** ([../bank/UI-Bank.md](../bank/UI-Bank.md)
  §10) lists the arbiter as the declared tie-breaking signer: disbursement
  requires either both parties' signatures (settlement) or one party plus
  a valid award (adjudicated outcome), and the default disposition becomes
  executable by the entitled party alone after the decision deadline;
- an **obligation rail** (no escrow) makes the award a signed input to the
  parties' ordinary settlement, with nonperformance visible and
  attributable; and
- the rail validates award shape—clause reference, stake bound, signatures,
  finality—not its wisdom.

The arbiter's key can sign awards; it cannot sign ordinary transfers. A
compromised arbiter key is bounded to the disputes that named it, inside
stakes that still require the award-shaped path.

## 6. Common arbitration surface

| Operation | Input | Result |
|---|---|---|
| `accept-designation` | Draft clause | Arbiter countersignature or refusal |
| `file-dispute` | `DisputeFiling` within window, fee deposit | Proceeding opened |
| `respond` | Response within window | Proceeding at issue |
| `submit-evidence` | Signed items per evidence rules | Entered into record |
| `issue-award` | Closed record | Signed `Award` to parties and rail |
| `appeal` | Per declared appeal path only | Suspension and review as clause states |
| `query-status` | Dispute ID, party credential | Stage and deadlines, per confidentiality |

Every operation is deadline-bearing. The clause's windows, not the
arbiter's convenience, drive the calendar; a blown decision deadline
triggers the default disposition, not an extension the parties never
signed.

## 7. Party obligations

Conforming parties (and the client software acting for them) must:

1. validate the clause at order signing: arbiter manifest current, dispute
   class matched, stake and rail consistent with the order's funding,
   default disposition present;
2. render the clause's consequences before signing the order—who decides,
   what evidence counts, what it costs, what happens on silence—with the
   same prominence as price;
3. file, respond, and submit evidence within windows, through signed
   objects, without out-of-band pressure on the arbiter;
4. submit only evidence the clause's rules allow; attempting to introduce
   de-anonymizing material the underlying order excluded is a violation
   surfaced to the arbiter, not a tactic;
5. honor awards on obligation rails and not obstruct escrow execution; and
6. treat statutory rights honestly: a clause presented to a consumer or
   employee-like party carries the underlying seat's disclosure duties,
   and clients must not present arbitration as extinguishing rights it
   legally cannot.

## 8. Arbiter obligations

A conforming arbiter must:

1. publish and follow its manifest: procedure, classes, timelines,
   conflict policy, confidentiality, fee offers;
2. accept designation only within its declared classes and capacity, and
   refuse clauses whose windows it cannot meet;
3. disclose conflicts at designation and recuse when its policy requires;
   an undisclosed relationship with a party voids conformance;
4. keep fee amounts outcome-independent and take nothing else of value
   from any party to a live or prospective proceeding;
5. decide on the record, against the underlying order's terms, within the
   deadline, with signed reasoning;
6. hold proceeding materials under the clause's confidentiality terms,
   retain them no longer than declared, and never reuse them commercially;
7. publish anonymized awards only as the clause allows, and consistently—
   not only the decisions that flatter it;
8. operate its keys such that award signing is separated from its ordinary
   operational keys, and report compromise immediately to named rails and
   parties; and
9. state plainly in its manifest what legal weight its process claims in
   which jurisdictions, without overclaiming enforceability.

## 9. Panels and appeal

The initial profile admits two panel models: a single arbiter, or a
declared panel deciding by majority with all panelist identities in the
clause. Appeal, when the clause declares it, names the appellate arbiter
and window in advance; an appeal path invented after the dispute arises is
no path. Both layers stay inside the same stake—appeal reviews the award,
it does not enlarge the money.

## 10. Relationship to other seats

- **Lead generation and acquisition orders** gain a decider for exactly
  the disagreements their evidence sections anticipate: counter snapshots,
  suppressed cohorts, window boundaries, cap arithmetic.
- **Recruitment orders** gain milestone-completion adjudication without
  the arbiter acquiring any appointment authority—the destination seat's
  selection power is untouched; only the recruiter's milestone payment is
  decidable.
- **Channel offers** gain settlement-calculation disposition between
  frontend publishers and seat owners.
- **The bank seat** supplies the strongest rail (escrow class with the
  arbiter as declared signer) and is also a consumer: custodial-provider
  withdrawal disputes remain legal matters (the bank contract is explicit
  that `withdrawal_refused` escalates as law, not as a bug), but parties
  may voluntarily escrow disputed service fees under a clause.
- **The audit seat** supplies attestations as evidence—an attested
  conformance failure is strong material in a nonperformance dispute—and
  arbiters themselves are attestable subjects (procedure conformance, key
  handling).
- **Discovery providers** may list arbiters and cite their track records; as
  everywhere, listing is curation, not validity.

## 11. Payment at the arbitration boundary

Arbiters publish fee offers as `SeatOffer`s: fixed per dispute class,
staked-value bands, or panel rates. Deposits are taken at filing per the
clause; allocation follows the award's clause-defined rule. The
invariants: fee amounts never depend on who wins; no contingency, no
percentage of the award; no fee makes an award more valid or an absent
one less defaulted. An arbiter's unpaid invoice is its own commercial
matter and never a lien on the stake beyond the clause's declared fee.

## 12. Errors and lifecycle

| Error | Origin | Response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse clause at order validation |
| `class_mismatch` | Clause validation | Invalid clause; order signing blocked |
| `designation_refused` | Arbiter | Choose another arbiter before order activates |
| `window_closed` | Time | Filing or evidence rejected; settlement stands |
| `fee_deposit_missing` | Filing | Proceeding not opened; window keeps running |
| `evidence_excluded` | Clause rules | Item refused with the rule cited |
| `no_response` | Party | Proceed on record per default-of-appearance |
| `conflict_disclosed` | Arbiter | Recusal or party waiver per clause |
| `decision_overdue` | Arbiter | Default disposition becomes executable |
| `award_invalid` | Rail validation | Not executed; exceeds stake, bad shape, or bad signatures |
| `appeal_filed` | Declared path only | Enforcement suspended as clause states |
| `rail_unavailable` | Infrastructure | Award remains valid; execution retries; obligation persists |

Dispute lifecycle:

```text
clause_signed (with order)
  -> settlement_report | escrow_condition_event
  -> filing_window_open
       -> no filing -> settled (order's own terms stand)
       -> filed -> responded | no_response
            -> evidence_open -> evidence_closed
            -> decided (signed award) -> [appeal?] -> enforced -> closed
            -> decision_overdue -> default_disposition -> closed
```

Every path terminates. There is no state in which funds wait on a party or
arbiter forever, and no path in which silence transfers more than the
clause's declared defaults.

## 13. Security and privacy invariants

1. **Jurisdiction is signed consent.** An arbiter decides only disputes
   whose clause it countersigned before the order activated; nothing can
   be arbitrated into its docket afterward.
2. **Authority equals the stake.** Awards dispose of at most the named,
   bounded stake; rails reject anything larger; nothing else the parties
   own is reachable.
3. **Undecided is defined.** Every clause carries a default disposition;
   arbiter absence is a scheduled outcome, never a freeze.
4. **The order's privacy floor holds.** Disputes weigh the evidence the
   underlying order defined; they cannot demand de-anonymization, root
   material, plaintext, or unrelated history the order excluded.
5. **Fees are outcome-independent.** Amounts never track the winner;
   allocation follows pre-signed clause rules only.
6. **Awards are reasoned and signed.** Machine-validatable shape for the
   rail, human-readable findings for the parties.
7. **Conflicts void silently-conflicted decisions.** Disclosure at
   designation, recusal per policy, and an undisclosed interest is
   nonconformance, not a footnote.
8. **No precedent machine.** Awards bind their dispute; publication is
   clause-governed, anonymized, and consistent; no arbiter accretes
   protocol-wide authority through volume.
9. **Enforcement is mechanical.** Rails validate shape, bounds, and
   signatures—never re-judge merits, and never accept an award-shaped
   object for an ordinary transfer.
10. **The seat is optional everywhere.** Orders without clauses remain
    valid; direct protocol use never requires naming an arbiter; and no
    Discovery provider, client, or counterparty default may silently insert
    one.
11. **Law outranks the label.** Statutory rights, consumer protections,
    and court authority are untouched by anything in a clause, and
    manifests must not claim otherwise.

## 14. Versioning and conformance

- `ArbitrationProfile` changes when operation, clause, award, or panel
  meaning changes; dispute classes are additive capabilities.
- Clauses are immutable once the order activates; changing arbiter, rules,
  or windows is a signed order amendment by all parties plus the new
  arbiter's acceptance.
- Awards are immutable; corrections travel as clause-declared appeal
  outcomes, never edits.
- Cross-platform fixtures cover: clause validation (class mismatch,
  missing default disposition, stake/rail inconsistency); window
  arithmetic including timezone-hostile boundaries; filing, response, and
  no-show progressions; award shape validation at rails (over-stake,
  wrong clause, missing signatures, non-final with pending appeal);
  default-disposition execution after deadline; fee deposit and
  allocation; and panel-majority signature verification.
- A rail, an arbiter, and party clients from three different authors must
  interoperate using only published profiles and fixtures.

## 15. Concrete implementation profiles

No concrete profile exists yet. The natural first profile pairs the two
smallest complete pieces already specified elsewhere:

- **Stellar escrow rail**: the bank boundary's escrow class implemented as
  a Stellar multisignature account whose signer/threshold arrangement
  encodes "both parties, or one party plus a valid award, or the entitled
  party alone after the decision deadline"; and
- **`aggregate-delivery-evidence` disputes** over Telegram lead orders,
  whose observer snapshots and caps are already fully specified and
  produce small, decidable records.

That pairing exercises every object in this contract with the least new
machinery.

## 16. Acceptance criteria

The arbitration seat is successfully specified when:

1. two parties can name an arbiter in an order, fund a bounded stake, and
   have a dispute decided and executed using only published profiles and
   fixtures;
2. no award reaching beyond its stake, clause, or parties validates at any
   conforming rail;
3. an arbiter that disappears costs the parties nothing but the clause's
   default disposition, on schedule;
4. no proceeding can extract evidence below the underlying order's privacy
   floor;
5. fee structures with outcome-contingent amounts are expressible nowhere
   in conforming objects;
6. orders without arbitration clauses, and seats that never adopt the
   pattern, remain fully conforming;
7. an arbiter's conflicts, procedure, and track record are inspectable
   before designation; and
8. a second rail technology and a second arbiter institution can implement
   the profiles without pretending to be the first.

## 17. Justification in one sentence

> The arbitration seat gives every signed order a decider the parties chose
> while they still agreed—one whose whole power is a reasoned, signed
> disposition of a stake they bounded in advance, and whose worst failure
> mode is the default they also chose.

## References

1. Onym system whitepaper, §1, §11, §12, §17.10:
   [../WHITEPAPER.md](../WHITEPAPER.md)
2. Onym bank boundary, escrow class:
   [../bank/UI-Bank.md](../bank/UI-Bank.md)
3. Onym audit seat (attestations as evidence):
   [../audit/Audit.md](../audit/Audit.md)
4. Onym lead generation contract (dispute windows, observer evidence):
   [../lead/Lead-Generation.md](../lead/Lead-Generation.md)
5. Onym acquisition contract (evidence and dispute component):
   [../acquisition/Acquisition.md](../acquisition/Acquisition.md)
6. Onym recruitment contract (milestones, participation-form honesty):
   [../recruitment/Recruitment.md](../recruitment/Recruitment.md)
7. UNCITRAL Model Law on International Commercial Arbitration:
   <https://uncitral.un.org/en/texts/arbitration/modellaw/commercial_arbitration>
8. New York Convention on the Recognition and Enforcement of Foreign
   Arbitral Awards (1958):
   <https://uncitral.un.org/en/texts/arbitration/conventions/foreign_arbitral_awards>
