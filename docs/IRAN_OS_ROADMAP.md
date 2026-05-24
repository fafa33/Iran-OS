# Iran-OS Roadmap

## Purpose

This roadmap tracks high-level IranOS formalization and hardening progress. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, constitutional constants, Kernel assumptions, oracle authority, or freeze authority.

IranOS is sovereign resilience infrastructure, not a DeFi yield optimization system. Roadmap steps must preserve Kernel immutability, existing threshold and timeout assumptions, oracle-as-signal-only boundaries, and final human freeze authority.

## Project Phases

- [x] Step-1: Core architecture & constitutional foundation
  - Established the constitutional and architectural base for IranOS.
  - Milestone documents: repository architecture and constitutional documentation.

- [x] Step-2: Protocol integration & oracle/trigger connectivity
  - Connected major protocol components, oracle reporting, and trigger pathways.
  - Milestone documents: protocol, oracle, and trigger integration documentation.

- [x] Step-3: Runtime hardening & invariant protection
  - Closed the runtime hardening checkpoint with test-backed invariant coverage for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.
  - Milestone document: [STEP3_RUNTIME_HARDENING_MATRIX.md](STEP3_RUNTIME_HARDENING_MATRIX.md).
  - Status: closed.

- [ ] Step-4: Sovereign reserve & accounting formalization - In progress
  - Formalizes the Sovereign Reserve Model, treasury accounting rules, reserve classification protocol, monetary expansion constraints, cross-layer conservation invariants, and SovereignWealthFund state transition rules before implementation.
  - Milestone document started: [STEP4_SOVEREIGN_RESERVE_MODEL.md](STEP4_SOVEREIGN_RESERVE_MODEL.md).
  - Status: started, not complete.

- [ ] Step-5: Formal treasury/state transition enforcement
  - Translate the Step-4 reserve and accounting specification into enforceable treasury and state transition invariants only after the formalization checkpoint is complete.
  - Milestone document: pending.

- [x] Step-6: Governance & constitutional execution hardening
  - Harden governance execution paths while preserving constitutional constants, Kernel immutability, finality assumptions, and human final freeze authority.
  - Milestone document: [STEP6_RUNTIME_HARDENING_REPORT.md](reports/STEP6_RUNTIME_HARDENING_REPORT.md).
  - Status: closed.

- [x] Step-7: Simulation / adversarial / economic stress testing - Complete
  - Test adversarial, emergency, and economic stress scenarios against the hardened runtime and formalized reserve model.
  - Milestone document started: [STEP7_STRESS_TESTING_REPORT.md](reports/STEP7_STRESS_TESTING_REPORT.md).
  - Oracle/Economic Data Integrity sub-section: checkpointed complete with 446 passing tests and no contract changes.
  - Policy-Layer sub-section: checkpointed complete for current implemented surfaces with oracle signal neutrality, dormant-liquidity, ProductionOracle industrial policy, BudgetAllocation containment, and Provincial redistribution/productivity boundary coverage.
  - `Fargard7PolicyAdapter` design plan: documented as a read-only/proposal-only, authority-bounded coordinator over `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD`, with no autonomous spending, subsidy, fee, reclassification, wage, or budget mutation.
  - `Fargard7PolicyAdapter` first implementation slice: proposal-only recommendation adapter over fresh `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD` signals, with role-gated configuration and no downstream policy mutation.
  - First adapter slice checkpoint: complete for proposal-only behavior with 452 passing tests.
  - Adapter review-boundary hardening: severe-signal recommendations remain non-executing, unauthorized review/configuration paths are rejected, and stale or invalid signals fail safely.
  - Adapter hardening checkpoint: complete for the proposal-only/non-execution invariant with 453 passing tests.
  - Adapter review workflow: implemented Created, Approved, Rejected, and Expired recommendation status with reviewer-gated approval/rejection/expiration and no downstream policy mutation.
  - Adapter review workflow checkpoint: complete for proposal-only/non-executing review state with 454 passing tests.
  - Final closure: complete with 454 passing tests; no autonomous downstream policy mutation is implemented or claimed.
  - Status: closed.

