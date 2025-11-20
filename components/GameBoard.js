import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useGameContract } from '../hooks/useGameContract';
import toast from 'react-hot-toast';
import NumberSelector from './NumberSelector';
import Dice from './Dice';
import ResultModal from './ResultModal';

const GameBoard = ({ onGameComplete }) => {
  const { isConnected, address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { placeBet, isPlacingBet, getGameHistory } = useGameContract();
  
  // Game state (Step 1: Setup game states)
  const [selectedNumber, setSelectedNumber] = useState(null); // null | 1-6
  const [betAmount, setBetAmount] = useState('0.01'); // string
  const [diceResult, setDiceResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false); // boolean
  const [gameResult, setGameResult] = useState(null); // null | { gameId, result, didWin, payout, betAmount }
  const [lastResults, setLastResults] = useState([]); // last 5 games
  const [betError, setBetError] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);

  // Load last results when user connects
  useEffect(() => {
    const loadLastResults = async () => {
      if (address && isConnected) {
        try {
          const history = await getGameHistory(address);
          // Get last 5 results
          const recent = history.slice(0, 5).map(game => ({
            gameId: game.gameId,
            betNumber: game.betNumber,
            result: game.result,
            won: game.won,
            payout: game.payout,
            timestamp: game.timestamp,
          }));
          setLastResults(recent);
        } catch (error) {
          console.error('Error loading game history:', error);
        }
      }
    };

    loadLastResults();
  }, [address, isConnected, getGameHistory]);

  // Calculate game status message
  const gameStatus = useMemo(() => {
    if (isRolling || isPlacingBet) {
      return {
        message: 'Rolling the dice...',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        icon: '🎲'
      };
    }
    
    if (gameResult) {
      if (gameResult.didWin) {
        const payout = parseFloat(gameResult.payout || 0).toFixed(3);
        return {
          message: `You Won! +${payout} ETH 🎉`,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          icon: '🎉'
        };
      } else {
        const lost = parseFloat(betAmount || 0).toFixed(3);
        return {
          message: `You Lost -${lost} ETH`,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          icon: '😔'
        };
      }
    }
    
    return {
      message: 'Select a number and place your bet',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      icon: '🎯'
    };
  }, [isRolling, isPlacingBet, gameResult, betAmount]);

  // Calculate potential payout (6x multiplier)
  const potentialPayout = useMemo(() => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) return '0.000';
    return (amount * 6).toFixed(3);
  }, [betAmount]);

  // Validate bet amount - validates on every betAmount change
  const validateBetAmount = (amount) => {
    // Empty input
    if (!amount || amount === '') {
      setBetError('');
      return false;
    }

    const value = parseFloat(amount);
    
    // Invalid number
    if (isNaN(value) || value <= 0) {
      setBetError('Please enter a valid bet amount');
      return false;
    }
    
    // Below minimum
    if (value < 0.001) {
      setBetError('Minimum bet is 0.001 ETH');
      return false;
    }
    
    // Exceeds balance
    if (balance && value > parseFloat(balance.formatted)) {
      setBetError('Insufficient balance');
      return false;
    }
    
    // Valid input
    setBetError('');
    return true;
  };

  // Handle bet amount change - validate on every change
  const handleBetAmountChange = (value) => {
    setBetAmount(value);
    // Validate immediately on change
    validateBetAmount(value);
  };

  // Handle placing bet (Complete betting workflow with validation and notifications)
  const handlePlaceBet = async () => {
    // Clear any previous errors
    setBetError('');
    
    // Validation
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      setBetError('Please connect your wallet first');
      return;
    }
    
    if (!selectedNumber) {
      toast.error('Please select a number');
      setBetError('Please select a number first');
      return;
    }

    if (!betAmount || betAmount === '' || parseFloat(betAmount) < 0.001) {
      toast.error('Minimum bet is 0.001 ETH');
      setBetError('Minimum bet is 0.001 ETH');
      return;
    }

    const betValue = parseFloat(betAmount);
    
    if (isNaN(betValue) || betValue <= 0) {
      toast.error('Please enter a valid bet amount');
      setBetError('Please enter a valid bet amount');
      return;
    }
    
    const balanceValue = balance ? parseFloat(balance.formatted) : 0;
    
    if (betValue > balanceValue) {
      toast.error('Insufficient balance');
      setBetError('Insufficient balance');
      return;
    }

    try {
      // Start rolling
      setIsRolling(true);
      setGameResult(null);
      setDiceResult('?');
      setBetError('');
      toast.loading('Transaction submitted. Rolling dice...', { id: 'bet-transaction' });

      console.log('Placing bet:', { selectedNumber, betAmount, address });

      // Call contract with trimmed bet amount to ensure clean string
      const result = await placeBet(selectedNumber, betAmount.trim());
      
      if (result.success) {
        // Wait 2 seconds for dice animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show result
        setDiceResult(result.result);
        setGameResult({
          rolled: result.result,
          won: result.didWin,
          payout: result.payout,
          gameId: result.gameId,
          betAmount: result.betAmount,
          betNumber: result.betNumber,
          txHash: result.txHash,
        });

        // Add to history
        setLastResults(prev => [{
          betNumber: selectedNumber,
          rolled: result.result,
          won: result.didWin,
          amount: betAmount,
          payout: result.payout,
          timestamp: new Date(),
          gameId: result.gameId,
          result: result.result,
        }, ...prev.slice(0, 4)]);

        // Dismiss loading toast and show notification
        toast.dismiss('bet-transaction');
        if (result.didWin) {
          toast.success(`You won ${result.payout} ETH! 🎉`);
        } else {
          toast.error(`You lost ${betAmount} ETH`);
        }

        // Show result modal
        setShowResultModal(true);

        // Trigger refresh for stats and history (with 1 second delay)
        if (onGameComplete) {
          setTimeout(() => {
            onGameComplete();
          }, 1000);
        }
      } else {
        // Handle bet placement failure
        toast.dismiss('bet-transaction');
        setDiceResult(null);
        setBetError(result.error || 'Failed to place bet');
        toast.error(result.error || 'Failed to place bet');
      }

    } catch (error) {
      console.error('Bet placement error:', error);
      toast.dismiss('bet-transaction');
      setDiceResult(null);
      
      // Extract meaningful error message
      let errorMessage = 'Transaction failed';
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas + bet amount';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction rejected';
        } else if (error.message.includes('nonce')) {
          errorMessage = 'Transaction error. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setBetError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRolling(false);
      // Reset for next bet after 5 seconds (modal will auto-close at same time)
      setTimeout(() => {
        setGameResult(null);
        setShowResultModal(false);
        setSelectedNumber(null);
        setBetAmount('0.01');
        setBetError('');
      }, 5000);
    }
  };

  // Check if bet button should be disabled
  // Disabled when: rolling, no number selected, no bet amount, or validation fails
  const isBetDisabled = isRolling || 
                         isPlacingBet ||
                         !isConnected || 
                         !selectedNumber || 
                         !betAmount ||
                         !!betError ||
                         parseFloat(betAmount || 0) <= 0;

  // Helper function to get relative time (e.g., "2m ago", "5m ago")
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp * 1000;
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
      {/* Main Game Area */}
      <div className="space-y-6">
        {/* Dice Display Section */}
        <div className="flex flex-col items-center justify-center py-8">
          <h2 className="text-3xl font-bold text-white mb-6">Roll the Dice</h2>
          
          {/* Game Status Display */}
          <div className={`
            mb-6 px-6 py-3 rounded-xl font-bold text-lg
            border-2 shadow-lg
            transition-all duration-300 transform
            ${gameStatus.color} ${gameStatus.bgColor} ${gameStatus.borderColor}
            ${isRolling || isPlacingBet ? 'animate-pulse' : ''}
          `}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{gameStatus.icon}</span>
              <span>{gameStatus.message}</span>
            </div>
          </div>
          
          {/* 3D Dice Container */}
          <div className="w-[300px] h-[300px] mb-6">
            <div className={`
              w-full h-full rounded-2xl
              border-4
              ${isRolling ? 'border-blue-400 animate-pulse' : 'border-gray-400'}
              bg-gradient-to-br from-blue-50 via-white to-purple-50
              flex items-center justify-center
              shadow-xl
              transition-all duration-300
            `}>
              {/* 3D Dice Display */}
              <Dice 
                value={diceResult === null || diceResult === '?' ? null : diceResult}
                isRolling={isRolling || isPlacingBet}
              />
            </div>
          </div>
        </div>

        {/* Number Selection Section */}
        <div className="border-t border-gray-700 pt-6">
          <NumberSelector 
            selectedNumber={selectedNumber}
            onSelectNumber={setSelectedNumber}
            disabled={isRolling || isPlacingBet}
          />
        </div>

        {/* Bet Amount Section */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-white">
            Bet Amount (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={betAmount}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            disabled={isRolling || isPlacingBet}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border-2 rounded-lg text-white text-lg
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 
              focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
              ${betError ? 'border-red-500' : 'border-gray-600'}
            `}
            placeholder="Enter bet amount"
          />
          
          {/* Validation error */}
          {betError && (
            <p className="text-red-500 text-sm font-medium">
              ⚠️ {betError}
            </p>
          )}
          
          {/* Quick bet buttons */}
          <div className="flex gap-3">
            {['0.01', '0.05', '0.1'].map((amount) => (
              <button
                key={amount}
                onClick={() => handleBetAmountChange(amount)}
                disabled={isRolling || isPlacingBet}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {amount} ETH
              </button>
            ))}
          </div>

          {/* Potential payout display */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Potential Win:</span>
              <span className="text-green-400 text-lg font-bold">
                {potentialPayout} ETH
              </span>
            </div>
            <div className="text-center text-purple-300 text-xs mt-1">
              (6x multiplier)
            </div>
          </div>
        </div>

        {/* Place Bet Button - Large Prominent with Purple-to-Pink Gradient */}
        <button
          onClick={handlePlaceBet}
          disabled={isBetDisabled}
          className={`
            w-full py-6 rounded-2xl font-bold text-2xl
            transition-all duration-300 transform
            flex items-center justify-center gap-3
            relative overflow-hidden
            border-2
            ${isBetDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60 border-gray-700'
              : 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 text-white hover:scale-[1.02] shadow-2xl hover:shadow-purple-500/60 active:scale-[0.98] border-transparent'
            }
          `}
          style={{
            backgroundSize: isBetDisabled ? 'auto' : '200% 100%',
            animation: isBetDisabled ? 'none' : 'gradient-shift 3s ease infinite',
          }}
        >
          {/* Animated gradient overlay for active button */}
          {!isBetDisabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite'
                 }} 
            />
          )}
          
          {/* Button content */}
          <div className="relative z-10 flex items-center justify-center gap-3">
            {isRolling || isPlacingBet ? (
              <>
                {/* Spinning loader */}
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Rolling...</span>
              </>
            ) : !isConnected ? (
              <>
                <span className="text-3xl">🔒</span>
                <span>Connect Wallet</span>
              </>
            ) : selectedNumber === null ? (
              <>
                <span className="text-3xl">🎯</span>
                <span>Select Number</span>
              </>
            ) : !betAmount || parseFloat(betAmount) <= 0 ? (
              <>
                <span className="text-3xl">💰</span>
                <span>Enter Bet Amount</span>
              </>
            ) : betError && betError.includes('Insufficient') ? (
              <>
                <span className="text-3xl">⚠️</span>
                <span>Insufficient Balance</span>
              </>
            ) : betError ? (
              <>
                <span className="text-3xl">⚠️</span>
                <span>Invalid Bet</span>
              </>
            ) : (
              <>
                <span className="text-3xl">🎲</span>
                <span>Place Bet</span>
              </>
            )}
          </div>
        </button>

        {/* Add keyframe animations */}
        <style jsx>{`
          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>

        {/* Game Info */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">How to Play:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Select a number from 1-6</li>
            <li>• Choose your bet amount</li>
            <li>• Click "Roll the Dice" to play</li>
            <li>• Win 5x your bet if you guess correctly! 🎯</li>
          </ul>
        </div>

        {/* Recent Results - Horizontal Scrollable Cards */}
        {lastResults.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Recent Games
            </h3>
            
            {/* Horizontal scrollable container */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {lastResults.slice(0, 5).map((game, index) => (
                <div
                  key={game.gameId || index}
                  className={`
                    flex-shrink-0 w-48 p-3 rounded-xl
                    border-2 transition-all hover:scale-105
                    ${game.won 
                      ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20' 
                      : 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                    }
                  `}
                >
                  {/* Bet number → Rolled number */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-xs">Bet:</span>
                      <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                        {game.betNumber}
                      </div>
                    </div>
                    <span className="text-gray-500">→</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-xs">Got:</span>
                      <div className={`
                        w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm
                        ${game.won ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                      `}>
                        {game.rolled || game.result}
                      </div>
                    </div>
                  </div>

                  {/* Win/Loss Status */}
                  <div className={`
                    text-center font-semibold text-xs mb-1
                    ${game.won ? 'text-green-400' : 'text-red-400'}
                  `}>
                    {game.won ? '✓ Win' : '✗ Loss'}
                  </div>

                  {/* Amount */}
                  <div className={`
                    text-center font-bold text-sm
                    ${game.won ? 'text-green-400' : 'text-red-400'}
                  `}>
                    {game.won ? '+' : '-'}{game.won ? game.payout : (game.amount || betAmount)} ETH
                  </div>

                  {/* Timestamp */}
                  {game.timestamp && (
                    <div className="text-center text-gray-500 text-xs mt-1">
                      {getRelativeTime(game.timestamp)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Scroll hint for mobile */}
            {lastResults.length > 2 && (
              <div className="text-center text-gray-500 text-xs mt-2">
                ← Scroll for more →
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResultModal && gameResult && (
        <ResultModal
          result={{
            rolled: gameResult.rolled,
            won: gameResult.won,
            payout: gameResult.payout,
          }}
          betNumber={selectedNumber}
          betAmount={betAmount}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </div>
  );
};

export default GameBoard;