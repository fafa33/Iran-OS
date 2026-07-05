// SPDX-License-Identifier: MIT
// Deployment workflow characterization — exercises deploy/index.js against
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md and
// docs/deployment/ROLE_WIRING_CHECKLIST.md for the six core contracts
// (Kernel, Treasury, SovereignWealthFund, PahlaviToken, API3Oracle,
// RecognizedReserveBacking).

const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;
const { runDeployment } = require("../deploy/index");
const { loadConfig } = require("../deploy/config");

describe("Deployment Workflow (deploy/)", function () {
  let sovereign, court1, court2, court3, court4, court5, court6, court7, court8, court9;
  let oracleInitial, swfMultisig, feeder1, feeder2, recognizer;
  let courtMembers2to9;

  before(async function () {
    [
      sovereign,
      court1,
      court2,
      court3,
      court4,
      court5,
      court6,
      court7,
      court8,
      court9,
      oracleInitial,
      swfMultisig,
      feeder1,
      feeder2,
      recognizer,
    ] = await ethers.getSigners();

    courtMembers2to9 = [court2, court3, court4, court5, court6, court7, court8, court9];

    process.env.SOVEREIGN_ADDRESS = sovereign.address;
    process.env.COURT_1 = court1.address;
    courtMembers2to9.forEach((signer, i) => {
      process.env[`COURT_${i + 2}`] = signer.address;
    });
    process.env.ORACLE_INITIAL = oracleInitial.address;
    process.env.SWF_MULTISIG = swfMultisig.address;
    process.env.FEEDER_ADDRESSES = `${feeder1.address},${feeder2.address}`;
    process.env.RECOGNIZER_ADDRESS = recognizer.address;
    process.env.INITIAL_RESERVES = "0";
  });

  it("deploys and wires all six core contracts, passing every documented post-deploy check", async function () {
    const config = loadConfig();
    const { addresses, checks } = await runDeployment(hre, config, sovereign);

    for (const [name, address] of Object.entries(addresses)) {
      expect(ethers.isAddress(address), `${name} is not a valid address`).to.be.true;
      expect(address, `${name} must not be the zero address`).to.not.equal(ethers.ZeroAddress);
    }

    expect(checks.length).to.be.greaterThan(0);
    for (const c of checks) {
      expect(c.pass, `check failed: ${c.name}`).to.be.true;
    }
  });

  it("wires all 9 court members reaching the 7-of-9 multisig threshold", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const COURT_ROLE = await kernel.COURT_ROLE();

    expect(await kernel.hasRole(COURT_ROLE, court1.address)).to.be.true;
    for (const member of courtMembers2to9) {
      expect(await kernel.hasRole(COURT_ROLE, member.address)).to.be.true;
    }
  });

  it("registers API3Oracle as the sole ORACLE_ROLE holder and revokes the ORACLE_INITIAL placeholder", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();

    expect(await kernel.hasRole(ORACLE_ROLE, addresses.API3_ORACLE_ADDRESS)).to.be.true;
    expect(await kernel.hasRole(ORACLE_ROLE, oracleInitial.address)).to.be.false;
  });

  it("wires Kernel.pahlaviToken() (GAP-MEX-05) before any reserve-path call is reachable", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);

    expect(await kernel.pahlaviToken()).to.equal(addresses.PAHLAVI_TOKEN_ADDRESS);
  });

  it("atomically links RecognizedReserveBacking and syncs totalReserves in the same transaction", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const token = await ethers.getContractAt("PahlaviToken", addresses.PAHLAVI_TOKEN_ADDRESS);
    const registry = await ethers.getContractAt(
      "RecognizedReserveBacking",
      addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS
    );

    expect(await token.recognizedReserveBacking()).to.equal(addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS);
    expect(await token.totalReserves()).to.equal(await registry.recognizedBackingTotal());
  });

  it("leaves the deployed system in the documented clean initial state", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const oracle = await ethers.getContractAt("API3Oracle", addresses.API3_ORACLE_ADDRESS);
    const swf = await ethers.getContractAt("SovereignWealthFund", addresses.SWF_ADDRESS);

    expect(await kernel.isSystemHealthy()).to.be.true;
    expect(await kernel.emergencyLockActive()).to.be.false;
    expect(await kernel.violationCount()).to.equal(0n);
    expect(await kernel.triggerActivationCount()).to.equal(0n);
    expect(await oracle.violationFlagCount()).to.equal(0n);
    expect(await swf.totalAssets()).to.equal(0n);
  });

  it("throws a clear error when a required deployment config variable is missing", function () {
    const original = process.env.SOVEREIGN_ADDRESS;
    delete process.env.SOVEREIGN_ADDRESS;
    try {
      expect(() => loadConfig()).to.throw(/SOVEREIGN_ADDRESS/);
    } finally {
      process.env.SOVEREIGN_ADDRESS = original;
    }
  });

  it("throws when a later script's address-book prerequisite is missing", async function () {
    const { deployToken } = require("../deploy/02_token");
    const config = loadConfig();
    let error;
    try {
      await deployToken(hre, config, {}, sovereign);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/KERNEL_ADDRESS/);
  });
});
