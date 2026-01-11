"use client";

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DEMO_MODE, MOCK_CLAIMS } from '@/lib/demoData';
import { Upload, FileText, PlusCircle, Loader2 } from 'lucide-react';
import { NetworkWarning } from '@/components/NetworkWarning';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { parseUnits, formatUnits, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';

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
    const { isReady, address } = useRequireWalletAndNetwork();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // Contract Write
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Contract Read: Get Total Claims
    const { data: totalClaimsData, refetch: refetchTotal } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });

    // Determine range for fetching all claims (naive approach: fetch all)
    // In a real app we might paginate or filter events.
    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i + 1));

    const { data: claimsData, refetch: refetchClaims } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
    });

    // Process fetched claims
    const [claims, setClaims] = useState<Claim[]>([]);

    useEffect(() => {
        if (claimsData) {
            const mappedClaims: Claim[] = claimsData
                .map((result) => result.result as any)
                .filter((c) => c && c[5] === address) // Filter by issuer address
                .map((c) => ({
                    id: Number(c[0]),
                    assetId: c[1],
                    period: c[2],
                    yieldAmount: Number(formatUnits(c[3], 6)), // Assuming 6 decimals for USDC as per input label
                    documentHash: c[4],
                    status: ['pending', 'attested', 'verified', 'rejected'][c[6]] as any,
                }))
                .reverse(); // Newest first

            setClaims(mappedClaims);
        }
    }, [claimsData, address]);

    // Refetch on success
    useEffect(() => {
        if (isConfirmed) {
            setTxHash(undefined);
            setFormData({
                assetId: '',
                period: '',
                yieldAmount: '',
                documentHash: ''
            });
            refetchTotal();
            refetchClaims();
            // In a real app, show toast here
            alert("Claim submitted successfully!");
        }
    }, [isConfirmed, refetchTotal, refetchClaims]);


    // State for form inputs
    const [formData, setFormData] = useState({
        assetId: DEMO_MODE ? 'RWA-2024-004' : '',
        period: DEMO_MODE ? 'Feb 2024' : '',
        yieldAmount: DEMO_MODE ? '12500' : '',
        documentHash: DEMO_MODE ? 'QmXyZ...789' : '',
    });

    const [uploadedCid, setUploadedCid] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            const data = new FormData();
            data.set("file", file);

            const uploadRequest = await fetch("/api/ipfs/upload", {
                method: "POST",
                body: data,
            });

            const ipfsHash = await uploadRequest.json();

            if (ipfsHash) { // Response is directly the hash string or object? API returns json(hash)
                const cid = typeof ipfsHash === 'string' ? ipfsHash : ipfsHash;
                setUploadedCid(cid);
                setFormData(prev => ({ ...prev, documentHash: `ipfs://${cid}` }));
            }
        } catch (e) {
            console.error(e);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.assetId || !formData.yieldAmount || !formData.documentHash || !isReady) return;

        try {
            writeContract({
                address: CONTRACTS.YieldProof.address as `0x${string}`,
                abi: CONTRACTS.YieldProof.abi as Abi,
                functionName: 'submitClaim',
                args: [
                    formData.assetId,
                    formData.period,
                    parseUnits(formData.yieldAmount, 6), // USDC 6 decimals
                    formData.documentHash
                ],
            });
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    const isSubmitting = isWritePending || isConfirming;

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
                            <NetworkWarning />
                            <form onSubmit={handleSubmit} className={`space-y-4 ${!isReady ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                    <label className="text-sm font-medium text-slate-300">Yield Proof Document</label>

                                    {!uploadedCid ? (
                                        <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group">
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.csv,.xls,.xlsx,.jpg,.png"
                                                disabled={isUploading}
                                            />
                                            {isUploading ? (
                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                            )}
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-slate-300">
                                                    {isUploading ? "Uploading to IPFS..." : "Click to Upload Proof"}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">PDF, CSV, Excel, Images</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-emerald-500/20 p-2 rounded">
                                                    <FileText className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium text-emerald-300 truncate">
                                                        {formData.documentHash}
                                                    </span>
                                                    <span className="text-xs text-emerald-500/70">Uploaded to IPFS</span>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setUploadedCid(null);
                                                    setFormData(prev => ({ ...prev, documentHash: '' }));
                                                }}
                                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting || !isReady || isUploading}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isConfirming ? 'Confirming...' : 'Waiting for Wallet...'}
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Submit Claim
                                        </>
                                    )}
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
