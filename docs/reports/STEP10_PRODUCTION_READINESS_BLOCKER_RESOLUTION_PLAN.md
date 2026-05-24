# Step-10 Production Readiness Blocker Resolution Plan

**Checkpoint:** opened after `3b892ce docs(step9): close production governance doctrine phase`
**Runtime baseline:** `463 passing` at Step-9 closure verification
**Scope:** Production-readiness blocker resolution planning, evidence mapping, sequencing, and risk-disposition criteria
**Status:** Open as a docs-only planning phase

## 1. Purpose

Step-10 opens the production-readiness follow-up phase by converting the explicit Step-9 production blocker register into an actionable resolution plan. This phase tracks required evidence, ownership, sequencing, and acceptable blocker disposition before any production-readiness claim can be made.

This opening checkpoint is documentation-only. It does not change contracts, tests, architecture, thresholds, timeout constants, constitutional constants, Kernel assumptions, oracle authority, freeze authority, deployment authority, or `Fargard7PolicyAdapter` execution behavior.

## 2. Scope and Non-Goals

### Scope

- Carry forward `STEP9-BLOCK-001` through `STEP9-BLOCK-008`.
- Define required evidence for each blocker.
- Define resolution criteria and whether risk acceptance may be used.
- Separate audit, formal-verification, custody, runbook, dry-run, release, and non-claim evidence types.
- Establish dependency order for resolving or risk-accepting blockers.
- Preserve the Step-9 doctrine that production readiness cannot be claimed while required evidence is missing.

### Non-Goals

- No production readiness claim.
- No external audit completion claim.
- No formal verification completion claim.
- No release approval or deployment authorization.
- No contract, source, or test changes in this opening checkpoint.
- No Kernel upgradeability or governance backdoor.
- No autonomous oracle execution authority.
- No autonomous policy execution, spending, subsidy, fee, classification, wage, budget, freeze, unfreeze, mint, burn, transfer, or governance path.
- No conversion of `Fargard7PolicyAdapter` recommendations into downstream execution.

## 3. Inputs From Step-9 Blocker Register

Step-10 starts from the Step-9 production governance doctrine and its production blocker register:

- `docs/reports/STEP9_PRODUCTION_GOVERNANCE_DEPLOYMENT_DOCTRINE.md`
- `STEP9-BLOCK-001`: External audit is not complete.
- `STEP9-BLOCK-002`: Formal verification is not complete.
- `STEP9-BLOCK-003`: Role custody and key management are not production-complete.
- `STEP9-BLOCK-004`: Emergency and freeze runbooks are not complete or rehearsed.
- `STEP9-BLOCK-005`: Deployment dry-run and manifest evidence are not complete.
- `STEP9-BLOCK-006`: Release signoff is not complete.
- `STEP9-BLOCK-007`: Oracle operations runbook is not complete.
- `STEP9-BLOCK-008`: Production-readiness remains a non-claim.

These inputs remain blockers at Step-10 opening. Step-10 planning does not close them by listing them.

## 4. Blocker Resolution Register

