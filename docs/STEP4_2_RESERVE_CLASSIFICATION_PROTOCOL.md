# Step-4.2 Reserve Classification Protocol

## Scope And Non-Goals

This document defines the Step-4.2 Reserve Classification Protocol for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, or Step-3 runtime hardening coverage.

Step-4.2 refines the Step-4 Sovereign Reserve Model and Step-4.1 Treasury Accounting Rules by defining reserve classification states, allowed transitions, forbidden transitions, authority boundaries, exact-once classification accounting, failed-path neutrality, and replay resistance.

IranOS is sovereign resilience infrastructure. Reserve classification exists to preserve accounting discipline, backing constraints, emergency continuity, and cross-layer conservation. It is not a DeFi yield, staking, lending, treasury yield, speculative deployment, or capital-efficiency framework.

This document does not implement enforcement and does not claim formal verification is complete.

## Preserved Checkpoints

Step-4.2 preserves the following checkpoint assumptions:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 sovereign reserve formalization has started but is not complete.
- Step-4.1 treasury accounting rules are the accounting baseline for classification and reclassification.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- Oracle components remain signal providers, not decision-makers.
- Human final freeze authority remains outside automation.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-4.2 preserves the Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

## Reserve Classification Definitions

- Reserve Classification: assignment of a treasury or reserve balance to a recognized reserve state through an authorized governance or accounting path.
- Reserve Reclassification: transition of an already classified balance from one reserve state to another through an authorized governance or accounting path.
- Classification Source: the balance, record, reclaimed asset, or treasury value proposed for classification.
- Classification Target: the reserve state proposed as the destination for a classification or reclassification.
- Classification Authority: the human, governance, or explicitly authorized process permitted to approve classification or reclassification.
- Classification Review: an auditable review stage that may consider accounting state, reserve constraints, emergency context, and oracle signals without itself mutating reserve state.
- Classification Execution: the authorized accounting state transition that records a completed classification or reclassification.
- Classification Rejection: a final state showing that a proposed classification or reclassification did not meet the required authority, accounting, or conservation conditions.
- Classification Neutrality: failed, invalid, unauthorized, stale, zero-value, or replayed classification attempts must not mutate protected reserve or treasury state.
- Exact-Once Classification Accounting: a valid classification or reclassification must apply its accounting effect once and only once.

## Reserve Classification States

The protocol recognizes the following classification states for specification purposes:

- Unclassified Treasury Balance: treasury value not yet classified as reserve backing or reserve continuity value.
- Non-Reserve Treasury Balance: treasury value reviewed and not recognized as reserve backing.
- Pending Classification: value under review for first-time classification.
- Recognized Reserve: value recognized as sovereign reserve after authorized classification.
- Locked Reserve: reserve value that cannot be deployed, released, or reclassified without the required governance path.
- Deployable Reserve: reserve value eligible for permitted sovereign resilience use after satisfying accounting, governance, lock, freeze, encumbrance, and backing constraints.
- Emergency Reserve: reserve value reserved for bounded emergency response under existing governance and runtime assumptions.
- Encumbered Reserve: reserve value constrained by pending obligations, claims, withdrawals, freezes, locks, or unresolved classification state.
- Frozen Reserve: reserve value affected by freeze state and unavailable for deployable use until released through final human or governance authority.
- Pending Reclassification: classified value under review for movement from one reserve state to another.
- Rejected Classification: failed or denied classification or reclassification proposal with no accounting mutation beyond the auditable rejection record.
- Reclaimed Reserve: value recovered through authorized reclaim paths and credited only through exact-once accounting.

These states are accounting labels. They do not create value, unlock value, or bypass governance.

## Allowed Classification Transitions

Allowed transitions are specification targets for future mapping. They require proper authorization, accounting conservation, and respect for encumbrance, lock, freeze, and backing constraints.

- Unclassified Treasury Balance -> Pending Classification.
- Pending Classification -> Recognized Reserve.
- Pending Classification -> Non-Reserve Treasury Balance.
- Pending Classification -> Rejected Classification.
- Recognized Reserve -> Pending Reclassification.
- Pending Reclassification -> Locked Reserve.
- Pending Reclassification -> Deployable Reserve.
- Pending Reclassification -> Emergency Reserve.
- Pending Reclassification -> Encumbered Reserve.
- Pending Reclassification -> Rejected Classification.
- Reclaimed Reserve -> Recognized Reserve, only through authorized exact-once accounting.
- Deployable Reserve -> Encumbered Reserve when obligations, pending withdrawals, claims, or freeze-related constraints attach.
- Encumbered Reserve -> Deployable Reserve only after authorized release and conservation checks.
- Any eligible reserve -> Frozen Reserve only through existing authorized freeze paths.
- Frozen Reserve -> prior eligible reserve class only after final human or governance release authority.

