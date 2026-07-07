# Changelog

All notable changes to IranOS are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

> **Non-claim notice:** Entries in this changelog do not claim production readiness, release approval, completed external audit, or completed formal verification. Roadmap Step-12 and Step-13 (`docs/IRAN_OS_ROADMAP.md`) remain open — distinct from `CLAUDE.md`'s PR Preflight Standard `Step 12`/`Step 13`, a different numbering scheme; see `CLAUDE.md` → `## Canonical Development Workflow (Mandatory)` naming note.

---

## [Unreleased]

### Added — Governance: Canonical Checkpoint SSOT hardening (permanent rule, Step 13, LL-029)
- `CLAUDE.md` — new `#### Step 13 — Canonical Checkpoint Currency` added to `### PR Preflight Standard (Mandatory)`: every merge to `main` must update `docs/governance/CANONICAL_CHECKPOINT.md` in the same PR (no deferral); a PR is not READY until the checkpoint reflects the merged state. Includes a required Evidence Block and a disclosed, non-fabricating resolution for the squash-merge commit-SHA-not-known-before-merge problem. `## Canonical Development Workflow (Mandatory)` Stage 1/Stage 11 updated to reference Step 13 and the full 12-field minimum; Conflict rule extended to cover conflicts with the checkpoint's recorded state; new Single Source of Truth rule added
- `docs/governance/CANONICAL_CHECKPOINT.md` — rewritten with a Summary table covering all twelve required minimum fields (previously eight; added current production status, applicable governance version, latest Lesson Learned ID, and an explicit last-updated timestamp), plus an explicit "Single Source of Truth Policy" section
- `docs/governance/REVIEWER_LESSONS_LEARNED.md` — added `LL-029`; Maintenance Rule updated "Steps 1–12" → "Steps 1–13"; footer updated to "LL-001 through LL-029"
- `.github/pull_request_template.md` — new Step 13 checklist line and Evidence Block sub-block
- This non-claim notice above was also corrected: "Step 12 and Step 13 remain open" was ambiguous now that `CLAUDE.md` has its own Step 12/13 — reworded to specify it refers to the roadmap's `Step-N` phases, distinct from the PR Preflight Standard's `Step N`
- Governance-registry and documentation changes only; no changes to `contracts/`, `deploy/*.js`, or test behavior. 759 passing (unchanged)

### Added — Governance: Canonical Development Workflow + Canonical Checkpoint (permanent rule, LL-028)
- `CLAUDE.md` — new `## Canonical Development Workflow (Mandatory)` section (placed between `## Violation Codes` and `## Development Conventions`), declaring the engineering framework immutable unless explicitly authorized and defining an 11-stage mandatory sequence (Canonical Checkpoint → Applicable Lesson Learned Registry → Engineering protocol/roadmap → Implementation → CI → Codex Review → Resolve findings → Hostile Adversarial Review → Production Readiness Review → Deployment-Parity Review → Merge). Uses the label "Stage" (not "Step") to avoid colliding with the roadmap's `Step-N` phases or the PR Preflight Standard's `Step N` checklist, both of which are unchanged. Each stage maps onto existing CLAUDE.md concepts without renaming, relocating, or weakening any of them — the Pre-Implementation Red-Team Pass stays pre-implementation, Step 6 Self-Codex-Review stays the internal pre-push check, and the three deployment-parity checks (Deployment-Path Parity / Step 9 / Step 11) remain distinct per LL-026
- `docs/governance/CANONICAL_CHECKPOINT.md` (new) — the sole authoritative project-state snapshot: current merged baseline, latest merged PR, latest commit, roadmap position, deployment coverage, test count, remaining work, and open residuals, with its own verification method and staleness/maintenance rule
- `docs/governance/REVIEWER_LESSONS_LEARNED.md` — added `LL-028` documenting this policy elevation; footer updated to "LL-001 through LL-028"
- `.github/pull_request_template.md` — new checklist line under `## Governance Preflight Synchronization` confirming the Canonical Checkpoint and applicable LL entries were loaded before implementation began
- Ambiguities in the directive's terminology (potential collisions with existing `Step-N`/`Step N` numbering, `Self-Codex-Review`, the Pre-Implementation Red-Team Pass, and the three existing deployment-parity checks) were resolved with the repository owner via explicit clarifying questions before implementation, per the directive's own "stop and report the conflict instead of proceeding" instruction — rather than guessed on a framework declared permanent. Governance-registry changes only; no changes to `contracts/`, `deploy/*.js`, or test behavior. 759 passing (unchanged)

