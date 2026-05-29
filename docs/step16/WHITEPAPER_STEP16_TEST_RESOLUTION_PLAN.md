# Step-16 Test Resolution Plan

## Scope and Non-Goals

This document specifies the minimal invariant tests required to resolve the five confirmed gaps carried forward from Step-15 (`docs/step15/WHITEPAPER_STEP15_POTENTIAL_GAP_RESOLUTION_PLAN.md`, commit `c24c35a`). The items are P-01, P-03, P-04, P-05, and P-07. P-02 and P-06 were reclassified as not-a-gap in Step-15 and are not re-analyzed here.

**This document is documentation only.** It does not change contracts, tests, architecture, thresholds, trigger codes, Kernel assumptions, governance assumptions, or monetary constants. It does not close Step-12 or Step-13. It does not constitute production readiness, deployment authorization, or sign-off.

**Preserved constants (unchanged and non-configurable):**

| Constant | Contract | Value |
|----------|----------|-------|
| `LIQUIDITY_CAP` | `kernel.sol` | 900,000,000,000 × 1e18 PAH |
| `MIN_RESERVE_RATIO` | `kernel.sol`, `PahlaviToken.sol` | 333 (33.3‰) |
| `MULTISIG_THRESHOLD` | `kernel.sol` | 7 of 9 |
| `TRIGGER_TIMEOUT` | `kernel.sol` | 72 hours |
| `MULTISIG_REQUIRED` | `SovereignWealthFund.sol` | 3 of N |
| `COUNCIL_THRESHOLD` | `AssetFreeze.sol` | 3 |

---

## Table of Contents

