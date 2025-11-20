import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../web3/useWeb3';
import toast from 'react-hot-toast';

const WalletConnect = () => {
  const {
    account,
    balance,
    isConnected,
    connectWallet,
    disconnect,
    isCorrectNetwork,
    switchToSepolia,
  } = useWeb3();

  const [isConnecting, setIsConnecting] = useState(false);

  // Format address to short form (0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format balance to 4 decimal places
  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  // Check network on connection
  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      toast.error('Please switch to Sepolia network');
    }
  }, [isConnected, isCorrectNetwork]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={connectWallet}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-3 text-lg"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Connect MetaMask
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg border-2 border-green-500/50 shadow-green-500/20">
      <div className="flex items-center justify-between gap-4">
        {/* Connected Indicator & Address */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Connected</span>
            <span className="text-white font-mono font-semibold text-sm">
              {formatAddress(account)}
            </span>
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex flex-col items-end">
          {!isCorrectNetwork ? (
            <>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-1 animate-pulse">
                Wrong Network
              </span>
              <button
                onClick={switchToSepolia}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg transition-all duration-200 text-xs"
              >
                Switch to Sepolia
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-400 font-medium">Balance</span>
              <span className="text-white font-bold text-sm">
                {formatBalance(balance)} ETH
              </span>
            </>
          )}
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm border border-red-500/30"
          title="Disconnect Wallet"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;
