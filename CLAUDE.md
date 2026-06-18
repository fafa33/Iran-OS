# CLAUDE.md — IranOS (ایران‌اواس)

## Project Overview

**IranOS** is an open-source blockchain-based governance operating system designed as a technical blueprint for a post-Islamic-Republic Iran. The project encodes a secular constitutional monarchy ("منشور رفاه و عدالت" — Charter of Welfare and Justice) into auditable Solidity smart contracts, governance protocols, and documentation.

All primary documentation is written in **Persian (Farsi)** with RTL formatting (`<div dir="rtl">`). Smart contract comments are bilingual (Persian + English error messages).

---

## Repository Structure

```
Iran-OS/
├── constitution/          # پیمان ملی مشروطه سکولار (National Charter)
│   ├── constitution-fa.md
│   └── README.md
├── whitepaper/            # Technical whitepaper (13 chapters + appendices)
│   ├── whitepaper-fa.md
│   └── README.md
├── protocols/             # Operational protocols for each governance domain
│   ├── trigger-protocol-fa.md
│   ├── monetary-protocol-fa.md
│   ├── governance-protocol-fa.md
│   ├── justice-protocol-fa.md
│   ├── reclaim-protocol-fa.md
│   ├── defense-protocol-fa.md
│   ├── citizen-identity-fa.md
│   ├── kernel/                           # Kernel specification
│   └── README.md
├── architecture/          # Architecture specifications (state model, execution flow,
│                          # security model, oracle layer, agentic architecture)
├── contracts/             # Solidity smart contracts (Solidity ^0.8.20) — 25 contracts
│   ├── kernel.sol                        # Layer-0 governance kernel
│   ├── CONTRACT_RUNTIME_MAP.md           # Contract runtime principles map
│   ├── core/
│   │   ├── TriggerProtocol.sol           # Automatic violation enforcement
│   │   └── ConstitutionGuard.sol         # Law compliance gatekeeper
│   ├── monetary/
│   │   ├── SovereignWealthFund.sol       # National wealth fund (3-layer)
│   │   ├── PahlaviToken.sol              # National currency token
│   │   ├── Treasury.sol                  # National treasury
│   │   └── VelocityFee.sol               # Velocity fee mechanism
│   ├── governance/
│   │   ├── Provincial.sol                # Provincial governance (30/70 formula)
│   │   ├── Parliament.sol                # Parliament
│   │   ├── VotingSystem.sol              # National voting system
│   │   ├── BudgetAllocation.sol          # Budget allocation
│   │   └── Fargard7PolicyAdapter.sol     # Proposal-only policy adapter (non-executing)
│   ├── welfare/
│   │   ├── CitizenCard.sol               # Smart citizen welfare card
│   │   ├── BaseIncome.sol                # Base income eligibility
│   │   ├── HealthCoverage.sol            # Health coverage
│   │   └── DisabilitySupport.sol         # Disability support
│   ├── oracles/
│   │   ├── API3Oracle.sol                # Real-world data oracle
│   │   ├── PriceOracle.sol               # Price data oracle
│   │   └── ProductionOracle.sol          # Production data oracle
│   ├── justice/
│   │   ├── JurySelection.sol             # VRF random jury selection
│   │   ├── JusticeProtocol.sol           # Justice protocol
│   │   └── PenalLabor.sol                # Penal labor
│   └── reclaim/
│       ├── AssetFreeze.sol               # Asset freezing protocol
│       ├── SovereignCrawler.sol          # Sovereign crawler (asset discovery)
│       └── VictimFund.sol                # Victims' compensation fund
├── test/                  # Hardhat test suite (26 test files; see latest Step 13
│                          # checkpoint for current passing count)
├── docs/
│   ├── roadmap-fa.md        # 5-phase deployment roadmap (365 days)
│   ├── IRAN_OS_ROADMAP.md   # Step-based formalization/hardening roadmap
│   ├── contributing-fa.md   # Contributor guide
│   ├── glossary-fa.md       # Technical glossary
│   ├── Faq-fa.md            # FAQ
│   ├── Doctrine/            # Doctrine documents (FA)
│   ├── STEP3..STEP5_*.md    # Step milestone documents
│   ├── WHITEPAPER_*_FA.md   # Whitepaper-to-system mapping (Step 13)
│   ├── step13/ .. step42/   # Per-step milestone directories
│   ├── reports/             # Step reports (Step 6–12)
│   ├── deployment/          # Deployment manifest & role protocols
│   ├── oracle/              # Airnode integration protocol
│   └── checkpoints/         # Path checkpoints
├── agents/                # Agent definitions (README)
├── app/                   # Citizen app (React Native / Expo)
├── workflows/             # Workflow documents
├── hardhat.config.js      # Hardhat configuration
└── package.json
```

---

## Smart Contract Architecture

### Layer 0 — Kernel (`contracts/kernel.sol`)

`IranOS_Kernel` is the root governance contract. It hard-codes six immutable constitutional red lines (TR-01 to TR-06) and orchestrates the three-layer trigger mechanism.

