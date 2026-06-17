# GAP-MEX-04 — Oracle Freshness Review (Step 13)
## Data Freshness Enforcement at Reserve Sync Call Boundary

**Gap ID:** GAP-MEX-04 (freshness aspect — see Scope Note)
**Date:** 2026-06-17 (Step 13 revision: 2026-06-17)
**Status:** OPEN — freshness gate absent on `syncReserves` path; stale data can mutate `totalReserves`; two-role exploit constraint present; no contract change permissible in this review
**Related Invariant:** MEX-04 (Accounting)
**Category:** Architecture / Governance
**Risk Level:** Medium
**Prior register:** [`RESERVE_RUNTIME_GAP_REGISTER.md`](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)
**Prior disposition:** [`CF1_BREACH_DETECTION_DISPOSITION.md`](./CF1_BREACH_DETECTION_DISPOSITION.md) — "oracle data freshness at call boundary — stale data accepted without timestamp check; out of scope"

---

## Disclaimers

- This document does not claim production readiness.
- This document does not close GAP-MEX-04. The freshness gap requires a contract change to close; this review is audit-and-findings only.
- This document does not modify any contract, test, threshold, role, or deployment wiring.
- This document does not close any STEP9-BLOCK-* blocker.
- This document does not claim external audit completion or formal verification completion.

---

## Scope Note

The `RESERVE_RUNTIME_GAP_REGISTER.md` entry for GAP-MEX-04 describes the primary gap as "Non-self-referential composition of `totalReserves`" (Accounting). The `CF1_BREACH_DETECTION_DISPOSITION.md` cross-references GAP-MEX-04 as "oracle data freshness at call boundary." These are related but distinct:

- **Composition aspect** (primary register entry): no on-chain proof that `totalReserves` excludes self-referential or ineligible value. Remains open; requires provenance-tracking infrastructure to close; out of scope for this review.
- **Freshness aspect** (this review): no timestamp gate on the `syncReserves` path; a feeder may submit reserve values of arbitrary age. This review addresses the freshness aspect only.

Both aspects share the same root cause: `updateReserves` accepts a bare `uint256` with no provenance or temporal qualification. Closing the freshness aspect does not close the composition aspect.

---

## Architecture Under Review

```
feeder
  → API3Oracle.syncReserves(newReserves)     [onlyFeeder]   — no timestamp check
  → Kernel.syncReserves(newReserves)         [onlyOracle]   — no timestamp check
  → PahlaviToken.updateReserves(newReserves) [onlyKernel]   — no timestamp check
  → PahlaviToken.totalReserves = newReserves
```

Compared to:

```
feeder
  → API3Oracle.flagViolation(offender, code, reason)  [onlyFeeder]
  → require(block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE)
  → Kernel.flagViolation(code, offender, reason)      [onlyOracle]
```

---

## Contracts Reviewed

| Contract | Path | Review Focus |
|---|---|---|
| `API3Oracle` | `contracts/oracles/API3Oracle.sol` | `syncReserves`, `flagViolation`, `MAX_DATA_AGE`, `updateData` |
| `IranOS_Kernel` | `contracts/kernel.sol` | `syncReserves`, `notLocked` exemption |
| `PahlaviToken` | `contracts/monetary/PahlaviToken.sol` | `updateReserves`, `reserveCompliant`, `mint`, emergency gate |
| `Treasury` | `contracts/monetary/Treasury.sol` | Role isolation from oracle freshness |
| `SovereignWealthFund` | `contracts/monetary/SovereignWealthFund.sol` | Role isolation; `MINTER_ROLE` path to `mint` |

---

## Required Verification

