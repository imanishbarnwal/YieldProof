"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShieldCheck, PieChart, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';

export default function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { name: 'Issuer', href: '/issuer', icon: LayoutDashboard },
        { name: 'Attestor', href: '/attestor', icon: ShieldCheck },
        { name: 'Investor', href: '/investor', icon: PieChart },
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-card/50 backdrop-blur-lg border-b border-border/50 flex h-16 items-center justify-between px-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center group">
                    <span className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors duration-300 tracking-wide">
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
                                            ? "bg-primary/10 text-foreground border border-primary/30 shadow-lg shadow-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/20"
                                    )}
                                >
                                    {/* Subtle gradient overlay for active state */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
                                    )}

                                    {/* Hover shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

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

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                <ConnectButton
                    showBalance={false}
                    accountStatus={{
                        smallScreen: 'avatar',
                        largeScreen: 'full',
                    }}
                />
            </div>
        </nav>
    );
}
