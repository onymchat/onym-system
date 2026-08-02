---
status: draft
proposed: Claude, Codex & @rinat-enikeev
date: 01.08.2026
---

# Onym Messenger ↔ Charity UI Profile

**Architecture draft 0.1 — August 2026**

> Onym Messenger gives a donor or beneficiary a private, self-custodied way to
> interact with a charity system. It does not become the charity, custodian,
> verifier, auditor, or regulator.

This document is the Onym Messenger implementation of the technology-neutral
[Charity Contract Boundary](Charity.md). It specifies what Onym users see,
which local capabilities the app may request, how charity objects enter private
conversations, and how the app invokes independently operated charity,
financial, credential, proof, and notary providers.

This is an application profile, not a Stellar/Soroban mapping. A deployment may
bind this UI to Soroban contracts on Stellar, another ledger, a regulated
payment provider, bank rails, or several adapters. Every concrete financial,
proof, or notary implementation must publish its own profile and conformance
vectors. Ledger-specific values do not leak into the common charity UI port.

The status of this document is **proposed**. It describes the boundary that an
Onym Messenger implementation should satisfy; it is not a claim that every
screen, adapter, contract, or audit described here is already deployed.

A non-public July 2026 draft memorandum informed some responsibility and
implementation examples below. It is non-normative design input, is not
incorporated by reference, and is not required to implement or interpret this
public profile.

## 1. Decision

Onym Messenger implements charity as a removable application module above the
identity, message, blob, and notary boundaries:

- [UI-Message.md](../message/UI-Message.md) carries encrypted charity messages
  and opaque references through replaceable small-message couriers.
- [UI-Blob.md](../blob/UI-Blob.md) carries encrypted descriptions, reports, or
  user-selected documents too large for messages.
- [UI-Notary.md](../notary/UI-Notary.md) reads or proposes public committed
  state through a replaceable notary.
- The local identity vault creates only operation-scoped signatures,
  presentations, addresses, or financial authorizations.
- An association registry may supply signed organization names and records.
- A `CharityFinancialAdapter` quotes and submits value-moving operations to the
  user-selected financial provider.

The charity module is not part of the identity root. Disabling or uninstalling
it does not rotate identity, erase portable receipts, or prevent another
conforming UI from using the same charity profile.

Anyone may build an alternative UI, charity adapter, issuer, financial
provider, notary, proof implementation, report viewer, or whole deployment.
Onym decides which profiles its distributed clients support; users decide
which supported deployment to trust and use. Neither choice grants a provider
access to plaintext chats or the identity seed.

## 2. Responsibility map

| Concern | Onym Messenger | Charity/operator side |
|---|---|---|
| identity keys | store locally; issue scoped authorization | never receive mnemonic or root key |
| donor experience | render claims, terms, warnings, consent, status | provide signed campaigns, quotes, outcomes, support |
| private channel | seal and open application messages | control its endpoint and retention outside Onym |
| organization verification | verify credential against user-selected policy | define checks, issue/revoke credentials, answer challenges |
| campaign facts | display signed claims and issuer | create, update, pause, and substantiate claims |
| funds | preview and authorize through adapter | receive/custody/settle/refund under declared provider roles |
| beneficiary eligibility | make a private derived presentation | define policy, issue source credential, verify claim |
| allocation and delivery | show authenticated outcomes | select beneficiaries, approve, disburse, and handle disputes |
| compliance | disclose requesting party and obtain explicit handoff | perform applicable checks and retain required records |
| public evidence | verify notary/financial/audit evidence | publish narrow commitments and signed reports |
| impact | distinguish report issuer and limitations | make and support the impact claim |
| incidents | protect Onym-side data and report within declared scope | protect provider data and operate its incident process |

Onym does not promise donation volume, approve an organization, direct aid,
hold charity funds, issue tax receipts, or guarantee that a campaign achieves
its stated purpose. Charity-side actors do not control messenger architecture,
identity, app distribution, contacts, or unrelated conversations.

## 3. Onym topology

