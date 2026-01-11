"use client";

import React, { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_STATS, MOCK_CLAIMS } from '@/lib/demoData';
import { Lock, Unlock, TrendingUp, Wallet } from 'lucide-react';

interface YieldClaim {
    id: number;
    assetId: string;
    totalStake: number;
    status: 'pending' | 'attested' | 'verified' | 'rejected';
    yieldUnlocked: boolean;
}

export default function InvestorPage() {
    const [depositAmount, setDepositAmount] = useState('');
    const [totalDeposits, setTotalDeposits] = useState(128.5); // Mock Total Deposits

    // @ts-ignore
    const claims: YieldClaim[] = MOCK_CLAIMS.map(c => ({
        ...c,
        totalStake: parseFloat(c.totalStake || '0'),
        yieldUnlocked: c.status === 'verified'
    }));

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositAmount) return;
        setTotalDeposits(prev => prev + parseFloat(depositAmount));
        setDepositAmount('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Investor Dashboard</h1>
                <p className="text-slate-400">Manage your liquidity and track unlocked yields.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">

                {/* Main Content: Vault Overview & Claims */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardContent className="p-6">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Total Value Locked
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">{totalDeposits.toFixed(2)} MNT</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardContent className="p-6">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Min. Stake for Yield
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">{MOCK_STATS.minVerificationThreshold}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Claims List */}
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle>Yield Opportunities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto rounded-lg border border-slate-800">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b [&_tr]:border-slate-800">
                                        <tr className="border-b transition-colors hover:bg-slate-900/50 data-[state=selected]:bg-slate-900">
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Asset</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Status</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Backing Stake</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">State</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {claims.map((claim) => (
                                            <tr key={claim.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/30">
                                                <td className="p-4 align-middle font-medium text-slate-200">{claim.assetId}</td>
                                                <td className="p-4 align-middle"><StatusBadge status={claim.status} /></td>
                                                <td className="p-4 align-middle font-mono text-indigo-400">{claim.totalStake.toFixed(1)} MNT</td>
                                                <td className="p-4 align-middle">
                                                    {claim.yieldUnlocked ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                                            <Unlock className="w-3 h-3" />
                                                            Unlocked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-medium uppercase tracking-wide bg-slate-800 px-2 py-1 rounded">
                                                            <Lock className="w-3 h-3" />
                                                            Locked
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Deposit Action */}
                <div className="lg:col-span-4">
                    <Card className="sticky top-8 border-slate-800 bg-slate-900 shadow-xl">
                        <CardHeader>
                            <CardTitle>Deposit Liquidity</CardTitle>
                            <CardDescription>Provide MNT to valid yield pools and earn rewards.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase">Amount (MNT)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 pl-4 pr-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-4 top-3.5 text-slate-500 font-medium">MNT</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    Deposit Funds
                                </Button>

                                <p className="text-xs text-center text-slate-500">
                                    Funds are secured by AttestorRegistry verification.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
