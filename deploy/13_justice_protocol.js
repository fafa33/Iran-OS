// SPDX-License-Identifier: MIT
// Deploys JusticeProtocol (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 8:
//   deploy JusticeProtocol(KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants both DEFAULT_ADMIN_ROLE and KERNEL_ROLE to the
// Kernel address (contracts/justice/JusticeProtocol.sol:76-80) — no
// additional post-deploy role wiring is documented in §4-§7 for this
// contract.

async function deployJusticeProtocol(hre, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const JusticeProtocol = await ethers.getContractFactory("JusticeProtocol");
  const justiceProtocol = await JusticeProtocol.deploy(kernelAddress);
  await justiceProtocol.waitForDeployment();
  return { justiceProtocol, address: await justiceProtocol.getAddress() };
}

module.exports = { deployJusticeProtocol };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployJusticeProtocol(hre, addresses);
    addresses.JUSTICE_PROTOCOL_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`JusticeProtocol deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
