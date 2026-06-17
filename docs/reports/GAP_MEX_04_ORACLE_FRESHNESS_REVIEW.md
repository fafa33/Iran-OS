# GAP-MEX-04 — Oracle Freshness Review
## Data Freshness Enforcement at Reserve Sync Call Boundary

**Gap ID:** GAP-MEX-04 (freshness aspect — see note below)
**Date:** 2026-06-17
**Status:** OPEN — freshness gap at `syncReserves` call boundary; `flagViolation` staleness guard verified present and correctly implemented; no contract change permissible in this review
**Related Invariant:** MEX-04 (Accounting)
**Category:** Architecture / Governance
**Risk Level:** Medium
**Prior register:** [`RESERVE_RUNTIME_GAP_REGISTER.md`](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)
**Prior disposition note:** [`CF1_BREACH_DETECTION_DISPOSITION.md`](./CF1_BREACH_DETECTION_DISPOSITION.md) — "oracle data freshness at call boundary — stale data accepted without timestamp check; out of scope"

---

## Scope Note

The `RESERVE_RUNTIME_GAP_REGISTER.md` entry for GAP-MEX-04 describes the primary gap as "Non-self-referential composition of `totalReserves`" (Accounting category). The `CF1_BREACH_DETECTION_DISPOSITION.md` "What Remains Open" table cross-references GAP-MEX-04 under the label "oracle data freshness at call boundary." These are related but distinct aspects of the same gap:

- **Composition aspect** (primary register entry): no on-chain proof that `totalReserves` excludes self-referential or ineligible value. Remains open; requires provenance-tracking infrastructure to close; out of scope for this review.
- **Freshness aspect** (this review): no timestamp gate on the `syncReserves` path; a feeder may submit reserve values of arbitrary age. This review addresses the freshness aspect only.

Both aspects share the same root cause: `updateReserves` accepts a bare `uint256` with no provenance or temporal qualification. Closing the freshness aspect does not close the composition aspect.

---

## Disclaimers

- This document does not claim production readiness.
- This document does not close GAP-MEX-04. The freshness gap requires a contract change to close; this review is docs-only per scope constraints.
- This document does not modify any contract, test, threshold, role, or deployment wiring.
- This document does not close any STEP9-BLOCK-* blocker.
- This document does not claim external audit completion or formal verification completion.

---

## Contracts Reviewed

| Contract | Path | Review Focus |
|---|---|---|
| `API3Oracle.sol` | `contracts/oracles/API3Oracle.sol` | `syncReserves`, `flagViolation`, `MAX_DATA_AGE`, `updateData` |
| `IranOS_Kernel` | `contracts/kernel.sol` | `syncReserves` |
| `PahlaviToken` | `contracts/monetary/PahlaviToken.sol` | `updateReserves`, `reserveCompliant` |

---

## Freshness Enforcement Map

Each of the ten required review scope items is assessed below.

### 1. Freshness Configuration

**`API3Oracle.MAX_DATA_AGE = 1 hours`** — defined as a `public constant` (line ~26 in `API3Oracle.sol`). This is the single freshness threshold in the system.

**Coverage:** Applied only to the `flagViolation` path. Not applied to `syncReserves`, `updateData`, or any reserve-sync step.

**Finding (scope 1):** Freshness configuration exists (`MAX_DATA_AGE = 1 hours`) but is scoped to `flagViolation` only. The `syncReserves` path has no freshness configuration.

---

### 2. Staleness Detection

**Present — `flagViolation` path:**

```solidity
require(
    block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE,
    "API3Oracle: stale data feed"
);
```

This check in `API3Oracle.flagViolation` detects staleness of the PAH_USD price feed before permitting a violation flag. The staleness check uses the timestamp of the last `updateData` call for the `PAH_USD_KEY` key.

**Absent — `syncReserves` path:**

```
feeder → API3Oracle.syncReserves(newReserves)     [no timestamp check]
→ Kernel.syncReserves(newReserves)                [no timestamp check]
→ PahlaviToken.updateReserves(newReserves)         [no timestamp check]
```

