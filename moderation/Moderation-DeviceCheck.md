---
status: draft
proposed: Claude & @rinat-enikeev
date: 08.08.2026
---

# Onym Moderation ↔ Device Mark: Apple DeviceCheck Implementation

**Implementation profile draft 0.2 — August 2026**

> This profile maps the abstract device-mark rail onto Apple DeviceCheck:
> two per-device bits scoped to the interface vendor's Apple developer
> account, written and read server-side, surviving app reinstallation.

This document is a concrete implementation of
[Moderation.md](Moderation.md) §5.7 (device marks and enforcement
binding). The abstract contract remains authoritative for mandates, reports,
cases, verdicts, obligations, and invariants. The merged
[`onym-moderation` main](https://github.com/onymchat/onym-moderation/tree/9a5f50a80d58e7093f407a0a141c6358691ce74c)
defines the concrete v1 Rust wire and implemented lifecycle. This document
defines the Apple platform mapping and records where that implementation falls
short of the abstract rail.

The document distinguishes:

- **platform behavior**, which Apple's DeviceCheck service provides;
- **profile requirements**, which a conforming interface vendor's
  enforcement backend must implement; and
- **gaps**, where the platform or current code cannot yet meet the
  abstract contract and a declared mitigation applies.

The current Onym iOS implementation is a **client-side conformance
slice**, not a deployed DeviceCheck enforcement system. It implements the
domain objects, authenticated consent boundary, backend protocol, device
token provider, verdict validator, gate state machine, persistence seams,
and honest development stub described in §9. It does not yet include the
vendor backend inside the app repository. The merged Rust service implements
the `.p8`-holding backend, DeviceCheck reads and writes, countersigning, verdict
receipt, reconciliation, and audit log, but is reference code with no
production deployment or credentials.

## 1. Conformance declaration

| Abstract concept | DeviceCheck mapping |
|---|---|
| Enforcement profile | `onym:moderation-enforcement-profile:device-mark-v1`, version 1 |
| Gate notice schema | `onym-moderation-case-notice-v1` |
| Device-mark platform | Apple DeviceCheck service |
| Mark scope (per interface vendor) | Bits are per device **per Apple developer account** — vendor A's bits are invisible to vendor B, matching Moderation.md §13 |
| `case-open` mark | `bit0` |
| `banned` mark | `bit1` |
| Mark write path | Vendor backend → `update_two_bits`, authenticated by the vendor's DeviceCheck key |
| Mark read path | Vendor backend → `query_two_bits` |
| `deviceBinding` (mandate/verdict field) | An opaque vendor-local identifier for the enrollment; **not** the DeviceCheck token (tokens are ephemeral and unlinkable by design) |
| Device attestation of "this app on this device" | `DCDevice.generateToken()` on the device, validated by Apple when the backend calls the API |
| Mark persistence | Bits persist across app reinstallation as documented platform behavior; persistence across device erase and restore paths is Apple's fraud-state design intent and must be verified and disclosed per deployment (§8) |

The account scope is broader than one app. To preserve the abstract contract's
exclusive interface-vendor write boundary, a conforming deployment must either
dedicate its Apple developer account to interfaces that share this exact bit
contract or prove that no sibling app or backend in the account can write the
bits. An App ID does not supply a separate moderation-bit namespace.

## 2. Ownership mapping

| Component | Owner | Holds |
|---|---|---|
| iOS interface app | Interface vendor | `DCDevice` token generation; ban-state UX (verdict reference, appeal path) |
| Enforcement backend | Interface vendor | Apple DeviceCheck private key (`.p8`), key ID, team ID; verdict validation; the mark write path |
| DeviceCheck service | Apple | Bit storage and device-token validation; judges nothing |
| Moderation authority | Independent operator | Verdict signing keys; no Apple credentials, no write path |

The Apple developer account credentials are the physical reason the
abstract contract routes all mark writes through the interface vendor:
parties outside that account cannot write. The profile turns that constraint
into the separation-of-powers the contract requires — the authority signs,
the vendor executes, Apple stores — while the account-isolation rule above
prevents a sibling app from becoming an undeclared write path.

## 3. Physical topology

```text
┌──────────────────────┐   DCDevice.generateToken()   ┌──────────────────────┐
│ iOS interface app    │─────────────────────────────>│ Enforcement backend  │
│ (device)             │   ephemeral device token     │ (interface vendor)   │
│ shows ban/appeal UX  │<─────────────────────────────│ holds .p8 key        │
└──────────────────────┘   proceed / refuse + verdict └──────┬───────▲───────┘
                                              signed Verdict │       │ signed
                                              executed here  │       │ Verdict
                                                             v       │
                                       ┌──────────────────────────┐  │
                                       │ api.devicecheck.apple.com│  │
                                       │ query_two_bits           │  │
                                       │ update_two_bits          │  │
                                       └──────────────────────────┘  │
                                                     ┌───────────────┴──────┐
                                                     │ Moderation authority │
                                                     │ (no Apple access)    │
                                                     └──────────────────────┘
```

## 4. Bit mapping

| Bit | Abstract mark | Set when | Cleared when |
|---|---|---|---|
| `bit0` | `case-open` | Backend validates an interim verdict opening a case against this device's enrollment | Dismissal, superseding ban, decision-deadline default, or designation revocation |
| `bit1` | `banned` | Backend validates a ban verdict whose `executeAfter` has arrived; a non-suspensive ban may execute before `final` becomes true | `banExpires`, reversal/new-holder remedy, or designation revocation where no forum survives |

Profile requirements:

1. bits change **only** inside verdict execution and declared
   deadline/expiry/revocation reconciliation; no
   administrative tool, support desk, sibling-app backend, or store-pressure
   path may touch `update_two_bits` (Moderation.md §8, interface obligation 6);
2. every `update_two_bits` call is logged against the verdict hash (or
   the expiry/deadline/revocation rule) that authorized it, and the log is
   auditable by the audit seat — this is the profile's substitute for a
   platform-level proof that the vendor wrote faithfully; and
3. `last_update_time` (returned by Apple at `YYYY-MM` granularity) is
   treated as a consistency check only, never as an authorization or
   expiry source — real timing lives in the verdict.

## 5. Enrollment and the gate check

### 5.1 Reviewed terms and enrollment

Consent is one transaction with a pause for human review, not two
manifest fetches:

1. the client asks its moderation repository for
   `manifestForReview(listing)`;
2. inside that repository boundary, the authority-directory key is
   pinned, the exact manifest bytes and detached signature are fetched,
   the signature and directory bindings are evaluated, the consent-time
   conditions are validated, and the hash is computed. A conforming build
   rejects failed authenticity checks; the current soft-enforcement caveat
   is recorded in §8.9;
3. the repository returns an opaque `ReviewedManifest`. Its initializer
   is not public, so application code can display its decoded manifest and
   hash but cannot manufacture the value accepted by signing or pair one
   manifest's decoded fields with another manifest's raw bytes; and
4. after agreement, `consent(to:reviewedManifest:)` consumes that same
   value, re-runs the time-sensitive validity conditions, and never
   refetches. The mandate's classes, `manifestHash`, and persisted manifest
   bytes therefore come from exactly what the user reviewed.

The device enrollment then proceeds:

1. the app calls `DCDevice.generateToken()` when DeviceCheck is supported;
   it sends `nil` when attestation is unavailable and never fabricates a
   token;
2. it sends an `EnrollmentRequest` containing the optional token,
   `userKey`, UTC timestamp, and the user's signature over those same
   transmitted fields;
3. the backend validates the session signature, freshness, and token,
   calls `query_two_bits` as required, and returns an opaque vendor-local
   `deviceBinding`;
4. the client builds and signs the mandate from its retained reviewed
   artifact and that binding;
5. the backend returns only its detached countersignature. The client
   appends that signature to its own mandate, so the countersigning
   round-trip cannot replace authority, classes, hash, user, or binding; and
6. the interface registers the exact finalized two-signature mandate with the named
   authority as Moderation.md §6.2 requires. Registration is idempotent by
   `mandateRef`; failure leaves authority enrollment incomplete. The signed
   consent artifact remains immutable, but the gate must fail closed and the
   interface must retry rather than pretending the authority has jurisdiction.

These steps bind the abstract operation names as follows: steps 1–3 are
`enroll-device`, steps 4–5 are `countersign-mandate`, and step 6 is
`register-mandate`. The gate flow below is `gate-check`. Signed interim and
terminal verdicts enter this backend through `deliver-verdict`, after which
the gate returns `CaseNotice` or ban state to the app. The first three
operations belong to the interface-enforcement profile; registration and
delivery are the two cross-owner facets of the authority profile.

The current iOS session-signing form is provisional until the backend wire
contract is fixed. Each field is prefixed with a big-endian 32-bit byte
length. Enrollment uses the domain string
`onym-moderation-enroll-v1`; gate checks use
`onym-moderation-gate-v1` and additionally cover `mandateRef`. Both cover
the user key and UTC ISO-8601 timestamp. The different domains prevent an
enrollment signature from being replayed as a gate-check signature, and
including every transmitted signed field lets the backend reconstruct the
payload it verifies.

### 5.2 Gate checks

At launch, on foreground, on explicit retry, and at least once per the
declared interval while the app runs:

1. the client sends a `GateCheckRequest` containing a fresh optional
   device token, user key, active `mandateRef`, timestamp, and session
   signature;
2. the backend calls `query_two_bits` (ES256 JWT from the `.p8` key;
   `device_token`, fresh `transaction_id`, `timestamp`) and reconciles the
   bit state with its verdict records;
3. `bit1` set → it returns `banned` with the governing verdict reference
   and full display state; the app refuses to operate and displays the
   authority contact, expiry, ordinary appeal, and new-holder path (a
   silent brick is nonconforming);
4. `bit1` clear, `bit0` set → it returns `caseOpen` with notices; the app
   operates normally and displays the open case (procedural state, no
   service degradation);
5. both bits clear, including Apple's "bit state not found" response → it
   returns `clear`; and
6. an invalid or unavailable attestation, unresolved holder, exhausted
   offline grace, or otherwise untrustworthy answer → it returns or the
   client derives `checkRequired`, which blocks operation.

No active mandate is not an operational answer: it routes to the consent
gate. Losing local mandate storage must therefore lead to re-consent and
an immediate fresh bit check, never past the gate into an unmoderated app.

The backend associates the enrollment with the mandate's
`deviceBinding` identifier at first token validation. DeviceCheck
tokens are ephemeral and cannot serve as identifiers; the binding is a
vendor-local record, which keeps the abstract contract's promise that
no global device identifier is created.

Because tokens are unlinkable, the profile is explicit about what needs
linkage and what does not:

- **Reading is stateless.** The bits are the sole state the refusal
  decision consults: any fresh token can be queried, and a set `bit1`
  refuses service regardless of whether the backend can resolve the
  enrollment. This is what survives reinstall.
- **Writing and reconciliation are session-mediated.** Every gate check
  runs inside a session authenticated by an identity key (mandate
  signing, launch, notice delivery). The (identity signature, device
  token) pair presented together in one session is the only
  token-to-enrollment linkage, and it is refreshed at every session —
  including the first session after a reinstall, when the user restores
  a mandated identity. The backend never links a token to an enrollment
  any other way.
- **Unresolvable state routes to re-identification.** A device whose
  bits are set but whose session identity resolves to no active verdict
  (fresh identity after a wipe, or a new device holder) is shown the
  re-identification path: the ban UX displays the governing verdict
  when the session resolves one, and otherwise the authority's
  new-holder/re-identification procedure, whose outcome is a reversal
  verdict (clearing the bits) or a confirmation that names the holder's
  session identity and restores linkage.

Profile requirement — offline and gate-evasion window: the gate check
runs at launch and at least once per declared interval (default `P1D`)
while the app runs. A device that cannot reach the backend operates on
its last known state for a declared grace window (default `P3D`), then
degrades to gate-check-required. The verdict's identity refusal applies
at the backend regardless, so a banned identity gains nothing from
keeping the app offline.

The iOS gate repository persists the last successful result and its wall
clock time. An unreachable backend within grace serves that last result;
no history, expired grace, or a clock earlier than the last success blocks
with `neverChecked`, `offlineGraceExpired`, or `clockRollback`
respectively. Concurrent checks carry a monotonically increasing
generation so a stale slow `clear` cannot overwrite a newer `banned`
answer. Its internal interval loop re-anchors to wall-clock deadlines;
the application composition must still call `checkNow()` on foreground,
because iOS may suspend the loop.

## 6. Verdict execution

On receiving a verdict from the designated authority, the backend:

1. validates shape per Moderation.md §5.6 — authority signature against
   the operator key in the mandate's exact consented manifest; consented
   manifest hash, authority, mandate reference, accused user,
   `deviceBinding`, and class bindings; mandatory reasoning; marks and
   fields consistent with the disposition; `appealDeadline` equal to
   `decidedAt + appealWindow`; `executeAfter` consistent with the
   consented appeal effect; and `banExpires` equal to
   `executeAfter + banTerm` for duration classes or absent for permanent
   classes;
2. resolves `deviceBinding` to the enrollment; if the device has no
   live session, the write is queued and executes in the next session
   that presents a token together with an identity the enrollment's
   mandate names (`mark_write_failed` semantics: retry, with the
   identity refusal already in force at the backend). The `case-open`
   write has a natural execution point: notice service (Moderation.md
   §5.5) requires a connected session of the accused, and the write
   executes in that session;
3. calls `update_two_bits` with the target bit state; and
4. stores enough state to reconcile `banExpires`, dismissal/reversal,
   decision-deadline default, and designation revocation. The merged reference
   currently implements only expiry plus delivered verdicts; §8 records the
   missing independent defaults.

**Merged-reference gap.** Authority-signature failure is enforced only when
the deployment enables the reference service's signature-enforcement switch;
it defaults off. This deployment setting does not weaken requirement 1.

Clearing on expiry, a delivered dismissal/reversal, or another declared default
requires a live device token, which the banned app cannot always supply (the
user may have deleted it). Profile requirement: the backend clears bits
**lazily** — the next time any app install on that device presents a token, the
backend reconciles verdict state before answering the gate check. Resolution is
session-mediated (§5): when the session's identity resolves the enrollment, a
conforming backend applies expiry, later dismissal/reversal, and
deadline/revocation defaults directly; when it resolves nothing, the reference
returns `checkRequired(reidentificationRequired)`. No implemented
re-identification flow turns that state into a reversal or restored linkage. A
device that never returns keeps stale bits in Apple's storage, but no conforming
gate ever acts on them without reconciliation, so the stale state is inert.

The iOS package provides this validation as a pure `VerdictValidator`
returning either `execute` or `storeUntilExecuteAfter`. It compares
derived timestamps with one second of serialization tolerance. Client
integration must invoke it before rendering a returned verdict as
legitimate; the validator is not the mark executor, and the Rust reference
backend performs the same checks before every Apple write.

## 7. Error mapping

| Abstract error | DeviceCheck condition | Backend behavior |
|---|---|---|
| `mark_write_failed` | 4xx/5xx from `update_two_bits`, token rejected | Retry with fresh token on next presentation; verdict remains valid; identity refusal in force |
| `verdict_invalid` | — (pre-platform) | Refuse execution; never call Apple |
| Clean state | 200 "bit state not found" on query | Treat as both marks clear |
| Token invalid | `validate_device_token` failure / 401 on query | Re-request token from app; repeated failure → gate-check-required state |
| Rate limited | 429 | Backoff; gate checks serve last reconciled state within grace window |
| `new_holder_claim` | Holder asserts device transfer | No iOS transport is wired; the reference Authority always acknowledges, optionally records against a ban, and a moderator may later issue a reversal |

## 8. Known gaps

1. **The bits survive the person.** DeviceCheck state persists across
   device resale and hand-me-downs by design. The abstract contract's
   new-holder claim is the mitigation, but the reference endpoint cannot
   authenticate ownership and its eight storage slots are exhaustible. It also
   depends on the new holder encountering the ban UX and acting; a friendlier
   detection
   heuristic (e.g., fresh mandate signature from an unrelated identity
   on a banned device fast-tracks the new-holder path) is a profile
   requirement not yet implemented anywhere.
2. **Two bits, month-granular timestamp.** The platform cannot store
   verdict references, expiries, or class information; all real state
   lives in the vendor backend, and the bits are a cache of its
   conclusions. A vendor that loses its verdict database cannot
   reconstruct meaning from Apple's bits alone; backup obligations
   belong to the interface's own contract.
3. **No third-party proof of faithful writes.** Apple attests the
   device, not the vendor's honesty. The signed write log (§4) plus
   audit-seat attestation is the declared substitute; until an auditor
   actually attests a deployed backend, this is a paper control.
4. **Apple is a silent party.** Developer-account termination or
   DeviceCheck service changes can erase or orphan mark state outside
   this contract's lifecycle. The failure is safe-by-default (lost bits
   read as clean, and gates reconcile against backend state), but the
   dependency must be disclosed in the interface's manifest.
