# 🎮 Blockchain Dice Game - Quick Start Guide

## ✅ All Fixed Issues

1. **Disconnect Button** - Now always visible as a separate red button
2. **Network Configuration** - Configured for Localhost (Chain ID: 31337)
3. **Balance Display** - Should now show correct ETH balance
4. **Contract Deployment** - Successfully deployed to localhost

## 🚀 Current Status

- ✅ Hardhat Node Running (PID: 61563)
- ✅ Contract Deployed: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- ✅ Contract Funded: 10 ETH
- ✅ Frontend Running: http://localhost:3001

## 🎯 How to Play

### 1. **Connect MetaMask**
   - Open MetaMask extension
   - Switch to "Localhost" network (Chain ID: 31337)
   - You should see ~9,990 ETH (from previous deployment gas fees)
   - Click "Connect Wallet" button on the site

### 2. **Place a Bet**
   - Select a number between 1-6
   - Enter bet amount (0.001 - 1 ETH)
   - Click "Place Bet"
   - Confirm transaction in MetaMask
   - Wait for dice to roll!

### 3. **Check Results**
   - **Win**: Get 6x your bet amount!
   - **Loss**: Lose your bet
   - View stats in the "📊 Stats" tab
   - See all games in "📜 History" tab

## 🔧 Troubleshooting

### Balance shows 0 ETH?
1. Check MetaMask is on "Localhost" network (Chain ID: 31337)
2. Refresh the page
3. Disconnect and reconnect wallet

### Can't see Disconnect button?
- It should now be visible as a red button next to your address
- If still not visible, hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Transaction fails?
1. Check Hardhat node is still running: `lsof -i:8545`
2. If not running: `./start-blockchain.sh`
3. Make sure you're on the correct network in MetaMask

### Wrong network error?
- MetaMask must be on "Localhost 8545" with Chain ID 31337
- If network doesn't exist, add it manually:
  - Network Name: Localhost
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

## 📋 Management Commands

### Stop Everything
```bash
# Kill Hardhat node
kill 61563

# Stop frontend (in terminal, press Ctrl+C)
```

### Restart Blockchain
```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2
./start-blockchain.sh
```

### Restart Frontend
```bash
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2
npm run dev
```

## 🎲 Game Rules

- **Minimum Bet**: 0.001 ETH
- **Maximum Bet**: 1 ETH  
- **Payout**: 6x on win (guess correct number)
- **House Edge**: 5%
- **Numbers**: 1-6 (dice roll)

## 💡 Tips

1. Start with small bets to test (0.01 ETH)
2. Each game is instant on localhost (no waiting)
3. Check Stats tab to see your win rate
4. History tab shows all your past games with filters
5. Disconnect button is the red button on the right

## 📝 Test Account Details

**Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
**Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
**Balance**: ~9,990 ETH

---

**Everything is now fixed and ready to play!** 🎉
Open http://localhost:3001 and start gaming!
