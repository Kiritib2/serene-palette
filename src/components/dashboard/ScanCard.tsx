import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ScanCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  inputPlaceholder: string;
  onScan: (value: string) => Promise<{ status: "safe" | "threat" | "warning"; message: string; details?: string }>;
  className?: string;
}

export function ScanCard({
  title,
  description,
  icon,
  inputPlaceholder,
  onScan,
  className,
}: ScanCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    status: "safe" | "threat" | "warning";
    message: string;
    details?: string;
  } | null>(null);

  const handleScan = async () => {
    if (!inputValue.trim()) return;
    
    setIsScanning(true);
    setResult(null);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const scanResult = await onScan(inputValue);
    setResult(scanResult);
    setIsScanning(false);
  };

  const statusConfig = {
    safe: {
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10 border-success/30",
    },
    threat: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10 border-warning/30",
    },
  };

  return (
    <Card variant="glass" className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-secondary/50 border-border/50 focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <Button
            onClick={handleScan}
            disabled={isScanning || !inputValue.trim()}
            variant="glow"
            className="min-w-[100px]"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>

        {isScanning && (
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-primary/30" />
              <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-primary" />
              <div className="absolute inset-2 h-12 w-12 animate-ping rounded-full bg-primary/20" />
            </div>
          </div>
        )}

        {result && !isScanning && (
          <div
            className={cn(
              "animate-fade-up rounded-lg border p-4",
              statusConfig[result.status].bg
            )}
          >
            <div className="flex items-start gap-3">
              {(() => {
                const StatusIcon = statusConfig[result.status].icon;
                return (
                  <StatusIcon
                    className={cn("h-5 w-5 mt-0.5", statusConfig[result.status].color)}
                  />
                );
              })()}
              <div className="space-y-1">
                <p className={cn("font-medium", statusConfig[result.status].color)}>
                  {result.message}
                </p>
                {result.details && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {result.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
