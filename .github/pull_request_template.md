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

## Pre-Implementation Red-Team Pass

Applies to any PR touching: Kernel · Oracle · Reserve · Treasury · TriggerProtocol · PahlaviToken · roles · deployment wiring · authority boundaries.

- [ ] This PR does not touch any of the above components (skip this section).
- [ ] This PR touches one or more of the above components — red-team pass required before implementation.

If red-team pass applies, confirm ALL of the following were documented before any code was written:

- [ ] Internal red-team pass completed and documented (in this PR description or a linked report) before implementation began.
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
