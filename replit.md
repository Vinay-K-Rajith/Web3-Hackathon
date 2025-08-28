# AgriChain - Blockchain-Powered Agricultural Supply Chain Tracker

## Overview

AgriChain is a comprehensive agricultural supply chain management application that leverages blockchain technology to provide transparent, immutable tracking of agricultural products from farm to consumer. The system enables farmers to register products on-chain, track supply chain stages, verify quality certifications, and provide end-to-end transparency through a modern web interface.

The application bridges traditional agriculture with Web3 technologies, offering real-time product tracking, quality verification, and blockchain-backed transparency for all stakeholders in the agricultural supply chain.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a monorepo structure with clear separation between client, server, and shared components. Built using a modern TypeScript stack with Express.js backend and React frontend, the system prioritizes type safety and maintainable code organization.

### Frontend Architecture
The client uses React 18 with TypeScript, employing a component-based architecture with shadcn/ui for consistent design system implementation. React Query handles server state management and caching, while Wouter provides lightweight client-side routing. The UI is styled with Tailwind CSS using a custom theme focused on agricultural/green aesthetics.

Key architectural decisions:
- **Component Library**: shadcn/ui chosen for consistency and accessibility
- **State Management**: React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Mobile-First Design**: Responsive layout with dedicated mobile navigation

### Backend Architecture
The server uses Express.js with TypeScript, implementing a RESTful API structure. The application follows a layered architecture with clear separation of concerns through routes, storage abstraction, and middleware layers.

Key design patterns:
- **Storage Interface**: Abstract storage layer supporting both in-memory and database implementations
- **Middleware Pipeline**: Request logging, error handling, and CORS management
- **API Validation**: Zod schemas for request/response validation
- **Development Integration**: Vite middleware integration for seamless development experience

### Database Design
Uses Drizzle ORM with PostgreSQL, featuring a normalized schema optimized for supply chain tracking. The database design supports complex relationships between users, products, supply chain stages, quality verifications, and blockchain transactions.

Core entities:
- **Users**: Farmer/stakeholder management with wallet integration
- **Products**: Agricultural product registration with blockchain linking
- **Supply Chain Steps**: Multi-stage tracking with quality metrics
- **Quality Verifications**: Third-party certification management
- **Blockchain Transactions**: On-chain transaction tracking

### Blockchain Integration
Integrates with Stacks blockchain for immutable product registration and supply chain verification. Uses Leather wallet for user authentication and transaction signing, with smart contract interactions for product provenance tracking.

Blockchain features:
- **Product Registration**: On-chain product metadata storage
- **Supply Chain Updates**: Immutable stage progression tracking
- **Quality Verification**: Blockchain-backed certification storage
- **Wallet Integration**: Stacks ecosystem wallet connectivity

### Type Safety and Validation
Implements comprehensive type safety using TypeScript throughout the stack, with shared types between client and server. Zod schemas provide runtime validation and automatic TypeScript type generation for API contracts.

## External Dependencies

### Core Framework Dependencies
- **Express.js**: RESTful API server framework
- **React 18**: Frontend framework with modern hooks and concurrent features
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Development server and build tool with HMR support

### Database and ORM
- **PostgreSQL**: Primary database via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database operations with migration support
- **Neon Database**: Cloud PostgreSQL provider integration

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **shadcn/ui**: Pre-built component library with consistent design tokens
- **Tailwind CSS**: Utility-first styling with custom theme configuration
- **Lucide Icons**: Consistent iconography throughout the application

### Blockchain and Web3
- **Stacks Connect**: Wallet connection and authentication
- **Stacks Transactions**: Blockchain transaction creation and management
- **Leather Wallet**: Primary wallet provider for Stacks ecosystem

### Data Management
- **TanStack React Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation integration
- **Zod**: Schema validation and TypeScript type generation

### Development and Build Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing pipeline with Tailwind integration

The system requires environment configuration for DATABASE_URL (PostgreSQL connection) and optionally integrates with Replit's development environment for enhanced debugging and development experience.