# Step-8 Audit Readiness & Formal Verification Preparation

**Checkpoint:** opened after `69369eb docs(step7): close stress testing phase`
**Runtime baseline:** `454 passing` at Step-7 closure
**Scope:** External audit readiness, invariant mapping, threat-surface indexing, and formal verification preparation

## 1. Purpose

Step-8 prepares IranOS for external audit and future formal verification work. This phase converts existing hardening, stress-testing, and doctrine evidence into audit-facing maps without changing contracts, tests, thresholds, timeout constants, Kernel assumptions, oracle authority, freeze authority, or downstream policy execution behavior.

This document does not claim that formal verification is complete. It defines the first audit-readiness index and identifies candidate properties for later formal verification.

## 2. Critical Contract Surfaces

Initial audit scope should prioritize contracts that hold constitutional authority, accounting authority, emergency authority, oracle signal authority, or policy-review authority.

- `IranOS_Kernel`: constitutional role root, violation handling, emergency lock behavior, and official access boundaries.
- `TriggerProtocol`: terminal trigger execution, treasury access blocking, signature revocation, execution finality, and trigger-domain isolation.
- `AssetFreeze`: freeze lifecycle, multi-signature confirmation, SWF transfer, release authority, and duplicate-transfer prevention.
- `SovereignWealthFund`: layer accounting, council withdrawal signing, annual yield distribution, reclaimed-asset intake, and reserve neutrality on failed calls.
- `PahlaviToken`: mint and burn authority, liquidity cap, reserve backing checks, and emergency transfer restrictions.
- `PriceOracle`: feeder role boundaries, quorum aggregation, staleness checks, invalidation, outlier observability, and independent price paths.
- `API3Oracle`: feeder-to-Kernel bridge behavior and atomicity when Kernel forwarding fails.
- `BudgetAllocation`: parliamentary budget approval, sector allocation, government expenditure, auditor flagging, and Kernel sector locks.
- `BaseIncome`: wage, employer registration, wage-payment, welfare, SWF, and oracle role boundaries.
- `VelocityFee`: dormant-liquidity fee calculation, staking exemption, oracle-controlled registration, and explicit fee application.
- `ProductionOracle`: production-unit registration, classification, loan eligibility, critical subsidy, and role-gated production updates.
- `Provincial`: province registration, revenue distribution, productivity scoring, governor authority, and productivity bonus boundaries.
- `Fargard7PolicyAdapter`: proposal-only Fargard 7 signal review, recommendation lifecycle, reviewer approval/rejection/expiration, and non-execution guarantees.

## 3. Authority Boundary Map

Audit review should treat role boundaries as primary security controls:

- Kernel authority remains explicit and must not become upgrade authority, arbitrary execution authority, or an oracle-controlled bypass.
- Oracle data remains a signal input only. It must not autonomously freeze, unfreeze, mint, burn, spend, transfer, classify, subsidize, apply fees, change wages, alter budgets, or execute governance.
- Final emergency and freeze authority remains human or institution-gated through the implemented role paths.
- Budget, wage, production, provincial, fee, loan, and subsidy effects require their own existing module roles and explicit calls.
- `Fargard7PolicyAdapter` is proposal-only and non-executing. Its reviewer approval is adapter-local metadata for institutional follow-up, not downstream policy execution.

## 4. Invariant Map by Subsystem

### Constitutional and Trigger Integrity

- Constitutional constants and trigger codes remain unchanged.
- Non-terminal trigger state cannot mutate treasury or SWF accounting.
- Terminal trigger execution is deterministic and cannot be replayed into duplicate downstream effects.
- Completed trigger records remain immutable across later attempts.
- Trigger paths cannot escalate authority roles.

Evidence references:

- `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`
- `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md`
- Trigger-related tests in the runtime suite

### Reserve, Token, and Accounting Integrity

- Pahlavi minting remains bounded by liquidity caps and reserve checks.
- Failed or unauthorized SWF calls remain state-neutral.
- L1 withdrawal execution updates accounting exactly once.
- Reclaimed assets require explicit reclaim authority and reject zero-value deposits.
- Cross-contract trigger paths preserve accounting neutrality until explicit authorized execution.

Evidence references:

- `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`
- `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md`
- SWF, PahlaviToken, AssetFreeze, and TriggerProtocol tests

### Oracle and Economic Data Integrity

- Stale feeder submissions are excluded from fresh aggregation.
- Fresh quorum is required before an aggregate can update.
- Severe outliers are auditable without giving one feeder autonomous authority.
- Feeder liveness loss does not recompute from stale submissions.
- Independent price paths remain isolated under stress.

Evidence references:

- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `test/25_Step7_StressBaseline.test.js`
- `test/26_Step7_PolicyLayer.test.js`

### Policy-Layer Containment

- Existing policy modules execute only through explicit authorized module calls.
- Fresh economic oracle signals do not autonomously mutate wages, budgets, fees, production classifications, subsidies, or provincial balances.
- Budget spending remains bounded by approved sector allocation and Kernel locks.
- Velocity fees require explicit `applyFee` execution and preserve staking exemptions.
- Production and provincial policy paths remain role-gated.

Evidence references:

- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `test/26_Step7_PolicyLayer.test.js`

### Fargard 7 Adapter Non-Execution

- Recommendations require fresh `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD` snapshots.
- Stale or invalid signals block recommendation creation.
- Recommendations are created with `executable = false`.
- Created, Approved, Rejected, and Expired status transitions remain adapter-local.
- Approval does not mutate downstream policy modules or bypass existing role gates.

Evidence references:

- `contracts/governance/Fargard7PolicyAdapter.sol`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `test/26_Step7_PolicyLayer.test.js`

### Initial Invariant Inventory Table

