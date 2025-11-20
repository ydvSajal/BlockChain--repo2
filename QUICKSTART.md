# 🚀 Quick Start Guide - Deploy & Play

## Step 1: Deploy Smart Contract Locally

```bash
# Terminal 1: Start local blockchain
cd web3
npx hardhat node

# Terminal 2: Deploy contract
cd web3
npx hardhat run scripts/deploy.js --network localhost
```

**Copy the contract address from output!**

## Step 2: Update Frontend Configuration

Create `.env.local` in project root:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

## Step 3: Import Test Account to MetaMask

From the Hardhat node output, copy **Account #0** private key:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

In MetaMask:
1. Click account icon → Import Account
2. Paste the private key
3. Add localhost network:
   - Network Name: Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency: ETH

## Step 4: Start Frontend

```bash
npm run dev
```

Open http://localhost:3001

## Step 5: Play the Game! 🎲

1. Connect your MetaMask wallet
2. Select a number (1-6)
3. Enter bet amount (min 0.001 ETH)
4. Click "Place Bet"
5. Confirm transaction in MetaMask
6. Watch the dice roll!
7. Win 6x your bet if you guess correctly! 🎉

## Testing Commands

```bash
# Test contract functionality
cd web3
npx hardhat run scripts/test-game.js --network localhost

# Run contract tests (if you create test files)
npx hardhat test

# Check contract balance
npx hardhat console --network localhost
> const Game = await ethers.getContractFactory("NumberPredictionGame")
> const game = await Game.attach("YOUR_CONTRACT_ADDRESS")
> await game.getBalance()
```

## Troubleshooting

**"Insufficient funds" error:**
- Make sure you imported the test account with 10,000 ETH

**"Network mismatch" error:**
- Switch MetaMask to Localhost (Chain ID 1337)

**Contract not responding:**
- Check if Hardhat node is still running in Terminal 1
- Verify contract address in `.env.local` matches deployed address

**Transaction failing:**
- Contract needs ETH balance to pay winners
- Deployment script automatically funds it with 10 ETH

## Next Steps

✅ Your dice game is now fully functional!

To deploy to testnet/mainnet, see: `web3/DEPLOYMENT.md`

---

Happy Gaming! 🎲🎰🎉
