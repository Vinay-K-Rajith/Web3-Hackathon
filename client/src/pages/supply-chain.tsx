import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Plus, 
  Search, 
  MapPin, 
  Building, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Package
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
import type { SupplyChainStep, Product } from "@/types/supply-chain";
import { updateSupplyChainStep, getFarmerProducts } from "@/lib/stacks";

export default function SupplyChainPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);
  const [newStep, setNewStep] = useState({
    stage: "",
    location: "",
    company: "",
    status: "pending",
    timestamp: new Date().toISOString().split('T')[0], // Default to today
    metadata: ""
  });
  const [suggestedStage, setSuggestedStage] = useState("");
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProduct && selectedProduct.supplyChainSteps) {
      const lastStep = selectedProduct.supplyChainSteps[selectedProduct.supplyChainSteps.length - 1];
      if (!lastStep) {
        setSuggestedStage("processing");
      } else {
        switch (lastStep.stage.toLowerCase()) {
          case "farm":
            setSuggestedStage("processing");
            break;
          case "processing":
            setSuggestedStage("distribution");
            break;
          case "distribution":
            setSuggestedStage("retail");
            break;
          default:
            setSuggestedStage("");
        }
      }
    }
  }, [selectedProduct]);

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

  const handleAddSupplyChainStep = async () => {
    if (!selectedProduct) return;

    try {
      // First, add to blockchain
      await updateSupplyChainStep(
        selectedProduct.id,
        newStep.stage,
        newStep.location,
        newStep.company
      );

      // Then add to local API with additional fields
      const stepToSave = {
        productId: selectedProduct.id,
        stage: newStep.stage,
        location: newStep.location,
        company: newStep.company,
        status: newStep.status,
        timestamp: new Date(newStep.timestamp),
        qualityMetrics: newStep.metadata ? JSON.parse(newStep.metadata) : null
      };

      const apiResponse = await fetch('/api/supply-chain-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepToSave),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to save step to local API');
      }
      
      toast({
        title: "Supply Chain Step Added",
        description: `Added ${newStep.stage} step to ${selectedProduct.name}`,
      });
      
      setIsAddStepDialogOpen(false);
      setNewStep({ 
        stage: "", 
        location: "", 
        company: "", 
        status: "pending",
        timestamp: new Date().toISOString().split('T')[0],
        metadata: "" 
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add supply chain step",
        variant: "destructive",
      });
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'farm': return <Package className="h-4 w-4 text-green-500" />;
      case 'processing': return <Building className="h-4 w-4 text-blue-500" />;
      case 'distribution': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'retail': return <MapPin className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'farm': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'distribution': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'retail': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AgritraceLogo size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to manage supply chain</p>
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
                <a href="/supply-chain" className="text-green-700 font-medium">Supply Chain</a>
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
                <TrendingUp className="h-8 w-8 text-green-600" />
                Supply Chain Management
              </h1>
              <p className="text-gray-600 mt-2">Track and manage your products through the supply chain</p>
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

        {/* Products with Supply Chain */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search" : "Register products to start tracking supply chain"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-green-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-green-800">{product.name}</CardTitle>
                      <p className="text-gray-600">{product.type} • {product.origin}</p>
                    </div>
                    <Dialog open={isAddStepDialogOpen} onOpenChange={setIsAddStepDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedProduct(product)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Step
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Supply Chain Step</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="stage">Stage {suggestedStage ? `(Suggested: ${suggestedStage})` : ''}</Label>
                            <Select 
                              value={newStep.stage}
                              onValueChange={(value) => setNewStep({...newStep, stage: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="distribution">Distribution</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="e.g., New York, NY"
                              value={newStep.location}
                              onChange={(e) => setNewStep({...newStep, location: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              placeholder="e.g., ABC Processing Co."
                              value={newStep.company}
                              onChange={(e) => setNewStep({...newStep, company: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={newStep.timestamp}
                              onChange={(e) => setNewStep({...newStep, timestamp: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select 
                              value={newStep.status}
                              onValueChange={(value) => setNewStep({...newStep, status: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Process</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="metadata">Additional Notes (Optional)</Label>
                            <Textarea
                              id="metadata"
                              placeholder="Any additional information..."
                              value={newStep.metadata}
                              onChange={(e) => setNewStep({...newStep, metadata: e.target.value})}
                            />
                          </div>
                          <Button 
                            onClick={handleAddSupplyChainStep}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={!newStep.stage || !newStep.location || !newStep.company || !newStep.timestamp || !newStep.status}
                          >
                            Add Supply Chain Step
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.supplyChainSteps && product.supplyChainSteps.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Supply Chain Journey</h4>
                      <div className="flex flex-wrap items-center gap-4">
                        {product.supplyChainSteps.map((step, index) => (
                          <>
                            {index > 0 && <ArrowRight className="h-5 w-5 text-gray-400" />}
                            <div key={step.id} className="flex-1 min-w-[200px]">
                              <div className={`p-3 rounded-lg border ${getStageColor(step.stage)}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  {getStageIcon(step.stage)}
                                  <h5 className="font-medium">{step.stage}</h5>
                                </div>
                                <p className="text-sm mb-1 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {step.company}
                                </p>
                                <p className="text-sm mb-1 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {step.location}
                                </p>
                                <p className="text-sm mb-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(step.timestamp).toLocaleDateString()}
                                </p>
                                <Badge variant="secondary" className="mt-1">
                                  {step.status}
                                </Badge>
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No supply chain steps recorded yet</p>
                      <p className="text-sm text-gray-500">Add the first step to start tracking</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
