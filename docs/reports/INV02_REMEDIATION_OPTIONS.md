# INV-02 — Reserve Ratio Floor: Open Remediation Options
## IranOS Post-Characterization Follow-Up

**Version:** 1.0.0
**Date:** 2026-06-15
**Status:** Planning Only — No Code Changes
**Scope:** Follow-up to `INV02_RESERVE_RATIO_FLOOR_AUDIT.md` v1.1.1 and PR #68 (R-1..R-8 characterization tests)

> **Disclaimers**
> - This document does not claim production readiness.
> - This document does not claim external audit completion.
> - This document does not claim formal verification completion.
> - This document does not close any Step 12 / STEP9-BLOCK-* blocker.
> - This document does **not** claim INV-02 is fixed.
> - This document does **not** close GAP-MEX-04/05/06.
> - No contracts, tests, CI, fuzzing harnesses, or production code are modified by this document.
> - All remediation paths described here are **undecided**. This document presents options for doctrine review; it does not prescribe, recommend, or implement any of them.
> - INV-09 is untouched and not referenced.

---

## Table of Contents

1. [Context](#1-context)
2. [What PR #68 Delivered](#2-what-pr-68-delivered)
3. [Findings That Remain Characterization-Only](#3-findings-that-remain-characterization-only)
   - 3.1 [CF-1 — Reachable Post-Update Sub-Floor State](#31-cf-1--reachable-post-update-sub-floor-state)
   - 3.2 [CF-7 — Overflow / Precision Characterization](#32-cf-7--overflow--precision-characterization)
4. [Open Remediation Paths (All Undecided)](#4-open-remediation-paths-all-undecided)
   - 4.1 [Path A — Preventive Reserve-Floor Guard](#41-path-a--preventive-reserve-floor-guard)
   - 4.2 [Path B — Soft Signal / Event-Based Detection](#42-path-b--soft-signal--event-based-detection)
   - 4.3 [Path C — TR-05 / TR-06 Breach Routing](#43-path-c--tr-05--tr-06-breach-routing)
   - 4.4 [Path D — Burn / Contraction or Reserve Correction](#44-path-d--burn--contraction-or-reserve-correction)
5. [Doctrine Constraints That Apply to All Paths](#5-doctrine-constraints-that-apply-to-all-paths)
6. [Sequencing Obligation](#6-sequencing-obligation)
7. [What Remains Open](#7-what-remains-open)

---

## 1. Context

INV-02 governs the 33.3% reserve-ratio floor for Pahlavi token minting (`MIN_RESERVE_RATIO = 333`), encoded as an immutable `constant` in both `PahlaviToken` and `IranOS_Kernel`. The audit (`INV02_RESERVE_RATIO_FLOOR_AUDIT.md` v1.1.1) established a two-part picture:

- **Mint-time hard gate (sound).** Every `mint()` call checks the post-mint ratio against the floor. No mint can produce a sub-floor resulting state. This holds and is well-tested.
- **Post-update breach condition (open).** `updateReserves()` is not ratio-gated; a reserve drop can leave existing supply below the floor with no revert. Doctrine recognizes this as a **breach-relevant condition** ([MONETARY_EXPANSION_CONSTRAINTS.md](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md), "Post-Update Detection") and gives a response *direction* (block further expansion + route through Kernel/Court + correct via `burn`/contraction). It does **not** decide the mechanism — a preventive floor guard, a soft signal, TR-05/TR-06 routing, or `burn` are all candidate paths. The choice is a **doctrine-review item**.

PR #68 added characterization tests R-1..R-8 that pin the current contract behavior for both dimensions. **No remediation was implemented.** This document records what remains open and maps the candidate paths.

---

## 2. What PR #68 Delivered

PR #68 (`test/inv02-reserve-ratio-characterization`, merged 2026-06-15) added eight characterization tests to `test/02_pahlavi_token.test.js`. All 622 tests pass.

| Test | What it characterizes |
|---|---|
| R-1a / R-1b | Mint-time floor boundary: ratio 333 passes; ratio 332 reverts. |
| **R-2** | `updateReserves` authority is **role-based (KERNEL_ROLE)**, not address-based. Grants `KERNEL_ROLE` to a second signer and verifies that signer can call `updateReserves()` — distinguishes role-based from hard-coded address-based access. |
| **R-3** | **CF-1 characterization.** Post-mint `updateReserves(0)` succeeds without reverting. Standing ratio drops below 333. Mint-time gate blocks further expansion. Documents the reachable sub-floor state as current (gapped) behavior — not an endorsement, not a bug assertion. |
| R-4 | Burn lowers supply, raises ratio, and is never floor-blocked — including from a sub-floor state. |
| R-5 | `updateReserves()` is callable during emergency; mint remains halted; ratio math stays consistent. |
| R-6 | `currentReserveRatio()`, `canMint()`, and `mint()` outcomes agree at the 333/332 boundary. |
| R-7 | `PahlaviToken.MIN_RESERVE_RATIO == IranOS_Kernel.MIN_RESERVE_RATIO == 333`. |
| **R-8a/b/c** | **CF-7 characterization.** Overflow: at `supply > 0`, `updateReserves(MaxUint256)` reverts inside the call. At `supply == 0`, it succeeds; subsequent `mint()` and `canMint()` revert on overflow. Constructor with oversized `_initialReserves` produces the same DoS at genesis. Recovery requires a `KERNEL_ROLE` holder able to call `updateReserves`; under production Kernel wiring (no such call path) these states are **unrecoverable in-place** — redeploy required. |

**What PR #68 did not do:** implement any remediation, patch `updateReserves`, add a reserve-floor guard, close GAP-MEX-04/05/06, or claim INV-02 fixed.

---

## 3. Findings That Remain Characterization-Only

### 3.1 CF-1 — Reachable Post-Update Sub-Floor State

**What it is.** After a compliant mint (ratio ≥ 333), a `KERNEL_ROLE` holder can call `updateReserves(x)` with `x` low enough to leave `currentReserveRatio() < 333` for the existing supply. No revert occurs. The contract enters a breach-relevant condition: further expansion is blocked by the mint-time gate, but the standing ratio is below the constitutional floor.

**Current on-chain state.** Characterized by R-3: confirmed reachable, confirmed that the mint-time gate still blocks further expansion from this state. No detection/remediation path exists. `ReservesUpdated` is emitted (carrying the sub-floor ratio figure) but no distinct breach signal is raised (CF-5).

**Why remediation is undecided.** A preventive floor guard on `updateReserves` would prevent recording a genuine reserve loss or reclassification, a scenario doctrine clearly anticipates. Doctrine prescribes a response direction (block + flag + correct) but does not rule out a guard — the tension between "honest-loss recording" and "prevent sub-floor entry" requires doctrine review. The breach→TR-05/TR-06 mapping (GAP-MEX-06) is itself an open gap.

**Status:** characterization-only. CF-1 is not resolved. GAP-MEX-06 remains open.

### 3.2 CF-7 — Overflow / Precision Characterization

**What it is.** `totalReserves * 1000` is checked 0.8.x arithmetic and overflows when `totalReserves > (2²⁵⁶−1)/1000 ≈ 1.158 × 10⁷⁴`. This is unreachable for honest reserve values (realistic maximum ~3 × 10²⁹), but is reachable via three paths, all characterized by R-8:

| Entry | Behaviour |
|---|---|
| `updateReserves(MaxUint256)` at `supply > 0` (R-8a) | Reverts inside `updateReserves` itself — self-blocking |
| `updateReserves(MaxUint256)` at `supply == 0` (R-8b) | Succeeds (ratio branch short-circuits to 1000, no multiply); subsequent `mint()` and `canMint()` revert on overflow — DoS |
| Constructor `_initialReserves > 2²⁵⁶/1000` (R-8c) | Same DoS at genesis, without any `updateReserves` call |

For paths (b) and (c): recovery requires a `KERNEL_ROLE` holder that can call `updateReserves(sane)`. Under production Kernel wiring (`IranOS_Kernel` has no `updateReserves` call path) the deployment is **unrecoverable in-place** and must be redeployed.

**Classification:** LOW / documentation precision + deploy-time hygiene. An absurd value; not production-routed. No mint-time floor impact. Recorded as CF-7.

**Status:** characterized. CF-7 is not resolved. No constructor bound-check or deploy-time validation has been added.

---

## 4. Open Remediation Paths (All Undecided)

The four candidate paths from the audit (§15, §7.2) are described below. **None is implemented. None is recommended over another by this document. Each requires doctrine review before any contract change.**

### 4.1 Path A — Preventive Reserve-Floor Guard

**Mechanism.** Add a post-update ratio check to `updateReserves()`:

```solidity
// illustrative only — not implemented
function updateReserves(uint256 newReserves) external onlyKernel {
    uint256 supply = totalSupply();
    if (supply > 0) {
        require(
            (newReserves * 1000) / supply >= MIN_RESERVE_RATIO,
            "PAH: update would breach reserve floor"
        );
    }
    uint256 old = totalReserves;
    totalReserves = newReserves;
    emit ReservesUpdated(old, newReserves, supply > 0 ? (newReserves * 1000) / supply : 1000);
}
```

**Effect.** Makes the reserve-ratio floor a standing contract-enforced invariant after every reserve movement, not just at mint time.

**Tension.** Blocks recording a genuine reserve loss or reclassification without simultaneously reducing supply. If a reserve drop is real (confirmed loss, write-down, or reclassification), the Kernel could not record it truthfully unless supply were first burned down to a compliant ratio — which may not be operationally feasible.

**Status: undecided.** Not ruled out. Requires doctrine decision on whether honest-loss recording is permitted to enter a sub-floor state, and if so, whether a loss-attested carve-out path is needed. Does **not** address CF-7 constructor path.

---

### 4.2 Path B — Soft Signal / Event-Based Detection

**Mechanism.** Emit a distinct on-chain breach signal when `updateReserves()` would leave the ratio below 333, without reverting:

```solidity
// illustrative only — not implemented
if (supply > 0 && (newReserves * 1000) / supply < MIN_RESERVE_RATIO) {
    emit ReserveFloorBreached(newReserves, supply, (newReserves * 1000) / supply);
}
```

**Effect.** Addresses CF-5 (currently only `ReservesUpdated` is emitted, carrying the sub-floor ratio with no distinct breach flag). An off-chain monitor or Kernel oracle can observe `ReserveFloorBreached` and trigger the routing described in Path C.

**Tension.** Does not prevent entry into the sub-floor state. Detection reliability depends on off-chain monitoring infrastructure being in place and responsive. Does not satisfy any requirement for an on-chain guarantee.

**Status: undecided.** Compatible with Path C and/or D. Requires a contract change (new event, new conditional) and a monitoring specification.

---

### 4.3 Path C — TR-05 / TR-06 Breach Routing

**Mechanism.** Implement GAP-MEX-06: map a detected reserve-floor breach condition onto the existing Kernel/Court violation-flagging channels. A breach signal (from Path B, or from off-chain monitoring) causes an oracle to call `IranOS_Kernel.flagViolation(TR-05, ...)` or `flagViolation(TR-06, ...)`, engaging the 7-of-9 multi-sig trigger and Court adjudication.

| Violation code | Scope |
|---|---|
| TR-05 | Sovereign Wealth Fund independence breach |
| TR-06 | Liquidity cap violation |

**Suitability note.** TR-05 and TR-06 are the closest existing codes to a reserve-backing shortfall. Whether a post-update sub-floor state maps cleanly onto either code is itself a doctrine question — the codes were not designed with `updateReserves` sub-floor routing in mind.

**Effect.** Ties the breach-detection response to the constitutional Court/multi-sig process, consistent with doctrine's "route through Kernel/Court" direction. Engages the 72-hour trigger timeout and sovereign adjudication rather than automated freeze.

**Tension.** Routing a reserve-ratio event through the full trigger mechanism is operationally heavy for a genuine, expected reserve loss or reclassification. The trigger protocol was designed for constitutional violations, not routine reserve adjustments.

**Status: undecided.** GAP-MEX-06 is open. Requires doctrine decision on TR-05/TR-06 scope mapping and implementation of the oracle→Kernel call path for this event type. Compatible with Path B (B provides the on-chain signal; C provides the governance response).

---

### 4.4 Path D — Burn / Contraction or Reserve Correction

**Mechanism.** After a post-update sub-floor condition is detected (by any means), the monetary authority responds by reducing circulating supply via `burn()` until `currentReserveRatio() >= 333`, **or** by restoring `totalReserves` via a new `updateReserves()` call once additional reserves are confirmed.

**Effect.** Restores the standing ratio without a contract guard. Consistent with doctrine's "correct via `burn`/contraction" direction. Exercises existing contract mechanisms with no code change required.

**Tension.** Reactive, not preventive — requires detection infrastructure (Path B or C) to be in place, and timely human/governance action before any attempted expansion (though the mint-time gate blocks expansion automatically from a sub-floor state). Burn may require coordination with token holders. Reserve correction requires a source of additional confirmed reserves.

**Status: undecided.** Compatible with any of Paths A–C. Requires a documented operational procedure and, if Kernel-routed, a Kernel function that calls `updateReserves()` (currently absent — §5.1 of the audit). Does **not** require a contract code change on its own.

---

## 5. Doctrine Constraints That Apply to All Paths

The following constraints are fixed and apply regardless of which remediation path (if any) is chosen. Any implementation must satisfy all of them.

| Constraint | Source | Notes |
|---|---|---|
| No Kernel upgrade proxy | CLAUDE.md: "No admin backdoors — any function allowing bypass of the trigger protocol will be rejected" | `IranOS_Kernel` is not upgradeable. Any remediation requiring Kernel behavior must add a new function to the Kernel, not upgrade or replace it. |
| `MIN_RESERVE_RATIO` is not configurable | `PahlaviToken.sol:39`, `kernel.sol:55` — both `constant` | The 33.3% floor is a constitutional constant. No remediation may make it governance-tunable. |
| No automatic sovereign freeze | Trigger protocol requires 7-of-9 multi-sig + Court adjudication | A reserve-floor breach cannot autonomously activate an emergency lock or freeze assets. Detection may route to the Court; the Court decides. |
| No production-ready claim | This document and any PR implementing a path must include the standard disclaimers | No path closes any STEP9-BLOCK-* blocker by implication. |
| Oracle signals remain non-sovereign | `ORACLE_ROLE` is evidence-only, not executive | Even if an oracle flags a breach (Path C), the 7-of-9 multi-sig and Court adjudication govern whether a trigger activates. The oracle cannot unilaterally freeze or modify state. |
| `MULTISIG_THRESHOLD` = 7 of 9 | Kernel immutable constant | No remediation may lower this threshold. |

---

## 6. Sequencing Obligation

When oracle-to-token reserve synchronization is eventually wired into `IranOS_Kernel` (the route anticipated by CF-2 in the audit), a chosen detection/remediation path **must be implemented first or simultaneously**. The reason: once the Kernel calls `updateReserves()` for genuine reserve drops, the breach-detection/remediation obligation becomes live. A genuine reserve loss silently recorded with no detection or routing mechanism is the precise failure mode the doctrine prescribes against.

**Separately and independently:** deploy-time validation of `_initialReserves` (CF-7 entry c) should add an upper-bound check in the constructor or in deployment scripts, independent of which runtime remediation path is chosen.

---

## 7. What Remains Open

| Item | Status |
|---|---|
| CF-1: post-update sub-floor detection/remediation | **Undecided** — candidate paths A–D, none implemented |
| CF-5: no distinct on-chain breach signal | **Open** — addressed only by Path B |
| CF-7 (constructor): `_initialReserves` upper-bound check | **Open** — deploy-time validation absent; oversized genesis reserves unrecoverable in-place under production Kernel wiring |
| CF-7 (runtime): `updateReserves` upper-bound / overflow guard at `supply == 0` | **Open** — `updateReserves(MaxUint256)` succeeds at zero supply and DoSes `mint()`/`canMint()`; any future Kernel reserve-sync path that calls `updateReserves` without an upper bound is exposed to the same state; no runtime upper-bound check exists |
| GAP-MEX-04: reserve composition / provenance | **Open** ([RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) |
| GAP-MEX-05: reserve provenance attestation | **Open** ([RESERVE_RUNTIME_GAP_REGISTER.md](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md)) |
| GAP-MEX-06: breach-condition → TR-05/TR-06 mapping | **Open** — addressed only by Path C |
| Kernel `updateReserves` call path | **Absent** — `IranOS_Kernel` has no function that calls `PahlaviToken.updateReserves()` (§5.1 of audit) |
| INV-02 | **Not fixed** — enforced at mint time; post-update breach-detection/remediation open |

This document is planning only. No production code, tests, CI configuration, deployment scripts, fuzzing harnesses, or doctrine were modified. No production-readiness, external-audit, or formal-verification completion is claimed. No blocker is closed. INV-02 is not claimed fixed.
