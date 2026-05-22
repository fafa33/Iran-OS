# Step-7 Stress Testing Report

**Checkpoint:** started after `be6d20b chore(step7): ignore local metadata`  
**Runtime baseline:** `441 passing` before Step-7 functional changes  
**Scope:** Simulation, adversarial, emergency, and economic stress testing

## 1. Purpose

Step-7 begins the stress-testing phase for IranOS. The goal is to exercise adversarial, emergency, and economic shock scenarios against the hardened runtime without changing constitutional constants, Kernel assumptions, oracle authority, reserve constraints, liquidity limits, or human final authority.

Step-7 tests should remain additive and evidence-oriented. They should prove that runtime state remains bounded under pressure before any implementation change is considered.

## 2. Initial Entry Point

The first Step-7 entry point is the oracle economic stress surface, specifically `PriceOracle` freshness and quorum behavior.

This is the correct opening surface because Step-7 depends on the Step-6 runtime hardening guarantees while expanding from trigger lifecycle integrity into economic stress paths. Oracle prices are external signals, so the test surface must preserve the doctrine that oracle data can inform state but cannot become autonomous sovereign authority.

## 3. Initial Stress Scenario

The initial Step-7 tests cover stale feeder exclusion and quorum failure during renewed market stress windows:

- A valid oil-price aggregate is established from three feeders.
- The data becomes stale after the configured staleness threshold.
- Two fresh stressed submissions are insufficient to replace the prior aggregate.
- The prior aggregate remains unchanged until a fresh three-feeder quorum exists.
- Once fresh quorum exists, only fresh submissions participate in the renewed aggregate.
- A gas-price path with only stale and insufficient fresh submissions cannot form an aggregate.
- The gas-price path remains invalid while fresh quorum is missing.
- The gas-price path resumes correct aggregation once three fresh feeder submissions are restored.
- A severe inflation-data outlier is flagged through `DeviationDetected` under the current arithmetic-mean design.
- The outlier path remains quorum-scoped and auditable instead of becoming a single-feeder autonomous execution path.
- A valid fresh correction restores the prior quorum mean without contract changes.
- A gold-price path with one offline feeder does not recompute from stale feeder data.
- The stale aggregate remains observable but fails freshness checks while fresh quorum is missing.
- A replacement fresh feeder restores quorum and resumes aggregation using only fresh submissions.
- Independent price paths remain isolated when one path loses fresh quorum.
- A refreshed gold-price path remains fresh and correctly aggregated while the inflation path is stale and below fresh quorum.
- Restoring the affected inflation path resumes its aggregate without mutating the already-fresh gold path.

## 4. Doctrine Constraints

Step-7 stress tests must not introduce or imply:

- Kernel upgradeability.
- Mutable constitutional constants.
- Mutable monetary reserve or liquidity constants.
- Oracle authority over execution, freeze, mint, burn, treasury, SWF, or governance decisions.
- Automated replacement of human or governance final authority.
- Capital-efficiency or speculative optimization framing.

## 5. Whitepaper / Fargard 7 Alignment

Step-7 oracle/economic stress testing validates the technical data-integrity layer required for the economic strategies described in Fargard 7 of the Iran OS whitepaper. These tests do not yet implement the full Fargard 7 policy logic; they validate infrastructure prerequisites for reliable economic indicators such as `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD`.

The five current Step-7 stress cases map to Fargard 7 economic requirements as follows:

- Stale data exclusion: economic indicators must not be refreshed from expired feeder submissions.
- Quorum-based validity: policy inputs require enough fresh independent feeder data before an aggregate is accepted.
- Manipulation / outlier observability: severe deviations are surfaced through auditable oracle events without treating one feeder as autonomous policy authority.
- Feeder liveness and recovery: economic indicators remain bounded during feeder degradation and resume aggregation after fresh quorum is restored.
- Multi-path economic indicator isolation: stress or recovery on one indicator path does not mutate another independent indicator path.

This is infrastructure validation for Fargard 7 economic strategy, not full policy execution.

## 6. Oracle / Economic Data Integrity Checkpoint

