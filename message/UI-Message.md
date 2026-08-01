---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym UI ↔ Message Transport Boundary

**Architecture draft 0.2 — August 2026**

> The UI decides what the user wants to send. The message transport moves an
> opaque envelope. It does not become the sender, recipient, or group.

This document defines the technology-neutral boundary between an Onym
frontend and a small-message courier. It does not require a particular event
format, socket protocol, relay network, signing curve, server implementation,
or addressing syntax.

A concrete implementation may use federated relays, store-and-forward queues,
peer-to-peer links, privacy networks, mesh radio, or another mechanism that
satisfies the profile's opacity, addressing, delivery, receipt, and error
semantics. The current Nostr implementation is specified separately in
[UI-Message-Nostr.md](UI-Message-Nostr.md).

Here **UI** means the frontend application layer, not a screen calling a
network connection. Views send intent to flows, view-models, repositories, or
interactors. Those components authenticate and seal the application envelope
before invoking the message port.

Encrypted large-object storage is a separate boundary defined in
[../blob/UI-Blob.md](../blob/UI-Blob.md). Shared-state validation is defined in
[../notary/UI-Notary.md](../notary/UI-Notary.md).

## 1. Decision

Onym treats the UI, application protocol, message adapter, and courier
operator as independently owned components joined by versioned interfaces.

- The **UI owner** controls presentation, local orchestration, billing
  integration, supported profiles, and release distribution.
- The **application-protocol author** controls encrypted inner-envelope
  formats, sender authentication, replay rules, and message meaning.
- The **message-adapter author** maps the common Onym port to a concrete wire
  technology.
- The **courier operator** owns endpoints, capacity, routing, retention,
  moderation, availability, privacy practices, and its payment model.
- The **user or group** selects a route and may combine several couriers.

One organization may occupy several roles, but their authorities remain
separate. A user can change UI without requiring a new courier. A UI can use a
compatible third-party courier without importing its domain model. A courier
can serve several frontends without learning or enforcing their group rules.

The boundary has two interfaces:

1. the local **UI/application ↔ message adapter** port, which carries opaque
   envelopes, opaque addresses, and typed outcomes; and
2. the network **message adapter ↔ courier** implementation profile, which
   defines framing, connection behavior, access control, payment refusal,
   limits, and acknowledgements.

Neither interface may expose plaintext, identity-vault secrets, attachment
decryption keys, or notary witnesses.

## 2. What message transport does

Message transport provides two logical delivery modes:

- **topic delivery:** many publishers and subscribers share an opaque routing
  address; and
- **inbox delivery:** a sender targets one opaque recipient-derived routing
  address.

The base port can:

1. connect to a verified set of courier endpoints;
2. publish an opaque envelope to a topic;
3. subscribe to a topic with an optional catch-up cursor;
4. send an opaque envelope to an inbox;
5. subscribe to an inbox;
6. cancel subscriptions and disconnect; and
7. report per-courier progress and refusal.

It does not authenticate the inner sender, determine group membership, decrypt
content, interpret message type, upload large media, resolve human names, or
authorize notary state.

## 3. Why this boundary is necessary

### 3.1 It prevents the courier from becoming the messenger

If message meaning, group membership, sender authorization, or decryption is
implemented inside one courier, replacing that courier becomes equivalent to
replacing the product. A courier should see only the routing material and
opaque bytes needed to provide its declared service.

### 3.2 It prevents the UI from becoming a network implementation

Screens and domain flows should not know wire frames, event types, routing
tags, filters, reconnect algorithms, or server-specific errors. A narrow port
allows another transport technology without rewriting chat and group flows.

### 3.3 It makes metadata exposure reviewable

End-to-end encryption does not necessarily hide endpoint IPs, timing, payload
sizes, routing addresses, catch-up windows, retention, or retry patterns. A
named profile must state which fields cross the boundary and what a courier
can correlate.

### 3.4 It supports independent ownership and payment

Each courier defines what it sells. One may be free, another subscription
funded, another consumable, and another funded by an institution. The UI
decides which offers it can present through its billing channels. Payment buys
the declared courier service; it does not buy plaintext or group authority.

### 3.5 It isolates failure and censorship

