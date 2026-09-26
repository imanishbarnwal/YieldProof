"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShieldCheck, PieChart, Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';

export default function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { name: 'Issuer', href: '/issuer', icon: LayoutDashboard },
        { name: 'Attestor', href: '/attestor', icon: ShieldCheck },
        { name: 'Investor', href: '/investor', icon: PieChart },
        { name: 'ENS Profiles', href: '/ens', icon: Globe },
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-lg border-b border-border/50">
            <nav className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                {/* Logo / Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center group">
                        <span className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors duration-300 tracking-wide">
                            YieldProof
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
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
                                                ? "bg-primary/10 text-foreground border border-primary/30 shadow-lg shadow-primary/10 font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/20"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="rounded-full w-9 h-9"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>

                    <ConnectButton
                        showBalance={false}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                    />

                    {/* Mobile Hamburger Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                        className="md:hidden rounded-full w-9 h-9"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </nav>

            {/* Mobile Dropdown Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-b border-border/60 bg-card/95 backdrop-blur-xl px-4 py-3 space-y-1.5"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200",
                                        isActive
                                            ? "bg-primary/15 text-primary font-medium border border-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
