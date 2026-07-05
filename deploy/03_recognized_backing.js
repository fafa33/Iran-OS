// SPDX-License-Identifier: MIT
// Deploys RecognizedReserveBacking and atomically links it to PahlaviToken.
// Matches docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md §3, Stage 5,
// steps 26-27:
//   deploy RecognizedReserveBacking(SOVEREIGN_ADDRESS, RECOGNIZER_ADDRESS)
//   sovereign اجرا کند: kernel.setPahlaviRecognizedReserveBacking(RECOGNIZED_RESERVE_BACKING_ADDRESS)
//
// This is documented as "the only known production path" converting
// identities recorded via RecognizedReserveBacking.recordIdentity() into
// PahlaviToken.totalReserves. The wiring call is atomic: it sets
// recognizedReserveBacking on PahlaviToken AND immediately syncs
// totalReserves in the same transaction.
//
// Requires KERNEL_ADDRESS (01_kernel.js) and PAHLAVI_TOKEN_ADDRESS
// (02_token.js), and 02_token.js's setPahlaviToken() call must already have
// completed (enforced on-chain: setPahlaviRecognizedReserveBacking reverts
// with "Kernel: pahlaviToken not set" otherwise).

async function deployRecognizedBacking(hre, config, addresses, sovereignSigner) {
  const { ethers } = hre;
  const { requireAddress } = require("./lib/addressBook");
  const kernelAddress = requireAddress(addresses, "KERNEL_ADDRESS", "01_kernel.js");
  const tokenAddress = requireAddress(addresses, "PAHLAVI_TOKEN_ADDRESS", "02_token.js");

  const RecognizedReserveBacking = await ethers.getContractFactory("RecognizedReserveBacking");
  const registry = await RecognizedReserveBacking.deploy(
    config.sovereignAddress,
    config.recognizerAddress
  );
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  const token = await ethers.getContractAt("PahlaviToken", tokenAddress);
  const totalReservesBeforeWiring = await token.totalReserves();
  const recognizedBackingTotal = await registry.recognizedBackingTotal();
  if (totalReservesBeforeWiring > 0n && recognizedBackingTotal === 0n && !config.acknowledgeReserveReset) {
    throw new Error(
      `Reserve reset blocked: PahlaviToken.totalReserves() is currently ${totalReservesBeforeWiring.toString()} ` +
      "but the freshly-deployed RecognizedReserveBacking has recordIdentity() " +
      "count 0 (recognizedBackingTotal() == 0). " +
      "kernel.setPahlaviRecognizedReserveBacking() performs an atomic sync that " +
      "would replace the current totalReserves with 0. If this nonzero balance " +
      "(e.g. a nonzero INITIAL_RESERVES) was not yet recorded as a recognized " +
      "identity, set ACKNOWLEDGE_RESERVE_RESET=true to confirm this reset is " +
      "intentional, or record matching identities via " +
      "RecognizedReserveBacking.recordIdentity() before running this script."
    );
  }

  const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress, sovereignSigner);
  await (await kernel.setPahlaviRecognizedReserveBacking(registryAddress)).wait();

  return { registry, address: registryAddress };
}

module.exports = { deployRecognizedBacking };

if (require.main === module) {
  const hre = require("hardhat");
  const { loadConfig } = require("./config");
  const { loadAddresses, saveAddresses } = require("./lib/addressBook");

  (async () => {
    const config = loadConfig();
    const addresses = loadAddresses(hre.network.name);
    const [sovereignSigner] = await hre.ethers.getSigners();
    const { address } = await deployRecognizedBacking(hre, config, addresses, sovereignSigner);
    addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS = address;
    saveAddresses(hre.network.name, addresses);
    console.log(`RecognizedReserveBacking deployed and linked: ${address}`);
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
