# INV-02 — Reserve Ratio Floor: Complete Enforcement Audit
## IranOS Step 12 Security Analysis

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Analysis Only — No Code Changes
**Scope:** `contracts/monetary/PahlaviToken.sol`; `contracts/kernel.sol` (ratio constant mirror, `KERNEL_ROLE` holder); all 25 production contracts for reserve-writer verification; `contracts/fuzzing/FuzzPahlaviToken.sol` and `test/02_pahlavi_token.test.js` for coverage cross-reference

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 / STEP9-BLOCK-* blocker.
> - This document does **not** claim INV-02 is fixed. It documents a partially-enforced invariant with an identified design-completeness gap that remains open.
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
14. [Proposed Follow-Up Tests R-1..R-7](#14-proposed-follow-up-tests-r-1r-7)
15. [Remediation Guidance](#15-remediation-guidance)
16. [Conclusion](#16-conclusion)

---

## 1. Invariant Statement

**ID:** INV-02
**Contract:** `PahlaviToken` (`contracts/monetary/PahlaviToken.sol`)
**Category:** Constitutional Monetary Safeguard (reserve backing)
**Risk:** CRITICAL (severity-conditional — see §10)

### Intended invariant

For all reachable states of `PahlaviToken`:

> If `totalSupply() > 0`, then `(totalReserves * 1000) / totalSupply() >= MIN_RESERVE_RATIO` (= 333, i.e. 33.3%), at **all times** — not only at the moment of minting.

### Enforced invariant (as built)

> At the instant of a `mint()` call, `(totalReserves * 1000) / (totalSupply() + mintAmount) >= MIN_RESERVE_RATIO`.

The gap between the **intended standing invariant** and the **enforced mint-time invariant** is the central subject of this audit (Finding CF-1, §9). The floor is enforced when supply *increases*; it is **not** re-validated when reserves *decrease* via `updateReserves()`.

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

This disconnect is the hinge of the severity analysis (§10): the dangerous capability (reserve reduction without a floor re-check) is real and authority-gated, but currently unroutable on mainnet logic.

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
- **Overflow:** `totalReserves * 1000` is checked 0.8.x arithmetic; with reserves bounded by realistic dollar values far below `2^256/1000`, no overflow path is reachable in practice.

---

## 7. Enforcement Map

### 7.1 Mint-time enforcement — PRESENT

`mint()` always passes through `reserveCompliant`. A mint that would leave the post-mint ratio below 333 reverts `"PAH: reserve ratio below minimum 33.3%"` and changes no state. This is the **only** point at which the floor is actively enforced, and it is enforced correctly (covered by tests, §11).

### 7.2 `updateReserves()` non-enforcement — ABSENT (CF-1)

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

`updateReserves()` computes the resulting ratio **only to emit it** — there is **no `require`** enforcing `ratio >= MIN_RESERVE_RATIO`. Consequently, after a healthy mint, a call to `updateReserves(x)` with `x` low enough (e.g. `0`) drives the standing ratio below the floor with no revert. The mint-time modifier provides no protection against post-mint reserve reduction. **The standing invariant of §1 does not hold.**

### 7.3 Burn interaction — BENIGN

`burn()` lowers `totalSupply()`, which *raises* `(totalReserves*1000)/supply`. Burning can only move the ratio further above the floor; it can never breach it, and it does not touch `totalReserves`. No ratio check on burn is needed (threat T4).

### 7.4 Emergency interaction — BENIGN TO FLOOR (CF-4)

`mint()` carries `notInEmergency`, so during an emergency halt no new supply can be created and the floor cannot be freshly breached by minting. `updateReserves()` does **not** carry `notInEmergency`, so reserves remain mutable during an emergency. With respect to the floor this is benign (no minting can occur to exploit a low ratio), though it is recorded as CF-4 for completeness and for any freeze-integrity review.

---

## 8. Threat Model

| # | Capability | Vector | Floor outcome |
|---|---|---|---|
| T1 | `MINTER_ROLE` | `mint()` beyond reserve backing | **Bounded** — `reserveCompliant` reverts at mint time |
| T2 | `KERNEL_ROLE` | `updateReserves(0)` / low value after a mint | **Unbounded (standing)** — no floor guard; ratio drops below 333 with no revert (CF-1) |
| T3 | `KERNEL_ROLE` | `updateReserves()` during emergency | Possible (no `notInEmergency`); benign to floor (minting already halted) |
| T4 | `BURNER_ROLE` | burn to manipulate ratio | **Benign** — burn raises ratio |
| T5 | Oracle (future) | oracle → kernel → `updateReserves` sync wired without a floor guard | **Latent CRITICAL** — activates T2 on a live production path |
| T6 | Reserve reporter | assert a false `totalReserves` scalar | **Trust assumption** — floor correctness depends on honest `KERNEL_ROLE`/oracle (CF-3) |
| T7 | Integer rounding | exploit floor division at the boundary | **Not exploitable** — rounds down, conservative |

The adversary is assumed unable to alter bytecode (no Kernel upgrade proxy — fixed IranOS design constraint) or change `MIN_RESERVE_RATIO` (a `constant`).

---

## 9. Findings

| ID | Severity | Finding | Floor impact |
|---|---|---|---|
| **CF-1** | CRITICAL (conditional — §10) | `updateReserves()` has no lower-bound guard and no post-update ratio re-check. The floor is a mint-time check, not a standing invariant; a post-mint reserve reduction drives the ratio below 333 with no revert. | **Direct.** The intended standing invariant (§1) is not enforced. Confirmed by Echidna (§12). |
| **CF-2** | Informational | `updateReserves()` NatSpec states it is "called by API3Oracle through Kernel" ([:194-196](../../contracts/monetary/PahlaviToken.sol)); no such routing exists in `IranOS_Kernel`. Documentation describes unbuilt behavior. | Indirect — risk of wiring the route later without first adding the floor guard (turns CF-1 live). |
| **CF-3** | Low (trust) | `totalReserves` is a trusted asserted scalar with no on-chain reconciliation against `SovereignWealthFund` or custodied assets. | The floor's economic meaning inherits full trust in the reserve reporter. |
| **CF-4** | Informational | `updateReserves()` lacks `notInEmergency`; reserves are mutable during an emergency halt. | None on the floor (minting halted); noted for freeze-integrity review. |
| **CF-5** | Informational | A sub-floor `updateReserves()` emits `ReservesUpdated` carrying the sub-floor ratio but raises no breach signal and does not revert; no on-chain alarm for a floor violation. | Observability gap — a breach is silent except to off-chain monitors. |
| **CF-6** | Informational (cross-ref INV-01 F-5) | The cap check and the ratio check are coupled in the single `reserveCompliant` modifier. The ratio half is exactly what CF-1 leaves incomplete post-mint. | Structural — documents the coupling so future edits to one half don't silently weaken the other. |

**No defect permits a sub-floor state to be reached *at mint time*.** The open issue (CF-1) is that the floor is not maintained as a *standing* property after reserve reduction.

---

## 10. Reachability and Severity Framing

This framing is the core of the audit and must not be collapsed into a single label:

1. **Mint-time floor holds.** Every supply increase is gated; no mint can produce a sub-floor resulting state (§7.1, tests §11). At mint instants, INV-02 is enforced and correct.
2. **Standing floor is not enforced.** Between mints, `updateReserves()` can lower reserves with no floor re-check, so `totalSupply()>0 ⇒ ratio≥333` is **not** a maintained contract invariant (CF-1, §7.2).
3. **Currently authority-gated and not production-routed.** The only post-deploy reserve writer is `updateReserves()`, gated to `KERNEL_ROLE`, and **no function in `IranOS_Kernel` calls it** (§5.1, grep-verified). On current production logic the gap is **not reachable** by any transaction path — it is a *design-completeness gap*, not a presently-exploitable vulnerability.
4. **Becomes CRITICAL if wired without a guard.** The `updateReserves()` NatSpec anticipates oracle-to-token reserve synchronization through the Kernel (CF-2). The moment that routing is implemented in a future Kernel version **without first adding a floor guard**, threat T2/T5 becomes live on a production path and the severity is realized as CRITICAL.

**Net classification:** *Design-completeness gap — forward-looking, authority-gated, not currently production-reachable; latent-CRITICAL contingent on future oracle/kernel reserve-sync wiring.* This matches the Echidna assessment's classification (§12). **INV-02 is therefore partially enforced (mint-time) and not closed as a standing invariant.**

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
- **Root gap:** as in CF-1 — `updateReserves()` accepts any value with no floor guard / no post-update re-check.
- **Production reachability:** the harness reaches the gap only because it holds `KERNEL_ROLE` and calls `updateReserves()` itself; `IranOS_Kernel` exposes no such call, so the sequence is **not reproducible from production logic** (§5.1, §10).
- **Documented classification:** *design-completeness gap — forward-looking, not currently exploitable* ([ECHIDNA_READINESS_ASSESSMENT.md §INV-02](./ECHIDNA_READINESS_ASSESSMENT.md)).

The harness and its result are reported here as evidence; **they are not modified by this audit.**

---

## 13. Missing Evidence

- **No INV-02 audit report existed before this document** (only the Echidna assessment and fuzz property).
- **No Hardhat test pins CF-1's standing-floor behavior** — no test asserts that a post-mint `updateReserves(0)` leaves `currentReserveRatio() < 333` *without reverting* (the gap itself, as distinct from "minting is blocked afterward").
- **No documented doctrine decision** on whether `updateReserves()` *should* enforce the floor, soft-revert, or signal a breach. Remediation choice is a doctrine matter (§15).
- **No on-chain SWF ↔ token reserve reconciliation spec** (CF-3) — the trust boundary of the reserve scalar is undocumented.
- **No defined breach-signal / monitoring contract event** for sub-floor states (CF-5).

---

## 14. Proposed Follow-Up Tests R-1..R-7

*Specification only — no tests are written by this document. These pin current behavior; R-3 is a characterization of the CF-1 gap and must be labeled as documenting current (gapped) behavior, not endorsing it.*

| ID | Proposed test | Pins |
|---|---|---|
| R-1 | Mint-time floor boundary: ratio exactly 333 mints; 332 reverts `"PAH: reserve ratio below minimum 33.3%"`. | §7.1 (relabels/extends INV-05a/b under INV-02) |
| R-2 | `updateReserves()` authority: only `KERNEL_ROLE` succeeds (emits `ReservesUpdated`); SWF / council / stranger revert. | §5 |
| R-3 | **CF-1 characterization:** mint at a healthy ratio → `updateReserves(0)` **succeeds (no revert)** → assert `currentReserveRatio() < 333`, `canMint(small) == false`, and the next `mint()` reverts on the floor. Explicitly documents the standing-floor gap as current behavior. | §7.2, §10 |
| R-4 | Burn raises ratio: mint, burn, assert `currentReserveRatio()` strictly increases; burn never floor-blocked. | §7.3 |
| R-5 | Emergency interaction: `updateReserves()` callable during emergency; `mint()` still halted; ratio math consistent. | §7.4 |
| R-6 | View/gate agreement: `currentReserveRatio()`, `canMint()`, and actual `mint()` outcomes agree at the 333/332 boundary; `supply==0 → 1000`. | §6 |
| R-7 | Cross-contract constant equality: `token.MIN_RESERVE_RATIO() == kernel.MIN_RESERVE_RATIO() == 333`. | §2 |

---

## 15. Remediation Guidance

1. **No contract patch is made in this task.** This is an analysis-only audit; `updateReserves()` and all reserve/emergency logic are left unchanged.
2. **Any floor guard on `updateReserves()` requires separate doctrine review.** Adding `require((newReserves*1000)/supply >= MIN_RESERVE_RATIO)` (or a soft-signal variant) changes monetary-discipline behavior and the reserve-update semantics; it must be decided as a doctrine-level item, not slipped in as an implementation fix. The decision space includes: hard revert on sub-floor update; allow the update but emit a distinct `ReserveFloorBreached` signal (addresses CF-5); or gate reserve sync behind an explicit attested path. Each has different operational implications for legitimate reserve drawdowns and must be weighed against doctrine.
3. **Sequencing constraint (most important).** When oracle-to-token reserve synchronization is eventually wired into the Kernel (the route CF-2 anticipates), the floor guard — in whatever form doctrine selects — **must land first or simultaneously**. Wiring the route before the guard is exactly the step that converts CF-1 from latent to live-CRITICAL (§10).
4. **Interim:** add the test-only characterization suite (§14, especially R-3) to lock current behavior and make any future regression or premature wiring visible. Tests are deferred — not implemented in this task.

---

## 16. Conclusion

INV-02 is **partially enforced.** At every mint, the reserve-ratio floor is correctly checked against the post-mint supply, and no mint can produce a sub-floor resulting state — this half is sound and well-tested. The floor is **not** enforced as a *standing* invariant: `updateReserves()` can lower reserves after a mint with no floor guard and no post-update re-check, so `totalSupply()>0 ⇒ ratio≥333` is not a maintained contract property (Finding CF-1, confirmed by the failing Echidna property).

That gap is presently **authority-gated and not production-routed** — `KERNEL_ROLE` holds the only post-deploy reserve-writer and `IranOS_Kernel` never calls it — so it is a forward-looking design-completeness gap, not a currently-exploitable vulnerability. It becomes **CRITICAL** if oracle/kernel reserve synchronization is wired without a floor guard added first.

**INV-02 is not closed as a standing invariant.** No fix is made here and none is claimed. The recommended next step is **test-only characterization** (R-1…R-7, especially the CF-1 characterization R-3) to pin current behavior and surface any future regression, with any actual `updateReserves()` floor guard deferred to a separate doctrine review.

This document is analysis only. No production code, tests, CI configuration, deployment scripts, fuzzing harnesses, or doctrine were modified. No production-readiness, external-audit, or formal-verification completion is claimed; no STEP9-BLOCK-* blocker is closed; INV-02 is **not** claimed fixed. INV-09 is untouched.
