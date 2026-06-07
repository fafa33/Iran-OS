# Doctrine Decision Brief — P0 Gaps (Step-55)

## Scope and Non-Goals

This is a **documentation-only doctrine decision brief**. For each of the six P0 gaps already identified (Step-51), prioritized (Step-52), dispositioned (Step-53), and routed (Step-54), it answers exactly five fixed questions: which doctrine principle the gap protects, what *kind* of resolution it would require, whether runtime enforcement would reduce failure risk, whether it would increase complexity or attack surface, and a final recommendation drawn from a closed set of four options.

It does **not** modify any contract, modify any test, or propose any implementation. It introduces **no new doctrine, no new authorities, and no new trigger codes**, and preserves — unchanged and verbatim — every doctrine constant and principle named in the task: `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (`900B`), oracle non-sovereignty, frozen-assets-not-reserve, reclaimed-assets-not-automatic-backing, and welfare/wages-not-reserve.

This brief is a **direct extension** of, and fully subordinate to:

- [P0_GAP_DISPOSITION_REPORT.md](P0_GAP_DISPOSITION_REPORT.md) (Step-53) — source of each gap's Architectural/Runtime/Mixed nature and risk ratings.
- [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) — source of the storage/state-representation/doctrine-decision routing answers this brief builds its "kind of resolution" answers on.
- [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) — source of root causes and Doctrine Impact statements.
- [GAP_PRIORITIZATION_MATRIX.md](GAP_PRIORITIZATION_MATRIX.md) (Step-52) — source of the P0 designation and "Future Design Questions" framing.

No fact below is independently re-derived from contracts or tests; every claim is carried forward, in summary form, from these four documents. Where this brief and any of those documents (or the contracts/tests beneath them) appear to differ, those documents — and the contracts/tests beneath them — remain authoritative.

---

## Doctrine Constants and Principles (Preserved Verbatim, Not Redefined)

| Doctrine Element | Value / Statement | Status Here |
|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` (900B) | Preserved — referenced only |
| Oracle non-sovereignty | Oracle signals are never self-executing; they inform review and feed Kernel-mediated or fixed-formula computations only | Preserved — referenced only |
| Frozen-assets-not-reserve | Frozen/seized assets are categorically excluded from every domain's recognized balance and doctrine computation | Preserved — referenced only |
| Reclaimed-assets-not-automatic-backing | Reclaimed assets are a pure accounting credit to L1; receipt triggers no mint and no automatic classification | Preserved — referenced only |
| Welfare/wages-not-reserve | `CitizenCard.sol` manages eligibility/status only; the wage itself is an off-chain employer obligation and never a reserve asset | Preserved — referenced only |

---

## How to Read This Brief

For each P0 gap, this brief answers:

1. **What doctrine principle is being protected?** — the constitutional/architectural property (named in Steps 41–54) that the gap's continued existence places at risk if neglected, stated without proposing how to protect it better.
2. **Does resolving it require** — one or more of: *documentation only* / *governance & process* / *runtime enforcement* / *new state representation*. This is answered by carrying forward, not re-deriving, the Step-54 routing facts (Gap Type; storage/state-representation answers; "requires doctrine decision" answer) — translated into the resolution-kind vocabulary this question uses.
3. **Would runtime enforcement reduce failure risk?** — Yes/No, with the specific failure mode it would close named.
4. **Would runtime enforcement increase complexity or attack surface?** — Yes/No, with the specific new surface or coupling named, carried forward from Step-52/53/54's own observations about each gap's resolution character.
5. **Recommendation** — exactly one of: *Accept as documentation* / *Keep as governance boundary* / *Candidate for future runtime enforcement* / *Requires major architectural decision*.

---

## At-a-Glance Table

| Gap ID | Doctrine Principle Protected | Resolution Requires | Runtime Enf. Reduces Risk? | Runtime Enf. Adds Complexity/Surface? | Recommendation |
|---|---|---|---|---|---|
| GAP-RES-01 | Reserve recognition is a deliberate, traceable act, not an inference | New state representation; Governance & process | Yes | Yes | Requires major architectural decision |
| GAP-CLS-01 | Each balance occupies exactly one classification state at a time | New state representation; Governance & process | Yes | Yes | Requires major architectural decision |
| GAP-TAI-03 | Custody and classification are independent, reconcilable properties — custody location is not proof of classification | New state representation; Governance & process | Yes | Yes | Requires major architectural decision |
| GAP-MEX-04 | Monetary expansion must be backed by genuinely external value, never self-referential value | New state representation; Runtime enforcement; Governance & process | Yes | Yes | Requires major architectural decision |
| GAP-MEX-05 | No oracle, reclaim, frozen-asset, or welfare/wage figure may silently influence the reserve figure that authorizes a mint | New state representation; Runtime enforcement; Governance & process | Yes | Yes | Requires major architectural decision |
| GAP-FRC-01 | Frozen/seized assets are categorically excluded from every reserve and doctrine computation | Runtime enforcement; Governance & process | Yes | Yes (modest) | Candidate for future runtime enforcement |

