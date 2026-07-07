# Canonical Checkpoint — Iran-OS

**Purpose:** The sole authoritative snapshot of current project state. Every new task begins by loading this file — see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` → Stage 1.

**Location:** `docs/governance/CANONICAL_CHECKPOINT.md`

**CLAUDE.md reference:** `## Canonical Development Workflow (Mandatory)` → Stage 1 — Canonical Checkpoint

**Last updated:** 2026-07-07 (as of commit `e9fab3453a9e9489f2a970640c02ef5dbe53a159`)

---

## Current Merged Baseline

- Branch: `main`
- Head commit: `e9fab3453a9e9489f2a970640c02ef5dbe53a159`
- Merge date: 2026-07-07

## Latest Merged PR

- PR #121 — "docs(deployment/governance): fix stale PriceOracle caller + Step 11 Documentation-Parity Review + Step 12 LL Compliance Consultation (LL-026, LL-027)"
- Merged: 2026-07-07

## Latest Commit

- `e9fab3453a9e9489f2a970640c02ef5dbe53a159` — merge commit of PR #121 into `main`

## Roadmap Position

Per `docs/IRAN_OS_ROADMAP.md`:

- Step-12 (roadmap): "Evidence execution & blocker disposition" — In progress / open. Evidence/prep packets remain draft/pending.
- Step-13 (roadmap): "Whitepaper-to-system mapping" — In progress / open. Documentation-only; does not close Step-12.
- Related: `docs/reports/STEP12_EVIDENCE_EXECUTION_BLOCKER_DISPOSITION.md`, `docs/WHITEPAPER_TO_SYSTEM_MAPPING_FA.md`, `docs/WHITEPAPER_MAPPING_REVIEW_CHECKLIST_FA.md`

Note: roadmap "Step-N" is a different numbering scheme from `CLAUDE.md`'s PR Preflight Standard "Step N" — see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` naming note.

## Deployment Coverage

- 12/25 contracts have executable `deploy/` scripts (13 remaining).
- Source: `CHANGELOG.md` ("Deployment coverage 12/25: PriceOracle"), `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` v1.3.3, `docs/deployment/ROLE_WIRING_CHECKLIST.md` v1.7.

## Test Count

- 759 passing (`npm test`, run on commit `e9fab34`).

## Remaining Work

- 13/25 contracts remain without executable `deploy/` scripts — see `deploy/README.md`'s actual-status listing for which.
- Roadmap Step-12: evidence/prep packets remain draft/pending.
- Roadmap Step-13: whitepaper-to-system mapping workstream reviews remain open across welfare/justice, economy/resources, contracts/adapters, oracle/signals, evidence/audit/signoff, and Persian public participation (`docs/IRAN_OS_ROADMAP.md` lines ~152–161).
- `STEP9-BLOCK-005`: last known status was OPEN/PENDING (`CHANGELOG.md`); not independently re-verified as part of writing this checkpoint — re-run the verification method below before relying on this line.

## Open Residuals

- Active Residuals (`docs/governance/OPEN_RESIDUALS.md`): none currently active as of this checkpoint.
- Superseded: K-RES-01 (Stale-Reserve Provenance) — superseded, retained per the register's no-delete rule.

---

## Verification Method

Re-run the following before relying on this file, and update it if any value has changed:

```
git log origin/main -1 --format="%H %ad %s" --date=short
grep -n "Deployment coverage\|coverage.*/25" CHANGELOG.md | tail -3
npm test 2>&1 | tail -3
grep -n "Step-12\|Step-13" docs/IRAN_OS_ROADMAP.md | tail -10
sed -n '/## Active Residuals/,/## Superseded Residuals/p' docs/governance/OPEN_RESIDUALS.md
```

## Maintenance Rule

This file must be refreshed whenever any recorded field changes materially — a new PR merges to `main`, deployment coverage changes, roadmap Step-N position changes, or the Active Residuals section changes. Update it in the same PR that causes the change, or in an immediate follow-up PR. A checkpoint that is stale relative to `main` is a Stage 1 failure for any subsequent task that relies on it without independently re-verifying the fields above.

---

*Registry created: 2026-07-07*
*CLAUDE.md reference: `## Canonical Development Workflow (Mandatory)`, Stage 1*
