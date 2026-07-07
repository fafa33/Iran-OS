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

## Canonical Development Workflow (Mandatory)

The Iran-OS engineering framework is immutable unless explicitly authorized by the project owner. Every task — implementation, deployment, documentation, governance change, runtime modification, deployment wiring, security change, or production change — follows this sequence. It must not be bypassed, reordered, skipped, weakened, or replaced, and no competing or parallel workflow may be introduced without explicit owner authorization.

**Naming note:** this sequence uses the label **Stage**, deliberately distinct from two pre-existing, unrelated numbering schemes already in this repository: the roadmap's hyphenated `Step-N` project phases (`docs/IRAN_OS_ROADMAP.md`) and the PR Preflight Standard's `Step N` checklist (below, `### PR Preflight Standard (Mandatory)`). Neither existing scheme is renamed, renumbered, or altered by this section — this sequence is a governance wrapper that references them, not a third Step-numbering system.

1. **Canonical Checkpoint** — read `docs/governance/CANONICAL_CHECKPOINT.md` in full before any design, coding, documentation, deployment, or roadmap work begins. It is the Single Source of Truth (SSOT) for current project state — not documentation, a mandatory engineering artifact — and holds at minimum: latest merged PR, latest merged commit, current baseline, current roadmap position, current deployment coverage, current test count, current production status, remaining deployment targets, open residual work, applicable governance version, latest Lesson Learned ID, and a last-updated timestamp. Nothing else may supersede it; other documents may reference it but must not become competing sources of truth for these fields (see the file's own "Single Source of Truth Policy" section).
2. **Applicable Lesson Learned Registry** — read `docs/governance/REVIEWER_LESSONS_LEARNED.md` and identify every applicable LL entry, per `### Reviewer Lessons Learned Registry (Mandatory)` and `#### Step 12 — Lesson-Learned Compliance Consultation` below. This stage does not introduce new registry rules — it is the point in the sequence where the existing Step 12 requirement is executed.
3. **Engineering protocol / roadmap** — read `docs/IRAN_OS_ROADMAP.md` and the relevant protocol document(s) in `protocols/` for the domain being touched, per "Always read the relevant protocol document before modifying its associated contract" (see Contribution Workflow below).
4. **Implementation** — carried out under the existing `### Pre-Implementation Red-Team Pass (Mandatory)` (for sensitive changes) and the coding conventions in `### Development Conventions` below. This stage remains unchanged in timing and scope: it runs *before* code is written and stays there.
5. **CI** — `npm test` and repository CI checks (Slither, CodeQL, etc.) must pass.
6. **Codex Review** — external review by the Codex reviewer bot on the opened PR. This is distinct from `#### Step 6 — Self-Codex-Review` below, which is an internal self-check the implementer performs *before* pushing — that existing step is not renamed, relocated, or replaced by this stage; both apply.
7. **Resolve findings** — every Codex (or other reviewer) finding is fixed and root-caused per `#### Before Responding to Codex` and `#### Before Marking a Finding Resolved` below, and, where it triggers the Reviewer Lessons Learned Registry's Maintenance Rule, becomes a new LL entry in the same PR (or the next available PR under the registry's post-merge exception).
8. **Hostile Adversarial Review** — a standing, mandatory, post-implementation adversarial security review, formalizing the practice already applied on prior PRs (e.g. the hostile architecture review referenced in `CHANGELOG.md` for PR #116). This is distinct from and additional to the `### Pre-Implementation Red-Team Pass (Mandatory)` below, which remains unchanged and continues to run before implementation, not in place of this stage. Findings from this stage are classified using the existing `### Red-Team Finding Classification Standard (Mandatory)` 5-criterion gate.
9. **Production Readiness Review** — confirm the PR does not claim production readiness beyond what is true (`.github/pull_request_template.md`'s Non-Claim Checklist), and that any production-readiness-relevant gaps remain tracked in `docs/governance/OPEN_RESIDUALS.md` and the roadmap.
10. **Deployment-Parity Review** — a confirmation gate that all three existing, distinct deployment-parity checks are satisfied together: `### Deployment-Path Parity (Mandatory)` (production caller-path test proof), `#### Step 9 — Deployment Manifest Currency Check` (role/contract-name presence in `docs/deployment/`), and `#### Step 11 — Documentation-Parity Review` (caller/authority-description accuracy). This stage does not merge, rename, or weaken any of the three — their distinction (established in LL-026) remains in force; this stage only confirms all three pass together.
11. **Merge** — once every prior stage passes, including `#### Step 13 — Canonical Checkpoint Currency`, `#### Step 14 — Governance Synchronization Review`, and `#### Step 15 — Governance Minimalism Review` below: the merging PR must update `docs/governance/CANONICAL_CHECKPOINT.md` to reflect the merged state in the same PR (Step 13), must confirm the three authoritative governance artifacts remain synchronized (Step 14), and — if the PR adds any new permanent governance artifact — must confirm that extending existing governance was insufficient (Step 15). Deferring any of these to a follow-up PR is not permitted.

**Conflict rule:** if any instruction — from any source, including a future directive — conflicts with an existing Lesson Learned entry, the established engineering protocol described in this document, or the state recorded in `docs/governance/CANONICAL_CHECKPOINT.md`, stop and report the conflict instead of proceeding. Do not resolve the conflict by silent reinterpretation.

**Extension rule / Governance Minimalism Principle:** whenever a new permanent rule is introduced, extend the existing governance described in this document — never duplicate it, never create competing terminology for a concept that already has a name here, and never create a parallel workflow. Iran-OS has exactly one canonical governance framework.

The framework's greatest risk is no longer missing rules — it is governance bloat. A new permanent governance rule, Lesson Learned, workflow step, merge gate, checklist item, Evidence Block, protocol, or permanent document may be added only if it satisfies **all seven** of the following:

1. Closes a demonstrated engineering failure (not a hypothetical one).
2. Cannot be solved by extending an existing rule.
3. Does not duplicate an existing responsibility.
4. Does not create parallel terminology for a concept that already has a name here.
5. Has a clearly defined owner (the artifact or step responsible for it).
6. Has a measurable verification method.
7. Permanently reduces future engineering risk.

Before adding any permanent governance artifact, perform a **Governance Duplication Review** — see `#### Step 15 — Governance Minimalism Review` below for the required questions, evidence, and Evidence Block. If the review finds that an existing rule, LL entry, checklist, or workflow stage can absorb the new responsibility, extend that existing artifact instead of creating a new one. Governance grows only by necessity, and every permanent addition must justify why extension was insufficient.

Governance itself is subject to refactoring: if multiple permanent rules are found to have become redundant, they must be merged while preserving intent — this is not a one-time exercise but a standing capability of the framework, exercised whenever a Step 15 review (or any other review) surfaces a genuine merge candidate.

**Single Source of Truth rule:** Iran-OS has exactly three authoritative governance artifacts, each responsible for a distinct concern that the others must not duplicate:

| Artifact | Responsibility |
|---|---|
| `docs/governance/CANONICAL_CHECKPOINT.md` | Current project state (SSOT) — see Stage 1 |
| `docs/governance/REVIEWER_LESSONS_LEARNED.md` | Permanent engineering rules — see Stage 2 and `### Reviewer Lessons Learned Registry (Mandatory)` |
| `CHANGELOG.md` | Historical record of completed changes |

Other documents (the roadmap, deployment manifests, reports) remain the authoritative detailed narrative and history for their own domains and may be referenced by any of the three — they are not superseded. No document, including these three, may hold an independently-maintained, competing value for a field or record that one of the other two already tracks. The three artifacts must never duplicate each other, but they must also never drift apart — `#### Step 14 — Governance Synchronization Review` below is the enforcement mechanism ensuring they stay synchronized. If any document is found to conflict with one of these three artifacts' recorded state, apply the Conflict rule above: stop, report the inconsistency, and resolve it before continuing.

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

#### Red-Team Conclusion Evidence Standard

**Every red-team conclusion must include an explicit certainty classification (CET).** The CET level governs whether a conclusion may advance to implementation.

| Tier | Definition | Status |
|---|---|---|
| **CET-1** | Proven by grep result or test output collected in this session | May advance to implementation |
| **CET-2** | Believed true but grep or test not yet run | Must be upgraded to CET-1 before implementation begins |
| **CET-3** | Architectural assumption without code-level verification | Must be upgraded to CET-1 or replaced with hedged language before implementation begins |
| **CET-4** | Assertion based on assumed behavior only — no code, architectural, or documentary evidence consulted | May not advance to implementation; must be upgraded or discarded |

**Required fields for every red-team finding:**

| Field | Content |
|---|---|
| Claim | The specific assertion being made (one sentence) |
| Evidence source | File path, line number, grep command, or test reference that supports the claim. For CET-2 findings: state "none yet — [what would be needed to upgrade]". For CET-4 findings: state "none — CET-4; must be upgraded to CET-1 or discarded before implementation begins". |
| Verification method | The grep command or check that can be run to confirm the claim |
| Certainty level | CET-1 / CET-2 / CET-3 / CET-4 |
| Assumptions | Any conditions that must be true for the claim to hold |
| Disqualifying assumptions | Conditions under which the claim fails or must be re-evaluated |
| Recommended action | PASS (with scope), BLOCKER_P1, BLOCKER_P2, HARDENING_ONLY, DOCUMENTATION_REQUIRED, or FALSE_POSITIVE |

**Certainty language rule application**

Any red-team conclusion containing the words `proven`, `impossible`, `unreachable`, `prevented`, `guaranteed`, `cannot happen`, or `no path exists` must satisfy the Certainty Language Rule (see Step 5 — Forbidden Wording Scan). No exception exists for red-team passes. CET-1 evidence must be in hand before any such phrase is written.

**PASS is not evidence**

A red-team "PASS" on any item is not self-evident. A PASS result must identify:

1. **Scope reviewed** — the specific function, role, path, or property that was assessed
2. **Evidence consulted** — the grep command or test reference that confirmed the property (CET-1 required for a PASS)
3. **Residual risks remaining** — any related concerns outside the assessed scope that were observed but not addressed
4. **Certainty level** — CET-1 through CET-4; a PASS with certainty lower than CET-1 must be documented at that tier, not as PASS

A PASS with no supporting evidence is a CET-4 claim and may not serve as the basis of an implementation decision.

**Residual risk discovery**

If a red-team review discovers a residual risk — any concern that cannot be fully dismissed but does not currently meet all five BLOCKER_P1 criteria — `docs/governance/OPEN_RESIDUALS.md` must be consulted and referenced in the red-team documentation. If the concern qualifies as HARDENING_ONLY, it must be added to the register before implementation begins.

**Governance-process change trigger**

If a red-team finding causes any change to classification standards, evidence requirements, reviewer workflow, or governance policy, a Lessons Learned entry is mandatory in `docs/governance/REVIEWER_LESSONS_LEARNED.md`. The LL entry must be created in the same PR that implements the finding's fix.

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
| Disqualifying assumption | Minting circuit incomplete: `SovereignWealthFund.sol` holds `MINTER_ROLE` but contains no `.mint()` call — verified by `grep -r '\.mint(' contracts/ --include="*.sol" \| grep -v fuzzing` → zero matches (the only `.mint(` call is in the fuzzing harness, excluded by `grep -v fuzzing`) |
| Re-evaluation triggers | Trigger 1 (new mint path), Trigger 3 (new consumer of `totalReserves`), Trigger 10 (new enforcement consumer of `reserveCompliant`), Trigger 11 (FND-01 or FND-02 closed via contract change) |

If Trigger 1 fires (a SWF mint path is added), criterion 4 must be re-evaluated. If criterion 4 now passes, K-RES-01 must be reclassified as BLOCKER_P1 and must block the PR that added the mint path.

*Relationship between K-RES-01 and FND-01/FND-02:*

FND-01 (freshness gate absent on `syncReserves`) and FND-02 (stale reserve values applied to `totalReserves`) are OPEN findings from GAP_MEX_04_ORACLE_FRESHNESS_REVIEW.md that describe the enabling conditions for K-RES-01's scenario. If FND-01 and FND-02 are closed via a contract change (timestamp gate threaded through the reserve sync path), that change fires Trigger 11 — K-RES-01 must be re-evaluated because the attack surface for stale-reserve submission changes. However, K-RES-01 would not automatically close on FND-01/FND-02 closure alone — the disqualifying assumption is criterion 4 (no mint enforcement consequence), not the absence of a freshness gate. If the freshness gate is added but the minting circuit remains incomplete, criterion 4 still fails and the HARDENING_ONLY classification remains valid. Both conditions changing together (FND-01/FND-02 fixed AND a mint path added) would require K-RES-01 to be re-evaluated as BLOCKER_P1.

**Centralized residual register:** All active HARDENING_ONLY findings must be listed in `docs/governance/OPEN_RESIDUALS.md`. When a finding is created, add it. When a re-evaluation trigger fires, mark it as "Under Re-evaluation." When re-classification completes, record the outcome and update the status.

#### DOCUMENTATION_REQUIRED Resolution Pathway

**A `DOCUMENTATION_REQUIRED` finding is not closed by editing documentation alone.** It is closed only after all five conditions are satisfied:

1. The required documentation change is made (file:line documented).
2. The affected claim is re-checked against current code or current governance evidence (grep result or equivalent CET-1 evidence recorded).
3. The reviewer-facing ambiguity is removed — the text that prompted the finding no longer appears or is unambiguously qualified.
4. The closure evidence is recorded in the PR description or linked report (see required fields below).
5. If the finding affected classification standards, evidence requirements, reviewer workflow, or governance policy: a Lessons Learned entry is created or updated in `docs/governance/REVIEWER_LESSONS_LEARNED.md` before the PR containing the fix is merged.

**Terminal states**

A DOCUMENTATION_REQUIRED finding must be assigned one of the following terminal states before closure is claimed:

| Terminal state | Meaning |
|---|---|
| `DOCUMENTATION_REQUIRED_CLOSED` | Required documentation made, claim re-verified against current code, ambiguity removed, closure evidence recorded |
| `RECLASSIFIED_HARDENING_ONLY` | Re-evaluation shows a hardening gap, not a documentation gap; re-classified and added to `docs/governance/OPEN_RESIDUALS.md` |
| `RECLASSIFIED_BLOCKER` | Missing documentation was obscuring a BLOCKER_P1 or BLOCKER_P2 defect; re-classified and blocks the current PR |
| `SUPERSEDED_BY_POLICY` | Resolved by a new or amended governance rule rather than document correction; rule referenced in terminal-state record |
| `DUPLICATE_OF_EXISTING_LL` | Already addressed by an existing Lessons Learned entry and its policy; LL entry number cited |
| `OPEN_PENDING_EVIDENCE` | Active — required change identified but not yet made; PR may not be merged in this state |

**Required closure evidence fields**

Every DOCUMENTATION_REQUIRED finding closed as any terminal state other than `OPEN_PENDING_EVIDENCE` must record the following fields in the PR description or linked governance report:

| Field | Content |
|---|---|
| Finding ID | Assigned identifier (e.g., FND-03, C-7, LL-010 Finding 2) |
| Originating PR / review URL | PR number and direct GitHub review comment URL |
| Affected file(s) | File path(s) and line numbers affected |
| Required documentation change | Precise description of what must be changed and why |
| Verification method | grep command or equivalent check confirming the change is present and accurate |
| Evidence source | CET-1 evidence: grep result, test output, or equivalent |
| Closure reviewer | Who verified closure (Self / external reviewer name) |
| Closure date | Date closure was recorded |
| Terminal state | One of the six states above |

**LL entry requirement**

Any DOCUMENTATION_REQUIRED finding that changes classification standards, evidence requirements, reviewer workflow, or governance policy must create or update a Lessons Learned entry in `docs/governance/REVIEWER_LESSONS_LEARNED.md` before the PR containing the fix is merged.

**OPEN_RESIDUALS.md requirement**

Any DOCUMENTATION_REQUIRED finding that affects a residual risk — including any finding that reveals a gap in HARDENING_ONLY classification evidence, disqualifying assumptions, or re-evaluation trigger coverage — must also update or reference `docs/governance/OPEN_RESIDUALS.md`. If the finding identifies a new residual, it must be added to the register before the PR is merged.

**Examples**

*FND-03 — NatSpec correction*

| Field | Content |
|---|---|
| Finding ID | FND-03 |
| Originating PR / review URL | PR #83 — NatSpec missing on `API3Oracle.syncReserves` |
| Affected file(s) | `contracts/oracles/API3Oracle.sol` |
| Required documentation change | Add `@param`, `@notice` NatSpec to `syncReserves` per coding standard |
| Verification method | `grep -A5 'function syncReserves' contracts/oracles/API3Oracle.sol` — confirm NatSpec present |
| Evidence source | grep result in PR description |
| Closure reviewer | Self |
| Closure date | 2026-06-17 |
| Terminal state | `DOCUMENTATION_REQUIRED_CLOSED` |

*FND-04 — CF-1 runbook correction*

| Field | Content |
|---|---|
| Finding ID | FND-04 |
| Originating PR / review URL | PR #86 — CF-1 breach detection runbook missing re-activation step |
| Affected file(s) | `docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md` |
| Required documentation change | Add court-only emergency lock deactivation step; align with `onlyCourt` enforcement in kernel |
| Verification method | `grep 'onlyCourt\|deactivate\|emergencyLock' docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md` — confirm step present |
| Evidence source | grep result in PR description |
| Closure reviewer | Self |
| Closure date | 2026-06-17 |
| Terminal state | `DOCUMENTATION_REQUIRED_CLOSED` |

*FND-05 — Oracle call-sequence note*

| Field | Content |
|---|---|
| Finding ID | FND-05 |
| Originating PR / review URL | PR #85 — oracle integration docs omitted Gate A → Gate B ordering constraint |
| Affected file(s) | `docs/oracle/` integration protocol |
| Required documentation change | Add call-sequence note: Gate A (PAH_USD_KEY refresh) must precede `syncReserves`; Gate B rate limit applies per `MAX_DATA_AGE` window |
| Verification method | `grep 'Gate A\|Gate B\|MAX_DATA_AGE' docs/oracle/` — confirm both gates documented |
| Evidence source | grep result in PR description |
| Closure reviewer | Self |
| Closure date | 2026-06-17 |
| Terminal state | `DOCUMENTATION_REQUIRED_CLOSED` |

*LL registry template corrections (PR #90 → #91)*

| Field | Content |
|---|---|
| Finding ID | LL-007 root finding |
| Originating PR / review URL | `https://github.com/fafa33/Iran-OS/pull/90#discussion_r3432074234` |
| Affected file(s) | `docs/governance/REVIEWER_LESSONS_LEARNED.md` (Cross-Reference Rule) |
| Required documentation change | Add self-review exception clause defining valid `N/A` form for entries with no external comment URL |
| Verification method | grep all LL entries where Reviewer contains "Self" — confirm Review comment URL follows `N/A — self-identified ... finding` format |
| Evidence source | Confirmed in PR #91 |
| Closure reviewer | Self |
| Closure date | 2026-06-18 |
| Terminal state | `SUPERSEDED_BY_POLICY` — Cross-Reference Rule amended; LL-007 created |

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
| **CET-4** | Assertion based on assumed behavior only — no code, architectural, or documentary evidence consulted | May not appear in a pushed PR or red-team pass; must be upgraded or discarded |

**CET-2, CET-3, and CET-4 claims may not appear in a pushed PR.** Every claim must reach CET-1 at push time.

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

Before every push, apply the 5-criterion BLOCKER_P1 gate and the Certainty Language Rule to every claim in:
- every changed file
- the PR title
- the PR description (including summary, evidence block, checklist, and all reviewer-facing body text)

Ask: "What would Codex challenge here, and can I answer it with grep evidence already in hand?" If the answer is no, collect the evidence first.

**Any certainty claim in a PR description must satisfy the same evidence standard as a claim in a changed file.** A PR description is not exempt from the Certainty Language Rule by virtue of not being committed to the repository.

**Gate:** If the PR description contains any forbidden or conditionally-allowed certainty phrase from the Certainty Language Rule table, the PR must not be marked ready until:
- the phrase is removed, or
- the phrase is qualified to meet the conditionally-allowed standard, or
- CET-1 evidence is provided inline in the PR description.

#### Step 7 — Cross-Document Consistency

For every gap, finding, or status being changed: grep for the gap/finding ID across all `docs/` files and update every reference in the same PR. A gap marked CLOSED in one report but Open in another will generate a Codex finding.

#### Step 8 — PR Body Evidence Block

Every sensitive-component PR covered by this Preflight Standard (any PR touching Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, runbooks, gap registers, or audit reports — as defined in the preamble above) must include an Evidence section.

**Omission rule:**
- For sensitive-component PRs, omission of the Evidence Block is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).
- For non-sensitive PRs, the Evidence Block is optional — unless the PR makes any security, governance, reachability, role, reserve, oracle, trigger, treasury, mint, freeze, or closure claim, in which case the Evidence Block is required for those claims.

**Open residuals may be recorded as "none" only after consulting `docs/governance/OPEN_RESIDUALS.md` (Step 10).** Recording "none" without consulting the register is a preflight failure.

```
## Evidence
- grep: `<command>` → `<result>`
- Role grant path: `<contract>:<line>` → `<deployment manifest section>`
- npm test: N passing
- Open residuals (Step 10 — requires consulting docs/governance/OPEN_RESIDUALS.md):
  - OPEN_RESIDUALS.md consulted: [YES / NO]
  - Matching residual IDs: [list of matching HARDENING_ONLY entry IDs, or "No matching open residuals found after consulting OPEN_RESIDUALS.md"]
  - Residual re-evaluation required: [YES / NO]
  - Re-evaluation result: [per-residual result, or "N/A — no matching residuals identified"]
- Certainty language scan:
  - Changed files scanned: [YES / NO]
  - PR title scanned: [YES / NO]
  - PR description scanned: [YES / NO]
  - Certainty terms found: [list terms, or "none"]
  - Evidence for each term: [inline CET-1 evidence per term, or "N/A — no terms found"]
  - Terms rewritten or qualified: [list, or "N/A"]
  - Result: [PASS / BLOCKED — phrase not removed, qualified, or evidenced]
  - CET level: [CET-1 / below CET-1]
```

#### Step 9 — Deployment Manifest Currency Check

For any PR touching a sensitive component (Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, or authority boundaries):

1. Identify every role and contract address introduced or modified by the PR.
2. Grep `docs/deployment/` for each role and contract address: `grep -r 'ROLE_NAME\|ContractName' docs/deployment/`. Confirm the manifest documents the current wiring.
3. Identify the authoritative manifest file for the PR's scope. If multiple deployment manifests exist in `docs/deployment/`, list all relevant ones and identify which is authoritative for the components affected by this PR.
4. Determine the manifest's authoritative date using the following priority:
   - **First:** An explicit `Last verified:` or `Manifest date:` field in the manifest file — this is the authoritative date.
   - **Fallback (if no explicit field exists):** The most recent git commit touching the manifest file: `git log -1 --format="%H %ad" -- docs/deployment/<manifest-file>`. The Step 9 result must be classified below CET-1 unless this commit evidence is recorded inline.
5. Evaluate staleness against two independent conditions — either condition alone requires action:
   - **Condition A (inherited staleness):** Is the manifest's authoritative date older than the most recent sensitive-component PR merged to main? Run `git log -1 --format="%H %ad" -- docs/deployment/<manifest-file>` and compare to the date of the most recent sensitive-component merge on main. If the manifest predates that merge, it is stale regardless of what this PR changes — Step 9 must record DOCUMENTATION_REQUIRED.
   - **Condition B (this PR's changes):** Does this PR change deployment topology, role assignment, authority routing, oracle wiring, reserve path, treasury path, trigger path, mint path, or emergency/freeze path? If yes, the manifest must be re-verified and the date field updated in this PR.
6. If no manifest exists for the affected component, Step 9 must fail as DOCUMENTATION_REQUIRED — a missing manifest is not a PASS.
7. If the manifest is stale — missing a role grant, a contract address, or a wiring change introduced since the manifest was last updated — update it in the same PR.

A claim that wiring is "documented in `docs/deployment/`" requires CET-1 evidence: a grep result showing the specific role or address is present in the manifest file and section cited.

**A PR that claims production wiring is documented but cannot produce the manifest grep result fails the preflight.**

**Required evidence block entry for Step 9:**

Every sensitive-component PR must include the following in its PR Evidence section:

```
Step 9 — Deployment Manifest Currency:
- Manifest file(s) checked: [path(s) or "N/A — PR does not affect deployment topology"]
- Authoritative date field: [Last verified / Manifest date / none — commit evidence used]
- Date value: [date or "N/A — see commit evidence below"]
- Commit evidence if no date field: [git log -1 output, or "N/A — explicit date field present"]
- Condition A (inherited staleness): manifest predates latest sensitive-component PR on main?
  - Manifest last-update: [date from explicit field above, or commit hash + date from git log above]
  - Latest sensitive-component PR on main: [PR number and merge date — run `git log --merges --pretty=format:"%h %ad %s" --date=short origin/main | head -5` to identify]
  - Comparison result: manifest [OLDER / NEWER / EQUAL] → [DOCUMENTATION_REQUIRED / PASS]
- Condition B (this PR's changes): PR changes deployment topology, roles, oracle wiring, reserve/treasury/trigger/mint/freeze path? [YES / NO]
- Re-verification required? [YES (Condition A) / YES (Condition B) / NO — both conditions evaluated and neither applies]
- Result: [PASS / DOCUMENTATION_REQUIRED]
- CET level: [CET-1 / below CET-1 / DOCUMENTATION_REQUIRED]
```

**A Step 9 compliance claim is CET-1 only if all five conditions are met:**
1. Manifest file is identified by path.
2. Date source is identified (explicit `Last verified:`/`Manifest date:` field, or commit evidence recorded).
3. Date or commit hash and timestamp is recorded inline.
4. Staleness condition is evaluated against the PR's changes.
5. Result is recorded in the Evidence block as PASS or DOCUMENTATION_REQUIRED.

A Step 9 claim that omits any of these five conditions is CET-2 at best and may not be stated as PASS.

#### Step 10 — Open Residuals Consultation

For any PR touching sensitive components — Kernel, PahlaviToken, Treasury, SovereignWealthFund, TriggerProtocol, API3Oracle, oracle docs, reserve docs, role docs, deployment manifests, runbooks, or governance policy docs — **or any PR whose changes match any re-evaluation trigger event listed in the HARDENING_ONLY Re-Evaluation Policy above** (including new mint paths, treasury paths, reserve update paths, role model changes, AccessControl changes, oracle architecture changes, governance authority changes, emergency/freeze routing changes, deployment topology changes, or new downstream consumers of a state variable tracked by an active HARDENING_ONLY finding) — before opening, updating, marking ready, or merging the PR:

1. Read `docs/governance/OPEN_RESIDUALS.md`.
2. For each active HARDENING_ONLY entry in the register, check whether any of the entry's listed re-evaluation triggers applies to this PR.
3. If a trigger matches, re-run the 5-criterion evaluation table for that finding against the current codebase before continuing. If re-classification upgrades a finding to BLOCKER_P1, that finding must block this PR.
4. Record the result in the PR Evidence block — see Step 8.

**A sensitive-component PR may not be pushed, marked ready, or merged without completing this step.** Omitting the Open Residuals Consultation is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).

#### Step 11 — Documentation-Parity Review

**Lesson learned:** PR #120 changed `PriceOracle`'s constructor to `constructor(admin, kernel)`, moving `DEFAULT_ADMIN_ROLE` from the Kernel to `SOVEREIGN_ADDRESS`. Step 9 (Deployment Manifest Currency Check) passed mechanically — `PriceOracle` and `FEEDER_ROLE` were both still present in `docs/deployment/`. But Step 9 only greps for the ROLE_NAME/ContractName **string**; it does not verify that the **caller/authority described alongside that string** is still accurate. `docs/deployment/ROLE_WIRING_CHECKLIST.md:187` still named `kernel` as the caller for the `FEEDER_ROLE` grant, and `DEPLOYMENT_MANIFEST_PROTOCOL.md`'s wiring pseudocode still showed the old flow. An operator following those docs after PR #120 would have the grant revert, since the Kernel no longer holds admin authority on `PriceOracle` — leaving `submitPrice()` unusable until the undocumented sovereign-caller path was discovered. Codex identified this gap in review of PR #120 (`https://github.com/fafa33/Iran-OS/pull/120#discussion_r3532524130`); fixed in PR #121.

**Trigger scope.** Whenever any change modifies:
- ownership
- `DEFAULT_ADMIN_ROLE`
- access control
- `grantRole()`
- constructor parameters
- deployment authority
- runtime authority
- governance authority
- deployment sequence
- deployment wiring

the **same PR** MUST update all affected:
- deployment manifests
- deployment protocols
- runbooks
- operator guides
- role wiring documentation
- deployment checklists

**A Documentation-Parity Review is mandatory before every PR in the trigger scope is considered READY.** Runtime, deployment scripts, manifests, and operational documentation must describe exactly the same authority model. A PR that changes who can call a function without updating every document that names a caller for that function fails this step.

**How Step 11 differs from Step 9.** Step 9 confirms a role or contract **name** is present somewhere in `docs/deployment/` (`grep -r 'ROLE_NAME\|ContractName' docs/deployment/`). Step 11 confirms the **caller named alongside that role/contract in prose or pseudocode** still matches the current constructor/grant logic in code. Passing Step 9 does not satisfy Step 11 — the two checks are independent and both required.

**Verification method:**
1. For every contract or role touched by the PR, run `grep -rn '<ContractName>\|<ROLE_NAME>' docs/deployment/` to enumerate every document location that describes it.
2. For each match, read the surrounding prose/pseudocode and confirm the named caller (e.g., `kernel`, `sovereign`, `SOVEREIGN_ADDRESS`) matches the actual `msg.sender` requirement in the current constructor/role-grant code (`grep -n 'DEFAULT_ADMIN_ROLE\|constructor' contracts/<path>/<Contract>.sol`).
3. If any documented caller no longer matches the code, update that document in this PR — do not defer to a follow-up PR.
4. Re-run `npm test` after documentation edits to confirm no fixture drift.

**Required evidence block entry for Step 11:**

```
Step 11 — Documentation-Parity Review:
- Trigger scope matched: [list which of: ownership / DEFAULT_ADMIN_ROLE / access control / grantRole() / constructor parameters / deployment authority / runtime authority / governance authority / deployment sequence / deployment wiring, or "N/A — none matched"]
- Contracts/roles affected: [list, or "N/A"]
- Docs greped: [file paths + grep command, or "N/A"]
- Caller/authority description re-verified against code: [YES / NO, with grep command + result per doc]
- Documents updated in this PR: [list, or "N/A — no stale descriptions found"]
- Result: [PASS / DOCUMENTATION_REQUIRED]
- CET level: [CET-1 / below CET-1]
```

**Omission rule:** for any PR matching the trigger scope above, omitting the Documentation-Parity Review is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).

#### Step 12 — Lesson-Learned Compliance Consultation

`docs/governance/REVIEWER_LESSONS_LEARNED.md` is a mandatory engineering specification with the same authority as this PR Preflight Standard — not a documentation-only record. No implementation, deployment, documentation change, governance change, runtime modification, deployment wiring, security change, or production change may begin, continue, or be marked ready without satisfying this step.

**Before starting any task:**
1. Read `docs/governance/REVIEWER_LESSONS_LEARNED.md` (in full, or at minimum every entry whose `Affected files` or subject matter overlaps the planned change).
2. Identify every LL entry whose `Policy created` applies to the work about to be done.
3. Apply each applicable LL entry's policy during implementation — not as an afterthought at PR time.

**Before opening any PR:**
1. Re-list every LL entry identified as applicable in step 1 above.
2. Verify the implementation satisfies each one's `Policy created` and `Verification method`.
3. If any applicable LL requirement is not satisfied, the PR is **not READY** — fix the gap before opening or before removing draft status, whichever is later.

**Before declaring READY:**
1. Re-check the finished implementation against every applicable LL entry one final time (LL entries can be added by other contributors between task start and PR-ready).
2. Record the applicable LL IDs and an explicit compliance confirmation in the Evidence Block (below) — an unfilled placeholder is treated as non-compliance.

**Every new Codex (or other reviewer) finding must, per the existing Reviewer Lessons Learned Registry rules below:** be fixed; have its root cause identified; become a new LL entry with a verification method; be integrated into the engineering workflow (`CLAUDE.md` and/or `.github/pull_request_template.md` as the finding requires); and become part of future pre-merge validation via this same Step 12 mechanism, so the same finding class is caught by consultation on every subsequent PR, not only remembered by whoever fixed it.

**Verification method:** `grep -c '^## LL-' docs/governance/REVIEWER_LESSONS_LEARNED.md` confirms the registry is present and its entry count; that alone is not sufficient evidence of consultation — the Evidence Block below must name the specific LL IDs reviewed (or state "none identified — [scope reviewed]"), not merely the count.

**Required evidence block entry for Step 12:**

```
Step 12 — Lesson-Learned Compliance:
- Registry read before implementation: [YES / NO]
- Applicable LL IDs identified: [list of LL-XXX IDs, or "none identified — [scope reviewed, e.g. 'documentation-only change, no code/role/authority path touched']"]
- Compliance verified per applicable entry: [per-LL-ID PASS/gap note, or "N/A — none applicable"]
- Re-checked immediately before marking READY: [YES / NO]
- Result: [PASS / NOT READY — gap: <description>]
```

**Omission rule:** omitting the Lesson-Learned Compliance Consultation, or leaving its Evidence Block as an unfilled template, is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).

