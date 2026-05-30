# Step-21 Sovereign Reserve Runtime Model

## Scope and Non-Goals

This document formalizes the runtime reserve model that bridges governance doctrine and implementation for IranOS. It maps reserve categories, ownership boundaries, lifecycle states, permitted transitions, accounting invariants, interaction boundaries, enforcement candidates, and implementation mapping targets — all grounded in the current contract state as of commit `bc647b1`.

**This document is documentation only.** It does not change contracts, tests, architecture, thresholds, trigger codes, Kernel assumptions, governance assumptions, or monetary constants. It does not claim completion, readiness, deployment authorization, or sign-off. It does not close Step-12 or Step-13. It does not alter human freeze authority.

### Preserved Constants

| Constant | Contract | Value |
|---|---|---|
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `kernel.sol`, `PahlaviToken.sol` | 900,000,000,000 × 1e18 PAH |
| `MIN_RESERVE_RATIO` | `kernel.sol`, `PahlaviToken.sol` | 333 (33.3‰) |
| `MULTISIG_THRESHOLD` | `kernel.sol` | 7 of 9 |
| `TRIGGER_TIMEOUT` | `kernel.sol` | 72 hours |
| `MULTISIG_REQUIRED` | `SovereignWealthFund.sol` | 3 of N |
| `ANNUAL_YIELD` | `SovereignWealthFund.sol` | 150 (15.0‰ of L2 balance) |
| `L1_TARGET` | `SovereignWealthFund.sol` | 300,000,000,000 × 1e18 |
| `L2_TARGET` | `SovereignWealthFund.sol` | 300,000,000,000 × 1e18 |
| `L3_TARGET` | `SovereignWealthFund.sol` | 2,000,000,000,000 × 1e18 |
| `ANNUAL_BUDGET_CAP` | `Treasury.sol` | 150,000,000,000 × 1e18 |

None of the items below authorize changing these constants.

---

## Table of Contents