| Property | Verified | Evidence |
|---|---|---|
| Stale data can reach `API3Oracle.syncReserves` | **YES** | No freshness gate; `onlyFeeder` is the sole guard (FND-01) |
| Stale data can reach `Kernel.syncReserves` | **YES** | No freshness gate; `onlyOracle` is the sole guard (FND-01) |
| Stale data can reach `PahlaviToken.updateReserves` | **YES** | No freshness gate; `onlyKernel` is the sole guard (FND-01) |
| Stale data can mutate reserve accounting | **YES** | `totalReserves = newReserves` executes unconditionally given role (FND-02) |
| Stale data can mutate treasury accounting | **NO** | Treasury has no oracle input path; role-gated independently (FND-06) |
| Stale data can influence trigger outcomes | **NO DIRECT PATH** | `syncReserves` is data-only; `flagViolation` blocked when stale; human judgment required (FND-09) |
| Freshness creates authority | **NO** | `MAX_DATA_AGE` is rejection gate only; no authority-grant branch on pass (FND-10) |
| Timestamps create authority | **NO** | `DataPoint.timestamp` not referenced in any role-grant path (FND-10) |
| Stale conditions create alternate execution paths | **NO** | Stale `totalReserves` does not route to trigger, freeze, or emergency lock (FND-13) |
| Outage conditions create alternate execution paths | **NO** | Oracle/feeder absence does not activate any automated path (FND-13) |
| Replayed oracle data can bypass freshness controls | **YES** | No nonce, no sequencing constraint, no minimum-advance on `syncReserves` (FND-03) |

---

## Eleven-Scope Freshness Review

### Scope 1 — Freshness Configuration

`API3Oracle.MAX_DATA_AGE = 1 hours` — defined as `public constant` (line 30). This is the single on-chain freshness threshold in the system.

**Applied to:** `flagViolation` path only.

**Not applied to:** `syncReserves`, `updateData`, or any step in the reserve sync path.

---

### Scope 2 — Stale-Data Rejection Points

**Present — `flagViolation`:**

```solidity
require(
    block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE,
    "API3Oracle: stale data feed"
);
```

Rejection is pre-execution: no oracle flag is recorded, no Kernel violation is created.

**Absent — `syncReserves` path:**

```
API3Oracle.syncReserves(newReserves)        → no check
Kernel.syncReserves(newReserves)            → no check
PahlaviToken.updateReserves(newReserves)    → no check
```

The `ReserveSynced(caller, newReserves, block.timestamp)` event records delivery time but is an audit log, not a validity gate.

---

### Scope 3 — Timestamp Validation

**Present:** `DataPoint.timestamp = block.timestamp` stored on each `updateData` call. Validated in `flagViolation` via age check.

**Absent on `syncReserves` path:** `newReserves` arrives as a bare `uint256`. No oracle key timestamp, no external `reportedAt` parameter, no `block.timestamp` minimum-advance check exists at any of the three call boundaries.

---

### Scope 4 — Replay Resistance

**`flagViolation` — partial:** The staleness window provides indirect replay resistance outside `MAX_DATA_AGE`. Replay within the window is not prevented.

**`syncReserves` — absent:** A feeder may replay any previously submitted `newReserves` value at any time. No nonce, no monotonicity requirement, no sequencing constraint. A value representing reserves from a prior high-watermark period can be resubmitted to inflate `totalReserves` above the current legitimate level. Role gate (`onlyFeeder`) is the only constraint. Role compromise makes replay fully exploitable.

---

### Scope 5 — Delayed Oracle Delivery

No maximum latency exists on the `syncReserves` path. A value computed 24 hours before submission is treated identically to one submitted immediately. The `ReserveSyncForwarded` and `ReserveSynced` events record delivery time; off-chain monitoring can measure latency but no on-chain rejection occurs.

---

### Scope 6 — Oracle Outage Behavior

During an oracle infrastructure outage (API3 node unavailable, Airnode down):

- `totalReserves` remains at last submitted value.
- `reserveCompliant` continues to gate minting against that stale figure.
- `flagViolation` is **additionally blocked** once `PAH_USD_KEY` exceeds `MAX_DATA_AGE` — the feeder must call `updateData(PAH_USD_KEY, ...)` before `flagViolation` becomes callable again.
- `syncReserves` is callable if any authorized feeder can reach the network.
- `Kernel.syncReserves` is exempt from `notLocked()` — reserve reporting is available during emergency lock.

**Continuity doctrine alignment:** The system does not freeze on oracle absence. Reserve truth is always recordable. The liveness risk is that violation escalation is blocked during a compound outage + constitutional event scenario.

---

### Scope 7 — Feeder Outage Behavior

If the feeder EOA is unavailable (key loss, network isolation, compromise response, planned rotation):

