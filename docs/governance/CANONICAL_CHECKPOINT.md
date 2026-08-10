# Canonical Checkpoint — Iran-OS

**This file is the Single Source of Truth (SSOT) for current Iran-OS project state.** It is not documentation — it is a mandatory engineering artifact recording the authoritative operational state of the project. Nothing else may supersede it. Other documents may reference it; they must not become competing sources of truth for the fields listed below (see "Single Source of Truth Policy").

Every new task begins by loading this file, then the applicable Lesson Learned registry, before any design, coding, documentation, deployment, or roadmap work — see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` → Stage 1 and Stage 2.

**Location:** `docs/governance/CANONICAL_CHECKPOINT.md`

**CLAUDE.md reference:** `## Canonical Development Workflow (Mandatory)` → Stage 1 — Canonical Checkpoint; `#### Step 13 — Canonical Checkpoint Currency` (PR Preflight Standard)

---

## Summary (required minimum fields)

| Field | Value |
|---|---|
| Latest merged PR | #125 — see "Latest Merged PR" below; this PR is pending |
| Latest merged commit | `af733091794dfe370ede4d163f093e2c4b0b554e` (squash-merge of PR #125 into `main`) |
| Current baseline | `main` @ `af733091794dfe370ede4d163f093e2c4b0b554e` |
| Current roadmap position | Roadmap Step-12 (Evidence execution & blocker disposition) — open; Roadmap Step-13 (Whitepaper-to-system mapping) — open |
| Current deployment coverage | 12 contracts have executable `deploy/` scripts (unchanged by this PR — see below). Denominator flagged: commonly cited as "12/25" but a direct file count shows 26 deployable contracts, not 25 — see "Deployment Coverage" section below, unresolved |
| Current test count | 762 passing (`npm test`) |
| Current production status | Not production-ready. Roadmap Step-9/Step-10 (production governance doctrine / readiness planning) are marked Complete as *planning* phases only — actual production blockers `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open (`CHANGELOG.md`); no external audit, no formal verification, no release signoff |
| Remaining deployment targets | 14 named contracts without executable `deploy/` scripts (`deploy/README.md`'s own list; its prose says "13," a miscount — see "Deployment Coverage" section below) |
| Open residual work | `docs/governance/OPEN_RESIDUALS.md` Active Residuals: none currently active |
| Applicable governance version | PR Preflight Standard: Steps 1–15; Canonical Development Workflow: 11 stages (established PR #122); Reviewer Lessons Learned Registry: governance standard formalized 2026-06-17 |
| Latest Lesson Learned ID | LL-031 (unchanged by this PR — see Step 12/Step 14 evidence in this PR's description) |
| **Governance Framework Status** | **STABLE (v1.0)** — see "Governance Status" section below |
| **Project Phase** | **Implementation** — Governance Hardening concluded 2026-07-07 (PR #121–#124); Governance in Maintenance Mode |
| **Current Implementation Priority** | A P0 deployment-path parity gap (Treasury/TriggerProtocol `KERNEL_ROLE`) blocking `TriggerProtocol` deployment was fixed in this PR, across Treasury + 12 other remaining contracts — see "Implementation Priority" section below |
| **Next Implementation Target** | `TriggerProtocol.sol` deployment itself (`deploy/16_trigger_protocol.js` + wiring) — the P0 constructor/admin-binding blocker is now fixed; see "Implementation Priority" section below |
| Last updated (timestamp) | 2026-08-10T05:12:17Z (branch `claude/codex-adversarial-review-fyu0nb`) |

The table above is the fast-read summary. Detail and evidence for each field follow below — this file is the authoritative source for these fields; the sections below exist to substantiate the table, not to introduce separate competing values.

---

## Current Merged Baseline

- Branch: `main`
- Head commit: `af733091794dfe370ede4d163f093e2c4b0b554e`
- Merge date: 2026-08-09

## Latest Merged PR

- PR #125 — "docs(governance): Implementation Phase entry + Codex fixes (extension-rule contradiction, Step 13 traceability)"
- Merged: 2026-08-09
- Confirmed via `git log origin/main -1 --format="%H %ad %s" --date=short` → `af733091794dfe370ede4d163f093e2c4b0b554e 2026-08-09 ...(#125)`.
- **Note (Step 13 compliance for this update):** the checkpoint content prior to this update still showed PR #125 as "Pending" (its own pre-merge self-referential text), even though PR #125 had already merged — the post-merge sync step (the same step PR #123 performed for PR #122) had not yet been performed for PR #125. This update performs that sync now, as part of this PR's own Step 13 obligation, in addition to recording this PR's own pending state below.
- **Pending:** this PR (P0 deployment-path parity fix — Treasury/TriggerProtocol `KERNEL_ROLE` gap, plus the same fix applied to 12 other remaining contracts) — will become the new Latest Merged PR once merged.
  - **Reviewed Head SHA:** `af733091794dfe370ede4d163f093e2c4b0b554e` — `origin/main`'s HEAD at the point this branch was reset from it and this PR's work began (confirmed via `git log origin/main -1` above). No other commits landed on `main` between that point and this update.
  - **Review timestamp:** `2026-08-10T05:12:17Z` (this update's timestamp — see "Last updated" in the Summary table).
  - **Pending final merge SHA:** not yet known — GitHub assigns the squash-merge commit SHA at merge time; this is not fabricated here. Confirm via `git log origin/main -1` immediately after merging (Verification Method below), and record it under "Latest Merged PR" in the same or an immediate follow-up update, per Step 13's disclosed squash-merge-SHA limitation.
  - This same pattern (record the actual known reviewed head SHA, not just a pointer to a future check) was already followed for PR #122/#123/#124's post-merge syncs above; this entry applies it consistently to the pre-merge state as well, per the Codex finding that prompted this fix.

## Latest Commit

- `af733091794dfe370ede4d163f093e2c4b0b554e` — squash-merge commit of PR #125 into `main` (latest **merged** commit as of this update)

## Roadmap Position

Per `docs/IRAN_OS_ROADMAP.md`:

- Step-12 (roadmap): "Evidence execution & blocker disposition" — In progress / open. Evidence/prep packets remain draft/pending.
- Step-13 (roadmap): "Whitepaper-to-system mapping" — In progress / open. Documentation-only; does not close Step-12.
- Related: `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`, `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`, `docs/WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md`

Note: roadmap "Step-N" is a different numbering scheme from `CLAUDE.md`'s PR Preflight Standard "Step N" — see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` naming note. This section is a summary pointer; `docs/IRAN_OS_ROADMAP.md` remains the authoritative detailed narrative and history for roadmap phases.

## Deployment Coverage

- **Verified fact:** 12 `deploy/` scripts exist and are wired into `deploy/index.js`, covering: `IranOS_Kernel`, `PahlaviToken`, `RecognizedReserveBacking`, `API3Oracle`, `Treasury`, `SovereignWealthFund`, `VictimFund`, `ConstitutionGuard`, `JurySelection`, `JusticeProtocol`, `CitizenCard`, `PriceOracle` (`ls deploy/*.js`, cross-checked against `deploy/README.md`'s scope list).
- **⚠️ Denominator discrepancy — flagged, not yet resolved:** the "12/25 (13 remaining)" figure used in `CHANGELOG.md`, `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`, `deploy/README.md`, and this file's own prior versions does not reconcile against a direct count. Evidence:
  - `find contracts -name "*.sol" | grep -v fuzzing | grep -v interfaces | wc -l` → **26** deployable contracts (excludes `contracts/fuzzing/` and `contracts/interfaces/IPahlaviToken.sol`).
  - `deploy/README.md`'s own "Not included" list names **14** contracts (`TriggerProtocol`, `AssetFreeze`, `ProductionOracle`, `PenalLabor`, `Provincial`, `VotingSystem`, `Parliament`, `BudgetAllocation`, `Fargard7PolicyAdapter`, `VelocityFee`, `BaseIncome`, `HealthCoverage`, `DisabilitySupport`, `SovereignCrawler`) while its prose states "these **13** contracts" — a direct internal miscount in that file.
  - 12 deployed + 14 named-remaining = 26, matching the direct file count — **not** 25.
  - `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`'s own v1.3.0 historical note is self-inconsistent even at the time it was written: "6 از 25" ("6 of 25") deployed with "19 قرارداد باقی‌مانده" ("19 remaining") — 6 + 19 = 25 arithmetically, but the actual remaining set at that point (14 current "not included" contracts + the 6 later added: `VictimFund`, `ConstitutionGuard`, `JurySelection`, `JusticeProtocol`, `CitizenCard`, `PriceOracle`) was 20, not 19.
  - Most likely root cause (not yet confirmed with the project owner): `RecognizedReserveBacking.sol` was added to the contract suite later (per PR #110/#113, per `DEPLOYMENT_MANIFEST_PROTOCOL.md`'s own changelog) as a genuinely new contract, but the "25" denominator used everywhere was never incremented to "26" when it was added — `CLAUDE.md`'s own Repository Structure section (`contracts/ ... — 25 contracts`) does not list `RecognizedReserveBacking.sol` at all, consistent with this theory.
  - **Not resolved in this PR.** Per the Conflict rule (`CLAUDE.md` → `## Canonical Development Workflow (Mandatory)`), this is reported rather than silently corrected — fixing the "25"/"26" denominator would require edits to `CLAUDE.md`'s contract inventory, `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`, `docs/deployment/ROLE_WIRING_CHECKLIST.md`, and `deploy/README.md`, which is out of scope for this Checkpoint update and warrants an explicit owner decision before it propagates further.
- This section is a summary pointer; `deploy/README.md` and `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` remain the authoritative detailed sources for per-contract deployment status, pending resolution of the discrepancy above.

## Test Count

- 762 passing (`npm test`, run on this PR's branch — up from 759; 2 negative-constructor tests added for `BaseIncome`/`HealthCoverage` "invalid admin" cases; 1 deployment-path parity test added during Hostile Adversarial Review asserting Treasury's admin/kernel role split via the real `deploy/index.js` orchestration — see `CHANGELOG.md`).

## Current Production Status

- **Not production-ready.** This project does not claim production readiness, release approval, completed external audit, or completed formal verification (`.github/pull_request_template.md` Non-Claim Checklist; `CHANGELOG.md` non-claim notice).
- Roadmap Step-9 ("Production governance specification & deployment doctrine") and Step-10 ("Production readiness planning & blocker resolution") are marked Complete in `docs/IRAN_OS_ROADMAP.md`, but only as *planning/doctrine* phases — they do not constitute production readiness.
- Explicit production blockers `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open (`CHANGELOG.md` line ~181; `STEP9-BLOCK-005` individually confirmed OPEN/PENDING).
- Roadmap Step-12 (evidence execution & blocker disposition) remains open and is the active workstream for resolving these blockers.

## Remaining Work / Remaining Deployment Targets

- 14 contracts remain without executable `deploy/` scripts (per `deploy/README.md`'s "Not included" list — see the Deployment Coverage section above for the denominator discrepancy): `TriggerProtocol`, `AssetFreeze`, `ProductionOracle`, `PenalLabor`, `Provincial`, `VotingSystem`, `Parliament`, `BudgetAllocation`, `Fargard7PolicyAdapter`, `VelocityFee`, `BaseIncome`, `HealthCoverage`, `DisabilitySupport`, `SovereignCrawler`.
- Roadmap Step-12: evidence/prep packets remain draft/pending; `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open.
- Roadmap Step-13: whitepaper-to-system mapping workstream reviews remain open across welfare/justice, economy/resources, contracts/adapters, oracle/signals, evidence/audit/signoff, and Persian public participation (`docs/IRAN_OS_ROADMAP.md` lines ~152–161).

## Implementation Priority

**Project Phase:** Implementation. Governance Hardening concluded 2026-07-07 with the merge of PR #121–#124. Governance is now in Maintenance Mode per the repository owner's explicit directive — governance changes are exceptional, permitted only when supported by objective evidence (a new Codex finding not prevented by the existing framework, a CI/process failure, a deployment failure, a production incident, or a demonstrated gap unresolvable by extending existing governance), and must satisfy Step 15 (Governance Minimalism Review), Step 14 (Governance Synchronization Review), and Step 12 (Lesson-Learned Compliance) before any permanent governance artifact is added. The governance framework itself is treated as production infrastructure and will not be redesigned absent objective evidence that it failed.

**Current priority:**
1. Increase deployment coverage from the current baseline (12 contracts deployed; see the denominator discrepancy above) toward full deployment.
2. Complete the remaining production contracts.
3. Continue using the established workflow: Canonical Checkpoint → Lesson Learned → Implementation → CI → Codex Review → Findings Resolution → Merge.

**P0 blocker fixed (this PR):** the Pre-Implementation Red-Team Pass performed before starting `TriggerProtocol` deployment work found that no reachable path was identified, under the current codebase and evidence set, for any address to grant `KERNEL_ROLE` to a deployed `TriggerProtocol` on `Treasury` — meaning `Treasury.blockAddressByTrigger()` (`onlyRole(KERNEL_ROLE)`), called by `TriggerProtocol.executeTrigger()`, had no reachable production caller path: `Treasury`'s constructor gave `DEFAULT_ADMIN_ROLE` solely to the Kernel contract, which has no call-forwarding mechanism to `Treasury` (`grep -n "Treasury" contracts/kernel.sol` → zero matches). The same defect was confirmed in the 12 other remaining un-deployed contracts. This PR fixes all 13 constructors using the already-established `constructor(_admin, _kernel, ...)` split — see `CHANGELOG.md` for full detail. This is a prerequisite fix, not the `TriggerProtocol` deployment itself; no `deploy/` script exists for `TriggerProtocol` yet and deployment coverage is unchanged by this PR.

**Next implementation target:** `contracts/core/TriggerProtocol.sol` deployment itself (`deploy/16_trigger_protocol.js` + `kernel.setTriggerProtocol()` + `treasury.grantRole(KERNEL_ROLE, triggerProtocolAddress)` wiring) — the Layer 0 enforcement contract called by `Kernel` after multi-sig trigger confirmation. Rationale unchanged from the prior recommendation: it is one of the two `core/` contracts (alongside the already-deployed `ConstitutionGuard.sol`) and is explicitly named throughout `CLAUDE.md` as central to the trigger/enforcement mechanism; it is a "sensitive" component under `CLAUDE.md`, so its deployment work requires its own Pre-Implementation Red-Team Pass (distinct from the one that produced this PR, which addressed the Treasury/13-contract constructor prerequisite) before any deploy script is written.

## Open Residuals

- Active Residuals (`docs/governance/OPEN_RESIDUALS.md`): none currently active as of this checkpoint.
- Superseded: K-RES-01 (Stale-Reserve Provenance) — superseded, retained per the register's no-delete rule.

## Applicable Governance Version

- PR Preflight Standard (`CLAUDE.md` → `### PR Preflight Standard (Mandatory)`): Steps 1–15.
- Canonical Development Workflow (`CLAUDE.md` → `## Canonical Development Workflow (Mandatory)`): 11 stages, established in PR #122.
- Reviewer Lessons Learned Registry (`docs/governance/REVIEWER_LESSONS_LEARNED.md`): governance standard formalized 2026-06-17.

## Latest Lesson Learned ID

- **LL-031** — Governance Minimalism Review (see `docs/governance/REVIEWER_LESSONS_LEARNED.md`).

## Governance Status

**Governance Framework: STABLE (v1.0)** — declared 2026-07-07.

**Meaning:** the current governance framework (`CLAUDE.md`'s Canonical Development Workflow, PR Preflight Standard Steps 1–15, and the Reviewer Lessons Learned Registry) is considered complete for normal development. Future governance evolution is evidence-driven only — this is an operational status, not a new permanent rule; the enforcement mechanism is the existing `#### Step 15 — Governance Minimalism Review` and Governance Minimalism Principle already in `CLAUDE.md`, applied to any proposed future change. This status does not introduce any new CLAUDE.md section, LL entry, checklist, or Evidence Block.

**Operational implications, from this declaration forward:**

1. Governance PRs opened solely to improve governance, with no external trigger, are not warranted by default.
2. This gate applies only to creating a **new permanent governance artifact** (a rule, LL entry, workflow step, merge gate, checklist item, Evidence Block, protocol, or permanent document) — matching Step 15's own trigger scope exactly. A new artifact may be created only if at least one applies: Codex identifies a new class of finding not prevented by the existing framework; CI exposes a process gap; production or deployment reveals an uncovered governance failure; or a documented engineering failure cannot be resolved by extending an existing rule. (This operationalizes the existing 7-criterion gate's first criterion — "closes a demonstrated engineering failure, not a hypothetical one" — it does not add a new criterion.) **Extending, amending, or applying an existing rule, LL entry, or workflow stage to absorb new responsibility is never gated by this list** — it is always available and is the preferred first step (see item 4); this list only ever restricts creating something new.
3. `#### Step 15 — Governance Minimalism Review` (already in `CLAUDE.md`) still applies to any new governance artifact — this status changes the *default expectation* going in, not the review procedure itself.
4. Extending an existing rule, LL entry, or workflow stage remains preferred over creating a new permanent artifact, and is not subject to item 2's evidence gate — this restates, and does not modify, the existing Governance Duplication Review's four questions.
5. Default assumption: no governance change required. The burden of proof is on introducing a new governance rule, consistent with the existing "Governance grows only by necessity" language in the Governance Minimalism Principle.
6. Governance improvements must be justified with evidence (a specific Codex finding, CI failure, production incident, or documented unresolvable failure), not preference — consistent with the CET (Claim Evidence Tier) system and Certainty Language Rule already governing every other claim in this project.

**Re-declaration trigger:** this status should be revisited (not automatically invalidated) if a governance change is made under item 2 above — record the outcome here rather than treating STABLE (v1.0) as requiring a version bump for every future entry; a version bump is warranted only if the framework's structure changes materially (e.g., a new Step is added, an existing Step is removed or substantially rewritten).

---

## Single Source of Truth Policy

1. This file is the sole authoritative snapshot of current Iran-OS project state for the fields in the Summary table above. No other document may hold a competing, independently-maintained value for any of these fields.
2. Other documents (roadmap, `CHANGELOG.md`, deployment manifests, reports) remain the authoritative **detailed narrative and history** for their own domains and may be referenced from this file — they are not superseded or replaced. What they must not do is present themselves as an alternative *current-state snapshot* that could drift from this file.
3. Every merge to `main` MUST update this file in the same PR, per `CLAUDE.md` `#### Step 13 — Canonical Checkpoint Currency`. A PR is not READY until this file reflects the merged state. Deferring the update to a follow-up PR is not permitted.
4. If any document is found to conflict with this file's recorded state: stop, report the inconsistency, and resolve it (by correcting the stale document, or by updating this file if it was the stale side) before continuing the task that discovered the conflict.
5. This file is one of exactly three authoritative governance artifacts (alongside `docs/governance/REVIEWER_LESSONS_LEARNED.md` for permanent rules and `CHANGELOG.md` for history) — see `CLAUDE.md` `#### Step 14 — Governance Synchronization Review` for the full three-artifact responsibility table and the mandatory pre-merge synchronization check. This file does not restate that table; Step 14 is the enforcement mechanism, this file is only one of the three things it governs.

## Verification Method

Re-run the following before relying on this file, and update it if any value has changed:

```
git log origin/main -1 --format="%H %ad %s" --date=short
ls deploy/*.js
find contracts -name "*.sol" | grep -v fuzzing | grep -v interfaces | wc -l
npm test 2>&1 | tail -3
grep -n "Step-12\|Step-13" docs/IRAN_OS_ROADMAP.md | tail -10
grep -n "STEP9-BLOCK" CHANGELOG.md | tail -5
sed -n '/## Active Residuals/,/## Superseded Residuals/p' docs/governance/OPEN_RESIDUALS.md
grep -n "^## LL-" docs/governance/REVIEWER_LESSONS_LEARNED.md | tail -1
```

**Note:** the deployment-coverage verification command was changed from grepping `CHANGELOG.md`'s stated "X/25" figure to directly counting `deploy/*.js` scripts and `.sol` files, per the denominator discrepancy documented in "Deployment Coverage" above — `CHANGELOG.md`'s own stated figure is not currently trustworthy as a source for this field.

## Maintenance Rule

This file must be refreshed whenever any recorded field changes materially — a new PR merges to `main`, deployment coverage changes, roadmap Step-N position changes, production status changes, the Active Residuals section changes, or a new Lesson Learned entry is added. Update it in the same PR that causes the change — never defer the update, per `CLAUDE.md` Step 13. A checkpoint that is stale relative to `main` is a Stage 1 failure for any subsequent task that relies on it without independently re-verifying the fields above via the Verification Method.

---

*Registry created: 2026-07-07*
*CLAUDE.md reference: `## Canonical Development Workflow (Mandatory)`, Stage 1; `#### Step 13 — Canonical Checkpoint Currency`; `#### Step 14 — Governance Synchronization Review`; `#### Step 15 — Governance Minimalism Review`*
*Last updated: 2026-08-10T05:12:17Z*