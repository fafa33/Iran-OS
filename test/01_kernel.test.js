// SPDX-License-Identifier: MIT
// تست‌های هسته (Kernel) — IranOS_Kernel
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("IranOS_Kernel", function () {
  let kernel, triggerProtocol;
  let sovereign, court, oracle, guardian, stranger;
  let swf;

  beforeEach(async function () {
    [sovereign, court, oracle, guardian, stranger, swf] = await ethers.getSigners();

    // ابتدا Kernel مستقر می‌شود
    const Kernel = await ethers.getContractFactory("IranOS_Kernel");
    kernel = await Kernel.deploy(
      sovereign.address,
      court.address,
      oracle.address,
      swf.address
    );

    // سپس TriggerProtocol با آدرس واقعی Kernel مستقر می‌شود
    const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
    triggerProtocol = await TriggerProtocol.deploy(
      await kernel.getAddress(), // kernel — آدرس واقعی
      stranger.address,          // treasury (مثال)
      swf.address
    );

    // اتصال TriggerProtocol به Kernel
    await kernel.connect(sovereign).setTriggerProtocol(await triggerProtocol.getAddress());
  });

  // ─────────────────────────────────────────
  // استقرار
  // ─────────────────────────────────────────

  describe("استقرار", function () {
    it("ثوابت سیستمی درست تنظیم شده‌اند", async function () {
      expect(await kernel.LIQUIDITY_CAP()).to.equal(
        ethers.parseUnits("900000000000", 18)
      );
      expect(await kernel.MIN_RESERVE_RATIO()).to.equal(333n);
      expect(await kernel.MULTISIG_THRESHOLD()).to.equal(7);
      expect(await kernel.TRIGGER_TIMEOUT()).to.equal(72n * 3600n);
    });

    it("نقش‌ها به درستی اعطا شده‌اند", async function () {
      const SOVEREIGN = await kernel.SOVEREIGN_ROLE();
      const COURT     = await kernel.COURT_ROLE();
      const ORC       = await kernel.ORACLE_ROLE();

      expect(await kernel.hasRole(SOVEREIGN, sovereign.address)).to.be.true;
      expect(await kernel.hasRole(COURT,     court.address)).to.be.true;
      expect(await kernel.hasRole(ORC,       oracle.address)).to.be.true;
    });

    it("سیستم در حالت سالم شروع می‌شود", async function () {
      expect(await kernel.isSystemHealthy()).to.be.true;
      expect(await kernel.emergencyLockActive()).to.be.false;
      expect(await kernel.violationCount()).to.equal(0n);
    });
  });

  // ─────────────────────────────────────────
  // ثبت تخلف
  // ─────────────────────────────────────────

  describe("flagViolation", function () {
    it("اوراکل می‌تواند تخلف ثبت کند", async function () {
      const tx = await kernel.connect(oracle).flagViolation(
        4, // TR-04 — حقوق بنیادین
        stranger.address,
        "نقض آزادی بیان"
      );
      await expect(tx).to.emit(kernel, "ViolationFlagged");
      expect(await kernel.violationCount()).to.equal(1n);
    });

    it("تخلف TR-01 قفل اضطراری فعال می‌کند", async function () {
      await kernel.connect(oracle).flagViolation(
        1, stranger.address, "نقض پادشاهی مشروطه"
      );
      expect(await kernel.emergencyLockActive()).to.be.true;
    });

    it("تخلف TR-02 قفل اضطراری فعال می‌کند", async function () {
      await kernel.connect(oracle).flagViolation(
        2, stranger.address, "نقض سکولاریسم"
      );
      expect(await kernel.emergencyLockActive()).to.be.true;
    });

    it("تخلف TR-03 قفل اضطراری فعال می‌کند", async function () {
      await kernel.connect(oracle).flagViolation(
        3, stranger.address, "نقض یکپارچگی ارضی"
      );
      expect(await kernel.emergencyLockActive()).to.be.true;
    });

    it("تخلف TR-04 قفل اضطراری فعال نمی‌کند", async function () {
      await kernel.connect(oracle).flagViolation(
        4, stranger.address, "نقض حقوق بنیادین"
      );
      expect(await kernel.emergencyLockActive()).to.be.false;
    });

    it("غیر‌اوراکل نمی‌تواند تخلف ثبت کند", async function () {
      await expect(
        kernel.connect(stranger).flagViolation(1, stranger.address, "test")
      ).to.be.revertedWith("Kernel: caller is not an Oracle");
    });

    it("کد تخلف نامعتبر رد می‌شود", async function () {
      await expect(
        kernel.connect(oracle).flagViolation(7, stranger.address, "invalid")
      ).to.be.revertedWith("Kernel: invalid violation code");
    });

    it("آدرس خاطی صفر رد می‌شود", async function () {
      await expect(
        kernel.connect(oracle).flagViolation(1, ethers.ZeroAddress, "test")
      ).to.be.revertedWith("Kernel: invalid offender address");
    });
  });

  // ─────────────────────────────────────────
  // امضای تخلف (Multi-Sig)
  // ─────────────────────────────────────────

  describe("signViolation", function () {
    let violationId;

    beforeEach(async function () {
      // ثبت یک تخلف TR-04 (بدون قفل اضطراری)
      const tx = await kernel.connect(oracle).flagViolation(
        4, stranger.address, "نقض حقوق بنیادین"
      );
      const receipt = await tx.wait();
      violationId = 1n;
    });

    it("عضو دادگاه می‌تواند تخلف را امضا کند", async function () {
      await expect(kernel.connect(court).signViolation(violationId))
        .to.emit(kernel, "ViolationSigned")
        .withArgs(violationId, court.address, 1);
    });

    it("امضای دوباره ممنوع است", async function () {
      await kernel.connect(court).signViolation(violationId);
      await expect(
        kernel.connect(court).signViolation(violationId)
      ).to.be.revertedWith("Kernel: already signed");
    });

    it("غیر‌دادگاه نمی‌تواند امضا کند", async function () {
      await expect(
        kernel.connect(stranger).signViolation(violationId)
      ).to.be.revertedWith("Kernel: caller is not the Court");
    });
  });

  // ─────────────────────────────────────────
  // قفل اضطراری
  // ─────────────────────────────────────────

  describe("قفل اضطراری", function () {
    it("دادگاه می‌تواند قفل را رفع کند", async function () {
      await kernel.connect(oracle).flagViolation(1, stranger.address, "test");
      expect(await kernel.emergencyLockActive()).to.be.true;

      await expect(kernel.connect(court).deactivateEmergencyLock())
        .to.emit(kernel, "EmergencyLockDeactivated");

      expect(await kernel.emergencyLockActive()).to.be.false;
    });

    it("غیر‌دادگاه نمی‌تواند قفل را رفع کند", async function () {
      await kernel.connect(oracle).flagViolation(1, stranger.address, "test");
      await expect(
        kernel.connect(stranger).deactivateEmergencyLock()
      ).to.be.revertedWith("Kernel: caller is not the Court");
    });
  });

  // ─────────────────────────────────────────
  // مدیریت دسترسی
  // ─────────────────────────────────────────

  describe("grantOfficialAccess", function () {
    it("پادشاه می‌تواند به نگهبان دسترسی بدهد", async function () {
      const GUARDIAN = await kernel.GUARDIAN_ROLE();
      await expect(
        kernel.connect(sovereign).grantOfficialAccess(guardian.address, GUARDIAN)
      ).to.emit(kernel, "AccessGranted");

      expect(await kernel.isAccessActive(guardian.address)).to.be.true;
    });

    it("پادشاه نمی‌تواند نقش SOVEREIGN اعطا کند", async function () {
      const SOVEREIGN = await kernel.SOVEREIGN_ROLE();
      await expect(
        kernel.connect(sovereign).grantOfficialAccess(stranger.address, SOVEREIGN)
      ).to.be.revertedWith("Kernel: invalid role");
    });

    it("غیر‌پادشاه نمی‌تواند دسترسی اعطا کند", async function () {
      const GUARDIAN = await kernel.GUARDIAN_ROLE();
      await expect(
        kernel.connect(stranger).grantOfficialAccess(guardian.address, GUARDIAN)
      ).to.be.revertedWith("Kernel: caller is not the Sovereign");
    });
  });

  // ─────────────────────────────────────────
  // اطلاعات سیستم
  // ─────────────────────────────────────────

  describe("getSystemInfo", function () {
    it("اطلاعات صحیح برمی‌گرداند", async function () {
      const info = await kernel.getSystemInfo();
      expect(info._emergencyLockActive).to.be.false;
      expect(info._violationCount).to.equal(0n);
      expect(info._triggerActivationCount).to.equal(0n);
      expect(info._liquidityCap).to.equal(ethers.parseUnits("900000000000", 18));
      expect(info._minReserveRatio).to.equal(333n);
    });
  });
});