```text
┌──────────────────────────── Onym Messenger ───────────────────────────────┐
│ Charity views                                                             │
│ discover · verify · preview · authorize · receipt · claim · report        │
│          │                                                                │
│          v                                                                │
│ Charity flow / repository                                                 │
│    ├── Identity vault: scoped signature / eligibility presentation        │
│    ├── Message port: encrypted invitation and receipt references          │
│    ├── Blob port: sealed descriptions, evidence, or chosen documents      │
│    ├── Notary port: campaign/fund-flow state and evidence                 │
│    ├── Registry resolver: signed names and organization credentials       │
│    └── Charity financial port: quote · submit · reconcile                 │
└──────────┬──────────────────┬──────────────────┬──────────────────────────┘
           │                  │                  │
           v                  v                  v
  charity deployment   financial provider   issuer / notary / auditor
  campaign + support   movement + finality  claims + public evidence
```

Views never call remote endpoints or signing primitives directly. A charity
repository resolves the pinned deployment, validates objects, obtains local
authorization, invokes adapters, and normalizes typed outcomes.

## 4. Local UI contract

The charity feature consumes an implementation-neutral port. Illustrative
camel-case names below are local application aliases, not wire names or a
required programming language. The mapping to canonical kebab-case operations
in `CharityProfile` is explicit below; local-only helpers do not create wire
operations.

The repository negotiates Donation v1 and Aid v1 independently. A UI can ship
the donation methods without including eligibility-proof code, beneficiary
state, or aid-delivery adapters. It renders an aid journey only when the
selected deployment and installed client both support Aid v1.

```text
resolveProfile(profileReference) -> VerifiedCharityProfile | CharityError
resolveCampaign(campaignReference, trustPolicy) -> CampaignResolution
quoteDonation(campaignRevision, amount, asset, financialBinding) -> DonationQuote
prepareDonation(verifiedCampaign, quote, privacyChoice) -> DonationPreview
authorizeDonation(previewDigest, scopedCapability) -> DonationIntent
submitDonation(intent) -> SubmissionOutcome
watchDonation(intentId) -> DonationReceipt | Pending | TerminalError
requestRefund(receiptId, reasonCapability) -> RefundOutcome
prepareEligibility(campaign, policy, sourceCredential) -> EligibilityPreview
authorizeEligibility(previewDigest, scopedCapability) -> EligibilityPresentation
submitAidClaim(presentation, deliveryChoice) -> AidClaimOutcome
watchAidClaim(claimId) -> AidDisbursementReceipt | Pending | TerminalError
readFundFlow(campaignId, period) -> VerifiedFundFlowReport
reportIssue(objectReference, category, userSelectedEvidence) -> SupportHandoff
```

| Profile | Local port method | Canonical wire operation or local behavior |
|---|---|---|
| Donation v1, Aid v1 | `resolveProfile` | local verification of signed profile resources; no Charity wire operation |
| Donation v1, Aid v1 | `resolveCampaign` | `resolve-campaign` |
| Donation v1 | `quoteDonation` | `quote-donation` |
| Donation v1 | `prepareDonation` | `prepare-donation` |
| Donation v1 | `authorizeDonation` | local identity-vault authorization; no wire operation |
| Donation v1 | `submitDonation` | `submit-donation` |
| Donation v1 | `watchDonation` | repeated `read-donation` reconciliation |
| Donation v1 | `requestRefund` | `request-refund` |
| Aid v1 | `prepareEligibility` | local policy/proof preparation; no wire operation |
| Aid v1 | `authorizeEligibility` | local presentation authorization; no wire operation |
| Aid v1 | `submitAidClaim` | `present-eligibility`, then `claim-aid` if accepted |
| Aid v1 | `watchAidClaim` | repeated `read-aid-claim` reconciliation |
| Donation v1, Aid v1 | `readFundFlow` | `read-fund-flow` |
| Donation v1, Aid v1 | `reportIssue` | user-selected support handoff through the Message boundary; no Charity wire operation |

