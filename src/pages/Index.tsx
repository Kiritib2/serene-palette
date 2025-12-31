import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ScanCard } from "@/components/dashboard/ScanCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ThreatMap } from "@/components/dashboard/ThreatMap";
import { NetworkMonitor } from "@/components/dashboard/NetworkMonitor";
import { Shield, AlertTriangle, CheckCircle, Activity, Link2, Bot, Network } from "lucide-react";

export default function Index() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePhishingScan = async (url: string) => {
    const suspiciousWords = ['login', 'secure', 'account', 'verify', 'signin', 'banking', 'confirm', 'update'];
    const hasSuspiciousWord = suspiciousWords.some(word => url.toLowerCase().includes(word));
    const hasMultipleDots = (url.match(/\./g) || []).length > 3;
    const hasNumbers = /\d{4,}/.test(url);
    const isHttps = url.includes('https');
    
    const threatScore = (hasSuspiciousWord ? 2 : 0) + (hasMultipleDots ? 2 : 0) + (hasNumbers ? 1 : 0) + (!isHttps ? 1 : 0);
    
    if (threatScore >= 4) {
      return { status: "threat" as const, message: "High Risk - Potential Phishing Detected", details: `Threat Score: ${threatScore}/6 - Multiple indicators found` };
    } else if (threatScore >= 2) {
      return { status: "warning" as const, message: "Medium Risk - Proceed with Caution", details: `Threat Score: ${threatScore}/6 - Some suspicious patterns` };
    }
    return { status: "safe" as const, message: "Low Risk - URL Appears Safe", details: `Threat Score: ${threatScore}/6 - No major concerns` };
  };

  const handleBotScan = async (transactionId: string) => {
    const amount = parseFloat(transactionId) || Math.random() * 10000;
    const isHighValue = amount > 5000;
    const isRoundNumber = amount % 1000 === 0;
    
    if (isHighValue && isRoundNumber) {
      return { status: "threat" as const, message: "Bot Activity Detected", details: "Pattern matches automated transaction behavior" };
    } else if (isHighValue) {
      return { status: "warning" as const, message: "Unusual Transaction Pattern", details: "Transaction flagged for review" };
    }
    return { status: "safe" as const, message: "Transaction Verified", details: "No bot activity detected" };
  };

  const handleNetworkScan = async (ip: string) => {
    const isInternal = ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.');
    const segments = ip.split('.');
    const hasValidFormat = segments.length === 4 && segments.every(s => !isNaN(parseInt(s)) && parseInt(s) <= 255);
    
    if (!hasValidFormat) {
      return { status: "warning" as const, message: "Invalid IP Format", details: "Please enter a valid IP address" };
    }
    
    if (isInternal) {
      return { status: "safe" as const, message: "Internal Network Address", details: "No external threat indicators" };
    }
    
    const threatChance = Math.random();
    if (threatChance > 0.7) {
      return { status: "threat" as const, message: "State-Sponsored Activity Suspected", details: "IP associated with known threat actors" };
    }
    return { status: "safe" as const, message: "No Threats Detected", details: "IP cleared after analysis" };
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        
        <main className="p-4 lg:p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Threats Blocked"
              value="1,247"
              subtitle="Last 24 hours"
              icon={Shield}
              trend={{ value: 12, isPositive: false }}
              variant="primary"
            />
            <StatsCard
              title="Scans Completed"
              value="8,934"
              subtitle="This week"
              icon={CheckCircle}
              trend={{ value: 8, isPositive: true }}
              variant="success"
            />
            <StatsCard
              title="Active Warnings"
              value="23"
              subtitle="Requires attention"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatsCard
              title="System Uptime"
              value="99.9%"
              subtitle="Last 30 days"
              icon={Activity}
              variant="default"
            />
          </div>

          {/* Scan Cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ScanCard
              title="Phishing URL Scanner"
              description="Analyze URLs for phishing indicators"
              icon={<Link2 className="h-5 w-5" />}
              inputPlaceholder="Enter URL to analyze..."
              onScan={handlePhishingScan}
            />
            <ScanCard
              title="Bot Detection"
              description="Detect automated transaction patterns"
              icon={<Bot className="h-5 w-5" />}
              inputPlaceholder="Enter transaction amount..."
              onScan={handleBotScan}
            />
            <ScanCard
              title="Network Analysis"
              description="Check IP addresses for threats"
              icon={<Network className="h-5 w-5" />}
              inputPlaceholder="Enter IP address..."
              onScan={handleNetworkScan}
            />
          </div>

          {/* Bottom Section */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <ThreatMap />
              <NetworkMonitor />
            </div>
            <ActivityFeed />
          </div>
        </main>
      </div>
    </div>
  );
}
