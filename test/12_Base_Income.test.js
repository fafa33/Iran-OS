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
});