# Step-4.5 Wealth Fund State Transitions

## Scope And Non-Goals

This document defines the Step-4.5 Wealth Fund State Transitions for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, monetary constants, or Step-3 runtime hardening coverage.

Step-4.5 formalizes SovereignWealthFund state transitions under the Step-4 Sovereign Reserve Model, Step-4.1 Treasury Accounting Rules, Step-4.2 Reserve Classification Protocol, Step-4.3 Monetary Expansion Constraints, and Step-4.4 Cross-Layer Conservation Invariants. It does not implement enforcement and does not claim formal verification is complete.

IranOS is sovereign resilience infrastructure. The SovereignWealthFund is an accounting and reserve-continuity component, not a DeFi yield, staking, lending, treasury yield, speculative deployment, or capital-efficiency framework.

## Preserved Checkpoints

Step-4.5 preserves the following checkpoint assumptions:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 sovereign reserve formalization has started but is not complete.
- Step-4.1 treasury accounting rules remain the accounting baseline.
- Step-4.2 reserve classification protocol remains the classification baseline.
- Step-4.3 monetary expansion constraints remain the monetary expansion baseline.
- Step-4.4 cross-layer conservation invariants remain the cross-layer baseline.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle and API3 components remain signal providers, not decision-makers.
- Human final freeze authority remains outside automation.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-4.5 preserves the Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

## Sovereign Wealth Fund Definitions

- SovereignWealthFund: the accounting component that tracks permitted deposits, withdrawals, reclaimed assets, and layer balances under sovereign reserve discipline.
- SWF Balance: value recorded inside the SovereignWealthFund accounting boundary.
- SWF Layer Balance: value recorded for a specific SovereignWealthFund layer.
- SWF Deposit: an authorized increase to an SWF balance.
- SWF Withdrawal: an authorized decrease from an SWF balance.
- Reclaimed Asset Intake: value recovered through authorized reclaim paths and credited into SWF accounting only through exact-once rules.
- SWF Accounting Effect: any state transition that changes SWF balance, layer balance, withdrawal state, or reclaimed asset state.
- SWF Backing Candidate: SWF-accounted value that may later be reviewed for reserve backing classification but is not backing by itself.
- SWF Reserve-Backed Balance: SWF-accounted value recognized as reserve backing only after authorized classification and exact-once backing recognition.
- SWF Neutrality: failed, unauthorized, stale, invalid, over-withdrawal, zero-value, or replayed SWF paths must preserve protected SWF, reserve, treasury, reclaim, and monetary state.

## SWF State Definitions

The initial SWF state model recognizes:

- Zero Balance: an SWF layer or accounting boundary with no recorded value.
- Layer Balance Recorded: value recorded in a specific SWF layer after an authorized accounting effect.
- Pending Deposit: a proposed or in-progress deposit that has not yet become recognized SWF accounting.
- Recognized Deposit: a deposit accepted through an authorized path and recorded exactly once.
- Rejected Deposit: a deposit rejected without protected accounting mutation.
- Pending Reclaimed Asset: reclaimed value proposed or in progress before recognized SWF accounting.
- Recognized Reclaimed Asset: reclaimed value accepted through an authorized reclaim path and recorded exactly once.
- Rejected Reclaimed Asset: reclaimed value rejected without protected accounting mutation.
- Pending Withdrawal: a withdrawal proposed but not yet executed.
- Executed Withdrawal: a withdrawal executed through the required authorization path exactly once.
- Rejected Withdrawal: a withdrawal rejected without protected accounting mutation.
- Encumbered SWF Balance: SWF value constrained by obligations, pending withdrawals, freezes, classifications, claims, or review.
- Frozen SWF-Linked Balance: SWF-linked value affected by freeze state and unavailable for deployability or release without final human or governance authority.
- SWF Backing Candidate: SWF value eligible for later reserve classification review only.
- SWF Reserve-Backed Balance: SWF value recognized as backing only after authorized reserve classification and exact-once backing recognition.

