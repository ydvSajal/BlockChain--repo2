## Project Overview

Build & Deploy a Play-to-Earn Game on Blockchain DApp | Next.js + Solidity - Crypto Game Project

In this video, you’ll learn how to build and deploy your own Play-to-Earn (P2E) blockchain game from scratch using Next.js and Solidity. We’ll cover everything — from writing smart contracts, integrating a Web3 frontend, handling rewards and tokens, to deploying your game on the blockchain. 🚀

Perfect for developers who want to dive into GameFi and Web3 gaming development in 2025!

What You’ll Learn:

- Setting up the project with Next.js
- Writing and deploying the Solidity smart contract
- Integrating Web3 and wallet connection
- Managing player rewards with crypto tokens
- Deploying the full DApp live

#BlockchainGaming #PlayToEarn #Web3 #Solidity #Nextjs #GameFi #DAppDevelopment #CryptoGaming #Web3Development

## Instruction

Kindly follow the following Instructions to run the project in your system and install the necessary requirements

#### Deploying Dapp

```
  WATCH: Hostinger
  Get : Discount 75%
  URL: https://www.hostg.xyz/aff_c?offer_id=6&aff_id=139422
```

### MULTI-CURRENCY ICO DAPP

```
  PROJECT: MULTI-CURRENCY ICO DAPP
  Code: https://www.theblockchaincoders.com/sourceCode/multi-currency-ico-dapp-using-next.js-solidity-and-wagmi
  VIDEO: https://youtu.be/j8NO8ea5zVo?si=jCmvfXmpmefwjhO5
```

#### Install Vs Code Editor

```
  GET: VsCode Editor
  URL: https://code.visualstudio.com/download
```

#### NodeJs & NPM Version

```
  NodeJs: 20 / LATEST
  URL: https://nodejs.org/en/download
  Video: https://youtu.be/PIR0oBVowXU?si=9eNdR29u37F2ujJJ
```

#### FINAL SOURCE CODE

```
  SETUP VIDEO:
  URL: https://www.theblockchaincoders.com/sourceCode/build-and-deploy-blockchain-healthcare-dapp-or-solidity-smart-contract-+-next.js-or-web3-health-dapp-project
```

All you need to follow the complete project and follow the instructions which are explained in the tutorial by Daulat

## Final Code Instruction

If you download the final source code then you can follow the following instructions to run the Dapp successfully

#### PINATA IPFS

```
  OPEN: PINATA.CLOUD
  URL:https://pinata.cloud/
```

#### reown

```
  OPEN: WALLET CONNECT
  URL: https://docs.reown.com/cloud/relay
```

#### FORMSPREE

```
  OPEN: FORMSPREE
  URL: https://formspree.io/
```

#### ALCHEMY

```
  OPEN: ALCHEMY.COM
  URL: https://www.alchemy.com/
```

## Important Links

- [Get Pro Blockchain Developer Course](https://www.theblockchaincoders.com/pro-nft-marketplace)
- [Support Creator](https://bit.ly/Support-Creator)
- [All Projects Source Code](https://www.theblockchaincoders.com/SourceCode)

## Money Flow in the Game

### When You LOSE:
- **Your wallet → Contract's wallet**
- Your bet amount (`msg.value`) stays in the contract
- The contract keeps 100% of your losing bet
- This builds up the contract's bankroll (house funds)

### When You WIN:
- **Your wallet → Contract's wallet** (your bet goes in first)
- **Contract's wallet → Your wallet** (you get 6x payout back)
- You receive 6x your bet amount from the contract's balance
- Net effect: You profit 5x your bet (you get back your original bet + 5x profit)

### Example:
If you bet 0.1 ETH:
- **Lose:** You send 0.1 ETH to contract, get 0 back → You lose 0.1 ETH
- **Win:** You send 0.1 ETH to contract, get 0.6 ETH back → You profit 0.5 ETH

### Important Notes:
1. **Contract Needs Funding:** The contract must have enough ETH balance to pay winners. If the contract balance is less than the payout (6x your bet), the transaction will fail.

2. **House Bankroll:** The contract owner must initially deposit funds using `depositFunds()` or by sending ETH directly to the contract address to ensure there's enough balance to pay winners.

3. **Owner Can Withdraw:** The contract owner can withdraw funds from the contract balance at any time using the `withdraw()` function.

4. **Contract Address:** The contract acts as "the house" - it's the central pool that collects losing bets and pays out winning bets.

## Authors

- [@theblockchaincoders.com](https://www.theblockchaincoders.com/)
- [@consultancy](https://www.theblockchaincoders.com/consultancy)
- [@youtube](https://www.youtube.com/@daulathussain)
