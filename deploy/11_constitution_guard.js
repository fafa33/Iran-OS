// SPDX-License-Identifier: MIT
// Deploys ConstitutionGuard (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 6:
//   deploy ConstitutionGuard(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor records both SOVEREIGN_ADDRESS (`admin`) and KERNEL_ADDRESS
// (`kernel`) — approveLaw()/rejectLaw() accept either as caller
// (contracts/core/ConstitutionGuard.sol). The Kernel contract has no
// call-forwarding mechanism to this contract, so `admin` (a real signer) is
// what actually exercises this authority in production.

async function deployConstitutionGuard(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const ConstitutionGuard = await ethers.getContractFactory("ConstitutionGuard");
  const constitutionGuard = await ConstitutionGuard.deploy(config.sovereignAddress, kernelAddress);
  await constitutionGuard.waitForDeployment();
  return { constitutionGuard, address: await constitutionGuard.getAddress() };
}

module.exports = { deployConstitutionGuard };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployConstitutionGuard(hre, config, addresses);
    addresses.CONSTITUTION_GUARD_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`ConstitutionGuard deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