The Oracle/Economic Data Integrity sub-section of Step-7 is complete as of this checkpoint. It establishes a documentation and test-backed baseline for `PriceOracle` data freshness, quorum behavior, outlier observability, feeder recovery, and independent economic indicator paths.

Completed oracle/economic stress cases:

- Stale feeder exclusion and fresh quorum behavior.
- Quorum failure and recovery after stale or insufficient feeder data.
- Outlier detection, quorum-scoped manipulation observability, and recovery.
- Feeder liveness degradation and recovery.
- Multi-path economic indicator isolation.

Final verification for this checkpoint is `446 passing`. No contract files were modified during the Step-7 oracle/economic data-integrity work. This checkpoint validates infrastructure prerequisites for Fargard 7 economic strategy, not full policy execution.

The next intended Step-7 direction is policy-layer testing built on top of these oracle data-integrity prerequisites.

## 7. Policy-Layer Neutrality Entry Point

The first policy-layer Step-7 test is a policy neutrality boundary test. It establishes valid fresh `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD` oracle aggregates, then verifies that existing policy-layer surfaces are not autonomously mutated by those signals.

The covered policy surfaces are:

- `BaseIncome` minimum wage, tax-exempt cap, employer registration state, and wage-payment state.
- `BudgetAllocation` total budget, allocation ratios, sector allocations, sector lock state, and expenditure state.
- `VelocityFee` threshold, tier-one rate, dormancy period, fee-collection state, and role-controlled fee behavior.

This test proves the current architecture boundary: economic indicators are observable oracle signals, not autonomous policy executors. Dynamic Fargard 7 policy execution would require a future adapter or consumer contract and must not be claimed from the current implementation.

The second policy-layer Step-7 test focuses on the existing `VelocityFee` dormant-liquidity policy surface. It verifies that an above-threshold dormant account reaches the correct anti-hoarding fee tier after the configured dormancy period, that staking remains exempt under the implemented rules, and that fee accounting changes only after an explicit authorized policy/module call to `applyFee`. A fresh `GAS_USD` oracle signal is observed in the same scenario, but it does not autonomously mutate dormant-liquidity fees or collection state.

The third policy-layer Step-7 test focuses on the existing `ProductionOracle` policy surface for industrial resilience. It moves a registered production unit through Pioneer, Transition, and Critical classifications using only feeder-authorized production data updates, verifies category counters and loan eligibility boundaries, confirms Pioneer and Transition loan terms under bank authority, and confirms Critical subsidy behavior while rejecting unauthorized classification, loan, and subsidy calls. This validates authority-controlled classification and existing industrial policy effects only; there is no autonomous oracle-triggered production policy in the current architecture.

The fourth policy-layer Step-7 test focuses on the existing `BudgetAllocation` containment surface. It verifies fixed sector allocations after parliamentary budget approval, confirms government spending remains bounded by the approved sector allocation, confirms an overspend attempt is rejected without mutating spent totals or expenditure count, confirms auditor flagging of a suspicious expenditure, and confirms a Kernel-locked sector rejects later spending. This validates explicit budget containment behavior only; it does not introduce or imply PriceOracle-driven dynamic budgeting.

The fifth policy-layer Step-7 test focuses on the existing `Provincial` redistribution and productivity surface. It verifies Kernel-controlled province registration, 30/70 revenue distribution through the current oracle-authorized revenue path, productivity score update bounds, the implemented productivity bonus threshold of strictly greater than 70, and rejection of unauthorized registration, revenue distribution, score update, and bonus calls. This validates explicit provincial redistribution and productivity policy behavior only; it does not introduce or imply PriceOracle-driven provincial policy.

## 8. Policy-Layer Checkpoint

The Policy-Layer sub-section of Step-7 is checkpointed as complete for the current implemented policy surfaces. It establishes a documentation and test-backed baseline for existing policy behavior without claiming dynamic Fargard 7 execution.

Completed policy-layer stress cases:

- Policy neutrality boundary across `PriceOracle`, `BaseIncome`, `BudgetAllocation`, and `VelocityFee`.
- `VelocityFee` dormant-liquidity policy execution boundary.
- `ProductionOracle` industrial policy classification, loan eligibility, and critical subsidy boundary.
- `BudgetAllocation` approval, sector allocation, overspend rejection, flagging, and lock containment boundary.
- `Provincial` 30/70 redistribution and productivity bonus threshold boundary.

