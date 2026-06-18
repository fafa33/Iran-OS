# Pull Request Checklist

## Summary

What does this PR change?

## Scope

Select the scope of this PR:

- [ ] Documentation only
- [ ] Step 12: evidence / signoff
- [ ] Step 13: whitepaper-to-system mapping
- [ ] Tests
- [ ] Contracts or source code
- [ ] CI or tooling
- [ ] Other

## Related Step / Issue / Blocker

If applicable, provide related references:

- Step:
- Issue:
- Blocker:
- Document:

## Evidence and Review

If this PR relates to Step 12, audit, formal verification, release approval, or blocker closure, provide links here:

- Evidence packet:
- Reviewer / signoff:
- Related issue:

## Governance Preflight Synchronization

`CLAUDE.md` is the authoritative governance source. This section mirrors the existing `CLAUDE.md` standard for contributor-facing review and does not create additional policy.

Applies to every PR covered by the `CLAUDE.md` PR Preflight Standard: sensitive-component PRs; governance-impacting PRs; PRs touching Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, runbooks, gap registers, audit reports, oracle docs, reserve docs, role docs, deployment manifests, or governance policy docs; any PR whose changes match a HARDENING_ONLY re-evaluation trigger in `CLAUDE.md`; and any PR making security, governance, reachability, role, reserve, oracle, trigger, treasury, mint, freeze, or closure claims.

- [ ] This PR is outside the `CLAUDE.md` PR Preflight Standard scope.
- [ ] This PR is covered by the `CLAUDE.md` PR Preflight Standard.

If covered, confirm the existing `CLAUDE.md` requirements were followed:

- [ ] CET applied: all PR claims and red-team conclusions are CET-1 before push; no CET-2, CET-3, or CET-4 claim remains.
- [ ] Certainty Language Rule applied to changed files, PR title, and PR description.
- [ ] Red-Team Evidence Standard applied: claim, evidence source, verification method, certainty level, assumptions, disqualifying assumptions, and recommended action recorded where applicable.
- [ ] Step 8 Evidence Block included below, including grep evidence, role path evidence, tests, open residuals, and certainty-language scan.
- [ ] Step 9 Deployment Manifest Currency evidence included below for sensitive-component PRs, or not applicable because this PR is outside Step 9 scope.
- [ ] Step 10 `docs/governance/OPEN_RESIDUALS.md` consultation completed and recorded below.
- [ ] HARDENING_ONLY re-evaluation triggers checked; any matching active residual was re-evaluated before marking this PR ready.

### Evidence Block

Required for PRs covered by the `CLAUDE.md` PR Preflight Standard.

- grep: `<command>` → `<result>`
- Role grant path: `<contract>:<line>` → `<deployment manifest section>`
- npm test: ___ passing / not run because: ___
- Open residuals (Step 10):
  - `OPEN_RESIDUALS.md` consulted: YES / NO
  - Matching residual IDs: [list, or "No matching open residuals found after consulting OPEN_RESIDUALS.md"]
  - Residual re-evaluation required: YES / NO
  - Re-evaluation result: [per-residual result, or "N/A — no matching residuals identified"]
- Certainty language scan:
  - Changed files scanned: YES / NO
  - PR title scanned: YES / NO
  - PR description scanned: YES / NO
  - Certainty terms found: ___
  - Evidence for each term: ___
  - Terms rewritten or qualified: ___
  - Result: PASS / BLOCKED
  - CET level: CET-1 / below CET-1
- Step 9 — Deployment Manifest Currency:
  - Manifest file(s) checked: ___
  - Authoritative date field: ___
  - Date value: ___
  - Fallback commit evidence if no explicit date field exists: ___
  - Manifest last-update evidence: ___
  - Latest sensitive-component PR on main: ___
  - Condition A comparison result: ___
  - Condition B topology/role/oracle/reserve/treasury/trigger/mint/freeze change: YES / NO
  - Re-verification required: YES / NO
  - Result: PASS / DOCUMENTATION_REQUIRED
  - CET level: CET-1 / below CET-1 / DOCUMENTATION_REQUIRED

## Pre-Implementation Red-Team Pass

Applies to any PR touching: Kernel · Oracle · Reserve · Treasury · TriggerProtocol · PahlaviToken · roles · deployment wiring · authority boundaries.

- [ ] This PR does not touch any of the above components (skip this section).
- [ ] This PR touches one or more of the above components — red-team pass required before implementation.

If red-team pass applies, confirm ALL of the following were documented before any code was written:

- [ ] Internal red-team pass completed and documented (in this PR description or a linked report) before implementation began.
- [ ] Each red-team conclusion includes the evidence fields and CET level required by `CLAUDE.md`.
- [ ] Production caller path identified (exact sequence of callers from external entry point to target function on mainnet).
- [ ] Role grant path identified (how each required role reaches each caller address on mainnet, via the deployment manifest).
- [ ] Deployment manifest path identified (which file and section in `docs/deployment/` covers this wiring).
- [ ] Impossible or unreachable paths identified (any path that cannot be executed on mainnet).
- [ ] Hardhat-only assumptions excluded from production proof (`hardhat_impersonateAccount` not cited as evidence the production path works).
- [ ] Authority drift risk reviewed (this change does not expand the set of addresses able to call any authority-gated function).
- [ ] TriggerProtocol contamination risk reviewed (no non-governance event is routed into `executeTrigger`).
- [ ] CI-green-but-production-broken risk reviewed (CI passing cannot mask an unreachable production caller path).

---

## Deployment-Path Parity

Applies to any PR touching: Kernel · Oracle · Reserve · Treasury · TriggerProtocol · PahlaviToken · roles · deployment wiring · authority boundaries.

- [ ] This PR does not touch any of the above components (skip this section).
- [ ] This PR touches one or more of the above components — deployment-path parity applies.

If deployment-path parity applies, confirm ALL of the following:

- [ ] A deployment-path parity test exists that proves the exact production-intended caller path works.
- [ ] The test uses only role wiring and setup documented in the deployment manifest (`docs/deployment/`).
- [ ] The test does NOT rely on `hardhat_impersonateAccount` as proof of production reachability.
- [ ] The test does NOT rely on test-only role grants, undocumented setup, or admin shortcuts unavailable on mainnet.
- [ ] CI passing on this PR does not mask an unreachable production caller path.

If impersonation appears anywhere in the test file, confirm:

- [ ] It is labeled `// TEST-ONLY — not a production grant path` and is not cited as deployment-path proof.

---

## Non-claim Confirmations

- [ ] This PR does not claim production readiness without accepted evidence and required signoff.
- [ ] This PR does not claim release approval without required signoff.
- [ ] This PR does not claim completed external audit without accepted audit evidence and reviewer signoff.
- [ ] This PR does not claim completed formal verification without proof evidence and required signoff.
- [ ] This PR does not close any `STEP9-BLOCK-*` blocker by implication.
- [ ] `Fargard7PolicyAdapter` remains proposal-only / non-executing unless explicitly reviewed and approved.
- [ ] Oracle signals remain non-sovereign / signal-only unless explicitly reviewed and approved.

## Tests

Describe testing or review performed:

- [ ] Not applicable
- [ ] Documentation-only change
- [ ] `npm test`
- [ ] Other:

Test result / notes:

## Reviewer Notes

Add anything reviewers should pay special attention to.
