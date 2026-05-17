# Step-5 Role And Authority Boundary Matrix

## Scope And Non-Goals

This document defines the Step-5 Role And Authority Boundary Matrix for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, monetary constants, or Step-3 and Step-4 invariant coverage.

Step-5 begins formal treasury and state transition enforcement planning by first separating authority from evidence, accounting state, labels, reports, records, and signals. It does not implement enforcement, redesign roles, alter access control, change governance assumptions, or claim formal verification is complete.

IranOS is sovereign resilience infrastructure. Authority boundaries exist to preserve constitutional execution, reserve discipline, monetary constraints, exact-once accounting, replay resistance, failed-path neutrality, and human/governance final authority. They are not a DeFi yield, staking, lending, treasury yield, speculative deployment, leverage, or capital-efficiency framework.

## Preserved Step-3 And Step-4 Assumptions

Step-5 preserves the following assumptions:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 sovereign reserve, treasury accounting, reserve classification, monetary expansion, cross-layer conservation, and Sovereign Wealth Fund state transition assumptions remain preserved.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle and API3 components remain evidence providers, not autonomous decision-makers.
- Human/governance authority remains final where reserve classification, freeze, emergency, release, deployability, or monetary backing decisions require final judgment.
- SWF means Sovereign Wealth Fund, and the IranOS SWF remains a sovereign reserve resilience layer (SRR-role), not a profit-maximizing sovereign investment vehicle.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-5 preserves Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

Step-5 also preserves Step-4 invariants for reserve conservation, treasury accounting discipline, reserve classification governance, backing-bounded monetary expansion, cross-layer conservation, SWF exact-once accounting, replay resistance, failed-path neutrality, oracle/API3 signal boundaries, and human/governance final authority.

## Authority Domain Definitions

- Authority Domain: a role, governance path, contract function, or final authorization process that is explicitly permitted to approve or execute a protected state transition.
- Human/Governance Authority: the final authority layer for decisions that affect freeze, release, emergency use, reserve classification, deployability, or monetary backing.
- Kernel Authority: the existing Kernel authority surface under immutable trigger and constitutional assumptions. Step-5 does not expand or redesign it.
- Trigger Execution Authority: the authority to execute a valid trigger through the existing authorized path. Trigger execution records do not create unrelated treasury, reserve, or monetary authority.
- Classification Authority: the human, governance, or explicitly authorized process permitted to approve reserve classification or reclassification.
- Treasury Execution Authority: the explicitly authorized path for treasury actions that change treasury state.
- SWF Accounting Authority: the explicitly authorized path for SovereignWealthFund deposits, withdrawals, reclaimed asset intake, and accounting state changes.
- Reclaim Authority: the explicitly authorized path for recovered assets to enter reclaim or SWF accounting exactly once.
- Monetary Authority: the explicitly authorized path for minting, burning, or supply changes, bounded by recognized reserve backing, `MIN_RESERVE_RATIO`, and `LIQUIDITY_CAP`.
- Freeze/Release Authority: the required human, governance, or Kernel-authorized path for freeze and release behavior under existing assumptions.
- Emergency Authority: the final human or governance-controlled path for emergency classification or bounded emergency reserve use.
- Exact-Once Authority Consumption: the rule that a valid authorization must be consumed once and only once for its specific approved effect.

Authority is specific to the approved transition. Authority for one domain must not be reused as authority for another domain unless that cross-domain authority is explicitly defined by existing doctrine and governance assumptions.

## Evidence-Only / Non-Authority Domains

The following domains may provide evidence, accounting context, auditability, review inputs, or state labels, but they do not create sovereign authority by themselves:

- Oracle signals.
- API3 bridge reports.
- Price, confidence, freshness, feeder, or risk data.
- Audit records.
- TriggerProtocol execution records.
- Kernel violation records.
- Treasury accounting labels.
- Reserve classification proposals.
- Pending classification or pending reclassification states.
- Rejected, failed, stale, invalid, replayed, or completed records.
- SWF records, layer balances, backing candidates, and SRR-role labels.
- Emergency labels.
- Freeze labels.
- Reclaim records before authorized exact-once accounting.
- Monetary eligibility calculations before authorized execution.

