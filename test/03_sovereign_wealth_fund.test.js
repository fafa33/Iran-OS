// SPDX-License-Identifier: MIT
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
  });

  // ─────────────────────────────────────────
  // توزیع بازدهی سالانه
  // ─────────────────────────────────────────

  describe("distributeAnnualYield", function () {
    it("بازدهی ۱۵٪ از L2 به L1 منتقل می‌شود", async function () {
      const l2Deposit = ethers.parseUnits("1000000", 18);
      await swf.connect(council1).depositToL2(l2Deposit, "دارایی مولد");

      const expectedYield = (l2Deposit * 150n) / 1000n;

      await expect(swf.connect(council1).distributeAnnualYield())
        .to.emit(swf, "AnnualYieldDistributed")
        .withArgs(expectedYield, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(expectedYield);
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
  });
});
