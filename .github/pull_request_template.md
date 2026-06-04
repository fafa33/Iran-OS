# Pull Request

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
