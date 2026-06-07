# Treasury Accounting Rules — Architecture Formalization (Step-42)

## Scope and Non-Goals

This document is a **documentation-only** formalization of Treasury Accounting Rules for IranOS. It defines Treasury asset classes, the accounting boundaries between Treasury, Sovereign Reserve, the Sovereign Wealth Fund (SWF), Reclaimed Assets, and Frozen Assets, recognition rules, prohibited accounting treatments, and the reserve-to-treasury separation principle.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant.
- Any role, modifier, or access-control assumption.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (900 billion Pahlavi).

These two doctrine values remain immutable constitutional constants defined in `contracts/kernel.sol` (`MIN_RESERVE_RATIO`, `TR_LIQUIDITY_CAP` / `LIQUIDITY_CAP`). This document restates them only for organizational reference; it neither recomputes nor relaxes them. Any proposal to alter either value is a constitutional amendment, not an architecture or accounting change, and is out of scope here.

This document builds on, and does not contradict, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) — that document defines reserve, treasury, and SWF *classes*; this document defines the *accounting rules and boundaries* governing how value moves between them.

---

## Doctrine Constants (Preserved, Not Redefined)

| Constant | Value | Source of Truth | Status in This Document |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` | `900_000_000_000 * 1e18` (900 billion Pahlavi) | `contracts/kernel.sol` | Preserved — referenced only |

Every accounting rule in this document is subordinate to these two constants. No recognition rule, transition, or reclassification described below may be read as a way to satisfy, approximate, or work around either constant — they constrain accounting; accounting cannot redefine them.

---

## Treasury Asset Classes

For accounting purposes, Treasury-held value is organized into the following asset classes:

- **Liquid Treasury Assets**: balances immediately available for ordinary governance operations (e.g., funding oracle operating costs, supporting the welfare disbursement flows referenced in `CitizenCard.sol`). Closest in nature to SWF L1 (Cash), but held at the treasury layer rather than within the SWF.
- **Provincial-Origin Assets**: balances arriving via the 30/70 revenue split defined in `Provincial.sol` (`PROVINCIAL_SHARE = 300`) — 30% retained provincially, 70% forwarded to the National Treasury, including any productivity-bonus allocations for provinces with `productivityScore > 70`.
- **Pending/In-Transit Assets**: balances awaiting classification, transfer, settlement, or reconciliation — neither confirmed Treasury operational balance nor confirmed Sovereign Reserve.
- **Encumbered Treasury Assets**: balances subject to pending obligations, claims, disputes, or holds that prevent them from being counted as freely available, even though they have not been formally frozen.
- **Reserve-Designated Treasury Assets**: Treasury balances that have been classified, through a permitted governance path, as contributing to Sovereign Reserve backing (and therefore to `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` accounting).
- **Non-Reserve Treasury Assets**: the residual class — Treasury balances that exist, are recognized, and are accounted for, but have **not** been classified as reserve backing. These do not count toward `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP` until explicitly reclassified.

Every Treasury balance must be assigned to exactly one of these classes at any given time. Ambiguous, dual, or unclassified assignment is itself a recognition failure (see Recognition Rules below).

---

## Accounting Boundaries

The Sovereign Reserve Model recognizes five distinct accounting domains. Each domain has its own authoritative source of truth, and value may only cross between them through an explicit, authorized, auditable transition. This section defines the boundary between each pair.

### 1. Treasury ↔ Sovereign Reserve

- The Treasury domain is the broader accounting surface: it includes Reserve-Designated, Non-Reserve, Pending, Encumbered, and Liquid/Provincial-Origin assets.
- The Sovereign Reserve domain is a **subset** of recognized value that has been explicitly classified as reserve backing, per [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md).
- Crossing this boundary (Treasury → Reserve, or Reserve → Treasury) requires an explicit classification or declassification action through a permitted governance path — it is never implicit, automatic, or inferable from balance size alone.
- A balance counts toward `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` **only** while it sits on the Sovereign Reserve side of this boundary.

### 2. Treasury ↔ Sovereign Wealth Fund (SWF)

- The SWF (`SovereignWealthFund.sol`) is a distinct contract with its own ledger (`layerL1`, `layerL2`, `layerL3`, `transactions`, `txSignatures`).
- Treasury and SWF balances are **never** netted, merged, or treated as a single pool for accounting purposes. A balance is either a Treasury balance or an SWF layer balance — never both, and never "shared."
- Movement across this boundary occurs only through the SWF's own authorized entry points: Council deposits (`depositToL1/L2/L3`), Council-signed withdrawals (`proposeWithdrawal` / `signWithdrawal`, gated by `MULTISIG_REQUIRED = 3`), and the L2 → L1 annual yield flow (`distributeAnnualYield`, `ANNUAL_YIELD = 150`).
- `nationalTreasury` (the address recorded in `SovereignWealthFund.sol`) is the only recognized Treasury-side counterparty for SWF accounting; it is not itself an SWF layer and must not be counted inside `layerL1/L2/L3` balances.

### 3. Treasury/SWF ↔ Reclaimed Assets

- Reclaimed assets originate exclusively from the `AssetFreeze.sol` lifecycle (`Active → UnderReview → Confirmed → TransferredToSWF` or `Released`).
- An asset remains in the **Reclaimed Assets** domain — outside both Treasury and SWF accounting — until it reaches `Confirmed` status with the required 3 `COUNCIL_ROLE` signatures.
- The **only** authorized crossing from Reclaimed Assets into recognized accounting is the `Confirmed → TransferredToSWF` transition, which credits the SWF (never the Treasury directly, and never both).
- A `Confirmed → Released` transition returns the asset to its prior owner/domain and explicitly does **not** cross into Treasury, Reserve, or SWF accounting.
- Reclaimed value must be credited exactly once. A reclaim record that has already produced a `TransferredToSWF` credit must never produce a second credit anywhere in the system.

### 4. Any Domain ↔ Frozen Assets

- Frozen assets (`AssetFreeze.Active` / `UnderReview`) sit in a **suspended accounting state**. They are not Treasury assets, not Sovereign Reserve, not SWF balances, and not yet Reclaimed Assets in the recognized sense — they are pending a determination.
- No domain (Treasury, Reserve, SWF) may count a frozen or under-review asset as part of its recognized balance, deployable balance, or reserve backing.
- The only authorized exits from the Frozen Assets domain are the two `Confirmed`-gated transitions described above (`→ TransferredToSWF` or `→ Released`), each requiring the 3-of-N `COUNCIL_ROLE` confirmation already defined in `AssetFreeze.sol`.
- Initiation of a freeze (`CRAWLER_ROLE`) and release of a freeze (`KERNEL_ROLE`) remain governed exactly as already specified — this document adds no new initiation, confirmation, or release path.

### 5. Sovereign Reserve ↔ SWF

- Sovereign Reserve is an accounting *classification* (a designation that a balance counts toward doctrine backing); the SWF is a *custodial ledger* (a contract holding and tracking specific layer balances).
- A balance can be both SWF-held and Reserve-classified simultaneously (e.g., SWF L1/L2/L3 balances are the principal real-world expression of Sovereign Reserve). This document does not treat that overlap as double-counting, **provided** each unit of value is counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` exactly once, traceable to a single SWF layer entry.
- Conversely, a balance can be Treasury-held without being Reserve-classified (Non-Reserve Treasury Assets), and a balance can — in principle — be Reserve-classified through a governance path other than the SWF, provided it is recorded with the same auditability and exact-once guarantees. This document does not assume the SWF is the only possible reserve custodian, but it does assume every reserve-classified unit of value has exactly one custodial record.