**Roles:**
| Role | Persian | Description |
|------|---------|-------------|
| `SOVEREIGN_ROLE` | پادشاه | Constitutional monarch — national arbiter |
| `COURT_ROLE` | دادگاه عالی | Supreme constitutional court |
| `ORACLE_ROLE` | اوراکل API3 | Data feeders (API3) |
| `GUARDIAN_ROLE` | نگهبانان نخبگانی | Elite guardians |

**Immutable constants:**
- `LIQUIDITY_CAP` = 900 billion Pahlavi (900_000_000_000 × 1e18)
- `MIN_RESERVE_RATIO` = 333 (= 33.3%, stored in thousandths)
- `MULTISIG_THRESHOLD` = 7 of 9 signatures to activate trigger
- `TRIGGER_TIMEOUT` = 72 hours for court adjudication

**Trigger lifecycle:**
1. Oracle calls `flagViolation()` → `ViolationFlagged` event; TR-01/02/03 auto-activates emergency lock
2. Court signers call `signViolation()` until `signaturesCount >= 7` → `_activateTrigger()` internally
3. `_activateTrigger()` calls `_revokeOfficialAccess()` and emits `TriggerActivated`

### Core Contracts

**`TriggerProtocol.sol`** — Execution layer called by the Kernel after multi-sig confirmation. Blocks treasury access, revokes signing authority, emits public notification, and optionally activates an interim replacement. Only the kernel address can call `executeTrigger()`.

**`ConstitutionGuard.sol`** — Law proposal gatekeeper. Any address can call `proposeLaw(bytes32)`. Only the Kernel can `approveLaw()` or `rejectLaw()`. Approved law hashes are stored in `approvedLaws` mapping.

### Monetary Contracts

**`SovereignWealthFund.sol`** — Three-layer national wealth fund:
- L1 (نقد / Cash): target $300B — liquid reserve
- L2 (مولد / Productive): target $300B — income-generating assets, 15% annual yield
- L3 (گرو / Pledged): target $2T — strategic long-term assets

Multi-sig withdrawals require 3 of N `COUNCIL_ROLE` signers. Annual yield flows L2 → L1 via `distributeAnnualYield()`.

**`PahlaviToken.sol`** — National currency token.

Other monetary contracts (not described in detail here): `Treasury.sol`, `VelocityFee.sol`.

### Governance Contracts

**`Provincial.sol`** — Province registry and 30/70 revenue distribution formula. Oracle feeds revenue; 30% stays provincial (`PROVINCIAL_SHARE = 300`) and 70% goes to the national treasury. Provinces with `productivityScore > 70` are eligible for bonus payouts.

Other governance contracts (not described in detail here): `Parliament.sol`, `VotingSystem.sol`, `BudgetAllocation.sol`, `Fargard7PolicyAdapter.sol` (proposal-only / non-executing).

### Welfare Contracts

**`CitizenCard.sol`** — On-chain citizen identity and welfare card:
- Minimum wage: 1,000 Pahlavi (`MIN_WAGE`)
- Unemployment insurance: 70% of min wage for up to 18 months
- Annual health credit: 500 Pahlavi
- Monthly drug quota: 100 Pahlavi
- Retirement age: 65
- Biometric deduplication via `biometricToAddress` mapping
- Employment status enum: `Employed | Unemployed | Retired | Disabled`

Other welfare contracts (not described in detail here): `BaseIncome.sol`, `HealthCoverage.sol`, `DisabilitySupport.sol`.

### Oracle Contracts

**`API3Oracle.sol`** — Connects real-world data to on-chain contracts. Data types: `PRICE(1) | PRODUCTION(2) | GOVERNANCE(3) | JUDICIAL(4) | MILITARY(5) | WELFARE(6)`. Military data (type 5) is restricted to `KERNEL_ROLE`. Feeders can also flag violations via `flagViolation()`.

Other oracle contracts (not described in detail here): `PriceOracle.sol`, `ProductionOracle.sol`.

### Justice Contracts

**`JurySelection.sol`** — Random jury system using VRF commitments. Jury size: 12. Conviction threshold: 8 of 12 guilty votes. Acquittal threshold: 5+ not-guilty votes. If 12 votes cast without reaching either threshold, verdict 3 (second round required) is emitted. ZK proofs are validated per-vote.

Other justice contracts (not described in detail here): `JusticeProtocol.sol`, `PenalLabor.sol`.

### Reclaim Contracts

**`AssetFreeze.sol`** — Asset freeze protocol for recovering stolen national assets. Status lifecycle: `Active → UnderReview → Confirmed → (TransferredToSWF or Released)`. Requires 3 `COUNCIL_ROLE` signatures to confirm. Only `CRAWLER_ROLE` can initiate a freeze; only `KERNEL_ROLE` can release.

Other reclaim contracts (not described in detail here): `SovereignCrawler.sol`, `VictimFund.sol`.

---

## Violation Codes (TR-01 to TR-06)

| Code | Persian | Meaning |
|------|---------|---------|
| TR-01 | پادشاهی مشروطه سکولار | Violation of secular constitutional monarchy |
| TR-02 | سکولاریسم ساختاری | Structural secularism breach |
| TR-03 | یکپارچگی سرزمینی | Territorial integrity violation |
| TR-04 | حقوق بنیادین ملت | Fundamental rights violation |
| TR-05 | استقلال صندوق ثروت ملی | SWF independence breach |
| TR-06 | سقف نقدینگی | Liquidity cap violation |

