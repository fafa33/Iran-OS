const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Provincial", function () {
let provincial;
let kernel, oracle, governor, devAccount, nationalTreasury;
let attacker;

const ORACLE_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
const GOVERNOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNOR_ROLE"));

beforeEach(async function () {
[kernel, oracle, governor, devAccount, nationalTreasury, attacker] = await ethers.getSigners();
const Provincial = await ethers.getContractFactory("Provincial");
provincial = await Provincial.deploy(kernel.address, kernel.address, nationalTreasury.address);
await provincial.waitForDeployment();
await provincial.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
});

describe("Deployment", function () {
it("باید سهم استانی ۳۰۰ باشد (۳۰٪)", async function () {
expect(await provincial.PROVINCIAL_SHARE()).to.equal(300);
});
it("باید سهم ملی ۷۰۰ باشد (۷۰٪)", async function () {
expect(await provincial.NATIONAL_SHARE()).to.equal(700);
});
it("باید تعداد استان‌ها صفر باشد", async function () {
expect(await provincial.provinceCount()).to.equal(0);
});
});

describe("Province Registration", function () {
it("باید Kernel بتواند استان ثبت کند", async function () {
await expect(
provincial.connect(kernel).registerProvince("تهران", governor.address, devAccount.address)
).to.emit(provincial, "ProvinceRegistered");
});
it("نباید غیر Kernel استان ثبت کند", async function () {
await expect(
provincial.connect(attacker).registerProvince("تست", governor.address, devAccount.address)
).to.be.reverted;
});
it("باید شمارنده استان‌ها افزایش یابد", async function () {
await provincial.connect(kernel).registerProvince("تهران", governor.address, devAccount.address);
expect(await provincial.provinceCount()).to.equal(1);
});
it("باید استاندار GOVERNOR_ROLE داشته باشد", async function () {
await provincial.connect(kernel).registerProvince("تهران", governor.address, devAccount.address);
expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.be.true;
});
it("باید امتیاز بهره‌وری اولیه ۵۰ باشد", async function () {
await provincial.connect(kernel).registerProvince("تهران", governor.address, devAccount.address);
const province = await provincial.getProvince(1);
expect(province.productivityScore).to.equal(50);
});
});

describe("Revenue Distribution", function () {
let provinceId;

beforeEach(async function () {
  await provincial.connect(kernel).registerProvince("اصفهان", governor.address, devAccount.address);
  provinceId = 1;
});

it("باید درآمد بر اساس فرمول ۳۰/۷۰ توزیع شود", async function () {
  const amount = ethers.parseUnits("1000000", 18);
  await expect(
    provincial.connect(oracle).distributeRevenue(provinceId, amount)
  ).to.emit(provincial, "RevenueDistributed");
});
it("باید سهم استانی ۳۰٪ باشد", async function () {
  const amount = ethers.parseUnits("1000000", 18);
  await provincial.connect(oracle).distributeRevenue(provinceId, amount);
  const province = await provincial.getProvince(provinceId);
  expect(province.provincialBalance).to.equal(ethers.parseUnits("300000", 18));
});
it("باید سهم ملی ۷۰٪ باشد", async function () {
  const amount = ethers.parseUnits("1000000", 18);
  await provincial.connect(oracle).distributeRevenue(provinceId, amount);
  const province = await provincial.getProvince(provinceId);
  expect(province.nationalContrib).to.equal(ethers.parseUnits("700000", 18));
});
it("نباید غیراوراکل درآمد توزیع کند", async function () {
  await expect(
    provincial.connect(attacker).distributeRevenue(provinceId, 1000)
  ).to.be.reverted;
});
it("نباید مبلغ صفر توزیع شود", async function () {
  await expect(
    provincial.connect(oracle).distributeRevenue(provinceId, 0)
  ).to.be.revertedWith("Provincial: zero amount");
});

});

describe("Productivity Score", function () {
beforeEach(async function () {
await provincial.connect(kernel).registerProvince("فارس", governor.address, devAccount.address);
});
it("باید اوراکل امتیاز بهره‌وری را به‌روز کند", async function () {
await provincial.connect(oracle).updateProductivityScore(1, 80);
const province = await provincial.getProvince(1);
expect(province.productivityScore).to.equal(80);
});
it("نباید امتیاز بالای ۱۰۰ مجاز باشد", async function () {
await expect(
provincial.connect(oracle).updateProductivityScore(1, 101)
).to.be.revertedWith("Provincial: score out of range");
});
});

