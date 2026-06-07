# Sovereign Treasury Flow Model — Architecture Formalization (Step-47)

## Scope and Non-Goals

This document is a **documentation-only** formalization of the end-to-end value-flow model across Treasury, Sovereign Reserve, the Sovereign Wealth Fund (SWF), Frozen Assets, Reclaimed Assets, and Citizen Welfare for IranOS. It synthesizes Steps 41–46 into a single, traceable picture of how value enters the system, how it is classified, where it is custodied, how it is deployed, how it exits, and where the boundaries on flow sit.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (`MAX_SUPPLY` in `PahlaviToken.sol`, `LIQUIDITY_CAP` in `kernel.sol`).

It introduces **no new authorities, no new roles, and no new trigger codes**. Every flow path described below is traceable to an existing, unmodified contract entry point already documented in Steps 41–46.

This document is a **synthesis and direct extension** of, and is subordinate to:

- [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) — reserve, treasury, SWF classes and eligibility.
- [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) — accounting boundaries, recognition rules, prohibited treatments, reserve-to-treasury separation.
- [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) — authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries.
- [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) — classification states, lifecycle transitions, eligibility tests, declassification rules, double-counting prevention.
- [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) — expansion eligibility, prohibited expansion paths, ratio/cap protection, breach trigger conditions.
- [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md) (Step-46) — SWF lifecycle states, allowed transitions, transition eligibility, prohibited transitions.

Where this document presents an end-to-end flow, the step-by-step rules governing each individual segment of that flow remain defined by Steps 41–46 and the underlying contracts — this document does not redefine them, only connects them into a single traceable path. Where any apparent conflict arises, Steps 41–46 and the underlying contracts/protocols remain authoritative.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Source of Truth | Status Here |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` (900 billion Pahlavi) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle data informs review and feeds Kernel-mediated reserve updates (`updateReserves`, `onlyKernel`); it cannot itself move value, classify reserves, or authorize any flow segment | `contracts/oracles/API3Oracle.sol`, [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) | Preserved — restated and applied across the full flow |
| Welfare/wages are non-reserve assets | `CitizenCard.sol` manages eligibility/status only; the 1,000 Pahlavi minimum wage is an off-chain employer obligation; neither is an asset, a reserve, or backing | `contracts/welfare/CitizenCard.sol`, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) | Preserved — restated and applied across the full flow |

Every flow path, boundary, and prohibition in this document is subordinate to these doctrine elements, and to the full doctrine set carried forward unchanged from Steps 41–46 (frozen assets are not reserve assets; reclaimed assets are not automatic backing; no admin backdoors; immutable Kernel constants).

---

## Flow Model Overview

End-to-end value flow in IranOS moves through five conceptual stages, each governed by the rules already established in Steps 41–46:

```
  SOURCE  →  CLASSIFICATION  →  CUSTODY  →  DEPLOYMENT  →  WITHDRAWAL / EXIT
