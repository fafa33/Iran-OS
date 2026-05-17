# Step-4.1 Treasury Accounting Rules

## Scope And Non-Goals

This document defines the Step-4.1 Treasury Accounting Rules for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, or Step-3 runtime hardening coverage.

Step-4.1 narrows the Step-4 Sovereign Reserve Model into treasury accounting rules, balance classes, permitted accounting transitions, failed-path neutrality, replay resistance, exact-once accounting, and reserve backing discipline. It does not implement enforcement and does not claim formal verification is complete.

IranOS is sovereign resilience infrastructure. Treasury accounting exists to preserve reserve discipline, monetary backing, emergency continuity, and cross-layer conservation. It is not a DeFi yield, staking, lending, speculative deployment, treasury yield, or capital-efficiency framework.

## Preserved Checkpoints

Step-4.1 preserves the following checkpoint assumptions:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 sovereign reserve formalization has started but is not complete.
- The Step-4 Sovereign Reserve Model remains the parent specification for this treasury accounting artifact.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- Oracle components remain signal providers, not decision-makers.
- Human final freeze authority remains outside automation.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-4.1 also preserves the Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

## Accounting Boundary Definitions

- Treasury Accounting Boundary: the set of balances, transitions, and records that determine treasury value, reserve value, deployable value, encumbered value, pending value, and recognized backing.
- Conservation Boundary: the cross-layer accounting perimeter across treasury, reserve, monetary, freeze, reclaim, oracle, and SovereignWealthFund state where value must not be created by classification or destroyed by failed execution.
- Reserve Backing Boundary: the subset of recognized reserves that may constrain monetary expansion after excluding value that is encumbered, frozen, locked, pending, invalid, or already counted elsewhere.
- Encumbrance Boundary: the state boundary around obligations, freezes, pending withdrawals, pending classification, pending reclassification, or other restrictions that prevent value from appearing deployable.
- SovereignWealthFund Interface Boundary: the accounting relationship between treasury and SovereignWealthFund state for reclaimed deposits, withdrawals, layer balances, and exact-once accounting.
- Oracle Signal Boundary: the separation between oracle-provided risk, price, confidence, freshness, feeder, or bridge data and any sovereign accounting action.
- Human Authority Boundary: the separation between automated signals or records and final human or governance judgment for freeze and emergency decisions.

## Balance Classes

Treasury accounting may reference the following balance classes for formalization purposes:

- Recognized Reserve Balance: value recognized as reserve backing or sovereign continuity reserve after permitted classification.
- Locked Balance: value that cannot be deployed, reclassified, released, or counted as deployable without the required governance path.
- Frozen Balance: value affected by freeze state and unavailable for deployable use until released through authorized human or governance authority.
- Encumbered Balance: value subject to pending obligations, claims, withdrawals, freezes, locks, or unresolved classification state.
- Pending Balance: value awaiting authorized deposit, withdrawal, classification, reclassification, settlement, or review.
- Deployable Balance: value eligible for permitted sovereign resilience use after satisfying accounting, governance, lock, freeze, encumbrance, and backing constraints.
- Reclaimed Balance: value recovered through an authorized reclaim path and credited only through exact-once accounting.
- SovereignWealthFund Balance: value tracked by the SovereignWealthFund for deposits, withdrawals, reclaimed assets, and layer accounting.
- Non-Reserve Treasury Balance: treasury value not recognized as reserve backing until explicitly classified through a permitted governance path.

Balance classes are accounting labels. They do not create value, unlock value, or bypass governance.

## Permitted Accounting Transitions

A permitted accounting transition must satisfy all applicable authorization, accounting, governance, and conservation rules. At the specification level, permitted transitions may include:

- Non-reserve treasury balance to recognized reserve balance after authorized classification.
- Recognized reserve balance to another reserve class after authorized reclassification.
- Reclaimed asset to reclaimed balance through an authorized reclaim path.
- Reclaimed balance to SovereignWealthFund balance through exact-once accounting.
- SovereignWealthFund balance decrease through a valid withdrawal executed once.
- Deployable balance decrease through an authorized treasury action.
- Encumbered, pending, locked, or frozen balance release only through the required authorization path.

