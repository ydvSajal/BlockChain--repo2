const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying NumberPredictionGame contract...\n");

  // Get the contract factory
  const NumberPredictionGame = await hre.ethers.getContractFactory("NumberPredictionGame");
  
  // Deploy the contract
  const game = await NumberPredictionGame.deploy();
  
  await game.deployed();

  console.log("✅ NumberPredictionGame deployed to:", game.address);
  console.log("📝 Contract owner:", await game.owner());
  console.log("💰 Min bet:", hre.ethers.utils.formatEther(await game.minBet()), "ETH");
  console.log("💰 Max bet:", hre.ethers.utils.formatEther(await game.maxBet()), "ETH");
  console.log("🏠 House edge:", (await game.houseEdge()).toString(), "%");
  
  // Fund the contract with some initial ETH for payouts
  console.log("\n💵 Funding contract with 10 ETH for game payouts...");
  const fundTx = await game.depositFunds({ value: hre.ethers.utils.parseEther("10") });
  await fundTx.wait();
  
  const balance = await game.getBalance();
  console.log("✅ Contract funded. Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  console.log("\n📋 Add this address to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${game.address}`);
  
  console.log("\n🎯 Contract is ready for games!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