Evidence-only domains must not autonomously mint, burn, classify, reclassify, freeze, unfreeze, unlock, reclaim, transfer, withdraw, release, or execute treasury actions.

## Role Boundary Matrix

| Role or domain | May provide | May authorize | Must not do |
| --- | --- | --- | --- |
| Human/governance authority | Final judgment, approval, rejection, emergency and freeze decisions | Authorized classification, release, emergency use, deployability, and governance-controlled actions | Bypass Kernel immutability, constitutional constants, monetary constants, exact-once accounting, or conservation constraints |
| Kernel | Existing authorized Kernel behavior under immutable assumptions | Existing Kernel-authorized trigger, freeze, release, or role behavior already present in the system | Become upgradeable, alter constants, or create new authority outside existing assumptions |
| TriggerProtocol | Execution records, treasury blocking evidence, trigger history | Only the existing authorized trigger execution path | Authorize unrelated treasury, reserve, classification, SWF, or monetary actions |
| JurySelection | Jury selection, vote, verdict, and finality evidence | Existing verdict/finality behavior | Create treasury, reserve, monetary, SWF, freeze, or classification authority |
| AssetFreeze / reclaim | Freeze state, reclaim state, recovery evidence | Existing authorized freeze, release, confirmation, and reclaim-transfer paths | Implicitly unlock, mint, classify, reclassify, or duplicate reclaimed value |
| SovereignWealthFund / SWF | Accounting state, layer balances, deposit/withdrawal records, SRR-role evidence | Existing authorized SWF accounting actions only | Create governance authority, reserve unlock authority, mint capacity, transfer authority, classification authority, or governance bypass capability |
| Treasury | Treasury balances, budget records, accounting context | Existing authorized treasury execution paths | Treat labels, proposals, or records as reserve backing or fresh authority |
| Reserve classification | Classification review, source/target labels, audit trails | Only authorized classification or reclassification paths | Bypass governance, unlock value implicitly, create backing, or double-count reserves |
| PahlaviToken / monetary supply | Supply state and monetary accounting | Existing authorized mint/burn behavior bounded by monetary constraints | Bypass `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, reserve recognition, or authority checks |
| PriceOracle | Price, confidence, freshness, feeder evidence | No sovereign authority by signal alone | Autonomously mint, burn, classify, reclassify, freeze, unfreeze, unlock, transfer, withdraw, reclaim, or execute treasury actions |
| API3 bridge | Bridge reports and forwarded evidence | No sovereign authority by report alone | Convert reports into autonomous state mutation or unrelated authority |
| Automation | Audit preservation, reminders, checks, enforcement of already-authorized transitions | No final human/governance authority | Replace final judgment, classify, freeze, unfreeze, mint, burn, transfer, withdraw, reclaim, or execute treasury actions autonomously |

## Contract Boundary Matrix

| Contract or layer | Authority boundary | Evidence-only boundary | Preserved constraint |
| --- | --- | --- | --- |
| Kernel | Existing Kernel authority remains bounded by immutable trigger and constitutional assumptions | Violation records are evidence until processed through authorized paths | No Kernel upgradeability or constant mutation |
| TriggerProtocol | Executes only authorized Kernel-triggered paths | Execution records do not authorize unrelated actions | Execution record immutability and replay resistance |
| JurySelection | Existing finality behavior is limited to jury/verdict paths | Votes, pools, and verdict records do not authorize treasury or reserve effects | Completed cases reject later mutation |
| AssetFreeze | Existing freeze, confirmation, release, and reclaim authority remain bounded | Freeze and reclaim records do not create mint or classification authority | Reclaim atomicity and replay resistance |
| SovereignWealthFund | Authorized deposits, withdrawals, and reclaimed intake update accounting exactly once | SWF labels, balances, backing candidates, and SRR-role evidence do not create authority | No hidden minting, no reserve bypass, no yield framing |
| Treasury | Treasury execution must follow authorized treasury paths | Budget records, accounting labels, and proposals are not reserve backing by themselves | No label-based authority escalation |
| PahlaviToken | Mint/burn authority remains bounded by existing authorization, backing, and monetary constants | Supply state does not create backing authority | Preserve `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` |
| PriceOracle | No sovereign action authority from oracle data alone | Price, confidence, freshness, and feeder data are evidence-only | Stale, invalid, unauthorized, or repeated data remains neutral where required |
| API3 bridge | No sovereign action authority from bridge reports alone | Reports are audit and risk evidence | Duplicate or invalid reports must not create duplicate privileged effects |

## Oracle And API3 Signal Boundaries

Oracle and API3 signals are evidence-only. They may inform review, risk state, audit trails, or later human/governance consideration.

Oracle and API3 signals must not autonomously:

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

Stale, invalid, unauthorized, repeated, low-confidence, rejected, failed, replayed, or completed oracle/API3 records must not become fresh authority.

## SWF / SRR-Role Authority Boundaries

SWF means Sovereign Wealth Fund. In IranOS, the SWF functions as a sovereign reserve resilience layer (SRR-role) inside the broader sovereign reserve architecture. It supports reserve continuity, authorized accounting, conservation, and backing preservation.

The SWF/SRR-role does not create:

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

SWF accounting state may evidence deposits, withdrawals, reclaimed intake, layer balances, encumbrances, backing candidates, and reserve-backed balances. Those labels remain subordinate to authorized accounting, reserve classification, monetary expansion constraints, exact-once accounting, replay resistance, failed-path neutrality, and human/governance final authority.

The SWF must not become a DeFi treasury, yield engine, speculative deployment layer, lending or staking mechanism, leverage vehicle, or capital-efficiency mechanism.

## Treasury And Reserve Classification Authority Boundaries

Treasury and reserve classification authority must remain explicitly authorized and auditable.

- Treasury accounting labels do not create authority.
- Reserve classification labels do not create authority.
- Pending classification and pending reclassification states do not unlock value.
- Backing candidates do not count as recognized reserve backing.
- Classification or reclassification must not bypass governance authority.
- Classification or reclassification must debit and credit within the same conservation boundary.
- Classification or reclassification must not increase recognized value or backing capacity.
- Rejected classification records must not mutate recognized backing or deployable value.
- Completed classification records must not replay into duplicate backing.
- Treasury execution records must not become authority for unrelated reserve, SWF, or monetary actions.

Recognized reserve backing requires an authorized classification path and exact-once backing recognition. Accounting state, labels, reports, records, or review status are not sufficient by themselves.

## Freeze And Emergency Authority Boundaries

Freeze and emergency boundaries preserve final human/governance authority.

- Freeze labels do not make frozen value deployable.
- Emergency labels do not create mint capacity.
- Emergency reserve classification must remain bounded and auditable.
- Freeze or emergency state must not implicitly unlock, release, reclassify, mint, burn, transfer, or execute treasury actions.
- Release from frozen, locked, encumbered, or pending state requires the required authority and conservation checks.
- Emergency or freeze state must not bypass `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, thresholds, timeout constants, trigger codes, Kernel assumptions, constitutional constants, or governance assumptions.
- Automation may preserve audit trails or enforce already-authorized transitions, but it must not replace final human/governance judgment.