5. **Simulator and enterprise-signed builds** have no DeviceCheck
   support; conforming builds must fail toward gate-check-required, not
   toward unmoderated operation.
6. **A queued ban write can be outrun.** A ban verdict against a device
   with no live session executes only when a mandated identity next
   authenticates from it (§6). A user who wipes the app before the
   write lands and never again presents a mandated identity from that
   device keeps its bits clean; the identity refusal at the backend
   still holds for the named keys, so what escapes is the device mark,
   not access under the banned identity. This is the honest cost of
   unlinkable tokens, and manifests must not claim device marking is
   unconditional.
7. **Reset persistence is asserted, not yet tested.** Apple documents
   the bits as per-device fraud state; whether they survive every
   erase and restore path (full device wipe, migration to a
   replacement device, refurbishment) has not been verified by this
   project. Conformance testing must exercise these paths and the
   deployment must disclose the result — the same caveat the Android
   sibling carries for factory reset
   ([Moderation-Device-Recall.md](Moderation-Device-Recall.md) §8.4).
   Until verified, no manifest may present reset survival as
   unconditional; the abstract contract's evasion-cost rationale
   (Moderation.md §3.3) is stated with the same qualification.
8. **The backend is reference code, not a production deployment.** The current
   iOS code stops at `EnforcementBackendClient` and ships an honest stub. Merged
   `onym-moderation` implements the Rust network service, DeviceCheck calls, countersigning,
   lazy reconciliation, and write log, but no deployed Onym service currently
   holds production DeviceCheck credentials. The
   stub's `clear` response to a nil token is a development-only exception;
   a real backend must return gate-check-required.
