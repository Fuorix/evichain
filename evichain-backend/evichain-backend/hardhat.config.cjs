require("dotenv").config();
const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-ethers");

function normalizePrivateKey(rawKey) {
  if (!rawKey) return "";
  const key = rawKey.trim();
  return key.startsWith("0x") ? key : `0x${key}`;
}

const normalizedPrivateKey = normalizePrivateKey(process.env.PRIVATE_KEY || "");

/** @type {HardhatUserConfig} */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url:      (process.env.RPC_URL || "").trim(),
      accounts: normalizedPrivateKey ? [normalizedPrivateKey] : [],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources:   "./contracts",
    artifacts: "./artifacts",
    cache:     "./cache",
  },
};

module.exports = config;
