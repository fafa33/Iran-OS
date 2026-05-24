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

## 6. Evidence Acceptance Criteria

Evidence must be specific, attributable, current, and tied to the exact blocker it is intended to resolve. Planning text, informal assurances, and test output alone are not enough to close production-readiness blockers that require external or operational evidence.

### Evidence Acceptance Matrix

| Evidence type | Applies to | Acceptable evidence | Insufficient evidence | Required reviewer/signoff | Expiry or staleness rule |
| --- | --- | --- | --- | --- | --- |
| Audit | STEP9-BLOCK-001 | Final audit report, scope statement, finding register, severity triage, remediation links, accepted-risk notes, and auditor or audit coordinator signoff. | Internal checklist, planned audit scope, unresolved draft notes, or tests presented as audit completion. | External audit coordinator and auditor or authorized audit reviewer. | Stale if candidate commit, contract surface, authority model, or critical dependency changes after report issuance. |
| Formal verification | STEP9-BLOCK-002 | Proof artifact index, tool output, assumptions file, target-to-contract map, counterexample notes, unresolved-risk record, and formal reviewer signoff. | Informal proof notes, intended properties without tool output, test coverage alone, or proof claims with undocumented assumptions. | Formal methods owner and formal verification reviewer. | Stale if verified source, compiler assumptions, proof harness, target property, or dependency wiring changes. |
| Custody | STEP9-BLOCK-003 | Signer registry, role-to-custodian map, quorum rules, key rotation procedure, onboarding/offboarding records, compromised-key runbook, and custody attestation. | Named owner without key evidence, incomplete quorum model, single-person critical custody, or missing compromise procedure. | Governance operations lead and release council representative. | Stale if signer membership, role assignment, quorum threshold, custody operator, or key ceremony changes. |
| Emergency/freeze runbook | STEP9-BLOCK-004 | Emergency trigger, freeze, release, oracle incident, reserve incident, public-notice, and post-incident runbooks with rehearsal notes and authority evidence. | Unrehearsed procedure, missing release authority, notification-only process, or automation replacing final human authority. | Emergency operations lead and governance reviewer. | Stale if authority paths, signers, incident contacts, deployment addresses, or release procedures change. |
| Deployment dry-run | STEP9-BLOCK-005 | Deployment manifest, artifact hashes, constructor arguments, dependency address book, role assignments, dry-run logs, gas estimates, and post-run verification. | Unexecuted manifest, unmatched dry-run logs, missing constructor arguments, unknown deployer, or unverifiable role state. | Deployment coordinator and engineering maintainer. | Stale if candidate commit, artifacts, constructor arguments, deployment script, network target, or role assignments change. |
| Release signoff | STEP9-BLOCK-006 | Go/no-go minutes, signer approvals, release package hash, final blocker disposition, audit/proof disposition, and accepted-risk record. | Verbal approval, unsigned notes, missing package hash, or signoff that omits open blockers. | Release council. | Stale if any upstream blocker changes, candidate commit changes, package hash changes, or accepted risk expires. |
| Oracle operations | STEP9-BLOCK-007 | Feeder registry, source attestations, stale-data response, feeder suspension process, invalidation procedure, deviation review notes, and liveness monitoring evidence. | Feeder address list without operators, missing source record, no suspension path, or any oracle-to-policy execution ambiguity. | Oracle operations lead and governance reviewer. | Stale if feeder set, data source, monitoring process, oracle contract address, or deviation procedure changes. |
| Non-claims | STEP9-BLOCK-008 | Current roadmap, blocker register, release packet, and handoff materials explicitly preserving production-readiness, audit, formal-verification, and release non-claims. | Ambiguous launch language, partial non-claims, or readiness wording before all gates are satisfied. | Release coordinator and governance reviewer. | Stale if any release document or public handoff is changed without rechecking non-claims. |

### Acceptable vs. Insufficient Evidence

| Evidence class | Acceptable | Insufficient |
| --- | --- | --- |
| Commit and test baseline | Candidate commit hash, clean repository status, full `npm test` output, and empty `contracts` and `test` diffs unless implementation work is explicitly in scope. | Old test output, partial test run, dirty working tree, or undocumented contract/test changes. |
| External attestation | Signed or attributable audit, formal, custody, oracle, deployment, or release evidence from the responsible owner. | Anonymous notes, unowned checklists, unreviewed drafts, or repository text claiming external completion. |
| Risk acceptance | Specific unresolved item, severity, rationale, compensating control, approving body, expiry/review trigger, and affected release scope. | Blanket acceptance, missing owner, no expiry, unclear severity, or acceptance of non-acceptable doctrine violations. |
| Operational rehearsal | Dated rehearsal record, participants, scenario, authority checks, abort conditions, observed gaps, and post-rehearsal corrections. | Hypothetical runbook, meeting notes without scenario evidence, or untested emergency/freeze path. |
| Deployment verification | Manifest-to-dry-run match, artifact hash match, constructor argument record, role-state verification, and post-run authority-boundary check. | Script exists, deployment command was planned, or addresses are listed without state verification. |
| Non-execution boundary | Explicit confirmation that `Fargard7PolicyAdapter` remains `executable = false` and no lifecycle function mutates downstream modules. | Reviewer approval language that could be read as policy execution or downstream authorization. |

