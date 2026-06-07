# Reserve Classification Protocol — Architecture Formalization (Step-44)

## Scope and Non-Goals

This document is a **documentation-only** formalization of the Reserve Classification Protocol for IranOS. It defines the discrete classification states a balance may hold, the lifecycle transitions permitted between Treasury, Sovereign Reserve, the Sovereign Wealth Fund (SWF), Frozen Assets, Reclaimed Assets, and Non-Reserve Assets, the eligibility tests a balance must pass to be recognized as Sovereign Reserve, the rules governing declassification, the reclassification paths that are prohibited outright, and the safeguards that prevent double-counting across Treasury, Reserve, and SWF.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant (including `MULTISIG_THRESHOLD = 7`, `MULTISIG_REQUIRED = 3`, `COUNCIL_THRESHOLD = 3`, `TRIGGER_TIMEOUT = 72 hours`, `INTERIM_REPLACEMENT_DELAY = 24 hours`).
- Any role, modifier, or access-control assumption.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (900 billion Pahlavi).
- Any UI, citizen-facing application surface, or display logic.

This document is a **direct extension** of, and is subordinate to:

- [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) — defines reserve, treasury, and SWF classes and baseline eligibility/non-eligibility.
- [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) — defines treasury asset classes, accounting boundaries, recognition rules, and prohibited accounting treatments.
- [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) — defines which layers may interact, and the authority/data/accounting/trigger/freeze-routing boundaries between them.

