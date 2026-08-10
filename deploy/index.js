// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Orchestrates the deploy/ scripts in dependency-correct order. The
// filenames (01_kernel.js .. 15_price_oracle.js) are grouped by
// contract/domain, not strict execution order: PahlaviToken (02_token.js)
// requires SovereignWealthFund's address, so SWF (06_swf.js) must run
// before it.
// Each script also remains independently runnable via
// `npx hardhat run deploy/0N_name.js --network <network>`, reading and
// writing the shared address book at deploy/deployments/<network>.json.
//
// Actual order: kernel -> treasury -> swf -> victim_fund ->
// constitution_guard -> jury_selection -> justice_protocol -> citizen_card ->
// price_oracle -> token -> oracle -> recognized_backing -> roles (Court,
// Group A) -> finalize (Oracle activation, Group E — documented as the last
// thing activated) -> verify.
//
// victim_fund/constitution_guard/jury_selection/justice_protocol/
// citizen_card/price_oracle (10-15) are Layer 1 (price_oracle: "مستقل از
// Layer 2" per §2) contracts whose constructors depend only on
// SOVEREIGN_ADDRESS/KERNEL_ADDRESS per
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3 Stage 2 ("ترتیب اهمیت
// ندارد" — order does not matter within Layer 1), so their position here
// relative to treasury/swf/oracle is arbitrary; they are placed after kernel
// and before token only because token (Layer 2) depends on swf.

const { deployKernel } = require("./01_kernel");
const { deployToken } = require("./02_token");
const { deployRecognizedBacking } = require("./03_recognized_backing");
const { deployOracle } = require("./04_oracle");
const { deployTreasury } = require("./05_treasury");
const { deploySwf } = require("./06_swf");
const { wireCourtCompletion } = require("./07_roles");
const { finalizeOracleActivation } = require("./08_finalize");
const { verifyDeployment } = require("./09_verify");
const { deployVictimFund } = require("./10_victim_fund");
const { deployConstitutionGuard } = require("./11_constitution_guard");
const { deployJurySelection } = require("./12_jury_selection");
const { deployJusticeProtocol } = require("./13_justice_protocol");
const { deployCitizenCard } = require("./14_citizen_card");
const { deployPriceOracle } = require("./15_price_oracle");

// persistStep, if provided, is called with the addresses accumulated so far
// immediately after each successful deployment/wiring step, so a mid-run
// failure (network error, a guard throwing, gas exhaustion) does not lose
// the record of contracts already deployed on-chain. Defaults to a no-op —
// callers that only need the in-memory result (e.g. tests) are unaffected.
async function runDeployment(hre, config, sovereignSigner, persistStep = () => {}) {
  const addresses = {};

  const { address: kernelAddress } = await deployKernel(hre, config);
  addresses.KERNEL_ADDRESS = kernelAddress;
  persistStep(addresses);

  const { address: treasuryAddress } = await deployTreasury(hre, config, addresses);
  addresses.TREASURY_ADDRESS = treasuryAddress;
  persistStep(addresses);

  const { address: swfAddress } = await deploySwf(hre, config, addresses);
  addresses.SWF_ADDRESS = swfAddress;
  persistStep(addresses);

  const { address: victimFundAddress } = await deployVictimFund(hre, config, addresses);
  addresses.VICTIM_FUND_ADDRESS = victimFundAddress;
  persistStep(addresses);

  const { address: constitutionGuardAddress } = await deployConstitutionGuard(hre, config, addresses);
  addresses.CONSTITUTION_GUARD_ADDRESS = constitutionGuardAddress;
  persistStep(addresses);

  const { address: jurySelectionAddress } = await deployJurySelection(hre, config, addresses);
  addresses.JURY_SELECTION_ADDRESS = jurySelectionAddress;
  persistStep(addresses);

  const { address: justiceProtocolAddress } = await deployJusticeProtocol(hre, config, addresses);
  addresses.JUSTICE_PROTOCOL_ADDRESS = justiceProtocolAddress;
  persistStep(addresses);

  const { address: citizenCardAddress } = await deployCitizenCard(hre, config, addresses);
  addresses.CITIZEN_CARD_ADDRESS = citizenCardAddress;
  persistStep(addresses);

  const { address: priceOracleAddress } = await deployPriceOracle(hre, config, addresses);
  addresses.PRICE_ORACLE_ADDRESS = priceOracleAddress;
  persistStep(addresses);

  const { address: tokenAddress } = await deployToken(hre, config, addresses, sovereignSigner);
  addresses.PAHLAVI_TOKEN_ADDRESS = tokenAddress;
  persistStep(addresses);

  const { address: oracleAddress } = await deployOracle(hre, config, addresses);
  addresses.API3_ORACLE_ADDRESS = oracleAddress;
  persistStep(addresses);

  const { address: registryAddress } = await deployRecognizedBacking(hre, config, addresses, sovereignSigner);
  addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS = registryAddress;
  persistStep(addresses);

  await wireCourtCompletion(hre, config, addresses, sovereignSigner);
  await finalizeOracleActivation(hre, config, addresses, sovereignSigner);

  const { checks } = await verifyDeployment(hre, config, addresses);

  return { addresses, checks };
}

// The 11 address keys produced by a full orchestrated run (see
// runDeployment above): the 6 core-monetary-path contracts plus the 5
// constructor-only-on-Kernel Layer 1 contracts added in this batch. Used by
// assertNoExistingDeployment to detect a prior run's artifacts before
// starting a new one.
const CORE_ADDRESS_KEYS = [
  "KERNEL_ADDRESS",
  "TREASURY_ADDRESS",
  "SWF_ADDRESS",
  "VICTIM_FUND_ADDRESS",
  "CONSTITUTION_GUARD_ADDRESS",
  "JURY_SELECTION_ADDRESS",
  "JUSTICE_PROTOCOL_ADDRESS",
  "CITIZEN_CARD_ADDRESS",
  "PRICE_ORACLE_ADDRESS",
  "PAHLAVI_TOKEN_ADDRESS",
  "API3_ORACLE_ADDRESS",
  "RECOGNIZED_RESERVE_BACKING_ADDRESS",
];

// Guards the orchestrated CLI entry point against silently overwriting an
// existing deployment: deploy/index.js's persistStep/saveAddresses always
// overwrite deploy/deployments/<network>.json in full, so re-running the
// full orchestration after a completed (or partial) prior run would orphan
// whatever contracts that prior run already deployed on-chain, with no
// on-disk record left pointing at them. This does not auto-resume a partial
// run or delete anything — it only stops before any new deployment begins,
// and tells the operator how to proceed deliberately.
function assertNoExistingDeployment(existingAddresses, networkName) {
  const found = CORE_ADDRESS_KEYS.filter((key) => existingAddresses[key]);
  if (found.length > 0) {
    throw new Error(
      `Refusing to run the full orchestrated deployment: deploy/deployments/${networkName}.json ` +
      `already contains deployment artifacts for this workflow (${found.join(", ")}). ` +
      "Running deploy/index.js again would overwrite this file and orphan the " +
      "already-deployed (still-live) contracts it currently records, with no way to " +
      "recover their addresses afterward. This script does not auto-resume a prior " +
      "run. To proceed, either: (1) continue the deployment manually using the " +
      "individual scripts (npx hardhat run deploy/0N_name.js --network " +
      `${networkName}), which read and update this file incrementally, or (2) if the ` +
      "existing artifacts are intentionally being discarded, remove or move aside " +
      `deploy/deployments/${networkName}.json first and re-run this script.`
    );
  }
}

module.exports = { runDeployment, assertNoExistingDeployment };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const existingAddresses = loadAddresses(hre.network.name);
    assertNoExistingDeployment(existingAddresses, hre.network.name);
    const [sovereignSigner] = await hre.ethers.getSigners();
    const persistStep = (addresses) => saveAddresses(hre.network.name, addresses);
    const { addresses, checks } = await runDeployment(hre, config, sovereignSigner, persistStep);
    saveAddresses(hre.network.name, addresses);
    console.log(`Deployment complete on ${hre.network.name}:`);
    console.log(JSON.stringify(addresses, null, 2));
    console.log(`Verification: ${checks.length}/${checks.length} checks passed`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
