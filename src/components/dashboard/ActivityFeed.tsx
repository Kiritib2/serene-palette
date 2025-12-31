import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "scan" | "threat" | "safe" | "warning";
  title: string;
  description: string;
  timestamp: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "safe",
    title: "URL Scan Completed",
    description: "https://google.com - No threats detected",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    type: "threat",
    title: "Phishing Attempt Blocked",
    description: "Suspicious URL pattern detected",
    timestamp: "15 min ago",
  },
  {
    id: "3",
    type: "warning",
    title: "Unusual Network Activity",
    description: "High traffic volume from external source",
    timestamp: "32 min ago",
  },
  {
    id: "4",
    type: "scan",
    title: "System Scan Initiated",
    description: "Full network analysis in progress",
    timestamp: "1 hour ago",
  },
  {
    id: "5",
    type: "safe",
    title: "Bot Detection Complete",
    description: "Transaction verified as legitimate",
    timestamp: "2 hours ago",
  },
];

const typeConfig = {
  scan: { icon: Activity, color: "text-primary", bg: "bg-primary/10" },
  threat: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  safe: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
};

export function ActivityFeed() {
  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivity.map((item, index) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("rounded-lg p-2", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {item.timestamp}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
