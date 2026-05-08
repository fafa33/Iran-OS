const { expect } = require(“chai”);
const { ethers } = require(“hardhat”);

describe(“Provincial”, function () {
let provincial;
let kernel, oracle, governor, devAccount, nationalTreasury;
let attacker;

const ORACLE_ROLE   = ethers.keccak256(ethers.toUtf8Bytes(“ORACLE_ROLE”));
const GOVERNOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes(“GOVERNOR_ROLE”));

beforeEach(async function () {
[kernel, oracle, governor, devAccount, nationalTreasury, attacker] = await ethers.getSigners();
const Provincial = await ethers.getContractFactory(“Provincial”);
provincial = await Provincial.deploy(kernel.address, nationalTreasury.address);
await provincial.waitForDeployment();
await provincial.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
});

describe(“Deployment”, function () {
it(“باید سهم استانی ۳۰۰ باشد (۳۰٪)”, async function () {
expect(await provincial.PROVINCIAL_SHARE()).to.equal(300);
});
it(“باید سهم ملی ۷۰۰ باشد (۷۰٪)”, async function () {
expect(await provincial.NATIONAL_SHARE()).to.equal(700);
});
it(“باید تعداد استان‌ها صفر باشد”, async function () {
expect(await provincial.provinceCount()).to.equal(0);
});
});

describe(“Province Registration”, function () {
it(“باید Kernel بتواند استان ثبت کند”, async function () {
await expect(
provincial.connect(kernel).registerProvince(“تهران”, governor.address, devAccount.address)
).to.emit(provincial, “ProvinceRegistered”);
});
it(“نباید غیر Kernel استان ثبت کند”, async function () {
await expect(
provincial.connect(attacker).registerProvince(“تست”, governor.address, devAccount.address)
).to.be.reverted;
});
it(“باید شمارنده استان‌ها افزایش یابد”, async function () {
await provincial.connect(kernel).registerProvince(“تهران”, governor.address, devAccount.address);
expect(await provincial.provinceCount()).to.equal(1);
});
it(“باید استاندار GOVERNOR_ROLE داشته باشد”, async function () {
await provincial.connect(kernel).registerProvince(“تهران”, governor.address, devAccount.address);
expect(await provincial.hasRole(GOVERNOR_ROLE, governor.address)).to.be.true;
});
it(“باید امتیاز بهره‌وری اولیه ۵۰ باشد”, async function () {
await provincial.connect(kernel).registerProvince(“تهران”, governor.address, devAccount.address);
const province = await provincial.getProvince(1);
expect(province.productivityScore).to.equal(50);
});
});

describe(“Revenue Distribution”, function () {
let provinceId;

```
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
```

});

describe(“Productivity Score”, function () {
beforeEach(async function () {
await provincial.connect(kernel).registerProvince(“فارس”, governor.address, devAccount.address);
});
it(“باید اوراکل امتیاز بهره‌وری را به‌روز کند”, async function () {
await provincial.connect(oracle).updateProductivityScore(1, 80);
const province = await provincial.getProvince(1);
expect(province.productivityScore).to.equal(80);
});
it(“نباید امتیاز بالای ۱۰۰ مجاز باشد”, async function () {
await expect(
provincial.connect(oracle).updateProductivityScore(1, 101)
).to.be.revertedWith(“Provincial: score out of range”);
});
});

describe(“Governor Update”, function () {
let newGovernor;

```
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
```

});
});