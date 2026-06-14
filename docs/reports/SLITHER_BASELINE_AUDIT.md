# SLITHER BASELINE AUDIT REPORT

**Project:** IranOS (ایران‌اواس)  
**Report Version:** v1.0.0-baseline  
**Date:** 2026-06-14  
**Auditor:** Automated — Slither v0.11.5 (crytic-compile v0.3.11)  
**Solidity Version:** 0.8.26 (soljson, bundled)  
**Contracts Analysed:** 43 contracts (25 project + 18 OpenZeppelin dependencies)  
**Detectors Run:** 101  
**Total Findings:** 130  

> **Scope Disclaimer:** This is a static-analysis baseline, not a professional security audit. It documents what the Slither detector suite found and provides an initial false-positive assessment. It does not constitute external audit completion, formal verification, or a claim of production readiness. Step 12 blockers remain open until independently assessed per `STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`.

---

## Test Suite Status

```
npm test  →  565 passing (20s)   0 failing
```

All 565 hardhat tests passed prior to static analysis.

---

## Slither Summary

| Severity      | Total Findings | Node\_modules Only | Project Code |
|---------------|---------------|-------------------|--------------|
| High          | 1             | 1                 | 0            |
| Medium        | 17            | 8                 | 9            |
| Low           | 79            | 0                 | 79           |
| Informational | 17            | 4                 | 13           |
| Optimization  | 16            | 0                 | 16           |
| **Total**     | **130**       | **13**            | **117**      |

> All 13 node\_modules-only findings are false positives attributable to OpenZeppelin's `Math.sol` and `Strings.sol`. They are documented below for completeness but require no action.

---

## Critical

*No Critical findings. The one High finding is a confirmed false positive in node\_modules.*

---

## High

### H-01 — `incorrect-exp` — OpenZeppelin Math.mulDiv (FALSE POSITIVE)

| Field | Value |
|-------|-------|
| Detector | `incorrect-exp` |
| File | `node_modules/@openzeppelin/contracts/utils/math/Math.sol:116` |
| Contract | `Math` (OpenZeppelin dependency) |
| Function | `mulDiv(uint256,uint256,uint256)` |
| Evidence | Slither flags `(3 * denominator) ^ 2` as bitwise-XOR instead of exponentiation |
| Valid / False Positive | **FALSE POSITIVE** |
| Next Step | No action required |

**Assessment:** OpenZeppelin's `mulDiv` uses the `^` operator intentionally as bitwise-XOR in a Newton-Raphson modular inverse computation, not as exponentiation. This is well-audited, battle-tested OZ v5 code. Slither misclassifies the operator. The finding is entirely within `node_modules/` and has zero impact on project contracts.

---

## Medium

### M-01 — `divide-before-multiply` — OpenZeppelin Math.mulDiv (FALSE POSITIVE × 8)

| Field | Value |
|-------|-------|
| Detector | `divide-before-multiply` |
| File | `node_modules/@openzeppelin/contracts/utils/math/Math.sol:101–122` |
| Contract | `Math` (OpenZeppelin dependency) |
| Function | `mulDiv` |
| Instances | 8 separate flag entries for the same function |
| Valid / False Positive | **FALSE POSITIVE** |
| Next Step | No action required |

**Assessment:** The `mulDiv` algorithm intentionally divides `denominator` by a power of two (`twos`) to strip trailing zeros, then multiplies back — a required step in the fixed-point Newton-Raphson inversion. This pattern is mathematically correct and intentional. All 8 instances point to the same OZ file in `node_modules/`.

---

### M-02 — `incorrect-equality` — Enum strict equality comparisons (VALID — LOW EXPLOITABILITY)

| Field | Value |
|-------|-------|
| Detector | `incorrect-equality` |
| Instances | 4 |

