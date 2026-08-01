# Onym Sponsor Contract Boundary

**Architecture draft 0.1 — August 2026**

> A sponsor may fund a foundation, receive transparent recognition on that
> foundation's resources, and participate in a bounded governance class. A
> contribution buys no user, protocol privilege, or exemption from a
> director's duty to the foundation.

This document defines a technology-neutral contract for foundations that want
open sponsorship, endowment contributions, public recognition, and a sponsor
path into foundation governance. It is not tied to the Onym Foundation, a
jurisdiction, legal form, custody provider, investment strategy, currency,
identity system, website, or voting technology.

The initial proposed implementation is
[Sponsor-Onym.md](Sponsor-Onym.md). Any other foundation may publish a
different conforming implementation profile with its own purposes, resource
inventory, contribution thresholds, recognition classes, board composition,
endowment policy, and applicable law.

This specification is not articles of incorporation, bylaws, a trust deed, a
tax opinion, or an offer of an investment. A protocol record cannot create a
legal directorship unless the foundation's governing documents and applicable
law give that record effect.

## 1. Decision

Sponsorship is an open support seat, not ownership of Onym or of a foundation.

- Anyone may submit a contribution or sponsorship application under a
  foundation's published eligibility policy.
- The foundation may accept, reject, return, or condition a contribution under
  its lawful gift-acceptance and risk policies.
- An accepted sponsor may receive signed status and recognition on resources
  the foundation actually controls.
- A qualifying sponsor may join a sponsor electorate, stand for a reserved
  board class, and vote in its selection process when the implementation
  permits it.
- A sponsor director participates in endowment and budget decisions as one
  fiduciary member of the board. The director does not control “their money”
  after an irrevocable contribution.
- Contribution size may establish eligibility or a recognition tier, but it
  does not weight a seated director's vote unless a foundation explicitly
  publishes a different, legally valid profile.
- No sponsorship grants authority over identities, messages, transports,
  notaries, association registries, applications, independent providers, or
  protocol conformance.

Open participation means anyone can make an offer or build another foundation
from the protocol. It does not require one foundation to accept every source
of funds, display unlawful material, create unlimited board seats, or violate
its charitable purpose and legal duties.

## 2. Roles and assets

- The **foundation** is the legal or organizational body receiving funds,
  controlling named resources, and adopting a sponsor implementation profile.
- The **sponsor** contributes money, assets, or an accepted in-kind resource
  and may request recognition or governance eligibility.
- The **foundation board** is the body legally responsible for strategy,
  oversight, investment, and spending within the foundation's purpose.
- The **sponsor council** is the open or threshold-qualified electorate for
  sponsor-class nominations, elections, consultation, and proposals.
- A **sponsor director** is a legal board member selected through the sponsor
  class but owing the same duties as every other director.
- The **treasurer or endowment custodian** receives, values, segregates,
  invests, and disburses assets under approved policy.
- The **recognition publisher** controls a website, application surface,
  report, event, or other resource on which sponsor status may be displayed.
- The **governance recorder** signs proposals, conflicts, votes, resolutions,
  appointments, and spending reports. It is evidence, not a substitute for
  the foundation's legal records.
- The **auditor or reviewer**, where appointed, reconciles receipts, custody,
  spending, restrictions, and public statements.

Foundation-controlled assets are distinct:

- **operating funds** may be spent under the current budget;
- **board-designated reserves or quasi-endowment** may be released by the
  board under its own policy;
- **term-restricted funds** are restricted until a date or condition;
- **purpose-restricted funds** may be used only for an accepted purpose; and
- **permanent endowment** is managed and appropriated subject to the gift
  instrument, governing documents, applicable law, and prudent policy.

Calling every contribution an “endowment” would be misleading. The receipt and
public report must name the actual fund class.

## 3. Recognition is bounded

A sponsor may earn public recognition only on resources listed in the
foundation's signed `RecognitionInventory`. Examples include:

- the foundation website's sponsor page;
- annual reports and audited statements;
- foundation-hosted events and grant reports;
- foundation-owned documentation, newsletters, and public dashboards; or
- a specifically declared acknowledgement area in foundation-published apps.

Recognition never implies control over:

- an independently published Onym client or website;
- a user's identity, UI, service route, or local state;
- a provider's relay, blob server, notary, registry, or application;
- a permissionless protocol implementation;
- technical conformance or security-audit results;
- directory inclusion or ranking;
- a grant, procurement award, or regulatory endorsement; or
- continued recognition after the credential's declared term.

Every placement is visibly labelled as sponsorship or acknowledgement. It
shows the recognized name or pseudonym, tier, foundation, period, and policy
link. It cannot masquerade as a user recommendation or protocol requirement.

## 4. Contribution and benefit semantics

Before payment, the sponsor receives a signed disclosure describing:

- receiving legal entity and jurisdiction;
- charitable or organizational purpose;
- accepted asset, valuation, payment rail, and custody destination;
- fund class and any accepted restriction;
- whether the contribution is irrevocable;
- recognition benefit and its good-faith value where relevant;
- sponsor-council or board eligibility, but not a guaranteed result unless the
  governing documents lawfully guarantee it;
- identity, sanctions, source-of-funds, tax, and reporting requirements;
- refund, rejection, reversal, and failed-payment behavior; and
- authoritative legal documents and order of precedence.

A contribution is not a purchase of securities, equity, revenue share, token,
network ownership, or financial return. No document may promise appreciation,
yield, repayment, or profits from the efforts of the foundation unless a
separate lawful instrument explicitly exists outside this sponsor profile.

Recognition, event admission, membership benefits, or other consideration can
affect whether a payment is legally or taxfully treated as a donation. A
receipt records the benefit; it does not promise deductibility. Sponsors obtain
their own advice in the relevant jurisdiction.

## 5. Board participation

### 5.1 Finite board, open path

A legal board is finite. A conforming foundation therefore publishes:

- number and class of board seats;
- maximum sponsor-director proportion;
- qualification threshold and lookback period;
- nomination, due-diligence, election, appointment, and acceptance steps;
- voter eligibility and voting rule;
- term, staggering, renewal, and consecutive-term limit;
- affiliate aggregation and one-seat-per-control-group rule;
- vacancy, suspension, resignation, and removal procedure;
- independence, skill, residency, and diversity constraints where lawful;
- conflict, confidentiality, compensation, and expense policies; and
- legal filing or registration required before a term begins.

Every qualified sponsor can join the published selection process. Qualification
does not create an unlimited or permanent seat. If qualified candidates exceed
available seats, the sponsor electorate chooses among them under the pinned
rule.

### 5.2 Fiduciary independence

A sponsor director is not an instructed delegate of the sponsor that nominated
or employed them. Once seated, the director must act in the foundation's best
interests and purpose under the governing documents and applicable law.

The director:

1. signs a duty, confidentiality, and conflict acknowledgement;
2. discloses financial, employment, family, governance, grant, and vendor
   relationships at appointment, annually, and when a matter arises;
3. does not receive contribution-weighted board voting power;
4. leaves discussion and voting when a conflict cannot be safely managed;
5. cannot direct a grant, procurement, compensation, or benefit to themselves
   or an affiliate;
6. preserves confidential information without hiding the public basis of a
   spending decision; and
7. may be removed under the same lawful duty and misconduct standards as
   another director.

Sponsor-class selection explains how the director reached the board; it does
not lower the director's duties.

### 5.3 Influence over spending

A sponsor director may:

- introduce or co-sponsor a spending proposal;
- question staff, advisers, grantees, and investment providers;
- request information available to all directors;
- participate in deliberation when unconflicted;
- cast one recorded vote on budgets, grants, investment, and endowment
  appropriations; and
- publish a permitted explanation or dissent after the decision.

No donor retains a private veto over unrestricted funds after acceptance.
Restrictions in an accepted gift instrument bind the foundation through the
fund restriction, not through continuing private control by the donor.

