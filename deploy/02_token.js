// SPDX-License-Identifier: MIT
// Deploys PahlaviToken (Layer 2) and wires it to Kernel. Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 3, step 13:
//   deploy PahlaviToken(SWF_ADDRESS, KERNEL_ADDRESS, INITIAL_RESERVES)
//   sovereign اجرا کند: kernel.setPahlaviToken(PAHLAVI_TOKEN_ADDRESS)
//
// The setPahlaviToken() call is the GAP-MEX-05 prerequisite: without it,
// syncReserves, setPahlaviRecognizedReserveBacking, and
// syncRecognizedBackingTotal all revert with "Kernel: pahlaviToken not set".
//
// Requires SWF_ADDRESS (06_swf.js) and KERNEL_ADDRESS (01_kernel.js) —
// see deploy/index.js for the dependency-correct execution order.

async function deployToken(hre, config, addresses, sovereignSigner) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  const swfAddress = requireAddress(addresses, "SWF_ADDRESS", "06_swf.js");

  const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
  const token = await PahlaviToken.deploy(swfAddress, kernelAddress, config.initialReserves);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress, sovereignSigner);
  await (await kernel.setPahlaviToken(tokenAddress)).wait();

  return { token, address: tokenAddress };
}

module.exports = { deployToken };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const [sovereignSigner] = await hre.ethers.getSigners();
    const { address } = await deployToken(hre, config, addresses, sovereignSigner);
    addresses.PAHLAVI_TOKEN_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`PahlaviToken deployed and wired: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