---

## Recognition Rules

A balance, asset, or value unit may be **recognized** within a given accounting domain (Treasury, Sovereign Reserve, SWF, Reclaimed Assets) only if all of the following hold:

1. **Single Domain Assignment**: it is assigned to exactly one domain and exactly one asset/balance class within that domain at any point in time. No simultaneous "Treasury and Reclaimed," "Frozen and Deployable," or "Reserve and Non-Reserve" states.
2. **Authorized Origin**: it entered its current domain through an authorized path — a Council deposit, a confirmed reclaim transfer, an oracle-fed revenue distribution already gated by existing contract logic, or another explicitly governance-approved channel. Unverified or unauthorized inflows are not recognized (see Prohibited Accounting Treatments).
3. **Conservation-Consistent Entry**: recognition in the new domain is matched by a corresponding debit/exit from the prior domain. Recognition never creates value; it only relocates or relabels already-existing, already-accounted value.
4. **Constraint-Aware**: recognition as Sovereign Reserve must not cause total recognized liquidity backing to exceed `LIQUIDITY_CAP`, and must not cause the system to misstate compliance with `MIN_RESERVE_RATIO`. If recognizing a balance as reserve would breach either constant, it must instead be recognized as Non-Reserve Treasury Assets (or remain in its prior domain) until the constraint is independently satisfiable.
5. **Auditable**: recognition produces a traceable record consistent with existing event emissions and status transitions (`DepositToL1/L2/L3`, `WithdrawalProposed/Signed/Executed`, `AnnualYieldDistributed`, `AssetFreeze` status events, `Provincial` distribution records).
6. **Exactly-Once**: a given unit of value, once recognized in a domain, is never re-recognized through a replayed, duplicated, or stale record. Recognition is idempotent with respect to its authorizing event.

A balance that fails any of these tests must remain (or revert to) its last validly-recognized state — typically Pending, Encumbered, or Non-Reserve Treasury — never an "upgraded" or more-favorable classification.

---

## Prohibited Accounting Treatments

The following accounting treatments are prohibited under this model, regardless of convenience, optimization, or apparent efficiency:

