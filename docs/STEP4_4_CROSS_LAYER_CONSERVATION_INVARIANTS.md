# Step-4.4 Cross-Layer Conservation Invariants

## Scope And Non-Goals

This document defines the Step-4.4 Cross-Layer Conservation Invariants for IranOS. It is documentation only and does not change contracts, tests, architecture, thresholds, timeout constants, trigger codes, Kernel assumptions, governance assumptions, monetary constants, or Step-3 runtime hardening coverage.

Step-4.4 connects the Step-4 Sovereign Reserve Model, Step-4.1 Treasury Accounting Rules, Step-4.2 Reserve Classification Protocol, and Step-4.3 Monetary Expansion Constraints into a single cross-layer invariant map. It does not implement enforcement and does not claim formal verification is complete.

IranOS is sovereign resilience infrastructure. Cross-layer conservation exists to preserve value, reserve backing, authority boundaries, exact-once accounting, failed-path neutrality, and replay resistance. It is not a DeFi yield, staking, lending, treasury yield, speculative deployment, or capital-efficiency framework.

## Preserved Checkpoints

Step-4.4 preserves the following checkpoint assumptions:

- Step-3 runtime hardening is closed and remains the current test-backed runtime baseline.
- Step-4 sovereign reserve formalization has started but is not complete.
- Step-4.1 treasury accounting rules remain the accounting baseline.
- Step-4.2 reserve classification protocol remains the classification baseline.
- Step-4.3 monetary expansion constraints remain the monetary expansion baseline.
- Kernel authority and immutable trigger assumptions remain unchanged.
- Existing thresholds, timeout constants, trigger codes, constitutional constants, and governance assumptions remain unchanged.
- `MIN_RESERVE_RATIO` remains unchanged and non-configurable.
- `LIQUIDITY_CAP` remains unchanged and non-configurable.
- Oracle and API3 components remain signal providers, not decision-makers.
- Human final freeze authority remains outside automation.
- Runtime hardening evidence remains test-based and should not be read as completed formal verification.

Step-4.4 preserves the Step-3 invariant areas for Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, and API3 bridge behavior.

## Cross-Layer Boundary Definitions

- Cross-Layer Conservation Boundary: the perimeter across Kernel, TriggerProtocol, JurySelection, AssetFreeze, Treasury, SovereignWealthFund, monetary supply, reserve classification, oracle signals, emergency state, freeze state, and human/governance authority where value, backing, and authority must not be created by movement between layers.
- Value Boundary: the accounting perimeter that ensures treasury, reserve, SovereignWealthFund, reclaim, classification, and monetary layers do not create or destroy value through labels, records, failed calls, or replayed calls.
- Backing Boundary: the subset of recognized reserve value eligible to constrain monetary expansion after excluding encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted value.
- Authority Boundary: the separation between signal, review, recommendation, authorization, execution, and accounting mutation.
- Oracle/API3 Signal Boundary: the separation between oracle or bridge evidence and sovereign action.
- Emergency/Freeze Boundary: the separation between emergency or freeze state and any unlock, release, reclassification, mint, burn, transfer, or treasury execution.
- Exact-Once Boundary: the requirement that valid deposits, withdrawals, reclaim transfers, classifications, reclassifications, and backing-affecting effects apply once and only once.
- Replay Boundary: the requirement that completed or rejected effects cannot be replayed into duplicate accounting, execution, backing, supply, freeze, or release effects.

## Connected Layers

The initial cross-layer invariant map connects:

- Kernel.
- TriggerProtocol.
- JurySelection.
- AssetFreeze / reclaim.
- Treasury.
- SovereignWealthFund.
- PahlaviToken / monetary supply.
- PriceOracle.
- API3 bridge.
- Reserve classification state.
- Treasury accounting state.
- Monetary expansion state.
- Emergency and freeze state.
- Human and governance authority layer.