- A failing or censoring courier can be removed without changing identity.
- A broken adapter can be replaced without changing inner envelopes.
- Redundant couriers can improve availability and permit deduplication.
- A catalog or UI update cannot silently redefine one operator as another.
- Message loss, replay, or refusal cannot itself mutate canonical notary state.

## 4. Logical topology

```text
┌──────────────────────────────────────────────────────────────────────┐
│ UI process                                                           │
│                                                                      │
│ View / Composable                                                    │
│        │ user intent                                                 │
│        v                                                             │
│ Flow / ViewModel                                                     │
│        │ application command                                        │
│        v                                                             │
│ Repository / Interactor                                              │
│        ├────────> Identity vault: scoped capability                  │
│        ├────────> Group/application crypto: seal inner envelope      │
│        └────────> Message port: opaque bytes + opaque address        │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ implementation-neutral operation
                               v
                    ┌────────────────────────┐
                    │ Message adapter        │
                    │ map · frame · validate │
                    │ retry · normalize      │
                    └───────────┬────────────┘
                                │ implementation profile
                                v
                    ┌────────────────────────┐
                    │ Courier endpoint(s)    │
                    │ route · retain · refuse│
                    └────────────────────────┘
```

The adapter is inside the client trust boundary but handles untrusted network
input. The courier is outside it. A successful provider response is evidence
of that provider's action—not proof of recipient delivery, inner-message
authenticity, application validity, or permanent retention.

## 5. Boundary objects

### 5.1 Message Profile

A `MessageProfile` defines the portable interface independently of a wire
technology or operator:

```json
{
  "profileVersion": 1,
  "profileId": "onym:message-profile:opaque-topic-inbox-v1",
  "interface": "onym-message-v1",
  "operations": [
    "publish-topic",
    "subscribe-topic",
    "send-inbox",
    "subscribe-inbox"
  ],
  "addressSchemas": ["topic-v1", "inbox-v1"],
  "envelopeSchema": "<content-addressed-opaque-envelope-schema>",
  "delivery": "best-effort-at-least-once",
  "acknowledgement": "per-courier-acceptance-v1",
  "cursor": "<catch-up-cursor-schema>",
  "errorSchema": "onym-message-errors-v1",
  "privacyProfile": "<content-addressed-disclosure-profile>",
  "specification": "<content-addressed-specification>",
  "signature": "<profile-publisher-signature>"
}
```

The profile fixes semantic operations, address meaning, delivery guarantees,
receipts, and errors. It does not select endpoints, wire framing, signing,
operator, price, or UI.

Two implementation profiles are compatible only when a conforming application
can preserve the same inner envelope, logical address, retry identity, and
delivery semantics. Both carrying bytes is not sufficient compatibility.

### 5.2 Message Implementation Profile

A `MessageImplementationProfile` maps the abstract interface onto one wire
technology:

```json
{
  "implementationVersion": 1,
  "implementationProfileId": "onym:message-implementation:<technology>-v1",
  "messageProfileId": "onym:message-profile:opaque-topic-inbox-v1",
  "wireProtocol": "<protocol-id>",
  "wireMapping": "<content-addressed-specification>",
  "connectionModel": "<declared-model>",
  "outerIntegrity": "<integrity-or-signature-scheme>",
  "authentication": ["anonymous", "scoped-access-key"],
  "paymentRefusal": "onym-payment-required-v1",
  "signature": "<implementation-profile-publisher-signature>"
}
```

Wire types stay inside the adapter. The abstract application does not receive
protocol event objects, socket handles, server filters, or authorization
frames.

### 5.3 Courier Manifest

A transport `ServiceManifest` binds an implementation profile to an operator:

