// SPDX-License-Identifier: MIT
// Deploys API3Oracle (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 5:
//   deploy API3Oracle(KERNEL_ADDRESS, [FEEDER_1, FEEDER_2, ...])
//   → FEEDER_ROLE در constructor اعطا می‌شود — post-deploy grantRole لازم نیست
//
// Registering API3Oracle as ORACLE_ROLE on Kernel (Group E) and revoking the
// ORACLE_INITIAL placeholder happen last, in 08_finalize.js — the manifest
// states ORACLE_ROLE is "the last thing activated" (§4 Group E).
//
// Requires KERNEL_ADDRESS (01_kernel.js).

async function deployOracle(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const API3Oracle = await ethers.getContractFactory("API3Oracle");
  const oracle = await API3Oracle.deploy(kernelAddress, config.feederAddresses);
  await oracle.waitForDeployment();
  return { oracle, address: await oracle.getAddress() };
}

module.exports = { deployOracle };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployOracle(hre, config, addresses);
    addresses.API3_ORACLE_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`API3Oracle deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