None of the three functions in the reserve sync path check when the `newReserves` value was last updated in the oracle's `dataPoints` mapping, nor do they validate the age of the submitted value relative to `block.timestamp`.

**Finding (scope 2):** Staleness detection is present on the `flagViolation` path (PAH_USD_KEY age check). Staleness detection is absent on the entire `syncReserves` path.

---

### 3. Stale Update Rejection

**Present — `flagViolation`:** A `flagViolation` call submitted when `PAH_USD_KEY` data is older than `MAX_DATA_AGE` is **rejected** with `"API3Oracle: stale data feed"`. The rejection is pre-execution; no oracle-level flag is recorded and no Kernel violation is created.

**Absent — `syncReserves`:** A `syncReserves` call submitted with any `newReserves` value — regardless of when that value was last reported by a feeder — is **accepted** and applied to `PahlaviToken.totalReserves`. There is no rejection mechanism.

**Finding (scope 3):** Stale update rejection exists for `flagViolation`. No stale update rejection exists for `syncReserves`.

---

### 4. Timestamp Validation

**Present — `updateData`:** `DataPoint.timestamp = block.timestamp` is set on every `updateData` call. The timestamp field is stored per key in `dataPoints`.

**Present — `flagViolation`:** The `flagViolation` staleness check explicitly validates the timestamp: `block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE`.

**Absent — `syncReserves`:** Neither `API3Oracle.syncReserves` nor `Kernel.syncReserves` nor `PahlaviToken.updateReserves` references any oracle `DataPoint.timestamp`. The submitted `newReserves` value arrives as a bare `uint256` with no timestamp qualification. The Kernel emits `ReserveSynced(caller, newReserves, block.timestamp)` — recording the *delivery* timestamp — but this is an audit log, not a validity gate.

**Finding (scope 4):** Oracle timestamps are stored per data key and validated for the `flagViolation` path. Timestamps are not validated on the `syncReserves` path. The `ReserveSynced` event records delivery time but is not a validity gate.

---

### 5. Replay Resistance

**Partial — `flagViolation`:** The staleness gate provides indirect replay resistance: replaying a `flagViolation` call after `MAX_DATA_AGE` has elapsed since the last `updateData` will be rejected. The gate does not prevent replay within the freshness window.

**Absent — `syncReserves`:** A feeder may replay any previously-submitted `newReserves` value at any time. The call is accepted and `totalReserves` is set to that value. An older (higher) value from a period of higher reserves can be replayed to inflate `totalReserves` above the current legitimate value. The practical attack requires:

1. A compromised or malicious feeder EOA holding `FEEDER_ROLE` on `API3Oracle`.
2. Knowledge of a prior reserve figure higher than the current legitimate value.
3. Intent to inflate `totalReserves` to unlock a mint that would otherwise be blocked by `reserveCompliant`.

The `onlyFeeder` gate (`API3Oracle.syncReserves`) and `onlyOracle` gate (`Kernel.syncReserves`) constrain the attack surface to authorized feeder addresses. Replay without role compromise is impossible. Replay with role compromise would be a governance-level breach.

**Finding (scope 5):** Replay resistance on `flagViolation` is partial (staleness window). Replay resistance on `syncReserves` is absent — bounded by role gate only.

---

### 6. Delayed Oracle Delivery

If a feeder submits a reserve value that is legitimately delayed (e.g., network lag, batch submission), the submitted value is accepted without penalty on the `syncReserves` path. There is no maximum latency window. A value submitted 24 hours after it was computed by the feeder is treated identically to one submitted immediately.

This is a design consequence of `syncReserves` having no temporal gate. The audit trail (`ReserveSyncForwarded` and `ReserveSynced` events) provides post-hoc visibility into delivery latency, but no on-chain rejection occurs.

**Finding (scope 6):** No maximum latency on `syncReserves`. Delayed delivery is accepted silently. Events provide delivery-time visibility (not validity enforcement).

---

### 7. Missing Oracle Updates

