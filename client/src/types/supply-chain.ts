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

// Enhanced Product Types
export interface Product {
  id: string;
  name: string;
  type: string;
  origin: string;
  farmer: string;
  harvestDate: string;
  status: 'active' | 'inactive' | 'verified' | 'deactivated';
  certifications: string[];
  currentLocation: string;
  supplyChainSteps: SupplyChainStep[];
  qualityMetrics: QualityMetric[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyChainStep {
  id: string;
  productId: string;
  stage: string;
  location: string;
  timestamp: string;
  company: string;
  status: 'pending' | 'completed' | 'verified';
  metadata?: Record<string, any>;
  stepNumber: number;
}

export interface QualityMetric {
  id: string;
  productId: string;
  metric: string;
  value: string;
  unit: string;
  timestamp: string;
  verifiedBy: string;
  certificationType: string;
}

// Farmer & Authorization Types
export interface Farmer {
  address: string;
  name: string;
  location: string;
  authorized: boolean;
  productCount: number;
  joinedDate: string;
  certifications: string[];
}

// Blockchain Operation Types
export interface BlockchainResult {
  productId: string;
  transactionHash: string;
  blockHeight?: number;
}

export interface QualityVerification {
  id: string;
  productId: string;
  certificationType: string;
  verificationData: any;
  timestamp: string;
  verifiedBy: string;
  status: 'pending' | 'verified' | 'rejected';
}

// API Response Types
export interface ProductResponse {
  product: Product;
  supplyChain: SupplyChainStep[];
  qualityVerifications: QualityVerification[];
}

export interface FarmerProductsResponse {
  products: Product[];
  totalCount: number;
}

// Form Data Types
export interface ProductRegistrationData {
  name: string;
  productType: string;
  origin?: string;
  farmer?: string;
  harvestDate?: string;
  quantity?: number;
  farmLocation?: string;
  certifications?: string[];
  qualityMetrics?: Array<{
    metric: string;
    value: string;
    unit: string;
  }>;
}

export interface SupplyChainStepData {
  productId: string;
  stage: string;
  location: string;
  company: string;
  metadata?: Record<string, any>;
}

export interface QualityVerificationData {
  productId: string;
  certificationType: string;
  verificationData: any;
}

// Batch Operation Types
export interface BatchCertificationData {
  productIds: string[];
  certificationType: string;
  certificationData: any;
}

// Status Update Types
export interface ProductStatusUpdate {
  productId: string;
  newStatus: 'active' | 'inactive' | 'verified' | 'deactivated';
  reason?: string;
}

// Ownership Transfer Types
export interface OwnershipTransfer {
  productId: string;
  newOwner: string;
  transferReason: string;
}