### Required Reviewer and Signoff Rules

- Audit evidence requires the external audit coordinator plus auditor or authorized audit reviewer signoff.
- Formal verification evidence requires the formal methods owner plus formal verification reviewer signoff.
- Custody evidence requires governance operations lead signoff and release council acknowledgement for critical roles.
- Emergency and freeze evidence requires emergency operations lead signoff and governance review of final human or institutional authority.
- Oracle operations evidence requires oracle operations lead signoff and governance review confirming signal-only boundaries.
- Deployment dry-run evidence requires deployment coordinator and engineering maintainer signoff.
- Release approval requires release council go/no-go minutes and signer approvals.
- Non-claim evidence requires release coordinator and governance reviewer confirmation before public handoff.

### Evidence Expiry and Staleness Rules

Evidence must be refreshed or explicitly revalidated when:

- The candidate commit changes.
- Any contract, test, deployment script, artifact, constructor argument, dependency address, or role assignment changes.
- Any signer, custodian, feeder, reviewer, deployer, auditor, or formal reviewer changes.
- Any oracle source, feeder quorum assumption, liveness process, invalidation procedure, or deviation review procedure changes.
- Any emergency/freeze contact, release authority, incident runbook, or post-incident review procedure changes.
- Any accepted risk reaches its expiry date or review trigger.
- Any release packet or public handoff document changes in a way that could weaken non-claims.

If evidence is stale, the blocker remains open until refreshed evidence or explicit revalidation is attached.

### Blockers Needing External Attestation

| Blocker id | External attestation required | Minimum attesting party |
| --- | --- | --- |
| STEP9-BLOCK-001 | Audit completion or accepted-risk disposition. | External audit coordinator and auditor or authorized audit reviewer. |
| STEP9-BLOCK-002 | Proof completion, proof-risk disposition, or accepted-risk disposition. | Formal methods owner and formal verification reviewer. |
| STEP9-BLOCK-003 | Role custody, signer registry, quorum, and key-management readiness. | Governance operations lead and release council representative. |
| STEP9-BLOCK-004 | Emergency/freeze runbook completion and rehearsal readiness. | Emergency operations lead and governance reviewer. |
| STEP9-BLOCK-005 | Deployment manifest, dry-run, and post-run verification acceptance. | Deployment coordinator and engineering maintainer. |
| STEP9-BLOCK-006 | Final release approval or no-go disposition. | Release council. |
| STEP9-BLOCK-007 | Oracle feeder, data-source, liveness, invalidation, and deviation operations readiness. | Oracle operations lead and governance reviewer. |

## 7. Risk Acceptance Rules

Risk acceptance is a blocker disposition mechanism, not a production-readiness shortcut.

- Risk acceptance must identify the unresolved item, owner, rationale, severity, compensating controls, expiration or review trigger, and approving governance body.
- Risk acceptance must not be used to claim external audit completion if the audit is incomplete.
- Risk acceptance must not be used to claim formal verification completion for unproven targets.
- Risk acceptance must not authorize hidden upgradeability, autonomous oracle authority, autonomous policy execution, or bypass of final human or institutional freeze authority.
- Risk acceptance must not replace deployment manifest evidence, dry-run verification, or release council go/no-go approval.

### Risk Acceptance Policy

Risk acceptance may be used only to document a governed decision to carry a specific unresolved risk forward. It does not close the underlying evidence gap, does not convert incomplete work into completed work, and does not permit production-readiness language unless every readiness gate is otherwise satisfied.

Every accepted risk must include:

- Blocker ID and exact unresolved condition.
- Affected contract, role, runbook, operation, or release artifact.
- Severity and rationale for accepting the risk.
- Evidence reviewed before acceptance.
- Compensating controls and operational limits.
- Required approvers.
- Expiry date or revalidation trigger.
- Statement of claims that remain prohibited.

### Eligible and Non-Eligible Blockers

