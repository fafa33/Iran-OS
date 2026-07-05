// SPDX-License-Identifier: MIT
// Deploys Treasury (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 2:
//   deploy Treasury(KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on 04_oracle.js or 06_swf.js.

async function deployTreasury(hre, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(kernelAddress);
  await treasury.waitForDeployment();
  return { treasury, address: await treasury.getAddress() };
}

module.exports = { deployTreasury };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployTreasury(hre, addresses);
    addresses.TREASURY_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`Treasury deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
