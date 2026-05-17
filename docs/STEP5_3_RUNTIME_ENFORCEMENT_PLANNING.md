# Step-5.3 Runtime Enforcement Planning

## Scope And Non-Goals

This document defines the Step-5.3 Runtime Enforcement Planning specification for IranOS. It is documentation only and does not change contracts, tests, storage, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, monetary constants, role assignments, or enforcement logic.

Step-5.3 classifies Step-3, Step-4, Step-5, Step-5.1, and Step-5.2 invariants by the future enforcement mode that may be appropriate: runtime enforcement, test enforcement, governance or human review, or event/audit evidence. It does not implement enforcement, write tests, redesign storage, or claim formal verification is complete.

IranOS is sovereign resilience infrastructure. Runtime enforcement planning exists to preserve constitutional execution, reserve discipline, monetary constraints, authority conservation, exact-once accounting, replay resistance, failed-path neutrality, and human/governance final authority. It is not a DeFi yield, staking, lending, treasury yield, speculative deployment, leverage, or capital-efficiency framework.

## Preserved Checkpoints

Step-5.3 preserves the following checkpoints:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 reserve, treasury accounting, reserve classification, monetary expansion, cross-layer conservation, and Sovereign Wealth Fund state transition assumptions remain preserved.
- Step-5 role and authority boundary assumptions remain preserved.
- Step-5.1 storage and invariant mapping assumptions remain preserved.
- Step-5.2 executable invariant matrix assumptions remain preserved.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle and API3 components remain evidence providers, not autonomous decision-makers.
- Human/governance authority remains final where reserve classification, freeze, emergency, release, deployability, or monetary backing decisions require final judgment.
- SWF means Sovereign Wealth Fund, and the IranOS SWF remains a sovereign reserve resilience layer (SRR-role), not a profit-maximizing sovereign investment vehicle.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-5.3 preserves Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

Step-5.3 also preserves Step-4 and Step-5 assumptions for reserve conservation, treasury accounting discipline, reserve classification governance, backing-bounded monetary expansion, cross-layer conservation, SWF exact-once accounting, replay resistance, failed-path neutrality, oracle/API3 evidence-only boundaries, authority conservation, storage label non-authority, executable invariant boundaries, and human/governance final authority.

## Runtime Enforcement Categories

- Runtime-Enforced: an invariant that may eventually be guarded directly in a contract execution path through existing authorization, validation, revert, state-check, or exact-once logic.
- Test-Enforced: an invariant that should be asserted in test coverage, including negative tests and before/after state snapshots, without necessarily adding runtime logic.
- Governance / Human-Review: an invariant that depends on final human or governance judgment and must not be replaced by automation.
- Event / Audit-Evidence: an invariant that should be evidenced through events, records, logs, reads, and audit trails without those records becoming authority.
- Runtime Assertion Boundary: the line between checking a condition and accidentally creating authority, value, backing, mint capacity, unlock power, or governance bypass.
- Deferred Enforcement: an invariant that should not be runtime-enforced until storage identity, recognized backing, or authority mapping is complete.

These categories are planning labels only. They do not authorize implementation.

## Runtime-Enforced Invariants

The following invariants are suitable candidates for future runtime enforcement when they already align with existing architecture and authority paths:

| Invariant | Future enforcement mode | Runtime surface | Enforcement purpose | Required preservation |
| --- | --- | --- | --- | --- |
| Unauthorized callers cannot execute protected paths | Runtime-enforced | Kernel, TriggerProtocol, SWF, Treasury, PahlaviToken, AssetFreeze, oracle contracts | Preserve explicit authority gates | No new roles, no governance redesign |
| Invalid inputs fail before privileged mutation | Runtime-enforced | Kernel, TriggerProtocol, JurySelection, AssetFreeze, SWF, Treasury, PahlaviToken, PriceOracle, API3 | Preserve failed-path neutrality | No protected mutation on failure |
| Zero-value accounting paths remain neutral | Runtime-enforced | SWF, Treasury, AssetFreeze, PahlaviToken, reclaim surfaces | Prevent value creation from empty input | No balance, backing, or authority mutation |
| Over-withdrawal and insufficient-balance paths remain neutral | Runtime-enforced | SWF and treasury-like accounting surfaces | Preserve accounting discipline | No partial debit, duplicate debit, or hidden credit |
| Executed withdrawals cannot replay accounting mutation | Runtime-enforced | SWF withdrawal execution state | Preserve exact-once accounting | Consumed authority remains consumed |
| Duplicate reclaim transfers cannot credit SWF twice | Runtime-enforced | AssetFreeze to SWF transfer path | Preserve reclaim replay resistance | No duplicate SWF credit |
| Minting cannot exceed `LIQUIDITY_CAP` | Runtime-enforced | PahlaviToken supply and cap checks | Preserve monetary constraint | `LIQUIDITY_CAP` remains immutable/non-configurable |
| Minting cannot violate `MIN_RESERVE_RATIO` | Runtime-enforced | PahlaviToken reserve and supply checks | Preserve reserve backing constraint | `MIN_RESERVE_RATIO` remains immutable/non-configurable |
| Emergency transfer restrictions remain explicit | Runtime-enforced | PahlaviToken emergency transfer path | Preserve emergency state boundary | Emergency state does not create mint or unlock authority |

