---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Charity Contract Boundary

**Architecture draft 0.1 — August 2026**

> A charity system decides who is eligible, where funds go, and which rules
> apply. A user interface carries private intent and asks for scoped
> authorization. A notary makes narrow claims verifiable. None of them proves
> that an organization is good merely by calling it verified.

This document defines the technology-neutral boundary through which a user
application can discover a charitable program, verify its declared trust
path, donate, receive evidence, or privately claim aid. It does not require
Onym Messenger, a blockchain, Stellar, Soroban, a token, a particular
zero-knowledge system, or a particular legal form of nonprofit organization.

A conforming implementation may use a public ledger, regulated payment rail,
bank transfer, threshold-operated service, verifiable log, or a combination.
The Onym Messenger user-interface profile is specified separately in
[UI-Charity.md](UI-Charity.md). A Stellar/Soroban financial or notary mapping,
if selected, is a separate implementation profile rather than part of this
abstract contract.

The July 2026 draft memorandum between Onym and a proposed humanitarian
provider informed the division of responsibility in this document. The
memorandum is not itself a protocol specification, deployment manifest, proof
of production readiness, or substitute for a binding agreement.

## 1. Decision

Charity is an open application seat composed of separately replaceable roles.

- The **user application** presents canonical intent, holds local
  capabilities, transports private messages, and verifies receipts.
- The **charity operator** defines a program, performs operational work,
  allocates aid, handles complaints, and makes the claims attached to a
  campaign.
- An **organization credential issuer** checks an organization under a named
  policy and issues or revokes a signed credential.
- An **eligibility issuer** attests that a beneficiary satisfies a named aid
  policy, preferably without publishing the beneficiary's identity.
- A **financial provider** quotes, submits, settles, refunds, or disburses
  funds under its own legal and operational authority.
- A **notary** records narrow public state and produces verifiable evidence.
- An **auditor or report issuer** makes signed claims about receipts,
  allocation, expenditure, or impact.
- A **Discovery provider or association registry** helps resolve human-readable
  names to signed organization records under its own policy. Neither is
  automatically a credential issuer.

Anyone may implement or operate one of these roles and publish an offer. Open
participation means permissionless authorship and entry, not automatic trust,
listing, payment, regulatory approval, or access to user secrets. A user,
community, or application chooses which issuers, operators, deployments, and
payment rails it accepts.

One party may occupy several roles, but the signed records must still identify
which authority it exercises. The application publisher is not implicitly the
charity operator, credential issuer, custodian, auditor, or regulator. The
charity operator is not implicitly authorized to administer the messenger or
extract its user graph.

## 2. Domain boundary

### 2.1 User-application domain

The user application is responsible for:

1. showing who made each material claim and under which policy;
2. resolving and verifying the selected charity profile and deployment;
3. presenting the asset, network, destination, amount, fees, privacy effect,
   refund rule, and finality rule before authorization;
4. requesting the smallest identity capability needed for the operation;
5. protecting local keys, private messages, proofs, and receipts;
6. submitting operations only to providers the user selected; and
7. independently checking returned evidence where the profile permits it.

The application must not silently decide that a nonprofit is trustworthy,
change the recipient, sign hidden operation bytes, retain compliance
documents without a declared purpose, or claim that a cryptographically valid
receipt proves charitable impact.

### 2.2 Charity-operations domain

The charity operator and its selected providers are responsible for:

1. organization onboarding and verification policy;
2. campaign truthfulness, beneficiaries, allocation, and delivery;
3. legal status, fundraising authority, sanctions and financial-crime controls;
4. required donor or beneficiary due diligence;
5. safeguarding, custody, accounting, tax receipts, refunds, and disputes;
6. regulator, bank, grantor, and payment-provider relationships; and
7. the accuracy and limits of expenditure and impact reports.

These responsibilities do not move to the UI merely because the UI renders a
campaign or invokes a contract.

### 2.3 Shared contract surface

The shared surface contains only the versioned objects and operations required
to join the domains:

- profiles and deployment bindings;
- organization credentials and trust policy;
- campaign records and signed updates;
- donation quotes, intents, outcomes, refunds, and receipts;
- beneficiary eligibility policies, presentations, claims, and outcomes;
- fund-flow and audit commitments;
- privacy declarations and incident contacts; and
- canonical errors, state transitions, and conformance evidence.

Implementation-specific transaction objects, wallet handles, RPC clients,
database models, messenger screens, and legal case files remain behind their
respective adapters.

## 3. Trust semantics

### 3.1 “Verified” is always qualified

`verified organization` is not a universal state. It means:

> issuer **I** attested at time **T** that subject **S** satisfied policy
> **P**, version **V**, for scope **C**, until expiry or revocation.

