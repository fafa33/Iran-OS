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

    it("feeder report propagates through Kernel court signatures to TriggerProtocol execution", async function () {
      const signers = await ethers.getSigners();
      const extraCourts = signers.slice(6, 12);
      const COURT_ROLE = await kernel.COURT_ROLE();

      const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
      const triggerProtocol = await TriggerProtocol.deploy(
        await kernel.getAddress(),
        stranger.address,
        swf.address
      );
      await kernel.connect(sovereign).setTriggerProtocol(await triggerProtocol.getAddress());

      for (const extraCourt of extraCourts) {
        await kernel.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
      }

      await api3Oracle.connect(feeder).flagViolation(
        offender.address,
        4,
        "نقض حقوق بنیادین"
      );

      expect(await kernel.violationCount()).to.equal(1n);

      const courts = [court, ...extraCourts];
      for (let i = 0; i < courts.length - 1; i++) {
        await kernel.connect(courts[i]).signViolation(1);
      }

      const tx = await kernel.connect(courts[courts.length - 1]).signViolation(1);
      await expect(tx).to.emit(kernel, "TriggerActivated");
      await expect(tx).to.emit(triggerProtocol, "TriggerExecuted");

      expect(await triggerProtocol.executionCount()).to.equal(1n);
      const execution = await triggerProtocol.executions(1);
      expect(execution.violationId).to.equal(1n);
      expect(execution.offender).to.equal(offender.address);
      expect(execution.violationCode).to.equal(4);
      expect(execution.treasuryBlocked).to.be.true;
      expect(execution.signatureRevoked).to.be.true;
      expect(execution.publicNotified).to.be.true;
    });

    it("duplicate feeder reports are recorded as separate auditable oracle and Kernel violations", async function () {
      const reason = "نقض حقوق بنیادین";

      await api3Oracle.connect(feeder).flagViolation(offender.address, 4, reason);
      await api3Oracle.connect(feeder).flagViolation(offender.address, 4, reason);

      expect(await api3Oracle.violationFlagCount()).to.equal(2n);
      expect(await kernel.violationCount()).to.equal(2n);

      const oracleFlag1 = await api3Oracle.getViolationFlag(1);
      const oracleFlag2 = await api3Oracle.getViolationFlag(2);
      expect(oracleFlag1.offender).to.equal(offender.address);
      expect(oracleFlag2.offender).to.equal(offender.address);
      expect(oracleFlag1.violationCode).to.equal(4);
      expect(oracleFlag2.violationCode).to.equal(4);
      expect(oracleFlag1.reason).to.equal(reason);
      expect(oracleFlag2.reason).to.equal(reason);
      expect(oracleFlag1.timestamp).to.be.greaterThan(0n);
      expect(oracleFlag2.timestamp).to.be.greaterThan(0n);

      const kernelViolation1 = await kernel.violations(1);
      const kernelViolation2 = await kernel.violations(2);
      expect(kernelViolation1.violationCode).to.equal(4);
      expect(kernelViolation2.violationCode).to.equal(4);
      expect(kernelViolation1.offender).to.equal(offender.address);
      expect(kernelViolation2.offender).to.equal(offender.address);
      expect(kernelViolation1.reason).to.equal(reason);
      expect(kernelViolation2.reason).to.equal(reason);
      expect(kernelViolation1.timestamp).to.be.greaterThan(0n);
      expect(kernelViolation2.timestamp).to.be.greaterThan(0n);
    });

    it("triggered bridged violation cannot be re-signed into a second TriggerProtocol execution", async function () {
      const signers = await ethers.getSigners();
      const extraCourts = signers.slice(6, 13);
      const COURT_ROLE = await kernel.COURT_ROLE();

      const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
      const triggerProtocol = await TriggerProtocol.deploy(
        await kernel.getAddress(),
        stranger.address,
        swf.address
      );
      await kernel.connect(sovereign).setTriggerProtocol(await triggerProtocol.getAddress());

      for (const extraCourt of extraCourts) {
        await kernel.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
      }

      await api3Oracle.connect(feeder).flagViolation(
        offender.address,
        4,
        "نقض حقوق بنیادین"
      );

      const thresholdCourts = [court, ...extraCourts.slice(0, 6)];
      for (const courtSigner of thresholdCourts) {
        await kernel.connect(courtSigner).signViolation(1);
      }

      expect(await triggerProtocol.executionCount()).to.equal(1n);

      await expect(
        kernel.connect(extraCourts[6]).signViolation(1)
      ).to.be.revertedWith("Kernel: trigger already activated");

      expect(await triggerProtocol.executionCount()).to.equal(1n);
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

  describe("CLC-03 data staleness guard", function () {
    it("flagViolation reverts when PAH_USD_KEY feed is older than MAX_DATA_AGE", async function () {
      const maxDataAge = await api3Oracle.MAX_DATA_AGE();
      await network.provider.send("evm_increaseTime", [Number(maxDataAge) + 1]);
      await network.provider.send("evm_mine", []);

      await expect(
        api3Oracle.connect(feeder).flagViolation(offender.address, 4, "نقض حقوق بنیادین")
      ).to.be.revertedWith("API3Oracle: stale data feed");

      expect(await api3Oracle.violationFlagCount()).to.equal(0n);
      expect(await kernel.violationCount()).to.equal(0n);
    });

    it("flagViolation succeeds after feeder refreshes PAH_USD_KEY within MAX_DATA_AGE", async function () {
      const maxDataAge = await api3Oracle.MAX_DATA_AGE();
      await network.provider.send("evm_increaseTime", [Number(maxDataAge) + 1]);
      await network.provider.send("evm_mine", []);

      const PAH_USD_KEY = await api3Oracle.PAH_USD_KEY();
      await api3Oracle.connect(feeder).updateData(PAH_USD_KEY, 1, 1n * BigInt(1e18), 1000);

      const tx = await api3Oracle.connect(feeder).flagViolation(offender.address, 4, "نقض حقوق بنیادین");
      await expect(tx).to.emit(api3Oracle, "ViolationFlagged");
      expect(await api3Oracle.violationFlagCount()).to.equal(1n);
    });

    it("MAX_DATA_AGE constant equals 1 hour", async function () {
      expect(await api3Oracle.MAX_DATA_AGE()).to.equal(3600n);
    });
  });
});
