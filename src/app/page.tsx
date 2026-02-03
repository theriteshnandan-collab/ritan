"use client";

import { Terminal, FileText, Settings, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import Laboratory from "@/components/Laboratory";
import Vault from "@/components/Vault";
import TelemetryDeck from "@/components/TelemetryDeck";

type View = "hangar" | "laboratory" | "valuables" | "settings";

export default function Home() {
  const [activeView, setActiveView] = useState<View>("hangar");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch("/api/v1/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer re_live_demo_key_123"
        },
        body: JSON.stringify({
          html: "<h1>Hello from PDF-Jet</h1><p>This is a test document.</p>",
          options: { format: "A4" }
        })
      });

      if (!response.ok) throw new Error("Deployment Failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "test-document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Deployment Failed: Check Console");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-mono overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] p-4 flex flex-col shrink-0">
        <div className="mb-8 pl-2">
          <h1 className="text-xl font-bold tracking-tight text-white">PDF-JET</h1>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">v1.2.0 / PROD</p>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem
            icon={<FileText size={16} />}
            label="Hangar"
            active={activeView === "hangar"}
            onClick={() => setActiveView("hangar")}
          />
          <NavItem
            icon={<Terminal size={16} />}
            label="Laboratory"
            active={activeView === "laboratory"}
            onClick={() => setActiveView("laboratory")}
          />
          <NavItem
            icon={<Shield size={16} />}
            label="Vault"
            active={activeView === "valuables"}
            onClick={() => setActiveView("valuables")}
          />
          <NavItem
            icon={<Settings size={16} />}
            label="Settings"
            active={activeView === "settings"}
            onClick={() => setActiveView("settings")}
          />
        </nav>

        <div className="p-4 border border-[var(--border)] mt-auto">
          <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Signal</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-bold tracking-widest">OPERATIONAL</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {activeView === "hangar" && (
        <main className="flex-1 p-8 overflow-auto">
          <header className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight">The Hangar</h2>
              <span className="text-[10px] border border-[var(--border)] px-2 py-0.5 text-muted-foreground">ACTIVE_FLEET</span>
            </div>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isDeploying ? <Loader2 className="animate-spin" size={16} /> : null}
              {isDeploying ? "DEPLOYING..." : "DEPLOY DOCUMENT"}
            </button>
          </header>

          <TelemetryDeck />

          <div className="border border-[var(--border)]">
            <div className="grid grid-cols-4 p-3 border-b border-[var(--border)] bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
              <div>Status</div>
              <div>ID_CODE</div>
              <div>Template</div>
              <div>Timestamp</div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-4 p-4 border-b border-[var(--border)] hover:bg-muted/50 transition-colors text-xs items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span className="font-bold">200_OK</span>
                </div>
                <div className="font-mono text-muted-foreground opacity-70">jet_{Math.random().toString(36).substring(7)}</div>
                <div><span className="px-2 py-1 border border-[var(--border)] text-[10px] font-bold">INVOICE_V1</span></div>
                <div className="text-muted-foreground tabular-nums">14:02:12</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeView === "laboratory" && <Laboratory />}

      {activeView === "valuables" && <Vault />}

      {(activeView === "settings") && (
        <main className="flex-1 p-8 flex items-center justify-center bg-input/20">
          <div className="text-center">
            <div className="w-12 h-12 border border-[var(--border)] flex items-center justify-center mx-auto mb-6">
              <Settings className="text-muted-foreground animate-spin-slow" size={20} />
            </div>
            <h2 className="text-lg font-bold mb-2 uppercase tracking-[0.3em]">{activeView}</h2>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Restricted Access / Under Construction</p>
          </div>
        </main>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] transition-all uppercase tracking-widest font-bold border-l-2 ${active ? "bg-muted text-primary border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border-transparent"}`}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
