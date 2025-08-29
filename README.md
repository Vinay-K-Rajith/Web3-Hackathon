

  # 🌾 Agritrace - Blockchain-Powered Agricultural Supply Chain Platform

  <img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/798dfb80-c6ff-4162-928b-f7cf48dafdae" />

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Stacks](https://img.shields.io/badge/Blockchain-Stacks-orange)](https://stacks.co)
  [![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)

  > **Transparent, Trusted, and Traceable Agricultural Supply Chains**
</div>

Agritrace is a comprehensive blockchain-powered platform that enables end-to-end transparency and traceability in agricultural supply chains. Built on the Stacks blockchain with Bitcoin anchoring, it provides real-time tracking, quality verification, and AI-powered compliance checking for agricultural products from farm to table.
## Video Drive Link
- https://drive.google.com/file/d/1sI5NTDwayJyVDcx3NX5SkekcHLwEVpfj/view?usp=sharing
## 🚀 Key Features

### 🔗 **Blockchain Integration**
- **Stacks Blockchain**: Smart contracts written in Clarity
- **Bitcoin Anchoring**: Proof-of-Transfer (PoX) for enhanced security
- **sBTC Support**: Synthetic Bitcoin integration for advanced features
- **Real-time Transactions**: Live blockchain transaction monitoring

### 🤖 **AI-Powered Compliance**
- **Rule-Based Analysis**: 15+ compliance rules for agricultural products
- **Multi-Category Coverage**: Organic, safety, quality, regulatory, blockchain compliance
- **Real-time Scoring**: Calculate compliance scores with detailed breakdowns
- **Frontend-Only**: Lightweight, client-side processing
- **Blockchain Integration**: Include blockchain verification data in analysis

### 📊 **Real-Time Analytics**
- **Live Dashboard**: Real-time statistics and monitoring
- **Interactive Charts**: Sparkline visualizations for trends
- **Supply Chain Tracking**: Complete product journey mapping
- **Quality Metrics**: Temperature, humidity, pH, and custom metrics tracking

### 🔐 **Security & Transparency**
- **Immutable Records**: All data stored on blockchain
- **Public Verification**: Transparent audit trails
- **Digital Signatures**: Cryptographic verification of all transactions
- **Cross-Border Compliance**: International standards support




### **Development Tools**
- **Vite** - Build tool and dev server
- **Clarinet** - Stacks development environment
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git
- Stacks wallet (Hiro, Xverse, or similar)

### **1. Clone the Repository**
```bash
git clone https://github.com/Vinay-K-Rajith/Web3-Hackathon.git
cd Web3-Hackathon
```

### **2. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install blockchain dependencies
cd ../clarinet
npm install
```

### **3. Environment Configuration**
```bash
# Create environment files
cp client/.env.example client/.env
cp .env.example .env
```

Configure your environment variables:
```env
# Client Environment (.env)
VITE_CONTRACT_ADDRESS=ST3R2YBNK8EVESRVQN7KXQ8CBSBTGY3FSXAJZQAK
VITE_CONTRACT_NAME=agri-supply-chain
VITE_NETWORK=testnet

# Server Environment (.env)
NODE_ENV=development
PORT=5000
```

### **4. Start Development Servers**
```bash
# Start the main development server (includes backend)
npm run dev

# Or start components separately:
# Backend only
npm run server

# Frontend only (in client directory)
cd client && npm run dev

# Blockchain development
cd clarinet && clarinet dev
```


## 🎯 Quick Start Guide

### **1. Connect Your Wallet**
1. Open the application in your browser
2. Click "Connect Wallet" in the header
3. Choose your Stacks wallet (Hiro, Xverse, etc.)
4. Approve the connection

### **2. Register a Product**
1. Navigate to the "Register New Product" section
2. Fill in product details:
   - Product name and type
   - Farm location
   - Quantity and certifications
   - Quality metrics
3. Click "Register Product"
4. Approve the blockchain transaction

### **3. Track Supply Chain**
1. Go to the "Track Supply Chain" section
2. Enter your product ID
3. View the complete supply chain journey
4. Add new supply chain steps as needed

### **4. Run AI Compliance Check**
1. Navigate to the "AI Compliance Checker"
2. Review the sample product data
3. Click "Run Compliance Check"
4. Analyze the results and recommendations

## 📋 API Documentation

### **Core Endpoints**

#### **Products**
```http
GET    /api/products              # Get all products
GET    /api/products/:id          # Get specific product
POST   /api/products              # Register new product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Deactivate product
```

#### **Supply Chain**
```http
GET    /api/supply-chain/:productId    # Get supply chain steps
POST   /api/supply-chain              # Add supply chain step
PUT    /api/supply-chain/:id          # Update step
```

#### **Quality Verification**
```http
GET    /api/quality/:productId         # Get quality verifications
POST   /api/quality                    # Add quality verification
POST   /api/quality/batch              # Batch verification
```

#### **Analytics**
```http
GET    /api/stats                      # Get platform statistics
GET    /api/transactions/recent        # Get recent transactions
```

## 🔧 Smart Contract Functions

### **Product Management**
```clarity
;; Register a new product
(register-product name product-type quantity farm-location certifications)

;; Update product status
(update-product-status product-id active)

;; Transfer product ownership
(transfer-product-ownership product-id new-farmer)
```

### **Supply Chain Operations**
```clarity
;; Add supply chain step
(add-supply-chain-step product-id stage location company status quality-metrics)

;; Verify quality
(verify-quality product-id certification-type verified verification-data)
```

### **Batch Operations**
```clarity
;; Add multiple certifications
(batch-add-certifications product-id new-certifications)

;; Emergency deactivation
(emergency-deactivate-product product-id)
```

## 🤖 AI Compliance Checker

The AI Compliance Checker provides intelligent analysis of agricultural products using rule-based algorithms:

### **Compliance Categories**
- **Organic**: USDA Organic, Non-GMO, Fair Trade and even Indian Regulatory Complience
- **Safety**: Food safety, pathogen testing, contamination checks
- **Quality**: Grade standards, freshness, nutritional content
- **Regulatory**: Government standards, export requirements
- **Blockchain**: Verification status, transaction history

### **Features**
- **Real-time Analysis**: Instant compliance scoring
- **Detailed Breakdown**: Category-wise compliance assessment
- **Recommendations**: Actionable improvement suggestions
- **Blockchain Integration**: Include blockchain verification data
- **Export Reports**: Generate compliance reports

## 🌐 Regulatory Integration

### **Supported Standards**
- **USDA Organic**: United States Department of Agriculture
- **EU Organic**: European Union organic standards
- **Codex Alimentarius**: International food standards
- **ISO 22000**: Food safety management
- **Global G.A.P.**: Good Agricultural Practice

### **Cross-Border Compliance**
- **Mutual Recognition**: International certificate acceptance
- **Standard Harmonization**: Unified compliance frameworks
- **Digital Verification**: Blockchain-based certificate validation

## 🔒 Security Features

### **Blockchain Security**
- **Immutable Records**: All data permanently stored on blockchain
- **Cryptographic Verification**: Digital signatures for all transactions
- **Bitcoin Anchoring**: Enhanced security through Bitcoin's PoW
- **Audit Trails**: Complete transaction history

### **Data Protection**
- **Input Validation**: Comprehensive data validation
- **ASCII Compliance**: Ensures Clarity smart contract compatibility
- **Error Handling**: Graceful error management
- **Access Control**: Role-based permissions

## 📊 Analytics & Reporting

### **Real-Time Dashboard**
- **Platform Statistics**: Total products, active farms, transactions
- **Trend Analysis**: Growth metrics and performance indicators
- **Geographic Distribution**: Regional activity mapping
- **Compliance Metrics**: Overall compliance rates

### **Custom Reports**
- **Product Reports**: Individual product journey tracking
- **Farm Reports**: Farm-specific analytics and performance
- **Compliance Reports**: Detailed compliance assessments
- **Export Reports**: International trade documentation






### **Community**
- **Discord**: [Agritrace Community](https://discord.gg/agritrace)
- **GitHub Issues**: [Report Bugs](https://github.com/your-username/agritrace/issues)
- **Discussions**: [Community Forum](https://github.com/your-username/agritrace/discussions)

### **Contact**
- **Email**: vinaykrajith@gmail.com
- **Twitter**: https://x.com/VinayKRajith
- **LinkedIn**: https://www.linkedin.com/in/vinay-k-rajith-6a1b1827a/
  ### **TEAM DETAILS**
  -CODEX
  -Aryan Tiwari
  - aryantiwari159@gmail.com
  - RA2311047010226
  - Vinay K Rajith
  - vinaykrajith@gmail.com
  - RA2311047010223
  

## 🙏 Acknowledgments

- **Stacks Foundation** for blockchain infrastructure
- **Hiro** for wallet integration
- **Open Source Community** for amazing tools and libraries
- **Agricultural Industry** for domain expertise and feedback



**Built with ❤️ for transparent and sustainable agriculture**

*Empowering farmers, ensuring quality, building trust through blockchain technology.*
