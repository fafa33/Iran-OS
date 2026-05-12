const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
let voting;
let kernel, oracle, electionAdmin;
let voter1, voter2, candidate1, candidate2, attacker;

const ORACLE_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
const ELECTION_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ELECTION_ROLE"));

let startTime, endTime;

beforeEach(async function () {
[kernel, oracle, electionAdmin, voter1, voter2, candidate1, candidate2, attacker] = await ethers.getSigners();
const Voting = await ethers.getContractFactory("VotingSystem");
voting = await Voting.deploy(kernel.address);
await voting.waitForDeployment();
await voting.connect(kernel).grantRole(ORACLE_ROLE, oracle.address);
await voting.connect(kernel).grantRole(ELECTION_ROLE, electionAdmin.address);

const block = await ethers.provider.getBlock("latest");
startTime = block.timestamp + 100;
endTime   = block.timestamp + 86400;

});

describe("Deployment", function () {
it("باید شرط اقامت ۵ سال باشد", async function () {
expect(await voting.MIN_RESIDENCY_YEARS()).to.equal(5);
});
it("باید تعداد انتخابات صفر باشد", async function () {
expect(await voting.electionCount()).to.equal(0);
});
});

describe("Election Creation", function () {
it("باید انتخابات ملی ساخته شود", async function () {
await expect(
voting.connect(electionAdmin).createElection(0, 0, "انتخابات مجلس", startTime, endTime, 1000)
).to.emit(voting, "ElectionCreated");
});
it("باید رفراندوم ساخته شود", async function () {
await expect(
voting.connect(electionAdmin).createElection(2, 0, "رفراندوم منشور", startTime, endTime, 1000)
).to.emit(voting, "ElectionCreated");
});
it("نباید غیر ELECTION_ROLE انتخابات بسازد", async function () {
await expect(
voting.connect(attacker).createElection(0, 0, "تست", startTime, endTime, 1000)
).to.be.reverted;
});
it("نباید زمان پایان قبل از شروع باشد", async function () {
await expect(
voting.connect(electionAdmin).createElection(0, 0, "تست", endTime, startTime, 1000)
).to.be.revertedWith("VotingSystem: invalid end");
});
it("نباید تعداد رای‌دهندگان صفر باشد", async function () {
await expect(
voting.connect(electionAdmin).createElection(0, 0, "تست", startTime, endTime, 0)
).to.be.revertedWith("VotingSystem: zero voters");
});
});

describe("Candidate Registration", function () {
let electionId;

beforeEach(async function () {
  await voting.connect(electionAdmin).createElection(0, 0, "انتخابات", startTime, endTime, 1000);
  electionId = 1;
});

it("باید نامزد واجد شرایط ثبت شود", async function () {
  const bio = ethers.keccak256(ethers.toUtf8Bytes("candidate1"));
  await expect(
    voting.connect(oracle).registerCandidate(electionId, bio, "نامزد یک", 10, false)
  ).to.emit(voting, "CandidateRegistered");
});
it("باید نامزد با سابقه کیفری رد صلاحیت شود", async function () {
  const bio = ethers.keccak256(ethers.toUtf8Bytes("criminal"));
  await voting.connect(oracle).registerCandidate(electionId, bio, "نامزد", 10, true);
  const c = await voting.getCandidate(electionId, 1);
  expect(c.isEligible).to.be.false;
});
it("باید نامزد بدون شرط اقامت رد صلاحیت شود", async function () {
  const bio = ethers.keccak256(ethers.toUtf8Bytes("newresident"));
  await voting.connect(oracle).registerCandidate(electionId, bio, "نامزد", 2, false);
  const c = await voting.getCandidate(electionId, 1);
  expect(c.isEligible).to.be.false;
});
it("نباید غیراوراکل نامزد ثبت کند", async function () {
  const bio = ethers.keccak256(ethers.toUtf8Bytes("test"));
  await expect(
    voting.connect(attacker).registerCandidate(electionId, bio, "تست", 10, false)
  ).to.be.reverted;
});

});

describe("Voting", function () {
let electionId;

beforeEach(async function () {
  await voting.connect(electionAdmin).createElection(0, 0, "انتخابات", startTime, endTime, 1000);
  electionId = 1;
  const bio = ethers.keccak256(ethers.toUtf8Bytes("c1"));
  await voting.connect(oracle).registerCandidate(electionId, bio, "نامزد", 10, false);
  await voting.connect(electionAdmin).activateElection(electionId);
  await ethers.provider.send("evm_increaseTime", [200]);
  await ethers.provider.send("evm_mine");
});

it("باید رای ثبت شود", async function () {
  const voterBio = ethers.keccak256(ethers.toUtf8Bytes("voter1"));
  const proof = ethers.toUtf8Bytes("zkproof");
  await expect(
    voting.connect(voter1).castVote(electionId, 1, voterBio, proof)
  ).to.emit(voting, "VoteCast");
});
it("نباید دوبار رای داد", async function () {
  const voterBio = ethers.keccak256(ethers.toUtf8Bytes("voter1"));
  const proof = ethers.toUtf8Bytes("zkproof");
  await voting.connect(voter1).castVote(electionId, 1, voterBio, proof);
  await expect(
    voting.connect(voter1).castVote(electionId, 1, voterBio, proof)
  ).to.be.revertedWith("VotingSystem: voted");
});
it("نباید بدون ZK Proof رای داد", async function () {
  const voterBio = ethers.keccak256(ethers.toUtf8Bytes("voter2"));
  await expect(
    voting.connect(voter2).castVote(electionId, 1, voterBio, "0x")
  ).to.be.revertedWith("VotingSystem: invalid ZK proof");
});
it("باید تعداد آرا افزایش یابد", async function () {
  const voterBio = ethers.keccak256(ethers.toUtf8Bytes("voter1"));
  const proof = ethers.toUtf8Bytes("zkproof");
  await voting.connect(voter1).castVote(electionId, 1, voterBio, proof);
  const election = await voting.getElection(electionId);
  expect(election.totalVotes).to.equal(1);
});

});

describe("Turnout Calculation", function () {
it("باید مشارکت صفر برای انتخابات بدون رای باشد", async function () {
await voting.connect(electionAdmin).createElection(0, 0, "انتخابات", startTime, endTime, 1000);
expect(await voting.getTurnout(1)).to.equal(0);
});
});
});