#### Step 13 — Canonical Checkpoint Currency

`docs/governance/CANONICAL_CHECKPOINT.md` is the Single Source of Truth (SSOT) for current Iran-OS project state — not documentation, a mandatory engineering artifact with the same authority as this PR Preflight Standard. Every merge to `main` MUST update this file in the same PR. Deferring the update to a follow-up PR is not permitted. A PR is **not READY** until the Canonical Checkpoint reflects the merged state.

**Required minimum fields** (see the file's own Summary table): latest merged PR, latest merged commit, current baseline, current roadmap position, current deployment coverage, current test count, current production status, remaining deployment targets, open residual work, applicable governance version, latest Lesson Learned ID, last-updated timestamp.

**Before opening any PR:** update every field in `docs/governance/CANONICAL_CHECKPOINT.md` that this PR's changes affect (deployment coverage, test count, roadmap position, production status, open residuals, latest LL ID, applicable governance version) to reflect the state the PR will produce once merged.

**Known structural limitation — squash-merge commit SHA:** under this repository's squash-merge convention, the exact merge commit SHA landing on `main` is assigned by GitHub at merge time and is not knowable before merge. A PR satisfies this step by (a) setting "Latest Merged PR" to its own PR number, (b) recording its pre-merge head commit SHA with an explicit note that the true post-merge SHA must be confirmed via the file's own Verification Method immediately after merging, and (c) not leaving the file pointing at an older, now-superseded PR or commit as if it were still current. This is a disclosed limitation, not a certainty-language violation — no claim is made about a SHA that does not yet exist.

**Single Source of Truth requirement:** do not duplicate the fields tracked by the Canonical Checkpoint into a new, separately-maintained status document. Other documents remain authoritative for their own detailed domain narratives (the roadmap for phase history, `CHANGELOG.md` for change history, deployment manifests for per-contract wiring) and may be referenced by the checkpoint — this step does not require stripping existing detail from those documents. It requires that the checkpoint be the place a reader goes for the *current-state snapshot*, and that no new document be created to compete with it for that role.

**Verification method:** `git log origin/main -1 --format="%H %ad %s"` compared against `docs/governance/CANONICAL_CHECKPOINT.md`'s "Latest Merged PR" / "Latest Commit" fields — if `main`'s head PR number is not reflected in the checkpoint, Step 13 has not been satisfied for the current state of `main`. Re-run the checkpoint file's own Verification Method block for the remaining fields.

**Required evidence block entry for Step 13:**

```
Step 13 — Canonical Checkpoint Currency:
- Fields updated in this PR: [list of changed fields, e.g. "deployment coverage, test count, latest Lesson Learned ID", or "N/A — no tracked field changed"]
- Latest Merged PR field set to this PR's number: [YES / NO / N/A]
- Pre-merge head SHA recorded with post-merge verification note: [YES / NO / N/A]
- Post-merge verification command provided: [YES / NO]
- Result: [PASS / NOT READY — gap: <description>]
```

**Omission rule:** omitting the Canonical Checkpoint Currency update, or leaving its Evidence Block as an unfilled template, is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).

