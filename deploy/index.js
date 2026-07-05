// SPDX-License-Identifier: MIT
// Orchestrates the deploy/ scripts in dependency-correct order. The
// filenames (01_kernel.js .. 09_verify.js) are grouped by contract/domain,
// not strict execution order: PahlaviToken (02_token.js) requires
// SovereignWealthFund's address, so SWF (06_swf.js) must run before it.
// Each script also remains independently runnable via
// `npx hardhat run deploy/0N_name.js --network <network>`, reading and
// writing the shared address book at deploy/deployments/<network>.json.
//
// Actual order: kernel -> treasury -> swf -> token -> oracle ->
// recognized_backing -> roles (Court, Group A) -> finalize (Oracle
// activation, Group E — documented as the last thing activated) -> verify.

const { deployKernel } = require("./01_kernel");
const { deployToken } = require("./02_token");
const { deployRecognizedBacking } = require("./03_recognized_backing");
const { deployOracle } = require("./04_oracle");
const { deployTreasury } = require("./05_treasury");
const { deploySwf } = require("./06_swf");
const { wireCourtCompletion } = require("./07_roles");
const { finalizeOracleActivation } = require("./08_finalize");
const { verifyDeployment } = require("./09_verify");

async function runDeployment(hre, config, sovereignSigner) {
  const addresses = {};

  const { address: kernelAddress } = await deployKernel(hre, config);
  addresses.KERNEL_ADDRESS = kernelAddress;

  const { address: treasuryAddress } = await deployTreasury(hre, addresses);
  addresses.TREASURY_ADDRESS = treasuryAddress;

  const { address: swfAddress } = await deploySwf(hre, config, addresses);
  addresses.SWF_ADDRESS = swfAddress;

  const { address: tokenAddress } = await deployToken(hre, config, addresses, sovereignSigner);
  addresses.PAHLAVI_TOKEN_ADDRESS = tokenAddress;

  const { address: oracleAddress } = await deployOracle(hre, config, addresses);
  addresses.API3_ORACLE_ADDRESS = oracleAddress;

  const { address: registryAddress } = await deployRecognizedBacking(hre, config, addresses, sovereignSigner);
  addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS = registryAddress;

  await wireCourtCompletion(hre, config, addresses, sovereignSigner);
  await finalizeOracleActivation(hre, config, addresses, sovereignSigner);

  const { checks } = await verifyDeployment(hre, config, addresses);

  return { addresses, checks };
}

module.exports = { runDeployment };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const [sovereignSigner] = await hre.ethers.getSigners();
    const { addresses, checks } = await runDeployment(hre, config, sovereignSigner);
    saveAddresses(hre.network.name, addresses);
    console.log(`Deployment complete on ${hre.network.name}:`);
    console.log(JSON.stringify(addresses, null, 2));
    console.log(`Verification: ${checks.length}/${checks.length} checks passed`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
