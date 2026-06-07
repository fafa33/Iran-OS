# Monetary Expansion Constraints — Architecture Formalization (Step-45)

## Scope and Non-Goals

This document is a **documentation-only** formalization of Monetary Expansion Constraints for IranOS. It defines monetary expansion eligibility, prohibited expansion paths, reserve-ratio protection, liquidity-cap protection, and the trigger conditions for a reserve-ratio breach and a liquidity-cap breach.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event — including `PahlaviToken.sol`'s `mint`, `burn`, `updateReserves`, `reserveCompliant` modifier, `MAX_SUPPLY`, `MIN_RESERVE_RATIO`, `currentReserveRatio`, `remainingMintCapacity`, `emergencyMode`, and role wiring (`MINTER_ROLE`, `BURNER_ROLE`, `KERNEL_ROLE`, `PAUSER_ROLE`).
- Any threshold, multi-sig requirement, or timeout constant.
- Any role, modifier, or access-control assumption.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` — expressed in `PahlaviToken.sol` as `MAX_SUPPLY = 900_000_000_000 * 1e18` and `MIN_RESERVE_RATIO = 333`, and in `kernel.sol` as `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO`. These are the same constitutional constants restated at two contract surfaces; this document treats them as one doctrine pair.

This document is a **direct extension** of, and is subordinate to:

- [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) — reserve, treasury, SWF classes and eligibility.
- [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) — accounting boundaries, recognition rules, prohibited treatments.
- [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) — authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries.
- [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) — classification states, lifecycle transitions, eligibility tests, declassification rules, double-counting prevention.

Where this document narrows those four into **monetary-expansion-specific** constraints, it must be read together with them, not as a replacement. None of Step-41/42/43/44 is modified by this document. Where any apparent conflict arises, those documents and the underlying contracts/protocols remain authoritative.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Source of Truth | Status Here |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 * 1e18` (900 billion Pahlavi) | `contracts/kernel.sol` (`LIQUIDITY_CAP`), `contracts/monetary/PahlaviToken.sol` (`MAX_SUPPLY`) | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle-submitted reserve/price/production data informs review and feeds `updateReserves`, but cannot itself mint, burn, or authorize expansion | `contracts/oracles/API3Oracle.sol`, `contracts/monetary/PahlaviToken.sol` (`updateReserves` is `onlyKernel`, not oracle-callable directly) | Preserved — restated and applied to expansion |
| Reclaimed assets are not automatic backing | A reclaimed asset must be routed to the SWF and pass reserve-eligibility tests before it can ever factor into `totalReserves` / backing computation | [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md), `contracts/reclaim/AssetFreeze.sol` | Preserved — restated and applied to expansion |
| Frozen assets are not reserve assets | An asset in `Active`/`UnderReview` status cannot contribute to `totalReserves` or any backing computation that gates `mint` | `contracts/reclaim/AssetFreeze.sol`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) | Preserved — restated and applied to expansion |
| Welfare/wage obligations are not monetary backing | `CitizenCard.sol` eligibility records and the off-chain 1,000 Pahlavi minimum wage obligation are not assets, are not reserves, and cannot be counted in `totalReserves` or any expansion-eligibility computation | `contracts/welfare/CitizenCard.sol`, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) | Preserved — restated and applied to expansion |

Every eligibility rule, prohibition, protection mechanism, and trigger condition defined below is subordinate to these five doctrine elements. Nothing in this document may be read as a way to satisfy, approximate, or route around any of them — and nothing here proposes a value, formula, or path that would alter `MAX_SUPPLY`, `MIN_RESERVE_RATIO`, or the `reserveCompliant` check already encoded in `PahlaviToken.sol`.

---

## What "Monetary Expansion" Means in This Model

Consistent with [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md), **Monetary Expansion** is any minting, issuance, or supply increase that changes circulating Pahlavi balance or monetary obligations. In the existing system, the sole on-chain expansion mechanism is `PahlaviToken.mint()`, which:

- Is restricted to `MINTER_ROLE` (granted only to the Sovereign Wealth Fund address).
- Is blocked entirely while `emergencyMode` is active (`notInEmergency`).
- Is gated by the `reserveCompliant` modifier, which independently enforces (a) `totalSupply() + amount <= MAX_SUPPLY` and (b) `(totalReserves * 1000) / newSupply >= MIN_RESERVE_RATIO`.
- Requires a non-empty `reason` string for public transparency, and emits `PahlaviMinted`.

