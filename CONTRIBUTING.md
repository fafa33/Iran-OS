# Contributing to IranOS

## Repository Philosophy

IranOS is an open-source blockchain governance operating system — a technical blueprint for a post-Islamic-Republic Iran. It encodes a secular constitutional monarchy (*Charter of Welfare and Justice*) into auditable Solidity smart contracts, governance protocols, and deployment documentation.

**This project is not production-ready.** No external audit, formal verification, or mainnet deployment has occurred. All contributions are evaluated against the constitution and the technical whitepaper. Changes that conflict with constitutional red lines (TR-01 to TR-06) will not be accepted.

---

## Language Policy

- **Primary language:** Persian (Farsi) with RTL formatting
- **External reviewers:** English is fully welcome — use English for issues, PRs, and review submissions
- **Smart contract comments:** Persian; error message strings in English
- **Documents:** Persian documents use `<div dir="rtl">` wrappers; do not strip these

Full contributing guide in Persian: [docs/contributing-fa.md](docs/contributing-fa.md)

---

## Before You Contribute

1. Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
2. Read [SECURITY.md](SECURITY.md) — understand the non-claim policy
3. For Step 13 / external review: read [docs/step13/STEP13_REVIEWER_INDEX_EN.md](docs/step13/STEP13_REVIEWER_INDEX_EN.md)
4. Browse [Issue #35](https://github.com/fafa33/Iran-OS/issues/35) for the current Step 13 review status

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
2. Make your changes — see [Code Quality Rules](#code-quality-rules) below
3. Run `npm test` — all 499 tests must pass
4. Open a PR using the default PR template
5. Complete the non-claim checklist in the PR template

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
- No secrets or private keys in source

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

1. Start at [docs/step13/STEP13_REVIEWER_INDEX_EN.md](docs/step13/STEP13_REVIEWER_INDEX_EN.md)
2. Submit findings via the **External Review** issue template
3. Reference [Issue #35](https://github.com/fafa33/Iran-OS/issues/35)

Your review does not close Step 13 or Step 12. It is recorded as external evidence.
