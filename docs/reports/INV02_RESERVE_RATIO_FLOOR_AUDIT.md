# INV-02 — Reserve Ratio Floor: Complete Enforcement Audit
## IranOS Step 12 Security Analysis

**Version:** 1.1.0
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** `contracts/monetary/PahlaviToken.sol`; `contracts/kernel.sol` (ratio constant mirror, `KERNEL_ROLE` holder); all 25 production contracts for reserve-writer verification; `contracts/fuzzing/FuzzPahlaviToken.sol` and `test/02_pahlavi_token.test.js` for coverage cross-reference; doctrine: `docs/architecture/MONETARY_EXPANSION_CONSTRAINTS.md`, `docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md`

> **Amendment note (v1.1.0, 2026-06-15)**
> This revision reconciles the report with existing IranOS doctrine in response to two Codex review comments on PR #65:
> 1. **Overflow precision** — a low-severity, privileged, self-inflicted, recoverable overflow/DoS sub-case is now documented (§6, CF-7).
> 2. **Standing-invariant reconciliation** — doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) §"Reserve-Ratio Breach Conditions", and [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) explicitly recognizes the post-update sub-floor state as a *breach-relevant condition* to be routed to monitoring / Kernel-Court / burn remediation, **not** prevented by a contract-level floor guard. The v1.0.0 "standing contract invariant" framing and CF-1 "design-completeness gap / latent-CRITICAL" classification are corrected accordingly (§1, §7.2, §9 CF-1, §10, §13). The v1.0.0 mint-time analysis is unchanged and stands.
> The correction is to this report's framing only. No doctrine, contract, test, or fuzz harness is changed.

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 / STEP9-BLOCK-* blocker.
> - This document does **not** claim INV-02 is fixed. It documents an invariant that is enforced at mint time, with an open monitoring / breach-routing dimension (CF-1) handled by doctrine rather than by a contract floor guard.
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

The contract **can** reach a post-update sub-floor state, and doctrine **expects** it can ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection (monitoring)"). The open audit question is therefore **not** "why is `updateReserves` missing a floor guard" — its non-gating is intentional (§7.2, §9 CF-1) — but **"is the doctrine-mandated monitoring / breach-routing path implemented and evidenced?"** (§10, §13).

---

## 2. Constitutional / Monetary Doctrine Context

`MIN_RESERVE_RATIO = 333` encodes doctrine rule ۲ of the Pahlavi currency (فرگرد ۷ منشور، بند ۳۹ و ۴۱ سپیدنامه), recorded verbatim in the contract NatSpec ([PahlaviToken.sol:12-18](../../contracts/monetary/PahlaviToken.sol)):

> ۲. ضرب (Mint) تنها با نسبت پشتوانه حداقل ۳۳.۳٪ مجاز است

The 33.3% floor is the monetary-discipline guarantee that circulating Pahlavi is backed by at least one-third hard reserves. It is a constitutional constraint, not a governance-tunable parameter: `MIN_RESERVE_RATIO` is an immutable `constant` in both `PahlaviToken` ([:39](../../contracts/monetary/PahlaviToken.sol)) and the Kernel (`MIN_RESERVE_RATIO = 333`, [kernel.sol:55](../../contracts/kernel.sol)), and the Kernel re-exposes it read-only through `getConstants()` ([kernel.sol:516](../../contracts/kernel.sol)).

Doctrine framing of the figure:
- A **constitutional constraint** — not a configurable policy parameter.
- A **backing-ratio floor** — circulating supply must never outrun reserves beyond a 3:1 ratio.
- The doctrinal text reads as a **standing** guarantee (backing must hold continuously), which is precisely why the mint-only enforcement (§7) leaves a doctrine-relevant gap.

