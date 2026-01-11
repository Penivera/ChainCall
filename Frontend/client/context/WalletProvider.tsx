import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useRef, useCallback } from 'react';
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

type NetworkType = WalletAdapterNetwork.Devnet | WalletAdapterNetwork.Mainnet;

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  isLoading: boolean;
  rpcUrl: string;
  setRpcUrl: (url: string) => void;
  network: NetworkType;
  switchNetwork: (network: NetworkType) => void;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  hasAnyWallet: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletContextProvider({ 
  children, 
  network, 
  switchNetwork,
  endpoint,
  setCustomRpc
}: { 
  children: ReactNode;
  network: NetworkType;
  switchNetwork: (n: NetworkType) => void;
  endpoint: string;
  setCustomRpc: (url: string) => void;
}) {
  const { 
    publicKey, 
    wallet,
    connected, 
    connecting,
    disconnect,
    connect,
    select, 
    signTransaction,
    signAllTransactions,
    wallets
  } = useSolanaWallet();

  const { setVisible } = useWalletModal();
  const isMounted = useRef(false);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      if (!connected && wallet) {
        select(null);
      }
      isMounted.current = true;
    }
  }, [connected, wallet, select]);

  useEffect(() => {
    if (wallet && !connected && !connecting && isMounted.current) {
      const readyState = wallet.adapter.readyState;
      
      if (readyState === 'NotDetected' || readyState === 'Unsupported') {
        select(null);
        return;
      }

      if (readyState === 'Installed' || readyState === 'Loadable') {
        if (isConnectingRef.current) return;
        
        const timer = setTimeout(() => {
          isConnectingRef.current = true;
          connect()
            .catch((error) => {
              console.error('Connection failed:', error);
            })
            .finally(() => {
              isConnectingRef.current = false;
            });
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [wallet, connected, connecting, connect, select]);

  const hasAnyWallet = useMemo(() => {
    return wallets.some(w => w.readyState === 'Installed');
  }, [wallets]);

  const walletAddress = useMemo(() => {
    if (!publicKey) return null;
    const address = publicKey.toBase58();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, [publicKey]);

  const connectWallet = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      select(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [disconnect, select]);

  const value: WalletContextType = {
    isConnected: connected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    isLoading: connecting,
    rpcUrl: endpoint,
    setRpcUrl: setCustomRpc,
    network,
    switchNetwork,
    signTransaction: signTransaction!,
    signAllTransactions: signAllTransactions!,
    hasAnyWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<NetworkType>(WalletAdapterNetwork.Devnet);
  const [customRpcUrl, setCustomRpcUrl] = useState<string>('');

  const endpoint = useMemo(() => {
    if (customRpcUrl) {
      return customRpcUrl;
    }
    if (network === WalletAdapterNetwork.Mainnet) {
      return "https://api.mainnet-beta.solana.com";
    }
    return clusterApiUrl(network);
  }, [network, customRpcUrl]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <WalletContextProvider 
            network={network} 
            switchNetwork={setNetwork}
            endpoint={endpoint}
            setCustomRpc={setCustomRpcUrl}
          >
            {children}
          </WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}