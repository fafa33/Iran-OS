# Open Residuals Register — Iran-OS

**Purpose:** Centralized register of all active `HARDENING_ONLY` findings. Each entry records the disqualifying assumption that prevents BLOCKER_P1 classification, the specific re-evaluation triggers that apply, and the current status.

**Maintenance rule:** Add an entry whenever a finding is classified HARDENING_ONLY. Update the entry when any re-evaluation trigger fires. Never delete entries — superseded findings are marked `Status: Superseded` with a reference to the re-evaluation outcome.

**Location:** `docs/governance/OPEN_RESIDUALS.md`

**CLAUDE.md reference:** `### Red-Team Finding Classification Standard (Mandatory)` → HARDENING_ONLY Re-Evaluation Policy

---

## Active Residuals

*None currently active. See Superseded Residuals below for K-RES-01.*

---

## Superseded Residuals

### K-RES-01 — Stale-Reserve Provenance

**Finding ID:** K-RES-01
**Date classified:** 2026-06-17
**Classification:** HARDENING_ONLY
**Status:** Superseded — see Re-Evaluation History (2026-07-05 entry) below. Original attack mechanism closed by PR #113; register entry retained per the "never delete entries" maintenance rule.
**Source findings:** GAP-MEX-04 FND-01, FND-02, FND-08 (see `docs/reports/GAP_MEX_04_ORACLE_FRESHNESS_REVIEW.md`); disposition in `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`
**PRs:** #85 (Gate A/B implementation), #86/#87 (K-RES-01 documentation)

**Finding summary:** `syncReserves(uint256 newReserves)` carries no timestamp or provenance for the reserve value itself. `API3Oracle.syncReserves` is gated by `onlyFeeder`, Gate A (PAH_USD_KEY freshness: `block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE`), and Gate B (rate limit: one sync per `MAX_DATA_AGE` window). None of these gates verify that `newReserves` reflects current real-world reserve holdings. A feeder can satisfy all three gates (refresh PAH_USD_KEY, wait for the rate-limit window) and still submit a stale or incorrect `newReserves` value. Stale-inflated reserves pass the `reserveCompliant` check in `PahlaviToken.mint`, potentially enabling minting against backing that no longer exists at the reported level.

**5-criterion evaluation at time of classification:**

| Criterion | Pass / Fail | Evidence |
|---|---|---|
| Reachable attack path | Pass | Feeder calls `API3Oracle.syncReserves(staleFigure)` → `Kernel.syncReserves` → `PahlaviToken.updateReserves` → `totalReserves = staleFigure` — path traversable in current code; gates on `API3Oracle.syncReserves`: `onlyFeeder` (role gate) + Gate A (PAH_USD_KEY freshness check at `API3Oracle.sol:110-122`) + Gate B (rate limit: one sync per `MAX_DATA_AGE` window); all three gates can be satisfied by a feeder with `FEEDER_ROLE` who refreshes PAH_USD_KEY and waits for the window; none gate the freshness of `newReserves` itself |
| Privileges realistically obtainable | Pass | `FEEDER_ROLE` on `API3Oracle` is held by named Airnode operators; key compromise is a realistic adversary scenario |
| Concrete state corruption | Pass | `totalReserves` is set to a stale or inflated value; `reserveCompliant` and `currentReserveRatio()` operate on this figure |
| Reachable downstream enforcement consequence | **Fail** | Minting circuit is incomplete: `SovereignWealthFund.sol` holds `MINTER_ROLE` but contains no `.mint()` call — verified by `grep -r '\.mint(' contracts/ --include="*.sol" \| grep -v fuzzing` → zero matches (the only `.mint(` call is in `contracts/fuzzing/FuzzPahlaviToken.sol`, excluded by `grep -v fuzzing`); `reserveCompliant` modifier is unreachable from any current production code path |
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
Expected result: zero matches — the only `.mint(` call is in `contracts/fuzzing/FuzzPahlaviToken.sol`, which is excluded by the `grep -v fuzzing` filter. A non-empty result means a new production `.mint(` call exists and K-RES-01 must be re-evaluated before the PR is merged.

