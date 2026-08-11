---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym System

Onym is a private messenger designed so that no single company owns it — and
a protocol for growing that property beyond messaging. This repository holds
the cross-repository **architecture and economic design**: the whitepaper and
the contract documents that define each independently ownable role in the
system. It contains no code.

## The idea in one paragraph

Most online services concentrate four powers in one operator: naming the
user, presenting the interface, carrying the data, and deciding whether a
shared action is valid. Onym separates them. A user's **identity** is a set
of keys only they control. The **UI** is a replaceable window, not an
account authority. **Couriers** move encrypted envelopes and media without
reading them. A **notary** verifies group-state transitions against
zero-knowledge proofs without storing conversations or a readable member
list. **Association registries** attach human-readable names as revocable,
consent-bound claims — the name is never the identity. Around this core, an
open set of service and institutional seats (banking, charity, audit,
arbitration, discovery, growth, sponsorship, recruitment, device backup) can
be operated by anyone, and each earns only when a user or group actually
selects it. The
governing rule for every seat:

> A component may exercise the minimum authority required for its role, and
> it may earn only when a user or group chooses it for that role.

## What is in this repository

| Document | Defines |
|---|---|
| [WHITEPAPER.md](WHITEPAPER.md) | The complete system model, design principles, economics, threat model, and roadmap |
| [interface/](interface/Interface.md) | The interface seat: honest presentation, no accounts, protected consent surfaces, disclosed economics, permanent exit |
| [identity/](identity/UI-Identity.md) | The identity vault: key custody, capability requests, consent, rotation, recovery — with the current [BIP-39 profile](identity/UI-Identity-BIP39.md) |
| [message/](message/UI-Message.md) | Small-message courier boundary — with the current [Nostr profile](message/UI-Message-Nostr.md) |
| [blob/](blob/UI-Blob.md) | Encrypted media storage boundary — with the current [Blossom profile](blob/UI-Blob-Blossom.md) |
| [notary/](notary/UI-Notary.md) | Group shared-state validation — with the current [Stellar/Soroban profile](notary/UI-Notary-Stellar.md) |
| [recovery/](recovery/Recovery-Trustee.md) | Recovery Trustee boundary — provider-neutral enrollment, recovery, rotation, and exit, with [cloud-custody](recovery/Recovery-Trustee-Cloud.md) and [Shamir](recovery/Recovery-Trustee-Shamir.md) profiles |
| [charity/](charity/UI-Charity.md) | Charitable coordination as the first non-messaging application seat ([contract](charity/Charity.md)) |
| [audit/](audit/Audit.md) | Signed, expiring, revocable attestations about exact artifacts — audits, conformance runs, build provenance |
| [arbitration/](arbitration/Arbitration.md) | Party-chosen dispute deciders whose authority is bounded to one order's escrowed stake |
| [discovery/](discovery/Discovery.md) | Signed, replaceable catalogs for finding compatible instances of every seat without becoming a gatekeeper |
| [lead/](lead/Lead-Generation.md) | Paid distribution measured in aggregate, with no person-level install attribution ([Telegram profile](lead/Lead-Generation-Telegram.md)) |
| [acquisition/](acquisition/Acquisition.md) | Landing-to-store conversion services measured by store aggregates ([App Store](acquisition/Acquisition-App-Store.md), [Google Play](acquisition/Acquisition-Google-Play.md)) |
| [sponsor/](sponsor/Sponsor.md) | Foundation funding with bounded recognition and a capped governance path ([Onym Foundation profile](sponsor/Sponsor-Onym.md)) |
| [recruitment/](recruitment/Recruitment.md) | Openings and candidate-consented introductions for every seat, without candidate ownership |
| [moderation/](moderation/Moderation.md) | Consent-bound moderation authorities whose signed verdicts interfaces execute as device marks ([DeviceCheck](moderation/Moderation-DeviceCheck.md), [device recall](moderation/Moderation-Device-Recall.md) profiles) |
| [backup/](backup/UI-Backup.md) | Device backup boundary — sealed snapshots retained under terms pinned at acceptance, with no operator key and no reset path (no implementation profile yet) |

In review, not yet merged: a **bank seat** (accounts, custody classes, and
payments against vault-held keys, with a Stellar profile) and an
**association naming seat** (qualified names such as `alice@writers.tallinn`
issued by competing registries). See open pull requests.

## How the documents work

Every seat follows the same two-layer pattern:

- an **abstract contract boundary** (`UI-X.md` or `X.md`) that fixes roles,
  authority limits, wire-neutral objects, obligations, error semantics, and
  privacy invariants — technology-free and implementation-independent; and
- one or more **implementation profiles** (`X-<Technology>.md`) that map the
  abstract contract onto a concrete stack (Nostr, Blossom, Stellar, BIP-39,
  Telegram, the app stores) and honestly record where current code falls
  short in a *Known gaps* section.

Documents state what is **implemented**, what is a **profile requirement**,
and what is a **gap**. The frontmatter header on each file tracks proposal
status. Nothing here is a claim of production security: the system is
alpha-grade, unaudited, and several load-bearing pieces (identity rotation,
forward-secret messaging, conformance fixtures) are explicitly open work —
see whitepaper §19–§22.

## What this repository is not

- **Not code.** Implementations live in the repositories below.
- **Not an investment prospectus.** No token exists or is implied; seats
  earn service revenue, not protocol rent.
- **Not a certification authority.** Anyone may implement any seat without
  permission. Discovery providers and auditors recommend; they never gate
  direct use.

## Related repositories

| Repository | Responsibility |
|---|---|
| [`onym-ios`](https://github.com/onymchat/onym-ios) / [`onym-android`](https://github.com/onymchat/onym-android) | Native clients: local identity, messaging, service selection |
| [`onym-sdk-swift`](https://github.com/onymchat/onym-sdk-swift) / [`onym-sdk-kotlin`](https://github.com/onymchat/onym-sdk-kotlin) | Shared proof and cryptographic primitives |
| [`onym-contracts`](https://github.com/onymchat/onym-contracts) | Soroban group-governance contract family |
| [`onym-relayer`](https://github.com/onymchat/onym-relayer) | Fee-paying transaction relayer and current deployment-manifest endpoints |
| [`onym-infra`](https://github.com/onymchat/onym-infra) | One replaceable default deployment (Nostr, Blossom, relayer, TLS) |
| [`onym-website`](https://github.com/onymchat/onym-website) / [`onym-papers`](https://github.com/onymchat/onym-papers) | Public explanation; research papers and protocol proposals |

## Reading order

1. **Whitepaper §1–§4** — the thesis and system model (15 minutes).
2. **One seat pair end to end** — [message/UI-Message.md](message/UI-Message.md)
   then [message/UI-Message-Nostr.md](message/UI-Message-Nostr.md) is the
   most complete example of the abstract/implementation discipline.
3. **Whitepaper §16–§17** — how seats publish offers and get paid.
4. The seats your work touches, starting from their *Decision* and
   *Security and privacy invariants* sections.

## Proposing changes

Proposals follow whitepaper §18: a problem statement, wire-format changes,
security and privacy effects, compatibility behavior, test vectors or a
reference implementation, and an account of which seats gain or lose
authority or revenue. Every new document takes the standard frontmatter
header and the abstract-versus-implementation split. Existing groups remain
governed by the exact contracts they selected; proposals cannot rewrite
deployed authority retroactively.
