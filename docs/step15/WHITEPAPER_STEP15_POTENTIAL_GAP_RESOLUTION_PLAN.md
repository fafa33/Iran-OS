# Step-15 Potential Gap Resolution Plan

## Scope and Non-Goals

This document analyzes the items classified `[POTENTIAL]` in Step-14 (`docs/step14/WHITEPAPER_STEP14_RESERVE_TREASURY_EXECUTION_GAP_MAP.md`, commit `a974ff0`). A `[POTENTIAL]` item required targeted test-suite review before a final classification could be assigned; Step-14 left those items open because the review was not completed inline.

**This document is documentation only.** It does not change contracts, tests, architecture, thresholds, trigger codes, Kernel assumptions, governance assumptions, or monetary constants. It does not close Step-12 or Step-13. It does not constitute production readiness, deployment authorization, or sign-off.

### Count note

Step-14 §8.2 states a count of **6 POTENTIAL items**. Counting the literal `[POTENTIAL]` markers in the document body produces **7 items**: one in §2.4, one in §4.4, two in §5.4, one in §6.4, and two in §7.4. This document analyzes all seven marked items and labels them P-01 through P-07. The discrepancy between the stated count (6) and the body count (7) is recorded as a minor documentation inconsistency in Step-14; it does not affect the analysis below.

### Preserved constants (unchanged and non-configurable)

| Constant | Contract | Value |
|----------|----------|-------|
| `LIQUIDITY_CAP` | `kernel.sol` | 900,000,000,000 × 1e18 PAH |
| `MIN_RESERVE_RATIO` | `kernel.sol`, `PahlaviToken.sol` | 333 (33.3‰) |
| `MULTISIG_THRESHOLD` | `kernel.sol` | 7 of 9 |
| `TRIGGER_TIMEOUT` | `kernel.sol` | 72 hours |
| `MULTISIG_REQUIRED` | `SovereignWealthFund.sol` | 3 of N |
| `COUNCIL_THRESHOLD` | `AssetFreeze.sol` | 3 |

None of the items below authorize changing these constants.

---

## Table of Contents

