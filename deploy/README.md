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
kernel -> treasury -> swf -> token -> oracle -> recognized_backing ->
roles (Court, Group A) ->
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
| `ACKNOWLEDGE_RESERVE_RESET` | Optional, defaults to unset/false. Must be `"true"` to proceed if `INITIAL_RESERVES` is nonzero when `03_recognized_backing.js` runs — see "Nonzero INITIAL_RESERVES" below. |

No addresses are hardcoded or defaulted — `deploy/config.js` throws if any
required variable is missing.

### Nonzero INITIAL_RESERVES

`kernel.setPahlaviRecognizedReserveBacking()` atomically replaces
`PahlaviToken.totalReserves` with the freshly-deployed
`RecognizedReserveBacking`'s `recognizedBackingTotal()` — which is `0` until
identities are recorded via `recordIdentity()`. If `INITIAL_RESERVES` was set
to a nonzero value, running `03_recognized_backing.js` (or the full
`deploy/index.js` orchestration) would silently reset it to `0` in the same
automated run, with no `recordIdentity()` step in between. `03_recognized_backing.js`
blocks this and throws unless `ACKNOWLEDGE_RESERVE_RESET=true` is set,
confirming the reset is an intentional operator decision rather than an
unnoticed side effect.

Note: `03_recognized_backing.js` deploys `RecognizedReserveBacking` and wires
it to `PahlaviToken` in the same function call, so there is no point *within
this workflow* at which identities could be recorded against that registry
beforehand — the registry does not exist until this script deploys it.
`ACKNOWLEDGE_RESERVE_RESET=true` is the only way to proceed past this guard
in the current deployment workflow. If the nonzero balance should instead be
preserved as recognized identities, that must happen as a separate, later
operation — call `RecognizedReserveBacking.recordIdentity()` after this
script has run and wired the registry, and treat the reserve reset to `0` in
between as expected and acknowledged.

### Duplicate Court addresses

`08_finalize.js` rejects Oracle activation if `COURT_1..COURT_9` are not 9
pairwise-distinct addresses — a duplicate silently reduces the number of
independent signers below 9 while still passing individual `hasRole` checks
(the duplicate simply re-holds a role it already had). `09_verify.js` also
checks this independently as defense-in-depth, but the rejection is
intentionally enforced *before* `ORACLE_ROLE` is ever granted, not just
reported afterward.

### Resuming after a failed run

`deploy/index.js`'s orchestrated run persists the address book to
`deploy/deployments/<network>.json` after every successful deployment step,
not only once at the end — so a mid-run failure (network error, a guard
throwing, gas exhaustion) leaves an accurate on-disk record of which
contracts were already deployed on-chain. This does not auto-resume a
failed run; an operator recovering from a partial run should inspect the
persisted file and continue with the remaining individual scripts.

`deploy/index.js`'s CLI entry point (`npx hardhat run deploy/index.js`)
refuses to start if `deploy/deployments/<network>.json` already contains any
of the 6 core-monetary-path addresses for that network — whether from a
completed run or a partial one recovered per the above. It does not
overwrite the file or auto-resume; it stops immediately with an error
directing the operator to either continue manually with the individual
scripts or intentionally remove/move aside the persisted file first. This
guard only applies to the orchestrated `deploy/index.js` entry point — the
individual scripts (`npx hardhat run deploy/0N_name.js`) always read and
incrementally update the existing file, by design.

## Signing

Calls gated `onlySovereign` (`setPahlaviToken`, `setPahlaviRecognizedReserveBacking`,
`grantOfficialAccess`, `revokeRole`) are sent using the network's first
configured signer. For a real deployment, configure the target network's
`accounts` in `hardhat.config.js` with the Sovereign's own signing key (or
route the corresponding calldata through the Sovereign's hardware
wallet/multisig separately) — these scripts do not implement custody or
multisig-signing infrastructure.