Where this document narrows those three into a **classification lifecycle and protocol**, it must be read together with them, not as a replacement. None of Step-41/42/43 is modified by this document. Where any apparent conflict arises, Step-41/42/43 and the underlying contracts/protocols remain authoritative.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Source of Truth | Status Here |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` | `900_000_000_000 * 1e18` (900 billion Pahlavi) | `contracts/kernel.sol` | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle data informs review; it cannot classify, reclassify, freeze, release, mint, burn, or transfer | `contracts/oracles/API3Oracle.sol`, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md), [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) | Preserved — restated and applied to classification |
| Frozen assets are not reserve assets | An asset in `Active`/`UnderReview` status counts in no domain's recognized balance | `contracts/reclaim/AssetFreeze.sol`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) | Preserved — restated and applied to classification |
| Reclaimed assets do not become backing automatically | Only a `Confirmed → TransferredToSWF` transition credits the SWF; no reclaim event auto-classifies as reserve backing | `contracts/reclaim/AssetFreeze.sol`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) | Preserved — restated and applied to classification |
| Citizen welfare and wage obligations are not reserve assets | `CitizenCard.sol` manages eligibility/status only; the 1,000 Pahlavi minimum wage is an off-chain employer obligation | `contracts/welfare/CitizenCard.sol`, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) | Preserved — restated and applied to classification |

Every state, transition, and test defined below is subordinate to these five doctrine elements. No classification rule in this document may be read as a way to satisfy, approximate, or route around any of them.

---

## Reserve Classification States

A balance, asset, or value unit recognized anywhere in the system is, at any given moment, in **exactly one** of the following classification states. These states are a refinement of the domains already defined in Step-41 ([SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md)) and Step-42 ([TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md)) into a state-machine view suitable for lifecycle description:

1. **Non-Reserve Treasury State**: recognized treasury value that has not been classified as reserve backing. Real, accounted-for, auditable — but excluded from `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` computation. Corresponds to "Non-Reserve Treasury Assets" in Step-42.
2. **Pending Classification State**: a balance that has been proposed for reserve classification (or declassification) but has not yet completed the required governance/authorization path. It is neither counted as reserve backing nor released back to unambiguous Non-Reserve status until the pending action resolves.
3. **Sovereign Reserve State**: value formally classified as reserve backing and counted toward `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP`. This state subsumes the reserve sub-classes already defined in Step-41 (Locked, Deployable, Emergency, Encumbered Reserve) — each is a *sub-state* of Sovereign Reserve State, not a separate top-level classification state.
4. **SWF Custodial State**: value held within an SWF layer (`layerL1`/`layerL2`/`layerL3`) under `SovereignWealthFund.sol`. As described in Step-42 (Reserve ↔ SWF boundary), a unit of value may be simultaneously in Sovereign Reserve State (classification) and SWF Custodial State (custody) — but it must resolve to exactly one custodial record and be counted toward doctrine exactly once.
5. **Frozen State**: an asset under `AssetFreeze.Active` or `AssetFreeze.UnderReview` status. A **suspended** classification state — the asset is not Treasury, not Reserve, not SWF, and not yet Reclaimed in the recognized sense. It counts toward no domain's balance and toward no doctrine computation.
6. **Reclaimed State**: an asset that has reached `AssetFreeze.Confirmed` status but has not yet completed its routing to a final destination. It is recognized as "recovered" but is **not yet** Sovereign Reserve, SWF Custodial, or Non-Reserve Treasury value — it remains in a distinct, transitional recognition state until routed.
7. **Released State**: an asset that has completed the `Confirmed → Released` path, returned to its prior owner/domain. It exits the reserve-classification system entirely and is not counted in any IranOS-recognized domain.
8. **Non-Reserve, Non-Eligible State**: value or obligations that are recognized as existing (e.g., citizen welfare eligibility records, off-chain wage obligations) but are, by doctrine, permanently ineligible for any reserve, treasury, or SWF classification. This state is terminal with respect to the classification lifecycle — such items never enter it from a reserve-bearing state, and never transition out of it into one.

Every classification action — initial recognition, reclassification, or declassification — is a transition of a value unit from exactly one of these states to exactly one other (or to itself, in the case of a no-op review that changes nothing). No action may leave a unit in more than one state, or in no state.

---

## Lifecycle Transitions

This section enumerates the **permitted** transitions between Treasury, Sovereign Reserve, SWF, Frozen Assets, Reclaimed Assets, and Non-Reserve Assets. A transition not listed here is **not** permitted under this protocol (see Prohibited Reclassification Paths).

### 1. Non-Reserve Treasury → Pending Classification → Sovereign Reserve

- A Non-Reserve Treasury balance may be proposed for reserve classification, entering Pending Classification State.
- It may complete the transition into Sovereign Reserve State only if it passes **all** Eligibility Tests for Reserve Recognition (below) and the action is authorized through the governance path already defined for the relevant layer (e.g., Council/Sovereign classification action consistent with [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) authority boundaries).
- If the eligibility tests fail, or authorization is not completed, the balance returns to Non-Reserve Treasury State — it does not default into Sovereign Reserve State by inaction, timeout, or ambiguity.

### 2. Sovereign Reserve → Pending Declassification → Non-Reserve Treasury

- Reserve-classified value may be proposed for declassification (e.g., because it no longer meets eligibility, or governance determines it should revert to general treasury use).
- It enters Pending Classification State (the same transitional state used for upward classification — direction is determined by the proposal, not by a separate state) and completes the transition to Non-Reserve Treasury State only upon authorized confirmation, per Declassification Rules (below).
- A balance does not silently fall out of Sovereign Reserve State; declassification is as deliberate and recorded an act as classification.

### 3. Sovereign Reserve ↔ SWF Custodial (classification and custody, not a domain change)

- As established in Step-42, Sovereign Reserve State (a classification) and SWF Custodial State (a custody record) may co-occur for the same unit of value — most commonly, SWF `layerL1`/`layerL2`/`layerL3` balances *are* the real-world expression of Sovereign Reserve.
- Movement of value into or out of SWF custody occurs only through the SWF's already-authorized entry points (`depositToL1/L2/L3`, `proposeWithdrawal`/`signWithdrawal` gated by `MULTISIG_REQUIRED = 3`, `distributeAnnualYield` for the L2 → L1 flow at `ANNUAL_YIELD = 150`).
- A deposit into the SWF does not, by itself, constitute reserve classification — the deposited value must independently satisfy the Eligibility Tests for Reserve Recognition to be counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`. Conversely, classifying a balance as Sovereign Reserve does not, by itself, move it into SWF custody — custody transitions remain governed by the SWF's own authorized paths.

### 4. Treasury/SWF → Frozen (suspension, not classification)

- An asset is moved into Frozen State only through `CRAWLER_ROLE`-initiated freezing (`AssetFreeze.Active`), as defined in [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Freeze-Routing Boundaries).
- Entering Frozen State is a **suspension**, not a reclassification: the asset's prior classification (Non-Reserve Treasury, Sovereign Reserve, or SWF Custodial) is held in abeyance, not erased, pending review — but for the duration of the freeze, the asset counts toward **no** domain's recognized balance and **no** doctrine computation (see "Frozen assets are not reserve assets" in Doctrine Constants and Properties above).
- `Active → UnderReview` remains within Frozen State; it is a sub-state transition, not an exit from Frozen State.

### 5. Frozen → Reclaimed → (SWF Custodial as Sovereign Reserve) or Released