TR-01, TR-02, TR-03 trigger an immediate emergency lock (`emergencyLockActive = true`). The lock can only be deactivated by the Court (`onlyCourt`).

---

## Development Conventions

### Solidity Standards
- Pragma: `^0.8.20`
- Dependencies: OpenZeppelin `AccessControl` and `ReentrancyGuard`
- All state-changing external functions use `nonReentrant`
- Role-based access via `onlySovereign()`, `onlyCourt()`, `onlyOracle()`, `onlyGuardian()`, `onlyKernel()` modifiers
- NatSpec comments (`@notice`, `@dev`, `@param`) required on all public/external functions
- Test coverage target: **95%** minimum
- No admin backdoors — any function allowing bypass of the trigger protocol will be rejected

### Code Quality Rules
- No secrets or private keys in source
- All code must align with the constitution (`منشور رفاه و عدالت`)
- Security audit required before mainnet deployment (tools: Slither, Mythril, Echidna)
- No hidden admin access or upgrade patterns that bypass the kernel

### Deployment-Path Parity (Mandatory)

Any PR touching **Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, or authority boundaries** requires a deployment-path parity test. Unit tests alone are insufficient for these components.

A deployment-path parity test must prove the exact production-intended caller path works using only role wiring and setup documented in the deployment manifest or repository deployment procedure (`docs/deployment/`).

**Tests must NOT use the following as proof of production reachability:**
- `hardhat_impersonateAccount` or any Hardhat-only JSON-RPC method
- Test-only role grants that have no mainnet-reachable equivalent
- Artificial caller accounts with no documented production grant path
- Undocumented manual setup steps
- Admin shortcuts unavailable on mainnet (e.g., `DEFAULT_ADMIN_ROLE` held by a contract with no external grant function)

If impersonation is used in a test file for any reason, it must be explicitly labeled with a comment such as `// TEST-ONLY — not a production grant path` and does not count as deployment-path proof.

A PR touching a sensitive component is not mergeable if CI can pass while the production caller path remains unreachable on mainnet.

**Lesson learned — GAP-MEX-05:** GAP-MEX-05 initially passed unit tests while three production reachability gaps remained undetected: (1) `API3Oracle` had no `syncReserves` forwarding method wired to `Kernel.syncReserves`; (2) `pahlaviToken` address was not configured in Kernel's deployment flow; (3) `FEEDER_ROLE` on `API3Oracle` had no mainnet-reachable grant path — only `hardhat_impersonateAccount` in tests. All three required separate PRs (#76–#81) to close after the gaps were identified as Codex findings.

### Pre-Implementation Red-Team Pass (Mandatory)

Before implementing any sensitive PR, Claude must perform an internal red-team pass and document the results before writing any code or tests.

**Sensitive PRs include any change touching:** Kernel, Oracle, roles, deployment wiring, Reserve, Treasury, TriggerProtocol, PahlaviToken, or authority boundaries.

**The red-team pass must identify and document each of the following before implementation begins:**

| Item | Question to answer |
|---|---|
| Production caller path | What is the exact sequence of callers from the external entry point to the target function on mainnet? |
| Role grant path | How does each required role reach each caller address on mainnet? Is that path in the deployment manifest? |
| Deployment manifest path | Which file and section in `docs/deployment/` documents this wiring? Does it exist? Is it current? |
| Impossible or unreachable paths | Are there any assumed paths that cannot be executed on mainnet (e.g., `DEFAULT_ADMIN_ROLE` held by a contract with no external grant function)? |
| Hardhat-only assumptions | Does any part of the proposed test setup rely on `hardhat_impersonateAccount`, Hardhat JSON-RPC methods, or test scaffolding that has no mainnet equivalent? |
| Test-only shortcuts | Are any role grants or caller setups in the tests achievable only in a test environment? |
| Stale-state or recovery gaps | Can a sub-floor or invalid state be entered that a subsequent corrective operation cannot exit? |
| Authority drift | Does this change expand the set of addresses that can call any authority-gated function, directly or indirectly? |
| TriggerProtocol contamination risk | Does this change risk routing a non-governance event (e.g., a reserve accounting event) into `executeTrigger`? |
| CI-green-but-production-broken risk | Could CI pass on this PR while the real production caller path remains unreachable on mainnet? |

Implementation may begin only after this red-team pass is documented in the PR description or in a linked report.

### Red-Team Finding Classification Standard (Mandatory)

This policy governs how all Red-Team and Codex-style adversarial review findings are classified. It applies to every review, pre-implementation pass, and post-merge audit performed on this repository.

**A finding MUST NOT be classified as BLOCKER_P1 unless ALL five criteria are demonstrated:**

