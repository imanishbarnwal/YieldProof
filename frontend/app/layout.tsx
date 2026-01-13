import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";
import { ContractGuardrail } from "@/components/ContractGuardrail";

const inter = Inter({ 
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap', // Optimize font loading
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
        <html lang="en" className="dark">
            <body className={`${inter.className} antialiased bg-slate-950 text-white`}>
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
