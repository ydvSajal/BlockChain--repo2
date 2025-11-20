#!/bin/bash

echo "🚀 Starting Blockchain Development Environment..."
echo ""

# Kill any existing processes on port 8545
echo "📋 Cleaning up existing processes..."
lsof -ti:8545 | xargs kill -9 2>/dev/null || true
sleep 2

# Start Hardhat node in background
echo "🔗 Starting Hardhat node..."
cd web3
npx hardhat node > /tmp/hardhat-node.log 2>&1 &
HARDHAT_PID=$!
echo "Hardhat node started with PID: $HARDHAT_PID"

# Wait for node to be ready
echo "⏳ Waiting for node to be ready..."
sleep 5

# Check if node is running
if ! lsof -i:8545 > /dev/null; then
    echo "❌ Failed to start Hardhat node"
    cat /tmp/hardhat-node.log
    exit 1
fi

echo "✅ Hardhat node is running on http://127.0.0.1:8545"
echo ""

# Deploy contract
echo "📝 Deploying smart contract..."
npx hardhat run scripts/deploy.js --network localhost

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Contract deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Make sure MetaMask is connected to Localhost network (Chain ID: 31337)"
    echo "2. Start the frontend: npm run dev"
    echo "3. Open http://localhost:3001 in your browser"
    echo ""
    echo "To stop the blockchain: kill $HARDHAT_PID"
else
    echo "❌ Deployment failed"
    kill $HARDHAT_PID
    exit 1
fi
