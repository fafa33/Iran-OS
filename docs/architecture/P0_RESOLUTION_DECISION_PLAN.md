# P0 Resolution Decision Plan — Architecture Formalization (Step-54)

## Scope and Non-Goals

This document is a **documentation-only classification and routing exercise**. For each of the six P0 gaps already identified, prioritized, and dispositioned in prior steps, it answers a fixed set of eight routing questions and assigns exactly one **Recommended Path**. It does **not**:

- Change, or propose changes to, any contract, interface, storage layout, enum, mapping, or event.
- Add, or propose adding, any test.
- Introduce any new storage, state representation, role, authority, threshold, or trigger code.
- Introduce any new doctrine or revise any existing doctrine constant.
- Propose, sketch, or imply any specific implementation.

It introduces **no new doctrine, no new contracts, no new storage, no new roles, no new authorities, no new trigger codes, and no fixes**. Its sole output is a *decision-routing classification* — for each P0 gap, which of four standard paths (Leave as governance constraint / Add runtime guardrail / Add state representation / Requires doctrine decision first) a future, separately-scoped effort should take *first*, and why — so that no future engineering work begins by guessing at the wrong starting question.

This document is a **direct extension** of, and is fully subordinate to:

- [P0_GAP_DISPOSITION_REPORT.md](P0_GAP_DISPOSITION_REPORT.md) (Step-53) — source of each gap's Architectural-Gap/Runtime-Gap disposition, root cause, and risk ratings; this plan refines that disposition into a routable decision by introducing the **Mixed** type and the storage/state-representation questions below.
- [GAP_PRIORITIZATION_MATRIX.md](GAP_PRIORITIZATION_MATRIX.md) (Step-52) — source of the P0 designation and the "Future Design Questions" framing.
- [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) — source of root causes, current-enforcement facts, and dependency relationships.
- [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) — source of the underlying enforcement-classification facts and the Cross-Cutting Observation naming "classification representation" as the central root cause.

