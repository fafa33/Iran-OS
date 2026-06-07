# Sovereign Wealth Fund State Transitions — Architecture Formalization (Step-46)

## Scope and Non-Goals

This document is a **documentation-only** formalization of Sovereign Wealth Fund (SWF) state transitions for IranOS. It defines the SWF state lifecycle, the allowed transitions between Treasury, Sovereign Reserve, SWF Layer 1 (Cash), SWF Layer 2 (Productive), SWF Layer 3 (Pledged), and Reclaimed Assets, the eligibility rules a transition must satisfy, and the transitions that are prohibited outright.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event — including `SovereignWealthFund.sol`'s `layerL1`/`layerL2`/`layerL3`, `depositToL1/L2/L3`, `proposeWithdrawal`/`signWithdrawal`, `distributeAnnualYield`, `receiveReclaimedAsset`, `totalAssets`, `layerFillRatio`, `L1_TARGET`/`L2_TARGET`/`L3_TARGET`, `ANNUAL_YIELD`, `MULTISIG_REQUIRED`, and role wiring (`SOVEREIGN_ROLE`, `COUNCIL_ROLE`, `KERNEL_ROLE`, `RECLAIM_ROLE`).
- Any threshold, multi-sig requirement, or timeout constant.
- Any role, modifier, or access-control assumption — and it introduces **no new authorities**.
- Any trigger code — it introduces **no new trigger codes**, and the existing TR-01..TR-06 set in `kernel.sol` remains untouched.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` and `LIQUIDITY_CAP = 900,000,000,000 × 1e18`.

This document is a **direct extension** of, and is subordinate to:

- [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) — reserve, treasury, SWF classes and eligibility.
- [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) — accounting boundaries, recognition rules, prohibited treatments.
- [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) — authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries.
- [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) — classification states, lifecycle transitions, eligibility tests, declassification rules, double-counting prevention.
- [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) — expansion eligibility, prohibited expansion paths, ratio/cap protection, breach trigger conditions.

Where this document narrows those five into **SWF-state-transition-specific** rules, it must be read together with them, not as a replacement. None of Step-41/42/43/44/45 is modified by this document. Where any apparent conflict arises, those documents and the underlying contracts/protocols remain authoritative.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Source of Truth | Status Here |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 * 1e18` (900 billion Pahlavi) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle data informs review and feeds Kernel-mediated reserve updates; it cannot itself move SWF balances, authorize transitions, or classify reserves | `contracts/oracles/API3Oracle.sol`, [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) | Preserved — restated and applied to SWF transitions |
| Reclaimed assets are not automatic backing | `receiveReclaimedAsset` is a pure accounting credit to L1 — it mints no PAH and does not, by itself, classify the credited value as reserve backing for `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` purposes | `contracts/monetary/SovereignWealthFund.sol` (`receiveReclaimedAsset`), [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) | Preserved — restated and applied to SWF transitions |
| Frozen assets are not reserve assets | An asset in `AssetFreeze.Active`/`UnderReview` status cannot enter, or be counted within, any SWF layer | `contracts/reclaim/AssetFreeze.sol`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) | Preserved — restated and applied to SWF transitions |

Every state, transition, eligibility rule, and prohibition defined below is subordinate to these four doctrine elements, and to the broader doctrine carried forward unchanged from Steps 41–45 (including the permanent separation of citizen welfare/wage obligations from reserve and SWF accounting). Nothing in this document proposes a new role, a new trigger code, a new threshold, a new timeout, or a new contract entry point.

---

## SWF State Lifecycle

A unit of value relevant to the Sovereign Wealth Fund occupies, at any moment, exactly one of the following SWF-relevant states. These states refine the "SWF Custodial State" introduced in [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) into the layer-specific view needed to describe SWF lifecycle behavior:

1. **External / Pre-SWF State**: value that has not yet entered SWF custody — e.g., a Treasury balance, a Council-held asset awaiting deposit, or a confirmed-but-unrouted reclaimed asset. Not yet represented in `layerL1`/`layerL2`/`layerL3`.
2. **L1 — Cash / Liquid Layer State** (`layerL1`, target `L1_TARGET = 300B`): the most liquid SWF layer. Populated through `depositToL1` (Council deposit), `receiveReclaimedAsset` (reclaim accounting credit), and the inbound side of `distributeAnnualYield` (L2 → L1 yield flow).
3. **L2 — Productive Layer State** (`layerL2`, target `L2_TARGET = 300B`): the income-generating SWF layer. Populated through `depositToL2`, and decreased through the outbound side of `distributeAnnualYield` at the fixed `ANNUAL_YIELD = 150` (15%) rate.
4. **L3 — Pledged / Strategic Layer State** (`layerL3`, target `L3_TARGET = 2T`): the long-horizon strategic SWF layer. Populated through `depositToL3`.
5. **Pending Withdrawal State**: a balance that has been the subject of a `proposeWithdrawal` call and is awaiting the `MULTISIG_REQUIRED = 3` Council signatures needed to execute. It remains recorded in its originating layer's balance (per `SovereignWealthFund.sol`, the layer balance is only debited at execution, not at proposal) but is "earmarked" by an open `Transaction` record (`txCount`, `transactions[txId]`, `txSignatures`).
6. **Withdrawn / External-Again State**: value that has exited the SWF through a fully-executed withdrawal (`tx_.executed = true`, layer balance debited, `totalWithdrawn` incremented, `WithdrawalExecuted` emitted). It returns to External / Pre-SWF State relative to the SWF's own ledger.
7. **Reclaimed-In-Transit State**: a `Confirmed` asset in `AssetFreeze.sol` that has not yet completed routing. Per [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md), this is a distinct, suspended-recognition state — it is not yet SWF-custodied, not yet Treasury, and not yet Sovereign-Reserve-classified.
8. **Frozen State**: an asset in `AssetFreeze.Active`/`UnderReview` status. Per doctrine, it cannot occupy, or be counted toward, any SWF layer state while frozen.

A unit of value moves between these states only through the already-defined SWF and AssetFreeze entry points enumerated in the next section. No unit may occupy more than one state simultaneously, and no unit may be "between" states except through the explicitly-recorded Pending Withdrawal and Reclaimed-In-Transit states, both of which are themselves auditable, bounded conditions — not ambiguous gaps.

---

## Allowed Transitions

This section enumerates the **permitted** transitions among Treasury, Sovereign Reserve, SWF L1, SWF L2, SWF L3, and Reclaimed Assets. A transition not listed here is **not** permitted (see Prohibited Transitions). Every transition listed maps to an existing, unmodified contract entry point.

### 1. Treasury / Council-Held Assets → SWF L1, L2, or L3 (Deposit)

- **Mechanism**: `depositToL1(amount, source)`, `depositToL2(amount, asset)`, `depositToL3(amount, asset)` — each `onlyRole(COUNCIL_ROLE)`, `nonReentrant`, requiring `amount > 0`.
- **Direction**: External / Pre-SWF State → the named layer's State (L1, L2, or L3 respectively).
- **Effect**: increases `layerLN.balance` and `layerLN.totalDeposited`, updates `lastUpdated`, emits `DepositToL1/L2/L3`.
- **Note**: this transition is purely a custody change (value enters SWF custody). It does not, by itself, classify the deposited value as Sovereign Reserve — that classification remains governed by [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md)'s Eligibility Tests, consistent with the documented Reserve ↔ SWF overlap (a unit of value is commonly both, but each must be independently and traceably established).

### 2. SWF L1, L2, or L3 → External / Pre-SWF State (Withdrawal)

