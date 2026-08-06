---
status: draft
proposed: Claude & @rinat-enikeev
date: 06.08.2026
---

# Onym Moderation ↔ Device Mark: Apple DeviceCheck Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the abstract device-mark rail onto Apple DeviceCheck:
> two per-device bits scoped to the interface vendor's Apple developer
> account, written and read server-side, surviving app reinstallation.

This document is a concrete implementation of
[Moderation.md](Moderation.md) §5.7 (device marks and enforcement
binding). The abstract contract remains authoritative for mandates,
reports, cases, verdicts, obligations, and invariants. This document
defines only the Apple platform mapping and records where it falls short
of the abstract rail.

The document distinguishes:

- **platform behavior**, which Apple's DeviceCheck service provides;
- **profile requirements**, which a conforming interface vendor's
  enforcement backend must implement; and
- **gaps**, where the platform or current code cannot yet meet the
  abstract contract and a declared mitigation applies.

## 1. Conformance declaration

| Abstract concept | DeviceCheck mapping |
|---|---|
| Device-mark platform | Apple DeviceCheck service |
| Mark scope (per interface vendor) | Bits are per device **per Apple developer account** — vendor A's bits are invisible to vendor B, matching Moderation.md §13 |
| `case-open` mark | `bit0` |
| `banned` mark | `bit1` |
| Mark write path | Vendor backend → `update_two_bits`, authenticated by the vendor's DeviceCheck key |
| Mark read path | Vendor backend → `query_two_bits` |
| `deviceBinding` (mandate/verdict field) | An opaque vendor-local identifier for the enrollment; **not** the DeviceCheck token (tokens are ephemeral and unlinkable by design) |
| Device attestation of "this app on this device" | `DCDevice.generateToken()` on the device, validated by Apple when the backend calls the API |
| Mark persistence | Bits persist across app reinstallation and device state resets, per Apple's fraud-state design |

## 2. Ownership mapping

| Component | Owner | Holds |
|---|---|---|
| iOS interface app | Interface vendor | `DCDevice` token generation; ban-state UX (verdict reference, appeal path) |
| Enforcement backend | Interface vendor | Apple DeviceCheck private key (`.p8`), key ID, team ID; verdict validation; the mark write path |
| DeviceCheck service | Apple | Bit storage and device-token validation; judges nothing |
| Moderation authority | Independent operator | Verdict signing keys; no Apple credentials, no write path |

The Apple developer account credentials are the physical reason the
abstract contract routes all mark writes through the interface: nobody
else *can* write. The profile turns that constraint into the
separation-of-powers the contract requires — the authority signs, the
vendor executes, Apple stores.

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
| `bit0` | `case-open` | Backend validates an interim verdict opening a case against this device's enrollment | Dismissal verdict, superseding ban verdict, decision-deadline default, or reversal |
| `bit1` | `banned` | Backend validates a final ban verdict | `banExpires` passes, reversal verdict, or new-holder appeal verdict |

Profile requirements:

1. bits change **only** inside the verdict-execution and
   deadline/expiry code paths of the enforcement backend; no
   administrative tool, support desk, or store-pressure path may touch
   `update_two_bits` (Moderation.md §8, interface obligation 6);
2. every `update_two_bits` call is logged against the verdict hash (or
   the expiry/deadline rule) that authorized it, and the log is
   auditable by the audit seat — this is the profile's substitute for a
   platform-level proof that the vendor wrote faithfully; and
3. `last_update_time` (returned by Apple at `YYYY-MM` granularity) is
   treated as a consistency check only, never as an authorization or
   expiry source — real timing lives in the verdict.

## 5. Enrollment and the gate check

At onboarding (mandate signing) and thereafter at app launch:

1. the app calls `DCDevice.generateToken()` and sends the token with
   its session context to the enforcement backend;
2. the backend calls `query_two_bits` (ES256 JWT from the `.p8` key;
   `device_token`, fresh `transaction_id`, `timestamp`);
3. `bit1` set → the backend returns the governing verdict reference;
   the app refuses to operate and displays the verdict, authority
   contact, expiry, and appeal path — including the new-holder path
   (a silent brick is nonconforming);