| # | File | Contract | Function | Evidence |
|---|------|----------|----------|----------|
| 1 | `contracts/justice/JusticeProtocol.sol:150` | `JusticeProtocol` | `isCaseFinalised(uint256)` | `cases[caseId].status == CaseStatus.Final` |
| 2 | `contracts/core/ConstitutionGuard.sol:69` | `ConstitutionGuard` | `proposeLaw(bytes32,uint8)` | `proposals[lawHash].proposedAt == 0` |
| 3 | `contracts/welfare/CitizenCard.sol:181` | `CitizenCard` | `isEmployed(address)` | `citizens[citizen].employmentStatus == EmploymentStatus.Employed` |
| 4 | `contracts/welfare/CitizenCard.sol:182` | `CitizenCard` | `isRetired(address)` | `citizens[citizen].employmentStatus == EmploymentStatus.Retired` |

**Assessment:** Slither flags strict equality (`==`) as dangerous because an external contract cannot force an enum to skip states without explicit state-machine manipulation. In all four cases:

- The enum comparisons (instances 1, 3, 4) are comparing against a named enum member. Solidity enums can only hold declared values; no integer out-of-range value can be assigned without explicit casting, which does not occur here. **Low exploitability.**
- The `proposedAt == 0` check (instance 2) is a standard "does not exist" guard. It cannot be manipulated by block producers. **Low exploitability.**

**Recommended Next Step:** Convert enum comparisons to use the full state-machine pattern (`>= StatusX` or `<= StatusY`) for defensive coding. The `proposedAt == 0` pattern is idiomatic and acceptable.

---

### M-03 — `unused-return` — Ignored return values from external calls (VALID)

| Field | Value |
|-------|-------|
| Detector | `unused-return` |
| Instances | 5 |

| # | File | Contract | Function | Ignored Return | Severity Note |
|---|------|----------|----------|---------------|---------------|
| 1 | `contracts/kernel.sol:332` | `IranOS_Kernel` | `_activateTrigger(uint256)` | `executionId` from `ITriggerProtocol.executeTrigger()` | Low security risk — executeTrigger uses `require` internally; executionId is not needed for correctness |
| 2 | `contracts/oracles/API3Oracle.sol:97` | `API3Oracle` | `flagViolation(address,uint8,string)` | `violationId` from `IIranOSKernel.flagViolation()` | Low security risk — the Oracle cannot correlate its own flagId with the Kernel's violationId |
| 3 | `contracts/governance/Fargard7PolicyAdapter.sol:156` | `Fargard7PolicyAdapter` | `getSignalSnapshot()` | Third return value (confidence) from `priceOracle.getPrice(KEY_GLOBAL_CPI)` | Informational — confidence not used in policy classification |
| 4 | `contracts/governance/Fargard7PolicyAdapter.sol:157` | `Fargard7PolicyAdapter` | `getSignalSnapshot()` | Third return value (confidence) from `priceOracle.getPrice(KEY_USD_GOLD)` | Informational — same as above |
| 5 | `contracts/governance/Fargard7PolicyAdapter.sol:158` | `Fargard7PolicyAdapter` | `getSignalSnapshot()` | Third return value (confidence) from `priceOracle.getPrice(KEY_GAS_USD)` | Informational — same as above |

**Assessment:**

- **Instance 1 (kernel._activateTrigger):** The `executionId` returned by `executeTrigger` is documented as stored in `TriggerProtocol.executions` and not needed in the Kernel. The call itself uses `require` for validation. No silent failure path. Acceptable, but the ignored return should be explicitly annotated (e.g., `// executionId stored in TriggerProtocol`).
- **Instance 2 (API3Oracle.flagViolation):** `IIranOSKernel.flagViolation()` returns a `uint256 violationId` which is discarded. The Oracle's own `flagId` and the Kernel's `violationId` are uncorrelated. This does not enable exploitation but may hinder incident correlation. Recommend capturing and emitting the returned `violationId`.
- **Instances 3–5 (Fargard7PolicyAdapter):** The `confidence` return value from `PriceOracle.getPrice()` is intentionally not used by the policy adapter. The adapter classifies on price alone. This is architecturally intentional (policy adapter is proposal-only and not executing). Acceptable with documentation.

**Recommended Next Step:** Add explicit `// @dev return value intentionally ignored: ...` comment to Instance 1. For Instance 2, consider capturing the returned `violationId` and emitting it in a correlation event.

---

## Low

### L-01 — `reentrancy-benign` — TriggerProtocol.executeTrigger state changes after external call (VALID — PROTECTED)