These states are accounting labels. They do not create value, authority, backing, mint capacity, or deployability by themselves.

## Allowed SWF State Transitions

Allowed SWF transitions are specification targets for later mapping:

- Zero Balance -> Layer Balance Recorded, after an authorized accounting effect.
- Pending Deposit -> Recognized Deposit, only through an authorized deposit path.
- Pending Deposit -> Rejected Deposit.
- Recognized Deposit -> Layer Balance Recorded, exactly once.
- Pending Reclaimed Asset -> Recognized Reclaimed Asset, only through an authorized reclaim role and path.
- Pending Reclaimed Asset -> Rejected Reclaimed Asset.
- Recognized Reclaimed Asset -> Layer Balance Recorded, exactly once.
- Layer Balance Recorded -> Pending Withdrawal.
- Pending Withdrawal -> Executed Withdrawal, only with required authority and sufficient balance.
- Pending Withdrawal -> Rejected Withdrawal.
- Layer Balance Recorded -> Encumbered SWF Balance, when obligations, pending withdrawals, freeze constraints, reclaim constraints, classification review, or claims attach.
- Encumbered SWF Balance -> Layer Balance Recorded, only after authorized release and conservation checks.
- Layer Balance Recorded -> SWF Backing Candidate, only as a review state.
- SWF Backing Candidate -> SWF Reserve-Backed Balance, only through authorized reserve classification and exact-once backing recognition.
- Frozen SWF-Linked Balance -> prior eligible SWF state, only after final human or governance release authority.

Every allowed transition must identify source state, target state, authority basis, conservation boundary, accounting effect, and audit record.

## Forbidden SWF State Transitions

The following SWF transitions are forbidden:

- Any SWF state directly creating mint capacity.
- Any SWF balance bypassing reserve classification to become recognized backing.
- Any SWF balance bypassing `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP`.
- Any deposit, withdrawal, reclaimed asset intake, or state transition executing twice.
- Any unauthorized deposit, withdrawal, reclaimed asset intake, or state transition mutating protected state.
- Any zero-value deposit or reclaimed asset intake creating value.
- Any over-withdrawal mutating SWF accounting.
- Any failed or replayed deposit, withdrawal, or reclaim path mutating SWF accounting.
- Any freeze or emergency state implicitly releasing, unlocking, reclassifying, minting from, or transferring SWF value.
- Any oracle or API3 signal autonomously depositing, withdrawing, reclaiming, classifying, minting, burning, freezing, unfreezing, or transferring value.
- Any SWF balance treated as staking, lending, treasury yield, speculative deployment, or capital-efficiency input.

## SWF Accounting Conservation Rules

SWF accounting must conserve value across valid transitions.

- SWF deposits must increase accounting only by the authorized amount.
- SWF withdrawals must decrease accounting only by the executed amount.
- Reclaimed asset intake must preserve prior accounting history.
- SWF layer balances must not create value through movement between labels.
- Encumbered SWF value must not appear freely deployable.
- Frozen SWF-linked value must not appear releasable or deployable without final human or governance authority.
- SWF accounting records must not be interpreted as additional reserve backing.
- SWF balances must not be double-counted across SWF, treasury, reserve, and monetary layers.

## SWF Exact-Once Accounting Rules

Exact-once accounting applies to every SWF state transition that changes accounting.

- A valid SWF deposit must update accounting once and only once.
- A valid reclaimed asset intake must update accounting once and only once.
- A valid SWF withdrawal must update accounting once and only once.
- A valid transition into a backing candidate state must not itself count as recognized backing.
- A valid transition from backing candidate to reserve-backed balance must occur only through authorized classification and exact-once backing recognition.
- Audit records must not be counted as additional accounting effects.
- Replayed calls must not duplicate any SWF accounting effect.

## SWF Replay Resistance Rules

Replay resistance must hold across deposits, withdrawals, reclaim transfers, classification-facing state, and monetary-facing state.