The repository returns verified domain objects, typed warnings, and evidence.
It never returns a remote provider's HTML, transaction builder, RPC response,
or untrusted display string as executable UI state.

## 5. User-facing journeys

### 5.1 Open a campaign

A user may enter through:

- a charity card in an encrypted conversation;
- a signed campaign deep link or QR code;
- an association-registry or Discovery search;
- a locally saved campaign;
- an authenticated notification referring to a prior operation; or
- manual entry of a campaign reference.

The entry point is a reference, not authority. Before displaying an actionable
campaign, Onym resolves:

1. the Charity Profile and deployment;
2. campaign signature, status, revision, and time bounds;
3. organization credential and current revocation state;
4. the user's selected `TrustPolicy` result;
5. bound financial and notary deployments;
6. privacy, allocation, reporting, finality, and refund policies; and
7. any local warning or block rule.

Onym preserves the friendly title from the signed campaign but renders it as
operator-authored content. A campaign preview cannot imitate a system prompt,
authorization dialog, verified badge, navigation control, or OS payment sheet.

### 5.2 Inspect trust and purpose

The campaign screen shows, with drill-down evidence:

- campaign operator and organization;
- organization name source;
- credential issuer, policy, scope, issue/expiry, and revocation status;
- whether that issuer satisfies the current user-selected trust policy;
- campaign purpose and the author of that description;
- target, dates, accepted assets, and destinations;
- allocation, reporting, refund, and dispute policies;
- known public metadata leakage; and
- notary, financial provider, auditor, and charity operator as distinct roles.

The compact label is “verified by **issuer** under **policy**,” never simply
“verified by Onym.” If the user elects to continue outside the current trust
policy, the UI labels the campaign untrusted and obtains a deliberate policy
override; it does not silently add the issuer to global trust.

### 5.3 Donate

The user selects a supported asset and amount. Onym requests a fresh signed
quote and displays one canonical confirmation screen containing:

- exact gross amount;
- asset and network;
- every fee and fee recipient;
- expected net amount to the campaign;
- exact financial destination and organization binding;
- financial provider and finality rule;
- refund and reversal terms;
- donor data disclosed to the provider, charity, notary, and public;
- whether a tax receipt is available and what extra data it requires; and
- the campaign and organization credential revisions being accepted.

Only after this preview does the identity vault or wallet authorize the exact
canonical bytes. Biometric or device authentication unlocks a scoped local
capability; it is not consent to provider-selected bytes. A changed amount,
asset, destination, fee, campaign revision, privacy choice, or expiry invalidates
the preview and requires a new confirmation.

Submission produces a pending local record keyed by `intentId`. The UI must
reconcile that identifier after timeout or restart before offering “try
again,” preventing an uncertain submission from becoming a second donation.

### 5.4 View a receipt

The activity screen distinguishes:

- prepared locally;
- accepted for submission;
- pending finality;
- finalized;
- failed or expired;
- refund pending, refunded, or refund denied; and
- reversed after apparent finality, when the profile permits reversals.

The receipt is stored locally in the user's encrypted application storage. A
portable export contains the receipt and verification material selected by
the user, excluding local contacts and unrelated messages. A public proof link
is optional and must contain no intentional PII. “Finalized” means only the
pinned financial profile's finality rule was satisfied. Before showing that
state, Onym verifies that the receipt's `intentDigest` matches the exact local
intent bytes the donor authorized.

### 5.5 Request a refund or dispute an outcome

Onym reads the signed refund policy pinned by the original intent, not the
campaign's newest policy. It tells the user which operator decides, which
private data would be sent, the deadline, and the authenticated support route.
A refund request may be signed or accompanied by evidence, but Onym does not
promise its acceptance.

### 5.6 Privately claim aid

The beneficiary flow starts from a signed `EligibilityPolicy` and explains:

- what predicate must be proven;
- which issuer and source credential are accepted;
- which facts remain private and which public inputs are disclosed;
- nullifier scope and lifetime;
- who verifies the presentation;
- what financial or physical delivery data is subsequently required; and
- what public metadata the claim or payout may reveal.

