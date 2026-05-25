# Step-12 Accepted-Evidence Acquisition Checklist

**Checkpoint:** created after `bd0e6aa docs(step12): record evidence execution handoff checkpoint`
**Scope:** accepted-evidence and reviewer-signoff acquisition checklist for pending Step-12 blockers
**Status:** Open acquisition checklist; no blocker is closed by this document

## 1. Purpose

This checklist converts the pending Step-12 blocker status into an evidence acquisition worklist. It separates required evidence, required reviewer/signoff, closure preconditions, and current status for each pending blocker.

This document does not mark evidence as accepted, does not close any blocker, does not claim production readiness, does not claim external audit completion, does not claim formal verification completion, and does not claim release approval.

`Fargard7PolicyAdapter` remains proposal-only and non-executing. Oracle signals remain non-sovereign and cannot autonomously freeze, unfreeze, mint, burn, transfer, spend, classify, subsidize, apply fees, change wages, alter budgets, approve loans, mutate provincial balances, or execute governance.

## 2. Acquisition Order

Recommended evidence acquisition order:

1. `STEP9-BLOCK-001` external audit.
2. `STEP9-BLOCK-002` formal verification.
3. `STEP9-BLOCK-003` role custody and key management.
4. `STEP9-BLOCK-004` oracle operations packet and `STEP9-BLOCK-007` oracle operations runbook packet.
5. `STEP9-BLOCK-005` deployment dry-run and manifest packet.
6. `STEP9-BLOCK-008` non-claim preservation acceptance.
7. `STEP9-BLOCK-006` release signoff last.

## 3. Evidence Acquisition Checklist

| Blocker id | Topic | Required evidence | Required reviewer/signoff | Closure precondition | Current status |
| --- | --- | --- | --- | --- | --- |
| `STEP9-BLOCK-001` | External audit | Audit scope; auditor identity or engagement record; final audit report; finding register; remediation, deferral, or accepted-risk disposition. | External audit coordinator and auditor or authorized audit reviewer. | Submitted audit packet is reviewed and accepted, or eligible findings receive valid governed risk acceptance under Step-10 and Step-11 evidence rules. | Pending/open; no accepted audit evidence is recorded; no blocker closure. |
| `STEP9-BLOCK-002` | Formal verification | Proof scope; target list; tool and configuration record; assumptions; proof artifacts or tool output; failed obligations or unresolved proof-risk disposition. | Formal methods owner and formal verification reviewer. | Submitted proof packet is reviewed and accepted, or unresolved proof obligations receive valid governed risk acceptance under Step-10 and Step-11 evidence rules. | Pending/open; no accepted proof evidence is recorded; no blocker closure. |
| `STEP9-BLOCK-003` | Role custody and key management | Custody map; signer list; multisig or quorum rules; key rotation plan; onboarding/offboarding log; compromised-key response. | Governance operations lead and release council representative or governance reviewer. | Submitted custody packet is reviewed and accepted with accountable custodians, quorum rules, rotation/offboarding controls, and compromised-key response. | Pending/open; no accepted custody evidence is recorded; no blocker closure. |
| `STEP9-BLOCK-004` | Oracle operations packet | Feeder registry; quorum configuration; freshness and staleness configuration; deviation handling; incident runbook; monitoring evidence. | Oracle operations lead and governance reviewer. | Submitted oracle operations packet is reviewed and accepted, and oracle signals remain signal-only and non-sovereign. | Pending/open; no accepted oracle operations evidence is recorded; no blocker closure. |
| `STEP9-BLOCK-005` | Deployment dry-run and manifest | Deployment manifest; artifact hashes; constructor arguments; dependency address book; initial role assignments; dry-run logs; gas estimates; post-run verification. | Deployment coordinator and engineering maintainer or deployment reviewer. | Submitted deployment packet is reviewed and accepted, dry-run output matches the manifest, and post-run verification confirms role, dependency, and authority-boundary state. | Pending/open; no accepted deployment evidence is recorded; no blocker closure. |
| `STEP9-BLOCK-006` | Release signoff | Upstream blocker disposition summary; release package hash; signer approvals; release council go/no-go minutes. | Release council. | Submitted release packet is reviewed and accepted after upstream blocker disposition, with release council approval and no unsupported production-readiness claim. | Pending/open; no accepted release signoff packet or release council approval is recorded; no blocker closure. |
| `STEP9-BLOCK-007` | Oracle operations runbook | Feeder and data-source attestations; onboarding procedure; suspension procedure; stale-data and invalidation procedures; deviation review; liveness monitoring; signal-only governance review. | Oracle operations lead and governance reviewer. | Submitted oracle runbook packet is reviewed and accepted, and oracle procedures preserve non-sovereign signal-only doctrine. | Pending/open; no accepted oracle operations runbook evidence is recorded; no blocker closure. |
| `STEP9-BLOCK-008` | Non-claim preservation | Accepted current roadmap and blocker-register non-claim check; release packet or handoff non-claim excerpt; governance reviewer confirmation. | Release coordinator and governance reviewer. | Submitted non-claim preservation packet is reviewed and accepted while confirming no production-readiness, release-approval, external-audit-completion, formal-verification-completion, or blocker-closure claim is made without evidence. | Pending/open; non-claim evidence is recorded but not accepted; no blocker closure. |

## 4. Closure Rules

- No blocker may be closed without accepted evidence and required reviewer/signoff.
- Missing, stale, unattributed, incomplete, inconsistent, or unauthorized evidence cannot support blocker closure.
- Tests alone do not close audit, formal verification, custody, oracle operations, deployment dry-run, oracle runbook, release signoff, or non-claim preservation blockers.
- Documentation alone does not replace required external reports, proof artifacts, custody records, operational packets, dry-run logs, release council minutes, or reviewer signoff.
- No blocker is closed by implication from this checklist.

## 5. Current Non-Claims

- IranOS is not production ready.
- External audit is not complete.
- Formal verification is not complete.
- Release is not approved.
- No `STEP9-BLOCK-*` item is closed.
- `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain pending/open.
- `Fargard7PolicyAdapter` remains proposal-only and non-executing.
- Oracle signals remain non-sovereign.