| Criterion | Required evidence |
|---|---|
| Reachable attack path | The path from an external caller to the vulnerable state must be traversable in the current codebase |
| Privileges realistically obtainable | The required role or access must be achievable by a realistic adversary outside the existing trust model |
| Concrete state corruption | The attack must demonstrably corrupt on-chain state, not merely make a wrong value temporarily observable |
| Reachable downstream enforcement consequence | The corrupted state must produce a reachable enforcement consequence (mint, freeze, trigger, treasury impact) in current code |
| Current doctrine violation | The finding must violate a doctrine constraint as encoded in the current codebase, not a hypothetical future constraint |

**If any criterion fails, BLOCKER_P1 is prohibited.** Downgrade to exactly one of:
- `HARDENING_ONLY`
- `DOCUMENTATION_REQUIRED`
- `FALSE_POSITIVE`

**A finding MUST NOT be classified as BLOCKER_P2 unless** a concrete defect is demonstrated in one of: current contract code, current documentation, current deployment procedure, or current operational runbook. A missing item is `DOCUMENTATION_REQUIRED`, not `BLOCKER_P2`.

**The following are NOT sufficient, alone or in combination, to justify BLOCKER_P1:**

- Missing metadata or provenance information
- Missing future-proofing or extensibility
- Architectural preference or elegance concern
- Hardening opportunity without a complete exploit chain
- Potential future code paths not present in the current codebase
- Potential future governance, mint, or treasury paths not currently reachable
- Trusted-actor dishonesty that is already assumed by the existing trust model
- Theoretical exploitability without a demonstrated reachable enforcement consequence

**Existing trust-model assumptions are not vulnerabilities** unless the change under review introduces one of:
- A new reachable attack path not present before the change
- A new authority escalation path
- A new current-code doctrine violation
- A new reachable enforcement consequence

**Required evaluation table for every Red-Team finding:**

| Criterion | Pass / Fail | Evidence |
|---|---|---|
| Reachable attack path | | |
| Privileges realistically obtainable | | |
| Concrete state corruption | | |
| Reachable downstream enforcement consequence | | |
| Current doctrine violation | | |

The table must be completed and included in the PR description or linked report for every finding classified as BLOCKER_P1 or BLOCKER_P2. A finding with any `Fail` row may not be classified as BLOCKER_P1.

**Rationale:** IranOS prioritizes resilience, continuity, and doctrinal correctness over theoretical perfection. Hardening opportunities are valuable but must not be misclassified as active constitutional vulnerabilities. A complete exploit chain and demonstrated current doctrinal impact are required before a finding blocks implementation.

#### HARDENING_ONLY Re-Evaluation Policy

**A `HARDENING_ONLY` classification is not permanently closed.** It is valid only while the assumptions that disqualified one or more BLOCKER_P1 criteria remain true. If any re-evaluation trigger event occurs, every active `HARDENING_ONLY` finding in the affected system must be re-assessed against the 5-criterion gate before the triggering PR is merged.

**Re-evaluation trigger events** — any of the following requires re-evaluation of all active HARDENING_ONLY findings listed in `docs/governance/OPEN_RESIDUALS.md`:

1. **New mint path** — any contract gains `MINTER_ROLE`, any new `.mint()` call is added to a production contract, or any path from a role holder to `PahlaviToken.mint()` is wired
2. **New treasury path** — any new call path to `Treasury.proposeTransaction`, `createBudgetLine`, or any treasury state-mutating function is added
3. **New reserve update path** — any new consumer of `totalReserves`, any new downstream path from `updateReserves`, or any new entry point to `syncReserves` is introduced
4. **Role model changes** — any role granted to a new address, any role revoked, any change to `DEFAULT_ADMIN_ROLE` holders, any change to `_setRoleAdmin` assignments, or any change to the holder count for `FEEDER_ROLE`, `MINTER_ROLE`, `ORACLE_ROLE`, or `KERNEL_ROLE`
5. **AccessControl changes** — any change to `_grantRole`, `_revokeRole`, `grantRole`, `revokeRole`, or `renounceRole` logic in any production contract
6. **Oracle architecture changes** — any new oracle contract deployed, any new data type registered in `API3Oracle`, any new feeder EOA authorized, or any change to `MAX_DATA_AGE`
7. **Governance authority changes** — any change to who can call `flagViolation`, `executeTrigger`, `signViolation`, or any function that advances the trigger lifecycle; any change to `MULTISIG_THRESHOLD`
8. **Emergency/freeze routing changes** — any new path to activate or deactivate `emergencyLockActive` or `emergencyMode`, or any new function gated by these flags
9. **Deployment topology changes** — any new contract address, new role wiring, or new entry in `docs/deployment/` that introduces a caller path not present at the time of the HARDENING_ONLY classification
10. **New downstream consumer of the disqualifying data field** — any new contract or function that reads a state variable that was the basis for the HARDENING_ONLY criterion failure (e.g., `totalReserves`, `reserveCompliant`, `reserveFloorBreached`)
11. **Resolution of a linked OPEN finding** — if a finding classified OPEN that was cited as a prerequisite or constraint for a HARDENING_ONLY finding is closed or modified by a contract change, the HARDENING_ONLY finding must be re-evaluated

**Required documentation when classifying HARDENING_ONLY:**

When a finding is classified as HARDENING_ONLY, the reviewer must document all four elements in the PR description or finding report:

| Required element | Content |
|---|---|
| Original finding summary | One-line description of the finding and its affected component |
| Disqualifying criteria | Which of the 5 BLOCKER_P1 criteria fails, and why |
| Disqualifying assumptions | The specific observable conditions (code state, role assignments, deployment state) that cause the criterion to fail — expressed as grep-verifiable assertions |
| Re-evaluation triggers | The specific events from the re-evaluation trigger list above that would require reclassification of this finding |

After documenting, add the finding to `docs/governance/OPEN_RESIDUALS.md`.

**Re-evaluation process:**

When a re-evaluation trigger fires:
1. Read `docs/governance/OPEN_RESIDUALS.md` and identify every active HARDENING_ONLY finding whose trigger list includes the fired event.
2. Re-run the 5-criterion evaluation table for each affected finding against the current codebase.
3. Document: the original classification, the original disqualifying assumptions, what changed, and the re-classification result.
4. If re-classification upgrades a finding to BLOCKER_P1, that finding must be documented as BLOCKER_P1 and must block the triggering PR. Update `docs/governance/OPEN_RESIDUALS.md` with the outcome.

**Examples:**

*K-RES-01 — Stale-Reserve Provenance (HARDENING_ONLY)*

| Required element | Content |
|---|---|
| Original finding | `syncReserves(uint256 newReserves)` carries no timestamp or provenance; a feeder with `FEEDER_ROLE` can submit stale reserves — root cause is GAP-MEX-04 FND-01/FND-02 |
| Disqualifying criterion | Criterion 4 fails — "Reachable downstream enforcement consequence" |
| Disqualifying assumption | Minting circuit incomplete: `SovereignWealthFund.sol` holds `MINTER_ROLE` but contains no `.mint()` call — verified by `grep -r '\.mint(' contracts/ --include="*.sol" \| grep -v fuzzing` → one match in fuzzing harness only |
| Re-evaluation triggers | Trigger 1 (new mint path), Trigger 3 (new consumer of `totalReserves`), Trigger 10 (new enforcement consumer of `reserveCompliant`), Trigger 11 (FND-01 or FND-02 closed via contract change) |

If Trigger 1 fires (a SWF mint path is added), criterion 4 must be re-evaluated. If criterion 4 now passes, K-RES-01 must be reclassified as BLOCKER_P1 and must block the PR that added the mint path.

*Relationship between K-RES-01 and FND-01/FND-02:*

FND-01 (freshness gate absent on `syncReserves`) and FND-02 (stale reserve values applied to `totalReserves`) are OPEN findings from GAP_MEX_04_ORACLE_FRESHNESS_REVIEW.md that describe the enabling conditions for K-RES-01's scenario. If FND-01 and FND-02 are closed via a contract change (timestamp gate threaded through the reserve sync path), that change fires Trigger 11 — K-RES-01 must be re-evaluated because the attack surface for stale-reserve submission changes. However, K-RES-01 would not automatically close on FND-01/FND-02 closure alone — the disqualifying assumption is criterion 4 (no mint enforcement consequence), not the absence of a freshness gate. If the freshness gate is added but the minting circuit remains incomplete, criterion 4 still fails and the HARDENING_ONLY classification remains valid. Both conditions changing together (FND-01/FND-02 fixed AND a mint path added) would require K-RES-01 to be re-evaluated as BLOCKER_P1.

**Centralized residual register:** All active HARDENING_ONLY findings must be listed in `docs/governance/OPEN_RESIDUALS.md`. When a finding is created, add it. When a re-evaluation trigger fires, mark it as "Under Re-evaluation." When re-classification completes, record the outcome and update the status.

### PR Preflight Standard (Mandatory)

This policy governs every PR — code or documentation — touching Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, runbooks, gap registers, or audit reports. Its purpose is to eliminate post-push Codex findings caused by unverified closure claims, missing role-path evidence, or wording that is true in principle but unprovable from the text.

**Core rule: verify before claim, not after challenge.** Every reachability, closure, or role-restriction claim must be backed by grep evidence collected before the PR is opened. Codex challenges that require post-hoc grep represent a workflow failure.

#### Step 1 — Rebase

```
git fetch origin main
git rebase origin/main
```

Always rebase before push. A dirty branch (`mergeable_state: dirty`) blocks CI and wastes review cycles.

#### Step 2 — Test

```
npm test
```

All tests must pass before push. This applies to documentation-only PRs as well (merge conflicts can break test fixtures).

#### Step 3 — Grep Evidence Collection

For every claim in every changed file, run the corresponding grep and record the result before writing the claim.

