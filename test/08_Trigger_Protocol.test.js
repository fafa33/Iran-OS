const { expect } = require("chai");
const { ethers } = require("hardhat");

/**

- @title TriggerProtocol Tests
- @dev تست‌های جامع پروتکل ماشه
  */
  describe("TriggerProtocol", function () {
  let trigger;
  let kernel, treasury, swf;
  let attacker, replacement, user1, user2;

beforeEach(async function () {
[kernel, , swf, attacker, replacement, user1, user2] = await ethers.getSigners();
const TreasuryFactory = await ethers.getContractFactory("Treasury");
treasury = await TreasuryFactory.deploy(kernel.address, kernel.address);
await treasury.waitForDeployment();
const Trigger = await ethers.getContractFactory("TriggerProtocol");
trigger = await Trigger.deploy(kernel.address, await treasury.getAddress(), swf.address);
await trigger.waitForDeployment();
await treasury.connect(kernel).grantRole(await treasury.KERNEL_ROLE(), await trigger.getAddress());
});

describe("Deployment", function () {
it("باید kernel درست ثبت شود", async function () {
expect(await trigger.kernel()).to.equal(kernel.address);
});
it("باید treasury درست ثبت شود", async function () {
expect(await trigger.treasury()).to.equal(await treasury.getAddress());
});
it("باید تعداد اجراها صفر باشد", async function () {
expect(await trigger.executionCount()).to.equal(0);
});
it("نباید هیچ آدرسی از ابتدا مسدود باشد", async function () {
expect(await trigger.isTreasuryBlocked(attacker.address)).to.be.false;
});
});

describe("Execute Trigger", function () {
it("باید Kernel بتواند ماشه را اجرا کند", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address)
).to.emit(trigger, "TriggerExecuted");
});
it("نباید غیر Kernel ماشه را اجرا کند", async function () {
await expect(
trigger.connect(attacker).executeTrigger(1, user1.address, 1, replacement.address)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
});
it("unauthorized executeTrigger call is state-neutral", async function () {
await expect(
trigger.connect(attacker).executeTrigger(1, user1.address, 1, replacement.address)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");

expect(await trigger.executionCount()).to.equal(0);

const exec = await trigger.executions(1);
expect(exec.violationId).to.equal(0);
expect(exec.offender).to.equal(ethers.ZeroAddress);
expect(exec.violationCode).to.equal(0);
expect(exec.executedAt).to.equal(0);
expect(exec.treasuryBlocked).to.be.false;
expect(exec.signatureRevoked).to.be.false;
expect(exec.publicNotified).to.be.false;
expect(exec.interimReplacement).to.equal(ethers.ZeroAddress);

expect(await trigger.isTreasuryBlocked(user1.address)).to.be.false;
expect(await trigger.isSignatureRevoked(user1.address)).to.be.false;
expect(await trigger.getInterimReplacement(user1.address)).to.equal(ethers.ZeroAddress);
});
it("باید پس از اجرا دسترسی به خزانه مسدود شود", async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.isTreasuryBlocked(attacker.address)).to.be.true;
});
it("باید پس از اجرا امضا باطل شود", async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.isSignatureRevoked(attacker.address)).to.be.true;
});
it("باید جانشین موقت فعال شود", async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.getInterimReplacement(attacker.address)).to.equal(replacement.address);
});
it("باید شمارنده اجراها افزایش یابد", async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
expect(await trigger.executionCount()).to.equal(1);
});
it("نباید آدرس صفر به عنوان خاطی مجاز باشد", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, ethers.ZeroAddress, 1, replacement.address)
).to.be.revertedWith("TriggerProtocol: invalid offender");
});
it("zero offender executeTrigger revert is state-neutral", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, ethers.ZeroAddress, 1, replacement.address)
).to.be.revertedWith("TriggerProtocol: invalid offender");

expect(await trigger.executionCount()).to.equal(0);

const exec = await trigger.executions(1);
expect(exec.violationId).to.equal(0);
expect(exec.offender).to.equal(ethers.ZeroAddress);
expect(exec.violationCode).to.equal(0);
expect(exec.executedAt).to.equal(0);
expect(exec.treasuryBlocked).to.be.false;
expect(exec.signatureRevoked).to.be.false;
expect(exec.publicNotified).to.be.false;
expect(exec.interimReplacement).to.equal(ethers.ZeroAddress);

expect(await trigger.getInterimReplacement(ethers.ZeroAddress)).to.equal(ethers.ZeroAddress);
});
it("باید بدون جانشین هم اجرا شود", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, ethers.ZeroAddress)
).to.emit(trigger, "TriggerExecuted");
expect(await trigger.getInterimReplacement(attacker.address)).to.equal(ethers.ZeroAddress);
});
it("باید رویداد PublicNotification منتشر شود", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 2, replacement.address)
).to.emit(trigger, "PublicNotification");
});
it("باید رویداد TreasuryAccessBlocked منتشر شود", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address)
).to.emit(trigger, "TreasuryAccessBlocked");
});
it("باید رویداد SignatureRevoked منتشر شود", async function () {
await expect(
trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address)
).to.emit(trigger, "SignatureRevoked");
});
it("باید جزییات اجرا قابل دسترسی باشد", async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 3, replacement.address);
const exec = await trigger.executions(1);
expect(exec.violationId).to.equal(1);
expect(exec.offender).to.equal(attacker.address);
expect(exec.violationCode).to.equal(3);
expect(exec.treasuryBlocked).to.be.true;
expect(exec.signatureRevoked).to.be.true;
expect(exec.publicNotified).to.be.true;
expect(exec.interimReplacement).to.equal(replacement.address);
});
});

describe("Multiple Executions", function () {
it("باید چندین اجرا مستقل باشند", async function () {
await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
await trigger.connect(kernel).executeTrigger(2, user1.address, 2, replacement.address);
expect(await trigger.executionCount()).to.equal(2);
expect(await trigger.isTreasuryBlocked(attacker.address)).to.be.true;
expect(await trigger.isTreasuryBlocked(user1.address)).to.be.true;
});
it("باید اجرای سوم هم صحیح باشد", async function () {
for (let i = 1; i <= 3; i++) {
await trigger.connect(kernel).executeTrigger(i, user1.address, i, replacement.address);
}
expect(await trigger.executionCount()).to.equal(3);
});
it("stored execution records remain immutable across later attempts", async function () {
const expectExecutionRecord = (actual, expected) => {
expect(actual.violationId).to.equal(expected.violationId);
expect(actual.offender).to.equal(expected.offender);
expect(actual.violationCode).to.equal(expected.violationCode);
expect(actual.executedAt).to.equal(expected.executedAt);
expect(actual.treasuryBlocked).to.equal(expected.treasuryBlocked);
expect(actual.signatureRevoked).to.equal(expected.signatureRevoked);
expect(actual.publicNotified).to.equal(expected.publicNotified);
expect(actual.interimReplacement).to.equal(expected.interimReplacement);
};

await trigger.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);
const firstSnapshot = await trigger.executions(1);

await trigger.connect(kernel).executeTrigger(2, user1.address, 2, user2.address);
const secondSnapshot = await trigger.executions(2);

expect(await trigger.executionCount()).to.equal(2);
expectExecutionRecord(await trigger.executions(1), firstSnapshot);
expectExecutionRecord(secondSnapshot, {
violationId: 2n,
offender: user1.address,
violationCode: 2n,
executedAt: secondSnapshot.executedAt,
treasuryBlocked: true,
signatureRevoked: true,
publicNotified: true,
interimReplacement: user2.address,
});

await expect(
trigger.connect(kernel).executeTrigger(3, ethers.ZeroAddress, 3, replacement.address)
).to.be.revertedWith("TriggerProtocol: invalid offender");

expect(await trigger.executionCount()).to.equal(2);
expectExecutionRecord(await trigger.executions(1), firstSnapshot);
expectExecutionRecord(await trigger.executions(2), secondSnapshot);
});

it("executeTrigger propagates Treasury block when TriggerProtocol holds KERNEL_ROLE", async function () {
const Treasury = await ethers.getContractFactory("Treasury");
const externalTreasury = await Treasury.deploy(kernel.address, kernel.address);
await externalTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const triggerWithTreasury = await Trigger.deploy(kernel.address, await externalTreasury.getAddress(), swf.address);
await triggerWithTreasury.waitForDeployment();

// TG-01: grant KERNEL_ROLE to TriggerProtocol so executeTrigger can call blockAddressByTrigger
await externalTreasury.connect(kernel).grantRole(await externalTreasury.KERNEL_ROLE(), await triggerWithTreasury.getAddress());

const startingBudgetAllocated = await externalTreasury.totalBudgetAllocated();
const startingFiscalYear = await externalTreasury.currentFiscalYear();

await triggerWithTreasury.connect(kernel).executeTrigger(1, attacker.address, 1, replacement.address);

const exec = await triggerWithTreasury.executions(1);
expect(exec.violationId).to.equal(1);
expect(exec.offender).to.equal(attacker.address);
expect(exec.violationCode).to.equal(1);
expect(exec.treasuryBlocked).to.be.true;
expect(await triggerWithTreasury.isTreasuryBlocked(attacker.address)).to.be.true;

// TG-01: executeTrigger now propagates to real Treasury
expect(await externalTreasury.isBlocked(attacker.address)).to.be.true;
expect(await externalTreasury.totalBudgetAllocated()).to.equal(startingBudgetAllocated);
expect(await externalTreasury.currentFiscalYear()).to.equal(startingFiscalYear);
});

it("oracle signal alone preserves treasury and activation state", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const emergencyLockSnapshot = await kernelContract.emergencyLockActive();
const activationCountSnapshot = await kernelContract.triggerActivationCount();
const executionCountSnapshot = await realTrigger.executionCount();
const triggerBlockedSnapshot = await realTrigger.isTreasuryBlocked(offender.address);
const signatureRevokedSnapshot = await realTrigger.isSignatureRevoked(offender.address);
const replacementSnapshot = await realTrigger.getInterimReplacement(offender.address);
const treasuryBlockedSnapshot = await realTreasury.isBlocked(offender.address);
const budgetAllocatedSnapshot = await realTreasury.totalBudgetAllocated();
const fiscalYearSnapshot = await realTreasury.currentFiscalYear();
const l1Snapshot = await realSwf.layerL1();
const totalAssetsSnapshot = await realSwf.totalAssets();
const liquidityCapSnapshot = await kernelContract.LIQUIDITY_CAP();
const reserveRatioSnapshot = await kernelContract.MIN_RESERVE_RATIO();

await expect(
kernelContract.connect(oracle).flagViolation(4, offender.address, "oracle signal neutrality audit")
).to.emit(kernelContract, "ViolationFlagged");

const signalRecord = await kernelContract.violations(1);
const emptyExecution = await realTrigger.executions(1);
const l1 = await realSwf.layerL1();

expect(signalRecord.violationCode).to.equal(4);
expect(signalRecord.offender).to.equal(offender.address);
expect(signalRecord.courtConfirmed).to.be.false;
expect(signalRecord.signaturesCount).to.equal(0);
expect(signalRecord.triggered).to.be.false;

expect(await kernelContract.emergencyLockActive()).to.equal(emergencyLockSnapshot);
expect(await kernelContract.triggerActivationCount()).to.equal(activationCountSnapshot);
expect(await realTrigger.executionCount()).to.equal(executionCountSnapshot);
expect(emptyExecution.violationId).to.equal(0);
expect(emptyExecution.offender).to.equal(ethers.ZeroAddress);
expect(emptyExecution.violationCode).to.equal(0);
expect(emptyExecution.executedAt).to.equal(0);
expect(emptyExecution.treasuryBlocked).to.be.false;
expect(emptyExecution.signatureRevoked).to.be.false;
expect(emptyExecution.publicNotified).to.be.false;
expect(emptyExecution.interimReplacement).to.equal(ethers.ZeroAddress);

expect(await realTrigger.isTreasuryBlocked(offender.address)).to.equal(triggerBlockedSnapshot);
expect(await realTrigger.isSignatureRevoked(offender.address)).to.equal(signatureRevokedSnapshot);
expect(await realTrigger.getInterimReplacement(offender.address)).to.equal(replacementSnapshot);
expect(await realTreasury.isBlocked(offender.address)).to.equal(treasuryBlockedSnapshot);
expect(await realTreasury.totalBudgetAllocated()).to.equal(budgetAllocatedSnapshot);
expect(await realTreasury.currentFiscalYear()).to.equal(fiscalYearSnapshot);
expect(l1.balance).to.equal(l1Snapshot.balance);
expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
expect(l1.totalWithdrawn).to.equal(l1Snapshot.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(totalAssetsSnapshot);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(liquidityCapSnapshot);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(reserveRatioSnapshot);
});

it("non-terminal trigger state cannot mutate treasury accounting", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 11);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

const treasuryKernelRole = await realTreasury.KERNEL_ROLE();
const treasuryBlockedSnapshot = await realTreasury.isBlocked(offender.address);
const treasuryBudgetAllocatedSnapshot = await realTreasury.totalBudgetAllocated();
const treasuryFiscalYearSnapshot = await realTreasury.currentFiscalYear();
const treasuryTxCountSnapshot = await realTreasury.txCount();
const treasuryBudgetLineCountSnapshot = await realTreasury.budgetLineCount();
const treasuryRemainingCapacitySnapshot = await realTreasury.getRemainingCapacity();
const triggerHasTreasuryAuthoritySnapshot = await realTreasury.hasRole(
treasuryKernelRole,
await realTrigger.getAddress()
);
const emergencyLockSnapshot = await kernelContract.emergencyLockActive();
const activationCountSnapshot = await kernelContract.triggerActivationCount();
const executionCountSnapshot = await realTrigger.executionCount();
const triggerBlockedSnapshot = await realTrigger.isTreasuryBlocked(offender.address);
const signatureRevokedSnapshot = await realTrigger.isSignatureRevoked(offender.address);
const replacementSnapshot = await realTrigger.getInterimReplacement(offender.address);
const emptyExecutionSnapshot = await realTrigger.executions(1);
const l1Snapshot = await realSwf.layerL1();
const totalAssetsSnapshot = await realSwf.totalAssets();
const liquidityCapSnapshot = await kernelContract.LIQUIDITY_CAP();
const reserveRatioSnapshot = await kernelContract.MIN_RESERVE_RATIO();

await expect(
kernelContract.connect(oracle).flagViolation(4, offender.address, "treasury boundary neutrality audit")
).to.emit(kernelContract, "ViolationFlagged");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const nonTerminalRecord = await kernelContract.violations(violationId);
const emptyExecution = await realTrigger.executions(1);
const l1 = await realSwf.layerL1();

expect(nonTerminalRecord.violationCode).to.equal(4);
expect(nonTerminalRecord.offender).to.equal(offender.address);
expect(nonTerminalRecord.reason).to.equal("treasury boundary neutrality audit");
expect(nonTerminalRecord.courtConfirmed).to.be.false;
expect(nonTerminalRecord.signaturesCount).to.equal(6);
expect(nonTerminalRecord.triggered).to.be.false;

expect(await kernelContract.emergencyLockActive()).to.equal(emergencyLockSnapshot);
expect(await kernelContract.triggerActivationCount()).to.equal(activationCountSnapshot);
expect(await realTrigger.executionCount()).to.equal(executionCountSnapshot);
expect(emptyExecution.violationId).to.equal(emptyExecutionSnapshot.violationId);
expect(emptyExecution.offender).to.equal(emptyExecutionSnapshot.offender);
expect(emptyExecution.violationCode).to.equal(emptyExecutionSnapshot.violationCode);
expect(emptyExecution.executedAt).to.equal(emptyExecutionSnapshot.executedAt);
expect(emptyExecution.treasuryBlocked).to.equal(emptyExecutionSnapshot.treasuryBlocked);
expect(emptyExecution.signatureRevoked).to.equal(emptyExecutionSnapshot.signatureRevoked);
expect(emptyExecution.publicNotified).to.equal(emptyExecutionSnapshot.publicNotified);
expect(emptyExecution.interimReplacement).to.equal(emptyExecutionSnapshot.interimReplacement);

expect(await realTrigger.isTreasuryBlocked(offender.address)).to.equal(triggerBlockedSnapshot);
expect(await realTrigger.isSignatureRevoked(offender.address)).to.equal(signatureRevokedSnapshot);
expect(await realTrigger.getInterimReplacement(offender.address)).to.equal(replacementSnapshot);
expect(await realTreasury.isBlocked(offender.address)).to.equal(treasuryBlockedSnapshot);
expect(await realTreasury.totalBudgetAllocated()).to.equal(treasuryBudgetAllocatedSnapshot);
expect(await realTreasury.currentFiscalYear()).to.equal(treasuryFiscalYearSnapshot);
expect(await realTreasury.txCount()).to.equal(treasuryTxCountSnapshot);
expect(await realTreasury.budgetLineCount()).to.equal(treasuryBudgetLineCountSnapshot);
expect(await realTreasury.getRemainingCapacity()).to.equal(treasuryRemainingCapacitySnapshot);
expect(await realTreasury.hasRole(treasuryKernelRole, await realTrigger.getAddress())).to.equal(
triggerHasTreasuryAuthoritySnapshot
);
// TG-01: the fixture now grants KERNEL_ROLE to realTrigger on realTreasury
// immediately after deployment (line 347 above), matching the real
// production wiring sequence — so this snapshot, taken afterward, is
// correctly true. The actual invariant this test asserts (that a
// non-terminal/partial-signature trigger state does not mutate Treasury
// authority) is the equality check directly above, comparing the
// before/after snapshot; that check is unchanged.
expect(triggerHasTreasuryAuthoritySnapshot).to.be.true;
expect(l1.balance).to.equal(l1Snapshot.balance);
expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
expect(l1.totalWithdrawn).to.equal(l1Snapshot.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(totalAssetsSnapshot);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(liquidityCapSnapshot);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(reserveRatioSnapshot);
});