1. [Preserved Checkpoints](#1-preserved-checkpoints)
2. [Reserve Classes](#2-reserve-classes)
3. [Reserve Lifecycle States](#3-reserve-lifecycle-states)
4. [Permitted State Transitions](#4-permitted-state-transitions)
5. [Accounting Invariants](#5-accounting-invariants)
6. [Interaction Boundaries](#6-interaction-boundaries)
7. [Runtime Enforcement Candidates](#7-runtime-enforcement-candidates)
8. [Implementation Mapping Candidates](#8-implementation-mapping-candidates)
9. [Design Gap Register](#9-design-gap-register)
10. [Preserved Non-Claims](#10-preserved-non-claims)

---

## 1. Preserved Checkpoints

Step-21 preserves the following checkpoint assumptions:

- Step-3 runtime hardening remains the current test-backed runtime baseline.
- Step-4 through Step-4.5 sovereign reserve formalization assumptions remain preserved.
- Step-5 through Step-5.3 role authority, storage invariant, executable invariant, and runtime enforcement assumptions remain preserved.
- Steps 6 through 20 remain as documented; no step is retroactively modified.
- Step-12 remains open (external audit, oracle evidence, human review).
- Step-13 remains open (AI-assisted internal review).
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, `MULTISIG_THRESHOLD`, `TRIGGER_TIMEOUT`, `MULTISIG_REQUIRED`, and `COUNCIL_THRESHOLD` remain unchanged and non-configurable.
- Oracle and API3 components remain evidence providers, not autonomous decision-makers.
- Human final freeze authority remains outside automation.
- SWF remains a sovereign reserve resilience layer (SRR-role), not a profit-maximizing sovereign investment vehicle or DeFi mechanism.

Step-21 adds runtime specificity: it anchors reserve model language to concrete storage fields, function signatures, modifier guards, and event records in the current contracts. It does not alter the doctrine established in Steps 4 and 5.

---

## 2. Reserve Classes

The IranOS reserve model recognizes seven classes at runtime. Each class maps to identifiable contract state.

### RC-01 — L1 Cash Reserve

**Description:** Liquid, immediately deployable reserve. Represents the most accessible tier of sovereign reserve.

**Contract anchor:** `SovereignWealthFund.layerL1` (`AssetLayer` struct — `balance`, `target`, `totalDeposited`, `totalWithdrawn`, `lastUpdated`)

**Target:** `L1_TARGET = 300,000,000,000 × 1e18`

**Governance path:** `depositToL1()` (COUNCIL_ROLE), `proposeWithdrawal(layer=1)` + `signWithdrawal()` (COUNCIL_ROLE, 3-of-N), `distributeAnnualYield()` inbound (COUNCIL_ROLE)

**Fill metric:** `layerFillRatio(1)` = `(layerL1.balance × 1000) / L1_TARGET`

**Monetary link:** L1 balance value may be recognized as backing for PAH minting via `totalReserves` update in `PahlaviToken`. L1 balance does not automatically update `totalReserves`; explicit governance action required.

### RC-02 — L2 Productive Reserve

**Description:** Income-generating reserve. Held for structured yield distribution into L1. Not deployed speculatively.

**Contract anchor:** `SovereignWealthFund.layerL2` (`AssetLayer` struct)

**Target:** `L2_TARGET = 300,000,000,000 × 1e18`

**Governance path:** `depositToL2()` (COUNCIL_ROLE), `proposeWithdrawal(layer=2)` + `signWithdrawal()` (COUNCIL_ROLE), `distributeAnnualYield()` outbound: 15% of `layerL2.balance` moves to L1

**Yield formula:** `yield = (layerL2.balance × ANNUAL_YIELD) / 1000` where `ANNUAL_YIELD = 150`

**Conservation note:** `distributeAnnualYield()` decrements `layerL2.balance` and increments `layerL1.balance` by the same yield amount. `totalAssets()` is conserved. `layerL2.totalWithdrawn` is **not** updated by yield distribution (documented design gap DG-02, carried from P-04).

### RC-03 — L3 Strategic Reserve

**Description:** Long-term strategic and pledged assets. Least liquid. Not available for operational deployment without full governance path.

**Contract anchor:** `SovereignWealthFund.layerL3` (`AssetLayer` struct)

**Target:** `L3_TARGET = 2,000,000,000,000 × 1e18`

**Governance path:** `depositToL3()` (COUNCIL_ROLE), `proposeWithdrawal(layer=3)` + `signWithdrawal()` (COUNCIL_ROLE, 3-of-N)

**Note:** L3 has no yield distribution path. It is not a candidate for `distributeAnnualYield()`.

### RC-04 — Reclaimed Reserve

**Description:** Value recovered through the authorized reclaim path from `AssetFreeze`. Enters the reserve system via `receiveReclaimedAsset()`. Credited into L1 accounting.

**Contract anchor:** `SovereignWealthFund.receiveReclaimedAsset()` updates `layerL1.balance` and `layerL1.totalDeposited` (RECLAIM_ROLE guard). Originates from `AssetFreeze.sol` reclaim flow with `COUNCIL_ROLE` confirmation.

**Authority constraint:** Only addresses holding `RECLAIM_ROLE` in SWF may call `receiveReclaimedAsset()`. This role is assigned to the `AssetFreeze` contract, not to individual governance actors.

**Conservation note:** Reclaimed assets credit L1 balance exactly once per authorized reclaim event. Replay resistance is enforced by the AssetFreeze contract's status lifecycle (`Active → UnderReview → Confirmed → TransferredToSWF`).

### RC-05 — Encumbered Reserve

**Description:** L1, L2, or L3 balance subject to a pending multi-sig withdrawal. The amount is recorded but not yet debited; it must not be treated as freely deployable.

**Contract anchor:** `SovereignWealthFund.transactions[txId]` where `executed == false` and `signaturesCount < MULTISIG_REQUIRED`. The pending amount is not formally deducted from `layerX.balance` until `signaturesCount >= MULTISIG_REQUIRED`.

**Design boundary:** The current implementation does not pre-reserve the pending withdrawal amount from `layerX.balance` during the proposal phase. The deduction occurs atomically in `signWithdrawal()` when the threshold is crossed. This means `layerX.balance` reflects the full balance (including pending amounts) until execution. Auditors and monitoring systems must account for this by reading pending transaction state alongside layer balances.

**Conservation note:** Rejected, unauthorized, over-withdrawal, and replayed withdrawal paths must leave `layerX.balance` and `layerX.totalWithdrawn` unchanged.

### RC-06 — Backing-Recognized Reserve

**Description:** SWF-accounted value that has been formally recognized as PAH backing in `PahlaviToken.totalReserves`. Only this value is used to gate minting.

**Contract anchor:** `PahlaviToken.totalReserves` (set via `updateReserves()`, KERNEL_ROLE guard). The `reserveCompliant()` modifier gates all minting against this value.

**Minting constraint:** At mint time: `(totalReserves × 1000) / (totalSupply() + mintAmount) >= MIN_RESERVE_RATIO`.

**Ownership boundary:** `totalReserves` is a separate accounting ledger inside `PahlaviToken`. It does not automatically mirror `SovereignWealthFund.totalAssets()`. The link between SWF balances and `totalReserves` requires explicit governance action (kernel calls `updateReserves()`). This separation is intentional: not all SWF-accounted value is recognized as PAH backing.

### RC-07 — Non-Reserve Treasury Balance

**Description:** Budget allocations and expenditures managed by the `Treasury` and `BudgetAllocation` contracts. Operationally distinct from the SWF reserve layers. Not recognized as reserve backing.

**Contract anchors:** `Treasury.budgetLines[]`, `BudgetAllocation.getSectorBudget()`, `Treasury.transactions[]`

**Separation boundary:** The Treasury tracks authorized government expenditure (`ANNUAL_BUDGET_CAP = 150B PAH`). The SWF tracks sovereign reserve assets (L1 + L2 + L3 targets = 2.6T). These are separate accounting domains with no automatic cross-layer value movement. TriggerProtocol may block a treasury address (`blockAddressByTrigger`), but it does not move or reclassify SWF balances.

---

## 3. Reserve Lifecycle States

The following states apply within each reserve class. States are accounting labels; they do not create value or authority.

### Layer-level states (L1, L2, L3)

| State | Description | Contract evidence |
|---|---|---|
| `ZERO` | No balance recorded | `layerX.balance == 0` |
| `RECORDED` | Authorized deposit has credited balance | `layerX.balance > 0`, `layerX.totalDeposited > 0` |
| `PENDING_WITHDRAWAL` | Withdrawal proposed, below threshold | `tx.executed == false`, `tx.signaturesCount < MULTISIG_REQUIRED` |
| `EXECUTED_WITHDRAWAL` | Threshold reached, balance debited exactly once | `tx.executed == true`, `layerX.balance` decremented, `layerX.totalWithdrawn` incremented |
| `YIELD_TRANSFERRED` | 15% of L2 moved to L1 in a single `distributeAnnualYield()` call | `layerL2.balance` decremented, `layerL1.balance` incremented, `layerL1.totalDeposited` incremented |
| `RECLAIM_CREDITED` | Reclaimed asset credited to L1 via RECLAIM_ROLE | `layerL1.balance` incremented, `layerL1.totalDeposited` incremented, `AnnualYieldDistributed` or `DepositToL1` event emitted |
| `BACKING_CANDIDATE` | SWF value eligible for reserve classification review | Governance review only; no contract field tracks this state explicitly |
| `BACKING_RECOGNIZED` | Value credited to `PahlaviToken.totalReserves` via kernel action | `PahlaviToken.totalReserves` updated; `ReservesUpdated` event emitted |

### Token-level states

| State | Description | Contract evidence |
|---|---|---|
| `RESERVE_BELOW_THRESHOLD` | `totalReserves × 1000 / totalSupply < MIN_RESERVE_RATIO` | Blocks minting via `reserveCompliant()` |
| `RESERVE_COMPLIANT` | Reserve ratio satisfied; minting permitted | `ratio >= MIN_RESERVE_RATIO` |
| `EMERGENCY_LOCKED` | PAH transfers paused; `emergencyMode == true` | `PahlaviToken.emergencyMode`, `notInEmergency` modifier blocks `transfer` and `transferFrom` |
| `SUPPLY_AT_CAP` | `totalSupply() == MAX_SUPPLY`; no further minting possible | `PahlaviToken.totalSupply() == 900_000_000_000 × 1e18` |

### Kernel-level states affecting reserves

| State | Description | Contract evidence |
|---|---|---|
| `NORMAL` | No emergency lock; trigger not active | `emergencyLockActive == false` |
| `EMERGENCY_LOCK` | TR-01/02/03 flagged; system locked | `emergencyLockActive == true`; `notLocked()` blocks `grantOfficialAccess()`, `setTriggerProtocol()`, `setSovereignWealthFund()` — CLC-06 |
| `TRIGGER_ACTIVATED` | 7-of-9 confirmed; offender access revoked; TriggerProtocol executed | `violations[id].triggered == true`; `triggerActivationCount` incremented |
| `TREASURY_BLOCKED` | Offender address blocked in Treasury | `Treasury.blockedByTrigger[offender] == true` |

---

## 4. Permitted State Transitions

Each transition identifies the authority basis, the conservation boundary, and the key contract function.

### SWF Layer Transitions

| Transition | Authority | Function | Conservation rule |
|---|---|---|---|
| `ZERO → RECORDED` | COUNCIL_ROLE | `depositToL1()` / `depositToL2()` / `depositToL3()` | `layerX.balance += amount`; `layerX.totalDeposited += amount`; `totalAssets()` increases by `amount` |
| `RECORDED → PENDING_WITHDRAWAL` | COUNCIL_ROLE (proposer) | `proposeWithdrawal()` | Balance unchanged; `txId` created with `signaturesCount = 1` |
| `PENDING_WITHDRAWAL → PENDING_WITHDRAWAL` | COUNCIL_ROLE (additional signer) | `signWithdrawal()` (below threshold) | Balance unchanged; `signaturesCount` incremented |
| `PENDING_WITHDRAWAL → EXECUTED_WITHDRAWAL` | COUNCIL_ROLE (threshold signer) | `signWithdrawal()` (at threshold) | `layerX.balance -= amount`; `layerX.totalWithdrawn += amount`; `totalAssets()` decreases by `amount` |
| `PENDING_WITHDRAWAL → REJECTED` | Any failed path | Reverted call | No state mutation |
| `RECORDED (L2) → YIELD_TRANSFERRED` | COUNCIL_ROLE | `distributeAnnualYield()` | `layerL2.balance -= yield`; `layerL1.balance += yield`; `layerL1.totalDeposited += yield`; `totalAssets()` conserved; `layerL2.totalWithdrawn` NOT updated |
| `ZERO / RECORDED → RECLAIM_CREDITED` | RECLAIM_ROLE | `receiveReclaimedAsset()` | `layerL1.balance += amount`; `layerL1.totalDeposited += amount`; `totalAssets()` increases |

### Forbidden Transitions

| Forbidden | Reason |
|---|---|
| Any transition bypassing COUNCIL_ROLE on deposits or withdrawals | Role guard enforced; revert preserves state |
| Zero-value deposit or reclaim | `require(amount > 0)` enforced in all deposit paths |
| Over-withdrawal | `require(layerX.balance >= tx.amount)` at execution time |
| Replay of executed withdrawal | `require(!tx.executed)` blocks re-execution |
| `distributeAnnualYield()` with zero L2 balance | `require(yield > 0)` blocks zero-yield call |
| L3 yield distribution | No `distributeAnnualYield()` path from L3 exists |
| Autonomous oracle reclassification or minting | No oracle path into `depositToL1/2/3()` or `mint()` |
| Emergency lock releasing SWF value | `emergencyLockActive` affects Kernel ops; does not move SWF balances |

### PahlaviToken Transitions

| Transition | Authority | Function | Conservation rule |
|---|---|---|---|
| `RESERVE_COMPLIANT → SUPPLY_INCREASED` | MINTER_ROLE (SWF) | `mint()` | `totalSupply += amount`; `ratio >= MIN_RESERVE_RATIO` enforced; `totalSupply <= MAX_SUPPLY` enforced |
| `ANY → SUPPLY_DECREASED` | BURNER_ROLE (SWF) | `burn()` | `totalSupply -= amount` |
| `ANY → RESERVE_UPDATED` | KERNEL_ROLE | `updateReserves()` | `totalReserves` updated; `ReservesUpdated` event emitted |
| `ANY → EMERGENCY_LOCKED` | KERNEL_ROLE | `activateEmergency()` | `emergencyMode = true`; transfers blocked |
| `EMERGENCY_LOCKED → NORMAL` | KERNEL_ROLE | `deactivateEmergency()` | `emergencyMode = false` |

### Kernel Trigger Transitions

| Transition | Authority | Function | Conservation rule |
|---|---|---|---|
| `NORMAL → EMERGENCY_LOCK` | ORACLE_ROLE (TR-01/02/03 only) | `flagViolation()` | `emergencyLockActive = true`; SWF balances unchanged |
| `EMERGENCY_LOCK → NORMAL` | COURT_ROLE | `deactivateEmergencyLock()` | `emergencyLockActive = false`; SWF balances unchanged |
| `ANY → TRIGGER_ACTIVATED` | COURT_ROLE × 7 | `signViolation()` at threshold | `violations[id].triggered = true`; kernel roles revoked; TriggerProtocol called |
| `TRIGGER_ACTIVATED → TREASURY_BLOCKED` | TriggerProtocol (internal) | `blockAddressByTrigger()` on Treasury | `Treasury.blockedByTrigger[offender] = true`; SWF COUNCIL_ROLE persists (DG-01) |

---

## 5. Accounting Invariants

The following invariants are derived from contract logic and grounded in storage fields. Invariants are listed with their current test coverage status.

### INV-01 — Total Assets Conservation

**Statement:** At any point, `totalAssets() == layerL1.balance + layerL2.balance + layerL3.balance`.

**Contract basis:** `SovereignWealthFund.totalAssets()` implements this sum directly (line 145).

**When it holds:** Always, by construction. Every deposit, withdrawal, and yield transfer modifies exactly the named layer balance fields.

**Test coverage:** Added in Step-17/Step-18. `test/03_sovereign_wealth_fund.test.js` — multi-operation sequence test and yield conservation test verify this across deposit, withdrawal proposal, and yield distribution.

**Status:** COVERED.

### INV-02 — Yield Distribution Conservation

**Statement:** `distributeAnnualYield()` preserves `totalAssets()`. The yield amount debited from L2 equals the yield amount credited to L1.

**Contract basis:**
```
yield = (layerL2.balance × 150) / 1000
layerL2.balance -= yield
layerL1.balance += yield
layerL1.totalDeposited += yield
```
`totalAssets() = L1.balance + L2.balance + L3.balance` is conserved because L1 gain equals L2 loss.

**Known gap:** `layerL2.totalWithdrawn` is **not** incremented during yield distribution. This means the bookkeeping identity `layerX.balance == layerX.totalDeposited - layerX.totalWithdrawn` does not hold for L2 after yield distribution. (Documented as DG-02.)

**Test coverage:** Added in Step-18. Explicitly asserts `postL2.totalWithdrawn == preL2.totalWithdrawn` as a passing documentation of the current behavior, not as a bug fix.

**Status:** COVERED for conservation; DG-02 documents the totalWithdrawn gap.

### INV-03 — Deposit Monotonicity

**Statement:** `layerX.totalDeposited` never decreases. It is incremented by `depositToL1/2/3()` and by `receiveReclaimedAsset()` (L1 only) and `distributeAnnualYield()` (L1 only). No function decrements `totalDeposited`.

**Contract basis:** No decrement path exists for `totalDeposited` in any SWF function.

**Test coverage:** Implicitly covered by existing SWF deposit tests. No dedicated monotonicity test exists.

**Status:** IMPLICITLY COVERED. No dedicated invariant test.

### INV-04 — Withdrawal Monotonicity

**Statement:** `layerX.totalWithdrawn` never decreases. It is incremented only in `signWithdrawal()` at execution time.

**Contract basis:** No decrement path exists. Yield distribution does NOT increment `layerL2.totalWithdrawn` (DG-02).

**Test coverage:** Implicitly covered. No dedicated monotonicity test.

**Status:** IMPLICITLY COVERED. No dedicated invariant test.

### INV-05 — Reserve Ratio Gate

**Statement:** PAH minting is impossible if `(totalReserves × 1000) / (totalSupply() + mintAmount) < MIN_RESERVE_RATIO`.

**Contract basis:** `reserveCompliant()` modifier in `PahlaviToken.sol` (lines 83–91) enforces this before every `mint()` call.

**Test coverage:** Covered by PahlaviToken test suite.

**Status:** COVERED by runtime guard.

### INV-06 — Supply Cap

**Statement:** `totalSupply()` can never exceed `MAX_SUPPLY = 900,000,000,000 × 1e18`.

**Contract basis:** `require(newSupply <= MAX_SUPPLY)` inside `reserveCompliant()`.

**Status:** COVERED by runtime guard. Matches `LIQUIDITY_CAP` in Kernel.

### INV-07 — Multi-Sig Withdrawal Threshold

**Statement:** A SWF withdrawal executes if and only if `signaturesCount >= MULTISIG_REQUIRED` (= 3). No withdrawal executes with fewer signatures.

**Contract basis:** `signWithdrawal()` checks `tx_.signaturesCount >= MULTISIG_REQUIRED` before executing.

**Status:** COVERED by runtime guard and existing tests.

### INV-08 — Reclaim Exact-Once

**Statement:** A single reclaim event from AssetFreeze credits L1 balance exactly once. The AssetFreeze status lifecycle (`Active → UnderReview → Confirmed → TransferredToSWF`) prevents replay.

**Contract basis:** AssetFreeze status guard + `receiveReclaimedAsset()` RECLAIM_ROLE guard.

**Status:** COVERED by AssetFreeze and SWF role guards.

### INV-09 — Failed-Path Neutrality

**Statement:** Unauthorized, zero-value, over-withdrawal, replay, and failed SWF calls must leave all layer balances, totalDeposited, totalWithdrawn, and txCount unchanged.

**Contract basis:** `onlyRole()` guards, `require(amount > 0)`, `require(layerX.balance >= amount)`, `require(!tx.executed)`, `nonReentrant`.

**Status:** COVERED by existing test suites (Steps 8–9 boundary remediation tests).

### INV-10 — Kernel Trigger Finality

**Statement:** Once `violations[id].triggered == true`, the trigger cannot be re-activated for the same violation. Subsequent `signViolation()` calls revert with `"Kernel: trigger already activated"`.

**Contract basis:** `require(!record.triggered)` in `_activateTrigger()` and `require(!record.triggered)` in `signViolation()`.

**Status:** COVERED by existing tests (trigger lifecycle tests in `08_Trigger_Protocol.test.js`).

---

## 6. Interaction Boundaries

The reserve model spans five contract-to-contract interaction boundaries. Each boundary defines what can and cannot cross.

### IB-01 — SWF → PahlaviToken (Minting Path)

| Property | Detail |
|---|---|
| Direction | SWF initiates `mint()` on PahlaviToken |
| Role required | MINTER_ROLE (granted to SWF address at PahlaviToken construction) |
| What crosses the boundary | Mint amount (PAH supply increase) |
| What does NOT cross | SWF layer balances, totalDeposited, totalWithdrawn — these are SWF-internal |
| Gate | `reserveCompliant()`: checks `totalReserves` (PahlaviToken-internal), not SWF balances directly |
| Gap | `totalReserves` in PahlaviToken is updated separately via `updateReserves()` (KERNEL_ROLE). SWF deposits do not automatically update `totalReserves`. Human/kernel governance action is required to link SWF growth to recognized PAH backing. |
| Conservation | Minting does not change SWF balances. Reserve ratio is enforced at mint time only. |

### IB-02 — Kernel → SWF (Authority and Status)

| Property | Detail |
|---|---|
| Direction | Kernel holds KERNEL_ROLE in SWF |
| What the Kernel can do | No direct accounting calls in current Kernel implementation. KERNEL_ROLE in SWF exists for future use. |
| What the Kernel cannot do | Directly deposit, withdraw, or reclassify SWF value in current implementation |
| Emergency lock effect | `emergencyLockActive` in Kernel blocks Kernel-level operations; does NOT pause SWF directly |
| Trigger effect | Trigger activation does NOT call SWF functions. SWF COUNCIL_ROLE persists after trigger (DG-01). |

### IB-03 — TriggerProtocol → Treasury (Block Path)

| Property | Detail |
|---|---|
| Direction | TriggerProtocol calls `Treasury.blockAddressByTrigger(offender)` |
| What crosses | Block status: `Treasury.blockedByTrigger[offender] = true` |
| What does NOT cross | SWF balances, COUNCIL_ROLE status, reserve state |
| Effect | Offender address cannot initiate or receive Treasury transactions |
| Gap | TriggerProtocol does NOT call any SWF function on trigger activation. Offender retains COUNCIL_ROLE in SWF (DG-01). This was confirmed and documented in Step-20 (P-07). |

### IB-04 — AssetFreeze → SWF (Reclaim Path)

| Property | Detail |
|---|---|
| Direction | AssetFreeze contract (holding RECLAIM_ROLE) calls `SovereignWealthFund.receiveReclaimedAsset()` |
| What crosses | Estimated asset value (credited to L1 balance) |
| Role required | RECLAIM_ROLE in SWF |
| Status lifecycle | AssetFreeze tracks: `Active → UnderReview → Confirmed → TransferredToSWF` |
| Conservation | L1 balance and totalDeposited increase exactly once per confirmed reclaim event |
| Human authority | Freeze and confirm decisions require human/governance authority; not autonomous |

### IB-05 — SWF → Treasury (No Direct Link)

| Property | Detail |
|---|---|
| Direction | None (no direct contract call path) |
| Design intent | SWF reserves and Treasury operational budgets are separate accounting domains |
| Shared authority | Both respond to Kernel authority; neither calls the other directly |
| Conservation boundary | No value moves between SWF and Treasury automatically. Any such movement would require an explicit governance path not currently implemented. |

---

## 7. Runtime Enforcement Candidates

Enforcement candidates are runtime guards already implemented in contracts. They are enumerated here as a reference baseline for future audit and gap analysis.

| Candidate | Contract | Mechanism | Invariant protected |
|---|---|---|---|
| RC-E-01 | `SovereignWealthFund.sol` | `onlyRole(COUNCIL_ROLE)` on all deposit and withdrawal functions | INV-07, INV-09 |
| RC-E-02 | `SovereignWealthFund.sol` | `require(amount > 0)` in all deposit and withdrawal paths | INV-09 |
| RC-E-03 | `SovereignWealthFund.sol` | `require(!tx_.executed)` in `signWithdrawal()` | INV-08, INV-09 (replay resistance) |
| RC-E-04 | `SovereignWealthFund.sol` | `require(layerX.balance >= tx_.amount)` at execution | INV-09 (over-withdrawal) |
| RC-E-05 | `SovereignWealthFund.sol` | `nonReentrant` on all state-changing external functions | INV-09 (reentrancy) |
| RC-E-06 | `SovereignWealthFund.sol` | `require(yield > 0)` in `distributeAnnualYield()` | INV-02 (zero-yield call) |
| RC-E-07 | `PahlaviToken.sol` | `reserveCompliant()` modifier: ratio gate + supply cap | INV-05, INV-06 |
| RC-E-08 | `PahlaviToken.sol` | `notInEmergency()` on `transfer` and `transferFrom` | Token-level emergency state |
| RC-E-09 | `kernel.sol` | `require(code >= 1 && code <= 6)` in `flagViolation()` | Valid violation code range |
| RC-E-10 | `kernel.sol` | `require(!record.triggered)` in `signViolation()` and `_activateTrigger()` | INV-10 (trigger finality) |
| RC-E-11 | `kernel.sol` | `notLocked()` on `grantOfficialAccess()`, `setTriggerProtocol()`, `setSovereignWealthFund()` — CLC-06 remediated | Kernel-level emergency state |
| RC-E-12 | `SovereignWealthFund.sol` | `onlyRole(RECLAIM_ROLE)` in `receiveReclaimedAsset()` | INV-08 (reclaim authority) |
| RC-E-13 | `Treasury.sol` | `notBlocked()` modifier checking `blockedByTrigger` | Post-trigger treasury exclusion |

---

## 8. Implementation Mapping Candidates

Implementation mapping candidates identify where doctrine-derived rules are already implemented, partially implemented, or not yet implemented.

### Status Legend

- `IMPLEMENTED` — runtime guard exists and is tested
- `PARTIAL` — guard exists but test coverage or accounting completeness is incomplete
- `GAP` — guard or accounting rule is not yet implemented (see Design Gap Register)

| Candidate | Doctrine rule | Implementation status | Notes |
|---|---|---|---|
| IM-01 | `totalAssets() = L1 + L2 + L3` | IMPLEMENTED | SWF line 145; tested in Step-17 |
| IM-02 | Yield conservation across distribution | IMPLEMENTED | Tested in Step-18 |
| IM-03 | `MIN_RESERVE_RATIO` gate at mint | IMPLEMENTED | `reserveCompliant()` in PahlaviToken |
| IM-04 | `MAX_SUPPLY` cap at mint | IMPLEMENTED | `reserveCompliant()` in PahlaviToken |
| IM-05 | 3-of-N multi-sig withdrawal | IMPLEMENTED | `MULTISIG_REQUIRED = 3` in SWF |
| IM-06 | 7-of-9 trigger threshold | IMPLEMENTED | `MULTISIG_THRESHOLD = 7` in Kernel |
| IM-07 | Reclaim path authority guard | IMPLEMENTED | RECLAIM_ROLE in `receiveReclaimedAsset()` |
| IM-08 | Treasury block on trigger | IMPLEMENTED | `blockAddressByTrigger()` in TriggerProtocol→Treasury |
| IM-09 | Kernel role revocation on trigger | IMPLEMENTED | `_revokeOfficialAccess()` in Kernel; tested in Step-20 |
| IM-10 | `layerL2.totalWithdrawn` update on yield | GAP | `distributeAnnualYield()` does not update `layerL2.totalWithdrawn` (DG-02) |
| IM-11 | SWF COUNCIL_ROLE revocation on trigger | GAP | TriggerProtocol does not call SWF role revocation (DG-01) |
| IM-12 | Automatic `totalReserves` sync with SWF deposits | GAP | `totalReserves` in PahlaviToken requires explicit kernel action; no automatic sync |
| IM-13 | Pending withdrawal pre-reservation in layer balance | GAP | Layer balance is not pre-reduced during proposal phase; pending amounts are visible only via `transactions[txId]` |
| IM-14 | Freeze-to-SWF path after AssetFreeze confirmation | PARTIAL | `receiveReclaimedAsset()` exists; AssetFreeze status lifecycle exists; end-to-end integration test not present |
| IM-15 | `provincialBalance` monotonic increase | IMPLEMENTED | Tested in Step-19 |

---

## 9. Design Gap Register

The following gaps are carried forward from Steps 14–20. No gap is resolved in this document. All gaps require human review before any remediation is attempted.

### DG-01 — SWF COUNCIL_ROLE Persists After Trigger Activation

**Origin:** Step-14 §7.6 (OBSERVED), Step-20 (P-07, confirmed and tested).

**Description:** When a trigger is activated via the 7-of-9 path, `TriggerProtocol.executeTrigger()` calls `Treasury.blockAddressByTrigger(offender)` but does NOT call `swf.revokeRole(COUNCIL_ROLE, offender)`. An offender holding `COUNCIL_ROLE` in SWF retains that role after trigger activation and could theoretically still call `depositToL1/2/3()`, `proposeWithdrawal()`, `signWithdrawal()`, or `distributeAnnualYield()`.

**Test documentation:** `test/08_Trigger_Protocol.test.js` — `"trigger activation revokes offender kernel role and preserves SWF COUNCIL_ROLE as design-boundary fact"` (commit `bc647b1`) asserts Part A (kernel role revoked) and Part B (SWF COUNCIL_ROLE persists) as the current behavior.

**Classification:** Design gap. Requires human review and explicit governance decision before any remediation.

**Priority:** High — the gap is in a post-trigger enforcement path.

### DG-02 — `layerL2.totalWithdrawn` Not Updated on Yield Distribution

**Origin:** Step-18 (P-04, confirmed and tested).

**Description:** `distributeAnnualYield()` moves 15% of `layerL2.balance` to L1 but does not increment `layerL2.totalWithdrawn`. This makes the accounting identity `layerX.balance == layerX.totalDeposited - layerX.totalWithdrawn` false for L2 after any yield distribution. `totalAssets()` is conserved; the gap is in internal bookkeeping completeness only.

**Test documentation:** `test/03_sovereign_wealth_fund.test.js` — P-04 yield conservation test (Step-18) explicitly asserts `postL2.totalWithdrawn == preL2.totalWithdrawn` as passing documentation of current behavior.

**Classification:** Accounting completeness gap. Does not affect `totalAssets()` conservation or minting constraints.

**Priority:** Medium — affects auditability and forensic reconciliation of L2 accounting history.

### DG-03 — No Automatic Sync Between SWF Deposits and `totalReserves`

**Origin:** Step-21 (new identification).

**Description:** `PahlaviToken.totalReserves` is the sole input to the `MIN_RESERVE_RATIO` minting gate. SWF deposits do not automatically update `totalReserves`. The link requires explicit kernel governance action (`updateReserves()`). This means SWF growth does not automatically increase PAH minting capacity; a governance step is required.

**Classification:** Design-intentional boundary. The separation is documented in Step-6 monetary protocol. However, the path from SWF deposit to recognized backing is not formally tested end-to-end.

**Priority:** Medium — not a bug; the behavior is intentional. But the absence of an integration test for the full SWF-deposit → `updateReserves()` → `mint()` path is a test coverage gap.

### DG-04 — Pending Withdrawal Amount Not Pre-Reserved in Layer Balance

**Origin:** Step-21 (new identification).

**Description:** During the proposal phase (`proposeWithdrawal()`), the pending withdrawal amount remains in `layerX.balance`. It is only debited at execution time in `signWithdrawal()`. A second withdrawal proposal for the same layer could be proposed and signed concurrently, potentially over-withdrawing if both reach threshold before either executes. The `require(layerX.balance >= tx_.amount)` check at execution time provides the final safety net, but the intermediate window creates an accounting ambiguity for auditors reading balances.

**Classification:** Accounting observability gap. The execution-time balance check prevents actual over-withdrawal; the gap is in the auditability of the balance during the pending window.

**Priority:** Low — the execution guard prevents double-spend; the gap is monitoring and transparency only.

---

## 10. Preserved Non-Claims

This document does not claim:

- That the reserve model is formally verified.
- That all invariants have complete test coverage.
- That design gaps DG-01 through DG-04 are resolved or scheduled for remediation.
- That the system is ready for production deployment.
- That Step-12 or Step-13 are closed.
- That human freeze authority has been replaced by automation.
- That SWF balances automatically constitute PAH backing.
- That `totalReserves` in PahlaviToken automatically mirrors SWF `totalAssets()`.
- That any threshold, timeout, or constitutional constant has changed.

Step-21 is a runtime specification artifact. It provides a grounded reference for future invariant testing, audit planning, formal verification scoping, and monitoring system design. It does not authorize any code change, governance action, or deployment decision.

---

*Step-21 — Sovereign Reserve Runtime Model*
*Branch: `claude/step15-potential-gaps-cUVbj`*
*Reference commit: `bc647b1`*
*Date: 2026-05-29*
