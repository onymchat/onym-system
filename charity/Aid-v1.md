---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 02.08.2026
---

# Onym Charity Aid v1 Profile

**Implementation profile draft 0.1 — August 2026**

Aid v1 is the independently implementable beneficiary profile under the
[Charity Contract Boundary](Charity.md). It covers private eligibility
presentation, duplicate prevention, aid claims, approval, delivery, and
disbursement evidence. It does not require a campaign to collect donations
through Donation v1.

## Required operations

- `resolve-campaign`
- `present-eligibility`
- `claim-aid`
- `read-aid-claim`
- `read-fund-flow`

## Required objects

A conforming deployment implements the Charity Profile and Deployment,
Trust Policy, Organization Credential, Charity Campaign with `aidTerms`,
Eligibility Policy and Presentation, Aid Claim, Aid Disbursement Receipt, and
Aid Aggregate Fund-Flow Report objects from `Charity.md`, plus the errors and
state transitions reachable by the required operations. A campaign may omit
`donationTerms`; Donation Quote, Intent, Receipt, and refund objects are not
required.

It publishes a content-addressed schema set, canonicalization and signature
rules, proof profile, issuer policy, disclosure profile, delivery profile, and
conformance vectors. Donation quotes, donor payment authorization, refunds,
and donation receipts are outside Aid v1.

## Conformance boundary

Aid v1 conformance requires:

1. local derived presentation using only the policy-required credential facts;
2. campaign-, epoch-, and policy-scoped duplicate prevention without a global
   beneficiary identifier;
3. exact claimant authorization of entitlement and private delivery binding;
4. idempotent claim submission and reconciliation after timeout or restart;
5. separate approval and disbursement states with independently checked
   evidence;
6. aggregate claimed, approved, disbursed, fee, reversal, and correction
   arithmetic under the Aid metric profile's canonical precision and rounding
   rules;
7. negative PII fixtures for public objects, events, logs, notifications, and
   reports;
8. failure behavior for invalid, expired, replayed, and duplicate proofs; and
9. one mock non-ledger delivery adapter proving that the profile is not tied to
   a particular payout rail.

A Donation v1 implementation does not satisfy any Aid v1 criterion by
implication. Aid v1 must be advertised, tested, and removable separately.
The UI exposes it only when the deployment and campaign advertise the exact Aid
v1 profile and the installed client supports it.
