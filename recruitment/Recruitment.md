---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Recruitment Contract Boundary

**Architecture draft 0.1 — August 2026**

> Every Onym seat may publish a need for participants. Anyone may self-apply or
> offer recruiting help, but a recruiter introduces candidates—it does not own
> them, appoint them, or acquire a cut of their future work.

This document defines the technology-neutral recruitment surface used to find
people, organizations, maintainers, service operators, vendors, auditors,
contributors, grantees, sponsors, and governance candidates for any Onym seat.
It does not require a particular job board, social network, recruiter,
credential registry, identity format, evaluator, escrow, payment rail,
employment relationship, or jurisdiction.

The contract ends at a signed selection or activation outcome. Employment,
contractor, grant, provider, board, sponsor, and volunteer relationships are
governed by separate agreements and the authority of the destination seat.
This specification is not an employment contract or legal classification of a
participant.

This is proposed architecture. No current Onym repository implements the
objects, privacy controls, matching, evidence, or settlement described here.

## 1. Decision

Recruitment is a cross-cutting, permissionless service—not a gate over Onym.

- Every seat may publish a signed, finite participation opening.
- Anyone may discover an opening and apply directly without a recruiter.
- Anyone may publish a recruiting offer or propose candidates, subject to
  candidate consent and the opening's rules.
- A recruiter earns only through an accepted, budget-capped recruitment order.
- A candidate chooses whether, what, and to whom to disclose.
- The destination seat's selection authority evaluates and appoints. A
  recruiter cannot guarantee or manufacture selection.
- The recruitment contract may pay for declared milestones but creates no
  permanent claim on a selected participant's compensation, revenue, identity,
  work, or downstream relationships.
- Legal, equality, accessibility, safeguarding, labor, tax, immigration,
  background-check, and data-protection duties remain with the parties
  assigned by the declared jurisdiction and participation form.

Open recruiting does not require a requester to accept every recruiter,
candidate, or unsolicited referral. Open participation means the requirements,
selection authority, process, evidence, and direct-application route are
visible—not that every role has unlimited capacity or no qualification.

## 2. Roles

- The **requester** publishes the need, funds any recruitment order, and has
  authority to request participation for the destination seat.
- The **seat owner or operator** controls the service, project, legal entity,
  or resource to which a participant may be added.
- The **selection authority** applies the declared process and signs the
  outcome. It may be an operator, user, group, app publisher, foundation board,
  electorate, grants committee, or another named authority.
- The **recruiter** finds, informs, or introduces candidates under an accepted
  order.
- The **candidate** is a consenting person or organization considering the
  opening.
- The **evaluator** verifies only declared qualifications or conducts a
  bounded assessment.
- The **credential issuer** attests a specific fact but does not decide
  selection merely by issuing it.
- The **activation oracle** reports that the destination seat completed a
  declared milestone, such as contract signature or service activation.
- The **settlement provider or escrow**, if used, reserves a finite bounty and
  pays approved milestones.

One party may hold several roles, but every signed object identifies which
authority it exercises. A recruiter who also evaluates must disclose that
conflict. A requester who recruits directly cannot fabricate a third-party
referral fee.

## 3. Recruitment covers every seat

The destination is expressed as a versioned `seatType`, not as free-form job
marketing.

| Seat or function | Example participants | Actual selection authority |
|---|---|---|
| Identity | vault implementer, hardware integrator, derivation specialist, security reviewer | user, product owner, or provider governance |
| Recovery trustee | cloud-custody operator, trustee-app author, institutional trustee, recovery reviewer | identity holder for enrollment; trustee operator for personnel |
| UI | client author, designer, accessibility reviewer, publisher | UI project or publisher |
| Message transport | relay operator, protocol maintainer, SRE | relay owner or service organization |
| Blob transport | storage operator, CDN specialist, implementation maintainer | blob-service owner |
| Notary | contract author, deployer, auditor, governance designer | notary provider or selecting group |
| Transaction relay | operator, fee sponsor, reliability engineer | relayer owner or requester |
| Association registry | registry operator, credential issuer, dispute reviewer | registry governance |
| Application | builder, integrator, regulated provider, domain expert | application provider or group |
| Lead generation | promoter, distribution operator, view observer | campaign sponsor per funded order |
| Acquisition | landing provider, store-evidence oracle, conversion designer | campaign sponsor and app publisher |
| Sponsorship | sponsor prospect, fundraiser, compliance reviewer | foundation gift authority |
| Foundation governance | director candidate, treasurer, auditor, grants reviewer | legal board, members, or electorate |
| Protocol commons | maintainer, researcher, standards editor, security auditor | named project or foundation process |
| Recruitment | recruiter, evaluator, privacy reviewer, recruitment operator | requester or recruitment-service governance |
| Discovery | catalog operator, curator, search or privacy engineer | Discovery provider or catalog sponsor |

