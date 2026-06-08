const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseIncome", function () {
let baseIncome;
let kernel, oracle, employer, swf;
let employee1, employee2, attacker;

const ORACLE_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
const EMPLOYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EMPLOYER_ROLE"));
const SWF_ROLE      = ethers.keccak256(ethers.toUtf8Bytes("SWF_ROLE"));

const MIN_WAGE = ethers.parseUnits("1000", 18);

beforeEach(async function () {
[kernel, oracle, employer, swf, employee1, employee2, attacker] = await ethers.getSigners();
const BaseIncome = await ethers.getContractFactory("BaseIncome");
baseIncome = await BaseIncome.deploy(kernel.address);
await baseIncome.waitForDeployment();
await baseIncome.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
await baseIncome.connect(kernel).grantRole(SWF_ROLE, swf.address);
});

describe("Deployment", function () {
it("باید حداقل حقوق ۱۰۰۰ پهلوی باشد", async function () {
expect(await baseIncome.MIN_WAGE()).to.equal(MIN_WAGE);
});
it("باید معافیت مالیاتی ۱۰۰۰ پهلوی باشد", async function () {
expect(await baseIncome.TAX_EXEMPT_CAP()).to.equal(MIN_WAGE);
});
it("نباید کرنل آدرس صفر باشد", async function () {
const BaseIncome = await ethers.getContractFactory("BaseIncome");
await expect(
BaseIncome.deploy(ethers.ZeroAddress)
).to.be.revertedWith("BaseIncome: invalid kernel");
});
});

describe("Employer Registration", function () {
it("باید اوراکل بتواند کارفرما ثبت کند", async function () {
await expect(
baseIncome.connect(oracle).registerEmployer(employer.address, 10)
).to.emit(baseIncome, "EmployerRegistered");
});
it("نباید غیراوراکل کارفرما ثبت کند", async function () {
await expect(
baseIncome.connect(attacker).registerEmployer(employer.address, 10)
).to.be.reverted;
});
it("نباید کارفرما آدرس صفر باشد", async function () {
await expect(
baseIncome.connect(oracle).registerEmployer(ethers.ZeroAddress, 10)
).to.be.revertedWith("BaseIncome: invalid employer");
});
it("نباید تعداد کارمندان صفر باشد", async function () {
await expect(
baseIncome.connect(oracle).registerEmployer(employer.address, 0)
).to.be.revertedWith("BaseIncome: zero employees");
});
it("نباید کارفرما دوبار ثبت شود", async function () {
await baseIncome.connect(oracle).registerEmployer(employer.address, 10);
await expect(
baseIncome.connect(oracle).registerEmployer(employer.address, 10)
).to.be.revertedWith("BaseIncome: registered");
});
it("باید پس از ثبت، EMPLOYER_ROLE اعطا شود", async function () {
await baseIncome.connect(oracle).registerEmployer(employer.address, 10);
expect(await baseIncome.hasRole(EMPLOYER_ROLE, employer.address)).to.be.true;
});
});

describe("Wage Payment Recording", function () {
beforeEach(async function () {
await baseIncome.connect(oracle).registerEmployer(employer.address, 10);
});
it("باید کارفرما بتواند پرداخت حقوق ثبت کند", async function () {
await expect(
baseIncome.connect(employer).recordWagePayment(employee1.address, MIN_WAGE)
).to.emit(baseIncome, "WagePaymentRecorded");
});
it("باید پرداخت برابر حداقل حقوق سازگار باشد", async function () {
await baseIncome.connect(employer).recordWagePayment(employee1.address, MIN_WAGE);
const emp = await baseIncome.getEmployerRecord(employer.address);
expect(emp.isCompliant).to.be.true;
});
it("باید پرداخت کمتر از حداقل حقوق ناسازگار باشد", async function () {
const lowWage = ethers.parseUnits("500", 18);
await expect(
baseIncome.connect(employer).recordWagePayment(employee1.address, lowWage)
).to.emit(baseIncome, "EmployerNonCompliant");
});
it("نباید غیرکارفرما پرداخت ثبت کند", async function () {
await expect(
baseIncome.connect(attacker).recordWagePayment(employee1.address, MIN_WAGE)
).to.be.reverted;
});
it("نباید کارمند آدرس صفر باشد", async function () {
await expect(
baseIncome.connect(employer).recordWagePayment(ethers.ZeroAddress, MIN_WAGE)
).to.be.revertedWith("BaseIncome: invalid employee");
});
it("نباید مبلغ صفر مجاز باشد", async function () {
await expect(
baseIncome.connect(employer).recordWagePayment(employee1.address, 0)
).to.be.revertedWith("BaseIncome: zero amount");
});
});

describe("Subsidy", function () {
beforeEach(async function () {
await baseIncome.connect(oracle).registerEmployer(employer.address, 10);
});
it("باید صندوق ثروت ملی بتواند کمک اعطا کند", async function () {
await expect(
baseIncome.connect(swf).grantSubsidy(employer.address, MIN_WAGE)
).to.emit(baseIncome, "SubsidyGranted");
});
it("باید صندوق بتواند کمک را لغو کند", async function () {
await baseIncome.connect(swf).grantSubsidy(employer.address, MIN_WAGE);
await expect(
baseIncome.connect(swf).revokeSubsidy(employer.address)
).to.emit(baseIncome, "SubsidyRevoked");
});
it("نباید کمک کارفرمای ثبت‌نشده لغو شود", async function () {
await expect(
baseIncome.connect(swf).revokeSubsidy(employee2.address)
).to.be.revertedWith("BaseIncome: not registered");
});
it("نباید مبلغ کمک صفر باشد", async function () {
await expect(
baseIncome.connect(swf).grantSubsidy(employer.address, 0)
).to.be.revertedWith("BaseIncome: zero subsidy");
});
it("نباید به کارفرمای ثبت‌نشده کمک اعطا شود", async function () {
await expect(
baseIncome.connect(swf).grantSubsidy(employee2.address, MIN_WAGE)
).to.be.revertedWith("BaseIncome: not registered");
});
it("نباید غیر صندوق کمک اعطا کند", async function () {
await expect(
baseIncome.connect(attacker).grantSubsidy(employer.address, MIN_WAGE)
).to.be.reverted;
});
});

