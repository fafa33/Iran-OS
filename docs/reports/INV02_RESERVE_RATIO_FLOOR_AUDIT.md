# INV-02 — Reserve Ratio Floor: Complete Enforcement Audit
## IranOS Step 12 Security Analysis

**Version:** 1.1.1
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** `contracts/monetary/PahlaviToken.sol`; `contracts/kernel.sol` (ratio constant mirror, `KERNEL_ROLE` holder); all 25 production contracts for reserve-writer verification; `contracts/fuzzing/FuzzPahlaviToken.sol` and `test/02_pahlavi_token.test.js` for coverage cross-reference; doctrine: `docs/architecture/MONETARY_EXPANSION_CONSTRAINTS.md`, `docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md`

> **Amendment note (v1.1.0, 2026-06-15)**
> This revision reconciles the report with existing IranOS doctrine in response to two Codex review comments on PR #65:
> 1. **Overflow precision** — a low-severity, privileged, self-inflicted, recoverable overflow/DoS sub-case is now documented (§6, CF-7).
> 2. **Standing-invariant reconciliation** — doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) §"Reserve-Ratio Breach Conditions") recognizes the post-update sub-floor state as a *breach-relevant condition*. The v1.0.0 "standing contract invariant is violated" framing and the "design-completeness gap / latent-CRITICAL" CF-1 classification were corrected.
>
> **Amendment note (v1.1.1, 2026-06-15)** — addresses three Codex review comments on PR #66:
> - **(a) Doctrine over-reading corrected.** v1.1.0 overstated doctrine by calling `updateReserves` non-gating "doctrinally intentional," citing GAP-MEX-04/05 and a "load-bearing design feature" quote. This is withdrawn: GAP-MEX-04/05 are **open** reserve **composition/provenance** gaps ([RESERVE_RUNTIME_GAP_REGISTER.md:139,301](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) and do **not** approve non-gating; the "load-bearing design feature" quote ([:400](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) applies to **oracle-vs-Kernel role gating / oracle non-sovereignty**, not to the absence of a reserve-ratio floor guard. Doctrine recognizes the reachable post-update state and prescribes a response but **does not rule out a floor guard**. CF-1's remediation is therefore **open/undecided**, with multiple candidate paths (§7.2, §9, §15). The breach-detection→TR-05/TR-06 mapping is itself an **open** gap (GAP-MEX-06, [:314](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)).
> - **(b) Standing-invariant contradiction fixed.** §2's residual "standing guarantee / must never outrun reserves" language is reconciled with §1 (mint-time hard gate + open breach-relevant post-update condition).
> - **(c) Constructor overflow path added.** CF-7 now covers the `_initialReserves` constructor path and corrects the recoverability claim (recovery requires a `KERNEL_ROLE` holder that can call `updateReserves`; under production Kernel wiring it cannot, so an oversized-reserve deployment is **not** recoverable in-place and must be redeployed).
> The correction is to this report's framing only. No doctrine, contract, test, or fuzz harness is changed. INV-02 is not claimed fixed; GAP-MEX-04/05/06 are not closed.

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 / STEP9-BLOCK-* blocker.
> - This document does **not** claim INV-02 is fixed. It documents an invariant that is enforced at mint time, with an open post-update breach-relevant dimension (CF-1) whose remediation is undecided by doctrine.
> - No contracts, tests, CI, deployment scripts, fuzzing harnesses, or production code were modified. No fix is implemented.
> - INV-09 is untouched and not referenced.

---

## Table of Contents

1. [Invariant Statement](#1-invariant-statement)
2. [Constitutional / Monetary Doctrine Context](#2-constitutional--monetary-doctrine-context)
3. [Files and Functions Reviewed](#3-files-and-functions-reviewed)
4. [Reserve Accounting Architecture](#4-reserve-accounting-architecture)
5. [Authority Model](#5-authority-model)
6. [Reserve-Ratio Calculation Logic](#6-reserve-ratio-calculation-logic)
7. [Enforcement Map](#7-enforcement-map)
8. [Threat Model](#8-threat-model)
9. [Findings](#9-findings)
10. [Reachability and Severity Framing](#10-reachability-and-severity-framing)
11. [Existing Hardhat Coverage](#11-existing-hardhat-coverage)
12. [Existing Echidna Coverage and Known Failure](#12-existing-echidna-coverage-and-known-failure)
13. [Missing Evidence](#13-missing-evidence)
14. [Proposed Follow-Up Tests R-1..R-8](#14-proposed-follow-up-tests-r-1r-8)
15. [Remediation Guidance](#15-remediation-guidance)
16. [Conclusion](#16-conclusion)

---

## 1. Invariant Statement

**ID:** INV-02
**Contract:** `PahlaviToken` (`contracts/monetary/PahlaviToken.sol`)
**Category:** Constitutional Monetary Safeguard (reserve backing)
**Risk:** HIGH for the monitoring/breach-routing dimension (see §10); the mint-time gate itself is sound

### What the doctrine actually requires (two-part invariant)

INV-02 is **not** a single standing contract invariant that must hold after every reserve movement. Per IranOS doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md)), the reserve-ratio floor is composed of two distinct obligations:

**(a) Hard mint-time gate (preventive, contract-enforced).**
> At the instant of a `mint()` call, `(totalReserves * 1000) / (totalSupply() + mintAmount) >= MIN_RESERVE_RATIO` (= 333). No mint may *create* a sub-floor ratio; there is no averaging, forecasting, or "grow into compliance" path.

This is fully enforced by `reserveCompliant` and is the primary line of defense. **It holds and is well-tested** (§7.1, §11).

**(b) Post-update breach condition (detective + remediative, governance-routed).**
> If an authorized `updateReserves()` (reflecting a genuine reserve drop, confirmed loss, or reclassification) leaves `currentReserveRatio() < MIN_RESERVE_RATIO` for the existing supply, the system has entered a **doctrine-recognized breach-relevant condition**. Doctrine requires this state to be (i) treated as making further expansion ineligible (already enforced by `reserveCompliant`), (ii) routed through the existing Kernel/Court violation-flagging channels (TR-05/TR-06), and (iii) corrected via `burn`/contraction — **not** prevented by ratio-gating `updateReserves`.

The contract **can** reach a post-update sub-floor state, and doctrine **recognizes** this reachable state ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection (monitoring)"). The open audit question is therefore **not only** "is the floor enforced at mint time" (it is) but **"how should the reachable post-update sub-floor condition be detected and remediated, and is any such path implemented and evidenced?"** Doctrine names the condition as breach-relevant but **leaves the remediation undecided** — it neither mandates nor forbids a preventive `updateReserves` floor guard (§7.2, §9 CF-1, §15).

---

## 2. Constitutional / Monetary Doctrine Context

`MIN_RESERVE_RATIO = 333` encodes doctrine rule ۲ of the Pahlavi currency (فرگرد ۷ منشور، بند ۳۹ و ۴۱ سپیدنامه), recorded verbatim in the contract NatSpec ([PahlaviToken.sol:12-18](../../contracts/monetary/PahlaviToken.sol)):

> ۲. ضرب (Mint) تنها با نسبت پشتوانه حداقل ۳۳.۳٪ مجاز است

The 33.3% floor is the monetary-discipline guarantee that circulating Pahlavi is backed by at least one-third hard reserves. It is a constitutional constraint, not a governance-tunable parameter: `MIN_RESERVE_RATIO` is an immutable `constant` in both `PahlaviToken` ([:39](../../contracts/monetary/PahlaviToken.sol)) and the Kernel (`MIN_RESERVE_RATIO = 333`, [kernel.sol:55](../../contracts/kernel.sol)), and the Kernel re-exposes it read-only through `getConstants()` ([kernel.sol:516](../../contracts/kernel.sol)).

Doctrine framing of the figure:
- A **constitutional constraint** — not a configurable policy parameter.
- A **backing-ratio floor** that the doctrine intends backing to honor on an ongoing basis. **How that intent is realized at the contract level is two-part** (consistent with §1): it is *enforced as a hard gate at mint time*, and a *reserve drop that pushes the existing supply below the floor is recognized as a breach-relevant condition* to be detected and remediated. The ongoing "backing must hold" intent is therefore a **doctrine-level breach concern**, **not** a property the contract currently enforces continuously after every reserve movement.
- Accordingly, this report does **not** treat INV-02 as a standing contract-enforced invariant. Where the doctrinal text reads as an ongoing guarantee, that obligation manifests on-chain today only at mint time (preventive); the post-update direction is the open breach-detection/remediation question (§7.2, §9 CF-1, §10).

INV-01 (PAH Supply Cap) audits doctrine rule ۱ and is enforced as a standing contract invariant. INV-02 audits doctrine rule ۲ and is the subject here; it is **enforced at mint time** and **not closed** on the post-update breach-detection/remediation dimension.

---

## 3. Files and Functions Reviewed

### 3.1 Files

| File | Role |
|---|---|
| [contracts/monetary/PahlaviToken.sol](../../contracts/monetary/PahlaviToken.sol) | Primary target — reserve storage, ratio modifier, update, views |
| [contracts/kernel.sol](../../contracts/kernel.sol) | `MIN_RESERVE_RATIO` mirror; sole `KERNEL_ROLE` holder |
| [contracts/fuzzing/FuzzPahlaviToken.sol](../../contracts/fuzzing/FuzzPahlaviToken.sol) | `echidna_reserve_ratio` property (FAILING in privileged harness) |
| [test/02_pahlavi_token.test.js](../../test/02_pahlavi_token.test.js) | Mint-time floor + reserve tests |
| [test/01_kernel.test.js](../../test/01_kernel.test.js), [test/08_Trigger_Protocol.test.js](../../test/08_Trigger_Protocol.test.js) | Kernel constant assertions |
| [docs/reports/ECHIDNA_READINESS_ASSESSMENT.md](./ECHIDNA_READINESS_ASSESSMENT.md) | §INV-02, §7.1 — documented gap |
| [docs/reports/INV01_SUPPLY_CAP_AUDIT.md](./INV01_SUPPLY_CAP_AUDIT.md) | Adjacent finding F-5 (modifier coupling) |
| [docs/architecture/MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) | **Governing doctrine** — defines the mint-time hard gate and recognizes the post-update sub-floor as a breach-relevant condition with a response direction (Kernel/Court flagging + `burn`); does **not** rule on whether `updateReserves` should be floor-gated (added in v1.1.0; scope clarified in v1.1.1) |
| [docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md) | **Governing doctrine** — registers **open** reserve **composition/provenance** gaps GAP-MEX-04 ([:139](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) and GAP-MEX-05 ([:301](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)), and the **open** breach-condition→TR-05/TR-06 mapping gap GAP-MEX-06 ([:314](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)). The "load-bearing design feature" language ([:400](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) concerns **oracle non-sovereignty / role-gating**, not `updateReserves` floor-gating (corrected in v1.1.1) |

A repo-wide grep for `updateReserves` / `totalReserves` writers across all 25 contracts was performed to confirm reserve write authority (§5).

### 3.2 Functions

| Function | Location | Role in the floor |
|---|---|---|
| `reserveCompliant(mintAmount)` modifier | [:83-91](../../contracts/monetary/PahlaviToken.sol) | **Sole enforcement point.** `(totalReserves*1000)/newSupply >= 333`; mint-time only; skipped when `newSupply == 0` |
| `mint()` | [:153-166](../../contracts/monetary/PahlaviToken.sol) | Carries `reserveCompliant` |
| `burn()` | [:174-186](../../contracts/monetary/PahlaviToken.sol) | Decreases supply (raises ratio); no ratio check; does not touch reserves |
| `updateReserves(newReserves)` | [:197-203](../../contracts/monetary/PahlaviToken.sol) | **Sole post-deploy reserves writer.** `onlyKernel`; accepts any `uint256` incl. 0; **no floor guard, no post-update ratio re-check** |
| `currentReserveRatio()` view | [:248-252](../../contracts/monetary/PahlaviToken.sol) | `supply==0 → 1000`; else `(totalReserves*1000)/supply` |
| `canMint(amount)` view | [:260-265](../../contracts/monetary/PahlaviToken.sol) | Cap check, then ratio on `newSupply` |
| constructor | [:102-119](../../contracts/monetary/PahlaviToken.sol) | Seeds `totalReserves = _initialReserves`; mints nothing |

---

## 4. Reserve Accounting Architecture

`totalReserves` ([:52](../../contracts/monetary/PahlaviToken.sol)) is a single `uint256` storage scalar representing the **dollar value of backing reserves in 1e18 units**, as asserted by the reserve authority. Properties:

1. **Standalone scalar.** It is not derived on-chain from `SovereignWealthFund` balances, token holdings, or any other contract's state. It is an *asserted figure* recorded into `PahlaviToken` storage.
2. **Two writers only.** The constructor (`_initialReserves`, deploy-time) and `updateReserves()` (runtime). No other code path mutates it (grep-verified across all 25 contracts).
3. **No reconciliation.** There is no on-chain mechanism that checks `totalReserves` against actual custodied assets. Its truthfulness is a trust assumption on the `KERNEL_ROLE` holder / its upstream oracle (Finding CF-3).
4. **Decoupled from supply.** `totalReserves` and `totalSupply()` move independently: minting raises supply (and is floor-gated); `updateReserves()` moves reserves (and is **not** floor-gated). Nothing binds the two between mints.

The `ReservesUpdated` event ([:63](../../contracts/monetary/PahlaviToken.sol), emitted at [:202](../../contracts/monetary/PahlaviToken.sol)) records `(oldReserves, newReserves, reserveRatioInThousandths)` — including a sub-floor ratio, with no accompanying breach signal (Finding CF-5).

---

## 5. Authority Model

| Authority | Constant / source | Holder | Can write `totalReserves`? |
|---|---|---|---|
| `KERNEL_ROLE` | `keccak256("KERNEL_ROLE")` | `IranOS_Kernel` (granted [:115](../../contracts/monetary/PahlaviToken.sol)) | **Yes** — via `updateReserves()` (`onlyKernel`) |
| `MINTER_ROLE` | — | SWF | No (mint only) |
| `BURNER_ROLE` | — | SWF | No (burn only) |
| `PAUSER_ROLE` | — | Kernel | No |
| `DEFAULT_ADMIN_ROLE` | OZ default | Kernel | No directly (could grant `KERNEL_ROLE`) |
| deploy-time | constructor arg | deployer | `_initialReserves` once |

### 5.1 The authority/reachability disconnect (key structural fact)

`updateReserves()` is gated to `KERNEL_ROLE`, held by `IranOS_Kernel`. **However, a grep across all 25 production contracts confirms `IranOS_Kernel` contains no function that calls `PahlaviToken.updateReserves()`.** The reserve-update authority therefore exists but is **not exercised by any current production transaction path**. Reserves can only be changed today by (a) the constructor, or (b) a future Kernel function that does not yet exist, or (c) a test/EOA directly holding `KERNEL_ROLE` in a non-production deployment.

This disconnect frames the analysis (§10): the post-update sub-floor state is doctrine-recognized as breach-relevant (§7.2), and the `updateReserves` entry is not reachable on current production logic — so the open work is choosing and implementing a detection/remediation path (preventive floor guard, soft-signal, TR-05/TR-06 routing, or `burn`; §15) to accompany any future reserve-sync wiring. *(The constructor `_initialReserves` overflow path, CF-7 entry c, is reachable at genesis independent of this and is a separate deploy-time concern.)*

---

## 6. Reserve-Ratio Calculation Logic

All three ratio computations use the same expression, `(totalReserves * 1000) / supply`, with integer (floor) division:

```solidity
// reserveCompliant modifier — PahlaviToken.sol:83-91 (mint-time)
modifier reserveCompliant(uint256 mintAmount) {
    uint256 newSupply = totalSupply() + mintAmount;
    require(newSupply <= MAX_SUPPLY, "PAH: exceeds liquidity cap");        // INV-01
    if (newSupply > 0) {
        uint256 ratio = (totalReserves * 1000) / newSupply;
        require(ratio >= MIN_RESERVE_RATIO, "PAH: reserve ratio below minimum 33.3%");  // INV-02
    }
    _;
}
```

Observations:
- **Basis of the mint check:** post-mint `newSupply` (correct — guarantees the *resulting* state meets the floor at that instant).
- **Floor-division bias is conservative.** A true ratio of 332.9 computes to `332` and is rejected; the rounding direction never permits a sub-floor mint. INV-02 cannot be breached *at mint time* by rounding (threat T7).
- **`supply == 0` handling is consistent:** the modifier skips the ratio check when `newSupply == 0` (vacuous), and both views return `1000` for zero supply ([:250](../../contracts/monetary/PahlaviToken.sol), [:263](../../contracts/monetary/PahlaviToken.sol)). No division-by-zero path exists.
- **Overflow (precision note — CF-7).** `totalReserves * 1000` is checked 0.8.x arithmetic and overflows when `totalReserves > (2²⁵⁶−1)/1000 ≈ 1.158e74`. For honest operation this is unreachable — the realistic maximum (`$300B × 1e18 = 3e29`) is ~1e44× smaller. However, the overflow **is** reachable via two distinct entry points, so the v1.0.0 phrasing "no overflow path is reachable in practice" is corrected:
  - **(a) `updateReserves` entry, `totalSupply() > 0`:** `updateReserves(type(uint256).max)` **reverts inside `updateReserves` itself** — the `newReserves * 1000` term ([:201](../../contracts/monetary/PahlaviToken.sol)) overflows under checked arithmetic. A huge-reserve state therefore cannot be *introduced* while supply is positive.
  - **(b) `updateReserves` entry, `totalSupply() == 0`:** `updateReserves(type(uint256).max)` **succeeds** (the ratio branch short-circuits to `1000`, no multiply) and sets `totalReserves = max`.
  - **(c) Constructor entry:** the constructor accepts an **arbitrary, unbounded** `_initialReserves` ([:112](../../contracts/monetary/PahlaviToken.sol)) — no upper-bound check. Deploying with `_initialReserves > (2²⁵⁶−1)/1000` creates the same oversized-reserve, zero-supply state **at genesis, without any `updateReserves` call**.
  - In the resulting state (b or c), every subsequent `mint()` reverts (the `reserveCompliant` multiply at [:87](../../contracts/monetary/PahlaviToken.sol) overflows) and `canMint()` **reverts instead of returning `false`** ([:264](../../contracts/monetary/PahlaviToken.sol)) — a mint/`canMint` denial-of-service. (`currentReserveRatio()` returns `1000` early while supply is 0, so it does not revert.)
  - **Recoverability (corrected).** Recovery requires a `KERNEL_ROLE` holder that can call `updateReserves(sane)`. This is **conditional**, not guaranteed:
    - In a non-production / test deployment where `KERNEL_ROLE` is an EOA, the holder calls `updateReserves(sane)` (supply still 0, call succeeds) and minting resumes — recoverable.
    - Under the **production Kernel wiring described in §5.1**, `KERNEL_ROLE` is held by `IranOS_Kernel`, which has **no function that calls `updateReserves`**. Such a deployment therefore **cannot recover in-place** and **must be redeployed**. This applies to both the constructor path (c) and the `updateReserves` path (b).
  - **Classification:** LOW / documentation precision and deployment-time hygiene. It requires an absurd ~1e74 value no honest oracle or deployer would supply; entry (a) is self-blocking; entries (b)/(c) are not production-routed for *introduction* but, once introduced, may be **unrecoverable under production wiring** (redeploy required). It does not change CF-1's posture. Recorded as CF-7 (§9), with the constructor sub-case also a deploy-time validation item.

---

## 7. Enforcement Map

### 7.1 Mint-time enforcement — PRESENT

`mint()` always passes through `reserveCompliant`. A mint that would leave the post-mint ratio below 333 reverts `"PAH: reserve ratio below minimum 33.3%"` and changes no state. This is the **only** point at which the floor is actively enforced, and it is enforced correctly (covered by tests, §11).

### 7.2 `updateReserves()` is not ratio-gated; remediation is open (CF-1)

```solidity
// PahlaviToken.sol:197-203
function updateReserves(uint256 newReserves) external onlyKernel {
    uint256 old = totalReserves;
    totalReserves = newReserves;                 // accepts ANY value, including 0
    uint256 supply = totalSupply();
    uint256 ratio = supply > 0 ? (newReserves * 1000) / supply : 1000;
    emit ReservesUpdated(old, newReserves, ratio);   // ratio computed, but never checked
}
```

`updateReserves()` computes the resulting ratio **only to emit it** — there is **no `require`** enforcing `ratio >= MIN_RESERVE_RATIO`. Consequently, after a healthy mint, a call to `updateReserves(x)` with `x` low enough (e.g. `0`) drives the current ratio below the floor with no revert. The mint-time modifier does not re-validate the ratio against existing supply when reserves decrease.

**The non-gating is a known, reachable condition whose remediation doctrine has not settled — it is neither confirmed as intentional design nor confirmed as a bug.** What doctrine actually says:
- [MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) ("Post-Update Detection") **recognizes** that the post-update sub-floor state is reachable "since `updateReserves` is not itself ratio-gated" and prescribes a *response direction* (treat further expansion as ineligible, route through Kernel/Court TR-05/TR-06, correct via `burn`/contraction). It describes how to handle the state; it **does not state that a preventive floor guard is prohibited or undesirable**.
- [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md): GAP-MEX-04 ([:139](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) and GAP-MEX-05 ([:301](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) are **open** gaps about the *composition/provenance* of `totalReserves`, **not** approval of non-gating. GAP-MEX-06 ([:314](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) — mapping a breach-relevant condition onto a TR-05/TR-06 flag — is also **open**. The "load-bearing design feature, not an enforcement shortfall" language ([:400](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) is about **oracle non-sovereignty / role-gating** (`updateReserves` being `onlyKernel`, not oracle-callable), **not** about the absence of a reserve-ratio floor check. *(v1.1.0 misattributed this quote; corrected in v1.1.1.)*

**Candidate remediation paths are open and undecided** (not foreclosed by this report):
  a. a **preventive floor guard** on `updateReserves` (hard revert when the post-update ratio < 333);
  b. a **soft-signal / event-based breach detector** (e.g. a distinct `ReserveFloorBreached` event in addition to `ReservesUpdated`, addressing CF-5);
  c. **TR-05/TR-06 breach routing** through the existing Kernel/Court channels (the GAP-MEX-06 mapping);
  d. **`burn`/contraction or reserve-composition correction** to restore the ratio.

A *hard* floor guard (path a) may be in tension with recording a **genuine** reserve loss, confirmed loss, or reclassification — a state doctrine clearly contemplates `updateReserves` reflecting — and so **requires doctrine review**; but it is **not ruled out**. This report does **not** direct maintainers away from a floor guard.

The audit-relevant consequences are therefore: *(1)* the post-update sub-floor state is reachable; *(2)* doctrine recognizes it as breach-relevant; *(3)* whether/how it is detected and remediated (paths a–d) is an open question, and there is no test or runtime evidence that any such path is implemented (§10, §13, CF-1 in §9). The mint-time gate continues to block any further expansion from such a state automatically.

### 7.3 Burn interaction — BENIGN

`burn()` lowers `totalSupply()`, which *raises* `(totalReserves*1000)/supply`. Burning can only move the ratio further above the floor; it can never breach it, and it does not touch `totalReserves`. No ratio check on burn is needed (threat T4).

### 7.4 Emergency interaction — BENIGN TO FLOOR (CF-4)

`mint()` carries `notInEmergency`, so during an emergency halt no new supply can be created and the floor cannot be freshly breached by minting. `updateReserves()` does **not** carry `notInEmergency`, so reserves remain mutable during an emergency. With respect to the floor this is benign (no minting can occur to exploit a low ratio), though it is recorded as CF-4 for completeness and for any freeze-integrity review.

---

## 8. Threat Model

| # | Capability | Vector | Floor outcome |
|---|---|---|---|
| T1 | `MINTER_ROLE` | `mint()` beyond reserve backing | **Bounded** — `reserveCompliant` reverts at mint time |
| T2 | `KERNEL_ROLE` | `updateReserves(0)` / low value after a mint | **Reachable, breach-relevant, remediation open** — non-gating lets a genuine reserve loss be recorded; the resulting sub-floor is a doctrine-recognized breach condition whose detection/remediation (preventive guard, soft-signal, TR-05/TR-06 routing, or `burn`) is undecided; further expansion stays blocked by the mint-time gate (CF-1) |
| T3 | `KERNEL_ROLE` | `updateReserves()` during emergency | Possible (no `notInEmergency`); benign to floor (minting already halted) |
| T4 | `BURNER_ROLE` | burn to manipulate ratio | **Benign** — burn raises ratio |
| T5 | Oracle (future) | oracle → kernel → `updateReserves` sync wired before the breach-monitoring/routing path | **Monitoring obligation becomes live** — a genuine reserve drop must be detected and routed (TR-05/TR-06) + remediated, not silently absorbed (CF-1, CF-2) |
| T8 | `KERNEL_ROLE` **or deployer** | `updateReserves(~uint256.max)` at `supply == 0`, **or** constructor `_initialReserves > 2²⁵⁶⁄1000` | **Self-inflicted; recoverable only if a `KERNEL_ROLE` holder can call `updateReserves`** — bricks `mint()`/`canMint()` via overflow; under production Kernel wiring (no `updateReserves` call path) the deployment is **unrecoverable in-place and must be redeployed** (CF-7) |
| T6 | Reserve reporter | assert a false `totalReserves` scalar | **Trust assumption** — floor correctness depends on honest `KERNEL_ROLE`/oracle (CF-3) |
| T7 | Integer rounding | exploit floor division at the boundary | **Not exploitable** — rounds down, conservative |

The adversary is assumed unable to alter bytecode (no Kernel upgrade proxy — fixed IranOS design constraint) or change `MIN_RESERVE_RATIO` (a `constant`).

---

## 9. Findings

| ID | Severity | Finding | Floor impact |
|---|---|---|---|
| **CF-1** | HIGH (open breach-detection/remediation gap — §10) | `updateReserves()` is not ratio-gated, so a post-update reserve drop can leave the existing supply below the 333 floor. Doctrine **recognizes** this reachable state as a **breach-relevant condition** ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection") but does **not** decide its remediation. The open gap: no detection/remediation path — preventive floor guard, soft-signal breach event, TR-05/TR-06 routing (the open GAP-MEX-06), or `burn`/contraction — is implemented or evidenced. A hard floor guard is **not ruled out** but may conflict with recording a genuine reserve loss and needs doctrine review. | **Not a mint-time defect.** The mint-time gate still blocks all further expansion from a sub-floor state. The Echidna "failure" (§12) reflects the *privileged harness* reaching this reachable state, not a confirmed production bug. |
| **CF-2** | Informational | `updateReserves()` NatSpec states it is "called by API3Oracle through Kernel" ([:194-196](../../contracts/monetary/PahlaviToken.sol)); no such routing exists in `IranOS_Kernel`. Documentation describes unbuilt behavior. | Indirect — when the route is built, the doctrine-mandated breach-monitoring/routing (CF-1) must be in place so a genuine reserve drop is flagged and remediated, not silently absorbed. |
| **CF-3** | Low (trust) | `totalReserves` is a trusted asserted scalar with no on-chain reconciliation against `SovereignWealthFund` or custodied assets. | The floor's economic meaning inherits full trust in the reserve reporter. |
| **CF-4** | Informational | `updateReserves()` lacks `notInEmergency`; reserves are mutable during an emergency halt. | None on the floor (minting halted); noted for freeze-integrity review. |
| **CF-5** | Informational | A sub-floor `updateReserves()` emits `ReservesUpdated` carrying the sub-floor ratio but raises no *distinct* breach signal and does not revert. | **Most directly actionable part of CF-1's monitoring gap.** `ReservesUpdated` is the on-chain hook a monitor would watch, but there is no dedicated breach event/flag; the doctrine-mandated detection currently rests on off-chain interpretation of the emitted ratio. |
| **CF-6** | Informational (cross-ref INV-01 F-5) | The cap check and the ratio check are coupled in the single `reserveCompliant` modifier. | Structural — documents the coupling so future edits to one half don't silently weaken the other. |
| **CF-7** | LOW (documentation precision + deploy-time hygiene) | An oversized `totalReserves` (`> 2²⁵⁶⁄1000`) at `supply == 0` makes `mint()` revert and `canMint()` revert (rather than return `false`) on the `totalReserves * 1000` overflow — a mint/`canMint` DoS. Two entry points: (b) `updateReserves(max)` at `supply == 0`; (c) **constructor** `_initialReserves` (unbounded, [:112](../../contracts/monetary/PahlaviToken.sol)). At `supply > 0` the `updateReserves` call itself reverts (entry a). | None on the floor. Requires an absurd ~1e74 value. **Recoverable only if a `KERNEL_ROLE` holder can call `updateReserves(sane)`**; under production Kernel wiring (no such call path, §5.1) entries (b)/(c) are **unrecoverable in-place → redeploy required**. Constructor path is also a deploy-time validation item. Corrects v1.0.0/"fully recoverable" wording (§6). |

**No defect permits a sub-floor state to be reached *at mint time*.** The substantive open item is CF-1: the post-update sub-floor state is reachable and doctrine-recognized as breach-relevant, and its detection/remediation is undecided (preventive guard, soft-signal, TR-05/TR-06 routing, or `burn` — none implemented/evidenced). This report does not assert that a floor guard is wrong, nor that it is required; the choice is a doctrine-review item.

---

## 10. Reachability and Severity Framing

This framing is the core of the audit and must not be collapsed into a single label:

1. **Mint-time floor holds.** Every supply increase is gated; no mint can produce a sub-floor resulting state (§7.1, tests §11). At mint instants, INV-02's preventive obligation is enforced and correct.
2. **Post-update sub-floor is reachable and doctrine-recognized; remediation is open.** Between mints, `updateReserves()` can lower reserves with no floor re-check. Doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection") **recognizes** this reachable state as breach-relevant and gives a response direction (Kernel/Court flagging + `burn`), so the ledger can still record a genuine reserve loss — but it does **not** decide whether `updateReserves` should additionally carry a preventive floor guard. `RESERVE_RUNTIME_GAP_REGISTER.md`'s GAP-MEX-04/05 are **open composition/provenance** gaps (not approval of non-gating), and GAP-MEX-06 (breach→TR-05/TR-06 mapping) is **open**; the "load-bearing design feature" quote there concerns oracle non-sovereignty, not floor-gating. The earlier "standing contract invariant is violated" framing was incorrect; the v1.1.0 "non-gating is doctrinally intentional" framing **over-read** doctrine and is likewise corrected. The accurate statement: INV-02 is enforced at mint time; the post-update breach-detection/remediation is open and undecided.
3. **The open gap is breach-detection/remediation and its evidence — and the remediation is undecided.** For the reachable post-update breach condition, no path is implemented or evidenced: there is no preventive floor guard, no dedicated on-chain breach signal (only the generic `ReservesUpdated` event, CF-5), no breach→TR-05/TR-06 mapping (the open GAP-MEX-06), and no test/runtime evidence of `burn`/contraction routing end-to-end. Doctrine does not select among these; a hard floor guard is a legitimate candidate that needs doctrine review (loss-recording tension) but is not foreclosed. This is the substantive, presently-open item.
4. **Authority-gated and not production-routed today.** The only post-deploy reserve writer is `updateReserves()`, gated to `KERNEL_ROLE`, and **no function in `IranOS_Kernel` calls it** (§5.1, grep-verified). So a post-update sub-floor state cannot arise from `updateReserves` on current production logic; the breach-detection/remediation obligation becomes live once oracle-to-token reserve sync is wired (CF-2), and a chosen path (a–d) must be in place **with it**. *(Note: the constructor `_initialReserves` path, CF-7 entry c, is reachable at genesis independent of this routing — a deploy-time validation concern.)*

**Net classification:** *Mint-time gate sound and enforced; the post-update sub-floor is a reachable, doctrine-recognized breach condition whose detection and remediation are open and undecided (preventive guard, soft-signal, TR-05/TR-06 routing, or `burn` — none implemented/evidenced; GAP-MEX-06 open). Not confirmed as either intentional design or a contract bug; classification of the fix is a doctrine-review item.* This is consistent with the Echidna result (§12), which exercises the reachable state in a privileged harness. **INV-02 is enforced at mint time and not closed on the post-update breach-detection/remediation dimension. It is not, today, a standing contract-enforced invariant.**

---

## 11. Existing Hardhat Coverage

In [test/02_pahlavi_token.test.js](../../test/02_pahlavi_token.test.js):

| Location | What it asserts | Maps to |
|---|---|---|
| `:82-86` | `updateReserves(0)` then `mint()` reverts on the floor | §7.1 (mint blocked after reserve drop) |
| `:182` | `currentReserveRatio()` returns `1000` at zero supply | §6 zero-supply handling |
| `:187-188` | `updateReserves()` emits `ReservesUpdated` | §4 event |
| `:269-340` (DG-03) | reserve-recognition path expands mint capacity and preserves ratio protection; unauthorized `updateReserves()` reverts; authorized emits | §5 authority, §7.1 |
| `INV-05a` (`:357`) | mint leaving ratio exactly 333 succeeds | §6 boundary (floor pass) |
| `INV-05b` (`:368`) | mint leaving ratio 332 reverts; supply unchanged | §6 boundary (floor reject) |
| `INV-02` (`:410`) | reserve ratio floor enforced across multi-step mint; blocked step leaves supply unchanged | §7.1 multi-step |

Kernel constant mirrored and asserted: [test/01_kernel.test.js:55,494](../../test/01_kernel.test.js); snapshot-neutrality across triggers: [test/08_Trigger_Protocol.test.js](../../test/08_Trigger_Protocol.test.js).

**Coverage verdict:** the **mint-time** floor is well covered (boundary, multi-step, authority, zero-supply). **No test pins the standing-floor gap (CF-1)** — i.e. that a post-mint `updateReserves(0)` can leave `currentReserveRatio() < 333` with no revert. That is the principal coverage hole (§13, and R-3 in §14).

*(The `INV-0x` labels inside this Hardhat file belong to the earlier Step 35/36 "Monetary Expansion Boundary" numbering and predate the current Step-12 INV audit series; they are cited as behavioral evidence, not as the INV-02 deliverable.)*

---

## 12. Existing Echidna Coverage and Known Failure

`contracts/fuzzing/FuzzPahlaviToken.sol` defines:

```solidity
function echidna_reserve_ratio() public view returns (bool) {
    uint256 supply = token.totalSupply();
    if (supply == 0) return true;
    return (token.totalReserves() * 1000) / supply >= token.MIN_RESERVE_RATIO();
}
```

- **Status: FAILING in the privileged harness.** The harness grants itself `MINTER_ROLE`/`BURNER_ROLE`/`KERNEL_ROLE`, so it can call `updateReserves()` directly.
- **Confirmed counterexample:** `doMint(1) → doUpdateReserves(0)` — found within the first ~500 iterations. After: `totalSupply = 1`, `totalReserves = 0` ⇒ `(0*1000)/1 = 0 < 333` ⇒ property fails.
- **Interpretation (v1.1.0, refined v1.1.1):** the "failure" is the harness reaching the post-update sub-floor state (CF-1) — `updateReserves()` is not ratio-gated, and the harness holds `KERNEL_ROLE` to call it. The property as written encodes a *standing* ratio invariant; doctrine does **not** require the contract to enforce that continuously (the floor is a mint-time gate), and the property does not encode the breach-detection/remediation obligation. The result therefore flags a **reachable** state doctrine recognizes as breach-relevant — it is **not** by itself a confirmed contract bug, and it is **not** evidence that the state is intended; whether to prevent it (floor guard) or detect+remediate it (signal/routing/`burn`) is open (§7.2, §10).
- **Production reachability:** the harness reaches the state only because it holds `KERNEL_ROLE` and calls `updateReserves()` itself; `IranOS_Kernel` exposes no such call, so the sequence is **not reproducible from production logic** (§5.1, §10).
- **Documented classification:** *forward-looking, not currently exploitable* ([ECHIDNA_READINESS_ASSESSMENT.md §INV-02](./ECHIDNA_READINESS_ASSESSMENT.md)). A future harness aligned to doctrine would assert the *breach-routing* path (detect → flag → `burn`), not a standing ratio.

The harness and its result are reported here as evidence; **they are not modified by this audit.**

---

## 13. Missing Evidence

- **What doctrine does and does not say (precise statement).** [MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) ("Post-Update Detection") **recognizes** the post-update sub-floor state ("since `updateReserves` is not itself ratio-gated") and gives a response *direction* (treat further expansion as ineligible, route through Kernel/Court TR-05/TR-06, correct via `burn`/contraction). It does **not** decide whether `updateReserves` should carry a preventive floor guard — so neither "no doctrine decision exists" (the v1.0.0 claim, withdrawn) nor "doctrine mandates monitoring-not-gating" (the v1.1.0 over-reading, withdrawn) is accurate. The correct statement: **doctrine recognizes the condition and leaves the remediation mechanism open.**
- **The actual missing evidence is an *implemented and evidenced* detection/remediation path of any of the open kinds** (preventive floor guard / soft-signal breach event / TR-05/TR-06 routing per the open GAP-MEX-06 / `burn` contraction). Today there is only the generic `ReservesUpdated` event (CF-5) and no test or runtime artifact showing a post-update sub-floor condition is detected, flagged, and remediated end-to-end.
- **No Hardhat test characterizes the post-update sub-floor behavior** — no test asserts that a post-mint `updateReserves(0)` leaves `currentReserveRatio() < 333` *without reverting* while the mint-time gate continues to block further expansion (the reachable state, as distinct from "minting is blocked afterward").
- **No constructor reserve-bound check / deploy-time validation** (CF-7 entry c) — nothing prevents or flags an oversized `_initialReserves` at genesis, and under production wiring such a deployment is unrecoverable in-place.
- **No on-chain SWF ↔ token reserve reconciliation spec** (CF-3) — the trust boundary of the reserve scalar is undocumented.
- **GAP-MEX-04, GAP-MEX-05, GAP-MEX-06 remain Open** in [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md); this report does not close them.

---

## 14. Proposed Follow-Up Tests R-1..R-8

*Specification only — no tests are written by this document. These pin current behavior; R-3 is a characterization of the CF-1 gap and must be labeled as documenting current (gapped) behavior, not endorsing it.*

| ID | Proposed test | Pins |
|---|---|---|
| R-1 | Mint-time floor boundary: ratio exactly 333 mints; 332 reverts `"PAH: reserve ratio below minimum 33.3%"`. | §7.1 (relabels/extends INV-05a/b under INV-02) |
| R-2 | `updateReserves()` authority: only `KERNEL_ROLE` succeeds (emits `ReservesUpdated`); SWF / council / stranger revert. | §5 |
| R-3 | **CF-1 characterization:** mint at a healthy ratio → `updateReserves(0)` **succeeds (no revert)** → assert `currentReserveRatio() < 333`, `canMint(small) == false`, and the next `mint()` reverts on the floor. Documents the reachable post-update sub-floor state (doctrine-recognized breach condition; remediation undecided), without asserting it is correct or a defect. | §7.2, §10 |
| R-8 | **CF-7 overflow precision:** at `supply == 0`, `updateReserves(type(uint256).max)` succeeds; subsequent `mint()` reverts and `canMint(x)` reverts on overflow; if `KERNEL_ROLE` can call `updateReserves(sane)` minting resumes. At `supply > 0`, `updateReserves(type(uint256).max)` itself reverts. **Constructor variant:** deploying with `_initialReserves > 2²⁵⁶⁄1000` reproduces the zero-supply DoS at genesis. | §6, CF-7 |
| R-4 | Burn raises ratio: mint, burn, assert `currentReserveRatio()` strictly increases; burn never floor-blocked. | §7.3 |
| R-5 | Emergency interaction: `updateReserves()` callable during emergency; `mint()` still halted; ratio math consistent. | §7.4 |
| R-6 | View/gate agreement: `currentReserveRatio()`, `canMint()`, and actual `mint()` outcomes agree at the 333/332 boundary; `supply==0 → 1000`. | §6 |
| R-7 | Cross-contract constant equality: `token.MIN_RESERVE_RATIO() == kernel.MIN_RESERVE_RATIO() == 333`. | §2 |

---

## 15. Remediation Guidance

1. **No contract patch is made in this task.** This is an analysis-only audit; `updateReserves()`, the constructor, and all reserve/emergency logic are left unchanged. No remediation is implemented or prescribed.
2. **The remediation is open and undecided — present the options, do not pick one.** Doctrine recognizes the post-update sub-floor as breach-relevant but does not select a mechanism (§7.2, §13). The candidate paths, all requiring doctrine review, are:
   - **(a) Preventive floor guard** on `updateReserves` (revert when post-update ratio < 333). **Not ruled out by doctrine**, but in tension with recording a *genuine* reserve loss/reclassification — so it would need a carve-out or an explicit attested-loss path. This report does **not** advise against it.
   - **(b) Soft-signal / event-based detection** — emit a distinct breach event (e.g. `ReserveFloorBreached`) alongside `ReservesUpdated`, addressing CF-5, without blocking the update.
   - **(c) TR-05/TR-06 breach routing** — implement the open GAP-MEX-06 mapping so a breach-relevant condition raises a Kernel/Court flag.
   - **(d) `burn`/contraction or reserve-composition correction** to restore the ratio after a recognized breach.
   These are not mutually exclusive (e.g. b+c+d together, or a with a loss carve-out). Choosing among them is a **doctrine-review item, out of scope** for this analysis-only task.
3. **Sequencing constraint.** When oracle-to-token reserve synchronization is eventually wired into the Kernel (the route CF-2 anticipates), a chosen detection/remediation path **must be implemented first or simultaneously**, so a genuine reserve drop is flagged/remediated rather than silently absorbed (§10). Separately, **deploy-time validation of `_initialReserves`** (CF-7 entry c) should bound the constructor input.
4. **Interim (recommended next step):** add the test-only characterization suite (§14) — especially R-3 (reachable post-update sub-floor) and R-8 (CF-7 overflow incl. constructor variant) — to pin current behavior, and produce open-options documentation describing the candidate detection/remediation paths (a–d) for doctrine review. Tests are deferred — not implemented in this task. **No contract change.**

---

## 16. Conclusion

**Mint-time reserve-floor enforcement holds.** At every mint, `reserveCompliant` checks the ratio against the post-mint supply, and no mint can produce a sub-floor resulting state — this preventive obligation is sound and well-tested.

**The post-update sub-floor state is reachable and doctrine-recognized as breach-relevant; whether it is a bug or acceptable depends on an undecided remediation choice.** `updateReserves()` is not ratio-gated, so a reserve drop can leave existing supply below the floor — a state doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection") names as breach-relevant and gives a response direction for, while allowing `updateReserves` to record a genuine reserve loss. Doctrine does **not** decide whether a preventive floor guard should also exist; this report does **not** treat non-gating as settled-intentional, and it does **not** direct maintainers away from a floor guard. The v1.1.0 over-reading (citing GAP-MEX-04/05 — which are open *composition/provenance* gaps — and an oracle-non-sovereignty "load-bearing design feature" quote as approval of non-gating) is corrected in this revision. The Echidna result exercises the reachable state in a privileged harness; on current production logic the `updateReserves` entry is unreachable (`IranOS_Kernel` never calls it, §5.1).

**The genuine open item is the breach-detection/remediation dimension** (CF-1, CF-5), whose mechanism is undecided: candidate paths are a preventive floor guard, a soft-signal breach event, TR-05/TR-06 routing (the open GAP-MEX-06), or `burn`/contraction (§15) — **none implemented or evidenced**. A chosen path must accompany any future oracle-to-token reserve sync (CF-2). A LOW-severity overflow item (CF-7) — reachable via `updateReserves` at zero supply *or* via an unbounded constructor `_initialReserves`, and **unrecoverable in-place under production Kernel wiring** — is also recorded.

**INV-02 is enforced at mint time and not closed on the post-update breach-detection/remediation dimension. It is not claimed fixed, and its remediation is not prescribed.** The recommended next step is **test-only characterization** (R-1…R-8) plus **open-options documentation** of the candidate remediation paths for doctrine review, with **no contract patch**.

This document is analysis only. No production code, tests, CI configuration, deployment scripts, fuzzing harnesses, or doctrine were modified. No production-readiness, external-audit, or formal-verification completion is claimed; no STEP9-BLOCK-* blocker is closed; **GAP-MEX-04/05/06 are not closed**; INV-02 is **not** claimed fixed. INV-09 is untouched.
