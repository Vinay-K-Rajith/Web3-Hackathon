import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  Leaf,
  Shield,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Copy,
  Check,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Wallet
} from "lucide-react";
import WalletConnect from "@/components/wallet-connect";
import ProductRegistration from "@/components/product-registration";
import ProductTracking from "@/components/product-tracking";
import RecentActivity from "@/components/recent-activity";
import BlockchainInsights from "@/components/blockchain-insights";
import AIComplianceChecker from "@/components/ai-compliance-checker";
import MobileNavigation from "@/components/mobile-navigation";
import AgritraceLogo from "@/components/agritrace-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "@/hooks/use-wallet";

// Mini Sparkline Component
const MiniSparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 20 - ((value - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="20" className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Helper function for relative time
const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const { isConnected, address } = useWallet();

  // Scroll to Product Registration section
  const scrollToProductRegistration = () => {
    const element = document.getElementById('product-registration-section');
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 100; // Stop 100px before the element

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  // Sample sparkline data
  const sparklineData = {
    products: [12, 15, 18, 16, 20, 25, 28],
    farms: [8, 10, 12, 11, 14, 16, 18],
    transactions: [45, 52, 48, 60, 65, 70, 75],
    steps: [120, 135, 140, 155, 160, 175, 180]
  };

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalProducts: number;
    activeFarms: number;
    verifiedTransactions: number;
    supplyChainSteps: number;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  // Fetch recent transactions
  const { data: recentTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/transactions/recent");
        if (!response.ok) {
          throw new Error("API not available");
        }
        return response.json();
      } catch (error) {
        // Fallback to sample data if API endpoint doesn't exist yet
        return [
          {
            id: "tx-1",
            type: "product_registration",
            status: "confirmed",
            transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
            relatedId: "product-1",
            relatedName: "Organic Tomatoes",
            createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          },
          {
            id: "tx-2",
            type: "supply_chain_update",
            status: "confirmed",
            transactionHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
            relatedId: "product-2",
            relatedName: "Fresh Lettuce",
            createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          },
          {
            id: "tx-3",
            type: "quality_verification",
            status: "pending",
            transactionHash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
            relatedId: "product-3",
            relatedName: "Organic Carrots",
            createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          }
        ];
      }
    },
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-green-50/30">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <div className="flex items-center">
                <AgritraceLogo size="md" />
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/dashboard" className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-green-50">
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </a>
                <a href="/products" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Products</span>
                </a>
                <a href="/supply-chain" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Supply Chain</span>
                </a>
                <a href="/quality" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Quality</span>
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Network Status */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-green-50 rounded-full border border-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Testnet</span>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hidden md:flex h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <WalletConnect />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-sm sticky top-20 h-fit max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="w-full p-8">
            <div className="space-y-8">
              {/* Wallet Status */}
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl border border-green-100/50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-800">Wallet Status</h3>
                </div>

                {/* Connection Status */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-3 h-3 rounded-full blockchain-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-green-700">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Network Info */}
                <div className="flex items-center gap-3 mb-4 p-2 bg-white/60 rounded-lg">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Stacks Testnet</span>
                </div>

                {/* Address */}
                {address && (
                  <div className="space-y-2">
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-2 text-xs text-green-600 hover:text-green-700 transition-colors group w-full text-left"
                      title="Click to copy address"
                    >
                      <span className="font-mono">
                        {address.slice(0, 8)}...{address.slice(-6)}
                      </span>
                      {addressCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    {/* Gas Fee Estimate */}
                    <div className="text-xs text-green-500 mb-2">
                      Est. Gas: ~0.001 STX
                    </div>

                    {/* Mini Transaction History Graph */}
                    <div className="mt-3 pt-2 border-t border-green-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-green-600">Activity (7d)</span>
                        <span className="text-xs text-green-500">5 txns</span>
                      </div>
                      <div className="flex items-end gap-1 h-6">
                        {[3, 1, 4, 2, 5, 3, 4].map((height, index) => (
                          <div
                            key={index}
                            className="bg-green-300 rounded-sm flex-1"
                            style={{ height: `${height * 4}px` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>



              {/* Recent Transactions - Only show when wallet is connected */}
              {isConnected && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-green-800">Recent Transactions</h3>
                    <select
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="text-xs border border-green-200 rounded px-2 py-1 bg-white text-green-700"
                    >
                      <option value="all">All</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {transactionsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-3 bg-gray-100 rounded-lg animate-pulse">
                            <div className="h-3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentTransactions.length > 0 ? (
                      recentTransactions
                        .filter((tx: any) => transactionFilter === 'all' || tx.status === transactionFilter)
                        .slice(0, 5)
                        .map((transaction: any) => {
                        const getTransactionIcon = (type: string) => {
                          switch (type) {
                            case 'product_registration': return <Package className="h-3 w-3" />;
                            case 'supply_chain_update': return <TrendingUp className="h-3 w-3" />;
                            case 'quality_verification': return <Shield className="h-3 w-3" />;
                            default: return <Clock className="h-3 w-3" />;
                          }
                        };

                        const getTransactionLabel = (type: string) => {
                          switch (type) {
                            case 'product_registration': return 'Product Registered';
                            case 'supply_chain_update': return 'Supply Chain Updated';
                            case 'quality_verification': return 'Quality Verified';
                            default: return 'Transaction';
                          }
                        };

                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'confirmed': return <CheckCircle className="h-3 w-3 text-green-500" />;
                            case 'pending': return <Clock className="h-3 w-3 text-yellow-500" />;
                            case 'failed': return <AlertCircle className="h-3 w-3 text-red-500" />;
                            default: return <Clock className="h-3 w-3 text-gray-500" />;
                          }
                        };

                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'confirmed': return 'text-green-600';
                            case 'pending': return 'text-yellow-600';
                            case 'failed': return 'text-red-600';
                            default: return 'text-gray-600';
                          }
                        };

                        return (
                          <div key={transaction.id} className="p-3 text-xs bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                            {/* Header with type and status */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <span className="text-green-700 font-medium truncate">{getTransactionLabel(transaction.type)}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                {getStatusIcon(transaction.status)}
                                <span className={`font-medium capitalize text-xs ${getStatusColor(transaction.status)}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>

                            {/* Product name */}
                            {transaction.relatedName && (
                              <div className="text-green-700 font-medium mb-2 truncate">{transaction.relatedName}</div>
                            )}

                            {/* Transaction details */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-green-600 truncate flex-1 mr-2">
                                  TX: {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-4)}
                                </span>
                                <span className="text-green-500 text-xs flex-shrink-0">
                                  {getRelativeTime(transaction.createdAt)}
                                </span>
                              </div>

                              {/* Transaction value and gas */}
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-green-500">
                                  Value: {transaction.type === 'product_registration' ? '0.001' : '0.0005'} STX
                                </span>
                                {transaction.status === 'pending' && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span className="text-yellow-600">Processing...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-gray-500 text-center">
                        No recent transactions
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wallet Connection Prompt - Show when wallet is not connected */}
              {!isConnected && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-amber-800">Connect Wallet</h3>
                  </div>
                  <p className="text-sm text-amber-700 mb-4">
                    Connect your wallet to view recent transactions and interact with the blockchain.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Recent transactions will appear here</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12">
          {/* Hero Section */}
          <div className="relative rounded-3xl p-12 mb-12 text-white shadow-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1658902748005-4a1c2ca3e148?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
              }}
            ></div>

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70"></div>

            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 right-8 w-48 h-48 border-2 border-white/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-32 h-32 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/3 left-1/3 w-24 h-24 border border-white/15 rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/4 w-16 h-16 border border-white/10 rounded-full"></div>
            </div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>

            <div className="relative max-w-6xl">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                <div className="mb-6 lg:mb-0 flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4" />
                      <Package className="h-4 w-4" />
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium ml-2">Blockchain-Powered</span>
                    </div>
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                    Agricultural Supply Chain
                    <span className="block text-emerald-200 mt-2">Transparency</span>
                  </h1>
                </div>
              </div>

              <div className="max-w-4xl">
                <p className="text-xl lg:text-2xl opacity-95 mb-6 leading-relaxed">
                  Track your products from farm to table with blockchain-verified authenticity and quality assurance powered by Agritrace.
                </p>
                <p className="text-lg opacity-80 mb-8">
                  Ensuring transparency, trust, and traceability in every step of your agricultural supply chain.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  className="bg-white text-green-700 hover:bg-green-50 font-medium shadow-lg border-2 border-white"
                  data-testid="button-register-new-product"
                  onClick={scrollToProductRegistration}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Register New Product
                </Button>
                <Button
                  className="bg-white/10 text-white hover:bg-white/20 font-medium shadow-lg border-2 border-white backdrop-blur-sm"
                  data-testid="button-track-existing-product"
                  onClick={() => window.location.href = '/supply-chain'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Track Supply Chain
                </Button>
                <Button
                  className="bg-white/10 text-white hover:bg-white/20 font-medium shadow-lg border-2 border-white backdrop-blur-sm"
                  onClick={() => window.location.href = '/quality'}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Quality Verification
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">Total Products</p>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-2" data-testid="text-total-products">
                            {statsLoading ? (
                              <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                              stats?.totalProducts || 28
                            )}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <Package className="h-7 w-7 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                            <span className="text-xs text-emerald-700 font-semibold">+12%</span>
                          </div>
                          <MiniSparkline data={sparklineData.products} color="#059669" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700">
                  <p>Total number of products registered on the blockchain</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-cyan-50 via-white to-cyan-50/30 cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                            <p className="text-sm text-cyan-600 font-semibold uppercase tracking-wide">Active Farms</p>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-2" data-testid="text-active-farms">
                            {statsLoading ? (
                              <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                              stats?.activeFarms || 18
                            )}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <Leaf className="h-7 w-7 text-cyan-600" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-cyan-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-cyan-100 rounded-full">
                            <TrendingUp className="h-3 w-3 text-cyan-600" />
                            <span className="text-xs text-cyan-700 font-semibold">+8%</span>
                          </div>
                          <MiniSparkline data={sparklineData.farms} color="#0891b2" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700">
                  <p>Number of farms actively using the platform</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Verified Transactions</p>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-2" data-testid="text-verified-transactions">
                            {statsLoading ? (
                              <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                              stats?.verifiedTransactions || 75
                            )}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <Shield className="h-7 w-7 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 rounded-full">
                            <TrendingUp className="h-3 w-3 text-indigo-600" />
                            <span className="text-xs text-indigo-700 font-semibold">+25%</span>
                          </div>
                          <MiniSparkline data={sparklineData.transactions} color="#4f46e5" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700">
                  <p>Total blockchain transactions verified successfully</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-violet-50 via-white to-violet-50/30 cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                            <p className="text-sm text-violet-600 font-semibold uppercase tracking-wide">Supply Chain Steps</p>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-2" data-testid="text-supply-chain-steps">
                            {statsLoading ? (
                              <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                              stats?.supplyChainSteps || 180
                            )}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-100 to-violet-200 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                          <TrendingUp className="h-7 w-7 text-violet-600" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-violet-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-violet-100 rounded-full">
                            <TrendingUp className="h-3 w-3 text-violet-600" />
                            <span className="text-xs text-violet-700 font-semibold">+18%</span>
                          </div>
                          <MiniSparkline data={sparklineData.steps} color="#7c3aed" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700">
                  <p>Total steps tracked across all supply chains</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Product Registration & Tracking */}
          <div id="product-registration-section" className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <ProductRegistration />
            <ProductTracking />
          </div>

          {/* Recent Activity & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            <RecentActivity />
            <BlockchainInsights />
          </div>

          {/* AI Compliance Checker */}
          <div className="mt-16">
            <AIComplianceChecker />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
