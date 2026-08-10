// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys IranOS_Kernel (Layer 0). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 1, step 1:
//   deploy Kernel(SOVEREIGN, COURT_1, ORACLE_INITIAL, SWF_MULTISIG)

async function deployKernel(hre, config) {
  const { ethers } = hre;
  const Kernel = await ethers.getContractFactory("IranOS_Kernel");
  const kernel = await Kernel.deploy(
    config.sovereignAddress,
    config.court1,
    config.oracleInitial,
    config.swfMultisig
  );
  await kernel.waitForDeployment();
  return { kernel, address: await kernel.getAddress() };
}

module.exports = { deployKernel };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployKernel(hre, config);
    addresses.KERNEL_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`Kernel deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
