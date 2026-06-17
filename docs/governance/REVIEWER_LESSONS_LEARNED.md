# Reviewer Lessons Learned — Iran-OS

**Registry purpose:** Track every meaningful reviewer challenge that resulted in a new policy, process improvement, evidence requirement, or governance rule. Any finding that causes a CLAUDE.md modification, a review workflow change, or a new evidence requirement must receive a new LL entry.

**Registry location:** `docs/governance/REVIEWER_LESSONS_LEARNED.md`

**CLAUDE.md reference:** `### PR Preflight Standard (Mandatory)` and `### Red-Team Finding Classification Standard (Mandatory)`

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
**Finding:** "Reopen GAP-MEX-04 until reserve timestamps are checked" — closure claim made without distinguishing between oracle liveness (what Gate A/B address) and reserve value provenance (what they don't address). Reviewer challenged the word "CLOSED" as overstating what was actually fixed.

**Root Cause:** The GAP-MEX-04 closure used the word "CLOSED" without scoping it to the specific remediation implemented. "CLOSED" implied complete elimination of the concern, not closure of the specific current-code gap.

**Why the reviewer was able to raise the issue:** The documentation said "CLOSED" with no enumeration of what remained open. The stale-reserve-provenance concern was real and documented nowhere as a known residual.

**Evidence that was missing:** Explicit scope qualifier on "CLOSED"; enumerated list of open residuals; classification of stale-reserve provenance as HARDENING_ONLY with reasoning.

**Policy added:** Forbidden wording rule — `"CLOSED"` for a gap must be followed by `"CLOSED (scope: [exact scope]) — remaining open: [list]"`.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 5, Forbidden Wording Scan — `"CLOSED"` row.

**Future prevention mechanism:** Every gap closure claim must enumerate remaining open items in the same table row. Codex preflight scans for bare "CLOSED" and requires scope + residuals.

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** K-RES-01 was created as the explicit residual hardening note. GAP-MEX-04 closure wording updated to "CLOSED (current-code remediation scope)" with K-RES-01 documented inline.

---

## LL-002

**Date:** 2026-06-17
**PR:** #87
**Reviewer:** chatgpt-codex-connector[bot]
**Finding:** "Reclassify K-RES-01 against the live mint path" — claimed `reserveCompliant` in `PahlaviToken.mint()` constitutes a live enforcement consequence reachable via SWF, contradicting the K-RES-01 claim that "no reachable downstream enforcement consequence exists."

**Root Cause:** K-RES-01 said "no reachable enforcement consequence" without proving it. The claim was true (SWF has no `PahlaviToken.mint()` call) but was stated from architectural knowledge, not from grep evidence. The documentation gave Codex an opening to challenge it.

**Why the reviewer was able to raise the issue:** `SovereignWealthFund.sol` holds `MINTER_ROLE`, and `PahlaviToken.mint()` is gated by `reserveCompliant`. The documentation did not explain why this combination is not currently exploitable.

**Evidence that was missing:**
- `grep -r '\.mint(' contracts/ --include="*.sol" | grep -v fuzzing` result showing zero matches outside fuzzing harness
- Explicit statement: "SWF holds MINTER_ROLE but SovereignWealthFund.sol contains no function that calls PahlaviToken.mint()"

**Policy added:** Any "no reachable downstream enforcement consequence" claim must be accompanied by the grep result for every enforcement surface (mint, freeze, trigger, treasury). The incomplete minting circuit must be explicitly documented, not just inferred.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 3 Evidence Table — `"No downstream enforcement consequence"` row; Step 5 Forbidden Wording Scan — `"no reachable downstream enforcement consequence"` row.

**Future prevention mechanism:** Before writing "no enforcement consequence," run `grep -r '\.mint(' contracts/ --include="*.sol" | grep -v fuzzing` and paste the result. If MINTER_ROLE exists, additionally grep for `.mint(` inside every MINTER_ROLE holder's source file.

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** Fix committed in `d169129`. K-RES-01 now explicitly states: "SovereignWealthFund.sol holds MINTER_ROLE but contains no function that calls PahlaviToken.mint() — verified by codebase grep."

---

## LL-003

**Date:** 2026-06-17
**PR:** #87, #88
**Reviewer:** chatgpt-codex-connector[bot]
**Finding:** "Require inherited AccessControl grant checks" — the PR Preflight Standard evidence table instructed checking for a "custom public grant function" to prove a role is constructor-only. This is insufficient under OpenZeppelin `AccessControl`: the inherited `grantRole` function is always available to the `DEFAULT_ADMIN_ROLE` holder, regardless of whether a custom public function exists.

**Root Cause:** The evidence requirement was written from memory about OpenZeppelin AccessControl semantics without running the grep to verify what was actually in the contracts. `API3Oracle.sol:79` grants `DEFAULT_ADMIN_ROLE` to the Kernel — meaning the Kernel can call `grantRole(FEEDER_ROLE, newAddress)` at any time via the inherited path.

**Why the reviewer was able to raise the issue:** The policy said "no public grant function → role is constructor-only" — which is architecturally wrong for any AccessControl contract with a live admin. The Codex reviewer knew OpenZeppelin's inherited grant path and correctly identified the gap.

**Evidence that was missing:**
- `grep 'DEFAULT_ADMIN_ROLE' contracts/oracles/API3Oracle.sol` → `_grantRole(DEFAULT_ADMIN_ROLE, _kernel)` at line 79
- `grep '_setRoleAdmin' contracts/oracles/API3Oracle.sol` → no custom admin override
- Explicit note that DEFAULT_ADMIN_ROLE holder can call inherited `grantRole` for any role

**Policy added:** "ROLE is restricted to named operators" evidence requirement now mandates three greps: (1) constructor `_grantRole` calls, (2) `_setRoleAdmin` overrides, (3) `DEFAULT_ADMIN_ROLE` holders — with all three results documented.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 3 Evidence Table — `"ROLE is restricted to named operators"` row (updated in PR #89).

**Future prevention mechanism:** Before claiming a role is restricted, always check the full AccessControl grant hierarchy: constructor grants, role admin overrides, and DEFAULT_ADMIN_ROLE holder. Never rely on absence of a custom public function alone.

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** Fix committed in PR #89. The policy was wrong in PR #88 and corrected in the same session after Codex challenge. This is precisely the class of error the preflight standard was designed to prevent — but the preflight standard itself was written without running the grep.

---

## LL-004

**Date:** 2026-06-17
**PR:** #88
**Reviewer:** Self (post-merge analysis)
**Finding:** The PR Preflight Standard was written without applying the standard to itself. A policy document that says "verify before claim, not after challenge" was written with a claim (constructor-only role proof) that was not verified before publication.

**Root Cause:** Governance documents are treated as "just documentation" and not subjected to the same grep-evidence discipline as code or audit reports. This is a category error — governance documents that contain evidence requirements must themselves satisfy those requirements.

**Why the reviewer was able to raise the issue:** The AccessControl DEFAULT_ADMIN_ROLE gap (LL-003) only appeared because the policy was not self-applied. If the policy had been applied while writing the policy, the `grep 'DEFAULT_ADMIN_ROLE'` step would have caught the gap before merge.

**Evidence that was missing:** Self-Codex-Review was not performed on the governance document before push.

**Policy added:** Self-Codex-Review applies to all documents including governance documents. No category exemption exists.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 6 Self-Codex-Review — applies universally, no exemption for governance or policy documents.

**Future prevention mechanism:** Before pushing any CLAUDE.md, docs/governance/, docs/reports/, or docs/oracle/ change, apply the same preflight (grep evidence, forbidden wording scan, self-Codex-review) as for a code PR. Governance documents are not exempt.

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** This is a meta-lesson: the first PR containing the preflight standard immediately violated it. The correct response is to add a universal scope clause — no document type is exempt from evidence requirements.

---

## LL-005

**Date:** 2026-06-17
**PR:** #86, #87
**Reviewer:** chatgpt-codex-connector[bot]
**Finding:** "Stale-reserve replay case" — a feeder can refresh `PAH_USD_KEY` (satisfying Gate A) and still submit an old `newReserves` value, because `syncReserves(uint256 newReserves)` carries no timestamp or provenance for the reserve value. The claim was that GAP-MEX-04 closure missed this.

**Root Cause:** The GAP-MEX-04 closure documentation did not distinguish between (a) oracle liveness (what the two-gate barrier addresses) and (b) reserve value provenance (what it explicitly does not address). The omission of a named residual made the closure look broader than it was.

**Why the reviewer was able to raise the issue:** "CLOSED" without scope qualifier implies completeness. The stale-reserve scenario is real and was not documented as a known limitation.

**Evidence that was missing:** Explicit scope statement for GAP-MEX-04 ("oracle liveness only, not reserve value provenance"); named residual (K-RES-01) with classification rationale and 5-criterion evaluation.

**Policy added:** Gap closures must name their scope precisely. Any concern outside the scope must be named and classified (HARDENING_ONLY, DOCUMENTATION_REQUIRED, etc.) in the same closure document.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 5 Forbidden Wording — `"CLOSED"` requires scope + residuals. `### Red-Team Finding Classification Standard` — every finding must complete the 5-criterion table.

**Future prevention mechanism:** When closing any gap, enumerate: (1) what is addressed by the implementation, (2) what related concerns exist that are outside scope, (3) why each out-of-scope concern is HARDENING_ONLY or lower. This prevents any "you missed X" challenge from succeeding unless X is genuinely new.

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** K-RES-01 was created as a direct result of this lesson. All five BLOCKER_P1 criteria were evaluated and documented for the stale-reserve scenario. Finding classified HARDENING_ONLY with reasoning in PR #86 comment and PR #87 documentation.

---

## LL-006

**Date:** 2026-06-17
**PR:** #87
**Reviewer:** Self (operational)
**Finding:** PR #87 was pushed with `mergeable_state: dirty` because the branch was not rebased before push. Required a force-push rebase cycle after the PR was already open.

**Root Cause:** No rebase step was performed between the previous merge (PR #86 to main) and the push of the new branch. The branch diverged silently.

**Why the reviewer was able to raise the issue:** GitHub showed `mergeable_state: dirty`; the merge button was blocked. This was caught by a direct API status check, not by a reviewer challenge, but represents the same class of preventable process failure.

**Evidence that was missing:** A `git fetch origin main && git rebase origin/main` step before push.

**Policy added:** Rebase before push is now Step 1 of the PR Preflight Standard — mandatory before every push, not just when a conflict is suspected.

**CLAUDE.md reference:** `### PR Preflight Standard` → Step 1 Rebase.

**Future prevention mechanism:** Always run `git fetch origin main && git rebase origin/main` before push. If rebase produces conflicts, resolve before pushing. Never push a branch that has not been rebased on the current main.

**Status:** Prevented

**Repeat allowed?** NO

**Notes:** This is a pure process discipline issue, not a code or documentation quality issue. The fix is mechanical: Step 1 of the preflight is non-negotiable.

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
*Branch: claude/codex-adversarial-review-fyu0nb*
*Initial entries: LL-001 through LL-006*
