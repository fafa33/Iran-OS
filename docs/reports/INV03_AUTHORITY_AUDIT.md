# INV-03 — Trigger Authority: Complete Authority Audit
## IranOS Step 12 Security Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** All 25 production contracts + kernel + TriggerProtocol + all oracle and governance paths

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - No contracts, tests, CI, deployment scripts, or production code were modified.

---

## Table of Contents

1. [Files Examined](#1-files-examined)
2. [Authority Graph](#2-authority-graph)
3. [Reachable Call Paths](#3-reachable-call-paths)
4. [Unreachable Call Paths](#4-unreachable-call-paths)
5. [Threat Model](#5-threat-model)
6. [Adversarial Scenarios](#6-adversarial-scenarios)
7. [Enforcement Classification](#7-enforcement-classification)
8. [Doctrine Compatibility Analysis](#8-doctrine-compatibility-analysis)
9. [Recommended Invariant](#9-recommended-invariant)
10. [Implementation Recommendation](#10-implementation-recommendation)
11. [Findings Summary](#11-findings-summary)

---

## 1. Files Examined

| File | Purpose |
|---|---|
| `contracts/core/TriggerProtocol.sol` | Guard mechanism; `executeTrigger()` definition |
| `contracts/kernel.sol` | Only production caller; `_activateTrigger()` → `executeTrigger()` |
| `contracts/oracles/API3Oracle.sol` | Violation flagging path; does NOT call `executeTrigger()` |
| `contracts/monetary/Treasury.sol` | Receives trigger calls; does NOT call `executeTrigger()` |
| `contracts/governance/Parliament.sol` | Law lifecycle; no trigger authority |
| `contracts/monetary/SovereignWealthFund.sol` | Monetary layer; no trigger authority |
| `contracts/monetary/PahlaviToken.sol` | Token; no trigger authority |
| `contracts/governance/Provincial.sol` | Provincial governance; no trigger authority |
| `contracts/governance/VotingSystem.sol` | Elections; no trigger authority |
| `contracts/governance/BudgetAllocation.sol` | Budget routing; no trigger authority |
| `contracts/governance/Fargard7PolicyAdapter.sol` | Proposal-only adapter; no trigger authority |
| `contracts/core/ConstitutionGuard.sol` | Law gating; no trigger authority |
| `contracts/justice/JurySelection.sol` | VRF jury; no trigger authority |
| `contracts/justice/JusticeProtocol.sol` | Justice; no trigger authority |
| `contracts/justice/PenalLabor.sol` | Penal labor; no trigger authority |
| `contracts/welfare/*` (4 contracts) | Welfare distribution; no trigger authority |
| `contracts/oracles/PriceOracle.sol` | Price data; no trigger authority |
| `contracts/oracles/ProductionOracle.sol` | Production data; no trigger authority |
| `contracts/reclaim/AssetFreeze.sol` | Asset freeze; no trigger authority |
| `contracts/reclaim/SovereignCrawler.sol` | Asset discovery; no trigger authority |
| `contracts/reclaim/VictimFund.sol` | Victim compensation; no trigger authority |
| `docs/reports/INV03_TRIGGER_AUTHORITY_PLAN.md` | Prior planning document |

**Grep result:** `executeTrigger`, `ITriggerProtocol`, `triggerProtocol`, `TriggerProtocol` appear in exactly **two production Solidity files** — `contracts/core/TriggerProtocol.sol` (definition) and `contracts/kernel.sol` (caller). Zero references in any other contract.

---

## 2. Authority Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHORITY GRAPH: executeTrigger()                    │
└─────────────────────────────────────────────────────────────────────────┘

ORACLE LAYER:
  FEEDER_ROLE holder
    └─→ API3Oracle.flagViolation()
          └─→ IIranOSKernel(kernel).flagViolation()  [ORACLE_ROLE check]
                └─→ Kernel: ViolationRecord created
                └─→ Kernel: _activateEmergencyLock() if code ≤ 3
                └─→ [STOPS HERE — no path to _activateTrigger()]

KERNEL LAYER:
  COURT_ROLE holder (×1–6, insufficient)
    └─→ Kernel.signViolation()
          └─→ signaturesCount++ → still < MULTISIG_THRESHOLD (7)
                └─→ [STOPS — threshold not met]

  COURT_ROLE holder (×7, threshold met)
    └─→ Kernel.signViolation()
          └─→ signaturesCount >= 7
                └─→ internal: Kernel._activateTrigger()
                      └─→ internal: Kernel._revokeOfficialAccess()
                      └─→ if (triggerProtocol != address(0)):
                            └─→ EXTERNAL CALL:
                                ITriggerProtocol(triggerProtocol)
                                  .executeTrigger(violationId, offender,
                                    violationCode, address(0))
                                msg.sender == IranOS_Kernel address
                                ✓ onlyKernel: PASSES

TRIGGER PROTOCOL LAYER:
  TriggerProtocol.executeTrigger()
    │ Guard: require(msg.sender == kernel)
    │ Guard: nonReentrant
    ├─→ blockedFromTreasury[offender] = true
    ├─→ ITreasury(treasury).blockAddressByTrigger(offender)
    ├─→ signatureRevoked[offender] = true
    ├─→ emit PublicNotification
    ├─→ if (replacement != address(0)): interimReplacements[offender] = replacement
    └─→ executions[executionId] = TriggerExecution{...}

ALL OTHER ACTORS:
  SOVEREIGN_ROLE → direct call → onlyKernel REVERTS
  COURT_ROLE (direct) → onlyKernel REVERTS
  GUARDIAN_ROLE → onlyKernel REVERTS
  DEFAULT_ADMIN_ROLE → onlyKernel REVERTS
  ORACLE_ROLE (direct) → onlyKernel REVERTS
  Parliament → no path to TriggerProtocol
  Treasury → no path to TriggerProtocol (receives FROM trigger, never calls it)
  SWF → no path to TriggerProtocol
  VotingSystem → no path to TriggerProtocol
  AssetFreeze → no path to TriggerProtocol
  API3Oracle → calls Kernel.flagViolation(), NOT executeTrigger()
  Any EOA → onlyKernel REVERTS
  Any contract → onlyKernel REVERTS
```

---

## 3. Reachable Call Paths

There is **exactly one reachable call path** to `TriggerProtocol.executeTrigger()` in the current production codebase:

```
Path: COURT-THRESHOLD
─────────────────────────────────────────────────────────────────────────────
Step 1: ORACLE_ROLE holder calls Kernel.flagViolation(code, offender, reason)
        → ViolationRecord created; violationId returned
        → emergencyLockActive = true if code ≤ 3 (TR-01/02/03)

Step 2: COURT_ROLE holders (7 distinct addresses) each call
        Kernel.signViolation(violationId)
        → Each call: violationSignatures[violationId][signer] = true
        → signaturesCount++ after each unique signer
        → Re-signing by same signer: REVERTS ("already signed")

Step 3: On the 7th unique signature:
        signaturesCount >= MULTISIG_THRESHOLD (7)
        → record.courtConfirmed = true
        → Kernel._activateTrigger(violationId) [INTERNAL — not callable externally]

Step 4: _activateTrigger():
        → record.triggered = true
        → triggerActivationCount++
        → _revokeOfficialAccess(offender) [INTERNAL — revokes Kernel roles]
        → if (triggerProtocol != address(0)):
            ITriggerProtocol(triggerProtocol).executeTrigger(...)
            msg.sender = IranOS_Kernel contract address
            ✓ onlyKernel passes
─────────────────────────────────────────────────────────────────────────────
```

**Preconditions for this path:**
- `triggerProtocol` must be non-zero (Sovereign must have called `setTriggerProtocol()`)
- The violation must not already be triggered (`record.triggered == false`)
- 7 distinct COURT_ROLE addresses must sign
- The violation must have been created by an ORACLE_ROLE holder via `flagViolation()`

**No other path exists.** The function `_activateTrigger()` is declared `internal` — it has no external caller entry point of its own. The only way to reach it is through `signViolation()`, which enforces `onlyCourt` and `signaturesCount >= 7`.

---

## 4. Unreachable Call Paths

The following paths are **architecturally impossible** in the current production system:

### 4.1 Direct role-holder calls

| Actor | Attempt | Blocker |
|---|---|---|
| SOVEREIGN_ROLE | `TriggerProtocol.executeTrigger()` directly | `require(msg.sender == kernel)` — Sovereign address ≠ Kernel contract |
| COURT_ROLE (any count) | `TriggerProtocol.executeTrigger()` directly | Same — Court member address ≠ Kernel contract |
| ORACLE_ROLE | `TriggerProtocol.executeTrigger()` directly | Same — Oracle address ≠ Kernel contract |
| GUARDIAN_ROLE | `TriggerProtocol.executeTrigger()` directly | Same |
| DEFAULT_ADMIN_ROLE | `TriggerProtocol.executeTrigger()` directly | DEFAULT_ADMIN_ROLE is an OZ AccessControl concept; TriggerProtocol has no AccessControl |

### 4.2 Oracle signal → direct trigger

```
FEEDER → API3Oracle.flagViolation()
       → IIranOSKernel.flagViolation()   [records violation; may lock]
       → [TERMINATES — no call to executeTrigger()]
```

API3Oracle calls `Kernel.flagViolation()` — which records the violation and activates the emergency lock for TR-01/02/03 — but **does not call `_activateTrigger()`**. The trigger path requires 7 court signatures on top of the oracle signal.

### 4.3 Parliament, Treasury, SWF, and all other contracts

Grep across all 25 contracts confirms zero references to `executeTrigger`, `ITriggerProtocol`, `triggerProtocol`, or `TriggerProtocol` outside of `kernel.sol` and `TriggerProtocol.sol` itself. None of these contracts have any code path to trigger execution.

### 4.4 Re-entrancy via `replacement` parameter

```
Kernel calls executeTrigger(violationId, offender, code, replacement)
  → if replacement != address(0):
      interimReplacements[offender] = replacement
      emit InterimReplacementActivated(offender, replacement, ...)
  → replacement contract receives no callback; emit does not invoke code
  → nonReentrant modifier blocks any re-entry into executeTrigger()
```

Re-entrancy is blocked at two levels: (a) the `nonReentrant` modifier, and (b) the `InterimReplacementActivated` event is a log, not a callback. The replacement address is stored and emitted but never called during execution.

---

## 5. Threat Model

### 5.1 Complete Actor Enumeration

| Actor | Has kernel address? | Can call executeTrigger()? | Reason |
|---|---|---|---|
| IranOS_Kernel contract | YES — is the kernel | YES — sole legitimate caller | Called via `_activateTrigger()` after 7-of-9 court threshold |
| COURT_ROLE holder (direct) | NO | NO | Address ≠ kernel contract address |
| SOVEREIGN_ROLE holder | NO | NO | Same |
| ORACLE_ROLE holder | NO | NO | Same |
| GUARDIAN_ROLE holder | NO | NO | Same |
| DEFAULT_ADMIN_ROLE holder | NO | NO | Same; TriggerProtocol has no AccessControl |
| Parliament contract | NO | NO | No code path to TriggerProtocol |
| Treasury contract | NO | NO | Receives from TriggerProtocol; never calls it |
| SovereignWealthFund contract | NO | NO | No code path |
| API3Oracle contract | NO | NO | Calls Kernel.flagViolation(), not executeTrigger() |
| VotingSystem, Provincial, BudgetAllocation, Fargard7PolicyAdapter | NO | NO | No reference to TriggerProtocol |
| ConstitutionGuard | NO | NO | No reference |
| Justice contracts (×3) | NO | NO | No reference |
| Welfare contracts (×4) | NO | NO | No reference |
| Oracle contracts (×3) | NO | NO | No reference to TriggerProtocol |
| Reclaim contracts (×3) | NO | NO | No reference |
| Arbitrary EOA | NO | NO | Address ≠ kernel |
| Arbitrary contract | NO | NO | Address ≠ kernel; no delegatecall receiver |

### 5.2 The `setTriggerProtocol()` Vector

The Kernel exposes `setTriggerProtocol(address)` guarded by `onlySovereign notLocked`:

```solidity
function setTriggerProtocol(address _triggerProtocol)
    external
    onlySovereign
    notLocked
    nonReentrant
{
    require(_triggerProtocol != address(0), "Kernel: invalid address");
    triggerProtocol = _triggerProtocol;
    ...
}
```

**What this can do:** Replace the TriggerProtocol address the Kernel calls. If a Sovereign deploys a new TriggerProtocol with `kernel = attacker_address`, and redirects the Kernel to call it, the attacker's address would satisfy the `onlyKernel` guard on the new instance.

**What this cannot do:** It cannot bypass INV-03 on the **existing** TriggerProtocol instance. INV-03 is per-instance. The original instance's `kernel` variable is immutable from the moment of construction.

**Mitigating factor:** `setTriggerProtocol()` is blocked when `emergencyLockActive == true` (the `notLocked` modifier). During a constitutional crisis (when TR-01/02/03 is flagged), the Sovereign cannot redirect the trigger to a malicious contract. This is intentional — the system is biased toward caution during crises.

**Residual risk:** In a non-emergency state, the Sovereign could theoretically redirect `triggerProtocol` to a malicious contract before a crisis occurs. This is a governance trust assumption inherent to the Sovereign's constitutional role. The Sovereign's `setTriggerProtocol()` authority exists to allow legitimate upgrades; abuse would itself constitute a TR-05 (SWF independence breach) or TR-01 violation, triggering the same protocol.

---

## 6. Adversarial Scenarios

### Scenario A — Oracle Unilateral Trigger Attempt

**Setup:** FEEDER_ROLE holder (or oracle contract) detects a genuine TR-01 violation and attempts to bypass the 7-of-9 threshold by calling `TriggerProtocol.executeTrigger()` directly.

**Outcome:** REVERTS. `msg.sender` = oracle address ≠ `kernel` = IranOS_Kernel contract address.

**State after failed attempt:** `executionCount` unchanged (0). `blockedFromTreasury`, `signatureRevoked`, `executions` all unchanged.

**Doctrine alignment:** Correct. Oracle data is evidence (REVIEWER_PRIMER §Oracle Non-Sovereignty). The oracle's legitimate path is `Kernel.flagViolation()` → 7-court-signature process → automatic `executeTrigger()` via Kernel.

---

### Scenario B — Court Short-Circuit Attempt

**Setup:** A single COURT_ROLE holder attempts to execute the trigger without 6 additional cosigners by calling `TriggerProtocol.executeTrigger()` directly.

**Outcome:** REVERTS unconditionally. The court member's address is not the Kernel contract address.

**Alternative attempt:** Court member tries calling `signViolation(id)` with `signaturesCount` already at 6 (just below threshold). The 7th call triggers internally — this is the legitimate path, not a bypass.

**State after failed direct attempt:** Unchanged. The multisig threshold is never bypassed.

---

### Scenario C — Sovereign Governance Override Attempt

**Setup:** The Sovereign holds DEFAULT_ADMIN_ROLE and SOVEREIGN_ROLE. Attempts to call `executeTrigger()` directly to unilaterally block a political opponent without court confirmation.

**Outcome:** REVERTS. DEFAULT_ADMIN_ROLE is an AccessControl concept that applies to the Kernel's role registry — it has zero meaning in TriggerProtocol, which uses address equality for access control. The Sovereign's address is not the Kernel contract address.

**Legitimate Sovereign path:** The Sovereign can observe violations but must wait for oracle flagging and 7 court signatures. The Sovereign cannot shortcut the trigger without subverting the entire court.

---

### Scenario D — Parliament Budget Manipulation Attempt

**Setup:** Parliament (or a PARLIAMENT_ROLE holder on Treasury) attempts to prevent a trigger execution by intervening in TriggerProtocol directly.

**Outcome:** Parliament has no code path to TriggerProtocol. The `blockedByTrigger` state in Treasury is set by `TriggerProtocol` calling `Treasury.blockAddressByTrigger()` — Parliament cannot influence this flow. There is no function in Parliament that touches TriggerProtocol.

---

### Scenario E — Re-entry via Replacement Contract

**Setup:** The legitimate Kernel calls `executeTrigger(..., maliciousContract)`. During execution, `maliciousContract` attempts to call `executeTrigger()` again before the first execution completes.

**Outcome:** REVERTS with reentrancy guard (`nonReentrant` via `ReentrancyGuard`). The `_status` flag is `_ENTERED` during the first execution; the re-entrant call fails at the `nonReentrant` modifier before reaching `onlyKernel`.

**Note:** The `replacement` parameter is stored and emitted, but the replacement contract is never called *during* `executeTrigger()`. The `InterimReplacementActivated` event is a log. The replacement address only appears in `interimReplacements[offender]` for external query — it is never invoked.

---

### Scenario F — `setTriggerProtocol()` Malicious Redirect

**Setup:** Sovereign deploys `MaliciousTrigger` with `kernel = attacker` and calls `Kernel.setTriggerProtocol(address(MaliciousTrigger))`. Then attacker calls `Kernel.signViolation()` (as a COURT_ROLE holder) to trigger execution against a target, but the execution goes to `MaliciousTrigger`.

**Outcome for original TriggerProtocol:** Unchanged. Once `triggerProtocol` is redirected, new trigger activations hit `MaliciousTrigger`. The original instance retains `kernel = IranOS_Kernel` and `executionCount` unchanged.

**Outcome for system integrity:** The Kernel calls `MaliciousTrigger.executeTrigger()` with `msg.sender = IranOS_Kernel`. Since MaliciousTrigger's `kernel` = attacker address ≠ IranOS_Kernel, even this path fails on the malicious instance (assuming the attacker deployed it correctly with `kernel = attacker`).

Wait — the attacker deployed `MaliciousTrigger` with `kernel = attacker`, but the Kernel calls from `msg.sender = IranOS_Kernel`. So IranOS_Kernel ≠ attacker, and MaliciousTrigger.executeTrigger() ALSO reverts. The malicious redirect achieves nothing except disabling trigger execution (by pointing the Kernel at a non-functional TriggerProtocol).

**Classification:** This is a denial-of-trigger risk (Sovereign disabling the trigger), not a trigger-without-authority risk. The Sovereign's authority to call `setTriggerProtocol()` is bounded by `notLocked` (cannot redirect during emergency lock).

**Residual doctrine note:** A Sovereign who calls `setTriggerProtocol(address(0x0...))` effectively disables the TriggerProtocol (the Kernel checks `if (triggerProtocol != address(0))` before calling). This would prevent trigger execution entirely. This constitutes a TR-01 (constitutional monarchy violation) or TR-05 (SWF independence breach) violation, triggering the same mechanism it is trying to disable — but only if the oracle can still flag and the court can still sign.

---

### Scenario G — Kernel Contract Compromise

**Setup:** IranOS_Kernel itself is compromised (e.g., if a future upgrade introduces a new external function that calls `_activateTrigger()` without the 7-of-9 check).

**Outcome for INV-03:** If the Kernel is the caller, `msg.sender == kernel` passes. This bypasses the 7-of-9 requirement at the Kernel level, not at the TriggerProtocol level.

**Assessment:** This is not an INV-03 failure — INV-03 only asserts that `executeTrigger()` requires `msg.sender == kernel`. If the Kernel itself has a new unauthorized path, the failure is in the Kernel's multisig enforcement (INV-04), not in TriggerProtocol's caller check.

**This confirms the layered invariant design:** INV-03 and INV-04 are complementary, not redundant.
- INV-03: `executeTrigger()` is only callable by the kernel address.
- INV-04: The Kernel only calls `executeTrigger()` after 7-of-9 court signatures.

Both must hold simultaneously for the full constitutional guarantee.

---

## 7. Enforcement Classification

### Question A: Can `executeTrigger()` be reached by role holders, admins, parliament, treasury, oracle, SWF, or external EOAs without the exact kernel address?

**Answer: NO.**

The guard is `require(msg.sender == kernel)` where `kernel` is set once at construction and has no setter. No role, no admin privilege, no contract function in any of the 25 production contracts provides an alternative path. The only way to satisfy the guard is to be the exact IranOS_Kernel contract address.

### Question B: Every reachable caller chain

**There is exactly one:**

```
ORACLE_ROLE → Kernel.flagViolation() [registers violation]
COURT_ROLE ×7 → Kernel.signViolation() ×7 [threshold reached]
             → Kernel._activateTrigger() [internal]
             → TriggerProtocol.executeTrigger() [msg.sender = Kernel ✓]
```

### Question C: Future architectural changes that could bypass the authority boundary

| Change | Risk level | Notes |
|---|---|---|
| Add `setKernel()` to TriggerProtocol | CRITICAL | Allows post-deployment redirection of the authority check |
| Add role-based alternative in TriggerProtocol (e.g., `onlyKernelOrSovereign`) | CRITICAL | Widens the guard beyond address equality |
| Make TriggerProtocol an upgradeable proxy | HIGH | Proxy admin can introduce bypass via implementation swap |
| Add a new external function in Kernel calling `_activateTrigger()` without 7-of-9 | HIGH | Bypasses multisig at Kernel level (INV-04 failure) |
| Introduce `delegatecall` receiver to TriggerProtocol | HIGH | Could allow `msg.sender` forgery via storage manipulation |
| Remove `nonReentrant` from `executeTrigger()` | MEDIUM | Enables re-entrancy attacks from replacement contract |
| Make `triggerProtocol` variable in Kernel publicly settable without `notLocked` | MEDIUM | Enables disable-during-crisis |
| Add `emergencyExecuteTrigger()` without `onlyKernel` | CRITICAL | New surface; must require same guard |

### Question D: Is INV-03 currently enforced?

**Classification: FULLY ENFORCED BY ARCHITECTURE**

Not partially enforced — fully enforced by two independent mechanisms:

1. **Address-equality guard** — `require(msg.sender == kernel)` — the strongest possible access control mechanism. Cannot be bypassed by role manipulation, proxy patterns (without delegatecall), or contract interactions.

2. **No setter for `kernel`** — the `kernel` variable cannot be changed after deployment. Even if TriggerProtocol is compromised in other ways, the kernel binding is immutable.

**Combined effect:** At the current code revision, no sequence of legitimate or illegitimate on-chain transactions can cause `executeTrigger()` to execute with any caller other than `IranOS_Kernel`.

### Question E: Should an Echidna invariant exist for INV-03?

**Answer: YES — as a mandatory regression harness, not as a discovery tool.**

INV-03 is currently architecturally sound. The Echidna invariant is not needed to find a bug that exists; it is needed to detect a bug that may be introduced. Specifically:

- **Regression detection:** If a future PR adds `setKernel()`, the property `executionCount == 0` would detect that the kernel can now be redirected to the harness address, enabling execution.
- **Role-expansion guard:** If a future PR adds a `SOVEREIGN_ROLE` bypass to `executeTrigger()`, the harness entry points (which simulate sovereign callers) would detect it.
- **Documentation value:** The Echidna property function is the only machine-verifiable form of the invariant statement. Unit tests verify specific inputs; Echidna verifies all reachable states.

---

## 8. Doctrine Compatibility Analysis

### REVIEWER_PRIMER §Oracle Non-Sovereignty

> "Oracles provide information. Oracles do not create authority."

INV-03 is the direct technical enforcement of this doctrine. The oracle path (`FEEDER → API3Oracle.flagViolation() → Kernel.flagViolation()`) creates only a `ViolationRecord` and may activate the emergency lock. It does not and cannot call `executeTrigger()`. The full trigger requires 7 court cosigners — human constitutional judgment, not automated oracle authority.

**Verdict:** Fully compatible. INV-03 enforces Oracle Non-Sovereignty at the execution layer.

### REVIEWER_PRIMER §Human Constitutional Judgment

> "Automation assists constitutional processes. Automation does not replace constitutional judgment."

The trigger lifecycle requires 7 distinct human court signers. No automated process can satisfy this condition without real human action (signing transactions with court-credentialed keys). `executeTrigger()` is the outcome of human judgment, not a replacement for it.

**Verdict:** Fully compatible.

### REVIEWER_PRIMER §Kernel Immutability

> "Kernel immutability is a security feature."

TriggerProtocol's `kernel` binding is immutable per-instance, matching the Kernel's design philosophy. The `setTriggerProtocol()` in the Kernel is the only mutable connection, and it is gated by `onlySovereign notLocked`.

**Verdict:** Fully compatible. Kernel immutability applies at TriggerProtocol's level via the immutable `kernel` variable.

### REVIEWER_PRIMER §Fixed Constitutional Thresholds

> "Certain thresholds are constitutional safeguards rather than operational parameters."

`MULTISIG_THRESHOLD = 7` in the Kernel and `require(msg.sender == kernel)` in TriggerProtocol are both fixed at deployment. Neither is configurable after deployment. INV-03's address-equality guard is itself a constitutional threshold.

**Verdict:** Fully compatible.

---

## 9. Recommended Invariant

### Invariant Statement

```
For any sequence of transactions in the IranOS system, no address other than
the address stored in TriggerProtocol.kernel at construction time can cause
TriggerProtocol.executionCount to increase.
```

### Echidna Property

```solidity
/// INV-03: Trigger authority — only the configured kernel address can execute the trigger.
/// Status: Expected PASSING.
/// Guard mechanism: address equality (msg.sender == kernel), not role-based.
/// No setter for kernel exists in TriggerProtocol.
/// Value: Regression harness. Detects future modifications that introduce setKernel(),
///   role-based bypass, proxy pattern, or delegatecall receiver.
/// Failure = critical constitutional breach. Investigate immediately.
function echidna_only_kernel_executes_trigger() public view returns (bool) {
    return trigger.executionCount() == 0;
}
```

### Why `executionCount == 0` Is Complete

- Any successful `executeTrigger()` call from a non-kernel address would increment `executionCount`.
- The harness deploys TriggerProtocol with `kernel = address(0x7777)` (not `address(this)`).
- No Echidna-controlled address equals `address(0x7777)`.
- Therefore no fuzz call can increment `executionCount`.
- If the property ever returns `false`, a new bypass has been introduced.

### Complementary Invariant (INV-04)

INV-03 alone does not guarantee constitutional safety. It must be paired with INV-04 (Multisig Threshold Preservation) which asserts that the Kernel's `_activateTrigger()` is only reached after 7 unique court signatures. Together:

- **INV-03** ensures TriggerProtocol only accepts the Kernel as caller.
- **INV-04** ensures the Kernel only calls TriggerProtocol after 7-of-9 court signatures.

Both invariants must hold simultaneously for the full constitutional guarantee.

---

## 10. Implementation Recommendation

### Immediate Actions (0 changes required to production code)

INV-03 does not require any changes to `TriggerProtocol.sol`, `kernel.sol`, or any other production contract. The architecture is sound.

**Recommended additions (test-layer only, no production impact):**

1. **Implement `contracts/fuzzing/FuzzTriggerProtocol.sol`** — Echidna harness as specified in `INV03_TRIGGER_AUTHORITY_PLAN.md §5.6`.

2. **Implement `contracts/fuzzing/mocks/MockTreasury.sol`** — single-function mock implementing `ITreasury.blockAddressByTrigger()`.

3. **Run Echidna** and document result in `INV03_TRIGGER_AUTHORITY_PLAN.md` (update Status field to "PASSING — confirmed").

4. **Add to `docs/SLITHER_CI_NOTES.md`** or a new `docs/FUZZING_CI_NOTES.md` a forward-looking note: any PR that adds `setKernel()`, a role-based alternative guard, a proxy pattern, or any new entry point to `executeTrigger()` must re-run the Echidna harness and verify `echidna_only_kernel_executes_trigger` still passes.

### Future Change Protocol

Before any future modification to TriggerProtocol:

| Proposed change | Required review step |
|---|---|
| Add `setKernel()` | Run Echidna harness; confirm whether INV-03 still holds; update harness |
| Add role-based alternative to `onlyKernel` | Re-evaluate entire threat model; update harness with new role entry points |
| Make TriggerProtocol upgradeable | Full re-audit of INV-03 and all downstream invariants |
| Add `emergencyExecuteTrigger()` | Confirm guard is at least as strict as `onlyKernel`; add harness entry |
| Remove `nonReentrant` | Re-evaluate Scenario E; add re-entrancy harness |

### Production Code Status

**No production code changes are required.** INV-03 is currently fully enforced by the existing address-equality guard and the absence of a `kernel` setter.

---

## 11. Findings Summary

### INV-03 Currently Safe?

**YES — FULLY SAFE in current production revision.**

The authority boundary is enforced by address equality, not role membership. No role, no admin, no oracle, no governance contract, no parliament, no treasury, no SWF, and no arbitrary EOA can call `TriggerProtocol.executeTrigger()`. The only reachable path requires:
1. An oracle to flag a violation via `Kernel.flagViolation()`
2. Seven distinct COURT_ROLE holders to sign via `Kernel.signViolation()`
3. The Kernel's `_activateTrigger()` to call `executeTrigger()` as `msg.sender`

### Production Changes Required?

**NO.** The current architecture is architecturally sound for INV-03. No changes to any production contract are needed or recommended for this invariant.

### Files Read

All 25 production contracts under `contracts/`, `docs/reports/INV03_TRIGGER_AUTHORITY_PLAN.md`, and the prior session context for TriggerProtocol and kernel.sol.

### Git Status

No changes made. No commits. No pushes. No PRs created by this analysis.

```
On branch feature/slither-ci-workflow
Working tree: clean (docs/reports/INV03_AUTHORITY_AUDIT.md is the only new file — untracked)
```

---

*This document is analysis only. No production code, test code, deployment scripts, CI configuration, or doctrine was modified. No production readiness, external audit completion, formal verification completion, or Step 12 blocker closure is claimed.*
