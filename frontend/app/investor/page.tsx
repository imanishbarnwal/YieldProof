"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_STATS, MOCK_CLAIMS } from '@/lib/demoData';
import { Lock, Unlock, TrendingUp, Wallet, Loader2 } from 'lucide-react';
import { NetworkWarning } from '@/components/NetworkWarning';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { formatEther, parseEther, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';

interface YieldClaim {
    id: number;
    name: string;
    apy: number;
    risk: string;
    minInvestment: number;
    tvl: number;
    assetId: string;
    status: string;
    period: string;
    yieldAmount: number;
}

export default function InvestorPage() {
    const { isReady, address } = useRequireWalletAndNetwork();
    const [depositAmount, setDepositAmount] = useState('');

    // Contracts: YieldVault Deposit
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read: Total Deposits in Vault
    const { data: totalDepositsData, refetch: refetchTotalDeposits } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'totalDeposits',
    });
    const totalTvl = totalDepositsData ? formatEther(totalDepositsData as bigint) : '0';

    // Read: User's Balance in Vault
    const { data: userBalanceData, refetch: refetchUserBalance } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'balances',
        args: [address],
        query: {
            enabled: !!address,
        }
    });
    const userBalance = userBalanceData ? formatEther(userBalanceData as bigint) : '0';

    // Read: Get Verified Claims (Yield Opportunities)
    const { data: totalClaimsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });

    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i + 1));

    // Read Claims Info
    const { data: claimsData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
    });

    // Read Stake per Claim
    const { data: stakesData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [id],
        })),
    });

    const [verifiedClaims, setVerifiedClaims] = useState<YieldClaim[]>([]);

    // We also want to know the minTotalStake required to unlock
    const { data: minTotalStakeData } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'minTotalStake',
    });
    const minTotalStake = minTotalStakeData ? formatEther(minTotalStakeData as bigint) : '5.0';

    React.useEffect(() => {
        if (claimsData && stakesData) {
            const mapped = claimsData.map((res, i) => {
                const c = res.result as any;
                const s = stakesData[i]?.result as bigint || 0n;

                if (!c) return null;

                // Status 2 is verified (or close enough for this MVP logic if we trust on-chain status update)
                // Actually, YieldVault determines 'unlocked' based on stake >= minTotalStake
                // Let's filter by claim status 'verified' from YieldProof contract first
                const statusEnum = c[6];

                // For this demo, let's treat any claim with enough stake OR explicitly verified status as a yield opp
                const isVerified = statusEnum === 2;

                return {
                    id: Number(c[0]),
                    name: `Yield Opportunity #${c[0]}`, // Generic name or derived
                    apy: 12 + (Number(c[0]) % 5), // Mock APY for demo
                    risk: 'Low',
                    minInvestment: 50,
                    tvl: Number(formatEther(s)), // Using backing stake as a proxy for 'TVL' or 'Trust' in this context
                    assetId: c[1],
                    status: isVerified ? 'Active' : 'Pending',
                    period: c[2],
                    yieldAmount: Number(formatEther(c[3]))
                };
            }).filter(c => c && c.status === 'Active') as YieldClaim[];

            setVerifiedClaims(mapped.reverse());
        }
    }, [claimsData, stakesData]);


    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReady || !depositAmount) return;

        try {
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'deposit',
                value: parseEther(depositAmount)
            });
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        if (isConfirmed) {
            setDepositAmount('');
            refetchTotalDeposits();
            refetchUserBalance();
        }
    }, [isConfirmed, refetchTotalDeposits, refetchUserBalance]);

    const isProcessing = isWritePending || isConfirming;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Investor Dashboard</h1>
                <p className="text-slate-400">Discover and invest in verified real-world yield opportunities.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                {/* Left Column: Stats & Actions */}
                <div className="md:col-span-4 space-y-6">
                    {/* Deposit Card */}
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Deposit Liquidity</CardTitle>
                            <CardDescription>Provide MNT to valid yield pools and earn rewards.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NetworkWarning />
                            <form onSubmit={handleDeposit} className={`space-y-4 ${!isReady ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase">Amount (MNT)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pl-9 text-lg font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        <span className="absolute left-3 top-2.5 text-slate-500">Ξ</span>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-slate-950/50 p-3">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Current Balance</span>
                                        <span className="font-mono text-slate-200">{Number(userBalance).toFixed(4)} MNT</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Est. Monthly Yield</span>
                                        <span className="font-mono text-emerald-400">~1.2%</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isReady || isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                                    Deposit MNT
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Sidebar (Mobile/Desktop) */}
                    <div className="grid gap-4">
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Total Value Locked</p>
                                    <p className="text-xl font-bold text-white text-emerald-400">{Number(totalTvl).toFixed(2)} MNT</p>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-full">
                                    <Lock className="w-5 h-5 text-emerald-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Total Yield Paid</p>
                                    <p className="text-xl font-bold text-white">$42.5k</p>
                                </div>
                                <div className="p-2 bg-purple-500/10 rounded-full">
                                    <Unlock className="w-5 h-5 text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Active Vaults */}
                <div className="md:col-span-8">
                    <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Verified Yield Opportunities</CardTitle>
                            <CardDescription>Pools backed by cryptographically verified real-world assets.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto rounded-lg border border-slate-800">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b [&_tr]:border-slate-800">
                                        <tr className="border-b transition-colors hover:bg-slate-900/50">
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Asset</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Backing Stake</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Est. APY</th>
                                            <th className="h-12 px-4 align-middle font-medium text-slate-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {verifiedClaims.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-500 border-none">
                                                    No verified yield opportunities available yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            verifiedClaims.map((vault) => (
                                                <tr key={vault.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/30">
                                                    <td className="p-4 align-middle">
                                                        <div className="font-medium text-white">{vault.assetId}</div>
                                                        <div className="text-xs text-slate-500">{vault.period}</div>
                                                    </td>
                                                    <td className="p-4 align-middle text-emerald-400 font-mono">{vault.tvl} MNT</td>
                                                    <td className="p-4 align-middle text-slate-300">{vault.apy}%</td>
                                                    <td className="p-4 align-middle">
                                                        <Button variant="outline" size="sm" className="h-8 border-indigo-500/30 text-indigo-400 hover:bg-indigo-950">
                                                            Details
                                                        </Button>
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
