const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Parliament", function () {
let parliament;
let kernel, sovereign, mp1, mp2, mp3;
let attacker;

const MP_ROLE       = ethers.keccak256(ethers.toUtf8Bytes("MP_ROLE"));
const SOVEREIGN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SOVEREIGN_ROLE"));

beforeEach(async function () {
[kernel, sovereign, mp1, mp2, mp3, attacker] = await ethers.getSigners();
const Parliament = await ethers.getContractFactory("Parliament");
parliament = await Parliament.deploy(kernel.address, kernel.address);
await parliament.waitForDeployment();
await parliament.connect(kernel).grantRole(SOVEREIGN_ROLE, sovereign.address);
await parliament.connect(kernel).registerMP(mp1.address);
await parliament.connect(kernel).registerMP(mp2.address);
await parliament.connect(kernel).registerMP(mp3.address);
});

describe("Deployment", function () {
it("باید سال مالی ۱۴۰۴ باشد", async function () {
expect(await parliament.currentFiscalYear()).to.equal(1404);
});
it("باید تعداد نمایندگان ۳ باشد", async function () {
expect(await parliament.totalMPs()).to.equal(3);
});
it("باید سقف بودجه ۱۵۰ میلیارد باشد", async function () {
const cap = ethers.parseUnits("150000000000", 18);
expect(await parliament.BUDGET_CAP()).to.equal(cap);
});
});

describe("MP Registration", function () {
it("باید نماینده مصونیت پارلمانی داشته باشد", async function () {
expect(await parliament.hasImmunity(mp1.address)).to.be.true;
});
it("نباید غیر Kernel نماینده ثبت کند", async function () {
await expect(
parliament.connect(attacker).registerMP(attacker.address)
).to.be.reverted;
});
});

describe("Law Proposal", function () {
it("باید نماینده بتواند قانون پیشنهاد دهد", async function () {
const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون بهداشت"));
await expect(
parliament.connect(mp1).proposeLaw(hash, "قانون بهداشت همگانی", false)
).to.emit(parliament, "LawProposed");
});
it("نباید غیرنماینده قانون پیشنهاد دهد", async function () {
const hash = ethers.keccak256(ethers.toUtf8Bytes("تست"));
await expect(
parliament.connect(attacker).proposeLaw(hash, "تست", false)
).to.be.reverted;
});
it("باید شمارنده قوانین افزایش یابد", async function () {
const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون"));
await parliament.connect(mp1).proposeLaw(hash, "قانون", false);
expect(await parliament.lawCount()).to.equal(1);
});
it("باید هش خالی مجاز نباشد", async function () {
await expect(
parliament.connect(mp1).proposeLaw(ethers.ZeroHash, "تست", false)
).to.be.revertedWith("Parliament: invalid hash");
});
});

describe("Voting", function () {
let lawId;

beforeEach(async function () {
  const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون رفاه"));
  await parliament.connect(mp1).proposeLaw(hash, "قانون رفاه", false);
  lawId = 1;
});

it("باید نماینده بتواند رای بدهد", async function () {
  await expect(
    parliament.connect(mp1).castVote(lawId, true)
  ).to.emit(parliament, "VoteCast");
});
it("نباید نماینده دوبار رای بدهد", async function () {
  await parliament.connect(mp1).castVote(lawId, true);
  await expect(
    parliament.connect(mp1).castVote(lawId, true)
  ).to.be.revertedWith("Parliament: voted");
});
it("باید با اکثریت قانون تصویب شود", async function () {
  await parliament.connect(mp1).castVote(lawId, true);
  await parliament.connect(mp2).castVote(lawId, true);
  const law = await parliament.getLaw(lawId);
  expect(law.status).to.equal(2); // PassedByParliament
});
it("باید رای مخالف ثبت شود", async function () {
  await parliament.connect(mp1).castVote(lawId, false);
  const law = await parliament.getLaw(lawId);
  expect(law.votesAgainst).to.equal(1);
});

});

describe("Royal Actions", function () {
let lawId;

beforeEach(async function () {
  const hash = ethers.keccak256(ethers.toUtf8Bytes("قانون"));
  await parliament.connect(mp1).proposeLaw(hash, "قانون", false);
  lawId = 1;
  await parliament.connect(mp1).castVote(lawId, true);
  await parliament.connect(mp2).castVote(lawId, true);
});

it("باید پادشاه بتواند قانون را توشیح کند", async function () {
  await expect(
    parliament.connect(sovereign).enactLaw(lawId)
  ).to.emit(parliament, "LawEnacted");
});
it("باید پادشاه بتواند قانون را وتو کند", async function () {
  await expect(
    parliament.connect(sovereign).vetoLaw(lawId, "مغایرت با منشور")
  ).to.emit(parliament, "LawVetoed");
});
it("باید پادشاه بتواند قانون را برای بازنگری برگرداند", async function () {
  await expect(
    parliament.connect(sovereign).returnForRevision(lawId, "نیاز به بازنگری")
  ).to.emit(parliament, "LawReturnedForRevision");
});
it("نباید غیرپادشاه توشیح کند", async function () {
  await expect(
    parliament.connect(attacker).enactLaw(lawId)
  ).to.be.reverted;
});

});
});