| Field | Value |
|-------|-------|
| Detector | `reentrancy-benign` |
| File | `contracts/core/TriggerProtocol.sol:62–81` |
| Contract | `TriggerProtocol` |
| Function | `executeTrigger(uint256,address,uint8,address)` |
| Evidence | `signatureRevoked[offender] = true` is set after external call to `ITreasury.blockAddressByTrigger()` |
| Valid / False Positive | **VALID — PROTECTED** |
| Next Step | No code change required; verify Treasury cannot re-enter via `blockAddressByTrigger` |

**Assessment:** Slither labels this "benign" reentrancy, meaning that even if reentrancy occurred, the state change is not exploitable for double-spending or logic bypass. The function carries a `nonReentrant` modifier from OpenZeppelin's `ReentrancyGuard`, which blocks any reentrant call at the EVM level. The current risk is zero. However, the calling pattern (external call before state write) violates the Checks-Effects-Interactions pattern in principle. No code change is required, but the sequencing should be noted in a future refactor pass.

---

### L-02 — `timestamp` — Block timestamp used in comparisons (VALID — INHERENT TO GOVERNANCE DOMAIN)

| Field | Value |
|-------|-------|
| Detector | `timestamp` |
| Instances | 78 |
| Contracts Affected | All 25 project contracts |

**Selected representative instances:**

| Contract | Function | Use |
|----------|----------|-----|
| `kernel.sol:296` | `signViolation` | Checks `TRIGGER_TIMEOUT` (72 hours) |
| `contracts/core/TriggerProtocol.sol:67` | `executeTrigger` | Records `executedAt` |
| `contracts/justice/JurySelection.sol:50` | `selectJury` | Records jury selection time |
| `contracts/monetary/SovereignWealthFund.sol:121` | `distributeAnnualYield` | Annual yield distribution timing |
| `contracts/monetary/VelocityFee.sol:151` | `calculateFee` | Dormancy period check |
| `contracts/welfare/CitizenCard.sol:172` | `useDrugQuota` | Monthly quota reset |
| `contracts/governance/VotingSystem.sol:153–154` | `castVote` | Election period boundary |
| `contracts/governance/Fargard7PolicyAdapter.sol:248` | `expireRecommendation` | Review window expiry |

**Assessment:** Block producers (validators) can manipulate `block.timestamp` by approximately 15 seconds in either direction. This constitutes a miner-extractable value (MEV) window. For the IranOS governance domain:

- **72-hour TRIGGER_TIMEOUT** (`kernel.sol`): A 15-second manipulation of a 259,200-second window is a 0.006% deviation — negligible for constitutional adjudication.
- **Annual SWF yield distribution**: A 15-second window around an annual event is negligible.
- **Monthly/periodic welfare quotas**: 15 seconds is operationally insignificant.
- **Voting period boundaries**: A 15-second shift at election open/close is the most sensitive case. At high-volume voting moments, a validator could marginally extend or shorten a window.

**Context per `REVIEWER_PRIMER.md`:** The system prioritizes constitutional resilience over precision timing. Governance operates on human-scale periods where validator timestamp manipulation is negligible. This is an accepted limitation.

**Recommended Next Step:** Document the known validator-timestamp limitation in the protocol specifications. For voting period boundaries (`VotingSystem.sol`), consider adding a minimum buffer window (e.g., reject votes in the last/first 60 seconds of a window boundary) if sub-minute precision matters in a later version.

---

## Informational

### I-01 — `pragma` — Two Solidity versions detected (VALID — MINOR)

| Field | Value |
|-------|-------|
| Detector | `pragma` |
| Evidence | Project contracts use `^0.8.20`; OpenZeppelin dependencies use `^0.8.0` |
| Valid / False Positive | **FALSE POSITIVE for project; VALID notation overall** |
| Next Step | No action required for project contracts |

**Assessment:** All 25 project contracts use `pragma solidity ^0.8.20`. The second version (`^0.8.0`) is from OpenZeppelin `node_modules/`. This is expected and not a project-controlled concern. The compiler is pinned to 0.8.26 in `hardhat.config.js`.

---

### I-02 — `solc-version` — Known issues in pragma range (PARTIAL FALSE POSITIVE)

| Field | Value |
|-------|-------|
| Detector | `solc-version` |
| Instances | 2 |

