# Onym Sponsor: Onym Foundation Implementation

**Implementation profile draft 0.1 — August 2026**

> Onym Foundation sponsors receive visible, policy-bound recognition and a
> route into three sponsor-director seats. Once appointed, every sponsor
> director votes for the Foundation's purpose—not for the donor that qualified
> them.

This document is the proposed Onym Foundation implementation of
[Sponsor.md](Sponsor.md). The abstract boundary remains authoritative for
portability, legal precedence, conflicts, privacy, and separation from
technical protocol power.

No legal entity, registration number, jurisdiction, bank or wallet, tax
status, governing document, or current board authority has been established by
this repository. Until an executed legal manifest supplies those facts, this
profile is `proposed_non_operational`: it cannot accept money, issue tax
receipts, promise recognition, appoint directors, or authorize spending.

## 1. Conformance declaration

| Abstract concept | Proposed Onym Foundation mapping |
|---|---|
| Foundation | Legal entity named in a future executed manifest |
| Sponsor profile | `onym:sponsor-profile:foundation-v1` |
| Implementation | `onym:sponsor-implementation:onym-foundation-v1` |
| Public electorate | Onym Sponsor Council |
| Sponsor board class | Three of nine voting directors |
| Other board classes | Three Ecosystem and three Independent Public-Interest Directors |
| Recognition | Foundation-controlled acknowledgements inventory only |
| Endowment | Segregated permanent, restricted, and board-designated funds |
| Ordinary spending rule | Six affirmative votes, including two non-sponsor directors |
| Annual endowment draw | At most 4% of trailing twelve quarter-end values, subject to law/restriction/prudence |
| Sponsor board votes | One director, one vote; never contribution-weighted |
| Technical privilege | None |

All euro thresholds below are proposed launch constants. The legally adopted
v1 profile may change them before first publication. Once an offer or election
opens, its pinned thresholds cannot change retroactively.

## 2. Foundation purpose

The proposed Foundation exists to advance interoperable, user-controlled
digital identity and communications as public infrastructure. Within the
final legal purpose, it may fund:

- open specifications, reference implementations, and conformance suites;
- independent security, privacy, accessibility, and legal review;
- maintainership, documentation, localization, and education;
- grants to compatible independent implementations and operators;
- association, charity, finance, and community application research;
- protocol governance, open meetings, and public archives; and
- shared infrastructure where a neutral provider is necessary during early
  ecosystem development.

The Foundation does not own a person's Onym identity, the permissionless
protocol, or independent implementations merely because they use compatible
formats or the descriptive term “Onym.” Trademark rights, if any, are governed
by a separate public trademark policy.

## 3. Board composition

The legal board has nine voting directors:

| Class | Seats | Selection |
|---|---:|---|
| Sponsor Directors | 3 | Elected by the Onym Sponsor Council, then legally appointed |
| Ecosystem Directors | 3 | Elected by a defined builder/operator/community electorate |
| Independent Public-Interest Directors | 3 | Selected through an open nominations and independent appointment process |

Rules:

1. Each director has one vote.
2. Sponsor Directors can participate in every unconflicted spending,
   investment, grant, and budget decision.
3. No sponsor, affiliate control group, employer group, household, or commonly
   controlled organization may occupy more than one seat across the board.
4. The chair and treasurer must be selected from the Ecosystem or Independent
   Public-Interest classes and must not be controlled by a current sponsor.
5. Terms are 24 months, staggered so a class does not normally turn over at
   once.
6. A director may serve two consecutive full terms, followed by at least a
   12-month break before another term.
7. Directors receive documented reasonable expenses only unless the governing
   documents and an unconflicted process authorize compensation.
8. Appointment is effective only after every consent, resolution, filing, and
   registry step required by the legal entity and jurisdiction is complete.

Sponsor seats provide meaningful influence without allowing sponsors alone to
form a board majority.

## 4. Sponsor status and thresholds

The launch reference currency is EUR. Non-EUR assets use the accepted
valuation policy at final receipt; exchange-rate movement before receipt is
the sponsor's risk.

| Status | Qualification | Recognition term | Governance scope |
|---|---:|---:|---|
| Contributor | Accepted contribution of at least EUR 100 | 12 months | Public register if requested |
| Supporting Sponsor | At least EUR 2,500 accepted in a rolling 12 months | 12 months | Sponsor briefings and proposals |
| Sustaining Sponsor | At least EUR 10,000 accepted in a rolling 12 months | 12 months | Sponsor Council membership |
| Endowment Sponsor | At least EUR 25,000 accepted into permanent endowment | 36 months | Sponsor Council membership |
| Principal Endowment Sponsor | At least EUR 100,000 accepted into permanent endowment | 48 months | Sponsor Director candidacy eligibility |

