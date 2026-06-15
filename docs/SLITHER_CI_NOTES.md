# Slither CI Workflow — Operational Notes

## Overview

`.github/workflows/slither.yml` runs [Slither v0.11.5](https://github.com/crytic/slither) static analysis on every pull request targeting `main` and on manual dispatch. The workflow is **non-blocking for findings**: Slither is invoked with `--fail-none`, so successful scans return exit code `0` even when findings are present. The workflow fails only if Slither encounters a tool, compile, or analysis error.

---

## Why Non-Blocking?

The baseline audit (`docs/reports/SLITHER_BASELINE_AUDIT.md`) documents **130 findings** across the 25 IranOS production contracts. These represent the known starting state as of the initial audit. Blocking CI on the full finding count would make the workflow useless from day one.

Using `--fail-none` means:

- Every PR still gets a full Slither scan.
- Reviewers can inspect the uploaded artifacts to check whether a PR introduced *new* findings.
- Findings do not fail the workflow.
- True Slither tool, compile, or analysis errors still fail the workflow.
- The workflow does not interfere with the existing `CI / npm test` gate.

---

## Scan Scope

The CI workflow scans the production-contract baseline and excludes test-only fuzzing harnesses:

```text
contracts/fuzzing/
```

This keeps the CI output comparable to the baseline documented in `docs/reports/SLITHER_BASELINE_AUDIT.md`, which was generated before `contracts/fuzzing/FuzzPahlaviToken.sol` existed and covers the 25 project production contracts.

Echidna harnesses are intentionally analyzed through the fuzzing workflow and readiness reports, not through the production Slither baseline.

---

## Artifacts

Each run uploads two artifacts retained for **30 days**:

| Artifact name | Contents |
|---|---|
| `slither-report-json` | Machine-readable JSON from `--json slither-report.json` |
| `slither-report-text` | Human-readable stdout/stderr captured via `tee` |

Download artifacts from the **Actions → (run) → Artifacts** panel in GitHub.

---

## Job Summary

A short status block is written to the GitHub job summary after each run. It indicates:

- Whether Slither completed successfully.
- Whether a true Slither tool, compile, or analysis error occurred.
- A link to the baseline and triage documents.

---

## Comparing Against the Baseline

New findings (not present in the baseline) should be reviewed against the priority matrix before merging:

1. Download `slither-report-json` artifact.
2. Compare detector names and affected contracts against `docs/reports/SLITHER_BASELINE_AUDIT.md`.
3. Consult `docs/reports/SLITHER_REMEDIATION_PRIORITY_MATRIX.md` for remediation guidance.
4. If a new HIGH or MEDIUM finding is introduced, block the PR pending review.

---

## Running Locally

The workflow mirrors the local audit procedure:

```bash
# 1. Compile contracts (required before --hardhat-ignore-compile)
npm run compile

# 2. Install Slither (pin version for reproducibility)
pip install slither-analyzer==0.11.5

# 3. Run production-baseline analysis
slither . \
  --hardhat-ignore-compile \
  --filter-paths "contracts/fuzzing" \
  --fail-none \
  --json slither-report.json \
  2>&1 | tee slither-output.txt
SLITHER_EXIT="${PIPESTATUS[0]}"
echo "Slither exit code: ${SLITHER_EXIT}"
```

`PIPESTATUS[0]` must be captured immediately after the pipeline; `$?` would report the exit code of `tee`, not Slither.

With `--fail-none`, exit code `0` means Slither completed successfully, even if findings were detected and written to the artifacts. Any nonzero exit code should be treated as a Slither tool, compile, or analysis error.

**Network note:** If `binaries.soliditylang.org` is blocked in your environment, pre-compile with Hardhat's bundled WASM compiler and use `--hardhat-ignore-compile` to skip re-compilation inside Slither. See the baseline audit report for full workaround details.

---

## Pinning Rationale

Slither is pinned to `0.11.5` so that:

- CI output is reproducible across runs.
- Finding counts can be compared against the baseline (which was generated with v0.11.5).
- Upgrades are an explicit, reviewed action — not an invisible drift.

To upgrade Slither, update the `pip install` line, re-run the baseline, and update `docs/reports/SLITHER_BASELINE_AUDIT.md` accordingly.

---

## What This Workflow Does Not Do

- Does **not** run Echidna fuzzing (planned separately).
- Does **not** run Mythril symbolic execution (planned separately).
- Does **not** enforce coverage thresholds.
- Does **not** make any claim about production readiness, external audit completion, formal verification, or Step 12 blocker closure.
- Does **not** modify contracts, tests, or any production code.
