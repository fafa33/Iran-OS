# DG-01 Authority Boundary Review

## Scope and Non-Goals

This document records the authority design review for DG-01 (SWF COUNCIL_ROLE persists after trigger activation). It evaluates four candidate design paths before any implementation is attempted.

**This document is documentation only.** It does not change contracts, tests, thresholds, trigger codes, or governance assumptions. It does not close Step-12 or Step-13. It does not claim readiness or sign-off.

### Reference

| Item | Detail |
|---|---|
| Gap | DG-01 — SWF COUNCIL_ROLE not revoked on trigger activation |
| Contract | `TriggerProtocol.sol` lines 58–75; `kernel.sol` lines 318–374 |
| Test baseline | `test/08_Trigger_Protocol.test.js` — `"trigger activation revokes offender kernel role and preserves SWF COUNCIL_ROLE as design-boundary fact"` (commit `bc647b1`) |
| Status | Open |
| Prior classification | CONFIRMED GAP, P1, artifact: contract |

---

## The Problem

When trigger activation fires (7-of-9 multi-sig path):

1. `Kernel._revokeOfficialAccess()` revokes kernel-internal roles (COURT, GUARDIAN, ORACLE, SOVEREIGN).
2. `TriggerProtocol.executeTrigger()` sets `Treasury.blockedByTrigger[offender] = true`.
3. **Nothing touches `SovereignWealthFund` AccessControl.** An offender holding `COUNCIL_ROLE` in SWF retains it.

Post-trigger, the offender can still call:
- `depositToL1/2/3()` — add to reserve balances
- `proposeWithdrawal()` — initiate a withdrawal proposal (counts as 1 of 3 required signatures)
- `signWithdrawal()` — contribute a signature toward threshold (alone, cannot reach MULTISIG_REQUIRED=3)
- `distributeAnnualYield()` — trigger L2→L1 yield transfer

The offender **cannot alone execute a withdrawal** because `MULTISIG_REQUIRED = 3` requires two additional council co-signers. This bounds the practical harm window.

---

## Option A — Keep Current Behavior; Document Boundary

### Benefit

Zero implementation risk. The trigger path is not modified. No new reentrancy surface is introduced. The constitutional trigger mechanism remains isolated from SWF governance. Sovereign retains full control of SWF COUNCIL_ROLE through existing `DEFAULT_ADMIN_ROLE` paths. Human governance can revoke the offender's COUNCIL_ROLE as a separate post-trigger step without any contract change.

### Risk

The enforcement perimeter is incomplete. Between trigger activation and a manual COUNCIL_ROLE revocation, the offender retains SWF operational access. The window duration depends entirely on governance responsiveness.

### Abuse Prevented

None beyond current state. Treasury is blocked; SWF is not.

### Abuse Introduced

None. This is the existing behavior.

### Compatibility with Human Freeze Authority

Fully compatible. All SWF authority changes remain under human governance control.

### Implementation Complexity

Zero. Documentation only.

### Recommended Decision

No — acceptable only as a permanent documentation record if no contract change is ever pursued. It does not close the gap; it accepts it.

---

## Option B — Trigger Also Revokes SWF COUNCIL_ROLE Automatically

### Benefit

Complete post-trigger enforcement perimeter. Offender loses both kernel roles and SWF operational access in the same atomic transaction. No governance lag window.

### Risk

**Critical: trigger revert risk.** If `executeTrigger()` calls SWF and the call fails for any reason (role already revoked, SWF address misconfigured, SWF paused, SWF contract upgraded), the entire trigger transaction reverts. The 7-of-9 multi-sig threshold crossing that activates the trigger would have no effect. A determined offender could misconfigure or manipulate the SWF address relationship to prevent their own trigger activation. This is a **P0 constitutional risk** — it could make the trigger mechanism unreliable.

