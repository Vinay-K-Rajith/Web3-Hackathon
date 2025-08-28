export interface SupplyChainStage {
  id: string;
  stage: 'farm' | 'processing' | 'distribution' | 'retail';
  location: string;
  company: string;
  status: 'completed' | 'in_progress' | 'pending';
  timestamp: Date;
  transactionHash?: string;
  qualityMetrics?: {
    temperature?: number;
    humidity?: number;
    pH?: number;
    [key: string]: any;
  };
}

export interface ProductTrace {
  productId: string;
  productName: string;
  blockchainId: string;
  currentStage: string;
  stages: SupplyChainStage[];
  certifications: string[];
  farmLocation: string;
  createdAt: Date;
}

export interface QualityMetrics {
  temperature: number;
  humidity: number;
  pH: number;
  timestamp: Date;
  location: string;
  verifiedBy: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockHeight: number;
  gasUsed: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  type: 'product_registration' | 'quality_verification' | 'supply_chain_update';
}

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';
  balance: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeFarms: number;
  verifiedTransactions: number;
  supplyChainSteps: number;
}
