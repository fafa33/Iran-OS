// SPDX-License-Identifier: MIT
// تست‌های توکن پهلوی (PahlaviToken)
const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("PahlaviToken", function () {
  let token;
  let kernel, swf, user1, user2, stranger;
  const INITIAL_RESERVES = ethers.parseUnits("300000000000", 18); // ۳۰۰ میلیارد دلار

  beforeEach(async function () {
    [kernel, swf, user1, user2, stranger] = await ethers.getSigners();

    // توجه: PahlaviToken.so — کامپایلر آن را از مسیر contracts/monetary/PahlaviToken.so می‌خواند
    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    token = await PahlaviToken.deploy(
      swf.address,
      kernel.address,
      INITIAL_RESERVES
    );
  });

  // ─────────────────────────────────────────
  // استقرار
  // ─────────────────────────────────────────

  describe("استقرار", function () {
    it("مشخصات توکن صحیح است", async function () {
      expect(await token.name()).to.equal("Pahlavi");
      expect(await token.symbol()).to.equal("PAH");
      expect(await token.decimals()).to.equal(18);
    });

    it("سقف نقدینگی صحیح است", async function () {
      expect(await token.MAX_SUPPLY()).to.equal(
        ethers.parseUnits("900000000000", 18)
      );
    });

    it("عرضه اولیه صفر است", async function () {
      expect(await token.totalSupply()).to.equal(0n);
    });

    it("ذخایر اولیه ثبت شده‌اند", async function () {
      expect(await token.totalReserves()).to.equal(INITIAL_RESERVES);
    });

    it("وضعیت اضطراری غیرفعال است", async function () {
      expect(await token.emergencyMode()).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // ضرب (Mint)
  // ─────────────────────────────────────────

  describe("mint", function () {
    it("SWF می‌تواند پهلوی ضرب کند", async function () {
      const amount = ethers.parseUnits("1000", 18);
      await expect(token.connect(swf).mint(user1.address, amount, "پرداخت رفاهی"))
        .to.emit(token, "PahlaviMinted")
        .withArgs(user1.address, amount, amount, "پرداخت رفاهی");

      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("غیر‌SWF نمی‌تواند ضرب کند", async function () {
      await expect(
        token.connect(stranger).mint(user1.address, 1000n, "test")
      ).to.be.reverted;
    });

    it("ضرب بیش از سقف نقدینگی رد می‌شود", async function () {
      const overCap = ethers.parseUnits("900000000001", 18);
      await expect(
        token.connect(swf).mint(user1.address, overCap, "test")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");
    });

    it("ضرب بدون ذخایر کافی رد می‌شود", async function () {
      // ذخایر صفر — هیچ ضربی نباید ممکن باشد
      await token.connect(kernel).updateReserves(0n);
      const amount = ethers.parseUnits("100", 18);
      await expect(
        token.connect(swf).mint(user1.address, amount, "test")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
    });

    it("ضرب بدون دلیل رد می‌شود", async function () {
      await expect(
        token.connect(swf).mint(user1.address, 1000n, "")
      ).to.be.revertedWith("PAH: reason required");
    });
  });

  // ─────────────────────────────────────────
  // سوزاندن (Burn)
  // ─────────────────────────────────────────

  describe("burn", function () {
    beforeEach(async function () {
      await token.connect(swf).mint(user1.address, ethers.parseUnits("10000", 18), "تست");
    });

    it("SWF می‌تواند پهلوی بسوزاند", async function () {
      const burnAmount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(swf).burn(user1.address, burnAmount, "بازپس‌گیری")
      ).to.emit(token, "PahlaviBurned");

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseUnits("9000", 18)
      );
    });

    it("غیر‌BURNER نمی‌تواند بسوزاند", async function () {
      await expect(
        token.connect(stranger).burn(user1.address, 1000n, "test")
      ).to.be.reverted;
    });

    it("سوزاندن بیش از موجودی رد می‌شود", async function () {
      await expect(
        token.connect(swf).burn(user1.address, ethers.parseUnits("99999", 18), "test")
      ).to.be.revertedWith("PAH: insufficient balance");
    });
  });

  // ─────────────────────────────────────────
  // وضعیت اضطراری
  // ─────────────────────────────────────────

  describe("وضعیت اضطراری", function () {
    beforeEach(async function () {
      await token.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "تست");
    });

    it("Kernel می‌تواند وضعیت اضطراری فعال کند", async function () {
      await expect(token.connect(kernel).activateEmergencyMode())
        .to.emit(token, "EmergencyModeActivated");
      expect(await token.emergencyMode()).to.be.true;
    });

    it("انتقال در وضعیت اضطراری مسدود می‌شود", async function () {
      await token.connect(kernel).activateEmergencyMode();
      await expect(
        token.connect(user1).transfer(user2.address, 100n)
      ).to.be.revertedWith("PAH: system in emergency mode");
    });

    it("Kernel می‌تواند وضعیت اضطراری را رفع کند", async function () {
      await token.connect(kernel).activateEmergencyMode();
      await token.connect(kernel).deactivateEmergencyMode();
      expect(await token.emergencyMode()).to.be.false;
      // انتقال باید کار کند
      await expect(
        token.connect(user1).transfer(user2.address, 100n)
      ).not.to.be.reverted;
    });
  });

  // ─────────────────────────────────────────
  // ذخایر و نسبت پشتوانه
  // ─────────────────────────────────────────

  describe("نسبت پشتوانه", function () {
    it("نسبت پشتوانه با عرضه صفر ۱۰۰٪ است", async function () {
      expect(await token.currentReserveRatio()).to.equal(1000n);
    });

    it("Kernel می‌تواند ذخایر را به‌روز کند", async function () {
      const newReserves = ethers.parseUnits("500000000000", 18);
      await expect(token.connect(kernel).updateReserves(newReserves))
        .to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(newReserves);
    });

    it("canMint با ذخایر کافی true برمی‌گرداند", async function () {
      expect(await token.canMint(ethers.parseUnits("100", 18))).to.be.true;
    });

    it("canMint بالای سقف false برمی‌گرداند", async function () {
      expect(await token.canMint(ethers.parseUnits("999999999999", 18))).to.be.false;
    });
  });

  // ─────────────────────────────────────────
  // انتقال ERC-20 استاندارد
  // ─────────────────────────────────────────

  describe("transfer / transferFrom", function () {
    beforeEach(async function () {
      await token.connect(swf).mint(user1.address, ethers.parseUnits("10000", 18), "تست");
    });

    it("transfer معمولی کار می‌کند", async function () {
      const amount = ethers.parseUnits("500", 18);
      await token.connect(user1).transfer(user2.address, amount);
      expect(await token.balanceOf(user2.address)).to.equal(amount);
    });

    it("transferFrom با مجوز کار می‌کند", async function () {
      const amount = ethers.parseUnits("500", 18);
      await token.connect(user1).approve(user2.address, amount);
      await token.connect(user2).transferFrom(user1.address, stranger.address, amount);
      expect(await token.balanceOf(stranger.address)).to.equal(amount);
    });

    it("transferFrom بدون مجوز رد می‌شود", async function () {
      await expect(
        token.connect(user2).transferFrom(user1.address, stranger.address, 100n)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });
});