| Instance | File | Note |
|----------|------|------|
| 1 | `node_modules/@openzeppelin/.../...` | OZ uses `^0.8.0` for broad compatibility — false positive |
| 2 | Project contracts using `^0.8.20` | Slither notes known issues in `^0.8.20` range |

**Assessment:** Slither flags `^0.8.20` because the range technically includes versions with known bugs, even though the project compiles with 0.8.26 (which does not have those bugs). This is a range-widening false positive. The `hardhat.config.js` pins to `0.8.26` which is clean. No action required, but consider locking to `=0.8.26` (exact version) to silence this finding.

---

### I-03 — `missing-inheritance` — Implementations do not declare interface inheritance (VALID)

| Field | Value |
|-------|-------|
| Detector | `missing-inheritance` |
| Instances | 5 |

| Contract | Should Inherit | Interface Location |
|----------|---------------|-------------------|
| `TriggerProtocol` | `ITriggerProtocol` | `contracts/kernel.sol:7–14` |
| `Treasury` | `ITreasury` | `contracts/core/TriggerProtocol.sol:6–8` |
| `IranOS_Kernel` | `IIranOSKernel` | `contracts/oracles/API3Oracle.sol:7–9` |
| `SovereignWealthFund` | `ISovereignWealthFund` | `contracts/reclaim/AssetFreeze.sol:7–10` |
| `PriceOracle` | `IFargard7PriceOracle` | `contracts/governance/Fargard7PolicyAdapter.sol:7–10` |

**Assessment:** These are architecturally significant findings. When a contract does not declare `is InterfaceX`, the compiler does not verify that the implementation satisfies the interface at compile time. If a future refactor changes a function signature in the implementation without updating the interface (or vice versa), callers using the interface type will fail at runtime rather than compile time.

The current contracts satisfy their interfaces at the source level (Slither confirms the call sites work), but the lack of declared inheritance removes a layer of compile-time safety.

**Recommended Next Step:** Add `is ITriggerProtocol`, `is ITreasury`, `is IIranOSKernel`, `is ISovereignWealthFund`, `is IFargard7PriceOracle` to the respective contract declarations. This is a medium-priority refactor (safe, no logic change).

---

### I-04 — `naming-convention` — Non-standard names (VALID — MINOR)

| Field | Value |
|-------|-------|
| Detector | `naming-convention` |
| Instances | 4 |

| # | Location | Finding | Assessment |
|---|----------|---------|------------|
| 1 | `contracts/kernel.sol:28` | `IranOS_Kernel` not in CapWords | FALSE POSITIVE — underscore is intentional project branding |
| 2 | `contracts/kernel.sol:450` | `_triggerProtocol` parameter not mixedCase | VALID — common underscore-prefix convention; Slither prefers `triggerProtocol` |
| 3 | `contracts/kernel.sol:466` | `_swf` parameter not mixedCase | VALID — same pattern |
| 4 | `contracts/monetary/PahlaviToken.sol:232` | `_swf` parameter not mixedCase | VALID — same pattern |

**Recommended Next Step:** `IranOS_Kernel` name is intentional and should not change. For the parameter naming findings, the underscore-prefix pattern is a widely-used convention to distinguish parameters from state variables; Slither's preference for pure camelCase is stylistic. Consider standardising in a future style pass if the team adopts a linter rule.

---

### I-05 — `unindexed-event-address` — Events with address parameters have no indexed fields (VALID)

| Field | Value |
|-------|-------|
| Detector | `unindexed-event-address` |
| Instances | 3 |

| Contract | Event | Location |
|----------|-------|----------|
| `PahlaviToken` | `SWFAddressUpdated(address,address)` | `contracts/monetary/PahlaviToken.sol:66` |
| `IranOS_Kernel` | `KernelContractUpdated(string,address,address)` | `contracts/kernel.sol:154–158` |
| `Parliament` | `NoConfidenceVote(address,uint256,uint256)` | `contracts/governance/Parliament.sol:64` |

**Assessment:** Events with address parameters should mark at least one address as `indexed` to allow efficient off-chain filtering by address (e.g., `eth_getLogs` with topic filter). Without `indexed`, monitoring systems must download and parse all event logs to find address-specific events.

