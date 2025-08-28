import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sprout, Menu } from "lucide-react";
import WalletConnect from "@/components/wallet-connect";
import ProductRegistration from "@/components/product-registration";
import ProductTracking from "@/components/product-tracking";
import SupplyChainFlow from "@/components/supply-chain-flow";
import RecentActivity from "@/components/recent-activity";
import BlockchainInsights from "@/components/blockchain-insights";
import MobileNavigation from "@/components/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, address } = useWallet();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sprout className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-foreground">AgriTrace</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Track Product</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Register</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Analytics</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletConnect />
              <Button
                variant="ghost" 
                size="icon"
                className="md:hidden"
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
        <aside className="hidden lg:flex w-64 bg-card border-r border-border min-h-screen">
          <div className="w-full p-6">
            <div className="space-y-6">
              {/* Wallet Status */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Wallet Status</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full blockchain-pulse ${isConnected ? 'bg-primary' : 'bg-destructive'}`}></div>
                  <span className="text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Connect to view address'}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    data-testid="button-register-product"
                  >
                    <span className="text-primary">+</span>
                    Register Product
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    data-testid="button-track-product"
                  >
                    <span className="text-primary">🔍</span>
                    Track Product
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    data-testid="button-verify-quality"
                  >
                    <span className="text-primary">✓</span>
                    Verify Quality
                  </Button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Recent Transactions</h3>
                <div className="space-y-2">
                  <div className="p-2 text-xs bg-muted rounded">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product Registered</span>
                      <span className="text-primary">Success</span>
                    </div>
                    <div className="text-muted-foreground truncate mt-1">TX: 0x1a2b3c...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Hero Section */}
          <div className="gradient-bg rounded-xl p-8 mb-8 text-white">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold mb-4">Agricultural Supply Chain Transparency</h2>
              <p className="text-lg opacity-90 mb-6">Track your products from farm to table with blockchain-verified authenticity and quality assurance.</p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-white text-secondary hover:bg-gray-100"
                  data-testid="button-register-new-product"
                >
                  Register New Product
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-secondary"
                  data-testid="button-track-existing-product"
                >
                  Track Existing Product
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-products">
                      {statsLoading ? '...' : stats?.totalProducts || 0}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="text-primary text-xl">📦</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Farms</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-farms">
                      {statsLoading ? '...' : stats?.activeFarms || 0}
                    </p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <span className="text-secondary text-xl">🚜</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Transactions</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-verified-transactions">
                      {statsLoading ? '...' : stats?.verifiedTransactions || 0}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="text-primary text-xl">✅</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Supply Chain Steps</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-supply-chain-steps">
                      {statsLoading ? '...' : stats?.supplyChainSteps || 0}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <span className="text-accent-foreground text-xl">🛣️</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Registration & Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ProductRegistration />
            <ProductTracking />
          </div>

          {/* Supply Chain Visualization */}
          <SupplyChainFlow />

          {/* Recent Activity & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <RecentActivity />
            <BlockchainInsights />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