This document does not propose any new minting path, any new minter, or any new bypass of `reserveCompliant`. It formalizes, at the architecture-documentation level, the conditions under which an expansion *should* be considered eligible, the conditions under which it must be considered prohibited, how reserve-ratio and liquidity-cap protections relate to the existing `reserveCompliant` check, and the conditions that constitute a breach worth flagging through governance and trigger review.

---

## Monetary Expansion Eligibility

A proposed monetary expansion (mint) is eligible to proceed only if **all** of the following hold. These conditions are a documentation-level restatement and extension of what `reserveCompliant` already enforces on-chain, combined with the classification and authority constraints from Steps 41–44:

1. **Authorized Minter Test**: the call originates from an address holding `MINTER_ROLE` — in the current system, exclusively the Sovereign Wealth Fund contract address (`sovereignWealthFund`), as wired in the `PahlaviToken` constructor and maintained through `setSovereignWealthFund`. No other layer (Kernel, TriggerProtocol, Jury, Citizen Layer, Oracle Layer, Treasury directly) is an eligible minter.
2. **Non-Emergency Test**: `emergencyMode` is `false`. An expansion proposed, computed, or queued while the system is in emergency mode is not eligible — it must wait for `deactivateEmergencyMode()` (itself `PAUSER_ROLE`/Kernel-gated) before becoming eligible again. This preserves the Kernel's emergency-lock authority over monetary policy described in [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md).
3. **Liquidity-Cap Headroom Test**: `totalSupply() + amount <= MAX_SUPPLY` (i.e., `<= LIQUIDITY_CAP`). Equivalent to checking that `amount <= remainingMintCapacity()`. There is no scenario, justification, or governance override under which an expansion may be eligible while violating this inequality.
4. **Reserve-Ratio Sufficiency Test**: after the proposed expansion, `(totalReserves * 1000) / (totalSupply() + amount) >= MIN_RESERVE_RATIO`. This is the same inequality `reserveCompliant` evaluates; this document does not propose a different formula, rounding rule, or threshold.
5. **Reserve-Eligibility Test (cross-reference to Step-44)**: the `totalReserves` figure that the ratio test relies upon must itself be composed only of value that has passed the Eligibility Tests for Reserve Recognition defined in [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) — i.e., value in Sovereign Reserve State, properly classified, non-frozen, non-welfare, single-custodied, and conservation-consistent. An expansion computed against an inflated, double-counted, or improperly-classified reserve figure is not eligible even if the raw arithmetic of the ratio test would pass.
6. **Authorized Origin and Purpose Test**: the expansion carries a non-empty, auditable `reason` (as already required by `mint`), and that reason traces to an authorized governance purpose consistent with the constitution and the relevant monetary protocol — not to an arbitrary or undisclosed purpose.
7. **Conservation Test**: the expansion is a genuine increase in recognized circulating supply matched by a genuine, already-recognized increase in eligible reserve backing — it does not "create" backing concurrently with, or as a consequence of, the expansion itself (see Prohibited Expansion Paths, "Self-Referential Backing").

An expansion that fails any single test is not eligible. There is no "partial" or "discounted" expansion — eligibility, like reserve classification, is binary at the level of a given proposed mint.

---

## Prohibited Expansion Paths

The following expansion paths are prohibited outright. None may be performed under any governance configuration, optimization rationale, or emergency justification this document is aware of:

- **Unauthorized Minting**: any mint attempt by an address other than the holder of `MINTER_ROLE` (the SWF address). This is already enforced by `onlyRole(MINTER_ROLE)`; this document restates it as a doctrine-level prohibition, not merely an access-control detail.
- **Emergency-Mode Minting**: any mint attempt while `emergencyMode` is `true`, or any governance proposal to add a special "emergency mint" carve-out to `notInEmergency`. The emergency lock is, per [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) and the Kernel design, intentionally biased toward caution — it must remain a hard stop on monetary expansion, not a configurable one.
- **Liquidity-Cap Override**: any mint, batching of mints, or "deferred accounting" scheme that would cause `totalSupply()` to exceed `MAX_SUPPLY` / `LIQUIDITY_CAP`, whether immediately or after a delay. There is no "temporary excess to be burned down later" path — the cap is checked, and must remain checked, at the moment of every mint.
- **Reserve-Ratio Override or Averaging**: any mint that would push the instantaneous post-mint ratio below `MIN_RESERVE_RATIO`, including schemes that attempt to justify a temporary dip by reference to a projected future reserve increase, a historical average ratio, or an oracle-forecasted valuation. The ratio test is evaluated against the actual `totalReserves` and actual `newSupply` at mint time — not a forecast, an average, or an intention.
- **Self-Referential Backing**: minting Pahlavi and then classifying the newly-minted Pahlavi itself (or assets acquired using it in the same authorized sequence) as part of `totalReserves` to retroactively justify the mint that created it, or to enable a subsequent mint. Backing must be eligible reserve value that exists independently of, and prior to, the expansion it backs.
- **Oracle-Triggered or Oracle-Authorized Minting**: any path by which an oracle data submission (price, production, reserve valuation, or any other signal) directly causes, authorizes, or triggers a mint without an intervening Kernel/governance/SWF authorization step. `updateReserves` may *change the figure the ratio test is computed against*, but changing that figure is not itself a mint, does not itself authorize a mint, and remains `onlyKernel`-gated rather than oracle-callable. See "Oracle signals are non-sovereign."
- **Reclaimed-Asset-Triggered Minting**: any path by which the act of confirming a reclaim (`Confirmed`), or transferring a reclaimed asset to the SWF (`TransferredToSWF`), directly causes or authorizes a mint. A reclaimed asset must first complete the full Step-44 lifecycle — routing to SWF custody and passing the Eligibility Tests for Reserve Recognition — before it may even be counted toward `totalReserves`, let alone justify an expansion. See "Reclaimed assets are not automatic backing."
- **Frozen-Asset-Backed Minting**: any computation of `totalReserves`, or any mint-eligibility determination, that includes the estimated value of an asset currently in `Active` or `UnderReview` freeze status. See "Frozen assets are not reserve assets."
- **Welfare- or Wage-Backed Minting**: any expansion justified, in whole or in part, by reference to citizen welfare program scale, projected wage-payment volume, `CitizenCard.sol` eligibility counts, or any other welfare/wage-derived figure. Monetary backing and welfare administration are structurally separate domains; neither may be used to justify action in the other. See "Welfare/wage obligations are not monetary backing."
- **Bypassing `reserveCompliant` via Alternate Entry Points**: any proposal to introduce a second mint function, an admin override, an emergency mint bypass, or a "trusted batch" path that does not route through the existing `reserveCompliant` check. Per the project's "no admin backdoors" rule and the Kernel's immutable-constants design, any such path is a security concern, not an optimization.
- **Replay or Duplicate Minting**: re-emitting, replaying, or duplicating a previously-executed `PahlaviMinted` event or mint transaction to produce a second supply increase from a single authorized decision. Each authorized expansion decision must produce exactly one supply increase, exactly once.

---

## Reserve-Ratio Protection

Reserve-ratio protection is the set of properties that keep circulating Pahlavi supply from outrunning its 33.3% backing floor (`MIN_RESERVE_RATIO = 333`):

- **The ratio is computed instantaneously, not aspirationally.** `currentReserveRatio()` and the `reserveCompliant` check both compute `(totalReserves * 1000) / supply` against the *current* `totalReserves` and the *prospective* `newSupply` — not a smoothed, averaged, or forecast figure. This document preserves that instantaneous-evaluation property and does not propose any smoothing, deferral, or netting that would weaken it.
- **`totalReserves` must be composed only of doctrine-eligible value.** Per the Reserve-Eligibility Test above and [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md), the figure feeding the ratio computation must be traceable to properly-classified Sovereign Reserve State value — excluding frozen assets, unrouted reclaimed assets, welfare/wage figures, and any double-counted Treasury/SWF overlap. Reserve-ratio protection is only as strong as the integrity of the number it is computed against; this document makes that dependency explicit so that future audits check both the arithmetic *and* the composition of `totalReserves`.
- **The floor is a hard minimum, not a target to approach.** `MIN_RESERVE_RATIO = 333` represents the *lowest* acceptable post-mint ratio — it is not a midpoint, average, or "comfortable operating range" that the system aims to hover near from below. Any expansion that would bring the ratio to exactly the floor or above remains subject to the other eligibility tests in this document; any expansion that would bring it below the floor is ineligible without exception.
- **Ratio protection is independent of, and in addition to, the liquidity cap.** Passing the cap test does not imply passing the ratio test, and vice versa — `reserveCompliant` evaluates both independently, and this document preserves that independence. A proposal that satisfies one but not the other remains ineligible.
- **Reserve updates (`updateReserves`) are Kernel-gated, not self-reported.** The figure that ratio protection depends on is updated only through the Kernel-mediated path already defined (oracle data flows to the Kernel, which then calls `updateReserves`), preserving the "oracle signals are non-sovereign" doctrine — the oracle informs; the Kernel records; the contract enforces.

