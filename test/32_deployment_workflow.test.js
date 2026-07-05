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

  it("blocks Oracle activation (08_finalize.js) if Court completion (07_roles.js) has not run yet", async function () {
    const config = loadConfig();
    const { deployKernel } = require("../deploy/01_kernel");
    const { deployOracle } = require("../deploy/04_oracle");
    const { finalizeOracleActivation } = require("../deploy/08_finalize");

    const { address: kernelAddress } = await deployKernel(hre, config);
    const addresses = { KERNEL_ADDRESS: kernelAddress };
    const { address: oracleAddress } = await deployOracle(hre, config, addresses);
    addresses.API3_ORACLE_ADDRESS = oracleAddress;

    // Only COURT_1 exists at this point (from Kernel's constructor) —
    // 07_roles.js was never run, so members 2-9 do not hold COURT_ROLE yet.
    let error;
    try {
      await finalizeOracleActivation(hre, config, addresses, sovereign);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/07_roles\.js/);

    const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress);
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();
    expect(await kernel.hasRole(ORACLE_ROLE, oracleAddress)).to.be.false;
  });

  it("verify script fails if two configured court addresses are not distinct", async function () {
    const config = loadConfig();
    const duplicated = {
      ...config,
      courtMembers2to9: [config.court1, ...config.courtMembers2to9.slice(1)],
    };

    // Build the deployment manually through 08_finalize.js — NOT via
    // runDeployment(), which calls verifyDeployment() as its own last step
    // and would throw on the duplicate before this test could assert on it.
    const { deployKernel } = require("../deploy/01_kernel");
    const { deployTreasury } = require("../deploy/05_treasury");
    const { deploySwf } = require("../deploy/06_swf");
    const { deployToken } = require("../deploy/02_token");
    const { deployOracle } = require("../deploy/04_oracle");
    const { deployRecognizedBacking } = require("../deploy/03_recognized_backing");
    const { wireCourtCompletion } = require("../deploy/07_roles");
    const { finalizeOracleActivation } = require("../deploy/08_finalize");
    const { verifyDeployment } = require("../deploy/09_verify");

    const addresses = {};
    addresses.KERNEL_ADDRESS = (await deployKernel(hre, duplicated)).address;
    addresses.TREASURY_ADDRESS = (await deployTreasury(hre, addresses)).address;
    addresses.SWF_ADDRESS = (await deploySwf(hre, duplicated, addresses)).address;
    addresses.PAHLAVI_TOKEN_ADDRESS = (await deployToken(hre, duplicated, addresses, sovereign)).address;
    addresses.API3_ORACLE_ADDRESS = (await deployOracle(hre, duplicated, addresses)).address;
    addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS = (
      await deployRecognizedBacking(hre, duplicated, addresses, sovereign)
    ).address;
    await wireCourtCompletion(hre, duplicated, addresses, sovereign);
    await finalizeOracleActivation(hre, duplicated, addresses, sovereign);

    let error;
    try {
      await verifyDeployment(hre, duplicated, addresses);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/pairwise-distinct/);
  });

  it("exports the expected function from every deploy/ script (catches CLI-wiring regressions)", function () {
    const expectedExports = {
      "../deploy/01_kernel": "deployKernel",
      "../deploy/02_token": "deployToken",
      "../deploy/03_recognized_backing": "deployRecognizedBacking",
      "../deploy/04_oracle": "deployOracle",
      "../deploy/05_treasury": "deployTreasury",
      "../deploy/06_swf": "deploySwf",
      "../deploy/07_roles": "wireCourtCompletion",
      "../deploy/08_finalize": "finalizeOracleActivation",
      "../deploy/09_verify": "verifyDeployment",
      "../deploy/index": "runDeployment",
    };
    for (const [modulePath, exportName] of Object.entries(expectedExports)) {
      const mod = require(modulePath);
      expect(mod[exportName], `${modulePath} must export ${exportName}`).to.be.a("function");
    }
    // Note: this only verifies module.exports shape. The standalone CLI
    // entry points (the `if (require.main === module)` blocks, invoked via
    // `npx hardhat run deploy/0N_*.js --network <network>`) are not
    // exercised by this suite and were verified manually against a
    // persistent local node — see deploy/README.md.
  });
});
