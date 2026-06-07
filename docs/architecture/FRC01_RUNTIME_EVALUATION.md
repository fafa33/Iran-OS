# FRC-01 Runtime Evaluation — GAP-FRC-01 Deep Focus (Step-56)

## Scope and Non-Goals

This is a **documentation-only, single-gap evaluation**. It focuses exclusively on **GAP-FRC-01** and its underlying **FRC-01** invariant — the one P0 gap that [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) and [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) both distinguished from the other five P0 gaps as the most concretely evaluable on its own terms. It answers eight fixed questions and reaches exactly one of two final conclusions.

It does **not** modify any contract, modify any test, or propose any implementation, code change, or contract design. It introduces no new doctrine, and preserves — unchanged and verbatim — every doctrine constant named in the task: `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (900B), oracle non-sovereignty, and frozen-assets-not-reserve.

This document is a **direct extension** of, and fully subordinate to:

- [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) — source of GAP-FRC-01's doctrine-principle statement and its "Candidate for future runtime enforcement" recommendation, which this document examines in depth.
- [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) — source of GAP-FRC-01's unique storage/state-representation answers (the only P0 gap answering "Yes" to both).
- [P0_GAP_DISPOSITION_REPORT.md](P0_GAP_DISPOSITION_REPORT.md) (Step-53) — source of GAP-FRC-01's "Runtime Gap" disposition and risk ratings.
- [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) — source of FRC-01's enforcement classification ("Mixed") and the precise current-enforcement / missing-enforcement boundary this document re-examines at finer resolution.

No fact below is independently re-derived from contracts or tests; every claim is carried forward, in summary form, from these four documents. Where this evaluation and any of those documents (or the contracts/tests beneath them) appear to differ, those documents — and the contracts/tests beneath them — remain authoritative.

---

## Doctrine Constants Preserved Verbatim (Not Redefined)

| Doctrine Element | Value / Statement | Status Here |
|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` (900B) | Preserved — referenced only |
| Oracle non-sovereignty | Oracle signals are never self-executing; they inform review and feed Kernel-mediated or fixed-formula computations only | Preserved — referenced only |
| Frozen-assets-not-reserve | Frozen/seized assets are categorically excluded from every domain's recognized balance and doctrine computation | Preserved — referenced only |

---

## 1. Exact Doctrine Being Protected

FRC-01 protects a single, narrow, already-fully-defined principle (Step-44/49): **frozen and seized assets are categorically excluded from every reserve and doctrine computation** — they must never be counted, in whole or in part, toward `totalReserves`, toward the `MIN_RESERVE_RATIO = 333` compliance ratio, toward the `LIQUIDITY_CAP = 900B` ceiling, or toward any Treasury or provincial-distribution total.

