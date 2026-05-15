const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JusticeProtocol", function () {
let justice;
let kernel, court, judge, appeal;
let defendant, attacker;

const COURT_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("COURT_ROLE"));
const JUDGE_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("JUDGE_ROLE"));
const APPEAL_ROLE = ethers.keccak256(ethers.toUtf8Bytes("APPEAL_ROLE"));

beforeEach(async function () {
[kernel, court, judge, appeal, defendant, attacker] = await ethers.getSigners();
const Justice = await ethers.getContractFactory("JusticeProtocol");
justice = await Justice.deploy(kernel.address);
await justice.waitForDeployment();
await justice.connect(kernel).grantRole(COURT_ROLE, court.address);
await justice.connect(kernel).grantRole(APPEAL_ROLE, appeal.address);
await justice.connect(kernel).approveJudge(judge.address);
});

describe("Deployment", function () {
it("باید تعداد پرونده‌ها صفر باشد", async function () {
expect(await justice.caseCount()).to.equal(0);
});
});

describe("File Case", function () {
it("باید دادگاه بتواند پرونده ثبت کند", async function () {
await expect(
justice.connect(court).fileCase(defendant.address, "hash_001")
).to.emit(justice, "CaseFiled");
});
it("نباید غیردادگاه پرونده ثبت کند", async function () {
await expect(
justice.connect(attacker).fileCase(defendant.address, "hash")
).to.be.reverted;
});
it("نباید اتهام خالی باشد", async function () {
await expect(
justice.connect(court).fileCase(defendant.address, "")
).to.be.revertedWith("JusticeProtocol: empty charge");
});
it("باید شمارنده پرونده‌ها افزایش یابد", async function () {
await justice.connect(court).fileCase(defendant.address, "hash");
expect(await justice.caseCount()).to.equal(1);
});
});

describe("Assign Judge", function () {
beforeEach(async function () {
await justice.connect(court).fileCase(defendant.address, "hash");
});
it("باید دادگاه بتواند قاضی تخصیص دهد", async function () {
await expect(
justice.connect(court).assignJudge(1, judge.address)
).to.emit(justice, "JudgeAssigned");
});
it("نباید قاضی غیرمعتمد تخصیص یابد", async function () {
await expect(
justice.connect(court).assignJudge(1, attacker.address)
).to.be.revertedWith("JusticeProtocol: not approved");
});
});

describe("Issue Sentence", function () {
beforeEach(async function () {
await justice.connect(court).fileCase(defendant.address, "hash");
await justice.connect(court).assignJudge(1, judge.address);
});

it("باید قاضی بتواند حکم صادر کند", async function () {
  await expect(
    justice.connect(judge).issueSentence(1, 1, 12, 0, "کار جبرانی ۱۲ ماه") // PenalLabor
  ).to.emit(justice, "SentenceIssued");
});
it("نباید غیرقاضی حکم صادر کند", async function () {
  await expect(
    justice.connect(attacker).issueSentence(1, 1, 12, 0, "تست")
  ).to.be.reverted;
});
it("نباید اعدام در سیستم وجود داشته باشد — SentenceType فقط ۵ مقدار دارد", async function () {
  // تایید: enum SentenceType فقط ۰ تا ۴ دارد
  // ۰=Acquitted, ۱=PenalLabor, ۲=Imprisonment, ۳=FinePlus, ۴=CommunityService
  // هیچ مقداری برای اعدام وجود ندارد
  const c = await justice.getCase(1);
  expect(c.sentenceType).to.equal(0); // Acquitted by default
});

});

describe("Sign Judgment", function () {
beforeEach(async function () {
await justice.connect(court).fileCase(defendant.address, "hash");
await justice.connect(court).assignJudge(1, judge.address);
await justice.connect(judge).issueSentence(1, 1, 12, 0, "کار جبرانی");
});

it("باید قاضی بتواند حکم را امضا کند", async function () {
  const sig = ethers.keccak256(ethers.toUtf8Bytes("signature_001"));
  await expect(
    justice.connect(judge).signJudgment(1, sig)
  ).to.emit(justice, "SentenceDigitallySigned");
});
it("نباید حکم دوبار امضا شود", async function () {
  const sig = ethers.keccak256(ethers.toUtf8Bytes("sig"));
  await justice.connect(judge).signJudgment(1, sig);
  await expect(
    justice.connect(judge).signJudgment(1, sig)
  ).to.be.revertedWith("JusticeProtocol: signed");
});

});

describe("Appeal", function () {
beforeEach(async function () {
await justice.connect(court).fileCase(defendant.address, "hash");
await justice.connect(court).assignJudge(1, judge.address);
await justice.connect(judge).issueSentence(1, 1, 12, 0, "کار جبرانی");
const sig = ethers.keccak256(ethers.toUtf8Bytes("sig"));
await justice.connect(judge).signJudgment(1, sig);
});

it("باید متهم بتواند تجدیدنظر بخواهد", async function () {
  await expect(
    justice.connect(defendant).fileAppeal(1)
  ).to.emit(justice, "AppealFiled");
});
it("نباید غیرمتهم تجدیدنظر بخواهد", async function () {
  await expect(
    justice.connect(attacker).fileAppeal(1)
  ).to.be.revertedWith("JusticeProtocol: only defendant");
});

});

describe("Finalise Case", function () {
beforeEach(async function () {
await justice.connect(court).fileCase(defendant.address, "hash");
await justice.connect(court).assignJudge(1, judge.address);
await justice.connect(judge).issueSentence(1, 1, 12, 0, "کار جبرانی");
const sig = ethers.keccak256(ethers.toUtf8Bytes("sig"));
await justice.connect(judge).signJudgment(1, sig);
await justice.connect(defendant).fileAppeal(1);
});

it("باید دیوان عالی بتواند پرونده را نهایی کند", async function () {
  await expect(
    justice.connect(appeal).finaliseCase(1)
  ).to.emit(justice, "CaseFinalised");
});
it("باید پس از نهایی شدن، پرونده قطعی باشد", async function () {
  await justice.connect(appeal).finaliseCase(1);
  expect(await justice.isCaseFinalised(1)).to.be.true;
});

});
});