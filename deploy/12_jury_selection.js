// SPDX-License-Identifier: MIT
// Deploys JurySelection (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 7:
//   deploy JurySelection(KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants both DEFAULT_ADMIN_ROLE and KERNEL_ROLE to the
// Kernel address (contracts/justice/JurySelection.sol:46-50) — no
// additional post-deploy role wiring is documented in §4-§7 for this
// contract.

async function deployJurySelection(hre, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const JurySelection = await ethers.getContractFactory("JurySelection");
  const jurySelection = await JurySelection.deploy(kernelAddress);
  await jurySelection.waitForDeployment();
  return { jurySelection, address: await jurySelection.getAddress() };
}

module.exports = { deployJurySelection };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployJurySelection(hre, addresses);
    addresses.JURY_SELECTION_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`JurySelection deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
