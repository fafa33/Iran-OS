const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthCoverage", function () {
let health;
let kernel, healthAdmin, provider, pharmacy, swf;
let citizen1, citizen2, attacker;

const HEALTH_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("HEALTH_ROLE"));
const PROVIDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROVIDER_ROLE"));
const PHARMACY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PHARMACY_ROLE"));
const SWF_ROLE      = ethers.keccak256(ethers.toUtf8Bytes("SWF_ROLE"));

const ANNUAL_CREDIT = ethers.parseUnits("500", 18);
const DRUG_QUOTA    = ethers.parseUnits("100", 18);
const MATERNITY_PAY = ethers.parseUnits("6000", 18);

beforeEach(async function () {
[kernel, healthAdmin, provider, pharmacy, swf, citizen1, citizen2, attacker] = await ethers.getSigners();
const Health = await ethers.getContractFactory("HealthCoverage");
health = await Health.deploy(kernel.address);
await health.waitForDeployment();
await health.connect(kernel).grantRole(HEALTH_ROLE, healthAdmin.address);
await health.connect(kernel).grantRole(SWF_ROLE, swf.address);
// ثبت مرکز درمانی
await health.connect(kernel).registerProvider(provider.address, "بیمارستان ملی");
await health.connect(kernel).grantRole(PHARMACY_ROLE, pharmacy.address);
});

describe("Deployment", function () {
it("باید اعتبار سلامت سالانه ۵۰۰ پهلوی باشد", async function () {
expect(await health.ANNUAL_HEALTH_CREDIT()).to.equal(ANNUAL_CREDIT);
});
it("باید سهمیه دارو ماهانه ۱۰۰ پهلوی باشد", async function () {
expect(await health.MONTHLY_DRUG_QUOTA()).to.equal(DRUG_QUOTA);
});
it("باید مرخصی زایمان ۶۰۰۰ پهلوی باشد (۶ ماه)", async function () {
expect(await health.MATERNITY_LEAVE_PAY()).to.equal(MATERNITY_PAY);
});
it("نباید کرنل آدرس صفر باشد", async function () {
const Health = await ethers.getContractFactory("HealthCoverage");
await expect(
Health.deploy(ethers.ZeroAddress)
).to.be.revertedWith("HealthCoverage: invalid kernel");
});
});

describe("Health Wallet Creation", function () {
it("باید کیف پول سلامت ساخته شود", async function () {
await expect(
health.connect(healthAdmin).createHealthWallet(citizen1.address)
).to.emit(health, "HealthWalletCreated");
});
it("نباید کیف پول دوباره ساخته شود", async function () {
await health.connect(healthAdmin).createHealthWallet(citizen1.address);
await expect(
health.connect(healthAdmin).createHealthWallet(citizen1.address)
).to.be.revertedWith("HealthCoverage: exists");
});
it("باید اعتبار اولیه درست باشد", async function () {
await health.connect(healthAdmin).createHealthWallet(citizen1.address);
const wallet = await health.getHealthWallet(citizen1.address);
expect(wallet.annualCredit).to.equal(ANNUAL_CREDIT);
expect(wallet.monthlyDrugQuota).to.equal(DRUG_QUOTA);
expect(wallet.isActive).to.be.true;
});
it("نباید شهروند آدرس صفر باشد", async function () {
await expect(
health.connect(healthAdmin).createHealthWallet(ethers.ZeroAddress)
).to.be.revertedWith("HealthCoverage: invalid citizen");
});
it("نباید غیر HEALTH_ROLE کیف پول بسازد", async function () {
await expect(
health.connect(attacker).createHealthWallet(citizen1.address)
).to.be.reverted;
});
});

describe("Health Credit Usage", function () {
beforeEach(async function () {
await health.connect(healthAdmin).createHealthWallet(citizen1.address);
});
it("باید مرکز درمانی بتواند اعتبار استفاده کند", async function () {
const amount = ethers.parseUnits("100", 18);
await expect(
health.connect(provider).useHealthCredit(citizen1.address, amount, provider.address)
).to.emit(health, "HealthCreditUsed");
});
it("نباید اعتبار بیشتر از موجودی برداشت شود", async function () {
const overAmount = ethers.parseUnits("600", 18);
await expect(
health.connect(provider).useHealthCredit(citizen1.address, overAmount, provider.address)
).to.be.revertedWith("HealthCoverage: insufficient credit");
});
it("باید پس از استفاده اعتبار کاهش یابد", async function () {
const amount = ethers.parseUnits("100", 18);
await health.connect(provider).useHealthCredit(citizen1.address, amount, provider.address);
const wallet = await health.getHealthWallet(citizen1.address);
expect(wallet.annualCredit).to.equal(ANNUAL_CREDIT - amount);
});
});

describe("Drug Quota Usage", function () {
beforeEach(async function () {
await health.connect(healthAdmin).createHealthWallet(citizen1.address);
});
it("باید داروخانه بتواند سهمیه استفاده کند", async function () {
const amount = ethers.parseUnits("50", 18);
await expect(
health.connect(pharmacy).useDrugQuota(citizen1.address, amount, pharmacy.address)
).to.emit(health, "DrugQuotaUsed");
});
it("نباید سهمیه بیشتر از موجودی برداشت شود", async function () {
const overAmount = ethers.parseUnits("200", 18);
await expect(
health.connect(pharmacy).useDrugQuota(citizen1.address, overAmount, pharmacy.address)
).to.be.revertedWith("HealthCoverage: insufficient quota");
});
});

describe("Maternity Leave", function () {
it("باید مرخصی زایمان اعطا شود", async function () {
await expect(
health.connect(healthAdmin).grantMaternityLeave(citizen1.address)
).to.emit(health, "MaternityLeaveGranted");
});
it("باید مبلغ مرخصی زایمان درست باشد", async function () {
await health.connect(healthAdmin).grantMaternityLeave(citizen1.address);
const leave = await health.getMaternityLeave(1);
expect(leave.totalPayment).to.equal(MATERNITY_PAY);
expect(leave.parent).to.equal(citizen1.address);
});
it("نباید والد آدرس صفر باشد", async function () {
await expect(
health.connect(healthAdmin).grantMaternityLeave(ethers.ZeroAddress)
).to.be.revertedWith("HealthCoverage: invalid parent");
});
});

describe("Provider Registration", function () {
it("نباید ارائه‌دهنده آدرس صفر باشد", async function () {
await expect(
health.connect(kernel).registerProvider(ethers.ZeroAddress, "test")
).to.be.revertedWith("HealthCoverage: invalid provider");
});
});

describe("Strategic Reserve", function () {
it("باید صندوق ثروت ملی ذخیره استراتژیک را به‌روز کند", async function () {
const amount = ethers.parseUnits("100000000000", 18);
await expect(
health.connect(swf).updateStrategicReserve(amount)
).to.emit(health, "StrategicReserveUpdated");
});
});
});