| Blocker id | Blocker | Owner | Evidence required | Resolution criteria | Risk acceptance allowed? | Evidence type | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STEP9-BLOCK-001 | External audit is not complete. | External audit coordinator | Final audit scope, auditor report, finding register, severity triage, remediation links, accepted-risk notes, and reviewer signoff. | External audit scope is completed, every finding is fixed, deferred, or explicitly accepted, and final audit disposition is attached to the release packet. | Yes, only for documented non-critical or explicitly governed unresolved findings; unresolved critical findings remain release blockers. | Audit | Open |
| STEP9-BLOCK-002 | Formal verification is not complete. | Formal methods owner | Proof artifact index, target-to-contract mapping, assumptions file, tool output, counterexample notes, reviewer signoff, and unresolved-risk record. | High-priority proof targets are proven or unresolved obligations are classified with explicit production-blocking or risk-accepted disposition. | Yes, only through signed risk acceptance for specific unresolved proof obligations; formal verification completion must not be claimed for unproven targets. | Formal verification | Open |
| STEP9-BLOCK-003 | Role custody and key management are not production-complete. | Governance operations lead | Production signer registry, role-to-custodian map, quorum rules, key rotation procedure, onboarding/offboarding procedure, compromised-key response, and custody rehearsal notes. | Every privileged role has an accountable custodian, quorum model, rotation path, compromise response, and post-action evidence requirement. | Limited; single-person custody for critical roles, missing quorum, or unclear compromised-key response may not be accepted for release readiness. | Custody | Open |
| STEP9-BLOCK-004 | Emergency and freeze runbooks are not complete or rehearsed. | Emergency operations lead | Emergency trigger, freeze, release, oracle incident, reserve incident, public notice, and post-incident review runbooks with rehearsal evidence. | Emergency and freeze paths are human or institution-gated, rehearsed, auditable, and reversible only through documented authority paths. | Limited; unrehearsed critical emergency/freeze paths or unclear release authority remain release blockers. | Runbook / rehearsal | Open |
| STEP9-BLOCK-005 | Deployment dry-run and manifest evidence are not complete. | Deployment coordinator | Deployment manifest, contract artifact hashes, constructor arguments, dependency address book, initial role assignments, dry-run logs, gas estimates, and post-run verification. | Dry-run output matches the manifest, role and dependency state are reproducible, and post-deploy verification proves intended authority boundaries. | No for missing manifest or unverifiable dry-run state; discrepancies must be resolved before release approval. | Deployment / dry-run | Open |
| STEP9-BLOCK-006 | Release signoff is not complete. | Release council | Go/no-go minutes, signer approvals, release package hash, blocker disposition, audit/proof disposition, custody confirmation, and risk acceptance record. | Release council signs only after all blockers are closed or formally accepted under the applicable governance process. | Yes, only for blockers where this register allows risk acceptance and the required evidence exists. | Release signoff | Open |
| STEP9-BLOCK-007 | Oracle operations runbook is not complete. | Oracle operations lead | Feeder onboarding procedure, feeder suspension path, stale-data response, invalidation process, deviation review process, liveness monitoring record, and data-source attestations. | Oracle data remains signal-only, fresh quorum expectations are operationalized, and feeder/deviation/invalidation workflows are auditable. | Limited; any oracle path implying autonomous sovereign, freeze, transfer, mint, burn, spending, classification, fee, wage, budget, subsidy, loan, or provincial mutation authority is not acceptable. | Oracle operations | Open |
| STEP9-BLOCK-008 | Production-readiness remains a non-claim. | Release coordinator | Non-claims statement in roadmap, release packet, blocker register, audit/proof disposition, and handoff materials. | All Step-10 materials state that production readiness is not claimed until gates are satisfied and release approval exists. | No; the non-claim must remain until all production-readiness gates are satisfied. | Non-claim / doctrine | Open |

## 5. Sequencing and Dependency Order

Step-10 resolution should proceed in dependency order so later release evidence is not built on incomplete prerequisites.

1. Preserve non-claims first.
   - Maintain `STEP9-BLOCK-008` language in every Step-10 document and handoff.
   - Confirm no production readiness, audit completion, formal verification completion, or release approval is implied.

2. Complete evidence templates and owner assignments.
   - Assign accountable owners for audit, formal methods, custody, emergency operations, oracle operations, deployment, and release coordination.
   - Establish required evidence formats before collecting final signoff.

3. Resolve audit and proof disposition.
   - Address `STEP9-BLOCK-001` and `STEP9-BLOCK-002` before release signoff.
   - Record proof artifacts or specific risk acceptance for unresolved proof obligations.

4. Complete custody and operations runbooks.
   - Address `STEP9-BLOCK-003`, `STEP9-BLOCK-004`, and `STEP9-BLOCK-007`.
   - Rehearsal evidence should precede deployment dry-run review.

5. Prepare deployment manifest and dry-run evidence.
   - Address `STEP9-BLOCK-005` only after role custody, oracle operations, and emergency/freeze expectations are documented enough to verify post-run state.

6. Collect release signoff last.
   - Address `STEP9-BLOCK-006` only after every other blocker is closed or formally risk-accepted where allowed.
   - The release packet must include audit/proof disposition, custody evidence, runbook links, dry-run evidence, blocker status, and non-claims.

### Blocker Dependency Graph