- From Frozen State (`UnderReview`), an asset may reach `Confirmed` status only with `COUNCIL_THRESHOLD = 3` Council signatures, entering Reclaimed State.
- From Reclaimed State, exactly two routings are permitted:
  - **`Confirmed → TransferredToSWF`**: the asset is credited to the SWF exactly once. This is the *only* path by which a reclaimed asset may enter SWF Custodial State — and, per the doctrine "reclaimed assets do not become backing automatically," entering SWF custody through this path still requires the asset to independently pass the Eligibility Tests for Reserve Recognition before it is counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`. A reclaimed asset may sit in SWF Custodial State without (yet, or ever) being classified as Sovereign Reserve, if it does not pass those tests or has not yet been formally classified.
  - **`Confirmed → Released`**: the asset exits to Released State, returned to its prior owner/domain, `KERNEL_ROLE`-gated. It does not enter Treasury, Reserve, or SWF accounting at all.
- No other routing from Reclaimed State is permitted. An asset cannot move from Reclaimed State directly into Non-Reserve Treasury State, directly into Sovereign Reserve State without passing through SWF custody and eligibility testing, or back into Frozen State.

### 6. Non-Reserve, Non-Eligible → (no transitions into reserve-bearing states)

- Citizen welfare eligibility records and off-chain wage obligations originate, exist, and terminate entirely within the Non-Reserve, Non-Eligible State. No lifecycle transition defined in this protocol moves such an item into Non-Reserve Treasury, Pending Classification, Sovereign Reserve, SWF Custodial, Frozen, or Reclaimed State.
- This is not a gap to be closed by future protocol work — it is a permanent structural separation required by doctrine (see "Citizen welfare and wage obligations are not reserve assets").

---

## Eligibility Tests for Reserve Recognition

A balance may complete a transition into Sovereign Reserve State — and therefore be counted toward `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` — only if it passes **every** test below. These tests sharpen, but do not replace, the eligibility criteria already defined in Step-41:

1. **Origin Test**: the balance entered its current (pre-classification) state through an authorized path — Council deposit, confirmed reclaim transfer, oracle-fed revenue distribution already gated by existing contract logic, or another explicitly governance-approved channel. A balance of unverified or unauthorized origin fails this test unconditionally, regardless of its other properties.
2. **Non-Suspension Test**: the balance is not currently in Frozen State, and is not subject to an active dispute, hold, or pending claim that would make its availability ambiguous. A frozen or under-review asset fails this test by definition — it cannot be mid-classification and mid-freeze simultaneously.
3. **Single-Custody Test**: the balance resolves to exactly one custodial record (e.g., exactly one SWF layer entry, or exactly one Treasury ledger line) — never zero, never more than one. A balance that cannot be traced to a single, unambiguous custodial record fails this test.
4. **Conservation Test**: classifying the balance as reserve is matched by a corresponding debit from its prior state (Non-Reserve Treasury, Reclaimed, or external deposit accounting). The act of classification must not, on its own, increase total recognized value anywhere in the system.
5. **Doctrine-Bound Test**: recognizing the balance as Sovereign Reserve must not cause total recognized liquidity backing to exceed `LIQUIDITY_CAP`, and must not cause the system to misstate its standing relative to `MIN_RESERVE_RATIO`. A balance whose recognition would breach either constant fails this test and must remain (or revert to) Non-Reserve Treasury State, Reclaimed State, or SWF Custodial State without reserve classification — whichever is its last validly-recognized state — until the constraint is independently satisfiable.
6. **Sovereignty Test**: the classification action is performed by an authorized governance actor (Council, Sovereign, Kernel-recognized authority) — never by an oracle, automated feed, or any process that treats oracle data as a self-executing classification instruction. A classification whose sole basis is oracle-submitted data fails this test (see "Oracle signals are non-sovereign").
7. **Non-Welfare Test**: the balance is not, and is not derived from, a citizen welfare eligibility record or an off-chain wage obligation. Any balance traceable to those sources fails this test unconditionally (see "Citizen welfare and wage obligations are not reserve assets").
8. **Auditability Test**: the classification produces a traceable record consistent with existing event emissions and status transitions (`DepositToL1/L2/L3`, `WithdrawalProposed/Signed/Executed`, `AnnualYieldDistributed`, `AssetFreeze` status events, `Provincial` distribution records, or an equivalent governance record). A classification that would leave no auditable trace fails this test.

A balance that fails **any** single test does not become Sovereign Reserve. It remains in, or reverts to, its last validly-recognized non-reserve state. There is no "partial classification" — eligibility is binary at the level of a given unit of value.

---

## Declassification Rules

Declassification — the transition of a balance out of Sovereign Reserve State — is governed as deliberately as classification itself:

1. **Declassification is explicit and authorized.** A balance does not exit Sovereign Reserve State through inaction, the passage of time, a change in market conditions, or an oracle-reported valuation change. It exits only through an explicitly authorized governance action, following the same authority boundaries described in [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md).
2. **Declassification must preserve doctrine at the moment of the act.** A declassification that would cause recognized reserve backing to fall below the floor implied by `MIN_RESERVE_RATIO` must be flagged and resolved through governance review before being finalized — this document does not define an automated blocking mechanism (none exists in the contracts), but it records that such a declassification is a doctrine-relevant event requiring deliberate governance attention, not a routine bookkeeping action.
3. **Declassification is conservation-consistent.** The balance is debited from Sovereign Reserve State and credited to exactly one destination state — typically Non-Reserve Treasury State. No declassification may "vanish" value or create a duplicate record in both the old and new states.
4. **Declassification does not retroactively alter past doctrine computations.** A balance that was validly classified as reserve at time T, and later declassified at time T+1, was correctly counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` at time T. Declassification changes future counting; it does not rewrite historical recognition.
5. **Declassification does not bypass locks or encumbrances.** A Locked or Encumbered Reserve sub-state (per Step-41) cannot be declassified out from under its lock or encumbrance — the lock/encumbrance must be resolved through its own required governance path first, independent of and prior to any declassification action.
6. **Declassification is auditable and exactly-once.** Like classification, a declassification action produces a traceable record and must not be replayed to produce a duplicate debit from Sovereign Reserve State.

