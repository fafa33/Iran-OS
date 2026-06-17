# Reserve Runtime Gap Register — Architecture Formalization (Step-51)

## Scope and Non-Goals

This document is a **documentation-only** gap register. It does not change, and must not be read as changing:

- Any Solidity contract, interface, storage layout, or event.
- Any threshold, multi-sig requirement, or timeout constant.
- Any role, modifier, or access-control assumption.
- Any test file or test assertion.
- The constitutional doctrine values `MIN_RESERVE_RATIO = 333` (33.3%, in thousandths) and `LIQUIDITY_CAP = 900,000,000,000 × 1e18` (`MAX_SUPPLY` in `PahlaviToken.sol`, `LIQUIDITY_CAP` in `kernel.sol`).

It introduces **no new doctrine, no new contracts, no new storage, no new roles, no new authorities, no new trigger codes, and no new thresholds or timeouts**. It **proposes no fixes**. Its sole purpose is to *register* — by Gap ID, with a fixed set of descriptive fields and a status field — every item that [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) classified as **Documentation-Only** or **Mixed**, plus the architectural boundaries Step-50 observed but did not classify as gaps.

This document is a **direct extension** of, and is subordinate to, the full Step-41–50 series — most directly:

- [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) — the **primary source** for every entry below; each Gap ID, classification, "Current Enforcement," and "Missing Enforcement" field is drawn directly from Step-50's mapping rows and is not re-derived from the contracts independently.
- [RESERVE_INTEGRITY_INVARIANT_MATRIX.md](RESERVE_INTEGRITY_INVARIANT_MATRIX.md) (Step-49) — the invariant definitions referenced by each gap.
- [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41), [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42), [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43), [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44), [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45), [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md) (Step-46), [SOVEREIGN_TREASURY_FLOW_MODEL.md](SOVEREIGN_TREASURY_FLOW_MODEL.md) (Step-47), [TREASURY_ALLOCATION_DISBURSEMENT_MODEL.md](TREASURY_ALLOCATION_DISBURSEMENT_MODEL.md) (Step-48) — original formalization sources, carried forward unchanged.

A "gap," in this register, means exactly what Step-50 already recorded: a portion of an invariant's rule for which **no contract function checks it at runtime and no existing test asserts it**. This register adds nothing to that finding except an ID, a categorization, a risk rating, and a structured explanation of *why* the gap exists and *what doctrine relies on it remaining understood as a gap* (its "Doctrine Impact"). It does not propose closing any gap. "Future Consideration" entries are observations about what a *separate, explicitly-scoped* engineering effort would need to weigh — not a recommendation to undertake one.

---

## Doctrine Constants and Properties (Preserved, Not Redefined)