Amounts from affiliates under common beneficial control are aggregated for
status, voting, candidacy, and one-seat limits. Splitting transfers, entities,
or keys does not create more votes or candidates.

An in-kind contribution qualifies only after written acceptance and a
defensible value is recorded. Volunteered time does not count toward financial
thresholds, though the Foundation may separately recognize service.

The board reviews euro thresholds annually. A change applies only to future
offers, renewals, and elections. A seated director completes the term even if
the threshold later rises, unless removed for another valid reason.

## 5. Sponsor Council

The Onym Sponsor Council is the electorate and consultation body for the
Sponsor Director class.

### 5.1 Membership

A sponsor receives one Council membership when it holds an unexpired
Sustaining Sponsor, Endowment Sponsor, or Principal Endowment Sponsor
credential. One affiliate control group receives one membership and one vote.

Council membership provides:

- notice of sponsor-class elections and consultations;
- one equal vote in Sponsor Director elections;
- the right to nominate an eligible candidate with the candidate's consent;
- the right to publish bounded governance and spending proposals; and
- access to the same nonconfidential sponsor briefings as other members.

It does not provide a vote on the legal board, custody authority, confidential
director materials, or power to instruct a Sponsor Director.

### 5.2 Sponsor Director eligibility

A candidate must:

1. be nominated by a Principal Endowment Sponsor control group;
2. be a natural person legally able to serve in the Foundation's jurisdiction;
3. complete identity, sanctions, source-of-funds, skills, duty, and conflict
   review;
4. disclose employment, control group, board roles, material investments, and
   relevant family relationships;
5. accept that the contribution is irrevocable and creates no instructed
   mandate;
6. have no disqualifying conviction, regulatory bar, unresolved fraud, or
   pervasive conflict under the adopted policy;
7. sign the director duties and confidentiality acknowledgement; and
8. remain within the one-seat-per-control-group rule.

The candidate may be the sponsor, an employee, or an independent nominee. The
nominating relationship remains a declared conflict of loyalty throughout the
term.

### 5.3 Election

- Eligibility is snapshotted 30 days before nominations open.
- Nominations remain open for 21 days.
- Candidate statements and public conflict summaries remain available for at
  least 21 days before voting.
- Each eligible Sponsor Council control group casts one ranked ballot.
- Single transferable vote fills the available Sponsor Director seats.
- Ballots are confidential; eligibility snapshot, encrypted/committed ballots,
  tally procedure, result, and independent verification are public.
- A tie is resolved by a publicly verifiable random draw after one recount.
- Challenges must be filed within seven days of the result.
- The legal board records appointment only after challenges and legal checks
  finish.

No contribution-weighted or transferable vote is used.

## 6. Recognition inventory

The Foundation may promise recognition only on a signed inventory proving its
editorial control. The proposed inventory classes are:

1. Foundation website sponsor register;
2. annual and quarterly Foundation reports;
3. Foundation-hosted event materials;
4. public pages for a Foundation-funded grant or audit;
5. Foundation-owned newsletters and documentation; and
6. a nonintrusive “Acknowledgements” page in a client the Foundation itself
   publishes, if the product policy permits it.

Sponsor recognition is prohibited in:

- message lists, conversations, identity creation, recovery, safety warnings,
  consent, payment approval, or notary authorization;
- provider search results or directory rankings;
- conformance marks, audit results, or vulnerability disclosures;
- push notifications to users who did not request sponsor news; and
- an independent participant's product or resource.

### 6.1 Placement rules

- Every display says “Sponsor” or “Supported by”; no native-ad disguise.
- Sponsors within a tier receive equal typography and rotation.
- Ordering within a tier is randomized per static publication or rotated on a
  declared schedule, not sold secretly.
- A sponsor may use an approved name, short description, logo, and one safe
  link. No scripts, pixels, dynamic remote creative, or visitor identifiers
  are allowed.
- Recognition pages publish the applicable policy and status term.
- Foundation editorial review may reject unlawful, deceptive, unsafe,
  discriminatory, privacy-invasive, or mission-incompatible creative.
- Removal for a content or eligibility violation follows notice and appeal
  unless immediate action is necessary for law or safety.