1. [P-01 — `recordExpenditure()` `not approved` conservation](#p-01--recordexpenditure-not-approved-conservation)
2. [P-03 — `totalAssets()` additive invariant across multi-operation sequence](#p-03--totalassets-additive-invariant-across-multi-operation-sequence)
3. [P-04 — `distributeAnnualYield()` conservation (L2 decrease + total unchanged)](#p-04--distributeannualyield-conservation)
4. [P-05 — `provincialBalance` monotonic increase](#p-05--provincialbalance-monotonic-increase)
5. [P-07 — Trigger activation revokes kernel roles from offender](#p-07--trigger-activation-revokes-kernel-roles-from-offender)
6. [Summary Table](#summary-table)
7. [Preserved Non-Claims and Blockers](#preserved-non-claims-and-blockers)

---

## P-01 — `recordExpenditure()` `not approved` conservation

### 1. Current status

Step-15 identified a narrow residual: the `not approved` revert path in `BudgetAllocation.recordExpenditure()` was tested with a fresh contract (all `spent` values at 0 by construction) but without an explicit pre/post `spent` snapshot. The concern was that a test with `spent > 0` before a `not approved` revert did not exist.

### 2. Evidence reviewed

`contracts/governance/BudgetAllocation.sol` lines 105–110 — guard evaluation order inside `recordExpenditure()`:

```solidity
require(budgetApproved, "BudgetAllocation: not approved");  // line 106 — FIRST guard
require(!sb.isLocked,   "BudgetAllocation: locked by Trigger");
require(amount > 0,     "BudgetAllocation: zero amount");
require(sb.spent + amount <= sb.allocated, "BudgetAllocation: exceeds budget");
```

`contracts/governance/BudgetAllocation.sol` `approveBudget()` — `budgetApproved` is a one-way flag set from `false` to `true` via parliament role. No function resets it to `false`. This is a design invariant: `budgetApproved` cannot revert to `false` once set.

`spent` accounting — `recordExpenditure()` is the only function that increments `sb.spent`, and it requires `budgetApproved == true` as its first guard. Therefore `sb.spent > 0` is only reachable when `budgetApproved == true`.

**Logical consequence:** The `not approved` revert path (`budgetApproved == false`) is unreachable with `sb.spent > 0` in any valid deployment. The guard order and the one-way approval flag together make the residual scenario architecturally impossible. No contract rewrite is needed to produce this guarantee; it is a structural consequence of the current design.

`test/17_Budget_Allocation.test.js` lines 92–99 — `not approved` test uses a fresh deployment where `spent` starts at 0. This is correct and sufficient given the contract design: the only state reachable when `budgetApproved == false` has all `spent` values at 0.

### 3. Missing test / invariant

None. The constraint is enforced structurally by the contract, not by a runtime check that could be bypassed. A test asserting `spent > 0` before a `not approved` revert cannot be constructed within the current contract design because the precondition is unreachable.

### 4. Target file

N/A

### 5. Minimal future task

**Reclassify P-01 as design-constrained not-a-gap.** No test is needed. If `BudgetAllocation.sol` is ever refactored to allow `budgetApproved` to revert to `false` (e.g., a new fiscal year reset), this item must be reopened and a conservation test added at that time.

### 6. Risk level

**None** under the current contract design. Risk would materialize only if the approval flag becomes reversible. The Step-15 recommendation to add a test was based on incomplete analysis of the guard ordering and approval flag semantics; this step closes the residual.

---

## P-03 — `totalAssets()` additive invariant across multi-operation sequence

### 1. Current status

Step-15 confirmed: no single test exercises a combined sequence of deposits to all three SWF layers, a withdrawal, and a yield distribution, then asserts `totalAssets() == layerL1.balance + layerL2.balance + layerL3.balance` at each step.

### 2. Evidence reviewed

`contracts/monetary/SovereignWealthFund.sol` line 145:
```solidity
function totalAssets() external view returns (uint256) {
    return layerL1.balance + layerL2.balance + layerL3.balance;
}
```
`layerL1`, `layerL2`, `layerL3` are all `AssetLayer public` storage variables (lines 44–46), directly readable by tests as Solidity auto-generated getters.

`test/03_sovereign_wealth_fund.test.js` lines 343–349 — the existing `totalAssets مجموع سه لایه را برمی‌گرداند` test deposits only to L1 and L2 (not L3), and performs no withdrawal or yield distribution. The test description says "sum of three layers" but the implementation only covers two. This is itself an incompleteness in the existing test.

Per-operation `totalAssets()` checks exist at lines 105, 125, 146, 158, 199, 273–283 — all single-operation contexts. None span a deposit-withdrawal-yield sequence across all three layers simultaneously.

### 3. Missing test / invariant

A single `it()` block that:

1. Deposits a non-zero amount to each of L1, L2, and L3 separately.
2. After all three deposits, reads `layerL1.balance`, `layerL2.balance`, `layerL3.balance` and asserts `totalAssets() == sum`.
3. Proposes and executes a multi-sig withdrawal from L1 (3 council signatures).
4. After withdrawal execution, re-reads all three layer balances and asserts `totalAssets() == sum`.
5. Calls `distributeAnnualYield()` (transfers 15% of `layerL2.balance` from L2 to L1).
6. After yield distribution, re-reads all three layer balances and asserts `totalAssets() == sum`.

The invariant being asserted at each step: `totalAssets() == layerL1.balance + layerL2.balance + layerL3.balance`.

Note: `distributeAnnualYield()` requires `layerL2.balance > 0` and `(layerL2.balance * 150) / 1000 > 0`. The L2 deposit in step 1 must be large enough that 15% rounds to a non-zero value (i.e., L2 deposit ≥ 7 wei, practically any human-scale amount).

### 4. Target file

`test/03_sovereign_wealth_fund.test.js` — `describe("totalAssets / layerFillRatio", ...)` block (currently starting at line 343). The new `it()` block should be added inside this describe block.

### 5. Minimal future task

One `it()` block. Signers available in `beforeEach`: `sovereign`, `kernel`, `council1`, `council2`, `council3`, `stranger`. No new fixtures or roles needed; `council1/2/3` are already granted `COUNCIL_ROLE` in the outer `beforeEach`. The multi-sig withdrawal requires 3 `proposeWithdrawal` + `signWithdrawal` calls from council1, council2, council3.

Exact assertions needed (6 total):
- After deposits: `expect(await swf.totalAssets()).to.equal(l1.balance + l2.balance + l3.balance)`
- After L1 withdrawal: same assertion
- After yield distribution: same assertion

### 6. Risk level

**Low.** `totalAssets()` is a trivial sum; a divergence would require a contract bug in balance tracking. Risk is a future refactor that adds a cached aggregate or a new layer without updating `totalAssets()`. Without this test, such a divergence introduced silently by refactoring would not be caught.

---

## P-04 — `distributeAnnualYield()` conservation

### 1. Current status

Step-15 confirmed: the existing yield test (lines 216–230 of `test/03_sovereign_wealth_fund.test.js`) checks the L1 credit side only. It does not read `layerL2.balance` after distribution, does not compare `totalAssets()` before and after, and does not assert that L2 decreased by exactly the yield amount.

### 2. Evidence reviewed

`contracts/monetary/SovereignWealthFund.sol` lines 118–124:

```solidity
function distributeAnnualYield() external onlyRole(COUNCIL_ROLE) nonReentrant {
    uint256 yield = (layerL2.balance * ANNUAL_YIELD) / 1000;
    require(yield > 0, "SWF: no yield");
    require(layerL2.balance >= yield, "SWF: insufficient L2");
    layerL2.balance -= yield;
    layerL1.balance += yield;
    layerL1.totalDeposited += yield;
    emit AnnualYieldDistributed(yield, block.timestamp);
}
```

Observations from reading the code:
- `layerL2.balance` is decremented by `yield`.
- `layerL1.balance` is incremented by `yield`.
- `layerL1.totalDeposited` is incremented by `yield`.
- `layerL2.totalWithdrawn` is **not** updated by `distributeAnnualYield()`. This is a design choice: yield distribution is classified as an internal balance shift, not a withdrawal. The test spec must reflect this.
- `totalAssets() = layerL1.balance + layerL2.balance + layerL3.balance`. Since L1 increases by `yield` and L2 decreases by `yield`, `totalAssets()` is conserved exactly.

`test/03_sovereign_wealth_fund.test.js` lines 216–230 — reads `layerL1.balance` after distribution and asserts equality to `expectedYield`. Does not read `layerL2()` struct. Does not compare `totalAssets()` before and after.

### 3. Missing test / invariant

Extend the existing `distributeAnnualYield` describe block with a new `it()` block that:

1. Deposits `l2Deposit` to L2.
2. Reads `preTotalAssets = await swf.totalAssets()`.
3. Reads `preL2 = await swf.layerL2()`.
4. Computes `expectedYield = (l2Deposit * 150n) / 1000n`.
5. Calls `distributeAnnualYield()`.
6. Reads `postL1 = await swf.layerL1()` and `postL2 = await swf.layerL2()`.
7. Asserts:
   - `postL1.balance == preL1.balance + expectedYield` (L1 credit)
   - `postL2.balance == preL2.balance - expectedYield` (L2 debit)
   - `postL2.totalWithdrawn == preL2.totalWithdrawn` (yield is not counted as a withdrawal)
   - `await swf.totalAssets() == preTotalAssets` (conservation: total unchanged)

### 4. Target file

`test/03_sovereign_wealth_fund.test.js` — `describe("distributeAnnualYield", ...)` block (currently lines 215–231). Add a second `it()` block alongside the existing one.

### 5. Minimal future task

One `it()` block, four assertions. No new signers or roles needed. The existing `beforeEach` setup provides `council1` with `COUNCIL_ROLE`. `layerL2` is a public auto-getter returning the full `AssetLayer` struct.

### 6. Risk level

**Medium.** `distributeAnnualYield()` is a cross-layer balance transfer. A future change that accidentally miscalculates yield (e.g., integer overflow, rounding change, or wrong denominator) would reduce `totalAssets()` or fail to debit L2 properly. The current test catches only the L1-credit side; it would miss a scenario where L1 is credited correctly but L2 is not debited (creating value). The conservation assertion closes this gap.

---

## P-05 — `provincialBalance` monotonic increase

### 1. Current status

Step-15 confirmed: the Step8 Provincial Boundary Remediation test (lines 113–223 of `test/16_Provincial.test.js`) uses point-equality assertions for `provincialBalance` at each step. No test asserts the monotonic property (`current_balance >= previous_balance`) across a sequence of operations on the same province.

### 2. Evidence reviewed

`contracts/governance/Provincial.sol` — functions that write to `provincialBalance`:

- `distributeRevenue()`: increments `province.provincialBalance += provincialShare` where `provincialShare = revenue * 300 / 1000`.
- `payProductivityBonus()`: increments `province.provincialBalance += bonus`.

No function in `Provincial.sol` decrements `provincialBalance`. There is no `withdrawProvincialFunds()` function. The contract has functions `registerProvince()`, `distributeRevenue()`, `payProductivityBonus()`, `updateProductivityScore()`, and `updateGovernor()` — none decrement `provincialBalance`.

`test/16_Provincial.test.js` Step8 test (lines 113–223) — `provincialBalance` values across the test sequence for the same province (ID 1):

| Line | Operation | Assertion |
|------|-----------|-----------|
| 144 | pre-registration | `provincialBalance == 0` |
| 160 | post-registration | `provincialBalance == 0` |
| 177 | after rejected calls | `provincialBalance == 0` |
| 188 | after `distributeRevenue()` | `provincialBalance == expectedProvincialShare` |
| 196 | after rejected low-score bonus | `provincialBalance == expectedProvincialShare` |
| 212 | after rejected unauthorized bonus | `provincialBalance == expectedProvincialShare` |
| 220 | after `payProductivityBonus()` | `provincialBalance == expectedProvincialShare + bonus` |

The sequence is: 0 → 0 → 0 → share → share → share → share + bonus. This is monotonically non-decreasing. However, the assertions use `to.equal()` (exact value), not `to.be.gte()` (monotonic lower-bound). The monotonic invariant is implicit but not explicitly asserted.

### 3. Missing test / invariant

A new `it()` block that:

1. Registers a province.
2. Records `prevBalance = 0n` (initial value).
3. Calls `distributeRevenue()` and reads `province.provincialBalance`. Asserts `current >= prevBalance`. Updates `prevBalance`.
4. Attempts a rejected `payProductivityBonus()` (score < 71). Reads `province.provincialBalance`. Asserts `current >= prevBalance` and `current == prevBalance` (no change on rejection). Updates `prevBalance`.
5. Sets productivity score to 71. Calls `payProductivityBonus()`. Reads `province.provincialBalance`. Asserts `current >= prevBalance`. Updates `prevBalance`.
6. Calls `distributeRevenue()` a second time. Reads `province.provincialBalance`. Asserts `current >= prevBalance`.

Each assertion uses `to.be.gte(prevBalance)` rather than `to.equal(specificValue)`. This directly tests the monotonic invariant rather than specific numeric outcomes.

### 4. Target file

`test/16_Provincial.test.js` — a new `describe("provincialBalance monotonic invariant", ...)` block appended after the `Step8 Provincial Boundary Remediation` describe block (currently ending at line 224). Alternatively, an additional `it()` block within the existing Step8 describe block.

### 5. Minimal future task

One `it()` block with a `prevBalance` tracking variable. Signers available in `beforeEach`: `kernel`, `oracle`, `governor`, `devAccount`, `nationalTreasury`. No new roles required. `ORACLE_ROLE` is granted to `oracle` in the outer `beforeEach`. `payProductivityBonus()` requires kernel role (granted implicitly since `kernel` is the deployer and role admin).

Score threshold: `payProductivityBonus()` requires `province.productivityScore > 70` (must call `updateProductivityScore(1, 71)` first via `oracle`).

### 6. Risk level

**Low.** Under the current contract design (no withdrawal function), a decrease in `provincialBalance` is impossible through any public interface. The invariant test adds a regression guardrail for a future `withdrawProvincialFunds()` addition: if such a function is ever designed and added, the existing equality-based tests might still pass while the monotonic test would fail on any test context where withdrawal reduces balance.

---

## P-07 — Trigger activation revokes kernel roles from offender

### 1. Current status

Step-15 confirmed: no test sets up an offender who holds active kernel or SWF roles, runs a full flag → 7-of-9 → activate sequence, and then verifies those roles are removed. The existing trigger tests in `08_Trigger_Protocol.test.js` verify anti-escalation (roles are not granted to new parties) but not role revocation from a pre-existing holder.

### 2. Evidence reviewed

`contracts/kernel.sol` lines 353–374 — `_revokeOfficialAccess()`:

```solidity
function _revokeOfficialAccess(address offender, string memory reason) internal {
    OfficialAccess storage access = officialAccess[offender];
    access.isActive = false;
    access.revokedAt = block.timestamp;
    access.suspensionReason = reason;

    if (hasRole(SOVEREIGN_ROLE, offender)) { _revokeRole(SOVEREIGN_ROLE, offender); }
    if (hasRole(COURT_ROLE,    offender)) { _revokeRole(COURT_ROLE,    offender); }
    if (hasRole(GUARDIAN_ROLE, offender)) { _revokeRole(GUARDIAN_ROLE, offender); }
    if (hasRole(ORACLE_ROLE,   offender)) { _revokeRole(ORACLE_ROLE,   offender); }
}
```

**Critical scope finding:** `_revokeOfficialAccess()` operates on the kernel's own `AccessControl` registry only. It revokes `SOVEREIGN_ROLE`, `COURT_ROLE`, `GUARDIAN_ROLE`, and `ORACLE_ROLE` — all of which are kernel-internal roles. It does **not** call into `SovereignWealthFund`, `Treasury`, or any other contract to revoke roles in their separate `AccessControl` registries.

`contracts/core/TriggerProtocol.sol` line 58+ — `executeTrigger()` calls `treasury.blockAddressByTrigger(offender)` to block the offender's treasury access. It does **not** call `swf.revokeRole(COUNCIL_ROLE, offender)` or any equivalent.

**Architectural consequence:** An offender who holds SWF `COUNCIL_ROLE` retains it after trigger activation. The current trigger path removes kernel-level governance roles and blocks treasury access, but does not revoke SWF deposit/withdrawal authority from the offender. This is a pre-existing design gap already documented in Step-14 §7.6 as `[OBSERVED]`: "TriggerProtocol.executeTrigger() can revoke roles from a violating address but does not pause token minting, freeze SWF withdrawals, or halt treasury spending."

This step does not change that contract behavior. It only specifies what test should be written to document the current behavior accurately.

`test/08_Trigger_Protocol.test.js` lines 1581–1790 ("trigger execution paths cannot escalate authority roles") — the offender starts with no kernel or SWF roles. The test verifies that executing a trigger does not grant new roles to the offender. It does not verify that pre-existing roles held by the offender are revoked.

`test/08_Trigger_Protocol.test.js` line 1683 — violation code 4 (TR-04, fundamental rights) is used. No test in the suite uses violation code 6 (TR-06, liquidity cap) in a full end-to-end activation path.

### 3. Missing test / invariant

**Tractable part — kernel role revocation:**

A new `it()` block that:

1. Deploys live `Kernel`, `SovereignWealthFund`, `Treasury`, `TriggerProtocol` with full integration (matching the pattern at line 1581 of `08_Trigger_Protocol.test.js`).
2. Calls `kernel.grantOfficialAccess(offender.address, COURT_ROLE)` to give the offender an active kernel role.
3. Asserts `kernel.hasRole(COURT_ROLE, offender.address) == true` (pre-condition confirmed).
4. Calls `kernel.flagViolation(6, offender.address, "TR-06 test")` via oracle (violation code 6 — liquidity cap).
5. Collects 7 court signatures from the extra courts (not the offender).
6. Asserts `terminalRecord.triggered == true` (activation confirmed).
7. Asserts `kernel.hasRole(COURT_ROLE, offender.address) == false` (kernel role revoked).
8. Asserts `kernel.officialAccess(offender.address).isActive == false` (access marked inactive).

This test is fully achievable within the current contract: `_revokeOfficialAccess()` does revoke `COURT_ROLE`, so the assertion at step 7 will pass.

**Non-tractable part — SWF role non-revocation (design gap):**

A second assertion in the same test:
- Grant `offender` SWF `COUNCIL_ROLE` before the trigger.
- After trigger activation, assert `swf.hasRole(COUNCIL_ROLE, offender.address) == true` (still held — SWF role is NOT revoked).

This assertion documents the existing design gap as a test-recorded fact. It is not a failing test; it is a confirmation that the current implementation does not remove SWF roles during trigger activation. The corresponding implementation gap (adding SWF role revocation to the trigger path) is a contract change and is therefore outside the scope of this step and must not be undertaken here.

### 4. Target file

`test/08_Trigger_Protocol.test.js` — a new `it()` block within the outermost `describe("TriggerProtocol", ...)` scope, alongside the existing end-to-end integration tests (after line 1790). The test requires the same full-integration deployment pattern used in lines 1581–1790.

Alternatively, `test/01_kernel.test.js` if a dedicated kernel-role-revocation describe block already exists there. Check `01_kernel.test.js` for an appropriate describe context before placing in `08_Trigger_Protocol.test.js`.

### 5. Minimal future task

One `it()` block. Two parts:
- Part A: grants offender `COURT_ROLE`, runs full TR-06 activation, asserts `COURT_ROLE` revoked and `isActive == false`. (Tests the existing behavior — should pass with current code.)
- Part B: grants offender SWF `COUNCIL_ROLE`, runs same activation, asserts `COUNCIL_ROLE` is **still present** post-activation. (Documents the design gap as a test-recorded fact — should pass because the code does not revoke SWF roles.)

Part B is intentionally written as a documentation assertion (that SWF roles are NOT revoked) rather than as a failing expectation, because the recommended behavior (SWF role revocation) cannot be implemented without a contract change.

Human review of `TriggerProtocol.sol` and `_revokeOfficialAccess()` scope is required to decide whether Part B should be a skipped placeholder test or a passing documentation assertion. That decision is outside automation.

### 6. Risk level

**Medium-high.** An offender who held SWF `COUNCIL_ROLE` before trigger activation retains full deposit and withdrawal authority over the SWF even after the trigger fires. This is a real enforcement gap: the trigger revokes governance roles in the kernel and blocks treasury access, but the SWF remains accessible to the offender unless a separate `revokeRole()` call is made manually. The invariant test for the tractable part (kernel role revocation) is a regression guardrail for the path that does work. The non-tractable part (SWF role non-revocation) should be flagged for human review of the trigger execution scope.

---

## Summary Table

| ID | Step-15 Action | Step-16 Finding | Test Needed | Target File | Priority |
|----|----------------|-----------------|-------------|-------------|----------|
| P-01 | Add test for `not approved` + `spent > 0` | Design-constrained not-a-gap — precondition unreachable by contract structure | None | N/A | None |
| P-03 | Add multi-operation sequence invariant | Confirmed — existing test covers only 2 of 3 layers; no withdrawal+yield in same sequence | 1 `it()` block, `totalAssets / layerFillRatio` describe | `03_sovereign_wealth_fund.test.js` | Low |
| P-04 | Add yield conservation test | Confirmed — existing test checks L1 credit only; L2 debit and total conservation unasserted | 1 `it()` block, `distributeAnnualYield` describe | `03_sovereign_wealth_fund.test.js` | Medium |
| P-05 | Add monotonic increase test | Confirmed — existing tests use equality; `to.be.gte(prevBalance)` pattern missing | 1 `it()` block, new or existing describe | `16_Provincial.test.js` | Low |
| P-07 | Add role-revocation integration test | Split: kernel-role revocation tractable (passes); SWF role non-revocation is a design gap | 1 `it()` block with two parts; Part A passes, Part B documents SWF gap | `08_Trigger_Protocol.test.js` | Medium-High |

### Net result after Step-16 analysis

| Classification | Count | Items |
|---------------|-------|-------|
| Reclassified as not-a-gap | 1 | P-01 |
| Tests needed (all in test suite, no contract changes) | 4 | P-03, P-04, P-05, P-07 |
| Design gap requiring human review | 1 | P-07 Part B (SWF role non-revocation after trigger) |

---

## Preserved Non-Claims and Blockers

- **Step-12 is not closed.** External audit, oracle operations evidence, and human review sign-off remain open. This plan does not constitute Step-12 closure.
- **Step-13 is not formally closed.** This document does not constitute Step-13 sign-off.
- **No production readiness claim.** This document does not assert deployment authorization, formal verification, or mainnet readiness.
- **No contract changes.** P-07 Part B documents a design gap (SWF role non-revocation) but does not authorize modifying `TriggerProtocol.sol`, `kernel.sol`, or `SovereignWealthFund.sol`. Any future implementation of SWF role revocation in the trigger path must be a separately reviewed and authorized contract change.
- **No test changes in this step.** The four `it()` blocks specified above (P-03, P-04, P-05, P-07 Part A+B) are future tasks. Writing them is not a Step-16 deliverable.
- **No threshold changes.** All constants in the preserved constants table above are unchanged.
- **No Kernel upgradeability.** Nothing in this document authorizes proxy patterns or upgrade mechanisms for `kernel.sol`.
- **Human freeze authority is preserved.** P-07 Part B explicitly defers the SWF role revocation design decision to human review. The trigger system's scope of enforcement is a constitutional design question that automation cannot resolve.
- **P-02 and P-06 remain reclassified as not-a-gap** from Step-15. They are not reopened here.
