// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys VictimFund (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 4:
//   deploy VictimFund(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants DEFAULT_ADMIN_ROLE to SOVEREIGN_ADDRESS (a real
// signer) and KERNEL_ROLE to KERNEL_ADDRESS (contracts/reclaim/VictimFund.sol) —
// mirroring SovereignWealthFund's constructor(sovereign, kernel) split. This
// makes post-deploy role wiring (COURT_ROLE, COUNCIL_ROLE, PENAL_LABOR_ROLE)
// reachable via the Sovereign signer; the Kernel contract has no
// call-forwarding mechanism to this contract and could never exercise
// DEFAULT_ADMIN_ROLE itself.

async function deployVictimFund(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const VictimFund = await ethers.getContractFactory("VictimFund");
  const victimFund = await VictimFund.deploy(config.sovereignAddress, kernelAddress);
  await victimFund.waitForDeployment();
  return { victimFund, address: await victimFund.getAddress() };
}

module.exports = { deployVictimFund };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployVictimFund(hre, config, addresses);
    addresses.VICTIM_FUND_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`VictimFund deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
