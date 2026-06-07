# Treasury Allocation and Disbursement Model — Architecture Formalization (Step-48)

## Scope and Non-Goals

This document is a **documentation-only** formalization of Treasury allocation and disbursement (spending) flows for IranOS. It defines the allocation lifecycle, the disbursement lifecycle, citizen welfare funding boundaries, provincial allocation boundaries, the SWF withdrawal spending path, and the spending paths that are prohibited outright.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (`MAX_SUPPLY` in `PahlaviToken.sol`, `LIQUIDITY_CAP` in `kernel.sol`).

It introduces **no new authorities, no new roles, and no new trigger codes**. Every allocation and disbursement path described below is traceable to an existing, unmodified contract entry point already documented in Steps 41–47.

This document is a **direct extension** of, and is subordinate to, the full Step-41–47 series:

- [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) — reserve, treasury, SWF classes and eligibility.
- [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) — accounting boundaries, recognition rules, prohibited treatments, separation principle.
- [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) — authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries.
- [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) — classification states, lifecycle transitions, eligibility tests, declassification, double-counting prevention.
- [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) — expansion eligibility, prohibited expansion paths, ratio/cap protection, breach conditions.
- [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md) (Step-46) — SWF lifecycle states, allowed/prohibited transitions, no-new-authorities.
- [SOVEREIGN_TREASURY_FLOW_MODEL.md](SOVEREIGN_TREASURY_FLOW_MODEL.md) (Step-47) — end-to-end value-flow paths, source→classification→custody→deployment→withdrawal journey, citizen welfare funding boundaries, prohibited flow paths.

