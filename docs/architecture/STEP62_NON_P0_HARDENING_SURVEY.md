# Step-62 Non-P0 Hardening Candidate Survey

## Purpose and Non-Goals

This is a **documentation-only survey**. Its sole purpose is to name — by area, not by prescription — which existing test/runtime areas of IranOS sit *outside* the six P0 Critical gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, GAP-FRC-01) and could, in principle, be candidates for *future* hardening discussion under **Path D** ("return to runtime hardening/tests unrelated to P0 redesign"), as named in [P0_ANALYSIS_CLOSURE_CHECKPOINT.md](P0_ANALYSIS_CLOSURE_CHECKPOINT.md) (Step-60) and [STEP61_PROJECT_ARCHITECTURE_CHECKPOINT.md](STEP61_PROJECT_ARCHITECTURE_CHECKPOINT.md) (Step-61).

It does **not**:
- propose, sketch, outline, or imply any specific future test, test case, or test file change;
- propose, sketch, outline, or imply any contract, storage, role, threshold, or trigger-code change;
- propose any new authority, governance path, incentive mechanism, or doctrine element;
- re-derive, revise, or supersede any finding from Steps 41–61;
- authorize any implementation of any kind, for any area named below — including GAP-FRC-01.

This document **only names candidate areas**. Whether, when, how, or by whom any of them might ever be examined further is a question this document explicitly leaves open and unanswered — exactly as Step-58 left the *shape* of a possible FRC-01 invariant open while precisely bounding its scope, and exactly as Step-60/61 left Paths A–D open without selecting among them.

---

## Subordinate-To List

This survey is a **direct extension** of, and fully subordinate to:

- [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) — source of the Contract-Enforced / Test-Enforced / Documentation-Only / Mixed classification for all 37 invariants across the seven invariant families (RES-*, TAI-*, CLS-*, SWF-*, MEX-*, ALD-*, FRC-*), and of the existing test-file-to-invariant mapping this survey reads from without re-deriving.
- [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51) and [GAP_PRIORITIZATION_MATRIX.md](GAP_PRIORITIZATION_MATRIX.md) (Step-52) — source of the full gap inventory and the P0 designation that defines, by exclusion, the "non-P0" scope this survey covers.
- [P0_GAP_FINAL_RECOMMENDATION.md](P0_GAP_FINAL_RECOMMENDATION.md) (Step-59) — source of the six final P0 gap dispositions this survey treats as fixed and does not revisit.
- [P0_ANALYSIS_CLOSURE_CHECKPOINT.md](P0_ANALYSIS_CLOSURE_CHECKPOINT.md) (Step-60) — source of the closure finding that no implementation is authorized for any P0 gap, and of **Path D** as a named, open route distinct from Paths A–C.
- [STEP61_PROJECT_ARCHITECTURE_CHECKPOINT.md](STEP61_PROJECT_ARCHITECTURE_CHECKPOINT.md) (Step-61) — source of the Steps 41–60 completion summary and the most recent restatement of the four open paths (A: freeze, B: FRC-01 test-only planning, C: future architecture redesign, D: unrelated runtime hardening) this survey operationalizes the first step of, for Path D only.
- `test/README.md` — source of the existing test-suite's stated architecture and aims, which this survey reads against without modification.

No fact below is independently re-derived from contracts; every area named is identified solely by cross-referencing the existing, unmodified `test/` directory listing against the Step-50 Runtime Enforcement Mapping's invariant families, restricted to families and areas the P0 series (Steps 51–59) did **not** designate as P0.

Where this survey and any of the documents above (or the contracts/tests beneath them) appear to differ, those documents — and the contracts and tests beneath them — remain authoritative.

---

## 1. Scope Boundary: What "Non-P0" Means Here

The six P0 Critical gaps, per Step-59's Final Recommendation Table, are GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, and GAP-FRC-01. Per Step-60/61:

- The five Architectural/Mixed gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05) **remain gated behind a future major-architecture-redesign discussion** (Path C) that has not begun and that this survey does not open.
- **GAP-FRC-01 remains not authored as test code.** Its Test-Only invariant scope was precisely defined in Step-58 — stating *what such an invariant would mean if it existed* — but no test file, test case, or line of test code has been written, sketched, or proposed for it anywhere in Steps 56–61, and this survey adds none.

