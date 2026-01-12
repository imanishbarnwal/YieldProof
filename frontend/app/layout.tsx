import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";
import { ContractGuardrail } from "@/components/ContractGuardrail";

const poppins = Poppins({ 
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-poppins",
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
            <body className={`${poppins.variable} font-sans antialiased`}>
                <Providers>
                    <ContractGuardrail />
                    <div className="relative flex min-h-screen flex-col">
                        <Navbar />
                        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
