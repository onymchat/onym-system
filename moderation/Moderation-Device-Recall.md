---
status: draft
proposed: Claude & @rinat-enikeev
date: 06.08.2026
---

# Onym Moderation ↔ Device Mark: Google Play Integrity Device Recall Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the abstract device-mark rail onto Play Integrity's
> device recall feature: per-device recall values scoped to the app,
> written server-side against an integrity token and read back inside
> integrity verdicts, surviving app reinstallation.

This document is a concrete implementation of
[Moderation.md](Moderation.md) §5.7 (device marks and enforcement
binding) for Android. The abstract contract remains authoritative for
mandates, reports, cases, verdicts, obligations, and invariants. The
sibling [DeviceCheck profile](Moderation-DeviceCheck.md) is the iOS
counterpart; the two profiles deliberately share their enforcement-
backend requirements so one backend can serve both platforms.

The document distinguishes **platform behavior** (what Play Integrity
provides), **profile requirements** (what a conforming enforcement
backend must implement), and **gaps**.

## 1. Conformance declaration

| Abstract concept | Device recall mapping |
|---|---|
| Device-mark platform | Google Play Integrity API, device recall feature |
| Mark scope (per interface vendor) | Recall values are per device **per app** (package name and its linked Google Cloud project) — vendor A's values are invisible to vendor B, matching Moderation.md §13 |
| `case-open` mark | `bitFirst` |
| `banned` mark | `bitSecond` |
| (reserved) | `bitThird` — must be left unset by this profile |
| Mark write path | Vendor backend → `deviceRecall.write`, authorized by the vendor's Cloud project credentials, targeting a device via a fresh integrity token |
| Mark read path | Integrity verdict requested by the app with device recall opted in; verdict's `deviceRecall.values` and `writeDates` |
| `deviceBinding` (mandate/verdict field) | An opaque vendor-local enrollment identifier; **not** derived from integrity tokens |
| Mark persistence | Recall values persist across app reinstallation and app-data clearing, per the feature's fraud-state design |

## 2. Ownership mapping

| Component | Owner | Holds |
|---|---|---|
| Android interface app | Interface vendor | Integrity token requests (with device recall opt-in); ban-state UX |
| Enforcement backend | Interface vendor | Google Cloud project credentials linked to the app; verdict validation; the write path |
| Play Integrity service | Google | Recall-value storage and device attestation; judges nothing |
| Moderation authority | Independent operator | Verdict signing keys; no Google credentials, no write path |

As on iOS, the platform's credential scoping is what physically routes
every mark write through the interface vendor, and the profile turns
that constraint into the contract's separation: the authority signs,
the vendor executes, Google stores.

## 3. Physical topology

```text
┌──────────────────────┐  integrity token request      ┌──────────────────────┐
│ Android interface app│  (deviceRecall opted in)      │ Enforcement backend  │
│ (device)             │──────────────────────────────>│ (interface vendor)   │
│ shows ban/appeal UX  │<──────────────────────────────│ Cloud project creds  │
└──────────────────────┘  proceed / refuse + verdict   └──────┬───────▲───────┘
                                              decrypt verdict │       │ signed
                                              + recall values │       │ Verdict
                                                              v       │
                                        ┌──────────────────────────┐  │
                                        │ playintegrity.googleapis │  │
                                        │ .com — token verdicts ·  │  │
                                        │ deviceRecall.write       │  │
                                        └──────────────────────────┘  │
                                                      ┌───────────────┴──────┐
                                                      │ Moderation authority │
                                                      │ (no Google access)   │
                                                      └──────────────────────┘
```

## 4. Value mapping

| Value | Abstract mark | Set when | Cleared when |
|---|---|---|---|
| `bitFirst` | `case-open` | Backend validates an interim verdict opening a case against this enrollment | Dismissal, superseding ban verdict, decision-deadline default, or reversal |
| `bitSecond` | `banned` | Backend validates a final ban verdict | `banExpires` passes, reversal verdict, or new-holder appeal verdict |
| `bitThird` | — | Never, under this profile version | — |

Profile requirements (shared with the DeviceCheck profile, restated as
normative here):

1. values change only inside verdict-execution and deadline/expiry
   code paths; no administrative, support, or store-pressure path may
   reach `deviceRecall.write`;
2. every write is logged against the authorizing verdict hash or
   expiry/deadline rule, and the log is auditable by the audit seat;
   and
3. `writeDates` are a consistency check, never an authorization or
   expiry source — real timing lives in the verdict.

## 5. Enrollment and the gate check

At onboarding (mandate signing) and thereafter at launch and at the
declared interval (default `P1D`):

1. the app requests an integrity token with device recall opted in and
   forwards it to the enforcement backend;
2. the backend decrypts/verifies the token verdict and reads
   `deviceRecall.values`;
3. `bitSecond` set → the backend returns the governing verdict
   reference; the app refuses to operate and displays the verdict,
   authority contact, expiry, and appeal path including the new-holder
   path (a silent brick is nonconforming);
4. `bitSecond` clear, `bitFirst` set → normal operation, with the open
   case displayed to the device holder; and
5. absent values (never written for this device/app pair) are the
   clean state, not an error.

The backend binds the enrollment to the mandate's `deviceBinding`
identifier at first verified token; integrity tokens are not stable
identifiers, and the binding stays a vendor-local record.

