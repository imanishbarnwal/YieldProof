"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NetworkWarning } from '@/components/NetworkWarning';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { formatEther, parseEther, formatUnits, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    Wallet,
    Lock,
    Unlock,
    TrendingUp,
    ShieldCheck,
    Info,
    BadgeCheck,
    ArrowRight,
    Landmark,
    Calendar,
    Coins,
    XCircle
} from 'lucide-react';

interface YieldClaim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    status: 'submitted' | 'attesting' | 'verified' | 'flagged' | 'rejected';
    backingStake: string;
    attestorCount: number;
    documentHash: string;
    canUnlock: boolean;
    isClaimed: boolean;
    issuer: string;
}

export default function InvestorPage() {
    const { isReady, address } = useRequireWalletAndNetwork();
    const [verifiedClaims, setVerifiedClaims] = useState<YieldClaim[]>([]);

    // Transaction Hook
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read: All Claims
    const { data: totalClaimsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });
    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i));

    // Read Claims & Details
    const { data: claimsData, isFetching: isClaimsFetching, refetch: refetchClaims } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
    });

    const { data: stakesData, refetch: refetchStakes } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [id],
        })),
    });

    const { data: attestorCountsData, refetch: refetchAttestorCounts } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'attestorCountPerClaim',
            args: [id],
        })),
    });

    const { data: canUnlockData, refetch: refetchCanUnlock } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'canUnlockYield',
            args: [id],
        })),
    });

    const { data: isClaimedData, refetch: refetchIsClaimed } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'isClaimed',
            args: [id],
        })),
    });

    const isClaimsLoading = isClaimsFetching || !claimsData || !stakesData || !canUnlockData || !isClaimedData;

    // Process Verified Claims
    useEffect(() => {
        if (claimsData && stakesData && attestorCountsData && canUnlockData && isClaimedData) {
            const mapped = claimsData.map((res, i) => {
                const c = res.result as any;
                const s = stakesData[i]?.result as bigint || BigInt(0);
                const ac = attestorCountsData[i]?.result as bigint || BigInt(0);
                const canUnlock = canUnlockData[i]?.result as boolean;
                const isClaimed = isClaimedData[i]?.result as boolean;

                if (!c) return null;

                const statusEnum = Number(c[6]); // 0=Submitted, 1=Attesting, 2=Verified, 3=Flagged, 4=Rejected
                if (statusEnum !== 2) return null; // Only Verified

                return {
                    id: Number(c[0]),
                    assetId: c[1],
                    period: c[2],
                    yieldAmount: Number(formatUnits(c[3], 6)),
                    status: 'verified',
                    issuer: c[5],
                    backingStake: formatEther(s),
                    attestorCount: Number(ac),
                    documentHash: c[4],
                    canUnlock,
                    isClaimed
                } as YieldClaim;
            }).filter(Boolean) as YieldClaim[];

            setVerifiedClaims(mapped.reverse());
        }
    }, [claimsData, stakesData, attestorCountsData, canUnlockData, isClaimedData]);

    // Cleanup / Success Handler
    useEffect(() => {
        if (isConfirmed) {
            alert("Yield Payout Claimed Successfully!");
            refetchClaims();
            refetchStakes();
            refetchAttestorCounts();
            refetchCanUnlock();
            refetchIsClaimed();
        }
    }, [isConfirmed, refetchClaims, refetchStakes, refetchAttestorCounts, refetchCanUnlock, refetchIsClaimed]);

    // Handlers
    const handleClaimYield = (claimId: number) => {
        if (!isReady) return;
        writeContract({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'unlockYield',
            args: [BigInt(claimId)]
        });
    };

    const isProcessing = isWritePending || isConfirming;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Investor Dashboard</h1>
                    <p className="text-slate-400 text-lg">
                        In MVP, investors access cryptographically verified yield payouts. Vault deposits and capital strategies are coming in V2.
                    </p>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 w-fit animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
                        <Info className="w-4 h-4" />
                        <span>Investors do not deposit funds in MVP</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
                        <BadgeCheck className="w-4 h-4" />
                        <span>Yield is claim-based after attestation</span>
                    </div>
                </div>
            </div>

            <NetworkWarning />

            {/* Verified Yield Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <BadgeCheck className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Verified Yield Payouts</h2>
                </div>

                {isClaimsLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="bg-slate-900/50 border-slate-800 h-64">
                                <CardContent className="p-6 space-y-4">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="pt-8 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : verifiedClaims.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-center">
                        <Lock className="w-12 h-12 text-slate-700 mb-4" />
                        <h3 className="text-lg font-medium text-white">No Verified Yield Payouts Yet</h3>
                        <p className="text-slate-500 max-w-md mt-2">
                            Yield payouts appear here ONLY after they have been attested by 3 unique attestors and fully verified by the protocol.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {verifiedClaims.map((claim) => (
                            <Card key={claim.id} className={`flex flex-col border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 group`}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <StatusBadge status={claim.isClaimed ? 'verified' : 'verified'} label={claim.isClaimed ? 'CLAIMED' : 'READY TO CLAIM'} />
                                        <span className="text-xs font-mono text-slate-500">#{claim.id}</span>
                                    </div>
                                    <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors">
                                        {claim.assetId}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {claim.period}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 uppercase">Yield Payout</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-mono font-bold text-white">{claim.yieldAmount.toLocaleString()}</span>
                                                <span className="text-xs text-slate-400">USDC</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 uppercase">Attested Stake</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-mono font-bold text-emerald-400">{Number(claim.backingStake).toFixed(1)}</span>
                                                <span className="text-xs text-emerald-500/70">MNT</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-800/50">
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 uppercase">Verification Info</span>
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <span className="text-xs text-slate-300 font-mono">3/3 Attestations Confirmed</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                        {claim.isClaimed ? (
                                            <Button
                                                disabled
                                                className="w-full bg-slate-800 text-slate-500 border border-slate-700"
                                            >
                                                <BadgeCheck className="mr-2 h-4 w-4" />
                                                Claimed
                                            </Button>
                                        ) : claim.canUnlock ? (
                                            <Button
                                                onClick={() => handleClaimYield(claim.id)}
                                                disabled={!isReady || isProcessing}
                                                className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                                            >
                                                {isProcessing ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...</>
                                                ) : (
                                                    <><Unlock className="mr-2 h-4 w-4" /> Claim Verified Yield</>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled
                                                className="w-full bg-slate-800 text-slate-500"
                                            >
                                                <Lock className="mr-2 h-4 w-4" />
                                                Awaiting Stake Minimum
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0 pb-4 px-6">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                                        <span>Protocol Verified • Yield Released</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Coming Soon Section */}
            <div className="space-y-6 pt-12 border-t border-slate-800/50 opacity-40 grayscale pointer-events-none select-none">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Landmark className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-2xl font-bold text-white">Institutional Vaults</h2>
                        </div>
                        <p className="text-slate-400">Yield-bearing DeFi products with automated distribution strategies.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
