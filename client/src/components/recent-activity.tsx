import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Package,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Calendar
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "registration" | "shipment" | "verification" | "quality_check" | "harvest" | "processing";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "in_progress" | "pending";
  location?: string;
  value?: string;
  priority: "high" | "medium" | "low";
}

function ActivityIcon({ type, status }: { type: string; status: string }) {
  const getIconConfig = () => {
    switch (type) {
      case "registration":
        return { icon: Package, bg: "bg-emerald-100", text: "text-emerald-600" };
      case "shipment":
        return { icon: Truck, bg: "bg-blue-100", text: "text-blue-600" };
      case "verification":
        return { icon: Shield, bg: "bg-purple-100", text: "text-purple-600" };
      case "quality_check":
        return { icon: CheckCircle, bg: "bg-green-100", text: "text-green-600" };
      case "harvest":
        return { icon: TrendingUp, bg: "bg-orange-100", text: "text-orange-600" };
      case "processing":
        return { icon: AlertCircle, bg: "bg-yellow-100", text: "text-yellow-600" };
      default:
        return { icon: Clock, bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  const { icon: Icon, bg, text } = getIconConfig();

  return (
    <div className={`relative ${bg} p-3 rounded-xl shadow-sm`}>
      <Icon className={`h-5 w-5 ${text}`} />
      {status === "in_progress" && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}

export default function RecentActivity() {
  // Enhanced dummy data with more realistic agricultural supply chain activities
  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "harvest",
      title: "Fresh Harvest Completed",
      description: "Premium organic tomatoes harvested from Green Valley Farm",
      timestamp: "23 minutes ago",
      status: "completed",
      location: "Green Valley Farm, CA",
      value: "2,450 lbs",
      priority: "high"
    },
    {
      id: "2",
      type: "quality_check",
      title: "Quality Inspection Passed",
      description: "Batch #ORG-2024-001 passed all organic certification standards",
      timestamp: "1 hour ago",
      status: "completed",
      location: "Quality Control Lab",
      value: "Grade A+",
      priority: "high"
    },
    {
      id: "3",
      type: "shipment",
      title: "Cold Chain Transport",
      description: "Refrigerated truck departed for distribution center",
      timestamp: "2 hours ago",
      status: "in_progress",
      location: "En route to Denver, CO",
      value: "1,200 units",
      priority: "medium"
    },
    {
      id: "4",
      type: "processing",
      title: "Processing Initiated",
      description: "Organic lettuce batch entering washing and packaging phase",
      timestamp: "3 hours ago",
      status: "in_progress",
      location: "Processing Facility B",
      value: "800 units",
      priority: "medium"
    },
    {
      id: "5",
      type: "registration",
      title: "New Product Registered",
      description: "Heirloom carrots batch registered on blockchain",
      timestamp: "4 hours ago",
      status: "completed",
      location: "Sunny Acres Farm",
      value: "1,800 lbs",
      priority: "low"
    },
    {
      id: "6",
      type: "verification",
      title: "Blockchain Verification",
      description: "Smart contract executed for supply chain milestone",
      timestamp: "5 hours ago",
      status: "completed",
      location: "Stacks Network",
      value: "0.002 STX",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Recent Activity</span>
              <p className="text-sm text-gray-500 font-normal">Live supply chain updates</p>
            </div>
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div
              key={activity.id}
              className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
              data-testid={`activity-${activity.id}`}
            >
              <div className="flex items-start space-x-4">
                <ActivityIcon type={activity.type} status={activity.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1" data-testid={`activity-title-${activity.id}`}>
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed" data-testid={`activity-description-${activity.id}`}>
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-1 ${getPriorityColor(activity.priority)}`}
                      >
                        {activity.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-1 ${getStatusColor(activity.status)}`}
                      >
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <div className="flex items-center gap-4">
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          📍 {activity.location}
                        </span>
                      )}
                      {activity.value && (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          📊 {activity.value}
                        </span>
                      )}
                    </div>
                    <span className="font-medium" data-testid={`activity-timestamp-${activity.id}`}>
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtle connecting line for visual flow */}
              {index < recentActivity.slice(0, 5).length - 1 && (
                <div className="absolute left-8 bottom-0 w-px h-4 bg-gradient-to-b from-gray-200 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium group"
            data-testid="button-view-all-activity"
          >
            <span>View All Activity</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
