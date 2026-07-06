// SPDX-License-Identifier: MIT
// Read-only post-deploy verification. Matches the applicable subset of
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §9 for the contracts
// deployed by this workflow: the six core-monetary-path contracts (Kernel,
// Treasury, SovereignWealthFund, PahlaviToken, API3Oracle,
// RecognizedReserveBacking) plus the five Layer 1, constructor-only-on-Kernel
// contracts added afterward (VictimFund, ConstitutionGuard, JurySelection,
// JusticeProtocol, CitizenCard).
//
// §9 Group 2 (TriggerProtocol) and the AssetFreeze/CRAWLER_ROLE/COUNCIL_ROLE
// checks in Group 4 are not applicable — those contracts are not part of
// this deployment workflow (see deploy/README.md).
//
// Throws on the first failed check. No state is mutated.

async function verifyDeployment(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");

  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  // TREASURY_ADDRESS is required here only to confirm 05_treasury.js ran; the
  // manifest's §9 checklist has no applicable Treasury check in this
  // workflow's scope (its only documented check, Group 2, is the
  // TriggerProtocol KERNEL_ROLE grant — not part of this deployment).
  requireAddress(addresses, "TREASURY_ADDRESS", "05_treasury.js");
  const swfAddress = requireAddress(addresses, "SWF_ADDRESS", "06_swf.js");
  const tokenAddress = requireAddress(addresses, "PAHLAVI_TOKEN_ADDRESS", "02_token.js");
  const oracleAddress = requireAddress(addresses, "API3_ORACLE_ADDRESS", "04_oracle.js");
  const registryAddress = requireAddress(addresses, "RECOGNIZED_RESERVE_BACKING_ADDRESS", "03_recognized_backing.js");
  const victimFundAddress = requireAddress(addresses, "VICTIM_FUND_ADDRESS", "10_victim_fund.js");
  const constitutionGuardAddress = requireAddress(addresses, "CONSTITUTION_GUARD_ADDRESS", "11_constitution_guard.js");
  const jurySelectionAddress = requireAddress(addresses, "JURY_SELECTION_ADDRESS", "12_jury_selection.js");
  const justiceProtocolAddress = requireAddress(addresses, "JUSTICE_PROTOCOL_ADDRESS", "13_justice_protocol.js");
  const citizenCardAddress = requireAddress(addresses, "CITIZEN_CARD_ADDRESS", "14_citizen_card.js");

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress);
  const swf = await ethers.getContractAt("SovereignWealthFund", swfAddress);
  const token = await ethers.getContractAt("PahlaviToken", tokenAddress);
  const oracle = await ethers.getContractAt("API3Oracle", oracleAddress);
  const registry = await ethers.getContractAt("RecognizedReserveBacking", registryAddress);
  const victimFund = await ethers.getContractAt("VictimFund", victimFundAddress);
  const constitutionGuard = await ethers.getContractAt("ConstitutionGuard", constitutionGuardAddress);
  const jurySelection = await ethers.getContractAt("JurySelection", jurySelectionAddress);
  const justiceProtocol = await ethers.getContractAt("JusticeProtocol", justiceProtocolAddress);
  const citizenCard = await ethers.getContractAt("CitizenCard", citizenCardAddress);

  const checks = [];
  const check = (name, pass) => checks.push({ name, pass });

  // Group 1 — Court (§9 گروه ۱)
  const COURT_ROLE = await kernel.COURT_ROLE();
  check("kernel.hasRole(COURT_ROLE, COURT_1)", await kernel.hasRole(COURT_ROLE, config.court1));
  for (const courtMember of config.courtMembers2to9) {
    check(`kernel.hasRole(COURT_ROLE, ${courtMember})`, await kernel.hasRole(COURT_ROLE, courtMember));
  }
  const allCourtMembers = [config.court1, ...config.courtMembers2to9];
  const uniqueCourtMembers = new Set(allCourtMembers.map((a) => a.toLowerCase()));
  check(
    "COURT_1..COURT_9 are 9 pairwise-distinct addresses",
    uniqueCourtMembers.size === allCourtMembers.length
  );
  check("kernel.emergencyLockActive() === false", (await kernel.emergencyLockActive()) === false);

  // Group 3 — Oracle (§9 گروه ۳)
  const ORACLE_ROLE = await kernel.ORACLE_ROLE();
  const FEEDER_ROLE = await oracle.FEEDER_ROLE();
  check("kernel.hasRole(ORACLE_ROLE, API3_ORACLE_ADDRESS)", await kernel.hasRole(ORACLE_ROLE, oracleAddress));
  check("kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL) === false", (await kernel.hasRole(ORACLE_ROLE, config.oracleInitial)) === false);
  for (const feeder of config.feederAddresses) {
    check(`oracle.hasRole(FEEDER_ROLE, ${feeder})`, await oracle.hasRole(FEEDER_ROLE, feeder));
  }
  check("kernel.pahlaviToken() === PAHLAVI_TOKEN_ADDRESS", (await kernel.pahlaviToken()) === tokenAddress);

  // Group 3.1 — RecognizedReserveBacking (§9 گروه ۳.۱)
  const RECOGNIZER_ROLE = await registry.RECOGNIZER_ROLE();
  check(
    "registry.hasRole(RECOGNIZER_ROLE, RECOGNIZER_ADDRESS)",
    await registry.hasRole(RECOGNIZER_ROLE, config.recognizerAddress)
  );
  check(
    "token.recognizedReserveBacking() === RECOGNIZED_RESERVE_BACKING_ADDRESS",
    (await token.recognizedReserveBacking()) === registryAddress
  );
  const totalReserves = await token.totalReserves();
  const recognizedBackingTotal = await registry.recognizedBackingTotal();
  check(
    "token.totalReserves() === registry.recognizedBackingTotal()",
    totalReserves === recognizedBackingTotal
  );

  // Batch 2 — Layer 1 constructor-only-on-Kernel contracts (VictimFund,
  // ConstitutionGuard, JurySelection, JusticeProtocol, CitizenCard). Not a
  // named group in §9 (that section predates this batch); these checks
  // verify the constructor-guaranteed invariant each contract's source
  // documents: DEFAULT_ADMIN_ROLE held by SOVEREIGN_ADDRESS (a real signer —
  // the Kernel contract cannot exercise DEFAULT_ADMIN_ROLE itself, having no
  // call-forwarding mechanism to these contracts) and KERNEL_ROLE recorded
  // against KERNEL_ADDRESS; for ConstitutionGuard, its plain `admin`/`kernel`
  // address getters.
  for (const [name, contract] of [
    ["victimFund", victimFund],
    ["jurySelection", jurySelection],
    ["justiceProtocol", justiceProtocol],
    ["citizenCard", citizenCard],
  ]) {
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const KERNEL_ROLE = await contract.KERNEL_ROLE();
    check(`${name}.hasRole(DEFAULT_ADMIN_ROLE, SOVEREIGN_ADDRESS)`, await contract.hasRole(DEFAULT_ADMIN_ROLE, config.sovereignAddress));
    check(`${name}.hasRole(KERNEL_ROLE, KERNEL_ADDRESS)`, await contract.hasRole(KERNEL_ROLE, kernelAddress));
  }
  // config.sovereignAddress is a raw, unchecksummed operator-supplied string
  // (deploy/config.js does no normalization) while contract.admin() always
  // returns ethers' checksummed form -- normalize both sides via
  // ethers.getAddress() before comparing, or a valid, correctly-deployed
  // lower-case SOVEREIGN_ADDRESS would fail this check with no on-chain
  // problem at all (Codex review finding on PR #119).
  check(
    "constitutionGuard.admin() === SOVEREIGN_ADDRESS",
    (await constitutionGuard.admin()) === ethers.getAddress(config.sovereignAddress)
  );
  check("constitutionGuard.kernel() === KERNEL_ADDRESS", (await constitutionGuard.kernel()) === kernelAddress);

  // Group 5 — System status (§9 گروه ۵, applicable subset)
  check("kernel.isSystemHealthy() === true", await kernel.isSystemHealthy());
  check("oracle.violationFlagCount() === 0", (await oracle.violationFlagCount()) === 0n);
  check("kernel.violationCount() === 0", (await kernel.violationCount()) === 0n);
  check("kernel.triggerActivationCount() === 0", (await kernel.triggerActivationCount()) === 0n);
  check("swf.totalAssets() === 0 (no deposits yet)", (await swf.totalAssets()) === 0n);

  const failed = checks.filter((c) => !c.pass);
  if (failed.length > 0) {
    throw new Error(
      `Deployment verification failed:\n${failed.map((c) => `  - ${c.name}`).join("\n")}`
    );
  }

  return { checks };
}

module.exports = { verifyDeployment };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { checks } = await verifyDeployment(hre, config, addresses);
    console.log(`Deployment verified: ${checks.length}/${checks.length} checks passed`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