## 6. Contract objects

### 6.1 Foundation Profile

```json
{
  "profileVersion": 1,
  "profileId": "onym:sponsor-profile:foundation-v1",
  "interface": "onym-sponsor-v1",
  "foundation": "onym:key:<foundation-id>",
  "legalEntity": "<registered-name-and-number-or-proposed-status>",
  "jurisdiction": "<declared>",
  "purpose": "<content-addressed-purpose>",
  "governingDocuments": ["<content-addressed-document>"],
  "resourceInventory": "<recognition-inventory-hash>",
  "giftAcceptancePolicy": "<policy-hash>",
  "endowmentPolicy": "<policy-hash>",
  "boardPolicy": "<policy-hash>",
  "conflictPolicy": "<policy-hash>",
  "disclosurePolicy": "<policy-hash>",
  "signature": "<foundation-signature>"
}
```

### 6.2 Foundation Implementation Profile

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:sponsor-implementation:<foundation>-v1",
  "sponsorProfileId": "onym:sponsor-profile:foundation-v1",
  "recognitionClasses": "<versioned-classes>",
  "contributionRails": ["<rail-profile>"],
  "fundClasses": ["operating", "board-designated", "term-restricted", "purpose-restricted", "permanent-endowment"],
  "boardClasses": "<seat-and-election-policy>",
  "spendingRule": "<appropriation-and-vote-policy>",
  "legalPrecedence": "governing-documents-and-applicable-law",
  "specification": "<content-addressed-specification>",
  "signature": "<foundation-signature>"
}
```

### 6.3 Sponsor Offer

```json
{
  "version": 1,
  "offerId": "<random-id>",
  "implementationProfileId": "onym:sponsor-implementation:<foundation>-v1",
  "foundation": "onym:key:<foundation-id>",
  "recognitionTier": "<tier>",
  "recognitionTerm": "P1Y",
  "eligibleResources": ["<resource-id>"],
  "minimumContribution": {"minorUnits": 100000, "currency": "<reference-currency>"},
  "acceptedFundClasses": ["operating", "permanent-endowment"],
  "boardEligibility": {
    "included": false,
    "policy": "<board-policy-hash>"
  },
  "benefitValue": {"minorUnits": 0, "currency": "<reference-currency>"},
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<foundation-signature>"
}
```

The values are illustrative. Each implementation publishes its real amounts
and currencies. A sponsor offer cannot amend the foundation's legal documents.

### 6.4 Contribution Pledge

```json
{
  "version": 1,
  "pledgeId": "<random-id>",
  "offerId": "<offer-id>",
  "sponsor": "onym:key:<sponsor-id>",
  "publicName": "<requested-name-or-pseudonym>",
  "amount": {"minorUnits": 500000, "currency": "<declared>"},
  "asset": "<asset-and-network>",
  "fundClass": "permanent-endowment",
  "requestedRestriction": "<none-or-purpose-and-expiry>",
  "recognitionRequested": true,
  "privacy": "public-name-private-payment-coordinate",
  "eligibilityEvidence": ["<required-compliance-evidence>"],
  "validUntil": "2026-08-31T23:59:59Z",
  "signature": "<sponsor-signature>"
}
```

A requested restriction is not binding until the foundation explicitly
accepts it. Silence, receipt of an incompatible transfer, or a memo field does
not amend the gift instrument.

### 6.5 Contribution Acceptance and Receipt

```json
{
  "version": 1,
  "receiptId": "<nonreusable-id>",
  "pledgeId": "<pledge-id>",
  "foundation": "onym:key:<foundation-id>",
  "sponsor": "onym:key:<sponsor-id>",
  "received": {"amount": "<exact-asset-units>", "asset": "<asset-and-network>"},
  "referenceValue": {"minorUnits": 500000, "currency": "<reference-currency>"},
  "valuationMethod": "<source-time-and-policy>",
  "receivedAt": "2026-08-15T00:00:00Z",
  "fundClass": "permanent-endowment",
  "acceptedRestriction": "<none-or-exact-restriction-hash>",
  "irrevocable": true,
  "recognizedBenefit": "<tier-term-and-estimated-value>",
  "taxDeductibilityPromised": false,
  "paymentEvidence": "<private-or-redacted-reference>",
  "signature": "<foundation-signature>"
}
```

The receipt never exposes a private bank account, full payment credential, or
unnecessary source-of-funds document. Statutory receipts and private records
may contain more data and remain under the foundation's retention policy.

### 6.6 Sponsor Status Credential

```json
{
  "version": 1,
  "credentialId": "<random-id>",
  "foundation": "onym:key:<foundation-id>",
  "subject": "onym:key:<sponsor-id>",
  "status": "<recognition-tier>",
  "scope": ["recognition", "sponsor-council"],
  "validFrom": "2026-08-15T00:00:00Z",
  "validUntil": "2027-08-15T00:00:00Z",
  "sourceReceipts": ["<receipt-hash>"],
  "policyVersion": "<policy-hash>",
  "revocationEndpoint": "<status-endpoint>",
  "signature": "<foundation-signature>"
}
```

The credential is nontransferable. It proves foundation-issued status, not
control of the foundation or truth of the sponsor's marketing claims.

### 6.7 Recognition Placement

```json
{
  "version": 1,
  "placementId": "<random-id>",
  "credentialId": "<sponsor-status-credential>",
  "resourceId": "<foundation-controlled-resource>",
  "label": "Sponsor",
  "displayName": "<approved-name>",
  "creativeHash": "<approved-logo-or-text-hash>",
  "startsAt": "2026-08-15T00:00:00Z",
  "endsAt": "2027-08-15T00:00:00Z",
  "publisher": "onym:key:<recognition-publisher>",
  "signature": "<publisher-signature>"
}
```

### 6.8 Board Candidacy and Appointment

```json
{
  "version": 1,
  "candidacyId": "<random-id>",
  "foundation": "onym:key:<foundation-id>",
  "candidate": "onym:key:<candidate-id>",
  "sponsorControlGroup": "<declared-affiliate-group>",
  "boardClass": "sponsor-director",
  "eligibilityReceipts": ["<receipt-hashes>"],
  "qualificationStatement": "<content-addressed-statement>",
  "conflictDisclosure": "<public-summary-and-private-register-reference>",
  "consentsToDuties": true,
  "term": {"startsAt": "<date>", "endsAt": "<date>"},
  "signature": "<candidate-signature>"
}
```

After the pinned election and legal appointment steps, the foundation issues:

```json
{
  "version": 1,
  "appointmentId": "<random-id>",
  "candidacyId": "<candidacy-id>",
  "resolutionId": "<board-or-member-resolution>",
  "electionEvidence": "<canonical-result-hash>",
  "legalEffectiveAt": "<date-or-null-until-complete>",
  "termEndsAt": "<date>",
  "status": "effective",
  "signature": "<foundation-signature>"
}
```

A result remains `pending_legal_effect` until every appointment step required
by the governing documents and law is complete.

### 6.9 Spending Proposal and Resolution

```json
{
  "version": 1,
  "proposalId": "<random-id>",
  "foundation": "onym:key:<foundation-id>",
  "proposer": "onym:key:<director-or-authorized-party>",
  "purpose": "<public-purpose-and-deliverables>",
  "requested": {"minorUnits": 2500000, "currency": "<declared>"},
  "fundSource": "<operating-or-endowment-fund-id>",
  "restrictionCompatibility": "<analysis-hash>",
  "recipient": "<proposed-grantee-or-vendor>",
  "conflicts": ["<declared-conflict-references>"],
  "publicCommentEndsAt": "<date>",
  "voteOpensAt": "<date>",
  "supportingMaterial": "<content-addressed-bundle>",
  "signature": "<proposer-signature>"
}
```

The final `SpendingResolution` records eligible directors, recusals, quorum,
votes, governing rule, amount, fund, milestones, dissent, and signatures. A
public vote record may identify directors while private legal advice and
protected personal data remain access controlled.

## 7. Common contract surface

| Operation | Input | Result |
|---|---|---|
| `publishFoundationProfile` | Purpose, entity, policies, resources | Signed implementation profile |
| `publishSponsorOffer` | Tier, contribution, benefits, term | Signed offer |
| `pledgeContribution` | Sponsor, asset, fund class, restriction | Pending pledge |
| `acceptContribution` | Due diligence and compatible terms | Acceptance instructions |
| `recordContribution` | Final payment/custody evidence | Receipt and fund entry |
| `issueSponsorStatus` | Receipt and policy | Revocable status credential |
| `publishRecognition` | Credential and approved creative | Bounded acknowledgement |
| `joinSponsorCouncil` | Valid qualifying status | Council membership |
| `nominateSponsorDirector` | Candidate and eligibility | Pending candidacy |
| `recordSponsorElection` | Eligible voters and ballots | Canonical result |
| `recordBoardAppointment` | Result plus legal steps | Effective or pending appointment |
| `proposeSpending` | Purpose, amount, fund, conflicts | Public proposal |
| `recordConflict` | Director and matter | Recusal/management record |
| `voteSpending` | Eligible director and proposal | Signed vote |
| `recordResolution` | Quorum, votes, legal rule | Approved/rejected resolution |
| `recordDisbursement` | Resolution and custody evidence | Spending statement |
| `revokeStatus` | Policy ground and due process | Revocation record |

There is no operation for `buyProtocolControl`, `buyUserData`,
`forceDirectoryInclusion`, `overrideConformance`, `instructDirectorVote`, or
`claimInvestmentReturn`.

## 8. Recognition policy requirements

Every foundation implementation specifies:

1. exact resources it controls and can promise;
2. tier names, qualification, term, and renewal;
3. placement size, order, rotation, accessibility, and sponsorship label;
4. permitted names, links, logos, claims, and content categories;
5. trademark license, if any, and its revocation;
6. editorial, sanctions, safety, and reputational review;
7. whether anonymous or pseudonymous recognition is allowed;
8. suspension, appeal, expiry, and correction;
9. benefit valuation and required tax disclosure; and
10. the statement that recognition is not technical endorsement.

Independent implementations owe no recognition to a foundation sponsor. The
foundation cannot sell what it does not control.

## 9. Endowment and spending policy requirements

A conforming implementation publishes:

- purpose and duration of each fund;
- gift-acceptance and restriction-review process;
- custody, signing, valuation, and asset-conversion policy;
- investment objectives, liquidity, diversification, risk, fees, and adviser
  conflicts;
- spending-rate formula and valuation period;
- treatment of inflation, underwater funds, fees, and exceptional draws;
- proposal, public-comment, quorum, voting, recusal, and emergency rules;
- grant diligence, contracts, milestones, reporting, and clawback terms;
- financial statements, audits/reviews, and public reporting schedule; and
- dissolution or successor-foundation treatment.

No director alone can move endowment assets. Custody authorization and board
appropriation are separate. A cryptographic multisignature may enforce a
custody threshold, but it does not replace legal approval, accounting, or a
valid charitable purpose.

Donor restrictions are accepted only when they further the foundation's
purpose, can be administered, and do not create unlawful private control. A
foundation may refuse a gift whose restriction, asset, source, volatility,
liability, reputation, or compliance cost is unacceptable.

## 10. Governance and voting requirements

The implementation pins:

- electorate snapshot and eligibility cutoff;
- one-person/organization/identity rule and affiliate aggregation;
- nomination window and candidate disclosure;
- ballot secrecy or publicity and verification method;
- plurality, ranked choice, approval, or other exact tally;
- tie, recount, challenge, vacancy, and failed-election behavior;
- quorum calculated after valid recusals;
- ordinary and extraordinary decision thresholds; and
- whether a legal board, members, regulator, or court has final authority.

Contribution-weighted board votes are prohibited by the baseline profile.
Recognition tiers may vary by amount, but every seated director has one vote.
A foundation wishing to use weighted member governance must publish a
different profile and may not call those votes fiduciary board votes.

## 11. Conflicts and private benefit

A director or decision participant discloses a conflict before discussion.
The unconflicted body records whether the conflict is absent, manageable by
disclosure/recusal, or too pervasive for the person to participate or remain
in office.

At minimum, a sponsor director recuses when a proposal would benefit:

- the director or their family;
- the nominating sponsor or an affiliate;
- an employer, controlled entity, major investment, or board relationship;
- a grant applicant, vendor, or counterparty with a material relationship; or
- another organization to which the director owes a conflicting duty.

The conflicted person does not receive nonpublic advocacy material, join
deliberation, vote, or count toward the matter's unconflicted quorum, except
where applicable law and the recorded policy allow limited factual answers.

Recognition delivered uniformly under a published sponsor offer is not by
itself a grant back to a director, but its value and tax treatment must be
disclosed. Any special benefit outside the offer receives independent review.

## 12. Privacy and transparency

The public needs enough information to audit institutional power, while the
foundation should not publish unnecessary payment or identity data.

Public by default:

- foundation profile and policy versions;
- recognized sponsor name/pseudonym, status, tier, and term;
- aggregate contribution and endowment balances by fund class;
- directors, appointing class, term, public interests, and recusals;
- spending proposals, resolutions, vote totals or named votes under policy;
- grants, vendors, amount, purpose, milestones, and completion status; and
- annual financial, investment, conflict, and impact reports.

Private or access-controlled by default:

- bank, wallet, tax, and payment coordinates;
- source-of-funds and sanctions-screening documents;
- home address, government identifier, and unrelated personal data;
- security-sensitive custody and signing details;
- legally privileged advice; and
- protected beneficiary or whistleblower information.

A sponsor may be publicly pseudonymous only if the foundation can still
perform legally required identification privately. A board director's legal
identity is disclosed whenever governing law requires it.

## 13. Errors and state

| Error | Origin | Required response |
|---|---|---|
| `foundation_profile_invalid` | Foundation | Do not publish offers |
| `legal_entity_unverified` | Foundation | Mark profile proposed/non-operational |
| `offer_expired` | Sponsor offer | Refuse new pledge |
| `asset_unsupported` | Gift policy/custodian | Reject or return under policy |
| `restriction_unacceptable` | Board/gift committee | Reject or negotiate before acceptance |
| `payment_unconfirmed` | Rail/custodian | Keep pledge pending |
| `valuation_unavailable` | Treasurer | Do not assign tier yet |
| `compliance_review_failed` | Foundation | Reject, freeze, or report as law requires |
| `recognition_content_rejected` | Publisher | Request conforming replacement |
| `resource_not_controlled` | Foundation | Remove promise; offer remedy |
| `board_threshold_not_met` | Candidate | Refuse candidacy |
| `affiliate_seat_conflict` | Board policy | Aggregate control group; refuse extra seat |
| `election_disputed` | Governance recorder | Delay appointment and apply challenge rule |
| `legal_appointment_pending` | Entity/registry | Do not expose effective director authority |
| `conflict_undeclared` | Director/audit | Suspend matter; investigate and correct |
| `quorum_unavailable` | Board | Defer or use lawful fallback |
| `restriction_mismatch` | Spending proposal | Reject appropriation |
| `custody_mismatch` | Treasurer/auditor | Freeze disbursement and reconcile |
| `private_benefit_risk` | Board/adviser | Independent review; reject if unresolved |

Contribution state:

```text
offered -> pledged -> screening -> accepted -> payment_pending
  -> received -> valued -> allocated -> status_issued
  -> recognized -> expired | renewed | revoked