Recruitment cannot change the destination authority. For example:

- recruiting a Notary provider does not bind a group to that notary;
- recruiting a Sponsor Director candidate does not bypass the Sponsor Council
  election or legal appointment;
- recruiting an acquisition provider does not authorize an app-store cohort;
- recruiting a recovery trustee does not enroll it for any identity or give it
  a share;
- recruiting a registry issuer does not make its credentials trusted; and
- recruiting a relay operator does not add the relay to a user's route.

Recruiting for the Identity seat means finding identity-tool authors,
reviewers, recovery specialists, or voluntarily selected custody providers. It
never means recruiting a replacement owner for another person's identity.
Recruitment may itself recruit recruiters, but every nested opening and order
has its own finite budget and independent authority evidence; circular
self-attestation and self-triggered milestone payment are invalid.

## 4. Participation forms

Every opening declares exactly one primary `participationForm`:

- `employee`;
- `independent-contractor`;
- `service-provider`;
- `vendor`;
- `maintainer`;
- `grant-recipient`;
- `volunteer`;
- `governance-candidate`;
- `sponsor-prospect`;
- `auditor-or-reviewer`; or
- another versioned form defined by an implementation profile.

The label does not determine legal status by itself. The final agreement,
facts, applicable law, and competent authorities do. A requester must not use
`volunteer`, `contractor`, or `grant` to evade duties that attach to the real
relationship.

An opening declares compensation or expressly says unpaid. It distinguishes:

- participant compensation from recruiter compensation;
- estimated range from guaranteed amount;
- gross amount from taxes, benefits, expenses, fees, or withholding;
- equity/token/ownership, if lawfully offered, from ordinary cash payment; and
- temporary recruitment milestones from ongoing participation terms.

## 5. Direct application and recruited introduction

### 5.1 Direct application

Every public opening provides a direct application path unless law, safety, or
the nature of a private search requires a declared exception. Direct applicants
are not scored lower or charged a fee because no recruiter introduced them.

Direct application prevents the recruiter market from becoming a toll gate on
open participation. It also provides a fallback when a recruitment order
expires, runs out of budget, or enters dispute.

### 5.2 Recruited introduction

A recruiter may contact a potential candidate with a truthful summary and the
public opening. The recruiter may transmit candidate information only after
the candidate signs an introduction consent naming:

- opening and destination seat;
- requester and intended recipients;
- recruiter;
- exact information being shared;
- purpose and selection stage;
- expiration and withdrawal behavior;
- recruiter-attribution rule;
- whether contact may continue after this opening; and
- candidate's acknowledgement that the recruiter cannot promise selection.

The candidate may review or correct the introduction before submission. A
public profile, conference attendance, repository contribution, or contact
address is not blanket consent to construct or forward a recruitment dossier.

### 5.3 Duplicate introduction

The opening pins one conflict rule:

- `candidate-choice`: the candidate selects which recruiter, if any, represents
  the introduction;
- `first-consented-introduction`: the earliest still-valid candidate-signed
  consent prevails;
- `shared-credit`: named recruiters receive a declared finite split; or
- `no-introduction-credit`: the candidate already applied or had an active
  relationship with the requester.

The baseline recommends `candidate-choice`. A recruiter cannot create priority
by scraping, uploading, or naming a person before their consent.

## 6. Candidate privacy

Recruitment cannot be anonymous in every stage, but disclosure remains
progressive and purpose-scoped.

### 6.1 Progressive disclosure

1. **Discovery:** the candidate reads the public opening without identifying
   themselves.
2. **Introduction:** the candidate may use a pseudonymous Onym key and disclose
   only coarse qualification claims.
3. **Assessment:** the candidate reveals evidence required for the declared
   evaluation to named recipients.
4. **Conditional selection:** legal identity, work eligibility, payment,
   conflicts, or background information is requested only when justified by
   the participation form and law.
5. **Activation:** necessary records move into the destination agreement's
   separately disclosed retention and access policy.

The application interface must show why each field is requested, whether it is
required, who receives it, how long it is kept, and how to exercise applicable
access, correction, withdrawal, deletion, objection, or appeal rights.

Candidate-signed introduction consent is a protocol authorization to disclose
the named data to the named recipients. It is not automatically the legal
basis for every recruitment-processing purpose. Each controller separately
declares its role, applicable lawful basis, processors, cross-border transfers,
statutory duties, and the consequences of withdrawal under its jurisdiction.

