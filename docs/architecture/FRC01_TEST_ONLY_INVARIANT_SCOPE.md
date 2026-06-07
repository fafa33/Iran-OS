# FRC-01 Test-Only Invariant — Scope Definition (Step-58)

## Purpose and Non-Goals

This is a **documentation-only scope definition**. It defines the *exact boundary* of what a future Test-Only invariant for **GAP-FRC-01** would and would not establish — the option named **B (Test-Only Invariant)** in [FRC01_TECHNICAL_DESIGN_OPTIONS.md](FRC01_TECHNICAL_DESIGN_OPTIONS.md) (Step-57) and identified there as the **safest candidate** among five compared options.

It does **not** write, sketch, outline, or imply any test code; modify any contract; modify any test; propose any storage, role, authority, or trigger code; or propose that runtime enforcement be built. Its sole purpose is to state, with precision, *what such an invariant would mean if it existed* — so that, if a future, separately-scoped effort ever takes up Option B, it begins with an unambiguous statement of scope rather than an implicit or drifting one.

This document is a **direct extension** of, and fully subordinate to:

- [FRC01_TECHNICAL_DESIGN_OPTIONS.md](FRC01_TECHNICAL_DESIGN_OPTIONS.md) (Step-57) — source of Option B's identification as the safest candidate and its description as a drift-detection safeguard over the existing structural separation.
- [FRC01_RUNTIME_EVALUATION.md](FRC01_RUNTIME_EVALUATION.md) (Step-56) — source of the precise missing-check description and the existing-protections inventory this scope definition builds directly on.
- [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) — source of the doctrine principle this invariant would relate to.
- [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) and [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) — source of the confirmed structural-separation facts and Architectural Boundary status this scope definition treats as its starting condition.

No fact below is independently re-derived from contracts or tests; every claim is carried forward, in summary form, from these documents (and, transitively, from Steps 49–53 beneath them). Where this scope definition and any of those documents (or the contracts/tests beneath them) appear to differ, those documents — and the contracts/tests beneath them — remain authoritative.

---

## 1. Doctrine Protected

A future Test-Only invariant for GAP-FRC-01 would relate, directly or by adjacency, to the following doctrine elements — each preserved here verbatim and unchanged, exactly as named in the task:

| Doctrine Element | Statement | Relationship to This Invariant |
|---|---|---|
| **Frozen-assets-not-reserve** | Frozen and seized assets must never contribute, in whole or in part, to reserve recognition or any doctrine computation | **Directly protected** — this is the central principle the invariant would relate to; see Section 3. |
| **`MIN_RESERVE_RATIO` = 333** | The 33.3% minimum reserve-compliance ratio (stored in thousandths) | **Preserved, referenced only** — this is one of the doctrine-central figures that frozen-asset contamination would corrupt if it ever occurred; the invariant exists in service of keeping this ratio meaningful, not to alter it. |
| **`LIQUIDITY_CAP` = 900B** | The `900,000,000,000 × 1e18` immutable liquidity ceiling | **Preserved, referenced only** — the second doctrine-central figure this invariant exists in service of; not altered, redefined, or computed differently by anything described here. |
| **Oracle non-sovereignty** | Oracle signals are never self-executing; they inform review and feed Kernel-mediated or fixed-formula computations only | **Preserved, referenced for adjacency only** — named in the task as a constant to preserve; this invariant does not concern oracle behavior directly, but sits within the same broader family of "what may, and may not, silently influence `totalReserves`" concerns (see GAP-MEX-05) that the oracle non-sovereignty principle also guards against. |
| **Reclaimed-assets-not-automatic-backing** | Reclaimed assets are a pure accounting credit to L1; receipt triggers no mint and no automatic classification | **Preserved, referenced for adjacency only** — also named in the task as a constant to preserve; this principle and the frozen-assets-not-reserve principle are sibling members of the same doctrine family (assets that must not silently inflate recognized reserve value), and a future invariant of this kind could plausibly be designed, scoped, or reasoned about alongside its sibling — though this document defines the scope of the FRC-01 invariant only, and does not extend, combine, or propose combining it with any other. |

Nothing in this section redefines, recomputes, or modifies any of these five elements. They are stated here solely to fix, with precision, *which* doctrine commitments a future FRC-01 Test-Only invariant would stand in service of, and which adjacent commitments it would touch only by family resemblance rather than by direct concern.

---

## 2. Existing Runtime Facts

A future invariant's scope is bounded by — and must be stated relative to — the following four facts, each independently confirmed across Steps 50–56 and restated here as the fixed starting condition any such invariant would describe:

1. **`totalFrozenValue` exists.** It is a maintained, accurate, on-chain figure in `AssetFreeze.sol`, recorded and updated faithfully alongside the `FreezeStatus` lifecycle (`Active → UnderReview → Confirmed → TransferredToSWF`/`Released`), and is itself fully Contract-Enforced and Test-Enforced (Step-50, FRC-02/FRC-03).
2. **`totalReserves` exists.** It is a maintained, accurate, on-chain figure in `PahlaviToken.sol`, checked at mint-time via `reserveCompliant` against `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`, and is itself fully Contract-Enforced and Test-Enforced for its arithmetic properties (Step-50, MEX-02/MEX-03).
3. **No direct `AssetFreeze` ↔ `PahlaviToken` coupling exists.** The two contracts share no storage and have no call relationship; per Step-51, this separation is an explicit, deliberate **Architectural Boundary** (item 3) — an intentional non-gap, not an oversight.
4. **No direct `AssetFreeze` ↔ `Treasury` coupling exists.** The same structural separation extends to `Treasury.sol`: no shared storage, no call relationship, and the same Architectural Boundary status applies.

These four facts, taken together, are *why* the doctrine currently holds (Step-56: "the doctrine currently holds... because the two domains never touch") and *why* a Test-Only invariant is even a coherent concept here: the invariant would not be checking a *runtime relationship* (none exists to check), but rather checking that the *absence* of such a relationship — facts 3 and 4 — continues to hold, across whatever future changes the codebase may undergo. This is the precise distinction Section 3 makes formal.

---

## 3. Invariant Statement

### What the invariant would prove

A future Test-Only invariant for GAP-FRC-01 would prove, at the moment it is run, exactly one thing:

> **No code path exists, anywhere in the deployed contract set, by which any value tracked in `AssetFreeze.sol` (including but not limited to `totalFrozenValue`, `totalFrozenAssets`, or any individual entry in `frozenAssets`) can influence, contribute to, be read by, or otherwise reach `PahlaviToken.totalReserves`, `PahlaviToken.MAX_SUPPLY`/`LIQUIDITY_CAP` evaluation, `Treasury.budgetLines`, `Treasury.transactions`, or any other on-chain figure that doctrine computations (`MIN_RESERVE_RATIO` compliance, `LIQUIDITY_CAP` enforcement, provincial 30/70 distribution, or any successor doctrine-relevant total) rely upon.**

In other words: it would prove that the **structural separation** described in Section 2 — facts 3 and 4 — is **present and intact at the moment the invariant is checked**. It would be a *structural-integrity* statement about the relationship (or absence of relationship) between two sets of contracts, not a statement about any particular transaction, balance, or moment in the system's operational history.

### What the invariant would *not* prove

To prevent any future drift in how such an invariant might be understood, characterized, or relied upon, the following boundaries are stated explicitly and are considered as central to this scope definition as the statement above:

- It would **not** prove that frozen value has never, in the system's operational history, influenced a reserve computation — it would prove only that no *structural pathway* for such influence currently exists. (A history-spanning guarantee of that kind would be a fundamentally different — and, per Step-56's framing of GAP-MEX-04/MEX-05, fundamentally larger — undertaking, requiring provenance data that does not exist.)
- It would **not** prove that `totalFrozenValue` or `totalReserves` are themselves *correct* — their individual arithmetic correctness is already separately Contract-Enforced and Test-Enforced (Section 2, facts 1–2); this invariant would say nothing new about either figure's internal accuracy.
- It would **not** prove, predict, or constrain anything about *future* code changes — it would be a point-in-time check, re-run whenever the test suite runs, and its passing today would carry no guarantee about its passing after any subsequent modification. (This is, in fact, precisely its intended function: to *fail* — and thereby surface — the moment some future, unrelated change ever introduces the very connection that does not exist today. See Section 5.)
- It would **not** constitute, imply, or substitute for **runtime enforcement** of any kind. It would run at test/verification time, against the deployed-or-deployable contract set, and would have no on-chain presence, no gas cost, no transaction footprint, and no effect whatsoever on any live computation, mint, transfer, or freeze action.
- It would **not** establish, evaluate, or comment on whether the *current* structural separation is the *right* design choice, a *better* design choice than active runtime enforcement, or a *permanent* one — those are exactly the open governance/doctrine questions Steps 54, 55, and 57 identified as outside any single document's authority to resolve, and this invariant — being purely descriptive of present structure — would not bear on them either way.
- It would **not** prove anything about the four sibling doctrine elements named in Section 1 (`MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, oracle non-sovereignty, reclaimed-assets-not-automatic-backing) beyond the fact that this invariant exists in service of keeping the first two meaningful and shares a doctrine family with the latter two. It would not check, test, or constrain oracle behavior, reclaim-confirmation behavior, or any of the other P0 gaps' subject matter (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05) — each of which Step-54/55 confirmed requires its own, separate, and substantially larger architectural resolution.

---

## 4. Inputs

The invariant, as scoped above, would concern exactly the following values and contracts — no more, no fewer:

**Values:**
- `AssetFreeze.totalFrozenValue` (aggregate frozen-value figure)
- `AssetFreeze.totalFrozenAssets` (aggregate frozen-asset count)
- `AssetFreeze.frozenAssets` (the per-asset record mapping, including each entry's `FreezeStatus`)
- `PahlaviToken.totalReserves`
- `PahlaviToken.MAX_SUPPLY` / `LIQUIDITY_CAP` (the immutable ceiling the reserve figure is checked against)
- `Treasury.budgetLines`
- `Treasury.transactions`

**Contracts (as subjects of the structural check, not as parties to any new relationship):**
- `contracts/reclaim/AssetFreeze.sol`
- `contracts/monetary/PahlaviToken.sol`
- `contracts/monetary/Treasury.sol`

**What is explicitly *not* an input:**
- `kernel.sol` — named in Step-57's Option C as a possible future *runtime* placement, but not a subject of this Test-Only invariant, which concerns only the (absence of) relationship between the three contracts named above.
- `API3Oracle.sol`, `SovereignWealthFund.sol`, `CitizenCard.sol`, `Provincial.sol`, `JurySelection.sol` — each is the subject matter of a different P0 or non-P0 gap (GAP-MEX-05, GAP-SWF-04/05, welfare doctrine, GAP-ALD-*, justice domain respectively) and falls outside this invariant's scope as defined here, even where a family resemblance exists (Section 1).
- Any value, mapping, or contract not yet deployed, named, or defined anywhere in the existing codebase or in Steps 41–57. This invariant's inputs are bounded entirely by what already exists; it introduces no new ones.

---

## 5. Failure Conditions

The invariant, as scoped in Section 3, would be considered **violated** — and a future implementation of it would be expected to fail — under any of the following conditions, enumerated exhaustively relative to the scope defined above:

1. **A direct call relationship is introduced.** Any future change that causes `PahlaviToken.sol` or `Treasury.sol` to call any function on `AssetFreeze.sol`, or vice versa — for any reason, including reasons unrelated to FRC-01 (e.g., a shared utility, a unified reporting interface, a convenience accessor).
2. **A shared storage relationship is introduced.** Any future change that causes any of the three contracts named in Section 4 to read from, write to, or otherwise directly access another's storage — including via inheritance, delegatecall, shared libraries that expose mutable shared state, or any other mechanism that would cause `frozenAssets`/`totalFrozenValue` and `layerL1/L2/L3`/`totalReserves`/`budgetLines`/`transactions` to cease being storage-independent.
3. **An indirect pathway is introduced through a third contract.** Any future change that causes some other contract (including, but not limited to, `kernel.sol`, a new contract, or a modified existing one) to read frozen-asset data and subsequently write, influence, or otherwise cause to be written any value that `totalReserves`, `MIN_RESERVE_RATIO` evaluation, `LIQUIDITY_CAP` evaluation, or any Treasury total depends upon — even if no *direct* link between `AssetFreeze.sol` and `PahlaviToken.sol`/`Treasury.sol` is ever created.
4. **A frozen asset's value becomes reflected, by any mechanism, in a doctrine-relevant total.** The terminal condition all of the above would be guarding against: any situation — however it arose — in which value currently recorded as frozen (any `Active` or `UnderReview` entry in `frozenAssets`, or any portion of `totalFrozenValue`) is also, simultaneously, reflected in `totalReserves`, counted toward `MIN_RESERVE_RATIO` compliance, counted toward `LIQUIDITY_CAP` capacity, or counted in any Treasury budget or transaction total.
5. **A change to either contract's interface or storage layout removes the invariant's ability to verify the above**, without removing the underlying separation itself — e.g., a refactor that makes the structural relationship harder to statically verify, even if it does not actually introduce a coupling. (This would not be a violation of the *doctrine* the invariant protects, but it would be a violation of the invariant's own ability to continue meaningfully attesting to that doctrine — a distinction worth naming explicitly so that a future "the check broke" is never conflated with "the doctrine broke.")

No other condition would constitute a failure of this invariant, as scoped. In particular — and consistent with Section 3's "what it would not prove" — the invariant would **not** fail, and would have nothing to say about, conditions arising from any of the five P0 gaps' *other* subject matter (e.g., a self-referential composition issue per GAP-MEX-04, or a classification-consistency issue per GAP-CLS-01): those would be violations of *different* invariants, protecting *different* doctrine elements, requiring *entirely separate* scope definitions of their own.

---

## 6. Non-Goals

This scope definition explicitly does **not** include, propose, imply, or move toward any of the following — each named directly in the task's rules, restated here as a binding boundary of this document's own scope:

- **No new storage.** Nothing described above requires, implies, or would lead to any new persisted on-chain state. The invariant, as scoped, concerns only values that already exist (Section 4) and runs entirely outside the chain.
- **No new role.** No actor, permission, or access grant of any kind is implied by anything in this document.
- **No new authority.** No decision-making body, signer set, or approval pathway is implied.
- **No new trigger code.** Nothing here relates to, resembles, or could be mistaken for an extension of TR-01 through TR-06; this is a structural-verification concept entirely outside the constitutional-violation framework those codes belong to.
- **No runtime coupling.** This document defines the scope of the option that *specifically avoids* introducing any relationship between `AssetFreeze.sol` and `PahlaviToken.sol`/`Treasury.sol` — Section 2's facts 3 and 4 are the very thing the invariant would exist to continue confirming, not something it would change, weaken, or work around.
- **No contract modification.** Nothing in this document requires, proposes, or implies that any contract be changed in any way. The invariant, as scoped, is a statement about the *existing, unmodified* contract set.

This document is, in its entirety, a **definition of what a thing would mean** — not a proposal that the thing be built, a sketch of how it would be built, or a statement that building it is advisable, urgent, or even likely to ever occur.

---

## 7. Future Test Placement

Should a future, separately-scoped effort ever take up Option B, the **canonical existing test files** within whose domain such an invariant's subject matter already sits are:

- **`test/06_asset_freeze.test.js`** — the canonical home for `AssetFreeze.sol` behavior, including the `FreezeStatus` lifecycle and `totalFrozenValue`/`totalFrozenAssets` bookkeeping (Section 2, fact 1) that forms one half of this invariant's subject matter.
- **`test/02_pahlavi_token.test.js`** — the canonical home for `PahlaviToken.sol` behavior, including `totalReserves`, `reserveCompliant`, and `MAX_SUPPLY`/`LIQUIDITY_CAP` evaluation (Section 2, fact 2) that forms the other half.
- **`test/09_Treasury.test.js`** — the canonical home for `Treasury.sol` behavior, including `budgetLines` and `transactions` (Section 4), the third contract named in this invariant's scope.

This list **identifies where such an invariant's subject matter already lives** — it does not request, propose, sketch, or recommend that any test be added to, or modified within, any of these files, nor does it suggest that all three (or any specific combination) would necessarily be the right home for a future invariant of this kind, nor in what proportion or form. That determination — like the decision of whether to build the invariant at all — remains entirely with whatever future, separately-scoped effort might take this scope definition up, informed by, but not directed by, this document.

---

## 8. Conclusion

This document is, in its entirety, a **documentation-only scope definition**. It states — with as much precision as a documentation artifact can carry — exactly what a future Test-Only invariant for GAP-FRC-01 would mean: a structural-integrity statement that no code path exists by which frozen-asset value could reach any doctrine-relevant total, checkable at test/verification time, carrying zero runtime presence, and bounded to the seven named values and three named contracts in Section 4. It states with equal precision what such an invariant would *not* mean: not a history-spanning guarantee, not a statement about either figure's internal correctness, not a constraint on future change, not runtime enforcement, not a judgment about whether the current architecture is the right one, and not a statement about any of the other five P0 gaps' separate concerns.

**This document makes no implementation recommendation.** It does not state that this invariant should be built, when it should be built, who should build it, how it should be built, or that building it is the right next step relative to any of the other paths named in Step-57 (including the equally-valid choice to do nothing further, per Option A). Its sole contribution is to ensure that — *if and when* such a decision is ever made by the appropriate process — the thing being decided about has an exact, stable, unambiguous shape, rather than an implicit or drifting one assembled informally in the moment such a decision is taken up.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Scope Element | Existing Source of Truth |
|---|---|
| Option B identification, "safest candidate" framing | [FRC01_TECHNICAL_DESIGN_OPTIONS.md](FRC01_TECHNICAL_DESIGN_OPTIONS.md) (Step-57) |
| Existing runtime facts, missing-check description | [FRC01_RUNTIME_EVALUATION.md](FRC01_RUNTIME_EVALUATION.md) (Step-56) |
| Doctrine principle statement | [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) |
| Structural-separation / Architectural Boundary status | [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51), [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) |
| Underlying contracts and tests | `contracts/reclaim/AssetFreeze.sol`, `contracts/monetary/PahlaviToken.sol`, `contracts/monetary/Treasury.sol`, `test/06_asset_freeze.test.js`, `test/02_pahlavi_token.test.js`, `test/09_Treasury.test.js` — referenced transitively, not re-derived or modified here |

Where this scope definition and any prior document, contract, or test appear to differ, those documents — and beneath them, the contracts and tests — remain authoritative. This document adds a *precise-boundary lens* (exactly what would this thing mean, and exactly where would its meaning end?) over a candidate already identified elsewhere; it revises, re-derives, supersedes, proposes, and implements nothing.

---

## Summary

This document defines the exact scope of a possible future Test-Only invariant for GAP-FRC-01 — Option B from Step-57's comparison, the option independently identified there as the safest candidate. It names the doctrine elements involved (frozen-assets-not-reserve as the directly-protected principle; `MIN_RESERVE_RATIO=333`, `LIQUIDITY_CAP=900B`, oracle non-sovereignty, and reclaimed-assets-not-automatic-backing as preserved, adjacent, or referenced-only constants), restates the four existing runtime facts the invariant would be defined relative to (both `totalFrozenValue` and `totalReserves` exist; no direct coupling exists between `AssetFreeze` and either `PahlaviToken` or `Treasury`), and states precisely what such an invariant would prove (that the structural separation is intact at the moment of checking) and would not prove (a history-spanning guarantee, either figure's internal correctness, anything about future code, runtime enforcement, a judgment on architecture, or anything about the other five P0 gaps). It enumerates exactly seven values and three contracts as the invariant's bounded inputs, names five exhaustive failure conditions (direct call relationship, shared storage, indirect third-contract pathway, actual contamination of a doctrine total, or loss of the invariant's own ability to verify any of the above), and confirms — against every rule named in the task — that nothing here proposes new storage, roles, authorities, trigger codes, runtime coupling, or contract modification. It identifies three canonical existing test files (`test/06_asset_freeze.test.js`, `test/02_pahlavi_token.test.js`, `test/09_Treasury.test.js`) as the homes of this invariant's subject matter, without requesting or proposing that any test be written or modified. The conclusion is, and remains, a pure scope definition: this document states what such an invariant would mean, not whether, when, or how it should be built.