The linkage model of the DeviceCheck profile §5 applies verbatim:
**reading is stateless** (recall values are the sole state the refusal
consults, which is what survives reinstall), **writing and
reconciliation are session-mediated** (the identity-signature/token
pair presented in one session is the only token-to-enrollment linkage,
refreshed every session and restored when a mandated identity returns
after a reinstall), and a value-set device whose session identity
resolves no active verdict routes to the authority's
re-identification/new-holder procedure.

Reconciliation is lazy, exactly as in the DeviceCheck profile §6: the
backend reconciles stored verdict state (expiry, reversal, deadline
default) against recall values whenever a token is presented, and
writes corrections before answering the gate check. Stale values on a
device that never returns are inert because no conforming gate acts on
unreconciled state. The offline grace window (default `P3D`) and
gate-check-required degradation also apply unchanged.

## 6. Verdict execution

Identical to the DeviceCheck profile §6 with one platform difference:
`deviceRecall.write` requires a **fresh integrity token from the target
device**. A write against an absent device therefore always queues and
executes in the device's next session that presents a token together
with an identity the enrollment's mandate names; the `case-open` write
executes in the notice-service session. The identity refusal named in
the verdict applies at the backend immediately, so the queue delay
confers no access — and, as on iOS, a queued device-mark write can be
outrun by wiping the app before it lands (DeviceCheck profile §8),
which manifests must not conceal.

## 7. Error mapping

| Abstract error | Device recall condition | Backend behavior |
|---|---|---|
| `mark_write_failed` | Write rejected, token stale, API error | Queue for next token presentation; verdict remains valid; identity refusal in force |
| `verdict_invalid` | — (pre-platform) | Refuse execution; never call Google |
| Clean state | No recall values in verdict | Treat as all marks clear |
| Token unverifiable | Integrity verdict fails validation | Re-request token; repeated failure → gate-check-required state |
| No Play services / unlicensed environment | Token request fails on device | Gate-check-required state; never unmoderated operation |
| Rate limited | 429 | Backoff; serve last reconciled state within grace window |
| `new_holder_claim` | Holder asserts device transfer at ban UX | Route to authority's new-holder procedure; execute resulting reversal verdict normally |

## 8. Known gaps

1. **Feature maturity.** Device recall is a recent Play Integrity
   feature with opt-in requirements and evolving quotas; its terms,
   persistence guarantees, and availability must be re-verified against
   current Google documentation before any deployment claims
   conformance. In particular, behavior across **factory reset** is
   platform-defined and must be tested and disclosed, not assumed.
2. **Devices without Google Play services** (and Android builds
   distributed outside Play) cannot present integrity tokens; this
   profile fails them toward gate-check-required, which honestly means
   the sanction rail does not reach de-Googled Android. The abstract
   contract's scope statement 1 (interface-layer sanction, open
   protocol) already covers this; interface manifests must disclose
   it.
3. **Three values, coarse write dates.** As with DeviceCheck's two
   bits, all real state lives in the vendor backend; recall values are
   a cache of its conclusions, and `bitThird` stays reserved for a
   future profile version rather than becoming undocumented state.
4. **No third-party proof of faithful writes.** Google attests the
   device, not the vendor's honesty; the signed write log plus
   audit-seat attestation is the declared substitute, currently a paper
   control.
5. **Google is a silent party.** Project or developer-account
   termination, quota policy, or feature deprecation can orphan mark
   state outside this contract's lifecycle; the failure is
   safe-by-default (lost values read clean, gates reconcile against
   backend state) and the dependency must be disclosed.
6. **No Onym implementation exists yet.** Nothing in this profile is
   implemented behavior in any current Onym repository.

## 9. Conformance tests

Fixtures must cover: token verdict validation with and without recall
values; write authorization and quota backoff; verdict-to-value
execution for every disposition; queued writes against an absent
device and their execution at the next mandated-identity session;
identity-mediated re-linking after reinstall; routing of a value-set
device with an unresolvable session identity to re-identification;
lazy reconciliation (expiry, reversal, deadline default);
`bitThird` remaining untouched through every path; grace-window and
gate-check-required degradation including the no-Play-services case;
and new-holder progression.

## 10. Acceptance criteria

This profile is successfully implemented when:

1. a ban verdict against an enrolled device results in `bitSecond` set
   and the app refusing service with the full ban UX, using only the
   vendor's own Cloud project credentials;
2. reinstalling the app (or clearing its data) on the banned device
   restores the refusal from the recall values alone — the refusal
   decision consults no backend account state, though the vendor's
   verdict and enrollment records (sanction state under the interface
   contract's disclosed carve-out) exist and are consulted for
   reconciliation and appeal routing;
3. expiry, reversal, and deadline defaults clear values with nothing
   beyond the passage of time and one token presentation;
4. no code path outside verdict execution and reconciliation can reach
   `deviceRecall.write`, and the write log accounts for every call;
   and
5. one enforcement backend serves this profile and the DeviceCheck
   profile with a shared verdict-validation core, and a second vendor
   can implement both without coordination with the first.

## References

1. Onym moderation contract boundary: [Moderation.md](Moderation.md)
2. Sibling iOS profile:
   [Moderation-DeviceCheck.md](Moderation-DeviceCheck.md)
3. Google Play Integrity device recall:
   <https://developer.android.com/google/play/integrity/device-recall>
4. Play Integrity API overview:
   <https://developer.android.com/google/play/integrity/overview>
5. Onym audit seat (write-log attestation):
   [../audit/Audit.md](../audit/Audit.md)
