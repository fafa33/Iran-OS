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

  const fakeZkProof = ethers.toUtf8Bytes("fake_zk_proof_placeholder");

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

    it("انتخاب دوباره برای همان پرونده رد می‌شود", async function () {
      const c1 = makeCommitments();
      const c2 = makeCommitments();
      await jury.connect(vrf).selectJury(caseId, c1);
      await expect(jury.connect(vrf).selectJury(caseId, c2))
        .to.be.revertedWith("JurySelection: jury already selected");
    });

    it("غیر‌VRF نمی‌تواند داور انتخاب کند", async function () {
      const commitments = makeCommitments();
      await expect(jury.connect(stranger).selectJury(caseId, commitments))
        .to.be.reverted;
    });
  });

  // ─────────────────────────────────────────
  // رای‌گیری
  // ─────────────────────────────────────────

  describe("submitVote", function () {
    let commitments;

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

    it("داور غیرمعتبر رد می‌شود", async function () {
      const fakeCommitment = ethers.keccak256(ethers.toUtf8Bytes("fake_juror"));
      await expect(
        jury.connect(stranger).submitVote(caseId, fakeCommitment, true, fakeZkProof)
      ).to.be.revertedWith("JurySelection: not a valid juror");
    });

    it("ZK proof خالی رد می‌شود", async function () {
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[0], true, "0x")
      ).to.be.revertedWith("JurySelection: invalid ZK proof");
    });

    it("با ۸ رای مجرم، حکم محکومیت صادر می‌شود", async function () {
      for (let i = 0; i < 7; i++) {
        await jury.connect(stranger).submitVote(caseId, commitments[i], true, fakeZkProof);
      }
      await expect(
        jury.connect(stranger).submitVote(caseId, commitments[7], true, fakeZkProof)
      ).to.emit(jury, "VerdictReached").withArgs(caseId, 1, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await jury.getVerdict(caseId)).to.equal(1n); // 1 = محکوم
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
      ).to.emit(jury, "VerdictReached").withArgs(caseId, 2, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await jury.getVerdict(caseId)).to.equal(2n); // 2 = تبرئه
    });
  });
});
