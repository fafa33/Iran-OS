require("@nomicfoundation/hardhat-toolbox");

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
    // sepolia: {
//   url: process.env.SEPOLIA_RPC_URL,
//   accounts: [process.env.PRIVATE_KEY]
// },
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY", // بعداً اضافه کن
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "YOUR_CMC_KEY", // اختیاری
  },
};