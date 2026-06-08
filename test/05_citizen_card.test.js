// SPDX-License-Identifier: MIT
// تست‌های کارت شهروندی (CitizenCard)
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("CitizenCard", function () {
  let card;
  let kernel, issuer, health, welfare, employer, citizen1, citizen2, stranger;

  const biometric1 = ethers.keccak256(ethers.toUtf8Bytes("biometric_citizen_1"));
  const nationalId1 = ethers.keccak256(ethers.toUtf8Bytes("national_id_1"));

  beforeEach(async function () {
    [kernel, issuer, health, welfare, employer, citizen1, citizen2, stranger] = await ethers.getSigners();

    const CitizenCard = await ethers.getContractFactory("CitizenCard");
    card = await CitizenCard.deploy(kernel.address);

    const ISSUER  = await card.ISSUER_ROLE();
    const HEALTH  = await card.HEALTH_ROLE();
    const WELFARE = await card.WELFARE_ROLE();

    await card.connect(kernel).grantRole(ISSUER,  issuer.address);
    await card.connect(kernel).grantRole(HEALTH,  health.address);
    await card.connect(kernel).grantRole(WELFARE, welfare.address);
    await card.connect(kernel).registerEmployer(employer.address);
  });

  // ─────────────────────────────────────────
  // ثبت شهروند
  // ─────────────────────────────────────────

  describe("registerCitizen", function () {
    it("صادرکننده می‌تواند شهروند ثبت کند", async function () {
      const tx = await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(card, "CitizenRegistered")
        .withArgs(citizen1.address, block.timestamp);

      expect(await card.isRegistered(citizen1.address)).to.be.true;
    });

    it("بیومتریک تکراری رد می‌شود", async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
      await expect(
        card.connect(issuer).registerCitizen(
          citizen2.address, biometric1, ethers.keccak256(ethers.toUtf8Bytes("id2")), 1375, false, 0
        )
      ).to.be.revertedWith("CitizenCard: biometric used");
    });

    it("سال تولد نامعتبر رد می‌شود", async function () {
      await expect(
        card.connect(issuer).registerCitizen(
          citizen1.address, biometric1, nationalId1, 1200, false, 0
        )
      ).to.be.revertedWith("CitizenCard: invalid birth year");
    });

    it("غیر‌صادرکننده نمی‌تواند ثبت کند", async function () {
      await expect(
        card.connect(stranger).registerCitizen(
          citizen1.address, biometric1, nationalId1, 1370, false, 0
        )
      ).to.be.reverted;
    });

    it("ثبت با آدرس صفر رد می‌شود", async function () {
      await expect(
        card.connect(issuer).registerCitizen(
          ethers.ZeroAddress, biometric1, nationalId1, 1370, false, 0
        )
      ).to.be.revertedWith("CitizenCard: invalid address");
    });
  });

  // ─────────────────────────────────────────
  // وضعیت اشتغال
  // ─────────────────────────────────────────

  describe("startEmployment / endEmployment", function () {
    beforeEach(async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
    });

    it("کارفرما می‌تواند اشتغال را ثبت کند", async function () {
      await expect(card.connect(employer).startEmployment(citizen1.address))
        .to.emit(card, "EmploymentStarted");

      expect(await card.isEmployed(citizen1.address)).to.be.true;
    });

    it("اشتغال دوباره رد می‌شود", async function () {
      await card.connect(employer).startEmployment(citizen1.address);
      await expect(card.connect(employer).startEmployment(citizen1.address))
        .to.be.revertedWith("CitizenCard: already employed");
    });

    it("شروع اشتغال پس از غیرفعال‌سازی کارت رد می‌شود", async function () {
      await card.connect(kernel).deactivateCard(citizen1.address, "تست");
      await expect(
        card.connect(employer).startEmployment(citizen1.address)
      ).to.be.revertedWith("CitizenCard: card not active");
    });

    it("پایان اشتغال پس از غیرفعال‌سازی کارت رد می‌شود", async function () {
      await card.connect(kernel).deactivateCard(citizen1.address, "تست");
      await expect(
        card.connect(employer).endEmployment(citizen1.address)
      ).to.be.revertedWith("CitizenCard: card not active");
    });

    it("پایان اشتغال وضعیت را به بیکاری تغییر می‌دهد", async function () {
      await card.connect(employer).startEmployment(citizen1.address);
      await expect(card.connect(employer).endEmployment(citizen1.address))
        .to.emit(card, "EmploymentEnded");

      expect(await card.isEmployed(citizen1.address)).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // بیمه بیکاری
  // ─────────────────────────────────────────

  describe("payUnemploymentInsurance", function () {
    beforeEach(async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
    });

    it("مبلغ بیمه ۷۰٪ حداقل حقوق است", async function () {
      const amount = await card.getUnemploymentInsuranceAmount();
      const expected = (ethers.parseUnits("1000", 18) * 700n) / 1000n;
      expect(amount).to.equal(expected);
    });

    it("واحد رفاه می‌تواند بیمه بیکاری پرداخت کند", async function () {
      await expect(card.connect(welfare).payUnemploymentInsurance(citizen1.address))
        .to.emit(card, "UnemploymentInsurancePaid");
    });

    it("شاغل نمی‌تواند بیمه بیکاری دریافت کند", async function () {
      await card.connect(employer).startEmployment(citizen1.address);
      await expect(card.connect(welfare).payUnemploymentInsurance(citizen1.address))
        .to.be.revertedWith("CitizenCard: not unemployed");
    });

    it("پرداخت بیمه بیکاری پس از غیرفعال‌سازی کارت رد می‌شود", async function () {
      await card.connect(kernel).deactivateCard(citizen1.address, "تست");
      await expect(
        card.connect(welfare).payUnemploymentInsurance(citizen1.address)
      ).to.be.revertedWith("CitizenCard: card not active");
    });
  });

  // ─────────────────────────────────────────
  // اعتبار سلامت
  // ─────────────────────────────────────────

  describe("useHealthCredit", function () {
    beforeEach(async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
    });

    it("اعتبار سلامت اولیه ۵۰۰ پهلوی است", async function () {
      const c = await card.getCitizen(citizen1.address);
      expect(c.healthCredit).to.equal(ethers.parseUnits("500", 18));
    });

    it("استفاده از اعتبار سلامت موجودی را کاهش می‌دهد", async function () {
      const use = ethers.parseUnits("100", 18);
      await card.connect(health).useHealthCredit(citizen1.address, use, stranger.address);
      const c = await card.getCitizen(citizen1.address);
      expect(c.healthCredit).to.equal(ethers.parseUnits("400", 18));
    });

    it("استفاده بیش از موجودی رد می‌شود", async function () {
      await expect(
        card.connect(health).useHealthCredit(
          citizen1.address, ethers.parseUnits("9999", 18), stranger.address
        )
      ).to.be.revertedWith("CitizenCard: insufficient health credit");
    });

    it("استفاده از اعتبار سلامت پس از غیرفعال‌سازی کارت رد می‌شود", async function () {
      await card.connect(kernel).deactivateCard(citizen1.address, "تست");
      await expect(
        card.connect(health).useHealthCredit(
          citizen1.address, ethers.parseUnits("10", 18), stranger.address
        )
      ).to.be.revertedWith("CitizenCard: card not active");
    });
  });

  // ─────────────────────────────────────────
  // سهمیه دارو
  // ─────────────────────────────────────────

  describe("useDrugQuota", function () {
    beforeEach(async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
    });

    it("استفاده بیش از سهمیه دارو رد می‌شود", async function () {
      await expect(
        card.connect(health).useDrugQuota(
          citizen1.address, ethers.parseUnits("9999", 18), stranger.address
        )
      ).to.be.revertedWith("CitizenCard: insufficient drug quota");
    });

    it("استفاده از سهمیه دارو پس از غیرفعال‌سازی کارت رد می‌شود", async function () {
      await card.connect(kernel).deactivateCard(citizen1.address, "تست");
      await expect(
        card.connect(health).useDrugQuota(
          citizen1.address, ethers.parseUnits("10", 18), stranger.address
        )
      ).to.be.revertedWith("CitizenCard: card not active");
    });
  });

  // ─────────────────────────────────────────
  // بازنشستگی
  // ─────────────────────────────────────────

  describe("registerRetirement", function () {
    beforeEach(async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
    });

    it("واحد رفاه می‌تواند بازنشستگی ثبت کند", async function () {
      await expect(card.connect(welfare).registerRetirement(citizen1.address))
        .to.emit(card, "RetirementStarted");
      expect(await card.isRetired(citizen1.address)).to.be.true;
    });

    it("ثبت بازنشستگی پس از غیرفعال‌سازی کارت رد می‌شود", async function () {
      await card.connect(kernel).deactivateCard(citizen1.address, "تست");
      await expect(
        card.connect(welfare).registerRetirement(citizen1.address)
      ).to.be.revertedWith("CitizenCard: card not active");
    });
  });

  // ─────────────────────────────────────────
  // غیرفعال‌سازی کارت
  // ─────────────────────────────────────────

  describe("deactivateCard", function () {
    beforeEach(async function () {
      await card.connect(issuer).registerCitizen(
        citizen1.address, biometric1, nationalId1, 1370, false, 0
      );
    });

    it("Kernel می‌تواند کارت را غیرفعال کند", async function () {
      await expect(card.connect(kernel).deactivateCard(citizen1.address, "تخلف"))
        .to.emit(card, "CardDeactivated");
      expect(await card.isRegistered(citizen1.address)).to.be.false;
    });

    it("غیر‌Kernel نمی‌تواند کارت غیرفعال کند", async function () {
      await expect(card.connect(stranger).deactivateCard(citizen1.address, "test"))
        .to.be.reverted;
    });
  });

  // ─────────────────────────────────────────
  // ثبت کارفرما
  // ─────────────────────────────────────────

  describe("registerEmployer", function () {
    it("ثبت کارفرما با آدرس صفر رد می‌شود", async function () {
      await expect(card.connect(kernel).registerEmployer(ethers.ZeroAddress))
        .to.be.revertedWith("CitizenCard: invalid employer");
    });
  });
});