```json
{
  "version": 1,
  "componentId": "onym:component:<courier-id>",
  "seat": "transport.message",
  "operator": "onym:key:<operator-id>",
  "messageProfileId": "onym:message-profile:opaque-topic-inbox-v1",
  "implementationProfileId": "onym:message-implementation:<technology>-v1",
  "endpoints": [
    {"uri": "<technology-specific-endpoint>", "role": "read-write"}
  ],
  "capabilities": ["topic", "inbox", "scoped-auth"],
  "limits": {
    "maximumOpaquePayloadBytes": "<operator-declared-limit>",
    "maximumConcurrentSubscriptions": "<operator-declared-limit>"
  },
  "retention": {"class": "best-effort", "maximum": "P30D"},
  "privacyProfile": "<hash-or-url>",
  "offers": ["courier-monthly-v1", "courier-quota-v1"],
  "validUntil": "2026-12-31T23:59:59Z",
  "signature": "<operator-signature>"
}
```

The UI verifies the operator signature, both profiles, endpoint syntax,
limits, validity, privacy declaration, and selected offer. A directory entry
or friendly name is insufficient.

Mutable health and load reports remain separate from signed policy. They must
not replace an operator, endpoint, implementation profile, or offer.

### 5.4 Message Route

A `MessageRoute` is the user's or group's local courier selection:

```json
{
  "routeVersion": 1,
  "routeId": "<local-random-id>",
  "messageProfileId": "onym:message-profile:opaque-topic-inbox-v1",
  "components": [
    "onym:component:<courier-a>",
    "onym:component:<courier-b>"
  ],
  "writePolicy": {"mode": "fanout", "minimumAcceptances": 1},
  "readPolicy": {"mode": "union-deduplicate"},
  "catchUp": {"policy": "bounded-recent"},
  "selectedBy": "user",
  "selectedAt": "2026-08-01T00:00:00Z"
}
```

The route is configuration, not identity or canonical group state. The UI
preserves selection and warns when a change reduces redundancy, retention,
privacy, compatibility, or paid coverage.

Endpoint hints from another user are recommendations. They do not authorize
the UI to add the hinted operator to a permanent local route.

### 5.5 Topic and inbox addresses

The common port uses two opaque values:

- `TransportTopic`: a many-to-many routing handle; and
- `TransportInboxId`: a recipient-derived point-to-point routing handle.

Opaque means the adapter does not infer identity or group policy from the
value. It does not mean the value is secret from the courier. Each
implementation profile states how addresses appear on the wire and what can be
linked across publish, subscribe, retry, and catch-up.

The application derives addresses. They should be scoped and rotatable where
the application protocol permits. Global identity keys, human-readable group
names, and association-registry names are not transport addresses.

### 5.6 Outbound operation

The application passes an already sealed operation:

```json
{
  "operationVersion": 1,
  "operationId": "<random-id>",
  "logicalMessageId": "<stable-application-message-id>",
  "addressType": "inbox",
  "address": "<opaque-inbox-id>",
  "payload": "<base64-opaque-bytes>",
  "contentType": "application/onym-envelope",
  "expiresAt": "2026-08-08T00:00:00Z"
}
```

`operationId` tracks a transport attempt; `logicalMessageId` makes retry and
multi-courier delivery idempotent at the application layer. Neither may embed
an identity, group name, message text, attachment key, or billing transaction.

### 5.7 Inbound value

```json
{
  "addressType": "topic",
  "address": "<opaque-topic>",
  "payload": "<base64-opaque-bytes>",
  "transportMessageId": "<implementation-assigned-id>",
  "componentId": "onym:component:<courier-id>",
  "observedAt": "2026-08-01T00:00:00Z",
  "cursor": "<implementation-neutral-cursor-or-null>"
}
```

`observedAt` is an observation, not a trusted application timestamp. The
adapter verifies profile-required outer framing. The application independently
authenticates, decrypts, orders, and authorizes the inner envelope.

### 5.8 Publish receipt

```json
{
  "operationId": "<same-random-id>",
  "logicalMessageId": "<same-logical-message-id>",
  "outcomes": [
    {
      "componentId": "onym:component:<courier-a>",
      "status": "accepted",
      "transportMessageId": "<provider-id>",
      "evidence": "<profile-defined-acknowledgement-or-null>"
    },
    {
      "componentId": "onym:component:<courier-b>",
      "status": "unreachable",
      "transportMessageId": null,
      "evidence": null
    }
  ]
}
```

Valid provider outcome classes are:

