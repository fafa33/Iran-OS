# Echidna Readiness Assessment and Baseline Fuzzing Plan
## IranOS — Constitutional Governance Smart Contracts

**Version:** 1.0.0  
**Date:** 2026-06-14  
**Status:** Analysis Only — No Code Changes  
**Scope:** 25 production contracts, 26 Hardhat test files  
**Tooling baseline:** Slither v0.11.5 (130 findings documented in SLITHER_BASELINE_AUDIT.md)

---

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - No contracts, tests, or production code were modified during this assessment.

---

## Table of Contents

1. [Repository Compatibility Assessment](#1-repository-compatibility-assessment)
2. [Echidna vs Foundry Recommendation](#2-echidna-vs-foundry-recommendation)
3. [Candidate Invariants](#3-candidate-invariants)
4. [Priority Matrix](#4-priority-matrix)
5. [Recommended Implementation Order](#5-recommended-implementation-order)
6. [Estimated Effort](#6-estimated-effort)
7. [Risks and Limitations](#7-risks-and-limitations)
8. [Preconditions](#8-preconditions)

---

## 1. Repository Compatibility Assessment

### 1.1 Current Build System

| Property | Value |
|---|---|
| Build system | Hardhat ^2.22.0 |
| Compiler | Solidity ^0.8.20 (compiled at 0.8.26 with optimizer + viaIR) |
| Test framework | Mocha + Ethers (26 JS test files, 565 tests) |
| Dependencies | OpenZeppelin ^4.9.0 (AccessControl, ReentrancyGuard, ERC20) |
| Foundry | Not present — no `foundry.toml`, no `forge` tests |
| Existing fuzzing | None |
| Existing Echidna config | None |

### 1.2 Echidna Compatibility Verdict: **COMPATIBLE**

Echidna integrates with Hardhat projects via `crytic-compile`, the same compilation backend used by Slither (already proven to work in this environment). Echidna can read pre-compiled Hardhat artifacts directly when invoked with the Hardhat target. No changes to `hardhat.config.js`, `package.json`, or production contracts are required.

**What would be added (analysis only — not implemented here):**

- `contracts/fuzzing/` — new directory containing harness contracts only
- `echidna.yaml` — Echidna configuration at repo root
- `.github/workflows/echidna.yml` — optional CI integration (separate task)

None of these additions touch production contracts or tests.

### 1.3 Contract Architecture Summary for Fuzzing

The 25 contracts form 7 governance layers with clear authority chains:

```
IranOS_Kernel (Layer 0)
├── ConstitutionGuard          — law gating
├── TriggerProtocol            — enforcement execution
│   └── Treasury               — budget + block
├── SovereignWealthFund        — 3-layer wealth fund
│   └── PahlaviToken           — monetary supply (ERC20)
├── API3Oracle                 — data feed + violation flag
├── Provincial                 — 30/70 distribution
├── Parliament                 — law lifecycle
├── VotingSystem               — elections
├── BudgetAllocation           — budget routing
├── Fargard7PolicyAdapter      — proposal-only adapter
├── Justice: JurySelection, JusticeProtocol, PenalLabor
├── Welfare: CitizenCard, BaseIncome, HealthCoverage, DisabilitySupport
├── Oracle: PriceOracle, ProductionOracle
└── Reclaim: AssetFreeze, SovereignCrawler, VictimFund
```

**Fuzzing surface observation:** The highest-risk invariants cluster in the Kernel→Trigger→Treasury chain and the PahlaviToken monetary constraints. These are the natural Phase 1 targets.

---

## 2. Echidna vs Foundry Recommendation

### Recommendation: **Echidna first**

#### Rationale

| Criterion | Echidna | Foundry Invariant Tests |
|---|---|---|
| Build system compatibility | Native Hardhat via crytic-compile | Requires `foundry.toml` + dual toolchain |
| Toolchain consistency | Same crytic ecosystem as Slither (already proven) | Separate toolchain not yet validated in this environment |
| Property style | Boolean `echidna_*()` functions — maps directly to constitutional invariants | `invariant_*()` style — similar but in Forge |
| Migration cost | Zero — harness contracts in new directory | High — would require reproducing or bridging 565 existing JS tests or accepting dual coverage |
| Coverage tracking | Built-in corpus + coverage report | Built-in in Foundry |
| Multi-contract stateful fuzzing | Excellent — designed for stateful multi-contract protocols | Excellent — comparable |
| External call fuzzing | Strong | Strong |
| Deployment | Standalone binary (`echidna`) | Standalone binary (`forge`) |

#### Why not Foundry first

The existing test suite is 100% Hardhat/JS. Introducing Foundry as the *first* fuzzing tool would require either (a) migrating all 565 tests to Solidity — a large task with regression risk — or (b) running two separate test stacks with divergent fixture setup. Either path creates maintenance burden before any fuzzing value is realized. Echidna avoids this by working alongside the existing Hardhat suite without touching it.

#### When to add Foundry (later)

Foundry invariant tests become valuable once the project considers migrating its test suite or wants integrated in-test property assertions. That is a Step 14+ concern, not a prerequisite for initial fuzzing coverage.

---

## 3. Candidate Invariants

For each invariant:  
**Risk** | **Contract(s)** | **Why it matters** | **Expected property** | **Difficulty** | **Phase**

---

### INV-01 — PAH Supply Cap

**Risk:** CRITICAL  
**Contracts:** `PahlaviToken`  
**Why it matters:** `MAX_SUPPLY = 900_000_000_000 × 1e18` is a constitutional red line (TR-06, منشور فرگرد ۷ بند ۴۱). Any breach inflates the monetary base and violates the fundamental rights guarantee. The contract enforces this in the `reserveCompliant` modifier, but the modifier applies only to `mint()`, not to inherited ERC20 internal paths.  
**Expected property:** `totalSupply() <= MAX_SUPPLY` at all times, for all sequences of `mint()`, `burn()`, and inherited ERC20 calls.  
**Difficulty:** Low — single view function check; no cross-contract dependencies needed for Phase 1.  
**Phase:** 1

---

### INV-02 — Reserve Ratio Floor

**Risk:** CRITICAL  
**Contracts:** `PahlaviToken`  
**Why it matters:** `MIN_RESERVE_RATIO = 333` (33.3%) is a constitutional monetary safeguard. The check `(totalReserves × 1000) / newSupply >= 333` is applied at mint time. However, `updateReserves()` can lower `totalReserves` after a mint without re-checking the ratio against the already-existing supply. A fuzzer can discover sequences where `updateReserves(0)` is called after minting.  
**Expected property:** After any sequence of `mint()` + `updateReserves()`, if `totalSupply() > 0` then `(totalReserves × 1000) / totalSupply() >= MIN_RESERVE_RATIO`.  
**Difficulty:** Medium — requires fuzz actor with both MINTER_ROLE and KERNEL_ROLE; exposes a known gap in reserve enforcement.  
**Phase:** 1

**Echidna result (2026-06-15):** FAILING IN PRIVILEGED HARNESS; not currently production-reachable based on available Kernel call paths.

- Counterexample confirmed: `doMint(1) → doUpdateReserves(0)` — 2-call sequence found within first 500 iterations.
- Root gap: `updateReserves(uint256)` accepts any value including 0 with no lower-bound guard and no post-update ratio check. The mint-time `reserveCompliant` modifier does not protect against post-mint reserve reduction.
- Production reachability: `KERNEL_ROLE` on `PahlaviToken` is held by `IranOS_Kernel`. Grep across all 25 production contracts confirms `IranOS_Kernel` contains zero calls to `updateReserves()` — the function is effectively unreachable from any current production transaction path.
- Forward-looking risk: The NatSpec on `updateReserves()` states it is intended to be "called by API3Oracle through Kernel." That routing function does not yet exist in `IranOS_Kernel`. When oracle-to-token reserve synchronization is implemented in a future Kernel version, this gap will become live unless a floor guard is added first.
- Classification: **Design completeness gap — forward-looking, not currently exploitable.**

---

### INV-03 — Trigger Authority Boundaries

**Risk:** CRITICAL  
**Contracts:** `TriggerProtocol`, `kernel.sol`  
**Why it matters:** `executeTrigger()` is the most powerful state mutation in the system — it blocks treasury access, revokes signatures, and emits public constitutional notification. It must be callable only by the exact `kernel` address, never by any role holder, EOA, or other contract.  
**Expected property:** Any call to `executeTrigger()` from any address other than `kernel` reverts.  
**Difficulty:** Low — pure access control property; no complex state setup required.  
**Phase:** 1

---

### INV-04 — Multisig Threshold Preservation

**Risk:** CRITICAL  
**Contracts:** `kernel.sol`  
**Why it matters:** `MULTISIG_THRESHOLD = 7` is a constitutional minimum (7-of-9 court signatures). `_activateTrigger()` can only be called from `signViolation()` after `signaturesCount >= 7`. The invariant ensures no trigger can fire before the threshold is met, and that a single signer cannot contribute more than one signature per violation.  
**Expected property (1):** For any `violationId` where `violations[id].triggered == true`, `violations[id].signaturesCount >= 7`.  
**Expected property (2):** `violationSignatures[id][signer]` is monotonically set — once true it never returns to false.  
**Difficulty:** Medium — requires fuzzing multi-step: flagViolation, then multiple signViolation calls with different signer addresses.  
**Phase:** 1

---

### INV-05 — Emergency Lock Monotonicity

**Risk:** HIGH  
**Contracts:** `kernel.sol`  
**Why it matters:** TR-01, TR-02, TR-03 violations immediately set `emergencyLockActive = true`. The lock can only be cleared by `onlyCourt` via `deactivateEmergencyLock()`. No path through the Sovereign, Oracle, or Guardian should be able to clear the lock. If the lock could be bypassed, the system fails catastrophically during a constitutional crisis — precisely when it must hold.  
**Expected property:** Once `emergencyLockActive` becomes true, it can only become false via a transaction from an address with `COURT_ROLE`. No Sovereign, Oracle, or Guardian action clears it.  
**Difficulty:** Medium — requires role-based actor fuzzing; must verify no indirect clearing path exists through `grantOfficialAccess`, `setTriggerProtocol`, or `setSovereignWealthFund`.  
**Phase:** 1

---

### INV-06 — Oracle Non-Sovereignty

**Risk:** HIGH  
**Contracts:** `API3Oracle`, `kernel.sol`  
**Why it matters:** Per IranOS doctrine (REVIEWER_PRIMER §Oracle Non-Sovereignty), oracle data is evidence, not authority. An oracle may call `flagViolation()` on the Kernel, but the flagging alone must not trigger state changes beyond recording and the emergency lock (for TR-01/02/03). Final enforcement requires 7 court signatures. No oracle call should be able to independently (a) revoke access, (b) execute the trigger, or (c) modify treasury state.  
**Expected property:** No sequence of calls involving only `ORACLE_ROLE` (or `FEEDER_ROLE`) holders can cause `violations[id].triggered == true`.  
**Difficulty:** High — requires proving a negative across a multi-step sequence; needs multi-contract harness connecting API3Oracle to Kernel.  
**Phase:** 2

---

### INV-07 — Treasury Budget Cap

**Risk:** HIGH  
**Contracts:** `Treasury`  
**Why it matters:** `ANNUAL_BUDGET_CAP = 150_000_000_000 × 1e18`. All budget line allocations are checked against this cap at creation. However, `startNewFiscalYear()` resets `totalBudgetAllocated = 0` without validating existing active lines. A fuzzer should attempt to find sequences where allocations across year boundaries exceed the cap for any given year.  
**Expected property:** For any fiscal year, the sum of `allocated` across all active `BudgetLine` records whose `fiscalYear == currentFiscalYear` is <= `ANNUAL_BUDGET_CAP`.  
**Difficulty:** Medium — requires multi-step: create lines, roll year, check accounting.  
**Phase:** 1

---

### INV-08 — Treasury Block Permanence

**Risk:** HIGH  
**Contracts:** `Treasury`, `TriggerProtocol`  
**Why it matters:** `blockAddressByTrigger()` sets `blockedByTrigger[target] = true`. There is no unblock function anywhere in Treasury. Any blocked address must remain permanently blocked — `proposeTransaction` and `signTransaction` both enforce the block. A fuzzer should try all role combinations to verify no path clears the flag.  
**Expected property:** Once `blockedByTrigger[addr] == true`, no sequence of calls (including fiscal year rollover, new budget lines, or any role-gated function) sets it back to false.  
**Difficulty:** Low-Medium — no setter exists in source, but worth confirming via OpenZeppelin AccessControl role management paths.  
**Phase:** 1

---

### INV-09 — SWF Layer Accounting Integrity

**Risk:** HIGH  
**Contracts:** `SovereignWealthFund`  
**Why it matters:** Three-layer balance accounting (L1, L2, L3). The yield distribution path moves funds from L2 to L1. After any sequence of deposits, withdrawals, and `distributeAnnualYield()` calls, the accounting must satisfy: `layerN.balance == layerN.totalDeposited - layerN.totalWithdrawn` for each layer.  
**Expected property:** For all layers after any sequence of operations:
- `layerL1.balance == layerL1.totalDeposited - layerL1.totalWithdrawn`
- `layerL2.balance == layerL2.totalDeposited - layerL2.totalWithdrawn`
- `layerL3.balance == layerL3.totalDeposited - layerL3.totalWithdrawn`  
**Difficulty:** Medium — requires COUNCIL_ROLE fuzzing; yield distribution touches both L1 and L2 simultaneously.  
**Phase:** 2

---

### INV-10 — SWF Withdrawal Multisig Gate

**Risk:** HIGH  
**Contracts:** `SovereignWealthFund`  
**Why it matters:** `MULTISIG_REQUIRED = 3`. Any executed withdrawal must have accumulated at least 3 distinct `COUNCIL_ROLE` signatures. A single signer calling `signWithdrawal` multiple times must not accumulate signatures.  
**Expected property:** For any `txId` where `transactions[txId].executed == true`, `transactions[txId].signaturesCount >= 3`, and no single address contributed more than one signature.  
**Difficulty:** Low-Medium — similar structure to INV-04.  
**Phase:** 1

---

### INV-11 — AssetFreeze Status Monotonicity

**Risk:** HIGH  
**Contracts:** `AssetFreeze`  
**Why it matters:** The freeze lifecycle is: `Active → UnderReview → Confirmed → (TransferredToSWF | Released)`. Status must never regress (e.g., from Confirmed back to Active). A regression would allow double-freezing or double-transfer attacks.  
**Expected property:** For any `assetId`, the `FreezeStatus` value monotonically non-decreases over time. Released is a terminal state; TransferredToSWF is a terminal state.  
**Difficulty:** Medium — requires multi-signer COUNCIL fuzzing through the confirmation sequence.  
**Phase:** 2

---

### INV-12 — AssetFreeze Double-Transfer Prevention

**Risk:** HIGH  
**Contracts:** `AssetFreeze`  
**Why it matters:** `transferToSWF()` sets `transferredToSWF = true` and decrements `totalFrozenValue`. If a double execution were possible, `totalFrozenValue` could underflow (Solidity 0.8.x reverts on underflow, but the attempt itself is a protocol failure).  
**Expected property:** For any `assetId`, `transferToSWF()` can be called at most once (subsequent calls revert with "AssetFreeze: already transferred").  
**Difficulty:** Low — direct replay test; commitment flag prevents re-entry.  
**Phase:** 1

---

### INV-13 — AssetFreeze Council Threshold

**Risk:** HIGH  
**Contracts:** `AssetFreeze`  
**Why it matters:** `COUNCIL_THRESHOLD = 3`. An asset can only reach `FreezeStatus.Confirmed` after exactly 3 distinct council signatures. A fuzzer should verify that a single signer cannot accumulate the threshold.  
**Expected property:** For any `assetId`, if `frozenAssets[assetId].status == FreezeStatus.Confirmed`, then `frozenAssets[assetId].councilSignatures >= 3`, and no single address signed more than once.  
**Difficulty:** Low-Medium — replay protection via `councilSigns[assetId][msg.sender]` mapping.  
**Phase:** 1

---

### INV-14 — Replay / Idempotency Resistance

**Risk:** HIGH  
**Contracts:** `kernel.sol`, `Treasury`, `SovereignWealthFund`, `JurySelection`, `AssetFreeze`  
**Why it matters:** All multi-sig patterns use per-address signature tracking. JurySelection uses commitment-based deduplication. Each signature mechanism must prevent replay: calling the same signing function twice from the same address must revert.  
**Expected property (per contract):**
- `violationSignatures[id][signer]` → monotonically set; second call from same address reverts.
- `txSignatures[txId][msg.sender]` (Treasury) → same.
- `txSignatures[txId][msg.sender]` (SWF) → same.
- `councilSigns[assetId][msg.sender]` (AssetFreeze) → same.
- `usedCommitments[commitment]` (JurySelection) → same.  
**Difficulty:** Low — direct replay; each contract has independent per-address tracking.  
**Phase:** 1

---

### INV-15 — Provincial Revenue Formula Integrity

**Risk:** MEDIUM  
**Contracts:** `Provincial`  
**Why it matters:** `PROVINCIAL_SHARE = 300`, `NATIONAL_SHARE = 700` (sum = 1000). For any `distributeRevenue(id, amount)` call: `provincialShare = (amount × 300) / 1000` and `nationalShare = amount - provincialShare`. The invariant is that `provincialShare + nationalShare == amount` with no rounding loss.  
**Expected property:** For all revenue distribution calls: `p.provincialBalance` and `p.nationalContrib` deltas sum exactly to `amount`. No wei is created or destroyed.  
**Difficulty:** Low — arithmetic only; division before subtraction means rounding stays in `nationalShare`.  
**Phase:** 2

---

### INV-16 — VictimFund Balance Conservation

**Risk:** HIGH  
**Contracts:** `VictimFund`  
**Why it matters:** `totalBalance` must accurately reflect received minus paid. If `totalBalance` drifts from the true sum, victims may be over- or under-compensated. There is no on-chain ETH — balances are accounting values — so the invariant is purely mathematical.  
**Expected property:** At all times: `totalBalance + totalPaid == sum of all amount arguments passed to receiveFunds()`.  
**Difficulty:** Medium — requires tracking cumulative deposits in the harness.  
**Phase:** 2

---

### INV-17 — VictimFund Over-Compensation Prevention

**Risk:** HIGH  
**Contracts:** `VictimFund`  
**Why it matters:** `payCompensation` enforces `vr.paidAmount + amount <= vr.approvedAmount`. A fuzzer should verify that no sequence of partial payments causes `paidAmount` to exceed `approvedAmount`.  
**Expected property:** For any `victimId`, `victimRecords[victimId].paidAmount <= victimRecords[victimId].approvedAmount` at all times.  
**Difficulty:** Low — direct arithmetic; checked at function entry.  
**Phase:** 1

---

### INV-18 — CitizenCard Status Counter Integrity

**Risk:** MEDIUM  
**Contracts:** `CitizenCard`  
**Why it matters:** Four counters — `totalEmployed`, `totalUnemployed`, `totalRetired`, `totalDisabled` — track aggregate status. Status transitions decrement one counter and increment another. If any transition is not perfectly symmetric, counters drift and welfare eligibility calculations become incorrect.  
**Expected property:** At all times: `totalEmployed + totalUnemployed + totalRetired + totalDisabled == totalRegistered`.  
**Difficulty:** Medium — requires fuzzing multi-step employment transitions; disability is orthogonal to employment status (a disabled citizen can be Employed/Unemployed/Retired).  
**Phase:** 2  
**Note:** `totalDisabled` counts citizens where `isDisabled == true` regardless of employment status, so the strict equality above may not hold as stated. The harness must account for the independent disability counter. Confirmed invariant: `totalEmployed + totalUnemployed + totalRetired == totalRegistered - initialDisabledWhoAreNotCounted` — requires careful harness design.

---

### INV-19 — ConstitutionGuard Immutable Principle Lock

**Risk:** MEDIUM  
**Contracts:** `ConstitutionGuard`  
**Why it matters:** `IMMUTABLE_PRINCIPLES_MASK = 0x07` (bits 0, 1, 2 = principles 1, 2, 3). `approveLaw()` requires `(proposal.principlesMask & 0x07) == 0` — meaning a law cannot be approved if it claims to affect principles 1, 2, or 3 (secularism, rights, territorial integrity). A fuzzer should confirm no combination of principle masks can bypass this gate.  
**Expected property:** No law is ever added to `approvedLaws` mapping if its `principlesMask & 0x07 != 0`.  
**Difficulty:** Low — pure mask check; single-function property.  
**Phase:** 2

---

### INV-20 — SovereignCrawler Transfer Ordering

**Risk:** MEDIUM  
**Contracts:** `SovereignCrawler`  
**Why it matters:** `transferToSWF()` requires `status == Confirmed`. `confirmByCouncil()` requires `status == Frozen`. `freezeTarget()` requires `status == Identified || Tracking`. The status machine enforces ordering. A fuzzer should verify that no out-of-order transitions are possible regardless of call sequence or role combination.  
**Expected property:** `totalTransferredValue` only increases, and only when a target transitions from `Confirmed` to `Transferred`. A target in `Released` status can never reach `Transferred`.  
**Difficulty:** Medium — multi-step state machine with role requirements at each step.  
**Phase:** 2

---

## 4. Priority Matrix

| Priority | Invariant | Risk | Contracts | Phase |
|---|---|---|---|---|
| 1 | INV-01 — PAH Supply Cap | CRITICAL | PahlaviToken | 1 |
| 2 | INV-02 — Reserve Ratio Floor | CRITICAL | PahlaviToken | 1 |
| 3 | INV-03 — Trigger Authority | CRITICAL | TriggerProtocol | 1 |
| 4 | INV-04 — Multisig Threshold | CRITICAL | kernel.sol | 1 |
| 5 | INV-05 — Emergency Lock Monotonicity | HIGH | kernel.sol | 1 |
| 6 | INV-07 — Treasury Budget Cap | HIGH | Treasury | 1 |
| 7 | INV-08 — Treasury Block Permanence | HIGH | Treasury | 1 |
| 8 | INV-10 — SWF Withdrawal Multisig | HIGH | SovereignWealthFund | 1 |
| 9 | INV-12 — AssetFreeze Double-Transfer | HIGH | AssetFreeze | 1 |
| 10 | INV-13 — AssetFreeze Council Threshold | HIGH | AssetFreeze | 1 |
| 11 | INV-14 — Replay Resistance (all) | HIGH | Multiple | 1 |
| 12 | INV-17 — VictimFund Over-Compensation | HIGH | VictimFund | 1 |
| 13 | INV-06 — Oracle Non-Sovereignty | HIGH | API3Oracle, kernel | 2 |
| 14 | INV-09 — SWF Accounting Integrity | HIGH | SovereignWealthFund | 2 |
| 15 | INV-11 — AssetFreeze Status Monotonicity | HIGH | AssetFreeze | 2 |
| 16 | INV-16 — VictimFund Balance Conservation | HIGH | VictimFund | 2 |
| 17 | INV-15 — Provincial Formula | MEDIUM | Provincial | 2 |
| 18 | INV-18 — CitizenCard Counter Integrity | MEDIUM | CitizenCard | 2 |
| 19 | INV-19 — ConstitutionGuard Principle Lock | MEDIUM | ConstitutionGuard | 2 |
| 20 | INV-20 — Crawler Transfer Ordering | MEDIUM | SovereignCrawler | 2 |

---

## 5. Recommended Implementation Order

### Phase 1 — Monetary + Authority Core (12 invariants)

**Goal:** Cover the four CRITICAL invariants and all HIGH-risk single-contract properties. These require minimal harness complexity.

**Step 1 — Echidna infrastructure (prerequisite)**

Create `contracts/fuzzing/` directory. Write a base harness helper that grants roles from the constructor, does not inherit from production contracts, and exposes `echidna_*()` properties alongside public setup functions for the fuzzer to call.

Create `echidna.yaml`:
```yaml
testMode: "property"
corpusDir: "corpus"
coverage: true
codeSize: 0x10000
workers: 4
testLimit: 100000
```

**Step 2 — PahlaviToken harness (INV-01, INV-02)**

File: `contracts/fuzzing/FuzzPahlaviToken.sol`

```
setup: deploy PahlaviToken with SWF=self, kernel=self
expose: mint(), burn(), updateReserves() callable by fuzzer
properties:
  echidna_supply_cap: totalSupply() <= MAX_SUPPLY
  echidna_reserve_ratio: totalSupply() == 0 || (totalReserves*1000)/totalSupply() >= 333
```

**Step 3 — TriggerProtocol harness (INV-03)**

File: `contracts/fuzzing/FuzzTriggerProtocol.sol`

```
setup: deploy TriggerProtocol with kernel=self; deploy MockTreasury
expose: executeTrigger() from non-kernel callers (must revert)
property: echidna_trigger_caller_is_kernel (external call attempts should all revert)
```

**Step 4 — Kernel multisig + emergency lock harness (INV-04, INV-05)**

File: `contracts/fuzzing/FuzzKernel.sol`

```
setup: deploy IranOS_Kernel; grant roles to multiple fuzz actors
expose: flagViolation(), signViolation(), deactivateEmergencyLock()
properties:
  echidna_multisig_threshold: for any triggered violation, signaturesCount >= 7
  echidna_emergency_lock_only_court_clears: after lock activation, only COURT_ROLE clears
```

**Step 5 — Treasury harness (INV-07, INV-08, INV-14 subset)**

File: `contracts/fuzzing/FuzzTreasury.sol`

```
setup: deploy Treasury; assign PARLIAMENT, GOVERNMENT, AUDITOR roles
expose: createBudgetLine(), proposeTransaction(), signTransaction(), startNewFiscalYear()
properties:
  echidna_budget_cap: totalBudgetAllocated <= ANNUAL_BUDGET_CAP
  echidna_block_permanent: blockedByTrigger[addr] never returns to false
  echidna_no_replay_signatures: each txSignatures[id][addr] set at most once
```

**Step 6 — SWF + AssetFreeze + VictimFund (INV-10, INV-12, INV-13, INV-17)**

Files: `FuzzSovereignWealthFund.sol`, `FuzzAssetFreeze.sol`, `FuzzVictimFund.sol`

---

### Phase 2 — Cross-Contract + Stateful (8 invariants)

**Goal:** Multi-contract harnesses requiring connected deployments.

- **INV-06** — Oracle non-sovereignty: requires connected API3Oracle + Kernel deployment
- **INV-09** — SWF accounting: requires multi-layer tracking across deposit/withdraw/yield cycles
- **INV-11** — AssetFreeze status machine: full lifecycle fuzzing
- **INV-14** — Complete replay resistance across all five contracts
- **INV-15, INV-16, INV-18, INV-19, INV-20** — Protocol-level properties

---

## 6. Estimated Effort

| Task | Effort |
|---|---|
| Echidna binary install + echidna.yaml | 0.5 day |
| `contracts/fuzzing/` directory + base harness pattern | 0.5 day |
| Phase 1 harnesses (Steps 2–6, 12 invariants) | 5–7 days |
| Phase 1 corpus runs + triage | 3–5 days |
| Phase 2 harnesses (8 invariants, multi-contract) | 7–10 days |
| Phase 2 corpus runs + triage | 3–5 days |
| **Total Phase 1** | **~2 weeks** |
| **Total Phase 1 + 2** | **~4–5 weeks** |

These estimates assume one developer familiar with Solidity and Echidna. INV-02 (Reserve Ratio Floor) is the highest-risk finding candidate and should be run with a large `testLimit` (500,000+) to stress the reserve drift path.

---

## 7. Risks and Limitations

### 7.1 Known Harness Complexity Areas

**INV-02 (Reserve Ratio after updateReserves):** The `reserveCompliant` modifier only checks ratio at mint time. `updateReserves()` is callable by `KERNEL_ROLE` and has no lower-bound guard. A harness must grant the fuzzer both MINTER_ROLE and KERNEL_ROLE and allow arbitrary `updateReserves(x)` calls between mints. This is the invariant most likely to produce a real finding.

**INV-05 (Emergency Lock Clearing):** The lock deactivation path is `deactivateEmergencyLock() → onlyCourt`. However, OpenZeppelin `AccessControl.grantRole()` is callable by `DEFAULT_ADMIN_ROLE` (held by Sovereign). A sequence where the Sovereign grants COURT_ROLE to an arbitrary address, then that address clears the lock, is protocol-valid but doctrinally concerning. The harness must decide whether to treat this as a finding or a design note.

**INV-06 (Oracle Non-Sovereignty):** The oracle directly calls `Kernel.flagViolation()` which sets `emergencyLockActive = true` for TR-01/02/03. This is by design — the lock is immediate, but enforcement still requires 7 court signatures. The harness property must carefully distinguish "lock activation" (acceptable oracle consequence) from "trigger execution" (not acceptable oracle consequence).

**INV-18 (CitizenCard counters):** The `totalDisabled` counter is independent of employment status — a disabled citizen increments both their employment-status counter and `totalDisabled`. The harness invariant must model this correctly: `totalEmployed + totalUnemployed + totalRetired + (non-disabled registered) + totalDisabled == totalRegistered` is not the right formula. Careful analysis of the counter semantics is required before writing the harness.

### 7.2 Network Constraint

As established during the Slither integration, `binaries.soliditylang.org` is blocked in the current execution environment. Echidna's crytic-compile backend uses the same Hardhat compiler chain. The same `--hardhat-ignore-compile` workaround used for Slither applies: compile with `npm run compile` first, then point Echidna at the pre-compiled artifacts.

Echidna configuration:
```yaml
# Use pre-compiled artifacts, skip internal recompilation
crytic-args: ["--hardhat-ignore-compile"]
```

### 7.3 viaIR Compatibility

Hardhat is configured with `viaIR: true`. Echidna 2.x supports viaIR compilation. No issue expected, but if crytic-compile encounters an issue, temporarily disabling viaIR in a fuzzing-specific config (without touching production config) is an option.

### 7.4 Scope Limitations

- No formal verification. Echidna is bounded fuzzing, not exhaustive proof.
- Harness correctness depends on accurate role setup. A misconfigured harness produces false negatives.
- Cross-contract invariants (INV-06, INV-09) require careful ordering of external calls in harnesses. An incorrect harness may never reach the interesting state.
- Echidna does not fuzz cryptographic ZK proofs. INV in `JurySelection.submitVote` for zkProof validity is out of scope (zkProof is currently a non-zero-length bytes check only, documented as a future enhancement).

---

## 8. Preconditions

Before any Echidna harness can be written or run, the following must be in place:

### 8.1 Required (Blocking)

| # | Precondition | Status |
|---|---|---|
| P1 | Contracts compile successfully with `npm run compile` | **Met** (565 tests pass) |
| P2 | Slither baseline documented (baseline noise understood before adding fuzzing noise) | **Met** (SLITHER_BASELINE_AUDIT.md) |
| P3 | Remediation matrix complete (triage guidance available for interpreting findings) | **Met** (SLITHER_REMEDIATION_PRIORITY_MATRIX.md) |
| P4 | `contracts/fuzzing/` directory created with clear separation from production | Pending |
| P5 | Echidna binary installed (`echidna` ≥ 2.2.0) | Pending |
| P6 | `echidna.yaml` configuration file at repo root | Pending |

### 8.2 Required (For Cross-Contract Harnesses — Phase 2 Only)

| # | Precondition |
|---|---|
| P7 | Mock contracts for all external dependencies (MockTreasury, MockSWF, MockKernel) defined in `contracts/fuzzing/mocks/` |
| P8 | Harness deployment patterns for connected deployments (Kernel → TriggerProtocol → Treasury) documented |

### 8.3 Recommended (Not Blocking)

| # | Recommendation |
|---|---|
| R1 | Corpus persistence directory (`corpus/`) added to `.gitignore` — corpus files are large and environment-specific |
| R2 | CI workflow for Echidna added only after Phase 1 harnesses are stable (prevents flaky CI from short corpus runs) |
| R3 | Echidna pinned to a specific version in CI (same rationale as Slither pin) |
| R4 | INV-02 run with extended `testLimit: 500000` before any Phase 1 completion claim, due to the high-risk reserve drift scenario |

---

## Recommended First Invariant

**INV-01 — PAH Supply Cap** (`PahlaviToken`, `echidna_supply_cap`)

**Rationale:**
- Single contract, no cross-contract dependencies
- Single view function check (`totalSupply() <= MAX_SUPPLY`)
- Easiest harness to write correctly
- Directly corresponds to TR-06 (constitutional red line)
- Validates the Echidna toolchain integration before tackling more complex properties
- If the toolchain fails, this is the cheapest place to diagnose it

After INV-01 validates the toolchain, proceed immediately to INV-02 (Reserve Ratio Floor) — the same harness requires minimal additions and INV-02 is the highest-probability real finding.

---

*This assessment is analysis only. No production code, test code, or doctrine was modified. The findings in this document represent planned future work, not completed security remediation.*
