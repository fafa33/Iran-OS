# IranOS Deployment Scripts

Executable implementation of the core monetary/reserve deployment sequence
documented in `docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` and
`docs/deployment/ROLE_WIRING_CHECKLIST.md`.

## Scope

This deploys six contracts and wires the reserve accounting path between
them: `IranOS_Kernel`, `Treasury`, `SovereignWealthFund`, `PahlaviToken`,
`API3Oracle`, `RecognizedReserveBacking`.

**Not included:** `TriggerProtocol`, `AssetFreeze`, `VictimFund`,
`ConstitutionGuard`, `JurySelection`, `JusticeProtocol`, `CitizenCard`,
`PriceOracle`, `ProductionOracle`, `PenalLabor`, `Provincial`,
`VotingSystem`, `Parliament`, `BudgetAllocation`, `Fargard7PolicyAdapter`,
`VelocityFee`, `BaseIncome`, `HealthCoverage`, `DisabilitySupport`,
`SovereignCrawler` — these 19 contracts are documented in the manifest
(§2/§3, all 25/25 contracts) but are outside this workflow's scope. Their
deploy scripts remain an open item.

## Execution order

The filenames are grouped by contract/domain, not strict execution order:
`PahlaviToken` (`02_token.js`) requires `SovereignWealthFund`'s address, so
`06_swf.js` must run first despite the filename ordering. Run `deploy/index.js`
to execute everything in dependency-correct order:

```
kernel -> treasury -> swf -> token -> recognized_backing's prerequisite (oracle deploy) ->
oracle -> recognized_backing -> roles (Court, Group A) ->
finalize (Oracle activation, Group E — last per the manifest) -> verify
```

```bash
npx hardhat run deploy/index.js --network <network>
```

Each script also remains independently runnable, one at a time, matching
the manifest's operator-checklist style:

```bash
npx hardhat run deploy/01_kernel.js --network <network>
npx hardhat run deploy/05_treasury.js --network <network>
# ... in dependency order (see above)
```

Deployed addresses are persisted to `deploy/deployments/<network>.json`
(gitignored — network-specific output, not source) and read back by
subsequent scripts.

## Required configuration

Set as environment variables before running (see
`docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` §1 for the full address
book):

| Variable | Description |
|---|---|
| `SOVEREIGN_ADDRESS` | Sovereign hardware wallet address |
| `COURT_1` .. `COURT_9` | 9 Supreme Constitutional Court member addresses |
| `ORACLE_INITIAL` | Placeholder oracle address (revoked in `08_finalize.js`) |
| `SWF_MULTISIG` | Multisig address passed to Kernel's constructor |
| `FEEDER_ADDRESSES` | Comma-separated API3Oracle feeder addresses (§1 `FEEDER_1..N`) |
| `RECOGNIZER_ADDRESS` | `RECOGNIZER_ROLE` holder on `RecognizedReserveBacking` |
| `INITIAL_RESERVES` | `PahlaviToken` constructor `_initialReserves` value |

No addresses are hardcoded or defaulted — `deploy/config.js` throws if any
required variable is missing.

## Signing

Calls gated `onlySovereign` (`setPahlaviToken`, `setPahlaviRecognizedReserveBacking`,
`grantOfficialAccess`, `revokeRole`) are sent using the network's first
configured signer. For a real deployment, configure the target network's
`accounts` in `hardhat.config.js` with the Sovereign's own signing key (or
route the corresponding calldata through the Sovereign's hardware
wallet/multisig separately) — these scripts do not implement custody or
multisig-signing infrastructure.
