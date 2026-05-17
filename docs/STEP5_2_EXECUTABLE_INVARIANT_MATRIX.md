# Step-5.2 Executable Invariant Matrix

## Scope And Non-Goals

This document defines the Step-5.2 Executable Invariant Matrix for IranOS. It is documentation only and does not change contracts, tests, storage, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, monetary constants, role assignments, or enforcement logic.

Step-5.2 converts Step-3, Step-4, Step-5, and Step-5.1 doctrine into future executable assertion targets. It defines how invariants should later be expressed as tests, runtime checks, audit checks, or formal-method targets, but it does not write tests or claim formal verification is complete.

IranOS is sovereign resilience infrastructure. Executable invariants exist to preserve constitutional execution, reserve discipline, monetary constraints, authority conservation, exact-once accounting, replay resistance, failed-path neutrality, and human/governance final authority. They are not a DeFi yield, staking, lending, treasury yield, speculative deployment, leverage, or capital-efficiency framework.

## Preserved Checkpoints

Step-5.2 preserves the following checkpoints:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 reserve, treasury accounting, reserve classification, monetary expansion, cross-layer conservation, and Sovereign Wealth Fund state transition assumptions remain preserved.
- Step-5 role and authority boundary assumptions remain preserved.
- Step-5.1 storage and invariant mapping assumptions remain preserved.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle and API3 components remain evidence providers, not autonomous decision-makers.
- Human/governance authority remains final where reserve classification, freeze, emergency, release, deployability, or monetary backing decisions require final judgment.
- SWF means Sovereign Wealth Fund, and the IranOS SWF remains a sovereign reserve resilience layer (SRR-role), not a profit-maximizing sovereign investment vehicle.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-5.2 preserves Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

Step-5.2 also preserves Step-4 and Step-5 assumptions for reserve conservation, treasury accounting discipline, reserve classification governance, backing-bounded monetary expansion, cross-layer conservation, SWF exact-once accounting, replay resistance, failed-path neutrality, oracle/API3 evidence-only boundaries, authority conservation, storage label non-authority, and human/governance final authority.

## Executable Invariant Definitions

- Executable Invariant: a doctrine-preserving assertion target that can later be expressed as a test, runtime check, audit check, or formal-method property.
- Runtime Surface: the storage, function path, role, event, record, or cross-contract interaction where the invariant can be observed.
- Precondition: the state required before the invariant action is exercised.
- Action: the call, attempted transition, replay, failure, or read that exercises the invariant.
- Expected Assertion: the expected protected behavior after the action.
- Forbidden Mutation: the state mutation that must not occur.
- Storage Evidence: the storage, event, record, role, or view that can prove the expected assertion.
- Current Test Evidence: existing test file coverage, where applicable.
- Open Gap: missing executable coverage, storage evidence, or mapping detail before implementation or enforcement planning.

Executable invariants are future assertion targets only. They do not authorize contract changes, storage changes, role changes, test changes, architecture changes, or enforcement changes.

## Invariant Priority Levels

- P0: authority creation, hidden minting, value creation, constant bypass, Kernel weakening, constitutional weakening, governance bypass, oracle autonomy, or automated replacement of final human/governance authority.
- P1: replay resistance, finality, exact-once accounting, failed-path neutrality, cross-contract atomicity, and protected state preservation.
- P2: evidence completeness, auditability, traceability, storage/event proof quality, and future formal-method preparation.
- P3: documentation-only traceability improvements and non-blocking mapping refinements.

Priority does not create implementation authority. It only ranks future assertion targets.

## Executable Invariant Format

Each executable invariant should use the following table fields:

| Field | Meaning |
| --- | --- |
| ID | Stable invariant identifier for future reference. |
| Priority | P0, P1, P2, or P3 based on risk. |
| Invariant | Human-readable invariant statement. |
| Runtime surface | Storage, function, event, role, or cross-contract surface. |
| Precondition | Required starting state. |
| Action | Call, read, replay, failure, or attempted transition. |
| Expected assertion | Required protected outcome. |
| Forbidden mutation | State mutation that must not occur. |
| Storage evidence | Storage, event, record, or view proving the assertion. |
| Current test evidence | Existing test file coverage, if any. |
| Open gap | Missing test, evidence, mapping, or formalization item. |

Future executable invariants should preserve this format so tests, audit checks, and formal-method targets can be compared without changing doctrine.

## Kernel / Trigger / Jury Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KTJ-01 | P0 | Partial court signatures must not activate trigger execution. | Kernel violation/signature state and TriggerProtocol execution path | Violation exists below required signature threshold | Court members sign below threshold | No trigger execution occurs | Emergency or trigger execution activated below threshold | Kernel signature records and TriggerProtocol execution count | `test/01_kernel.test.js` | Map exact storage fields and events |
| KTJ-02 | P1 | Post-threshold signing must not replay trigger execution. | Kernel signed violation state and TriggerProtocol records | Trigger already executed for a violation | Additional signature attempt occurs | No duplicate trigger execution | Execution counter or treasury blocking duplicated | Kernel and TriggerProtocol records | `test/01_kernel.test.js`, `test/09_api3_oracle.test.js` | Cross-contract finality proof matrix |
| KTJ-03 | P1 | TriggerProtocol execution records remain immutable across later attempts. | TriggerProtocol execution records | One or more executions recorded | Later execution or failed attempt occurs | Existing record remains unchanged | Prior execution detail overwritten or reused as authority | TriggerProtocol execution detail reads | `test/08_Trigger_Protocol.test.js` | Future unrelated-authority negative tests |
| KTJ-04 | P1 | Unauthorized trigger execution and zero-offender attempts are state-neutral. | TriggerProtocol authorization and execution state | Unauthorized caller or zero offender | Execute trigger attempt | Revert or fail without protected mutation | Execution counter, blocked address, or records mutate | TriggerProtocol state and events | `test/08_Trigger_Protocol.test.js` | Event-to-storage evidence mapping |
| KTJ-05 | P1 | Completed jury verdicts must reject later votes without mutating verdict state. | JurySelection pools, votes, commitments, verdict state | Case completed by conviction or acquittal | Later vote attempt | Vote rejected and verdict remains final | Verdict, vote count, or commitment state mutates | JurySelection case and verdict records | `test/07_jury_selection.test.js` | Storage-level finality field mapping |

## AssetFreeze / Reclaim Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AFR-01 | P1 | Failed SWF transfer must revert atomically without mutating reclaim or SWF accounting state. | AssetFreeze transfer state and SWF balances | Asset is confirmed but AssetFreeze lacks required SWF reclaim authority | Transfer to SWF attempted | Revert preserves reclaim and SWF state | Asset marked transferred or SWF balance credited | AssetFreeze asset state and SWF L1 balance | `test/06_asset_freeze.test.js` | Cross-contract revert evidence map |
| AFR-02 | P1 | Duplicate reclaim transfer must not credit SWF twice. | AssetFreeze transferred state and SWF accounting | Asset already transferred to SWF | Duplicate transfer attempted | Attempt fails and accounting remains unchanged | Duplicate SWF credit or total frozen value mutation | AssetFreeze transfer flag and SWF balances | `test/06_asset_freeze.test.js` | Event replay matrix |
| AFR-03 | P0 | Freeze or reclaim records must not create mint, classification, unlock, or treasury authority. | AssetFreeze records and related events | Freeze or reclaim record exists | Record is read or referenced by another layer | Record remains evidence-only unless existing authority path applies | Record treated as mint/classification/unlock authority | AssetFreeze records and downstream state | Partial: `test/06_asset_freeze.test.js` | Future cross-layer authority misuse tests |

## SWF / SRR-Role Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SWF-01 | P1 | Valid SWF withdrawal updates accounting once and only once. | SWF withdrawal proposal, signature, execution, and layer balance state | Valid proposal has required signatures and sufficient balance | Execute withdrawal | Layer balance decreases by executed amount once | Duplicate or excessive balance mutation | SWF withdrawal record and layer balance | `test/03_sovereign_wealth_fund.test.js` | Authority-consumption evidence map |
| SWF-02 | P1 | Executed SWF withdrawal must not replay accounting mutation. | SWF executed withdrawal state | Withdrawal already executed | Execute same withdrawal again | Revert or fail with no accounting mutation | Second balance decrease or authority reuse | SWF executed flag and layer balance | `test/03_sovereign_wealth_fund.test.js` | Future event replay matrix |
| SWF-03 | P1 | Unauthorized, zero-value, or over-withdrawal SWF paths must be state-neutral. | SWF role, deposit, reclaim, withdrawal, and balance state | Unauthorized caller, zero amount, or insufficient balance | Attempt invalid SWF path | Protected SWF state remains unchanged | Balance, withdrawal, or reclaim state mutates | SWF balances and records | `test/03_sovereign_wealth_fund.test.js` | Broader state-neutrality matrix |
| SWF-04 | P0 | SWF/SRR labels must not create authority or mint capacity. | SWF balances, layer labels, SRR-role documentation, backing candidate state | SWF balance or SRR-role label exists | Label is referenced for reserve, monetary, or authority decision | Label remains non-authority and non-backing until authorized path | Governance authority, unlock authority, classification authority, or mint capacity created | SWF records, token supply, reserve state | Documentation only | Future negative tests after any mapping implementation |
| SWF-05 | P0 | SWF state must not become a DeFi treasury, yield engine, speculative deployment layer, lending/staking mechanism, leverage vehicle, or capital-efficiency mechanism. | SWF accounting and future enforcement surfaces | SWF state exists | Future rule references SWF balances | SWF remains sovereign reserve resilience accounting layer | SWF balance treated as yield inventory or speculative capital | SWF records and docs | Documentation only | Future review gate for any SWF logic |

## Treasury / Reserve Classification Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRC-01 | P0 | Treasury accounting labels must not create authority, value, backing, or unlock power. | Treasury budget, proposal, blocking, fiscal year, and accounting labels | Treasury record or label exists | Label is referenced by another layer | Label remains evidence/accounting context only | Reserve backing, authority, or value created by label | Treasury records and downstream state | `test/09_Treasury.test.js` | Future authority misuse tests |
| TRC-02 | P0 | Classification and reclassification must not create value, unlock value implicitly, or bypass governance. | Future reserve classification records and treasury/SWF/monetary surfaces | Source balance and target class proposed | Classification or reclassification considered | Requires authorized path and conservation boundary | Value creation, implicit unlock, governance bypass, or double-counting | Future classification records and balance evidence | Documentation only | Requires future storage design before tests |
| TRC-03 | P1 | Rejected, failed, stale, invalid, completed, or replayed classification records must not become fresh authorization. | Future classification records and audit evidence | Non-authorizing classification record exists | Record is replayed or referenced | No accounting, backing, unlock, or authority mutation | Duplicate backing or new authorization | Future classification state and event evidence | Documentation only | Requires future classification storage mapping |
| TRC-04 | P0 | Recognized reserve backing must not be double-counted across treasury, reserve, SWF, and monetary layers. | Treasury, reserve classification, SWF, and PahlaviToken reserve/supply surfaces | Candidate backing exists in one or more layers | Backing is counted for monetary constraint | Same value counted once only through authorized exact-once path | Double-counted backing or hidden capacity | Backing identity, source/target balance, token reserve state | Documentation only | Requires recognized backing identity model |