- `API3Oracle.syncReserves` cannot be called — no authorized caller.
- `API3Oracle.flagViolation` cannot be called — no authorized caller.
- `totalReserves` remains at last submitted value indefinitely.
- After `MAX_DATA_AGE`, `flagViolation` would be additionally blocked even upon recovery (price feed must be refreshed first).
- **Recovery path:** Adding a new feeder post-deploy requires `grantRole(FEEDER_ROLE, newFeeder)` on `API3Oracle`. `DEFAULT_ADMIN_ROLE` on `API3Oracle` is held by the Kernel (constructor line 74). A new feeder requires a Kernel governance action (`grantOfficialAccess` → `grantRole`), which in turn requires a Sovereign acting without an emergency lock (`onlySovereign notLocked` on Kernel setter). If emergency lock is active, feeder rotation is blocked.

**Interaction with emergency lock:** If feeder outage triggers emergency lock (via a separate `flagViolation` path or direct Kernel interaction), feeder rotation via `grantOfficialAccess` becomes unavailable until Court deactivates the lock. This creates a potential deadlock scenario: feeder is down, emergency lock is active, feeder cannot be replaced, reserve reporting is interrupted.

---

### Scope 8 — Reserve Sync Under Stale Conditions

Under stale conditions (`totalReserves` does not reflect current real-world reserves):

- `syncReserves` continues to accept any submitted value — no gate.
- `reserveCompliant` checks `totalReserves` as last submitted. Stale-high reserves may permit minting that should be blocked; stale-low reserves block minting that should be permitted.
- `reserveFloorBreached` is set only by an `updateReserves` call that reports a sub-floor value — not by the absence of updates.
- Emergency lock is not activated by stale reserves.

The asymmetry with `flagViolation` (which blocks on staleness) is architecturally intentional: violation flagging requires current evidence context; reserve reporting is a data function that must remain available regardless of data freshness.

---

### Scope 9 — Trigger Behavior Under Stale Conditions

**`flagViolation` path — blocked during staleness:** `PAH_USD_KEY` stale → `flagViolation` reverts. No oracle flag, no Kernel violation. The trigger lifecycle cannot be initiated through the oracle path with stale context.

**`syncReserves` path — does not reach trigger:** `syncReserves` is data-forwarding only. Neither `Kernel.syncReserves` nor `PahlaviToken.updateReserves` calls `flagViolation`, `executeTrigger`, `emergencyLock`, or any trigger function. `ReserveFloorBreached` emission does not advance the trigger lifecycle — the human judgment gap (GAP-MEX-06 FND-10) is preserved.

Stale reserve values cannot produce trigger outcomes. The trigger lifecycle is protected.

---

### Scope 10 — Treasury Behavior Under Stale Conditions

**Treasury functions and their gates:**

| Function | Gate | Oracle Input |
|---|---|---|
| `createBudgetLine` | `PARLIAMENT_ROLE` | None |
| `proposeTransaction` | `GOVERNMENT_ROLE` | None |
| `signTransaction` | `AUDITOR_ROLE` | None |
| `blockAddressByTrigger` | `KERNEL_ROLE` | None |
| `rejectTransaction` | `AUDITOR_ROLE` or `KERNEL_ROLE` | None |

No Treasury function reads `totalReserves`, consults oracle data, or has any call path from oracle events. Treasury state is structurally isolated from oracle freshness.

**Indirect path analysis:** The only monetary link from oracle freshness to Treasury-adjacent behavior is: stale-inflated `totalReserves` → `reserveCompliant` passes → SWF calls `mint` → new Pahlavi tokens exist → Treasury `proposeTransaction` can now propose transactions denominated in the inflated token supply. This is a second-order effect requiring: compromised feeder + compromised SWF MINTER_ROLE + exploitation of newly minted tokens — a three-step compound path with three independent security requirements.

---

### Scope 11 — Continuity Guarantees During Oracle Degradation

| Guarantee | Mechanism | Status |
|---|---|---|
| Reserve reporting available during emergency lock | `Kernel.syncReserves` is exempt from `notLocked()` | **Preserved** |
| Reserve recording available during PahlaviToken emergency mode | `updateReserves` has no `notInEmergency` gate | **Preserved** |
| Minting blocked during emergency mode | `mint` has `notInEmergency` gate | **Preserved** — stale-high reserves cannot be exploited for minting during emergency |
| System does not freeze on oracle absence | No mandatory-update gate; no liveness dependency | **Preserved** |
| Reserve truth recordable during constitutional crisis | `syncReserves` exempt from `notLocked()` | **Preserved** |
| Feeder rotation during emergency lock | `grantOfficialAccess` requires `onlySovereign notLocked` | **BLOCKED** — see FND-12 |

