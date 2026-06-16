require("@nomicfoundation/hardhat-toolbox");
const path = require("path");

// Override the compiler-download subtask so offline/restricted environments use
// the already-installed solc/soljson.js instead of fetching from the network.
const { subtask } = require("hardhat/config");
subtask("compile:solidity:solc:get-build", async ({ solcVersion }) => {
  const soljsonPath = path.resolve(
    __dirname, "node_modules", "solc", "soljson.js"
  );
  return { compilerPath: soljsonPath, isSolcJs: true, version: solcVersion, longVersion: solcVersion };
});

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
};
