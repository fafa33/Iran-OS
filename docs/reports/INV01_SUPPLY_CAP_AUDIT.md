# INV-01 — PAH Supply Cap: Complete Authority Audit
## IranOS Step 12 Security Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** `contracts/monetary/PahlaviToken.sol`; `contracts/kernel.sol` (cap mirror); all 25 production contracts for mint-path verification; `contracts/fuzzing/FuzzPahlaviToken.sol` and `test/02_pahlavi_token.test.js` for coverage cross-reference

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 blocker.
> - This document does **not** close, audit, or make any completion claim about **INV-02 (Reserve Ratio Floor)**. INV-02 remains unaudited; its known `updateReserves()` gap is referenced here only where it intersects supply-cap reasoning.
> - No contracts, tests, CI, deployment scripts, fuzzing harnesses, or production code were modified.

---

## Table of Contents

1. [Invariant Definition](#1-invariant-definition)
2. [Doctrine Statement](#2-doctrine-statement)
3. [Threat Model](#3-threat-model)
4. [Cap Definition and State Map](#4-cap-definition-and-state-map)
5. [Mint-Path Enumeration](#5-mint-path-enumeration)
6. [Authority Analysis — Who Can Mint](#6-authority-analysis--who-can-mint)
7. [Cap Enforcement Point Analysis](#7-cap-enforcement-point-analysis)
8. [Burn / Remint Capacity Analysis](#8-burn--remint-capacity-analysis)
9. [Emergency-Mode Interaction](#9-emergency-mode-interaction)
10. [Reentrancy and Arithmetic Analysis](#10-reentrancy-and-arithmetic-analysis)
11. [Existing Coverage](#11-existing-coverage)
12. [Findings and Residual Risk](#12-findings-and-residual-risk)
13. [Recommended Follow-Up Tests](#13-recommended-follow-up-tests)
14. [Conclusion](#14-conclusion)

---

## 1. Invariant Definition

**ID:** INV-01
**Contract:** `PahlaviToken` (`contracts/monetary/PahlaviToken.sol`)
**Category:** Constitutional Monetary Cap (TR-06)
**Risk:** CRITICAL

### Invariant Statement

For all reachable states of `PahlaviToken` after deployment:

1. `totalSupply() <= MAX_SUPPLY` holds at all times, for every sequence of `mint()`, `burn()`, `transfer()`, `transferFrom()`, and any inherited ERC20 call.
2. No single `mint()` call can push `totalSupply()` above `MAX_SUPPLY`.
3. `MAX_SUPPLY` is an immutable constitutional constant — no function or role can modify it.
4. No cross-contract call path (SWF, Kernel, Treasury, oracle, trigger) can mint PAH outside `PahlaviToken.mint()`, and `mint()` always passes through the cap check.
5. The cap is a **standing-supply** ceiling (a ceiling on currently-circulating supply), not a lifetime-issuance ceiling. Burn followed by remint is intentional and does not breach the invariant.

### Constitutional Significance

`MAX_SUPPLY = 900_000_000_000 × 1e18` Pahlavi is the constitutional liquidity cap fixed by **منشور فرگرد ۷، بند ۴۱** and mirrored as **TR-06 (سقف نقدینگی)** in the Kernel. It is the on-chain guarantee that the national monetary base can never exceed 900 billion Pahlavi regardless of who holds the minting role. A breach would inflate the monetary base, violate the fundamental-rights guarantee of the Charter (منشور رفاه و عدالت), and constitute a TR-06 red-line violation that the trigger mechanism exists to prevent.

---

## 2. Doctrine Statement

Per IranOS doctrine (فرگرد ۷ منشور، بند ۳۹ و ۴۱ سپیدنامه), the Pahlavi currency is bound by four immutable rules, encoded verbatim in the contract NatSpec ([PahlaviToken.sol:12-18](../../contracts/monetary/PahlaviToken.sol)):

> ۱. سقف کل عرضه: ۹۰۰ میلیارد پهلوی — هیچ استثنایی ندارد
> ۲. ضرب (Mint) تنها با نسبت پشتوانه حداقل ۳۳.۳٪ مجاز است
> ۳. Minter فقط صندوق ثروت ملی است — بانک مرکزی یا دولت نمی‌توانند مستقیم ضرب کنند
> ۴. در وضعیت اضطراری ماشه، تمام انتقال‌ها متوقف می‌شوند

The supply cap (rule ۱) is therefore:
- A **constitutional constraint** — not a governance-tunable parameter.
- A **standing-supply limit** — the phrase «سقف کل عرضه» constrains total circulating supply at any instant; burn-and-remint within the ceiling is not a bypass.
- An **on-chain guarantee** — enforced by code at every mint, not by social convention.

INV-01 audits rule ۱ (the cap). Rule ۲ (reserve ratio) is **INV-02** and is explicitly out of scope. Rule ۳ (minter exclusivity) is examined here only insofar as it affects who can reach the cap. Rule ۴ (emergency halt) is examined in §9 only for its interaction with the cap.

---

## 3. Threat Model

The invariant must hold against an adversary who controls one or more of the following capabilities. For each, the question is: *can this actor cause `totalSupply()` to exceed `MAX_SUPPLY`?*

| # | Adversary capability | Vector considered | Cap outcome |
|---|---|---|---|
| T1 | Holds `MINTER_ROLE` (compromised or malicious SWF) | Call `mint()` with arbitrary `amount` | **Bounded** — `reserveCompliant` rejects `totalSupply()+amount > MAX_SUPPLY` |
| T2 | Holds `DEFAULT_ADMIN_ROLE` (Kernel/admin) | Grant `MINTER_ROLE` to additional addresses, then mint from many minters | **Bounded** — cap is global on `totalSupply()`, independent of minter count (§6, §8) |
| T3 | Holds `KERNEL_ROLE` | Call `updateReserves()` to inflate `totalReserves`, hoping to lift the cap | **Bounded** — `updateReserves()` never changes `totalSupply()`; the `newSupply <= MAX_SUPPLY` check is independent of reserves (see INV-03 test, §11). *(Reserve-floor abuse is INV-02, out of scope.)* |
| T4 | Holds `BURNER_ROLE` | Burn then remint to inflate cumulative issuance | **Outside invariant** — standing cap is never exceeded; cumulative issuance is intentionally uncapped (§8) |
| T5 | Any external caller | Reach an inherited ERC20 `_mint` path that bypasses the modifier | **Not reachable** — no public/external function other than `mint()` calls `_mint` (§5) |
| T6 | Reentrancy via `mint()`/`burn()` | Re-enter to double-mint within one tx | **Bounded** — `nonReentrant` on both; `_mint` updates supply before any external interaction (§10) |
| T7 | Arithmetic overflow on `totalSupply()+amount` | Wrap the cap check | **Not reachable** — Solidity 0.8.x checked arithmetic reverts on overflow (§10) |

The adversary is assumed unable to alter contract bytecode (no Kernel upgrade proxy — a fixed IranOS design constraint) and unable to change the `MAX_SUPPLY` constant (it is `constant`, embedded in bytecode).

---

## 4. Cap Definition and State Map

### 4.1 The cap constant

```solidity
// PahlaviToken.sol:36
uint256 public constant MAX_SUPPLY = 900_000_000_000 * 1e18;
```

`constant` ⇒ inlined into bytecode at compile time; no storage slot; unwritable by any function or role. The Kernel mirrors the same figure as `LIQUIDITY_CAP = 900_000_000_000 × 1e18` (TR-06), a documentation/governance mirror — `PahlaviToken` does not read the Kernel's constant, so the two must be kept numerically identical by review (see Finding F-3).

### 4.2 Supply-relevant state

| Symbol | Type | Written by | Role of cap logic |
|---|---|---|---|
| `totalSupply()` | ERC20 internal (`_totalSupply`) | `_mint` (increment), `_burn` (decrement) | The quantity the cap constrains |
| `MAX_SUPPLY` | `constant` | never | The ceiling |
| `totalReserves` | storage `uint256` | `updateReserves()` (KERNEL_ROLE), constructor | Used by the reserve-ratio half of the modifier (INV-02); **not** part of the cap check itself |
| `emergencyMode` | storage `bool` | `activateEmergencyMode` / `deactivateEmergencyMode` (PAUSER_ROLE) | Gates `mint()` via `notInEmergency` (§9) |

Key separation: the cap sub-check (`newSupply <= MAX_SUPPLY`) depends only on `totalSupply()` and the `constant`. It is arithmetically independent of `totalReserves`, so reserve manipulation cannot lift the cap (threat T3).

---

## 5. Mint-Path Enumeration

A repository-wide search for token issuance was performed:

```
grep -rn "_mint(|\.mint(" contracts/   # excluding PahlaviToken self-references
```

**Result: `PahlaviToken.mint()` is the sole issuance path in the entire 25-contract system.** No other contract (SovereignWealthFund, Treasury, Kernel, oracles, governance, welfare) calls `_mint` or `PahlaviToken.mint`.

### 5.1 The single mint path

```solidity
// PahlaviToken.sol:153-166
function mint(address to, uint256 amount, string calldata reason)
    external
    onlyRole(MINTER_ROLE)
    notInEmergency
    nonReentrant
    reserveCompliant(amount)        // ← cap check lives here
{
    require(to     != address(0), "PAH: mint to zero address");
    require(amount  > 0,          "PAH: mint zero amount");
    require(bytes(reason).length > 0, "PAH: reason required");
    _mint(to, amount);
    emit PahlaviMinted(to, amount, totalSupply(), reason);
}
```

### 5.2 Constructor — no genesis pre-mint

```solidity
// PahlaviToken.sol:102-119
constructor(address _swf, address _kernel, uint256 _initialReserves) ERC20("Pahlavi", "PAH") {
    ...
    totalReserves = _initialReserves;   // sets reserves only — never mints
    ...
}
```

The constructor sets roles and `totalReserves` but **issues zero PAH**; `totalSupply()` is `0` at deployment. There is no genesis allocation that could bypass the cap or seed supply above zero.

### 5.3 No inherited `_mint` exposure (threat T5)

OpenZeppelin's `ERC20._mint` is `internal`. `PahlaviToken` exposes exactly one wrapper around it — `mint()` — and that wrapper carries `reserveCompliant`. There is no public/external function that reaches `_mint` without the modifier. `transfer`/`transferFrom` are overridden to add `notInEmergency` and do not mint. Therefore every state transition that increases `totalSupply()` passes through the cap check.

**Conclusion:** the mint surface is a single, fully-guarded function. This is the structural property that makes INV-01 a "Low difficulty" invariant in the Echidna assessment.

---

## 6. Authority Analysis — Who Can Mint

### 6.1 Role → mint access

| Role | Constant | Granted to (constructor) | Can call `mint()`? |
|---|---|---|---|
| `MINTER_ROLE` | `keccak256("MINTER_ROLE")` | SWF (`_swf`) — [:116](../../contracts/monetary/PahlaviToken.sol) | **Yes** |
| `BURNER_ROLE` | `keccak256("BURNER_ROLE")` | SWF (`_swf`) | No (burn only) |
| `KERNEL_ROLE` | `keccak256("KERNEL_ROLE")` | Kernel (`_kernel`) | No |
| `PAUSER_ROLE` | `keccak256("PAUSER_ROLE")` | Kernel (`_kernel`) | No |
| `DEFAULT_ADMIN_ROLE` | OZ default | Kernel (`_kernel`) — [:114](../../contracts/monetary/PahlaviToken.sol) | No directly; **can grant `MINTER_ROLE`** |

### 6.2 Role rotation

`setSovereignWealthFund()` ([:232-241](../../contracts/monetary/PahlaviToken.sol)), callable only by `KERNEL_ROLE`, atomically revokes `MINTER_ROLE`/`BURNER_ROLE` from the old SWF and grants them to the new SWF. This preserves single-SWF minter intent across SWF migration.

### 6.3 Finding: admin can add minters, but the cap still binds (F-1)

Because `DEFAULT_ADMIN_ROLE` is held by the Kernel, the standard OpenZeppelin `grantRole(MINTER_ROLE, X)` path lets the admin authorize **additional** minters beyond the SWF. Doctrine rule ۳ ("Minter فقط صندوق ثروت ملی است") is therefore **enforced by Kernel/governance discipline, not hard-locked in `PahlaviToken`**.

**Critical distinction for INV-01:** this affects *minter exclusivity*, **not** *cap integrity*. The cap check in `reserveCompliant` operates on the global `totalSupply()`, so no matter how many minters exist or how they interleave their calls, the sum of all minted supply can never exceed `MAX_SUPPLY`. Every additional minter is still funnelled through the same guarded `mint()`. The supply-cap invariant (INV-01) holds unconditionally under threat T2; the minter-exclusivity property is a separate, weaker, discipline-based guarantee that INV-01 does not assert.

---

## 7. Cap Enforcement Point Analysis

### 7.1 The check

```solidity
// PahlaviToken.sol:83-91  (reserveCompliant modifier)
modifier reserveCompliant(uint256 mintAmount) {
    uint256 newSupply = totalSupply() + mintAmount;
    require(newSupply <= MAX_SUPPLY, "PAH: exceeds liquidity cap");   // ← INV-01 gate
    if (newSupply > 0) {
        uint256 ratio = (totalReserves * 1000) / newSupply;
        require(ratio >= MIN_RESERVE_RATIO, "PAH: reserve ratio below minimum 33.3%");  // INV-02
    }
    _;
}
```

The first `require` is the INV-01 enforcement point. It is evaluated **before** `_mint` runs (modifier body precedes the `_;`), so a failing check reverts the whole call and leaves `totalSupply()` unchanged.

### 7.2 Boundary behavior

- **At exactly the cap:** `newSupply == MAX_SUPPLY` ⇒ `<=` passes. A mint that brings supply to precisely 900 B PAH succeeds (covered by `INV-06a`).
- **One wei over:** `newSupply == MAX_SUPPLY + 1` ⇒ reverts `"PAH: exceeds liquidity cap"`; supply unchanged (covered by `INV-06b`).
- **Cap independent of reserves:** even with `totalReserves` maximised via `updateReserves()`, the cap `require` still blocks any overflow (covered by `INV-03`). This defeats threat T3.

### 7.3 View consistency

Three view functions report cap state and must agree with the gate:
- `remainingMintCapacity() = MAX_SUPPLY - totalSupply()` ([:255-257](../../contracts/monetary/PahlaviToken.sol))
- `canMint(amount)` returns `false` when `totalSupply()+amount > MAX_SUPPLY` ([:260-265](../../contracts/monetary/PahlaviToken.sol))
- `currentReserveRatio()` (reserve-side, INV-02 territory)

`remainingMintCapacity()` uses unchecked subtraction semantics safe under the invariant: since `totalSupply() <= MAX_SUPPLY` always holds (INV-01), the subtraction never underflows. This is a *consumer* of the invariant — correct only because INV-01 is maintained.

---

## 8. Burn / Remint Capacity Analysis

### 8.1 Burn mechanics

```solidity
// PahlaviToken.sol:174-186
function burn(address from, uint256 amount, string calldata reason)
    external onlyRole(BURNER_ROLE) nonReentrant
{
    require(from != address(0), ...);
    require(amount > 0, ...);
    require(balanceOf(from) >= amount, "PAH: insufficient balance");
    require(bytes(reason).length > 0, ...);
    _burn(from, amount);
    emit PahlaviBurned(from, amount, totalSupply(), reason);
}
```

`_burn` decreases `totalSupply()`. Burn has **no cap check** — and correctly so: reducing supply can never breach an upper bound.

### 8.2 Standing-cap semantics and capacity recycling

Because the cap constrains the *current* `totalSupply()` (not a lifetime counter), every burn increases `remainingMintCapacity()` by the burned amount, re-opening room to mint:

```
mint A (supply = A)  →  burn b (supply = A − b)  →  remainingMintCapacity = MAX_SUPPLY − (A − b)
```

A burn-then-remint cycle can therefore re-issue PAH up to the cap repeatedly. **Cumulative lifetime issuance is intentionally uncapped; standing supply is hard-capped.** This is consistent with doctrine «سقف کل عرضه» (a ceiling on total *circulating* supply) and with monetary practice where retired currency frees issuance headroom.

### 8.3 Invariant preservation across recycling

At no point in any `mint`/`burn` interleaving does `totalSupply()` exceed `MAX_SUPPLY`: mints are gated by the cap; burns only decrease supply. Threat T4 does not violate INV-01. The Echidna property `echidna_supply_cap` exercises exactly these interleavings and holds (§11).

> **Note (not a finding against INV-01):** burn-then-remint *does* change `totalReserves`-to-`totalSupply` ratio dynamics, which is reserve-floor (INV-02) territory and out of scope here. No claim is made about reserve-ratio behavior under recycling.

---

## 9. Emergency-Mode Interaction

`mint()` carries the `notInEmergency` modifier ([:72-75, :156](../../contracts/monetary/PahlaviToken.sol)): when `emergencyMode == true` (set by `PAUSER_ROLE` = Kernel during a trigger event), **all minting halts**. Emergency mode strictly *tightens* the cap posture — it can only prevent mints, never enable an over-cap mint. `transfer`/`transferFrom` are likewise halted.

Asymmetry to record: `burn()` does **not** carry `notInEmergency`, so burning remains possible during an emergency. With respect to INV-01 this is benign (burning only lowers supply, never breaches the ceiling). Whether burn-during-emergency is desirable from a freeze-integrity standpoint is a separate question outside the supply-cap invariant and is noted as F-4 for follow-up, not adjudicated here.

---

## 10. Reentrancy and Arithmetic Analysis

### 10.1 Reentrancy (threat T6)

Both `mint()` and `burn()` are `nonReentrant`. Within `_mint`, OpenZeppelin updates `_totalSupply` and balances **before** emitting events and before any external call; there is no external callback in the mint path that could re-enter prior to the supply update. A reentrant double-mint within a single transaction is therefore impossible, and even absent the guard the cap check reads the live `totalSupply()` on each call.

### 10.2 Arithmetic (threat T7)

`newSupply = totalSupply() + mintAmount` uses Solidity 0.8.x checked arithmetic. An `amount` large enough to wrap the addition reverts on overflow before the `require` is even evaluated, so the cap cannot be bypassed by integer overflow. `MAX_SUPPLY = 9e11 × 1e18 ≈ 9e29` sits far below `2^256 − 1 ≈ 1.16e77`, so legitimate values never approach the type ceiling.

---

## 11. Existing Coverage

### 11.1 Hardhat (`test/02_pahlavi_token.test.js`)

| Label | What it asserts | Maps to |
|---|---|---|
| `INV-06a` ([:380](../../test/02_pahlavi_token.test.js)) | mint bringing supply to exactly `MAX_SUPPLY` succeeds | §7.2 boundary (at cap) |
| `INV-06b` ([:388](../../test/02_pahlavi_token.test.js)) | mint exceeding `MAX_SUPPLY` by 1 wei reverts; supply unchanged | §7.2 boundary (over cap) |
| `INV-03` ([:397](../../test/02_pahlavi_token.test.js)) | `updateReserves()` never mints; cap gate still blocks after reserves maximised | §4.2, threat T3 |
| basic cap revert ([:77](../../test/02_pahlavi_token.test.js)) | over-cap mint reverts with `"PAH: exceeds liquidity cap"` | §7.1 |
| `canMint` over cap ([:196](../../test/02_pahlavi_token.test.js)) | `canMint(huge)` returns `false` | §7.3 view consistency |

*(The `INV-0x` labels inside this Hardhat file belong to the earlier Step 35/36 "Monetary Expansion Boundary" numbering and predate the current Step-12 INV audit series. They are cited here as evidence of behavioral coverage, not as the INV-01 deliverable.)*

### 11.2 Echidna (`contracts/fuzzing/FuzzPahlaviToken.sol`)

```solidity
function echidna_supply_cap() public view returns (bool) {
    return token.totalSupply() <= token.MAX_SUPPLY();
}
```

- **Status: PASSING.** The harness grants itself `MINTER_ROLE`/`BURNER_ROLE`/`KERNEL_ROLE` and fuzzes `doMint`/`doBurn`/`doUpdateReserves` interleavings; `totalSupply() <= MAX_SUPPLY` is never violated. This empirically validates §5–§8: the single guarded mint path holds the cap under arbitrary call sequences and under capacity recycling.
- A failure of this property would indicate harness misconfiguration, not a contract bug — consistent with this audit's structural conclusion.

### 11.3 Coverage verdict

Cap *behavior* (boundary, over-cap revert, reserve-independence, fuzzed interleavings) is **well covered**. The gaps are edge cases the current tests do not explicitly pin — enumerated in §13.

---

## 12. Findings and Residual Risk

| ID | Severity | Finding | INV-01 cap impact |
|---|---|---|---|
| **F-1** | Informational | `DEFAULT_ADMIN_ROLE` (Kernel) can `grantRole(MINTER_ROLE, …)`, so minter exclusivity (doctrine rule ۳) is discipline-enforced, not hard-locked. | **None.** Cap is global on `totalSupply()` and binds every minter (§6.3, threat T2). |
| **F-2** | Informational | Cap is standing-supply, so burn→remint allows unbounded *cumulative* issuance within the ceiling. | **By design.** Standing cap never exceeded (§8). Matches doctrine «سقف کل عرضه». |
| **F-3** | Low | `MAX_SUPPLY` (PahlaviToken) and `LIQUIDITY_CAP` (Kernel, TR-06) are independent literals; nothing enforces numeric equality at compile or runtime. | Indirect — drift would desync the constitutional figure across contracts. Recommend an explicit equality assertion test (§13, R-4). |
| **F-4** | Low | `burn()` lacks `notInEmergency`; burning is possible during an emergency halt. | **None on INV-01** (burn only lowers supply). Freeze-integrity question is outside supply-cap scope; flagged for separate review. |
| **F-5** | Informational | `reserveCompliant` couples the cap check and the reserve-ratio check in one modifier. The cap sub-check is arithmetically independent of `totalReserves` (verified §4.2, §7.2). | **None.** Documented so that any future change to the reserve half does not silently weaken the cap half. |

**No defect was found that allows `totalSupply()` to exceed `MAX_SUPPLY`.** Under the stated threat model (T1–T7), the supply-cap invariant holds.

### Out-of-scope reference (not a finding here)

INV-02 (Reserve Ratio Floor) has a known, separately-tracked gap: `updateReserves()` accepts any value with no post-update floor guard (Echidna `echidna_reserve_ratio` fails in the privileged harness; documented as forward-looking and not currently production-reachable via the Kernel). **This audit makes no claim about INV-02 and does not close it.** It is mentioned only to delimit the boundary of INV-01: reserve manipulation does not affect the *cap* (§4.2, §7.2), even though it is the crux of INV-02.

---

## 13. Recommended Follow-Up Tests

*Specification only — no tests are written by this document.* These pin edge cases not explicitly covered by the existing suite (§11):

| ID | Proposed test | Closes |
|---|---|---|
| R-1 | **Burn→remint recycle:** mint to exact `MAX_SUPPLY`, burn `b`, then remint exactly `b` — succeeds and lands at the cap; remint of `b+1` reverts. | F-2, §8 standing-cap semantics |
| R-2 | **Multi-minter cap binding:** Kernel grants `MINTER_ROLE` to a second address; two minters interleave mints; aggregate cannot exceed `MAX_SUPPLY` (over-cap step from either minter reverts). | F-1, threat T2 |
| R-3 | **Emergency-mode cap posture:** with `emergencyMode == true`, `mint()` reverts `"PAH: system in emergency mode"` regardless of available capacity; cap state unchanged. | §9 |
| R-4 | **Cross-contract constant equality:** assert `PahlaviToken.MAX_SUPPLY() == kernel.LIQUIDITY_CAP()` in an integration test. | F-3 |
| R-5 | **View/gate agreement under recycling:** property test that `canMint(x)` and `remainingMintCapacity()` stay consistent with the actual `mint()` revert/success across a mint/burn sequence. | §7.3 |

Echidna: the existing `echidna_supply_cap` is sufficient for the core property; an optional extension is to add a second receiver/minter actor to strengthen the multi-minter assurance behind R-2. (Not implemented here.)

---

## 14. Conclusion

`PahlaviToken` enforces the INV-01 PAH supply cap through a **single, fully-guarded mint path**. `mint()` is the only function in the entire 25-contract system that increases `totalSupply()`, and it always evaluates `totalSupply() + amount <= MAX_SUPPLY` before issuing. The constructor mints nothing; no inherited `_mint` path is publicly reachable; checked arithmetic and `nonReentrant` close the overflow and reentrancy vectors. The cap is **global on standing supply**, so it binds every minter regardless of how many the admin authorizes (F-1) and is preserved across burn-and-remint recycling (F-2). Both the Hardhat suite (`INV-06a/06b`, `INV-03`) and the Echidna property (`echidna_supply_cap`, PASSING) confirm the behavior empirically.

**Assessment:** INV-01 holds under the stated threat model. Residual items (F-1…F-5) are informational/low and do not permit a cap breach; recommended follow-up tests R-1…R-5 would raise traceability and pin edge cases but are not prerequisites for the cap's correctness.

This document is analysis only. No production code, tests, CI configuration, deployment scripts, fuzzing harnesses, or doctrine were modified. No production-readiness, external-audit, or formal-verification completion is claimed, and no Step 12 blocker is closed. **INV-02 (Reserve Ratio Floor) and INV-09 remain unaudited and untouched by this work.**
