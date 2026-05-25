# Step-12 GitHub Evidence Workflow

**Scope:** GitHub issue-opening and label guidance for Step-12 accepted-evidence and reviewer-signoff contributions
**Status:** Workflow guidance only; Step 12 remains open and no blocker is closed by this document

## 1. Purpose

Use this guide when opening GitHub Issues for Iran-OS Step-12 evidence and reviewer signoff submissions. The issue workflow is intended to make pending `STEP9-BLOCK-*` evidence packets reviewable without implying acceptance, blocker closure, production readiness, release approval, completed external audit, or completed formal verification.

Use the Step-12 issue template: [`../../.github/ISSUE_TEMPLATE/step12-evidence-signoff.yml`](../../.github/ISSUE_TEMPLATE/step12-evidence-signoff.yml)

Use the accepted-evidence checklist: [`STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md`](STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md)

## 2. Opening Rules

- Open one issue per `STEP9-BLOCK-*` item.
- Use `.github/ISSUE_TEMPLATE/step12-evidence-signoff.yml`.
- Include evidence packet links or attachments.
- Identify the reviewer/signoff identity or role.
- Keep the evidence state as one of `draft`, `submitted`, `reviewed`, or `accepted`.
- Do not claim blocker closure unless accepted evidence and required reviewer/signoff are attached or clearly linked.
- Do not claim production readiness, release approval, completed external audit, or completed formal verification unless the required accepted evidence and signoff are attached or clearly linked.
- Preserve `Fargard7PolicyAdapter` as proposal-only/non-executing.
- Preserve oracle signals as non-sovereign.

## 3. Recommended Labels

These labels are recommended for GitHub issue triage. This document does not configure label automation.

| Label | Use |
| --- | --- |
| `step-12` | Any Step-12 evidence/signoff issue. |
| `evidence-needed` | Evidence is missing, incomplete, or awaiting submission. |
| `reviewer-signoff-needed` | Evidence exists but required reviewer/signoff is missing. |
| `blocker-open` | The related blocker remains pending/open. |
| `external-audit` | `STEP9-BLOCK-001` external audit evidence. |
| `formal-verification` | `STEP9-BLOCK-002` formal verification evidence. |
| `custody-key-management` | `STEP9-BLOCK-003` role custody/key-management evidence. |
| `oracle-ops` | `STEP9-BLOCK-004` oracle ops or `STEP9-BLOCK-007` oracle runbook evidence. |
| `deployment-dry-run` | `STEP9-BLOCK-005` deployment dry-run/manifest evidence. |
| `release-signoff` | `STEP9-BLOCK-006` release signoff evidence. |
| `non-claim-preservation` | `STEP9-BLOCK-008` non-claim preservation evidence. |

## 4. Recommended Issue-Opening Order

1. `STEP9-BLOCK-001` external audit.
2. `STEP9-BLOCK-002` formal verification.
3. `STEP9-BLOCK-003` role custody/key-management.
4. `STEP9-BLOCK-004` oracle ops.
5. `STEP9-BLOCK-007` oracle operations runbook.
6. `STEP9-BLOCK-005` deployment dry-run/manifest.
7. `STEP9-BLOCK-008` non-claim preservation.
8. `STEP9-BLOCK-006` release signoff last.

## 5. Current Non-Claims

- Iran-OS is not production ready.
- External audit is not complete.
- Formal verification is not complete.
- Release approval is not complete.
- No `STEP9-BLOCK-*` blocker is closed by this workflow.
- No evidence is accepted by this workflow.
- Step 12 remains open.
- `Fargard7PolicyAdapter` remains proposal-only/non-executing.
- Oracle signals remain non-sovereign.