```

- **Source**: where recognized value originates (Provincial revenue, Council deposits, confirmed reclaims, oracle-informed valuation updates that *adjust* — but do not *create* — recognized backing).
- **Classification**: the explicit, governance-authorized act of labeling a balance as Sovereign Reserve, Non-Reserve Treasury, or another recognized class (per [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md)).
- **Custody**: where the value is actually held — Treasury ledger, or an SWF layer (`layerL1`/`layerL2`/`layerL3`) — independent of, but traceable to, its classification (per [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md), Reserve ↔ SWF boundary).
- **Deployment**: authorized use of custodied value — Council withdrawal for permitted purposes, intra-SWF yield flow, or (where independently eligible) backing for monetary expansion (per [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md)).
- **Withdrawal / Exit**: value leaving its current custody or classification state — executed withdrawals, declassification, freeze-driven suspension, or release.

Frozen Assets and Reclaimed Assets sit alongside this main pipeline as **suspended** and **transitional** states respectively (per [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md)); Citizen Welfare sits entirely **outside** it (per the doctrine that welfare/wages are non-reserve assets). Both relationships are detailed below.

---

## Allowed Value-Flow Paths

The following are the **complete set** of allowed end-to-end value-flow paths. A path not listed here is not permitted (see Prohibited Flow Paths). Each path is composed exclusively of segments already defined, individually, in Steps 41–46.

### Path A — Provincial Revenue → Treasury → (Classification) → SWF

1. Oracle feeds revenue data into the Provincial revenue computation (`Provincial.sol`, informational only).
2. The 30/70 split applies (`PROVINCIAL_SHARE = 300`): 30% remains provincial, 70% reaches the National Treasury — both as **Non-Reserve Treasury** balances initially (per [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md)).
3. A Non-Reserve Treasury balance may be proposed for, and (if it passes all Step-44 Eligibility Tests) complete, classification into **Sovereign Reserve State**.
4. Reserve-classified or still-Non-Reserve Treasury value may be deposited into an SWF layer via `depositToL1/L2/L3` (Council-authorized, per [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md)), establishing SWF custody.

### Path B — Council-Held / External Assets → SWF Deposit → (Classification)

1. Assets held at the Council/Treasury level may be deposited directly into L1, L2, or L3 (`depositToL1/L2/L3`).
2. Deposit is a **custody** event; it is not, by itself, a classification event (per Step-46, Allowed Transition #1, and Step-42's Reserve↔SWF boundary).
3. The deposited value may separately be classified as Sovereign Reserve if it independently passes the Step-44 Eligibility Tests — establishing the (common, but not automatic) overlap of SWF custody and Reserve classification.

### Path C — SWF Intra-Layer Flow (L2 → L1 Annual Yield)

1. `distributeAnnualYield()` moves a fixed 15% (`ANNUAL_YIELD = 150`) of the L2 balance into L1.
2. This is the **only** recognized intra-SWF layer-to-layer flow (per Step-46, Allowed Transition #3) and remains entirely within SWF custody — it neither enters nor exits the Treasury/Reserve/SWF perimeter.

### Path D — SWF / Treasury → Withdrawal → External Use

1. A Council member proposes a withdrawal from a specific layer (`proposeWithdrawal`).
2. Additional Council signers sign (`signWithdrawal`) until `MULTISIG_REQUIRED = 3` is reached, at which point the layer balance is debited and the value exits SWF custody (per Step-46, Allowed Transition #2).
3. Withdrawn value returns to **External / Pre-SWF / Treasury-side** state, for the authorized purpose recorded in the `Transaction.purpose` field.
4. If the withdrawn value had been Reserve-classified, its exit from SWF custody is the trigger point at which its continued Reserve classification must be re-examined — value does not remain "double counted" as both withdrawn-and-deployed and still-backing (see Double-Counting Prevention, carried from Step-44).

### Path E — Reserve Entry Flow (Classification into Sovereign Reserve)

1. A Non-Reserve Treasury balance, an SWF-custodied balance, or (after routing — see Path G) a transferred-to-SWF reclaimed balance is **proposed** for reserve classification, entering Pending Classification State (per Step-44).
2. The proposal is evaluated against **all eight** Eligibility Tests for Reserve Recognition: Origin, Non-Suspension, Single-Custody, Conservation, Doctrine-Bound (`MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`), Sovereignty (non-oracle-originated), Non-Welfare, and Auditability.
3. Only on passing all eight does the balance complete the transition into **Sovereign Reserve State**, becoming countable toward `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP`.
4. Failure of any test returns the balance to its prior, last-validly-recognized state — never an "upgraded" classification by default.

### Path F — Reserve Exit Flow (Declassification out of Sovereign Reserve)

1. Reserve-classified value may be **proposed** for declassification (entering Pending Classification State, direction: downward).
2. Declassification completes only through an explicit, authorized governance act (per Step-44 Declassification Rules): it must be conservation-consistent (debited from Reserve, credited to exactly one destination — typically Non-Reserve Treasury), must not retroactively rewrite past doctrine computations, must not bypass an active lock or encumbrance, and must be auditable and exactly-once.
3. A declassification that would bring recognized reserve backing below the `MIN_RESERVE_RATIO`-implied floor is a doctrine-relevant event requiring deliberate governance review before being finalized — it is not a routine bookkeeping action (per Step-44, Step-45 breach-condition framing).

### Path G — Freeze and Reclaim Routing Flow

1. **Initiation**: `CRAWLER_ROLE` places a suspected-illicit asset into `Active` freeze status — the asset enters **Frozen State**, counted in **no** domain's balance and **no** doctrine computation (per Step-43 Freeze-Routing Boundaries, Step-44).
2. **Review**: the asset may move `Active → UnderReview`, remaining within Frozen State.
3. **Confirmation**: `COUNCIL_ROLE` signers confirm the freeze with `COUNCIL_THRESHOLD = 3` signatures, moving the asset to `Confirmed` status — exiting Frozen State and entering **Reclaimed-In-Transit State** (recognized as "recovered," but not yet assigned to any final custody or classification).
4. **Routing — exactly two confirmed exits**:
   - **`Confirmed → TransferredToSWF`**: `RECLAIM_ROLE` (held by the `AssetFreeze` contract) calls `receiveReclaimedAsset`, crediting **L1 only**, as a **pure accounting entry — no PAH is minted**. The credited value now sits in SWF L1 custody but is **not yet** Reserve-classified.
   - **`Confirmed → Released`**: `KERNEL_ROLE`-gated; the asset returns to its prior owner/domain and exits the system entirely — it never enters Treasury, Reserve, or SWF accounting.
5. **Post-credit reserve entry (separate, required step)**: a `TransferredToSWF` credit may *only* subsequently become Sovereign Reserve backing by independently completing Path E — passing all eight Eligibility Tests. The reclaim credit alone never constitutes classification (doctrine: "reclaimed assets are not automatic backing").

### Path H — Reserve-Backing → Monetary Expansion (Mint) Flow

1. Eligible Sovereign Reserve value (properly classified, non-frozen, non-welfare, single-custodied, conservation-consistent — per Path E and Step-44) contributes to the `totalReserves` figure that gates `PahlaviToken.mint()`.
2. `mint()` proceeds only if the SWF (the sole `MINTER_ROLE` holder) calls it while `!emergencyMode`, and the `reserveCompliant` modifier independently confirms `totalSupply() + amount <= MAX_SUPPLY` **and** `(totalReserves * 1000) / newSupply >= MIN_RESERVE_RATIO` (per [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md)).
3. This is the **only** path by which recognized reserve backing translates into circulating Pahlavi supply — and it is gated by both doctrine constants simultaneously, with no override.

### Path I — Citizen Welfare Funding Flow (Structurally Separate)

1. `CitizenCard.sol` tracks citizen identity, employment status, and welfare/benefit **eligibility** — it is a status ledger, not a custody or accounting domain for value (per [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md), [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md)).
2. The 1,000 Pahlavi minimum wage is paid by **employers, off-chain**; `CitizenCard.sol` enforces eligibility tracking only, never custody or disbursement of reserve, treasury, or SWF value.
3. Where a welfare program *does* involve genuine on-chain value movement (e.g., a benefit disbursement funded from Treasury), that movement is itself an ordinary **Treasury withdrawal/expenditure** under existing Council/governance authorization — it is accounted for as Treasury outflow, never as a Reserve, SWF, or backing-related flow, and the welfare program's *eligibility scale* is never itself a basis for, or component of, any reserve, custody, deployment, or expansion computation (see Citizen Welfare Funding Boundaries below).

---

## Source → Classification → Custody → Deployment → Withdrawal Flow (Composite View)

Stitching Paths A–F together, the canonical end-to-end journey of a unit of recognized value is:

1. **Source**: value is recognized as entering the system through an authorized channel — Provincial revenue distribution, a Council-held external asset, or a confirmed reclaim credit (post-routing). At this point it is, at most, a recognized **Non-Reserve Treasury** or **Reclaimed-In-Transit** balance — never yet Reserve, never yet SWF-custodied.
2. **Classification**: the value is explicitly evaluated against the eight Eligibility Tests (Path E). Only on passing all eight does it become **Sovereign Reserve State**, countable toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`. Classification is a label change — it is independent of, though frequently coincident with, custody.
3. **Custody**: the value is held either at the Treasury ledger level or within an SWF layer (`layerL1`/`layerL2`/`layerL3`), reached via deposit (Path B) or reclaim credit (Path G, step 4). Custody and classification are tracked as two distinct, reconcilable properties of the same unit of value (Single-Custody Test, Step-44) — never merged, netted, or assumed from one another.
4. **Deployment**: custodied, eligible Reserve value may be deployed in one of three recognized ways — (a) intra-SWF L2→L1 yield flow (Path C), (b) Council-authorized withdrawal for a permitted Treasury/operational purpose (Path D), or (c) as backing that enables monetary expansion via `mint()` (Path H). No other deployment mechanism is recognized — see Step-42's prohibition on speculative/yield-bearing redeployment, carried forward unchanged.
5. **Withdrawal / Exit**: value exits its current state through one of the defined exit mechanisms — an executed Council withdrawal (Path D), an authorized declassification (Path F), a freeze-driven suspension (Path G, removing it temporarily from all domains), or a `Released` exit from the reclaim lifecycle (Path G, permanently removing it from the system). Every exit is explicit, authorized, conservation-consistent, auditable, and exactly-once.

