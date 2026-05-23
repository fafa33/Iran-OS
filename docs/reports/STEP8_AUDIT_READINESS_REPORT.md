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

### Audit Evidence Index

This index is audit-facing evidence organization only. It does not claim that an external audit, formal verification, or production certification is complete.

| Subsystem | Contract(s) | Evidence source | Test file/report | Coverage note | Gap/next action |
| --- | --- | --- | --- | --- | --- |
| Kernel / authority | `IranOS_Kernel`, `TriggerProtocol`, `API3Oracle` | Role-gated Kernel authority, violation forwarding, emergency lock behavior, trigger finality, and oracle bridge atomicity. | Core Kernel and TriggerProtocol tests; API3 bridge tests; `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`; `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md` | Covers unauthorized caller rejection, trigger threshold behavior, terminal-state immutability, duplicate-trigger resistance, and bridge failure atomicity. | Build contract-by-contract authority entry-point checklist and formal role-reachability targets. |
| PahlaviToken / monetary | `PahlaviToken`, `SovereignWealthFund`, `AssetFreeze` | Mint/burn authority, liquidity cap, reserve-backing checks, emergency transfer controls, SWF accounting, and reclaimed asset intake. | PahlaviToken, SWF, and AssetFreeze tests; `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`; `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md` | Covers supply cap enforcement, reserve-aware minting, failed-call neutrality, SWF withdrawal thresholding, and transfer-to-SWF lifecycle boundaries. | Prepare monetary supply and reserve-conservation proof obligations. |
| PriceOracle | `PriceOracle` | Feeder authorization, fresh quorum aggregation, stale data exclusion, invalidation, outlier observability, and independent key isolation. | PriceOracle tests; `test/25_Step7_StressBaseline.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md` | Covers stale quorum failure, fresh quorum recovery, severe outlier events, feeder liveness degradation, and independent indicator paths. | Specify aggregation arithmetic and deviation-event assumptions for formal tooling. |
| ProductionOracle | `ProductionOracle` | Production-unit registration, score updates, category transitions, loan eligibility, and critical subsidy boundaries. | ProductionOracle tests; `test/26_Step7_PolicyLayer.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md` | Covers feeder/bank role gates, out-of-range score rejection, Pioneer/Transition/Critical transitions, loan terms, and critical subsidy restrictions. | Add explicit counter-conservation checklist for all category transitions. |
| BaseIncome | `BaseIncome` | Employer registration, wage-payment compliance, subsidy grant/revoke authority, and tax exemption calculation. | BaseIncome tests; `test/26_Step7_PolicyLayer.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md` | Covers oracle-gated employer registration, employer wage records, SWF subsidy paths, and neutrality under fresh economic oracle signals. | Define non-interference target proving `PriceOracle` cannot mutate wage or subsidy state. |
| BudgetAllocation | `BudgetAllocation` | Parliamentary budget approval, sector allocation, expenditure recording, auditor flagging, and Kernel sector locks. | BudgetAllocation tests; `test/26_Step7_PolicyLayer.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md` | Covers approved-sector allocation, overspend rejection, locked-sector rejection, expenditure flagging, and no PriceOracle-driven budgeting. | Prepare formal sector-spend bounds and locked-sector immutability properties. |
| Provincial | `Provincial` | Province registration, governor role assignment, 30/70 revenue distribution, productivity score bounds, and productivity bonus threshold. | Provincial tests; `test/26_Step7_PolicyLayer.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md` | Covers Kernel registration, oracle revenue distribution, unauthorized rejection, score bounds, and bonus threshold behavior. | Specify conservation relation for provincial/national revenue accounting and bonus effects. |
| VelocityFee | `VelocityFee`, `PahlaviToken` | Dormancy registration, staking exemption, fee-tier calculation, explicit fee application, and fee collection accounting. | VelocityFee tests; `test/26_Step7_PolicyLayer.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md` | Covers real token balance reads, staking exemption, dormant-account calculation, explicit authorized `applyFee`, and no autonomous gas-signal mutation. | Model token-balance dependency and prove fee accounting changes only through authorized application. |
| Fargard7PolicyAdapter | `Fargard7PolicyAdapter`, `PriceOracle` | Fresh economic signal snapshots, stress classification, recommendation creation, review lifecycle, expiration, and proposal-only boundary. | `test/26_Step7_PolicyLayer.test.js`; `docs/reports/STEP7_STRESS_TESTING_REPORT.md`; `contracts/governance/Fargard7PolicyAdapter.sol` | Covers stale/invalid signal rejection, `executable = false`, reviewer-gated approve/reject/expire, duplicate-action rejection, and unchanged downstream policy state. | Prepare formal non-execution and downstream non-interference proof targets before any future execution-path design. |

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

