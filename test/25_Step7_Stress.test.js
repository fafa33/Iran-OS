const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Step7 Stress Baseline", function () {
  let oracle;
  let kernel;
  let feeders;

  const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));
  const KEY_OIL_USD = ethers.keccak256(ethers.toUtf8Bytes("OIL_USD"));

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [kernel, ...feeders] = signers;

    const Oracle = await ethers.getContractFactory("PriceOracle");
    oracle = await Oracle.deploy(kernel.address);
    await oracle.waitForDeployment();

    for (const feeder of feeders.slice(0, 6)) {
      await oracle.connect(kernel).grantRole(FEEDER_ROLE, feeder.address);
    }
  });

  describe("Economic Oracle Stress", function () {
    it("excludes stale feeder submissions until a fresh stress quorum exists", async function () {
      const initialPrices = [
        ethers.parseUnits("80", 18),
        ethers.parseUnits("85", 18),
        ethers.parseUnits("90", 18),
      ];
      const stressedPrices = [
        ethers.parseUnits("95", 18),
        ethers.parseUnits("100", 18),
        ethers.parseUnits("105", 18),
      ];

      await oracle.connect(feeders[0]).submitPrice(KEY_OIL_USD, initialPrices[0], 900);
      await oracle.connect(feeders[1]).submitPrice(KEY_OIL_USD, initialPrices[1], 900);
      await oracle.connect(feeders[2]).submitPrice(KEY_OIL_USD, initialPrices[2], 900);

      const initialAggregate = await oracle.prices(KEY_OIL_USD);
      expect(initialAggregate.value).to.equal(ethers.parseUnits("85", 18));
      expect(initialAggregate.feederCount).to.equal(3);
      expect(initialAggregate.isValid).to.equal(true);

      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      await oracle.connect(feeders[3]).submitPrice(KEY_OIL_USD, stressedPrices[0], 900);
      await oracle.connect(feeders[4]).submitPrice(KEY_OIL_USD, stressedPrices[1], 900);

      const belowFreshQuorum = await oracle.prices(KEY_OIL_USD);
      expect(belowFreshQuorum.value).to.equal(initialAggregate.value);
      expect(belowFreshQuorum.timestamp).to.equal(initialAggregate.timestamp);
      expect(belowFreshQuorum.feederCount).to.equal(initialAggregate.feederCount);
      expect(belowFreshQuorum.isValid).to.equal(initialAggregate.isValid);

      await expect(
        oracle.connect(feeders[5]).submitPrice(KEY_OIL_USD, stressedPrices[2], 900)
      ).to.emit(oracle, "PriceUpdated");

      const stressedAggregate = await oracle.prices(KEY_OIL_USD);
      expect(stressedAggregate.value).to.equal(ethers.parseUnits("100", 18));
      expect(stressedAggregate.feederCount).to.equal(3);
      expect(stressedAggregate.timestamp).to.be.greaterThan(initialAggregate.timestamp);
      expect(stressedAggregate.isValid).to.equal(true);
    });
  });
});