```

Board state:

```text
eligible -> nominated -> screened -> candidate -> elected
  -> pending_legal_effect -> seated -> term_ended
                                  `-> suspended -> removed | restored
```

Spending state:

```text
draft -> published -> comment -> conflict_review -> vote
  -> approved | rejected | deferred
  -> contracted -> disbursed -> milestone_review -> completed | recovered
```

## 14. Invariants

1. **No contribution buys a user.** Sponsorship never attaches to identities
   or downstream activity.
2. **No contribution buys protocol privilege.** Wire rules, conformance, and
   direct use remain independent.
3. **Recognition is owned-resource scoped.** A foundation promises only
   placements it controls.
4. **A board is finite.** Open eligibility uses a declared selection process,
   not fictional unlimited seats.
5. **A director is a fiduciary, not a delegate.** Sponsor origin does not
   permit instructed voting.
6. **One director, one vote.** Contribution size does not weight board votes
   under the baseline profile.
7. **Conflicts are disclosed and managed.** A sponsor cannot vote foundation
   money to itself or an affiliate.
8. **Endowment classes are honest.** Operating funds, reserves, restrictions,
   and permanent endowment are not conflated.
9. **No unilateral custody.** Approval and asset movement require independent
   controls.
10. **Policy is prospective.** Active recognition, elections, and gifts pin
    their governing versions.