---

## Detailed Briefs

### GAP-RES-01 — Sovereign Reserve classification as a discrete on-chain act

1. **Doctrine principle protected**: That recognizing a balance as Sovereign Reserve is a *deliberate, traceable act* — governed by the eight Eligibility Tests (Step-44) — and never a passive inference from custody location or convenience. This is the foundation beneath `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP`: those figures are only meaningful if "what counts as reserve" is itself a disciplined, examinable determination.
2. **Does resolving it require**: **New state representation** (an on-chain construct for "classification" does not exist and would have to be designed) and **governance & process** (per Step-54, the prior question — *should* such a construct exist, and what would it look like — is an open, named "Future Design Question" that must be answered before any engineering work could be scoped).
3. **Would runtime enforcement reduce failure risk?**: **Yes** — it would convert a guarantee that today rests entirely on review discipline (Step-50: "enforced entirely through governance discipline and architecture-document review") into one that is checkable at the moment a balance is recognized, closing the failure mode in which a balance is silently and incorrectly counted toward doctrine totals.
4. **Would runtime enforcement increase complexity or attack surface?**: **Yes** — building the underlying construct first (a precondition for any runtime check here) would itself be, per Step-53, "a contract change... outside documentation-only scope": new storage, a new enum or status field, and new transition logic — each an additional surface that would need its own audit and could itself become a target (e.g., a path to forge or corrupt a classification value) if not designed with the same care as the property it protects.
5. **Recommendation**: **Requires major architectural decision** — the open question is not "how do we check this?" but "should this construct exist at all, and what would it be?" — exactly the kind of foundational, doctrine-level question this category exists to flag.

---

### GAP-CLS-01 — Exactly-one-classification-state consistency

1. **Doctrine principle protected**: That the eight Reserve Classification States (Step-44) are mutually exclusive and exhaustive — that a given balance is *always* in exactly one of them, never zero and never more than one — preventing the double-counting or contradictory recognition that would directly corrupt `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` arithmetic.
2. **Does resolving it require**: **New state representation** (the eight states have no on-chain values to be consistent *about* — Step-53 notes a consistency check "presupposes a representable state to be consistent about") and **governance & process** (Step-51 names this gap's root cause as inseparable from GAP-RES-01's; the same upstream design question governs both).
3. **Would runtime enforcement reduce failure risk?**: **Yes** — it would close the specific failure mode in which a balance is silently labeled into two states at once (e.g., simultaneously "Frozen" and "Sovereign Reserve"), a condition Step-53 identifies as one that "would directly corrupt `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` computations" while remaining "invisible to every existing check."
4. **Would runtime enforcement increase complexity or attack surface?**: **Yes** — for the identical reason as GAP-RES-01 (these two gaps share one root construct): the state representation would have to be designed, deployed, and exercised by a transition function before any consistency property could be checked over it, and that transition function becomes new attack surface in its own right (the `FreezeStatus` state machine in `AssetFreeze.sol` is the closest existing precedent for the kind of surface this would introduce).
5. **Recommendation**: **Requires major architectural decision** — and, per Step-54, one that cannot be meaningfully separated from GAP-RES-01's; the two would necessarily be decided together, not independently.

---

### GAP-TAI-03 — Independence of custody and classification as tracked properties

