// SPDX-License-Identifier: MIT
// Deploys CitizenCard (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 9:
//   deploy CitizenCard(KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants both DEFAULT_ADMIN_ROLE and KERNEL_ROLE to the
// Kernel address (contracts/welfare/CitizenCard.sol:70-74) — no additional
// post-deploy role wiring is documented in §4-§7 for this contract.

async function deployCitizenCard(hre, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const CitizenCard = await ethers.getContractFactory("CitizenCard");
  const citizenCard = await CitizenCard.deploy(kernelAddress);
  await citizenCard.waitForDeployment();
  return { citizenCard, address: await citizenCard.getAddress() };
}

module.exports = { deployCitizenCard };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployCitizenCard(hre, addresses);
    addresses.CITIZEN_CARD_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`CitizenCard deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
