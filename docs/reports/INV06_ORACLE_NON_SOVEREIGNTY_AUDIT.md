# INV-06 — Oracle Non-Sovereignty: Complete Authority Audit
## IranOS Step 12 Security Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** All oracle and feeder roles; all call paths from oracle data to Kernel / TriggerProtocol / Treasury / AssetFreeze constitutional state

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
3. [Role Map — All Oracle and Feeder Roles](#3-role-map--all-oracle-and-feeder-roles)
4. [Authority Graph — Reachable Oracle Call Paths](#4-authority-graph--reachable-oracle-call-paths)
5. [Unreachable Sovereign/Enforcement Paths](#5-unreachable-sovereignenforcement-paths)
6. [Cross-Contract Path Analysis](#6-cross-contract-path-analysis)
7. [Role Escalation Analysis](#7-role-escalation-analysis)
8. [Bypass Analysis](#8-bypass-analysis)
9. [Risk Classification](#9-risk-classification)
10. [Recommended Echidna Multi-Contract Harness Design](#10-recommended-echidna-multi-contract-harness-design)
11. [Conclusion](#11-conclusion)

---

## 1. Invariant Definition

**ID:** INV-06
**Contracts:** `contracts/kernel.sol`, `contracts/oracles/API3Oracle.sol`, `contracts/oracles/PriceOracle.sol`, `contracts/oracles/ProductionOracle.sol`, `contracts/governance/Fargard7PolicyAdapter.sol`, `contracts/core/TriggerProtocol.sol`, `contracts/monetary/Treasury.sol`, `contracts/reclaim/AssetFreeze.sol`
**Category:** Oracle Non-Sovereignty

### Invariant Statement

No sequence of calls by `ORACLE_ROLE` / `FEEDER_ROLE` holders alone — across any combination of oracle contracts and the Kernel — can cause:

1. `violations[id].triggered == true` (trigger finalization)
2. `_activateTrigger()` execution (constitutional enforcement)
3. `TriggerProtocol.executeTrigger()` execution (enforcement delivery)
4. `Treasury.blockAddressByTrigger()` execution (treasury mutation)
5. `AssetFreeze.freezeAsset()`, `signConfirmation()`, or `transferToSWF()` (freeze execution)
6. `Kernel._revokeOfficialAccess()` execution (role revocation)

The only state mutation accessible to oracle/feeder roles — `flagViolation()` creating a `ViolationRecord` and optionally setting `emergencyLockActive = true` for TR-01/02/03 — is classified as **evidence recording**, not enforcement, and is constitutionally intended.

---

## 2. Doctrine Statement

Per IranOS doctrine (REVIEWER_PRIMER §Oracle Non-Sovereignty):

> **Oracle data is evidence, not authority.**

The oracle layer provides factual inputs into the governance system — price feeds, production metrics, violation flags — but it cannot act on those inputs. Constitutional enforcement requires a separate layer of independent human judgment: the 7-of-9 court multisig (`signViolation()` → `_activateTrigger()`). No oracle call, regardless of its content or sequence, can shortcut this human judgment layer.

This is an intentional architectural separation:

| Layer | Actor | Function | Can trigger enforcement? |
|---|---|---|---|
| Evidence | ORACLE_ROLE / FEEDER_ROLE | `flagViolation()`, data feeds | NO — records evidence only |
| Judgment | COURT_ROLE | `signViolation()` × 7 | YES — after threshold met |
| Execution | Kernel (internal) | `_activateTrigger()` | YES — after judgment layer |

---

## 3. Role Map — All Oracle and Feeder Roles

### 3.1 `ORACLE_ROLE` on `IranOS_Kernel`

```solidity
// kernel.sol line 36
bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

// Modifier: onlyOracle
modifier onlyOracle() {
    require(hasRole(ORACLE_ROLE, msg.sender), "Kernel: caller is not an Oracle");
    _;
}
```

**Functions gated by `onlyOracle` on `IranOS_Kernel`:**

| Function | Effect |
|---|---|
| `flagViolation(uint8 code, address offender, string reason)` | Creates `ViolationRecord`; sets `emergencyLockActive = true` if `code ≤ 3` |

**That is the complete list.** `ORACLE_ROLE` on the Kernel grants access to exactly one function.

### 3.2 `FEEDER_ROLE` on `API3Oracle`

```solidity
// API3Oracle.sol line 18
bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");
```

**Functions gated by `onlyFeeder` / `FEEDER_ROLE` on `API3Oracle`:**

| Function | Effect |
|---|---|
| `updateData(bytes32 key, uint8 dataType, int256 value, uint256 confidence)` | Updates `dataPoints[key]` in API3Oracle; no cross-contract call |
| `flagViolation(address offender, uint8 code, string reason)` | Creates `ViolationFlag` in API3Oracle; calls `IIranOSKernel(kernel).flagViolation()` |

**`API3Oracle.flagViolation()` → `Kernel.flagViolation()` path:** The effect is identical to calling Kernel.flagViolation() directly as ORACLE_ROLE. See §4.1 for the complete trace.

### 3.3 `FEEDER_ROLE` on `PriceOracle`

```solidity
// PriceOracle.sol line 19
bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");
```

**Functions gated by `FEEDER_ROLE` on `PriceOracle`:**

| Function | Effect |
|---|---|
| `submitPrice(bytes32 key, int256 value, uint256 confidence)` | Updates `prices[key]` and `submissions[key][msg.sender]`; calls `_updateAggregatedPrice()` (internal); NO cross-contract calls |

`PriceOracle.FEEDER_ROLE` has zero cross-contract effect. It cannot call anything on Kernel, Treasury, TriggerProtocol, or AssetFreeze.

### 3.4 `FEEDER_ROLE` on `ProductionOracle`

```solidity
// ProductionOracle.sol line 18
bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");
```

**Functions gated by `FEEDER_ROLE` on `ProductionOracle`:**

| Function | Effect |
|---|---|
| `registerUnit(address unit, string name)` | Writes `productionUnits[unit]`; NO cross-contract calls |
| `updateProductionData(address unit, ...)` | Updates `productionUnits[unit]` scoring; NO cross-contract calls |

`ProductionOracle.FEEDER_ROLE` has zero cross-contract effect. It cannot reach any constitutional state.

### 3.5 `Fargard7PolicyAdapter` — No Oracle Role

The `Fargard7PolicyAdapter` does not define or use `ORACLE_ROLE` or `FEEDER_ROLE`. Its access roles are `POLICY_ADMIN_ROLE`, `RECOMMENDER_ROLE`, and `REVIEWER_ROLE` — all granted to the Kernel address in the constructor. Its `createRecommendation()` function:
- Reads price data from `PriceOracle` (view call only)
- Creates a `PolicyRecommendation` record within its own storage
- Does NOT call Kernel, Treasury, TriggerProtocol, or AssetFreeze
- Is explicitly non-executing by design (CLAUDE.md: "proposal-only / non-executing")

---

## 4. Authority Graph — Reachable Oracle Call Paths

### 4.1 Path A: Direct Oracle Flag

```
ORACLE_ROLE holder
  └─→ Kernel.flagViolation(code, offender, reason)    [onlyOracle nonReentrant]
        → violations[++violationCount] = ViolationRecord{
              signaturesCount: 0,
              triggered:       false,    ← ENFORCEMENT STATE: UNCHANGED
              courtConfirmed:  false,
              timestamp:       block.timestamp
          }
        → if code ≤ 3: emergencyLockActive = true    ← INTENDED; see §4.4
        → emit ViolationFlagged(...)
        → RETURNS violationId

  STOPS HERE. No enforcement follows.
  signViolation() is NOT called.
  _activateTrigger() is NOT called.
  TriggerProtocol is NOT called.
```

**Maximum oracle-accessible state after Path A:**
- `violations[id]` record exists with `triggered = false`
- `emergencyLockActive` may be `true` (for code ≤ 3)
- Nothing else changed

### 4.2 Path B: Feeder Flag via API3Oracle Proxy

```
FEEDER_ROLE holder on API3Oracle
  └─→ API3Oracle.flagViolation(offender, code, reason)    [onlyFeeder nonReentrant]
        → validates fresh data feed (PAH_USD staleness check)
        → creates ViolationFlag record in API3Oracle storage
        → emit ViolationFlagged(flagId, offender, code)
        └─→ IIranOSKernel(kernel).flagViolation(code, offender, reason)
              [identical to Path A — Kernel treats this as ORACLE_ROLE call
               because API3Oracle holds ORACLE_ROLE on the Kernel]
              → violations[++violationCount] created (triggered = false)
              → if code ≤ 3: emergencyLockActive = true
              → STOPS HERE. Same ceiling as Path A.
```

**Note:** `API3Oracle` is the address that holds `ORACLE_ROLE` on the Kernel (set during deployment). When `API3Oracle.flagViolation()` calls `kernel.flagViolation()`, the Kernel sees `msg.sender == API3Oracle_address` which holds `ORACLE_ROLE`. The FEEDER_ROLE holder is one step removed and has no direct Kernel access.

### 4.3 Path C: Price Feed via PriceOracle

```
FEEDER_ROLE holder on PriceOracle
  └─→ PriceOracle.submitPrice(key, value, confidence)    [FEEDER_ROLE nonReentrant]
        → submissions[key][msg.sender] = FeederSubmission{...}
        → _updateAggregatedPrice(key, confidence)           [INTERNAL]
              → prices[key] updated if MIN_FEEDERS reached
        → emit FeederSubmitted / PriceUpdated

  STOPS HERE. No cross-contract calls. No Kernel state affected.
```

### 4.4 The Emergency Lock Activation — Intended Behavior

When `flagViolation()` is called with `code ∈ {1, 2, 3}` (TR-01, TR-02, TR-03):

```solidity
// kernel.sol lines 277–279
if (violationCode <= 3) {
    _activateEmergencyLock();
}
```

This sets `emergencyLockActive = true`. This is **constitutionally intended** behavior:

- TR-01/02/03 are the highest-severity violations (secular monarchy, secularism, territorial integrity)
- The emergency lock is a **defensive freeze**, not enforcement
- It blocks further administrative changes (`notLocked` modifier on `grantOfficialAccess`, `setTriggerProtocol`, `setSovereignWealthFund`)
- It does NOT revoke access, does NOT block treasury, does NOT activate TriggerProtocol
- The `violated[id].triggered` flag remains `false`

**Classification:** The oracle's ability to set `emergencyLockActive = true` via flagViolation is a constitutional design feature, not a bypass. It is the intended first response to critical violations.

---

## 5. Unreachable Sovereign/Enforcement Paths

The following enforcement-level operations are **not reachable** by any oracle or feeder role:

### 5.1 `Kernel.signViolation()` — Requires COURT_ROLE

```solidity
function signViolation(uint256 violationId)
    external
    onlyCourt    // require(hasRole(COURT_ROLE, msg.sender))
    nonReentrant
```

`ORACLE_ROLE` and `FEEDER_ROLE` do not include `COURT_ROLE`. No oracle call sequence grants `COURT_ROLE` (see §7). Therefore, `signViolation()` — the only path to `signaturesCount` increment and `_activateTrigger()` — is completely unreachable from oracle/feeder paths.

### 5.2 `Kernel._activateTrigger()` — Internal Only

```solidity
function _activateTrigger(uint256 violationId) internal {
```

`internal` visibility means it can only be called from within `IranOS_Kernel` itself. The only call site is inside `signViolation()` after the threshold check. Unreachable directly from any external caller, oracle or otherwise.

### 5.3 `TriggerProtocol.executeTrigger()` — Requires Kernel as msg.sender

```solidity
function executeTrigger(...) external onlyKernel nonReentrant {
    // onlyKernel: require(msg.sender == kernel, "TriggerProtocol: caller is not the Kernel")
}
```

Only `IranOS_Kernel` address can call this. No oracle address is the Kernel. Unreachable from oracle/feeder paths.

### 5.4 `Treasury.blockAddressByTrigger()` — Requires KERNEL_ROLE

```solidity
function blockAddressByTrigger(address target) external onlyRole(KERNEL_ROLE) {
```

`KERNEL_ROLE` on Treasury is held by `IranOS_Kernel`. Not held by any oracle address. Unreachable.

### 5.5 `AssetFreeze.freezeAsset()` — Requires CRAWLER_ROLE

```solidity
function freezeAsset(...) external onlyRole(CRAWLER_ROLE) nonReentrant {
```

`CRAWLER_ROLE` is a distinct role defined in `AssetFreeze`. Not held by oracle/feeder addresses. Unreachable.

### 5.6 `AssetFreeze.signConfirmation()` — Requires COUNCIL_ROLE

```solidity
function signConfirmation(bytes32 assetId) external onlyRole(COUNCIL_ROLE) nonReentrant {
```

`COUNCIL_ROLE` is defined in `AssetFreeze` and `SovereignWealthFund`. Not held by oracle/feeder addresses. Unreachable.

### 5.7 `Kernel.grantOfficialAccess()` — Requires SOVEREIGN_ROLE + notLocked

```solidity
function grantOfficialAccess(address official, bytes32 role)
    external
    onlySovereign    // require(hasRole(SOVEREIGN_ROLE, msg.sender))
    notLocked
    nonReentrant
```

Unreachable from oracle/feeder paths. (Note: the inherited `AccessControl.grantRole()` bypass identified in INV-04/05 requires DEFAULT_ADMIN_ROLE — not held by oracle/feeder addresses.)

---

## 6. Cross-Contract Path Analysis

### 6.1 API3Oracle → Kernel: `flagViolation()`

**Direction:** API3Oracle → Kernel (unidirectional)
**Effect:** Creates `ViolationRecord`; optionally sets `emergencyLockActive`
**Enforcement reached:** NO — `triggered` remains `false`

### 6.2 PriceOracle → Kernel: No Path

**Direction:** None
**Effect:** None
`PriceOracle` has no interface reference to `IranOS_Kernel`. It does not call any Kernel function. Its `KERNEL_ROLE` is held by the Kernel for administrative purposes only (the Kernel can call `invalidatePrice()`), but this is unidirectional: Kernel → PriceOracle, not the reverse.

### 6.3 ProductionOracle → Kernel: No Path

**Direction:** None
**Effect:** None
`ProductionOracle` has no interface reference to `IranOS_Kernel`. Same pattern as PriceOracle.

### 6.4 Fargard7PolicyAdapter → PriceOracle: View Only

**Direction:** Fargard7PolicyAdapter → PriceOracle (view call)
**Effect:** Reads price data for recommendation classification; no state mutation on PriceOracle
**Enforcement reached:** NO

### 6.5 Fargard7PolicyAdapter → Kernel: No Path

`Fargard7PolicyAdapter` has no interface reference to `IranOS_Kernel`. It neither calls `flagViolation()` nor any other Kernel function. Its recommendation records are self-contained.

### 6.6 API3Oracle → API3Oracle.confirmViolation(): KERNEL_ROLE Only

```solidity
function confirmViolation(uint256 flagId) external onlyRole(KERNEL_ROLE) nonReentrant {
    flag.confirmed = true;
}
```

This function is only callable by the Kernel (which holds `KERNEL_ROLE` on API3Oracle). It marks a violation flag as `confirmed` within API3Oracle's own storage — this is a bookkeeping function and has no effect on `IranOS_Kernel` state or constitutional enforcement.

### 6.7 Complete Cross-Contract Call Matrix

| From | To | Function | Constitutional effect |
|---|---|---|---|
| ORACLE_ROLE holder | Kernel | `flagViolation()` | Records evidence; optionally sets emergency lock |
| API3Oracle (ORACLE_ROLE) | Kernel | `flagViolation()` | Same as above |
| FEEDER_ROLE holder | API3Oracle | `flagViolation()` | Proxied to Kernel.flagViolation() (same ceiling) |
| FEEDER_ROLE holder | API3Oracle | `updateData()` | No cross-contract call; no constitutional effect |
| FEEDER_ROLE holder | PriceOracle | `submitPrice()` | No cross-contract call; no constitutional effect |
| FEEDER_ROLE holder | ProductionOracle | `registerUnit()` | No cross-contract call; no constitutional effect |
| FEEDER_ROLE holder | ProductionOracle | `updateProductionData()` | No cross-contract call; no constitutional effect |
| Fargard7 RECOMMENDER_ROLE | Fargard7PolicyAdapter | `createRecommendation()` | Reads PriceOracle (view); no mutation |
| Fargard7 REVIEWER_ROLE | Fargard7PolicyAdapter | `approveRecommendation()` | Sets status in Fargard7 only; no external calls |

---

## 7. Role Escalation Analysis

Can any oracle or feeder role holder escalate their authority to reach enforcement-level functions?

### 7.1 Can ORACLE_ROLE escalate to COURT_ROLE?

**NO.** On `IranOS_Kernel`:
- `grantOfficialAccess()` requires `SOVEREIGN_ROLE` + `notLocked` — not held by oracle
- `AccessControl.grantRole(COURT_ROLE, ...)` requires `DEFAULT_ADMIN_ROLE` — held by Sovereign, not by oracle
- `ORACLE_ROLE` has no self-escalation path anywhere in kernel.sol

### 7.2 Can ORACLE_ROLE escalate to DEFAULT_ADMIN_ROLE?

**NO.** `DEFAULT_ADMIN_ROLE` is granted in the constructor to the Sovereign. No function in `IranOS_Kernel` grants `DEFAULT_ADMIN_ROLE` to any oracle address. The Sovereign could grant DEFAULT_ADMIN_ROLE to an oracle (governance trust gap from INV-04/05) but that would require Sovereign compromise, not oracle exploitation.

### 7.3 Can FEEDER_ROLE on API3Oracle escalate to ORACLE_ROLE on Kernel?

**NO.** `API3Oracle` holds `ORACLE_ROLE` on the Kernel (the contract address, not individual feeders). The FEEDER_ROLE allows a holder to trigger API3Oracle's `flagViolation()` function, which then calls Kernel.flagViolation() as the API3Oracle contract address. FEEDER_ROLE holders do not themselves acquire ORACLE_ROLE on the Kernel.

### 7.4 Can FEEDER_ROLE on API3Oracle escalate within API3Oracle?

**NO.** `DEFAULT_ADMIN_ROLE` on `API3Oracle` is held by the Kernel (granted in API3Oracle constructor: `_grantRole(DEFAULT_ADMIN_ROLE, _kernel)`). FEEDER_ROLE holders cannot call `AccessControl.grantRole()` on API3Oracle because they do not hold DEFAULT_ADMIN_ROLE on that contract.

### 7.5 Can FEEDER_ROLE on PriceOracle / ProductionOracle escalate?

**NO.** Same pattern as 7.4. DEFAULT_ADMIN_ROLE on both peripheral oracle contracts is held by the Kernel. FEEDER_ROLE holders have no role-escalation path.

### 7.6 Role Escalation Summary

| Escalation attempt | Possible? | Reason |
|---|---|---|
| ORACLE_ROLE → COURT_ROLE | NO | Neither grantOfficialAccess nor inherited grantRole accessible to oracle |
| ORACLE_ROLE → DEFAULT_ADMIN_ROLE | NO | DEFAULT_ADMIN_ROLE granted only in constructor to Sovereign |
| FEEDER_ROLE (API3Oracle) → ORACLE_ROLE (Kernel) | NO | FEEDER_ROLE is on API3Oracle; ORACLE_ROLE on Kernel is held by API3Oracle contract, not individual feeders |
| FEEDER_ROLE → DEFAULT_ADMIN_ROLE on oracle contracts | NO | DEFAULT_ADMIN_ROLE on peripheral contracts held by Kernel |
| Any oracle role → CRAWLER_ROLE (AssetFreeze) | NO | CRAWLER_ROLE is a distinct role managed independently |
| Any oracle role → COUNCIL_ROLE (AssetFreeze/SWF) | NO | Same; no shared authority surface |

---

## 8. Bypass Analysis

### 8.1 Multi-Step Oracle Sequences

**Scenario:** Oracle holder calls `flagViolation()` once, then tries to call it multiple times to increment `signaturesCount`.

**Result:** Impossible. `flagViolation()` does NOT increment `signaturesCount`. Each call creates a new `ViolationRecord` with `signaturesCount = 0`. Only `signViolation()` (requiring `COURT_ROLE`) increments `signaturesCount`. The oracle cannot call `signViolation()`.

### 8.2 Oracle + Feeder Combined Sequence

**Scenario:** ORACLE_ROLE calls `flagViolation()`; FEEDER_ROLE on API3Oracle calls `flagViolation()` targeting same offender.

**Result:** Creates two independent `ViolationRecord` entries. Neither reaches threshold. `triggered` remains `false` on both. No enforcement.

### 8.3 Oracle Loops / Flash Violations

**Scenario:** Oracle calls `flagViolation()` 7 times with different violation codes against the same offender.

**Result:** Creates 7 violation records, all with `signaturesCount = 0`, `triggered = false`. `emergencyLockActive` may be set to `true` if any code ≤ 3 is used (first occurrence; idempotent thereafter). No enforcement triggered.

### 8.4 Stale Data Exploitation

**Scenario:** Feeder submits manipulated price data to PriceOracle to influence Fargard7PolicyAdapter's stress classification, which could trigger an "approved" recommendation.

**Result:** Even if a recommendation is `Approved` in Fargard7PolicyAdapter, the adapter is non-executing. It does not call `flagViolation()`, does not call `signViolation()`, does not interact with Treasury, and does not interact with Kernel constitutional state. The recommendation status exists only within Fargard7PolicyAdapter's own storage.

### 8.5 API3Oracle Stale Data Gate Bypass

**Scenario:** Feeder submits price update to API3Oracle to pass the freshness check in `API3Oracle.flagViolation()`:
```solidity
// API3Oracle.sol line 90
require(
    block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE,
    "API3Oracle: stale data feed"
);
```

A feeder can satisfy this by submitting a fresh `PAH_USD` data point, then immediately calling `API3Oracle.flagViolation()`.

**Effect:** This allows FEEDER_ROLE to call `Kernel.flagViolation()` via the API3Oracle proxy. Effect ceiling is the same as §4.1: records a violation with `triggered = false`, optionally sets emergency lock. Not a bypass of enforcement.

### 8.6 Emergency Lock as an Oracle-Caused State Mutation

The one confirmed state mutation an oracle can cause is `emergencyLockActive = true` via `flagViolation(code ≤ 3)`. As analyzed in §4.4, this is constitutionally intended. However, it creates a collateral consideration:

**Collateral effect:** During emergency lock, `grantOfficialAccess()` is blocked (`notLocked`). This means a malicious oracle could flag a false TR-01/02/03 violation to freeze legitimate role-grant operations.

**Classification:** Denial-of-administration attack via false flag. Severity: MEDIUM — recoverable only by the Court calling `deactivateEmergencyLock()`. This is a liveness risk (administrative freeze), not an enforcement bypass.

**Note:** This concern is pre-existing and documented. It requires ORACLE_ROLE compromise and is separated from the INV-06 enforcement invariant, which holds regardless.

---

## 9. Risk Classification

### By Category

| Risk Category | Rating | Basis |
|---|---|---|
| Oracle executing `violations[id].triggered = true` | NONE | `signViolation()` requires COURT_ROLE; unreachable from oracle path |
| Oracle calling `_activateTrigger()` | NONE | Internal function; no direct call path exists |
| Oracle calling `TriggerProtocol.executeTrigger()` | NONE | Requires `msg.sender == kernel`; oracle is not the Kernel |
| Oracle calling `Treasury.blockAddressByTrigger()` | NONE | Requires KERNEL_ROLE on Treasury; not held by oracle |
| Oracle calling `AssetFreeze.freezeAsset()` | NONE | Requires CRAWLER_ROLE; not held by oracle |
| Oracle calling `AssetFreeze.signConfirmation()` | NONE | Requires COUNCIL_ROLE; not held by oracle |
| FEEDER_ROLE escalating to ORACLE_ROLE on Kernel | NONE | FEEDER_ROLE is on peripheral contracts; no escalation path |
| ORACLE_ROLE escalating to COURT_ROLE | NONE | No grantRole path accessible to oracle |
| Oracle setting `emergencyLockActive = true` | INTENDED (MEDIUM liveness risk) | flagViolation(code ≤ 3) is constitutionally intended; liveness risk if oracle compromised |
| Fargard7PolicyAdapter creating enforceable state | NONE | Non-executing; no cross-contract calls to enforcement layer |

### Overall Rating: **LOW**

INV-06 holds with high confidence at the enforcement layer. The only oracle-accessible constitutional state mutation (`emergencyLockActive`) is constitutionally intended. All enforcement operations require COURT_ROLE or internal Kernel calls that are architecturally isolated from the oracle role surface.

---

## 10. Recommended Echidna Multi-Contract Harness Design

### Why INV-06 requires a multi-contract harness

INV-01/02 (PahlaviToken) — single-contract harness.
INV-04 (Kernel multisig) — multi-signer harness with CourtHelper stubs.
INV-06 (Oracle Non-Sovereignty) — requires harness that deploys **both** API3Oracle and IranOS_Kernel, wires them together, grants ORACLE_ROLE to API3Oracle on the Kernel, and grants FEEDER_ROLE to simulated feeders on API3Oracle. The property asserts that no sequence of feeder/oracle calls causes `triggered == true`.

### Harness Architecture

```
FuzzOracleNonSovereignty (harness)
├── IranOS_Kernel (deployed with harness as sovereign, court, swf)
│     └── ORACLE_ROLE → MockAPI3Oracle
├── MockAPI3Oracle (simulates API3Oracle with flagViolation proxy)
│     └── FEEDER_ROLE → harness (address(this))
├── MockTriggerProtocol (sentinel: records if executeTrigger() called)
└── Properties:
      echidna_oracle_cannot_trigger()
      echidna_feeder_cannot_trigger()
      echidna_trigger_requires_court()
```

### Harness skeleton

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// TEST-ONLY HARNESS — DO NOT DEPLOY TO PRODUCTION
// Invariant: INV-06 — Oracle Non-Sovereignty

import "../../contracts/kernel.sol";

interface IKernelOracle {
    function flagViolation(uint8 code, address offender, string calldata reason)
        external returns (uint256);
}

contract SentinelTriggerProtocol {
    bool public executeTriggerCalled;
    function executeTrigger(uint256, address, uint8, address)
        external returns (uint256) {
        executeTriggerCalled = true; // sentinel flag
        return 1;
    }
}

contract MockAPI3OracleForINV06 {
    address public kernel;
    bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");
    // Simplified: harness is feeder; calls through to Kernel.flagViolation()
    function setKernel(address _k) external { kernel = _k; }
    function feederFlag(uint8 code, address offender) external {
        IKernelOracle(kernel).flagViolation(code, offender, "fuzz-feeder");
    }
}

contract FuzzOracleNonSovereignty {
    IranOS_Kernel            public kernel;
    SentinelTriggerProtocol  public sentinel;
    MockAPI3OracleForINV06   public mockOracle;

    address internal constant MOCK_SWF    = address(0x9999);
    address internal constant MOCK_COURT  = address(0xCCCC);
    address internal constant OFFENDER    = address(0xBEEF);

    constructor() {
        sentinel   = new SentinelTriggerProtocol();
        mockOracle = new MockAPI3OracleForINV06();

        kernel = new IranOS_Kernel(
            address(this),   // sovereign
            MOCK_COURT,      // court (not harness — harness cannot sign)
            address(mockOracle), // oracle
            MOCK_SWF
        );
        mockOracle.setKernel(address(kernel));
        kernel.setTriggerProtocol(address(sentinel));
    }

    // ─── Fuzz entry points ───────────────────────────────────────────

    // Direct oracle flagViolation (ORACLE_ROLE path)
    function doOracleFlag(uint8 code) public {
        uint8 safeCode = (code % 6) + 1;
        try kernel.flagViolation(safeCode, OFFENDER, "fuzz-oracle") {} catch {}
    }

    // Feeder-proxied flagViolation (FEEDER_ROLE → API3Oracle → Kernel path)
    function doFeederFlag(uint8 code) public {
        uint8 safeCode = (code % 6) + 1;
        try mockOracle.feederFlag(safeCode, OFFENDER) {} catch {}
    }

    // ─── Echidna invariant properties ────────────────────────────────

    /// INV-06a: No oracle/feeder sequence causes violations[id].triggered = true.
    /// Expected: always true.
    function echidna_oracle_cannot_trigger() public view returns (bool) {
        uint256 count = kernel.violationCount();
        for (uint256 i = 1; i <= count; i++) {
            IranOS_Kernel.ViolationRecord memory v = kernel.getViolation(i);
            if (v.triggered) return false; // oracle caused a trigger — FAIL
        }
        return true;
    }

    /// INV-06b: TriggerProtocol.executeTrigger() never called from oracle paths.
    /// Expected: always true (sentinel.executeTriggerCalled remains false).
    function echidna_feeder_cannot_trigger() public view returns (bool) {
        return !sentinel.executeTriggerCalled;
    }

    /// INV-06c: signaturesCount is always 0 for all violations created by oracle.
    /// (Confirms oracle cannot increment the court signature counter.)
    /// Expected: always true.
    function echidna_oracle_sigs_always_zero() public view returns (bool) {
        uint256 count = kernel.violationCount();
        for (uint256 i = 1; i <= count; i++) {
            IranOS_Kernel.ViolationRecord memory v = kernel.getViolation(i);
            if (v.signaturesCount > 0) return false; // only court can increment — FAIL
        }
        return true;
    }
}
```

### Expected Echidna results

| Property | Expected result | What it confirms |
|---|---|---|
| `echidna_oracle_cannot_trigger` | PASSING | No oracle call sequence sets `triggered = true` |
| `echidna_feeder_cannot_trigger` | PASSING | `TriggerProtocol.executeTrigger()` never reached from oracle paths |
| `echidna_oracle_sigs_always_zero` | PASSING | Oracle cannot increment court signature count |

### Note on harness design

The `MOCK_COURT = address(0xCCCC)` is a dead address — it holds COURT_ROLE but no code. This ensures the harness cannot accidentally sign violations (which would invalidate the property). The property would hold regardless (since the harness only calls oracle/feeder functions), but the explicit dead court address makes the constraint clear.

---

## 11. Conclusion

### INV-06 Holds: **YES — FULLY ENFORCED BY ARCHITECTURE**

The oracle non-sovereignty invariant holds with high confidence across all analyzed call paths.

### Evidence Summary

| Question | Answer |
|---|---|
| What can ORACLE_ROLE do on Kernel? | Call `flagViolation()` only — creates evidence record; cannot enforce |
| What can FEEDER_ROLE do on API3Oracle? | Call `updateData()` and `flagViolation()` (proxied to Kernel) — same ceiling as oracle |
| What can FEEDER_ROLE do on PriceOracle? | Call `submitPrice()` — no cross-contract calls; zero constitutional effect |
| What can FEEDER_ROLE do on ProductionOracle? | Call `registerUnit()` and `updateProductionData()` — no cross-contract calls |
| Can oracle data directly mutate constitutional state? | No — `violations[id].triggered` remains false; no access revocation; no treasury mutation |
| Can oracle reports directly execute triggers? | No — `_activateTrigger()` is internal; reached only via 7 court signatures |
| Can oracle paths bypass court/multisig/human judgment? | No — `signViolation()` requires COURT_ROLE; no oracle/feeder path grants COURT_ROLE |
| Can oracle-controlled accounts escalate role authority? | No — ORACLE_ROLE/FEEDER_ROLE have no path to DEFAULT_ADMIN_ROLE or COURT_ROLE on Kernel |
| Does any cross-contract route convert oracle evidence into sovereign authority? | No — API3Oracle → Kernel is a one-way evidence pipe; no enforcement signal returns |
| Does Fargard7PolicyAdapter create enforceable state? | No — non-executing; creates proposal records only; no Kernel/Treasury/enforcement calls |

### What oracle actors CAN do (constitutional design)

- Flag violations → create `ViolationRecord` with `triggered = false`
- Activate emergency lock (for TR-01/02/03 flags) — constitutionally intended defensive measure
- Update price/production data in peripheral oracle contracts

### What oracle actors CANNOT do (enforcement layer — fully blocked)

- Increment `signaturesCount` on any `ViolationRecord`
- Set `violations[id].triggered = true`
- Call `_activateTrigger()` or `TriggerProtocol.executeTrigger()`
- Call `Treasury.blockAddressByTrigger()`
- Call `AssetFreeze.freezeAsset()` or `signConfirmation()`
- Grant any role on any contract
- Clear or override the court signature requirement

### Qualified Finding

The oracle CAN cause `emergencyLockActive = true` via `flagViolation(code ≤ 3)`. This is constitutionally intended and not classified as a bypass. A compromised oracle using this path to create a false emergency lock is a **liveness risk** (denial of administration), not an enforcement bypass. The liveness risk is bounded: the Court can restore normal operation by calling `deactivateEmergencyLock()`.

---

*This document is analysis only. No production code, test code, deployment scripts, CI configuration, or doctrine was modified. No production readiness, external audit completion, formal verification completion, or Step 12 blocker closure is claimed.*
