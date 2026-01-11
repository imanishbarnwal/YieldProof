"use client";

import React, { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_CLAIMS } from '@/lib/demoData';
import { UserCheck, ShieldCheck, ExternalLink } from 'lucide-react';

// Mock data types
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    status: 'pending' | 'attested' | 'verified' | 'rejected';
    currentStake: number;
}

export default function AttestorPage() {
    // Mock attestor state
    const [stakeBalance, setStakeBalance] = useState(5.0); // 5 MNT

    // Mock claims data - combining demo data with extra field
    const [claims, setClaims] = useState<Claim[]>(
        // @ts-ignore
        MOCK_CLAIMS.map(c => ({
            ...c,
            status: c.status,
            currentStake: parseFloat(c.totalStake || '0') // Parse rough estimate
        }))
    );

    const handleAttest = (claimId: number) => {
        setClaims(prev => prev.map(claim => {
            if (claim.id === claimId) {
                return {
                    ...claim,
                    status: 'attested',
                    currentStake: claim.currentStake + 1.0
                };
            }
            return claim;
        }));
    };

    const handleAddStake = () => {
        setStakeBalance(prev => prev + 1.0);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Attestor Dashboard</h1>
                <p className="text-slate-400">Verify yield claims and stake MNT to validate them.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Sidebar: Attestor Profile / Stake */}
                <div className="lg:col-span-4">
                    <Card className="sticky top-8 border-indigo-900/40 bg-indigo-950/10 backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-indigo-400" />
                                Your Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Staked</p>
                                <p className="text-3xl font-mono font-bold text-indigo-400">{stakeBalance.toFixed(2)} MNT</p>
                            </div>

                            <div className="space-y-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Trust Score</span>
                                    <span className="text-emerald-400 font-medium">98/100</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Active Attestations</span>
                                    <span className="text-slate-200 font-medium">12</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddStake}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                + Stake More MNT
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Pending Claims */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Pending Verifications</h2>

                    <div className="grid gap-4">
                        {claims.map((claim) => (
                            <Card
                                key={claim.id}
                                className={`border-slate-800 bg-slate-900/30 transition-all hover:border-slate-700 ${claim.status === 'attested' ? 'opacity-75 border-indigo-500/20 bg-indigo-900/5' : ''
                                    }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-white">{claim.assetId}</h3>
                                                <StatusBadge status={claim.status} />
                                            </div>
                                            <p className="text-sm text-slate-400">Period: <span className="text-slate-300 font-medium">{claim.period}</span></p>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yield</p>
                                                <p className="font-mono text-emerald-400 text-lg font-medium">{claim.yieldAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Stake</p>
                                                <p className="font-mono text-indigo-400 text-lg font-medium">{claim.currentStake.toFixed(1)} MNT</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                                        <Button variant="link" className="h-auto p-0 text-slate-400 hover:text-white">
                                            View Documents <ExternalLink className="ml-1 h-3 w-3" />
                                        </Button>

                                        {claim.status === 'pending' || claim.status === 'verified' ? (
                                            <Button
                                                onClick={() => handleAttest(claim.id)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Attest & Stake 1 MNT
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-950/30 px-3 py-1.5 rounded-md border border-indigo-500/20">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span className="text-sm font-medium">Attested</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
