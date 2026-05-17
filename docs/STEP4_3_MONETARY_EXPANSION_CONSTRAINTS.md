# Step-4.3 Monetary Expansion Constraints

## Scope And Non-Goals

This document defines the Step-4.3 Monetary Expansion Constraints for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, or Step-3 runtime hardening coverage.

Step-4.3 refines the Step-4 Sovereign Reserve Model, Step-4.1 Treasury Accounting Rules, and Step-4.2 Reserve Classification Protocol by defining the constraints that must bound monetary expansion. It does not implement enforcement, alter monetary constants, redesign minting logic, or claim formal verification is complete.

IranOS is sovereign resilience infrastructure. Monetary expansion exists only within sovereign reserve discipline, recognized backing, and constitutional monetary constraints. It is not a DeFi yield, staking, lending, treasury yield, speculative deployment, or capital-efficiency framework.

## Preserved Checkpoints

Step-4.3 preserves the following checkpoint assumptions:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 sovereign reserve formalization has started but is not complete.
- Step-4.1 treasury accounting rules remain the accounting baseline for monetary backing.
- Step-4.2 reserve classification protocol remains the classification baseline for recognized backing.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle components remain signal providers, not decision-makers.
- Human final freeze authority remains outside automation.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-4.3 preserves the Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

## Monetary Expansion Definitions

- Monetary Expansion: any minting, issuance, or supply increase that changes circulating monetary supply or monetary obligations.
- Recognized Reserve Backing: reserve value that has passed authorized classification and is eligible to constrain monetary expansion after excluding encumbered, frozen, locked, pending, unclassified, or already-counted value.
- Expansion Eligibility: the set of conditions that must hold before any monetary expansion can be considered valid.
- Liquidity Cap: the existing `LIQUIDITY_CAP` monetary constant. Step-4.3 preserves it as unchanged and non-configurable.
- Minimum Reserve Ratio: the existing `MIN_RESERVE_RATIO` monetary constant. Step-4.3 preserves it as unchanged and non-configurable.
- Hidden Minting Path: any indirect route that increases supply or expansion capacity through treasury accounting, SovereignWealthFund accounting, reserve reclassification, emergency reserve state, oracle signal, replay, or failed-path side effect.
- Under-Backed Expansion: any expansion that would violate recognized reserve backing constraints or the preserved `MIN_RESERVE_RATIO`.
- Over-Cap Expansion: any expansion that would violate the preserved `LIQUIDITY_CAP`.
- Expansion Neutrality: failed, unauthorized, over-cap, under-backed, stale, invalid, or replayed expansion attempts must not mutate protected monetary, reserve, treasury, or SovereignWealthFund state.

## Backing Boundary Definitions

- Monetary Backing Boundary: the accounting perimeter that determines which recognized reserves may constrain monetary expansion.
- Reserve Recognition Boundary: the point at which classified value becomes recognized reserve backing through an authorized classification path.
- Exclusion Boundary: the set of balances excluded from deployable backing, including encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted reserves.
- SovereignWealthFund Backing Boundary: the interface between SovereignWealthFund accounting and recognized backing, limited to authorized exact-once recognized backing paths.
- Oracle Signal Boundary: the separation between oracle-provided data and any monetary expansion, contraction, classification, unlock, transfer, or treasury execution.
- Emergency Reserve Boundary: the separation between bounded emergency reserve classification and any mint capacity.

Backing boundaries are accounting constraints. They do not create value, increase mint capacity, or bypass governance.

## Expansion Eligibility Rules

Monetary expansion may be considered eligible only when all applicable constraints are satisfied:

- The expansion must be bounded by recognized reserve backing.
- The expansion must preserve `MIN_RESERVE_RATIO`.
- The expansion must preserve `LIQUIDITY_CAP`.
- The backing used for eligibility must not be encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already counted elsewhere.
- The backing used for eligibility must be recognized through an authorized classification path.
- The expansion must not depend on an oracle signal as autonomous authority.
- The expansion must not depend on emergency reserve state as temporary mint capacity.
- The expansion must not depend on reserve reclassification as a source of new backing.
- The expansion must not depend on failed, replayed, or duplicate SovereignWealthFund or reclaim accounting.

Eligibility is a specification boundary and does not by itself authorize implementation, minting, governance action, or treasury execution.

## Reserve Backing Constraints

Recognized reserve backing constrains monetary expansion.

- Reserve backing must not be double-counted across treasury, reserve, SovereignWealthFund, or monetary layers.
- Reserve classification must not create reserve backing beyond the value classified.
- Reserve reclassification must not increase backing capacity.
- Reclaimed reserves may affect backing only through authorized exact-once recognized backing paths.
- Encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted reserves must not count as deployable backing.
- Audit records, oracle records, bridge records, trigger records, or classification proposals must not be interpreted as backing.
- Reserve backing must remain subordinate to Step-4.1 treasury accounting rules and Step-4.2 reserve classification rules.

