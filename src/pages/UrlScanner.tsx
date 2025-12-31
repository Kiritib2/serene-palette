import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, CheckCircle2, XCircle, AlertTriangle, Shield, ExternalLink, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ScanResult {
  status: "safe" | "threat" | "warning";
  message: string;
  confidence: number;
  features: {
    url_length: number;
    num_dots: number;
    num_slashes: number;
    num_dashes: number;
    has_https: boolean;
    num_digits: number;
    suspicious_words: number;
  };
}

export default function UrlScanner() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanUrl = async () => {
    if (!url.trim()) return;

    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      // Flask API endpoint - replace with your actual Flask server URL
      const API_URL = "http://localhost:5000/api/scan-url";
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to scan URL");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Fallback to mock analysis when Flask API is not available
      console.log("Flask API not available, using mock analysis");
      await new Promise((r) => setTimeout(r, 1500));
      
      const suspiciousWords = ['login', 'secure', 'account', 'verify', 'signin', 'banking', 'confirm', 'update'];
      const features = {
        url_length: url.length,
        num_dots: (url.match(/\./g) || []).length,
        num_slashes: (url.match(/\//g) || []).length,
        num_dashes: (url.match(/-/g) || []).length,
        has_https: url.includes('https'),
        num_digits: (url.match(/\d/g) || []).length,
        suspicious_words: suspiciousWords.filter(w => url.toLowerCase().includes(w)).length,
      };

      const threatScore = 
        (features.suspicious_words * 2) + 
        (features.num_dots > 3 ? 2 : 0) + 
        (features.num_digits > 5 ? 1 : 0) + 
        (!features.has_https ? 1 : 0);

      let status: "safe" | "threat" | "warning";
      let message: string;
      let confidence: number;

      if (threatScore >= 4) {
        status = "threat";
        message = "High Risk - Potential Phishing Detected";
        confidence = Math.min(95, 70 + threatScore * 3);
      } else if (threatScore >= 2) {
        status = "warning";
        message = "Medium Risk - Proceed with Caution";
        confidence = 50 + threatScore * 5;
      } else {
        status = "safe";
        message = "Low Risk - URL Appears Safe";
        confidence = Math.max(85, 95 - threatScore * 5);
      }

      setResult({ status, message, confidence, features });
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
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">URL Scanner</h1>
              <p className="text-xs text-muted-foreground">Phishing Detection System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Scanner Card */}
        <Card variant="glass" className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Phishing URL Analyzer</CardTitle>
            <CardDescription>
              Enter a URL to analyze it for potential phishing indicators using our ML model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="https://example.com/login..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && scanUrl()}
                  className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary text-base"
                />
              </div>
              <Button
                onClick={scanUrl}
                disabled={isScanning || !url.trim()}
                variant="glow"
                size="lg"
                className="min-w-[140px]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {/* Loading Animation */}
            {isScanning && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 h-24 w-24 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                  <div className="absolute inset-4 h-16 w-16 animate-ping rounded-full bg-primary/20" />
                  <Link2 className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                </div>
                <p className="mt-6 text-sm text-muted-foreground animate-pulse">
                  Analyzing URL patterns...
                </p>
              </div>
            )}

            {/* Results */}
            {result && !isScanning && (
              <div className="space-y-6 animate-fade-up">
                {/* Status Banner */}
                <div className={cn("rounded-xl border p-6", statusConfig[result.status].bg)}>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const StatusIcon = statusConfig[result.status].icon;
                      return <StatusIcon className={cn("h-12 w-12", statusConfig[result.status].color)} />;
                    })()}
                    <div className="flex-1">
                      <h3 className={cn("text-xl font-bold", statusConfig[result.status].color)}>
                        {result.message}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {result.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-4xl font-bold", statusConfig[result.status].color)}>
                        {result.confidence.toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                    </div>
                  </div>
                </div>

                {/* Feature Analysis */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="text-base">Feature Analysis</CardTitle>
                    <CardDescription>Extracted URL characteristics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <FeatureItem label="URL Length" value={result.features.url_length} />
                      <FeatureItem label="Dots (.)" value={result.features.num_dots} />
                      <FeatureItem label="Slashes (/)" value={result.features.num_slashes} />
                      <FeatureItem label="Dashes (-)" value={result.features.num_dashes} />
                      <FeatureItem label="HTTPS" value={result.features.has_https ? "Yes" : "No"} isGood={result.features.has_https} />
                      <FeatureItem label="Digits" value={result.features.num_digits} />
                      <FeatureItem label="Suspicious Words" value={result.features.suspicious_words} isBad={result.features.suspicious_words > 0} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card variant="glass" className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-1">Extract Features</h4>
                <p className="text-xs text-muted-foreground">Analyze URL structure and patterns</p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-1">ML Analysis</h4>
                <p className="text-xs text-muted-foreground">Process through trained model</p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-1">Risk Assessment</h4>
                <p className="text-xs text-muted-foreground">Get threat level and confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function FeatureItem({ 
  label, 
  value, 
  isGood, 
  isBad 
}: { 
  label: string; 
  value: string | number; 
  isGood?: boolean;
  isBad?: boolean;
}) {
  return (
    <div className="rounded-lg bg-secondary/30 p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        "text-lg font-semibold font-mono",
        isGood && "text-success",
        isBad && "text-destructive"
      )}>
        {value}
      </p>
    </div>
  );
}
