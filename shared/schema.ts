import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productType: text("product_type").notNull(),
  quantity: integer("quantity").notNull(),
  farmLocation: text("farm_location").notNull(),
  certifications: text("certifications").array().default([]),
  blockchainId: text("blockchain_id").unique(),
  transactionHash: text("transaction_hash"),
  farmerId: varchar("farmer_id").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const supplyChainSteps = pgTable("supply_chain_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  stage: text("stage").notNull(), // 'farm', 'processing', 'distribution', 'retail'
  location: text("location").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull(), // 'completed', 'in_progress', 'pending'
  timestamp: timestamp("timestamp").default(sql`now()`),
  transactionHash: text("transaction_hash"),
  qualityMetrics: jsonb("quality_metrics"), // temperature, humidity, pH, etc.
});

export const qualityVerifications = pgTable("quality_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  verifierId: varchar("verifier_id").references(() => users.id).notNull(),
  certificationType: text("certification_type").notNull(),
  verified: boolean("verified").notNull(),
  verificationData: jsonb("verification_data"),
  blockchainProof: text("blockchain_proof"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionHash: text("transaction_hash").notNull().unique(),
  blockHeight: integer("block_height"),
  gasUsed: text("gas_used"),
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  type: text("type").notNull(), // 'product_registration', 'quality_verification', 'supply_chain_update'
  relatedId: varchar("related_id"), // can reference products, supply_chain_steps, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  certifications: z.array(z.string()).optional(),
});

export const insertSupplyChainStepSchema = createInsertSchema(supplyChainSteps).omit({
  id: true,
  timestamp: true,
});

export const insertQualityVerificationSchema = createInsertSchema(qualityVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type SupplyChainStep = typeof supplyChainSteps.$inferSelect;
export type InsertSupplyChainStep = z.infer<typeof insertSupplyChainStepSchema>;

export type QualityVerification = typeof qualityVerifications.$inferSelect;
export type InsertQualityVerification = z.infer<typeof insertQualityVerificationSchema>;

export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