INV-01 (PAH Supply Cap) audits doctrine rule ۱ and is **closed at the standing-invariant level**. INV-02 audits doctrine rule ۲ and is the subject here; it is **not** closed at the standing level.

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
| [docs/architecture/MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) | **Governing doctrine** — defines the mint-time hard gate, the post-update breach-relevant condition, and the Kernel/Court + `burn` remediation direction (added in v1.1.0) |
| [docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md) | **Governing doctrine** — registers the `updateReserves`/`reserveCompliant` boundary as GAP-MEX-04/05, framed as "a load-bearing design feature, not an enforcement shortfall" (added in v1.1.0) |

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

This disconnect frames the analysis (§10): the post-update sub-floor state is a doctrine-recognized, by-design condition (§7.2), and today it is not even reachable on production logic — so the open work is the monitoring/breach-routing path that must accompany any future reserve-sync wiring, not a contract floor guard.

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
- **Overflow (precision note — CF-7).** `totalReserves * 1000` is checked 0.8.x arithmetic and overflows when `totalReserves > (2²⁵⁶−1)/1000 ≈ 1.158e74`. For honest operation this is unreachable — the realistic maximum (`$300B × 1e18 = 3e29`) is ~1e44× smaller. However, the overflow **is** reachable as a *privileged, self-inflicted* sub-case, so the v1.0.0 phrasing "no overflow path is reachable in practice" is corrected:
  - `updateReserves(type(uint256).max)` with `totalSupply() > 0` **reverts inside `updateReserves` itself** — the `newReserves * 1000` term ([:201](../../contracts/monetary/PahlaviToken.sol)) overflows under checked arithmetic. A huge-reserve state therefore cannot coexist with positive supply.
  - `updateReserves(type(uint256).max)` with `totalSupply() == 0` **succeeds** (the ratio branch short-circuits to `1000`, no multiply) and sets `totalReserves = max`. In that state, every subsequent `mint()` reverts (the `reserveCompliant` multiply at [:87](../../contracts/monetary/PahlaviToken.sol) overflows), and `canMint()` **reverts instead of returning `false`** ([:264](../../contracts/monetary/PahlaviToken.sol)) — a temporary mint/`canMint` denial-of-service.
  - **Classification:** LOW / documentation precision. It is `KERNEL_ROLE`-only, self-inflicted, **not production-routed** (the Kernel never calls `updateReserves` — §5.1), requires an absurd ~1e74 value no honest oracle would report, and is **fully recoverable** by the Kernel calling `updateReserves(sane)` (supply is still 0, so the call succeeds and minting resumes). It does not change CF-1's posture and is the same authority-gated, non-routed class. Recorded as CF-7 (§9).

---

## 7. Enforcement Map

### 7.1 Mint-time enforcement — PRESENT

`mint()` always passes through `reserveCompliant`. A mint that would leave the post-mint ratio below 333 reverts `"PAH: reserve ratio below minimum 33.3%"` and changes no state. This is the **only** point at which the floor is actively enforced, and it is enforced correctly (covered by tests, §11).

### 7.2 `updateReserves()` is intentionally not ratio-gated (CF-1)

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

**This non-gating is doctrinally intentional, not a missing guard.** Per [MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) ("Post-Update Detection") and [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md) (GAP-MEX-04/05), `updateReserves` must be able to record a *genuine* reserve loss, confirmed loss, or reclassification — including one that lowers the ratio below 333. Hard-reverting such an update would prevent the ledger from reflecting reality and is therefore **rejected by doctrine**, which instead treats the resulting sub-floor state as a *breach-relevant condition* to be flagged and remediated (Kernel/Court routing + `burn`/contraction), never "grown into" by further expansion. The gap register explicitly calls this boundary "a load-bearing design feature, not an enforcement shortfall."

The audit-relevant consequence is therefore **not** "the contract is missing a floor guard," but: *the post-update sub-floor state is reachable by design, and the open question is whether the doctrine-mandated monitoring / breach-routing path is implemented and evidenced* (§10, §13, CF-1 in §9). The mint-time gate continues to block any further expansion from such a state automatically.

### 7.3 Burn interaction — BENIGN

`burn()` lowers `totalSupply()`, which *raises* `(totalReserves*1000)/supply`. Burning can only move the ratio further above the floor; it can never breach it, and it does not touch `totalReserves`. No ratio check on burn is needed (threat T4).

