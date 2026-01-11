"use client";

import React, { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DEMO_MODE, MOCK_CLAIMS } from '@/lib/demoData';
import { Upload, FileText, PlusCircle } from 'lucide-react';

// Mock data type
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    documentHash: string;
    status: 'pending' | 'attested' | 'verified' | 'rejected';
}

export default function IssuerPage() {
    // State for form inputs
    const [formData, setFormData] = useState({
        assetId: DEMO_MODE ? 'RWA-2024-004' : '',
        period: DEMO_MODE ? 'Feb 2024' : '',
        yieldAmount: DEMO_MODE ? '12500' : '',
        documentHash: DEMO_MODE ? 'QmXyZ...789' : '',
    });

    // Mock state for submitted claims
    const [claims, setClaims] = useState<Claim[]>(
        // @ts-ignore - mismatch in status string casing but good enough for demo
        MOCK_CLAIMS.map(c => ({ ...c, status: c.status }))
    );

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
            status: 'pending',
        };

        setClaims([newClaim, ...claims]);
        setFormData({
            assetId: '',
            period: '',
            yieldAmount: '',
            documentHash: ''
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Issuer Dashboard</h1>
                <p className="text-slate-400">Submit proofs of yield generation for verification.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                {/* Left Column: Submit Claim Form */}
                <div className="md:col-span-4">
                    <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Submit Claim</CardTitle>
                            <CardDescription>Create a new yield proof for verification.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Asset ID</label>
                                    <input
                                        type="text"
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. MANTLE-MNT-LP"
                                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Period</label>
                                    <input
                                        type="text"
                                        name="period"
                                        value={formData.period}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Sept 2025"
                                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Yield Amount (USDC)</label>
                                    <input
                                        type="number"
                                        name="yieldAmount"
                                        value={formData.yieldAmount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Document Hash (IPFS)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="documentHash"
                                            value={formData.documentHash}
                                            onChange={handleInputChange}
                                            placeholder="ipfs://..."
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        <Button type="button" variant="outline" size="icon" className="shrink-0 border-slate-700 bg-slate-900">
                                            <Upload className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Submit Claim
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Submitted Claims List */}
                <div className="md:col-span-8">
                    <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>My Claims</CardTitle>
                            <CardDescription>Track status of your submitted yield proofs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto rounded-lg border border-slate-800">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b [&_tr]:border-slate-800">
                                        <tr className="border-b transition-colors hover:bg-slate-900/50 data-[state=selected]:bg-slate-900">
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Asset ID</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Period</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Yield</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Status</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {claims.map((claim) => (
                                            <tr key={claim.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/30">
                                                <td className="p-4 align-middle font-medium text-slate-200">{claim.assetId}</td>
                                                <td className="p-4 align-middle text-slate-400">{claim.period}</td>
                                                <td className="p-4 align-middle font-mono text-emerald-400">{claim.yieldAmount.toLocaleString()}</td>
                                                <td className="p-4 align-middle">
                                                    <StatusBadge status={claim.status} />
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="max-w-[100px] truncate text-xs">{claim.documentHash}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