No fact below is independently re-derived from contracts or tests; every claim is carried forward, in summary form, from these four documents. Where this plan and any of those documents (or the contracts/tests beneath them) appear to differ, those documents — and the contracts/tests beneath them — remain authoritative.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Status Here |
|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` | Preserved — referenced only |
| Oracle signals are non-sovereign | Never self-executing; informs review and feeds Kernel-mediated or fixed-formula computations | Preserved — referenced only |
| Frozen assets are not reserve assets | Excluded from every domain's recognized balance and doctrine computation | Preserved — referenced only |
| Reclaimed assets are not automatic backing | Pure accounting credit to L1; no mint, no automatic classification | Preserved — referenced only |
| Welfare/wages are non-reserve assets | `CitizenCard.sol` manages eligibility/status only; wage is an off-chain employer obligation | Preserved — referenced only |

---

## How to Read This Plan

For each of the six P0 gaps, this plan answers exactly eight fixed questions:

1. **Gap Type** — `Architectural` / `Runtime` / `Mixed`. This refines Step-53's binary Architectural-Gap/Runtime-Gap disposition: a gap is **Mixed** here if its *missing element* is shaped like a runtime check (a verification over named, existing values) **but** closing it would, on inspection, also require a new on-chain construct to exist *first* (e.g., provenance/composition data that is not currently tracked anywhere). Step-53 classified such gaps by the *nature of the absence*; this plan classifies them additionally by *what closing them would actually touch* — which is the more decision-relevant lens for routing.
2. **Can it be solved without new storage?** — `Yes` / `No`. Whether any conceivable resolution could avoid adding a new storage slot, mapping, or struct field.
3. **Can it be solved without new state representation?** — `Yes` / `No`. Whether any conceivable resolution could avoid representing a new *kind* of on-chain state (an enum, status, or classification value) — a narrower and stricter question than (2): some resolutions might add storage (e.g., a counter or a cross-reference cache) without representing any new *kind* of state.
4. **Requires contract change?** — `Yes` / `No`. Whether any conceivable resolution could be achieved without modifying contract code at all.
5. **Requires only tests?** — `Yes` / `No`. Whether the gap could be closed by adding test coverage alone, with no contract change. (This is the inverse-companion check to (4): a gap can only be "tests-only" if the property it describes is already checkable against existing contract logic — i.e., the contract already does the right thing and merely lacks a test demonstrating it.)
6. **Requires doctrine decision before implementation?** — `Yes` / `No`. Whether a foundational design or constitutional-interpretation question — one that Steps 41–53 raised but explicitly left open — would need to be answered *before* any engineering-scoping conversation could meaningfully begin.
7. **Recommended Path** — exactly one of:
   - **Leave as governance constraint**: the property is, and should for now remain, enforced through review discipline rather than code: routing it onward would manufacture engineering work the architecture does not yet need or clearly want.
   - **Add runtime guardrail**: the missing element is a check over constructs that already exist; a future effort's first question would be how to design that check, not whether to build new representation.
   - **Add state representation**: the missing element is a construct (a new enum, status, or tracked property) that does not exist; a future effort's first question is what that construct should look like.
   - **Requires doctrine decision first**: an open design or constitutional-interpretation question (named in Step-52's "Future Design Questions") sits upstream of all three other paths, and must be resolved before any of them could be meaningfully chosen.
8. **Risk if Left Unresolved** — `Low` / `Medium` / `High`, carried forward from Step-53's Financial-Risk / Governance-Risk ratings (the higher of the two, since either alone is sufficient to make non-resolution costly).

---

## P0 Resolution Decision Table (At a Glance)

| Gap ID | Gap Type | Without New Storage? | Without New State Repr.? | Requires Contract Change? | Requires Only Tests? | Requires Doctrine Decision First? | Recommended Path | Risk if Unresolved |
|---|---|---|---|---|---|---|---|---|
| GAP-RES-01 | Architectural | No | No | Yes | No | Yes | Requires doctrine decision first | High |
| GAP-CLS-01 | Architectural | No | No | Yes | No | Yes | Requires doctrine decision first | High |
| GAP-TAI-03 | Architectural | No | No | Yes | No | Yes | Requires doctrine decision first | High |
| GAP-MEX-04 | Mixed | No | No | Yes | No | Yes | Requires doctrine decision first | High |
| GAP-MEX-05 | Mixed | No | No | Yes | No | Yes | Requires doctrine decision first | High |
| GAP-FRC-01 | Runtime | Yes | Yes | Yes | No | Yes | Requires doctrine decision first | Medium |

A first glance at this table could read as anticlimactic — every gap routes to the same final path. That convergence is itself the principal finding of this plan, and is examined in the Cross-Cutting Routing Observations section below; it is not an artifact of a coarse rubric. The eight questions were answered independently for each gap, and they *diverge* sharply on questions 1–5 (three distinct Gap Types, a clean storage/representation split between the FRC-01 case and the other five). It is only the convergence on question 6 — and therefore on question 7 — that produces a uniform routing outcome, and that convergence has a specific, traceable cause documented below.

---

## Detailed Decisions

### GAP-RES-01 — Sovereign Reserve classification as a discrete on-chain act

1. **Gap Type**: **Architectural** — per Step-53's disposition, there is no on-chain construct (enum, mapping, function) representing "classification" at all; the absence is of the subject matter itself, not of a check over it.
2. **Can it be solved without new storage?**: **No** — recording that a balance "is" Sovereign Reserve, as a discrete, queryable, on-chain fact, requires *some* new storage location; there is no existing slot this could be folded into without altering its meaning.
3. **Can it be solved without new state representation?**: **No** — this is precisely the missing element: a representable "classification" value. No resolution of this gap is conceivable that does not introduce one.
4. **Requires contract change?**: **Yes** — a new construct cannot be added without modifying contract code.
5. **Requires only tests?**: **No** — there is nothing in the existing contracts for a test to exercise; the subject of the test does not yet exist.
6. **Requires doctrine decision before implementation?**: **Yes** — per Step-52's "Future Design Questions," the open question is "should 'Sovereign Reserve State classification' ever become a first-class on-chain construct... and what would its eight states look like as on-chain values?" — a question about *whether and how* a foundational construct should exist, which Steps 44–53 have consistently treated as unresolved and out of documentation-only scope.
7. **Recommended Path**: **Requires doctrine decision first** — any attempt to route this directly to "Add state representation" would presuppose an answer ("yes, build it, and here roughly is its shape") that no prior document in this series has given. The doctrine question is logically and sequentially prior to the engineering question.
8. **Risk if Left Unresolved**: **High** — carried forward from Step-53: this construct's absence is, per Step-50's Cross-Cutting Observation, the root cause beneath the majority of the 25-gap register; its continued absence means the doctrine's most foundational recognition guarantees remain enforced by convention indefinitely.

---

### GAP-CLS-01 — Exactly-one-classification-state consistency

1. **Gap Type**: **Architectural** — twin of GAP-RES-01; the eight classification states have no on-chain representation as discrete, mutually-exclusive values for any consistency property to be checked over.
2. **Can it be solved without new storage?**: **No** — representing eight mutually-exclusive states requires a new storage location (an enum or status field), exactly as `FreezeStatus` required one in `AssetFreeze.sol`.
3. **Can it be solved without new state representation?**: **No** — "exactly-one-state consistency" is, definitionally, a property *of* a state representation; it cannot be expressed, let alone checked, without one existing first.
4. **Requires contract change?**: **Yes**.
5. **Requires only tests?**: **No** — same reasoning as GAP-RES-01: nothing exists yet to test.
6. **Requires doctrine decision before implementation?**: **Yes** — Step-51 names this gap's root cause as "functionally inseparable" from GAP-RES-01's; the same upstream design question (what would the eight states look like as on-chain values?) governs both, and would necessarily be answered for both together, not independently.
7. **Recommended Path**: **Requires doctrine decision first** — for the same reason as GAP-RES-01, and because Step-51/52 both insist these two gaps cannot be meaningfully routed apart from one another.
8. **Risk if Left Unresolved**: **High** — carried forward from Step-53: a balance simultaneously and silently assignable to two states (e.g., "Frozen" and "Sovereign Reserve") would corrupt every doctrine computation downstream, with no existing mechanism positioned to notice.

---

### GAP-TAI-03 — Independence of custody and classification as tracked properties

1. **Gap Type**: **Architectural** — the formal accounting-layer restatement of the GAP-RES-01/GAP-CLS-01 root cause; concerns the relationship between two properties, one of which (classification) has no on-chain representation at all.
2. **Can it be solved without new storage?**: **No** — independence between two properties cannot be represented, let alone preserved, when only one of the two properties (custody) currently has any storage to be independent *from*.
3. **Can it be solved without new state representation?**: **No** — by the same reasoning, more strictly: this gap requires not merely *a* new representation but one specifically designed to remain independent of, and reconcilable with, the existing custody representation — a stricter requirement than GAP-RES-01/CLS-01 individually.
4. **Requires contract change?**: **Yes**.
5. **Requires only tests?**: **No**.
6. **Requires doctrine decision before implementation?**: **Yes** — and, per Step-53's analysis, a *compound* one: even a full resolution of GAP-RES-01/GAP-CLS-01 (i.e., a classification construct coming into existence) would not by itself answer *this* gap's question, which is specifically whether that construct would be designed to remain independent of custody or would risk collapsing into a custody-derived label. This is a distinct, additional design decision layered on top of the GAP-RES-01/CLS-01 question.
7. **Recommended Path**: **Requires doctrine decision first** — and notably the *most* doctrine-dependent of the three Architectural gaps: it cannot even be fully scoped until the GAP-RES-01/GAP-CLS-01 question is answered, at which point a second, narrower doctrine question (independence-by-design vs. derivation) would still remain.
8. **Risk if Left Unresolved**: **High** — carried forward from Step-53: this is precisely the seam (Step-44's Prohibited Reclassification Path) at which a deposit or reclaim credit could be silently treated as proof of reserve classification, corrupting doctrine totals without any code-level violation occurring anywhere.

---

### GAP-MEX-04 — Non-self-referential composition of `totalReserves`

1. **Gap Type**: **Mixed** — Step-53 dispositioned this as a Runtime Gap on the basis that its *subject* (`totalReserves`, `updateReserves`, `reserveCompliant`) already exists and is deployed. This plan's finer-grained routing lens reaches a different conclusion on the *resolution* question specifically: closing this gap fully would require *provenance/composition tracking data* that does not exist anywhere on-chain today — meaning the eventual fix would necessarily combine a **new construct** (composition history — an architectural element) with **a check over it** (a runtime element). That combination is exactly what "Mixed" is defined to capture in this plan, and is the reason questions 2–3 below answer differently here than they would for a pure Runtime Gap.
2. **Can it be solved without new storage?**: **No** — verifying that `totalReserves` was not composed self-referentially requires *some* record of how it was composed; no such record exists, and none of the existing storage (`totalReserves` itself, `layerL1/L2/L3`) carries that information implicitly.
3. **Can it be solved without new state representation?**: **No** — "composition history" or "provenance" would itself be a new *kind* of on-chain state, not merely a new storage slot holding an existing kind of value (e.g., a counter). This is the specific reason this gap cannot be routed as a pure "Add runtime guardrail" case the way GAP-FRC-01 can.
4. **Requires contract change?**: **Yes**.
5. **Requires only tests?**: **No** — there is no existing contract behavior a test could currently exercise to demonstrate non-self-referential composition; the underlying data the test would need to inspect does not exist.
6. **Requires doctrine decision before implementation?**: **Yes** — per Step-52's "Future Design Questions": "Should `totalReserves` ever carry provenance/composition tracking... ? This is a materially larger undertaking than the current instantaneous-ratio check." Until that question is answered, it is not possible to know whether the eventual resolution would look like a modest cross-reference (routable as a guardrail) or a substantial new subsystem (routable as new representation) — the doctrine question determines which engineering question would even apply.
7. **Recommended Path**: **Requires doctrine decision first** — specifically because, unlike GAP-FRC-01 (where both halves of the missing relationship already exist), the *scope* of what would need to be built here is itself undetermined without a prior design decision. Routing this directly to either "Add runtime guardrail" or "Add state representation" would require guessing which one applies — exactly the kind of premature commitment this plan exists to avoid.
8. **Risk if Left Unresolved**: **High** — carried forward from Step-53: a self-referential backing relationship (newly-minted Pahlavi counted toward the reserve figure that justified minting it) would be undetectable by every existing check and would represent, in Step-53's words, "arguably the single most severe monetary-doctrine failure conceivable."

---

### GAP-MEX-05 — Compositional guarantee that no oracle/reclaim/frozen/welfare figure influenced a mint

1. **Gap Type**: **Mixed** — the input-source mirror of GAP-MEX-04, sharing its exact structural character: the role-gates and the figure (`totalReserves`) already exist and are well-tested, but verifying *upstream influence* on that figure requires provenance data that does not exist — the same combination of a missing construct and a missing check that defines "Mixed" in this plan.
2. **Can it be solved without new storage?**: **No** — tracing whether an oracle estimate, reclaim confirmation, frozen-asset valuation, or welfare/wage figure ever influenced `totalReserves` requires recording *that lineage* somewhere; nothing today records it.
3. **Can it be solved without new state representation?**: **No** — "influence lineage" across four named domains would be a new kind of on-chain state, not an extension of any existing one (role-gate booleans and `totalReserves` itself carry no provenance information by construction).
4. **Requires contract change?**: **Yes**.
5. **Requires only tests?**: **No** — for the same reason as GAP-MEX-04: the data a test would need to inspect does not exist to be inspected.
6. **Requires doctrine decision before implementation?**: **Yes** — Step-51 and Step-52 both treat this gap and GAP-MEX-04 as "two views of one underlying limitation... any future scoping of either would necessarily address both together"; the doctrine question (should provenance tracking exist, and across which domains?) is shared and singular, not duplicated per gap.
7. **Recommended Path**: **Requires doctrine decision first** — for consistency with GAP-MEX-04 (per the explicit pairing in Steps 51–52) and for the identical underlying reason: the shape of any eventual fix is undetermined until the shared doctrine question is answered.
8. **Risk if Left Unresolved**: **High** — carried forward from Step-53: an improperly-influenced `totalReserves` figure would corrupt every downstream doctrine computation while passing every existing role-gate and arithmetic check undetected — a compositional failure with system-wide consequences and, at present, zero on-chain trace to ever reveal it.

---

### GAP-FRC-01 — Cross-domain exclusion of frozen-asset value from doctrine computation

1. **Gap Type**: **Runtime** — and, per Step-53, the cleanest instance of the category among the six: *both* halves of the missing relationship — `AssetFreeze.totalFrozenValue` and `PahlaviToken.totalReserves` — already exist as concrete, named, deployed on-chain values today. Nothing about this gap requires inventing a new kind of data; it concerns only whether two existing values are ever cross-referenced.
2. **Can it be solved without new storage?**: **Yes** — uniquely among the six P0 gaps. A cross-reference check between `totalFrozenValue` and `totalReserves` would consume two values that already exist in already-allocated storage; no new storage location is implied by the property itself.
3. **Can it be solved without new state representation?**: **Yes** — for the same reason: no new *kind* of on-chain state (no enum, no status, no classification value) is implied by checking a relationship between two existing numeric totals. This is the sharpest point of divergence between GAP-FRC-01 and the other five P0 gaps, and is the specific reason this is the only one of the six that is a *pure* Runtime Gap rather than Mixed or Architectural.
4. **Requires contract change?**: **Yes** — even though no new storage or representation is implied, *some* contract-level logic would be required to read one contract's value from within another's computation (or to otherwise wire the exclusion); that is a code change by definition, however small.
5. **Requires only tests?**: **No** — the cross-reference does not exist in the contracts today (Step-50 confirms "the cross-domain guarantee... is not checked anywhere on-chain"), so no existing behavior could be demonstrated by a test alone; the contract would need to do something it does not currently do.
6. **Requires doctrine decision before implementation?**: **Yes** — but of a qualitatively different character than the other five: the open question here is not "what should a new construct look like?" (nothing new is needed) but "*should these two existing values ever be actively cross-referenced at all* — given that, per Step-52's own observation, 'the current structural separation may, in fact, be safer than an active cross-reference would be'?" That is a genuine, named, unresolved design question (in Step-52's "Future Design Questions" list) that sits upstream of any guardrail work, even though the guardrail itself would be comparatively small.
7. **Recommended Path**: **Requires doctrine decision first** — not because the eventual guardrail would be hard to build (Step-52 calls it the P0 gap "most clearly addressable... without first requiring the GAP-RES-01/GAP-CLS-01 root-cause construct to be resolved"), but because building it at all is exactly the question still open. Adding a cross-contract reference would introduce a new coupling between `AssetFreeze.sol` and `PahlaviToken.sol` that the current architecture deliberately does not have; whether that coupling is *worth* introducing — given that the present structural separation may already be the safer design — is precisely the kind of question that must be settled before "add a guardrail" could be the right next step rather than a regression in architectural cleanliness.
8. **Risk if Left Unresolved**: **Medium** — carried forward from Step-53, and notably the *only* P0 gap rated below High: the guardrail here would supplement an already-substantial structural protection (frozen value is stored in a mapping `totalReserves` simply never consults), making this gap's current exposure comparatively bounded relative to the other five, where no such structural backstop exists.

---

## Cross-Cutting Routing Observations

**All six gaps converge on "Requires doctrine decision first" — but for three structurally distinct reasons, not one.** This convergence could be misread as evidence that the routing rubric collapses to a single answer regardless of input; the per-gap reasoning above shows the opposite — three genuinely different mechanisms produce the same terminal routing:

- For the three **Architectural** gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03), the doctrine question is prior because *the subject matter to be engineered does not yet have a defined shape* — "what would the construct even look like?" must be answered before "how do we build it correctly?" can be asked.
- For the two **Mixed** gaps (GAP-MEX-04, GAP-MEX-05), the doctrine question is prior because *the scope of the eventual fix is bimodal and undetermined* — depending on how the provenance-tracking question is answered, the resulting work could resemble either a modest guardrail or a substantial new subsystem, and these would be scoped, staffed, and reviewed completely differently.
- For the one **Runtime** gap (GAP-FRC-01), the doctrine question is prior for a third, distinct reason: *the engineering work would be comparatively small and well-understood, but whether to do it at all is contested* — Step-52 explicitly raised the possibility that the status quo (structural separation, no cross-reference) may already be the safer architecture, making "should we build this?" a live question rather than a formality.

**This finding sharpens, rather than flattens, the picture from Step-53.** Step-53 established *what kind of absence* each gap represents. This plan adds the observation that — for all six, despite their differing natures — the very first actionable step would be the *same kind of conversation* (a doctrine/design decision), even though what that conversation would need to resolve, and how consequential its answer would be, differs sharply from gap to gap. A future effort that tried to skip this step — e.g., by directly attempting to "add a guardrail" for GAP-FRC-01, or "add representation" for GAP-RES-01 — would, in every one of the six cases, run into an unanswered upstream question mid-effort rather than at its outset. Surfacing that now, while the cost of doing so is zero (a documentation exercise), is the entire value this plan adds beyond Step-53.

**The storage/state-representation questions cleanly separate GAP-FRC-01 from the other five — and that separation is the most actionable distinction in this document for sequencing future work.** GAP-FRC-01 is the only P0 gap answering "Yes" to both "without new storage?" and "without new state representation?" — meaning that, *whenever* its upstream doctrine question is eventually resolved in favor of building something, the resulting engineering effort would be markedly smaller, faster to review, and lower-risk to land than any of the other five. This makes GAP-FRC-01 the most natural candidate, among the six, for its doctrine question to be taken up *first* — not because it is more urgent (it is the only P0 gap rated Medium rather than High risk) but because answering its doctrine question would be the cheapest way to learn how this whole class of "should we add a small cross-reference guardrail" question tends to get resolved in this architecture, before the costlier and more consequential GAP-RES-01/GAP-CLS-01/GAP-TAI-03 question is taken up.

**No gap routes to "Leave as governance constraint" or directly to "Add runtime guardrail" / "Add state representation."** This is consistent with, and a direct consequence of, every one of the six having been independently confirmed (Step-52) to carry a named, open, unresolved "Future Design Question." Gaps for which no such open question exists — i.e., gaps where the path forward (or the choice to take no path) is already clear — would be the ones expected to route directly to one of the other three paths. None of the six P0 gaps are of that kind; that is, in fact, a substantial part of *why* they are P0 in the first place (per Step-52's banding rubric, P0 status requires direct bearing on `totalReserves`/`MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` integrity — and, as this plan's analysis independently confirms, every such gap turns out to also carry an unresolved foundational question). The two ratings are correlated but were derived independently; their alignment here is a useful cross-check rather than a circular restatement.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Decision Element | Existing Source of Truth |
|---|---|
| Gap Type baseline (Architectural / Runtime disposition) | [P0_GAP_DISPOSITION_REPORT.md](P0_GAP_DISPOSITION_REPORT.md) (Step-53) |
| Gap IDs, root causes, current-enforcement facts, dependency relationships | [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) |
| P0 designation, impact-dimension ratings, "Future Design Questions" | [GAP_PRIORITIZATION_MATRIX.md](GAP_PRIORITIZATION_MATRIX.md) (Step-52) |
| Enforcement classifications and Cross-Cutting Observation | [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) |
| Invariant definitions each gap traces to | [RESERVE_INTEGRITY_INVARIANT_MATRIX.md](RESERVE_INTEGRITY_INVARIANT_MATRIX.md) (Step-49) |
| Underlying contracts and tests | `contracts/`, `test/` — referenced transitively, not re-derived here |

Where this plan and any prior document, contract, or test appear to differ, those documents — and beneath them, the contracts and tests — remain authoritative. This plan adds a *routing lens* (which question would a future effort need to answer first, and through which of four standard paths?) over findings that are already fully established elsewhere; it revises, re-derives, supersedes, and proposes nothing.

---

## Summary

This document answers eight fixed routing questions for each of the six P0 Critical gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, GAP-FRC-01) and assigns each exactly one Recommended Path from a closed set of four. It classifies three gaps as **Architectural** (GAP-RES-01, GAP-CLS-01, GAP-TAI-03 — no construct exists; "what would it look like?" is the prior question), two as **Mixed** (GAP-MEX-04, GAP-MEX-05 — the subject exists, but full resolution would require both new provenance-tracking representation and a check over it, and the relative size of those two parts is itself undetermined without a prior decision), and one as **Runtime** (GAP-FRC-01 — both halves of the missing relationship already exist; only a cross-reference is absent, and uniquely among the six, no new storage or state representation would be required to add it). All six route to **Requires doctrine decision first** — a convergence this plan shows arises from three structurally distinct mechanisms (undefined construct shape; bimodal/undetermined fix scope; contested desirability of an otherwise-small change) rather than from any flattening of the rubric, and which independently corroborates Step-52's finding that every P0 gap carries a named, open "Future Design Question." Risk-if-unresolved is carried forward unchanged from Step-53: High for five gaps, Medium for GAP-FRC-01 (the only one with a substantial existing structural backstop). The storage/state-representation answers cleanly distinguish GAP-FRC-01 (Yes/Yes — smallest possible footprint, were its doctrine question ever resolved toward building something) from the other five (No/No — any resolution would necessarily touch new storage and new representation), offering a concrete, low-risk candidate for taking up its doctrine question first, should any future sequencing decision be made — without this document making, recommending, or implying that such a decision should be made now, or in any particular order beyond what is stated. No contract, test, storage, role, threshold, trigger code, or doctrine constant was changed, added, or proposed anywhere in this exercise.
