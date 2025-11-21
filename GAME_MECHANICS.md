# Game Mechanics & Technical Details

## Random Number Generation Algorithm

The dice rolling system uses a **Pseudo-Random Number Generation (PRNG)** algorithm based on **Keccak256 hashing** to determine the winning number.

### Algorithm Implementation

```solidity
function _generateRandomNumber() private view returns (uint8) {
    uint256 random = uint256(
        keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                gameCounter
            )
        )
    );
    return uint8((random % 6) + 1); // Returns 1-6
}
```

### How It Works - Step by Step:

#### 1. **Input Sources (Seeds)**
The algorithm combines multiple blockchain data points to create randomness:

- **`block.timestamp`** - The exact time when the transaction is mined
  - Changes every block (~12 seconds on Ethereum)
  - Provides temporal uniqueness

- **`block.prevrandao`** - Random value from Ethereum's beacon chain
  - Replaces the old `block.difficulty` (post-merge Ethereum)
  - Provided by Ethereum's consensus layer
  - More secure than previous methods

- **`msg.sender`** - The player's wallet address
  - Ensures different players get different random seeds
  - Makes each player's outcome unique

- **`gameCounter`** - Total number of games played
  - Increments with each game
  - Ensures each game has a unique seed even for the same player

#### 2. **Data Packing**
```solidity
abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, gameCounter)
```
- All four inputs are packed together into a single bytes array
- Creates a unique combination for each game

#### 3. **Cryptographic Hashing**
```solidity
keccak256(...)
```
- The packed data is processed through the Keccak256 hash function
- Produces a 256-bit (32-byte) deterministic hash
- Any tiny change in input creates a completely different output
- Same input always produces the same output (deterministic)

#### 4. **Number Conversion & Range Mapping**
```solidity
uint256 random = uint256(keccak256(...))
return uint8((random % 6) + 1);
```
- Hash is converted to a `uint256` integer
- Modulo 6 operation (`% 6`) gives remainder: 0, 1, 2, 3, 4, or 5
- Add 1 to shift range to: **1, 2, 3, 4, 5, or 6** (dice numbers)

### Visual Example:

```
Input Seeds:
├── block.timestamp:  1700000000
├── block.prevrandao: 0x1234...abcd
├── msg.sender:       0xabc123...
└── gameCounter:      42

↓ abi.encodePacked()
Combined Data: 0x000000000065586f40...

↓ keccak256()
Hash: 0x7c5ea36f6c6b4f9a8d2e1c3b5a7f9e8d6c4b2a1f8e7d6c5b4a3f2e1d0c9b8a7...

↓ uint256() & modulo 6 + 1
Random Number: 4
```

### Security Considerations

#### ⚠️ **Current Implementation (Development Only)**

**Vulnerabilities:**
1. **Miner Manipulation**
   - Miners can slightly manipulate `block.timestamp` (±15 seconds)
   - Miners see `block.prevrandao` before finalizing the block
   - They could potentially skip blocks where they would lose large bets

2. **Predictability**
   - All inputs are public on the blockchain
   - Sophisticated attackers can predict outcomes before betting
   - Front-running attacks are possible

3. **Not Cryptographically Secure**
   - This is pseudo-random, not truly random
   - Suitable for learning/development only
   - **NOT SAFE for real money gambling**

#### ✅ **Production-Ready Alternatives**

For a secure, real-money gambling application, use:

