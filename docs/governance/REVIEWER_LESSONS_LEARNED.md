# Reviewer Lessons Learned — Iran-OS

**Registry purpose:** Track every meaningful reviewer challenge that resulted in a new policy, process improvement, evidence requirement, or governance rule. Any finding that causes a CLAUDE.md modification, a review workflow change, or a new evidence requirement must receive a new LL entry.

**Registry location:** `docs/governance/REVIEWER_LESSONS_LEARNED.md`

**CLAUDE.md reference:** `### PR Preflight Standard (Mandatory)`, `### Red-Team Finding Classification Standard (Mandatory)`, and `### Reviewer Lessons Learned Registry (Mandatory)`

---

## Governance Standard

### Required Entry Template

Every new LL entry must use the following template. No entry may be added without completing all fields.

```
## LL-XXX

**Date:**
**PR:**
**Reviewer:**
**Review comment URL:**
**Finding:**

**What we assumed:**

**Why the assumption failed:**

**Evidence that was missing:**

**Policy created:**

**CLAUDE.md reference:**

**Verification method:**
(How to confirm this class of finding cannot recur — specific grep command or checklist step)

**Affected files:**

**Status:** Prevented / Partially Prevented / Open

**Repeat allowed?** NO

**Notes:**
```

### Governance Rule — No Incomplete Entries

No lesson may be added without documenting **all** of the following:

| Required field | Purpose |
|---|---|
| Root cause ("What we assumed" + "Why the assumption failed") | Identifies the cognitive or process error, not just the symptom |
| Evidence gap ("Evidence that was missing") | Specifies exactly what grep, check, or verification step was absent |
| Policy response ("Policy created" + "CLAUDE.md reference") | Links the lesson to the concrete rule change that prevents recurrence |
| Verification method | Provides a mechanical check that can be run on any future PR to confirm the class is prevented |

An entry that lacks any of these four fields is incomplete and must be updated before the PR containing it is merged.

### Maintenance Rule — When a New Entry is Mandatory

A new LL entry must be created whenever a reviewer finding causes any of the following:

- A new section or rule in `CLAUDE.md`
- A change to the PR preflight checklist (Steps 1–8)
- A new or modified evidence requirement in the grep evidence table
- A new entry in the forbidden wording list
- A new or modified classification rule or criterion
- A change to any governance document in `docs/governance/`
- A new monitoring specification, runbook, or deployment procedure

**Entry creation is mandatory, not optional.** The registry is the institutional memory of the project. A finding without an LL entry may be repeated.

**Timing:** Create the LL entry in the same PR that implements the policy fix — not after. The entry documents *why* the fix was needed, which is most accurately captured at the time of the fix.

### Cross-Reference Rule — What Every Entry Must Reference

Every LL entry must reference:

1. **Originating PR** — the PR on which the review comment appeared
2. **Originating review comment URL** — direct link to the specific GitHub review comment (e.g., `https://github.com/fafa33/Iran-OS/pull/N#discussion_rXXX`)
3. **Resulting policy or workflow change** — the specific CLAUDE.md section, preflight step, evidence table row, or governance document that was modified as a result

An entry that references only "see PR #N" without the specific comment URL and specific policy change is insufficient.

**Self-Review Exception:** For self-identified findings (Reviewer: `Self (...)`) where no external GitHub review comment exists, the **Review comment URL** field must contain `N/A — self-identified [category] finding; no external review comment`. The **Finding** field must describe the observable trigger that surfaced the issue (e.g., GitHub `mergeable_state: dirty`, a failing test, a static-analysis output, a direct API status check). This form is auditable: the trigger is on record even without a comment URL. An entry that merely says `N/A` without categorizing the finding type is still insufficient.

### Naming and Numbering

- LL entries are numbered sequentially: LL-001, LL-002, …
- Do not reuse numbers. Do not delete entries.
- Retired or superseded findings are marked `Status: Superseded` with a note pointing to the entry that replaced them.

