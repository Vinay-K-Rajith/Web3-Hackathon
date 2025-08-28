import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { Person } from '@stacks/profile';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  profile: Person | null;
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
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        this.updateState({
          isConnected: true,
          address: userData.profile.stxAddress.testnet,
          profile: userData.profile,
        });
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      this.updateState({
        isConnected: true,
        address: userData.profile.stxAddress.testnet,
        profile: userData.profile,
      });
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
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: {
          name: 'AgriChain',
          icon: window.location.origin + '/logo.svg',
        },
        redirectTo: '/',
        onFinish: (authData) => {
          this.updateState({
            isConnected: true,
            address: authData.userSession.loadUserData().profile.stxAddress.testnet,
            profile: authData.userSession.loadUserData().profile,
          });
          resolve();
        },
        onCancel: () => {
          reject(new Error('User cancelled wallet connection'));
        },
        userSession,
      });
    });
  }

  public disconnect(): void {
    userSession.signUserOut();
    this.updateState({
      isConnected: false,
      address: null,
      profile: null,
    });
  }

  public async signTransaction(transaction: any): Promise<string> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected');
    }
    
    // This would use @stacks/connect to sign transactions
    // Implementation depends on the specific transaction type
    throw new Error('Transaction signing not implemented');
  }

  public async getBalance(): Promise<number> {
    if (!this.state.address) {
      return 0;
    }
    
    // This would fetch the STX balance from the Stacks API
    // For now, return a mock balance
    return 1000;
  }
}

export const walletManager = new WalletManager();