- **Mechanism**: a two-step Council process — `proposeWithdrawal(layer, amount, purpose)` (creates a `Transaction`, requires `1 <= layer <= 3` and `amount > 0`, records the proposer's signature) followed by `signWithdrawal(txId)` calls from additional `COUNCIL_ROLE` signers until `signaturesCount >= MULTISIG_REQUIRED = 3`, at which point the transaction auto-executes.
- **Direction**: the named layer's State → Pending Withdrawal State → Withdrawn / External-Again State.
- **Effect**: on execution, debits `layerLN.balance` (after an `insufficient L{N}` balance check), increments `layerLN.totalWithdrawn`, sets `executed = true`, emits `WithdrawalSigned` then `WithdrawalExecuted`.
- **Note**: this transition is the only authorized path by which value exits SWF custody for operational use. It requires the full `MULTISIG_REQUIRED = 3` threshold — this document changes nothing about that floor.

### 3. SWF L2 → SWF L1 (Annual Yield Distribution)

- **Mechanism**: `distributeAnnualYield()` — `onlyRole(COUNCIL_ROLE)`, `nonReentrant`. Computes `yield = (layerL2.balance * ANNUAL_YIELD) / 1000` (i.e., 15% of the current L2 balance), requires `yield > 0` and `layerL2.balance >= yield`.
- **Direction**: L2 State → L1 State (an intra-SWF transition; value never leaves SWF custody).
- **Effect**: debits `layerL2.balance`/credits `layerL2.totalWithdrawn`, credits `layerL1.balance`/`layerL1.totalDeposited`, emits `AnnualYieldDistributed`.
- **Note**: this is the **sole** recognized yield mechanism for SWF balances. It is fixed-rate, intra-SWF, and Council-gated — not a market-determined, externally-deployed, or oracle-determined flow. See Step-42's prohibition on speculative/yield-bearing redeployment, which this transition does not violate because it stays within the already-authorized, fixed-formula L2 → L1 path.

### 4. Reclaimed Assets (`Confirmed`) → SWF L1 (Reclaim Accounting Credit)

- **Mechanism**: `receiveReclaimedAsset(amount, assetId)` — `onlyRole(RECLAIM_ROLE)` (granted to the `AssetFreeze` contract), `nonReentrant`, requires `amount > 0`.
- **Direction**: Reclaimed-In-Transit State (i.e., `AssetFreeze.Confirmed`, en route via `TransferredToSWF`) → SWF L1 State.
- **Effect**: credits `layerL1.balance`/`layerL1.totalDeposited`, updates `lastUpdated`, emits `DepositToL1` (with `assetId` recorded as the `source` field for traceability).
- **Note — doctrine-critical**: per the contract's own NatSpec ("این تابع صرفاً حسابداری است — هیچ توکن PAH ضرب نمی‌شود" / "this function is purely accounting — no PAH token is minted"), this transition is an **accounting credit only**. It does not mint Pahlavi, and it does not, by itself, classify the credited amount as Sovereign Reserve backing for `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` purposes. The credited value must still independently pass the Eligibility Tests for Reserve Recognition (Step-44) before being counted as doctrine-relevant backing — see "Reclaimed assets do not become backing automatically" / "Reclaimed assets are not automatic backing."

### 5. SWF Layer State ↔ Sovereign Reserve Classification (Overlap, Not a Custody Transition)

- **Mechanism**: governance classification/declassification action, as defined in [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Sovereign Reserve ↔ Pending Classification ↔ Non-Reserve Treasury transitions), applied to value that happens to also reside in an SWF layer.
- **Direction**: this is **not** a movement of custody (the value does not leave `layerL1`/`layerL2`/`layerL3`); it is a change in the *classification label* attached to an already-custodied balance.
- **Effect**: changes whether the balance counts toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` computations. It does not change `layerLN.balance`, `totalDeposited`, `totalWithdrawn`, or any other SWF ledger figure.
- **Note**: this transition is listed for completeness because it is the formal mechanism by which "SWF-held" and "Sovereign-Reserve-classified" remain two independently-tracked properties of the same value, per the Single-Custody Test and the prohibition on double-counting (Step-44).

---

## Transition Eligibility Rules

A proposed transition among Treasury, Sovereign Reserve, SWF L1/L2/L3, and Reclaimed Assets is eligible to proceed only if **all** of the following hold. These rules restate, for the SWF-specific transitions enumerated above, the eligibility discipline already established in Steps 41–45:

1. **Authorized Entry-Point Test**: the transition occurs through one of the five mechanisms listed above (`depositToL1/L2/L3`, `proposeWithdrawal`/`signWithdrawal`, `distributeAnnualYield`, `receiveReclaimedAsset`, or a governance classification/declassification action) — never through any other call, inference, or side effect.
2. **Role-Authorization Test**: the calling address holds the role the entry point already requires (`COUNCIL_ROLE` for deposits, withdrawals, and yield distribution; `RECLAIM_ROLE` for reclaim credits; the appropriate governance authority for classification actions). This document grants no new role to any address and creates no alternate authorization path — see "No New Authorities" below.
3. **Non-Zero and Non-Frozen Test**: the amount is non-zero (`amount > 0` / `yield > 0`, as already enforced), and the underlying asset is not in `Active`/`UnderReview` freeze status. A frozen asset cannot be deposited, withdrawn, credited, or classified — it must first complete the freeze-routing lifecycle (Step-43, Step-44).
4. **Sufficient-Balance Test (for outbound transitions)**: a withdrawal or yield distribution may proceed only if the source layer's recorded balance is sufficient (`layerLN.balance >= amount` / `layerL2.balance >= yield`, as already enforced by the existing `require` checks). No transition may debit a layer below zero or "borrow" from another layer implicitly.
5. **Multi-Sig Completion Test (for withdrawals)**: a withdrawal executes only once `signaturesCount >= MULTISIG_REQUIRED = 3`. A proposal with fewer signatures remains in Pending Withdrawal State — it is not eligible to debit the layer balance, and this document proposes no alternate or accelerated execution path.
6. **Reclaim-Confirmation Test (for reclaim credits)**: a reclaim credit is eligible only for an asset that has reached `AssetFreeze.Confirmed` status and is routed via `TransferredToSWF` — i.e., it has already passed the `COUNCIL_THRESHOLD = 3` confirmation gate defined in `AssetFreeze.sol`. A `UnderReview` or merely `Active` asset is not eligible for crediting.
7. **Conservation Test**: every transition is matched by a corresponding, equal-and-opposite accounting effect — a deposit increases a layer balance and is matched by an external decrease (Treasury/Council-held assets); a withdrawal decreases a layer balance and is matched by an external increase; the yield flow decreases L2 by exactly the amount it increases L1; a reclaim credit increases L1 and is matched by the asset's exit from Reclaimed-In-Transit State. No transition may create or destroy recognized value.
8. **Doctrine-Bound Test (where reserve classification is implicated)**: where a transition would affect the value counted toward `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP` (i.e., where SWF-custodied value is also being classified, declassified, or relied upon for an expansion-eligibility computation per [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md)), the transition must not cause recognized backing to misstate compliance with either constant. A transition that would do so must not be classified as reserve-affecting until the constraint is independently satisfiable — it may still proceed as a pure custody transition (e.g., a deposit can still be recorded in `layerL1`) without being simultaneously recognized as reserve backing.
9. **Auditability and Exact-Once Test**: every transition produces a traceable record consistent with existing event emissions (`DepositToL1/L2/L3`, `WithdrawalProposed/Signed/Executed`, `AnnualYieldDistributed`, `AssetTransferredToSWF`), and a given authorizing decision (a specific deposit, a specific executed withdrawal, a specific reclaim transfer, a specific yield distribution) produces exactly one accounting effect — never replayed, never duplicated.

A transition that fails any single test does not proceed. It remains in, or reverts to, its last validly-recognized state — there is no "partial" deposit, withdrawal, credit, or classification.

---

## Prohibited Transitions

The following transitions are prohibited outright. None may be performed under any governance configuration, optimization rationale, or emergency justification this document is aware of:

- **Direct Layer-to-Layer Transfers Outside the Defined Yield Path**: moving value directly between L1 ↔ L3, L2 ↔ L3, or L1 ↔ L2 (in the L1-to-L2 direction) without routing through an external deposit/withdrawal cycle. The **only** intra-SWF layer-to-layer movement recognized by this model is the L2 → L1 annual yield flow at the fixed `ANNUAL_YIELD = 150` rate via `distributeAnnualYield`. Any other direct inter-layer movement would bypass the deposit/withdrawal accounting (`totalDeposited`/`totalWithdrawn`) and is not permitted.
- **Frozen-Asset Entry into Any SWF Layer**: crediting, depositing, or otherwise recognizing a frozen (`Active`/`UnderReview`) asset's value within `layerL1`, `layerL2`, or `layerL3`. See "Frozen assets are not reserve assets," and Step-43's freeze-routing boundary, which permits only Council-confirmed exits from the Frozen domain.
- **Reclaimed-Asset Auto-Classification as Reserve Backing**: treating the act of `receiveReclaimedAsset` crediting L1 as, by itself, a classification of that value as Sovereign Reserve for `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` purposes. The credit is accounting-only; classification is a separate, explicitly-authorized governance act per [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md). See "Reclaimed assets are not automatic backing."
- **Reclaimed-Asset Routing to L2 or L3**: `receiveReclaimedAsset` is wired exclusively to `layerL1`. No transition may route a reclaimed asset's accounting credit to `layerL2` or `layerL3` directly, nor "split" a single reclaim credit across multiple layers — the existing function performs a single, whole credit to L1.
- **Withdrawal Without Multi-Sig Completion**: executing, partially executing, or accounting for a withdrawal before `signaturesCount >= MULTISIG_REQUIRED = 3` is reached. A proposal alone never debits a layer balance.
- **Yield Distribution Beyond the Fixed Formula**: distributing any amount from L2 to L1 other than `(layerL2.balance * ANNUAL_YIELD) / 1000`, or distributing yield more than once for the same accounting period from the same balance basis (replay), or distributing "projected" yield (`projectedAnnualYield()` is a read-only estimate, not an authorization to distribute).
- **Oracle-Originated or Oracle-Authorized SWF Transitions**: any path by which an oracle data submission (price, production, valuation, or any other signal) directly causes, authorizes, or triggers a deposit, withdrawal, yield distribution, or reclaim credit. Oracle data may inform a Council decision; it can never itself be the authorizing act. See "Oracle signals are non-sovereign."
- **Welfare- or Wage-Sourced SWF Transitions**: crediting, depositing, or otherwise routing citizen welfare program balances, `CitizenCard.sol`-derived figures, or off-chain wage-obligation amounts into any SWF layer, or treating such figures as a basis for an SWF transition. This boundary is permanent and structural, carried forward unchanged from Steps 41/44/45.
- **Implicit, Default, or Timeout-Based SWF Transitions**: any layer-balance change, classification change, or reclaim-routing outcome that occurs as a side effect of an unrelated operation, by default configuration, or because a review period elapsed without action. Every SWF state transition is an explicit, recorded, authorized act through one of the five enumerated mechanisms — silence is never consent.
- **Replay or Duplicate Crediting/Debiting**: re-applying a previously-executed deposit, withdrawal, yield distribution, or reclaim credit to produce a second balance change from a single authorizing event or transaction record.
- **New Authorities, Roles, or Bypass Paths**: introducing any new role, modifier, admin function, "fast-path" multi-sig override, or alternate entry point that would allow an SWF state transition to occur outside the five mechanisms already defined in `SovereignWealthFund.sol` and `AssetFreeze.sol`. Per the project's "no admin backdoors" rule, any such proposal is a security concern, not an architecture refinement — and this document explicitly creates none.
- **New Trigger Codes or Trigger-Linked SWF Transitions**: defining any new violation/trigger code, or wiring any SWF layer transition directly to trigger activation, beyond the existing TR-01..TR-06 set and the existing, narrow TriggerProtocol ↔ Treasury/SWF interaction (offender access blocking) described in [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md). This document introduces no new trigger codes and no new trigger-to-SWF coupling.

---

## No New Authorities

This document is explicit that it introduces **zero** new authorities of any kind:

- No new role is defined, granted, or implied (the four existing SWF roles — `SOVEREIGN_ROLE`, `COUNCIL_ROLE`, `KERNEL_ROLE`, `RECLAIM_ROLE` — remain the complete set governing SWF transitions).
- No existing role's scope is expanded (e.g., `RECLAIM_ROLE` remains scoped to `receiveReclaimedAsset` into L1 only; `COUNCIL_ROLE` remains scoped to deposits, withdrawal proposal/signing, and yield distribution).
- No new multi-sig configuration, threshold, or signer set is proposed (`MULTISIG_REQUIRED = 3` and `COUNCIL_THRESHOLD = 3` remain the governing floors, unchanged).
- No address gains the ability to perform an SWF transition it could not already perform under the existing contract wiring.

Every transition described in this document is traceable to a role and entry point that already exists, unmodified, in `SovereignWealthFund.sol` or `AssetFreeze.sol`.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Transition Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` doctrine | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` |
| SWF layers, deposits, withdrawals, yield, reclaim accounting | `contracts/monetary/SovereignWealthFund.sol`, `protocols/monetary-protocol-fa.md` |
| Reserve, treasury, SWF class definitions and eligibility | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) |
| Accounting boundaries, recognition rules, prohibited treatments | [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) |
| Layer authority, data-flow, trigger-flow, freeze-routing boundaries | [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) |
| Classification states, lifecycle transitions, eligibility tests, double-counting prevention | [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) |
| Monetary expansion eligibility, prohibited paths, ratio/cap protection | [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) |
| Reclaimed asset lifecycle and freeze routing | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol` |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol` |
| TR-01..TR-06 trigger codes, trigger lifecycle | `contracts/kernel.sol`, `contracts/core/TriggerProtocol.sol` |

Where this document and a contract, protocol, or a prior architecture formalization (Step-41/42/43/44/45) appear to differ, the contract, protocol, and prior formalizations remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document defines the SWF state lifecycle (External/Pre-SWF, L1, L2, L3, Pending Withdrawal, Withdrawn/External-Again, Reclaimed-In-Transit, and Frozen states), the five allowed transitions among Treasury, Sovereign Reserve, SWF L1/L2/L3, and Reclaimed Assets — deposits, withdrawals, the L2→L1 annual yield flow, reclaim accounting credits to L1, and the SWF↔Reserve classification overlap — the eligibility rules each transition must satisfy, and the transitions that are prohibited outright (including direct inter-layer transfers outside the yield path, frozen-asset entry, reclaim auto-classification, withdrawal without multi-sig completion, off-formula yield distribution, oracle- or welfare-sourced transitions, implicit/replayed transitions, and any new authority, role, or trigger code). It explicitly preserves `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18`, the non-sovereignty of oracle signals, the non-automatic backing status of reclaimed assets, and the exclusion of frozen assets from reserve recognition — and it introduces no new authorities, no new trigger codes, and no contract, storage, threshold, or timeout changes. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
