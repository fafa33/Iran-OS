const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PenalLabor", function () {
let penal;
let kernel, court, employer, victimFund;
let convict, attacker;

const COURT_ROLE    = ethers.keccak256(ethers.toUtf8Bytes("COURT_ROLE"));
const EMPLOYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EMPLOYER_ROLE"));

beforeEach(async function () {
[kernel, court, employer, victimFund, convict, attacker] = await ethers.getSigners();
const Penal = await ethers.getContractFactory("PenalLabor");
penal = await Penal.deploy(kernel.address, kernel.address, victimFund.address);
await penal.waitForDeployment();
await penal.connect(kernel).grantRole(COURT_ROLE, court.address);
});

describe("Deployment", function () {
it("باید نسبت هزینه نگهداری ۲۰٪ باشد", async function () {
expect(await penal.MAINTENANCE_RATIO()).to.equal(200);
});
it("باید نسبت غرامت قربانی ۴۰٪ باشد", async function () {
expect(await penal.VICTIM_RATIO()).to.equal(400);
});
it("باید نسبت مالیات ملی ۳۰٪ باشد", async function () {
expect(await penal.NATIONAL_TAX_RATIO()).to.equal(300);
});
it("باید نسبت حداقل بقا ۱۰٪ باشد", async function () {
expect(await penal.SURVIVAL_RATIO()).to.equal(100);
});
it("باید جمع نسبت‌ها ۱۰۰٪ باشد", async function () {
const m = await penal.MAINTENANCE_RATIO();
const v = await penal.VICTIM_RATIO();
const t = await penal.NATIONAL_TAX_RATIO();
const s = await penal.SURVIVAL_RATIO();
expect(m + v + t + s).to.equal(1000);
});
});

describe("Project Registration", function () {
it("باید Kernel بتواند پروژه ثبت کند", async function () {
await expect(
penal.connect(kernel).registerProject("بازسازی جاده", "infrastructure", employer.address, ethers.parseUnits("100", 18), 8)
).to.emit(penal, "ProjectRegistered");
});
it("نباید ضریب سختی کمتر از ۵ باشد", async function () {
await expect(
penal.connect(kernel).registerProject("تست", "test", employer.address, 1000, 4)
).to.be.revertedWith("PenalLabor: difficulty 5-10 only");
});
it("نباید ضریب سختی بیشتر از ۱۰ باشد", async function () {
await expect(
penal.connect(kernel).registerProject("تست", "test", employer.address, 1000, 11)
).to.be.revertedWith("PenalLabor: difficulty 5-10 only");
});
it("نباید غیر Kernel پروژه ثبت کند", async function () {
await expect(
penal.connect(attacker).registerProject("تست", "test", employer.address, 1000, 7)
).to.be.reverted;
});
});

describe("Convict Assignment", function () {
let projectId;

beforeEach(async function () {
  await penal.connect(kernel).registerProject("معدن", "mining", employer.address, ethers.parseUnits("200", 18), 9);
  projectId = 1;
});

it("باید دادگاه بتواند محکوم تخصیص دهد", async function () {
  await expect(
    penal.connect(court).assignConvict(convict.address, 1, projectId, 24)
  ).to.emit(penal, "ConvictAssigned");
});
it("نباید محکوم دوبار تخصیص یابد", async function () {
  await penal.connect(court).assignConvict(convict.address, 1, projectId, 24);
  await expect(
    penal.connect(court).assignConvict(convict.address, 1, projectId, 24)
  ).to.be.revertedWith("PenalLabor: already assigned");
});
it("نباید مدت محکومیت صفر باشد", async function () {
  await expect(
    penal.connect(court).assignConvict(convict.address, 1, projectId, 0)
  ).to.be.revertedWith("PenalLabor: zero sentence");
});

});

describe("Monthly Income Distribution", function () {
let projectId;
const gross = ethers.parseUnits("1000", 18);

beforeEach(async function () {
  await penal.connect(kernel).registerProject("معدن", "mining", employer.address, ethers.parseUnits("200", 18), 9);
  projectId = 1;
  await penal.connect(court).assignConvict(convict.address, 1, projectId, 2);
});

it("باید درآمد ماهانه توزیع شود", async function () {
  await expect(
    penal.connect(employer).distributeMonthlyIncome(convict.address, gross)
  ).to.emit(penal, "MonthlyIncomeDistributed");
});
it("باید نسبت‌های توزیع درست باشند", async function () {
  await penal.connect(employer).distributeMonthlyIncome(convict.address, gross);
  const record = await penal.getConvictRecord(convict.address);
  expect(record.maintenancePaid).to.equal(ethers.parseUnits("200", 18));
  expect(record.victimCompensation).to.equal(ethers.parseUnits("400", 18));
  expect(record.nationalTaxPaid).to.equal(ethers.parseUnits("300", 18));
  expect(record.survivalAllowance).to.equal(ethers.parseUnits("100", 18));
});
it("باید پس از اتمام محکومیت، محکوم آزاد شود", async function () {
  await penal.connect(employer).distributeMonthlyIncome(convict.address, gross);
  await penal.connect(employer).distributeMonthlyIncome(convict.address, gross);
  const record = await penal.getConvictRecord(convict.address);
  expect(record.completedSentence).to.be.true;
  expect(record.isActive).to.be.false;
});

});

describe("Distribution Calculation", function () {
it("باید محاسبه توزیع درست باشد", async function () {
const gross = ethers.parseUnits("1000", 18);
const [m, v, t, s] = await penal.calculateDistribution(gross);
expect(m).to.equal(ethers.parseUnits("200", 18));
expect(v).to.equal(ethers.parseUnits("400", 18));
expect(t).to.equal(ethers.parseUnits("300", 18));
expect(s).to.equal(ethers.parseUnits("100", 18));
});
});
});