**Recommended Next Step:** Add `indexed` to the first address parameter in each of these three events. This is a safe change that improves observability and monitoring capacity for the citizen app and governance dashboards.

---

## Optimization

### O-01 — `constable-states` — State variable could be `constant` (VALID)

| Field | Value |
|-------|-------|
| Detector | `constable-states` |
| Instances | 1 |

| Contract | Variable | Location |
|----------|----------|----------|
| `SovereignWealthFund` | `nationalTreasury` | `contracts/monetary/SovereignWealthFund.sol:52` |

**Assessment:** `SovereignWealthFund.nationalTreasury` is declared as `address public nationalTreasury` but is only set once (in the constructor or at deployment) and never changed. Making it `constant` saves approximately 2,100 gas per read (SLOAD vs PUSH32). More importantly, a `constant` cannot be modified post-deployment, hardening the link between the SWF and the Treasury.

**Recommended Next Step:** If `nationalTreasury` is indeed a compile-time known address, change to `constant`. If it is set in the constructor but not known at compile time, change to `immutable`. Note: changing storage to `immutable` is a non-breaking change but does require redeployment.

---

### O-02 — `immutable-states` — State variables set once could be `immutable` (VALID — GAS + SECURITY)

| Field | Value |
|-------|-------|
| Detector | `immutable-states` |
| Instances | 15 |

| Contract | Variable | Location |
|----------|----------|----------|
| `AssetFreeze` | `swfTempWallet` | `contracts/reclaim/AssetFreeze.sol:40` |
| `AssetFreeze` | `swfContract` | `contracts/reclaim/AssetFreeze.sol:41` |
| `TriggerProtocol` | `kernel` | `contracts/core/TriggerProtocol.sol:21` |
| `TriggerProtocol` | `treasury` | `contracts/core/TriggerProtocol.sol:22` |
| `TriggerProtocol` | `swf` | `contracts/core/TriggerProtocol.sol:23` |
| `ConstitutionGuard` | `kernel` | `contracts/core/ConstitutionGuard.sol:14` |
| `IranOS_Kernel` | `api3Oracle` | `contracts/kernel.sol:76` |
| `PahlaviToken` | `kernel` | `contracts/monetary/PahlaviToken.sol:49` |
| `Parliament` | `currentFiscalYear` | `contracts/governance/Parliament.sol:50` |
| `Provincial` | `nationalTreasury` | `contracts/governance/Provincial.sol:36` |
| `PenalLabor` | `victimFundAddress` | `contracts/justice/PenalLabor.sol:55` |
| `SovereignCrawler` | `swfTempWallet` | `contracts/reclaim/SovereignCrawler.sol:59` |
| `VelocityFee` | `developmentBankAddress` | `contracts/monetary/VelocityFee.sol:44` |
| `VelocityFee` | `pahlaviToken` | `contracts/monetary/VelocityFee.sol:45` |
| `API3Oracle` | `kernel` | `contracts/oracles/API3Oracle.sol:56` |

**Assessment:** These 15 variables are set in constructors and never modified. Marking them `immutable`:

1. **Security improvement:** `immutable` values are baked into bytecode at deployment and cannot be changed by any function — no admin backdoor, no setter. This strengthens the constitutional immutability principle.
2. **Gas saving:** Approximately 2,100 gas saved per SLOAD eliminated (immutable variables are read from bytecode, not storage).
3. **Alignment with design doctrine:** The `REVIEWER_PRIMER.md` emphasises "state immutability guarantees." Making these addresses immutable is the on-chain enforcement of that doctrine.

**Recommended Next Step:** Mark all 15 variables `immutable` in a dedicated refactor commit. This is safe, non-breaking, and directly improves the constitutional security posture. Priority: **high** — especially `TriggerProtocol.kernel`, `TriggerProtocol.treasury`, and `ConstitutionGuard.kernel`.

---

## False Positive Summary

