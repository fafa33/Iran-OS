# FRC-01 Technical Design Options — Comparative Evaluation (Step-57)

## Scope and Non-Goals

This is a **documentation-only comparative evaluation**. It focuses exclusively on **GAP-FRC-01** and the **FRC-01** invariant — the single P0 gap that [FRC01_RUNTIME_EVALUATION.md](FRC01_RUNTIME_EVALUATION.md) (Step-56) concluded was a "Candidate for future runtime enforcement," distinguishing it from its five sibling P0 gaps (each independently routed to "Requires major architectural decision").

It compares exactly five named options — **A** (Audit/governance control only), **B** (Test-only invariant), **C** (Kernel-side guardrail), **D** (Direct PahlaviToken ↔ AssetFreeze cross-check), and **E** (Direct Treasury ↔ AssetFreeze cross-check) — along nine fixed dimensions, and reaches a final, conservative conclusion about which path is safest and whether any of them should be acted upon now.

It does **not** modify any contract, modify any test, or propose any implementation — including pseudocode, function signatures, interfaces, or sketches of how any option's logic would be written. Each option below is described only at the level of *what kind of thing it is, what it would touch, and what trade-offs it would carry* — never *how it would be built*. It introduces no new doctrine, no new authority, and no new trigger code, and preserves — unchanged and verbatim — every doctrine constant named in the task: `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (900B), oracle non-sovereignty, and frozen-assets-not-reserve.

This document is a **direct extension** of, and fully subordinate to:

- [FRC01_RUNTIME_EVALUATION.md](FRC01_RUNTIME_EVALUATION.md) (Step-56) — source of the precise missing-check description (a single cross-reference between `totalFrozenValue` and `totalReserves`/doctrine totals), the "No new storage / role / authority / trigger code; cross-contract coupling only" requirement profile, and the Low-complexity assessment this comparison is built directly on top of.
- [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) — source of the doctrine principle being protected and the named tension ("the current structural separation may, in fact, be safer than an active cross-reference would be") that every coupling-introducing option below must be weighed against.
- [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) — source of the confirmed fact that GAP-FRC-01 alone, among the six P0 gaps, requires neither new storage nor new state representation — the structural property that makes a comparison of *placement* (rather than *construction*) options meaningful for this gap specifically.

No fact below is independently re-derived from contracts or tests; every claim is carried forward, in summary form, from these three documents (and, transitively, from Steps 49–53 beneath them). Where this comparison and any of those documents (or the contracts/tests beneath them) appear to differ, those documents — and the contracts/tests beneath them — remain authoritative.

---

## Doctrine Constants Preserved Verbatim (Not Redefined)

