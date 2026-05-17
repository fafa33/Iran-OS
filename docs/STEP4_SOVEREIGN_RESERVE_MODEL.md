# Step-4 Sovereign Reserve Model

## Scope And Non-Goals

This document defines the initial Step-4 Sovereign Reserve Model for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, or Step-3 runtime hardening coverage.

Step-4 formalization starts from the premise that IranOS is sovereign resilience infrastructure. The reserve model exists to preserve accounting discipline, backing constraints, emergency continuity, and cross-layer conservation. It is not a DeFi yield, staking, lending, speculative deployment, or capital-efficiency framework.

This document does not claim that formal verification is complete. It provides a specification target for later invariant mapping, tests, audits, or formal-method work.

## Step-3 Preserved Assumptions

The Step-3 runtime hardening matrix remains authoritative for the current hardened runtime baseline. This Step-4 model preserves the following assumptions:

- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeouts, and trigger codes remain unchanged.
- Oracle components remain signal providers, not decision-makers.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.
- Kernel threshold resistance, finality, timeout behavior, invalid input neutrality, and replay resistance remain preserved.
- TriggerProtocol execution neutrality and execution record immutability remain preserved.
- JurySelection selection, vote, verdict, and finality immutability remain preserved.
- AssetFreeze reclaim transfer atomicity and replay resistance remain preserved.
- SovereignWealthFund deposit and withdrawal accounting consistency remain preserved.
- PriceOracle stale read neutrality, invalid submission neutrality, and feeder accounting neutrality remain preserved.
- API3 bridge propagation, duplicate report behavior, and bridged trigger replay resistance remain preserved.

## Core Definitions

- Sovereign Reserve: assets recognized as backing, continuity, or emergency reserves for the sovereign resilience system.
- Treasury Balance: assets under treasury accounting that may include reserve, operational, pending, encumbered, or non-deployable balances.
- Locked Reserve: reserve balance that cannot be deployed, reclassified, or released without the required governance path.
- Deployable Reserve: reserve balance available for permitted sovereign resilience use after satisfying all accounting, governance, and backing constraints.
- Emergency Reserve: reserve balance reserved for bounded emergency use under existing governance and runtime assumptions.
- Reclaimed Asset: asset recovered through the reclaim path and accounted for through the SovereignWealthFund or another explicitly authorized reserve path.
- Sovereign Wealth Fund Balance: accounting state tracked by the SovereignWealthFund for deposits, withdrawals, reclaimed assets, and permitted state transitions.
- Monetary Expansion: any minting, issuance, or supply increase that changes monetary obligations or circulating balance.
- Reserve Backing: recognized reserve value that constrains monetary expansion and prevents unbacked issuance.
- Reserve Classification: the documented assignment of a treasury or reserve balance to a recognized reserve class.
- Reserve Reclassification: any transition from one reserve class to another.
- Encumbered Reserve: reserve value subject to pending obligations, claims, locks, withdrawals, freezes, or other constraints.
- Conservation Boundary: the accounting boundary across treasury, reserve, monetary, freeze, reclaim, oracle, and SovereignWealthFund layers where value must not be created or destroyed by classification.
- Oracle Signal: risk, price, confidence, freshness, or feeder data that may inform review but cannot perform sovereign actions by itself.
- Human Freeze Authority: the final human or governance authority required for freeze decisions and emergency judgment.
- Failed Transition Neutrality: failed calls or invalid paths must revert or fail without unauthorized state mutation.
- Replay Resistance: completed or rejected transitions must not be replayable into duplicate accounting, execution, or release effects.
- Exact-Once Accounting: a valid transition that changes accounting state must apply that accounting effect once and only once.

## Sovereign Reserve Classes

The initial reserve model recognizes reserve classes for specification purposes only:

- Locked Reserve: value held as non-deployable backing or continuity protection.
- Deployable Reserve: value eligible for permitted treasury use after satisfying governance and backing constraints.
- Emergency Reserve: value reserved for bounded emergency response.
- Encumbered Reserve: value constrained by pending claims, freezes, obligations, withdrawals, or unresolved classification state.
- Reclaimed Reserve: value recovered through authorized reclaim paths and credited only through exact-once accounting.
- Non-Reserve Treasury Balance: treasury value not recognized as reserve backing until explicitly classified through a permitted governance path.

Reserve classes do not create value. Classification and reclassification only describe allowed accounting state.

## Treasury Accounting Rules

Treasury accounting must preserve cross-layer conservation:

- A reserve classification must not increase total recognized value.
- A reserve reclassification must debit one class and credit another class within the same conservation boundary.
- Encumbered value must not be counted as freely deployable.
- Locked value must not become deployable through implicit accounting movement.
- Emergency reserve use must remain bounded by existing governance and runtime assumptions.
- Reclaimed assets must enter accounting through an authorized path and must not duplicate prior accounting history.
- Failed, unauthorized, zero-value, over-withdrawal, stale, or replayed paths must remain state-neutral where Step-3 already requires neutrality.
- Valid withdrawals and transfers must preserve exact-once accounting.

## Reserve Classification Protocol

Reserve classification is a governance and accounting process. It must not be performed autonomously by oracle data, automation, bridge reports, or price feeds.

A valid classification protocol must preserve these properties:

- It must identify the source balance and target reserve class.
- It must respect locks, freezes, pending withdrawals, and encumbrances.
- It must preserve total value across the conservation boundary.
- It must not classify stale, invalid, or unauthorized oracle data as sovereign action.
- It must not unlock locked value implicitly.
- It must not bypass governance requirements.
- It must produce an auditable classification state suitable for later invariant tests or formal checks.

## Monetary Expansion Constraints

Monetary expansion must remain constrained by reserve backing. A future formal rule may define a more precise backing equation, but Step-4 starts with the following constraints:

- Monetary expansion must not exceed recognized reserve backing.
- Encumbered, frozen, pending, or locked reserves must not be double-counted as deployable backing.
- Reclassification must not create additional backing.
- Emergency reserve use must not become an indirect minting path.
- Oracle prices, confidence values, and feeder submissions may inform risk review but must not mint, burn, expand, or contract monetary supply autonomously.
- No monetary expansion rule may alter existing thresholds, timeout constants, trigger codes, Kernel assumptions, or governance assumptions.

## Cross-Layer Conservation Invariants

The following conservation invariants are the first Step-4 formalization targets:

- Treasury, reserve, and SovereignWealthFund balances must conserve value across valid transitions.
- Classification and reclassification must not create value, destroy value, unlock value implicitly, or duplicate backing.
- Failed reserve, reclaim, withdrawal, classification, oracle, bridge, trigger, or freeze-related paths must not mutate protected state outside their authorized behavior.
- Replayed withdrawals, reclaim transfers, trigger executions, or classification actions must not duplicate accounting effects.
- Monetary expansion must remain bounded by recognized reserve backing.
- Oracle signals must not cross into autonomous classification, freeze, unfreeze, mint, burn, transfer, or governance execution.
- Human final freeze authority must remain outside automation.
- Emergency reserve use must remain bounded and auditable.
- Step-3 Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge invariants must remain preserved.

## Sovereign Wealth Fund State Transitions

SovereignWealthFund state transitions must remain accounting-conservative:

- Valid reclaimed deposits may increase recognized SovereignWealthFund accounting only through authorized paths.
- Zero-value and unauthorized reclaimed deposits must remain state-neutral.
- Valid L1 withdrawal execution must update accounting exactly once.
- Over-withdrawal execution must remain state-neutral.
- Executed withdrawals must not replay accounting mutation.
- Reclaim transfers must preserve atomicity and replay resistance.
- SovereignWealthFund balances must not be treated as speculative capital or deployed for yield, staking, lending, or capital-efficiency optimization.
- SovereignWealthFund state must remain subordinate to reserve discipline, monetary constraints, and existing governance assumptions.

## Oracle Signal Boundaries

Oracle components may provide risk, price, confidence, freshness, feeder, or bridge signals. They must not become autonomous decision-makers.

Oracle signals must not:

- Classify reserves.
- Reclassify reserves.
- Freeze assets.
- Unfreeze assets.
- Mint supply.
- Burn supply.
- Transfer assets.
- Execute treasury actions.
- Override human freeze authority.
- Bypass Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, or governance constraints.

Stale, invalid, unauthorized, repeated, or low-confidence oracle data must preserve the neutrality and accounting assumptions already captured by Step-3 where applicable.

## Human Authority Boundaries

Final freeze authority must remain human or governance-controlled. Automation may surface signals, preserve audit trails, or enforce already-authorized state transitions, but it must not replace final judgment for freezes or emergency classification.

Human authority boundaries must preserve:

- Final freeze judgment outside autonomous automation.
- Existing governance assumptions.
- Existing Kernel immutability and trigger assumptions.
- Existing thresholds and timeout constants.
- Auditable distinction between signal, recommendation, authorization, and execution.

## Forbidden Changes

This Step-4 artifact explicitly forbids the following changes:

- Do not make the Kernel upgradeable.
- Do not alter Kernel immutability.
- Do not change thresholds.
- Do not change timeout constants.
- Do not change trigger codes.
- Do not convert constitutional constants into mutable configuration.
- Do not redesign contracts as part of this artifact.
- Do not change tests as part of this artifact.
- Do not introduce staking, lending, speculative deployment, DeFi yield, or capital-efficiency framing.
- Do not allow oracle-driven autonomous reserve classification.
- Do not allow oracle-driven autonomous freeze or unfreeze decisions.
- Do not allow oracle-driven autonomous minting, burning, or asset transfer.
- Do not automate final human freeze authority.
- Do not weaken reserve discipline, monetary constraints, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Initial Formalization Invariants

The initial invariant set for later mapping is:

| Invariant | Specification target |
| --- | --- |
| Reserve conservation | Valid reserve transitions debit and credit within the same conservation boundary without creating value. |
| Classification neutrality | Classification and reclassification do not create value, unlock value implicitly, or bypass governance. |
| Backing constraint | Monetary expansion remains bounded by recognized reserve backing. |
| Encumbrance discipline | Encumbered, locked, frozen, or pending value is not double-counted as deployable backing. |
| Exact-once SWF accounting | Valid SWF deposits and withdrawals update accounting once and only once. |
| Failed-path neutrality | Failed, invalid, unauthorized, stale, zero-value, over-withdrawal, or replayed paths preserve protected state. |
| Oracle boundary | Oracle signals inform risk state only and do not autonomously classify, freeze, unfreeze, mint, burn, or transfer. |
| Human freeze authority | Final freeze authority remains outside automation. |
| Emergency boundedness | Emergency reserve use remains bounded by existing governance and runtime assumptions. |
| Step-3 preservation | Step-4 formalization does not weaken Step-3 runtime hardening invariants. |

## Open Audit Questions

- What exact reserve backing equation should be used for later monetary expansion tests?
- Which existing treasury and SovereignWealthFund balances map to each reserve class?
- Which reserve classes require explicit governance approval before reclassification?
- How should stale or low-confidence oracle data be represented in reserve risk review without becoming autonomous authority?
- Which existing Step-3 non-blocking gaps should become Step-4 invariant tests?
- What event or record structure is sufficient to audit classification and reclassification without contract redesign?
- Which emergency reserve actions require additional documentation before implementation is considered?
- How should encumbered reserves be counted when multiple pending claims or freezes overlap?
