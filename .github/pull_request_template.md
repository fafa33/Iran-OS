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
