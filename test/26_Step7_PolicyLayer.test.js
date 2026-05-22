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

  it("preserves ProductionOracle industrial policy boundaries across category stress", async function () {
    const [kernel, feeder, bank, productionUnit, unauthorized] = await ethers.getSigners();

    const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));
    const BANK_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BANK_ROLE"));

    const ProductionOracle = await ethers.getContractFactory("ProductionOracle");
    const productionOracle = await ProductionOracle.deploy(kernel.address);
    await productionOracle.waitForDeployment();
    await productionOracle.connect(kernel).grantRole(FEEDER_ROLE, feeder.address);
    await productionOracle.connect(kernel).grantRole(BANK_ROLE, bank.address);

    const pioneerMonthlyValueAdded = ethers.parseUnits("1000000", 18);
    const transitionMonthlyValueAdded = ethers.parseUnits("500000", 18);

    await productionOracle.connect(feeder).registerUnit(productionUnit.address, "industrial resilience unit");

    const registeredUnit = await productionOracle.getUnit(productionUnit.address);
    expect(registeredUnit.category).to.equal(1);
    expect(registeredUnit.compositeScore).to.equal(50);
    expect(registeredUnit.isEligibleForLoan).to.equal(true);
    expect(await productionOracle.totalTransitionUnits()).to.equal(1);

    await expect(
      productionOracle
        .connect(unauthorized)
        .updateProductionData(productionUnit.address, 150, pioneerMonthlyValueAdded, 100, 100)
    ).to.be.reverted;

    const afterUnauthorizedUpdate = await productionOracle.getUnit(productionUnit.address);
    expect(afterUnauthorizedUpdate.category).to.equal(1);
    expect(afterUnauthorizedUpdate.compositeScore).to.equal(50);
    expect(afterUnauthorizedUpdate.isEligibleForLoan).to.equal(true);

    await expect(
      productionOracle.connect(feeder).updateProductionData(productionUnit.address, 150, pioneerMonthlyValueAdded, 100, 100)
    ).to.emit(productionOracle, "CategoryChanged");

    const pioneerUnit = await productionOracle.getUnit(productionUnit.address);
    expect(pioneerUnit.category).to.equal(0);
    expect(pioneerUnit.compositeScore).to.equal(100);
    expect(pioneerUnit.isEligibleForLoan).to.equal(true);
    expect(await productionOracle.totalPioneerUnits()).to.equal(1);
    expect(await productionOracle.totalTransitionUnits()).to.equal(0);
    expect(await productionOracle.totalCriticalUnits()).to.equal(0);

    await expect(
      productionOracle.connect(unauthorized).grantLoanEligibility(productionUnit.address)
    ).to.be.reverted;

    await expect(
      productionOracle.connect(bank).grantLoanEligibility(productionUnit.address)
    ).to.emit(productionOracle, "LoanEligibilityGranted");

    const pioneerEligibility = await productionOracle.getLoanEligibility(1);
    expect(pioneerEligibility.unit).to.equal(productionUnit.address);
    expect(pioneerEligibility.maxLoanAmount).to.equal(pioneerMonthlyValueAdded * 12n);
    expect(pioneerEligibility.interestRate).to.equal(10);
    expect(pioneerEligibility.approved).to.equal(true);

    await productionOracle
      .connect(feeder)
      .updateProductionData(productionUnit.address, 50, transitionMonthlyValueAdded, 50, 50);

    const transitionUnit = await productionOracle.getUnit(productionUnit.address);
    expect(transitionUnit.category).to.equal(1);
    expect(transitionUnit.compositeScore).to.equal(65);
    expect(transitionUnit.isEligibleForLoan).to.equal(true);
    expect(await productionOracle.totalPioneerUnits()).to.equal(0);
    expect(await productionOracle.totalTransitionUnits()).to.equal(1);
    expect(await productionOracle.totalCriticalUnits()).to.equal(0);

    await productionOracle.connect(bank).grantLoanEligibility(productionUnit.address);
    const transitionEligibility = await productionOracle.getLoanEligibility(2);
    expect(transitionEligibility.unit).to.equal(productionUnit.address);
    expect(transitionEligibility.maxLoanAmount).to.equal(transitionMonthlyValueAdded * 6n);
    expect(transitionEligibility.interestRate).to.equal(30);
    expect(transitionEligibility.approved).to.equal(true);

    await productionOracle.connect(feeder).updateProductionData(productionUnit.address, 0, 0, 0, 0);

    const criticalUnit = await productionOracle.getUnit(productionUnit.address);
    expect(criticalUnit.category).to.equal(2);
    expect(criticalUnit.compositeScore).to.equal(0);
    expect(criticalUnit.isEligibleForLoan).to.equal(false);
    expect(await productionOracle.totalPioneerUnits()).to.equal(0);
    expect(await productionOracle.totalTransitionUnits()).to.equal(0);
    expect(await productionOracle.totalCriticalUnits()).to.equal(1);

    await expect(
      productionOracle.connect(bank).grantLoanEligibility(productionUnit.address)
    ).to.be.revertedWith("ProductionOracle: not eligible");

    await expect(
      productionOracle.connect(unauthorized).grantCriticalSubsidy(productionUnit.address)
    ).to.be.reverted;

    await expect(
      productionOracle.connect(bank).grantCriticalSubsidy(productionUnit.address)
    ).to.emit(productionOracle, "SubsidyGranted");

    const subsidizedCriticalUnit = await productionOracle.getUnit(productionUnit.address);
    expect(subsidizedCriticalUnit.subsidyMonthsRemaining).to.equal(6);
    expect(await productionOracle.eligibilityCount()).to.equal(2);
  });

  it("contains BudgetAllocation spending within approved sector policy boundaries", async function () {
    const [kernel, parliament, government, auditor] = await ethers.getSigners();

    const PARLIAMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARLIAMENT_ROLE"));
    const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));
    const AUDITOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));

    const BudgetAllocation = await ethers.getContractFactory("BudgetAllocation");
    const budget = await BudgetAllocation.deploy(kernel.address);
    await budget.waitForDeployment();
    await budget.connect(kernel).grantRole(PARLIAMENT_ROLE, parliament.address);
    await budget.connect(kernel).grantRole(GOVERNMENT_ROLE, government.address);
    await budget.connect(kernel).grantRole(AUDITOR_ROLE, auditor.address);

    await expect(budget.connect(parliament).approveBudget(1404)).to.emit(budget, "BudgetApproved");
    expect(await budget.budgetApproved()).to.equal(true);

    const totalBudget = await budget.TOTAL_BUDGET();
    const healthBudget = await budget.getSectorBudget(0);
    const defenseBudget = await budget.getSectorBudget(2);
    expect(healthBudget.allocated).to.equal((totalBudget * (await budget.HEALTH_RATIO())) / 1000n);
    expect(defenseBudget.allocated).to.equal((totalBudget * (await budget.DEFENSE_RATIO())) / 1000n);
    expect(healthBudget.spent).to.equal(0);
    expect(defenseBudget.spent).to.equal(0);

    const healthSpend = ethers.parseUnits("1000000000", 18);
    await expect(
      budget.connect(government).recordExpenditure(0, healthSpend, "contained health sector spend")
    ).to.emit(budget, "ExpenditureRecorded");

    const afterHealthSpend = await budget.getSectorBudget(0);
    expect(afterHealthSpend.spent).to.equal(healthSpend);
    expect(await budget.expenditureCount()).to.equal(1);

    await expect(
      budget.connect(government).recordExpenditure(0, afterHealthSpend.allocated - afterHealthSpend.spent + 1n, "overspend")
    ).to.be.revertedWith("BudgetAllocation: exceeds budget");
    expect((await budget.getSectorBudget(0)).spent).to.equal(healthSpend);
    expect(await budget.expenditureCount()).to.equal(1);

    await expect(
      budget.connect(auditor).flagExpenditure(1, "suspicious contained spend")
    ).to.emit(budget, "ExpenditureFlagged");
    expect((await budget.expenditures(1)).flagged).to.equal(true);

    await expect(
      budget.connect(kernel).lockSectorBudget(2, "containment lock")
    ).to.emit(budget, "SectorBudgetLocked");
    expect((await budget.getSectorBudget(2)).isLocked).to.equal(true);

    await expect(
      budget.connect(government).recordExpenditure(2, ethers.parseUnits("1", 18), "locked defense spend")
    ).to.be.revertedWith("BudgetAllocation: locked by Trigger");
    expect((await budget.getSectorBudget(2)).spent).to.equal(0);
    expect(await budget.expenditureCount()).to.equal(1);
  });

  it("preserves Provincial redistribution and productivity bonus policy boundaries", async function () {
    const [kernel, oracle, governor, developmentAccount, nationalTreasury, unauthorized] = await ethers.getSigners();

    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const GOVERNOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNOR_ROLE"));

    const Provincial = await ethers.getContractFactory("Provincial");
    const provincial = await Provincial.deploy(kernel.address, nationalTreasury.address);
    await provincial.waitForDeployment();
    await provincial.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);

    await expect(
      provincial.connect(unauthorized).registerProvince("unauthorized province", governor.address, developmentAccount.address)
    ).to.be.reverted;

    await expect(
      provincial.connect(kernel).registerProvince("redistribution province", governor.address, developmentAccount.address)
    ).to.emit(provincial, "ProvinceRegistered");

    expect(await provincial.provinceCount()).to.equal(1);
    expect(await provincial.getProvinceByGovernor(governor.address)).to.equal(1);
    expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.equal(true);

    const registeredProvince = await provincial.getProvince(1);
    expect(registeredProvince.productivityScore).to.equal(50);
    expect(registeredProvince.totalRevenue).to.equal(0);
    expect(registeredProvince.provincialBalance).to.equal(0);
    expect(registeredProvince.nationalContrib).to.equal(0);

    const revenue = ethers.parseUnits("1000000", 18);
    await expect(
      provincial.connect(unauthorized).distributeRevenue(1, revenue)
    ).to.be.reverted;

    await expect(
      provincial.connect(oracle).distributeRevenue(1, revenue)
    ).to.emit(provincial, "RevenueDistributed");

    const afterRevenue = await provincial.getProvince(1);
    const expectedProvincialShare = (revenue * (await provincial.PROVINCIAL_SHARE())) / 1000n;
    const expectedNationalShare = revenue - expectedProvincialShare;
    expect(afterRevenue.totalRevenue).to.equal(revenue);
    expect(afterRevenue.provincialBalance).to.equal(expectedProvincialShare);
    expect(afterRevenue.nationalContrib).to.equal(expectedNationalShare);

    await expect(
      provincial.connect(unauthorized).updateProductivityScore(1, 71)
    ).to.be.reverted;
    await expect(
      provincial.connect(oracle).updateProductivityScore(1, 101)
    ).to.be.revertedWith("Provincial: score out of range");

    await expect(
      provincial.connect(kernel).payProductivityBonus(1, ethers.parseUnits("50000", 18))
    ).to.be.revertedWith("Provincial: score too low");
    expect((await provincial.getProvince(1)).provincialBalance).to.equal(expectedProvincialShare);

    await provincial.connect(oracle).updateProductivityScore(1, 70);
    await expect(
      provincial.connect(kernel).payProductivityBonus(1, ethers.parseUnits("50000", 18))
    ).to.be.revertedWith("Provincial: score too low");

    await provincial.connect(oracle).updateProductivityScore(1, 71);
    expect((await provincial.getProvince(1)).productivityScore).to.equal(71);

    const bonus = ethers.parseUnits("50000", 18);
    await expect(
      provincial.connect(unauthorized).payProductivityBonus(1, bonus)
    ).to.be.reverted;

    await expect(
      provincial.connect(kernel).payProductivityBonus(1, bonus)
    ).to.emit(provincial, "ProductivityBonusPaid");

    const afterBonus = await provincial.getProvince(1);
    expect(afterBonus.productivityScore).to.equal(71);
    expect(afterBonus.totalRevenue).to.equal(revenue);
    expect(afterBonus.nationalContrib).to.equal(expectedNationalShare);
    expect(afterBonus.provincialBalance).to.equal(expectedProvincialShare + bonus);
  });

  it("creates proposal-only Fargard 7 recommendations from fresh economic signals", async function () {
    const [
      kernel,
      feeder1,
      feeder2,
      feeder3,
      unauthorized,
      parliament,
      government,
      policyOracle,
      swf,
      devBank,
      productionFeeder,
      productionBank,
      provincialOracle,
      governor,
      developmentAccount,
      nationalTreasury,
      monitoredAccount,
    ] = await ethers.getSigners();

    const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));
    const POLICY_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POLICY_ADMIN_ROLE"));
    const RECOMMENDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RECOMMENDER_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const PARLIAMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARLIAMENT_ROLE"));
    const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));
    const BANK_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BANK_ROLE"));

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

    const BudgetAllocation = await ethers.getContractFactory("BudgetAllocation");
    const budget = await BudgetAllocation.deploy(kernel.address);
    await budget.waitForDeployment();
    await budget.connect(kernel).grantRole(PARLIAMENT_ROLE, parliament.address);
    await budget.connect(kernel).grantRole(GOVERNMENT_ROLE, government.address);
    await budget.connect(parliament).approveBudget(1404);

    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    const pah = await PahlaviToken.deploy(swf.address, kernel.address, ethers.parseUnits("1", 30));
    await pah.waitForDeployment();

    const VelocityFee = await ethers.getContractFactory("VelocityFee");
    const velocityFee = await VelocityFee.deploy(kernel.address, devBank.address, await pah.getAddress());
    await velocityFee.waitForDeployment();
    await velocityFee.connect(kernel).grantRole(ORACLE_ROLE, policyOracle.address);
    await velocityFee.connect(policyOracle).registerAccount(monitoredAccount.address);

    const ProductionOracle = await ethers.getContractFactory("ProductionOracle");
    const productionOracle = await ProductionOracle.deploy(kernel.address);
    await productionOracle.waitForDeployment();
    await productionOracle.connect(kernel).grantRole(FEEDER_ROLE, productionFeeder.address);
    await productionOracle.connect(kernel).grantRole(BANK_ROLE, productionBank.address);

    const Provincial = await ethers.getContractFactory("Provincial");
    const provincial = await Provincial.deploy(kernel.address, nationalTreasury.address);
    await provincial.waitForDeployment();
    await provincial.connect(kernel).grantRole(ORACLE_ROLE, provincialOracle.address);
    await provincial.connect(kernel).registerProvince("adapter boundary province", governor.address, developmentAccount.address);

    const Fargard7PolicyAdapter = await ethers.getContractFactory("Fargard7PolicyAdapter");
    const adapter = await Fargard7PolicyAdapter.deploy(kernel.address, await priceOracle.getAddress());
    await adapter.waitForDeployment();

    expect(await adapter.hasRole(POLICY_ADMIN_ROLE, kernel.address)).to.equal(true);
    expect(await adapter.hasRole(RECOMMENDER_ROLE, kernel.address)).to.equal(true);
    await expect(adapter.connect(unauthorized).setPriceOracle(await priceOracle.getAddress())).to.be.reverted;
    await expect(adapter.connect(unauthorized).createRecommendation("unauthorized proposal")).to.be.reverted;

    const thresholdConfig = {
      elevatedCpi: ethers.parseUnits("120", 18),
      severeCpi: ethers.parseUnits("150", 18),
      elevatedGold: ethers.parseUnits("2000", 18),
      severeGold: ethers.parseUnits("2500", 18),
      elevatedGas: ethers.parseUnits("50", 18),
      severeGas: ethers.parseUnits("100", 18),
    };
    await expect(adapter.connect(unauthorized).setThresholds(thresholdConfig)).to.be.reverted;
    await expect(adapter.connect(kernel).setThresholds(thresholdConfig)).to.emit(adapter, "ThresholdsUpdated");

    await expect(adapter.connect(kernel).createRecommendation("missing signals")).to.be.revertedWith(
      "Fargard7PolicyAdapter: stale or invalid signal"
    );

    await priceOracle.connect(feeder1).submitPrice(KEY_GLOBAL_CPI, ethers.parseUnits("125", 18), 950);
    await priceOracle.connect(feeder2).submitPrice(KEY_GLOBAL_CPI, ethers.parseUnits("126", 18), 950);
    await priceOracle.connect(feeder3).submitPrice(KEY_GLOBAL_CPI, ethers.parseUnits("127", 18), 950);

    await priceOracle.connect(feeder1).submitPrice(KEY_USD_GOLD, ethers.parseUnits("2100", 18), 940);
    await priceOracle.connect(feeder2).submitPrice(KEY_USD_GOLD, ethers.parseUnits("2110", 18), 940);
    await priceOracle.connect(feeder3).submitPrice(KEY_USD_GOLD, ethers.parseUnits("2120", 18), 940);

    await priceOracle.connect(feeder1).submitPrice(KEY_GAS_USD, ethers.parseUnits("55", 18), 930);
    await priceOracle.connect(feeder2).submitPrice(KEY_GAS_USD, ethers.parseUnits("56", 18), 930);
    await priceOracle.connect(feeder3).submitPrice(KEY_GAS_USD, ethers.parseUnits("57", 18), 930);

    const minWage = await baseIncome.MIN_WAGE();
    const taxExemptCap = await baseIncome.TAX_EXEMPT_CAP();
    const healthBefore = await budget.getSectorBudget(0);
    const totalFeesBefore = await velocityFee.totalFeesCollected();
    const productionUnitsBefore = await productionOracle.getTotalUnits();
    const provinceBefore = await provincial.getProvince(1);

    const [previewLevel, previewValid] = await adapter.previewStressLevel();
    expect(previewValid).to.equal(true);
    expect(previewLevel).to.equal(1);

    await expect(adapter.connect(kernel).createRecommendation("Fargard 7 economic signal review"))
      .to.emit(adapter, "PolicyRecommendationCreated")
      .withArgs(
        1,
        kernel.address,
        1,
        false,
        ethers.parseUnits("126", 18),
        ethers.parseUnits("2110", 18),
        ethers.parseUnits("56", 18),
        "Fargard 7 economic signal review"
      );

    const recommendation = await adapter.getRecommendation(1);
    expect(recommendation.id).to.equal(1);
    expect(recommendation.requester).to.equal(kernel.address);
    expect(recommendation.stressLevel).to.equal(1);
    expect(recommendation.executable).to.equal(false);
    expect(recommendation.snapshot.globalCpi).to.equal(ethers.parseUnits("126", 18));
    expect(recommendation.snapshot.usdGold).to.equal(ethers.parseUnits("2110", 18));
    expect(recommendation.snapshot.gasUsd).to.equal(ethers.parseUnits("56", 18));
    expect(recommendation.snapshot.allSignalsFresh).to.equal(true);
    expect(recommendation.rationale).to.equal("Fargard 7 economic signal review");

    expect(await baseIncome.MIN_WAGE()).to.equal(minWage);
    expect(await baseIncome.TAX_EXEMPT_CAP()).to.equal(taxExemptCap);
    expect(await baseIncome.paymentCount()).to.equal(0);

    const healthAfter = await budget.getSectorBudget(0);
    expect(healthAfter.allocated).to.equal(healthBefore.allocated);
    expect(healthAfter.spent).to.equal(healthBefore.spent);
    expect(await budget.expenditureCount()).to.equal(0);

    expect(await velocityFee.totalFeesCollected()).to.equal(totalFeesBefore);
    expect((await velocityFee.getAccountStatus(monitoredAccount.address)).totalFeesPaid).to.equal(0);

    expect(await productionOracle.getTotalUnits()).to.equal(productionUnitsBefore);
    expect(await productionOracle.eligibilityCount()).to.equal(0);

    const provinceAfter = await provincial.getProvince(1);
    expect(provinceAfter.totalRevenue).to.equal(provinceBefore.totalRevenue);
    expect(provinceAfter.provincialBalance).to.equal(provinceBefore.provincialBalance);
    expect(provinceAfter.nationalContrib).to.equal(provinceBefore.nationalContrib);

    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine", []);
    await expect(adapter.connect(kernel).createRecommendation("stale signal")).to.be.revertedWith(
      "Fargard7PolicyAdapter: stale or invalid signal"
    );
    expect(await adapter.recommendationCount()).to.equal(1);

    await priceOracle.connect(kernel).invalidatePrice(KEY_GAS_USD, "adapter invalid signal test");
    await expect(adapter.connect(kernel).createRecommendation("invalid gas signal")).to.be.revertedWith(
      "Fargard7PolicyAdapter: stale or invalid signal"
    );
    expect(await adapter.recommendationCount()).to.equal(1);
  });
});
