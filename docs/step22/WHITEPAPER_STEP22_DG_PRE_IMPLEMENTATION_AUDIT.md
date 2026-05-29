# Step-22 DG Pre-Implementation Audit

## Scope and Non-Goals

This document records the pre-implementation audit of design gaps DG-01 through DG-04 identified in Step-21 (`docs/step21/WHITEPAPER_STEP21_SOVEREIGN_RESERVE_RUNTIME_MODEL.md`, commit `07b317f`). The audit establishes factual status, evidence, current behavior, missing behavior, runtime impact, artifact type, priority, and recommended sequencing for each gap.

**This document is documentation only.** It does not change contracts, tests, architecture, thresholds, trigger codes, Kernel assumptions, governance assumptions, or monetary constants. It does not fix any gap. It does not claim completion, readiness, deployment authorization, or sign-off. It does not close Step-12 or Step-13. It does not alter human freeze authority.

### Preserved Constants

| Constant | Contract | Value |
|---|---|---|
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `kernel.sol`, `PahlaviToken.sol` | 900,000,000,000 × 1e18 PAH |
| `MIN_RESERVE_RATIO` | `kernel.sol`, `PahlaviToken.sol` | 333 (33.3‰) |
| `MULTISIG_THRESHOLD` | `kernel.sol` | 7 of 9 |
| `TRIGGER_TIMEOUT` | `kernel.sol` | 72 hours |
| `MULTISIG_REQUIRED` | `SovereignWealthFund.sol` | 3 of N |
| `ANNUAL_YIELD` | `SovereignWealthFund.sol` | 150 (15.0‰ of L2 balance) |

None of the items below authorize changing these constants.

---

## Table of Contents

