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
    issuer: string;
}

export default function InvestorPage() {
    const { isReady, address } = useRequireWalletAndNetwork();
    const [verifiedClaims, setVerifiedClaims] = useState<YieldClaim[]>([]);

    // Deposit State
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);

    // Withdraw State
    const [isWithdrawMode, setIsWithdrawMode] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

    // Helper to get selected claim object
    const selectedClaim = verifiedClaims.find(c => c.id === selectedClaimId);

    // Transaction Hook
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read: Total Deposits (TVL)
    const { data: totalDepositsData, refetch: refetchTotalDeposits } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'totalDeposits',
    });
    const isTVLLoading = totalDepositsData === undefined;
    const totalTvl = totalDepositsData ? formatEther(totalDepositsData as bigint) : '0';

    // Read: User's Balance
    const { data: userBalanceData, refetch: refetchUserBalance } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'balances',
        args: [address],
        query: { enabled: !!address }
    });
    const userBalance = userBalanceData ? formatEther(userBalanceData as bigint) : '0';

    // Read: All Claims
    const { data: totalClaimsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });
    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i));

    // Read Claims & Details
    const { data: claimsData, isFetching: isClaimsFetching } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
    });

    const { data: stakesData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [id],
        })),
    });

    const { data: attestorCountsData } = useReadContracts({
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

    const isClaimsLoading = isClaimsFetching || !claimsData || !stakesData || !canUnlockData;

    // Process Verified Claims
    useEffect(() => {
        if (claimsData && stakesData && attestorCountsData && canUnlockData) {
            const mapped = claimsData.map((res, i) => {
                const c = res.result as any;
                const s = stakesData[i]?.result as bigint || BigInt(0);
                const ac = attestorCountsData[i]?.result as bigint || BigInt(0);
                const canUnlock = canUnlockData[i]?.result as boolean;

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
                    canUnlock
                } as YieldClaim;
            }).filter(Boolean) as YieldClaim[];

            setVerifiedClaims(mapped.reverse());
        }
    }, [claimsData, stakesData, attestorCountsData, canUnlockData]);

    // Cleanup / Success Handler
    useEffect(() => {
        if (isConfirmed) {
            setDepositAmount('');
            setWithdrawAmount('');
            setSelectedClaimId(null);
            setIsWithdrawMode(false);
            setIsDepositModalOpen(false);
            // Simulating success toast
            if (isDepositModalOpen) alert("Deposit Successful! You have invested in the yield opportunity.");

            refetchTotalDeposits();
            refetchUserBalance();
            refetchCanUnlock();
        }
    }, [isConfirmed, refetchTotalDeposits, refetchUserBalance, refetchCanUnlock]);

    // Handlers
    const handleDeposit = async () => {
        if (!isReady || !depositAmount || selectedClaimId === null) return;
        try {
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'deposit',
                value: parseEther(depositAmount)
            });
        } catch (err) { console.error(err); }
    };

    const handleWithdraw = async () => {
        if (!isReady || !withdrawAmount) return;
        try {
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'withdraw',
                args: [parseEther(withdrawAmount)]
            });
        } catch (err) { console.error(err); }
    };

    const handleUnlock = (claimId: number) => {
        if (!isReady) return;
        writeContract({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'unlockYield',
            args: [BigInt(claimId)]
        });
    };

    const handleOpenDeposit = (claimId: number) => {
        setSelectedClaimId(claimId);
        setIsDepositModalOpen(true);
    };

    const isProcessing = isWritePending || isConfirming;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Investor Dashboard</h1>
                    <p className="text-slate-400 text-lg">Investor: deposits only into verified opportunities</p>
                </div>

                {/* Mini Portfolio Summary */}
                <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">My Balance</span>
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-500" />
                            <span className="text-xl font-mono text-white">
                                {isReady ? (isTVLLoading ? <Skeleton className="h-6 w-20 inline-block" /> : Number(userBalance).toFixed(4)) : "---"}
                            </span>
                            <span className="text-xs text-slate-500">MNT</span>
                        </div>
                    </div>
                    <div className="w-px bg-slate-800" />
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Protocol TVL</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            <span className="text-xl font-mono text-white">
                                {isReady ? (isTVLLoading ? <Skeleton className="h-6 w-20 inline-block" /> : Number(totalTvl).toFixed(2)) : "---"}
                            </span>
                            <span className="text-xs text-slate-500">MNT</span>
                        </div>
                    </div>
                    {isReady && Number(userBalance) > 0 && (
                        <>
                            <div className="w-px bg-slate-800" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsWithdrawMode(!isWithdrawMode)}
                                className="self-center h-9 border-red-900/50 text-red-400 hover:bg-red-950 hover:text-red-300"
                            >
                                Withdraw
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <NetworkWarning />

            {/* Withdraw Modal/Overlay */}
            {isWithdrawMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-white">Withdraw Funds</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setIsWithdrawMode(false)}><XCircle className="w-5 h-5" /></Button>
                            </div>
                            <CardDescription>Withdraw MNT from the vault.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-400">Available</span>
                                <span className="font-mono text-white">{Number(userBalance).toFixed(4)} MNT</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 uppercase">Amount</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                />
                            </div>
                            <Button
                                onClick={handleWithdraw}
                                disabled={isProcessing || !withdrawAmount}
                                className="w-full bg-red-600 hover:bg-red-500 text-white"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Withdraw'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Deposit Modal */}
            {isDepositModalOpen && selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
                        <CardHeader>
                            <div className="flex justify-between items-center mb-2">
                                <StatusBadge status="verified" />
                                <Button variant="ghost" size="sm" onClick={() => setIsDepositModalOpen(false)}><XCircle className="w-5 h-5 text-slate-500 hover:text-white" /></Button>
                            </div>
                            <CardTitle className="text-white">Invest in {selectedClaim.assetId}</CardTitle>
                            <CardDescription>
                                Period: {selectedClaim.period} • Yield: {selectedClaim.yieldAmount.toLocaleString()} USDC
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-lg flex justify-between items-center border border-slate-800">
                                <span className="text-sm text-slate-400">Your Balance</span>
                                <span className="font-mono text-white">{Number(userBalance).toFixed(4)} MNT</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 uppercase">Deposit Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        autoFocus
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono">MNT</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleDeposit}
                                disabled={isProcessing || !depositAmount}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {isProcessing ? 'Processing Transaction...' : 'Confirm Deposit'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Verified Opportunities Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <BadgeCheck className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Verified Yield Opportunities</h2>
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
                        <h3 className="text-lg font-medium text-white">No Verified Opportunities Yet</h3>
                        <p className="text-slate-500 max-w-md mt-2">
                            Yield claims appear here ONLY after they have been attested by 3 unique attestors and fully verified by the protocol.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {verifiedClaims.map((claim) => (
                            <Card key={claim.id} className={`flex flex-col border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 group ${selectedClaimId === claim.id ? 'ring-2 ring-emerald-500/50 scale-[1.02]' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <StatusBadge status="verified" />
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
                                            <span className="text-xs text-slate-500 uppercase">Verified Yield</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-mono font-bold text-white">{claim.yieldAmount.toLocaleString()}</span>
                                                <span className="text-xs text-slate-400">USDC</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 uppercase">Backing Stake</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-mono font-bold text-emerald-400">{Number(claim.backingStake).toFixed(1)}</span>
                                                <span className="text-xs text-emerald-500/70">MNT</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 uppercase">Attestors</span>
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                                <span className="text-sm text-slate-300 font-mono">{claim.attestorCount}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-500 uppercase">Proof Hash</span>
                                            <div className="flex items-center gap-1.5" title={claim.documentHash}>
                                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="text-xs text-slate-500 font-mono truncate w-20">
                                                    {claim.documentHash.substring(0, 10)}...
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">MVP: Proofs are public. Encrypted proofs & ZK verification coming in V2.</span>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                        {claim.canUnlock ? (
                                            <Button
                                                onClick={() => handleUnlock(claim.id)}
                                                disabled={!isReady || isProcessing}
                                                className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                                            >
                                                {isProcessing ? 'Unlocking...' : 'Unlock Yield Payout'}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => isReady ? handleOpenDeposit(claim.id) : null}
                                                disabled={!isReady}
                                                className="w-full flex justify-between items-center group/btn bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-all"
                                            >
                                                <span>{isReady ? 'Deposit MNT' : 'Connect Wallet'}</span>
                                                {isReady && <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 transition-all group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0 pb-4 px-6">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                                        <span>Fully Verified & Audited</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Vaults (Coming Soon) Section */}
            <div className="space-y-6 pt-12 border-t border-slate-800/50">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Landmark className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-2xl font-bold text-white">Institutional Vaults</h2>
                        </div>
                        <p className="text-slate-400">Standardized yield products with automated strategies (Coming V2).</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium">Coming Soon</span>
                </div>

                <div className="grid md:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 pointer-events-none select-none">
                    {[
                        { title: "Stablecoin Yield Aggregator", apy: "12-15%", risk: "Low" },
                        { title: "RWA-Backed T-Bills", apy: "5.2%", risk: "Ultra Low" },
                        { title: "Green Energy Bond", apy: "8.5%", risk: "Medium" }
                    ].map((vault, i) => (
                        <Card key={i} className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                                    <Coins className="w-5 h-5 text-slate-400" />
                                </div>
                                <CardTitle className="text-slate-200">{vault.title}</CardTitle>
                                <CardDescription>Automated rolling strategy</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Target APY</span>
                                    <span className="text-emerald-500 font-mono">{vault.apy}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Risk Profile</span>
                                    <span className="text-slate-300">{vault.risk}</span>
                                </div>
                                <Button disabled className="w-full mt-4 bg-slate-800 text-slate-500">
                                    Coming Soon
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
