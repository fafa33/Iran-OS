// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deploys Treasury (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 2:
//   deploy Treasury(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on 04_oracle.js or 06_swf.js.
//
// The constructor grants DEFAULT_ADMIN_ROLE to SOVEREIGN_ADDRESS (a real
// signer) and KERNEL_ROLE to KERNEL_ADDRESS (contracts/monetary/Treasury.sol) —
// mirroring SovereignWealthFund's constructor(sovereign, kernel) split. This
// makes post-deploy role wiring — specifically granting KERNEL_ROLE to
// TriggerProtocol so it can call blockAddressByTrigger() (TG-01) — reachable
// via the Sovereign signer; the Kernel contract has no call-forwarding
// mechanism to this contract and could never exercise DEFAULT_ADMIN_ROLE
// itself.

async function deployTreasury(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(config.sovereignAddress, kernelAddress);
  await treasury.waitForDeployment();
  return { treasury, address: await treasury.getAddress() };
}

module.exports = { deployTreasury };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployTreasury(hre, config, addresses);
    addresses.TREASURY_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`Treasury deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