| Doctrine Element | Value / Statement | Status Here |
|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` (900B) | Preserved — referenced only |
| Oracle non-sovereignty | Oracle signals are never self-executing; they inform review and feed Kernel-mediated or fixed-formula computations only | Preserved — referenced only |
| Frozen-assets-not-reserve | Frozen/seized assets are categorically excluded from every domain's recognized balance and doctrine computation | Preserved — referenced only |

---

## How to Read This Comparison

For each option, this document records:

- **Description** — what *kind* of mechanism the option represents and where it would sit, in plain architectural terms — never how its logic would be written.
- **Contracts touched** — which existing contracts (if any) would need to change in order for this option to exist.
- **Storage needed?** (Yes/No) — whether the option implies any new persisted on-chain state beyond what already exists (carried forward from, and consistent with, Step-56's finding that the *check itself* needs none — this column asks whether each *specific placement* changes that answer).
- **New authority/role?** (Yes/No) — whether the option implies any new actor, permission, or decision-making body.
- **Coupling risk** (Low/Medium/High) — how much new inter-contract dependency the option would introduce, and how directly it would cut across the deliberate structural separation Step-51 named as an "Architectural Boundary."
- **Enforcement strength** (Low/Medium/High) — how directly and reliably the option would verify the doctrine property at the moment it matters.
- **Failure reduction** (Low/Medium/High) — how much of the specific failure mode named in Step-56 (frozen value silently entering `totalReserves`/`MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` computations) the option would actually close.
- **Attack surface increase** (Low/Medium/High) — how much new code, new dependency, or new interaction surface the option would add to contracts that are, or are adjacent to, doctrine-critical.
- **Compatibility with resilience-before-optimization** (Low/Medium/High) — how well the option honors the principle that a system should be made more *robust to what could go wrong* before it is made more *efficient at what already goes right* — i.e., whether the option strengthens the system's ability to remain correct under stress and change, or merely makes an already-correct property easier or faster to state.

---

## Comparison Table

| Dimension | A — Audit/Governance Only | B — Test-Only Invariant | C — Kernel-Side Guardrail | D — Direct PahlaviToken ↔ AssetFreeze | E — Direct Treasury ↔ AssetFreeze |
|---|---|---|---|---|---|
| Contracts touched | None | None (test suite only) | `kernel.sol` | `PahlaviToken.sol` | `Treasury.sol` |
| Storage needed? | No | No | No | No* | No* |
| New authority/role? | No | No | No | No | No |
| Coupling risk | Low | Low | Medium | **High** | **High** |
| Enforcement strength | Low | Low–Medium | Medium–High | High | Medium |
| Failure reduction | Low | Low–Medium | Medium–High | High | Medium |
| Attack surface increase | Low | Low | Medium | **High** | **High** |
| Resilience-before-optimization fit | High | High | Medium | Low | Low |

*See the per-option notes below: while the *values being compared* (`totalFrozenValue`, `totalReserves`) require no new storage, any option that wires a direct dependency between two contracts would, at minimum, need to record a reference to the counterparty's address — a small but real form of new persisted state that the compared-values question alone does not capture.

---

## Detailed Option Analyses

### Option A — Audit/Governance Control Only

- **Description**: Continue exactly as today — rely entirely on the existing structural storage separation between `AssetFreeze.sol` and `PahlaviToken.sol`/`Treasury.sol` (no shared storage, no code path connecting them), the fully Contract-Enforced-and-Test-Enforced `FreezeStatus` lifecycle, and ongoing governance/audit review (periodic manual or process-level confirmation that the separation continues to hold) as the sole means of upholding the frozen-assets-not-reserve doctrine. No on-chain mechanism is added; the guarantee remains exactly what Step-56 found it to be today: emergent from architecture, not actively verified.
- **Contracts touched**: None.
- **Storage needed?**: No.
- **New authority/role?**: No.
- **Coupling risk**: **Low** — by definition, since nothing changes, the deliberate separation Step-51 named as an Architectural Boundary remains fully intact.
- **Enforcement strength**: **Low** — the guarantee continues to rest on the absence of a connection rather than on any active verification; Step-56 termed this "emergent," not "enforced."
- **Failure reduction**: **Low** — relative to today's baseline, this option reduces nothing; it simply continues the status quo, which Step-56 already confirmed is *currently holding* (the doctrine is not violated today) but is not *actively guarded* against future change.
- **Attack surface increase**: **Low** — in fact zero; nothing is added anywhere.
- **Compatibility with resilience-before-optimization**: **High** — this is the maximally conservative choice: it adds no new code, no new dependency, and no new failure mode anywhere in the system, preserving the system exactly as it is. A principle that prizes robustness over efficiency cannot object to an option that introduces no new way for anything to go wrong — though it may still ask whether something more could be done to *actively* guard a property that today is merely *true by construction*.

### Option B — Test-Only Invariant

- **Description**: Add a verification at the test-suite or static-analysis level — e.g., an automated check, run as part of the existing test process, that confirms no code path exists by which `AssetFreeze` state could reach `PahlaviToken.totalReserves` or any Treasury/doctrine total. This would not change runtime behavior in any way; it would instead add a *guard against future drift*, catching the moment — if one were ever introduced — that some unrelated future change accidentally created the very connection the current architecture deliberately lacks.
- **Contracts touched**: None — this option touches only the verification layer that sits alongside the contracts, not the contracts themselves.
- **Storage needed?**: No — nothing is persisted on-chain; any state this option needs exists only at test/analysis time.
- **New authority/role?**: No.
- **Coupling risk**: **Low** — a test or static check creates no runtime dependency between `AssetFreeze.sol` and `PahlaviToken.sol`/`Treasury.sol` whatsoever; the contracts remain exactly as separated as they are today.
- **Enforcement strength**: **Low–Medium** — stronger than Option A in one specific respect (it actively checks something, rather than merely relying on review), but it verifies the *separation*, not the *live, deployed system's behavior at any given moment*; it is only as strong as its own coverage of "all the ways a connection could ever be introduced," and it provides no protection against a condition that might somehow arise between verification runs.
- **Failure reduction**: **Low–Medium** — meaningfully reduces the risk of *accidental future regression* (the separation being silently broken by an unrelated change going unnoticed), which is a real, named concern; does nothing to add protection to the system as it runs today, which — per Step-56 — is not currently failing in this respect.
- **Attack surface increase**: **Low** — adds verification logic, not runtime logic; nothing new exists for an adversary to interact with on-chain.
- **Compatibility with resilience-before-optimization**: **High** — this is close to the ideal shape of a resilience-oriented improvement: it adds a safeguard against a real future risk (architectural drift) without adding any new thing that could itself become a source of failure. It strengthens the system's ability to *notice* when something has gone wrong, which is squarely a robustness concern, while introducing no new way for something to *go* wrong.

### Option C — Kernel-Side Guardrail

- **Description**: Route the cross-reference through `IranOS_Kernel` rather than creating a new link directly between the two domain contracts — i.e., have the already-existing, already-most-privileged, already-cross-cutting oversight contract (which already mediates `updateReserves`, trigger activation, and constitutional enforcement across multiple subsystems) be the single point that is aware of both `AssetFreeze.totalFrozenValue` and `PahlaviToken.totalReserves`, and verify their non-overlap as an extension of the oversight role it already performs — rather than asking either domain contract to become aware of the other.
- **Contracts touched**: `kernel.sol` (would need to gain read-awareness of both `AssetFreeze.sol` and `PahlaviToken.sol`'s relevant state).
- **Storage needed?**: No — the compared values already exist; the Kernel would be reading, not storing, them. (As with D/E, channeling any read through a stored counterparty reference would be the only conceivable source of new persisted state, and the Kernel — uniquely among the three coupling-introducing options — already has established, audited relationships with both domains, reducing how much *new* such state this option would actually require relative to D or E.)
- **New authority/role?**: No — the Kernel is an existing authority; this would extend its existing oversight function rather than create a new one. No new role, signer set, or permission would be implied.
- **Coupling risk**: **Medium** — this avoids creating a *brand-new* type of relationship (the Kernel already has cross-cutting relationships with many subsystem contracts, including `PahlaviToken.sol` via `updateReserves`'s `onlyKernel` gating), so it does not introduce the kind of relationship that has never existed before. It does, however, add to the *number* of things the Kernel must correctly read and reason about — and the Kernel is, by design, the single most concentrated point of trust and risk in the entire system, so any addition to its responsibilities — even read-only ones — is not without weight.
- **Enforcement strength**: **Medium–High** — an active, on-chain check, performed by the most trusted and broadly-scoped contract in the system, at points where it is already exercising oversight; this is a substantively stronger guarantee than either of the non-runtime options (A, B).
- **Failure reduction**: **Medium–High** — would close the gap actively rather than structurally, leveraging an entity that — uniquely — already has a legitimate, doctrine-aligned reason to be aware of reserve-relevant figures across multiple domains (it already gates `updateReserves`).
- **Attack surface increase**: **Medium** — the Kernel would become measurably more complex and would gain new read-dependencies; given that the Kernel's six immutable TR constants and multisig trigger machinery make it the system's central point of failure by design (a compromise or bug here has the broadest possible blast radius), *any* addition to it — however narrow or read-only — deserves more weight than the same addition would carry in a less central contract. This is why the increase is rated Medium rather than Low, even though no new authority or storage is implied.
- **Compatibility with resilience-before-optimization**: **Medium** — this option is more conservative than D or E (it reuses an existing trust relationship rather than minting a new one, and channels the new responsibility through a contract whose job is *already* cross-cutting oversight), but it still adds new responsibility — and therefore new risk — to the single most safety-critical contract in the architecture. A resilience-first reading would note that "the safest place to add a new check" and "the place that can least afford to acquire new failure modes" may, in this specific system, be the very same contract — a tension this option does not resolve so much as relocate.

### Option D — Direct PahlaviToken ↔ AssetFreeze Cross-Check

- **Description**: Wire `PahlaviToken.sol` directly to `AssetFreeze.sol` — e.g., having the reserve-validation logic that already exists (`reserveCompliant`) or the reserve-update pathway (`updateReserves`) read `AssetFreeze.totalFrozenValue` (or per-asset freeze status) directly, and verify non-overlap before accepting a figure or authorizing a mint. This is the most direct possible placement: the check would sit immediately adjacent to the exact computation (`totalReserves`/`MIN_RESERVE_RATIO`/`LIQUIDITY_CAP`) that FRC-01 exists to protect.
- **Contracts touched**: `PahlaviToken.sol`.
- **Storage needed?**: No* for the compared values themselves — but establishing *any* direct link of this kind would, at minimum, require `PahlaviToken.sol` to hold a stored reference to `AssetFreeze.sol`'s address (and, implicitly, trust that the address continues to point at a contract behaving as expected). This is a small amount of new persisted state, but it is real, and it is a permanent structural addition to one of the system's most sensitive contracts — the one that governs the national currency's supply.
- **New authority/role?**: No — this is a code-level dependency, not a grant of permission to any actor.
- **Coupling risk**: **High** — this creates, for the first time, a direct relationship between two contracts that today share *zero* storage and *zero* call relationship — precisely the "first crack in the separation" both Step-52 (which named the structural separation as possibly *safer* than an active cross-reference) and Step-56 (which listed this exact concern as the leading risk of enforcing FRC-01 at all) anticipated and warned against. Of all five options, this one most directly contradicts the deliberate Architectural Boundary Step-51 identified.
- **Enforcement strength**: **High** — there is no more direct or immediate point at which to verify this property than at the moment the protected computation itself occurs; this option would close the gap at its most proximate point.
- **Failure reduction**: **High** — for the identical reason: a check performed exactly where and when the doctrine-critical computation happens would leave the smallest possible residual uncertainty about whether the property held at the moment that mattered.
- **Attack surface increase**: **High** — `PahlaviToken.sol` is, alongside the Kernel, among the most sensitive contracts in the entire system; adding any new external dependency to it means its correct operation now depends on the correct, continued, unchanged behavior of a second contract it previously had no relationship with — and any future bug, compromise, misconfiguration, or even well-intentioned modification of `AssetFreeze.sol` now has a direct path to affect minting. This is the most invasive placement, from a blast-radius perspective, of any of the five options.
- **Compatibility with resilience-before-optimization**: **Low** — this is, in a precise sense, the *most optimization-shaped* of the five options (it places the check at the single most "efficient" location — the exact point of computation) and the *least resilience-shaped* (it introduces the most new coupling, the most new dependency, and the most direct departure from a separation that the architecture appears to have deliberately chosen). A principle that asks "make the system harder to break before making it more elegant to reason about" would be most skeptical of precisely this option.

### Option E — Direct Treasury ↔ AssetFreeze Cross-Check

- **Description**: A structurally similar direct link to Option D, but wired through `Treasury.sol` instead — e.g., having Treasury-side budget or transaction-recognition logic verify against `AssetFreeze.totalFrozenValue` before recognizing or distributing value, on the theory that Treasury totals are also doctrine-relevant and also a place where frozen value should never silently appear.
- **Contracts touched**: `Treasury.sol`.
- **Storage needed?**: No* for the compared values — but, as with Option D, establishing the link would require `Treasury.sol` to hold a stored reference to `AssetFreeze.sol`.
- **New authority/role?**: No.
- **Coupling risk**: **High** — for the identical structural reason as Option D: this creates a brand-new direct relationship between two previously-separated domains, carrying the same "first crack" character Step-52/56 already flagged. The fact that the *counterparty* is Treasury rather than PahlaviToken does not change the fundamental nature of what is being introduced — a new, permanent, two-party coupling where none existed.
- **Enforcement strength**: **Medium** — notably lower than Option D's, and for a specific, traceable reason: per Step-49's invariant framing and Step-55's doctrine statement, the figures FRC-01 most centrally protects (`totalReserves`, `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`) are computed and held in `PahlaviToken.sol`, not `Treasury.sol`. A check placed in Treasury would verify a *related but secondary* concern (that frozen value does not appear in Treasury's totals) without directly verifying the *central* one (that it does not appear in the reserve-ratio computation itself). It is a check placed one step away from where the doctrine's core figures actually live.
- **Failure reduction**: **Medium** — for the same reason: this option would close *a* channel, but not the most central one FRC-01 names; the core `totalReserves`-corruption scenario Step-56 identifies as the doctrine's central concern would remain only as protected as it is today (i.e., by structural separation from `PahlaviToken.sol` specifically, which this option does not touch).
- **Attack surface increase**: **High** — `Treasury.sol` (which manages `budgetLines` and `transactions` — itself a doctrine-relevant, sensitive contract per the Treasury Allocation and Disbursement Model) would acquire the same kind of new external dependency, and the same kind of new blast-radius exposure to `AssetFreeze.sol`'s behavior, that Option D would impose on `PahlaviToken.sol`.
- **Compatibility with resilience-before-optimization**: **Low** — and arguably the *worst-positioned* of the five options on this dimension specifically: it carries essentially the same coupling and attack-surface costs as Option D (High/High), while delivering *less* of the actual protection FRC-01 is centrally concerned with (Medium enforcement and failure-reduction, versus D's High). A principle weighing robustness gained against new fragility introduced would find this option offers the least favorable ratio of the two of any option compared here.

---

## Final Section

### Safest Candidate

**Option B — Test-Only Invariant** is the safest candidate that represents an actual improvement over the present baseline.

It is the only option, among the four that add *anything* beyond pure status quo, that does so **without introducing a single unit of new runtime coupling, new on-chain dependency, or new attack surface** — its Coupling Risk and Attack Surface Increase ratings (Low/Low) match Option A's exactly, while its Enforcement Strength and Failure Reduction (Low–Medium/Low–Medium) are strictly better than Option A's (Low/Low). It adds a genuine safeguard — protection against the specific risk of *accidental future architectural drift* eroding the separation that currently makes the doctrine hold — while adding nothing that could itself become a new source of failure. This is close to the textbook shape of a resilience-first improvement: it makes the system better at *noticing* when something has gone wrong, without giving the system any new way to *go* wrong.

If, at some future point, **active runtime enforcement** (rather than drift-detection) were ever judged necessary, **Option C — Kernel-Side Guardrail** would be the safest *of the runtime-enforcement-shaped* options — not because it is risk-free (it is not: Medium coupling risk and Medium attack-surface increase are real costs, concentrated in the system's single most sensitive contract), but because it is the only one of the three coupling-introducing options (C, D, E) that channels the new relationship through an *already-existing*, *already-audited*, *already-doctrine-aligned* trust relationship (the Kernel's existing oversight of `updateReserves` and cross-subsystem enforcement) rather than minting a brand-new one between two domains that have, by design, never been connected.

### Rejected Options, With Reasons

- **Option D (Direct PahlaviToken ↔ AssetFreeze cross-check)** — **rejected**. It carries the highest coupling risk and attack-surface increase of any option compared (High/High), and does so by introducing the exact kind of new, direct, two-party link between previously-separated domains that Step-52 explicitly named as potentially *less* safe than the status quo, and that Step-56 listed as the leading risk of enforcing FRC-01 at all. Its high enforcement strength does not offset this: it achieves that strength precisely by maximizing the very coupling that constitutes its principal cost. It is the option a resilience-before-optimization principle would most actively caution against, however technically elegant its placement might appear.
- **Option E (Direct Treasury ↔ AssetFreeze cross-check)** — **rejected**, and for a compounding reason beyond Option D's: it carries the *same* High/High coupling-risk and attack-surface costs as Option D, while delivering *measurably less* of the protection FRC-01 actually exists to provide (Medium rather than High enforcement strength and failure reduction), because Treasury sits one step away from where the doctrine's central figures (`totalReserves`, `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`) actually live. Of the five options compared, this is the one with the least favorable ratio of protection gained to fragility introduced.

Options A and C are **not rejected**: Option A remains the valid, currently-sufficient baseline (Step-56 already confirmed the doctrine *currently holds*, and this comparison confirms that continuing to rely on it introduces no new risk of any kind); Option C remains a legitimate candidate to be held in reserve, should the system ever move toward active runtime enforcement and require a placement that minimizes — though does not eliminate — new coupling.

### Whether Implementation Should Proceed Now or Remain Pending

**Remain pending.**

This conclusion follows directly from the cumulative weight of Steps 54–57's findings about this specific gap, not from any new judgment introduced here:

- Step-56 already established that the doctrine FRC-01 protects is **currently holding** — this is not a live, ongoing failure that demands urgent correction, but a structurally-sound guarantee whose *active verification* is what remains absent.
- Step-55 already named the central open question as a **governance and cost-benefit question** — "is the coupling worth it?" — not a technical or scoping one; this comparison confirms that framing rather than resolving it: every option that would meaningfully strengthen enforcement (C, D, E) does so by spending some amount of the very separation-based safety the system currently enjoys for free, and this document's role is to make that trade legible, not to make it.
- Step-54 already concluded that GAP-FRC-01, like all six P0 gaps, **requires a doctrine decision before implementation** — and nothing in this comparison removes that requirement; if anything, naming five concretely different ways to spend that trade-off (ranging from "spend nothing, gain a drift-detector" in B to "spend the most, gain the most" in D) makes the *shape* of the decision sharper without making the decision itself less necessary, less weighty, or any more this document's to make.
- Even the safest forward-moving candidates identified here (B, and conditionally C) represent **a choice to act**, not merely to continue observing — and Step-55/56 both found that nothing about the current state compels such a choice on any urgency basis. The system is not at risk today; what would change with any of these options is the *form* of the assurance that it will remain so, not whether it currently is.

Accordingly, this document recommends that **no implementation decision be made on the strength of this comparison alone** — its purpose is to ensure that, whenever the appropriate governance or architectural review process does take up this question, it does so already equipped with a clear, weighed picture of what each available path would cost and what it would buy — not to supply, anticipate, or substitute for that process's judgment.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Comparison Element | Existing Source of Truth |
|---|---|
| Missing-check description, requirement profile (no storage/role/authority/trigger code; coupling only), Low-complexity baseline | [FRC01_RUNTIME_EVALUATION.md](FRC01_RUNTIME_EVALUATION.md) (Step-56) |
| Doctrine principle, "candidate for future runtime enforcement" framing, named coupling-vs-separation tension | [STEP55_DOCTRINE_DECISION_BRIEF.md](STEP55_DOCTRINE_DECISION_BRIEF.md) (Step-55) |
| Confirmation that GAP-FRC-01 alone requires neither new storage nor new state representation | [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) |
| Architectural Boundary status of the AssetFreeze/PahlaviToken/Treasury storage separation | [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) |
| Underlying contracts | `contracts/kernel.sol`, `contracts/reclaim/AssetFreeze.sol`, `contracts/monetary/PahlaviToken.sol`, `contracts/monetary/Treasury.sol` — referenced transitively, not re-derived here |

Where this comparison and any prior document, contract, or test appear to differ, those documents — and beneath them, the contracts and tests — remain authoritative. This document adds a *comparative-options lens* (given that runtime enforcement is a candidate, which placements would it take, and how would they compare?) over findings already fully established elsewhere; it revises, re-derives, supersedes, and proposes nothing — including no implementation, sketch, or design of any option's internal logic.

---

## Summary

This document compares five named design-shape options for FRC-01's identified missing check — Audit/governance only (A), Test-only invariant (B), Kernel-side guardrail (C), Direct PahlaviToken↔AssetFreeze cross-check (D), and Direct Treasury↔AssetFreeze cross-check (E) — across nine fixed dimensions, without proposing any implementation. None of the five options requires new storage for the compared values themselves, a new authority, a new role, or a new trigger code; the two direct cross-check options (D, E) would additionally require storing a counterparty contract reference. Coupling risk and attack-surface increase are Low for A and B, Medium for C, and High for D and E; enforcement strength and failure reduction range from Low (A) through Low–Medium (B), Medium–High (C), High (D), down to Medium (E, which sits one step away from the doctrine's central figures). The **safest candidate** is **B — Test-Only Invariant**, the only forward-moving option that adds genuine protective value (against architectural drift) while adding zero new runtime coupling or attack surface; **C — Kernel-Side Guardrail** is identified as the safest *runtime-enforcement-shaped* option, should active enforcement ever be pursued, because it channels any new relationship through an existing, already-trusted oversight nexus rather than minting a new one. **D and E are rejected** — D for carrying the highest coupling/attack-surface costs of any option while achieving its strength precisely by maximizing that cost, and E for carrying those same High/High costs while delivering measurably less of the actual protection FRC-01 exists to provide. **A is not rejected** — it remains the valid, currently-sufficient baseline, since Step-56 already confirmed the doctrine currently holds. The final recommendation is that **implementation should remain pending**: nothing about the present state is urgent or failing, the central open question (is the coupling worth it?) is a governance/cost-benefit judgment this document equips but does not make, and Step-54's finding that this gap — like all six P0 gaps — requires a prior doctrine decision remains fully intact and unaddressed by comparing options alone. Every doctrine constant named in the task — `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900B`, oracle non-sovereignty, frozen-assets-not-reserve — is preserved verbatim and unchanged; no contract, test, doctrine, authority, or trigger code is modified or proposed anywhere in this document.
