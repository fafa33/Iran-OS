# Step-12 Custody and Key-Management Evidence Packet

**Blocker:** `STEP9-BLOCK-003` role custody/key-management
**GitHub issue:** https://github.com/fafa33/Iran-OS/issues/14
**Status:** Draft evidence acquisition packet
**Evidence state:** Draft; not accepted evidence
**Reviewer/signoff state:** Not reviewer signoff
**Disposition:** No blocker closure; `STEP9-BLOCK-003` remains pending/open

## 1. Purpose

This packet starts the evidence acquisition work for `STEP9-BLOCK-003`. It gathers repository-supported custody and authority facts, identifies missing production custody evidence, and lists the reviewer/signoff requirements needed before blocker closure can be considered.

This document does not mark evidence as accepted, does not provide reviewer signoff, does not close `STEP9-BLOCK-003`, does not close any other blocker, does not claim production readiness, does not claim release approval, does not claim completed external audit, and does not claim completed formal verification.

`Fargard7PolicyAdapter` remains proposal-only/non-executing. Oracle signals remain non-sovereign and cannot autonomously freeze, unfreeze, mint, burn, transfer, spend, classify, subsidize, apply fees, change wages, alter budgets, approve loans, mutate provincial balances, or execute governance.

## 2. Source Material Reviewed

Repository-supported inputs used for this draft:

- `docs/STEP5_ROLE_AUTHORITY_BOUNDARY_MATRIX.md`
- `docs/reports/ARCHITECTURAL_RISK_AND_DOCTRINE_REPORT-v0.1.0.md`
- `docs/reports/STEP10_PRODUCTION_READINESS_BLOCKER_RESOLUTION_PLAN.md`
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`
- `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`
- `docs/reports/STEP12_GITHUB_EVIDENCE_WORKFLOW.md`
- GitHub issue tracker entry for `STEP9-BLOCK-003`: https://github.com/fafa33/Iran-OS/issues/14

## 3. Custody Map

This table separates repository-supported authority domains from missing production custodian evidence. It does not identify real key holders, signer addresses, or production custody operators.

| Authority or custody domain | Repository-supported role or authority fact | Production custodian evidence status |
| --- | --- | --- |
| Kernel sovereign/admin authority | The architectural risk report maps `SOVEREIGN_ROLE` to `DEFAULT_ADMIN_ROLE` at the Kernel layer and states that `kernel.sol::grantOfficialAccess()` prevents granting `SOVEREIGN_ROLE` through the normal grant path. | Pending; production custodian identity, key-control model, backup process, and attestation are not provided. |
| Court trigger authority | The architectural risk report records `COURT_ROLE` as the body for constitutional trigger signatures, with `MULTISIG_THRESHOLD` in `kernel.sol` recorded as 7 of 9. | Pending; production court signer registry, key custody, replacement rules, and attestations are not provided. |
| Oracle reporting authority | Step-5 states oracle/API3 signals are evidence-only and not sovereign authority. The architectural risk report lists `ORACLE_ROLE` and `FEEDER_ROLE` as role surfaces. | Pending; production oracle custodian map, feeder key holders, and operator attestations are not provided. |
| Guardian authority | The architectural risk report lists `GUARDIAN_ROLE` as a Kernel role surface. | Pending; production guardian custodian identity, key handling, and rotation path are not provided. |
| Treasury and budget authority | Step-5 identifies Treasury as an explicitly authorized treasury execution path and states treasury labels are not authority by themselves. | Pending; production treasury role holders, custodians, quorum rules, and approval records are not provided. |
| SWF accounting authority | Step-5 states SovereignWealthFund actions are limited to authorized deposits, withdrawals, and reclaimed intake. The architectural risk report records `MULTISIG_REQUIRED` in `SovereignWealthFund.sol` as 3 of N. | Pending; production SWF council signer registry, custodian attestations, and key-management procedure are not provided. |
| Freeze/release and reclaim authority | Step-5 identifies freeze/release authority as human/governance or Kernel-authorized. It states AssetFreeze/reclaim records do not create mint or classification authority. | Pending; production crawler/council/key custodian map, release authority contacts, and compromise response are not provided. |
| Release approval authority | Step-10 states release approval requires release council go/no-go minutes and signer approvals. | Pending; release council membership, signer approvals, and release signoff records are not provided. |

## 4. Signer List

No production signer list is present in the repository documentation reviewed for this packet.

Required signer evidence remains pending:

- Production privileged-role signer registry.
- Signer identity or role for each privileged authority domain.
- Key custody owner or institutional custodian for each signer.
- Signer onboarding date, authority scope, and approval source.
- Signer replacement and revocation criteria.
- Attestation from the governance operations lead and release council representative or governance reviewer.

This packet does not invent signer identities, key holders, multisig addresses, or approvals.

## 5. Multisig or Quorum Rules

Repository-supported quorum facts:

| Domain | Repository-supported quorum fact | Evidence status |
| --- | --- | --- |
| Kernel constitutional trigger signatures | `MULTISIG_THRESHOLD` is recorded as 7 of 9 in the architectural risk report. | Code/doctrine fact recorded; production signer registry and custody attestations are pending. |
| Sovereign Wealth Fund withdrawals | `MULTISIG_REQUIRED` is recorded as 3 of N in the architectural risk report. | Code/doctrine fact recorded; production council signer registry and custody attestations are pending. |
| AssetFreeze council confirmations | Existing tests and contract surface use council confirmation flow, and Step-5 treats freeze/release as human/governance or Kernel-authorized. | Production council signer registry and custody attestations are pending. |

Missing quorum evidence:

- Production quorum policy for each privileged role outside the hardcoded contract thresholds.
- Mapping from quorum participants to institutional custodians.
- Procedure for quorum degradation, signer loss, emergency replacement, and temporary suspension.
- Evidence that no critical production custody path depends on a single uncontrolled key.

## 6. Key Rotation Plan

No production key rotation plan is present in the repository documentation reviewed for this packet.

Required key rotation evidence remains pending:

- Rotation cadence for each privileged role or signer set.
- Rotation approval authority.
- Rotation execution checklist.
- Post-rotation verification procedure.
- Revocation requirements for former signers.
- Emergency rotation procedure for suspected compromise.
- Evidence staleness rule when any signer, custodian, role assignment, quorum threshold, or custody operator changes.

## 7. Onboarding and Offboarding Log

No production onboarding/offboarding log is present in the repository documentation reviewed for this packet.

Required onboarding/offboarding evidence remains pending:

- Initial production signer onboarding record.
- Eligibility criteria for privileged role holders.
- Approval record for each signer or custodian.
- Offboarding trigger list, including role change, employment or mandate change, compromise suspicion, inactivity, or governance removal.
- Revocation verification record after offboarding.
- Historical log linking each signer change to a reviewer or governance approval.

## 8. Compromised-Key Response

No production compromised-key response record is present in the repository documentation reviewed for this packet.

Required compromised-key evidence remains pending:

- Incident intake and severity classification procedure.
- Immediate containment steps for suspected signer or custodian compromise.
- Role revocation and replacement workflow.
- Quorum degradation and continuity plan.
- Communication and escalation contacts.
- Post-incident review requirements.
- Evidence refresh requirement for affected custody, deployment, oracle, release, and non-claim packets.

## 9. Required Reviewer and Signoff

The accepted-evidence checklist and Step-10 plan require custody evidence to be reviewed and signed off by:

- Governance operations lead.
- Release council representative or governance reviewer.

Required signoff remains pending. This packet is not a signoff and cannot support blocker closure by itself.

## 10. Remaining Gaps

`STEP9-BLOCK-003` remains pending/open because the following accepted evidence is not present:

- Production role-to-custodian map.
- Production signer registry.
- Custodian attestations.
- Quorum records for critical roles.
- Key rotation procedure.
- Onboarding/offboarding records.
- Compromised-key response procedure.
- Governance operations lead signoff.
- Release council representative or governance reviewer signoff.

Repository documentation currently supports authority-boundary and quorum-planning context, but it does not provide production custody evidence.

## 11. Closure Rule

`STEP9-BLOCK-003` can be considered for closure only after the submitted custody packet is reviewed and accepted with accountable custodians, signer registry, quorum rules, rotation/offboarding controls, compromised-key response, and required reviewer/signoff.

This draft does not close `STEP9-BLOCK-003`; all blockers remain pending/open.

## 12. Current Non-Claims

- IranOS is not production ready.
- External audit is not complete.
- Formal verification is not complete.
- Release is not approved.
- No `STEP9-BLOCK-*` item is closed.
- No accepted evidence is claimed.
- `STEP9-BLOCK-003` remains pending/open.
- Step 12 remains open.
- `Fargard7PolicyAdapter` remains proposal-only and non-executing.
- Oracle signals remain non-sovereign.
