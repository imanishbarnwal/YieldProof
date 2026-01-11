"use client";

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

// Mock data types
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    status: 'Pending' | 'Attested' | 'Approved' | 'Challenged';
    currentStake: number;
}

export default function AttestorPage() {
    // Mock attestor state
    const [stakeBalance, setStakeBalance] = useState(5.0); // 5 ETH

    // Mock claims data
    const [claims, setClaims] = useState<Claim[]>([
        {
            id: 1,
            assetId: 'MANTLE-ETH-LP',
            period: 'OCT 2023',
            yieldAmount: 1540.50,
            status: 'Pending',
            currentStake: 0.5,
        },
        {
            id: 3,
            assetId: 'USDC-RWA-VAULT',
            period: 'Q3 2023',
            yieldAmount: 50000.00,
            status: 'Pending',
            currentStake: 1.2,
        },
        {
            id: 2,
            assetId: 'MANTLE-ETH-LP',
            period: 'SEP 2023',
            yieldAmount: 1420.00,
            status: 'Attested',
            currentStake: 3.5,
        },
    ]);

    const handleAttest = (claimId: number) => {
        setClaims(prev => prev.map(claim => {
            if (claim.id === claimId) {
                return {
                    ...claim,
                    status: 'Attested',
                    currentStake: claim.currentStake + 1.0 // Mock adding 1 ETH stake
                };
            }
            return claim;
        }));
    };

    const handleAddStake = () => {
        // Mock deposit
        setStakeBalance(prev => prev + 1.0);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar: Attestor Profile / Stake */}
                    <div className="w-full lg:w-1/3">
                        <div className="sticky top-8 space-y-6">

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                                <h2 className="text-xl font-bold text-white mb-4">Attestor Dashboard</h2>

                                <div className="mb-6">
                                    <p className="text-sm text-slate-400 mb-1">Your Total Stake</p>
                                    <p className="text-4xl font-mono text-indigo-400 font-semibold">{stakeBalance.toFixed(2)} ETH</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Trust Score</span>
                                        <span className="text-emerald-400 font-medium">98/100</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Active Attestations</span>
                                        <span className="text-white font-medium">12</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-800">
                                    <button
                                        onClick={handleAddStake}
                                        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>+ Stake More ETH</span>
                                    </button>
                                    <p className="text-xs text-center text-slate-500 mt-2">Staking increases your voting weight.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Main Content: Pending Claims */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Pending Verifications</h2>
                            <p className="text-slate-400">Review and attest to the validity of these yield claims.</p>
                        </div>

                        <div className="grid gap-4">
                            {claims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className={`group bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-indigo-500/30 transition-all ${claim.status === 'Attested' ? 'opacity-75' : 'opacity-100'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-white">{claim.assetId}</h3>
                                                <StatusBadge status={claim.status} />
                                            </div>
                                            <p className="text-sm text-slate-400">Period: <span className="text-slate-300">{claim.period}</span></p>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Yield Claimed</p>
                                                <p className="font-mono text-emerald-400 text-lg">{claim.yieldAmount.toLocaleString()}</p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Current Stake</p>
                                                <p className="font-mono text-indigo-400 text-lg">{claim.currentStake.toFixed(1)} ETH</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
                                        <span className="text-slate-500">
                                            Proof: <a href="#" className="text-blue-400 hover:underline decoration-blue-500/30 underline-offset-2">View Documents ↗</a>
                                        </span>

                                        {claim.status === 'Pending' ? (
                                            <button
                                                onClick={() => handleAttest(claim.id)}
                                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-900/20 transition-all transform active:scale-95"
                                            >
                                                Attest & Stake 1 ETH
                                            </button>
                                        ) : (
                                            <span className="px-4 py-2 text-indigo-300 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Attested
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
