import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSupplyChainStepSchema, insertQualityVerificationSchema, insertBlockchainTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { farmerId } = req.query;
      const products = await storage.getProducts(farmerId as string);
      res.json(products);
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
      res.json(product);
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
      res.json(product);
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

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertBlockchainTransactionSchema.parse(req.body);
      const transaction = await storage.createBlockchainTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Analytics routes
  app.get("/api/stats", async (req, res) => {
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