Every allowed transition must identify source state, target state, authorization basis, conservation boundary, accounting effect, and audit record.

## Forbidden Classification Transitions

The following transitions are forbidden:

- Any oracle signal directly classifying or reclassifying reserves.
- Any automation directly freezing, unfreezing, minting, burning, transferring, unlocking, or executing treasury actions.
- Locked Reserve -> Deployable Reserve without required governance authority.
- Frozen Reserve -> Deployable Reserve without final human or governance release.
- Encumbered Reserve -> Deployable Reserve while obligations, pending withdrawals, freezes, claims, or locks remain active.
- Pending Classification -> Recognized Reserve from stale, invalid, unauthorized, or low-confidence oracle data alone.
- Any classification or reclassification that increases total recognized value.
- Any classification or reclassification that creates additional reserve backing.
- Any transition that double-counts reserve backing across treasury, reserve, monetary, or SovereignWealthFund layers.
- Any emergency reserve transition that becomes an indirect minting path.
- Any transition that weakens Step-3 failed-path neutrality, replay resistance, exact-once accounting, or runtime hardening invariants.
- Any transition that changes thresholds, timeout constants, trigger codes, Kernel assumptions, or governance assumptions.

## Reclassification Governance Boundaries

Reserve reclassification is a governance and accounting process. It must not be performed autonomously by oracle data, bridge reports, price feeds, automation, or accounting labels.

Reclassification must preserve:

- Required human or governance authorization.
- Existing Kernel immutability and trigger assumptions.
- Existing thresholds, timeout constants, trigger codes, and constitutional constants.
- Total value conservation across the classification boundary.
- Reserve backing discipline and no double-counting.
- Auditability of source state, target state, authority, reason, and accounting effect.

Reclassification must not create value, unlock value implicitly, release encumbrances implicitly, bypass governance, or convert emergency context into an automatic treasury action.

## Encumbered / Locked / Pending State Discipline

Encumbered, locked, frozen, or pending reserves must not appear deployable.

- Locked Reserve remains non-deployable until the required governance path releases or reclassifies it.
- Frozen Reserve remains non-deployable until final human or governance authority authorizes release.
- Encumbered Reserve remains non-deployable while obligations, pending withdrawals, freezes, claims, or locks remain active.
- Pending Classification remains non-deployable until classification is approved or rejected.
- Pending Reclassification remains non-deployable unless the source state was already deployable and the transition preserves all deployability constraints.
- Rejected Classification must not mutate recognized backing or deployable balance.
- A release from encumbrance must conserve value by moving value between states without creating value or duplicating backing.

## Oracle Signal Boundaries

Oracle signals may inform review or risk state only. They must not autonomously classify, reclassify, freeze, unfreeze, mint, burn, transfer, unlock, release encumbrances, or execute treasury actions.

Oracle inputs may include price, confidence, freshness, feeder, risk, or bridge signals. These inputs may support review, audit records, or risk flags, but they are not classification authority.

Stale, invalid, unauthorized, repeated, or low-confidence oracle data must preserve the neutrality and accounting assumptions already captured by Step-3 where applicable.

## Human Authority Boundaries

Human or governance authority remains final for classification decisions that affect freeze, release, emergency reserve use, or deployability.

The protocol must preserve an auditable distinction between:

- Signal.
- Review.
- Recommendation.
- Authorization.
- Classification execution.
- Accounting mutation.

Automation may surface signals, preserve audit trails, or enforce already-authorized transitions. It must not replace final human or governance judgment.

## Exact-Once Classification Accounting

Classification and reclassification must apply accounting effects once and only once.

- A completed classification must not be replayed into a second credit of recognized reserve value.
- A completed reclassification must not duplicate backing across source and target states.
- Reclaimed reserve classification must preserve authorized exact-once accounting.
- Classification execution must debit the source state and credit the target state within the same conservation boundary.
- Rejection must not alter recognized reserve backing or deployable value.
- Audit records must not be interpreted as additional reserve value.