The app constructs a derived presentation locally where the proof profile
supports it. It never uploads the complete identity vault or unrelated
credentials as a convenience. The user previews the predicate, campaign,
campaign revision, epoch, public inputs, nullifier scope, and delivery
disclosure before authorization. A newer campaign revision requires a new
presentation and a fresh decision; it cannot reinterpret the existing proof.

The beneficiary UI does not expose public search, leaderboards, shareable
claim links, or notification text containing aid status. Failed proof details
remain local or in a private support handoff. Approval and disbursement are
shown as separate states.

### 5.7 Inspect transparency and impact

The campaign transparency view separates:

1. **fund flow** — qualifying receipts under a declared measurement profile;
2. **allocation** — an operator or auditor's signed claim about assigned funds;
3. **expenditure** — evidence about outgoing spending; and
4. **impact** — an attributed report about real-world results.

Onym can independently verify cryptographic evidence but cannot independently
verify every off-system fact. The UI always names each report issuer and never
turns one on-chain total into an unqualified impact score.

### 5.8 Choose providers and policies

Advanced settings allow the user to inspect and, where compatible:

- select or import charity deployments;
- choose organization trust policies and issuers;
- choose financial and notary bindings;
- inspect fee and privacy profiles;
- choose default receipt visibility;
- revoke locally granted charity capabilities; and
- export or delete local charity history subject to explicit retained copies.

Defaults are signed catalog recommendations, not permanent authority. Changing
a default does not rewrite in-flight operations or historical receipts.

## 6. Charity messages and links

Charity messages use the ordinary encrypted Onym application envelope. The
message transport sees only its existing opaque routing and ciphertext
metadata. The charity module defines these inner application types:

| Inner type | Purpose | Authoritative content |
|---|---|---|
| `CharityInvite` | propose a charity deployment or support conversation | signed deployment reference |
| `CampaignReference` | share a campaign | campaign ID, revision hint, canonical resolver reference |
| `DonationRequest` | suggest an amount or purpose | unsigned suggestion plus signed campaign reference |
| `DonationReceiptReference` | share selected evidence | receipt digest and optional privacy-safe public reference |
| `EligibilityRequest` | invite a private eligibility flow | signed policy and campaign references |
| `AidClaimStatusReference` | notify a claimant to reconcile privately | opaque claim reference, no status or identity in push text |
| `ReportReference` | share fund-flow, expenditure, audit, or impact material | signed report ID/digest and issuer |
| `CharitySupportHandoff` | begin private support with user-selected context | scoped case ID and explicit attachment list |

Messages do not contain an executable financial transaction. They can propose
an amount, provider, or destination, but Onym re-resolves authoritative state,
fetches a fresh quote, renders canonical terms, and obtains local authorization.

Message signatures prove the application sender; campaign, credential,
financial, and notary signatures prove their separate claims. Receiving a
message from a trusted contact does not make the embedded campaign trusted.

### 6.1 Deep-link rules

A charity deep link contains only:

- interface and profile version;
- campaign or deployment reference;
- optional expected digest/revision;
- optional non-user-specific interface channel; and
- optional sender-authenticated context inside an encrypted message.

It must not contain a mnemonic, private credential, donor ID, beneficiary ID,
wallet secret, persistent referral token, device fingerprint, or auto-submit
flag. Opening a link never authorizes or submits a payment or eligibility claim.

## 7. Blob usage

Large descriptions, audit reports, images, receipts, or voluntarily supplied
support documents are sealed before crossing the Blob boundary. The signed
campaign or report pins the blob digest, media type, length, encryption/key
distribution rule, and author.

Onym applies additional rules:

- external media is never fetched merely to render untrusted rich text;
- active content is disabled or sandboxed;
- size, decompression, media, and rendering limits apply before display;
- a campaign cannot replace content at a pinned digest;
- a user's beneficiary or compliance document is never group-readable by
  default; and
