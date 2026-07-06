# Pull Request

## Reviewer Primer Confirmation

Before submitting this PR, read the reviewer primer:

- [Reviewer Primer — English](docs/REVIEWER_PRIMER.md)
- [راهنمای بازبین — فارسی](docs/REVIEWER_PRIMER_FA.md)

- [ ] I have read the reviewer primer before proposing this change.
- [ ] I understand that IranOS is a sovereign resilience infrastructure, not a DeFi protocol, DAO, governance-token system, central-bank simulator, or yield-maximization platform.
- [ ] This PR does not treat Kernel immutability, oracle non-sovereignty, fixed constitutional safeguards, or monetary discipline as ordinary implementation limitations.

---

## Summary

What does this PR change and why?

---

## Files Changed

List the key files modified or created:

- `path/to/file` — reason

---

## Tests

- [ ] Not applicable (documentation only)
- [ ] `npm test` — result: ___ / ___ passing
- [ ] Other: ___

---

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
- [ ] Step 11 Documentation-Parity Review completed and recorded below, or not applicable because this PR does not match the Step 11 trigger scope.
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
- Step 11 — Documentation-Parity Review:
  - Trigger scope matched: ___ (ownership / DEFAULT_ADMIN_ROLE / access control / grantRole() / constructor parameters / deployment authority / runtime authority / governance authority / deployment sequence / deployment wiring, or "N/A — none matched")
  - Contracts/roles affected: ___
  - Docs greped: ___
  - Caller/authority description re-verified against code: YES / NO — grep command + result per doc: ___
  - Documents updated in this PR: ___ (or "N/A — no stale descriptions found")
  - Result: PASS / DOCUMENTATION_REQUIRED
  - CET level: CET-1 / below CET-1

---

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

## Documentation-Parity Review

Applies to any PR modifying: ownership · `DEFAULT_ADMIN_ROLE` · access control · `grantRole()` · constructor parameters · deployment authority · runtime authority · governance authority · deployment sequence · deployment wiring.

- [ ] This PR does not modify any of the above (skip this section).
- [ ] This PR modifies one or more of the above — Documentation-Parity Review required before this PR is READY.

If Documentation-Parity Review applies, confirm ALL of the following:

- [ ] All affected deployment manifests are updated in this PR.
- [ ] All affected deployment protocols are updated in this PR.
- [ ] All affected runbooks are updated in this PR.
- [ ] All affected operator guides are updated in this PR.
- [ ] All affected role wiring documentation is updated in this PR.
- [ ] All affected deployment checklists are updated in this PR.
- [ ] Runtime, deployment scripts, manifests, and operational documentation describe exactly the same authority model — the caller named in every doc location found by `grep -rn '<ContractName>\|<ROLE_NAME>' docs/deployment/` matches the current `constructor`/`DEFAULT_ADMIN_ROLE`/`grantRole()` logic in code.
- [ ] Step 11 Evidence Block above is filled in (not left as template placeholders).

---

## Doctrine Impact

Does this PR affect any of the following? Check all that apply.

- [ ] None
- [ ] Kernel constants (MULTISIG_THRESHOLD, LIQUIDITY_CAP, MIN_RESERVE_RATIO)
- [ ] Role assignment logic (SOVEREIGN_ROLE, COURT_ROLE, ORACLE_ROLE)
- [ ] Trigger lifecycle (flagViolation, signViolation, executeTrigger)
- [ ] Emergency lock (emergencyLockActive, deactivateEmergencyLock)
- [ ] Monetary layer (SovereignWealthFund, Treasury, PahlaviToken)
- [ ] Oracle layer (API3Oracle, PriceOracle, ProductionOracle)
- [ ] Deployment sequence (constructor dependencies, role wiring order)

If any box above is checked, explain the impact:

---

## Constitutional Invariant Safety

Confirm that this PR does not weaken any of the following unless explicitly documented and justified as a doctrine-level review item:

- [ ] Kernel immutability is preserved.
- [ ] Oracle signals remain evidence-only and non-sovereign.
- [ ] Constitutional thresholds are not converted into ordinary configurable parameters.
- [ ] Reserve protections and monetary discipline are not weakened.
- [ ] Treasury mutation authority is not expanded through evidence records, oracle signals, reports, labels, or automation.
- [ ] Final constitutional judgment is not fully delegated to automation.

---

## Charter Impact

Does this PR align with the constitution (*Charter of Welfare and Justice*)?

- [ ] No constitutional impact (docs / tests / CI)
- [ ] Constitutional alignment maintained — Fargard/section: ___
- [ ] Potential conflict — explained below

---

## Non-Claim Checklist

- [ ] This PR does not claim production readiness.
- [ ] This PR does not claim release approval.
- [ ] This PR does not claim completed external audit.
- [ ] This PR does not claim completed formal verification.
- [ ] This PR does not close any `STEP9-BLOCK-*` blocker by implication.
- [ ] This PR does not lower `MULTISIG_THRESHOLD` or `COUNCIL_THRESHOLD`.
- [ ] This PR does not remove a `nonReentrant` guard.
- [ ] This PR does not introduce admin backdoors or upgrade proxies on the Kernel.
- [ ] `Fargard7PolicyAdapter` remains proposal-only / non-executing (if touched).
- [ ] Oracle signals remain non-sovereign / signal-only (if touched).

---

## Related Issues / PRs

- Issue:
- Blocker:
- Related PR:
