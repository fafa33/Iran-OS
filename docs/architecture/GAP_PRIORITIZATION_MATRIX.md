# Gap Prioritization Matrix — Architecture Formalization (Step-52)

## Scope and Non-Goals

This document is a **documentation-only** prioritization matrix. It does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant.
- Any role, modifier, or access-control assumption.
- Any test file or test assertion.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` and `LIQUIDITY_CAP = 900,000,000,000 × 1e18`.

It introduces **no new doctrine, no new contracts, no new storage, no new roles, no new authorities, and no new trigger codes**. It **proposes no fixes**. Its sole purpose is to take the 25 Open gaps registered in [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) and rank them — by mapping each to four additional impact dimensions (Runtime, Auditability, Testability, Formal Verification) alongside the Category and Risk Level it already carries, and assigning a priority band (P0–P3) with a stated justification.

A priority assignment in this document is a statement about **where future audit, test-design, or formal-verification attention would be best directed first if such work were ever undertaken** — it is not a statement that any gap must be closed, nor a design for closing one. Every gap in this matrix remains exactly what Step-51 recorded it as: an open finding, governed today by documentation-level discipline, exactly as Steps 41–49 intended for the specific properties these gaps describe.

This document is a **direct extension** of, and is subordinate to, the full Step-41–51 series — most directly:

- [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) — the **sole and exclusive source** of every Gap ID, Category, Risk Level, Doctrine Impact summary, and Status used below. This document re-derives nothing from the contracts, tests, or earlier protocol documents independently; every gap's foundational facts are carried forward from Step-51 unchanged.
- [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) and [RESERVE_INTEGRITY_INVARIANT_MATRIX.md](RESERVE_INTEGRITY_INVARIANT_MATRIX.md) (Step-49) — transitively authoritative beneath Step-51.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Status Here |
|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle data informs review and feeds Kernel-mediated or fixed-formula computations; never self-executing | Preserved — referenced only |
| Frozen assets are not reserve assets | Excluded from every domain's recognized balance and doctrine computation | Preserved — referenced only |
| Reclaimed assets are not automatic backing | Pure accounting credit to L1; no mint, no automatic classification | Preserved — referenced only |
| Welfare/wages are non-reserve assets | `CitizenCard.sol` manages eligibility/status only; wage is an off-chain employer obligation | Preserved — referenced only |

---

## How to Read This Matrix

For every Open gap from Step-51, this document records eight fields plus a priority assignment and justification:

- **Gap ID / Category / Risk Level / Doctrine Impact**: carried forward verbatim (in summary form) from [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51). These four are *inputs* to this matrix, not re-assessments.
- **Runtime Impact**: how directly the absence of enforcement could allow a doctrine-relevant condition to occur, in a live transaction, without being caught by any existing `require`/modifier/state-machine check. Rated **High / Medium / Low / None**, where "None" means the property described is not the kind of thing a runtime check could ever catch (e.g., a prohibition on *intent* or *off-chain reasoning*).
- **Auditability Impact**: how much harder the absence makes it for a human auditor, after the fact, to reconstruct whether the rule held — given the existing event trail and contract state. Rated **High / Medium / Low**.
- **Testability Impact**: how much the absence of an on-chain construct prevents a meaningful test from being written at all (as opposed to a test simply not existing yet). Rated **High / Medium / Low**.
- **Formal Verification Impact**: how much the absence of an on-chain construct blocks a future formal-verification effort from even *modeling* the property (as opposed to merely proving it). Rated **High / Medium / Low**.
- **Priority**: one of **P0 Critical / P1 High / P2 Medium / P3 Low** — see "Priority Band Definitions" below.
- **Justification**: a short statement of why this gap landed in this band, referencing the impact fields and Step-51's Doctrine Impact.

### Priority Band Definitions

- **P0 Critical**: the gap is foundational — it is either a root-cause construct absence that other gaps transitively depend on, or it directly concerns the integrity of `totalReserves` / `MIN_RESERVE_RATIO` / `LIQUIDITY_CAP` (the doctrine's most load-bearing figures) — *and* carries High Runtime, Auditability, and Formal-Verification impact. A future audit would, by Step-50's own Cross-Cutting Observation, find these the natural starting point because resolving (or even fully scoping) most other gaps requires understanding these first.
- **P1 High**: the gap carries High or doctrine-central Medium risk, has a concrete (not merely conceptual) runtime or lifecycle dimension, and is not purely derivative of a P0 gap's root cause — it represents a distinct, addressable surface in its own right.
- **P2 Medium**: the gap has Medium risk and Medium impact across most dimensions — it is a real, trackable finding, but its resolution would be either narrower in blast radius or more clearly an audit-tooling / monitoring question than a core-integrity one.
- **P3 Low**: the gap's missing portion is fundamentally about *intent*, *off-chain reasoning*, *governance process*, or *framing* — dimensions that no runtime mechanism, test, or formal-verification effort could ever directly check, regardless of how much engineering investment were applied. These remain exactly what Steps 41–49 already designated them: standards for human and process discipline.

Priority is **not** a measure of how "important" a doctrine principle is — every principle in this register is constitutionally load-bearing. It is a measure of **where a future, separately-scoped audit or engineering-scoping exercise would find the most leverage**, given what is and is not, even in principle, checkable on-chain.

---

## 1. Priority Ranking Table

| Rank | Gap ID | Category | Risk Level | Runtime Impact | Auditability Impact | Testability Impact | FV Impact | Priority |
|---|---|---|---|---|---|---|---|---|
| 1 | GAP-RES-01 | Classification | High | High | High | High | High | **P0** |
| 2 | GAP-CLS-01 | Classification | High | High | High | High | High | **P0** |
| 3 | GAP-TAI-03 | Accounting | High | High | High | High | High | **P0** |
| 4 | GAP-MEX-04 | Accounting | High | High | High | Medium | High | **P0** |
| 5 | GAP-MEX-05 | Accounting | High | High | High | Medium | High | **P0** |
| 6 | GAP-FRC-01 | Accounting | High | High | High | Medium | High | **P0** |
| 7 | GAP-RES-03 | Architecture | High | Medium | Medium | High | High | **P1** |
| 8 | GAP-ALD-02 | Accounting | High | High | Medium | Medium | High | **P1** |
| 9 | GAP-CLS-02 | Classification | Medium | Medium | Medium | Medium | High | **P1** |
| 10 | GAP-SWF-04 | Classification | Medium | Medium | Medium | Medium | Medium | **P1** |
| 11 | GAP-FRC-04 | Classification | Medium | Medium | Medium | Medium | Medium | **P1** |
| 12 | GAP-RES-02 | Runtime | Medium | Low | Low | Low | Medium | **P2** |
| 13 | GAP-RES-04 | Governance | Medium | Low | Low | Low | Medium | **P2** |
| 14 | GAP-TAI-02 | Accounting | Medium | Medium | Medium | Medium | Medium | **P2** |
| 15 | GAP-TAI-04 | Accounting | Medium | Low | Medium | Medium | Low | **P2** |
| 16 | GAP-ALD-05 | Governance | Medium | Medium | Medium | Medium | Medium | **P2** |
| 17 | GAP-MEX-06 | Governance | Medium | Medium | Medium | Medium | Medium | **P2** |
| 18 | GAP-RES-05 | Architecture | Medium | Low | Medium | Low | Low | **P3** |
| 19 | GAP-TAI-01 | Accounting | Medium | Low | Medium | Low | Low | **P3** |
| 20 | GAP-CLS-03 | Governance | Low | Low | Low | Low | Low | **P3** |
| 21 | GAP-CLS-04 | Governance | Medium | None | Low | Low | Low | **P3** |
| 22 | GAP-CLS-05 | Classification | Low | Low | Low | Low | Low | **P3** |
| 23 | GAP-SWF-05 | Governance | Low | None | Low | Low | Low | **P3** |
| 24 | GAP-ALD-01 | Architecture | Low | Low | Low | Low | Low | **P3** |
| 25 | GAP-ALD-06 | Governance | Medium | None | Low | Low | Low | **P3** |

---

## 2. P0 Gap Group — Critical (6 gaps)

These six gaps share two properties: each carries **High** Risk Level in Step-51, and each is either (a) a root-cause construct absence that a majority of the remaining 19 gaps transitively depend on, or (b) a direct threat to the integrity of `totalReserves`, `MIN_RESERVE_RATIO`, or `LIQUIDITY_CAP` — the doctrine's three most load-bearing figures. A future audit would, by necessity, have to understand these six before most other gaps in this register could even be meaningfully scoped.

### GAP-RES-01 — Sovereign Reserve classification as a discrete on-chain act
- **Category**: Classification | **Risk Level**: High
- **Doctrine Impact**: Foundational — Step-50's Cross-Cutting Observation names this the single recurring root cause beneath nearly every other Documentation-Only and Mixed finding in the matrix.
- **Runtime Impact**: High — no runtime moment exists at which "this balance is now Sovereign Reserve" could be checked against the eight Eligibility Tests; a misclassification (by labeling convention) could occur with no possibility of a reverting transaction.
- **Auditability Impact**: High — an auditor cannot query "is/was this balance classified, and on what basis" anywhere on-chain; the entire classification history is a labeling convention layered onto ordinary Treasury/SWF storage.
- **Testability Impact**: High — no construct exists for a test to assert against; a test could only check *adjacent* mechanisms (as the existing suite already does).
- **Formal Verification Impact**: High — blocks formal modeling of essentially every classification-dependent property in the matrix (RES-02 through RES-05, TAI-03, CLS-01 through CLS-05, SWF-04, ALD-05, FRC-01, FRC-04 all transitively reference this absence).
- **Priority**: **P0 Critical**
- **Justification**: This is the single highest-leverage gap in the register — not because it is individually the most severe in isolation, but because Step-50 and Step-51 both independently identify it as the structural cause beneath roughly two-thirds of all other entries. Any future scoping exercise would necessarily begin here.

### GAP-CLS-01 — Exactly-one-classification-state consistency
- **Category**: Classification | **Risk Level**: High
- **Doctrine Impact**: The twin root-cause finding alongside GAP-RES-01 — the eight classification states exist solely as an architecture-level taxonomy with no on-chain enum or status field.
- **Runtime Impact**: High — nothing prevents (or could prevent, given the absence) a balance from being conceptually assignable to two states (e.g., "Frozen" and "Sovereign Reserve") at once, by labeling-convention drift.
- **Auditability Impact**: High — there is no queryable "current state" to audit against.
- **Testability Impact**: High — a state-consistency test requires a state to be consistent about.
- **Formal Verification Impact**: High — a state-machine model of classification cannot be built without first defining the states as on-chain values.
- **Priority**: **P0 Critical**
- **Justification**: Functionally inseparable from GAP-RES-01 — both describe the same absent construct from two angles (the *act* of classifying vs. the *state* a balance occupies). Both belong at the top of any future scoping exercise, together.

### GAP-TAI-03 — Independence of custody and classification as tracked properties
- **Category**: Accounting | **Risk Level**: High
- **Doctrine Impact**: The formal accounting-layer statement of the GAP-RES-01/GAP-CLS-01 root cause — explicitly named in Step-51 as the "custody vs. classification separation gap."
- **Runtime Impact**: High — custody (`layerL1/L2/L3`, `budgetLines`, `frozenAssets`) is robustly tracked; classification is not tracked as an independent axis at all, so nothing prevents the two from being silently conflated in governance reasoning.
- **Auditability Impact**: High — an auditor cannot reconcile "where is it" against "what does it count as," because only the first axis exists to reconcile against.
- **Testability Impact**: High — a reconciliation test needs two independent properties to reconcile; only one exists.
- **Formal Verification Impact**: High — any two-axis model (custody × classification) collapses to one axis without this construct.
- **Priority**: **P0 Critical**
- **Justification**: This is where the GAP-RES-01/GAP-CLS-01 root cause becomes *concretely doctrine-threatening*: it is the precise point at which "this value is held in the SWF" could be silently treated as proof that "this value counts as Sovereign Reserve," which Step-42 and Step-44 both explicitly forbid. It belongs in the same priority band as its root-cause siblings because it is where that root cause does the most damage.

### GAP-MEX-04 — Non-self-referential composition of `totalReserves`
- **Category**: Accounting | **Risk Level**: High
- **Doctrine Impact**: Directly threatens the integrity of `totalReserves` — the figure `reserveCompliant` checks every mint against, and therefore the figure `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` ultimately depend on.
- **Runtime Impact**: High — `reserveCompliant` checks the *arithmetic* relationship between `totalReserves` and `newSupply` correctly and is well-tested; but nothing checks whether `totalReserves` itself was composed of value created by, or acquired through, a prior mint it would now be used to justify. A self-referential composition could pass every existing check undetected.
- **Auditability Impact**: High — there is no on-chain trace of *how* `totalReserves` arrived at its current value; `updateReserves` simply sets a number.
- **Testability Impact**: Medium — tests can (and do) assert the arithmetic check; no test could assert composition without a provenance-tracking construct that does not exist.
- **Formal Verification Impact**: High — provenance/composition properties are notoriously difficult to model formally without an explicit tracking mechanism; this is a structurally hard verification target even in principle.
- **Priority**: **P0 Critical**
- **Justification**: This gap sits directly on top of the doctrine's central arithmetic guarantee (`reserveCompliant`). If `totalReserves` could ever be composed of self-referential value, every doctrine computation downstream of it — the ratio, the cap, the classification eligibility tests that reference "doctrine-bound" recognition — would be silently corrupted while every existing `require` continued to pass. That combination of severity and undetectability is the definition of a P0 finding.

### GAP-MEX-05 — Compositional guarantee that no oracle/reclaim/frozen/welfare figure influenced a mint
- **Category**: Accounting | **Risk Level**: High
- **Doctrine Impact**: The same structural gap as GAP-MEX-04, viewed from the input-source angle — directly threatens the "Oracle-Triggered," "Reclaimed-Asset-Triggered," "Frozen-Asset-Backed," and "Welfare- or Wage-Backed Minting" prohibitions (Step-45).
- **Runtime Impact**: High — the role-gate half (oracle cannot call `mint`/`updateReserves` directly) is solid; but nothing checks whether the *figure* an authorized actor relied on was itself influenced, upstream, by an oracle estimate, a reclaim confirmation, a frozen-asset valuation, or a welfare/wage projection.
- **Auditability Impact**: High — same as GAP-MEX-04: no on-chain trace of figure provenance exists to audit.
- **Testability Impact**: Medium — the role-gate half is well-tested; the compositional half has nothing to test against.
- **Formal Verification Impact**: High — same structural difficulty as GAP-MEX-04.
- **Priority**: **P0 Critical**
- **Justification**: Paired with GAP-MEX-04 as two views of one underlying limitation (timing vs. source), and equally severe: an improperly-influenced `totalReserves` figure would corrupt every downstream doctrine computation while passing every existing role-gate and arithmetic check. Any future scoping of either gap would necessarily address both together.

### GAP-FRC-01 — Cross-domain exclusion of frozen-asset value from doctrine computation
- **Category**: Accounting | **Risk Level**: High
- **Doctrine Impact**: The formal statement, at the freeze/reclaim layer, of the "frozen assets not reserve" doctrine element (preserved verbatim above) — and, per Step-51, "one of the most doctrine-load-bearing Mixed entries in the register" precisely because `totalReserves` composition is where a silent inclusion would do the most damage.
- **Runtime Impact**: High — `AssetFreeze.sol` faithfully records `Active`/`UnderReview` status and maintains `totalFrozenValue`; but nothing wires that exclusion into `PahlaviToken.totalReserves` or `Treasury` totals — exclusion today rests entirely on the structural fact that frozen assets never *enter* `totalReserves` in the first place, not on an active cross-contract check that they are excluded.
- **Auditability Impact**: High — an auditor would need to manually trace every code path that could set or update `totalReserves` and confirm none references `totalFrozenValue`; no on-chain mechanism performs or records this cross-check.
- **Testability Impact**: Medium — a cross-contract integration test verifying non-inclusion could, in principle, be designed against existing storage (`totalFrozenValue`, `totalReserves`) without requiring any new construct — which is precisely what makes this a *true runtime gap* rather than a purely conceptual one (see Section "True Runtime Gaps" below).
- **Formal Verification Impact**: High — verifying "frozen value structurally cannot reach `totalReserves`" requires tracing every code path that touches `totalReserves`, a non-trivial but well-defined formal target.
- **Priority**: **P0 Critical**
- **Justification**: This is the gap in the P0 group most clearly addressable *without* first resolving the GAP-RES-01/GAP-CLS-01 root cause — `totalFrozenValue` and `totalReserves` both already exist as concrete on-chain values; the missing piece is a cross-reference between two existing constructs, not a new construct. That makes it simultaneously high-severity (a silent inclusion would corrupt the doctrine's central figure) and comparatively well-scoped — exactly the combination that warrants top-tier attention in any future audit.

---

## 3. P1 Gap Group — High (5 gaps)

These five gaps carry High risk or doctrine-central Medium risk, have a concrete lifecycle or runtime dimension (not merely a conceptual one), and represent distinct surfaces that a future audit could examine somewhat independently of the P0 root-cause cluster — though several remain partially derivative of it.

### GAP-RES-03 — Single entry/exit path for Sovereign Reserve State
- **Category**: Architecture | **Risk Level**: High
- **Doctrine Impact**: Protects against reserve recognition occurring "through deposit alone, reclaim crediting alone, oracle valuation alone, freezing, withdrawal alone, or the passage of time" (Step-47).
- **Runtime Impact**: Medium — no enum or transition function enforces a single path; but the *underlying balance movements* that would constitute any path are themselves tracked through well-enforced SWF/Treasury/AssetFreeze mechanics (SWF-01, ALD-03, FRC-02/03), which substantially constrains what "paths" are even physically possible.
- **Auditability Impact**: Medium — movements are traceable via events; "path correctness" as a holistic property is not.
- **Testability Impact**: High — a path-exclusivity test requires a state machine to test transitions against, which does not exist.
- **Formal Verification Impact**: High — modeling "exactly one path" requires the state representation that GAP-CLS-01 also lacks.
- **Priority**: **P1 High**
- **Justification**: High risk and a concrete lifecycle property, but its resolution is substantially gated by GAP-RES-01/GAP-CLS-01 — it is the *path between* states that, themselves, do not yet exist on-chain. It sits just below the P0 cluster because it is meaningfully derivative of it, while still being distinct enough (and risky enough) to warrant separate tracking.

### GAP-ALD-02 — Exclusion of Frozen/Pending-Classification/Reclaimed-In-Transit value from spending
- **Category**: Accounting | **Risk Level**: High
- **Doctrine Impact**: Protects the "Source Confirmation" half of the Sufficiency Check (Step-48) — that only properly-recognized, available value may be allocated or disbursed.
- **Runtime Impact**: High — the Sufficiency Check (balance ≥ amount) is solidly enforced; but no check confirms the *kind* of balance before a spend. The structural fact that frozen value lives in `frozenAssets` rather than `layerL1/L2/L3`/`budgetLines` substantially mitigates this (frozen value cannot literally be spent because it isn't *in* a spendable mapping) — but "Pending-Classification" and "Reclaimed-In-Transit" states have no such structural separation, because (per GAP-CLS-01) they have no on-chain representation to be separated *by*.
- **Auditability Impact**: Medium — the frozen-asset half is auditable via structural non-comingling; the other two states have nothing to audit against.
- **Testability Impact**: Medium — the frozen-asset half could be tested today (verify `frozenAssets` value never appears in a spend); the other two halves cannot be tested without GAP-CLS-01.
- **Formal Verification Impact**: High — a complete model requires all three excluded states to be representable, which only one (Frozen) currently is, structurally.
- **Priority**: **P1 High**
- **Justification**: High risk with a genuinely mixed profile — one-third of the property (frozen-value exclusion) is close to a "true runtime gap" addressable today via structural reasoning about existing mappings; two-thirds depend on the P0 root cause. This split profile, combined with its High risk rating, places it just below the P0 cluster.

### GAP-CLS-02 — General prohibition on reclassification (beyond freeze-routing sub-paths)
- **Category**: Classification | **Risk Level**: Medium
- **Doctrine Impact**: Protects against the explicitly-enumerated Prohibited Reclassification Paths (Step-44) — most of which describe transitions between states that do not yet exist on-chain.
- **Runtime Impact**: Medium — the one sub-domain that *does* have on-chain representation (freeze-routing, via `FreezeStatus`) is solidly covered (FRC-02/03); the broader prohibition, spanning states that don't exist on-chain, has no possible runtime check today.
- **Auditability Impact**: Medium — the freeze-routing sub-paths are auditable via the enum and events; the rest is not.
- **Testability Impact**: Medium — same split as above.
- **Formal Verification Impact**: High — a complete reclassification-path model requires the full eight-state representation GAP-CLS-01 lacks.
- **Priority**: **P1 High**
- **Justification**: Promoted to P1 (above its raw Medium risk rating) because it sits at the conceptual center of the classification-integrity family — it is the invariant that would, if the GAP-CLS-01 root cause were ever resolved, become the *primary* thing a state-machine representation would need to enforce. Its High Formal-Verification impact and its role as the natural "next layer" above CLS-01 justify tracking it alongside the P0 cluster rather than with the more peripheral Medium-risk entries.

### GAP-SWF-04 — Eligibility-test follow-on for reclaim credits
- **Category**: Classification | **Risk Level**: Medium
- **Doctrine Impact**: The first of two formal statements (with GAP-FRC-04) of the "reclaimed assets not automatic backing" doctrine element, and half of the "reserve recognition lifecycle gap."
- **Runtime Impact**: Medium — the structural absence of any `receiveReclaimedAsset` → `mint` path is a strong, durable, contract-level guarantee (see "Architectural Boundaries" below); the *missing* piece is purely the eligibility-evaluation step that would have to follow, which has no on-chain existence.
- **Auditability Impact**: Medium — the "no minting" half is directly verifiable by reading the function body; the "independent eligibility evaluation" half has nothing to verify against.
- **Testability Impact**: Medium — same split.
- **Formal Verification Impact**: Medium — the structural absence of a mint-path is a comparatively easy formal target (a reachability question); the eligibility-evaluation half is gated by GAP-CLS-01/GAP-RES-01.
- **Priority**: **P1 High**
- **Justification**: Paired with GAP-FRC-04 as two views (SWF-side and freeze/reclaim-side) of the same lifecycle gap — Step-51 explicitly notes they should be "treated as a single gap viewed from two angles." Both are placed in P1 because, unlike most classification-dependent gaps, *half* of each (the structural mint-path absence) is a concrete, currently-verifiable contract fact that a future audit could confirm without first resolving the root cause — making them more tractable, near-term audit targets than their Medium risk rating alone might suggest.

### GAP-FRC-04 — Eligibility-test follow-on for `TransferredToSWF` reclaim credits
- **Category**: Classification | **Risk Level**: Medium
- **Doctrine Impact**: Identical structure to GAP-SWF-04 — the second formal statement of "reclaimed assets not automatic backing," and the other half of the reserve-recognition lifecycle gap.
- **Runtime Impact**: Medium — identical profile to GAP-SWF-04: the structural "no mint call" guarantee is solid; the eligibility-evaluation follow-on is absent because it has no on-chain existence.
- **Auditability Impact**: Medium — identical to GAP-SWF-04.
- **Testability Impact**: Medium — identical to GAP-SWF-04.
- **Formal Verification Impact**: Medium — identical to GAP-SWF-04.
- **Priority**: **P1 High**
- **Justification**: See GAP-SWF-04 — Step-51 records these two gaps as structurally identical, traced from two contracts (`SovereignWealthFund.sol` and `AssetFreeze.sol`) to the same underlying limitation. They are assigned the same priority for the same reason and should be reviewed together, not separately, in any future scoping exercise.

---

## 4. P2 Gap Group — Medium (6 gaps)

These six gaps carry Medium risk and Medium impact across most dimensions. Each is a real, trackable finding — but each is either narrower in blast radius than the P0/P1 entries, or more clearly an audit-tooling / monitoring-design question than a core-integrity one.

### GAP-RES-02 — Doctrine-bound recognition at classification time (vs. mint time)
- **Category**: Runtime | **Risk Level**: Medium
- **Doctrine Impact**: Protects against a classification action itself pushing recognized backing past `LIQUIDITY_CAP` or misstating `MIN_RESERVE_RATIO` standing.
- **Runtime Impact**: Low — the mint-time check (`reserveCompliant`) substantially covers the *arithmetic* this invariant protects, at the one moment doctrine arithmetic is actually checked on-chain today.
- **Auditability Impact**: Low — the mint-time check is fully auditable via existing events and tests.
- **Testability Impact**: Low — already well-tested at mint time; the classification-time half cannot be tested because classification-time does not exist.
- **Formal Verification Impact**: Medium — a complete model would need a "classification-time" moment to verify against, which GAP-RES-01 does not provide.
- **Priority**: **P2 Medium**
- **Justification**: The doctrine-protective core of this invariant is, in practice, substantially realized by the existing mint-time check — Step-51 frames the missing half as the "classification-time" analog of an arithmetic guarantee that already exists and is well-tested elsewhere. Its risk is real but materially lower than the P0/P1 entries because the *arithmetic* it protects is already checked at the moment that matters most (mint).

### GAP-RES-04 — Deliberateness/authorization/replay-resistance of classification acts
- **Category**: Governance | **Risk Level**: Medium
- **Doctrine Impact**: Protects the Step-44 "Declassification Rules" — explicit, authorized, conservation-consistent, non-retroactive, lock-respecting, auditable, exactly-once.
- **Runtime Impact**: Low — the *general* properties (replay-resistance, role-gating, executed-flags) are robustly contract-enforced and tested in the SWF/token domains; the gap is specifically that these mechanisms have no "classification act" to attach to.
- **Auditability Impact**: Low — the adjacent mechanisms are fully auditable; the missing attachment point is conceptual.
- **Testability Impact**: Low — same reasoning.
- **Formal Verification Impact**: Medium — a model of "deliberate classification" needs the act (GAP-RES-01) to attach the deliberateness properties to.
- **Priority**: **P2 Medium**
- **Justification**: This is one of the strongest "adjacent coverage" cases in the register — every property this invariant names is already demonstrated, robustly, by existing mechanisms in a neighboring domain. The gap is purely that the *subject* of those properties (classification) doesn't exist; the properties themselves are not in question. That combination — strong adjacent precedent, narrow conceptual gap — places it solidly in the Medium band.

### GAP-TAI-02 — Cross-contract single-custody guarantee (same asset twice)
- **Category**: Accounting | **Risk Level**: Medium
- **Doctrine Impact**: The cross-contract half of the "Single-Custody Test" (Step-44) — that the same underlying asset never appears in two ledgers simultaneously.
- **Runtime Impact**: Medium — within-contract single-custody is solidly enforced; nothing cross-references `SovereignWealthFund.sol`, `Treasury.sol`, and `AssetFreeze.sol` storage to detect the same asset double-recorded across them.
- **Auditability Impact**: Medium — no asset-identity scheme exists uniformly across all three contracts' storage models to audit against.
- **Testability Impact**: Medium — a cross-contract test could, in principle, be designed — but only after an asset-identity scheme is defined, which does not currently exist.
- **Formal Verification Impact**: Medium — the within-contract guarantee is a comparatively easy formal target (already largely demonstrated); the cross-contract guarantee requires a shared identity model that doesn't yet exist.
- **Priority**: **P2 Medium**
- **Justification**: A genuine, trackable gap with a comparatively well-defined (if non-trivial) shape — unlike the classification-representation gaps, this one's missing piece (a cross-contract asset-identity scheme) is a concrete design question that does not first require resolving "what is classification." That makes it more tractable than the P0/P1 cluster, but its cross-contract scope and the absence of any existing identity scheme to build on keep it from the Low band.

### GAP-TAI-04 — Cross-domain reconciliation against authorized inflow/outflow totals
- **Category**: Accounting | **Risk Level**: Medium
- **Doctrine Impact**: Protects the "Audit Trail Enables Cross-Domain Reconciliation" standard (Step-44) — that the full ledger can be reconciled against authorized totals.
- **Runtime Impact**: Low — this is, by Step-44's own framing, an audit-time activity that *consumes* on-chain events rather than one a contract performs; its absence does not represent a missed runtime check so much as a missing off-chain tool.
- **Auditability Impact**: Medium — the raw material (a complete event trail across every domain) already exists and is well-tested; what's missing is the aggregation and cross-check step.
- **Testability Impact**: Medium — a dedicated reconciliation test could, in principle, be written against the existing event trail without requiring any new on-chain construct.
- **Formal Verification Impact**: Low — reconciliation is fundamentally an off-chain aggregation question, not a property of contract state to be formally modeled.
- **Priority**: **P2 Medium**
- **Justification**: Distinctive among the Medium-risk entries in that its "missing enforcement" is, by nature, an *audit-tooling* gap rather than a contract-integrity gap — the underlying data (events) is complete and well-tested; what's absent is a consumer of that data. This makes it simultaneously real (Medium risk, genuinely useful if built) and categorically different in kind from the classification-representation cluster — placing it in Medium without the urgency of the P0/P1 entries.

### GAP-ALD-05 — Re-examination of classification upon disbursement
- **Category**: Classification | **Risk Level**: Medium
- **Doctrine Impact**: Protects the Step-48 "Disbursement Lifecycle, Stage 5" standard — that Reserve-classified value is re-examined, and stops counting toward doctrine figures, at the moment it exits custody.
- **Runtime Impact**: Medium — no trigger exists because the thing being re-examined (classification status) has no on-chain existence to trigger a re-examination of.
- **Auditability Impact**: Medium — withdrawal events are fully traceable; "was continued classification re-examined" has nothing to trace against.
- **Testability Impact**: Medium — a test could assert that a withdrawal event fires (and does); it could not assert that a "re-examination" occurred, because no such on-chain act exists.
- **Formal Verification Impact**: Medium — gated by GAP-CLS-01/GAP-RES-01, but narrower in scope (a single lifecycle transition point) than those root-cause gaps.
- **Priority**: **P2 Medium**
- **Justification**: A genuine lifecycle-exit-side gap (the mirror of GAP-RES-03's entry-side concern), but narrower in scope — it concerns one transition point rather than an entire path, and its risk is tempered by the fact that the underlying withdrawal mechanics (SWF-03, ALD-03) are themselves robustly enforced and auditable. The "re-examination" layered on top is the missing piece, not the underlying movement of value.

### GAP-MEX-06 — Mapping of "breach-relevant conditions" onto TR-05/TR-06
- **Category**: Governance | **Risk Level**: Medium
- **Doctrine Impact**: Protects the "Trigger Conditions: Reserve-Ratio Breach / Liquidity-Cap Breach" standard (Step-45) — that breach-relevant conditions, including compositional-integrity findings, route through the existing TR-05/TR-06 channels.
- **Runtime Impact**: Medium — the trigger-code *exclusivity* (no new code, no automated response) is solidly preserved; what's missing is a *detector* that would map a compositional finding (e.g., the kind GAP-MEX-04/GAP-MEX-05 describe) onto a flag, since such findings would not surface as raw ratio failures.
- **Auditability Impact**: Medium — `flagViolation` events are fully traceable once raised; nothing traces *whether* a condition that should have been raised, was.
- **Testability Impact**: Medium — the existing flagging mechanism is well-tested; a "should this have been flagged" test has no detector to assert against.
- **Formal Verification Impact**: Medium — modeling "all breach-relevant conditions get flagged" requires first being able to enumerate compositional findings, which depends on GAP-MEX-04/GAP-MEX-05.
- **Priority**: **P2 Medium**
- **Justification**: A monitoring/governance-standard gap whose ultimate severity is bounded by — and substantially overlaps with — GAP-MEX-04/GAP-MEX-05 (a compositional issue that nothing detects is also, by definition, an issue that nothing maps to a trigger). Tracked separately here because it concerns the *response* layer rather than the *detection* layer, and because Step-45/Step-50 are explicit that no new trigger code or automated-response mechanism may ever be introduced to close it — a hard constraint that narrows what any future work here could even look like.

---

## 5. P3 Gap Group — Low (8 gaps)

These eight gaps share a defining property: their missing portion concerns **intent, off-chain reasoning, governance process, or conceptual framing** — dimensions that no runtime mechanism, test, or formal-verification effort could ever directly check, no matter how much future engineering investment were applied. Steps 41–49 already designate these as standards for human and process discipline; this matrix simply confirms that designation by showing that every other impact dimension is correspondingly Low.

### GAP-RES-05 — Symmetry of entry/exit rigor
- **Category**: Architecture | **Risk Level**: Medium
- **Runtime Impact**: Low — symmetry is a comparative property of a governance *process*, not of on-chain state.
- **Auditability Impact**: Medium — a human review of governance standards could assess this; no on-chain trail could.
- **Testability / FV Impact**: Low / Low — neither a test nor a formal model can compare "rigor" between two processes that don't exist as on-chain objects.
- **Priority**: **P3 Low**
- **Justification**: A comparative governance-process judgment (Step-47's "Symmetry of rigor" standard) — exactly the kind of property that remains a human-review question regardless of how the GAP-RES-01/GAP-CLS-01 root cause is ever addressed.

### GAP-TAI-01 — Cross-domain no-netting/no-merging (governance-proposal level)
- **Category**: Accounting | **Risk Level**: Medium
- **Runtime Impact**: Low — the structural separation half (no shared storage, no merge function) is already solidly contract-enforced; the remaining half concerns what figures a *human* cites in an off-chain proposal.
- **Auditability / Testability / FV Impact**: Medium / Low / Low — a governance-proposal review process could examine this; no on-chain mechanism ever could, because the figure in question never touches the contracts.
- **Priority**: **P3 Low**
- **Justification**: The contract-level half of this invariant is robustly covered (see "Architectural Boundaries" below); the remaining half is, by definition, about reasoning that occurs entirely off-chain — an unreachable target for any runtime, test, or formal mechanism.

### GAP-CLS-03 — Sovereignty of classification action (vs. adjacent oracle-boundary guarantees)
- **Category**: Governance | **Risk Level**: Low
- **Runtime / Auditability / Testability / FV Impact**: Low across the board — the adjacent oracle/Kernel role-gate boundary (`updateReserves` is `onlyKernel`; `distributeRevenue` is fixed-formula) is one of the most solidly demonstrated guarantees in the entire codebase.
- **Priority**: **P3 Low**
- **Justification**: Already carries the lowest Risk Level in the register (Low) precisely because the adjacent coverage is so strong — Step-51 calls this "one of the strongest adjacent-coverage cases in the register." The only missing piece is an action (classification) that, per GAP-CLS-01, has no on-chain existence to be sovereign or non-sovereign over.

### GAP-CLS-04 — Prohibition on "borrowing" classification status
- **Category**: Governance | **Risk Level**: Medium
- **Runtime Impact**: None — this is a prohibition on *intent* (reclassifying with a plan to reverse later); intent is definitionally not a runtime-checkable property.
- **Auditability / Testability / FV Impact**: Low / Low / Low — no audit trail, test, or formal model can establish what a governance actor *intended*.
- **Priority**: **P3 Low**
- **Justification**: A textbook example of a P3 finding — even a hypothetical, fully-resolved on-chain classification system could not close this gap, because the property it protects (absence of reversal-intent) is not a property of *state* at all. It would remain a standard for governance-review judgment forever, by its very nature.

### GAP-CLS-05 — Binary eligibility of classification specifically
- **Category**: Classification | **Risk Level**: Low
- **Runtime / Auditability / Testability / FV Impact**: Low across the board — the adjacent `reserveCompliant` mint-eligibility check robustly demonstrates exactly the binary (no-partial-state) pattern this invariant describes, in the one domain where an analog exists on-chain.
- **Priority**: **P3 Low**
- **Justification**: Already Low risk because the *pattern* is solidly proven elsewhere in the codebase; the gap is purely that the specific *subject* (classification eligibility) has no on-chain analog of its own (see GAP-CLS-01). Resolving the root cause would, if anything, likely inherit this pattern directly rather than requiring new design — making this one of the most "pre-solved-by-precedent" gaps in the register.

### GAP-SWF-05 — Prohibition on future PRs introducing new roles/thresholds
- **Category**: Governance | **Risk Level**: Low
- **Runtime Impact**: None — by definition, no runtime mechanism can constrain modifications to its own source code; this is a code-review-time and governance-time constraint.
- **Auditability / Testability / FV Impact**: Low / Low / Low — static analysis or CI policy could examine source diffs, but that is a different kind of tooling than anything this register concerns itself with.
- **Priority**: **P3 Low**
- **Justification**: This is the formal restatement of CLAUDE.md's own standing PR-review instruction ("any PR that lowers `MULTISIG_THRESHOLD`... should be flagged as a security concern") — i.e., a control that *already exists*, at the project-governance level, parallel to (and outside the scope of) any runtime mechanism. It is "open" in Step-51's register only in the narrow sense that no *runtime* check exists for it — which, for a property about future source-code changes, is structurally impossible to provide.

### GAP-ALD-01 — Allocation as a distinct, non-balance-moving earmark stage (general framing)
- **Category**: Architecture | **Risk Level**: Low
- **Runtime / Auditability / Testability / FV Impact**: Low across the board — the doctrine-critical substance (no spend before authorization, declared purpose required) is solidly covered by the existing proposal/signature/execution sequence; the gap is a difference in *conceptual framing*, which Step-48 itself flags as not perfectly matching the SWF's one-step reality.
- **Priority**: **P3 Low**
- **Justification**: The lowest-stakes entry in the register in a meaningful sense — Step-51 frames this as a documentation-consistency question (reconciling Step-48's two-stage framing with the SWF's collapsed one-step reality) rather than an enforcement question at all. Nothing about contract behavior is in question; only how a prior document chose to describe it.

### GAP-ALD-06 — Prohibition on welfare/wage/projected-mint justification for allocation sizing
- **Category**: Governance | **Risk Level**: Medium
- **Runtime Impact**: None — this is a prohibition on *reasoning* (what justified a decision), not on any resulting state; the contract can only ever see the resulting allocation, never the justification behind it.
- **Auditability / Testability / FV Impact**: Low / Low / Low — same reasoning as GAP-CLS-04: no mechanism can inspect why a human proposed what they proposed.
- **Priority**: **P3 Low**
- **Justification**: Structurally identical in kind to GAP-CLS-04 — a prohibition on a category of reasoning, which remains, by its nature, a standard for proposal review and governance discipline regardless of any future technical investment. The existing `reserveCompliant` backstop (which would independently reject a doctrine-violating "replenish" mint on its own arithmetic merits) is a meaningful adjacent guarantee that further reduces the practical stakes of this gap remaining open.

---

## Separations

### True Runtime Gaps (14)

Gaps whose missing portion describes a property that, **in principle, a contract-level `require`/check could test against existing or plausibly-extendable on-chain constructs** — i.e., the gap is about a missing *check*, not (or not only) about a missing *concept*. These are the gaps where Runtime Impact was rated Medium or High above:

`GAP-RES-01`, `GAP-RES-03`, `GAP-TAI-02`, `GAP-TAI-03`, `GAP-CLS-01`, `GAP-CLS-02`, `GAP-SWF-04`, `GAP-MEX-04`, `GAP-MEX-05`, `GAP-MEX-06`, `GAP-ALD-02`, `GAP-ALD-05`, `GAP-FRC-01`, `GAP-FRC-04`

Within this group, **GAP-FRC-01**, **GAP-TAI-02**, and **GAP-TAI-04**-adjacent reconciliation concerns stand out as the gaps most clearly checkable *today*, against constructs that already exist (`totalFrozenValue`, per-contract storage, the existing event trail) — without first requiring the GAP-RES-01/GAP-CLS-01 root-cause construct to be resolved. The remainder of this group (most centrally GAP-RES-01, GAP-CLS-01, GAP-RES-03, GAP-CLS-02, GAP-SWF-04, GAP-FRC-04, GAP-ALD-02, GAP-ALD-05, GAP-MEX-04/05/06) are runtime-shaped findings whose *closure* would first require resolving that root cause — they are "true runtime gaps" in the sense that the *property* they describe is a runtime property, even though the *path* to checking it runs through a foundational design question first.

### Documentation Gaps (11)

Gaps whose missing portion is, even in principle, **not the kind of thing a contract-level check could ever test** — these describe properties of conceptual framing, adjacent-but-not-identical coverage, or arithmetic relationships that are already substantially checked elsewhere. These are the gaps where Runtime Impact was rated Low or None above:

`GAP-RES-02`, `GAP-RES-04`, `GAP-RES-05`, `GAP-TAI-01`, `GAP-TAI-04`, `GAP-CLS-03`, `GAP-CLS-04`, `GAP-CLS-05`, `GAP-SWF-05`, `GAP-ALD-01`, `GAP-ALD-06`

Three of these (`GAP-CLS-04`, `GAP-SWF-05`, `GAP-ALD-06`) carry **None** for Runtime Impact specifically because they concern *intent* or *future source-code changes* — properties that are, by definition, permanently outside any runtime mechanism's reach, regardless of how the rest of the register evolves. The remaining eight describe gaps where strong *adjacent* coverage already substantially demonstrates the pattern the invariant protects (`GAP-RES-04`, `GAP-CLS-03`, `GAP-CLS-05`), where the doctrine-critical arithmetic is already checked at the moment that matters (`GAP-RES-02`), or where the gap is fundamentally a documentation-consistency or audit-tooling question rather than an enforcement one (`GAP-RES-05`, `GAP-TAI-01`, `GAP-TAI-04`, `GAP-ALD-01`).

### Architectural Boundaries (7 — not Open gaps; restated for cross-reference)

Step-51 separately recorded seven properties that resemble gaps on first reading but are, on inspection, **deliberate, doctrine-correct design choices** — places where the absence of a check is itself the control, not an omission. They carry no Status field, no priority, and are not part of the 25-gap count this matrix prioritizes. They are restated here only so that a future reviewer of *this* document does not mistake a P3 ranking (or any ranking) for an implicit claim that these seven need attention too — they do not, by design:

1. Welfare/wages structurally cannot enter reserve, custody, or expansion computation (`CitizenCard.sol` boundary).
2. Oracle role-gating around reserve-relevant figures (`onlyKernel` on `updateReserves`; fixed-formula `distributeRevenue`; `MINTER_ROLE`/`BURNER_ROLE` restricted to the SWF address).
3. Structural separation of Treasury and SWF storage (no shared storage, no merge function — the contract-enforced half of TAI-01/TAI-02).
4. `FreezeStatus` enum's exhaustive within-domain routing (FRC-02/FRC-03 — fully Contract-Enforced and Test-Enforced, the strongest lifecycle guarantee in the freeze/reclaim domain).
5. `receiveReclaimedAsset`'s structural absence of a `mint` call (the contract-level fact underneath "reclaimed assets not automatic backing").
6. Immutable Kernel constants and absence of upgrade proxies (`LIQUIDITY_CAP`, `MIN_RESERVE_RATIO`, `MULTISIG_THRESHOLD`, `TRIGGER_TIMEOUT` — "no admin backdoors" by design).
7. Replay/duplicate-credit resistance (TAI-05 — the one family that achieved a clean Contract-Enforced-and-Test-Enforced classification with no documentation-level remainder).

### Future Design Questions (8)

A cross-cutting subset of the 25 registered gaps — drawn from both the "True Runtime Gaps" and "Documentation Gaps" lists above — whose resolution would first require **a foundational design decision** (a decision Steps 41–50 explicitly characterize as a contract-level change outside documentation-only scope) before any engineering-scoping work could even begin. These are listed separately because, for these eight, "what would closing this look like?" is itself an open design question — not yet a question of *how* to build something, but of *whether*, and *what*, to build at all:

- **GAP-RES-01 / GAP-CLS-01** — Should "Sovereign Reserve State classification" ever become a first-class on-chain construct (an enum, status field, or mapping)? If so, what would its eight states look like as on-chain values, and what would the transition function between them need to check? Step-50's Cross-Cutting Observation is explicit that resolving this is "a contract change, squarely outside this document's documentation-only scope" — any future consideration of it would be a separate, constitutionally-significant design effort, not an incremental fix.
- **GAP-MEX-04 / GAP-MEX-05** — Should `totalReserves` ever carry provenance/composition tracking (e.g., a record of *what* contributed to the figure and *when*, so that self-referential or improperly-sourced composition could be detected)? This is a materially larger undertaking than the current instantaneous-ratio check, and Step-45/Step-50 both leave it to "future, explicitly-scoped engineering effort."
- **GAP-TAI-02** — Should a uniform asset-identity scheme ever be designed across `SovereignWealthFund.sol`, `Treasury.sol`, and `AssetFreeze.sol`, so that the same underlying real-world asset could be cross-referenced across all three ledgers? No such scheme exists today, and designing one is a non-trivial question in its own right (what constitutes "the same asset" across custodial domains with different storage models?).
- **GAP-TAI-03** — If classification ever became a first-class construct (per GAP-RES-01/GAP-CLS-01), how would it be designed to remain *independent* of, yet *reconcilable* with, custody — rather than becoming just another label derived from custody location? This is the design question that would make the resolution of GAP-RES-01/GAP-CLS-01 actually satisfy TAI-03's intent, rather than merely relocating the same conflation risk into new storage.
- **GAP-FRC-01** — If frozen-value exclusion were ever to be wired cross-contract (referencing `totalFrozenValue` from within `PahlaviToken.totalReserves` computations, for example), what would the dependency and trust model between `AssetFreeze.sol` and `PahlaviToken.sol` need to look like, and would introducing such a cross-contract reference itself constitute an undesirable new coupling? This is a question a future audit would need to weigh carefully — the current structural separation may, in fact, be safer than an active cross-reference would be.
- **GAP-ALD-01** — Should Step-48's "two distinct stages" framing ever be revised to acknowledge that, for SWF withdrawals, proposal and execution occur in the "same on-chain moment" (as Step-48 itself already notes)? This is a documentation-design question about how future formalizations should describe existing mechanics — not a question about the mechanics themselves, which are sound.

These eight are the gaps for which "what would Step-52's natural successor — a remediation-scoping document — even look like?" cannot yet be answered, because the prior question ("should this construct exist, and in what form?") has not been asked, let alone answered, anywhere in Steps 41–51. This matrix does not ask it either — it only records that the question exists and names precisely where it would need to be asked first.

---

## Priority Counts

| Priority | Count | Gap IDs |
|---|---|---|
| **P0 Critical** | 6 | GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, GAP-FRC-01 |
| **P1 High** | 5 | GAP-RES-03, GAP-ALD-02, GAP-CLS-02, GAP-SWF-04, GAP-FRC-04 |
| **P2 Medium** | 6 | GAP-RES-02, GAP-RES-04, GAP-TAI-02, GAP-TAI-04, GAP-ALD-05, GAP-MEX-06 |
| **P3 Low** | 8 | GAP-RES-05, GAP-TAI-01, GAP-CLS-03, GAP-CLS-04, GAP-CLS-05, GAP-SWF-05, GAP-ALD-01, GAP-ALD-06 |
| **Total prioritized (all Status = Open, carried forward unchanged)** | **25** | — |

| Cross-Cutting Separation | Count |
|---|---|
| True Runtime Gaps | 14 |
| Documentation Gaps | 11 |
| Architectural Boundaries (not Open gaps — restated for cross-reference only) | 7 |
| Future Design Questions (subset of the 25, drawn from both runtime and documentation gaps) | 8 |

These counts are fully traceable to, and exactly partition, the 25 Open gaps registered in [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) — 8 Documentation-Only + 17 Mixed = 25, matching Step-51's own tally exactly.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Matrix Element | Existing Source of Truth |
|---|---|
| Sole source of every Gap ID, Category, Risk Level, Doctrine Impact, and Status | [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) |
| Enforcement classifications and mapping each gap derives from | [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) |
| Invariant definitions each gap traces to | [RESERVE_INTEGRITY_INVARIANT_MATRIX.md](RESERVE_INTEGRITY_INVARIANT_MATRIX.md) (Step-49) |
| Underlying contracts and tests | `contracts/`, `test/` — referenced transitively through Steps 49–51, not re-derived here |

Where this matrix and Step-51 (or any prior document, contract, or test) appear to differ, Step-51 — and beneath it, the full Step-41–50 series, the contracts, and the tests — remains authoritative. This matrix adds a prioritization lens over Step-51's findings; it does not revise, re-derive, or supersede any of them.

---

## Summary

This document prioritizes the 25 Open gaps registered in [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) by mapping each to four additional impact dimensions — Runtime, Auditability, Testability, and Formal Verification — alongside its existing Category, Risk Level, and Doctrine Impact, and assigning each a priority band with a stated justification: **P0 Critical** (6 gaps — GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, GAP-FRC-01 — the foundational, root-cause, and `totalReserves`-integrity-critical cluster), **P1 High** (5 gaps — GAP-RES-03, GAP-ALD-02, GAP-CLS-02, GAP-SWF-04, GAP-FRC-04 — concrete lifecycle/runtime surfaces, partially derivative of the P0 cluster but distinct and risky enough to track separately), **P2 Medium** (6 gaps — GAP-RES-02, GAP-RES-04, GAP-TAI-02, GAP-TAI-04, GAP-ALD-05, GAP-MEX-06 — real, trackable findings of narrower blast radius or more clearly audit-tooling in nature), and **P3 Low** (8 gaps — GAP-RES-05, GAP-TAI-01, GAP-CLS-03, GAP-CLS-04, GAP-CLS-05, GAP-SWF-05, GAP-ALD-01, GAP-ALD-06 — findings whose missing portion concerns intent, off-chain reasoning, governance process, or framing, and which no runtime, test, or formal-verification mechanism could ever directly check). It separates the 25 gaps into 14 **True Runtime Gaps** and 11 **Documentation Gaps** by whether their missing portion is, even in principle, the kind of property a contract-level check could test; restates, for cross-reference only, the 7 **Architectural Boundaries** Step-51 identified as deliberate non-gaps (carrying no priority and requiring no attention by design); and names 8 **Future Design Questions** — a cross-cutting subset whose resolution would first require a foundational design decision that Steps 41–50 explicitly place outside documentation-only scope. It introduces no new doctrine, contract, storage, role, authority, or trigger code, and proposes no fix to any gap — every priority assignment is a statement about where a future, separately-scoped audit or engineering-scoping effort would find the most leverage, not a recommendation that any such effort be undertaken or any gap be closed. It preserves, unchanged, every doctrine element and every Gap ID, Category, Risk Level, and Status carried forward from Step-51.
