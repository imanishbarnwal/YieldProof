"use client";

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

// Mock data type
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    documentHash: string;
    status: 'Pending' | 'Attested' | 'Approved' | 'Challenged';
}

export default function IssuerPage() {
    // State for form inputs
    const [formData, setFormData] = useState({
        assetId: '',
        period: '',
        yieldAmount: '',
        documentHash: '',
    });

    // Mock state for submitted claims
    const [claims, setClaims] = useState<Claim[]>([
        {
            id: 1,
            assetId: 'MANTLE-ETH-LP',
            period: 'OCT 2023',
            yieldAmount: 1540.50,
            documentHash: 'ipfs://QmHash...',
            status: 'Pending',
        },
        {
            id: 2,
            assetId: 'MANTLE-ETH-LP',
            period: 'SEP 2023',
            yieldAmount: 1420.00,
            documentHash: 'ipfs://QmHashOld...',
            status: 'Approved',
        },
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.assetId || !formData.yieldAmount) return;

        const newClaim: Claim = {
            id: claims.length + 1,
            assetId: formData.assetId,
            period: formData.period,
            yieldAmount: parseFloat(formData.yieldAmount),
            documentHash: formData.documentHash,
            status: 'Pending',
        };

        setClaims([newClaim, ...claims]);
        setFormData({ assetId: '', period: '', yieldAmount: '', documentHash: '' });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row gap-12">

                    {/* Left Column: Submit Claim Form */}
                    <div className="w-full md:w-1/3 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Submit Claim</h1>
                            <p className="text-slate-400">Create a new yield proof for verification.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Asset ID</label>
                                    <input
                                        type="text"
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. MANTLE-ETH-LP"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Period</label>
                                    <input
                                        type="text"
                                        name="period"
                                        value={formData.period}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Sept 2025"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Yield Amount</label>
                                    <input
                                        type="number"
                                        name="yieldAmount"
                                        value={formData.yieldAmount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Document Hash (IPFS)</label>
                                    <input
                                        type="text"
                                        name="documentHash"
                                        value={formData.documentHash}
                                        onChange={handleInputChange}
                                        placeholder="ipfs://..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                                >
                                    Submit Claim
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Submitted Claims List */}
                    <div className="w-full md:w-2/3 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">My Claims</h2>
                            <p className="text-slate-400">Track status of your submitted yield proofs.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/50 border-b border-slate-700">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Yield</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {claims.map((claim) => (
                                            <tr key={claim.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-white">{claim.assetId}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400">{claim.period}</td>
                                                <td className="px-6 py-4 text-sm font-mono text-emerald-400">{claim.yieldAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={claim.status} />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-blue-400 hover:text-blue-300 truncate max-w-[150px]">
                                                    <a href="#" className="underline decoration-blue-500/30 underline-offset-4">{claim.documentHash}</a>
                                                </td>
                                            </tr>
                                        ))}

                                        {claims.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    No claims submitted yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
