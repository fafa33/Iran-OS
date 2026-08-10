// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0

const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;
const { loadConfig } = require("../deploy/config");
const { runDeployment } = require("../deploy/index");
const { deployKernel } = require("../deploy/01_kernel");
const { deployTreasury } = require("../deploy/05_treasury");
const { deploySwf } = require("../deploy/06_swf");
const { deployTriggerProtocol, wireTriggerProtocol } = require("../deploy/16_trigger_protocol");

describe("TriggerProtocol deployment path", function () {
  let sovereign;
  let court;
  let oracleInitial;
  let swfMultisig;
  let feeder;
  let recognizer;

  before(async function () {
    const signers = await ethers.getSigners();
    sovereign = signers[0];
    court = signers.slice(1, 10);
    oracleInitial = signers[10];
    swfMultisig = signers[11];
    feeder = signers[12];
    recognizer = signers[13];

    process.env.SOVEREIGN_ADDRESS = sovereign.address;
    court.forEach((signer, index) => {
      process.env[`COURT_${index + 1}`] = signer.address;
    });
    process.env.ORACLE_INITIAL = oracleInitial.address;
    process.env.SWF_MULTISIG = swfMultisig.address;
    process.env.FEEDER_ADDRESSES = feeder.address;
    process.env.RECOGNIZER_ADDRESS = recognizer.address;
    process.env.INITIAL_RESERVES = "0";
  });

  it("deploys and activates TriggerProtocol only after its Treasury authority is reachable", async function () {
    const config = loadConfig();
    const { addresses, checks } = await runDeployment(hre, config, sovereign);

    expect(ethers.isAddress(addresses.TRIGGER_PROTOCOL_ADDRESS)).to.equal(true);
    expect(addresses.TRIGGER_PROTOCOL_ADDRESS).to.not.equal(ethers.ZeroAddress);

    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const treasury = await ethers.getContractAt("Treasury", addresses.TREASURY_ADDRESS);
    const trigger = await ethers.getContractAt("TriggerProtocol", addresses.TRIGGER_PROTOCOL_ADDRESS);
    const KERNEL_ROLE = await treasury.KERNEL_ROLE();

    expect(await trigger.kernel()).to.equal(addresses.KERNEL_ADDRESS);
    expect(await trigger.treasury()).to.equal(addresses.TREASURY_ADDRESS);
    expect(await trigger.swf()).to.equal(addresses.SWF_ADDRESS);
    expect(await treasury.hasRole(KERNEL_ROLE, addresses.TRIGGER_PROTOCOL_ADDRESS)).to.equal(true);
    expect(await kernel.triggerProtocol()).to.equal(addresses.TRIGGER_PROTOCOL_ADDRESS);
    expect(await trigger.executionCount()).to.equal(0n);

    for (const check of checks) {
      expect(check.pass, `check failed: ${check.name}`).to.equal(true);
    }
  });

  it("refuses activation before Court completion and leaves no partial authority behind", async function () {
    const config = loadConfig();
    const addresses = {};

    const { address: kernelAddress } = await deployKernel(hre, config);
    addresses.KERNEL_ADDRESS = kernelAddress;
    const { address: treasuryAddress } = await deployTreasury(hre, config, addresses);
    addresses.TREASURY_ADDRESS = treasuryAddress;
    const { address: swfAddress } = await deploySwf(hre, config, addresses);
    addresses.SWF_ADDRESS = swfAddress;
    const { address: triggerAddress } = await deployTriggerProtocol(hre, config, addresses);
    addresses.TRIGGER_PROTOCOL_ADDRESS = triggerAddress;

    let error;
    try {
      await wireTriggerProtocol(hre, config, addresses, sovereign);
    } catch (caught) {
      error = caught;
    }

    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.include("court completion is not ready");

    const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress);
    const treasury = await ethers.getContractAt("Treasury", treasuryAddress);
    const KERNEL_ROLE = await treasury.KERNEL_ROLE();

    expect(await kernel.triggerProtocol()).to.equal(ethers.ZeroAddress);
    expect(await treasury.hasRole(KERNEL_ROLE, triggerAddress)).to.equal(false);
  });

  it("refuses a TriggerProtocol whose constructor provenance does not match the address book", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);

    const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
    const wrongTrigger = await TriggerProtocol.deploy(
      addresses.KERNEL_ADDRESS,
      addresses.TREASURY_ADDRESS,
      sovereign.address
    );
    await wrongTrigger.waitForDeployment();

    const wrongAddresses = {
      ...addresses,
      TRIGGER_PROTOCOL_ADDRESS: await wrongTrigger.getAddress(),
    };

    let error;
    try {
      await wireTriggerProtocol(hre, config, wrongAddresses, sovereign);
    } catch (caught) {
      error = caught;
    }

    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.include("trigger.swf() does not match SWF_ADDRESS");
  });
});
