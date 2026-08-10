// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys JurySelection (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 7:
//   deploy JurySelection(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants DEFAULT_ADMIN_ROLE to SOVEREIGN_ADDRESS (a real
// signer) and KERNEL_ROLE to KERNEL_ADDRESS (contracts/justice/JurySelection.sol) —
// mirroring SovereignWealthFund's constructor(sovereign, kernel) split. This
// makes post-deploy role wiring (VRF_ROLE, COURT_ROLE) reachable via the
// Sovereign signer; the Kernel contract has no call-forwarding mechanism to
// this contract and could never exercise DEFAULT_ADMIN_ROLE itself.

async function deployJurySelection(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const JurySelection = await ethers.getContractFactory("JurySelection");
  const jurySelection = await JurySelection.deploy(config.sovereignAddress, kernelAddress);
  await jurySelection.waitForDeployment();
  return { jurySelection, address: await jurySelection.getAddress() };
}

module.exports = { deployJurySelection };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployJurySelection(hre, config, addresses);
    addresses.JURY_SELECTION_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`JurySelection deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