**Notes:** First documented inline in `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md` (PR #87). The inline note stated: "K-RES-01 must be re-evaluated before any future SWF mint path, reserve-linked mint enforcement, or new downstream consumer of `totalReserves` is introduced." This register entry is the canonical authoritative record of K-RES-01 and supersedes the advisory inline notice as the enforceable tracking point.

---

## Re-Evaluation History

### 2026-07-05 — K-RES-01 re-evaluated (Trigger 11 fired by PR #113)

**Triggering change:** PR #113 ("Enforce reserve backing classification policy") changed `PahlaviToken.updateReserves()` from a function that set `totalReserves` to a pure telemetry no-op. This is exactly the Trigger 11 condition ("Resolution of FND-01 or FND-02 by a contract change ... threaded through the reserve sync path — changes the attack surface and requires full re-evaluation").

**5-criterion re-evaluation against current code:**

| Criterion | Pass / Fail | Evidence |
|---|---|---|
| Reachable attack path | **Fail** | `grep -n "totalReserves =" contracts/monetary/PahlaviToken.sol` → single match, at line 262, inside `_setReserves()`. `grep -n "_setReserves(" contracts/monetary/PahlaviToken.sol` → single call site, at line 257 inside `syncRecognizedBackingTotal()` (`onlyKernel`, reads `RecognizedReserveBacking.recognizedBackingTotal()`). `updateReserves()` (the oracle-facing path K-RES-01 originally described) contains no call to `_setReserves` and cannot mutate `totalReserves` under any input. No path from feeder-submitted data to `totalReserves` exists in current code. |
| Privileges realistically obtainable | Pass (moot — see below) | Unchanged from original classification; `FEEDER_ROLE` compromise remains a realistic scenario in the abstract, but there is no longer a state variable it can corrupt via this path |
| Concrete state corruption | **Fail** | `updateReserves()` re-emits the current (unchanged) `totalReserves` value in its `ReservesUpdated` event and returns; no state is written |
| Reachable downstream enforcement consequence | **Fail** | `grep -r '\.mint(' contracts/ --include="*.sol" \| grep -v fuzzing` → zero matches. Unchanged from original classification; still fails independently of criterion 1 |
| Current doctrine violation | Fail (consequential) | No enforcement consequence reaches current code |

**Re-evaluation result:** The finding's originally described attack mechanism ("feeder submits stale `newReserves` → `Kernel.syncReserves` → `PahlaviToken.updateReserves` → `totalReserves` set to stale value") no longer exists in the current codebase — criterion 1 now fails in addition to criterion 4. **Status changed from `Active` to `Superseded`.** The entry is retained (not deleted) per this register's maintenance rule, since it documents a mechanism that was real prior to PR #113 and the closure is only correct as of the current codebase.

**What changed:** `contracts/monetary/PahlaviToken.sol` — `updateReserves()` no longer calls `_setReserves()`. The sole production path that can write `totalReserves` is `syncRecognizedBackingTotal()`, reading from `RecognizedReserveBacking.recognizedBackingTotal()` (an explicit, Kernel-mediated, non-oracle path introduced by PR #110 and made atomic by PR #112).

**Residual note:** This re-evaluation does not certify `RecognizedReserveBacking.recordIdentity()` itself is free of stale-provenance concerns — `recordIdentity()` accepts an `evidence` string with no on-chain freshness or verification gate. No new finding is opened here because criterion 4 (reachable downstream enforcement consequence) still fails for the same reason as before: `grep -r '\.mint(' contracts/ --include="*.sol" | grep -v fuzzing` → zero matches. If a mint path is ever wired, this data-provenance question should be re-examined as part of that PR's own red-team pass, not reopened under the K-RES-01 identifier (K-RES-01 specifically described the oracle path, which is now closed).

---

*Register created: 2026-06-18*
*Branch: claude/codex-adversarial-review-fyu0nb*
*Active residuals: none*
*Superseded residuals: K-RES-01 (superseded 2026-07-05, see Re-Evaluation History)*
