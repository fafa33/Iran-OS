const { expect } = require(“chai”);
const { ethers } = require(“hardhat”);

/**

- @title TriggerProtocol Tests
- @dev تست‌های جامع پروتکل ماشه
  */
  describe(“TriggerProtocol”, function () {
  let trigger;
  let kernel, treasury, swf;
  let attacker, replacement, user1, user2;

beforeEach(async function () {
[kernel, treasury, swf, attacker, replacement, user1, user2] = await ethers.getSigners();
const Trigger = await ethers.getContractFactory(“TriggerProtocol”);
trigger = await Trigger.deploy(kernel.address, treasury.address, swf.address);
await trigger.waitForDeployment();
});

describe(“Deployment”, function () {
it(“باید kernel درست ثبت شود”, async function () {
expect(await trigger.kernel()).to.equal(kernel.address);
});
it(“باید treasury درست ثبت شود”, async function () {
expect(await trigger.treasury()).to.equal(treasury.address);
});
it(“باید تعداد اجراها صفر باشد”, async function () {
expect(await trigger.executionCount()).to.equal(0);
});
it(“نباید هیچ آدرسی از ابتدا مسدود باشد”, async function () {
expect(await trigger.isTreasuryBlocked(attacker.address)).to.be.false;
});
});

describe(“Execute Trigger”, function () {
it(“باید Kernel بتواند ماشه را اجرا کند”, async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address)
).to.emit(trigger, “TriggerExecuted”);
});
it(“نباید غیر Kernel ماشه را اجرا کند”, async function () {
await expect(
trigger.connect(attacker).executeTrigger(1, user1.address, 1, replacement.address)
).to.be.revertedWith(“TriggerProtocol: caller is not the Kernel”);
});
it(“باید پس از اجرا دسترسی به خزانه مسدود شود”, async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.isTreasuryBlocked(attacker.address)).to.be.true;
});
it(“باید پس از اجرا امضا باطل شود”, async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.isSignatureRevoked(attacker.address)).to.be.true;
});
it(“باید جانشین موقت فعال شود”, async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.getInterimReplacement(attacker.address)).to.equal(replacement.address);
});
it(“باید شمارنده اجراها افزایش یابد”, async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.executionCount()).to.equal(1);
});
it(“نباید آدرس صفر به عنوان خاطی مجاز باشد”, async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, ethers.ZeroAddress, 1, replacement.address)
).to.be.revertedWith(“TriggerProtocol: invalid offender”);
});
it(“باید بدون جانشین هم اجرا شود”, async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, ethers.ZeroAddress)
).to.emit(trigger, “TriggerExecuted”);
expect(await trigger.getInterimReplacement(attacker.address)).to.equal(ethers.ZeroAddress);
});
it(“باید رویداد PublicNotification منتشر شود”, async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 2, replacement.address)
).to.emit(trigger, “PublicNotification”);
});
it(“باید رویداد TreasuryAccessBlocked منتشر شود”, async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address)
).to.emit(trigger, “TreasuryAccessBlocked”);
});
it(“باید رویداد SignatureRevoked منتشر شود”, async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address)
).to.emit(trigger, “SignatureRevoked”);
});
it(“باید جزییات اجرا قابل دسترسی باشد”, async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 3, replacement.address);
const exec = await trigger.getExecution(1);
expect(exec.violationId).to.equal(1);
expect(exec.offender).to.equal(attacker.address);
expect(exec.violationCode).to.equal(3);
expect(exec.treasuryBlocked).to.be.true;
expect(exec.signatureRevoked).to.be.true;
expect(exec.publicNotified).to.be.true;
expect(exec.interimReplacement).to.equal(replacement.address);
});
});

describe(“Multiple Executions”, function () {
it(“باید چندین اجرا مستقل باشند”, async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
await trigger.connect(kernel).executeTrigger(2, user1.address, 2, replacement.address);
expect(await trigger.executionCount()).to.equal(2);
expect(await trigger.isTreasuryBlocked(attacker.address)).to.be.true;
expect(await trigger.isTreasuryBlocked(user1.address)).to.be.true;
});
it(“باید اجرای سوم هم صحیح باشد”, async function () {
for (let i = 1; i <= 3; i++) {
await trigger.connect(kernel).executeTrigger(i, user1.address, i, replacement.address);
}
expect(await trigger.executionCount()).to.equal(3);
});
});

describe(“Execution Not Found”, function () {
it(“نباید اجرای ناموجود قابل دسترسی باشد”, async function () {
await expect(trigger.getExecution(999)).to.be.revertedWith(“TriggerProtocol: execution not found”);
});
});
});