- Executed withdrawals must not replay accounting mutation.
- Reclaimed asset deposits must not replay accounting mutation.
- Duplicate reclaim transfer attempts must preserve reclaim state and SWF accounting.
- Duplicate deposit attempts must not create duplicate SWF value.
- Completed backing recognition must not replay into duplicate reserve backing.
- TriggerProtocol, oracle, API3, or classification records must not be replayed into duplicate SWF accounting effects.
- Completed or rejected SWF transitions must not re-enter the system as fresh authority.

## SWF Failed-Path Neutrality Rules

Failed SWF paths must preserve protected state across all connected layers.

- Unauthorized deposits must remain state-neutral.
- Unauthorized reclaimed asset intake must remain state-neutral.
- Unauthorized withdrawals must remain state-neutral.
- Zero-value deposits and reclaimed asset intakes must remain state-neutral.
- Over-withdrawal execution must remain state-neutral.
- Failed reclaim transfers must preserve reclaim state and SWF accounting.
- Failed reserve classification of SWF-backed candidates must not mutate recognized backing.
- Failed monetary expansion attempts must not mutate SWF accounting or backing.
- Stale, invalid, unauthorized, repeated, or low-confidence oracle/API3 signals must not mutate SWF state.
- Failed freeze or emergency paths must not unlock, release, mint from, reclassify, or transfer SWF value.

## SWF Reserve Backing Boundaries

SWF balances do not become reserve backing by themselves.

- SWF value may become a backing candidate only for review.
- SWF backing candidates must not count as recognized reserve backing.
- SWF reserve-backed balance requires authorized reserve classification.
- SWF reserve-backed balance requires exact-once backing recognition.
- SWF balances must not bypass Step-4.2 classification rules.
- SWF balances must not bypass Step-4.4 cross-layer conservation invariants.
- Reserve backing must not be double-counted through SWF state, treasury state, reserve state, or monetary state.
- Encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted SWF-linked value must not count as deployable backing.

## SWF Monetary Expansion Boundaries

SWF state must not create hidden mint capacity.

- SWF deposits must not directly create mint capacity.
- Reclaimed asset intake must not directly create mint capacity.
- SWF layer balance changes must not directly create mint capacity.
- SWF backing candidates must not satisfy `MIN_RESERVE_RATIO`.
- SWF backing candidates must not bypass `LIQUIDITY_CAP`.
- SWF reserve-backed balances may constrain monetary expansion only after authorized classification and exact-once backing recognition.
- Failed, replayed, unauthorized, over-withdrawal, or zero-value SWF paths must not change supply, backing, or expansion eligibility.
- `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` remain unchanged and non-configurable.

## SWF Freeze And Emergency Boundaries

Freeze and emergency state must not implicitly unlock, mint, release, or reclassify SWF value.

- Frozen SWF-linked value must not become deployable through accounting labels.
- Emergency state must not create SWF mint capacity.
- Emergency reserve classification must remain bounded and auditable.
- Emergency or freeze state must not bypass human or governance authority.
- Emergency or freeze state must not bypass reserve classification rules.
- Emergency or freeze state must not bypass `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP`.
- Release from frozen, locked, encumbered, or pending SWF state must preserve value and backing conservation.

## Oracle And API3 Signal Boundaries

Oracle and API3 signals may inform review or risk state only.

Oracle and API3 signals must not autonomously:

- Deposit into the SovereignWealthFund.
- Withdraw from the SovereignWealthFund.
- Receive or recognize reclaimed assets.
- Classify or reclassify SWF balances.
- Mint or burn supply.
- Freeze or unfreeze assets.
- Transfer assets.
- Unlock SWF-linked value.
- Execute treasury actions.
- Create reserve backing.

Stale, invalid, unauthorized, repeated, or low-confidence oracle/API3 signals must preserve Step-3 neutrality assumptions where applicable.

## Human/Governance Authority Boundaries

Human or governance authority remains final where SWF state touches freeze, emergency, release, classification, deployability, or monetary backing.

