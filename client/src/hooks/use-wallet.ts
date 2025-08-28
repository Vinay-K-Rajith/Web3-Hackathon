import { useState, useEffect } from 'react';
import { walletManager, type WalletState } from '@/lib/wallet';

export function useWallet() {
  const [state, setState] = useState<WalletState>(walletManager.getState());

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const connect = async () => {
    try {
      await walletManager.connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    walletManager.disconnect();
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
    connect,
    disconnect,
    getBalance,
  };
}
