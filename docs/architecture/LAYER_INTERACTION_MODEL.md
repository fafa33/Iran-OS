# Layer Interaction Model — Architecture Formalization (Step-43)

## Scope and Non-Goals

This document is a **documentation-only** formalization of the Layer Interaction Model for IranOS. It defines the interaction boundaries between the Kernel, Treasury, Sovereign Reserve, Sovereign Wealth Fund (SWF), TriggerProtocol, Jury (`JurySelection`), Citizen Layer (`CitizenCard` and the citizen application surface), and Oracle Layer (`API3Oracle`), along with authority, data-flow, accounting-flow, trigger-flow, and freeze-routing boundaries.

This document does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant (including `MULTISIG_THRESHOLD = 7`, `TRIGGER_TIMEOUT = 72 hours`, `MULTISIG_REQUIRED = 3`, `COUNCIL_THRESHOLD = 3`, `INTERIM_REPLACEMENT_DELAY = 24 hours`, `JURY_SIZE = 12`, `CONVICTION_THRESHOLD = 8`, `ACQUITTAL_THRESHOLD = 5`).
- Any role, modifier, or access-control assumption (`onlyKernel`, `onlyCourt`, `onlyOracle`, `onlySovereign`, `onlyGuardian`, `onlyRole(...)`).
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` and `LIQUIDITY_CAP = 900,000,000,000 × 1e18`.

This document builds on, and does not contradict, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41, reserve/treasury/SWF classes and eligibility) and [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42, accounting boundaries and recognition rules). Where Step-41/Step-42 define *what* counts and how it is accounted, this document defines *who may act, in what direction, carrying what kind of flow* — the interaction surface between layers.

---

## Layers Covered

| Layer | Primary Source of Truth |
|---|---|
| Kernel | `contracts/kernel.sol` (`IranOS_Kernel`) |
| Treasury | `nationalTreasury` (referenced by `SovereignWealthFund.sol`), `Provincial.sol` distribution flows |
| Sovereign Reserve | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md), backed by doctrine constants in `kernel.sol` |
| Sovereign Wealth Fund (SWF) | `contracts/monetary/SovereignWealthFund.sol` |
| TriggerProtocol | `contracts/core/TriggerProtocol.sol` |
| Jury | `contracts/justice/JurySelection.sol` |
| Citizen Layer | `contracts/welfare/CitizenCard.sol`, citizen application surface |
| Oracle Layer | `contracts/oracles/API3Oracle.sol` |

`ConstitutionGuard.sol` and `AssetFreeze.sol` are referenced where they mediate interactions (law approval and freeze routing, respectively) but are not separately listed as top-level layers, consistent with the project's existing domain table.

---

## Interaction Boundaries

This section defines, for each pair of layers that legitimately interact, the direction and nature of that interaction. A boundary not listed here is, by default, **not** a sanctioned direct interaction — any apparent need for one should be routed through the Kernel.

### Kernel ↔ Treasury / Sovereign Reserve / SWF

- The Kernel holds recorded addresses for `sovereignWealthFund` and coordinates with `triggerProtocol`. It is the layer that authorizes — directly or via `TriggerProtocol` — actions that affect Treasury access and SWF-relevant state.
- The Kernel does not itself hold or move Treasury or Reserve balances; it authorizes and orchestrates. Balance custody and movement remain with `SovereignWealthFund.sol`, the Treasury address, and the accounting rules in [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md).
- The Kernel's relationship to Sovereign Reserve is doctrinal, not custodial: `LIQUIDITY_CAP` and `MIN_RESERVE_RATIO` are Kernel-defined immutable constants that bound what Treasury/Reserve/SWF accounting may recognize — the Kernel does not perform the accounting itself.

### Kernel ↔ TriggerProtocol

- The Kernel is the **only** authorized caller of `TriggerProtocol.executeTrigger()` (`onlyKernel`). `TriggerProtocol` cannot self-invoke, cannot be triggered by any other layer, and cannot originate a trigger sequence on its own.
- `TriggerProtocol` reports execution outcomes back through its own state (`executions`, `TriggerExecuted` events) and through calls into `ITreasury.blockAddressByTrigger`; it does not call back into the Kernel to expand its own authority or the Kernel's.
- The Kernel performs violation recording, multi-sig confirmation (`MULTISIG_THRESHOLD = 7` of 9), and activation (`_activateTrigger`); `TriggerProtocol` performs *execution* of an already-authorized decision. This division is the basis of the "TriggerProtocol cannot create authority" doctrine (see Preserved Doctrine below).

### Kernel ↔ Jury (JurySelection)

- `JurySelection` is constructed with the Kernel as `DEFAULT_ADMIN_ROLE` and `KERNEL_ROLE` holder, establishing the Kernel as the root authority over the jury system's administrative configuration.
- Day-to-day jury operation (selection via `VRF_ROLE`, voting, verdict recording) proceeds under `COURT_ROLE`/`VRF_ROLE` without requiring per-case Kernel intervention — the Kernel's role is constitutional/administrative oversight, not case-by-case operation.
- Verdicts (`VerdictReached`, `SecondRoundRequired`) are case-scoped outputs. They do not, by themselves, invoke Kernel functions, alter Kernel state, or feed into the trigger lifecycle except through whatever explicitly-defined path (if any) a future protocol formally specifies — this document does not assume or create such a path.

### Kernel ↔ Citizen Layer (CitizenCard)

- The Citizen Layer manages identity, employment status, and welfare eligibility (`CitizenCard.sol`). It is a status/eligibility ledger, not an authority-bearing layer.
- The Kernel does not directly manage individual citizen records; any Kernel-level interaction with the Citizen Layer would be at the level of system configuration or constitutional compliance, not individual citizen state.
- Wage payment is explicitly off-chain and employer-borne (per [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) and `CitizenCard.sol` design notes); the Citizen Layer does not draw funds from, or place obligations on, the Kernel, Treasury, Reserve, or SWF.

### Kernel ↔ Oracle Layer (API3Oracle)

- Oracle feeders hold `ORACLE_ROLE`/`KERNEL_ROLE`-scoped permissions as already defined; the Kernel is the layer that grants and recognizes oracle authority, not the other way around.
- Military data (`MILITARY` / type 5) is restricted to `KERNEL_ROLE` — the one case where the Kernel is itself positioned as a privileged data recipient rather than a pure authorizer, and this restriction is preserved unchanged.
- Oracles may call `flagViolation()` to surface a possible violation, but flagging is **reporting**, not adjudication or activation — the Kernel (with Court/multi-sig participation) remains the layer that confirms and activates triggers.

### Treasury ↔ Sovereign Reserve ↔ SWF

- These three are described in detail in [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Treasury↔Reserve, Treasury↔SWF, Reserve↔SWF boundaries). This document does not redefine those accounting boundaries; it notes only that **interaction** between them (deposits, withdrawals, classification, reclassification) occurs exclusively through the already-authorized entry points (`depositToL1/L2/L3`, `proposeWithdrawal`/`signWithdrawal`, `distributeAnnualYield`, governance classification actions) and is gated by `COUNCIL_ROLE` multi-sig (`MULTISIG_REQUIRED = 3`) where applicable.
- No new interaction path between these three is introduced or implied here.

### TriggerProtocol ↔ Treasury / SWF

- `TriggerProtocol` interacts with Treasury through the `ITreasury.blockAddressByTrigger` interface and with the SWF through its recorded `swf` address — both supplied at construction and used only within the already-defined execution flow (`executeTrigger` → block treasury access, revoke signature, notify, optionally activate interim replacement).
- This interaction is **one-directional and narrow**: TriggerProtocol may instruct a block/revoke action on an offending address; it does not gain general read/write access to Treasury or SWF balances, layers, or accounting state. It cannot move funds, reclassify reserves, or alter SWF layer balances.

### TriggerProtocol ↔ Citizen Layer / Jury / Oracle Layer

- No direct interaction is defined or implied between `TriggerProtocol` and the Citizen Layer, Jury, or Oracle Layer. `TriggerProtocol`'s execution surface is scoped to offender access revocation, treasury blocking, public notification, and interim replacement — all addressed through the Kernel-authorized `executeTrigger` call.
- Any apparent need for `TriggerProtocol` to affect citizen status, jury proceedings, or oracle configuration must be routed through the Kernel as a new, explicitly-authorized decision — never inferred as an implicit extension of `executeTrigger`.

### Jury ↔ Treasury / Reserve / SWF / Citizen Layer / Oracle Layer

- `JurySelection` is scoped to case adjudication: jury selection, vote submission (with ZK-proof presence checks), and verdict recording. It does not call into, read from, or write to Treasury, Reserve, SWF, Citizen, or Oracle state.
- A verdict is a **judicial fact** about a specific case. It does not, on its own, move funds, change reserve classification, alter citizen eligibility, or reconfigure oracle feeds. Any consequence a verdict has on those domains must flow through an explicitly-authorized downstream process (e.g., a Kernel- or Court-initiated action referencing the verdict) — this is the basis of the "Jury verdicts do not mutate unrelated domains" doctrine (see Preserved Doctrine below).

### Citizen Layer ↔ Oracle Layer

- Welfare-relevant data (`WELFARE` / type 6) may be fed by oracles into systems that inform citizen status review, but `API3Oracle.sol` does not itself write to `CitizenCard.sol` state — any such linkage would be an explicitly-defined integration outside the scope of either contract as currently specified, and this document does not assume one exists.

### Oracle Layer ↔ Sovereign Reserve / Treasury / SWF

- Oracles may feed `PRICE` and `PRODUCTION` data relevant to valuation and revenue (e.g., informing the data that flows into `Provincial.sol` distributions). This is **signal provision**, not accounting action — the actual recognition, classification, and distribution remain governed by the rules in [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md).
- Oracles cannot classify a balance as Sovereign Reserve, cannot trigger an SWF deposit/withdrawal, and cannot adjust `LIQUIDITY_CAP` or `MIN_RESERVE_RATIO` accounting by submitting data — see Oracle Signal Boundaries below.

---

## Authority Boundaries

- **The Kernel is the apex authority.** `SOVEREIGN_ROLE`, `COURT_ROLE`, `ORACLE_ROLE`, and `GUARDIAN_ROLE` are recognized and coordinated through the Kernel; the Kernel is the layer that defines the immutable constitutional constants (`TR_01`–`TR_06`, `LIQUIDITY_CAP`, `MIN_RESERVE_RATIO`, `MULTISIG_THRESHOLD`, `TRIGGER_TIMEOUT`).
- **No layer may grant itself authority it was not explicitly given.** `TriggerProtocol` operates strictly under `onlyKernel`; `JurySelection` operates under Kernel-rooted `DEFAULT_ADMIN_ROLE`/`KERNEL_ROLE` plus case-scoped `COURT_ROLE`/`VRF_ROLE`; `AssetFreeze` operates under `CRAWLER_ROLE` (initiate), `COUNCIL_ROLE` (confirm), and `KERNEL_ROLE` (release); `SovereignWealthFund` operates under `SOVEREIGN_ROLE`, `COUNCIL_ROLE`, `KERNEL_ROLE`, `RECLAIM_ROLE`.
- **Authority is scoped, not transferable by side effect.** Holding a role in one contract does not imply holding an equivalent role in another. `KERNEL_ROLE` in `TriggerProtocol` is distinct from `KERNEL_ROLE` in `JurySelection`, `AssetFreeze`, or `SovereignWealthFund` — each is independently granted per the relevant constructor/role-management logic.
- **Multi-sig and council thresholds are authority floors, not ceilings to be optimized away.** `MULTISIG_THRESHOLD = 7` (trigger activation), `MULTISIG_REQUIRED = 3` (SWF withdrawal), `COUNCIL_THRESHOLD = 3` (asset freeze confirmation) define the minimum collective authority required — no single layer, including the Kernel, bypasses these by acting alone.
- **The Court retains exclusive deactivation authority for emergency locks** (`onlyCourt`), and exclusive law-approval authority is mediated through the Kernel via `ConstitutionGuard` (`approveLaw`/`rejectLaw` are `onlyKernel`-gated). No other layer may approve laws or lift an emergency lock.

---

## Data-Flow Boundaries

- **Oracle Layer → Kernel / Treasury / Reserve / Provincial / Citizen (informational only)**: price, production, governance, judicial, welfare data flows from oracles toward the layers that consume it for *review*. Military data (type 5) flows only to `KERNEL_ROLE`.
- **Citizen Layer → (no upstream data flow into Kernel/Treasury/Reserve/SWF)**: citizen status and eligibility data remains within the Citizen Layer's own scope; it is not a data source for accounting, trigger, or reserve decisions.
- **Jury → Kernel/Court (verdict facts only)**: verdict and case-completion data (`VerdictReached`, `SecondRoundRequired`) are emitted as judicial facts. They are not a data source that Treasury, Reserve, SWF, or TriggerProtocol read directly.
- **TriggerProtocol → Treasury (narrow instruction flow)**: the only data TriggerProtocol sends toward Treasury is the offender-blocking instruction (`blockAddressByTrigger`) — not balance queries, not accounting data, not reserve classification data.
- **Kernel → all layers (authorization and configuration flow)**: the Kernel is the source of authorization decisions (role grants, trigger activation, law approval) that other layers consume as the basis for their own state changes.
- Data flowing in the reverse of any of the above directions (e.g., Treasury balances flowing into Oracle Layer state, Citizen eligibility flowing into TriggerProtocol decisions) is **not** a defined or sanctioned flow under this model.

---

## Accounting-Flow Boundaries

Accounting flow — the movement of recognized value between domains — is governed in full by [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md). At the layer-interaction level, the relevant boundary statements are:

- **Only Treasury, Sovereign Reserve, and SWF participate in accounting flow.** Kernel, TriggerProtocol, Jury, Citizen Layer, and Oracle Layer do not hold, move, or recognize value — they may *authorize*, *instruct a block*, *adjudicate*, *track eligibility*, or *signal*, respectively, but none of them is an accounting domain.
- **TriggerProtocol's interaction with Treasury/SWF is access-control, not accounting.** Blocking an address from Treasury access changes *who may act*, not *what is recognized, classified, or owned*. No balance is debited, credited, or reclassified by `executeTrigger`.
- **Reclaimed-asset accounting flow is singly-routed.** Per [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md), the only accounting-flow path for a reclaimed asset is `AssetFreeze.Confirmed → TransferredToSWF`, crediting the SWF exactly once. No other layer (Kernel, TriggerProtocol, Jury, Oracle) is a valid accounting-flow endpoint for reclaimed value.
- **Oracle data does not constitute an accounting-flow event.** Price/production signals may *inform* a Council decision to deposit, withdraw, or distribute, but the signal itself never directly produces a balance change — see Oracle Signal Boundaries below.

---

## Trigger-Flow Boundaries

- **Origination**: a trigger sequence originates only from a recorded violation (`flagViolation`, oracle- or guardian-sourced) and proceeds through Kernel-recorded multi-sig confirmation (`signViolation`, `MULTISIG_THRESHOLD = 7`). No other layer can originate, accelerate, or shortcut this sequence.
- **Activation**: `_activateTrigger()` is internal Kernel logic, invoked only once the signature threshold is met. It is the sole gateway to calling `TriggerProtocol.executeTrigger()`.
- **Execution**: `TriggerProtocol.executeTrigger()` is `onlyKernel`-gated and performs the bounded execution sequence (treasury block, signature revocation, public notification, optional interim replacement under `INTERIM_REPLACEMENT_DELAY = 24 hours`). Execution does not loop back to re-trigger the Kernel, re-flag a violation, or expand the scope of the original confirmed decision.
- **Termination/Review**: TR-01/02/03 violations additionally activate `emergencyLockActive`, which only the Court can deactivate (`onlyCourt`). This keeps the "review and termination" side of the trigger flow with the Court, distinct from the "execution" side held by `TriggerProtocol`.
- **No parallel trigger paths**: Jury verdicts, citizen status changes, and oracle signals do not constitute alternative entry points into the trigger-flow sequence. The only entry point is violation flagging plus Kernel-confirmed multi-sig activation.

---

## Freeze-Routing Boundaries

- **Initiation is `CRAWLER_ROLE`-exclusive**: only the Sovereign Crawler (asset-discovery layer, `CRAWLER_ROLE`) may call the freeze-initiation path in `AssetFreeze.sol`, placing an asset into `Active` status.
- **Review and confirmation route through `COUNCIL_ROLE`**: an asset moves `Active → UnderReview → Confirmed` only via Council action, requiring `COUNCIL_THRESHOLD = 3` signatures to reach `Confirmed`.
- **Two, and only two, confirmed exits**: from `Confirmed`, the asset routes either to `TransferredToSWF` (crediting the SWF, per the Treasury↔Reclaimed boundary in [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md)) or to `Released` (returning the asset, `KERNEL_ROLE`-gated). No third routing destination exists.
- **No routing through TriggerProtocol, Jury, Citizen Layer, or Oracle Layer**: freeze status transitions are confirmed by Council and released by Kernel only. None of the other layers is a valid intermediate or terminal stop in the freeze-routing sequence — a Jury verdict, a trigger execution, a citizen status, or an oracle signal may *motivate* a freeze (as input to a Crawler/Council decision) but cannot itself move a `FrozenAsset` between statuses.
- **Suspended accounting state is preserved during routing**: while an asset is `Active` or `UnderReview`, it counts in no domain's recognized balance (per [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md), "Any Domain ↔ Frozen Assets"). This document adds no new intermediate state and no shortcut around the two-stage Council confirmation.

---

## Preserved Doctrine

This formalization explicitly preserves the following doctrinal properties, none of which are altered, weakened, or reinterpreted by this document:

- **Oracle signals are non-sovereign.** Across every boundary listed above, Oracle Layer output is treated strictly as informational input for review. It cannot classify reserves, move funds, freeze or release assets, mint or burn supply, alter citizen status, select juries, record verdicts, or activate triggers. The sole structural exception — `KERNEL_ROLE`-gated military data — is a *recipient* restriction, not a grant of sovereign action to the oracle.
- **TriggerProtocol cannot create authority.** `TriggerProtocol` only executes what the Kernel has already authorized via confirmed multi-sig activation. It cannot originate violations, cannot lower or bypass the `MULTISIG_THRESHOLD`, cannot grant itself or any address new roles, and cannot expand its own execution surface beyond treasury blocking, signature revocation, notification, and interim replacement.
- **Jury verdicts do not mutate unrelated domains.** A verdict is a self-contained judicial fact about a case. It does not, by itself, change Treasury/Reserve/SWF balances, citizen eligibility, oracle configuration, trigger state, or freeze status. Any cross-domain consequence requires a separate, explicitly-authorized act by the layer that actually owns that domain.
- **The Kernel remains the final enforcement layer.** Every authority-bearing action traced in this document — trigger activation, law approval, emergency-lock deactivation routing (Court, but Court authority is itself constitutionally defined relative to the Kernel's immutable constants), military data reception, and root role administration for `JurySelection` — terminates at, or is gated by, the Kernel. No interaction path described here allows a non-Kernel layer to become a final, unchecked enforcement authority.

---

## Relationship to Existing Protocols and Contracts

| Model Element | Existing Source of Truth |
|---|---|
| Kernel authority, doctrine constants, trigger lifecycle | `contracts/kernel.sol` |
| Trigger execution | `contracts/core/TriggerProtocol.sol` |
| Law approval gate | `contracts/core/ConstitutionGuard.sol` |
| Treasury / Reserve / SWF accounting | `contracts/monetary/SovereignWealthFund.sol`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) |
| Provincial revenue flow | `contracts/governance/Provincial.sol`, `protocols/governance-protocol-fa.md` |
| Jury adjudication | `contracts/justice/JurySelection.sol`, `protocols/justice-protocol-fa.md` |
| Citizen identity and welfare | `contracts/welfare/CitizenCard.sol` |
| Oracle data feeds | `contracts/oracles/API3Oracle.sol` |
| Asset freeze and reclaim routing | `contracts/reclaim/AssetFreeze.sol`, `protocols/reclaim-protocol-fa.md` |
| Reserve and SWF class definitions | [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) |

Where this document and a contract, protocol, or a prior architecture formalization appear to differ, the contract and protocol remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth.

---

## Summary

This document defines the interaction surface between the Kernel, Treasury, Sovereign Reserve, SWF, TriggerProtocol, Jury, Citizen Layer, and Oracle Layer — covering authority, data-flow, accounting-flow, trigger-flow, and freeze-routing boundaries — without altering any contract, storage layout, threshold, or timeout. It explicitly preserves the doctrines that oracle signals are non-sovereign, that TriggerProtocol cannot create authority, that Jury verdicts do not mutate unrelated domains, and that the Kernel remains the final enforcement layer. It is a reference specification intended to support later audits, invariant mapping, and formal-verification work, consistent with the documentation-only formalizations already present under `docs/`.
