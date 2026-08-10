// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys CitizenCard (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 9:
//   deploy CitizenCard(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants DEFAULT_ADMIN_ROLE to SOVEREIGN_ADDRESS (a real
// signer) and KERNEL_ROLE to KERNEL_ADDRESS (contracts/welfare/CitizenCard.sol) —
// mirroring SovereignWealthFund's constructor(sovereign, kernel) split. This
// makes post-deploy role wiring (ISSUER_ROLE, HEALTH_ROLE, WELFARE_ROLE)
// reachable via the Sovereign signer; the Kernel contract has no
// call-forwarding mechanism to this contract and could never exercise
// KERNEL_ROLE-gated registerEmployer()/deactivateCard() or DEFAULT_ADMIN_ROLE
// itself.

async function deployCitizenCard(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const CitizenCard = await ethers.getContractFactory("CitizenCard");
  const citizenCard = await CitizenCard.deploy(config.sovereignAddress, kernelAddress);
  await citizenCard.waitForDeployment();
  return { citizenCard, address: await citizenCard.getAddress() };
}

module.exports = { deployCitizenCard };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployCitizenCard(hre, config, addresses);
    addresses.CITIZEN_CARD_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`CitizenCard deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
