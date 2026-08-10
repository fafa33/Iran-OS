# IranOS Deployment Scripts

Executable implementation of the deployment sequence documented in
`docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` and
`docs/deployment/ROLE_WIRING_CHECKLIST.md`.

## Scope

This workflow deploys thirteen contracts: the core monetary/reserve path
(`IranOS_Kernel`, `Treasury`, `SovereignWealthFund`, `PahlaviToken`,
`API3Oracle`, `RecognizedReserveBacking`), `TriggerProtocol`, and six Layer 1
contracts (`VictimFund`, `ConstitutionGuard`, `JurySelection`,
`JusticeProtocol`, `CitizenCard`, `PriceOracle`).

The six Layer 1 contracts take `(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)` as
constructor arguments — `SOVEREIGN_ADDRESS` receives `DEFAULT_ADMIN_ROLE`
(a real signer, so post-deploy role wiring is reachable), while
`KERNEL_ADDRESS` records `KERNEL_ROLE`. Operational roles not yet backed by a
canonical configured address remain explicit post-deploy work rather than
being invented by this workflow.

`TriggerProtocol` is different: its authority path is complete in this
workflow. It is deployed against the canonical Kernel/Treasury/SWF addresses,
then activated only after Court completion. Treasury grants `KERNEL_ROLE` to
the TriggerProtocol **before** `Kernel.setTriggerProtocol()` is called. This
order is fail-closed: a threshold trigger is never allowed to target a
TriggerProtocol that cannot call `Treasury.blockAddressByTrigger()`.

**`PriceOracle`'s `FEEDER_ROLE` is not granted by this workflow.** The
manifest's Group 3 check depends on a `PRICE_FEEDER` address book variable not
listed in the canonical configuration table. Once a real feeder is chosen,
`SOVEREIGN_ADDRESS` can grant `FEEDER_ROLE` explicitly.

**Not included:** `AssetFreeze`, `ProductionOracle`, `PenalLabor`,
`Provincial`, `VotingSystem`, `Parliament`, `BudgetAllocation`,
`Fargard7PolicyAdapter`, `VelocityFee`, `BaseIncome`, `HealthCoverage`,
`DisabilitySupport`, `SovereignCrawler` — 13 deployable contracts remain
outside this workflow. The repository's canonical checkpoint already records
that the historical 25-contract denominator is stale: the direct deployable
contract count is 26. With TriggerProtocol included, executable deployment
coverage is therefore 13/26, subject to that documented denominator
reconciliation being propagated through older historical documents.

## Execution order

The filenames are grouped by contract/domain, not strict execution order.
Run `deploy/index.js` to execute everything in dependency-correct order:

```
kernel -> treasury -> swf -> trigger_protocol (deploy only) ->
victim_fund -> constitution_guard -> jury_selection -> justice_protocol ->
citizen_card -> price_oracle -> token -> oracle -> recognized_backing ->
roles (Court, Group A) -> trigger_protocol wiring
(Treasury KERNEL_ROLE first, Kernel pointer second) ->
finalize (Oracle activation, Group E — last) -> verify
```

```bash
npx hardhat run deploy/index.js --network <network>
```

Each script also remains independently runnable in dependency order. The
TriggerProtocol script is resumable: if deployment succeeds but safe wiring
fails, it persists `TRIGGER_PROTOCOL_ADDRESS`; re-running
`deploy/16_trigger_protocol.js` reuses that address and retries only the
wiring rather than orphaning another deployed TriggerProtocol.

Deployed addresses are persisted to `deploy/deployments/<network>.json`
(gitignored — network-specific output, not source) and read by subsequent
scripts.

## Required configuration

Set as environment variables before running (see
`docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` for the full address book):

| Variable | Description |
|---|---|
| `SOVEREIGN_ADDRESS` | Sovereign signing/admin address |
| `COURT_1` .. `COURT_9` | 9 distinct Constitutional Court member addresses |
| `ORACLE_INITIAL` | Placeholder oracle address (revoked in `08_finalize.js`) |
| `SWF_MULTISIG` | Multisig address passed to Kernel's constructor |
| `FEEDER_ADDRESSES` | Comma-separated API3Oracle feeder addresses |
| `RECOGNIZER_ADDRESS` | `RECOGNIZER_ROLE` holder on `RecognizedReserveBacking` |
| `INITIAL_RESERVES` | `PahlaviToken` constructor `_initialReserves` value |
| `ACKNOWLEDGE_RESERVE_RESET` | Optional explicit acknowledgement required for the documented nonzero-reserve reset case |

No addresses are hardcoded or defaulted — `deploy/config.js` throws if any
required variable is missing.

### TriggerProtocol activation boundary

`TriggerProtocol.executeTrigger()` is `onlyKernel` and calls
`Treasury.blockAddressByTrigger()`, which is protected by Treasury's
`KERNEL_ROLE`. Consequently activation has two independent preconditions:

1. the 9-member Court configuration is complete and distinct so the 7-of-9
   Kernel threshold is reachable; and
2. the deployed TriggerProtocol already holds Treasury `KERNEL_ROLE`.

`deploy/16_trigger_protocol.js` enforces both. It also verifies that the
TriggerProtocol constructor getters match the exact Kernel/Treasury/SWF
address book and refuses to overwrite a Kernel pointer that already references
a different TriggerProtocol.

The role is granted before the Kernel pointer is set. If pointer activation
fails after the role grant, the system remains safe because only the Kernel
contract can call `executeTrigger()` and the Kernel still has not activated
that TriggerProtocol. The step can then be retried without redeployment.

### Nonzero INITIAL_RESERVES

`kernel.setPahlaviRecognizedReserveBacking()` atomically replaces
`PahlaviToken.totalReserves` with the freshly-deployed
`RecognizedReserveBacking.recognizedBackingTotal()`. If `INITIAL_RESERVES` is
nonzero, `03_recognized_backing.js` requires
`ACKNOWLEDGE_RESERVE_RESET=true` before proceeding so the temporary reset is
an explicit operator decision rather than a silent side effect.

### Layer 1 admin binding

A hostile architecture review previously established that making the Kernel
contract the sole admin of Layer 1 contracts would make post-deploy role
management unreachable because Kernel has no generic call-forwarding path.
Those constructors therefore bind `DEFAULT_ADMIN_ROLE` to the Sovereign signer
and record `KERNEL_ROLE` against the Kernel address. This preserves reachable
administration without pretending the Kernel can originate arbitrary
transactions.

### Duplicate Court addresses

Court completion and final activation require 9 pairwise-distinct configured
addresses. `07_roles.js`, `16_trigger_protocol.js`, `08_finalize.js`, and
`09_verify.js` collectively ensure that the operational threshold is not
silently weakened by duplicate configuration.

### Resuming after a failed run

`deploy/index.js` persists the address book after successful deployment/wiring
steps. A mid-run failure therefore leaves an accurate record of already
created contracts. The orchestrated CLI refuses to start over when workflow
addresses already exist; operators must either continue with the individual
scripts or deliberately move/remove the address-book file before starting a
new full deployment.

## Signing

Calls gated by Sovereign/admin authority are sent using the network's first
configured signer. Real deployments must configure that signer to the intended
Sovereign custody path (hardware wallet/multisig or an equivalent controlled
signing process); these scripts do not implement custody infrastructure.