These tests validate the existing policy surfaces that are already implemented. They also confirm the current architectural gap: dynamic Fargard 7 execution is still missing because no adapter or consumer currently converts CPI, gold, gas, production, budget, or provincial signals into coordinated policy updates. The next Step-7 direction is `Fargard7PolicyAdapter` design and implementation, with explicit authority boundaries and tests, before any claim of dynamic Fargard 7 policy execution.

Final verification for this policy-layer checkpoint is `451 passing`. No contract files were modified during the policy-layer stress-test work.

## 9. Fargard7PolicyAdapter Design Plan

The next Step-7 implementation direction is a `Fargard7PolicyAdapter` that acts as an authority-bounded coordinator between validated economic signals and existing policy modules. The adapter should read `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD` from `PriceOracle`, classify stress conditions, and emit recommendations or proposals for policy review.

The first implementation slice should be read-only and proposal-only. It should not autonomously mutate downstream policy modules, and it should not spend funds, grant subsidies, apply fees, reclassify production units, change wages, alter budget allocations, or distribute provincial bonuses. Any material policy action must remain approval-gated through explicit governance, Kernel, parliament, bank, auditor, oracle, or other existing authority paths as appropriate.

Initial adapter outputs should be auditable recommendation events for the currently validated policy surfaces:

- `BaseIncome` review recommendations for inflation-linked wage or support pressure.
- `BudgetAllocation` review recommendations for budget containment or reallocation pressure.
- `VelocityFee` review recommendations for dormant-liquidity or gas-cost pressure.
- `ProductionOracle` review recommendations for industrial resilience pressure.
- `Provincial` review recommendations for redistribution or productivity pressure.

Required invariants for the adapter design:

- Stale or invalid oracle data must not produce executable policy action.
- Oracle signals remain inputs, not sovereign authority.
- The adapter must not bypass existing roles or approval gates.
- Recommendation creation must be auditable and deterministic from the accepted signal snapshot.
- Adapter failure must be policy-neutral: downstream module state remains unchanged.
- Dynamic Fargard 7 execution remains future implementation work until the adapter and its authority model are implemented and tested.

## 10. Current Status

The first `Fargard7PolicyAdapter` implementation slice adds a proposal-only coordinator for `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD`. The adapter reads fresh `PriceOracle` snapshots, classifies the configured stress level, and emits auditable recommendations with `executable = false`.

This first slice is intentionally non-executing:

- It does not mutate `BaseIncome`, `BudgetAllocation`, `VelocityFee`, `ProductionOracle`, or `Provincial`.
- It does not spend funds, grant subsidies, apply fees, change wages, alter budgets, reclassify production units, or distribute provincial bonuses.
- Recommendation creation is role-gated.
- Stale or invalid oracle data blocks recommendation creation.
- Threshold configuration is role-gated and bounded by ordering checks.

The adapter validates the first technical bridge from Fargard 7 economic indicators to policy review, not autonomous Fargard 7 execution. This checkpoint records the first implementation slice as complete for proposal-only behavior.

The next Step-7 direction is adapter hardening, review workflow design, and approval-path specification. That future work should define how recommendations are reviewed, authorized, and, if accepted, routed through existing role-gated policy modules without bypassing human or institutional approval.

Step-7 has started with a clean metadata pre-commit and additive economic stress tests for oracle freshness, quorum behavior, outlier detection, feeder liveness recovery, multi-path isolation, policy-layer neutrality, dormant-liquidity policy execution boundaries, ProductionOracle industrial policy boundaries, BudgetAllocation containment boundaries, Provincial redistribution/productivity boundaries, and proposal-only Fargard 7 policy recommendations. The Oracle/Economic Data Integrity and Policy-Layer sub-sections are checkpointed as complete for current implemented surfaces, while Step-7 remains open for adapter hardening, review workflow, and approval-path implementation. Verification after the proposal-only adapter slice is `452 passing`.
