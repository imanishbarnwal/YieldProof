"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShieldCheck, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Issuer', href: '/issuer', icon: LayoutDashboard },
        { name: 'Attestor', href: '/attestor', icon: ShieldCheck },
        { name: 'Investor', href: '/investor', icon: PieChart },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full glass-card border-b border-slate-700/50 flex h-16 items-center justify-between px-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center group">
                    <span className="text-xl font-light text-white group-hover:text-slate-200 transition-colors duration-300 tracking-wide">
                        YieldProof
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <motion.div key={item.href} whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 text-sm font-light rounded-xl transition-all duration-300 tracking-wide relative overflow-hidden group",
                                        isActive
                                            ? "bg-slate-800/50 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                                            : "text-slate-300 hover:text-white hover:bg-slate-800/30 border border-transparent hover:border-slate-600/30"
                                    )}
                                >
                                    {/* Subtle gradient overlay for active state */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-indigo-500/10" />
                                    )}

                                    {/* Hover shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

                                    <div className="relative z-10 flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side - Wallet */}
            <ConnectButton
                showBalance={false}
                accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                }}
            />
        </nav>
    );
}