Emergency mode (`emergencyMode` in PahlaviToken) and emergency lock (`emergencyLockActive` in Kernel) are independent states. Emergency mode blocks token transfers and minting. Emergency lock blocks `notLocked`-gated functions. The combination (`emergencyLockActive = true` and `emergencyMode = true`) provides the strongest continuity posture: reserve reporting available, all monetary flows frozen.

---

## Findings

### FND-01 — Freshness Gate Absent on syncReserves Path

**Finding:** `MAX_DATA_AGE = 1 hours` is enforced only on `API3Oracle.flagViolation`. The three-function reserve sync path (`API3Oracle.syncReserves` → `Kernel.syncReserves` → `PahlaviToken.updateReserves`) has no freshness check at any call boundary.

**Impact:** Reserve submissions are accepted regardless of data age. `totalReserves` may be set to a value reflecting real-world state from an arbitrarily distant past.

**Affected Component:** `API3Oracle.syncReserves` (line 103), `Kernel.syncReserves` (line 527), `PahlaviToken.updateReserves` (line 233)

**Disposition:** **OPEN** — requires contract change; timestamp parameter must be threaded through all three functions with an age validation gate

---

### FND-02 — Stale Reserve Values Applied to Sovereign Monetary State

**Finding:** `PahlaviToken.updateReserves(newReserves)` executes `totalReserves = newReserves` unconditionally (given role). There is no precondition on when `newReserves` was determined in the real world.

**Impact:** `totalReserves` — the foundational input to `reserveCompliant` — is not guaranteed to reflect current real-world reserve holdings. The reserve ratio check may approve minting against stale backing.

**Affected Component:** `PahlaviToken.updateReserves` (line 233–248), `PahlaviToken.reserveCompliant` (line 105–113), `PahlaviToken.totalReserves`

**Disposition:** **OPEN** — root cause is the absence of a timestamp gate on FND-01

---

### FND-03 — Replay of Prior Reserve Values Not Prevented

**Finding:** No nonce, no monotonicity requirement, no sequencing constraint on `API3Oracle.syncReserves`. A feeder may resubmit any `newReserves` value previously used. A historically higher reserve figure can be replayed to inflate `totalReserves` above the current legitimate level.

**Impact:** Stale-inflated replay can unlock minting that would otherwise fail `reserveCompliant`. Exploit requires a compromised `FEEDER_ROLE` EOA.

**Affected Component:** `API3Oracle.syncReserves` (line 103)

**Disposition:** **OPEN** — bounded by role gate only; role compromise makes replay fully exploitable

---

### FND-04 — flagViolation Blocked During PAH_USD_KEY Staleness

**Finding:** `API3Oracle.flagViolation` checks `block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE`. After `MAX_DATA_AGE` (1 hour) elapses since the last `updateData(PAH_USD_KEY, ...)`, all `flagViolation` calls revert. Feeder must refresh price feed before escalating.

**Impact:** During oracle outage exceeding 1 hour, constitutional violations cannot be escalated through the oracle path. Liveness risk during compound outage + violation scenario. Safety risk is bounded by the 72-hour `TRIGGER_TIMEOUT` window.

**Affected Component:** `API3Oracle.flagViolation` (lines 111–114)

**Disposition:** **CHARACTERIZED** — intentional design; gate ensures violation context is current; liveness risk is Low-Medium

---

### FND-05 — Missing-Update Detection Absent

**Finding:** `PahlaviToken.totalReserves` persists indefinitely at the last submitted value. No on-chain mechanism exists to detect the absence of updates within any time window, mark reserves as stale, or block minting when reserves have not been updated recently.

**Impact:** Extended feeder silence leaves `totalReserves` stale with no on-chain alert and no automatic protective response. Minting continues against the last known figure.

**Affected Component:** `PahlaviToken` (state variable `totalReserves`), `API3Oracle` (no absence-detection)

**Disposition:** **OPEN** — off-chain monitoring (GAP-MEX-06 Domain 1 and 3) is the sole detection mechanism

---

### FND-06 — Treasury State Isolated from Oracle Freshness

**Finding:** Treasury functions (`createBudgetLine`, `proposeTransaction`, `signTransaction`, `blockAddressByTrigger`, `rejectTransaction`) are gated by `PARLIAMENT_ROLE`, `GOVERNMENT_ROLE`, `AUDITOR_ROLE`, and `KERNEL_ROLE` respectively. No Treasury function reads `totalReserves`, consults any oracle data, or has any call path reachable from oracle events or reserve sync operations.