If a feeder stops submitting reserve updates, `PahlaviToken.totalReserves` remains at the last submitted value indefinitely. There is no on-chain mechanism to:
- Detect that no update has been received within a window.
- Mark the reserve figure as stale.
- Block minting when reserves have not been updated recently.

The `reserveFloorBreached` flag in `PahlaviToken` detects when a submitted reserve figure causes a sub-floor ratio, but does not detect the absence of updates.

Governance monitoring (per GAP-MEX-06 monitoring specification, Domain 1) must surface this condition to a human oracle operator who can decide whether the silence represents an outage or an intentional pause.

**Finding (scope 7):** No on-chain staleness detection for missing updates. `totalReserves` persists at last known value with no expiry. Off-chain monitoring (Domain 1, GAP-MEX-06 specification) is the sole detection mechanism.

---

### 8. Oracle Outage Behavior

During an oracle outage (feeder unavailable, network partition, scheduled maintenance):

- `totalReserves` remains at the last successfully submitted value.
- `reserveCompliant` continues to gate minting against that last value.
- New mints remain possible if the last reserve figure is sufficient to pass the ratio check.
- `flagViolation` becomes blocked (staleness gate will reject calls once `PAH_USD_KEY` exceeds `MAX_DATA_AGE`).
- `syncReserves` remains callable if connectivity is restored and feeders recover.

**Continuity doctrine alignment:** `Kernel.syncReserves` is intentionally exempt from `notLocked()` — the emergency lock does not block reserve reporting. This ensures reserve truth remains available during constitutional crises. The same design implies outage tolerance: the system does not freeze on oracle absence.

**Risk during outage:** If the last reserve value was inflated (or if the feeder is delayed in reporting a reserve decline), the minting gate continues to operate against a stale-high figure. The `reserveFloorBreached` detection is only triggered by an `updateReserves` call that reports a sub-floor value — it cannot be triggered by the absence of an update.

**Finding (scope 8):** Outage behavior is safe under continuity doctrine (no freeze, no block). Reserve figure persists at last known value. Risk: post-outage minting window if last reserves were inflated or have since declined off-chain.

---

### 9. Reserve Sync Behavior During Stale Conditions

A "stale condition" is any state in which `PahlaviToken.totalReserves` does not accurately reflect current real-world reserve holdings because the most recent oracle submission is outdated.

Under stale conditions:

- **`syncReserves` continues to accept calls.** A new reserve value can be submitted at any time.
- **`updateReserves` is `onlyKernel`** — only API3Oracle (via Kernel) can update it. A direct call from any other address fails.
- **`reserveCompliant` checks the stale figure.** Minting is gated against `totalReserves` as last reported, not against current real-world state. If `totalReserves` is stale-high, mints that exceed the true backing may be permitted.
- **`reserveFloorBreached` is not set.** Stale-high reserves do not trigger breach detection — breach detection fires only when `updateReserves` is called with a sub-floor value.
- **Emergency lock is not activated.** Stale reserves alone cannot activate the emergency lock.

The asymmetry between `syncReserves` (no staleness gate) and `flagViolation` (has staleness gate) means:
- Reserve updates can occur with stale data.
- Violation flags cannot occur with stale data.

This asymmetry is architecturally intentional: violation flagging is a constitutional act that requires current evidence context; reserve reporting is a data function that must remain available regardless of data freshness.

**Finding (scope 9):** Reserve sync under stale conditions is unprotected — stale values are accepted. This is an open gap. The asymmetry with `flagViolation` is intentional and doctrine-consistent.

---

### 10. Trigger Interaction During Stale Conditions

**`flagViolation` path — blocked during staleness:**

```solidity
require(
    block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE,
    "API3Oracle: stale data feed"
);
```

After `MAX_DATA_AGE` elapses without a `PAH_USD_KEY` update, a feeder cannot call `API3Oracle.flagViolation`. This prevents the trigger lifecycle from being initiated with stale context. The feeder must first call `API3Oracle.updateData(PAH_USD_KEY, ...)` to refresh the price feed, then call `flagViolation`.

**`syncReserves` path — unblocked during staleness:**

