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
        <nav className="sticky top-0 z-50 w-full glass-card border-b border-[#FF6B35]/20 flex h-16 items-center justify-between px-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center group">
                    <span className="text-xl font-bold font-display text-white group-hover:text-[#FF6B35] transition-colors duration-300 tracking-wide">
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
                                        "flex items-center gap-2 px-4 py-2 text-sm font-light rounded-full transition-all duration-300 tracking-wide relative overflow-hidden group",
                                        isActive
                                            ? "bg-[#FF6B35]/10 text-white border border-[#FF6B35]/30 shadow-lg shadow-[#FF6B35]/10"
                                            : "text-[#F8F9FA]/80 hover:text-white hover:bg-[#FF6B35]/10 border border-transparent hover:border-[#FF6B35]/20"
                                    )}
                                >
                                    {/* Subtle gradient overlay for active state */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 via-[#FFD23F]/5 to-[#FF6B35]/10" />
                                    )}

                                    {/* Hover shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B35]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

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
