import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function ProductTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"blockchain" | "product">("blockchain");
  const { toast } = useToast();

  const { data: product, isLoading, error, refetch } = useQuery<Product>({
    queryKey: ["/api/products/blockchain", searchQuery],
    enabled: false, // Only fetch when user searches
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a product ID or transaction hash.",
        variant: "destructive",
      });
      return;
    }

    try {
      await refetch();
      if (!product) {
        toast({
          title: "Product Not Found",
          description: "No product found with the provided ID.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search for product. Please try again.",
        variant: "destructive",
      });
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
              className="bg-secondary hover:bg-secondary/90"
              data-testid="button-track-product"
            >
              {isLoading ? "Searching..." : "Track"}
            </Button>
          </div>
        </div>

        {product && (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium" data-testid="text-product-name">
                {product.name} #{product.blockchainId}
              </h4>
              <Badge className="bg-primary text-primary-foreground">Verified</Badge>
            </div>
            
            {/* Product image placeholder */}
            <div className="w-full h-32 bg-muted rounded mb-3 flex items-center justify-center">
              <span className="text-muted-foreground">Product Image</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farm:</span>
                <span data-testid="text-farm-location">{product.farmLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span data-testid="text-product-type">{product.productType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span data-testid="text-quantity">{product.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span data-testid="text-created-date">
                  {new Date(product.createdAt!).toLocaleDateString()}
                </span>
              </div>
              {product.certifications && product.certifications.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certifications:</span>
                  <div className="flex gap-1">
                    {product.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {product && (
          <Button 
            className="w-full bg-secondary hover:bg-secondary/90"
            data-testid="button-view-supply-chain"
          >
            View Full Supply Chain
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
