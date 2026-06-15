# INV-10 — SWF Withdrawal Multisig Gate: Complete Authority Audit
## IranOS Step 12 Security Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis + Test Evidence — No Production Code Changes
**Scope:** `contracts/monetary/SovereignWealthFund.sol`

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - INV-01 (PAH Supply Cap) and INV-02 (Reserve Ratio Floor) remain unaudited and are **not closed** by this work.
> - No production contracts, existing tests, CI configuration, deployment scripts, or doctrine were modified.

---

## Table of Contents

1. [Invariant Definition](#1-invariant-definition)
2. [Doctrine Statement](#2-doctrine-statement)
3. [Contract Overview](#3-contract-overview)
4. [Authority Analysis](#4-authority-analysis)
5. [Multisig Enforcement — Code-Level Proof](#5-multisig-enforcement--code-level-proof)
6. [Replay Protection Analysis](#6-replay-protection-analysis)
7. [Threat Model and Bypass Scenarios](#7-threat-model-and-bypass-scenarios)
8. [Tested Properties](#8-tested-properties)
9. [Files Changed](#9-files-changed)
10. [Test Commands and Results](#10-test-commands-and-results)
11. [Risk Classification](#11-risk-classification)
12. [Findings Summary](#12-findings-summary)
13. [Conclusion](#13-conclusion)

---

## 1. Invariant Definition

**ID:** INV-10
**Contract:** `SovereignWealthFund` (`contracts/monetary/SovereignWealthFund.sol`)
**Category:** Multisig Threshold Enforcement / Withdrawal Gate

### Invariant Statement

For all states of `SovereignWealthFund` after deployment:

1. **Threshold gate:** A withdrawal transaction cannot execute until `signaturesCount >= MULTISIG_REQUIRED` (3).
2. **Distinctness:** A single address cannot contribute more than one signature per transaction (preventing one actor from accumulating the threshold).
3. **Role gate:** Only addresses holding `COUNCIL_ROLE` can contribute signatures; no other role or EOA can increment `signaturesCount`.
4. **Execution finality:** Once a withdrawal is executed (`executed = true`), no further call to `signWithdrawal()` can re-execute or modify the withdrawal.
5. **State neutrality on failure:** Any signing attempt that reverts leaves `signaturesCount`, `executed`, and all layer balances unchanged.
6. **Parallel isolation:** Signing one transaction does not affect the signature state or execution status of any other transaction.

### Constitutional Significance

`MULTISIG_REQUIRED = 3` is the constitutional minimum for SWF council withdrawals. The SWF holds national wealth across three layers (L1: $300B liquid, L2: $300B productive, L3: $2T strategic). Unauthorized or below-threshold execution of a withdrawal could drain national reserves without adequate governance consensus, violating the fundamental constitutional property that sovereign wealth is protected by multi-institutional oversight.

---

## 2. Doctrine Statement

Per IranOS doctrine (فرگرد ۵ — صندوق ثروت ملی), SWF withdrawals require:

> Multi-signature council approval at a constitutional minimum of 3 distinct authorized council members. No single council member, the Sovereign, the Kernel, or any external actor may unilaterally authorize a withdrawal from national reserves.

The 3-of-N council requirement is a constitutional floor, not a policy parameter. The `MULTISIG_REQUIRED = 3` constant reflects this.

---

## 3. Contract Overview

### 3.1 Roles

```solidity
bytes32 public constant SOVEREIGN_ROLE = keccak256("SOVEREIGN_ROLE");
bytes32 public constant COUNCIL_ROLE   = keccak256("COUNCIL_ROLE");
bytes32 public constant KERNEL_ROLE    = keccak256("KERNEL_ROLE");
bytes32 public constant RECLAIM_ROLE   = keccak256("RECLAIM_ROLE");
```

**Role administration:** `DEFAULT_ADMIN_ROLE` is held by `_sovereign` (passed at construction). The Sovereign can grant/revoke `COUNCIL_ROLE` to/from any address.

### 3.2 Multisig-Relevant Storage

```solidity
uint256 public constant MULTISIG_REQUIRED = 3;

struct Transaction {
    address initiator;
    uint8   layer;
    uint256 amount;
    string  purpose;
    uint256 timestamp;
    uint8   signaturesCount;
    bool    executed;
}

mapping(uint256 => Transaction)              public transactions;
mapping(uint256 => mapping(address => bool)) public txSignatures;
uint256 public txCount;
```

### 3.3 Withdrawal Functions

```solidity
// Creates a new withdrawal proposal; initiator counts as first signer (signaturesCount = 1)
function proposeWithdrawal(uint8 layer, uint256 amount, string calldata purpose)
    external onlyRole(COUNCIL_ROLE) nonReentrant returns (uint256 txId)

// Adds a signature; executes withdrawal if signaturesCount >= MULTISIG_REQUIRED after increment
function signWithdrawal(uint256 txId)
    external onlyRole(COUNCIL_ROLE) nonReentrant
```

---

## 4. Authority Analysis

### 4.1 Who Can Propose Withdrawals?

Only `COUNCIL_ROLE` holders. The `onlyRole(COUNCIL_ROLE)` modifier on `proposeWithdrawal()` enforces this. The `proposeWithdrawal()` function sets `signaturesCount = 1` (initiator counted) and records `txSignatures[txId][msg.sender] = true`.

### 4.2 Who Can Sign Withdrawals?

Only `COUNCIL_ROLE` holders. The `onlyRole(COUNCIL_ROLE)` modifier on `signWithdrawal()` enforces this. No other role — including `SOVEREIGN_ROLE`, `KERNEL_ROLE`, `RECLAIM_ROLE`, or `DEFAULT_ADMIN_ROLE` — can call `signWithdrawal()` without `COUNCIL_ROLE`.

**Verified by tests (Check 6):**
- `stranger` (no roles): reverts
- `kernel` (KERNEL_ROLE only): reverts
- `sovereign` (SOVEREIGN_ROLE + DEFAULT_ADMIN_ROLE, no COUNCIL_ROLE): reverts

### 4.3 Role Administration — Can the Sovereign Bypass the Gate?

The Sovereign holds `DEFAULT_ADMIN_ROLE` and can call `grantRole(COUNCIL_ROLE, sovereign.address)` to grant themselves `COUNCIL_ROLE`. After doing so, the Sovereign can:
- Propose withdrawals
- Sign withdrawals

However, even with self-granted `COUNCIL_ROLE`, the Sovereign is still only one signer. They cannot exceed the distinctness guard (`txSignatures[txId][sovereign] = true` after first sign → `require(!txSignatures[txId][msg.sender])` blocks a second sign). The mathematical threshold of 3 distinct authorized signers cannot be bypassed by a single actor regardless of how many roles they hold.

**Assessment:** Governance trust gap (same root cause as INV-04, INV-07) — the Sovereign can populate `COUNCIL_ROLE` with controlled addresses to constitute a "controlled council." This is a governance-layer assumption (council independence), not a code-level bypass of the 3-distinct-signer requirement. The code enforces 3 distinct addresses; the constitution enforces their independence.

---

## 5. Multisig Enforcement — Code-Level Proof

### 5.1 The Gate in `signWithdrawal()`

```solidity
function signWithdrawal(uint256 txId) external onlyRole(COUNCIL_ROLE) nonReentrant {
    Transaction storage tx_ = transactions[txId];
    require(tx_.timestamp > 0, "SWF: tx not found");     // Guard 1: tx must exist
    require(!tx_.executed, "SWF: already executed");      // Guard 2: not already executed
    require(!txSignatures[txId][msg.sender], "SWF: already signed"); // Guard 3: distinctness
    txSignatures[txId][msg.sender] = true;
    tx_.signaturesCount++;
    emit WithdrawalSigned(txId, msg.sender, tx_.signaturesCount);
    if (tx_.signaturesCount >= MULTISIG_REQUIRED) {      // Threshold check
        tx_.executed = true;
        // ... layer balance mutation ...
        emit WithdrawalExecuted(txId, tx_.layer, tx_.amount);
    }
}
```

### 5.2 Signature Counting Flow

```
proposeWithdrawal() → signaturesCount = 1, txSignatures[id][initiator] = true
signWithdrawal() #1 → signaturesCount = 2, txSignatures[id][signer1] = true
signWithdrawal() #2 → signaturesCount = 3, threshold met → executed = true, balance mutated
```

The threshold check `tx_.signaturesCount >= MULTISIG_REQUIRED` executes AFTER the increment, ensuring:
- At signaturesCount = 2 (after sign #1): `2 >= 3` → false → no execution
- At signaturesCount = 3 (after sign #2): `3 >= 3` → true → execution

### 5.3 Distinctness Enforcement

```solidity
require(!txSignatures[txId][msg.sender], "SWF: already signed");
```

This guard fires before the counter increment. A duplicate call by the same address reverts with "SWF: already signed" — the counter is not touched.

**Combined with the proposer pre-registration (`txSignatures[txId][msg.sender] = true` in `proposeWithdrawal()`):** The proposer's signature is recorded at proposal time. If the proposer calls `signWithdrawal()`, the guard fires immediately.

### 5.4 Non-Existent Transaction Protection

```solidity
require(tx_.timestamp > 0, "SWF: tx not found");
```

`Solidity` initializes `uint256` storage to 0. A non-existent `txId` has `timestamp = 0`, so this guard rejects any signing attempt against an unmapped txId.

### 5.5 Post-Execution Protection

```solidity
require(!tx_.executed, "SWF: already executed");
```

Once `tx_.executed = true`, no further call to `signWithdrawal()` can proceed. The balance mutation path is unreachable for an already-executed transaction.

---

## 6. Replay Protection Analysis

### 6.1 Per-Address Per-Transaction Deduplication

`txSignatures` is a 2D mapping: `mapping(uint256 => mapping(address => bool))`. Each entry is keyed by `(txId, signerAddress)`. Once set to `true`, it can never return to `false` (no clear function exists). The `require(!txSignatures[txId][msg.sender])` guard ensures the same address cannot contribute twice to the same txId.

### 6.2 Post-Execution Idempotency

`require(!tx_.executed)` prevents any call — including by new council members or the fourth signer — from triggering a second execution. The execution path is gated behind a one-way ratchet (`executed: false → true`).

### 6.3 Cross-Transaction Non-Interference

Each transaction has its own txId (from monotonically increasing `txCount`). `txSignatures[txId1][signer]` and `txSignatures[txId2][signer]` are independent entries. Signing txId1 does not affect txId2's signature state. A council member can sign both txId1 and txId2 independently — this is not a replay.

---

## 7. Threat Model and Bypass Scenarios

### Scenario 1: Single Council Member Proposes and Self-Signs to Threshold

**Attempt:** council1 calls `proposeWithdrawal()` (sigCount=1), then calls `signWithdrawal()` twice.

**Result:**
- `proposeWithdrawal()` sets `txSignatures[id][council1] = true`
- First `signWithdrawal()` call: `require(!txSignatures[id][council1])` → REVERTS
- Second call: same outcome

**Classification: PROVEN SAFE — single actor cannot self-accumulate**

### Scenario 2: Two Council Members Try to Reach Threshold via Double-Signing

**Attempt:** council1 proposes (sigCount=1), council2 signs (sigCount=2), council1 signs again.

**Result:**
- council1's second call: `txSignatures[id][council1]` is already true → REVERTS
- signaturesCount stays at 2 → below threshold → not executed

**Classification: PROVEN SAFE — two signers cannot reach threshold of 3**

### Scenario 3: Non-Council Addresses Contribute Signatures

**Attempt:** `stranger`, `kernel`, or `sovereign` (without COUNCIL_ROLE) call `signWithdrawal()`.

**Result:** All revert due to `onlyRole(COUNCIL_ROLE)` check. `signaturesCount` unchanged.

**Classification: PROVEN SAFE — role gate blocks all non-council signers**

### Scenario 4: Replay After Execution

**Attempt:** After signaturesCount reaches 3 and withdrawal executes, council4 (unused in original signing) calls `signWithdrawal()`.

**Result:** `require(!tx_.executed)` → REVERTS with "SWF: already executed". Layer balance unchanged.

**Classification: PROVEN SAFE — executed flag is a one-way ratchet**

### Scenario 5: Overflow of signaturesCount to Wrap Around

**Attempt:** Overflow `uint8 signaturesCount` past 255 to wrap back to a small value.

**Result:** Solidity 0.8.x applies checked arithmetic. An increment past 255 would revert. However, `signaturesCount` starts at 1 and MULTISIG_REQUIRED=3; in any realistic scenario the counter reaches 3 long before approaching overflow territory. Even with an unlimited number of council members, overflow requires 254 additional valid distinct signatures before any single signer count approach overflows.

**Classification: PROVEN SAFE — checked arithmetic; overflow requires 254 unique council signers**

### Scenario 6: Sovereign Grants COUNCIL_ROLE to 3 Controlled Addresses

**Attempt:** Sovereign grants COUNCIL_ROLE to three addresses they control. All three form a "controlled council" and approve a withdrawal.

**Result:** The mathematical threshold is still reached by 3 distinct authorized addresses. The code-level invariant holds. The constitutional-level concern is that council members should be independent institutions, not Sovereign-controlled addresses. This is a governance trust gap (same root cause as INV-04).

**Does this bypass INV-10?** NO — the code enforces 3 distinct addresses with COUNCIL_ROLE; it cannot enforce their constitutional independence.

**Classification: ASSUMPTION — governance trust gap; code-level threshold enforced**

### Scenario 7: Signing txId=1 Affects txId=2

**Attempt:** Sign txId=1 in hopes that txSignatures storage layout causes cross-contamination into txId=2.

**Result:** `txSignatures` is a nested mapping: `mapping(uint256 => mapping(address => bool))`. Each txId key maps to an independent inner mapping. No storage collision occurs in Solidity's keccak-based mapping layout.

**Classification: PROVEN SAFE — isolated per-txId storage; confirmed by parallel transaction tests**

---

## 8. Tested Properties

All 8 required invariant checks are covered by new tests in `test/27_INV10_SWF_Multisig_Gate.test.js`.

| Check | Requirement | Test Coverage |
|-------|-------------|---------------|
| 1 | Withdrawal with 0 approvals (non-existent txId) must not execute | `signWithdrawal on non-existent txId reverts with tx-not-found`, `state-neutral` |
| 2 | After proposal (signaturesCount=1): not executed | `immediately after propose: signaturesCount=1 and executed=false`, `L1 balance unchanged`, `totalAssets unchanged` |
| 3 | After proposal+1sign (signaturesCount=2): not executed | `after propose + 1 sign: signaturesCount=2 and executed=false`, `L1 balance unchanged`, `totalAssets unchanged`, event check |
| 4 | Executes only after 3 distinct approvals | L1/L2/L3 execution tests, txSignatures all-true check, event check |
| 5 | Same signer cannot double-contribute | `proposer cannot signWithdrawal`, `council2 signing twice reverts`, `signaturesCount unchanged on double-sign`, `balance neutral on double-sign`, `two-council collusion test` |
| 6 | Non-council cannot contribute | stranger/kernel/sovereign sign reverts; counter unchanged; three non-council attempt test |
| 7 | Failed attempts are state-neutral | sigCount=1 state-neutral, sigCount=2 state-neutral, non-council sign neutral, double-sign neutral, txSignatures unchanged |
| 8 | No replay after execution | replay reverts `already-executed`, replay accounting neutral, `executed` ratchet proof, original initiator replay |

**Additional tests beyond required checks:**
- L2 and L3 withdrawal execution (check 4 extended)
- `txSignatures` all-true state after execution
- Event sequencing (WithdrawalSigned only at sigCount=2; both events at sigCount=3)
- Parallel transaction isolation (5 tests)
- `MULTISIG_REQUIRED` immutability confirmation
- 4-signer scenario (execution at 3, replay reverts at 4)

**Total new tests: 41**

---

## 9. Files Changed

| File | Type | Change |
|------|------|--------|
| `test/27_INV10_SWF_Multisig_Gate.test.js` | NEW | 41 invariant tests for INV-10 |
| `docs/reports/INV10_SWF_WITHDRAWAL_MULTISIG_GATE_AUDIT.md` | NEW | This audit report |
| `contracts/monetary/SovereignWealthFund.sol` | UNCHANGED | No production code modified |
| All other contracts, tests, configs, workflows | UNCHANGED | No modifications |

---

## 10. Test Commands and Results

### Command

```bash
npx hardhat test test/27_INV10_SWF_Multisig_Gate.test.js --no-compile
```

### INV-10 Test Results

```
INV-10: SWF Withdrawal Multisig Gate
  Check 1: Zero approvals — non-existent txId cannot be signed
    ✔ signWithdrawal on non-existent txId reverts with tx-not-found
    ✔ signWithdrawal on non-existent txId is state-neutral (no balance mutation)
    ✔ proposeWithdrawal creates tx with timestamp > 0 (required by guard)
  Check 2: 1 approval (proposal only, signaturesCount=1) does not execute
    ✔ immediately after propose: signaturesCount=1 and executed=false
    ✔ after propose: L1 balance unchanged
    ✔ after propose: totalAssets unchanged
  Check 3: 2 approvals (signaturesCount=2) does not execute
    ✔ after propose + 1 sign: signaturesCount=2 and executed=false
    ✔ after propose + 1 sign: L1 balance unchanged
    ✔ after propose + 1 sign: totalAssets unchanged
    ✔ second signer emits WithdrawalSigned with sigCount=2 (not WithdrawalExecuted)
  Check 4: 3 distinct approvals (signaturesCount=3) executes withdrawal
    ✔ L1 withdrawal executes at exactly signaturesCount=3
    ✔ L2 withdrawal executes at exactly signaturesCount=3
    ✔ L3 withdrawal executes at exactly signaturesCount=3
    ✔ txSignatures[1][council1..3] all true after execution
    ✔ third signer emits both WithdrawalSigned and WithdrawalExecuted
  Check 5: Same signer cannot sign the same withdrawal twice
    ✔ proposer (council1) cannot also call signWithdrawal
    ✔ council2 signing twice reverts on second attempt
    ✔ double-sign attempt does not increment signaturesCount
    ✔ double-sign attempt does not mutate L1 balance
    ✔ two councils cannot collude to reach threshold via double-sign (3 calls, 2 signers)
  Check 6: Non-council addresses cannot contribute to signing threshold
    ✔ stranger signWithdrawal reverts
    ✔ stranger signWithdrawal does not increment signaturesCount
    ✔ kernel (not council) signWithdrawal reverts
    ✔ sovereign (DEFAULT_ADMIN but not council) signWithdrawal reverts
    ✔ three non-council signatures cannot push signaturesCount to threshold
  Check 7: Below-threshold and failed attempts are state-neutral
    ✔ at signaturesCount=1 (after propose): all layer balances unchanged
    ✔ at signaturesCount=2 (after propose+sign): all layer balances unchanged
    ✔ failed non-council sign attempt is state-neutral
    ✔ failed double-sign attempt is state-neutral
    ✔ txSignatures mapping unchanged after failed sign attempt
  Check 8: Once executed, withdrawal cannot be replayed
    ✔ signWithdrawal on executed txId reverts with already-executed
    ✔ replay attempt does not mutate L1 balance or accounting
    ✔ executed flag is a one-way ratchet — cannot be cleared
    ✔ original initiator attempting to re-sign after execution reverts
  Parallel transaction isolation
    ✔ two concurrent proposals use distinct txIds
    ✔ signing txId=1 does not affect txId=2 signaturesCount
    ✔ txSignatures are isolated per txId — signing tx1 does not set sig on tx2
    ✔ council3 can sign both tx1 and tx2 independently (not replay)
  MULTISIG_REQUIRED constant
    ✔ MULTISIG_REQUIRED is exactly 3
    ✔ threshold is not reachable with fewer than 3 unique council signers
    ✔ 4 distinct council signers — execution still happens at threshold 3

  41 passing (5s)
```

### Full Suite

```bash
npm test
```

```
606 passing (21s)
```

**No regressions. 606 tests pass (565 prior + 41 new).**

---

## 11. Risk Classification

| Finding | Severity | Status |
|---------|----------|--------|
| Below-threshold withdrawal execution | NONE | PROVEN SAFE — `require(signaturesCount >= MULTISIG_REQUIRED)` gated by counter increment |
| Double-signing by same signer | NONE | PROVEN SAFE — `require(!txSignatures[txId][msg.sender])` guard before increment |
| Non-council signer contributing | NONE | PROVEN SAFE — `onlyRole(COUNCIL_ROLE)` modifier |
| Post-execution replay | NONE | PROVEN SAFE — `require(!tx_.executed)` one-way ratchet |
| Cross-transaction interference | NONE | PROVEN SAFE — per-txId isolated nested mapping |
| `uint8 signaturesCount` overflow | NONE | PROVEN SAFE — Solidity 0.8.x checked arithmetic; overflow requires 254+ unique signers |
| Non-existent txId signing | NONE | PROVEN SAFE — `require(tx_.timestamp > 0)` guard |
| Governance trust gap (controlled council) | MEDIUM | ASSUMPTION — same root cause as INV-04; code-level threshold enforced |

### Overall Rating: **LOW**

INV-10 holds with high confidence. The threshold gate, distinctness guard, role gate, execution ratchet, and state-neutrality on failure are all enforced at the code level and confirmed by 41 passing tests.

---

## 12. Findings Summary

### F1: MULTISIG_REQUIRED = 3 Is Immutable — PROVEN SAFE

`uint256 public constant MULTISIG_REQUIRED = 3` is a Solidity constant stored in bytecode. No function can modify it.

### F2: Threshold Gate Is Enforced Before Balance Mutation — PROVEN SAFE

The execution path inside `signWithdrawal()` is gated by `if (tx_.signaturesCount >= MULTISIG_REQUIRED)` after the increment. Layer balance changes occur only when `signaturesCount >= 3`. At signaturesCount = 1 or 2, no balance mutation occurs.

### F3: Distinctness Guard Is Enforced at Call Entry — PROVEN SAFE

`require(!txSignatures[txId][msg.sender])` fires before `tx_.signaturesCount++`. A duplicate call reverts with the counter unchanged. The proposer's initial registration in `proposeWithdrawal()` ensures they cannot sign again via `signWithdrawal()`.

### F4: Role Gate Blocks All Non-Council Addresses — PROVEN SAFE

`onlyRole(COUNCIL_ROLE)` on both `proposeWithdrawal()` and `signWithdrawal()` blocks `SOVEREIGN_ROLE`, `KERNEL_ROLE`, `RECLAIM_ROLE`, and any unroled address from contributing. Confirmed by tests for stranger, kernel, and sovereign.

### F5: Executed Flag Is a One-Way Ratchet — PROVEN SAFE

`tx_.executed = true` is set when the threshold is reached. `require(!tx_.executed)` at the entry of `signWithdrawal()` ensures no subsequent call can re-execute the withdrawal or modify the balance again. Confirmed by replay tests.

### F6: State Neutrality on All Failure Paths — PROVEN SAFE

All three revert paths (`tx not found`, `already executed`, `already signed`, `not COUNCIL_ROLE`) leave `signaturesCount`, `executed`, and all layer balances unchanged. Confirmed by 5 dedicated state-neutrality tests.

### F7: Parallel Transaction Isolation — PROVEN SAFE

Signing one transaction's `txSignatures[txId1][addr]` has no effect on `txSignatures[txId2][addr]`. Distinct txIds occupy independent storage slots in the nested mapping. Confirmed by 4 parallel isolation tests.

### F8: Governance Trust Gap — ASSUMPTION

The Sovereign (DEFAULT_ADMIN_ROLE) can grant `COUNCIL_ROLE` to controlled addresses. Three controlled council members can constitutionally approve a withdrawal. The code enforces 3 distinct authorized addresses; it cannot enforce their institutional independence from the Sovereign. Same root cause as INV-04, INV-07, INV-08.

---

## 13. Conclusion

### INV-10 Holds: **YES — ENFORCED BY ARCHITECTURE AND VERIFIED BY TEST**

The SWF withdrawal multisig gate invariant holds with high confidence across all 8 required property checks and all additional edge cases tested.

### Evidence Summary

| Question | Answer |
|----------|--------|
| Can a withdrawal execute below signaturesCount=3? | **NO** — threshold check at line 109 gated by `>=` |
| Can one signer accumulate to threshold? | **NO** — distinctness guard + proposer pre-registration |
| Can a non-council address contribute signatures? | **NO** — `onlyRole(COUNCIL_ROLE)` modifier |
| Can an executed withdrawal be replayed? | **NO** — `require(!tx_.executed)` one-way ratchet |
| Are failed signing attempts state-neutral? | **YES** — all revert paths confirmed neutral by tests |
| Can parallel transactions interfere with each other? | **NO** — per-txId isolated nested mapping |
| Is `MULTISIG_REQUIRED` mutable? | **NO** — declared `public constant` in bytecode |
| Is `signaturesCount` protected from overflow bypass? | **YES** — Solidity 0.8.x checked arithmetic |

### Outstanding Items

- **INV-01 (PAH Supply Cap, CRITICAL):** No audit report. Unaudited.
- **INV-02 (Reserve Ratio Floor, CRITICAL):** No audit report. Unaudited. Echidna assessment notes a known gap: `updateReserves()` accepts any value with no post-update ratio check; CRITICAL-priority finding candidate.
- **F8 (Governance Trust Gap):** Same root cause as INV-04. Governance-layer hardening recommendations from INV-04 §11 apply equally here.

### Next: INV-12

After INV-10, the natural next Phase-1 audit target is **INV-12 — AssetFreeze Double-Transfer Prevention** (`contracts/reclaim/AssetFreeze.sol`, Phase 1, HIGH risk): verifying that `transferToSWF()` can be called at most once per frozen asset and cannot double-decrement `totalFrozenValue`.

---

*This document is analysis only. No production code, CI configuration, deployment scripts, or doctrine was modified. No production readiness, external audit completion, formal verification completion, or Step 12 blocker closure is claimed. INV-01 and INV-02 remain unaudited.*
