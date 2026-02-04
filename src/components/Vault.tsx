"use client";

import { useState } from "react";
import { Copy, Shield, RefreshCw, Eye, EyeOff, Activity, Lock } from "lucide-react";
import { User } from "@supabase/supabase-js";

export default function Vault({ user }: { user: User | null }) {
    // For now, keys are handled locally or via an upcoming 'keys' table.
    // We will show 0 keys and a prompt to create one.
    const [keys, setKeys] = useState<{ id: string; label: string; prefix: string; created: string }[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [freshKey, setFreshKey] = useState<string | null>(null);

    const handleRollKey = async () => {
        if (!confirm("This will generate a new secret key. You must save it immediately.")) return;

        try {
            const res = await fetch("/api/v1/keys/roll", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                setFreshKey(data.apiKey);
                // In a real app, we would re-fetch the list here. 
                // For this MVP, we will optimistically add it to the UI list (mocking the ID/Date for speed)
                setKeys(prev => [...prev, {
                    id: crypto.randomUUID(),
                    label: "Production Key",
                    prefix: "sk_live_",
                    created: new Date().toISOString().split('T')[0]
                }]);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Failed to roll key");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-mono">
            <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[#0A0A0A]">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-lg uppercase tracking-wider text-white">The Vault</h2>
                    <span className="text-[10px] bg-red-900/40 text-red-500 px-2 py-0.5 border border-red-900 uppercase font-bold tracking-widest flex items-center gap-2">
                        <Lock size={10} />
                        Restricted Area
                    </span>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="tracking-widest uppercase">Operator:</span>
                        <span className="text-primary font-bold">{user?.email || "UNKNOWN"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        <span className="tracking-widest uppercase">Encryption: AES-256</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-auto">

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="border border-[var(--border)] p-4 relative group hover:border-primary transition-colors bg-black/20">
                        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity text-primary"><Activity size={16} /></div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total Requests</div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 italic">Awaiting API traffic...</div>
                    </div>
                    <div className="border border-[var(--border)] p-4 relative group hover:border-primary transition-colors bg-black/20">
                        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity text-primary"><Shield size={16} /></div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Active Keys</div>
                        <div className="text-2xl font-bold">00</div>
                        <div className="text-[10px] text-muted-foreground mt-1">No Keys Provisioned</div>
                    </div>
                    <div className="border border-[var(--border)] p-4 relative group hover:border-primary transition-colors bg-black/20">
                        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity text-success"><Lock size={16} /></div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Security Status</div>
                        <div className="text-2xl font-bold text-success font-bold uppercase text-sm">Optimal</div>
                        <div className="text-[10px] text-muted-foreground mt-1 text-success">All Protocols Active</div>
                    </div>
                </div>

                {/* API Keys Table */}
                <div className="border border-[var(--border)] mb-8 bg-black/10">
                    <div className="h-10 bg-muted/30 border-b border-[var(--border)] flex items-center px-4 justify-between">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-white/50">Access Credentials</h3>
                        <button className="text-[10px] bg-primary text-black px-3 py-1 font-bold uppercase hover:opacity-90 transition-opacity flex items-center gap-2">
                            <RefreshCw size={10} />
                            Roll New Key
                        </button>
                    </div>

                    <div className="grid grid-cols-4 p-3 border-b border-[var(--border)] bg-input text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        <div>Label</div>
                        <div>Token</div>
                        <div>Created</div>
                        <div>Action</div>
                    </div>

                    {keys.length > 0 ? (
                        keys.map((key) => (
                            <div key={key.id} className="grid grid-cols-4 p-4 border-b border-[var(--border)] hover:bg-muted/20 transition-colors text-xs items-center group">
                                <div className="font-bold">{key.label}</div>
                                <div className="font-mono text-muted-foreground flex items-center gap-2">
                                    <span className="text-primary">{key.prefix}</span>
                                    <span className={isVisible ? "text-foreground" : "blur-sm select-none transition-all"}>
                                        {isVisible ? key.secret.replace("re_", "") : "•••••••••••••••••••••"}
                                    </span>
                                    <button onClick={() => setIsVisible(!isVisible)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-white">
                                        {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                </div>
                                <div className="text-muted-foreground tabular-nums">{key.created}</div>
                                <div className="flex items-center gap-2">
                                    <button className="border border-[var(--border)] px-2 py-1 text-[10px] uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1" onClick={() => alert("Copied!")}>
                                        <Copy size={10} /> Copy
                                    </button>
                                    <button className="border border-[var(--border)] px-2 py-1 text-[10px] uppercase hover:bg-error hover:text-white hover:border-error transition-colors text-muted-foreground">
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-center opacity-40">
                            <Shield size={32} className="mb-4 text-muted-foreground" />
                            <div className="text-[10px] uppercase font-bold tracking-[0.2em]">No Credentials Provisioned</div>
                            <p className="text-[8px] text-muted-foreground mt-2 max-w-[250px] uppercase tracking-wider">Your API keys will appear here once you roll your first secret.</p>
                        </div>
                    )}
                </div>

                {/* Usage Graph Mock - Clean Replacement */}
                <div className="border border-white/5 p-12 flex flex-col items-center justify-center text-center h-48 bg-black/40">
                    <Activity className="text-muted-foreground mb-4 opacity-10" size={32} />
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Analytics Engine Offline</div>
                    <div className="text-[8px] text-muted-foreground mt-1 max-w-sm uppercase tracking-tighter opacity-50">
                        Traffic visualization is enabled for enterprise accounts with &gt; 10,000 monthly requests.
                    </div>
                </div>

            </div>
        </div>
    );
}
