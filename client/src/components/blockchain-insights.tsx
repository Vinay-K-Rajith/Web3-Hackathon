import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Blocks,
  Zap,
  Shield,
  TrendingUp,
  Activity,
  Database,
  Network,
  Clock,
  DollarSign,
  BarChart3
} from "lucide-react";

export default function BlockchainInsights() {
  // Enhanced blockchain data with more comprehensive metrics
  const blockchainData = {
    networkStatus: "Active",
    lastBlock: 2847563,
    gasPrice: "0.000023 STX",
    smartContracts: 47,
    networkHealth: 98.7,
    avgBlockTime: "10.2s",
    totalValueLocked: "1.2M STX",
    activeValidators: 156
  };

  const performanceMetrics = {
    transactionThroughput: 847,
    successRate: 99.2,
    avgConfirmationTime: "45s",
    networkUptime: 99.8
  };

  const dailyStats = {
    newProducts: 156,
    verifications: 342,
    transactions: 1247,
    totalVolume: "45.7K STX",
    uniqueUsers: 89,
    contractCalls: 523
  };

  const weeklyTrends = {
    transactionGrowth: 12.5,
    userGrowth: 8.3,
    volumeGrowth: 15.7
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <Blocks className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Blockchain Insights</span>
              <p className="text-sm text-gray-500 font-normal">Network performance & analytics</p>
            </div>
          </CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Network Health Visualization */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-600" />
              Network Health
            </h3>
            <span className="text-lg font-bold text-purple-600">{blockchainData.networkHealth}%</span>
          </div>
          <Progress value={blockchainData.networkHealth} className="h-2 bg-purple-100" />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Excellent</span>
            <span>Uptime: {performanceMetrics.networkUptime}%</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-blue-100 rounded-lg">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Latest Block</span>
            </div>
            <div className="text-lg font-bold text-gray-900" data-testid="text-last-block">
              #{blockchainData.lastBlock.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {blockchainData.avgBlockTime}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-green-100 rounded-lg">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Gas Price</span>
            </div>
            <div className="text-lg font-bold text-gray-900" data-testid="text-gas-price">
              {blockchainData.gasPrice}
            </div>
            <div className="text-xs text-green-600 font-medium">
              ↓ 5% from yesterday
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-purple-100 rounded-lg">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Smart Contracts</span>
            </div>
            <div className="text-lg font-bold text-gray-900" data-testid="text-smart-contracts">
              {blockchainData.smartContracts}
            </div>
            <div className="text-xs text-gray-500">
              Active contracts
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-orange-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">TVL</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {blockchainData.totalValueLocked}
            </div>
            <div className="text-xs text-orange-600 font-medium">
              ↑ 12% this week
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Throughput:</span>
              <span className="font-semibold text-gray-900">{performanceMetrics.transactionThroughput} TPS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-semibold text-green-600">{performanceMetrics.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Confirmation:</span>
              <span className="font-semibold text-gray-900">{performanceMetrics.avgConfirmationTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Validators:</span>
              <span className="font-semibold text-gray-900">{blockchainData.activeValidators}</span>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Today's Activity
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">New Products:</span>
              <span className="font-semibold text-gray-900" data-testid="text-daily-products">
                {dailyStats.newProducts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verifications:</span>
              <span className="font-semibold text-gray-900" data-testid="text-daily-verifications">
                {dailyStats.verifications}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-semibold text-gray-900" data-testid="text-daily-transactions">
                {dailyStats.transactions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volume:</span>
              <span className="font-semibold text-gray-900">{dailyStats.totalVolume}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unique Users:</span>
              <span className="font-semibold text-gray-900">{dailyStats.uniqueUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Calls:</span>
              <span className="font-semibold text-gray-900">{dailyStats.contractCalls}</span>
            </div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Weekly Growth</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Transactions</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${weeklyTrends.transactionGrowth * 4}%`}}></div>
                </div>
                <span className="text-xs font-semibold text-green-600">+{weeklyTrends.transactionGrowth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Users</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${weeklyTrends.userGrowth * 6}%`}}></div>
                </div>
                <span className="text-xs font-semibold text-blue-600">+{weeklyTrends.userGrowth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Volume</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${weeklyTrends.volumeGrowth * 3.2}%`}}></div>
                </div>
                <span className="text-xs font-semibold text-purple-600">+{weeklyTrends.volumeGrowth}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
