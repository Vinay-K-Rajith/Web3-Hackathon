import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route } from "lucide-react";

interface SupplyChainStepProps {
  stage: string;
  company: string;
  status: "completed" | "in_progress" | "pending";
  isLast?: boolean;
}

function SupplyChainStep({ stage, company, status, isLast }: SupplyChainStepProps) {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "farm": return "🌱";
      case "processing": return "🏭";
      case "distribution": return "🚛";
      case "retail": return "🏪";
      default: return "📦";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed": return "step-active";
      case "in_progress": return "step-in-progress";
      case "pending": return "step-pending";
      default: return "step-pending";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed ✓";
      case "in_progress": return "In Progress";
      case "pending": return "Pending";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex-1 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${getStatusClass(status)}`}>
        <span className="text-2xl">{getStageIcon(stage)}</span>
      </div>
      <h4 className="font-medium mb-2 capitalize">{stage}</h4>
      
      {/* Sample image placeholder based on stage */}
      <div className="w-full h-24 bg-muted rounded mb-2 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">{stage} image</span>
      </div>
      
      <p className="text-xs text-muted-foreground" data-testid={`text-company-${stage}`}>{company}</p>
      <p className={`text-xs font-medium ${status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
        {getStatusText(status)}
      </p>
      
      {!isLast && (
        <div className="hidden lg:block w-12 h-px bg-border relative mt-4">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-border rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export default function SupplyChainFlow() {
  // Sample supply chain data - in real app this would come from API
  const supplyChainSteps = [
    { stage: "farm", company: "Green Valley Farms", status: "completed" as const },
    { stage: "processing", company: "FreshPack Co.", status: "in_progress" as const },
    { stage: "distribution", company: "LogiCorp", status: "pending" as const },
    { stage: "retail", company: "Fresh Market", status: "pending" as const },
  ];

  const { data: blockchainData } = useQuery({
    queryKey: ["/api/blockchain-info"],
    enabled: false, // This would be enabled when tracking a specific product
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="w-5 h-5 text-primary" />
          <span>Live Supply Chain Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Supply Chain Flow */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-4">
            {supplyChainSteps.map((step, index) => (
              <SupplyChainStep
                key={step.stage}
                stage={step.stage}
                company={step.company}
                status={step.status}
                isLast={index === supplyChainSteps.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2 text-sm">Blockchain Verification</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block Height:</span>
                <span data-testid="text-block-height">824,567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Used:</span>
                <span data-testid="text-gas-used">0.0023 STX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmations:</span>
                <span className="text-primary font-medium" data-testid="text-confirmations">2,456</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2 text-sm">Quality Metrics</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature:</span>
                <span className="text-primary font-medium" data-testid="text-temperature">4°C ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Humidity:</span>
                <span className="text-primary font-medium" data-testid="text-humidity">65% ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">pH Level:</span>
                <span className="text-primary font-medium" data-testid="text-ph-level">6.2 ✓</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2 text-sm">Certifications</h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-primary">✓</span>
                <span>USDA Organic</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary">✓</span>
                <span>Non-GMO Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary">✓</span>
                <span>Fair Trade Certified</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
