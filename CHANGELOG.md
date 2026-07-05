# Changelog

All notable changes to IranOS are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

> **Non-claim notice:** Entries in this changelog do not claim production readiness, release approval, completed external audit, or completed formal verification. Step 12 and Step 13 remain open.

---

## [Unreleased]

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