1. **Chainlink VRF (Verifiable Random Function)**
   - Provably fair and verifiable randomness
   - Cannot be manipulated by miners or players
   - Industry standard for blockchain gaming
   - [Learn More](https://docs.chain.link/vrf/v2/introduction)

2. **Commit-Reveal Scheme**
   - Two-step process: commit hash, then reveal
   - Prevents prediction attacks
   - More complex to implement

3. **Off-Chain Oracles**
   - External random number sources
   - Requires trusted third party
   - Can be combined with on-chain verification

---

## Money Flow & Account Transfers

Understanding how ETH moves between accounts during gameplay.

### Account Roles

1. **Player's Wallet** (`msg.sender`)
   - Your personal Ethereum wallet (e.g., MetaMask)
   - Holds your ETH balance
   - Signs transactions to play the game

2. **Smart Contract** (The House)
   - Contract address on the blockchain
   - Acts as the game's bank/house
   - Holds a pool of ETH (bankroll)
   - Automatically executes payouts

3. **Contract Owner** (House Owner)
   - Wallet that deployed the contract
   - Can deposit funds to the contract
   - Can withdraw profits from the contract
   - Manages house bankroll

---

### Transaction Flow: LOSING Scenario

#### Step-by-Step Process:

```
┌─────────────────┐
│  Player Wallet  │
│   Balance: 1 ETH│
└────────┬────────┘
         │
         │ 1. Player places bet: 0.1 ETH
         │    Predicted number: 3
         │
         ↓
┌─────────────────┐
│ Smart Contract  │
│  Balance: 5 ETH │ ← 2. Contract receives 0.1 ETH
└────────┬────────┘
         │
         │ 3. Generate random number
         │    Result: 5 (not 3)
         │    Player LOST
         │
         ↓
┌─────────────────┐
│ Smart Contract  │
│  Balance: 5.1 ETH│ ← 4. Keeps the bet (0.1 ETH stays)
└─────────────────┘

┌─────────────────┐
│  Player Wallet  │
│  Balance: 0.9 ETH│ ← 5. Player's balance decreased
└─────────────────┘
```

#### What Happens:
1. ✅ **Player → Contract**: 0.1 ETH transferred
2. 🎲 Random number generated (e.g., 5)
3. ❌ Player's prediction (3) doesn't match
4. 💰 **Contract keeps the bet**: Balance increases by 0.1 ETH
5. 📉 **Player loses**: -0.1 ETH

**Code Execution:**
```solidity
// Player's bet goes to contract
function play(uint8 _predictedNumber) external payable {
    // msg.value (0.1 ETH) automatically transferred to contract
    
    bool won = (resultNumber == _predictedNumber); // false
    
    if (won) {
        // This block is NOT executed
    }
    // Bet stays in contract - no refund
}
```

---

### Transaction Flow: WINNING Scenario

#### Step-by-Step Process:

```
┌─────────────────┐
│  Player Wallet  │
│   Balance: 1 ETH│
└────────┬────────┘
         │
         │ 1. Player places bet: 0.1 ETH
         │    Predicted number: 4
         │
         ↓
┌─────────────────┐
│ Smart Contract  │
│  Balance: 5 ETH │ ← 2. Contract receives 0.1 ETH
└────────┬────────┘    Balance now: 5.1 ETH
         │
         │ 3. Generate random number
         │    Result: 4 (matches!)
         │    Player WON
         │
         │ 4. Calculate payout: 0.1 × 6 = 0.6 ETH
         │
         ↓
┌─────────────────┐
│ Smart Contract  │
│ Balance: 4.5 ETH│ ← 5. Pays out 0.6 ETH
└────────┬────────┘
         │
         │ 6. Transfer 0.6 ETH to player
         │
         ↓
┌─────────────────┐
│  Player Wallet  │
│  Balance: 1.5 ETH│ ← 7. Receives 0.6 ETH
└─────────────────┘

Net Result: Player invested 0.1 ETH, received 0.6 ETH
Profit: 0.5 ETH (5x return)
```

#### What Happens:
1. ✅ **Player → Contract**: 0.1 ETH transferred
2. 📈 Contract balance: 5 ETH → 5.1 ETH
3. 🎲 Random number generated (e.g., 4)
4. ✅ Player's prediction (4) matches!
5. 💰 **Payout calculated**: 0.1 ETH × 6 = 0.6 ETH
6. 🏦 **Contract → Player**: 0.6 ETH transferred back
7. 📈 **Player profits**: Net gain of +0.5 ETH

**Code Execution:**
```solidity
function play(uint8 _predictedNumber) external payable {
    // msg.value (0.1 ETH) automatically in contract
    
    uint8 resultNumber = _generateRandomNumber(); // Returns 4
    bool won = (resultNumber == _predictedNumber); // true
    
    uint256 payout = 0;
    if (won) {
        // Calculate 6x payout
        payout = msg.value * 6; // 0.1 × 6 = 0.6 ETH
        
        // Check contract has enough balance
        require(address(this).balance >= payout, "Insufficient balance");
        
        // Transfer payout to player
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Payout transfer failed");
    }
}
```

---

### Detailed Example: Multiple Games

Let's track the balances through 3 games:

#### Initial State:
```
Player Wallet:  1.0 ETH
Contract:       5.0 ETH
Owner Wallet:   10.0 ETH
```

#### Game 1: Player bets 0.1 ETH on number 3, result is 5 (LOSS)
```
Player:   1.0 - 0.1 = 0.9 ETH
Contract: 5.0 + 0.1 = 5.1 ETH
```

#### Game 2: Player bets 0.2 ETH on number 2, result is 2 (WIN)
```
Player:   0.9 - 0.2 + 1.2 = 1.9 ETH  (lost bet, gained 6× payout)
Contract: 5.1 + 0.2 - 1.2 = 4.1 ETH  (received bet, paid payout)
```

#### Game 3: Player bets 0.5 ETH on number 6, result is 1 (LOSS)
```
Player:   1.9 - 0.5 = 1.4 ETH
Contract: 4.1 + 0.5 = 4.6 ETH
```

#### Final State:
```
Player Wallet:  1.4 ETH  (+0.4 ETH profit)
Contract:       4.6 ETH  (-0.4 ETH loss)
Owner Wallet:   10.0 ETH (unchanged, hasn't withdrawn)
```

---

### Payout Multiplier Math

**Formula:** `Payout = Bet Amount × 6`

| Bet Amount | If WIN (6×) | If LOSE | Net Profit/Loss |
|------------|-------------|---------|-----------------|
| 0.01 ETH   | 0.06 ETH    | 0 ETH   | +0.05 / -0.01   |
| 0.05 ETH   | 0.30 ETH    | 0 ETH   | +0.25 / -0.05   |
| 0.1 ETH    | 0.6 ETH     | 0 ETH   | +0.5 / -0.1     |
| 0.5 ETH    | 3.0 ETH     | 0 ETH   | +2.5 / -0.5     |
| 1.0 ETH    | 6.0 ETH     | 0 ETH   | +5.0 / -1.0     |

**Probability:** 
- Win chance: 1/6 (16.67%)
- Lose chance: 5/6 (83.33%)

**Expected Value per Game:**
```
EV = (1/6 × 5× bet) + (5/6 × -1× bet)
   = (5/6 - 5/6) × bet
   = 0 × bet
   = 0 (mathematically fair)
```

---

### Contract Bankroll Management

#### Why Contract Needs Funds:

The contract must maintain sufficient balance to pay winners:

```
Required Balance ≥ Potential Maximum Payout

If max bet = 1 ETH, contract needs ≥ 6 ETH to cover one max bet win
```

#### Initial Contract Funding:

**Option 1: Owner Deposits via `depositFunds()`**
```solidity
// Owner sends 10 ETH to contract
contractInstance.depositFunds({ value: ethers.utils.parseEther("10") });
```

**Option 2: Direct ETH Transfer**
```solidity
// Send ETH directly to contract address
await signer.sendTransaction({
    to: contractAddress,
    value: ethers.utils.parseEther("10")
});
```

#### Owner Withdrawals:

Owner can withdraw profits at any time:

```solidity
// Owner withdraws 5 ETH
contractInstance.withdraw(ethers.utils.parseEther("5"));
```

**Transfer Flow:**
```
Contract (10 ETH) → Owner Wallet (5 ETH withdrawn)
Contract balance after: 5 ETH
```

---

### Important Scenarios

#### ❌ Insufficient Contract Balance

If contract doesn't have enough ETH to pay a winner:

```solidity
// Player bets 1 ETH, wins (needs 6 ETH payout)
// Contract only has 4 ETH

require(address(this).balance >= payout, "Insufficient contract balance");
// ❌ Transaction REVERTS
// Player's 1 ETH bet is REFUNDED (transaction fails)
```

**Result:** Transaction fails, player keeps their ETH, no game is played.

#### ✅ Safety Checks

The contract includes multiple safety mechanisms:

1. **Balance Check Before Payout**
   ```solidity
   require(address(this).balance >= payout, "Insufficient contract balance");
   ```

2. **Bet Limits**
   ```solidity
   uint256 public minBet = 0.001 ether;
   uint256 public maxBet = 1 ether;
   ```

3. **Transfer Success Verification**
   ```solidity
   (bool success, ) = payable(msg.sender).call{value: payout}("");
   require(success, "Payout transfer failed");
   ```

---

### Gas Fees

**Important:** Players also pay gas fees for transactions (separate from bets):

```
Total Cost to Play = Bet Amount + Gas Fee

Example:
- Bet: 0.1 ETH
- Gas: ~0.002 ETH (varies)
- Total Deducted: 0.102 ETH

If Win: Receive 0.6 ETH back
Net: 0.6 - 0.102 = 0.498 ETH profit

If Lose: Receive 0 ETH back
Net: -0.102 ETH loss (bet + gas)
```

---

## Summary

### Key Concepts:

✅ **Random Number Generation**
- Uses Keccak256 hashing of blockchain data
- Combines timestamp, prevrandao, player address, and game counter
- Suitable for development, not production
- Use Chainlink VRF for real money applications

✅ **Money Flow - Losing**
- Player → Contract: Bet amount transferred
- Contract keeps 100% of losing bets
- Builds up house bankroll

✅ **Money Flow - Winning**
- Player → Contract: Bet amount transferred
- Contract → Player: 6× bet amount returned
- Net profit: 5× original bet

✅ **Contract Management**
- Owner must fund contract initially
- Contract holds bankroll to pay winners
- Owner can withdraw profits anytime
- Insufficient balance = transaction fails (player protected)

✅ **Fair Game**
- 6× payout on 1/6 probability = mathematically fair
- Expected value = 0 (before gas fees)
- House edge currently at 0% (configurable in contract)
