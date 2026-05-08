const { expect } = require(“chai”);
const { ethers } = require(“hardhat”);

describe(“DisabilitySupport”, function () {
let disability;
let kernel, healthAdmin, welfare, swf;
let citizen1, citizen2, attacker;

const HEALTH_ROLE  = ethers.keccak256(ethers.toUtf8Bytes(“HEALTH_ROLE”));
const WELFARE_ROLE = ethers.keccak256(ethers.toUtf8Bytes(“WELFARE_ROLE”));
const SWF_ROLE     = ethers.keccak256(ethers.toUtf8Bytes(“SWF_ROLE”));

const MIN_WAGE = ethers.parseUnits(“1000”, 18);

// DisabilityLevel: 0=None, 1=Mild, 2=Moderate, 3=Severe
const MILD     = 1;
const MODERATE = 2;
const SEVERE   = 3;

beforeEach(async function () {
[kernel, healthAdmin, welfare, swf, citizen1, citizen2, attacker] = await ethers.getSigners();
const Disability = await ethers.getContractFactory(“DisabilitySupport”);
disability = await Disability.deploy(kernel.address);
await disability.waitForDeployment();
await disability.connect(kernel).grantRole(HEALTH_ROLE, healthAdmin.address);
await disability.connect(kernel).grantRole(WELFARE_ROLE, welfare.address);
await disability.connect(kernel).grantRole(SWF_ROLE, swf.address);
});

describe(“Deployment”, function () {
it(“باید حداقل حقوق پایه ۱۰۰۰ پهلوی باشد”, async function () {
expect(await disability.MIN_WAGE()).to.equal(MIN_WAGE);
});
it(“باید ضریب درجه ۱ برابر ۳۰۰ باشد”, async function () {
expect(await disability.LEVEL1_SUPPLEMENT()).to.equal(300);
});
it(“باید ضریب درجه ۲ برابر ۵۰۰ باشد”, async function () {
expect(await disability.LEVEL2_SUPPLEMENT()).to.equal(500);
});
it(“باید ضریب درجه ۳ برابر ۷۰۰ باشد”, async function () {
expect(await disability.LEVEL3_SUPPLEMENT()).to.equal(700);
});
});

describe(“Stipend Calculation”, function () {
it(“باید مستمری درجه ۱ برابر ۱۳۰۰ پهلوی باشد”, async function () {
const expected = ethers.parseUnits(“1300”, 18);
expect(await disability.calculateStipend(MILD)).to.equal(expected);
});
it(“باید مستمری درجه ۲ برابر ۱۵۰۰ پهلوی باشد”, async function () {
const expected = ethers.parseUnits(“1500”, 18);
expect(await disability.calculateStipend(MODERATE)).to.equal(expected);
});
it(“باید مستمری درجه ۳ برابر ۱۷۰۰ پهلوی باشد”, async function () {
const expected = ethers.parseUnits(“1700”, 18);
expect(await disability.calculateStipend(SEVERE)).to.equal(expected);
});
});

describe(“Citizen Registration”, function () {
it(“باید شهروند توان‌خواه ثبت شود”, async function () {
await expect(
disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, MILD)
).to.emit(disability, “DisabledCitizenRegistered”);
});
it(“نباید شهروند دوبار ثبت شود”, async function () {
await disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, MILD);
await expect(
disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, MILD)
).to.be.revertedWith(“DisabilitySupport: registered”);
});
it(“باید مستمری محاسبه‌شده درست باشد”, async function () {
await disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, SEVERE);
const record = await disability.getDisabledCitizen(citizen1.address);
expect(record.monthlyStipend).to.equal(ethers.parseUnits(“1700”, 18));
});
it(“نباید درجه صفر (None) مجاز باشد”, async function () {
await expect(
disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, 0)
).to.be.revertedWith(“DisabilitySupport: invalid level”);
});
it(“نباید غیر HEALTH_ROLE ثبت کند”, async function () {
await expect(
disability.connect(attacker).registerDisabledCitizen(citizen1.address, MILD)
).to.be.reverted;
});
});

describe(“Stipend Payment”, function () {
beforeEach(async function () {
await disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, MODERATE);
});
it(“باید مستمری پرداخت شود”, async function () {
await expect(
disability.connect(welfare).payMonthlyStipend(citizen1.address)
).to.emit(disability, “StipendPaid”);
});
it(“نباید دوبار در یک ماه پرداخت شود”, async function () {
await disability.connect(welfare).payMonthlyStipend(citizen1.address);
await expect(
disability.connect(welfare).payMonthlyStipend(citizen1.address)
).to.be.revertedWith(“DisabilitySupport: too early”);
});
it(“نباید غیر WELFARE_ROLE پرداخت کند”, async function () {
await expect(
disability.connect(attacker).payMonthlyStipend(citizen1.address)
).to.be.reverted;
});
});

describe(“Disability Level Update”, function () {
beforeEach(async function () {
await disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, MILD);
});
it(“باید درجه ناتوانی به‌روز شود”, async function () {
await expect(
disability.connect(healthAdmin).updateDisabilityLevel(citizen1.address, SEVERE)
).to.emit(disability, “DisabilityLevelUpdated”);
});
it(“باید مستمری پس از به‌روزرسانی تغییر کند”, async function () {
await disability.connect(healthAdmin).updateDisabilityLevel(citizen1.address, SEVERE);
const record = await disability.getDisabledCitizen(citizen1.address);
expect(record.monthlyStipend).to.equal(ethers.parseUnits(“1700”, 18));
});
});

describe(“Accessibility Card”, function () {
beforeEach(async function () {
await disability.connect(healthAdmin).registerDisabledCitizen(citizen1.address, MODERATE);
});
it(“باید کارت دسترسی‌پذیری صادر شود”, async function () {
await expect(
disability.connect(welfare).issueAccessibilityCard(citizen1.address)
).to.emit(disability, “AccessibilityCardIssued”);
});
it(“باید پس از صدور، کارت فعال باشد”, async function () {
await disability.connect(welfare).issueAccessibilityCard(citizen1.address);
const record = await disability.getDisabledCitizen(citizen1.address);
expect(record.accessibilityCard).to.be.true;
});
});

describe(“Accessibility Audit”, function () {
it(“باید نتیجه بازرسی دسترسی‌پذیری ثبت شود”, async function () {
const subjectId = ethers.keccak256(ethers.toUtf8Bytes(“building_001”));
await expect(
disability.connect(welfare).recordAccessibilityAudit(
subjectId, citizen1.address, “building”, true, “استاندارد رعایت شده”
)
).to.emit(disability, “AccessibilityAuditCompleted”);
});
});
});