These layers may exchange signals, records, authorizations, accounting effects, or execution effects only within the boundaries defined by prior Step-3 and Step-4 artifacts.

## Conservation Surfaces

Cross-layer conservation applies across the following surfaces:

- Treasury to reserve accounting.
- Reserve classification to monetary backing.
- Reclaim to AssetFreeze to SovereignWealthFund accounting.
- SovereignWealthFund accounting to recognized reserve backing.
- Monetary expansion to recognized reserve backing.
- Oracle/API3 signal propagation to Kernel and TriggerProtocol behavior.
- TriggerProtocol execution to treasury blocking and execution records.
- Emergency/freeze state to deployability and release authority.
- Failed paths to protected state across all connected layers.
- Replayed paths to protected state across all connected layers.

Each surface must preserve value, backing discipline, authority boundaries, exact-once accounting, failed-path neutrality, and replay resistance.

## Value Conservation Invariants

Value conservation must hold across treasury, reserve, SovereignWealthFund, reclaim, classification, and monetary layers.

- Classification and reclassification must debit and credit inside the same conservation boundary.
- Reserve classification must not create value.
- Reserve reclassification must not create value.
- Treasury accounting labels must not create value.
- SovereignWealthFund accounting records must not create value.
- Reclaim records must not create value unless authorized exact-once accounting credits the value.
- Monetary expansion must not create unbacked value outside recognized reserve backing constraints.
- Emergency and freeze states must not create, unlock, release, or destroy value implicitly.
- Audit records, oracle records, bridge records, trigger records, and classification proposals must not be interpreted as value.

## Backing Conservation Invariants

Reserve backing must remain conserved across treasury, reserve, SovereignWealthFund, classification, and monetary layers.

- Reserve backing must not be double-counted across treasury, reserve, SovereignWealthFund, or monetary supply.
- Recognized reserve backing must pass authorized classification before it constrains monetary expansion.
- Encumbered, frozen, locked, pending, unclassified, rejected, invalid, or already-counted value must not count as deployable backing.
- Reclassification must not increase backing capacity.
- Emergency reserve use must not create temporary or implicit mint capacity.
- SovereignWealthFund deposits must not create backing except through authorized exact-once recognized backing paths.
- Reclaimed assets must enter reserve or SovereignWealthFund accounting only through authorized exact-once paths.
- `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` must remain unchanged, non-configurable, and not bypassed through another layer.

## Authority Conservation Invariants

Authority must not be created by crossing layers.

- Oracle and API3 signals may cross layers only as evidence or risk inputs.
- Oracle and API3 signals must not become autonomous authority to mint, burn, classify, reclassify, unlock, freeze, unfreeze, transfer, or execute treasury actions.
- Automation may preserve audit trails or enforce already-authorized transitions, but it must not replace human or governance authority.
- Human or governance authority remains final for freeze, release, emergency classification, and deployability decisions.
- Kernel immutability, trigger assumptions, thresholds, timeout constants, trigger codes, constitutional constants, `MIN_RESERVE_RATIO`, and `LIQUIDITY_CAP` must not become mutable through cross-layer procedures.
- TriggerProtocol execution records must not create authority for unrelated treasury, reserve, monetary, or classification mutations.

## Exact-Once Accounting Invariants

Exact-once accounting must hold across connected layers.

- Valid SovereignWealthFund deposits must apply accounting effects once and only once.
- Valid SovereignWealthFund withdrawals must apply accounting effects once and only once.
- Valid reclaim transfers must apply accounting effects once and only once.
- Valid reserve classification must apply accounting effects once and only once.
- Valid reserve reclassification must apply accounting effects once and only once.
- Valid recognized backing effects must apply once and only once.
- A completed accounting effect must not be replayed through another layer into duplicate value, backing, supply, freeze, release, or deployability effects.
- Audit records must not be counted as accounting effects.

## Failed-Path Neutrality Invariants

Failed, unauthorized, stale, invalid, zero-value, under-backed, over-cap, or replayed paths must preserve protected state across all connected layers.

