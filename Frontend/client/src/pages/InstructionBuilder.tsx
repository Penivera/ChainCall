import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldType = "u8" | "u16" | "u32" | "u64" | "string" | "pubkey";

interface Field {
  id: string;
  type: FieldType;
  value: string;
}

export default function InstructionBuilder() {
  const [fields, setFields] = useState<Field[]>([
    { id: "1", type: "u8", value: "1" },
    { id: "2", type: "string", value: "Hello" }
  ]);
  
  const [bufferHex, setBufferHex] = useState<string>("");
  const [isPacking, setIsPacking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addField = () => {
    setFields([...fields, { id: Math.random().toString(), type: "u8", value: "" }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const packInstruction = useCallback(async () => {
    const validFields = fields.every(f => f.value.trim() !== "");
    if (!validFields) return; 

    setIsPacking(true);
    setError(null);

    try {
      const payload = {
        layout: fields.map(f => {
          if (["u8", "u16", "u32", "u64"].includes(f.type)) {
             const num = Number(f.value);
             return { type: f.type, value: isNaN(num) ? 0 : num };
          }
          return { type: f.type, value: f.value };
        })
      };

      const res = await fetch("https://chaincall.onrender.com/solana/instruction/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to pack instruction");
      }

      setBufferHex(data.buffer_hex);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error packing data");
    } finally {
      setIsPacking(false);
    }
  }, [fields]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fields.length > 0) packInstruction();
    }, 500);

    return () => clearTimeout(timer);
  }, [packInstruction, fields]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Instruction Builder Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Instruction Builder</h2>
            <p className="text-muted-foreground mt-1">Manually pack bytes for raw instructions.</p>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <span className="font-mono text-sm font-medium">Byte Layout</span>
              <button 
                onClick={addField}
                className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Field
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="group flex items-start gap-2">
                  <div className="flex flex-col items-center pt-2 gap-1">
                    <div className="w-6 h-6 rounded-full bg-accent text-muted-foreground text-xs flex items-center justify-center font-mono">
                      {index}
                    </div>
                    {index < fields.length - 1 && <div className="w-px h-full bg-border" />}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-12 gap-2 bg-secondary/30 p-3 rounded-md border border-transparent group-hover:border-border transition-colors">
                    <select 
                      value={field.type}
                      onChange={(e) => updateField(field.id, "type", e.target.value as FieldType)}
                      className="col-span-3 sm:col-span-3 bg-background border border-border rounded px-2 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="u8">u8</option>
                      <option value="u16">u16</option>
                      <option value="u32">u32</option>
                      <option value="u64">u64</option>
                      <option value="string">string</option>
                      <option value="pubkey">Pubkey</option>
                    </select>
                    
                    <input 
                      value={field.value}
                      onChange={(e) => updateField(field.id, "value", e.target.value)}
                      placeholder="Value"
                      className="col-span-8 sm:col-span-8 bg-background border border-border rounded px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
                    />

                    <button 
                      onClick={() => removeField(field.id)}
                      className="col-span-1 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Buffer Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Output Buffer</h2>
            <p className="text-muted-foreground mt-1">Real-time hex view of your instruction data.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hex Display */}
            <div className="lg:col-span-2 bg-black border border-border rounded-lg p-4 font-mono text-sm min-h-[200px] relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {isPacking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <button 
                  onClick={() => navigator.clipboard.writeText(bufferHex)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy Hex"
                  disabled={!bufferHex}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="break-all leading-relaxed tracking-wide text-green-400/90 pr-12 max-h-[300px] overflow-y-auto">
                {error ? (
                  <span className="text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </span>
                ) : (
                  bufferHex || <span className="text-muted-foreground opacity-50">No data yet...</span>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Bytes:</span>
                  <span className="font-mono bg-background px-2 py-1 rounded border border-border/50 font-medium">
                    {bufferHex ? bufferHex.length / 2 : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fields:</span>
                  <span className="font-mono bg-background px-2 py-1 rounded border border-border/50 font-medium">
                    {fields.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}