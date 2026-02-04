import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import puppeteer, { PaperFormat } from "puppeteer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import puppeteer, { PaperFormat } from "puppeteer";

// 1. Validation Schema (The "Contract")
const PdfRequestSchema = z.object({
    html: z.string().min(1, "HTML content is required"),
    options: z.object({
        format: z.enum(["A4", "Letter"]).default("A4"),
        printBackground: z.boolean().default(true),
        landscape: z.boolean().default(false),
    }).optional(),
});

/**
 * PRODUCTION (VERCEL) vs LOCAL (DEV)
 * Vercel Serverless Functions have a 50MB limit.
 * We cannot bundle standard 'chrome' there.
 * Instead, we use `@sparticuz/chromium-min` (Lightweight) + `puppeteer-core`.
 */
async function getBrowser() {
    if (process.env.VERCEL) {
        // VERCEL / PRODUCTION
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chromium = await import("@sparticuz/chromium-min").then(mod => mod.default) as any;
        const puppet = await import("puppeteer-core").then(mod => mod.default);

        // Required for Vercel (Localfonts) - DISABLED FOR NOW (API Mismatch)
        // await chromium.font("https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf");

        return puppet.launch({
            args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(
                "https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar"
            ),
            headless: chromium.headless,
        });

    } else {
        // LOCAL DEVELOPMENT (Standard Chrome)
        return puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        // 1. Initialize Supabase Server Client
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        // 2. Identify User
        const { data: { user } } = await supabase.auth.getUser();
        let userId = null;

        if (user) {
            userId = user.id;

            // 3. User Logic: Check Limits
            const { data: metrics } = await supabase
                .from('usage_metrics')
                .select('request_count, tier')
                .eq('user_id', userId)
                .single();

            // Default limit: 100 for Free Tier
            const MAX_REQUESTS = metrics?.tier === 'pro' ? 10000 : 100;
            const currentUsage = metrics?.request_count || 0;

            if (currentUsage >= MAX_REQUESTS) {
                return NextResponse.json(
                    { error: "Rate Limit Exceeded", message: `You have reached your ${metrics?.tier || 'free'} tier limit. Upgrade to generate more documents.` },
                    { status: 429 }
                );
            }

            // 4. Increment Usage
            // (Note: For high concurrency, use a Database RPC. For now, simple update is fine)
            await supabase
                .from('usage_metrics')
                .update({ request_count: currentUsage + 1, last_request_at: new Date().toISOString() })
                .eq('user_id', userId);

        } else {
            // 2.B Fallback: Check for Legacy API Key (Demo Mode)
            const authHeader = req.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer re_")) {
                return NextResponse.json(
                    { error: "Unauthorized", message: "Missing API Key or valid Session." },
                    { status: 401 }
                );
            }
            // Demo key logic proceeds... matches existing behavior
        }

        // 5. Parse Body
        const body = await req.json();
        const result = PdfRequestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation Failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { html, options } = result.data;

        // 6. Launch Browser
        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.addStyleTag({
            content: `
            body { -webkit-print-color-adjust: exact; margin: 0; }
            @page { margin: 0; }
        `
        });

        const pdfBuffer = await page.pdf({
            format: (options?.format as PaperFormat) || "A4",
            printBackground: options?.printBackground ?? true,
            landscape: options?.landscape ?? false,
            margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
        });

        await browser.close();

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="document-${Date.now()}.pdf"`,
            },
        });

    } catch (error) {
        console.error("PDF Generation Failed:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