**Impact:** Stale oracle data cannot directly mutate Treasury accounting state.

**Affected Component:** `Treasury.sol` (all functions)

**Disposition:** **CLOSED** — Treasury is structurally isolated from oracle freshness; no path exists

---

### FND-07 — SWF State Isolated from Oracle Freshness (Direct Path)

**Finding:** SWF functions (`depositToL*/proposeWithdrawal/signWithdrawal/distributeAnnualYield`) are gated by `COUNCIL_ROLE`. No SWF function reads `totalReserves` or oracle timestamps. No call path from oracle events to SWF state mutation exists.

**Impact:** Stale oracle data cannot directly mutate SWF layer balances.

**Affected Component:** `SovereignWealthFund.sol` (all functions)

**Disposition:** **CLOSED** — direct path isolated; see FND-08 for indirect path

---

### FND-08 — Stale Reserves Enable Mint via reserveCompliant — Indirect Monetary Path

**Finding:** `PahlaviToken.mint` checks `reserveCompliant`, which reads `totalReserves`. If `totalReserves` is stale-inflated (via FND-02/FND-03), the `reserveCompliant` check may pass for a mint that would fail against true current reserves. This creates the path: stale oracle submission → inflated `totalReserves` → `mint` permitted → monetary supply expanded against stale backing.

**Constraints:** Requires (a) a compromised `FEEDER_ROLE` EOA submitting inflated reserves AND (b) a compromised `MINTER_ROLE` address (SWF) calling `mint`. These are independent roles with independent key custody. Single-role compromise is insufficient for monetary exploitation.

**Impact:** Medium — monetary supply expansion against stale backing under dual-compromise scenario.

**Affected Component:** `PahlaviToken.mint` (line 175), `PahlaviToken.reserveCompliant` (lines 105–113), `PahlaviToken.totalReserves`

**Disposition:** **OPEN** — root cause is FND-01; two-role requirement is a material constraint; risk is Medium not Critical

---

### FND-09 — Trigger Path Protected from Stale Data

**Finding:** `syncReserves` is data-forwarding only — it does not call `flagViolation`, `executeTrigger`, or any trigger function. `updateReserves` emits `ReserveFloorBreached` but takes no trigger action. The path from `ReserveFloorBreached` to `flagViolation` is human-mediated (GAP-MEX-06 FND-10). Stale `flagViolation` calls are blocked by the `PAH_USD_KEY` age check (FND-04).

**Impact:** No TriggerProtocol contamination risk from stale reserve data. Trigger lifecycle integrity is preserved.

**Affected Component:** `Kernel.syncReserves`, `PahlaviToken.updateReserves`, `API3Oracle.flagViolation`

**Disposition:** **CLOSED** — trigger path is protected from stale data; human judgment gap preserved

---

### FND-10 — Authority Model Neutral to Freshness

**Finding:** All role gates (`onlyFeeder`, `onlyOracle`, `onlyKernel`, `onlyRole(MINTER_ROLE)`, etc.) are independent of data freshness. The `MAX_DATA_AGE` check is a rejection gate; there is no "freshness-proven authority" branch. `DataPoint.timestamp` does not appear in any role-grant, role-check, or authority-delegation logic. Passing the freshness check grants no additional authority.

**Impact:** Oracle freshness enforcement creates no authority escalation paths. Timestamps cannot be used to acquire roles.

**Affected Component:** All contracts reviewed

**Disposition:** **CLOSED** — authority model is clean; no freshness-based authority path exists

---

### FND-11 — Continuity Guarantees Sound

**Finding:** Verified per Scope 11:
- `Kernel.syncReserves` exempt from `notLocked()` — reserve reporting available during emergency lock.
- `PahlaviToken.updateReserves` has no `notInEmergency` gate — reserve data recordable during token emergency.
- `PahlaviToken.mint` has `notInEmergency` — minting blocked during emergency regardless of reserve figure, closing the stale-high exploit window during crises.
- System does not freeze on oracle absence — no mandatory-liveness dependency.

**Impact:** Continuity doctrine is preserved. Reserve truth is always recordable. Monetary expansion is halted during emergency, neutralizing the stale-inflated reserve risk during the most critical scenarios.