**Authority model concern.** `TR-05` is specifically `استقلال صندوق ثروت ملی` (SWF Independence). Automated code reaching into SWF to revoke membership could itself be read as a violation of SWF independence — automating a decision that constitutional design assigns to the Sovereign, not to a trigger algorithm.

**New interface required.** TriggerProtocol would need a callable method on SWF for role revocation, guarded by an authority that TriggerProtocol holds. This expands TriggerProtocol's authority surface into SWF governance.

### Abuse Prevented

Post-trigger SWF operational access by the offender.

### Abuse Introduced

New authority surface: TriggerProtocol → SWF role management. Trigger revert path: malicious offender or misconfigured SWF address could block trigger activation.

### Compatibility with Human Freeze Authority

Partially compatible. Automates an SWF membership decision that was previously in human hands. Reduces human judgment in a domain (SWF governance) where constitutional design emphasizes independence.

### Implementation Complexity

Medium-high. Requires: new SWF interface function, authority grant to TriggerProtocol in SWF, failure-isolation so SWF revert does not block trigger, reentrancy audit of the cross-contract path.

### Recommended Decision

No — the trigger revert risk alone disqualifies this option. The trigger mechanism must be robust against any downstream call failure. This option introduces a path by which trigger activation could be blocked.

---

## Option C — Add Separate SWF Blocklist (Mirror Treasury Pattern)

### Benefit

Mirrors the Treasury `blockedByTrigger` pattern. Does not revoke COUNCIL_ROLE but adds a separate flag that blocks the offender from calling COUNCIL_ROLE-gated SWF functions. More surgical than Option B: the role is preserved (for auditing or later reinstatement) but rendered inoperable. Blocklist can be lifted by governance without re-granting the role.

### Risk

**Same trigger revert risk as Option B.** The cross-contract call from TriggerProtocol to set the SWF block flag shares the same failure mode: if the call reverts, the trigger reverts. The fundamental P0 constitutional risk is unchanged.

**Additional SWF contract scope.** All COUNCIL_ROLE-gated functions in SWF would need a new `notBlockedByTrigger(msg.sender)` modifier, adding modifier logic to six functions (`depositToL1`, `depositToL2`, `depositToL3`, `proposeWithdrawal`, `signWithdrawal`, `distributeAnnualYield`).

### Abuse Prevented

Same as Option B: post-trigger SWF operations by the offender.

### Abuse Introduced

Same as Option B: trigger revert risk from cross-contract call; new authority surface.

### Compatibility with Human Freeze Authority

Better than Option B: role is not revoked, so reinstatement requires no re-granting. Compatible with the principle that SWF membership decisions stay in human hands.

### Implementation Complexity

Medium. Requires: SWF blocklist storage and modifier, TriggerProtocol interface change, authority grant, failure-isolation requirement (same as Option B).

### Recommended Decision

No — shares the critical trigger revert risk of Option B. The blocklist approach is architecturally cleaner than Option B but does not resolve the fundamental problem that any cross-contract call from within the trigger path creates a revert surface that can block trigger activation.

---

## Option D — Human/Council Review Before SWF Authority Removal

### Benefit

Preserves human judgment for the specific act of revoking SWF COUNCIL_ROLE. Trigger activation proceeds exactly as today. Immediately after activation, the Sovereign (who holds `DEFAULT_ADMIN_ROLE` in SWF) can revoke the offender's COUNCIL_ROLE as a separate governance step using the existing OpenZeppelin `revokeRole()` path — no contract change needed.

The practical harm window is structurally bounded by `MULTISIG_REQUIRED = 3`: the offender alone cannot execute any withdrawal (needs 2 additional co-signers). They can propose a withdrawal and contribute 1 of 3 signatures, but cannot cross the execution threshold alone.

The trigger path remains isolated, atomic, and unconditionally reliable. No cross-contract call can block or revert trigger activation. TR-05 (SWF Independence) is respected: SWF membership changes remain under Sovereign/governance authority, not automated enforcement code.

### Risk

