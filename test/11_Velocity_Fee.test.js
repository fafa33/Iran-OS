const { expect } = require(“chai”);
const { ethers } = require(“hardhat”);

describe(“VelocityFee”, function () {
let fee;
let kernel, oracle, staking, devBank;
let account1, account2, attacker;

const ORACLE_ROLE  = ethers.keccak256(ethers.toUtf8Bytes(“ORACLE_ROLE”));
const STAKING_ROLE = ethers.keccak256(ethers.toUtf8Bytes(“STAKING_ROLE”));

const THRESHOLD  = ethers.parseUnits(“100000”, 18);
const TIER1_MAX  = ethers.parseUnits(“500000”, 18);
const TIER2_MAX  = ethers.parseUnits(“5000000”, 18);

beforeEach(async function () {
[kernel, oracle, staking, devBank, account1, account2, attacker] = await ethers.getSigners();
const Fee = await ethers.getContractFactory(“VelocityFee”);
fee = await Fee.deploy(kernel.address, devBank.address);
await fee.waitForDeployment();
await fee.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
await fee.connect(kernel).grantRole(STAKING_ROLE, staking.address);
});

describe(“Deployment”, function () {
it(“باید آستانه ۱۰۰,۰۰۰ پهلوی باشد”, async function () {
expect(await fee.THRESHOLD()).to.equal(THRESHOLD);
});
it(“باید نرخ tier1 برابر ۲۰ باشد (۲٪)”, async function () {
expect(await fee.TIER1_RATE()).to.equal(20);
});
it(“باید نرخ tier2 برابر ۵۰ باشد (۵٪)”, async function () {
expect(await fee.TIER2_RATE()).to.equal(50);
});
it(“باید نرخ tier3 برابر ۸۰ باشد (۸٪)”, async function () {
expect(await fee.TIER3_RATE()).to.equal(80);
});
it(“باید دوره رکود ۳۶۵ روز باشد”, async function () {
expect(await fee.DORMANCY_PERIOD()).to.equal(365 * 24 * 3600);
});
});

describe(“Register Account”, function () {
it(“باید اوراکل بتواند حساب ثبت کند”, async function () {
await expect(
fee.connect(oracle).registerAccount(account1.address, THRESHOLD + 1n)
).to.emit(fee, “AccountRegistered”);
});
it(“نباید غیراوراکل حساب ثبت کند”, async function () {
await expect(
fee.connect(attacker).registerAccount(account1.address, 1000)
).to.be.reverted;
});
it(“باید حساب ثبت‌شده قابل دسترسی باشد”, async function () {
await fee.connect(oracle).registerAccount(account1.address, THRESHOLD + 1n);
const status = await fee.getAccountStatus(account1.address);
expect(status.isRegistered).to.be.true;
expect(status.isStaking).to.be.false;
});
});

describe(“Activity Recording”, function () {
beforeEach(async function () {
await fee.connect(oracle).registerAccount(account1.address, THRESHOLD + 1n);
});
it(“باید اوراکل فعالیت ثبت کند”, async function () {
await expect(
fee.connect(oracle).recordActivity(account1.address)
).to.emit(fee, “ActivityRecorded”);
});
it(“نباید حساب ناموجود فعالیت ثبت کند”, async function () {
await expect(
fee.connect(oracle).recordActivity(attacker.address)
).to.be.revertedWith(“VelocityFee: not registered”);
});
});

describe(“Staking”, function () {
beforeEach(async function () {
await fee.connect(oracle).registerAccount(account1.address, TIER1_MAX);
});
it(“باید staking فعال‌سازی شود”, async function () {
await expect(
fee.connect(staking).activateStaking(account1.address, TIER1_MAX)
).to.emit(fee, “StakingActivated”);
});
it(“باید staking غیرفعال‌سازی شود”, async function () {
await fee.connect(staking).activateStaking(account1.address, TIER1_MAX);
await expect(
fee.connect(staking).deactivateStaking(account1.address)
).to.emit(fee, “StakingDeactivated”);
});
it(“باید حساب staking‌شده در رکود نباشد”, async function () {
await fee.connect(staking).activateStaking(account1.address, TIER1_MAX);
expect(await fee.isDormant(account1.address)).to.be.false;
});
it(“نباید غیر staking role فعال‌سازی کند”, async function () {
await expect(
fee.connect(attacker).activateStaking(account1.address, 1000)
).to.be.reverted;
});
});

describe(“Fee Calculation”, function () {
beforeEach(async function () {
await fee.connect(oracle).registerAccount(account1.address, TIER1_MAX);
});
it(“باید حساب زیر آستانه کارمزد نداشته باشد”, async function () {
await fee.connect(oracle).updateBalance(account1.address, THRESHOLD - 1n);
const [feeAmount] = await fee.calculateFee(account1.address);
expect(feeAmount).to.equal(0);
});
it(“باید حساب staking‌شده کارمزد نداشته باشد”, async function () {
await fee.connect(staking).activateStaking(account1.address, TIER1_MAX);
const [feeAmount] = await fee.calculateFee(account1.address);
expect(feeAmount).to.equal(0);
});
});

describe(“Balance Update”, function () {
it(“باید اوراکل موجودی را به‌روز کند”, async function () {
await fee.connect(oracle).registerAccount(account1.address, THRESHOLD);
await fee.connect(oracle).updateBalance(account1.address, TIER1_MAX);
const status = await fee.getAccountStatus(account1.address);
expect(status.balance).to.equal(TIER1_MAX);
});
});
});