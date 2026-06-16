# INV-04 G-1 Critical: ZK Proof Gap in JurySelection.submitVote()

**Finding ID:** G-1  
**Invariant:** KTJ-05 (verdict finality — separate, not closed by this finding)  
**Severity:** Critical  
**Likelihood:** High  
**Status:** Open — pre-existing, not introduced by PR #71  
**Production-ready claim:** None  
**Fix status:** Not fixed — requires on-chain ZK verifier circuit  

---

## Finding

`JurySelection.submitVote()` validates the `zkProof` parameter by length only
(`zkProof.length > 0`). No on-chain ZK verifier is called. Any caller who knows
a commitment hash can cast a vote by passing a 1-byte payload.

All 12 commitment hashes submitted by `selectJury()` are observable on-chain
from the transaction calldata. No secret knowledge is required to obtain them.

Combined: any observer can unilaterally cast all 12 jury votes in any active pool.

---

## Affected Code

**`contracts/justice/JurySelection.sol`**

```solidity
// Line 65 — length-only check, no cryptographic verification
require(zkProof.length > 0, "JurySelection: invalid ZK proof");

// Lines 67–70 — checks pool membership, not caller identity
require(!usedCommitments[commitment], "JurySelection: already voted");
require(_isValidJuror(caseId, commitment), "JurySelection: not a valid juror");
// msg.sender is never read — caller identity is unconstrained
```

---

## Attack Path

1. Watch chain for `selectJury(caseId, commitments)` calldata.
2. Read `commitments[0..11]` — 12 public bytes32 values.
3. Call `submitVote(caseId, commitments[i], <chosen_vote>, bytes("x"))` for each vote:
   - `bytes("x")` satisfies `length > 0`.
   - `_isValidJuror` returns `true` — commitment is in pool.
   - No key material required.
4. Attacker reaches the verdict threshold of their choice:
   - **Conviction:** submit 8 guilty votes → `VerdictReached(caseId, 1, ...)` fired. Done in 8 txns.
   - **Acquittal:** submit 5 not-guilty votes → `VerdictReached(caseId, 2, ...)` fired. Done in 5 txns.
   - `voting complete` rejects any further calls — verdict is already locked.

Note: submitting the same vote for all 12 commitments will not yield 12 accepted votes.
The contract halts at `CONVICTION_THRESHOLD` (8) or `ACQUITTAL_THRESHOLD` (5) and rejects
subsequent calls. The exploit remains critical because the attacker controls which verdict
is reached, not because all 12 votes are unconditionally accepted.

---

## Evidence from PR #71 (INV-04 R-2)

The INV-04 characterization test suite (PR #71) documents this gap directly:

```javascript
it("INV-04 R-2: 1-byte ZK proof satisfies length>0 guard — length-only check, no cryptographic validation",
  async function () {
    const oneByteProof = ethers.toUtf8Bytes("x");
    await expect(
      jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[0], true, oneByteProof)
    ).to.emit(jury, "VoteSubmitted");
  }
);
```

`stranger` holds no role. `oneByteProof` carries no cryptographic content. The vote succeeds.

---

## Pre-existing Gap Reference

This gap is acknowledged in **CLAUDE.md §6**:

> **ZK proofs in JurySelection are not verified on-chain** — The `zkProof` parameter is
> accepted but only checked for non-zero length (`zkProof.length > 0`). Full ZKP
> verification is planned for a future version.

---

## What Is NOT Affected

- **KTJ-05** — verdict finality holds once a verdict is reached; later votes are correctly
  rejected with `"JurySelection: voting complete"`. KTJ-05 is **not closed** by this finding.
- **PR #71 correctness** — the characterization tests accurately describe the contract's
  actual behavior. They do not introduce or worsen G-1.
- **`selectJury()` access control** — `VRF_ROLE` gating on jury pool creation is correct
  and unaffected.

---

## Required Fix (Future Milestone)

Replacing the length check with on-chain ZK proof verification. Minimum components:

1. **ZK circuit (Circom or Noir):** juror proves knowledge of secret `s` such that
   `hash(s, caseId, nullifier) == commitment`, without revealing `s`.
2. **On-chain verifier contract:** Groth16 or PLONK verifier generated from the circuit.
   `submitVote()` calls `verifier.verifyProof(proof, publicInputs)`.
3. **Nullifier binding:** proof must bind to `caseId` and optionally `msg.sender`
   to prevent cross-case or cross-voter replay.

This is a multi-component implementation requiring a new circuit artifact, a deployed
verifier contract, updated `submitVote()` interface, and external audit of the circuit.

---

## Constraints

- **Do not fix now.** No contract changes are in scope.
- **No threshold changes.** `JURY_SIZE`, `CONVICTION_THRESHOLD`, `ACQUITTAL_THRESHOLD`
  are unchanged and correct.
- **No production-ready claim.** This system requires on-chain ZK verification before
  any real-world jury process.
- **KTJ-05 is not closed.**

---

*Report date: 2026-06-16*  
*Branch: docs/f01-jury-zk-proof-critical*  
*Affected contract: contracts/justice/JurySelection.sol (current HEAD)*
