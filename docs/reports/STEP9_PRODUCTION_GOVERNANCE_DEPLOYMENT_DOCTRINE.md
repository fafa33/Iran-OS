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

### Emergency Trigger Matrix

| Trigger class | Initial signal | Authorized path | Required evidence before action | Allowed response | Prohibited response | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Constitutional violation | Kernel violation report, court-signature evidence, or bridged API3 feeder report. | `IranOS_Kernel` violation path and `TriggerProtocol` terminal execution only after required signatures. | Violation code, offender address, source report, signer identities, signature count, timestamp, and transaction hashes. | Emergency lock, terminal trigger execution, treasury access blocking, signature revocation, and public notice through documented paths. | Oracle-only emergency activation, replayed trigger execution, threshold bypass, or trigger-code mutation. | Doctrine target; rehearsal pending. |
| Asset recovery/freeze | Crawler target identification, node confirmation, council review, or Kernel release request. | `SovereignCrawler`, `AssetFreeze`, SWF reclaim path, and Kernel release path. | Target ID, asset description, valuation, source graph, confirmation count, council/Kernal authorization, legal rationale, and transfer/release record. | Freeze, confirmation, SWF transfer, or release through explicit contract roles. | Autonomous freeze, duplicate transfer, undocumented release, or oracle-only asset seizure. | Doctrine target; runbook pending. |
| Oracle integrity incident | Stale quorum, feeder liveness loss, severe deviation, invalid submission, or compromised feeder suspicion. | Oracle operations runbook, feeder suspension, invalidation review, and governance escalation. | Affected feed key, feeder list, submitted values, timestamps, freshness state, deviation notes, and invalidation decision. | Suspend feeder, invalidate price, request fresh quorum, or escalate to reviewers. | Treating oracle values as direct freeze, budget, fee, wage, subsidy, mint, burn, or transfer authority. | Doctrine target; operations procedure pending. |
| Budget or reserve emergency | Overspend attempt, locked-sector issue, withdrawal anomaly, reclaimed-asset anomaly, or reserve mismatch. | Budget/government/auditor/Kernel/SWF role paths according to affected module. | Sector or layer state, proposed action, authorization record, balance deltas, signer quorum, and failed-call neutrality review. | Budget lock, rejected spend, SWF review, or accounting hold through existing roles. | Autonomous fund movement, reserve-backed mint bypass, hidden withdrawal, or role escalation. | Doctrine target; proof/audit review pending. |
| Adapter recommendation stress | Severe Fargard 7 signal recommendation or reviewer escalation. | `Fargard7PolicyAdapter` local review lifecycle only. | Fresh `GLOBAL_CPI`, `USD_GOLD`, and `GAS_USD` snapshots, recommendation ID, reviewer identity, review status, and downstream state check. | Create, approve, reject, or expire non-executing recommendation metadata. | Treating approval as execution, setting executable policy authority, or mutating downstream modules. | Required non-execution boundary. |

### Freeze Authority Limits

- Freeze authority is limited to implemented contract roles and documented institutional paths.
- Freeze initiation must identify the legal or constitutional reason, target, evidence source, approving authority, and expected review path.
- Freeze confirmation must satisfy the implemented confirmation threshold before SWF transfer.
- SWF transfer is not a general confiscation mechanism; it requires the implemented confirmed-freeze path and reclaim authority.
- Unfreeze or release authority must be documented before action and must preserve an evidence trail equal to or stronger than freeze initiation.
- Freeze authority must not be expanded through oracle feeds, adapter approvals, automation scripts, deployment operators, or emergency messaging.

### Escalation Path

1. Signal intake: collect oracle, crawler, court, council, auditor, or governance evidence without mutating protected state.
2. Triage: classify the incident as constitutional, asset-freeze, oracle-integrity, budget/reserve, or adapter-review stress.
3. Authority check: identify the exact contract role, signer quorum, and runbook required for the next action.
4. Evidence lock: snapshot pre-action state, supporting documents, feeder data, signer identities, and timestamps.
5. Human or institution approval: obtain the required signatures or role-holder approval before executing any freeze, release, trigger, transfer, lock, or invalidation.
6. Execution: perform only the approved action through the documented contract path.
7. Verification: record post-action state, emitted events, transaction hashes, and whether any follow-up is required.
8. Review: route the incident packet to post-incident review.

### Evidence Required Before Freeze or Unfreeze