Stale reserve updates do not interact with the trigger lifecycle. `syncReserves` is a data-forwarding function only. It does not call `flagViolation`, does not call `executeTrigger`, and does not set `emergencyLockActive`. The trigger lifecycle remains human-mediated regardless of reserve freshness.

**Stale reserves cannot trigger:**

- `syncReserves` writes `totalReserves` but emits no trigger.
- `updateReserves` writes `totalReserves`, emits `ReserveFloorBreached` if below floor, but does not call any trigger function.
- The path from `ReserveFloorBreached` to `flagViolation` requires a human operator (per GAP-MEX-06 monitoring specification FND-10).

**Finding (scope 10):** Trigger interaction under stale conditions is protected — `flagViolation` is blocked when `PAH_USD_KEY` is stale. Stale reserves cannot directly create trigger outcomes. The human judgment gap between breach observation and violation flagging is preserved.

---

## Freshness Enforcement Point Summary

| Enforcement Point | Contract | Function | Present |
|---|---|---|:---:|
| `MAX_DATA_AGE = 1 hours` | `API3Oracle` | Constant | ✓ |
| Staleness check on `flagViolation` | `API3Oracle` | `flagViolation` | ✓ |
| Timestamp stored on `updateData` | `API3Oracle` | `updateData` | ✓ |
| Staleness check on `syncReserves` | `API3Oracle` | `syncReserves` | ✗ |
| Staleness check on Kernel `syncReserves` | `IranOS_Kernel` | `syncReserves` | ✗ |
| Staleness check on `updateReserves` | `PahlaviToken` | `updateReserves` | ✗ |
| Maximum reserve-submission age | Any | Any | ✗ |
| Missing-update detection | Any | Any | ✗ |

---

## Stale-Data Rejection Point Summary

| Rejection Point | Path | Reject Condition |
|---|---|---|
| `API3Oracle.flagViolation` | Violation flagging | `PAH_USD_KEY` older than `MAX_DATA_AGE` |
| None on `syncReserves` path | Reserve sync | — (no rejection) |

---

## Authority Neutrality Analysis

Each authority neutrality property was verified against the contract code:

| Property | Verified | Basis |
|---|---|---|
| Stale oracle data cannot mutate reserve state through a non-role path | ✓ | `updateReserves` is `onlyKernel`; `syncReserves` is `onlyOracle`; `syncReserves` on API3Oracle is `onlyFeeder` — role gates are not bypassed by staleness |
| Stale oracle data cannot bypass Kernel controls | ✓ | `onlyOracle` on `Kernel.syncReserves` is independent of data freshness; a stale-data call must still hold `ORACLE_ROLE` |
| Freshness acts as a validity gate only | ✓ | The `MAX_DATA_AGE` check gates `flagViolation` but creates no authority; passing the check does not grant a role |
| Freshness creates no authority | ✓ | `MAX_DATA_AGE` is a rejection gate; there is no "freshness-proven" authority escalation path |
| Timestamp values do not create authority | ✓ | `DataPoint.timestamp` is stored for auditability and checked for staleness; it does not appear in any role-grant or authority-delegation logic |
| Stale data cannot create alternate execution paths | ✓ | `syncReserves` is data-forwarding only; stale values do not route to `executeTrigger`, `flagViolation`, `freeze`, `mint`, or `burn` |
| Stale data cannot create treasury mutations | ✓ | Treasury functions (`executeTransaction`, `withdraw`) are `KERNEL_ROLE`/`COUNCIL_ROLE` gated; no stale-data path reaches them |
| Stale data cannot create monetary mutations | **Partial** | `syncReserves` with stale-inflated reserves can raise `totalReserves`, enabling a `mint` that would otherwise fail `reserveCompliant`. `mint` still requires `MINTER_ROLE`. The monetary mutation (mint) requires both a compromised feeder and a compromised SWF. See Risk Assessment below. |
| Stale conditions fail safely | ✓ | If reserves are stale-low, minting is blocked by `reserveCompliant`. If reserves are stale-high, the risk is as described. Oracle outage does not freeze the system. |
| Outage behavior preserves continuity doctrine | ✓ | `syncReserves` is exempt from `notLocked()`; reserve reporting is available during emergency lock; no hard stop on oracle absence |

