# 🎯 COMPLETE BLOCKCHAIN SETUP GUIDE

## What You Need to Do (Step by Step)

### ✅ Step 1: Compile the Smart Contract

Open a new terminal and run:

```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

---

### ✅ Step 2: Start Local Blockchain

Keep this terminal open (don't close it):

```bash
npx hardhat node
```

You'll see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

**✏️ SAVE THIS INFORMATION:**
- Account #0 address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

### ✅ Step 3: Deploy Contract (New Terminal)

Open a **NEW terminal** (keep the first one running):

```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3
npx hardhat run scripts/deploy.js --network localhost
```

You'll see:
```
🚀 Deploying NumberPredictionGame contract...

✅ NumberPredictionGame deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📝 Contract owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Min bet: 0.001 ETH
💰 Max bet: 1.0 ETH

💵 Funding contract with 10 ETH for game payouts...
✅ Contract funded. Balance: 10.0 ETH

📋 Add this address to your .env.local file:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**✏️ COPY THE CONTRACT ADDRESS** (it will be similar to above)

---

### ✅ Step 4: Update Frontend Configuration

Create/edit `.env.local` in your project root:

```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2
nano .env.local
```

Add these lines (replace with YOUR contract address):

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

Save and exit (Ctrl+X, then Y, then Enter)

---

### ✅ Step 5: Setup MetaMask Wallet

#### 5a. Add Localhost Network to MetaMask

1. Open MetaMask extension
2. Click network dropdown (top)
3. Click "Add Network" → "Add a network manually"
4. Fill in:
   - **Network Name:** Localhost
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** ETH
5. Click "Save"
6. Switch to "Localhost" network

#### 5b. Import Test Account

1. Click account icon (top right)
2. Select "Import Account"
3. Paste the Private Key from Step 2:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

You should now see **10,000 ETH** in this account! 🎉

---

### ✅ Step 6: Start Your Frontend

Open a **THIRD terminal**:

```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2
npm run dev
```

Open: http://localhost:3001

---

### ✅ Step 7: Play the Game! 🎲

1. Click "Connect Wallet" button
2. Select MetaMask
3. Approve connection
4. Select a number (1-6)
5. Enter bet amount (e.g., 0.01 ETH)
6. Click "Place Bet"
7. Confirm transaction in MetaMask
8. Watch the dice roll!
9. If you win, you get 6x your bet! 🎉

---

## 🔍 Verification Commands

### Check if blockchain is running:
```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545
```

### Check contract balance:
```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3
npx hardhat console --network localhost
```
Then in console:
```javascript
const Game = await ethers.getContractFactory("NumberPredictionGame")
const game = await Game.attach("YOUR_CONTRACT_ADDRESS_HERE")
await game.getBalance()
```

---

## 🛑 Stopping Everything

1. **Stop Frontend:** Ctrl+C in frontend terminal
2. **Stop Blockchain:** Ctrl+C in hardhat node terminal

---

## ⚠️ Troubleshooting

### "Transaction failed" or "Insufficient funds"
- Make sure you imported the test account (10,000 ETH)
- Check MetaMask is on "Localhost" network

### "Cannot connect to wallet"
- Verify MetaMask is installed
- Check you're on Localhost network (Chain ID 1337)
- Refresh the page

### "Contract not found"
- Verify contract address in `.env.local` matches deployed address
- Make sure hardhat node is still running

### "Network mismatch"
- Switch MetaMask to Localhost network
- Chain ID must be 1337

---

## 📊 What's Running?

After setup, you should have:

✅ **Terminal 1:** Hardhat blockchain node (http://127.0.0.1:8545)
✅ **Terminal 2:** Available for commands
✅ **Terminal 3:** Frontend dev server (http://localhost:3001)
✅ **MetaMask:** Connected to Localhost with 10,000 ETH
✅ **Smart Contract:** Deployed with 10 ETH balance for payouts

---

## 🎮 Ready to Play!

Your blockchain dice game is now **FULLY FUNCTIONAL**! 

- Every bet is a real blockchain transaction
- Every win is paid from the smart contract
- All history is stored on-chain
- 100% decentralized gaming! 🎲

---

## 📝 Notes:

- **DO NOT** commit private keys to GitHub
- This is for **LOCAL TESTING** only
- For testnet/mainnet deployment, see `web3/DEPLOYMENT.md`
- Contract uses pseudo-random numbers (not secure for production)
- For production, integrate Chainlink VRF

---

**Happy Gaming! 🎰🎲🎉**