Accordingly, "non-P0" in this survey means: any test/runtime area belonging to an invariant family, contract, or test file that the P0 series did **not** name as one of the six P0 gaps above — regardless of whether that area's invariants are currently Contract-Enforced, Test-Enforced, Mixed, or Documentation-Only in the Step-50 mapping. A non-P0 area may still contain Documentation-Only or Mixed invariants; its defining feature here is only that it sits outside the six-gap P0 set, not that it is free of any gap whatsoever.

---

## 2. Candidate Areas Surveyed (Named Only)

The following areas are named **by domain only**, drawn from the existing `test/` directory (per `test/README.md` and the directory listing) cross-referenced against the non-P0 invariant families in the Step-50 Runtime Enforcement Mapping (notably TAI-05, CLS-04, SWF-01/02/03, MEX-01/02, ALD-03/04, FRC-02/03/05, and the broader RES-*/TAI-* families outside GAP-RES-01/CLS-01/TAI-03's specific missing constructs). No area below is recommended, scoped, or prioritized relative to any other; the list is presented in roughly the order the corresponding test files appear in the suite, for traceability only:

- **Kernel governance and role-lifecycle behavior** — area covered in spirit by `01_kernel.test.js`; concerns the Layer-0 kernel's role assignments, signature accounting, and TR-01–TR-06 flagging surface as distinct from the trigger-activation mechanism itself.
- **Pahlavi Token supply/reserve bookkeeping (non-MEX-04/05 aspects)** — area covered in spirit by `02_pahlavi_token.test.js`; concerns `mint`/`reserveCompliant` mechanics already named MEX-01/MEX-02/MEX-03 in Step-50 (Contract-Enforced and Test-Enforced), distinct from the provenance/composition questions GAP-MEX-04/05 name.
- **Sovereign Wealth Fund layer-transition and yield bookkeeping (non-GAP-RES/CLS aspects)** — area covered in spirit by `03_sovereign_wealth_fund.test.js`; concerns SWF-01/SWF-02/SWF-03 mechanics (deposits, 15% annual yield formula, 3-of-N withdrawal threshold), distinct from the classification-construct questions GAP-RES-01/CLS-01 name.
- **Constitution Guard law-proposal lifecycle** — area covered in spirit by `04_constitution_guard.test.js`; concerns `proposeLaw`/`approveLaw`/`rejectLaw` gating and the `approvedLaws` mapping.
- **Citizen Card identity and welfare-status lifecycle** — area covered in spirit by `05_citizen_card.test.js`; concerns biometric deduplication, employment-status enum transitions, and eligibility tracking — explicitly bounded by the welfare/wages-not-reserve doctrine this survey preserves unchanged.
- **Asset Freeze lifecycle mechanics (FRC-02/FRC-03/FRC-05, distinct from FRC-01)** — area covered in spirit by `06_asset_freeze.test.js`; concerns the `Active → UnderReview → Confirmed → (TransferredToSWF | Released)` state machine, `COUNCIL_THRESHOLD = 3` confirmation gating, and role-exclusivity (FRC-05) — all named Contract-Enforced-and-Test-Enforced in Step-50, and distinct from the cross-contract `totalFrozenValue`↔`totalReserves` relationship that defines GAP-FRC-01 alone.
- **Jury Selection VRF/ZK-commitment mechanics** — area covered in spirit by `07_jury_selection.test.js`; concerns jury-size, conviction/acquittal threshold, and second-round logic, bounded by the existing doctrine note that ZK proofs are checked only for non-zero length.
- **Trigger Protocol execution-layer mechanics (distinct from Kernel-level multisig activation)** — area covered in spirit by `08_Trigger_Protocol.test.js`; concerns `executeTrigger`'s treasury-block/signing-revocation/notification sequence as the layer the Kernel calls *after* the 7-of-9 threshold is met — the threshold itself is explicitly out of scope per the constitutional-constants list this survey preserves.
- **Treasury and API3 Oracle data-feed mechanics (non-MEX-05 aspects)** — area covered in spirit by `09_Treasury.test.js` and `09_api3_oracle.test.js`; concerns oracle data-type gating (`PRICE`/`PRODUCTION`/`GOVERNANCE`/`JUDICIAL`/`MILITARY`/`WELFARE`) and Treasury bookkeeping, distinct from the provenance-influence question GAP-MEX-05 names.
- **Velocity Fee, Base Income, Health Coverage, Disability Support mechanics** — area covered in spirit by `11_Velocity_Fee.test.js`, `12_Base_Income.test.js`, `13_Health_Coverage.test.js`, `14_Disability_Support.test.js`; concerns fixed-formula welfare/fee computations, explicitly bounded by the no-welfare-token-incentive-or-gamification constraint this survey preserves.
- **Parliament and Voting System mechanics** — area covered in spirit by `15_Parliament.test.js` and `18_Voting_System.test.js`; concerns legislative-body composition and vote-tallying logic, distinct from the constitutional-monarchy red lines (TR-01–TR-06) this survey does not reinterpret.
- **Provincial governance and Budget Allocation mechanics (ALD-04, distinct from ALD-03/SWF withdrawal)** — area covered in spirit by `16_Provincial.test.js` and `17_Budget_Allocation.test.js`; concerns the immutable 30/70 (`PROVINCIAL_SHARE = 300`/`NATIONAL_SHARE = 700`) revenue-distribution formula and provincial budget-line bookkeeping.
- **Justice Protocol, Penal Labor, and Victim Fund mechanics** — area covered in spirit by `19_Justice_Protocol.test.js`, `20-Penal_Labor.test.js`, `21_Victim_Fund.test.js`; concerns post-verdict accounting and reparations bookkeeping, explicitly bounded by the no-automated-final-freeze-judgment constraint this survey preserves (these contracts act on jury verdicts already reached, not on automated freeze/judgment determinations).
- **Sovereign Crawler discovery-flagging mechanics (distinct from AssetFreeze confirmation)** — area covered in spirit by `22_Sovereign_Crawler.test.js`; concerns the `CRAWLER_ROLE`-gated initiation surface named in FRC-05, distinct from the council-confirmation and routing mechanics of FRC-02/FRC-03.
- **Price Oracle and Production Oracle data-feed mechanics** — area covered in spirit by `23_Price_Oracle.test.js` and `24_Production_Oracle.test.js`; concerns `PRICE`/`PRODUCTION` data-type feeds and their consumers, bounded by the oracle-non-sovereignty doctrine this survey preserves unchanged.
- **Cross-cutting stress and policy-layer scenarios** — area covered in spirit by `25_Step7_Stress.test.js` and `26_Step7_PolicyLayer.test.js`; concerns multi-contract interaction sequences and policy-layer composition under load, as already exercised (not newly proposed) by the existing suite.

---

## 3. What This Survey Explicitly Does Not Do

- **It does not prescribe any specific future test.** No test name, test case, assertion, fixture, or code structure is suggested for any area named above. "Naming an area" here means identifying *which existing domain of the test suite* sits outside the P0 set — nothing more.
- **It does not rank, prioritize, or sequence the named areas.** The order above follows the existing test-file numbering for traceability only; it carries no judgment about which area is more or less worth examining, or in what order.
- **It does not authorize any implementation.** Per the rules governing this survey and consistent with Steps 60/61: no contract change, no test change, no storage change, no new role, no new authority, no new governance path, and no new doctrine is authorized by this document for any area named — including, explicitly, GAP-FRC-01 (see Section 4).
- **It does not reopen, reinterpret, or soften any constitutional constant or doctrine element.** `MULTISIG_THRESHOLD = 7`, `MIN_RESERVE_RATIO = 333`, `TRIGGER_TIMEOUT = 72h`, Kernel immutability (no upgrade pattern), the absence of automated final freeze judgment, and the absence of welfare-token incentive/gamification mechanisms are named here only as **scope boundaries that bound certain candidate areas** (e.g., Trigger Protocol, Welfare contracts, Asset Freeze) — they are restated verbatim, unchanged, and untouched, exactly as Steps 41–61 left them.

---

## 4. Explicit Status Restatements (Carried Forward Unchanged)

This survey restates, without alteration, the following findings already established by Steps 58–61, because they bound how any of the named areas — especially Asset Freeze and Pahlavi Token reserve mechanics — may ever be approached in the future:

- **FRC-01 remains not authored as test code.** Step-58 precisely scoped *what* a future Test-Only invariant for GAP-FRC-01 would mean; it explicitly did not write, sketch, outline, or imply any test code, and Steps 60/61 confirmed "no test change authorized yet." That status is unchanged by this survey. The Asset Freeze candidate area named in Section 2 above concerns FRC-02/FRC-03/FRC-05 mechanics *only* — it is explicitly **not** GAP-FRC-01, and nothing in this survey moves GAP-FRC-01 any closer to being authored as test code.
- **The five P0 architecture gaps remain gated behind future redesign discussion.** GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, and GAP-MEX-05 each still require the foundational "should this construct exist at all, and what would it look like?" conversation named in Step-54/55/59 before any engineering-scoping conversation could meaningfully begin. The SWF and Pahlavi Token candidate areas named in Section 2 above concern *already-Contract-Enforced-and-Test-Enforced* mechanics (SWF-01/02/03, MEX-01/02/03) — they are explicitly **not** the classification-construct or provenance-tracking questions those five gaps name, and nothing in this survey narrows, advances, or substitutes for the redesign discussion they are gated behind.
- **No implementation is authorized by this document, for any area, for any reason.** This is a survey of *where future conversations could occur*, exactly as Step-59's Recommended Disposition column named "what kind of conversation a gap is waiting for" without instructing that any conversation begin.

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Survey Element | Existing Source of Truth |
|---|---|
| Invariant families and enforcement classifications used to draw the non-P0 boundary | [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) |
| Full gap inventory and P0 designation (defines the six-gap exclusion set) | [RESERVE_RUNTIME_GAP_REGISTER.md](RESERVE_RUNTIME_GAP_REGISTER.md) (Step-51), [GAP_PRIORITIZATION_MATRIX.md](GAP_PRIORITIZATION_MATRIX.md) (Step-52) |
| Final P0 dispositions (treated as fixed, not revisited) | [P0_GAP_FINAL_RECOMMENDATION.md](P0_GAP_FINAL_RECOMMENDATION.md) (Step-59) |
| GAP-FRC-01 not-yet-authored-as-test-code status | [FRC01_TEST_ONLY_INVARIANT_SCOPE.md](FRC01_TEST_ONLY_INVARIANT_SCOPE.md) (Step-58), [P0_ANALYSIS_CLOSURE_CHECKPOINT.md](P0_ANALYSIS_CLOSURE_CHECKPOINT.md) (Step-60) |
| Path D naming and the four-path structure this survey operationalizes the first step of | [P0_ANALYSIS_CLOSURE_CHECKPOINT.md](P0_ANALYSIS_CLOSURE_CHECKPOINT.md) (Step-60), [STEP61_PROJECT_ARCHITECTURE_CHECKPOINT.md](STEP61_PROJECT_ARCHITECTURE_CHECKPOINT.md) (Step-61) |
| Existing test-suite structure and stated aims | `test/README.md`, `test/*.test.js` (26 files; named, not modified) |
| Underlying contracts | `contracts/` — referenced transitively through the Step-50 mapping; not independently re-derived here |

Where this survey and any document above (or the contracts/tests beneath them) appear to differ, those documents — and beneath them, the contracts and tests — remain authoritative.

---

## Summary

This survey names, by domain only and without prescription, ranking, or implementation proposal, sixteen candidate areas of the existing IranOS test suite that sit outside the six P0 Critical gaps (GAP-RES-01, GAP-CLS-01, GAP-TAI-03, GAP-MEX-04, GAP-MEX-05, GAP-FRC-01) and could, in principle, be the subject of a future hardening discussion under Path D — the path Steps 60–61 named as the route distinct from freezing the checkpoint (Path A), planning a GAP-FRC-01 test-only invariant (Path B), or opening a major-architecture-redesign discussion (Path C). Each area is identified solely by cross-referencing the existing `test/` directory against the non-P0 invariant families of the Step-50 Runtime Enforcement Mapping; none is recommended, scoped, sequenced, or authorized for any future change. This document explicitly restates and preserves, unchanged: that GAP-FRC-01 remains not authored as test code (its Step-58 scope definition stands as a definition, not a draft); that the five P0 architecture gaps remain gated behind a future major-architecture-redesign discussion that has not begun and that this survey does not open or narrow; and that `MULTISIG_THRESHOLD = 7`, `MIN_RESERVE_RATIO = 333`, `TRIGGER_TIMEOUT = 72h`, Kernel immutability, the absence of automated final freeze judgment, and the absence of welfare-token incentive or gamification mechanisms remain exactly as the constitution and existing contracts define them — untouched, unreinterpreted, and unauthorized for change by anything in this document. This survey authorizes no implementation of any kind, for any area, for any reason; it is solely a map of where future, separately-scoped conversations under Path D could occur.