### 7.4 Emergency interaction — BENIGN TO FLOOR (CF-4)

`mint()` carries `notInEmergency`, so during an emergency halt no new supply can be created and the floor cannot be freshly breached by minting. `updateReserves()` does **not** carry `notInEmergency`, so reserves remain mutable during an emergency. With respect to the floor this is benign (no minting can occur to exploit a low ratio), though it is recorded as CF-4 for completeness and for any freeze-integrity review.

---

## 8. Threat Model

| # | Capability | Vector | Floor outcome |
|---|---|---|---|
| T1 | `MINTER_ROLE` | `mint()` beyond reserve backing | **Bounded** — `reserveCompliant` reverts at mint time |
| T2 | `KERNEL_ROLE` | `updateReserves(0)` / low value after a mint | **By design** — non-gating is intentional so genuine reserve loss is recorded; the resulting sub-floor is a doctrine-recognized breach condition to be monitored/routed/`burn`-remediated, and further expansion stays blocked by the mint-time gate (CF-1) |
| T3 | `KERNEL_ROLE` | `updateReserves()` during emergency | Possible (no `notInEmergency`); benign to floor (minting already halted) |
| T4 | `BURNER_ROLE` | burn to manipulate ratio | **Benign** — burn raises ratio |
| T5 | Oracle (future) | oracle → kernel → `updateReserves` sync wired before the breach-monitoring/routing path | **Monitoring obligation becomes live** — a genuine reserve drop must be detected and routed (TR-05/TR-06) + remediated, not silently absorbed (CF-1, CF-2) |
| T8 | `KERNEL_ROLE` | `updateReserves(~uint256.max)` at `supply == 0` | **Self-inflicted, recoverable** — bricks `mint()`/`canMint()` via overflow until `updateReserves(sane)`; not production-routed (CF-7) |
| T6 | Reserve reporter | assert a false `totalReserves` scalar | **Trust assumption** — floor correctness depends on honest `KERNEL_ROLE`/oracle (CF-3) |
| T7 | Integer rounding | exploit floor division at the boundary | **Not exploitable** — rounds down, conservative |

The adversary is assumed unable to alter bytecode (no Kernel upgrade proxy — fixed IranOS design constraint) or change `MIN_RESERVE_RATIO` (a `constant`).

---

## 9. Findings

| ID | Severity | Finding | Floor impact |
|---|---|---|---|
| **CF-1** | HIGH (monitoring/evidence gap, not a contract bug — §10) | `updateReserves()` is intentionally not ratio-gated, so a genuine reserve loss can be recorded; the resulting post-update sub-floor state is a **doctrine-recognized breach-relevant condition** ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md) GAP-MEX-04/05). The real open gap is whether the doctrine-mandated **monitoring / Kernel-Court breach-routing / `burn` remediation** path is implemented and evidenced — not a missing contract floor guard. | **Not a mint-time defect.** The mint-time gate still blocks all further expansion from a sub-floor state. The Echidna "failure" (§12) reflects the *privileged-harness* reaching this by-design state, not a production bug. |
| **CF-2** | Informational | `updateReserves()` NatSpec states it is "called by API3Oracle through Kernel" ([:194-196](../../contracts/monetary/PahlaviToken.sol)); no such routing exists in `IranOS_Kernel`. Documentation describes unbuilt behavior. | Indirect — when the route is built, the doctrine-mandated breach-monitoring/routing (CF-1) must be in place so a genuine reserve drop is flagged and remediated, not silently absorbed. |
| **CF-3** | Low (trust) | `totalReserves` is a trusted asserted scalar with no on-chain reconciliation against `SovereignWealthFund` or custodied assets. | The floor's economic meaning inherits full trust in the reserve reporter. |
| **CF-4** | Informational | `updateReserves()` lacks `notInEmergency`; reserves are mutable during an emergency halt. | None on the floor (minting halted); noted for freeze-integrity review. |
| **CF-5** | Informational | A sub-floor `updateReserves()` emits `ReservesUpdated` carrying the sub-floor ratio but raises no *distinct* breach signal and does not revert. | **Most directly actionable part of CF-1's monitoring gap.** `ReservesUpdated` is the on-chain hook a monitor would watch, but there is no dedicated breach event/flag; the doctrine-mandated detection currently rests on off-chain interpretation of the emitted ratio. |
| **CF-6** | Informational (cross-ref INV-01 F-5) | The cap check and the ratio check are coupled in the single `reserveCompliant` modifier. | Structural — documents the coupling so future edits to one half don't silently weaken the other. |
| **CF-7** | LOW (documentation precision) | `updateReserves(type(uint256).max)` at `supply == 0` sets `totalReserves = max`, after which `mint()` reverts and `canMint()` reverts (rather than returning `false`) on the `totalReserves * 1000` overflow — a privileged, self-inflicted mint/`canMint` DoS. At `supply > 0` the update itself reverts on checked arithmetic. | None on the floor. `KERNEL_ROLE`-only, not production-routed, requires an absurd ~1e74 value, fully recoverable by `updateReserves(sane)` (§6). Corrects v1.0.0 "no overflow path is reachable in practice." |