#### Step 14 — Governance Synchronization Review

Iran-OS has exactly three authoritative governance artifacts — `docs/governance/CANONICAL_CHECKPOINT.md` (current project state), `docs/governance/REVIEWER_LESSONS_LEARNED.md` (permanent engineering rules), and `CHANGELOG.md` (historical record of completed changes). Each is authoritative only for its own responsibility; none may duplicate another's content. But because they are three separate documents, they can drift apart even when each one, read in isolation, looks individually correct. This step is the explicit gate that catches that drift before merge.

**Trigger scope:** whenever a merged change affects any of: governance state, engineering workflow, deployment workflow, security workflow, roadmap state, production readiness, or a permanent engineering rule.

**Requirement:** for a PR in the trigger scope, the author MUST determine which of the three authoritative artifacts require updates as a result of this PR, and for each one explicitly record either `Updated` or `No update required` (with a stated reason) in the PR Evidence Block. **Never assume that because one artifact changed, the others should change automatically** — each of the three must be independently and explicitly considered, not inferred from another's edit.

- [ ] Canonical Checkpoint (`docs/governance/CANONICAL_CHECKPOINT.md`)
- [ ] Lesson Learned Registry (`docs/governance/REVIEWER_LESSONS_LEARNED.md`)
- [ ] CHANGELOG (`CHANGELOG.md`)

