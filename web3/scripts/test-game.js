const hre = require("hardhat");

async function main() {
  console.log("🎲 Testing NumberPredictionGame contract...\n");

  // Get signers
  const [owner, player1, player2] = await hre.ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("🎮 Player 1:", player1.address);
  console.log("🎮 Player 2:", player2.address);

  // Deploy contract
  const NumberPredictionGame = await hre.ethers.getContractFactory("NumberPredictionGame");
  const game = await NumberPredictionGame.deploy();
  await game.deployed();

  console.log("\n✅ Contract deployed to:", game.address);

  // Fund the contract
  console.log("\n💵 Funding contract with 10 ETH...");
  const fundTx = await game.depositFunds({ value: hre.ethers.utils.parseEther("10") });
  await fundTx.wait();
  console.log("✅ Contract balance:", hre.ethers.utils.formatEther(await game.getBalance()), "ETH");

  // Test Game 1: Player 1 bets on number 3
  console.log("\n🎲 Game 1: Player 1 bets 0.01 ETH on number 3");
  const betAmount1 = hre.ethers.utils.parseEther("0.01");
  const tx1 = await game.connect(player1).play(3, { value: betAmount1 });
  const receipt1 = await tx1.wait();
  
  const event1 = receipt1.events.find(e => e.event === "GamePlayed");
  console.log("   Result:", event1.args.resultNumber.toString());
  console.log("   Won:", event1.args.won);
  if (event1.args.won) {
    console.log("   Payout:", hre.ethers.utils.formatEther(event1.args.payout), "ETH");
  }

  // Test Game 2: Player 2 bets on number 5
  console.log("\n🎲 Game 2: Player 2 bets 0.05 ETH on number 5");
  const betAmount2 = hre.ethers.utils.parseEther("0.05");
  const tx2 = await game.connect(player2).play(5, { value: betAmount2 });
  const receipt2 = await tx2.wait();
  
  const event2 = receipt2.events.find(e => e.event === "GamePlayed");
  console.log("   Result:", event2.args.resultNumber.toString());
  console.log("   Won:", event2.args.won);
  if (event2.args.won) {
    console.log("   Payout:", hre.ethers.utils.formatEther(event2.args.payout), "ETH");
  }

  // Test Game 3: Player 1 bets again on number 1
  console.log("\n🎲 Game 3: Player 1 bets 0.02 ETH on number 1");
  const betAmount3 = hre.ethers.utils.parseEther("0.02");
  const tx3 = await game.connect(player1).play(1, { value: betAmount3 });
  const receipt3 = await tx3.wait();
  
  const event3 = receipt3.events.find(e => e.event === "GamePlayed");
  console.log("   Result:", event3.args.resultNumber.toString());
  console.log("   Won:", event3.args.won);
  if (event3.args.won) {
    console.log("   Payout:", hre.ethers.utils.formatEther(event3.args.payout), "ETH");
  }

  // Get player 1's game history
  console.log("\n📊 Player 1's game history:");
  const player1Games = await game.getPlayerGames(player1.address, 10);
  console.log("   Total games:", player1Games.length);
  
  for (let i = 0; i < player1Games.length; i++) {
    const gameId = player1Games[i];
    const gameData = await game.getGame(gameId);
    console.log(`   Game ${gameId}: Bet ${gameData.predictedNumber}, Result ${gameData.resultNumber}, Won: ${gameData.won}`);
  }

  // Contract stats
  console.log("\n📈 Contract Stats:");
  console.log("   Total games:", (await game.gameCounter()).toString());
  console.log("   Contract balance:", hre.ethers.utils.formatEther(await game.getBalance()), "ETH");

  console.log("\n✅ Testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