Recognition is appreciation, not a statement that the sponsor's services are
secure, compatible, ethical, solvent, or preferred.

## 7. Gift acceptance

Before transferring funds, a sponsor and Foundation sign an accepted pledge
that identifies the fund class and any restriction. Unsolicited transfers do
not automatically create status, board eligibility, or an accepted
restriction.

The Foundation reviews:

- legal identity and beneficial control where required;
- sanctions, anti-money-laundering, anti-bribery, and source-of-funds risk;
- asset legality, custody, volatility, liquidity, tax, accounting, and
  environmental/operational burden;
- whether a restriction furthers the Foundation purpose and can be tracked;
- recognition content and reputational risk;
- private benefit, conflicts, and conditions inconsistent with director
  independence; and
- the cost of returning an unaccepted or prohibited asset.

Accepted permanent-endowment gifts are irrevocable except when law, a written
condition precedent, payment reversal, or a court/regulator requires
otherwise. Losing recognition, Council status, an election, or a board seat
does not refund an accepted gift.

The Foundation issues a legal receipt consistent with its jurisdiction and a
protocol receipt. Neither promises a tax deduction. The receipt discloses the
good-faith value of material recognition or other benefits where required.

## 8. Endowment custody and investment

The endowment is accounted for by legal fund and donor restriction. Assets are
never pooled in a way that erases enforceable restrictions, even if one
custodian or investment pool holds them operationally.

### 8.1 Control separation

- The board appropriates; the custodian executes; accounting reconciles; an
  independent reviewer verifies.
- No director, sponsor, employee, or wallet key can unilaterally disburse.
- Fiat custody uses accounts in the Foundation's legal name with dual approval
  under the treasury matrix.
- Digital assets, if accepted, use an approved institutional custodian or a
  board-approved threshold wallet with at least three of five independent
  signers and no control group holding more than one signing key.
- Signing a transaction cannot cure the absence of a valid board resolution.

### 8.2 Investment rule

The investment committee proposes a written allocation balancing preservation
of long-term purchasing power, prudent total return, diversification,
liquidity, costs, and the Foundation's expected grants. The full board adopts
it under the conflict and vote rules.

Illiquid, concentrated, encumbered, anonymous, or operationally burdensome
assets may be refused or converted promptly under the accepted gift terms.
The Foundation does not promise to hold a donated token or invest in a
sponsor's business.

## 9. Endowment spending rule

### 9.1 Ordinary annual appropriation

The maximum ordinary annual appropriation is:

```text
spendingBase = average of the prior twelve calendar quarter-end
               endowment market values

ordinaryMaximum = floor(spendingBase * 4%)

lawfulMaximum = amount permitted after donor restrictions, applicable law,
                liquidity, prudence, and underwater-fund review

annualAppropriation = min(ordinaryMaximum, lawfulMaximum,
                          boardApprovedBudget)
```

If fewer than twelve quarter-end values exist, the average uses every complete
quarter, but no ordinary endowment appropriation occurs until four complete
quarters exist. Direct operating contributions may fund earlier work.

Investment-management and custody fees are reported separately. The legal
documents determine whether they count inside or outside the four-percent
limit; the adopted profile must not hide the treatment.

### 9.2 Exceptional appropriation

An additional draw above the ordinary maximum requires:

1. a documented emergency or time-limited exceptional opportunity within the
   Foundation purpose;
2. written legal, restriction, liquidity, and long-term-impact analysis;
3. at least 14 days of public notice unless disclosure would worsen an actual
   emergency;
4. seven affirmative votes from the nine-seat board, including at least four
   affirmative non-sponsor directors; and
5. a separate public resolution and restoration plan.

The additional draw may not exceed one percent of the same spending base in a
fiscal year unless governing law requires or a court/regulator authorizes a
different action.

## 10. Spending governance

Any director, including a Sponsor Director, may introduce a proposal. Sponsor
Council and community proposals require one director to sponsor them before a
board vote.

### 10.1 Normal proposal process

1. Publish purpose, recipient, amount, fund, restrictions, deliverables,
   alternatives, diligence, and conflicts.
2. Allow at least 30 days of public comment.
3. Record staff and committee analysis.
4. Snapshot director eligibility and recusals.
5. Hold a recorded board vote.
6. Publish the resolution, permitted dissent, contract milestones, and planned
   disbursements.
7. Release funds only under the custody matrix and milestone schedule.
8. Publish completion, variance, failure, recovery, and impact reporting.

### 10.2 Approval and quorum

