"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NetworkWarning } from '@/components/NetworkWarning';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserCheck, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { formatEther, parseEther, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';

// Data types
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    documentHash: string;
    status: 'pending' | 'attested' | 'verified' | 'rejected';
    alreadyAttested?: boolean;
}

export default function AttestorPage() {
    const { isReady, address } = useRequireWalletAndNetwork();
    const [stakeAmountInput, setStakeAmountInput] = useState("1.0");
    const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);

    // Contract Write Hook
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read: Attestor Info (isRegistered, stake)
    const { data: attestorInfo, refetch: refetchAttestor } = useReadContract({
        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
        abi: CONTRACTS.AttestorRegistry.abi as Abi,
        functionName: 'attestors',
        args: [address],
        query: {
            enabled: !!address,
        }
    });

    const isRegistered = attestorInfo ? (attestorInfo as any)[0] : false;
    const currentStakeWei = attestorInfo ? (attestorInfo as any)[1] : 0n;
    const currentStake = formatEther(currentStakeWei as bigint);

    // Read: Total Claims count
    const { data: totalClaimsData, refetch: refetchTotalClaims } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });

    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i + 1));

    // Read: Individual Claims Data
    const { data: claimsData, refetch: refetchClaims } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
    });

    // Read: Check if user has already attested each claim
    const { data: hasAttestedData, refetch: refetchHasAttested } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'hasAttested',
            args: [id, address],
        })),
    });

    // Effect: Process and filter claims
    useEffect(() => {
        if (claimsData && hasAttestedData) {
            const mappedClaims = claimsData.map((result, i) => {
                const c = result.result as any;
                const hasAttestedResult = hasAttestedData[i];
                const alreadyAttested = hasAttestedResult?.result as boolean;

                if (!c) return null;

                // Status enum: 0: Pending, 1: Attested, 2: Verified, 3: Rejected
                const statusStr = ['pending', 'attested', 'verified', 'rejected'][c[6]];

                return {
                    id: Number(c[0]),
                    assetId: c[1],
                    period: c[2],
                    yieldAmount: Number(formatEther(c[3])), // Assuming values are stored with 18 decimals or consistent with format
                    documentHash: c[4],
                    status: statusStr as any,
                    alreadyAttested
                };
            }).filter(c => c !== null);

            // Filter for pending claims that haven't been attested by this user yet
            // Or show all relevant ones. For "Pending Verifications", we usually want items needing action.
            const pending = mappedClaims.filter(c =>
                c.status === 'pending' && !c.alreadyAttested
            ).reverse(); // Newest first

            setPendingClaims(pending as Claim[]);
        }
    }, [claimsData, hasAttestedData]);

    // Effect: Refetch on transaction success
    useEffect(() => {
        if (isConfirmed) {
            refetchAttestor();
            refetchClaims();
            refetchHasAttested();
            refetchTotalClaims();
        }
    }, [isConfirmed, refetchAttestor, refetchClaims, refetchHasAttested, refetchTotalClaims]);


    // Handlers
    const handleAddStake = async () => {
        if (!isReady) return;
        try {
            const val = parseEther(stakeAmountInput);
            if (!isRegistered) {
                writeContract({
                    address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
                    abi: CONTRACTS.AttestorRegistry.abi as Abi,
                    functionName: 'register',
                    value: val
                });
            } else {
                writeContract({
                    address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
                    abi: CONTRACTS.AttestorRegistry.abi as Abi,
                    functionName: 'stakeETH',
                    value: val
                });
            }
        } catch (e) {
            console.error("Staking failed:", e);
        }
    };

    const handleAttest = async (claimId: number) => {
        if (!isReady) return;
        try {
            writeContract({
                address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
                abi: CONTRACTS.AttestorRegistry.abi as Abi,
                functionName: 'attestToClaim',
                args: [BigInt(claimId)]
            });
        } catch (e) {
            console.error("Attestation failed:", e);
        }
    };

    const isProcessing = isWritePending || isConfirming;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Attestor Dashboard</h1>
                <p className="text-slate-400">Verify yield proofs and earn rewards by staking MNT.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Sidebar: Staking Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Staked (MNT)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-400">{Number(currentStake).toFixed(2)} MNT</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {isRegistered ? 'Locked in AttestorRegistry' : 'Register to start attesting.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-indigo-400" />
                                Attestor Status
                            </CardTitle>
                            <CardDescription>Manage your staking position.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Reputation Score</span>
                                <span className="font-mono text-white">98/100</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Total Attestations</span>
                                <span className="font-mono text-white">
                                    {/* Naive count based on hasAttestedData could be done here, but let's keep it simple or mock for now as contract doesn't expose count directly easily without iterating */}
                                    12
                                </span>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Stake Amount (MNT)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={stakeAmountInput}
                                        onChange={(e) => setStakeAmountInput(e.target.value)}
                                        className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        step="0.1"
                                        min="0"
                                    />
                                    <Button
                                        onClick={handleAddStake}
                                        disabled={!isReady || isProcessing}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegistered ? '+ Stake More' : 'Register & Stake')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Pending Claims */}
                <div className="lg:col-span-8 space-y-6">
                    <NetworkWarning />
                    <h2 className="text-xl font-semibold text-white">Pending Verifications</h2>

                    <div className="grid gap-4">
                        {(!isReady) ? (
                            <div className="text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
                                Connect wallet to view pending claims.
                            </div>
                        ) : pendingClaims.length === 0 ? (
                            <div className="text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
                                No pending claims found requiring your attestation.
                            </div>
                        ) : (
                            pendingClaims.map((claim) => (
                                <Card key={claim.id} className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="grid gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{claim.assetId}</h3>
                                                <StatusBadge status={claim.status} />
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                Period: {claim.period} • Yield: <span className="text-emerald-400">{claim.yieldAmount.toLocaleString()} USDC</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <a href="#" className="flex items-center text-xs text-indigo-400 hover:text-indigo-300">
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    View Proof Document
                                                </a>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-xs text-slate-500 font-mono" title={claim.documentHash}>
                                                    {claim.documentHash.substring(0, 16)}...
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={() => handleAttest(claim.id)}
                                                disabled={!isReady || isProcessing || Number(currentStake) <= 0}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Attest
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    {Number(currentStake) <= 0 && (
                                        <div className="bg-amber-900/20 px-6 py-2 text-xs text-amber-500 border-t border-amber-900/30">
                                            ⚠️ You must have staked MNT to attest.
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
