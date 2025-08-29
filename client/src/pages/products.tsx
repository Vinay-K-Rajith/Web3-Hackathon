import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import AgritraceLogo from "@/components/agritrace-logo";
import type { Product } from "@/types/supply-chain";
import { 
  getFarmerProducts, 
  updateProductStatus, 
  transferProductOwnership, 
  emergencyDeactivateProduct 
} from "@/lib/stacks";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  // Fetch farmer's products from API and blockchain
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["farmer-products", address],
    queryFn: async () => {
      if (!address) return [];

      try {
        // Fetch from local API first (this has our sample data)
        const apiResponse = await fetch(`/api/products?farmerId=${address}`);
        let apiProducts: Product[] = [];

        if (apiResponse.ok) {
          apiProducts = await apiResponse.json();
        }

        // Try to fetch from blockchain (optional for now)
        let blockchainProducts: Product[] = [];
        try {
          blockchainProducts = await getFarmerProducts(address);
        } catch (blockchainError) {
          console.log('Blockchain fetch failed, using API data only:', blockchainError);
        }

        // Combine results, prioritizing blockchain data if available
        const combinedProducts = [...blockchainProducts];

        // Add API products that aren't already in blockchain results
        apiProducts.forEach((apiProduct: Product) => {
          const exists = blockchainProducts.some(bp => bp.id === apiProduct.id);
          if (!exists) {
            combinedProducts.push(apiProduct);
          }
        });

        return combinedProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    enabled: !!address && isConnected,
    refetchInterval: 30000,
  });

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'verified': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'deactivated': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deactivated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = async (productId: string, newStatus: 'active' | 'inactive' | 'verified' | 'deactivated') => {
    try {
      await updateProductStatus(productId, newStatus);
      toast({
        title: "Status Updated",
        description: `Product status updated to ${newStatus}`,
      });
      refetch();
      setIsStatusDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyDeactivate = async (productId: string) => {
    try {
      await emergencyDeactivateProduct(productId, "Emergency deactivation by owner");
      toast({
        title: "Product Deactivated",
        description: "Product has been emergency deactivated",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate product",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AgritraceLogo size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to view your products</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <AgritraceLogo size="md" />
              <nav className="hidden md:flex space-x-6">
                <a href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">Dashboard</a>
                <a href="/products" className="text-green-700 font-medium">Products</a>
                <a href="/supply-chain" className="text-gray-600 hover:text-green-600 transition-colors">Supply Chain</a>
                <a href="/quality" className="text-gray-600 hover:text-green-600 transition-colors">Quality</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-green-600" />
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your agricultural products and their lifecycle</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Register New Product
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "verified" ? "default" : "outline"}
              onClick={() => setStatusFilter("verified")}
              size="sm"
            >
              Verified
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              size="sm"
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by registering your first product"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow border-green-100">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-green-800">{product.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{product.type}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedProduct(product);
                          setIsStatusDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedProduct(product);
                          setIsTransferDialogOpen(true);
                        }}>
                          <Users className="h-4 w-4 mr-2" />
                          Transfer Ownership
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEmergencyDeactivate(product.id)}
                          className="text-red-600"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className={`${getStatusColor(product.status)} flex items-center gap-1`}>
                        {getStatusIcon(product.status)}
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Origin</span>
                      <span className="text-sm font-medium">{product.origin}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Harvest Date</span>
                      <span className="text-sm font-medium">{product.harvestDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Supply Chain Steps</span>
                      <span className="text-sm font-medium">{product.supplyChainSteps?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