| Claim type | Required grep | Expected result |
|---|---|---|
| "No production contract calls `F()`" | `grep -r '\.F(' contracts/ --include="*.sol" \| grep -v fuzzing` | Zero matches outside fuzzing harness |
| "Contract `X` holds ROLE but cannot call `F()`" | `grep '\.F(' contracts/path/to/X.sol` | Zero matches |
| "ROLE is restricted to named operators" | (1) `grep '_grantRole(ROLE' contracts/path/to/Contract.sol` — confirm constructor grants; (2) `grep '_setRoleAdmin' contracts/path/to/Contract.sol` — confirm no custom admin override; (3) `grep 'DEFAULT_ADMIN_ROLE' contracts/path/to/Contract.sol` — identify who holds the inherited admin (default admin for all roles is `DEFAULT_ADMIN_ROLE`; its holder can call `grantRole` for any role via OpenZeppelin AccessControl) | All three greps evaluated; DEFAULT_ADMIN_ROLE holder documented |
| "No mint path" | `grep -r '\.mint(' contracts/ --include="*.sol" \| grep -v fuzzing` | Zero matches outside fuzzing |
| "Gap X is CLOSED" | Enumerate: what is implemented (file:line), what remains open, what test covers it | All three present |
| "No downstream enforcement consequence" | Full caller chain from entry point to every enforcement surface (mint, freeze, trigger, treasury); grep each surface | Zero untraced paths |

#### Step 4 — Claim Evidence Tier (CET) Classification

Before writing any claim, assign it a CET:

| Tier | Definition | Required before push |
|---|---|---|
| **CET-1** | Proven by grep result collected in this session | Document grep command and result in PR body |
| **CET-2** | Believed true but grep not yet run | Run grep; upgrade to CET-1 or revise claim |
| **CET-3** | Architectural assumption without code evidence | Run grep (upgrade to CET-1) or replace with hedged language |

**CET-2 and CET-3 claims may not appear in a pushed PR.** Every claim must reach CET-1 at push time.

#### Step 5 — Forbidden Wording Scan

Scan every changed file for the following phrases. Each is forbidden unless immediately followed by the grep command and its result in the same text block.

| Forbidden phrase | Required replacement |
|---|---|
| "no reachable downstream enforcement consequence" | Same phrase + `grep '\.mint(' contracts/...` result |
| "no production contract calls `X()`" | Same phrase + `grep '\.X(' contracts/ \| grep -v fuzzing` result |
| "no mint path" | Same phrase + grep for `.mint(` |
| "no callable path" | Same phrase + grep for the specific function |
| "CLOSED" (for a gap or finding) | "CLOSED (scope: [exact scope]) — remaining open: [list]" |
| "verified by codebase" | "verified by grep: `[exact command]` → `[result]`" |
| "no current BLOCKER" | Must be followed by completed 5-criterion evaluation table |
| "trust-model assumption" | Acceptable only after confirming no new attack surface introduced by the current change |

##### Certainty Language Rule (Mandatory)

No contributor, reviewer, or documentation author may use **absolute certainty language** in a technical claim unless the required evidence standard has been satisfied. The core test: can the certainty phrase be replaced by its evidential equivalent with CET-1 evidence already in hand? If not, the phrase is forbidden.

This rule applies to all documents in the repository regardless of type — code comments, audit reports, gap registers, governance documents, and PR descriptions.

| Phrase | Classification | Required evidence if used |
|---|---|---|
| `"impossible"` (security or reachability claim) | **Forbidden** | Replace with: "No path was identified under the current codebase and evidence set: `[grep command → result]`" |
| `"unreachable"` (security or reachability claim) | **Forbidden** | Replace with: "No reachable path was identified in the reviewed code: `[grep command → result]`" |
| `"cannot happen"` (security claim) | **Forbidden** | Replace with: "No code path producing this outcome was identified: `[grep command → result]`" |
| `"no attack path"` | **Forbidden** | Replace with: "No reachable exploit chain was identified in the current codebase — 5-criterion gate: `[completed table]`" |
| `"impossible to exploit"` | **Forbidden** | Must be replaced by completed 5-criterion evaluation table |
| `"fully mitigated"` | **Forbidden** | Replace with: "Mitigated (scope: [exact scope]) — remaining open: [list or 'none identified in reviewed code']" |
| `"permanently closed"` | **Forbidden** | Replace with: "CLOSED (scope: [exact scope]) — remaining open: [list]" — the word "permanently" is prohibited |
| `"resolved forever"` | **Forbidden** | Replace with: "Resolved as of PR #N — must be re-evaluated if [specific triggering condition]" |
| `"no risk"` | **Forbidden** | Must be replaced by completed 5-criterion evaluation table |
| `"never"` (as absolute security claim) | **Forbidden** | Replace with: "No such occurrence was identified in the reviewed code: `[grep command → result]`" |
| `"guaranteed"` (without formal proof) | **Conditionally allowed** | Must immediately follow: Solidity `immutable` keyword confirmation, or constructor-only assignment verified by grep: `[command → result]` |
| `"safe"` / `"secure"` (unqualified) | **Conditionally allowed** | Must be scoped: "safe against [named threat] as verified by [grep/test]: `[result]`" |
| `"trusted operators only"` | **Conditionally allowed** | Must follow three-grep AccessControl audit — see ROLE restriction evidence requirement (Step 3) |
| `"constructor-only"` | **Conditionally allowed** | Must follow three-grep AccessControl audit — see ROLE restriction evidence requirement (Step 3) |
| `"always"` (as absolute security claim) | **Conditionally allowed** | Must follow formal invariant or exhaustive test: "Every reviewed code path satisfies [property] — verified by [test/grep]: `[result]`" |
| `"only [role/address] can call"` (access restriction) | **Conditionally allowed** | Must follow three-grep AccessControl audit — see ROLE restriction evidence requirement (Step 3) |
| `"never"` / `"always"` / `"only"` in non-security descriptive contexts | **Allowed** | No evidence requirement when used in non-technical, non-claim contexts (e.g., commit message prose) |