### Formal Verification Target List

The following targets are preparation items only. They identify proof candidates and suggested methods without claiming that formal verification has been performed or completed.

| Contract | Property | Why it matters | Suggested method/tool | Current evidence | Priority | Gap |
| --- | --- | --- | --- | --- | --- | --- |
| `IranOS_Kernel` | Unauthorized callers cannot activate emergency authority, grant protected access, or bypass court-signature paths. | Kernel authority is the constitutional root for violation handling and emergency state. | Role-reachability analysis with Echidna or Foundry invariant tests, followed by SMTChecker for simple access-control properties. | Kernel role, violation, signing, emergency-lock, and official-access tests; Step-3 and Step-6 reports. | High | Formal role graph and privileged-entry-point model pending. |
| `PahlaviToken` | Total supply cannot exceed the liquidity cap and minting remains SWF-gated and reserve-aware. | Monetary integrity depends on supply and backing constraints never being bypassed. | Foundry invariant harness for supply cap and mint/burn state; SMTChecker for bounded require-path checks. | PahlaviToken mint, burn, emergency, backing-ratio, and transfer tests. | High | Formal reserve-backed mint relation pending. |
| `PriceOracle` | Aggregate updates require at least the configured fresh feeder quorum and must not use stale submissions. | Fargard 7 and policy-review inputs depend on fresh, quorum-backed economic signals. | Echidna stateful fuzzing for feeder submissions and time windows; Foundry invariants for quorum counts and aggregate timestamps. | PriceOracle aggregation, invalidation, freshness tests; Step-7 oracle stress tests. | High | Precise time/staleness harness and arithmetic-mean model pending. |
| `ProductionOracle` | Category counters, unit category state, loan eligibility, and subsidy state remain consistent across score updates. | Industrial policy accounting should not drift during category transitions or failed calls. | Foundry invariant tests for counter conservation and category membership; Echidna fuzzing for score boundaries. | ProductionOracle unit, category, loan, subsidy tests; Step-7 policy-layer tests. | Medium | Counter-conservation property not yet isolated as a formal harness. |
| `BaseIncome` | Economic oracle signals cannot mutate wage constants, employer records, payment counts, or subsidy state. | Wage and support policy must remain explicit role/module behavior, not autonomous oracle execution. | Non-interference harness between `PriceOracle` and `BaseIncome`; Foundry invariant checks over selected state variables. | BaseIncome tests and Step-7 policy neutrality coverage. | Medium | Cross-contract non-interference model pending. |
| `BudgetAllocation` | Sector spending cannot exceed allocated budget and locked sectors cannot record new spending. | Budget containment is a core fiscal safety boundary. | SMTChecker for local require-paths; Foundry invariants for per-sector `spent <= allocated` and lock immutability. | BudgetAllocation tests and Step-7 budget containment test. | High | Formal sector-state harness pending. |
| `Provincial` | Revenue distribution preserves 30/70 accounting and productivity bonuses follow the implemented threshold. | Provincial and national balances must remain explainable and bounded. | Foundry invariant tests for revenue split and balance deltas; Echidna fuzzing for productivity score boundaries. | Provincial tests and Step-7 redistribution/productivity boundary test. | Medium | Bonus effect and revenue-conservation relation pending. |
| `VelocityFee` | Fees can increase collected totals only through authorized explicit `applyFee`, and staking-exempt accounts remain fee-exempt. | Dormant-liquidity policy must not become autonomous or penalize exempt staking state. | Foundry invariant tests around `totalFeesCollected`, account status, staking flags, and token balances. | VelocityFee tests and Step-7 dormant-liquidity tests. | Medium | Token-balance interaction model pending. |
| `Fargard7PolicyAdapter` | Recommendation lifecycle functions cannot mutate downstream policy contracts, cannot set `executable = true`, and cannot approve stale or expired recommendations. | The adapter is proposal-only and must not become an autonomous policy executor. | Non-interference harness over downstream policy state; Foundry invariants for recommendation status, `executable`, freshness, and expiration. | Step-7 adapter creation, stale/invalid signal, approval, rejection, expiration, and non-execution tests. | High | Formal downstream non-interference harness pending. |

