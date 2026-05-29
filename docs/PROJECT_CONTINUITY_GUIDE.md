# Project Continuity Guide

This guide records how future maintainers should continue the repository safely.

## Read first

1. README.md
2. docs/
3. protocols/
4. contracts/
5. test/
6. docs/step*/ reports

## Fixed rules

- Keep MIN_RESERVE_RATIO at 333.
- Keep LIQUIDITY_CAP at 900B.
- Keep MULTISIG_THRESHOLD at 7.
- Keep TRIGGER_TIMEOUT at 72h.
- Keep the Kernel non-upgradeable.
- Do not turn fixed thresholds into runtime configuration.
- Do not weaken reserve discipline.
- Do not add readiness or signoff claims without review.

## Current open items

- Step 12 remains open.
- Step 13 remains open.
- DG-01 needs authority design review.
- DG-02 needs accounting fix and test.
- DG-03 needs integration test.
- DG-04 needs design documentation.

## Recommended next order

1. DG-03 integration test.
2. DG-02 accounting fix and test.
3. DG-04 documentation decision.
4. DG-01 authority review.

## Maintainer rule

Before changing contracts, identify the protected invariant, affected contract surface, required test, and any open blocker that must remain open.