**Replacement wording examples:**

| Instead of | Use |
|---|---|
| "unreachable" | "No reachable path was identified under the current codebase and evidence set: `grep -r '\.F(' contracts/ → [result]`" |
| "constructor-only" | "Constructor grants were verified and no additional grant path was identified in the reviewed code: `grep '_grantRole' → [result]`; `grep 'DEFAULT_ADMIN_ROLE' → [result]`" |
| "impossible to exploit" | 5-criterion table with all five criteria evaluated |
| "fully mitigated" | "Mitigated (scope: oracle liveness) — remaining open: reserve value provenance [K-RES-01]" |
| "safe" | "Safe against stale-oracle injection as verified by Gate A/Gate B implementation at `API3Oracle.sol:110-124`" |
| "no risk" | 5-criterion table showing which criteria fail |
| "guaranteed" | "Guaranteed by Solidity `immutable` keyword — verified by grep: `grep 'immutable' contracts/kernel.sol → LIQUIDITY_CAP declared immutable`" |

#### Step 6 — Self-Codex-Review

Before every push, apply the 5-criterion BLOCKER_P1 gate to every claim in every changed file. Ask: "What would Codex challenge here, and can I answer it with grep evidence already in hand?" If the answer is no, collect the evidence first.

#### Step 7 — Cross-Document Consistency

For every gap, finding, or status being changed: grep for the gap/finding ID across all `docs/` files and update every reference in the same PR. A gap marked CLOSED in one report but Open in another will generate a Codex finding.

#### Step 8 — PR Body Evidence Block

Every PR must include an Evidence section:

```
## Evidence
- grep: `<command>` → `<result>`
- Role grant path: `<contract>:<line>` → `<deployment manifest section>`
- npm test: N passing
- Open residuals: [list or "none"]
```

#### Step 9 — Deployment Manifest Currency Check

For any PR touching a sensitive component (Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, or authority boundaries):

1. Identify every role and contract address introduced or modified by the PR.
2. Grep `docs/deployment/` for each role and contract address: `grep -r 'ROLE_NAME\|ContractName' docs/deployment/`. Confirm the manifest documents the current wiring.
3. Confirm the manifest's last-updated date is not older than the most recent sensitive-component PR merged to main.
4. If the manifest is stale — missing a role grant, a contract address, or a wiring change introduced since the manifest was last updated — update it in the same PR.

A claim that wiring is "documented in `docs/deployment/`" requires CET-1 evidence: a grep result showing the specific role or address is present in the manifest file and section cited.

**A PR that claims production wiring is documented but cannot produce the manifest grep result fails the preflight.**

#### Before Responding to Codex

1. Never respond from memory. Run the grep the comment implies before writing any reply.
2. Apply the 5-criterion gate explicitly — include the completed table in the reply.
3. Include the grep command and result in the reply text. Codex cannot challenge evidence it can see.
4. If the Codex claim is partially correct, acknowledge what is true, then disprove the specific missing link with grep evidence.
5. If a docs update is needed to prevent the same challenge recurring: make the update, commit, push, then reply with the commit hash.

#### Before Marking a Finding Resolved

1. Confirm the specific claim the finding made is addressed — not just that something changed.
2. Run the grep that would have caught the finding originally; confirm it returns the expected result.
3. Run npm test.
4. Update every document referencing the finding in the same commit.
5. State in the PR comment: what changed, at which file:line, and what grep now confirms.

### Reviewer Lessons Learned Registry (Mandatory)

Any reviewer finding that causes a new CLAUDE.md policy, a preflight step change, a new evidence requirement, or a governance workflow change must receive a new entry in `docs/governance/REVIEWER_LESSONS_LEARNED.md`.

**Registry location:** `docs/governance/REVIEWER_LESSONS_LEARNED.md`

**When to add an entry:** Immediately upon identifying that a finding produced a policy change — before closing the PR. Creating the entry is not optional.

**Success metric:** The project does not measure number of findings. It measures number of **repeated finding classes**. Goal: repeated finding classes trend toward zero. A finding may happen once. The same class of finding must never happen twice.

### File Naming
- Persian documents: `<name>-fa.md`
- English documents: `<name>-en.md`
- Persian markdown files must open with `<div dir="rtl">` and close with `</div>`
- Each document must include a linked table of contents at the top
- Documents must include version and date in the header

### Commit Message Format
```
feat(trigger): اضافه کردن لایه تشخیص تخلف TR-02
fix(monetary): رفع باگ در محاسبه نسبت پشتوانه
docs(glossary): اضافه کردن تعریف ZK-Rollups
```
Prefix types: `feat`, `fix`, `docs`, `test`, `refactor`, `audit`, `chore`

### Branch Naming
```
feature/<feature-name>
fix/<bug-name>
```

---

## Governance Domains and Their Protocols