## Replay And Finality Authority Boundaries

Replay resistance must preserve authority finality. An authorization or completed effect may be consumed only for its specific approved transition and must not re-enter the system as fresh authority.

- Completed TriggerProtocol executions must not authorize unrelated treasury, reserve, SWF, classification, freeze, or monetary effects.
- Executed SWF withdrawals must not replay accounting mutation or withdrawal authority.
- Completed reclaimed asset intake must not replay into duplicate SWF or reserve accounting.
- Completed reserve classification must not replay into duplicate recognized backing.
- Completed reserve reclassification must not replay into duplicate backing or implicit unlocks.
- Completed monetary expansion effects must not replay into duplicate supply.
- Rejected, failed, stale, invalid, replayed, or completed records must not become fresh authority.
- Duplicate oracle/API3 reports may remain auditable records only and must not create duplicate privileged effects.
- A failed path in one layer must not leave an authorized mutation in another layer.

Exact-once authority consumption applies across deposits, withdrawals, reclaim transfers, classifications, reclassifications, backing recognition, freeze/release paths, emergency paths, and monetary effects.

## Forbidden Authority Escalations

The following authority escalations are forbidden:

- Treating oracle or API3 signals as autonomous authority.
- Treating audit records, trigger records, bridge reports, price records, confidence values, or freshness checks as sovereign authority.
- Treating SWF/SRR-role labels as governance authority, reserve unlock authority, mint capacity, transfer authority, classification authority, or governance bypass capability.
- Treating treasury accounting labels as deployable value, recognized backing, or authority.
- Treating reserve classification labels as a governance bypass.
- Treating backing candidates as recognized reserve backing.
- Treating emergency or freeze labels as release or unlock authority.
- Treating completed, rejected, failed, stale, invalid, or replayed records as fresh authority.
- Reusing authority for one approved domain as authority for another domain without explicit existing authorization.
- Replaying completed effects into duplicate accounting, backing, supply, freeze, release, or deployability effects.
- Converting `MIN_RESERVE_RATIO`, `LIQUIDITY_CAP`, thresholds, timeout constants, trigger codes, or constitutional constants into mutable configuration.
- Making the Kernel upgradeable or weakening Kernel immutability.
- Introducing DeFi yield, staking, lending, treasury yield, speculative deployment, leverage, or capital-efficiency assumptions.