**No defect permits a sub-floor state to be reached *at mint time*.** CF-1 is not a contract-level standing-invariant violation: the post-update sub-floor state is reachable **by design** (doctrine expects it), and the substantive open item is the monitoring / breach-routing path (CF-1, CF-5), not a missing `require`.

---

## 10. Reachability and Severity Framing

This framing is the core of the audit and must not be collapsed into a single label:

1. **Mint-time floor holds.** Every supply increase is gated; no mint can produce a sub-floor resulting state (§7.1, tests §11). At mint instants, INV-02's preventive obligation is enforced and correct.
2. **Post-update sub-floor is reachable by design, not a missing guard.** Between mints, `updateReserves()` can lower reserves with no floor re-check. Doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection") **explicitly recognizes** this state and requires it be handled as a breach-relevant condition (Kernel/Court flagging + `burn`), **not** prevented by ratio-gating the update — so the ledger can record a genuine reserve loss. `RESERVE_RUNTIME_GAP_REGISTER.md` registers the boundary (GAP-MEX-04/05) as "a load-bearing design feature, not an enforcement shortfall." The earlier "standing contract invariant is violated" framing is therefore incorrect.
3. **The genuine open gap is monitoring/evidence, not arithmetic.** The doctrine-mandated detective+remediative path — recognize the post-update breach, route it through TR-05/TR-06 review, correct via `burn`/contraction — has **no dedicated on-chain breach signal** (only the generic `ReservesUpdated` event, CF-5) and **no test or runtime evidence** that the routing is implemented end-to-end. This is the substantive, presently-open item.
4. **Authority-gated and not production-routed today.** The only post-deploy reserve writer is `updateReserves()`, gated to `KERNEL_ROLE`, and **no function in `IranOS_Kernel` calls it** (§5.1, grep-verified). So a sub-floor state cannot even arise on current production logic; the monitoring obligation becomes live once oracle-to-token reserve sync is wired (CF-2). When that routing is built, the breach-monitoring/routing path (point 3) must be in place **with it**.

