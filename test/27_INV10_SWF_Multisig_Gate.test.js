// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// INV-10: SWF Withdrawal Multisig Gate — Invariant Test Suite
// IranOS Step-12 Security Analysis
//
// Invariant: SovereignWealthFund withdrawal execution requires exactly
// MULTISIG_REQUIRED = 3 distinct COUNCIL_ROLE approvals. No withdrawal
// executes below the threshold. No signer can contribute more than once
// per transaction. No non-council address can contribute.
//
// This file tests only SovereignWealthFund.sol. No production code modified.

const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("INV-10: SWF Withdrawal Multisig Gate", function () {
  let swf;
  let sovereign, kernel, council1, council2, council3, council4, stranger;

  const DEPOSIT    = ethers.parseUnits("10000000", 18);
  const WITHDRAW   = ethers.parseUnits("1000000",  18);

  beforeEach(async function () {
    [sovereign, kernel, council1, council2, council3, council4, stranger] =
      await ethers.getSigners();

    const SWF = await ethers.getContractFactory("SovereignWealthFund");
    swf = await SWF.deploy(sovereign.address, kernel.address);

    const COUNCIL = await swf.COUNCIL_ROLE();
    await swf.connect(sovereign).grantRole(COUNCIL, council1.address);
    await swf.connect(sovereign).grantRole(COUNCIL, council2.address);
    await swf.connect(sovereign).grantRole(COUNCIL, council3.address);
    await swf.connect(sovereign).grantRole(COUNCIL, council4.address);

    // Fund L1, L2, L3 for all withdrawal tests
    await swf.connect(council1).depositToL1(DEPOSIT, "l1-reserve");
    await swf.connect(council1).depositToL2(DEPOSIT, "l2-reserve");
    await swf.connect(council1).depositToL3(DEPOSIT, "l3-reserve");
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 1: Withdrawal with 0 approvals (non-existent txId) cannot execute
  // ──────────────────────────────────────────────────────────────────

  describe("Check 1: Zero approvals — non-existent txId cannot be signed", function () {
    it("signWithdrawal on non-existent txId reverts with tx-not-found", async function () {
      await expect(swf.connect(council1).signWithdrawal(1n))
        .to.be.revertedWith("SWF: tx not found");
    });

    it("signWithdrawal on non-existent txId is state-neutral (no balance mutation)", async function () {
      const l1Before = await swf.layerL1();
      await expect(swf.connect(council1).signWithdrawal(99n))
        .to.be.revertedWith("SWF: tx not found");
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
    });

    it("proposeWithdrawal creates tx with timestamp > 0 (required by guard)", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      const tx_ = await swf.transactions(1n);
      expect(tx_.timestamp).to.be.gt(0n);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 2: 1 approval (proposal stage) does not execute
  // ──────────────────────────────────────────────────────────────────

  describe("Check 2: 1 approval (proposal only, signaturesCount=1) does not execute", function () {
    it("immediately after propose: signaturesCount=1 and executed=false", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      const tx_ = await swf.transactions(1n);
      expect(tx_.signaturesCount).to.equal(1n);
      expect(tx_.executed).to.equal(false);
    });

    it("after propose: L1 balance unchanged", async function () {
      const l1Before = await swf.layerL1();
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
    });

    it("after propose: totalAssets unchanged", async function () {
      const totalBefore = await swf.totalAssets();
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      const totalAfter = await swf.totalAssets();
      expect(totalAfter).to.equal(totalBefore);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 3: 2 approvals (signaturesCount=2) does not execute
  // ──────────────────────────────────────────────────────────────────

  describe("Check 3: 2 approvals (signaturesCount=2) does not execute", function () {
    it("after propose + 1 sign: signaturesCount=2 and executed=false", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      const tx_ = await swf.transactions(1n);
      expect(tx_.signaturesCount).to.equal(2n);
      expect(tx_.executed).to.equal(false);
    });

    it("after propose + 1 sign: L1 balance unchanged", async function () {
      const l1Before = await swf.layerL1();
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
    });

    it("after propose + 1 sign: totalAssets unchanged", async function () {
      const totalBefore = await swf.totalAssets();
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      const totalAfter = await swf.totalAssets();
      expect(totalAfter).to.equal(totalBefore);
    });

    it("second signer emits WithdrawalSigned with sigCount=2 (not WithdrawalExecuted)", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      const tx = await swf.connect(council2).signWithdrawal(1n);
      const receipt = await tx.wait();
      const events = receipt.logs.map(l => l.fragment?.name).filter(Boolean);
      expect(events).to.include("WithdrawalSigned");
      expect(events).to.not.include("WithdrawalExecuted");
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 4: Exactly 3 distinct approvals execute the withdrawal
  // ──────────────────────────────────────────────────────────────────

  describe("Check 4: 3 distinct approvals (signaturesCount=3) executes withdrawal", function () {
    it("L1 withdrawal executes at exactly signaturesCount=3", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "رفاه");
      await swf.connect(council2).signWithdrawal(1n);
      await expect(swf.connect(council3).signWithdrawal(1n))
        .to.emit(swf, "WithdrawalExecuted")
        .withArgs(1n, 1n, WITHDRAW);

      const tx_ = await swf.transactions(1n);
      expect(tx_.signaturesCount).to.equal(3n);
      expect(tx_.executed).to.equal(true);

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(DEPOSIT - WITHDRAW);
      expect(l1.totalWithdrawn).to.equal(WITHDRAW);
    });

    it("L2 withdrawal executes at exactly signaturesCount=3", async function () {
      await swf.connect(council1).proposeWithdrawal(2, WITHDRAW, "L2-draw");
      await swf.connect(council2).signWithdrawal(1n);
      await expect(swf.connect(council3).signWithdrawal(1n))
        .to.emit(swf, "WithdrawalExecuted")
        .withArgs(1n, 2n, WITHDRAW);

      const l2 = await swf.layerL2();
      expect(l2.balance).to.equal(DEPOSIT - WITHDRAW);
      expect(l2.totalWithdrawn).to.equal(WITHDRAW);
    });

    it("L3 withdrawal executes at exactly signaturesCount=3", async function () {
      await swf.connect(council1).proposeWithdrawal(3, WITHDRAW, "L3-draw");
      await swf.connect(council2).signWithdrawal(1n);
      await expect(swf.connect(council3).signWithdrawal(1n))
        .to.emit(swf, "WithdrawalExecuted")
        .withArgs(1n, 3n, WITHDRAW);

      const l3 = await swf.layerL3();
      expect(l3.balance).to.equal(DEPOSIT - WITHDRAW);
      expect(l3.totalWithdrawn).to.equal(WITHDRAW);
    });

    it("txSignatures[1][council1..3] all true after execution", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await swf.connect(council3).signWithdrawal(1n);

      expect(await swf.txSignatures(1n, council1.address)).to.equal(true);
      expect(await swf.txSignatures(1n, council2.address)).to.equal(true);
      expect(await swf.txSignatures(1n, council3.address)).to.equal(true);
      // council4 did not sign
      expect(await swf.txSignatures(1n, council4.address)).to.equal(false);
    });

    it("third signer emits both WithdrawalSigned and WithdrawalExecuted", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      const tx = await swf.connect(council3).signWithdrawal(1n);
      const receipt = await tx.wait();
      const events = receipt.logs.map(l => l.fragment?.name).filter(Boolean);
      expect(events).to.include("WithdrawalSigned");
      expect(events).to.include("WithdrawalExecuted");
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 5: Same signer cannot double-contribute to reach threshold
  // ──────────────────────────────────────────────────────────────────

  describe("Check 5: Same signer cannot sign the same withdrawal twice", function () {
    it("proposer (council1) cannot also call signWithdrawal", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await expect(swf.connect(council1).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
    });

    it("council2 signing twice reverts on second attempt", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await expect(swf.connect(council2).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
    });

    it("double-sign attempt does not increment signaturesCount", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      const txBefore = await swf.transactions(1n);
      await expect(swf.connect(council2).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
      const txAfter = await swf.transactions(1n);
      expect(txAfter.signaturesCount).to.equal(txBefore.signaturesCount);
    });

    it("double-sign attempt does not mutate L1 balance", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      const l1Before = await swf.layerL1();
      await expect(swf.connect(council2).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
    });

    it("two councils cannot collude to reach threshold via double-sign (3 calls, 2 signers)", async function () {
      // council1 proposes (sigCount=1), council2 signs (sigCount=2)
      // council1 tries again (already signed) → sigCount stays 2 → no execution
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await expect(swf.connect(council1).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
      const tx_ = await swf.transactions(1n);
      expect(tx_.signaturesCount).to.equal(2n);
      expect(tx_.executed).to.equal(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 6: Non-council signers cannot contribute to threshold
  // ──────────────────────────────────────────────────────────────────

  describe("Check 6: Non-council addresses cannot contribute to signing threshold", function () {
    it("stranger signWithdrawal reverts", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await expect(swf.connect(stranger).signWithdrawal(1n))
        .to.be.reverted;
    });

    it("stranger signWithdrawal does not increment signaturesCount", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      const txBefore = await swf.transactions(1n);
      await expect(swf.connect(stranger).signWithdrawal(1n))
        .to.be.reverted;
      const txAfter = await swf.transactions(1n);
      expect(txAfter.signaturesCount).to.equal(txBefore.signaturesCount);
    });

    it("kernel (not council) signWithdrawal reverts", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await expect(swf.connect(kernel).signWithdrawal(1n))
        .to.be.reverted;
    });

    it("sovereign (DEFAULT_ADMIN but not council) signWithdrawal reverts", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await expect(swf.connect(sovereign).signWithdrawal(1n))
        .to.be.reverted;
    });

    it("three non-council signatures cannot push signaturesCount to threshold", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      // stranger, kernel, and sovereign all try to sign
      await expect(swf.connect(stranger).signWithdrawal(1n)).to.be.reverted;
      await expect(swf.connect(kernel).signWithdrawal(1n)).to.be.reverted;
      await expect(swf.connect(sovereign).signWithdrawal(1n)).to.be.reverted;

      const tx_ = await swf.transactions(1n);
      expect(tx_.signaturesCount).to.equal(1n); // only proposer counted
      expect(tx_.executed).to.equal(false);

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(DEPOSIT);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 7: Failed / below-threshold attempts must not mutate SWF state
  // ──────────────────────────────────────────────────────────────────

  describe("Check 7: Below-threshold and failed attempts are state-neutral", function () {
    it("at signaturesCount=1 (after propose): all layer balances unchanged", async function () {
      const totalBefore = await swf.totalAssets();
      const l1Before    = await swf.layerL1();
      const l2Before    = await swf.layerL2();
      const l3Before    = await swf.layerL3();

      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");

      expect(await swf.totalAssets()).to.equal(totalBefore);
      const l1After = await swf.layerL1();
      const l2After = await swf.layerL2();
      const l3After = await swf.layerL3();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l2After.balance).to.equal(l2Before.balance);
      expect(l3After.balance).to.equal(l3Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
    });

    it("at signaturesCount=2 (after propose+sign): all layer balances unchanged", async function () {
      const totalBefore = await swf.totalAssets();
      const l1Before    = await swf.layerL1();

      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);

      expect(await swf.totalAssets()).to.equal(totalBefore);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
    });

    it("failed non-council sign attempt is state-neutral", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);

      const l1Before    = await swf.layerL1();
      const txBefore    = await swf.transactions(1n);
      const totalBefore = await swf.totalAssets();

      await expect(swf.connect(stranger).signWithdrawal(1n)).to.be.reverted;

      const l1After    = await swf.layerL1();
      const txAfter    = await swf.transactions(1n);
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalWithdrawn).to.equal(l1Before.totalWithdrawn);
      expect(txAfter.signaturesCount).to.equal(txBefore.signaturesCount);
      expect(txAfter.executed).to.equal(false);
      expect(await swf.totalAssets()).to.equal(totalBefore);
    });

    it("failed double-sign attempt is state-neutral", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);

      const l1Before = await swf.layerL1();
      const txBefore = await swf.transactions(1n);

      await expect(swf.connect(council2).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");

      const l1After = await swf.layerL1();
      const txAfter = await swf.transactions(1n);
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(txAfter.signaturesCount).to.equal(txBefore.signaturesCount);
      expect(txAfter.executed).to.equal(false);
    });

    it("txSignatures mapping unchanged after failed sign attempt", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      expect(await swf.txSignatures(1n, stranger.address)).to.equal(false);
      await expect(swf.connect(stranger).signWithdrawal(1n)).to.be.reverted;
      // stranger's signature entry must not have been set
      expect(await swf.txSignatures(1n, stranger.address)).to.equal(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Check 8: Executed withdrawal cannot be replayed
  // ──────────────────────────────────────────────────────────────────

  describe("Check 8: Once executed, withdrawal cannot be replayed", function () {
    it("signWithdrawal on executed txId reverts with already-executed", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await swf.connect(council3).signWithdrawal(1n);

      await expect(swf.connect(council4).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already executed");
    });

    it("replay attempt does not mutate L1 balance or accounting", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await swf.connect(council3).signWithdrawal(1n);

      const l1After     = await swf.layerL1();
      const txAfter     = await swf.transactions(1n);
      const totalAfter  = await swf.totalAssets();

      await expect(swf.connect(council4).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already executed");

      const l1Replay    = await swf.layerL1();
      const txReplay    = await swf.transactions(1n);
      expect(l1Replay.balance).to.equal(l1After.balance);
      expect(l1Replay.totalWithdrawn).to.equal(l1After.totalWithdrawn);
      expect(txReplay.signaturesCount).to.equal(txAfter.signaturesCount);
      expect(txReplay.executed).to.equal(true);
      expect(await swf.totalAssets()).to.equal(totalAfter);
    });

    it("executed flag is a one-way ratchet — cannot be cleared", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await swf.connect(council3).signWithdrawal(1n);

      const tx_ = await swf.transactions(1n);
      expect(tx_.executed).to.equal(true);

      // Attempt to re-sign with unused council4 — must revert
      await expect(swf.connect(council4).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already executed");

      // executed remains true
      const txAfterAttempt = await swf.transactions(1n);
      expect(txAfterAttempt.executed).to.equal(true);
    });

    it("original initiator attempting to re-sign after execution reverts", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await swf.connect(council3).signWithdrawal(1n);

      // council1 was the proposer; tries to "re-sign" after execution
      await expect(swf.connect(council1).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already executed");
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Parallel transaction isolation
  // ──────────────────────────────────────────────────────────────────

  describe("Parallel transaction isolation", function () {
    it("two concurrent proposals use distinct txIds", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "tx1");
      await swf.connect(council2).proposeWithdrawal(1, WITHDRAW, "tx2");

      expect(await swf.txCount()).to.equal(2n);
      const tx1 = await swf.transactions(1n);
      const tx2 = await swf.transactions(2n);
      expect(tx1.purpose).to.equal("tx1");
      expect(tx2.purpose).to.equal("tx2");
    });

    it("signing txId=1 does not affect txId=2 signaturesCount", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "tx1");
      await swf.connect(council2).proposeWithdrawal(1, WITHDRAW, "tx2");

      await swf.connect(council3).signWithdrawal(1n);
      await swf.connect(council4).signWithdrawal(1n);

      const tx1 = await swf.transactions(1n);
      const tx2 = await swf.transactions(2n);
      expect(tx1.signaturesCount).to.equal(3n);
      expect(tx1.executed).to.equal(true);
      expect(tx2.signaturesCount).to.equal(1n); // only council2's initial proposal
      expect(tx2.executed).to.equal(false);
    });

    it("txSignatures are isolated per txId — signing tx1 does not set sig on tx2", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "tx1");
      await swf.connect(council2).proposeWithdrawal(1, WITHDRAW, "tx2");
      await swf.connect(council3).signWithdrawal(1n);

      // council3 signed tx1 but not tx2
      expect(await swf.txSignatures(1n, council3.address)).to.equal(true);
      expect(await swf.txSignatures(2n, council3.address)).to.equal(false);
    });

    it("council3 can sign both tx1 and tx2 independently (not replay)", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "tx1");
      await swf.connect(council2).proposeWithdrawal(1, WITHDRAW, "tx2");

      // council3 signs tx1
      await swf.connect(council3).signWithdrawal(1n);
      // council3 signs tx2 — different txId, not a replay
      await expect(swf.connect(council3).signWithdrawal(2n)).to.not.be.reverted;

      expect(await swf.txSignatures(1n, council3.address)).to.equal(true);
      expect(await swf.txSignatures(2n, council3.address)).to.equal(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // MULTISIG_REQUIRED constant immutability
  // ──────────────────────────────────────────────────────────────────

  describe("MULTISIG_REQUIRED constant", function () {
    it("MULTISIG_REQUIRED is exactly 3", async function () {
      expect(await swf.MULTISIG_REQUIRED()).to.equal(3n);
    });

    it("threshold is not reachable with fewer than 3 unique council signers", async function () {
      // Use only 2 distinct council members — cannot reach threshold
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      // council1 double-sign fails
      await expect(swf.connect(council1).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
      // council2 double-sign fails
      await expect(swf.connect(council2).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");

      const tx_ = await swf.transactions(1n);
      expect(tx_.signaturesCount).to.equal(2n);
      expect(tx_.executed).to.equal(false);
    });

    it("4 distinct council signers — execution still happens at threshold 3", async function () {
      await swf.connect(council1).proposeWithdrawal(1, WITHDRAW, "test");
      await swf.connect(council2).signWithdrawal(1n);
      // At sigCount=3, executes
      await expect(swf.connect(council3).signWithdrawal(1n))
        .to.emit(swf, "WithdrawalExecuted");

      // council4 cannot sign after execution
      await expect(swf.connect(council4).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already executed");
    });
  });
});
