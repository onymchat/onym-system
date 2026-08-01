---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym UI ↔ Message: Nostr Implementation

**Implementation profile draft 0.1 — August 2026**

> This profile maps the technology-neutral Onym message boundary onto Nostr
> events, WebSocket relays, scoped NIP-42 authentication, and Onym-specific
> topic and inbox conventions.

This document is a concrete implementation of
[UI-Message.md](UI-Message.md). The abstract specification remains
authoritative for UI-facing operations, delivery meaning, receipts, errors,
ownership, and payment isolation. This document defines the Nostr wire
mapping and records where the present iOS, Android, and reference-relay code
does not yet implement the complete boundary.

The document distinguishes:

- **implemented behavior**, which exists in the current Onym repositories;
- **profile requirements**, which are required for a conforming Nostr adapter
  or relay; and
- **gaps**, where current code still needs to converge on the profile.

## 1. Conformance declaration

| Abstract concept | Nostr mapping |
|---|---|
| Courier endpoint | One Nostr relay reached over `wss://` |
| Courier component | Signed relay `ServiceManifest` plus operator identity |
| Topic address | Opaque value in a `t` tag |
| Inbox address | Opaque value in `d`, `t`, and Onym compatibility tags |
| Wire item | NIP-01 event carrying base64 opaque bytes in `content` |
| Outer integrity | NIP-01 event ID and BIP-340 Schnorr signature |
| Transport message ID | Nostr event `id` |
| Publish | Client `EVENT` frame |
| Explicit acceptance | Relay `OK` with `true` |
| Subscription | Client `REQ`; relay `EVENT` and `EOSE`; client `CLOSE` |
| Subscription refusal | Relay `CLOSED` |
| Access authentication | NIP-42 `AUTH` using a relay-scoped seat key |
| Paid-service refusal | HTTP 402 before upgrade or Onym `payment-required:` reason after upgrade |

The implementation profile identifier is:

```text
onym:message-implementation:nostr-courier-v1
```

It maps this portable profile:

```text
onym:message-profile:opaque-topic-inbox-v1
```

The event kinds, tags, legacy receive paths, millisecond tag, payment reason,
and ephemeral-key policy are Onym conventions. They are not implied by generic
Nostr support. An adapter claims this implementation profile rather than
inferring compatibility from a `wss://` URI.

## 2. Ownership mapping

- The **application-protocol author** defines and authenticates the encrypted
  bytes placed in event `content`.
- The **Nostr adapter author** maps the abstract port to events, filters,
  frames, acknowledgements, refusal codes, and reconnect behavior.
- The **relay operator** controls availability, limits, retention, moderation,
  access policy, offers, and settlement terms.
- The **billing broker** validates channel purchases and issues or registers a
  component-scoped entitlement; it does not validate chat messages.
- The **UI publisher** presents relay selection and compatible offers without
  becoming the relay operator or group authority.
- The **user or group** chooses one or more relay components and owns the
  resulting route.

One party may occupy several seats, but the profile does not merge their
authority. A relay's outer event checks do not authorize the inner sender, and
an app-store purchase does not authorize a group action.

## 3. Physical topology

```text
UI flow / repository
  |-- application crypto: authenticate and seal envelope
  |-- billing coordinator: resolve PaymentRequired
  `-- MessageTransport / InboxTransport
            |
            | opaque bytes + opaque address
            v
      Nostr message adapter
            |
            | signed event / filter
            v
      Nostr relay connection
            |
            | WSS: EVENT / REQ / AUTH / CLOSE
            v
      independently owned relay