it("non-terminal trigger state cannot mutate SWF accounting", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 11);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

const swfKernelRole = await realSwf.KERNEL_ROLE();
const swfReclaimRole = await realSwf.RECLAIM_ROLE();
const swfCouncilRole = await realSwf.COUNCIL_ROLE();
const swfL1Snapshot = await realSwf.layerL1();
const swfTotalAssetsSnapshot = await realSwf.totalAssets();
const swfTxCountSnapshot = await realSwf.txCount();
const triggerHasSwfKernelAuthoritySnapshot = await realSwf.hasRole(
swfKernelRole,
await realTrigger.getAddress()
);
const triggerHasSwfReclaimAuthoritySnapshot = await realSwf.hasRole(
swfReclaimRole,
await realTrigger.getAddress()
);
const triggerHasSwfCouncilAuthoritySnapshot = await realSwf.hasRole(
swfCouncilRole,
await realTrigger.getAddress()
);
const treasuryBlockedSnapshot = await realTreasury.isBlocked(offender.address);
const treasuryBudgetAllocatedSnapshot = await realTreasury.totalBudgetAllocated();
const treasuryFiscalYearSnapshot = await realTreasury.currentFiscalYear();
const treasuryTxCountSnapshot = await realTreasury.txCount();
const treasuryBudgetLineCountSnapshot = await realTreasury.budgetLineCount();
const emergencyLockSnapshot = await kernelContract.emergencyLockActive();
const activationCountSnapshot = await kernelContract.triggerActivationCount();
const executionCountSnapshot = await realTrigger.executionCount();
const triggerBlockedSnapshot = await realTrigger.isTreasuryBlocked(offender.address);
const signatureRevokedSnapshot = await realTrigger.isSignatureRevoked(offender.address);
const replacementSnapshot = await realTrigger.getInterimReplacement(offender.address);
const emptyExecutionSnapshot = await realTrigger.executions(1);
const liquidityCapSnapshot = await kernelContract.LIQUIDITY_CAP();
const reserveRatioSnapshot = await kernelContract.MIN_RESERVE_RATIO();

await expect(
kernelContract.connect(oracle).flagViolation(4, offender.address, "SWF boundary neutrality audit")
).to.emit(kernelContract, "ViolationFlagged");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const nonTerminalRecord = await kernelContract.violations(violationId);
const emptyExecution = await realTrigger.executions(1);
const swfL1 = await realSwf.layerL1();

expect(nonTerminalRecord.violationCode).to.equal(4);
expect(nonTerminalRecord.offender).to.equal(offender.address);
expect(nonTerminalRecord.reason).to.equal("SWF boundary neutrality audit");
expect(nonTerminalRecord.courtConfirmed).to.be.false;
expect(nonTerminalRecord.signaturesCount).to.equal(6);
expect(nonTerminalRecord.triggered).to.be.false;

expect(swfL1.balance).to.equal(swfL1Snapshot.balance);
expect(swfL1.totalDeposited).to.equal(swfL1Snapshot.totalDeposited);
expect(swfL1.totalWithdrawn).to.equal(swfL1Snapshot.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(swfTotalAssetsSnapshot);
expect(await realSwf.txCount()).to.equal(swfTxCountSnapshot);
expect(await realSwf.hasRole(swfKernelRole, await realTrigger.getAddress())).to.equal(
triggerHasSwfKernelAuthoritySnapshot
);
expect(await realSwf.hasRole(swfReclaimRole, await realTrigger.getAddress())).to.equal(
triggerHasSwfReclaimAuthoritySnapshot
);
expect(await realSwf.hasRole(swfCouncilRole, await realTrigger.getAddress())).to.equal(
triggerHasSwfCouncilAuthoritySnapshot
);
expect(triggerHasSwfKernelAuthoritySnapshot).to.be.false;
expect(triggerHasSwfReclaimAuthoritySnapshot).to.be.false;
expect(triggerHasSwfCouncilAuthoritySnapshot).to.be.false;

expect(await realTreasury.isBlocked(offender.address)).to.equal(treasuryBlockedSnapshot);
expect(await realTreasury.totalBudgetAllocated()).to.equal(treasuryBudgetAllocatedSnapshot);
expect(await realTreasury.currentFiscalYear()).to.equal(treasuryFiscalYearSnapshot);
expect(await realTreasury.txCount()).to.equal(treasuryTxCountSnapshot);
expect(await realTreasury.budgetLineCount()).to.equal(treasuryBudgetLineCountSnapshot);
expect(await kernelContract.emergencyLockActive()).to.equal(emergencyLockSnapshot);
expect(await kernelContract.triggerActivationCount()).to.equal(activationCountSnapshot);
expect(await realTrigger.executionCount()).to.equal(executionCountSnapshot);
expect(emptyExecution.violationId).to.equal(emptyExecutionSnapshot.violationId);
expect(emptyExecution.offender).to.equal(emptyExecutionSnapshot.offender);
expect(emptyExecution.violationCode).to.equal(emptyExecutionSnapshot.violationCode);
expect(emptyExecution.executedAt).to.equal(emptyExecutionSnapshot.executedAt);
expect(emptyExecution.treasuryBlocked).to.equal(emptyExecutionSnapshot.treasuryBlocked);
expect(emptyExecution.signatureRevoked).to.equal(emptyExecutionSnapshot.signatureRevoked);
expect(emptyExecution.publicNotified).to.equal(emptyExecutionSnapshot.publicNotified);
expect(emptyExecution.interimReplacement).to.equal(emptyExecutionSnapshot.interimReplacement);
expect(await realTrigger.isTreasuryBlocked(offender.address)).to.equal(triggerBlockedSnapshot);
expect(await realTrigger.isSignatureRevoked(offender.address)).to.equal(signatureRevokedSnapshot);
expect(await realTrigger.getInterimReplacement(offender.address)).to.equal(replacementSnapshot);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(liquidityCapSnapshot);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(reserveRatioSnapshot);
});

it("non-terminal trigger state preserves cross-contract accounting neutrality", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 11);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