- **Netting Across Domains**: Treasury, Sovereign Reserve, SWF, Reclaimed Assets, and Frozen Assets balances must never be netted, merged, or presented as a single combined figure for doctrine-compliance purposes (`MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`). Each domain's balance is computed and reported on its own terms.
- **Double-Counting**: a single unit of value must never be counted simultaneously in two domains, two asset classes, or two SWF layers. This applies in particular to the Sovereign Reserve ↔ SWF overlap described above — it must always resolve to exactly one custodial record per unit of value.
- **Implicit Reclassification**: no balance may move between Treasury, Reserve, SWF, Reclaimed, or Frozen domains "automatically," by inference, by default, or as a side effect of an unrelated operation. Every cross-domain movement requires an explicit, authorized, recorded transition.
- **Counting Encumbered, Pending, or Frozen Value as Deployable or as Reserve Backing**: such value must be excluded from `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` computations, and from any "available for use" reporting, until it is released or confirmed through its required authorization path.
- **Treating Oracle Signals as Accounting Entries**: data from `API3Oracle.sol` (price, production, governance, judicial, military, welfare signals) may inform review but must never itself constitute a recognition, classification, reclassification, freeze, release, or transfer. Oracle data is a signal; accounting entries require governance- or Council-authorized action.
- **Speculative or Yield-Bearing Redeployment**: Treasury, Reserve, or SWF balances must not be lent, staked, deployed into DeFi protocols, or otherwise redeployed for yield outside the single, already-defined `distributeAnnualYield()` L2 → L1 mechanism at the fixed `ANNUAL_YIELD` rate.
- **Replaying or Duplicating Transitions**: a withdrawal, deposit, reclaim transfer, freeze release, or reclassification that has already executed must never be re-applied to produce a second accounting effect.
- **Recognizing Value to Satisfy Doctrine Retroactively**: it is prohibited to reclassify, recognize, or "discover" reserve value specifically to bring a reported ratio into compliance with `MIN_RESERVE_RATIO` after the fact, or to keep a reported total under `LIQUIDITY_CAP` by relabeling rather than by genuinely constraining issuance. Doctrine compliance must be a property of real balances and real constraints, not of presentation.
- **Off-Chain Wage Obligations as Reserve or Treasury Assets**: the 1,000 Pahlavi minimum wage and related employer obligations conceptually tracked via `CitizenCard.sol` are not Treasury, Reserve, or SWF assets. `CitizenCard.sol` manages eligibility/status only; wages remain an off-chain employer obligation and must not appear in any of the accounting domains defined here.

---

## Reserve-to-Treasury Separation

The separation between Sovereign Reserve and general Treasury balances is a foundational accounting principle, not an optional convenience:

- **Reserve is a designated subset, not the whole**: at any time, Sovereign Reserve recognized value is a clearly bounded, explicitly classified subset of total recognized national value. The remainder is Non-Reserve Treasury — real, accounted-for, but not counted toward doctrine constants.
- **Doctrine constants apply only to the Reserve side**: `MIN_RESERVE_RATIO` (the floor) and `LIQUIDITY_CAP` (the ceiling) are computed exclusively over the Sovereign Reserve domain. Non-Reserve Treasury balances are neither a substitute for meeting the floor nor a contributor that could be miscounted toward the ceiling.
- **Crossing the separation requires explicit classification**: moving value from Non-Reserve Treasury into Sovereign Reserve (or back) is itself a governed, recorded, auditable act — never a passive consequence of balances changing size, of time passing, or of an unrelated operation completing.
- **Separation protects both directions**: it prevents the Treasury from being "padded" to look reserve-compliant, and it equally prevents Reserve balances from being informally treated as general-purpose Treasury funds available for ordinary operational spending.
- **Separation is preserved across all domains**: the same discipline extends to the SWF (a custodial expression of Reserve, not a second Treasury), to Reclaimed Assets (which must resolve into exactly one domain before being counted anywhere), and to Frozen Assets (which count in neither domain while suspended).

This separation exists so that doctrine compliance — `MIN_RESERVE_RATIO = 333` and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` — remains a verifiable property of a clearly bounded set of balances, rather than a claim about an ambiguous, commingled total.

---

## Relationship to Existing Protocols and Contracts

This formalization is purely organizational and maps onto contracts and protocols that already exist:

| Model Element | Existing Source of Truth |
|---|---|
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` doctrine | `contracts/kernel.sol` |
| SWF layers, deposits, withdrawals, yield | `contracts/monetary/SovereignWealthFund.sol`, `protocols/monetary-protocol-fa.md` |
| Provincial 30/70 split, productivity bonus | `contracts/governance/Provincial.sol`, `protocols/governance-protocol-fa.md` |
| Reclaimed asset lifecycle | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol` |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol` |
| Reserve and SWF class definitions | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) |

Where this document and a contract, protocol, or the Sovereign Reserve Model appear to differ, the contract and protocol remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document defines Treasury asset classes, the accounting boundaries between Treasury, Sovereign Reserve, the Sovereign Wealth Fund, Reclaimed Assets, and Frozen Assets, recognition rules for when value may be counted in a given domain, accounting treatments that are prohibited regardless of convenience, and the principle of reserve-to-treasury separation — all without altering any contract, storage layout, threshold, timeout, or the constitutional doctrine values `MIN_RESERVE_RATIO = 333` and `LIQUIDITY_CAP = 900,000,000,000 × 1e18`. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
