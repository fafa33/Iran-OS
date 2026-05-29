# Step-14 Reserve and Treasury Execution Gap Map

## Scope and Non-Goals

This document maps the gaps between doctrine and on-chain implementation for the reserve and treasury domain of IranOS at baseline commit `3211295`. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, or monetary constants.

Step-12 remains open pending external audit, oracle operations evidence, and human review sign-off. Step-13 migration and reference cleanup is complete but not formally closed. This document does not claim closure of Step-12 or Step-13, does not introduce production readiness claims, and does not constitute sign-off.

IranOS is sovereign resilience infrastructure. This gap map exists to track what remains doctrine-only so that future implementation work can be scoped clearly without re-opening or weakening the Step-3 runtime hardening baseline.

**Preserved constants (unchanged and non-configurable):**

| Constant | Contract | Value |
|----------|----------|-------|
| `LIQUIDITY_CAP` | `kernel.sol` | 900,000,000,000 × 1e18 PAH |
| `MIN_RESERVE_RATIO` | `kernel.sol`, `PahlaviToken.sol` | 333 (33.3‰) |
| `MULTISIG_THRESHOLD` | `kernel.sol` | 7 of 9 |
| `TRIGGER_TIMEOUT` | `kernel.sol` | 72 hours |
| `MULTISIG_REQUIRED` | `SovereignWealthFund.sol` | 3 of N |
| `COUNCIL_THRESHOLD` | `AssetFreeze.sol` | 3 |

None of the gaps below authorize changing these constants.

**Evidence labels used in this document:**

| Label | Meaning |
|-------|---------|
| `[OBSERVED]` | Verified directly by reading contract code, test files, or grep output |
| `[INFERRED]` | Follows logically from doctrine or architectural gap; no single line of code confirms the absence |
| `[POTENTIAL]` | Requires further implementation review; may be partially covered or context-dependent |
| `[CORRECTED]` | Original claim was factually wrong; evidence found in code contradicts it; gap restated accurately |

---

## Table of Contents