**Net classification:** *Doctrine-aligned monitoring/evidence gap — the mint-time gate is sound and enforced; the post-update sub-floor state is a doctrine-recognized breach condition, not a contract bug; the open work is implementing/evidencing the breach-detection and routing path (and doing so before/with any future reserve-sync wiring).* This is consistent with the Echidna result (§12), which exercises the by-design state in a privileged harness. **INV-02 is therefore enforced at mint time and not fully closed on the monitoring/breach-routing dimension. It is not a standing contract invariant and was never doctrinally intended to be one.**

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
- **Interpretation (corrected in v1.1.0):** the "failure" is the harness reaching the **by-design** post-update sub-floor state (CF-1) — `updateReserves()` is intentionally not ratio-gated so a genuine reserve loss can be recorded (§7.2, doctrine). The property as written encodes the *standing* invariant, which doctrine does **not** require of the contract; it does not encode the doctrine-mandated *breach-routing* obligation. The result therefore flags a state doctrine expects to be reachable, not a contract bug.
- **Production reachability:** the harness reaches the state only because it holds `KERNEL_ROLE` and calls `updateReserves()` itself; `IranOS_Kernel` exposes no such call, so the sequence is **not reproducible from production logic** (§5.1, §10).
- **Documented classification:** *forward-looking, not currently exploitable* ([ECHIDNA_READINESS_ASSESSMENT.md §INV-02](./ECHIDNA_READINESS_ASSESSMENT.md)). A future harness aligned to doctrine would assert the *breach-routing* path (detect → flag → `burn`), not a standing ratio.

The harness and its result are reported here as evidence; **they are not modified by this audit.**

---

## 13. Missing Evidence

- **Doctrine decision on `updateReserves` floor handling already exists (correction).** Contrary to the v1.0.0 draft, the repository **does** document this: [MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md) ("Post-Update Detection (monitoring)") states the post-update sub-floor state is reachable "since `updateReserves` is not itself ratio-gated" and is to be handled as a breach-relevant condition (Kernel/Court routing + `burn`), not blocked; [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md) registers the same boundary (GAP-MEX-04/05) as "a load-bearing design feature, not an enforcement shortfall." The doctrine direction is therefore **monitor + route + remediate**, not contract-level floor-gating. The v1.0.0 "no documented doctrine decision" claim is withdrawn.
- **The actual missing evidence is implementation of the doctrine-mandated monitoring/routing path** — there is no dedicated on-chain breach signal beyond the generic `ReservesUpdated` event (CF-5), and no test or runtime artifact demonstrating that a post-update sub-floor condition would be detected, flagged through TR-05/TR-06, and remediated via `burn` end-to-end.
- **No Hardhat test characterizes the post-update sub-floor behavior** — no test asserts that a post-mint `updateReserves(0)` leaves `currentReserveRatio() < 333` *without reverting* while the mint-time gate continues to block further expansion (the by-design state, as distinct from "minting is blocked afterward").
- **No on-chain SWF ↔ token reserve reconciliation spec** (CF-3) — the trust boundary of the reserve scalar is undocumented.

---

## 14. Proposed Follow-Up Tests R-1..R-8

*Specification only — no tests are written by this document. These pin current behavior; R-3 is a characterization of the CF-1 gap and must be labeled as documenting current (gapped) behavior, not endorsing it.*

| ID | Proposed test | Pins |
|---|---|---|
| R-1 | Mint-time floor boundary: ratio exactly 333 mints; 332 reverts `"PAH: reserve ratio below minimum 33.3%"`. | §7.1 (relabels/extends INV-05a/b under INV-02) |
| R-2 | `updateReserves()` authority: only `KERNEL_ROLE` succeeds (emits `ReservesUpdated`); SWF / council / stranger revert. | §5 |
| R-3 | **CF-1 characterization:** mint at a healthy ratio → `updateReserves(0)` **succeeds (no revert)** → assert `currentReserveRatio() < 333`, `canMint(small) == false`, and the next `mint()` reverts on the floor. Documents the **by-design** post-update sub-floor state (doctrine-recognized breach condition), not a contract defect. | §7.2, §10 |
| R-8 | **CF-7 overflow precision:** at `supply == 0`, `updateReserves(type(uint256).max)` succeeds; subsequent `mint()` reverts and `canMint(x)` reverts on overflow; recovery via `updateReserves(sane)` restores minting. At `supply > 0`, `updateReserves(type(uint256).max)` itself reverts. | §6, CF-7 |
| R-4 | Burn raises ratio: mint, burn, assert `currentReserveRatio()` strictly increases; burn never floor-blocked. | §7.3 |
| R-5 | Emergency interaction: `updateReserves()` callable during emergency; `mint()` still halted; ratio math consistent. | §7.4 |
| R-6 | View/gate agreement: `currentReserveRatio()`, `canMint()`, and actual `mint()` outcomes agree at the 333/332 boundary; `supply==0 → 1000`. | §6 |
| R-7 | Cross-contract constant equality: `token.MIN_RESERVE_RATIO() == kernel.MIN_RESERVE_RATIO() == 333`. | §2 |