- deleting a local copy does not claim deletion from providers or recipients.

If a regulated provider needs an identity document, Onym opens an explicit
provider handoff naming the controller, purpose, fields, retention, and
destination. The document does not pass through a public charity blob merely
because the Blob port exists.

## 8. Notary and financial adapters

### 8.1 Notary use

Onym may use the abstract notary port to:

- read campaign status and revision commitments;
- verify donation or disbursement receipt commitments;
- read aggregate fund-flow state;
- verify nullifier uniqueness within a campaign/epoch;
- inspect authorized policy or destination changes; and
- resolve public audit/report commitments.

The notary does not receive plaintext messages, source credentials, beneficiary
identities, contact lists, or the identity seed. Its evidence proves only the
pinned notary policy.

### 8.2 Financial port

```text
CharityFinancialPort
  capabilities(binding) -> assets, limits, finality, refund, privacy
  quote(campaignRevision, amount, asset) -> signed DonationQuote
  prepare(quote, intentDigest) -> canonical FinancialAuthorizationPreview
  submit(intent, financialAuthorization) -> SubmissionOutcome
  reconcile(intentId) -> FinancialOutcome + verifiable evidence
  requestRefund(receiptId, authorization) -> RefundOutcome
```

An adapter maps this port to its technology. Wallet SDK types, Soroban
invocations, Stellar addresses, bank API objects, card tokens, and provider
session cookies stay inside the adapter. Onym domain code receives canonical
charity objects and typed outcomes.

The adapter may ask the identity vault to authorize an asset-specific operation
using a key derived for that purpose. It never receives the BIP-39 words or an
unrestricted signing callback. External wallet handoffs must return the exact
intent digest and provider evidence for reconciliation.

### 8.3 Soroban/Stellar selection

A non-public July 2026 draft memorandum considered Soroban on Stellar for a
first physical contract surface. It is non-normative design input, not a
resolvable protocol dependency or evidence that the parties adopted that
choice. If a deployment selects Stellar/Soroban, its implementation profile
must separately define:

- network and contract deployment IDs;
- contract code, interface, and deployment hashes;
- canonical mapping of every Charity object and operation;
- authorization and public-input coverage;
- asset contracts, decimal precision, fees, and destinations;
- simulation, submission, sequence, timeout, finality, and archival rules;
- event schemas and which fields are public;
- upgrade, pause, recovery, and administrative authorities;
- read-provider verification and fork/reorganization handling; and
- golden vectors against `Charity.md`.

Until that document exists and passes conformance tests, “uses Soroban” is an
implementation choice, not evidence that this UI boundary is satisfied.

### 8.4 Provider offers and participant incentives

Onym can present signed offers from independent charity, issuer, financial,
notary, proof, audit, or UI providers. The offer flow reuses the general seat
rules in the whitepaper: the buyer sees the operator, deliverable, price,
limits, evidence, duration, refund terms, settlement destination, and privacy
effect before accepting.

There is no automatic “Onym cut” merely because a campaign appeared in Onym
Messenger. If a campaign operator accepts an Onym UI offer containing a fixed
fee or percentage of qualifying donations, that share is a named line in the
donor's signed quote and receipt whenever it reduces the value reaching the
charity. The same is true for every other participant. A replacement UI may
offer different terms without changing the campaign or user identity.

Offer fulfillment may be proven by an aggregate campaign statement or scoped
receipt references. Onym does not create a persistent donor tag, beneficiary
tag, or downstream royalty relationship. Store billing, direct settlement,
grant funding, sponsorship, and other payment rails require their own current
implementation profiles and do not alter charity authorization semantics.

## 9. Names and organization credentials

An Onym association registry may resolve a human-readable organization name
to an organization key and signed metadata. The charity flow then separately
resolves an `OrganizationCredential` issued under the selected trust policy.

The UI distinguishes:

- **name resolved** — a registry bound the displayed name to a key;
- **credential valid** — an issuer's signature, dates, and status validate;
- **policy accepted** — the credential satisfies this user's trust policy;
- **campaign active** — the campaign controller currently permits actions;
- **financial destination bound** — the exact recipient is signed; and
- **financial outcome finalized** — provider evidence satisfies finality.

None implies the next. A registry operator can also be an issuer, but the UI
still shows both roles and both policies.

## 10. Privacy implementation

### 10.1 Local storage

Onym stores saved campaigns, pending intents, private receipts, eligibility
presentations, and claims in application-protected encrypted storage. It keeps
the minimum material needed for reconciliation and user-requested history.
Cloud backup, export, support attachment, and cross-device sync are explicit
choices with their own disclosure.

### 10.2 No behavioral measurement

The charity module does not add advertising identifiers, third-party analytics,
screen-view beacons, transaction-tracking pixels, address-book upload, device
fingerprinting, or campaign-to-person referral tokens. It does not disclose
who opened, dismissed, donated to, or claimed from a campaign.

The public acquisition metric is contract-observed qualifying fund flow, as
defined by `Charity.md`. A shared `interfaceChannelId = onym-messenger` may be
bound to a campaign quote and receipt when the deployment chooses that weak
aggregate signal. It is not an install measurement, user attribution, or
basis for a continuing cut.

Onym may compute private on-device history or summaries for the user. Those
values do not leave the device unless the user explicitly exports them.

### 10.3 Notifications, logs, and support

- Push payloads use opaque operation references and generic text.
- Lock-screen previews omit campaign, donation, eligibility, and aid status by
  default.
- Production logs exclude message content, credentials, proofs, addresses,
  amounts tied to local identities, and provider compliance responses.
- Crash reports are scrubbed, optional where platform rules permit, and never
  attach arbitrary charity objects.
- Support handoff previews every field and attachment selected by the user.

### 10.4 Honest privacy language

Onym may claim that the messenger protocol and common charity objects are
designed not to intentionally publish donor or beneficiary PII. It must not
claim universal anonymity or guaranteed zero incidents. The UI names metadata
exposed by the selected financial rail, notary, issuer, provider, operating
system, and network path.

## 11. Fund-flow metric in Onym

For the proposed collaboration, “funds attracted through Onym” is implemented
as follows:

1. a signed financial quote proposes the shared `onym-messenger` interface
   channel for an exact campaign revision;
2. the donor-authorized intent pins that quote and repeats the same channel;
3. a finalized receipt copies the channel and proves qualifying funds reached
   the pinned campaign destination;
4. duplicates, refunds, reversals, failed, pending, and expired operations do
   not count;
5. the report declares gross and net amounts separately, with net finalized
   value as the default headline metric; and
6. aggregate evidence is public without donor PII or messenger analytics.

This demonstrates campaign volume under the declared channel convention. It
cannot prove that a person was newly acquired, installed Onym because of the
campaign, saw a particular message, or was uniquely influenced by one party.
The interface channel is copyable; reports must describe this limitation.

The charity operator remains responsible for donor outreach, organization
pipeline, beneficiary participation, and any volume target it accepts. Onym is
responsible for implementing its declared private interaction surface, not for
guaranteeing funds raised.

## 12. Threats and UI responses

| Threat | Required response |
|---|---|
| forged charity card | re-resolve signatures and trust policy; render sender content as untrusted |
| look-alike organization name | show registry, organization key, credential issuer, and destination binding |
| credential revoked after share | refresh status before quote and authorization |
| destination swap | bind destination into campaign, quote, preview, and user authorization |
| fee injection | canonical fee list and arithmetic; any change invalidates preview |
| message requests automatic payment | never execute from a message; require fresh quote and local confirmation |
| stale quote replay | check expiry, intent ID, campaign revision, and provider signature |
| duplicate submission after timeout | reconcile stable intent before resubmission |
| malicious rich report | digest verification, type/size limits, sandboxed rendering |
| global beneficiary correlation | campaign/epoch-scoped nullifiers and scoped identity capabilities |
| public compliance refusal leak | keep reason private; public outcome is minimal typed state |
| misleading transparency | label fund flow, allocation, expenditure, and impact separately |
| compromised read provider | verify profile-defined canonical evidence or compare independent reads |
| adapter requests seed | hard fail; adapters receive scoped operations only |
| analytics SDK observes donation | exclude third-party behavioral analytics from charity flows |
| screenshots or lock-screen leak | privacy screen controls and generic notifications by default |

