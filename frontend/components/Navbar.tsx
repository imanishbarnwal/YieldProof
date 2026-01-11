"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'text-white' : 'text-slate-400 hover:text-white';
    };

    return (
        <nav className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo / Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-bold text-white tracking-tight hover:text-slate-200 transition-colors">
                        YieldProof
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/issuer"
                            className={`text-sm font-medium transition-colors ${isActive('/issuer')}`}
                        >
                            Issuer
                        </Link>
                        <Link
                            href="/attestor"
                            className={`text-sm font-medium transition-colors ${isActive('/attestor')}`}
                        >
                            Attestor
                        </Link>
                        <Link
                            href="/investor"
                            className={`text-sm font-medium transition-colors ${isActive('/investor')}`}
                        >
                            Investor
                        </Link>
                    </div>
                </div>

                {/* Right Side - Network Badge */}
                <div className="flex items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                        <span className="text-xs font-semibold text-slate-200">
                            Connected to Mantle Sepolia
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
