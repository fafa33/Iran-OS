# CF-1 Disposition — Reserve Breach Detection: Option C Implementation

**Finding ID:** CF-1
**Date:** 2026-06-16
**Contract:** `contracts/monetary/PahlaviToken.sol`
**Status:** PARTIALLY RESOLVED — on-chain breach detection implemented; post-update sub-floor state remains reachable; oracle routing and burn/contraction path remain open
**Prior audit:** [`INV02_RESERVE_RATIO_FLOOR_AUDIT.md`](./INV02_RESERVE_RATIO_FLOOR_AUDIT.md) v1.1.1
**Prior options:** [`INV02_REMEDIATION_OPTIONS.md`](./INV02_REMEDIATION_OPTIONS.md) v1.0.0

---

## Disclaimers

- This document does not claim production readiness.
- This document does not claim CF-1 is fully resolved. On-chain detection is implemented; the post-update sub-floor state remains reachable; the remediation path (burn/contraction or reserve correction) is undecided.
- This document does not close GAP-MEX-04, GAP-MEX-05, or GAP-MEX-06.
- This document does not claim INV-02 is fixed.
- This document does not close any STEP9-BLOCK-* blocker.
- This document does not claim external audit completion or formal verification completion.
- No Kernel contract, TriggerProtocol, oracle contract, or threshold was modified.

---

## What Option C Implements

### Contract changes: `contracts/monetary/PahlaviToken.sol`

**New state variable:**

```solidity
/// @notice true when updateReserves has left ratio < MIN_RESERVE_RATIO for existing supply
bool public reserveFloorBreached;
```

Initialized to `false` (Solidity default). Set to `true` on the first `updateReserves` call that results in a sub-floor ratio. Cleared to `false` when a subsequent `updateReserves` call returns the ratio to `>= MIN_RESERVE_RATIO`.

**New events:**

```solidity
event ReserveFloorBreached(
    uint256 oldReserves,
    uint256 newReserves,
    uint256 ratioInThousandths,
    uint256 supplyAtBreach
);

event ReserveFloorRestored(
    uint256 newReserves,
    uint256 ratioInThousandths,
    uint256 supply
);
```

`ReserveFloorBreached` is emitted on every `updateReserves` call that leaves `(newReserves * 1000) / totalSupply() < MIN_RESERVE_RATIO` when `totalSupply() > 0`. It carries the pre-update reserves, post-update reserves, the resulting ratio in thousandths, and the supply at the moment of breach — providing an off-chain monitoring hook with complete context.

`ReserveFloorRestored` is emitted once when a subsequent `updateReserves` call returns the ratio to `>= MIN_RESERVE_RATIO` and clears the breach flag. It carries the new reserves, the restored ratio, and the supply at the moment of recovery.

**Modified `updateReserves()` logic:**

```solidity
function updateReserves(uint256 newReserves) external onlyKernel {
    uint256 old = totalReserves;
    totalReserves = newReserves;
    uint256 supply = totalSupply();
    uint256 ratio = supply > 0 ? (newReserves * 1000) / supply : 1000;
    emit ReservesUpdated(old, newReserves, ratio);   // existing behavior preserved
    if (supply > 0 && ratio < MIN_RESERVE_RATIO) {
        if (!reserveFloorBreached) {
            reserveFloorBreached = true;
        }
        emit ReserveFloorBreached(old, newReserves, ratio, supply);
    } else if (reserveFloorBreached) {
        reserveFloorBreached = false;
        emit ReserveFloorRestored(newReserves, ratio, supply);
    }
}
```

No revert is added. The existing `ReservesUpdated` event is still emitted. The authority model (`onlyKernel`) is unchanged. No TriggerProtocol call. No Kernel callback.

Breach detection does not fire when `totalSupply() == 0` (ratio branch short-circuits to 1000; genuine reserve-before-mint state is not breach-relevant).

### Test changes: `test/02_pahlavi_token.test.js`

Added describe block `CF-1 Option C — Reserve Breach Detection` with three tests:

| Test | Asserts |
|---|---|
| **CF-1 A** | Compliant `updateReserves` (supply == 0 and supply > 0, ratio ≥ floor): no `ReserveFloorBreached` emitted; `reserveFloorBreached == false`; `ReservesUpdated` still emitted |
| **CF-1 B** | Non-compliant `updateReserves` (ratio < floor): `ReserveFloorBreached` emitted with correct args; `reserveFloorBreached == true`; tx succeeds (no revert); `totalReserves` updated correctly; `ReservesUpdated` still emitted |
| **CF-1 C** | Recovery: after breach entry, `updateReserves` to compliant ratio emits `ReserveFloorRestored` with correct args; `reserveFloorBreached == false`; `currentReserveRatio() >= 333`; `canMint` unblocked by ratio |

