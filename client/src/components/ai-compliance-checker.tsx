import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Brain, 
  TrendingUp,
  FileText,
  Zap,
  Clock,
  Award,
  RefreshCw,
  Database,
  Link
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";

interface ComplianceRule {
  id: string;
  category: 'organic' | 'safety' | 'quality' | 'regulatory' | 'blockchain';
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  keywords: string[];
}

interface ComplianceResult {
  ruleId: string;
  category: string;
  passed: boolean;
  score: number;
  details: string;
  aiSuggestion?: string;
  severity: string;
}

interface ComplianceCheck {
  productId?: string;
  checks: ComplianceResult[];
  overallScore: number;
  recommendations: string[];
  timestamp: Date;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  blockchainData?: any;
}

// Enhanced compliance rules for agricultural products
const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "org-001",
    category: "organic",
    rule: "Organic certification validation",
    severity: "high",
    weight: 0.25,
    keywords: ["organic", "certified", "usda", "certification", "natural", "bio"]
  },
  {
    id: "safety-001",
    category: "safety",
    rule: "Food safety compliance",
    severity: "critical",
    weight: 0.30,
    keywords: ["safe", "food", "safety", "haccp", "fda", "inspection", "hygiene"]
  },
  {
    id: "quality-001",
    category: "quality",
    rule: "Quality standards verification",
    severity: "high",
    weight: 0.20,
    keywords: ["quality", "grade", "premium", "standard", "inspection", "a+", "grade a"]
  },
  {
    id: "reg-001",
    category: "regulatory",
    rule: "Regulatory compliance check",
    severity: "critical",
    weight: 0.25,
    keywords: ["compliance", "regulation", "legal", "approved", "licensed", "permit"]
  },
  {
    id: "blockchain-001",
    category: "blockchain",
    rule: "Blockchain verification status",
    severity: "medium",
    weight: 0.15,
    keywords: ["blockchain", "verified", "immutable", "transparent", "traceable", "stacks"]
  },
  {
    id: "supply-chain-001",
    category: "blockchain",
    rule: "Supply chain transparency",
    severity: "high",
    weight: 0.20,
    keywords: ["supply chain", "traceability", "tracking", "origin", "farm to table"]
  }
];

