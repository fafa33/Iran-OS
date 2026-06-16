// SPDX-License-Identifier: MIT
// GAP-MEX-05 — Kernel→PahlaviToken Reserve Sync Path
// تست‌های مسیر همگام‌سازی ذخایر: Kernel.syncReserves → PahlaviToken.updateReserves
//
// syncReserves is data-forwarding only. Tests verify:
//   (a) only ORACLE_ROLE can call
//   (b) value is forwarded to PahlaviToken.updateReserves
//   (c) Kernel emits ReserveSynced; PahlaviToken emits ReservesUpdated
//   (d) breach/restoration events originate from PahlaviToken, not Kernel
//   (e) no TriggerProtocol call, no mint/burn, no freeze side effects
//   (f) callable during emergency lock (notLocked exempt by design)
//   (g) edge cases: zero, same-value, repeated, increase, decrease
//
// Open items after this test block:
//   CF-7: overflow/max reserve behavior — deferred, characterized only
//   GAP-MEX-06: monitoring specification — open, no code required

const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("GAP-MEX-05 — Kernel.syncReserves", function () {
  let kernel, token, triggerProtocol;
  let sovereign, court, oracle, swf, user1, stranger;

  const INITIAL_RESERVES = ethers.parseUnits("300000000000", 18); // 300B USD

  beforeEach(async function () {
    [sovereign, court, oracle, swf, user1, stranger] = await ethers.getSigners();

    // Deploy Kernel
    const Kernel = await ethers.getContractFactory("IranOS_Kernel");
    kernel = await Kernel.deploy(
      sovereign.address,
      court.address,
      oracle.address,
      swf.address
    );

    // Deploy Treasury (required by TriggerProtocol)
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(sovereign.address);
    await treasury.waitForDeployment();

    // Deploy TriggerProtocol for side-effect isolation tests
    const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
    triggerProtocol = await TriggerProtocol.deploy(
      await kernel.getAddress(),
      await treasury.getAddress(),
      swf.address
    );
    await triggerProtocol.waitForDeployment();

    // Grant KERNEL_ROLE to TriggerProtocol on Treasury
    await treasury.connect(sovereign).grantRole(
      await treasury.KERNEL_ROLE(),
      await triggerProtocol.getAddress()
    );

    // Wire TriggerProtocol into Kernel
    await kernel.connect(sovereign).setTriggerProtocol(await triggerProtocol.getAddress());

    // Deploy PahlaviToken with Kernel contract as the kernel authority
    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    token = await PahlaviToken.deploy(
      swf.address,
      await kernel.getAddress(),
      INITIAL_RESERVES
    );
    await token.waitForDeployment();

    // Wire PahlaviToken into Kernel
    await kernel.connect(sovereign).setPahlaviToken(await token.getAddress());
  });

  // ─────────────────────────────────────────
  // Role enforcement
  // ─────────────────────────────────────────

  describe("role enforcement", function () {
    it("T01: ORACLE_ROLE can call syncReserves", async function () {
      const newReserves = ethers.parseUnits("100000000000", 18);
      await expect(kernel.connect(oracle).syncReserves(newReserves))
        .to.emit(kernel, "ReserveSynced")
        .withArgs(oracle.address, newReserves, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
      expect(await token.totalReserves()).to.equal(newReserves);
    });

    it("T02: non-oracle caller cannot call syncReserves", async function () {
      const newReserves = ethers.parseUnits("100000000000", 18);
      await expect(
        kernel.connect(stranger).syncReserves(newReserves)
      ).to.be.revertedWith("Kernel: caller is not an Oracle");
      expect(await token.totalReserves()).to.equal(INITIAL_RESERVES);
    });

    it("T02b: sovereign cannot call syncReserves (no ORACLE_ROLE)", async function () {
      await expect(
        kernel.connect(sovereign).syncReserves(ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Kernel: caller is not an Oracle");
    });
  });

  // ─────────────────────────────────────────
  // Reserve propagation
  // ─────────────────────────────────────────

  describe("reserve propagation", function () {
    it("T03: syncReserves forwards value to PahlaviToken.updateReserves", async function () {
      const newReserves = ethers.parseUnits("150000000000", 18);
      await kernel.connect(oracle).syncReserves(newReserves);
      expect(await token.totalReserves()).to.equal(newReserves);
    });

    it("T04: totalReserves updates after sync", async function () {
      const R0 = await token.totalReserves();
      const R1 = ethers.parseUnits("200000000000", 18);
      expect(R1).to.not.equal(R0);
      await kernel.connect(oracle).syncReserves(R1);
      expect(await token.totalReserves()).to.equal(R1);
    });

    it("T05: Kernel emits ReserveSynced", async function () {
      const newReserves = ethers.parseUnits("50000000000", 18);
      await expect(kernel.connect(oracle).syncReserves(newReserves))
        .to.emit(kernel, "ReserveSynced");
    });

    it("T06: PahlaviToken emits ReservesUpdated", async function () {
      const newReserves = ethers.parseUnits("50000000000", 18);
      await expect(kernel.connect(oracle).syncReserves(newReserves))
        .to.emit(token, "ReservesUpdated");
    });
  });

  // ─────────────────────────────────────────
  // Breach and restoration via syncReserves
  // ─────────────────────────────────────────

  describe("breach and restoration events originate from PahlaviToken", function () {
    it("T07: reserve decrease through sync can set reserveFloorBreached in PahlaviToken", async function () {
      // Mint supply so ratio is meaningful
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T07 mint");

      // Push sub-floor reserves: ratio = (100 * 1e18 * 1000) / (1000 * 1e18) = 100 < 333
      const subFloor = ethers.parseUnits("100", 18);
      await expect(kernel.connect(oracle).syncReserves(subFloor))
        .to.emit(token, "ReserveFloorBreached");

      expect(await token.reserveFloorBreached()).to.be.true;
      // Kernel must NOT emit ReserveFloorBreached
    });

    it("T07b: ReserveFloorBreached is emitted by PahlaviToken, not Kernel", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T07b mint");
      const subFloor = ethers.parseUnits("100", 18);

      const tx = await kernel.connect(oracle).syncReserves(subFloor);
      const receipt = await tx.wait();

      // Find ReserveFloorBreached events in the receipt
      const tokenAddress = await token.getAddress();
      const breachEvents = receipt.logs.filter(
        log => log.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      expect(breachEvents.length).to.be.gt(0);

      // Kernel address must NOT appear as emitter of ReserveFloorBreached
      const kernelAddress = await kernel.getAddress();
      const kernelBreachEvents = receipt.logs.filter(
        log => log.address.toLowerCase() === kernelAddress.toLowerCase() &&
               log.topics[0] === ethers.id("ReserveFloorBreached(uint256,uint256,uint256,uint256)")
      );
      expect(kernelBreachEvents.length).to.equal(0);
    });

    it("T08: reserve increase through sync can clear reserveFloorBreached in PahlaviToken", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T08 mint");

      // Set breach state
      await kernel.connect(oracle).syncReserves(ethers.parseUnits("100", 18));
      expect(await token.reserveFloorBreached()).to.be.true;

      // Restore: ratio = (400 * 1e18 * 1000) / (1000 * 1e18) = 400 >= 333
      const compliant = ethers.parseUnits("400", 18);
      await expect(kernel.connect(oracle).syncReserves(compliant))
        .to.emit(token, "ReserveFloorRestored");

      expect(await token.reserveFloorBreached()).to.be.false;
    });

    it("T08b: ReserveFloorRestored is emitted by PahlaviToken, not Kernel", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T08b mint");
      await kernel.connect(oracle).syncReserves(ethers.parseUnits("100", 18));

      const compliant = ethers.parseUnits("400", 18);
      const tx = await kernel.connect(oracle).syncReserves(compliant);
      const receipt = await tx.wait();

      const tokenAddress = await token.getAddress();
      const restoredEvents = receipt.logs.filter(
        log => log.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      expect(restoredEvents.length).to.be.gt(0);

      const kernelAddress = await kernel.getAddress();
      const kernelRestoredEvents = receipt.logs.filter(
        log => log.address.toLowerCase() === kernelAddress.toLowerCase() &&
               log.topics[0] === ethers.id("ReserveFloorRestored(uint256,uint256,uint256)")
      );
      expect(kernelRestoredEvents.length).to.equal(0);
    });
  });

  // ─────────────────────────────────────────
  // Emergency gate — notLocked exempt by design
  // ─────────────────────────────────────────

  describe("emergency gate", function () {
    it("T09: syncReserves callable during Kernel emergency lock (notLocked exempt)", async function () {
      // Activate Kernel emergency lock via TR-01
      await kernel.connect(oracle).flagViolation(1, stranger.address, "test emergency");
      expect(await kernel.emergencyLockActive()).to.be.true;

      // syncReserves must still succeed — no notLocked() gate
      const newReserves = ethers.parseUnits("50000000000", 18);
      await expect(kernel.connect(oracle).syncReserves(newReserves))
        .to.emit(kernel, "ReserveSynced");

      expect(await token.totalReserves()).to.equal(newReserves);
    });
  });

  // ─────────────────────────────────────────
  // Side-effect isolation — data-forwarding only
  // ─────────────────────────────────────────

  describe("side-effect isolation", function () {
    it("T10: syncReserves does not call TriggerProtocol", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T10 mint");

      const execBefore = await triggerProtocol.executionCount();
      // Sub-floor value — would cause breach in PahlaviToken but must NOT route to TriggerProtocol
      await kernel.connect(oracle).syncReserves(ethers.parseUnits("100", 18));
      const execAfter = await triggerProtocol.executionCount();

      expect(execAfter).to.equal(execBefore);
    });

    it("T10b: syncReserves does not emit TriggerActivated", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T10b mint");

      await expect(kernel.connect(oracle).syncReserves(ethers.parseUnits("100", 18)))
        .to.not.emit(kernel, "TriggerActivated");
    });

    it("T11: syncReserves does not mint or burn tokens", async function () {
      const supplyBefore = await token.totalSupply();
      await kernel.connect(oracle).syncReserves(ethers.parseUnits("50000000000", 18));
      expect(await token.totalSupply()).to.equal(supplyBefore);
    });

    it("T12: syncReserves does not alter Kernel enforcement state", async function () {
      const lockBefore         = await kernel.emergencyLockActive();
      const trigCountBefore    = await kernel.triggerActivationCount();
      const violationsBefore   = await kernel.violationCount();

      await kernel.connect(oracle).syncReserves(ethers.parseUnits("50000000000", 18));

      expect(await kernel.emergencyLockActive()).to.equal(lockBefore);
      expect(await kernel.triggerActivationCount()).to.equal(trigCountBefore);
      expect(await kernel.violationCount()).to.equal(violationsBefore);
    });

    it("T12b: syncReserves does not emit ViolationFlagged", async function () {
      await expect(
        kernel.connect(oracle).syncReserves(ethers.parseUnits("50000000000", 18))
      ).to.not.emit(kernel, "ViolationFlagged");
    });
  });

  // ─────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────

  describe("edge cases", function () {
    it("T13: repeated sync with different values works correctly", async function () {
      const R1 = ethers.parseUnits("100000000000", 18);
      const R2 = ethers.parseUnits("200000000000", 18);
      await kernel.connect(oracle).syncReserves(R1);
      expect(await token.totalReserves()).to.equal(R1);
      await kernel.connect(oracle).syncReserves(R2);
      expect(await token.totalReserves()).to.equal(R2);
    });

    it("T14: same-value sync is accepted (no short-circuit)", async function () {
      const R = ethers.parseUnits("150000000000", 18);
      await kernel.connect(oracle).syncReserves(R);
      // Second call with same value must still propagate
      await expect(kernel.connect(oracle).syncReserves(R))
        .to.emit(kernel, "ReserveSynced")
        .and.to.emit(token, "ReservesUpdated");
      expect(await token.totalReserves()).to.equal(R);
    });

    it("T15: zero reserve is accepted and sets breach when supply > 0", async function () {
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T15 mint");

      // Zero reserve: ratio = 0 < MIN_RESERVE_RATIO
      await expect(kernel.connect(oracle).syncReserves(0n))
        .to.emit(token, "ReserveFloorBreached");

      expect(await token.totalReserves()).to.equal(0n);
      expect(await token.reserveFloorBreached()).to.be.true;
    });

    it("T15b: zero reserve with zero supply does not breach (supply == 0 branch returns 1000)", async function () {
      expect(await token.totalSupply()).to.equal(0n);
      // No supply → ratio branch returns 1000, no breach
      await expect(kernel.connect(oracle).syncReserves(0n))
        .to.not.emit(token, "ReserveFloorBreached");
      expect(await token.reserveFloorBreached()).to.be.false;
      expect(await token.totalReserves()).to.equal(0n);
    });

    it("T16 (CF-7 deferred): syncReserves with type(uint256).max reverts when supply > 0 due to overflow in PahlaviToken", async function () {
      // Overflow guard lives in PahlaviToken.updateReserves ratio computation,
      // not in Kernel.syncReserves. Kernel is a pure forwarding surface.
      // This test characterizes CF-7 behavior; no guard exists in Kernel by design.
      const mintAmt = ethers.parseUnits("1000", 18);
      await token.connect(swf).mint(user1.address, mintAmt, "T16 mint");

      // type(uint256).max * 1000 overflows in PahlaviToken.updateReserves ratio calc
      await expect(
        kernel.connect(oracle).syncReserves(ethers.MaxUint256)
      ).to.be.reverted; // arithmetic overflow in PahlaviToken

      // totalReserves must remain unchanged (revert rolled back)
      expect(await token.totalReserves()).to.equal(INITIAL_RESERVES);
    });

    it("T16b (CF-7 deferred): syncReserves with type(uint256).max when supply == 0 is accepted", async function () {
      // With zero supply, PahlaviToken.updateReserves takes the else branch (ratio = 1000).
      // No overflow. Kernel has no guard. This is the CF-7 open risk scenario.
      // A corrective syncReserves call with a valid value restores the state.
      expect(await token.totalSupply()).to.equal(0n);
      await kernel.connect(oracle).syncReserves(ethers.MaxUint256);
      expect(await token.totalReserves()).to.equal(ethers.MaxUint256);
      // Self-correct:
      await kernel.connect(oracle).syncReserves(INITIAL_RESERVES);
      expect(await token.totalReserves()).to.equal(INITIAL_RESERVES);
    });
  });

  // ─────────────────────────────────────────
  // setPahlaviToken setter
  // ─────────────────────────────────────────

  describe("setPahlaviToken", function () {
    it("Sovereign can set pahlaviToken and emits KernelContractUpdated", async function () {
      const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
      const token2 = await PahlaviToken.deploy(swf.address, await kernel.getAddress(), INITIAL_RESERVES);
      await token2.waitForDeployment();
      const newAddr = await token2.getAddress();

      await expect(kernel.connect(sovereign).setPahlaviToken(newAddr))
        .to.emit(kernel, "KernelContractUpdated")
        .withArgs("PahlaviToken", await token.getAddress(), newAddr);

      expect(await kernel.pahlaviToken()).to.equal(newAddr);
    });

    it("Non-sovereign cannot set pahlaviToken", async function () {
      await expect(
        kernel.connect(stranger).setPahlaviToken(await token.getAddress())
      ).to.be.revertedWith("Kernel: caller is not the Sovereign");
    });

    it("setPahlaviToken(address(0)) reverts", async function () {
      await expect(
        kernel.connect(sovereign).setPahlaviToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Kernel: invalid address");
    });

    it("syncReserves reverts when pahlaviToken is zero address", async function () {
      // Deploy a fresh kernel without wiring pahlaviToken
      const Kernel = await ethers.getContractFactory("IranOS_Kernel");
      const freshKernel = await Kernel.deploy(
        sovereign.address, court.address, oracle.address, swf.address
      );
      await freshKernel.waitForDeployment();
      expect(await freshKernel.pahlaviToken()).to.equal(ethers.ZeroAddress);

      await expect(
        freshKernel.connect(oracle).syncReserves(ethers.parseUnits("100", 18))
      ).to.be.revertedWith("Kernel: pahlaviToken not set");
    });
  });
});
