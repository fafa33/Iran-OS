# IranOS — Architectural Risk and Doctrine Extraction Report
**Baseline:** `v0.1.0-stabilization` (commit `559ae09`)
**Date:** 2026-05-12
**Scope:** All 15 contracts + whitepaper + all protocol documents

---

## Introduction

This report captures the complete architectural state of the IranOS codebase immediately after the stabilization sprint (PRs #3–#8), tagged at `v0.1.0-stabilization` (commit `559ae09`). The sprint resolved compile blockers, rebuilt missing contracts, fixed test file corruption, and established a 33/33 passing test baseline. This document is the first structured audit of doctrine fidelity and implementation gaps following that stabilization work.

> **Disclaimer:** This is an analytical architecture report, not canonical constitutional doctrine. Findings describe the current state of on-chain implementation relative to the whitepaper and protocol documents. They do not amend or supersede the منشور رفاه و عدالت (Charter of Welfare and Justice).

---

## Table of Contents

1. [Core System Invariants](#1-core-system-invariants)
2. [Authority Separation Model](#2-authority-separation-model)
3. [Anti-Drift Mechanisms](#3-anti-drift-mechanisms)
4. [Economic Doctrine Extraction](#4-economic-doctrine-extraction)
5. [Missing Doctrine Documentation](#5-missing-doctrine-documentation)
6. [Missing Enforcement](#6-missing-enforcement)
7. [Architectural Risk Map](#7-architectural-risk-map)

---

## 1. Core System Invariants

These values are hardcoded and immutable across the entire system. No function can alter them without redeployment.

| Invariant | Contract | Value | Constitutional Source |
|-----------|----------|-------|----------------------|
| `MULTISIG_THRESHOLD` | `kernel.sol` | 7 (of 9) | trigger-protocol §4.2 |
| `TRIGGER_TIMEOUT` | `kernel.sol` | 72 hours | trigger-protocol §4.5 |
| `LIQUIDITY_CAP` | `kernel.sol` | 900,000,000,000 × 1e18 PAH | whitepaper §39.1 |
| `MIN_RESERVE_RATIO` | `kernel.sol` | 333 (= 33.3‰) | monetary-protocol §2.1 |
| `MULTISIG_REQUIRED` | `SovereignWealthFund.sol` | 3 (of N) | whitepaper §38.3 |
| `IMMUTABLE_PRINCIPLES_MASK` | `ConstitutionGuard.sol` | `0x07` (bits 0,1,2) | constitution Art. 1–3 |
| `MIN_RESIDENCY_YEARS` | `VotingSystem.sol` | 5 | whitepaper §21.4 |
| `JURY_SIZE` | `JurySelection.sol` | 12 | justice-protocol §6.1 |
| `CONVICTION_THRESHOLD` | `JurySelection.sol` | 8 | justice-protocol §6.3 |
| `ACQUITTAL_THRESHOLD` | `JurySelection.sol` | 5 | justice-protocol §6.3 |
| `MIN_WAGE` | `CitizenCard.sol` | 1,000 PAH | whitepaper §38.2.2 |
| `PROVINCIAL_SHARE` | `Provincial.sol` | 300 (= 30%) | governance-protocol §3.1 |

**Finding:** All twelve invariants match their whitepaper/protocol source. No drift detected at `v0.1.0-stabilization`.

---

## 2. Authority Separation Model

### 2.1 Role Hierarchy

```
SOVEREIGN_ROLE (پادشاه)
    └── DEFAULT_ADMIN_ROLE (kernel.sol deployer = _kernel address)
            ├── COURT_ROLE (دادگاه عالی) — 9 signers
            ├── ORACLE_ROLE (اوراکل API3)
            ├── GUARDIAN_ROLE (نگهبانان نخبگانی)
            ├── PARLIAMENT_ROLE (BudgetAllocation)
            ├── GOVERNMENT_ROLE (BudgetAllocation)
            ├── AUDITOR_ROLE (BudgetAllocation)
            ├── ELECTION_ROLE (VotingSystem)
            ├── COUNCIL_ROLE (SovereignWealthFund)
            ├── CRAWLER_ROLE (AssetFreeze)
            └── FEEDER_ROLE (API3Oracle)
```

### 2.2 Exclusive Role Grants

`kernel.sol::grantOfficialAccess()` explicitly prevents granting `SOVEREIGN_ROLE` through the normal role-grant path. The Sovereign position can only be set at construction time. This is a deliberate constitutional safeguard.

### 2.3 Role Cross-Contract Isolation

Each contract manages its own `AccessControl` instance. Roles granted in `kernel.sol` do not automatically propagate to `BudgetAllocation`, `VotingSystem`, or `SovereignWealthFund`. Each satellite contract requires independent `grantRole()` calls from the address holding its `DEFAULT_ADMIN_ROLE`.

**Finding:** There is no unified role registry. A court signer granted `COURT_ROLE` in the kernel is not automatically a COUNCIL_ROLE holder in the SWF. This is architecturally sound for isolation but creates operational complexity during deployment.

---

## 3. Anti-Drift Mechanisms

### 3.1 Trigger Protocol (TR-01 to TR-06)

The six constitutional red lines and their enforcement tiers:

| Code | Category | Auto-Lock | Requires Multi-Sig |
|------|----------|-----------|-------------------|
| TR-01 | Secular constitutional monarchy | YES | No (immediate) |
| TR-02 | Structural secularism | YES | No (immediate) |
| TR-03 | Territorial integrity | YES | No (immediate) |
| TR-04 | Fundamental rights | No | Yes (7-of-9) |
| TR-05 | SWF independence | No | Yes (7-of-9) |
| TR-06 | Liquidity cap | No | Yes (7-of-9) |

Implementation in `kernel.sol`:
- `flagViolation()` (ORACLE_ROLE): creates violation record; if `violationCode <= 3`, sets `emergencyLockActive = true` immediately
- `signViolation()` (COURT_ROLE): increments `signaturesCount`; at threshold 7, calls `_activateTrigger()`
- `_activateTrigger()`: calls `_revokeOfficialAccess()` on the violating address, emits `TriggerActivated`
- Emergency lock deactivation: `onlyCourt` — the same body that activates multi-sig triggers

**Finding:** TR-01/02/03 immediate lock creates a "bias toward caution" that is constitutionally intentional (trigger-protocol §4.3). The lock cannot be self-deactivated by the kernel; court intervention is mandatory.

### 3.2 Constitution Guard

`ConstitutionGuard.sol` enforces the amendment barrier:

```solidity
IMMUTABLE_PRINCIPLES_MASK = 0x07  // binary: 00000111
```

Bit positions:
- Bit 0 → SECULAR (principle 1)
- Bit 1 → RIGHTS (principle 2)  
- Bit 2 → TERRITORIAL (principle 3)
- Bit 3 → MONETARY (principle 4) — **NOT immutable**
- Bit 4 → JUDICIAL (principle 5) — **NOT immutable**

Any law proposal with `principlesMask & 0x07 != 0` is permanently blocked. Monetary and judicial principles can be amended through the standard proposal path.

### 3.3 Reserve Ratio Enforcement

`PahlaviToken.sol` checks at every `mint()` call:

```solidity
require((totalReserves * 1000) / newSupply >= MIN_RESERVE_RATIO, "...");
```

This enforces 33.3% backing continuously, not just at issuance checkpoints.

### 3.4 Liquidity Cap

`kernel.sol` holds `LIQUIDITY_CAP = 900_000_000_000 * 1e18`. The cap is referenced in violation code TR-06. **However**, the cap is not directly enforced inside `PahlaviToken.mint()` — it is a trigger condition that relies on the Oracle to detect and flag the violation, not a hard revert at the token level.

---

## 4. Economic Doctrine Extraction

### 4.1 The 900 Billion PAH Cap

Source: whitepaper §39.1. Derivation:

| Category | Allocation (B PAH) |
|----------|--------------------|
| Wages (workforce × MIN_WAGE) | 480 |
| Government operations | 150 |
| B2B commercial circulation | 80 |
| C2C retail circulation | 50 |
| Strategic reserves buffer | 140 |
| **Total** | **900** |

The cap is not derived from monetary theory — it is a hard fiscal boundary sized to the real economy at launch.

### 4.2 The 33.3% Reserve Ratio

Source: monetary-protocol §2.1. The whitepaper describes this as "10× international standards" for reserve-backed currency. The 33.3% ratio means every 3 PAH in circulation must be backed by at least 1 PAH-equivalent in reserves held by the SWF.

### 4.3 SWF Layer Doctrine

| Layer | Target | Liquidity | Purpose |
|-------|--------|-----------|---------|
| L1 (نقد) | $300B | Full | Operational reserve |
| L2 (مولد) | $300B | Partial | 15% annual yield, funds welfare floor |
| L3 (گرو) | $2T | None | Strategic pledge, long-term |

L2 annual yield (15%) flows to L1 via `distributeAnnualYield()`. The L2 yield is the primary on-chain funding source for the 1,000 PAH/month welfare floor (whitepaper §38.2.2).

### 4.4 Dignity Floor Architecture

| Benefit | Amount | Duration | Contract |
|---------|--------|----------|----------|
| Minimum wage | 1,000 PAH/month | Ongoing | `CitizenCard.sol` (status tracking) |
| Unemployment insurance | 700 PAH/month | 18 months max | `CitizenCard.sol` |
| Annual health credit | 500 PAH/year | Annual | `CitizenCard.sol`, `HealthCoverage.sol` |
| Monthly drug quota | 100 PAH/month | Ongoing | `CitizenCard.sol`, `HealthCoverage.sol` |
| Maternity leave | 6,000 PAH | Per birth | `HealthCoverage.sol` |
| Disability supplement | 300–700 PAH/month | Per level | `DisabilitySupport.sol` |

**Finding:** The `CitizenCard.sol` tracks status and eligibility but does not transfer tokens. The actual PAH payment is not implemented on-chain in any current contract. Payment execution requires a disbursement contract not yet present in the repository.

### 4.5 30/70 Provincial Revenue Formula

`Provincial.sol` applies `PROVINCIAL_SHARE = 300` (30%) to oracle-reported revenue. The provincial allocation accumulates in `provincialBalance[provinceId]` mapping but there is no `withdrawProvincialFunds()` or equivalent spend function. The national 70% share is emitted as an event only — no actual token transfer occurs.

### 4.6 VelocityFee Doctrine

`VelocityFee.sol` reads `IPahlaviToken.balanceOf()` to calculate idle capital fees. The fee calculation is correct per doctrine. However, the collected fee is emitted as `FeeLevied` event only — no `burn()` or `transfer()` call is made. The velocity tax is a conceptual enforcement layer with no on-chain economic effect at `v0.1.0-stabilization`.

---

## 5. Missing Doctrine Documentation

The following doctrines are implemented in contracts but have no corresponding protocol document:

| Doctrine | Implemented In | Protocol Document | Status |
|----------|---------------|-------------------|--------|
| Biometric deduplication | `CitizenCard.sol`, `VotingSystem.sol` | None | Missing |
| Disability support levels (L1/L2/L3) | `DisabilitySupport.sol` | None | Missing |
| VRF jury randomness | `JurySelection.sol` | `justice-protocol-fa.md` §6 | Partial |
| Asset freeze lifecycle | `AssetFreeze.sol` | `reclaim-protocol-fa.md` | Partial |
| Candidate eligibility rules | `VotingSystem.sol` | None | Missing |
| Budget sector ratios | `BudgetAllocation.sol` | None | Missing |
| Health coverage benefits | `HealthCoverage.sol` | None | Missing |

The following protocol documents reference capabilities not yet reflected in any contract:

| Protocol Reference | Expected Contract | Status |
|-------------------|-------------------|--------|
| Defense protocol §5 (military asset freeze) | None | Unimplemented |
| Governance protocol §8 (inter-provincial arbitration) | None | Unimplemented |
| Monetary protocol §7 (foreign exchange controls) | None | Unimplemented |

---

## 6. Missing Enforcement

These are gaps between what the doctrine requires and what the code enforces.

### 6.1 Critical Gaps

**G-01: Liquidity cap is not a hard revert**
- Doctrine: 900B PAH is a hard constitutional ceiling (TR-06)
- Current: `LIQUIDITY_CAP` in kernel is a reference constant only; `PahlaviToken.mint()` does not check it
- Effect: Total supply can exceed 900B PAH without revert; breach only detectable via Oracle flag
- Severity: Critical

**G-02: VelocityFee has no economic effect**
- Doctrine: Idle capital above threshold is taxed to prevent hoarding (whitepaper §41.6)
- Current: `FeeLevied` event emitted; no `burn()` or `SWF.depositToL1()` call
- Effect: Velocity fee is advisory only; no actual redistribution occurs
- Severity: Critical

**G-03: Welfare payments are not disbursed on-chain**
- Doctrine: 1,000 PAH/month is a constitutional floor (whitepaper §38.2.2)
- Current: `CitizenCard.sol` tracks status; no disbursement contract exists
- Effect: The dignity floor is a data structure, not a payment system
- Severity: Critical

### 6.2 Significant Gaps

**G-04: Provincial funds cannot be spent**
- `provincialBalance` accumulates but no withdrawal function exists
- Provincial governments have no on-chain spending authority

**G-05: SWF → welfare payment pathway not implemented**
- L2 yield flows to L1 via `distributeAnnualYield()` but no mechanism routes L1 funds to citizen disbursements

**G-06: AssetFreeze does not transfer to SWF**
- `transferToSWF()` emits `AssetTransferredToSWF` event but calls no SWF function
- Frozen asset values exist only as a ledger record, not as actual SWF deposit

**G-07: API3Oracle violation flags are unlinked from kernel**
- `API3Oracle.flagViolation()` and `kernel.flagViolation()` are independent
- An Oracle feeder can flag a violation in the API3Oracle without it having any effect on the kernel's trigger mechanism

**G-08: ZKP verification is a placeholder throughout**
- Both `JurySelection.sol` and `VotingSystem.sol` accept any non-zero bytes as a valid ZK proof
- No cryptographic verification is performed

### 6.3 Minor Gaps

**G-09: Election result finalization not implemented**
- `Election.resultFinalized` field exists but no function sets it to `true`

**G-10: Candidate wallet is oracle address, not candidate address**
- `registerCandidate()` sets `candidate.wallet = msg.sender` (the oracle), not the actual candidate
- Candidates have no on-chain identity separate from the oracle that registered them

**G-11: MONETARY and JUDICIAL principles are amendable**
- `IMMUTABLE_PRINCIPLES_MASK = 0x07` protects only bits 0–2
- Monetary and judicial principles can be amended through standard law proposal — this may or may not be constitutionally intended

---

## 7. Architectural Risk Map

Severity: **Critical** = constitutionally contradictory | **High** = economic safety | **Medium** = operational | **Low** = cosmetic

### Critical Risks

| ID | Risk | Location | Description |
|----|------|----------|-------------|
| R-01 | Supply cap not enforced | `PahlaviToken.sol`, `kernel.sol` | TR-06 violation cannot self-prevent; depends on oracle liveness |
| R-02 | Dignity floor unenforceable | `CitizenCard.sol` | No disbursement mechanism; constitutional floor exists only as a variable |
| R-03 | VelocityFee is inert | `VelocityFee.sol` | Idle capital tax has zero economic effect; whitepaper §41.6 is unimplemented |

### High Risks

| ID | Risk | Location | Description |
|----|------|----------|-------------|
| R-04 | AssetFreeze → SWF link missing | `AssetFreeze.sol`, `SovereignWealthFund.sol` | Recovered national assets cannot be deposited on-chain |
| R-05 | Oracle violation channels are parallel and unlinked | `API3Oracle.sol`, `kernel.sol` | Two independent violation registries; no cross-contract enforcement |
| R-06 | Provincial spending locked | `Provincial.sol` | 30% provincial share accumulates with no withdrawal path |
| R-07 | ZKP is a stub | `JurySelection.sol`, `VotingSystem.sol` | Any non-zero bytes accepted as valid proof; full ZKP implementation is future work |
| R-08 | Welfare payment routing gap | `SovereignWealthFund.sol`, `CitizenCard.sol` | L2 yield reaches L1 but has no path to citizen disbursements |

### Medium Risks

| ID | Risk | Location | Description |
|----|------|----------|-------------|
| R-09 | Candidate wallet is oracle address | `VotingSystem.sol` | Candidates have no on-chain identity; oracle is surrogate |
| R-10 | Election result finalization missing | `VotingSystem.sol` | `resultFinalized` can never be set to `true` |
| R-11 | Role deployment is manual and error-prone | All contracts | No unified role registry or deployment script enforces correct role wiring |
| R-12 | MONETARY principle is amendable | `ConstitutionGuard.sol` | Bit 3 not in `IMMUTABLE_PRINCIPLES_MASK`; monetary doctrine can be amended |

### Low Risks

| ID | Risk | Location | Description |
|----|------|----------|-------------|
| R-13 | Budget fiscal year re-approval not handled | `BudgetAllocation.sol` | `budgetApproved` flag never resets; new fiscal year requires redeployment |
| R-14 | Provincial bonus spend path missing | `Provincial.sol` | `productivityScore > 70` bonus is calculated but not disbursable |

---

## Summary

At `v0.1.0-stabilization`, the IranOS codebase has **zero compile errors** and **33/33 tests passing**. All twelve core invariants match their constitutional sources. The trigger, reserve, and amendment-barrier mechanisms are correctly implemented.

The three critical gaps (R-01, R-02, R-03) represent the largest delta between doctrine and implementation: the supply cap relies entirely on oracle liveness, the dignity floor has no payment mechanism, and the velocity tax has no economic effect. These are not bugs in the stabilization sprint — they are planned Phase 2 implementation items. This report establishes the baseline from which those implementations should be measured.

**Next implementation priority (recommended order):**
1. `PahlaviToken.mint()` hard cap check against `LIQUIDITY_CAP` (R-01)
2. Welfare disbursement contract with SWF L1 routing (R-02, R-08)
3. `VelocityFee` real burn/deposit execution (R-03)
4. `AssetFreeze.transferToSWF()` real SWF call (R-04)
5. `Provincial.withdrawProvincialFunds()` (R-06)
