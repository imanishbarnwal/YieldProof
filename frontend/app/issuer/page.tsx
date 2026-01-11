"use client";

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Upload, FileText, PlusCircle, Loader2, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { NetworkWarning } from '@/components/NetworkWarning';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { parseUnits, formatUnits, formatEther, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';

// Mock data type
// Mock data type
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    documentHash: string;
    status: 'submitted' | 'attesting' | 'verified' | 'flagged' | 'rejected';

    currentStake: string;
    attestorCount: number;
    minAttestors: number;
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
    const { data: totalClaimsData, refetch: refetchTotal, isLoading: isTotalLoading } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });

    // Determine range for fetching all claims (naive approach: fetch all)
    // In a real app we might paginate or filter events.
    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i));

    const { data: claimsData, refetch: refetchClaims, isLoading: isClaimsLoading, isError: isClaimsError } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
        query: {
            refetchInterval: 5000,
        }
    });

    // Read: Current Total Stake per Claim
    const { data: claimStakesData, refetch: refetchClaimStakes } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [id],
        })),
        query: {
            refetchInterval: 5000,
        }
    });

    // Read: Attestor Count per Claim
    const { data: claimAttestorCounts } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'attestorCountPerClaim',
            args: [id],
        })),
        query: {
            refetchInterval: 5000,
        }
    });

    // Read: Constants from YieldProof
    const { data: minAttestorsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'MIN_REQUIRED_ATTESTORS',
    });

    const minAttestors = minAttestorsData ? Number(minAttestorsData) : 0; // Default 0 if loading

    // Process fetched claims
    const [claims, setClaims] = useState<Claim[]>([]);

    useEffect(() => {
        if (claimsData && claimStakesData && address) {
            const mappedClaims: Claim[] = claimsData
                .map((result, i) => {
                    const c = result.result as any;
                    const s = claimStakesData[i]?.result;
                    const ac = claimAttestorCounts?.[i]?.result;
                    return { c, s, ac };
                })
                .filter(({ c }) => {
                    // Filter: Must have data, match issuer address, and have a valid Asset ID
                    return c &&
                        c[5] &&
                        c[5].toLowerCase() === address.toLowerCase() &&
                        c[1] && c[1].trim() !== "";
                })
                .map(({ c, s, ac }) => {
                    const statusEnum = Number(c[6]);
                    // Updated mapping based on new Enum: Submitted(0), Attesting(1), Verified(2), Flagged(3), Rejected(4)
                    const statusStr = ['submitted', 'attesting', 'verified', 'flagged', 'rejected'][statusEnum];
                    const currentStake = s ? formatEther(s as bigint) : '0';
                    const attestorCount = ac ? Number(ac) : 0;

                    return {
                        id: Number(c[0]),
                        assetId: c[1],
                        period: c[2],
                        yieldAmount: Number(formatUnits(c[3], 6)),
                        documentHash: c[4],
                        status: statusStr as any,
                        currentStake: currentStake,
                        attestorCount: attestorCount,
                        minAttestors: minAttestors
                    };
                })
                .reverse(); // Newest first

            setClaims(mappedClaims);
        }
    }, [claimsData, claimStakesData, claimAttestorCounts, address, minAttestors]);

    // Refetch on success
    useEffect(() => {
        if (isConfirmed) {
            setTxHash(undefined);
            setFormData({
                assetId: '',
                startDate: '',
                endDate: '',
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
        assetId: '',
        startDate: '',
        endDate: '',
        yieldAmount: '',
        documentHash: '',
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

            const response = await uploadRequest.json();

            if (response.success && response.cid) {
                setUploadedCid(response.cid);
                setFormData(prev => ({ ...prev, documentHash: `ipfs://${response.cid}` }));
            } else {
                throw new Error(response.error || "Upload failed");
            }
        } catch (e: any) {
            console.error(e);
            alert(`Upload failed: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Date Validation
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const now = new Date();

        if (end > now) {
            alert("End date cannot be in the future.");
            return;
        }

        if (start >= end) {
            alert("Start date must be before end date.");
            return;
        }

        // Format Period String logic
        let periodString = "";

        const fullOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const monthYearOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };

        // Check if same month and year
        if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            // "Jan 2026"
            periodString = start.toLocaleDateString('en-US', monthYearOptions);
        } else {
            // "Dec 31, 2025 – Jan 3, 2026"
            periodString = `${start.toLocaleDateString('en-US', fullOptions)} – ${end.toLocaleDateString('en-US', fullOptions)}`;
        }

        if (!formData.assetId || !formData.yieldAmount || !formData.documentHash || !isReady) return;

        try {
            writeContract({
                address: CONTRACTS.YieldProof.address as `0x${string}`,
                abi: CONTRACTS.YieldProof.abi as Abi,
                functionName: 'submitClaim',
                args: [
                    formData.assetId,
                    periodString, // Send formatted string
                    parseUnits(formData.yieldAmount, 6), // USDC 6 decimals
                    formData.documentHash
                ],
            });
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    const isSubmitting = isWritePending || isConfirming;

    const renderProgress = (currentStake: string, attestorCount: number, minAttestors: number) => {
        // Attestor Progress
        const attestorPercent = minAttestors > 0 ? Math.min((attestorCount / minAttestors) * 100, 100) : 0;
        const displayThreshold = minAttestors > 0 ? minAttestors : "-";

        return (
            <div className="flex flex-col gap-2 min-w-[140px]">
                {/* Attestor Count Bar */}
                <div className="w-full">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Attestors</span>
                        <span className={attestorCount >= minAttestors && minAttestors > 0 ? "text-emerald-400 font-medium" : "text-amber-500"}>
                            {attestorCount} / {displayThreshold}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${attestorCount >= minAttestors && minAttestors > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${attestorPercent}%` }}
                        />
                    </div>
                </div>

                {/* Stake Info (Just informational) */}
                <div className="text-[10px] text-slate-500">
                    Total Stake: <span className="text-slate-400">{Number(currentStake).toFixed(1)} MNT</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Issuer Dashboard</h1>
                <p className="text-slate-400">Issuer: submits yield proofs</p>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-medium text-slate-300">Start Date <span className="text-xs font-normal text-slate-500 block">(Yield accrual start)</span></label>
                                        </div>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-medium text-slate-300">End Date <span className="text-xs font-normal text-slate-500 block">(Yield accrual end)</span></label>
                                        </div>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
                                        />
                                    </div>
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
                                    <div className="flex items-start gap-2 mt-2 px-1">
                                        <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-slate-500 leading-tight">
                                            <span className="font-semibold text-slate-400">MVP:</span> Proofs are public.
                                            <span className="block mt-0.5 text-indigo-400/80">
                                                Encrypted proofs & ZK verification coming in V2.
                                            </span>
                                        </p>
                                    </div>
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
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Yield (USDC)</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Status</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Attestation Progress</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {isTotalLoading || isClaimsLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <tr key={i} className="border-b border-slate-800">
                                                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                                    <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                                </tr>
                                            ))
                                        ) : isClaimsError ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-red-400/80 bg-red-900/10 rounded-lg m-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="font-medium">Error loading claims</span>
                                                        <span className="text-xs opacity-70">Please check your network and try again.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : claims.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-slate-500">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileText className="h-10 w-10 opacity-20" />
                                                        <p className="text-lg font-medium text-slate-400">No claims submitted yet</p>
                                                        <p className="text-sm max-w-sm mx-auto">
                                                            Submit your first yield proof using the form on the left to start the verification process.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            claims.map((claim) => (
                                                <tr key={claim.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/30">
                                                    <td className="p-4 align-middle font-medium text-slate-200">{claim.assetId}</td>
                                                    <td className="p-4 align-middle text-slate-400">{claim.period}</td>
                                                    <td className="p-4 align-middle font-mono text-emerald-400">{claim.yieldAmount.toLocaleString()}</td>
                                                    <td className="p-4 align-middle">
                                                        <StatusBadge
                                                            status={claim.status}
                                                            label={
                                                                claim.status === 'submitted' ? 'Awaiting Attestors' :
                                                                    claim.status === 'attesting' ? 'In Verification' :
                                                                        undefined
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        {claim.status === 'submitted' || claim.status === 'attesting' ? (
                                                            renderProgress(claim.currentStake, claim.attestorCount, claim.minAttestors)
                                                        ) : claim.status === 'verified' ? (
                                                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span>Fully Verified</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-500">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        {claim.documentHash ? (
                                                            <a
                                                                href={claim.documentHash.startsWith('ipfs://')
                                                                    ? `https://gateway.pinata.cloud/ipfs/${claim.documentHash.replace('ipfs://', '')}`
                                                                    : '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group"
                                                            >
                                                                <FileText className="h-4 w-4 group-hover:text-indigo-200" />
                                                                <span className="max-w-[120px] truncate text-xs font-mono opacity-80 decoration-dotted underline-offset-2 group-hover:underline">
                                                                    {claim.documentHash.replace('ipfs://', '')}
                                                                </span>
                                                                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-600 text-xs">No Proof</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
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
