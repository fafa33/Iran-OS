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

---

## Table of Contents

1. [Sovereign Reserve Model](#1-sovereign-reserve-model)
2. [Treasury Accounting Rules](#2-treasury-accounting-rules)
3. [Reserve Classification Protocol](#3-reserve-classification-protocol)
4. [Monetary Expansion Constraints](#4-monetary-expansion-constraints)
5. [Sovereign Wealth Fund State Transitions](#5-sovereign-wealth-fund-state-transitions)
6. [Disbursement and Allocation Boundaries](#6-disbursement-and-allocation-boundaries)
7. [Trigger Conditions for Reserve and Treasury Violations](#7-trigger-conditions-for-reserve-and-treasury-violations)

---

## 1. Sovereign Reserve Model

### 1.1 Doctrine Source

`docs/STEP4_SOVEREIGN_RESERVE_MODEL.md`. Defines six reserve classes (Locked, Deployable, Emergency, Encumbered, Reclaimed, Non-Reserve Treasury Balance), conservation boundary, cross-layer conservation invariants, oracle signal boundary, and human freeze authority boundary.

### 1.2 Current Implementation Status

`SovereignWealthFund.sol` implements three asset layers (L1, L2, L3) with `balance`, `target`, `totalDeposited`, `totalWithdrawn`, and `lastUpdated` fields. Layer balances are accounting totals; they do not map to reserve classes. No storage variable names or distinguishes Locked, Deployable, Encumbered, or Emergency sub-balances within or across layers.

`PahlaviToken.sol` maintains `totalReserves` as a single mutable uint256, updatable via `updateReserves()` (kernel-only). This is a flat backing figure with no connection to reserve class state in the SWF.

`AssetFreeze.sol` maintains `totalFrozenValue` as an aggregate of all active frozen asset `estimatedValue` fields. This figure is decremented on `transferToSWF()` and `releaseAsset()` but is not referenced by any reserve or monetary backing check.

### 1.3 Missing Storage Structures

- No per-layer or aggregate reserve class state (no `lockedBalance`, `deployableBalance`, `encumberedBalance`, `emergencyBalance` storage).
- No mapping from SWF layer balances to recognized reserve classes.
- No storage linking `totalFrozenValue` in `AssetFreeze` to encumbered reserve state in `SovereignWealthFund`.
- No `recognizedReserveBacking` derived view that excludes encumbered, frozen, locked, or pending value before exposing a deployable backing figure.
- `totalReserves` in `PahlaviToken.sol` is a raw number with no classification-state awareness.

### 1.4 Missing Invariant Tests

- No test asserts that `totalReserves` in `PahlaviToken` cannot exceed the sum of recognized (non-encumbered, non-frozen, non-locked) SWF layer balances.
- No test asserts conservation: reclassification must not increase total recognized value.
- No test asserts that `totalFrozenValue` in `AssetFreeze` cannot be simultaneously counted as deployable backing.
- No negative test for failed classification leaving protected state neutral.

### 1.5 Missing Trigger Conditions

- No trigger fires when `totalReserves` in `PahlaviToken` falls below a floor relative to recognized SWF backing.
- No trigger fires when `totalFrozenValue` in `AssetFreeze` exceeds a threshold relative to SWF L1 balance (indicating over-encumbrance).
- TR-05 (SWF independence) is defined in `kernel.sol` but there is no automated signal path from SWF state to the oracle flag path that would raise TR-05.

### 1.6 Runtime Enforcement Gaps

- `updateReserves()` in `PahlaviToken.sol` accepts any kernel-supplied value without verifying it against SWF layer balances, encumbrance state, or frozen asset totals.
- No runtime check prevents the kernel from setting `totalReserves` higher than recognized backing.
- Conservation boundary is doctrinal only — no revert path guards against value creation through classification.

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

- No `encumberedBalance` or `pendingBalance` field in `Treasury.sol` or `BudgetAllocation.sol`.
- No `frozenBalance` that distinguishes freeze-state from unspent budget.
- No `deployableBalance` view that derives available balance after subtracting encumbrances, locks, and frozen value.
- No `reclaimedBalance` tracking in `Treasury.sol` separate from general inflows.
- No audit record structure for the six-stage sequence (signal → review → recommendation → authorization → execution → accounting mutation) required by Step-4.1.

### 2.4 Missing Invariant Tests

- No test asserts that a `signTransaction()` success in `Treasury.sol` preserves the exact-once accounting property (i.e., signing twice does not debit twice).
- No test asserts conservation: a failed `recordExpenditure()` in `BudgetAllocation.sol` leaves `spent` unchanged.
- No test asserts that blocked-address transactions cannot reduce budget line balances.
- No test verifies that a `lockSectorBudget()` call prevents any subsequent `recordExpenditure()` against that sector from mutating state.

### 2.5 Missing Trigger Conditions

- No trigger fires when a budget sector's `spent / allocated` ratio exceeds a configurable threshold.
- No trigger is linked to `ExpenditureFlagged` events — auditor flagging is advisory only; no automatic escalation path exists.
- No trigger fires when the sum of all sector `spent` values approaches the total `TOTAL_BUDGET`.

### 2.6 Runtime Enforcement Gaps

- `recordExpenditure()` in `BudgetAllocation.sol` checks `sb.spent + amount <= sb.allocated` but does not check whether the sector is approaching an emergency reserve boundary.
- `Treasury.sol` `signTransaction()` marks `executed = true` before reducing any balance — the transaction is marked executed whether or not a downstream payment occurs, because no token transfer is triggered.
- The six audit stages (signal → execution) required by doctrine exist nowhere as a enforced state machine.

### 2.7 Non-Claims and Blockers

- Step-12 is not closed. Treasury accounting evidence and external audit preparation are listed as Step-12 blockers. This gap map does not close those items.
- Balance class implementation requires cross-contract storage additions. Deferred.
- The six-stage audit distinction is governance doctrine. It cannot be fully enforced on-chain without redesigning the approval flow.

---

## 3. Reserve Classification Protocol

### 3.1 Doctrine Source

`docs/STEP4_2_RESERVE_CLASSIFICATION_PROTOCOL.md`. Defines twelve reserve classification states, allowed transition table (fourteen transitions), forbidden transition categories, classification authority requirements, exact-once classification accounting, failed-path neutrality, and replay resistance.

### 3.2 Current Implementation Status

No reserve classification state machine exists in any contract. The closest approximation is the `FreezeStatus` enum in `AssetFreeze.sol` (Active → UnderReview → Confirmed → Released), which is a freeze lifecycle state, not a reserve classification state.

`SovereignWealthFund.sol` has no classification state per layer or per deposit. All deposits flow directly into layer balances without a pending → recognized → classified sequence.

`PahlaviToken.sol` uses `totalReserves` as the recognized backing figure, but this value is set externally by the kernel without going through a classification protocol.

### 3.3 Missing Storage Structures

- No `ClassificationState` enum or equivalent covering: Unclassified, Pending, Recognized, Locked, Deployable, Emergency, Encumbered, Frozen, PendingReclassification, Rejected, Reclaimed.
- No `classificationRecords` mapping from balance identifier → classification state.
- No `classificationAuthority` access control beyond general COUNCIL_ROLE or KERNEL_ROLE.
- No `classificationAuditLog` event structure capturing source state, target state, authorization basis, and conservation boundary reference.
- No `rejectedClassification` record storage.

### 3.4 Missing Invariant Tests

- No test exercises a classification proposal → rejection path to verify protected state remains neutral.
- No test verifies that a replayed classification attempt does not increment recognized backing.
- No test asserts that reclassification from Deployable → Encumbered does not change total recognized value.
- No test confirms that an Unclassified Treasury Balance cannot be used as recognized backing before classification.
- No test verifies that a Frozen Reserve cannot become Deployable without an explicit release authorization path.

### 3.5 Missing Trigger Conditions

- No trigger fires when a large-value balance remains Unclassified beyond a time threshold.
- No trigger fires on a rejected classification that may indicate a governance dispute.
- No trigger links classification state changes to oracle signals (consistent with the oracle-boundary doctrine, but the absence of any signal path means classification disputes are invisible to the trigger system).

### 3.6 Runtime Enforcement Gaps

- The entire classification state machine is absent from runtime. There is no revert path enforcing the fourteen allowed transitions or blocking the forbidden ones.
- `depositToL1()` / `depositToL2()` / `depositToL3()` accept any authorized deposit and immediately credit balance without a pending → recognized → classified sequence.
- `updateReserves()` in `PahlaviToken.sol` bypasses classification entirely: it directly sets `totalReserves` without verifying the source balance has passed authorized classification.
- `receiveReclaimedAsset()` in `SovereignWealthFund.sol` correctly requires RECLAIM_ROLE, but the credited amount is not subject to a classification review before it increases L1 balance.

### 3.7 Non-Claims and Blockers

- Classification state machine implementation requires significant storage additions and a new governance flow. This is deferred work — not a Step-14 deliverable.
- Step-12 is not closed. Classification authority evidence is a Step-12 open item.
- Oracle boundary doctrine prohibits oracle signals from autonomously classifying reserves. Any future classification UI must preserve this boundary.

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

- No `recognizedBackingBoundary` storage variable derived from classified, non-encumbered, non-frozen, non-locked SWF balances.
- No `encumberedBacking` exclusion field that reduces effective backing before the `reserveCompliant()` check.
- No cross-contract linkage between `SovereignWealthFund.totalAssets()` and `PahlaviToken.totalReserves`.
- No `hiddenMintingPathGuard` — no check that `distributeAnnualYield()`, `receiveReclaimedAsset()`, or reclassification cannot increase mint capacity indirectly.

### 4.4 Missing Invariant Tests

- No test asserts that `totalSupply() + mintAmount <= LIQUIDITY_CAP` reverts if exceeded. This is the highest-priority missing invariant test in the monetary layer.
- No test asserts that setting `totalReserves` above SWF `totalAssets()` causes subsequent `mint()` to fail.
- No test verifies that `distributeAnnualYield()` does not increase effective mint capacity without a corresponding oracle-verified reserve event.
- No test asserts expansion neutrality: failed mint attempts must not mutate `totalReserves` or any SWF layer balance.
- No test asserts that `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` remain non-configurable (no setter exists — this is a positive fact, but not a tested invariant).

### 4.5 Missing Trigger Conditions

- TR-06 (`LIQUIDITY_CAP`) is defined in `kernel.sol` as a violation code. No runtime path fires TR-06 when `totalSupply()` approaches or exceeds the cap. The only path to TR-06 is an oracle manually flagging the violation via `flagViolation()`.
- No automatic trigger fires when `totalReserves` diverges from SWF-backed recognized value by more than a threshold.
- No trigger fires when `MIN_RESERVE_RATIO` compliance falls within a warning band (e.g., ratio between 333 and 400 — still compliant but approaching threshold).

### 4.6 Runtime Enforcement Gaps

- **Critical:** `PahlaviToken.mint()` does not check against `LIQUIDITY_CAP`. Total supply can exceed 900 billion PAH without a revert; detection depends entirely on oracle liveness.
- `updateReserves()` accepts any kernel-supplied value. An overstated reserve figure enables under-backed minting that passes the `reserveCompliant()` check while actual recognized backing is insufficient.
- `distributeAnnualYield()` increases L1 balance without a corresponding `updateReserves()` call. L2-to-L1 yield flow is invisible to the monetary backing check.
- `receiveReclaimedAsset()` increases L1 balance without a corresponding `updateReserves()` call. Reclaimed asset intake is invisible to the monetary backing check.
- No on-chain circuit breaker pauses minting when the reserve ratio approaches `MIN_RESERVE_RATIO` from above.

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

| Transition | Contract function | Status |
|-----------|------------------|--------|
| Zero Balance → Layer Balance Recorded | `depositToL1/L2/L3()` | ✓ Implemented |
| Pending Deposit → Recognized Deposit | `depositToL1/L2/L3()` (no pending stage — immediate) | Partial |
| Pending Withdrawal → Executed Withdrawal | `proposeWithdrawal()` + `signWithdrawal()` | ✓ Implemented |
| Pending Reclaimed Asset → Recognized Reclaimed Asset | `receiveReclaimedAsset()` (RECLAIM_ROLE) | ✓ Implemented |
| L2 Yield → L1 Credit | `distributeAnnualYield()` | ✓ Implemented |
| Replay resistance for executed withdrawals | `tx_.executed` flag check | ✓ Implemented |
| Over-withdrawal neutrality | `require(balance >= amount)` | ✓ Implemented |

The following transitions are absent:

| Transition | Status |
|-----------|--------|
| Layer Balance Recorded → SWF Backing Candidate (classification review) | ✗ Not implemented |
| SWF Backing Candidate → SWF Reserve-Backed Balance | ✗ Not implemented |
| Layer Balance → Encumbered SWF Balance (pending claims) | ✗ Not implemented |
| Encumbered SWF Balance → Deployable after release | ✗ Not implemented |
| Frozen SWF-Linked Balance (freeze state affect) | ✗ Not implemented |
| Frozen → Prior class after human release authority | ✗ Not implemented |

### 5.3 Missing Storage Structures

- No `pendingDeposit` staging area — deposits become immediately recognized without a pending → authorized → confirmed sequence.
- No `encumberedAmount` per layer or per withdrawal proposal tracking how much of a layer balance is committed to pending withdrawals.
- No `backingCandidateFlag` per deposit record indicating it is under classification review.
- No `frozenLayerAmount` tracking how much of a layer is affected by asset freeze linkage.

### 5.4 Missing Invariant Tests

- No test asserts that a failed `receiveReclaimedAsset()` (e.g., caller lacking RECLAIM_ROLE) leaves all layer balances unchanged.
- No test asserts that `totalAssets()` equals L1 + L2 + L3 balances after any sequence of deposits, withdrawals, and yield distributions.
- No test asserts that a pending withdrawal commitment reduces the effectively deployable balance even before execution.
- No test asserts that `distributeAnnualYield()` conserves total assets (L1 increases by exactly the amount L2 decreases).
- No test asserts that `receiveReclaimedAsset()` with amount = 0 reverts without state mutation.

### 5.5 Missing Trigger Conditions

- No trigger fires when any SWF layer balance falls below its `target` by more than a defined threshold.
- No trigger fires when the sum of pending (proposed, unsigned) withdrawals across all layers exceeds a fraction of total assets — indicating unusual drain activity.
- No trigger fires when `distributeAnnualYield()` is called when L2 balance is below target by more than a threshold (yield at low L2 may signal structural reserve stress).
- TR-05 (SWF independence) has no automated signal path from SWF state.

### 5.6 Runtime Enforcement Gaps

- Deposits immediately credit layer balance without a pending → authorized sequence. A governance error (wrong layer, wrong amount) has no pre-execution review gate at the SWF contract level.
- `distributeAnnualYield()` does not verify that L2 balance remains above `L2_TARGET` after the yield transfer. Repeated yield distributions can drain L2 below target without a revert.
- `signWithdrawal()` does not check that the withdrawal amount is below a fraction of the layer balance that would leave the layer at or above a minimum floor.
- No `encumberedAmount` deduction: if two withdrawal proposals are both pending, the second one can be proposed against the full balance without accounting for the first pending commitment.

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

`Provincial.sol` accumulates `provincialBalance[provinceId]` from oracle-reported revenue at the 30% provincial share but has no `withdrawProvincialFunds()` function.

### 6.3 Missing Storage Structures

- No disbursement contract exists that reads from SWF L1 and transfers PAH to welfare recipients.
- No per-citizen disbursement record (amount, period, basis) separate from `CitizenCard` status fields.
- No `VelocityFee` escrow or burn destination address — collected fee has no accounting target.
- No `provincialWithdrawal` function or authorization path in `Provincial.sol`.
- No `SWF → Treasury → CitizenCard → disbursement` routing structure.

### 6.4 Missing Invariant Tests

- No test asserts that `CitizenCard` status updates do not transfer PAH.
- No test asserts that `VelocityFee.FeeLevied` events do not reduce any token balance.
- No test asserts that `Treasury.signTransaction()` at threshold does not reduce any PAH balance (confirms the inert execution gap).
- No test asserts that `provincialBalance` increases correctly from oracle revenue submissions and cannot decrease without a (missing) withdrawal function.

### 6.5 Missing Trigger Conditions

- No trigger fires when SWF L1 balance falls below the 1-month welfare disbursement liability (total eligible citizens × `MIN_WAGE`).
- No trigger fires when `VelocityFee` accumulated liability exceeds a threshold without execution.
- No trigger fires when provincial balances exceed a ceiling with no disbursement path (indicating governance failure).

### 6.6 Runtime Enforcement Gaps

- **Welfare floor is entirely unenforced on-chain.** The 1,000 PAH/month minimum is a storage constant, not a payment execution. No contract disburses PAH to any citizen.
- **VelocityFee has zero economic effect.** The fee is computed and emitted but no token operation follows.
- **Provincial 30% share accumulates without a spend path.** `provincialBalance` grows without bound if oracle revenue keeps being reported.
- **Treasury execution is a no-op for actual token flow.** `signTransaction()` completion does not move PAH.
- The entire disbursement layer between SWF L1 and end recipients is absent.

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

TR-05 and TR-06 are the reserve and treasury-relevant trigger codes. Both require manual oracle flagging via `flagViolation()`. Neither has an automated detection path.

`API3Oracle.sol` has an independent `flagViolation()` path (FEEDER_ROLE) that writes to an internal `violations` mapping. This path is **not linked** to `kernel.flagViolation()` — a feeder flag in the oracle does not propagate to the kernel trigger system.

### 7.3 Missing Storage Structures

- No `reserveHealthSignal` storage in any contract that would feed into an oracle or trigger path automatically.
- No `liquidityCapBreachRecord` — a breach of `LIQUIDITY_CAP` leaves no on-chain trace if it occurs without oracle flagging.
- No cross-contract event listener or callback that connects SWF layer state to the kernel trigger system.
- No `MIN_RESERVE_RATIO` breach record beyond the `revert` in `PahlaviToken.mint()` — a near-breach that does not trigger a revert leaves no trace.

### 7.4 Missing Invariant Tests

- No test asserts that `totalSupply()` approaching `LIQUIDITY_CAP` causes an oracle to flag TR-06. (This test cannot be written until the oracle signal path for cap monitoring is designed.)
- No test asserts that TR-05 is flagged when `SovereignWealthFund` COUNCIL_ROLE is transferred to an unauthorized address.
- No test asserts that `API3Oracle.flagViolation()` and `kernel.flagViolation()` produce consistent violation records for the same event.
- No test asserts that a TR-06 flag → 7-of-9 multi-sig → `_activateTrigger()` sequence correctly revokes SWF or treasury roles from the offending address.

### 7.5 Missing Trigger Conditions

- **TR-06 (Liquidity Cap):** No automatic detection. `PahlaviToken.mint()` does not check against `LIQUIDITY_CAP`, so a cap breach does not even produce a revert that an oracle could observe. Detection is entirely dependent on oracle operators monitoring `totalSupply()` off-chain.
- **TR-05 (SWF Independence):** No automated signal from SWF to kernel. Violations of SWF governance (unauthorized role grant, unauthorized withdrawal) must be detected off-chain and flagged manually.
- **MIN_RESERVE_RATIO warning band:** No trigger fires when the ratio is between 333 and 400 (compliant but within 20% of the minimum). Near-threshold minting is invisible to the trigger system.
- **Oracle channel unification:** `API3Oracle.flagViolation()` and `kernel.flagViolation()` are parallel and unlinked. A feeder alert in API3Oracle has no effect on the kernel trigger cycle.

### 7.6 Runtime Enforcement Gaps

- `kernel.sol` holds `LIQUIDITY_CAP` but `PahlaviToken.sol` does not import or reference it. The cap is a doctrinal constant with no enforcement point in the token contract.
- The kernel `flagViolation()` function requires oracle role holders to act. If oracle role holders are unavailable or compromised, TR-05 and TR-06 have no automated fallback.
- There is no circuit breaker in the SWF that halts withdrawals when `totalAssets()` falls below a floor, independent of the trigger system.
- `TriggerProtocol.executeTrigger()` can revoke roles from a violating address, but it does not pause token minting, freeze SWF withdrawals, or halt treasury spending independently of the multi-sig cycle completing.

### 7.7 Non-Claims and Blockers

- Adding `LIQUIDITY_CAP` enforcement to `PahlaviToken.mint()` is a contract change. Deferred.
- Linking API3Oracle and kernel violation flags requires a cross-contract design decision. Deferred.
- An automated reserve health signal requires oracle infrastructure that is part of Step-12 evidence. Step-12 is not closed.
- The trigger system is designed to require human oracle operators by doctrine — full automation of TR-05 and TR-06 detection would contradict the oracle signal boundary requirement. Any future automated signal path must preserve the human-in-the-loop requirement for classification and execution decisions.

---

## Summary of Gaps

| Category | Implemented | Critical Gap | Deferred Until |
|----------|-------------|-------------|----------------|
| Reserve class storage | None | No on-chain reserve class state machine | Phase 2 contract work |
| `LIQUIDITY_CAP` enforcement | Reference only in kernel | Not enforced in `mint()` | Phase 2: PahlaviToken update |
| `MIN_RESERVE_RATIO` enforcement | Active in `mint()` | `totalReserves` not SWF-linked | Phase 2: reserve update path |
| SWF → backing linkage | None | `distributeAnnualYield()` and `receiveReclaimedAsset()` do not update `totalReserves` | Phase 2: reserve update path |
| Classification state machine | None | Entire classification protocol is doctrine-only | Phase 2 contract work |
| Disbursement execution | None | Welfare floor, VelocityFee, and provincial distributions are inert | Phase 2: disbursement contract |
| TR-06 automated detection | None | Cap breach is invisible without oracle flagging | Phase 2: oracle monitoring |
| TR-05 automated detection | None | SWF independence violations require manual flagging | Phase 2: oracle monitoring |
| SWF encumbrance tracking | None | Pending withdrawals do not reduce effectively deployable balance | Phase 2 contract work |
| Oracle channel unification | None | API3Oracle and kernel flags are unlinked | Phase 2: cross-contract design |

## Preserved Non-Claims

- Step-12 is not closed. External audit, oracle operations, and human review evidence remain open.
- Step-13 migration is complete but not formally signed off.
- This document does not claim production readiness, deployment authorization, or formal verification completion.
- None of the gaps above authorize changing `LIQUIDITY_CAP`, `MIN_RESERVE_RATIO`, `MULTISIG_THRESHOLD`, `TRIGGER_TIMEOUT`, `MULTISIG_REQUIRED`, or `COUNCIL_THRESHOLD`.
- None of the gaps above authorize making the Kernel upgradeable.
- None of the gaps above authorize granting `BURNER_ROLE` or `MINTER_ROLE` to `VelocityFee.sol` without a separate authorized review.
- Human freeze authority must remain outside automation. No future implementation of gap closures may replace final human or governance judgment for freeze and emergency classification decisions.
