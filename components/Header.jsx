import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import CustomConnectButton from './CustomConnectButton';

const LOCALHOST_CHAIN_ID = 1337;

const Header = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: chainId,
  });

  const isCorrectNetwork = chainId === LOCALHOST_CHAIN_ID;

  // Smooth fade-in animation on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-refresh balance every 10 seconds
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      refetchBalance();
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected, address, refetchBalance]);

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    const formatted = formatEther(balance.value);
    return parseFloat(formatted).toFixed(4);
  };

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refetchBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header 
      className={`w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg transition-opacity duration-500 ${
        isMounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            {/* App logo/icon */}
            <div className="text-4xl">🎲</div>
            
            {/* Game title with gradient effect */}
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Play-to-Earn Dice Game
            </h1>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
            {isConnected ? (
              <>
                {/* Balance Display */}
                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-gray-400 text-sm font-medium">Balance:</span>
                  <span className="text-white font-bold">{formatBalance(balance)} ETH</span>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="ml-2 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                    title="Refresh balance"
                  >
                    {isRefreshing ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 hover:rotate-180 transition-transform duration-500"
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
                    )}
                  </button>
                </div>

                {/* Network Indicator Badge */}
                {isCorrectNetwork ? (
                  <div className="flex items-center gap-2 bg-green-900/30 border border-green-600 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Localhost</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-900/30 border border-red-600 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-medium">Wrong Network</span>
                  </div>
                )}

                {/* Wallet Address */}
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-white font-mono text-sm">
                    {shortenAddress(address)}
                  </span>
                </div>

                {/* Permanent Disconnect Button */}
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Disconnect
                </button>
              </>
            ) : (
              <CustomConnectButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