| Domain | Protocol File | Contract(s) |
|--------|--------------|-------------|
| Trigger / Enforcement | `trigger-protocol-fa.md` | `kernel.sol`, `TriggerProtocol.sol` |
| Monetary | `monetary-protocol-fa.md` | `SovereignWealthFund.sol`, `PahlaviToken.sol` |
| Provincial Governance | `governance-protocol-fa.md` | `Provincial.sol` |
| Justice | `justice-protocol-fa.md` | `JurySelection.sol` |
| Asset Reclamation | `reclaim-protocol-fa.md` | `AssetFreeze.sol` |
| Defense | `defense-protocol-fa.md` | (planned) |

Always read the relevant protocol document before modifying its associated contract.

---

## Key Design Decisions

1. **No upgradeable proxies on the Kernel** — The six TR constants and the MULTISIG_THRESHOLD are immutable by design. Any "fix" to these values requires a new deployment.

2. **Emergency lock is additive** — `flagViolation()` for TR-01/02/03 immediately locks the system. Deactivation requires a court call. The system is intentionally biased toward caution.

3. **Multi-sig is 7-of-9 for trigger activation** — This is a constitutional minimum; never lower it in a PR.

4. **SWF withdrawals require 3-of-N council signatures** — The `MULTISIG_REQUIRED = 3` constant in `SovereignWealthFund.sol` is a floor. Council membership is granted by the Sovereign.

5. **CitizenCard does not pay wages** — The contract manages status and benefits only. The 1,000 Pahlavi minimum wage is paid by employers off-chain; the contract enforces eligibility tracking.

6. **ZK proofs in JurySelection are not verified on-chain** — The `zkProof` parameter is accepted but only checked for non-zero length (`zkProof.length > 0`). Full ZKP verification is planned for a future version.

---

## Deployment Roadmap (Summary)

| Phase | Days | Milestone |
|-------|------|-----------|
| Phase 0 | Pre-day 1 | Shadow ledger, P2P app, Genesis Call for contributors |
| Phase 1 | 1–90 | Asset seizure, national blockchain deployment, Pahlavi launch |
| Phase 2 | 90–180 | Monetary stabilization, green supply corridor |
| Phase 3 | 180–270 | Welfare distribution, 1,000 Pahlavi/month payments, provincial elections |
| Phase 4 | 270–330 | Public trials, structural reform, victims' reparations |
| Phase 5 | 330–365 | Constitutional assembly elections, trigger activation, Sovereign inauguration |

---

## Contribution Workflow

1. Read `constitution/constitution-fa.md`, `whitepaper/whitepaper-fa.md`, and the relevant protocol file in `protocols/`
2. Check `docs/glossary-fa.md` for correct technical terminology
3. Fork the repo and create a feature/fix branch
4. Run tests (`npm test` or `pytest`) — all must pass before committing
5. Open a PR with: problem solved, approach, test results, constitution section covered, security considerations

**Issue labels:** `good-first-issue` for newcomers, `core` for kernel-level work, `urgent` for critical path items.

---

## Technology Stack

| Technology | Use |
|-----------|-----|
| Solidity ^0.8.20 | Smart contracts |
| OpenZeppelin | AccessControl, ReentrancyGuard |
| API3 / Airnode | Real-world data oracle |
| ZK-Rollups (zkSync/StarkNet) | National transaction layer |
| Circom / SnarkJS / Noir | Zero-knowledge proofs |
| VRF | Random jury selection |
| Hardhat / Foundry | Contract development & testing |
| Slither / Mythril / Echidna | Security audit tooling |
| Python + Graph Neural Networks | Sovereign Crawler (asset discovery AI) |
| React Native / Flutter | National citizen app |

---

## Important Notes for AI Assistants

- The primary language is **Persian (Farsi)**. Preserve RTL formatting when editing `.md` files. Do not strip `<div dir="rtl">` wrappers.
- Contract comments are in Persian; error message strings are in English — maintain this convention.
- Never introduce admin backdoors, upgrade proxies on the Kernel, or any mechanism that allows bypassing the multi-sig trigger.
- Any PR that lowers `MULTISIG_THRESHOLD`, `COUNCIL_THRESHOLD`, or removes a `nonReentrant` guard should be flagged as a security concern.
- The constitution (`constitution-fa.md`) is the source of truth. If a contract behavior conflicts with the constitution, the contract is wrong.
- **Deployment-path parity is mandatory** for any change touching Kernel, Oracle, roles, deployment wiring, Reserve, Treasury, TriggerProtocol, or PahlaviToken. `hardhat_impersonateAccount` and test-only role grants are not proof that a production caller path exists. Before writing or accepting tests for these components, verify that the role grant path in the test matches what is documented in `docs/deployment/`. See "Deployment-Path Parity (Mandatory)" under Development Conventions.
- **Pre-implementation red-team pass is mandatory** before writing any code for sensitive PRs. Identify and document: production caller path, role grant path, deployment manifest path, impossible/unreachable paths, Hardhat-only assumptions, test-only shortcuts, stale-state gaps, authority drift, TriggerProtocol contamination risk, and CI-green-but-production-broken risk. Do not begin implementation until the pass is documented. See "Pre-Implementation Red-Team Pass (Mandatory)" under Development Conventions.