| Blocker id / condition | Risk acceptance eligibility | Required disposition |
| --- | --- | --- |
| STEP9-BLOCK-001 | Eligible only for documented non-critical audit findings or scoped deferrals after external review. | Critical/high unresolved findings remain release blockers unless the required governance body explicitly records accepted risk and release limits. |
| STEP9-BLOCK-002 | Eligible for specific unproven proof obligations with documented assumptions, severity, and compensating controls. | Formal verification completion must not be claimed for any unproven target. |
| STEP9-BLOCK-003 | Limited eligibility for non-critical custody process gaps. | Single-person critical custody, missing quorum, or unclear compromised-key response remains a release blocker. |
| STEP9-BLOCK-004 | Limited eligibility for non-critical rehearsal gaps. | Missing release authority, unrehearsed critical freeze/emergency path, or automation replacing final human authority remains a release blocker. |
| STEP9-BLOCK-005 | Not eligible when manifest, dry-run, or post-run verification is missing or unverifiable. | Deployment evidence must be produced and reviewed before release approval. |
| STEP9-BLOCK-006 | Eligible only as a no-go or conditional-go record after all upstream blocker dispositions are known. | Release approval cannot be implied without release council go/no-go minutes and signer approvals. |
| STEP9-BLOCK-007 | Limited eligibility for non-critical monitoring or process gaps. | Any oracle path implying autonomous sovereign or policy authority is not eligible. |
| STEP9-BLOCK-008 | Not eligible. | Production readiness remains a non-claim until every readiness gate is satisfied by evidence. |
| Hidden Kernel upgradeability, proxy ambiguity, or governance backdoor | Not eligible. | Must be removed, disproven, or treated as a blocking defect. |
| `Fargard7PolicyAdapter` downstream execution or policy mutation | Not eligible. | Requires separate design, implementation, review, and tests before any future claim. |

### Required Approvers

| Risk category | Required approvers |
| --- | --- |
| External audit finding or audit deferral | External audit coordinator, auditor or authorized audit reviewer, and release council. |
| Formal verification gap or proof-risk acceptance | Formal methods owner, formal verification reviewer, and release council. |
| Custody or key-management gap | Governance operations lead and release council representative. |
| Emergency/freeze runbook or rehearsal gap | Emergency operations lead, governance reviewer, and release council representative. |
| Oracle operations gap | Oracle operations lead, governance reviewer, and release council representative. |
| Deployment dry-run discrepancy that is not blocking | Deployment coordinator, engineering maintainer, and release council. |
| Release-level accepted risk | Release council with the responsible blocker owner present in the record. |

### Evidence Required for Acceptance

Risk acceptance records must attach or link:

- Current candidate commit and test baseline.
- Current `contracts` and `test` diff status.
- The evidence reviewed for the blocker.
- Affected scope and severity classification.
- Reason the issue is eligible for acceptance.
- Compensating controls and monitoring requirements.
- Expiry date or revalidation trigger.
- Approver identities and approval timestamp.
- Non-claims statement preserving production-readiness, audit, formal-verification, and release limits.

Acceptance based only on verbal approval, missing owner identity, stale evidence, or broad category-level waiver is insufficient.

### Expiry and Revalidation Rules

Accepted risk expires or must be revalidated when:

- The candidate commit changes.
- Any affected contract, test, deployment script, manifest, constructor argument, address, role assignment, runbook, signer, feeder, reviewer, or external dependency changes.
- New audit or formal verification evidence contradicts the acceptance rationale.
- A compensating control is not implemented or cannot be monitored.
- The stated expiry date is reached.
- The release scope changes.
- The accepted risk could affect non-claims, oracle signal boundaries, adapter non-execution, Kernel immutability, or final human/institutional freeze authority.

Expired or stale accepted risk reopens the affected blocker until the responsible owner refreshes evidence and obtains the required approvers again.

### Production-Readiness Non-Claim Preservation

Risk acceptance must preserve the following non-claims unless every required production-readiness gate is satisfied by evidence:

- IranOS is not production ready.
- External audit is not complete unless a final audit disposition exists.
- Formal verification is not complete unless proof artifacts support that claim.
- Release approval is not granted unless release council go/no-go evidence exists.
- `Fargard7PolicyAdapter` remains proposal-only and non-executing.
- Oracle signals remain non-sovereign and cannot autonomously mutate downstream policy or emergency state.

## 8. Blocker Owner Action Plan

This action plan identifies the next concrete owner action for each open Step-9 blocker. The table is planning evidence only; it does not close any blocker until the expected artifact exists, is current, and has the required review or signoff.

