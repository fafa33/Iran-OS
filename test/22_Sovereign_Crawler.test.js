const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SovereignCrawler", function () {
let crawler;
let kernel, node1, node2, node3, council;
let target1, swfWallet, attacker;

const NODE_ROLE    = ethers.keccak256(ethers.toUtf8Bytes("NODE_ROLE"));
const COUNCIL_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COUNCIL_ROLE"));

let targetId;
const estimatedValue = ethers.parseUnits("1000000000", 18);

beforeEach(async function () {
[kernel, node1, node2, node3, council, target1, swfWallet, attacker] = await ethers.getSigners();
const Crawler = await ethers.getContractFactory("SovereignCrawler");
crawler = await Crawler.deploy(kernel.address, swfWallet.address);
await crawler.waitForDeployment();
await crawler.connect(kernel).grantRole(NODE_ROLE, node1.address);
await crawler.connect(kernel).grantRole(NODE_ROLE, node2.address);
await crawler.connect(kernel).grantRole(NODE_ROLE, node3.address);
await crawler.connect(kernel).grantRole(COUNCIL_ROLE, council.address);
targetId = ethers.keccak256(ethers.toUtf8Bytes("target_001"));
});

describe("Deployment", function () {
it("باید مهلت انجماد ۷۲ ساعت باشد", async function () {
expect(await crawler.FREEZE_DEADLINE()).to.equal(72 * 3600);
});
it("باید آستانه تایید نود ۳ باشد", async function () {
expect(await crawler.NODE_THRESHOLD()).to.equal(3);
});
it("باید تعداد هدف‌ها صفر باشد", async function () {
expect(await crawler.getTotalTargets()).to.equal(0);
});
});

describe("Identify Target", function () {
it("باید نود بتواند هدف شناسایی کند", async function () {
await expect(
crawler.connect(node1).identifyTarget(
targetId, target1.address, 0, "کارتل رانتی", estimatedValue, ethers.ZeroHash, false
)
).to.emit(crawler, "TargetIdentified");
});
it("نباید غیرنود هدف شناسایی کند", async function () {
await expect(
crawler.connect(attacker).identifyTarget(
targetId, target1.address, 0, "تست", estimatedValue, ethers.ZeroHash, false
)
).to.be.reverted;
});
it("نباید targetId خالی مجاز باشد", async function () {
await expect(
crawler.connect(node1).identifyTarget(
ethers.ZeroHash, target1.address, 0, "تست", estimatedValue, ethers.ZeroHash, false
)
).to.be.revertedWith("SovereignCrawler: invalid id");
});
it("نباید ارزش صفر مجاز باشد", async function () {
await expect(
crawler.connect(node1).identifyTarget(
targetId, target1.address, 0, "تست", 0, ethers.ZeroHash, false
)
).to.be.revertedWith("SovereignCrawler: zero value");
});
it("باید تعداد هدف‌ها افزایش یابد", async function () {
await crawler.connect(node1).identifyTarget(
targetId, target1.address, 0, "کارتل", estimatedValue, ethers.ZeroHash, false
);
expect(await crawler.getTotalTargets()).to.equal(1);
});
});

describe("Shell Company Chain", function () {
it("باید زنجیره شرکت‌های پوششی ثبت شود", async function () {
const parentId = ethers.keccak256(ethers.toUtf8Bytes("parent_001"));
const childId  = ethers.keccak256(ethers.toUtf8Bytes("child_001"));
await crawler.connect(node1).identifyTarget(
parentId, target1.address, 0, "کارتل اصلی", estimatedValue, ethers.ZeroHash, false
);
await crawler.connect(node1).identifyTarget(
childId, attacker.address, 2, "شرکت پوششی", estimatedValue, parentId, true
);
const chain = await crawler.getShellChain(parentId);
expect(chain.length).to.equal(1);
expect(chain[0]).to.equal(childId);
});
});

describe("Graph Edge", function () {
it("باید نود بتواند لبه گراف اضافه کند", async function () {
const from = ethers.keccak256(ethers.toUtf8Bytes("from"));
const to   = ethers.keccak256(ethers.toUtf8Bytes("to"));
await expect(
crawler.connect(node1).addGraphEdge(from, to, estimatedValue, Date.now(), "direct")
).to.emit(crawler, "GraphEdgeAdded");
});
});

describe("Freeze Target", function () {
beforeEach(async function () {
await crawler.connect(node1).identifyTarget(
targetId, target1.address, 0, "کارتل", estimatedValue, ethers.ZeroHash, false
);
});

it("باید پس از ۷۲ ساعت هدف منجمد شود", async function () {
  await ethers.provider.send("evm_increaseTime", [72 * 3600 + 1]);
  await ethers.provider.send("evm_mine");
  await expect(
    crawler.connect(node1).freezeTarget(targetId)
  ).to.emit(crawler, "AssetFrozen");
});

it("باید با ۳ تایید نود قبل از ۷۲ ساعت منجمد شود", async function () {
  // node2 و node3 تایید می‌کنند
  await crawler.connect(node2).identifyTarget(
    targetId, target1.address, 0, "کارتل", estimatedValue, ethers.ZeroHash, false
  );
  await crawler.connect(node3).identifyTarget(
    targetId, target1.address, 0, "کارتل", estimatedValue, ethers.ZeroHash, false
  );
  await expect(
    crawler.connect(node1).freezeTarget(targetId)
  ).to.emit(crawler, "AssetFrozen");
});

});

describe("Council Confirmation and Transfer", function () {
beforeEach(async function () {
await crawler.connect(node1).identifyTarget(
targetId, target1.address, 0, "کارتل", estimatedValue, ethers.ZeroHash, false
);
await ethers.provider.send("evm_increaseTime", [72 * 3600 + 1]);
await ethers.provider.send("evm_mine");
await crawler.connect(node1).freezeTarget(targetId);
});

it("باید شورا بتواند انجماد را تایید کند", async function () {
  await expect(
    crawler.connect(council).confirmByCouncil(targetId)
  ).to.emit(crawler, "AssetConfirmedByCouncil");
});

it("باید پس از تایید، دارایی به صندوق منتقل شود", async function () {
  await crawler.connect(council).confirmByCouncil(targetId);
  await expect(
    crawler.connect(council).transferToSWF(targetId)
  ).to.emit(crawler, "AssetTransferredToSWF");
});

});

describe("Release Target", function () {
beforeEach(async function () {
await crawler.connect(node1).identifyTarget(
targetId, target1.address, 0, "کارتل", estimatedValue, ethers.ZeroHash, false
);
});

it("باید Kernel بتواند دارایی را آزاد کند", async function () {
  await expect(
    crawler.connect(kernel).releaseTarget(targetId, "مالکیت مشروع اثبات شد")
  ).to.emit(crawler, "AssetReleased");
});
it("نباید غیر Kernel آزادسازی کند", async function () {
  await expect(
    crawler.connect(attacker).releaseTarget(targetId, "تست")
  ).to.be.reverted;
});

});
});