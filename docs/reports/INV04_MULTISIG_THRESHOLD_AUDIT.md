# INV-04 — Multisig Threshold: Complete Authority Audit
## IranOS Step 12 Security Analysis

**Version:** 1.1.0 (Corrective — addresses authority-capture gap in v1.0.0)
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** All kernel multisig logic; signature counting, uniqueness, gating, replay resistance, and signer-independence

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - No contracts, tests, CI, deployment scripts, or production code were modified.

---

## Table of Contents

1. [Invariant Definition](#1-invariant-definition)
2. [Critical Distinction: Address Count vs. Authority Independence](#2-critical-distinction-address-count-vs-authority-independence)
3. [Reachable Authority Graph](#3-reachable-authority-graph)
4. [Exact Functions and State Variables](#4-exact-functions-and-state-variables)
5. [Enforcement Point Analysis](#5-enforcement-point-analysis)
6. [Attack Surface Evaluation](#6-attack-surface-evaluation)
7. [Adversarial Scenarios](#7-adversarial-scenarios)
8. [Proof of Threshold Enforcement](#8-proof-of-threshold-enforcement)
9. [Risk Rating](#9-risk-rating)
10. [Recommended Invariant Harness Design](#10-recommended-invariant-harness-design)
11. [Follow-up Recommendations](#11-follow-up-recommendations)
12. [Findings Summary](#12-findings-summary)

---

## 1. Invariant Definition

**ID:** INV-04
**Contract:** `IranOS_Kernel` (`contracts/kernel.sol`)
**Category:** Multisig Threshold Preservation

### Constitutional Significance

`MULTISIG_THRESHOLD = 7` is a hard-coded constitutional minimum representing 7-of-9 court signatures required to activate the trigger protocol. The constitutional intent is that no individual — including the Sovereign — can unilaterally execute constitutional enforcement without supermajority agreement among an **independent** judiciary.

A threshold bypass via counting logic would reduce the effective activation requirement from 7-of-9 to as few as 1-of-1. This type of bypass is architecturally impossible (see §5, §8).

However, a second class of bypass exists at the authority layer: the Sovereign (`DEFAULT_ADMIN_ROLE`) can grant `COURT_ROLE` to any addresses — including addresses under the Sovereign's own control — and satisfy the 7-distinct-address threshold through controlled proxies. This is **not** a duplicate-signature bug and **not** a threshold-counting bug. It is a **signer-independence gap**: the contract enforces 7 distinct addresses but does not enforce that those addresses represent 7 independent authorities.

### Corrected Invariant Statement

**What the contract enforces (code-level guarantee):**

For any `violationId` where `violations[violationId].triggered == true`:
1. `violations[violationId].signaturesCount >= 7`
2. The signatures came from 7 **distinct** addresses (by EVM `msg.sender`), each holding `COURT_ROLE` at the time of signing
3. No single address contributed more than one counted signature to `signaturesCount`

**What the contract does NOT enforce (constitutional gap):**

4. That the 7 signing addresses represent 7 **independent** court authorities
5. That the Sovereign did not grant `COURT_ROLE` to all 7 signing addresses
6. That a single controlling actor did not orchestrate all 7 signatures through controlled accounts

INV-04 holds as a **7-distinct-address invariant**. It does not hold as a **7-independent-authority invariant**.

---

## 2. Critical Distinction: Address Count vs. Authority Independence

This section documents the finding that corrects v1.0.0 of this audit.

### 2.1 What "7 distinct addresses" means

The contract enforces that 7 different EVM addresses — each with `COURT_ROLE` at signing time — contributed to `signaturesCount` before `_activateTrigger()` was called. This is enforced by GATE C (`violationSignatures[id][msg.sender]` write-once-true) and the threshold gate. It is a rigorous code-level property.

**This is what INV-04 currently guarantees.**

### 2.2 What "7 independent authorities" would mean

The constitutional design intent is that 7 independent court members — not controlled by a single actor — must agree before enforcement proceeds. This would require that no single entity controls the private keys of 7 or more `COURT_ROLE` holders, and that `COURT_ROLE` grants are subject to an independent governance process.

**This is NOT what the current contract enforces.**

### 2.3 The authority-capture path

The Sovereign (`DEFAULT_ADMIN_ROLE`) administers all roles in `IranOS_Kernel`. There is no constraint preventing the Sovereign from:

1. Granting `ORACLE_ROLE` to an address they control → calling `flagViolation()` to create a violation record
2. Granting `COURT_ROLE` to 7 or more addresses they control (each a distinct EVM address)
3. Having all 7 controlled addresses call `signViolation()` → threshold met → `_activateTrigger()` fires

**Result:** The Sovereign can satisfy the 7-distinct-address threshold entirely through controlled proxies, achieving effective unilateral trigger activation without any genuinely independent court participation. No signature-counting rule is violated. No gate is bypassed. The code operates exactly as designed — but the output (trigger activation) is achieved by a single controlling actor.

This is a **current risk**, not a forward-looking one. The mechanism is available in the deployed contract today.

### 2.4 Scope of the gap

| Property | Enforced by contract? |
|---|---|
| `signaturesCount >= 7` before trigger | **YES** |
| 7 distinct `msg.sender` addresses signed | **YES** |
| No address signed twice | **YES** |
| 7 addresses are independent of each other | **NO** |
| 7 addresses are independent of the Sovereign | **NO** |
| Sovereign cannot orchestrate all 7 signatures | **NO** |
| COURT_ROLE grants require independent governance | **NO** |

### 2.5 Relationship to v1.0.0 classification

v1.0.0 classified the `AccessControl.grantRole()` path as:
> "Governance trust assumption gap. Not a code-level threshold bypass... a forward-looking architectural note, not a current vulnerability."

**This classification was incorrect.** The gap is:
- **Current**, not forward-looking — the path is available in the deployed contract with no preconditions beyond Sovereign key control
- **High-impact**, not low — it enables effective unilateral trigger activation by the Sovereign through controlled proxies
- **Authority-capture**, not threshold-bypass — the counting mechanism works correctly; the independence assumption is what fails

---

## 3. Reachable Authority Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│               AUTHORITY GRAPH: MULTISIG THRESHOLD PATH                  │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1 — VIOLATION FLAGGING
──────────────────────────────────────────────────────────────────────────
  ORACLE_ROLE holder
    └─→ Kernel.flagViolation(code, offender, reason)    [onlyOracle nonReentrant]
          → violations[++violationCount] = ViolationRecord{
                signaturesCount: 0,
                triggered:       false,
                courtConfirmed:  false,
                timestamp:       block.timestamp   ← proof of existence
            }
          → if code ≤ 3: emergencyLockActive = true

STEP 2 — COURT SIGNATURE ACCUMULATION
──────────────────────────────────────────────────────────────────────────
  COURT_ROLE holder #N (N = 1..6)
    └─→ Kernel.signViolation(violationId)               [onlyCourt nonReentrant]
          GATE A: require(record.timestamp > 0)          ← violation must exist
          GATE B: require(!record.triggered)             ← not already triggered
          GATE C: require(!violationSignatures[id][msg.sender])  ← no duplicates
          → violationSignatures[id][msg.sender] = true
          → record.signaturesCount++                    ← now 1..6
          → signaturesCount < 7: NO trigger

  COURT_ROLE holder #7 (distinct from #1..#6)
    └─→ Kernel.signViolation(violationId)               [onlyCourt nonReentrant]
          GATE A: require(record.timestamp > 0)          ← passes
          GATE B: require(!record.triggered)             ← passes (not yet)
          GATE C: require(!violationSignatures[id][msg.sender])  ← passes (new addr)
          → violationSignatures[id][msg.sender] = true
          → record.signaturesCount++                    ← now 7
          → signaturesCount >= MULTISIG_THRESHOLD (7):
              record.courtConfirmed = true
              _activateTrigger(violationId)             [INTERNAL]

STEP 3 — TRIGGER ACTIVATION
──────────────────────────────────────────────────────────────────────────
  Kernel._activateTrigger(violationId)                  [INTERNAL ONLY]
    GATE D: require(!record.triggered)                   ← double-trigger guard
    → record.triggered = true
    → triggerActivationCount++
    → _revokeOfficialAccess(offender)                   [INTERNAL]
    → if (triggerProtocol != address(0)):
        ITriggerProtocol(triggerProtocol)
          .executeTrigger(violationId, offender, code, address(0))

STEP 4 — POST-TRIGGER STATE
──────────────────────────────────────────────────────────────────────────
  All subsequent calls to signViolation(violationId):
    → GATE B fails: "Kernel: trigger already activated"
    → signaturesCount cannot increase beyond its triggered value
```

---

## 4. Exact Functions and State Variables

### State variables involved in threshold enforcement

```solidity
// kernel.sol lines 56, 88-89, 106, 112

uint8 public constant MULTISIG_THRESHOLD = 7;          // immutable constant

struct ViolationRecord {
    uint8   signaturesCount;   // uint8: max 255; gates at 7
    bool    triggered;         // monotonically set; never cleared
    bool    courtConfirmed;    // set simultaneously with triggered
    ...
}

mapping(uint256 => ViolationRecord) public violations;
mapping(uint256 => mapping(address => bool)) public violationSignatures;
uint256 public violationCount;                         // monotonically incrementing
```

### Write access to threshold-critical state

**Complete write map — every assignment to these fields across ALL 25 production contracts:**

| Field | Written in | Line(s) | Condition |
|---|---|---|---|
| `violationSignatures[id][addr]` | `signViolation()` only | 299 | After GATE A+B+C pass |
| `record.signaturesCount` | `flagViolation()` (init to 0) | 270 | On violation creation |
| `record.signaturesCount` | `signViolation()` (increment) | 300 | After GATE A+B+C pass |
| `record.triggered` | `_activateTrigger()` (set to true) | 322 | Internal; after count >= 7 |
| `record.courtConfirmed` | `signViolation()` (set to true) | 306 | When count >= 7 |
| `violationCount` | `flagViolation()` (increment) | 261 | On violation creation |

**Zero other production contracts write to any of these fields.** Grep across all 25 contracts for `violations[`, `violationSignatures[`, `signaturesCount`, and `violationCount` confirms all writes are in `kernel.sol` only.

---

## 5. Enforcement Point Analysis

### 4.1 GATE A — Violation Existence Check

```solidity
require(record.timestamp > 0, "Kernel: violation not found");
```

Prevents signing a non-existent violationId. `timestamp` is set in `flagViolation()` to `block.timestamp` (never zero in practice; block timestamps are always > 0 after genesis). Prevents signing against phantom IDs.

**Bypass possible?** No. `violationCount` is monotonically incrementing and only incremented by `flagViolation()` which requires `ORACLE_ROLE`. A signer cannot manufacture a valid violationId.

### 4.2 GATE B — Post-Trigger Lock

```solidity
require(!record.triggered, "Kernel: trigger already activated");
```

Once `record.triggered` is set to `true` by `_activateTrigger()`, no further signatures can be accepted. `record.triggered` is:
- Set to `false` at violation creation
- Set to `true` at trigger activation
- **Never reset to `false`** — no function in any production contract writes `record.triggered = false`

**Bypass possible?** No. `record.triggered` is monotonically `false → true`. No function reverses it.

**Consequence:** The final `signaturesCount` at trigger time is permanently preserved. It can never increase beyond its value at the moment `triggered` became `true`.

### 4.3 GATE C — Per-Address Deduplication

```solidity
require(!violationSignatures[violationId][msg.sender], "Kernel: already signed");
// ...
violationSignatures[violationId][msg.sender] = true;
```

A two-field key `(violationId, msg.sender)` is checked and set atomically within the same transaction. The check requires the current value to be `false`; the assignment sets it to `true`. This pattern is standard replay protection.

**Can the flag ever be reset?** No. The value `violationSignatures[id][addr]` is:
- Initialized to `false` by EVM default storage
- Set to `true` once in `signViolation()` (line 299)
- **Never reset** — no function in any production contract writes `violationSignatures[id][addr] = false`

**Bypass via role revoke-and-regrant?** No. If `COURT_ROLE` is revoked from `addr` and later regranted, `violationSignatures[id][addr]` remains `true`. Any subsequent attempt to call `signViolation(id)` as `addr` hits GATE C and reverts with "already signed". The signature flag is bound to the address, not to the role.

### 4.4 GATE D — Double-Activation Guard (internal)

```solidity
// Inside _activateTrigger()
require(!record.triggered, "Kernel: already triggered");
record.triggered = true;
```

This is a second-layer guard inside `_activateTrigger()` itself. Even if somehow `_activateTrigger()` were called twice for the same violation (impossible via the external path, but defensive), the second call reverts.

### 4.5 Threshold Gate

```solidity
if (record.signaturesCount >= MULTISIG_THRESHOLD) {
    record.courtConfirmed = true;
    _activateTrigger(violationId);
}
```

This is the exclusive gate to `_activateTrigger()`. `_activateTrigger()` is `internal` — it has no external entry point. The only way to reach it is through this `if` block inside `signViolation()`, which is only reachable after GATE A+B+C all pass and `signaturesCount` reaches 7.

**Is `_activateTrigger()` reachable any other way?** No. Grep confirms the only call to `_activateTrigger()` is at kernel.sol line 307, inside `signViolation()`. It is declared `internal`.

---

## 6. Attack Surface Evaluation

### 5.1 Can `signaturesCount` reach 7 with fewer than 7 distinct signers?

**No.** Each call to `signViolation()` that increments `signaturesCount` must pass GATE C: `require(!violationSignatures[violationId][msg.sender])`. Since `violationSignatures[id][addr]` is set to `true` on first sign and never reset, the same address can contribute at most 1 to `signaturesCount` per violationId, regardless of how many times it calls `signViolation()`.

For `signaturesCount` to reach 7, exactly 7 distinct addresses must have called `signViolation(violationId)` and passed GATE C. This is a mathematical certainty given the deduplication logic.

### 5.2 Can a signer sign after role is revoked?

**No.** The `onlyCourt` modifier checks `hasRole(COURT_ROLE, msg.sender)` at call time. If COURT_ROLE is revoked before signing, the call reverts at the modifier — before reaching any gate.

**Edge case:** A signer whose role is revoked mid-sequence (after signing but before reaching threshold) still has their signature counted. `violationSignatures[id][addr]` remains `true` even if the addr no longer holds COURT_ROLE. This is correct behavior — the signature was validly collected when the signer held the role.

### 5.3 Can a previously signed violation be re-opened for new signatures?

**No.** Once triggered (`record.triggered = true`), GATE B permanently blocks all new `signViolation()` calls for that violationId. The violation record is immutable post-trigger.

### 5.4 Can a violation's ID be reused?

**No.** `violationCount` is a monotonically incrementing `uint256`. It starts at 0 (constructor) and is only incremented by `flagViolation()`. Each call to `flagViolation()` produces a unique ID. IDs are never reused, recycled, or reset.

### 5.5 Can `signaturesCount` overflow?

**Theoretical concern:** `signaturesCount` is `uint8` (max 255). If 255 distinct COURT_ROLE holders signed before the trigger fired (impossible in practice; trigger fires at 7), the counter would stop incrementing at 255 (Solidity 0.8.x reverts on overflow).

**In practice:** The trigger fires when `signaturesCount >= 7`. After that, GATE B blocks all further signatures. The counter can never reach 8 post-trigger, let alone 255. No overflow risk.

### 5.6 Can the offender sign their own violation?

**Technically yes.** There is no check in `signViolation()` preventing `msg.sender == record.offender`. If the offender holds COURT_ROLE at the time of signing, they can sign violation records targeting themselves.

**Impact:** Signing their own violation only contributes to reaching the 7-of-9 threshold faster. It does not help the offender avoid execution — they are still the target of `_activateTrigger()`, and their COURT_ROLE is revoked by `_revokeOfficialAccess()` once triggered.

**Classification:** Non-blocking edge case. Not a threshold bypass.

### 6.7 The `AccessControl.grantRole()` Inherited Path — Authority-Capture Risk

`IranOS_Kernel` inherits from OpenZeppelin `AccessControl`. The inherited `grantRole(role, account)` is callable by any `DEFAULT_ADMIN_ROLE` holder (the Sovereign). This function:
- Does NOT go through `grantOfficialAccess()`
- Does NOT enforce the `notLocked` modifier
- Is not explicitly overridden in `IranOS_Kernel`

**Does this bypass the 7-distinct-address threshold?** No. The counting logic is not circumvented. Each controlled address contributes at most 1 signature per violationId.

**Does this enable unilateral trigger activation by the Sovereign?** **Yes.** The Sovereign can create 7 controlled addresses, grant each `COURT_ROLE` (via the inherited path, bypassing `notLocked`), and have all 7 sign any violation — including one flagged by a Sovereign-controlled oracle address. This satisfies the 7-distinct-address threshold entirely through controlled proxies.

**Classification (corrected from v1.0.0):** **Current high-impact authority-capture risk.** This is not a duplicate-signature bug. This is not a threshold-counting bug. This is a role-administration / signer-independence gap that allows effective unilateral trigger activation by the Sovereign. The gap is available in the current deployed contract with no additional preconditions.

See §2 (Critical Distinction) and Scenario G (§7) for full analysis.

---

## 7. Adversarial Scenarios

### Scenario A — Court Member Attempts Duplicate Signature

**Setup:** Court member at address `0xCCC` signs violation #1 (`signaturesCount` goes from 2 to 3). Attempts to sign again immediately.

**Trace:**
```
Call 1: signViolation(1) from 0xCCC
  GATE A: timestamp > 0 ✓
  GATE B: !triggered ✓ (count = 2)
  GATE C: !violationSignatures[1][0xCCC] ✓ (was false)
  → violationSignatures[1][0xCCC] = true
  → signaturesCount = 3

Call 2: signViolation(1) from 0xCCC
  GATE A: ✓
  GATE B: ✓ (count = 3, not yet triggered)
  GATE C: !violationSignatures[1][0xCCC] → FALSE (now true)
  → REVERTS: "Kernel: already signed"
```

**Outcome:** Revert on second attempt. `signaturesCount` remains 3. State unchanged.

---

### Scenario B — Signer Whose COURT_ROLE is Revoked After Signing

**Setup:** Address `0xDDD` signs violation #1 at count=4 (count becomes 5). Sovereign then calls `grantOfficialAccess()` to revoke another official's access (via `_revokeOfficialAccess` indirectly), or calls revoke on `0xDDD`.

**Trace:**
```
Before revocation: violationSignatures[1][0xDDD] = true, signaturesCount = 5
Sovereign revokes COURT_ROLE from 0xDDD.
  → hasRole(COURT_ROLE, 0xDDD) = false
  → violationSignatures[1][0xDDD] remains true

5 more court members attempt to sign (6th through 10th):
  - 6th (0xEEE): GATE C passes (never signed) → count = 6
  - 7th (0xFFF): GATE C passes → count = 7 → TRIGGER FIRES
```

**Note:** `0xDDD`'s signature remains counted even after their role was revoked. This is correct — the signature was validly collected when the role was held. The threshold is still met by 7 distinct addresses (5 from the original set minus 0xDDD, plus 3 new ones including 0xDDD's replacement, plus 0xDDD's original signature that persists). Actually — all counts are permanent; revoking a role does not remove a counted signature.

**Outcome:** Threshold still correctly requires 7 cumulative distinct signatures. Role revocation does not retroactively remove a signature from the count.

---

### Scenario C — Attempt to Sign After Trigger Fires

**Setup:** Violation #1 reaches `signaturesCount = 7`. Trigger fires. 8th court member attempts to sign.

**Trace:**
```
After 7th signature: triggered = true

Call: signViolation(1) from 8th court member
  GATE A: ✓
  GATE B: !record.triggered → FALSE (now true)
  → REVERTS: "Kernel: trigger already activated"
```

**Outcome:** Post-trigger signatures impossible. Final count is permanently preserved at its triggered value.

---

### Scenario D — Replay Attack via New ViolationId for Same Offender

**Setup:** Offender's violation #1 was triggered. Oracle flags a new violation #2 for the same offender.

**Trace:**
```
flagViolation(code, offender, reason2) → creates violations[2] with signaturesCount=0, triggered=false
→ violationSignatures[2][any_signer] starts as false (fresh mapping slot)
→ 7 court members must sign again for #2
```

**Outcome:** Each violation ID has an independent signature set. There is no replay of the old signatures to trigger a new violation. The court must independently sign each new violation.

---

### Scenario E — Sovereign Expands Court During Emergency Lock via Inherited `grantRole()`

**Setup:** TR-01 violation flagged. Emergency lock active. Sovereign calls `AccessControl.grantRole(COURT_ROLE, newAddr)` directly (bypassing `grantOfficialAccess`'s `notLocked` check).

**Trace:**
```
emergencyLockActive = true
Sovereign calls: AccessControl.grantRole(COURT_ROLE, newAddr)
  → No notLocked check (inherited OZ function, not overridden)
  → hasRole(COURT_ROLE, newAddr) = true
  → newAddr can now call signViolation()
```

**Impact on threshold:** None. The threshold is still 7. `newAddr` can still only contribute 1 signature per violationId.

**Impact on emergency lock semantics:** The intent of `notLocked` on `grantOfficialAccess` is to freeze role changes during a crisis. The inherited `grantRole()` bypasses this intent for COURT_ROLE. The Sovereign could potentially stack favorable court members to reach threshold faster during an emergency.

**Classification:** Governance trust gap. Not a code-level threshold bypass. Requires Sovereign betrayal. Noted as a forward-looking architectural risk.

---

### Scenario G — Sovereign Authority Capture via Controlled Signer Pool

**Setup:** The Sovereign controls addresses `0xC01` through `0xC07` (7 EOA accounts or contracts under Sovereign control). The Sovereign also controls address `0xOR1` (a controlled oracle).

**Goal:** Activate trigger against an arbitrary `offender` without genuine court participation.

**Trace:**
```
Pre-condition: No emergency lock active.

Step 1 — Establish controlled oracle:
  Sovereign calls: grantOfficialAccess(0xOR1, ORACLE_ROLE)
    → hasRole(ORACLE_ROLE, 0xOR1) = true

Step 2 — Establish controlled court pool:
  Sovereign calls grantOfficialAccess(0xC01..0xC07, COURT_ROLE) [7 calls]
  OR
  Sovereign calls AccessControl.grantRole(COURT_ROLE, 0xC01..0xC07) [inherited path]
    → hasRole(COURT_ROLE, 0xC01..0xC07) = true (7 addresses)

Step 3 — Flag violation via controlled oracle:
  0xOR1 calls: flagViolation(code, offender, reason)
    → ORACLE_ROLE check: passes (0xOR1 has ORACLE_ROLE)
    → violations[1] created: signaturesCount=0, triggered=false
    → if code ≤ 3: emergencyLockActive = true

Step 4 — Sign via controlled court pool (7 transactions):
  0xC01 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 1
  0xC02 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 2
  0xC03 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 3
  0xC04 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 4
  0xC05 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 5
  0xC06 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 6
  0xC07 calls: signViolation(1) → GATE A/B/C pass → signaturesCount = 7
    → signaturesCount >= MULTISIG_THRESHOLD (7)
    → record.courtConfirmed = true
    → _activateTrigger(1) fires
    → offender's roles revoked; TriggerProtocol.executeTrigger() called

Result: Trigger activated. All gates passed. No counting rule violated.
        The 7-distinct-address invariant holds.
        No genuinely independent court authority participated.
```

**Does any gate prevent this?**

| Gate | Status | Reason |
|---|---|---|
| GATE A (violation exists) | PASSES | Oracle legitimately created violation |
| GATE B (not triggered) | PASSES | First trigger attempt |
| GATE C (no duplicate) | PASSES | 7 distinct addresses; each signs once |
| Threshold gate (≥ 7) | PASSES | Exactly 7 addresses signed |
| GATE D (double-trigger) | PASSES | First activation |
| `onlyCourt` modifier | PASSES | All 7 addresses hold COURT_ROLE |
| `onlyOracle` modifier | PASSES | 0xOR1 holds ORACLE_ROLE |

**All gates pass. No code-level bypass occurs. The trigger fires correctly by the rules of the contract — but effective control was exercised by a single actor (the Sovereign).**

**Classification:** Current high-impact authority-capture risk. Role-administration / signer-independence gap. Not prevented by the counting architecture.

---

### Scenario F — `_activateTrigger()` Called Twice (Internal Double-Trigger)

**Setup:** Somehow `_activateTrigger()` is called twice for the same violationId. (This is currently impossible via the external call path but evaluated defensively.)

**Trace:**
```
First call to _activateTrigger(1):
  GATE D: !record.triggered ✓ (was false)
  → record.triggered = true

Second call to _activateTrigger(1):
  GATE D: !record.triggered → FALSE (now true)
  → REVERTS: "Kernel: already triggered"
```

**Outcome:** Defensive double-trigger guard holds. Even if the external path to `_activateTrigger()` were somehow duplicated, the internal guard prevents double-execution.

---

## 8. Proof of Threshold Enforcement

**Claim:** `violations[id].triggered == true` implies `violations[id].signaturesCount >= 7` and 7 distinct addresses contributed to that count.

**Proof by code trace:**

```
Precondition: violations[id].triggered == true

The ONLY assignment that sets triggered = true is at kernel.sol line 322:
  record.triggered = true
inside _activateTrigger(violationId).

_activateTrigger() is an internal function. The ONLY external path that
reaches it is inside signViolation() at lines 305-308:
  if (record.signaturesCount >= MULTISIG_THRESHOLD) {
      record.courtConfirmed = true;
      _activateTrigger(violationId);
  }

Therefore: triggered == true → signaturesCount reached >= 7 at the
moment this block executed.

Now prove signaturesCount is the count of distinct signers:

signaturesCount is initialized to 0 at violation creation (line 270).
It is incremented by 1 at line 300, unconditionally, whenever signViolation()
passes GATES A+B+C for any violationId.

GATE C (line 297) requires:
  !violationSignatures[violationId][msg.sender]
and line 299 sets:
  violationSignatures[violationId][msg.sender] = true

These two lines are in the same transaction, with no external calls between
them that could re-enter (protected by nonReentrant). The EVM executes
transactions atomically — no concurrent modification is possible.

Therefore: each increment of signaturesCount corresponds to a unique
(violationId, msg.sender) pair that has not been seen before for this
violationId.

A unique (violationId, msg.sender) pair that passed onlyCourt implies
msg.sender held COURT_ROLE at the time of signing (hasRole checked in modifier).

Therefore: signaturesCount counts the number of distinct COURT_ROLE-holding
addresses that called signViolation(violationId) and passed GATE C.

Combined: triggered == true ↔ at least 7 distinct COURT_ROLE holders
signed the violation.
```

**QED.** The 7-distinct-address threshold invariant is enforced by architecture with no known bypass at the counting layer.

**Note on scope:** This proof establishes that `signaturesCount >= 7` and each increment came from a distinct address. It does not establish, and cannot establish, that those distinct addresses represent independent court authorities. The independence property requires constraints on role administration that do not currently exist in the contract.

---

## 9. Risk Rating

### Risk by Category

| Risk Category | Rating | Basis |
|---|---|---|
| Trigger with < 7 signatures (counting bypass) | NONE | Threshold gate is the exclusive path to `_activateTrigger()`; architecturally impossible |
| Duplicate signature counting | NONE | Per-address deduplication flag is permanent; never reset |
| Replay attack | NONE | `violationSignatures[id][addr]` is write-once-true; no reset function exists |
| Signature via role replacement | NONE | Flag persists through role revoke/regrant cycles |
| State reset bypass | NONE | No function resets `signaturesCount` or `violationSignatures` |
| Post-trigger re-signing | NONE | GATE B permanently blocks; `triggered` is monotonically `false→true` |
| violationId collision | NONE | `violationCount` monotonically increments; IDs never reused |
| `signaturesCount` overflow | NONE (theoretical) | Trigger fires at 7; post-trigger GATE B prevents further increments |
| Offender self-signing | LOW (edge case) | Allowed; does not help avoid execution; not a counting bypass |
| **Authority capture via admin-controlled signer pool** | **HIGH (current)** | Sovereign can grant COURT_ROLE + ORACLE_ROLE to controlled addresses; satisfies 7-distinct-address threshold through proxies; effective unilateral trigger activation |
| Inherited `grantRole()` bypassing `notLocked` | MEDIUM | Enables role grants during emergency lock; root enabler of authority-capture path |

### Risk Classification for Authority-Capture Finding

- **Category:** Role-administration / signer-independence gap
- **Current or forward-looking:** CURRENT — no preconditions beyond Sovereign key control
- **Is this a duplicate-signature bug?** NO — counting logic is correct
- **Is this a threshold-counting bug?** NO — MULTISIG_THRESHOLD = 7 is enforced as designed
- **What fails:** The assumption that 7 distinct addresses implies 7 independent authorities
- **Who can exploit:** Only the Sovereign (`DEFAULT_ADMIN_ROLE` holder)
- **Impact if exploited:** Unilateral trigger activation against any target

### Overall Rating: **HIGH** (revised from LOW in v1.0.0)

The 7-distinct-address threshold counting is one of the most thoroughly enforced properties in the system. However, the authority-independence property — which is the constitutional purpose of the threshold — is not enforced. The Sovereign can satisfy the counting requirement through controlled proxies.

---

## 10. Recommended Invariant Harness Design

### Why INV-04 harness is more complex than INV-01/02/03

INV-01/02 (PahlaviToken) — harness grants itself all roles via constructor parameter.
INV-03 (TriggerProtocol) — harness tests callers that are NOT the kernel.
INV-04 (Kernel multisig) — harness must simulate **multiple distinct signers** with different `msg.sender` values.

Echidna calls all public harness functions as `address(this)`. To simulate 9 distinct court members signing, the harness must deploy 9 separate helper contracts — each with its own address — and grant `COURT_ROLE` to each.

### Harness Architecture

```
FuzzKernelMultisig (harness)
├── IranOS_Kernel (deployed with harness as sovereign+oracle+swf)
├── MockTriggerProtocol (minimal, accepts executeTrigger())
├── CourtHelper[0..8] (9 instances, each with COURT_ROLE on Kernel)
└── Property: echidna_trigger_requires_threshold
```

### CourtHelper contract (stub)

```solidity
// TEST-ONLY — not deployed to production
contract CourtHelper {
    IranOS_Kernel public kernel;
    constructor(address _kernel) {
        kernel = IranOS_Kernel(_kernel);
    }
    // Called by harness to simulate this court member signing
    function sign(uint256 violationId) external {
        kernel.signViolation(violationId);
    }
}
```

Each `CourtHelper` instance has its own address. When `sign(id)` is called, `msg.sender` = the helper's address (which has COURT_ROLE). This gives 9 independently-addressable court signers.

### Harness skeleton

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// TEST-ONLY HARNESS — DO NOT DEPLOY TO PRODUCTION
// Invariant: INV-04 — Multisig Threshold Preservation

import "../../contracts/kernel.sol";

contract MockTriggerProtocolForKernel {
    uint256 public executionCount;
    function executeTrigger(uint256, address, uint8, address)
        external returns (uint256) {
        return ++executionCount;
    }
}

contract CourtHelper {
    IranOS_Kernel public kernel;
    constructor(address _kernel) { kernel = IranOS_Kernel(_kernel); }
    function sign(uint256 violationId) external {
        kernel.signViolation(violationId);
    }
}

contract FuzzKernelMultisig {
    IranOS_Kernel             public kernel;
    MockTriggerProtocolForKernel public mockTrigger;
    CourtHelper[9]            public courts;

    address internal constant MOCK_SWF = address(0x9999);

    constructor() {
        mockTrigger = new MockTriggerProtocolForKernel();
        // Deploy 9 court helpers BEFORE Kernel (need their addresses)
        for (uint i = 0; i < 9; i++) {
            courts[i] = new CourtHelper(address(0)); // placeholder
        }
        // Deploy Kernel: harness is sovereign and oracle; court[0] is initial court
        kernel = new IranOS_Kernel(
            address(this),        // sovereign (harness)
            address(courts[0]),   // initial court member
            address(this),        // oracle (harness)
            MOCK_SWF
        );
        // Update all CourtHelper kernel references
        for (uint i = 0; i < 9; i++) {
            courts[i] = new CourtHelper(address(kernel));
        }
        // Grant COURT_ROLE to all 9 helpers
        bytes32 COURT_ROLE = kernel.COURT_ROLE();
        for (uint i = 0; i < 9; i++) {
            kernel.grantOfficialAccess(address(courts[i]), COURT_ROLE);
        }
        // Wire up mock TriggerProtocol
        kernel.setTriggerProtocol(address(mockTrigger));
    }

    // ─── Fuzz entry points ───────────────────────────────────────────

    // Oracle flags a violation
    function doFlagViolation(uint8 code, address offender) public {
        uint8 safeCode = (code % 6) + 1; // bound to 1-6
        if (offender == address(0)) return;
        try kernel.flagViolation(safeCode, offender, "fuzz") {} catch {}
    }

    // Each court member signing (9 distinct msg.sender values via helpers)
    function doCourtSign0(uint256 vid) public { try courts[0].sign(vid) {} catch {} }
    function doCourtSign1(uint256 vid) public { try courts[1].sign(vid) {} catch {} }
    function doCourtSign2(uint256 vid) public { try courts[2].sign(vid) {} catch {} }
    function doCourtSign3(uint256 vid) public { try courts[3].sign(vid) {} catch {} }
    function doCourtSign4(uint256 vid) public { try courts[4].sign(vid) {} catch {} }
    function doCourtSign5(uint256 vid) public { try courts[5].sign(vid) {} catch {} }
    function doCourtSign6(uint256 vid) public { try courts[6].sign(vid) {} catch {} }
    function doCourtSign7(uint256 vid) public { try courts[7].sign(vid) {} catch {} }
    function doCourtSign8(uint256 vid) public { try courts[8].sign(vid) {} catch {} }

    // ─── Echidna invariant properties ────────────────────────────────

    /// INV-04a: Any triggered violation must have signaturesCount >= 7.
    /// Expected: always true.
    function echidna_trigger_requires_threshold() public view returns (bool) {
        uint256 count = kernel.violationCount();
        for (uint256 i = 1; i <= count; i++) {
            (,,,, bool courtConfirmed, uint8 sigs, bool triggered) =
                _getViolation(i);
            if (triggered && sigs < 7) return false;
            if (triggered && !courtConfirmed) return false;
        }
        return true;
    }

    /// INV-04b: signaturesCount for a triggered violation equals the number
    ///   of distinct signers — verified by checking the signature map.
    ///   (Simplified: no single court helper can trigger alone.)
    function echidna_no_single_signer_can_trigger() public view returns (bool) {
        uint256 count = kernel.violationCount();
        for (uint256 i = 1; i <= count; i++) {
            (,,,,,, bool triggered) = _getViolation(i);
            if (!triggered) continue;
            // Verify: for any triggered violation, at minimum 7 distinct helpers signed
            uint8 distinctSigners = 0;
            for (uint j = 0; j < 9; j++) {
                if (kernel.violationSignatures(i, address(courts[j]))) {
                    distinctSigners++;
                }
            }
            if (distinctSigners < 7) return false;
        }
        return true;
    }

    function _getViolation(uint256 id) internal view returns (
        uint8 code, address offender, string memory reason,
        uint256 ts, bool confirmed, uint8 sigs, bool triggered
    ) {
        IranOS_Kernel.ViolationRecord memory v = kernel.getViolation(id);
        return (v.violationCode, v.offender, v.reason,
                v.timestamp, v.courtConfirmed, v.signaturesCount, v.triggered);
    }
}
```

### Expected Echidna results

| Property | Expected result | Tests |
|---|---|---|
| `echidna_trigger_requires_threshold` | PASSING | Duplicate-signature rejection; counting correctness |
| `echidna_no_single_signer_can_trigger` | PASSING | Address-distinctness enforcement |
| `echidna_admin_capture_possible` (new) | **FAILING** | Demonstrates authority-capture gap (Sovereign grants all COURT_ROLE) |

### Additional harness property for authority-capture testing

```solidity
/// INV-04c: Authority-capture property — EXPECTED TO FAIL.
/// Demonstrates that the Sovereign (harness itself, holding DEFAULT_ADMIN_ROLE)
/// can grant COURT_ROLE to 7 controlled addresses and trigger activation.
/// A FAILING result here is the correct finding — it confirms the gap.
function echidna_no_admin_capture() public view returns (bool) {
    uint256 count = kernel.violationCount();
    for (uint256 i = 1; i <= count; i++) {
        (,,,,,, bool triggered) = _getViolation(i);
        if (!triggered) continue;
        // Check: were all signers granted COURT_ROLE by the harness (sovereign)?
        // If the harness was able to produce a triggered violation using only
        // addresses it controls (courts[0..8]), that demonstrates the capture gap.
        uint8 harnessControlledSigners = 0;
        for (uint j = 0; j < 9; j++) {
            if (kernel.violationSignatures(i, address(courts[j]))) {
                harnessControlledSigners++;
            }
        }
        // If all 7 signatures came from harness-controlled court helpers,
        // the trigger was achieved through admin-controlled proxies alone.
        if (harnessControlledSigners >= 7) return false; // CAPTURE DEMONSTRATED
    }
    return true;
}
```

**Expected result:** FAILING (the harness controls all CourtHelpers; it will naturally use them to sign; this is the correct finding — the capture path is real and exercisable.)

### Implementation notes

- The harness is more complex than INV-01/02 because distinct `msg.sender` values require distinct deployer contracts (CourtHelpers).
- `ViolationRecord` is a public struct returned by `getViolation()` — accessible without modification to the Kernel.
- `violationSignatures(uint256, address)` is a public mapping — accessible directly.
- The constructor's circular dependency (CourtHelper needs Kernel address; Kernel constructor needs CourtHelper address) requires deploying CourtHelpers twice or using a two-phase init. The sketch above shows the pattern; a cleaner implementation would use a `setKernel()` on CourtHelper.
- This harness requires the Kernel to be deployed with `address(this)` as sovereign, which grants the harness `notLocked`-exempt DEFAULT_ADMIN_ROLE. This is an intentional harness-only privilege.
- The `echidna_no_admin_capture` property is intentionally expected to FAIL — its failure demonstrates the authority-capture gap rather than a harness error.

---

## 11. Follow-up Recommendations

The following recommendations address the authority-capture gap. They are recorded here for governance consideration. No production code changes are made in this document.

### R-01: Fixed Court Roster or Independent Court Registry

Replace the Sovereign's unilateral ability to add `COURT_ROLE` holders with a process that requires independent confirmation. Options:

- **Fixed roster at deployment:** Include all 9 court member addresses in the constructor; make `COURT_ROLE` non-grantable after deployment by removing the ability to call `grantOfficialAccess` for `COURT_ROLE` post-deploy.
- **Independent court registry:** A separate `CourtRegistry` contract controlled by a multisig of existing court members (not the Sovereign) manages court membership changes. `grantOfficialAccess` for `COURT_ROLE` requires CourtRegistry approval before the Kernel executes it.

### R-02: Constraints on COURT_ROLE Grants

Add a check in `grantOfficialAccess()` that limits the total number of `COURT_ROLE` holders, or requires existing court member supermajority approval before a new member is added. This prevents a Sovereign from expanding the court roster to include controlled addresses.

### R-03: Emergency-Lock Restriction on Role Grants

Override `grantRole()` in `IranOS_Kernel` to enforce `notLocked`:

```solidity
function grantRole(bytes32 role, address account)
    public
    override
    notLocked
{
    super.grantRole(role, account);
}
```

This prevents the Sovereign from expanding the court roster during an active emergency lock via the inherited OZ path — closing the most acute form of the capture gap (where the Sovereign uses a crisis to consolidate control).

### R-04: Separate Governance Process for Court Membership

Require that `COURT_ROLE` grants go through the `ConstitutionGuard.proposeLaw()` → court-approval flow rather than a direct Sovereign administrative action. This introduces a deliberation layer before any court roster change takes effect.

### R-05: Echidna Harness Enhancement

A future Echidna harness for INV-04 should test **both** sub-invariants explicitly:

| Property | Expected result | What it tests |
|---|---|---|
| `echidna_trigger_requires_threshold` | PASSING | Duplicate-signer rejection; counting correctness |
| `echidna_no_single_signer_can_trigger` | PASSING | Address-distinctness at the counting layer |
| `echidna_no_admin_capture` | **FAILING** (demonstrates gap) | Signer-independence / authority-capture |

The `FAILING` result on `echidna_no_admin_capture` is the correct outcome: it documents the gap for governance consideration rather than claiming the system is secure against it.

---

## 12. Findings Summary

### Question 1: Trigger execution with fewer than 7 distinct address signatures?

**IMPOSSIBLE.** `_activateTrigger()` is `internal` and reachable only through the `signaturesCount >= MULTISIG_THRESHOLD` gate inside `signViolation()`. GATE C ensures each address contributes at most 1 increment. The counting architecture has no known bypass.

### Question 2: Duplicate signatures counting multiple times?

**IMPOSSIBLE.** The `violationSignatures[id][addr]` mapping is set to `true` on first sign and never reset. GATE C rejects any second attempt from the same address with an unconditional revert.

### Question 3: Threshold bypass through replay, replacement, reset, overwrite, or state transition?

| Method | Possible? | Reason |
|---|---|---|
| Replay (same address, same violation) | NO | GATE C: flag persists; revert on re-entry |
| Replacement (revoke+regrant role to same address) | NO | Flag bound to address, not role; persists through role cycle |
| Reset (clear signaturesCount) | NO | No function resets signaturesCount after initialization |
| Overwrite (write to signaturesCount externally) | NO | Only written in kernel.sol; no external contract writes to it |
| State transition (triggered = false) | NO | triggered is monotonically false→true; no function reverses it |
| Role expansion via inherited `grantRole()` | PARTIAL | Does not bypass counting; root enabler of authority-capture path |
| Offender self-signing | EDGE CASE | Allowed; contributes to threshold; does not help offender avoid execution |
| **Authority capture via Sovereign-controlled signer pool** | **YES** | Sovereign grants ORACLE_ROLE + COURT_ROLE to controlled addresses; satisfies 7-distinct-address requirement through proxies |

### Question 4: Can a single actor unilaterally satisfy the 7-of-9 threshold?

**YES — through authority capture.** The Sovereign can grant `ORACLE_ROLE` and `COURT_ROLE` to 7+ addresses under their control, flag a violation via the controlled oracle, and have all 7 controlled addresses sign. All gates pass. The trigger fires. No counting rule is violated. This constitutes effective unilateral execution by the Sovereign through controlled proxies.

**This corrects the v1.0.0 claim** that "no individual — including the Sovereign — can unilaterally execute constitutional enforcement." That claim was incorrect at the authority layer. The correct statement is: **no single address can satisfy the 7-distinct-address threshold alone. However, a single controlling actor can orchestrate 7 distinct controlled addresses to satisfy it.**

### INV-04 as a 7-distinct-address invariant: HOLDS

The counting invariant — that any triggered violation required 7 distinct `msg.sender` values each holding `COURT_ROLE` at signing time — is fully enforced by the code with no bypass.

### INV-04 as a 7-independent-authority invariant: DOES NOT HOLD

The independence invariant — that those 7 addresses represent 7 genuinely independent authorities not controlled by a single actor — is not enforced by the contract. The role administration system permits authority capture.

### Production code changes required?

None for counting correctness. For independence enforcement, see §11 (Follow-up Recommendations). The authority-capture gap requires governance-layer changes (fixed court roster, independent registry, or `grantRole` override with `notLocked`) to close.

### Files examined for this audit

`contracts/kernel.sol` (complete), `contracts/core/TriggerProtocol.sol`, `contracts/monetary/Treasury.sol` (multisig pattern comparison), `contracts/monetary/SovereignWealthFund.sol` (multisig pattern comparison). Grep across all 25 contracts confirmed no external writes to violation state.

---

*This document is analysis only. No production code, test code, deployment scripts, CI configuration, or doctrine was modified. No production readiness, external audit completion, formal verification completion, or Step 12 blocker closure is claimed.*