Step-47 already defined "Path D — SWF / Treasury → Withdrawal → External Use" and "Path I — Citizen Welfare Funding Flow" at the level of end-to-end flow. This document **narrows those into an allocation-and-disbursement-specific lifecycle** — the step-by-step process by which Treasury value is earmarked (allocated) and then actually spent (disbursed) — without redefining or contradicting the broader flow model. Where any apparent conflict arises, Steps 41–47 and the underlying contracts/protocols remain authoritative.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Source of Truth | Status Here |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` (900 billion Pahlavi) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle-fed data (e.g., `Provincial.distributeRevenue`, `Provincial.updateProductivityScore`) applies a fixed, pre-authorized, deterministic formula — it is not an autonomous spending decision, allocation act, or disbursement authorization | `contracts/oracles/API3Oracle.sol`, `contracts/governance/Provincial.sol`, [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) | Preserved — restated and applied to allocation/disbursement |
| Welfare/wages are non-reserve assets | `CitizenCard.sol` manages eligibility/status only; the 1,000 Pahlavi minimum wage is an off-chain employer obligation; neither is funded from, nor counted within, Reserve or SWF backing | `contracts/welfare/CitizenCard.sol`, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) | Preserved — restated and applied to allocation/disbursement |

Every lifecycle stage, boundary, path, and prohibition defined below is subordinate to these doctrine elements and to the full doctrine set carried forward unchanged from Steps 41–47 (frozen assets are not reserve assets; reclaimed assets are not automatic backing; no admin backdoors; immutable Kernel constants; reserve-to-treasury separation).

---

## Relationship to the Step-47 Flow Model

[SOVEREIGN_TREASURY_FLOW_MODEL.md](SOVEREIGN_TREASURY_FLOW_MODEL.md) describes **deployment** and **withdrawal/exit** at the level of "value leaves SWF/Treasury custody for an authorized purpose" (Path D) and "Citizen Welfare sits structurally outside the reserve perimeter, funded only via ordinary Treasury expenditure" (Path I). This document picks up exactly at that point and asks two narrower questions that Step-47 intentionally left at the flow level:

1. **Allocation**: how does Treasury value go from "available, unearmarked balance" to "earmarked for a specific purpose, recipient, or program" — *before* it is actually spent?
2. **Disbursement**: how does earmarked value go from "allocated" to "actually transferred, recorded, and closed out" — i.e., spent?

Neither stage introduces a new contract function. Both stages are documentation-level decompositions of the existing, already-authorized Council/governance withdrawal-and-purpose-recording mechanics (`proposeWithdrawal`/`signWithdrawal`/`Transaction.purpose` in `SovereignWealthFund.sol`) and the existing Provincial revenue-and-bonus mechanics (`distributeRevenue`/`payProductivityBonus`/`provincialBalance` in `Provincial.sol`).

---

## Allocation Lifecycle

**Allocation** is the act of earmarking recognized, available Treasury (or Treasury-bound SWF) value for a specific purpose, recipient, program, or province — *prior to* the value actually moving. Allocation is a planning/authorization stage; it does not, by itself, move or debit any balance.

The allocation lifecycle proceeds through the following stages, each mapped to existing mechanisms:

1. **Source Confirmation**: the value proposed for allocation must already be a recognized, available balance — Non-Reserve Treasury value, a province's accumulated `provincialBalance`/`nationalContrib` (per `Provincial.sol`), or SWF-custodied value not currently encumbered, locked, frozen, or already subject to an open `Transaction`. Frozen, Reclaimed-In-Transit, and Pending-Classification value cannot be allocated (see Provincial Allocation Boundaries and Prohibited Spending Paths).
2. **Purpose Declaration**: the allocation must declare an explicit, auditable purpose. In the existing SWF mechanism, this is the mandatory `purpose` string recorded at `proposeWithdrawal` time; in the Provincial mechanism, the "purpose" is structurally fixed by the contract itself — provincial development (via `provincialBalance`/`developmentAccount`) or productivity bonus (`payProductivityBonus`, gated by `productivityScore > 70`). No allocation may proceed without a declared, recorded purpose.
3. **Authorization Proposal**: the allocation is formally proposed by an address holding the role the relevant mechanism already requires — `COUNCIL_ROLE` for an SWF withdrawal proposal (`proposeWithdrawal`), `KERNEL_ROLE` for a productivity bonus (`payProductivityBonus`), or the deterministic, oracle-fed 30/70 split itself (`distributeRevenue`, `ORACLE_ROLE`-called but formula-fixed — see Provincial Allocation Boundaries).
4. **Multi-Party Confirmation (where applicable)**: for SWF-sourced allocations, the proposal accumulates Council signatures (`signWithdrawal`) until `MULTISIG_REQUIRED = 3` is reached. Until that threshold is met, the allocation remains in a **Pending Allocation** state — earmarked in the sense that a `Transaction` record exists, but not yet capable of producing a balance change.
5. **Allocation Finalization**: once the authorization conditions for the relevant mechanism are satisfied (multi-sig threshold reached for SWF withdrawals; oracle-fed formula application for provincial revenue split; `productivityScore > 70` confirmed for bonuses), the allocation is finalized — the earmark becomes "ready to disburse." For the SWF path, finalization and the first half of disbursement are the same on-chain moment (`signWithdrawal` reaching threshold both finalizes the allocation and triggers execution); this document describes them as conceptually distinct stages for clarity without implying any new intermediate on-chain state.
6. **Allocation Closure or Reversal**: an allocation that is never finalized (e.g., a withdrawal proposal that never reaches `MULTISIG_REQUIRED = 3`) remains permanently in Pending Allocation state — it never auto-executes, never auto-expires into a disbursement, and never silently reverts into a different earmark. Closing or reversing such a pending allocation requires the same explicit, authorized, auditable governance attention as any other state change in this model (no implicit timeout-based closure is introduced or assumed).

---

## Disbursement Lifecycle

**Disbursement** is the act of actually transferring earmarked value to its declared recipient/purpose, recording that transfer, and closing out the corresponding allocation. Disbursement is the execution stage; it is where balances actually change.

The disbursement lifecycle proceeds through the following stages:

1. **Execution Trigger**: disbursement begins only when the allocation has been finalized per the Allocation Lifecycle above — for SWF withdrawals, the moment `signaturesCount >= MULTISIG_REQUIRED = 3` is reached (auto-executing within `signWithdrawal`); for provincial flows, the moment the oracle-fed `distributeRevenue` formula applies or `payProductivityBonus` is called by `KERNEL_ROLE`.
2. **Sufficiency Check**: the source balance is verified sufficient for the disbursed amount (`layerLN.balance >= tx_.amount`, as already enforced) before any debit occurs. An insufficient balance blocks disbursement entirely — it does not partially disburse, queue a shortfall, or borrow from another layer or province.
3. **Balance Transfer (Debit and Credit)**: the source balance is debited (e.g., `layerL1/L2/L3.balance -= amount`, `totalWithdrawn` incremented) and the recorded destination is credited or marked as the recipient of the transfer. This is a single, atomic, conservation-consistent accounting effect — value is neither created nor destroyed by the act of disbursing it.
4. **Record Closure**: the disbursement record is marked complete (`tx_.executed = true`) and the corresponding event is emitted (`WithdrawalExecuted`, `RevenueDistributed`, `ProductivityBonusPaid`, or the equivalent), closing out the allocation that authorized it. A closed disbursement record cannot be reopened, re-executed, or reused to authorize a second transfer (exact-once, replay-resistant — per Steps 42/44/46).
5. **Post-Disbursement Reconciliation**: the disbursed amount is reflected in the source domain's outflow accounting (`totalWithdrawn`, reduced `provincialBalance`/`nationalContrib`, etc.) and — where the disbursed value had been Reserve-classified — its exit from custody is the point at which its continued Reserve classification must be re-examined under [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (see Step-47's Reserve-Entry/Reserve-Exit consolidation; this document does not redefine that re-examination, only notes that disbursement is one of the events that triggers the need for it).

A disbursement that fails the Sufficiency Check, lacks a finalized allocation, or would require any step outside this lifecycle does not proceed — it remains pending or is rejected, never partially executed.

---

## Citizen Welfare Funding Boundaries

This section narrows Step-47's "Path I — Citizen Welfare Funding Flow" into allocation/disbursement-specific terms:

1. **Welfare eligibility allocation does not exist as a Treasury concept.** `CitizenCard.sol` determines *who is eligible for what* (minimum wage threshold reference, unemployment insurance at 70% of minimum wage for up to 18 months, annual health credit of 500 Pahlavi, monthly drug quota of 100 Pahlavi, retirement at 65). None of these figures are themselves Treasury allocations — they are eligibility parameters tracked on a status ledger that holds no funds.
2. **Wages are never allocated or disbursed from Treasury, Reserve, or SWF.** The 1,000 Pahlavi minimum wage is an off-chain, employer-borne obligation. No allocation lifecycle stage and no disbursement lifecycle stage in this document — and none in `SovereignWealthFund.sol` or `Provincial.sol` — produces a wage payment. `CitizenCard.sol` enforces eligibility tracking for this obligation; it neither allocates nor disburses funds toward it.
3. **Where a genuine on-chain welfare disbursement exists, it is an ordinary Treasury allocation/disbursement — nothing more.** If a future, separately-authorized welfare program were to disburse on-chain value (e.g., a health-credit payment funded from Treasury), that disbursement would follow exactly the Allocation and Disbursement Lifecycles described above — declared purpose, `COUNCIL_ROLE`/governance authorization, sufficiency check, atomic transfer, record closure — accounted for as ordinary Treasury outflow. It would never be modeled, computed, or justified as a Reserve, SWF, custody, or backing-related allocation, and it would never be permitted to draw on `totalReserves`-counted value in a way that bypasses [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md).
4. **Welfare scale is never an allocation or disbursement input for reserve-relevant decisions.** The number of eligible citizens, aggregate projected wage exposure, unemployment-insurance claim volume, or any other welfare-derived figure is never a basis for sizing, timing, or justifying an allocation or disbursement from Sovereign Reserve, SWF layers, or any `totalReserves`-relevant balance. (Restates Step-44's "Non-Welfare Test" and Step-45's welfare-exclusion doctrine at the allocation/disbursement level.)
5. **No allocation or disbursement flows from Citizen Layer back into Treasury/Reserve/SWF.** The Citizen Layer is a pure consumer of (at most) ordinary Treasury outflow — it is never a source of allocation, never a destination that feeds back into custody, classification, or backing, and never an authority that proposes, confirms, or executes Treasury allocations or disbursements.

---

## Provincial Allocation Boundaries

This section formalizes how the existing 30/70 Provincial revenue mechanism (`Provincial.sol`) fits into the allocation/disbursement model, without altering `PROVINCIAL_SHARE = 300` / `NATIONAL_SHARE = 700`, the `productivityScore > 70` bonus-eligibility threshold, or any role wiring (`KERNEL_ROLE`, `ORACLE_ROLE`, `GOVERNOR_ROLE`):

1. **The 30/70 split is a fixed-formula allocation, not a discretionary one.** When `distributeRevenue(provinceId, amount)` is called (by an `ORACLE_ROLE`-held address, feeding revenue data), the contract deterministically computes `provincialShare = (amount * PROVINCIAL_SHARE) / 1000` and `nationalShare = amount - provincialShare`, crediting `p.provincialBalance` and `p.nationalContrib` respectively. This is **allocation by pre-authorized, immutable formula** — the oracle supplies the *amount* (a data input), but the *split ratio, the recipients, and the accounting effect* are fixed by the contract's constitutional constants, not chosen by the oracle. This preserves "oracle signals are non-sovereign": the oracle cannot decide how much goes where — it can only report a revenue figure that a pre-fixed formula then applies.
2. **`provincialBalance` is an allocation state, not yet a disbursement.** Crediting `provincialBalance` earmarks value for the province; it does not itself transfer value to the province's `developmentAccount` or any external recipient. Any actual outward transfer from a province's balance is a separate, explicitly-authorized disbursement step — this document does not assume or imply an automatic provincial-balance-to-account sweep beyond what the contract already defines.
3. **Productivity bonuses are KERNEL-authorized, threshold-gated allocations.** `payProductivityBonus` requires `productivityScore > 70` and is callable only by `KERNEL_ROLE`. This is allocation-with-eligibility-gate: the score (oracle-fed via `updateProductivityScore`, `ORACLE_ROLE`) is a *data input* to a *threshold test*, and crossing the threshold does not, by itself, authorize the bonus — the Kernel must still explicitly call `payProductivityBonus`. The oracle informs eligibility; it does not allocate or disburse.
4. **Provincial allocations remain within the Treasury domain — they do not cross into Reserve or SWF.** `provincialBalance` and `nationalContrib` are Treasury-side accounting figures (per [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md)'s "Provincial-Origin Assets" class). They are not, by virtue of being allocated provincially or nationally, Reserve-classified or SWF-custodied — any such classification would require the same explicit Path-E evaluation (Step-44/47) as any other Non-Reserve Treasury balance.
5. **Province governors are scoped to their province; they are not Treasury or Reserve authorities.** `GOVERNOR_ROLE` is granted per-province at registration and is not, anywhere in this model, a basis for proposing, confirming, or executing SWF withdrawals, reserve classifications, or national-level Treasury disbursements. Provincial allocation boundaries are province-scoped by design, and this document preserves that scoping unchanged.

---

## SWF Withdrawal Spending Path

This section formalizes the **only** recognized path by which SWF-custodied value becomes spendable Treasury-side value, narrowing Step-46's "Allowed Transition #2" and Step-47's "Path D" into allocation/disbursement terms. No alternate spending path from the SWF exists or is proposed:

1. **Proposal (Allocation Stage 3)**: a `COUNCIL_ROLE`-held address calls `proposeWithdrawal(layer, amount, purpose)`, declaring which layer (`1`, `2`, or `3`), how much, and for what purpose. This creates the `Transaction` record and registers the proposer's signature — the allocation is now "earmarked but pending."
2. **Multi-Sig Accumulation (Allocation Stage 4)**: additional `COUNCIL_ROLE` signers call `signWithdrawal(txId)`. Each signature is recorded (`txSignatures[txId][signer] = true`, `signaturesCount++`) and emitted (`WithdrawalSigned`). The allocation remains in Pending Allocation state until `signaturesCount >= MULTISIG_REQUIRED = 3`.
3. **Threshold-Triggered Execution (Allocation Finalization + Disbursement Execution, same transaction)**: upon the third qualifying signature, the contract performs the Sufficiency Check (`layerLN.balance >= tx_.amount`), marks `tx_.executed = true`, debits the layer balance, increments `totalWithdrawn`, and emits `WithdrawalExecuted`. This single on-chain moment **is** both the finalization of the allocation and the execution of the disbursement — there is no separate, later "spend the allocated amount" step for the SWF path.
4. **Spend Realization (Disbursement Stage 5 — Reconciliation)**: the withdrawn value is now Treasury-side (External / Pre-SWF state, per Step-46) and available for whatever Treasury-level allocation/disbursement process the declared `purpose` describes — itself subject to the same Allocation and Disbursement Lifecycles described above if it requires further earmarking before final use (e.g., a withdrawal "for provincial development support" would still need to flow through `Provincial.sol`'s own allocation mechanics to actually reach a province).
5. **No shortcut, no partial execution, no alternate trigger.** The threshold (`MULTISIG_REQUIRED = 3`) is the sole execution trigger; there is no time-based, oracle-based, Kernel-unilateral, or Sovereign-unilateral path that disburses SWF value without it. This document changes nothing about that floor and proposes no alternative.

---

## Prohibited Spending Paths

The following allocation and disbursement paths are prohibited outright. Each restates and narrows prohibitions already established in Steps 42/44/45/46/47 to the allocation/disbursement context; none may be performed under any governance configuration, optimization rationale, or emergency justification this document is aware of:

- **Disbursement Without Finalized Allocation**: transferring, crediting, or recording any spend before the corresponding allocation has been properly proposed and (where applicable) multi-sig-finalized. No "spend now, document later" path exists or is proposed.
- **Spending Below Multi-Sig Threshold**: executing or partially executing an SWF withdrawal before `signaturesCount >= MULTISIG_REQUIRED = 3`. A second signature does not authorize two-thirds of a disbursement — the threshold is binary, not proportional.
- **Spending Frozen, Reclaimed-In-Transit, or Pending-Classification Value**: allocating or disbursing any balance currently in Frozen State, Reclaimed-In-Transit State, or Pending Classification State. Such value is, by definition, not yet a recognized, available, spendable balance (per Steps 43/44/47).
- **Spending Reserve-Classified Value Without Triggering Required Re-Examination**: disbursing value that is currently Reserve-classified without recognizing that its exit from custody requires re-examination of its continued classification (see Disbursement Lifecycle, Stage 5; Step-47's Reserve-Entry/Reserve-Exit consolidation). Treating Reserve-classified value as freely spendable Treasury value, while continuing to count it toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`, is precisely the double-counting Steps 42/44 prohibit.
- **Welfare- or Wage-Funded Allocation/Disbursement from Reserve or SWF**: allocating or disbursing Sovereign Reserve or SWF-custodied value toward wage payment or any welfare obligation. Wages are off-chain and employer-borne; genuine on-chain welfare disbursement (if it exists) is ordinary Treasury outflow only — never a Reserve or SWF spending path. (Restates Citizen Welfare Funding Boundaries above and Step-45's welfare-backing prohibition.)
- **Oracle-Triggered or Oracle-Authorized Allocation/Disbursement**: any path by which an oracle data submission directly allocates, earmarks, authorizes, or executes a spend — beyond the existing, narrow, formula-fixed role of supplying the *amount* in `distributeRevenue` or the *score* in `updateProductivityScore`. The oracle may never choose a recipient, set a split ratio, decide a purpose, or trigger an execution by itself. (Restates "oracle signals are non-sovereign.")
- **Cross-Province or Province-to-National Reallocation Outside the Fixed Formula**: moving value from one province's `provincialBalance` to another's, or from `provincialBalance` back into `nationalContrib` (or vice versa) other than through the pre-fixed `distributeRevenue` split applied at the moment revenue is reported. No discretionary "rebalancing" path exists or is proposed.
- **Province-Governor-Authorized National or Reserve Spending**: any allocation or disbursement of national Treasury, Sovereign Reserve, or SWF value authorized solely by a `GOVERNOR_ROLE` holder. Governors remain scoped to their province's own allocated balance; they are not, and do not become, national Treasury, Reserve, or SWF authorities.
- **Liquidity-Cap- or Reserve-Ratio-Breaching Spend-and-Replenish Schemes**: any allocation or disbursement plan that depends on, anticipates, or is structured around a subsequent mint to "refill" spent reserves, where that anticipated mint would not independently satisfy `reserveCompliant` (`MAX_SUPPLY` and `MIN_RESERVE_RATIO`) at the time it would occur. Spending decisions must stand on currently-eligible, currently-classified balances — never on a projected future expansion. (Restates Step-45's prohibition on self-referential backing and ratio/cap overrides.)
- **Implicit, Default, Timeout-Based, or Replayed Allocation/Disbursement**: any earmark or spend that occurs as a side effect of an unrelated operation, by default configuration, because a review period elapsed, or by re-applying a previously-executed `Transaction`, `RevenueDistributed`, or `ProductivityBonusPaid` record. Every allocation and every disbursement is explicit, authorized, recorded, and exactly-once.
- **Any Path Requiring a New Authority, Role, or Trigger Code**: introducing any new role, expanded role scope, alternate signer set, alternate threshold, new trigger code, or admin-style bypass to enable an allocation or disbursement that the existing `SovereignWealthFund.sol` / `Provincial.sol` / `CitizenCard.sol` wiring does not already support. Per the project's "no admin backdoors" rule and Step-46's "No New Authorities" precedent, any such proposal is a security concern, not a refinement — and this document explicitly creates none.

---

## No New Authorities, Roles, or Trigger Codes

Consistent with Step-46's precedent, this document is explicit that it introduces **zero** new authorities, roles, or trigger codes:

- No new role is defined, granted, or implied. The complete set of roles relevant to allocation and disbursement remains: `SOVEREIGN_ROLE`, `COUNCIL_ROLE`, `KERNEL_ROLE`, `RECLAIM_ROLE` (`SovereignWealthFund.sol`); `KERNEL_ROLE`, `ORACLE_ROLE`, `GOVERNOR_ROLE` (`Provincial.sol`) — each unchanged in scope.
- No existing role's scope is expanded — `ORACLE_ROLE` remains limited to supplying data inputs to pre-fixed formulas (`distributeRevenue`'s amount, `updateProductivityScore`'s score); `GOVERNOR_ROLE` remains province-scoped; `COUNCIL_ROLE` remains bound by `MULTISIG_REQUIRED = 3`.
- No new multi-sig configuration, threshold, signer set, or trigger code is proposed. `MULTISIG_REQUIRED = 3`, `COUNCIL_THRESHOLD = 3`, `PROVINCIAL_SHARE = 300`, `NATIONAL_SHARE = 700`, the `productivityScore > 70` gate, and the existing TR-01..TR-06 trigger codes all remain exactly as defined.
- Every allocation and disbursement stage described in this document is traceable to a role, function, and accounting effect that already exists, unmodified, in `SovereignWealthFund.sol`, `Provincial.sol`, or `CitizenCard.sol`.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Allocation/Disbursement Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` / `MAX_SUPPLY` doctrine | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` |
| Reserve, treasury, SWF class definitions and eligibility | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) |
| Accounting boundaries, recognition rules, prohibited treatments, separation principle | [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) |
| Layer authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries | [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) |
| Classification states, lifecycle transitions, eligibility tests, declassification, double-counting prevention | [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) |
| Monetary expansion eligibility, prohibited paths, ratio/cap protection, breach conditions | [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) |
| SWF lifecycle states, allowed/prohibited transitions, no-new-authorities | [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md) (Step-46) |
| End-to-end flow paths, source→classification→custody→deployment→withdrawal, citizen welfare funding boundaries | [SOVEREIGN_TREASURY_FLOW_MODEL.md](SOVEREIGN_TREASURY_FLOW_MODEL.md) (Step-47) |
| SWF withdrawal mechanics (`proposeWithdrawal`/`signWithdrawal`) | `contracts/monetary/SovereignWealthFund.sol`, `protocols/monetary-protocol-fa.md` |
| Provincial 30/70 split, productivity bonus, governor scoping | `contracts/governance/Provincial.sol`, `protocols/governance-protocol-fa.md` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol` |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol` |
| TR-01..TR-06 trigger codes, trigger lifecycle | `contracts/kernel.sol`, `contracts/core/TriggerProtocol.sol` |

Where this document and a contract, protocol, or a prior architecture formalization (Step-41 through Step-47) appear to differ, the contract, protocol, and prior formalizations remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document defines the Treasury allocation lifecycle (source confirmation, purpose declaration, authorization proposal, multi-party confirmation, finalization, closure/reversal) and the disbursement lifecycle (execution trigger, sufficiency check, atomic balance transfer, record closure, post-disbursement reconciliation), narrowing Step-47's end-to-end flow model into the specific mechanics of earmarking and spending Treasury value. It defines citizen welfare funding boundaries (eligibility-ledger-only, off-chain wages, ordinary-Treasury-outflow framing for any genuine welfare disbursement, and the permanent exclusion of welfare scale from reserve-relevant decisions), provincial allocation boundaries (the 30/70 split as a fixed-formula, oracle-data-fed allocation; `provincialBalance` as an allocation state, not a disbursement; threshold-gated productivity bonuses; province-scoped governor authority), and the SWF withdrawal spending path (the sole recognized route from SWF custody to spendable Treasury value, via `proposeWithdrawal`/`signWithdrawal` at `MULTISIG_REQUIRED = 3`). It enumerates prohibited spending paths spanning unauthorized/under-threshold spending, spending of frozen/reclaimed/pending-classification/reserve-classified value without proper handling, welfare- or oracle-driven spending, cross-province or governor-authorized national spending, breach-anticipating spend-and-replenish schemes, and implicit/replayed allocation or disbursement. It introduces no new authorities, roles, or trigger codes, and changes no contract, storage layout, threshold, or timeout — while explicitly preserving `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18`, the non-sovereignty of oracle signals, and the structural exclusion of citizen welfare and wage obligations from reserve and SWF accounting. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
