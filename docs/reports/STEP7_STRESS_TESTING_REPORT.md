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

## 5. Current Status

Step-7 has started with a clean metadata pre-commit and additive economic stress tests for oracle freshness, quorum behavior, outlier detection, feeder liveness recovery, and multi-path isolation. No contract code changes are introduced by this initial checkpoint.
