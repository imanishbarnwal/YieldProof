"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShieldCheck, PieChart } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Issuer', href: '/issuer', icon: LayoutDashboard },
        { name: 'Attestor', href: '/attestor', icon: ShieldCheck },
        { name: 'Investor', href: '/investor', icon: PieChart },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo / Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center professional-shadow">
                            <span className="font-light text-primary-foreground">Y</span>
                        </div>
                        <span className="text-xl font-thin gradient-text tracking-wide">
                            YieldProof
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 text-sm font-light rounded-lg transition-all duration-200 tracking-wide",
                                        isActive
                                            ? "bg-primary text-primary-foreground professional-shadow"
                                            : "gradient-text-subtle hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side - Wallet */}
                <div className="flex items-center gap-4">
                    <ConnectButton
                        showBalance={false}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                    />
                </div>
            </div>
        </nav>
    );
}