Runtime enforcement must stay narrow. It should reject invalid or unauthorized mutations, not automate final governance decisions.

## Test-Enforced Invariants

The following invariants should first be asserted through tests or test planning before any runtime enforcement is considered:

| Invariant | Future enforcement mode | Runtime surface | Test purpose | Current evidence |
| --- | --- | --- | --- | --- |
| TriggerProtocol records do not authorize unrelated treasury, reserve, SWF, classification, freeze, or monetary actions | Test-enforced first | TriggerProtocol records and downstream surfaces | Prove records remain evidence-only outside their domain | `test/08_Trigger_Protocol.test.js` partially covers record immutability |
| SWF/SRR labels do not create authority or mint capacity | Test-enforced first | SWF balances, layer records, SRR-role labels, monetary surfaces | Prove SWF state remains accounting evidence only | Step-4.5 and Step-5 documentation only |
| Oracle/API3 records do not autonomously mutate protected downstream state | Test-enforced first | PriceOracle, API3, Kernel, monetary, treasury, SWF surfaces | Prove signal-only doctrine across protected domains | `test/23_Price_Oracle.test.js`, `test/09_api3_oracle.test.js` partially cover |
| Failed cross-contract paths do not mutate remote protected state | Test-enforced first | AssetFreeze/SWF, API3/Kernel, TriggerProtocol/Treasury | Prove remote-state neutrality | `test/06_asset_freeze.test.js`, `test/09_api3_oracle.test.js` partially cover |
| Storage labels do not create value, backing, authority, unlock power, or governance bypass | Test-enforced first | Treasury, SWF, classification, emergency, freeze labels | Prove label non-authority | Documentation only |
| Completed, rejected, failed, stale, invalid, or replayed records do not become fresh authority | Test-enforced first | Records, events, failed states, duplicate reports | Prove replay/finality authority boundary | Partial Step-3 test coverage |

Tests should precede runtime enforcement for these areas so enforcement design follows observed risks instead of inventing new architecture.

## Governance / Human-Review Invariants

The following invariants require governance or human review and must not be replaced by automation:

| Invariant | Review authority | Reason automation is forbidden | Evidence needed |
| --- | --- | --- | --- |
| Reserve classification approval | Human/governance authority | Classification affects backing and deployability | Source balance, target class, authority record, conservation evidence |
| Reserve reclassification approval | Human/governance authority | Reclassification could unlock or double-count value if automated | Source class, target class, authorization, debit/credit evidence |
| Freeze release | Human/governance or existing authorized path | Final freeze authority must remain outside automation | Freeze state, release authority, audit record |
| Emergency reserve use | Human/governance authority | Emergency state must remain bounded and judgment-driven | Emergency context, authority record, bounded use evidence |
| Deployability decisions for locked, frozen, encumbered, or pending value | Human/governance authority | Labels must not implicitly unlock value | Encumbrance state, release path, conservation evidence |
| Recognized backing admission | Human/governance or explicitly authorized classification path | Backing admission affects monetary expansion constraints | Classification record, exact-once backing recognition, exclusion checks |

Automation may surface signals, preserve audit trails, or enforce already-authorized transitions. It must not replace final human/governance judgment.

## Event / Audit-Evidence Invariants

The following invariants are appropriate for event or audit evidence, not autonomous execution authority:

| Invariant | Evidence surface | Audit purpose | Forbidden interpretation |
| --- | --- | --- | --- |
| Oracle/API3 reports remain evidence-only | Oracle records, bridge reports, feeder submissions, confidence/freshness data | Prove what evidence was available | Do not treat report as authority |
| Duplicate API3 reports remain auditable but non-duplicative | API3 and Kernel records | Prove duplicate report behavior | Do not create duplicate privileged effects |
| TriggerProtocol execution records remain immutable evidence | Trigger execution records and events | Prove execution history | Do not authorize unrelated actions |
| Jury votes and verdict records evidence jury finality | Jury pools, votes, commitments, verdict records | Prove case state and finality | Do not authorize treasury/reserve actions |
| SWF accounting records evidence authorized accounting | SWF balances, withdrawal records, reclaimed intake records | Prove exact-once accounting | Do not create reserve backing or mint capacity |
| Failed, rejected, stale, invalid, completed, or replayed records remain auditable | Failed/rejected records and events | Prove attempted path and neutrality | Do not become fresh authorization |

