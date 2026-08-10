// SPDX-License-Identifier: MIT
// تست‌های انجماد دارایی (AssetFreeze)
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("AssetFreeze", function () {
  let freeze, swf;
  let kernel, crawler, council1, council2, council3, owner, stranger, swfWallet;

  const assetId    = ethers.keccak256(ethers.toUtf8Bytes("asset_001"));
  const assetValue = ethers.parseUnits("500000000", 18); // ۵۰۰ میلیون

  beforeEach(async function () {
    [kernel, crawler, council1, council2, council3, owner, stranger, swfWallet] = await ethers.getSigners();

    // استقرار صندوق ثروت ملی — owner به عنوان حاکم SWF برای اعطای RECLAIM_ROLE
    const SWF = await ethers.getContractFactory("SovereignWealthFund");
    swf = await SWF.deploy(owner.address, kernel.address);

    // استقرار قرارداد انجماد با آدرس‌های مجزا برای کیف‌پول موقت و قرارداد SWF
    const AssetFreeze = await ethers.getContractFactory("AssetFreeze");
    freeze = await AssetFreeze.deploy(
      kernel.address,
      kernel.address,
      swfWallet.address,        // کیف‌پول موقت مرحله ۲
      await swf.getAddress()    // قرارداد SWF برای انتقال دائم مرحله ۴
    );

    // اعطای نقش‌های AssetFreeze
    const CRAWLER = await freeze.CRAWLER_ROLE();
    const COUNCIL = await freeze.COUNCIL_ROLE();
    await freeze.connect(kernel).grantRole(CRAWLER, crawler.address);
    await freeze.connect(kernel).grantRole(COUNCIL, council1.address);
    await freeze.connect(kernel).grantRole(COUNCIL, council2.address);
    await freeze.connect(kernel).grantRole(COUNCIL, council3.address);

    // اعطای RECLAIM_ROLE به قرارداد AssetFreeze در SWF
    const RECLAIM = await swf.RECLAIM_ROLE();
    await swf.connect(owner).grantRole(RECLAIM, await freeze.getAddress());
  });

  // ─────────────────────────────────────────
  // انجماد دارایی
  // ─────────────────────────────────────────

  describe("freezeAsset", function () {
    it("خزنده می‌تواند دارایی منجمد کند", async function () {
      const tx = await freeze.connect(crawler).freezeAsset(
        assetId, owner.address, "ملک", assetValue, "دارایی غصبی"
      );
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(freeze, "AssetFrozen")
        .withArgs(assetId, owner.address, assetValue, block.timestamp);

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
    it("آدرس مالک صفر رد می‌شود", async function () {
      const freshId = ethers.keccak256(ethers.toUtf8Bytes("asset_invalid_owner"));
      await expect(
        freeze.connect(crawler).freezeAsset(
          freshId, ethers.ZeroAddress, "ملک", assetValue, "تست مالک نامعتبر"
        )
      ).to.be.revertedWith("AssetFreeze: invalid owner");
    });

    it("شناسه صفر رد می‌شود", async function () {
      await expect(
        freeze.connect(crawler).freezeAsset(
          ethers.ZeroHash, owner.address, "ملک", assetValue, "تست"
        )
      ).to.be.revertedWith("AssetFreeze: invalid id");
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

    it("دارایی ناموجود رد می‌شود", async function () {
      const missingId = ethers.keccak256(ethers.toUtf8Bytes("missing-asset"));
      await expect(freeze.connect(council1).signConfirmation(missingId))
        .to.be.revertedWith("AssetFreeze: not found");
    });

    it("وضعیت نامعتبر رد می‌شود", async function () {
      await freeze.connect(council1).signConfirmation(assetId);
      await freeze.connect(council2).signConfirmation(assetId);
      await freeze.connect(council3).signConfirmation(assetId);
      const COUNCIL = await freeze.COUNCIL_ROLE();
      await freeze.connect(kernel).grantRole(COUNCIL, stranger.address);
      await expect(freeze.connect(stranger).signConfirmation(assetId))
        .to.be.revertedWith("AssetFreeze: invalid status");
    });

    it("امضای تکراری وضعیت و شمارش امضا را تغییر نمی‌دهد", async function () {
      await freeze.connect(council1).signConfirmation(assetId);
      const snap = await freeze.getFrozenAsset(assetId);
      const sigsBefore    = snap.councilSignatures;
      const statusBefore  = snap.status;
      const frozenBefore  = await freeze.totalFrozenValue();

      await expect(freeze.connect(council1).signConfirmation(assetId))
        .to.be.revertedWith("AssetFreeze: already signed");

      const after = await freeze.getFrozenAsset(assetId);
      expect(after.councilSignatures).to.equal(sigsBefore);
      expect(after.status).to.equal(statusBefore);
      expect(await freeze.totalFrozenValue()).to.equal(frozenBefore);
    });

    it("غیر‌شورا نمی‌تواند تایید کند و وضعیت ثابت می‌ماند", async function () {
      const snap        = await freeze.getFrozenAsset(assetId);
      const sigsBefore  = snap.councilSignatures;
      const statusBefore = snap.status;
      const frozenBefore = await freeze.totalFrozenValue();

      await expect(freeze.connect(stranger).signConfirmation(assetId))
        .to.be.reverted;

      const after = await freeze.getFrozenAsset(assetId);
      expect(after.councilSignatures).to.equal(sigsBefore);
      expect(after.status).to.equal(statusBefore);
      expect(await freeze.totalFrozenValue()).to.equal(frozenBefore);
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
      const tx = await freeze.connect(council1).transferToSWF(assetId);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(freeze, "AssetTransferredToSWF")
        .withArgs(assetId, assetValue, block.timestamp);
    });

    it("انتقال دوباره رد می‌شود", async function () {
      await freeze.connect(council1).transferToSWF(assetId);
      await expect(freeze.connect(council1).transferToSWF(assetId))
        .to.be.revertedWith("AssetFreeze: already transferred");
    });

    it("duplicate transfer failure preserves reclaim and SWF accounting", async function () {
      await freeze.connect(council1).transferToSWF(assetId);

      const assetSnapshot = await freeze.getFrozenAsset(assetId);
      const frozenValueSnapshot = await freeze.totalFrozenValue();
      const l1Snapshot = await swf.layerL1();
      const totalAssetsSnapshot = await swf.totalAssets();

      await expect(freeze.connect(council1).transferToSWF(assetId))
        .to.be.revertedWith("AssetFreeze: already transferred");

      const asset = await freeze.getFrozenAsset(assetId);
      expect(asset.originalOwner).to.equal(assetSnapshot.originalOwner);
      expect(asset.assetType).to.equal(assetSnapshot.assetType);
      expect(asset.estimatedValue).to.equal(assetSnapshot.estimatedValue);
      expect(asset.frozenAt).to.equal(assetSnapshot.frozenAt);
      expect(asset.status).to.equal(assetSnapshot.status);
      expect(asset.reason).to.equal(assetSnapshot.reason);
      expect(asset.councilSignatures).to.equal(assetSnapshot.councilSignatures);
      expect(asset.transferredToSWF).to.equal(assetSnapshot.transferredToSWF);
      expect(await freeze.totalFrozenValue()).to.equal(frozenValueSnapshot);

      const l1 = await swf.layerL1();
      expect(l1.balance).to.equal(l1Snapshot.balance);
      expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalAssetsSnapshot);
    });

    it("موجودی L1 صندوق ثروت ملی به اندازه ارزش دارایی افزایش می‌یابد", async function () {
      const l1Before = (await swf.layerL1()).balance;
      await freeze.connect(council1).transferToSWF(assetId);
      const l1After = (await swf.layerL1()).balance;
      expect(l1After - l1Before).to.equal(assetValue);
    });

    it("totalFrozenValue به اندازه ارزش دارایی کاهش می‌یابد", async function () {
      const frozenBefore = await freeze.totalFrozenValue();
      await freeze.connect(council1).transferToSWF(assetId);
      const frozenAfter = await freeze.totalFrozenValue();
      expect(frozenBefore - frozenAfter).to.equal(assetValue);
    });

    it("اگر AssetFreeze فاقد RECLAIM_ROLE در SWF باشد، انتقال به‌صورت اتمی revert می‌شود", async function () {
      // استقرار SWF جدید بدون اعطای RECLAIM_ROLE به هیچ‌کس
      const SWF = await ethers.getContractFactory("SovereignWealthFund");
      const freshSwf = await SWF.deploy(owner.address, kernel.address);

      // استقرار AssetFreeze جدید که به SWF بدون نقش اشاره می‌کند
      const AssetFreeze = await ethers.getContractFactory("AssetFreeze");
      const freezeNoRole = await AssetFreeze.deploy(
        kernel.address,
        kernel.address,
        swfWallet.address,
        await freshSwf.getAddress()
      );
      const CRAWLER = await freezeNoRole.CRAWLER_ROLE();
      const COUNCIL = await freezeNoRole.COUNCIL_ROLE();
      await freezeNoRole.connect(kernel).grantRole(CRAWLER, crawler.address);
      await freezeNoRole.connect(kernel).grantRole(COUNCIL, council1.address);
      await freezeNoRole.connect(kernel).grantRole(COUNCIL, council2.address);
      await freezeNoRole.connect(kernel).grantRole(COUNCIL, council3.address);

      await freezeNoRole.connect(crawler).freezeAsset(assetId, owner.address, "ملک", assetValue, "دارایی غصبی");
      await freezeNoRole.connect(council1).signConfirmation(assetId);
      await freezeNoRole.connect(council2).signConfirmation(assetId);
      await freezeNoRole.connect(council3).signConfirmation(assetId);

      // باید revert شود — SWF فراخوانی را رد می‌کند
      await expect(
        freezeNoRole.connect(council1).transferToSWF(assetId)
      ).to.be.reverted;

      // تأیید اتمیک‌بودن: وضعیت AssetFreeze تغییر نکرده
      const asset = await freezeNoRole.getFrozenAsset(assetId);
      expect(asset.transferredToSWF).to.equal(false);
      expect(await freezeNoRole.totalFrozenValue()).to.equal(assetValue);
    });

    it("CLC-02: transferToSWF on non-confirmed asset reverts; SWF layerL1, totalAssets, and txCount unchanged", async function () {
      // asset is frozen but NOT confirmed (status = Active) — guard fires before any SWF call
      const unconfirmedId = ethers.keccak256(ethers.toUtf8Bytes("clc02_asset"));
      await freeze.connect(crawler).freezeAsset(unconfirmedId, owner.address, "ملک", assetValue, "CLC-02 test");

      const l1Before          = await swf.layerL1();
      const totalAssetsBefore = await swf.totalAssets();
      const txCountBefore     = await swf.txCount();

      await expect(
        freeze.connect(council1).transferToSWF(unconfirmedId)
      ).to.be.revertedWith("AssetFreeze: not confirmed");

      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalDeposited).to.equal(l1Before.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalAssetsBefore);
      expect(await swf.txCount()).to.equal(txCountBefore);
    });

    it("شناسه ناموجود رد می‌شود و وضعیت ثابت می‌ماند", async function () {
      const invalidId      = ethers.keccak256(ethers.toUtf8Bytes("never-frozen-asset"));
      const frozenBefore   = await freeze.totalFrozenValue();
      const l1Before       = await swf.layerL1();
      const totalBefore    = await swf.totalAssets();

      await expect(freeze.connect(council1).transferToSWF(invalidId))
        .to.be.revertedWith("AssetFreeze: not confirmed");

      expect(await freeze.totalFrozenValue()).to.equal(frozenBefore);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalDeposited).to.equal(l1Before.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalBefore);
    });

    it("انتقال تکراری پس از موفقیت رد می‌شود و وضعیت ثابت می‌ماند", async function () {
      const replayId = ethers.keccak256(ethers.toUtf8Bytes("replay-transfer-asset"));
      await freeze.connect(crawler).freezeAsset(
        replayId, owner.address, "ملک", assetValue, "تست تکرار انتقال"
      );
      await freeze.connect(council1).signConfirmation(replayId);
      await freeze.connect(council2).signConfirmation(replayId);
      await freeze.connect(council3).signConfirmation(replayId);

      await freeze.connect(council1).transferToSWF(replayId);

      const snapAsset    = await freeze.getFrozenAsset(replayId);
      const frozenSnap   = await freeze.totalFrozenValue();
      const l1Snap       = await swf.layerL1();
      const totalSnap    = await swf.totalAssets();
      const txCountSnap  = await swf.txCount();

      expect(snapAsset.transferredToSWF).to.equal(true);

      await expect(freeze.connect(council1).transferToSWF(replayId))
        .to.be.revertedWith("AssetFreeze: already transferred");

      const afterAsset = await freeze.getFrozenAsset(replayId);
      expect(afterAsset.status).to.equal(snapAsset.status);
      expect(afterAsset.transferredToSWF).to.equal(snapAsset.transferredToSWF);
      expect(afterAsset.councilSignatures).to.equal(snapAsset.councilSignatures);
      expect(await freeze.totalFrozenValue()).to.equal(frozenSnap);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Snap.balance);
      expect(l1After.totalDeposited).to.equal(l1Snap.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalSnap);
      expect(await swf.txCount()).to.equal(txCountSnap);
    });

    it("دارایی تأییدنشده رد می‌شود و وضعیت ثابت می‌ماند", async function () {
      const partialId = ethers.keccak256(ethers.toUtf8Bytes("partial-confirmed-asset"));
      await freeze.connect(crawler).freezeAsset(
        partialId, owner.address, "ملک", assetValue, "تست وضعیت ناقص"
      );
      await freeze.connect(council1).signConfirmation(partialId); // UnderReview, not Confirmed

      const snapAsset  = await freeze.getFrozenAsset(partialId);
      const frozenBefore  = await freeze.totalFrozenValue();
      const l1Before      = await swf.layerL1();
      const totalBefore   = await swf.totalAssets();

      await expect(freeze.connect(council1).transferToSWF(partialId))
        .to.be.revertedWith("AssetFreeze: not confirmed");

      const afterAsset = await freeze.getFrozenAsset(partialId);
      expect(afterAsset.status).to.equal(snapAsset.status);
      expect(afterAsset.councilSignatures).to.equal(snapAsset.councilSignatures);
      expect(afterAsset.transferredToSWF).to.equal(snapAsset.transferredToSWF);
      expect(await freeze.totalFrozenValue()).to.equal(frozenBefore);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Before.balance);
      expect(l1After.totalDeposited).to.equal(l1Before.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalBefore);
    });

    it("غیر‌شورا نمی‌تواند انتقال دهد و وضعیت ثابت می‌ماند", async function () {
      const snapAsset   = await freeze.getFrozenAsset(assetId);
      const frozenSnap  = await freeze.totalFrozenValue();
      const l1Snap      = await swf.layerL1();
      const totalSnap   = await swf.totalAssets();
      const txCountSnap = await swf.txCount();

      await expect(freeze.connect(stranger).transferToSWF(assetId))
        .to.be.reverted;

      const afterAsset = await freeze.getFrozenAsset(assetId);
      expect(afterAsset.status).to.equal(snapAsset.status);
      expect(afterAsset.transferredToSWF).to.equal(snapAsset.transferredToSWF);
      expect(afterAsset.councilSignatures).to.equal(snapAsset.councilSignatures);
      expect(await freeze.totalFrozenValue()).to.equal(frozenSnap);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Snap.balance);
      expect(l1After.totalDeposited).to.equal(l1Snap.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalSnap);
      expect(await swf.txCount()).to.equal(txCountSnap);
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

    it("دارایی ناموجود رد می‌شود و totalFrozenValue ثابت می‌ماند", async function () {
      const neverFrozenId = ethers.keccak256(ethers.toUtf8Bytes("never-frozen"));
      const frozenBefore  = await freeze.totalFrozenValue();

      await expect(freeze.connect(kernel).releaseAsset(neverFrozenId, "test"))
        .to.be.revertedWith("AssetFreeze: not found");

      expect(await freeze.totalFrozenValue()).to.equal(frozenBefore);
    });

    it("دارایی منتقل‌شده نمی‌تواند آزاد شود و وضعیت ثابت می‌ماند", async function () {
      const transferredId = ethers.keccak256(ethers.toUtf8Bytes("release-after-transfer"));
      await freeze.connect(crawler).freezeAsset(
        transferredId, owner.address, "ملک", assetValue, "تست آزادسازی پس از انتقال"
      );
      await freeze.connect(council1).signConfirmation(transferredId);
      await freeze.connect(council2).signConfirmation(transferredId);
      await freeze.connect(council3).signConfirmation(transferredId);
      await freeze.connect(council1).transferToSWF(transferredId);

      const snapAsset   = await freeze.getFrozenAsset(transferredId);
      const frozenSnap  = await freeze.totalFrozenValue();
      const l1Snap      = await swf.layerL1();
      const totalSnap   = await swf.totalAssets();

      expect(snapAsset.transferredToSWF).to.equal(true);

      await expect(freeze.connect(kernel).releaseAsset(transferredId, "test"))
        .to.be.revertedWith("AssetFreeze: already transferred");

      const afterAsset = await freeze.getFrozenAsset(transferredId);
      expect(afterAsset.status).to.equal(snapAsset.status);
      expect(afterAsset.transferredToSWF).to.equal(snapAsset.transferredToSWF);
      expect(afterAsset.estimatedValue).to.equal(snapAsset.estimatedValue);
      expect(await freeze.totalFrozenValue()).to.equal(frozenSnap);
      const l1After = await swf.layerL1();
      expect(l1After.balance).to.equal(l1Snap.balance);
      expect(l1After.totalDeposited).to.equal(l1Snap.totalDeposited);
      expect(await swf.totalAssets()).to.equal(totalSnap);
    });
  });
});