const kernelEmergencyLockSnapshot = await kernelContract.emergencyLockActive();
const kernelActivationCountSnapshot = await kernelContract.triggerActivationCount();
const kernelViolationCountSnapshot = await kernelContract.violationCount();
const triggerExecutionCountSnapshot = await realTrigger.executionCount();
const triggerBlockedSnapshot = await realTrigger.isTreasuryBlocked(offender.address);
const triggerSignatureRevokedSnapshot = await realTrigger.isSignatureRevoked(offender.address);
const triggerReplacementSnapshot = await realTrigger.getInterimReplacement(offender.address);
const emptyExecutionSnapshot = await realTrigger.executions(1);
const treasuryBlockedSnapshot = await realTreasury.isBlocked(offender.address);
const treasuryBudgetAllocatedSnapshot = await realTreasury.totalBudgetAllocated();
const treasuryFiscalYearSnapshot = await realTreasury.currentFiscalYear();
const treasuryTxCountSnapshot = await realTreasury.txCount();
const treasuryBudgetLineCountSnapshot = await realTreasury.budgetLineCount();
const treasuryRemainingCapacitySnapshot = await realTreasury.getRemainingCapacity();
const swfL1Snapshot = await realSwf.layerL1();
const swfTotalAssetsSnapshot = await realSwf.totalAssets();
const swfTxCountSnapshot = await realSwf.txCount();
const liquidityCapSnapshot = await kernelContract.LIQUIDITY_CAP();
const reserveRatioSnapshot = await kernelContract.MIN_RESERVE_RATIO();

await expect(
kernelContract.connect(oracle).flagViolation(4, offender.address, "cross-contract neutrality audit")
).to.emit(kernelContract, "ViolationFlagged");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const nonTerminalRecord = await kernelContract.violations(violationId);
const emptyExecution = await realTrigger.executions(1);
const swfL1 = await realSwf.layerL1();

expect(await kernelContract.violationCount()).to.equal(kernelViolationCountSnapshot + 1n);
expect(nonTerminalRecord.violationCode).to.equal(4);
expect(nonTerminalRecord.offender).to.equal(offender.address);
expect(nonTerminalRecord.reason).to.equal("cross-contract neutrality audit");
expect(nonTerminalRecord.courtConfirmed).to.be.false;
expect(nonTerminalRecord.signaturesCount).to.equal(6);
expect(nonTerminalRecord.triggered).to.be.false;

expect(await kernelContract.emergencyLockActive()).to.equal(kernelEmergencyLockSnapshot);
expect(await kernelContract.triggerActivationCount()).to.equal(kernelActivationCountSnapshot);
expect(await realTrigger.executionCount()).to.equal(triggerExecutionCountSnapshot);
expect(emptyExecution.violationId).to.equal(emptyExecutionSnapshot.violationId);
expect(emptyExecution.offender).to.equal(emptyExecutionSnapshot.offender);
expect(emptyExecution.violationCode).to.equal(emptyExecutionSnapshot.violationCode);
expect(emptyExecution.executedAt).to.equal(emptyExecutionSnapshot.executedAt);
expect(emptyExecution.treasuryBlocked).to.equal(emptyExecutionSnapshot.treasuryBlocked);
expect(emptyExecution.signatureRevoked).to.equal(emptyExecutionSnapshot.signatureRevoked);
expect(emptyExecution.publicNotified).to.equal(emptyExecutionSnapshot.publicNotified);
expect(emptyExecution.interimReplacement).to.equal(emptyExecutionSnapshot.interimReplacement);
expect(await realTrigger.isTreasuryBlocked(offender.address)).to.equal(triggerBlockedSnapshot);
expect(await realTrigger.isSignatureRevoked(offender.address)).to.equal(triggerSignatureRevokedSnapshot);
expect(await realTrigger.getInterimReplacement(offender.address)).to.equal(triggerReplacementSnapshot);

expect(await realTreasury.isBlocked(offender.address)).to.equal(treasuryBlockedSnapshot);
expect(await realTreasury.totalBudgetAllocated()).to.equal(treasuryBudgetAllocatedSnapshot);
expect(await realTreasury.currentFiscalYear()).to.equal(treasuryFiscalYearSnapshot);
expect(await realTreasury.txCount()).to.equal(treasuryTxCountSnapshot);
expect(await realTreasury.budgetLineCount()).to.equal(treasuryBudgetLineCountSnapshot);
expect(await realTreasury.getRemainingCapacity()).to.equal(treasuryRemainingCapacitySnapshot);

expect(swfL1.balance).to.equal(swfL1Snapshot.balance);
expect(swfL1.totalDeposited).to.equal(swfL1Snapshot.totalDeposited);
expect(swfL1.totalWithdrawn).to.equal(swfL1Snapshot.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(swfTotalAssetsSnapshot);
expect(await realSwf.txCount()).to.equal(swfTxCountSnapshot);

expect(await kernelContract.LIQUIDITY_CAP()).to.equal(liquidityCapSnapshot);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(reserveRatioSnapshot);
});

it("trigger lifecycle preserves integrity across terminal transition", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 13);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offender.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

await kernelContract.connect(oracle).flagViolation(4, offender.address, "trigger lifecycle integrity audit");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const preTerminalRecord = await kernelContract.violations(violationId);
const preTerminalExecution = await realTrigger.executions(1);
const preTerminalTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const preTerminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const preTerminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const preTerminalTreasuryTxCount = await realTreasury.txCount();
const preTerminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const preTerminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const preTerminalSwfL1 = await realSwf.layerL1();
const preTerminalSwfTotalAssets = await realSwf.totalAssets();
const preTerminalSwfTxCount = await realSwf.txCount();
const preTerminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();
const preTerminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();

expect(preTerminalRecord.courtConfirmed).to.be.false;
expect(preTerminalRecord.signaturesCount).to.equal(6);
expect(preTerminalRecord.triggered).to.be.false;
expect(await kernelContract.triggerActivationCount()).to.equal(0);
expect(await realTrigger.executionCount()).to.equal(0);
expect(preTerminalExecution.violationId).to.equal(0);
expect(preTerminalExecution.offender).to.equal(ethers.ZeroAddress);
expect(await realTrigger.isTreasuryBlocked(offender.address)).to.be.false;
expect(await realTrigger.isSignatureRevoked(offender.address)).to.be.false;
expect(await realTrigger.getInterimReplacement(offender.address)).to.equal(ethers.ZeroAddress);
expect(preTerminalTreasuryBlocked).to.be.false;

await expect(
kernelContract.connect(courtSigners[6]).signViolation(violationId)
).to.emit(kernelContract, "TriggerActivated");

const terminalRecord = await kernelContract.violations(violationId);
const terminalExecution = await realTrigger.executions(1);
const terminalTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const terminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const terminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const terminalTreasuryTxCount = await realTreasury.txCount();
const terminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const terminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const terminalSwfL1 = await realSwf.layerL1();
const terminalSwfTotalAssets = await realSwf.totalAssets();
const terminalSwfTxCount = await realSwf.txCount();
const terminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();
const terminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();

expect(terminalRecord.courtConfirmed).to.be.true;
expect(terminalRecord.signaturesCount).to.equal(7);
expect(terminalRecord.triggered).to.be.true;
expect(await kernelContract.triggerActivationCount()).to.equal(1);
expect(await realTrigger.executionCount()).to.equal(1);
expect(terminalExecution.violationId).to.equal(violationId);
expect(terminalExecution.offender).to.equal(offender.address);
expect(terminalExecution.violationCode).to.equal(4);
expect(terminalExecution.treasuryBlocked).to.be.true;
expect(terminalExecution.signatureRevoked).to.be.true;
expect(terminalExecution.publicNotified).to.be.true;
expect(await realTrigger.isTreasuryBlocked(offender.address)).to.be.true;
expect(await realTrigger.isSignatureRevoked(offender.address)).to.be.true;

expect(terminalTreasuryBlocked).to.be.true; // TG-01: blocked on terminal trigger
expect(terminalTreasuryBudgetAllocated).to.equal(preTerminalTreasuryBudgetAllocated);
expect(terminalTreasuryFiscalYear).to.equal(preTerminalTreasuryFiscalYear);
expect(terminalTreasuryTxCount).to.equal(preTerminalTreasuryTxCount);
expect(terminalTreasuryBudgetLineCount).to.equal(preTerminalTreasuryBudgetLineCount);
expect(terminalTreasuryRemainingCapacity).to.equal(preTerminalTreasuryRemainingCapacity);
expect(terminalSwfL1.balance).to.equal(preTerminalSwfL1.balance);
expect(terminalSwfL1.totalDeposited).to.equal(preTerminalSwfL1.totalDeposited);
expect(terminalSwfL1.totalWithdrawn).to.equal(preTerminalSwfL1.totalWithdrawn);
expect(terminalSwfTotalAssets).to.equal(preTerminalSwfTotalAssets);
expect(terminalSwfTxCount).to.equal(preTerminalSwfTxCount);
expect(terminalLiquidityCap).to.equal(preTerminalLiquidityCap);
expect(terminalReserveRatio).to.equal(preTerminalReserveRatio);

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");

const replayRecord = await kernelContract.violations(violationId);
const replayExecution = await realTrigger.executions(1);
const emptyReplayExecution = await realTrigger.executions(2);
const replaySwfL1 = await realSwf.layerL1();

expect(replayRecord.violationCode).to.equal(terminalRecord.violationCode);
expect(replayRecord.offender).to.equal(terminalRecord.offender);
expect(replayRecord.reason).to.equal(terminalRecord.reason);
expect(replayRecord.timestamp).to.equal(terminalRecord.timestamp);
expect(replayRecord.courtConfirmed).to.equal(terminalRecord.courtConfirmed);
expect(replayRecord.signaturesCount).to.equal(terminalRecord.signaturesCount);
expect(replayRecord.triggered).to.equal(terminalRecord.triggered);

expect(replayExecution.violationId).to.equal(terminalExecution.violationId);
expect(replayExecution.offender).to.equal(terminalExecution.offender);
expect(replayExecution.violationCode).to.equal(terminalExecution.violationCode);
expect(replayExecution.executedAt).to.equal(terminalExecution.executedAt);
expect(replayExecution.treasuryBlocked).to.equal(terminalExecution.treasuryBlocked);
expect(replayExecution.signatureRevoked).to.equal(terminalExecution.signatureRevoked);
expect(replayExecution.publicNotified).to.equal(terminalExecution.publicNotified);
expect(replayExecution.interimReplacement).to.equal(terminalExecution.interimReplacement);
expect(emptyReplayExecution.violationId).to.equal(0);
expect(emptyReplayExecution.offender).to.equal(ethers.ZeroAddress);

