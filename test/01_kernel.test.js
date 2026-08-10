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

    // Treasury واقعی برای TG-01: executeTrigger باید blockAddressByTrigger را فراخوانی کند
    const TreasuryFactory = await ethers.getContractFactory("Treasury");
    const kernelTreasury = await TreasuryFactory.deploy(sovereign.address, await kernel.getAddress());
    await kernelTreasury.waitForDeployment();

    // سپس TriggerProtocol با آدرس واقعی Kernel مستقر می‌شود
    const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
    triggerProtocol = await TriggerProtocol.deploy(
      await kernel.getAddress(),
      await kernelTreasury.getAddress(),
      swf.address
    );

    // TG-01: اعطای KERNEL_ROLE به TriggerProtocol روی Treasury
    await kernelTreasury.connect(sovereign).grantRole(
      await kernelTreasury.KERNEL_ROLE(),
      await triggerProtocol.getAddress()
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

    it("partial court signatures below threshold do not activate trigger", async function () {
      const signers = await ethers.getSigners();
      const extraCourts = signers.slice(6, 11);
      const COURT_ROLE = await kernel.COURT_ROLE();
      const GUARDIAN_ROLE = await kernel.GUARDIAN_ROLE();

      await kernel.connect(sovereign).grantOfficialAccess(stranger.address, GUARDIAN_ROLE);
      expect(await kernel.isAccessActive(stranger.address)).to.be.true;

      for (const extraCourt of extraCourts) {
        await kernel.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
      }

      const courtSigners = [court, ...extraCourts];
      for (let i = 0; i < courtSigners.length; i++) {
        await expect(kernel.connect(courtSigners[i]).signViolation(violationId))
          .to.emit(kernel, "ViolationSigned")
          .withArgs(violationId, courtSigners[i].address, i + 1);
      }

      let record = await kernel.violations(violationId);
      expect(record.signaturesCount).to.equal(6);
      expect(record.courtConfirmed).to.be.false;
      expect(record.triggered).to.be.false;
      expect(await kernel.triggerActivationCount()).to.equal(0);
      expect(await triggerProtocol.executionCount()).to.equal(0);
      expect(await kernel.isAccessActive(stranger.address)).to.be.true;

      await expect(
        kernel.connect(courtSigners[0]).signViolation(violationId)
      ).to.be.revertedWith("Kernel: already signed");

      record = await kernel.violations(violationId);
      expect(record.signaturesCount).to.equal(6);
      expect(record.courtConfirmed).to.be.false;
      expect(record.triggered).to.be.false;
      expect(await kernel.triggerActivationCount()).to.equal(0);
      expect(await triggerProtocol.executionCount()).to.equal(0);
      expect(await kernel.isAccessActive(stranger.address)).to.be.true;
    });

    it("post-threshold signing attempts do not replay trigger execution", async function () {
      const signers = await ethers.getSigners();
      const extraCourts = signers.slice(6, 13);
      const COURT_ROLE = await kernel.COURT_ROLE();
      const GUARDIAN_ROLE = await kernel.GUARDIAN_ROLE();

      await kernel.connect(sovereign).grantOfficialAccess(stranger.address, GUARDIAN_ROLE);
      expect(await kernel.isAccessActive(stranger.address)).to.be.true;

      for (const extraCourt of extraCourts) {
        await kernel.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
      }

      const courtSigners = [court, ...extraCourts];
      for (let i = 0; i < 6; i++) {
        await kernel.connect(courtSigners[i]).signViolation(violationId);
      }

      await expect(kernel.connect(courtSigners[6]).signViolation(violationId))
        .to.emit(kernel, "ViolationSigned")
        .withArgs(violationId, courtSigners[6].address, 7)
        .and.to.emit(kernel, "TriggerActivated");

      let record = await kernel.violations(violationId);
      let execution = await triggerProtocol.executions(1);

      expect(record.signaturesCount).to.equal(7);
      expect(record.courtConfirmed).to.be.true;
      expect(record.triggered).to.be.true;
      expect(await kernel.triggerActivationCount()).to.equal(1);
      expect(await triggerProtocol.executionCount()).to.equal(1);
      expect(execution.violationId).to.equal(violationId);
      expect(execution.offender).to.equal(stranger.address);
      expect(execution.violationCode).to.equal(4);
      expect(await kernel.isAccessActive(stranger.address)).to.be.false;

      await expect(
        kernel.connect(courtSigners[7]).signViolation(violationId)
      ).to.be.revertedWith("Kernel: trigger already activated");

      record = await kernel.violations(violationId);
      execution = await triggerProtocol.executions(1);

      expect(record.signaturesCount).to.equal(7);
      expect(record.courtConfirmed).to.be.true;
      expect(record.triggered).to.be.true;
      expect(await kernel.triggerActivationCount()).to.equal(1);
      expect(await triggerProtocol.executionCount()).to.equal(1);
      expect(execution.violationId).to.equal(violationId);
      expect(execution.offender).to.equal(stranger.address);
      expect(execution.violationCode).to.equal(4);
      expect(await kernel.isAccessActive(stranger.address)).to.be.false;
    });

    it("signature path remains explicit after trigger timeout elapses", async function () {
      const triggerTimeout = await kernel.TRIGGER_TIMEOUT();
      expect(triggerTimeout).to.equal(72n * 3600n);

      const signers = await ethers.getSigners();
      const extraCourts = signers.slice(6, 12);
      const COURT_ROLE = await kernel.COURT_ROLE();
      const GUARDIAN_ROLE = await kernel.GUARDIAN_ROLE();

      await kernel.connect(sovereign).grantOfficialAccess(stranger.address, GUARDIAN_ROLE);
      expect(await kernel.isAccessActive(stranger.address)).to.be.true;

      for (const extraCourt of extraCourts) {
        await kernel.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
      }

      await ethers.provider.send("evm_increaseTime", [Number(triggerTimeout + 1n)]);
      await ethers.provider.send("evm_mine");

      const courtSigners = [court, ...extraCourts];
      for (let i = 0; i < 6; i++) {
        await kernel.connect(courtSigners[i]).signViolation(violationId);
      }

      let record = await kernel.violations(violationId);
      expect(record.signaturesCount).to.equal(6);
      expect(record.courtConfirmed).to.be.false;
      expect(record.triggered).to.be.false;
      expect(await kernel.triggerActivationCount()).to.equal(0);
      expect(await triggerProtocol.executionCount()).to.equal(0);
      expect(await kernel.isAccessActive(stranger.address)).to.be.true;

      await expect(kernel.connect(courtSigners[6]).signViolation(violationId))
        .to.emit(kernel, "ViolationSigned")
        .withArgs(violationId, courtSigners[6].address, 7)
        .and.to.emit(kernel, "TriggerActivated");

      record = await kernel.violations(violationId);
      expect(record.signaturesCount).to.equal(7);
      expect(record.courtConfirmed).to.be.true;
      expect(record.triggered).to.be.true;
      expect(await kernel.triggerActivationCount()).to.equal(1);
      expect(await triggerProtocol.executionCount()).to.equal(1);
      expect(await kernel.isAccessActive(stranger.address)).to.be.false;
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

    it("Step8: unauthorized Kernel admin attempts remain state-neutral while sovereign role path works", async function () {
      const GUARDIAN = await kernel.GUARDIAN_ROLE();
      const ORACLE = await kernel.ORACLE_ROLE();
      const originalTriggerProtocol = await kernel.triggerProtocol();
      const originalSwf = await kernel.sovereignWealthFund();
      const originalViolationCount = await kernel.violationCount();
      const originalTriggerActivationCount = await kernel.triggerActivationCount();

      expect(await kernel.isAccessActive(guardian.address)).to.be.false;
      expect(await kernel.hasRole(GUARDIAN, guardian.address)).to.be.false;

      await expect(
        kernel.connect(stranger).grantOfficialAccess(guardian.address, GUARDIAN)
      ).to.be.revertedWith("Kernel: caller is not the Sovereign");

      await expect(
        kernel.connect(stranger).setTriggerProtocol(guardian.address)
      ).to.be.revertedWith("Kernel: caller is not the Sovereign");

      await expect(
        kernel.connect(stranger).setSovereignWealthFund(guardian.address)
      ).to.be.revertedWith("Kernel: caller is not the Sovereign");

      await expect(
        kernel.connect(stranger).deactivateEmergencyLock()
      ).to.be.revertedWith("Kernel: caller is not the Court");

      expect(await kernel.isAccessActive(guardian.address)).to.be.false;
      expect(await kernel.hasRole(GUARDIAN, guardian.address)).to.be.false;
      expect(await kernel.triggerProtocol()).to.equal(originalTriggerProtocol);
      expect(await kernel.sovereignWealthFund()).to.equal(originalSwf);
      expect(await kernel.violationCount()).to.equal(originalViolationCount);
      expect(await kernel.triggerActivationCount()).to.equal(originalTriggerActivationCount);
      expect(await kernel.emergencyLockActive()).to.be.false;

      await expect(
        kernel.connect(sovereign).grantOfficialAccess(guardian.address, GUARDIAN)
      ).to.emit(kernel, "AccessGranted");

      expect(await kernel.isAccessActive(guardian.address)).to.be.true;
      expect(await kernel.hasRole(GUARDIAN, guardian.address)).to.be.true;
      expect(await kernel.hasRole(ORACLE, guardian.address)).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // CLC-06: اجرای قفل اضطراری
  // ─────────────────────────────────────────

  describe("CLC-06 emergency lock enforcement", function () {
    beforeEach(async function () {
      // فعال‌سازی قفل اضطراری از طریق TR-01
      await kernel.connect(oracle).flagViolation(1, stranger.address, "TR-01 test");
      expect(await kernel.emergencyLockActive()).to.be.true;
    });

    it("grantOfficialAccess reverts during active emergency lock", async function () {
      const GUARDIAN = await kernel.GUARDIAN_ROLE();
      await expect(
        kernel.connect(sovereign).grantOfficialAccess(guardian.address, GUARDIAN)
      ).to.be.revertedWith("Kernel: system is under emergency lock");
    });

    it("setTriggerProtocol reverts during active emergency lock", async function () {
      await expect(
        kernel.connect(sovereign).setTriggerProtocol(guardian.address)
      ).to.be.revertedWith("Kernel: system is under emergency lock");
    });

    it("setSovereignWealthFund reverts during active emergency lock", async function () {
      await expect(
        kernel.connect(sovereign).setSovereignWealthFund(guardian.address)
      ).to.be.revertedWith("Kernel: system is under emergency lock");
    });

    it("flagViolation remains callable during active emergency lock", async function () {
      await expect(
        kernel.connect(oracle).flagViolation(4, guardian.address, "TR-04 during lock")
      ).to.emit(kernel, "ViolationFlagged");
      expect(await kernel.violationCount()).to.equal(2n);
    });

    it("signViolation remains callable during active emergency lock", async function () {
      const signers = await ethers.getSigners();
      const extraCourts = signers.slice(6, 13);
      const COURT_ROLE = await kernel.COURT_ROLE();
      // دادگاه را قبل از قفل اضطراری ثبت کنید
      // اعطای نقش نیاز به قفل نبودن دارد — در beforeEach والد انجام می‌شود
      // پس از قفل، صرفاً امضا ممکن است

      // ثبت تخلف TR-04 (بدون قفل) — پیش از این تست
      // چون در beforeEach قفل فعال است، violationId=1 ثبت شده
      // می‌توان violationId=1 را که در beforeEach ثبت شد امضا کرد
      await expect(
        kernel.connect(court).signViolation(1)
      ).to.emit(kernel, "ViolationSigned");
    });

    it("deactivateEmergencyLock remains callable during active emergency lock", async function () {
      await expect(
        kernel.connect(court).deactivateEmergencyLock()
      ).to.emit(kernel, "EmergencyLockDeactivated");
      expect(await kernel.emergencyLockActive()).to.be.false;
    });

    it("authority setters work normally after lock is deactivated", async function () {
      await kernel.connect(court).deactivateEmergencyLock();
      expect(await kernel.emergencyLockActive()).to.be.false;

      const GUARDIAN = await kernel.GUARDIAN_ROLE();
      await expect(
        kernel.connect(sovereign).grantOfficialAccess(guardian.address, GUARDIAN)
      ).to.emit(kernel, "AccessGranted");
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