11. **Legal documents prevail.** Protocol evidence cannot override law,
    bylaws, restrictions, or regulator/court authority.
12. **Other foundations remain possible.** No Onym Foundation profile becomes
    a root of trust for the sponsor protocol.

## 15. Versioning and conformance

- `SponsorProfile` changes when core contribution, recognition, governance,
  conflict, endowment, or evidence meaning changes.
- `FoundationImplementationProfile` changes when a foundation's entity,
  resource, tier, board, voting, spending, custody, or legal mapping changes.
- Offers, receipts, credentials, elections, appointments, and resolutions pin
  the exact policy versions that govern them.
- A policy change cannot retroactively turn a gift into another fund class,
  extend recognition, qualify a candidacy, or alter a completed vote.
- Legal amendments and protocol updates are recorded separately and cross-
  referenced.
- Conformance tests cover signatures, policy precedence, fund allocation,
  tier calculation, status expiry/revocation, affiliate aggregation, election
  tally, quorum, recusal, spending arithmetic, custody threshold, and replay.

## 16. Foundation portability

Anyone may create another foundation implementation by publishing:

1. a valid `FoundationProfile` and legal/proposed status;
2. its purpose and governing documents;
3. resources it actually controls;
4. contribution, recognition, endowment, board, voting, conflict, disclosure,
   and dissolution policies;
