// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Read-only post-deploy verification for the contracts and authority paths
// deployed by this workflow. Throws on the first failed verification set.
// No state is mutated.

async function verifyDeployment(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");

  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  const treasuryAddress = requireAddress(addresses, "TREASURY_ADDRESS", "05_treasury.js");
  const swfAddress = requireAddress(addresses, "SWF_ADDRESS", "06_swf.js");
  const triggerAddress = requireAddress(addresses, "TRIGGER_PROTOCOL_ADDRESS", "16_trigger_protocol.js");
  const tokenAddress = requireAddress(addresses, "PAHLAVI_TOKEN_ADDRESS", "02_token.js");
  const oracleAddress = requireAddress(addresses, "API3_ORACLE_ADDRESS", "04_oracle.js");
  const registryAddress = requireAddress(addresses, "RECOGNIZED_RESERVE_BACKING_ADDRESS", "03_recognized_backing.js");
  const victimFundAddress = requireAddress(addresses, "VICTIM_FUND_ADDRESS", "10_victim_fund.js");
  const constitutionGuardAddress = requireAddress(addresses, "CONSTITUTION_GUARD_ADDRESS", "11_constitution_guard.js");
  const jurySelectionAddress = requireAddress(addresses, "JURY_SELECTION_ADDRESS", "12_jury_selection.js");
  const justiceProtocolAddress = requireAddress(addresses, "JUSTICE_PROTOCOL_ADDRESS", "13_justice_protocol.js");
  const citizenCardAddress = requireAddress(addresses, "CITIZEN_CARD_ADDRESS", "14_citizen_card.js");
  const priceOracleAddress = requireAddress(addresses, "PRICE_ORACLE_ADDRESS", "15_price_oracle.js");

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress);
  const treasury = await ethers.getContractAt("Treasury", treasuryAddress);
  const swf = await ethers.getContractAt("SovereignWealthFund", swfAddress);
  const trigger = await ethers.getContractAt("TriggerProtocol", triggerAddress);
  const token = await ethers.getContractAt("PahlaviToken", tokenAddress);
  const oracle = await ethers.getContractAt("API3Oracle", oracleAddress);
  const registry = await ethers.getContractAt("RecognizedReserveBacking", registryAddress);
  const victimFund = await ethers.getContractAt("VictimFund", victimFundAddress);
  const constitutionGuard = await ethers.getContractAt("ConstitutionGuard", constitutionGuardAddress);
  const jurySelection = await ethers.getContractAt("JurySelection", jurySelectionAddress);
  const justiceProtocol = await ethers.getContractAt("JusticeProtocol", justiceProtocolAddress);
  const citizenCard = await ethers.getContractAt("CitizenCard", citizenCardAddress);
  const priceOracle = await ethers.getContractAt("PriceOracle", priceOracleAddress);

  const checks = [];
  const check = (name, pass) => checks.push({ name, pass });

  // Group 1 — Court
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

  // Group 2 — TriggerProtocol. Constructor provenance, Treasury authority,
  // and Kernel pointer must all agree before the deployment is accepted.
  const TREASURY_KERNEL_ROLE = await treasury.KERNEL_ROLE();
  check("trigger.kernel() === KERNEL_ADDRESS", (await trigger.kernel()) === kernelAddress);
  check("trigger.treasury() === TREASURY_ADDRESS", (await trigger.treasury()) === treasuryAddress);
  check("trigger.swf() === SWF_ADDRESS", (await trigger.swf()) === swfAddress);
  check(
    "treasury.hasRole(KERNEL_ROLE, TRIGGER_PROTOCOL_ADDRESS)",
    await treasury.hasRole(TREASURY_KERNEL_ROLE, triggerAddress)
  );
  check("kernel.triggerProtocol() === TRIGGER_PROTOCOL_ADDRESS", (await kernel.triggerProtocol()) === triggerAddress);
  check("trigger.executionCount() === 0", (await trigger.executionCount()) === 0n);

  // Group 3 — Oracle
  const ORACLE_ROLE = await kernel.ORACLE_ROLE();
  const FEEDER_ROLE = await oracle.FEEDER_ROLE();
  check("kernel.hasRole(ORACLE_ROLE, API3_ORACLE_ADDRESS)", await kernel.hasRole(ORACLE_ROLE, oracleAddress));
  check(
    "kernel.hasRole(ORACLE_ROLE, ORACLE_INITIAL) === false",
    (await kernel.hasRole(ORACLE_ROLE, config.oracleInitial)) === false
  );
  for (const feeder of config.feederAddresses) {
    check(`oracle.hasRole(FEEDER_ROLE, ${feeder})`, await oracle.hasRole(FEEDER_ROLE, feeder));
  }
  check("kernel.pahlaviToken() === PAHLAVI_TOKEN_ADDRESS", (await kernel.pahlaviToken()) === tokenAddress);

  // Group 3.1 — RecognizedReserveBacking
  const RECOGNIZER_ROLE = await registry.RECOGNIZER_ROLE();
  check(
    "registry.hasRole(RECOGNIZER_ROLE, RECOGNIZER_ADDRESS)",
    await registry.hasRole(RECOGNIZER_ROLE, config.recognizerAddress)
  );
  check(
    "token.recognizedReserveBacking() === RECOGNIZED_RESERVE_BACKING_ADDRESS",
    (await token.recognizedReserveBacking()) === registryAddress
  );
  check(
    "token.totalReserves() === registry.recognizedBackingTotal()",
    (await token.totalReserves()) === (await registry.recognizedBackingTotal())
  );

  // Layer 1 constructor-role invariants plus Treasury.
  for (const [name, contract] of [
    ["treasury", treasury],
    ["victimFund", victimFund],
    ["jurySelection", jurySelection],
    ["justiceProtocol", justiceProtocol],
    ["citizenCard", citizenCard],
    ["priceOracle", priceOracle],
  ]) {
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const KERNEL_ROLE = await contract.KERNEL_ROLE();
    check(
      `${name}.hasRole(DEFAULT_ADMIN_ROLE, SOVEREIGN_ADDRESS)`,
      await contract.hasRole(DEFAULT_ADMIN_ROLE, config.sovereignAddress)
    );
    check(`${name}.hasRole(KERNEL_ROLE, KERNEL_ADDRESS)`, await contract.hasRole(KERNEL_ROLE, kernelAddress));
  }
  check(
    "constitutionGuard.admin() === SOVEREIGN_ADDRESS",
    (await constitutionGuard.admin()) === ethers.getAddress(config.sovereignAddress)
  );
  check("constitutionGuard.kernel() === KERNEL_ADDRESS", (await constitutionGuard.kernel()) === kernelAddress);

  // System status
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
