import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useGameContract } from '../hooks/useGameContract';

const GameHistory = () => {
  const { address, isConnected } = useAccount();
  const { getGameHistory, isLoadingHistory } = useGameContract();
  
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all | wins | losses
  const [sortBy, setSortBy] = useState('date'); // date | amount | outcome
  const [sortOrder, setSortOrder] = useState('desc'); // asc | desc
  const [displayLimit, setDisplayLimit] = useState(20); // Show latest 20 games initially
  const [searchTxHash, setSearchTxHash] = useState(''); // Search by transaction hash
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // Date range filter

  // Fetch game history on component mount or when address changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isConnected || !address) {
        setGames([]);
        return;
      }

      setIsLoading(true);
      try {
        const history = await getGameHistory(address);
        setGames(history);
      } catch (error) {
        console.error('Error fetching game history:', error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [address, isConnected, getGameHistory]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (!isConnected || !address) return;
    
    setIsLoading(true);
    try {
      const history = await getGameHistory(address);
      setGames(history);
      setDisplayLimit(20); // Reset to initial 20 games
    } catch (error) {
      console.error('Error refreshing game history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date and time - "Nov 19, 6:15 PM"
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const time = timestamp * 1000;
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Truncate transaction hash - first 6 chars + ...
  const truncateTxHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 6)}...`;
  };

  // Get blockchain explorer URL (Sepolia testnet)
  const getExplorerUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games];

    // Apply win/loss filter
    if (filter === 'wins') {
      filtered = filtered.filter(game => game.won);
    } else if (filter === 'losses') {
      filtered = filtered.filter(game => !game.won);
    }

    // Apply transaction hash search
    if (searchTxHash.trim()) {
      const searchLower = searchTxHash.toLowerCase().trim();
      filtered = filtered.filter(game => 
        game.txHash && game.txHash.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).getTime() / 1000;
      filtered = filtered.filter(game => game.timestamp >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).getTime() / 1000 + 86400; // End of day
      filtered = filtered.filter(game => game.timestamp <= endDate);
    }

    // Apply sort
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          compareValue = (b.timestamp || 0) - (a.timestamp || 0);
          break;
        case 'amount':
          compareValue = parseFloat(b.betAmount || 0) - parseFloat(a.betAmount || 0);
          break;
        case 'outcome':
          // Sort by wins first, then by payout amount
          if (a.won === b.won) {
            compareValue = parseFloat(b.payout || 0) - parseFloat(a.payout || 0);
          } else {
            compareValue = a.won ? -1 : 1;
          }
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [games, filter, sortBy, sortOrder, searchTxHash, dateRange]);

  // Paginated games - show only displayLimit games
  const paginatedGames = useMemo(() => {
    return filteredAndSortedGames.slice(0, displayLimit);
  }, [filteredAndSortedGames, displayLimit]);

  // Check if there are more games to load
  const hasMoreGames = filteredAndSortedGames.length > displayLimit;

  // Load more games
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilter('all');
    setSearchTxHash('');
    setDateRange({ start: '', end: '' });
    setDisplayLimit(20);
  };

  // Check if any filters are active
  const hasActiveFilters = filter !== 'all' || searchTxHash.trim() !== '' || dateRange.start !== '' || dateRange.end !== '';

  // Calculate stats from filtered games
  const stats = useMemo(() => {
    const totalGames = filteredAndSortedGames.length;
    const wins = filteredAndSortedGames.filter(g => g.won).length;
    const losses = totalGames - wins;
    const totalWagered = filteredAndSortedGames.reduce((sum, g) => sum + parseFloat(g.betAmount || 0), 0);
    const totalWon = filteredAndSortedGames.filter(g => g.won).reduce((sum, g) => sum + parseFloat(g.payout || 0), 0);
    const totalLost = filteredAndSortedGames.filter(g => !g.won).reduce((sum, g) => sum + parseFloat(g.betAmount || 0), 0);
    const netProfit = totalWon - totalLost;

    return {
      totalGames,
      wins,
      losses,
      totalWagered: totalWagered.toFixed(4),
      totalWon: totalWon.toFixed(4),
      totalLost: totalLost.toFixed(4),
      netProfit: netProfit.toFixed(4),
    };
  }, [filteredAndSortedGames]);

  // Empty state
  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
        <p className="text-gray-400">Connect your wallet to view game history</p>
      </div>
    );
  }

  if (isLoading || isLoadingHistory) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
        <div className="flex items-center justify-center gap-3 text-white">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-semibold">Loading game history...</span>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-12 text-center">
        {/* Illustration */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Dice stack illustration */}
            <div className="flex gap-2 mb-4 justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg transform rotate-12 flex items-center justify-center text-4xl border-2 border-purple-400">
                🎲
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl shadow-lg transform -rotate-12 flex items-center justify-center text-4xl border-2 border-pink-400">
                🎲
              </div>
            </div>
            {/* Empty state icon */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-full p-2">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text content */}
        <h2 className="text-2xl font-bold text-white mb-3">No games played yet</h2>
        <p className="text-gray-400 text-lg mb-6">Start playing to see your history here</p>

        {/* Call to action hint */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-purple-300 text-sm">
            💡 Connect your wallet and place your first bet to begin your gaming journey!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl">
      {/* Header - Fixed at top */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 pb-4 border-b border-gray-700/50">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Game History</h2>
          <p className="text-gray-400 text-sm">{stats.totalGames} total games</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg
            className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
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
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 border-b border-gray-700/50">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-semibold mb-1">Total Wagered</div>
          <div className="text-white text-lg font-bold">{stats.totalWagered} ETH</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-400 text-xs font-semibold mb-1">Total Won</div>
          <div className="text-white text-lg font-bold">{stats.totalWon} ETH</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="text-red-400 text-xs font-semibold mb-1">Total Lost</div>
          <div className="text-white text-lg font-bold">{stats.totalLost} ETH</div>
        </div>
        <div className={`${parseFloat(stats.netProfit) >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-3`}>
          <div className={`${parseFloat(stats.netProfit) >= 0 ? 'text-green-400' : 'text-red-400'} text-xs font-semibold mb-1`}>Net Profit</div>
          <div className={`${parseFloat(stats.netProfit) >= 0 ? 'text-green-400' : 'text-red-400'} text-lg font-bold`}>
            {parseFloat(stats.netProfit) >= 0 ? '+' : ''}{stats.netProfit} ETH
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 px-6 py-4 border-b border-gray-700/50 bg-gray-900/30">
        {/* Row 1: Outcome Filter and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Outcome Filter Dropdown */}
          <div className="flex-1">
            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
              Filter by Outcome
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
            >
              <option value="all">All Games ({games.length})</option>
              <option value="wins">Wins Only ({stats.wins})</option>
              <option value="losses">Losses Only ({stats.losses})</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex-1">
            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="outcome">Outcome</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-all border border-gray-600"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Date Range and Transaction Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Picker */}
          <div className="flex-1">
            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
                placeholder="Start Date"
              />
              <span className="flex items-center text-gray-500">—</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Transaction Hash Search */}
          <div className="flex-1">
            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
              Search by Transaction Hash
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTxHash}
                onChange={(e) => setSearchTxHash(e.target.value)}
                placeholder="Enter tx hash..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 pr-10"
              />
              {searchTxHash && (
                <button
                  onClick={() => setSearchTxHash('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      {/* Desktop Table View - Scrollable Container */}
      <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">#</th>
              
              {/* Clickable Date/Time Header */}
              <th 
                className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide cursor-pointer hover:text-white transition-colors select-none group"
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span>Timestamp</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortBy === 'date' && sortOrder === 'asc' ? 'text-purple-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                    <svg className={`w-3 h-3 -mt-1 ${sortBy === 'date' && sortOrder === 'desc' ? 'text-purple-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                </div>
              </th>
              
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Bet</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Rolled</th>
              
              {/* Clickable Amount Header */}
              <th 
                className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide cursor-pointer hover:text-white transition-colors select-none group"
                onClick={() => {
                  if (sortBy === 'amount') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('amount');
                    setSortOrder('desc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span>Amount</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortBy === 'amount' && sortOrder === 'asc' ? 'text-purple-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                    <svg className={`w-3 h-3 -mt-1 ${sortBy === 'amount' && sortOrder === 'desc' ? 'text-purple-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                </div>
              </th>
              
              {/* Clickable Outcome Header */}
              <th 
                className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide cursor-pointer hover:text-white transition-colors select-none group"
                onClick={() => {
                  if (sortBy === 'outcome') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('outcome');
                    setSortOrder('desc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span>Outcome</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortBy === 'outcome' && sortOrder === 'asc' ? 'text-purple-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                    <svg className={`w-3 h-3 -mt-1 ${sortBy === 'outcome' && sortOrder === 'desc' ? 'text-purple-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                </div>
              </th>
              
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Payout/Loss</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm uppercase tracking-wide">Tx</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGames.map((game, index) => (
              <tr
                key={game.gameId}
                className={`border-b border-gray-700/30 hover:bg-gray-700/40 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                }`}
              >
                {/* Game Number - Compact */}
                <td className="py-2.5 px-3 text-gray-400 text-xs font-semibold">
                  {index + 1}
                </td>

                {/* Timestamp - Compact */}
                <td className="py-2.5 px-3">
                  <div className="text-white text-xs whitespace-nowrap">
                    {formatDateTime(game.timestamp)}
                  </div>
                </td>

                {/* Bet Number with Dice Icon - Compact */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🎲</span>
                    <span className="text-white font-bold text-sm">{game.betNumber}</span>
                  </div>
                </td>

                {/* Rolled Number with Dice Icon - Compact */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🎲</span>
                    <span className={`font-bold text-sm ${
                      game.won ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {game.result}
                    </span>
                  </div>
                </td>

                {/* Bet Amount - Compact */}
                <td className="py-2.5 px-3">
                  <div className="text-white font-semibold text-xs whitespace-nowrap">
                    {parseFloat(game.betAmount).toFixed(3)} ETH
                  </div>
                </td>

                {/* Outcome Badge - Compact */}
                <td className="py-2.5 px-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    game.won
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {game.won ? 'WIN' : 'LOSS'}
                  </span>
                </td>

                {/* Payout/Loss - Compact */}
                <td className="py-2.5 px-3">
                  <div className={`font-bold text-xs whitespace-nowrap ${
                    game.won ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {game.won ? '+' : '-'}
                    {game.won 
                      ? parseFloat(game.payout).toFixed(3) 
                      : parseFloat(game.betAmount).toFixed(3)
                    } ETH
                  </div>
                </td>

                {/* Transaction Hash - Compact */}
                <td className="py-2.5 px-3">
                  {game.txHash ? (
                    <a
                      href={getExplorerUrl(game.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 hover:underline font-mono text-xs transition-colors"
                      title={game.txHash}
                    >
                      {truncateTxHash(game.txHash)}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-xs">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View - Scrollable */}
      <div className="lg:hidden space-y-3 max-h-[600px] overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {paginatedGames.map((game, index) => (
          <div
            key={game.gameId}
            className="rounded-xl p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 transition-all hover:border-gray-600 shadow-lg"
          >
            {/* Card Header - Game # and Outcome Badge - Compact */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-xs font-semibold">#{index + 1}</div>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  game.won ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {game.won ? 'WIN' : 'LOSS'}
                </span>
              </div>
            </div>

            {/* Timestamp - Compact */}
            <div className="text-white text-xs font-medium mb-3 text-gray-300">
              {formatDateTime(game.timestamp)}
            </div>

            {/* Bet vs Rolled - Compact with Dice Icons */}
            <div className="flex items-center justify-center gap-3 mb-3 py-2 bg-gray-800/70 rounded-lg border border-gray-700/50">
              <div className="text-center flex-1">
                <div className="text-gray-400 text-[10px] mb-1 uppercase tracking-wide">Bet</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg">🎲</span>
                  <span className="text-white font-bold text-lg">{game.betNumber}</span>
                </div>
              </div>
              <div className="text-gray-500 text-lg">→</div>
              <div className="text-center flex-1">
                <div className="text-gray-400 text-[10px] mb-1 uppercase tracking-wide">Rolled</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg">🎲</span>
                  <span className={`font-bold text-lg ${
                    game.won ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {game.result}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount and Payout - Compact Grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-gray-800/70 rounded-lg p-2 border border-gray-700/50">
                <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">Bet</div>
                <div className="text-white font-bold text-xs">
                  {parseFloat(game.betAmount).toFixed(3)} ETH
                </div>
              </div>
              <div className="bg-gray-800/70 rounded-lg p-2 border border-gray-700/50">
                <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">
                  {game.won ? 'Won' : 'Lost'}
                </div>
                <div className={`font-bold text-xs ${
                  game.won ? 'text-green-400' : 'text-red-400'
                }`}>
                  {game.won ? '+' : '-'}
                  {game.won 
                    ? parseFloat(game.payout).toFixed(3) 
                    : parseFloat(game.betAmount).toFixed(3)
                  } ETH
                </div>
              </div>
            </div>

            {/* Transaction Link - Compact */}
            {game.txHash && (
              <a
                href={getExplorerUrl(game.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-purple-400 hover:text-purple-300 hover:underline font-mono text-[10px] transition-colors py-1"
                title={game.txHash}
              >
                Tx: {truncateTxHash(game.txHash)}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* No results after filtering */}
      {filteredAndSortedGames.length === 0 && games.length > 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg className="w-20 h-20 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No games match your filters</h3>
          <p className="text-gray-400 mb-4">Try adjusting your search criteria</p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Load More Button */}
      {hasMoreGames && (
        <div className="flex justify-center px-6 py-4 border-t border-gray-700/50">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>Load More</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {filteredAndSortedGames.length > 0 && (
        <div className="text-center px-6 py-3 text-gray-400 text-xs border-t border-gray-700/50 bg-gray-900/30">
          Showing {paginatedGames.length} of {filteredAndSortedGames.length} games
          {hasActiveFilters && ' (filtered)'}
        </div>
      )}
    </div>
  );
};

export default GameHistory;
