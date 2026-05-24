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

Production deployment must not be claimed until every gate is satisfied and linked to evidence. At Step-9 opening, these gates are doctrine and readiness criteria only.

| Gate | Owner | Required evidence | Pass criteria | Blocker | Status |
| --- | --- | --- | --- | --- | --- |
| Test baseline | Engineering maintainer | Latest clean `npm test` output, candidate commit hash, and confirmation that `git diff -- contracts` and `git diff -- test` are empty unless paired with reviewed implementation work. | Full Hardhat suite passes on the deployment candidate and no undocumented contract or test drift exists. | Failing tests, undocumented test baseline, or unreviewed contract/test changes. | Baseline: 463 passing at Step-8 closure; production candidate pending. |
| External audit | External audit coordinator | Final audit report, finding register, severity triage, remediation evidence, and accepted-risk notes. | Critical surfaces from Step-8 are reviewed and every finding is fixed, explicitly accepted, or deferred with documented rationale. | External audit has not been completed. | Blocked. |
| Formal verification | Formal methods owner | Proof artifacts or signed risk acceptance for high-priority targets: Kernel role reachability, Pahlavi supply/reserve constraints, PriceOracle quorum/staleness, BudgetAllocation spend bounds, and adapter non-interference. | Required proof obligations are complete or unresolved properties are explicitly classified as production blockers or accepted risks. | Formal verification has not been completed. | Blocked. |
| Role custody | Governance operations lead | Production signer registry, role-to-custodian map, quorum procedures, key rotation procedure, compromised-key procedure, and replacement runbook. | Every privileged role has an accountable custodian, recovery path, quorum rule, and incident escalation path. | Missing custody owner, missing quorum procedure, or unresolved key compromise process. | Pending. |
| Emergency/freeze doctrine | Emergency operations lead | Emergency lock, trigger execution, freeze confirmation, SWF transfer, release, public notice, and post-incident review runbooks. | Emergency and freeze actions remain human or institution-gated, rehearsed, auditable, and reversible only through documented authority paths. | Unrehearsed emergency path, unclear release authority, or automation replacing final human freeze authority. | Pending. |
| Oracle operations | Oracle operations lead | Feeder onboarding checklist, feeder suspension procedure, stale-data response, invalidation process, deviation review process, and liveness monitoring record. | Oracle data remains signal-only, fresh quorum expectations are operationalized, and invalidation/deviation workflows are auditable. | Missing feeder controls, stale-data procedure, or any oracle path that autonomously mutates policy state. | Pending. |
| Deployment authority | Deployment coordinator | Deployment manifest, constructor arguments, dependency address book, deployer identity, review signoff, and post-deploy verification log. | Only approved deployment authority executes the candidate, every address and role assignment is reproducible, and post-deploy state matches the manifest. | Missing manifest, unreviewed constructor arguments, unknown deployer, or unverifiable role assignment. | Pending. |
| Rollback/non-upgrade posture | Constitutional governance lead | Non-upgradeability statement, redeployment/rollback doctrine, emergency halt path, data migration assumptions, and no-proxy/no-backdoor review evidence. | Doctrine confirms Kernel immutability and avoids hidden upgrade authority; rollback means governed emergency response or redeployment, not mutable production logic. | Any upgrade backdoor, proxy ambiguity, undocumented migration path, or rollback process that bypasses governance. | Pending. |
| Release signoff | Release council | Signed production-readiness checklist, audit/proof disposition, risk acceptance record, deployment package hash, and final go/no-go minutes. | Release is approved only after all production blockers are closed or formally accepted by the required governance body. | Open blocker, missing signoff, missing risk acceptance, or unresolved audit/proof item. | Pending. |
| Non-execution boundary | Engineering maintainer and governance reviewer | Code review, test evidence, deployment manifest, and adapter review-state inspection. | `Fargard7PolicyAdapter` remains proposal-only, `executable = false`, and no lifecycle function mutates downstream policy modules. | Any autonomous policy execution or downstream mutation path. | Required; no autonomous execution allowed. |

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

### Production Role Authority Checklist

Production role authority must be mapped before any deployment-readiness claim. The following checklist is a doctrine target only; the listed custody owners and evidence packages remain pending until production operators are appointed and reviewed.