- `queued_locally`: bytes entered the adapter's bounded outgoing queue;
- `sent`: bytes were handed to the network implementation;
- `accepted`: the courier explicitly acknowledged its declared service;
- `stored`: the courier supplied profile-defined retention evidence;
- `rejected`: the courier explicitly refused;
- `unreachable`: no meaningful courier response was obtained; and
- `unknown`: the attempt may have succeeded, but its result cannot safely be
  determined.

An aggregate `acceptedBy` count can be derived but is insufficient for retry,
payment, or diagnosis. No provider outcome means the recipient processed the
message. End-to-end delivery is represented by a separate encrypted
application receipt.

## 6. Common message surface

| Operation | Input | Result |
|---|---|---|
| `connect` | Verified route and scoped access context | Per-courier connection state |
| `publish` | Sealed bytes, topic, IDs | Per-courier outcomes |
| `subscribeTopic` | Topic and optional catch-up cursor | Inbound stream |
| `sendInbox` | Sealed bytes, inbox, IDs | Per-courier outcomes |
| `subscribeInbox` | Inbox and optional cursor | Inbound stream |
| `unsubscribe` | Local subscription handle | Local closure and best-effort remote close |
| `disconnect` | Courier or route | Sticky closed connection intent |
| `queryOutcome` | Operation or transport message ID | Outcome when supported |

`connect` is lifecycle intent, not proof that every endpoint is usable. The
adapter reports each endpoint independently and continues according to route
policy.

Subscription streams are cancellable, bounded, and safe under reconnect.
Cancellation of an older stream must not close a newer subscription to the
same logical address.

## 7. UI/application obligations

A conforming frontend and application layer must:

1. verify message and implementation profiles plus every selected manifest;
2. preserve the user's route across UI, directory, and catalog updates;
3. display operator, price, retention, limits, redundancy, and material
   metadata exposure before selection or purchase;
4. authenticate and encrypt the inner envelope before invoking transport;
5. keep plaintext, group secrets, BIP-39 material, attachment keys, notary
   witnesses, and global identity credentials outside message objects/logs;
6. derive scoped topics, inbox handles, and access keys through narrow
   identity or application capabilities;
7. reject oversized envelopes before expensive signing or connection work;
8. preserve per-courier outcomes, refusal codes, and payment requirements;
9. deduplicate by authenticated logical message ID across couriers, reconnects,
   and catch-up;
10. treat provider timestamps, ordering, and retention statements as untrusted
    observations;
11. verify inner sender, group authorization, revision, and replay rules after
    receipt;
12. label `sent`, `accepted`, `stored`, and `delivered` accurately;
13. retry with bounded backoff and stable logical message identity;
14. query unknown outcomes before creating unnecessary duplicate attempts;
15. stop reconnecting after explicit disconnect or endpoint removal;
16. support route import/export and technology migration; and
17. never redirect traffic merely to increase frontend commission.

Courier notices, error text, manifest names, and endpoint URIs are untrusted
input. They must not execute code, drive unsafe navigation, or become trusted
payment links.

## 8. Message adapter obligations

A conforming adapter must:

1. implement its mapping without leaking wire-specific objects through the
   common port;
2. treat the inner payload as opaque;
3. enforce canonical encoding and profile limits;
4. validate inbound framing, outer integrity, size, and address match before
   application delivery;
5. expose courier origin and per-courier outcomes;
6. preserve subscription cancellation and sticky disconnect intent across
   reconnect races;
7. use bounded queues, timeouts, retry, backoff, and inbound frame limits;
8. prevent one courier's credential or entitlement from reaching another
   endpoint;
9. normalize wire refusal into stable domain errors while preserving safe
   diagnostics;
10. suppress obvious network duplicates before application dispatch;
11. avoid logging payloads, complete routing handles, credentials, or signed
    authorization material; and
12. remain replaceable without changing inner-envelope semantics.

Outer integrity proves only what the implementation profile states. It does
not establish group membership or inner sender authorization.

## 9. Courier operator obligations

A conforming operator publishes:

- a signed manifest and supported implementation profile;
- endpoint identifiers and normalization rules;
- supported address/operation capabilities;
- payload, connection, subscription, queue, and rate limits;
- access-control and entitlement-issuer policy;
- retention, deletion, backup, logging, and moderation policy;
- measurable availability or retention claims;
- stable machine-readable refusal behavior;
- seat offers and settlement terms when paid; and
- migration and shutdown notice policy.

