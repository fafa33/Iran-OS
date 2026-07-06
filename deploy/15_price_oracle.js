// SPDX-License-Identifier: MIT
// Deploys PriceOracle (Layer 1/3 per the manifest — independent of Layer 2).
// Matches docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, step 10:
//   deploy PriceOracle(SOVEREIGN_ADDRESS, KERNEL_ADDRESS)
//
// Runs after 01_kernel.js. Has no dependency on any other deploy/ script in
// this workflow ("مستقل از Layer 2").
//
// The constructor grants DEFAULT_ADMIN_ROLE to SOVEREIGN_ADDRESS (a real
// signer) and KERNEL_ROLE to KERNEL_ADDRESS (contracts/oracles/PriceOracle.sol) —
// mirroring the fix already applied to VictimFund/ConstitutionGuard/
// JurySelection/JusticeProtocol/CitizenCard (see CHANGELOG "P0 deployment-path
// parity"). Deploying with KERNEL_ADDRESS as the sole admin would reproduce
// the same defect: the Kernel contract has no call-forwarding mechanism to
// this contract, so it could never call grantRole()/invalidatePrice() itself.
//
// FEEDER_ROLE is NOT granted by this script: the manifest's §9 Group 3
// post-deploy check (`priceOracle.hasRole(FEEDER_ROLE, PRICE_FEEDER)`)
// depends on a PRICE_FEEDER address book variable that is not listed in §1's
// table (the same documentation gap that excluded PriceOracle from the
// batch-2 deploy scripts). Granting FEEDER_ROLE to a real feeder address is
// left as a documented post-deploy step via SOVEREIGN_ADDRESS's
// DEFAULT_ADMIN_ROLE, once that address is chosen — inventing a
// PRICE_FEEDER value here would not be genuine configuration.

async function deployPriceOracle(hre, config, addresses) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");

  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy(config.sovereignAddress, kernelAddress);
  await priceOracle.waitForDeployment();
  return { priceOracle, address: await priceOracle.getAddress() };
}

module.exports = { deployPriceOracle };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const { address } = await deployPriceOracle(hre, config, addresses);
    addresses.PRICE_ORACLE_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`PriceOracle deployed: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
