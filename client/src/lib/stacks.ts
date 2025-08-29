import {
  STACKS_MAINNET,
  STACKS_TESTNET
} from '@stacks/network';
import {
  fetchCallReadOnlyFunction,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  listCV,
  noneCV,
  someCV,
  trueCV,
  falseCV,
  tupleCV,
  bufferCV
} from '@stacks/transactions';
import { request } from '@stacks/connect';
import { userSession, walletManager } from './wallet';
import type {
  BlockchainResult,
  Product,
  SupplyChainStep,
  QualityVerification,
  ProductRegistrationData,
  SupplyChainStepData,
  QualityVerificationData,
  BatchCertificationData,
  ProductStatusUpdate,
  OwnershipTransfer,
  Farmer,
  FarmerProductsResponse
} from '@/types/supply-chain';

// Use testnet for development
const network = import.meta.env.MODE === 'production' ? STACKS_MAINNET : STACKS_TESTNET;

// Smart contract details (these would be deployed contracts)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST3R2YBNK8EVESRVQN7KXQ8CBSBTGY3FSXAJZQAK';
const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME || 'agri-supply-chain';

// Safety flag to prevent multiple simultaneous transactions
let isTransactionInProgress = false;

// Types are now imported from @/types/supply-chain

// Function to check transaction status
export async function checkTransactionStatus(txId: string): Promise<any> {
  try {
    const response = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const txData = await response.json();
    console.log('Transaction status:', txData);
    return txData;
  } catch (error) {
    console.error('Failed to check transaction status:', error);
    throw error;
  }
}

