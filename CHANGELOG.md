# Changelog

All notable changes to IranOS are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

> **Non-claim notice:** Entries in this changelog do not claim production readiness, release approval, completed external audit, or completed formal verification. Step 12 and Step 13 remain open.

---

## [Unreleased]

### Added
- `CONTRIBUTING.md` — English contributor onboarding (PR #47)
- `CHANGELOG.md` — this file (PR #47)

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