- SWF records do not create authority; they evidence authorized accounting state.
- Automation may preserve audit trails or enforce already-authorized transitions, but it must not replace human or governance authority.
- Human or governance authority remains final for freeze release and emergency reserve decisions.
- Reserve classification authority remains required before SWF value can become recognized backing.
- Kernel immutability, thresholds, timeout constants, trigger codes, constitutional constants, `MIN_RESERVE_RATIO`, and `LIQUIDITY_CAP` remain unchanged and non-configurable.

## Initial SWF Invariant Matrix

| Invariant | Specification target |
| --- | --- |
| SWF value conservation | Valid SWF transitions must not create value. |
| Exact-once deposits | Valid deposits update SWF accounting once and only once. |
| Exact-once reclaimed intake | Valid reclaimed asset intake updates SWF accounting once and only once. |
| Exact-once withdrawals | Valid withdrawals update SWF accounting once and only once. |
| Withdrawal replay resistance | Executed withdrawals cannot replay accounting mutation. |
| Reclaim replay resistance | Duplicate reclaim transfer attempts preserve reclaim state and SWF accounting. |
| Failed-path neutrality | Failed, unauthorized, stale, invalid, over-withdrawal, zero-value, or replayed SWF paths preserve protected state. |
| No direct backing | SWF balances do not become reserve backing without authorized classification. |
| No double-counted backing | SWF value cannot be double-counted across SWF, treasury, reserve, or monetary layers. |
| No hidden minting | SWF state does not create mint capacity directly or indirectly. |
| Oracle/API3 boundary | Oracle and API3 signals inform review only and do not autonomously mutate SWF state. |
| Freeze/emergency boundary | Freeze or emergency state does not implicitly unlock, mint, release, or reclassify SWF value. |
| Authority preservation | Human/governance authority remains final for freeze, emergency, release, classification, and deployability decisions. |
| Step-3 preservation | SWF state transition formalization does not weaken Step-3 runtime hardening invariants. |
| Step-4 preservation | SWF state transition formalization remains subordinate to Step-4 reserve, accounting, classification, monetary, and cross-layer conservation assumptions. |

## Forbidden Assumptions

This Step-4.5 artifact forbids the following assumptions:

- Do not make the Kernel upgradeable.
- Do not alter Kernel immutability.
- Do not change thresholds.
- Do not change timeout constants.
- Do not change trigger codes.
- Do not change constitutional constants.
- Do not change `MIN_RESERVE_RATIO`.
- Do not change `LIQUIDITY_CAP`.
- Do not convert monetary or constitutional constants into mutable configuration.
- Do not redesign contracts as part of this artifact.
- Do not change tests as part of this artifact.
- Do not change architecture or governance assumptions.
- Do not introduce staking, lending, treasury yield, speculative deployment, DeFi yield, or capital-efficiency framing.
- Do not treat SovereignWealthFund balances as speculative capital or expansion inventory.
- Do not allow hidden minting through SWF accounting, reserve reclassification, emergency reserves, oracle/API3 signals, or replayed execution.
- Do not allow SWF state to bypass reserve classification or monetary constraints.
- Do not allow oracle-driven or API3-driven autonomous deposits, withdrawals, reclaim recognition, minting, burning, reserve classification, unlocking, freeze, unfreeze, transfer, or treasury execution.
- Do not automate final human or governance authority.
- Do not weaken reserve discipline, monetary constraints, treasury accounting constraints, classification constraints, cross-layer invariants, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Open Audit Questions

- Which existing SWF events or records are sufficient to prove exact-once state transitions?
- Which future tests should assert that failed SWF paths do not mutate connected treasury, reserve, reclaim, or monetary state?
- How should SWF backing candidates be represented without counting them as recognized backing?
- How should reclaimed assets move from AssetFreeze/reclaim into SWF accounting without duplicate value?
- Which replay paths should be modeled first for SWF formal-method preparation?
- How should emergency and freeze review be documented when SWF-linked value is involved?
- Which Step-3 SWF tests should become direct evidence for Step-4.5 invariants?
- Which later checkpoint should connect SWF state transitions to executable invariant tests without changing doctrine?
