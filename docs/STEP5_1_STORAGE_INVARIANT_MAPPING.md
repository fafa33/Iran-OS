# Step-5.1 Storage / Invariant Mapping

## Scope And Non-Goals

This document defines the Step-5.1 Storage / Invariant Mapping for IranOS. It is documentation only and does not change contracts, tests, architecture, storage layout, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, monetary constants, role assignments, or enforcement logic.

Step-5.1 maps doctrine, invariants, authority boundaries, accounting conservation, replay resistance, exact-once guarantees, and failed-path neutrality onto existing or expected runtime surfaces before implementation or enforcement changes are considered.

IranOS is sovereign resilience infrastructure. Storage and state mapping exists to preserve constitutional execution, reserve discipline, monetary constraints, authority conservation, exact-once accounting, replay resistance, failed-path neutrality, and human/governance final authority. It is not a DeFi yield, staking, lending, treasury yield, speculative deployment, leverage, or capital-efficiency framework.

This document does not implement enforcement and does not claim formal verification is complete.

## Preserved Checkpoints

Step-5.1 preserves the following checkpoints:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 reserve, treasury accounting, reserve classification, monetary expansion, cross-layer conservation, and Sovereign Wealth Fund state transition assumptions remain preserved.
- Step-5 role and authority boundary assumptions remain preserved.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle and API3 components remain evidence providers, not autonomous decision-makers.
- Human/governance authority remains final where reserve classification, freeze, emergency, release, deployability, or monetary backing decisions require final judgment.
- SWF means Sovereign Wealth Fund, and the IranOS SWF remains a sovereign reserve resilience layer (SRR-role), not a profit-maximizing sovereign investment vehicle.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-5.1 preserves Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

Step-5.1 also preserves Step-4 and Step-5 assumptions for reserve conservation, treasury accounting discipline, reserve classification governance, backing-bounded monetary expansion, cross-layer conservation, SWF exact-once accounting, replay resistance, failed-path neutrality, oracle/API3 evidence-only boundaries, authority conservation, and human/governance final authority.

## Storage / State Domain Definitions

- Storage Surface: a contract variable, mapping, struct, role assignment, event record, or derived view that stores or exposes runtime state.
- Runtime Surface: a storage surface, function path, modifier, event, role, test assertion, or cross-contract interaction where an invariant can be observed or violated.
- State Label: a stored or derived label such as pending, frozen, executed, rejected, emergency, recognized, or backing candidate. Labels do not create authority, value, mint capacity, unlock power, or governance bypass.
- Evidence Record: an event, audit record, oracle report, bridge report, trigger execution record, vote, verdict, price submission, or accounting record used to prove history. Evidence records do not become execution authority by themselves.
- Authority-Gated Surface: a runtime surface where a role, governance path, Kernel path, or final human/governance authorization gates a protected transition.
- Conservation Surface: a source/target accounting boundary where a valid transition must debit and credit value without creating value, destroying value, duplicating backing, or bypassing authority.
- Replay Surface: a storage or record boundary that prevents completed, rejected, failed, stale, invalid, or replayed records from becoming fresh authorization.
- Failed-Path Surface: a state boundary where failed, unauthorized, invalid, stale, zero-value, under-backed, over-cap, or replayed calls must preserve protected state.

## Runtime Surface Inventory

The initial mapping inventory covers these high-risk runtime surfaces:

- Kernel violation, signature, threshold, timeout, emergency, role, and trigger-facing state.
- TriggerProtocol execution records, treasury blocking state, public notification records, signature revocation records, and execution counters.
- JurySelection jury pools, votes, commitments, verdicts, finality state, and case completion records.
- AssetFreeze freeze records, confirmation state, total frozen value, reclaim transfer state, release state, and SWF transfer interactions.
- SovereignWealthFund balances, layer balances, withdrawal proposals, signatures, execution state, reclaimed asset intake, layer fill ratios, and total assets.
- Treasury budget lines, allocation state, transaction proposals, blocked addresses, fiscal year state, and treasury execution records.
- PahlaviToken supply, reserve tracking, `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, emergency state, mint paths, burn paths, and transfer paths.
- PriceOracle feeder submissions, price state, timestamp state, freshness state, confidence state, feeder accounting, and invalidation state.
- API3 bridge reports, feeder authorization, forwarded Kernel reports, duplicate reports, invalid report rejection, and atomic bridge failure behavior.
- Role assignments across Kernel, SWF, Treasury, AssetFreeze, oracles, governance, and monetary paths.
- Event evidence used to audit transitions without converting events into authority.

This inventory is a documentation map. It does not add, remove, rename, or redesign storage.

## Invariant-To-Storage Mapping

| Invariant | Storage/state surface | Protected transition | Forbidden mutation | Evidence source | Current test coverage | Open gap |
| --- | --- | --- | --- | --- | --- | --- |
| Kernel threshold resistance | Kernel violation/signature/threshold state | Court signatures below threshold remain non-executing | Partial signatures activating trigger execution | Kernel violation and signature records | `test/01_kernel.test.js` | Later map exact storage fields and emitted evidence |
| Kernel finality and replay resistance | Kernel signed violation and trigger-facing state | Post-threshold path executes once through authorized flow | Re-signing into duplicate trigger execution | Kernel and TriggerProtocol records | `test/01_kernel.test.js`, `test/09_api3_oracle.test.js` | Cross-contract finality evidence matrix |
| Kernel timeout explicitness | Kernel timeout/signature path state | Timeout path remains explicit | Timeout silently mutating unrelated state | Kernel state and test assertions | `test/01_kernel.test.js` | Storage-level timeout field mapping |
| Trigger execution neutrality | TriggerProtocol authorization and execution state | Unauthorized or zero-offender trigger attempt reverts neutrally | Failed trigger mutating treasury blocking or execution counters | TriggerProtocol events and execution records | `test/08_Trigger_Protocol.test.js` | Event-to-storage linkage |
| Trigger record boundary | TriggerProtocol execution records | Valid execution records are retained as evidence | Execution record authorizing unrelated treasury, reserve, SWF, classification, freeze, or monetary action | TriggerProtocol execution records | `test/08_Trigger_Protocol.test.js` | Future authority misuse tests |
| Jury finality | JurySelection pools, votes, verdicts, completed cases | Completed conviction/acquittal rejects later votes | Later votes mutating final verdict state | Jury vote/verdict records | `test/07_jury_selection.test.js` | Storage-level finality map |
| Reclaim atomicity | AssetFreeze reclaim state and SWF accounting | Failed SWF transfer reverts as one unit | Failed transfer mutating reclaim or SWF accounting state | AssetFreeze and SWF records | `test/06_asset_freeze.test.js` | Cross-contract revert evidence map |
| Reclaim replay resistance | AssetFreeze transfer state and SWF accounting | Duplicate transfer fails neutrally | Duplicate transfer crediting SWF twice | AssetFreeze transfer and SWF balance records | `test/06_asset_freeze.test.js` | Event replay matrix |
| SWF exact-once withdrawal | SWF withdrawal proposal/signature/execution state | Valid withdrawal updates accounting once | Executed withdrawal replaying accounting mutation | SWF withdrawal records and balances | `test/03_sovereign_wealth_fund.test.js` | Authority-consumption storage map |
| SWF reclaimed intake neutrality | SWF reclaimed asset intake and layer balance state | Authorized non-zero intake credits once | Unauthorized or zero-value intake mutating balances | SWF balance and reclaim records | `test/03_sovereign_wealth_fund.test.js` | Reclaim role mapping |
| Treasury accounting authority boundary | Treasury budget, proposal, blocking, and allocation state | Authorized treasury transitions follow treasury paths | Budget records, proposals, or blocked addresses becoming reserve authority | Treasury records and events | `test/09_Treasury.test.js` | Reserve-accounting link remains documentation-only |
| Monetary backing preservation | PahlaviToken reserves, supply, `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP` | Minting remains bounded by reserve and cap checks | Under-backed, over-cap, or label-based minting | Token supply and reserve state | `test/02_pahlavi_token.test.js` | Recognized backing class mapping |
| PriceOracle evidence-only boundary | PriceOracle price, timestamp, confidence, freshness, feeder state | Price reports update oracle state under oracle rules | Oracle state autonomously minting, classifying, freezing, unlocking, transferring, or executing treasury actions | Oracle records and feeder submissions | `test/23_Price_Oracle.test.js` | Invalid confidence and unauthorized submission neutrality |
| API3 bridge evidence-only boundary | API3 report records and forwarded Kernel evidence | Authorized feeder reports propagate as evidence | Bridge report becoming autonomous treasury, reserve, SWF, freeze, or monetary authority | API3 and Kernel records | `test/09_api3_oracle.test.js` | Invalid code/offender neutrality against all bridge state |
| No double-counted backing | Treasury, reserve classification, SWF, and monetary surfaces | Recognized backing counted once | Same value counted across treasury, SWF, reserve, and monetary layers | Future accounting and event evidence | Step-4 documentation only | Needs storage mapping before implementation |
| Authority conservation | Roles, modifiers, records, labels, and events | Authority remains tied to explicit authorized path | Evidence, labels, records, or SWF/SRR-role state creating fresh authority | Step-5 authority matrix and runtime records | Step-5 documentation only | Needs role-to-storage matrix |

## Authority-To-Storage Mapping

| Authority domain | Storage/state surface | Protected transition | Forbidden mutation | Evidence source | Current test coverage | Open gap |
| --- | --- | --- | --- | --- | --- | --- |
| Kernel authority | Kernel roles, violation state, emergency state, trigger-facing state | Existing Kernel-authorized behavior only | Kernel upgradeability, constant mutation, or new authority through storage labels | Kernel state and events | `test/01_kernel.test.js` | Exact role storage inventory |
| Human/governance authority | Governance roles and authorized decision paths | Final classification, emergency, release, deployability, and governance-controlled decisions | Automation or records replacing final judgment | Governance records and events | Covered indirectly across governance tests | Human/governance path matrix |
| Trigger execution authority | TriggerProtocol execution state | Authorized Kernel-triggered execution | Execution record authorizing unrelated actions | TriggerProtocol execution records | `test/08_Trigger_Protocol.test.js` | Negative tests for unrelated authority |
| Classification authority | Future classification records and authorized accounting path | Classification or reclassification after governance approval | Classification label bypassing governance or creating backing | Step-4.2 and future records | Documentation only | Requires storage design mapping before implementation |
| SWF accounting authority | SWF role assignments, withdrawal records, signatures, balances | Authorized deposits, withdrawals, and reclaimed intake | SWF/SRR-role label creating governance authority, mint capacity, unlock authority, or classification authority | SWF records and events | `test/03_sovereign_wealth_fund.test.js` | SRR-role remains documentation-only |
| Reclaim authority | AssetFreeze state, reclaim role, SWF reclaim intake | Authorized recovered asset transfer | Reclaim record creating value before exact-once accounting | AssetFreeze and SWF records | `test/06_asset_freeze.test.js` | Cross-contract evidence map |
| Monetary authority | PahlaviToken roles, supply, reserves, constants | Authorized mint/burn bounded by reserves and caps | Minting through labels, oracle reports, SWF records, or emergency state | Token supply and reserve state | `test/02_pahlavi_token.test.js` | Recognized reserve backing mapping |
| Oracle/API3 evidence domain | Oracle feeder state, price records, bridge reports | Evidence and risk signaling only | Oracle/API3 records becoming authority | Oracle and API3 records | `test/23_Price_Oracle.test.js`, `test/09_api3_oracle.test.js` | Evidence-only assertions for all protected domains |

Authority-to-storage mapping must preserve exact-once authority consumption. A valid authorization may be consumed once and only once for the specific approved transition.

## Evidence-Only Storage Boundaries

Evidence-only storage surfaces may support audit, risk review, reporting, or later human/governance consideration, but they must not create execution authority.

Evidence-only storage includes:

- Oracle price records, confidence values, freshness checks, feeder submissions, and invalidation records.
- API3 bridge reports, duplicate reports, invalid reports, and forwarded Kernel evidence.
- TriggerProtocol execution records outside their specific execution effect.
- Kernel violation records before or after authorized processing.
- Jury votes, pools, commitments, and verdict evidence outside their own finality domain.
- SWF balances, layer records, backing candidates, and SRR-role labels.
- Treasury budget records, proposals, blocked address records, and fiscal-year records.
- Reserve classification proposals, pending states, rejected states, failed states, completed states, and audit records.
- Event logs used for auditability.

Evidence-only records must not autonomously mint, burn, classify, reclassify, freeze, unfreeze, unlock, reclaim, transfer, withdraw, release, recognize backing, or execute treasury actions.

## Replay / Finality Storage Boundaries

Replay and finality boundaries prevent completed, rejected, failed, stale, invalid, or replayed records from becoming fresh authorization.

- Kernel post-threshold signature state must not replay trigger execution.
- TriggerProtocol execution records must remain immutable and must not authorize unrelated actions.
- JurySelection completed verdict state must reject later votes without mutating finality.
- AssetFreeze transferred/reclaimed state must prevent duplicate SWF credit.
- SWF executed withdrawal state must prevent duplicate accounting mutation.
- Reclaimed asset intake records must not replay into duplicate SWF or reserve accounting.
- Reserve classification and reclassification records, when later mapped, must not replay into duplicate backing or implicit unlocks.
- PahlaviToken expansion effects must not replay into duplicate supply.
- Oracle/API3 duplicate reports may remain auditable records only and must not create duplicate privileged effects.

Finality storage must be domain-specific. Finality in one domain does not create authority in another domain unless existing governance doctrine explicitly authorizes that path.

## Accounting Conservation Storage Boundaries

Accounting conservation requires each valid accounting transition to identify a source state, target state, authorization basis, conservation boundary, accounting effect, and evidence record.

The initial conservation storage surfaces are:

- SWF layer balances for deposits, withdrawals, reclaimed intake, and total assets.
- AssetFreeze freeze and reclaim state for recovered assets transferred into SWF accounting.
- Treasury budget, allocation, blocking, and proposal state for treasury accounting context.
- PahlaviToken supply and reserve state for monetary accounting.
- Future reserve classification records for recognized backing, backing candidates, rejected classifications, and reclassifications.

Conservation rules:

- Storage labels must not create value.
- Accounting records must not be counted as additional value.
- Classification or reclassification must debit and credit within the same conservation boundary.
- Reclaimed assets must enter SWF or reserve accounting only through authorized exact-once paths.
- SWF balances must not be double-counted across SWF, treasury, reserve, or monetary surfaces.
- Failed local paths must not leave successful remote accounting mutation in another layer.

## Monetary Constraint Storage Boundaries

Monetary constraint storage boundaries protect supply, reserves, backing, and monetary constants.

- `MIN_RESERVE_RATIO` remains immutable and non-configurable.
- `LIQUIDITY_CAP` remains immutable and non-configurable.
- PahlaviToken supply and reserve state must not be mutated by oracle records, SWF labels, treasury labels, emergency labels, freeze labels, classification proposals, or TriggerProtocol records.
- Recognized reserve backing must be mapped before any future enforcement work treats reserve state as backing.
- Encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted value must not count as deployable backing.
- Under-backed, over-cap, stale, invalid, unauthorized, or replayed expansion attempts must be state-neutral.
- Emergency state must not create temporary mint capacity.
- SWF deposits, withdrawals, or reclaimed intake must not create mint capacity except through authorized exact-once recognized backing paths.

No storage mapping may convert monetary constants into mutable configuration or introduce alternate monetary caps or ratios.

## Oracle / API3 Storage Boundaries

Oracle and API3 storage surfaces are evidence-only.

PriceOracle storage may include price, timestamp, validity, confidence, feeder submission, freshness, and invalidation state. API3 storage may include feeder authorization, report records, duplicate reports, forwarded Kernel evidence, and invalid report rejection state.

Oracle/API3 storage must not autonomously:

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

Stale, invalid, unauthorized, repeated, low-confidence, rejected, failed, replayed, or completed oracle/API3 records must not become fresh authorization.

## SWF / SRR-Role Storage Boundaries

SWF storage surfaces include balances, layer balances, withdrawal proposals, withdrawal signatures, execution state, reclaimed asset intake, layer fill ratios, total assets, and related event evidence.

The SWF/SRR-role supports reserve continuity, authorized accounting, conservation, and backing preservation. SWF storage and SRR-role labels do not create:

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

SWF storage must preserve:

- Exact-once deposits.
- Exact-once reclaimed intake.
- Exact-once withdrawals.
- Over-withdrawal neutrality.
- Unauthorized deposit and reclaim neutrality.
- Zero-value deposit and reclaim neutrality.
- Withdrawal replay resistance.
- Reclaim replay resistance.
- No direct reserve backing without authorized classification.
- No double-counted backing across SWF, treasury, reserve, or monetary layers.
- No hidden minting through SWF accounting.

The SWF must not become a DeFi treasury, yield engine, speculative deployment layer, lending or staking mechanism, leverage vehicle, or capital-efficiency mechanism.

## Failed-Path Neutrality Storage Boundaries

Failed-path neutrality requires protected state to remain unchanged after failed, unauthorized, invalid, stale, zero-value, under-backed, over-cap, rejected, or replayed paths.

The initial failed-path surfaces are:

- Kernel invalid oracle, invalid violation code, invalid offender, unauthorized access, partial threshold, post-threshold replay, and timeout paths.
- TriggerProtocol unauthorized execution and zero-offender paths.
- JurySelection wrong-size, duplicate, non-VRF, duplicate vote, invalid juror, empty proof, and completed-case paths.
- AssetFreeze unauthorized freeze, zero-value freeze, duplicate freeze, duplicate transfer, failed transfer, and unauthorized release paths.
- SWF unauthorized deposit, zero deposit, unauthorized reclaim, zero reclaim, over-withdrawal, duplicate withdrawal, and replayed withdrawal paths.
- Treasury unauthorized budget, over-budget, zero-value, unauthorized proposal, blocked-address, and fiscal-year invalid paths.
- PahlaviToken unauthorized mint/burn, over-cap mint, under-backed mint, zero-reason mint, emergency transfer block, and invalid transfer paths.
- PriceOracle stale read, zero price, repeated feeder, invalid confidence, unauthorized feeder, and invalidation paths.
- API3 non-feeder, invalid code, invalid offender, duplicate report, and atomic bridge failure paths.

Failed-path storage requirements:

- Failed paths must not create authority.
- Failed paths must not create value or backing.
- Failed paths must not mutate protected accounting state.
- Failed local paths must not leave successful remote mutation.
- Failed records must not become fresh authorization.
- Reverted or rejected paths may remain auditable only when existing behavior records them, and those records remain evidence-only.

## Forbidden Storage Behaviors

The following storage behaviors are forbidden:

- Adding mutable storage for Kernel immutability, constitutional constants, thresholds, timeout constants, trigger codes, `MIN_RESERVE_RATIO`, or `LIQUIDITY_CAP`.
- Treating storage labels as authority, value, mint capacity, unlock power, transfer power, classification authority, or governance bypass.
- Treating evidence-only records as execution authority.
- Treating failed, rejected, stale, invalid, completed, or replayed records as fresh authorization.
- Treating TriggerProtocol execution records as authority for unrelated treasury, reserve, SWF, classification, freeze, or monetary actions.
- Treating oracle/API3 storage as autonomous sovereign authority.
- Treating SWF/SRR-role storage as governance authority, reserve unlock authority, mint capacity, classification authority, or execution rights.
- Treating emergency or freeze labels as implicit unlock or release authority.
- Treating treasury labels, budget records, or proposals as recognized reserve backing.
- Treating backing candidates as recognized backing.
- Double-counting backing across treasury, reserve, SWF, and monetary storage surfaces.
- Letting failed local neutrality mask remote mutation in another storage surface.
- Introducing DeFi yield, staking, lending, treasury yield, speculative deployment, leverage, or capital-efficiency assumptions.
- Claiming formal verification is complete.

## Implementation Risk Register

| Risk | High-risk surface | Why it matters | Required mitigation before implementation |
| --- | --- | --- | --- |
| Label-to-authority escalation | Treasury, classification, SWF, emergency, freeze labels | Labels could be mistaken for authorization | Map each label to explicit non-authority status and required authority path |
| Hidden minting | PahlaviToken, SWF, treasury, reserve classification, emergency state | Supply could expand through indirect backing or replay paths | Map recognized backing, excluded backing, caps, and failed expansion neutrality |
| Double-counted backing | Treasury, SWF, reserve, monetary storage | Same value could be counted more than once | Define source/target conservation boundary and backing identity |
| Oracle/API3 authority leakage | PriceOracle and API3 records | Evidence could be misread as sovereign action authority | Mark all oracle/API3 storage as evidence-only and map prohibited effects |
| Replay-generated authority | TriggerProtocol, SWF, reclaim, classification, monetary records | Completed effects could re-enter as fresh authorization | Map finality fields and consumed-authority evidence |
| Failed local / remote mutation mismatch | AssetFreeze to SWF, API3 to Kernel, TriggerProtocol to Treasury | One layer could fail while another mutates | Map atomicity expectations and cross-contract revert evidence |
| Mutable doctrine constants | Kernel, PahlaviToken, governance constants | Constants could become configurable through future storage | Preserve constants as immutable/non-configurable in every mapping |
| SWF/SRR-role confusion | SovereignWealthFund storage and labels | SWF role could be mistaken for investment or governance authority | Preserve SWF as SRR-role only and forbid yield/capital-efficiency framing |
| Incomplete test evidence | Future classification and backing surfaces | Documentation may outpace executable coverage | Mark gaps explicitly before enforcement work |

## Open Audit Questions

- Which exact storage variables in each contract should be listed in the next detailed storage inventory?
- Which role assignments and modifiers gate each authority domain without changing architecture?
- Which events are sufficient evidence for exact-once authority consumption?
- Which emitted events are evidence-only and must not be interpreted as authority?
- How should recognized backing identity be represented without double-counting across treasury, SWF, reserve, and monetary surfaces?
- Which future tests should prove storage labels cannot create authority, value, unlock power, mint capacity, or governance bypass?
- Which future tests should prove TriggerProtocol records cannot authorize unrelated treasury, reserve, SWF, classification, freeze, or monetary actions?
- Which Step-3 non-blocking oracle gaps should become Step-5.1 storage neutrality tests?
- What storage-level evidence is required before reserve classification enforcement can be implementation-ready?
- How should failed cross-contract calls prove no protected remote state mutation occurred?
