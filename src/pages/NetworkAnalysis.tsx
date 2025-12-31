import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Shuffle, Globe, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface NetworkData {
  protocol: string;
  srcPort: number;
  dstPort: number;
  packetSize: number;
  duration: number;
  srcIP: string;
}

interface ScanResult {
  status: "safe" | "threat" | "warning";
  prediction: string;
  confidence: number;
  attackType?: string;
  networkData: NetworkData;
}

const PROTOCOLS = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "SSH"];

export default function NetworkAnalysis() {
  const [networkData, setNetworkData] = useState<NetworkData>({
    protocol: "TCP",
    srcPort: 443,
    dstPort: 80,
    packetSize: 1500,
    duration: 120,
    srcIP: "192.168.1.100",
  });
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const generateRandomTraffic = () => {
    const isAttack = Math.random() < 0.2;
    const protocol = isAttack 
      ? ["TCP", "UDP", "ICMP"][Math.floor(Math.random() * 3)]
      : PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
    
    setNetworkData({
      protocol,
      srcPort: isAttack ? Math.floor(Math.random() * 1024) : Math.floor(Math.random() * 65535),
      dstPort: isAttack ? [22, 23, 3389, 445][Math.floor(Math.random() * 4)] : [80, 443, 8080][Math.floor(Math.random() * 3)],
      packetSize: isAttack ? Math.floor(Math.random() * 500 + 1000) : Math.floor(Math.random() * 1000 + 64),
      duration: isAttack ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 300 + 30),
      srcIP: isAttack 
        ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        : `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    });
    setResult(null);
  };

  const analyzeNetwork = async () => {
    setIsScanning(true);
    setResult(null);

    try {
      // Flask API endpoint
      const API_URL = "http://localhost:5000/api/analyze-network";
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(networkData),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setResult(data);
    } catch {
      // Mock analysis
      await new Promise((r) => setTimeout(r, 2000));

      const { srcPort, dstPort, packetSize, duration, srcIP, protocol } = networkData;
      const isInternal = srcIP.startsWith("192.168") || srcIP.startsWith("10.") || srcIP.startsWith("172.");
      const suspiciousPorts = [22, 23, 3389, 445, 21, 25];
      const isSuspiciousPort = suspiciousPorts.includes(dstPort);
      const isShortDuration = duration < 15;
      const isLargePacket = packetSize > 1200;

      let status: "safe" | "threat" | "warning";
      let prediction: string;
      let confidence: number;
      let attackType: string | undefined;

      if (!isInternal && isSuspiciousPort && isShortDuration) {
        status = "threat";
        prediction = "State-Sponsored Attack Detected";
        attackType = "APT (Advanced Persistent Threat)";
        confidence = 88 + Math.random() * 10;
      } else if (isSuspiciousPort || (isLargePacket && protocol === "ICMP")) {
        status = "warning";
        prediction = "Suspicious Network Activity";
        attackType = isLargePacket ? "Potential DDoS" : "Port Scanning";
        confidence = 55 + Math.random() * 25;
      } else {
        status = "safe";
        prediction = "Normal Network Traffic";
        confidence = 90 + Math.random() * 8;
      }

      setResult({ status, prediction, confidence, attackType, networkData });
    } finally {
      setIsScanning(false);
    }
  };

  const statusConfig = {
    safe: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/30" },
    threat: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
    warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
              <Network className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Network Analysis</h1>
              <p className="text-xs text-muted-foreground">State-Sponsored Attack Detection</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card variant="glass" className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
              <Globe className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-2xl">Network Traffic Analyzer</CardTitle>
            <CardDescription>
              Detect state-sponsored attacks and malicious network patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Network Form */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Protocol</label>
                <Select
                  value={networkData.protocol}
                  onValueChange={(value) => setNetworkData({ ...networkData, protocol: value })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROTOCOLS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source IP</label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={networkData.srcIP}
                    onChange={(e) => setNetworkData({ ...networkData, srcIP: e.target.value })}
                    className="pl-9 bg-secondary/50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source Port</label>
                <Input
                  type="number"
                  value={networkData.srcPort}
                  onChange={(e) => setNetworkData({ ...networkData, srcPort: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Port</label>
                <Input
                  type="number"
                  value={networkData.dstPort}
                  onChange={(e) => setNetworkData({ ...networkData, dstPort: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Packet Size (bytes)</label>
                <Input
                  type="number"
                  value={networkData.packetSize}
                  onChange={(e) => setNetworkData({ ...networkData, packetSize: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (sec)</label>
                <Input
                  type="number"
                  value={networkData.duration}
                  onChange={(e) => setNetworkData({ ...networkData, duration: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={generateRandomTraffic}>
                <Shuffle className="h-4 w-4 mr-2" />
                Simulate Traffic
              </Button>
              <Button variant="glow" size="lg" onClick={analyzeNetwork} disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Network className="h-5 w-5" />
                    Analyze Traffic
                  </>
                )}
              </Button>
            </div>

            {/* Loading */}
            {isScanning && (
              <div className="flex flex-col items-center py-12">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-warning/20" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-warning" />
                  <Network className="absolute inset-0 m-auto h-8 w-8 text-warning animate-pulse" />
                </div>
                <p className="mt-6 text-sm text-muted-foreground">Scanning network patterns...</p>
              </div>
            )}

            {/* Results */}
            {result && !isScanning && (
              <div className="space-y-4 animate-fade-up">
                <div className={cn("rounded-xl border p-6", statusConfig[result.status].bg)}>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const StatusIcon = statusConfig[result.status].icon;
                      return <StatusIcon className={cn("h-12 w-12", statusConfig[result.status].color)} />;
                    })()}
                    <div className="flex-1">
                      <h3 className={cn("text-xl font-bold", statusConfig[result.status].color)}>
                        {result.prediction}
                      </h3>
                      {result.attackType && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Attack Type: {result.attackType}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Confidence: {result.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <div className={cn("text-4xl font-bold font-mono", statusConfig[result.status].color)}>
                      {result.confidence.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <Card variant="default">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      <NetworkField label="Protocol" value={result.networkData.protocol} />
                      <NetworkField label="Source IP" value={result.networkData.srcIP} />
                      <NetworkField label="Src Port" value={result.networkData.srcPort} />
                      <NetworkField label="Dst Port" value={result.networkData.dstPort} />
                      <NetworkField label="Packet Size" value={`${result.networkData.packetSize}B`} />
                      <NetworkField label="Duration" value={`${result.networkData.duration}s`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function NetworkField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-secondary/30 p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold font-mono truncate">{value}</p>
    </div>
  );
}