| Action | Required evidence | Minimum pass condition | Blocker |
| --- | --- | --- | --- |
| Freeze initiation | Target identifier, asset details, valuation, source graph or report, initiating role, reason code, and timestamp. | The target is specific, evidence-backed, nonzero-value where applicable, and initiated by an authorized role. | Anonymous target, missing valuation, missing authority, or unsupported reason. |
| Freeze confirmation | Confirmation signer identities, confirmation count, freeze record, prior signatures, and target state. | Required confirmation threshold is reached without duplicate signer assumptions. | Duplicate confirmation, insufficient confirmations, or stale/ambiguous freeze record. |
| Transfer to SWF | Confirmed freeze status, council authority, reclaim authority, SWF address, transfer amount, and pre-transfer accounting snapshot. | Transfer is authorized, non-duplicate, and accounting deltas match expected state. | Missing reclaim role, duplicate transfer, amount mismatch, or failed accounting verification. |
| Release/unfreeze | Kernel or release authority record, original freeze packet, release rationale, affected target state, and post-release verification plan. | Release is authorized, traceable to the original freeze, and does not hide prior evidence. | Missing release authority, missing original packet, or unclear post-release state. |

### Prohibited Autonomous Freeze Paths

- Oracle feeder submissions directly freezing, unfreezing, transferring, minting, burning, spending, classifying, subsidizing, applying fees, changing wages, altering budgets, or executing governance.
- `Fargard7PolicyAdapter` recommendation creation, approval, rejection, or expiration causing downstream policy mutation.
- Automation scripts replacing final human or institution-gated freeze authority.
- Emergency notifications or monitoring alerts executing freeze or release actions.
- Deployment operators granting themselves freeze, Kernel, SWF, or oracle powers outside the deployment manifest.
- Any hidden proxy, upgrade hook, fallback, or off-chain service that can bypass the documented role path.

### Post-Incident Review Requirements

- Reconstruct the full timeline from signal intake through execution and verification.
- Confirm every signer, role holder, and caller matched the applicable runbook.
- Compare pre-action and post-action state for Kernel, TriggerProtocol, AssetFreeze, SWF, Treasury, oracle, budget, and adapter surfaces as applicable.
- Record emitted events, transaction hashes, failed calls, and state-neutral reverts.
- Identify whether the incident exposes an audit gap, formal verification target, runbook defect, custody issue, or missing test.
- Preserve any release/unfreeze rationale alongside the original freeze packet.
- Produce a finding disposition: no issue, documentation update, test addition, implementation review, external-audit referral, or formal-verification referral.
- Do not use post-incident review to claim production readiness, external audit completion, or formal verification completion unless the required evidence exists.

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

### Role Custody Table

| Role group | Custody model | Minimum controls | Required evidence | Rotation trigger | Blocker |
| --- | --- | --- | --- | --- | --- |
| Kernel sovereign/admin | Multi-person constitutional custody with named primary and backup signers. | No single-person custody; documented signer quorum; hardware-backed keys; role graph review before any privileged action. | Signer registry, role assignment transaction, custody attestation, key ceremony notes, and privileged-action log. | Signer departure, suspected compromise, governance change, failed access review, or scheduled rotation. | Unknown sovereign custodian, single-person control, or missing role graph. |
| Court and emergency signers | Multi-signer institutional custody aligned to emergency and trigger runbooks. | Threshold coordination procedure; emergency contact registry; action-specific evidence packet before signing. | Court signer list, emergency call record, violation packet, signature log, and post-action verification. | Court membership change, incident review finding, lost key, or emergency rehearsal failure. | Missing signer threshold, missing emergency escalation path, or unrehearsed signing process. |
| SWF council/minter authority | Multi-sig council custody for withdrawals, reclaimed assets, mint, and burn paths. | Quorum evidence; pre/post accounting snapshot; reserve check; no unilateral mint/burn authority. | Council registry, withdrawal or mint/burn proposal, signature record, reserve evidence, and accounting delta. | Council change, monetary audit finding, reserve mismatch, or compromised signer. | Single signer can move funds or mint/burn, or reserve evidence is missing. |
| Oracle feeders | Individually accountable feeder keys under oracle operations custody. | Feeder onboarding review; source-data record; suspension path; liveness monitoring; stale-data and invalidation procedure. | Feeder registry, data source attestation, submission timestamps, liveness logs, and suspension/invalidation records. | Feeder compromise, stale behavior, deviation incident, source change, or operator departure. | Unknown feeder operator, missing source evidence, or no suspension path. |
| Policy reviewers | Governance review board custody for adapter-local recommendation review. | Reviewer identity check; no execution authority; status-transition evidence; downstream state check. | Reviewer registry, recommendation snapshot, review rationale, status transaction, and `executable = false` confirmation. | Reviewer change, conflict of interest, adapter audit finding, or compromised reviewer key. | Reviewer approval can execute policy or mutate downstream modules. |
| Deployment signer | Deployment ceremony custody controlled by release council. | Approved manifest; artifact hash; constructor review; no hidden proxy or upgrade authority; post-deploy verification. | Deployment manifest, deployer identity, artifact hash, constructor arguments, address book, and role assignment log. | Release candidate change, deployer change, failed verification, or compromised deployment key. | Unknown deployer, missing manifest, or unverifiable role assignment. |
| Auditor and formal verification reviewers | Independent reviewer custody for audit/proof disposition, not runtime authority. | Separation from deployment execution; signed findings/proof disposition; risk acceptance record for unresolved items. | Audit report, finding register, proof artifact index, assumptions file, reviewer signoff, and risk record. | Reviewer replacement, scope change, unresolved critical finding, or proof assumption change. | Audit or proof completion is claimed without artifacts. |