The operator must not claim that accepting ciphertext authenticates its inner
sender, proves recipient delivery, or authorizes shared-state change.

## 10. Delivery and consistency semantics

The base message contract is best-effort, at-least-once delivery with
application-level idempotency. It does not promise exactly-once delivery or
permanent storage.

- Fan-out can produce the same message from several couriers.
- Reconnect and catch-up can replay an item already processed live.
- Timeout can occur after acceptance but before acknowledgement reaches the
  client.
- Explicit acceptance proves only the service stated by that provider/profile.
- Courier time does not establish authenticated order across devices.
- A courier may drop, delay, replay, retain, or selectively serve ciphertext.
- Catch-up can have gaps, truncation, expiry, or cursor incompatibility.

Application envelopes therefore need stable IDs, replay protection, and their
own authenticated ordering or epoch semantics. Adapter deduplication is an
optimization; inner-envelope idempotency is the final defense.

A paid offer may promise stronger retention or availability only through a
measurable additive capability and evidence format.

## 11. Access control and payment

Access control is separate from inner sender identity. A courier may require a
component-scoped access key or capability to read or write. That key proves
entitlement to service, not membership in an Onym group.

The operator publishes a `SeatOffer`. A frontend sells it only through a
compatible signed `ChannelOffer`; purchase validation, platform commission,
taxes, refunds, and settlement remain outside message framing.

```text
UI/application -> message adapter: publish or subscribe
UI/application <- message adapter: PaymentRequired(component + offer)
UI -> billing channel: purchase approved product
UI -> billing broker: validate purchase + component-scoped access key
UI <- billing broker: SeatEntitlement
UI -> courier control/auth path: register or prove entitlement
UI/application -> message adapter: retry original logical operation
UI/application <- message adapter: typed outcome
```

The retry preserves the logical message and encrypted bytes unless the
implementation requires fresh outer framing. Payment interruption must not
create a second logical chat message.

Store evidence and global identity do not enter ordinary courier frames,
routing addresses, or logs. Payment has no effect on inner authenticity or
group authorization. An unpaid envelope may use another selected courier.

## 12. Errors and state machines

| Error | Origin | UI/application response |
|---|---|---|
| `unsupported_profile` | Manifest/client | Refuse and explain required adapter |
| `invalid_endpoint` | Manifest/configuration | Refuse; never silently rewrite |
| `not_connected` | Local lifecycle | Connect selected couriers or show offline state |
| `unreachable` | Network/provider | Retry with bounded backoff or another selected courier |
| `auth_required` | Provider | Complete component-scoped authentication |
| `payment_required` | Provider | Present referenced signed offer when supported |
| `invalid_entitlement` | Provider/broker | Refresh without leaking another credential |
| `rate_limited` | Provider | Honor retry guidance; avoid fan-out amplification |
| `payload_too_large` | Client/provider | Use blob transport or reject before retry |
| `publish_rejected` | Provider | Preserve reason; try selected alternative if allowed |
| `partial_acceptance` | Route | Report accepted providers and safely retry failures |
| `outcome_unknown` | Network/provider | Query outcome or deduplicate before resubmission |
| `invalid_frame` | Adapter | Drop and optionally quarantine endpoint |
| `invalid_outer_integrity` | Adapter | Drop; repeated failures indicate misbehavior |
| `cursor_invalid` | Adapter/provider | Restart only under explicit catch-up policy |
| `retention_gap` | Provider/application | Surface missing interval; do not claim completeness |

Outbound state:

```text
draft
  -> sealed
  -> route_validated
  -> connecting
  -> auth_required? -> authenticated
  -> payment_required? -> entitled -> authenticated
  -> submitted
  -> partially_accepted | accepted | rejected | unknown
  -> application_receipt? -> delivered
```

Only an authenticated end-to-end application receipt produces `delivered`.

Inbound state:

```text
wire_item
  -> bounded
  -> framing_verified
  -> address_matched
  -> transport_deduplicated
  -> inner_envelope_verified
  -> application_deduplicated
  -> application_dispatched
```