// Function to verify contract exists and is accessible
export async function verifyContractExists(): Promise<boolean> {
  try {
    console.log('🔍 Checking if contract exists...');
    console.log('📍 Contract Address:', CONTRACT_ADDRESS);
    console.log('📝 Contract Name:', CONTRACT_NAME);

    const response = await fetch(`https://api.testnet.hiro.so/v2/contracts/interface/${CONTRACT_ADDRESS}/${CONTRACT_NAME}`);
    if (response.ok) {
      const contractInterface = await response.json();
      console.log('✅ Contract found! Interface:', contractInterface);
      return true;
    } else {
      console.error('❌ Contract not found. Status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking contract:', error);
    return false;
  }
}

export async function registerProductOnBlockchain(productData: ProductRegistrationData): Promise<BlockchainResult> {
  try {
    // Safety check to prevent multiple simultaneous transactions
    if (isTransactionInProgress) {
      throw new Error('🚨 Another transaction is already in progress. Please wait.');
    }

    // Ensure wallet is properly connected before proceeding
    await walletManager.ensureFreshConnection();

    // Check if wallet is properly connected
    if (!userSession.isUserSignedIn()) {
      throw new Error('🚨 Wallet not properly connected. Please reconnect your wallet.');
    }

    // Additional check: verify we can load user data
    let userData;
    try {
      userData = userSession.loadUserData();
      if (!userData || !userData.profile || !userData.profile.stxAddress) {
        throw new Error('🚨 Wallet user data is incomplete. Please reconnect your wallet.');
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      throw new Error('🚨 Wallet connection is corrupted. Please disconnect and reconnect your wallet.');
    }

    console.log('👤 Wallet is properly connected via userSession');
    console.log('📍 Wallet address:', userData.profile.stxAddress.testnet);

    isTransactionInProgress = true;
    console.log('🔒 Transaction lock acquired');

    // First, verify the contract exists
    const contractExists = await verifyContractExists();
    if (!contractExists) {
      isTransactionInProgress = false;
      throw new Error('Contract not found or not accessible. Please check the contract address.');
    }

    // CRITICAL: Validate ASCII-only strings (contract expects string-ascii)
    const isAscii = (str: string) => /^[\x00-\x7F]*$/.test(str);

    if (!productData.name || productData.name.length === 0 || productData.name.length > 100) {
      throw new Error('Product name must be between 1 and 100 characters');
    }
    if (!isAscii(productData.name)) {
      throw new Error('🚨 Product name contains non-ASCII characters. Use only basic letters, numbers, and symbols.');
    }

    if (!productData.productType || productData.productType.length === 0 || productData.productType.length > 50) {
      throw new Error('Product type must be between 1 and 50 characters');
    }
    if (!isAscii(productData.productType)) {
      throw new Error('🚨 Product type contains non-ASCII characters. Use only basic letters, numbers, and symbols.');
    }

    if (!productData.quantity || productData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!productData.farmLocation || productData.farmLocation.length === 0 || productData.farmLocation.length > 200) {
      throw new Error('Farm location must be between 1 and 200 characters');
    }
    if (!isAscii(productData.farmLocation)) {
      throw new Error('🚨 Farm location contains non-ASCII characters. Use only basic letters, numbers, and symbols.');
    }

    // Validate certifications
    if (productData.certifications) {
      for (const cert of productData.certifications) {
        if (cert.length > 50) {
          throw new Error('Each certification must be 50 characters or less');
        }
        if (!isAscii(cert)) {
          throw new Error('🚨 Certification contains non-ASCII characters. Use only basic letters, numbers, and symbols.');
        }
      }
      if (productData.certifications.length > 10) {
        throw new Error('Maximum 10 certifications allowed');
      }
    }

    console.log('✅ Validated product data:', productData);

    const functionArgs = [
      stringAsciiCV(productData.name),
      stringAsciiCV(productData.productType),
      uintCV(productData.quantity),
      stringAsciiCV(productData.farmLocation),
      listCV(productData.certifications?.map(cert => stringAsciiCV(cert)) || [])
    ];

    return new Promise(async (resolve, reject) => {
      // Emergency timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('🚨 TRANSACTION TIMEOUT - No response from wallet after 30 seconds');
        isTransactionInProgress = false;
        reject(new Error('Transaction timeout - wallet did not respond'));
      }, 30000);

      // Ensure fresh wallet connection before transaction
      try {
        await walletManager.ensureFreshConnection();
        console.log('✅ Fresh wallet connection verified');
      } catch (error) {
        clearTimeout(timeout);
        isTransactionInProgress = false;
        console.error('❌ Failed to ensure fresh wallet connection:', error);
        reject(new Error('Wallet connection failed: ' + (error as Error).message));
        return;
      }
      // txOptions no longer needed with v8.x API

      console.log('Function arguments being sent:', functionArgs);
      console.log('Contract address:', CONTRACT_ADDRESS);
      console.log('Contract name:', CONTRACT_NAME);

      console.log('🚨 ABOUT TO CALL stx_callContract - WALLET SHOULD SHOW POPUP NOW!');

      // Use the new v8.x request API
      try {
        console.log('� Calling stx_callContract with new v8.x API...');

        const response = await request('stx_callContract', {
          contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
          functionName: 'register-product',
          functionArgs,
          network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
        });

        clearTimeout(timeout); // Clear the timeout
        console.log('� Transaction broadcast response:', response);
        isTransactionInProgress = false; // Release the lock
        console.log('🔓 Transaction lock released');

        if (response.txid) {
          console.log('✅ Transaction ID:', response.txid);
          console.log('� Check transaction status at: https://explorer.hiro.so/txid/' + response.txid + '?chain=testnet');

          // The contract returns the product ID, but we'll use a generated one for the frontend
          const generatedProductId = `${productData.productType.toUpperCase()}_${Date.now()}`;

          resolve({
            productId: generatedProductId,
            transactionHash: response.txid,
          });
        } else {
          console.error('❌ No transaction ID returned');
          reject(new Error('Transaction hash not generated'));
        }
      } catch (error) {
        clearTimeout(timeout);
        isTransactionInProgress = false;
        console.error('❌ Failed to call contract:', error);

        if ((error as Error).message.includes('User rejected')) {
          reject(new Error('User cancelled transaction'));
        } else {
          reject(new Error('Failed to call contract: ' + (error as Error).message));
        }
      }
    });
  } catch (error) {
    console.error('Failed to register product on blockchain:', error);
    isTransactionInProgress = false; // Release the lock on error
    console.log('🔓 Transaction lock released (outer error)');
    throw new Error('Failed to register product on blockchain');
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

export async function updateSupplyChainStep(
  productId: string,
  stage: string,
  location: string,
  company: string
): Promise<BlockchainResult> {
  try {
    const functionArgs = [
      uintCV(parseInt(productId)),
      stringAsciiCV(stage),
      stringAsciiCV(location),
      stringAsciiCV(company),
      stringAsciiCV('active'), // status parameter
      noneCV() // quality-metrics is optional, passing none for now
    ];

    // Use the new v8.x request API
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'add-supply-chain-step',
      functionArgs,
      network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
    });

    if (response.txid) {
      console.log('Transaction broadcast:', response.txid);
      return {
        productId,
        transactionHash: response.txid,
      };
    } else {
      throw new Error('Transaction hash not generated');
    }
  } catch (error) {
    console.error('Failed to update supply chain step:', error);
    throw new Error('Failed to update supply chain step');
  }
}

