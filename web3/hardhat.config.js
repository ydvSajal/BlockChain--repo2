// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000, // Increased from 200 to optimize for contract size
      },
      viaIR: true, // This helps with contract size optimization
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true, // Allow large contracts in local testing
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      allowUnlimitedContractSize: true, // Allow large contracts in localhost
    },
    holesky: {
      url: process.env.NETWORK_RPC_URL || process.env.NETWORK_RPC_URL,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 17000,
    },
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test",
  },
  sourcify: {
    enabled: true,
  },
};
