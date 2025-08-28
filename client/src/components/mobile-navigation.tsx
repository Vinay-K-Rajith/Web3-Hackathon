import { Button } from "@/components/ui/button";
import { Home, Plus, Search, BarChart3 } from "lucide-react";

export default function MobileNavigation() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
      <div className="flex justify-around">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center space-y-1 text-primary"
          data-testid="button-mobile-dashboard"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Dashboard</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center space-y-1 text-muted-foreground"
          data-testid="button-mobile-register"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">Register</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center space-y-1 text-muted-foreground"
          data-testid="button-mobile-track"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Track</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center space-y-1 text-muted-foreground"
          data-testid="button-mobile-analytics"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">Analytics</span>
        </Button>
      </div>
    </div>
  );
}
