# F-01 Critical: JurySelection Fake ZK Proof Allows Arbitrary Juror Vote

**Status:** Open — Pre-existing vulnerability  
**Severity:** Critical  
**Tracking ID:** G-1 (documented in CLAUDE.md §6)  
**Introduced in:** Initial `JurySelection.sol` implementation  
**Not introduced by:** PR #71 (INV-04 characterization tests)  
**KTJ-05:** NOT closed — finality invariant is separate from this finding  
**Production-ready claim:** None — fix requires on-chain ZK verifier circuit

---

## Summary

`JurySelection.submitVote()` accepts any caller who presents a known commitment hash and a
non-empty byte string as a ZK proof. No `msg.sender` check exists, no cryptographic verification
is performed, and all 12 commitment hashes are publicly observable in the `selectJury()` calldata.
A single malicious observer can unilaterally control all 12 votes.

---

## Affected Files

| File | Lines | Issue |
|------|-------|-------|
| `contracts/justice/JurySelection.sol` | 60 | No `msg.sender` check — caller identity never verified |
| `contracts/justice/JurySelection.sol` | 65 | `zkProof.length > 0` only — no cryptographic validation |
| `contracts/justice/JurySelection.sol` | 67–70 | Commitment membership check only — does not bind caller |
| `contracts/justice/JurySelection.sol` | 49 | `selectJury()` calldata is public — commitments are readable |

---

## Root Cause

```solidity
// JurySelection.sol:60
function submitVote(
    uint256 caseId,
    bytes32 commitment,
    bool guilty,
    bytes calldata zkProof
) external nonReentrant {
    // Line 65: length-only check — no on-chain ZK verifier
    require(zkProof.length > 0, "JurySelection: invalid ZK proof");

    // Lines 67–70: checks commitment is in pool, NOT that msg.sender owns it
    JuryPool storage pool = juryPools[caseId];
    require(!usedCommitments[commitment], "JurySelection: already voted");
    require(_isValidJuror(caseId, commitment), "JurySelection: not a valid juror");
    // ↑ _isValidJuror checks pool membership only — caller address is never read
```

The intent of a ZK commitment scheme is that the voter proves knowledge of a secret without
revealing it. The current implementation stores only the commitment hash (the public value),
but never verifies the caller possesses the corresponding secret (the witness). As a result,
commitment ownership is not enforced.

---

## Exploit Path

**Preconditions:** Attacker can submit transactions. At least one `selectJury()` transaction is
on-chain (verdict not yet reached).

**Steps:**

1. Attacker monitors the mempool or chain history for `selectJury(caseId, commitments)`.
2. Reads all 12 `commitments[0..11]` from calldata — they are public bytes on-chain.
3. Calls `submitVote(caseId, commitments[i], <chosen_vote>, bytes("x"))` for each vote cast.
   - `bytes("x")` satisfies `zkProof.length > 0`.
   - `_isValidJuror(caseId, commitments[i])` returns `true` (commitment is in pool).
   - `!usedCommitments[commitments[i]]` is `true` (not yet voted).
4. Attacker reaches the verdict threshold of their choice:
   - **Conviction:** 8 guilty votes → `VerdictReached(caseId, 1, ...)` emitted. Done in 8 txns.
   - **Acquittal:** 5 not-guilty votes → `VerdictReached(caseId, 2, ...)` emitted. Done in 5 txns.
   - After the threshold is hit, `voting complete` rejects further votes — but the verdict is
     already locked and the attacker has achieved their goal.

Note: voting the same choice for all 12 commitments will not result in 12 accepted votes —
the contract halts at CONVICTION_THRESHOLD (8) or ACQUITTAL_THRESHOLD (5). The attacker
controls which threshold is reached, not the raw vote count.

**Cost:** One `selectJury` observation + as few as 5 `submitVote` transactions. No key material required.

---

## Existing Test Evidence

The following tests already demonstrate both halves of the attack path. They were not written
as exploits but as behavioral characterizations — their passing status confirms the vulnerability.

