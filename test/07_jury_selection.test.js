// SPDX-License-Identifier: MIT
// تست‌های انتخاب هیئت منصفه (JurySelection)
const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("JurySelection", function () {
  let jury;
  let kernel, vrf, court, stranger;

  const JURY_SIZE = 12;
  const caseId    = 1001n;

  // ساخت ۱۲ commitment تصادفی برای داوران
  function makeCommitments(n = JURY_SIZE) {
    return Array.from({ length: n }, (_, i) =>
      ethers.keccak256(ethers.toUtf8Bytes(`juror_commitment_${i}_${Date.now()}`))
    );
  }

  // 256-byte structurally valid test proof: 8 × 32-byte words matching Groth16 ABI layout.
  // NOT cryptographically valid. Satisfies ZK_PROOF_MIN_LENGTH structural guard only.
  const fakeZkProof = "0x" + "aa".repeat(256);

  beforeEach(async function () {
    [kernel, vrf, court, stranger] = await ethers.getSigners();

    const JurySelection = await ethers.getContractFactory("JurySelection");
    jury = await JurySelection.deploy(kernel.address);

    const VRF_ROLE  = await jury.VRF_ROLE();
    const COURT_ROLE = await jury.COURT_ROLE();
    await jury.connect(kernel).grantRole(VRF_ROLE,  vrf.address);
    await jury.connect(kernel).grantRole(COURT_ROLE, court.address);
  });

  // ─────────────────────────────────────────
  // ثابت‌های سیستمی
  // ─────────────────────────────────────────

  describe("ثابت‌های سیستمی", function () {
    it("اندازه هیئت منصفه ۱۲ نفر است", async function () {
      expect(await jury.JURY_SIZE()).to.equal(12);
    });

    it("آستانه محکومیت ۸ رای است", async function () {
      expect(await jury.CONVICTION_THRESHOLD()).to.equal(8);
    });

    it("آستانه تبرئه ۵ رای است", async function () {
      expect(await jury.ACQUITTAL_THRESHOLD()).to.equal(5);
    });
  });

  // ─────────────────────────────────────────
  // انتخاب هیئت منصفه
  // ─────────────────────────────────────────

  describe("selectJury", function () {
    async function expectDefaultJuryPool(targetCaseId) {
      const pool = await jury.getJuryPool(targetCaseId);
      expect(pool[0]).to.equal(0);
      expect(pool[1]).to.equal(0);
      expect(pool[2]).to.be.false;
      expect(pool[3]).to.equal(0);
      expect(pool[4]).to.equal(0);
    }

    it("VRF می‌تواند ۱۲ داور انتخاب کند", async function () {
      const commitments = makeCommitments();
      await expect(jury.connect(vrf).selectJury(caseId, commitments))
        .to.emit(jury, "JurySelected")
        .withArgs(caseId, anyValue);

      expect(await jury.totalCasesHandled()).to.equal(1n);
      const pool = await jury.getJuryPool(caseId);
      expect(pool[4]).to.be.greaterThan(0n);
    });

    it("کمتر از ۱۲ داور رد می‌شود", async function () {
      const commitments = makeCommitments(10);
      await expect(jury.connect(vrf).selectJury(caseId, commitments))
        .to.be.revertedWith("JurySelection: wrong jury size");
    });

    it("wrong jury size is state-neutral", async function () {
      const commitments = makeCommitments(10);
      await expect(jury.connect(vrf).selectJury(caseId, commitments))
        .to.be.revertedWith("JurySelection: wrong jury size");

      expect(await jury.totalCasesHandled()).to.equal(0n);
      await expectDefaultJuryPool(caseId);
    });

    it("انتخاب دوباره برای همان پرونده رد می‌شود", async function () {
      const c1 = makeCommitments();
      const c2 = makeCommitments();
      await jury.connect(vrf).selectJury(caseId, c1);
      await expect(jury.connect(vrf).selectJury(caseId, c2))
        .to.be.revertedWith("JurySelection: jury already selected");
    });

    it("duplicate jury selection failure preserves existing pool", async function () {
      const c1 = makeCommitments();
      const c2 = makeCommitments();
      await jury.connect(vrf).selectJury(caseId, c1);

      const snapshot = await jury.getJuryPool(caseId);
      expect(await jury.totalCasesHandled()).to.equal(1n);

      await expect(jury.connect(vrf).selectJury(caseId, c2))
        .to.be.revertedWith("JurySelection: jury already selected");

      const pool = await jury.getJuryPool(caseId);
      expect(await jury.totalCasesHandled()).to.equal(1n);
      expect(pool[0]).to.equal(snapshot[0]);
      expect(pool[1]).to.equal(snapshot[1]);
      expect(pool[2]).to.equal(snapshot[2]);
      expect(pool[3]).to.equal(snapshot[3]);
      expect(pool[4]).to.equal(snapshot[4]);
    });

    it("غیر‌VRF نمی‌تواند داور انتخاب کند", async function () {
      const commitments = makeCommitments();
      await expect(jury.connect(stranger).selectJury(caseId, commitments))
        .to.be.reverted;
    });

    it("non-VRF selectJury attempt is state-neutral", async function () {
      const commitments = makeCommitments();
      await expect(jury.connect(stranger).selectJury(caseId, commitments))
        .to.be.reverted;

      expect(await jury.totalCasesHandled()).to.equal(0n);
      await expectDefaultJuryPool(caseId);
    });
  });

  // ─────────────────────────────────────────
  // رای‌گیری
  // ─────────────────────────────────────────

  describe("submitVote", function () {
    let commitments;

    async function expectJuryPoolUnchanged(snapshot) {
      const pool = await jury.getJuryPool(caseId);
      expect(pool[0]).to.equal(snapshot[0]);
      expect(pool[1]).to.equal(snapshot[1]);
      expect(pool[2]).to.equal(snapshot[2]);
      expect(pool[3]).to.equal(snapshot[3]);
      expect(pool[4]).to.equal(snapshot[4]);
    }

    beforeEach(async function () {
      commitments = makeCommitments();
      await jury.connect(vrf).selectJury(caseId, commitments);
    });

    it("داور معتبر می‌تواند رای بدهد", async function () {
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof)
      ).to.emit(jury, "VoteSubmitted");
    });

    it("رای تکراری با همان commitment رد می‌شود", async function () {
      await jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof);
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: already voted");
    });

    it("duplicate vote failure preserves pool state", async function () {
      await jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof);
      const snapshot = await jury.getJuryPool(caseId);

      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: already voted");

      await expectJuryPoolUnchanged(snapshot);
      expect(await jury.usedCommitments(commitments[0])).to.be.true;
    });

    it("داور غیرمعتبر رد می‌شود", async function () {
      const fakeCommitment = ethers.keccak256(ethers.toUtf8Bytes("fake_juror"));
      await expect(
        jury.connect(stranger).submitVote(caseId, fakeCommitment, true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: not a valid juror");
    });

    it("invalid juror vote is state-neutral", async function () {
      const fakeCommitment = ethers.keccak256(ethers.toUtf8Bytes("fake_juror"));
      const snapshot = await jury.getJuryPool(caseId);

      await expect(
        jury.connect(stranger).submitVote(caseId, fakeCommitment, true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: not a valid juror");

      await expectJuryPoolUnchanged(snapshot);
      expect(await jury.usedCommitments(fakeCommitment)).to.be.false;
    });

    it("ZK proof خالی رد می‌شود", async function () {
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, "0x")
      ).to.be.revertedWith("JurySelection: invalid ZK proof");
    });

    it("empty proof vote is state-neutral", async function () {
      const snapshot = await jury.getJuryPool(caseId);

      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, "0x")
      ).to.be.revertedWith("JurySelection: invalid ZK proof");

      await expectJuryPoolUnchanged(snapshot);
      expect(await jury.usedCommitments(commitments[0])).to.be.false;

      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, fakeZkProof)
      ).to.emit(jury, "VoteSubmitted");
      expect(await jury.usedCommitments(commitments[0])).to.be.true;
    });

    it("unresolved vote path remains non-final below verdict thresholds", async function () {
      for (let i = 0; i < 7; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], true, fakeZkProof);
      }
      for (let i = 7; i < 11; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], false, fakeZkProof);
      }

      expect(await jury.getVerdict(caseId)).to.equal(0n);
      let pool = await jury.getJuryPool(caseId);
      expect(pool[0]).to.equal(7);
      expect(pool[1]).to.equal(4);
      expect(pool[2]).to.be.false;
      expect(pool[3]).to.equal(0);
      expect(pool[4]).to.be.greaterThan(0n);

      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[11], false, fakeZkProof)
      ).to.emit(jury, "VerdictReached").withArgs(caseId, 2, anyValue);

      expect(await jury.getVerdict(caseId)).to.equal(2n);
      pool = await jury.getJuryPool(caseId);
      expect(pool[0]).to.equal(7);
      expect(pool[1]).to.equal(5);
      expect(pool[2]).to.be.true;
      expect(pool[3]).to.equal(2);
      expect(pool[4]).to.be.greaterThan(0n);
    });

    it("با ۸ رای مجرم، حکم محکومیت صادر می‌شود", async function () {
      for (let i = 0; i < 7; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], true, fakeZkProof);
      }
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[7], true, fakeZkProof)
      ).to.emit(jury, "VerdictReached").withArgs(caseId, 1, anyValue);

      expect(await jury.getVerdict(caseId)).to.equal(1n); // 1 = محکوم
      const pool = await jury.getJuryPool(caseId);
      expect(pool[0]).to.equal(8);
      expect(pool[1]).to.equal(0);
      expect(pool[2]).to.be.true;
      expect(pool[3]).to.equal(1);
      expect(pool[4]).to.be.greaterThan(0n);
    });

    it("completed case rejects later votes without mutating verdict state", async function () {
      for (let i = 0; i < 8; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], true, fakeZkProof);
      }

      const snapshot = await jury.getJuryPool(caseId);
      expect(await jury.usedCommitments(commitments[8])).to.be.false;

      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[8], false, fakeZkProof)
      ).to.be.revertedWith("JurySelection: voting complete");

      const pool = await jury.getJuryPool(caseId);
      expect(pool[0]).to.equal(8);
      expect(pool[1]).to.equal(0);
      expect(pool[2]).to.be.true;
      expect(pool[3]).to.equal(1);
      expect(pool[4]).to.equal(snapshot[4]);
      expect(await jury.getVerdict(caseId)).to.equal(1n);
      expect(await jury.usedCommitments(commitments[8])).to.be.false;
    });

    it("با ۵ رای غیرمجرم، حکم تبرئه صادر می‌شود", async function () {
      // ابتدا ۴ رای مجرم
      for (let i = 0; i < 4; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], true, fakeZkProof);
      }
      // سپس ۵ رای غیرمجرم
      for (let i = 4; i < 8; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], false, fakeZkProof);
      }
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[8], false, fakeZkProof)
      ).to.emit(jury, "VerdictReached").withArgs(caseId, 2, anyValue);

      expect(await jury.getVerdict(caseId)).to.equal(2n); // 2 = تبرئه
      const pool = await jury.getJuryPool(caseId);
      expect(pool[0]).to.equal(4);
      expect(pool[1]).to.equal(5);
      expect(pool[2]).to.be.true;
      expect(pool[3]).to.equal(2);
      expect(pool[4]).to.be.greaterThan(0n);
    });

    it("completed acquittal case rejects later votes without mutating verdict state", async function () {
      for (let i = 0; i < 4; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], true, fakeZkProof);
      }
      for (let i = 4; i < 9; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], false, fakeZkProof);
      }

      const snapshot = await jury.getJuryPool(caseId);
      expect(await jury.usedCommitments(commitments[9])).to.be.false;

      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[9], true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: voting complete");

      await expectJuryPoolUnchanged(snapshot);
      expect(await jury.getVerdict(caseId)).to.equal(2n);
      expect(await jury.usedCommitments(commitments[9])).to.be.false;
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INV-04 KTJ-05 Boundary Characterization (R-1..R-4)
  //
  // Documents missing boundary coverage identified in INV-04 discovery:
  //  R-1: conviction fires at exactly CONVICTION_THRESHOLD=8 regardless of
  //       prior not-guilty votes; verdict=3 (SecondRoundRequired) is
  //       mathematically unreachable under current constants
  //  R-2: 1-byte ZK proof satisfies length>0 guard — documents G-1 gap;
  //       no cryptographic validation exists (by design, per CLAUDE.md §6)
  //  R-3: cross-case commitment deduplication — same commitment can appear in
  //       two pools but voting in the first blocks voting in the second
  //  R-4: intra-batch duplicate commitment accepted by selectJury —
  //       usedCommitments is written only in submitVote, not during selection
  //
  // No contracts changed. No ZK implementation. No production-ready claim.
  // ═══════════════════════════════════════════════════════════════════════════
  describe("INV-04 KTJ-05 Boundary Characterization (R-1..R-4)", function () {
    let inv04Commitments;
    const inv04CaseId = 2001n;

    beforeEach(async function () {
      inv04Commitments = makeCommitments();
      await jury.connect(vrf).selectJury(inv04CaseId, inv04Commitments);
    });

    // ─── R-1: verdict=3 unreachability and conviction at exact threshold ──────
    it("INV-04 R-1: 7 guilty + 4 not-guilty + 1 guilty → conviction fires at 8th guilty vote (verdict=1)", async function () {
      // Cast 7 guilty votes — below CONVICTION_THRESHOLD, no verdict
      for (let i = 0; i < 7; i++) {
        await jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[i], true, fakeZkProof);
      }
      // Cast 4 not-guilty votes — below ACQUITTAL_THRESHOLD, no verdict; total=11
      for (let i = 7; i < 11; i++) {
        await jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[i], false, fakeZkProof);
      }
      let pool = await jury.getJuryPool(inv04CaseId);
      expect(pool[0]).to.equal(7);  // guiltyVotes
      expect(pool[1]).to.equal(4);  // notGuiltyVotes
      expect(pool[2]).to.be.false;  // not complete
      expect(pool[3]).to.equal(0);  // verdict still pending

      // 12th vote is guilty → 8th guilty vote fires conviction (verdict=1)
      await expect(
        jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[11], true, fakeZkProof)
      ).to.emit(jury, "VerdictReached").withArgs(inv04CaseId, 1, anyValue);

      pool = await jury.getJuryPool(inv04CaseId);
      expect(pool[0]).to.equal(8);  // guiltyVotes
      expect(pool[1]).to.equal(4);  // notGuiltyVotes unchanged
      expect(pool[2]).to.be.true;   // isComplete
      expect(pool[3]).to.equal(1);  // verdict=1 (conviction)
      expect(await jury.getVerdict(inv04CaseId)).to.equal(1n);
    });

    it("INV-04 R-1: verdict=3 (SecondRoundRequired) is unreachable — max non-verdict state is 7+4=11 votes", async function () {
      // Maximum votes castable without triggering either threshold:
      //   CONVICTION_THRESHOLD=8 → at most 7 guilty
      //   ACQUITTAL_THRESHOLD=5  → at most 4 not-guilty
      //   7 + 4 = 11 < JURY_SIZE=12
      // Therefore the 12th vote always triggers conviction (guilty≥8) or acquittal (not-guilty≥5).
      // SecondRoundRequired (verdict=3) at guiltyVotes+notGuiltyVotes==JURY_SIZE is dead code.
      for (let i = 0; i < 7; i++) {
        await jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[i], true, fakeZkProof);
      }
      for (let i = 7; i < 11; i++) {
        await jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[i], false, fakeZkProof);
      }
      // State: 7+4=11, no verdict — this is the maximum reachable without verdict
      let pool = await jury.getJuryPool(inv04CaseId);
      expect(pool[0]).to.equal(7);
      expect(pool[1]).to.equal(4);
      expect(pool[2]).to.be.false;
      expect(pool[3]).to.equal(0); // pending

      // 12th vote as not-guilty → 5th not-guilty fires acquittal (verdict=2), not second round (verdict=3)
      await expect(
        jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[11], false, fakeZkProof)
      ).to.emit(jury, "VerdictReached").withArgs(inv04CaseId, 2, anyValue)
        .and.not.to.emit(jury, "SecondRoundRequired");

      pool = await jury.getJuryPool(inv04CaseId);
      expect(pool[3]).to.equal(2); // verdict=2 (acquittal), never 3
    });

    // ─── R-2: ZK proof structural validation (G-1 remediation characterization) ─
    it("INV-04 R-2 (G-1 hardened): 1-byte ZK proof now reverts — structural guard raised to ZK_PROOF_MIN_LENGTH", async function () {
      // G-1 remediation: ZK_PROOF_MIN_LENGTH=256 and 32-byte alignment enforced.
      // A 1-byte proof is rejected. Residual gap: no on-chain cryptographic verifier exists.
      const oneByteProof = ethers.toUtf8Bytes("x"); // length=1, below ZK_PROOF_MIN_LENGTH
      await expect(
        jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[0], true, oneByteProof)
      ).to.be.revertedWith("JurySelection: invalid ZK proof");

      // Vote was NOT counted
      const pool = await jury.getJuryPool(inv04CaseId);
      expect(pool[0]).to.equal(0); // guiltyVotes unchanged
    });

    // ─── R-3: Cross-case commitment deduplication ────────────────────────────
    it("INV-04 R-3a: same commitment batch can appear in a second jury pool before any vote is cast", async function () {
      // usedCommitments is written only in submitVote, not in selectJury.
      // Therefore the same commitments can be selected for two different cases simultaneously.
      const inv04CaseId2 = 2002n;
      await expect(
        jury.connect(vrf).selectJury(inv04CaseId2, inv04Commitments)
      ).to.emit(jury, "JurySelected");
      expect(await jury.totalCasesHandled()).to.equal(2n); // both cases active
    });

    it("INV-04 R-3b: commitment voted in case A cannot be reused in case B (cross-case deduplication)", async function () {
      const inv04CaseId2 = 2002n;
      // Select the same commitments for a second case (permitted before any vote)
      await jury.connect(vrf).selectJury(inv04CaseId2, inv04Commitments);

      // Vote in case A — marks usedCommitments[inv04Commitments[0]] = true
      await jury.connect(stranger).submitVote(inv04CaseId, inv04Commitments[0], true, fakeZkProof);
      expect(await jury.usedCommitments(inv04Commitments[0])).to.be.true;

      // Same commitment in case B now reverts — global deduplication prevents cross-case reuse
      await expect(
        jury.connect(stranger).submitVote(inv04CaseId2, inv04Commitments[0], false, fakeZkProof)
      ).to.be.revertedWith("JurySelection: already voted");

      // Case B pool state is unchanged
      const pool = await jury.getJuryPool(inv04CaseId2);
      expect(pool[0]).to.equal(0); // guiltyVotes untouched
      expect(pool[1]).to.equal(0); // notGuiltyVotes untouched
      expect(pool[2]).to.be.false; // not complete
    });

    // ─── R-4: Intra-batch duplicate commitment (new gap characterization) ─────
    it("INV-04 R-4: intra-batch duplicate commitment is accepted by selectJury (usedCommitments not written at selection)", async function () {
      const inv04CaseId3 = 2003n;
      // Build 12 commitments where the first appears twice (index 0 and 11)
      const dupCommitments = makeCommitments(11);
      dupCommitments.push(dupCommitments[0]); // duplicate at position 11
      expect(dupCommitments.length).to.equal(12);
      expect(dupCommitments[0]).to.equal(dupCommitments[11]);

      // selectJury does not write usedCommitments, so intra-batch duplicates pass undetected
      await expect(
        jury.connect(vrf).selectJury(inv04CaseId3, dupCommitments)
      ).to.emit(jury, "JurySelected");

      // Consequence: only 11 unique commitments can vote; the duplicate slot is permanently unusable
      await jury.connect(stranger).submitVote(inv04CaseId3, dupCommitments[0], true, fakeZkProof);
      expect(await jury.usedCommitments(dupCommitments[0])).to.be.true;

      // Second attempt with the duplicate commitment (same bytes32) reverts — slot is lost
      await expect(
        jury.connect(stranger).submitVote(inv04CaseId3, dupCommitments[11], true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: already voted");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // G-1 Remediation — Structural ZK Proof Validation (fix(justice): G-1)
  //
  // Validates that ZK_PROOF_MIN_LENGTH=256 and 32-byte alignment enforcement
  // block trivial fake proofs. Documents residual gap: no on-chain verifier
  // is present; structural validation reduces forgery cost only.
  //
  // G-1 remains partially open until verifier contract integration.
  // ═══════════════════════════════════════════════════════════════════════════
  describe("G-1 Remediation — Structural ZK Proof Validation", function () {
    let g1Commitments;
    const g1CaseId = 3001n;

    beforeEach(async function () {
      g1Commitments = makeCommitments();
      await jury.connect(vrf).selectJury(g1CaseId, g1Commitments);
    });

    it("G-1 regression: legacy 1-byte proof now reverts (was accepted pre-remediation)", async function () {
      const oneByteProof = "0x" + "ff"; // 1 byte — the exact G-1 attack vector
      await expect(
        jury.connect(stranger).submitVote(g1CaseId, g1Commitments[0], true, oneByteProof)
      ).to.be.revertedWith("JurySelection: invalid ZK proof");
    });

    it("G-1: proof below ZK_PROOF_MIN_LENGTH (128 bytes) reverts", async function () {
      const shortProof = "0x" + "aa".repeat(128); // 128 bytes — below 256-byte minimum
      await expect(
        jury.connect(stranger).submitVote(g1CaseId, g1Commitments[0], true, shortProof)
      ).to.be.revertedWith("JurySelection: invalid ZK proof");
    });

    it("G-1: proof at exactly ZK_PROOF_MIN_LENGTH (256 bytes) succeeds", async function () {
      const minProof = "0x" + "ab".repeat(256); // 256 bytes — boundary, 32-byte aligned
      await expect(
        jury.connect(stranger).submitVote(g1CaseId, g1Commitments[0], true, minProof)
      ).to.emit(jury, "VoteSubmitted");
    });

    it("G-1: proof above minimum but non-32-byte-aligned (257 bytes) reverts", async function () {
      const misalignedProof = "0x" + "ab".repeat(256) + "cd"; // 257 bytes — not 32-byte aligned
      await expect(
        jury.connect(stranger).submitVote(g1CaseId, g1Commitments[0], true, misalignedProof)
      ).to.be.revertedWith("JurySelection: invalid ZK proof");
    });

    it("G-1: proof above minimum and 32-byte-aligned (288 bytes) succeeds", async function () {
      const largerProof = "0x" + "cd".repeat(288); // 288 bytes — above minimum, 32-byte aligned
      await expect(
        jury.connect(stranger).submitVote(g1CaseId, g1Commitments[0], true, largerProof)
      ).to.emit(jury, "VoteSubmitted");
    });

    it("G-1 residual gap: 256-byte structurally valid proof with arbitrary content is accepted", async function () {
      // Documents residual gap: structural check passes for any 256-byte, 32-byte-aligned blob.
      // No on-chain verifier contract exists. Full cryptographic verification is future work.
      const arbitraryProof = "0x" + "de".repeat(256);
      await expect(
        jury.connect(stranger).submitVote(g1CaseId, g1Commitments[0], true, arbitraryProof)
      ).to.emit(jury, "VoteSubmitted");
      // This is the documented residual gap — G-1 is NOT fully closed.
    });
  });
});
