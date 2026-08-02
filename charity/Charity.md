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
- beneficiary eligibility policies, challenges, presentations, claims, and
  outcomes;
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
    "request-eligibility-challenge",
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
  "charityProfileId": "onym:charity-profile:donation-aid-v1",
  "operator": "onym:key:<charity-operator>",
  "organizationCredentialPolicy": "<trust-policy-id-and-hash>",
  "campaignRegistry": "<adapter-profile-and-endpoint>",
  "financialBindings": ["<financial-profile-and-deployment>"],
  "notaryBindings": ["<notary-profile-and-deployment>"],
  "eligibilityBindings": ["<proof-profile-and-issuer-policy>"],
  "auditBindings": ["<audit-profile-and-issuer-policy>"],
  "privacyProfile": "<hash-or-url>",
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
  "charityDeploymentId": "<deployment-id>",
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
  "financialProvider": "onym:key:<provider-id>",
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
  "organizationCredentialDigest": "<credential-digest>",
  "grossAmount": "100.00",
  "asset": "<asset-and-network-id>",
  "destination": "<canonical-destination>",
  "donorDisclosure": "private-to-extent-supported",
  "interfaceChannelId": "<optional-non-user-specific-channel>",
  "expiresAt": "<timestamp>",
  "authorization": "<scoped-user-authorization>"
}
```

Authorization covers every state-changing and value-moving field. An
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
  "organization": "onym:key:<organization-id>",
  "organizationCredentialDigest": "<credential-digest>",
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
proof system, intended verifier, challenge lifetime, minimum retry window,
maximum replay-state retention, minimum and maximum terminal claim-record
retention, public inputs, claimant-key binding, nullifier scope,
duplicate-prevention lifetime, and disclosure profile. A valid policy requires
its maximum replay-state retention to be at least its maximum challenge lifetime
plus its minimum retry window; a policy that cannot satisfy that ordering is
invalid. An
`EligibilityPresentation` proves the requested predicate without publishing
the underlying credential when the selected proof system supports it.

Before constructing a presentation, the claimant requests a signed
`EligibilityChallenge` from the intended verifier:

```json
{
  "challengeVersion": 1,
  "challengeId": "<verifier-generated-random-id>",
  "issuer": "onym:key:<eligibility-verifier-signing-key>",
  "audience": "onym:key:<eligibility-verifier>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "policyId": "<eligibility-policy-id-and-version>",
  "purpose": "claim-aid",
  "nonce": "<unpredictable-random-bytes>",
  "issuedAt": "<timestamp>",
  "expiresAt": "<timestamp>",
  "replayStateExpiresAt": "<timestamp>",
  "signature": "<eligibility-verifier-signature>"
}
```

The challenge request contains only the campaign, revision, policy, purpose,
and intended verifier. It requires no claimant identifier or source credential.
The signed object is a self-verifying, stateless issuance token: its signature
covers every field, including `issuer` and at least 128 bits of
verifier-generated `nonce`, so the verifier need not retain an issuance record.
The issuer must be an authorized challenge-signing key for the named audience
under the pinned eligibility policy and deployment binding. `audience` may equal
`issuer`, but verifier routing never substitutes for explicit signer identity.
Deployments must publish and enforce a maximum request size and issuance rate
before signing. A request over
the size bound or refused by the anonymous issuance budget returns
`CHALLENGE_ISSUANCE_LIMIT` with a typed `limitKind` and an optional
`retryAfter`; it does not solicit identity as a fallback. Deployments may bound
anonymous issuance by an ephemeral connection or coarse network bucket, but
must not turn that control into a persistent claimant identifier. The challenge
is valid only for its named audience and context.
`replayStateExpiresAt` is no earlier than `expiresAt` plus the policy's minimum
idempotent-retry window and no later than `issuedAt` plus its maximum
replay-state retention. The policy ordering constraint above guarantees that
both bounds can be satisfied for every permitted challenge lifetime. If a claim
succeeds, the verifier retains through that
time (1) a `claimId` index containing the canonical authorized claim digest and
original authenticated outcome and (2) a challenge-digest index containing the
claim ID and claim digest. It then deletes those replay indexes unless a
separately disclosed legal or incident hold applies. The underlying claim
record remains available while the claim is nonterminal and, after a terminal
transition, through its signed `claimRecordExpiresAt`. That bound is no earlier
than the terminal transition plus the policy's minimum terminal claim-record
retention and no later than the transition plus its maximum. After the retry
bound, an old claim is reconciled through authenticated `read-aid-claim`, not
resubmitted. Active nullifier reservations and permanently spent nullifiers are
retained independently through the policy's declared duplicate-prevention
lifetime for that nullifier scope.

```json
{
  "presentationVersion": 1,
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "policyId": "<eligibility-policy-id-and-version>",
  "epoch": "<policy-defined-claim-window>",
  "audience": "onym:key:<eligibility-verifier>",
  "eligibilityChallenge": {
    "challengeId": "<eligibility-challenge-id>",
    "challengeDigest": "<digest-of-signed-eligibility-challenge>"
  },
  "claimantKey": "onym:key:<claim-scoped-ephemeral-key>",
  "policyPublicInputs": "<canonical-policy-defined-additional-inputs>",
  "nullifier": "<campaign-and-epoch-scoped-nullifier>",
  "proof": "<proof-bytes>",
  "expiresAt": "<timestamp>"
}
```

Every top-level presentation field other than `proof` is a public input to the
proof statement. `policyPublicInputs` contains only the additional public inputs
defined by the eligibility policy; it does not wrap or duplicate the other
top-level fields. The proof therefore covers the audience,
eligibility-challenge reference, claimant key, campaign, revision, policy,
epoch, policy-specific public inputs,
nullifier, and expiry. The audience prevents a presentation prepared for one
verifier from being replayed to another. The challenge is unpredictable,
claim-scoped, and short-lived; it must not contain or derive from a beneficiary
identifier. The claimant key is newly generated for this claim and proves only
that the same holder who prepared the presentation authorized the subsequent
claim.

The presentation binds the exact campaign revision so it cannot be
reinterpreted under a later eligibility, allocation, or privacy policy. Its
nullifier remains stable across revisions within the same campaign and epoch
to prevent a policy update from enabling a second claim. It must not become a
cross-campaign or permanent beneficiary identifier. Merely validating or
preflighting a presentation consumes neither its challenge nor its nullifier
and leaves the same presentation usable for `claim-aid`. Only the first
successful `claim-aid` for a challenge marks it spent. That transition verifies
the presentation and claimant authorization, then atomically records the claim,
marks the challenge spent, and reserves the nullifier for that claim ID and
digest. The reservation blocks a concurrent claim but is not permanent
consumption. It becomes permanently spent only when the claim is disbursed; a
terminal rejection or expiry before disbursement atomically releases it. A
failed validation changes none of those records. If a proof profile cannot
provide these bindings or avoid revealing identity, the UI must state that
before submission and require explicit user choice.

### 6.8 Aid Claim and Disbursement Receipt

An `AidClaim` pins the exact campaign revision, eligibility policy,
presentation digest, requested entitlement, private delivery binding, expiry,
and claimant authorization:

```json
{
  "claimVersion": 1,
  "claimId": "<claimant-generated-random-128-bit-id>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "eligibilityPolicyId": "<policy-id-and-version>",
  "presentationDigest": "<digest-of-eligibility-presentation>",
  "nullifier": "<campaign-and-epoch-scoped-nullifier>",
  "claimantKey": "onym:key:<claim-scoped-ephemeral-key>",
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

`claimId` contains at least 128 bits from a cryptographically secure random
generator. It is never sequential, derived from beneficiary data, or reused for
another claim. This makes another claimant's identifier infeasible to guess;
`IDEMPOTENCY_CONFLICT` additionally reveals no fields or status from the
existing claim.

The canonical wire input to `claim-aid` is a self-contained
`ClaimAidRequest`:

```json
{
  "claimAidRequestVersion": 1,
  "claim": "<complete-AidClaim-object>",
  "presentation": "<complete-EligibilityPresentation-object>",
  "eligibilityChallenge": "<complete-signed-EligibilityChallenge-object>"
}
```

The adapter transmits all three complete objects even when
`present-eligibility` preflight previously succeeded; preflight storage is
never required for correctness. The provider canonicalizes the included
presentation and requires its digest to equal `claim.presentationDigest`. It
then canonicalizes the included signed challenge and requires its ID and digest
to equal `presentation.eligibilityChallenge`. The claim authorization binds the
presentation digest, the presentation proof binds the signed-challenge
reference, and the challenge signature binds its issuer and complete claim
context. Substitution at any layer therefore breaks that digest and
authorization chain.

The claimant authorization is verified by the exact `claimantKey` committed as
a top-level public proof input of the referenced presentation and covers the
canonical digest of every claim field, including the delivery binding. A
copied presentation therefore cannot be attached to an attacker's claim
without the claim-scoped private key. The key must not be reused across
campaigns, epochs, or claims.

The claim's `campaignId`, `campaignRevision`, `eligibilityPolicyId`,
`nullifier`, and `claimantKey` must exactly equal the corresponding fields in
the included presentation whose digest equals `presentationDigest`. That
presentation is authoritative for those proof-statement values. A claimant-key
mismatch returns
`CLAIMANT_BINDING_INVALID`; any other restatement mismatch returns
`PRESENTATION_BINDING_MISMATCH`. Neither consumes the challenge or nullifier.

The provider schema-checks the request envelope and its included objects before
returning any claim-specific lookup result. For a structurally valid request,
the first matching item in this total precedence order wins:

1. A missing, malformed, or non-canonical included presentation, or one whose
   digest does not equal `claim.presentationDigest`, returns
   `PRESENTATION_UNKNOWN`.
2. A declared claimant key different from the key in the presentation returns
   `CLAIMANT_BINDING_INVALID`; otherwise the provider verifies authorization
   over the exact canonical claim bytes and returns `AUTHORIZATION_INVALID` if
   it fails.
3. While the replay index is retained, an existing `claimId` with the exact
   authorized claim digest returns the original authenticated outcome, and the
   same ID with any different digest returns `IDEMPOTENCY_CONFLICT`.
4. Any other presentation restatement mismatch returns
   `PRESENTATION_BINDING_MISMATCH`.
5. A missing or malformed included challenge, a challenge whose canonical ID
   and digest do not match `presentation.eligibilityChallenge`, an unauthorized
   issuer, invalid signature, or wrong campaign, revision, policy, or purpose
   binding returns `CHALLENGE_INVALID`; wrong audience returns
   `AUDIENCE_MISMATCH`; challenge expiry returns `CHALLENGE_EXPIRED`;
   presentation expiry returns `PRESENTATION_EXPIRED`; a challenge spent by
   another claim returns `CHALLENGE_REUSED`; and a nullifier reserved by another
   active claim or permanently spent returns `NULLIFIER_USED`, in that order.
6. Proof and delivery validation use the included presentation and claim before
   state changes and return their
   profile-defined typed errors.

Thus `IDEMPOTENCY_CONFLICT` wins over `CHALLENGE_REUSED` when both describe the
request, and a captured byte-identical claim is never answered until its
claimant authorization has been reverified. After `replayStateExpiresAt`, the
index in item 3 is gone, normal validation and error precedence apply, and the
provider no longer promises to reproduce the submission outcome; the claimant
uses authenticated `read-aid-claim` instead. None of these rejection paths
creates a second claim or changes challenge or nullifier state.

`read-aid-claim` is a private proof-of-possession read. Its canonical request
contains the `claimId`, stored `claimantKey`, provider audience, a
channel-bound freshness value defined by the selected authenticated transport
profile, request expiry, and a domain-separated authorization by that
claim-scoped key. This requires no additional Charity wire operation. The
provider verifies freshness, authorization, and the exact key match before
returning claim status, delivery evidence, or a terminal outcome over that
channel. A missing, mismatched, or invalid proof returns the same
`AUTHORIZATION_INVALID` outcome and reveals neither whether the claim exists nor
which key controls it. The opaque local key handle is never a wire credential.

The provider must not delete a claim record while the claim is nonterminal;
policy-defined deadlines force every such state to a terminal outcome rather
than permitting indefinite retention.
Every signed terminal `read-aid-claim` outcome carries
`claimRecordExpiresAt`, as does an `AidDisbursementReceipt`; the provider keeps
the authenticated read available through that bound. A separately disclosed
legal or incident hold may retain the record longer, but cannot silently extend
key use or claimant authentication. The claimant vault retains the private key
while the claim is nonterminal and through `claimRecordExpiresAt`, then may
delete it under its declared recovery policy. Replay-index expiry alone never
authorizes key deletion.

`recipientCommitment` is randomized and scoped to this claim so repeated
delivery coordinates do not intentionally create a public correlation key.
`encryptedRecipient` contains only the payout address,
pickup capability, shipping coordinate, or other recipient data required by
the selected rail. It is sealed to the named delivery provider and is never
copied into public notary state. Public state may contain only the claim
digest, scoped nullifier, and recipient commitment required by the profile.
The binding must reveal no more than the chosen financial or physical delivery
rail requires.

An `AidDisbursementReceipt` records the exact claim, outcome, entitlement,
fees, finality, authenticated-read retention bound, and evidence without
repeating private delivery details:

```json
{
  "disbursementReceiptVersion": 1,
  "receiptId": "<stable-id>",
  "claimId": "<claim-id>",
  "claimDigest": "<digest-of-canonical-authorized-claim>",
  "campaignId": "<campaign-id>",
  "campaignRevision": 1,
  "eligibilityPolicyId": "<policy-id-and-version>",
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
  "claimRecordExpiresAt": "<timestamp>",
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
| `resolve-campaign` | inspect a campaign | profile, deployment, signatures, credential policy, status, freshness | verified view plus explicit warnings |
| `quote-donation` | request current terms | campaign revision, provider binding, asset, destination, arithmetic, expiry | signed quote |
| `prepare-donation` | freeze exact operation | quote, privacy disclosure, authorization schema | canonical intent bytes/digest |
| `submit-donation` | move declared value | local authorization, current quote, destination, idempotency | pending outcome/provider reference |
| `read-donation` | reconcile state | evidence and finality rule | finalized, failed, refunded, or still pending |
| `request-refund` | invoke declared policy | requester authority, receipt, deadline, provider rule | decision and financial evidence |
| `request-eligibility-challenge` | obtain proof freshness for one verifier and claim context | request size and anonymous issuance budget; campaign, revision, policy, purpose, verifier authority, lifetime, replay-state retention | signed unpredictable challenge requiring no claimant identity, or typed `CHALLENGE_ISSUANCE_LIMIT` |
| `present-eligibility` | preflight entitlement without consuming it | policy, issuer, proof statement, audience, signed challenge, claimant key, scope, expiry, nullifier | short-lived verified presentation outcome; challenge and nullifier remain usable |
| `claim-aid` | reserve entitlement and request aid | self-contained claim, presentation, and signed-challenge envelope; digest chain, schema, and claimant authorization; bounded idempotency lookup; then campaign state, presentation/restatement equality, audience, challenge, duplicate rule, proof, and delivery binding | original outcome for identical retry within the signed replay window, otherwise one pending claim or rejection |
| `read-aid-claim` | reconcile claim | claim ID, exact stored claim-scoped key, fresh proof-of-possession authorization, profile-defined finality and evidence | authenticated pending state, disbursement receipt, or terminal refusal with claim-record retention bound |
| `read-fund-flow` | inspect aggregate movement | report signature, source commitment, measurement profile | verified aggregate report |

Read operations must not require identifying the user unless the selected
provider has a lawful, disclosed reason. Claim-scoped proof of key possession
for `read-aid-claim` is authorization to one pseudonymous claim, not user
identification, and must not be widened into a stable account or identity
requirement. Submission operations are
idempotent by their stable intent or claim identifier. `present-eligibility`
is a non-consuming preflight: only a successful first `claim-aid` transition
may spend its challenge and reserve its nullifier, and it does both in the same
atomic transition that records the claimant-key-bound claim. While replay state
is retained, an identical retry returns that transition's original outcome; it
is not challenge reuse or a duplicate-nullifier error. The verifier retains
spent-challenge and claim idempotency state through the signed challenge's
`replayStateExpiresAt`. It retains an active reservation until a non-disbursed
terminal transition releases it, or retains the permanently spent nullifier
for the policy's full duplicate-prevention lifetime after disbursement.

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

The transition from `submitted` to `eligibility-verified` is the atomic point
that records the claim, marks its challenge spent, and reserves its nullifier
for the exact claim ID and digest. That reservation rejects concurrent claims
using the same nullifier. The `approved -> disbursed` transition permanently
spends it. Every `rejected` or `expired` transition from a reserved state
atomically releases it; the terminal claim cannot be reopened, and a later
attempt requires a new claim ID, challenge, presentation, and claim-scoped key.
The old challenge remains spent through its replay-state window. While that
state is retained, retrying the exact same `claimId` and claim digest returns
the already recorded outcome without a new transition; a different digest
under that ID is rejected.

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
| `PRESENTATION_UNKNOWN` | `claim-aid` omitted the complete presentation, it cannot be canonicalized, or its digest does not equal the claim's `presentationDigest` | reject without lookup disclosure or state changes and resend only the exact locally authorized request envelope |
| `CHALLENGE_ISSUANCE_LIMIT` | challenge request exceeds the published size or anonymous issuance budget; carries `limitKind` (`request-size`, `rate`, or `capacity`) and optional `retryAfter` | respect the bound, do not loop, and never request identity merely to bypass anonymous issuance controls |
| `CHALLENGE_INVALID` | challenge is absent, malformed, unsigned, or bound to the wrong campaign, revision, policy, or purpose | reject without consuming state and obtain a valid challenge from the authenticated verifier |
| `CHALLENGE_EXPIRED` | the authenticated challenge lifetime elapsed | obtain a fresh scoped challenge and rebuild the presentation |
| `PRESENTATION_EXPIRED` | the eligibility presentation's own `expiresAt` elapsed | reject without consuming state and build a fresh presentation and claim-scoped key |
| `AUDIENCE_MISMATCH` | presentation audience is not the verifier handling the claim | reject without consuming state; do not redirect or silently rebuild for another verifier |
| `CHALLENGE_REUSED` | a different claim already spent this challenge within its replay-state window | reject without consuming state, reveal no other claim details, and tell an authenticated claimant to reconcile only a locally known claim ID |
| `CLAIMANT_BINDING_INVALID` | claim authorization does not match the claimant key proven in the presentation | reject without consuming the nullifier |
| `PRESENTATION_BINDING_MISMATCH` | claim restates campaign, revision, policy, or nullifier differently from the referenced presentation | reject without consuming challenge or nullifier state |
| `NULLIFIER_USED` | entitlement is reserved by another active claim or was disbursed in this scope | show scoped duplicate refusal without implying that a non-disbursed terminal claim permanently consumed it |
| `IDEMPOTENCY_CONFLICT` | a stable intent or unpredictable claim ID was reused with different canonical bytes | reject without changing the original operation or consuming new state, and reveal no existing claim fields or status |
| `SUBMISSION_UNKNOWN` | provider accepted request but outcome is unresolved | reconcile using the stable intent or claim ID; only while replay state is retained does an identical retry return the original outcome |
| `FINALITY_PENDING` | evidence is valid but not final | keep pending |
| `REFUND_DENIED` | refund policy did not authorize a refund | show authenticated reason and dispute route |
| `PRIVACY_PROFILE_MISMATCH` | requested flow would exceed accepted disclosure | stop and require explicit new choice |

Provider prose may be shown as untrusted supplemental information. It cannot
change the meaning of a code or cause the application to sign a new operation.

## 13. Security invariants

1. No seed phrase, root secret, or unscoped private key crosses the boundary.
2. User authorization covers exact amount, asset, destination, campaign
   revision, quote, expiry, fees, and relevant privacy choice.
3. A message, link, QR code, or Discovery entry can propose an operation but
   cannot authorize it.
4. Organization trust is derived from an explicit issuer policy, not UI brand.
5. Campaign changes cannot mutate an already authorized intent.
6. Submission is idempotent and reconciliation never creates a second payment
   or aid claim; an identical stable-ID retry returns the original outcome only
   while the operation's declared replay state is retained.
7. Public records contain no intentional donor or beneficiary PII.
8. Eligibility nullifiers are scoped; they are not global person identifiers.
9. Eligibility presentations bind a verifier, signed claim-scoped challenge,
   and fresh claim-scoped key; preflight consumes nothing, while the first
   atomic, correctly authorized claim spends the challenge and reserves the
   nullifier until disbursement permanently spends it or a non-disbursed
   terminal transition releases it.
10. A verifier retains the challenge-to-claim idempotency mapping through the
    signed replay-state bound and rejects a different claim that reuses it.
11. Aggregate reports exclude or correct duplicates, refunds, and reversals.
12. Financial settlement, organization verification, and impact reporting are
    distinct claims with distinct issuers.
13. A paid provider refusal does not make an invalid operation valid.
14. Every remote object is size-bounded, schema-checked, and signature-checked
    before rendering or execution.
15. Private claim reconciliation proves possession of the stored claim-scoped
    key without identifying the claimant, and the key remains available for
    every nonterminal state and the signed terminal claim-record retention.

## 14. Versioning, migration, and revocation

- Profiles and schemas are immutable and content-addressed.
- Deployments and campaigns are revisioned signed records.
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
3. trust-policy and revocation test vectors;
4. amount, fee, precision, and rounding vectors;
5. donation idempotency, timeout, finality, refund, and reversal tests;
6. bounded stateless challenge issuance, proof-statement field placement,
   explicit signer identity, satisfiable lifetime ordering, typed issuance-limit
   refusal, audience, challenge and presentation expiry, replay-state and
   duplicate-prevention retention, preflight non-consumption, self-contained
   claim/presentation/challenge transport, atomic challenge spend/nullifier
   reservation, terminal release, disbursement spend, presentation-to-claim
   equality, unknown-presentation refusal, claimant binding, unpredictable claim
   IDs, authorized bounded retry, conflicting stable-ID precedence,
   authenticated claim reads, claim-key and record retention, and
   duplicate-claim tests if aid is supported;
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