**Affected Component:** `Kernel.syncReserves` (line 527), `PahlaviToken.updateReserves` (line 233), `PahlaviToken.mint` (line 175)

**Disposition:** **CLOSED** — continuity guarantees are sound with one exception noted in FND-12

---

### FND-12 — Feeder Rotation Blocked During Emergency Lock

**Finding:** Adding a replacement feeder post-deploy requires `grantRole(FEEDER_ROLE, newFeeder)` on `API3Oracle`. `DEFAULT_ADMIN_ROLE` on `API3Oracle` is held by the Kernel (constructor line 74). Kernel's `grantOfficialAccess` is gated by `onlySovereign notLocked`. If emergency lock is active (`emergencyLockActive = true`), feeder rotation is blocked until the Court calls `deactivateEmergencyLock`.

**Scenario:** Feeder EOA is compromised → emergency lock activated (via TR-01/02/03 `flagViolation` by another path) → compromised feeder cannot be replaced → reserve reporting interrupted → stale `totalReserves` persists → post-outage reserve correction delayed.

**Impact:** Potential operational deadlock during compound feeder-compromise + emergency-lock scenario. Severity is bounded by the Court's ability to deactivate the emergency lock and the 72-hour `TRIGGER_TIMEOUT`.

**Affected Component:** `API3Oracle` (constructor line 74, `DEFAULT_ADMIN_ROLE` to Kernel), `Kernel.grantOfficialAccess` (modifier `notLocked`)

**Disposition:** **OPEN** — operational gap; requires governance awareness; no code change proposed in this review (change would require modifying authority model)

---

### FND-13 — No Alternate Execution Paths from Stale or Outage Conditions

**Finding:** Checked all paths exhaustively:
- Stale `totalReserves` does not activate emergency lock.
- Stale `totalReserves` does not call `TriggerProtocol.executeTrigger`.
- Stale `totalReserves` does not call `flagViolation` (and if PAH_USD_KEY is stale, `flagViolation` is blocked).
- Oracle outage does not activate emergency lock.
- Oracle outage does not create new roles.
- Outage conditions do not create feeder-level authority escalation.
- No timed fallback, no automatic escalation, no oracle-absence trigger exists in any contract.

**Impact:** No alternate execution path risk. System degrades gracefully to a reporting-unavailable state without autonomous action.

**Affected Component:** All contracts reviewed

**Disposition:** **CLOSED** — no alternate execution paths exist

---

## Freshness Enforcement Map

| Enforcement Point | Contract | Function | Present |
|---|---|---|:---:|
| `MAX_DATA_AGE = 1 hours` constant | `API3Oracle` | Constant | ✓ |
| Age check on `flagViolation` | `API3Oracle` | `flagViolation` | ✓ |
| Timestamp stored per key on `updateData` | `API3Oracle` | `updateData` | ✓ |
| Age check on `API3Oracle.syncReserves` | `API3Oracle` | `syncReserves` | ✗ |
| Age check on `Kernel.syncReserves` | `IranOS_Kernel` | `syncReserves` | ✗ |
| Age check on `PahlaviToken.updateReserves` | `PahlaviToken` | `updateReserves` | ✗ |
| Maximum reserve-submission age | Any | Any | ✗ |
| Missing-update detection | Any | Any | ✗ |
| Replay nonce / monotonicity | Any | Any | ✗ |

---

## Stale-Data Rejection Map

| Rejection Point | Path | Reject Condition | Tested |
|---|---|---|:---:|
| `API3Oracle.flagViolation` | Violation flagging | `PAH_USD_KEY` older than `MAX_DATA_AGE` | ✓ CLC-03 |
| `API3Oracle.syncReserves` | Reserve sync | — (no rejection) | ✗ |
| `Kernel.syncReserves` | Reserve sync | — (no rejection) | ✗ |
| `PahlaviToken.updateReserves` | Reserve sync | — (no rejection) | ✗ |

---

## Outage Handling Map

| Outage Type | System Response | Continuity Preserved |
|---|---|---|
| Oracle infrastructure outage | `totalReserves` stale; `flagViolation` blocked after 1h | Yes — no freeze |
| Feeder EOA unavailable | `syncReserves` / `flagViolation` unavailable; `totalReserves` stale | Yes — no freeze |
| Feeder EOA unavailable + emergency lock active | Feeder rotation blocked until Court deactivates lock | Partial — see FND-12 |
| PAH_USD_KEY stale | `flagViolation` blocked; price feed must be refreshed first | Yes — constitutional safety |
| `totalReserves` stale-high | Minting may be over-permitted; `reserveCompliant` uses stale figure | Partial — see FND-08 |
| `totalReserves` stale-low | Minting blocked below true ratio; conservative failure | Yes — fails safe |
| Emergency lock active | Reserve reporting available; minting blocked via `notInEmergency` | Yes — dual protection |

