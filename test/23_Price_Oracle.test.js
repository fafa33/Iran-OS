const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
let oracle;
let kernel, feeder1, feeder2, feeder3;
let attacker;

const FEEDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FEEDER_ROLE"));

const KEY_PAH_USD   = ethers.keccak256(ethers.toUtf8Bytes("PAH_USD"));
const KEY_OIL_USD   = ethers.keccak256(ethers.toUtf8Bytes("OIL_USD"));
const KEY_INFLATION = ethers.keccak256(ethers.toUtf8Bytes("GLOBAL_CPI"));

const ONE_USD = ethers.parseUnits("1", 18);

beforeEach(async function () {
[kernel, feeder1, feeder2, feeder3, attacker] = await ethers.getSigners();
const Oracle = await ethers.getContractFactory("PriceOracle");
oracle = await Oracle.deploy(kernel.address);
await oracle.waitForDeployment();
await oracle.connect(kernel).grantRole(FEEDER_ROLE, feeder1.address);
await oracle.connect(kernel).grantRole(FEEDER_ROLE, feeder2.address);
await oracle.connect(kernel).grantRole(FEEDER_ROLE, feeder3.address);
});

describe("Deployment", function () {
it("باید نرخ اولیه پهلوی ۱ دلار باشد", async function () {
expect(await oracle.getPahlaviUSDRate()).to.equal(ONE_USD);
});
it("باید آستانه کهنگی داده ۱ ساعت باشد", async function () {
expect(await oracle.STALENESS_THRESHOLD()).to.equal(3600);
});
it("باید حداقل feeder ها ۳ باشد", async function () {
expect(await oracle.MIN_FEEDERS()).to.equal(3);
});
it("باید حداکثر انحراف ۵٪ باشد", async function () {
expect(await oracle.DEVIATION_THRESHOLD()).to.equal(50);
});
});

describe("Price Submission", function () {
it("باید feeder بتواند قیمت ارسال کند", async function () {
await expect(
oracle.connect(feeder1).submitPrice(KEY_OIL_USD, ethers.parseUnits("80", 18), 900)
).to.emit(oracle, "FeederSubmitted");
});
it("نباید غیر feeder قیمت ارسال کند", async function () {
await expect(
oracle.connect(attacker).submitPrice(KEY_OIL_USD, 1000, 900)
).to.be.reverted;
});
it("نباید قیمت صفر مجاز باشد", async function () {
await expect(
oracle.connect(feeder1).submitPrice(KEY_OIL_USD, 0, 900)
).to.be.revertedWith("PriceOracle: invalid value");
});
it("نباید confidence بالای ۱۰۰۰ مجاز باشد", async function () {
await expect(
oracle.connect(feeder1).submitPrice(KEY_OIL_USD, 1000, 1001)
).to.be.revertedWith("PriceOracle: invalid confidence");
});
});

describe("Price Aggregation", function () {
it("باید پس از ۳ feeder قیمت aggregate شود", async function () {
const price = ethers.parseUnits("80", 18);
await oracle.connect(feeder1).submitPrice(KEY_OIL_USD, price, 900);
await oracle.connect(feeder2).submitPrice(KEY_OIL_USD, price, 900);
await expect(
oracle.connect(feeder3).submitPrice(KEY_OIL_USD, price, 900)
).to.emit(oracle, "PriceUpdated");
});
it("باید قیمت aggregate‌شده میانگین باشد", async function () {
const p1 = ethers.parseUnits("80", 18);
const p2 = ethers.parseUnits("90", 18);
const p3 = ethers.parseUnits("85", 18);
await oracle.connect(feeder1).submitPrice(KEY_OIL_USD, p1, 900);
await oracle.connect(feeder2).submitPrice(KEY_OIL_USD, p2, 900);
await oracle.connect(feeder3).submitPrice(KEY_OIL_USD, p3, 900);
const [value, , isValid] = await oracle.getPrice(KEY_OIL_USD);
expect(isValid).to.be.true;
// میانگین ۸۰+۹۰+۸۵ = ۸۵
expect(value).to.equal(ethers.parseUnits("85", 18));
});
});

describe("Price Invalidation", function () {
it("باید Kernel بتواند قیمت را باطل کند", async function () {
await expect(
oracle.connect(kernel).invalidatePrice(KEY_OIL_USD, "داده مشکوک")
).to.emit(oracle, "PriceInvalidated");
});
it("نباید غیر Kernel قیمت را باطل کند", async function () {
await expect(
oracle.connect(attacker).invalidatePrice(KEY_OIL_USD, "تست")
).to.be.reverted;
});
});

describe("Read Methods", function () {
it("باید نرخ پهلوی قابل خواندن باشد", async function () {
const rate = await oracle.getPahlaviUSDRate();
expect(rate).to.equal(ONE_USD);
});
it("باید تازگی داده قابل بررسی باشد", async function () {
// داده اولیه در constructor ثبت شده
expect(await oracle.isDataFresh(KEY_PAH_USD)).to.be.true;
});
});
});