All pre-existing tests continue to pass. The INV-02 R-3 characterization test (which confirms `updateReserves(0)` does not revert) remains accurate — the new behavior adds event emission alongside the existing non-revert behavior, which R-3 does not assert against.

---

## Why Hard Revert Was Rejected (Option A)

Option A — adding `require((newReserves * 1000) / totalSupply() >= MIN_RESERVE_RATIO, ...)` to `updateReserves()` — was evaluated and rejected.

**1. Blocks honest loss recording.** MONETARY_EXPANSION_CONSTRAINTS.md ("Post-Update Detection") explicitly names the scenarios `updateReserves` must be able to reflect: "a genuine drop in real-world reserve valuation, a confirmed loss, or a reclassification/declassification event." A hard revert without a loss-attestation carve-out renders these unrecordable in-place. The contract would be unable to reflect reality when reality is adverse.

**2. Transparency failure exceeds the gap.** When reserves genuinely fall below the floor — a market correction, write-down, or reclassification — a hard revert leaves `totalReserves` stale (inflated). Governance and markets receive an incorrect picture during precisely the scenario where accuracy is most critical. A false reserve figure is a worse failure mode than a true figure with a detected breach.

**3. "Resilience before optimization."** The system must remain able to accurately reflect adverse conditions. A revert that prevents truthful accounting under adversity violates this sovereign-continuity principle.

**4. Doctrine does not mandate A.** INV02_RESERVE_RATIO_FLOOR_AUDIT.md v1.1.1 §7.2 records that "a hard floor guard is not ruled out but may conflict with recording a genuine reserve loss and needs doctrine review." A hard revert without a loss-attestation carve-out is not implementable under current doctrine; with a carve-out, the scope expands beyond CF-1 into a new design pattern requiring separate doctrine and architecture review.

---

## Why TriggerProtocol Routing Was Deferred (Option D)

Option D — automatically calling `Kernel.flagViolation(...)` from `updateReserves()` when a breach is detected — was evaluated and deferred.

**1. "Trigger routing must not automatically replace human judgment."** Calling `flagViolation` from contract code eliminates the oracle's judgment about whether a specific reserve event is breach-relevant. A legitimate reserve reclassification (planned, authorized, expected) would trigger a constitutional violation process without any human determination that a violation occurred.

**2. TriggerProtocol semantics do not fit accounting events.** `executeTrigger(violationId, offender, violationCode, replacement)` requires naming an offender and performs offender-specific actions: treasury block, signing revocation, and a public constitutional violation notification. A genuine market-driven reserve loss has no offender. The TriggerProtocol was designed for governance actors violating constitutional constraints, not for reserve-level accounting events.

**3. GAP-MEX-06 constraint.** RESERVE_RUNTIME_GAP_REGISTER.md (GAP-MEX-06) explicitly states: "no new code or automatic-response path is permissible" — the routing from breach-relevant conditions to TR-05/TR-06 must go through human-mediated oracle observation, not automatic contract calls.

**4. TR-05/TR-06 semantic mismatch.** TR-06 (`TR_LIQUIDITY_CAP`) was defined for supply cap violations (`totalSupply() > MAX_SUPPLY`). TR-05 (`TR_SWF_INDEPENDENCE`) was defined for SWF political independence breaches. Neither was designed for reserve-ratio accounting events (INV02_REMEDIATION_OPTIONS.md §4.3 explicitly flags this as an unresolved doctrine question).

**5. Operational weight.** Routing a reserve-level update through the 7-of-9 multi-sig + 72-hour Court adjudication process for every sub-floor event is disproportionate to operational reserve management. A genuine reserve drop during a crisis scenario would trigger a constitutional violation process while the monetary system must continue to function.

**The human-mediated routing obligation is preserved.** An `ORACLE_ROLE` holder observing `ReserveFloorBreached` is responsible for calling `Kernel.flagViolation(TR_SWF_INDEPENDENCE, ...)` when the breach represents a genuine governance-relevant event. This is the oracle's existing role in the IranOS architecture: observation and reporting, with the Court adjudicating the response. Option D replaces this with code; the correct design preserves it.

---

## Dependency on GAP-MEX-05

The breach detection implemented here represents the **on-chain detection side** of the CF-1 obligation. The governance-routing and remediation sides depend on components that remain open:

**GAP-MEX-05 (open):** `IranOS_Kernel` currently has no function that calls `PahlaviToken.updateReserves()`. CF-1's breach detection cannot be triggered from production logic today. The detection obligation becomes operational only when the oracle-to-token reserve sync path is wired into the Kernel.

**Sequencing constraint (INV02_REMEDIATION_OPTIONS.md §6):** When the Kernel reserve-sync path is wired, the following must be in place simultaneously:
1. This Option C implementation (on-chain detection) — now complete.
2. A monitoring specification: how an `ORACLE_ROLE` holder should respond to `ReserveFloorBreached`, within what window, and under what conditions to call `flagViolation`.
3. The burn/contraction procedure (Path D in the options document): the operational procedure for restoring the ratio via `burn()` or reserve correction after a breach is recognized.

**GAP-MEX-06 (open):** The mapping of detected breach conditions onto TR-05/TR-06 flags via the Kernel/Court channel is not implemented. The `ReserveFloorBreached` event provides the on-chain signal that enables this mapping; the mapping itself requires a monitoring implementation and a doctrine decision on TR-05/TR-06 scope.

**Until GAP-MEX-05 is wired and the monitoring specification is implemented, CF-1 detection is structurally in place but operationally dormant.**

---

## GAP-MEX-05 Disposition — Kernel→PahlaviToken Reserve Sync

**Implementation date:** 2026-06-16
**PR:** `claude/dependabot-pr-cleanup-neu16i`
**Status: CLOSED**

### What was implemented

**New file: `contracts/interfaces/IPahlaviToken.sol`**

Minimal single-function interface. Used only by `syncReserves`. Not expanded.

**Kernel additions: `contracts/kernel.sol`**

| Addition | Description |
|---|---|
| `address public pahlaviToken` | Address of PahlaviToken — set by `setPahlaviToken`, used by `syncReserves` |
| `event ReserveSynced(address indexed caller, uint256 newReserves, uint256 timestamp)` | Kernel-layer audit record emitted on each sync |
| `setPahlaviToken(address)` | `onlySovereign notLocked` setter — follows existing address-update pattern |
| `syncReserves(uint256 newReserves)` | `onlyOracle nonReentrant` — data-forwarding only; see guardrail below |

**`syncReserves` behavior — three steps, closed:**

1. `require(pahlaviToken != address(0), "Kernel: pahlaviToken not set")`
2. `IPahlaviToken(pahlaviToken).updateReserves(newReserves)`
3. `emit ReserveSynced(msg.sender, newReserves, block.timestamp)`

**`syncReserves` guardrail (binding):**

`syncReserves` is a pure data-forwarding surface. It does not compute reserve ratios, inspect breach state, call TriggerProtocol, call freeze/treasury/SWF/governance/mint/burn, or make any constitutional or enforcement decision. All compliance logic remains in `PahlaviToken.updateReserves()`. Constitutional enforcement remains human-mediated via 7-of-9 multi-sig.

**Emergency gate decision:**

`syncReserves` is intentionally exempt from `notLocked()`. Reserve truth must remain available during crisis. `PahlaviToken.updateReserves()` is also unblocked during emergency (no `notInEmergency` gate). The emergency lock freezes monetary flows, not financial reporting.

**New test file: `test/28_GAP_MEX_05.test.js`**

27 tests covering: role enforcement, reserve propagation, breach/restoration event attribution, emergency gate behavior, side-effect isolation (TriggerProtocol, mint/burn, enforcement state), edge cases (zero, same-value, repeated, increase, decrease, CF-7 overflow characterization), and setter tests.

### Kernel remains non-enforcement surface

- No ratio computation in Kernel
- No `reserveFloorBreached` variable in Kernel
- No `flagViolation()` call from `syncReserves`
- No TriggerProtocol call from `syncReserves`
- All breach/restoration events emitted by `PahlaviToken` — verified by T07b and T08b
- Kernel enforcement state (`emergencyLockActive`, `triggerActivationCount`, `violationCount`) unchanged by `syncReserves` — verified by T12

### Production data path — corrected (Codex P1 fix)

The deployment manifest grants `ORACLE_ROLE` on the Kernel to `API3Oracle`, not to individual feeder EOAs. Feeders hold `FEEDER_ROLE` on `API3Oracle`. A feeder calling `Kernel.syncReserves()` directly reverts. The production-usable path is:

```
feeder calls API3Oracle.syncReserves(newReserves)      ← FEEDER_ROLE on API3Oracle
→ API3Oracle calls Kernel.syncReserves(newReserves)    ← ORACLE_ROLE on Kernel
→ Kernel calls PahlaviToken.updateReserves(newReserves)
→ PahlaviToken.totalReserves updated
→ PahlaviToken emits ReservesUpdated (always)
→ PahlaviToken emits ReserveFloorBreached (if ratio < MIN_RESERVE_RATIO)
```