| Doctrine Element | Value / Statement | Source of Truth | Status Here |
|---|---|---|---|
| `MIN_RESERVE_RATIO` | `333` (33.3%, in thousandths) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| `LIQUIDITY_CAP` / `MAX_SUPPLY` | `900_000_000_000 × 1e18` (900 billion Pahlavi) | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol` | Preserved — referenced only |
| Oracle signals are non-sovereign | Oracle data informs review and feeds Kernel-mediated or fixed-formula computations; it never classifies, mints, transfers, allocates, or disburses on its own authority | `contracts/oracles/API3Oracle.sol`, [LAYER_INTERACTION_MODEL.md](LAYER_INTERACTION_MODEL.md) (Step-43) | Preserved — restated verbatim |
| Frozen assets are not reserve assets | An asset in `Active`/`UnderReview` status is excluded from every domain's recognized balance and from all doctrine computation | `contracts/reclaim/AssetFreeze.sol`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) | Preserved — restated verbatim |
| Reclaimed assets are not automatic backing | `receiveReclaimedAsset` is a pure accounting credit to L1 — it mints no PAH and does not, by itself, classify the credited value as reserve backing | `contracts/monetary/SovereignWealthFund.sol` (`receiveReclaimedAsset`), [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) | Preserved — restated verbatim |
| Welfare/wages are non-reserve assets | `CitizenCard.sol` manages eligibility/status only; the 1,000 Pahlavi minimum wage is an off-chain employer obligation; neither factors into reserve, custody, or expansion enforcement | `contracts/welfare/CitizenCard.sol`, [SOVEREIGN_RESERVE_MODEL.md](SOVEREIGN_RESERVE_MODEL.md) (Step-41) | Preserved — restated verbatim |

Every entry in this register is subordinate to these five doctrine elements and to the full doctrine set carried forward unchanged from Steps 41–50.

---

## How to Read This Register

Each registered gap carries the following fixed fields:

- **Gap ID**: `GAP-<InvariantID>`, a stable, matrix-local label tying the entry directly back to its Step-49 invariant ID and Step-50 mapping row. It creates no on-chain artifact and must not be confused with a contract constant, role, or trigger code.
- **Related Invariant(s)**: the Step-49 Invariant Matrix ID(s) this gap derives from.
- **Category**: one of **Architecture / Runtime / Accounting / Classification / Governance**, describing the layer at which the missing enforcement would have to live if it were ever added (it is not being added here).
- **Current Enforcement**: what Step-50 recorded as actually checked on-chain or asserted by an existing test today, verbatim in substance.
- **Missing Enforcement**: what Step-50 recorded as having no contract check and no test assertion today.
- **Risk Level** (Low / Medium / High): a qualitative judgment of how doctrine-load-bearing the missing portion is — not a measurement, and not a statement that the system is currently unsafe; a Documentation-Only or Mixed classification means the rule is *governed by process discipline*, which Steps 41–49 already establish as the intended control for these specific properties.
- **Reason Gap Exists**: the structural reason, as identified in Step-50, that no contract or test currently covers this portion (most commonly: the underlying concept has no on-chain representation).
- **Doctrine Impact**: which doctrine element(s) or invariant properties depend on this gap being understood, tracked, and reviewed deliberately.
- **Future Consideration**: a neutral statement of what any future, separately-scoped engineering or audit effort would need to account for — not a proposal, design, or recommendation.
- **Status**: `Open` for every entry in this register, by definition — these are findings carried forward from Step-50, not yet acted upon.

---

## 1. Documentation-Only Gaps

These are the eight invariants Step-50 classified as **Documentation-Only**: no contract function checks any part of the rule, and no existing test asserts any part of it, because the underlying on-chain concept does not exist as a first-class contract construct.

### GAP-RES-01 — Sovereign Reserve classification as a discrete on-chain act

- **Gap ID**: GAP-RES-01
- **Related Invariant(s)**: RES-01
- **Category**: Classification
- **Current Enforcement**: None. No contract function performs or records "reserve classification" as a discrete, queryable action.
- **Missing Enforcement**: A runtime check that a balance counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` has passed all eight Eligibility Tests for Reserve Recognition (Origin, Non-Suspension, Single-Custody, Conservation, Doctrine-Bound, Sovereignty, Non-Welfare, Auditability).
- **Risk Level**: High
- **Reason Gap Exists**: "Sovereign Reserve State classification" (Step-44) has no on-chain representation — no enum, status field, mapping, or function records whether a balance "is" Sovereign Reserve. The eight Eligibility Tests exist solely as an architecture-level governance-review standard. *(Per Step-50's Cross-Cutting Observation, this is the root cause recurring across nearly every other Documentation-Only and Mixed entry in this register.)*
- **Doctrine Impact**: This is the foundational gap beneath RES-02 through RES-05, TAI-03, CLS-01 through CLS-05, SWF-04, MEX-04, ALD-05, FRC-01, and FRC-04 — i.e., every entry that depends on "classification" being a checkable on-chain property depends, transitively, on this one.
- **Future Consideration**: Any future audit, test-design, or formal-verification effort scoping work in this area would need to first decide whether "classification" should ever become a first-class on-chain construct at all — a decision Step-44 and Step-50 both note would be a contract-level change, squarely outside documentation-only scope.
- **Status**: Open

### GAP-RES-03 — Single entry/exit path for Sovereign Reserve State

- **Gap ID**: GAP-RES-03
- **Related Invariant(s)**: RES-03
- **Category**: Architecture
- **Current Enforcement**: None. "Sovereign Reserve State" is an architecture-level label applied across Treasury and SWF balances.
- **Missing Enforcement**: A contract enum, status field, or transition function enforcing that entry occurs only via Non-Reserve Treasury / SWF-custodied / routed-reclaimed value → Pending Classification → eight Eligibility Tests, and exit only via the symmetric authorized-confirmation path.
- **Risk Level**: High
- **Reason Gap Exists**: There is no on-chain "Sovereign Reserve State" object for a single entry/exit path to be a property *of* (see GAP-RES-01).
- **Doctrine Impact**: Directly underlies the doctrine principle that reserve recognition cannot occur "through deposit alone, reclaim crediting alone, oracle valuation alone, freezing, withdrawal alone, or the passage of time" (Step-47).
- **Future Consideration**: Any future review of this property would need to weigh it jointly with GAP-RES-01, since a "path" presupposes the state it leads into and out of.
- **Status**: Open

### GAP-RES-05 — Symmetry of entry/exit rigor

- **Gap ID**: GAP-RES-05
- **Related Invariant(s)**: RES-05
- **Category**: Governance
- **Current Enforcement**: None.
- **Missing Enforcement**: Any check that entry-direction and exit-direction governance, audit standards, and Eligibility/Declassification rigor are equally weighted.
- **Risk Level**: Medium
- **Reason Gap Exists**: Symmetry is a property of a governance *process* (classification/declassification) that, per GAP-RES-01, has no on-chain representation to be symmetric or asymmetric about.
- **Doctrine Impact**: Supports the Step-47 standard that the reserve boundary must not be "easier, faster, or less governed" in either direction — a standard directed at human review of process design, not at code.
- **Future Consideration**: A future governance-process audit (not a code change) would be the natural venue for examining this property; it is not addressable by a contract or test mechanism as such.
- **Status**: Open

### GAP-TAI-03 — Independence of custody and classification as tracked properties

- **Gap ID**: GAP-TAI-03
- **Related Invariant(s)**: TAI-03
- **Category**: Accounting
- **Current Enforcement**: None.
- **Missing Enforcement**: A contract-level distinction between "where value is held" (custody — which *is* tracked, via `layerL1/L2/L3`, `budgetLines`, `frozenAssets`) and "whether value counts as Sovereign Reserve" (classification — which is not tracked as a separate property at all).
- **Risk Level**: High
- **Reason Gap Exists**: "Classification" is not a contract-level property distinct from custody (SWF layer membership); the conceptual distinction this invariant protects exists only at the architecture-documentation level (see GAP-RES-01).
- **Doctrine Impact**: This is the formal statement, at the accounting layer, of the same root condition identified in GAP-RES-01 — explicitly named in the task brief as a "custody vs. classification separation gap." See the dedicated discussion under "Custody vs. Classification Separation Gaps" below.
- **Future Consideration**: Any future reconciliation tooling or audit framework would need to treat "custody location" and "classification status" as the two independent axes this invariant describes — and would need to do so without assuming the second axis exists on-chain today.
- **Status**: Open

### GAP-CLS-01 — Exactly-one-classification-state consistency

- **Gap ID**: GAP-CLS-01
- **Related Invariant(s)**: CLS-01
- **Category**: Classification
- **Current Enforcement**: None.
- **Missing Enforcement**: A contract enum or status field representing "Sovereign Reserve State," "Pending Classification State," "Frozen," "Reclaimed-In-Transit," "Released," "Non-Reserve Treasury," and the remaining defined states as mutually-exclusive, exhaustive, first-class values for any given balance.
- **Risk Level**: High
- **Reason Gap Exists**: The eight classification states are an architecture-level taxonomy (Step-44) overlaid on existing balances; no contract construct represents them as discrete values a balance could be checked against.
- **Doctrine Impact**: This is the formal statement, at the classification layer, of the "Sovereign Reserve classification state representation gap" named explicitly in the task brief. See the dedicated discussion below.
- **Future Consideration**: A future formal-verification effort modeling "balance state" would need to model these eight states as an architecture-level overlay on existing storage, not as queryable contract state — because today, they are not.
- **Status**: Open

### GAP-CLS-04 — Prohibition on "borrowing" classification status

- **Gap ID**: GAP-CLS-04
- **Related Invariant(s)**: CLS-04
- **Category**: Governance
- **Current Enforcement**: None.
- **Missing Enforcement**: Any detection of a reclassification pattern undertaken with intent to reverse it once a short-term operational need passes.
- **Risk Level**: Medium
- **Reason Gap Exists**: "Borrowing" describes a governance *intent* pattern around an action (classification/declassification) that, per GAP-CLS-01/GAP-RES-01, has no on-chain representation; intent is not a checkable on-chain property in any case.
- **Doctrine Impact**: Supports the Step-44 standard that "each classification act stands on its own eligibility and authorization merits" — a standard for governance review of *reasoning*, not of state.
- **Future Consideration**: This property is, by its nature (an intent-based prohibition), not one that a future contract or test mechanism could check directly even if classification itself became on-chain; it would remain a review-time judgment.
- **Status**: Open

### GAP-MEX-04 — Non-self-referential composition of `totalReserves`

- **Gap ID**: GAP-MEX-04
- **Related Invariant(s)**: MEX-04
- **Category**: Accounting
- **Current Enforcement**: `updateReserves` (`onlyKernel`) feeds the figure that `reserveCompliant` checks arithmetically (the *relationship* between `totalReserves` and `newSupply` is contract-enforced — see MEX-02/MEX-03 in the "Observed Architectural Boundaries" section below for the adjacent guarantees that *are* enforced).
- **Missing Enforcement**: Any verification that `totalReserves` is *composed* only of value that exists independently of, and prior to, the mint it would back — i.e., that no newly-minted Pahlavi or asset acquired with it has been folded back into the figure.
- **Risk Level**: High
- **Reason Gap Exists**: `reserveCompliant` checks the *arithmetic* relationship between two numbers; neither the contract nor any existing test inspects how `totalReserves` was *composed*. That guarantee rests entirely on the `onlyKernel` discipline around `updateReserves` and on governance review of the figure's provenance.
- **Doctrine Impact**: This is the explicit "accounting-only doctrine dependency" the task brief asks to be named — `reserveCompliant`'s correctness as a *doctrine-protective* check (not merely an arithmetic one) depends entirely on a composition guarantee that exists only as a governance-review standard. See the dedicated discussion below.
- **Future Consideration**: Any future effort to strengthen `reserveCompliant` against self-referential backing would need a way to track *provenance* of reserve value over time — a materially larger undertaking than the current instantaneous-ratio check, and one Step-45 and Step-50 both leave to "future, explicitly-scoped engineering effort."
- **Status**: Open

### GAP-ALD-05 — Re-examination of classification upon disbursement

- **Gap ID**: GAP-ALD-05
- **Related Invariant(s)**: ALD-05
- **Category**: Classification
- **Current Enforcement**: None.
- **Missing Enforcement**: Any contract trigger or test assertion of a "required re-examination of continued classification" upon a withdrawal's execution, or any check that disbursed value stops being counted toward `MIN_RESERVE_RATIO`/`LIQUIDITY_CAP` once it exits custody.
- **Risk Level**: Medium
- **Reason Gap Exists**: "Reserve classification" is not a queryable on-chain property (see GAP-RES-01/GAP-CLS-01/GAP-TAI-03); a re-examination of something that has no on-chain representation cannot itself be triggered or asserted on-chain.
- **Doctrine Impact**: Forms part of the "reserve recognition lifecycle gap" the task brief asks to be named — specifically, the *exit* side of the lifecycle (see the dedicated discussion below, alongside GAP-RES-03).
- **Future Consideration**: This is, by Step-48's own framing, an audit/governance standard layered on top of the existing `proposeWithdrawal`/`signWithdrawal` mechanics — any future strengthening would need to first resolve GAP-RES-01/GAP-CLS-01 before a "re-examination" trigger could be meaningfully attached to anything on-chain.
- **Status**: Open

---

## 2. Mixed-Enforcement Gaps

These are the seventeen invariants Step-50 classified as **Mixed**: part of the rule is actively checked by existing, unmodified contract code (and in most cases tested), while another part rests on documentation-level discipline that no contract or test currently checks. Each entry's "Current Enforcement" and "Missing Enforcement" fields separate the two parts exactly as Step-50 did.

### GAP-RES-02 — Doctrine-bound recognition at classification time (vs. mint time)

- **Gap ID**: GAP-RES-02
- **Related Invariant(s)**: RES-02
- **Category**: Runtime
- **Current Enforcement**: The doctrine-bound check is contract-enforced and tested **at mint time**: `reserveCompliant` modifier in `PahlaviToken.sol` (`require(totalSupply() + amount <= MAX_SUPPLY, ...)`, `require((totalReserves * 1000) / newSupply >= MIN_RESERVE_RATIO, ...)`), exercised by `test/02_pahlavi_token.test.js`.
- **Missing Enforcement**: An equivalent check **at classification time** — i.e., that the *act of recognizing* a balance as Sovereign Reserve cannot itself push recognized backing past `LIQUIDITY_CAP` or misstate the `MIN_RESERVE_RATIO` standing.
- **Risk Level**: Medium
- **Reason Gap Exists**: Classification itself is not a contract action (see GAP-RES-01); there is no moment at which a "classification transaction" could be checked, because no such transaction exists.
- **Doctrine Impact**: The mint-time check (MEX-02/MEX-03, preserved verbatim — see "Observed Architectural Boundaries") substantially covers the arithmetic this invariant protects at the one moment doctrine arithmetic *is* checked on-chain; the classification-time half remains a documentation-level expectation.
- **Future Consideration**: A future audit could examine whether the existing mint-time check is, in practice, sufficient coverage for this invariant's intent — without needing to introduce a classification-time check that would require GAP-RES-01 to be resolved first.
- **Status**: Open

### GAP-RES-04 — Deliberateness/authorization/replay-resistance of classification acts

- **Gap ID**: GAP-RES-04
- **Related Invariant(s)**: RES-04
- **Category**: Governance
- **Current Enforcement**: The *general* properties — deliberateness, authorization, replay-resistance — are contract-enforced and tested for SWF/token actions: `nonReentrant` modifiers, `Transaction.executed` flag, `reserveCompliant`, role gates (`onlyRole(COUNCIL_ROLE)`, `onlyRole(KERNEL_ROLE)`), exercised by `test/03_sovereign_wealth_fund.test.js`.
- **Missing Enforcement**: The specific application of these properties to "classification/declassification" as such — because that act does not exist on-chain (see GAP-RES-01/GAP-RES-03).
- **Risk Level**: Medium
- **Reason Gap Exists**: The contract-level mechanisms this invariant would attach to (replay guards, role gates, executed-flags) exist and are exercised — but the *act* they would need to attach to, "classification," does not.
- **Doctrine Impact**: Step-44's "Declassification Rules" (explicit, authorized, conservation-consistent, non-retroactive, lock-respecting, auditable, exactly-once) describe properties the *adjacent* SWF/token mechanisms already demonstrate in the domains where they apply.
- **Future Consideration**: A future audit assessing whether existing SWF/token safeguards would "transfer" adequately to a hypothetical classification mechanism is a reasonable scoping question — but remains hypothetical until GAP-RES-01 is addressed, if ever.
- **Status**: Open

### GAP-TAI-01 — Cross-domain no-netting/no-merging (governance-proposal level)

- **Gap ID**: GAP-TAI-01
- **Related Invariant(s)**: TAI-01
- **Category**: Accounting
- **Current Enforcement**: Structural separation is contract-enforced by omission: `Treasury.sol` (`budgetLines`, `transactions`) and `SovereignWealthFund.sol` (`layerL1/L2/L3`) keep separate storage with no merge function existing, exercised by `test/09_Treasury.test.js` and `test/03_sovereign_wealth_fund.test.js`.
- **Missing Enforcement**: The doctrine-level prohibition on a *governance proposal* computing and using a combined Treasury+Reserve+SWF+Reclaimed+Frozen total for a doctrine-relevant decision.
- **Risk Level**: Medium
- **Reason Gap Exists**: No contract or test could detect an off-chain "combined figure" used in a governance proposal — that figure, by definition, would never touch the contracts.
- **Doctrine Impact**: The structural separation (no merge function, no shared storage) is a strong adjacent guarantee; the gap is specifically about *off-chain reasoning* that references on-chain figures without combining them on-chain.
- **Future Consideration**: This is, by its nature, a governance-process review question (what figures does a proposal cite, and how) rather than a contract-design question — any future work here would sit in audit/process review, not in Solidity.
- **Status**: Open

### GAP-TAI-02 — Cross-contract single-custody guarantee (same underlying asset)

- **Gap ID**: GAP-TAI-02
- **Related Invariant(s)**: TAI-02
- **Category**: Accounting
- **Current Enforcement**: Within each contract, a value resolves to exactly one storage record by construction — `layerL1/L2/L3`, `budgetLines`/`transactions`, `frozenAssets` mappings — contract-enforced and exercised by `test/03_sovereign_wealth_fund.test.js`, `test/09_Treasury.test.js`, `test/06_asset_freeze.test.js`.
- **Missing Enforcement**: A cross-contract check that the *same underlying real-world asset* never appears in two ledgers (e.g., both `frozenAssets` and `layerL1`) simultaneously.
- **Risk Level**: Medium
- **Reason Gap Exists**: Each contract enforces single-record-per-value *within its own storage*; no mechanism cross-references storage across `SovereignWealthFund.sol`, `Treasury.sol`, and `AssetFreeze.sol` to detect the same asset recorded twice.
- **Doctrine Impact**: This is the cross-contract half of the "Single-Custody Test" (Step-44) — the within-contract half is solidly covered; the cross-contract half depends on the discipline that initiates a freeze, a deposit, or a reclaim never double-records the same asset.
- **Future Consideration**: A future cross-contract reconciliation tool, if ever built, would need an asset-identity scheme that does not currently exist uniformly across all three contracts' storage models — a non-trivial design question in its own right.
- **Status**: Open

### GAP-TAI-04 — Cross-domain reconciliation against authorized inflow/outflow totals

- **Gap ID**: GAP-TAI-04
- **Related Invariant(s)**: TAI-04
- **Category**: Accounting
- **Current Enforcement**: Individual-action auditability is contract-enforced and tested: an event is emitted for every state-changing call (`DepositToL1/L2/L3`, `WithdrawalProposed/Signed/Executed`, `AnnualYieldDistributed`, `BudgetLineCreated`, `TransactionProposed`, `AssetFrozen`, `PahlaviMinted/Burned`, etc.), exercised across nearly every test file in the suite.
- **Missing Enforcement**: A cross-domain *reconciliation* — aggregating the full Treasury+Reserve+SWF+Reclaimed+Frozen+Released ledger and checking it against the sum of authorized inflow/outflow records.
- **Risk Level**: Medium
- **Reason Gap Exists**: No on-chain aggregator exists across these domains, and no dedicated reconciliation test exists; each domain emits its own complete event trail, but nothing sums and cross-checks them.
- **Doctrine Impact**: The per-action auditability this invariant also describes is robustly covered; the *reconciliation* — the audit-time act of using those events to detect a double-count or missing record — is, by Step-44's own framing, an audit-time activity that consumes the events rather than one the contracts perform themselves.
- **Future Consideration**: A future off-chain reconciliation tool consuming the existing, complete event trail is a natural audit-tooling direction — but building or specifying one is outside this register's documentation-only scope.
- **Status**: Open

### GAP-CLS-02 — General prohibition on reclassification (beyond freeze-routing sub-paths)

- **Gap ID**: GAP-CLS-02
- **Related Invariant(s)**: CLS-02
- **Category**: Classification
- **Current Enforcement**: The *freeze-routing* sub-paths this invariant references are structurally enforced: `AssetFreeze.sol`'s `FreezeStatus` enum prevents an `Active`/`UnderReview` → SWF shortcut and prevents re-entry from `Released`, exercised by `test/06_asset_freeze.test.js`.
- **Missing Enforcement**: The broader prohibition on "reclassification" generally — direct Frozen-to-Reserve, direct Reclaimed-to-Reserve bypassing eligibility testing, Non-Eligible-to-reserve-bearing, oracle-originated classification, Reserve-to-Frozen as a declassification shortcut, implicit/timeout-based reclassification — none of which can be checked because "classification" itself does not exist on-chain (see GAP-CLS-01).
- **Risk Level**: Medium
- **Reason Gap Exists**: The adjacent freeze-domain enum constrains the one set of paths that *does* have on-chain representation; the general prohibition this invariant names is about a broader concept (classification/reclassification) that does not.
- **Doctrine Impact**: The freeze-routing sub-paths — arguably the most concretely "reclassification-shaped" thing that exists on-chain — are solidly covered; the remaining prohibited paths describe hypothetical actions against a state machine (classification) that has no contract representation to violate.
- **Future Consideration**: Any future work extending `FreezeStatus`-style enums to other domains would need to weigh whether doing so meaningfully advances this invariant or merely relocates the same root gap (GAP-CLS-01) into new storage.
- **Status**: Open

### GAP-CLS-03 — Sovereignty of classification action (vs. adjacent oracle-boundary guarantees)

- **Gap ID**: GAP-CLS-03
- **Related Invariant(s)**: CLS-03
- **Category**: Governance
- **Current Enforcement**: The *adjacent* guarantee that an oracle cannot directly authorize a reserve-relevant state change is contract-enforced and tested: `updateReserves` is `onlyKernel` (not oracle-callable); `distributeRevenue` applies a fixed, non-oracle-determined 30/70 formula (`onlyRole(ORACLE_ROLE)` restricted to supplying the *amount* only), exercised by `test/16_Provincial.test.js` and `test/02_pahlavi_token.test.js`.
- **Missing Enforcement**: A check that "classification" specifically — as opposed to the adjacent actions that *are* gated — is performed only by an authorized governance actor and never by an oracle, because classification itself is not a contract action an oracle could or could not perform (see GAP-CLS-01).
- **Risk Level**: Low
- **Reason Gap Exists**: The contract-level oracle/kernel boundary this invariant's "Sovereignty Test" would rely on is solidly in place for every reserve-adjacent action that *does* exist on-chain; the gap is specific to an action (classification) that has no on-chain existence to be sovereign or non-sovereign over.
- **Doctrine Impact**: This is one of the strongest adjacent-coverage cases in the register — the oracle-non-sovereignty doctrine element (preserved verbatim above) is robustly demonstrated everywhere it currently *can* be.
- **Future Consideration**: If "classification" were ever to gain an on-chain representation, the existing `onlyKernel`/role-gate pattern around `updateReserves` and `distributeRevenue` would be the most directly applicable precedent to examine — a note for any future scoping effort, not a proposal.
- **Status**: Open

### GAP-CLS-05 — Binary eligibility of classification specifically (vs. adjacent mint-eligibility binary check)

- **Gap ID**: GAP-CLS-05
- **Related Invariant(s)**: CLS-05
- **Category**: Classification
- **Current Enforcement**: Binary (all-or-nothing) evaluation *is* a contract-enforced and tested property of the adjacent `reserveCompliant` mint-eligibility check in `PahlaviToken.sol` — no "partial mint" exists — exercised by `test/02_pahlavi_token.test.js`.
- **Missing Enforcement**: The binary property of *classification eligibility* specifically — i.e., that a balance failing any one Eligibility Test does not partially classify — because classification eligibility (per GAP-CLS-01) is not itself a contract action with a pass/fail outcome to be binary about.
- **Risk Level**: Low
- **Reason Gap Exists**: The *pattern* this invariant describes (binary, all-or-nothing evaluation) is demonstrably how the codebase behaves in the one analogous domain that exists on-chain (minting); the specific subject of the invariant (classification) has no on-chain analog of its own.
- **Doctrine Impact**: Strong adjacent-pattern coverage — the "no partial/provisional/discounted/pending-but-counted" standard this invariant states is exactly how `reserveCompliant` already behaves.
- **Future Consideration**: A future scoping effort modeling a hypothetical on-chain classification mechanism could reasonably treat `reserveCompliant`'s binary structure as a directly relevant precedent.
- **Status**: Open

### GAP-SWF-04 — Eligibility-test follow-on for reclaim credits

- **Gap ID**: GAP-SWF-04
- **Related Invariant(s)**: SWF-04
- **Category**: Classification
- **Current Enforcement**: That `receiveReclaimedAsset` credits `layerL1` only, is `RECLAIM_ROLE`-gated, and contains no minting call is contract-enforced (verifiable by reading the function body, NatSpec-documented as "این تابع صرفاً حسابداری است") and indirectly exercised by `test/06_asset_freeze.test.js` and `test/03_sovereign_wealth_fund.test.js`.
- **Missing Enforcement**: The follow-on requirement that the credited value must independently pass the eight Eligibility Tests (Path E) before counting as Sovereign Reserve — because that classification step does not exist on-chain (see GAP-RES-01/GAP-CLS-01).
- **Risk Level**: Medium
- **Reason Gap Exists**: The function's "accounting-only, no minting, L1-only" character is structurally guaranteed by the absence of any path from it to `mint`; the *next* step this invariant names — independent eligibility evaluation — has no contract step to occur or be skipped.
- **Doctrine Impact**: This is the formal statement, at the SWF layer, of the "reclaimed assets not automatic backing" doctrine element (preserved verbatim above) and of the "reserve recognition lifecycle" gap named in the task brief — see the dedicated discussion below alongside GAP-FRC-04.
- **Future Consideration**: The structural absence of any `receiveReclaimedAsset` → `mint` path is itself a strong, durable guarantee that should be weighed (and preserved) in any future review of this area — it is the contract-level fact that makes the doctrine statement true today, independent of whether "classification" ever gains on-chain representation.
- **Status**: Open

### GAP-SWF-05 — Prohibition on future PRs introducing new roles/thresholds

- **Gap ID**: GAP-SWF-05
- **Related Invariant(s)**: SWF-05
- **Category**: Governance
- **Current Enforcement**: That the *currently deployed* role set and `MULTISIG_REQUIRED` value are exactly as documented is contract-enforced (fixed role constants, `MULTISIG_REQUIRED` declared `constant`) and tested in `test/03_sovereign_wealth_fund.test.js` ("آستانه Multi-Sig سه است", role-restriction tests).
- **Missing Enforcement**: A check preventing a *future* source-code change from introducing a new role, expanding an existing role's scope, or lowering `MULTISIG_REQUIRED`/`COUNCIL_THRESHOLD`.
- **Risk Level**: Low
- **Reason Gap Exists**: No contract or automated test can constrain modifications to its own source code — this is, structurally, a code-review-time and governance-time constraint, not a runtime one.
- **Doctrine Impact**: This is the formal restatement of CLAUDE.md's own standing instruction that "any PR that lowers `MULTISIG_THRESHOLD`, `COUNCIL_THRESHOLD`, or removes a `nonReentrant` guard should be flagged as a security concern" — i.e., a review-process control that already exists at the project-governance level, parallel to (not a substitute for) a runtime check.
- **Future Consideration**: This is squarely a code-review/PR-process matter; any future strengthening would belong in review checklists or CI policy, not in the contracts under review.
- **Status**: Open

### GAP-MEX-05 — Compositional guarantee that no oracle/reclaim/frozen/welfare figure influenced a mint

- **Gap ID**: GAP-MEX-05
- **Related Invariant(s)**: MEX-05
- **Category**: Accounting
- **Current Enforcement**: That an oracle address cannot directly call `mint` or `updateReserves` is contract-enforced (role gates: `onlyRole(MINTER_ROLE)` restricted to the SWF address; `updateReserves` is `onlyKernel`, not oracle-callable) and tested in `test/02_pahlavi_token.test.js` and `test/09_api3_oracle.test.js`.
- **Missing Enforcement**: A compositional check that the *figure* an authorized mint relies on (`totalReserves`) has never been influenced by reclaim confirmations, frozen-asset value estimates, or welfare/wage-derived data.
- **Risk Level**: High
- **Reason Gap Exists**: This is the same structural gap as GAP-MEX-04, viewed from the input-source angle rather than the timing angle — no on-chain mechanism inspects *how* `totalReserves` was arrived at, only the arithmetic relationship it participates in at mint time.
- **Doctrine Impact**: Directly underlies the "Oracle-Triggered," "Reclaimed-Asset-Triggered," "Frozen-Asset-Backed," and "Welfare- or Wage-Backed Minting" prohibitions (Step-45) — the role-gate half of this invariant (who can call what) is solid; the compositional half (what informed the number they relied on) is not checkable on-chain today.
- **Future Consideration**: See GAP-MEX-04 — these two gaps describe the same underlying limitation and would need to be addressed together, if ever, by any future provenance-tracking design.
- **Status**: Open

### GAP-MEX-06 — Mapping of "breach-relevant conditions" onto TR-05/TR-06 (beyond raw ratio failures)

- **Gap ID**: GAP-MEX-06
- **Related Invariant(s)**: MEX-06
- **Category**: Governance
- **Current Enforcement**: That TR-05/TR-06 exist as the only liquidity/reserve-related trigger codes, and that `burn` (`onlyRole(BURNER_ROLE)`, requires `reason`) is the only contraction mechanism, is contract-enforced and tested: `flagViolation`/`signViolation`/`_activateTrigger` in `kernel.sol` (`test/01_kernel.test.js`), `burn` in `PahlaviToken.sol` (`test/02_pahlavi_token.test.js`).
- **Missing Enforcement**: A detector that maps a "breach-relevant condition" — including *compositional*-integrity findings such as those in GAP-MEX-04/GAP-MEX-05 that would not surface as a raw ratio failure — onto a TR-05/TR-06 flag.
- **Risk Level**: Medium
- **Reason Gap Exists**: `flagViolation` requires a human or oracle submission; there is no on-chain monitor that derives "this composition issue should become a TR-05/TR-06 flag" from internal contract state.
- **Doctrine Impact**: The trigger-code *exclusivity* this invariant protects (no new code, no automated-response mechanism, "grow into compliance" prohibited) is solidly preserved; the *detection-and-mapping* half is a documentation-level monitoring/governance standard.
- **Future Consideration**: Any future monitoring tooling proposal would need to route exclusively through the existing TR-05/TR-06 flagging mechanism — this invariant is explicit that no new code or automatic-response path is permissible, which any future scoping must treat as a hard constraint, not a design option. See monitoring specification for the full constraint set (F-1..F-8, FND-01..FND-10, seven domain boundaries).
- **Status**: Closed — documentation-level monitoring/governance standard established; see [`docs/reports/GAP_MEX_06_MONITORING_SPECIFICATION.md`](../reports/GAP_MEX_06_MONITORING_SPECIFICATION.md); FND-01..FND-10 verified; F-1..F-8 satisfied; no unresolved findings. CLOSED does not mean monitoring tooling is deployed or audited.

### GAP-ALD-01 — Allocation as a distinct, non-balance-moving earmark stage (general framing)

- **Gap ID**: GAP-ALD-01
- **Related Invariant(s)**: ALD-01
- **Category**: Architecture
- **Current Enforcement**: For the SWF path, the proposal/signature/execution sequence and the `Transaction.executed` gate are contract-enforced and tested (`test/03_sovereign_wealth_fund.test.js`, `test/09_Treasury.test.js` — "نباید تراکنش از ردیف بودجه تجاوز کند"), substantially realizing the sequencing this invariant describes.
- **Missing Enforcement**: The general framing that "allocation is a distinct, non-balance-moving earmark stage" separate from execution — Step-48 itself notes that, for SWF withdrawals, proposal and execution are "the same on-chain moment."
- **Risk Level**: Low
- **Reason Gap Exists**: The contract mechanics substantially *realize* the sequencing property this invariant protects; the gap is a difference in *framing/decomposition* (allocation vs. disbursement as conceptually separate stages) layered onto mechanics that, in the SWF case, collapse the two into one transaction.
- **Doctrine Impact**: The doctrine-critical part of this invariant — that a spend cannot occur before authorization completes, and that a disbursement requires a declared purpose — is solidly covered; the conceptual two-stage framing is a documentation-level decomposition Step-48 itself flags as not perfectly matching the SWF mechanics.
- **Future Consideration**: A future review reconciling Step-48's two-stage framing with the SWF's one-step reality would be a documentation-consistency question, not a contract-design question.
- **Status**: Open

### GAP-ALD-02 — Exclusion of Frozen/Pending-Classification/Reclaimed-In-Transit value from spending

- **Gap ID**: GAP-ALD-02
- **Related Invariant(s)**: ALD-02
- **Category**: Accounting
- **Current Enforcement**: Non-zero-amount and balance-sufficiency checks are contract-enforced and directly tested (`require(amount > 0)`, `require(layerLN.balance >= tx_.amount)`, budget-line/sector-cap `require` checks — `test/03_sovereign_wealth_fund.test.js`, `test/09_Treasury.test.js`, `test/16_Provincial.test.js`).
- **Missing Enforcement**: A check that the source balance is not in a Frozen, Reclaimed-In-Transit, or Pending-Classification state before allocation/disbursement — none of these states are queryable properties of a Treasury/SWF balance (see GAP-CLS-01).
- **Risk Level**: High
- **Reason Gap Exists**: `frozenAssets` is tracked entirely separately from `layerL1/L2/L3` and `budgetLines`; there is no cross-reference that would let a spending check "see" that a given unit of value is, conceptually, frozen or pending classification — because, structurally, frozen/pending value never enters `layerL1/L2/L3`/`budgetLines` in the first place (a fact that substantially mitigates, without formally closing, this gap — see "Observed Architectural Boundaries" below).
- **Doctrine Impact**: The "Sufficiency Check" half of this invariant is robustly covered; the "Source Confirmation" half (verifying the *kind* of balance, not just its sufficiency) depends on the structural fact that the relevant contracts simply do not co-mingle these categories — itself a strong adjacent guarantee, but not the same as an explicit runtime check of *state* before spend.
- **Future Consideration**: A future audit could examine whether the structural non-comingling (frozen value literally lives in a different mapping than spendable value) is, in practice, a complete substitute for an explicit state-check — a question of equivalence that this register does not resolve.
- **Status**: Open

### GAP-ALD-06 — Prohibition on welfare/wage/projected-mint justification for allocation sizing

- **Gap ID**: GAP-ALD-06
- **Related Invariant(s)**: ALD-06
- **Category**: Governance
- **Current Enforcement**: `notInEmergency`/`reserveCompliant` would independently reject a mint that a "spend-and-replenish" scheme depended on, if that mint failed the cap/ratio test at the time it was attempted — a partial, indirect backstop, contract-enforced and tested in `test/02_pahlavi_token.test.js`.
- **Missing Enforcement**: Any check of *whether* an allocation/disbursement decision was *justified* by welfare scale, wage projections, or an anticipated future mint — a question of reasoning and process, not of resulting on-chain state.
- **Risk Level**: Medium
- **Reason Gap Exists**: The contract can reject a mint that *fails* doctrine checks when attempted; it cannot inspect the *reasoning* that led a governance actor to propose an allocation in the first place.
- **Doctrine Impact**: The indirect backstop (a doctrine-violating "replenish" mint would still be rejected on its own merits) is a meaningful adjacent guarantee; the prohibition this invariant actually states — on using such reasoning as an *input* to a decision — is a documentation-level standard for how proposals may be justified.
- **Future Consideration**: This is, by its nature (a prohibition on a category of *reasoning*), not a property any contract or automated test could check directly — it would remain a standard for proposal review and governance discipline in any future scoping.
- **Status**: Open

### GAP-FRC-01 — Cross-domain exclusion of frozen-asset value from doctrine computation

- **Gap ID**: GAP-FRC-01
- **Related Invariant(s)**: FRC-01
- **Category**: Accounting
- **Current Enforcement**: That an asset *is* recorded as `Active`/`UnderReview` (and thus distinguishable from non-frozen assets) is contract-enforced and tested: `FreezeStatus` enum, `totalFrozenAssets`/`totalFrozenValue` in `AssetFreeze.sol` (`test/06_asset_freeze.test.js`).
- **Missing Enforcement**: A cross-domain mechanism guaranteeing that frozen-status causes the asset's value to be *excluded* from `totalReserves`, Treasury totals, and every doctrine computation — `totalFrozenValue` is a separate counter that no other contract (e.g., `PahlaviToken.totalReserves`) consults or excludes by reference.
- **Risk Level**: High
- **Reason Gap Exists**: `AssetFreeze.sol` records freeze status faithfully within its own storage; nothing wires that status into the computations performed by `PahlaviToken.sol` or `Treasury.sol` — exclusion is achieved (if it is achieved) by the structural fact that frozen assets never enter `totalReserves` to begin with, not by an active cross-contract exclusion check.
- **Doctrine Impact**: This is the formal statement, at the freeze/reclaim layer, of the "frozen assets not reserve" doctrine element (preserved verbatim above) — and is one of the most doctrine-load-bearing Mixed entries in the register, because `totalReserves` composition (see GAP-MEX-04/GAP-MEX-05) is precisely where a silent inclusion would do the most damage.
- **Future Consideration**: A future audit verifying that frozen-asset value structurally *cannot* reach `totalReserves` (as opposed to merely *not currently doing so*) would need to trace every code path that could set or update `totalReserves` and confirm none references `totalFrozenValue` or `frozenAssets` — a verification exercise, not a code change.
- **Status**: Open

### GAP-FRC-04 — Eligibility-test follow-on for `TransferredToSWF` reclaim credits

- **Gap ID**: GAP-FRC-04
- **Related Invariant(s)**: FRC-04
- **Category**: Classification
- **Current Enforcement**: Identical structure to GAP-SWF-04: the "accounting-only, no minting, L1-only" portion of `receiveReclaimedAsset` is contract-enforced and indirectly tested (`test/06_asset_freeze.test.js`, `test/03_sovereign_wealth_fund.test.js`).
- **Missing Enforcement**: The "must independently pass Eligibility Tests before counting as reserve, and never directly causes/authorizes a mint" portion — which rests on (a) the structural absence of any contract path connecting `receiveReclaimedAsset` to `mint` (a contract-level fact) and (b) the documentation-only classification step that would have to occur first (see GAP-RES-01/GAP-CLS-01).
- **Risk Level**: Medium
- **Reason Gap Exists**: Same as GAP-SWF-04 — the structural fact (a) is solid and verifiable by reading the code; the conceptual follow-on step (b) has no on-chain existence to be performed, skipped, or checked.
- **Doctrine Impact**: This is the second formal statement (alongside GAP-SWF-04) of the "reclaimed assets not automatic backing" doctrine element, and forms the other half of the "reserve recognition lifecycle gap" the task brief asks to be named.
- **Future Consideration**: See GAP-SWF-04 — these two entries describe the same underlying structure from the freeze/reclaim and SWF sides respectively, and any future review should treat them as a single gap viewed from two angles, not two separate gaps.
- **Status**: Open

---

## 3. Observed Architectural Boundaries (Intentional Non-Gaps)

Step-50 also recorded a number of properties that, on first reading, resemble gaps but are, on closer reading, **intentional architectural boundaries** — places where the absence of a particular check is itself the correct, doctrine-consistent design, not an omission. This register lists them explicitly so that a future reviewer does not mistake a deliberate boundary for an open finding. None of these carry a "Status" field — they are not registered gaps, and nothing about them is "Open."

- **Welfare/wages structurally cannot enter reserve, custody, or expansion computation.** `CitizenCard.sol` manages eligibility/status only and holds no balance-affecting relationship to `SovereignWealthFund.sol`, `Treasury.sol`, or `PahlaviToken.sol`; the 1,000 Pahlavi minimum wage is, by design, an off-chain employer obligation the contract does not pay. This is not a gap in welfare/wage *enforcement* — it is the doctrine-correct boundary the "welfare/wages non-reserve" element (preserved verbatim above) describes. Nothing is "missing" here; the absence of a connection *is* the control.

- **Oracle role-gating around reserve-relevant figures.** `updateReserves` is `onlyKernel` (not oracle-callable); `distributeRevenue` restricts the oracle to supplying a raw amount while the 30/70 split is immutable contract constants; `mint`/`burn` are restricted to `MINTER_ROLE`/`BURNER_ROLE` (the SWF address), never the oracle. This is the concrete, contract-level demonstration of the "oracle non-sovereignty" doctrine element (preserved verbatim above) — the boundary between "oracle supplies data" and "Kernel/governance acts on it" is a load-bearing design feature, not an enforcement shortfall.

- **Structural separation of Treasury and SWF storage.** `Treasury.sol` (`budgetLines`, `transactions`) and `SovereignWealthFund.sol` (`layerL1/L2/L3`) share no storage and have no merge function. This "enforcement by omission" is the adjacent, contract-enforced half of TAI-01/TAI-02 (see GAP-TAI-01/GAP-TAI-02 above for the parts that remain documentation-level) — and it is a deliberate design choice (separate contracts, separate storage) rather than an incomplete check.

- **`FreezeStatus` enum's exhaustive within-domain routing.** `Active → UnderReview → Confirmed → (TransferredToSWF or Released)` is the complete, exhaustively-enumerated set of post-confirmation destinations, each role-gated distinctly (`RECLAIM_ROLE` / `KERNEL_ROLE`), with no other path in the enum. This is FRC-02/FRC-03 — both **Contract-Enforced and Test-Enforced** in Step-50's classification, and explicitly *not* among the Documentation-Only or Mixed entries this register covers. It is the single strongest piece of on-chain "lifecycle" enforcement anywhere in the freeze/reclaim domain, and stands in deliberate contrast to the cross-domain exclusion gap recorded as GAP-FRC-01.

- **`receiveReclaimedAsset`'s structural absence of a `mint` call.** The function is hard-wired to `layerL1` only, role-gated to `RECLAIM_ROLE`, and contains no path to `PahlaviToken.mint` — verifiable by reading the function body and its own NatSpec ("این تابع صرفاً حسابداری است"). This structural fact is the contract-level guarantee underneath the "reclaimed assets not automatic backing" doctrine element (preserved verbatim above); it is what makes that doctrine statement *true today*, independent of whether the documentation-level classification follow-on (GAP-SWF-04/GAP-FRC-04) is ever resolved.

- **Immutable Kernel constants and absence of upgrade proxies.** `LIQUIDITY_CAP`, `MIN_RESERVE_RATIO`, `MULTISIG_THRESHOLD`, and `TRIGGER_TIMEOUT` are hard-coded and immutable by design (per CLAUDE.md's Key Design Decision #1: "Any 'fix' to these values requires a new deployment"). The *absence* of an upgrade mechanism here is the doctrine-correct boundary — it is exactly what "no admin backdoors" and "no hidden upgrade patterns that bypass the kernel" require, not a place where enforcement is missing.

- **Replay/duplicate-credit resistance (TAI-05).** `Transaction.executed` flags, `nonReentrant` guards, and `FreezeStatus` double-freeze/double-confirm guards are, per Step-50, the *one* family in this matrix that achieved a clean **Contract-Enforced and Test-Enforced** classification with no documentation-level remainder. It is listed here only to make explicit, by contrast, what "no gap at all" looks like in this matrix — a useful calibration point for the risk ratings assigned elsewhere in this register.

---

## Explicitly Identified Gap Themes

The task brief asks that several specific themes be named explicitly. Each is addressed below by pointing to the registered entries that constitute it — these are pointers into the register above, not new findings.

### Sovereign Reserve classification state representation gap

This is **GAP-RES-01** and **GAP-CLS-01**, viewed together. Step-50's Cross-Cutting Observation identifies this as *the* central, recurring root cause: "Sovereign Reserve State classification" — and the eight classification states it would occupy — has no on-chain enum, status field, mapping, or function. Nearly every other entry in Section 1 and Section 2 of this register (RES-02 through RES-05, TAI-03, CLS-02 through CLS-05, SWF-04, MEX-04, ALD-05, FRC-01, FRC-04) traces back to this single absence. This register does not propose creating such a representation — doing so would be a contract-level change outside documentation-only scope — but records, as faithfully as Step-50 did, that this absence is the load-bearing fact beneath the bulk of the register.

### Custody vs. classification separation gaps

This is **GAP-TAI-03** most directly, with **GAP-TAI-02** as its cross-contract-accounting counterpart. Custody — *where* value is held — is robustly tracked (`layerL1/L2/L3`, `budgetLines`, `frozenAssets`). Classification — *whether* value counts as Sovereign Reserve — is not tracked as an independent property at all; today, the architecture-level convention simply treats certain custody locations (e.g., SWF L1/L2) as "the Sovereign Reserve" by labeling, not by an independently-verified classification act. TAI-03 names this directly: custody and classification "are tracked as two independent, reconcilable properties of the same unit — never merged or assumed from one another," and Step-50 records that, on-chain, only the first half of that sentence is true.

### Reserve recognition lifecycle gaps

This is **GAP-RES-03** (entry side: the single defined path from custody → Pending Classification → eight Eligibility Tests → Sovereign Reserve State) and **GAP-ALD-05** (exit side: the required re-examination of continued classification at the point of disbursement), together with **GAP-SWF-04** and **GAP-FRC-04** (the specific entry sub-case of reclaim credits, which Step-50 traces identically from both the SWF and the freeze/reclaim angles). Taken together, these four entries describe a complete lifecycle — entry, recognition-as-reserve, and exit — none of whose stages exist as a discrete, queryable on-chain sequence; each stage is, today, a labeling convention applied to balances that move through ordinary Treasury/SWF/AssetFreeze mechanics for entirely separate (and well-enforced) reasons.

### Accounting-only doctrine dependencies

This is **GAP-MEX-04** and **GAP-MEX-05**, together with the adjacent observation recorded under "Observed Architectural Boundaries" regarding `receiveReclaimedAsset`. `reserveCompliant` is, in its checked arithmetic, a robust, contract-enforced, well-tested guarantee — but its *doctrine-protective meaning* (that the reserve ratio genuinely reflects eligible, non-self-referential, non-oracle-influenced backing) depends entirely on the *composition* of `totalReserves`, which is governed solely by the `onlyKernel` discipline around `updateReserves` and by governance review of what that figure contains. The contract checks the math; the doctrine depends on the math being performed over the right inputs — and verifying that the inputs are right is, today, an accounting-discipline question with no on-chain or test-level check.

### Invariants dependent on off-chain interpretation

Several entries describe properties that are, by their nature, about *reasoning*, *intent*, or *process* rather than *state* — and would remain so even if every other gap in this register were somehow resolved:

- **GAP-CLS-04** (prohibition on "borrowing" classification status) — depends on inferring *intent* to reverse a reclassification.
- **GAP-ALD-06** (prohibition on welfare/wage/projected-mint justification) — depends on inspecting the *reasoning* behind an allocation decision, not its resulting state.
- **GAP-RES-05** (symmetry of entry/exit rigor) — depends on a comparative *governance-process* judgment about two directions of a process that itself has no on-chain representation.
- **GAP-TAI-01**'s documentation-level half (no combined-figure use in governance proposals) — depends on what figures a human cites in a proposal, which never touches the contracts.
- **GAP-SWF-05**'s documentation-level half (no future PR introducing new roles/thresholds) — depends on code-review-time judgment about source-code changes, which no runtime mechanism can constrain.

These five are flagged separately because no future on-chain mechanism — however thorough — could close them; they are, and will remain, governance-discipline and code-review-discipline questions, exactly as Steps 41–49 already frame them.

---

## Gap Counts by Category

| Category | Documentation-Only | Mixed | Total |
|---|---|---|---|
| Architecture | 2 (RES-03, RES-05*) | 1 (ALD-01) | 3 |
| Runtime | 0 | 1 (RES-02) | 1 |
| Accounting | 1 (TAI-03) | 6 (TAI-01, TAI-02, TAI-04, MEX-05, ALD-02, FRC-01) | 7 |
| Classification | 2 (RES-01, CLS-01) | 5 (CLS-02, CLS-03, CLS-05, SWF-04, FRC-04) | 7 |
| Governance | 2 (CLS-04, ALD-05*) | 4 (RES-04, SWF-05, MEX-06, ALD-06) | 6 |

\* `RES-05` is counted under Architecture (it concerns the structural symmetry of a boundary) and `ALD-05` under Governance (it concerns a required governance/audit re-examination act); `MEX-04` is counted under Accounting. Several gaps could reasonably sit at the intersection of two categories (e.g., GAP-RES-01 is simultaneously Classification and Architecture); each is counted once, under the category its "Category" field above states, to keep this tally consistent with the register entries themselves.

| | Count |
|---|---|
| **Total Documentation-Only gaps registered** | 8 |
| **Total Mixed-Enforcement gaps registered** | 17 |
| **Total registered gaps (Status = Open)** | 25 |
| **Observed Architectural Boundaries (non-gaps, no Status field)** | 7 |

These counts match Step-50's Enforcement Classification Summary exactly (8 Documentation-Only, 17 Mixed, 12 Contract-Enforced — the last of which fall outside this register's scope by definition, since they are not gaps).

---

## Relationship to Existing Protocols, Contracts, and Prior Architecture Documents

| Register Element | Existing Source of Truth |
|---|---|
| Primary source for every Gap ID, classification, and enforcement split | [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) |
| Invariant definitions referenced by each gap | [RESERVE_INTEGRITY_INVARIANT_MATRIX.md](RESERVE_INTEGRITY_INVARIANT_MATRIX.md) (Step-49) |
| `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`/`MAX_SUPPLY` doctrine and enforcement | `contracts/kernel.sol`, `contracts/monetary/PahlaviToken.sol`, `test/02_pahlavi_token.test.js`, `test/01_kernel.test.js` |
| Reserve classification concept (documentation-level) | [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) |
| SWF lifecycle, transitions, withdrawal/yield/reclaim mechanics | `contracts/monetary/SovereignWealthFund.sol`, `test/03_sovereign_wealth_fund.test.js`, [WEALTH_FUND_STATE_TRANSITIONS.md](WEALTH_FUND_STATE_TRANSITIONS.md) (Step-46) |
| Monetary expansion mechanics (`mint`/`burn`/`reserveCompliant`) | `contracts/monetary/PahlaviToken.sol`, `test/02_pahlavi_token.test.js`, [MONETARY_EXPANSION_CONSTRAINTS.md](MONETARY_EXPANSION_CONSTRAINTS.md) (Step-45) |
| Treasury budget/transaction mechanics | `contracts/governance/Treasury.sol`, `test/09_Treasury.test.js`, [TREASURY_ACCOUNTING_RULES.md](TREASURY_ACCOUNTING_RULES.md) (Step-42) |
| Provincial 30/70 allocation mechanics | `contracts/governance/Provincial.sol`, `test/16_Provincial.test.js`, [TREASURY_ALLOCATION_DISBURSEMENT_MODEL.md](TREASURY_ALLOCATION_DISBURSEMENT_MODEL.md) (Step-48) |
| Freeze/reclaim lifecycle mechanics | `contracts/reclaim/AssetFreeze.sol`, `test/06_asset_freeze.test.js`, [RESERVE_CLASSIFICATION_PROTOCOL.md](RESERVE_CLASSIFICATION_PROTOCOL.md) (Step-44) |
| End-to-end flow synthesis | [SOVEREIGN_TREASURY_FLOW_MODEL.md](SOVEREIGN_TREASURY_FLOW_MODEL.md) (Step-47) |
| Trigger codes and lifecycle (TR-01..TR-06) | `contracts/kernel.sol`, `contracts/core/TriggerProtocol.sol`, `test/01_kernel.test.js`, `test/08_Trigger_Protocol.test.js` |
| Oracle signal boundaries | `contracts/oracles/API3Oracle.sol`, `test/09_api3_oracle.test.js` |
| Citizen welfare (non-reserve, off-chain wages) | `contracts/welfare/CitizenCard.sol`, `test/05_citizen_card.test.js` |

Where this register and a contract, test file, protocol, or a prior architecture formalization (Step-41 through Step-50) appear to differ, the contract, test file, protocol, and prior formalizations remain authoritative, per the project convention that the constitution and existing on-chain code are the source of truth. This register is an index and tracking ledger over Step-50's findings — it does not supersede any of it, and it closes nothing.

---

## Summary

This document registers, by stable Gap ID, every item [RUNTIME_ENFORCEMENT_MAPPING.md](RUNTIME_ENFORCEMENT_MAPPING.md) (Step-50) classified as **Documentation-Only** (8 gaps: GAP-RES-01, GAP-RES-03, GAP-RES-05, GAP-TAI-03, GAP-CLS-01, GAP-CLS-04, GAP-MEX-04, GAP-ALD-05) or **Mixed** (17 gaps: GAP-RES-02, GAP-RES-04, GAP-TAI-01, GAP-TAI-02, GAP-TAI-04, GAP-CLS-02, GAP-CLS-03, GAP-CLS-05, GAP-SWF-04, GAP-SWF-05, GAP-MEX-05, GAP-MEX-06, GAP-ALD-01, GAP-ALD-02, GAP-ALD-06, GAP-FRC-01, GAP-FRC-04) — 25 entries total, every one carrying Gap ID, Related Invariant(s), Category, Current Enforcement, Missing Enforcement, Risk Level, Reason Gap Exists, Doctrine Impact, Future Consideration, and Status = Open. It separately records seven **Observed Architectural Boundaries** — properties that resemble gaps but are, on inspection, deliberate, doctrine-correct design choices (welfare/wage structural exclusion, oracle role-gating, Treasury/SWF storage separation, the `FreezeStatus` exhaustive routing enum, `receiveReclaimedAsset`'s structural absence of a mint path, immutable Kernel constants, and the clean replay/duplicate-credit guarantee) — explicitly distinguished from the registered gaps so that no future reviewer mistakes intentional design for an open finding. It explicitly names, as the task required: the Sovereign Reserve classification state representation gap (GAP-RES-01/GAP-CLS-01), the custody-vs-classification separation gaps (GAP-TAI-03/GAP-TAI-02), the reserve recognition lifecycle gaps (GAP-RES-03/GAP-ALD-05/GAP-SWF-04/GAP-FRC-04), the accounting-only doctrine dependencies (GAP-MEX-04/GAP-MEX-05), and the invariants dependent on off-chain interpretation (GAP-CLS-04, GAP-ALD-06, GAP-RES-05, and the documentation-level halves of GAP-TAI-01 and GAP-SWF-05). It builds on nothing but Steps 41–50, creates no new doctrine, contract, storage, role, authority, trigger code, threshold, or timeout, and proposes no fix to any registered item — every entry's Status is `Open`, recorded faithfully as a finding carried forward from Step-50, exactly as Step-50 carried its findings forward from Steps 41–49. It explicitly preserves, verbatim, `MIN_RESERVE_RATIO = 333`, `LIQUIDITY_CAP = 900,000,000,000 × 1e18`, the non-sovereignty of oracle signals, the exclusion of frozen assets from reserve recognition, the non-automatic-backing status of reclaimed assets, and the structural separation of welfare/wage obligations from reserve accounting. It is a tracking ledger intended to directly support future audits, invariant-based test design, and formal-verification scoping — recording what is open, where, and why, without prejudging whether or how any of it should ever be closed.
