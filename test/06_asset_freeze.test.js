// SPDX-License-Identifier: MIT
// تست‌های انجماد دارایی (AssetFreeze)
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("AssetFreeze", function () {
  let freeze;
  let kernel, crawler, council1, council2, council3, owner, stranger;
  let swfWallet;

  const assetId    = ethers.keccak256(ethers.toUtf8Bytes("asset_001"));
  const assetValue = ethers.parseUnits("500000000", 18); // ۵۰۰ میلیون

  beforeEach(async function () {
    [kernel, crawler, council1, council2, council3, owner, stranger, swfWallet] = await ethers.getSigners();

    const AssetFreeze = await ethers.getContractFactory("AssetFreeze");
    freeze = await AssetFreeze.deploy(kernel.address, swfWallet.address);

    const CRAWLER = await freeze.CRAWLER_ROLE();
    const COUNCIL = await freeze.COUNCIL_ROLE();

    await freeze.connect(kernel).grantRole(CRAWLER, crawler.address);
    await freeze.connect(kernel).grantRole(COUNCIL, council1.address);
    await freeze.connect(kernel).grantRole(COUNCIL, council2.address);
    await freeze.connect(kernel).grantRole(COUNCIL, council3.address);
  });

  // ─────────────────────────────────────────
  // انجماد دارایی
  // ─────────────────────────────────────────

  describe("freezeAsset", function () {
    it("خزنده می‌تواند دارایی منجمد کند", async function () {
      await expect(
        freeze.connect(crawler).freezeAsset(
          assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
        )
      ).to.emit(freeze, "AssetFrozen")
        .withArgs(assetId, owner.address, assetValue, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await freeze.totalFrozenAssets()).to.equal(1n);
      expect(await freeze.totalFrozenValue()).to.equal(assetValue);
    });

    it("انجماد تکراری همان دارایی رد می‌شود", async function () {
      await freeze.connect(crawler).freezeAsset(
        assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
      );
      await expect(
        freeze.connect(crawler).freezeAsset(
          assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
        )
      ).to.be.revertedWith("AssetFreeze: already frozen");
    });

    it("غیر‌خزنده نمی‌تواند دارایی منجمد کند", async function () {
      await expect(
        freeze.connect(stranger).freezeAsset(
          assetId, owner.address, "ملک", assetValue, "test"
        )
      ).to.be.reverted;
    });

    it("ارزش صفر رد می‌شود", async function () {
      await expect(
        freeze.connect(crawler).freezeAsset(
          assetId, owner.address, "ملک", 0n, "test"
        )
      ).to.be.revertedWith("AssetFreeze: zero value");
    });
  });

  // ─────────────────────────────────────────
  // تایید Multi-Sig شورا
  // ─────────────────────────────────────────

  describe("signConfirmation", function () {
    beforeEach(async function () {
      await freeze.connect(crawler).freezeAsset(
        assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
      );
    });

    it("اولین امضا وضعیت را به UnderReview تغییر می‌دهد", async function () {
      await expect(freeze.connect(council1).signConfirmation(assetId))
        .to.emit(freeze, "AssetReviewStarted");
    });

    it("با ۳ امضا وضعیت به Confirmed تغییر می‌کند", async function () {
      await freeze.connect(council1).signConfirmation(assetId);
      await freeze.connect(council2).signConfirmation(assetId);
      await expect(freeze.connect(council3).signConfirmation(assetId))
        .to.emit(freeze, "AssetConfirmed");

      const asset = await freeze.getFrozenAsset(assetId);
      expect(asset.status).to.equal(2n); // Confirmed = 2
    });

    it("امضای دوباره رد می‌شود", async function () {
      await freeze.connect(council1).signConfirmation(assetId);
      await expect(freeze.connect(council1).signConfirmation(assetId))
        .to.be.revertedWith("AssetFreeze: already signed");
    });
  });

  // ─────────────────────────────────────────
  // انتقال به صندوق ثروت ملی
  // ─────────────────────────────────────────

  describe("transferToSWF", function () {
    beforeEach(async function () {
      await freeze.connect(crawler).freezeAsset(
        assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
      );
      await freeze.connect(council1).signConfirmation(assetId);
      await freeze.connect(council2).signConfirmation(assetId);
      await freeze.connect(council3).signConfirmation(assetId);
    });

    it("شورا می‌تواند دارایی تایید شده را منتقل کند", async function () {
      await expect(freeze.connect(council1).transferToSWF(assetId))
        .to.emit(freeze, "AssetTransferredToSWF")
        .withArgs(assetId, assetValue, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("انتقال دوباره رد می‌شود", async function () {
      await freeze.connect(council1).transferToSWF(assetId);
      await expect(freeze.connect(council1).transferToSWF(assetId))
        .to.be.revertedWith("AssetFreeze: already transferred");
    });
  });

  // ─────────────────────────────────────────
  // آزادسازی دارایی
  // ─────────────────────────────────────────

  describe("releaseAsset", function () {
    beforeEach(async function () {
      await freeze.connect(crawler).freezeAsset(
        assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
      );
    });

    it("Kernel می‌تواند دارایی را آزاد کند", async function () {
      await expect(
        freeze.connect(kernel).releaseAsset(assetId, "اثبات مالکیت مشروع")
      ).to.emit(freeze, "AssetReleased");

      expect(await freeze.totalFrozenValue()).to.equal(0n);
    });

    it("غیر‌Kernel نمی‌تواند دارایی را آزاد کند", async function () {
      await expect(
        freeze.connect(stranger).releaseAsset(assetId, "test")
      ).to.be.reverted;
    });
  });
});