## 13. Errors presented to users

Onym maps every abstract error code into a stable user action:

| Code | User-facing action |
|---|---|
| `PROFILE_UNSUPPORTED` | Explain that this app lacks the required profile and offer another installed or explicitly selected compatible adapter. |
| `DEPLOYMENT_INVALID` | Block the action and identify the failed binding, signature, hash, status, or validity check. |
| `CAMPAIGN_NOT_ACTIVE` | Disable new donations or claims, show whether the campaign is paused, closed, revoked, or unavailable, and preserve history. |
| `CREDENTIAL_UNTRUSTED` | Show the issuer and policy mismatch; permit only a deliberate scoped policy override where policy allows it. |
| `CREDENTIAL_REVOKED` | Block new action, show authenticated revocation status, and preserve already finalized evidence. |
| `QUOTE_EXPIRED` | Fetch a fresh quote and re-present every term; never reuse the previous authorization. |
| `TERMS_CHANGED` | Compare old and new amount, fee, recipient, provider, privacy, or policy and require a new decision. |
| `AUTHORIZATION_INVALID` | Stop without blind retry, discard the invalid authorization, and return to the canonical preview. |
| `PAYMENT_REQUIRED` | Show the provider's signed service offer separately from the donation or aid value and ask whether to accept it. |
| `COMPLIANCE_REQUIRED` | Name the requesting provider and preview its private compliance handoff before continuing. |
| `PROOF_INVALID` | Keep proof diagnostics private and offer the authenticated issuer or operator support route. |
| `NULLIFIER_USED` | Show that the entitlement was already claimed in this campaign/epoch without exposing a public person identifier. |
| `SUBMISSION_UNKNOWN` | Keep one pending operation and reconcile its stable identifier; do not suggest an immediate duplicate submission. |
| `FINALITY_PENDING` | Explain the selected provider's finality rule without declaring success. |
| `REFUND_DENIED` | Show the authenticated policy reason, original terms, and available dispute or support route. |
| `PRIVACY_PROFILE_MISMATCH` | Stop and show the additional disclosure; never downgrade the user's privacy choice silently. |

Remote error strings are escaped and treated as untrusted text. They cannot
open links, change local trust, trigger authorization, or request a seed phrase.

## 14. Accessibility and coercion resistance

Charity flows often serve people under stress. Onym therefore:

- uses plain language in addition to protocol identifiers;
- does not use countdown pressure except to accurately show quote expiry;
- makes fees, destination, operator, and privacy disclosures screen-reader
  accessible before authorization;
- does not preselect public donor recognition;
- distinguishes decline, close, and later actions without dark patterns;
- supports localization without allowing translation to change signed
  canonical values;
- permits safe exit from beneficiary flows without sending partial proofs; and
- avoids notifications or app-switcher previews that reveal aid participation.

Human-readable translations are signed resources or clearly labeled local
renderings. The canonical operation preview remains inspectable.

## 15. Non-normative MoU design-input mapping

This traceability table records how a non-public July 2026 draft memorandum
influenced the authors' separation of responsibilities. The memorandum is not
required to implement or interpret this profile, is not incorporated by
reference, and does not establish that its placeholders, targets, technology
choice, or legal terms were accepted. `Charity.md` and this document are the
complete public architecture sources for the described boundary.