## Liquidity Cap Constraints

`LIQUIDITY_CAP` is a preserved monetary constant. Step-4.3 does not change it, make it configurable, reinterpret it, or introduce an alternate cap.

- Monetary expansion must not exceed `LIQUIDITY_CAP`.
- Treasury accounting must not create an indirect path around `LIQUIDITY_CAP`.
- SovereignWealthFund accounting must not create an indirect path around `LIQUIDITY_CAP`.
- Reserve classification or reclassification must not create an indirect path around `LIQUIDITY_CAP`.
- Emergency reserve use must not create temporary capacity above `LIQUIDITY_CAP`.
- Oracle signals must not autonomously authorize, recommend as executable, or trigger expansion above `LIQUIDITY_CAP`.

This section is a specification constraint and does not claim new implementation behavior.

## Minimum Reserve Ratio Constraints

`MIN_RESERVE_RATIO` is a preserved monetary constant. Step-4.3 does not change it, make it configurable, reinterpret it, or introduce an alternate ratio.

- Monetary expansion must preserve `MIN_RESERVE_RATIO`.
- Under-backed expansion must be state-neutral.
- Reclassification must not increase backing capacity used to satisfy `MIN_RESERVE_RATIO`.
- Encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted reserves must not be used to satisfy `MIN_RESERVE_RATIO`.
- SovereignWealthFund deposits must not satisfy `MIN_RESERVE_RATIO` unless they enter recognized backing through authorized exact-once paths.
- Emergency reserve use must not temporarily satisfy `MIN_RESERVE_RATIO` through implicit or reversible accounting.
- Oracle prices, confidence values, freshness checks, or feeder reports must not autonomously alter the reserve ratio or execute expansion.

## Forbidden Expansion Paths

The following expansion paths are forbidden:

- Minting above `LIQUIDITY_CAP`.
- Minting that would violate `MIN_RESERVE_RATIO`.
- Minting from unclassified, pending, frozen, locked, encumbered, rejected, invalid, or already-counted reserves.
- Minting from double-counted reserve backing.
- Minting through reserve classification or reclassification.
- Minting through emergency reserve classification or emergency reserve use.
- Minting through SovereignWealthFund deposits that have not passed authorized exact-once recognized backing paths.
- Minting through failed, duplicate, or replayed reclaim transfers.
- Minting through failed, duplicate, or replayed SovereignWealthFund withdrawals or deposits.
- Minting through oracle signals, price updates, confidence reports, feeder reports, freshness checks, or bridge reports.
- Minting through automation that bypasses human or governance authority.
- Burning or supply contraction triggered autonomously by oracle signals.
- Any path that converts `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, thresholds, timeout constants, trigger codes, or constitutional constants into mutable configuration.

## Treasury And SWF Expansion Boundaries

Treasury and SovereignWealthFund accounting must not create hidden minting paths.

- Treasury accounting may track balances, encumbrances, and reserve classes, but accounting labels do not create mint capacity.
- SovereignWealthFund deposits must not create mint capacity except through authorized exact-once recognized backing paths.
- SovereignWealthFund withdrawals must not create mint capacity.
- Failed or replayed SovereignWealthFund actions must not mutate supply, backing, or expansion eligibility.
- Reclaimed assets must not affect expansion eligibility unless they pass authorized exact-once accounting and recognized backing classification.
- Treasury and SovereignWealthFund state must remain subject to reserve discipline, monetary constraints, and governance assumptions.
- SovereignWealthFund balances must not be treated as speculative capital, treasury yield, staking collateral, lending inventory, or capital-efficiency input.

## Reclassification And Emergency Reserve Boundaries

Reserve reclassification and emergency reserve state must not create hidden monetary expansion.

- Reclassification must conserve value and must not increase backing capacity.
- Reclassification must not unlock locked, frozen, encumbered, pending, or unclassified value implicitly.
- Reclassification must not create deployable backing from excluded balances.
- Emergency reserve classification must remain bounded and auditable.
- Emergency reserve use must not create temporary or implicit mint capacity.
- Emergency reserve use must not become an indirect path around `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP`.
- Emergency context must not convert oracle signals into autonomous mint, burn, classification, unlock, transfer, or treasury execution authority.

## Oracle Signal Boundaries

Oracle signals may inform review or risk state only. They must not autonomously mint, burn, classify, unlock, transfer, or execute treasury actions.

Oracle inputs may include price, confidence, freshness, feeder, risk, or bridge signals. These inputs may support review, audit records, risk flags, or later human/governance consideration, but they are not monetary expansion authority.

Oracle signals must not:

- Increase recognized reserve backing.
- Satisfy `MIN_RESERVE_RATIO`.
- Raise or bypass `LIQUIDITY_CAP`.
- Classify reserves.
- Reclassify reserves.
- Unlock reserves.
- Freeze or unfreeze assets.
- Mint or burn supply.
- Transfer assets.
- Execute treasury actions.

Stale, invalid, unauthorized, repeated, or low-confidence oracle data must preserve the neutrality and accounting assumptions already captured by Step-3 where applicable.

## Failed And Replayed Expansion Neutrality

Failed and replayed expansion paths must preserve protected state.

- Failed authorization must not mutate supply, reserves, treasury accounting, or SovereignWealthFund accounting.
- Over-cap expansion attempts must be state-neutral.
- Under-backed expansion attempts must be state-neutral.
- Stale, invalid, unauthorized, repeated, or low-confidence oracle data must not cause expansion mutation.
- Failed backing checks must not mutate supply or recognized backing.
- Replayed expansion execution must not duplicate supply.
- Replayed reserve classification must not duplicate backing.
- Replayed SovereignWealthFund or reclaim accounting must not create mint capacity.
- Failed emergency expansion paths must not release emergency reserves or create deployable backing.

These rules preserve Step-3 failed-path neutrality, replay resistance, and Step-4 exact-once accounting assumptions.

## Initial Monetary Expansion Invariants

| Invariant | Specification target |
| --- | --- |
| Backing-bounded expansion | Monetary expansion must be bounded by recognized reserve backing. |
| Liquidity cap preservation | Monetary expansion must not exceed `LIQUIDITY_CAP`, and `LIQUIDITY_CAP` remains unchanged and non-configurable. |
| Minimum reserve ratio preservation | Monetary expansion must preserve `MIN_RESERVE_RATIO`, and `MIN_RESERVE_RATIO` remains unchanged and non-configurable. |
| No double-counted backing | Reserve backing cannot be counted twice across treasury, reserve, SovereignWealthFund, or monetary layers. |
| Excluded value discipline | Encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted reserves cannot count as deployable backing. |
| No reclassification minting | Classification and reclassification cannot increase backing capacity or create mint capacity. |
| No emergency minting | Emergency reserve classification and emergency reserve use cannot create temporary or implicit mint capacity. |
| Exact-once backing paths | SovereignWealthFund deposits and reclaimed assets can affect backing only through authorized exact-once recognized backing paths. |
| Oracle boundary | Oracle signals inform review or risk state only and do not autonomously mint, burn, classify, unlock, transfer, or execute treasury actions. |
| Failed-path neutrality | Failed, unauthorized, over-cap, under-backed, stale, invalid, or replayed expansion attempts preserve protected state. |
| Replay resistance | Completed expansion, backing recognition, and accounting effects cannot be replayed into duplicate supply or backing. |
| Step-3 preservation | Monetary expansion formalization does not weaken Step-3 runtime hardening invariants. |
| Step-4 preservation | Monetary expansion formalization remains subordinate to the Step-4 Sovereign Reserve Model, Step-4.1 Treasury Accounting Rules, and Step-4.2 Reserve Classification Protocol. |

## Forbidden Assumptions

This Step-4.3 artifact forbids the following assumptions:

- Do not make the Kernel upgradeable.
- Do not alter Kernel immutability.
- Do not change thresholds.
- Do not change timeout constants.
- Do not change trigger codes.
- Do not change constitutional constants.
- Do not change `MIN_RESERVE_RATIO`.
- Do not change `LIQUIDITY_CAP`.
- Do not convert monetary constants into mutable configuration.
- Do not redesign contracts as part of this artifact.
- Do not change tests as part of this artifact.
- Do not introduce staking, lending, treasury yield, speculative deployment, DeFi yield, or capital-efficiency framing.
- Do not treat SovereignWealthFund balances as speculative capital or expansion inventory.
- Do not allow hidden minting through treasury accounting, SovereignWealthFund accounting, reserve reclassification, emergency reserves, or oracle signals.
- Do not allow oracle-driven autonomous minting, burning, reserve classification, unlocking, transfer, or treasury execution.
- Do not automate final human or governance authority.
- Do not weaken reserve discipline, monetary constraints, treasury accounting constraints, classification constraints, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Open Audit Questions

- Which balances currently qualify as recognized reserve backing for monetary expansion tests?
- What exact documentation should later map `MIN_RESERVE_RATIO` to recognized backing classes?
- What exact documentation should later map `LIQUIDITY_CAP` to supply and trigger evidence?
- Which events or records are sufficient to prove backing was recognized through authorized exact-once paths?
- Which Step-3 non-blocking oracle gaps should later become monetary expansion neutrality tests?
- How should emergency reserve review be represented without creating temporary mint capacity?
- How should overlapping encumbrances, freezes, pending withdrawals, and classifications be excluded from backing without double-counting?
- Which future tests should prove failed, under-backed, over-cap, stale, and replayed expansion neutrality?
