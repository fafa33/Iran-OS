# Step-9 Production Governance Specification & Deployment Doctrine

**Checkpoint:** opened after `7f5b6a2 docs(step8): close audit readiness phase`
**Runtime baseline:** `463 passing` at Step-8 closure
**Scope:** Production governance specification, deployment doctrine, operational runbooks, emergency doctrine, and readiness gates

## 1. Purpose

Step-9 defines the production governance and deployment doctrine for IranOS after the audit-readiness and remediation-evidence phase. This phase is documentation-only at opening. It does not change contracts, tests, architecture, thresholds, timeout constants, constitutional constants, Kernel assumptions, oracle authority, freeze authority, or `Fargard7PolicyAdapter` execution behavior.

Step-9 is intended to make production entry requirements explicit before any deployment claim is made. It records what must be true before production use, who may operate each authority path, what evidence must exist, and which blockers remain unresolved.

## 2. Scope and Non-Goals

### Scope

- Define production deployment gates and evidence requirements.
- Map governance, custody, operational, emergency, freeze, and reviewer authority.
- Document role custody expectations and operational runbooks.
- Preserve Kernel immutability, oracle-as-signal-only boundaries, and final human freeze authority.
- Convert Step-8 audit-readiness outputs into production-facing prerequisites.
- Track blockers that prevent production-readiness claims.

### Non-Goals

- No production readiness claim.
- No external audit completion claim.
- No formal verification completion claim.
- No contract, source, or test changes in this opening checkpoint.
- No Kernel upgradeability or governance backdoor.
- No autonomous oracle execution authority.
- No autonomous policy execution, spending, subsidy, fee, classification, wage, budget, freeze, unfreeze, mint, burn, or transfer path.
- No change to threshold, timeout, trigger-code, or constitutional constants.
- No conversion of `Fargard7PolicyAdapter` recommendations into downstream execution.

## 3. Step-8 Inputs

Step-9 starts from the Step-8 audit-readiness package and remediation evidence:

- `docs/IRAN_OS_ROADMAP.md`
- `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`
- `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`
- `docs/reports/STEP6_RUNTIME_HARDENING_REPORT.md`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `docs/reports/STEP8_AUDIT_READINESS_REPORT.md`
- Critical contract surface list from Step-8.
- Authority boundary map from Step-8.
- Invariant inventory and audit evidence index from Step-8.
- Formal verification candidate properties and target list from Step-8.
- Threat model and audit gap register from Step-8.
- Remediation evidence log raising the suite from 454 to 463 passing tests.

Step-8 inputs remain preparation evidence. They do not complete audit, formal verification, or production certification.

## 4. Deployment Gate Checklist

Production deployment must not be claimed until every gate is satisfied and linked to evidence.

| Gate | Requirement | Evidence needed | Current status |
| --- | --- | --- | --- |
| Clean repository | Deployment candidate commit is clean, reviewed, and reproducible. | `git status`, commit hash, deployment manifest. | Pending production candidate. |
| Full test suite | Latest candidate passes the full Hardhat suite. | `npm test` output. | Baseline: 463 passing at Step-8 closure. |
| Contract inventory | Every deployed contract, constructor argument, role assignment, and dependency address is listed. | Deployment manifest and address book. | Pending. |
| Authority review | Kernel, TriggerProtocol, oracle, SWF, budget, freeze, welfare, production, provincial, fee, and adapter authorities are reviewed. | Role graph and privileged-entry-point checklist. | Pending; Step-8 GAP-001 remains open. |
| External audit | External auditors review critical surfaces and issue findings or acceptance notes. | Audit report and remediation record. | Not complete. |
| Formal verification | High-priority proof targets are specified and completed or explicitly accepted as unproven risk. | Proof artifacts or signed risk acceptance. | Not complete. |
| Emergency procedure | Emergency lock, trigger, freeze, release, and communications runbooks are rehearsed. | Runbook record and rehearsal notes. | Pending. |
| Role custody | Production key custody, quorum procedures, replacement procedures, and incident paths are defined. | Custody runbook and signer registry. | Pending. |
| Oracle operation | Feeder onboarding, stale-data handling, invalidation, and deviation review process are documented. | Oracle operations runbook. | Pending. |
| Non-execution boundary | `Fargard7PolicyAdapter` remains proposal-only and non-executing. | Code review, tests, and deployment manifest. | Required; no autonomous execution allowed. |

## 5. Governance Authority Map

Production governance must preserve explicit, role-gated authority boundaries.