4. `bit1` clear, `bit0` set → the app operates normally and displays
   the open case to the device holder (procedural state, no service
   degradation); and
5. Apple's "bit state not found" response (bits never set for this
   device/account pair) is the clean state, not an error.

The backend associates the enrollment with the mandate's
`deviceBinding` identifier at first token validation. DeviceCheck
tokens are ephemeral and cannot serve as identifiers; the binding is a
vendor-local record, which keeps the abstract contract's promise that
no global device identifier is created.

Profile requirement — offline and gate-evasion window: the gate check
runs at launch and at least once per declared interval (default `P1D`)
while the app runs. A device that cannot reach the backend operates on
its last known state for a declared grace window (default `P3D`), then
degrades to gate-check-required. The verdict's identity refusal applies
at the backend regardless, so a banned identity gains nothing from
keeping the app offline.

## 6. Verdict execution

On receiving a verdict from the designated authority, the backend:

1. validates shape per Moderation.md §5.6 — authority signature against
   the designation, mandate reference to a mandate this vendor
   countersigned, class within mandate, marks consistent with
   disposition, `banExpires` present unless the consented class term is
   `permanent`;
2. resolves `deviceBinding` to the enrollment; if the device has not
   presented a token recently, the write is queued and executes on the
   next token presentation (`mark_write_failed` semantics: retry, with
   identity refusal already in force at the backend);
3. calls `update_two_bits` with the target bit state; and
4. schedules the clearing action the verdict itself authorizes:
   `banExpires` → clear `bit1`; decision deadline with no verdict →
   clear `bit0` and record the dismissal default.

Clearing on expiry or deadline default requires a live device token,
which the banned app cannot always supply (the user may have deleted
it). Profile requirement: the backend clears bits **lazily** — the next
time any app install on that device presents a token, the backend
reconciles stored verdict state (expiry passed, reversal recorded,
deadline default) before answering the gate check. A device that never
returns keeps stale bits in Apple's storage, but no conforming gate
ever acts on them without reconciliation, so the stale state is inert.

## 7. Error mapping

| Abstract error | DeviceCheck condition | Backend behavior |
|---|---|---|
| `mark_write_failed` | 4xx/5xx from `update_two_bits`, token rejected | Retry with fresh token on next presentation; verdict remains valid; identity refusal in force |
| `verdict_invalid` | — (pre-platform) | Refuse execution; never call Apple |
| Clean state | 200 "bit state not found" on query | Treat as both marks clear |
| Token invalid | `validate_device_token` failure / 401 on query | Re-request token from app; repeated failure → gate-check-required state |
| Rate limited | 429 | Backoff; gate checks serve last reconciled state within grace window |
| `new_holder_claim` | Holder asserts device transfer at ban UX | Route to authority's new-holder procedure; backend executes the resulting reversal verdict like any other |

## 8. Known gaps

1. **The bits survive the person.** DeviceCheck state persists across
   device resale and hand-me-downs by design. The abstract contract's
   new-holder appeal is the mitigation, but it depends on the new
   holder encountering the ban UX and acting; a friendlier detection
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
6. **No Onym implementation exists yet.** No current Onym repository
   implements any part of this profile; everything above is profile
   requirement, none of it is implemented behavior.

## 9. Conformance tests

Fixtures must cover: JWT construction and key rotation against Apple's
development endpoint; query/update round-trip including the
"bit state not found" clean state; verdict-to-bit execution for every
disposition; lazy reconciliation (expiry passed while device absent,
deadline default, reversal); queued writes on token absence; grace-
window and gate-check-required degradation; and new-holder fast-track
progression.

## 10. Acceptance criteria

This profile is successfully implemented when:

1. a ban verdict against an enrolled device results in `bit1` set and
   the app refusing service with the full ban UX, using only the
   vendor's DeviceCheck credentials;
2. deleting and reinstalling the app on the banned device restores the
   refusal without any backend account state for the user;
3. expiry, reversal, and deadline defaults clear marks with no action
   by the authority or the user beyond the passage of time and one
   token presentation;
4. no code path outside verdict execution and reconciliation can reach
   `update_two_bits`, and the write log accounts for every call; and
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