### Threat Model / Attack Surface Matrix

This matrix is an audit-preparation threat index only. It does not claim that an audit, formal verification pass, or production security certification is complete.

| Subsystem | Threat/attack vector | Affected contract(s) | Existing mitigation | Test/evidence | Remaining audit concern | Severity |
| --- | --- | --- | --- | --- | --- | --- |
| Kernel / authority | Unauthorized caller attempts to activate emergency behavior, grant protected access, replay trigger authority, or use oracle forwarding as a privilege bypass. | `IranOS_Kernel`, `TriggerProtocol`, `API3Oracle` | AccessControl roles, court-signature thresholding, terminal trigger state, explicit Kernel-only paths, and bridge atomicity on failed forwarding. | Kernel, TriggerProtocol, and API3 bridge tests; Step-3 and Step-6 reports. | Full role graph and privilege-escalation review across all Kernel-connected modules remains pending. | High |
| PahlaviToken / monetary controls | Unauthorized mint/burn, reserve-backing bypass, liquidity-cap bypass, transfer during emergency state, or SWF accounting drift. | `PahlaviToken`, `SovereignWealthFund`, `AssetFreeze` | SWF-gated minting, liquidity cap, reserve checks, emergency transfer block, multi-signature SWF withdrawals, and atomic reclaimed-asset transfer behavior. | PahlaviToken, SWF, and AssetFreeze tests; Step-4 model; Step-6 report. | Formal reserve-conservation and cross-contract monetary accounting proof remains pending. | High |
| PriceOracle / feeder manipulation / stale data | Malicious or stale feeder submissions attempt to refresh aggregates, distort economic indicators, or contaminate independent price paths. | `PriceOracle` | Feeder role gate, minimum fresh quorum, staleness checks, explicit invalidation, deviation observability, and independent key aggregation. | PriceOracle tests; Step-7 oracle stress tests and report. | Arithmetic-mean manipulation tolerance and deviation-event policy assumptions need audit review. | High |
| ProductionOracle / classification authority | Unauthorized classification, score manipulation, category counter drift, loan eligibility abuse, or critical subsidy misuse. | `ProductionOracle` | Feeder and bank role gates, score bounds, category transition logic, loan eligibility checks, and subsidy restrictions. | ProductionOracle tests; Step-7 policy-layer tests and report. | Category counter conservation and repeated transition edge cases need focused audit checklist coverage. | Medium |
| BaseIncome / welfare policy | Unauthorized employer registration, false wage compliance records, subsidy abuse, or economic oracle signals mutating welfare state. | `BaseIncome` | Oracle, employer, and SWF role gates; minimum wage constants; explicit wage-payment recording; no PriceOracle execution path. | BaseIncome tests; Step-7 policy neutrality coverage. | Cross-contract non-interference from economic oracle signals remains a formal target. | Medium |
| BudgetAllocation / spending controls | Unauthorized budget approval, overspending sector allocation, spending from locked sectors, or oracle-driven budget mutation. | `BudgetAllocation` | Parliament/government/auditor/Kernel role gates, fixed sector allocation after approval, overspend rejection, and sector lock checks. | BudgetAllocation tests; Step-7 budget containment test and report. | Formal `spent <= allocated` property and lock immutability proof remain pending. | High |
| Provincial / revenue and bonus authority | Unauthorized revenue distribution, productivity-score manipulation, governor role misuse, or incorrect provincial/national balance split. | `Provincial` | Kernel registration, oracle-gated revenue and productivity updates, score bounds, 30/70 split, and bonus threshold checks. | Provincial tests; Step-7 redistribution/productivity boundary test and report. | Balance-conservation relation for revenue and bonus effects remains pending. | Medium |
| VelocityFee / dormant-liquidity fee authority | Unauthorized fee application, staking-exempt account penalization, stale activity manipulation, or gas oracle signal becoming autonomous fee authority. | `VelocityFee`, `PahlaviToken` | Oracle account registration, staking role exemption, explicit `applyFee`, tiered calculation from real token balance, and no autonomous `GAS_USD` mutation path. | VelocityFee tests; Step-7 dormant-liquidity policy tests and report. | Token-balance dependency and fee-accounting invariants need formal harness coverage. | Medium |
| Fargard7PolicyAdapter / proposal-only review workflow | Recommendation approval treated as execution, stale signals accepted, reviewer role abused, status replay, or downstream policy mutation through adapter lifecycle calls. | `Fargard7PolicyAdapter`, `PriceOracle` | Fresh signal requirement, `executable = false`, reviewer-gated approve/reject/expire, review window, duplicate-action rejection, and no downstream module calls. | Step-7 adapter creation, hardening, and review workflow tests; Step-7 report. | Formal downstream non-interference and future execution-path separation remain critical before any later implementation. | High |

