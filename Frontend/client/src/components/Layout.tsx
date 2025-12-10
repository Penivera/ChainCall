import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Binary, 
  TerminalSquare, 
  Settings, 
  Zap,
  Wallet,
  Globe,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Anchor Auto-Magician", icon: Zap },
    { href: "/builder", label: "Instruction Builder", icon: Binary },
    { href: "/simulator", label: "Transaction Simulator", icon: TerminalSquare },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Box className="h-6 w-6" />
            <h1 className="font-bold text-lg tracking-tight">ChainCall</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">v0.1.0-beta</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-accent/30 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="mb-2">Status: <span className="text-green-500 font-mono">Online</span></p>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[98%] animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-md border border-border w-full">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">RPC URL:</span>
              <input 
                type="text" 
                defaultValue="https://api.devnet.solana.com"
                className="bg-transparent border-none outline-none text-sm font-mono text-foreground w-full placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
          {children}
        </div>
      </main>
    </div>
  );
}