- Six unconflicted directors form ordinary quorum.
- Ordinary budgets, grants, and endowment appropriations require six
  affirmative votes, including at least two Ecosystem or Independent
  Public-Interest Directors.
- Changes to board composition, sponsor-director cap, conflict rules,
  exceptional draw limit, dissolution, or legal purpose require seven
  affirmative votes, including at least four non-sponsor directors, plus any
  member/regulator approval required by law.
- A recused director does not deliberate, vote, or count toward unconflicted
  quorum for that matter.
- If recusals make quorum impossible, the proposal is deferred or sent to the
  lawful independent mechanism; conflicted votes are not restored for
  convenience.

### 10.3 Sponsor-related transactions

A proposal benefiting a current sponsor, its control group, a sponsor
director, or a connected person requires:

- full conflict disclosure and recusal of every connected director;
- documented mission need and alternatives;
- independent price or grant evaluation;
- terms no more favorable than an arm's-length comparable arrangement;
- approval entirely by the unconflicted board under applicable law; and
- public identification of the relationship and decision basis.

If the remaining board lacks independence or quorum, the Foundation does not
proceed without a lawful external approval mechanism. Sponsorship cannot be
used to route endowment funds back to the donor.

## 11. Sponsor Director duties and removal

Every Sponsor Director signs the same core duties as other directors and an
additional acknowledgement that:

- their nominating sponsor cannot instruct a vote;
- confidential information cannot be returned to the sponsor;
- the director must disclose loyalty and financial conflicts;
- sponsor status does not guarantee reelection or completion of a term after
  misconduct; and
- Foundation purpose and law prevail over the implementation profile.

A director may be suspended during a credible investigation when necessary to
protect assets, people, evidence, or legal compliance. Removal requires the
governing document's procedure and at least seven unconflicted board votes in
this profile, unless law, a regulator, court, or automatic disqualification
requires another result. The director receives notice, the evidence allowed by
law, and a chance to respond.

A vacancy is filled by the next eligible election result only when the pinned
election rule permits it; otherwise the Sponsor Council runs a special
election. The replacement serves the remainder of the term.

## 12. Recognition suspension and status loss

Recognition may be suspended or revoked for:

- payment reversal or fraudulent valuation;
- sanctions or legal prohibition;
- concealed beneficial control or material false statement;
- unsafe, unlawful, deceptive, or mission-incompatible creative;
- trademark misuse or implication of technical endorsement;
- attempted bribery, vote instruction, retaliation, or private-benefit demand;
- serious breach of the sponsor agreement; or
- expiry without renewal.

Except where immediate legal or safety action is necessary, the Foundation
provides notice, grounds, a response period, and review by unconflicted
decision-makers. Revocation ends future recognition and Council rights. It
does not retroactively reclassify or refund an irrevocable endowment gift.

## 13. Public records

The Foundation publishes:

- current legal/profile status and every policy version;
- resource inventory and active recognition placements;
- sponsor names or approved pseudonyms, tiers, and terms;
- total received by fund class and contribution bands by sponsor;
- full board roster, class, term, public conflict summary, and attendance;
- Sponsor Council election eligibility counts, tally evidence, and results;
- proposals, recusals, resolutions, named director votes, and dissent;
- quarterly custody and endowment balances by fund/restriction class;
- annual spending-base calculation and appropriation limit;
- grants, vendors, milestones, variances, and completion reports; and
- annual independently reviewed or audited financial statements at the level
  required by law and asset size.

Exact payment coordinates, private compliance documents, protected personal
information, signing secrets, privileged advice, and protected beneficiary
data remain private. A public contribution band is not a substitute for the
Foundation's legally required accounting.

## 14. Protocol records

The Onym implementation uses the abstract objects plus:

```json
{
  "version": 1,
  "policyId": "onym:sponsor-policy:onym-foundation-launch-v1",
  "status": "proposed_non_operational",
  "referenceCurrency": "EUR",
  "board": {
    "totalSeats": 9,
    "sponsorSeats": 3,
    "ecosystemSeats": 3,
    "independentSeats": 3,
    "termMonths": 24,
    "consecutiveTermLimit": 2
  },
  "sponsorCouncilThreshold": {"minorUnits": 1000000, "currency": "EUR"},
  "boardCandidateEndowmentThreshold": {"minorUnits": 10000000, "currency": "EUR"},
  "ordinaryEndowmentDrawBasisPoints": 400,
  "exceptionalAdditionalDrawBasisPoints": 100,
  "ordinaryApprovalVotes": 6,
  "extraordinaryApprovalVotes": 7,
  "legalEntityManifest": null,
  "governingDocuments": [],
  "signature": "<not-valid-until-legally-adopted>"
}
```

