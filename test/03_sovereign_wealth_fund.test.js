// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// تست‌های صندوق ثروت ملی (SovereignWealthFund)
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("SovereignWealthFund", function () {
  let swf;
  let sovereign, kernel, council1, council2, council3, stranger;

  beforeEach(async function () {
    [sovereign, kernel, council1, council2, council3, stranger] = await ethers.getSigners();

    const SWF = await ethers.getContractFactory("SovereignWealthFund");
    swf = await SWF.deploy(sovereign.address, kernel.address);

    const COUNCIL = await swf.COUNCIL_ROLE();
    await swf.connect(sovereign).grantRole(COUNCIL, council1.address);
    await swf.connect(sovereign).grantRole(COUNCIL, council2.address);
    await swf.connect(sovereign).grantRole(COUNCIL, council3.address);
  });

  // ─────────────────────────────────────────
  // استقرار
  // ─────────────────────────────────────────

  describe("استقرار", function () {
    it("اهداف لایه‌ها صحیح است", async function () {
      expect(await swf.L1_TARGET()).to.equal(ethers.parseUnits("300000000000", 18));
      expect(await swf.L2_TARGET()).to.equal(ethers.parseUnits("300000000000", 18));
      expect(await swf.L3_TARGET()).to.equal(ethers.parseUnits("2000000000000", 18));
    });

    it("بازدهی سالانه ۱۵٪ تنظیم شده", async function () {
      expect(await swf.ANNUAL_YIELD()).to.equal(150n);
    });

    it("آستانه Multi-Sig سه است", async function () {
      expect(await swf.MULTISIG_REQUIRED()).to.equal(3n);
    });
  });

  // ─────────────────────────────────────────
  // سپرده‌گذاری
  // ─────────────────────────────────────────

  describe("depositToL1", function () {
    it("عضو شورا می‌تواند در L1 سپرده‌گذاری کند", async function () {
      const amount = ethers.parseUnits("1000000", 18);
      await expect(swf.connect(council1).depositToL1(amount, "نفت"))
        .to.emit(swf, "DepositToL1")
        .withArgs(amount, "نفت", amount);

      const layer = await swf.layerL1();
      expect(layer.balance).to.equal(amount);
    });

    it("مقدار صفر رد می‌شود", async function () {
      await expect(swf.connect(council1).depositToL1(0n, "test"))
        .to.be.revertedWith("SWF: zero amount");
    });

    it("غیر‌شورا نمی‌تواند سپرده بگذارد", async function () {
      await expect(swf.connect(stranger).depositToL1(1000n, "test"))
        .to.be.reverted;
    });
  });

  // ─────────────────────────────────────────
  // برداشت Multi-Sig
  // ─────────────────────────────────────────

  describe("proposeWithdrawal + signWithdrawal", function () {
    const depositAmount = ethers.parseUnits("10000000", 18);
    const withdrawAmount = ethers.parseUnits("1000000", 18);

    beforeEach(async function () {
      await swf.connect(council1).depositToL1(depositAmount, "ذخایر");
    });

    it("یک شورا می‌تواند برداشت پیشنهاد دهد", async function () {
      await expect(
        swf.connect(council1).proposeWithdrawal(1, withdrawAmount, "هزینه رفاهی")
      ).to.emit(swf, "WithdrawalProposed");
    });

    it("با ۳ امضا برداشت اجرا می‌شود", async function () {
      await swf.connect(council1).proposeWithdrawal(1, withdrawAmount, "رفاه");
      const txId = 1n;

      await swf.connect(council2).signWithdrawal(txId);
      await expect(swf.connect(council3).signWithdrawal(txId))
        .to.emit(swf, "WithdrawalExecuted")
        .withArgs(txId, 1, withdrawAmount);

      const layer = await swf.layerL1();
      expect(layer.balance).to.equal(depositAmount - withdrawAmount);
    });

    it("valid L1 withdrawal execution updates accounting exactly once", async function () {
      await swf.connect(council1).proposeWithdrawal(1, withdrawAmount, "رفاه");
      const txId = 1n;
      await swf.connect(council2).signWithdrawal(txId);

      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();
      const txSnapshot = await swf.transactions(txId);
      expect(txSnapshot.executed).to.equal(false);

      await expect(swf.connect(council3).signWithdrawal(txId))
        .to.emit(swf, "WithdrawalExecuted")
        .withArgs(txId, 1, withdrawAmount);

      const l1 = await swf.layerL1();
      const tx_ = await swf.transactions(txId);
      expect(l1.balance).to.equal(l1Snapshot.balance - withdrawAmount);
      expect(l1.totalWithdrawn).to.equal(l1Snapshot.totalWithdrawn + withdrawAmount);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
      expect(tx_.initiator).to.equal(txSnapshot.initiator);
      expect(tx_.layer).to.equal(txSnapshot.layer);
      expect(tx_.amount).to.equal(txSnapshot.amount);
      expect(tx_.purpose).to.equal(txSnapshot.purpose);
      expect(tx_.timestamp).to.equal(txSnapshot.timestamp);
      expect(tx_.signaturesCount).to.equal(txSnapshot.signaturesCount + 1n);
      expect(tx_.executed).to.equal(true);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot - withdrawAmount);

      await expect(swf.connect(council3).signWithdrawal(txId))
        .to.be.revertedWith("SWF: already executed");

      const l1AfterReplay = await swf.layerL1();
      const txAfterReplay = await swf.transactions(txId);
      expect(l1AfterReplay.balance).to.equal(l1.balance);
      expect(l1AfterReplay.totalWithdrawn).to.equal(l1.totalWithdrawn);
      expect(l1AfterReplay.totalDeposited).to.equal(l1.totalDeposited);
      expect(txAfterReplay.executed).to.equal(true);
      expect(txAfterReplay.signaturesCount).to.equal(tx_.signaturesCount);
    });

    it("executed L1 withdrawal cannot be replayed or mutate accounting again", async function () {
      await swf.connect(council1).proposeWithdrawal(1, withdrawAmount, "رفاه");
      const txId = 1n;
      await swf.connect(council2).signWithdrawal(txId);
      await swf.connect(council3).signWithdrawal(txId);

      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();
      const txSnapshot = await swf.transactions(txId);
      expect(txSnapshot.executed).to.equal(true);

      await expect(swf.connect(council2).signWithdrawal(txId))
        .to.be.revertedWith("SWF: already executed");

      const l1 = await swf.layerL1();
      const tx_ = await swf.transactions(txId);
      expect(l1.balance).to.equal(l1Snapshot.balance);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
      expect(l1.totalWithdrawn).to.equal(l1Snapshot.totalWithdrawn);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot);
      expect(tx_.initiator).to.equal(txSnapshot.initiator);
      expect(tx_.layer).to.equal(txSnapshot.layer);
      expect(tx_.amount).to.equal(txSnapshot.amount);
      expect(tx_.purpose).to.equal(txSnapshot.purpose);
      expect(tx_.timestamp).to.equal(txSnapshot.timestamp);
      expect(tx_.signaturesCount).to.equal(txSnapshot.signaturesCount);
      expect(tx_.executed).to.equal(true);
    });

    it("امضای دوباره توسط یک نفر ممنوع است", async function () {
      await swf.connect(council1).proposeWithdrawal(1, withdrawAmount, "رفاه");
      await expect(swf.connect(council1).signWithdrawal(1n))
        .to.be.revertedWith("SWF: already signed");
    });

    it("برداشت از لایه‌ای با موجودی ناکافی رد می‌شود", async function () {
      const overAmount = depositAmount + ethers.parseUnits("1", 18);
      await swf.connect(council1).proposeWithdrawal(1, overAmount, "test");
      await swf.connect(council2).signWithdrawal(1n);
      await expect(swf.connect(council3).signWithdrawal(1n))
        .to.be.revertedWith("SWF: insufficient L1");
    });

    it("insufficient L1 withdrawal execution is state-neutral", async function () {
      const overAmount = depositAmount + ethers.parseUnits("1", 18);
      await swf.connect(council1).proposeWithdrawal(1, overAmount, "test");
      await swf.connect(council2).signWithdrawal(1n);

      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();
      const txSnapshot = await swf.transactions(1n);
      expect(await swf.txSignatures(1n, council3.address)).to.be.false;

      await expect(swf.connect(council3).signWithdrawal(1n))
        .to.be.revertedWith("SWF: insufficient L1");

      const l1 = await swf.layerL1();
      const tx_ = await swf.transactions(1n);
      expect(l1.balance).to.equal(l1Snapshot.balance);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot);
      expect(tx_.initiator).to.equal(txSnapshot.initiator);
      expect(tx_.layer).to.equal(txSnapshot.layer);
      expect(tx_.amount).to.equal(txSnapshot.amount);
      expect(tx_.purpose).to.equal(txSnapshot.purpose);
      expect(tx_.timestamp).to.equal(txSnapshot.timestamp);
      expect(tx_.signaturesCount).to.equal(txSnapshot.signaturesCount);
      expect(tx_.executed).to.equal(false);
      expect(await swf.txSignatures(1n, council3.address)).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // توزیع بازدهی سالانه
  // ─────────────────────────────────────────

  describe("distributeAnnualYield", function () {
    it("بازدهی ۱۵٪ از L2 به L1 منتقل می‌شود", async function () {
      const l2Deposit = ethers.parseUnits("1000000", 18);
      await swf.connect(council1).depositToL2(l2Deposit, "دارایی مولد");

      const expectedYield = (l2Deposit * 150n) / 1000n;

      const tx = await swf.connect(council1).distributeAnnualYield();
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "AnnualYieldDistributed");
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(expectedYield);

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(expectedYield);
    });

    it("distributeAnnualYield conserves totalAssets and debits L2 by exact yield amount", async function () {
      const l2Deposit = ethers.parseUnits("1000000", 18);
      await swf.connect(council1).depositToL2(l2Deposit, "دارایی مولد");

      const expectedYield = (l2Deposit * 150n) / 1000n;
      const preL1 = await swf.layerL1();
      const preL2 = await swf.layerL2();
      const preTotalAssets = await swf.totalAssets();

      await swf.connect(council1).distributeAnnualYield();

      const postL1 = await swf.layerL1();
      const postL2 = await swf.layerL2();

      expect(postL1.balance).to.equal(preL1.balance + expectedYield);
      expect(postL2.balance).to.equal(preL2.balance - expectedYield);
      expect(postL2.totalWithdrawn).to.equal(preL2.totalWithdrawn + expectedYield);
      expect(await swf.totalAssets()).to.equal(preTotalAssets);
    });
  });

  // ─────────────────────────────────────────
  // دریافت دارایی بازپس‌گرفته (receiveReclaimedAsset)
  // ─────────────────────────────────────────

  describe("receiveReclaimedAsset", function () {
    let reclaimCaller;

    beforeEach(async function () {
      [,,,,,, reclaimCaller] = await ethers.getSigners();
      const RECLAIM = await swf.RECLAIM_ROLE();
      await swf.connect(sovereign).grantRole(RECLAIM, reclaimCaller.address);
    });

    it("دارنده RECLAIM_ROLE می‌تواند دارایی را به L1 واریز کند", async function () {
      const amount = ethers.parseUnits("100000000", 18); // ۱۰۰ میلیون
      await expect(
        swf.connect(reclaimCaller).receiveReclaimedAsset(amount, "بازپس‌گیری")
      ).to.emit(swf, "DepositToL1")
        .withArgs(amount, "بازپس‌گیری", amount);

      const layer = await swf.layerL1();
      expect(layer.balance).to.equal(amount);
      expect(layer.totalDeposited).to.equal(amount);
    });

    it("چند واریز پشت سر هم موجودی L1 را درست جمع می‌کند", async function () {
      const a1 = ethers.parseUnits("50000000", 18);
      const a2 = ethers.parseUnits("75000000", 18);
      await swf.connect(reclaimCaller).receiveReclaimedAsset(a1, "بازپس‌گیری");
      await swf.connect(reclaimCaller).receiveReclaimedAsset(a2, "بازپس‌گیری");
      const layer = await swf.layerL1();
      expect(layer.balance).to.equal(a1 + a2);
    });

    it("valid reclaimed deposit preserves prior accounting history", async function () {
      const firstDeposit = ethers.parseUnits("50000000", 18);
      const secondDeposit = ethers.parseUnits("75000000", 18);
      await swf.connect(reclaimCaller).receiveReclaimedAsset(firstDeposit, "بازپس‌گیری");

      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();

      await swf.connect(reclaimCaller).receiveReclaimedAsset(secondDeposit, "بازپس‌گیری");

      const l1 = await swf.layerL1();
      expect(l1Snapshot.balance).to.equal(firstDeposit);
      expect(l1Snapshot.totalDeposited).to.equal(firstDeposit);
      expect(totalAssetsSnapshot).to.equal(firstDeposit);
      expect(l1.balance).to.equal(l1Snapshot.balance + secondDeposit);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited + secondDeposit);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot + secondDeposit);
    });

    it("بدون RECLAIM_ROLE فراخوانی رد می‌شود", async function () {
      await expect(
        swf.connect(stranger).receiveReclaimedAsset(
          ethers.parseUnits("1", 18), "بازپس‌گیری"
        )
      ).to.be.reverted;
    });

    it("unauthorized reclaimed asset deposit is state-neutral", async function () {
      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();

      await expect(
        swf.connect(stranger).receiveReclaimedAsset(
          ethers.parseUnits("1", 18), "بازپس‌گیری"
        )
      ).to.be.reverted;

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(l1Snapshot.balance);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot);
    });

    it("مقدار صفر رد می‌شود", async function () {
      await expect(
        swf.connect(reclaimCaller).receiveReclaimedAsset(0n, "بازپس‌گیری")
      ).to.be.revertedWith("SWF: zero amount");
    });

    it("zero reclaimed asset deposit is state-neutral", async function () {
      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();

      await expect(
        swf.connect(reclaimCaller).receiveReclaimedAsset(0n, "بازپس‌گیری")
      ).to.be.revertedWith("SWF: zero amount");

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(l1Snapshot.balance);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot);
    });

    it("COUNCIL_ROLE بدون RECLAIM_ROLE نمی‌تواند receiveReclaimedAsset را فراخوانی کند", async function () {
      await expect(
        swf.connect(council1).receiveReclaimedAsset(
          ethers.parseUnits("1", 18), "بازپس‌گیری"
        )
      ).to.be.reverted;
    });
  });

  // ─────────────────────────────────────────
  // توابع خواندنی
  // ─────────────────────────────────────────

  describe("totalAssets / layerFillRatio", function () {
    it("totalAssets مجموع سه لایه را برمی‌گرداند", async function () {
      const a1 = ethers.parseUnits("100", 18);
      const a2 = ethers.parseUnits("200", 18);
      await swf.connect(council1).depositToL1(a1, "l1");
      await swf.connect(council1).depositToL2(a2, "l2");
      expect(await swf.totalAssets()).to.equal(a1 + a2);
    });

    it("layerFillRatio با لایه نامعتبر صفر برمی‌گرداند", async function () {
      expect(await swf.layerFillRatio(9)).to.equal(0n);
    });

    it("totalAssets equals sum of three layer balances after deposit-withdrawal-yield sequence", async function () {
      const a1 = ethers.parseUnits("500", 18);
      const a2 = ethers.parseUnits("1000", 18);
      const a3 = ethers.parseUnits("2000", 18);
      const withdrawAmount = ethers.parseUnits("100", 18);

      await swf.connect(council1).depositToL1(a1, "l1");
      await swf.connect(council1).depositToL2(a2, "l2");
      await swf.connect(council1).depositToL3(a3, "l3");

      let l1 = await swf.layerL1();
      let l2 = await swf.layerL2();
      let l3 = await swf.layerL3();
      expect(await swf.totalAssets()).to.equal(l1.balance + l2.balance + l3.balance);

      await swf.connect(council1).proposeWithdrawal(1, withdrawAmount, "test withdrawal");
      await swf.connect(council2).signWithdrawal(1n);
      await swf.connect(council3).signWithdrawal(1n);

      l1 = await swf.layerL1();
      l2 = await swf.layerL2();
      l3 = await swf.layerL3();
      expect(await swf.totalAssets()).to.equal(l1.balance + l2.balance + l3.balance);

      await swf.connect(council1).distributeAnnualYield();

      l1 = await swf.layerL1();
      l2 = await swf.layerL2();
      l3 = await swf.layerL3();
      expect(await swf.totalAssets()).to.equal(l1.balance + l2.balance + l3.balance);
    });
  });
});
