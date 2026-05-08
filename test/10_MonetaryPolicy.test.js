const { expect } = require(“chai”);
const { ethers } = require(“hardhat”);

describe(“MonetaryPolicy”, function () {
let policy;
let kernel, swf, centralBank, oracle;
let attacker;

const SWF_ROLE          = ethers.keccak256(ethers.toUtf8Bytes(“SWF_ROLE”));
const CENTRAL_BANK_ROLE = ethers.keccak256(ethers.toUtf8Bytes(“CENTRAL_BANK_ROLE”));
const ORACLE_ROLE       = ethers.keccak256(ethers.toUtf8Bytes(“ORACLE_ROLE”));

const LIQUIDITY_CAP = ethers.parseUnits(“900000000000”, 18);
const ONE_PAH_USD   = ethers.parseUnits(“1”, 18);

beforeEach(async function () {
[kernel, swf, centralBank, oracle, attacker] = await ethers.getSigners();
const Policy = await ethers.getContractFactory(“MonetaryPolicy”);
policy = await Policy.deploy(kernel.address);
await policy.waitForDeployment();
await policy.connect(kernel).grantRole(SWF_ROLE, swf.address);
await policy.connect(kernel).grantRole(CENTRAL_BANK_ROLE, centralBank.address);
await policy.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
});

describe(“Deployment”, function () {
it(“باید سقف نقدینگی ۹۰۰ میلیارد باشد”, async function () {
expect(await policy.LIQUIDITY_CAP()).to.equal(LIQUIDITY_CAP);
});
it(“باید نسبت پشتوانه حداقل ۳۳۳ باشد”, async function () {
expect(await policy.MIN_RESERVE_RATIO()).to.equal(333);
});
it(“باید نرخ پهلوی به دلار ۱ باشد”, async function () {
expect(await policy.pahlaviUSDRate()).to.equal(ONE_PAH_USD);
});
it(“باید مینتینگ فعال باشد”, async function () {
expect(await policy.mintingPaused()).to.be.false;
});
it(“باید گردش در ابتدا صفر باشد”, async function () {
expect(await policy.currentCirculation()).to.equal(0);
});
});

describe(“Update Reserves”, function () {
it(“باید صندوق ثروت ملی بتواند ذخایر را به‌روز کند”, async function () {
const reserves = ethers.parseUnits(“300000000000”, 18);
await expect(
policy.connect(swf).updateReserves(reserves)
).to.emit(policy, “ReservesUpdated”);
});
it(“نباید غیر صندوق ذخایر را به‌روز کند”, async function () {
await expect(
policy.connect(attacker).updateReserves(1000)
).to.be.reverted;
});
it(“باید Proof of Reserve به‌روز شود”, async function () {
const reserves = ethers.parseUnits(“300000000000”, 18);
await policy.connect(swf).updateReserves(reserves);
expect(await policy.currentReserves()).to.equal(reserves);
});
});

describe(“Mint Request”, function () {
beforeEach(async function () {
// ابتدا ذخایر کافی ثبت کنیم
const reserves = ethers.parseUnits(“300000000000”, 18);
await policy.connect(swf).updateReserves(reserves);
});

```
it("باید صندوق ثروت ملی بتواند درخواست mint بدهد", async function () {
  const amount = ethers.parseUnits("100000000000", 18);
  const proof  = ethers.parseUnits("300000000000", 18);
  await expect(
    policy.connect(swf).requestMint(amount, proof)
  ).to.emit(policy, "MintRequested");
});
it("نباید غیر صندوق درخواست mint بدهد", async function () {
  await expect(
    policy.connect(attacker).requestMint(1000, 1000)
  ).to.be.reverted;
});
it("نباید مبلغ صفر مجاز باشد", async function () {
  await expect(
    policy.connect(swf).requestMint(0, 1000)
  ).to.be.revertedWith("MonetaryPolicy: zero amount");
});
it("نباید از سقف ۹۰۰ میلیارد تجاوز کند", async function () {
  const overCap = ethers.parseUnits("901000000000", 18);
  const proof   = ethers.parseUnits("999000000000", 18);
  await expect(
    policy.connect(swf).requestMint(overCap, proof)
  ).to.be.revertedWith("MonetaryPolicy: exceeds 900B hard cap");
});
```

});

describe(“Approve/Reject Mint”, function () {
let requestId;

```
beforeEach(async function () {
  const reserves = ethers.parseUnits("300000000000", 18);
  await policy.connect(swf).updateReserves(reserves);
  const amount = ethers.parseUnits("100000000000", 18);
  const proof  = ethers.parseUnits("300000000000", 18);
  await policy.connect(swf).requestMint(amount, proof);
  requestId = 1;
});

it("باید Kernel بتواند mint را تایید کند", async function () {
  await expect(
    policy.connect(kernel).approveMint(requestId)
  ).to.emit(policy, "MintApproved");
});
it("باید پس از تایید، گردش افزایش یابد", async function () {
  const amount = ethers.parseUnits("100000000000", 18);
  await policy.connect(kernel).approveMint(requestId);
  expect(await policy.currentCirculation()).to.equal(amount);
});
it("باید Kernel بتواند mint را رد کند", async function () {
  await expect(
    policy.connect(kernel).rejectMint(requestId, "ذخایر ناکافی")
  ).to.emit(policy, "MintRejected");
});
it("نباید mint دوبار تایید شود", async function () {
  await policy.connect(kernel).approveMint(requestId);
  await expect(
    policy.connect(kernel).approveMint(requestId)
  ).to.be.revertedWith("MonetaryPolicy: approved");
});
```

});

describe(“Minting Pause”, function () {
it(“باید Kernel بتواند mint را متوقف کند”, async function () {
await expect(
policy.connect(kernel).pauseMinting()
).to.emit(policy, “MintingPaused”);
expect(await policy.mintingPaused()).to.be.true;
});
it(“باید Kernel بتواند mint را از سر بگیرد”, async function () {
await policy.connect(kernel).pauseMinting();
await expect(
policy.connect(kernel).resumeMinting()
).to.emit(policy, “MintingResumed”);
expect(await policy.mintingPaused()).to.be.false;
});
it(“نباید در حالت توقف درخواست mint داد”, async function () {
await policy.connect(kernel).pauseMinting();
const reserves = ethers.parseUnits(“300000000000”, 18);
await policy.connect(swf).updateReserves(reserves);
await expect(
policy.connect(swf).requestMint(1000, 1000)
).to.be.revertedWith(“MonetaryPolicy: minting paused”);
});
});

describe(“Pahlavi Rate”, function () {
it(“باید اوراکل بتواند نرخ را به‌روز کند”, async function () {
const newRate = ethers.parseUnits(“1.05”, 18);
await expect(
policy.connect(oracle).updatePahlaviRate(newRate)
).to.emit(policy, “PahlaviRateUpdated”);
});
it(“نباید نرخ صفر مجاز باشد”, async function () {
await expect(
policy.connect(oracle).updatePahlaviRate(0)
).to.be.revertedWith(“MonetaryPolicy: zero rate”);
});
it(“نباید غیر اوراکل نرخ را تغییر دهد”, async function () {
await expect(
policy.connect(attacker).updatePahlaviRate(1000)
).to.be.reverted;
});
});

describe(“Reserve Compliance”, function () {
it(“باید با ذخایر کافی سازگار باشد”, async function () {
const reserves = ethers.parseUnits(“300000000000”, 18);
await policy.connect(swf).updateReserves(reserves);
expect(await policy.isReserveCompliant()).to.be.true;
});
it(“باید ظرفیت باقی‌مانده mint صحیح باشد”, async function () {
expect(await policy.remainingMintCapacity()).to.equal(LIQUIDITY_CAP);
});
});
});