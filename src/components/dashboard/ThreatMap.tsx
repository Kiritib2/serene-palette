import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface ThreatNode {
  id: number;
  x: number;
  y: number;
  size: number;
  type: "safe" | "warning" | "threat";
  pulse: boolean;
}

export function ThreatMap() {
  const [nodes, setNodes] = useState<ThreatNode[]>([]);

  useEffect(() => {
    // Generate random threat nodes
    const generateNodes = () => {
      const newNodes: ThreatNode[] = [];
      for (let i = 0; i < 15; i++) {
        newNodes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 4 + Math.random() * 8,
          type: Math.random() > 0.8 ? "threat" : Math.random() > 0.5 ? "warning" : "safe",
          pulse: Math.random() > 0.7,
        });
      }
      setNodes(newNodes);
    };

    generateNodes();
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          pulse: Math.random() > 0.7,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const typeColors = {
    safe: "bg-success",
    warning: "bg-warning",
    threat: "bg-destructive",
  };

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Global Threat Map
        </CardTitle>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Threat</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 rounded-lg bg-secondary/30 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(10)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 border-t border-primary/30"
                style={{ top: `${i * 10}%` }}
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 border-l border-primary/30"
                style={{ left: `${i * 10}%` }}
              />
            ))}
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            {nodes.slice(0, 8).map((node, i) => {
              const nextNode = nodes[(i + 1) % nodes.length];
              return (
                <line
                  key={`line-${i}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${nextNode.x}%`}
                  y2={`${nextNode.y}%`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              );
            })}
          </svg>

          {/* Threat nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute transition-all duration-500"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {node.pulse && (
                <div
                  className={`absolute rounded-full opacity-40 animate-ping ${typeColors[node.type]}`}
                  style={{
                    width: node.size * 2,
                    height: node.size * 2,
                    left: -node.size / 2,
                    top: -node.size / 2,
                  }}
                />
              )}
              <div
                className={`rounded-full ${typeColors[node.type]} shadow-lg`}
                style={{
                  width: node.size,
                  height: node.size,
                }}
              />
            </div>
          ))}

          {/* Center shield */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ width: 60, height: 60, left: -10, top: -10 }} />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