Audit evidence must remain separate from authority, value, backing, mint capacity, unlock power, and governance bypass.

## Runtime Assertion Boundaries

Runtime assertions must reject invalid state transitions without creating new sovereign authority.

Runtime assertions must not:

- Create mint capacity.
- Create reserve backing.
- Unlock locked, frozen, encumbered, pending, or SWF-linked value.
- Classify or reclassify reserves autonomously.
- Convert evidence into execution authority.
- Convert labels into deployable value.
- Replace final human/governance authority.
- Convert constants into mutable configuration.
- Introduce new architecture or role assumptions.

A runtime assertion may enforce an already-authorized transition boundary, access check, amount check, replay check, or failed-path neutrality condition. It must not decide final governance questions.

## Replay / Finality Enforcement Boundaries

Replay and finality enforcement should preserve consumed authority and completed effects.

Future enforcement planning may consider narrow guards for:

- Kernel post-threshold signature replay.
- TriggerProtocol duplicate or unauthorized execution.
- SWF executed withdrawal replay.
- AssetFreeze duplicate transfer to SWF.
- Reclaimed asset duplicate intake.
- Jury completed-case vote rejection.
- API3 duplicate report privileged-effect prevention.
- Future reserve classification or backing recognition replay, only after storage and authority mapping are complete.

Replay guards must not convert completed records into fresh authority. Completed, rejected, failed, stale, invalid, or replayed records may remain auditable but non-authorizing.

## Accounting Conservation Enforcement Boundaries

Accounting conservation enforcement must protect value without redesigning treasury or reserve architecture.

Future enforcement planning may consider:

- Exact-once SWF deposits, reclaimed intake, and withdrawals.
- Reclaim transfer atomicity between AssetFreeze and SWF.
- Over-withdrawal neutrality.
- Zero-value neutrality.
- Source/target balance conservation for any future reserve classification.
- Exclusion of locked, frozen, encumbered, pending, unclassified, rejected, invalid, or already-counted value from deployable backing.

Sensitive conservation enforcement must be deferred until recognized backing identity and reserve classification storage are formally mapped.

## Oracle / API3 Enforcement Boundaries

Oracle and API3 signals remain evidence-only and non-autonomous.

Runtime enforcement may validate oracle/API3 input paths, feeder authorization, invalid code rejection, zero offender rejection, duplicate handling, and atomic bridge failure behavior. Runtime enforcement must not allow oracle/API3 signals to autonomously:

- Mint or burn supply.
- Classify or reclassify reserves.
- Freeze or unfreeze assets.
- Unlock locked, frozen, encumbered, pending, or SWF-linked value.
- Reclaim assets.
- Transfer assets.
- Withdraw from the SovereignWealthFund.
- Recognize reserve backing.
- Execute treasury actions.
- Satisfy `MIN_RESERVE_RATIO`.
- Raise or bypass `LIQUIDITY_CAP`.
- Replace human/governance final authority.

Oracle/API3 evidence may inform review, risk state, and audit trails only.

## SWF / SRR-Role Enforcement Boundaries

SWF means Sovereign Wealth Fund. In IranOS, the SWF functions as a sovereign reserve resilience layer (SRR-role), not a profit-maximizing sovereign investment vehicle.

Future enforcement planning may consider narrow guards for:

- Authorized SWF deposits.
- Authorized reclaimed asset intake.
- Authorized withdrawals.
- Exact-once withdrawal execution.
- Over-withdrawal neutrality.
- Zero-value deposit and reclaim neutrality.
- Unauthorized deposit, reclaim, and withdrawal neutrality.
- Duplicate reclaim transfer neutrality.

SWF/SRR-role enforcement must not create:

- Governance authority.
- Sovereign authority.
- Reserve unlock authority.
- Transfer authority.
- Classification authority.
- Reclassification authority.
- Mint capacity.
- Burn authority.
- Treasury execution authority.
- Emergency authority.
- Governance bypass capability.

The SWF must not become a DeFi treasury, yield engine, speculative deployment layer, lending or staking mechanism, leverage vehicle, or capital-efficiency mechanism.

## Emergency / Freeze Enforcement Boundaries

Emergency and freeze enforcement must preserve final human/governance authority.

Runtime enforcement may preserve:

- Emergency transfer restrictions.
- Freeze state non-deployability.
- Release access control under existing assumptions.
- Invalid release rejection.
- Failed emergency or freeze path neutrality.

Runtime enforcement must not:

- Automate final freeze release judgment.
- Convert emergency state into mint capacity.
- Convert freeze labels into deployable value.
- Unlock, release, reclassify, mint, burn, transfer, or execute treasury actions from labels alone.
- Bypass `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, thresholds, timeout constants, trigger codes, Kernel assumptions, constitutional constants, or governance assumptions.

Freeze release, emergency reserve use, deployability, reserve classification, and recognized backing decisions remain final human/governance or explicitly authorized classification matters.

## Forbidden Enforcement Behaviors

The following enforcement behaviors are forbidden:

- Making the Kernel upgradeable.
- Weakening Kernel immutability.
- Changing thresholds.
- Changing timeout constants.
- Changing trigger codes.
- Changing constitutional constants.
- Changing `MIN_RESERVE_RATIO`.
- Changing `LIQUIDITY_CAP`.
- Converting monetary or constitutional constants into mutable configuration.
- Redesigning contracts as part of this artifact.
- Redesigning storage as part of this artifact.
- Changing tests as part of this artifact.
- Changing architecture or governance assumptions.
- Introducing staking, lending, treasury yield, speculative deployment, DeFi yield, leverage, or capital-efficiency framing.
- Treating SWF/SRR-role labels as sovereign authority, mint capacity, reserve unlock authority, transfer authority, classification authority, or governance bypass capability.
- Allowing hidden minting through SWF accounting, reserve reclassification, emergency reserves, oracle/API3 signals, treasury labels, or replayed execution.
- Allowing double-counted backing across treasury, reserve, SWF, and monetary layers.
- Allowing oracle-driven or API3-driven autonomous deposits, withdrawals, reclaim recognition, minting, burning, reserve classification, unlocking, freeze, unfreeze, transfer, or treasury execution.
- Automating final human/governance authority.
- Treating event or audit evidence as execution authority.
- Treating failed, rejected, stale, invalid, completed, or replayed records as fresh authorization.
- Claiming formal verification is complete.

## Enforcement Sequencing Recommendations

Recommended sequencing for future work:

1. Preserve documentation-only planning until enforcement candidates are fully classified.
2. Add tests before runtime enforcement for authority boundaries, evidence-only records, labels, replay paths, and failed-path neutrality gaps.
3. Start with narrow enforcement guards only where existing architecture already has a clear authority path and storage surface.
4. Prioritize P0 hidden minting, constant bypass, authority escalation, and double-counted backing risks.
5. Preserve P1 exact-once, replay, finality, and failed-path neutrality with before/after state assertions before introducing new runtime checks.
6. Keep reserve classification, recognized backing identity, and emergency reserve use deferred until storage, authority, and governance review paths are formally mapped.
7. Keep governance/human-review invariants outside automation.
8. Use event/audit evidence for traceability, but do not turn evidence into authority.
9. Treat formal-method preparation as a later evidence layer and do not claim verification before proofs exist.

## Implementation Risk Register

| Risk | Enforcement surface | Why it matters | Required planning control |
| --- | --- | --- | --- |
| Over-automation | Freeze, emergency, classification, backing, deployability | Automation could replace final human/governance authority | Keep these in governance/human-review category |
| Hidden minting | PahlaviToken, SWF, treasury, classification, emergency, oracle/API3 | Enforcement could accidentally create mint capacity | Prioritize negative tests and defer backing enforcement until identity is mapped |
| Double-counted backing | Treasury, reserve, SWF, monetary layers | Same value could satisfy backing more than once | Require backing identity and source/target conservation map |
| Authority escalation | Labels, records, events, oracle/API3, SWF/SRR state | Evidence could become authority | Test evidence-only behavior before runtime changes |
| Replay authority | TriggerProtocol, SWF, reclaim, classification, monetary paths | Completed effects could re-enter as fresh authority | Preserve consumed-authority and finality checks |
| Failed local / remote mutation mismatch | AssetFreeze/SWF, API3/Kernel, TriggerProtocol/Treasury | One layer could fail while another mutates | Require cross-contract snapshot tests first |
| Mutable constants | Kernel, PahlaviToken, governance constants | Constants could become config through enforcement design | Preserve immutable/non-configurable status in every plan |
| Runtime assertion overreach | Any guard added before mapping | Guard could change doctrine or architecture | Use narrow guards only after test and storage mapping |

## Open Audit Questions

- Which Step-5.2 P0 invariants should receive test coverage before any runtime enforcement is considered?
- Which current runtime checks already satisfy Step-5.3 runtime-enforced candidates without contract changes?
- Which event records are sufficient to audit exact-once authority consumption without becoming authority?
- Which evidence-only records need explicit non-authority tests first?
- How should recognized backing identity be mapped before any backing enforcement is implemented?
- Which reserve classification decisions must remain governance/human-reviewed even after storage mapping exists?
- Which failed cross-contract paths need before/after state snapshots before runtime guards are considered?
- What later checkpoint should authorize moving from planning to test additions without changing doctrine?