### Audit Gap Register

This register tracks open audit-preparation gaps only. It does not claim that audit remediation, formal verification, or production readiness is complete.

| Gap ID | Subsystem | Gap | Source section | Risk | Proposed next action | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GAP-001 | Kernel / authority | Formal role graph and privileged-entry-point model are not yet documented. | Invariant inventory; evidence index; formal verification targets; threat matrix | Unmodeled privilege paths could hide escalation or authority replay assumptions. | Build a role graph covering Kernel, TriggerProtocol, API3 bridge, and Kernel-connected modules. | High | Open |
| GAP-002 | PahlaviToken / monetary controls | Formal reserve-backed mint relation and cross-contract monetary accounting proof are pending. | Invariant inventory; evidence index; formal verification targets; threat matrix | Supply, reserve, or SWF accounting assumptions may remain test-backed but not proof-backed. | Define supply-cap, reserve-backing, SWF withdrawal, and reclaimed-asset conservation properties. | High | Open |
| GAP-003 | PriceOracle | Aggregation arithmetic, time/staleness harness, and outlier-event assumptions need formal specification. | Invariant inventory; evidence index; formal verification targets; threat matrix | Feeder manipulation tolerance and stale-data boundaries may be under-specified for auditors. | Document oracle arithmetic assumptions and create a stateful feeder/quorum/staleness verification plan. | High | Open |
| GAP-004 | ProductionOracle | Category counter conservation under all category transitions is not isolated as a formal target. | Invariant inventory; evidence index; formal verification targets; threat matrix | Repeated transitions or edge-case score updates could cause accounting drift if not exhaustively checked. | Add an audit checklist for category counters and define a counter-conservation invariant harness. | Medium | Open |
| GAP-005 | BaseIncome | Cross-contract non-interference between economic oracle signals and welfare state is not formally modeled. | Invariant inventory; evidence index; formal verification targets; threat matrix | Future integrations could accidentally treat oracle signals as autonomous welfare-policy authority. | Define non-interference targets for wage constants, employer records, payment counts, and subsidy state. | Medium | Open |
| GAP-006 | BudgetAllocation | Formal sector-spend bounds and locked-sector immutability proofs are pending. | Invariant inventory; evidence index; formal verification targets; threat matrix | Fiscal containment relies on tests without a dedicated proof harness for `spent <= allocated`. | Create per-sector spend-bound and lock-state invariant targets. | High | Open |
| GAP-007 | Provincial | Revenue-conservation relation for provincial/national split and bonus effects remains pending. | Invariant inventory; evidence index; formal verification targets; threat matrix | Provincial balance behavior could be hard to audit without explicit conservation equations. | Specify balance deltas for revenue distribution and productivity bonus flows. | Medium | Open |
| GAP-008 | VelocityFee | Token-balance dependency and fee-accounting invariants are not yet modeled formally. | Invariant inventory; evidence index; formal verification targets; threat matrix | Fee collection could depend on token state in ways not captured by local contract-only checks. | Define harness around token balances, staking status, account status, and `totalFeesCollected`. | Medium | Open |
| GAP-009 | Fargard7PolicyAdapter | Formal downstream non-interference harness and future execution-path separation are pending. | Invariant inventory; evidence index; formal verification targets; threat matrix | Proposal approval could be misread as execution authority in future design work. | Define non-execution properties proving adapter lifecycle calls cannot mutate downstream modules or set executable authority. | High | Open |
| GAP-010 | Cross-subsystem audit packet | Contract-by-contract entry-point, role, state-variable, and event checklist is not yet expanded. | Evidence index; Step-8 opening status | External auditors need a navigable checklist beyond the high-level evidence tables. | Expand this report into a contract-by-contract audit checklist. | Medium | Open |