| Blocker id | Owner | Next action | Deliverable | Unblock condition | Expected evidence artifact | Dependency type |
| --- | --- | --- | --- | --- | --- | --- |
| STEP9-BLOCK-001 | External audit coordinator | Confirm audit scope, auditor, target commit, reviewed contract surfaces, and finding workflow. | External audit execution packet. | Final audit disposition exists and every finding is remediated, deferred, or risk-accepted under policy. | Audit scope, final report, finding register, severity triage, remediation links, accepted-risk notes, and auditor/coordinator signoff. | Audit |
| STEP9-BLOCK-002 | Formal methods owner | Select high-priority proof targets and map each target to artifact, assumption, tool output, or risk disposition. | Formal verification disposition packet. | Proof targets are proven or unresolved properties are explicitly blocked or risk-accepted without claiming formal verification completion. | Proof artifact index, target-to-contract map, assumptions file, tool output, counterexample notes, and formal reviewer signoff. | Proof |
| STEP9-BLOCK-003 | Governance operations lead | Build production role-to-custodian map and quorum/key-management procedure set. | Production custody package. | Every privileged role has named custodian, quorum rule, rotation path, onboarding/offboarding process, and compromised-key response. | Signer registry, role custody map, quorum records, key rotation procedure, custody attestation, and compromised-key runbook. | Custody |
| STEP9-BLOCK-004 | Emergency operations lead | Prepare and rehearse emergency trigger, freeze, release, oracle incident, reserve incident, and post-incident review runbooks. | Emergency and freeze readiness packet. | Critical emergency and freeze paths are rehearsed, auditable, human or institution-gated, and have clear release authority. | Runbook set, rehearsal notes, incident packet template, authority checks, escalation contacts, and post-incident review checklist. | Runbook |
| STEP9-BLOCK-005 | Deployment coordinator | Produce candidate deployment manifest and execute a dry-run against the approved package. | Deployment dry-run evidence packet. | Manifest, dry-run logs, artifact hashes, constructor arguments, address book, role assignments, and post-run verification match. | Deployment manifest, artifact hash list, dry-run logs, gas estimates, deployed test addresses, role-state checks, and post-run verification output. | Dry-run |
| STEP9-BLOCK-006 | Release council | Assemble final blocker disposition and decide go/no-go after upstream evidence is reviewed. | Release decision packet. | Release council records go/no-go minutes, signer approvals, release package hash, blocker disposition, and accepted-risk record if any. | Go/no-go minutes, signer approvals, release package hash, audit/proof disposition, custody confirmation, and final blocker register. | Signoff |
| STEP9-BLOCK-007 | Oracle operations lead | Finalize feeder onboarding, source attestation, liveness monitoring, stale-data, invalidation, and deviation review procedures. | Oracle operations readiness packet. | Oracle workflows are auditable, feeder authority is bounded, and signal-only doctrine is preserved. | Feeder registry, data-source attestations, liveness monitoring record, suspension procedure, invalidation record, and deviation review notes. | Runbook / custody |
| STEP9-BLOCK-008 | Release coordinator | Keep non-claim language synchronized across roadmap, blocker plan, release packet, and handoff materials. | Non-claims preservation packet. | Every public or release-facing artifact states no production readiness, audit completion, formal verification completion, or release approval until evidence exists. | Current non-claims statement, release packet excerpt, handoff checklist, and governance reviewer confirmation. | Signoff / doctrine |

Owner action plan dependencies:

- Audit and formal proof disposition should precede final release signoff.
- Custody and oracle operations evidence should precede emergency/freeze rehearsal and deployment dry-run verification.
- Emergency/freeze and oracle runbook readiness should precede deployment dry-run acceptance.
- Deployment dry-run evidence should precede release council go/no-go review.
- Non-claim preservation applies continuously across every blocker and cannot wait until final release review.

## 9. Non-Claims

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

## 10. Opening Status

Step-10 is open as a docs-only production-readiness blocker resolution planning phase.

At opening:

- `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open.
- Production readiness is not claimed.
- External audit is not complete.
- Formal verification is not complete.
- Release approval is not granted or implied.
- No contract or test changes are introduced.

## 11. Blocker Resolution Plan V1 Checkpoint

The Step-10 blocker resolution plan v1 is checkpointed as complete for the current planning scope.

Checkpointed Step-10 planning coverage includes:

- Step-9 blocker inputs and blocker resolution register.
- Sequencing, dependency graph, phase order, entry criteria, and exit criteria.
- Evidence acceptance criteria, acceptable and insufficient evidence examples, reviewer and signoff rules, evidence expiry, and external attestation requirements.
- Risk acceptance policy, eligible and non-eligible blockers, required approvers, acceptance evidence, expiry and revalidation rules, and non-claim preservation.
- Owner action plan with next action, deliverable, unblock condition, expected evidence artifact, and audit/proof/custody/runbook/dry-run/signoff dependencies for each blocker.

This checkpoint plans blocker resolution but does not resolve the blockers. `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open until the required evidence, signoff, or valid risk disposition exists.

This checkpoint does not claim production readiness. External audit is not complete. Formal verification is not complete. Release approval is not complete or implied. `Fargard7PolicyAdapter` remains proposal-only and non-executing. Oracle signals remain non-sovereign.

Next direction: Step-10 closure review or any remaining planning-gap pass before closing the blocker resolution planning phase.