Failure at any verification stage drops or quarantines the item. Preferred or
paid couriers do not receive weaker validation.

## 13. Security and privacy invariants

1. **Only sealed envelopes cross the boundary.** Plaintext, group secrets,
   seed material, attachment keys, and notary witnesses never enter requests.
2. **Routing is not identity.** Topics, inboxes, outer keys, and access keys are
   scoped rather than human names or global identity identifiers.
3. **Outer integrity is not group authorization.** Valid framing cannot make an
   invalid inner envelope valid.
4. **Acceptance is not delivery.** Local send and provider acknowledgement are
   distinct from an end-to-end receipt.
5. **Credentials are component-scoped.** One courier never receives another's
   entitlement, token, key, or signed challenge.
6. **Billing is separate from traffic.** Store transactions and global billing
   identifiers do not enter messages, addresses, or ordinary logs.
7. **Untrusted input is bounded.** Frames, filters, queues, error text,
   decompression, and reconnect work have explicit limits.
8. **Route changes are visible.** Defaults, catalogs, payment failures, and
   commissions cannot silently redirect traffic.
9. **Redundancy has a privacy cost.** More couriers improve availability while
   exposing metadata to more operators; the UI discloses the tradeoff.
10. **Transport cannot mutate notary state.** Delivery, loss, refusal, or replay
    cannot authorize or roll back a transition.
11. **Cancellation is sticky.** Explicit disconnect cannot be undone by a
    delayed reconnect task.
12. **Unknown outcome is not rejection.** Retry preserves idempotency rather
    than silently generating another application message.

## 14. Versioning and conformance

- `MessageProfile` changes when operation, address, delivery, receipt, cursor,
  or error meaning changes.
- `MessageImplementationProfile` changes when wire mapping, outer integrity,
  connection, authentication, or refusal mapping changes.
- `ServiceManifest` changes when endpoints, limits, retention, capabilities,
  offers, or operator keys change.
- Unknown implementations are never inferred from an endpoint URI scheme.
- New defaults apply to new selection, not silently to existing routes.
- Legacy wire forms are explicit receive capabilities and are not emitted
  unless the selected implementation profile says so.
- Cross-platform fixtures cover canonical mapping, addresses, IDs, outer
  integrity, refusals, reconnects, cancellation, duplicates, cursors, limits,
  partial acceptance, and unknown outcomes.
- Paid and free providers of the same implementation remain technically
  compatible; entitlement enforcement is a declared access capability.

## 15. Concrete implementation profiles

The abstract boundary becomes executable only through a concrete profile. The
current implementation is:

- [UI-Message-Nostr.md](UI-Message-Nostr.md) — Nostr events and WebSockets,
  Onym event kinds/tags, ephemeral outer signing, multi-relay fan-out, NIP-42
  access control, and Nostr refusal mapping.

Future profiles may use another courier technology while preserving the
common port. They must use another implementation profile ID when wire,
metadata, delivery, or receipt semantics differ.

## 16. Acceptance criteria

The UI ↔ message boundary is successfully separated when:

1. a third-party UI can send and receive opaque Onym envelopes using public
   profiles and conformance tests;
2. the official UI can use a compatible third-party courier after manifest
   verification without application-flow changes;
3. users can replace or combine couriers without changing identity, group
   state, or inner-envelope format;
4. no wire event, socket, filter, tag, protocol key, or server error type leaks
   into the abstract domain port;
5. plaintext and global identity keys never reach a courier adapter request or
   operator;
6. every outcome states what each selected courier actually confirmed;
7. payment refusal is distinct from authentication, rate limiting, invalid
   framing, and network failure;
8. payment does not reveal store evidence or grant message/notary authority;
9. duplicates, reconnect, cancellation, partial fan-out, catch-up gaps, and
   timeout-after-acceptance pass shared fixtures; and
10. a second transport technology can implement the abstract suite without
    pretending to be the first.

## 17. Justification in one sentence

> Separating UI from message transport lets people replace who presents a
> conversation without replacing who carries its ciphertext—and replace the
> courier without giving it ownership of identity, message meaning, or group
> rules.
