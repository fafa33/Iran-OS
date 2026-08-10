// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys SovereignWealthFund (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 3:
//   deploy SovereignWealthFund(SOVEREIGN, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. PahlaviToken (02_token.js) depends on this
// script's output (SWF_ADDRESS), so this must run before 02_token.js
// despite the filename ordering — see deploy/index.js for the actual
// dependency-correct execution order.

async function deploySwf(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const SovereignWealthFund = await ethers.getContractFactory("SovereignWealthFund");
  const swf = await SovereignWealthFund.deploy(config.sovereignAddress, kernelAddress);
  await swf.waitForDeployment();
  return { swf, address: await swf.getAddress() };
}

module.exports = { deploySwf };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deploySwf(hre, config, addresses);
    addresses.SWF_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`SovereignWealthFund deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