### Key Rotation Rules

- Every production role must have a documented rotation interval before production readiness can be claimed.
- Rotation must be performed through the same or stronger authority path as the original role assignment.
- Rotation must include pre-rotation state snapshot, outgoing signer identity, incoming signer identity, authorization record, transaction hash, and post-rotation verification.
- Emergency rotation may occur only under a compromised-key runbook and must preserve a later review packet.
- Rotation must not change constitutional constants, threshold constants, timeout constants, trigger codes, Kernel assumptions, oracle authority, or freeze authority.
- Rotation records must distinguish routine rotation, personnel change, suspected compromise, confirmed compromise, and governance restructuring.

### Signer Onboarding and Offboarding

Onboarding requirements:

- Verify institutional authority for the role.
- Record signer identity, role scope, allowed actions, prohibited actions, backup contact, and escalation path.
- Confirm the signer understands non-execution boundaries, especially oracle signal limits and `Fargard7PolicyAdapter` proposal-only behavior.
- Execute a test or dry-run ceremony where safe and document the result.
- Add the signer only through the approved role assignment path and verify emitted events or role state.

Offboarding requirements:

- Revoke or replace role access before the signer loses operational accountability.
- Confirm no pending transactions, recommendations, freeze actions, withdrawal proposals, or emergency signatures depend on the outgoing signer.
- Record the reason, authorization, transaction hash, and post-offboarding role state.
- Escalate immediately if offboarding is caused by compromise, legal conflict, or failed custody review.

### Lost or Compromised Key Response

| Scenario | Immediate action | Required evidence | Recovery path | Blocker |
| --- | --- | --- | --- | --- |
| Lost key, no compromise suspected | Suspend signer participation and initiate replacement review. | Signer report, last known valid action, affected role, and pending-action inventory. | Rotate signer through approved authority path and verify quorum remains available. | Quorum unavailable or replacement authority unclear. |
| Suspected compromised key | Freeze signer authority where possible and escalate to emergency custody review. | Suspicion source, affected role, recent transactions, mempool/pending actions, and incident timestamp. | Rotate key, review recent actions, and record accepted/rejected incident findings. | Key can still execute privileged actions without quorum review. |
| Confirmed compromised key | Treat as security incident and activate emergency role replacement. | Confirming evidence, affected state, transaction history, role exposure map, and reviewer signoff. | Revoke/replace signer, invalidate affected operational assumptions, and refer to audit/formal review if needed. | Compromise affects Kernel, SWF, freeze, oracle, or deployer authority without containment. |
| Lost quorum | Halt affected authority path until governance restores quorum. | Signer availability record, quorum calculation, affected actions, and risk assessment. | Governance-authorized replacement ceremony and post-restore verification. | Any attempt to bypass quorum or lower threshold without explicit governed authority. |

### Multisig and Evidence Requirements

- Multi-party roles must maintain signer registry, quorum rule, signer availability status, and action-specific signature logs.
- Every multi-sig action must include a proposal identifier, signer identities, signature timestamps, execution transaction hash, emitted events, and post-action state diff.
- Quorum evidence must be retained for SWF withdrawals, emergency/court actions, freeze confirmations, deployment approvals, and release signoff.
- Failed or rejected multi-sig attempts must be recorded when they reveal custody, quorum, or authority ambiguity.
- Multi-sig evidence is operational evidence only; it does not replace external audit or formal verification.

### Prohibited Single-Person Custody

- No single person may independently control Kernel sovereign/admin authority.
- No single person may independently mint, burn, withdraw SWF assets, confirm freeze transfer, or approve production release.
- No oracle feeder may become autonomous policy authority through custody design.
- No deployer may grant themselves post-deployment runtime powers outside the deployment manifest.
- No policy reviewer may convert recommendation approval into execution authority.
- No emergency operator may replace final human or institution-gated freeze authority with automation.

### Pre-Deployment Custody Blockers

- Role-to-custodian map is missing or incomplete.
- Any critical role has single-person custody.
- Signer onboarding/offboarding procedure is not documented.
- Lost or compromised key response is not documented.
- SWF, Kernel, emergency, freeze, deployment, or release signoff quorum is unavailable or untested.
- Oracle feeder suspension and rotation procedure is missing.
- Custody records do not preserve required evidence.
- Custody design implies production readiness before audit and formal verification prerequisites are resolved.

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
