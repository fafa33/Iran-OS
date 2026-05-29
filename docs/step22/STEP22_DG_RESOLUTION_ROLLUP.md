# Step 22 — DG Resolution Rollup

## Scope

This document summarizes the final status of design gaps DG-01 through DG-04 as identified in the Step 21 Sovereign Reserve Runtime Model and audited in the Step 22 pre-implementation audit. It is a continuity record only. It does not claim production readiness, close Step 12, or close Step 13.

---

## Final DG Status

| Gap | Classification | Priority | Resolution | Artifact Type | Status |
|---|---|---|---|---|---|
| DG-01 | CONFIRMED GAP | P1 | Option D selected — governance process | Contract (future) | Open — no contract change authorized |
| DG-02 | CONFIRMED GAP | P2 | Single-line fix — `layerL2.totalWithdrawn += yield` | Contract | Resolved |
| DG-03 | DESIGN CONSTRAINT | P2 | Integration test proves non-auto-sync behavior | Test | Documented and tested |
| DG-04 | DESIGN CONSTRAINT | P2 | No pre-reservation; execution-time check is sufficient | Documentation | Documented — accepted |

---

## DG-01 — SWF COUNCIL_ROLE persists after trigger activation

**Contract:** `TriggerProtocol.sol` lines 58–75; `kernel.sol` lines 318–374

**Current behavior:** `TriggerProtocol.executeTrigger()` stores the SWF address (line 19) but never calls it. After trigger activation, an offender retains `COUNCIL_ROLE` in `SovereignWealthFund`.

**Decision:** Option D — Human governance post-trigger. The Sovereign uses the existing `DEFAULT_ADMIN_ROLE` path to call `SovereignWealthFund.revokeRole(COUNCIL_ROLE, offender)` as a separate governance step.

**Rationale for eliminating Options B and C:** Any cross-contract call inside `executeTrigger()` creates a revert surface. If the SWF call fails for any reason, the entire trigger transaction reverts — a P0 constitutional risk that would allow a determined offender to block their own trigger activation.

**Harm window bounded by:** `MULTISIG_REQUIRED = 3` — offender alone cannot execute any withdrawal without two additional co-signers.

**Remaining operational obligation:** Following trigger activation, the Sovereign must call `SovereignWealthFund.revokeRole(COUNCIL_ROLE, offender)`.

**Authority review commit:** `72647bd`
**Reference document:** `docs/step22/DG01_AUTHORITY_BOUNDARY_REVIEW.md`

---

## DG-02 — L2 yield accounting identity broken

**Contract:** `SovereignWealthFund.sol` line 122

**Prior behavior:** `distributeAnnualYield()` decremented `layerL2.balance` but did not increment `layerL2.totalWithdrawn`. The bookkeeping identity `balance == totalDeposited - totalWithdrawn` did not hold for L2 after yield distribution.

**Fix:** Added `layerL2.totalWithdrawn += yield;` to the yield distribution line.

**Invariant preserved:** `totalAssets() = layerL1.balance + layerL2.balance + layerL3.balance` was not affected by the gap; the balance decrements were already correct. Only the accounting fields were inconsistent.

**Test updated:** `test/03_sovereign_wealth_fund.test.js` line 248 assertion updated from `equal(preL2.totalWithdrawn)` to `equal(preL2.totalWithdrawn + expectedYield)`.

**Fix commit:** `029bf7c`

---

## DG-03 — PahlaviToken reserves do not auto-sync with SWF deposits

**Contracts:** `SovereignWealthFund.sol`, `contracts/monetary/PahlaviToken.so`

**Behavior documented:** `SovereignWealthFund.depositToL1/L2/L3()` has no connection to `PahlaviToken.totalReserves`. Reserve recognition requires an explicit call to `PahlaviToken.updateReserves()` by an address holding `KERNEL_ROLE`. This is a design constraint, not a bug — it enforces that reserve recognition is a deliberate governance action.

**Integration test proves:**
1. `totalReserves == 0` before any recognition — minting blocked
2. SWF deposit does not auto-sync `totalReserves` (still 0 after deposit)
3. Unauthorized `updateReserves()` reverts
4. Kernel `updateReserves(depositAmount)` emits `ReservesUpdated`
5. `canMint()` returns true post-recognition
6. Authorized mint succeeds; oversize mint reverts on ratio protection; cap breach reverts

**Test commit:** `7f14a0c`
**Test location:** `test/02_pahlavi_token.test.js` — `describe("DG-03 Integration: SWF deposit to reserve recognition to minting capacity")`

---

## DG-04 — Proposed withdrawals do not pre-reserve SWF layer balance

**Contract:** `SovereignWealthFund.sol` — `proposeWithdrawal()` and `signWithdrawal()`