### 6.2 Prohibited collection

The recruitment contract never requests:

- a BIP-39 recovery phrase, identity root key, private signing key, or wallet
  credential;
- message contents, address book, social graph, or unrelated blockchain
  addresses;
- advertising identifiers or device fingerprints;
- genetic, health, biometric, family, political, religious, union, sexual, or
  other sensitive data unless a specific lawful and necessary process is
  separately declared;
- passwords or private access to social, source-control, or financial
  accounts;
- continuous location, behavioral surveillance, or covert screen/audio/video
  capture; or
- irrelevant prior compensation or financial history.

Credentials prove narrow claims through holder consent. An evaluator may ask
for control of a public key but never for the secret itself.

### 6.3 Retention

The opening declares stage-specific retention. The baseline profile requires:

- unconsented prospects: no dossier;
- withdrawn before submission: delete recruiter working data within 30 days,
  except minimal opt-out and legal records;
- rejected application: delete or anonymize selection data within 180 days,
  unless law or an active dispute requires a stated longer period;
- talent pool: separate, optional consent with a maximum 12-month term and
  simple withdrawal;
- selected participant: transfer only necessary records to the destination
  agreement and delete duplicate recruitment copies; and
- aggregate process statistics: no re-identification or candidate ranking.

The time periods are protocol defaults, not claims that every jurisdiction
requires or permits them. An implementation must publish any lawful override.

## 7. Fair and accessible selection

An opening must publish objective, role-related criteria and distinguish:

- mandatory legal or operational requirements;
- required competencies;
- trainable or preferred competencies;
- assessment method and approximate time;
- selection stages and decision authority;
- compensation and material conditions;
- location, language, availability, and accessibility requirements; and
- appeal, accommodation, correction, and complaint contacts.

Criteria cannot encode an unlawful preference directly or through an unjustified
proxy. Recruiters may not honor an unlawful discriminatory request. The
selection authority applies the same pinned criteria consistently and records
job/seat-related reasons for decisions.

Candidates can request a reasonable alternative assessment or communication
format where applicable. A take-home exercise must be bounded, relevant, and
must not quietly extract production work. If the requester intends to use or
publish candidate work, compensation and license terms are disclosed before
the exercise.

An implementation never publishes a rejected candidate's score, explanation,
or “reputation.” Aggregate process review may examine whether a criterion
causes unjustified exclusion without exposing individuals.

## 8. Automated assistance

Automated tools may help distribute an opening, remove duplicate records,
schedule interviews, or organize candidate-supplied evidence. They do not gain
ambient authority to select people.

Before using automated ranking, recommendation, profiling, or rejection, the
requester publishes:

- tool provider and responsible deployer;
- intended purpose and whether output materially affects selection;
- input fields, derived features, and prohibited features;
- training/evaluation provenance at the level law and security permit;
- accuracy, bias, accessibility, security, and drift evaluation;
- retention and whether candidate data trains another model;
- meaningful human review and override authority;
- explanation, correction, alternative assessment, and appeal path;
- applicable high-risk-system classification and conformity duties; and
- the exact policy version pinned by the opening.

The baseline prohibits emotion inference, biometric categorization, facial or
voice personality inference, and covert analysis. A system may not infer a
protected or sensitive trait and then claim it was never collected.

Where an automated employment or self-employment selection system falls under
a high-risk legal regime, an ordinary recruitment profile is insufficient. A
separate compliant implementation profile, impact assessment, records, human
oversight, and legal authorization are required. Until then, the outcome stays
advisory and cannot automatically reject or appoint.

## 9. Contract objects

### 9.1 Recruitment Profile

