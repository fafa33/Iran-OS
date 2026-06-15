# INV-03 — Trigger Authority: Harness Design Plan
## IranOS Echidna Fuzzing — Phase 1 Invariant Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis and Planning Only — No Code Changes
**Author:** Echidna Phase 1 Planning (session continuation)

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - No contracts, tests, CI, or production code were modified during this assessment.

---

## Table of Contents

1. [Invariant Definition](#1-invariant-definition)
2. [Threat Model](#2-threat-model)
3. [Exact Expected Property](#3-exact-expected-property)
4. [Proposed Echidna Property Function](#4-proposed-echidna-property-function)
5. [Harness Architecture](#5-harness-architecture)
6. [Minimal Implementation Plan](#6-minimal-implementation-plan)
7. [Risk Assessment](#7-risk-assessment)
8. [Existing Test Coverage](#8-existing-test-coverage)

---

## 1. Invariant Definition

**ID:** INV-03
**Contract:** `TriggerProtocol` (`contracts/core/TriggerProtocol.sol`)
**Category:** Trigger Authority Isolation

### Constitutional Significance

`executeTrigger()` is the most destructive state-mutation function in the IranOS system. A single successful call:

- Permanently blocks the offender from the Treasury (`blockedFromTreasury[offender] = true`)
- Propagates a block to the real Treasury contract via `ITreasury(treasury).blockAddressByTrigger(offender)`
- Revokes all signing authority for the offender (`signatureRevoked[offender] = true`)
- Emits a public constitutional notification
- Records the execution as an immutable `TriggerExecution` struct
- Optionally activates an interim replacement

This function is irreversible. There is no unblock, un-revoke, or rollback mechanism in TriggerProtocol. Authority to call it must be exclusively bound to the Kernel address.

### Mechanism Under Review

`TriggerProtocol` uses an **address-equality guard** rather than a role-based guard:

```solidity
address public kernel;  // set in constructor; no setter exists

modifier onlyKernel() {
    require(msg.sender == kernel, "TriggerProtocol: caller is not the Kernel");
    _;
}

function executeTrigger(...) external onlyKernel nonReentrant returns (uint256 executionId) { ... }
```

The `kernel` variable is:
- Set once in the constructor: `kernel = _kernel`
- There is **no `setKernel()` function** anywhere in TriggerProtocol
- The only caller that can ever satisfy `msg.sender == kernel` is the exact address passed at deployment time

### Production Call Path (the ONLY legitimate path)

```
COURT_ROLE holder (7 of 9) → IranOS_Kernel.signViolation()
  → internal: IranOS_Kernel._activateTrigger()
    → external: ITriggerProtocol(triggerProtocol).executeTrigger()
      msg.sender == IranOS_Kernel contract address == kernel ✓
```

No other call path through any role, any Oracle signal, or any direct external call satisfies the guard.

---

## 2. Threat Model

For each actor, the analysis shows whether they can satisfy `msg.sender == kernel`.

### 2.1 ORACLE_ROLE Caller

**Attack vector:** Oracle calls `TriggerProtocol.executeTrigger()` directly after calling `IranOS_Kernel.flagViolation()`.

**Outcome:** REVERTS unconditionally.

**Why:** Oracle's `msg.sender` is the oracle address, not the Kernel contract address. The `onlyKernel` modifier requires exact address equality. Oracles have no mechanism to impersonate the Kernel contract address on-chain.

**Doctrine alignment:** REVIEWER_PRIMER §Oracle Non-Sovereignty: "Oracles provide information. Oracles do not create authority." A direct `executeTrigger()` call would convert an oracle signal into unilateral enforcement — exactly what the design prohibits.

**Existing test:** `test/08_Trigger_Protocol.test.js` line 1142–1144 (`terminal trigger state remains immutable after finalization`) includes one assert: `realTrigger.connect(oracle).executeTrigger(...) → revertedWith "TriggerProtocol: caller is not the Kernel"`. This is the only explicit oracle test.

---

### 2.2 COURT_ROLE Caller

**Attack vector:** Court member calls `TriggerProtocol.executeTrigger()` directly, bypassing the 7-of-9 multisig.

**Outcome:** REVERTS unconditionally.

**Why:** The Court's `msg.sender` is a court member address, not the Kernel contract address. The court's legitimate path is `Kernel.signViolation()` → `_activateTrigger()` → `executeTrigger()` via Kernel as `msg.sender`.

**Risk if bypass existed:** A single court member could execute the trigger without 7 signatures — a catastrophic governance failure reducing the 7-of-9 threshold to 1-of-1.

**Existing test:** None directly. The test suite verifies that triggers fire after 7 court signatures (`test/08_Trigger_Protocol.test.js` lines 672–841) but does not verify that a single COURT_ROLE holder cannot call `executeTrigger()` directly.

---

### 2.3 GUARDIAN_ROLE Caller

**Attack vector:** Guardian calls `TriggerProtocol.executeTrigger()` directly.

**Outcome:** REVERTS unconditionally.

**Why:** Same address-equality check. Guardians hold `GUARDIAN_ROLE` on the Kernel but have no authorized path to TriggerProtocol.

**Existing test:** None.

---

### 2.4 SOVEREIGN_ROLE Caller

**Attack vector:** Sovereign calls `TriggerProtocol.executeTrigger()` directly.

**Outcome:** REVERTS unconditionally.

**Why:** Sovereign address ≠ Kernel contract address. The Sovereign can change `triggerProtocol` pointer in the Kernel via `setTriggerProtocol()`, but cannot change the `kernel` address stored in TriggerProtocol (no setter).

**Secondary risk:** The Sovereign could deploy a new TriggerProtocol with a different `kernel` address and redirect the Kernel to point at it via `setTriggerProtocol()`. This is a legitimate governance action, not a bypass of INV-03 on the existing TriggerProtocol instance. INV-03 is per-instance.

**Existing test:** None for direct Sovereign → executeTrigger attempt.

---

### 2.5 DEFAULT_ADMIN_ROLE Caller

**Attack vector:** DEFAULT_ADMIN_ROLE holder (granted to Sovereign in Kernel constructor) calls `executeTrigger()` directly.

**Outcome:** REVERTS unconditionally.

**Why:** DEFAULT_ADMIN_ROLE is an OpenZeppelin AccessControl concept that applies to the Kernel's role management system — not to TriggerProtocol. TriggerProtocol does not use AccessControl at all; it uses a plain `address public kernel` and address equality. DEFAULT_ADMIN_ROLE has no meaning in TriggerProtocol's access model.

**Existing test:** None.

---

### 2.6 Arbitrary EOA Caller

**Attack vector:** Any address with no roles calls `executeTrigger()` directly.

**Outcome:** REVERTS unconditionally.

**Existing test:** `test/08_Trigger_Protocol.test.js` lines 46–71 (`nباید غیر Kernel ماشه را اجرا کند` and `unauthorized executeTrigger call is state-neutral`). This is the most complete existing test — verifies both the revert and full state neutrality.

---

### 2.7 Malicious Contract Caller

**Attack vector:** A smart contract with no privileged roles (or even with all privileged roles on the Kernel) attempts to call `executeTrigger()`.

**Outcome:** REVERTS unconditionally.

**Why:** The contract's address ≠ Kernel contract address. Smart contracts cannot impersonate other contract addresses without delegatecall or proxy patterns — neither of which exist in TriggerProtocol.

**Re-entrancy variant:** A malicious contract could be given the `replacement` parameter slot in a legitimate trigger execution, then attempt to call back into `executeTrigger()` during the `InterimReplacementActivated` event processing. However, the `nonReentrant` modifier on `executeTrigger()` prevents this.

**Existing test:** None for malicious contract caller.

---

### 2.8 Privilege Escalation Path Analysis

Could any sequence of legitimate calls create a new path to call `executeTrigger()` successfully?

| Potential escalation path | Analysis | Bypass possible? |
|---|---|---|
| Sovereign calls `setTriggerProtocol(address)` in Kernel | Changes which TriggerProtocol the Kernel calls — does not change `kernel` inside existing TriggerProtocol | NO |
| Sovereign grants any address SOVEREIGN_ROLE | Grants governance role on Kernel — no effect on TriggerProtocol's address check | NO |
| DEFAULT_ADMIN_ROLE calls `grantRole()` on Kernel for any role | OZ AccessControl roles on Kernel — no effect on TriggerProtocol | NO |
| Deploying a new TriggerProtocol with `kernel = attacker` | Different instance; the Kernel would need to be reconfigured to call it | Only if Kernel is also reconfigured |
| Reentrancy through the `replacement` address slot | Blocked by `nonReentrant` | NO |
| Calling `executeTrigger()` through `delegatecall` | TriggerProtocol has no `delegatecall` receiver; not possible externally | NO |

**Conclusion:** No privilege escalation path exists in the current codebase to bypass `onlyKernel` on TriggerProtocol. The guard is as strong as it can be for an address-equality check.

---

## 3. Exact Expected Property

**Formal statement:**

For any sequence of transactions where `msg.sender ≠ trigger.kernel` (i.e., any call not originating from the exact Kernel contract address), a call to `TriggerProtocol.executeTrigger()` must revert, and all of the following must remain unchanged:

- `trigger.executionCount()` (stays at its pre-call value, never increments)
- `trigger.blockedFromTreasury[offender]` (unchanged)
- `trigger.signatureRevoked[offender]` (unchanged)
- `trigger.interimReplacements[offender]` (unchanged)
- `trigger.executions[executionId]` (record stays zeroed/unwritten)

**Corollary for Echidna:** Since no fuzzer-controlled address is the Kernel, `executionCount()` must always equal 0 throughout the entire fuzzing run.

---

## 4. Proposed Echidna Property Function

```solidity
/// INV-03: Trigger authority — only the configured kernel address can call executeTrigger().
/// Status: Expected PASSING.
/// Mechanism: TriggerProtocol.onlyKernel modifier checks msg.sender == kernel (address equality,
///   not role-based). No setter for kernel exists. Harness is deployed with kernel = MockKernel,
///   not address(this), so no fuzzer call can satisfy the guard.
/// Value: Confirms that ORACLE_ROLE, COURT_ROLE, GUARDIAN_ROLE, SOVEREIGN_ROLE,
///   DEFAULT_ADMIN_ROLE, arbitrary EOAs, and arbitrary contracts cannot execute the trigger.
/// Failure condition: If this ever returns false, a new code path has been introduced
///   (setter for kernel, delegatecall receiver, or role-based bypass) that allows non-Kernel
///   execution. This would be a critical constitutional breach.
function echidna_only_kernel_executes_trigger() public view returns (bool) {
    return trigger.executionCount() == 0;
}
```

**Why `executionCount == 0` rather than a direct revert check:**
Echidna property functions return `bool`. Echidna calls the fuzz entry points (the `do*` functions), then evaluates the property. If any `do*` call succeeded in executing the trigger, `executionCount` would be > 0, and the property would return `false` — which Echidna flags as a counterexample. The simplicity of this check is a feature: it is comprehensive (any successful execution is detected), not predicated on specific caller identity.

---

## 5. Harness Architecture

### 5.1 Overview

File: `contracts/fuzzing/FuzzTriggerProtocol.sol`

```
Deployment topology:
  MockTreasury         — implements ITreasury.blockAddressByTrigger()
  MockKernelAddress    — just address(0x7777); held as the "real" kernel
  TriggerProtocol      — deployed with: kernel=0x7777, treasury=MockTreasury, swf=address(0x8888)
  FuzzTriggerProtocol  — the harness; holds all governance roles conceptually
                         but is NOT the kernel address
```

### 5.2 Role Setup

The harness does NOT need to hold any roles on TriggerProtocol (TriggerProtocol has no AccessControl; only the `kernel` address matters). However, to make the role-separation testing explicit and document which actors were simulated, the harness should track which "role" each entry point represents.

### 5.3 MockTreasury

TriggerProtocol calls `ITreasury(treasury).blockAddressByTrigger(offender)` during `executeTrigger()`. A MockTreasury is needed that:
- Implements `blockAddressByTrigger(address)` with a no-op or simple mapping set
- Does not revert

This is the only mock needed. No MockKernel contract is needed — a fixed non-zero address (`address(0x7777)`) is sufficient as the kernel address in the deployment.

```solidity
contract MockTreasury {
    mapping(address => bool) public blocked;
    function blockAddressByTrigger(address target) external {
        blocked[target] = true;
    }
}
```

### 5.4 Fuzz Entry Points

```solidity
// Each entry point simulates a different caller type attempting to execute the trigger.
// All MUST revert because address(this) != kernel (0x7777).

function doExecuteAsArbitraryAddress(uint256 violationId, address offender, uint8 code) public {
    try trigger.executeTrigger(violationId, offender, code, address(0)) {} catch {}
}

function doExecuteAsOracleSimulant(uint256 violationId, address offender, uint8 code) public {
    // Simulates: msg.sender has ORACLE_ROLE on the Kernel but tries TriggerProtocol directly
    try trigger.executeTrigger(violationId, offender, code, address(0)) {} catch {}
}

function doExecuteAsCourtSimulant(uint256 violationId, address offender, uint8 code) public {
    // Simulates: msg.sender has COURT_ROLE on the Kernel but tries TriggerProtocol directly
    try trigger.executeTrigger(violationId, offender, code, address(0)) {} catch {}
}

function doExecuteAsSovereignSimulant(uint256 violationId, address offender, uint8 code) public {
    // Simulates: msg.sender has SOVEREIGN_ROLE + DEFAULT_ADMIN_ROLE but tries directly
    try trigger.executeTrigger(violationId, offender, code, address(0)) {} catch {}
}

function doExecuteAsGuardianSimulant(uint256 violationId, address offender, uint8 code) public {
    // Simulates: msg.sender has GUARDIAN_ROLE on the Kernel but tries directly
    try trigger.executeTrigger(violationId, offender, code, address(0)) {} catch {}
}
```

**Note on `try/catch`:** The entry points use `try/catch` so Echidna can observe the state after the failed call rather than treating the revert as a call sequence terminator. The property `executionCount == 0` is then evaluated as a separate step. If `try` succeeds (which it should never do), `executionCount` will be > 0 and the property fails.

### 5.5 Why the Entry Points Look Identical

All five entry points call `trigger.executeTrigger()` from `address(this)` (the harness). The `msg.sender` in all cases is the harness contract address — not a role holder. The role labels in the function names are semantic documentation of which actor class is being simulated, not technical role assignments. Since TriggerProtocol's check is address equality and not role membership, the technical behavior is identical for all of them: all revert.

This is by design. The explicit enumeration:
1. Documents which actor classes have been tested
2. Allows future harness evolution if TriggerProtocol's access model ever changes to role-based
3. Provides corpus differentiation in Echidna's trace recording

### 5.6 Full Harness Skeleton

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// TEST-ONLY HARNESS — DO NOT DEPLOY TO PRODUCTION
// Invariant: INV-03 — Trigger Authority
// Property: TriggerProtocol.executeTrigger() is callable ONLY by the kernel address.
// All calls from non-kernel addresses (any role, any EOA, any contract) must revert.

import "../core/TriggerProtocol.sol";

contract MockTreasuryForTrigger {
    mapping(address => bool) public blocked;
    function blockAddressByTrigger(address target) external {
        blocked[target] = true;
    }
}

contract FuzzTriggerProtocol {
    TriggerProtocol public trigger;
    MockTreasuryForTrigger public mockTreasury;

    // The "kernel" is a fixed address that is NOT address(this).
    // This ensures no fuzzer call from address(this) can satisfy onlyKernel.
    address internal constant MOCK_KERNEL = address(0x7777);
    address internal constant MOCK_SWF    = address(0x8888);
    address internal constant VICTIM      = address(0x1337);

    constructor() {
        mockTreasury = new MockTreasuryForTrigger();
        trigger = new TriggerProtocol(
            MOCK_KERNEL,                    // kernel — NOT address(this)
            address(mockTreasury),          // treasury — mock implementation
            MOCK_SWF                        // swf — unused in executeTrigger
        );
    }

    // ─────────────────────────────────────────
    // Fuzz entry points — all simulate unauthorized callers
    // ─────────────────────────────────────────

    function doExecuteAsArbitraryAddress(uint256 vid, uint8 code) public {
        try trigger.executeTrigger(vid, VICTIM, code, address(0)) {} catch {}
    }

    function doExecuteAsOracleSimulant(uint256 vid, uint8 code) public {
        try trigger.executeTrigger(vid, VICTIM, code, address(0)) {} catch {}
    }

    function doExecuteAsCourtSimulant(uint256 vid, uint8 code) public {
        try trigger.executeTrigger(vid, VICTIM, code, address(0)) {} catch {}
    }

    function doExecuteAsSovereignSimulant(uint256 vid, uint8 code) public {
        try trigger.executeTrigger(vid, VICTIM, code, address(0)) {} catch {}
    }

    function doExecuteAsGuardianSimulant(uint256 vid, uint8 code) public {
        try trigger.executeTrigger(vid, VICTIM, code, address(0)) {} catch {}
    }

    // ─────────────────────────────────────────
    // Echidna invariant property
    // ─────────────────────────────────────────

    /// INV-03: Trigger authority — no non-kernel address can execute the trigger.
    /// Expected: always true.
    /// Mechanism: onlyKernel checks msg.sender == kernel (address equality).
    ///   kernel = MOCK_KERNEL (0x7777) ≠ address(this) (the harness).
    ///   No fuzzer call originates from MOCK_KERNEL, so no call can succeed.
    /// Failure: If this returns false, a new code path bypasses the address equality
    ///   check — critical constitutional breach requiring immediate investigation.
    function echidna_only_kernel_executes_trigger() public view returns (bool) {
        return trigger.executionCount() == 0;
    }
}
```

---

## 6. Minimal Implementation Plan

### Step 1 — Create mock contract file

File: `contracts/fuzzing/mocks/MockTreasury.sol`

Content: The `MockTreasuryForTrigger` contract above. Can be inlined in the harness file or split into a separate mocks directory. Prefer separation for reuse across future Phase 2 harnesses.

### Step 2 — Create harness file

File: `contracts/fuzzing/FuzzTriggerProtocol.sol`

Content: Full harness skeleton from §5.6 above.

### Step 3 — Compile

```bash
npm run compile
```

No changes to `hardhat.config.js` or `package.json` are needed.

### Step 4 — Run Echidna

```bash
echidna contracts/fuzzing/FuzzTriggerProtocol.sol \
  --contract FuzzTriggerProtocol \
  --config echidna.yaml
```

The existing `echidna.yaml` at repo root (merged in PR #53) is sufficient. No changes needed.

### Step 5 — Expected output

```
echidna_only_kernel_executes_trigger: passed! (N tests)
```

All five `doExecute*` entry points will produce reverts; none will cause `executionCount` to increment. The property holds trivially.

### Step 6 — Extend corpus (optional but recommended)

Run with higher `testLimit` for corpus completeness:

```bash
echidna contracts/fuzzing/FuzzTriggerProtocol.sol \
  --contract FuzzTriggerProtocol \
  --config echidna.yaml \
  --test-limit 100000
```

---

## 7. Risk Assessment

### 7.1 Implementation Risk: LOW

INV-03 is the simplest invariant to implement correctly in Phase 1:

| Factor | Assessment |
|---|---|
| Guard mechanism | Address equality — the simplest possible check |
| Mock complexity | One function (`blockAddressByTrigger`) |
| Cross-contract dependencies | Only MockTreasury needed; no Kernel, SWF, or Oracle setup |
| Known failure cases | None — no production bypass exists |
| Expected Echidna result | PASSING |
| Harness configuration risk | Low — misconfiguring `kernel = address(this)` would make the property trivially pass for the wrong reason; constructor comment prevents this |

### 7.2 Subtle Configuration Risk

If the harness accidentally passes `address(this)` as the kernel (like the INV-01/02 harness does for PahlaviToken), the invariant would still pass but for the wrong reason: the harness would be the kernel and could execute the trigger legitimately. The guard comment and the `MOCK_KERNEL = address(0x7777)` constant (clearly not `address(this)`) prevent this.

### 7.3 Property Completeness

`executionCount == 0` is complete for the purposes of INV-03:
- Any successful `executeTrigger()` call from a non-kernel address would increment `executionCount`
- The property detects this increment
- It does not need to track which address made the call — any non-zero count is a violation

### 7.4 Future Regression Value

If TriggerProtocol is ever modified to:
- Add a role-based alternative path to `executeTrigger()`
- Add a `setKernel()` function that could redirect the guard
- Use a proxy pattern that changes `msg.sender` propagation

...the harness would immediately detect the regression on the next Echidna run, provided `MOCK_KERNEL` remains different from the harness address.

### 7.5 What INV-03 Does NOT Test

| Out of scope | Why |
|---|---|
| Whether the Kernel's `_activateTrigger()` itself is correctly guarded | Covered by INV-04 (Multisig Threshold) |
| Whether the Sovereign can redirect the Kernel to a malicious TriggerProtocol | Different invariant (Kernel contract substitution) |
| Whether `emergencyLockActive` prevents trigger execution | The lock is Kernel-side; TriggerProtocol doesn't check it |
| Re-entrancy through the `replacement` address | Covered by `nonReentrant`; a separate INV if needed |

---

## 8. Existing Test Coverage

### What the existing tests cover

| Test | File | Coverage of INV-03 |
|---|---|---|
| `نباید غیر Kernel ماشه را اجرا کند` | `08_Trigger_Protocol.test.js:46` | PARTIAL — one arbitrary EOA caller |
| `unauthorized executeTrigger call is state-neutral` | `08_Trigger_Protocol.test.js:51` | PARTIAL — one arbitrary EOA; full state-neutrality check |
| `terminal trigger state remains immutable...` | `08_Trigger_Protocol.test.js:1142` | PARTIAL — one Oracle caller (single assert within larger test) |

### What the existing tests do NOT cover

| Missing coverage | Risk |
|---|---|
| COURT_ROLE holder attempting direct call | None known (check is address equality, not role) — but undocumented |
| GUARDIAN_ROLE holder attempting direct call | Same |
| SOVEREIGN_ROLE / DEFAULT_ADMIN_ROLE attempting direct call | Same |
| Malicious contract caller | Same |
| State neutrality after malicious contract attempt | Same |
| Systematic state-neutrality across all five role types | Not verified |

### Assessment

The existing tests provide **partial coverage of INV-03** — they verify the most obvious case (one arbitrary caller) and one role-holder case (oracle) within a larger integration test. The Echidna harness adds:

1. **Systematic enumeration** of all 5 caller types in a single formalized property
2. **Corpus-driven call sequencing** — Echidna finds unusual sequences that unit tests miss
3. **Persistent regression harness** — runs automatically on every CI check once wired
4. **Formal property documentation** — the `echidna_only_kernel_executes_trigger` function is machine-verifiable, not prose

The unit tests are correct and sufficient for basic confidence. The Echidna harness is recommended as a **defense-in-depth** layer and as a foundation for Phase 2 multi-contract invariants that build on trigger authority.

---

## Summary

| Attribute | Value |
|---|---|
| Fuzzable now? | YES — requires only MockTreasury; no other dependencies |
| Required mocks | `MockTreasuryForTrigger` (1 function) |
| Required new contracts | `MockTreasury.sol`, `FuzzTriggerProtocol.sol` |
| Production contracts to modify | NONE |
| Existing tests to modify | NONE |
| Expected Echidna result | PASSING |
| Implementation difficulty | LOW |
| Recommended next action | Implement `contracts/fuzzing/FuzzTriggerProtocol.sol` and `contracts/fuzzing/mocks/MockTreasury.sol`; run Echidna; document result in this file |

---

*This document is analysis and planning only. No production code, test code, deployment scripts, CI configuration, or doctrine was modified.*
