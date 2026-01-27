import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";
import { ContractGuardrail } from "@/components/ContractGuardrail";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    display: 'swap',
    weight: ['400', '600', '700', '800'],
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    display: 'swap',
    weight: ['400', '500', '700'],
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
            <body className={`${dmSans.className} antialiased bg-[#1A1A2E] text-white`}>
                <Providers>
                    <ContractGuardrail />
                    <div className="relative flex min-h-screen flex-col">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
