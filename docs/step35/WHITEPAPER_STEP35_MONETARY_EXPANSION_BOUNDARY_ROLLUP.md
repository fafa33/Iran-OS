# Step 35 — Monetary Expansion Boundary Rollup

## Scope and Non-Goals

This document records the results of Step 34 monetary expansion constraint boundary testing. It summarizes INV-05 and INV-06 test outcomes, confirms the test count, and recommends the next phase.

**This document is documentation only.** It does not change contracts, tests, thresholds, or governance assumptions. It does not close Step 12 or Step 13. It does not claim readiness or sign-off.

---

## 1. Step 34 — Monetary Expansion Boundary Tests

**Commit:** `90e3cb4`
**Merge commit:** `19d3b6d` (PR #22 → main)
**File modified:** `test/02_pahlavi_token.test.js`
**Tests added:** 4
**describe block:** `"INV-05/INV-06 Monetary Expansion Boundary Invariants"`

### Context

Step 25 (`docs/step25/WHITEPAPER_STEP25_ECONOMIC_RUNTIME_CONTINUATION_PLAN.md`) identified monetary expansion constraint boundary tests as a high-priority work item. Steps 26–33 completed the reserve classification runtime tests, Treasury accounting mapping, and the TG-01 authority boundary design review before returning to this candidate.

---

## 2. INV-05 — MIN_RESERVE_RATIO Boundary

**Invariant:** `PahlaviToken.mint()` is gated by `reserveCompliant(amount)`, which computes:

```
ratio = (totalReserves * 1000) / (totalSupply() + mintAmount)
require(ratio >= MIN_RESERVE_RATIO)   // MIN_RESERVE_RATIO = 333
```

Integer division is applied. The floor boundary is inclusive: a ratio of exactly 333 passes; a ratio of 332 reverts.

### INV-05a — Floor boundary inclusive (passes)

| Parameter | Value |
|---|---|
| `totalReserves` | `333 × 1e18` |
| `totalSupply()` | `0` (fresh deploy) |
| `mintAmount` | `1000 × 1e18` |
| Computed ratio | `floor(333000 / 1000) = 333` |
| Result | **Passes** — mint succeeds, `totalSupply == 1000 × 1e18` |

### INV-05b — One PAH past floor reverts; state unchanged

| Parameter | Value |
|---|---|
| `totalReserves` | `333 × 1e18` |
| `totalSupply()` | `0` (fresh deploy) |
| `mintAmount` | `1001 × 1e18` |
| Computed ratio | `floor(333000 / 1001) = 332` |
| Result | **Reverts** — `"PAH: reserve ratio below minimum 33.3%"` |
| State after revert | `totalSupply == 0`, `totalReserves == 333 × 1e18` (unchanged) |

**Finding:** The `reserveCompliant` modifier enforces the 333/1000 floor with full state neutrality on revert. Integer division at this boundary means the gap between pass and fail is a single PAH unit (1e18 wei) difference in mintAmount given reserves of exactly 333e18.

---

## 3. INV-06 — MAX_SUPPLY / LIQUIDITY_CAP Boundary

**Invariant:** `reserveCompliant(amount)` first checks:

```
uint256 newSupply = totalSupply() + mintAmount;
require(newSupply <= MAX_SUPPLY, "PAH: exceeds liquidity cap");
```

`MAX_SUPPLY = 900_000_000_000 × 1e18`. The cap is inclusive: `newSupply == MAX_SUPPLY` passes; `newSupply == MAX_SUPPLY + 1` reverts.

### INV-06a — Mint to exactly MAX_SUPPLY succeeds

| Parameter | Value |
|---|---|
| `totalReserves` | `300_000_000_000 × 1e18` (deployment default) |
| `totalSupply()` | `0` |
| `mintAmount` | `900_000_000_000 × 1e18` (= MAX_SUPPLY) |
| Cap check | `MAX_SUPPLY ≤ MAX_SUPPLY` → passes |
| Reserve ratio | `floor(300B × 1000 / 900B) = floor(333.33...) = 333 ≥ 333` → passes |
| Result | **Passes** — `totalSupply == MAX_SUPPLY` |

### INV-06b — 1 wei beyond MAX_SUPPLY reverts; supply unchanged

| Parameter | Value |
|---|---|
| Setup | `totalSupply == MAX_SUPPLY` (after INV-06a setup step) |
| `mintAmount` | `1` wei |
| `newSupply` | `MAX_SUPPLY + 1` |
| Cap check | `MAX_SUPPLY + 1 ≤ MAX_SUPPLY` → fails |
| Result | **Reverts** — `"PAH: exceeds liquidity cap"` |
| State after revert | `totalSupply == MAX_SUPPLY` (unchanged) |

**Finding:** The cap check precedes the reserve ratio check in the modifier. Once supply is at MAX_SUPPLY, all further mint calls revert at the cap guard regardless of reserve levels. The cap is a hard ceiling enforced in the modifier before any arithmetic on the ratio.

---

## 4. Test Count

| Metric | Value |
|---|---|
| Tests added (Step 34) | 4 |
| Tests passing before Step 34 | 468 |
| Tests passing after Step 34 | **472** |
| Tests failing | 0 |
| Baseline (main before Step 34) | 468 |

---

## 5. Merge Record

| Item | Value |
|---|---|
| Step 34 commit | `90e3cb4` |
| PR | #22 |
| Merge commit | `19d3b6d` |
| Branch merged | `claude/step15-potential-gaps-cUVbj` |
| Target | `main` |

---

## 6. No Doctrine or Constant Changes

The following constants were read from the contract and used only in test assertions. None were modified:

| Constant | Value | Location |
|---|---|---|
| `MAX_SUPPLY` | `900_000_000_000 × 1e18` | `PahlaviToken.sol` |
| `MIN_RESERVE_RATIO` | `333` | `PahlaviToken.sol` |
| `LIQUIDITY_CAP` | `900_000_000_000 × 1e18` | `kernel.sol` |
| `MIN_RESERVE_RATIO` (Kernel) | `333` | `kernel.sol` |
| `MULTISIG_THRESHOLD` | `7 of 9` | `kernel.sol` |
| `MULTISIG_THRESHOLD` (Treasury) | `3` | `Treasury.sol` |
| `ANNUAL_BUDGET_CAP` | `150_000_000_000 × 1e18` | `Treasury.sol` |
| Treasury mint authority | Prohibited | Architecture |
| DG-01 contract change | Not authorized | `TriggerProtocol.sol` |
| TG-01 contract change | Not authorized | `TriggerProtocol.sol`, `Treasury.sol` |
| Step 12 | Open | Process |
| Step 13 | Open | Process |

---

## 7. Remaining Monetary Risks

### Open invariants from Step 21 / Step 25 catalog

| ID | Invariant | Status |
|---|---|---|
| INV-01 | `totalAssets` multi-step conservation | **Closed** — Step 28 (`4858f89`) |
| INV-02 | Reserve ratio floor maintained across multi-step mint sequence | Open — no test |
| INV-03 | Reserve update does not bypass mint gate | Open — no test |
| INV-04 | Emergency mode blocks all mints regardless of reserves | Open — no test |
| INV-05 | `MIN_RESERVE_RATIO` floor boundary | **Closed** — Step 34 (`90e3cb4`) |
| INV-06 | `MAX_SUPPLY` cap boundary | **Closed** — Step 34 (`90e3cb4`) |

### Open Treasury accounting invariants (from Step 32 TINV catalog)

| ID | Invariant | Status |
|---|---|---|
| TINV-01 | `totalBudgetAllocated <= ANNUAL_BUDGET_CAP` multi-step | Open |
| TINV-02 | `sectorBudgets[s].spent + remaining == allocated` | Open |
| TINV-04 | `budgetLines[l].spent <= allocated` exhaustion | Open |
| TINV-05 | `signTransaction()` blocked-recipient revert state-neutral | Open |
| TINV-06 | Executed Treasury transaction cannot be re-executed | Open |
| TINV-07 | Rejected transaction cannot be executed | Open |
| TINV-08 | `blockedByTrigger[offender]` prevents `proposeTransaction` state-neutral | Open |
| TINV-09 | Sector ratio sum == 1000 | Open |
| TINV-10 | `approveBudget()` distributes exactly TOTAL_BUDGET | Open |

### Open design questions

| Item | Status |
|---|---|
| TG-01 — Treasury blocking gap | Open — Option D pattern; no contract change |
| TC-01 — `Expenditure.approved` field unused | Open — no action authorized |
| TC-02 — per-budget-line remaining view | Open — no action authorized |
| TC-03 — blocked address pending tx cleanup | Open — no contract change authorized |
| DG-01 — SWF COUNCIL_ROLE not revoked on trigger | Open — Option D pattern; no contract change |

---

## 8. Recommended Next Phase

Two candidates are eligible following Step 35.

### Option 1 — Treasury Invariants (TINV-09 / TINV-10)

**What it is:** Tests for the arithmetic invariants: sector ratio sum equals exactly 1000, and `approveBudget()` distributes exactly `TOTAL_BUDGET = 150B PAH` with no remainder.

**Why consider it now:** These are zero-risk arithmetic checks with no contract dependency beyond the BudgetAllocation deployment. They require no new setup and can be added directly to `test/17_Budget_Allocation.test.js`.

**Risk:** Very low — tests only, no contract changes.

### Option 2 — Treasury State-Neutrality Invariants (TINV-05 / TINV-08)

**What it is:** State-neutrality tests for `signTransaction()` blocked-recipient revert (TINV-05) and `proposeTransaction()` blocked-initiator behavior (TINV-08), paralleling the P-01 test completed in Step 31.

**Why consider it now:** TINV-05 and TINV-08 are the highest-value Treasury state-neutrality assertions remaining. They exercise the `notBlocked()` modifier path and the `blockedByTrigger` mapping — the same domain as the TG-01 design review.

**Risk:** Low — tests only, no contract changes.

### Recommended order

**TINV-09 / TINV-10 first (Option 1), then TINV-05 / TINV-08 (Option 2).**

Rationale: The arithmetic checks are shorter and self-contained. They establish the BudgetAllocation ratio invariants without requiring multi-step Treasury transaction sequences. The state-neutrality tests require a fuller Treasury deployment fixture and are better attempted after the arithmetic baseline is confirmed.

---

## 9. What Must Not Change

| Item | Value | Location |
|---|---|---|
| `LIQUIDITY_CAP` | `900,000,000,000 × 1e18` | `kernel.sol` |
| `MIN_RESERVE_RATIO` | `333 (33.3%)` | `kernel.sol` |
| `MULTISIG_THRESHOLD` (Kernel) | `7 of 9` | `kernel.sol` |
| `MULTISIG_THRESHOLD` (Treasury) | `3` | `Treasury.sol` |
| `ANNUAL_BUDGET_CAP` | `150,000,000,000 × 1e18` | `Treasury.sol` |
| `MAX_SUPPLY` | `900,000,000,000 × 1e18` | `PahlaviToken.sol` |
| Treasury mint authority | Prohibited | Architecture |
| TG-01 contract change | Not authorized | `TriggerProtocol.sol`, `Treasury.sol` |
| DG-01 contract change | Not authorized | `TriggerProtocol.sol` |
| Step 12 | Open | Process |
| Step 13 | Open | Process |

---

## Resolution Status

| Item | Status |
|---|---|
| INV-05 MIN_RESERVE_RATIO boundary | **Closed** — `90e3cb4` |
| INV-06 MAX_SUPPLY / LIQUIDITY_CAP boundary | **Closed** — `90e3cb4` |
| INV-02, INV-03, INV-04 | Open |
| TINV-09, TINV-10 (arithmetic) | Open — recommended next |
| TINV-05, TINV-08 (state-neutral) | Open — recommended after |
| TG-01 authority boundary | Open — Option D pattern |
| DG-01 authority boundary | Open — Option D pattern |
| Step 12 | Open |
| Step 13 | Open |

---

*Step 35 — Monetary Expansion Boundary Rollup*
*Branch: `main`*
*Reference commits: `90e3cb4` (Step 34), `19d3b6d` (merge PR #22)*
*Date: 2026-05-29*