### Added — Governance: Step 12 Lesson-Learned Compliance Consultation (permanent rule, LL-027)
- `CLAUDE.md` — new `#### Step 12 — Lesson-Learned Compliance Consultation` added to `### PR Preflight Standard (Mandatory)`. Requires reading `docs/governance/REVIEWER_LESSONS_LEARNED.md` and identifying applicable LL entries before implementation begins, applying their policies during implementation, and re-verifying compliance immediately before a PR is marked ready, with a required Evidence Block sub-block naming the applicable LL IDs. The `### Reviewer Lessons Learned Registry (Mandatory)` section now states explicitly that the registry is a mandatory engineering specification with the same authority as the PR Preflight Standard — not documentation only
- `docs/governance/REVIEWER_LESSONS_LEARNED.md` — added `LL-027` documenting this policy elevation itself (a direct repository-owner instruction, not a Codex finding); Maintenance Rule's preflight-checklist reference updated "Steps 1–11" → "Steps 1–12"; footer updated to "LL-001 through LL-027"
- `.github/pull_request_template.md` — new Step 12 checklist line under `## Governance Preflight Synchronization` and a matching `Step 12 — Lesson-Learned Compliance` sub-block in the `### Evidence Block` template
- Raised because the registry's only enforced touchpoint was entry *creation*, not entry *consultation* — nothing previously required a contributor to read or apply existing LL entries before implementing or before marking a PR ready. Governance-registry changes only; no changes to `contracts/`, `deploy/*.js`, or test behavior. 759 passing (unchanged)

### Added — Governance: Step 11 Documentation-Parity Review (permanent rule, LL-026)
- `CLAUDE.md` — new `#### Step 11 — Documentation-Parity Review` added to `### PR Preflight Standard (Mandatory)`. Any PR modifying ownership, `DEFAULT_ADMIN_ROLE`, access control, `grantRole()`, constructor parameters, deployment authority, runtime authority, governance authority, deployment sequence, or deployment wiring must, in the same PR, update all affected deployment manifests, deployment protocols, runbooks, operator guides, role wiring documentation, and deployment checklists. Explicitly distinguished from Step 9 (Step 9 checks role/contract-name string presence; Step 11 checks that the caller/authority described alongside that name still matches current code). Includes a grep-based verification method, a required Evidence Block sub-template, and an omission rule equivalent in severity to Step 1/Step 2
- `docs/governance/REVIEWER_LESSONS_LEARNED.md` — added `LL-026`, citing the Codex finding on PR #120 (`https://github.com/fafa33/Iran-OS/pull/120#discussion_r3532524130`) that exposed this gap; Maintenance Rule's preflight-checklist reference updated from "Steps 1–10" to "Steps 1–11"; footer updated to "LL-001 through LL-026"
- `.github/pull_request_template.md` — new `## Documentation-Parity Review` section (mirrors the existing `## Deployment-Path Parity` structure), a new checklist line under `## Governance Preflight Synchronization`, and a new `Step 11 — Documentation-Parity Review` sub-block in the `### Evidence Block` template
- Raised in response to a Codex finding on PR #120: the underlying documentation defect (stale `PriceOracle` `FEEDER_ROLE` caller) was already fixed (see entry below); this entry adds the permanent, mandatory workflow rule so the same class of defect — an authority-model change landing without a matching update to every document naming its caller — cannot recur undetected. Documentation and governance-registry changes only; no changes to `contracts/`, `deploy/*.js`, or test behavior. 759 passing (unchanged)

