#!/bin/bash

echo "🎲 Blockchain Dice Game - Complete Setup Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo "📦 Step 1: Checking dependencies..."
cd /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3

if [ ! -d "node_modules" ]; then
    echo "${YELLOW}Installing Hardhat dependencies...${NC}"
    npm install
    echo "${GREEN}✓ Dependencies installed${NC}"
else
    echo "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""

# Step 2: Compile contract
echo "🔨 Step 2: Compiling smart contract..."
npx hardhat compile

if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Contract compiled successfully${NC}"
else
    echo "${RED}✗ Contract compilation failed${NC}"
    exit 1
fi

echo ""

# Step 3: Start local blockchain (in background)
echo "⛓️  Step 3: Starting local Hardhat blockchain..."
echo "${YELLOW}Note: Blockchain will run in background${NC}"

# Kill any existing hardhat node
pkill -f "hardhat node" 2>/dev/null

# Start hardhat node in background and save output
npx hardhat node > hardhat-node.log 2>&1 &
HARDHAT_PID=$!

echo "Waiting for blockchain to start..."
sleep 5

if ps -p $HARDHAT_PID > /dev/null; then
    echo "${GREEN}✓ Blockchain started (PID: $HARDHAT_PID)${NC}"
    echo "  View logs: tail -f /Users/sakshamvij/Documents/GitHub/BlockChain--repo2/web3/hardhat-node.log"
else
    echo "${RED}✗ Failed to start blockchain${NC}"
    exit 1
fi

echo ""

# Step 4: Deploy contract
echo "🚀 Step 4: Deploying contract to local blockchain..."
sleep 2

npx hardhat run scripts/deploy.js --network localhost > deploy-output.log 2>&1

if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Contract deployed successfully${NC}"
    echo ""
    echo "📋 Deployment Details:"
    cat deploy-output.log
    
    # Extract contract address
    CONTRACT_ADDRESS=$(grep "deployed to:" deploy-output.log | awk '{print $NF}')
    
    echo ""
    echo "================================================"
    echo "${GREEN}✅ SETUP COMPLETE!${NC}"
    echo "================================================"
    echo ""
    echo "📝 Next Steps:"
    echo ""
    echo "1. Copy this contract address: ${GREEN}${CONTRACT_ADDRESS}${NC}"
    echo ""
    echo "2. Update your .env.local file:"
    echo "   ${YELLOW}NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}${NC}"
    echo "   ${YELLOW}NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545${NC}"
    echo ""
    echo "3. Import test account to MetaMask:"
    echo "   - Get private key from: hardhat-node.log"
    echo "   - Account #0 has 10,000 ETH"
    echo ""
    echo "4. Add localhost network to MetaMask:"
    echo "   - Network Name: Localhost"
    echo "   - RPC URL: http://127.0.0.1:8545"
    echo "   - Chain ID: 1337"
    echo "   - Currency Symbol: ETH"
    echo ""
    echo "5. Start your frontend:"
    echo "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "6. Open http://localhost:3001 and start playing! 🎲"
    echo ""
    echo "================================================"
    echo ""
    echo "⚠️  To stop the blockchain:"
    echo "   ${YELLOW}kill $HARDHAT_PID${NC}"
    echo ""
    echo "📊 Monitor blockchain:"
    echo "   ${YELLOW}tail -f hardhat-node.log${NC}"
    echo ""
    
    # Save PID for later
    echo $HARDHAT_PID > hardhat.pid
    
else
    echo "${RED}✗ Contract deployment failed${NC}"
    echo "Check deploy-output.log for details"
    exit 1
fi
