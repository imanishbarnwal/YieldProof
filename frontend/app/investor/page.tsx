"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { AnimatedSection, StaggeredContainer } from '@/components/ui/AnimatedSection';
import { 
    Wallet,
    TrendingUp,
    ShieldCheck,
    Info,
    ArrowRight,
    Landmark,
    Calendar,
    Coins,
    Clock,
    Target,
    Activity,
    Plus,
    Minus,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Loader2,
    PieChart,
    BarChart3,
    DollarSign
} from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { formatEther, parseEther, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';

// Types
interface VaultPosition {
    id: string;
    vaultName: string;
    principalAmount: number;
    verifiedDistribution: number;
    realizedPerformance: number;
    status: 'active' | 'settled';
    lastUpdate: Date;
}

interface ActiveDisclosure {
    id: string;
    assetId: string;
    period: string;
    yieldAmount: number;
    status: 'submitted' | 'attesting' | 'verified';
    attestationProgress: number;
    totalStake: number;
    yourShare: number;
    proofHash: string;
}

interface VaultMetrics {
    principalEscrow: number;
    verifiedDistribution: number;
    realizedPerformance: number;
    totalActiveDisclosures: number;
}

interface HistoricalPayout {
    id: string;
    date: Date;
    amount: number;
    assetId: string;
    txHash: string;
}

export default function InvestorPage() {
    const { address, isConnected } = useAccount();
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedVault, setSelectedVault] = useState('YieldProof Demo Vault');

    // Contract Write Hook
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read user balance from YieldVault
    const { data: userBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'balances',
        args: [address],
        query: { enabled: !!address }
    });

    // Read total deposits from YieldVault
    const { data: totalDeposits } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'totalDeposits'
    });

    // Read total claims count from YieldProof
    const { data: totalClaimsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims'
    });

    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: Math.min(totalClaims, 10) }, (_, i) => i);

    // Read individual claims data
    const { data: claimsData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [BigInt(id)]
        })),
        query: { enabled: claimIndexes.length > 0 }
    });

    // Read stake data for claims
    const { data: claimStakesData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [BigInt(id)]
        })),
        query: { enabled: claimIndexes.length > 0 }
    });

    // Process claims data into active disclosures
    const activeDisclosures = (claimsData?.map((claimResult, index) => {
        if (!claimResult.result) return null;
        
        const claim = claimResult.result as any[];
        const stakeResult = claimStakesData?.[index];
        const totalStake = stakeResult?.result ? Number(formatEther(stakeResult.result as bigint)) : 0;
        
        // Determine status based on claim status and stake
        let status = 'submitted';
        let attestationProgress = 0;
        
        if (claim[6] === 1) { // ClaimStatus.Attested
            status = 'attesting';
            attestationProgress = Math.min(100, (totalStake / 0.1) * 100); // Assuming 0.1 ETH minimum
        } else if (claim[6] === 2) { // ClaimStatus.Approved
            status = 'verified';
            attestationProgress = 100;
        }

        return {
            id: `disc-${claim[0]}`,
            assetId: claim[1] || 'MNT-Asset',
            period: claim[2] || 'Verified Period',
            yieldAmount: Number(claim[3]) || 0,
            status,
            attestationProgress,
            totalStake,
            yourShare: totalStake * 0.1, // Simplified calculation
            proofHash: claim[4] ? `${claim[4].slice(0, 16)}...` : '0x997d8ca1388c...'
        };
    }).filter((d): d is NonNullable<typeof d> => d !== null)) || [];

    // Calculate vault metrics
    const userBalanceEth = userBalance ? Number(formatEther(userBalance as bigint)) : 0;
    const totalDepositsEth = totalDeposits ? Number(formatEther(totalDeposits as bigint)) : 0;
    
    const vaultMetrics = {
        principalEscrow: userBalanceEth,
        verifiedDistribution: 0, // This would need additional contract logic
        realizedPerformance: 0, // This would need additional contract logic
        totalActiveDisclosures: activeDisclosures.length
    };

    // Refetch data when transaction is confirmed
    useEffect(() => {
        if (isConfirmed) {
            refetchBalance();
        }
    }, [isConfirmed, refetchBalance]);

    const handleDeposit = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            alert('Please enter a valid deposit amount.');
            return;
        }

        try {
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'deposit',
                value: parseEther(depositAmount)
            });
            setDepositAmount('');
        } catch (error) {
            console.error('Deposit failed:', error);
            alert('Deposit failed. Please try again.');
        }
    };

    const handleClaimYield = async (claimId: string) => {
        if (!isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        try {
            const claimIdBigInt = BigInt(claimId.replace('disc-', ''));
            
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'unlockYield',
                args: [claimIdBigInt]
            });
        } catch (error) {
            console.error('Claim yield failed:', error);
            alert('Claim yield failed. Please try again.');
        }
    };

    const handleWithdraw = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            alert('Please enter a valid withdrawal amount.');
            return;
        }

        if (parseFloat(withdrawAmount) > userBalanceEth) {
            alert('Insufficient balance for withdrawal.');
            return;
        }

        try {
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'withdraw',
                args: [parseEther(withdrawAmount)]
            });
            setWithdrawAmount('');
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert('Withdrawal failed. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'secondary';
            case 'attesting': return 'warning';
            case 'verified': return 'success';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'submitted': return 'Submitted';
            case 'attesting': return 'Attesting';
            case 'verified': return 'Verified';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            {/* Header */}
            <AnimatedSection className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-white">YieldProof Beta Vault</h1>
                        <p className="text-slate-400">This environment uses testnet capital at no risk.</p>
                    </div>
                </div>
            </AnimatedSection>

            {/* Vault Metrics */}
            <AnimatedSection delay={0.1} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card variant="accent" className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Wallet className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm text-slate-400 uppercase">Principal Escrow</span>
                        </div>
                        <div className="text-3xl font-semibold text-white mb-1">
                            {vaultMetrics.principalEscrow.toFixed(4)}
                        </div>
                        <div className="text-sm text-slate-400">MNT</div>
                        <div className="flex gap-2 mt-4">
                            <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => document.getElementById('deposit-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Add Capital
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => document.getElementById('withdraw-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Withdraw
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-400 uppercase">Verified Distribution</span>
                        </div>
                        <div className="text-3xl font-semibold text-white mb-1">
                            {vaultMetrics.verifiedDistribution.toFixed(4)}
                        </div>
                        <div className="text-sm text-slate-400">MNT</div>
                        <div className="text-xs text-slate-500 mt-2">
                            {activeDisclosures.filter(d => d.status === 'verified').length > 0 ? 'No Active Yield' : 'Settled via Verification'}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-400 uppercase">Realized Performance</span>
                        </div>
                        <div className="text-3xl font-semibold text-white mb-1">
                            {vaultMetrics.realizedPerformance.toFixed(4)}
                        </div>
                        <div className="text-sm text-slate-400">MNT</div>
                        <div className="text-xs text-slate-500 mt-2">
                            {vaultMetrics.realizedPerformance > 0 ? 'Settled via Verification' : 'Settled via Verification'}
                        </div>
                    </Card>
                </div>
            </AnimatedSection>

            {/* Capital Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Add Capital */}
                <AnimatedSection delay={0.2}>
                    <Card id="deposit-section" className="p-6">
                        <CardHeader className="p-0 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-white">Add Capital</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Deposit funds into the vault escrow
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Vault</label>
                                <select 
                                    value={selectedVault}
                                    onChange={(e) => setSelectedVault(e.target.value)}
                                    className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-600/50 rounded-lg px-3 py-2 text-white"
                                >
                                    <option>YieldProof Demo Vault</option>
                                </select>
                            </div>

                            <Input
                                label="Amount (MNT)"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-slate-600/50 text-white"
                            />

                            <Button
                                onClick={handleDeposit}
                                disabled={isWritePending || isConfirming || !isConnected}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white"
                            >
                                {isWritePending || isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isWritePending ? 'Confirming...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Capital
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </AnimatedSection>

                {/* Withdraw */}
                <AnimatedSection delay={0.3}>
                    <Card id="withdraw-section" className="p-6">
                        <CardHeader className="p-0 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                                    <Minus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-white">Withdraw</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Withdraw available funds from vault
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="space-y-4">
                            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Available Balance</div>
                                <div className="text-lg font-semibold text-white">
                                    {userBalanceEth.toFixed(4)} MNT
                                </div>
                            </div>

                            <Input
                                label="Withdrawal Amount (MNT)"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-slate-600/50 text-white"
                            />

                            <Button
                                onClick={handleWithdraw}
                                disabled={isWritePending || isConfirming || !isConnected || userBalanceEth === 0}
                                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white"
                            >
                                {isWritePending || isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isWritePending ? 'Confirming...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <Minus className="mr-2 h-4 w-4" />
                                        Withdraw
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </AnimatedSection>
            </div>

            {/* Active Disclosures */}
            <AnimatedSection delay={0.4} className="mb-8">
                <Card className="p-6">
                    <CardHeader className="p-0 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-white">Active Disclosures</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Real-time verification status of institutional yields.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <div className="space-y-4">
                        {activeDisclosures.map((disclosure) => (
                            <div key={disclosure.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={getStatusColor(disclosure.status) as any}>
                                            {getStatusLabel(disclosure.status)}
                                        </Badge>
                                        <span className="text-white font-medium">{disclosure.assetId}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm text-slate-400">Your Share to 99%</div>
                                            <div className="text-lg font-semibold text-white">
                                                {disclosure.yourShare.toFixed(4)} MNT
                                            </div>
                                        </div>
                                        {disclosure.status === 'verified' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleClaimYield(disclosure.id)}
                                                disabled={isWritePending || isConfirming || !isConnected}
                                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white"
                                            >
                                                {isWritePending || isConfirming ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Coins className="w-4 h-4 mr-1" />
                                                        Claim
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div>
                                        <div className="text-xs text-slate-500">Period</div>
                                        <div className="text-sm text-slate-300">{disclosure.period}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Yield</div>
                                        <div className="text-sm text-slate-300">{disclosure.yieldAmount} MNT</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Status</div>
                                        <div className="text-sm text-slate-300">
                                            {disclosure.status === 'attesting' ? `${disclosure.attestationProgress}% Verified` : 'Verified'}
                                        </div>
                                    </div>
                                </div>

                                {disclosure.status === 'attesting' && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Verification Progress</span>
                                            <span>{disclosure.attestationProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${disclosure.attestationProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Total Stake: {disclosure.totalStake} MNT</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono">{disclosure.proofHash}</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </AnimatedSection>

            {/* Expandable Sections */}
            <div className="space-y-4">
                <AnimatedSection delay={0.5}>
                    <Card className="p-4 cursor-pointer hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <span className="text-white font-medium">Historical Payouts</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.6}>
                    <Card className="p-4 cursor-pointer hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-slate-400" />
                                <span className="text-white font-medium">Vault Mechanics & Status</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </Card>
                </AnimatedSection>

                <AnimatedSection delay={0.7}>
                    <Card className="p-4 cursor-pointer hover:bg-slate-800/40 transition-colors opacity-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Landmark className="w-5 h-5 text-slate-400" />
                                <span className="text-white font-medium">Institutional Pipeline (Preview Only)</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </Card>
                </AnimatedSection>
            </div>
        </div>
    );
}