# Step-12 Formal Verification Prep Packet

**Blocker:** `STEP9-BLOCK-002` formal verification evidence
**GitHub issue:** https://github.com/fafa33/Iran-OS/issues/13
**Status:** Draft formal-verification prep packet
**Evidence state:** Draft; not proof evidence; not accepted evidence
**Reviewer/signoff state:** Not reviewer signoff
**Disposition:** No blocker closure; `STEP9-BLOCK-002` remains pending/open

## 1. Purpose

This packet starts formal verification evidence preparation for `STEP9-BLOCK-002`. It gathers repository-supported proof candidates, target contracts, assumptions, placeholder tool/config records, and unresolved-obligation templates for later formal methods work.

This document is not proof evidence, does not include formal tool output, does not mark evidence as accepted, does not provide reviewer signoff, does not close `STEP9-BLOCK-002`, does not close any other blocker, does not claim production readiness, does not claim release approval, does not claim completed external audit, and does not claim completed formal verification.

`Fargard7PolicyAdapter` remains proposal-only/non-executing. Oracle signals remain non-sovereign and cannot autonomously freeze, unfreeze, mint, burn, transfer, spend, classify, subsidize, apply fees, change wages, alter budgets, approve loans, mutate provincial balances, or execute governance.

## 2. Source Material Reviewed

Repository-supported inputs used for this draft:

- `README.md`
- `package.json`
- `hardhat.config.js`
- `contracts/`
- `test/`
- `docs/IRAN_OS_ROADMAP.md`
- `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`
- `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`
- `docs/STEP4_1_TREASURY_ACCOUNTING_RULES.md`
- `docs/STEP4_2_RESERVE_CLASSIFICATION_PROTOCOL.md`
- `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`
- `docs/STEP4_4_CROSS_LAYER_CONSERVATION_INVARIANTS.md`
- `docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md`
- `docs/STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md`
- `docs/STEP5_1_STORAGE_INVARIANT_MAPPING.md`
- `docs/STEP5_2_EXECUTABLE_INVARIANT_MATRIX.md`
- `docs/STEP5_3_RUNTIME_ENFORCEMENT_PLANNING.md`
- `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP10_PRODUCTION_READINESS_BLOCKER_RESOLUTION_PLAN.md`
- `docs/reports/STEP11_PRODUCTION_READINESS_EVIDENCE_INTAKE.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`
- GitHub issue tracker entry for `STEP9-BLOCK-002`: https://github.com/fafa33/Iran-OS/issues/13

## 3. Proposed Proof Scope

Repository-supported proposed proof scope:

- Authority reachability and role-gated entry points for Kernel, trigger, treasury, budget, oracle, welfare, governance, reclaim, and adapter surfaces.
- Failed-call neutrality for accounting state, role state, trigger state, oracle aggregate state, budget state, custody-sensitive state, and adapter recommendation state.
- Replay and exact-once behavior for terminal trigger execution, SWF withdrawals, reclaimed-asset intake, jury votes, and review lifecycle paths.
- Monetary and reserve constraints, including liquidity cap, reserve-backed minting, SWF layer accounting, and reclaimed-asset conservation.
- Oracle freshness, quorum, staleness, invalidation, and independent signal-path behavior.
- Policy-layer non-interference: oracle signals and `Fargard7PolicyAdapter` recommendations must not autonomously mutate wages, budgets, fees, production classifications, subsidies, loans, provincial balances, emergency state, or governance.

Evidence status:

- Draft proposed proof scope exists from repository documentation and tests.
- Pending; no formal methods owner or formal verification reviewer has accepted this proof scope.
- Pending; no proof artifacts, tool output, failed-obligation disposition, reviewer approval, or signoff is recorded.

## 4. Target Contract and Module List

Repository-supported target list:

| Target area | Contract/module candidates | Proof focus |
| --- | --- | --- |
| Kernel and trigger authority | `contracts/kernel.sol`, `contracts/core/TriggerProtocol.sol`, `contracts/core/ConstitutionGuard.sol`, `contracts/oracles/API3Oracle.sol` | Role reachability, emergency lock boundaries, trigger threshold/finality, bridge atomicity, non-terminal accounting neutrality. |
| Monetary and reserve accounting | `contracts/monetary/PahlaviToken.sol`, `contracts/monetary/SovereignWealthFund.sol`, `contracts/reclaim/AssetFreeze.sol`, `contracts/monetary/Treasury.sol` | Supply cap, reserve-backed minting, SWF withdrawal exact-once behavior, reclaimed-asset conservation, treasury access blocking. |
| Oracle signal integrity | `contracts/oracles/PriceOracle.sol`, `contracts/oracles/ProductionOracle.sol`, `contracts/oracles/API3Oracle.sol` | Feeder authorization, fresh quorum, staleness exclusion, invalidation, score bounds, category accounting. |
| Fiscal and governance controls | `contracts/governance/BudgetAllocation.sol`, `contracts/governance/Parliament.sol`, `contracts/governance/VotingSystem.sol`, `contracts/governance/Provincial.sol` | Sector spend bounds, lock immutability, voting constraints, revenue split conservation, governor role transitions. |
| Welfare and policy modules | `contracts/welfare/BaseIncome.sol`, `contracts/welfare/CitizenCard.sol`, `contracts/welfare/HealthCoverage.sol`, `contracts/welfare/DisabilitySupport.sol`, `contracts/monetary/VelocityFee.sol` | Role-gated welfare actions, payment/benefit neutrality on failed calls, fee accounting, staking exemption. |
| Justice and reclaim flows | `contracts/justice/JurySelection.sol`, `contracts/justice/JusticeProtocol.sol`, `contracts/justice/PenalLabor.sol`, `contracts/reclaim/SovereignCrawler.sol`, `contracts/reclaim/VictimFund.sol` | Vote uniqueness, case finality, compensation accounting, freeze/release authority, transfer lifecycle. |
| Fargard 7 adapter non-execution | `contracts/governance/Fargard7PolicyAdapter.sol`, `contracts/oracles/PriceOracle.sol` | Recommendation freshness, `executable = false`, review lifecycle, duplicate-action rejection, downstream non-interference. |

