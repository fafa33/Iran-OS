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