---

## Risk Assessment

**Risk: Stale-inflated reserves enabling unauthorized minting**

- **Attack vector:** A feeder holding `FEEDER_ROLE` on `API3Oracle` submits a `newReserves` value higher than the current legitimate reserve level. The inflated figure passes to `PahlaviToken.totalReserves`. An SWF address holding `MINTER_ROLE` calls `mint`. The `reserveCompliant` check passes because it checks `totalReserves` (now stale-inflated) against the new supply.
- **Constraints:** Requires both (a) a compromised feeder EOA and (b) a compromised SWF address. These are independent roles with independent key custody. A single-key compromise is insufficient.
- **Mitigations:** `FEEDER_ROLE` is granted at constructor time (Codex P1); post-deploy feeder changes require Kernel governance. `MINTER_ROLE` is held by the SWF contract, not an EOA. Monitoring (Domain 1 per GAP-MEX-06 specification) surfaces unexpected `totalReserves` changes to human operators.
- **Risk level:** Medium — constrained by two independent role requirements; not exploitable by a single compromised key.

**Risk: `flagViolation` blocked during oracle outage**

- **Scenario:** Oracle feeder is unavailable. `PAH_USD_KEY` ages past `MAX_DATA_AGE`. A constitutional violation occurs during the outage window.
- **Impact:** A feeder cannot flag the violation via `API3Oracle.flagViolation` until they refresh the price feed. During the outage, the violation cannot be escalated through the oracle path.
- **Mitigations:** `Kernel.flagViolation` can be called directly by any `ORACLE_ROLE` holder. If API3Oracle is the only ORACLE_ROLE holder, the operator must refresh the PAH_USD_KEY feed before flagging. The 72-hour `TRIGGER_TIMEOUT` provides a response window. This is a liveness risk, not a safety risk.
- **Risk level:** Low-Medium — outage + constitutional violation is a compound scenario; 72-hour window provides recovery time.

**Risk: Missing reserve updates during outage**

- **Scenario:** Reserve value declines in the real world but feeder does not update `totalReserves`. `reserveFloorBreached` is never set. Minting continues against stale-high reserves.
- **Impact:** The on-chain `reserveCompliant` check operates against a stale figure. A post-outage reserve update will trigger `ReserveFloorBreached` if the real value is sub-floor — but the window between decline and detection is unquantified.
- **Mitigations:** Governance monitoring (GAP-MEX-06 Domain 1) should alert on absence of reserve updates within a governance-defined window. The feeder's operational SLA (recommended follow-up action, GAP-MEX-06 §Recommended Follow-Up Actions) is the primary defense.
- **Risk level:** Medium — depends entirely on oracle operator response time.

---

## Unresolved Freshness Gap

**Gap: No freshness gate on `syncReserves` path**

| Gap | Location | Nature |
|---|---|---|
| No timestamp validation on reserve submission | `API3Oracle.syncReserves`, `Kernel.syncReserves`, `PahlaviToken.updateReserves` | Contract gap — requires code change to close |
| No maximum reserve-submission age | All three functions above | Contract gap — requires code change to close |
| No missing-update detection | `PahlaviToken` / Kernel | Contract gap — requires code change to close |

Closing any of these gaps requires adding timestamp state to the oracle submission protocol — e.g., requiring feeders to submit `(newReserves, reportedAt)` and validating `block.timestamp - reportedAt <= MAX_DATA_AGE`. This is a materially larger change than this docs-only review can address. It would require:

1. Modifying `API3Oracle.syncReserves` to accept and validate a timestamp parameter.
2. Modifying `Kernel.syncReserves` and `IPahlaviToken.updateReserves` to forward and validate the timestamp.
3. Modifying `PahlaviToken.updateReserves` to enforce the age gate.
4. Adding deployment manifest documentation for the new parameter.
5. Adding parity tests for the full freshness path.

This scope is explicitly out of bounds for the current docs-only review.

---

## Test Coverage Assessment