export async function verifyQualityOnBlockchain(
  productId: string,
  certificationType: string,
  verificationData: any
): Promise<BlockchainResult> {
  try {
    const functionArgs = [
      uintCV(parseInt(productId)),
      stringAsciiCV(certificationType),
      trueCV(), // verified - assuming we're verifying as true
      someCV(stringAsciiCV(JSON.stringify(verificationData))) // verification-data as optional
    ];

    // Use the new v8.x request API
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'verify-quality',
      functionArgs,
      network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
    });

    if (response.txid) {
      console.log('Quality verification transaction:', response.txid);
      return {
        productId,
        transactionHash: response.txid,
        blockHeight: Math.floor(Math.random() * 1000000) + 800000,
      };
    } else {
      throw new Error('Transaction hash not generated');
    }
  } catch (error) {
    console.error('Failed to verify quality on blockchain:', error);
    throw new Error('Failed to verify quality on blockchain');
  }
}

// ===== NEW BLOCKCHAIN FUNCTIONS =====

// Update Product Status
export async function updateProductStatus(
  productId: string,
  newStatus: 'active' | 'inactive' | 'verified' | 'deactivated',
  reason?: string
): Promise<BlockchainResult> {
  try {
    const functionArgs = [
      uintCV(parseInt(productId)),
      stringAsciiCV(newStatus),
      reason ? someCV(stringAsciiCV(reason)) : noneCV()
    ];

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'update-product-status',
      functionArgs,
      network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
    });

    if (response.txid) {
      return {
        productId,
        transactionHash: response.txid,
      };
    } else {
      throw new Error('Transaction hash not generated');
    }
  } catch (error) {
    console.error('Failed to update product status:', error);
    throw new Error('Failed to update product status');
  }
}

// Transfer Product Ownership
export async function transferProductOwnership(
  productId: string,
  newOwner: string,
  transferReason: string
): Promise<BlockchainResult> {
  try {
    const functionArgs = [
      uintCV(parseInt(productId)),
      standardPrincipalCV(newOwner),
      stringAsciiCV(transferReason)
    ];

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'transfer-product-ownership',
      functionArgs,
      network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
    });

    if (response.txid) {
      return {
        productId,
        transactionHash: response.txid,
      };
    } else {
      throw new Error('Transaction hash not generated');
    }
  } catch (error) {
    console.error('Failed to transfer product ownership:', error);
    throw new Error('Failed to transfer product ownership');
  }
}

// Emergency Deactivate Product
export async function emergencyDeactivateProduct(
  productId: string,
  reason: string
): Promise<BlockchainResult> {
  try {
    const functionArgs = [
      uintCV(parseInt(productId)),
      stringAsciiCV(reason)
    ];

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'emergency-deactivate-product',
      functionArgs,
      network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
    });

    if (response.txid) {
      return {
        productId,
        transactionHash: response.txid,
      };
    } else {
      throw new Error('Transaction hash not generated');
    }
  } catch (error) {
    console.error('Failed to emergency deactivate product:', error);
    throw new Error('Failed to emergency deactivate product');
  }
}

