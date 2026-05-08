const { expect } = require(“chai”);
const { ethers } = require(“hardhat”);

describe(“VictimFund”, function () {
let fund;
let kernel, court, council, penalLabor;
let victim1, victim2, attacker;

const COURT_ROLE       = ethers.keccak256(ethers.toUtf8Bytes(“COURT_ROLE”));
const COUNCIL_ROLE     = ethers.keccak256(ethers.toUtf8Bytes(“COUNCIL_ROLE”));
const PENAL_LABOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes(“PENAL_LABOR_ROLE”));

beforeEach(async function () {
[kernel, court, council, penalLabor, victim1, victim2, attacker] = await ethers.getSigners();
const Fund = await ethers.getContractFactory(“VictimFund”);
fund = await Fund.deploy(kernel.address);
await fund.waitForDeployment();
await fund.connect(kernel).grantRole(COURT_ROLE, court.address);
await fund.connect(kernel).grantRole(COUNCIL_ROLE, council.address);
await fund.connect(kernel).grantRole(PENAL_LABOR_ROLE, penalLabor.address);
});

describe(“Deployment”, function () {
it(“باید موجودی اولیه صفر باشد”, async function () {
expect(await fund.getFundBalance()).to.equal(0);
});
it(“باید تعداد قربانیان صفر باشد”, async function () {
expect(await fund.victimCount()).to.equal(0);
});
});

describe(“Victim Registration”, function () {
const amount = ethers.parseUnits(“50000”, 18);

```
it("باید دادگاه بتواند قربانی ثبت کند", async function () {
  await expect(
    fund.connect(court).registerVictim(victim1.address, 0, 1, amount)
  ).to.emit(fund, "VictimRegistered");
});
it("نباید غیردادگاه قربانی ثبت کند", async function () {
  await expect(
    fund.connect(attacker).registerVictim(victim1.address, 0, 1, amount)
  ).to.be.reverted;
});
it("نباید مبلغ صفر مجاز باشد", async function () {
  await expect(
    fund.connect(court).registerVictim(victim1.address, 0, 1, 0)
  ).to.be.revertedWith("VictimFund: zero amount");
});
it("باید شمارنده قربانیان افزایش یابد", async function () {
  await fund.connect(court).registerVictim(victim1.address, 0, 1, amount);
  expect(await fund.victimCount()).to.equal(1);
});
```

});

describe(“Receive Funds”, function () {
it(“باید PenalLabor بتواند وجه واریز کند”, async function () {
const amount = ethers.parseUnits(“10000”, 18);
await expect(
fund.connect(penalLabor).receiveFunds(amount, “درآمد کار جبرانی ماه اول”)
).to.emit(fund, “FundsReceived”);
});
it(“باید موجودی گنجینه افزایش یابد”, async function () {
const amount = ethers.parseUnits(“10000”, 18);
await fund.connect(penalLabor).receiveFunds(amount, “درآمد”);
expect(await fund.getFundBalance()).to.equal(amount);
});
it(“نباید غیرمجاز وجه واریز کند”, async function () {
await expect(
fund.connect(attacker).receiveFunds(1000, “تست”)
).to.be.revertedWith(“VictimFund: unauthorized”);
});
it(“نباید مبلغ صفر واریز شود”, async function () {
await expect(
fund.connect(penalLabor).receiveFunds(0, “تست”)
).to.be.revertedWith(“VictimFund: zero amount”);
});
});

describe(“Pay Compensation”, function () {
const approved = ethers.parseUnits(“50000”, 18);
const funded   = ethers.parseUnits(“100000”, 18);

```
beforeEach(async function () {
  await fund.connect(court).registerVictim(victim1.address, 0, 1, approved);
  await fund.connect(penalLabor).receiveFunds(funded, "درآمد");
});

it("باید شورا بتواند غرامت پرداخت کند", async function () {
  await expect(
    fund.connect(council).payCompensation(1, approved)
  ).to.emit(fund, "CompensationPaid");
});
it("باید پس از پرداخت کامل، قربانی جبران‌شده باشد", async function () {
  await fund.connect(council).payCompensation(1, approved);
  const record = await fund.getVictimRecord(1);
  expect(record.fullyCompensated).to.be.true;
});
it("نباید از مقدار تاییدشده بیشتر پرداخت شود", async function () {
  const over = ethers.parseUnits("60000", 18);
  await expect(
    fund.connect(council).payCompensation(1, over)
  ).to.be.revertedWith("VictimFund: exceeds approved");
});
it("نباید بیشتر از موجودی پرداخت شود", async function () {
  const newFund = await (await ethers.getContractFactory("VictimFund")).deploy(kernel.address);
  await newFund.connect(kernel).grantRole(COURT_ROLE, court.address);
  await newFund.connect(kernel).grantRole(COUNCIL_ROLE, council.address);
  await newFund.connect(court).registerVictim(victim1.address, 0, 1, approved);
  await expect(
    newFund.connect(council).payCompensation(1, approved)
  ).to.be.revertedWith("VictimFund: insufficient");
});
it("باید موجودی پس از پرداخت کاهش یابد", async function () {
  await fund.connect(council).payCompensation(1, approved);
  expect(await fund.getFundBalance()).to.equal(funded - approved);
});
```

});

describe(“Remaining Compensation”, function () {
it(“باید غرامت باقی‌مانده درست باشد”, async function () {
const approved = ethers.parseUnits(“50000”, 18);
const partial  = ethers.parseUnits(“20000”, 18);
const funded   = ethers.parseUnits(“100000”, 18);
await fund.connect(court).registerVictim(victim1.address, 0, 1, approved);
await fund.connect(penalLabor).receiveFunds(funded, “درآمد”);
await fund.connect(council).payCompensation(1, partial);
expect(await fund.getRemainingCompensation(1)).to.equal(approved - partial);
});
});
});