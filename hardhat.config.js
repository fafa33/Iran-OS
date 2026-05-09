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
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // بعداً Infura/Alchemy بذار
      accounts: ["YOUR_PRIVATE_KEY"], // بعداً .env بذار (هرگز مستقیم ننویس!)
    },
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