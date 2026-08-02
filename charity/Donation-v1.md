---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 02.08.2026
---

# Onym Charity Donation v1 Profile

**Implementation profile draft 0.1 — August 2026**

Donation v1 is the first independently implementable capability profile under
the [Charity Contract Boundary](Charity.md). It covers campaign resolution,
donation authorization and settlement, refunds, receipts, and aggregate fund
flow. It does not claim support for beneficiary eligibility or aid delivery.

## Required operations

- `resolve-campaign`
- `quote-donation`
- `prepare-donation`
- `submit-donation`
- `read-donation`
- `request-refund`
- `read-fund-flow`

## Required objects

A conforming deployment implements the Charity Profile and Deployment,
Trust Policy, Organization Credential, Charity Campaign, Donation Quote,
Donation Intent, Donation Receipt, and Aggregate Fund-Flow Report objects from
`Charity.md`, plus the errors and state transitions reachable by the required
operations.

It publishes a content-addressed schema set, canonicalization and signature
rules, financial evidence profile, disclosure profile, metric profile, and
conformance vectors. It must not include an Aid v1 capability in discovery or
the UI merely because campaign records contain optional aid-related fields.

## Conformance boundary

Donation v1 conformance requires:

1. exact preview and authorization of value, recipient, fees, provider,
   revisions, privacy choice, expiry, and refund/finality rules;
2. idempotent submission and reconciliation after timeout or restart;
3. independently verifiable final, failed, refund, and reversal outcomes;
4. aggregate fund-flow arithmetic that excludes duplicates and corrects
   refunds and reversals;
5. negative PII fixtures for public objects and events; and
6. one mock non-ledger adapter proving that the profile is not tied to a
   particular financial rail.

Eligibility proofs, nullifiers, aid claims, and beneficiary delivery are
outside this profile and cannot block Donation v1 release.
