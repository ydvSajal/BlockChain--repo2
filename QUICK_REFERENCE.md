# 🚀 QUICK COMMANDS REFERENCE

## Start Everything (3 Terminals)

### Terminal 1 - Blockchain
```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3
npx hardhat node
```
**Keep this running!** ⚡

### Terminal 2 - Deploy Contract (run once)
```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3
npx hardhat run scripts/deploy.js --network localhost
```
**Copy the contract address!** 📋

### Terminal 3 - Frontend
```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2
npm run dev
```
Open: http://localhost:3001

---

## MetaMask Setup (One-Time)

### Add Network
- Network: **Localhost**
- RPC: **http://127.0.0.1:8545**
- Chain ID: **1337**
- Symbol: **ETH**

### Import Account
Private Key: 
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
(You'll have 10,000 ETH) 💰

---

## .env.local File

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

Replace `YOUR_CONTRACT_ADDRESS_HERE` with address from Terminal 2!

---

## Test Contract (Optional)

```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3
npx hardhat run scripts/test-game.js --network localhost
```

---

## Stop Everything

1. Ctrl+C in all terminals
2. That's it! ✅

---

## 🎯 All You Need:

1. ✅ Hardhat dependencies installed
2. ✅ Contract compiled successfully  
3. ✅ Ready to deploy!

**Next:** Follow the 3-terminal commands above! 🚀
