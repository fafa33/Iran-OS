// SPDX-License-Identifier: MIT
// Completes the Constitutional Court (COURT_ROLE) — Group A of
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §4:
//   kernel.grantOfficialAccess(COURT_2..COURT_9, COURT_ROLE)
//
// Group A must complete "before everything else" (§4, and
// docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md §4/§6): before Oracle
// activation (08_finalize.js) and before any TriggerProtocol wiring
// (not part of this deployment workflow). Kernel's constructor already
// grants COURT_ROLE to COURT_1; this script grants it to the remaining 8
// members so the 7-of-9 multisig trigger threshold is reachable.
//
// Requires KERNEL_ADDRESS (01_kernel.js).

async function wireCourtCompletion(hre, config, addresses, sovereignSigner) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress, sovereignSigner);
  const COURT_ROLE = await kernel.COURT_ROLE();

  for (const courtMember of config.courtMembers2to9) {
    await (await kernel.grantOfficialAccess(courtMember, COURT_ROLE)).wait();
  }

  return { courtRole: COURT_ROLE };
}

module.exports = { wireCourtCompletion };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const [sovereignSigner] = await hre.ethers.getSigners();
    await wireCourtCompletion(hre, config, addresses, sovereignSigner);
    console.log("Court completion (Group A) wired: 9/9 COURT_ROLE members active");
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
