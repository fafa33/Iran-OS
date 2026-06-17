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