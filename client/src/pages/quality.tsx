import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Plus, 
  Search, 
  Award, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import AgritraceLogo from "@/components/agritrace-logo";
import type { Product, QualityVerification } from "@/types/supply-chain";
import { verifyQualityOnBlockchain, getFarmerProducts, batchAddCertifications } from "@/lib/stacks";

export default function QualityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [newVerification, setNewVerification] = useState({
    certificationType: "",
    verificationData: ""
  });
  const [batchCertification, setBatchCertification] = useState({
    type: "",
    data: ""
  });
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  // Fetch farmer's products from both blockchain and API
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

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQualityVerification = async () => {
    if (!selectedProduct) return;

    try {
      await verifyQualityOnBlockchain(
        selectedProduct.id,
        newVerification.certificationType,
        JSON.parse(newVerification.verificationData || '{}')
      );
      
      toast({
        title: "Quality Verification Added",
        description: `Added ${newVerification.certificationType} verification to ${selectedProduct.name}`,
      });
      
      setIsVerifyDialogOpen(false);
      setNewVerification({ certificationType: "", verificationData: "" });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add quality verification",
        variant: "destructive",
      });
    }
  };

  const handleBatchCertification = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await batchAddCertifications(
        selectedProducts,
        batchCertification.type,
        JSON.parse(batchCertification.data || '{}')
      );
      
      toast({
        title: "Batch Certification Added",
        description: `Added ${batchCertification.type} certification to ${selectedProducts.length} products`,
      });
      
      setIsBatchDialogOpen(false);
      setBatchCertification({ type: "", data: "" });
      setSelectedProducts([]);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add batch certifications",
        variant: "destructive",
      });
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AgritraceLogo size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to manage quality verifications</p>
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
                <a href="/products" className="text-gray-600 hover:text-green-600 transition-colors">Products</a>
                <a href="/supply-chain" className="text-gray-600 hover:text-green-600 transition-colors">Supply Chain</a>
                <a href="/quality" className="text-green-700 font-medium">Quality</a>
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
                <Shield className="h-8 w-8 text-green-600" />
                Quality Verification
              </h1>
              <p className="text-gray-600 mt-2">Manage quality certifications and verifications</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Batch Certify
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Batch Add Certifications</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Selected Products: {selectedProducts.length}</Label>
                      <p className="text-sm text-gray-600">Select products below to add certifications</p>
                    </div>
                    <div>
                      <Label htmlFor="batch-type">Certification Type</Label>
                      <Select value={batchCertification.type} onValueChange={(value) => setBatchCertification({...batchCertification, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select certification type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="organic">Organic Certification</SelectItem>
                          <SelectItem value="fair-trade">Fair Trade</SelectItem>
                          <SelectItem value="non-gmo">Non-GMO</SelectItem>
                          <SelectItem value="sustainable">Sustainable Farming</SelectItem>
                          <SelectItem value="quality-grade-a">Quality Grade A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="batch-data">Certification Data (JSON)</Label>
                      <Textarea
                        id="batch-data"
                        placeholder='{"certifier": "USDA", "validUntil": "2025-12-31"}'
                        value={batchCertification.data}
                        onChange={(e) => setBatchCertification({...batchCertification, data: e.target.value})}
                      />
                    </div>
                    <Button 
                      onClick={handleBatchCertification}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!batchCertification.type || selectedProducts.length === 0}
                    >
                      Add Certifications to {selectedProducts.length} Products
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products with Quality Verifications */}
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
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search" : "Register products to start quality verification"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-green-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="mt-1"
                      />
                      <div>
                        <CardTitle className="text-lg text-green-800">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600">{product.type}</p>
                      </div>
                    </div>
                    <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Quality Verification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cert-type">Certification Type</Label>
                            <Select value={newVerification.certificationType} onValueChange={(value) => setNewVerification({...newVerification, certificationType: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select certification type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="organic">Organic Certification</SelectItem>
                                <SelectItem value="fair-trade">Fair Trade</SelectItem>
                                <SelectItem value="non-gmo">Non-GMO</SelectItem>
                                <SelectItem value="sustainable">Sustainable Farming</SelectItem>
                                <SelectItem value="quality-grade-a">Quality Grade A</SelectItem>
                                <SelectItem value="pesticide-free">Pesticide Free</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="verification-data">Verification Data (JSON)</Label>
                            <Textarea
                              id="verification-data"
                              placeholder='{"certifier": "USDA", "testResults": {"pesticides": "none"}, "validUntil": "2025-12-31"}'
                              value={newVerification.verificationData}
                              onChange={(e) => setNewVerification({...newVerification, verificationData: e.target.value})}
                            />
                          </div>
                          <Button 
                            onClick={handleQualityVerification}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={!newVerification.certificationType}
                          >
                            Add Quality Verification
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Certifications</span>
                      <span className="text-sm font-medium">{product.certifications?.length || 0}</span>
                    </div>
                    
                    {product.certifications && product.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.certifications.slice(0, 3).map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {product.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.certifications.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {product.qualityMetrics && product.qualityMetrics.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Recent Verifications</h5>
                        <div className="space-y-2">
                          {product.qualityMetrics.slice(0, 2).map((metric, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{metric.certificationType}</span>
                              <Badge className={getVerificationColor('verified')} size="sm">
                                {getVerificationIcon('verified')}
                                Verified
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>Last Updated</span>
                      <span>{new Date(product.updatedAt || product.createdAt).toLocaleDateString()}</span>
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
