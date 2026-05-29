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

describe("TINV-01 Annual Budget Cap Accumulation", function () {
it("TINV-01: cumulative createBudgetLine calls can reach 150B cap exactly but not exceed it; totalBudgetAllocated unchanged on failed call", async function () {
const lineA = ethers.parseUnits("100000000000", 18); // 100B PAH
const lineB = ethers.parseUnits("50000000000",  18); // 50B PAH — reaches cap exactly
const ANNUAL_CAP = ethers.parseUnits("150000000000", 18);

await treasury.connect(parliament).createBudgetLine(0, lineA);
expect(await treasury.totalBudgetAllocated()).to.equal(lineA);

await treasury.connect(parliament).createBudgetLine(1, lineB);
expect(await treasury.totalBudgetAllocated()).to.equal(ANNUAL_CAP);

// 1 wei over the cap — must revert
await expect(
  treasury.connect(parliament).createBudgetLine(2, 1n)
).to.be.revertedWith("Treasury: exceeds 150B cap");

// totalBudgetAllocated unchanged after failed call
expect(await treasury.totalBudgetAllocated()).to.equal(ANNUAL_CAP);
});
});

describe("TINV-04 Budget Line Exhaustion Boundary", function () {
it("TINV-04: spending a line to exact allocation passes; 1 wei over reverts and leaves line.spent unchanged", async function () {
const lineAmount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, lineAmount);

// propose the full allocation at once
await treasury.connect(government).proposeTransaction(
  recipient.address, lineAmount, 1, "TINV-04 full spend"
);
// txId = 1, signaturesCount = 1; need 2 more AUDITOR sigs to execute

await treasury.connect(kernel).grantRole(AUDITOR_ROLE, swf.address);

await treasury.connect(auditor).signTransaction(1); // signaturesCount = 2
await treasury.connect(swf).signTransaction(1);     // signaturesCount = 3 → executes; line.spent = lineAmount

const line = await treasury.getBudgetLine(1);
expect(line.spent).to.equal(lineAmount);            // line is fully spent

// any further spend — even 1 wei — must revert at proposal time
await expect(
  treasury.connect(government).proposeTransaction(
    recipient.address, 1n, 1, "TINV-04 overdraw attempt"
  )
).to.be.revertedWith("Treasury: exceeds budget line");

// line.spent unchanged after failed overdraw attempt
const lineAfter = await treasury.getBudgetLine(1);
expect(lineAfter.spent).to.equal(lineAmount);
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

describe("TINV-06 Executed Transaction Re-execution Block", function () {
it("TINV-06: signTransaction on executed transaction reverts and leaves executed flag and budget line spent unchanged", async function () {
const lineAmount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, lineAmount);

const txAmount = ethers.parseUnits("1000000000", 18);
await treasury.connect(government).proposeTransaction(
  recipient.address, txAmount, 1, "TINV-06 proposal"
);
// signaturesCount = 1 (proposer); need 2 more AUDITOR sigs to reach MULTISIG_THRESHOLD=3

await treasury.connect(kernel).grantRole(AUDITOR_ROLE, swf.address);

await treasury.connect(auditor).signTransaction(1); // signaturesCount = 2
await treasury.connect(swf).signTransaction(1);     // signaturesCount = 3 → executes

const tx_ = await treasury.getTransaction(1);
expect(tx_.executed).to.be.true;
expect(tx_.signaturesCount).to.equal(3);

const line = await treasury.getBudgetLine(1);
expect(line.spent).to.equal(txAmount);
const spentAfterExec = line.spent;

// executed check fires before duplicate-sig check — auditor already signed but
// the "executed" guard is evaluated first in signTransaction()
await expect(
  treasury.connect(auditor).signTransaction(1)
).to.be.revertedWith("Treasury: executed");

// state unchanged after failed re-sign
const tx2 = await treasury.getTransaction(1);
expect(tx2.executed).to.be.true;
expect(tx2.signaturesCount).to.equal(3);
const line2 = await treasury.getBudgetLine(1);
expect(line2.spent).to.equal(spentAfterExec);
});
});

describe("TINV-07 Rejected Transaction Sign Block", function () {
it("TINV-07: signTransaction on rejected transaction reverts and leaves rejected flag and signaturesCount unchanged", async function () {
const lineAmount = ethers.parseUnits("10000000000", 18);
await treasury.connect(parliament).createBudgetLine(0, lineAmount);

const txAmount = ethers.parseUnits("1000000000", 18);
await treasury.connect(government).proposeTransaction(
  recipient.address, txAmount, 1, "TINV-07 proposal"
);
// signaturesCount = 1

await treasury.connect(kernel).rejectTransaction(1, "TINV-07 kernel rejection");

const tx_ = await treasury.getTransaction(1);
expect(tx_.rejected).to.be.true;
const sigCountBefore = tx_.signaturesCount;

// auditor attempts to sign a rejected tx — must revert
await expect(
  treasury.connect(auditor).signTransaction(1)
).to.be.revertedWith("Treasury: rejected");

// state unchanged after failed sign
const tx2 = await treasury.getTransaction(1);
expect(tx2.rejected).to.be.true;
expect(tx2.signaturesCount).to.equal(sigCountBefore);
const line = await treasury.getBudgetLine(1);
expect(line.spent).to.equal(0n);
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