**A PR is not READY** until every one of the three artifacts above has either been updated in the PR, or explicitly documented as "No update required" with a reason — leaving one unaddressed (neither updated nor explained) is a preflight failure, not a neutral default.

**Anti-duplication requirement:** satisfying this step never means copying the same fact into more than one of the three artifacts. Each artifact records the fact once, in the artifact responsible for that kind of fact (a new permanent rule → the LL registry only; a completed change → `CHANGELOG.md` only; a change to current state, coverage, or test count → the Canonical Checkpoint only). Synchronization means the three stay *consistent* with each other and with reality, not that they repeat each other.

**Verification method:** for the PR under review, independently answer "does this PR's diff constitute (a) a change to current project state, (b) a new or modified permanent rule, and/or (c) a completed, historically-notable change?" for each of the three artifacts — do not infer the answer for one artifact from the answer already given for another. Cross-check with `git diff --stat` that the PR's actual file changes match what the Evidence Block claims.

**Required evidence block entry for Step 14:**

```
Step 14 — Governance Synchronization Review:
- Trigger scope matched: [governance state / engineering workflow / deployment workflow / security workflow / roadmap state / production readiness / permanent engineering rule, or "N/A — none matched"]
- Canonical Checkpoint: [Updated — fields changed: <list> / No update required — reason: <reason>]
- Lesson Learned Registry: [Updated — LL-XXX added/modified / No update required — reason: <reason>]
- CHANGELOG: [Updated — entry added / No update required — reason: <reason>]
- Result: [PASS / NOT READY — gap: <description>]
```