| Finding | Detector | Reason for False Positive |
|---------|----------|--------------------------|
| H-01 | `incorrect-exp` | OZ `mulDiv` uses `^` as bitwise-XOR intentionally; in `node_modules/` |
| M-01 (×8) | `divide-before-multiply` | OZ `mulDiv` intentional algorithm; in `node_modules/` |
| I-01 | `pragma` | Second version is from OZ `node_modules/`; not project-controlled |
| I-02 (partial) | `solc-version` | Compiler is pinned to 0.8.26; range flag is overly conservative |
| I-03 (assembly ×2) | `assembly` | OZ `Math.mulDiv` and `Strings.toString`; in `node_modules/` |
| I-04 (naming) | `naming-convention` | `IranOS_Kernel` name is intentional project branding |

---

## Priority Action Matrix

| Priority | Finding | Action |
|----------|---------|--------|
| High | O-02 (immutable-states ×15) | Mark constructor-set addresses `immutable` — security + gas |
| High | I-03 (missing-inheritance ×5) | Add interface inheritance to 5 contracts — compile-time safety |
| Medium | M-03-1 (unused-return, kernel) | Add comment or capture `executionId` |
| Medium | M-03-2 (unused-return, oracle) | Capture and emit `violationId` from kernel |
| Medium | O-01 (constable-states) | Mark `SovereignWealthFund.nationalTreasury` as `constant` or `immutable` |
| Low | I-05 (unindexed-event-address) | Add `indexed` to three event address parameters |
| Low | M-02 (incorrect-equality) | Defensive enum pattern review |
| Low | L-01 (reentrancy-benign) | Document CEI deviation; no code change needed |
| Low | I-04 (naming-convention) | Standardise parameter prefix in style pass |
| Informational | L-02 (timestamp ×78) | Document validator-timestamp limitation in protocol specs |

---

## Files Analysed

**Project contracts (25):**

```
contracts/kernel.sol
contracts/core/TriggerProtocol.sol
contracts/core/ConstitutionGuard.sol
contracts/monetary/SovereignWealthFund.sol
contracts/monetary/PahlaviToken.sol
contracts/monetary/Treasury.sol
contracts/monetary/VelocityFee.sol
contracts/governance/Provincial.sol
contracts/governance/Parliament.sol
contracts/governance/VotingSystem.sol
contracts/governance/BudgetAllocation.sol
contracts/governance/Fargard7PolicyAdapter.sol
contracts/welfare/CitizenCard.sol
contracts/welfare/BaseIncome.sol
contracts/welfare/HealthCoverage.sol
contracts/welfare/DisabilitySupport.sol
contracts/oracles/API3Oracle.sol
contracts/oracles/PriceOracle.sol
contracts/oracles/ProductionOracle.sol
contracts/justice/JurySelection.sol
contracts/justice/JusticeProtocol.sol
contracts/justice/PenalLabor.sol
contracts/reclaim/AssetFreeze.sol
contracts/reclaim/SovereignCrawler.sol
contracts/reclaim/VictimFund.sol
```

**OpenZeppelin dependencies (18):** Scanned but findings are false positives as documented above.

---

## Methodology Notes

- Slither v0.11.5 was run against the Hardhat project with pre-compiled artifacts (compiler: soljson 0.8.26+commit.8a97fa7a).
- `--hardhat-ignore-compile` flag was used after pre-compilation via `./node_modules/.bin/hardhat compile`.
- All 101 built-in detectors were active (no exclusions applied).
- JSON output was captured at `/tmp/slither-output.json` for archival.
- Node\_modules findings were separated from project findings manually via source mapping analysis.

---

## What This Report Does Not Cover

- **Formal verification:** No Echidna fuzzing, no Certora Prover, no SnarkJS circuit verification. See `STEP12_FORMAL_VERIFICATION_PREP_PACKET.md`.
- **Mythril / symbolic execution:** Not run in this baseline pass.
- **Oracle manipulation beyond timestamp:** Price feed manipulation, API3 Airnode availability, VRF compromise scenarios.
- **Upgrade / migration risk:** No proxy patterns in scope; kernel is intentionally non-upgradeable.
- **Economic / game-theoretic attacks:** Outside static-analysis scope.
- **Step 12 blocker resolution:** This report is an evidence artefact only. The Step 12 checklist in `STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md` governs when blockers are formally closed.

---

*Generated by automated Slither baseline scan — 2026-06-14*  
*For the external audit preparation packet, see `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md`*
