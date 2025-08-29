import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSupplyChainStepSchema, insertQualityVerificationSchema, insertBlockchainTransactionSchema, type Product as ServerProduct, type SupplyChainStep as ServerSupplyChainStep } from "@shared/schema";
import { registerProductOnBlockchain, verifyProductOnBlockchain } from "./blockchainService"; // Adjust the import based on your project structure

// Transform server-side Product to client-side format
function transformProductForClient(serverProduct: ServerProduct, supplyChainSteps: ServerSupplyChainStep[] = []) {
  return {
    id: serverProduct.id,
    name: serverProduct.name,
    type: serverProduct.productType,
    origin: serverProduct.farmLocation,
    farmer: serverProduct.farmerId || "Unknown",
    harvestDate: serverProduct.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    status: 'active' as const, // Default status
    certifications: serverProduct.certifications || [],
    currentLocation: serverProduct.farmLocation,
    supplyChainSteps: supplyChainSteps.map(step => ({
      id: step.id,
      productId: step.productId,
      stage: step.stage,
      location: step.location,
      timestamp: step.timestamp?.toISOString() || new Date().toISOString(),
      company: step.company,
      status: step.status as 'pending' | 'completed' | 'verified',
      metadata: step.qualityMetrics || {},
      stepNumber: 0 // Will be set based on order
    })),
    qualityMetrics: [], // Will be populated from quality verifications
    owner: serverProduct.farmerId || "Unknown",
    createdAt: serverProduct.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: serverProduct.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { farmerId } = req.query;

      // For testing purposes, return all products if no specific farmerId or if farmerId matches our sample data
      let products;
      const farmerIdStr = farmerId as string;
      if (!farmerId || farmerId === "user-1" || (typeof farmerIdStr === 'string' && farmerIdStr.length > 20)) {
        // If no farmerId specified or it looks like a wallet address, return all products
        products = await storage.getProducts();
      } else {
        products = await storage.getProducts(farmerIdStr);
      }

      // Transform products and include supply chain steps
      const transformedProducts = await Promise.all(
        products.map(async (product) => {
          const supplyChainSteps = await storage.getSupplyChainSteps(product.id);
          return transformProductForClient(product, supplyChainSteps);
        })
      );

      res.json(transformedProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const supplyChainSteps = await storage.getSupplyChainSteps(product.id);
      const transformedProduct = transformProductForClient(product, supplyChainSteps);

      res.json(transformedProduct);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/blockchain/:blockchainId", async (req, res) => {
    try {
      const product = await storage.getProductByBlockchainId(req.params.blockchainId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const supplyChainSteps = await storage.getSupplyChainSteps(product.id);
      const transformedProduct = transformProductForClient(product, supplyChainSteps);

      res.json(transformedProduct);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.post("/api/products/register", async (req, res) => {
    try {
      const productData = req.body;
      const result = await registerProductOnBlockchain(productData);
      // Fetch updated blockchain data
      const updatedProduct = await verifyProductOnBlockchain(result.transactionHash);
      res.json({ success: true, transactionHash: result.transactionHash, updatedProduct });
    } catch (error) {
      res.status(500).json({ error: "Failed to register product on blockchain" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await verifyProductOnBlockchain(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found on blockchain" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product from blockchain" });
    }
  });

  // Supply chain routes
  app.get("/api/products/:productId/supply-chain", async (req, res) => {
    try {
      const steps = await storage.getSupplyChainSteps(req.params.productId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supply chain steps" });
    }
  });

  app.post("/api/supply-chain-steps", async (req, res) => {
    try {
      const validatedData = insertSupplyChainStepSchema.parse(req.body);
      const step = await storage.createSupplyChainStep(validatedData);
      res.status(201).json(step);
    } catch (error) {
      res.status(400).json({ error: "Invalid supply chain step data" });
    }
  });

  // Quality verification routes
  app.get("/api/products/:productId/verifications", async (req, res) => {
    try {
      const verifications = await storage.getQualityVerifications(req.params.productId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality verifications" });
    }
  });

  app.post("/api/quality-verifications", async (req, res) => {
    try {
      const validatedData = insertQualityVerificationSchema.parse(req.body);
      const verification = await storage.createQualityVerification(validatedData);
      res.status(201).json(verification);
    } catch (error) {
      res.status(400).json({ error: "Invalid quality verification data" });
    }
  });

  // Blockchain transaction routes
  app.get("/api/transactions/:hash", async (req, res) => {
    try {
      const transaction = await storage.getBlockchainTransaction(req.params.hash);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // Get recent transactions
  app.get("/api/transactions/recent", async (_req, res) => {
    try {
      const transactions = await storage.getRecentTransactions(10); // Get last 10 transactions

      // Enhance transactions with product names
      const enhancedTransactions = await Promise.all(
        transactions.map(async (tx: any) => {
          let relatedName = null;
          if (tx.relatedId) {
            const product = await storage.getProduct(tx.relatedId);
            relatedName = product?.name || null;
          }
          return {
            ...tx,
            relatedName
          };
        })
      );

      res.json(enhancedTransactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertBlockchainTransactionSchema.parse(req.body);
      const transaction = await storage.createBlockchainTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Search endpoint for product tracking
  app.get("/api/search/:query", async (req, res) => {
    try {
      const query = req.params.query;

      // Check if it's a transaction hash (starts with 0x)
      if (query.startsWith('0x')) {
        const transaction = await storage.getBlockchainTransaction(query);
        if (transaction) {
          return res.json({ type: 'transaction', data: transaction });
        }
      } else {
        // Try to find product by ID first
        let product = await storage.getProduct(query);

        // If not found by ID, try blockchain ID
        if (!product) {
          product = await storage.getProductByBlockchainId(query);
        }

        if (product) {
          // Also get supply chain steps for the product
          const supplyChainSteps = await storage.getSupplyChainSteps(product.id);
          const transformedProduct = transformProductForClient(product, supplyChainSteps);
          return res.json({
            type: 'product',
            data: transformedProduct
          });
        }
      }

      return res.status(404).json({ error: "No results found" });
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Analytics routes
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // User routes for wallet connection
  app.post("/api/users/:id/wallet", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
      
      const user = await storage.updateUserWallet(req.params.id, walletAddress);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wallet address" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