### Gap Remediation Plan

This plan prioritizes open gaps for later Step-8 work. It does not claim the gaps are fixed, does not claim audit completion, and does not claim formal verification completion.

| Priority | Gap ID | Subsystem | Remediation type | Action | Expected evidence | Suggested phase | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | GAP-001 | Kernel / authority | stronger docs | Build a role graph and privileged-entry-point checklist for Kernel, TriggerProtocol, API3 bridge, and Kernel-connected modules. | Authority graph, entry-point checklist, and reviewer questions linked from this report. | Step-8 audit checklist expansion | Planned |
| P0 | GAP-002 | PahlaviToken / monetary controls | formal verification target | Define supply-cap, reserve-backed mint, SWF withdrawal, and reclaimed-asset conservation proof obligations. | Formal target specification plus mapped tests for monetary and reserve invariants. | Step-8 formal verification preparation | Planned |
| P0 | GAP-003 | PriceOracle | stronger docs | Document aggregation arithmetic, staleness assumptions, deviation-event meaning, and feeder quorum threat assumptions. | Oracle assumptions note and reviewer checklist for feeder manipulation and stale data. | Step-8 audit checklist expansion | Planned |
| P0 | GAP-006 | BudgetAllocation | formal verification target | Specify per-sector `spent <= allocated` and locked-sector immutability proof obligations. | Formal target specification and mapped BudgetAllocation evidence. | Step-8 formal verification preparation | Planned |
| P0 | GAP-009 | Fargard7PolicyAdapter | formal verification target | Define downstream non-interference and non-execution properties for every recommendation lifecycle function. | Formal target specification confirming `executable = false` and no downstream policy mutation. | Step-8 formal verification preparation | Planned |
| P1 | GAP-004 | ProductionOracle | new test | Add future counter-conservation tests for repeated category transitions and score edge cases if audit review identifies current coverage gaps. | New test evidence or documented auditor finding that existing coverage is sufficient. | Future Step-8 evidence work | Planned |
| P1 | GAP-005 | BaseIncome | formal verification target | Model non-interference between economic oracle signals and BaseIncome wage, employer, payment, and subsidy state. | Non-interference proof target and mapped Step-7 neutrality evidence. | Step-8 formal verification preparation | Planned |
| P1 | GAP-007 | Provincial | formal verification target | Specify revenue and bonus balance deltas for provincial and national accounting flows. | Formal conservation relation and reviewer checklist for bonus effects. | Step-8 formal verification preparation | Planned |
| P1 | GAP-008 | VelocityFee | new test | Add future fee-accounting and staking-exemption stress tests around token-balance dependency if audit review requests deeper coverage. | New test evidence or documented reviewer acceptance of existing fee tests. | Future Step-8 evidence work | Planned |
| P1 | GAP-010 | Cross-subsystem audit packet | stronger docs | Expand the audit package into contract-by-contract entry points, roles, state variables, events, invariants, and non-goals. | Contract-by-contract audit checklist appended to or linked from this report. | Step-8 audit checklist expansion | Planned |
| P2 | GAP-003 | PriceOracle | external audit review | Ask external reviewers to assess whether arithmetic mean and deviation event design are acceptable for the stated signal-only doctrine. | Auditor notes, findings, or accepted-risk rationale. | External audit execution | Planned |
| P2 | GAP-009 | Fargard7PolicyAdapter | future implementation | Keep any future execution-path design separate from the current proposal-only adapter and require new tests before implementation claims. | Separate design document, explicit non-goal preservation, and new tests before any code path is added. | Future post-audit design phase | Planned |

### Remediation Evidence Log

This log records Step-8 remediation evidence as it is added. It does not claim external audit completion, formal verification completion, or full gap closure.