1. [P-01 — §2.4 — Failed `recordExpenditure()` leaves `spent` unchanged](#p-01--24--failed-recordexpenditure-leaves-spent-unchanged)
2. [P-02 — §4.4 — `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` non-configurable](#p-02--44--liquidity_cap-and-min_reserve_ratio-non-configurable)
3. [P-03 — §5.4 — `totalAssets()` additive invariant across multi-operation sequence](#p-03--54--totalassets-additive-invariant-across-multi-operation-sequence)
4. [P-04 — §5.4 — `distributeAnnualYield()` conserves total assets](#p-04--54--distributeannualyield-conserves-total-assets)
5. [P-05 — §6.4 — `provincialBalance` can only increase](#p-05--64--provincialbalance-can-only-increase)
6. [P-06 — §7.4 — Oracle/kernel violation record consistency](#p-06--74--oraclekernel-violation-record-consistency)
7. [P-07 — §7.4 — TR-06 flag → 7-of-9 → role revocation end-to-end](#p-07--74--tr-06-flag--7-of-9--role-revocation-end-to-end)
8. [Summary Table](#summary-table)
9. [Preserved Non-Claims](#preserved-non-claims)

---

## P-01 — §2.4 — Failed `recordExpenditure()` leaves `spent` unchanged

### 1. Exact Step-14 reference

Step-14 §2.4 Missing Invariant Tests, item 2:

> `[POTENTIAL]` No test asserts conservation: a failed `recordExpenditure()` in `BudgetAllocation.sol` leaves `spent` unchanged. The test file covers revert cases (`exceeds budget`, `not approved`, `locked by Trigger`) but does not explicitly snapshot and compare `spent` before and after a failed call.

### 2. Why it remained ambiguous

Step-14 acknowledged that revert tests exist but questioned whether any test explicitly reads `spent` before the failing call and re-reads it after to confirm no mutation. The uncertainty was whether the "revert happens" assertion is accompanied by a "state is unchanged" snapshot comparison.

### 3. Evidence already checked

`test/17_Budget_Allocation.test.js` — Step8 Budget Boundary Remediation test (lines 137–221):

- **`exceeds budget` case:** Line 186 reads `health.spent` and confirms it equals `spendAmount` (post-success snapshot). Line 189–191 then calls `recordExpenditure()` with an over-limit amount, which is expected to revert with `"BudgetAllocation: exceeds budget"`. Line 193–194 re-reads `health.spent` and asserts it still equals `spendAmount`. This is an explicit before/after snapshot comparison for the `exceeds budget` revert path. The gap does not exist for this sub-case.

- **`locked by Trigger` case:** Line 211–213 reads `defense.spent` and confirms it equals 0 (post-lock snapshot). Lines 215–217 calls `recordExpenditure()` on the locked sector, expected to revert with `"BudgetAllocation: locked by Trigger"`. Lines 219–220 re-reads `defense.spent` and asserts it still equals 0. This is an explicit before/after snapshot comparison. The gap does not exist for this sub-case.

- **`not approved` case:** Lines 92–99 deploy a fresh `BudgetAllocation` instance with no prior budget approval, then attempt `recordExpenditure()`, expecting revert with `"BudgetAllocation: not approved"`. The fresh deployment has all `spent` values at 0 by construction. No explicit snapshot of `spent` is taken before or after this revert. The before-state is implicitly 0 (fresh contract) but it is not read and re-confirmed post-revert as a named assertion.

### 4. What evidence is still missing

There is no test in `test/17_Budget_Allocation.test.js` that:
(a) sets up a contract with `spent > 0` in a sector before a `not approved` revert attempt, and
(b) re-reads `spent` after the revert to assert it is unchanged.

The `not approved` path uses a fresh contract, so the absence of mutation is true by construction but not asserted by name.

### 5. Recommended next action

**Reclassify as CORRECTED for `exceeds budget` and `locked by Trigger` sub-cases.** Both paths have explicit snapshot-compare assertions. Retain as a narrow residual gap only for the `not approved` sub-case: add a targeted invariant test that places `spent > 0` before attempting an unapproved expenditure and re-reads `spent` after the revert.

### 6. Risk if ignored

The `not approved` path with a pre-existing `spent` value is the weakest edge case. In current code the revert guard fires before any state mutation, so there is no functional risk. The residual gap is documentation and test-completeness only: a future refactor of `recordExpenditure()` that reorders guard checks could silently introduce a mutation before the approval check, with no existing test to catch it.

### 7. Non-claims

This analysis does not authorize any change to `BudgetAllocation.sol`, `recordExpenditure()` logic, approval flow, or any other contract. No constant or threshold is modified.

---

## P-02 — §4.4 — `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` non-configurable

### 1. Exact Step-14 reference

Step-14 §4.4 Missing Invariant Tests, item 5:

> `[POTENTIAL]` No test asserts that `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` remain non-configurable. No setter exists for either constant (positive fact), but no test explicitly asserts that no setter can be called.

### 2. Why it remained ambiguous

Step-14 confirmed at the code level that no setter function exists for either constant. The ambiguity was whether a test should additionally assert this property. The question is partly a Solidity semantics question (can a test meaningfully assert that a function does not exist?) and partly a test-completeness question (do stability checks in existing tests serve the same purpose?).

### 3. Evidence already checked

`test/08_Trigger_Protocol.test.js` — multiple tests snapshot `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` before and after trigger operations and assert equality:

- Lines 264, 303: `LIQUIDITY_CAP` unchanged across oracle-signal-only path (non-terminal trigger state).
- Lines 364, 417: `LIQUIDITY_CAP` unchanged across non-terminal treasury accounting test.
- Lines 488, 549: `LIQUIDITY_CAP` unchanged across non-terminal SWF accounting test.
- Lines 607, 660: `LIQUIDITY_CAP` unchanged across cross-contract accounting neutrality test.
- Lines 722, 752, 824: `LIQUIDITY_CAP` unchanged across terminal trigger lifecycle integrity test.
- Lines 868, 897: `LIQUIDITY_CAP` unchanged across reserve and liquidity invariants test.
- Lines 1681, 1789: Both `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` unchanged across authority escalation test (full end-to-end flag → 7-of-9 → activate sequence).

These tests verify that no trigger operation or contract call path modifies either constant.

`kernel.sol` — both `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` are declared as Solidity `uint256 public constant`. In Solidity, a `constant` state variable is inlined at compile time and cannot be modified by any function at runtime; there is no valid EVM opcode sequence that changes a constant's value. No setter function can exist for a `constant`.

### 4. What evidence is still missing

No test calls a hypothetical setter function (e.g., `setLiquidityCap()`) and asserts the call reverts — but no such function exists. Writing a test for the absence of a function is not a standard Solidity testing pattern. The Solidity `constant` declaration is itself the enforcement mechanism; it is a compile-time guarantee, not a runtime guard, so a runtime test cannot strengthen it.

### 5. Recommended next action

**Reclassify as CORRECTED/not-a-gap.** The Solidity `constant` keyword provides a compile-time guarantee that no setter can exist. The existing trigger tests provide independent runtime confirmation that neither value changes across any tested execution path. No additional test would add meaningful safety beyond what already exists.

### 6. Risk if ignored

No risk from the test gap itself. The compile-time guarantee of `constant` is the authoritative enforcement. The only theoretical future risk would be if the constants were refactored into mutable `uint256` state variables, at which point the existing trigger tests that snapshot-compare them would still catch any setter invocation during tests. The risk is already managed.

### 7. Non-claims

This analysis does not change the values of `LIQUIDITY_CAP` or `MIN_RESERVE_RATIO`, does not authorize making them configurable, and does not change `kernel.sol`. The `constant` declarations are preserved exactly.

---

## P-03 — §5.4 — `totalAssets()` additive invariant across multi-operation sequence

### 1. Exact Step-14 reference

Step-14 §5.4 Missing Invariant Tests, item 2:

> `[POTENTIAL]` No test asserts that `totalAssets()` equals L1 + L2 + L3 balances after any sequence of deposits, withdrawals, and yield distributions. Tests at lines 105, 125, 146, 158 check `totalAssets()` before and after individual operations; no test exercises a multi-operation sequence and asserts the additive invariant across all three layers.

### 2. Why it remained ambiguous

Step-14 confirmed that per-operation `totalAssets()` checks exist but did not verify whether any test exercises a combined sequence (deposit-to-L1, deposit-to-L2, deposit-to-L3, withdrawal, yield distribution) and asserts the additive property across all three layers after each step.

### 3. Evidence already checked

`test/03_sovereign_wealth_fund.test.js`:

- Lines 105, 125: `totalAssets()` checked before withdrawal and after, confirming decrease by `withdrawAmount`. Single-operation check.
- Lines 146, 158: `totalAssets()` checked before and after a failed operation (state unchanged). Single-operation check.
- Lines 273, 280, 283: `totalAssets()` checked after two sequential deposits to different layers (`firstDeposit`, then `secondDeposit`). This is a two-operation sequence, but it only covers deposit-only operations; no withdrawal or yield step is included.
- Lines 343–349 (`totalAssets مجموع سه لایه را برمی‌گرداند`): Deposits to two layers, then checks `totalAssets()` equals the sum. Two-deposit check, no withdrawal or yield.
- Lines 215–230 (`distributeAnnualYield`): Deposits to L2, distributes yield, checks L1 balance. Does not read `totalAssets()` before or after distribution. Does not check L2 balance after. Treated as a separate POTENTIAL item (P-04).

No test constructs a sequence that includes at least one deposit, one withdrawal, and one yield distribution across all three layers within the same test context, then asserts `totalAssets() == layerL1.balance + layerL2.balance + layerL3.balance` after the sequence completes.

### 4. What evidence is still missing

A test that:
1. Deposits to L1, L2, and L3 (establishing all three layers with non-zero balances).
2. Executes a multi-sig withdrawal from one layer.
3. Executes `distributeAnnualYield()`.
4. After each step asserts `totalAssets()` equals the sum of the three individual `layerL1.balance + layerL2.balance + layerL3.balance` values read from the contract at that moment.

This test cannot be written without modifying the test suite. It is a test-completeness gap, not a code defect.

### 5. Recommended next action

**Add invariant test later.** The `SovereignWealthFund.totalAssets()` function (which sums the three layer balances) is correct by implementation; the gap is test coverage of its additive invariant across a combined operation sequence. The test should be added when a test-suite maintenance pass is scheduled for the SWF contract. It is not urgent.

### 6. Risk if ignored

Low functional risk. `totalAssets()` is a simple sum of three storage variables; its correctness is verifiable by code inspection. The risk materializes only if a future refactor adds cached or derived accounting that diverges from the live sum. Without the multi-operation invariant test, such a divergence introduced by refactoring would not be caught by existing tests.

### 7. Non-claims

This analysis does not change `SovereignWealthFund.sol`, `totalAssets()`, or any layer accounting. No constant or threshold is modified. Writing this test is deferred work; it is not a Step-15 deliverable.

---

## P-04 — §5.4 — `distributeAnnualYield()` conserves total assets

### 1. Exact Step-14 reference

Step-14 §5.4 Missing Invariant Tests, item 4:

> `[POTENTIAL]` No test asserts that `distributeAnnualYield()` conserves total assets (L1 increases by exactly the amount L2 decreases). The yield test (lines 216–230) checks L1 balance and yield event amount but does not read L2 balance post-distribution or compare `totalAssets()` before and after.

### 2. Why it remained ambiguous

Step-14 identified the yield test but could not confirm without line-by-line review whether L2 balance was read after distribution. The ambiguity was whether the test only checks L1 (positive side of the transfer) or also verifies L2 (negative side) and `totalAssets()` conservation.

### 3. Evidence already checked

`test/03_sovereign_wealth_fund.test.js` lines 215–230 (`distributeAnnualYield`):

```
const l2Deposit = ethers.parseUnits("1000000", 18);
await swf.connect(council1).depositToL2(l2Deposit, "دارایی مولد");
const expectedYield = (l2Deposit * 150n) / 1000n;
const tx = await swf.connect(council1).distributeAnnualYield();
// event check: event.args[0] == expectedYield
const l1 = await swf.layerL1();
expect(l1.balance).to.equal(expectedYield);
```

The test:
- Deposits `l2Deposit` to L2.
- Computes `expectedYield = l2Deposit × 15%`.
- Calls `distributeAnnualYield()`.
- Checks the emitted event amount.
- Reads `layerL1()` and checks L1 balance equals `expectedYield`.

The test does **not**:
- Read `layerL2()` before or after the distribution.
- Compare `totalAssets()` before vs. after the call.
- Assert that L2 decreased by exactly `expectedYield`.

The POTENTIAL is confirmed valid. The test verifies only the credit side of the yield transfer.

### 4. What evidence is still missing

A test that:
1. Reads `layerL2.balance` and `totalAssets()` before calling `distributeAnnualYield()`.
2. Calls `distributeAnnualYield()`.
3. Reads `layerL1.balance`, `layerL2.balance`, and `totalAssets()` after.
4. Asserts: `post_L1.balance == pre_L1.balance + yield`.
5. Asserts: `post_L2.balance == pre_L2.balance - yield`.
6. Asserts: `post_totalAssets == pre_totalAssets` (conservation).

### 5. Recommended next action

**Add invariant test later.** This is a concrete, well-scoped gap with a clear missing assertion. The test requires no contract changes. It should be added during a test-suite maintenance pass for `SovereignWealthFund.sol`. It is a stronger priority than P-03 because `distributeAnnualYield()` involves a cross-layer balance transfer and a conservation failure would be harder to detect by code inspection alone.

### 6. Risk if ignored

Medium test-completeness risk. `distributeAnnualYield()` moves value between L2 and L1. If a future contract change accidentally mutated `totalAssets()` or introduced a rounding error that created or destroyed value during yield distribution, no existing test would catch the conservation failure. The current implementation is correct, but the invariant test adds a regression guardrail.

### 7. Non-claims

This analysis does not change `distributeAnnualYield()`, its yield calculation formula, or any layer accounting. The 15% yield rate and L3 targeting are unchanged. Writing this test is deferred work.

---

## P-05 — §6.4 — `provincialBalance` can only increase

### 1. Exact Step-14 reference

Step-14 §6.4 Missing Invariant Tests, item 4:

> `[POTENTIAL]` No test asserts that `provincialBalance` can only increase (absent a withdrawal function). The provincial test (`16_Provincial.test.js`) verifies correct `provincialBalance` values after `distributeRevenue()` and `payProductivityBonus()` but does not assert monotonic increase across the full test sequence.

### 2. Why it remained ambiguous

Step-14 confirmed that specific `provincialBalance` values are checked after individual operations, but did not confirm whether any test captures the "this value never decreases" invariant across a sequence of operations within the same province context.

### 3. Evidence already checked

`test/16_Provincial.test.js` — relevant lines:

- Line 76: `provincialBalance` checked as 300,000 (initial state or post-`distributeRevenue()`).
- Line 144: `provincialBalance` checked as 0 (freshly registered empty province).
- Line 160: `provincialBalance` checked as 0 (registered province, post-setup).
- Line 177: `provincialBalance` checked as 0 (after rejected calls — state-neutral check).
- Line 188: `provincialBalance` checked as `expectedProvincialShare` after `distributeRevenue()`.
- Line 196: `provincialBalance` still equals `expectedProvincialShare` after a rejected bonus (no-op).
- Line 212: `provincialBalance` still equals `expectedProvincialShare` after another rejected bonus.
- Line 220: `provincialBalance` equals `expectedProvincialShare + bonus` after `payProductivityBonus()`.

The test sequence for the same province (lines 188–220) shows values of `share → share → share → share + bonus`. Within this sequence the balance never decreases. However, the test assertions are "equals this specific value" assertions, not "is greater than or equal to the previous value" monotonic assertions.

No `withdrawProvincialFunds()` function exists in `Provincial.sol`. A `provincialBalance` decrease without such a function cannot occur through any public interface. This is a code-level constraint, not a tested invariant.

### 4. What evidence is still missing

A test that:
1. Records `provincialBalance` at the start of a test sequence for a specific province.
2. After each `distributeRevenue()` or `payProductivityBonus()` call, asserts `current_balance >= previous_balance`.
3. After any rejected or reverted call, asserts `current_balance == previous_balance`.
4. Covers the full available state space for a province (initial → revenue → bonus → rejected-bonus → second-revenue).

This would be a monotonic-increase invariant test rather than a point-value equality test.

### 5. Recommended next action

**Add invariant test later.** The absence of a withdrawal function makes a real-world balance decrease impossible through the current interface. The gap is test documentation of the invariant, not a functional risk. The test should be added when `Provincial.sol` test coverage is revisited. If a `withdrawProvincialFunds()` function is ever designed and added, the monotonic-increase invariant test would need to be updated to reflect authorized decrements — so the test would serve as a design constraint guardrail for that future work.

### 6. Risk if ignored

Low functional risk under the current contract design (no withdrawal path exists). Risk materializes only if a future `withdrawProvincialFunds()` function is added without updating the invariant: the existing equality-based tests might still pass (if balances are re-set for each test context) while a monotonic violation exists within a real interaction sequence. The invariant test would catch this.

### 7. Non-claims

This analysis does not add a `withdrawProvincialFunds()` function, does not change `Provincial.sol`, and does not change the `provincialBalance` accounting formula. No constant or threshold is modified.

---

## P-06 — §7.4 — Oracle/kernel violation record consistency

### 1. Exact Step-14 reference

Step-14 §7.4 Missing Invariant Tests, item 3:

> `[POTENTIAL]` No test asserts that `API3Oracle.flagViolation()` produces a consistent violation record in both the oracle's `violationFlags` mapping and the kernel's `violations` mapping. The propagation call (line 91) exists; whether it is tested end-to-end requires reviewing the oracle and kernel test suites in detail.

### 2. Why it remained ambiguous

Step-14 confirmed at the code level that `API3Oracle.flagViolation()` (line 91 of `API3Oracle.sol`) calls `IIranOSKernel(kernel).flagViolation()`. The ambiguity was whether any test verifies both sides of this propagation — reading from both `api3Oracle.violationFlags` and `kernel.violations` and comparing fields for consistency.

### 3. Evidence already checked

`test/09_api3_oracle.test.js` lines 135–165 ("duplicate feeder reports are recorded as separate auditable oracle and Kernel violations"):

After two sequential `api3Oracle.connect(feeder).flagViolation(offender.address, 4, reason)` calls, the test asserts:
- `api3Oracle.violationFlagCount()` equals 2.
- `kernel.violationCount()` equals 2.
- `oracleFlag1.offender` equals `offender.address`.
- `oracleFlag2.offender` equals `offender.address`.
- `oracleFlag1.violationCode` equals 4.
- `oracleFlag2.violationCode` equals 4.
- `oracleFlag1.reason` equals `reason`.
- `oracleFlag2.reason` equals `reason`.
- `oracleFlag1.timestamp > 0`.
- `oracleFlag2.timestamp > 0`.
- `kernelViolation1.violationCode` equals 4.
- `kernelViolation2.violationCode` equals 4.
- `kernelViolation1.offender` equals `offender.address`.
- `kernelViolation2.offender` equals `offender.address`.
- `kernelViolation1.reason` equals `reason`.
- `kernelViolation2.reason` equals `reason`.
- `kernelViolation1.timestamp > 0`.
- `kernelViolation2.timestamp > 0`.

This test explicitly reads and compares fields from both `api3Oracle.getViolationFlag()` and `kernel.violations()` for the same flag event, confirming that `violationCode`, `offender`, `reason`, and `timestamp` are consistent in both records.

Additionally, `test/09_api3_oracle.test.js` lines 91–133 ("feeder report propagates through Kernel court signatures to TriggerProtocol execution") tests the full propagation path: oracle flag → kernel violation count → court signatures → `TriggerActivated` + `TriggerExecuted` events → `TriggerProtocol.executionCount()`.

### 4. What evidence is still missing

The consistency check at lines 135–165 covers `violationCode`, `offender`, `reason`, and `timestamp`. It does not compare `violationId` cross-mapping (oracle flag ID vs. kernel violation ID), which are independent sequential counters in separate contracts. That is an architectural property (separate counters, not shared IDs) rather than an inconsistency; the test correctly reflects this.

There is no residual gap in the consistency check for the fields that propagate.

### 5. Recommended next action

**Reclassify as CORRECTED/not-a-gap.** The test at lines 135–165 of `test/09_api3_oracle.test.js` provides explicit cross-contract field comparison for every field that propagates through `flagViolation()`. The POTENTIAL was correctly labeled given Step-14's stated uncertainty, but targeted review has confirmed coverage exists.

### 6. Risk if ignored

No risk. The gap does not exist. The test coverage is confirmed adequate for the propagated fields.

### 7. Non-claims

This analysis does not change `API3Oracle.sol`, `kernel.sol`, or the violation flagging interface. The architectural fact that oracle and kernel maintain separate violation record counters (not a shared ID) is preserved and not a gap.

---

## P-07 — §7.4 — TR-06 flag → 7-of-9 → role revocation end-to-end

### 1. Exact Step-14 reference

Step-14 §7.4 Missing Invariant Tests, item 4:

> `[POTENTIAL]` No test asserts that a TR-06 flag → 7-of-9 multi-sig → `_activateTrigger()` sequence correctly revokes SWF or treasury roles from the offending address. The trigger test suite (`08_Trigger_Protocol.test.js`) may cover this but requires targeted verification.

### 2. Why it remained ambiguous

Step-14 acknowledged the trigger test suite exists but could not confirm without targeted line-by-line review whether any test establishes an offender with active SWF or treasury roles, then runs a full trigger activation sequence, and finally verifies those roles are removed from the offender.

### 3. Evidence already checked

`test/08_Trigger_Protocol.test.js` lines 1581–1790 ("trigger execution paths cannot escalate authority roles"):

This test constructs a full end-to-end trigger path:
1. Deploys `Kernel`, `SovereignWealthFund`, `Treasury`, and `TriggerProtocol` with a live integration.
2. Grants extra court signers for 7-of-9 threshold.
3. Flags a violation via `kernel.flagViolation()`.
4. Collects 6 court signatures (non-terminal state check at line 1697).
5. Collects the 7th signature (terminal activation at line 1717).
6. Verifies `TriggerActivated` and `TriggerExecuted` via event assertions.
7. Snapshots role matrices for `kernel`, `treasury`, and `swf` before the violation and re-checks them after terminal activation (lines 1729–1731, 1771–1773).

**Critical observation:** The test verifies that role matrices are **unchanged** after trigger activation. The role matrix snapshots are taken for a set of subjects including `triggerProtocol`, `offender`, `oracle`, and `replayCaller`. The `offender` subject starts with **no SWF or treasury roles**. The test is designed to verify **anti-escalation** (no roles are granted to the offender by the trigger), not **role revocation** (pre-existing roles are removed from the offender).

The specific sequence of:
1. Granting the `offender` an active SWF `COUNCIL_ROLE` or treasury `PARLIAMENT_ROLE`.
2. Flagging a violation against that offender.
3. Completing 7-of-9 signatures.
4. Asserting that the offender's SWF or treasury role was revoked after `_activateTrigger()`.

...is **not present** in any test in `08_Trigger_Protocol.test.js` or `09_api3_oracle.test.js`.

Note also: The test uses violation code 4 (TR-04, fundamental rights), not violation code 6 (TR-06, liquidity cap). No test exercises a TR-06–coded flag → multi-sig → activation sequence specifically.

### 4. What evidence is still missing

A test that:
1. Grants the offender `COUNCIL_ROLE` in `SovereignWealthFund` and/or `PARLIAMENT_ROLE` or `AUDITOR_ROLE` in `Treasury`.
2. Records a baseline `hasRole(COUNCIL_ROLE, offender)` = `true` assertion.
3. Flags a TR-06 violation against the offender via `kernel.flagViolation(6, offender, reason)`.
4. Collects 7-of-9 court signatures.
5. Asserts that after `_activateTrigger()` fires, `hasRole(COUNCIL_ROLE, offender)` is `false` in `SovereignWealthFund` and/or the treasury role is revoked.

Additionally, a test that verifies the TR-06 violation code specifically (not TR-04) traverses the full flag → sign → activate path and results in `TriggerProtocol.executeTrigger()` being called.

### 5. Recommended next action

**Add invariant test later.** This is the highest-priority POTENTIAL item in this document. The trigger system's role-revocation behavior for offenders who hold SWF or treasury roles is a critical constitutional enforcement path. The anti-escalation tests confirm the trigger does not grant new roles; the missing test would confirm the trigger actively revokes pre-existing roles. Until this test exists, role-revocation after trigger activation for role-holding offenders is tested only at the code-inspection level (by reading `TriggerProtocol.executeTrigger()` and `kernel._revokeOfficialAccess()`), not at the integration test level.

### 6. Risk if ignored

**Medium-high test coverage risk.** The `TriggerProtocol.executeTrigger()` path calls `kernel._revokeOfficialAccess()` and `treasury.blockAddressByTrigger()`. These calls operate on the offender's address passed as a parameter, not on the SWF's internal role registry. A future change that decouples role revocation from the trigger execution path — or that changes which roles are revoked — would not be caught by any existing test if the offender held SWF/treasury roles. The existing tests only verify that the trigger protocol does not grant roles it should not grant; they do not verify that it revokes roles it should revoke from a holder.

Human review of `TriggerProtocol.sol` and `kernel._revokeOfficialAccess()` should confirm the revocation logic is correct. The invariant test is a future regression guard.

### 7. Non-claims

This analysis does not change `TriggerProtocol.sol`, `kernel.sol`, `_revokeOfficialAccess()`, or any role grant/revoke logic. The `MULTISIG_THRESHOLD` of 7 of 9 is unchanged. Writing this test is deferred work; it is not a Step-15 deliverable. Human review of the revocation path is preserved as a separate, non-automated step.

---

## Summary Table

| ID | Step-14 Ref | Classification | Recommended Action | Priority |
|----|-------------|----------------|--------------------|----------|
| P-01 | §2.4 | Partially CORRECTED; narrow residual | Add targeted test for `not approved` path with pre-existing `spent` | Low |
| P-02 | §4.4 | CORRECTED / not-a-gap | No action required; reclassify in Step-14 errata | None |
| P-03 | §5.4 (first) | Confirmed gap | Add multi-operation sequence invariant test | Low |
| P-04 | §5.4 (second) | Confirmed gap | Add yield conservation (L1+L2+totalAssets) invariant test | Medium |
| P-05 | §6.4 | Confirmed gap | Add monotonic-increase invariant test for `provincialBalance` | Low |
| P-06 | §7.4 (first) | CORRECTED / not-a-gap | No action required; reclassify in Step-14 errata | None |
| P-07 | §7.4 (second) | Confirmed gap | Add role-revocation integration test (offender holds SWF/treasury role before trigger) | Medium-High |

### Count reconciliation

Step-14 stated 6 POTENTIAL items. This document found 7 items marked `[POTENTIAL]` in the body text. After analysis:

- 2 items are reclassified as not-a-gap (P-02, P-06).
- 1 item is reclassified as partially corrected with a narrow residual (P-01).
- 4 items are confirmed gaps requiring future tests (P-03, P-04, P-05, P-07).

No POTENTIAL item was found to require a contract change or storage redesign. All four confirmed gaps are test-suite additions only.

---

## Preserved Non-Claims

- **Step-12 is not closed.** External audit, oracle operations evidence, and human review sign-off remain open. This resolution plan does not constitute Step-12 closure.
- **Step-13 is not formally closed.** This document does not constitute Step-13 sign-off.
- **No production readiness claim.** This document does not assert deployment authorization, formal verification, or mainnet readiness.
- **No contract changes.** None of the analyses above authorize modifying any `.sol` file. All deferred test work is test-suite additions only.
- **No threshold changes.** `LIQUIDITY_CAP`, `MIN_RESERVE_RATIO`, `MULTISIG_THRESHOLD`, `TRIGGER_TIMEOUT`, `MULTISIG_REQUIRED`, and `COUNCIL_THRESHOLD` are unchanged and non-configurable.
- **No Kernel upgradeability.** Nothing in this document authorizes adding proxy patterns or upgrade mechanisms to `kernel.sol`.
- **No `BURNER_ROLE` or `MINTER_ROLE` grants.** P-04 analysis of `distributeAnnualYield()` does not authorize granting token roles to `SovereignWealthFund.sol` or `VelocityFee.sol`.
- **Human freeze authority is preserved.** P-07's recommended integration test for role revocation must not replace human or governance judgment for freeze, emergency classification, or trigger authorization decisions. Any future test covers the on-chain mechanics; the constitutional requirement for human oversight over the trigger process remains unchanged.
- **Step-14 OBSERVED and INFERRED gaps are not re-analyzed here.** This document covers POTENTIAL items only.