**Omission rule:** omitting the Governance Synchronization Review, or leaving its Evidence Block as an unfilled template, is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).

#### Step 15 — Governance Minimalism Review

The framework's greatest risk is no longer missing rules — it is governance bloat. This step is the gate that runs *before* any of Steps 9–14 would even apply: it asks whether a new permanent governance artifact should be created at all, before asking how it should be tracked or synchronized once it exists.

**Trigger scope:** any PR that adds a new permanent governance rule, Lesson Learned, workflow step, merge gate, checklist item, Evidence Block, protocol document, or permanent document.

**The 7-criterion gate.** A new permanent governance artifact may be added only if it satisfies all seven:

| # | Criterion | Pass / Fail | Evidence |
|---|---|---|---|
| 1 | Closes a demonstrated engineering failure | | |
| 2 | Cannot be solved by extending an existing rule | | |
| 3 | Does not duplicate an existing responsibility | | |
| 4 | Does not create parallel terminology | | |
| 5 | Has a clearly defined owner | | |
| 6 | Has a measurable verification method | | |
| 7 | Permanently reduces future engineering risk | | |

If any criterion fails, the new artifact must not be created — extend an existing one instead (see the Duplication Review below).

**Governance Duplication Review.** Before adding any permanent governance artifact, explicitly answer all four:

1. Can an existing rule be extended instead?
2. Can an existing LL entry be amended instead?
3. Can an existing checklist be extended instead?
4. Can an existing workflow stage absorb this responsibility?

**If the answer to any question is YES, do not create a new permanent artifact — extend the existing one.** A new artifact may be created only when every answer is NO, and that must be demonstrated with reasoning, not merely asserted.

**Governance refactoring.** Governance itself is subject to refactoring: if a review under this step (or any other review) finds that multiple permanent rules have become redundant, they must be merged while preserving intent, rather than left to coexist indefinitely. This is a standing capability, not a one-time exercise.

**Verification method:** for the artifact being proposed, the 7-criterion table above must be completed with evidence (not left blank), and the four Duplication Review questions must each have an explicit, reasoned NO before a new artifact is created. `grep -n "^#### Step 15" CLAUDE.md` confirms this step exists; the PR's own Evidence Block is the record that it was applied to this specific PR.

**Required evidence block entry for Step 15:**

```
Step 15 — Governance Minimalism Review:
- New permanent governance artifact proposed in this PR: [description, or "N/A — no new permanent governance artifact"]
- 7-criterion gate: [completed table, or "N/A"]
- Can an existing rule be extended instead? [YES — extended: <rule> / NO — reason: <reason>]
- Can an existing LL entry be amended instead? [YES — amended: LL-XXX / NO — reason: <reason>]
- Can an existing checklist be extended instead? [YES — extended: <checklist> / NO — reason: <reason>]
- Can an existing workflow stage absorb this responsibility? [YES — absorbed by: <stage> / NO — reason: <reason>]
- Refactoring candidates identified: [list of redundant rules found and merged, or "none identified"]
- Result: [PASS / NOT READY — gap: <description>]
```

**Omission rule:** omitting the Governance Minimalism Review on a PR that adds a new permanent governance artifact, or leaving its Evidence Block as an unfilled template, is a preflight failure equivalent to omitting Step 1 (Rebase) or Step 2 (Test).

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

**This registry is a mandatory engineering specification, not documentation.** It has the same authority as this PR Preflight Standard. Existing LL entries must be actively consulted and applied before any implementation begins, before any PR is opened, and before any PR is marked READY — see Step 12 above. Treating the registry as a passive historical record, rather than an enforced pre-implementation gate, is itself the class of failure Step 12 exists to prevent.

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
