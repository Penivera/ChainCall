import { useState, useEffect } from "react";
import { Search, Loader2, Play, Box, Key, X, ArrowRight, Wallet, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PublicKey } from "@solana/web3.js";

interface IdlArg {
  name: string;
  type: string | object;
}

interface IdlAccount {
  name: string;
  isMut: boolean;
  isSigner: boolean;
}

interface IdlInstruction {
  name: string;
  accounts: IdlAccount[];
  args: IdlArg[];
}

interface FetchedIdl {
  methods: IdlInstruction[];
}

interface ApiSendTxRequest {
  rpc_url: string;
  program_id: string;
  accounts: Array<{
    pubkey: string;
    is_signer: boolean;
    is_writable: boolean;
  }>;
  instruction_data: string;
  sign_with_backend: boolean;
  fee_payer: string;
}

import { Buffer } from 'buffer';

function getInstructionDiscriminator(instructionName: string): Buffer {
  const hash = require('js-sha256').sha256(`global:${instructionName}`);
  return Buffer.from(hash, 'hex').slice(0, 8);
}

export default function AnchorMode() {
  const [programId, setProgramId] = useState("");
  const [network, setNetwork] = useState("mainnet");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idl, setIdl] = useState<FetchedIdl | null>(null);
  const [selectedInstruction, setSelectedInstruction] = useState<IdlInstruction | null>(null);

  const isValidProgramId = (value: string) => {
    try { new PublicKey(value); return true; } catch { return false; }
  };
  const isProgramIdValid = isValidProgramId(programId);

  const handleFetchIdl = async () => {
    setIsLoading(true);
    setIdl(null);
    setError(null);

    try {
      const rpcUrl = network === "mainnet" 
        ? "https://api.mainnet-beta.solana.com" 
        : "https://api.devnet.solana.com";

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/solana/idl/${programId}/methods?rpc_url=${encodeURIComponent(rpcUrl)}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch IDL (${res.status})`);
      }

      const data: FetchedIdl = await res.json();
      setIdl(data);
    } catch (err: any) {
      console.error("Error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Header + Input Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Anchor Mode</h2>
            <p className="text-muted-foreground mt-1">Fetch and explore on-chain program IDLs.</p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="w-32 space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">Network</label>
              <div className="relative">
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-background/50 border border-border/50 rounded-lg py-3 px-3 font-mono text-sm focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="mainnet">Mainnet</option>
                  <option value="devnet">Devnet</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">Program ID</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="Ex: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                  className="w-full bg-background/50 border border-border/50 rounded-lg py-3 pl-10 pr-4 font-mono text-sm focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleFetchIdl}
              disabled={isLoading || !isProgramIdValid}
              className={cn(
                "px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm",
                isLoading || !isProgramIdValid
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Fetch IDL
            </button>
          </div>
        </div>

        {/* Table Section - Shows skeleton or real data */}
        <div className="border border-border/40 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-sm">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm border-b border-destructive/20 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {error}
            </div>
          )}
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/30 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4 font-mono w-1/4">Instruction Name</th>
                <th className="px-6 py-4 font-mono w-1/2">Required Arguments</th>
                <th className="px-6 py-4 text-right w-1/4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                // Skeleton rows while loading
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted" />
                        <div className="h-4 w-32 bg-muted rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-muted rounded" />
                        <div className="h-6 w-24 bg-muted rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-7 w-16 bg-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : idl && idl.methods ? (
                // Real data
                idl.methods.map((ix, idx) => (
                  <tr key={idx} className="group hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors" />
                        {ix.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {ix.args.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {ix.args.map((arg, i) => (
                            <span key={i} className="bg-secondary/50 px-2 py-1 rounded text-xs border border-border/50">
                              {arg.name}
                            </span>
                          ))}
                        </div>
                      ) : <span className="opacity-30 italic">No arguments</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedInstruction(ix)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all"
                      >
                        <Play className="h-3 w-3 fill-current" /> Run
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state - skeleton placeholder
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="opacity-40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted/50" />
                        <div className="h-4 w-32 bg-muted/30 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-muted/30 rounded" />
                        <div className="h-6 w-24 bg-muted/30 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-7 w-16 bg-muted/30 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedInstruction && (
          <ExecutorModal 
            instruction={selectedInstruction} 
            programId={programId}
            onClose={() => setSelectedInstruction(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExecutorModal({ 
    instruction, 
    programId, 
    onClose 
}: { 
    instruction: IdlInstruction; 
    programId: string;
    onClose: () => void 
}) {
    const [isSending, setIsSending] = useState(false);
    const [responseStatus, setResponseStatus] = useState<number | null>(null);
    const [responseMessage, setResponseMessage] = useState<string>("");
    
    const [argValues, setArgValues] = useState<Record<string, string>>({});
    const [accountValues, setAccountValues] = useState<Record<string, string>>({});

    const handleSend = async () => {
        setIsSending(true);
        setResponseStatus(null);
        setResponseMessage("");

        const discriminator = getInstructionDiscriminator(instruction.name);
        
        try {
            const argsBuffer = Buffer.alloc(1024);
            let offset = 0;
            
            discriminator.copy(argsBuffer, offset);
            offset += 8;
            
            for (const arg of instruction.args) {
                const value = argValues[arg.name];
                const argType = typeof arg.type === 'string' ? arg.type : 'string';
                
                if (argType === 'u64' || argType === 'u128') {
                    const bn = BigInt(value || '0');
                    argsBuffer.writeBigUInt64LE(bn, offset);
                    offset += 8;
                } else if (argType === 'u32') {
                    argsBuffer.writeUInt32LE(parseInt(value || '0'), offset);
                    offset += 4;
                } else if (argType === 'u16') {
                    argsBuffer.writeUInt16LE(parseInt(value || '0'), offset);
                    offset += 2;
                } else if (argType === 'u8') {
                    argsBuffer.writeUInt8(parseInt(value || '0'), offset);
                    offset += 1;
                } else if (argType === 'string') {
                    const strBytes = Buffer.from(value || '', 'utf8');
                    argsBuffer.writeUInt32LE(strBytes.length, offset);
                    offset += 4;
                    strBytes.copy(argsBuffer, offset);
                    offset += strBytes.length;
                } else if (argType === 'bool') {
                    argsBuffer.writeUInt8(value === 'true' ? 1 : 0, offset);
                    offset += 1;
                } else if (argType === 'publicKey' || argType === 'PublicKey') {
                    try {
                        const pubkey = new PublicKey(value);
                        const pubkeyBytes = pubkey.toBuffer();
                        pubkeyBytes.copy(argsBuffer, offset);
                        offset += 32;
                    } catch {
                        throw new Error(`Invalid PublicKey for ${arg.name}`);
                    }
                } else {
                    const strBytes = Buffer.from(value || '', 'utf8');
                    argsBuffer.writeUInt32LE(strBytes.length, offset);
                    offset += 4;
                    strBytes.copy(argsBuffer, offset);
                    offset += strBytes.length;
                }
            }
            
            const finalBuffer = argsBuffer.slice(0, offset);
            const instructionData = finalBuffer.toString('base64');

            const payload: ApiSendTxRequest = {
                rpc_url: "https://api.devnet.solana.com",
                program_id: programId,
                accounts: instruction.accounts.map(acc => ({
                    pubkey: accountValues[acc.name] || "",
                    is_signer: acc.isSigner,
                    is_writable: acc.isMut
                })),
                instruction_data: instructionData,
                sign_with_backend: false,
                fee_payer: accountValues['authority'] || accountValues['payer'] || ""
            };

            const res = await fetch("https://chaincall.onrender.com/solana/tx/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            setResponseStatus(res.status);
            const json = await res.json();

            if (res.ok) {
                setResponseMessage(json.signature || "Transaction sent successfully!");
            } else {
                setResponseMessage(json.error || `Error: ${res.status}`);
            }

        } catch (error: any) {
            setResponseStatus(500);
            setResponseMessage(error.message || "Failed to send transaction");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-muted/20">
                    <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                           <Box className="h-4 w-4 text-primary" /> 
                           Execute: <span className="font-mono text-primary">{instruction.name}</span>
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors"><X className="h-4 w-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {instruction.args.length > 0 && (
                        <div className="space-y-4">
                             <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                Variables (Arguments)
                             </h4>
                             <div className="grid gap-3">
                                {instruction.args.map((arg, i) => (
                                    <div key={i} className="flex flex-col space-y-1.5">
                                        <label className="text-sm font-medium flex justify-between">
                                            {arg.name}
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {typeof arg.type === 'string' ? arg.type : 'custom'}
                                            </span>
                                        </label>
                                        <input 
                                            value={argValues[arg.name] || ""}
                                            onChange={(e) => setArgValues(prev => ({...prev, [arg.name]: e.target.value}))}
                                            placeholder={`Value for ${arg.name}`}
                                            className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                                        />
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                           <Key className="h-3 w-3" /> Accounts Config
                        </h4>
                        <div className="grid gap-3">
                            {instruction.accounts.map((acc, i) => (
                                <div key={i} className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        {acc.name}
                                        <div className="flex gap-1">
                                            {acc.isMut && <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded border border-orange-500/20">Writable</span>}
                                            {acc.isSigner && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">Signer</span>}
                                        </div>
                                    </label>
                                    <input 
                                        value={accountValues[acc.name] || ""}
                                        onChange={(e) => setAccountValues(prev => ({...prev, [acc.name]: e.target.value}))}
                                        placeholder="Public Key"
                                        className="bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border/40 bg-muted/10 space-y-3">
                    <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className={cn(
                            "w-full h-10 rounded-md font-medium text-sm flex items-center justify-center transition-all",
                            isSending ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Transaction"}
                    </button>
                    
                    {responseStatus && (
                        <div className="space-y-2">
                            <div className={cn("text-xs text-center font-mono py-2 rounded", responseStatus === 200 ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
                                Status: {responseStatus}
                            </div>
                            {responseMessage && (
                                <div className="text-xs text-center font-mono py-2 rounded bg-muted/50 break-all">
                                    {responseMessage}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}