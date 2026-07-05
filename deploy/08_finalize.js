// SPDX-License-Identifier: MIT
// Activates the Oracle role — Group E of
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §4, explicitly documented
// as the last wiring step ("ORACLE_ROLE آخرین چیزی است که فعال می‌شود"):
//   kernel.grantOfficialAccess(API3_ORACLE_ADDRESS, ORACLE_ROLE)
//   kernel.revokeRole(ORACLE_ROLE, ORACLE_INITIAL)
//
// The ORACLE_INITIAL revoke is mandatory (§6): without it, the constructor
// placeholder oracle address could still call Kernel.syncReserves() /
// flagViolation() directly, bypassing the feeder -> API3Oracle -> Kernel
// path.
//
// Must run after 07_roles.js (Court completion must complete before Oracle
// activation — docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md §4/§6) and
// after 04_oracle.js (API3Oracle must be deployed).

async function finalizeOracleActivation(hre, config, addresses, sovereignSigner) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  const oracleAddress = requireAddress(addresses, "API3_ORACLE_ADDRESS", "04_oracle.js");

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress, sovereignSigner);
  const COURT_ROLE = await kernel.COURT_ROLE();
  const allCourtMembers = [config.court1, ...config.courtMembers2to9];

  const uniqueCourtMembers = new Set(allCourtMembers.map((a) => a.toLowerCase()));
  if (uniqueCourtMembers.size !== allCourtMembers.length) {
    throw new Error(
      "Oracle activation blocked: COURT_1..COURT_9 are not 9 pairwise-distinct " +
      "addresses. A duplicate address means fewer than 9 independent signers " +
      "hold COURT_ROLE, undermining the 7-of-9 trigger threshold's intended " +
      "independence margin. Fix the duplicate COURT_N environment variable " +
      "before running 07_roles.js and this script."
    );
  }

  const courtRoleChecks = await Promise.all(
    allCourtMembers.map((member) => kernel.hasRole(COURT_ROLE, member))
  );
  if (courtRoleChecks.some((hasRole) => !hasRole)) {
    throw new Error(
      "Oracle activation blocked: not all 9 COURT_ROLE members are active yet. " +
      "Run 07_roles.js (Court completion, Group A) first — " +
      "docs/deployment/COURT_ROLE_ASSIGNMENT_PROTOCOL.md §4 documents this as " +
      "a failure scenario without return if Oracle activates before the court " +
      "quorum is complete."
    );
  }

  const ORACLE_ROLE = await kernel.ORACLE_ROLE();

  await (await kernel.grantOfficialAccess(oracleAddress, ORACLE_ROLE)).wait();
  await (await kernel.revokeRole(ORACLE_ROLE, config.oracleInitial)).wait();

  return { oracleRole: ORACLE_ROLE };
}

module.exports = { finalizeOracleActivation };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const [sovereignSigner] = await hre.ethers.getSigners();
    await finalizeOracleActivation(hre, config, addresses, sovereignSigner);
    console.log("Oracle activation (Group E) finalized: API3Oracle registered, ORACLE_INITIAL revoked");
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