```

The current clients connect to every selected relay and publish and subscribe
across all of them. Relay fan-out is an availability policy at the route
layer. The UI discloses that it also exposes timing, network, routing, and size
metadata to every selected operator.

## 4. Relay declaration

### 4.1 Target manifest

A conforming relay publishes a signed abstract `ServiceManifest` whose Nostr
mapping includes at least:

```json
{
  "version": 1,
  "componentId": "onym:component:<relay-id>",
  "seat": "transport.message",
  "operator": "onym:key:<operator-id>",
  "messageProfileId": "onym:message-profile:opaque-topic-inbox-v1",
  "implementationProfileId": "onym:message-implementation:nostr-courier-v1",
  "endpoints": [
    {"uri": "wss://relay.example", "role": "read-write"}
  ],
  "capabilities": ["topic", "inbox", "nip42", "payment-required-v1"],
  "limits": {
    "maximumEventBytes": "<declared-limit>",
    "maximumWebSocketFrameBytes": "<declared-limit>",
    "maximumConcurrentSubscriptions": "<declared-limit>"
  },
  "retention": "<declared-policy>",
  "privacyProfile": "<hash-or-url>",
  "entitlementIssuers": ["onym:key:<issuer-id>"],
  "offers": ["<relay-offer-id>"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The client validates the manifest before opening its endpoint. TLS
authenticates the current host; the signed manifest binds that host to the
selected component, operator, implementation profile, limits, and offers.

### 4.2 Current endpoint configuration

Current mobile configuration stores only `name`, `url`, and `isDefault`, plus
local state recording whether the user changed the seeded list. Onym's relay
is seeded on first use and every configured relay is selected for fan-out.
This is discovery and preference state, not the complete manifest above.
Display names and shipped defaults do not prove operator identity.

## 5. Nostr event envelope

A wire event has the NIP-01 fields:

```json
{
  "id": "<lowercase-sha256-hex>",
  "pubkey": "<32-byte-x-only-public-key-hex>",
  "created_at": 1785580800,
  "kind": 44114,
  "tags": [["t", "<opaque-topic>"], ["ms", "1785580800123"]],
  "content": "<base64-opaque-envelope>",
  "sig": "<bip340-schnorr-signature-hex>"
}
```

The event ID is the lowercase SHA-256 digest of the UTF-8 JSON serialization:

```json
[0,"<pubkey>",1785580800,44114,[["t","<topic>"],["ms","1785580800123"]],"<content>"]
```

Array order, tag order, strings, numbers, and escaping are therefore
consensus-sensitive within this implementation. Cross-platform fixtures pin
the canonical bytes, ID, and signature.

For message and inbox events, current clients create a fresh secp256k1 signer
for every event. Its x-only public key becomes `pubkey`, and its BIP-340
signature covers the event ID. This reduces stable sender correlation; it does
not make relay metadata private and it is not an Onym identity or group
signature. The encrypted inner envelope independently authenticates its
sender and meaning.

Every emitted event also carries:

```json
["ms", "<non-negative-Unix-time-in-milliseconds>"]
```

`created_at` is the same local clock truncated to seconds. Receivers may use a
valid `ms` value for display ordering and fall back to `created_at * 1000`.
Neither value is trusted application order.

## 6. Topic mapping

### 6.1 Publish

The adapter emits kind `44114` with a `t` tag containing the opaque topic and
standard base64 of the sealed bytes in `content`:

```json
[
  "EVENT",
  {
    "kind": 44114,
    "tags": [["t", "<opaque-topic>"], ["ms", "<Unix-time-ms>"]],
    "content": "<standard-base64-of-opaque-bytes>"
  }
]
```

The abbreviated object also contains every identity and signature field from
section 5. New adapters emit only kind `44114` under this profile.

### 6.2 Subscribe and catch-up

The adapter opens one logical subscription per topic and relay:

```json
[
  "REQ",
  "<unique-subscription-id>",
  {
    "kinds": [44114, 24114],
    "#t": ["<opaque-topic>"],
    "since": 1785580500
  }
]
```

Kind `24114` is a receive-only legacy path. When the caller supplies a `since`
instant, current clients subtract 60 seconds, clamped at zero, to tolerate
clock skew. With no cursor, they request the preceding 300 seconds. These
values describe the current `nostr-courier-v1` profile; changing their meaning
requires a new profile version or an explicitly negotiated cursor policy.

The relay returns zero or more `EVENT` frames and then `EOSE` for the stored
portion. Live `EVENT` frames may continue until cancellation. The adapter
sends `CLOSE` with the exact subscription ID when the stream ends.

## 7. Inbox mapping

### 7.1 Send

The adapter emits kind `34113`, a parameterized-replaceable event, with this
exact application tag set before the common `ms` tag is appended:

```json
[
  ["d", "sep-inbox:<opaque-inbox-id>"],
  ["t", "<opaque-inbox-id>"],
  ["sep_inbox", "<opaque-inbox-id>"],
  ["sep_version", "1"]
]
```

`content` is standard base64 of the sealed bytes. `d` is the canonical
parameterized-replaceable address. The other tags maintain compatibility with
existing Onym and legacy filtering. Because replacement is keyed by kind,
publisher pubkey, and `d`, the fresh per-event publisher key prevents a new
sender event from replacing another sender's inbox event.

### 7.2 Subscribe

An inbox subscription carries these three filters in one `REQ`:

```json
[
  "REQ",
  "<unique-subscription-id>",
  {"kinds": [34113], "#d": ["sep-inbox:<opaque-inbox-id>"]},
  {"kinds": [34113], "#t": ["<opaque-inbox-id>"]},
  {"kinds": [24113], "#t": ["<opaque-inbox-id>"]}
]
```

The first filter is canonical, the second is a same-kind compatibility path,
and kind `24113` is receive-only legacy compatibility. One multi-filter `REQ`
consumes one relay subscription slot and lets a conforming relay suppress an
event that matches more than one filter.

Subscription IDs are at most 64 characters, unique for each subscription
generation, and contain no raw inbox value. A suitable form is a fixed prefix,
a truncated hash of the inbox, and a monotonic local generation. This prevents
an old stream's delayed `CLOSE` from terminating its replacement and avoids
placing a stable raw address in another frame field.

## 8. Framing and connection lifecycle

The adapter uses valid Nostr arrays:

| Direction | Frame | Meaning in this profile |
|---|---|---|
| Client → relay | `["EVENT", <event>]` | Submit one topic or inbox event |
| Client → relay | `["REQ", <id>, <filter>...]` | Open a bounded subscription |
| Client → relay | `["CLOSE", <id>]` | Close the named subscription |
| Client → relay | `["AUTH", <event>]` | Answer a NIP-42 challenge |
| Relay → client | `["EVENT", <id>, <event>]` | Deliver a matching event |
| Relay → client | `["EOSE", <id>]` | Mark the stored/live boundary |
| Relay → client | `["OK", <event-id>, <bool>, <reason>]` | Accept or reject an event |
| Relay → client | `["CLOSED", <id>, <reason>]` | Refuse or end a subscription |
| Relay → client | `["NOTICE", <message>]` | Unstructured diagnostic |
| Relay → client | `["AUTH", <challenge>]` | Request NIP-42 authentication |

Unknown or malformed frames are ignored or quarantined within bounded work.
`NOTICE` is diagnostic text, never a stable domain error or trusted payment
link. `OK` and `CLOSED` reasons are parsed only through recognized prefixes;
the original bounded text may be retained as safe diagnostic context.

For every endpoint, a conforming connection:

1. establishes TLS and a WebSocket to the manifest-bound `wss://` origin;
2. applies connection and inbound-frame limits;
3. authenticates when challenged;
4. replays active subscriptions after reconnect;
5. uses exponential backoff with jitter and a declared ceiling;
6. prevents stale and current receive loops from sharing ownership;
7. gives each resubscription a new ID;
8. keeps explicit disconnect as sticky intent across delayed reconnect work;
9. closes remote subscriptions on cancellation; and
10. reports each relay independently.

Current iOS probes liveness every 30 seconds with an impossible `REQ` and
expects a response because its WebSocket implementation cannot safely rely on
a ping callback; it closes the probe immediately. Android uses OkHttp ping
frames every 30 seconds. Both use reconnect delays from one second up to 120
seconds. These are client choices, not portable message semantics.

## 9. Validation and inbound delivery

Before producing an abstract inbound value, the adapter:

1. bounds the frame and decoded JSON structure;
2. validates the frame type and subscription ID;
3. parses required event fields with exact types and sizes;
4. recomputes and compares the canonical event ID;
5. verifies the BIP-340 signature against `pubkey`;
6. requires an allowed kind for the subscription;
7. requires the exact requested `t` or `d` address relation;
8. enforces manifest event and decoded-payload limits;
9. strictly decodes base64;
10. suppresses duplicate event IDs; and
11. passes only the address, opaque bytes, event ID, relay origin, and
    observation to the abstract layer.

The application then verifies and decrypts the inner envelope, enforces group
or inbox authorization, and deduplicates by authenticated logical message ID.
Relay filtering is an optimization: a malicious relay can send an event that
does not match the requested filter, so the client repeats the match check.

## 10. Acceptance and receipts

Explicit relay acceptance is:

```json
["OK", "<event-id>", true, ""]
```

`OK true` means only that this relay accepted the event under its declared
service. It is not proof of durable retention, recipient delivery, inner
sender authenticity, group authorization, or global publication.

An `OK false` is `rejected` with a typed prefix mapping when recognized. A
network failure before a response is `unreachable`. A timeout after a send is
`unknown`, because the relay may have accepted the event before the response
was lost. Silence is never upgraded to `accepted`.

For fan-out, the adapter returns abstract per-courier outcomes. The same event
ID may be submitted to every relay in one attempt. A logical retry may need a
fresh outer event because time or authorization context changed, while
preserving the inner `logicalMessageId` for deduplication.

## 11. Relay authentication

When access control is required, the relay uses NIP-42:

```text
relay -> client: ["AUTH", "<challenge>"]
client -> relay: ["AUTH", <kind-22242-auth-event>]
relay -> client: ["OK", "<auth-event-id>", true, ""]
```

The authorization event has kind `22242`, empty `content`, a timestamp close
to the challenge, and applicable tags including:

```json
[
  ["relay", "wss://relay.example"],
  ["challenge", "<exact-relay-challenge>"]
]
```

It is signed by a key scoped to this relay component and seat. It is neither
the global Onym identity key nor the fresh outer key used for ordinary message
events. The relay validates signature, kind, timestamp, challenge, and
normalized relay URL, then binds the authenticated subject to the connection.

Because ordinary Onym events deliberately use ephemeral outer keys, a
compatible relay authorizes connection operations for the authenticated seat
and does not require each ordinary event `pubkey` to equal the NIP-42 access
key. A generic relay configured to require equality is not compatible.

If purchase registration is required, a billing-broker webhook or versioned
relay control endpoint binds the entitlement subject to the relay-scoped
access key. The client never adds proprietary fields to `AUTH` and never sends
an App Store or Play receipt to the relay.

## 12. Payment-required mapping

Payment may be refused at two phases:

1. **Before WebSocket upgrade.** HTTPS may return `402 Payment Required` with
   a canonical `PaymentRequired` document or signed reference.
2. **After WebSocket upgrade.** The relay remains inside valid Nostr framing.
   It rejects a write with `OK false` or a subscription with `CLOSED`.

```json
["OK", "<event-id>", false, "payment-required: <opaque-offer-reference>"]
["CLOSED", "<subscription-id>", "payment-required: <opaque-offer-reference>"]
```

`payment-required:` is an Onym extension, not a standardized NIP-01 or NIP-42
prefix. Reasons map as follows:

| Prefix | Domain result | Next action |
|---|---|---|
| `auth-required:` | `auth_required` | Answer NIP-42 challenge |
| `restricted:` | `invalid_entitlement` or `unauthorized` | Refresh entitlement or explain policy |
| `payment-required:` | `payment_required` | Resolve referenced signed offer |
| unknown | generic rejection | Preserve bounded diagnostic text |

The adapter returns `PaymentRequired(componentId, offerReference, operation)`
to the UI billing coordinator. It does not invoke StoreKit or Play Billing,
select a product, validate a purchase, calculate taxes or commissions, or
declare settlement complete.

```text
application -> adapter: publish or subscribe
application <- adapter: PaymentRequired(relay + offer reference)
UI -> billing channel: purchase approved ChannelOffer product
UI -> billing broker: purchase evidence + relay-scoped access public key
UI <- billing broker: SeatEntitlement
billing broker -> relay control plane: entitlement registration
relay -> client: NIP-42 challenge
client -> relay: NIP-42 proof with relay-scoped key
application -> adapter: retry original logical operation
application <- adapter: per-relay outcome
```

The retry preserves the sealed envelope and logical message ID. Platform fees,
the UI owner's declared commission, taxes, refunds, and settlement to the
relay operator remain economic-plane records outside Nostr message events.

## 13. Delivery, retention, and limits

This profile provides best-effort, at-least-once delivery. Fan-out,
compatibility filters, reconnect, and catch-up can produce duplicates. A relay
can delay, drop, replay, expire, or selectively serve ciphertext. `EOSE` marks
one relay's stored/live boundary, not globally complete history. The adapter
deduplicates event IDs; the application deduplicates authenticated logical IDs.

Limits are operator declarations, not universal Nostr constants. A client
computes the complete UTF-8 JSON event size after base64 expansion and event
overhead, rather than comparing only the opaque payload length.

The current `strfry` reference deployment is configured with:

| Limit | Current value |
|---|---:|
| Maximum event size | 65,536 bytes |
| Maximum WebSocket payload | 131,072 bytes |
| Maximum concurrent subscriptions per connection | 20 |
| Relay automatic ping interval | 55 seconds |

Current iOS and Android parsers reject inbound relay frames above 1,048,576
bytes. That defensive ceiling is larger than the reference relay's limit and
is not a promise that a relay will accept such an event. The target manifest
allows rejection before signing or network work. Queues, pending `OK` waiters,
tags, subscriptions, reconnect tasks, and diagnostics also require bounds.

## 14. Error mapping

| Abstract error | Nostr source |
|---|---|
| `unsupported_profile` | Manifest lacks the profile or capability |
| `invalid_endpoint` | Invalid origin, manifest mismatch, or TLS failure |
| `not_connected` | No selected connection available |
| `unreachable` | DNS, TLS, WebSocket, send, or connection timeout |
| `auth_required` | `AUTH` challenge or `auth-required:` refusal |
| `payment_required` | HTTP 402 or Onym `payment-required:` refusal |
| `invalid_entitlement` | `restricted:` after attempted seat authentication |
| `rate_limited` | Profile-mapped rate-limit refusal |
| `payload_too_large` | Local manifest limit or relay rejection |
| `publish_rejected` | `OK false` without a specific mapping |
| `subscription_rejected` | `CLOSED` without a specific mapping |
| `outcome_unknown` | Submitted event without conclusive `OK` |
| `invalid_frame` | Malformed, excessive, or unexpected event/filter relation |
| `invalid_outer_integrity` | Event-ID or Schnorr verification failure |
| `retention_gap` | Catch-up cursor cannot be completely served |

Free-form `NOTICE`, `OK`, and `CLOSED` strings stay diagnostics. They cannot
become executable links, product identifiers, or authorization decisions
without resolving a signed, profile-bound object.

## 15. Current implementation mapping

| Boundary role | Current implementation |
|---|---|
| Common message port | `Transport.swift` in `onym-ios`; `Transport.kt` in `onym-android` |
| Topic adapter | `NostrMessageTransport` in both clients |
| Inbox adapter | `NostrInboxTransport` in both clients |
| Connection and framing | `NostrRelayConnection` and `NostrEvent` in both clients |
| Outer signing | `OnymNostrSigner` and `NostrEphemeralSignerProvider` |
| Relay selection | `NostrRelaysRepository` and platform selection stores |
| Reference relay | `strfry` behind Caddy in `onym-infra` |

Implemented today on both platforms:

- topic kind `44114` emission and kinds `44114`/`24114` receipt;
- inbox kind `34113`, its four application tags, and kind `24113` fallback;
- base64 payloads, the `ms` tag, canonical event IDs, and ephemeral signing;
- multi-relay connection and fan-out;
- bounded inbound frames, reconnect backoff, heartbeat, subscription replay,
  and event-ID checking; and
- mirrored event and filter-construction tests.

## 16. Known gaps

Current code is not yet a complete conforming implementation:

1. the receipt exposes only `messageId` and aggregate `acceptedBy`, not
   per-relay accepted, rejected, unreachable, and unknown outcomes;
2. topic publish counts a local WebSocket send path rather than `OK true`;
   Android can count its best-effort call even when no socket sends;
3. inbox publish treats five seconds without `OK` as success rather than
   `outcome_unknown`;
4. `OK` reasons are discarded, and `AUTH` and `CLOSED` are ignored, so
   authentication and payment refusal cannot reach the UI;
5. clients recompute event IDs but do not consistently perform full Schnorr
   verification or independently validate kind/address match;
6. Android inbox subscriptions use three separate `REQ` frames with raw
   inbox-based IDs, while iOS uses one multi-filter `REQ`, hashed IDs, and
   generation-safe cancellation;
7. Android reconnect work lacks iOS's sticky `desiredConnected` guard, so a
   delayed failure can reconnect after explicit disconnect;
8. topic catch-up uses time windows rather than a portable cursor, and inbox
   catch-up has no explicit cursor;
9. relay configuration does not bind operator, limits, retention, privacy,
   offers, or entitlement issuers;
10. payload limits are not derived from a verified manifest before event
    construction;
11. `PaymentRequired`, NIP-42 seat authentication, `SeatEntitlement`, renewal,
    revocation, quota accounting, and broker registration are not implemented;
    and
12. conformance relies on mirrored app tests rather than one fixture suite for
    third-party clients and relays.

These gaps are interoperability and security work, not alternate wire
semantics that third parties should copy.

## 17. Conformance tests

A shared fixture suite covers:

1. exact topic and inbox event bytes, IDs, and signatures;
2. base64 vectors including empty, maximum, and malformed payloads;
3. `ms` parsing and `created_at` fallback;
4. topic catch-up boundary and 60-second slack;
5. all inbox filters in one `REQ` and receive-only legacy kinds;
6. event-ID, signature, kind, tag, address, and size rejection;
7. `EVENT`, `EOSE`, `OK`, `CLOSED`, `NOTICE`, and `AUTH` parsing;
8. NIP-42 challenge binding, origin scoping, expiry, and key isolation;
9. pre-upgrade 402 and post-upgrade payment refusal mapping;
10. acceptance, rejection, timeout-after-send, and partial fan-out;
11. reconnect, replay, unique generations, cancellation, and sticky disconnect;
12. cross-relay event and inner logical-message deduplication; and
13. manifest signature, limit, offer, origin, and expiry validation.

## 18. Acceptance criteria

This Nostr profile satisfies the abstract boundary when:

1. a third-party adapter can implement it without inspecting mobile code;
2. a third-party relay can serve paid or free access without becoming an Onym
   identity or group authority;
3. events, keys, tags, filters, frames, and refusal strings remain behind the
   abstract message port;
4. every relay outcome records exactly what its response proved;
5. authentication uses a relay-scoped seat key without sacrificing
   per-message ephemeral outer keys;
6. payment remains valid Nostr framing and never carries store evidence;
7. hostile relay frames cannot bypass outer and inner validation or exhaust
   unbounded client resources;
8. reconnect, catch-up, duplicates, compatibility filters, and partial fan-out
   pass shared fixtures; and
9. replacing Nostr does not alter abstract operations or the encrypted Onym
   envelope.

## References

1. Abstract Onym message boundary: [UI-Message.md](UI-Message.md)
2. Onym iOS client: <https://github.com/onymchat/onym-ios>
3. Onym Android client: <https://github.com/onymchat/onym-android>
4. Onym infrastructure: <https://github.com/onymchat/onym-infra>
5. Nostr NIP-01, “Basic protocol flow description”:
   <https://github.com/nostr-protocol/nips/blob/master/01.md>
6. Nostr NIP-42, “Authentication of clients to relays”:
   <https://github.com/nostr-protocol/nips/blob/master/42.md>
