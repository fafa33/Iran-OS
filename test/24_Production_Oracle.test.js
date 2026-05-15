const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductionOracle", function () {
let oracle;
let kernel, feeder, bank;
let unit1, unit2, attacker;

const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));
const BANK_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("BANK_ROLE"));

beforeEach(async function () {
[kernel, feeder, bank, unit1, unit2, attacker] = await ethers.getSigners();
const Oracle = await ethers.getContractFactory("ProductionOracle");
oracle = await Oracle.deploy(kernel.address);
await oracle.waitForDeployment();
await oracle.connect(kernel).grantRole(FEEDER_ROLE, feeder.address);
await oracle.connect(kernel).grantRole(BANK_ROLE, bank.address);
});

describe("Deployment", function () {
it("باید آستانه پیشران ۷۰ باشد", async function () {
expect(await oracle.PIONEER_THRESHOLD()).to.equal(70);
});
it("باید آستانه گذار ۵۰ باشد", async function () {
expect(await oracle.TRANSITION_THRESHOLD()).to.equal(50);
});
it("باید وزن اشتغال ۳۰٪ باشد", async function () {
expect(await oracle.EMPLOYMENT_WEIGHT()).to.equal(300);
});
it("باید تعداد واحدها صفر باشد", async function () {
expect(await oracle.getTotalUnits()).to.equal(0);
});
});

describe("Unit Registration", function () {
it("باید feeder بتواند واحد تولیدی ثبت کند", async function () {
await expect(
oracle.connect(feeder).registerUnit(unit1.address, "کارخانه فولاد")
).to.emit(oracle, "UnitRegistered");
});
it("نباید واحد دوبار ثبت شود", async function () {
await oracle.connect(feeder).registerUnit(unit1.address, "کارخانه");
await expect(
oracle.connect(feeder).registerUnit(unit1.address, "کارخانه")
).to.be.revertedWith("ProductionOracle: registered");
});
it("نباید غیر feeder واحد ثبت کند", async function () {
await expect(
oracle.connect(attacker).registerUnit(unit1.address, "تست")
).to.be.reverted;
});
it("باید تعداد واحدها افزایش یابد", async function () {
await oracle.connect(feeder).registerUnit(unit1.address, "کارخانه");
expect(await oracle.getTotalUnits()).to.equal(1);
});
it("باید امتیاز اولیه ۵۰ باشد (در حال گذار)", async function () {
await oracle.connect(feeder).registerUnit(unit1.address, "کارخانه");
const unit = await oracle.getUnit(unit1.address);
expect(unit.compositeScore).to.equal(50);
expect(unit.category).to.equal(1); // Transition
});
});

describe("Production Data Update", function () {
beforeEach(async function () {
await oracle.connect(feeder).registerUnit(unit1.address, "کارخانه فولاد");
});

it("باید داده تولید به‌روز شود", async function () {
  await expect(
    oracle.connect(feeder).updateProductionData(unit1.address, 200, ethers.parseUnits("1000000", 18), 80, 90)
  ).to.emit(oracle, "ProductionDataUpdated");
});

it("باید واحد با امتیاز بالا پیشران شود", async function () {
  // employeeCount=100+, monthlyValue>0, renewal=100, compliance=100 → امتیاز بالا
  await oracle.connect(feeder).updateProductionData(
    unit1.address, 150, ethers.parseUnits("1000000", 18), 100, 100
  );
  const unit = await oracle.getUnit(unit1.address);
  expect(unit.category).to.equal(0); // Pioneer
});

it("باید واحد با امتیاز پایین بحرانی شود", async function () {
  await oracle.connect(feeder).updateProductionData(
    unit1.address, 0, 0, 0, 0
  );
  const unit = await oracle.getUnit(unit1.address);
  expect(unit.category).to.equal(2); // Critical
});

it("نباید امتیاز بیشتر از ۱۰۰ مجاز باشد", async function () {
  await expect(
    oracle.connect(feeder).updateProductionData(unit1.address, 100, 1000, 101, 90)
  ).to.be.revertedWith("ProductionOracle: invalid score");
});

it("باید تغییر دسته رویداد CategoryChanged منتشر کند", async function () {
  // ابتدا پیشران کن
  await oracle.connect(feeder).updateProductionData(
    unit1.address, 150, ethers.parseUnits("1000000", 18), 100, 100
  );
  // بعد بحرانی کن
  await expect(
    oracle.connect(feeder).updateProductionData(unit1.address, 0, 0, 0, 0)
  ).to.emit(oracle, "CategoryChanged");
});

});

describe("Loan Eligibility", function () {
beforeEach(async function () {
await oracle.connect(feeder).registerUnit(unit1.address, "کارخانه");
await oracle.connect(feeder).updateProductionData(
unit1.address, 150, ethers.parseUnits("1000000", 18), 100, 100
);
});

it("باید بانک بتواند اهلیت تسهیلات اعطا کند", async function () {
  await expect(
    oracle.connect(bank).grantLoanEligibility(unit1.address)
  ).to.emit(oracle, "LoanEligibilityGranted");
});

it("باید پیشران‌ها نرخ بهره کمتری داشته باشند", async function () {
  await oracle.connect(bank).grantLoanEligibility(unit1.address);
  const eligibility = await oracle.getLoanEligibility(1);
  expect(eligibility.interestRate).to.equal(10); // ۱٪ برای پیشران
});

it("نباید واحد بحرانی اهلیت داشته باشد", async function () {
  await oracle.connect(feeder).registerUnit(unit2.address, "کارخانه بحرانی");
  await oracle.connect(feeder).updateProductionData(unit2.address, 0, 0, 0, 0);
  await expect(
    oracle.connect(bank).grantLoanEligibility(unit2.address)
  ).to.be.revertedWith("ProductionOracle: not eligible");
});

});

describe("Critical Subsidy", function () {
beforeEach(async function () {
await oracle.connect(feeder).registerUnit(unit1.address, "کارخانه بحرانی");
await oracle.connect(feeder).updateProductionData(unit1.address, 0, 0, 0, 0);
});

it("باید بانک بتواند به واحد بحرانی حمایت بدهد", async function () {
  await expect(
    oracle.connect(bank).grantCriticalSubsidy(unit1.address)
  ).to.emit(oracle, "SubsidyGranted");
});

it("باید مدت حمایت ۶ ماه باشد", async function () {
  await oracle.connect(bank).grantCriticalSubsidy(unit1.address);
  const unit = await oracle.getUnit(unit1.address);
  expect(unit.subsidyMonthsRemaining).to.equal(6);
});

it("نباید به واحد غیربحرانی حمایت داد", async function () {
  await oracle.connect(feeder).registerUnit(unit2.address, "پیشران");
  await oracle.connect(feeder).updateProductionData(
    unit2.address, 150, ethers.parseUnits("1000000", 18), 100, 100
  );
  await expect(
    oracle.connect(bank).grantCriticalSubsidy(unit2.address)
  ).to.be.revertedWith("ProductionOracle: not critical");
});

});
});