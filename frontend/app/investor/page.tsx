"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
    DollarSign,
    Star,
    Filter,
    SortAsc,
    SortDesc,
    Search,
    RefreshCw,
    Users
} from 'lucide-react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, parseEther, formatUnits, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';
import { useTransaction } from '@/hooks/useTransaction';

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
    yourSharePercentage: number;
    isClaimed: boolean;
    proofHash: string;
    canFinalize: boolean;
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

    // Sort and filter state for active disclosures
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'attesting' | 'verified'>('all');
    const [sortBy, setSortBy] = useState<'yieldAmount' | 'period' | 'status' | 'yourShare' | 'timestamp'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Transaction hooks
    const { executeTransaction, isLoading: isTransactionLoading } = useTransaction({
        onSuccess: () => {
            refetchBalance();
            refetchClaimedData();
        }
    });

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

    // Read MIN_REQUIRED_ATTESTORS from YieldProof
    const { data: minRequiredAttestorsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'MIN_REQUIRED_ATTESTORS'
    });
    const minRequiredAttestors = minRequiredAttestorsData !== undefined ? Number(minRequiredAttestorsData) : null;

    // Read verified distribution from YieldVault
    const { data: verifiedDistributionData } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'verifiedDistribution',
        query: { refetchInterval: 5000 }
    });

    // Read pending distributions from YieldVault
    const { data: pendingDistributionsData } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'getPendingDistributions',
        query: { refetchInterval: 5000 }
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

    // Read attestor count for claims
    const { data: attestorCountData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'attestorCountPerClaim',
            args: [BigInt(id)]
        })),
        query: { enabled: claimIndexes.length > 0 }
    });

    // Read verification recorded status for claims
    const { data: verificationRecordedData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'verificationRecorded',
            args: [BigInt(id)]
        })),
        query: { enabled: claimIndexes.length > 0 }
    });

    // Read claimed status for claims
    const { data: claimsClaimedData, refetch: refetchClaimedData } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'isClaimed',
            args: [BigInt(id)]
        })),
        query: { enabled: claimIndexes.length > 0 }
    });

    // Calculate balances for share calculations
    const userBalanceEth = userBalance ? Number(formatEther(userBalance as bigint)) : 0;
    const totalDepositsEth = totalDeposits ? Number(formatEther(totalDeposits as bigint)) : 0;

    // Process claims data into active disclosures
    const activeDisclosures = (claimsData?.map((claimResult, index) => {
        if (!claimResult.result) return null;

        const claim = claimResult.result as any[];
        const stakeResult = claimStakesData?.[index];
        const totalStake = stakeResult?.result ? Number(formatEther(stakeResult.result as bigint)) : 0;
        const attestorCountResult = attestorCountData?.[index];
        const attestorCount = attestorCountResult?.result ? Number(attestorCountResult.result) : 0;
        const verificationRecordedResult = verificationRecordedData?.[index];
        const isVerificationRecorded = verificationRecordedResult?.result ? Boolean(verificationRecordedResult.result) : false;
        const yieldAmount = Number(formatUnits(claim[3], 18)) || 0;
        const claimedResult = claimsClaimedData?.[index];
        const isClaimed = claimedResult?.result ? Boolean(claimedResult.result) : false;

        // Calculate user's share based on their proportion of total deposits
        const userSharePercentage = totalDepositsEth > 0 ? (userBalanceEth / totalDepositsEth) * 100 : 0;
        const yourShareAmount = totalDepositsEth > 0 ? (userBalanceEth / totalDepositsEth) * yieldAmount : 0;

        // Determine status based on attestor count and finalization state
        let status = 'submitted';
        let attestationProgress = 0;
        const requiredAttestors = minRequiredAttestors ?? 3;
        let canFinalize = false;

        if (claim[6] === 3) { // Flagged
            status = 'attesting'; // Keep as attesting since flagged claims need resolution
            attestationProgress = 0;
        } else if (attestorCount >= requiredAttestors) {
            // Has enough attestors - check if already finalized
            if (isVerificationRecorded) {
                status = 'verified';
                attestationProgress = 100;
            } else {
                // Ready to be finalized
                status = 'attesting';
                attestationProgress = 100;
                canFinalize = true;
            }
        } else if (attestorCount > 0) {
            status = 'attesting';
            const rawProgress = (attestorCount / requiredAttestors) * 100;
            attestationProgress = Math.min(99, rawProgress);
        }

        return {
            id: `disc-${claim[0]}`,
            assetId: claim[1] || 'MNT-Asset',
            period: claim[2] || 'Verified Period',
            yieldAmount,
            status,
            attestationProgress,
            totalStake,
            yourShare: yourShareAmount,
            yourSharePercentage: userSharePercentage,
            isClaimed,
            proofHash: claim[4] ? `${claim[4].slice(0, 16)}...` : 'N/A',
            canFinalize
        };
    }).filter((d): d is NonNullable<typeof d> => d !== null)) || [];

    // Filter and sort active disclosures
    const filteredAndSortedDisclosures = activeDisclosures
        .filter(disclosure => {
            // Search filter
            const matchesSearch = searchTerm === '' ||
                disclosure.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                disclosure.period.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'all' || disclosure.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'yieldAmount':
                    comparison = a.yieldAmount - b.yieldAmount;
                    break;
                case 'period':
                    comparison = a.period.localeCompare(b.period);
                    break;
                case 'status':
                    const statusOrder = { 'submitted': 0, 'attesting': 1, 'verified': 2 };
                    comparison = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
                    break;
                case 'yourShare':
                    comparison = a.yourShare - b.yourShare;
                    break;
                case 'timestamp':
                    // Sort by ID (higher ID = newer)
                    const aId = parseInt(a.id.replace('disc-', ''));
                    const bId = parseInt(b.id.replace('disc-', ''));
                    comparison = bId - aId; // Default to newest first, will be reversed if asc
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Calculate vault metrics using on-chain data
    const verifiedDistributionValue = verifiedDistributionData ? Number(formatEther(verifiedDistributionData as bigint)) : 0;
    const vaultMetrics = {
        principalEscrow: userBalanceEth,
        verifiedDistribution: verifiedDistributionValue,
        realizedPerformance: totalDepositsEth > 0 ? (verifiedDistributionValue / totalDepositsEth) * 100 : 0,
        totalActiveDisclosures: filteredAndSortedDisclosures.length
    };

    // Refetch data when transaction is confirmed - handled by useTransaction hook now

    const handleDeposit = async () => {
        if (!isConnected || !depositAmount || parseFloat(depositAmount) <= 0) return;

        const transactionConfig: any = {
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'deposit',
            value: parseEther(depositAmount)
        };

        executeTransaction(transactionConfig);
        setDepositAmount('');
    };

    const handleClaimYield = async (claimId: string) => {
        if (!isConnected) return;

        const claimIdBigInt = BigInt(claimId.replace('disc-', ''));

        executeTransaction({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'unlockYield',
            args: [claimIdBigInt]
        });
    };

    const handleFinalizeClaim = async (claimId: string) => {
        if (!isConnected) return;

        const claimIdBigInt = BigInt(claimId.replace('disc-', ''));

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'finalizeAndReward',
            args: [claimIdBigInt]
        });
    };

    const handleWithdraw = async () => {
        if (!isConnected || !withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

        if (parseFloat(withdrawAmount) > userBalanceEth) {
            // This validation should be handled by UI, but keeping for safety
            return;
        }

        executeTransaction({
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'withdraw',
            args: [parseEther(withdrawAmount)]
        });
        setWithdrawAmount('');
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
        <div className="min-h-screen bg-background page-transition">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <AnimatedSection className="mb-12">
                    <div className="text-center space-y-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-full" pulse>
                                <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
                                Beta Vault
                            </Badge>
                            <Badge variant="default" className="px-4 py-2 text-sm font-medium rounded-full">
                                <Star className="w-3 h-3 mr-1" />
                                Testnet
                            </Badge>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                                YieldProof Beta Vault
                            </h1>
                            <p className="text-xl max-w-3xl mx-auto leading-relaxed font-light">
                                This environment uses testnet capital at no risk. Experience transparent yield verification.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Vault Metrics - Match issuer page style */}
                <AnimatedSection delay={0.1} className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                            <div className="text-2xl font-bold font-display">{vaultMetrics.principalEscrow.toFixed(4)}</div>
                            <div className="text-sm">Principal Escrow</div>
                        </div>
                        <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                            <div className="text-2xl font-bold font-display">{vaultMetrics.verifiedDistribution.toFixed(4)}</div>
                            <div className="text-sm">Verified Distribution</div>
                        </div>
                        <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                            <div className="text-2xl font-bold font-display">{vaultMetrics.realizedPerformance.toFixed(4)}</div>
                            <div className="text-sm">Realized Performance</div>
                        </div>
                        <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                            <div className="text-2xl font-bold font-display">{vaultMetrics.totalActiveDisclosures}</div>
                            <div className="text-sm">Active Disclosures</div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Capital Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Add Capital - Match issuer page style */}
                    <AnimatedSection delay={0.2}>
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Add Capital</CardTitle>
                                        <CardDescription>
                                            Deposit funds into the vault escrow
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Vault</label>
                                        <select
                                            value={selectedVault}
                                            onChange={(e) => setSelectedVault(e.target.value)}
                                            className="form-input w-full appearance-none cursor-pointer custom-select"
                                        >
                                            <option>YieldProof Demo Vault</option>
                                        </select>
                                    </div>

                                    <Input
                                        label="Amount (MNT)"
                                        placeholder="0.00"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                    />

                                    <Button
                                        onClick={handleDeposit}
                                        isLoading={isTransactionLoading}
                                        disabled={!isConnected}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {!isTransactionLoading ? (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Capital
                                            </>
                                        ) : null}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedSection>

                    {/* Withdraw - Match issuer page style */}
                    <AnimatedSection delay={0.3}>
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shadow-lg">
                                        <Minus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Withdraw</CardTitle>
                                        <CardDescription>
                                            Withdraw available funds from vault
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                                        <div className="text-sm mb-1">Available Balance</div>
                                        <div className="text-lg font-semibold">
                                            {userBalanceEth.toFixed(4)} MNT
                                        </div>
                                    </div>

                                    <Input
                                        label="Withdrawal Amount (MNT)"
                                        placeholder="0.00"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                    />

                                    <Button
                                        onClick={handleWithdraw}
                                        isLoading={isTransactionLoading}
                                        disabled={!isConnected || userBalanceEth === 0}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {!isTransactionLoading ? (
                                            <>
                                                <Minus className="mr-2 h-4 w-4" />
                                                Withdraw
                                            </>
                                        ) : null}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedSection>
                </div>

                {/* Active Disclosures - Match issuer page style */}
                <AnimatedSection delay={0.4} className="mb-8">
                    <Card className="backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Active Disclosures</CardTitle>
                                        <CardDescription>
                                            Real-time verification status of institutional yields.
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="default" className="px-3 py-1">
                                    {filteredAndSortedDisclosures.length} of {activeDisclosures.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>

                            {/* Filter and Sort Controls */}
                            <div className="mb-6 space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Search */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                                            <Input
                                                placeholder="Search by asset ID or period..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 h-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="min-w-[140px]">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="w-full h-10 bg-muted/80 border border-border rounded-lg px-3 py-2 text-sm hover:border-primary/50 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 transition-all duration-200 appearance-none cursor-pointer custom-select"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundPosition: 'right 0.5rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.5em 1.5em',
                                                paddingRight: '2.5rem'
                                            }}
                                        >
                                            <option value="all" className="bg-background">All Status</option>
                                            <option value="submitted" className="bg-background">Submitted</option>
                                            <option value="attesting" className="bg-background">Attesting</option>
                                            <option value="verified" className="bg-background">Verified</option>
                                        </select>
                                    </div>

                                    {/* Sort Controls */}
                                    <div className="flex gap-2">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="h-10 bg-muted/80 border border-border rounded-lg px-3 py-2 text-sm min-w-[140px] hover:border-primary/50 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 transition-all duration-200 appearance-none cursor-pointer custom-select"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundPosition: 'right 0.5rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.5em 1.5em',
                                                paddingRight: '2.5rem'
                                            }}
                                        >
                                            <option value="yieldAmount" className="bg-background">Yield Amount</option>
                                            <option value="yourShare" className="bg-background">Your Share</option>
                                            <option value="timestamp" className="bg-background">Timestamp</option>
                                            <option value="period" className="bg-background">Period</option>
                                            <option value="status" className="bg-background">Status</option>
                                        </select>

                                        {/* Sort direction toggle */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="h-10 px-3 border-border hover:border-border-hover transition-all duration-200"
                                        >
                                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Active Filters Display */}
                                {(searchTerm || statusFilter !== 'all' || sortBy !== 'timestamp') && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm">Active:</span>
                                        {searchTerm && (
                                            <Badge variant="secondary" className="text-xs">
                                                Search: "{searchTerm}"
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="ml-1"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        )}
                                        {statusFilter !== 'all' && (
                                            <Badge variant="secondary" className="text-xs">
                                                Status: {statusFilter}
                                                <button
                                                    onClick={() => setStatusFilter('all')}
                                                    className="ml-1"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        )}
                                        {sortBy !== 'timestamp' && (
                                            <Badge variant="info" className="text-xs">
                                                Sort: {sortBy === 'yourShare' ? 'Your Share' :
                                                    sortBy === 'period' ? 'Period' :
                                                        sortBy === 'status' ? 'Status' :
                                                            sortBy === 'yieldAmount' ? 'Yield Amount' : sortBy}
                                                <span className="ml-1">({sortOrder === 'asc' ? '↑' : '↓'})</span>
                                            </Badge>
                                        )}
                                        {(searchTerm || statusFilter !== 'all' || sortBy !== 'timestamp') && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('all');
                                                    setSortBy('timestamp');
                                                    setSortOrder('asc');
                                                }}
                                                className="text-xs underline"
                                            >
                                                Reset all
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {filteredAndSortedDisclosures.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">
                                            {activeDisclosures.length === 0 ? 'No Active Disclosures' : 'No Matching Disclosures'}
                                        </h3>
                                        <p className="text-sm max-w-sm mx-auto">
                                            {activeDisclosures.length === 0
                                                ? 'There are currently no active yield disclosures to display.'
                                                : 'Try adjusting your search or filter criteria.'
                                            }
                                        </p>
                                        {(searchTerm || statusFilter !== 'all') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('all');
                                                }}
                                                className="mt-4"
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    filteredAndSortedDisclosures.map((disclosure) => (
                                        <div key={disclosure.id} className="bg-card/50 rounded-lg p-4 border border-border/50">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={getStatusColor(disclosure.status) as any}>
                                                        {getStatusLabel(disclosure.status)}
                                                    </Badge>
                                                    <span className="font-medium">{disclosure.assetId}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {disclosure.canFinalize && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleFinalizeClaim(disclosure.id)}
                                                            isLoading={isTransactionLoading}
                                                            disabled={!isConnected}
                                                            variant="success"
                                                        >
                                                            {isTransactionLoading ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                    Finalize
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                    {disclosure.status === 'verified' && (
                                                        disclosure.isClaimed ? (
                                                            <Button
                                                                size="sm"
                                                                disabled
                                                                className="bg-muted cursor-not-allowed"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                Claimed
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleClaimYield(disclosure.id)}
                                                                isLoading={isTransactionLoading}
                                                                disabled={!isConnected}
                                                                variant="primary"
                                                            >
                                                                {isTransactionLoading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Coins className="w-4 h-4 mr-1" />
                                                                        Claim
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <div className="text-xs">Period</div>
                                                    <div className="text-sm">{disclosure.period}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs">Total Yield</div>
                                                    <div className="text-sm">
                                                        {disclosure.yieldAmount.toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 6
                                                        })} MNT
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs">Your Share</div>
                                                    <div className="text-sm font-medium text-primary">
                                                        {disclosure.yourShare.toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 6
                                                        })} MNT
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs">Status</div>
                                                    <div className="text-sm">
                                                        {disclosure.canFinalize ? 'Ready to Finalize' :
                                                            disclosure.status === 'verified' ? 'Verified' :
                                                                disclosure.status === 'attesting' ? `${disclosure.attestationProgress.toFixed(0)}% Complete` :
                                                                    'Pending'}
                                                    </div>
                                                </div>
                                            </div>

                                            {disclosure.status === 'attesting' && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Verification Progress</span>
                                                        <span>{disclosure.attestationProgress.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${disclosure.attestationProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-xs">
                                                <span>Total Stake: {disclosure.totalStake} MNT</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </AnimatedSection>

                {/* Expandable Sections */}
                <div className="space-y-4">
                    {/* Ecosystem Health Analytics */}
                    <AnimatedSection delay={0.5}>
                        <EcosystemHealthCard
                            claimsData={claimsData}
                            attestorCountData={attestorCountData}
                            claimStakesData={claimStakesData}
                            verificationRecordedData={verificationRecordedData}
                            totalClaims={totalClaims}
                            minRequiredAttestors={minRequiredAttestors}
                        />
                    </AnimatedSection>

                    {/* Verification Performance Analytics */}
                    <AnimatedSection delay={0.6}>
                        <VerificationPerformanceCard
                            activeDisclosures={activeDisclosures}
                            userBalanceEth={userBalanceEth}
                            totalDepositsEth={totalDepositsEth}
                            verifiedDistributionValue={verifiedDistributionValue}
                        />
                    </AnimatedSection>

                    <AnimatedSection delay={0.9}>
                        <Card className="p-4 cursor-pointer hover:bg-muted/40 transition-colors opacity-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Landmark className="w-5 h-5" />
                                    <span className="font-medium">Institutional Pipeline (Preview Only)</span>
                                </div>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </Card>
                    </AnimatedSection>
                </div>
            </div>
        </div>
    );
}

// Ecosystem Health Analytics Component
function EcosystemHealthCard({
    claimsData,
    attestorCountData,
    claimStakesData,
    verificationRecordedData,
    totalClaims,
    minRequiredAttestors
}: {
    claimsData: any;
    attestorCountData: any;
    claimStakesData: any;
    verificationRecordedData: any;
    totalClaims: number;
    minRequiredAttestors: number | null;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate ecosystem health metrics from contract data
    const ecosystemMetrics = React.useMemo(() => {
        if (!claimsData || !attestorCountData || !claimStakesData || !verificationRecordedData) {
            return {
                totalClaims: 0,
                verifiedClaims: 0,
                verificationSuccessRate: 0,
                averageAttestorsPerClaim: 0,
                totalStakeDeployed: 0,
                flaggedClaims: 0,
                pendingClaims: 0,
                averageStakePerClaim: 0
            };
        }

        let verifiedCount = 0;
        let flaggedCount = 0;
        let pendingCount = 0;
        let totalAttestors = 0;
        let totalStake = 0;
        let validClaims = 0;

        claimsData.forEach((claimResult: any, index: number) => {
            if (!claimResult.result) return;

            const claim = claimResult.result as any[];
            const attestorCount = attestorCountData[index]?.result ? Number(attestorCountData[index].result) : 0;
            const stakeAmount = claimStakesData[index]?.result ? Number(formatEther(claimStakesData[index].result as bigint)) : 0;
            const isVerified = verificationRecordedData[index]?.result ? Boolean(verificationRecordedData[index].result) : false;

            validClaims++;
            totalAttestors += attestorCount;
            totalStake += stakeAmount;

            // Check claim status
            if (claim[6] === 3) { // Flagged
                flaggedCount++;
            } else if (isVerified) {
                verifiedCount++;
            } else {
                pendingCount++;
            }
        });

        const verificationSuccessRate = validClaims > 0 ? (verifiedCount / validClaims) * 100 : 0;
        const averageAttestorsPerClaim = validClaims > 0 ? totalAttestors / validClaims : 0;
        const averageStakePerClaim = validClaims > 0 ? totalStake / validClaims : 0;

        return {
            totalClaims: validClaims,
            verifiedClaims: verifiedCount,
            verificationSuccessRate,
            averageAttestorsPerClaim,
            totalStakeDeployed: totalStake,
            flaggedClaims: flaggedCount,
            pendingClaims: pendingCount,
            averageStakePerClaim
        };
    }, [claimsData, attestorCountData, claimStakesData, verificationRecordedData]);

    return (
        <Card className="backdrop-blur-xl">
            <CardHeader>
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Ecosystem Health Analytics</CardTitle>
                            <CardDescription>
                                Real-time verification system performance metrics
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="success" className="px-3 py-1">
                            {ecosystemMetrics.verificationSuccessRate.toFixed(1)}% Success Rate
                        </Badge>
                        <ArrowRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center space-y-2 p-3 rounded-lg bg-card/50 border border-border/50">
                            <div className="text-xl font-bold">{ecosystemMetrics.totalClaims}</div>
                            <div className="text-xs">Total Claims</div>
                        </div>
                        <div className="text-center space-y-2 p-3 rounded-lg bg-success/10 border border-success/30">
                            <div className="text-xl font-bold text-success">{ecosystemMetrics.verifiedClaims}</div>
                            <div className="text-xs">Verified</div>
                        </div>
                        <div className="text-center space-y-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                            <div className="text-xl font-bold text-warning">{ecosystemMetrics.pendingClaims}</div>
                            <div className="text-xs">Pending</div>
                        </div>
                        <div className="text-center space-y-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                            <div className="text-xl font-bold text-destructive">{ecosystemMetrics.flaggedClaims}</div>
                            <div className="text-xs">Flagged</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">Attestor Participation</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                                {ecosystemMetrics.averageAttestorsPerClaim.toFixed(1)}
                            </div>
                            <div className="text-xs">
                                Avg attestors per claim (min: {minRequiredAttestors || 3})
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="w-4 h-4" />
                                <span className="text-sm font-medium">Economic Security</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                                {ecosystemMetrics.totalStakeDeployed.toFixed(1)}
                            </div>
                            <div className="text-xs">
                                Total MNT staked across all claims
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4" />
                                <span className="text-sm font-medium">Avg Stake Security</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                                {ecosystemMetrics.averageStakePerClaim.toFixed(1)}
                            </div>
                            <div className="text-xs">
                                Average MNT staked per claim
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-info/20 border border-info/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="text-xs">
                                <p className="font-medium">Ecosystem Health Indicators:</p>
                                <p className="mt-1">
                                    • <strong>Success Rate:</strong> {ecosystemMetrics.verificationSuccessRate.toFixed(1)}% of claims successfully verified
                                    • <strong>Security:</strong> {ecosystemMetrics.totalStakeDeployed.toFixed(1)} MNT economic security deployed
                                    • <strong>Participation:</strong> {ecosystemMetrics.averageAttestorsPerClaim.toFixed(1)} avg attestors (healthy: ≥{minRequiredAttestors || 3})
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

// Verification Performance Analytics Component
function VerificationPerformanceCard({
    activeDisclosures,
    userBalanceEth,
    totalDepositsEth,
    verifiedDistributionValue
}: {
    activeDisclosures: any[];
    userBalanceEth: number;
    totalDepositsEth: number;
    verifiedDistributionValue: number;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate performance metrics
    const performanceMetrics = React.useMemo(() => {
        const totalYieldAvailable = activeDisclosures.reduce((sum, d) => sum + d.yieldAmount, 0);
        const verifiedYield = activeDisclosures
            .filter(d => d.status === 'verified')
            .reduce((sum, d) => sum + d.yieldAmount, 0);

        const userSharePercentage = totalDepositsEth > 0 ? (userBalanceEth / totalDepositsEth) * 100 : 0;
        const userPotentialYield = totalYieldAvailable * (userSharePercentage / 100);
        const userVerifiedYield = verifiedYield * (userSharePercentage / 100);

        const verificationEfficiency = totalYieldAvailable > 0 ? (verifiedYield / totalYieldAvailable) * 100 : 0;

        // Asset performance analysis
        const assetPerformance = activeDisclosures.reduce((acc, d) => {
            if (!acc[d.assetId]) {
                acc[d.assetId] = { totalYield: 0, verifiedYield: 0, count: 0 };
            }
            acc[d.assetId].totalYield += d.yieldAmount;
            acc[d.assetId].count += 1;
            if (d.status === 'verified') {
                acc[d.assetId].verifiedYield += d.yieldAmount;
            }
            return acc;
        }, {} as Record<string, { totalYield: number, verifiedYield: number, count: number }>);

        const topPerformingAssets = Object.entries(assetPerformance)
            .map(([assetId, data]) => ({
                assetId,
                totalYield: data.totalYield,
                verifiedYield: data.verifiedYield,
                successRate: data.totalYield > 0 ? (data.verifiedYield / data.totalYield) * 100 : 0,
                count: data.count
            }))
            .sort((a, b) => b.totalYield - a.totalYield)
            .slice(0, 5);

        return {
            totalYieldAvailable,
            verifiedYield,
            userSharePercentage,
            userPotentialYield,
            userVerifiedYield,
            verificationEfficiency,
            topPerformingAssets,
            totalActiveAssets: Object.keys(assetPerformance).length
        };
    }, [activeDisclosures, userBalanceEth, totalDepositsEth]);

    return (
        <Card className="backdrop-blur-xl">
            <CardHeader>
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Verification Performance Analytics</CardTitle>
                            <CardDescription>
                                Your investment performance and asset analysis
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="info" className="px-3 py-1">
                            {performanceMetrics.userSharePercentage.toFixed(1)}% Vault Share
                        </Badge>
                        <ArrowRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center space-y-2 p-3 rounded-lg bg-card/50 border border-border/50">
                            <div className="text-xl font-bold">{performanceMetrics.totalYieldAvailable.toFixed(2)}</div>
                            <div className="text-xs">Total Yield Available (MNT)</div>
                        </div>
                        <div className="text-center space-y-2 p-3 rounded-lg bg-success/10 border border-success/30">
                            <div className="text-xl font-bold text-success">{performanceMetrics.verifiedYield.toFixed(2)}</div>
                            <div className="text-xs">Verified Yield (MNT)</div>
                        </div>
                        <div className="text-center space-y-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                            <div className="text-xl font-bold text-primary">{performanceMetrics.userPotentialYield.toFixed(4)}</div>
                            <div className="text-xs">Your Potential Share (MNT)</div>
                        </div>
                        <div className="text-center space-y-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
                            <div className="text-xl font-bold text-accent">{performanceMetrics.userVerifiedYield.toFixed(4)}</div>
                            <div className="text-xs">Your Verified Share (MNT)</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Verification Efficiency */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4" />
                                <span className="text-sm font-medium">Verification Efficiency</span>
                            </div>
                            <div className="text-3xl font-bold mb-2">
                                {performanceMetrics.verificationEfficiency.toFixed(1)}%
                            </div>
                            <div className="text-xs mb-3">
                                Of available yield successfully verified
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-success to-accent h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${performanceMetrics.verificationEfficiency}%` }}
                                />
                            </div>
                        </div>

                        {/* Top Performing Assets */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-4 h-4" />
                                <span className="text-sm font-medium">Top Performing Assets</span>
                            </div>
                            <div className="space-y-2">
                                {performanceMetrics.topPerformingAssets.length > 0 ? (
                                    performanceMetrics.topPerformingAssets.map((asset, index) => (
                                        <div key={asset.assetId} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                                <span className="font-medium">{asset.assetId}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{asset.totalYield.toFixed(2)} MNT</div>
                                                <div className="text-success">{asset.successRate.toFixed(0)}% verified</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-center py-4">No asset data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-primary/20 border border-primary/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="text-xs">
                                <p className="font-medium">Your Investment Performance:</p>
                                <p className="mt-1">
                                    • <strong>Vault Share:</strong> {performanceMetrics.userSharePercentage.toFixed(2)}% of total deposits
                                    • <strong>Potential Yield:</strong> {performanceMetrics.userPotentialYield.toFixed(4)} MNT available
                                    • <strong>Verified Yield:</strong> {performanceMetrics.userVerifiedYield.toFixed(4)} MNT ready to claim
                                    • <strong>Active Assets:</strong> {performanceMetrics.totalActiveAssets} different assets generating yield
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}