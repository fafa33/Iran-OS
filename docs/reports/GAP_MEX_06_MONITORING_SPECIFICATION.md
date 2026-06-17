# GAP-MEX-06 — Monitoring Specification
## Breach-Relevant Condition Mapping: TR-05 / TR-06 Routing via Human-Mediated Oracle Observation

**Gap ID:** GAP-MEX-06
**Date:** 2026-06-17
**Status:** OPEN — specification documented; no code permissible; monitoring boundary constraints recorded
**Related Invariant:** MEX-06
**Category:** Governance
**Risk Level:** Medium
**Prior registers:** [`RESERVE_RUNTIME_GAP_REGISTER.md`](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md), [`MONETARY_EXPANSION_CONSTRAINTS.md`](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md)

---

## Disclaimers

- This document does not claim production readiness.
- This document does not close GAP-MEX-06. The gap is Governance-category; its closure requires external oracle operator tooling and governance process, neither of which can be mandated by an architecture document.
- This document does not create a new trigger code, violation category, threshold, timeout, or automatic-response mechanism.
- This document does not modify `kernel.sol`, `PahlaviToken.sol`, `API3Oracle.sol`, `TriggerProtocol.sol`, or any other contract.
- This document does not close any STEP9-BLOCK-* blocker.
- This document does not claim external audit completion or formal verification completion.

---

## What GAP-MEX-06 States

From `RESERVE_RUNTIME_GAP_REGISTER.md`:

> **Missing Enforcement:** A detector that maps a "breach-relevant condition" — including compositional-integrity findings such as those in GAP-MEX-04/GAP-MEX-05 that would not surface as a raw ratio failure — onto a TR-05/TR-06 flag.
>
> **Future Consideration:** Any future monitoring tooling proposal would need to route exclusively through the existing TR-05/TR-06 flagging mechanism — this invariant is explicit that no new code or automatic-response path is permissible, which any future scoping must treat as a hard constraint, not a design option.

---

## Monitoring Boundary Constraints (Required Findings)

The following eight constraints are non-negotiable. Any future monitoring tooling proposal MUST satisfy all eight without exception. Each is traceable to an existing contract, architecture document, or constitutional doctrine element.

### F-1: Monitoring is evidence-only

Monitoring tooling observes on-chain state and emits, relays, or stores information. It does not act. No monitoring tool, script, or off-chain process may issue a transaction, call a Solidity function, or alter any on-chain state as a consequence of an observed condition.

**Basis:** "Oracle signals are non-sovereign" doctrine (MONETARY_EXPANSION_CONSTRAINTS.md). `API3Oracle.syncReserves` and `Kernel.syncReserves` are data propagation only. No automatic-response path is permissible (GAP-MEX-06 constraint in RESERVE_RUNTIME_GAP_REGISTER.md).

### F-2: Monitoring creates no authority

A monitoring process holds no `ORACLE_ROLE`, `FEEDER_ROLE`, `SOVEREIGN_ROLE`, `COURT_ROLE`, `MINTER_ROLE`, `BURNER_ROLE`, or any other role that grants it write access to any IranOS contract. Observation does not require an on-chain role. Role grants are not monitoring infrastructure.