- A failed path in one layer must not leave a successful accounting mutation in another layer.
- Unauthorized paths must not mutate treasury, reserve, SovereignWealthFund, monetary, classification, freeze, or trigger state outside the existing authorized behavior.
- Zero-value paths must not create value or backing.
- Under-backed expansion paths must not mutate supply or backing.
- Over-cap expansion paths must not mutate supply or backing.
- Stale or invalid oracle/API3 paths must not mutate protected reserve, treasury, monetary, or classification state.
- Failed reclaim transfers must preserve reclaim state and SovereignWealthFund accounting.
- Failed classification or reclassification must preserve recognized backing and deployability state.
- Failed emergency or freeze-related paths must not unlock, mint, reclassify, release, or transfer value.

## Replay Resistance Invariants

Replay resistance must hold across TriggerProtocol, SovereignWealthFund, reclaim, classification, and monetary paths.

- TriggerProtocol executions must not be replayed into duplicate treasury, reserve, freeze, or monetary effects.
- SovereignWealthFund withdrawals must not be replayed into duplicate accounting mutation.
- Reclaim transfers must not be replayed into duplicate SovereignWealthFund or reserve accounting.
- Reserve classifications must not be replayed into duplicate recognized backing.
- Reserve reclassifications must not be replayed into duplicate backing or implicit unlocks.
- Monetary expansion effects must not be replayed into duplicate supply.
- Oracle/API3 duplicate reports may remain auditable records only and must not create duplicate privileged effects.
- Completed or rejected paths must not be reintroduced through another layer as fresh authority.

## Oracle Signal Boundary Invariants

Oracle and API3 signals are evidence or risk inputs only.

- Oracle/API3 signals may inform review, risk state, audit trails, or later human/governance consideration.
- Oracle/API3 signals must not autonomously mint or burn supply.
- Oracle/API3 signals must not autonomously classify or reclassify reserves.
- Oracle/API3 signals must not autonomously unlock, freeze, unfreeze, transfer, or execute treasury actions.
- Oracle/API3 signals must not increase recognized reserve backing.
- Oracle/API3 signals must not satisfy `MIN_RESERVE_RATIO`.
- Oracle/API3 signals must not raise or bypass `LIQUIDITY_CAP`.
- Stale, invalid, unauthorized, repeated, or low-confidence signals must preserve Step-3 neutrality assumptions where applicable.

## Emergency And Freeze Boundary Invariants

Emergency and freeze state must not implicitly unlock, mint, reclassify, or release value.

- Freeze state must not make frozen value deployable.
- Emergency state must not create mint capacity.
- Emergency reserve classification must remain bounded and auditable.
- Emergency/freeze state must not bypass human or governance authority.
- Emergency/freeze state must not bypass `MIN_RESERVE_RATIO` or `LIQUIDITY_CAP`.
- Emergency/freeze state must not cause reserve reclassification without required authority.
- Release from frozen, locked, encumbered, or pending state must preserve value and backing conservation.
- Human or governance authority remains final for freeze release and emergency reserve decisions.

## Forbidden Cross-Layer Behaviors

The following cross-layer behaviors are forbidden:

- Hidden minting through treasury accounting, SovereignWealthFund accounting, reserve classification, reserve reclassification, emergency reserve use, oracle signal, API3 bridge report, or replayed execution.
- Double-counting backing between treasury, reserve, SovereignWealthFund, and monetary layers.
- Treating an oracle signal, price, confidence, freshness check, bridge report, audit record, trigger record, or classification proposal as reserve backing.
- Letting automation replace final human freeze authority or governance authority.
- Unlocking locked, frozen, encumbered, pending, or unclassified value through reclassification side effects.
- Replaying SovereignWealthFund withdrawals, reclaim transfers, TriggerProtocol executions, classifications, reclassifications, or expansion effects into a second accounting mutation.
- Allowing failed local neutrality to mask remote accounting mutation in another layer.
- Changing Kernel immutability, constitutional constants, thresholds, timeout constants, trigger codes, `MIN_RESERVE_RATIO`, or `LIQUIDITY_CAP`.
- Introducing staking, lending, treasury yield, speculative deployment, DeFi yield, or capital-efficiency assumptions.