**Behavior documented:** `proposeWithdrawal()` records the intended amount but does not decrement `layerX.balance`. Multiple proposals can reference the same balance. At execution time (when `signaturesCount >= MULTISIG_REQUIRED`), `signWithdrawal()` calls `require(layerX.balance >= tx_.amount)` which enforces that only one proposal can drain a given balance.

**Design decision:** This is an accepted design constraint. The execution-time balance check is the safety guard. Pre-reservation would require either locking the layer balance (blocking other operations) or adding a separate reserved-balance accounting field — neither is warranted given that double-execution is already prevented.

**No contract change authorized.** Governance tooling should account for the absence of pre-reservation when displaying available withdrawal capacity.

**Documentation commit:** `62bf502`

---

## Commits Referenced

| Commit | Message | Artifact |
|---|---|---|
| `72647bd` | docs(step22): review DG-01 authority boundary | `docs/step22/DG01_AUTHORITY_BOUNDARY_REVIEW.md` |
| `62bf502` | docs(step22): clarify DG-04 semantics | `docs/step22/WHITEPAPER_STEP22_DG_PRE_IMPLEMENTATION_AUDIT.md` |
| `029bf7c` | fix(step24): restore L2 yield accounting consistency | `contracts/monetary/SovereignWealthFund.sol`, `test/03_sovereign_wealth_fund.test.js` |
| `7f14a0c` | test(step23): add DG-03 SWF-to-reserve-recognition integration test | `test/02_pahlavi_token.test.js` |
| `4afcd1f` | docs(step22): record DG pre-implementation audit | `docs/step22/WHITEPAPER_STEP22_DG_PRE_IMPLEMENTATION_AUDIT.md` |
| `07b317f` | docs(step21): formalize sovereign reserve runtime model | `docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md` |
| `bc647b1` | test(step20): resolve P-07 authority integration finding | `test/08_Trigger_Protocol.test.js` |

---

## Test Count

**468 passing** as of commit `029bf7c` (DG-02 fix + DG-03 integration test + DG-01 design boundary test).

Tests are distributed across:

| File | Domain |
|---|---|
| `test/01_kernel.test.js` | Kernel governance, trigger lifecycle, TR codes |
| `test/02_pahlavi_token.test.js` | PahlaviToken mint/burn/reserve/DG-03 integration |
| `test/03_sovereign_wealth_fund.test.js` | SWF deposits, withdrawals, yield distribution (DG-02 fix) |
| `test/04_provincial.test.js` | Provincial governance, revenue distribution |
| `test/05_citizen_card.test.js` | CitizenCard welfare, employment status |
| `test/06_api3_oracle.test.js` | Oracle data feeds, violation flagging |
| `test/07_asset_freeze.test.js` | AssetFreeze lifecycle, reclaim path |
| `test/08_Trigger_Protocol.test.js` | TriggerProtocol execution, P-07 COUNCIL_ROLE boundary |

---

## Open Blockers

| Blocker | Status | Notes |
|---|---|---|
| Step 12 | Open | Prerequisite — not closed by this step |
| Step 13 | Open | Prerequisite — not closed by this step |
| DG-01 contract resolution | Open | Option D selected; no contract change authorized; operational governance obligation documented |
| Security audit | Not started | Slither/Mythril/Echidna required before any deployment consideration |

---

## Recommended Next Phase

Based on the DG resolution sequence completed in Steps 21–22 and the authority boundary review for DG-01, the following work areas are eligible for consideration in subsequent steps:

1. **DG-01 post-trigger governance tooling** — If a future design resolves the trigger revert risk (e.g., via a separate post-trigger administrative transaction), Options B or C from the authority boundary review could be reconsidered. Until then, the operational obligation (Sovereign revokes COUNCIL_ROLE post-trigger) stands.

2. **Invariant enforcement candidates** — The Step 21 runtime model identified 13 enforcement candidates (EC-01 through EC-13) and 15 implementation mapping candidates. These have not been evaluated or implemented.

3. **Interaction boundary hardening** — IB-01 through IB-05 from the Step 21 model describe five cross-contract interaction boundaries. IB-05 (SWF↔Treasury no direct link) and IB-01 (PahlaviToken reserves not auto-mirrored) are documented but have no enforcement tests.

4. **Reserve class lifecycle tests** — RC-01 through RC-07 from the Step 21 model define lifecycle states and permitted transitions. No tests currently assert forbidden transitions.

---

## Resolution Status Summary

| Item | Status |
|---|---|
| DG-01 | Open — governance process selected, no contract change |
| DG-02 | Resolved — commit `029bf7c` |
| DG-03 | Documented and tested — commit `7f14a0c` |
| DG-04 | Documented — accepted design constraint — commit `62bf502` |
| Step 12 | Open |
| Step 13 | Open |

---

*Step 22 DG Resolution Rollup*
*Branch: `claude/step15-potential-gaps-cUVbj`*
*Reference commit: `72647bd`*
*Date: 2026-05-29*