---

## Prohibited Reclassification Paths

The following reclassification paths are prohibited outright. None may be performed under any governance configuration, optimization rationale, or emergency justification that this document is aware of — a change to any of them would itself be a constitutional or protocol-level matter, not a classification action:

- **Frozen → Sovereign Reserve (direct)**: an asset in `Active` or `UnderReview` status may never be classified as Sovereign Reserve. It must first complete the Council-confirmed routing to Reclaimed State, and from there pass through SWF custody and the full Eligibility Tests — there is no shortcut that classifies a frozen asset "in place."
- **Reclaimed → Sovereign Reserve (direct, bypassing SWF custody and eligibility testing)**: a `Confirmed` reclaimed asset may not be classified as Sovereign Reserve merely by virtue of being reclaimed. It must be routed to `TransferredToSWF` and then independently pass the Eligibility Tests — "reclaimed" and "reserve-eligible" are not synonyms (see "Reclaimed assets do not become backing automatically").
- **Non-Reserve, Non-Eligible → any reserve-bearing state**: citizen welfare eligibility records and off-chain wage obligations may never be classified, reclassified, or "elevated" into Non-Reserve Treasury, Pending Classification, Sovereign Reserve, SWF Custodial, Frozen, or Reclaimed State. This boundary is permanent and structural (see "Citizen welfare and wage obligations are not reserve assets").
- **Oracle-Originated Direct Classification**: no balance may transition into Sovereign Reserve State, or out of it, on the sole basis of an oracle data submission — price feed, production report, confidence score, or any other signal. Oracle data may motivate a governance proposal; it can never itself be the authorizing act (see "Oracle signals are non-sovereign").
- **Released → any recognized domain**: an asset that completes `Confirmed → Released` exits the system. It may not be subsequently reclassified into Treasury, Reserve, SWF, or Reclaimed State without re-entering through an entirely new, independently authorized freeze-and-confirm cycle — "released" is not a parking state from which reclassification resumes.
- **Sovereign Reserve → Frozen (as a declassification mechanism)**: freezing is not a substitute for, or shortcut around, declassification. An asset is frozen because of a substantive freeze-worthy concern (per `AssetFreeze.sol` and the Crawler/Council process), not as a way to move reserve-classified value out of doctrine accounting while preserving optionality.
- **Implicit, Default, or Timeout-Based Reclassification**: no balance may change classification state as a side effect of an unrelated operation, by default configuration, or because a review period elapsed without action. Every reclassification is an explicit, recorded, authorized act — silence is never consent in this protocol.
- **Cross-Domain "Borrowing"**: value may not be temporarily reclassified from Sovereign Reserve to Non-Reserve Treasury (or vice versa) to meet a short-term operational need with an intent to reverse the classification later. Each classification act stands on its own eligibility and authorization merits — "borrowing" classification status is functionally equivalent to misrepresenting the balance's true state and is prohibited.

