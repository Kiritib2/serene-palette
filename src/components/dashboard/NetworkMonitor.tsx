import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

export function NetworkMonitor() {
  const [dataPoints, setDataPoints] = useState<number[]>([]);

  useEffect(() => {
    // Initialize with some data
    setDataPoints(Array.from({ length: 30 }, () => Math.random() * 60 + 20));

    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const newPoints = [...prev.slice(1), Math.random() * 60 + 20];
        return newPoints;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...dataPoints);
  const currentValue = dataPoints[dataPoints.length - 1] || 0;

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Network Traffic
        </CardTitle>
        <span className="text-sm font-mono text-primary">
          {currentValue.toFixed(1)} Mb/s
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-end gap-0.5">
          {dataPoints.map((value, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary transition-all duration-300"
              style={{
                height: `${(value / maxValue) * 100}%`,
                opacity: 0.3 + (index / dataPoints.length) * 0.7,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>30s ago</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  );
}