## Failed And Replayed Classification Neutrality

Failed and replayed classification paths must preserve protected state.

- Failed authorization must not mutate reserve or treasury accounting.
- Failed conservation checks must not mutate reserve or treasury accounting.
- Zero-value classification attempts must not create recognized value.
- Stale, invalid, unauthorized, repeated, or low-confidence oracle data must not cause classification mutation.
- Replayed classification execution must not duplicate recognized value.
- Replayed reclassification execution must not duplicate backing or unlock value.
- Failed emergency classification must not release emergency reserves or create deployable balance.

These rules preserve Step-3 failed-path neutrality, replay resistance, and Step-4.1 exact-once accounting assumptions.

## Emergency Classification Constraints

Emergency reserve classification must remain bounded and auditable.

- Emergency classification must require the appropriate human or governance authority.
- Emergency classification must not create value.
- Emergency classification must not double-count backing.
- Emergency classification must not unlock locked, frozen, encumbered, or pending value implicitly.
- Emergency classification must not become an indirect minting path.
- Emergency classification must not allow oracle signals to become autonomous decision-makers.
- Emergency classification must preserve existing thresholds, timeout constants, trigger codes, Kernel assumptions, and governance assumptions.

## Initial Classification Invariants

| Invariant | Specification target |
| --- | --- |
| Classification conservation | Classification and reclassification debit and credit within the same conservation boundary without creating value. |
| No implicit unlock | Classification cannot unlock locked, frozen, encumbered, or pending value without required authority. |
| No double-counted backing | Classified reserve backing cannot be counted twice across treasury, reserve, monetary, or SovereignWealthFund layers. |
| Exact-once classification | Valid classification and reclassification apply accounting effects once and only once. |
| Failed-path neutrality | Failed, invalid, unauthorized, stale, zero-value, rejected, or replayed classification paths preserve protected state. |
| Replay resistance | Completed classifications and reclassifications cannot be replayed into duplicate accounting mutation. |
| Oracle boundary | Oracle signals inform review or risk state only and do not autonomously classify, freeze, unfreeze, mint, burn, transfer, unlock, or execute treasury actions. |
| Human authority | Human or governance authority remains final for classification decisions affecting freeze, release, emergency reserve use, or deployability. |
| Emergency boundedness | Emergency reserve classification remains bounded, auditable, and subordinate to existing governance and runtime assumptions. |
| Step-3 preservation | Classification formalization does not weaken Step-3 runtime hardening invariants. |
| Step-4 preservation | Classification formalization remains subordinate to the Step-4 Sovereign Reserve Model and Step-4.1 Treasury Accounting Rules. |

## Forbidden Assumptions

This Step-4.2 artifact forbids the following assumptions:

- Do not make the Kernel upgradeable.
- Do not alter Kernel immutability.
- Do not change thresholds.
- Do not change timeout constants.
- Do not change trigger codes.
- Do not change constitutional constants.
- Do not convert constitutional constants into mutable configuration.
- Do not redesign contracts as part of this artifact.
- Do not change tests as part of this artifact.
- Do not introduce staking, lending, treasury yield, speculative deployment, DeFi yield, or capital-efficiency framing.
- Do not treat reserve classification as a yield, deployment, or capital-efficiency decision.
- Do not allow oracle-driven autonomous reserve classification or reclassification.
- Do not allow oracle-driven autonomous freeze or unfreeze decisions.
- Do not allow oracle-driven autonomous minting, burning, transfer, unlocking, or treasury execution.
- Do not automate final human or governance authority.
- Do not weaken reserve discipline, monetary constraints, treasury accounting constraints, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Open Audit Questions

- Which existing records or events are sufficient to audit classification state without contract redesign?
- Which authority path should be documented for each reserve classification state?
- How should a rejected classification be recorded without creating accounting side effects?
- How should overlapping freezes, encumbrances, pending withdrawals, and classification reviews be represented without double-counting?
- Which Step-3 non-blocking oracle gaps should later become classification neutrality tests?
- What evidence is required before emergency reserve classification can be considered implementation-ready?
- How should reclaimed reserves move into recognized reserves without duplicating SovereignWealthFund accounting?
- Which future tests should prove failed and replayed classification neutrality?
