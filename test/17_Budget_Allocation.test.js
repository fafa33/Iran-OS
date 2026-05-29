const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BudgetAllocation", function () {
let budget;
let kernel, parliament, government, auditor, oracle;
let attacker;

const PARLIAMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARLIAMENT_ROLE"));
const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));
const AUDITOR_ROLE    = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));
const ORACLE_ROLE     = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

const TOTAL = ethers.parseUnits("150000000000", 18);

beforeEach(async function () {
[kernel, parliament, government, auditor, oracle, attacker] = await ethers.getSigners();
const Budget = await ethers.getContractFactory("BudgetAllocation");
budget = await Budget.deploy(kernel.address);
await budget.waitForDeployment();
await budget.connect(kernel).grantRole(PARLIAMENT_ROLE, parliament.address);
await budget.connect(kernel).grantRole(GOVERNMENT_ROLE, government.address);
await budget.connect(kernel).grantRole(AUDITOR_ROLE, auditor.address);
await budget.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
});

describe("Deployment", function () {
it("باید بودجه کل ۱۵۰ میلیارد باشد", async function () {
expect(await budget.TOTAL_BUDGET()).to.equal(TOTAL);
});
it("باید بودجه تایید نشده باشد", async function () {
expect(await budget.budgetApproved()).to.be.false;
});
it("باید سهم بهداشت ۲۰٪ باشد", async function () {
expect(await budget.HEALTH_RATIO()).to.equal(200);
});
it("باید سهم آموزش ۲۰٪ باشد", async function () {
expect(await budget.EDUCATION_RATIO()).to.equal(200);
});
it("باید سهم دفاع ۱۵٪ باشد", async function () {
expect(await budget.DEFENSE_RATIO()).to.equal(150);
});
});

describe("Budget Approval", function () {
it("باید مجلس بتواند بودجه تصویب کند", async function () {
await expect(
budget.connect(parliament).approveBudget(1404)
).to.emit(budget, "BudgetApproved");
});
it("نباید بودجه دوبار تصویب شود", async function () {
await budget.connect(parliament).approveBudget(1404);
await expect(
budget.connect(parliament).approveBudget(1404)
).to.be.revertedWith("BudgetAllocation: approved");
});
it("نباید غیرمجلس بودجه تصویب کند", async function () {
await expect(
budget.connect(attacker).approveBudget(1404)
).to.be.reverted;
});
it("باید پس از تصویب، سهم بهداشت درست باشد", async function () {
await budget.connect(parliament).approveBudget(1404);
const sector = await budget.getSectorBudget(0); // Health
const expected = (TOTAL * 200n) / 1000n;
expect(sector.allocated).to.equal(expected);
});
it("باید پس از تصویب، سهم دفاع درست باشد", async function () {
await budget.connect(parliament).approveBudget(1404);
const sector = await budget.getSectorBudget(2); // Defense
const expected = (TOTAL * 150n) / 1000n;
expect(sector.allocated).to.equal(expected);
});
});

describe("Expenditure Recording", function () {
beforeEach(async function () {
await budget.connect(parliament).approveBudget(1404);
});
it("باید دولت بتواند هزینه ثبت کند", async function () {
const amount = ethers.parseUnits("1000000000", 18);
await expect(
budget.connect(government).recordExpenditure(0, amount, "هزینه بیمارستان")
).to.emit(budget, "ExpenditureRecorded");
});
it("نباید هزینه از سهم بخش تجاوز کند", async function () {
const overAmount = ethers.parseUnits("31000000000", 18); // بیشتر از ۳۰ میلیارد بهداشت
await expect(
budget.connect(government).recordExpenditure(0, overAmount, "تست")
).to.be.revertedWith("BudgetAllocation: exceeds budget");
});
it("نباید بدون تصویب بودجه هزینه ثبت شود", async function () {
const newBudget = await (await ethers.getContractFactory("BudgetAllocation")).deploy(kernel.address);
await newBudget.waitForDeployment();
await newBudget.connect(kernel).grantRole(GOVERNMENT_ROLE, government.address);
await expect(
newBudget.connect(government).recordExpenditure(0, 1000, "تست")
).to.be.revertedWith("BudgetAllocation: not approved");
});
});

describe("Flag Expenditure", function () {
beforeEach(async function () {
await budget.connect(parliament).approveBudget(1404);
const amount = ethers.parseUnits("1000000000", 18);
await budget.connect(government).recordExpenditure(0, amount, "هزینه");
});
it("باید حسابرس بتواند هزینه را پرچم‌گذاری کند", async function () {
await expect(
budget.connect(auditor).flagExpenditure(1, "هزینه مشکوک")
).to.emit(budget, "ExpenditureFlagged");
});
it("نباید غیرحسابرس پرچم‌گذاری کند", async function () {
await expect(
budget.connect(attacker).flagExpenditure(1, "تست")
).to.be.reverted;
});
});

describe("Sector Budget Lock", function () {
beforeEach(async function () {
await budget.connect(parliament).approveBudget(1404);
});
it("باید Kernel بتواند بخش بودجه را قفل کند", async function () {
await expect(
budget.connect(kernel).lockSectorBudget(0, "تخلف شناسایی شد")
).to.emit(budget, "SectorBudgetLocked");
});
it("نباید از بخش قفل‌شده هزینه ثبت شود", async function () {
await budget.connect(kernel).lockSectorBudget(0, "تخلف");
await expect(
budget.connect(government).recordExpenditure(0, 1000, "تست")
).to.be.revertedWith("BudgetAllocation: locked by Trigger");
});
});