## Monetary Expansion Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON-01 | P0 | Monetary expansion must not exceed `LIQUIDITY_CAP`. | PahlaviToken supply and `LIQUIDITY_CAP` | Mint would exceed cap | Mint attempted | Attempt reverts or fails neutrally | Supply exceeds cap | Token total supply and cap constant | `test/02_pahlavi_token.test.js` | Future cross-layer cap bypass tests |
| MON-02 | P0 | Monetary expansion must preserve `MIN_RESERVE_RATIO`. | PahlaviToken reserves, supply, and ratio logic | Mint would be under-backed | Mint attempted | Attempt reverts or fails neutrally | Under-backed supply mutation | Token supply, reserve state, ratio check | `test/02_pahlavi_token.test.js` | Recognized backing class mapping |
| MON-03 | P0 | No hidden minting may occur through SWF, reclassification, emergency, oracle, API3, treasury, or replay paths. | PahlaviToken, SWF, treasury, classification, emergency, oracle/API3 records | Non-monetary record or label exists | Record/label is referenced for mint capacity | No mint capacity is created | Supply or mint eligibility changes through non-authority path | Token supply and related records | Partial: `test/02_pahlavi_token.test.js`, `test/03_sovereign_wealth_fund.test.js`, `test/23_Price_Oracle.test.js`, `test/09_api3_oracle.test.js` | Future cross-layer hidden minting tests |
| MON-04 | P0 | `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, thresholds, timeout constants, trigger codes, and constitutional constants must not become mutable config. | Kernel, PahlaviToken, governance constants | Constants are deployed | Future read or attempted mutation path | Constants remain unchanged and non-configurable | Mutable config or changed constants | Constant reads and deployment assertions | `test/01_kernel.test.js`, `test/02_pahlavi_token.test.js`, governance tests | Future global constant inventory |

## Oracle / API3 Evidence-Only Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ORA-01 | P0 | Oracle/API3 signals are evidence-only and must not autonomously mint, burn, classify, reclassify, freeze, unfreeze, unlock, reclaim, transfer, withdraw, or execute treasury actions. | PriceOracle and API3 bridge records | Oracle/API3 signal exists | Signal is submitted, read, or forwarded | Signal remains evidence/risk input only | Autonomous protected state mutation | Oracle/API3 records plus protected downstream state | `test/23_Price_Oracle.test.js`, `test/09_api3_oracle.test.js` | Future exhaustive downstream non-authority tests |
| ORA-02 | P1 | Stale oracle freshness checks must be state-neutral. | PriceOracle price, timestamp, validity, feeder state | Price data is stale | Freshness checked | Stored price, timestamp, validity, and feeder state remain unchanged | Freshness read mutates oracle state | Oracle storage reads | `test/23_Price_Oracle.test.js` | None for current surface |
| ORA-03 | P1 | Invalid oracle submissions must not mutate protected oracle state. | PriceOracle price and feeder state | Invalid price or confidence submitted | Submission attempted | Revert or fail without protected mutation | Stored price or feeder state mutated | Oracle state reads | `test/23_Price_Oracle.test.js` for zero price | Invalid confidence and unauthorized submission neutrality |
| ORA-04 | P1 | Duplicate API3 reports may remain auditable records but must not create duplicate privileged effects. | API3 reports, Kernel violations, TriggerProtocol execution records | Report already submitted or trigger already executed | Duplicate report/signature path occurs | Audit records may exist, but privileged effect is not duplicated | Duplicate trigger execution or protected mutation | API3, Kernel, TriggerProtocol records | `test/09_api3_oracle.test.js` | Broader duplicate-report authority tests |

## Cross-Layer Conservation Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLC-01 | P0 | Valid transitions must conserve value across treasury, reserve, SWF, reclaim, classification, and monetary layers. | Treasury, SWF, AssetFreeze, PahlaviToken, future classification records | Valid transition source and target exist | Transition executed through authorized path | Source and target accounting conserve value | Value created, destroyed, duplicated, or unlocked implicitly | Source/target balance and event evidence | Partial: `test/03_sovereign_wealth_fund.test.js`, `test/06_asset_freeze.test.js`, `test/02_pahlavi_token.test.js` | Future reserve classification and backing tests |
| CLC-02 | P0 | Failed cross-contract paths must not mutate remote protected state. | AssetFreeze to SWF, API3 to Kernel, TriggerProtocol to Treasury | Cross-contract call precondition fails | Cross-contract path attempted | Failure preserves all protected local and remote state | Local failure with remote accounting mutation | Both local and remote storage reads | `test/06_asset_freeze.test.js`, `test/09_api3_oracle.test.js` | Future TriggerProtocol/Treasury remote-state checks |
| CLC-03 | P0 | No double-counted backing across treasury, reserve, SWF, and monetary layers. | Treasury, SWF, reserve classification, PahlaviToken reserves/supply | Same value appears across multiple surfaces | Backing eligibility evaluated | Value counts once or is excluded | Same value counted as multiple backing sources | Backing identity and source records | Documentation only | Requires backing identity model |
| CLC-04 | P1 | Failed local neutrality must not mask remote mutation in another layer. | All connected cross-layer paths | Local call fails or reverts | Remote-dependent path attempted | No connected protected remote state mutates | Remote state changes despite local failure | Multi-contract state snapshots | Partial: `test/06_asset_freeze.test.js`, `test/09_api3_oracle.test.js` | Generalized cross-layer neutrality test matrix |

## Authority / Finality Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | P0 | Authority must not be created by labels, records, reports, signals, events, or accounting state. | Roles, modifiers, records, labels, and events | Evidence-only record or label exists | Record/label referenced for protected action | Action requires explicit existing authority path | Fresh authority created from evidence | Role state, protected state, event evidence | Partial across Step-3 tests | Future global non-authority tests |
| AUTH-02 | P0 | Human/governance authority remains final where required. | Freeze, release, emergency, classification, deployability, and monetary backing surfaces | Final authority required | Automation, oracle, label, or record attempts action | Action does not execute without required authority | Automation replaces final judgment | Role and action records | Documentation and partial access tests | Future final-authority test matrix |
| AUTH-03 | P1 | Exact-once authority consumption must hold for authorized effects. | SWF withdrawals, reclaim transfers, trigger executions, future classification/backing records | Authorization already consumed | Same authorization is reused | Reuse fails neutrally | Duplicate accounting, execution, backing, release, or supply effect | Consumed/ executed records | `test/01_kernel.test.js`, `test/03_sovereign_wealth_fund.test.js`, `test/06_asset_freeze.test.js`, `test/08_Trigger_Protocol.test.js` | Future classification/backing authority tests |
| AUTH-04 | P0 | TriggerProtocol records must not authorize unrelated treasury, reserve, SWF, classification, freeze, or monetary actions. | TriggerProtocol execution records and downstream surfaces | Trigger execution record exists | Record is referenced by unrelated action path | Record remains evidence-only outside its own effect | Unrelated protected action authorized | Trigger record and downstream state | `test/08_Trigger_Protocol.test.js` for immutability | Future unrelated-action negative tests |

## Failed-Path And Replay Invariants

| ID | Priority | Invariant | Runtime surface | Precondition | Action | Expected assertion | Forbidden mutation | Storage evidence | Current test evidence | Open gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FPR-01 | P1 | Failed, unauthorized, invalid, stale, zero-value, under-backed, over-cap, rejected, or replayed paths preserve protected state. | All protected runtime surfaces | Invalid or unauthorized path exists | Path attempted | Revert/fail or remain auditable without protected mutation | Protected state mutates | Before/after state snapshots | Broad Step-3 evidence across listed tests | Complete surface inventory |
| FPR-02 | P1 | Completed effects cannot replay into duplicate accounting, backing, supply, freeze, release, deployability, or authority effects. | TriggerProtocol, SWF, reclaim, future classification, monetary records | Completed effect exists | Effect replay attempted | Replay fails neutrally | Duplicate protected effect | Executed/completed records and balances | `test/01_kernel.test.js`, `test/03_sovereign_wealth_fund.test.js`, `test/06_asset_freeze.test.js`, `test/09_api3_oracle.test.js` | Future classification and backing replay tests |
| FPR-03 | P2 | Rejected, failed, stale, invalid, replayed, or completed records remain auditable but non-authorizing. | Events, records, failed states, duplicate reports | Non-authorizing record exists | Record is read or referenced | It remains evidence-only | Record becomes fresh authority | Record and downstream state | Partial: `test/09_api3_oracle.test.js`, `test/23_Price_Oracle.test.js` | Evidence-only audit test design |

## Forbidden Enforcement Assumptions

This Step-5.2 artifact forbids the following assumptions:

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
- Do not change storage as part of this artifact.
- Do not change tests as part of this artifact.
- Do not change architecture or governance assumptions.
- Do not introduce staking, lending, treasury yield, speculative deployment, DeFi yield, leverage, or capital-efficiency framing.
- Do not treat SWF/SRR-role labels as sovereign authority, mint capacity, reserve unlock authority, transfer authority, classification authority, or governance bypass capability.
- Do not allow hidden minting through SWF accounting, reserve reclassification, emergency reserves, oracle/API3 signals, treasury labels, or replayed execution.
- Do not allow double-counted backing across treasury, reserve, SWF, and monetary layers.
- Do not allow oracle-driven or API3-driven autonomous deposits, withdrawals, reclaim recognition, minting, burning, reserve classification, unlocking, freeze, unfreeze, transfer, or treasury execution.
- Do not automate final human/governance authority.
- Do not weaken reserve discipline, monetary constraints, treasury accounting constraints, classification constraints, cross-layer invariants, authority boundaries, storage boundaries, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Open Audit Questions

- Which executable invariants should become the first Step-5 test additions without changing architecture?
- Which P0 invariant gaps must be closed before any runtime enforcement work begins?
- Which storage surfaces need exact field-level mapping before executable assertions can be written?
- How should recognized backing identity be represented in future tests without double-counting across treasury, SWF, reserve, and monetary layers?
- Which events are sufficient to prove exact-once authority consumption?
- Which evidence-only records should receive explicit non-authority tests first?
- Which TriggerProtocol record misuse tests should be prioritized before treasury or reserve enforcement planning?
- Which Step-3 non-blocking oracle gaps should become P1 or P2 executable invariant tests?
- How should failed cross-contract paths be snapshot-tested to prove no remote protected mutation occurred?
- What later checkpoint should mark executable invariant coverage sufficient for implementation planning without claiming formal verification is complete?