- [x] Step-8: External audit readiness & formal verification preparation - Complete
  - Prepare audit materials, invariant maps, and formal verification targets without claiming formal verification is complete before evidence exists.
  - Initial audit-readiness report opened with critical contract surfaces, authority boundaries, subsystem invariant map, existing test evidence references, and formal verification candidate properties.
  - Audit-readiness package v1 checkpointed with invariant inventory, audit evidence index, formal verification targets, threat model matrix, audit gap register, and reviewer handoff.
  - Gap remediation plan prepared for prioritized follow-up; gaps are planned, not fixed.
  - Midpoint checkpoint: audit package v1 complete and remediation planning complete; external audit execution and formal verification are not complete.
  - First remediation evidence pass complete across Kernel, PahlaviToken, PriceOracle, ProductionOracle, BaseIncome, BudgetAllocation, Provincial, VelocityFee, and Fargard7PolicyAdapter.
  - Test evidence increased from the Step-7 closure baseline of 454 passing tests to 463 passing tests, with no contract or source changes in the remediation pass.
  - Remediation gaps are better evidenced, not formally closed by audit.
  - Final closure: complete as an audit-readiness and remediation-evidence phase with 463 passing tests.
  - External audit is not complete; formal verification is not complete; open proof and audit-review items remain future work.
  - `Fargard7PolicyAdapter` remains proposal-only/non-executing; Step-8 does not introduce downstream policy mutation.
  - Milestone document: [STEP8_AUDIT_READINESS_REPORT.md](reports/STEP8_AUDIT_READINESS_REPORT.md).
  - Status: closed.

- [ ] Step-9: Production governance specification & deployment doctrine - In progress
  - Define final production governance, deployment, operational, and emergency doctrine after prior checkpoints are complete.
  - Initial production governance doctrine opened with scope/non-goals, Step-8 inputs, deployment gate checklist, governance authority map, emergency/freeze doctrine, role custody runbooks, audit/formal-verification prerequisites, production-readiness blockers, and non-claims.
  - Doctrine package v1 checkpointed with deployment gates, authority mapping, custody/key-management runbooks, emergency/freeze doctrine, audit/proof prerequisites, deployment/release runbook, and production blocker register.
  - Deployment gates, authority/custody, emergency/freeze, release, and blocker documentation are complete for the v1 doctrine package.
  - External audit is not complete; formal verification is not complete; production readiness is not claimed.
  - No autonomous policy execution is introduced or claimed.
  - Next direction: final Step-9 closure review or identification of any remaining doctrine gaps before closure.
  - Milestone document started: [STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md](reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md).
  - Status: started, not complete.

## Major Milestone References

- [Step-3 Runtime Hardening Matrix](STEP3_RUNTIME_HARDENING_MATRIX.md)
- [Step-4 Sovereign Reserve Model](STEP4_SOVEREIGN_RESERVE_MODEL.md)
- [Step-6 Runtime Hardening Report](reports/STEP6_RUNTIME_HARDENING_REPORT.md)
- [Step-7 Stress Testing Report](reports/STEP7_STRESS_TESTING_REPORT.md)
- [Step-8 Audit Readiness Report](reports/STEP8_AUDIT_READINESS_REPORT.md)
- [Step-9 Production Governance Deployment Doctrine](reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md)

## Roadmap Maintenance Rule

After each step is functionally complete, update `docs/IRAN_OS_ROADMAP.md` in the same branch before moving to the next step.

- Mark the completed step as `[x]`.
- Mark the next active step as `In progress`.
- Add or update links to the milestone documents for that step.
- Do not mark a step complete unless its checkpoint document exists and tests pass.
- Roadmap updates must be documentation-only unless explicitly paired with the relevant milestone commit.

## Doctrine Preservation Rules

Roadmap updates must not imply or introduce any of the following:

- Kernel upgradeability.
- Changes to thresholds, timeout constants, trigger codes, or constitutional constants.
- Oracle autonomous authority over classification, freeze, unfreeze, mint, burn, transfer, or governance execution.
- Automation replacing final human freeze authority.
- DeFi yield optimization, staking, lending, speculative deployment, or capital-efficiency framing.
- Contract or test changes unless explicitly paired with the relevant milestone work.