expect(await kernelContract.triggerActivationCount()).to.equal(1);
expect(await realTrigger.executionCount()).to.equal(1);
expect(await realTreasury.isBlocked(offender.address)).to.equal(terminalTreasuryBlocked);
expect(await realTreasury.totalBudgetAllocated()).to.equal(terminalTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(terminalTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(terminalTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(terminalTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(terminalTreasuryRemainingCapacity);
expect(replaySwfL1.balance).to.equal(terminalSwfL1.balance);
expect(replaySwfL1.totalDeposited).to.equal(terminalSwfL1.totalDeposited);
expect(replaySwfL1.totalWithdrawn).to.equal(terminalSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(terminalSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(terminalSwfTxCount);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(terminalLiquidityCap);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(terminalReserveRatio);
});

it("trigger lifecycle preserves reserve and liquidity invariants", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 13);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offender.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

const initialReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const initialLiquidityCap = await kernelContract.LIQUIDITY_CAP();
const initialActivationCount = await kernelContract.triggerActivationCount();
const initialExecutionCount = await realTrigger.executionCount();
const initialTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const initialTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const initialTreasuryTxCount = await realTreasury.txCount();
const initialTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const initialTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const initialTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const initialSwfL1 = await realSwf.layerL1();
const initialSwfTotalAssets = await realSwf.totalAssets();
const initialSwfTxCount = await realSwf.txCount();

await kernelContract.connect(oracle).flagViolation(4, offender.address, "reserve invariant lifecycle audit");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const nonTerminalRecord = await kernelContract.violations(violationId);
const nonTerminalExecution = await realTrigger.executions(1);
const nonTerminalSwfL1 = await realSwf.layerL1();

expect(nonTerminalRecord.courtConfirmed).to.be.false;
expect(nonTerminalRecord.signaturesCount).to.equal(6);
expect(nonTerminalRecord.triggered).to.be.false;
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(initialReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(initialLiquidityCap);
expect(await kernelContract.triggerActivationCount()).to.equal(initialActivationCount);
expect(await realTrigger.executionCount()).to.equal(initialExecutionCount);
expect(nonTerminalExecution.violationId).to.equal(0);
expect(nonTerminalExecution.offender).to.equal(ethers.ZeroAddress);
expect(await realTreasury.isBlocked(offender.address)).to.equal(initialTreasuryBlocked);
expect(await realTreasury.totalBudgetAllocated()).to.equal(initialTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(initialTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(initialTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(initialTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(initialTreasuryRemainingCapacity);
expect(nonTerminalSwfL1.balance).to.equal(initialSwfL1.balance);
expect(nonTerminalSwfL1.totalDeposited).to.equal(initialSwfL1.totalDeposited);
expect(nonTerminalSwfL1.totalWithdrawn).to.equal(initialSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(initialSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(initialSwfTxCount);

await kernelContract.connect(courtSigners[6]).signViolation(violationId);

const terminalRecord = await kernelContract.violations(violationId);
const terminalExecution = await realTrigger.executions(1);
const terminalSwfL1 = await realSwf.layerL1();
const terminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const terminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();
const terminalTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const terminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const terminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const terminalTreasuryTxCount = await realTreasury.txCount();
const terminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const terminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const terminalSwfTotalAssets = await realSwf.totalAssets();
const terminalSwfTxCount = await realSwf.txCount();

expect(terminalRecord.courtConfirmed).to.be.true;
expect(terminalRecord.signaturesCount).to.equal(7);
expect(terminalRecord.triggered).to.be.true;
expect(await kernelContract.triggerActivationCount()).to.equal(initialActivationCount + 1n);
expect(await realTrigger.executionCount()).to.equal(initialExecutionCount + 1n);
expect(terminalExecution.violationId).to.equal(violationId);
expect(terminalExecution.offender).to.equal(offender.address);
expect(terminalExecution.treasuryBlocked).to.be.true;
expect(terminalExecution.signatureRevoked).to.be.true;
expect(terminalExecution.publicNotified).to.be.true;
expect(terminalReserveRatio).to.equal(initialReserveRatio);
expect(terminalLiquidityCap).to.equal(initialLiquidityCap);
expect(terminalTreasuryBlocked).to.be.true; // TG-01: blocked on terminal trigger
expect(terminalTreasuryBudgetAllocated).to.equal(initialTreasuryBudgetAllocated);
expect(terminalTreasuryFiscalYear).to.equal(initialTreasuryFiscalYear);
expect(terminalTreasuryTxCount).to.equal(initialTreasuryTxCount);
expect(terminalTreasuryBudgetLineCount).to.equal(initialTreasuryBudgetLineCount);
expect(terminalTreasuryRemainingCapacity).to.equal(initialTreasuryRemainingCapacity);
expect(terminalSwfL1.balance).to.equal(initialSwfL1.balance);
expect(terminalSwfL1.totalDeposited).to.equal(initialSwfL1.totalDeposited);
expect(terminalSwfL1.totalWithdrawn).to.equal(initialSwfL1.totalWithdrawn);
expect(terminalSwfTotalAssets).to.equal(initialSwfTotalAssets);
expect(terminalSwfTxCount).to.equal(initialSwfTxCount);

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");

const replayExecution = await realTrigger.executions(1);
const emptyReplayExecution = await realTrigger.executions(2);
const replaySwfL1 = await realSwf.layerL1();

expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(terminalReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(terminalLiquidityCap);
expect(await kernelContract.triggerActivationCount()).to.equal(initialActivationCount + 1n);
expect(await realTrigger.executionCount()).to.equal(initialExecutionCount + 1n);
expect(replayExecution.violationId).to.equal(terminalExecution.violationId);
expect(replayExecution.offender).to.equal(terminalExecution.offender);
expect(replayExecution.violationCode).to.equal(terminalExecution.violationCode);
expect(replayExecution.executedAt).to.equal(terminalExecution.executedAt);
expect(replayExecution.treasuryBlocked).to.equal(terminalExecution.treasuryBlocked);
expect(replayExecution.signatureRevoked).to.equal(terminalExecution.signatureRevoked);
expect(replayExecution.publicNotified).to.equal(terminalExecution.publicNotified);
expect(replayExecution.interimReplacement).to.equal(terminalExecution.interimReplacement);
expect(emptyReplayExecution.violationId).to.equal(0);
expect(emptyReplayExecution.offender).to.equal(ethers.ZeroAddress);
expect(await realTreasury.isBlocked(offender.address)).to.equal(terminalTreasuryBlocked);
expect(await realTreasury.totalBudgetAllocated()).to.equal(terminalTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(terminalTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(terminalTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(terminalTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(terminalTreasuryRemainingCapacity);
expect(replaySwfL1.balance).to.equal(terminalSwfL1.balance);
expect(replaySwfL1.totalDeposited).to.equal(terminalSwfL1.totalDeposited);
expect(replaySwfL1.totalWithdrawn).to.equal(terminalSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(terminalSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(terminalSwfTxCount);
});

it("terminal trigger state remains immutable after finalization", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 13);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offender.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

await kernelContract.connect(oracle).flagViolation(4, offender.address, "terminal immutability audit");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const preTerminalRecord = await kernelContract.violations(violationId);
const preTerminalExecution = await realTrigger.executions(1);
const preTerminalActivationCount = await kernelContract.triggerActivationCount();
const preTerminalExecutionCount = await realTrigger.executionCount();
const preTerminalTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const preTerminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const preTerminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const preTerminalTreasuryTxCount = await realTreasury.txCount();
const preTerminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const preTerminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const preTerminalSwfL1 = await realSwf.layerL1();
const preTerminalSwfTotalAssets = await realSwf.totalAssets();
const preTerminalSwfTxCount = await realSwf.txCount();
const preTerminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const preTerminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();

expect(preTerminalRecord.courtConfirmed).to.be.false;
expect(preTerminalRecord.signaturesCount).to.equal(6);
expect(preTerminalRecord.triggered).to.be.false;
expect(preTerminalExecution.violationId).to.equal(0);
expect(preTerminalExecution.offender).to.equal(ethers.ZeroAddress);
expect(preTerminalActivationCount).to.equal(0);
expect(preTerminalExecutionCount).to.equal(0);

await expect(
kernelContract.connect(courtSigners[6]).signViolation(violationId)
).to.emit(kernelContract, "TriggerActivated");

const terminalRecord = await kernelContract.violations(violationId);
const terminalExecution = await realTrigger.executions(1);
const terminalActivationCount = await kernelContract.triggerActivationCount();
const terminalExecutionCount = await realTrigger.executionCount();
const terminalViolationCount = await kernelContract.violationCount();
const terminalTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const terminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const terminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const terminalTreasuryTxCount = await realTreasury.txCount();
const terminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const terminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const terminalSwfL1 = await realSwf.layerL1();
const terminalSwfTotalAssets = await realSwf.totalAssets();
const terminalSwfTxCount = await realSwf.txCount();
const terminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const terminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();

expect(terminalRecord.violationCode).to.equal(4);
expect(terminalRecord.offender).to.equal(offender.address);
expect(terminalRecord.reason).to.equal("terminal immutability audit");
expect(terminalRecord.courtConfirmed).to.be.true;
expect(terminalRecord.signaturesCount).to.equal(7);
expect(terminalRecord.triggered).to.be.true;
expect(terminalExecution.violationId).to.equal(violationId);
expect(terminalExecution.offender).to.equal(offender.address);
expect(terminalExecution.violationCode).to.equal(4);
expect(terminalExecution.treasuryBlocked).to.be.true;
expect(terminalExecution.signatureRevoked).to.be.true;
expect(terminalExecution.publicNotified).to.be.true;
expect(terminalActivationCount).to.equal(preTerminalActivationCount + 1n);
expect(terminalExecutionCount).to.equal(preTerminalExecutionCount + 1n);
expect(terminalTreasuryBlocked).to.be.true; // TG-01: blocked on terminal trigger
expect(terminalTreasuryBudgetAllocated).to.equal(preTerminalTreasuryBudgetAllocated);
expect(terminalTreasuryFiscalYear).to.equal(preTerminalTreasuryFiscalYear);
expect(terminalTreasuryTxCount).to.equal(preTerminalTreasuryTxCount);
expect(terminalTreasuryBudgetLineCount).to.equal(preTerminalTreasuryBudgetLineCount);
expect(terminalTreasuryRemainingCapacity).to.equal(preTerminalTreasuryRemainingCapacity);
expect(terminalSwfL1.balance).to.equal(preTerminalSwfL1.balance);
expect(terminalSwfL1.totalDeposited).to.equal(preTerminalSwfL1.totalDeposited);
expect(terminalSwfL1.totalWithdrawn).to.equal(preTerminalSwfL1.totalWithdrawn);
expect(terminalSwfTotalAssets).to.equal(preTerminalSwfTotalAssets);
expect(terminalSwfTxCount).to.equal(preTerminalSwfTxCount);
expect(terminalReserveRatio).to.equal(preTerminalReserveRatio);
expect(terminalLiquidityCap).to.equal(preTerminalLiquidityCap);

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");

await expect(
realTrigger.connect(oracle).executeTrigger(violationId, offender.address, 4, ethers.ZeroAddress)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");

await expect(
kernelContract.connect(oracle).flagViolation(4, offender.address, "post-finalization oracle signal")
).to.emit(kernelContract, "ViolationFlagged");

const finalizedRecord = await kernelContract.violations(violationId);
const finalizedExecution = await realTrigger.executions(1);
const emptyReplayExecution = await realTrigger.executions(2);
const postFinalizationSignal = await kernelContract.violations(2);
const finalizedSwfL1 = await realSwf.layerL1();

expect(postFinalizationSignal.violationCode).to.equal(4);
expect(postFinalizationSignal.offender).to.equal(offender.address);
expect(postFinalizationSignal.courtConfirmed).to.be.false;
expect(postFinalizationSignal.signaturesCount).to.equal(0);
expect(postFinalizationSignal.triggered).to.be.false;
expect(await kernelContract.violationCount()).to.equal(terminalViolationCount + 1n);

expect(finalizedRecord.violationCode).to.equal(terminalRecord.violationCode);
expect(finalizedRecord.offender).to.equal(terminalRecord.offender);
expect(finalizedRecord.reason).to.equal(terminalRecord.reason);
expect(finalizedRecord.timestamp).to.equal(terminalRecord.timestamp);
expect(finalizedRecord.courtConfirmed).to.equal(terminalRecord.courtConfirmed);
expect(finalizedRecord.signaturesCount).to.equal(terminalRecord.signaturesCount);
expect(finalizedRecord.triggered).to.equal(terminalRecord.triggered);

expect(finalizedExecution.violationId).to.equal(terminalExecution.violationId);
expect(finalizedExecution.offender).to.equal(terminalExecution.offender);
expect(finalizedExecution.violationCode).to.equal(terminalExecution.violationCode);
expect(finalizedExecution.executedAt).to.equal(terminalExecution.executedAt);
expect(finalizedExecution.treasuryBlocked).to.equal(terminalExecution.treasuryBlocked);
expect(finalizedExecution.signatureRevoked).to.equal(terminalExecution.signatureRevoked);
expect(finalizedExecution.publicNotified).to.equal(terminalExecution.publicNotified);
expect(finalizedExecution.interimReplacement).to.equal(terminalExecution.interimReplacement);
expect(emptyReplayExecution.violationId).to.equal(0);
expect(emptyReplayExecution.offender).to.equal(ethers.ZeroAddress);

expect(await kernelContract.triggerActivationCount()).to.equal(terminalActivationCount);
expect(await realTrigger.executionCount()).to.equal(terminalExecutionCount);
expect(await realTreasury.isBlocked(offender.address)).to.equal(terminalTreasuryBlocked);
expect(await realTreasury.totalBudgetAllocated()).to.equal(terminalTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(terminalTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(terminalTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(terminalTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(terminalTreasuryRemainingCapacity);
expect(finalizedSwfL1.balance).to.equal(terminalSwfL1.balance);
expect(finalizedSwfL1.totalDeposited).to.equal(terminalSwfL1.totalDeposited);
expect(finalizedSwfL1.totalWithdrawn).to.equal(terminalSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(terminalSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(terminalSwfTxCount);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(terminalReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(terminalLiquidityCap);
});

it("trigger execution path remains deterministic under repeated evaluation", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender, replayCaller] = signers;
const extraCourts = signers.slice(6, 14);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offender.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

await kernelContract.connect(oracle).flagViolation(4, offender.address, "deterministic execution audit");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

await kernelContract.connect(courtSigners[6]).signViolation(violationId);

const terminalRecord = await kernelContract.violations(violationId);
const terminalExecution = await realTrigger.executions(1);
const terminalActivationCount = await kernelContract.triggerActivationCount();
const terminalExecutionCount = await realTrigger.executionCount();
const terminalTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const terminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const terminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const terminalTreasuryTxCount = await realTreasury.txCount();
const terminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const terminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const terminalSwfL1 = await realSwf.layerL1();
const terminalSwfTotalAssets = await realSwf.totalAssets();
const terminalSwfTxCount = await realSwf.txCount();
const terminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const terminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();

expect(terminalRecord.courtConfirmed).to.be.true;
expect(terminalRecord.signaturesCount).to.equal(7);
expect(terminalRecord.triggered).to.be.true;
expect(terminalExecution.violationId).to.equal(violationId);
expect(terminalExecution.offender).to.equal(offender.address);
expect(terminalExecution.violationCode).to.equal(4);
expect(terminalActivationCount).to.equal(1);
expect(terminalExecutionCount).to.equal(1);

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");

await expect(
realTrigger.connect(replayCaller).executeTrigger(
violationId,
offender.address,
4,
ethers.ZeroAddress
)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");

await expect(
realTrigger.connect(replayCaller).executeTrigger(
violationId,
offender.address,
4,
ethers.ZeroAddress
)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");

const replayRecord = await kernelContract.violations(violationId);
const replayExecution = await realTrigger.executions(1);
const emptyReplayExecution = await realTrigger.executions(2);
const replaySwfL1 = await realSwf.layerL1();

expect(replayRecord.violationCode).to.equal(terminalRecord.violationCode);
expect(replayRecord.offender).to.equal(terminalRecord.offender);
expect(replayRecord.reason).to.equal(terminalRecord.reason);
expect(replayRecord.timestamp).to.equal(terminalRecord.timestamp);
expect(replayRecord.courtConfirmed).to.equal(terminalRecord.courtConfirmed);
expect(replayRecord.signaturesCount).to.equal(terminalRecord.signaturesCount);
expect(replayRecord.triggered).to.equal(terminalRecord.triggered);

expect(replayExecution.violationId).to.equal(terminalExecution.violationId);
expect(replayExecution.offender).to.equal(terminalExecution.offender);
expect(replayExecution.violationCode).to.equal(terminalExecution.violationCode);
expect(replayExecution.executedAt).to.equal(terminalExecution.executedAt);
expect(replayExecution.treasuryBlocked).to.equal(terminalExecution.treasuryBlocked);
expect(replayExecution.signatureRevoked).to.equal(terminalExecution.signatureRevoked);
expect(replayExecution.publicNotified).to.equal(terminalExecution.publicNotified);
expect(replayExecution.interimReplacement).to.equal(terminalExecution.interimReplacement);
expect(emptyReplayExecution.violationId).to.equal(0);
expect(emptyReplayExecution.offender).to.equal(ethers.ZeroAddress);

expect(await kernelContract.triggerActivationCount()).to.equal(terminalActivationCount);
expect(await realTrigger.executionCount()).to.equal(terminalExecutionCount);
expect(await realTreasury.isBlocked(offender.address)).to.equal(terminalTreasuryBlocked);
expect(await realTreasury.totalBudgetAllocated()).to.equal(terminalTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(terminalTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(terminalTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(terminalTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(terminalTreasuryRemainingCapacity);
expect(replaySwfL1.balance).to.equal(terminalSwfL1.balance);
expect(replaySwfL1.totalDeposited).to.equal(terminalSwfL1.totalDeposited);
expect(replaySwfL1.totalWithdrawn).to.equal(terminalSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(terminalSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(terminalSwfTxCount);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(terminalReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(terminalLiquidityCap);
});

it("independent triggers preserve isolated execution domains", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offenderOne, offenderTwo] = signers;
const extraCourts = signers.slice(6, 14);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offenderOne.address, GUARDIAN_ROLE);
await kernelContract.connect(sovereign).grantOfficialAccess(offenderTwo.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

await kernelContract.connect(oracle).flagViolation(4, offenderOne.address, "first isolated trigger");
await kernelContract.connect(oracle).flagViolation(4, offenderTwo.address, "second isolated trigger");

const firstViolationId = 1n;
const secondViolationId = 2n;
const courtSigners = [court, ...extraCourts];

for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(firstViolationId);
await kernelContract.connect(courtSigners[i]).signViolation(secondViolationId);
}

const firstPreTerminalRecord = await kernelContract.violations(firstViolationId);
const secondPreTerminalRecord = await kernelContract.violations(secondViolationId);
const firstPreTerminalExecution = await realTrigger.executions(1);
const secondPreTerminalExecution = await realTrigger.executions(2);
const preTerminalActivationCount = await kernelContract.triggerActivationCount();
const preTerminalExecutionCount = await realTrigger.executionCount();
const preTerminalTreasuryOneBlocked = await realTreasury.isBlocked(offenderOne.address);
const preTerminalTreasuryTwoBlocked = await realTreasury.isBlocked(offenderTwo.address);
const preTerminalTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const preTerminalTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const preTerminalTreasuryTxCount = await realTreasury.txCount();
const preTerminalTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const preTerminalTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const preTerminalSwfL1 = await realSwf.layerL1();
const preTerminalSwfTotalAssets = await realSwf.totalAssets();
const preTerminalSwfTxCount = await realSwf.txCount();
const preTerminalReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const preTerminalLiquidityCap = await kernelContract.LIQUIDITY_CAP();

expect(firstPreTerminalRecord.signaturesCount).to.equal(6);
expect(firstPreTerminalRecord.triggered).to.be.false;
expect(secondPreTerminalRecord.signaturesCount).to.equal(6);
expect(secondPreTerminalRecord.triggered).to.be.false;
expect(firstPreTerminalExecution.violationId).to.equal(0);
expect(secondPreTerminalExecution.violationId).to.equal(0);
expect(preTerminalActivationCount).to.equal(0);
expect(preTerminalExecutionCount).to.equal(0);

await kernelContract.connect(courtSigners[6]).signViolation(firstViolationId);

const firstTerminalRecord = await kernelContract.violations(firstViolationId);
const secondIsolatedRecord = await kernelContract.violations(secondViolationId);
const firstExecution = await realTrigger.executions(1);
const secondExecution = await realTrigger.executions(2);
const postTerminalSwfL1 = await realSwf.layerL1();

expect(firstTerminalRecord.courtConfirmed).to.be.true;
expect(firstTerminalRecord.signaturesCount).to.equal(7);
expect(firstTerminalRecord.triggered).to.be.true;
expect(secondIsolatedRecord.courtConfirmed).to.be.false;
expect(secondIsolatedRecord.signaturesCount).to.equal(6);
expect(secondIsolatedRecord.triggered).to.be.false;

expect(await kernelContract.triggerActivationCount()).to.equal(preTerminalActivationCount + 1n);
expect(await realTrigger.executionCount()).to.equal(preTerminalExecutionCount + 1n);
expect(firstExecution.violationId).to.equal(firstViolationId);
expect(firstExecution.offender).to.equal(offenderOne.address);
expect(firstExecution.violationCode).to.equal(4);
expect(firstExecution.treasuryBlocked).to.be.true;
expect(firstExecution.signatureRevoked).to.be.true;
expect(firstExecution.publicNotified).to.be.true;
expect(secondExecution.violationId).to.equal(0);
expect(secondExecution.offender).to.equal(ethers.ZeroAddress);
expect(secondExecution.violationCode).to.equal(0);
expect(secondExecution.executedAt).to.equal(0);
expect(secondExecution.treasuryBlocked).to.be.false;
expect(secondExecution.signatureRevoked).to.be.false;
expect(secondExecution.publicNotified).to.be.false;
expect(secondExecution.interimReplacement).to.equal(ethers.ZeroAddress);

expect(await realTrigger.isTreasuryBlocked(offenderOne.address)).to.be.true;
expect(await realTrigger.isSignatureRevoked(offenderOne.address)).to.be.true;
expect(await realTrigger.isTreasuryBlocked(offenderTwo.address)).to.be.false;
expect(await realTrigger.isSignatureRevoked(offenderTwo.address)).to.be.false;
expect(await realTrigger.getInterimReplacement(offenderTwo.address)).to.equal(ethers.ZeroAddress);
expect(await realTreasury.isBlocked(offenderOne.address)).to.be.true; // TG-01: terminal trigger blocks Treasury
expect(await realTreasury.isBlocked(offenderTwo.address)).to.equal(preTerminalTreasuryTwoBlocked); // non-terminal: unchanged
expect(await realTreasury.totalBudgetAllocated()).to.equal(preTerminalTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(preTerminalTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(preTerminalTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(preTerminalTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(preTerminalTreasuryRemainingCapacity);
expect(postTerminalSwfL1.balance).to.equal(preTerminalSwfL1.balance);
expect(postTerminalSwfL1.totalDeposited).to.equal(preTerminalSwfL1.totalDeposited);
expect(postTerminalSwfL1.totalWithdrawn).to.equal(preTerminalSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(preTerminalSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(preTerminalSwfTxCount);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(preTerminalReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(preTerminalLiquidityCap);
});

it("concurrent trigger paths preserve accounting and authority neutrality", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offenderOne, offenderTwo] = signers;
const extraCourts = signers.slice(6, 14);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offenderOne.address, GUARDIAN_ROLE);
await kernelContract.connect(sovereign).grantOfficialAccess(offenderTwo.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

await kernelContract.connect(oracle).flagViolation(4, offenderOne.address, "concurrent terminal trigger");
await kernelContract.connect(oracle).flagViolation(4, offenderTwo.address, "concurrent non-terminal trigger");

const terminalViolationId = 1n;
const activeViolationId = 2n;
const courtSigners = [court, ...extraCourts];

for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(terminalViolationId);
await kernelContract.connect(courtSigners[i]).signViolation(activeViolationId);
}

const terminalPreRecord = await kernelContract.violations(terminalViolationId);
const activePreRecord = await kernelContract.violations(activeViolationId);
const preExecutionOne = await realTrigger.executions(1);
const preExecutionTwo = await realTrigger.executions(2);
const preActivationCount = await kernelContract.triggerActivationCount();
const preExecutionCount = await realTrigger.executionCount();
const preTreasuryOneBlocked = await realTreasury.isBlocked(offenderOne.address);
const preTreasuryTwoBlocked = await realTreasury.isBlocked(offenderTwo.address);
const preTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const preTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const preTreasuryTxCount = await realTreasury.txCount();
const preTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const preTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const preSwfL1 = await realSwf.layerL1();
const preSwfTotalAssets = await realSwf.totalAssets();
const preSwfTxCount = await realSwf.txCount();
const preReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const preLiquidityCap = await kernelContract.LIQUIDITY_CAP();

expect(terminalPreRecord.signaturesCount).to.equal(6);
expect(terminalPreRecord.triggered).to.be.false;
expect(activePreRecord.signaturesCount).to.equal(6);
expect(activePreRecord.triggered).to.be.false;
expect(preExecutionOne.violationId).to.equal(0);
expect(preExecutionTwo.violationId).to.equal(0);
expect(preActivationCount).to.equal(0);
expect(preExecutionCount).to.equal(0);

await kernelContract.connect(courtSigners[6]).signViolation(terminalViolationId);

await expect(
kernelContract.connect(courtSigners[7]).signViolation(terminalViolationId)
).to.be.revertedWith("Kernel: trigger already activated");

const terminalPostRecord = await kernelContract.violations(terminalViolationId);
const activePostRecord = await kernelContract.violations(activeViolationId);
const terminalExecution = await realTrigger.executions(1);
const crossExecution = await realTrigger.executions(2);
const postSwfL1 = await realSwf.layerL1();

expect(terminalPostRecord.courtConfirmed).to.be.true;
expect(terminalPostRecord.signaturesCount).to.equal(7);
expect(terminalPostRecord.triggered).to.be.true;
expect(activePostRecord.courtConfirmed).to.be.false;
expect(activePostRecord.signaturesCount).to.equal(6);
expect(activePostRecord.triggered).to.be.false;

expect(await kernelContract.triggerActivationCount()).to.equal(preActivationCount + 1n);
expect(await realTrigger.executionCount()).to.equal(preExecutionCount + 1n);
expect(terminalExecution.violationId).to.equal(terminalViolationId);
expect(terminalExecution.offender).to.equal(offenderOne.address);
expect(terminalExecution.violationCode).to.equal(4);
expect(terminalExecution.treasuryBlocked).to.be.true;
expect(terminalExecution.signatureRevoked).to.be.true;
expect(terminalExecution.publicNotified).to.be.true;
expect(crossExecution.violationId).to.equal(0);
expect(crossExecution.offender).to.equal(ethers.ZeroAddress);
expect(crossExecution.violationCode).to.equal(0);
expect(crossExecution.executedAt).to.equal(0);
expect(crossExecution.treasuryBlocked).to.be.false;
expect(crossExecution.signatureRevoked).to.be.false;
expect(crossExecution.publicNotified).to.be.false;
expect(crossExecution.interimReplacement).to.equal(ethers.ZeroAddress);

expect(await realTrigger.isTreasuryBlocked(offenderOne.address)).to.be.true;
expect(await realTrigger.isSignatureRevoked(offenderOne.address)).to.be.true;
expect(await realTrigger.isTreasuryBlocked(offenderTwo.address)).to.be.false;
expect(await realTrigger.isSignatureRevoked(offenderTwo.address)).to.be.false;
expect(await realTrigger.getInterimReplacement(offenderTwo.address)).to.equal(ethers.ZeroAddress);
expect(await realTreasury.isBlocked(offenderOne.address)).to.be.true; // TG-01: terminal trigger blocks Treasury
expect(await realTreasury.isBlocked(offenderTwo.address)).to.equal(preTreasuryTwoBlocked); // non-terminal: unchanged
expect(await realTreasury.totalBudgetAllocated()).to.equal(preTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(preTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(preTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(preTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(preTreasuryRemainingCapacity);
expect(postSwfL1.balance).to.equal(preSwfL1.balance);
expect(postSwfL1.totalDeposited).to.equal(preSwfL1.totalDeposited);
expect(postSwfL1.totalWithdrawn).to.equal(preSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(preSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(preSwfTxCount);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(preReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(preLiquidityCap);
});

it("trigger execution paths cannot escalate authority roles", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender, replayCaller] = signers;
const extraCourts = signers.slice(6, 14);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

// TG-01: grant KERNEL_ROLE to TriggerProtocol BEFORE snapshot so matrix is consistent pre/post trigger
const kernelRoles = [
await kernelContract.SOVEREIGN_ROLE(),
await kernelContract.COURT_ROLE(),
await kernelContract.ORACLE_ROLE(),
await kernelContract.GUARDIAN_ROLE()
];
const treasuryRoles = [
await realTreasury.KERNEL_ROLE(),
await realTreasury.PARLIAMENT_ROLE(),
await realTreasury.GOVERNMENT_ROLE(),
await realTreasury.AUDITOR_ROLE(),
await realTreasury.SWF_ROLE()
];
const swfRoles = [
await realSwf.SOVEREIGN_ROLE(),
await realSwf.COUNCIL_ROLE(),
await realSwf.KERNEL_ROLE(),
await realSwf.RECLAIM_ROLE()
];
const authoritySubjects = [
await realTrigger.getAddress(),
offender.address,
oracle.address,
replayCaller.address
];

const snapshotRoleMatrix = async (contract, roles) => {
const matrix = [];
for (const subject of authoritySubjects) {
const subjectRoles = [];
for (const role of roles) {
subjectRoles.push(await contract.hasRole(role, subject));
}
matrix.push(subjectRoles);
}
return matrix;
};
const expectRoleMatrixUnchanged = async (contract, roles, snapshot) => {
for (let subjectIndex = 0; subjectIndex < authoritySubjects.length; subjectIndex++) {
for (let roleIndex = 0; roleIndex < roles.length; roleIndex++) {
expect(await contract.hasRole(roles[roleIndex], authoritySubjects[subjectIndex])).to.equal(
snapshot[subjectIndex][roleIndex]
);
}
}
};

const kernelRoleSnapshot = await snapshotRoleMatrix(kernelContract, kernelRoles);
const treasuryRoleSnapshot = await snapshotRoleMatrix(realTreasury, treasuryRoles);
const swfRoleSnapshot = await snapshotRoleMatrix(realSwf, swfRoles);
const preActivationCount = await kernelContract.triggerActivationCount();
const preExecutionCount = await realTrigger.executionCount();
const preEmergencyLock = await kernelContract.emergencyLockActive();
const preTreasuryBlocked = await realTreasury.isBlocked(offender.address);
const preTreasuryBudgetAllocated = await realTreasury.totalBudgetAllocated();
const preTreasuryFiscalYear = await realTreasury.currentFiscalYear();
const preTreasuryTxCount = await realTreasury.txCount();
const preTreasuryBudgetLineCount = await realTreasury.budgetLineCount();
const preTreasuryRemainingCapacity = await realTreasury.getRemainingCapacity();
const preSwfL1 = await realSwf.layerL1();
const preSwfTotalAssets = await realSwf.totalAssets();
const preSwfTxCount = await realSwf.txCount();
const preReserveRatio = await kernelContract.MIN_RESERVE_RATIO();
const preLiquidityCap = await kernelContract.LIQUIDITY_CAP();

await kernelContract.connect(oracle).flagViolation(4, offender.address, "authority escalation audit");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}

const nonTerminalRecord = await kernelContract.violations(violationId);
expect(nonTerminalRecord.violationCode).to.equal(4);
expect(nonTerminalRecord.offender).to.equal(offender.address);
expect(nonTerminalRecord.reason).to.equal("authority escalation audit");
expect(nonTerminalRecord.courtConfirmed).to.be.false;
expect(nonTerminalRecord.signaturesCount).to.equal(6);
expect(nonTerminalRecord.triggered).to.be.false;
expect(await kernelContract.triggerActivationCount()).to.equal(preActivationCount);
expect(await realTrigger.executionCount()).to.equal(preExecutionCount);
await expectRoleMatrixUnchanged(kernelContract, kernelRoles, kernelRoleSnapshot);
await expectRoleMatrixUnchanged(realTreasury, treasuryRoles, treasuryRoleSnapshot);
await expectRoleMatrixUnchanged(realSwf, swfRoles, swfRoleSnapshot);

await expect(
kernelContract.connect(offender).grantOfficialAccess(offender.address, kernelRoles[2])
).to.be.revertedWith("Kernel: caller is not the Sovereign");
await expect(
realTreasury.connect(offender).blockAddressByTrigger(replayCaller.address)
).to.be.reverted;
await expect(
realSwf.connect(offender).depositToL1(1, "unauthorized non-terminal deposit")
).to.be.reverted;
await expect(
realSwf.connect(oracle).depositToL1(1, "unauthorized oracle deposit")
).to.be.reverted;

await kernelContract.connect(courtSigners[6]).signViolation(violationId);

const terminalRecord = await kernelContract.violations(violationId);
const terminalExecution = await realTrigger.executions(1);
expect(terminalRecord.courtConfirmed).to.be.true;
expect(terminalRecord.signaturesCount).to.equal(7);
expect(terminalRecord.triggered).to.be.true;
expect(terminalExecution.violationId).to.equal(violationId);
expect(terminalExecution.offender).to.equal(offender.address);
expect(terminalExecution.violationCode).to.equal(4);
expect(await kernelContract.triggerActivationCount()).to.equal(preActivationCount + 1n);
expect(await realTrigger.executionCount()).to.equal(preExecutionCount + 1n);
await expectRoleMatrixUnchanged(kernelContract, kernelRoles, kernelRoleSnapshot);
await expectRoleMatrixUnchanged(realTreasury, treasuryRoles, treasuryRoleSnapshot);
await expectRoleMatrixUnchanged(realSwf, swfRoles, swfRoleSnapshot);

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");
await expect(
realTrigger.connect(replayCaller).executeTrigger(violationId, offender.address, 4, ethers.ZeroAddress)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
await expect(
kernelContract.connect(replayCaller).grantOfficialAccess(replayCaller.address, kernelRoles[1])
).to.be.revertedWith("Kernel: caller is not the Sovereign");
await expect(
realTreasury.connect(replayCaller).blockAddressByTrigger(offender.address)
).to.be.reverted;
await expect(
realSwf.connect(replayCaller).receiveReclaimedAsset(1, "unauthorized replay reclaim")
).to.be.reverted;

const replayRecord = await kernelContract.violations(violationId);
const replayExecution = await realTrigger.executions(1);
const emptyExecution = await realTrigger.executions(2);
const postSwfL1 = await realSwf.layerL1();

expect(replayRecord.violationCode).to.equal(terminalRecord.violationCode);
expect(replayRecord.offender).to.equal(terminalRecord.offender);
expect(replayRecord.reason).to.equal(terminalRecord.reason);
expect(replayRecord.timestamp).to.equal(terminalRecord.timestamp);
expect(replayRecord.courtConfirmed).to.equal(terminalRecord.courtConfirmed);
expect(replayRecord.signaturesCount).to.equal(terminalRecord.signaturesCount);
expect(replayRecord.triggered).to.equal(terminalRecord.triggered);
expect(replayExecution.violationId).to.equal(terminalExecution.violationId);
expect(replayExecution.offender).to.equal(terminalExecution.offender);
expect(replayExecution.violationCode).to.equal(terminalExecution.violationCode);
expect(replayExecution.executedAt).to.equal(terminalExecution.executedAt);
expect(replayExecution.treasuryBlocked).to.equal(terminalExecution.treasuryBlocked);
expect(replayExecution.signatureRevoked).to.equal(terminalExecution.signatureRevoked);
expect(replayExecution.publicNotified).to.equal(terminalExecution.publicNotified);
expect(emptyExecution.violationId).to.equal(0);
expect(emptyExecution.offender).to.equal(ethers.ZeroAddress);

await expectRoleMatrixUnchanged(kernelContract, kernelRoles, kernelRoleSnapshot);
await expectRoleMatrixUnchanged(realTreasury, treasuryRoles, treasuryRoleSnapshot);
await expectRoleMatrixUnchanged(realSwf, swfRoles, swfRoleSnapshot);
expect(await kernelContract.emergencyLockActive()).to.equal(preEmergencyLock);
expect(await kernelContract.triggerActivationCount()).to.equal(preActivationCount + 1n);
expect(await realTrigger.executionCount()).to.equal(preExecutionCount + 1n);
expect(await realTreasury.isBlocked(offender.address)).to.be.true; // TG-01: terminal trigger blocks Treasury
expect(await realTreasury.totalBudgetAllocated()).to.equal(preTreasuryBudgetAllocated);
expect(await realTreasury.currentFiscalYear()).to.equal(preTreasuryFiscalYear);
expect(await realTreasury.txCount()).to.equal(preTreasuryTxCount);
expect(await realTreasury.budgetLineCount()).to.equal(preTreasuryBudgetLineCount);
expect(await realTreasury.getRemainingCapacity()).to.equal(preTreasuryRemainingCapacity);
expect(postSwfL1.balance).to.equal(preSwfL1.balance);
expect(postSwfL1.totalDeposited).to.equal(preSwfL1.totalDeposited);
expect(postSwfL1.totalWithdrawn).to.equal(preSwfL1.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(preSwfTotalAssets);
expect(await realSwf.txCount()).to.equal(preSwfTxCount);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(preReserveRatio);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(preLiquidityCap);
});

it("failed trigger execution path preserves accounting state", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender, unauthorizedCaller] = signers;

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());
await kernelContract.connect(oracle).flagViolation(4, offender.address, "failed trigger neutrality audit");

const violationRecordSnapshot = await kernelContract.violations(1);
const activationCountSnapshot = await kernelContract.triggerActivationCount();
const executionCountSnapshot = await realTrigger.executionCount();
const emptyExecutionSnapshot = await realTrigger.executions(1);
const triggerBlockedSnapshot = await realTrigger.isTreasuryBlocked(offender.address);
const signatureRevokedSnapshot = await realTrigger.isSignatureRevoked(offender.address);
const replacementSnapshot = await realTrigger.getInterimReplacement(offender.address);
const treasuryBlockedSnapshot = await realTreasury.isBlocked(offender.address);
const budgetAllocatedSnapshot = await realTreasury.totalBudgetAllocated();
const fiscalYearSnapshot = await realTreasury.currentFiscalYear();
const l1Snapshot = await realSwf.layerL1();
const totalAssetsSnapshot = await realSwf.totalAssets();
const liquidityCapSnapshot = await kernelContract.LIQUIDITY_CAP();
const reserveRatioSnapshot = await kernelContract.MIN_RESERVE_RATIO();

await expect(
realTrigger.connect(unauthorizedCaller).executeTrigger(1, offender.address, 4, ethers.ZeroAddress)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");

await expect(
realTrigger.connect(unauthorizedCaller).executeTrigger(1, offender.address, 4, ethers.ZeroAddress)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");

const violationRecord = await kernelContract.violations(1);
const emptyExecution = await realTrigger.executions(1);
const l1 = await realSwf.layerL1();

expect(violationRecord.violationCode).to.equal(violationRecordSnapshot.violationCode);
expect(violationRecord.offender).to.equal(violationRecordSnapshot.offender);
expect(violationRecord.reason).to.equal(violationRecordSnapshot.reason);
expect(violationRecord.timestamp).to.equal(violationRecordSnapshot.timestamp);
expect(violationRecord.courtConfirmed).to.equal(violationRecordSnapshot.courtConfirmed);
expect(violationRecord.signaturesCount).to.equal(violationRecordSnapshot.signaturesCount);
expect(violationRecord.triggered).to.equal(violationRecordSnapshot.triggered);
expect(violationRecord.triggered).to.be.false;

expect(await kernelContract.triggerActivationCount()).to.equal(activationCountSnapshot);
expect(await realTrigger.executionCount()).to.equal(executionCountSnapshot);
expect(emptyExecution.violationId).to.equal(emptyExecutionSnapshot.violationId);
expect(emptyExecution.offender).to.equal(emptyExecutionSnapshot.offender);
expect(emptyExecution.violationCode).to.equal(emptyExecutionSnapshot.violationCode);
expect(emptyExecution.executedAt).to.equal(emptyExecutionSnapshot.executedAt);
expect(emptyExecution.treasuryBlocked).to.equal(emptyExecutionSnapshot.treasuryBlocked);
expect(emptyExecution.signatureRevoked).to.equal(emptyExecutionSnapshot.signatureRevoked);
expect(emptyExecution.publicNotified).to.equal(emptyExecutionSnapshot.publicNotified);
expect(emptyExecution.interimReplacement).to.equal(emptyExecutionSnapshot.interimReplacement);

expect(await realTrigger.isTreasuryBlocked(offender.address)).to.equal(triggerBlockedSnapshot);
expect(await realTrigger.isSignatureRevoked(offender.address)).to.equal(signatureRevokedSnapshot);
expect(await realTrigger.getInterimReplacement(offender.address)).to.equal(replacementSnapshot);
expect(await realTreasury.isBlocked(offender.address)).to.equal(treasuryBlockedSnapshot);
expect(await realTreasury.totalBudgetAllocated()).to.equal(budgetAllocatedSnapshot);
expect(await realTreasury.currentFiscalYear()).to.equal(fiscalYearSnapshot);
expect(l1.balance).to.equal(l1Snapshot.balance);
expect(l1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
expect(l1.totalWithdrawn).to.equal(l1Snapshot.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(totalAssetsSnapshot);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(liquidityCapSnapshot);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(reserveRatioSnapshot);
});

it("repeated trigger execution remains accounting-neutral after terminal state", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 13);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const GUARDIAN_ROLE = await kernelContract.GUARDIAN_ROLE();
await kernelContract.connect(sovereign).grantOfficialAccess(offender.address, GUARDIAN_ROLE);
for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

await kernelContract.connect(oracle).flagViolation(4, offender.address, "trigger replay audit");
const violationId = 1n;
const courtSigners = [court, ...extraCourts];

for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}
await kernelContract.connect(courtSigners[6]).signViolation(violationId);

const terminalRecord = await kernelContract.violations(violationId);
const terminalExecution = await realTrigger.executions(1);
const activationCountSnapshot = await kernelContract.triggerActivationCount();
const executionCountSnapshot = await realTrigger.executionCount();
const treasuryBlockedSnapshot = await realTreasury.isBlocked(offender.address);
const budgetAllocatedSnapshot = await realTreasury.totalBudgetAllocated();
const fiscalYearSnapshot = await realTreasury.currentFiscalYear();
const l1Snapshot = await realSwf.layerL1();
const totalAssetsSnapshot = await realSwf.totalAssets();
const liquidityCapSnapshot = await kernelContract.LIQUIDITY_CAP();
const reserveRatioSnapshot = await kernelContract.MIN_RESERVE_RATIO();

expect(terminalRecord.courtConfirmed).to.be.true;
expect(terminalRecord.triggered).to.be.true;
expect(terminalRecord.signaturesCount).to.equal(7);
expect(terminalExecution.violationId).to.equal(violationId);
expect(terminalExecution.offender).to.equal(offender.address);
expect(terminalExecution.violationCode).to.equal(4);
expect(await realTrigger.isTreasuryBlocked(offender.address)).to.be.true;

await expect(
kernelContract.connect(courtSigners[7]).signViolation(violationId)
).to.be.revertedWith("Kernel: trigger already activated");

const finalRecord = await kernelContract.violations(violationId);
const finalExecution = await realTrigger.executions(1);
const emptyReplayExecution = await realTrigger.executions(2);
const finalL1 = await realSwf.layerL1();

expect(finalRecord.violationCode).to.equal(terminalRecord.violationCode);
expect(finalRecord.offender).to.equal(terminalRecord.offender);
expect(finalRecord.reason).to.equal(terminalRecord.reason);
expect(finalRecord.timestamp).to.equal(terminalRecord.timestamp);
expect(finalRecord.courtConfirmed).to.equal(terminalRecord.courtConfirmed);
expect(finalRecord.signaturesCount).to.equal(terminalRecord.signaturesCount);
expect(finalRecord.triggered).to.equal(terminalRecord.triggered);

expect(finalExecution.violationId).to.equal(terminalExecution.violationId);
expect(finalExecution.offender).to.equal(terminalExecution.offender);
expect(finalExecution.violationCode).to.equal(terminalExecution.violationCode);
expect(finalExecution.executedAt).to.equal(terminalExecution.executedAt);
expect(finalExecution.treasuryBlocked).to.equal(terminalExecution.treasuryBlocked);
expect(finalExecution.signatureRevoked).to.equal(terminalExecution.signatureRevoked);
expect(finalExecution.publicNotified).to.equal(terminalExecution.publicNotified);
expect(finalExecution.interimReplacement).to.equal(terminalExecution.interimReplacement);
expect(emptyReplayExecution.violationId).to.equal(0);
expect(emptyReplayExecution.offender).to.equal(ethers.ZeroAddress);

expect(await kernelContract.triggerActivationCount()).to.equal(activationCountSnapshot);
expect(await realTrigger.executionCount()).to.equal(executionCountSnapshot);
expect(await realTreasury.isBlocked(offender.address)).to.equal(treasuryBlockedSnapshot);
expect(await realTreasury.totalBudgetAllocated()).to.equal(budgetAllocatedSnapshot);
expect(await realTreasury.currentFiscalYear()).to.equal(fiscalYearSnapshot);
expect(finalL1.balance).to.equal(l1Snapshot.balance);
expect(finalL1.totalDeposited).to.equal(l1Snapshot.totalDeposited);
expect(finalL1.totalWithdrawn).to.equal(l1Snapshot.totalWithdrawn);
expect(await realSwf.totalAssets()).to.equal(totalAssetsSnapshot);
expect(await kernelContract.LIQUIDITY_CAP()).to.equal(liquidityCapSnapshot);
expect(await kernelContract.MIN_RESERVE_RATIO()).to.equal(reserveRatioSnapshot);
});

it("trigger activation revokes offender kernel role and preserves SWF COUNCIL_ROLE as design-boundary fact", async function () {
const signers = await ethers.getSigners();
const [sovereign, court, oracle, swfOwner, offender] = signers;
const extraCourts = signers.slice(5, 11);

const Kernel = await ethers.getContractFactory("IranOS_Kernel");
const kernelContract = await Kernel.deploy(
sovereign.address,
court.address,
oracle.address,
swfOwner.address
);
await kernelContract.waitForDeployment();

const SWF = await ethers.getContractFactory("SovereignWealthFund");
const realSwf = await SWF.deploy(swfOwner.address, await kernelContract.getAddress());
await realSwf.waitForDeployment();

const Treasury = await ethers.getContractFactory("Treasury");
const realTreasury = await Treasury.deploy(sovereign.address, await kernelContract.getAddress());
await realTreasury.waitForDeployment();

const Trigger = await ethers.getContractFactory("TriggerProtocol");
const realTrigger = await Trigger.deploy(
await kernelContract.getAddress(),
await realTreasury.getAddress(),
await realSwf.getAddress()
);
await realTrigger.waitForDeployment();
// TG-01: sovereign holds DEFAULT_ADMIN_ROLE on Treasury post-fix; grant KERNEL_ROLE so executeTrigger can call blockAddressByTrigger
await realTreasury.connect(sovereign).grantRole(await realTreasury.KERNEL_ROLE(), await realTrigger.getAddress());

await kernelContract.connect(sovereign).setTriggerProtocol(await realTrigger.getAddress());

const COURT_ROLE = await kernelContract.COURT_ROLE();
const COUNCIL_ROLE = await realSwf.COUNCIL_ROLE();

await kernelContract.connect(sovereign).grantOfficialAccess(offender.address, COURT_ROLE);
await realSwf.connect(swfOwner).grantRole(COUNCIL_ROLE, offender.address);

for (const extraCourt of extraCourts) {
await kernelContract.connect(sovereign).grantOfficialAccess(extraCourt.address, COURT_ROLE);
}

expect(await kernelContract.hasRole(COURT_ROLE, offender.address)).to.be.true;
expect(await realSwf.hasRole(COUNCIL_ROLE, offender.address)).to.be.true;
expect((await kernelContract.officialAccess(offender.address)).isActive).to.be.true;

await kernelContract.connect(oracle).flagViolation(4, offender.address, "P-07 authority boundary test");

const violationId = 1n;
const courtSigners = [court, ...extraCourts];
for (let i = 0; i < 6; i++) {
await kernelContract.connect(courtSigners[i]).signViolation(violationId);
}
await kernelContract.connect(courtSigners[6]).signViolation(violationId);

const terminalRecord = await kernelContract.violations(violationId);
expect(terminalRecord.triggered).to.be.true;
expect(await kernelContract.triggerActivationCount()).to.equal(1);

// Part A: kernel COURT_ROLE revoked from offender after trigger activation
expect(await kernelContract.hasRole(COURT_ROLE, offender.address)).to.be.false;
expect((await kernelContract.officialAccess(offender.address)).isActive).to.be.false;

// Part B: SWF COUNCIL_ROLE is NOT revoked — design boundary (executeTrigger only blocks treasury)
expect(await realSwf.hasRole(COUNCIL_ROLE, offender.address)).to.be.true;
});
});

describe("Execution Not Found", function () {
it("نباید اجرای ناموجود قابل دسترسی باشد", async function () {
const exec = await trigger.executions(999);
expect(exec.violationId).to.equal(0);
expect(exec.offender).to.equal(ethers.ZeroAddress);
expect(exec.violationCode).to.equal(0);
});
});

describe("TG-01 Treasury Auto-Block", function () {
it("TG-01: executeTrigger automatically propagates Treasury block in the same transaction", async function () {
// Deploy Treasury with kernel EOA — kernel gets KERNEL_ROLE + DEFAULT_ADMIN_ROLE
const Treasury = await ethers.getContractFactory("Treasury");
const tg01Treasury = await Treasury.deploy(kernel.address, kernel.address);
await tg01Treasury.waitForDeployment();

// Deploy TriggerProtocol wired to the same Treasury
const Trigger = await ethers.getContractFactory("TriggerProtocol");
const tg01Trigger = await Trigger.deploy(kernel.address, await tg01Treasury.getAddress(), swf.address);
await tg01Trigger.waitForDeployment();

// TG-01 authorization: grant KERNEL_ROLE to TriggerProtocol on Treasury
await tg01Treasury.connect(kernel).grantRole(await tg01Treasury.KERNEL_ROLE(), await tg01Trigger.getAddress());

const PARLIAMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARLIAMENT_ROLE"));
const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));

await tg01Treasury.connect(kernel).grantRole(PARLIAMENT_ROLE, kernel.address);
await tg01Treasury.connect(kernel).grantRole(GOVERNMENT_ROLE, user1.address);

const lineAmount = ethers.parseUnits("10000000000", 18);
await tg01Treasury.connect(kernel).createBudgetLine(0, lineAmount);

const budgetAllocatedBefore = await tg01Treasury.totalBudgetAllocated();
const txCountBefore = await tg01Treasury.txCount();
const fiscalYearBefore = await tg01Treasury.currentFiscalYear();

// Kernel executes trigger against attacker (simulates constitutional violation response)
await tg01Trigger.connect(kernel).executeTrigger(1, attacker.address, 1, ethers.ZeroAddress);

// A. TriggerProtocol internal state reflects blocking
expect(await tg01Trigger.isTreasuryBlocked(attacker.address)).to.be.true;

// B. TG-01: Treasury.isBlocked is now true — executeTrigger propagates in the same transaction
expect(await tg01Treasury.isBlocked(attacker.address)).to.be.true;

// C. Treasury now rejects transactions where the blocked address is the recipient
const txAmount = ethers.parseUnits("1000000000", 18);
await expect(
  tg01Treasury.connect(user1).proposeTransaction(attacker.address, txAmount, 1, "TG-01 blocked recipient")
).to.be.revertedWith("Treasury: address blocked by Trigger Protocol");

// D. Treasury budget accounting is unchanged — block did not mutate budget fields
expect(await tg01Treasury.txCount()).to.equal(txCountBefore);
expect(await tg01Treasury.totalBudgetAllocated()).to.equal(budgetAllocatedBefore);
expect(await tg01Treasury.currentFiscalYear()).to.equal(fiscalYearBefore);

// E. Replay: calling executeTrigger again as non-kernel reverts; Treasury state unchanged
await expect(
  tg01Trigger.connect(attacker).executeTrigger(1, attacker.address, 1, ethers.ZeroAddress)
).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
expect(await tg01Treasury.isBlocked(attacker.address)).to.be.true;
expect(await tg01Treasury.txCount()).to.equal(txCountBefore);
});
});

// ═══════════════════════════════════════════════════════════════════════════
// INV-03 Authority Boundary Follow-Up (R-1..R-5)
//
// Characterises TriggerProtocol.executeTrigger() access control:
//  - enforced via address-equality (msg.sender == kernel), not role-based
//  - Kernel role holders (COURT, GUARDIAN, SOVEREIGN, ORACLE) have NO special
//    access to TriggerProtocol; only the Kernel CONTRACT address may call it
//  - all failed unauthorized calls leave trigger state completely unchanged
//
// This block deploys IranOS_Kernel with real role assignments so tests prove
// role possession (via hasRole) before asserting the revert.
// ═══════════════════════════════════════════════════════════════════════════
describe("INV-03 Authority Boundary Follow-Up (R-1..R-5)", function () {
  let inv03Kernel;   // IranOS_Kernel contract (the production kernel)
  let inv03Trigger;  // TriggerProtocol wired to inv03Kernel.address
  let inv03Treasury; // Treasury for TriggerProtocol.blockAddressByTrigger()
  let inv03Admin;    // Treasury DEFAULT_ADMIN (signers[0])
  let inv03Sovereign, inv03Court, inv03Oracle, inv03Guardian, inv03Attacker;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    inv03Admin     = signers[0]; // Treasury admin only
    inv03Sovereign = signers[5]; // holds SOVEREIGN_ROLE + DEFAULT_ADMIN_ROLE on Kernel
    inv03Court     = signers[6]; // holds COURT_ROLE on Kernel
    inv03Oracle    = signers[7]; // holds ORACLE_ROLE on Kernel
    inv03Guardian  = signers[8]; // granted GUARDIAN_ROLE post-deployment
    inv03Attacker  = signers[9]; // holds no roles

    // Treasury: inv03Admin is DEFAULT_ADMIN + KERNEL_ROLE
    const TreasuryFactory = await ethers.getContractFactory("Treasury");
    inv03Treasury = await TreasuryFactory.deploy(inv03Admin.address, inv03Admin.address);
    await inv03Treasury.waitForDeployment();

    // IranOS_Kernel: real role assignments
    const KernelFactory = await ethers.getContractFactory("IranOS_Kernel");
    inv03Kernel = await KernelFactory.deploy(
      inv03Sovereign.address, // _sovereign → SOVEREIGN_ROLE + DEFAULT_ADMIN_ROLE
      inv03Court.address,     // _court     → COURT_ROLE
      inv03Oracle.address,    // _oracle    → ORACLE_ROLE
      inv03Sovereign.address  // _swf       (address only, not called during setup)
    );
    await inv03Kernel.waitForDeployment();

    // Grant GUARDIAN_ROLE via Sovereign (DEFAULT_ADMIN_ROLE holder)
    const GUARDIAN_ROLE = await inv03Kernel.GUARDIAN_ROLE();
    await inv03Kernel.connect(inv03Sovereign).grantRole(GUARDIAN_ROLE, inv03Guardian.address);

    // TriggerProtocol wired to the Kernel CONTRACT address (not an EOA signer)
    const TriggerFactory = await ethers.getContractFactory("TriggerProtocol");
    inv03Trigger = await TriggerFactory.deploy(
      await inv03Kernel.getAddress(),    // kernel  = contract address
      await inv03Treasury.getAddress(),  // treasury
      inv03Sovereign.address             // swf
    );
    await inv03Trigger.waitForDeployment();

    // Grant KERNEL_ROLE on Treasury to TriggerProtocol so blockAddressByTrigger() works
    await inv03Treasury.connect(inv03Admin).grantRole(
      await inv03Treasury.KERNEL_ROLE(),
      await inv03Trigger.getAddress()
    );
  });

  // ─── R-1: COURT_ROLE ─────────────────────────────────────────────────────
  it("INV-03 R-1: COURT_ROLE holder cannot call executeTrigger() directly — reverts", async function () {
    expect(await inv03Kernel.hasRole(await inv03Kernel.COURT_ROLE(), inv03Court.address)).to.be.true;
    await expect(
      inv03Trigger.connect(inv03Court).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
  });

  it("INV-03 R-1: COURT_ROLE direct call is state-neutral", async function () {
    await expect(
      inv03Trigger.connect(inv03Court).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
    expect(await inv03Trigger.executionCount()).to.equal(0);
    expect(await inv03Trigger.isTreasuryBlocked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.isSignatureRevoked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.getInterimReplacement(inv03Attacker.address)).to.equal(ethers.ZeroAddress);
  });

  // ─── R-2: GUARDIAN_ROLE ──────────────────────────────────────────────────
  it("INV-03 R-2: GUARDIAN_ROLE holder cannot call executeTrigger() directly — reverts", async function () {
    expect(await inv03Kernel.hasRole(await inv03Kernel.GUARDIAN_ROLE(), inv03Guardian.address)).to.be.true;
    await expect(
      inv03Trigger.connect(inv03Guardian).executeTrigger(1, inv03Attacker.address, 2, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
  });

  it("INV-03 R-2: GUARDIAN_ROLE direct call is state-neutral", async function () {
    await expect(
      inv03Trigger.connect(inv03Guardian).executeTrigger(1, inv03Attacker.address, 2, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
    expect(await inv03Trigger.executionCount()).to.equal(0);
    expect(await inv03Trigger.isTreasuryBlocked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.isSignatureRevoked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.getInterimReplacement(inv03Attacker.address)).to.equal(ethers.ZeroAddress);
  });

  // ─── R-3: SOVEREIGN_ROLE / DEFAULT_ADMIN_ROLE ────────────────────────────
  it("INV-03 R-3: SOVEREIGN_ROLE / DEFAULT_ADMIN_ROLE holder cannot call executeTrigger() directly — reverts", async function () {
    expect(await inv03Kernel.hasRole(await inv03Kernel.SOVEREIGN_ROLE(), inv03Sovereign.address)).to.be.true;
    expect(await inv03Kernel.hasRole(await inv03Kernel.DEFAULT_ADMIN_ROLE(), inv03Sovereign.address)).to.be.true;
    await expect(
      inv03Trigger.connect(inv03Sovereign).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
  });

  it("INV-03 R-3: SOVEREIGN_ROLE direct call is state-neutral", async function () {
    await expect(
      inv03Trigger.connect(inv03Sovereign).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
    expect(await inv03Trigger.executionCount()).to.equal(0);
    expect(await inv03Trigger.isTreasuryBlocked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.isSignatureRevoked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.getInterimReplacement(inv03Attacker.address)).to.equal(ethers.ZeroAddress);
  });

  // ─── R-4: ORACLE_ROLE ────────────────────────────────────────────────────
  it("INV-03 R-4: ORACLE_ROLE holder cannot call executeTrigger() directly — reverts", async function () {
    expect(await inv03Kernel.hasRole(await inv03Kernel.ORACLE_ROLE(), inv03Oracle.address)).to.be.true;
    await expect(
      inv03Trigger.connect(inv03Oracle).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
  });

  it("INV-03 R-4: ORACLE_ROLE direct call is state-neutral", async function () {
    await expect(
      inv03Trigger.connect(inv03Oracle).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
    ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
    expect(await inv03Trigger.executionCount()).to.equal(0);
    expect(await inv03Trigger.isTreasuryBlocked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.isSignatureRevoked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.getInterimReplacement(inv03Attacker.address)).to.equal(ethers.ZeroAddress);
  });

  // ─── R-5: Systematic state-neutrality across all actor classes ───────────
  it("INV-03 R-5: all unauthorized actors leave identical clean state (systematic state-neutrality)", async function () {
    const actors = [inv03Court, inv03Guardian, inv03Sovereign, inv03Oracle, inv03Attacker];
    for (const actor of actors) {
      await expect(
        inv03Trigger.connect(actor).executeTrigger(1, inv03Attacker.address, 1, ethers.ZeroAddress)
      ).to.be.revertedWith("TriggerProtocol: caller is not the Kernel");
    }
    expect(await inv03Trigger.executionCount()).to.equal(0);
    expect(await inv03Trigger.isTreasuryBlocked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.isSignatureRevoked(inv03Attacker.address)).to.be.false;
    expect(await inv03Trigger.getInterimReplacement(inv03Attacker.address)).to.equal(ethers.ZeroAddress);
    const exec = await inv03Trigger.executions(1);
    expect(exec.violationId).to.equal(0);
    expect(exec.offender).to.equal(ethers.ZeroAddress);
    expect(exec.violationCode).to.equal(0);
    expect(exec.executedAt).to.equal(0);
    expect(exec.treasuryBlocked).to.be.false;
    expect(exec.signatureRevoked).to.be.false;
    expect(exec.publicNotified).to.be.false;
    expect(exec.interimReplacement).to.equal(ethers.ZeroAddress);
  });

  it("INV-03 R-5: TriggerProtocol.kernel is the Kernel CONTRACT address, not any role-holder EOA", async function () {
    const kernelAddr = await inv03Trigger.kernel();
    expect(kernelAddr).to.equal(await inv03Kernel.getAddress());
    for (const actor of [inv03Sovereign, inv03Court, inv03Guardian, inv03Oracle, inv03Attacker]) {
      expect(actor.address).to.not.equal(kernelAddr);
    }
  });
});
});
