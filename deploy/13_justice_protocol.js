// SPDX-License-Identifier: MIT
// Deploys JusticeProtocol (Layer 1). Matches
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 2, step 8:
//   deploy JusticeProtocol(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Order within Layer 1 does not matter per the
// manifest ("مرحله ۲ — Layer 1 (ترتیب اهمیت ندارد)"), so this script has no
// dependency on any other deploy/ script in this batch.
//
// The constructor grants DEFAULT_ADMIN_ROLE to SOVEREIGN_ADDRESS (a real
// signer) and KERNEL_ROLE to KERNEL_ADDRESS (contracts/justice/JusticeProtocol.sol) —
// mirroring SovereignWealthFund's constructor(sovereign, kernel) split. This
// makes post-deploy role wiring (COURT_ROLE, APPEAL_ROLE) reachable via the
// Sovereign signer; the Kernel contract has no call-forwarding mechanism to
// this contract and could never exercise KERNEL_ROLE-gated approveJudge()
// or DEFAULT_ADMIN_ROLE itself.

async function deployJusticeProtocol(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const JusticeProtocol = await ethers.getContractFactory("JusticeProtocol");
  const justiceProtocol = await JusticeProtocol.deploy(config.sovereignAddress, kernelAddress);
  await justiceProtocol.waitForDeployment();
  return { justiceProtocol, address: await justiceProtocol.getAddress() };
}

module.exports = { deployJusticeProtocol };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployJusticeProtocol(hre, config, addresses);
    addresses.JUSTICE_PROTOCOL_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`JusticeProtocol deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