---

## Liquidity-Cap Protection

Liquidity-cap protection is the set of properties that keep circulating Pahlavi supply from ever exceeding the constitutional ceiling (`LIQUIDITY_CAP` / `MAX_SUPPLY = 900,000,000,000 × 1e18`):

- **The cap is absolute and immutable.** `MAX_SUPPLY` is a `constant` in `PahlaviToken.sol`, mirroring the immutable `LIQUIDITY_CAP` in `kernel.sol`. Per [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) Key Design Decisions, no "fix," governance vote, emergency measure, or upgrade may change this value — any change would require an entirely new deployment and, by the Kernel's design philosophy, a constitutional-level decision, not a protocol or architecture-level one.
- **The cap check is additive and pre-execution.** `reserveCompliant` checks `totalSupply() + amount <= MAX_SUPPLY` *before* the mint executes — preventing the cap from ever being momentarily exceeded, even transiently within a single transaction. This document preserves that pre-execution, additive-check property and proposes no path that would check the cap after the fact, in aggregate, or on a delay.
- **`remainingMintCapacity()` is the authoritative headroom figure.** Any governance discussion of "how much more can be minted" should reference `MAX_SUPPLY - totalSupply()` directly (as the existing read function already computes), not an estimate, a rounded figure, or a planning-horizon projection. Liquidity-cap protection depends on always checking against the exact remaining headroom at the moment of the proposed mint.
- **The cap applies to total circulating supply, not to any subcomponent.** It is not possible to "reserve headroom" for a particular purpose, province, or time period in a way that would let aggregate supply exceed `MAX_SUPPLY`. The cap is a single, system-wide ceiling on `totalSupply()`.
- **Cap protection and ratio protection do not trade off against each other.** Being well under the liquidity cap does not relax the reserve-ratio requirement, and having an excellent reserve ratio does not create headroom beyond the cap. Both protections must hold simultaneously for every proposed expansion.

---

## Trigger Conditions: Reserve-Ratio Breach

A **reserve-ratio breach condition** is any state in which the recognized reserve ratio would fall (or has fallen) below `MIN_RESERVE_RATIO = 333`. This document defines, at the architecture level, when such a condition should be recognized as breach-relevant for governance and trigger review — without altering the Kernel's existing TR-01..TR-06 trigger codes, the multi-sig activation flow, or `TRIGGER_TIMEOUT`:

- **Pre-Mint Detection (preventive)**: `reserveCompliant` already prevents any individual mint from *creating* a sub-floor ratio. This is the primary, contract-enforced line of defense and this document changes nothing about it.
- **Post-Update Detection (monitoring)**: a breach-relevant condition is recognized when, *after* an authorized `updateReserves` call (e.g., reflecting a genuine drop in real-world reserve valuation, a confirmed loss, or a reclassification/declassification event under [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md)), the resulting `currentReserveRatio()` would be below `MIN_RESERVE_RATIO` for the *existing* `totalSupply()` — even though no new mint occurred. This is a state the contract can reach (since `updateReserves` is not itself ratio-gated) and is therefore a condition this formalization explicitly names as breach-relevant.
- **Composition-Integrity Detection (audit-triggered)**: a breach-relevant condition is also recognized when an audit, invariant check, or governance review determines that the `totalReserves` figure *currently in use* includes value that should not have been eligible — e.g., later-frozen assets, unrouted reclaimed assets, double-counted SWF/Treasury balances, or welfare/wage-derived figures (per the Reserve-Eligibility Test and the doctrine table above). Even if the on-chain ratio arithmetic currently "passes," a composition-integrity finding is itself a breach-relevant condition requiring governance attention and correction of the underlying figure.
- **Required Response Direction (without prescribing new mechanisms)**: upon recognizing a reserve-ratio breach-relevant condition, the appropriate response is to (a) immediately treat further expansion as ineligible (the existing `reserveCompliant` check already enforces this for new mints), (b) route the condition through the existing violation-flagging and Kernel/Court review channels described in [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) — consistent with TR-05 (SWF independence) and TR-06 (liquidity cap) violation categories already defined in `kernel.sol` — and (c) correct the underlying reserve composition or pursue burn/contraction (`burn`, already `BURNER_ROLE`-gated) rather than attempting to "grow into" compliance through further expansion. This document does not create a new trigger code, a new violation category, or a new automatic-response mechanism; it documents how an already-defined breach concept (TR-06 and the broader reserve-independence doctrine) maps onto the reserve-ratio condition for monitoring and governance-review purposes.

