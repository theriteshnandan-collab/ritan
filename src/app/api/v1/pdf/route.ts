import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

        // Required for Vercel (Localfonts)
        await chromium.font("https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf");

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
        // 2.A Security Check (Replaces Middleware)
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer re_")) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Missing or invalid API Key. Please visit the Vault." },
                { status: 401 }
            );
        }

        // 2.B Parse Body
        const body = await req.json();
        const result = PdfRequestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation Failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { html, options } = result.data;

        // 3. Launch "The Worker" (Dual Engine)
        const browser = await getBrowser();
        const page = await browser.newPage();

        // 4. Load Content
        await page.setContent(html, { waitUntil: "networkidle0" });

        // 5. Enhance visuals
        await page.addStyleTag({
            content: `
            body { -webkit-print-color-adjust: exact; margin: 0; }
            @page { margin: 0; }
        `
        });

        // 6. Generate PDF
        const pdfBuffer = await page.pdf({
            format: (options?.format as PaperFormat) || "A4",
            printBackground: options?.printBackground ?? true,
            landscape: options?.landscape ?? false,
            margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
        });

        await browser.close();

        // 7. Return the Asset
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
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