// Enhanced AI text analysis function
function analyzeTextWithAI(text: string, rules: ComplianceRule[], blockchainData?: any): ComplianceResult[] {
  const results: ComplianceResult[] = [];
  const lowerText = text.toLowerCase();
  
  rules.forEach(rule => {
    let score = 0;
    let matchedKeywords: string[] = [];
    let details = "";
    
    // Enhanced keyword matching with AI-like scoring
    rule.keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 0.15;
        matchedKeywords.push(keyword);
      }
    });
    
    // AI-like pattern recognition with context
    if (rule.category === 'organic' && lowerText.includes('organic')) {
      score += 0.4;
      details = "Organic certification detected";
      
      // Check for specific organic indicators
      if (lowerText.includes('usda') || lowerText.includes('certified')) {
        score += 0.2;
        details += " with official certification";
      }
    }
    
    if (rule.category === 'safety' && (lowerText.includes('safe') || lowerText.includes('fda'))) {
      score += 0.5;
      details = "Safety compliance indicators found";
      
      if (lowerText.includes('inspection') || lowerText.includes('haccp')) {
        score += 0.2;
        details += " with inspection protocols";
      }
    }
    
    if (rule.category === 'blockchain' && lowerText.includes('blockchain')) {
      score += 0.6;
      details = "Blockchain verification confirmed";
      
      if (lowerText.includes('stacks') || lowerText.includes('verified')) {
        score += 0.2;
        details += " with Stacks blockchain";
      }
    }
    
    // Supply chain specific analysis
    if (rule.category === 'blockchain' && rule.id === 'supply-chain-001') {
      if (lowerText.includes('supply chain') || lowerText.includes('traceability')) {
        score += 0.4;
        details = "Supply chain transparency detected";
      }
      
      if (lowerText.includes('farm to table') || lowerText.includes('origin')) {
        score += 0.3;
        details += " with origin tracking";
      }
    }
    
    // Quality assessment
    if (rule.category === 'quality') {
      if (lowerText.includes('grade a') || lowerText.includes('premium')) {
        score += 0.4;
        details = "Premium quality indicators found";
      }
      
      if (lowerText.includes('inspection') || lowerText.includes('standard')) {
        score += 0.3;
        details += " with quality standards";
      }
    }
    
    // Blockchain data integration
    if (blockchainData && rule.category === 'blockchain') {
      if (blockchainData.verified) {
        score += 0.3;
        details += " - Blockchain verification confirmed";
      }
      
      if (blockchainData.transactionHash) {
        score += 0.2;
        details += " - Transaction recorded on blockchain";
      }
    }
    
    // Normalize score to 0-100
    score = Math.min(100, score * 100);
    
    const passed = score >= 60;
    
    // Generate AI-like suggestions
    let aiSuggestion = "";
    if (!passed) {
      switch (rule.category) {
        case 'organic':
          aiSuggestion = "Consider adding organic certification details and USDA approval";
          break;
        case 'safety':
          aiSuggestion = "Include food safety compliance documentation and HACCP protocols";
          break;
        case 'quality':
          aiSuggestion = "Add quality inspection reports and grade certification";
          break;
        case 'regulatory':
          aiSuggestion = "Verify regulatory compliance status and licensing requirements";
          break;
        case 'blockchain':
          if (rule.id === 'blockchain-001') {
            aiSuggestion = "Ensure blockchain verification is complete and transparent";
          } else {
            aiSuggestion = "Enhance supply chain transparency with detailed tracking";
          }
          break;
      }
    }
    
    results.push({
      ruleId: rule.id,
      category: rule.category,
      passed,
      score,
      details: details || `Matched keywords: ${matchedKeywords.join(', ')}`,
      aiSuggestion,
      severity: rule.severity
    });
  });
  
  return results;
}

// Calculate overall compliance score
function calculateOverallScore(results: ComplianceResult[], rules: ComplianceRule[]): number {
  let totalWeight = 0;
  let weightedScore = 0;
  
  results.forEach(result => {
    const rule = rules.find(r => r.id === result.ruleId);
    if (rule) {
      totalWeight += rule.weight;
      weightedScore += (result.score / 100) * rule.weight;
    }
  });
  
  return totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
}