---

## Continuity-Preserving Paths

| Path | Mechanism | Notes |
|---|---|---|
| Reserve reporting during emergency lock | `syncReserves` exempt from `notLocked()` | Sovereign resilience doctrine |
| Reserve recording during token emergency | `updateReserves` has no `notInEmergency` | Reserve truth must remain recordable |
| Mint blocked during token emergency | `mint` has `notInEmergency` | Closes stale-high exploit window during crisis |
| `flagViolation` requires fresh price context | `MAX_DATA_AGE` gate on `PAH_USD_KEY` | Constitutional safety; violation context must be current |
| Trigger lifecycle requires human judgment | `ReserveFloorBreached` → human → `flagViolation` | GAP-MEX-06 FND-10; no automation |

---

## Unresolved Freshness Gaps

| Gap | Location | Nature | Closure Requirement |
|---|---|---|---|
| No timestamp gate on reserve submission | `API3Oracle.syncReserves` | Contract gap | Add `reportedAt` parameter; validate `block.timestamp - reportedAt <= MAX_DATA_AGE` |
| No maximum reserve-submission age | `Kernel.syncReserves`, `PahlaviToken.updateReserves` | Contract gap | Propagate timestamp validation through full path |
| No missing-update detection | `PahlaviToken.totalReserves` | Contract gap | Add last-update timestamp; gate minting if stale beyond threshold |
| No replay prevention on `syncReserves` | `API3Oracle.syncReserves` | Contract gap | Add monotonicity requirement or nonce |
| Feeder rotation blocked during emergency lock | `Kernel.grantOfficialAccess` | Operational/authority gap | Governance awareness; possible carve-out for feeder rotation |

Closing the timestamp gap requires:
1. Modifying `API3Oracle.syncReserves` to accept `(newReserves, reportedAt)` and validate age.
2. Modifying `Kernel.syncReserves` and `IPahlaviToken.updateReserves` to propagate and validate the timestamp.
3. Modifying `PahlaviToken.updateReserves` to enforce the gate.
4. Updating `IPahlaviToken.sol` interface.
5. Deployment manifest documentation for the new parameter.
6. Parity tests for the full freshness path.

This is a materially scoped contract change. It is explicitly a future hardening item, not a docs-only deliverable.

---

## Test Coverage

| Behavior | Test File | Test ID | Coverage |
|---|---|---|:---:|
| `MAX_DATA_AGE = 1 hours` | `test/09_api3_oracle.test.js` | CLC-03 | ✓ |
| `flagViolation` rejected when `PAH_USD_KEY` stale | `test/09_api3_oracle.test.js` | CLC-03 | ✓ |
| `flagViolation` succeeds after feed refresh | `test/09_api3_oracle.test.js` | CLC-03 | ✓ |
| `syncReserves` accepts stale reserve value | None | — | ✗ |
| `syncReserves` has no maximum age check | None | — | ✗ |
| Reserve sync during oracle outage | None | — | ✗ |
| Replay of prior reserve values accepted | None | — | ✗ |
| Feeder rotation blocked during emergency lock | None | — | ✗ |

The three CLC-03 tests covering `flagViolation` staleness are fully characterized and passing. The five uncovered behaviors are gap-characterization items — they document the absence of a gate, not a gate that exists. They are recommended for a future hardening PR.

---

## Findings Summary

