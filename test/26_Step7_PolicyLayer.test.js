const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Step7 Policy Layer", function () {
  it("keeps valid economic oracle signals policy-neutral without an authority adapter", async function () {
    const [
      kernel,
      feeder1,
      feeder2,
      feeder3,
      parliament,
      government,
      policyOracle,
      swf,
      devBank,
      employer,
      employee,
      account,
    ] = await ethers.getSigners();

    const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const PARLIAMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARLIAMENT_ROLE"));
    const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));
    const SWF_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SWF_ROLE"));

    const KEY_GLOBAL_CPI = ethers.keccak256(ethers.toUtf8Bytes("GLOBAL_CPI"));
    const KEY_USD_GOLD = ethers.keccak256(ethers.toUtf8Bytes("USD_GOLD"));
    const KEY_GAS_USD = ethers.keccak256(ethers.toUtf8Bytes("GAS_USD"));

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy(kernel.address);
    await priceOracle.waitForDeployment();

    for (const feeder of [feeder1, feeder2, feeder3]) {
      await priceOracle.connect(kernel).grantRole(FEEDER_ROLE, feeder.address);
    }

    const BaseIncome = await ethers.getContractFactory("BaseIncome");
    const baseIncome = await BaseIncome.deploy(kernel.address);
    await baseIncome.waitForDeployment();
    await baseIncome.connect(kernel).grantRole(ORACLE_ROLE, policyOracle.address);
    await baseIncome.connect(kernel).grantRole(SWF_ROLE, swf.address);

    const BudgetAllocation = await ethers.getContractFactory("BudgetAllocation");
    const budget = await BudgetAllocation.deploy(kernel.address);
    await budget.waitForDeployment();
    await budget.connect(kernel).grantRole(PARLIAMENT_ROLE, parliament.address);
    await budget.connect(kernel).grantRole(GOVERNMENT_ROLE, government.address);

    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    const pah = await PahlaviToken.deploy(swf.address, kernel.address, ethers.parseUnits("1", 30));
    await pah.waitForDeployment();

    const VelocityFee = await ethers.getContractFactory("VelocityFee");
    const velocityFee = await VelocityFee.deploy(kernel.address, devBank.address, await pah.getAddress());
    await velocityFee.waitForDeployment();
    await velocityFee.connect(kernel).grantRole(ORACLE_ROLE, policyOracle.address);

    const minWage = await baseIncome.MIN_WAGE();
    const taxExemptCap = await baseIncome.TAX_EXEMPT_CAP();
    const totalBudget = await budget.TOTAL_BUDGET();
    const healthRatio = await budget.HEALTH_RATIO();
    const welfareRatio = await budget.WELFARE_RATIO();
    const velocityThreshold = await velocityFee.THRESHOLD();
    const tier1Rate = await velocityFee.TIER1_RATE();
    const dormancyPeriod = await velocityFee.DORMANCY_PERIOD();

    await budget.connect(parliament).approveBudget(1404);
    const healthBefore = await budget.getSectorBudget(0);
    const welfareBefore = await budget.getSectorBudget(4);

    await priceOracle.connect(feeder1).submitPrice(KEY_GLOBAL_CPI, ethers.parseUnits("125", 18), 950);
    await priceOracle.connect(feeder2).submitPrice(KEY_GLOBAL_CPI, ethers.parseUnits("126", 18), 950);
    await expect(
      priceOracle.connect(feeder3).submitPrice(KEY_GLOBAL_CPI, ethers.parseUnits("127", 18), 950)
    ).to.emit(priceOracle, "PriceUpdated");

    await priceOracle.connect(feeder1).submitPrice(KEY_USD_GOLD, ethers.parseUnits("1900", 18), 940);
    await priceOracle.connect(feeder2).submitPrice(KEY_USD_GOLD, ethers.parseUnits("1910", 18), 940);
    await expect(
      priceOracle.connect(feeder3).submitPrice(KEY_USD_GOLD, ethers.parseUnits("1920", 18), 940)
    ).to.emit(priceOracle, "PriceUpdated");

    await priceOracle.connect(feeder1).submitPrice(KEY_GAS_USD, ethers.parseUnits("30", 18), 930);
    await priceOracle.connect(feeder2).submitPrice(KEY_GAS_USD, ethers.parseUnits("31", 18), 930);
    await expect(
      priceOracle.connect(feeder3).submitPrice(KEY_GAS_USD, ethers.parseUnits("32", 18), 930)
    ).to.emit(priceOracle, "PriceUpdated");

    const [gasPrice, , gasIsValid] = await priceOracle.getPrice(KEY_GAS_USD);
    expect(await priceOracle.getInflationRate()).to.equal(ethers.parseUnits("126", 18));
    expect(await priceOracle.getGoldPrice()).to.equal(ethers.parseUnits("1910", 18));
    expect(gasPrice).to.equal(ethers.parseUnits("31", 18));
    expect(gasIsValid).to.equal(true);

    expect(await baseIncome.MIN_WAGE()).to.equal(minWage);
    expect(await baseIncome.TAX_EXEMPT_CAP()).to.equal(taxExemptCap);
    expect(await baseIncome.paymentCount()).to.equal(0);
    expect((await baseIncome.getEmployerRecord(employer.address)).isRegistered).to.equal(false);

    expect(await budget.TOTAL_BUDGET()).to.equal(totalBudget);
    expect(await budget.HEALTH_RATIO()).to.equal(healthRatio);
    expect(await budget.WELFARE_RATIO()).to.equal(welfareRatio);
    const healthAfter = await budget.getSectorBudget(0);
    const welfareAfter = await budget.getSectorBudget(4);
    expect(healthAfter.allocated).to.equal(healthBefore.allocated);
    expect(healthAfter.spent).to.equal(0);
    expect(healthAfter.isLocked).to.equal(false);
    expect(welfareAfter.allocated).to.equal(welfareBefore.allocated);
    expect(welfareAfter.spent).to.equal(0);
    expect(welfareAfter.isLocked).to.equal(false);
    expect(await budget.expenditureCount()).to.equal(0);

    expect(await velocityFee.THRESHOLD()).to.equal(velocityThreshold);
    expect(await velocityFee.TIER1_RATE()).to.equal(tier1Rate);
    expect(await velocityFee.DORMANCY_PERIOD()).to.equal(dormancyPeriod);
    expect(await velocityFee.totalFeesCollected()).to.equal(0);
    expect(await velocityFee.isDormant(account.address)).to.equal(false);

    await baseIncome.connect(policyOracle).registerEmployer(employer.address, 3);
    await baseIncome.connect(employer).recordWagePayment(employee.address, minWage);
    expect((await baseIncome.getEmployerRecord(employer.address)).isCompliant).to.equal(true);

    await budget
      .connect(government)
      .recordExpenditure(0, ethers.parseUnits("1000000000", 18), "authorized health policy spend");
    expect((await budget.getSectorBudget(0)).spent).to.equal(ethers.parseUnits("1000000000", 18));

    const tierOneBalance = ethers.parseUnits("200000", 18);
    await pah.connect(swf).mint(account.address, tierOneBalance, "policy neutrality test mint");
    await velocityFee.connect(policyOracle).registerAccount(account.address);
    await ethers.provider.send("evm_increaseTime", [Number(dormancyPeriod)]);
    await ethers.provider.send("evm_mine", []);

    const [feeAmount, tier, dormant] = await velocityFee.calculateFee(account.address);
    expect(feeAmount).to.equal((tierOneBalance * tier1Rate) / 1000n);
    expect(tier).to.equal(1);
    expect(dormant).to.equal(true);
  });

  it("applies dormant-liquidity fees only through explicit policy execution", async function () {
    const [
      kernel,
      feeder1,
      feeder2,
      feeder3,
      policyOracle,
      staking,
      swf,
      devBank,
      dormantAccount,
      stakingAccount,
    ] = await ethers.getSigners();

    const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const STAKING_ROLE = ethers.keccak256(ethers.toUtf8Bytes("STAKING_ROLE"));
    const KEY_GAS_USD = ethers.keccak256(ethers.toUtf8Bytes("GAS_USD"));

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy(kernel.address);
    await priceOracle.waitForDeployment();

    for (const feeder of [feeder1, feeder2, feeder3]) {
      await priceOracle.connect(kernel).grantRole(FEEDER_ROLE, feeder.address);
    }

    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    const pah = await PahlaviToken.deploy(swf.address, kernel.address, ethers.parseUnits("1", 30));
    await pah.waitForDeployment();

    const VelocityFee = await ethers.getContractFactory("VelocityFee");
    const velocityFee = await VelocityFee.deploy(kernel.address, devBank.address, await pah.getAddress());
    await velocityFee.waitForDeployment();
    await velocityFee.connect(kernel).grantRole(ORACLE_ROLE, policyOracle.address);
    await velocityFee.connect(kernel).grantRole(STAKING_ROLE, staking.address);

    const tier2Balance = ethers.parseUnits("1000000", 18);
    const stakingBalance = ethers.parseUnits("6000000", 18);
    const expectedTier2Fee = (tier2Balance * (await velocityFee.TIER2_RATE())) / 1000n;

    await pah.connect(swf).mint(dormantAccount.address, tier2Balance, "dormant liquidity policy test");
    await pah.connect(swf).mint(stakingAccount.address, stakingBalance, "staking exemption policy test");

    await velocityFee.connect(policyOracle).registerAccount(dormantAccount.address);
    await velocityFee.connect(policyOracle).registerAccount(stakingAccount.address);
    await velocityFee.connect(staking).activateStaking(stakingAccount.address, stakingBalance);

    await ethers.provider.send("evm_increaseTime", [Number(await velocityFee.DORMANCY_PERIOD())]);
    await ethers.provider.send("evm_mine", []);

    await priceOracle.connect(feeder1).submitPrice(KEY_GAS_USD, ethers.parseUnits("30", 18), 930);
    await priceOracle.connect(feeder2).submitPrice(KEY_GAS_USD, ethers.parseUnits("31", 18), 930);
    await expect(
      priceOracle.connect(feeder3).submitPrice(KEY_GAS_USD, ethers.parseUnits("32", 18), 930)
    ).to.emit(priceOracle, "PriceUpdated");

    const [gasPrice, , gasIsValid] = await priceOracle.getPrice(KEY_GAS_USD);
    expect(gasPrice).to.equal(ethers.parseUnits("31", 18));
    expect(gasIsValid).to.equal(true);
    expect(await velocityFee.totalFeesCollected()).to.equal(0);
    expect((await velocityFee.getAccountStatus(dormantAccount.address)).totalFeesPaid).to.equal(0);

    const [feeAmount, tier, dormant] = await velocityFee.calculateFee(dormantAccount.address);
    expect(feeAmount).to.equal(expectedTier2Fee);
    expect(tier).to.equal(2);
    expect(dormant).to.equal(true);
    expect(await velocityFee.isDormant(dormantAccount.address)).to.equal(true);

    const [stakingFee, stakingTier, stakingDormant] = await velocityFee.calculateFee(stakingAccount.address);
    expect(stakingFee).to.equal(0);
    expect(stakingTier).to.equal(0);
    expect(stakingDormant).to.equal(false);
    await expect(
      velocityFee.connect(policyOracle).applyFee(stakingAccount.address)
    ).to.be.revertedWith("VelocityFee: staking exempt");

    await expect(
      velocityFee.connect(policyOracle).applyFee(dormantAccount.address)
    ).to.emit(velocityFee, "FeeCollected");

    expect(await velocityFee.totalFeesCollected()).to.equal(expectedTier2Fee);
    expect((await velocityFee.getAccountStatus(dormantAccount.address)).totalFeesPaid).to.equal(expectedTier2Fee);
  });
});
