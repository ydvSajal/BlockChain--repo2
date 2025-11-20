import { useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import NumberPredictionGameABI from '../utils/NumberPredictionGameABI.json';

// Contract address - update this with your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

/**
 * Custom hook to interact with the NumberPredictionGame smart contract
 * @returns {Object} Contract instance with provider and signer, plus utility functions
 */
export const useGameContract = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const contract = useMemo(() => {
    if (!isConnected || !walletClient) {
      // Return read-only contract instance with provider
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'
      );
      return new ethers.Contract(CONTRACT_ADDRESS, NumberPredictionGameABI, provider);
    }

    // Create ethers provider from wagmi wallet client
    const { chain } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };

    const provider = new ethers.providers.Web3Provider(
      walletClient.transport,
      network
    );

    // Get signer for write operations
    const signer = provider.getSigner(address);

    // Return contract instance connected to signer
    return new ethers.Contract(CONTRACT_ADDRESS, NumberPredictionGameABI, signer);
  }, [isConnected, walletClient, address]);

  /**
   * Place a bet on a predicted number
   * @param {number} betNumber - The predicted number (0-9)
   * @param {string} betAmount - The bet amount in ETH (e.g., "0.01")
   * @returns {Promise<Object>} Result object with success, txHash, result, didWin, payout
   */
  const placeBet = useCallback(
    async (betNumber, betAmount) => {
      try {
        if (!isConnected || !contract.signer) {
          throw new Error('Wallet not connected');
        }

        // Convert bet amount to Wei
        const betAmountInWei = ethers.utils.parseEther(betAmount.toString());

        // Call the play function (based on the ABI, the function is named 'play')
        const tx = await contract.play(betNumber, { value: betAmountInWei });

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        // Find the GamePlayed event in the transaction receipt
        const gamePlayedEvent = receipt.events?.find(
          (event) => event.event === 'GamePlayed'
        );

        if (gamePlayedEvent) {
          const {
            gameId,
            player,
            betAmount: eventBetAmount,
            predictedNumber,
            resultNumber,
            won,
            payout,
          } = gamePlayedEvent.args;

          return {
            success: true,
            txHash: receipt.transactionHash,
            gameId: gameId.toString(),
            betNumber: predictedNumber,
            result: resultNumber,
            didWin: won,
            payout: ethers.utils.formatEther(payout),
            betAmount: ethers.utils.formatEther(eventBetAmount),
          };
        }

        return {
          success: true,
          txHash: receipt.transactionHash,
          result: null,
          didWin: false,
          payout: '0',
        };
      } catch (error) {
        console.error('Error placing bet:', error);
        return {
          success: false,
          error: error.message || 'Failed to place bet',
        };
      }
    },
    [contract, isConnected]
  );

  /**
   * Get player statistics
   * @param {string} playerAddress - The player's wallet address
   * @returns {Promise<Object>} Player stats object
   */
  const getPlayerStats = useCallback(
    async (playerAddress) => {
      try {
        // Get player's game IDs with a limit
        const gameIds = await contract.getPlayerGames(playerAddress, 1000);

        let totalGames = gameIds.length;
        let wins = 0;
        let losses = 0;
        let totalWon = ethers.BigNumber.from(0);
        let totalLost = ethers.BigNumber.from(0);

        // Fetch details for each game
        for (const gameId of gameIds) {
          try {
            const game = await contract.getGame(gameId);
            const betAmount = game.betAmount;

            if (game.won) {
              wins++;
              // Calculate net winnings (payout - bet amount)
              const payout = betAmount.mul(5); // Based on 5x payout for winning
              totalWon = totalWon.add(payout.sub(betAmount));
            } else {
              losses++;
              totalLost = totalLost.add(betAmount);
            }
          } catch (err) {
            console.error(`Error fetching game ${gameId}:`, err);
          }
        }

        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        return {
          totalGames,
          wins,
          losses,
          totalWon: ethers.utils.formatEther(totalWon),
          totalLost: ethers.utils.formatEther(totalLost),
          winRate: winRate.toFixed(2),
        };
      } catch (error) {
        console.error('Error getting player stats:', error);
        return {
          totalGames: 0,
          wins: 0,
          losses: 0,
          totalWon: '0',
          totalLost: '0',
          winRate: '0',
        };
      }
    },
    [contract]
  );

  /**
   * Get game history for a player
   * @param {string} playerAddress - The player's wallet address
   * @returns {Promise<Array>} Array of game objects
   */
  const getGameHistory = useCallback(
    async (playerAddress) => {
      try {
        // Create filter for GamePlayed events by player address
        const filter = contract.filters.GamePlayed(null, playerAddress);

        // Get all past events (you may want to add fromBlock parameter for optimization)
        const events = await contract.queryFilter(filter);

        // Parse events and return formatted game history
        const gameHistory = events.map((event) => {
          const {
            gameId,
            player,
            betAmount,
            predictedNumber,
            resultNumber,
            won,
            payout,
          } = event.args;

          return {
            gameId: gameId.toString(),
            player,
            betNumber: predictedNumber,
            result: resultNumber,
            betAmount: ethers.utils.formatEther(betAmount),
            won,
            payout: ethers.utils.formatEther(payout),
            timestamp: null, // Will be populated from block timestamp
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
          };
        });

        // Fetch block timestamps for each game
        const historyWithTimestamps = await Promise.all(
          gameHistory.map(async (game) => {
            try {
              const block = await contract.provider.getBlock(game.blockNumber);
              return {
                ...game,
                timestamp: block.timestamp,
              };
            } catch (err) {
              console.error('Error fetching block timestamp:', err);
              return game;
            }
          })
        );

        // Sort by most recent first
        return historyWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error('Error getting game history:', error);
        return [];
      }
    },
    [contract]
  );

  return {
    contract,
    contractAddress: CONTRACT_ADDRESS,
    isConnected,
    userAddress: address,
    placeBet,
    getPlayerStats,
    getGameHistory,
  };
};

export default useGameContract;
