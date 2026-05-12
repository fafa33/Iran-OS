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
});