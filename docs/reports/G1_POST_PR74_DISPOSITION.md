# G-1 Post-PR #74 Disposition Note

**Finding ID:** G-1  
**Date:** 2026-06-16  
**Disposition type:** Mitigation checkpoint — structural hardening complete  
**G-1 status:** OPEN  
**KTJ-05 status:** OPEN  
**INV-02 status:** OPEN  
**Production-ready claim:** None  
**Cryptographic verification claim:** None  

---

## Purpose

This document records that PR #74 completed the structural mitigation phase of G-1 and did **not** close G-1. The finding remains open. Full closure requires a deployed on-chain ZK verifier contract.

Prior reports on record:

- [`F01_JURY_ZK_PROOF_CRITICAL.md`](./F01_JURY_ZK_PROOF_CRITICAL.md) — original finding report (pre-PR #74 state)
- [`INV04_G1_CRITICAL_ZK_PROOF_GAP.md`](./INV04_G1_CRITICAL_ZK_PROOF_GAP.md) — invariant audit cross-reference (pre-PR #74 state)

Those documents describe the pre-mitigation state (`require(zkProof.length > 0, ...)`). This document records what changed in PR #74 and what remains open.

---

## What Changed in PR #74

**Merged commit:** `d5cfb6e` (`fix(justice): G-1 mitigation — structural hardening (trivial fake proof rejection) (#74)`)

**Files changed:**
- `contracts/justice/JurySelection.sol` (+26/-1)
- `test/07_jury_selection.test.js` (+77/-9)

### Contract change

```solidity
// Before PR #74
require(zkProof.length > 0, "JurySelection: invalid ZK proof");

// After PR #74
uint256 public constant ZK_PROOF_MIN_LENGTH = 256;

require(
    zkProof.length >= ZK_PROOF_MIN_LENGTH && zkProof.length % 32 == 0,
    "JurySelection: invalid ZK proof"
);
```

The constant `ZK_PROOF_MIN_LENGTH = 256` encodes the Groth16 ABI-encoded proof minimum:
`pi_a (64 bytes) + pi_b (128 bytes) + pi_c (64 bytes) = 256 bytes`.

### Test changes

- Updated shared `fakeZkProof` fixture from a 1-byte UTF-8 string to a 256-byte structurally conformant hex blob (`"0x" + "aa".repeat(256)`). All pre-existing tests pass against the new guard.
- Updated INV-04 R-2: assertion flipped from "1-byte proof emits `VoteSubmitted`" to "1-byte proof reverts `'JurySelection: invalid ZK proof'`".
- Added a six-test `G-1 Mitigation` describe block documenting: 1-byte revert, 128-byte revert, 256-byte pass (boundary), 257-byte revert (misaligned), 288-byte pass (aligned above minimum), and a residual-gap test confirming a 256-byte arbitrary-content blob still passes.

---

## Pre-PR and Post-PR Attack Cost Comparison

| Dimension | Pre-PR #74 | Post-PR #74 |
|---|---|---|
| Guard | `zkProof.length > 0` | `zkProof.length >= 256 && length % 32 == 0` |
| Minimum attacker payload | 1 byte (any byte) | 256 bytes, 32-byte aligned |
| Payload must be cryptographically valid | No | No |
| Payload must bind to `caseId` | No | No |
| Payload must bind to `commitment` | No | No |
| Payload must bind to `isGuilty` | No | No |
| Caller identity checked | No (`msg.sender` never read) | No (`msg.sender` never read) |
| Commitments needed | Yes (publicly observable on-chain) | Yes (publicly observable on-chain) |
| Attack still possible | Yes — trivially | Yes — with structurally conformant blob |
| Transactions to reach conviction | ≥ 8 | ≥ 8 |
| Transactions to reach acquittal | ≥ 5 | ≥ 5 |

**Attack remains possible.** Any 256-byte, 32-byte-aligned blob of arbitrary content is accepted. The structural guard raises the attacker's minimum payload size from 1 byte to 256 bytes and rejects non-word-aligned blobs. It does not require the attacker to possess any secret material, perform any cryptographic computation, or know anything beyond the publicly observable commitment hashes.

---

## Residual Gap (Documented)

The following is the specific gap that remains open after PR #74. It is documented verbatim in `JurySelection.sol` code comments and NatSpec at `d5cfb6e`:

```
// Structural hardening only: rejects trivially short / non-word-aligned blobs.
// Does NOT verify proof content or bind proof to caseId/commitment/isGuilty.
// A correctly shaped fake proof still passes. G-1 is mitigated, not closed.
// Closure requires a Groth16 verifier contract with public inputs.
```

The structural check cannot distinguish a genuine Groth16 proof from a correctly-shaped byte array of zeros. No on-chain verifier contract is called or deployed. Proof content is not inspected.

---

## G-1 Mitigation Phase: Complete

The structural hardening delivered by PR #74 is the maximum defensible contract-level improvement that can be made without deploying a ZK verifier circuit. It eliminates the most trivially cheap attack vector (1-byte proof) and enforces a payload shape consistent with the Groth16 ABI layout.

No further structural hardening is warranted or possible within the current architecture. The mitigation phase is **complete** and **closed**.

---

## G-1 Closure: Not Yet Possible

G-1 cannot be closed without the following components, all of which are absent from the current codebase:

### Required components for full G-1 closure

1. **ZK circuit (Circom or Noir):** A circuit proving that the voter knows a secret `s` such that `hash(s, caseId, nullifier) == commitment`, without revealing `s`. The nullifier must bind to both the juror identity and the vote choice (`isGuilty`) to prevent proof-replay and vote-flipping attacks.

2. **On-chain verifier contract:** A Groth16 or PLONK verifier contract generated from the compiled circuit. The verifier must be deployed at a known address and callable by `JurySelection`.

3. **`submitVote()` refactor:** The structural length check must be replaced with a call to `verifier.verifyProof(proof, publicInputs)`. The `publicInputs` array must include at minimum: `[commitment, caseId, isGuilty, nullifier]`. Binding only `[commitment, caseId]` is insufficient — a mempool observer could copy a valid proof and submit it with the opposite `isGuilty` value before `usedCommitments` is set.

4. **Nullifier binding:** The nullifier preimage must include `isGuilty` so that a proof generated for a guilty vote cannot be replayed as a not-guilty vote and vice versa.

5. **Test suite update:** All existing `submitVote()` tests use a structurally valid but cryptographically invalid blob. After the verifier is wired, all affected tests must supply proofs generated by the circuit.

6. **External audit:** The ZK circuit, verifier contract, and `submitVote()` integration must be audited independently before any real-world use.

### Scope note

This is not a one-line fix. It requires a new circuit artifact, a new deployed contract, a function signature change in `JurySelection.sol`, and an external audit engagement. It is a multi-component, long-lead implementation milestone.

---

## Open Item Register

| Item | Status | Note |
|---|---|---|
| **G-1** | **OPEN** | Mitigation complete (PR #74). Closure requires on-chain Groth16/PLONK verifier with public inputs. |
| **KTJ-05** | **OPEN** | Contract finality logic is correct. Open gap: no dedicated storage-field-level characterization test formally named KTJ-05. Not related to G-1. |
| **INV-02** | **OPEN** | Mint-time reserve floor is enforced. Post-update breach-detection/remediation path is undecided (Paths A–D; none implemented). `updateReserves()` is not ratio-gated. See `INV02_RESERVE_RATIO_FLOOR_AUDIT.md` v1.1.1 and `INV02_REMEDIATION_OPTIONS.md`. |

---

## Non-Claims

- This document does not claim G-1 is fixed.
- This document does not claim cryptographic ZK proof verification exists on-chain.
- This document does not claim production readiness.
- This document does not claim external audit completion.
- This document does not claim formal verification completion.
- This document does not close KTJ-05.
- This document does not close INV-02.
- This document does not close any Step 12 / STEP9-BLOCK-* blocker.
- No contracts, tests, CI configuration, deployment scripts, or fuzzing harnesses were modified by this document.

---

*Report date: 2026-06-16*  
*Main HEAD at time of writing: `d5cfb6e`*  
*Affected contract: `contracts/justice/JurySelection.sol`*  
*Prior reports: `docs/reports/F01_JURY_ZK_PROOF_CRITICAL.md`, `docs/reports/INV04_G1_CRITICAL_ZK_PROOF_GAP.md`*