1. [DG-01 — SWF COUNCIL_ROLE Persists After Trigger Activation](#dg-01--swf-council_role-persists-after-trigger-activation)
2. [DG-02 — layerL2.totalWithdrawn Not Updated on Yield Distribution](#dg-02--layerl2totalwithdrawn-not-updated-on-yield-distribution)
3. [DG-03 — No Automatic Sync Between SWF Deposits and totalReserves](#dg-03--no-automatic-sync-between-swf-deposits-and-totalreserves)
4. [DG-04 — Pending Withdrawal Amount Not Pre-Reserved in Layer Balance](#dg-04--pending-withdrawal-amount-not-pre-reserved-in-layer-balance)
5. [Summary Table](#summary-table)
6. [Recommended Sequencing](#recommended-sequencing)
7. [Preserved Non-Claims](#preserved-non-claims)

---

## DG-01 — SWF COUNCIL_ROLE Persists After Trigger Activation

### Classification

**CONFIRMED GAP**

### Evidence

| Source | Location | Observation |
|---|---|---|
| `contracts/core/TriggerProtocol.sol` | Line 19 | `address public swf` stores the SWF address |
| `contracts/core/TriggerProtocol.sol` | Lines 58–75 | `executeTrigger()` body: line 62 sets `blockedFromTreasury[offender] = true`; the `swf` field is never called in this function |
| `contracts/core/TriggerProtocol.sol` | Full file | No `revokeRole`, `hasRole`, or any SWF interface call exists anywhere |
| `contracts/kernel.sol` | Lines 360–371 | `_revokeOfficialAccess()` calls `_revokeRole()` for `SOVEREIGN_ROLE`, `COURT_ROLE`, `GUARDIAN_ROLE`, `ORACLE_ROLE` only — all within the kernel's own AccessControl registry |
| `contracts/monetary/SovereignWealthFund.sol` | Lines 73, 79, 85, 91, 101, 118 | All state-changing functions guard with `onlyRole(COUNCIL_ROLE)`; COUNCIL_ROLE lives in SWF's own AccessControl registry |
| `contracts/monetary/Treasury.sol` | Lines 131–132 | `blockAddressByTrigger()` sets `blockedByTrigger[target] = true` in Treasury only; TriggerProtocol calls this, not an SWF equivalent |
| `test/08_Trigger_Protocol.test.js` | Commit `bc647b1` | Test `"trigger activation revokes offender kernel role and preserves SWF COUNCIL_ROLE as design-boundary fact"` asserts `realSwf.hasRole(COUNCIL_ROLE, offender.address) == true` after full 7-of-9 trigger activation |

### Current Behavior

When trigger activation occurs via the 7-of-9 path:

1. `Kernel._revokeOfficialAccess(offender)` revokes `COURT_ROLE`, `GUARDIAN_ROLE`, `ORACLE_ROLE`, and `SOVEREIGN_ROLE` from the kernel's AccessControl registry.
2. `TriggerProtocol.executeTrigger()` sets `Treasury.blockedByTrigger[offender] = true`.
3. No call is made to `SovereignWealthFund` at any point in the trigger path.

An offender who held `COUNCIL_ROLE` in SWF before trigger activation continues to hold it after trigger activation. The `TriggerProtocol.swf` address field stores the SWF contract address but is never called inside `executeTrigger()`.

### Missing Behavior

No contract function in the current trigger path calls `SovereignWealthFund.revokeRole(COUNCIL_ROLE, offender)` or any equivalent function on the SWF. The trigger path covers kernel-internal roles and Treasury blocking but does not cover SWF access revocation.

### Runtime Impact

A trigger-activated offender retains the ability to call all COUNCIL_ROLE-gated functions on the SWF:

- `depositToL1()`, `depositToL2()`, `depositToL3()` — can add to reserve balances
- `proposeWithdrawal()` — can initiate withdrawal proposals
- `signWithdrawal()` — can contribute signatures toward threshold
- `distributeAnnualYield()` — can trigger L2→L1 yield transfer

Treasury is blocked post-trigger. SWF is not. The post-trigger enforcement perimeter is incomplete with respect to the sovereign wealth fund.

### Artifact Type

**Contract** — requires a cross-contract call to SWF role revocation within the trigger execution path. The call site is either `TriggerProtocol.executeTrigger()` (which already holds the SWF address) or `Kernel._activateTrigger()`. An interface for SWF role revocation does not currently exist in either contract.

### Priority

**P1** — post-trigger authority enforcement gap. Does not bypass `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP`. Does allow a constitutionally blocked offender continued operational access to the sovereign wealth fund layer.

---

## DG-02 — layerL2.totalWithdrawn Not Updated on Yield Distribution

### Classification

**CONFIRMED GAP**

### Evidence

| Source | Location | Observation |
|---|---|---|
| `contracts/monetary/SovereignWealthFund.sol` | Line 122 | `distributeAnnualYield()`: `layerL2.balance -= yield; layerL1.balance += yield; layerL1.totalDeposited += yield;` — no `layerL2.totalWithdrawn += yield` |
| `contracts/monetary/SovereignWealthFund.sol` | Lines 111–113 | `signWithdrawal()` at execution: `layerL2.balance -= tx_.amount; layerL2.totalWithdrawn += tx_.amount;` — `totalWithdrawn` is updated here |
| `contracts/monetary/SovereignWealthFund.sol` | Line 31 | `totalWithdrawn` field defined in `AssetLayer` struct |
| `test/03_sovereign_wealth_fund.test.js` | Line 248 | `expect(postL2.totalWithdrawn).to.equal(preL2.totalWithdrawn)` — passing assertion added in Step-18 explicitly documenting the omission as current behavior |

### Current Behavior

`distributeAnnualYield()` (line 122) performs three storage writes:

```
layerL2.balance    -= yield
layerL1.balance    += yield
layerL1.totalDeposited += yield
```

`layerL2.totalWithdrawn` is not incremented. After yield distribution, the bookkeeping identity `layerX.balance == layerX.totalDeposited - layerX.totalWithdrawn` holds for every layer operation except this one. Specifically, for L2 after any yield distribution:

```
layerL2.balance < layerL2.totalDeposited - layerL2.totalWithdrawn
```

The shortfall equals the cumulative yield distributed to date. `totalAssets()` remains conserved because the movement is a same-boundary transfer.

### Missing Behavior

`layerL2.totalWithdrawn += yield` at line 122 of `distributeAnnualYield()`. Without this, the full history of L2 balance decreases cannot be reconstructed from storage fields alone. Auditors must also read `AnnualYieldDistributed` event logs to reconcile L2 outflows.

### Runtime Impact

**Medium — auditability only.** `totalAssets()` conservation is unaffected. `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` enforcement in `PahlaviToken` are unaffected. The gap affects forensic accounting: any system or auditor computing L2 net flows from `totalDeposited` and `totalWithdrawn` alone will produce an incorrect figure after yield has been distributed. Event log parsing is required for complete reconciliation.

### Artifact Type

**Accounting rule** — single-line contract change to add `layerL2.totalWithdrawn += yield;` at line 122 of `distributeAnnualYield()`. Requires a corresponding update to the Step-18 test at line 248 of `test/03_sovereign_wealth_fund.test.js` (which currently asserts equality as a baseline document of current behavior).

### Priority

**P2** — auditability and bookkeeping completeness gap. No conservation failure, no security risk, no impact on minting constraints.

---

## DG-03 — No Automatic Sync Between SWF Deposits and totalReserves

### Classification

**DESIGN CONSTRAINT**

### Evidence

| Source | Location | Observation |
|---|---|---|
| `contracts/monetary/PahlaviToken.sol` | Lines 197–203 | `updateReserves(uint256 newReserves)` is the only path to modify `totalReserves`; guard: `onlyKernel` |
| `contracts/monetary/PahlaviToken.sol` | Lines 83–91 | `reserveCompliant()` modifier checks `totalReserves` (not SWF balances) against `MIN_RESERVE_RATIO` |
| `contracts/kernel.sol` | Full file | No `IPahlaviToken` interface, no `updateReserves` call; `grep` returns zero results |
| `contracts/monetary/SovereignWealthFund.sol` | Full file | No reference to `PahlaviToken` or `updateReserves` |
| `test/02_pahlavi_token.test.js` | Lines 8–20 | `swf` and `kernel` are Hardhat signers (EOAs), not deployed contract instances; `totalReserves` is set once at deploy via `_initialReserves` |
| `test/02_pahlavi_token.test.js` | Lines 82, 173 | `updateReserves()` called directly by the `kernel` signer, not triggered by SWF deposit events or a real Kernel contract |
| All test files | — | No test deploys both `SovereignWealthFund` and `PahlaviToken` and exercises the sequence: SWF deposit → `updateReserves()` → PAH `mint()` |

### Current Behavior

`PahlaviToken.totalReserves` is set at construction via `_initialReserves` and updated only via explicit `updateReserves()` call (KERNEL_ROLE). SWF deposits have no automatic effect on `totalReserves`. The `reserveCompliant()` modifier checks `totalReserves`, not SWF layer balances. The two accounting ledgers are intentionally separate.

The `mint()` function is callable only by an address holding `MINTER_ROLE`, which is granted to the SWF at construction. The minting capacity (reserve ratio gate) is gated on `totalReserves`, which the kernel must update explicitly.

### Missing Behavior

The separation is documented as intentional in Step-6 monetary protocol. What is absent is an integration test covering the authorized governance path:

1. Deploy real `SovereignWealthFund` and `PahlaviToken` with shared roles.
2. Deposit to SWF L1 (increasing reserve assets).
3. Kernel calls `updateReserves()` to recognize the SWF balance as backing.
4. SWF calls `PahlaviToken.mint()` and confirm the ratio gate passes.

This end-to-end path is architecturally valid but untested. The test at `02_pahlavi_token.test.js` uses EOA signers for both `swf` and `kernel`, not real contract deployments.

### Runtime Impact

**Low — test coverage gap only.** No correctness failure. The separation between SWF balances and `totalReserves` is intentional and protects against SWF deposits automatically unlocking arbitrary minting capacity. The impact is that the authorized path from SWF growth to increased PAH minting capacity has not been exercised end-to-end in any test suite.

### Artifact Type

**Test only** — integration test required. No contract change needed. The design is intentional; the gap is verification coverage of the authorized path.

### Priority

**P2** — test coverage gap for a valid and authorized governance path.

---

## DG-04 — Pending Withdrawal Amount Not Pre-Reserved in Layer Balance

### Classification

**DESIGN CONSTRAINT**

### Evidence

| Source | Location | Observation |
|---|---|---|
| `contracts/monetary/SovereignWealthFund.sol` | Lines 91–98 | `proposeWithdrawal()` creates a `Transaction` record with `executed = false`; `layerX.balance` is not modified |
| `contracts/monetary/SovereignWealthFund.sol` | Lines 101–115 | `signWithdrawal()` decrements `layerX.balance` only when `signaturesCount >= MULTISIG_REQUIRED` (line 109) |
| `contracts/monetary/SovereignWealthFund.sol` | Line 111 | `require(layerL1.balance >= tx_.amount, "SWF: insufficient L1")` fires at execution time, not at proposal time |
| `test/03_sovereign_wealth_fund.test.js` | Lines 174–179 | Tests a single over-withdrawal scenario; no test creates two concurrent proposals for the same layer where combined amounts exceed balance |
| `test/03_sovereign_wealth_fund.test.js` | Lines 182–197 | `"insufficient L1 withdrawal execution is state-neutral"` verifies the execution-time guard works correctly |

### Current Behavior

During the proposal phase (between `proposeWithdrawal()` and the threshold signature in `signWithdrawal()`), `layerX.balance` is unchanged and reflects the full balance. Two proposals can exist simultaneously for amounts that together exceed `layerX.balance`. The execution-time balance check `require(layerX.balance >= tx_.amount)` is the sole protection:

- Whichever proposal reaches threshold first executes and decrements `layerX.balance`.
- If the second proposal then attempts execution with insufficient remaining balance, it reverts with `"SWF: insufficient L1/L2/L3"`.

No value is lost. The second execution reverts cleanly. `layerX.balance` after any failed execution remains unchanged (confirmed by Step-8 boundary tests).

### Missing Behavior

No pre-reservation mechanism. `layerX.balance` alone does not signal "effective available balance" during the pending window. External readers must also query all unexecuted `transactions[txId]` entries to determine how much is earmarked by pending proposals.

### Runtime Impact

**Low — monitoring and observability only.** The execution-time guard prevents actual double-spend. No conservation failure is possible. The impact is that `layerX.balance` is an overestimate of the freely deployable balance when pending proposals exist. Any monitoring system or external integrator relying on `layerX.balance` alone for available-balance calculations will need to account for this.

### Artifact Type

**Accounting rule (design decision)** — whether to add pre-reservation at proposal time is an architectural choice that affects the balance semantics. Adding it would require subtracting pending amounts from `layerX.balance` at proposal time and restoring them on rejection. The current execution-time guard is sufficient for safety; the gap is observability only.

### Priority

**P2** — observability and monitoring gap. No safety failure.

---

## Summary Table

| Gap | Classification | Artifact | Priority | Step |
|---|---|---|---|---|
| DG-01 | CONFIRMED GAP | Contract | P1 | Trigger path → SWF role revocation |
| DG-02 | CONFIRMED GAP | Accounting rule | P2 | `distributeAnnualYield()` + `totalWithdrawn` |
| DG-03 | DESIGN CONSTRAINT | Test only | P2 | SWF deposit → `updateReserves()` → `mint()` integration |
| DG-04 | DESIGN CONSTRAINT | Accounting rule (design decision) | P2 | Pending withdrawal pre-reservation |

---

## Recommended Sequencing

The following sequencing is recommended for future work items. It does not authorize any implementation. It records the ordered rationale only.

### Sequence 1 — DG-03 (Test Only, First)

DG-03 requires no contract change. An integration test deploying real `SovereignWealthFund` and `PahlaviToken` together and exercising the SWF-deposit → `updateReserves()` → `mint()` path can be written and committed without touching any contract. This is the lowest-risk item and the fastest to close. It also establishes a real integration baseline for future DG-01 and DG-02 work.

### Sequence 2 — DG-02 (Accounting Fix, Second)

DG-02 is a single-line contract change to `distributeAnnualYield()` plus a corresponding test update. It is isolated to one function in one contract. It does not affect `totalAssets()`, `MIN_RESERVE_RATIO`, or `LIQUIDITY_CAP`. Once the DG-03 integration baseline exists, DG-02 can be applied and its accounting correctness can be confirmed across both unit and integration tests.

### Sequence 3 — DG-04 (Design / Documentation Decision, Third)

DG-04 does not have a clear-cut fix: adding pre-reservation at proposal time would change the semantics of `layerX.balance` and affect how callers read available balance. This requires a deliberate design decision — either accept current behavior with documentation, or implement pre-reservation with full implications analyzed. No safety failure exists. A documentation clarification or explicit design decision record should precede any contract change attempt.

### Sequence 4 — DG-01 (Authority Design Review, Last)

DG-01 is the highest-priority gap but the most architecturally significant to remediate. Adding SWF role revocation to the trigger path requires:

- A new interface for SWF role revocation callable from `TriggerProtocol` or `Kernel`.
- A decision about which contract holds the call site.
- An assessment of whether calling SWF from inside `_activateTrigger()` or `executeTrigger()` introduces new reentrancy or authority risks.
- Human review and governance sign-off given the constitutional significance of the trigger path.

DG-01 should proceed only after DG-02 and DG-03 are resolved and after a human governance review of the proposed authority boundary change.

---

## Preserved Non-Claims

This document does not claim:

- That DG-01 through DG-04 are fixed or remediated.
- That the system is ready for production deployment.
- That Step-12 or Step-13 are closed.
- That any threshold, timeout, or constitutional constant has changed.
- That human freeze authority has been replaced or reduced.
- That the recommended sequencing is binding or final.
- That DG-03 and DG-04 require contract changes.

Step-22 is an audit record only. It establishes the factual state of each gap as of commit `07b317f` and provides a sequencing rationale for future work planning. It does not authorize any code change, governance action, or deployment decision.

---

*Step-22 — DG Pre-Implementation Audit*
*Branch: `claude/step15-potential-gaps-cUVbj`*
*Reference commit: `07b317f`*
*Date: 2026-05-29*
