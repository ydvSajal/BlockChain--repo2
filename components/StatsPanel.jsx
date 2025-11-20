import React, { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useGameContract } from '../hooks/useGameContract';

const StatsPanel = ({ refreshTrigger }) => {
  const { address, isConnected } = useAccount();
  const { getPlayerStats, isLoadingStats } = useGameContract();
  
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalWon: '0',
    totalLost: '0',
    winRate: '0',
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalWon: 0,
    totalLost: 0,
    winRate: 0,
  });

  const [hasAnimated, setHasAnimated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch player statistics - memoized to avoid unnecessary re-renders
  const fetchStats = useCallback(async (isManualRefresh = false) => {
    if (address && isConnected) {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      try {
        const playerStats = await getPlayerStats(address);
        setStats(playerStats);
        setHasAnimated(false); // Reset animation flag when new stats load
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    } else {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [address, isConnected, getPlayerStats]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchStats(true);
  };

  // Fetch on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Update after each game result (when refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger && address && isConnected) {
      // Small delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        fetchStats();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshTrigger, address, isConnected, fetchStats]);

  // Animated number counting up on first load
  useEffect(() => {
    if (!hasAnimated && stats.totalGames > 0) {
      setHasAnimated(true);
      
      const duration = 1000; // 1 second animation
      const steps = 50;
      const interval = duration / steps;

      const targets = {
        totalGames: parseInt(stats.totalGames),
        wins: parseInt(stats.wins),
        losses: parseInt(stats.losses),
        totalWon: parseFloat(stats.totalWon),
        totalLost: parseFloat(stats.totalLost),
        winRate: parseFloat(stats.winRate),
      };

      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          totalGames: Math.floor(targets.totalGames * progress),
          wins: Math.floor(targets.wins * progress),
          losses: Math.floor(targets.losses * progress),
          totalWon: targets.totalWon * progress,
          totalLost: targets.totalLost * progress,
          winRate: targets.winRate * progress,
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats(targets);
        }
      }, interval);

      return () => clearInterval(timer);
    } else if (stats.totalGames > 0) {
      // If already animated, just set the values directly
      setAnimatedStats({
        totalGames: parseInt(stats.totalGames),
        wins: parseInt(stats.wins),
        losses: parseInt(stats.losses),
        totalWon: parseFloat(stats.totalWon),
        totalLost: parseFloat(stats.totalLost),
        winRate: parseFloat(stats.winRate),
      });
    }
  }, [stats, hasAnimated]);

  // Calculate net profit/loss
  const netProfit = parseFloat(stats.totalWon) - parseFloat(stats.totalLost);
  const isProfit = netProfit >= 0;

  // Format number to 3 decimal places
  const formatEth = (value) => {
    return parseFloat(value).toFixed(3);
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Your Statistics</span>
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">
            Connect your wallet to view statistics
          </p>
          <div className="mt-4 text-gray-500 text-sm">
            🔒 Wallet not connected
          </div>
        </div>
      </div>
    );
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      {/* TOP ROW - Total Games & Win Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gray-700/50 p-4 rounded-lg h-24"></div>
        <div className="bg-gray-700/50 p-4 rounded-lg h-24"></div>
      </div>

      {/* MIDDLE ROW - Wins & Losses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gray-700/50 p-4 rounded-lg h-24"></div>
        <div className="bg-gray-700/50 p-4 rounded-lg h-24"></div>
      </div>

      {/* BOTTOM ROW - Financial Stats */}
      <div className="space-y-3">
        <div className="bg-gray-700/50 p-4 rounded-lg h-16"></div>
        <div className="bg-gray-700/50 p-4 rounded-lg h-16"></div>
        <div className="bg-gray-700/50 p-4 rounded-lg h-20"></div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-4">
        Loading statistics...
      </div>
    </div>
  );

  return (
    <div className="w-full lg:w-[350px] bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sm:p-6 shadow-2xl">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span>
          <span>Your Statistics</span>
        </h2>
        
        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isLoading || isRefreshing || !isConnected}
          className={`
            p-2 rounded-lg transition-all duration-300
            ${isRefreshing 
              ? 'bg-purple-500/20 text-purple-300' 
              : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            border border-gray-600/30 hover:border-gray-500/50
            shadow-sm hover:shadow-md
          `}
          title="Refresh statistics"
        >
          <svg
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {isLoading || isLoadingStats ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* TOP ROW - Total Games & Win Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Total Games */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Total Games</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {animatedStats.totalGames}
                </div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Win Rate</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                  {animatedStats.winRate.toFixed(1)}%
                </div>
                
                {/* Progress Bar with Label */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {animatedStats.winRate.toFixed(1)}% Win Rate
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {animatedStats.wins}/{animatedStats.totalGames}
                    </span>
                  </div>
                  
                  {/* Horizontal Progress Bar */}
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    {/* Green Fill Based on Win Rate */}
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${Math.min(animatedStats.winRate, 100)}%` }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                    
                    {/* Percentage marker */}
                    {animatedStats.winRate > 5 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-white z-10 transition-all duration-1000"
                        style={{ left: `${Math.min(animatedStats.winRate, 100) - 3}%` }}
                      >
                        {animatedStats.winRate > 10 && `${animatedStats.winRate.toFixed(0)}%`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW - Wins & Losses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Wins */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Wins</span>
                </div>
                <div className="text-3xl font-black text-green-500">
                  {animatedStats.wins}
                </div>
              </div>
            </div>

            {/* Losses */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">❌</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Losses</span>
                </div>
                <div className="text-3xl font-black text-red-500">
                  {animatedStats.losses}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW - Financial Stats (Full Width) */}
          <div className="space-y-3">
            {/* Total Won */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Total Won</span>
                </div>
                <div className="text-2xl font-black text-green-500">
                  {animatedStats.totalWon.toFixed(3)} ETH
                </div>
              </div>
            </div>

            {/* Total Lost */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📉</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Total Lost</span>
                </div>
                <div className="text-2xl font-black text-red-500">
                  {animatedStats.totalLost.toFixed(3)} ETH
                </div>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Net Profit/Loss</span>
                </div>
                <div className={`
                  text-2xl font-black
                  ${isProfit ? 'text-green-500' : 'text-red-500'}
                `}>
                  {isProfit ? '+' : ''}{(animatedStats.totalWon - animatedStats.totalLost).toFixed(3)} ETH
                </div>
              </div>
              {/* Indicator */}
              <div className="mt-2 text-right">
                <span className={`
                  text-xs font-semibold px-3 py-1 rounded-full
                  ${isProfit 
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300'
                  }
                `}>
                  {isProfit ? '🚀 In Profit' : '📊 In Loss'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          {stats.totalGames === 0 && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <p className="text-blue-300 text-sm">
                🎲 Play your first game to start tracking statistics!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shimmer animation for progress bar */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default StatsPanel;