Every permitted transition must identify the source balance, target balance, authorization basis, conservation boundary, and accounting effect. A transition must not increase total recognized value through classification or reclassification.

## Failed And Replayed Transition Rules

Failed and replayed transitions must preserve protected state.

- Failed authorization must not mutate treasury, reserve, or SovereignWealthFund accounting.
- Zero-value accounting attempts must not create recognized value.
- Over-withdrawal attempts must remain state-neutral.
- Replayed withdrawals must not duplicate accounting mutation.
- Replayed reclaim transfers must not duplicate reclaimed or SovereignWealthFund accounting.
- Replayed trigger or bridge paths must not duplicate treasury execution effects.
- Invalid, stale, unauthorized, or low-confidence oracle data must not create accounting state transitions.
- Failed classification or reclassification must not unlock value, release encumbrances, or change recognized backing.

These rules preserve Step-3 failed-path neutrality, replay resistance, and exact-once accounting assumptions.

## Encumbrance And Lock Discipline

Encumbered, frozen, locked, or pending value must not appear deployable.

- Locked value remains non-deployable until the required governance path releases or reclassifies it.
- Frozen value remains non-deployable until final human or governance authority authorizes release.
- Pending value remains non-deployable until the relevant deposit, withdrawal, classification, reclassification, or review is complete.
- Encumbered value must not be double-counted as recognized reserve backing and deployable balance at the same time.
- A release from encumbrance must preserve conservation by moving value between classes without creating value.
- Emergency reserve use must remain bounded, auditable, and subordinate to existing governance and runtime assumptions.

## Reclaimed Asset Accounting

Reclaimed asset accounting must preserve atomicity, replay resistance, and exact-once accounting.

- Reclaimed assets must enter accounting only through authorized reclaim paths.
- A valid reclaimed deposit may credit recognized accounting once and only once.
- Unauthorized reclaimed deposits must remain state-neutral.
- Zero-value reclaimed deposits must remain state-neutral.
- Duplicate reclaim transfer attempts must not mutate reclaim state or SovereignWealthFund accounting twice.
- A failed transfer to the SovereignWealthFund must revert without mutating protected reclaim or accounting state.
- Reclaimed assets must not be treated as speculative capital, treasury yield, staking collateral, lending inventory, or capital-efficiency input.

## SovereignWealthFund Accounting Interface

The SovereignWealthFund accounting interface preserves the Step-3 SWF accounting baseline:

- Valid reclaimed deposits preserve prior accounting history.
- Unauthorized and zero-value reclaimed deposits remain state-neutral.
- Valid L1 withdrawal execution updates accounting exactly once.
- Over-withdrawal execution remains state-neutral.
- Executed withdrawals cannot replay accounting mutation.
- Reclaim transfer failures preserve reclaim state and SovereignWealthFund accounting.
- SovereignWealthFund balances remain subject to reserve discipline, monetary constraints, and governance assumptions.

The SovereignWealthFund interface must not become a bypass around reserve classification, monetary backing constraints, or human freeze authority.

## Monetary Backing Constraints

Monetary expansion must remain bounded by reserve backing constraints.

- Reserve backing must not be double-counted across treasury, reserve, monetary, or SovereignWealthFund layers.
- Encumbered, frozen, locked, pending, or already-counted value must not appear as deployable backing.
- Reclassification must not create additional backing.
- Emergency reserve use must not become an indirect minting path.
- Oracle prices, confidence values, and feeder submissions may inform risk review but must not mint, burn, expand, or contract monetary supply autonomously.
- No monetary backing rule may change thresholds, timeout constants, trigger codes, Kernel assumptions, or governance assumptions.

## Oracle Signal Accounting Boundaries

Oracle signals may inform risk state only. They must not create treasury accounting effects by themselves.

Oracle signals must not autonomously:

- Classify reserves.
- Reclassify reserves.
- Freeze assets.
- Unfreeze assets.
- Mint supply.
- Burn supply.
- Transfer assets.
- Execute treasury actions.
- Release encumbered, locked, frozen, or pending value.
- Override human freeze authority.

Stale, invalid, unauthorized, repeated, or low-confidence oracle data must preserve the neutrality and accounting assumptions already captured by Step-3 where applicable.

## Human Authority Boundaries

Final freeze authority remains human or governance-controlled. Automation may surface signals, preserve audit trails, or enforce already-authorized state transitions, but it must not replace final judgment for freezes or emergency reserve decisions.

Treasury accounting must preserve an auditable distinction between:

- Signal.
- Review.
- Recommendation.
- Authorization.
- Execution.
- Accounting mutation.

No accounting rule may collapse these stages into autonomous oracle or automation authority.

## Initial Treasury Accounting Invariants

| Invariant | Specification target |
| --- | --- |
| Total value conservation | Valid accounting transitions debit and credit within the same conservation boundary without creating value. |
| Classification conservation | Classification and reclassification do not increase total recognized value. |
| No implicit unlock | Locked, frozen, encumbered, or pending value cannot become deployable through implicit accounting movement. |
| No double-counted backing | Reserve backing cannot be counted twice across treasury, reserve, monetary, or SovereignWealthFund layers. |
| Exact-once SWF mutation | Valid SovereignWealthFund deposits and withdrawals update accounting once and only once. |
| Reclaim atomicity | Failed reclaim transfers revert without mutating protected reclaim or SovereignWealthFund state. |
| Failed-path neutrality | Failed, invalid, unauthorized, stale, zero-value, over-withdrawal, or replayed paths preserve protected accounting state. |
| Replay resistance | Completed accounting effects cannot be replayed into duplicate mutations. |
| Oracle boundary | Oracle signals inform risk state only and do not autonomously classify, freeze, unfreeze, mint, burn, transfer, or execute treasury actions. |
| Human freeze authority | Final freeze authority remains outside automation. |
| Emergency boundedness | Emergency reserve use remains bounded, auditable, and subordinate to existing governance and runtime assumptions. |
| Step-3 preservation | Treasury accounting formalization does not weaken Step-3 runtime hardening invariants. |
| Step-4 preservation | Treasury accounting formalization remains subordinate to the Step-4 Sovereign Reserve Model. |

## Forbidden Assumptions

This Step-4.1 artifact forbids the following assumptions:

- Do not make the Kernel upgradeable.
- Do not alter Kernel immutability.
- Do not change thresholds.
- Do not change timeout constants.
- Do not change trigger codes.
- Do not change constitutional constants.
- Do not convert constitutional constants into mutable configuration.
- Do not redesign contracts as part of this artifact.
- Do not change tests as part of this artifact.
- Do not introduce staking, lending, speculative deployment, treasury yield, DeFi yield, or capital-efficiency framing.
- Do not treat SovereignWealthFund balances as speculative capital.
- Do not allow oracle-driven autonomous accounting transitions.
- Do not allow oracle-driven autonomous reserve classification.
- Do not allow oracle-driven autonomous freeze or unfreeze decisions.
- Do not allow oracle-driven autonomous minting, burning, transfer, or treasury execution.
- Do not automate final human freeze authority.
- Do not weaken reserve discipline, monetary constraints, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Open Audit Questions

- Which current treasury balances map to recognized reserve, non-reserve, locked, frozen, encumbered, pending, deployable, and reclaimed balance classes?
- What exact reserve backing equation should later constrain monetary expansion tests?
- Which existing events or records are sufficient to audit classification without contract redesign?
- How should overlapping freezes, pending withdrawals, and classification reviews be represented without double-counting encumbrance?
- Which Step-3 non-blocking oracle gaps should become Step-4.1 accounting neutrality tests later?
- What documentation is required before emergency reserve use can be considered implementation-ready?
- How should SovereignWealthFund layer balances be referenced in reserve backing without double-counting?
- Which future tests should prove failed classification and reclassification neutrality?
