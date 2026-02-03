"use client";

import { useState, useEffect } from "react";
import { Loader2, Play, Download } from "lucide-react";

export default function Laboratory() {
    const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    :root { --primary: #FF4F00; --text: #1a1a1a; --border: #e2e8f0; }
    body { font-family: 'Inter', system-ui, sans-serif; padding: 60px; color: var(--text); line-height: 1.5; margin: 0; }
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
      <div style="margin-top: 15px;">
        <div class="label">Issue Date</div>
        <div class="value">Feb 03, 2026</div>
      </div>
    </div>
  </div>

  <div class="bill-grid">
    <div class="bill-to">
      <div class="label">Bill To</div>
      <h3>ACME CORP INTERNATIONAL</h3>
      <p style="font-size: 12px; color: #475569; margin: 0;">123 Innovation Drive<br>Silicon Valley, CA 94025</p>
    </div>
    <div class="bill-from">
      <div class="label">Issued By</div>
      <h3>PDF-JET INC.</h3>
      <p style="font-size: 12px; color: #475569; margin: 0;">Antigravity HQ<br>Orbit-1, Digital Space</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cloud PDF API Tier 1</strong><br><span style="font-size: 11px; color: #64748b;">Unlimited renders, high-priority queue.</span></td>
        <td style="text-align: right;">1</td>
        <td style="text-align: right;">$499.00</td>
        <td style="text-align: right;">$499.00</td>
      </tr>
      <tr>
        <td><strong>Custom Template Design</strong><br><span style="font-size: 11px; color: #64748b;">Bespoke "Industrial Glass" PDF styling.</span></td>
        <td style="text-align: right;">4</td>
        <td style="text-align: right;">$250.00</td>
        <td style="text-align: right;">$1,000.00</td>
      </tr>
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="total-row">
        <span class="label">Subtotal</span>
        <span class="value">$1,499.00</span>
      </div>
      <div class="total-row">
        <span class="label">Tax (0%)</span>
        <span class="value">$0.00</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL</span>
        <span>$1,499.00</span>
      </div>
    </div>
  </div>
</body>
</html>`);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generatePreview = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/v1/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html }),
            });

            if (!response.ok) throw new Error("Preview Generation Failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = "template-preview.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Generate initial preview on mount
    useEffect(() => {
        generatePreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-mono">
            <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-lg">The Laboratory</h2>
                    <span className="text-[10px] bg-muted px-2 py-0.5 border border-[var(--border)] text-muted-foreground uppercase">Draft</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={generatePreview}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs border border-[var(--border)] hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                        RUN RENDER
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!pdfUrl || isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs border border-[var(--border)] bg-foreground text-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Download size={12} />
                        EXPORT
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Panel */}
                <div className="w-1/2 border-r border-[var(--border)] flex flex-col">
                    <div className="h-8 bg-muted border-b border-[var(--border)] flex items-center px-4 shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">template.html</span>
                    </div>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        className="flex-1 w-full bg-white text-black p-6 text-sm outline-none resize-none font-mono focus:ring-1 focus:ring-primary/20 leading-relaxed"
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                    />
                </div>

                {/* Preview Panel */}
                <div className="w-1/2 bg-[#121212] flex flex-col">
                    <div className="h-8 bg-muted border-b border-[var(--border)] flex items-center px-4 shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Preview</span>
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Loader2 size={32} className="animate-spin text-primary" />
                                <span className="text-xs uppercase tracking-[0.2em]">Processing Signal...</span>
                            </div>
                        ) : pdfUrl ? (
                            <iframe
                                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full bg-white shadow-2xl border border-[var(--border)]"
                                style={{ aspectRatio: '1 / 1.414' }}
                            />
                        ) : (
                            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Awaiting Render Signal</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
