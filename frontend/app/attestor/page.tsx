"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NetworkWarning } from '@/components/NetworkWarning';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserCheck, ShieldCheck, ExternalLink, Loader2, Flag } from 'lucide-react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts, useChainId } from 'wagmi';
import { formatEther, parseEther, formatUnits, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';

// Data types
interface Claim {
    id: number;
    assetId: string;
    period: string;
    yieldAmount: number;
    documentHash: string;
    status: 'submitted' | 'attesting' | 'verified' | 'flagged' | 'rejected';
    alreadyAttested?: boolean;
    currentBacking?: string;
    attestors?: string[];
}

export default function AttestorPage() {
    const { isReady, address } = useRequireWalletAndNetwork();
    const chainId = useChainId();
    const [stakeAmountInput, setStakeAmountInput] = useState("1.0");

    // Section State Variables
    const [readyToVerifyClaims, setReadyToVerifyClaims] = useState<Claim[]>([]);
    const [attestedByMeClaims, setAttestedByMeClaims] = useState<Claim[]>([]);
    const [attestationHistoryClaims, setAttestationHistoryClaims] = useState<Claim[]>([]);
    const [allClaimsDebug, setAllClaimsDebug] = useState<Claim[]>([]);

    const [myStats, setMyStats] = useState({ totalAttestations: 0, trustScore: 0 });

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
            refetchInterval: 5000,
        }
    });

    const isAttestorInfoLoading = attestorInfo === undefined && address !== undefined;
    const isRegistered = attestorInfo ? (attestorInfo as any)[0] : false;
    const currentStakeWei = attestorInfo ? (attestorInfo as any)[1] : BigInt(0);
    const currentStake = formatEther(currentStakeWei as bigint);

    // Read: Constants from YieldProof
    const { data: minAttestorsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'MIN_REQUIRED_ATTESTORS',
    });

    const minAttestors = minAttestorsData ? Number(minAttestorsData) : 0;

    // Read: Total Claims count
    const { data: totalClaimsData, refetch: refetchTotalClaims } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });

    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const threshold = minAttestors > 0 ? minAttestors : "Loading..."; // For debug panel
    // FIX: IDs start at 0 in YieldProof.sol, so array should be 0..totalClaims-1
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i));

    // Read: Individual Claims Data
    const { data: claimsData, refetch: refetchClaims } = useReadContracts({
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

    // Read: Check if user has already attested each claim
    const { data: hasAttestedData, refetch: refetchHasAttested } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'hasAttested',
            args: [id, address],
        })),
        query: {
            refetchInterval: 5000,
        }
    });

    // Read: Attestor Count per Claim (for consistency check)
    const { data: attestorCountsData, refetch: refetchAttestorCounts } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'attestorCountPerClaim',
            args: [id],
        })),
        query: { refetchInterval: 5000 }
    });

    // Read: Attestors List per Claim (DEBUG & Display)
    const { data: attestorsListData, refetch: refetchAttestorsList } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'getAttestors',
            args: [id],
        })),
        query: {
            refetchInterval: 5000,
        }
    });

    const isClaimsLoading = !claimsData || !claimStakesData || !hasAttestedData || !attestorsListData || !attestorCountsData;

    // Effect: Process and filter claims
    useEffect(() => {
        if (claimsData && hasAttestedData && claimStakesData && attestorsListData && attestorCountsData && address) {
            let attestedCount = 0;

            const rawClaims = claimsData.map((result, i) => {
                const c = result.result as any;
                const hasAttestedResult = hasAttestedData[i];
                const alreadyAttested = !!(hasAttestedResult?.result);

                const stakeResult = claimStakesData[i];
                const currentBacking = stakeResult?.result ? formatEther(stakeResult.result as bigint) : '0';

                const attestorsResult = attestorsListData[i];
                const attestors = attestorsResult?.result ? (attestorsResult.result as string[]) : [];

                const countResult = attestorCountsData[i];
                const onChainCount = countResult?.result ? Number(countResult.result) : 0;

                // SAFETY CHECK: Consistency
                if (attestors.length !== onChainCount) {
                    console.warn(`[INTEGRITY WARN] Claim ID ${i} mismatch: List=${attestors.length}, Count=${onChainCount}`);
                }

                if (alreadyAttested) attestedCount++;

                if (!c) return null;

                const statusEnum = Number(c[6]);
                // 0=Submitted, 1=Attesting, 2=Verified, 3=Flagged, 4=Rejected
                const statusStr = ['submitted', 'attesting', 'verified', 'flagged', 'rejected'][statusEnum];

                return {
                    id: Number(c[0]),
                    assetId: c[1],
                    period: c[2],
                    yieldAmount: Number(formatUnits(c[3], 6)),
                    documentHash: c[4],
                    status: statusStr as any,
                    alreadyAttested,
                    currentBacking,
                    attestors
                };
            });

            const validClaims = rawClaims.filter(c =>
                c !== null &&
                c.assetId &&
                c.assetId.trim() !== "" &&
                // Ensure we don't show "empty" zero-initialized structs (though c[1] check covers this mostly)
                c.yieldAmount !== undefined
            ) as Claim[];

            // SAFETY CHECK: Data Loss
            if (totalClaims > 0 && validClaims.length === 0) {
                console.warn("[DATA WARN] Total claims > 0 but valid claims list is empty. Check ABI or Indexing.");
            }

            setAllClaimsDebug(validClaims);

            setMyStats({
                totalAttestations: attestedCount,
                trustScore: Math.min(100, attestedCount * 10)
            });

            // 1. READY TO VERIFY
            // Claims I have NOT attested to yet, that are pending verification
            const ready = validClaims.filter(c =>
                !c.alreadyAttested &&
                (c.status === 'submitted' || c.status === 'attesting')
            ).reverse();
            setReadyToVerifyClaims(ready);

            // 2. ATTESTED BY ME (Pending Finalization)
            // Claims I HAVE attested to, but are not yet Verified/Rejected/Flagged
            const attestedByMe = validClaims.filter(c =>
                c.alreadyAttested &&
                (c.status === 'submitted' || c.status === 'attesting')
            ).reverse();
            setAttestedByMeClaims(attestedByMe);

            // 3. ATTESTATION HISTORY
            // Claims I have attested to that are now resolved (Verified, Flagged, Rejected)
            const history = validClaims.filter(c =>
                c.alreadyAttested &&
                (c.status === 'verified' || c.status === 'flagged' || c.status === 'rejected')
            ).reverse();
            setAttestationHistoryClaims(history);
        }
    }, [claimsData, hasAttestedData, claimStakesData, attestorsListData, attestorCountsData, address, totalClaims]);

    // Effect: Refetch on transaction success
    useEffect(() => {
        if (isConfirmed) {
            refetchAttestor();
            refetchClaims();
            refetchHasAttested();
            refetchTotalClaims();
            refetchClaimStakes();
            refetchAttestorsList();
            refetchAttestorCounts();
        }
    }, [isConfirmed, refetchAttestor, refetchClaims, refetchHasAttested, refetchTotalClaims, refetchClaimStakes, refetchAttestorsList, refetchAttestorCounts]);


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

    const handleFlag = async (claimId: number) => {
        if (!isReady) return;
        const reason = window.prompt("Why are you flagging this claim? (e.g. 'Duplicate', 'Invalid Data')");
        if (!reason) return;

        try {
            writeContract({
                address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
                abi: CONTRACTS.AttestorRegistry.abi as Abi,
                functionName: 'flagClaim',
                args: [BigInt(claimId), reason]
            });
        } catch (e) {
            console.error("Flagging failed:", e);
        }
    };

    const isProcessing = isWritePending || isConfirming;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* ... Header and Stats (unchanged) ... */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Attestor Dashboard</h1>
                <p className="text-slate-400">Attestor: verifies claims by staking MNT</p>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-slate-500"></span> Submitted
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Attesting
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Sidebar: Staking Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Staked (MNT)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-400">
                                {isAttestorInfoLoading ? <Skeleton className="h-9 w-32" /> : `${Number(currentStake).toFixed(2)} MNT`}
                            </div>
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
                                    {isClaimsLoading ? <Skeleton className="h-5 w-8 inline-block" /> : myStats.totalAttestations}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Trust Score</span>
                                <span className="font-mono text-emerald-400">{myStats.trustScore}/100</span>
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

                {/* Main Content Areas */}
                <div className="lg:col-span-8 space-y-10">
                    <NetworkWarning />

                    {/* 1. READY TO VERIFY */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                Ready to Verify
                            </h2>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                {readyToVerifyClaims.length} Claims
                            </span>
                        </div>

                        {(!isReady) ? (
                            <div className="text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-lg bg-slate-900/20">
                                <p className="mb-2">Wallet not connected</p>
                                <p className="text-xs text-slate-600">Please connect your wallet to view pending verifications.</p>
                            </div>
                        ) : isClaimsLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="p-6 border border-slate-800 bg-slate-900/20 rounded-lg space-y-4">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))
                        ) : readyToVerifyClaims.length === 0 ? (
                            <div className="text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-lg">
                                <p className="text-sm">No new claims to verify.</p>
                            </div>
                        ) : (
                            readyToVerifyClaims.map((claim) => (
                                <Card key={claim.id} className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="grid gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{claim.assetId}</h3>
                                                <StatusBadge
                                                    status={claim.status}
                                                    label={
                                                        claim.status === 'submitted' ? 'Awaiting Attestors' :
                                                            claim.status === 'attesting' ? 'In Verification' : undefined
                                                    }
                                                />
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                Period: {claim.period} • Yield: <span className="text-emerald-400">{claim.yieldAmount.toLocaleString()} USDC</span>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <a
                                                    href={claim.documentHash.startsWith('ipfs://')
                                                        ? `https://gateway.pinata.cloud/ipfs/${claim.documentHash.replace('ipfs://', '')}`
                                                        : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 group"
                                                >
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    View Proof
                                                </a>
                                                <span className="text-[10px] text-slate-500">MVP: Proofs are public. Encrypted proofs & ZK verification coming in V2.</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-900/30 text-red-500/70 hover:bg-red-950/30 hover:text-red-400"
                                                onClick={() => handleFlag(claim.id)}
                                                disabled={isProcessing}
                                            >
                                                <Flag className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                onClick={() => handleAttest(claim.id)}
                                                disabled={!isReady || isProcessing || Number(currentStake) <= 0}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                                            >
                                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
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

                    {/* 2. ATTESTED BY ME */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Loader2 className="w-5 h-5 text-blue-400" />
                                Attested By Me <span className="text-slate-500 text-sm font-normal">(Pending Finalization)</span>
                            </h2>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                {attestedByMeClaims.length} Claims
                            </span>
                        </div>

                        {attestedByMeClaims.length === 0 ? (
                            <div className="text-slate-500 text-sm italic py-4">No pending attestations.</div>
                        ) : (
                            attestedByMeClaims.map((claim) => (
                                <Card key={claim.id} className="border-slate-800 bg-slate-900/20 opacity-90 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="grid gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-300">{claim.assetId}</h3>
                                                <StatusBadge
                                                    status={claim.status}
                                                    label={
                                                        claim.status === 'submitted' ? 'Awaiting Attestors' :
                                                            claim.status === 'attesting' ? 'In Verification' : undefined
                                                    }
                                                />
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Period: {claim.period} • Yield: {claim.yieldAmount.toLocaleString()} USDC
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-blue-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verifying...
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* 3. ATTESTATION HISTORY */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-400" />
                                Attestation History <span className="text-slate-500 text-sm font-normal">(Verified)</span>
                            </h2>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                {attestationHistoryClaims.length} Claims
                            </span>
                        </div>

                        {attestationHistoryClaims.length === 0 ? (
                            <div className="text-slate-500 text-sm italic py-4">No verified history yet.</div>
                        ) : (
                            attestationHistoryClaims.map((claim) => (
                                <Card key={claim.id} className="border-slate-800 bg-slate-900/40">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="grid gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-300">{claim.assetId}</h3>
                                                <StatusBadge status="verified" />
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Period: {claim.period} • My Stake: <span className="text-slate-400">{Number(currentStake).toFixed(2)} MNT</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                                            <ShieldCheck className="w-4 h-4" />
                                            Verified
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
