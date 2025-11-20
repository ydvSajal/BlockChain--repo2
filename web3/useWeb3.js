import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Get balance
  const getBalance = useCallback(async (address) => {
    if (!provider || !address) return '0';
    
    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      return balanceInEth;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }, [provider]);

  // Check network
  const checkNetwork = useCallback(async () => {
    if (!isMetaMaskInstalled()) return false;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === SEPOLIA_CHAIN_ID;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }, []);

  // Switch to Sepolia
  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to use this app');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      toast.success('Switched to Sepolia network');
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK],
          });
          toast.success('Sepolia network added and switched');
          return true;
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          toast.error('Failed to add Sepolia network');
          return false;
        }
      } else {
        console.error('Error switching to Sepolia:', switchError);
        toast.error('Failed to switch to Sepolia network');
        return false;
      }
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to use this app');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // Check if on correct network first
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        const switched = await switchToSepolia();
        if (!switched) return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);

        // Initialize provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Get balance
        const balance = await getBalance(account);
        setBalance(balance);

        // Get chain ID
        const network = await provider.getNetwork();
        setChainId(network.chainId);

        toast.success('Wallet connected successfully');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection request rejected');
      } else {
        toast.error('Failed to connect wallet');
      }
    }
  }, [checkNetwork, switchToSepolia, getBalance]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance('0');
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        getBalance(accounts[0]).then(setBalance);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [account, disconnect, getBalance]);

  // Handle chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleChainChanged = (chainId) => {
      const chainIdDecimal = parseInt(chainId, 16);
      setChainId(chainIdDecimal);

      if (chainIdDecimal !== SEPOLIA_CHAIN_ID_DECIMAL) {
        toast.error('Please switch to Sepolia network');
        switchToSepolia();
      } else {
        // Reload balance when network changes
        if (account) {
          getBalance(account).then(setBalance);
        }
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, getBalance, switchToSepolia]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          setIsConnected(true);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          const balance = await getBalance(account);
          setBalance(balance);

          const network = await provider.getNetwork();
          setChainId(network.chainId);

          // Check if on correct network
          if (network.chainId !== SEPOLIA_CHAIN_ID_DECIMAL) {
            toast.error('Please switch to Sepolia network');
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [getBalance]);

  return {
    account,
    balance,
    isConnected,
    provider,
    chainId,
    connectWallet,
    disconnect,
    getBalance,
    checkNetwork,
    switchToSepolia,
    isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID_DECIMAL,
  };
};

export default useWeb3;