| Subsystem | Invariant | Contracts | Test evidence | Formal-verification candidate | Gap |
| --- | --- | --- | --- | --- | --- |
| Kernel | Constitutional role authority, violation handling, emergency-lock state, and official access remain role-gated and cannot be driven by unauthorized callers. | `IranOS_Kernel`, `TriggerProtocol` | Kernel deployment, `flagViolation`, `signViolation`, emergency lock, official access, and trigger lifecycle tests; Step-3 and Step-6 reports | Prove unauthorized callers cannot trigger emergency authority, grant sovereign-equivalent access, or replay terminal trigger effects. | Formal role-reachability proof pending. |
| PahlaviToken | Minting remains SWF-gated, reserve-aware, and bounded by the liquidity cap; emergency state blocks transfers until Kernel clears it. | `PahlaviToken`, `SovereignWealthFund` | PahlaviToken mint, burn, emergency, backing-ratio, and transfer tests; SWF reserve/accounting tests | Prove total supply cannot exceed configured liquidity and failed mint/burn paths are state-neutral. | Formal supply-cap and reserve-backing proof pending. |
| PriceOracle | Price aggregates require fresh quorum, exclude stale submissions, remain invalid after explicit invalidation, and isolate independent price paths. | `PriceOracle` | PriceOracle deployment, submission, aggregation, invalidation, freshness tests; `test/25_Step7_StressBaseline.test.js`; Step-7 report | Prove aggregate update cannot occur with fewer than the required fresh feeder quorum. | Arithmetic mean and outlier-observability model needs formal specification before proof. |
| ProductionOracle | Production unit registration, category changes, loan eligibility, and critical subsidies remain feeder or bank role-gated and reject invalid score states. | `ProductionOracle` | ProductionOracle unit registration, production data update, loan eligibility, critical subsidy tests; Step-7 policy-layer tests | Prove category counters and eligibility state cannot be mutated by unauthorized callers or out-of-range scores. | Cross-check counter conservation under all category transitions pending. |
| BaseIncome | Employer registration, wage compliance recording, subsidy actions, and tax-exemption reads remain explicit role/module behavior, not autonomous oracle policy execution. | `BaseIncome` | BaseIncome employer registration, wage payment, subsidy, tax exemption tests; Step-7 policy neutrality test | Prove economic oracle signal state cannot mutate wage constants, employer records, payment counts, or subsidy state. | Formal non-interference property between `PriceOracle` and `BaseIncome` pending. |
| BudgetAllocation | Budget approval, sector allocation, expenditure recording, auditor flagging, and Kernel sector locks remain role-gated; spending cannot exceed approved sector allocation. | `BudgetAllocation` | BudgetAllocation approval, expenditure, flagging, sector lock tests; Step-7 budget containment test | Prove sector `spent` cannot exceed `allocated`, including after failed or unauthorized calls. | Formal sector-bounds proof pending. |
| Provincial | Province registration, revenue distribution, productivity scoring, governor role updates, and productivity bonuses remain authorized and bounded by implemented thresholds. | `Provincial` | Provincial registration, revenue distribution, productivity score, governor update tests; Step-7 provincial boundary test | Prove 30/70 revenue accounting and productivity bonus threshold behavior are preserved across valid calls and failed calls. | Formal balance-conservation proof pending. |
| VelocityFee | Dormant-liquidity fees require explicit policy execution, preserve staking exemptions, and cannot be applied by oracle signals alone. | `VelocityFee`, `PahlaviToken` | VelocityFee deployment, registration, activity, staking, fee calculation tests; Step-7 dormant-liquidity tests | Prove `totalFeesCollected` changes only through authorized explicit fee application and never for staking-exempt accounts. | Formal token-balance interaction proof pending. |
| Fargard7PolicyAdapter | Recommendations require fresh `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD` snapshots, remain `executable = false`, and review status changes do not mutate downstream policy modules. | `Fargard7PolicyAdapter`, `PriceOracle` | Step-7 adapter creation, severe-stress boundary, stale/invalid signal, approval, rejection, and expiration tests | Prove recommendation lifecycle functions cannot call or mutate downstream policy contracts and cannot set executable policy authority. | Formal non-execution and downstream non-interference proof pending. |

## 5. Formal Verification Candidate Properties

Future formal verification work should begin with properties that are narrow, safety-oriented, and already backed by test evidence.

- No unauthorized caller can acquire or exercise critical role behavior through public entry points.
- Failed calls preserve accounting state for SWF, token supply, treasury, freeze, budget, and trigger records.
- Terminal trigger execution cannot be replayed to duplicate side effects.
- Pahlavi supply cannot exceed the liquidity cap or pass reserve-backed mint constraints.
- SWF withdrawals execute at most once and only after the required signature threshold.
- PriceOracle aggregation cannot update from fewer than the required fresh feeder quorum.
- Stale oracle data cannot become a fresh policy recommendation input.
- `Fargard7PolicyAdapter` cannot mutate downstream policy module state in any recommendation lifecycle function.
- Adapter approval cannot change `executable` to true or route execution into budget, wage, fee, production, subsidy, loan, or provincial state.
- Budget sector spending cannot exceed approved sector allocation.
- Locked budget sectors cannot record later spending.

## 6. Initial Audit Packet Contents

The first external audit packet should include:

- `docs/IRAN_OS_ROADMAP.md`
- `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`
- `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`
- `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`
- Critical contract list from this report
- Test summary from the latest clean `npm test`

## 7. Step-8 Opening Status

Step-8 is opened as a docs-only audit-readiness phase. No implementation changes, test changes, contract changes, or formal-verification claims are included in this opening checkpoint.

The recommended next Step-8 task is to expand this report into a detailed audit checklist with contract-by-contract entry points, roles, state variables, events, invariants, known non-goals, and test references.
