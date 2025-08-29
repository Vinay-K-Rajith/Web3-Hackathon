import { useState, useEffect } from 'react';
import { walletManager, type WalletState, userSession } from '@/lib/wallet';

export function useWallet() {
  const [state, setState] = useState<WalletState>(walletManager.getState());

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setState);
    return unsubscribe;
  }, []);

  // Add a check to ensure wallet is properly connected for transactions
  const isProperlyConnected = () => {
    return state.isConnected && userSession.isUserSignedIn();
  };

  const connect = async () => {
    try {
      await walletManager.connect();
      // Verify the connection worked
      if (!userSession.isUserSignedIn()) {
        throw new Error('Wallet connection failed - userSession not signed in');
      }
      console.log('✅ Wallet properly connected');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    walletManager.disconnect();
    console.log('🔌 Wallet disconnected');
  };

  const getBalance = async () => {
    try {
      return await walletManager.getBalance();
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  };

  return {
    ...state,
    isConnected: isProperlyConnected(), // Override with proper check
    connect,
    disconnect,
    getBalance,
  };
}
