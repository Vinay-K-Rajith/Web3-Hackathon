import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Blocks } from "lucide-react";

export default function BlockchainInsights() {
  // Sample blockchain data - in real app this would come from Alchemy/Stacks API
  const blockchainData = {
    networkStatus: "Active",
    lastBlock: 824567,
    gasPrice: "0.000023 STX",
    smartContracts: 12,
  };

  const dailyStats = {
    newProducts: 23,
    verifications: 45,
    transactions: 67,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Blocks className="w-5 h-5 text-primary" />
          <span>Blockchain Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Blockchain visualization placeholder */}
        <div className="w-full h-32 bg-muted rounded mb-4 flex items-center justify-center">
          <span className="text-muted-foreground">Blockchain Visualization</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Network Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full blockchain-pulse"></div>
              <span className="text-sm font-medium text-primary" data-testid="text-network-status">
                {blockchainData.networkStatus}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Block</span>
            <span className="text-sm font-medium" data-testid="text-last-block">
              #{blockchainData.lastBlock.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gas Price</span>
            <span className="text-sm font-medium" data-testid="text-gas-price">
              {blockchainData.gasPrice}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Smart Contracts</span>
            <span className="text-sm font-medium" data-testid="text-smart-contracts">
              {blockchainData.smartContracts} Active
            </span>
          </div>

          <div className="bg-muted p-3 rounded-lg mt-4">
            <h4 className="text-sm font-medium mb-2">Today's Activity</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Products:</span>
                <span data-testid="text-daily-products">{dailyStats.newProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verifications:</span>
                <span data-testid="text-daily-verifications">{dailyStats.verifications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions:</span>
                <span data-testid="text-daily-transactions">{dailyStats.transactions}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