The UI must show or make available the issuer, policy, scope, validity period,
and current revocation result. It must not collapse these into an unqualified
Onym checkmark. A credential proves that an issuer signed claims; it does not
prove that the issuer is competent, honest, current, or trusted by the user.

A `TrustPolicy` pins accepted issuers, credential types, assurance levels,
revocation methods, freshness limits, jurisdiction constraints, and any
required combinations. Trust policy is explicit and replaceable. Issuer trust
does not become transitive merely because one issuer refers to another.

### 3.2 Cryptographic evidence has narrow meaning

- A signature proves control of the signing capability over exact bytes.
- A credential proves an issuer made the encoded claim.
- A zero-knowledge proof proves its declared predicate and public inputs.
- Notary evidence proves the declared state under the selected notary profile.
- A settlement receipt proves the declared financial transition under the
  selected financial profile.
- An audit or impact record proves its author made the report.

None alone proves legal compliance, absence of fraud, delivery of aid, fair
allocation, beneficiary wellbeing, or the truth of off-system facts.

### 3.3 No hidden trust inheritance

The identities of the campaign operator, financial recipient, credential
issuer, financial provider, notary, auditor, and UI publisher must be
separately inspectable. A brand, app-store listing, domain name, registry name,
or transport route does not bind these roles unless a signed profile says so.

## 4. Logical topology

```text
┌──────────────────────── user-controlled application ────────────────────────┐
│ campaign UI · local identity capability · private messages · local receipt  │
└───────────────┬────────────────┬──────────────────┬─────────────────────────┘
                │                │                  │
       resolve claims       move value       prove/observe state
                │                │                  │
                v                v                  v
       ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
       │ issuer/registry│ │ financial rail │ │ notary / log   │
       │ attest + revoke│ │ quote + settle │ │ commit + prove │
       └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  v
                    ┌────────────────────────┐
                    │ charity operator       │
                    │ campaign · allocation  │
                    │ compliance · disputes  │
                    └────────────────────────┘
```

The topology is logical. A deployment may combine several boxes, but doing so
does not expand their authority. The UI treats every remote response as
untrusted until it validates the evidence required by the pinned profiles.

## 5. Profiles and bindings

### 5.1 Charity Profile

A `CharityProfile` defines portable semantics without selecting an operator or
backend:

```json
{
  "profileVersion": 1,
  "profileId": "onym:charity-profile:donation-aid-v1",
  "interface": "onym-charity-v1",
  "operations": [
    "resolve-campaign",
    "quote-donation",
    "prepare-donation",
    "submit-donation",
    "read-donation",
    "request-refund",
    "present-eligibility",
    "claim-aid",
    "read-aid-claim",
    "read-fund-flow"
  ],
  "schemas": "<content-addressed-schema-set>",
  "trustSemantics": "<content-addressed-trust-semantics>",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "metricProfile": "<content-addressed-volume-profile>",
  "errorSchema": "onym-charity-errors-v1",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes object meaning, canonicalization, authorization coverage,
state transitions, evidence, errors, and privacy requirements. It does not fix
a currency, network, smart-contract language, UI, operator, or price.

### 5.2 Charity Deployment

A `CharityDeployment` binds the abstract profile to concrete providers:

```json
{
  "deploymentVersion": 1,
  "deploymentId": "onym:charity-deployment:<id>",
  "charityProfile": {
    "id": "onym:charity-profile:donation-aid-v1",
    "digest": "<profile-digest>"
  },
  "operator": "onym:key:<charity-operator>",
  "organizationCredentialPolicy": "<trust-policy-id-and-digest>",
  "campaignRegistry": "<adapter-profile-deployment-and-digest>",
  "financialBindings": ["<financial-profile-deployment-and-digest>"],
  "notaryBindings": ["<notary-profile-deployment-and-digest>"],
  "eligibilityBindings": ["<proof-profile-issuer-policy-and-digests>"],
  "auditBindings": ["<audit-profile-issuer-policy-and-digests>"],
  "privacyProfile": "<privacy-profile-id-and-digest>",
  "incidentContact": "<authenticated-contact>",
  "validFrom": "2026-08-01T00:00:00Z",
  "validUntil": "2027-08-01T00:00:00Z",
  "signature": "<operator-signature>"
}
```

The application verifies the deployment signature, profile hash, provider
bindings, validity, status, and replacement rules. A deployment update cannot
silently change a destination, accepted issuer, proof system, fee schedule, or
privacy disclosure for an already prepared operation.

### 5.3 Delivery and ownership declaration

How software is funded or owned does not change runtime semantics. A project
may nevertheless publish a `DeliveryOwnershipProfile` declaring:

- the owner and license of each pre-existing component;
- the license of interface specifications and implementation code;
- who develops, deploys, maintains, and responds to incidents for each layer;
- whether a joint entity controls a deployment;
- whether anyone may deploy a public-domain implementation; and
- grant applicant, deliverable, and duplicate-funding disclosure rules.

Layer-separated ownership, a jointly owned deployment entity, and a CC0/public
commons implementation can all conform to the same charity boundary. Funding
or corporate documents must not be smuggled into protocol authority.

## 6. Boundary objects

All signed objects use deterministic canonicalization, an explicit schema and
version, a domain-separation tag, creation and expiry times where relevant,
and a stable digest. Unknown critical fields cause rejection.

Every authorization-critical reference contains both the stable object ID and
the digest of the exact canonical object. An ID or `(ID, revision)` tuple is a
lookup and ordering hint, not a security binding: an operator could otherwise
sign two different objects at the same revision. A resolver that observes two
valid digests for the same object ID and revision reports authenticated
equivocation and blocks new value-moving or eligibility operations until the
selected profile resolves it.

### 6.1 Trust Policy

```json
{
  "trustPolicyVersion": 1,
  "trustPolicyId": "<stable-id>",
  "acceptedCredentialTypes": ["charitable-organization-v1"],
  "acceptedIssuers": ["onym:key:<issuer-id>"],
  "minimumAssurance": "<declared-level>",
  "jurisdictions": ["<declared-scope>"],
  "maximumCredentialAge": "P30D",
  "revocationFreshness": "PT24H",
  "combinationRule": "any-one",
  "policyDocument": "<content-addressed-policy>",
  "signature": "<policy-author-signature>"
}
```

The policy does not contain donor or beneficiary identifiers.

### 6.2 Organization Credential

```json
{
  "credentialVersion": 1,
  "credentialId": "<opaque-id>",
  "credentialType": "charitable-organization-v1",
  "issuer": "onym:key:<issuer-id>",
  "subject": "onym:key:<organization-id>",
  "claims": {
    "legalEntityReference": "<issuer-scoped-reference>",
    "authorizedScopes": ["fundraise:<jurisdiction-or-program>"],
    "assurance": "<declared-level>"
  },
  "policyId": "<verification-policy-id-and-version>",
  "issuedAt": "<timestamp>",
  "expiresAt": "<timestamp>",
  "status": "<revocation-status-reference>",
  "signature": "<issuer-signature>"
}
```

The abstract boundary does not mandate W3C Verifiable Credentials, but a
profile may map this object to that data model. Private source documents stay
with the responsible issuer unless a separate, consented disclosure is
required.

### 6.3 Charity Campaign

```json
{
  "campaignVersion": 1,
  "campaignId": "<stable-random-id>",
  "charityDeployment": "<deployment-id-and-digest>",
  "operator": "onym:key:<charity-operator>",
  "organization": "onym:key:<organization-id>",
  "organizationCredential": "<credential-id-and-digest>",
  "title": "<human-readable-title>",
  "purpose": "<content-addressed-description>",
  "jurisdictions": ["<declared-scope>"],
  "startsAt": "<timestamp>",
  "endsAt": "<timestamp>",
  "acceptedAssets": ["<asset-and-network-id>"],
  "financialDestinations": ["<signed-destination-binding>"],
  "allocationPolicy": "<content-addressed-policy>",
  "refundPolicy": "<content-addressed-policy>",
  "reportingPolicy": "<content-addressed-policy>",
  "beneficiaryPrivacy": "<content-addressed-disclosure-profile>",
  "revision": 1,
  "status": "active",
  "signature": "<operator-signature>"
}
```

Material updates create a new revision. A donation intent pins the exact
campaign revision, credential digest, destination, and provider bindings it
accepted.

### 6.4 Donation Quote

```json
{
  "quoteVersion": 1,
  "quoteId": "<provider-unique-id>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "campaignDigest": "<campaign-digest>",
  "charityDeploymentDigest": "<deployment-digest>",
  "financialProvider": "onym:key:<provider-id>",
  "financialBindingDigest": "<financial-binding-digest>",
  "asset": "<asset-and-network-id>",
  "grossAmount": "100.00",
  "fees": [
    {
      "kind": "rail",
      "amount": "1.00",
      "rate": "0.010000",
      "basis": "gross-amount",
      "recipient": "onym:key:<declared-party>"
    }
  ],
  "netAmount": "99.00",
  "destination": "<canonical-destination>",
  "interfaceChannelId": "<optional-non-user-specific-channel>",
  "finalityRule": "<profile-defined-rule>",
  "refundRule": "<policy-id-and-digest>",
  "expiresAt": "<timestamp>",
  "signature": "<financial-provider-signature>"
}
```

`grossAmount = netAmount + sum(fees)` under the profile's fixed precision and
rounding rule. Fees never appear only after authorization.

### 6.5 Donation Intent

```json
{
  "intentVersion": 1,
  "intentId": "<user-generated-random-id>",
  "quoteId": "<quote-id-and-digest>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "campaignDigest": "<campaign-digest>",
  "charityDeploymentDigest": "<deployment-digest>",
  "trustPolicyDigest": "<user-accepted-trust-policy-digest>",
  "organizationCredentialDigest": "<credential-digest>",
  "financialBindingDigest": "<financial-binding-digest>",
  "privacyProfileDigest": "<accepted-disclosure-profile-digest>",
  "grossAmount": "100.00",
  "asset": "<asset-and-network-id>",
  "destination": "<canonical-destination>",
  "donorDisclosure": "private-to-extent-supported",
  "interfaceChannelId": "<optional-non-user-specific-channel>",
  "expiresAt": "<timestamp>",
  "authorization": "<scoped-user-authorization>"
}
```

Authorization covers every state-changing and value-moving field and every
record digest that gives those fields meaning. Revision numbers remain visible
for ordering and UX, but they never substitute for the corresponding digest.
An
`interfaceChannelId`, when present, identifies a shared interface profile or
campaign channel—not a person, device, install, contact, or persistent
referral. It is weak source evidence and must never control authorization,
eligibility, price, or service.

### 6.6 Donation Receipt

```json
{
  "receiptVersion": 1,
  "receiptId": "<stable-id>",
  "intentId": "<intent-id>",
  "intentDigest": "<digest-of-canonical-authorized-intent>",
  "quoteId": "<quote-id-and-digest>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "campaignDigest": "<campaign-digest>",
  "charityDeploymentDigest": "<deployment-digest>",
  "trustPolicyDigest": "<user-accepted-trust-policy-digest>",
  "organization": "onym:key:<organization-id>",
  "organizationCredentialDigest": "<credential-digest>",
  "financialBindingDigest": "<financial-binding-digest>",
  "privacyProfileDigest": "<accepted-disclosure-profile-digest>",
  "asset": "<asset-and-network-id>",
  "grossAmount": "100.00",
  "fees": [
    {
      "kind": "rail",
      "amount": "1.00",
      "rate": "0.010000",
      "basis": "gross-amount",
      "recipient": "onym:key:<declared-party>"
    }
  ],
  "netAmount": "99.00",
  "interfaceChannelId": "<optional-non-user-specific-channel>",
  "status": "finalized",
  "finalizedAt": "<timestamp>",
  "financialEvidence": "<profile-defined-settlement-evidence>",
  "notaryEvidence": "<optional-profile-defined-evidence>",
  "publicReference": "<optional-non-PII-reference>",
  "signature": "<receipt-issuer-signature>"
}
```

The receipt identifies its issuer. A private tax receipt or regulated payment
record may require additional personal data and must use a separate, explicit
flow with its own controller, purpose, retention, and disclosure terms.
`intentDigest` binds the receipt to the exact canonical intent bytes the donor
authorized; matching a human-readable `intentId` alone is insufficient.

When `interfaceChannelId` is present, the quote proposes it, the donation
intent pins the quote and repeats the same value, and the receipt copies that
value. A mismatch invalidates channel-based measurement. Omission from any of
the three objects means the donation is not attributable to an interface
channel under this profile.

### 6.7 Eligibility Policy and Presentation

An `EligibilityPolicy` defines a predicate, trusted issuers, validity window,
proof system, public inputs, nullifier scope, and disclosure profile. An
`EligibilityPresentation` proves the requested predicate without publishing
the underlying credential when the selected proof system supports it.

```json
{
  "presentationVersion": 1,
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "campaignDigest": "<campaign-digest>",
  "charityDeploymentDigest": "<deployment-digest>",
  "policy": "<eligibility-policy-id-version-and-digest>",
  "proofProfileDigest": "<proof-profile-digest>",
  "privacyProfileDigest": "<accepted-disclosure-profile-digest>",
  "epoch": "<policy-defined-claim-window>",
  "publicInputs": "<canonical-policy-defined-inputs>",
  "nullifier": "<campaign-and-epoch-scoped-nullifier>",
  "proof": "<proof-bytes>",
  "expiresAt": "<timestamp>"
}
```

The presentation binds the exact campaign, deployment, eligibility policy,
proof profile, and privacy profile digests so it cannot be reinterpreted under
a different signed object that reuses an ID or revision. Its nullifier remains
stable across revisions within the same campaign and epoch to prevent a policy
update from enabling a second claim. It must not become a cross-campaign or
permanent beneficiary identifier. If a proof profile cannot avoid revealing
identity, the UI must state that before submission and require explicit user
choice.

### 6.8 Aid Claim and Disbursement Receipt

An `AidClaim` pins the exact campaign revision, eligibility policy,
presentation digest, requested entitlement, private delivery binding, expiry,
and claimant authorization:

```json
{
  "claimVersion": 1,
  "claimId": "<claimant-generated-random-id>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "campaignDigest": "<campaign-digest>",
  "charityDeploymentDigest": "<deployment-digest>",
  "eligibilityPolicy": "<policy-id-version-and-digest>",
  "proofProfileDigest": "<proof-profile-digest>",
  "privacyProfileDigest": "<accepted-disclosure-profile-digest>",
  "presentationDigest": "<digest-of-eligibility-presentation>",
  "nullifier": "<campaign-and-epoch-scoped-nullifier>",
  "entitlement": {
    "class": "<policy-defined-entitlement-class>",
    "amount": "<optional-canonical-amount>",
    "asset": "<optional-asset-and-network-id>"
  },
  "deliveryBinding": {
    "bindingVersion": 1,
    "provider": "onym:key:<delivery-provider>",
    "railProfileId": "<financial-or-physical-delivery-profile>",
    "recipientCommitment": "<randomized-claim-scoped-recipient-commitment>",
    "encryptedRecipient": "<recipient-details-sealed-to-provider>",
    "disclosures": ["<declared-field-or-category>"],
    "expiresAt": "<timestamp>"
  },
  "expiresAt": "<timestamp>",
  "authorization": "<scoped-claimant-authorization>"
}
```

The claimant authorization covers the canonical digest of every field,
including the delivery binding. `recipientCommitment` is randomized and scoped
to this claim so repeated delivery coordinates do not intentionally create a
public correlation key. `encryptedRecipient` contains only the payout address,
pickup capability, shipping coordinate, or other recipient data required by
the selected rail. It is sealed to the named delivery provider and is never
copied into public notary state. Public state may contain only the claim
digest, scoped nullifier, and recipient commitment required by the profile.
The binding must reveal no more than the chosen financial or physical delivery
rail requires.

An `AidDisbursementReceipt` records the exact claim, outcome, entitlement,
fees, finality, and evidence without repeating private delivery details:

```json
{
  "disbursementReceiptVersion": 1,
  "receiptId": "<stable-id>",
  "claimId": "<claim-id>",
  "claimDigest": "<digest-of-canonical-authorized-claim>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "campaignDigest": "<campaign-digest>",
  "charityDeploymentDigest": "<deployment-digest>",
  "eligibilityPolicy": "<policy-id-version-and-digest>",
  "proofProfileDigest": "<proof-profile-digest>",
  "privacyProfileDigest": "<accepted-disclosure-profile-digest>",
  "presentationDigest": "<digest-of-eligibility-presentation>",
  "publicClaimReference": "<scoped-nullifier-or-unlinked-commitment>",
  "entitlement": {
    "class": "<policy-defined-entitlement-class>",
    "amount": "<optional-canonical-amount>",
    "asset": "<optional-asset-and-network-id>"
  },
  "fees": [
    {
      "kind": "delivery",
      "amount": "<canonical-amount>",
      "rate": "<canonical-rate-or-zero>",
      "basis": "<declared-basis>",
      "recipient": "onym:key:<declared-party>"
    }
  ],
  "deliveryBindingDigest": "<digest-of-private-delivery-binding>",
  "status": "disbursed",
  "finalizedAt": "<timestamp>",
  "deliveryEvidence": "<profile-defined-private-or-committed-evidence>",
  "notaryEvidence": "<optional-profile-defined-public-evidence>",
  "issuer": "onym:key:<receipt-issuer>",
  "signature": "<receipt-issuer-signature>"
}
```

The receipt declares whether `deliveryEvidence` is private to the claimant and
provider or safely publishable as a commitment. Public evidence uses the
scoped nullifier or an unlinked commitment—not the beneficiary's name,
contact, messenger identity, government identifier, private payout address,
pickup secret, or physical delivery location.

### 6.9 Aggregate Fund-Flow Report

```json
{
  "reportVersion": 1,
  "reportId": "<stable-id>",
  "campaignId": "<campaign-id>",
  "campaignRecordSetCommitment": "<campaign-revision-and-digest-set>",
  "period": {"from": "<timestamp>", "to": "<timestamp>"},
  "measurement": "net-finalized",
  "asset": "<asset-and-network-id>",
  "finalizedGross": "<amount>",
  "finalizedNet": "<amount>",
  "refundsAndReversals": "<amount>",
  "eligibleDonationVolume": "<amount>",
  "operationCount": "<optional-aggregate-count>",
  "sourceCommitment": "<verifiable-record-set-commitment>",
  "evidence": "<notary-financial-or-audit-evidence>",
  "issuer": "onym:key:<report-issuer>",
  "signature": "<report-issuer-signature>"
}
```

The report never contains donor or beneficiary identities. Counts smaller
than a profile-defined privacy threshold should be suppressed or bucketed.

## 7. Operations

The canonical wire operation names are the kebab-case values in
`CharityProfile.operations` and the table below. Camel-case names in local SDK
or UI ports are non-wire aliases. In particular, a local `watchDonation`
reconciliation loop invokes `read-donation`, and `watchAidClaim` invokes
`read-aid-claim`; watching does not define additional wire operations.

| Canonical wire operation | Caller intent | Required checks | Success evidence |
|---|---|---|---|
| `resolve-campaign` | inspect a campaign | profile and deployment digests, signatures, credential policy, status, freshness, equivocation | verified view plus explicit warnings |
| `quote-donation` | request current terms | campaign revision and digest, deployment and provider-binding digests, asset, destination, arithmetic, expiry | signed quote |
| `prepare-donation` | freeze exact operation | quote, privacy disclosure, authorization schema | canonical intent bytes/digest |
| `submit-donation` | move declared value | local authorization, current quote, destination, idempotency | pending outcome/provider reference |
| `read-donation` | reconcile state | evidence and finality rule | finalized, failed, refunded, or still pending |
| `request-refund` | invoke declared policy | requester authority, receipt, deadline, provider rule | decision and financial evidence |
| `present-eligibility` | prove entitlement | campaign, deployment, policy, proof-profile and privacy-profile digests; issuer; proof; scope; expiry; nullifier | verified presentation outcome |
| `claim-aid` | request aid | pinned record digests, campaign state, presentation, duplicate rule, delivery binding | pending claim or rejection |
| `read-aid-claim` | reconcile claim | profile-defined finality and evidence | disbursement receipt or terminal refusal |
| `read-fund-flow` | inspect aggregate movement | report signature, source commitment, measurement profile | verified aggregate report |

Read operations must not require identifying the user unless the selected
provider has a lawful, disclosed reason. Submission operations are
idempotent by their stable intent or claim identifier.

## 8. State machines

### 8.1 Campaign

```text
draft -> active -> paused -> active
              \-> closed
              \-> revoked
