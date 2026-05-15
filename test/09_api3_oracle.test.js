// SPDX-License-Identifier: MIT
// تست پل گزارش تخلف API3Oracle به Kernel
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("API3Oracle", function () {
  let kernel, api3Oracle;
  let sovereign, court, feeder, offender, swf, stranger;

  beforeEach(async function () {
    [sovereign, court, feeder, offender, swf, stranger] = await ethers.getSigners();

    const Kernel = await ethers.getContractFactory("IranOS_Kernel");
    kernel = await Kernel.deploy(
      sovereign.address,
      court.address,
      sovereign.address,
      swf.address
    );

    const API3Oracle = await ethers.getContractFactory("API3Oracle");
    api3Oracle = await API3Oracle.deploy(await kernel.getAddress());

    const ORACLE_ROLE = await kernel.ORACLE_ROLE();
    await kernel.connect(sovereign).grantOfficialAccess(await api3Oracle.getAddress(), ORACLE_ROLE);

    const FEEDER_ROLE = await api3Oracle.FEEDER_ROLE();
    const kernelAddress = await kernel.getAddress();
    await network.provider.send("hardhat_setBalance", [
      kernelAddress,
      "0x1000000000000000000"
    ]);
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [kernelAddress]
    });
    const kernelSigner = await ethers.getSigner(kernelAddress);
    await api3Oracle.connect(kernelSigner).grantRole(FEEDER_ROLE, feeder.address);
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [kernelAddress]
    });
  });

  describe("flagViolation bridge", function () {
    it("feeder report is forwarded to Kernel without activating emergency lock for TR-04", async function () {
      const tx = await api3Oracle.connect(feeder).flagViolation(
        offender.address,
        4,
        "نقض حقوق بنیادین"
      );

      await expect(tx).to.emit(api3Oracle, "ViolationFlagged");
      await expect(tx).to.emit(kernel, "ViolationFlagged");

      expect(await api3Oracle.violationFlagCount()).to.equal(1n);
      expect(await kernel.violationCount()).to.equal(1n);
      expect(await kernel.emergencyLockActive()).to.be.false;
    });

    it("feeder report preserves Kernel emergency behavior for TR-01", async function () {
      await api3Oracle.connect(feeder).flagViolation(
        offender.address,
        1,
        "نقض پادشاهی مشروطه"
      );

      expect(await api3Oracle.violationFlagCount()).to.equal(1n);
      expect(await kernel.violationCount()).to.equal(1n);
      expect(await kernel.emergencyLockActive()).to.be.true;
    });

    it("non-feeder cannot report a violation", async function () {
      await expect(
        api3Oracle.connect(stranger).flagViolation(offender.address, 4, "test")
      ).to.be.revertedWith("API3Oracle: caller is not a feeder");
    });

    it("misconfigured Kernel ORACLE_ROLE reverts atomically without orphan oracle flag", async function () {
      const ORACLE_ROLE = await kernel.ORACLE_ROLE();
      await kernel.connect(sovereign).revokeRole(ORACLE_ROLE, await api3Oracle.getAddress());

      await expect(
        api3Oracle.connect(feeder).flagViolation(offender.address, 4, "test")
      ).to.be.revertedWith("Kernel: caller is not an Oracle");

      expect(await api3Oracle.violationFlagCount()).to.equal(0n);
      expect(await kernel.violationCount()).to.equal(0n);
    });

    it("invalid violation code is rejected before forwarding", async function () {
      await expect(
        api3Oracle.connect(feeder).flagViolation(offender.address, 7, "invalid")
      ).to.be.revertedWith("API3Oracle: invalid code");

      expect(await api3Oracle.violationFlagCount()).to.equal(0n);
      expect(await kernel.violationCount()).to.equal(0n);
    });

    it("zero offender is rejected before forwarding", async function () {
      await expect(
        api3Oracle.connect(feeder).flagViolation(ethers.ZeroAddress, 4, "invalid")
      ).to.be.revertedWith("API3Oracle: invalid offender");

      expect(await api3Oracle.violationFlagCount()).to.equal(0n);
      expect(await kernel.violationCount()).to.equal(0n);
    });
  });
});
