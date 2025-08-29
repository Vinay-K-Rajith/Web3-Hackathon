import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import { Person } from '@stacks/profile';

// No longer needed in v8.x - using new connect API
// Legacy userSession for backward compatibility (cached in localStorage)
export const userSession = {
  isUserSignedIn: () => isConnected(),
  loadUserData: () => {
    const data = getLocalStorage();
    if (!data?.addresses?.stx?.[0]) {
      throw new Error('No user data available');
    }
    return {
      profile: {
        stxAddress: {
          testnet: data.addresses.stx[0].address,
          mainnet: data.addresses.stx[0].address,
        }
      }
    };
  },
  signUserOut: () => disconnect(),
  isSignInPending: () => false,
  handlePendingSignIn: () => Promise.resolve(null)
};

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  profile: Person | null; // Keep for backward compatibility, but will be null in v8.x
}

export class WalletManager {
  private listeners: Array<(state: WalletState) => void> = [];
  private state: WalletState = {
    isConnected: false,
    address: null,
    profile: null,
  };

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    // Check if user is already connected via localStorage
    if (isConnected()) {
      try {
        const data = getLocalStorage();
        if (data?.addresses?.stx?.[0]) {
          this.updateState({
            isConnected: true,
            address: data.addresses.stx[0].address,
            profile: null, // Profile not available in v8.x
          });
        }
      } catch (error) {
        console.warn('Failed to load wallet data from localStorage:', error);
      }
    }
  }

  private updateState(newState: Partial<WalletState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): WalletState {
    return this.state;
  }

  public subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async connect(): Promise<void> {
    try {
      console.log('🔗 Connecting wallet using new v8.x API...');
      await connect(); // This stores address in localStorage

      // In v8.x, connect() stores address in localStorage
      // Check localStorage for the stored address
      const data = getLocalStorage();
      const stxAddress = data?.addresses?.stx?.[0]?.address;

      if (stxAddress) {
        this.updateState({
          isConnected: true,
          address: stxAddress,
          profile: null, // Profile not available in v8.x
        });
        console.log('✅ Wallet connected successfully:', stxAddress);
      } else {
        throw new Error('No STX address returned from wallet');
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw new Error('Failed to connect wallet: ' + (error as Error).message);
    }
  }

  public async ensureFreshConnection(): Promise<void> {
    console.log('🔄 Ensuring fresh wallet connection for transaction...');

    if (!isConnected()) {
      console.log('❌ User not connected, forcing reconnection...');
      throw new Error('Wallet not connected - please connect your wallet first');
    }

    // Check if we can load user data from localStorage
    try {
      const data = getLocalStorage();
      const stxAddress = data?.addresses?.stx?.[0]?.address;

      console.log('✅ Wallet data available:', {
        hasData: !!data,
        hasAddress: !!stxAddress,
        address: stxAddress
      });

      if (!stxAddress) {
        throw new Error('No STX address found in wallet data');
      }

      // Update our internal state to match the localStorage data
      this.updateState({
        isConnected: true,
        address: stxAddress,
        profile: null, // Profile not available in v8.x
      });

    } catch (error) {
      console.error('❌ Failed to load user data from localStorage:', error);
      throw new Error('Wallet connection is corrupted - please disconnect and reconnect');
    }
  }

  public disconnect(): void {
    disconnect(); // Use v8.x disconnect function
    this.updateState({
      isConnected: false,
      address: null,
      profile: null,
    });
  }

  public async signTransaction(_transaction: any): Promise<string> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected');
    }

    // For now, we'll rely on the new v8.x request API to handle transaction signing
    // This method should not be called directly when using the new API
    console.warn('signTransaction called - this should be handled by the new request API');
    throw new Error('Use the new request API for transaction signing');
  }

  public async getBalance(): Promise<number> {
    if (!this.state.address) {
      return 0;
    }

    try {
      // Fetch real STX balance from Stacks API
      const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${this.state.address}/stx`);
      if (response.ok) {
        const data = await response.json();
        // Convert from microSTX to STX
        return parseInt(data.balance) / 1000000;
      } else {
        console.error('Failed to fetch balance:', response.status);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }
}

export const walletManager = new WalletManager();