| Authority domain | Primary surface | Doctrine |
| --- | --- | --- |
| Constitutional root | `IranOS_Kernel` | Kernel authority remains explicit and must not become upgrade authority, arbitrary execution authority, or oracle-controlled authority. |
| Trigger execution | `TriggerProtocol` | Terminal trigger execution remains deterministic, role-gated through Kernel paths, and non-replayable. |
| Freeze lifecycle | `AssetFreeze`, `SovereignCrawler`, `IranOS_Kernel` | Freeze, confirmation, transfer, and release remain explicit human or institution-gated actions. |
| Reserve and monetary controls | `SovereignWealthFund`, `PahlaviToken` | Mint, burn, withdrawal, reclaimed asset intake, and reserve accounting remain role-gated and evidence-bound. |
| Oracle signals | `PriceOracle`, `API3Oracle`, `ProductionOracle` | Oracle data remains signal input only and must not autonomously mutate downstream policy state. |
| Budget controls | `BudgetAllocation`, `Treasury`, `Parliament` | Approval, allocation, spending, flagging, and locks remain explicit role actions. |
| Welfare and labor policy | `BaseIncome`, `CitizenCard`, `HealthCoverage`, `DisabilitySupport`, `PenalLabor`, `VictimFund` | Welfare state transitions remain explicit module behavior under existing role paths. |
| Provincial policy | `Provincial` | Revenue distribution, productivity scoring, governors, and bonuses remain authorized and bounded. |
| Dormant-liquidity fee policy | `VelocityFee` | Fees require explicit authorized application and preserve staking exemptions. |
| Fargard 7 review | `Fargard7PolicyAdapter` | Recommendations are reviewer metadata only, with `executable = false` and no downstream mutation. |

## 6. Emergency and Freeze Doctrine

Emergency and freeze operations are high-risk authority paths and require conservative production doctrine.

- Final emergency and freeze authority remains human or institution-gated.
- Automation may notify, aggregate evidence, or prepare review packets, but must not replace final freeze authority.
- Oracle reports may inform review but must not independently freeze, unfreeze, transfer, mint, burn, spend, classify, subsidize, apply fees, change wages, or alter budgets.
- Emergency lock activation, court signature paths, trigger execution, treasury blocking, signature revocation, asset freeze confirmation, SWF transfer, and release must each have a runbook.
- Every emergency action must preserve a post-incident evidence trail: caller, role, target, reason, related trigger or violation, transaction hash, and reviewer sign-off.
- Freeze release must be at least as auditable as freeze initiation.

## 7. Role Custody and Runbooks

Production role custody must be documented before deployment.

Required runbooks:

- Deployment signer and ceremony runbook.
- Sovereign, Kernel, court, council, parliament, government, auditor, oracle, feeder, bank, governor, welfare, health, crawler, node, staking, reviewer, and emergency role custody runbook.
- Key rotation and signer replacement procedure.
- Lost key and compromised key procedure.
- Quorum coordination procedure for council, court, and other multi-party authority paths.
- Oracle feeder onboarding, suspension, stale-data response, invalidation, and deviation review procedure.
- Incident response procedure covering emergency lock, trigger execution, asset freeze, SWF transfer, budget lock, and public notice.
- Post-incident review procedure.

Each runbook must identify the authorized role, required evidence, action sequence, abort conditions, and post-action verification.

## 8. Audit and Formal Verification Prerequisites

Before production readiness can be claimed, Step-9 must either complete or explicitly block on the following:

- External audit review of the critical contract surfaces listed in Step-8.
- Audit finding triage with severity, owner, disposition, and evidence.
- Remediation commits, if any, with passing tests and updated documentation.
- Formal role-reachability model for Kernel and connected authority paths.
- Supply-cap, reserve-backed mint, SWF withdrawal, and reclaimed-asset conservation proof obligations.
- PriceOracle quorum, staleness, invalidation, and aggregation assumptions.
- BudgetAllocation `spent <= allocated` and locked-sector immutability properties.
- `Fargard7PolicyAdapter` downstream non-interference and non-execution properties.
- Risk acceptance record for any proof target intentionally left unproven.

Step-9 may document proof obligations and audit questions before proofs are complete, but it must not describe those obligations as satisfied until evidence exists.

## 9. Production-Readiness Blockers

The following blockers prevent a production-readiness claim at Step-9 opening:

- External audit is not complete.
- Formal verification is not complete.
- Production deployment manifest is not prepared.
- Contract-by-contract production role graph is not complete.
- Production custody and incident runbooks are not complete.
- Emergency and freeze rehearsal evidence is not complete.
- Oracle operations runbook is not complete.
- High-priority Step-8 proof and audit-review items remain open.
- Production risk acceptance process is not documented.

## 10. Non-Claims

This Step-9 opening checkpoint does not claim:

- Production readiness.
- External audit completion.
- Formal verification completion.
- Production deployment approval.
- Runtime certification.
- Full closure of Step-8 gaps.
- Autonomous policy execution.
- Oracle authority over freeze, unfreeze, mint, burn, transfer, governance execution, budget mutation, fee application, wage changes, production classification, subsidy, loan, or provincial balance mutation.
- `Fargard7PolicyAdapter` downstream execution authority.

## 11. Initial Step-9 Status

Step-9 is opened as a documentation-only production governance and deployment doctrine phase.

The first Step-9 task is to expand this document into a contract-by-contract production deployment and operations checklist covering:

- Deployment inputs and constructor arguments.
- Role assignments and custody.
- Privileged entry points.
- Events and evidence logs.
- Emergency and freeze actions.
- Audit and formal verification prerequisites.
- Production-readiness blockers and non-claims.

Step-9 remains open. No production readiness, external audit completion, formal verification completion, or autonomous policy execution is claimed.