describe("Step8 Provincial Boundary Remediation", function () {
it("preserves provincial boundaries across unauthorized and authorized revenue paths", async function () {
  const revenue = ethers.parseUnits("1000000", 18);
  const bonus = ethers.parseUnits("25000", 18);
  const expectedProvincialShare = (revenue * 300n) / 1000n;
  const expectedNationalShare = revenue - expectedProvincialShare;

  expect(await provincial.provinceCount()).to.equal(0);
  expect(await provincial.getProvinceByGovernor(governor.address)).to.equal(0);
  expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.be.false;

  await expect(
    provincial.connect(attacker).registerProvince("Unauthorized", governor.address, devAccount.address)
  ).to.be.reverted;
  await expect(
    provincial.connect(attacker).distributeRevenue(1, revenue)
  ).to.be.reverted;
  await expect(
    provincial.connect(attacker).updateProductivityScore(1, 80)
  ).to.be.reverted;
  await expect(
    provincial.connect(attacker).payProductivityBonus(1, bonus)
  ).to.be.reverted;

  const emptyProvince = await provincial.getProvince(1);
  expect(await provincial.provinceCount()).to.equal(0);
  expect(await provincial.getProvinceByGovernor(governor.address)).to.equal(0);
  expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.be.false;
  expect(emptyProvince.governor).to.equal(ethers.ZeroAddress);
  expect(emptyProvince.developmentAccount).to.equal(ethers.ZeroAddress);
  expect(emptyProvince.totalRevenue).to.equal(0);
  expect(emptyProvince.provincialBalance).to.equal(0);
  expect(emptyProvince.nationalContrib).to.equal(0);
  expect(emptyProvince.productivityScore).to.equal(0);
  expect(emptyProvince.isActive).to.equal(false);

  await expect(
    provincial.connect(kernel).registerProvince("Step8 Province", governor.address, devAccount.address)
  ).to.emit(provincial, "ProvinceRegistered");

  const registeredProvince = await provincial.getProvince(1);
  expect(await provincial.provinceCount()).to.equal(1);
  expect(await provincial.getProvinceByGovernor(governor.address)).to.equal(1);
  expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.be.true;
  expect(registeredProvince.governor).to.equal(governor.address);
  expect(registeredProvince.developmentAccount).to.equal(devAccount.address);
  expect(registeredProvince.totalRevenue).to.equal(0);
  expect(registeredProvince.provincialBalance).to.equal(0);
  expect(registeredProvince.nationalContrib).to.equal(0);
  expect(registeredProvince.productivityScore).to.equal(50);
  expect(registeredProvince.isActive).to.equal(true);

  await expect(
    provincial.connect(attacker).distributeRevenue(1, revenue)
  ).to.be.reverted;
  await expect(
    provincial.connect(attacker).updateProductivityScore(1, 80)
  ).to.be.reverted;
  await expect(
    provincial.connect(attacker).payProductivityBonus(1, bonus)
  ).to.be.reverted;

  const afterRejectedCalls = await provincial.getProvince(1);
  expect(afterRejectedCalls.totalRevenue).to.equal(0);
  expect(afterRejectedCalls.provincialBalance).to.equal(0);
  expect(afterRejectedCalls.nationalContrib).to.equal(0);
  expect(afterRejectedCalls.productivityScore).to.equal(50);
  expect(afterRejectedCalls.isActive).to.equal(true);

  await expect(
    provincial.connect(oracle).distributeRevenue(1, revenue)
  ).to.emit(provincial, "RevenueDistributed");

  const afterRevenue = await provincial.getProvince(1);
  expect(afterRevenue.totalRevenue).to.equal(revenue);
  expect(afterRevenue.provincialBalance).to.equal(expectedProvincialShare);
  expect(afterRevenue.nationalContrib).to.equal(expectedNationalShare);
  expect(afterRevenue.productivityScore).to.equal(50);

  await expect(
    provincial.connect(kernel).payProductivityBonus(1, bonus)
  ).to.be.revertedWith("Provincial: score too low");
  const afterLowScoreBonus = await provincial.getProvince(1);
  expect(afterLowScoreBonus.provincialBalance).to.equal(expectedProvincialShare);

  await expect(
    provincial.connect(oracle).updateProductivityScore(1, 101)
  ).to.be.revertedWith("Provincial: score out of range");
  const afterOutOfRangeScore = await provincial.getProvince(1);
  expect(afterOutOfRangeScore.productivityScore).to.equal(50);

  await provincial.connect(oracle).updateProductivityScore(1, 71);
  const afterValidScore = await provincial.getProvince(1);
  expect(afterValidScore.productivityScore).to.equal(71);

  await expect(
    provincial.connect(attacker).payProductivityBonus(1, bonus)
  ).to.be.reverted;
  const afterRejectedBonus = await provincial.getProvince(1);
  expect(afterRejectedBonus.provincialBalance).to.equal(expectedProvincialShare);

  await expect(
    provincial.connect(kernel).payProductivityBonus(1, bonus)
  ).to.emit(provincial, "ProductivityBonusPaid");

  const afterAuthorizedBonus = await provincial.getProvince(1);
  expect(afterAuthorizedBonus.totalRevenue).to.equal(revenue);
  expect(afterAuthorizedBonus.provincialBalance).to.equal(expectedProvincialShare + bonus);
  expect(afterAuthorizedBonus.nationalContrib).to.equal(expectedNationalShare);
  expect(afterAuthorizedBonus.productivityScore).to.equal(71);
});
});