---

## Success Metric

The project does **NOT** measure: "Number of findings."

The project measures: **"Number of repeated finding classes."**

Goal: Repeated finding classes trend toward zero.

A finding may happen once. The same *class* of finding must never happen twice.

---

## LL-001

**Date:** 2026-06-17
**PR:** #85, #86, #87
**Reviewer:** chatgpt-codex-connector[bot]
**Review comment URL:** https://github.com/fafa33/Iran-OS/pull/86#discussion_r3431142252
**Finding:** "Reopen GAP-MEX-04 until reserve timestamps are checked" — closure claim made without distinguishing between oracle liveness (what Gate A/B address) and reserve value provenance (what they don't address). Reviewer challenged the word "CLOSED" as overstating what was actually fixed.

**What we assumed:** "CLOSED" is an adequate status label for a gap where the primary remediation was implemented.

**Why the assumption failed:** "CLOSED" without a scope qualifier implies complete elimination of the concern. The stale-reserve-provenance concern was real and documented nowhere as a known residual. Reviewers correctly challenged the overbroad label.

**Evidence that was missing:** Explicit scope qualifier on "CLOSED"; enumerated list of open residuals; classification of stale-reserve provenance as HARDENING_ONLY with 5-criterion reasoning.

**Policy created:** Forbidden wording rule — `"CLOSED"` for a gap must be followed by `"CLOSED (scope: [exact scope]) — remaining open: [list]"`.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 5, Forbidden Wording Scan — `"CLOSED"` row.

**Verification method:** Before push, grep changed files for bare `\bCLOSED\b` not followed by a scope qualifier and residuals list. Any match is a preflight failure.

**Affected files:** `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** K-RES-01 was created as the explicit residual hardening note. GAP-MEX-04 closure wording updated to "CLOSED (current-code remediation scope)" with K-RES-01 documented inline.

---

## LL-002

**Date:** 2026-06-17
**PR:** #87
**Reviewer:** chatgpt-codex-connector[bot]
**Review comment URL:** https://github.com/fafa33/Iran-OS/pull/87#discussion_r3431683139
**Finding:** "Reclassify K-RES-01 against the live mint path" — claimed `reserveCompliant` in `PahlaviToken.mint()` constitutes a live enforcement consequence reachable via SWF, contradicting the K-RES-01 claim that "no reachable downstream enforcement consequence exists."

**What we assumed:** "No reachable enforcement consequence" is evident from architectural knowledge — SWF would not call `PahlaviToken.mint()` because no such code exists.

**Why the assumption failed:** The claim was architecturally correct but stated without grep evidence. `SovereignWealthFund.sol` holds `MINTER_ROLE`, which is visible and creates a plausible challenge even when the calling code does not exist. Without the grep result, reviewers correctly challenged the claim.

**Evidence that was missing:**
- `grep -r '\.mint(' contracts/ --include="*.sol" | grep -v fuzzing` → one match only in fuzzing harness
- Explicit statement: "SWF holds MINTER_ROLE but SovereignWealthFund.sol contains no function that calls PahlaviToken.mint() — verified by codebase grep"

**Policy created:** Any "no reachable downstream enforcement consequence" claim must be accompanied by the grep result for every enforcement surface (mint, freeze, trigger, treasury). The incomplete minting circuit must be explicitly documented with grep evidence, not inferred.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 3 Evidence Table — `"No downstream enforcement consequence"` row; Step 5 Forbidden Wording Scan — `"no reachable downstream enforcement consequence"` row.

**Verification method:** Before writing any "no enforcement consequence" claim: run `grep -r '\.mint(' contracts/ --include="*.sol" | grep -v fuzzing`. If any MINTER_ROLE holder exists, additionally run `grep '\.mint(' contracts/path/to/MinterRoleHolder.sol`. Paste both results inline with the claim.

**Affected files:** `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** Fix committed in `d169129`. K-RES-01 now explicitly states: "SovereignWealthFund.sol holds MINTER_ROLE but contains no function that calls PahlaviToken.mint() — verified by codebase grep."

---

## LL-003

**Date:** 2026-06-17
**PR:** #87, #88
**Reviewer:** chatgpt-codex-connector[bot]
**Review comment URL:** https://github.com/fafa33/Iran-OS/pull/88#discussion_r3431898755
**Finding:** "Require inherited AccessControl grant checks" — the PR Preflight Standard evidence table instructed checking for a "custom public grant function" to prove a role is constructor-only. This is insufficient under OpenZeppelin `AccessControl`: the inherited `grantRole` function is always available to the `DEFAULT_ADMIN_ROLE` holder, regardless of whether a custom public function exists.

**What we assumed:** "No custom public grant function → role is constructor-only." We assumed absence of a custom public grant function was sufficient proof of constructor-only role access under OpenZeppelin AccessControl, and that this was safe to assert without running a grep.

**Why the assumption failed:** OpenZeppelin `AccessControl`'s inherited `grantRole` is always available to the `DEFAULT_ADMIN_ROLE` holder regardless of whether a custom public function exists. `API3Oracle.sol:79` grants `DEFAULT_ADMIN_ROLE` to the Kernel — the Kernel can call `grantRole(FEEDER_ROLE, newAddress)` at any time via the inherited path. The policy was architecturally wrong for any AccessControl contract with a live admin, and the Codex reviewer correctly identified the gap.

**Evidence that was missing:**
- `grep 'DEFAULT_ADMIN_ROLE' contracts/oracles/API3Oracle.sol` → `_grantRole(DEFAULT_ADMIN_ROLE, _kernel)` at line 79
- `grep '_setRoleAdmin' contracts/oracles/API3Oracle.sol` → no custom admin override
- Explicit note that DEFAULT_ADMIN_ROLE holder can call inherited `grantRole` for any role

**Policy created:** "ROLE is restricted to named operators" evidence requirement now mandates three greps: (1) constructor `_grantRole` calls, (2) `_setRoleAdmin` overrides, (3) `DEFAULT_ADMIN_ROLE` holders — with all three results documented.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 3 Evidence Table — `"ROLE is restricted to named operators"` row (updated in PR #89).

**Verification method:** Before claiming a role is restricted, run all three greps: (1) `grep '_grantRole(ROLE' contracts/path/to/Contract.sol`, (2) `grep '_setRoleAdmin' contracts/path/to/Contract.sol`, (3) `grep 'DEFAULT_ADMIN_ROLE' contracts/path/to/Contract.sol`. Document all three results. Never rely on absence of a custom public function alone.

**Affected files:** `CLAUDE.md` (PR Preflight Standard Step 3 Evidence Table updated in PR #89)

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** Fix committed in PR #89. The policy was wrong in PR #88 and corrected in the same session after Codex challenge. This is precisely the class of error the preflight standard was designed to prevent — but the preflight standard itself was written without running the grep.

---

## LL-004

**Date:** 2026-06-17
**PR:** #88
**Reviewer:** Self (post-merge analysis)
**Review comment URL:** N/A — self-identified finding; no external review comment
**Finding:** The PR Preflight Standard was written without applying the standard to itself. A policy document that says "verify before claim, not after challenge" was written with a claim (constructor-only role proof) that was not verified before publication.

**What we assumed:** Governance documents are "just documentation" and are exempt from the grep-evidence discipline required of code PRs and audit reports.

**Why the assumption failed:** Governance documents that contain evidence requirements must themselves satisfy those requirements. The AccessControl DEFAULT_ADMIN_ROLE gap (LL-003) only appeared because the policy was not self-applied. If the policy had been applied while writing the policy, the `grep 'DEFAULT_ADMIN_ROLE'` step would have caught the gap before merge.

**Evidence that was missing:** Self-Codex-Review was not performed on the governance document before push.

**Policy created:** Self-Codex-Review applies to all documents including governance documents. No category exemption exists.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 6 Self-Codex-Review — applies universally, no exemption for governance or policy documents.

**Verification method:** Before pushing any CLAUDE.md, docs/governance/, docs/reports/, or docs/oracle/ change, apply the same preflight (grep evidence, forbidden wording scan, self-Codex-review) as for a code PR. If the document contains any claim (e.g., "constructor-only role"), verify that claim with grep before push.

**Affected files:** `CLAUDE.md` (PR Preflight Standard Step 6 self-review scope clarified)

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** This is a meta-lesson: the first PR containing the preflight standard immediately violated it. The correct response is to add a universal scope clause — no document type is exempt from evidence requirements.

---

## LL-005

**Date:** 2026-06-17
**PR:** #86, #87
**Reviewer:** chatgpt-codex-connector[bot]
**Review comment URL:** https://github.com/fafa33/Iran-OS/pull/86#discussion_r3431142252
**Finding:** "Stale-reserve replay case" — a feeder can refresh `PAH_USD_KEY` (satisfying Gate A) and still submit an old `newReserves` value, because `syncReserves(uint256 newReserves)` carries no timestamp or provenance for the reserve value. The claim was that GAP-MEX-04 closure missed this.

**What we assumed:** The GAP-MEX-04 "CLOSED" label implied complete elimination of all oracle-freshness concerns. No separate documentation of out-of-scope concerns (reserve value provenance) was needed because the primary remediation was implemented.

**Why the assumption failed:** "CLOSED" without a scope qualifier implies completeness. The stale-reserve scenario is real: a feeder can satisfy Gate A (oracle key freshness) while still submitting a stale reserve value, because `syncReserves` carries no timestamp or provenance for the reserve value itself. This was not documented as a known limitation, so the closure appeared to claim more than it delivered.

**Evidence that was missing:** Explicit scope statement for GAP-MEX-04 ("oracle liveness only, not reserve value provenance"); named residual (K-RES-01) with classification rationale and 5-criterion evaluation.

**Policy created:** Gap closures must name their scope precisely. Any concern outside the scope must be named and classified (HARDENING_ONLY, DOCUMENTATION_REQUIRED, etc.) in the same closure document.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 5 Forbidden Wording — `"CLOSED"` requires scope + residuals. `### Red-Team Finding Classification Standard` — every finding must complete the 5-criterion table.

**Verification method:** When closing any gap, enumerate: (1) what is addressed by the implementation (file:line), (2) what related concerns exist that are outside scope, (3) why each out-of-scope concern is HARDENING_ONLY or lower. Run the Step 5 forbidden-wording scan; any bare `\bCLOSED\b` without scope qualifier is a preflight failure.

**Affected files:** `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** K-RES-01 was created as a direct result of this lesson. All five BLOCKER_P1 criteria were evaluated and documented for the stale-reserve scenario. Finding classified HARDENING_ONLY with reasoning in PR #86 comment and PR #87 documentation.

---

## LL-006

**Date:** 2026-06-17
**PR:** #87
**Reviewer:** Self (operational)
**Review comment URL:** N/A — self-identified operational finding; no external review comment
**Finding:** PR #87 was pushed with `mergeable_state: dirty` because the branch was not rebased before push. Required a force-push rebase cycle after the PR was already open.

**What we assumed:** Rebase is only needed when a conflict is suspected; if the branch compiles and tests pass locally, it is safe to push.

**Why the assumption failed:** Branches diverge silently after a mainline merge. A branch that passes all local tests can still produce `mergeable_state: dirty` on GitHub if the remote main has advanced since the branch was created. There is no local warning — the dirty state only appears when the PR is opened on GitHub.

**Evidence that was missing:** A `git fetch origin main && git rebase origin/main` step before push.

**Policy created:** Rebase before push is now Step 1 of the PR Preflight Standard — mandatory before every push, not just when a conflict is suspected.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 1 Rebase.

**Verification method:** Always run `git fetch origin main && git rebase origin/main` before push. Confirm with `git status` that the branch is not behind `origin/main`. Never push a branch that has not been rebased on current main.

**Affected files:** `CLAUDE.md` (PR Preflight Standard Step 1 Rebase added)

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** This is a pure process discipline issue, not a code or documentation quality issue. The fix is mechanical: Step 1 of the preflight is non-negotiable.

---

## LL-007

**Date:** 2026-06-17
**PR:** #90
**Reviewer:** chatgpt-codex-connector[bot]
**Review comment URL:** https://github.com/fafa33/Iran-OS/pull/90#discussion_r3432074234
**Finding:** "Allow self-identified lessons to satisfy the source rule" — the Cross-Reference Rule requires every LL entry to include a direct GitHub review-comment URL. LL-004 and LL-006 use `N/A` because they are self-identified findings with no external comment. The rule text did not define `N/A` as a valid exception, making these entries formally non-conformant and leaving future reviewers unable to distinguish a valid self-review from an incomplete entry that should block merge.

**What we assumed:** Self-identified entries with `N/A` in the Review comment URL field were self-evidently valid — the absence of an external comment is reason enough for `N/A`, and no explicit exception clause was necessary.

**Why the assumption failed:** Without an explicit exception clause, the rule and the entry are in formal contradiction: the rule says every entry "must reference" a comment URL; the entry says `N/A`. A future reviewer or automated check cannot determine whether `N/A` is an allowed exception or a missing required field. Ambiguity in a governance rule is itself a governance defect.

**Evidence that was missing:** An explicit self-review exception in the Cross-Reference Rule defining: (a) when `N/A` is valid (Reviewer is `Self (...)`), (b) the required content of the `N/A` field (`N/A — self-identified [category] finding; no external review comment`), and (c) the auditable substitute (the observable trigger in the Finding field).

**Policy created:** Cross-Reference Rule amended with Self-Review Exception: for entries where Reviewer is `Self (...)`, the Review comment URL must contain `N/A — self-identified [category] finding; no external review comment` and the Finding field must describe the observable trigger.

**CLAUDE.md reference:** `### Reviewer Lessons Learned Registry (Mandatory)` — the amendment is in the registry itself; no CLAUDE.md change required.

**Verification method:** For every LL entry where Reviewer contains "Self": confirm Review comment URL matches `N/A — self-identified ... finding; no external review comment` and Finding field identifies an observable trigger. For all other entries: confirm Review comment URL is a valid GitHub discussion link (`https://github.com/fafa33/Iran-OS/pull/N#discussion_rXXX`).

**Affected files:** `docs/governance/REVIEWER_LESSONS_LEARNED.md` (Cross-Reference Rule Self-Review Exception added; LL-007 entry added)

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** Finding arrived after PR #90 merged. Fix applied in PR #91 on branch `claude/codex-adversarial-review-fyu0nb`.

---

## Adding New Entries

When a reviewer finding causes any of the following, a new LL entry is required before the PR is closed:

- A new CLAUDE.md section or rule
- A change to the PR preflight checklist
- A new evidence requirement
- A change to the forbidden wording list
- A new classification standard or criterion
- A change to any governance document in `docs/governance/`

**Entry creation is mandatory, not optional.** The registry is the institutional memory of the project. A finding without an LL entry may be repeated.

**Naming:** LL entries are numbered sequentially (LL-001, LL-002, …). Do not reuse numbers. Do not delete entries.

---

*Registry created: 2026-06-17*
*Governance standard formalized: 2026-06-17*
*Branch: claude/codex-adversarial-review-fyu0nb*
*Entries: LL-001 through LL-007*