At every step of this composite journey, the value's membership in `totalReserves` (and therefore its relevance to `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP`) is determined **solely** by its current classification state — never by its custody location, its source, its deployment history, or any oracle-submitted estimate of its worth.

---

## Reserve-Entry and Reserve-Exit Flow (Consolidated)

This section consolidates Paths E and F into a single statement of the only two ways value may cross the Sovereign Reserve boundary, restating the separation principle from [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md):

- **Entry (the only path in)**: Non-Reserve Treasury / SWF-custodied / routed-reclaimed value → Pending Classification → (pass all 8 Eligibility Tests) → Sovereign Reserve State. There is no other entry point. A balance does not "become" reserve through deposit alone, through reclaim crediting alone, through oracle valuation alone, through the passage of time, or through any default/implicit mechanism.
- **Exit (the only path out)**: Sovereign Reserve State → Pending Classification (declassification direction) → (authorized, conservation-consistent, doctrine-aware, lock-respecting, auditable, exactly-once confirmation) → Non-Reserve Treasury State (ordinarily). There is no other exit point. A balance does not "stop being" reserve through withdrawal alone (the classification and the custody are separate properties — see Composite View, step 3), through freezing (freezing suspends recognition entirely; it is not a declassification act), or through any implicit/default mechanism.
- **Symmetry of rigor**: entry and exit are governed with equal explicitness, equal auditability, and equal subordination to `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`. Neither direction is easier, faster, or less governed than the other — this symmetry is what makes the reserve boundary meaningful rather than nominal.