| MoU concept | Protocol/UI treatment |
|---|---|
| Onym owns messenger architecture, clients, identity, and UX | this document defines that application boundary |
| charity party owns NGO verification, allocation, compliance, and regulators | these remain explicit operator/issuer/provider responsibilities |
| shared contract surface | versioned messages, proofs, operations, evidence, and privacy profiles in `Charity.md` |
| Soroban on Stellar | permitted future financial/notary implementation profile, not hard-coded here |
| verified NGOs as issuers | organization issuers are explicit and trust-policy qualified; NGOs may also issue beneficiary eligibility credentials |
| anonymous aid recipients | derived presentations and scoped nullifiers where the selected proof profile supports them |
| transparent donor fund use | separate fund-flow, allocation, expenditure, audit, and impact claims |
| funds through Onym | aggregate qualifying receipts under a shared interface-channel convention, with stated attribution limits |
| no PII analytics | no person-level charity analytics or referral tokens; public aggregate evidence only |
| zero messenger-side PII incidents | reframed as zero intentional protocol publication plus concrete minimization, testing, and incident duties |
| separate-layer ownership | compatible delivery/ownership declaration |
| joint deployment entity | compatible delivery/ownership declaration |
| public-domain contracts and open deployment | compatible delivery/ownership declaration and public conformance profile |
| open interface specifications | `Charity.md` and implementation profiles remain independently implementable |

Legal names, registration codes, funding targets, chosen ownership model,
binding obligations, grant applications, confidentiality, IP terms, governing
law, and dates belong in executed agreements and signed delivery declarations.
They are intentionally not inferred or finalized by this protocol document.

## 16. Onym conformance tests

An Onym Messenger implementation must run the common tests and the test set for
every profile it advertises. Tests 1–5 and 10–12 are common; 6–7 and 13 are
Donation v1; 8–9 are Aid v1. Tests 14–15 apply to each supported profile:

1. campaign references arriving through message, deep link, QR, registry, and
   manual input all resolve through the same verification path;
2. untrusted rich content cannot imitate system verification or authorization;
3. issuer, policy, revocation, deployment, campaign revision, and destination
   are visible and pinned;
4. any amount, asset, fee, destination, campaign, expiry, provider, or privacy
   mutation invalidates prior authorization;
5. the identity vault rejects seed export and unscoped signing requests;
6. uncertain submission reconciles without creating a second intent;
7. pending, final, refunded, reversed, and failed receipts survive restart,
   and every final receipt matches the locally authorized `intentDigest`;
8. eligibility proofs bind campaign revision, policy, epoch, public inputs,
   and scoped nullifier;
9. aid claims bind the exact presentation, campaign revision, entitlement,
   expiry, and private delivery binding, while public receipts omit recipient
   details;
10. public events, deep links, notifications, logs, and reports pass negative
   PII fixtures;
11. blobs enforce digest, size, media, decompression, and active-content rules;
12. inaccessible, expired, revoked, malformed, oversized, replayed, and
    unknown-critical-field inputs fail safely;
13. aggregate volume excludes duplicates, pending operations, refunds, and
    reversals under declared arithmetic;
14. the same campaign and receipt verify through an independent conforming UI;
    and
15. a mock non-Stellar adapter can satisfy each advertised Charity capability
    and its financial or delivery ports, proving ledger independence.

## 17. Acceptance criteria

The Onym Donation v1 profile is ready for implementation when:

- users can discover, authenticate, donate to, and reconcile a campaign without
  giving the charity their Onym root secret or unrelated message history;
- every trust, financial, notary, registry, and report claim names its author;
- every value-moving operation receives an exact local preview and scoped
  authorization;
- the Onym client contains no required charity behavioral analytics;
- public volume is verifiable under a declared metric without attributing
  people;
- charity, compliance, allocation, custody, and regulator responsibilities stay
  with their declared providers;
- a third party can implement the same UI boundary from the public profiles and
  test vectors; and
- a future Soroban/Stellar adapter can be added without changing Onym screens,
  identity semantics, or the abstract Charity objects.

Aid v1 is independently ready when beneficiaries can complete a supported
private eligibility and delivery flow without a public identity record, its
additional proof/privacy tests pass, and disabling it removes its credential,
presentation, claim, and delivery code without affecting Donation v1.