1. [Sovereign Reserve Model](#1-sovereign-reserve-model)
2. [Treasury Accounting Rules](#2-treasury-accounting-rules)
3. [Reserve Classification Protocol](#3-reserve-classification-protocol)
4. [Monetary Expansion Constraints](#4-monetary-expansion-constraints)
5. [Sovereign Wealth Fund State Transitions](#5-sovereign-wealth-fund-state-transitions)
6. [Disbursement and Allocation Boundaries](#6-disbursement-and-allocation-boundaries)
7. [Trigger Conditions for Reserve and Treasury Violations](#7-trigger-conditions-for-reserve-and-treasury-violations)
8. [Gap Evidence Classification Summary](#8-gap-evidence-classification-summary)

---

## 1. Sovereign Reserve Model

### 1.1 Doctrine Source

`docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`. Defines six reserve classes (Locked, Deployable, Emergency, Encumbered, Reclaimed, Non-Reserve Treasury Balance), conservation boundary, cross-layer conservation invariants, oracle signal boundary, and human freeze authority boundary.

### 1.2 Current Implementation Status

`SovereignWealthFund.sol` implements three asset layers (L1, L2, L3) with `balance`, `target`, `totalDeposited`, `totalWithdrawn`, and `lastUpdated` fields. Layer balances are accounting totals; they do not map to reserve classes. No storage variable names or distinguishes Locked, Deployable, Encumbered, or Emergency sub-balances within or across layers.

`PahlaviToken.sol` maintains `totalReserves` as a single mutable uint256, updatable via `updateReserves()` (kernel-only). This is a flat backing figure with no connection to reserve class state in the SWF.

`AssetFreeze.sol` maintains `totalFrozenValue` as an aggregate of all active frozen asset `estimatedValue` fields. This figure is decremented on `transferToSWF()` and `releaseAsset()` but is not referenced by any reserve or monetary backing check.

### 1.3 Missing Storage Structures

- `[OBSERVED]` No per-layer or aggregate reserve class state (no `lockedBalance`, `deployableBalance`, `encumberedBalance`, `emergencyBalance` storage). Grep across all contracts returns no matches.
- `[OBSERVED]` No mapping from SWF layer balances to recognized reserve classes. `AssetLayer` struct contains only `balance`, `target`, `lastUpdated`, `totalDeposited`, `totalWithdrawn`.
- `[OBSERVED]` No storage linking `totalFrozenValue` in `AssetFreeze` to encumbered reserve state in `SovereignWealthFund`. Neither contract references the other's encumbrance figure.
- `[OBSERVED]` No `recognizedReserveBacking` derived view that excludes encumbered, frozen, locked, or pending value before exposing a deployable backing figure. Grep returns no matches.
- `[OBSERVED]` `totalReserves` in `PahlaviToken.sol` is a raw uint256. `updateReserves()` sets it to any kernel-supplied value with no classification-state check.

### 1.4 Missing Invariant Tests

- `[OBSERVED]` No test asserts that `totalReserves` in `PahlaviToken` cannot exceed the sum of recognized (non-encumbered, non-frozen, non-locked) SWF layer balances. The two test suites (`02_pahlavi_token.test.js`, `03_sovereign_wealth_fund.test.js`) are independent and share no cross-contract reserve assertions.
- `[INFERRED]` No test asserts conservation: reclassification must not increase total recognized value. Reserve classification functions do not exist, so no such test can be written yet.
- `[INFERRED]` No test asserts that `totalFrozenValue` in `AssetFreeze` cannot be simultaneously counted as deployable backing. No integration between AssetFreeze and PahlaviToken reserve figures exists to test against.
- `[INFERRED]` No negative test for failed classification leaving protected state neutral. Classification state machine does not exist.

### 1.5 Missing Trigger Conditions

- `[INFERRED]` No trigger fires when `totalReserves` in `PahlaviToken` falls below a floor relative to recognized SWF backing. No threshold for this relationship is defined in any contract.
- `[INFERRED]` No trigger fires when `totalFrozenValue` in `AssetFreeze` exceeds a threshold relative to SWF L1 balance. No cross-contract ratio threshold is defined.
- `[OBSERVED]` TR-05 (SWF independence) is defined in `kernel.sol` as violation code 5 but no automated signal path connects SWF state to the oracle flag path that would raise TR-05. The SWF does not hold a kernel reference and has no `flagViolation()` call.

### 1.6 Runtime Enforcement Gaps

- `[OBSERVED]` `updateReserves()` in `PahlaviToken.sol` (line 197–199) sets `totalReserves = newReserves` with no SWF balance check, no encumbrance exclusion, and no frozen-asset deduction.
- `[OBSERVED]` No runtime check prevents the kernel from setting `totalReserves` higher than SWF `totalAssets()`. The function accepts any uint256 from a kernel-role caller.
- `[INFERRED]` Conservation boundary enforcement is doctrinal only — no revert path guards against value creation through classification, because no classification functions exist.

### 1.7 Non-Claims and Blockers

- Step-12 oracle operations evidence is not complete. Reserve backing verification requires oracle evidence. This gap cannot be closed without oracle evidence delivery.
- Human freeze authority boundaries are doctrine-only. No automated enforcement replaces human judgment for freeze and emergency classification.
- Reserve class implementation requires storage redesign. That work is deferred and must not be executed as part of this step.

---

## 2. Treasury Accounting Rules

### 2.1 Doctrine Source

`docs/STEP4_1_TREASURY_ACCOUNTING_RULES.md`. Defines nine balance classes (Recognized Reserve, Locked, Frozen, Encumbered, Pending, Deployable, Reclaimed, SovereignWealthFund, Non-Reserve Treasury), permitted accounting transitions, failed-path neutrality rules, encumbrance discipline, and SovereignWealthFund accounting interface.

### 2.2 Current Implementation Status

`Treasury.sol` implements parliamentary budget lines (`BudgetLine`), government spending proposals (`TreasuryTransaction`), auditor signing, and kernel-controlled address blocking. Budget categories map to the governance sector split (Health, Education, Defense, etc.). `ANNUAL_BUDGET_CAP` is enforced per fiscal year.

`BudgetAllocation.sol` implements sector-level spending tracking (`SectorBudget.spent` vs `SectorBudget.allocated`) with parliament approval and kernel lock authority.

Neither contract references balance classes from Step-4.1. There is no Locked, Frozen, Encumbered, or Pending balance tracking separate from the existing spend-against-allocation model.

### 2.3 Missing Storage Structures

- `[OBSERVED]` No `encumberedBalance` or `pendingBalance` field in `Treasury.sol` or `BudgetAllocation.sol`. Grep returns no matches for these terms across all contracts.
- `[OBSERVED]` No `frozenBalance` that distinguishes freeze-state from unspent budget. `blockedByTrigger` in `Treasury.sol` blocks an address but does not reclassify its associated budget.
- `[OBSERVED]` No `deployableBalance` view that derives available balance after subtracting encumbrances, locks, and frozen value.
- `[OBSERVED]` No `reclaimedBalance` tracking in `Treasury.sol` separate from general inflows.
- `[OBSERVED]` No audit record structure for the six-stage sequence (signal → review → recommendation → authorization → execution → accounting mutation) required by Step-4.1. No enum or state field represents these stages in any contract.

### 2.4 Missing Invariant Tests

- `[OBSERVED]` No test asserts that a `signTransaction()` success in `Treasury.sol` preserves the exact-once accounting property. The test suite (`09_Treasury.test.js`) does not contain an assertion that double-signing does not debit a budget line twice.
- `[POTENTIAL]` No test asserts conservation: a failed `recordExpenditure()` in `BudgetAllocation.sol` leaves `spent` unchanged. The test file covers revert cases (`exceeds budget`, `not approved`, `locked by Trigger`) but does not explicitly snapshot and compare `spent` before and after a failed call.
- `[OBSERVED]` No test asserts that blocked-address transactions cannot reduce budget line balances. `Treasury.sol` tests do not cover the interaction between `blockAddressByTrigger()` and budget line debit state.
- `[CORRECTED]` ~~No test verifies that a `lockSectorBudget()` call prevents any subsequent `recordExpenditure()` against that sector from mutating state.~~ **Test exists.** `test/17_Budget_Allocation.test.js` lines 130–133 and 216–217 explicitly test that after `lockSectorBudget()`, `recordExpenditure()` reverts with `"BudgetAllocation: locked by Trigger"`. This gap does not exist.

### 2.5 Missing Trigger Conditions

- `[INFERRED]` No trigger fires when a budget sector's `spent / allocated` ratio exceeds a configurable threshold. No such threshold is defined in any contract.
- `[OBSERVED]` No trigger is linked to `ExpenditureFlagged` events — auditor flagging is advisory only; `flagExpenditure()` emits an event and sets `flagged = true` with no escalation to `kernel.flagViolation()`.
- `[INFERRED]` No trigger fires when the sum of all sector `spent` values approaches the total `TOTAL_BUDGET`. No such comparison is made in any contract.

### 2.6 Runtime Enforcement Gaps

- `[OBSERVED]` `recordExpenditure()` in `BudgetAllocation.sol` checks `sb.spent + amount <= sb.allocated` but does not check whether the sector is approaching an emergency reserve boundary. No such boundary is defined at the contract level.
- `[OBSERVED]` `Treasury.sol` `signTransaction()` sets `tx_.executed = true` and emits `TransactionExecuted` with no token transfer. Grep across `Treasury.sol` finds no `transfer()`, `mint()`, `burn()`, or `IERC20` call.
- `[OBSERVED]` The six audit stages (signal → execution) required by doctrine exist nowhere as an enforced state machine. No enum, state field, or function sequence enforces the six-stage ordering.

### 2.7 Non-Claims and Blockers

- Step-12 is not closed. Treasury accounting evidence and external audit preparation are listed as Step-12 blockers. This gap map does not close those items.
- Balance class implementation requires cross-contract storage additions. Deferred.
- The six-stage audit distinction is governance doctrine. It cannot be fully enforced on-chain without redesigning the approval flow.

---

## 3. Reserve Classification Protocol

### 3.1 Doctrine Source

`docs/STEP4_2_RESERVE_CLASSIFICATION_PROTOCOL.md`. Defines twelve reserve classification states, allowed transition table (fourteen transitions), forbidden transition categories, classification authority requirements, exact-once classification accounting, failed-path neutrality, and replay resistance.

### 3.2 Current Implementation Status

No reserve classification state machine exists in any contract. The closest approximation is the `FreezeStatus` enum in `AssetFreeze.sol` (`Active → UnderReview → Confirmed → Released`), which is a freeze lifecycle state, not a reserve classification state.

`SovereignWealthFund.sol` has no classification state per layer or per deposit. All deposits flow directly into layer balances without a pending → recognized → classified sequence.

`PahlaviToken.sol` uses `totalReserves` as the recognized backing figure, but this value is set externally by the kernel without going through a classification protocol.

### 3.3 Missing Storage Structures

- `[OBSERVED]` No `ClassificationState` enum or equivalent. Grep across all contracts returns no matches for `ClassificationState`, `classificationState`, `classificationRecords`, `classificationAuditLog`, or `rejectedClassification`.
- `[OBSERVED]` No `classificationRecords` mapping from balance identifier → classification state.
- `[INFERRED]` No `classificationAuthority` access control beyond general `COUNCIL_ROLE` or `KERNEL_ROLE`. No classification function exists that would require such a role.
- `[OBSERVED]` No `classificationAuditLog` event structure. No event in any contract captures source state, target state, authorization basis, and conservation boundary reference together.
- `[OBSERVED]` No `rejectedClassification` record storage.

### 3.4 Missing Invariant Tests

- `[INFERRED]` No test exercises a classification proposal → rejection path to verify protected state remains neutral. No classification functions exist to test.
- `[INFERRED]` No test verifies that a replayed classification attempt does not increment recognized backing. No classification state machine exists.
- `[INFERRED]` No test asserts that reclassification from Deployable → Encumbered does not change total recognized value. No reclassification functions exist.
- `[INFERRED]` No test confirms that an Unclassified Treasury Balance cannot be used as recognized backing before classification. No classification gate exists in `updateReserves()`.
- `[INFERRED]` No test verifies that a Frozen Reserve cannot become Deployable without an explicit release authorization path. No such path exists.

### 3.5 Missing Trigger Conditions

- `[INFERRED]` No trigger fires when a large-value balance remains Unclassified beyond a time threshold. No classification time-tracking exists.
- `[INFERRED]` No trigger fires on a rejected classification. No classification rejection state exists.
- `[INFERRED]` No trigger links classification state changes to oracle signals. Consistent with oracle-boundary doctrine, but classification disputes are invisible to the trigger system.

### 3.6 Runtime Enforcement Gaps

- `[OBSERVED]` The entire classification state machine is absent from runtime. Grep across all contracts finds no classification transition logic, no revert path enforcing the fourteen allowed transitions, and no block on forbidden transitions.
- `[OBSERVED]` `depositToL1()` / `depositToL2()` / `depositToL3()` immediately credit layer balance. Code lines 75–88 of `SovereignWealthFund.sol` show direct balance increment with no pending → authorized → confirmed sequence.
- `[OBSERVED]` `updateReserves()` in `PahlaviToken.sol` (lines 197–199) sets `totalReserves` directly. No classification check, no SWF balance verification, no encumbrance exclusion.
- `[OBSERVED]` `receiveReclaimedAsset()` in `SovereignWealthFund.sol` correctly requires `RECLAIM_ROLE`, but the credited amount immediately increases `layerL1.balance` with no classification review gate.

### 3.7 Non-Claims and Blockers

- Classification state machine implementation requires significant storage additions and a new governance flow. This is deferred work — not a Step-14 deliverable.
- Step-12 is not closed. Classification authority evidence is a Step-12 open item.
- Oracle boundary doctrine prohibits oracle signals from autonomously classifying reserves. Any future classification implementation must preserve this boundary.

---

## 4. Monetary Expansion Constraints

### 4.1 Doctrine Source

`docs/STEP4_3_MONETARY_EXPANSION_CONSTRAINTS.md`. Defines expansion eligibility rules, reserve backing constraints, `LIQUIDITY_CAP` constraints, `MIN_RESERVE_RATIO` constraints, hidden minting path prevention, and expansion neutrality requirements.

### 4.2 Current Implementation Status

`PahlaviToken.sol` enforces `MIN_RESERVE_RATIO` at every `mint()` call via the `reserveCompliant()` modifier:

```solidity
uint256 newSupply = totalSupply() + mintAmount;
uint256 ratio = (totalReserves * 1000) / newSupply;
require(ratio >= MIN_RESERVE_RATIO, "PAH: reserve ratio below minimum 33.3%");
```

This check is **present and active**. `MIN_RESERVE_RATIO = 333` is declared both in `kernel.sol` and in `PahlaviToken.sol`.

`LIQUIDITY_CAP = 900_000_000_000 × 1e18` is declared in `kernel.sol` only. It is **not referenced** in `PahlaviToken.sol`. There is no `require(totalSupply() + mintAmount <= LIQUIDITY_CAP)` check in the mint path.

`totalReserves` is updated via `updateReserves()` (kernel-only) without verifying against classified, non-encumbered SWF backing. A kernel call can set `totalReserves` to an arbitrary value, enabling mint to proceed at a higher ratio than actual recognized backing supports.

`distributeAnnualYield()` in `SovereignWealthFund.sol` transfers L2 balance to L1, but this does not update `totalReserves` in `PahlaviToken.sol`. The two accounting systems are unlinked.

### 4.3 Missing Storage Structures

- `[INFERRED]` No `recognizedBackingBoundary` storage variable derived from classified, non-encumbered, non-frozen, non-locked SWF balances. Requires classification state machine (§3) to exist first.
- `[INFERRED]` No `encumberedBacking` exclusion field that reduces effective backing before the `reserveCompliant()` check. Requires encumbrance tracking to exist first.
- `[OBSERVED]` No cross-contract linkage between `SovereignWealthFund.totalAssets()` and `PahlaviToken.totalReserves`. Neither contract imports or references the other's interface for this purpose.
- `[OBSERVED]` No guard against `distributeAnnualYield()`, `receiveReclaimedAsset()`, or reclassification increasing mint capacity indirectly. No call to `updateReserves()` exists in either SWF function.

### 4.4 Missing Invariant Tests

- `[OBSERVED]` No test asserts that `totalSupply() + mintAmount <= LIQUIDITY_CAP` reverts if exceeded. `LIQUIDITY_CAP` is not referenced in `PahlaviToken.sol` and no test file contains an assertion against it in the mint path.
- `[OBSERVED]` No test asserts that setting `totalReserves` above SWF `totalAssets()` causes subsequent `mint()` to fail. `02_pahlavi_token.test.js` and `03_sovereign_wealth_fund.test.js` are independent; no cross-contract reserve check exists.
- `[OBSERVED]` No test verifies that `distributeAnnualYield()` does not increase effective mint capacity. The yield test (`03_sovereign_wealth_fund.test.js` lines 216–230) checks L1 balance and yield event but does not check `PahlaviToken.totalReserves` or `remainingMintCapacity()`.
- `[OBSERVED]` No test asserts expansion neutrality: failed mint attempts must not mutate `totalReserves` or any SWF layer balance.
- `[POTENTIAL]` No test asserts that `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` remain non-configurable. No setter exists for either constant (positive fact), but no test explicitly asserts that no setter can be called.

### 4.5 Missing Trigger Conditions

- `[OBSERVED]` TR-06 (`LIQUIDITY_CAP`) is defined in `kernel.sol` as violation code 6. No runtime path fires TR-06 when `totalSupply()` approaches or exceeds the cap. Because `PahlaviToken.mint()` does not check `LIQUIDITY_CAP`, a cap breach produces no revert; detection depends entirely on oracle operators monitoring `totalSupply()` off-chain.
- `[INFERRED]` No automatic trigger fires when `totalReserves` diverges from SWF-backed recognized value by more than a threshold. No threshold for this divergence is defined.
- `[INFERRED]` No trigger fires when `MIN_RESERVE_RATIO` compliance falls within a warning band (e.g., ratio between 333 and 400 — still compliant but approaching threshold). The existing check produces only revert or silence.

### 4.6 Runtime Enforcement Gaps

- `[OBSERVED]` **Critical:** `PahlaviToken.mint()` does not check against `LIQUIDITY_CAP`. Grep of `PahlaviToken.sol` returns no match for `LIQUIDITY_CAP`. Total supply can exceed 900 billion PAH without a revert.
- `[OBSERVED]` `updateReserves()` (lines 197–199) sets `totalReserves = newReserves` with no upper bound, no SWF cross-check, and no encumbrance deduction. An overstated reserve figure enables under-backed minting that passes `reserveCompliant()`.
- `[OBSERVED]` `distributeAnnualYield()` increases `layerL1.balance` and decreases `layerL2.balance` (lines 122–123) without calling `updateReserves()`. L2-to-L1 yield flow is invisible to the monetary backing check.
- `[OBSERVED]` `receiveReclaimedAsset()` increases `layerL1.balance` (lines 139–141) without calling `updateReserves()`. Reclaimed asset intake is invisible to the monetary backing check.
- `[INFERRED]` No on-chain circuit breaker pauses minting when the reserve ratio approaches `MIN_RESERVE_RATIO` from above. Such a warning threshold is not defined anywhere.

### 4.7 Non-Claims and Blockers

- Adding `LIQUIDITY_CAP` enforcement to `mint()` requires a contract change. That is a future implementation item, not a Step-14 deliverable.
- `totalReserves` ↔ SWF integration requires an oracle or governance-mediated update path. The mechanism design is deferred.
- Step-12 monetary expansion evidence is not delivered. This gap map does not close that item.

---

## 5. Sovereign Wealth Fund State Transitions

### 5.1 Doctrine Source

`docs/STEP4_5_WEALTH_FUND_STATE_TRANSITIONS.md`. Defines SWF as a sovereign reserve resilience layer (SRR-role), not a profit-maximizing vehicle. Defines fourteen allowed SWF state transitions, forbidden transition categories, SWF neutrality requirements, exact-once accounting rules, replay resistance, and encumbrance discipline.

### 5.2 Current Implementation Status

The following transitions are implemented and active:

| Transition | Contract function | Evidence label |
|-----------|------------------|----------------|
| Zero Balance → Layer Balance Recorded | `depositToL1/L2/L3()` | `[OBSERVED]` |
| Pending Deposit → Recognized Deposit | `depositToL1/L2/L3()` (no pending stage — immediate) | `[OBSERVED]` partial |
| Pending Withdrawal → Executed Withdrawal | `proposeWithdrawal()` + `signWithdrawal()` | `[OBSERVED]` |
| Pending Reclaimed Asset → Recognized Reclaimed Asset | `receiveReclaimedAsset()` (RECLAIM_ROLE) | `[OBSERVED]` |
| L2 Yield → L1 Credit | `distributeAnnualYield()` | `[OBSERVED]` |
| Replay resistance for executed withdrawals | `tx_.executed` flag check at line 104 | `[OBSERVED]` |
| Over-withdrawal neutrality | `require(balance >= amount)` at lines 111–113 | `[OBSERVED]` |

The following transitions are absent:

| Transition | Evidence label |
|-----------|----------------|
| Layer Balance Recorded → SWF Backing Candidate | `[OBSERVED]` absent |
| SWF Backing Candidate → SWF Reserve-Backed Balance | `[OBSERVED]` absent |
| Layer Balance → Encumbered SWF Balance (pending claims) | `[OBSERVED]` absent |
| Encumbered SWF Balance → Deployable after release | `[OBSERVED]` absent |
| Frozen SWF-Linked Balance state | `[OBSERVED]` absent |
| Frozen → Prior class after human release | `[OBSERVED]` absent |

### 5.3 Missing Storage Structures

- `[OBSERVED]` No `pendingDeposit` staging area. `depositToL1/L2/L3()` immediately credit `layer.balance` (lines 75, 81, 87).
- `[OBSERVED]` No `encumberedAmount` per layer or per withdrawal proposal. `Transaction` struct contains `layer`, `amount`, `purpose`, `timestamp`, `signaturesCount`, `executed` — no field reserves the layer balance against concurrent proposals.
- `[OBSERVED]` No `backingCandidateFlag` per deposit record. Grep returns no matches across all contracts.
- `[OBSERVED]` No `frozenLayerAmount` tracking freeze-linked encumbrance within a layer.

### 5.4 Missing Invariant Tests

- `[CORRECTED]` ~~No test asserts that a failed `receiveReclaimedAsset()` (e.g., caller lacking RECLAIM_ROLE) leaves all layer balances unchanged.~~ **Test exists.** `test/03_sovereign_wealth_fund.test.js` lines 288–307 explicitly test that an unauthorized caller cannot invoke `receiveReclaimedAsset()` and that `totalAssets()` remains equal to the pre-call snapshot. This gap does not exist.
- `[POTENTIAL]` No test asserts that `totalAssets()` equals L1 + L2 + L3 balances after any sequence of deposits, withdrawals, and yield distributions. Tests at lines 105, 125, 146, 158 check `totalAssets()` before and after individual operations; no test exercises a multi-operation sequence and asserts the additive invariant across all three layers.
- `[OBSERVED]` No test asserts that a pending withdrawal commitment reduces the effectively deployable balance even before execution. `encumberedAmount` does not exist, so no test can check it.
- `[POTENTIAL]` No test asserts that `distributeAnnualYield()` conserves total assets (L1 increases by exactly the amount L2 decreases). The yield test (lines 216–230) checks L1 balance and yield event amount but does not read L2 balance post-distribution or compare `totalAssets()` before and after.
- `[CORRECTED]` ~~No test asserts that `receiveReclaimedAsset()` with amount = 0 reverts without state mutation.~~ **Test exists.** `test/03_sovereign_wealth_fund.test.js` lines 312–327 explicitly test that `receiveReclaimedAsset(0n, ...)` reverts with `"SWF: zero amount"` and that `totalAssets()` remains equal to the pre-call snapshot. This gap does not exist.

### 5.5 Missing Trigger Conditions

- `[INFERRED]` No trigger fires when any SWF layer balance falls below its `target` by more than a defined threshold. No such threshold is defined in any contract.
- `[INFERRED]` No trigger fires when the sum of pending (proposed, unexecuted) withdrawals across all layers exceeds a fraction of total assets. `encumberedAmount` does not exist.
- `[INFERRED]` No trigger fires when `distributeAnnualYield()` is called when L2 balance is below target. No L2 floor check beyond `require(layerL2.balance >= yield)` exists in the function.
- `[OBSERVED]` TR-05 (SWF independence) has no automated signal path from SWF state to kernel. The SWF holds no kernel reference.

### 5.6 Runtime Enforcement Gaps

- `[OBSERVED]` Deposits immediately credit layer balance without a pending → authorized sequence. Lines 75, 81, 87 of `SovereignWealthFund.sol` show direct `balance += amount`.
- `[OBSERVED]` `distributeAnnualYield()` does not verify that L2 balance remains above `L2_TARGET` after the yield transfer. Code at lines 119–123 only checks `yield > 0` and `layerL2.balance >= yield`.
- `[OBSERVED]` `signWithdrawal()` does not enforce a minimum floor. Lines 111–113 check `require(balance >= amount)` only; no fraction-of-target floor exists.
- `[OBSERVED]` No `encumberedAmount` deduction: two concurrent withdrawal proposals can each reference the full unencumbered layer balance. `proposeWithdrawal()` (lines 91–99) does not decrement available balance at proposal time.

### 5.7 Non-Claims and Blockers

- Pending deposit staging requires a contract architecture change. Deferred.
- Encumbered balance tracking requires storage additions and cross-function state. Deferred.
- SWF backing → `totalReserves` linkage requires a governed oracle or kernel-mediated update path. Deferred.
- Step-12 is not closed. SWF layer state evidence is a Step-12 open item.

---

## 6. Disbursement and Allocation Boundaries

### 6.1 Doctrine Source

`docs/STEP4_SOVEREIGN_RESERVE_MODEL.md` §Treasury Accounting Rules; `docs/STEP4_1_TREASURY_ACCOUNTING_RULES.md` §Deployable Balance; `whitepaper/whitepaper-fa.md` §38.2.2 (1,000 PAH/month welfare floor), §41.6 (VelocityFee disbursement).

### 6.2 Current Implementation Status

`CitizenCard.sol` tracks citizen status (`Employed`, `Unemployed`, `Retired`, `Disabled`), welfare eligibility, and benefit parameters (`MIN_WAGE`, `UNEMPLOYMENT_RATIO`, `MAX_UNEMPLOYMENT_MONTHS`, `HEALTH_CREDIT_ANNUAL`, `DRUG_QUOTA_MONTHLY`). It does not transfer tokens.

`BudgetAllocation.sol` tracks `SectorBudget.spent` per sector but does not transfer tokens. `recordExpenditure()` is a bookkeeping call by government.

`Treasury.sol` implements a budget proposal → sign → execute flow but marks transactions `executed = true` without performing a token transfer — no `IERC20.transfer()` or `IPahlaviToken.mint()` call exists in the execution path.

`VelocityFee.sol` reads `IPahlaviToken.balanceOf()`, calculates a fee, and emits `FeeLevied`. No `burn()`, `transfer()`, or `depositToL1()` call is made.

`Provincial.sol` accumulates `provincialBalance` (a field inside the `Province` struct) from oracle-reported revenue at the 30% provincial share but has no `withdrawProvincialFunds()` function. `payProductivityBonus()` (kernel-only) also credits `provincialBalance`.

### 6.3 Missing Storage Structures

- `[OBSERVED]` No disbursement contract exists that reads from SWF L1 and transfers PAH to welfare recipients. No such contract file exists in `contracts/`.
- `[OBSERVED]` No per-citizen disbursement record (amount, period, basis) separate from `CitizenCard` status fields.
- `[OBSERVED]` No `VelocityFee` escrow or burn destination address. Grep of `VelocityFee.sol` returns no `burn`, `transfer`, or SWF deposit call.
- `[OBSERVED]` No `withdrawProvincialFunds()` function or authorization path in `Provincial.sol`. The only functions are `registerProvince()`, `distributeRevenue()`, `payProductivityBonus()`, `updateProductivityScore()`, `updateGovernor()`.
- `[OBSERVED]` No `SWF → Treasury → CitizenCard → disbursement` routing structure.

### 6.4 Missing Invariant Tests

- `[INFERRED]` No test asserts that `CitizenCard` status updates do not transfer PAH. CitizenCard has no token interface; such a test would assert the absence of an interface that does not exist.
- `[OBSERVED]` No test asserts that `VelocityFee.FeeLevied` events do not reduce any token balance. The VelocityFee test (`11_Velocity_Fee.test.js`) does not cross-check PAH balances before and after fee events.
- `[OBSERVED]` No test asserts that `Treasury.signTransaction()` at threshold does not reduce any PAH balance. `Treasury.sol` has no token interface; `09_Treasury.test.js` does not check PAH balance state.
- `[POTENTIAL]` No test asserts that `provincialBalance` can only increase (absent a withdrawal function). The provincial test (`16_Provincial.test.js`) verifies correct `provincialBalance` values after `distributeRevenue()` and `payProductivityBonus()` but does not assert monotonic increase across the full test sequence.

### 6.5 Missing Trigger Conditions

- `[INFERRED]` No trigger fires when SWF L1 balance falls below the 1-month welfare disbursement liability. No population-size or eligible-citizen count exists on-chain.
- `[INFERRED]` No trigger fires when `VelocityFee` accumulated liability exceeds a threshold without execution. VelocityFee emits events only; no accumulated liability figure exists.
- `[INFERRED]` No trigger fires when provincial balances exceed a ceiling with no disbursement path. No ceiling threshold is defined.

### 6.6 Runtime Enforcement Gaps

- `[OBSERVED]` **Welfare floor is entirely unenforced on-chain.** `MIN_WAGE = 1000` in `CitizenCard.sol` is a constant; no contract calls transfer or mint to a citizen address.
- `[OBSERVED]` **VelocityFee has zero economic effect.** Grep of `VelocityFee.sol` returns no `burn()`, `transfer()`, or `depositToL1()` call after fee computation.
- `[OBSERVED]` **Provincial 30% share accumulates without a spend path.** `provincialBalance` is incremented in `distributeRevenue()` and `payProductivityBonus()`. No function decrements it.
- `[OBSERVED]` **Treasury execution is a no-op for actual token flow.** Grep of `Treasury.sol` returns no `transfer()`, `mint()`, `burn()`, or `IERC20` reference.
- `[OBSERVED]` The entire disbursement layer between SWF L1 and end recipients is absent. No contract file in `contracts/` implements a payment routing function.

### 6.7 Non-Claims and Blockers

- A disbursement contract requires designing a routing mechanism from SWF L1 to verified citizen addresses. That is a Phase 2 implementation item not part of this step.
- `VelocityFee` burn execution requires a `BURNER_ROLE` grant to `VelocityFee.sol`. This was explicitly identified as a constraint: `VelocityFee` must not be granted `BURNER_ROLE` until the full fee execution design is reviewed and authorized.
- Provincial spend authority requires a governance decision on which role can authorize provincial withdrawals. Deferred.

---

## 7. Trigger Conditions for Reserve and Treasury Violations

### 7.1 Doctrine Source

`contracts/kernel.sol` TR-01 to TR-06; `protocols/trigger-protocol-fa.md`; `protocols/monetary-protocol-fa.md`.

### 7.2 Current Implementation Status

Six trigger codes are hardcoded in `kernel.sol`:

| Code | Category | Auto-Lock | Multi-Sig Required | Oracle Path Exists |
|------|----------|-----------|-------------------|-------------------|
| TR-01 | Secular constitutional monarchy | Yes | No | `flagViolation()` |
| TR-02 | Structural secularism | Yes | No | `flagViolation()` |
| TR-03 | Territorial integrity | Yes | No | `flagViolation()` |
| TR-04 | Fundamental rights | No | Yes (7 of 9) | `flagViolation()` |
| TR-05 | SWF independence | No | Yes (7 of 9) | `flagViolation()` |
| TR-06 | Liquidity cap | No | Yes (7 of 9) | `flagViolation()` |

TR-05 and TR-06 are the reserve and treasury-relevant trigger codes. Both require oracle flagging via `flagViolation()`. Neither has an automated detection path from contract state.

`API3Oracle.flagViolation()` (FEEDER_ROLE) **does** call through to `IIranOSKernel(kernel).flagViolation()` (line 91 of `API3Oracle.sol`). A feeder-initiated flag propagates to the kernel trigger system. However, `API3Oracle.confirmViolation()` (KERNEL_ROLE) only updates the oracle-local `ViolationFlag.confirmed` field and does not propagate back to kernel violation state. The two contracts maintain separate violation record structures (`violationFlags` mapping in API3Oracle vs `violations` mapping in kernel).

### 7.3 Missing Storage Structures

- `[OBSERVED]` No `reserveHealthSignal` storage in any contract that would feed into an oracle or trigger path automatically. Grep returns no matches.
- `[OBSERVED]` No `liquidityCapBreachRecord`. A breach of `LIQUIDITY_CAP` leaves no on-chain trace if it occurs without oracle flagging, because `PahlaviToken.mint()` does not check the cap and therefore cannot revert.
- `[OBSERVED]` No cross-contract callback or event listener connecting SWF layer state to the kernel trigger system. `SovereignWealthFund.sol` holds no kernel address and makes no kernel call.
- `[OBSERVED]` No `MIN_RESERVE_RATIO` near-breach record. Below the ratio threshold, `mint()` reverts. Above it, nothing is emitted. A near-breach that does not trigger a revert leaves no trace.

### 7.4 Missing Invariant Tests

- `[OBSERVED]` No test asserts that `totalSupply()` approaching `LIQUIDITY_CAP` causes an oracle to flag TR-06. No such test can be written until the oracle monitoring path for cap detection is designed and `LIQUIDITY_CAP` is enforced in `mint()`.
- `[OBSERVED]` No test asserts that TR-05 is flagged when `SovereignWealthFund` `COUNCIL_ROLE` is granted to an unauthorized address.
- `[POTENTIAL]` No test asserts that `API3Oracle.flagViolation()` produces a consistent violation record in both the oracle's `violationFlags` mapping and the kernel's `violations` mapping. The propagation call (line 91) exists; whether it is tested end-to-end requires reviewing the oracle and kernel test suites in detail.
- `[POTENTIAL]` No test asserts that a TR-06 flag → 7-of-9 multi-sig → `_activateTrigger()` sequence correctly revokes SWF or treasury roles from the offending address. The trigger test suite (`08_Trigger_Protocol.test.js`) may cover this but requires targeted verification.

### 7.5 Missing Trigger Conditions

- `[OBSERVED]` **TR-06 (Liquidity Cap):** No automatic detection. `PahlaviToken.mint()` does not check against `LIQUIDITY_CAP`. A cap breach produces no revert; detection depends entirely on oracle operators monitoring `totalSupply()` off-chain and manually calling `flagViolation()`.
- `[OBSERVED]` **TR-05 (SWF Independence):** No automated signal from SWF to kernel. `SovereignWealthFund.sol` has no kernel reference. SWF governance violations must be detected off-chain and flagged manually via oracle `flagViolation()`.
- `[INFERRED]` **MIN_RESERVE_RATIO warning band:** No trigger fires when the ratio is between 333 and 400 (compliant but within 20% of the minimum). The existing check produces only revert (below threshold) or silence (above threshold).
- `[CORRECTED]` ~~Oracle channel unification: `API3Oracle.flagViolation()` and `kernel.flagViolation()` are parallel and unlinked.~~ **This claim was incorrect.** `API3Oracle.flagViolation()` (line 91) calls `IIranOSKernel(kernel).flagViolation()`. Feeder-initiated flags DO propagate to the kernel. The actual gap is that `API3Oracle.confirmViolation()` only updates oracle-local `ViolationFlag.confirmed` state and does not reflect back into kernel violation state. The two contracts maintain separate violation record structures whose confirmation states are not synchronized.

### 7.6 Runtime Enforcement Gaps

- `[OBSERVED]` `kernel.sol` holds `LIQUIDITY_CAP` but `PahlaviToken.sol` does not import or reference it. Grep of `PahlaviToken.sol` returns no match for `LIQUIDITY_CAP`. The cap is a doctrinal constant with no enforcement point in the token contract.
- `[INFERRED]` The kernel `flagViolation()` function requires oracle role holders to act. If oracle role holders are unavailable or compromised, TR-05 and TR-06 have no automated fallback. This is an architectural dependency, not a code defect.
- `[OBSERVED]` There is no circuit breaker in the SWF that halts withdrawals when `totalAssets()` falls below a floor, independent of the trigger system. No such function exists in `SovereignWealthFund.sol`.
- `[OBSERVED]` `TriggerProtocol.executeTrigger()` can revoke roles from a violating address but does not pause token minting, freeze SWF withdrawals, or halt treasury spending. Grep of `TriggerProtocol.sol` returns no `pause`, `pauseMinting`, or `halt` call.

### 7.7 Non-Claims and Blockers

- Adding `LIQUIDITY_CAP` enforcement to `PahlaviToken.mint()` is a contract change. Deferred.
- Synchronizing `API3Oracle.confirmViolation()` state with kernel violation state requires a cross-contract design decision. Deferred.
- An automated reserve health signal requires oracle infrastructure that is part of Step-12 evidence. Step-12 is not closed.
- The trigger system is designed to require human oracle operators by doctrine — full automation of TR-05 and TR-06 detection would contradict the oracle signal boundary requirement. Any future automated signal path must preserve the human-in-the-loop requirement for classification and execution decisions.

---

## 8. Gap Evidence Classification Summary

### 8.1 Corrections from Verification Pass

Four claims in the original draft were factually incorrect and have been corrected above:

| Section | Original Claim | Correction | Evidence |
|---------|---------------|------------|----------|
| §2.4 | No test verifies `lockSectorBudget()` prevents expenditure state mutation | **Test exists** | `test/17_Budget_Allocation.test.js` lines 130–133, 216–217 |
| §5.4 | No test for unauthorized `receiveReclaimedAsset()` leaving balance unchanged | **Test exists** | `test/03_sovereign_wealth_fund.test.js` lines 288–307 |
| §5.4 | No test for `receiveReclaimedAsset(0)` reverting without state mutation | **Test exists** | `test/03_sovereign_wealth_fund.test.js` lines 312–327 |
| §7.5 | API3Oracle and kernel flag channels are parallel and unlinked | **Incorrect.** Feeder flags propagate to kernel via line 91. Actual gap: confirmation state is oracle-local only. | `API3Oracle.sol` line 91 |

### 8.2 Classification Counts

| Label | Count | Notes |
|-------|-------|-------|
| `[OBSERVED]` | 38 | Directly verified by reading contract code, test files, or grep output |
| `[INFERRED]` | 18 | Follows from doctrine or architectural gap; absence is logical consequence |
| `[POTENTIAL]` | 6 | Requires targeted test-suite review; partial coverage may exist |
| `[CORRECTED]` | 4 | Original claims contradicted by evidence; restated accurately |

### 8.3 Summary Table (corrected)

| Category | Implemented | Gap | Evidence | Deferred Until |
|----------|-------------|-----|----------|----------------|
| Reserve class storage | None | No on-chain reserve class state machine | `[OBSERVED]` | Phase 2 contract work |
| `LIQUIDITY_CAP` enforcement | Reference only in kernel | Not enforced in `mint()` | `[OBSERVED]` | Phase 2: PahlaviToken update |
| `MIN_RESERVE_RATIO` enforcement | Active in `mint()` | `totalReserves` not SWF-linked | `[OBSERVED]` | Phase 2: reserve update path |
| SWF → backing linkage | None | `distributeAnnualYield()` and `receiveReclaimedAsset()` do not call `updateReserves()` | `[OBSERVED]` | Phase 2: reserve update path |
| Classification state machine | None | Entire classification protocol is doctrine-only | `[OBSERVED]` | Phase 2 contract work |
| Disbursement execution | None | Welfare floor, VelocityFee, and provincial distributions are inert | `[OBSERVED]` | Phase 2: disbursement contract |
| TR-06 automated detection | None | Cap breach is invisible without oracle flagging | `[OBSERVED]` | Phase 2: oracle monitoring |
| TR-05 automated detection | None | SWF independence violations require manual oracle flagging | `[OBSERVED]` | Phase 2: oracle monitoring |
| SWF encumbrance tracking | None | Concurrent withdrawal proposals can reference full unencumbered balance | `[OBSERVED]` | Phase 2 contract work |
| Oracle confirmation sync | Feeder flags linked | `confirmViolation()` state is oracle-local; kernel violation confirmation state is separate | `[CORRECTED]` | Phase 2: cross-contract design |

## Preserved Non-Claims

- Step-12 is not closed. External audit, oracle operations, and human review evidence remain open.
- Step-13 migration is complete but not formally signed off.
- This document does not claim production readiness, deployment authorization, or formal verification completion.
- None of the gaps above authorize changing `LIQUIDITY_CAP`, `MIN_RESERVE_RATIO`, `MULTISIG_THRESHOLD`, `TRIGGER_TIMEOUT`, `MULTISIG_REQUIRED`, or `COUNCIL_THRESHOLD`.
- None of the gaps above authorize making the Kernel upgradeable.
- None of the gaps above authorize granting `BURNER_ROLE` or `MINTER_ROLE` to `VelocityFee.sol` without a separate authorized review.
- Human freeze authority must remain outside automation. No future implementation of gap closures may replace final human or governance judgment for freeze and emergency classification decisions.
