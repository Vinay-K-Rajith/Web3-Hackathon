import { 
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct,
  type SupplyChainStep,
  type InsertSupplyChainStep,
  type QualityVerification,
  type InsertQualityVerification,
  type BlockchainTransaction,
  type InsertBlockchainTransaction
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: string, walletAddress: string): Promise<User | undefined>;

  // Product operations
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBlockchainId(blockchainId: string): Promise<Product | undefined>;
  getProducts(farmerId?: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;

  // Supply chain operations
  getSupplyChainSteps(productId: string): Promise<SupplyChainStep[]>;
  createSupplyChainStep(step: InsertSupplyChainStep): Promise<SupplyChainStep>;
  updateSupplyChainStep(id: string, updates: Partial<SupplyChainStep>): Promise<SupplyChainStep | undefined>;

  // Quality verification operations
  getQualityVerifications(productId: string): Promise<QualityVerification[]>;
  createQualityVerification(verification: InsertQualityVerification): Promise<QualityVerification>;

  // Blockchain transaction operations
  getBlockchainTransaction(hash: string): Promise<BlockchainTransaction | undefined>;
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  getTransactionsByType(type: string): Promise<BlockchainTransaction[]>;

  // Analytics
  getStats(): Promise<{
    totalProducts: number;
    activeFarms: number;
    verifiedTransactions: number;
    supplyChainSteps: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private supplyChainSteps: Map<string, SupplyChainStep> = new Map();
  private qualityVerifications: Map<string, QualityVerification> = new Map();
  private blockchainTransactions: Map<string, BlockchainTransaction> = new Map();

  constructor() {
    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleUser: User = {
      id: "user-1",
      username: "greenfarm",
      password: "hashed_password",
      walletAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.principal",
    };
    this.users.set(sampleUser.id, sampleUser);

    const sampleProduct: Product = {
      id: "product-1",
      name: "Organic Tomatoes",
      productType: "Vegetables",
      quantity: 100,
      farmLocation: "Green Valley Farms, California",
      certifications: ["Organic", "Non-GMO"],
      blockchainId: "TOM001",
      transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      farmerId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(sampleProduct.id, sampleProduct);

    const sampleSteps: SupplyChainStep[] = [
      {
        id: "step-1",
        productId: "product-1",
        stage: "farm",
        location: "Green Valley Farms",
        company: "Green Valley Farms",
        status: "completed",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
        qualityMetrics: { temperature: 4, humidity: 65, pH: 6.2 },
      },
      {
        id: "step-2",
        productId: "product-1",
        stage: "processing",
        location: "FreshPack Co.",
        company: "FreshPack Co.",
        status: "in_progress",
        timestamp: new Date(),
        transactionHash: null,
        qualityMetrics: null,
      },
      {
        id: "step-3",
        productId: "product-1",
        stage: "distribution",
        location: "LogiCorp",
        company: "LogiCorp",
        status: "pending",
        timestamp: new Date(),
        transactionHash: null,
        qualityMetrics: null,
      },
      {
        id: "step-4",
        productId: "product-1",
        stage: "retail",
        location: "Fresh Market",
        company: "Fresh Market",
        status: "pending",
        timestamp: new Date(),
        transactionHash: null,
        qualityMetrics: null,
      },
    ];

    sampleSteps.forEach(step => this.supplyChainSteps.set(step.id, step));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, walletAddress: insertUser.walletAddress || null };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(id: string, walletAddress: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, walletAddress };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByBlockchainId(blockchainId: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.blockchainId === blockchainId);
  }

  async getProducts(farmerId?: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return farmerId ? products.filter(p => p.farmerId === farmerId) : products;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: now, 
      updatedAt: now,
      certifications: insertProduct.certifications || [],
      blockchainId: insertProduct.blockchainId || null,
      transactionHash: insertProduct.transactionHash || null,
      farmerId: insertProduct.farmerId || null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  async getSupplyChainSteps(productId: string): Promise<SupplyChainStep[]> {
    return Array.from(this.supplyChainSteps.values())
      .filter(step => step.productId === productId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createSupplyChainStep(insertStep: InsertSupplyChainStep): Promise<SupplyChainStep> {
    const id = randomUUID();
    const step: SupplyChainStep = { 
      ...insertStep, 
      id, 
      timestamp: new Date(),
      transactionHash: insertStep.transactionHash || null,
      qualityMetrics: insertStep.qualityMetrics || null
    };
    this.supplyChainSteps.set(id, step);
    return step;
  }

  async updateSupplyChainStep(id: string, updates: Partial<SupplyChainStep>): Promise<SupplyChainStep | undefined> {
    const step = this.supplyChainSteps.get(id);
    if (step) {
      const updatedStep = { ...step, ...updates };
      this.supplyChainSteps.set(id, updatedStep);
      return updatedStep;
    }
    return undefined;
  }

  async getQualityVerifications(productId: string): Promise<QualityVerification[]> {
    return Array.from(this.qualityVerifications.values())
      .filter(verification => verification.productId === productId);
  }

  async createQualityVerification(insertVerification: InsertQualityVerification): Promise<QualityVerification> {
    const id = randomUUID();
    const verification: QualityVerification = { 
      ...insertVerification, 
      id, 
      createdAt: new Date(),
      verificationData: insertVerification.verificationData || null,
      blockchainProof: insertVerification.blockchainProof || null
    };
    this.qualityVerifications.set(id, verification);
    return verification;
  }

  async getBlockchainTransaction(hash: string): Promise<BlockchainTransaction | undefined> {
    return this.blockchainTransactions.get(hash);
  }

  async createBlockchainTransaction(insertTransaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const id = randomUUID();
    const transaction: BlockchainTransaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date(),
      blockHeight: insertTransaction.blockHeight || null,
      gasUsed: insertTransaction.gasUsed || null,
      relatedId: insertTransaction.relatedId || null
    };
    this.blockchainTransactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByType(type: string): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values())
      .filter(tx => tx.type === type);
  }

  async getStats(): Promise<{
    totalProducts: number;
    activeFarms: number;
    verifiedTransactions: number;
    supplyChainSteps: number;
  }> {
    const uniqueFarmers = new Set(Array.from(this.products.values()).map(p => p.farmerId).filter(Boolean));
    const confirmedTransactions = Array.from(this.blockchainTransactions.values())
      .filter(tx => tx.status === 'confirmed');

    return {
      totalProducts: this.products.size,
      activeFarms: uniqueFarmers.size,
      verifiedTransactions: confirmedTransactions.length,
      supplyChainSteps: this.supplyChainSteps.size,
    };
  }
}

export const storage = new MemStorage();
