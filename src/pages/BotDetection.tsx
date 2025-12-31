import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Shuffle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TransactionData {
  step: number;
  type: string;
  amount: number;
  oldBalanceOrg: number;
  newBalanceOrig: number;
}

interface ScanResult {
  status: "safe" | "threat" | "warning";
  prediction: string;
  confidence: number;
  transaction: TransactionData;
}

const TRANSACTION_TYPES = ["PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"];

export default function BotDetection() {
  const [transaction, setTransaction] = useState<TransactionData>({
    step: 1,
    type: "TRANSFER",
    amount: 1000,
    oldBalanceOrg: 5000,
    newBalanceOrig: 4000,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const generateRandomTransaction = () => {
    const isAttack = Math.random() < 0.15;
    const type = isAttack ? "TRANSFER" : TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)];
    const amount = isAttack 
      ? Math.round(Math.random() * 400000 + 10000)
      : Math.round(Math.random() * 5000 + 10);
    const oldBalance = isAttack ? amount : Math.round(Math.random() * 10000 + amount);
    const newBalance = isAttack ? 0 : Math.round(oldBalance - amount);

    setTransaction({
      step: Math.floor(Math.random() * 744) + 1,
      type,
      amount,
      oldBalanceOrg: oldBalance,
      newBalanceOrig: newBalance,
    });
    setResult(null);
  };

  const analyzeTransaction = async () => {
    setIsScanning(true);
    setResult(null);

    try {
      // Flask API endpoint
      const API_URL = "http://localhost:5000/api/detect-bot";
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setResult(data);
    } catch {
      // Mock analysis
      await new Promise((r) => setTimeout(r, 1500));

      const { amount, oldBalanceOrg, newBalanceOrig, type } = transaction;
      const isHighValue = amount > 10000;
      const isFullDrain = newBalanceOrig === 0 && oldBalanceOrg === amount;
      const isSuspiciousType = type === "TRANSFER" || type === "CASH_OUT";

      let status: "safe" | "threat" | "warning";
      let prediction: string;
      let confidence: number;

      if (isHighValue && isFullDrain && isSuspiciousType) {
        status = "threat";
        prediction = "Bot Activity Detected - Fraudulent Transaction";
        confidence = 92 + Math.random() * 6;
      } else if ((isHighValue && isSuspiciousType) || isFullDrain) {
        status = "warning";
        prediction = "Suspicious Pattern - Manual Review Required";
        confidence = 65 + Math.random() * 20;
      } else {
        status = "safe";
        prediction = "Legitimate Transaction - No Bot Activity";
        confidence = 85 + Math.random() * 12;
      }

      setResult({ status, prediction, confidence, transaction });
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Bot Detection</h1>
              <p className="text-xs text-muted-foreground">Financial Fraud Classifier</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card variant="glass" className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Bot className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Transaction Fraud Detector</CardTitle>
            <CardDescription>
              Analyze financial transactions for automated bot fraud patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Form */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Type</label>
                <Select
                  value={transaction.type}
                  onValueChange={(value) => setTransaction({ ...transaction, type: value })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    value={transaction.amount}
                    onChange={(e) => setTransaction({ ...transaction, amount: Number(e.target.value) })}
                    className="pl-9 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Step (Hour)</label>
                <Input
                  type="number"
                  value={transaction.step}
                  onChange={(e) => setTransaction({ ...transaction, step: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Old Balance</label>
                <Input
                  type="number"
                  value={transaction.oldBalanceOrg}
                  onChange={(e) => setTransaction({ ...transaction, oldBalanceOrg: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Balance</label>
                <Input
                  type="number"
                  value={transaction.newBalanceOrig}
                  onChange={(e) => setTransaction({ ...transaction, newBalanceOrig: Number(e.target.value) })}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={generateRandomTransaction}>
                <Shuffle className="h-4 w-4 mr-2" />
                Generate Random
              </Button>
              <Button variant="glow" size="lg" onClick={analyzeTransaction} disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="h-5 w-5" />
                    Detect Fraud
                  </>
                )}
              </Button>
            </div>

            {/* Loading */}
            {isScanning && (
              <div className="flex flex-col items-center py-12">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-accent/20" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-accent" />
                  <Bot className="absolute inset-0 m-auto h-8 w-8 text-accent animate-pulse" />
                </div>
                <p className="mt-6 text-sm text-muted-foreground">Analyzing transaction patterns...</p>
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
                      <p className="text-sm text-muted-foreground mt-1">
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
                    <div className="grid gap-4 sm:grid-cols-5">
                      <TransactionField label="Type" value={result.transaction.type} />
                      <TransactionField label="Amount" value={`$${result.transaction.amount.toLocaleString()}`} />
                      <TransactionField label="Step" value={result.transaction.step} />
                      <TransactionField label="Old Balance" value={`$${result.transaction.oldBalanceOrg.toLocaleString()}`} />
                      <TransactionField label="New Balance" value={`$${result.transaction.newBalanceOrig.toLocaleString()}`} />
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

function TransactionField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-secondary/30 p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold font-mono">{value}</p>
    </div>
  );
}