Amounts use euro cents. `1000000` is EUR 10,000; `10000000` is EUR 100,000.
The absence of a legal manifest and valid signature prevents this draft from
being mistaken for a live fundraising offer.

## 15. Threat model

| Threat | Control |
|---|---|
| Donor captures board | Sponsor seats capped at one-third; non-sponsor chair/treasurer; extraordinary cross-class vote |
| Donor splits entities | Beneficial-control aggregation and one-seat rule |
| Board funnels grants to sponsor | Disclosure, recusal, independent review, unconflicted approval |
| Foundation sells technical favoritism | Recognition inventory and explicit prohibited resources |
| Recognition becomes tracking | Static creative; no scripts, pixels, remote assets, or user identifiers |
| Custodian or signer steals assets | Legal-name custody, separation, threshold signing, reconciliation, audit |
| Board overspends endowment | 4% trailing-average cap and exceptional 1% supermajority rule |
| Hidden restriction is ignored | Signed acceptance, fund accounting, proposal compatibility check |
| Election becomes pay-weighted | One verified control group, one equal ranked ballot |
| Protocol record fakes legal authority | `pending_legal_effect` plus governing-document precedence |
| Foundation hides a failure | Append-only corrections, public resolutions, quarterly and annual reporting |

No contract eliminates collusion among directors, custodian, staff, auditor,
and sponsors. Legal enforcement, independent review, public evidence,
replacement, and a diverse board remain necessary.

## 16. Implementation sequence

This profile becomes operational only after this sequence:

1. incorporate or designate the legal entity and jurisdiction;
2. adopt purpose, governing documents, board classes, and appointment powers;
3. obtain required registrations, tax treatment, banking/custody, accounting,
   sanctions, privacy, and fundraising advice;
4. reconcile this profile with law and amend conflicts explicitly;
5. appoint the initial lawful board without claiming a sponsor election that
   did not occur;
6. adopt gift, recognition, endowment, investment, spending, conflict,
   whistleblower, document-retention, and disclosure policies;
7. publish signed legal-entity, resource-inventory, and custody manifests;
8. commission security and financial-control review;
9. activate contribution rails and offers only after board resolution; and
10. issue the first receipt/status only after confirmed lawful acceptance.

Until step 9, every UI must say “draft—do not send funds.”

## 17. Conformance tests

A conforming Onym Foundation implementation proves that:

1. no live offer exists without a signed legal-entity manifest;
2. every contribution is classified and reconciled to custody;
3. thresholds aggregate sponsor affiliates and exact asset valuation;
4. status and recognition expire under pinned terms;
5. only inventory-controlled resources accept recognition;
6. sponsor creative cannot execute code or track visitors;
7. Council votes are equal and Sponsor Director seats never exceed three;
8. legal appointment is required after election;
9. sponsor directors have one vote and conflict recusals remove their quorum
   participation;
10. ordinary and exceptional spending formulas and cross-class votes are
    enforced;
11. no person can both approve and unilaterally execute a disbursement;
12. restriction-incompatible spending is rejected;
13. policy changes cannot alter completed gifts, elections, or resolutions;
14. public reports omit protected payment and identity data; and
15. another foundation profile can use the abstract contract without an Onym
    Foundation signature.

## 18. Legal and governance references

These sources illustrate why the profile requires director independence,
conflict management, and private-benefit controls. They do not establish the
law governing a future Onym Foundation:

- US Internal Revenue Service,
  [Purpose of a conflict-of-interest policy](https://www.irs.gov/charities-non-profits/form-1023-purpose-of-conflict-of-interest-policy)
- US Internal Revenue Service,
  [Inurement/private benefit](https://www.irs.gov/charities-non-profits/charitable-organizations/inurement-private-benefit-charitable-organizations)
- Charity Commission for England and Wales,
  [Conflicts of interest: a guide for charity trustees](https://www.gov.uk/government/publications/identifying-and-managing-conflicts-of-interest-in-a-charity-cc29/conflicts-of-interest-a-guide-for-charity-trustees)
- Charity Commission for England and Wales,
  [Guidance for charities connected to non-charities](https://www.gov.uk/guidance/guidance-for-charities-with-a-connection-to-a-non-charity)

The final legal implementation must cite its actual jurisdiction's current
statutes, regulator guidance, and executed governing documents.
