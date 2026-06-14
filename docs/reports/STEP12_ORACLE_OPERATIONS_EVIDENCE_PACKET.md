# Step-12 Oracle Operations Evidence Packet

**Blockers:** `STEP9-BLOCK-004` oracle operations packet; `STEP9-BLOCK-007` oracle operations runbook
**GitHub issues:** `STEP9-BLOCK-004` https://github.com/fafa33/Iran-OS/issues/15; `STEP9-BLOCK-007` https://github.com/fafa33/Iran-OS/issues/16
**Status:** Draft evidence acquisition packet
**Evidence state:** Draft; not accepted evidence
**Reviewer/signoff state:** Not reviewer signoff
**Disposition:** No blocker closure; `STEP9-BLOCK-004` and `STEP9-BLOCK-007` remain pending/open

## 1. Purpose

This packet starts evidence acquisition for the Step-12 oracle operations blockers. It records repository-supported oracle, feeder, freshness, invalidation, deviation, liveness, governance, and non-execution facts, then separates those facts from missing production operations evidence.

This document does not mark evidence as accepted, does not provide reviewer signoff, does not close `STEP9-BLOCK-004`, does not close `STEP9-BLOCK-007`, does not close any other blocker, does not claim production readiness, does not claim release approval, does not claim completed external audit, and does not claim completed formal verification.

`Fargard7PolicyAdapter` remains proposal-only/non-executing. Oracle signals remain non-sovereign and cannot autonomously freeze, unfreeze, mint, burn, transfer, spend, classify, subsidize, apply fees, change wages, alter budgets, approve loans, mutate provincial balances, or execute governance.

## 2. Source Material Reviewed

Repository-supported inputs used for this draft:

- `docs/STEP3_RUNTIME_HARDENING_MATRIX.md`
- `docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`
- `docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`
- `docs/STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md`
- `docs/reports/STEP7_STRESS_TESTING_REPORT.md`
- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `docs/reports/STEP10_PRODUCTION_READINESS_BLOCKER_RESOLUTION_PLAN.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`
- `contracts/oracles/PriceOracle.sol`
- `contracts/oracles/API3Oracle.sol`
- `contracts/oracles/ProductionOracle.sol`
- `contracts/governance/Fargard7PolicyAdapter.sol`
- `test/23_Price_Oracle.test.js`
- `test/25_Step7_Stress.test.js`
- GitHub issue tracker entries: https://github.com/fafa33/Iran-OS/issues/15 and https://github.com/fafa33/Iran-OS/issues/16
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` (feeder role-wiring references, Group E/F)
- `docs/oracle/AIRNODE_INTEGRATION_PROTOCOL.md` (integration model reference)
- `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md` (aggregation/quorum policy reference)
- `docs/Doctrine/INTERPRETATION_BOUNDARIES_FA.md` (oracle = signal, not sovereignty)

## 3. STEP9-BLOCK-004 Oracle Operations Packet

### 3.1 Feeder Registry

Repository-supported facts:

- `PriceOracle` uses `FEEDER_ROLE` for price submissions and stores per-key feeder submissions in `submissions`.
- `PriceOracle` stores the per-key feeder address list in `dataFeeders`.
- `API3Oracle` uses `FEEDER_ROLE` for data updates and violation flag reports.
- Step-9 requires a production feeder registry before production readiness can be claimed.

Production evidence status:

- Pending; no production feeder registry is provided.
- Pending; no feeder operator identities, custody owners, source ownership records, or operational approvals are provided.
- Pending; no reviewer acceptance or oracle operations lead signoff is recorded.

This draft does not invent feeder identities, feeder addresses, operator names, or approvals.

### 3.2 Quorum Configuration

Repository-supported facts:

- `PriceOracle.MIN_FEEDERS` is `3`.
- `PriceOracle` aggregates prices only when at least three fresh counted feeder submissions exist for the key.
- Step-7 stress tests exercise fresh quorum recovery and stale quorum isolation.

Production evidence status:

- Code-level quorum constant is recorded as repository-supported context only.
- Pending; no production feeder set, quorum operation policy, quorum degradation procedure, or emergency replacement procedure is provided.
- Pending; no evidence maps the production feeder registry to the three-feeder quorum requirement.

This draft does not invent production quorum participants or operational quorum approvals.

### 3.3 Freshness and Staleness Configuration

Repository-supported facts:

- `PriceOracle.STALENESS_THRESHOLD` is `1 hours`.
- `PriceOracle.isDataFresh` returns true only when the price is valid and the timestamp is within the staleness threshold.
- Existing tests cover stale freshness checks, stale submission neutrality, and recovery after fresh quorum returns.

Production evidence status:

- Code-level staleness threshold is recorded as repository-supported context only.
- Pending; no production stale-data response procedure is provided.
- Pending; no operator playbook identifies who responds to stale feeds, how stale data is escalated, or how stale sources are restored or suspended.

### 3.4 Deviation Handling

Repository-supported facts:

- `PriceOracle.DEVIATION_THRESHOLD` is `50`.
- `PriceOracle.submitPrice` emits `DeviationDetected` when submitted value deviation exceeds the threshold compared with an existing valid value.
- Existing tests cover severe outlier behavior and resumed quorum mean after correction.

Production evidence status:

- Code-level deviation event behavior is recorded as repository-supported context only.
- Pending; no production deviation review procedure is provided.
- Pending; no operator record defines severity classification, reviewer routing, incident packet contents, or required post-incident disposition.

### 3.5 Incident Runbook

Repository-supported facts:

- Step-9 requires oracle incident, stale-data, invalidation, deviation, liveness, and feeder suspension runbooks before production readiness can be claimed.
- Step-9 prohibits treating oracle values as direct freeze, budget, fee, wage, subsidy, mint, burn, transfer, or governance authority.
- Step-5 states oracle and API3 signals are evidence-only and do not create sovereign authority by themselves.

Production evidence status:

- Pending; no production oracle incident runbook is provided.
- Pending; no escalation contact list, incident severity model, on-call roster, post-incident review template, or rehearsal evidence is provided.
- Pending; no reviewer signoff is recorded.

### 3.6 Monitoring Evidence

Repository-supported facts:

- Existing tests provide local runtime evidence for stale state preservation, fresh quorum recovery, invalidation role gating, and deviation signaling.
- Step-9 requires liveness monitoring records before oracle operations readiness can be claimed.

Production evidence status:

- Pending; no production monitoring system, dashboard, alert rule, liveness log, alert history, or monitoring owner is provided.
- Pending; no monitoring evidence links production feeder keys, data sources, freshness, deviation, invalidation, and suspension state.

### 3.7 Required Reviewer and Signoff

Required signoff for `STEP9-BLOCK-004` remains pending:

- Oracle operations lead.
- Governance reviewer.

This packet is not a signoff and cannot support blocker closure by itself.

### 3.8 Remaining Gaps

`STEP9-BLOCK-004` remains pending/open because the following accepted evidence is not present:

- Production feeder registry.
- Production quorum configuration and quorum operation policy.
- Freshness and staleness operation procedure.
- Deviation handling procedure.
- Oracle incident runbook.
- Monitoring evidence.
- Oracle operations lead signoff.
- Governance reviewer signoff.

## 3A. Repository-Derived Draft Procedures (STEP9-BLOCK-004)

These draft procedures are derived solely from repository source — contract constants and behavior — and from the procedures already drafted in §4A. They are draft documentary scaffolding only. Every operator identity, runtime telemetry record, and reviewer signoff remains PENDING per §3A.3. This section accepts no evidence and closes no blocker.

### 3A.1 Deviation Review Procedure (derived)

Repository-derived basis:

- `PriceOracle.DEVIATION_THRESHOLD` is `50`.
- `PriceOracle.submitPrice` emits `DeviationDetected` when a submitted value's deviation exceeds the threshold against an existing valid value.

Derived draft steps: (1) a `DeviationDetected` event is the detection signal; (2) the deviating submission is reviewed against other fresh feeder submissions for the same key; (3) a deviating value does not by itself become fresh authority (consistent with the signal-only boundary, §4A.4); (4) correction follows the stale-data / invalidation path (§4A.1) where the value is invalid; (5) the review outcome is the recorded artifact.

Not claimed: any deployed deviation value, production reviewer routing, or severity assignment.

PENDING: severity classification, reviewer routing/identity, incident-packet contents, and post-incident disposition — real operators.

### 3A.2 Incident Runbook Skeleton (scaffold)

Documentation scaffold only — it cross-links the derived procedures and marks every operator/runtime element as pending:

- **Detection inputs (derived):** staleness/invalidation (§4A.1), deviation (§3A.1), feeder onboarding/suspension state (§4A.2).
- **Containment (derived):** stale or deviating data is non-counted; invalidation is a `KERNEL_ROLE` action (§4A.1); a suspect feeder is suspended via `FEEDER_ROLE` revoke (§4A.2).
- **Boundary (cited):** oracle signals remain non-sovereign; no autonomous downstream execution (§4A.4).
- **Severity model:** **PENDING operators**.
- **On-call roster / escalation contacts:** **PENDING operators**.
- **Incident rehearsal evidence:** **PENDING operators**.
- **Monitoring telemetry / liveness logs:** **PENDING runtime telemetry**.
- **Post-incident review + reviewer signoff:** **PENDING**.

This skeleton adds derived documentary scaffolding only. It makes no monitoring or deployed-configuration claim, invents no operator or feeder identities, accepts no evidence, and does not close any blocker.

### 3A.3 Pending markers (operator / runtime)

- feeder identities: **PENDING real operators**
- deployed quorum configuration: **PENDING real operators**
- severity model: **PENDING operators**
- on-call roster: **PENDING operators**
- incident rehearsal evidence: **PENDING operators**
- monitoring telemetry: **PENDING runtime telemetry**
- oracle operations lead / governance reviewer signoff: **PENDING**

`STEP9-BLOCK-004` remains **OPEN / PARTIALLY DOCUMENTED / PENDING OPERATORS**.

## 4. STEP9-BLOCK-007 Oracle Operations Runbook

### 4.1 Feeder and Data-Source Attestations

Repository-supported facts:

- `PriceOracle` and `API3Oracle` both use feeder roles for data submission surfaces.
- `API3Oracle.getDataWithConfidence` exposes value, timestamp, validity, confidence, and feeder for a data point.
- Step-9 requires feeder registry and data-source attestations for oracle operations readiness.

Production evidence status:

- Pending; no production feeder/data-source attestation packet is provided.
- Pending; no data-source owner, methodology, source-change control, or confidence attestation is provided.
- Pending; no production feeder operator identities or custody attestations are provided.

This draft does not invent feeder identities, data sources, oracle addresses, or attestations.

### 4.2 Onboarding Procedure

Repository-supported facts:

- Feeder authority is role-gated through `FEEDER_ROLE`.
- Step-9 requires feeder onboarding controls and evidence before production readiness can be claimed.

Production evidence status:

- Pending; no production feeder onboarding procedure is provided.
- Pending; no required onboarding checklist, approval authority, source attestation, key custody check, dry-run step, or post-onboarding verification record is provided.

### 4.3 Suspension Procedure

Repository-supported facts:

- Step-9 requires feeder suspension procedures and identifies missing feeder suspension/rotation procedure as a blocker.
- Step-5 states stale, invalid, unauthorized, repeated, low-confidence, rejected, failed, replayed, or completed oracle/API3 records must not become fresh authority.

Production evidence status:

- Pending; no production feeder suspension procedure is provided.
- Pending; no suspension trigger list, authority path, communication process, replacement process, or post-suspension verification evidence is provided.

### 4.4 Stale-Data and Invalidation Procedures

Repository-supported facts:

- `PriceOracle.isDataFresh` exposes freshness checks.
- `PriceOracle.invalidatePrice` is role-gated to `KERNEL_ROLE` and emits `PriceInvalidated`.
- Existing tests cover stale freshness checks and invalidation role gating.

Production evidence status:

- Pending; no production stale-data response procedure is provided.
- Pending; no production invalidation procedure, authority checklist, evidence packet, escalation path, or post-invalidation review record is provided.

### 4.5 Deviation Review

Repository-supported facts:

- `PriceOracle` emits `DeviationDetected` when submitted value deviation exceeds `DEVIATION_THRESHOLD`.
- Step-9 requires deviation review procedure and deviation review notes for oracle operations readiness.

Production evidence status:

- Pending; no production deviation review runbook is provided.
- Pending; no reviewer routing, severity model, source comparison procedure, correction workflow, or review note template is provided.

### 4.6 Liveness Monitoring

Repository-supported facts:

- Step-7 stress tests exercise feeder liveness loss and recovery in local tests.
- Step-9 requires liveness monitoring evidence for oracle operations readiness.

Production evidence status:

- Pending; no production liveness monitoring system, alert threshold, alert history, operator response log, or monitoring owner is provided.
- Pending; no evidence connects production monitoring to feeder registry, source attestations, stale-data response, and suspension procedure.

### 4.7 Signal-Only Governance Review

Repository-supported facts:

- Step-5 states oracle and API3 signals are evidence-only and must not autonomously mint, burn, classify, reclassify, freeze, unfreeze, unlock, reclaim, transfer, withdraw, release, or execute treasury actions.
- Step-9 states oracle data remains signal input only and must not autonomously mutate downstream policy state.
- `Fargard7PolicyAdapter` stores recommendations with `executable: false`.
- Existing Step-7 policy tests verify adapter recommendation and review paths remain non-executing.

Production evidence status:

- Repository doctrine and local test evidence support the signal-only boundary as a draft evidence input.
- Pending; no governance reviewer signoff is recorded.
- Pending; no production release packet or oracle operations review confirms the signal-only boundary for the deployment candidate.

### 4.8 Required Reviewer and Signoff

Required signoff for `STEP9-BLOCK-007` remains pending:

- Oracle operations lead.
- Governance reviewer.

This packet is not a signoff and cannot support blocker closure by itself.

### 4.9 Remaining Gaps

`STEP9-BLOCK-007` remains pending/open because the following accepted evidence is not present:

- Feeder and data-source attestations.
- Feeder onboarding procedure.
- Feeder suspension procedure.
- Stale-data and invalidation procedures.
- Deviation review procedure.
- Liveness monitoring evidence.
- Signal-only governance review.
- Oracle operations lead signoff.
- Governance reviewer signoff.

## 4A. Repository-Derived Draft Runbook Procedures (STEP9-BLOCK-007)

These draft procedures are derived solely from repository source — contract constants and behavior, deployment-manifest role-wiring references, the oracle aggregation mini-spec, and oracle doctrine. They are draft documentary scaffolding only. Every operator identity, runtime telemetry record, and reviewer signoff remains PENDING per §4A.5. This section accepts no evidence and closes no blocker.

### 4A.1 Stale-data / invalidation procedure (derived)

Repository-derived basis:

- `API3Oracle.MAX_DATA_AGE` is `1 hours`; `flagViolation` reverts on a stale `PAH_USD_KEY` feed beyond `MAX_DATA_AGE` (`"API3Oracle: stale data feed"`).
- `API3Oracle` data points carry `isValid` and `confidence` fields.
- `PriceOracle.STALENESS_THRESHOLD` is `1 hours`; `isDataFresh` returns true only when the value is valid and within the threshold.
- `PriceOracle.invalidatePrice` is `KERNEL_ROLE`-gated and emits `PriceInvalidated`.

Derived draft steps: (1) detect staleness via the freshness check; (2) treat stale data as non-counted (no fresh authority); (3) invalidation is a `KERNEL_ROLE` action only; (4) the invalidation event is the recorded artifact.

PENDING: who monitors/triggers staleness, escalation roster, and post-invalidation review — real operators / runtime telemetry.

### 4A.2 Feeder onboarding / suspension procedure (derived)

Repository-derived basis:

- Feeder authority is `FEEDER_ROLE`-gated in `API3Oracle` and `PriceOracle`; admin/grant authority sits with `KERNEL_ROLE` / `DEFAULT_ADMIN_ROLE` (granted to Kernel in the constructor).
- Deployment-manifest role-wiring (Group E) grants `FEEDER_ROLE` (`api3Oracle.grantRole(FEEDER_ROLE, FEEDER_n)`), and feeder/ORACLE_ROLE wiring is the last deploy step.

Derived draft steps: onboarding = grant `FEEDER_ROLE` after off-chain attestation; suspension = revoke `FEEDER_ROLE`; both exercised through the manifest's role-wiring authority.

PENDING: feeder identities, data-source attestations, approval authority, and key-custody checks — real operators.

### 4A.3 Aggregation / quorum policy reference (cited)

- Cite `docs/step13/WHITEPAPER_STEP13_ORACLE_AGGREGATION_MINI_SPEC_FA.md` for the independent-feeder minimum and refresh-window policy.
- Cite `PriceOracle.MIN_FEEDERS` (`3`) aggregation requirement as code-level context only.
- Cite `docs/oracle/AIRNODE_INTEGRATION_PROTOCOL.md` for the integration model.

Not claimed: any deployed/as-deployed quorum configuration or production feeder count — PENDING real operators.

### 4A.4 Signal-only governance review (cited)

- Oracle doctrine: oracle is signal, not sovereignty (`docs/Doctrine/INTERPRETATION_BOUNDARIES_FA.md`); Step-5 and Step-9 affirm the signal-only boundary.
- `Fargard7PolicyAdapter` stores recommendations with `executable: false` (proposal-only / non-executing).

Derived statement: oracle outputs feed signals only; no autonomous downstream execution path is created.

PENDING: governance reviewer signoff and a deployment-candidate confirmation of the signal-only boundary.

### 4A.5 Pending markers (operator / runtime)

- feeder identities: **PENDING real operators**
- data-source attestations: **PENDING real operators**
- liveness monitoring: **PENDING runtime telemetry**
- incident rehearsal evidence: **PENDING operators**
- governance reviewer signoff: **PENDING**

This section adds derived documentary scaffolding only. It makes no monitoring or deployed-configuration claim, invents no operator identities, accepts no evidence, and does not close any blocker. `STEP9-BLOCK-007` remains **OPEN / PENDING**.

## 5. Closure Rule

`STEP9-BLOCK-004` and `STEP9-BLOCK-007` can be considered for closure only after the submitted oracle operations and oracle runbook packets are reviewed and accepted with the required evidence and required reviewer/signoff.

This draft does not close `STEP9-BLOCK-004`, does not close `STEP9-BLOCK-007`, and does not close any other blocker.

## 6. Current Non-Claims

- IranOS is not production ready.
- External audit is not complete.
- Formal verification is not complete.
- Release is not approved.
- No `STEP9-BLOCK-*` item is closed.
- No accepted evidence is claimed.
- `STEP9-BLOCK-004` remains pending/open.
- `STEP9-BLOCK-007` remains pending/open.
- Step 12 remains open.
- `Fargard7PolicyAdapter` remains proposal-only and non-executing.
- Oracle signals remain non-sovereign.
