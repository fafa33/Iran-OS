# Contributing to IranOS

## Repository Philosophy

IranOS is an open-source blockchain governance operating system — a technical blueprint for a post-Islamic-Republic Iran. It encodes a secular constitutional monarchy (*Charter of Welfare and Justice*) into auditable Solidity smart contracts, governance protocols, and deployment documentation.

**This project is not production-ready.** No external audit, formal verification, or mainnet deployment has occurred. All contributions are evaluated against the constitution and the technical whitepaper. Changes that conflict with constitutional red lines (TR-01 to TR-06) will not be accepted.

---

## Mandatory Reviewer Primer

Before proposing architectural, governance, treasury, oracle, monetary, Kernel, protocol, or smart-contract changes, contributors and reviewers must read the reviewer primers:

- [Reviewer Primer — English](docs/REVIEWER_PRIMER.md)
- [راهنمای بازبین — فارسی](docs/REVIEWER_PRIMER_FA.md)

IranOS is a sovereign resilience infrastructure, not a DeFi protocol, DAO, governance-token system, central-bank simulator, or yield-maximization platform. Recommendations that appear reasonable in conventional Web3 systems may be constitutional regressions in IranOS if they weaken Kernel immutability, oracle non-sovereignty, reserve protections, monetary discipline, or authority containment.

---

## Language Policy

- **Primary language:** Persian (Farsi) with RTL formatting
- **External reviewers:** English is fully welcome — use English for issues, PRs, and review submissions
- **Smart contract comments:** Persian; error message strings in English
- **Documents:** Persian documents use `<div dir="rtl">` wrappers; do not strip these

Full contributing guide in Persian: [docs/contributing-fa.md](docs/contributing-fa.md)

---

## Before You Contribute

1. Read [docs/REVIEWER_PRIMER.md](docs/REVIEWER_PRIMER.md) or [docs/REVIEWER_PRIMER_FA.md](docs/REVIEWER_PRIMER_FA.md)
2. Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. Read [SECURITY.md](SECURITY.md) — understand the non-claim policy
4. For Step 13 / external review: read [docs/step13/STEP13_REVIEWER_INDEX_EN.md](docs/step13/STEP13_REVIEWER_INDEX_EN.md)
5. Browse [Issue #35](https://github.com/fafa33/Iran-OS/issues/35) for the current Step 13 review status

---

## Issue Workflow

Use the appropriate issue template:

| Template | Use for |
|----------|---------|
| **Bug Report** | Bugs in contracts, tests, or documentation |
| **Feature Request** | New features — evaluated against the constitution |
| **External Review** | Independent review findings (Step 13 / Issue #35) |
| **Step 12 Evidence / Signoff** | Step 12 audit and formal verification evidence |

**Labels:**
- `bug` — confirmed bug
- `enhancement` — new feature or improvement
- `core` — kernel-level work (requires careful constitutional review)
- `good-first-issue` — suitable for new contributors
- `step12` — Step 12 evidence or signoff
- `external-review` — Step 13 external review submission

---

## PR Workflow

1. Fork the repository and create a branch: `feature/<name>` or `fix/<name>`
2. Read the reviewer primer before making architecture, doctrine, protocol, treasury, oracle, monetary, Kernel, or contract-level changes
3. Make your changes — see [Code Quality Rules](#code-quality-rules) below
4. Run `npm test` — all 499 tests must pass
5. Open a PR using the default PR template
6. Complete the reviewer-primer, doctrine, and non-claim checklists in the PR template

**Branch naming:**
```
feature/<feature-name>
fix/<bug-name>
docs/<doc-name>
```

**Commit message format:**
```
feat(trigger): add TR-02 detection layer
fix(monetary): fix reserve ratio calculation
docs(glossary): add ZK-Rollups definition
```
Prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `audit`, `chore`

---

## Code Quality Rules

- Solidity pragma: `^0.8.20`
- All state-changing external functions must use `nonReentrant`
- Role-based access via `onlySovereign`, `onlyCourt`, `onlyOracle`, `onlyGuardian`, `onlyKernel` modifiers
- NatSpec comments (`@notice`, `@dev`, `@param`) required on all public/external functions
- Test coverage target: 95% minimum
- **Never** lower `MULTISIG_THRESHOLD` (7-of-9) or `COUNCIL_THRESHOLD`
- **Never** remove a `nonReentrant` guard
- **Never** introduce admin backdoors or upgrade proxies on the Kernel
- **Never** give oracles emergency authority over constitutional, treasury, reserve, freeze, or monetary actions
- **Never** convert constitutional safeguards into ordinary configurable parameters without explicit doctrine review
- No secrets or private keys in source

### Deployment-Path Parity (Mandatory)

Any PR touching **Kernel, Oracle, Reserve, Treasury, TriggerProtocol, PahlaviToken, roles, deployment wiring, or authority boundaries** requires a deployment-path parity test in addition to unit tests. Unit tests alone are insufficient for these components.

**What is a deployment-path parity test?** A test that proves the exact production-intended caller path works using only role wiring and setup documented in the deployment manifest (`docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md` or `docs/deployment/ROLE_WIRING_CHECKLIST.md`).

**The following are NOT proof of production reachability:**
- `hardhat_impersonateAccount` or any Hardhat-only JSON-RPC method
- Test-only role grants that have no mainnet-reachable equivalent
- Artificial caller accounts with no documented production grant path
- Undocumented manual setup steps not present in the deployment manifest
- Admin shortcuts unavailable on mainnet

If impersonation appears in a test file, it must be explicitly labeled `// TEST-ONLY — not a production grant path` and cannot be cited as evidence that the production path works.

**A PR touching a sensitive component is not mergeable if CI passes while the production caller path is unreachable on mainnet.**

**Why this rule exists — GAP-MEX-05:** During the GAP-MEX-05 closure work, unit tests passed CI while three production reachability gaps went undetected: (1) `API3Oracle` had no `syncReserves` forwarding method; (2) `pahlaviToken` was not configured in Kernel's deployment flow; (3) `FEEDER_ROLE` on `API3Oracle` had no mainnet-reachable grant path — `hardhat_impersonateAccount` in the test suite created a false appearance of a working production path. All three gaps required separate Codex findings and PRs (#76–#81) to close.

---

## Non-Claim Discipline

Every PR must confirm:

- No production-readiness claim
- No release approval claim
- No completed external audit claim
- No completed formal verification claim
- No Step 12 blocker closure by implication

See [SECURITY.md](SECURITY.md) for the full non-claim policy.

---

## External Reviewers

If you are reviewing IranOS independently:

1. Read [Reviewer Primer — English](docs/REVIEWER_PRIMER.md) or [راهنمای بازبین — فارسی](docs/REVIEWER_PRIMER_FA.md)
2. Start at [docs/step13/STEP13_REVIEWER_INDEX_EN.md](docs/step13/STEP13_REVIEWER_INDEX_EN.md)
3. Submit findings via the **External Review** issue template
4. Reference [Issue #35](https://github.com/fafa33/Iran-OS/issues/35)

Your review does not close Step 13 or Step 12. It is recorded as external evidence.
