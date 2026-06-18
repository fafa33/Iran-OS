# Open Residuals Register — Iran-OS

**Purpose:** Centralized register of all active `HARDENING_ONLY` findings. Each entry records the disqualifying assumption that prevents BLOCKER_P1 classification, the specific re-evaluation triggers that apply, and the current status.

**Maintenance rule:** Add an entry whenever a finding is classified HARDENING_ONLY. Update the entry when any re-evaluation trigger fires. Never delete entries — superseded findings are marked `Status: Superseded` with a reference to the re-evaluation outcome.

**Location:** `docs/governance/OPEN_RESIDUALS.md`

**CLAUDE.md reference:** `### Red-Team Finding Classification Standard (Mandatory)` → HARDENING_ONLY Re-Evaluation Policy

---

## Active Residuals

### K-RES-01 — Stale-Reserve Provenance

**Finding ID:** K-RES-01
**Date classified:** 2026-06-17
**Classification:** HARDENING_ONLY
**Status:** Active
**Source findings:** GAP-MEX-04 FND-01, FND-02, FND-08 (see `docs/reports/GAP_MEX_04_ORACLE_FRESHNESS_REVIEW.md`); disposition in `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`
**PRs:** #85 (Gate A/B implementation), #86/#87 (K-RES-01 documentation)

**Finding summary:** `syncReserves(uint256 newReserves)` carries no timestamp or provenance for the reserve value itself. A feeder holding `FEEDER_ROLE` can refresh `PAH_USD_KEY` (satisfying Gate A freshness check on `flagViolation`) and still submit a stale or incorrect `newReserves` value, because the reserve sync path has no freshness gate at any call boundary. Stale-inflated reserves pass the `reserveCompliant` check in `PahlaviToken.mint`, potentially enabling minting against backing that no longer exists at the reported level.

**5-criterion evaluation at time of classification:**

| Criterion | Pass / Fail | Evidence |
|---|---|---|
| Reachable attack path | Pass | Feeder calls `API3Oracle.syncReserves(staleFigure)` → `Kernel.syncReserves` → `PahlaviToken.updateReserves` → `totalReserves = staleFigure` — path traversable in current code; `onlyFeeder` is the sole gate |
| Privileges realistically obtainable | Pass | `FEEDER_ROLE` on `API3Oracle` is held by named Airnode operators; key compromise is a realistic adversary scenario |
| Concrete state corruption | Pass | `totalReserves` is set to a stale or inflated value; `reserveCompliant` and `currentReserveRatio()` operate on this figure |
| Reachable downstream enforcement consequence | **Fail** | Minting circuit is incomplete: `SovereignWealthFund.sol` holds `MINTER_ROLE` but contains no `.mint()` call — verified by `grep -r '\.mint(' contracts/ --include="*.sol" \| grep -v fuzzing` → one match in fuzzing harness only; `reserveCompliant` modifier is unreachable from any current production code path |
| Current doctrine violation | Fail (consequential) | No enforcement consequence reaches current code; doctrine violation requires an executable monetary path |

**Disqualifying assumption:** Criterion 4 fails because `SovereignWealthFund.sol` holds `MINTER_ROLE` but contains no function that calls `PahlaviToken.mint()`. The `reserveCompliant` modifier is unreachable from any current production code path.

**Re-evaluation triggers (from HARDENING_ONLY Re-Evaluation Policy):**
- **Trigger 1:** Any new SWF mint path — any contract gains `MINTER_ROLE`, any new `.mint()` call is added to a production contract, or any path from `SovereignWealthFund` to `PahlaviToken.mint()` is wired
- **Trigger 3:** Any new downstream consumer of `totalReserves` that creates an enforcement consequence (e.g., a new reserve-linked transfer gate, burn trigger, or governance threshold)
- **Trigger 10:** Any new contract or function that reads `reserveCompliant`, `totalReserves`, or `reserveFloorBreached` in an enforcement or monetary-authorization context
- **Trigger 11:** Resolution of FND-01 or FND-02 by a contract change (e.g., timestamp gate threaded through the reserve sync path) — changes the attack surface and requires full re-evaluation

**Verification grep (run before every sensitive-component PR touching contracts):**
```
grep -r '\.mint(' contracts/ --include="*.sol" | grep -v fuzzing
```
Expected result: one match in fuzzing harness only. Any additional match must trigger K-RES-01 re-evaluation before the PR is merged.

**Notes:** First documented inline in `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md` (PR #87). The inline note stated: "K-RES-01 must be re-evaluated before any future SWF mint path, reserve-linked mint enforcement, or new downstream consumer of `totalReserves` is introduced." This register entry is the canonical authoritative record of K-RES-01 and supersedes the advisory inline notice as the enforceable tracking point.

---

## Re-Evaluation History

*No re-evaluations recorded.*

---

*Register created: 2026-06-18*
*Branch: claude/codex-adversarial-review-fyu0nb*
*Active residuals: K-RES-01*