---

## Freeze and Reclaim Routing Flow (Consolidated)

This section restates Path G as a standalone routing diagram for clarity, consolidating the freeze-routing boundary already defined in Steps 43–44:

```
 [ any domain: Treasury / Reserve / SWF / external-owner held asset ]
                          │
                          ▼  (CRAWLER_ROLE initiates)
                    [ Active ]  ──── Frozen State ────┐
                          │                           │ (counts toward
                          ▼                           │  NO domain,
                  [ UnderReview ]                     │  NO doctrine
                          │                           │  computation)
                          ▼  (COUNCIL_ROLE, 3 sigs)   │
                    [ Confirmed ]  ── exits Frozen ───┘
                       │        │
        (KERNEL_ROLE)  │        │  (RECLAIM_ROLE, accounting-only,
                       ▼        ▼   credits L1, mints nothing)
                 [ Released ]  [ TransferredToSWF → SWF L1 custody ]
                       │                      │
            exits system entirely     NOT yet Reserve-classified —
            (no Treasury/Reserve/      must independently pass
             SWF accounting)           Path E (8 Eligibility Tests)
                                        to become Sovereign Reserve
```

Key invariants restated from Steps 43–44 and preserved here:

- The **only** entry to Frozen State is `CRAWLER_ROLE` initiation.
- The **only** exit from Frozen State is Council-confirmed `Confirmed` status.
- The **only** two exits from `Confirmed` are `Released` (Kernel-gated, system exit) and `TransferredToSWF` (Reclaim-Role-gated, L1 accounting credit only).
- A `TransferredToSWF` credit is **custody**, not **classification** — it must separately and explicitly pass Path E to ever count toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`.
- No other layer (TriggerProtocol, Jury, Citizen Layer, Oracle Layer) is a valid intermediate or terminal stop anywhere in this routing sequence.

---

## Citizen Welfare Funding Boundaries

Citizen Welfare is deliberately drawn **outside** the Treasury/Reserve/SWF/Frozen/Reclaimed flow perimeter. The boundaries that enforce this separation are:

1. **Eligibility ledger, not value ledger**: `CitizenCard.sol` records identity, employment status, and benefit eligibility. It holds no balances, custodies no assets, and is not a participant in any deposit, withdrawal, classification, or reclaim flow described above.
2. **Wages are off-chain and employer-borne**: the 1,000 Pahlavi minimum wage is paid by employers outside the chain. No flow path in this document — and none in Steps 41–46 — routes Treasury, Reserve, or SWF value toward wage payment. `CitizenCard.sol` enforces *eligibility tracking* for this obligation; it neither funds nor guarantees it on-chain.
3. **Genuine welfare disbursements are ordinary Treasury expenditure, never reserve flow**: to the extent any welfare program involves real on-chain value movement (e.g., a benefit paid from Treasury funds), that movement is an ordinary, Council/governance-authorized Treasury withdrawal and outflow — accounted for exactly as Path D describes, and excluded from `totalReserves`. It is never modeled, justified, or computed as a Reserve, SWF, custody, deployment, or backing flow.
4. **Welfare scale is never a flow input**: the number of eligible citizens, the projected aggregate wage bill, the volume of health credits or unemployment insurance claims, or any other welfare-derived figure is never an input to: reserve classification eligibility (Path E), declassification timing (Path F), SWF deposit/withdrawal sizing (Paths B/D), yield computation (Path C), reclaim routing (Path G), or monetary-expansion eligibility (Path H). This is the "Non-Welfare Test" from Step-44 and the welfare-exclusion doctrine from Step-45, restated here as a flow-level boundary rather than a classification-level one.
5. **No reverse flow from Welfare into Reserve/SWF**: just as reserve/treasury value may (under the ordinary Treasury-expenditure path) flow toward funding a welfare disbursement, no value, eligibility record, or derived figure flows in the reverse direction — from the Citizen Layer back into Treasury, Reserve, or SWF custody, classification, or accounting. The boundary is one-directional at most (Treasury → welfare expenditure, as ordinary outflow) and never bidirectional.

---

## Prohibited Flow Paths

The following end-to-end (or partial) flow paths are prohibited outright. Each restates and connects prohibitions already established individually in Steps 41–46; none may be performed under any governance configuration, optimization rationale, or emergency justification this document is aware of:

- **Source → Sovereign Reserve, skipping Classification**: any flow that treats a newly-sourced balance (Provincial revenue, Council deposit, reclaim credit, oracle-informed valuation) as automatically Reserve-classified without completing Path E's eight-test evaluation. (Restates Step-44's prohibition on implicit/default reclassification and Step-45's prohibition on self-referential backing.)
- **Frozen → any custody, classification, deployment, or expansion flow**: a frozen (`Active`/`UnderReview`) asset may not flow into Treasury, Reserve, SWF custody, withdrawal, yield computation, or `totalReserves`. The only flow out of Frozen State is the Council-confirmed routing in Path G. (Restates "frozen assets are not reserve assets," Steps 42–46.)
- **Reclaimed credit → automatic Reserve classification or automatic mint backing**: a `TransferredToSWF` accounting credit to L1 may not be treated as, by itself, Reserve-classified value, nor as a basis for `mint()` eligibility, without independently and explicitly completing Path E. (Restates "reclaimed assets are not automatic backing," Steps 44–46.)
- **Reclaimed credit → L2 or L3, or split across layers**: `receiveReclaimedAsset` is wired to L1 only; no flow may route or fragment a reclaim credit into L2, L3, or multiple layers. (Restates Step-46's prohibition.)
- **Oracle submission → direct flow action of any kind**: no oracle data submission (price, production, valuation, reserve update) may itself move value, classify a balance, trigger a deposit/withdrawal/yield/reclaim event, or authorize a mint. Oracle data informs; it never executes. (Restates "oracle signals are non-sovereign," Steps 41–46.)
- **Welfare/wage figures → any reserve, custody, deployment, or expansion flow**: no welfare eligibility count, wage-bill projection, or `CitizenCard.sol`-derived figure may serve as a source, classification basis, custody justification, deployment rationale, or expansion-eligibility input anywhere in the flow. (Restates "welfare/wages are non-reserve assets," Steps 41/44/45, and the Citizen Welfare Funding Boundaries above.)
- **Direct inter-layer SWF flow outside the defined yield path**: no flow may move value directly L1↔L3, L2↔L3, or L1→L2 — the only recognized intra-SWF flow is the fixed-formula L2→L1 annual yield (Path C). (Restates Step-46's prohibition.)
- **Withdrawal or expansion without completed authorization**: no flow may debit an SWF layer before `MULTISIG_REQUIRED = 3` is reached, nor mint Pahlavi before `reserveCompliant` independently confirms both the cap and ratio constraints. (Restates Steps 45–46.)
- **Cross-domain netting, merging, or "borrowing"**: no flow may net or merge Treasury, Reserve, SWF, Frozen, and Reclaimed balances into a combined doctrine-relevant total, nor temporarily reclassify value between Reserve and Non-Reserve to meet a short-term need with intent to reverse later. (Restates Step-42's and Step-44's prohibitions.)
- **Any flow requiring a new authority, role, or trigger code**: no flow path described or implied by this document may be enabled by introducing a new role, an expanded role scope, an alternate multi-sig configuration, a new trigger code, or any admin-style bypass. Every flow in this document is composed exclusively of mechanisms that already exist, unmodified. (Restates the "no admin backdoors" rule and Step-46's "No New Authorities" section.)
- **Implicit, default, replayed, or timeout-based flow of any kind**: no value may move, be classified, be custodied, be deployed, or exit as a side effect of an unrelated operation, a default configuration, a replayed event, or the passage of time without explicit authorization. Every flow segment in this document is explicit, authorized, recorded, and exactly-once. (Restates the cross-cutting exact-once/auditability principle from Steps 42/44/46.)

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Flow Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` / `MAX_SUPPLY` doctrine | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` |
| Reserve, treasury, SWF class definitions and eligibility | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) |
| Accounting boundaries, recognition rules, prohibited treatments, separation principle | [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) |
| Layer authority, data-flow, accounting-flow, trigger-flow, freeze-routing boundaries | [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) |
| Classification states, lifecycle transitions, eligibility tests, declassification, double-counting prevention | [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) |
| Monetary expansion eligibility, prohibited paths, ratio/cap protection, breach conditions | [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) |
| SWF lifecycle states, allowed/prohibited transitions, no-new-authorities | [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md) (Step-46) |
| Provincial revenue and 30/70 distribution | `contracts/governance/Provincial.sol`, `protocols/governance-protocol-fa.md` |
| SWF layers, deposits, withdrawals, yield, reclaim accounting | `contracts/monetary/SovereignWealthFund.sol`, `protocols/monetary-protocol-fa.md` |
| Mint/burn mechanics, `reserveCompliant`, emergency mode | `contracts/monetary/PahlaviToken.sol` |
| Reclaimed asset lifecycle and freeze routing | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol` |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol` |
| TR-01..TR-06 trigger codes, trigger lifecycle | `contracts/kernel.sol`, `contracts/core/TriggerProtocol.sol` |

Where this document and a contract, protocol, or a prior architecture formalization (Step-41/42/43/44/45/46) appear to differ, the contract, protocol, and prior formalizations remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document formalizes the end-to-end value-flow model across Treasury, Sovereign Reserve, SWF, Frozen Assets, Reclaimed Assets, and Citizen Welfare by synthesizing Steps 41–46 into nine allowed flow paths (A–I: provincial-revenue-to-SWF, council-deposit-to-SWF, intra-SWF yield, withdrawal-to-external-use, reserve entry, reserve exit, freeze-and-reclaim routing, reserve-to-expansion, and citizen-welfare funding), a composite source→classification→custody→deployment→withdrawal journey, a consolidated reserve-entry/reserve-exit statement preserving symmetry of rigor, a consolidated freeze-and-reclaim routing diagram, explicit citizen-welfare funding boundaries, and a comprehensive list of prohibited flow paths. It introduces no new authorities, roles, or trigger codes, and changes no contract, storage layout, threshold, or timeout. It explicitly preserves `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18`, the non-sovereignty of oracle signals, and the structural exclusion of citizen welfare and wage obligations from reserve, treasury, and SWF accounting. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