## Initial Authority Invariants

| Invariant | Specification target |
| --- | --- |
| Authority conservation | Authority must not be created by crossing layers, labels, records, reports, signals, or accounting state. |
| Evidence non-authority | Oracle/API3 signals, audit records, trigger records, price data, and bridge reports remain evidence-only. |
| Human/governance finality | Human/governance authority remains final for freeze, release, emergency, classification, deployability, and monetary backing decisions where required. |
| SWF/SRR non-authority | SWF state and SRR-role labels do not create governance authority, unlock authority, mint capacity, transfer authority, classification authority, or bypass capability. |
| Oracle/API3 boundary | Oracle/API3 signals do not autonomously mint, burn, classify, reclassify, freeze, unfreeze, unlock, reclaim, transfer, withdraw, or execute treasury actions. |
| Classification authority boundary | Classification and reclassification labels do not bypass governance, create value, unlock value implicitly, or duplicate backing. |
| Freeze/emergency boundary | Freeze and emergency labels do not implicitly unlock, release, reclassify, mint, burn, transfer, or execute treasury actions. |
| Trigger record boundary | TriggerProtocol execution records do not authorize unrelated treasury, reserve, SWF, classification, freeze, or monetary actions. |
| Exact-once authority consumption | Valid authority is consumed once and only once for the specific approved transition. |
| Replay resistance | Completed, rejected, failed, stale, invalid, or replayed records cannot become fresh authority. |
| Failed-path authority neutrality | Failed or unauthorized paths must not create authority or leave authorized mutation in another layer. |
| Monetary constant preservation | `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` remain immutable, non-configurable, and not bypassed by authority mapping. |
| Constitutional preservation | Kernel immutability, thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged. |
| Step-3 preservation | Step-5 authority formalization does not weaken Step-3 runtime hardening invariants. |
| Step-4 preservation | Step-5 authority formalization remains subordinate to Step-4 reserve, accounting, classification, monetary, cross-layer, and SWF assumptions. |

## Open Audit Questions

- Which existing role assignments should be mapped to each authority domain without changing architecture?
- Which existing events or records prove exact-once authority consumption?
- Which existing records should be explicitly marked evidence-only during storage mapping?
- How should rejected, failed, stale, invalid, replayed, and completed records be represented so they cannot become fresh authority?
- Which future tests should prove TriggerProtocol records cannot authorize unrelated treasury, reserve, SWF, classification, freeze, or monetary actions?
- Which future tests should prove SWF/SRR-role labels cannot create governance authority, reserve unlock authority, mint capacity, or execution rights?
- Which Step-3 non-blocking oracle gaps should become Step-5 evidence-only authority tests?
- What storage mapping document should connect authority domains to existing roles, modifiers, records, and events without contract redesign?