1. **Doctrine principle protected**: That custody (*where* value is held) and classification (*whether* it counts as Sovereign Reserve) are two independent, separately-trackable, mutually-reconcilable properties of the same value — and, specifically, that custody location is never treated as proof of classification (Step-44's Prohibited Reclassification Path). This is the formal accounting-layer expression of the same separation GAP-RES-01/GAP-CLS-01 protect at the classification layer.
2. **Does resolving it require**: **New state representation** (classification has no independent on-chain property to be independent *from* custody) and **governance & process** — and, per Step-54, a *compound* governance question: even a fully-resolved GAP-RES-01/GAP-CLS-01 construct would not by itself guarantee independence; a second, narrower decision (independence-by-design vs. derivation-from-custody) would still remain open.
3. **Would runtime enforcement reduce failure risk?**: **Yes** — it would close the specific failure mode Step-53 names directly: "a deposit or a reclaim credit could be silently treated as proof of reserve classification... corrupting doctrine totals without any code-level violation occurring."
4. **Would runtime enforcement increase complexity or attack surface?**: **Yes** — and more so than GAP-RES-01/GAP-CLS-01 individually: this gap requires designing *two* interacting tracked properties that must remain independent yet reconcilable — a strictly larger design-and-audit surface than either property alone, and one with more interaction points (and therefore more potential failure or exploitation points) than a single new construct would introduce.
5. **Recommendation**: **Requires major architectural decision** — the most doctrine-dependent of the three Architectural gaps: per Step-54, it cannot even be fully scoped until the GAP-RES-01/GAP-CLS-01 question is answered, after which a second, narrower architectural question (independence-by-design) would still remain.

---

### GAP-MEX-04 — Non-self-referential composition of `totalReserves`

1. **Doctrine principle protected**: That monetary expansion (minting authorized against `totalReserves`) is backed by genuinely external value — never by value that is itself a product of, or self-referential to, the very expansion it would justify. This is the substantive guarantee that gives `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` real economic meaning, rather than letting them be satisfied by a circular bookkeeping relationship.
2. **Does resolving it require**: **New state representation** (provenance/composition tracking data does not exist anywhere on-chain today — Step-54 confirms no existing storage carries this information implicitly), **runtime enforcement** (the eventual guarantee is, in nature, a check over a figure — Step-53's "Runtime Gap" framing of its absence), and **governance & process** (per Step-52's "Future Design Questions," whether `totalReserves` should ever carry provenance tracking is an open, named, and explicitly "materially larger" design question than the current instantaneous-ratio check).
3. **Would runtime enforcement reduce failure risk?**: **Yes** — substantially; this is precisely the class of property runtime checks are best suited to protect once the underlying provenance data exists, closing what Step-53 calls "arguably the single most severe monetary-doctrine failure conceivable" — one that, today, "would pass every existing arithmetic check undetected."
4. **Would runtime enforcement increase complexity or attack surface?**: **Yes** — Step-52 is explicit that provenance/composition tracking would be "a materially larger undertaking than the current instantaneous-ratio check," meaning new storage, new tracked relationships across multiple domains, and new code paths — each requiring its own audit, and each a potential new target if the tracking mechanism itself could be manipulated or bypassed.
5. **Recommendation**: **Requires major architectural decision** — per Step-54's "Mixed" routing: the *scope* of any eventual fix is bimodal and currently undetermined (it could resemble a modest cross-reference or a substantial new subsystem depending on how the provenance question is answered), and that scoping question is itself the open architectural decision that must come first.

---

### GAP-MEX-05 — Compositional guarantee that no oracle/reclaim/frozen/welfare figure influenced a mint

1. **Doctrine principle protected**: That none of the four explicitly-named non-reserve data domains — oracle estimates (oracle non-sovereignty), reclaim confirmations (reclaimed-assets-not-automatic-backing), frozen-asset valuations (frozen-assets-not-reserve), or welfare/wage figures (welfare/wages-not-reserve) — may ever silently influence the `totalReserves` figure that authorizes a mint. This is the input-source mirror of GAP-MEX-04's guarantee, and it directly protects all four of the preserved doctrine principles named in this brief's constants table simultaneously.
2. **Does resolving it require**: **New state representation** (an "influence lineage" across four domains would be a new kind of on-chain state — Step-54 confirms nothing existing carries this implicitly), **runtime enforcement** (the missing element is, in shape, a check over an existing figure and existing role-gates — Step-53's "Runtime Gap" framing), and **governance & process** (Step-51/52 both state this gap and GAP-MEX-04 are "two views of one underlying limitation" governed by a single, shared, open design question).
3. **Would runtime enforcement reduce failure risk?**: **Yes** — it would close the failure mode Step-53 names directly: "an improperly-influenced `totalReserves` figure... would corrupt every downstream doctrine computation while passing every existing role-gate and arithmetic check" — today, with "no on-chain trace to verify that discipline held."
4. **Would runtime enforcement increase complexity or attack surface?**: **Yes** — for the identical structural reason as GAP-MEX-04 (the two share one underlying limitation, per Step-51/52): tracking influence-lineage across four separate domains (`API3Oracle.sol`, `AssetFreeze.sol`, `SovereignWealthFund.receiveReclaimedAsset`, `CitizenCard.sol`) would multiply the new-surface concerns of GAP-MEX-04 by the number of domains being traced, each a distinct integration point and each a candidate for its own failure mode.
5. **Recommendation**: **Requires major architectural decision** — for consistency with GAP-MEX-04 (the shared design question makes independent recommendations for the two gaps incoherent) and for the identical underlying reason: scope is undetermined pending a single shared decision.

---

### GAP-FRC-01 — Cross-domain exclusion of frozen-asset value from doctrine computation

1. **Doctrine principle protected**: That frozen and seized assets are *categorically* excluded from every reserve and doctrine computation — the frozen-assets-not-reserve principle named verbatim in this brief's constants table — protecting `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` from being inflated by value that is, by constitutional definition, unavailable to back the currency.
2. **Does resolving it require**: **Runtime enforcement** (per Step-54, this is the one P0 gap where both halves of the missing relationship — `AssetFreeze.totalFrozenValue` and `PahlaviToken.totalReserves` — already exist; the only missing element is a check between them) and **governance & process** (per Step-52's named "Future Design Question," whether to introduce that cross-reference at all remains open). Notably, and uniquely among the six P0 gaps, this one does **not** require new state representation — Step-54 confirms both the "without new storage?" and "without new state representation?" questions answer **Yes** for this gap alone.
3. **Would runtime enforcement reduce failure risk?**: **Yes** — it would close the one cross-domain gap that today rests on a structural property (frozen value simply never enters the mappings `totalReserves` draws from) rather than on an active, verifiable check, converting "this has never happened to connect" into "this is checked never to connect."
4. **Would runtime enforcement increase complexity or attack surface?**: **Yes, but modestly** — smaller in degree than any of the other five gaps (no new storage or representation would be needed), but not zero: it would introduce a *new coupling* between `AssetFreeze.sol` and `PahlaviToken.sol` that does not exist today. Step-52 raised this directly, observing that "the current structural separation may, in fact, be safer than an active cross-reference would be" — meaning the new dependency this would create is itself a real (if small) consideration, not a costless addition.
5. **Recommendation**: **Candidate for future runtime enforcement** — distinguished from the other five (all "Requires major architectural decision") precisely because, per Step-52, this is the P0 gap "most clearly addressable... without first requiring the GAP-RES-01/GAP-CLS-01 root-cause construct to be resolved": the technical lift would be small and well-bounded, and the open question is one of *whether to proceed* (a governance/process decision about an already-well-understood, already-scoped change) rather than *what to build* (an open-ended architectural question, as in the other five).

---

## Cross-Cutting Doctrine Observations

**Five of the six gaps protect variations of one foundational principle: that recognized reserve value must be real, traceable, and uncontaminated.** GAP-RES-01 and GAP-CLS-01 protect the *act and consistency* of recognizing it; GAP-TAI-03 protects the *independence* of that recognition from mere custody; GAP-MEX-04 and GAP-MEX-05 protect its *substantive integrity* against self-reference and contamination at the moment it authorizes new currency. GAP-FRC-01 stands somewhat apart — it protects a single, narrower, already-well-defined exclusion principle (frozen-assets-not-reserve) rather than the broader recognition-and-composition cluster the other five orbit. This is the same convergence-with-one-exception pattern Step-54 already identified from a routing perspective; this brief shows it holds at the doctrine-principle level too, for the same underlying reason — GAP-FRC-01 is the only one of the six whose protected principle is already fully and exhaustively defined (Step-44/49), with nothing about *what* it protects left open, only *whether to actively check* it.

**The "resolution requires" answers split cleanly along the same line Step-54 drew on storage and state representation.** GAP-RES-01, GAP-CLS-01, and GAP-TAI-03 require new state representation outright; GAP-MEX-04 and GAP-MEX-05 require it as part of a "Mixed" resolution whose scope is still undetermined; GAP-FRC-01 alone requires *only* runtime enforcement and governance/process — no new representation at all. This is not a new finding so much as the same structural fact, restated through the doctrine lens: the five gaps that require new representation are exactly the five whose protected principle concerns something that does not yet exist as a checkable fact on-chain (a classification, a lineage, a composition history); the one gap that does not is the one whose protected principle concerns a relationship between two facts that already do.

**Every gap answers "Yes" to both runtime-enforcement questions — and that pairing is itself the central tension this brief surfaces.** In every one of the six cases, runtime enforcement would measurably reduce a real, named failure risk (Step-53's risk ratings: five High, one Medium) — and in every one of the six cases, it would also measurably add complexity or attack surface (ranging from "modest, single new coupling" for GAP-FRC-01 to "multi-domain lineage tracking, multiplying integration points" for GAP-MEX-05). No gap in this set offers a "free" improvement; each one presents a genuine trade-off between closing a real gap and enlarging the system that would need to remain correct and auditable. That is precisely *why* five of the six recommendations land on "Requires major architectural decision" rather than on a more confident "build it" — the trade-off is real enough, and the shape of what would need to be built uncertain enough, that the decision to proceed cannot be separated from a decision about *what, exactly,* would be proceeded with.

**GAP-FRC-01 is the one gap where that trade-off is small enough to be evaluated on its own terms today.** It is the only P0 gap whose "added complexity/attack surface" answer carries a qualifier ("Yes, but modestly") rather than standing as an open or substantial unknown, and the only one whose protected principle, current guardrails, and potential check are all *already fully specified* by existing, deployed constructs (`totalFrozenValue`, `totalReserves`, `FreezeStatus`). That is precisely why it alone earns "Candidate for future runtime enforcement" rather than "Requires major architectural decision": the architecture-level questions about *what* to build have, in this one case, already been answered by prior steps — what remains is the comparatively narrower governance question of whether the resulting small, well-understood change is worth its small, well-understood cost. No recommendation in this brief states that it *is* worth it, or proposes how it would be built; it states only that the nature of the open question here is different in kind from the other five, and names that difference precisely.

**No gap in this set is recommended as "Accept as documentation" or "Keep as governance boundary."** This is consistent with — and a natural consequence of — every one of the six having been independently confirmed across Steps 51–54 to (a) carry High-or-Medium financial and governance risk, (b) bear directly on `totalReserves`/`MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` integrity (the P0 banding criterion itself), and (c) name an open, unresolved "Future Design Question." Gaps for which the doctrine-protection question is already fully settled by existing review discipline — i.e., gaps where documentation-level enforcement is not merely *current* but *sufficient* — would be the ones expected to land in either of those two categories. The P0 set, by construction and by the independent confirmation in this brief, contains none of those; that is a substantial part of *why* these six are P0 in the first place, and this brief's analysis corroborates that classification rather than merely restating it.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Brief Element | Existing Source of Truth |
|---|---|
| Gap nature (Architectural / Runtime / Mixed), risk ratings | [P0_GAP_DISPOSITION_REPORT.md](P0_GAP_DISPOSITION_REPORT.md) (Step-53) |
| Resolution-kind facts (storage / state representation / doctrine-decision routing) | [P0_RESOLUTION_DECISION_PLAN.md](P0_RESOLUTION_DECISION_PLAN.md) (Step-54) |
| Gap IDs, root causes, Doctrine Impact statements | [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) |
| P0 designation, "Future Design Questions" | [GAP_PRIORITIZATION_MATRIX.md](GAP_PRIORITIZATION_MATRIX.md) (Step-52) |
| Doctrine principles and constants this brief preserves | `constitution/constitution-fa.md`, `whitepaper/whitepaper-fa.md`, prior architecture documents — referenced transitively, not redefined here |

Where this brief and any prior document, contract, or test appear to differ, those documents — and beneath them, the contracts and tests — remain authoritative. This brief adds a *doctrine lens* (which constitutional principle is at stake, and what kind of resolution would protecting it more strongly actually require?) over findings already fully established elsewhere; it revises, re-derives, supersedes, and proposes nothing.

---

## Summary

This brief answers five fixed doctrine-decision questions for each of the six P0 Critical gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, GAP-FRC-01), naming the specific constitutional/architectural principle each one protects, the kind(s) of resolution it would require (new state representation / governance & process / runtime enforcement, in varying combinations carried forward from Step-54's routing facts), and whether runtime enforcement would help and at what cost. All six gaps would see reduced failure risk from runtime enforcement; all six would also see increased complexity or attack surface — five substantially (new representation, new tracked relationships, multi-domain integration), one modestly (a single new, small, well-understood cross-contract coupling). Five gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05) are recommended **Requires major architectural decision**, because what they protect cannot be more strongly enforced without first deciding what new on-chain construct should exist and what shape it should take — open questions this and prior steps have consistently found unanswered. One gap (GAP-FRC-01) is recommended **Candidate for future runtime enforcement**, distinguished by being the only P0 gap whose protected principle, current guardrails, and potential check are all already fully specified by existing, deployed constructs — leaving only a governance-level question of whether a small, well-bounded change is worth a small, well-understood new coupling. No gap is recommended for "Accept as documentation" or "Keep as governance boundary," consistent with all six independently carrying High-or-Medium risk and an open Future Design Question. Every doctrine constant and principle named in the task — `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900B`, oracle non-sovereignty, frozen-assets-not-reserve, reclaimed-assets-not-automatic-backing, welfare/wages-not-reserve — is preserved verbatim and unchanged; no new doctrine, authority, or trigger code is introduced; no contract or test is modified; and no implementation is proposed anywhere in this document.