9. **Cryptographic enforcement and client transport remain provisional.** The
   iOS package implements detached authority-directory and manifest
   verification plus verdict verification, but the relevant enforcement
   switches remain off, and the Rust backend likewise defaults authority
   verdict-signature enforcement off. The merged reference fixes the current Rust HTTP shapes
   and UTF-8-byte-order canonical JSON form, but the Swift authority client has
   no network transport and its report signing must use the same ordering.
   Turning enforcement on requires real keys plus cross-language fixtures.
10. **Ban recourse is not wired end to end.** The abstract contract requires
    the gate to display working ordinary-appeal and new-holder paths. The Rust
    `BanState` has `appealUrl` and `newHolderUrl`, but the merged Apple backend
    leaves both absent, and the iOS client has no Authority transport. A ban
    screen without usable recourse remains nonconforming.
11. **Authority-failure defaults are missing.** The Rust Interface clears
    `case-open` only after the Authority sweep delivers a dismissal and has no
    designation-revocation or successor-forum state. Permanent Authority
    disappearance can therefore strand a procedural mark, contrary to the
    abstract deadline and revocation requirements.

## 9. Current Onym iOS implementation

The `OnymModeration` package introduced by
[onym-ios PR #216](https://github.com/onymchat/onym-ios/pull/216) maps the
abstract contract to the following client components. The authority-client
claims below are directly checkable in
[`ModerationAuthorityClient.swift`](https://github.com/onymchat/onym-ios/blob/87d5b62e8ebaeeb5aa623e4eaed41c038c8c695a/Packages/OnymModeration/Sources/OnymModeration/ModerationAuthorityClient.swift),
and the gate result in
[`EnforcementBackendClient.swift`](https://github.com/onymchat/onym-ios/blob/87d5b62e8ebaeeb5aa623e4eaed41c038c8c695a/Packages/OnymModeration/Sources/OnymModeration/EnforcementBackendClient.swift):

| Contract/profile responsibility | Current iOS status |
|---|---|
| Authority designation | `KnownAuthoritiesFetcher` with signed-asset verification for the interface's authority directory |
| Manifest authenticity | Exact-byte fetch and SHA-256 pin; directory/manifest component and operator-key binding; detached Ed25519 verification path, currently in soft-enforcement mode |
| Consent transaction | Repository-minted `ReviewedManifest`; the signer accepts the retained artifact and cannot refetch or accept a caller-built `SignedManifest` |
| Consent-time constraints | Expiry, supported profile ID, mandatory new-holder procedure, and parsed external appellate for permanent classes |
| Mandate lifecycle | One identity-device mandate, user signature, signature-only countersigning response, exact manifest snapshot persistence, immutable history on authority switch |
| Device attestation | `DCDevice.generateToken()` provider seam; nil represents unsupported attestation and is never fabricated into a token |
| Backend boundary | Typed enrollment, countersignature, and gate-check protocol; the iOS package still uses a development stub, while merged `onym-moderation` supplies a separate Rust reference backend |
| Gate behavior | Launch/interval state machine, persisted last-known result, P3D grace, fail-closed clock rollback, stale-completion guard, and blocking `checkRequired` reasons |
| Verdict handling | Domain objects and mechanical validator for mandate/manifest bindings, marks, appeal timing, execution timing, and consented ban duration |
| Authority client boundary | `ModerationAuthorityClient` exposes `fileReport`, `respond` (including additional evidence), `appeal` (ordinary or new-holder), and `queryStatus`; typed request/result objects and an honest throwing stub exist, but no endpoint resolution or network transport does |
| Authority outbound delivery | `GateCheckResult.caseOpen` carries `CaseNotice` values and `.banned` carries ban/verdict display state from the interface backend; the authority has no client-side mark-write method |
| Mandate registration | Missing: the client appends and persists the interface countersignature but exposes no path that registers the finalized mandate with the named authority |
| Authority reference service | [Merged `onym-moderation` main](https://github.com/onymchat/onym-moderation/tree/9a5f50a80d58e7093f407a0a141c6358691ce74c) defines the concrete v1 request/response shapes and exposes mandate registration, the four client operations, local-model triage, moderator review, verdict delivery, and a DeviceCheck backend; it remains undeployed |
| App composition | Package is linked but PR #216 does not wire onboarding, foreground checks, root gating, or ban/case UI; those integrations belong to later stack layers |
| Authority service and Apple writes | Merged PRs #2 and #4 implement the Authority, triage/review, reconciliation, write log, and `update_two_bits` path; no production deployment exists, verdict-signature enforcement defaults off, external appellate routing is absent, and the iOS app does not call mandate registration |

The iOS reviewed-manifest path is stricter than the v1 Rust reference: it
requires a new-holder procedure and parses an external appellate for permanent
classes. The merged Rust reference treats both manifest fields as optional metadata. Authority
startup validates the five per-class terms, while the Apple service validates
mandate, manifest-hash, class, and verdict bindings; neither rejects a permanent
class because `appellate` is absent, malformed, or names the issuing authority.
The Authority records local appeals but does not route them to an external
component. Those iOS checks implement the abstract contract; the merged Rust
services' failure to repeat or route them is a documented conformance gap.

This table is descriptive and deliberately narrower than the profile's
acceptance criteria. A package or stub passing local tests is not evidence
that Apple state is durable, that a backend writes faithfully, or that a
real authority follows the abstract procedure.

## 10. Conformance tests

Fixtures must cover: JWT construction and key rotation against Apple's
development endpoint; query/update round-trip including the
"bit state not found" clean state; verdict-to-bit execution for every
disposition; lazy reconciliation (expiry passed while device absent, later
dismissal/reversal, decision default, and revocation); queued writes on token absence and their
execution at the next mandated-identity session; identity-mediated
re-linking after reinstall; routing of a bit-set device with an
unresolvable session identity to re-identification; grace-window and
gate-check-required degradation; developer-account sibling-app write
isolation; and the bounded, indistinguishable unauthenticated new-holder-claim
responses implemented by the reference Authority.

## 11. Acceptance criteria

This profile is successfully implemented when:

1. a ban verdict against an enrolled device results in `bit1` set and
   the app refusing service with the full ban UX, using only the
   vendor's DeviceCheck credentials;
2. deleting and reinstalling the app on the banned device restores the
   refusal from the bits alone — the refusal decision consults no
   backend account state, though the vendor's verdict and enrollment
   records (sanction state under the interface contract's disclosed
   carve-out) exist and are consulted for reconciliation and appeal
   routing;
3. expiry, dismissal/reversal, decision-deadline default, and applicable
   revocation clear marks without authority or user discretion beyond a token
   presentation;
4. no code path outside verdict execution and reconciliation — including a
   sibling app or its backend — can reach `update_two_bits`, and the write log
   accounts for every call; and
5. a second interface vendor can implement this profile against its own
   Apple account without any coordination with the first, and neither
   can read or write the other's bits.

## References

1. Onym moderation contract boundary: [Moderation.md](Moderation.md)
2. Apple DeviceCheck documentation:
   <https://developer.apple.com/documentation/devicecheck>
3. Accessing and modifying per-device data:
   <https://developer.apple.com/documentation/devicecheck/accessing-and-modifying-per-device-data>
4. Onym audit seat (write-log attestation):
   [../audit/Audit.md](../audit/Audit.md)
5. Current Onym iOS client implementation:
   [onym-ios PR #216](https://github.com/onymchat/onym-ios/pull/216)
