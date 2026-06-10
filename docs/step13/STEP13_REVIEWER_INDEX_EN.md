# Step 13 — External Reviewer Index

**Version:** 1.0.0  
**Date:** 3 June 2026 / 13 Khordad 2585 Imperial  
**Related Issue:** [#35](https://github.com/fafa33/Iran-OS/issues/35)

---

> **⚠️ Status: Informational index — does not close Step 13 — does not close Step 12 — not an audit, formal verification, or production-readiness claim**

---

## What is Step 13?

Step 13 is a cross-chapter fidelity review of the IranOS whitepaper against the smart contract codebase. It identified six real gaps, remediated four, and deferred two with recorded decisions. Issue #35 remains open for external review.

---

## Gap Summary

| ID | Title | Status |
|----|-------|--------|
| TG-01 | Treasury auto-block on trigger | ✅ Implemented — PR [#36](https://github.com/fafa33/Iran-OS/pull/36) |
| COURT-01 | COURT_ROLE availability at deployment | ✅ Documented — PR [#38](https://github.com/fafa33/Iran-OS/pull/38) |
| G-11 | Deployment manifest | ✅ Documented — PR [#39](https://github.com/fafa33/Iran-OS/pull/39) |
| G-02 | Airnode RRP integration | ✅ Documented — PR [#40](https://github.com/fafa33/Iran-OS/pull/40) |
| G-03 | On-chain ZK verifier | ⏸ Deferred — recorded decision PR [#44](https://github.com/fafa33/Iran-OS/pull/44) |
| VS-01 | VotingSystem ↔ CitizenCard link | ⏸ Deferred — pending ElectionProtocol |

**Tests at checkpoint: 499/499 passing**

---

## Key Documents — Start Here

### 1. Reviewer Instructions (Persian)
`docs/step13/STEP13_REVIEWER_INSTRUCTIONS_FA.md`  
Entry point for conducting a Step 13 review. Explains what Step 13 is and is not, common pitfalls, and how to submit findings.

### 2. Real Gap Disposition (Persian)
`docs/step13/STEP13_REAL_GAP_DISPOSITION_FA.md`  
Master table of all six gaps — status, rationale, PR references, and deferred decisions.

### 3. Remediation Checkpoint (Persian)
`docs/step13/STEP13_REMEDIATION_CHECKPOINT_FA.md`  
Detailed per-gap remediation record including implementation summaries and test state.

### 4. Final Status Report (Persian)
`docs/step13/STEP13_FINAL_STATUS_REPORT_FA.md`  
Consolidated status report: completed gaps, deferred gaps, PR table, test history, and non-claims.

### 5. G-03 Defer Decision (Persian)
`docs/step13/G03_ZK_FINAL_DEFER_DECISION_FA.md`  
Recorded architectural decision: why a real ZK verifier and mock/interface were both rejected; what a future standalone ZK phase requires.

### 6. Cross-Fargard Fidelity Review (Persian)
`docs/step13/WHITEPAPER_STEP13_CROSS_FARGARD_FIDELITY_REVIEW_FA.md`  
The original Step 13 review document — source of the six gaps identified.

### 7. Closure Criteria (Persian)
`docs/step13/WHITEPAPER_STEP13_CLOSURE_CRITERIA_FA.md`  
Defines what evidence and conditions are required to formally close Step 13.

---

## Related Infrastructure Documents

| Document | Location | Content |
|----------|----------|---------|
| Deployment Manifest | `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` | 16-contract deployment order, role wiring groups A–E |
| Court Role Protocol | `docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md` | 9-member COURT_ROLE requirement, notLocked constraint |
| Role Wiring Checklist | `docs/deployment/ROLE_WIRING_CHECKLIST.md` | Post-deployment verification checklist |
| Airnode Integration | `docs/oracle/AIRNODE_INTEGRATION_PROTOCOL.md` | Feeder registry, SLA, staleness runbook |

---

## What Remains Open

- **Issue #35** — Step 13 external review: open, awaiting external reviewers
- **Step 12** — External audit / formal verification: open, no accepted evidence yet
- **G-03** — On-chain ZK verifier: deferred to a standalone phase
- **VS-01** — VotingSystem ↔ CitizenCard integration: deferred pending ElectionProtocol (`VotingSystem.sol` itself exists and is tested)
- **deploy/ scripts** — Hardhat deployment scripts not yet created (G-11 technical remainder)

---

## Non-Claims

- This index does not close Step 13
- This index does not close Step 12
- No external audit has been completed
- No formal verification has been completed
- No production-readiness is claimed
- No deployment on any public network exists
- The on-chain ZK verifier does not exist
- The VotingSystem ↔ CitizenCard integration does not exist and ElectionProtocol is not defined (correction: `VotingSystem.sol` itself exists at `contracts/governance/VotingSystem.sol`, tested in `test/18_Voting_System.test.js`)
