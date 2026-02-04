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
      {/* Sidebar - Dark Mode 2.0 Glassmorphism */}
      <aside className="w-64 border-r border-white/10 p-4 flex flex-col shrink-0 bg-black/40 backdrop-blur-xl relative z-50">
        <div className="mb-8 pl-2 relative">
          <div className="absolute -left-2 top-0 w-1 h-full bg-primary/20 blur shadow-[0_0_10px_var(--primary)]" />
          <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">PDF-JET</h1>
          <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">v1.2.2 / PROD</p>
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

        <div className="p-4 border border-white/10 mt-auto space-y-4 bg-white/5 rounded-sm">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Operator</div>
            <div className="text-[11px] font-bold truncate mt-1 text-primary">{user?.email || "INITIALIZING..."}</div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 text-[10px] border border-white/10 hover:bg-red-500/10 hover:text-red-400 transition-colors uppercase tracking-[0.2em] font-bold text-white/70"
          >
            Terminal_Exit
          </button>

          <div className="pt-4 border-t border-white/10">
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Signal</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-bold tracking-widest text-emerald-500">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {activeView === "hangar" && (
        <main className="flex-1 p-8 overflow-auto bg-[#09090b]">
          <header className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">The Hangar</h2>
              <span className="text-[10px] border border-border px-2 py-0.5 text-muted-foreground bg-accent/20">ACTIVE_FLEET</span>
            </div>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:shadow-[0_0_20px_rgba(255,79,0,0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isDeploying ? <Loader2 className="animate-spin" size={16} /> : null}
              {isDeploying ? "DEPLOYING..." : "DEPLOY DOCUMENT"}
            </button>
          </header>

          <TelemetryDeck />

          <div className="border border-border/40 bg-black/20">
            <div className="grid grid-cols-4 p-3 border-b border-border/40 bg-muted/10 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
              <div>Status</div>
              <div>ID_CODE</div>
              <div>Template</div>
              <div>Timestamp</div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-xs items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="font-bold text-emerald-500">200_OK</span>
                </div>
                <div className="font-mono text-muted-foreground opacity-70">jet_{Math.random().toString(36).substring(7)}</div>
                <div><span className="px-2 py-1 border border-white/10 text-[10px] font-bold bg-white/5">INVOICE_V1</span></div>
                <div className="text-muted-foreground tabular-nums">14:02:12</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeView === "laboratory" && <Laboratory />}

      {activeView === "valuables" && <Vault user={user} />}

      {(activeView === "settings") && (
        <main className="flex-1 p-8 flex flex-col bg-[#09090b]">
          <header className="flex justify-between items-center mb-12 border-b border-border/40 pb-4 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Settings</h2>
              <span className="text-[10px] border border-border px-2 py-0.5 text-muted-foreground bg-accent/20">CONFIGURATION</span>
            </div>
            <button className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              Documentation ↗
            </button>
          </header>

          <div className="max-w-2xl space-y-12">
            {/* Section 1: Subscription */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" /> Subscription
              </h3>
              <div className="p-6 border border-white/10 bg-white/5 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-white select-none">PRO</div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-xl font-bold text-white mb-2">Pro Plan</div>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      You are currently on the Pro tier. Your next billing date is <span className="text-white">March 01, 2026</span>.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-white">$29<span className="text-sm text-muted-foreground">/mo</span></div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={async () => {
                      try {
                        // 1. Create Order on Server
                        const orderRes = await fetch("/api/v1/billing/create-order", { method: "POST" });
                        const { orderId, error: orderError } = await orderRes.json();

                        if (orderError) throw new Error(orderError);

                        // 2. Open Razorpay
                        const options = {
                          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                          amount: 250000,
                          currency: "INR",
                          name: "PDF-JET Pro",
                          description: "Monthly Subscription",
                          order_id: orderId,
                          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                            // 3. Verify Payment on Server
                            const verifyRes = await fetch("/api/v1/billing/verify", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                              }),
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                              alert("WELCOME TO PRO TIER! 🚀");
                              window.location.reload();
                            } else {
                              alert("Verification Failed: " + verifyData.error);
                            }
                          },
                          prefill: {
                            email: user?.email || "",
                          },
                          theme: {
                            color: "#FF4F00",
                          },
                        };

                        interface RazorpayWindow extends Window {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          Razorpay: any;
                        }
                        const rzp = new (window as unknown as RazorpayWindow).Razorpay(options);
                        rzp.open();

                      } catch (error) {
                        const err = error as Error;
                        alert("Billing Error: " + err.message);
                      }
                    }}
                    className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:opacity-90"
                  >
                    Manage Billing
                  </button>
                  <button className="px-4 py-2 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10">View Invoices</button>
                </div>
              </div>
            </section>

            {/* Section 2: Profile */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Profile Identity</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border border-white/10 bg-black/20">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Email Address</label>
                  <div className="font-mono text-sm text-white">{user?.email || "loading..."}</div>
                </div>
                <div className="p-4 border border-white/10 bg-black/20">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Account ID</label>
                  <div className="font-mono text-sm text-muted-foreground truncate">{user?.id || "..."}</div>
                </div>
              </div>
            </section>

            {/* Section 3: Dangerous Zone */}
            <section className="opacity-50 hover:opacity-100 transition-opacity">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-red-500/70 mb-6">Danger Zone</h3>
              <div className="p-4 border border-red-900/30 bg-red-950/10 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-red-400">Delete Account</div>
                  <p className="text-[10px] text-red-300/50 mt-1">Permanently remove all data and templates. This cannot be undone.</p>
                </div>
                <button className="text-[10px] text-red-500 border border-red-900/50 px-3 py-1.5 hover:bg-red-900/20">TERMINATE</button>
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}


