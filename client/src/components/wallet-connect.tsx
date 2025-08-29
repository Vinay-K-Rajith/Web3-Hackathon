import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { isConnected, address, connect, disconnect } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Leather wallet.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Leather wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
        data-testid="button-disconnect-wallet"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
      data-testid="button-connect-wallet"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