| Blocker id | Depends on | Blocks | Dependency rationale |
| --- | --- | --- | --- |
| STEP9-BLOCK-008 | None | Every Step-10 phase and every release artifact | Non-claims must be preserved before any other evidence is collected so planning language does not imply readiness. |
| STEP9-BLOCK-001 | Audit scope, critical surface list, Step-8 evidence, Step-9 doctrine | STEP9-BLOCK-006 | Release signoff cannot proceed without external audit disposition or explicitly governed unresolved findings. |
| STEP9-BLOCK-002 | Formal target list, assumptions, harness/proof outputs, Step-8 proof candidates | STEP9-BLOCK-006 | Release signoff cannot proceed without proof disposition or explicit risk acceptance for unresolved proof obligations. |
| STEP9-BLOCK-003 | Owner assignment, role graph, signer registry, quorum model | STEP9-BLOCK-004, STEP9-BLOCK-005, STEP9-BLOCK-006 | Emergency runbooks, deployment manifests, and release signoff depend on known custodians and quorum rules. |
| STEP9-BLOCK-007 | Feeder registry, source-data expectations, stale/deviation procedures | STEP9-BLOCK-004, STEP9-BLOCK-005, STEP9-BLOCK-006 | Emergency response and deployment verification must know how oracle incidents and feeder authority are operated. |
| STEP9-BLOCK-004 | STEP9-BLOCK-003, STEP9-BLOCK-007 | STEP9-BLOCK-005, STEP9-BLOCK-006 | Deployment dry-run and release signoff need rehearsed emergency, freeze, release, oracle incident, and post-incident procedures. |
| STEP9-BLOCK-005 | STEP9-BLOCK-003, STEP9-BLOCK-004, STEP9-BLOCK-007 | STEP9-BLOCK-006 | Release signoff depends on reproducible manifest, dry-run logs, address book, role assignments, and post-run verification. |
| STEP9-BLOCK-006 | STEP9-BLOCK-001 through STEP9-BLOCK-005, STEP9-BLOCK-007, STEP9-BLOCK-008 | Production-readiness claim and deployment approval | Release signoff is the final aggregation point and cannot be completed before upstream blockers are closed or validly risk-accepted. |

### Phase Order

| Phase | Blockers addressed | Entry criteria | Exit criteria |
| --- | --- | --- | --- |
| Phase 0: Non-claim preservation | STEP9-BLOCK-008 | Step-10 document exists and Step-9 blockers are carried forward as open. | All Step-10 materials state that production readiness, audit completion, formal verification completion, and release approval are not claimed. |
| Phase 1: Evidence ownership setup | STEP9-BLOCK-001, STEP9-BLOCK-002, STEP9-BLOCK-003, STEP9-BLOCK-004, STEP9-BLOCK-005, STEP9-BLOCK-007 | Non-claims are preserved and blocker owners are identified from Step-9. | Required evidence packages, owner responsibilities, and accepted evidence formats are documented for each blocker. |
| Phase 2: Audit and proof disposition | STEP9-BLOCK-001, STEP9-BLOCK-002 | Evidence ownership setup is complete and Step-8 audit/proof targets are available for review. | Audit findings and formal proof obligations are either resolved, left open as blockers, or explicitly risk-accepted where allowed. |
| Phase 3: Custody and operations readiness | STEP9-BLOCK-003, STEP9-BLOCK-004, STEP9-BLOCK-007 | Audit/proof status is known enough to avoid conflicting operational assumptions. | Custody, emergency/freeze, and oracle operations runbooks are complete, rehearsed where required, and linked to evidence. |
| Phase 4: Deployment dry-run evidence | STEP9-BLOCK-005 | Custody and operations evidence is complete enough to verify roles, emergency paths, oracle paths, and non-execution boundaries. | Deployment manifest, dry-run logs, artifact hashes, constructor arguments, address book, role assignments, and post-run verification are complete. |
| Phase 5: Release disposition | STEP9-BLOCK-006 | All upstream blockers are closed or validly risk-accepted; non-claims remain explicit. | Release council records go/no-go minutes, release package hash, signer approvals, blocker disposition, and risk acceptance record. |

### Entry Criteria

Step-10 blocker resolution work may proceed only when:

- The repository candidate is identified and the working tree state is known.
- The full test baseline is current.
- `git diff -- contracts` and `git diff -- test` are empty unless a later implementation phase explicitly authorizes reviewed changes.
- The Step-9 blocker register is preserved without silently closing any blocker.
- Production readiness, external audit completion, formal verification completion, and release approval remain explicit non-claims.
- `Fargard7PolicyAdapter` remains proposal-only and oracle signals remain non-sovereign.

### Exit Criteria

Step-10 should not close until:

- Every `STEP9-BLOCK-*` item has a final status of closed, explicitly carried forward as a production blocker, or risk-accepted where allowed.
- External audit disposition is attached or the missing audit remains an explicit release blocker.
- Formal verification disposition is attached or unresolved proof obligations remain explicit blockers or signed accepted risks.
- Custody, emergency/freeze, oracle operations, deployment dry-run, and release-signoff evidence is linked or marked incomplete.
- Release signoff, if requested, is backed by go/no-go minutes, signer approvals, release package hash, blocker disposition, and risk acceptance record.
- Non-claims remain intact unless every production-readiness gate is satisfied by evidence.

### Blockers That Cannot Be Risk-Accepted