Evidence status:

- Draft target list exists.
- Pending; target-to-property mapping is not accepted.
- Pending; formal reviewer input is required to prioritize and freeze proof targets.

## 5. Candidate Invariants and Properties

Repository-supported candidate properties from Step-8 and related invariant docs:

| Candidate property | Target(s) | Existing support | Current proof status |
| --- | --- | --- | --- |
| Unauthorized callers cannot activate emergency authority, grant protected access, or bypass court-signature paths. | `IranOS_Kernel`, `TriggerProtocol`, `API3Oracle` | Kernel, TriggerProtocol, API3 bridge tests; Step-3, Step-6, Step-8 docs. | Pending; no formal proof artifact. |
| Failed calls preserve accounting state for SWF, token supply, treasury, freeze, budget, trigger, oracle, and adapter records. | Kernel-connected accounting and governance modules | Runtime hardening tests and Step-8 remediation evidence. | Pending; no formal proof artifact. |
| Terminal trigger execution cannot be replayed into duplicate downstream effects. | `TriggerProtocol`, `IranOS_Kernel` | Trigger lifecycle and replay tests. | Pending; no formal proof artifact. |
| Pahlavi supply cannot exceed liquidity cap and minting remains SWF-gated and reserve-aware. | `PahlaviToken`, `SovereignWealthFund` | Token mint/burn/backing tests; Step-4 docs. | Pending; no formal proof artifact. |
| SWF withdrawals execute at most once and only after required signature threshold. | `SovereignWealthFund` | SWF withdrawal and replay tests. | Pending; no formal proof artifact. |
| Price aggregates require configured fresh feeder quorum and cannot update from stale submissions. | `PriceOracle` | PriceOracle tests and Step-7 oracle stress tests. | Pending; no formal proof artifact. |
| Production category counters and eligibility state remain consistent across score updates. | `ProductionOracle` | ProductionOracle tests and Step-8 audit-readiness gap register. | Pending; no formal proof artifact. |
| Sector spending cannot exceed allocated budget and locked sectors cannot record later spending. | `BudgetAllocation` | Budget tests and Step-7 policy-layer containment evidence. | Pending; no formal proof artifact. |
| Provincial revenue distribution preserves documented split and bonus thresholds. | `Provincial` | Provincial tests and Step-7 policy-layer evidence. | Pending; no formal proof artifact. |
| Fees can increase collected totals only through authorized explicit fee application, with staking exemptions preserved. | `VelocityFee`, `PahlaviToken` | VelocityFee tests and Step-7 dormant-liquidity evidence. | Pending; no formal proof artifact. |
| Economic oracle signals cannot mutate wage, employer, payment, subsidy, budget, fee, production, loan, or provincial state by themselves. | `PriceOracle`, `BaseIncome`, `BudgetAllocation`, `VelocityFee`, `ProductionOracle`, `Provincial` | Step-7 policy neutrality tests and reports. | Pending; no formal proof artifact. |
| `Fargard7PolicyAdapter` lifecycle functions cannot mutate downstream policy modules, cannot set `executable = true`, and cannot approve stale or expired recommendations. | `Fargard7PolicyAdapter`, downstream modules | Step-7 adapter tests and Step-8 audit-readiness targets. | Pending; no formal proof artifact. |

Evidence status:

- Candidate properties are documented and test-backed.
- Pending; tests do not close the formal verification blocker and do not substitute for proof artifacts, tool output, assumptions, failed-obligation disposition, or formal reviewer signoff.

## 6. Assumptions

Repository-supported assumptions and placeholders:

- Solidity compiler configuration in `hardhat.config.js`: Solidity `0.8.26`, optimizer enabled with `runs: 200`, `viaIR: true`.
- Project paths in `hardhat.config.js`: sources at `./contracts`, tests at `./test`, cache at `./cache`, artifacts at `./artifacts`.
- Hardhat network chain ID in `hardhat.config.js`: `31337`.
- Current test command in `package.json`: `npm test` runs `hardhat test`.
- Candidate proof methods named in Step-8 docs include Echidna, Foundry invariants, and SMTChecker for selected properties.