### Fixed — Codex post-merge finding on PR #120 (stale FEEDER_ROLE runbook caller)
- `docs/deployment/ROLE_WIRING_CHECKLIST.md` — §ز's mandatory feeder-grant table still named `kernel` as the caller for `PriceOracle`'s `FEEDER_ROLE` grant (line 187, pre-fix), unchanged since before PR #120's constructor fix. Since `PriceOracle`'s `DEFAULT_ADMIN_ROLE` now belongs to `SOVEREIGN_ADDRESS`, not `KERNEL_ADDRESS`, an operator following that row would have `kernel.grantRole(...)` revert (Kernel holds no admin role on `PriceOracle`), leaving `submitPrice()` unusable with no documented alternative. Confirmed valid — the exact caller named in the table was stale. Fixed: caller column now reads `sovereign (SOVEREIGN_ADDRESS)` for `PriceOracle`, with an inline note explaining why. `ProductionOracle`'s row is unchanged (still correctly names `kernel`) — it remains undeployed and its constructor is genuinely unmodified (`constructor(kernel)`, confirmed by reading `contracts/oracles/ProductionOracle.sol`), so no fix was needed or applied there
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` (v1.3.3, same version — documentation correction only) — §4 Group E step 3 and §6 step 4 both showed `priceOracle.grantRole(FEEDER_ROLE, PRICE_FEEDER)` without naming a caller, in a context describing these as oracles with "simple constructors" — no longer true for `PriceOracle` since its v1.3.3 constructor split. Both pseudocode blocks now explicitly show `sovereign اجرا کند:` (sovereign executes) for `PriceOracle`'s grant, with an inline note that `kernel` holds no admin role on it and would revert; `ProductionOracle`'s line is unchanged and separately annotated as still-kernel-callable since it remains undeployed
- Validated via repo-wide grep (`PriceOracle`, `FEEDER_ROLE`, `kernel`, `SOVEREIGN_ADDRESS`, `grantRole` across `docs/deployment/`) — no remaining instruction names `kernel` as the caller for `PriceOracle`'s `FEEDER_ROLE` grant. Also checked other `docs/` files referencing `PriceOracle` (step reports, whitepaper mappings) for the same stale-instruction pattern — none found; out of scope for this fix regardless, per task constraints
- Documentation only. No changes to `contracts/`, `deploy/*.js`, monetary behavior, or deployment coverage (remains 12/25). 759 passing (unchanged — no test-affecting change)

### Added — Deployment coverage 12/25: PriceOracle
- `contracts/oracles/PriceOracle.sol` — constructor changed from `constructor(address _kernel)` to `constructor(address _admin, address _kernel)`, granting `DEFAULT_ADMIN_ROLE` to `_admin` and `KERNEL_ROLE` to `_kernel` — applying the same fix already established for `VictimFund`/`ConstitutionGuard`/`JurySelection`/`JusticeProtocol`/`CitizenCard` (see "P0 deployment-path parity" above) proactively, before deployment coverage was added, rather than as a retrofit. Deploying with `KERNEL_ADDRESS` as the sole admin (the manifest's pre-existing documented signature) would have reproduced the identical defect: `contracts/kernel.sol` has no call-forwarding mechanism to `PriceOracle`, so `invalidatePrice()` (`onlyRole(KERNEL_ROLE)`) and `submitPrice()` (`onlyRole(FEEDER_ROLE)`, never granted in the constructor) would have been permanently unreachable — confirmed by the same grep evidence and reasoning as the earlier finding. No change to `submitPrice`/`invalidatePrice`/`_updateAggregatedPrice` logic, staleness threshold, deviation threshold, or any oracle policy
- `deploy/15_price_oracle.js` — new deploy script, `PriceOracle(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)`, matching `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` §3 step 10. `FEEDER_ROLE` is deliberately NOT granted by this script — the manifest's §9 Group 3 check depends on a `PRICE_FEEDER` address book variable not listed in §1's table (the same reason `ProductionOracle` remains excluded); granting `FEEDER_ROLE` to a real feeder is left as a documented post-deploy step via `SOVEREIGN_ADDRESS`'s `DEFAULT_ADMIN_ROLE`, once chosen
- `deploy/index.js` — wired `deployPriceOracle` into `runDeployment()` (after `citizen_card`, before `token`); extended `CORE_ADDRESS_KEYS` to include `PRICE_ORACLE_ADDRESS`
- `deploy/09_verify.js` — added `priceOracle` to the `DEFAULT_ADMIN_ROLE`/`KERNEL_ROLE` constructor-invariant check loop
- `test/23_Price_Oracle.test.js` — updated constructor/grantRole call sites for the new `(admin, kernel)` signature (`invalidatePrice`'s `KERNEL_ROLE` check is unaffected and unchanged)
- `test/25_Step7_Stress.test.js`, `test/26_Step7_PolicyLayer.test.js` — updated 7 `PriceOracle.deploy(kernel.address)` call sites (found via repo-wide grep, not part of the deployment-coverage test suite) to `deploy(kernel.address, kernel.address)`, preserving their existing behavior exactly (these tests use `PriceOracle` only as a supporting fixture and don't exercise the admin/kernel distinction)
- `test/32_deployment_workflow.test.js` — added a dedicated test proving `PriceOracle` deploys successfully, has a non-zero address, does not alter monetary runtime state (deploys a second `PriceOracle` instance directly and confirms `PahlaviToken.totalReserves()`/`SovereignWealthFund.totalAssets()`/`Treasury.totalBudgetAllocated()` are bit-for-bit unchanged), and that all existing deployment invariants (§9 checks) remain intact; updated the incremental-persistence tests' step count (11 → 12) and expected key sets; extended the exports-shape test. 759 passing (up from 758)
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` (v1.3.2 → v1.3.3), `docs/deployment/ROLE_WIRING_CHECKLIST.md` (v1.6 → v1.7), `deploy/README.md` — updated coverage figures (11/25 → 12/25; 14 remaining → 13 remaining), constructor-argument documentation, dependency map, deploy-order step 10, and actual-status file listing
- Verified live on a persistent Hardhat node: full orchestrated deployment (36/36 post-deploy checks passed), followed by Sovereign granting `FEEDER_ROLE` to a real address and that address successfully calling `submitPrice()` — the exact operation that would have been permanently dead under the manifest's pre-existing single-argument constructor documentation
- No changes to `contracts/monetary/`, `contracts/kernel.sol`, or any governance/protocol contract. No oracle policy changes beyond the constructor admin-role binding already established as precedent

### Fixed — Codex review finding on PR #119 (address checksum comparison)
- `deploy/09_verify.js` — the new `constitutionGuard.admin() === SOVEREIGN_ADDRESS` check compared `admin()`'s return value (always checksummed by ethers) against `config.sovereignAddress`, a raw, unnormalized string from `process.env.SOVEREIGN_ADDRESS` (`deploy/config.js` does no normalization). A syntactically-valid, on-chain-correct deployment using a lower-case `SOVEREIGN_ADDRESS` would therefore fail verification with no actual on-chain problem — confirmed by reproduction (`ethers.getAddress()` on a lower-cased address never strict-equals the lower-case input). Fixed by normalizing `config.sovereignAddress` through `ethers.getAddress()` before comparing. `test/32_deployment_workflow.test.js` — added a regression test that deploys with an all-lower-case `SOVEREIGN_ADDRESS` and confirms `runDeployment()`'s own `verifyDeployment()` call passes; confirmed the test fails without the fix (reverted locally to verify) and passes with it. Also confirmed live on a persistent Hardhat node. No other instance of this comparison pattern exists elsewhere in `deploy/*.js` (`kernel.hasRole(...)` calls take addresses as ABI-encoded parameters, not string comparisons, so casing does not affect them). 758 passing (up from 757)

### Fixed — P0 deployment-path parity: Layer 1 contracts unreachable via Kernel-only admin
- `contracts/reclaim/VictimFund.sol`, `contracts/justice/JurySelection.sol`, `contracts/justice/JusticeProtocol.sol`, `contracts/welfare/CitizenCard.sol` — a hostile architecture review found these 4 contracts (deployed in the batch-2 PR above) granted `DEFAULT_ADMIN_ROLE` solely to `KERNEL_ADDRESS`. Confirmed valid by full grep of `contracts/kernel.sol`: it has zero references to any of these 5 contracts and no generic call-forwarding/`delegatecall` mechanism anywhere — its only outbound call to another contract is a single hardcoded `ITriggerProtocol.executeTrigger()` invocation, unrelated to this batch. This meant the Kernel contract could never call `grantRole()` on them, permanently blocking every role-gated operation (`registerVictim`, `selectJury`, `approveJudge`, `registerEmployer`/`deactivateCard`, and any role COURT_ROLE/COUNCIL_ROLE/PENAL_LABOR_ROLE/VRF_ROLE/ISSUER_ROLE/HEALTH_ROLE/WELFARE_ROLE-gated, none of which were granted in these constructors either) with no workaround — existing unit tests masked this by substituting a plain EOA for `kernel`, the same failure class as GAP-MEX-05. Classified **P0**: unconditional, 100% loss of privileged operational surface across the whole batch, no workaround, would require redeploying all 5 contracts to recover post-launch (no upgradeable proxies permitted). Fixed by adding a second constructor argument `_admin`, granting `DEFAULT_ADMIN_ROLE` to it instead of `_kernel` — mirroring `SovereignWealthFund.sol`'s already-established `constructor(sovereign, kernel)` split exactly. `KERNEL_ROLE` continues to be granted to `_kernel`, unchanged, recording the Kernel contract's identity without relying on it to originate a transaction
- `contracts/core/ConstitutionGuard.sol` — same finding for `approveLaw`/`rejectLaw` (`onlyKernel`, `require(msg.sender == kernel)`), permanently unreachable for the same reason. Fixed additively: added a second constructor argument `_admin` (stored as new public `admin`), and `onlyKernel` now accepts `msg.sender == kernel || msg.sender == admin` — the original `kernel` check is unchanged, not replaced
- `deploy/10_victim_fund.js`, `deploy/11_constitution_guard.js`, `deploy/12_jury_selection.js`, `deploy/13_justice_protocol.js`, `deploy/14_citizen_card.js` — updated to deploy with `(config.sovereignAddress, kernelAddress)`; `deploy/index.js` updated to pass `config` through to these 5 calls
- `deploy/09_verify.js` — checks now confirm `DEFAULT_ADMIN_ROLE` is held by `SOVEREIGN_ADDRESS` (not `KERNEL_ADDRESS`) on the 4 AccessControl contracts, and `ConstitutionGuard.admin() === SOVEREIGN_ADDRESS`
- `test/04_constitution_guard.test.js`, `test/05_citizen_card.test.js`, `test/07_jury_selection.test.js`, `test/19_Justice_Protocol.test.js`, `test/21_Victim_Fund.test.js` — updated constructor/role-grant call sites for the new `(admin, kernel)` signature; added 2 new tests exercising `ConstitutionGuard`'s new `admin` path
- `test/32_deployment_workflow.test.js` — added a "Layer 1 contract deployment-path parity" block (5 new tests) proving the fix end-to-end using the actual deployed Kernel contract address (not an EOA standing in for it) and the real Sovereign signer: granting operational roles and calling the previously-permanently-unreachable functions all succeed. Corrected the existing constructor-role test's assumption (`DEFAULT_ADMIN_ROLE` is now on Sovereign, not Kernel). 757 passing (up from 749)
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` (v1.3.1 → v1.3.2) — updated constructor argument documentation for all 5 contracts throughout (dependency map, deploy-order steps 4/6/7/8/9, actual-status file listing) and added a dated fix note
- `deploy/README.md` — added a "Layer 1 admin binding" section documenting the finding and fix; corrected a stale "6 core-monetary-path addresses" reference in the overwrite-guard description to the current 11
- No changes to `contracts/monetary/`, `contracts/kernel.sol`, or any governance/protocol contract — only the admin-role binding in these 5 non-monetary contracts. No new Kernel `execute`/`delegatecall` function added; no Kernel upgradeability introduced

### Added — Deployment coverage batch 2 (5 Layer 1 constructor-only contracts)
- `deploy/10_victim_fund.js`, `deploy/11_constitution_guard.js`, `deploy/12_jury_selection.js`, `deploy/13_justice_protocol.js`, `deploy/14_citizen_card.js` — executable deploy scripts for `VictimFund`, `ConstitutionGuard`, `JurySelection`, `JusticeProtocol`, and `CitizenCard`, matching `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` §3 Stage 2 (Layer 1). All five contracts depend only on `KERNEL_ADDRESS` at construction (confirmed by grep of each contract's constructor) and have no further post-deploy role-wiring documented in §4-§7. Deployment coverage: 6/25 → 11/25 contracts. `PriceOracle`/`ProductionOracle` were deliberately excluded from this batch — their documented `FEEDER_ROLE` wiring (§4 Group E, §9 Group 3) depends on `PRICE_FEEDER`/`PROD_FEEDER` address book variables not listed in §1, and adding them without that documentation would invent an undocumented configuration surface rather than implement what is specified
- `deploy/index.js` — wired the 5 new deploy calls into `runDeployment()` (order-independent within Layer 1, placed after `swf` and before `token`); extended `CORE_ADDRESS_KEYS` (the overwrite-guard's tracked key set) to include the 5 new addresses
- `deploy/09_verify.js` — added checks confirming each new AccessControl-based contract grants `DEFAULT_ADMIN_ROLE`/`KERNEL_ROLE` to `KERNEL_ADDRESS` (the constructor-guaranteed invariant), and that `ConstitutionGuard.kernel() === KERNEL_ADDRESS`
- `deploy/README.md`, `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` (v1.3.0 → v1.3.1), `docs/deployment/ROLE_WIRING_CHECKLIST.md` (v1.5 → v1.6) — updated deployment coverage figures (6/25 → 11/25; 19 remaining → 14 remaining) and the actual-vs-planned `deploy/` file listing across all three documents
- `test/32_deployment_workflow.test.js` — added a test verifying the 5 new contracts deploy with the documented constructor-granted roles, updated the incremental-persistence tests' step count (6 → 11) and expected key sets, extended the exports-shape test; 749 passing (up from 748)
- No Solidity, protocol, governance, monetary, or threshold changes. No redesign of existing deployment architecture, order, or incremental persistence

### Fixed — Codex review finding on PR #116 (guard/deployment ordering)
- `deploy/03_recognized_backing.js` — the `ACKNOWLEDGE_RESERVE_RESET` reserve-reset guard read `registry.recognizedBackingTotal()` from a `RecognizedReserveBacking` instance already deployed a few lines earlier, so a blocked (rejected) call still deployed and orphaned a live, unrecorded registry contract — confirmed valid: `RecognizedReserveBacking.sol`'s constructor (lines 64-72) never sets `recognizedBackingTotal` (it stays at its default `0`); only `recordIdentity()` (line 117), gated by `RECOGNIZER_ROLE`, can increase it, and that role cannot be exercised before the contract exists — so a freshly-deployed registry's `recognizedBackingTotal()` is deterministically `0` and the guard never needed to read it from a live contract. Moved the guard to evaluate `PahlaviToken.totalReserves()` alone, before `RecognizedReserveBacking` is deployed; a rejection now leaves no on-chain registry contract at all. No change to the guard's trigger condition, message content (`Reserve reset blocked`/`ACKNOWLEDGE_RESERVE_RESET` regexes preserved), deployment order, or incremental persistence. No Solidity, protocol, governance, or monetary changes
- `deploy/README.md` — "Nonzero INITIAL_RESERVES" section now states the guard is evaluated before the registry is deployed
- `test/32_deployment_workflow.test.js` — added a regression test asserting the deployer signer's transaction count is unchanged when the guard rejects (proving no `RecognizedReserveBacking` deployment transaction was ever sent); 748 passing (up from 747)

### Added
- `CONTRIBUTING.md` — English contributor onboarding (PR #47)
- `CHANGELOG.md` — this file (PR #47)

### Fixed — Deployment-Path and Documentation Alignment
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` — added `RecognizedReserveBacking` to the constructor dependency map and deployment order (previously absent despite being the sole production reserve-mutation path since PR #110); added missing `kernel.setPahlaviToken()` deployment step (a GAP-MEX-05 recurrence — the post-deploy checklist verified this invariant but no step instructed performing it); clarified that `Kernel.syncReserves`/`PahlaviToken.updateReserves` are telemetry-only post PR #113; updated stale test count 693→726
- `docs/deployment/ROLE_WIRING_CHECKLIST.md` — added sections ح (`kernel.setPahlaviToken()`) and ط (`RecognizedReserveBacking` deployment and wiring) with post-deploy verification checks
- `docs/governance/OPEN_RESIDUALS.md` — re-evaluated K-RES-01 per Trigger 11 (fired by PR #113); reclassified `Active` → `Superseded` with full 5-criterion table and grep evidence; original attack mechanism (`updateReserves` mutating `totalReserves`) no longer exists in current code

### Added — Executable Deployment Scripts (core monetary/reserve path)
- `deploy/01_kernel.js` through `deploy/09_verify.js`, `deploy/index.js`, `deploy/config.js`, `deploy/lib/addressBook.js`, `deploy/README.md` — Hardhat deployment scripts implementing the sequence already documented in `DEPLOYMENT_MANIFEST_PROTOCOL.md` §3/§4 for the six core monetary/reserve contracts (`IranOS_Kernel`, `Treasury`, `SovereignWealthFund`, `PahlaviToken`, `API3Oracle`, `RecognizedReserveBacking`). No protocol contract, governance, monetary policy, reserve accounting, or threshold changes. Each script is independently runnable (matching the manifest's operator-checklist style) and also composable via `deploy/index.js` in dependency-correct order. The remaining 19 contracts (welfare, justice, governance, reclaim, `TriggerProtocol`, `AssetFreeze`) are not covered — remains an open G-11 item
- `test/32_deployment_workflow.test.js` — exercises the deploy scripts end-to-end against a Hardhat network, verifying all applicable §9 post-deploy checks
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` (v1.2.0 → v1.3.0), `docs/deployment/ROLE_WIRING_CHECKLIST.md` (v1.4 → v1.5) — corrected "no deploy/ scripts exist" claims to reflect the 6/25-contract implementation; documentary coverage (25/25) is explicitly distinguished from executable script coverage (6/25); `STEP9-BLOCK-005` remains OPEN/PENDING

### Fixed — Deployment script self-review findings
- `deploy/08_finalize.js` — added a guard verifying all 9 `COURT_ROLE` members are active before granting `ORACLE_ROLE`; without it, running `08_finalize.js` before `07_roles.js` (both independently runnable, as documented) could leave the 7-of-9 trigger threshold unreachable if a feeder flags a violation before court completion — the exact failure scenario `COURT_ROLE_ASSIGNMENT_PROTOCOL.md` §4 documents as having no return path
- `deploy/09_verify.js` — added a check that the 9 configured court addresses are pairwise distinct, catching a copy-paste misconfiguration that would otherwise silently pass verification with fewer than 9 independent signers
- `deploy/README.md` — fixed a garbled execution-order fragment that didn't match `deploy/index.js`'s actual (correct) dependency order
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` — qualified an unchanged v1.1.0-era absolute claim ("no `deploy/` scripts exist") that stood uncorrected next to its own v1.3.0 contradiction; reordered the v1.3.0 scope note to appear after v1.2.0's, restoring chronological reading order
- `test/32_deployment_workflow.test.js` — added 3 tests covering the above two guards plus a module-exports shape check for all 9 scripts and `index.js`

### Fixed — Validated Codex review findings on PR #115
- `deploy/03_recognized_backing.js`, `deploy/config.js` — `kernel.setPahlaviRecognizedReserveBacking()` atomically replaces `PahlaviToken.totalReserves` with a freshly-deployed (empty) registry's `recognizedBackingTotal()` (`0`). If `INITIAL_RESERVES` was set nonzero, running the deploy workflow would reset it to `0` in the same automated run with no `recordIdentity()` step in between. `03_recognized_backing.js` now blocks this and requires `ACKNOWLEDGE_RESERVE_RESET=true` to proceed — confirmed valid (reachable, no existing guard); not a protocol bug — `syncRecognizedBackingTotal()`'s replace-not-add behavior is intentional and already tested elsewhere; this is a deployment-tooling safeguard only, no contract or reserve-accounting change
- `deploy/08_finalize.js` — the existing court-completion guard (added in the prior self-review fix) checked `hasRole` per configured address but did not reject duplicates; a duplicate `COURT_N` address would pass unnoticed and Oracle could still activate with fewer than 9 distinct signers, with the duplicate only caught afterward by `09_verify.js` — confirmed valid; moved the pairwise-distinctness check into `08_finalize.js` so Oracle activation is blocked before it happens, not just reported after
- `deploy/index.js` — `runDeployment()` only persisted the address book once, after every step succeeded; a mid-run failure (network error, a guard throwing, gas exhaustion) lost the record of contracts already deployed on-chain — confirmed valid; added an optional `persistStep` callback invoked after each successful deployment step, wired to `saveAddresses()` in the CLI entry point; `runDeployment()`'s default no-op callback preserves existing test behavior exactly
- `deploy/README.md` — documented `ACKNOWLEDGE_RESERVE_RESET`, the duplicate-court rejection point, and mid-run persistence/recovery behavior
- `test/32_deployment_workflow.test.js` — added 6 new tests (reserve-reset guard blocked/acknowledged/not-triggered-at-zero; incremental persistence on success and on mid-run failure) and restructured the duplicate-court test to match the new rejection point in `08_finalize.js`, adding a defense-in-depth test for `09_verify.js`'s independent check

### Fixed — Hostile adversarial review findings on PR #116
- `deploy/index.js` — the orchestrated CLI entry point (`npx hardhat run deploy/index.js`) never checked for an existing deployment before starting, and its `persistStep`/`saveAddresses` calls unconditionally overwrite `deploy/deployments/<network>.json`; re-running it after a completed (or partially-completed) prior run silently overwrote the address book and orphaned the previously-deployed, still-live contracts with no on-disk record left pointing at them — confirmed valid, reproduced live against a persistent Hardhat node (original contracts remained deployed on-chain per `provider.getCode()` after a second run replaced the file with 6 new addresses). Added `assertNoExistingDeployment()`, called before `runDeployment()` in the CLI entry point only: it throws immediately, listing which of the 6 core-path keys already exist and directing the operator to continue via the individual scripts or intentionally clear the file first. No auto-resume, no overwrite, no change to `runDeployment()`'s signature, existing deployment order, or incremental-persistence behavior — the individual per-contract scripts are unaffected and continue to read/update the file directly as designed
- `deploy/03_recognized_backing.js`, `deploy/README.md` — the reserve-reset guard's error message and the README's "Nonzero INITIAL_RESERVES" section both suggested recording matching identities via `RecognizedReserveBacking.recordIdentity()` "before wiring"/"before running this script" as an alternative to `ACKNOWLEDGE_RESERVE_RESET=true` — confirmed invalid advice: this script deploys the registry and performs the atomic wiring in the same function call, so no point in the workflow exists at which the registry is deployed but not yet wired, meaning `recordIdentity()` can never run "before" this script's wiring step. Reworded both to state `ACKNOWLEDGE_RESERVE_RESET=true` is the only way to proceed past the guard in the current workflow, and that preserving the balance as recognized identities is only possible as a separate, later operation after this script has already run and reset reserves to `0`. No change to deployment architecture or the atomic wiring behavior itself; the existing `Reserve reset blocked`/`ACKNOWLEDGE_RESERVE_RESET` message-content tests continue to pass unchanged
- `test/32_deployment_workflow.test.js` — added 4 new tests for `assertNoExistingDeployment()` (throws listing the single/multiple existing core-path keys present; does not throw on an empty or unrelated-keys address book) and extended the exports-shape test to cover the new export; 747 passing (up from 743)

---

## [0.3.0] — ۱۳ خرداد ۲۵۸۵ شاهنشاهی / 3 June 2026

### Added — Reviewer Onboarding
- English block in `README.md` with non-claim summary and reviewer links (PR #45)
- `docs/step13/STEP13_REVIEWER_INDEX_EN.md` — English entry point for external reviewers (PR #45)
- `.github/ISSUE_TEMPLATE/bug_report.yml` — bug report template with non-claim checkbox (PR #46)
- `.github/ISSUE_TEMPLATE/feature_request.yml` — feature request template with charter impact field (PR #46)
- `.github/ISSUE_TEMPLATE/external_review.yml` — external review submission template linked to Issue #35 (PR #46)
- `.github/pull_request_template.md` — default PR template with doctrine and charter impact checklist (PR #46)

### Changed
- Date format standardized across all Persian documents: Solar Hijri → `۲۵۸۵ شاهنشاهی / ۲۰۲۶ میلادی` with day/month (PR #41)

---

## [0.2.0] — ۱۳ خرداد ۲۵۸۵ شاهنشاهی / 3 June 2026

### Added — Step 13 Remediation Documentation
- `docs/step13/G03_ZK_FINAL_DEFER_DECISION_FA.md` — recorded architectural decision: G-03 ZK verifier deferred (PR #44)
- `docs/step13/STEP13_FINAL_STATUS_REPORT_FA.md` — consolidated Step 13 status report (PR #43)
- `docs/step13/STEP13_REMEDIATION_CHECKPOINT_FA.md` — detailed remediation checkpoint (PR #42)
- `docs/oracle/AIRNODE_INTEGRATION_PROTOCOL.md` — G-02 Airnode RRP integration protocol (PR #40)
- `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` — G-11 deployment manifest with 16-contract order and role wiring groups A–E (PR #39)
- `docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md` — COURT-01 deployment sequencing protocol with notLocked constraint (PR #38)

### Changed
- `docs/step13/STEP13_REAL_GAP_DISPOSITION_FA.md` — updated to v1.2.0 with G-02, G-03 decisions and checkpoint link
- `docs/deployment/ROLE_WIRING_CHECKLIST.md` — updated to v1.3 with G-11 and COURT-01 sections

---

## [0.1.1] — ۱۳ خرداد ۲۵۸۵ شاهنشاهی / 3 June 2026

### Added — TG-01 Treasury Auto-Block
- `ITreasury` interface added to `TriggerProtocol.sol` (PR #36)
- `blockAddressByTrigger(offender)` call added to `executeTrigger()` terminal path (PR #36)
- `docs/step13/TG01_TREASURY_AUTOBLOCK_PLAN_FA.md` — implementation plan and post-merge checkpoint

### Changed
- Test count: 487 → 499 passing

### Notes
- **Deployment requirement:** After deploy, `KERNEL_ROLE` on Treasury must be granted to `TriggerProtocol`. Without this grant, `executeTrigger()` will revert.

---

## [0.1.0] — فروردین ۲۵۸۵ شاهنشاهی / March–April 2026

### Added — Step 12 Evidence Preparation
- `docs/reports/ARCHITECTURAL_RISK_AND_DOCTRINE_REPORT-v0.1.0-fa.md` — baseline architectural risk and doctrine report
- `docs/reports/STEP12_EXTERNAL_AUDIT_PREP_PACKET.md` — external audit preparation packet
- `docs/reports/STEP12_FORMAL_VERIFICATION_PREP_PACKET.md` — formal verification preparation packet
- `docs/reports/STEP12_ACCEPTED_EVIDENCE_ACQUISITION_CHECKLIST.md` — Step 12 evidence acquisition checklist
- `.github/ISSUE_TEMPLATE/step12-evidence-signoff.yml` — Step 12 evidence/signoff issue template

### Added — Core Contracts (baseline)
- `contracts/kernel.sol` — Layer-0 governance kernel (6 TR red lines, 7-of-9 multisig)
- `contracts/core/TriggerProtocol.sol` — execution layer for trigger enforcement
- `contracts/core/ConstitutionGuard.sol` — law proposal gatekeeper
- `contracts/monetary/SovereignWealthFund.sol` — three-layer national wealth fund
- `contracts/monetary/Treasury.sol` — treasury with KERNEL_ROLE access control
- `contracts/monetary/PahlaviToken.sol` — national currency token
- `contracts/governance/Provincial.sol` — 30/70 provincial revenue distribution
- `contracts/welfare/CitizenCard.sol` — smart citizen welfare card
- `contracts/oracles/API3Oracle.sol` — real-world data oracle with staleness guard
- `contracts/justice/JurySelection.sol` — VRF random jury selection
- `contracts/reclaim/AssetFreeze.sol` — asset freeze protocol

### Notes
- Step 12 blockers (STEP9-BLOCK-001 through STEP9-BLOCK-008) remain open
- No external audit completed
- No formal verification completed
- No mainnet deployment

---

[Unreleased]: https://github.com/fafa33/Iran-OS/compare/HEAD...HEAD
