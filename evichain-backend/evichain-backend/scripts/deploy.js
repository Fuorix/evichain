/**
 * EviChain Contract Deployment Script
 * ─────────────────────────────────────
 * Usage:
 *   node scripts/deploy.js
 *
 * Prerequisites:
 *   - .env has RPC_URL and PRIVATE_KEY set
 *   - You have Sepolia ETH for gas (get free ETH from https://sepoliafaucet.com)
 *
 * After running this script:
 *   - Copy the printed CONTRACT_ADDRESS into your .env file
 *   - The same address goes in your React frontend's config
 */

import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Minimal Solidity compiler via solc-js ────────────────────────────────────
// If you have Hardhat installed, use that instead.
// This script uses ethers.js ContractFactory with a pre-compiled bytecode
// approach. For full compilation, install: npm install -g solc
//
// OPTION A — Use Remix IDE (easiest for students):
//   1. Open https://remix.ethereum.org
//   2. Paste contracts/EviChain.sol
//   3. Compile → get ABI + Bytecode
//   4. Deploy to Sepolia via Remix's Deploy tab (MetaMask)
//   5. Copy the deployed address to .env
//
// OPTION B — Use Hardhat (run from project root):
//   npx hardhat compile
//   npx hardhat run scripts/deploy.js --network sepolia
//
// OPTION C — This script (requires compiled bytecode):
//   Replace PLACEHOLDER_BYTECODE below with the compiled bytecode from Remix.

const PLACEHOLDER_BYTECODE = "PASTE_COMPILED_BYTECODE_HERE";

async function main() {
  console.log("\n🔧 EviChain Deployment Script\n");

  if (!process.env.RPC_URL)     throw new Error("RPC_URL not set in .env");
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const network = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);

  console.log(`📡  Network    : ${network.name} (chainId: ${network.chainId})`);
  console.log(`👛  Deployer   : ${wallet.address}`);
  console.log(`💰  Balance    : ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.error("❌  Wallet has no ETH. Get Sepolia ETH from https://sepoliafaucet.com");
    process.exit(1);
  }

  // Read ABI from our ABI file
  const { EviChainABI } = await import("../contracts/EviChainABI.js");

  if (PLACEHOLDER_BYTECODE === "PASTE_COMPILED_BYTECODE_HERE") {
    console.log("═══════════════════════════════════════════════════════");
    console.log(" DEPLOYMENT INSTRUCTIONS");
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n📌 RECOMMENDED: Use Remix IDE (easiest)");
    console.log("   1. Go to https://remix.ethereum.org");
    console.log("   2. Create new file → paste contents of contracts/EviChain.sol");
    console.log("   3. Solidity Compiler tab → Compile EviChain.sol");
    console.log("   4. Deploy & Run tab → Environment: Injected Provider (MetaMask)");
    console.log("   5. Select Sepolia network in MetaMask");
    console.log("   6. Click Deploy → Confirm in MetaMask");
    console.log("   7. Copy the contract address → paste in .env as CONTRACT_ADDRESS");
    console.log("\n📌 ALTERNATIVE: Use Hardhat");
    console.log("   npm install --save-dev hardhat @nomicfoundation/hardhat-ethers");
    console.log("   npx hardhat init");
    console.log("   npx hardhat compile");
    console.log("   npx hardhat run scripts/deploy.js --network sepolia\n");
    return;
  }

  console.log("🚀  Deploying EviChain contract...\n");

  const factory  = new ethers.ContractFactory(EviChainABI, PLACEHOLDER_BYTECODE, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅  EviChain deployed successfully!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   CONTRACT_ADDRESS=${address}`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n📝 Next steps:");
  console.log("   1. Copy the CONTRACT_ADDRESS line above into your .env file");
  console.log("   2. Also add it to your React frontend config");
  console.log(`   3. View on Etherscan: https://sepolia.etherscan.io/address/${address}\n`);
}

main().catch(err => {
  console.error("Deployment failed:", err.message);
  process.exit(1);
});