This is the on-chain expression of a constitutional and economic fact: an asset under freeze (per the Reclaim Protocol's lifecycle — `Active → UnderReview → Confirmed → (TransferredToSWF or Released)`) is, by definition, *not yet* — and may never become — sovereign property. Counting it as reserve before its status is finally resolved would let a contested or unconfirmed asset inflate the figures that `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` exist to keep honest, exactly the kind of premature or improper recognition the broader Reserve Recognition doctrine (the same doctrine GAP-RES-01/CLS-01/TAI-03 protect at the classification layer) is designed to prevent.

Per Step-55, this is the *narrowest and most concretely defined* of the six P0 doctrine principles — it concerns a relationship between two already-named, already-tracked quantities (frozen value and recognized reserve value), not an open question of what "classification" should mean or look like.

---

## 2. Existing Runtime Protections Already Present

Three distinct protections already exist and already hold, per Step-50/51/53:

- **`FreezeStatus` state machine** (`AssetFreeze.sol`) — fully **Contract-Enforced and Test-Enforced** (Step-50, FRC-02/FRC-03): the moment an asset is frozen via `freezeAsset`, its status (`Active → UnderReview → Confirmed → ...`) is recorded faithfully and exhaustively; this is not in question and is not part of this gap.
- **`totalFrozenValue` / `totalFrozenAssets` counters** (`AssetFreeze.sol`) — maintained accurately and verifiably alongside the status records, giving the system a single, authoritative, on-chain figure for "how much value is currently frozen."
- **Structural storage separation** (the strongest of the three, and explicitly named an "Architectural Boundary" — a deliberate, intentional non-gap — in Step-51 item 3): `AssetFreeze.sol` and `PahlaviToken.sol`/`Treasury.sol` share **no storage**. Frozen assets are recorded in `frozenAssets`/`totalFrozenValue`; recognized reserves are recorded in `layerL1/L2/L3` and `totalReserves`. A frozen asset simply has **no code path** by which it could enter the mappings `totalReserves` is computed from — exclusion today is not an active decision the system makes at computation time, but a structural fact about where things are stored from the moment they are frozen.

Together, these three mean that **the doctrine currently holds** — frozen value is not, in fact, counted as reserve today — but it holds *because the two domains never touch*, not because anything actively checks that they don't.

---

## 3. Existing Test Coverage Already Present

Per Step-50's enforcement mapping and `test/06_asset_freeze.test.js`:

- The `FreezeStatus` lifecycle transitions (`Active → UnderReview → Confirmed → TransferredToSWF`/`Released`) are directly tested.
- The accuracy of `totalFrozenValue`/`totalFrozenAssets` bookkeeping at each stage of that lifecycle is directly tested.
- The `COUNCIL_ROLE` 3-signature confirmation requirement for `confirmFreeze` and the `CRAWLER_ROLE`-gating of `freezeAsset` are directly tested.

What is **not** tested — because no such behavior exists in any contract for a test to exercise — is any property of the form "a frozen asset's value never appears in, or affects, `totalReserves`/`MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` computations." Step-50 confirms directly: "the cross-domain guarantee that this status causes the asset's value to be *excluded* from `totalReserves`, Treasury totals, and every doctrine computation is not checked anywhere on-chain" — and, correspondingly, nowhere in the test suite.

---

## 4. What Specific Runtime Check Is Currently Missing

Precisely one thing: an **active, on-chain cross-reference** between `AssetFreeze.totalFrozenValue` (or the per-asset `frozenAssets` records) and `PahlaviToken.totalReserves` / any Treasury or doctrine-relevant total — a check that would, at the moment any such total is computed or relied upon, confirm that no portion of it derives from, overlaps with, or has been influenced by currently-frozen value.

No such check exists in any direction: `PahlaviToken.sol` does not consult `AssetFreeze.sol`'s state when computing or validating `totalReserves`; `AssetFreeze.sol` does not notify or constrain `PahlaviToken.sol` when an asset's status changes; and no third contract (e.g., the Kernel) mediates a relationship between the two. The exclusion is, today, **emergent from the absence of any connection** — not the product of a connection that actively enforces it.

---

## 5. Does the Missing Check Require...

| Requirement | Answer | Basis |
|---|---|---|
| **New storage** | **No** | Both quantities the check would compare — `totalFrozenValue` and `totalReserves` — already exist, in already-allocated storage, and are already maintained accurately. Per Step-54, GAP-FRC-01 is the *only* P0 gap answering "No" (i.e., "Yes, can be solved without new storage") to this question. |
| **New role** | **No** | The check would be a read-and-compare operation over existing public/queryable state; it implies no new actor, no new permission to grant, and no new entity whose access would need to be role-gated. Existing roles (`CRAWLER_ROLE`, `COUNCIL_ROLE`, `KERNEL_ROLE`, `MINTER_ROLE`) already fully govern every function on both sides of the would-be connection. |
| **New authority** | **No** | No new decision-making body, signature scheme, or approval pathway is implied. The check, if it existed, would be a deterministic computation over existing figures — not a judgment call requiring anyone's authorization. |
| **New trigger code** | **No** | This concerns an internal accounting cross-reference, not a constitutional violation category. None of TR-01 through TR-06 describe this relationship, and nothing about closing this gap implies, requires, or suggests a seventh. |
| **Cross-contract coupling** | **Yes** | This is the one, singular requirement the missing check cannot avoid: `PahlaviToken.sol` (or an intermediary) would need to read from, depend on, or otherwise be aware of state in `AssetFreeze.sol` — a dependency that **does not exist today** and that the current architecture, per Step-51's "Architectural Boundaries," appears to deliberately avoid. |

**This is the cleanest possible profile for a missing check among the six P0 gaps**: every "structural/foundational" requirement (storage, role, authority, trigger code) answers No; the *only* requirement is the one that is, definitionally, what "wiring two existing things together" means.

---

## 6. Benefits If Enforced

- **Converts an emergent guarantee into a verified one.** Today, "frozen assets are excluded from reserves" is true because of *where things are stored* — a fact a careful auditor can confirm by tracing storage layouts (as Step-53 itself did, in calling this guardrail "substantially structural"). An active check would make this guarantee true *because the system actively verifies it on every relevant computation* — a strictly stronger and more legible form of assurance, independent of whether storage layouts ever change for unrelated reasons.
- **Closes the one remaining seam in an otherwise well-isolated pair of domains.** Per Step-50/53, this is the *only* identified channel by which frozen-asset value could ever reach `totalReserves` — closing it (in the sense of actively guarding it, not merely leaving it structurally absent) would remove this concern from the register entirely, with no remaining "what if" about this particular pathway.
- **Provides a durable backstop against future architectural drift.** The structural separation that protects this property today is a *property of the current code*, not an invariant the system itself enforces. Should any future, separately-scoped change ever introduce a connection between these domains for an unrelated reason (e.g., a shared accounting utility, a unified reporting view, a new contract that reads from both), an active check would catch an accidental violation at the moment it occurred; the current structural protection, by contrast, offers no resistance to a change that removes the very separation it depends on.
- **Strengthens auditability and formal-verification posture with comparatively little new surface to verify.** Because both quantities already exist and are already individually well-tested, a property of the form "these two never overlap" is a comparatively small, well-bounded, and well-understood thing to state, test, and (in principle) formally verify — in sharp contrast to the open-ended scoping questions attached to the other five P0 gaps.

---

## 7. Risks If Enforced

- **Introduces a coupling the architecture currently, and perhaps deliberately, avoids.** Step-52 raised this directly and by name: "the current structural separation may, in fact, be safer than an active cross-reference would be." `AssetFreeze.sol` and `PahlaviToken.sol` today share no storage and have no call relationship — a clean separation that is, in itself, a form of protection (it bounds the blast radius of bugs, upgrades, or compromises in either contract from affecting the other). Wiring them together — even narrowly, even read-only — would be the first crack in that separation, and could set a precedent that makes the *next* such coupling easier to justify, gradually eroding an isolation property that costs nothing to keep today.
- **Creates a new dependency surface that itself requires correctness and ongoing maintenance.** A cross-contract read introduces a new failure mode that does not exist today: what happens if the read fails, returns an unexpected value, or behaves differently than assumed after either contract is modified for unrelated reasons? The check would need to remain correct *across both contracts' independent evolution* — a maintenance burden and a subtle-bug surface that a structurally-separated pair of contracts simply does not have.
- **Risk of false confidence from an incomplete check.** If the cross-reference were ever scoped narrowly (e.g., checking only `Active`-status assets, or only direct value rather than indirect derivatives), it could create the appearance of a closed gap while leaving adjacent pathways open — arguably worse than the current state, where the absence of any check at least invites continued scrutiny rather than inviting reliance on a partial one.
- **Sets a precedent for resolving "Mixed"-classification gaps via coupling rather than separation**, which — if applied uncritically to the other Mixed/Architectural P0 gaps (GAP-MEX-04, GAP-MEX-05, and by extension the classification-layer gaps) — could push the architecture toward a more interconnected, harder-to-reason-about shape than its current cleanly-separated domains represent. This gap's resolution path is, in that sense, not fully isolable from the broader architectural character of the other five.

---

## 8. Complexity Level

**Low.**

This assessment is consistent across, and directly supported by, every prior step's independent analysis of this specific gap:

- Step-54 confirmed GAP-FRC-01 is the *only* P0 gap requiring **neither** new storage **nor** new state representation — the two factors that make the other five gaps' eventual resolutions open-ended and potentially substantial.
- Step-52 named this gap "the P0 gap most clearly addressable... without first requiring the GAP-RES-01/GAP-CLS-01 root-cause construct to be resolved."
- Both quantities the check would relate (`totalFrozenValue`, `totalReserves`) are individually mature, already deployed, already accurately maintained, and already independently well-tested — none of the upstream uncertainty that makes GAP-MEX-04/MEX-05's eventual scope "bimodal and undetermined" (Step-54) applies here.
- The only structural requirement the missing check cannot avoid (cross-contract coupling, per Question 5 above) is narrow, singular, and well-understood in nature — a read-and-compare relationship between two already-named values, not a multi-domain lineage-tracking system (contrast GAP-MEX-05's four-domain influence-tracing scope) or an open-ended new data model (contrast GAP-RES-01/CLS-01/TAI-03).

"Low" here describes the **technical shape and bound of the missing check itself** — not a judgment about whether building it is wise, nor a statement that the surrounding governance question (Question 7, first risk) is similarly simple. The check would be small; the decision about whether a small check is worth a small new coupling is a separate, and not small, question — exactly the distinction Step-55 drew in recommending this gap for a different category than the other five.

---

## Final Conclusion

> **Candidate for future runtime enforcement.**

This conclusion is reached, and is reachable, *specifically because* of the unique profile this evaluation surfaces — a profile no other P0 gap shares:

1. The doctrine being protected (Question 1) is **already fully and narrowly defined** — there is no open question about *what* "frozen-assets-not-reserve" means, only whether to actively verify it.
2. The existing protections (Questions 2–3) are **substantial and currently holding** — this is not a gap where something is going wrong today; it is a gap where something that is *currently right* rests on a structural fact rather than an active guarantee.
3. The missing check (Question 4) is **singular, well-bounded, and precisely nameable** — not an open scoping question, as with the Mixed and Architectural P0 gaps.
4. Of the five structural prerequisites examined (Question 5), **four answer "No" outright** — no new storage, role, authority, or trigger code — leaving only the one (cross-contract coupling) that is, by the nature of "connecting two existing things," unavoidable in any conceivable resolution of this specific gap.
5. The benefits and risks (Questions 6–7) are **symmetric, nameable, and already weighed once** — Step-52 already raised the central tension ("the current structural separation may, in fact, be safer than an active cross-reference would be") directly and by name; this evaluation confirms that observation holds up under closer, single-gap scrutiny rather than dissolving or sharpening into a clear case either way.
6. The complexity (Question 8) is **Low** — markedly lower than any plausible estimate for the other five P0 gaps, all of which carry open-ended scoping questions this gap does not.

A "candidate for future runtime enforcement" is not a recommendation to build anything, nor an estimate of priority or timeline relative to the other five gaps — it is a statement that, **unlike the other five P0 gaps (each independently routed to "Requires major architectural decision" in Step-54/55)**, this one is *already in a state where a future, separately-scoped runtime-enforcement effort could begin meaningfully* — because the doctrine is settled, the quantities exist, the check is namable, and the trade-off is already on the table rather than hidden behind a larger, unresolved design question. Whether, when, or how such an effort should ever actually begin remains entirely outside this document's scope, and entirely undecided by it.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Evaluation Element | Existing Source of Truth |
|---|---|
| Doctrine principle, "Candidate for future runtime enforcement" baseline recommendation | [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) |
| Storage/state-representation/coupling routing facts | [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) |
| Gap nature ("Runtime Gap"), risk ratings, current-protection description | [P0_GAP_DISPOSITION_REPORT.md](P0_GAP_DISPOSITION_REPORT.md) (Step-53) |
| FRC-01 enforcement classification ("Mixed"), current/missing enforcement boundary | [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) |
| Underlying contracts and tests | `contracts/reclaim/AssetFreeze.sol`, `contracts/monetary/PahlaviToken.sol`, `test/06_asset_freeze.test.js` — referenced transitively, not re-derived here |

Where this evaluation and any prior document, contract, or test appear to differ, those documents — and beneath them, the contracts and tests — remain authoritative. This evaluation adds a *focused, single-gap depth pass* (exactly what is missing, exactly what it would and would not require, and exactly why this gap's character differs from its five P0 siblings) over findings that are already fully established elsewhere; it revises, re-derives, supersedes, and proposes nothing.

---

## Summary

This evaluation focuses exclusively on GAP-FRC-01 / the FRC-01 invariant and answers eight fixed questions. The doctrine protected is the already-fully-defined frozen-assets-not-reserve principle. Existing runtime protections are substantial and currently holding: a fully Contract-Enforced-and-Test-Enforced `FreezeStatus` state machine, accurate `totalFrozenValue` bookkeeping, and — most significantly — a deliberate structural storage separation between `AssetFreeze.sol` and `PahlaviToken.sol`/`Treasury.sol` that means frozen value has no code path into reserve totals today. Existing test coverage fully covers the freeze lifecycle and bookkeeping but, consistent with Step-50's "Mixed" classification, contains no test of the cross-domain exclusion property itself, because no such on-chain behavior exists to test. The single missing check is an active cross-reference between `totalFrozenValue` and `totalReserves`/doctrine totals. That check would require **no new storage, no new role, no new authority, and no new trigger code** — the only unavoidable requirement is **cross-contract coupling**, a dependency the current architecture appears to deliberately not have. Enforcing it would convert an emergent (structural) guarantee into a verified one, close the one remaining identified channel for this specific failure mode, and provide a durable backstop against future architectural drift — at the cost of introducing exactly the kind of new inter-contract dependency, maintenance surface, and precedent that Step-52 already flagged as a live concern, with a real risk of false confidence if any eventual check were scoped incompletely. Complexity is assessed as **Low** — the lowest of any P0 gap — because both quantities already exist, are mature and well-tested, and the missing element is singular and precisely bounded rather than open-ended. The final conclusion is **Candidate for future runtime enforcement**, distinguishing GAP-FRC-01 from all five other P0 gaps (each independently routed to "Requires major architectural decision"), on the strength of its uniquely settled doctrine, uniquely well-bounded missing check, and uniquely low technical complexity — without recommending, scoping, prioritizing, or proposing any actual implementation. Every doctrine constant named in the task — `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900B`, oracle non-sovereignty, frozen-assets-not-reserve — is preserved verbatim and unchanged.