describe("provincialBalance monotonic invariant", function () {
it("provincialBalance never decreases across revenue, rejected bonus, and authorized bonus operations", async function () {
  await provincial.connect(kernel).registerProvince("مازندران", governor.address, devAccount.address);
  const provinceId = 1;
  const revenue = ethers.parseUnits("1000000", 18);
  const bonus = ethers.parseUnits("25000", 18);

  let prevBalance = 0n;

  await provincial.connect(oracle).distributeRevenue(provinceId, revenue);
  let province = await provincial.getProvince(provinceId);
  expect(province.provincialBalance).to.be.gte(prevBalance);
  prevBalance = province.provincialBalance;

  await expect(
    provincial.connect(kernel).payProductivityBonus(provinceId, bonus)
  ).to.be.revertedWith("Provincial: score too low");
  province = await provincial.getProvince(provinceId);
  expect(province.provincialBalance).to.be.gte(prevBalance);
  expect(province.provincialBalance).to.equal(prevBalance);
  prevBalance = province.provincialBalance;

  await provincial.connect(oracle).updateProductivityScore(provinceId, 71);
  await provincial.connect(kernel).payProductivityBonus(provinceId, bonus);
  province = await provincial.getProvince(provinceId);
  expect(province.provincialBalance).to.be.gte(prevBalance);
  prevBalance = province.provincialBalance;

  await provincial.connect(oracle).distributeRevenue(provinceId, revenue);
  province = await provincial.getProvince(provinceId);
  expect(province.provincialBalance).to.be.gte(prevBalance);
});
});

describe("Governor Update", function () {
let newGovernor;

beforeEach(async function () {
  [, , , , , , newGovernor] = await ethers.getSigners();
  await provincial.connect(kernel).registerProvince("خراسان", governor.address, devAccount.address);
});

it("باید Kernel بتواند استاندار را تغییر دهد", async function () {
  await expect(
    provincial.connect(kernel).updateGovernor(1, newGovernor.address)
  ).to.emit(provincial, "GovernorUpdated");
});
it("باید استاندار قدیم نقش خود را از دست بدهد", async function () {
  await provincial.connect(kernel).updateGovernor(1, newGovernor.address);
  expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.be.false;
});
it("باید استاندار جدید نقش داشته باشد", async function () {
  await provincial.connect(kernel).updateGovernor(1, newGovernor.address);
  expect(await provincial.hasRole(GOVERNOR_ROLE, newGovernor.address)).to.be.true;
});

});
});
