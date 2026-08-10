// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys and safely wires TriggerProtocol.
//
// Safety order is intentional:
//   1. TriggerProtocol is deployed against the canonical Kernel/Treasury/SWF.
//   2. The Constitutional Court must already be complete (9/9 COURT_ROLE).
//   3. Treasury grants KERNEL_ROLE to TriggerProtocol.
//   4. Only then does Kernel.setTriggerProtocol() activate the pointer.
//
// This role-first ordering prevents Kernel from pointing at a TriggerProtocol
// that cannot execute Treasury.blockAddressByTrigger(), which would otherwise
// make a threshold trigger revert atomically on the Treasury call.

async function deployTriggerProtocol(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  const treasuryAddress = requireAddress(addresses, "TREASURY_ADDRESS", "05_treasury.js");
  const swfAddress = requireAddress(addresses, "SWF_ADDRESS", "06_swf.js");

  const TriggerProtocol = await ethers.getContractFactory("TriggerProtocol");
  const triggerProtocol = await TriggerProtocol.deploy(kernelAddress, treasuryAddress, swfAddress);
  await triggerProtocol.waitForDeployment();

  return { triggerProtocol, address: await triggerProtocol.getAddress() };
}

async function assertCourtReady(kernel, config) {
  const COURT_ROLE = await kernel.COURT_ROLE();
  const courtMembers = [config.court1, ...config.courtMembers2to9];
  const normalized = courtMembers.map((address) => address.toLowerCase());

  if (courtMembers.length !== 9 || new Set(normalized).size !== 9) {
    throw new Error(
      "TriggerProtocol wiring refused: COURT_1..COURT_9 must contain 9 distinct addresses before activation."
    );
  }

  for (const courtMember of courtMembers) {
    if (!(await kernel.hasRole(COURT_ROLE, courtMember))) {
      throw new Error(
        `TriggerProtocol wiring refused: court completion is not ready; ${courtMember} lacks COURT_ROLE.`
      );
    }
  }
}

async function wireTriggerProtocol(hre, config, addresses, sovereignSigner) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  const treasuryAddress = requireAddress(addresses, "TREASURY_ADDRESS", "05_treasury.js");
  const swfAddress = requireAddress(addresses, "SWF_ADDRESS", "06_swf.js");
  const triggerAddress = requireAddress(addresses, "TRIGGER_PROTOCOL_ADDRESS", "16_trigger_protocol.js");

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress, sovereignSigner);
  const treasury = await ethers.getContractAt("Treasury", treasuryAddress, sovereignSigner);
  const triggerProtocol = await ethers.getContractAt("TriggerProtocol", triggerAddress);

  // Constructor provenance must match the exact deployment address book before
  // any authority is granted or pointer is activated.
  if ((await triggerProtocol.kernel()) !== kernelAddress) {
    throw new Error("TriggerProtocol wiring refused: trigger.kernel() does not match KERNEL_ADDRESS.");
  }
  if ((await triggerProtocol.treasury()) !== treasuryAddress) {
    throw new Error("TriggerProtocol wiring refused: trigger.treasury() does not match TREASURY_ADDRESS.");
  }
  if ((await triggerProtocol.swf()) !== swfAddress) {
    throw new Error("TriggerProtocol wiring refused: trigger.swf() does not match SWF_ADDRESS.");
  }

  await assertCourtReady(kernel, config);

  const currentTrigger = await kernel.triggerProtocol();
  if (currentTrigger !== ethers.ZeroAddress && currentTrigger !== triggerAddress) {
    throw new Error(
      `TriggerProtocol wiring refused: Kernel already points to a different TriggerProtocol (${currentTrigger}).`
    );
  }

  const KERNEL_ROLE = await treasury.KERNEL_ROLE();

  // Role first. If setTriggerProtocol later fails, the system remains safe:
  // the TriggerProtocol still cannot call executeTrigger because only the
  // Kernel contract can invoke it and Kernel has not activated this pointer.
  if (!(await treasury.hasRole(KERNEL_ROLE, triggerAddress))) {
    await (await treasury.grantRole(KERNEL_ROLE, triggerAddress)).wait();
  }

  if ((await kernel.triggerProtocol()) === ethers.ZeroAddress) {
    await (await kernel.setTriggerProtocol(triggerAddress)).wait();
  }

  if (!(await treasury.hasRole(KERNEL_ROLE, triggerAddress))) {
    throw new Error("TriggerProtocol wiring failed: Treasury KERNEL_ROLE postcondition is false.");
  }
  if ((await kernel.triggerProtocol()) !== triggerAddress) {
    throw new Error("TriggerProtocol wiring failed: Kernel triggerProtocol pointer postcondition is false.");
  }

  return { kernelRole: KERNEL_ROLE };
}

module.exports = { deployTriggerProtocol, wireTriggerProtocol, assertCourtReady };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const [sovereignSigner] = await hre.ethers.getSigners();

    if (!addresses.TRIGGER_PROTOCOL_ADDRESS) {
      const { address } = await deployTriggerProtocol(hre, config, addresses);
      addresses.TRIGGER_PROTOCOL_ADDRESS = address;
      // Persist before authority wiring so a wiring failure never loses the
      // on-chain contract address and can be resumed without redeployment.
      saveAddresses(hre.network.name, addresses);
      console.log(`TriggerProtocol deployed: ${address}`);
    }

    await wireTriggerProtocol(hre, config, addresses, sovereignSigner);
    saveAddresses(hre.network.name, addresses);
    console.log(`TriggerProtocol wired: ${addresses.TRIGGER_PROTOCOL_ADDRESS}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
