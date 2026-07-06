// SPDX-License-Identifier: MIT
// Deploys VictimFund (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 4:
//   deploy VictimFund(KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants both DEFAULT_ADMIN_ROLE and KERNEL_ROLE to the
// Kernel address (contracts/reclaim/VictimFund.sol:55-59) — no additional
// post-deploy role wiring is documented in §4-§7 for this contract.

async function deployVictimFund(hre, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const VictimFund = await ethers.getContractFactory("VictimFund");
  const victimFund = await VictimFund.deploy(kernelAddress);
  await victimFund.waitForDeployment();
  return { victimFund, address: await victimFund.getAddress() };
}

module.exports = { deployVictimFund };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployVictimFund(hre, addresses);
    addresses.VICTIM_FUND_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`VictimFund deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