| Role | Authority | Custody owner | Allowed actions | Prohibited actions | Required evidence | Blocker |
| --- | --- | --- | --- | --- | --- | --- |
| Kernel sovereign/admin | Constitutional and system authority root for protected access, dependency addresses, emergency-state clearing, and Kernel-connected authority paths. | Constitutional governance lead and sovereign signer registry. | Execute only documented Kernel authority actions through approved role paths; maintain role graph and post-action verification. | Kernel upgradeability, arbitrary execution, hidden admin backdoors, threshold changes, timeout changes, trigger-code changes, or oracle-controlled Kernel actions. | Role graph, signer registry, privileged-entry-point checklist, action record, transaction hash, and reviewer signoff. | Missing role graph, unknown sovereign custodian, or any mutable/upgradeable Kernel authority path. |
| SWF/minter | Reserve accounting, SWF withdrawal coordination, reclaimed-asset intake, and Pahlavi mint/burn authority. | SWF council custody lead and monetary controls reviewer. | Mint/burn only through authorized SWF paths; execute withdrawals only after required signatures; record reserve and accounting evidence. | Unauthorized mint/burn, supply-cap bypass, reserve-backing bypass, duplicate withdrawal execution, or undocumented reclaimed-asset intake. | Council signer registry, withdrawal proposal/signature record, reserve evidence, supply check, transaction hash, and post-action accounting diff. | Missing reserve evidence, incomplete signer quorum record, or unresolved monetary proof/audit finding. |
| Oracle feeders | Feeder submissions for PriceOracle/API3/ProductionOracle signal paths. | Oracle operations lead. | Submit authorized feeder data, support fresh quorum, participate in deviation review, and follow invalidation/stale-data runbooks. | Autonomous freeze, unfreeze, mint, burn, transfer, spending, classification, subsidy, fee, wage, budget, governance execution, or policy mutation. | Feeder registry, data source record, timestamp/freshness evidence, deviation notes, invalidation record, and liveness checks. | Missing feeder controls, stale-data procedure, or any oracle-to-policy execution path. |
| Policy reviewers | Review `Fargard7PolicyAdapter` recommendations and production policy evidence packets. | Governance review board. | Approve, reject, or expire adapter-local recommendations; record institutional review metadata and escalation notes. | Treating approval as execution, setting executable authority, calling downstream policy modules, or bypassing module-specific role gates. | Recommendation snapshot, reviewer identity, review rationale, status transition record, `executable = false` confirmation, and downstream state check. | Any autonomous policy execution, downstream mutation, or ambiguous approval-as-execution language. |
| Emergency/freeze authority | Emergency lock, trigger response, asset freeze confirmation, SWF transfer, release, and public-notice coordination. | Emergency operations lead with court/council/crawler custody registry. | Execute emergency and freeze actions only under documented authority paths; preserve incident evidence and post-incident review. | Automation replacing final human freeze authority, oracle-only freeze, undocumented release, duplicate transfer, or treasury/SWF mutation outside authorized paths. | Incident packet, authority signatures, target record, reason code, transaction hash, public notice, release evidence, and review minutes. | Unrehearsed runbook, missing release authority, incomplete evidence trail, or unclear final human authority. |
| Deployer | Deployment ceremony execution, constructor arguments, dependency wiring, and initial role assignment. | Deployment coordinator. | Deploy only approved candidate artifacts; verify constructor inputs, dependency addresses, and initial roles against the manifest. | Undocumented deployment, unreviewed constructor arguments, hidden proxy/upgrade path, unauthorized role grants, or post-deploy mutation outside runbook. | Deployment manifest, artifact hash, deployer identity, address book, constructor arguments, role assignment log, and post-deploy verification. | Missing manifest, unknown deployer, mismatched address/role state, or proxy ambiguity. |
| Auditor | External audit review of critical contract surfaces, evidence packets, authority boundaries, and production blockers. | External audit coordinator. | Review, classify findings, request remediation evidence, and sign audit disposition or accepted-risk notes. | Certifying production readiness without completed scope, ignoring open critical findings, or treating tests as formal proof. | Audit scope, finding register, severity triage, remediation links, accepted-risk record, and final audit report. | External audit not complete, unresolved critical/high findings, or missing remediation evidence. |
| Formal verification reviewer | Formal proof review for high-priority safety properties and unresolved proof-risk classification. | Formal methods owner. | Review proof targets, proof artifacts, assumptions, counterexamples, and explicit risk acceptance for unproven properties. | Claiming formal verification completion without artifacts, expanding assumptions beyond code reality, or treating informal docs as proof. | Proof artifact index, assumptions file, target-to-contract mapping, counterexample notes, reviewer signoff, and risk acceptance record. | Formal verification not complete, missing proof artifacts, or unresolved high-priority proof blocker. |

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
