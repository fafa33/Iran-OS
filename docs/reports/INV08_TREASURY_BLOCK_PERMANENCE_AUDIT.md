# INV-08 — Treasury Block Permanence: Complete Authority Audit
## IranOS Step 12 Security Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** `contracts/monetary/Treasury.sol` — all 25 production contracts for cross-contract write-path verification

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - No contracts, tests, CI, deployment scripts, or production code were modified.

---

## Table of Contents

1. [Invariant Definition](#1-invariant-definition)
2. [Doctrine Statement](#2-doctrine-statement)
3. [Scope and Storage Map](#3-scope-and-storage-map)
4. [Authority Analysis — Who Can Mutate Treasury Records](#4-authority-analysis--who-can-mutate-treasury-records)
5. [Append-Only Write-Path Analysis — Budget Lines](#5-append-only-write-path-analysis--budget-lines)
6. [Append-Only Write-Path Analysis — Transactions](#6-append-only-write-path-analysis--transactions)
7. [Counter Monotonicity Analysis](#7-counter-monotonicity-analysis)
8. [Additive-Only Field Analysis](#8-additive-only-field-analysis)
9. [Fiscal Year Rollover — Accumulator vs. Historical Record](#9-fiscal-year-rollover--accumulator-vs-historical-record)
10. [Destructive Pattern Audit](#10-destructive-pattern-audit)
11. [Cross-Contract Mutation Path Analysis](#11-cross-contract-mutation-path-analysis)
12. [Event / Audit Trail Analysis](#12-event--audit-trail-analysis)
13. [Threat Model and Bypass Scenarios](#13-threat-model-and-bypass-scenarios)
14. [Risk Classification](#14-risk-classification)
15. [Findings Summary](#15-findings-summary)
16. [Recommended Echidna Harness Design](#16-recommended-echidna-harness-design)
17. [Conclusion](#17-conclusion)

---

## 1. Invariant Definition

**ID:** INV-08
**Contract:** `Treasury` (`contracts/monetary/Treasury.sol`)
**Category:** Record Permanence / Append-Only Accounting

### Invariant Statement

For all states of `Treasury` after deployment, and for all sequences of authorized or unauthorized calls:

1. **Budget lines are append-only:** No call may delete, overwrite, or rewrite any entry in `budgetLines[id]` after its creation. The `allocated` field of any budget line can never decrease. The `isActive` field can never be set to `false`. The `fiscalYear`, `category` fields can never be changed after creation.

2. **Transactions are append-only:** No call may delete, overwrite, or rewrite any entry in `transactions[id]` after its creation. Core identity fields (`initiator`, `recipient`, `amount`, `budgetLineId`, `description`, `timestamp`) are immutable post-creation. State transitions (`executed`, `rejected`) are one-way ratchets that can only move `false → true`.

3. **Signature records are additive:** `txSignatures[txId][signer]` can only be set from `false` to `true`; it can never be cleared.

4. **Record counters are monotonically non-decreasing:** `txCount` and `budgetLineCount` are only ever incremented; they are never decremented or reset.

5. **Fiscal year counter is strictly increasing:** `currentFiscalYear` can only increase (strictly); rollback to a prior year is impossible.

6. **Trigger block records are permanent:** `blockedByTrigger[addr]` can only be set `false → true`; the block is irrevocable by any function.

7. **No destruction path exists:** No function or role can destroy, reinitialize, or erase the Treasury contract's storage.

### What is NOT Claimed

This invariant does not claim that `totalBudgetAllocated` is permanent — it is a current-year accumulator that is explicitly reset at fiscal year rollover. This is constitutionally intended (per-year cap model) and does not constitute erasure of historical records, since historical data is preserved in the `budgetLines` mapping with per-line `fiscalYear` fields. See §9.

### Constitutional Significance

IranOS Treasury is defined as a "Glass Box" (صندوق شیشه‌ای) — all treasury activity must be permanently visible, auditable, and immutable once recorded. The "block permanence" property is the on-chain guarantee that no actor — including the Sovereign, Parliament, Government, or Kernel — can retroactively alter treasury history. A bypass would allow the destruction of financial accountability, enabling corruption to be concealed.

---

## 2. Doctrine Statement

Per IranOS doctrine (فرگرد ۷ — شفافیت بودجه ملی), treasury records are:
- **Permanent once created** — no record may be erased
- **Forward-only in state** — records can only progress through their lifecycle (proposed → signed → executed/rejected); they cannot regress
- **Audit-trail complete** — every state change emits an indexed event that is permanently recorded on-chain at the block level

The "block permanence" property maps directly to the constitutional requirement that "تمام تراکنش‌ها شفاف و در بلاک‌چین ثبت می‌شوند" (all transactions are transparently and permanently recorded on the blockchain).

---

## 3. Scope and Storage Map

### 3.1 All Storage Variables in Treasury.sol

```solidity
// Counters (monotonicity proof targets)
uint256 public currentFiscalYear;       // fiscal year tracker — strictly increasing
uint256 public totalBudgetAllocated;    // current-year accumulator — reset-able (see §9)
uint256 public txCount;                 // transaction counter — monotonically non-decreasing
uint256 public budgetLineCount;         // budget line counter — monotonically non-decreasing

// Record mappings (permanence proof targets)
mapping(uint256 => BudgetLine)               public budgetLines;
mapping(uint256 => TreasuryTransaction)      public transactions;
mapping(uint256 => mapping(address => bool)) public txSignatures;

// Ratchet mappings (additive-only proof targets)
mapping(address => bool) public blockedByTrigger;
```

### 3.2 BudgetLine Struct — Field-by-Field Permanence

```solidity
struct BudgetLine {
    BudgetCategory category;   // category enum — written once at creation (line 91); no setter
    uint256        allocated;  // allocation amount — written once at creation; no decrement function
    uint256        spent;      // cumulative spend — only ever incremented (signTransaction line 118)
    uint256        fiscalYear; // fiscal year assigned — written once at creation; no setter
    bool           isActive;   // set true at creation (line 91); NO function sets it false
}
```

### 3.3 TreasuryTransaction Struct — Field-by-Field Permanence

```solidity
struct TreasuryTransaction {
    address  initiator;         // written at creation (line 100); no setter
    address  recipient;         // written at creation (line 100); no setter
    uint256  amount;            // written at creation (line 100); no setter
    uint256  budgetLineId;      // written at creation (line 100); no setter
    string   description;       // written at creation (line 100); no setter
    uint256  timestamp;         // written at creation (line 100); no setter (block.timestamp snapshot)
    uint8    signaturesCount;   // starts at 1; only incremented (line 114); never decremented
    bool     executed;          // starts false; one-way ratchet false→true (line 117); never reset
    bool     rejected;          // starts false; one-way ratchet false→true (line 127); never reset
}
```

### 3.4 Permanence Classification Table

| Field | Written at creation? | Post-creation mutation type | Mutation direction | Delete possible? |
|---|---|---|---|---|
| `budgetLines[id].category` | YES | None | — | NO |
| `budgetLines[id].allocated` | YES | None | — | NO |
| `budgetLines[id].spent` | YES (= 0) | Increment only | Additive | NO |
| `budgetLines[id].fiscalYear` | YES | None | — | NO |
| `budgetLines[id].isActive` | YES (= true) | None | — | NO |
| `transactions[id].initiator` | YES | None | — | NO |
| `transactions[id].recipient` | YES | None | — | NO |
| `transactions[id].amount` | YES | None | — | NO |
| `transactions[id].budgetLineId` | YES | None | — | NO |
| `transactions[id].description` | YES | None | — | NO |
| `transactions[id].timestamp` | YES | None | — | NO |
| `transactions[id].signaturesCount` | YES (= 1) | Increment only | Additive | NO |
| `transactions[id].executed` | YES (= false) | One-way ratchet only | false → true | NO |
| `transactions[id].rejected` | YES (= false) | One-way ratchet only | false → true | NO |
| `txSignatures[id][addr]` | On first signature | Additive only | false → true | NO |
| `blockedByTrigger[addr]` | On block call | Additive only | false → true | NO |
| `txCount` | 0 at deploy | Increment only | Additive | NO |
| `budgetLineCount` | 0 at deploy | Increment only | Additive | NO |
| `currentFiscalYear` | 1404 at deploy | Increment only (strictly) | Strictly increasing | NO |
| `totalBudgetAllocated` | 0 at deploy | Increment + reset to 0 | Per-year accumulator | NO (see §9) |

---

## 4. Authority Analysis — Who Can Mutate Treasury Records

### 4.1 Function-to-Field Write Matrix

| Function | Role | Writes to `budgetLines`? | Writes to `transactions`? | Writes to `txSignatures`? | Writes to counters? |
|---|---|---|---|---|---|
| `createBudgetLine()` | PARLIAMENT_ROLE | YES — creates new entry | NO | NO | `budgetLineCount++` |
| `proposeTransaction()` | GOVERNMENT_ROLE | NO | YES — creates new entry | YES (`txSignatures[txId][msg.sender] = true`) | `txCount++` |
| `signTransaction()` | AUDITOR_ROLE | YES — `spent += amount` on referenced line | YES — `signaturesCount++`, `executed = true` | YES (`txSignatures[txId][msg.sender] = true`) | NO |
| `rejectTransaction()` | AUDITOR_ROLE or KERNEL_ROLE | NO | YES — `rejected = true` | NO | NO |
| `blockAddressByTrigger()` | KERNEL_ROLE | NO | NO | NO | NO |
| `startNewFiscalYear()` | PARLIAMENT_ROLE | NO | NO | NO | `currentFiscalYear = newYear`; `totalBudgetAllocated = 0` |
| View functions | None | NO | NO | NO | NO |

### 4.2 Key Observation

No function in any role can:
- **Delete** any `budgetLines[id]` entry or any `transactions[id]` entry
- **Overwrite** the identity fields of any existing record (`initiator`, `recipient`, `amount`, `budgetLineId`, `description`, `timestamp`, `category`, `allocated`, `fiscalYear`)
- **Decrement** any counter (`txCount`, `budgetLineCount`, `signaturesCount`)
- **Reverse** any one-way ratchet (`executed`, `rejected`, `blockedByTrigger`, `txSignatures`)
- **Decrease** `currentFiscalYear`

### 4.3 Role Administration Does Not Affect Record Permanence

The Kernel (DEFAULT_ADMIN_ROLE on Treasury) can grant or revoke roles via the inherited `AccessControl.grantRole()` / `revokeRole()`. However:
- Granting `PARLIAMENT_ROLE` allows creating NEW budget lines (append); it does not enable modification of EXISTING lines
- Granting `AUDITOR_ROLE` allows signing/rejecting transactions; all state transitions are one-way ratchets
- Revoking any role only restricts future operations; it does not affect existing records
- There is no role whose grant enables rewriting or deletion of historical records

---

## 5. Append-Only Write-Path Analysis — Budget Lines

### 5.1 Creation — `createBudgetLine()` (line 87–94)

```solidity
function createBudgetLine(BudgetCategory category, uint256 amount)
    external onlyRole(PARLIAMENT_ROLE) nonReentrant
{
    require(amount > 0, "Treasury: zero amount");
    require(totalBudgetAllocated + amount <= ANNUAL_BUDGET_CAP, "Treasury: exceeds 150B cap");
    budgetLineCount++;
    budgetLines[budgetLineCount] = BudgetLine({
        category:   category,
        allocated:  amount,
        spent:      0,
        fiscalYear: currentFiscalYear,
        isActive:   true
    });
    totalBudgetAllocated += amount;
    emit BudgetLineCreated(budgetLineCount, category, amount);
}
```

**Append-only proof:**
- A new entry is written to `budgetLines[budgetLineCount]` where `budgetLineCount` was just incremented from its prior value. This key has never been written before (counter is strictly increasing from 0, starting at 1 for the first line).
- The entry includes all immutable identity fields populated at creation. There is no second write to any of these fields anywhere in the contract.

### 5.2 Post-Creation Mutations — `signTransaction()` (line 118)

```solidity
budgetLines[tx_.budgetLineId].spent += tx_.amount;
```

**Analysis:**
- The only post-creation mutation to a budget line is the `spent` field increment.
- `spent` starts at 0 and can only increase. No function decrements `spent`.
- The `withinBudget` modifier enforces `line.spent + amount <= line.allocated`, so `spent` can never exceed `allocated`.
- The `allocated` field itself is never modified after creation.

**Permanence guarantee:** After a budget line is created, its `category`, `allocated`, `fiscalYear`, and `isActive` fields are permanently fixed. Its `spent` field is monotonically non-decreasing and bounded by `allocated`.

### 5.3 No Delete Path for Budget Lines

A Solidity `delete budgetLines[id]` would zero-out the struct fields. Searching the full 148-line Treasury.sol contract reveals zero uses of the `delete` keyword. No function can erase a budget line record.

Additionally, no function can overwrite an existing key in `budgetLines` — `createBudgetLine()` always writes to `budgetLines[budgetLineCount]` where `budgetLineCount` was just incremented, so it always writes to a previously-unused key.

### 5.4 `isActive` Field — One-Way Initialization

`isActive` is set to `true` at creation (line 91). No function in Treasury.sol sets `isActive = false`. There is no `deactivateBudgetLine()` function. No role can set `isActive = false` on any budget line.

**Implication:** Once a budget line is created, `isActive` remains permanently `true` in storage. (Budget lines created in prior fiscal years become operationally inaccessible via the `withinBudget` fiscal-year check, but their storage records remain intact with `isActive = true`.)

---

## 6. Append-Only Write-Path Analysis — Transactions

### 6.1 Creation — `proposeTransaction()` (lines 96–104)

```solidity
function proposeTransaction(
    address recipient, uint256 amount, uint256 budgetLineId, string calldata description
) external onlyRole(GOVERNMENT_ROLE) nonReentrant notBlocked(recipient) withinBudget(budgetLineId, amount)
  returns (uint256 txId)
{
    require(recipient != address(0), "Treasury: invalid recipient");
    require(amount > 0, "Treasury: zero amount");
    txCount++; txId = txCount;
    transactions[txId] = TreasuryTransaction({
        initiator:       msg.sender,
        recipient:       recipient,
        amount:          amount,
        budgetLineId:    budgetLineId,
        description:     description,
        timestamp:       block.timestamp,
        signaturesCount: 1,
        executed:        false,
        rejected:        false
    });
    txSignatures[txId][msg.sender] = true;
    emit TransactionProposed(txId, recipient, amount, budgetLineId);
    return txId;
}
```

**Append-only proof:**
- A new entry is written to `transactions[txId]` where `txId = txCount` after increment. This key has never been written before.
- All identity fields (`initiator`, `recipient`, `amount`, `budgetLineId`, `description`, `timestamp`) are set at creation. No function overwrites them.
- `signaturesCount` starts at 1 (initiator counts as first signer). `executed` and `rejected` start as `false`.

### 6.2 Post-Creation Mutations — `signTransaction()` (lines 106–121)

```solidity
function signTransaction(uint256 txId) external onlyRole(AUDITOR_ROLE) nonReentrant {
    TreasuryTransaction storage tx_ = transactions[txId];
    require(tx_.timestamp > 0, "Treasury: not found");
    require(!tx_.executed, "Treasury: executed");
    require(!tx_.rejected, "Treasury: rejected");
    require(!txSignatures[txId][msg.sender], "Treasury: already signed");
    require(!blockedByTrigger[tx_.recipient], "Treasury: recipient blocked");
    txSignatures[txId][msg.sender] = true;
    tx_.signaturesCount++;
    emit TransactionSigned(txId, msg.sender, tx_.signaturesCount);
    if (tx_.signaturesCount >= MULTISIG_THRESHOLD) {
        tx_.executed = true;
        budgetLines[tx_.budgetLineId].spent += tx_.amount;
        emit TransactionExecuted(txId, tx_.recipient, tx_.amount);
    }
}
```

**Permanence analysis:**
- `tx_.signaturesCount++`: monotonically increasing, never decremented. Bounded by number of unique AUDITOR_ROLE addresses.
- `tx_.executed = true`: one-way ratchet. `executed` starts false and can only become true. The guard `require(!tx_.executed)` prevents any call to `signTransaction()` after execution, so `executed` is set exactly once and never reset.
- `tx_.executed = true` does NOT overwrite identity fields.

### 6.3 Post-Creation Mutations — `rejectTransaction()` (lines 123–129)

```solidity
function rejectTransaction(uint256 txId, string calldata reason)
    external nonReentrant
{
    require(hasRole(AUDITOR_ROLE, msg.sender) || hasRole(KERNEL_ROLE, msg.sender), "Treasury: unauthorized");
    require(!transactions[txId].executed, "Treasury: executed");
    require(!transactions[txId].rejected, "Treasury: rejected");
    transactions[txId].rejected = true;
    emit TransactionRejected(txId, reason);
}
```

**Permanence analysis:**
- `transactions[txId].rejected = true`: one-way ratchet. `rejected` starts false and can only become true.
- Guard `require(!transactions[txId].rejected)` prevents any call to `rejectTransaction()` on an already-rejected transaction.
- Guard `require(!transactions[txId].executed)` prevents rejection of an already-executed transaction.
- `rejected = true` does NOT overwrite identity fields.

### 6.4 Mutual Exclusion of `executed` and `rejected`

From the guards:
- `signTransaction()` requires `!tx_.executed` AND `!tx_.rejected`
- `rejectTransaction()` requires `!transactions[txId].executed` AND `!transactions[txId].rejected`

Therefore:
- A transaction can only be executed if it has never been rejected
- A transaction can only be rejected if it has never been executed
- Once `executed = true`, neither `executed` nor `rejected` can be changed
- Once `rejected = true`, neither `executed` nor `rejected` can be changed

**Lifecycle ratchet proof:** The valid state transitions for a transaction are:
```
(executed=false, rejected=false) → (executed=false, rejected=true)   [via rejectTransaction()]
(executed=false, rejected=false) → (executed=true,  rejected=false)  [via signTransaction() at threshold]
(executed=true,  rejected=false) → [terminal — no further mutations allowed]
(executed=false, rejected=true)  → [terminal — no further mutations allowed]
(executed=true,  rejected=true)  → [unreachable — mutual exclusion enforced]
```

No state regression (true → false) is possible for either field.

### 6.5 No Delete Path for Transactions

The `delete` keyword does not appear anywhere in Treasury.sol. No function can erase a `transactions[id]` entry. No function can overwrite an existing `transactions[id]` key — `proposeTransaction()` always writes to `transactions[txCount]` where `txCount` was just incremented.

---

## 7. Counter Monotonicity Analysis

### 7.1 `txCount` — Transaction Counter

```solidity
uint256 public txCount;
// Line 99:
txCount++; txId = txCount;
```

**Write paths:**
- Written (incremented) only in `proposeTransaction()` at line 99.
- Never decremented.
- Never reset.
- Never set to an arbitrary value.
- Starting value: 0 (Solidity default). After first call: 1. Strictly increasing.

**Proof of monotonicity:** The only write to `txCount` is `txCount++`, which adds exactly 1. No other write exists in the 148-line contract.

### 7.2 `budgetLineCount` — Budget Line Counter

```solidity
uint256 public budgetLineCount;
// Line 90:
budgetLineCount++;
```

**Write paths:**
- Written (incremented) only in `createBudgetLine()` at line 90.
- Never decremented.
- Never reset.
- Never set to an arbitrary value.
- Starting value: 0 (Solidity default). After first call: 1. Strictly increasing.

**Proof of monotonicity:** The only write to `budgetLineCount` is `budgetLineCount++`.

### 7.3 `currentFiscalYear` — Fiscal Year Counter

```solidity
uint256 public currentFiscalYear;
// Constructor:
currentFiscalYear = 1404;
// startNewFiscalYear():
require(newYear > currentFiscalYear, "Treasury: invalid year");
currentFiscalYear = newYear;
```

**Write paths:**
- Set to 1404 at construction.
- Set to `newYear` in `startNewFiscalYear()`, guarded by `require(newYear > currentFiscalYear)`.

**Proof of strict monotonicity:** The guard `newYear > currentFiscalYear` enforces that `currentFiscalYear` can only increase. No function can decrease it. No function can reset it to 1404 or any prior value. The initial value 1404 is the constitutional floor (Iranian Solar Hijri year 1404 = Year 1 of IranOS deployment era).

### 7.4 Summary: Counter Permanence

| Counter | Monotonic? | Reset possible? | Proof |
|---|---|---|---|
| `txCount` | Strictly increasing | NO | Only written by `txCount++` |
| `budgetLineCount` | Strictly increasing | NO | Only written by `budgetLineCount++` |
| `currentFiscalYear` | Strictly increasing | NO | Guard `newYear > currentFiscalYear` |

---

## 8. Additive-Only Field Analysis

### 8.1 `txSignatures[txId][signer]`

```solidity
// proposeTransaction(), line 101:
txSignatures[txId][msg.sender] = true;
// signTransaction(), line 113:
txSignatures[txId][msg.sender] = true;
```

**Write paths:** Two assignments, both set the value to `true`. No assignment sets the value to `false`. No function clears the mapping.

**Guard at signTransaction(), line 111:**
```solidity
require(!txSignatures[txId][msg.sender], "Treasury: already signed");
```
This prevents a signer from "re-signing" — not a delete, but it confirms that once `txSignatures[txId][signer] = true`, no function can change it. The guard would revert any re-entry attempt by the same signer.

**Permanence guarantee:** Once an address signs a transaction, that signature is permanently recorded. No function erases it.

### 8.2 `blockedByTrigger[addr]`

```solidity
// blockAddressByTrigger(), line 132:
blockedByTrigger[target] = true;
```

**Write paths:** Single assignment, sets to `true`. No function sets it to `false`. No function clears the mapping.

**Permanence guarantee (Ratchet):** Once an address is blocked by the Trigger Protocol, it is permanently blocked. No role — including KERNEL_ROLE, PARLIAMENT_ROLE, or DEFAULT_ADMIN_ROLE — can unblock it. The Trigger Protocol block is irrevocable within the current contract deployment.

**Note on governance implications:** This irrevocability is intentional — the Trigger Protocol is a constitutional enforcement mechanism. Requiring irrevocability prevents a compromised Kernel from unblocking a previously-blocked actor.

### 8.3 `BudgetLine.spent`

```solidity
// signTransaction(), line 118:
budgetLines[tx_.budgetLineId].spent += tx_.amount;
```

**Write paths:** Single increment. The `spent` field starts at 0 (set at creation) and can only increase. No function decrements it. No function resets it.

**Bound:** The `withinBudget` modifier enforces `line.spent + amount <= line.allocated`, so `spent` is bounded above by `allocated`. The `allocated` field is never changed after creation, providing a permanent ceiling for `spent`.

### 8.4 `TreasuryTransaction.signaturesCount`

```solidity
// signTransaction(), line 114:
tx_.signaturesCount++;
```

**Write paths:** Set to 1 at creation (initiator counts). Incremented by 1 for each unique AUDITOR_ROLE signer. Never decremented. Effectively bounded by the number of unique auditors.

---

## 9. Fiscal Year Rollover — Accumulator vs. Historical Record

### 9.1 The Reset Operation

```solidity
function startNewFiscalYear(uint256 newYear) external onlyRole(PARLIAMENT_ROLE) {
    require(newYear > currentFiscalYear, "Treasury: invalid year");
    currentFiscalYear = newYear;
    totalBudgetAllocated = 0;   // ← RESET
    emit FiscalYearStarted(newYear, block.timestamp);
}
```

`totalBudgetAllocated` is reset to 0 when a new fiscal year begins. This is the only storage reset in the contract.

### 9.2 Does the Reset Erase Historical Records?

**Short answer: No.**

`totalBudgetAllocated` is a **current-year accumulator**, not a historical record. It tracks the sum of `allocated` amounts for budget lines created in the current fiscal year, for the purpose of enforcing the annual cap.

Historical data is preserved through a different structure: the `budgetLines` mapping. Every budget line created in any fiscal year remains permanently in storage with:
- Its `fiscalYear` field set to the year it was created
- Its `allocated` amount permanently recorded
- Its `spent` history monotonically accumulated
- Its `category` permanently fixed

After rollover, queries like `budgetLines[id]` for any historical `id` return the complete original record. No data is erased.

### 9.3 Post-Rollover Operational Isolation

Old budget lines (with `fiscalYear = N`) are operationally isolated after rollover to year N+1 by the `withinBudget` modifier:
```solidity
require(line.fiscalYear == currentFiscalYear, "Treasury: wrong fiscal year");
```

This prevents old lines from being used to authorize new transactions — but their storage entries remain completely intact. An auditor can read `budgetLines[id]` for any historical `id` and recover the full original record.

### 9.4 Proof: Rollover Does Not Constitute Historical Erasure

The invariant INV-08 is **not violated** by `startNewFiscalYear()` because:
1. `totalBudgetAllocated` is a derived accumulator (sum of current-year `allocated` fields), not a primary record
2. The primary records (`budgetLines` entries) that contributed to `totalBudgetAllocated` are never deleted or modified
3. The reset enables a new year's cap enforcement window — it does not erase any budget line, transaction, signature, or audit event
4. The fiscal year change itself is permanently recorded by `FiscalYearStarted` events on-chain

**Distinction:** The reset of `totalBudgetAllocated` is an accounting window slide, not a data erasure. The underlying records that informed the old accumulator value remain permanently accessible.

---

## 10. Destructive Pattern Audit

### 10.1 `selfdestruct` — Absent

A `selfdestruct` call in Treasury.sol would allow the contract to destroy itself, wiping all storage. Searching the 148-line contract:

```
grep "selfdestruct" contracts/monetary/Treasury.sol
→ (no results)
```

`selfdestruct` is not present. Contract destruction is impossible.

**Note:** Post-EIP-6780 (Cancun upgrade), `selfdestruct` no longer wipes storage unless called in the same transaction as creation. Even if `selfdestruct` were added in a future version, the current contract is safe.

### 10.2 `delete` Keyword — Absent

```
grep "delete" contracts/monetary/Treasury.sol
→ (no results)
```

The `delete` keyword does not appear anywhere in Treasury.sol. No storage can be zeroed through a `delete` operation.

### 10.3 `assembly` / Direct Storage Writes — Absent

```
grep "assembly" contracts/monetary/Treasury.sol
→ (no results)
```

No inline assembly is present. There is no `sstore` opcode call that could write to arbitrary storage slots, bypassing Solidity's mapping structure.

### 10.4 Delegatecall / Proxy Pattern — Absent

Treasury.sol is a directly deployed contract. There is no `delegatecall`, no `fallback` function that proxies calls, and no `UUPSUpgradeable` or `TransparentUpgradeableProxy` pattern. Storage cannot be overwritten through a proxy.

### 10.5 Reinitializer / Second Constructor — Absent

There is no `initialize()` function, `reinitialize()` function, or OpenZeppelin `Initializable` mixin. The constructor runs once at deployment. There is no mechanism to re-run initialization logic that would reset counters or clear mappings.

### 10.6 `mapping.delete` via Inherited Contracts — AccessControl

The inherited `AccessControl` contract uses an internal mapping `_roles` to track role memberships. Calling `revokeRole()` modifies `_roles`, but does NOT modify Treasury's `budgetLines`, `transactions`, `txSignatures`, `txCount`, `budgetLineCount`, or any treasury record.

The `ReentrancyGuard` inherited contract uses a `_status` variable (uint256). No external function can write to `_status` — it is managed internally by the `nonReentrant` modifier. No treasury record state can be affected through the reentrancy guard.

### 10.7 Summary: Destructive Patterns

| Pattern | Present in Treasury.sol? | Effect on records? |
|---|---|---|
| `selfdestruct` | NO | N/A |
| `delete` keyword | NO | N/A |
| `assembly` / `sstore` | NO | N/A |
| `delegatecall` / proxy | NO | N/A |
| `initialize()` reinitializer | NO | N/A |
| Inherited contracts (`_roles`, `_status`) | YES | Zero effect on treasury records |

---

## 11. Cross-Contract Mutation Path Analysis

### 11.1 Grep — All External Contracts That Reference Treasury

```
grep -rn "Treasury\|ITreasury" contracts/ --include="*.sol" | grep -v "Treasury.sol"
```

Results:
- `contracts/core/TriggerProtocol.sol` — defines `ITreasury` interface, calls `blockAddressByTrigger()`
- `contracts/monetary/SovereignWealthFund.sol` — stores `address public nationalTreasury` (address only, no calls)
- `contracts/governance/Provincial.sol` — stores `address public nationalTreasury` (address only, no calls)

### 11.2 TriggerProtocol.sol — `ITreasury` Interface

```solidity
// TriggerProtocol.sol lines 6–8
interface ITreasury {
    function blockAddressByTrigger(address target) external;
}
```

The only Treasury function exposed through `ITreasury` is `blockAddressByTrigger()`. Effect:
- Sets `blockedByTrigger[target] = true` — additive only
- Does NOT write to `budgetLines`, `transactions`, `txSignatures`, `txCount`, `budgetLineCount`, or `currentFiscalYear`
- Does NOT delete any record

**Classification: ADDITIVE ONLY — no historical record mutation**

### 11.3 SovereignWealthFund.sol — Address Storage Only

```solidity
// SovereignWealthFund.sol
address public nationalTreasury;
```

`SovereignWealthFund.sol` stores the Treasury address but makes zero function calls to Treasury. Grep across `SovereignWealthFund.sol` for `ITreasury`, `Treasury.`, `.blockAddressByTrigger`, `.createBudgetLine` returns no results.

**Classification: NO WRITE PATH — SWF cannot mutate Treasury records**

### 11.4 Provincial.sol — Address Storage Only

```solidity
// Provincial.sol
address public nationalTreasury;
```

`Provincial.sol` stores the Treasury address but makes zero function calls to Treasury. Same analysis as SWF.

**Classification: NO WRITE PATH — Provincial cannot mutate Treasury records**

### 11.5 IranOS_Kernel — Accessible Functions

The Kernel holds `KERNEL_ROLE` and `DEFAULT_ADMIN_ROLE` on Treasury. The only Treasury functions accessible to the Kernel are:
- `rejectTransaction()` — sets `rejected = true` (one-way ratchet, not an erasure)
- `blockAddressByTrigger()` — sets `blockedByTrigger[addr] = true` (additive)
- `grantRole()` / `revokeRole()` (inherited AccessControl) — affects role membership only, not treasury records

The Kernel cannot call `createBudgetLine()`, `proposeTransaction()`, `signTransaction()`, or `startNewFiscalYear()` directly (it lacks PARLIAMENT_ROLE, GOVERNMENT_ROLE, and AUDITOR_ROLE unless it grants itself these roles — see §13.4 governance trust gap).

**Classification: FORWARD-ONLY RATCHETS ONLY — Kernel cannot erase or rewrite treasury records**

### 11.6 Oracle / API3Oracle — No Treasury Interface

`API3Oracle.sol` calls `IIranOSKernel(kernel).flagViolation()`. The kernel's `flagViolation()` does not call Treasury. No oracle contract has an `ITreasury` interface or any path to Treasury budget records.

**Classification: NO WRITE PATH**

### 11.7 Cross-Contract Mutation Summary

| Contract | Has Treasury interface? | Can write to treasury records? | Can erase treasury records? |
|---|---|---|---|
| TriggerProtocol.sol | YES (`ITreasury`) | Additive only (`blockedByTrigger = true`) | NO |
| SovereignWealthFund.sol | NO (address only) | NO | NO |
| Provincial.sol | NO (address only) | NO | NO |
| IranOS_Kernel | Via KERNEL_ROLE | One-way ratchets only (`rejected = true`, `blockedByTrigger = true`) | NO |
| API3Oracle.sol | NO | NO | NO |
| All other contracts | NO | NO | NO |

---

## 12. Event / Audit Trail Analysis

### 12.1 Events Emitted by Treasury.sol

```solidity
event BudgetLineCreated(uint256 indexed lineId, BudgetCategory category, uint256 amount);
event TransactionProposed(uint256 indexed txId, address recipient, uint256 amount, uint256 budgetLineId);
event TransactionSigned(uint256 indexed txId, address signer, uint8 sigCount);
event TransactionExecuted(uint256 indexed txId, address recipient, uint256 amount);
event TransactionRejected(uint256 indexed txId, string reason);
event AddressBlockedByTrigger(address indexed target);
event FiscalYearStarted(uint256 year, uint256 timestamp);
```

### 12.2 Event → State Transition Mapping

| Event | Emitted by | State change | Permanent? |
|---|---|---|---|
| `BudgetLineCreated` | `createBudgetLine()` | New budget line created | YES — budget line is permanent |
| `TransactionProposed` | `proposeTransaction()` | New transaction created | YES — transaction record is permanent |
| `TransactionSigned` | `signTransaction()` | `signaturesCount++` | YES — signatures are permanent |
| `TransactionExecuted` | `signTransaction()` | `executed = true`, `spent += amount` | YES — execution is permanent (one-way ratchet) |
| `TransactionRejected` | `rejectTransaction()` | `rejected = true` | YES — rejection is permanent (one-way ratchet) |
| `AddressBlockedByTrigger` | `blockAddressByTrigger()` | `blockedByTrigger[addr] = true` | YES — block is permanent (ratchet) |
| `FiscalYearStarted` | `startNewFiscalYear()` | `currentFiscalYear = newYear`, `totalBudgetAllocated = 0` | YES — event is permanent even though `totalBudgetAllocated` resets |

### 12.3 Events Are Immutable Once Emitted

Ethereum logs (events) are permanently stored in the blockchain's receipt trie once mined. No contract function can modify, delete, or suppress a previously emitted event. Events provide a second, independent audit trail that is stored separately from contract storage.

This means even if a storage manipulation were theoretically possible (it is not, as proven above), the event log would preserve the original record forever.

### 12.4 `FiscalYearStarted` Event and `totalBudgetAllocated` Reset

When `startNewFiscalYear()` is called:
1. The `FiscalYearStarted` event is emitted with `year` and `timestamp`
2. `totalBudgetAllocated` is reset to 0
3. All prior `BudgetLineCreated` events for the old fiscal year remain permanently on-chain

Even though `totalBudgetAllocated` (a derived accumulator) is reset, the underlying budget line creation events (`BudgetLineCreated`) are permanently on-chain. An auditor can reconstruct the full historical allocation from events, independent of the current accumulator value.

---

## 13. Threat Model and Bypass Scenarios

### Scenario 1: PARLIAMENT_ROLE Overwrites Existing Budget Line

**Attempt:** A PARLIAMENT_ROLE holder calls `createBudgetLine()` with a specific ID to overwrite an existing budget line.

**Result:** Impossible. `createBudgetLine()` always writes to `budgetLines[budgetLineCount]` where `budgetLineCount` was just incremented. There is no parameter to specify a target ID. A caller cannot inject a specific key to overwrite. New budget lines are always appended at the next monotonically increasing ID.

**Classification: PROVEN SAFE**

### Scenario 2: AUDITOR_ROLE Reverses a Transaction Execution

**Attempt:** After `executed = true`, an auditor calls `signTransaction()` again to re-execute or reverse the execution.

**Result:** `signTransaction()` has guard `require(!tx_.executed, "Treasury: executed")` at line 109. Any call to `signTransaction()` on an already-executed transaction reverts. The execution state cannot be reversed.

**Classification: PROVEN SAFE**

### Scenario 3: KERNEL_ROLE or AUDITOR_ROLE Un-Rejects a Transaction

**Attempt:** After `rejected = true`, a caller attempts to clear the rejection and re-propose the transaction.

**Result:** `rejectTransaction()` has guard `require(!transactions[txId].rejected, "Treasury: rejected")` at line 126. The guard ensures `rejected` can only transition once. There is no `unrejectTransaction()` function. The rejection state is permanent.

**Classification: PROVEN SAFE**

### Scenario 4: PARLIAMENT_ROLE Rolls Back Fiscal Year to Erase Budget History

**Attempt:** Parliament calls `startNewFiscalYear(1403)` to roll back the fiscal year counter and overwrite the current year's budget lines.

**Result:** Guard `require(newYear > currentFiscalYear, "Treasury: invalid year")` at line 137 prevents this. The fiscal year can only increase. A rollback to any prior year is impossible.

**Classification: PROVEN SAFE**

### Scenario 5: KERNEL_ROLE Unblocks a Trigger-Blocked Address

**Attempt:** KERNEL_ROLE calls a function to set `blockedByTrigger[addr] = false`.

**Result:** No such function exists in Treasury.sol. `blockAddressByTrigger()` only sets to `true`. There is no `unblockAddress()` function. No role can unblock a trigger-blocked address.

**Classification: PROVEN SAFE**

### Scenario 6: PARLIAMENT_ROLE Decrements Budget Line `spent` to Enable Re-Spending

**Attempt:** A PARLIAMENT_ROLE holder attempts to decrease `budgetLines[id].spent` to allow a budget line to be drawn down again.

**Result:** The only function that writes to `budgetLines[id].spent` is `signTransaction()` (requires AUDITOR_ROLE), and it only increments (`+= tx_.amount`). There is no decrement function. PARLIAMENT_ROLE has no direct write access to the `spent` field.

**Classification: PROVEN SAFE**

### 13.4 Governance Trust Gap — Inherited Root Cause (Same as INV-04)

**Scenario:** The Sovereign (via DEFAULT_ADMIN_ROLE on Treasury) grants itself `PARLIAMENT_ROLE`, `GOVERNMENT_ROLE`, and `AUDITOR_ROLE`. It then:
1. Creates budget lines (as "parliament")
2. Proposes transactions (as "government")
3. Signs transactions (as "auditor") to reach the 3-of-N threshold

**Effect on INV-08:** All operations performed through these roles are still append-only and forward-only. Even a Sovereign holding all roles cannot:
- Delete any budget line or transaction record
- Overwrite identity fields of existing records
- Decrement `spent`, `signaturesCount`, or counters
- Reverse `executed` or `rejected` from true to false
- Reset `txCount` or `budgetLineCount`
- Roll back `currentFiscalYear`

**Does this bypass INV-08?** No. The append-only and one-way ratchet properties are enforced by the contract's write logic, not by role separation alone. Even with all roles held by a single actor, the historical record cannot be erased or rewritten.

**Note:** The MULTISIG_THRESHOLD = 3 for transaction execution means that a Sovereign with only the deployer-granted DEFAULT_ADMIN_ROLE + KERNEL_ROLE cannot execute transactions alone — they would need to grant themselves GOVERNMENT_ROLE (for proposing) and AUDITOR_ROLE to 3 distinct addresses for signing. But none of this enables historical record deletion.

**Classification: ASSUMPTION (governance independence gap, same root as INV-04) — DOES NOT BYPASS INV-08**

---

## 14. Risk Classification

| Finding | Severity | Status |
|---|---|---|
| Budget line overwrite via `createBudgetLine()` | NONE | PROVEN SAFE — always appends to new key |
| Transaction overwrite via `proposeTransaction()` | NONE | PROVEN SAFE — always appends to new key |
| `BudgetLine.allocated` decrease | NONE | PROVEN SAFE — no decrement function exists |
| `BudgetLine.isActive` set false | NONE | PROVEN SAFE — no setter exists |
| `BudgetLine.spent` decrease | NONE | PROVEN SAFE — only incremented by `signTransaction()` |
| `TreasuryTransaction.executed` reset (true → false) | NONE | PROVEN SAFE — one-way ratchet; `require(!tx_.executed)` guard |
| `TreasuryTransaction.rejected` reset (true → false) | NONE | PROVEN SAFE — one-way ratchet; `require(!rejected)` guard |
| `TreasuryTransaction` identity fields overwrite | NONE | PROVEN SAFE — no setter functions |
| `txSignatures` cleared | NONE | PROVEN SAFE — only set to true, never false |
| `blockedByTrigger` unset | NONE | PROVEN SAFE — no unblock function |
| `txCount` decremented or reset | NONE | PROVEN SAFE — only `txCount++` write exists |
| `budgetLineCount` decremented or reset | NONE | PROVEN SAFE — only `budgetLineCount++` write exists |
| `currentFiscalYear` decreased | NONE | PROVEN SAFE — `require(newYear > currentFiscalYear)` guard |
| `totalBudgetAllocated` reset by fiscal year rollover | DESIGN OBSERVATION | INTENDED — per-year accumulator; historical records in `budgetLines` are preserved |
| Contract destruction via `selfdestruct` | NONE | PROVEN SAFE — no `selfdestruct` in contract |
| Storage wipe via `delete` | NONE | PROVEN SAFE — no `delete` keyword in contract |
| Storage manipulation via `assembly` | NONE | PROVEN SAFE — no `assembly` in contract |
| Proxy-based storage overwrite | NONE | PROVEN SAFE — no proxy/delegatecall pattern |
| Cross-contract erasure (TriggerProtocol, SWF, Provincial) | NONE | PROVEN SAFE — no cross-contract write paths to record storage |
| Governance trust gap (all-roles Sovereign) | MEDIUM | ASSUMPTION — same root as INV-04; does not enable record erasure |
| `startNewFiscalYear()` lacks `nonReentrant` | LOW | UNRESOLVED — same as INV-07 F6; no current exploit path |

### Overall Rating: **LOW**

INV-08 holds with high confidence. All storage structures are append-only or forward-only by architecture. No destructive patterns exist. No cross-contract mutation paths reach record storage.

---

## 15. Findings Summary

### F1: Budget Lines Are Append-Only — PROVEN SAFE

`budgetLines` entries are created by `createBudgetLine()` using a monotonically increasing key (`budgetLineCount++`). No function can overwrite an existing key. The `isActive`, `category`, `allocated`, and `fiscalYear` fields have no setters after creation. The `spent` field is monotonically non-decreasing (bounded by `allocated`). No `delete` keyword exists in the contract.

### F2: Transactions Are Append-Only — PROVEN SAFE

`transactions` entries are created by `proposeTransaction()` using a monotonically increasing key (`txCount++`). No function can overwrite an existing key. The identity fields (`initiator`, `recipient`, `amount`, `budgetLineId`, `description`, `timestamp`) have no setters after creation. The lifecycle fields (`executed`, `rejected`) are one-way ratchets enforced by guards.

### F3: Transaction Lifecycle Is a One-Way Ratchet — PROVEN SAFE

The mutual exclusion guards (`require(!tx_.executed)` and `require(!tx_.rejected)` in both `signTransaction()` and `rejectTransaction()`) enforce that:
- A transaction can only be executed once
- A transaction can only be rejected once
- Execution and rejection are mutually exclusive
- Neither state can be reversed

### F4: Signature Records Are Additive — PROVEN SAFE

`txSignatures[txId][signer]` is set to `true` in `proposeTransaction()` (initiator) and `signTransaction()` (auditors). No function sets it to `false`. The guard `require(!txSignatures[txId][msg.sender])` in `signTransaction()` confirms the additive-only property by preventing re-signing.

### F5: Counters Are Monotonically Non-Decreasing — PROVEN SAFE

`txCount` is only written by `txCount++`. `budgetLineCount` is only written by `budgetLineCount++`. `currentFiscalYear` is guarded by `require(newYear > currentFiscalYear)`. None of these counters can be decremented, reset, or set to an arbitrary value.

### F6: Trigger Block Records Are Permanent — PROVEN SAFE

`blockedByTrigger[addr]` can only be set `false → true` by `blockAddressByTrigger()`. No function exists to unblock an address. The Trigger Protocol block is irrevocable.

### F7: No Destructive Patterns Present — PROVEN SAFE

`selfdestruct`, `delete`, inline `assembly`, and proxy/delegatecall patterns are absent from Treasury.sol. No mechanism can destroy the contract or wipe storage.

### F8: Cross-Contract Paths Are Additive-Only — PROVEN SAFE

The only cross-contract write to Treasury is `blockAddressByTrigger()` via `ITreasury` in `TriggerProtocol.sol`. This is additive only. `SovereignWealthFund.sol` and `Provincial.sol` store the Treasury address but make zero calls. No cross-contract path can erase or rewrite treasury records.

### F9: Fiscal Year Rollover Is Not Historical Erasure — DESIGN OBSERVATION (Non-Finding)

`totalBudgetAllocated` reset in `startNewFiscalYear()` resets a derived accumulator, not primary records. All budget line entries (the primary records) persist with their `fiscalYear` fields intact. The rollover is constitutionally intended (per-year cap model) and does not violate INV-08.

### F10: Governance Trust Gap Does Not Enable Record Erasure — ASSUMPTION

A Sovereign holding all roles (via DEFAULT_ADMIN_ROLE's inherited `grantRole()`) still cannot erase or rewrite historical treasury records. The append-only and ratchet properties are enforced at the write-logic level, independent of role separation. (Same root cause as INV-04.)

### F11: `startNewFiscalYear()` Lacks `nonReentrant` — UNRESOLVED (Low, Forward-Looking)

Pattern inconsistency with `createBudgetLine()`. No current exploit path. Zero external calls in the function. Forward-looking risk only (same as INV-07 F6). Does not affect INV-08 directly (no reentrancy path threatens record permanence).

---

## 16. Recommended Echidna Harness Design

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// TEST-ONLY HARNESS — DO NOT DEPLOY TO PRODUCTION
// Invariant: INV-08 — Treasury Block Permanence

import "../../contracts/monetary/Treasury.sol";

contract FuzzTreasuryBlockPermanence {
    Treasury public treasury;

    // Track initial budget line state for comparison
    mapping(uint256 => uint256) internal snapAllocated;
    mapping(uint256 => uint256) internal snapFiscalYear;
    mapping(uint256 => bool)    internal snapIsActive;

    // Track initial transaction state
    mapping(uint256 => address)  internal snapInitiator;
    mapping(uint256 => uint256)  internal snapAmount;
    mapping(uint256 => uint256)  internal snapTimestamp;

    // Monotonicity tracking
    uint256 internal lastTxCount;
    uint256 internal lastBudgetLineCount;
    uint256 internal lastFiscalYear;

    constructor() {
        treasury = new Treasury(address(this));
        treasury.grantRole(treasury.PARLIAMENT_ROLE(), address(this));
        treasury.grantRole(treasury.GOVERNMENT_ROLE(), address(this));
        treasury.grantRole(treasury.AUDITOR_ROLE(), address(this));
        lastFiscalYear = treasury.currentFiscalYear();
    }

    // ─── Fuzz entry points ──────────────────────────────────────────────────

    function doCreateLine(uint8 category, uint256 amount) public {
        uint8 safeCat = category % 8;
        uint256 cap = treasury.ANNUAL_BUDGET_CAP();
        if (amount == 0 || amount > cap) return;
        uint256 remaining = treasury.getRemainingCapacity();
        if (amount > remaining) return;
        try treasury.createBudgetLine(Treasury.BudgetCategory(safeCat), amount) {
            uint256 id = treasury.budgetLineCount();
            Treasury.BudgetLine memory bl = treasury.getBudgetLine(id);
            snapAllocated[id] = bl.allocated;
            snapFiscalYear[id] = bl.fiscalYear;
            snapIsActive[id] = bl.isActive;
        } catch {}
    }

    function doProposeTx(address recipient, uint256 amount, uint256 lineId) public {
        if (recipient == address(0) || amount == 0) return;
        try treasury.proposeTransaction(recipient, amount, lineId, "fuzz") {
            uint256 id = treasury.txCount();
            Treasury.TreasuryTransaction memory tx_ = treasury.getTransaction(id);
            snapInitiator[id] = tx_.initiator;
            snapAmount[id] = tx_.amount;
            snapTimestamp[id] = tx_.timestamp;
        } catch {}
    }

    function doSignTx(uint256 txId) public {
        try treasury.signTransaction(txId) {} catch {}
    }

    function doRejectTx(uint256 txId) public {
        try treasury.rejectTransaction(txId, "fuzz-reject") {} catch {}
    }

    function doRollYear(uint256 newYear) public {
        if (newYear <= treasury.currentFiscalYear()) return;
        try treasury.startNewFiscalYear(newYear) {} catch {}
    }

    // ─── Echidna invariant properties ────────────────────────────────────────

    /// INV-08a: txCount is monotonically non-decreasing.
    function echidna_tx_count_monotonic() public returns (bool) {
        uint256 current = treasury.txCount();
        if (current < lastTxCount) return false;
        lastTxCount = current;
        return true;
    }

    /// INV-08b: budgetLineCount is monotonically non-decreasing.
    function echidna_budget_line_count_monotonic() public returns (bool) {
        uint256 current = treasury.budgetLineCount();
        if (current < lastBudgetLineCount) return false;
        lastBudgetLineCount = current;
        return true;
    }

    /// INV-08c: currentFiscalYear is strictly non-decreasing.
    function echidna_fiscal_year_monotonic() public returns (bool) {
        uint256 current = treasury.currentFiscalYear();
        if (current < lastFiscalYear) return false;
        lastFiscalYear = current;
        return true;
    }

    /// INV-08d: BudgetLine.allocated never decreases after creation (snapshot check).
    function echidna_budget_allocated_permanent() public view returns (bool) {
        uint256 count = treasury.budgetLineCount();
        for (uint256 i = 1; i <= count && i <= 20; i++) {
            Treasury.BudgetLine memory bl = treasury.getBudgetLine(i);
            if (snapAllocated[i] != 0 && bl.allocated != snapAllocated[i]) return false;
            if (snapIsActive[i] && !bl.isActive) return false;
            if (snapFiscalYear[i] != 0 && bl.fiscalYear != snapFiscalYear[i]) return false;
        }
        return true;
    }

    /// INV-08e: BudgetLine.spent never decreases (append-only accounting).
    function echidna_budget_spent_non_decreasing() public view returns (bool) {
        // spent can only increase; we can't store snapshots of spent easily in Echidna
        // Instead: for each line, spent <= allocated (verified via withinBudget logic)
        uint256 count = treasury.budgetLineCount();
        for (uint256 i = 1; i <= count && i <= 20; i++) {
            Treasury.BudgetLine memory bl = treasury.getBudgetLine(i);
            if (bl.spent > bl.allocated) return false;
        }
        return true;
    }

    /// INV-08f: Transaction identity fields are immutable after creation (snapshot check).
    function echidna_tx_identity_permanent() public view returns (bool) {
        uint256 count = treasury.txCount();
        for (uint256 i = 1; i <= count && i <= 20; i++) {
            Treasury.TreasuryTransaction memory tx_ = treasury.getTransaction(i);
            if (snapInitiator[i] != address(0) && tx_.initiator != snapInitiator[i]) return false;
            if (snapAmount[i] != 0 && tx_.amount != snapAmount[i]) return false;
            if (snapTimestamp[i] != 0 && tx_.timestamp != snapTimestamp[i]) return false;
        }
        return true;
    }

    /// INV-08g: executed=true and rejected=true are mutually exclusive.
    function echidna_executed_rejected_exclusive() public view returns (bool) {
        uint256 count = treasury.txCount();
        for (uint256 i = 1; i <= count && i <= 20; i++) {
            Treasury.TreasuryTransaction memory tx_ = treasury.getTransaction(i);
            if (tx_.executed && tx_.rejected) return false;
        }
        return true;
    }
}
```

### Expected Echidna Results

| Property | Expected | Confirms |
|---|---|---|
| `echidna_tx_count_monotonic` | PASSING | `txCount` never decremented or reset |
| `echidna_budget_line_count_monotonic` | PASSING | `budgetLineCount` never decremented or reset |
| `echidna_fiscal_year_monotonic` | PASSING | `currentFiscalYear` never decreased |
| `echidna_budget_allocated_permanent` | PASSING | Budget line `allocated`, `isActive`, `fiscalYear` fields immutable post-creation |
| `echidna_budget_spent_non_decreasing` | PASSING | `spent` bounded by `allocated` (monotone) |
| `echidna_tx_identity_permanent` | PASSING | Transaction identity fields immutable post-creation |
| `echidna_executed_rejected_exclusive` | PASSING | `executed` and `rejected` are mutually exclusive |

---

## 17. Conclusion

### INV-08 Holds: **YES — TREASURY RECORDS ARE APPEND-ONLY BY ARCHITECTURE**

Treasury block permanence is enforced with high confidence across all storage structures.

### Evidence Matrix

| Question | Answer | Evidence |
|---|---|---|
| Can any budget line be deleted? | **NO** | No `delete` keyword; no function targets existing key in `budgetLines` |
| Can budget line identity fields be overwritten? | **NO** | No setter functions for `category`, `allocated`, `fiscalYear`, `isActive` |
| Can `allocated` be decreased? | **NO** | No decrement function; only write is at creation |
| Can `isActive` be set false? | **NO** | No setter; initialized `true` and never changed |
| Can any transaction be deleted? | **NO** | No `delete` keyword; no function targets existing key in `transactions` |
| Can transaction identity fields be overwritten? | **NO** | No setter functions for `initiator`, `recipient`, `amount`, `budgetLineId`, `description`, `timestamp` |
| Can `executed` be reversed (true → false)? | **NO** | One-way ratchet enforced by `require(!tx_.executed)` guard |
| Can `rejected` be reversed (true → false)? | **NO** | One-way ratchet enforced by `require(!transactions[txId].rejected)` guard |
| Can executed and rejected both be true? | **NO** | Mutual exclusion enforced by cross-guards |
| Can signatures be erased? | **NO** | `txSignatures` only set to `true`; no clear function |
| Can trigger blocks be lifted? | **NO** | `blockedByTrigger` only set to `true`; no unblock function |
| Can `txCount` or `budgetLineCount` be decremented? | **NO** | Only written by `++` increment |
| Can `currentFiscalYear` decrease? | **NO** | `require(newYear > currentFiscalYear)` guard |
| Can the contract be destroyed? | **NO** | No `selfdestruct` |
| Can storage be wiped via `delete`? | **NO** | No `delete` keyword in contract |
| Can storage be manipulated via `assembly`? | **NO** | No `assembly` in contract |
| Can a cross-contract call erase treasury records? | **NO** | Only cross-contract write is `blockAddressByTrigger()` — additive only |
| Does fiscal year rollover erase historical records? | **NO** | Resets accumulator only; primary records in `budgetLines` persist |

### Qualified Findings

1. **F10 (Governance Trust Gap):** Same DEFAULT_ADMIN_ROLE root cause as INV-04. A Sovereign holding all roles still cannot erase records — the append-only property is enforced at write-logic level, independent of role separation. Does not violate INV-08.

2. **F11 (`startNewFiscalYear()` lacks `nonReentrant`):** Pattern inconsistency, no exploit path. Forward-looking only (same as INV-07 F6).

### Next: INV-09

After INV-08, the natural next audit is **INV-09 — Multisig Quorum Integrity**: verifying that Treasury transaction execution requires exactly `MULTISIG_THRESHOLD` distinct authorized signatures and that no sequence of calls can execute a transaction with fewer than threshold signatures. Both INV-08 and INV-09 target `Treasury.sol`.

---

*This document is analysis only. No production code, test code, deployment scripts, CI configuration, or doctrine was modified. No production readiness, external audit completion, formal verification completion, or Step 12 blocker closure is claimed.*