**Fake caller accepted (test/07_jury_selection.test.js:158–162):**
```javascript
// "stranger" has no role — not a registered juror — succeeds anyway
it("داور معتبر می‌تواند رای بدهد", async function () {
  await expect(
    jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof)
  ).to.emit(jury, "VoteSubmitted");
});
```

**One-byte proof accepted (PR #71, INV-04 R-2):**
```javascript
it("INV-04 R-2: 1-byte ZK proof satisfies length>0 guard ...", async function () {
  const oneByteProof = ethers.toUtf8Bytes("x");
  await expect(
    jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[0], true, oneByteProof)
  ).to.emit(jury, "VoteSubmitted");
});
```

These two facts together complete the exploit: a stranger with a one-byte payload can vote
on behalf of any commitment in any active jury pool.

---

## Gap Reference

This finding corresponds to the acknowledged implementation gap documented in **CLAUDE.md §6**:

> **ZK proofs in JurySelection are not verified on-chain** — The `zkProof` parameter is
> accepted but only checked for non-zero length (`zkProof.length > 0`). Full ZKP verification
> is planned for a future version.

Gap tracking ID: **G-1**.

---

## What Is NOT Affected

- **KTJ-05 (verdict finality)** — once a verdict is reached, `submitVote()` correctly rejects
  further votes with `"JurySelection: voting complete"`. This invariant holds regardless of who
  cast the votes that reached the verdict threshold. KTJ-05 is NOT closed by this finding.
- **PR #71 scope** — the INV-04 characterization tests accurately describe contract behavior.
  They do not introduce or worsen F-01.
- **`selectJury()` access control** — `VRF_ROLE` gating on jury selection is correct.

---

## Recommended Fix (Future Implementation)

The fix requires replacing the length-only check with a real on-chain zero-knowledge proof
verification. Recommended approach:

1. **ZK circuit (Circom or Noir):** Each juror generates a commitment
   `C = hash(secret, caseId, salt)`. The circuit proves `knowledge_of(secret)` such that
   `hash(secret, caseId, salt) == C` without revealing `secret`.
2. **On-chain verifier:** Deploy a Groth16 or PLONK verifier contract generated from the
   circuit. `submitVote()` calls `verifier.verifyProof(proof, publicInputs)` where
   `publicInputs = [C, caseId, isGuilty, nullifier]`. The vote choice (`isGuilty`) and a
   non-replayable nullifier (e.g. `keccak256(secret, caseId, isGuilty)` or derived from
   `msg.sender`) **must** be part of the public inputs. Binding only `[C, caseId]` is
   insufficient: a mempool observer could copy a valid proof and front-run `submitVote()`
   with the same commitment but the opposite vote before `usedCommitments` is set.
3. **Nullifier binding:** The nullifier must commit to both the juror identity and the vote
   choice. A nullifier that only prevents double-submission does not bind the proof to the
   submitted `isGuilty` value — include `isGuilty` in the nullifier preimage.
4. **Optional — allowedSigners mapping:** As an interim defense-in-depth measure, require
   that juror wallet addresses be registered before voting. This does not replace ZK verification
   but reduces the attacker surface to registered accounts only.

**Implementation scope:** Requires new circuit artifact, verifier contract, updated
`submitVote()` signature, and test suite update. Not a one-line fix.

---

## Constraints

- **Do not fix now.** Contract changes are out of scope for this report.
- **No threshold changes.** `JURY_SIZE`, `CONVICTION_THRESHOLD`, `ACQUITTAL_THRESHOLD` are
  unchanged and correct.
- **No production-ready claim.** This system requires on-chain ZK verification before any
  real-world jury process.
- **KTJ-05 remains open** separately (unrelated to this finding).

---

## Next Step

1. Open a GitHub issue: `Critical: JurySelection fake ZK proof allows arbitrary juror vote (G-1)`.
2. Block deployment on this finding (add `STEP9-BLOCK-ZK-VERIFIER` or equivalent blocker).
3. Assign to the ZK circuit implementation milestone.
4. Do not merge any PR that claims to fix this without an external audit of the ZK circuit.

---

*Report generated: 2026-06-16*  
*Branch: docs/f01-jury-zk-proof-critical*  
*Affected contract version: contracts/justice/JurySelection.sol (current HEAD)*
