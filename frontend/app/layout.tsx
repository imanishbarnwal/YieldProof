import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";
import { ContractGuardrail } from "@/components/ContractGuardrail";
import { ToastProvider } from "@/components/ui/Toast";
import { LayoutClient } from "@/components/LayoutClient";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    display: 'swap',
    weight: ['600', '700'], // Refined weights: 600 for subheadings, 700 for primary headings
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    display: 'swap',
    weight: ['400', '500'], // Refined weights: 400 for body, 500 for labels
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: 'swap',
});

export const metadata: Metadata = {
    title: "YieldProof",
    description: "Proof-based yield verification for Real World Assets",
    keywords: ["DeFi", "RWA", "Yield", "Blockchain", "Verification"],
    authors: [{ name: "YieldProof Team" }],
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`dark ${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            // Suppress hydration warnings for demo
                            if (typeof window !== 'undefined') {
                                const originalError = console.error;
                                console.error = (...args) => {
                                    if (typeof args[0] === 'string' && args[0].includes('hydration')) {
                                        return;
                                    }
                                    if (typeof args[0] === 'string' && args[0].includes('server rendered HTML')) {
                                        return;
                                    }
                                    originalError.apply(console, args);
                                };
                            }
                        `,
                    }}
                />
            </head>
            <body className={`${dmSans.className} antialiased bg-background text-foreground`}>
                <Providers>
                    <ToastProvider>
                        <LayoutClient>
                            <ContractGuardrail />
                            <Navbar />
                            <main className="flex-1">
                                {children}
                            </main>
                        </LayoutClient>
                    </ToastProvider>
                </Providers>
            </body>
        </html>
    );
}
