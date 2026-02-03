"use client";
// Force Vercel Rebuild: v1.2.2


import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Terminal, Shield, Settings, Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import NavItem from "@/components/NavItem";
import Laboratory from "@/components/Laboratory";
import Vault from "@/components/Vault";
import TelemetryDeck from "@/components/TelemetryDeck";

type View = "hangar" | "laboratory" | "valuables" | "settings";

export default function Home() {
  const [activeView, setActiveView] = useState<View>("hangar");
  const [isDeploying, setIsDeploying] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
          html: `<!DOCTYPE html>
<html>
<head>
  <style>
    :root { --primary: #FF4F00; --text: #1a1a1a; --border: #e2e8f0; }
    body { font-family: sans-serif; padding: 60px; color: var(--text); line-height: 1.5; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
    .logo { background: var(--primary); color: white; padding: 10px 20px; font-weight: 900; letter-spacing: -0.05em; font-size: 24px; }
    .invoice-details { text-align: right; }
    .label { text-transform: uppercase; font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 4px; }
    .value { font-weight: 700; font-size: 14px; }
    .bill-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 60px; }
    .bill-to h3 { margin: 0 0 10px 0; font-size: 16px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 60px; }
    th { text-align: left; padding: 12px 0; border-bottom: 2px solid var(--text); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
    td { padding: 20px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
    .total-section { display: flex; justify-content: flex-end; }
    .total-box { background: #f8fafc; padding: 30px; width: 250px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .grand-total { border-top: 2px solid var(--text); margin-top: 15px; padding-top: 15px; font-weight: 900; font-size: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PDF-JET</div>
    <div class="invoice-details">
      <div class="label">Invoice No</div>
      <div class="value">#JET-2024-001</div>
    </div>
  </div>
  <div class="bill-grid">
    <div class="bill-to">
      <div class="label">Bill To</div>
      <h3>ACME CORP</h3>
      <p style="font-size: 12px; color: #475569; margin: 0;">123 Station St.</p>
    </div>
  </div>
  <table>
    <thead><tr><th>Item</th><th style="text-align: right;">Total</th></tr></thead>
    <tbody>
      <tr><td><strong>Engine Optimization</strong></td><td style="text-align: right;">$1,499.00</td></tr>
    </tbody>
  </table>
  <div class="total-section">
    <div class="total-box">
      <div class="total-row grand-total"><span>TOTAL</span><span>$1,499.00</span></div>
    </div>
  </div>
</body>
</html>`,
          options: { format: "A4" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Details:", errorData);
        throw new Error(errorData.message || "Deployment Failed");
      }

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
      alert(`Deployment Failed: ${error instanceof Error ? error.message : "Check Console"}`);
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
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">v1.2.1 / PROD</p>
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

        <div className="p-4 border border-[var(--border)] mt-auto space-y-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Operator</div>
            <div className="text-[11px] font-bold truncate mt-1 text-primary">{user?.email || "INITIALIZING..."}</div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 text-[10px] border border-[var(--border)] hover:bg-destructive/10 hover:text-destructive transition-colors uppercase tracking-[0.2em] font-bold"
          >
            Terminal_Exit
          </button>

          <div className="pt-4 border-t border-[var(--border)]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Signal</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-widest">OPERATIONAL</span>
            </div>
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

      {activeView === "valuables" && <Vault user={user} />}

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


