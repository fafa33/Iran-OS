# GAP-MEX-06 — Monitoring Specification
## Breach-Relevant Condition Mapping: TR-05 / TR-06 Routing via Human-Mediated Oracle Observation

**Gap ID:** GAP-MEX-06
**Date:** 2026-06-17
**Status:** CLOSED — documentation-level monitoring/governance standard established; all seven domains specified; FND-01..FND-10 verified; F-1..F-8 satisfied; no unresolved findings
**Related Invariant:** MEX-06
**Category:** Governance
**Risk Level:** Medium
**Prior registers:** [`RESERVE_RUNTIME_GAP_REGISTER.md`](../architecture/RESERVE_RUNTIME_GAP_REGISTER.md), [`MONETARY_EXPANSION_CONSTRAINTS.md`](../architecture/MONETARY_EXPANSION_CONSTRAINTS.md)

---

## Disclaimers

- This document does not claim production readiness.
- GAP-MEX-06 is CLOSED as a documentation-level monitoring/governance standard (see Disposition below). This document does not imply that production monitoring tooling has been deployed, audited, or certified against F-1..F-8.
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

No monitoring action may call `Treasury.signTransaction`, `SovereignWealthFund.signWithdrawal`, or any treasury/SWF state-mutating function. Reserve monitoring and treasury management are structurally separate domains. A breach observation does not grant disbursement authority.

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

## Seven Monitoring Domain Boundaries

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

**What can be monitored:** `API3Oracle` events (`DataUpdated`, `ViolationFlagged`, `ReserveSyncForwarded`), feeder activity by address, data type distribution across feeder calls, and whether the expected feeder set (per the deployment manifest) is the set actually submitting data.

**What monitoring must NOT do:** Automatically add or remove feeders from `FEEDER_ROLE`. Automatically revoke or grant `ORACLE_ROLE` on Kernel. Assert that an oracle signal is "correct" in a way that bypasses human review. Treat `DataPointUpdated` as confirmation that `totalReserves` has been updated — the path requires a subsequent `syncReserves` call by a feeder, not the oracle event alone.

**Required human decision point:** Oracle operator must review anomalous feeder behavior (unexpected data type, unexpected value range, unexpected feeder address) before deciding whether to escalate to a `flagViolation` call. Automated escalation is not permissible.

**Boundary note:** The production flagging path is: feeder (holding `FEEDER_ROLE` on `API3Oracle`) calls `API3Oracle.flagViolation(offender, violationCode, reason)` — `API3Oracle` then automatically forwards to `Kernel.flagViolation` under its `ORACLE_ROLE`. Feeders cannot call `Kernel.flagViolation` directly (they hold no `ORACLE_ROLE`). Monitoring must not automatically trigger this path — calling `API3Oracle.flagViolation` must be a deliberate human decision, not an automated monitoring response.

### Domain 3 — Feeder Monitoring

