const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury", function () {
let treasury;
let kernel, parliament, government, auditor, swf;
let recipient, attacker;

const PARLIAMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARLIAMENT_ROLE"));
const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));
const AUDITOR_ROLE    = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));

const ANNUAL_CAP = ethers.parseUnits("150000000000", 18);

beforeEach(async function () {
[kernel, parliament, government, auditor, swf, recipient, attacker] = await ethers.getSigners();
const Treasury = await ethers.getContractFactory("Treasury");
treasury = await Treasury.deploy(kernel.address);
await treasury.waitForDeployment();
await treasury.connect(kernel).grantRole(PARLIAMENT_ROLE, parliament.address);
await treasury.connect(kernel).grantRole(GOVERNMENT_ROLE, government.address);
await treasury.connect(kernel).grantRole(AUDITOR_ROLE, auditor.address);
});

describe("Deployment", function () {
it("باید سقف بودجه سالانه ۱۵۰ میلیارد پهلوی باشد", async function () {
expect(await treasury.ANNUAL_BUDGET_CAP()).to.equal(ANNUAL_CAP);
});
it("باید سال مالی ۱۴۰۴ باشد", async function () {
expect(await treasury.currentFiscalYear()).to.equal(1404);
});
it("باید بودجه تخصیص‌یافته صفر باشد", async function () {
expect(await treasury.totalBudgetAllocated()).to.equal(0);
});
});

describe("Budget Line Creation", function () {
it("باید مجلس بتواند ردیف بودجه بسازد", async function () {
const amount = ethers.parseUnits("10000000000", 18);
await expect(
treasury.connect(parliament).createBudgetLine(0, amount) // 0 = Health
).to.emit(treasury, "BudgetLineCreated");
});
it("نباید غیرمجلس ردیف بودجه بسازد", async function () {
const amount = ethers.parseUnits("1000000000", 18);
await expect(
treasury.connect(attacker).createBudgetLine(0, amount)
).to.be.reverted;
});
it("نباید بودجه از سقف ۱۵۰ میلیارد تجاوز کند", async function () {
const overAmount = ethers.parseUnits("151000000000", 18);
await expect(
treasury.connect(parliament).createBudgetLine(0, overAmount)
).to.be.revertedWith("Treasury: exceeds 150B cap");
});
it("نباید مبلغ صفر مجاز باشد", async function () {
await expect(
treasury.connect(parliament).createBudgetLine(0, 0)
).to.be.revertedWith("Treasury: zero amount");
});
it("باید تخصیص کل افزایش یابد", async function () {
const amount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, amount);
expect(await treasury.totalBudgetAllocated()).to.equal(amount);
});
});

describe("Transaction Proposal", function () {
let lineId;
const lineAmount = ethers.parseUnits("10000000000", 18);

beforeEach(async function () {
  await treasury.connect(parliament).createBudgetLine(0, lineAmount);
  lineId = 1;
});

it("باید دولت بتواند تراکنش پیشنهاد دهد", async function () {
  const amount = ethers.parseUnits("100000000", 18);
  await expect(
    treasury.connect(government).proposeTransaction(recipient.address, amount, lineId, "هزینه بهداشت")
  ).to.emit(treasury, "TransactionProposed");
});
it("نباید غیردولت تراکنش پیشنهاد دهد", async function () {
  const amount = ethers.parseUnits("100000000", 18);
  await expect(
    treasury.connect(attacker).proposeTransaction(recipient.address, amount, lineId, "تست")
  ).to.be.reverted;
});
it("نباید تراکنش از ردیف بودجه تجاوز کند", async function () {
  const overAmount = ethers.parseUnits("11000000000", 18);
  await expect(
    treasury.connect(government).proposeTransaction(recipient.address, overAmount, lineId, "تست")
  ).to.be.revertedWith("Treasury: exceeds budget line");
});

});

