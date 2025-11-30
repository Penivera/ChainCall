import { useState } from "react";
import { Plus, Trash2, ArrowDown, Copy } from "lucide-react";
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

  const addField = () => {
    setFields([...fields, { id: Math.random().toString(), type: "u8", value: "" }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  // Mock hex generation
  const generateHex = () => {
    return fields.map(f => {
      if (f.type === "u8") return "01";
      if (f.type === "string") return "48 65 6c 6c 6f"; // "Hello" in hex
      return "00 00 00 00";
    }).join(" ");
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      
      {/* Left Column: Builder */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Instruction Builder</h2>
          <p className="text-muted-foreground">Manually pack bytes for raw instructions.</p>
        </div>

        <div className="bg-card border border-border rounded-lg flex-1 flex flex-col overflow-hidden">
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

          <div className="p-4 space-y-2 overflow-y-auto flex-1">
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
                    className="col-span-3 bg-background border border-border rounded px-2 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
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
                    className="col-span-8 bg-background border border-border rounded px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
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

      {/* Right Column: Hex Preview */}
      <div className="space-y-6 flex flex-col">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Output Buffer</h2>
          <p className="text-muted-foreground text-sm">Real-time hex view of your instruction data.</p>
        </div>

        <div className="bg-black border border-border rounded-lg p-4 font-mono text-sm text-green-400/90 flex-1 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <button className="text-muted-foreground hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="break-all leading-relaxed tracking-wide">
            {generateHex()}
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground mb-2">Summary</h4>
          <div className="flex justify-between">
            <span>Total Bytes:</span>
            <span className="font-mono">{generateHex().replace(/ /g, '').length / 2}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
