# Complete Technical Concepts Guide

This document explains all the main technical concepts and how the different components work together in this blockchain dice game project.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Web3 Technology Stack](#web3-technology-stack)
3. [3D Dice Component](#3d-dice-component)
4. [Smart Contract Interaction](#smart-contract-interaction)
5. [Wallet Connection Flow](#wallet-connection-flow)
6. [Game State Management](#game-state-management)
7. [Transaction Lifecycle](#transaction-lifecycle)
8. [Event Listening & History](#event-listening--history)
9. [React Hooks Pattern](#react-hooks-pattern)
10. [CSS 3D Transforms](#css-3d-transforms)

---

## 1. Architecture Overview

### Project Structure

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│                                         │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Components│      │   Hooks      │  │
│  │  - Dice    │◄────►│ useGameContract│  │
│  │  - GameBoard│     │ useAccount   │  │
│  │  - Header  │      │ useBalance   │  │
│  └────────────┘      └──────────────┘  │
│         │                    │          │
│         ▼                    ▼          │
│  ┌─────────────────────────────────┐   │
│  │       Wagmi + Ethers.js        │   │
│  │   (Blockchain Abstraction)     │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
               │ JSON-RPC
               │
               ▼
┌──────────────────────────────────────┐
│    Ethereum Blockchain (Local)       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Smart Contract                │ │
│  │  NumberPredictionGame.sol      │ │
│  │                                │ │
│  │  - play()                      │ │
│  │  - getGame()                   │ │
│  │  - getPlayerGames()            │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Data Flow

```
User Action → React Component → Wagmi Hook → Ethers.js → Smart Contract
                                                              ↓
User Interface ← React State ← Event Listener ← Blockchain Event
```

---

## 2. Web3 Technology Stack

### Understanding the Layers

#### Layer 1: **Wagmi** - React Hooks for Ethereum
```javascript
// Located: config/wagmi.js
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "Play-to-Earn Blockchain Game",
  projectId: "YOUR_PROJECT_ID",
  chains: [localhost],
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),
  },
});
```

**What is Wagmi?**
- React hooks library for Ethereum
- Abstracts complex blockchain operations into simple hooks
- Provides automatic state management
- Handles connection lifecycle

**Key Hooks Used:**
- `useAccount()` - Gets connected wallet address and connection status
- `useBalance()` - Fetches wallet ETH balance
- `useWalletClient()` - Provides wallet client for signing transactions

#### Layer 2: **Ethers.js** - Blockchain Interface
```javascript
// Located: hooks/useGameContract.js
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
```

**What is Ethers.js?**
- JavaScript library for interacting with Ethereum
- Converts JavaScript calls into blockchain transactions
- Handles encoding/decoding of data
- Manages transaction signing

**Key Concepts:**
1. **Provider** - Read-only connection to blockchain
2. **Signer** - Can sign transactions (requires wallet)
3. **Contract** - Interface to smart contract functions

#### Layer 3: **RainbowKit** - Wallet UI
```javascript
// Located: pages/_app.js
<RainbowKitProvider modalSize="compact" theme={...}>
  <Component {...pageProps} />
</RainbowKitProvider>
```

**What is RainbowKit?**
- Pre-built wallet connection UI
- Supports MetaMask, WalletConnect, Coinbase, etc.
- Handles wallet switching and network changes
- Beautiful, customizable design

---

## 3. 3D Dice Component

### How the 3D Dice Works

#### Core Concept: CSS 3D Transform

The dice is a **cube** made of 6 faces in 3D space:

```
File: components/Dice.jsx

        Face 5 (Top)
            ▲
            │
    ┌───────┼───────┐
    │   Face 4      │ Face 3
    │   (Left)      │ (Right)
Face 1 ───────────── Face 2
(Front)             (Back)
    │               │
    └───────────────┘
            │
            ▼
        Face 6 (Bottom)
```

#### Step 1: Creating the Cube Structure

```jsx
<div className="dice-cube">
  {/* Each face is positioned in 3D space */}
  <div className="dice-face dice-face-1">Face 1</div>
  <div className="dice-face dice-face-2">Face 2</div>
  <div className="dice-face dice-face-3">Face 3</div>
  <div className="dice-face dice-face-4">Face 4</div>
  <div className="dice-face dice-face-5">Face 5</div>
  <div className="dice-face dice-face-6">Face 6</div>
</div>
```

#### Step 2: Positioning Faces in 3D Space

```css
.dice-face {
  position: absolute;
  width: 150px;
  height: 150px;
  /* Enable 3D positioning */
  transform-style: preserve-3d;
}

/* Position each face */
.dice-face-1 { transform: translateZ(75px); }        /* Front */
.dice-face-2 { transform: rotateY(180deg) translateZ(75px); }  /* Back */
.dice-face-3 { transform: rotateY(90deg) translateZ(75px); }   /* Right */
.dice-face-4 { transform: rotateY(-90deg) translateZ(75px); }  /* Left */
.dice-face-5 { transform: rotateX(90deg) translateZ(75px); }   /* Top */
.dice-face-6 { transform: rotateX(-90deg) translateZ(75px); }  /* Bottom */
```

**Understanding TranslateZ:**
- `translateZ(75px)` moves face 75px forward (half of 150px cube size)
- This creates the 3D depth
- Rotation + translation positions each face correctly

#### Step 3: Rendering Dice Dots

```jsx
const renderDots = (faceValue) => {
  const dotPatterns = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['left-top', 'left-middle', 'left-bottom', 'right-top', 'right-middle', 'right-bottom'],
  };

  // Grid-based positioning
  const positions = {
    'top-left': 'col-start-1 row-start-1',
    'center': 'col-start-2 row-start-2',
    'bottom-right': 'col-start-3 row-start-3',
    // ... more positions
  };

  return dotPatterns[faceValue].map((position, index) => (
    <div className={`w-4 h-4 bg-gray-900 rounded-full ${positions[position]}`} />
  ));
};
```

**How Dots Work:**
- Uses CSS Grid (3×3 layout)
- Each dot positioned at specific grid coordinates
- Different patterns for each number (1-6)

#### Step 4: Animation States

```jsx
const [animationState, setAnimationState] = useState('idle');
// States: 'idle', 'rolling', 'result'

useEffect(() => {
  if (isRolling) {
    setAnimationState('rolling');
  } else if (value) {
    setAnimationState('result');
  }
}, [isRolling, value]);
```

**Three States:**

1. **Idle** - Floating animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotateX(-20deg) rotateY(-20deg); }
  50% { transform: translateY(-10px) rotateX(-25deg) rotateY(-25deg); }
}
```

2. **Rolling** - Spinning animation
```css
@keyframes roll {
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  25% { transform: rotateX(270deg) rotateY(190deg) rotateZ(120deg); }
  50% { transform: rotateX(540deg) rotateY(370deg) rotateZ(240deg); }
  75% { transform: rotateX(810deg) rotateY(550deg) rotateZ(360deg); }
  100% { transform: rotateX(1080deg) rotateY(720deg) rotateZ(480deg); }
}
```
- Multiple full rotations on all axes (X, Y, Z)
- Creates realistic tumbling effect

3. **Result** - Show winning face
```javascript
const getRotation = () => {
  const rotations = {
    1: 'rotateX(0deg) rotateY(0deg)',        // Front face
    2: 'rotateX(0deg) rotateY(180deg)',      // Back face
    3: 'rotateX(0deg) rotateY(-90deg)',      // Right face
    4: 'rotateX(0deg) rotateY(90deg)',       // Left face
    5: 'rotateX(-90deg) rotateY(0deg)',      // Top face
    6: 'rotateX(90deg) rotateY(0deg)',       // Bottom face
  };
  return rotations[displayValue];
};
```

#### Step 5: Perspective & 3D Space

```css
.dice-container {
  perspective: 1000px;  /* Creates 3D depth perception */
}

.dice-cube {
  transform-style: preserve-3d;  /* Maintains 3D positioning of children */
  backface-visibility: hidden;   /* Hides back of faces */
}
```

**Understanding Perspective:**
- `perspective: 1000px` creates vanishing point
- Lower values = more dramatic 3D effect
- Higher values = more subtle effect
- Essential for realistic 3D appearance

---

## 4. Smart Contract Interaction

### The Bridge: useGameContract Hook

```javascript
// File: hooks/useGameContract.js

export const useGameContract = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Create contract instance
  const contract = useMemo(() => {
    if (!isConnected || !walletClient) {
      // Read-only mode
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    }

    // Write mode (can send transactions)
    const provider = new ethers.providers.Web3Provider(walletClient.transport);
    const signer = provider.getSigner(address);
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }, [isConnected, walletClient, address]);

  return { contract, placeBet, getPlayerStats, getGameHistory };
};
```

### Key Concepts Explained

#### 1. **Provider vs Signer**

```javascript
// PROVIDER - Read-only access (no wallet needed)
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const contract = new ethers.Contract(address, abi, provider);
await contract.getBalance();  // ✅ Can read
await contract.play(3);       // ❌ Cannot write

// SIGNER - Can write (wallet required)
const signer = provider.getSigner(walletAddress);
const contract = new ethers.Contract(address, abi, signer);
await contract.getBalance();  // ✅ Can read
await contract.play(3, { value: ethers.utils.parseEther('0.1') });  // ✅ Can write
```

**Why the Difference?**
- Reading is free (no gas)
- Writing costs gas (requires wallet signature)
- Security: Can't send transactions without user approval

#### 2. **useMemo for Performance**

```javascript
const contract = useMemo(() => {
  // Heavy operation: create contract instance
  return new ethers.Contract(address, abi, signer);
}, [isConnected, walletClient, address]);  // Only recreate when these change
```

**Why useMemo?**
- Creating contract instances is expensive
- Without it: New instance on every render
- With it: Reuses instance until dependencies change
- Result: Better performance, fewer bugs

#### 3. **ABI (Application Binary Interface)**

```json
// File: utils/NumberPredictionGameABI.json
[
  {
    "inputs": [{ "name": "_predictedNumber", "type": "uint8" }],
    "name": "play",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "gameId", "type": "uint256" },
      { "indexed": true, "name": "player", "type": "address" },
      { "indexed": false, "name": "betAmount", "type": "uint256" },
      { "indexed": false, "name": "predictedNumber", "type": "uint8" },
      { "indexed": false, "name": "resultNumber", "type": "uint8" },
      { "indexed": false, "name": "won", "type": "bool" },
      { "indexed": false, "name": "payout", "type": "uint256" }
    ],
    "name": "GamePlayed",
    "type": "event"
  }
]
```

**What is ABI?**
- Contract's "instruction manual"
- Tells JavaScript how to call contract functions
- Defines input/output types
- Essential for encoding/decoding data

**How It Works:**
```javascript
// JavaScript
await contract.play(3, { value: ethers.utils.parseEther('0.1') });

// Ethers.js uses ABI to convert to:
// Solidity function call
play(uint8(3)) payable { value: 100000000000000000 wei }
```

---

## 5. Wallet Connection Flow

### Complete Connection Lifecycle

```
User Clicks Connect
       ↓
┌─────────────────────────────────┐
│  RainbowKit Modal Opens         │
│  - Shows available wallets      │
│  - MetaMask, WalletConnect, etc │
└─────────┬───────────────────────┘
          ↓
User Selects Wallet (e.g., MetaMask)
          ↓
┌─────────────────────────────────┐
│  MetaMask Popup Opens           │
│  "Connect to this site?"        │
└─────────┬───────────────────────┘
          ↓
User Approves
          ↓
┌─────────────────────────────────┐
│  Wagmi Hooks Update             │
│  - useAccount() → connected     │
│  - address = "0xabc..."         │
│  - isConnected = true           │
└─────────┬───────────────────────┘
          ↓
┌─────────────────────────────────┐
│  useGameContract Updates        │
│  - Creates signer               │
│  - Contract ready for writing   │
└─────────┬───────────────────────┘
          ↓
┌─────────────────────────────────┐
│  UI Updates                     │
│  - Shows wallet address         │
│  - Shows balance                │
│  - Enables game buttons         │
└─────────────────────────────────┘
```

### Code Breakdown

#### Step 1: Configure Wallet Connection

```javascript
// File: config/wagmi.js
export const config = getDefaultConfig({
  appName: "Play-to-Earn Blockchain Game",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [localhost],  // Which networks to support
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),  // RPC endpoint
  },
});
```

#### Step 2: Wrap App with Providers

```javascript
// File: pages/_app.js
<WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    <RainbowKitProvider>
      <Component {...pageProps} />
    </RainbowKitProvider>
  </QueryClientProvider>
</WagmiProvider>
```

**Provider Hierarchy:**
- **WagmiProvider** - Core Web3 functionality
- **QueryClientProvider** - Caching & data fetching
- **RainbowKitProvider** - Wallet UI

#### Step 3: Access Connection State

```javascript
// File: components/GameBoard.js
const { isConnected, address } = useAccount();
const { data: balance } = useBalance({ address });

// Reactive updates
useEffect(() => {
  if (isConnected) {
    console.log('Wallet connected:', address);
    console.log('Balance:', balance.formatted, 'ETH');
  }
}, [isConnected, address, balance]);
```

**Automatic Features:**
- Auto-reconnects on page reload
- Detects account changes
- Detects network changes
- Updates balance automatically

---

## 6. Game State Management

### State Architecture

```javascript
// File: components/GameBoard.js

// User Input States
const [selectedNumber, setSelectedNumber] = useState(null);  // 1-6 or null
const [betAmount, setBetAmount] = useState('0.01');          // string

// Game Process States
const [isRolling, setIsRolling] = useState(false);           // boolean
const [diceResult, setDiceResult] = useState(null);          // 1-6 or null

// Result States
const [gameResult, setGameResult] = useState(null);          // object or null
const [lastResults, setLastResults] = useState([]);          // array

// Validation States
const [betError, setBetError] = useState('');                // string

// UI States
const [showResultModal, setShowResultModal] = useState(false); // boolean
```

### State Flow Diagram

```
IDLE STATE
├─ selectedNumber: null
├─ betAmount: '0.01'
├─ isRolling: false
├─ diceResult: null
└─ gameResult: null

User Selects Number (3) → selectedNumber: 3

User Sets Bet (0.05) → betAmount: '0.05'

User Clicks "Place Bet"
    ↓
LOADING STATE
├─ isRolling: true
├─ diceResult: '?'
├─ Call blockchain...
└─ Show loading toast

Wait for Transaction... (2-10 seconds)
    ↓
RESULT STATE
├─ isRolling: false
├─ diceResult: 4
├─ gameResult: {
│    rolled: 4,
│    won: false,
│    payout: '0',
│    betAmount: '0.05'
│  }
└─ showResultModal: true

After 5 seconds → Reset to IDLE STATE
```

### Critical State Management Patterns

#### Pattern 1: Derived State with useMemo

```javascript
// Don't create unnecessary states
// ❌ Bad
const [potentialPayout, setPotentialPayout] = useState(0);
useEffect(() => {
  setPotentialPayout(betAmount * 6);
}, [betAmount]);

// ✅ Good - Compute on the fly
const potentialPayout = useMemo(() => {
  const amount = parseFloat(betAmount);
  return isNaN(amount) ? '0.000' : (amount * 6).toFixed(3);
}, [betAmount]);
```

**Why?**
- Fewer states = fewer bugs
- Always in sync
- Better performance

#### Pattern 2: Validation on Change

```javascript
const handleBetAmountChange = (value) => {
  setBetAmount(value);
  
  // Validate immediately
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    setBetError('Invalid amount');
  } else if (amount < 0.001) {
    setBetError('Minimum bet is 0.001 ETH');
  } else if (amount > balance) {
    setBetError('Insufficient balance');
  } else {
    setBetError('');  // Clear error
  }
};
```

**Benefits:**
- Instant feedback
- Prevents invalid submissions
- Better UX

#### Pattern 3: Loading States

```javascript
const [isPlacingBet, setIsPlacingBet] = useState(false);

const handlePlaceBet = async () => {
  setIsPlacingBet(true);  // Start loading
  try {
    const result = await placeBet(selectedNumber, betAmount);
    // Handle success...
  } catch (error) {
    // Handle error...
  } finally {
    setIsPlacingBet(false);  // Stop loading (always runs)
  }
};
```

**Why finally?**
- Runs even if error occurs
- Prevents stuck loading states
- Clean code pattern

---

## 7. Transaction Lifecycle

### Complete Transaction Flow

```
┌──────────────────────────────────────────────────────────┐
│  STEP 1: User Initiates Transaction                      │
│  - Clicks "Place Bet"                                    │
│  - JavaScript calls: placeBet(3, '0.1')                  │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 2: Prepare Transaction Data                        │
│  - Convert 0.1 ETH to Wei: 100000000000000000           │
│  - Encode function call with ABI                         │
│  - Estimate gas required                                 │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 3: MetaMask Popup                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Confirm Transaction                                │ │
│  │                                                    │ │
│  │ Contract: 0x5FbDB2...                             │ │
│  │ Function: play(3)                                 │ │
│  │ Value: 0.1 ETH                                    │ │
│  │ Gas: ~50,000 units (~0.002 ETH)                   │ │
│  │                                                    │ │
│  │ [Reject]  [Confirm]                               │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────┬──────────────────────────────────────┘
                    ↓
    User Clicks "Confirm"
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 4: Transaction Broadcast                           │
│  - Wallet signs transaction with private key             │
│  - Sends signed transaction to blockchain                │
│  - Returns transaction hash: 0xabc123...                 │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 5: Pending in Mempool                              │
│  - Transaction waits to be mined                         │
│  - Miners pick it up (based on gas price)                │
│  - Status: "Pending"                                     │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 6: Mined in Block                                  │
│  - Miner includes transaction in new block               │
│  - Smart contract executes:                              │
│    1. Receives 0.1 ETH                                   │
│    2. Generates random number: 4                         │
│    3. Compares: 3 ≠ 4 (Loss)                            │
│    4. Emits GamePlayed event                             │
│  - Status: "Confirmed"                                   │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 7: Frontend Receives Receipt                       │
│  - tx.wait() resolves                                    │
│  - Parse GamePlayed event from receipt                   │
│  - Extract result data                                   │
└───────────────────┬──────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 8: Update UI                                       │
│  - Show dice result: 4                                   │
│  - Display "You Lost" message                            │
│  - Update balance                                        │
│  - Add to game history                                   │
└──────────────────────────────────────────────────────────┘
```

### Code Implementation

```javascript
// File: hooks/useGameContract.js

const placeBet = useCallback(async (betNumber, betAmount) => {
  try {
    // STEP 1: Validate
    if (!isConnected || !contract.signer) {
      throw new Error('Wallet not connected');
    }

    // STEP 2: Convert ETH to Wei
    const betAmountInWei = ethers.utils.parseEther(betAmount.toString());
    // '0.1' → BigNumber(100000000000000000)

    // STEP 3 & 4: Send transaction (triggers MetaMask)
    const tx = await contract.play(betNumber, { value: betAmountInWei });
    // Returns: { hash: '0xabc123...', wait: function() }

    // STEP 5 & 6: Wait for mining (blocks until confirmed)
    const receipt = await tx.wait();
    // Returns: { events: [...], transactionHash: '0x...', ... }

    // STEP 7: Parse event from receipt
    const gamePlayedEvent = receipt.events?.find(
      (event) => event.event === 'GamePlayed'
    );

    if (gamePlayedEvent) {
      const {
        gameId,
        betAmount: eventBetAmount,
        predictedNumber,
        resultNumber,
        won,
        payout,
      } = gamePlayedEvent.args;

      // STEP 8: Return formatted result
      return {
        success: true,
        txHash: receipt.transactionHash,
        gameId: gameId.toString(),
        betNumber: predictedNumber,
        result: resultNumber,
        didWin: won,
        payout: ethers.utils.formatEther(payout),  // Wei → ETH
        betAmount: ethers.utils.formatEther(eventBetAmount),
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}, [contract, isConnected]);
```

### Error Handling

```javascript
// Common errors and how they're handled

try {
  await placeBet(3, '0.1');
} catch (error) {
  if (error.code === 4001) {
    // User rejected transaction in MetaMask
    toast.error('Transaction rejected');
  } else if (error.message.includes('insufficient funds')) {
    // Not enough ETH for gas + bet
    toast.error('Insufficient funds for gas + bet');
  } else if (error.message.includes('Insufficient contract balance')) {
    // Contract can't pay winnings
    toast.error('Contract has insufficient balance');
  } else {
    // Generic error
    toast.error('Transaction failed: ' + error.message);
  }
}
```

---

## 8. Event Listening & History

### Understanding Blockchain Events

**What are Events?**
- Smart contracts emit events when important actions occur
- Events are stored permanently on blockchain
- Can be queried later for history
- Cost much less gas than storing data directly

### Event Structure

```solidity
// File: web3/contracts/PlayToEarn.sol

event GamePlayed(
    uint256 indexed gameId,      // indexed = searchable
    address indexed player,      // indexed = searchable
    uint256 betAmount,           // not indexed
    uint8 predictedNumber,
    uint8 resultNumber,
    bool won,
    uint256 payout
);

// Emitted when game completes
emit GamePlayed(gameCounter, msg.sender, msg.value, _predictedNumber, resultNumber, won, payout);
```

**Indexed vs Non-Indexed:**
- **Indexed** (max 3): Can filter/search by this field
- **Non-Indexed**: Cheaper, but can't search efficiently

### Querying Game History

```javascript
// File: hooks/useGameContract.js

const getGameHistory = useCallback(async (playerAddress) => {
  try {
    // Create event filter for specific player
    const filter = contract.filters.GamePlayed(null, playerAddress);
    //                                         ↑gameId  ↑player
    //                                         (null = all games)

    // Query all past events matching filter
    const events = await contract.queryFilter(filter);
    // Returns array of Event objects

    // Parse each event
    const gameHistory = events.map((event) => {
      const {
        gameId,
        player,
        betAmount,
        predictedNumber,
        resultNumber,
        won,
        payout,
      } = event.args;  // Event data

      return {
        gameId: gameId.toString(),
        player,
        betNumber: predictedNumber,
        result: resultNumber,
        betAmount: ethers.utils.formatEther(betAmount),
        won,
        payout: ethers.utils.formatEther(payout),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      };
    });

    // Fetch timestamps from blocks
    const historyWithTimestamps = await Promise.all(
      gameHistory.map(async (game) => {
        const block = await contract.provider.getBlock(game.blockNumber);
        return {
          ...game,
          timestamp: block.timestamp,  // Unix timestamp
        };
      })
    );

    // Sort by most recent first
    return historyWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting game history:', error);
    return [];
  }
}, [contract]);
```

### How Events Work Under the Hood

```
┌─────────────────────────────────────────────────────────┐
│  Smart Contract Execution                               │
│                                                         │
│  function play(uint8 _predictedNumber) {                │
│    // ... game logic ...                                │
│                                                         │
│    emit GamePlayed(                                     │
│      gameCounter,      // gameId                        │
│      msg.sender,       // player                        │
│      msg.value,        // betAmount                     │
│      _predictedNumber, // predicted                     │
│      resultNumber,     // result                        │
│      won,              // won                           │
│      payout            // payout                        │
│    );                                                   │
│  }                                                      │
└───────────┬─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────┐
│  Event Log Entry Created in Blockchain                  │
│                                                         │
│  Block #12345                                           │
│  Transaction: 0xabc123...                               │
│  Event: GamePlayed                                      │
│  Data:                                                  │
│    - gameId: 42                                         │
│    - player: 0x7890...                                  │
│    - betAmount: 100000000000000000 (0.1 ETH)            │
│    - predictedNumber: 3                                 │
│    - resultNumber: 5                                    │
│    - won: false                                         │
│    - payout: 0                                          │
└───────────┬─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────┐
│  Frontend Queries Events                                │
│                                                         │
│  const filter = contract.filters.GamePlayed(            │
│    null,           // any gameId                        │
│    '0x7890...'     // specific player                   │
│  );                                                     │
│                                                         │
│  const events = await contract.queryFilter(filter);     │
│  // Returns all GamePlayed events for player 0x7890...  │
└─────────────────────────────────────────────────────────┘
```

### Real-Time Event Listening

```javascript
// Listen for new events in real-time
useEffect(() => {
  if (!contract || !address) return;

  // Event listener callback
  const handleGamePlayed = (gameId, player, betAmount, predicted, result, won, payout) => {
    console.log('New game played!', {
      gameId: gameId.toString(),
      player,
      betAmount: ethers.utils.formatEther(betAmount),
      won,
    });
    
    // Update UI with new game
    setLastResults(prev => [/* new game */, ...prev]);
  };

  // Subscribe to event
  contract.on('GamePlayed', handleGamePlayed);

  // Cleanup: Unsubscribe when component unmounts
  return () => {
    contract.off('GamePlayed', handleGamePlayed);
  };
}, [contract, address]);
```

---

## 9. React Hooks Pattern

### Custom Hook Architecture

#### Why Custom Hooks?

```javascript
// ❌ Without custom hook - Messy component
const GameBoard = () => {
  const [contract, setContract] = useState(null);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  useEffect(() => {
    if (walletClient) {
      const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(ADDRESS, ABI, signer);
      setContract(contractInstance);
    }
  }, [walletClient]);
  
  const placeBet = async () => {
    if (!contract) return;
    // ... 50 lines of code ...
  };
  
  return (/* UI */);
};

// ✅ With custom hook - Clean component
const GameBoard = () => {
  const { placeBet, isPlacingBet } = useGameContract();
  
  const handleBet = async () => {
    await placeBet(selectedNumber, betAmount);
  };
  
  return (/* UI */);
};
```

### Hook Composition Pattern

```javascript
// File: hooks/useGameContract.js

export const useGameContract = () => {
  // Compose multiple wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // Internal state
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  
  // Memoized contract instance
  const contract = useMemo(() => {
    // ... create contract ...
  }, [isConnected, walletClient, address]);
  
  // Wrapped functions
  const placeBet = useCallback(async (betNumber, betAmount) => {
    // ... implementation ...
  }, [contract, isConnected]);
  
  // Return public API
  return {
    contract,
    contractAddress: CONTRACT_ADDRESS,
    isConnected,
    userAddress: address,
    placeBet,
    getPlayerStats,
    getGameHistory,
    isPlacingBet,
  };
};
```

**Benefits:**
1. **Separation of Concerns** - Business logic separate from UI
2. **Reusability** - Use in any component
3. **Testability** - Easy to unit test
4. **Type Safety** - Clear interface
5. **Performance** - Proper memoization

### useCallback Explained

```javascript
// Without useCallback - New function every render
const placeBet = async (num, amount) => {
  await contract.play(num, { value: amount });
};
// Problem: Child components re-render unnecessarily

// With useCallback - Stable function reference
const placeBet = useCallback(
  async (num, amount) => {
    await contract.play(num, { value: amount });
  },
  [contract]  // Only recreate if contract changes
);
// Solution: Child components only re-render when needed
```

---

## 10. CSS 3D Transforms

### Transform Matrix Explained

#### Basic Transforms

```css
/* Translate - Move in space */
transform: translateX(100px);     /* Move right */
transform: translateY(50px);      /* Move down */
transform: translateZ(75px);      /* Move forward (3D) */

/* Rotate - Turn around axis */
transform: rotateX(45deg);        /* Tilt forward/back */
transform: rotateY(90deg);        /* Spin left/right */
transform: rotateZ(180deg);       /* Rotate clockwise */

/* Combine multiple transforms */
transform: rotateX(45deg) translateZ(100px) rotateY(30deg);
```

#### Transform Order Matters!

```css
/* Different orders = different results */

/* Order 1: Rotate then translate */
transform: rotateY(90deg) translateX(100px);
/* Result: Moves 100px in the rotated direction (to the side) */

/* Order 2: Translate then rotate */
transform: translateX(100px) rotateY(90deg);
/* Result: Moves 100px right, THEN rotates */
```

### Perspective Deep Dive

```css
/* Parent container */
.dice-container {
  perspective: 1000px;
  /* Creates 3D space with vanishing point 1000px away */
}

.dice-cube {
  transform-style: preserve-3d;
  /* Makes children exist in 3D space */
}
```

**How Perspective Works:**

```
Lower perspective (400px):        Higher perspective (2000px):
More dramatic 3D effect          Subtle 3D effect

     Viewer                           Viewer
       │                                │
   400px away                       2000px away
       │                                │
       ▼                                ▼
    [Cube]                            [Cube]
   Appears                           Appears
   distorted                         flatter
```

### 3D Cube Construction Step-by-Step

```html
<div class="scene">              <!-- Perspective container -->
  <div class="cube">              <!-- 3D object -->
    <div class="face front"></div>
    <div class="face back"></div>
    <div class="face right"></div>
    <div class="face left"></div>
    <div class="face top"></div>
    <div class="face bottom"></div>
  </div>
</div>
```

```css
.scene {
  width: 200px;
  height: 200px;
  perspective: 600px;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: translateZ(-50px);  /* Center the cube */
}

.face {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid black;
  opacity: 0.9;
}

/* Position each face in 3D space */

.front  { transform: rotateY(0deg)   translateZ(50px); }
/*       Face forward, push out 50px (half of 100px cube) */

.back   { transform: rotateY(180deg) translateZ(50px); }
/*       Face backward (180°), push out 50px */

.right  { transform: rotateY(90deg)  translateZ(50px); }
/*       Face right (90°), push out 50px */

.left   { transform: rotateY(-90deg) translateZ(50px); }
/*       Face left (-90°), push out 50px */

.top    { transform: rotateX(90deg)  translateZ(50px); }
/*       Face up (90° on X), push out 50px */

.bottom { transform: rotateX(-90deg) translateZ(50px); }
/*       Face down (-90° on X), push out 50px */
```

### Why TranslateZ After Rotation?

```
Without rotation + translateZ:
┌─────┐
│     │  ← Face is at origin
│  1  │
│     │
└─────┘

rotateY(90deg):
│     
│  1  ← Face turned 90°, still at origin (would be invisible)
│     

rotateY(90deg) translateZ(50px):
│     
│  1  ← Face turned 90°, then moved forward
│     → Now visible from the side
```

### Animation Performance

```css
/* ✅ Good - GPU accelerated */
@keyframes roll {
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(360deg); }
}

/* ❌ Bad - CPU intensive */
@keyframes roll-bad {
  0% { margin-top: 0px; }
  100% { margin-top: 100px; }
}
```

**Why transform is faster:**
- GPU handles transform calculations
- No layout recalculation
- Smoother 60fps animations
- Less battery consumption

---

## Summary: How Everything Works Together

### Request Flow Example: "User places a bet"

```
1. User clicks "Place Bet" button
   └─> components/GameBoard.js: handlePlaceBet()

2. Validate inputs
   └─> Check: isConnected, selectedNumber, betAmount
   └─> If invalid: Show error, stop

3. Call hook function
   └─> hooks/useGameContract.js: placeBet(3, '0.1')

4. Hook prepares transaction
   └─> ethers.utils.parseEther('0.1') → Wei
   └─> contract.play(3, { value: Wei })

5. Wagmi/Ethers triggers MetaMask
   └─> User sees popup: "Confirm Transaction"
   └─> User clicks "Confirm"

6. Transaction sent to blockchain
   └─> Signed with user's private key
   └─> Broadcast to network
   └─> Returns transaction hash

7. Wait for mining
   └─> tx.wait() blocks execution
   └─> Miners include transaction in block
   └─> Smart contract executes

8. Smart contract logic
   └─> Receives 0.1 ETH
   └─> Generates random number: 5
   └─> Compares: 3 !== 5 (Loss)
   └─> Emits GamePlayed event
   └─> Returns transaction receipt

9. Frontend receives receipt
   └─> Parse GamePlayed event
   └─> Extract: result=5, won=false, payout=0

10. Update dice animation
    └─> components/Dice.jsx
    └─> Change state: idle → rolling → result
    └─> CSS animations run
    └─> Dice shows face 5

11. Update game state
    └─> setGameResult({ rolled: 5, won: false })
    └─> setLastResults([new game, ...old games])
    └─> Show result modal

12. Update balance
    └─> Wagmi automatically refetches balance
    └─> UI shows new balance (0.1 ETH less)

13. Refresh stats and history
    └─> onGameComplete() callback
    └─> StatsPanel and GameHistory refetch data
    └─> Display updated totals
```

### Key Takeaways

1. **Web3 Stack** - Wagmi → Ethers.js → Smart Contract
2. **3D Dice** - CSS transforms + perspective + animation states
3. **State Management** - React hooks + derived state + validation
4. **Smart Contracts** - ABI + Provider/Signer + Events
5. **Transactions** - User action → MetaMask → Blockchain → UI update
6. **Events** - Permanent logs → Query history → Real-time updates
7. **Custom Hooks** - Encapsulate logic → Reusability → Clean code
8. **Performance** - useMemo, useCallback, GPU transforms

Each piece works together to create a seamless blockchain gaming experience!