Pending assumptions requiring formal reviewer input:

- Exact formal toolchain, version, and configuration.
- Harness boundaries and environment model.
- Time/staleness model for oracle proofs.
- Role-holder model and privileged-entry-point model.
- Cross-contract call model and dependency wiring assumptions.
- Integer arithmetic and compiler optimization assumptions.
- Scope of accepted unresolved obligations or proof-risk records.

This draft does not approve assumptions and does not claim they are sufficient for proof evidence.

## 7. Tool and Configuration Record Placeholder

No formal tool run is recorded by this draft.

| Tool | Version | Target/property set | Config file or command | Output location | Status |
| --- | --- | --- | --- | --- | --- |
| Pending formal reviewer input | Pending | Pending | Pending | Pending | Pending |

Possible tool families referenced by repository docs:

- Hardhat test suite for regression context, not formal proof.
- Echidna for stateful fuzzing candidates.
- Foundry invariant harnesses for selected state properties.
- Solidity SMTChecker for bounded local require-path checks where applicable.

Evidence status:

- Pending; no formal tool, version, command, config, output, or reviewer-approved setup is recorded.

## 8. Proof Artifacts and Tool Output Placeholder

No proof artifacts or formal tool output are recorded by this draft.

| Artifact id | Target/property | Tool/output link | Result | Reviewer | Status |
| --- | --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | Pending | Pending |

Required future artifacts should include:

- Proof artifact index.
- Target-to-contract mapping.
- Tool output or proof logs.
- Harness source or configuration references.
- Assumptions file or assumptions register.
- Counterexample notes where obligations fail.
- Reviewer signoff from the formal methods owner and formal verification reviewer.

## 9. Failed Obligations or Unresolved Proof-Risk Disposition Template

No failed obligations, counterexamples, or unresolved proof-risk dispositions are recorded by this draft.

| Obligation id | Target/property | Failure or unresolved reason | Severity | Counterexample/output link | Proposed disposition | Required approver/signoff | Current status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending formal reviewer input | Pending formal reviewer input | Pending formal reviewer input | Pending formal reviewer input | Pending formal reviewer input | Pending formal reviewer input | Pending |

Disposition rules:

- Formal verification completion must not be claimed for unproven targets.
- Risk acceptance must be specific to an unresolved proof obligation and must not be a blanket acceptance.
- Risk acceptance must include assumptions, severity, rationale, compensating controls, affected release scope, required approving body, and review trigger.
- Unresolved critical/high obligations remain release blockers unless valid governed risk acceptance is recorded under Step-10 rules.

This template does not invent failed obligations, counterexamples, proof-risk decisions, reviewer approval, or signoff.

## 10. Required Formal Methods Owner and Reviewer Signoff

The accepted-evidence checklist and Step-10 plan require formal verification evidence to be reviewed and signed off by:

- Formal methods owner.
- Formal verification reviewer.

Required evidence before `STEP9-BLOCK-002` closure can be considered:

- Proof scope.
- Target list and target-to-contract mapping.
- Tool and configuration record.
- Assumptions register.
- Proof artifacts and tool output.
- Failed obligations, counterexamples, or unresolved proof-risk records.
- Required reviewer signoff.

Required signoff remains pending. This packet is not a signoff and cannot support blocker closure by itself.

## 11. Remaining Gaps

`STEP9-BLOCK-002` remains pending/open because the following accepted evidence is not present:

- Accepted proof scope.
- Accepted target list and target-to-contract mapping.
- Formal tool, version, and configuration record.
- Assumptions file or assumptions register.
- Proof artifacts or tool output.
- Failed-obligation, counterexample, or unresolved proof-risk disposition.
- Formal methods owner signoff.
- Formal verification reviewer signoff.

Repository documentation currently supports formal-verification preparation context, candidate properties, and test-backed evidence references, but it does not provide proof evidence.

## 12. Closure Rule

`STEP9-BLOCK-002` can be considered for closure only after formal verification evidence is submitted, reviewed, and accepted, or after a specific unresolved proof obligation receives valid governed risk acceptance under Step-10 rules. Passing tests and internal formal-verification prep documentation do not close the formal verification blocker.

This draft does not close `STEP9-BLOCK-002`; all blockers remain pending/open.

## 13. Current Non-Claims

- IranOS is not production ready.
- External audit is not complete.
- Formal verification is not complete.
- Release is not approved.
- No `STEP9-BLOCK-*` item is closed.
- No accepted evidence is claimed.
- No proof result, tool output, reviewer approval, failed-obligation disposition, or signoff is claimed.
- `STEP9-BLOCK-002` remains pending/open.
- Step 12 remains open.
- `Fargard7PolicyAdapter` remains proposal-only and non-executing.
- Oracle signals remain non-sovereign.
