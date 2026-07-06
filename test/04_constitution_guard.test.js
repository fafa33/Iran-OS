// SPDX-License-Identifier: MIT
// تست‌های نگهبان قانون اساسی (ConstitutionGuard)
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("ConstitutionGuard", function () {
  let guard;
  let admin, kernel, proposer, stranger;

  beforeEach(async function () {
    [admin, kernel, proposer, stranger] = await ethers.getSigners();
    const Guard = await ethers.getContractFactory("ConstitutionGuard");
    guard = await Guard.deploy(admin.address, kernel.address);
  });

  describe("استقرار", function () {
    it("آدرس Kernel صحیح ثبت شده", async function () {
      expect(await guard.kernel()).to.equal(kernel.address);
    });

    it("آدرس admin صحیح ثبت شده", async function () {
      expect(await guard.admin()).to.equal(admin.address);
    });

    it("ثوابت اصول منشور صحیح است", async function () {
      expect(await guard.PRINCIPLE_SECULAR()).to.equal(1);
      expect(await guard.PRINCIPLE_RIGHTS()).to.equal(2);
      expect(await guard.PRINCIPLE_TERRITORIAL()).to.equal(3);
      expect(await guard.PRINCIPLE_MONETARY()).to.equal(4);
      expect(await guard.PRINCIPLE_JUDICIAL()).to.equal(5);
    });
  });

  // ─────────────────────────────────────────
  // پیشنهاد قانون
  // ─────────────────────────────────────────

  describe("proposeLaw", function () {
    it("هر کسی می‌تواند قانون پیشنهاد دهد", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون آزادی مطبوعات"));
      const mask = 0x02; // اصل ۲ — حقوق بنیادین

      const tx = await guard.connect(proposer).proposeLaw(hash, mask);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(guard, "LawProposed")
        .withArgs(hash, proposer.address, mask, block.timestamp);
    });

    it("پیشنهاد با هش صفر رد می‌شود", async function () {
      await expect(guard.connect(proposer).proposeLaw(ethers.ZeroHash, 0x01))
        .to.be.revertedWith("ConstitutionGuard: invalid hash");
    });

    it("پیشنهاد بدون اعلام اصول رد می‌شود", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون مجهول"));
      await expect(guard.connect(proposer).proposeLaw(hash, 0))
        .to.be.revertedWith("ConstitutionGuard: must declare affected principles");
    });

    it("پیشنهاد تکراری رد می‌شود", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون تکراری"));
      await guard.connect(proposer).proposeLaw(hash, 0x01);
      await expect(guard.connect(proposer).proposeLaw(hash, 0x01))
        .to.be.revertedWith("ConstitutionGuard: already proposed");
    });

    it("پیشنهاد با ماسک خارج از محدوده اصول رد می‌شود", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون با ماسک نامعتبر"));
      await expect(guard.connect(proposer).proposeLaw(hash, 0x20))
        .to.be.revertedWith("ConstitutionGuard: invalid principles mask");
    });
  });

  // ─────────────────────────────────────────
  // تایید قانون
  // ─────────────────────────────────────────

  describe("approveLaw", function () {
    let lawHash;

    beforeEach(async function () {
      lawHash = ethers.keccak256(ethers.toUtf8Bytes("قانون حمایت از محیط زیست"));
      await guard.connect(proposer).proposeLaw(lawHash, 0x08); // اصل استقلال پولی — غیراجباری
    });

    it("Kernel می‌تواند قانون را تایید کند", async function () {
      await expect(guard.connect(kernel).approveLaw(lawHash))
        .to.emit(guard, "LawApproved");

      expect(await guard.isLawApproved(lawHash)).to.be.true;
    });

    it("غیر‌Kernel نمی‌تواند تایید کند", async function () {
      await expect(guard.connect(stranger).approveLaw(lawHash))
        .to.be.revertedWith("ConstitutionGuard: caller is not the Kernel");
    });

    it("تایید دوباره رد می‌شود", async function () {
      await guard.connect(kernel).approveLaw(lawHash);
      await expect(guard.connect(kernel).approveLaw(lawHash))
        .to.be.revertedWith("ConstitutionGuard: already executed");
    });

    it("تایید قانون متعارض با اصل سکولاریسم (بیت ۰) رد می‌شود", async function () {
      const conflictHash = ethers.keccak256(ethers.toUtf8Bytes("قانون دین رسمی"));
      await guard.connect(proposer).proposeLaw(conflictHash, 0x01); // bit 0 = secularism
      await expect(guard.connect(kernel).approveLaw(conflictHash))
        .to.be.revertedWith("ConstitutionGuard: conflicts with immutable principles");
    });

    it("تایید قانون متعارض با اصول ۱، ۲ و ۳ به‌طور همزمان رد می‌شود", async function () {
      const conflictHash = ethers.keccak256(ethers.toUtf8Bytes("قانون نقض همه اصول"));
      await guard.connect(proposer).proposeLaw(conflictHash, 0x07); // all three immutable
      await expect(guard.connect(kernel).approveLaw(conflictHash))
        .to.be.revertedWith("ConstitutionGuard: conflicts with immutable principles");
    });

    it("تایید قانون مرتبط با اصول ۴ و ۵ (غیراجباری) پذیرفته می‌شود", async function () {
      const safeHash = ethers.keccak256(ethers.toUtf8Bytes("قانون بودجه قضایی"));
      await guard.connect(proposer).proposeLaw(safeHash, 0x18); // bits 3+4 = monetary+judicial only
      await expect(guard.connect(kernel).approveLaw(safeHash))
        .to.emit(guard, "LawApproved");
      expect(await guard.isLawApproved(safeHash)).to.be.true;
    });

    it("تایید برای هشی که پیشنهاد نشده رد می‌شود", async function () {
      const unknownHash = ethers.keccak256(ethers.toUtf8Bytes("قانون پیشنهادنشده - تایید"));
      await expect(guard.connect(kernel).approveLaw(unknownHash))
        .to.be.revertedWith("ConstitutionGuard: proposal not found");
    });

    it("admin (نماینده امضاکننده واقعی Kernel) نیز می‌تواند قانون را تایید کند", async function () {
      // Kernel is a contract with no call-forwarding mechanism to this
      // contract, so `admin` (a real signer, e.g. the Sovereign) is the
      // path that actually exercises this authority in production.
      await expect(guard.connect(admin).approveLaw(lawHash))
        .to.emit(guard, "LawApproved");

      expect(await guard.isLawApproved(lawHash)).to.be.true;
    });
  });

  // ─────────────────────────────────────────
  // رد قانون
  // ─────────────────────────────────────────

  describe("rejectLaw", function () {
    let lawHash;

    beforeEach(async function () {
      lawHash = ethers.keccak256(ethers.toUtf8Bytes("قانون دین رسمی"));
      await guard.connect(proposer).proposeLaw(lawHash, 0x01); // اصل سکولاریسم
    });

    it("Kernel می‌تواند قانون را با ذکر اصل رد کند", async function () {
      const tx = await guard.connect(kernel).rejectLaw(lawHash, "نقض سکولاریسم ساختاری", 1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(guard, "PrincipleViolationDetected")
        .withArgs(lawHash, 1, block.timestamp);

      expect(await guard.isLawApproved(lawHash)).to.be.false;
    });

    it("کد اصل نامعتبر رد می‌شود", async function () {
      await expect(
        guard.connect(kernel).rejectLaw(lawHash, "test", 9)
      ).to.be.revertedWith("ConstitutionGuard: invalid principle code");
    });

    it("رد برای هشی که پیشنهاد نشده رد می‌شود", async function () {
      const unknownHash = ethers.keccak256(ethers.toUtf8Bytes("قانون پیشنهادنشده - رد"));
      await expect(guard.connect(kernel).rejectLaw(unknownHash, "بدون پیشنهاد", 1))
        .to.be.revertedWith("ConstitutionGuard: proposal not found");
    });

    it("رد قانونی که قبلاً تایید شده رد می‌شود", async function () {
      const approvedHash = ethers.keccak256(ethers.toUtf8Bytes("قانون تایید‌شده - رد بعدی"));
      await guard.connect(proposer).proposeLaw(approvedHash, 0x18); // bits 3+4 = monetary+judicial only
      await guard.connect(kernel).approveLaw(approvedHash);

      await expect(guard.connect(kernel).rejectLaw(approvedHash, "تلاش برای رد پس از تایید", 1))
        .to.be.revertedWith("ConstitutionGuard: already executed");
    });

    it("admin (نماینده امضاکننده واقعی Kernel) نیز می‌تواند قانون را رد کند", async function () {
      const tx = await guard.connect(admin).rejectLaw(lawHash, "نقض سکولاریسم ساختاری", 1);
      await expect(tx).to.emit(guard, "PrincipleViolationDetected");
      expect(await guard.isLawApproved(lawHash)).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // بررسی تعارض با اصول غیرقابل تغییر
  // ─────────────────────────────────────────

  describe("checkImmutableConflict", function () {
    it("ماسکی که اصل ۱ دارد با اصول غیرقابل تغییر تعارض دارد", async function () {
      expect(await guard.checkImmutableConflict(0x01)).to.be.true;
    });

    it("ماسکی که فقط اصل ۴ و ۵ دارد تعارض ندارد", async function () {
      expect(await guard.checkImmutableConflict(0x18)).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // دریافت اطلاعات پیشنهاد (getProposal)
  // ─────────────────────────────────────────

  describe("getProposal", function () {
    it("اطلاعات پیشنهاد ثبت‌شده به‌درستی بازگردانده می‌شود", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون آزادی بیان"));
      const mask = 0x02; // اصل ۲ — حقوق بنیادین

      await guard.connect(proposer).proposeLaw(hash, mask);
      const proposal = await guard.getProposal(hash);

      expect(proposal.hash).to.equal(hash);
      expect(proposal.proposer).to.equal(proposer.address);
      expect(proposal.principlesMask).to.equal(mask);
      expect(proposal.isCompliant).to.be.false;
      expect(proposal.rejectionReason).to.equal("");
      expect(proposal.executed).to.be.false;
    });

    it("هش ثبت‌نشده با خطای «یافت نشد» رد می‌شود", async function () {
      const unknownHash = ethers.keccak256(ethers.toUtf8Bytes("قانون ثبت‌نشده"));
      await expect(guard.getProposal(unknownHash))
        .to.be.revertedWith("ConstitutionGuard: not found");
    });
  });
});
