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
      const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
      const zeroReserveToken = await PahlaviToken.deploy(swf.address, kernel.address, 0n);
      await zeroReserveToken.waitForDeployment();
      const amount = ethers.parseUnits("100", 18);
      await expect(
        zeroReserveToken.connect(swf).mint(user1.address, amount, "test")
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
      const burnAmount     = ethers.parseUnits("1000", 18);
      const supplyBefore   = await token.totalSupply();
      const reservesBefore = await token.totalReserves();

      await expect(
        token.connect(swf).burn(user1.address, burnAmount, "بازپس‌گیری")
      ).to.emit(token, "PahlaviBurned");

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseUnits("9000", 18)
      );
      expect(await token.totalSupply()).to.equal(supplyBefore - burnAmount);
      expect(await token.totalReserves()).to.equal(reservesBefore);
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

    it("INV-04: emergency mode blocks mint; supply unchanged", async function () {
      const supplyBefore = await token.totalSupply();
      await token.connect(kernel).activateEmergencyMode();
      await expect(
        token.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-04 test")
      ).to.be.revertedWith("PAH: system in emergency mode");
      expect(await token.totalSupply()).to.equal(supplyBefore);
    });
  });

  // ─────────────────────────────────────────
  // ذخایر و نسبت پشتوانه
  // ─────────────────────────────────────────

  describe("نسبت پشتوانه", function () {
    it("نسبت پشتوانه با عرضه صفر ۱۰۰٪ است", async function () {
      expect(await token.currentReserveRatio()).to.equal(1000n);
    });

    it("Kernel legacy reserve updates no longer mutate monetary backing", async function () {
      const newReserves = ethers.parseUnits("500000000000", 18);
      const before = await token.totalReserves();
      await expect(token.connect(kernel).updateReserves(newReserves))
        .to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(before);
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

    it("Step8: unauthorized monetary actions remain state-neutral while SWF mint burn and transfers work", async function () {
      const initialSupply = await token.totalSupply();
      const initialUser1Balance = await token.balanceOf(user1.address);
      const initialUser2Balance = await token.balanceOf(user2.address);
      const mintAmount = ethers.parseUnits("250", 18);
      const burnAmount = ethers.parseUnits("100", 18);
      const transferAmount = ethers.parseUnits("75", 18);

      await expect(
        token.connect(stranger).mint(user2.address, mintAmount, "unauthorized mint")
      ).to.be.reverted;

      await expect(
        token.connect(stranger).burn(user1.address, burnAmount, "unauthorized burn")
      ).to.be.reverted;

      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.balanceOf(user1.address)).to.equal(initialUser1Balance);
      expect(await token.balanceOf(user2.address)).to.equal(initialUser2Balance);

      await expect(
        token.connect(swf).mint(user2.address, mintAmount, "Step8 authorized mint")
      ).to.emit(token, "PahlaviMinted");

      expect(await token.totalSupply()).to.equal(initialSupply + mintAmount);
      expect(await token.balanceOf(user2.address)).to.equal(initialUser2Balance + mintAmount);

      await expect(
        token.connect(swf).burn(user2.address, burnAmount, "Step8 authorized burn")
      ).to.emit(token, "PahlaviBurned");

      expect(await token.totalSupply()).to.equal(initialSupply + mintAmount - burnAmount);
      expect(await token.balanceOf(user2.address)).to.equal(initialUser2Balance + mintAmount - burnAmount);

      await token.connect(user1).transfer(user2.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(initialUser1Balance - transferAmount);
      expect(await token.balanceOf(user2.address)).to.equal(initialUser2Balance + mintAmount - burnAmount + transferAmount);
    });
  });

  describe("DG-03 Integration: SWF deposit to reserve recognition to minting capacity", function () {
    it("authorized reserve-recognition path expands mint capacity and preserves ratio protection", async function () {
      const signers = await ethers.getSigners();
      const [sovereign, kernelSigner, councilMember, minter, recipient] = signers;

      const SWF = await ethers.getContractFactory("SovereignWealthFund");
      const realSwf = await SWF.deploy(sovereign.address, kernelSigner.address);
      await realSwf.waitForDeployment();

      const COUNCIL_ROLE = await realSwf.COUNCIL_ROLE();
      await realSwf.connect(sovereign).grantRole(COUNCIL_ROLE, councilMember.address);

      const PAH = await ethers.getContractFactory("PahlaviToken");
      const pahToken = await PAH.deploy(minter.address, kernelSigner.address, 0n);
      await pahToken.waitForDeployment();

      const reservesBefore = await pahToken.totalReserves();
      expect(reservesBefore).to.equal(0n);
      expect(await pahToken.totalSupply()).to.equal(0n);

      const mintAmount = ethers.parseUnits("100", 18);

      // minting blocked with zero reserves
      await expect(
        pahToken.connect(minter).mint(recipient.address, mintAmount, "pre-recognition attempt")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");

      // SWF deposit: reserve assets enter the sovereign wealth fund via real contract
      const depositAmount = ethers.parseUnits("1000000", 18);
      await realSwf.connect(councilMember).depositToL1(depositAmount, "reserve asset deposit");

      const l1 = await realSwf.layerL1();
      expect(l1.balance).to.equal(depositAmount);
      expect(await realSwf.totalAssets()).to.equal(depositAmount);

      // totalReserves in PahlaviToken is still zero — SWF deposit does NOT auto-sync
      expect(await pahToken.totalReserves()).to.equal(0n);
      await expect(
        pahToken.connect(minter).mint(recipient.address, mintAmount, "post-deposit pre-recognition attempt")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");

      // unauthorized address cannot call updateReserves
      await expect(
        pahToken.connect(councilMember).updateReserves(depositAmount)
      ).to.be.reverted;
      expect(await pahToken.totalReserves()).to.equal(0n);

      // kernel legacy oracle path remains callable but does not recognize backing
      await expect(
        pahToken.connect(kernelSigner).updateReserves(depositAmount)
      ).to.emit(pahToken, "ReservesUpdated");

      const reservesAfter = await pahToken.totalReserves();
      expect(reservesAfter).to.equal(reservesBefore);

      // mint capacity is not available until explicit recognized-backing sync
      expect(await pahToken.canMint(mintAmount)).to.be.false;

      await expect(
        pahToken.connect(minter).mint(recipient.address, mintAmount, "legacy oracle path is not backing")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
      expect(await pahToken.balanceOf(recipient.address)).to.equal(0n);
      expect(await pahToken.totalSupply()).to.equal(0n);

      // reserve ratio protection still enforced with no recognized backing
      const oversizeMint = ethers.parseUnits("4000000", 18);
      await expect(
        pahToken.connect(minter).mint(recipient.address, oversizeMint, "oversize mint attempt")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");

      // supply cap protection still enforced
      await expect(
        pahToken.connect(minter).mint(recipient.address, ethers.parseUnits("900000000001", 18), "cap breach attempt")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");

      // state unchanged after rejected mints
      expect(await pahToken.balanceOf(recipient.address)).to.equal(0n);
      expect(await pahToken.totalSupply()).to.equal(0n);
      expect(await pahToken.totalReserves()).to.equal(reservesAfter);
    });
  });

  describe("INV-05/INV-06 Monetary Expansion Boundary Invariants", function () {
    const MAX_SUPPLY_AMOUNT = ethers.parseUnits("900000000000", 18);

    it("INV-05a: mint leaving reserve ratio exactly 333 succeeds", async function () {
      // reserves=333e18, mintAmount=1000e18 → ratio = floor(333000/1000) = 333 — floor boundary
      const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
      const t = await PahlaviToken.deploy(swf.address, kernel.address, ethers.parseUnits("333", 18));
      await t.waitForDeployment();
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-05a floor")
      ).to.not.be.reverted;
      expect(await t.totalSupply()).to.equal(ethers.parseUnits("1000", 18));
    });

    it("INV-05b: mint leaving reserve ratio 332 reverts; supply unchanged", async function () {
      // reserves=333e18, mintAmount=1001e18 → ratio = floor(333000/1001) = 332 < 333 — one PAH past floor
      const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
      const t = await PahlaviToken.deploy(swf.address, kernel.address, ethers.parseUnits("333", 18));
      await t.waitForDeployment();
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1001", 18), "INV-05b")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
      expect(await t.totalSupply()).to.equal(0n);
      expect(await t.totalReserves()).to.equal(ethers.parseUnits("333", 18));
    });

    it("INV-06a: mint bringing supply to exactly MAX_SUPPLY succeeds", async function () {
      // reserves=300B, supply=0: ratio = floor(300B*1000/900B) = 333 — passes at cap boundary
      await expect(
        token.connect(swf).mint(user1.address, MAX_SUPPLY_AMOUNT, "INV-06a cap")
      ).to.not.be.reverted;
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);
    });

    it("INV-06b: mint exceeding MAX_SUPPLY reverts; supply unchanged", async function () {
      await token.connect(swf).mint(user1.address, MAX_SUPPLY_AMOUNT, "INV-06b setup");
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);
      await expect(
        token.connect(swf).mint(user1.address, 1n, "INV-06b overflow")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);
    });

    it("INV-03: updateReserves does not mint tokens; MAX_SUPPLY gate still blocks after reserves maximised", async function () {
      // updateReserves() alone never changes totalSupply
      const reservesBefore = await token.totalReserves();
      await token.connect(kernel).updateReserves(MAX_SUPPLY_AMOUNT);
      expect(await token.totalReserves()).to.equal(reservesBefore);
      expect(await token.totalSupply()).to.equal(0n);
      // with reserves == MAX_SUPPLY, ratio would be 1000 for any compliant mint,
      // but the cap guard (newSupply <= MAX_SUPPLY) must still block a 1-wei overflow
      await expect(
        token.connect(swf).mint(user1.address, MAX_SUPPLY_AMOUNT + 1n, "INV-03 bypass attempt")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");
      expect(await token.totalSupply()).to.equal(0n);
    });

    it("INV-02: reserve ratio floor enforced across multi-step mint; blocked step leaves supply unchanged", async function () {
      // fresh token: reserves=1000e18 for precise boundary arithmetic
      // max compliant supply = floor(1000*1000/333) = 3003e18 (ratio=333 exactly)
      const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
      const t = await PahlaviToken.deploy(swf.address, kernel.address, ethers.parseUnits("1000", 18));
      await t.waitForDeployment();

      // step 1 — ratio = floor(1000000/1000) = 1000 ≥ 333
      await t.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 s1");
      expect(await t.totalSupply()).to.equal(ethers.parseUnits("1000", 18));

      // step 2 — ratio = floor(1000000/2000) = 500 ≥ 333
      await t.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 s2");
      expect(await t.totalSupply()).to.equal(ethers.parseUnits("2000", 18));

      // step 3 — ratio = floor(1000000/3003) = 333 — exactly at floor boundary
      await t.connect(swf).mint(user1.address, ethers.parseUnits("1003", 18), "INV-02 s3");
      const supplyAtFloor = await t.totalSupply();
      expect(supplyAtFloor).to.equal(ethers.parseUnits("3003", 18));

      // step 4 attempt — ratio = floor(1000000/3004) = 332 < 333 — must revert
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1", 18), "INV-02 s4 blocked")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
      expect(await t.totalSupply()).to.equal(supplyAtFloor);
    });
  });

  // ─────────────────────────────────────────
  // INV-01 Supply Cap Follow-Up (R-1..R-5)
  // پیگیری ممیزی INV-01 — سقف عرضه پهلوی
  // Source: docs/reports/INV01_SUPPLY_CAP_AUDIT.md §13
  // ─────────────────────────────────────────
  describe("INV-01 Supply Cap Follow-Up (R-1..R-5)", function () {
    // reserves=300B in fixture → ratio at 900B supply = floor(300B*1000/900B) = 333,
    // exactly the reserve floor, so a mint to the cap passes the reserve check and the
    // cap boundary can be exercised without engaging reserve-ratio (INV-02) behavior.
    const MAX_SUPPLY_AMOUNT = ethers.parseUnits("900000000000", 18);

    it("R-1: burn frees capacity and remint recycles up to cap; supply never exceeds MAX_SUPPLY", async function () {
      const burnAmount = ethers.parseUnits("1000", 18);

      // mint to exactly MAX_SUPPLY
      await token.connect(swf).mint(user1.address, MAX_SUPPLY_AMOUNT, "R-1 fill");
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);
      expect(await token.remainingMintCapacity()).to.equal(0n);
      expect(await token.canMint(1n)).to.be.false;

      // burn a fixed amount — capacity reopens by exactly that amount
      await token.connect(swf).burn(user1.address, burnAmount, "R-1 retire");
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT - burnAmount);
      expect(await token.remainingMintCapacity()).to.equal(burnAmount);

      // remint the burned amount — succeeds and returns to the cap
      await token.connect(swf).mint(user1.address, burnAmount, "R-1 recycle");
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);

      // 1 wei above the cap reverts; supply unchanged
      await expect(
        token.connect(swf).mint(user1.address, 1n, "R-1 over")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");

      // standing supply never exceeded the cap despite cumulative issuance > cap
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);
    });

    it("R-2: cap is global across multiple minters — aggregate cannot exceed MAX_SUPPLY", async function () {
      const k = ethers.parseUnits("5000", 18);

      // kernel (DEFAULT_ADMIN_ROLE) grants a second minter — audit finding F-1
      await token.connect(kernel).grantRole(await token.MINTER_ROLE(), user2.address);
      expect(await token.hasRole(await token.MINTER_ROLE(), user2.address)).to.be.true;

      // two distinct minters mint interleaved, summing exactly to the cap
      await token.connect(swf).mint(user1.address, MAX_SUPPLY_AMOUNT - k, "R-2 m1");
      await token.connect(user2).mint(user2.address, k, "R-2 m2");
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);

      // neither minter can push past the global cap, regardless of which one tries
      await expect(
        token.connect(user2).mint(user2.address, 1n, "R-2 m2 over")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");
      await expect(
        token.connect(swf).mint(user1.address, 1n, "R-2 m1 over")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");

      // aggregate supply remains exactly at the cap
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_AMOUNT);
    });

    it("R-3: emergency mode halts minting regardless of available capacity; cap state unchanged", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);

      await token.connect(kernel).activateEmergencyMode();
      expect(await token.emergencyMode()).to.be.true;

      // mint is blocked by the emergency guard (which precedes the cap check)
      await expect(
        token.connect(swf).mint(user1.address, mintAmount, "R-3 blocked")
      ).to.be.revertedWith("PAH: system in emergency mode");

      // supply and remaining capacity untouched
      expect(await token.totalSupply()).to.equal(0n);
      expect(await token.remainingMintCapacity()).to.equal(MAX_SUPPLY_AMOUNT);

      // positive control: after deactivation, the same mint succeeds
      await token.connect(kernel).deactivateEmergencyMode();
      expect(await token.emergencyMode()).to.be.false;
      await expect(
        token.connect(swf).mint(user1.address, mintAmount, "R-3 resumed")
      ).to.not.be.reverted;
      expect(await token.totalSupply()).to.equal(mintAmount);
    });

    it("R-4: PahlaviToken.MAX_SUPPLY equals Kernel.LIQUIDITY_CAP and both equal 900B PAH", async function () {
      // deploy the Kernel locally — constructor is (sovereign, court, oracle, swf)
      const Kernel = await ethers.getContractFactory("IranOS_Kernel");
      const k = await Kernel.deploy(
        kernel.address,   // sovereign
        user1.address,    // court
        user2.address,    // oracle
        swf.address       // swf
      );
      await k.waitForDeployment();

      const tokenCap = await token.MAX_SUPPLY();
      const kernelCap = await k.LIQUIDITY_CAP();

      expect(tokenCap).to.equal(kernelCap);
      expect(tokenCap).to.equal(MAX_SUPPLY_AMOUNT);
      expect(kernelCap).to.equal(MAX_SUPPLY_AMOUNT);
    });

    it("R-5: view functions agree with the cap gate across a mint/burn/remint sequence", async function () {
      // helper: remainingMintCapacity must always equal MAX_SUPPLY - totalSupply
      const assertCapacityConsistent = async () => {
        const supply = await token.totalSupply();
        expect(await token.remainingMintCapacity()).to.equal(MAX_SUPPLY_AMOUNT - supply);
      };

      const A = ethers.parseUnits("100000000000", 18); // 100B
      const B = ethers.parseUnits("100000000000", 18); // 100B
      const C = ethers.parseUnits("50000000000", 18);  //  50B (burn)
      const D = ethers.parseUnits("100000000000", 18); // 100B

      await assertCapacityConsistent();

      // step A
      expect(await token.canMint(A)).to.be.true;
      await token.connect(swf).mint(user1.address, A, "R-5 A");
      await assertCapacityConsistent();

      // step B
      expect(await token.canMint(B)).to.be.true;
      await token.connect(swf).mint(user1.address, B, "R-5 B");
      await assertCapacityConsistent();

      // burn C — capacity should grow back
      await token.connect(swf).burn(user1.address, C, "R-5 burn C");
      await assertCapacityConsistent();

      // step D
      expect(await token.canMint(D)).to.be.true;
      await token.connect(swf).mint(user1.address, D, "R-5 D");
      await assertCapacityConsistent();

      // over-cap boundary: canMint(false) AND the mint reverts with the cap string
      const overCap = MAX_SUPPLY_AMOUNT; // current supply is 250B; +900B exceeds cap
      expect(await token.canMint(overCap)).to.be.false;
      await expect(
        token.connect(swf).mint(user1.address, overCap, "R-5 over")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");

      // view/state still consistent after the rejected mint
      await assertCapacityConsistent();
    });
  });

  // ─────────────────────────────────────────
  // INV-02 Reserve Ratio Floor Follow-Up (R-1..R-8)
  // پیگیری ممیزی INV-02 — کف نسبت پشتوانه
  // Source: docs/reports/INV02_RESERVE_RATIO_FLOOR_AUDIT.md §14 (v1.1.1)
  //
  // These tests CHARACTERIZE current behavior only. They do not assert that
  // any behavior is correct or defective, do not implement remediation, do
  // not patch updateReserves, and do not add a reserve-floor guard. R-3 and
  // R-8 in particular document reachable states (CF-1 sub-floor, CF-7 overflow)
  // whose remediation doctrine leaves open — see the audit report.
  // ─────────────────────────────────────────
  describe("INV-02 Reserve Ratio Floor Follow-Up (R-1..R-8)", function () {
    const PahlaviTokenFactory = async () => ethers.getContractFactory("PahlaviToken");

    // ── R-1: mint-time floor boundary (§7.1) ──
    it("INV-02 R-1a: mint leaving post-mint ratio exactly 333 succeeds", async function () {
      // reserves=333e18, mint 1000e18 → ratio = floor(333000/1000) = 333 (== floor)
      const F = await PahlaviTokenFactory();
      const t = await F.deploy(swf.address, kernel.address, ethers.parseUnits("333", 18));
      await t.waitForDeployment();
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 R-1a")
      ).to.not.be.reverted;
      expect(await t.totalSupply()).to.equal(ethers.parseUnits("1000", 18));
    });

    it("INV-02 R-1b: mint leaving post-mint ratio 332 reverts; supply unchanged", async function () {
      // reserves=333e18, mint 1001e18 → ratio = floor(333000/1001) = 332 < 333
      const F = await PahlaviTokenFactory();
      const t = await F.deploy(swf.address, kernel.address, ethers.parseUnits("333", 18));
      await t.waitForDeployment();
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1001", 18), "INV-02 R-1b")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
      expect(await t.totalSupply()).to.equal(0n);
    });

    // ── R-2: updateReserves authority (§5) ──
    it("INV-02 R-2: updateReserves authorization is role-based (KERNEL_ROLE), not address-based", async function () {
      const before = await token.totalReserves(); // INITIAL_RESERVES (300B)
      const attempt = before + ethers.parseUnits("1", 18);

      // signers WITHOUT KERNEL_ROLE cannot update reserves
      for (const signer of [swf, stranger, user2]) {
        expect(await token.hasRole(await token.KERNEL_ROLE(), signer.address)).to.be.false;
        await expect(
          token.connect(signer).updateReserves(attempt)
        ).to.be.revertedWith("PAH: caller is not the Kernel");
      }
      expect(await token.totalReserves()).to.equal(before);

      // the constructor-configured kernel holder can call the compatibility path,
      // but oracle-style updates no longer mutate monetary reserve accounting.
      await expect(token.connect(kernel).updateReserves(attempt))
        .to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(before);

      // role-based (not address-based) check: grant KERNEL_ROLE to a SECOND signer
      // (kernel holds DEFAULT_ADMIN_ROLE) and verify that signer can now update
      // reserves. A regression hard-coding `msg.sender == kernel` would fail here.
      await token.connect(kernel).grantRole(await token.KERNEL_ROLE(), user2.address);
      expect(await token.hasRole(await token.KERNEL_ROLE(), user2.address)).to.be.true;

      const secondUpdate = attempt + ethers.parseUnits("1", 18);
      await expect(token.connect(user2).updateReserves(secondUpdate))
        .to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(before);
    });

    // ── R-3: CF-1 characterization (§7.2, §10) ──
    it("INV-02 R-3: legacy updateReserves cannot drive reserves into a sub-floor state", async function () {
      await token.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 R-3 mint");
      const supplyAfterMint = await token.totalSupply();
      const reservesBefore = await token.totalReserves();
      const ratioBefore = await token.currentReserveRatio();

      // updateReserves(0) succeeds for compatibility but does not alter monetary backing.
      await expect(token.connect(kernel).updateReserves(0n)).to.not.be.reverted;

      expect(await token.totalReserves()).to.equal(reservesBefore);
      expect(await token.currentReserveRatio()).to.equal(ratioBefore);
      expect(await token.canMint(ethers.parseUnits("1", 18))).to.be.true;

      // the mint-time gate still blocks actual over-expansion.
      await expect(
        token.connect(swf).mint(user1.address, ethers.parseUnits("999999999999", 18), "INV-02 R-3 blocked")
      ).to.be.revertedWith("PAH: exceeds liquidity cap");

      expect(await token.totalSupply()).to.equal(supplyAfterMint);
      expect(await token.totalReserves()).to.equal(reservesBefore);
    });

    // ── R-4: burn raises ratio; burn never floor-blocked (§7.3) ──
    it("INV-02 R-4: burn lowers supply and raises the ratio, including from a sub-floor state", async function () {
      const F = await PahlaviTokenFactory();
      const t = await F.deploy(swf.address, kernel.address, ethers.parseUnits("1000", 18));
      await t.waitForDeployment();

      // mint 2000e18 → ratio = floor(1000*1000/2000) = 500
      await t.connect(swf).mint(user1.address, ethers.parseUnits("2000", 18), "INV-02 R-4 mint");
      expect(await t.currentReserveRatio()).to.equal(500n);

      // burn 500e18 → supply 1500e18 → ratio = floor(1000000/1500) = 666 (strictly increased)
      await t.connect(swf).burn(user1.address, ethers.parseUnits("500", 18), "INV-02 R-4 burn");
      expect(await t.totalSupply()).to.equal(ethers.parseUnits("1500", 18));
      expect(await t.currentReserveRatio()).to.equal(666n);
      expect(666n).to.be.greaterThan(500n);

      // legacy updateReserves cannot drive into a sub-floor state; burn still succeeds.
      await t.connect(kernel).updateReserves(ethers.parseUnits("100", 18));
      const ratioBeforeBurn = await t.currentReserveRatio();
      expect(ratioBeforeBurn).to.equal(666n);
      await expect(
        t.connect(swf).burn(user1.address, ethers.parseUnits("1400", 18), "INV-02 R-4 burn subfloor")
      ).to.not.be.reverted;
      expect(await t.totalSupply()).to.equal(ethers.parseUnits("100", 18));
      expect(await t.currentReserveRatio()).to.be.greaterThan(ratioBeforeBurn);
    });

    // ── R-5: emergency interaction (§7.4) ──
    it("INV-02 R-5: updateReserves works during emergency while mint is halted; ratio math consistent", async function () {
      await token.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 R-5 mint");

      await token.connect(kernel).activateEmergencyMode();
      expect(await token.emergencyMode()).to.be.true;

      // updateReserves carries no notInEmergency guard, but no longer mutates backing.
      const newReserves = ethers.parseUnits("600000000000", 18);
      const reservesBefore = await token.totalReserves();
      await expect(token.connect(kernel).updateReserves(newReserves))
        .to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(reservesBefore);

      // mint is halted by the emergency guard
      await expect(
        token.connect(swf).mint(user1.address, ethers.parseUnits("1", 18), "INV-02 R-5 blocked")
      ).to.be.revertedWith("PAH: system in emergency mode");

      // ratio view stays consistent with stored reserves/supply
      const supply = await token.totalSupply();
      expect(await token.currentReserveRatio()).to.equal((reservesBefore * 1000n) / supply);
    });

    // ── R-6: view/gate agreement (§6) ──
    it("INV-02 R-6: currentReserveRatio / canMint / mint outcomes agree at the 333/332 boundary", async function () {
      const F = await PahlaviTokenFactory();

      // supply == 0 → ratio view returns 1000
      const t = await F.deploy(swf.address, kernel.address, ethers.parseUnits("333", 18));
      await t.waitForDeployment();
      expect(await t.currentReserveRatio()).to.equal(1000n);

      // canMint agrees with the gate on both sides of the boundary
      expect(await t.canMint(ethers.parseUnits("1000", 18))).to.be.true;  // ratio 333
      expect(await t.canMint(ethers.parseUnits("1001", 18))).to.be.false; // ratio 332

      // actual mint at the 333 side succeeds (matches canMint == true)
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 R-6 pass")
      ).to.not.be.reverted;
      expect(await t.currentReserveRatio()).to.equal(333n);

      // actual mint at the 332 side reverts (matches canMint == false), on a fresh instance
      const t2 = await F.deploy(swf.address, kernel.address, ethers.parseUnits("333", 18));
      await t2.waitForDeployment();
      expect(await t2.canMint(ethers.parseUnits("1001", 18))).to.be.false;
      await expect(
        t2.connect(swf).mint(user1.address, ethers.parseUnits("1001", 18), "INV-02 R-6 fail")
      ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
    });

    // ── R-7: cross-contract constant equality (§2) ──
    it("INV-02 R-7: PahlaviToken.MIN_RESERVE_RATIO equals Kernel.MIN_RESERVE_RATIO equals 333", async function () {
      const Kernel = await ethers.getContractFactory("IranOS_Kernel");
      const k = await Kernel.deploy(
        kernel.address, // sovereign
        user1.address,  // court
        user2.address,  // oracle
        swf.address     // swf
      );
      await k.waitForDeployment();

      const tokenRatio = await token.MIN_RESERVE_RATIO();
      const kernelRatio = await k.MIN_RESERVE_RATIO();
      expect(tokenRatio).to.equal(333n);
      expect(kernelRatio).to.equal(333n);
      expect(tokenRatio).to.equal(kernelRatio);
    });

    // ── R-8: CF-7 overflow precision (§6) ──
    // Uses revertedWithPanic(0x11) (ARITHMETIC_OVERFLOW) from hardhat-chai-matchers.
    const MAX_UINT256 = ethers.MaxUint256;

    it("INV-02 R-8a: updateReserves(MaxUint256) with supply > 0 is non-mutating", async function () {
      await token.connect(swf).mint(user1.address, ethers.parseUnits("1000", 18), "INV-02 R-8a mint");
      const before = await token.totalReserves();
      await expect(
        token.connect(kernel).updateReserves(MAX_UINT256)
      ).to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(before);
    });

    it("INV-02 R-8b: updateReserves(MaxUint256) at supply == 0 is non-mutating", async function () {
      const F = await PahlaviTokenFactory();
      const t = await F.deploy(swf.address, kernel.address, ethers.parseUnits("300000000000", 18));
      await t.waitForDeployment();
      const before = await t.totalReserves();

      await expect(t.connect(kernel).updateReserves(MAX_UINT256)).to.not.be.reverted;
      expect(await t.totalReserves()).to.equal(before);

      // currentReserveRatio() returns 1000 early while supply == 0 (no multiply)
      expect(await t.currentReserveRatio()).to.equal(1000n);
      await expect(
        t.connect(swf).mint(user1.address, ethers.parseUnits("1", 18), "INV-02 R-8b recover")
      ).to.not.be.reverted;
    });

    it("INV-02 R-8c: constructor with oversized _initialReserves succeeds, then mint/canMint overflow at genesis", async function () {
      // The constructor accepts an unbounded _initialReserves with no upper-bound check.
      // Under production Kernel wiring there is no updateReserves call path, so a
      // genesis deployment in this state is NOT recoverable in-place — redeploy required.
      const F = await PahlaviTokenFactory();
      const tc = await F.deploy(swf.address, kernel.address, MAX_UINT256);
      await tc.waitForDeployment();
      expect(await tc.totalSupply()).to.equal(0n);
      expect(await tc.totalReserves()).to.equal(MAX_UINT256);

      await expect(
        tc.connect(swf).mint(user1.address, ethers.parseUnits("1", 18), "INV-02 R-8c mint")
      ).to.be.revertedWithPanic(0x11);
      await expect(tc.canMint(ethers.parseUnits("1", 18))).to.be.revertedWithPanic(0x11);
    });
  });

  // ─────────────────────────────────────────
  // CF-1 Option C — Reserve Breach Detection Boundary
  // مسیر اوراکل دیگر ذخایر پولی را تغییر نمی‌دهد؛ ردیابی نقض فقط از مسیر پشتوانه شناخته‌شده فعال می‌شود.
  // Source: docs/reports/CF1_BREACH_DETECTION_DISPOSITION.md
  //
  // Tests A–C verify that legacy updateReserves is not a monetary backing path.
  //
  // No revert, no TriggerProtocol, no Kernel call — Option C only.
  // ─────────────────────────────────────────
  describe("CF-1 Option C — Reserve Breach Detection", function () {

    it("CF-1 A: compliant updateReserves emits no breach event and leaves reserveFloorBreached false", async function () {
      // supply == 0: ratio branch short-circuits to 1000; no breach possible
      await expect(
        token.connect(kernel).updateReserves(INITIAL_RESERVES)
      ).to.not.emit(token, "ReserveFloorBreached");
      expect(await token.reserveFloorBreached()).to.be.false;

      // supply > 0, ratio stays above floor: still no breach event
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "CF-1 A mint");
      // reserves = INITIAL_RESERVES (300B e18), supply = 1000e18 → ratio >> 333
      const complyingReserves = INITIAL_RESERVES; // ratio = 300B, well above floor
      await expect(
        token.connect(kernel).updateReserves(complyingReserves)
      ).to.not.emit(token, "ReserveFloorBreached");
      expect(await token.reserveFloorBreached()).to.be.false;
      // ReservesUpdated is still emitted (existing behavior preserved)
      await expect(
        token.connect(kernel).updateReserves(complyingReserves)
      ).to.emit(token, "ReservesUpdated");
    });

    it("CF-1 B: non-compliant legacy updateReserves does not set breach state or update reserves", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "CF-1 B mint");

      const oldReserves = await token.totalReserves();
      const subFloorReserves = 0n;               // post-update ratio = 0 < 333

      await expect(token.connect(kernel).updateReserves(subFloorReserves))
        .to.not.emit(token, "ReserveFloorBreached");

      expect(await token.reserveFloorBreached()).to.be.false;
      expect(await token.totalReserves()).to.equal(oldReserves);
    });

    it("CF-1 C: legacy updateReserves cannot create or restore breach state", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "CF-1 C mint");

      const restoredReserves = ethers.parseUnits("334", 18);
      const oldReserves = await token.totalReserves();

      await expect(token.connect(kernel).updateReserves(restoredReserves))
        .to.not.emit(token, "ReserveFloorRestored");

      expect(await token.reserveFloorBreached()).to.be.false;
      expect(await token.totalReserves()).to.equal(oldReserves);
      expect(await token.currentReserveRatio()).to.be.gte(333n);
      expect(await token.canMint(ethers.parseUnits("1", 18))).to.be.true;
    });

    it("CF-1 D: burn-based supply contraction has no stale oracle breach state to clear", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "CF-1 D mint");
      const subFloorReserves = ethers.parseUnits("100", 18);
      await token.connect(kernel).updateReserves(subFloorReserves);
      expect(await token.reserveFloorBreached()).to.be.false;

      const burnAmt = ethers.parseUnits("700", 18);

      await expect(token.connect(swf).burn(user1.address, burnAmt, "CF-1 D burn"))
        .to.not.emit(token, "ReserveFloorRestored");

      expect(await token.reserveFloorBreached()).to.be.false;
      expect(await token.currentReserveRatio()).to.be.gte(333n);
    });

    it("CF-1 E: burn after ignored legacy reserve update leaves breach state false", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "CF-1 E mint");
      await token.connect(kernel).updateReserves(0n);
      expect(await token.reserveFloorBreached()).to.be.false;

      const burnAmt = ethers.parseUnits("1", 18);
      await expect(token.connect(swf).burn(user1.address, burnAmt, "CF-1 E burn"))
        .to.not.emit(token, "ReserveFloorRestored");

      expect(await token.reserveFloorBreached()).to.be.false;
      expect(await token.currentReserveRatio()).to.be.gte(333n);
    });
  });
});