| Gap ID | Subsystem | Evidence added | File | Coverage | Remaining status |
| --- | --- | --- | --- | --- | --- |
| GAP-001 | Kernel / authority | Added one deterministic Kernel authority-boundary test covering unauthorized admin attempts, state-neutral failure, and the valid sovereign role path. | `test/01_Kernel.test.js` | Unauthorized callers cannot grant official access, update Kernel dependency addresses, or clear the emergency lock; failed attempts preserve access flags, role assignments, dependency addresses, violation counts, trigger counts, and lock state; sovereign grant path still works. | Partial remediation evidence added; formal role graph and proof target remain open. |
| GAP-002 | PahlaviToken / monetary controls | Added one deterministic monetary-boundary test covering unauthorized mint/burn attempts, state-neutral failure, authorized SWF mint/burn paths, and unaffected transfer behavior. | `test/02_pahlavi_token.test.js` | Unauthorized callers cannot mint or burn; failed attempts preserve balances and total supply; SWF mint and burn still work; normal ERC-20 transfer remains available outside emergency mode. | Partial remediation evidence added; formal reserve-backed mint and monetary accounting proof targets remain open. |
| GAP-003 | PriceOracle | Added one deterministic oracle-integrity test covering unauthorized feeder rejection, state-neutral failure, stale-submission non-refresh, severe-deviation observability, and fresh-quorum recovery. | `test/23_Price_Oracle.test.js` | Unauthorized feeder submission does not mutate aggregate or attacker submission state; after staleness, a single fresh severe-deviation submission emits `DeviationDetected` but cannot refresh the aggregate; a new fresh quorum emits `PriceUpdated` and updates the aggregate. | Partial remediation evidence added; formal staleness, aggregation arithmetic, and feeder-manipulation proof targets remain open. |
| GAP-004 | ProductionOracle | Added one deterministic production-boundary test covering unauthorized classification update rejection, state-neutral failed update, authorized category transitions, loan eligibility boundaries, unauthorized subsidy rejection, and authorized critical subsidy. | `test/24_Production_Oracle.test.js` | Unauthorized production-data updates preserve unit state, category counters, total units, and eligibility count; authorized feeder updates move Transition to Pioneer and later Critical; Pioneer loan eligibility uses the expected low-rate path; Critical units reject loan eligibility; only bank role can grant critical subsidy. | Partial remediation evidence added; formal category counter-conservation target remains open. |
| GAP-005 | BaseIncome | Added one deterministic welfare-boundary test covering unauthorized employer registration, wage recording, subsidy grant/revoke rejection, state-neutral failed paths, authorized wage compliance, subsidy grant/revoke, and tax-exemption constants. | `test/12_Base_Income.test.js` | Unauthorized welfare actions preserve employer record, payment count, compliance counters, subsidy state, `MIN_WAGE`, and `TAX_EXEMPT_CAP`; authorized oracle registration, employer wage recording, SWF subsidy grant/revoke, and tax exemption reads still work. | Partial remediation evidence added; formal economic-oracle-to-welfare non-interference target remains open. |
| GAP-006 | BudgetAllocation | Added one deterministic fiscal-boundary test covering unauthorized approval/spend/lock rejection, state-neutral failed paths, expected sector allocation, overspend rejection, auditor flagging, sector locking, and locked-sector spend rejection. | `test/17_Budget_Allocation.test.js` | Unauthorized budget actions preserve approval state, fiscal year, expenditure count, allocations, spent totals, and lock state; authorized approval sets expected Health/Defense allocations; spending stays under allocation, overspend is state-neutral, auditor flagging works, and Kernel-locked sectors reject later spending. | Partial remediation evidence added; formal sector-spend and lock immutability proof targets remain open. |
| GAP-007 | Provincial | Added one deterministic provincial-boundary test covering unauthorized registration/revenue/score/bonus rejection, state-neutral failed paths, authorized registration, 30/70 revenue distribution, productivity score bounds, and bonus threshold behavior. | `test/16_Provincial.test.js` | Unauthorized calls preserve province count, province fields, governor mapping/role, revenue balances, productivity score, and bonus balance; authorized Kernel registration and bonus paths plus Oracle revenue/score paths still work; low score and out-of-range score are rejected. | Partial remediation evidence added; formal provincial/national revenue and bonus conservation proof targets remain open. |

### Audit Package Reviewer Handoff

This handoff section is a reviewer-facing index for Step-8 audit preparation. It does not claim that audit review, formal verification, or production readiness is complete.