```

Only an authorized campaign controller may change status. An organization
credential becoming invalid changes the resolved trust result immediately,
even if the campaign record still says `active`. A UI blocks new donations
under its trust policy and preserves evidence for already finalized actions.

### 8.2 Donation

```text
prepared -> submitted -> pending -> finalized
prepared -> expired
submitted -> failed | expired
pending -> failed | expired
finalized -> refund-pending -> refunded | refund-denied
finalized -> reversed
```

`submitted` is not settlement. The profile defines when evidence is final and
how reorganization, chargeback, reversal, partial refund, and provider outage
are represented.

### 8.3 Aid claim

```text
prepared -> submitted
prepared -> expired
submitted -> eligibility-verified | rejected | expired
eligibility-verified -> approved | rejected | expired
approved -> disbursed | expired
```

Approval is not disbursement. Public evidence must not reveal which private
claimant followed a nullifier into a real-world payout.

## 9. Privacy boundary

### 9.1 Required data minimization

The base interface requires no real name, email, phone, advertising identifier,
address-book upload, device fingerprint, persistent referral token, messenger
social graph, or plaintext conversation. Providers may require regulated data
for a particular rail, jurisdiction, tax receipt, or aid program, but that is
a distinct declared flow with a named controller and retention policy.

No provider may demand the identity root secret, BIP-39 mnemonic, unrelated
derived key, message decryption key, or complete credential as proof of control.
The application supplies a scoped signature, capability, derived presentation,
or transaction authorization.

### 9.2 Beneficiary protection

- Never publish a beneficiary roster.
- Prefer predicates such as “eligible under policy P” over source attributes.
- Use campaign- and epoch-scoped nullifiers when duplicate prevention is
  needed.
- Keep case files and source credentials with the responsible operator or
  issuer, not in public notary state.
- Do not place names, phone numbers, home addresses, medical facts, migration
  status, precise location, or private payout coordinates in public events.
- Make screenshots, notifications, exports, backups, and support logs part of
  the threat model.

### 9.3 Donor privacy

A public financial rail can expose addresses, amounts, timing, fee payers,
contract targets, and transaction graphs even when the messenger carries no
PII. A profile declares these disclosures and the UI warns before signing.
“Anonymous donation” must not be shown when the selected rail or compliance
flow makes the donor identifiable to the provider or public.

The donor may choose a public, pseudonymous, or private-to-the-extent-supported
receipt. Public recognition is opt-in and separate from payment validity.

### 9.4 Incidents and responsibility

No architecture can honestly guarantee zero privacy incidents across user
devices, external financial rails, charities, issuers, and regulators. Each
deployment instead declares:

1. which party controls each data set;
2. permitted purposes and retention;
3. security and disclosure commitments;
4. incident contact and response window;
5. evidence-preservation and user-notification policy; and
6. the boundary of responsibility.

The Onym-side target is zero intentional PII publication in messenger protocol
objects and the charity contract surface. That is a testable design invariant,
not a warranty that no endpoint can ever be compromised.

## 10. Measurement without tracking people

The protocol may measure fund flow without measuring people.

`eligibleDonationVolume` is the amount, under a pinned measurement rule, from
finalized donation receipts that:

1. reference a campaign and revision valid at authorization time;
2. reference an organization credential accepted by the pinned trust policy;
3. settle to the pinned campaign destination through an accepted financial
   binding; and
4. have not been duplicated, refunded, reversed, or otherwise excluded.

Every report declares whether volume means gross finalized value or net value
received. The recommended default is **net finalized value**, with refunds and
reversals subtracted and fees reported separately. Cross-asset totals require
a separately declared valuation source, timestamp, currency, and rounding
rule; otherwise amounts remain per asset.

This metric proves qualifying financial flow into selected campaigns. It does
not prove:

- that a particular person installed or used an application;
- that the donation originated from a particular message or screen;
- that a new user was acquired;
- that the charity spent funds as intended; or
- that impact occurred.

An optional shared `interfaceChannelId` can distinguish broad interface
profiles, such as `onym-messenger`, when both quote and receipt bind it. It is
not reliable person-level attribution and can be copied or spoofed. It must not
be used for surveillance, per-user royalties, discrimination, or eligibility.
Campaign-specific efficiency can be computed as qualifying volume divided by
declared campaign spend, but must be labeled a campaign estimate rather than a
user conversion rate.

## 11. Financial safety, participant offers, and compliance

The abstract boundary is non-custodial: it requests quotes, obtains user
authorization, and verifies outcomes. It does not grant the UI, messenger
publisher, registry, or notary custody of funds by implication.

Before authorization the UI shows:

- financial provider and legal counterparty;
- asset and network;
- gross amount, each fee, and net amount;
- exact destination and recipient binding;
- finality, reversal, and refund rules;
- known tax-receipt status;
- donor data disclosed to each party; and
- whether a public transaction graph may result.

Every independently owned role may publish a signed, bounded service offer.
For example, an issuer may charge an organization for verification, a proof
provider for computation, a financial provider per settlement, a notary per
operation or period, an auditor for an engagement, and a UI provider through a
subscription, sponsorship, fixed campaign fee, or disclosed share of
qualifying volume. An operator may also provide its role as a grant-funded or
free public service.

Participation does not create an automatic royalty. A compensable offer exists
only when an authorized buyer accepts its price, scope, evidence, duration,
limits, refund terms, and settlement destination. Payment never makes an
issuer trusted, a campaign valid, an operation authorized, or a report true.

Any fee or revenue share deducted from a donor's value appears in the signed
quote as an amount, rate, recipient, and basis. It is included in the finalized
receipt and in arithmetic from gross amount to net amount. No UI, registry,
transport, notary, financial provider, lead generator, or app publisher
receives an undisclosed cut. A payment may reward a completed operation or
aggregate campaign outcome;
it must not attach a permanent royalty identity to the donor or beneficiary.

Provider settlement can use aggregate signed statements or qualifying receipt
IDs. The provider receives only evidence needed for the accepted offer, not
messenger history, contacts, source credentials, or a persistent user profile.
Disputes about offer fulfillment remain separate from donation finality unless
the accepted financial profile explicitly and visibly couples them.

Applicable law varies by entity, activity, asset, rail, beneficiary, and
jurisdiction. Organization credentials and cryptographic proofs do not replace
risk-based compliance. Each operator remains responsible for obtaining legal
advice and implementing proportionate measures within its domain. A profile
must allow providers to refuse with a typed reason, but a refusal must not leak
sensitive compliance facts into public state.

## 12. Errors and refusal

The port returns typed outcomes rather than provider text as control flow:

| Code | Meaning | Safe UI behavior |
|---|---|---|
| `PROFILE_UNSUPPORTED` | interface/profile version is unsupported | offer another compatible adapter |
| `DEPLOYMENT_INVALID` | binding signature, hash, status, or validity failed | block and identify failed check |
| `CAMPAIGN_NOT_ACTIVE` | campaign is absent, paused, closed, or revoked | block new action; preserve history |
| `CREDENTIAL_UNTRUSTED` | credential does not satisfy selected policy | show issuer/policy mismatch |
| `CREDENTIAL_REVOKED` | current status is revoked | block new action |
| `QUOTE_EXPIRED` | financial terms are no longer valid | fetch and re-present a quote |
| `TERMS_CHANGED` | destination, amount, fee, privacy, or policy changed | require fresh authorization |
| `AUTHORIZATION_INVALID` | signature/capability does not cover operation | fail without retrying blindly |
| `PAYMENT_REQUIRED` | provider requires a declared service payment | show signed offer separately |
| `COMPLIANCE_REQUIRED` | selected provider needs an additional private flow | identify provider and disclosure before consent |
| `PROOF_INVALID` | eligibility proof failed | reveal no unnecessary diagnostic publicly |
| `NULLIFIER_USED` | entitlement was already claimed in this scope | show scoped duplicate refusal |
| `SUBMISSION_UNKNOWN` | provider accepted request but outcome is unresolved | reconcile using stable intent ID |
| `FINALITY_PENDING` | evidence is valid but not final | keep pending |
| `REFUND_DENIED` | refund policy did not authorize a refund | show authenticated reason and dispute route |
| `PRIVACY_PROFILE_MISMATCH` | requested flow would exceed accepted disclosure | stop and require explicit new choice |

Provider prose may be shown as untrusted supplemental information. It cannot
change the meaning of a code or cause the application to sign a new operation.

## 13. Security invariants

1. No seed phrase, root secret, or unscoped private key crosses the boundary.
2. User authorization covers exact amount, asset, destination, campaign
   revision and digest, deployment, trust policy, provider binding, quote,
   expiry, fees, and relevant privacy-profile digest.
3. A message, link, QR code, or Discovery entry can propose an operation but
   cannot authorize it.
4. Organization trust is derived from an explicit issuer policy, not UI brand.
5. Campaign changes cannot mutate an already authorized intent.
6. A revision number without its canonical object digest grants no authority;
   signed same-revision equivocation blocks new action.
7. Submission is idempotent and reconciliation never creates a second payment.
8. Public records contain no intentional donor or beneficiary PII.
9. Eligibility nullifiers are scoped; they are not global person identifiers.
10. Aggregate reports exclude or correct duplicates, refunds, and reversals.
11. Financial settlement, organization verification, and impact reporting are
    distinct claims with distinct issuers.
12. A paid provider refusal does not make an invalid operation valid.
13. Every remote object is size-bounded, schema-checked, and signature-checked
    before rendering or execution.

## 14. Versioning, migration, and revocation

- Profiles and schemas are immutable and content-addressed.
- Deployments and campaigns are revisioned signed records; every dependent
  authorization pins their canonical digests.
- New optional fields are safe only when their omission cannot alter security,
  value, trust, or privacy semantics.
- Unknown critical fields fail closed.
- An in-flight operation remains bound to the revisions it authorized.
- Credential revocation blocks new operations but does not erase historical
  evidence.
- Provider or destination migration requires a new deployment or campaign
  revision and fresh user authorization.
- Emergency pause is explicit, authenticated, and auditable; it does not grant
  the UI publisher a hidden withdrawal or redirection power.

## 15. Conformance

A conforming implementation publishes:

1. supported Charity Profile and schema hashes;
2. canonicalization and signature test vectors;
3. trust-policy, revocation, and same-revision equivocation test vectors;
4. amount, fee, precision, and rounding vectors;
5. donation idempotency, timeout, finality, refund, and reversal tests;
6. eligibility proof, scope, expiry, and duplicate-claim tests if aid is
   supported;
7. privacy-field inventory and negative PII fixtures;
8. aggregate measurement and correction vectors;
9. malformed, oversized, replayed, and unknown-critical-field fixtures; and
10. deployment, operator, license, support, and incident declarations.

Two implementations are interoperable only when they preserve the same
logical meaning and evidence—not merely because both can send JSON or invoke
the same ledger.

## 16. Non-normative design references

These sources inform the trust, privacy, and risk separation in this draft;
they do not make a deployment legally compliant by themselves:

- the [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/2025/REC-vc-data-model-2.0-20250515/)
  describes explicit issuer, holder, and verifier roles while leaving issuer
  trust decisions to an ecosystem policy;
- Article 5 of the [EU General Data Protection Regulation](https://eur-lex.europa.eu/eli/reg/2016/679/2016-05-04)
  includes purpose limitation, data minimization, storage limitation, and
  integrity/confidentiality principles; and
- the [FATF best-practices paper for nonprofit organizations](https://www.fatf-gafi.org/en/publications/Financialinclusionandnpoissues/Bpp-combating-abuse-npo.html)
  describes focused, proportionate, risk-based measures and warns against
  unnecessarily burdensome restrictions on legitimate nonprofit activity.

## 17. Acceptance criteria

The abstract charity boundary is acceptable when:

- a third-party application can resolve and verify a campaign without trusting
  the original UI publisher;
- a third-party charity and credential issuer can participate through public
  profiles without receiving messenger or identity secrets;
- a donor sees exact value, recipient, trust path, fees, privacy, and finality
  before locally authorizing;
- a beneficiary can prove a scoped entitlement without public identity when
  the selected profile claims that property;
- finalized, refunded, and reversed operations reconcile without double spend
  or double counting;
- public fund-flow metrics contain no person-level attribution;
- a deployment can replace a financial, notary, or UI implementation through
  an explicit migration rather than a silent operator redirect; and
- responsibility for charity operations, compliance, funds, messenger UX,
  credentials, and evidence is visible at every boundary.
