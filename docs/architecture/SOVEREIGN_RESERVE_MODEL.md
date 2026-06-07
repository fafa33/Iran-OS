# Sovereign Reserve Model — Architecture Formalization (Step-41)

## Scope and Non-Goals

This document is a **documentation-only** formalization of the Sovereign Reserve Model for IranOS. It defines reserve classes, treasury classes, Sovereign Wealth Fund (SWF) classes, reserve eligibility, and non-eligible assets, as a reference specification for `docs/architecture/`.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant.
- Any role, modifier, or access-control assumption.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, expressed in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (900 billion Pahlavi).

These two doctrine values are treated as **immutable constitutional constants** (see `contracts/kernel.sol`, `TR_LIQUIDITY_CAP`). Any future proposal that alters them is, by definition, a constitutional amendment, not an architecture change, and is out of scope here.

This document is descriptive and organizational. It does not introduce new on-chain behavior, new admin powers, or any mechanism that could bypass the Kernel, the trigger protocol, or existing multi-sig requirements.

---

## Doctrine Constants (Preserved, Not Redefined)

| Constant | Value | Source of Truth | Status in This Document |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` | `900_000_000_000 * 1e18` (900 billion Pahlavi) | `contracts/kernel.sol` | Preserved — referenced only |

These values are restated here for organizational clarity only. The Kernel constants remain the binding, authoritative definitions. No value, formula, or threshold in this document overrides, recomputes, or relaxes either constant.

---

## Reserve Classes

The Sovereign Reserve Model recognizes the following reserve classes for specification and documentation purposes:

- **Sovereign Liquidity Reserve**: the portion of national reserves directly subject to `LIQUIDITY_CAP`. This class can never, by constitutional doctrine, exceed 900 billion Pahlavi in recognized circulating backing.
- **Minimum Backing Reserve**: the floor of recognized reserve value required to satisfy `MIN_RESERVE_RATIO` (33.3%) against circulating monetary obligations. This class exists to describe the accounting floor — it does not define a new enforcement mechanism beyond what the Kernel already encodes.
- **Locked Reserve**: reserve value held as non-deployable backing or constitutional continuity protection. Cannot be reclassified without the governance path already required by the relevant protocol (e.g., Court action, Sovereign authorization, or council multi-sig).
- **Deployable Reserve**: reserve value eligible for permitted use (e.g., SWF withdrawals under `MULTISIG_REQUIRED`) once all backing, locking, and encumbrance constraints are satisfied.
- **Emergency Reserve**: reserve value set aside for bounded emergency continuity, governed by the same trigger and court-adjudication assumptions already defined in `kernel.sol` and the trigger protocol.
- **Encumbered Reserve**: reserve value subject to pending claims, freezes (`AssetFreeze.sol`), withdrawals, or unresolved classification — not countable as freely deployable.

Reserve classes describe **accounting state**, not new contract mechanisms. Classification or reclassification between these classes must conserve total recognized value and must not implicitly unlock locked or encumbered balances.

---

## Treasury Classes

Treasury balances are organized into the following documentation-level classes:

- **National Treasury Balance**: the aggregate balance recognized at the national treasury, fed in part by the Provincial 30/70 distribution formula (`PROVINCIAL_SHARE = 300`, i.e., 30% provincial / 70% national, per `Provincial.sol`).
- **Provincial Treasury Balance**: the share retained at the provincial level under the same 30/70 formula. Subject to provincial productivity bonus eligibility (`productivityScore > 70`) as already defined in `Provincial.sol`.
- **Operational Treasury Balance**: funds allocated for ordinary governance operations (e.g., welfare disbursement support referenced in `CitizenCard.sol`, oracle operating costs).
- **Pending/In-Transit Treasury Balance**: balances in the process of being classified, transferred, or reconciled — not yet assigned to a final reserve or operational class.
- **Non-Reserve Treasury Balance**: treasury value that has not been explicitly classified as reserve backing. This balance does not count toward `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP` accounting until it is classified through a permitted governance path.

Treasury classes are an organizational lens over existing balances; they do not introduce a new ledger, a new contract, or a new storage slot.

---

## Sovereign Wealth Fund (SWF) Classes

The SWF classes documented here map directly onto the existing three-layer structure already defined in `SovereignWealthFund.sol` (`layerL1`, `layerL2`, `layerL3`):

- **L1 — Cash / Liquid Reserve Class** (نقد): target 300 billion USD-equivalent (`L1_TARGET`). The most liquid, immediately deployable layer; primary contributor to short-horizon liquidity accounting relevant to `LIQUIDITY_CAP` review.
- **L2 — Productive Reserve Class** (مولد): target 300 billion USD-equivalent (`L2_TARGET`). Income-generating assets; source of the annual yield distribution (`ANNUAL_YIELD = 150`, i.e., 15%) that flows L2 → L1 via `distributeAnnualYield()`.
- **L3 — Pledged / Strategic Reserve Class** (گرو): target 2 trillion USD-equivalent (`L3_TARGET`). Long-horizon strategic assets; least liquid, longest reclassification path.
- **Reclaimed Asset Class**: assets recovered through `AssetFreeze.sol` and credited to the SWF only through the authorized `TransferredToSWF` status transition. Must enter accounting exactly once and must not duplicate prior history.

All SWF withdrawals remain subject to the existing `MULTISIG_REQUIRED = 3` council-signature floor. This document does not propose, imply, or describe any path that would reduce that floor or bypass `COUNCIL_ROLE` review.

---

## Reserve Eligibility

An asset or balance is eligible for recognition as **Sovereign Reserve** (and therefore eligible to count toward `MIN_RESERVE_RATIO` backing and `LIQUIDITY_CAP` accounting) only if it satisfies **all** of the following:

1. **Authorized Source**: the balance entered the system through an authorized path — Council deposit (`depositToL1/L2/L3`), confirmed reclaim transfer (`AssetFreeze.Confirmed → TransferredToSWF`), or another explicitly governance-approved channel. Unauthorized or unverified inflows are not eligible.
2. **Conservation-Consistent**: recognizing the asset as reserve must not create value — it must be matched by a corresponding debit elsewhere in the conservation boundary (treasury, reclaim, or external deposit accounting).
3. **Unencumbered for Its Stated Class**: the asset is not simultaneously subject to an active freeze (`AssetFreeze.Active`/`UnderReview`), a pending withdrawal lock, or a disputed classification claim that would make double-counting possible.
4. **Classified into a Recognized Layer**: the asset is assigned to exactly one of L1 (Cash), L2 (Productive), or L3 (Pledged), or to an explicitly defined reserve class above — never left in an ambiguous or dual classification.
5. **Within Doctrine Bounds**: recognizing the asset does not cause total recognized liquidity backing to exceed `LIQUIDITY_CAP`, and does not retroactively misstate compliance with `MIN_RESERVE_RATIO`.
6. **Auditable**: the classification produces a traceable record (deposit event, transaction record, or reclaim status transition) suitable for later audit, invariant checks, or formal verification — consistent with existing event emissions (`DepositToL1/L2/L3`, `WithdrawalExecuted`, `AnnualYieldDistributed`).

Eligibility is a **classification gate**, not a value-creation mechanism. Meeting these criteria changes how a balance is *counted and organized*; it never changes how much value exists.

---

## Non-Eligible Assets

The following are explicitly **not eligible** for recognition as Sovereign Reserve, Treasury backing, or SWF layer balance under this model:

- **Unverified or Unauthorized Inflows**: any balance that did not arrive through Council deposit, an authorized oracle-fed revenue path (`Provincial.sol` 30/70 distribution), or a confirmed reclaim transfer.
- **Frozen or Under-Review Assets**: assets in `AssetFreeze.Active` or `UnderReview` status. These remain pending and cannot be double-counted as available reserve until `Confirmed` and routed to `TransferredToSWF` or, if appropriate, `Released`.
- **Speculative or Yield-Seeking Deployments**: SWF balances must not be treated as capital for staking, lending, DeFi yield farming, or other speculative deployment. The only recognized yield mechanism is the existing `distributeAnnualYield()` L2 → L1 flow at the fixed `ANNUAL_YIELD` rate.
- **Disputed or Duplicated Reclaim Records**: any reclaim accounting entry that would replay or duplicate a prior `TransferredToSWF` credit. Reclaim transfers must be exact-once.
- **Oracle-Asserted Value Without Governance Confirmation**: price, production, or valuation signals from `API3Oracle.sol` may inform review but cannot, by themselves, classify, reclassify, or recognize an asset as reserve. Oracle data is a signal, not a sovereign action.
- **Off-Chain Wage Obligations**: the 1,000 Pahlavi minimum wage and related employer obligations tracked conceptually by `CitizenCard.sol` are explicitly **not** SWF or treasury reserve assets — `CitizenCard.sol` manages eligibility and status only; wages are paid by employers off-chain.
- **Balances That Would Breach Doctrine on Recognition**: any balance whose recognition would cause total liquidity backing to exceed `LIQUIDITY_CAP`, or would misrepresent compliance with `MIN_RESERVE_RATIO`, must remain classified as Non-Reserve Treasury Balance until the doctrine constraint is independently satisfied. Doctrine constraints are never relaxed to accommodate a classification.

---

## Relationship to Existing Protocols and Contracts

This formalization is purely organizational and maps onto contracts and protocols that already exist:

| Model Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` doctrine | `contracts/kernel.sol` |
| SWF L1/L2/L3 layers, withdrawals, yield | `contracts/monetary/SovereignWealthFund.sol`, `protocols/monetary-protocol-fa.md` |
| Provincial treasury 30/70 split | `contracts/governance/Provincial.sol`, `protocols/governance-protocol-fa.md` |
| Reclaimed asset accounting | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol` |
| Citizen welfare (non-reserve) | `contracts/welfare/CitizenCard.sol` |

Where this document and a contract or protocol appear to differ, the contract and protocol remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document organizes Sovereign Reserve, Treasury, and Sovereign Wealth Fund balances into named classes, and defines eligibility and non-eligibility criteria for reserve recognition — without altering any contract, storage layout, threshold, timeout, or the constitutional doctrine values `MIN_RESERVE_RATIO = 333` and `LIQUIDITY_CAP = 900,000,000,000 × 1e18`. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