A governance lag window exists between trigger activation and manual COUNCIL_ROLE revocation. During this window the offender can: deposit (increases SWF balances, not harmful), propose a withdrawal (counts as 1 of 3 signatures only), attempt to sign existing proposals (increases count toward threshold if others co-sign).

### Abuse Prevented

The multi-sig floor limits practical abuse. A single blocked offender cannot unilaterally move assets from SWF without two additional council co-signers. Co-signers who participate in executing a withdrawal in favor of a trigger-activated offender are themselves accountable under governance.

### Abuse Introduced

None. This is the current behavior plus a documented governance procedure.

### Compatibility with Human Freeze Authority

Maximally compatible. SWF membership decisions remain entirely in human governance hands. Consistent with the constitutional principle that the Sovereign (not trigger automation) governs SWF council composition.

### Implementation Complexity

Zero for contracts. Requires a governance process record (this document) and operational guidance that Sovereign should revoke offender's SWF COUNCIL_ROLE immediately following any trigger activation.

### Recommended Decision

**Yes — Option D is the recommended path.**

---

## Recommended Decision: Option D

### Rationale

1. **Trigger revert risk eliminates Options B and C.** Any cross-contract call inside the trigger activation path creates a revert surface. If the SWF call fails for any reason, the constitutional trigger mechanism fails. This is an unacceptable P0 risk. Options B and C both share this disqualifying property.

2. **Option A accepts the gap permanently.** Option A is only appropriate as a temporary holding record. It does not reduce the risk window.

3. **Option D closes the gap through process, not automation.** The Sovereign holds `DEFAULT_ADMIN_ROLE` in SWF and can call `revokeRole(COUNCIL_ROLE, offender)` at any time. This path requires no contract change and is immediately available post-trigger.

4. **MULTISIG_REQUIRED=3 bounds the harm window.** The offender cannot execute any SWF withdrawal alone. Proposing a withdrawal and adding one signature is the limit of single-actor SWF harm during the window.

5. **TR-05 compatibility.** SWF independence means SWF council composition should be governed by human authority, not automated enforcement algorithms. Option D preserves this principle.

### Required Operational Record

Following any trigger activation, the Sovereign must:

1. Identify all `COUNCIL_ROLE` holders in `SovereignWealthFund` who are also the trigger offender.
2. Call `SovereignWealthFund.revokeRole(COUNCIL_ROLE, offender)` using the `DEFAULT_ADMIN_ROLE` path.
3. Emit or record the governance action for public auditability.

This process does not require a contract change. It is an operational governance obligation that follows from trigger activation.

---

## Unresolved Risks

The following risks remain after selecting Option D and are not resolved by this document:

1. **Governance response latency.** The time between trigger activation and manual COUNCIL_ROLE revocation is not bounded by any contract constraint. If the Sovereign is unavailable or delayed, the window extends.

2. **Co-signer collusion.** If two other COUNCIL_ROLE holders co-sign a withdrawal proposed by the trigger-activated offender during the window, a withdrawal could execute. This requires active participation by additional governance actors and is itself a trigger-eligible governance violation.

3. **SWF DEFAULT_ADMIN availability.** If the Sovereign address is compromised or unavailable, the manual revocation path is blocked. This is a pre-existing governance dependency, not new to DG-01.

4. **DG-01 remains open for future contract review.** If a future design resolves the trigger revert risk (e.g., via a separate post-trigger administrative transaction rather than an inline call), Options B or C could be reconsidered at that time without the P0 constraint.

---

## Resolution Status

| Item | Status |
|---|---|
| DG-01 contract gap | Open — no contract change authorized |
| Design decision | Option D selected — governance process, not automation |
| Operational obligation | Sovereign revokes SWF COUNCIL_ROLE post-trigger (existing path) |
| Step-12 | Remains open |
| Step-13 | Remains open |

---

*DG-01 Authority Boundary Review*
*Branch: `claude/step15-potential-gaps-cUVbj`*
*Reference commit: `62bf502`*
*Date: 2026-05-29*
