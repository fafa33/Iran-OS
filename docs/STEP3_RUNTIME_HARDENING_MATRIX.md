# Step-3 Runtime Hardening Matrix

## Checkpoint

- Branch: `main`
- Sync state: `main = origin/main`
- Latest expected commit: `039aadd test(oracle): audit zero price submission neutrality`
- Expected test baseline: `427 passing`
- Step-3 status: functionally complete

## Scope And Assumptions

This document maps Step-3 runtime hardening coverage to test evidence. It is documentation only and does not introduce doctrine, alter architecture, change contracts, or modify tests.

The matrix preserves the existing sovereign resilience model assumptions:

- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeouts, and trigger codes remain unchanged.
- Oracle components remain signal providers, not decision-makers.
- Runtime hardening evidence is test-based and should not be read as completed formal verification.

## Invariant Matrix

| Area | Runtime invariant category | Protected behavior | Evidence |
| --- | --- | --- | --- |
| Kernel | Threshold resistance | Partial court signatures below threshold do not activate trigger execution. | `test/01_kernel.test.js` |
| Kernel | Finality and replay resistance | Post-threshold signing attempts cannot replay trigger execution. | `test/01_kernel.test.js` |
| Kernel | Timeout path | Signature path remains explicit after trigger timeout elapses. | `test/01_kernel.test.js` |
| Kernel | Invalid input neutrality | Invalid oracle, violation code, offender, and court access paths revert before privileged mutation. | `test/01_kernel.test.js` |
| TriggerProtocol | Execution neutrality | Unauthorized trigger execution and zero-offender attempts are state-neutral. | `test/08_Trigger_Protocol.test.js` |
| TriggerProtocol | Execution record immutability | Stored execution records remain immutable across later executions and failed attempts. | `test/08_Trigger_Protocol.test.js` |
| JurySelection | Select immutability | Wrong-size, duplicate, and non-VRF selection failures preserve jury pool state. | `test/07_jury_selection.test.js` |
| JurySelection | Vote neutrality | Duplicate, invalid juror, and empty-proof vote failures preserve pool and commitment state. | `test/07_jury_selection.test.js` |
| JurySelection | Verdict/finality immutability | Unresolved verdict paths remain non-final; completed conviction and acquittal cases reject later votes without mutating verdict state. | `test/07_jury_selection.test.js` |
| AssetFreeze / reclaim | Atomicity | Failed SWF transfer due to missing reclaim role reverts without mutating reclaim state. | `test/06_asset_freeze.test.js` |
| AssetFreeze / reclaim | Replay resistance | Duplicate transfer failures preserve reclaim state and SWF accounting. | `test/06_asset_freeze.test.js` |
| SovereignWealthFund | Deposit accounting consistency | Valid reclaimed deposits preserve prior accounting history; zero and unauthorized reclaimed deposits are state-neutral. | `test/03_sovereign_wealth_fund.test.js` |
| SovereignWealthFund | Withdrawal accounting consistency | Valid L1 withdrawal execution updates accounting exactly once; over-withdrawal execution is state-neutral; executed withdrawals cannot replay accounting mutation. | `test/03_sovereign_wealth_fund.test.js` |
| PriceOracle | Stale read neutrality | Stale freshness checks do not mutate stored price, timestamp, validity, or feeder submission state. | `test/23_Price_Oracle.test.js` |
| PriceOracle | Invalid submission neutrality | Zero-price submission reverts without mutating stored price or feeder submission state. | `test/23_Price_Oracle.test.js` |
| PriceOracle | Feeder accounting neutrality | Repeated feeder submissions update that feeder's latest submission without duplicating feeder accounting. | `test/23_Price_Oracle.test.js` |
| API3 bridge | Kernel propagation | Feeder reports propagate through Kernel behavior while preserving emergency semantics. | `test/09_api3_oracle.test.js` |
| API3 bridge | Duplicate report behavior | Duplicate feeder reports are recorded as separate auditable oracle and Kernel violations. | `test/09_api3_oracle.test.js` |
| API3 bridge | Trigger replay resistance | Triggered bridged violations cannot be re-signed into a second TriggerProtocol execution. | `test/09_api3_oracle.test.js` |

## Covered Runtime Boundaries

Step-3 runtime hardening currently covers:

- Kernel threshold, finality, timeout, and replay resistance.
- TriggerProtocol failed-path neutrality and execution record immutability.
- JurySelection select, vote, verdict, and completed-case immutability.
- AssetFreeze reclaim transfer atomicity and replay resistance.
- SWF reclaimed deposit and L1 withdrawal accounting consistency.
- PriceOracle stale read, invalid submission, and feeder accounting neutrality.
- API3 bridge propagation, duplicate report behavior, and trigger replay resistance.

## Evidence By Test File

| Test file | Evidence summary |
| --- | --- |
| `test/01_kernel.test.js` | Kernel access control, invalid inputs, threshold behavior, timeout path, and post-trigger replay resistance. |
| `test/08_Trigger_Protocol.test.js` | Trigger execution authorization, zero-offender neutrality, multi-execution behavior, and stored record immutability. |
| `test/07_jury_selection.test.js` | Jury selection neutrality, vote failure neutrality, unresolved verdict behavior, and completed verdict immutability. |
| `test/06_asset_freeze.test.js` | Reclaim transfer atomicity, duplicate transfer replay resistance, and SWF accounting preservation. |
| `test/03_sovereign_wealth_fund.test.js` | SWF deposit continuity, invalid deposit neutrality, L1 withdrawal exact-once accounting, over-withdrawal neutrality, and replay resistance. |
| `test/23_Price_Oracle.test.js` | PriceOracle stale read neutrality, repeated feeder accounting, and invalid zero-price submission neutrality. |
| `test/09_api3_oracle.test.js` | API3-to-Kernel propagation, duplicate report behavior, atomic bridge failure, and trigger replay resistance. |

## Remaining Non-Blocking Gaps

The following items are non-blocking Step-4 audit candidates, not Step-3 blockers:

- PriceOracle invalid confidence submission neutrality against stored price and feeder submission state.
- PriceOracle unauthorized submission neutrality against stored price and feeder accounting.
- API3 invalid code and invalid offender neutrality against oracle flag count and Kernel state.
- Stale-submission aggregation behavior where stale feeder submissions must not overwrite a newer aggregate unless enough fresh feeders exist.

## Step-3 Readiness Conclusion

Step-3 can be considered functionally complete for runtime hardening. The implemented coverage protects the major runtime boundaries called out for Kernel, TriggerProtocol, JurySelection, AssetFreeze/reclaim, SWF accounting, PriceOracle, and API3 bridge behavior.

This conclusion is based on test-backed invariant coverage. It does not claim formal verification is complete.

## Step-4 Formalization Target

Step-4 should formalize the hardened runtime model by converting the matrix into an explicit invariant specification:

- Define each protected state transition.
- Define forbidden mutations for failed and replayed calls.
- Link every invariant to test evidence.
- Mark non-blocking audit candidates for either additional tests or later formal methods.
- Preserve existing doctrine, architecture, thresholds, timeouts, trigger codes, and sovereign resilience assumptions.