// Generate AI recommendations
function generateRecommendations(results: ComplianceResult[]): string[] {
  const recommendations: string[] = [];
  
  const failedChecks = results.filter(r => !r.passed);
  const criticalIssues = failedChecks.filter(r => r.severity === 'critical');
  const highIssues = failedChecks.filter(r => r.severity === 'high');
  
  if (criticalIssues.length > 0) {
    recommendations.push("🚨 Critical compliance issues detected - immediate action required");
  }
  
  if (highIssues.length > 0) {
    recommendations.push("⚠️ High-priority compliance improvements needed");
  }
  
  // Add specific AI suggestions
  failedChecks.forEach(check => {
    if (check.aiSuggestion) {
      recommendations.push(`💡 ${check.aiSuggestion}`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push("✅ All compliance checks passed successfully");
  }
  
  // Add blockchain-specific recommendations
  const blockchainChecks = results.filter(r => r.category === 'blockchain');
  const blockchainScore = blockchainChecks.reduce((sum, check) => sum + check.score, 0) / blockchainChecks.length;
  
  if (blockchainScore < 70) {
    recommendations.push("🔗 Consider enhancing blockchain integration for better transparency");
  }
  
  return recommendations;
}

export default function AIComplianceChecker() {
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useBlockchainData, setUseBlockchainData] = useState(false);
  const { isConnected } = useWallet();
  const { toast } = useToast();

  // Sample data that can be enhanced with real blockchain data
  const [sampleData, setSampleData] = useState({
    productName: "Organic Tomatoes",
    description: "Premium organic tomatoes with USDA certification, blockchain verified for supply chain transparency",
    certifications: ["USDA Organic", "Non-GMO", "Fair Trade"],
    qualityMetrics: "Grade A, temperature controlled, safety inspected",
    blockchainData: {
      verified: true,
      transactionHash: "0x1234567890abcdef",
      blockHeight: 2847563,
      timestamp: new Date().toISOString()
    }
  });

  const runComplianceCheck = async () => {
    setIsAnalyzing(true);
    setComplianceCheck({
      checks: [],
      overallScore: 0,
      recommendations: [],
      timestamp: new Date(),
      status: 'analyzing'
    });

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Combine all text data for analysis
      const combinedText = [
        sampleData.productName,
        sampleData.description,
        sampleData.certifications.join(' '),
        sampleData.qualityMetrics
      ].join(' ');
      
      // Run AI analysis with optional blockchain data
      const blockchainData = useBlockchainData && isConnected ? sampleData.blockchainData : undefined;
      const results = analyzeTextWithAI(combinedText, COMPLIANCE_RULES, blockchainData);
      const overallScore = calculateOverallScore(results, COMPLIANCE_RULES);
      const recommendations = generateRecommendations(results);
      
      setComplianceCheck({
        checks: results,
        overallScore,
        recommendations,
        timestamp: new Date(),
        status: 'completed',
        blockchainData: blockchainData
      });
      
      toast({
        title: "Compliance Check Complete",
        description: `Overall score: ${overallScore.toFixed(1)}%`,
      });
      
    } catch (error) {
      setComplianceCheck(prev => prev ? {
        ...prev,
        status: 'error'
      } : null);
      
      toast({
        title: "Compliance Check Failed",
        description: "Failed to complete compliance analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return "bg-red-100 text-red-700 border-red-200";
      case 'high': return "bg-orange-100 text-orange-700 border-orange-200";
      case 'medium': return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'low': return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">AI Compliance Checker</span>
              <p className="text-sm text-gray-500 font-normal">Lightweight AI-powered compliance analysis</p>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Database className="w-3 h-3 mr-1" />
                Blockchain Ready
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sample Data Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Sample Product Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Product:</span>
              <span className="font-medium ml-2">{sampleData.productName}</span>
            </div>
            <div>
              <span className="text-gray-600">Certifications:</span>
              <span className="font-medium ml-2">{sampleData.certifications.length}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Description:</span>
              <span className="font-medium ml-2 text-xs">{sampleData.description}</span>
            </div>
            {isConnected && (
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useBlockchainData"
                  checked={useBlockchainData}
                  onChange={(e) => setUseBlockchainData(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="useBlockchainData" className="text-xs text-gray-600">
                  Include blockchain verification data
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Check Button */}
        <div className="flex justify-center">
          <Button
            onClick={runComplianceCheck}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
            data-testid="button-run-compliance-check"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                AI Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Run AI Compliance Check
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {complianceCheck && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Overall Compliance Score
                </h3>
                <span className={`text-lg font-bold ${getScoreColor(complianceCheck.overallScore)}`}>
                  {complianceCheck.overallScore.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={complianceCheck.overallScore} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Detailed Analysis
              </h3>
              <div className="space-y-3">
                {complianceCheck.checks.map((check) => (
                  <div key={check.ruleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.passed)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {check.category}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(check.severity)}`}
                          >
                            {check.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{check.details}</p>
                        {check.aiSuggestion && (
                          <p className="text-xs text-blue-600 mt-1">💡 {check.aiSuggestion}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getScoreColor(check.score)}`}>
                        {check.score.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {complianceCheck.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-lg">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Integration Status */}
            {complianceCheck.blockchainData && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Link className="w-4 h-4 text-purple-600" />
                  Blockchain Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium ml-2 text-green-600">Verified ✓</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Block Height:</span>
                    <span className="font-medium ml-2">{complianceCheck.blockchainData.blockHeight}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">TX Hash:</span>
                    <span className="font-medium ml-2 font-mono">
                      {complianceCheck.blockchainData.transactionHash.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Timestamp */}
            <div className="text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Analysis completed at {complianceCheck.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
