# Canonical Checkpoint — Iran-OS

**This file is the Single Source of Truth (SSOT) for current Iran-OS project state.** It is not documentation — it is a mandatory engineering artifact recording the authoritative operational state of the project. Nothing else may supersede it. Other documents may reference it; they must not become competing sources of truth for the fields listed below (see "Single Source of Truth Policy").

Every new task begins by loading this file, then the applicable Lesson Learned registry, before any design, coding, documentation, deployment, or roadmap work — see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` → Stage 1 and Stage 2.

**Location:** `docs/governance/CANONICAL_CHECKPOINT.md`

**CLAUDE.md reference:** `## Canonical Development Workflow (Mandatory)` → Stage 1 — Canonical Checkpoint; `#### Step 13 — Canonical Checkpoint Currency` (PR Preflight Standard)

---

## Summary (required minimum fields)

| Field | Value |
|---|---|
| Latest merged PR | #123 — see "Latest Merged PR" below; this PR is pending |
| Latest merged commit | `fc1794d024d15bd670b9239b3486e0e96a7d5f57` (squash-merge of PR #123 into `main`) |
| Current baseline | `main` @ `fc1794d024d15bd670b9239b3486e0e96a7d5f57` |
| Current roadmap position | Roadmap Step-12 (Evidence execution & blocker disposition) — open; Roadmap Step-13 (Whitepaper-to-system mapping) — open |
| Current deployment coverage | 12/25 contracts have executable `deploy/` scripts (13 remaining) |
| Current test count | 759 passing (`npm test`) |
| Current production status | Not production-ready. Roadmap Step-9/Step-10 (production governance doctrine / readiness planning) are marked Complete as *planning* phases only — actual production blockers `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open (`CHANGELOG.md`); no external audit, no formal verification, no release signoff |
| Remaining deployment targets | 13/25 contracts without executable `deploy/` scripts — see `deploy/README.md` actual-status listing |
| Open residual work | `docs/governance/OPEN_RESIDUALS.md` Active Residuals: none currently active |
| Applicable governance version | PR Preflight Standard: Steps 1–15; Canonical Development Workflow: 11 stages (established PR #122); Reviewer Lessons Learned Registry: governance standard formalized 2026-06-17 |
| Latest Lesson Learned ID | LL-031 |
| **Governance Framework Status** | **STABLE (v1.0)** — see "Governance Status" section below |
| Last updated (timestamp) | 2026-07-07T13:56:49Z (branch `governance/status-declaration-v1`) |

The table above is the fast-read summary. Detail and evidence for each field follow below — this file is the authoritative source for these fields; the sections below exist to substantiate the table, not to introduce separate competing values.

---

## Current Merged Baseline

- Branch: `main`
- Head commit: `fc1794d024d15bd670b9239b3486e0e96a7d5f57`
- Merge date: 2026-07-07

## Latest Merged PR

- PR #123 — "docs(governance): sync Canonical Checkpoint to PR #122's actual post-merge state"
- Merged: 2026-07-07
- **Pending:** this PR (governance status declaration) — will become the new Latest Merged PR once merged. Per Step 13's disclosed squash-merge-SHA limitation, its exact merge commit SHA is not knowable before merge; confirm via `git log origin/main -1` immediately after merging, per the same pattern already followed for PR #122/#123.

## Latest Commit

- `fc1794d024d15bd670b9239b3486e0e96a7d5f57` — squash-merge commit of PR #123 into `main` (latest **merged** commit as of this update)

## Roadmap Position

Per `docs/IRAN_OS_ROADMAP.md`:

- Step-12 (roadmap): "Evidence execution & blocker disposition" — In progress / open. Evidence/prep packets remain draft/pending.
- Step-13 (roadmap): "Whitepaper-to-system mapping" — In progress / open. Documentation-only; does not close Step-12.
- Related: `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`, `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`, `docs/WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md`

Note: roadmap "Step-N" is a different numbering scheme from `CLAUDE.md`'s PR Preflight Standard "Step N" — see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` naming note. This section is a summary pointer; `docs/IRAN_OS_ROADMAP.md` remains the authoritative detailed narrative and history for roadmap phases.

## Deployment Coverage

- 12/25 contracts have executable `deploy/` scripts (13 remaining).
- Source: `CHANGELOG.md` ("Deployment coverage 12/25: PriceOracle"), `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` v1.3.3, `docs/deployment/ROLE_WIRING_CHECKLIST.md` v1.7.
- This section is a summary pointer; `deploy/README.md` and `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` remain the authoritative detailed sources for per-contract deployment status.

## Test Count

- 759 passing (`npm test`, run on commit `fc1794d`).

## Current Production Status

- **Not production-ready.** This project does not claim production readiness, release approval, completed external audit, or completed formal verification (`.github/pull_request_template.md` Non-Claim Checklist; `CHANGELOG.md` non-claim notice).
- Roadmap Step-9 ("Production governance specification & deployment doctrine") and Step-10 ("Production readiness planning & blocker resolution") are marked Complete in `docs/IRAN_OS_ROADMAP.md`, but only as *planning/doctrine* phases — they do not constitute production readiness.
- Explicit production blockers `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open (`CHANGELOG.md` line ~181; `STEP9-BLOCK-005` individually confirmed OPEN/PENDING).
- Roadmap Step-12 (evidence execution & blocker disposition) remains open and is the active workstream for resolving these blockers.

## Remaining Work / Remaining Deployment Targets

- 13/25 contracts remain without executable `deploy/` scripts — see `deploy/README.md`'s actual-status listing for which.
- Roadmap Step-12: evidence/prep packets remain draft/pending; `STEP9-BLOCK-001` through `STEP9-BLOCK-008` remain open.
- Roadmap Step-13: whitepaper-to-system mapping workstream reviews remain open across welfare/justice, economy/resources, contracts/adapters, oracle/signals, evidence/audit/signoff, and Persian public participation (`docs/IRAN_OS_ROADMAP.md` lines ~152–161).

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
2. A governance change is permitted only if at least one applies: Codex identifies a new class of finding not prevented by the existing framework; CI exposes a process gap; production or deployment reveals an uncovered governance failure; or a documented engineering failure cannot be resolved by extending an existing rule. (This operationalizes the existing 7-criterion gate's first criterion — "closes a demonstrated engineering failure, not a hypothetical one" — it does not add a new criterion.)
3. `#### Step 15 — Governance Minimalism Review` (already in `CLAUDE.md`) still applies to any new governance artifact — this status changes the *default expectation* going in, not the review procedure itself.
4. Extending an existing rule, LL entry, or workflow stage remains preferred over creating a new permanent artifact — this restates, and does not modify, the existing Governance Duplication Review's four questions.
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
grep -n "Deployment coverage\|coverage.*/25" CHANGELOG.md | tail -3
npm test 2>&1 | tail -3
grep -n "Step-12\|Step-13" docs/IRAN_OS_ROADMAP.md | tail -10
grep -n "STEP9-BLOCK" CHANGELOG.md | tail -5
sed -n '/## Active Residuals/,/## Superseded Residuals/p' docs/governance/OPEN_RESIDUALS.md
grep -n "^## LL-" docs/governance/REVIEWER_LESSONS_LEARNED.md | tail -1
```

## Maintenance Rule

This file must be refreshed whenever any recorded field changes materially — a new PR merges to `main`, deployment coverage changes, roadmap Step-N position changes, production status changes, the Active Residuals section changes, or a new Lesson Learned entry is added. Update it in the same PR that causes the change — never defer the update, per `CLAUDE.md` Step 13. A checkpoint that is stale relative to `main` is a Stage 1 failure for any subsequent task that relies on it without independently re-verifying the fields above via the Verification Method.

---

*Registry created: 2026-07-07*
*CLAUDE.md reference: `## Canonical Development Workflow (Mandatory)`, Stage 1; `#### Step 13 — Canonical Checkpoint Currency`; `#### Step 14 — Governance Synchronization Review`*
*Last updated: 2026-07-07T13:56:49Z*