5. public keys and governance recorder;
6. contribution rails and custody evidence model; and
7. a conformance statement and implementation-profile ID.

A compatible foundation may use a two-tier board, a membership assembly, no
sponsor directors, different contribution classes, or a different spending
formula. It must expose those differences rather than inherit the Onym
Foundation's choices silently.

Foundations may recognize one another or share software. They do not share
treasury, board authority, trademarks, donor restrictions, or liability unless
a separate legal agreement says so.

## 17. Acceptance criteria

The sponsor boundary is successfully separated when:

1. anyone can inspect the profile and submit a conforming sponsorship pledge;
2. accepted contributions produce receipts with honest fund classification;
3. sponsor status can be verified and displayed only on controlled resources;
4. recognition is labelled, scoped, expiring, and never sold as technical
   privilege;
5. qualifying sponsors have a defined path into a finite sponsor board class;
6. effective legal appointment is distinguished from an election result;
7. sponsor directors can propose and vote on spending while conflicts prevent
   self-benefit;
8. endowment restrictions, custody, appropriation, and disbursement are
   independently auditable;
9. private compliance and payment data stays out of public objects; and
10. another foundation can implement the protocol without receiving authority
    from the Onym Foundation.

## 18. Justification in one sentence

> Sponsorship can provide visible status and a real, bounded path into
> endowment governance without converting generosity into ownership of the
> protocol, the foundation's beneficiaries, or its users.