---

## Trigger Conditions: Liquidity-Cap Breach

A **liquidity-cap breach condition** is any state in which circulating Pahlavi supply would reach, or has reached, `MAX_SUPPLY` / `LIQUIDITY_CAP = 900,000,000,000 × 1e18`. This document defines, at the architecture level, when such a condition is breach-relevant:

- **At-Cap Detection (boundary awareness)**: a condition is recognized as cap-relevant the moment `remainingMintCapacity()` reaches zero — i.e., `totalSupply() == MAX_SUPPLY`. This is not itself a violation (the cap permits supply to *equal* `MAX_SUPPLY`), but it is the boundary state at which **all** further expansion becomes categorically ineligible regardless of reserve ratio, authorization, or purpose. Governance and monitoring should treat "at cap" as a structurally significant state requiring acknowledgment that the expansion mechanism is now fully exhausted.
- **Attempted-Breach Detection (preventive, contract-enforced)**: any mint attempt where `totalSupply() + amount > MAX_SUPPLY` is already rejected by `reserveCompliant` ("PAH: exceeds liquidity cap"). This is the primary, contract-enforced line of defense, and this document changes nothing about it. A *pattern* of repeated attempted-breach mint calls (e.g., from the SWF address proposing amounts that would exceed remaining headroom) is itself a condition worth surfacing for governance review — not because the contract fails to block it, but because repeated attempts may indicate a process, configuration, or proposal-review failure upstream of the contract check.
- **Required Response Direction (without prescribing new mechanisms)**: a liquidity-cap breach-relevant condition (whether "at cap" or "attempted breach") should be routed through the existing violation-flagging and Kernel/Court review channels, consistent with TR-06 (`TR_LIQUIDITY_CAP`) as already defined in `kernel.sol`. As with reserve-ratio conditions, this document does not create a new trigger code, a new threshold, or a new automatic-response mechanism — it documents how the already-defined TR-06 violation category maps onto the liquidity-cap condition for monitoring and governance-review purposes. The only contraction mechanism this document recognizes is the existing `burn` path (`BURNER_ROLE`-gated, SWF-held), used deliberately and transparently (with a required `reason`), never as an automatic or implicit response to a breach condition.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Constraint Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` / `MAX_SUPPLY` doctrine | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` |
| Mint/burn mechanics, `reserveCompliant`, emergency mode | `contracts/monetary/PahlaviToken.sol` |
| Reserve, treasury, SWF class definitions and eligibility | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) |
| Accounting boundaries, recognition rules, prohibited treatments | [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) |
| Layer authority, data-flow, trigger-flow, freeze-routing boundaries | [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) |
| Classification states, lifecycle transitions, eligibility tests, double-counting prevention | [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) |
| TR-05 (SWF independence), TR-06 (liquidity cap), trigger lifecycle | `contracts/kernel.sol`, `contracts/core/TriggerProtocol.sol` |
| Reclaimed asset lifecycle and freeze routing | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Oracle signal boundaries and reserve-update path | `contracts/oracles/API3Oracle.sol`, `contracts/monetary/PahlaviToken.sol` (`updateReserves`, `onlyKernel`) |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol` |

Where this document and a contract, protocol, or a prior architecture formalization (Step-41/42/43/44) appear to differ, the contract, protocol, and prior formalizations remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document defines monetary expansion eligibility (authorized minter, non-emergency, liquidity-cap headroom, reserve-ratio sufficiency, reserve-eligibility composition, authorized origin/purpose, and conservation), prohibited expansion paths (unauthorized minting, emergency-mode minting, cap and ratio overrides, self-referential backing, oracle- or reclaim-triggered minting, frozen-asset- or welfare-backed minting, bypass paths, and replay), reserve-ratio protection and liquidity-cap protection (both framed as restatements and compositional dependencies of the existing `reserveCompliant` check in `PahlaviToken.sol`), and trigger conditions for both a reserve-ratio breach and a liquidity-cap breach — mapped onto the already-defined TR-05/TR-06 violation categories without introducing any new trigger code, threshold, timeout, or automatic-response mechanism. It explicitly preserves `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18`, the non-sovereignty of oracle signals, the non-automatic backing status of reclaimed assets, the exclusion of frozen assets from reserve recognition, and the structural separation of welfare/wage obligations from monetary backing. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