| Behavior | Test File | Test ID | Coverage |
|---|---|---|---|
| `MAX_DATA_AGE = 1 hours` | `test/09_api3_oracle.test.js` | CLC-03 / `MAX_DATA_AGE constant equals 1 hour` | ✓ |
| `flagViolation` rejected when `PAH_USD_KEY` stale | `test/09_api3_oracle.test.js` | CLC-03 / `flagViolation reverts when PAH_USD_KEY feed is older than MAX_DATA_AGE` | ✓ |
| `flagViolation` succeeds after feed refresh | `test/09_api3_oracle.test.js` | CLC-03 / `flagViolation succeeds after feeder refreshes PAH_USD_KEY` | ✓ |
| `syncReserves` accepts stale reserve value | None | — | ✗ (gap uncharacterized) |
| `syncReserves` has no maximum age check | None | — | ✗ (gap uncharacterized) |
| Reserve sync during oracle outage | None | — | ✗ (gap uncharacterized) |

The absence of characterization tests for `syncReserves` freshness behavior means the gap is untested. No test can close the gap (a missing gate cannot be tested for correct behavior), but characterization tests can document the boundary:

> "syncReserves accepts a reserve value submitted N hours ago without rejection" — this would be a valid characterization test for a future hardening PR.

Adding characterization tests is not strictly required for this docs-only review. They are recommended for a future hardening PR that adds the freshness gate.

---

## GAP-MEX-04 Freshness Disposition

**Status: OPEN**

The oracle freshness enforcement at the `syncReserves` call boundary is incomplete. Specifically:

- The `flagViolation` staleness guard (`MAX_DATA_AGE = 1 hours` on `PAH_USD_KEY`) is **correctly implemented and tested**. This portion of freshness enforcement is verified complete.
- The `syncReserves` path (feeder → API3Oracle → Kernel → PahlaviToken) has **no freshness gate** at any of the three call boundaries. Stale reserve values are accepted and applied to `totalReserves` without age validation.
- No maximum reserve-submission age exists. No missing-update detection exists.
- The gap creates a Medium-risk window for stale-inflated reserve submissions (requires two independent role compromises to exploit monetarily).
- The gap cannot be closed by documentation alone — it requires a contract change to add timestamp validation to the `syncReserves` path.
- The composition aspect of GAP-MEX-04 (primary register entry) remains separately open and is not addressed by this review.

**What would close the freshness aspect:** A contract-level change adding timestamp validation to `API3Oracle.syncReserves` (e.g., `require(block.timestamp - reportedAt <= MAX_DATA_AGE, "API3Oracle: stale reserve data")` with a `reportedAt` parameter), propagated through `Kernel.syncReserves` and `PahlaviToken.updateReserves`, with matching deployment manifest documentation and parity tests. This is a future hardening scope item, not a docs-only deliverable.

---

## Recommended Follow-Up Actions

| Action | Priority | Nature |
|---|---|---|
| Add characterization tests for `syncReserves` freshness behavior (no gate, accepts any age) | Medium | Test — documents current boundary |
| Future hardening: add `reportedAt` parameter to `syncReserves` with `MAX_DATA_AGE` validation | Low | Contract change — separate scoped PR required |
| Oracle operator SLA: define maximum reserve-submission interval (governance SLA, not on-chain gate) | Medium | Governance — per GAP-MEX-06 Domain 1/3 |
| Review whether PAH_USD_KEY is the correct staleness proxy for `flagViolation` (or if a dedicated "oracle liveness" signal is needed) | Low | Doctrine review |
| Confirm that the two-role requirement (feeder + SWF) is correctly understood as a dual-compromise requirement, not a single-admin path | Low | Audit verification |

---

*Report date: 2026-06-17*
*Branch: claude/dependabot-pr-cleanup-neu16i*
*No contracts modified. Documentation-only.*
*Prior register: `docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md`*
*Prior disposition note: `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`*
*Contracts reviewed: `contracts/oracles/API3Oracle.sol`, `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol`*
*Test file reviewed: `test/09_api3_oracle.test.js`*