The following conditions cannot be risk-accepted for a production-readiness or release-approval claim:

| Blocker / condition | Reason risk acceptance is not allowed |
| --- | --- |
| STEP9-BLOCK-005 with no deployment manifest or unverifiable dry-run state | Release cannot verify constructor arguments, dependency wiring, role assignments, or authority boundaries without reproducible deployment evidence. |
| STEP9-BLOCK-008 before all gates are satisfied | Production readiness must remain a non-claim until evidence supports every required gate. |
| Any hidden Kernel upgradeability, proxy ambiguity, or governance backdoor | This violates the constitutional immutability doctrine rather than creating an acceptable operational risk. |
| Any autonomous oracle authority over freeze, unfreeze, mint, burn, transfer, governance execution, budget mutation, fee application, wage changes, production classification, subsidy, loan, or provincial balance mutation | This violates oracle-as-signal-only doctrine and cannot be accepted as a production-readiness risk. |
| Any `Fargard7PolicyAdapter` downstream execution or policy mutation path | This violates the adapter proposal-only boundary and requires separate design, implementation, review, and tests before any future claim. |
| Missing release council go/no-go record for release approval | Release approval cannot exist without the explicit approving record. |

### Blockers Requiring External Evidence

Some blockers cannot be closed by repository documentation alone.

| Blocker id | External evidence required | Why repository docs are insufficient |
| --- | --- | --- |
| STEP9-BLOCK-001 | External auditor report, finding register, severity triage, remediation disposition, accepted-risk notes, and auditor or coordinator signoff. | Audit completion requires independent review evidence outside the local doctrine package. |
| STEP9-BLOCK-002 | Formal tool output, proof artifact index, assumptions file, counterexample notes, and formal reviewer signoff. | Formal verification requires proof artifacts or explicit proof-risk disposition, not only planned targets. |
| STEP9-BLOCK-003 | Signer registry, custodian attestations, quorum records, key-rotation records, and compromised-key procedure approval. | Production custody depends on appointed operators and key-management evidence outside code and docs. |
| STEP9-BLOCK-004 | Rehearsal notes, incident packet templates, authority signature examples, escalation contacts, and post-incident review records. | Emergency readiness requires operational rehearsal and evidence trail validation. |
| STEP9-BLOCK-005 | Dry-run logs, deployed test addresses, artifact hashes, gas estimates, address book, and post-run verification output. | Deployment readiness requires executable dry-run evidence and manifest/state matching. |
| STEP9-BLOCK-006 | Release council minutes, signer approvals, release package hash, blocker disposition, and risk acceptance record. | Release signoff requires governance approval evidence, not local planning text. |
| STEP9-BLOCK-007 | Feeder registry, data-source attestations, liveness monitoring records, invalidation records, and deviation review notes. | Oracle operations readiness depends on real operators, data sources, and monitoring evidence. |

## 6. Risk Acceptance Rules

Risk acceptance is a blocker disposition mechanism, not a production-readiness shortcut.

- Risk acceptance must identify the unresolved item, owner, rationale, severity, compensating controls, expiration or review trigger, and approving governance body.
- Risk acceptance must not be used to claim external audit completion if the audit is incomplete.
- Risk acceptance must not be used to claim formal verification completion for unproven targets.
- Risk acceptance must not authorize hidden upgradeability, autonomous oracle authority, autonomous policy execution, or bypass of final human or institutional freeze authority.
- Risk acceptance must not replace deployment manifest evidence, dry-run verification, or release council go/no-go approval.

## 7. Non-Claims

This Step-10 opening checkpoint does not claim:

- Production readiness.
- External audit completion.
- Formal verification completion.
- Release approval.
- Production deployment authorization.
- Runtime certification.
- Closure of Step-8 proof and audit-review items.
- Closure of Step-9 production blockers.
- Autonomous policy execution.
- Sovereign oracle authority.

`Fargard7PolicyAdapter` remains proposal-only and non-executing. Recommendation creation, approval, rejection, and expiration remain adapter-local review metadata and must not mutate downstream policy modules.

Oracle signals remain non-sovereign. Oracle data may inform review, but must not autonomously freeze, unfreeze, mint, burn, transfer, spend, classify, subsidize, apply fees, change wages, alter budgets, approve loans, mutate provincial balances, or execute governance.

## 8. Opening Status

Step-10 is open as a docs-only production-readiness blocker resolution planning phase.

At opening:

- `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open.
- Production readiness is not claimed.
- External audit is not complete.
- Formal verification is not complete.
- Release approval is not granted or implied.
- No contract or test changes are introduced.
