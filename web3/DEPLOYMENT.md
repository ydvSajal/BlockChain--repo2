# 🎲 NumberPredictionGame Smart Contract Deployment

## Overview
This smart contract implements a dice prediction game (1-6) where players can bet ETH and win 6x their bet if they guess correctly.

## Contract Features
- ✅ Predict numbers 1-6
- ✅ 6x multiplier for correct predictions
- ✅ Configurable bet limits (min: 0.001 ETH, max: 1 ETH)
- ✅ Owner-controlled house bankroll
- ✅ Game history tracking
- ✅ Player statistics
- ✅ Secure fund management

## Prerequisites
```bash
cd web3
npm install
```

## Local Development

### 1. Start Local Hardhat Node
```bash
npx hardhat node
```
This will:
- Start a local blockchain on `http://127.0.0.1:8545`
- Create 20 test accounts with 10,000 ETH each
- Display private keys for testing

### 2. Deploy Contract (New Terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
🚀 Deploying NumberPredictionGame contract...

✅ NumberPredictionGame deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📝 Contract owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Min bet: 0.001 ETH
💰 Max bet: 1.0 ETH
🏠 House edge: 5 %

💵 Funding contract with 10 ETH for game payouts...
✅ Contract funded. Balance: 10.0 ETH

📋 Add this address to your .env.local file:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

🎯 Contract is ready for games!
```

### 3. Test the Contract
```bash
npx hardhat run scripts/test-game.js --network localhost
```

This will simulate 3 games and display results.

### 4. Update Your Frontend
Create/update `.env.local` in project root:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

## Testnet Deployment (Sepolia)

### 1. Setup Environment
Create `.env` in `web3` folder:
```env
PRIVATE_KEY=your_private_key_here
NETWORK_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

⚠️ **Never commit your private key!**

### 2. Get Test ETH
- Go to [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Receive test ETH

### 3. Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.js --network holesky
```

### 4. Verify on Etherscan
```bash
npx hardhat verify --network holesky DEPLOYED_CONTRACT_ADDRESS
```

## Mainnet Deployment (⚠️ Use with Caution)

### 1. Audit the Contract
- Get professional security audit
- Test extensively on testnet
- Review all functions

### 2. Update Hardhat Config
Add mainnet configuration to `hardhat.config.js`:
```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: [process.env.MAINNET_PRIVATE_KEY],
  chainId: 1,
}
```

### 3. Deploy
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### 4. Fund Contract
The contract needs ETH to pay out winnings. Send enough ETH to cover potential payouts.

## Contract Interaction

### Owner Functions (Only Contract Owner)
```javascript
// Set bet limits
await contract.setBetLimits(
  ethers.utils.parseEther("0.001"), // min
  ethers.utils.parseEther("10")     // max
);

// Withdraw profits
await contract.withdraw(ethers.utils.parseEther("1"));

// Transfer ownership
await contract.transferOwnership(newOwnerAddress);
```

### Player Functions (Anyone)
```javascript
// Play game - predict number 3 with 0.01 ETH bet
await contract.play(3, { 
  value: ethers.utils.parseEther("0.01") 
});

// Get game history
const gameIds = await contract.getPlayerGames(playerAddress, 100);

// Get specific game details
const game = await contract.getGame(gameId);
```

## Security Considerations

### ⚠️ Important Notes:
1. **Random Number Generation**: Current implementation uses `block.prevrandao` which is NOT cryptographically secure. For production, integrate [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction).

2. **House Bankroll**: Always ensure contract has sufficient ETH balance (6x max bet) to cover potential payouts.

3. **Gas Optimization**: Contract is optimized but test gas costs on mainnet.

4. **Access Control**: Only owner can withdraw funds and change settings.

## Upgrade to Chainlink VRF (Recommended for Production)

For truly random results, integrate Chainlink VRF:

1. Install Chainlink contracts:
```bash
npm install @chainlink/contracts
```

2. Modify contract to use VRF v2
3. Fund contract with LINK tokens
4. Update deployment scripts

## Troubleshooting

### Contract Deployment Failed
- Check you have enough ETH for gas
- Verify RPC URL is correct
- Ensure private key is valid

### "Insufficient contract balance" Error
- Contract needs ETH to pay winners
- Use `depositFunds()` to add more ETH

### Frontend Can't Connect
- Verify contract address in `.env.local`
- Check RPC URL matches network
- Ensure wallet is on correct network

## Contract ABI
The ABI is auto-generated at: `../utils/NumberPredictionGameABI.json`

## Support
For issues, check:
1. Hardhat logs: Look for detailed error messages
2. Etherscan: View transaction details
3. Console: Check browser console for frontend errors

---

**Built with ❤️ for blockchain gaming**