**What can be monitored:** Whether feeder addresses that hold `FEEDER_ROLE` on `API3Oracle` (set at constructor time per Codex P1 / PR #81) are submitting data, the frequency of their submissions, whether their submitted values are within expected operational ranges, and whether any `FEEDER_ROLE` grant/revoke events occur on `API3Oracle`.

**What monitoring must NOT do:** Issue `grantRole(FEEDER_ROLE, ...)` or `revokeRole(FEEDER_ROLE, ...)` calls automatically. Hold private keys for feeder EOAs as monitoring infrastructure. Use `hardhat_impersonateAccount` or equivalent privileged RPC access in any production monitoring process.

**Required human decision point:** Feeder set changes require governance authorization. An observed "feeder has gone silent" condition requires a human decision about whether to replace the feeder — not automated role management.

**Constructor-time provisioning note (Codex P1):** The production grant path for `FEEDER_ROLE` is the constructor. Post-deploy grant requires `DEFAULT_ADMIN_ROLE` on `API3Oracle`, which is held by the Kernel — meaning a post-deploy feeder addition requires a Kernel governance action, not a monitoring script. Monitoring must surface the need for this action to a human, not attempt to execute it.

### Domain 4 — Treasury Monitoring

**What can be monitored:** `Treasury` events (`BudgetLineCreated`, `TransactionProposed`, `TransactionSigned`, `TransactionExecuted`), treasury balance levels relative to budget lines, whether transactions are being proposed by addresses holding `GOVERNMENT_ROLE` (which gates `proposeTransaction`) and signed by `AUDITOR_ROLE` holders (which gates `signTransaction`), and whether the treasury block state (set by `TriggerProtocol.executeTrigger`) is active.

**What monitoring must NOT do:** Automatically block or approve treasury transactions. Call `Treasury.executeTransaction` in response to any condition. Infer reserve sufficiency from treasury balance — treasury balance and `PahlaviToken.totalReserves` are separate accounting domains.

**Required human decision point:** Treasury utilization approaching budget limits, or a treasury-block state being observed, requires human review before any remediation action. Monitoring surfaces the condition; governance acts.

**Doctrine note:** "Final constitutional judgment is not fully delegated to automation" (PR template Constitutional Invariant Safety section). Treasury mutation authority belongs exclusively to governance actors, not to monitoring infrastructure.

### Domain 5 — Deployment Monitoring

**What can be monitored:** Whether the role assignments on each deployed contract match those documented in the deployment manifest (`docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md`, `docs/deployment/ROLE_WIRING_CHECKLIST.md`). Specifically: that `ORACLE_ROLE` on Kernel is held by `API3Oracle` and not by the bootstrap placeholder; that `MINTER_ROLE` on `PahlaviToken` is held by the SWF address; that `DEFAULT_ADMIN_ROLE` relationships match the manifest; that `pahlaviToken` address on Kernel is set and non-zero.

**What monitoring must NOT do:** Automatically correct role assignments. Automatically revoke unexpected role holders (this would require admin authority not appropriate for monitoring infrastructure).

**Required human decision point:** Any role-assignment discrepancy between observed on-chain state and the deployment manifest must be surfaced to the deployment team for human review and correction through the governance role-management process.

**Deployment-path parity note:** The bootstrap oracle revoke (ORACLE_ROLE revoked from the placeholder after API3Oracle is wired — documented in deployment manifest Group E) is a required post-deploy step. Monitoring should verify this revoke has occurred and alert if `kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL_ADDRESS) == true` after the expected wiring window.

### Domain 6 — Alerting and Observability

**What can be monitored:** The full stack of off-chain observability surfaces: event indexers, subgraphs, dashboards, read-only RPC queries, log aggregators, and alert pipelines (notification delivery to human operators via any channel). This domain covers how monitoring findings are surfaced — not what is monitored (handled in Domains 1–5 and 7).

**What monitoring must NOT do:** Alerting infrastructure must not hold signing keys, a funded EOA, or any account capable of issuing a transaction. Dashboards must not be wired to automated transaction-submission backends. Alert "auto-remediation" hooks that call any IranOS contract function — even view-only functions that have write side effects — are not permissible. Observability pipelines must not store or transmit private keys for any IranOS role.

**Required human decision point:** An alert is a notification. The decision to act on an alert — including calling `flagViolation`, updating feeder configuration, or escalating to governance — belongs to the human operator who receives it. The alerting system's job ends at delivery. It does not follow up, retry, or escalate automatically.

**Read-only RPC boundary:** All RPC calls issued by monitoring infrastructure must be read-only (`eth_call`, `eth_getLogs`, `eth_getStorageAt`). Any use of `eth_sendTransaction`, `eth_sendRawTransaction`, or any signing-capable RPC method in a monitoring process violates F-1 and F-7, regardless of what role (if any) the signing key holds.

**Observability surfaces that satisfy all eight constraints:**
- Event log indexing (filtering `ReserveFloorBreached`, `ReserveSynced`, `TriggerActivated`, `ViolationFlagged`, etc.)
- Read-only contract state polling (`currentReserveRatio()`, `reserveFloorBreached`, `emergencyLockActive`, `violationCount`, `executionCount`)
- Block explorer integration (read-only)
- Time-series dashboards tracking ratio, supply, reserves, trigger state
- Human-readable alert payloads delivered to operators

### Domain 7 — Trigger Protocol Monitoring

**What can be monitored:** The full state of the TriggerProtocol and Kernel violation lifecycle: `violationCount`, `triggerActivationCount`, `executionCount` (on TriggerProtocol), the `emergencyLockActive` flag, `violationsRegistry` records, signature counts per violation, TRIGGER_TIMEOUT proximity (72 hours from `ViolationFlagged`), and the `ViolationFlagged`, `TriggerActivated`, `TriggerExecuted`, `EmergencyLockActivated`, and `EmergencyLockDeactivated` events.

**What monitoring must NOT do:** Call `signViolation` programmatically (requires `COURT_ROLE`). Call `executeTrigger` (requires `onlyKernel` — not a direct external call). Call `flagViolation` as an automated response to any on-chain condition (see Domain 1 human decision point). Track TRIGGER_TIMEOUT and automatically re-flag a violation whose timeout has elapsed — re-flagging is a governance act, not a monitoring act. Treat an elapsed TRIGGER_TIMEOUT as a system failure that monitoring must correct.

**Required human decision point:** Court signers must independently observe a violation record, evaluate its legitimacy against the constitutional grounds (TR-01 through TR-06), and call `signViolation` using their own COURT_ROLE private keys — not keys held by monitoring infrastructure. No automated co-signing. No threshold-triggered multi-sig aggregation script. Each of the 7-of-9 signatures is a distinct, independent human act.

**TRIGGER_TIMEOUT boundary:** Monitoring may alert that a violation's timeout window is approaching (e.g., 24 hours into the window). It must not automatically re-submit or re-escalate the violation. If the Court does not reach 7 signatures within the 72-hour TRIGGER_TIMEOUT window, the violation record remains open on-chain — `signViolation` has no automatic expiry or timeout rejection. TRIGGER_TIMEOUT is constitutional operational guidance, not an automatic on-chain record expiry. Governance may independently decide whether to re-flag if the window elapsed without activation. Monitoring surfaces the elapsed window to governance — it does not advance or restart any clock.

**TriggerProtocol contamination constraint (F-8 specific):** The primary F-8 risk in this domain is a monitoring process that, after observing a breach-relevant reserve or treasury condition, routes directly to `flagViolation` without human review — effectively treating a contract event as equivalent to a constitutional violation determination. This is the contamination risk GAP-MEX-06 exists to prevent. Monitoring must preserve the gap between "event observed" and "violation flagged" as an irreducible human judgment step.

---

## Domain-to-Constraint Mapping

All eight constraints apply universally to all monitoring domains. The table below identifies the constraints with the most direct interaction in each domain — where a violation of the constraint would be most likely to emerge from that domain's specific activities. "Primary" means the domain's boundary conditions directly implicate the constraint. "Applicable" (all) means the universal prohibition applies but is less operationally load-bearing for that domain.

| Domain | F-1 | F-2 | F-3 | F-4 | F-5 | F-6 | F-7 | F-8 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| D1: Reserve | **P** | **P** | **P** | — | **P** | — | **P** | **P** |
| D2: Oracle | **P** | **P** | **P** | — | — | — | **P** | **P** |
| D3: Feeder | **P** | **P** | **P** | — | — | — | **P** | — |
| D4: Treasury | **P** | **P** | — | **P** | **P** | — | **P** | — |
| D5: Deployment | **P** | **P** | — | — | — | — | **P** | — |
| D6: Alerting | **P** | **P** | — | — | — | — | **P** | **P** |
| D7: Trigger Protocol | **P** | **P** | — | — | — | **P** | **P** | **P** |

**P** = Primary — this domain's activities directly implicate this constraint.
**—** = Applicable (universal) but not the load-bearing constraint for this domain.

**Constraint coverage summary:** F-1 (evidence-only) and F-2 (no authority) are primary across all seven domains — they are the root constraints from which F-3 through F-8 derive. F-3 (no reserve mutation) is primary in Domains 1–3 (the data-flow domains for reserve state). F-4 (no treasury mutation) is primary in Domain 4. F-5 (no mint) is primary in Domains 1 and 4 (where reserve/treasury conditions could most plausibly be misread as justifying a mint). F-6 (no freeze) is primary in Domain 7 (where trigger-protocol monitoring is most proximate to emergency-lock activation). F-7 (no Kernel bypass) and F-8 (no alternate execution path) are primary in all domains that have a plausible automation path to an on-chain action.

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
3. **If the operator determines a flagViolation is warranted**, they call `API3Oracle.flagViolation(offender, violationCode, reason)` using their `FEEDER_ROLE` on `API3Oracle`. `API3Oracle` then forwards to `Kernel.flagViolation` under its `ORACLE_ROLE` on the Kernel. Feeders do not call `Kernel.flagViolation` directly. The applicable codes are TR-05 or TR-06 as described in Domain 1 above.
4. **The Court proceeds through 7-of-9 signViolation**, independently evaluating the violation record before activating the trigger.
5. **No step in this sequence is automated.** Steps 2 and 4 are irreducibly human judgment steps under the IranOS constitutional model.

---

## Findings Summary

The following findings confirm that all monitoring domains, as specified, satisfy F-1 through F-8. Each finding states the verified property and the constraint(s) it satisfies.

| Finding | Domain(s) | Constraint(s) | Verified Property |
|---|---|---|---|
| FND-01 | All | F-1 | No monitoring domain requires or permits issuing a transaction, calling a Solidity function, or altering on-chain state as a consequence of an observed condition. All domains are observation-and-report only. |
| FND-02 | All | F-2 | No monitoring domain requires holding `ORACLE_ROLE`, `FEEDER_ROLE`, `SOVEREIGN_ROLE`, `COURT_ROLE`, `MINTER_ROLE`, `BURNER_ROLE`, `CRAWLER_ROLE`, `KERNEL_ROLE`, or any other IranOS on-chain role. Observation requires no role. |
| FND-03 | D1, D2, D3 | F-3 | No monitoring path in the reserve, oracle, or feeder domains can reach `PahlaviToken.updateReserves` (onlyKernel) or `Kernel.syncReserves` (onlyOracle) without holding an authority role. Since monitoring holds no such role (FND-02), reserve state mutation via monitoring is impossible without a contract modification. |
| FND-04 | D4 | F-4 | No monitoring path in the treasury domain can reach `Treasury.signTransaction` (requires `AUDITOR_ROLE`) or `SovereignWealthFund.signWithdrawal` (requires `COUNCIL_ROLE`). Monitoring holds neither role (FND-02). |
| FND-05 | D1, D4 | F-5 | No monitoring path can reach `PahlaviToken.mint`. `mint` requires `MINTER_ROLE` (held only by the SWF address). Monitoring holds no role (FND-02) and cannot acquire `MINTER_ROLE` through any path documented in the deployment manifest. |
| FND-06 | D7 | F-6 | No monitoring path in the Trigger Protocol domain can call `AssetFreeze.freeze` (requires `CRAWLER_ROLE`) or activate the emergency lock except through `flagViolation` (requires `ORACLE_ROLE`). Monitoring holds neither role (FND-02). The `emergencyLockActive` flag is observable but not writable by monitoring. |
| FND-07 | All | F-7 | No monitoring domain requires Hardhat impersonation, admin key custody, privileged RPC signing (`eth_sendTransaction` / `eth_sendRawTransaction`), or access to a private key held by any IranOS constitutional role. All monitoring access is read-only (`eth_call`, `eth_getLogs`). |
| FND-08 | D1, D2, D6, D7 | F-8 | No monitoring domain introduces a path from an observed event directly to `TriggerProtocol.executeTrigger` or `Kernel._activateTrigger`. The `flagViolation → signViolation (7-of-9) → _activateTrigger` lifecycle with 72-hour TRIGGER_TIMEOUT remains the sole permissible execution path. Monitoring may alert on lifecycle state but may not advance it. |
| FND-09 | D7 | F-8 | TriggerProtocol monitoring explicitly prohibits automated co-signing (no script may hold `COURT_ROLE` keys), TRIGGER_TIMEOUT auto-restart (monitoring alerts on expiry but does not re-flag), and threshold-triggered multi-sig aggregation. Each of the 7-of-9 court signatures is a distinct, independent human act. |
| FND-10 | D1 | F-1, F-8 | The `ReserveFloorBreached` event provides the on-chain signal for Domain 1 monitoring. Observation of this event does not — and must not — automatically produce a `flagViolation` call. The gap between "event observed" and "violation flagged" is the irreducible human judgment step that GAP-MEX-06 exists to protect. |

**Authority escalation confirmation:** All seven authority escalation paths reviewed in the "Authority Escalation Risk Review" section are confirmed non-permissible. No path from any monitoring domain to any write operation on any IranOS contract exists within the boundaries specified by this document.

**No new authority created:** The monitoring specification, as written, requires no new role, no new function, no new contract, and no new deployment step. The only infrastructure it requires is off-chain (event indexing, dashboards, alert delivery) — none of which has write access to any on-chain state.

---

## GAP-MEX-06 Disposition

**Status: CLOSED**

The `RESERVE_RUNTIME_GAP_REGISTER.md` entry for GAP-MEX-06 explicitly describes its "Missing Enforcement" as "a documentation-level monitoring/governance standard." This document satisfies that standard. Specifically:

- All eight monitoring boundary constraints are documented (F-1 through F-8).
- All seven monitoring domain boundaries are documented (Domains 1–7): Reserve, Oracle, Feeder, Treasury, Deployment, Alerting/Observability, Trigger Protocol.
- The domain-to-constraint mapping is documented and verified.
- All ten findings (FND-01..FND-10) confirm constraint compliance — no unresolved finding remains.
- The authority escalation risks are documented; all seven paths reviewed and confirmed non-permissible.
- The required response direction (human-mediated, not automated) is documented.
- The judgment gap between "event observed" and "violation flagged" is preserved and explicitly required.
- No new code, trigger code, threshold, timeout, automatic-response mechanism, or on-chain role has been introduced.

**What CLOSED means in this context:** CLOSED means the documentation-level monitoring/governance standard — which is what GAP-MEX-06's "Missing Enforcement" requires — is now established. It does not mean:
- Monitoring tooling has been deployed in production.
- An external audit has verified deployed tooling against F-1..F-8.
- Oracle operator runbooks are finalized.
- A doctrine decision on TR-05 vs. TR-06 scope has been issued.

These remain recommended follow-up actions. They are prerequisites to a production deployment, not prerequisites to closing the documentation-level gap.

**Closure basis:** The gap register entry for GAP-MEX-06 states: "the *detection-and-mapping* half is a documentation-level monitoring/governance standard." FND-01..FND-10 deliver that standard. No further documentation, code, or contract change is required to satisfy the gap as described.

---

## Recommended Follow-Up Actions

| Action | Owner | Priority |
|---|---|---|
| Oracle operator runbook: define SLA for `ReserveFloorBreached` observation-to-review window | Oracle operator team | Medium |
| Doctrine review: confirm whether TR-05 or TR-06 is the correct code for a raw reserve-ratio-decline condition that has no "offender" in the TriggerProtocol sense | Constitutional doctrine review | Low |
| Future audit: verify that monitoring tooling, when deployed, satisfies F-1 through F-8 | External audit (Step 12 / Step 13) | Low |
| Deployment verification: add `kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL) == false` check to deployment monitoring domain (Domain 5) as a post-deploy verification step | Deployment team | Medium |

---

*Report date: 2026-06-17 (updated: Domain 6/7 added; domain-to-constraint mapping; FND-01..FND-10; disposition CLOSED; Codex P2: disclaimer reconciled, DataUpdated event name corrected, Treasury events/roles corrected, TRIGGER_TIMEOUT on-chain expiry clarified, flagViolation routing corrected to API3Oracle entrypoint, Treasury/SWF mutation paths corrected)*
*Branch: claude/dependabot-pr-cleanup-neu16i*
*No contracts modified. Documentation-only.*
*Prior registers: `docs/architecture/RESERVE_RUNTIME_GAP_REGISTER.md`, `docs/architecture/MONETARY_EXPANSION_CONSTRAINTS.md`*
*Prior report: `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md`*
