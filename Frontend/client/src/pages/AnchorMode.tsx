import { useState } from "react";
import { Search, Play, Send, Code2, ChevronRight, Loader2 } from "lucide-react";
import { MOCK_IDL } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnchorMode() {
  const [programId, setProgramId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [idl, setIdl] = useState<typeof MOCK_IDL | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleFetchIdl = () => {
    if (!programId) return;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIdl(MOCK_IDL);
      setIsLoading(false);
      if (MOCK_IDL.instructions.length > 0) {
        setSelectedMethod(MOCK_IDL.instructions[0].name);
      }
    }, 1000);
  };

  const handleSimulate = () => {
    setLogs(["Simulating transaction...", "Fetching latest blockhash...", "Simulation successful! Logs below:"]);
  };

  const currentInstruction = idl?.instructions.find(i => i.name === selectedMethod);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Anchor Auto-Magician</h2>
        <p className="text-muted-foreground">Enter a Program ID to automatically fetch its IDL and generate a UI.</p>
      </div>

      {/* Search Section */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Program ID</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                placeholder="Ex: ChainCall111111111111111111111111111111111"
                className="w-full bg-secondary/50 border border-border rounded-md py-2.5 pl-10 pr-4 text-sm font-mono focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleFetchIdl}
              disabled={isLoading || !programId}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch IDL"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {idl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Methods Sidebar */}
            <div className="bg-card border border-border rounded-lg overflow-hidden h-fit">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  Program Methods
                </h3>
              </div>
              <div className="p-2">
                {idl.instructions.map((instruction) => (
                  <button
                    key={instruction.name}
                    onClick={() => setSelectedMethod(instruction.name)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-md text-sm font-mono transition-colors flex items-center justify-between group",
                      selectedMethod === instruction.name 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {instruction.name}
                    {selectedMethod === instruction.name && <ChevronRight className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-2 space-y-6">
              {currentInstruction && (
                <motion.div 
                  key={currentInstruction.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-mono font-bold text-primary">{currentInstruction.name}</h3>
                      <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">
                        {currentInstruction.args.length} args
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Accounts */}
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Accounts</h4>
                        <div className="grid gap-3">
                          {currentInstruction.accounts.map((acc) => (
                            <div key={acc.name} className="grid grid-cols-3 gap-4 items-center">
                              <label className="text-sm font-mono text-foreground/80 flex items-center gap-2">
                                {acc.name}
                                {acc.isMut && <span className="text-[10px] bg-orange-500/20 text-orange-500 px-1 rounded">MUT</span>}
                                {acc.isSigner && <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1 rounded">SIGNER</span>}
                              </label>
                              <input 
                                className="col-span-2 bg-background border border-border rounded px-3 py-1.5 text-sm font-mono focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Public Key"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Arguments */}
                      {currentInstruction.args.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-border/50">
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Arguments</h4>
                          <div className="grid gap-3">
                            {currentInstruction.args.map((arg) => (
                              <div key={arg.name} className="grid grid-cols-3 gap-4 items-center">
                                <label className="text-sm font-mono text-foreground/80">
                                  {arg.name} <span className="text-muted-foreground text-xs">({arg.type})</span>
                                </label>
                                <input 
                                  className="col-span-2 bg-background border border-border rounded px-3 py-1.5 text-sm font-mono focus:ring-1 focus:ring-primary outline-none"
                                  placeholder={`Value for ${arg.name}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 flex items-center justify-end gap-3">
                    <button 
                      onClick={handleSimulate}
                      className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors border border-border bg-background"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Simulate
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                      <Send className="h-3.5 w-3.5" />
                      Send Transaction
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Logs Output */}
              {logs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-black rounded-lg border border-border p-4 font-mono text-xs"
                >
                  <div className="flex items-center justify-between mb-2 text-muted-foreground">
                    <span>Simulation Logs</span>
                    <button onClick={() => setLogs([])} className="hover:text-foreground">Clear</button>
                  </div>
                  <div className="space-y-1 text-green-400/90">
                    {logs.map((log, i) => (
                      <div key={i} className="break-all">{`> ${log}`}</div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!idl && !isLoading && (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg bg-accent/5">
          <div className="bg-accent/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 opacity-50" />
          </div>
          <p>No IDL loaded. Enter a program ID above to get started.</p>
        </div>
      )}
    </div>
  );
}