---

## Preventing Double-Counting Across Treasury, Reserve, and SWF

Double-counting is the single most consequential failure mode this protocol guards against, because it would directly distort `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` computations — the two doctrine values this entire model exists to protect. The following safeguards apply:

1. **One Custodial Record per Unit of Value.** Every unit of recognized value resolves to exactly one custodial record: a Treasury ledger line, an SWF layer entry (`layerL1`/`layerL2`/`layerL3`), or a Reclaimed-in-transit record — never more than one simultaneously. This is the Single-Custody Test, applied continuously, not just at classification time.
2. **One Classification Counted, Even Where Custody and Classification Overlap.** Where a unit of value is both SWF-custodied and Reserve-classified (the normal case for SWF layer balances), it is counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` exactly once — through its SWF custodial record — never additionally counted again at the Treasury level as if it were a separate Non-Reserve or Reserve-Designated Treasury balance.
3. **No Netting, No Merging, No Combined Totals for Doctrine Purposes.** Per Step-42, Treasury, Sovereign Reserve, SWF, Reclaimed, and Frozen balances are never netted or merged into a single combined figure. Doctrine computation (`MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`) is performed strictly over the Sovereign Reserve State aggregate — a clearly bounded set, computed from custodial records that have each individually passed the Eligibility Tests.
4. **Frozen and Reclaimed Value Is Excluded Until Resolved.** While in Frozen State, a unit counts toward no domain. While in Reclaimed State (post-`Confirmed`, pre-routing), it counts toward no domain either — it is "recognized as recovered" but not yet assigned to a final custodial record or classification. This prevents the same unit from being counted as both "frozen/under review" and "available reserve" during the suspension window.
5. **Declassified Value Is Immediately and Exclusively Re-Homed.** The moment a declassification completes, the value is debited from Sovereign Reserve State and credited to exactly one destination (ordinarily Non-Reserve Treasury State) in the same authorized action — there is no intermediate window in which the value could be claimed by both the old and new classification.
6. **Replay and Duplicate-Credit Resistance.** Consistent with Step-42's exact-once accounting principle, no classification, reclassification, declassification, deposit, withdrawal, or reclaim-routing record may be replayed to produce a second custodial entry or a second doctrine-counted unit of value for the same underlying asset.
7. **Audit Trail Enables Cross-Domain Reconciliation.** Because every classification, reclassification, declassification, freeze-status transition, and reclaim-routing action produces a traceable record (per the Auditability Test and Step-42's recognition rules), the total recognized value across Treasury + Sovereign Reserve + SWF + Reclaimed + Frozen + Released can, in principle, be reconciled against the sum of all authorized inflows and outflows — any mismatch is, by construction, evidence of a double-count or a missing record, not an acceptable "rounding" or "estimation" artifact.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Protocol Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` doctrine | `contracts/kernel.sol` |
| Reserve, Treasury, SWF class definitions and baseline eligibility | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) |
| Treasury asset classes, accounting boundaries, recognition rules, prohibited treatments | [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) |
| Layer authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries | [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) |
| SWF layers, deposits, withdrawals, yield | `contracts/monetary/SovereignWealthFund.sol`, `protocols/monetary-protocol-fa.md` |
| Reclaimed asset lifecycle and freeze routing | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol` |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol` |
| Provincial revenue distribution | `contracts/governance/Provincial.sol`, `protocols/governance-protocol-fa.md` |

Where this document and a contract, protocol, or a prior architecture formalization (Step-41/42/43) appear to differ, the contract, protocol, and prior formalizations remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document defines the discrete states a balance may hold under the Reserve Classification Protocol (Non-Reserve Treasury, Pending Classification, Sovereign Reserve, SWF Custodial, Frozen, Reclaimed, Released, and Non-Reserve/Non-Eligible), the lifecycle transitions permitted between Treasury, Sovereign Reserve, SWF, Frozen Assets, Reclaimed Assets, and Non-Reserve Assets, the eligibility tests a balance must pass before being recognized as Sovereign Reserve, the rules governing deliberate and auditable declassification, the reclassification paths that are prohibited outright, and the structural safeguards that prevent double-counting across Treasury, Reserve, and SWF — all without altering any contract, storage layout, threshold, timeout, or UI. It explicitly preserves `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18`, the non-sovereignty of oracle signals, the exclusion of frozen assets from reserve recognition, the non-automatic backing status of reclaimed assets, and the permanent separation of citizen welfare and wage obligations from reserve accounting. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