describe("Tax Exemption", function () {
it("باید حداقل حقوق از مالیات معاف باشد", async function () {
expect(await baseIncome.isWageTaxExempt(MIN_WAGE)).to.be.true;
});
it("باید بالای حداقل حقوق مشمول مالیات باشد", async function () {
const aboveCap = ethers.parseUnits("1001", 18);
expect(await baseIncome.isWageTaxExempt(aboveCap)).to.be.false;
});
});

describe("Step8 Welfare Boundary Remediation", function () {
it("keeps unauthorized welfare actions state-neutral while authorized employer subsidy and tax paths work", async function () {
const minWageBefore = await baseIncome.MIN_WAGE();
const taxExemptCapBefore = await baseIncome.TAX_EXEMPT_CAP();
const paymentCountBefore = await baseIncome.paymentCount();
const compliantBefore = await baseIncome.totalCompliantEmployers();
const nonCompliantBefore = await baseIncome.totalNonCompliantEmployers();
const employerBefore = await baseIncome.getEmployerRecord(employer.address);

await expect(
baseIncome.connect(attacker).registerEmployer(employer.address, 10)
).to.be.reverted;

await expect(
baseIncome.connect(attacker).recordWagePayment(employee1.address, MIN_WAGE)
).to.be.reverted;

await expect(
baseIncome.connect(attacker).grantSubsidy(employer.address, MIN_WAGE)
).to.be.reverted;

let employerRecord = await baseIncome.getEmployerRecord(employer.address);
expect(employerRecord.employer).to.equal(employerBefore.employer);
expect(employerRecord.employeeCount).to.equal(employerBefore.employeeCount);
expect(employerRecord.totalPaidThisMonth).to.equal(employerBefore.totalPaidThisMonth);
expect(employerRecord.lastPaymentTime).to.equal(employerBefore.lastPaymentTime);
expect(employerRecord.isCompliant).to.equal(employerBefore.isCompliant);
expect(employerRecord.receivesSubsidy).to.equal(employerBefore.receivesSubsidy);
expect(employerRecord.subsidyAmount).to.equal(employerBefore.subsidyAmount);
expect(employerRecord.isRegistered).to.equal(employerBefore.isRegistered);
expect(await baseIncome.paymentCount()).to.equal(paymentCountBefore);
expect(await baseIncome.totalCompliantEmployers()).to.equal(compliantBefore);
expect(await baseIncome.totalNonCompliantEmployers()).to.equal(nonCompliantBefore);
expect(await baseIncome.MIN_WAGE()).to.equal(minWageBefore);
expect(await baseIncome.TAX_EXEMPT_CAP()).to.equal(taxExemptCapBefore);

await expect(
baseIncome.connect(oracle).registerEmployer(employer.address, 10)
).to.emit(baseIncome, "EmployerRegistered");

await expect(
baseIncome.connect(employer).recordWagePayment(employee1.address, MIN_WAGE)
).to.emit(baseIncome, "WagePaymentRecorded");

employerRecord = await baseIncome.getEmployerRecord(employer.address);
expect(employerRecord.isRegistered).to.be.true;
expect(employerRecord.isCompliant).to.be.true;
expect(employerRecord.totalPaidThisMonth).to.equal(MIN_WAGE);
expect(await baseIncome.paymentCount()).to.equal(paymentCountBefore + 1n);

await expect(
baseIncome.connect(swf).grantSubsidy(employer.address, MIN_WAGE)
).to.emit(baseIncome, "SubsidyGranted");

employerRecord = await baseIncome.getEmployerRecord(employer.address);
expect(employerRecord.receivesSubsidy).to.be.true;
expect(employerRecord.subsidyAmount).to.equal(MIN_WAGE);

await expect(
baseIncome.connect(attacker).revokeSubsidy(employer.address)
).to.be.reverted;

employerRecord = await baseIncome.getEmployerRecord(employer.address);
expect(employerRecord.receivesSubsidy).to.be.true;
expect(employerRecord.subsidyAmount).to.equal(MIN_WAGE);

await expect(
baseIncome.connect(swf).revokeSubsidy(employer.address)
).to.emit(baseIncome, "SubsidyRevoked");

employerRecord = await baseIncome.getEmployerRecord(employer.address);
expect(employerRecord.receivesSubsidy).to.be.false;
expect(employerRecord.subsidyAmount).to.equal(0);
expect(await baseIncome.isWageTaxExempt(MIN_WAGE)).to.be.true;
expect(await baseIncome.isWageTaxExempt(MIN_WAGE + 1n)).to.be.false;
expect(await baseIncome.MIN_WAGE()).to.equal(minWageBefore);
expect(await baseIncome.TAX_EXEMPT_CAP()).to.equal(taxExemptCapBefore);
});
});
});