describe("Step8 Budget Boundary Remediation", function () {
it("keeps unauthorized budget actions state-neutral while allocation spend flag and lock controls work", async function () {
const initialHealth = await budget.getSectorBudget(0);
const initialDefense = await budget.getSectorBudget(2);
const initialApproved = await budget.budgetApproved();
const initialFiscalYear = await budget.currentFiscalYear();
const initialExpenditureCount = await budget.expenditureCount();

await expect(
budget.connect(attacker).approveBudget(1404)
).to.be.reverted;

await expect(
budget.connect(attacker).recordExpenditure(0, ethers.parseUnits("1", 18), "unauthorized spend")
).to.be.reverted;

await expect(
budget.connect(attacker).lockSectorBudget(0, "unauthorized lock")
).to.be.reverted;

let health = await budget.getSectorBudget(0);
let defense = await budget.getSectorBudget(2);
expect(await budget.budgetApproved()).to.equal(initialApproved);
expect(await budget.currentFiscalYear()).to.equal(initialFiscalYear);
expect(await budget.expenditureCount()).to.equal(initialExpenditureCount);
expect(health.allocated).to.equal(initialHealth.allocated);
expect(health.spent).to.equal(initialHealth.spent);
expect(health.isLocked).to.equal(initialHealth.isLocked);
expect(defense.allocated).to.equal(initialDefense.allocated);
expect(defense.spent).to.equal(initialDefense.spent);
expect(defense.isLocked).to.equal(initialDefense.isLocked);

await expect(
budget.connect(parliament).approveBudget(1404)
).to.emit(budget, "BudgetApproved");

health = await budget.getSectorBudget(0);
defense = await budget.getSectorBudget(2);
expect(health.allocated).to.equal((TOTAL * 200n) / 1000n);
expect(defense.allocated).to.equal((TOTAL * 150n) / 1000n);
expect(health.spent).to.equal(0);
expect(defense.spent).to.equal(0);

const spendAmount = ethers.parseUnits("1000000000", 18);
await expect(
budget.connect(government).recordExpenditure(0, spendAmount, "Step8 health spend")
).to.emit(budget, "ExpenditureRecorded");

health = await budget.getSectorBudget(0);
expect(health.spent).to.equal(spendAmount);
expect(await budget.expenditureCount()).to.equal(1);

await expect(
budget.connect(government).recordExpenditure(0, health.allocated - health.spent + 1n, "Step8 overspend")
).to.be.revertedWith("BudgetAllocation: exceeds budget");

health = await budget.getSectorBudget(0);
expect(health.spent).to.equal(spendAmount);
expect(await budget.expenditureCount()).to.equal(1);

await expect(
budget.connect(attacker).flagExpenditure(1, "unauthorized flag")
).to.be.reverted;
expect((await budget.expenditures(1)).flagged).to.be.false;

await expect(
budget.connect(auditor).flagExpenditure(1, "Step8 audit flag")
).to.emit(budget, "ExpenditureFlagged");
expect((await budget.expenditures(1)).flagged).to.be.true;

await expect(
budget.connect(kernel).lockSectorBudget(2, "Step8 defense lock")
).to.emit(budget, "SectorBudgetLocked");

defense = await budget.getSectorBudget(2);
expect(defense.isLocked).to.be.true;
expect(defense.spent).to.equal(0);

await expect(
budget.connect(government).recordExpenditure(2, ethers.parseUnits("1", 18), "locked defense spend")
).to.be.revertedWith("BudgetAllocation: locked by Trigger");

defense = await budget.getSectorBudget(2);
expect(defense.spent).to.equal(0);
});
});

describe("TINV-09/TINV-10 Sector Arithmetic Invariants", function () {
it("TINV-09: eight sector ratios sum to exactly 1000", async function () {
const ratioSum =
  (await budget.HEALTH_RATIO()) +
  (await budget.EDUCATION_RATIO()) +
  (await budget.DEFENSE_RATIO()) +
  (await budget.INFRASTRUCTURE_RATIO()) +
  (await budget.WELFARE_RATIO()) +
  (await budget.JUSTICE_RATIO()) +
  (await budget.ENVIRONMENT_RATIO()) +
  (await budget.ADMINISTRATION_RATIO());
expect(ratioSum).to.equal(1000n);
});

it("TINV-10: approveBudget distributes exactly TOTAL_BUDGET with no remainder", async function () {
await budget.connect(parliament).approveBudget(1404);
let totalAllocated = 0n;
for (let i = 0; i < 8; i++) {
  const sector = await budget.getSectorBudget(i);
  totalAllocated += sector.allocated;
}
expect(totalAllocated).to.equal(await budget.TOTAL_BUDGET());
});
});

describe("P-01 State-Neutrality Invariants", function () {
it("P-01: recordExpenditure revert on not-approved budget leaves spent and expenditureCount unchanged", async function () {
  expect(await budget.budgetApproved()).to.be.false;

  const sectorBefore = await budget.getSectorBudget(0);
  const countBefore  = await budget.expenditureCount();

  await expect(
    budget.connect(government).recordExpenditure(0, ethers.parseUnits("1000", 18), "P-01 test")
  ).to.be.revertedWith("BudgetAllocation: not approved");

  const sectorAfter = await budget.getSectorBudget(0);
  const countAfter  = await budget.expenditureCount();
  const expRecord   = await budget.expenditures(1);

  expect(sectorAfter.spent).to.equal(sectorBefore.spent);
  expect(sectorAfter.spent).to.equal(0n);
  expect(countAfter).to.equal(countBefore);
  expect(countAfter).to.equal(0n);
  expect(expRecord.timestamp).to.equal(0n);
});
});
});
