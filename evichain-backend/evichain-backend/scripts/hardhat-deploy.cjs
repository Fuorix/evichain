// scripts/hardhat-deploy.cjs
// Run with: npx hardhat run scripts/hardhat-deploy.cjs --network sepolia

const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔧  EviChain — Hardhat Deployment\n");

  const [deployer] = await ethers.getSigners();
  const balance    = await ethers.provider.getBalance(deployer.address);

  console.log(`👛  Deployer : ${deployer.address}`);
  console.log(`💰  Balance  : ${ethers.formatEther(balance)} ETH\n`);

  console.log("🚀  Deploying EviChain...");

  const EviChain = await ethers.getContractFactory("EviChain");
  const contract = await EviChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅  EviChain deployed!\n");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`   CONTRACT_ADDRESS=${address}`);
  console.log("══════════════════════════════════════════════════════════");
  console.log("\n📝  Next steps:");
  console.log("   1. Add CONTRACT_ADDRESS to your .env");
  console.log("   2. Add it to your React frontend config");
  console.log(`   3. Etherscan: https://sepolia.etherscan.io/address/${address}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