## Initial Cross-Layer Invariant Matrix

| Invariant | Connected layers | Specification target |
| --- | --- | --- |
| Value conservation | Treasury, reserve, SovereignWealthFund, reclaim, classification, monetary | Valid transitions must not create value across layers. |
| Backing conservation | Treasury, reserve, SovereignWealthFund, monetary | Reserve backing must not be double-counted or created through labels. |
| Classification conservation | Treasury, reserve classification, monetary | Classification and reclassification debit and credit within one conservation boundary. |
| Monetary constraint preservation | Monetary, reserve, treasury, SovereignWealthFund | `MIN_RESERVE_RATIO` and `LIQUIDITY_CAP` remain unchanged, non-configurable, and not bypassed. |
| Exact-once accounting | SovereignWealthFund, reclaim, classification, monetary backing | Valid accounting effects apply once and only once. |
| Failed-path neutrality | All connected layers | Failed paths must not mutate protected state in any connected layer. |
| Replay resistance | TriggerProtocol, SovereignWealthFund, reclaim, classification, monetary | Completed effects cannot be replayed into duplicate effects. |
| Oracle/API3 boundary | PriceOracle, API3 bridge, Kernel, reserve, treasury, monetary | Signals cross layers only as evidence or risk inputs. |
| Emergency/freeze boundary | AssetFreeze, Kernel, treasury, reserve, monetary, human/governance authority | Emergency and freeze state do not implicitly unlock, mint, release, or reclassify value. |
| Authority conservation | Oracle/API3, automation, Kernel, human/governance, treasury, reserve | Authority does not arise from signals, records, or automation. |
| Step-3 preservation | Kernel, TriggerProtocol, JurySelection, AssetFreeze, SovereignWealthFund, PriceOracle, API3 bridge | Step-4.4 does not weaken Step-3 runtime hardening invariants. |
| Step-4 preservation | Reserve model, treasury accounting, classification, monetary constraints | Step-4.4 remains subordinate to prior Step-4 formalization artifacts. |

## Forbidden Assumptions

This Step-4.4 artifact forbids the following assumptions:

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
- Do not introduce staking, lending, treasury yield, speculative deployment, DeFi yield, or capital-efficiency framing.
- Do not treat SovereignWealthFund balances as speculative capital or expansion inventory.
- Do not allow hidden minting through treasury accounting, SovereignWealthFund accounting, reserve reclassification, emergency reserves, oracle signals, API3 bridge reports, or replayed execution.
- Do not allow oracle-driven or API3-driven autonomous minting, burning, reserve classification, unlocking, freeze, unfreeze, transfer, or treasury execution.
- Do not automate final human or governance authority.
- Do not weaken reserve discipline, monetary constraints, treasury accounting constraints, classification constraints, or Step-3 runtime hardening invariants.
- Do not claim formal verification is complete.

## Open Audit Questions

- Which existing events or records are sufficient to prove cross-layer exact-once accounting?
- Which future tests should assert that failed local paths do not mutate remote accounting state?
- How should cross-layer invariant evidence be grouped by Kernel, TriggerProtocol, AssetFreeze, SovereignWealthFund, PriceOracle, API3 bridge, and monetary tests?
- Which Step-3 non-blocking oracle gaps should become cross-layer neutrality tests?
- How should recognized backing be mapped across treasury, reserve, SovereignWealthFund, and monetary layers without double-counting?
- What evidence is required to prove emergency or freeze state cannot implicitly unlock, mint, release, or reclassify value?
- Which replay paths should be modeled first for formal-method preparation?
- What later checkpoint document should link these invariants to executable tests without changing doctrine?
