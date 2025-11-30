import { useState } from "react";
import { Terminal, ArrowRight, Activity, Database, Coins } from "lucide-react";
import { MOCK_SIMULATION_RESULT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Simulator() {
  const [txHash, setTxHash] = useState("");
  const [simulated, setSimulated] = useState(false);

  const handleSimulate = () => {
    if (!txHash) return;
    setSimulated(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Transaction Simulator</h2>
        <p className="text-muted-foreground">Dry-run transactions against the current network state.</p>
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <label className="text-sm font-medium">Transaction Hash / Base64 Instruction</label>
        <div className="flex gap-2">
          <input 
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste transaction hash or base64 payload..."
            className="flex-1 bg-background border border-border rounded-md px-4 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          <button 
            onClick={handleSimulate}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Simulate
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {simulated && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Logs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Terminal className="h-5 w-5 text-primary" />
              <h3>Program Logs</h3>
            </div>
            <div className="bg-black border border-border rounded-lg p-4 font-mono text-xs space-y-1.5 h-[400px] overflow-y-auto">
              {MOCK_SIMULATION_RESULT.logs.map((log, i) => (
                <div key={i} className={cn(
                  "flex gap-3",
                  log.includes("success") ? "text-green-400" : 
                  log.includes("consumed") ? "text-blue-400" : 
                  "text-gray-300"
                )}>
                  <span className="text-gray-700 select-none w-6 text-right">{i + 1}</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-6">
            
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Activity className="h-4 w-4 text-blue-500" />
                <h4>Compute Units</h4>
              </div>
              <div className="text-3xl font-mono font-bold tracking-tighter">
                {MOCK_SIMULATION_RESULT.unitsConsumed.toLocaleString()}
                <span className="text-sm font-sans text-muted-foreground font-normal ml-2">CU</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[2%]"></div>
              </div>
              <p className="text-xs text-muted-foreground">2.1% of max budget (200,000)</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Coins className="h-4 w-4 text-yellow-500" />
                <h4>Balance Changes</h4>
              </div>
              <div className="space-y-3">
                {MOCK_SIMULATION_RESULT.balanceChanges.map((change, i) => (
                  <div key={i} className="text-sm p-3 bg-secondary/50 rounded border border-border/50">
                    <div className="font-mono text-xs text-muted-foreground truncate mb-1">{change.address}</div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-gray-500">{change.before} SOL</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className={cn(
                        change.after > change.before ? "text-green-400" : "text-red-400"
                      )}>
                        {change.after} SOL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