| Finding | Category | Disposition | Notes |
|---|---|---|---|
| FND-01 | Freshness gate absent on `syncReserves` | **OPEN** | Root gap; requires contract change |
| FND-02 | Stale reserve values mutate `totalReserves` | **OPEN** | Consequence of FND-01 |
| FND-03 | Replay of prior reserve values possible | **OPEN** | Role-bounded; requires FEEDER_ROLE compromise |
| FND-04 | `flagViolation` blocked during staleness | **CHARACTERIZED** | Intentional; liveness risk Low-Medium |
| FND-05 | Missing-update detection absent | **OPEN** | Off-chain monitoring is sole detector |
| FND-06 | Treasury isolated from oracle freshness | **CLOSED** | No path exists |
| FND-07 | SWF isolated from oracle freshness (direct) | **CLOSED** | No direct path |
| FND-08 | Stale reserves enable mint — indirect path | **OPEN** | Medium risk; two-role constraint |
| FND-09 | Trigger path protected from stale data | **CLOSED** | Human judgment gap preserved |
| FND-10 | Authority model neutral to freshness | **CLOSED** | No freshness-based authority path |
| FND-11 | Continuity guarantees sound | **CLOSED** | Reserve reporting always available |
| FND-12 | Feeder rotation blocked during emergency lock | **OPEN** | Operational gap; no code change proposed |
| FND-13 | No alternate execution paths from stale/outage | **CLOSED** | Exhaustively verified |

**Open findings:** FND-01, FND-02, FND-03, FND-05, FND-08, FND-12 (6 open)
**Characterized:** FND-04 (1)
**Closed:** FND-06, FND-07, FND-09, FND-10, FND-11, FND-13 (6 closed)

---

## GAP-MEX-04 Freshness Disposition

**Status: OPEN**

Closure rules check:

| Rule | Status |
|---|---|
| Freshness enforcement is complete | **NOT MET** — FND-01; no gate on `syncReserves` path |
| Stale data cannot mutate sovereign state | **NOT MET** — FND-02; `totalReserves` accepts stale values |
| No authority escalation exists | **MET** — FND-10; timestamps create no authority |
| No alternate execution path exists | **MET** — FND-13; no alternate paths |
| No unresolved freshness gap remains | **NOT MET** — FND-01, FND-02, FND-03, FND-05, FND-08, FND-12 open |

Three of five closure rules fail. GAP-MEX-04 remains OPEN.

**What would close the freshness aspect:** A contract-level change adding timestamp validation to `API3Oracle.syncReserves` (e.g., a `reportedAt` parameter with `require(block.timestamp - reportedAt <= MAX_DATA_AGE, "API3Oracle: stale reserve data")`), propagated through `Kernel.syncReserves` and `PahlaviToken.updateReserves`, with matching interface update, deployment manifest documentation, and parity tests. This is a future hardening PR, not a docs-only deliverable.

**What this review has established:**
- All freshness gates identified: one present (`flagViolation`), three absent (`syncReserves` path)
- All stale-data rejection points identified: one active, three absent
- All outage handling paths documented (Scopes 6, 7, 11 and FND-11, FND-12)
- All continuity-preserving paths documented and verified sound (except FND-12)
- All unresolved gaps identified: FND-01, FND-02, FND-03, FND-05, FND-08, FND-12
- Treasury and SWF freshness isolation confirmed (FND-06, FND-07)
- Trigger path protection confirmed (FND-09)
- Authority neutrality confirmed (FND-10)
- Alternate execution path risk confirmed zero (FND-13)

---

## Recommended Follow-Up Actions

| Action | Priority | Nature |
|---|---|---|
| Add characterization tests: `syncReserves` accepts stale values; no maximum age; replay accepted | Medium | Test — documents current boundary |
| Future hardening: add `(newReserves, reportedAt)` to `syncReserves` with `MAX_DATA_AGE` gate | Low | Contract change — separate scoped PR; pre-implementation red-team pass required |
| Oracle operator SLA: define maximum reserve-submission interval | Medium | Governance — per GAP-MEX-06 Domain 1/3 |
| Governance awareness: feeder rotation requires Court deactivation of emergency lock | Medium | Operational — deployment runbook update |
| Confirm two-role requirement (FEEDER_ROLE + MINTER_ROLE) as dual-compromise in audit | Low | External audit verification |
| Doctrine review: whether PAH_USD_KEY is the correct staleness proxy for `flagViolation` | Low | Doctrine |

---

*Report date: 2026-06-17 (Step 13 revision: 2026-06-17)*
*Branch: claude/dependabot-pr-cleanup-neu16i*
*No contracts modified. Audit-and-findings only.*
*Prior register: `docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md`*
*Prior disposition note: `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`*
*Contracts reviewed: `API3Oracle.sol`, `kernel.sol`, `PahlaviToken.sol`, `Treasury.sol`, `SovereignWealthFund.sol`*
*Test file reviewed: `test/09_api3_oracle.test.js`*