```json
{
  "profileVersion": 1,
  "profileId": "onym:recruitment-profile:open-participation-v1",
  "interface": "onym-recruitment-v1",
  "privacy": "progressive-candidate-disclosure-v1",
  "introductionPolicy": "candidate-consented-v1",
  "selectionPolicy": "declared-role-related-human-accountability-v1",
  "evidenceSchema": "onym:recruitment-evidence-v1",
  "settlementSchema": "onym:recruitment-settlement-v1",
  "errorSchema": "onym:recruitment-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

### 9.2 Participation Opening

```json
{
  "version": 1,
  "openingId": "<random-id>",
  "requester": "onym:key:<requester>",
  "seatType": "message-transport",
  "seatReference": "<project-service-or-organization>",
  "requesterAuthorityEvidence": "<seat-specific-control-or-resolution>",
  "participationForm": "service-provider",
  "title": "Operate a conforming regional message relay",
  "purpose": "<content-addressed-description>",
  "requirements": {
    "mandatory": ["<objective-requirement>"],
    "preferred": ["<declared-preference>"],
    "prohibitedCriteria": ["<jurisdiction-and-policy-reference>"]
  },
  "participantTerms": {
    "compensation": "<range-or-offer-reference>",
    "duration": "<term>",
    "jurisdictions": ["<declared>"],
    "legalAgreement": "<draft-or-template-hash>"
  },
  "selection": {
    "authority": "onym:key:<selection-authority>",
    "stages": ["application", "verification", "interview", "activation"],
    "criteria": "<content-addressed-rubric>",
    "automatedMaterialDecision": false,
    "appealPolicy": "<policy-hash>"
  },
  "privacy": {
    "notice": "<content-addressed-notice>",
    "controllersAndProcessors": "<named-parties-and-roles>",
    "lawfulBasisByPurpose": "<jurisdiction-specific-policy>",
    "retention": "<stage-specific-policy>",
    "talentPoolDefault": false
  },
  "directApplication": "<endpoint-or-protocol-reference>",
  "recruitmentBudget": {
    "maximumAmount": {"minorUnits": 190000, "currency": "<declared>"},
    "escrow": "<optional-escrow>"
  },
  "opensAt": "2026-08-01T00:00:00Z",
  "closesAt": "2026-09-01T00:00:00Z",
  "signature": "<requester-signature>"
}
```

The opening's recruitment budget is separate from participant compensation.
An opening is invalid when the requester cannot show authority to recruit for
the named seat.

### 9.3 Recruiter Offer

```json
{
  "version": 1,
  "recruiterOfferId": "<random-id>",
  "recruiter": "onym:key:<recruiter>",
  "supportedSeatTypes": ["message-transport", "blob-transport", "notary"],
  "methods": ["public-outreach", "candidate-consented-introduction"],
  "jurisdictions": ["<declared>"],
  "privacyPolicy": "<content-addressed-policy>",
  "paymentModels": ["fixed-search", "qualified-introduction", "activation-milestone"],
  "payoutCoordinates": "<payment-rail-specific-reference>",
  "validUntil": "2026-09-01T00:00:00Z",
  "signature": "<recruiter-signature>"
}
```

Publishing an offer does not authorize outreach in violation of privacy,
anti-spam, employment-agency, sanctions, licensing, or platform rules.

### 9.4 Recruitment Order

```json
{
  "version": 1,
  "orderId": "<random-id>",
  "openingId": "<opening-id>",
  "requester": "onym:key:<requester>",
  "recruiter": "onym:key:<recruiter>",
  "scope": {
    "seatType": "message-transport",
    "maximumIntroductions": 10,
    "methods": ["candidate-consented-introduction"],
    "territoryOrCommunity": "<lawful-scope>"
  },
  "attributionRule": "candidate-choice",
  "milestones": [
    {"id": "qualified-introduction", "maximumOccurrences": 10, "amount": {"minorUnits": 10000, "currency": "<declared>"}},
    {"id": "seat-activation", "maximumOccurrences": 1, "amount": {"minorUnits": 90000, "currency": "<declared>"}}
  ],
  "maximumAmount": {"minorUnits": 190000, "currency": "<declared>"},
  "evidencePolicy": "<content-addressed-policy>",
  "privacyPolicy": "<content-addressed-policy>",
  "disputePolicy": "<content-addressed-policy>",
  "startsAt": "2026-08-01T00:00:00Z",
  "endsAt": "2026-09-01T00:00:00Z",
  "requesterSignature": "<signature>",
  "recruiterSignature": "<signature>"
}
```

The budget is reserved before outreach creates billable work. The order never
authorizes the recruiter to collect more candidate data than the opening and
candidate consent permit.

### 9.5 Candidate Introduction Consent

```json
{
  "version": 1,
  "consentId": "<random-id>",
  "openingId": "<opening-id>",
  "candidate": "onym:key:<candidate-pseudonymous-or-public-key>",
  "recruiter": "onym:key:<recruiter>",
  "recipients": ["onym:key:<selection-authority>"],
  "disclosures": ["<credential-or-field-reference>"],
  "purpose": "application-to-declared-opening",
  "attributionAccepted": true,
  "contactAfterOpening": false,
  "expiresAt": "2026-09-01T00:00:00Z",
  "withdrawalEndpoint": "<endpoint-or-protocol-operation>",
  "signature": "<candidate-signature>"
}
```

Withdrawal stops new processing where legally possible. It does not erase an
already completed selection, payment obligation, fraud record, or legal record
that must be retained; the controller explains each exception.

### 9.6 Application Envelope

```json
{
  "version": 1,
  "applicationId": "<random-id>",
  "openingId": "<opening-id>",
  "candidate": "onym:key:<candidate-key>",
  "introductionConsentId": "<consent-id-or-null-for-direct>",
  "claims": ["<minimum-necessary-claim>"],
  "credentials": ["<selectively-disclosed-credential>"],
  "workSamples": ["<candidate-authorized-reference>"],
  "requestedAccommodation": "<encrypted-to-authorized-recipient-or-null>",
  "dataNoticeAccepted": "<notice-hash>",
  "submittedAt": "2026-08-15T00:00:00Z",
  "signature": "<candidate-signature>"
}
```

The envelope is encrypted to declared recipients. Its public commitment may
prove timing and integrity without revealing candidate data.

### 9.7 Qualification Snapshot

```json
{
  "version": 1,
  "applicationId": "<application-id>",
  "openingId": "<opening-id>",
  "rubricVersion": "<rubric-hash>",
  "mandatoryCriteria": {
    "met": ["<criterion-id>"],
    "notMet": [],
    "unknown": ["<criterion-id>"]
  },
  "stage": "verification",
  "automatedAssistance": "none",
  "candidateVisibleExplanation": "<encrypted-explanation-reference>",
  "evaluator": "onym:key:<evaluator>",
  "evaluatedAt": "2026-08-20T00:00:00Z",
  "signature": "<evaluator-signature>"
}
```

The snapshot is private to the candidate and authorized selection participants.
Only an aggregate recruitment-process report may be public.

### 9.8 Selection Outcome

```json
{
  "version": 1,
  "outcomeId": "<random-id>",
  "openingId": "<opening-id>",
  "applicationIdHash": "<private-application-commitment>",
  "candidateKeyHash": "<candidate-key-commitment>",
  "outcome": "conditionally-selected",
  "effectiveAuthority": "onym:key:<selection-authority>",
  "conditions": ["<legal-or-seat-specific-condition>"],
  "recruiterAttribution": "<consent-and-order-hash-or-null>",
  "publicDisclosure": "aggregate-only",
  "decidedAt": "2026-08-25T00:00:00Z",
  "signature": "<selection-authority-signature>"
}
```

Permitted private outcomes include `withdrawn`, `not-selected`,
`conditionally-selected`, `selected`, and `waitlisted`. Public objects do not
name rejected candidates.

### 9.9 Activation Evidence

```json
{
  "version": 1,
  "activationId": "<random-id>",
  "openingId": "<opening-id>",
  "outcomeIdHash": "<outcome-commitment>",
  "seatType": "message-transport",
  "activationEvent": "service-contract-effective",
  "effectiveAt": "2026-09-01T00:00:00Z",
  "candidateIdentityDisclosed": false,
  "evidence": "<minimum-seat-specific-evidence>",
  "oracle": "onym:key:<activation-oracle>",
  "signature": "<oracle-signature>"
}
```

Activation evidence proves only the pinned milestone. It does not expose the
participant's compensation, application, employment file, user activity, or
future seat revenue.

### 9.10 Recruitment Settlement Statement

```json
{
  "version": 1,
  "statementId": "<nonreusable-id>",
  "orderId": "<order-id>",
  "openingId": "<opening-id>",
  "recruiter": "onym:key:<recruiter>",
  "milestones": [
    {"id": "qualified-introduction", "occurrenceId": "<consent-commitment>", "status": "approved", "minorUnits": 10000},
    {"id": "seat-activation", "occurrenceId": "<activation-commitment>", "status": "approved", "minorUnits": 90000}
  ],
  "previouslySettledMinorUnits": 0,
  "newGrossMinorUnits": 100000,
  "adjustmentsMinorUnits": 0,
  "payableMinorUnits": 100000,
  "currency": "<declared>",
  "candidateIdentityIncluded": false,
  "evidence": ["<consent-hash>", "<outcome-hash>", "<activation-hash>"],
  "requesterSignature": "<signature>",
  "recruiterSignature": "<signature-or-dispute>"
}
```

The evidence commitments prevent duplicate settlement without placing the
candidate's dossier in a public payment record.

## 10. Common contract surface

| Operation | Input | Result |
|---|---|---|
| `publishOpening` | Seat, authority, criteria, terms, privacy, budget | Signed opening |
| `publishRecruiterOffer` | Seats, methods, price, jurisdiction, privacy | Recruiter offer |
| `acceptRecruitmentOrder` | Opening, recruiter offer, finite milestones | Funded order |
| `applyDirectly` | Candidate-controlled application | Direct application receipt |
| `consentIntroduction` | Candidate, recruiter, opening, disclosures | Signed consent |
| `submitIntroduction` | Consent and encrypted application | Application receipt |
| `withdrawConsent` | Candidate and consent | Bounded withdrawal record |
| `requestAccommodation` | Candidate and protected request | Private workflow |
| `evaluateApplication` | Pinned rubric and authorized evidence | Private snapshot |
| `recordSelection` | Selection-authority decision | Private outcome commitment |
| `recordActivation` | Seat-specific milestone | Minimal signed evidence |
| `calculateRecruiterSettlement` | Order and approved milestones | Capped statement |
| `settleRecruiter` | Accepted statement | Payment reference |
| `appealDecision` | Candidate and bounded grounds | Review state |
| `disputeAttribution` | Candidate/recruiter/requester evidence | Dispute state |
| `closeOpening` | Final outcomes and retention schedule | Closed aggregate report |

There is no operation for `scrapeCandidate`, `sellCandidate`,
`requestIdentitySecret`, `guaranteeAppointment`, `publishRejectedScore`,
`inheritFutureRevenue`, or `bypassSeatAuthority`.

## 11. Recruiter payment models

Recruiters define their offers; requesters choose which to accept. Supported
models include:

- **fixed search:** a fixed amount for a bounded, documented search process;
- **outreach milestone:** payment for approved public outreach deliverables,
  not raw unsolicited contact volume;
- **qualified introduction:** payment when a candidate-consented application
  meets pinned objective requirements;
- **assessment support:** fixed payment for a declared evaluation service,
  with conflicts and decision authority separated;
- **selection milestone:** payment after the selection authority signs an
  accepted outcome;
- **activation milestone:** payment after a contract, provider, board, grant,
  or other seat-specific activation becomes effective;
- **bounded retention milestone:** payment after a short declared service
  period, using only a yes/no activation status rather than monitoring the
  participant; or
- **hybrid:** a capped combination of the above.

The baseline prohibits:

- candidate application or introduction fees;
- payment per scraped profile, message, sensitive trait, or rejected person;
- undisclosed percentage of participant compensation;
- perpetual percentage of participant or seat revenue;
- payment conditioned on hiding compensation or legal status;
- different recruiter payment based on a protected characteristic; and
- retroactive claims where no accepted order and candidate consent existed.

A jurisdiction-specific professional recruiter may lawfully use another fee
model only through an explicit implementation profile and agreement. It is not
silently imported into the portable baseline.

### 11.1 Calculation

```text
approvedGross = sum(amount(m) for each approved, previously-unsettled milestone)
adjustedGross = max(0, approvedGross + signedAdjustments)
payable       = min(adjustedGross, remainingOrderBudget)
```

Each milestone occurrence binds its ID, candidate-consent commitment, and
activation event and settles at most once. Occurrence limits and the total
order cap both apply. Payment disputes disclose the minimum evidence necessary
and do not make the candidate a party to recruiter-requester collection unless
the candidate independently agreed.

## 12. Obligations

### 12.1 Requester and seat authority

They must:

1. have authority to publish the opening;
2. accurately describe the seat, relationship, compensation, risks, and
   selection process;
3. reserve finite recruitment compensation before accepting an order;
4. preserve a direct-application route where required by the profile;
5. use consistent, role-related criteria and lawful accommodations;
6. disclose every recipient and automated material decision;
7. separate recruitment data from identity, messages, user routes, and
   unrelated participant records;
8. sign truthful outcomes and activation evidence;
9. pay valid recruiter milestones without demanding extra candidate data; and
10. delete or transfer records under the pinned retention policy.

### 12.2 Recruiter

A recruiter must:

1. obtain an accepted order before claiming compensation;
2. describe the opening, requester, compensation, and uncertainty truthfully;
3. obtain candidate consent before transmitting identifying information;
4. collect only minimum data necessary for the current stage;
5. honor opt-out, correction, withdrawal, and contact preferences;
6. never buy, scrape, enrich, or resell unauthorized candidate dossiers;
7. never request secrets or misrepresent control of an Onym seat;
8. reject unlawful discriminatory instructions;
9. disclose conflicts, subcontractors, and assessment automation; and
10. make no claim on the participant after the finite order milestones.

### 12.3 Candidate

A candidate must:

1. control or be authorized to represent the submitted identity/organization;
2. provide materially truthful claims and authorized credentials;
3. not submit another person's data or work without permission;
4. preserve assessment confidentiality where lawfully agreed;
5. disclose conflicts required by the destination seat; and
6. separately accept the final participation agreement before activation.

Candidates do not waive privacy, equality, labor, consumer, whistleblower, or
other applicable rights merely by using this protocol.

### 12.4 Evaluator and activation oracle

They must:

- operate only under the pinned rubric or milestone definition;
- access only authorized evidence;
- distinguish verified fact, assessment, and judgment;
- disclose automation and conflicts;
- provide candidate-visible correction or appeal where required;
- never publish an individual outcome; and
- sign append-only corrections rather than overwrite history.

## 13. Abuse and disputes

### 13.1 Fake openings

An attacker may publish a prestigious-looking role to harvest identities,
credentials, work samples, or secrets. Opening discovery therefore verifies
requester authority, seat reference, domain/control evidence, data notice,
compensation, and complaint channel before curation. Direct signed openings may
still exist outside a directory, but signatures prove only publisher identity,
not honesty.

### 13.2 Spam and scraping

The protocol does not reward message volume or profile collection. Public
outreach uses declared channels and rate limits. Candidate opt-out is portable
to the recruiter and its disclosed subcontractors. Unconsented “introduction”
objects are invalid and nonbillable.

### 13.3 Credential and work-sample fraud

Credentials remain scoped to their issuer and status. Work samples bind the
candidate's claim and license, not a universal proof of authorship. Material
fraud may end the application and enter a private dispute record; it does not
justify a public blacklist.

### 13.4 Duplicate and collusive referrals

Candidate-signed attribution, order IDs, deadlines, control-group disclosure,
and idempotent milestones prevent most duplicate claims. Candidate, requester,
and recruiter collusion remains possible; caps, audits, activation evidence,
and separation of selection and settlement reduce its impact.

### 13.5 Misclassification and extracted work

The participation-form label cannot waive employment or contractor law. A
requester may not rotate “volunteers,” demand unpaid production exercises, or
use grants to avoid an ongoing work relationship. Complaints pause recruitment
settlement when the alleged milestone itself is unlawful or fabricated.

## 14. Errors and state

| Error | Origin | Required response |
|---|---|---|
| `requester_authority_missing` | Opening | Do not publish as verified |
| `opening_expired` | Opening | Reject new applications/orders |
| `recruitment_budget_unavailable` | Requester/escrow | Do not activate order |
| `participation_terms_missing` | Opening | Reject until disclosed |
| `direct_application_unavailable` | Requester | Mark nonconforming unless exception applies |
| `candidate_consent_missing` | Recruiter | Reject introduction and payment |
| `candidate_consent_withdrawn` | Candidate | Stop new processing and apply retention rule |
| `duplicate_introduction` | Multiple recruiters | Apply pinned candidate-centered rule |
| `data_scope_exceeded` | Any processor | Stop processing; notify and remediate |
| `secret_requested` | Any party | Abort and flag security incident |
| `criteria_changed` | Requester | Version or reopen; do not alter active evaluation silently |
| `unlawful_criterion` | Opening/evaluator | Suspend and obtain legal review |
| `accommodation_failed` | Selection process | Pause affected assessment and remedy |
| `automation_undisclosed` | Evaluator/requester | Suspend automated outcome |
| `credential_unverifiable` | Issuer/evaluator | Mark unknown, not false |
| `selection_authority_mismatch` | Outcome | Reject outcome |
| `activation_unverified` | Seat/oracle | Keep milestone pending |
| `settlement_duplicate` | Settlement | Reject replay |
| `attribution_disputed` | Candidate/recruiter | Freeze disputed milestone only |
| `retention_expired` | Controller | Delete or lawfully anonymize |

Opening state:

```text
draft -> published -> accepting -> evaluating -> selection_pending
  -> filled | unfilled | cancelled -> retention_cleanup -> closed
