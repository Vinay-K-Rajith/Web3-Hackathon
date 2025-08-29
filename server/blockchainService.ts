import {
  STACKS_MAINNET,
  STACKS_TESTNET
} from '@stacks/network';
import {
  fetchCallReadOnlyFunction,
  uintCV
} from '@stacks/transactions';

// Use environment variables for server
const network = process.env.NODE_ENV === 'production' ? STACKS_MAINNET : STACKS_TESTNET;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST3R2YBNK8EVESRVQN7KXQ8CBSBTGY3FSXAJZQAK';
const CONTRACT_NAME = process.env.CONTRACT_NAME || 'agri-supply-chain';

export interface ProductRegistrationData {
  name: string;
  productType: string;
  quantity: number;
  farmLocation: string;
  certifications?: string[];
}

export interface BlockchainResult {
  productId: string;
  transactionHash: string;
  blockHeight?: number;
}

// Server-side functions don't actually submit transactions - they just validate and return mock data
// Real transaction submission happens on the client side
export async function registerProductOnBlockchain(productData: ProductRegistrationData): Promise<BlockchainResult> {
  try {
    // Server-side validation
    if (!productData.name || productData.name.length === 0 || productData.name.length > 100) {
      throw new Error('Product name must be between 1 and 100 characters');
    }
    if (!productData.productType || productData.productType.length === 0 || productData.productType.length > 50) {
      throw new Error('Product type must be between 1 and 50 characters');
    }
    if (!productData.quantity || productData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (!productData.farmLocation || productData.farmLocation.length === 0 || productData.farmLocation.length > 200) {
      throw new Error('Farm location must be between 1 and 200 characters');
    }

    // Generate a mock response for server-side calls
    const productId = `${productData.productType.toUpperCase()}_${Date.now()}`;
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      productId,
      transactionHash: mockTxHash,
    };
  } catch (error) {
    console.error('Failed to validate product data:', error);
    throw error;
  }
}

export async function verifyProductOnBlockchain(productId: string): Promise<any> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-product',
      functionArgs: [uintCV(parseInt(productId))],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (!result) {
      throw new Error('Product not found on blockchain');
    }

    return result;
  } catch (error) {
    console.error('Failed to verify product on blockchain:', error);
    throw new Error('Failed to verify product on blockchain');
  }
}