`API3Oracle.syncReserves` is data propagation only — no compliance computation, no ratio check, no enforcement call. It adds feeder-level attribution (`ReserveSyncForwarded` event) not visible in `Kernel.ReserveSynced` (which records API3Oracle as caller).

### No constitutional automation introduced

Full path from reserve decline to constitutional action:

```
feeder → API3Oracle.syncReserves(subFloor)
→ Kernel.syncReserves (data-forwarding only)
→ PahlaviToken.totalReserves updated
→ PahlaviToken.reserveFloorBreached = true
→ PahlaviToken emits ReserveFloorBreached
→ [human operator observes event — GAP-MEX-06]
→ human calls kernel.flagViolation(TR_SWF_INDEPENDENCE, ...) [not automated]
→ court signs 7-of-9 [human actors required]
→ TriggerActivated
```

Two mandatory human decision points remain. `API3Oracle.syncReserves` and `Kernel.syncReserves` are both data propagation only.

---

## What Remains Open

| Item | Status |
|---|---|
| CF-1: on-chain breach detection (event + state flag) | **IMPLEMENTED** — PR #76 |
| CF-5: distinct on-chain breach signal | **ADDRESSED** — `ReserveFloorBreached` event added (PR #76) |
| CF-1: burn-recovery stale state | **FIXED** — PR #77 |
| GAP-MEX-05: Kernel → `updateReserves` call path | **CLOSED** — `syncReserves` implemented; `API3Oracle` forwarding wired (Codex P1 fix); `totalReserves` now live |
| INV-02: reserve-ratio floor invariant | **CLOSED** — mint-time gate sound; breach detection live; burn recovery fixed; reserve feed live |
| GAP-MEX-06: breach → TR-05/TR-06 oracle routing | **CLOSED** — documentation-level monitoring/governance standard established (FND-01..FND-10; F-1..F-8; 7 domains); see `GAP_MEX_06_MONITORING_SPECIFICATION.md` |
| CF-7 constructor: `_initialReserves` upper-bound | **Open** — deploy-time validation absent |
| CF-7 runtime: overflow at supply == 0 in `syncReserves` | **Open** — characterized in T16b; no guard in Kernel by design; self-correcting via corrective sync |
| GAP-MEX-04: oracle data freshness at call boundary | **CLOSED** (current-code remediation scope) — two-gate freshness barrier implemented on `API3Oracle.syncReserves` (PR #85): Gate A requires PAH_USD_KEY within MAX_DATA_AGE; Gate B rate-limits reserve sync to one per MAX_DATA_AGE window. Gate A/Gate B close the actionable current-code freshness gap under the existing trusted-feeder model. **Gate B constraint on breach recovery:** if a sync has already occurred in the current MAX_DATA_AGE window, a corrective `syncReserves(higher_value)` call is blocked until `lastReservesSyncTimestamp + MAX_DATA_AGE`. Burn-based recovery (`PahlaviToken.burn`) is the only in-window correction path for a breach caused by an earlier wrong-value sync. **Residual hardening note K-RES-01:** `syncReserves(uint256 newReserves)` carries no timestamp or provenance for the reserve value itself; a feeder holding FEEDER_ROLE can refresh PAH_USD_KEY and submit a stale or incorrect `newReserves`. This is not a current BLOCKER — no reachable downstream enforcement consequence exists in the current codebase under the trusted-feeder model (FEEDER_ROLE restricted to named Airnode operators; arbitrary reserve submission predates PR #85; breach detection fires correctly on any submitted value). **K-RES-01 must be re-evaluated before any future SWF mint path, reserve-linked mint enforcement, or new downstream consumer of `totalReserves` is introduced.** |

---

*Report date: 2026-06-16 (updated: Codex P1 API3Oracle wiring fix; GAP-MEX-06 CLOSED 2026-06-17; K-RES-01 residual hardening note added 2026-06-17)*
*Branch: claude/dependabot-pr-cleanup-neu16i*
*Affected contracts: `contracts/kernel.sol`, `contracts/interfaces/IPahlaviToken.sol`, `contracts/oracles/API3Oracle.sol`*
*Test: `test/28_GAP_MEX_05.test.js`*
*Prior reports: `docs/reports/INV02_RESERVE_RATIO_FLOOR_AUDIT.md`, `docs/reports/INV02_REMEDIATION_OPTIONS.md`*