```

Application state:

```text
discovery -> consented | direct -> submitted -> evaluating
  -> withdrawn | not_selected | waitlisted | conditional
  -> selected -> activated
```

Recruitment order state:

```text
proposed -> accepted_and_funded -> active -> milestone_pending
  -> approved | disputed -> settled -> closed
```

## 15. Security, privacy, and economic invariants

1. **Direct participation remains possible.** A recruiter is never the only
   gate to a public opening.
2. **The candidate controls introduction.** Naming a person is not referral
   ownership.
3. **Recruitment does not appoint.** Only the destination seat's authority can
   select and activate.
4. **No identity secrets.** Recruitment never receives root or operational
   private keys.
5. **Disclosure is progressive.** Each stage receives only necessary,
   consented data.
6. **Criteria are declared and role-related.** Hidden or unlawful steering is
   nonconforming.
7. **Human accountability remains named.** Automation cannot become an
   unappealable anonymous authority.
8. **Payment is finite.** Every order has milestones, a maximum amount, a
   window, and reserved budget.
9. **No future ownership.** Recruiters receive no perpetual cut, user data, or
   control over a selected participant.
10. **Candidate and recruiter compensation are separate.** One cannot be
    silently deducted from the other.
11. **Private outcomes stay private.** Rejected people do not become public
    reputation objects.
12. **Settlement is idempotent.** Each valid milestone is paid at most once.
13. **Legal status is not self-declared.** Protocol labels do not override the
    real relationship or applicable law.
14. **Every seat stays sovereign.** Recruitment cannot bypass conformance,
    group choice, publisher authority, foundation bylaws, or legal appointment.

## 16. Aggregate accountability

After an opening closes, the requester may publish a privacy-thresholded report
containing:

- outreach channels and recruiter orders;
- consented introductions and direct applications;
- stage counts, withdrawals, time-to-decision, and filled/unfilled status;
- accommodation fulfillment and appeal counts;
- recruiter milestones and total settlement;
- aggregate criteria outcomes and documented process changes; and
- retention cleanup completion.

Small cells are suppressed and overlapping reports cannot be differenced to
identify candidates. Demographic fairness analysis, when lawful and necessary,
uses a separately governed sensitive-data process and never exposes traits to
ordinary evaluators or recruiter payment.

Recruiter performance reports distinguish search effort, consented
introductions, qualified applications, selections, activations, retention
milestones, candidate complaints, and data incidents. A single opaque score is
insufficient for high-impact decisions or directory exclusion.

## 17. Versioning and conformance

- `RecruitmentProfile` changes when consent, privacy, selection, evidence,
  payment, error, or public-report meaning changes.
- A seat implementation profile changes when destination authority,
  activation evidence, legal form, qualifications, or settlement changes.
- Openings and orders pin exact profile, rubric, data notice, compensation,
  attribution, automation, retention, and dispute versions.
- A policy change cannot retroactively rewrite consent, candidate attribution,
  selection, activation, or payment.
- Corrections are signed append-only objects that preserve who changed what
  and why without publishing candidate records.
- Conformance fixtures cover canonical objects, signatures, encryption,
  consent withdrawal, direct application, duplicate introduction, rubric
  versioning, secret rejection, automation disclosure, activation authority,
  milestone caps, duplicate settlement, retention deletion, and appeals.

## 18. Future implementation profiles

Concrete profiles may define:

- public open-source maintainer recruitment;
- Nostr or another social-channel recruiting outreach;
- relay, blob, notary, or registry operator onboarding;
- application-builder and regulated-provider selection;
- foundation staff, vendor, auditor, or grants recruitment;
- sponsor prospecting under gift-acceptance rules;
- Sponsor Council candidate discovery without bypassing elections; or
- privacy-reviewed employment recruitment in a declared jurisdiction.

Each profile maps its real selection authority and activation event. A social
post view, résumé submission, interview, signed employment contract, provider
manifest, board election, and active service are different events and cannot
be relabelled for payment convenience.

## 19. Acceptance criteria

The recruitment boundary is successfully separated when:

1. every Onym seat can publish a versioned participation opening;
2. candidates can inspect openings and self-apply without a recruiter toll;
3. anyone can offer recruiting and earn under an accepted finite order;
4. no identifying introduction occurs without candidate consent;
5. no recruiter can reserve, sell, or own a candidate by naming them first;
6. selection and activation remain with the destination seat's actual
   authority;
7. candidate data is encrypted, progressively disclosed, corrected, and
   deleted under a visible policy;
8. criteria, compensation, automation, accommodations, and appeal are
   declared before evaluation;
9. recruiter milestones can settle without publishing candidate identity;
10. rejected candidates do not receive a public negative record;
11. no recruitment relationship creates a future royalty or protocol power;
    and
12. new seat and jurisdiction profiles can implement the interface without
    rewriting the abstract contract.

## 20. Official references

- European Union, [General Data Protection Regulation, Article 5](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679)
- European Union, [Artificial Intelligence Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32024R1689)
- UK Information Commissioner's Office,
  [Employment practices and data protection: recruitment and selection](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/recruitment-and-selection)
- US Equal Employment Opportunity Commission,
  [Recruiting, hiring, or promoting employees](https://www.eeoc.gov/employers/small-business/3-im-recruiting-hiring-or-promoting-employees)
- US Equal Employment Opportunity Commission,
  [Coverage of employment agencies](https://www.eeoc.gov/employers/coverage-employment-agencies)

These sources explain some privacy, equality, agency, and automated-selection
risks; they do not establish the law for every Onym opening. Each employment or
professional-recruitment implementation must declare and review its actual
jurisdictions.

## 21. Justification in one sentence

> Onym can let anyone help fill every open seat while candidates control their
> information, destination authorities keep appointment power, and recruiter
> rewards end at transparent, finite milestones.
