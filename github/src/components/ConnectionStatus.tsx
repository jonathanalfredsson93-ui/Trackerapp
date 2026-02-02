import { motion } from "framer-motion";
import { Smartphone, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";

interface ConnectionStatusProps {
  isConnected: boolean;
  onConnect: () => void;
}

export const ConnectionStatus = ({
  isConnected,
  onConnect,
}: ConnectionStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isConnected ? "bg-active/20" : "bg-destructive/20"
          }`}
        >
          {isConnected ? (
            <Wifi className="w-5 h-5 text-active" />
          ) : (
            <WifiOff className="w-5 h-5 text-destructive" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {isConnected ? "Health Connect Active" : "Not Connected"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isConnected
              ? "Syncing your health data"
              : "Connect to see your data"}
          </p>
        </div>
      </div>

      {!isConnected && (
        <Button
          onClick={onConnect}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Connect
        </Button>
      )}
    </motion.div>
  );
};