---

## 15. Remediation Guidance

1. **No contract patch is made in this task,** and none is recommended for `updateReserves()`. This is an analysis-only audit; `updateReserves()` and all reserve/emergency logic are left unchanged.
2. **A hard floor-guard on `updateReserves()` is *not* the doctrine-aligned remediation.** Doctrine requires `updateReserves` to be able to record a genuine reserve loss; a `require((newReserves*1000)/supply >= MIN_RESERVE_RATIO)` would prevent the ledger from reflecting reality and contradicts [MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md). The doctrine-aligned direction is **detect + route + remediate**: recognize the post-update sub-floor as a breach-relevant condition, surface it (e.g., a distinct breach event addressing CF-5), route it through the existing TR-05/TR-06 Kernel/Court channels, and correct via `burn`/contraction. Any change implementing this remains a doctrine-review item — not slipped in as an implementation fix — and is **out of scope for this analysis-only task.**
3. **Sequencing constraint.** When oracle-to-token reserve synchronization is eventually wired into the Kernel (the route CF-2 anticipates), the doctrine-mandated breach-monitoring/routing path **must be implemented first or simultaneously**, so that a genuine reserve drop is flagged and remediated rather than silently absorbed (§10).
4. **Interim (recommended next step):** add the test-only characterization suite (§14) — especially R-3 (by-design post-update sub-floor) and R-8 (CF-7 overflow) — to pin current behavior, and produce monitoring-gap documentation describing how a post-update breach would be detected and routed under existing doctrine. Tests are deferred — not implemented in this task. **No contract change.**

---

## 16. Conclusion

**Mint-time reserve-floor enforcement holds.** At every mint, `reserveCompliant` checks the ratio against the post-mint supply, and no mint can produce a sub-floor resulting state — this preventive obligation is sound and well-tested.

**The post-update sub-floor state is doctrine-recognized breach-relevant behavior, not automatically a contract bug.** `updateReserves()` is intentionally not ratio-gated so a genuine reserve loss, confirmed loss, or reclassification can be recorded; doctrine ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), [RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md) GAP-MEX-04/05) explicitly anticipates the resulting sub-floor state and requires it be detected, routed through TR-05/TR-06 Kernel/Court review, and remediated via `burn`/contraction — **not** prevented by a contract floor guard. INV-02 was therefore never doctrinally a "standing contract invariant," and the v1.0.0 framing/CF-1 classification to that effect is corrected in this revision. The Echidna result exercises this by-design state in a privileged harness; on current production logic the state is unreachable (`KERNEL_ROLE` holds the only reserve-writer and `IranOS_Kernel` never calls it, §5.1).

**The genuine open item is the monitoring / breach-routing dimension** (CF-1, CF-5): there is no dedicated on-chain breach signal beyond `ReservesUpdated`, and no test or runtime evidence that a post-update sub-floor condition would be detected, flagged, and remediated end-to-end. This must be in place before/with any future oracle-to-token reserve sync (CF-2). A LOW-severity overflow precision item (CF-7) is also recorded.

**INV-02 is enforced at mint time and not fully closed on the monitoring/breach-routing dimension. It is not claimed fixed.** The recommended next step is **test-only characterization** (R-1…R-8) plus **monitoring-gap documentation**, with **no contract patch** to `updateReserves()` — any breach-detection/routing mechanism remains a separate doctrine-review item.

This document is analysis only. No production code, tests, CI configuration, deployment scripts, fuzzing harnesses, or doctrine were modified. No production-readiness, external-audit, or formal-verification completion is claimed; no STEP9-BLOCK-* blocker is closed; INV-02 is **not** claimed fixed. INV-09 is untouched.