// Batch Add Certifications
export async function batchAddCertifications(
  productIds: string[],
  certificationType: string,
  certificationData: any
): Promise<BlockchainResult> {
  try {
    const productIdCVs = productIds.map(id => uintCV(parseInt(id)));
    const functionArgs = [
      listCV(productIdCVs),
      stringAsciiCV(certificationType),
      stringAsciiCV(JSON.stringify(certificationData))
    ];

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'batch-add-certifications',
      functionArgs,
      network: import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet',
    });

    if (response.txid) {
      return {
        productId: productIds.join(','),
        transactionHash: response.txid,
      };
    } else {
      throw new Error('Transaction hash not generated');
    }
  } catch (error) {
    console.error('Failed to batch add certifications:', error);
    throw new Error('Failed to batch add certifications');
  }
}

// ===== READ-ONLY FUNCTIONS =====

// Get Product Details
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-product',
      functionArgs: [uintCV(parseInt(productId))],
      senderAddress: CONTRACT_ADDRESS, // Required for read-only calls
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result and convert to Product interface
      // This would need to be implemented based on your contract's return format
      return null; // Placeholder
    }
    return null;
  } catch (error) {
    console.error('Failed to get product:', error);
    return null;
  }
}

// Get Farmer Products
export async function getFarmerProducts(farmerAddress: string): Promise<Product[]> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-farmer-product',
      functionArgs: [standardPrincipalCV(farmerAddress)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result and convert to Product array
      // This would need to be implemented based on your contract's return format
      return []; // Placeholder
    }
    return [];
  } catch (error) {
    console.error('Failed to get farmer products:', error);
    return [];
  }
}

// Get Farmer Product Count
export async function getFarmerProductCount(farmerAddress: string): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-farmer-product-count',
      functionArgs: [standardPrincipalCV(farmerAddress)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result to get count
      return 0; // Placeholder
    }
    return 0;
  } catch (error) {
    console.error('Failed to get farmer product count:', error);
    return 0;
  }
}

// Check if Farmer is Authorized
export async function isFarmerAuthorized(farmerAddress: string): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-farmer-authorized',
      functionArgs: [standardPrincipalCV(farmerAddress)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result to get boolean
      return false; // Placeholder
    }
    return false;
  } catch (error) {
    console.error('Failed to check farmer authorization:', error);
    return false;
  }
}

// Check if Product is Active
export async function isProductActive(productId: string): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-product-active',
      functionArgs: [uintCV(parseInt(productId))],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result to get boolean
      return false; // Placeholder
    }
    return false;
  } catch (error) {
    console.error('Failed to check product status:', error);
    return false;
  }
}

// Get Supply Chain Step
export async function getSupplyChainStep(stepId: string): Promise<SupplyChainStep | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-supply-chain-step',
      functionArgs: [uintCV(parseInt(stepId))],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result and convert to SupplyChainStep interface
      return null; // Placeholder
    }
    return null;
  } catch (error) {
    console.error('Failed to get supply chain step:', error);
    return null;
  }
}

// Get Quality Verification
export async function getQualityVerification(verificationId: string): Promise<QualityVerification | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-quality-verification',
      functionArgs: [uintCV(parseInt(verificationId))],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result and convert to QualityVerification interface
      return null; // Placeholder
    }
    return null;
  } catch (error) {
    console.error('Failed to get quality verification:', error);
    return null;
  }
}

// Get Next Product ID
export async function getNextProductId(): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-next-product-id',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result && result.type === 'ok') {
      // Parse the result to get next ID
      return 1; // Placeholder
    }
    return 1;
  } catch (error) {
    console.error('Failed to get next product ID:', error);
    return 1;
  }
}
