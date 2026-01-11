"use client";

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

interface YieldClaim {
    id: number;
    assetId: string;
    totalStake: number;
    status: 'Pending' | 'Attested' | 'Approved' | 'Challenged';
    yieldUnlocked: boolean;
}

export default function InvestorPage() {
    const [depositAmount, setDepositAmount] = useState('');
    const [totalDeposits, setTotalDeposits] = useState(128.5); // Mock Total Deposits

    const claims: YieldClaim[] = [
        {
            id: 1,
            assetId: 'MANTLE-ETH-LP',
            totalStake: 4.5,
            status: 'Attested',
            yieldUnlocked: true,
        },
        {
            id: 2,
            assetId: 'USDC-RWA-VAULT',
            totalStake: 0.8, // Below threshold mock
            status: 'Pending',
            yieldUnlocked: false,
        },
        {
            id: 3,
            assetId: 'DEFI-IDX-V2',
            totalStake: 12.0,
            status: 'Approved',
            yieldUnlocked: true,
        },
    ];

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositAmount) return;
        setTotalDeposits(prev => prev + parseFloat(depositAmount));
        setDepositAmount('');
        alert(`Successfully deposited ${depositAmount} ETH (Mock)`);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Content: Vault Overview & Claims */}
                    <div className="w-full lg:w-2/3 space-y-8">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Value Locked</p>
                                <p className="text-3xl font-bold text-white mt-2">{totalDeposits.toFixed(2)} ETH</p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Min. Stake for Yield</p>
                                <p className="text-3xl font-bold text-white mt-2">1.0 ETH</p>
                            </div>
                        </div>

                        {/* Claims List */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Yield Opportunities</h2>
                            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-800/50 border-b border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Asset</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Backing Stake</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">State</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {claims.map((claim) => (
                                            <tr key={claim.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{claim.assetId}</td>
                                                <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                                                <td className="px-6 py-4 font-mono text-indigo-400">{claim.totalStake.toFixed(1)} ETH</td>
                                                <td className="px-6 py-4">
                                                    {claim.yieldUnlocked ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded">
                                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                            Yield Unlocked
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                                            Locked
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Deposit Action */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl sticky top-8">
                            <h3 className="text-xl font-bold text-white mb-2">Deposit Liquidity</h3>
                            <p className="text-slate-400 text-sm mb-6">Provide ETH to valid yield pools and earn rewards.</p>

                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Amount (ETH)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-4 top-3.5 text-slate-500 font-medium">ETH</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                                >
                                    Deposit Funds
                                </button>

                                <p className="text-xs text-center text-slate-600 mt-2">
                                    Funds are secured by AttestorRegistry verification.
                                </p>
                            </form>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