describe("Address Blocking by Trigger", function () {
it("باید Kernel بتواند آدرس را مسدود کند", async function () {
await expect(
treasury.connect(kernel).blockAddressByTrigger(attacker.address)
).to.emit(treasury, "AddressBlockedByTrigger");
});
it("باید آدرس مسدود شده قابل شناسایی باشد", async function () {
await treasury.connect(kernel).blockAddressByTrigger(attacker.address);
expect(await treasury.isBlocked(attacker.address)).to.be.true;
});
it("نباید غیر Kernel آدرس را مسدود کند", async function () {
await expect(
treasury.connect(attacker).blockAddressByTrigger(recipient.address)
).to.be.reverted;
});
});

describe("Fiscal Year", function () {
it("باید مجلس سال مالی جدید شروع کند", async function () {
await expect(
treasury.connect(parliament).startNewFiscalYear(1405)
).to.emit(treasury, "FiscalYearStarted");
});
it("نباید سال مالی کمتر از سال جاری باشد", async function () {
await expect(
treasury.connect(parliament).startNewFiscalYear(1403)
).to.be.revertedWith("Treasury: invalid year");
});
it("باید بودجه تخصیص‌یافته پس از سال جدید ریست شود", async function () {
const amount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, amount);
await treasury.connect(parliament).startNewFiscalYear(1405);
expect(await treasury.totalBudgetAllocated()).to.equal(0);
});
});

describe("TINV-05 Blocked Recipient State-Neutrality", function () {
it("TINV-05: signTransaction revert on blocked recipient leaves signaturesCount, executed, auditor sig, and budget line spent unchanged", async function () {
const lineAmount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, lineAmount);
// lineId = 1 (first line in fresh deployment)

const txAmount = ethers.parseUnits("1000000000", 18);
await treasury.connect(government).proposeTransaction(
  recipient.address, txAmount, 1, "TINV-05 proposal"
);
// txId = 1 (first tx in fresh deployment); signaturesCount = 1 (proposer)

// block the recipient after proposal
await treasury.connect(kernel).blockAddressByTrigger(recipient.address);

// auditor attempts to sign — must revert because recipient is now blocked
await expect(
  treasury.connect(auditor).signTransaction(1)
).to.be.revertedWith("Treasury: recipient blocked");

// state-neutrality assertions
const tx_ = await treasury.getTransaction(1);
expect(tx_.signaturesCount).to.equal(1);     // proposer sig only, auditor not added
expect(tx_.executed).to.be.false;            // not executed
expect(await treasury.txSignatures(1, auditor.address)).to.be.false;  // auditor sig not stored

const line = await treasury.getBudgetLine(1);
expect(line.spent).to.equal(0n);             // budget line not debited
});
});

describe("TINV-08 Trigger Block Proposal Neutrality", function () {
it("TINV-08: proposeTransaction revert on blocked recipient leaves txCount and budget line unchanged", async function () {
const lineAmount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, lineAmount);
// lineId = 1; txCount = 0 at this point

// block recipient BEFORE any proposal
await treasury.connect(kernel).blockAddressByTrigger(recipient.address);
expect(await treasury.isBlocked(recipient.address)).to.be.true;

const txCountBefore = await treasury.txCount();
const lineBefore    = await treasury.getBudgetLine(1);

// propose to blocked recipient — must revert
await expect(
  treasury.connect(government).proposeTransaction(
    recipient.address, ethers.parseUnits("1000000000", 18), 1, "TINV-08 attempt"
  )
).to.be.revertedWith("Treasury: address blocked by Trigger Protocol");

// state-neutrality: no transaction record created
expect(await treasury.txCount()).to.equal(txCountBefore);
const tx_ = await treasury.getTransaction(txCountBefore + 1n);
expect(tx_.timestamp).to.equal(0n);          // slot empty — tx was never written

// budget line unchanged
const lineAfter = await treasury.getBudgetLine(1);
expect(lineAfter.spent).to.equal(lineBefore.spent);
expect(lineAfter.allocated).to.equal(lineBefore.allocated);
});
});
});