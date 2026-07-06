// SPDX-License-Identifier: MIT
// Deploys ConstitutionGuard (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 6:
//   deploy ConstitutionGuard(KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor stores the Kernel address in the public `kernel` variable
// (contracts/core/ConstitutionGuard.sol:52-55, gating approveLaw/rejectLaw
// via onlyKernel) — no AccessControl role or additional post-deploy wiring
// is documented in §4-§7 for this contract.

async function deployConstitutionGuard(hre, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const ConstitutionGuard = await ethers.getContractFactory("ConstitutionGuard");
  const constitutionGuard = await ConstitutionGuard.deploy(kernelAddress);
  await constitutionGuard.waitForDeployment();
  return { constitutionGuard, address: await constitutionGuard.getAddress() };
}

module.exports = { deployConstitutionGuard };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployConstitutionGuard(hre, addresses);
    addresses.CONSTITUTION_GUARD_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`ConstitutionGuard deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