Recommended reading order:

1. `docs/IRAN_OS_ROADMAP.md` for phase context and doctrine preservation rules.
2. `docs/STEP3_RUNTIME_HARDENING_MATRIX.md` for runtime invariant history.
3. `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md` for reserve and accounting assumptions.
4. `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md` for governance and constitutional execution hardening.
5. `docs/reports/STEP7_STRESS_TESTING_REPORT.md` for oracle, policy-layer, and adapter stress evidence.
6. This Step-8 report for the invariant inventory, evidence index, formal verification targets, threat matrix, and open gap register.

Key contracts to inspect first:

- `contracts/IranOS_Kernel.sol`
- `contracts/token/PahlaviToken.sol`
- `contracts/oracle/PriceOracle.sol`
- `contracts/governance/Fargard7PolicyAdapter.sol`
- `contracts/governance/BudgetAllocation.sol`
- `contracts/oracle/ProductionOracle.sol`
- `contracts/social/BaseIncome.sol`
- `contracts/governance/Provincial.sol`
- `contracts/economic/VelocityFee.sol`

Key test files and reports as evidence:

- `test/25_Step7_StressBaseline.test.js`
- `test/26_Step7_PolicyLayer.test.js`
- Core Kernel, TriggerProtocol, PahlaviToken, SWF, PriceOracle, ProductionOracle, BaseIncome, BudgetAllocation, Provincial, and VelocityFee tests in the existing Hardhat suite.
- `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`

Known non-claims:

- External audit is not complete.
- Formal verification is not complete.
- Production readiness is not claimed.
- `Fargard7PolicyAdapter` is proposal-only and non-executing.
- Adapter review approval is local review metadata, not downstream policy execution.

High-priority gaps from the audit gap register:

- GAP-001: Kernel role graph and privileged-entry-point model.
- GAP-002: PahlaviToken reserve-backed mint and monetary accounting proof.
- GAP-003: PriceOracle aggregation, staleness, and outlier assumptions.
- GAP-006: BudgetAllocation sector-spend bounds and lock immutability.
- GAP-009: Fargard7PolicyAdapter downstream non-interference and execution-path separation.

Suggested next reviewer actions:

- Build the contract-by-contract entry-point, role, state-variable, and event checklist.
- Prioritize the high-severity threat rows before medium-severity policy-module rows.
- Convert the high-priority gaps into concrete audit questions and proof obligations.
- Confirm that every adapter claim remains proposal-only and non-executing.
- Identify any missing tests before proposing implementation changes.

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

## 7. Step-8 Checkpoint Status

Step-8 is opened as a docs-only audit-readiness phase. No implementation changes, test changes, contract changes, or formal-verification claims are included in this opening checkpoint.

The Step-8 audit-readiness package v1 is checkpointed as complete for documentation readiness. This package now includes:

- Critical contract surfaces and authority boundary map.
- Subsystem invariant map and initial invariant inventory.
- Audit evidence index.
- Formal verification candidate properties and formal verification target list.
- Threat model / attack surface matrix.
- Audit gap register.
- Reviewer-facing audit package handoff.

This checkpoint does not mark external audit complete, does not mark formal verification complete, and does not claim production readiness. Step-8 remains open for actual audit execution, formal verification work, gap remediation planning, and any future evidence-driven tests or implementation work.

The recommended next Step-8 task is to convert the high-priority audit gap register items into contract-by-contract reviewer checklists and proof obligations.

## 8. Step-8 Midpoint Status

Step-8 has reached a midpoint documentation checkpoint. The audit-readiness package v1 is complete, and the gap remediation plan is prepared.

Current status:

- Audit-readiness package v1 is complete for documentation readiness.
- Gap remediation items are planned, not fixed.
- External audit execution has not been completed.
- Formal verification has not been completed.
- No implementation, contract, source, or test changes are included in this checkpoint.
- `Fargard7PolicyAdapter` remains proposal-only and non-executing.
- Step-8 remains open.

The next Step-8 direction is to execute prioritized remediation items, starting with the P0 items in the gap remediation plan: Kernel authority graphing, PahlaviToken monetary proof targets, PriceOracle assumptions, BudgetAllocation fiscal bounds, and `Fargard7PolicyAdapter` downstream non-interference.