**Basis:** IranOS role model (kernel.sol AccessControl). The production FEEDER_ROLE grant path is constructor-time provisioning to known feeder EOAs (Codex P1 closure, PR #81). Monitoring agents must not be added to the feeder set as a shortcut to "automated flagging."

### F-3: Monitoring cannot mutate reserves

No monitoring action — direct or indirect — may cause `PahlaviToken.totalReserves` to change. `updateReserves` is `onlyKernel`. `Kernel.syncReserves` is `onlyOracle`. Only a feeder calling `API3Oracle.syncReserves` (the documented production path) may update reserves, and only through human-authorized feeder operation — not through automated monitoring output.

**Basis:** `updateReserves` modifier: `onlyKernel` (PahlaviToken.sol). `syncReserves` modifier: `onlyOracle` (kernel.sol). Deployment manifest Group D wiring. Monitoring-to-reserve mutation is a direct violation of the "oracle informs; Kernel records; contract enforces" triad (MONETARY_EXPANSION_CONSTRAINTS.md §Reserve-Ratio Protection).

### F-4: Monitoring cannot mutate treasury

No monitoring action may call `Treasury.executeTransaction`, `Treasury.proposeTransaction`, `SovereignWealthFund.withdraw`, or any treasury/SWF state-mutating function. Reserve monitoring and treasury management are structurally separate domains. A breach observation does not grant disbursement authority.

**Basis:** LAYER_INTERACTION_MODEL.md (Step-43) authority boundaries. Treasury block is a TriggerProtocol consequence requiring 7-of-9 multi-sig activation — not a monitoring output.

### F-5: Monitoring cannot mint

No monitoring action may cause `PahlaviToken.mint` to be called, directly or indirectly. `mint` requires `MINTER_ROLE` (held only by the SWF address). A reserve breach condition identified by monitoring must never be responded to by minting — minting against a sub-floor reserve would compound the violation.

**Basis:** `mint` modifier: `onlyRole(MINTER_ROLE)` (PahlaviToken.sol). Prohibited Expansion Paths: "Oracle-Triggered or Oracle-Authorized Minting" (MONETARY_EXPANSION_CONSTRAINTS.md).

### F-6: Monitoring cannot freeze

No monitoring action may call `AssetFreeze.freeze`, `Kernel.emergencyLock`, or any freeze-activating function. Asset freeze requires `CRAWLER_ROLE`; emergency lock for TR-01/02/03 is activated by oracle `flagViolation` plus 7-of-9 court signatures. Monitoring does not hold `CRAWLER_ROLE` and must not trigger freeze actions programmatically.

**Basis:** `AssetFreeze.freeze` modifier: `onlyRole(CRAWLER_ROLE)`. Emergency lock: `flagViolation` in kernel.sol requires `onlyOracle` — a role that monitoring must not hold (see F-2).

### F-7: Monitoring cannot bypass the Kernel authority model

No monitoring shortcut — including Hardhat impersonation, admin key storage, privileged RPC endpoints, or delegated signing — may circumvent the on-chain authority model. Any monitoring action that would require access to a private key held by a Kernel role (SOVEREIGN, COURT, ORACLE) is not permissible monitoring infrastructure; it is unauthorized key custody.

**Basis:** No admin backdoors rule (CLAUDE.md, CONTRIBUTING.md). Deployment-path parity requirement: tests that use `hardhat_impersonateAccount` are not proof of production reachability (PR #81 Codex P1 closure lesson). "Never introduce admin backdoors, upgrade proxies on the Kernel, or any mechanism that allows bypassing the multi-sig trigger" (CLAUDE.md Important Notes).

### F-8: Monitoring cannot create an alternate execution path

No monitoring proposal may introduce a second route by which reserve conditions, liquidity-cap proximity, or compositional-integrity findings reach the TriggerProtocol outside the `flagViolation → signViolation → _activateTrigger` lifecycle. The existing three-step lifecycle with 7-of-9 multi-sig and 72-hour Court adjudication is the only permissible trigger execution path. A monitoring specification must route through it — not around it.

**Basis:** `executeTrigger` modifier: `onlyKernel` (TriggerProtocol.sol). MULTISIG_THRESHOLD = 7 (immutable). TRIGGER_TIMEOUT = 72 hours (immutable). TriggerProtocol contamination risk item in Pre-Implementation Red-Team Pass policy (CLAUDE.md, CONTRIBUTING.md).

---

## Five Monitoring Domain Boundaries

### Domain 1 — Reserve Monitoring

**What can be monitored:** `PahlaviToken.totalReserves`, `currentReserveRatio()`, `reserveFloorBreached`, the `ReservesUpdated`, `ReserveFloorBreached`, and `ReserveFloorRestored` events emitted by PahlaviToken, and the `ReserveSynced` event emitted by Kernel.

**What monitoring must NOT do:** Automatically call `Kernel.syncReserves` in response to an observed reserve condition. Automatically call `flagViolation` in response to `ReserveFloorBreached`. Write `totalReserves` through any path. Infer a "reserves are sufficient" conclusion that bypasses the `reserveCompliant` check.

**Required human decision point:** An `ORACLE_ROLE` holder (i.e., an authorized oracle operator, not an automated process) must observe `ReserveFloorBreached` and independently determine whether the condition represents a governance-relevant event warranting a `flagViolation` call. This determination is a human judgment about cause and intent — automated forwarding of "breach event observed → flagViolation called" is not permissible under F-1, F-2, and F-8.

**Breach-relevant conditions to surface (for human review):**
1. `ReserveFloorBreached` emitted — ratio has dropped below 333‰ for existing supply.
2. `updateReserves` accepted a figure that, after composition audit (GAP-MEX-04/05), is later found to include ineligible value (frozen assets, unrouted reclaimed assets, double-counted entries).
3. `currentReserveRatio()` at or near the floor after a legitimate reserve update — boundary monitoring, not enforcement.

**Applicable trigger codes (if human determines flagViolation is warranted):** TR-05 (`TR_SWF_INDEPENDENCE`) for SWF-independence violations; TR-06 (`TR_LIQUIDITY_CAP`) for liquidity-cap-adjacent conditions. Neither code is semantically optimal for a raw reserve-ratio decline (see CF1_BREACH_DETECTION_DISPOSITION.md §Why TriggerProtocol Routing Was Deferred) — this mapping is the best available within the existing trigger-code set, pending a future doctrine decision on whether a reserve-specific trigger code is warranted.

### Domain 2 — Oracle Monitoring

**What can be monitored:** `API3Oracle` events (`DataPointUpdated`, `ViolationFlagged`, `ReserveSyncForwarded`), feeder activity by address, data type distribution across feeder calls, and whether the expected feeder set (per the deployment manifest) is the set actually submitting data.

**What monitoring must NOT do:** Automatically add or remove feeders from `FEEDER_ROLE`. Automatically revoke or grant `ORACLE_ROLE` on Kernel. Assert that an oracle signal is "correct" in a way that bypasses human review. Treat `DataPointUpdated` as confirmation that `totalReserves` has been updated — the path requires a subsequent `syncReserves` call by a feeder, not the oracle event alone.

**Required human decision point:** Oracle operator must review anomalous feeder behavior (unexpected data type, unexpected value range, unexpected feeder address) before deciding whether to escalate to a `flagViolation` call. Automated escalation is not permissible.

**Boundary note:** `API3Oracle.flagViolation` can be called by `FEEDER_ROLE` holders (not `ORACLE_ROLE`) — this is an existing design pattern. Monitoring must not assume that every `ViolationFlagged` event from `API3Oracle` will be, or should be, forwarded to `Kernel.flagViolation`. The Kernel-level flagging is a constitutional act; the oracle-level flagging is a data-reporting act.

### Domain 3 — Feeder Monitoring

**What can be monitored:** Whether feeder addresses that hold `FEEDER_ROLE` on `API3Oracle` (set at constructor time per Codex P1 / PR #81) are submitting data, the frequency of their submissions, whether their submitted values are within expected operational ranges, and whether any `FEEDER_ROLE` grant/revoke events occur on `API3Oracle`.

**What monitoring must NOT do:** Issue `grantRole(FEEDER_ROLE, ...)` or `revokeRole(FEEDER_ROLE, ...)` calls automatically. Hold private keys for feeder EOAs as monitoring infrastructure. Use `hardhat_impersonateAccount` or equivalent privileged RPC access in any production monitoring process.

**Required human decision point:** Feeder set changes require governance authorization. An observed "feeder has gone silent" condition requires a human decision about whether to replace the feeder — not automated role management.

**Constructor-time provisioning note (Codex P1):** The production grant path for `FEEDER_ROLE` is the constructor. Post-deploy grant requires `DEFAULT_ADMIN_ROLE` on `API3Oracle`, which is held by the Kernel — meaning a post-deploy feeder addition requires a Kernel governance action, not a monitoring script. Monitoring must surface the need for this action to a human, not attempt to execute it.

### Domain 4 — Treasury Monitoring

**What can be monitored:** `Treasury` events (`TransactionProposed`, `TransactionExecuted`, `BudgetLineCapped`, `BudgetLineExhausted`), treasury balance levels relative to budget lines, whether transactions are being proposed by addresses holding `MINTER_ROLE` or `SOVEREIGN_ROLE`, and whether the treasury block state (set by `TriggerProtocol.executeTrigger`) is active.

**What monitoring must NOT do:** Automatically block or approve treasury transactions. Call `Treasury.executeTransaction` in response to any condition. Infer reserve sufficiency from treasury balance — treasury balance and `PahlaviToken.totalReserves` are separate accounting domains.

**Required human decision point:** Treasury utilization approaching budget limits, or a treasury-block state being observed, requires human review before any remediation action. Monitoring surfaces the condition; governance acts.

**Doctrine note:** "Final constitutional judgment is not fully delegated to automation" (PR template Constitutional Invariant Safety section). Treasury mutation authority belongs exclusively to governance actors, not to monitoring infrastructure.

### Domain 5 — Deployment Monitoring

**What can be monitored:** Whether the role assignments on each deployed contract match those documented in the deployment manifest (`docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`, `docs/deployment/ROLE_WIRING_CHECKLIST.md`). Specifically: that `ORACLE_ROLE` on Kernel is held by `API3Oracle` and not by the bootstrap placeholder; that `MINTER_ROLE` on `PahlaviToken` is held by the SWF address; that `DEFAULT_ADMIN_ROLE` relationships match the manifest; that `pahlaviToken` address on Kernel is set and non-zero.

**What monitoring must NOT do:** Automatically correct role assignments. Automatically revoke unexpected role holders (this would require admin authority not appropriate for monitoring infrastructure).

**Required human decision point:** Any role-assignment discrepancy between observed on-chain state and the deployment manifest must be surfaced to the deployment team for human review and correction through the governance role-management process.

**Deployment-path parity note:** The bootstrap oracle revoke (ORACLE_ROLE revoked from the placeholder after API3Oracle is wired — documented in deployment manifest Group E) is a required post-deploy step. Monitoring should verify this revoke has occurred and alert if `kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL_ADDRESS) == true` after the expected wiring window.

---

## Authority Escalation Risk Review

The following escalation paths were reviewed for monitoring-to-authority contamination risk. None are permissible. All are documented here so future tooling proposals can confirm they do not reintroduce them.

| Escalation Path | Risk | Why Not Permissible |
|---|---|---|
| Monitor observes `ReserveFloorBreached` → automatically calls `flagViolation` | **High** | Violates F-1, F-8. Converts a data event into a constitutional act without human judgment. A planned reserve write-down would trigger a violation process. |
| Monitor holds `FEEDER_ROLE` to "report" conditions | **High** | Violates F-2. Feeders submit reserve/price/production data — not monitoring alerts. Mixing the roles blurs data provenance. |
| Monitor holds `ORACLE_ROLE` to directly call `Kernel.syncReserves` | **Critical** | Violates F-2, F-3. `ORACLE_ROLE` on Kernel is a production grant for `API3Oracle` — not for monitoring processes. An automated sync triggered by a monitoring condition bypasses feeder-level attribution and human authorization. |
| Monitor stores private key for a `COURT_ROLE` signer | **Critical** | Violates F-7. Court signers are constitutional actors. Key custody for automated signing is not monitoring infrastructure — it is a constitutional authority compromise. |
| Monitor calls `TriggerProtocol.executeTrigger` if conditions exceed a threshold | **Critical** | Violates F-8. `executeTrigger` requires `onlyKernel`. But the concern is design intent: any design that routes monitoring output into the trigger lifecycle without 7-of-9 multi-sig is a constitutional bypass attempt. |
| Monitor adjusts `totalReserves` via `updateReserves` after detecting stale data | **Critical** | Violates F-1, F-3. `updateReserves` is `onlyKernel`. No monitoring process may hold Kernel authority to "correct" reserve data. |
| Monitor fires burn/contraction in response to a breach | **High** | Violates F-1. `burn` requires `BURNER_ROLE` (held by SWF). Contraction in response to a breach is a governance decision, not a monitoring consequence. |

---

## Required Response Direction for Breach-Relevant Conditions

When a monitoring process observes a breach-relevant condition (any of the conditions listed under Domain 1 "Breach-relevant conditions to surface"), the required response direction — without prescribing new mechanisms — is:

1. **Surface the condition to a human oracle operator** with sufficient context: which event was observed, at what block/timestamp, what the resulting ratio is, what `totalSupply()` and `totalReserves` are.
2. **The human operator determines** whether the condition represents a governance-relevant event — a genuine breach of reserve independence, a constitutional violation by a governance actor, or a composition-integrity failure — or an operational event (planned write-down, authorized reclassification, legitimate reserve correction) that does not warrant a trigger.
3. **If the operator determines a flagViolation is warranted**, they call `Kernel.flagViolation(violationCode, offender, reason)` using their `ORACLE_ROLE` on Kernel (held via `API3Oracle`, not directly). The applicable codes are TR-05 or TR-06 as described in Domain 1 above.
4. **The Court proceeds through 7-of-9 signViolation**, independently evaluating the violation record before activating the trigger.
5. **No step in this sequence is automated.** Steps 2 and 4 are irreducibly human judgment steps under the IranOS constitutional model.

---

## GAP-MEX-06 Disposition

**Status: OPEN**

This document constitutes the monitoring specification required by GAP-MEX-06's "Missing Enforcement" description. Specifically:

- All eight monitoring boundary constraints are documented (F-1 through F-8).
- All five monitoring domain boundaries are documented (Domains 1–5).
- The authority escalation risks are documented and each is confirmed non-permissible.
- The required response direction (human-mediated, not automated) is documented.
- No new code, trigger code, threshold, timeout, or automatic-response mechanism has been introduced.

**Why the gap remains OPEN:** GAP-MEX-06's "Missing Enforcement" is a Governance gap, not a code gap. The constraint it protects — that breach-relevant conditions are mapped to TR-05/TR-06 flags via human-mediated oracle observation — cannot be closed by a documentation artifact alone. It requires:

1. Oracle operator procedures (off-chain tooling and operational runbooks — outside this repository).
2. Governance decisions on TR-05/TR-06 scope applicability to reserve-ratio conditions (a future doctrine review item).
3. Deployment and operation of monitoring infrastructure satisfying F-1 through F-8.

None of these three prerequisites can be satisfied by an architecture document. The specification documented here is a necessary prerequisite to closing the gap — it defines the constraints any future implementation must satisfy — but it is not itself the implementation.

**What would close the gap:** An accepted external review or audit confirming that deployed oracle operator tooling satisfies F-1 through F-8, and that governance procedures for the required human decision points (Domain 1 human decision point) are in place and documented. Neither condition is within the scope of this document or this repository's current milestone.

---

## Recommended Follow-Up Actions

| Action | Owner | Priority |
|---|---|---|
| Oracle operator runbook: define SLA for `ReserveFloorBreached` observation-to-review window | Oracle operator team | Medium |
| Doctrine review: confirm whether TR-05 or TR-06 is the correct code for a raw reserve-ratio-decline condition that has no "offender" in the TriggerProtocol sense | Constitutional doctrine review | Low |
| Future audit: verify that monitoring tooling, when deployed, satisfies F-1 through F-8 | External audit (Step 12 / Step 13) | Low |
| Deployment verification: add `kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL) == false` check to deployment monitoring domain (Domain 5) as a post-deploy verification step | Deployment team | Medium |

---

*Report date: 2026-06-17*
*Branch: claude/dependabot-pr-cleanup-neu16i*
*No contracts modified. Documentation-only.*
*Prior registers: `docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md`, `docs/architecture/MONETARY_EXPANSION_CONSTRAINTS.md`*
*Prior report: `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`*
