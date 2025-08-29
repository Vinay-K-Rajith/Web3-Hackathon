import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Calendar, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types/supply-chain";

export default function ProductTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a product ID or transaction hash.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProductDetails(null);
    setTransactionDetails(null);

    try {
      // Use the new search API endpoint
      const response = await fetch(`/api/search/${encodeURIComponent(searchQuery)}`);

      if (response.ok) {
        const result = await response.json();

        if (result.type === 'transaction') {
          setTransactionDetails(result.data);
          toast({
            title: "Transaction Found",
            description: "Transaction verified successfully on blockchain.",
          });
        } else if (result.type === 'product') {
          setProductDetails(result.data);
          toast({
            title: "Product Found",
            description: "Product details retrieved successfully.",
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Not Found",
          description: errorData.error || "No results found for your search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-primary" />
          <span>Track Product</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search-input">Product ID or Transaction Hash</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter blockchain ID or TX hash"
              data-testid="input-search-product"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-track-product"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {productDetails && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-800" data-testid="text-product-name">
                <Package className="inline h-4 w-4 mr-2" />
                {productDetails.name} #{productDetails.id}
              </h4>
              <Badge className="bg-green-600 text-white">
                {productDetails.status}
              </Badge>
            </div>

            {/* Product image placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded mb-3 flex items-center justify-center">
              <Package className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Origin:
                </span>
                <span className="font-medium" data-testid="text-farm-location">{productDetails.origin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium" data-testid="text-product-type">{productDetails.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Farmer:</span>
                <span className="font-medium">{productDetails.farmer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Harvest Date:
                </span>
                <span className="font-medium">{productDetails.harvestDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium" data-testid="text-created-date">
                  {new Date(productDetails.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Supply Chain Steps:
                </span>
                <span className="font-medium">{productDetails.supplyChainSteps?.length || 0}</span>
              </div>
              {productDetails.certifications && productDetails.certifications.length > 0 && (
                <div className="pt-2 border-t border-green-200">
                  <span className="text-gray-600 flex items-center mb-2">
                    <Award className="h-3 w-3 mr-1" />
                    Certifications:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {productDetails.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {transactionDetails && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-800">
                Transaction Details
              </h4>
              <Badge className={`${transactionDetails.tx_status === 'success' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                {transactionDetails.tx_status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">TX Hash:</span>
                <span className="font-mono text-xs">{transactionDetails.tx_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Block Height:</span>
                <span className="font-medium">{transactionDetails.block_height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gas Used:</span>
                <span className="font-medium">{transactionDetails.gas_used}</span>
              </div>
            </div>
          </div>
        )}

        {productDetails && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = '/supply-chain'}
              data-testid="button-view-supply-chain"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Supply Chain
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => window.location.href = '/products'}
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
