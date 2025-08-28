import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "registration" | "shipment" | "verification";
  title: string;
  description: string;
  timestamp: string;
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "registration":
      return <div className="bg-primary/10 p-2 rounded-full"><span className="text-primary text-sm">+</span></div>;
    case "shipment":
      return <div className="bg-secondary/10 p-2 rounded-full"><span className="text-secondary text-sm">🚛</span></div>;
    case "verification":
      return <div className="bg-accent/10 p-2 rounded-full"><span className="text-accent-foreground text-sm">✓</span></div>;
    default:
      return <div className="bg-muted p-2 rounded-full"><span className="text-muted-foreground text-sm">📄</span></div>;
  }
}

export default function RecentActivity() {
  // In a real app, this would come from an API
  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "registration",
      title: "New product registered",
      description: "Organic Carrots batch #CAR456 added to blockchain",
      timestamp: "2 hours ago",
    },
    {
      id: "2", 
      type: "shipment",
      title: "Shipment updated",
      description: "Tomatoes #TOM001 arrived at processing facility",
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      type: "verification",
      title: "Quality certification verified",
      description: "Organic certification confirmed for batch #LEF789",
      timestamp: "6 hours ago",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
              <ActivityIcon type={activity.type} />
              <div className="flex-1">
                <p className="text-sm font-medium" data-testid={`activity-title-${activity.id}`}>
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-description-${activity.id}`}>
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium"
          data-testid="button-view-all-activity"
        >
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
