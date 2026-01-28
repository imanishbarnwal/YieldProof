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
    RefreshCw
} from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { formatEther, parseEther, formatUnits, type Abi } from 'viem';
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
    yourSharePercentage: number;
    isClaimed: boolean;
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

    // Sort and filter state for active disclosures
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'attesting' | 'verified'>('all');
    const [sortBy, setSortBy] = useState<'yieldAmount' | 'period' | 'status' | 'yourShare' | 'timestamp'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

    // Read MIN_REQUIRED_ATTESTORS from YieldProof
    const { data: minRequiredAttestorsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'MIN_REQUIRED_ATTESTORS'
    });
    const minRequiredAttestors = minRequiredAttestorsData ? Number(minRequiredAttestorsData) : 3;

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
        const yieldAmount = Number(formatUnits(claim[3], 18)) || 0;
        const claimedResult = claimsClaimedData?.[index];
        const isClaimed = claimedResult?.result ? Boolean(claimedResult.result) : false;

        // Calculate user's share based on their proportion of total deposits
        const userSharePercentage = totalDepositsEth > 0 ? (userBalanceEth / totalDepositsEth) * 100 : 0;
        const yourShareAmount = totalDepositsEth > 0 ? (userBalanceEth / totalDepositsEth) * yieldAmount : 0;

        // Determine status based on claim status and attestor count
        let status = 'submitted';
        let attestationProgress = 0;

        if (claim[6] === 1) { // ClaimStatus.Attested
            status = 'attesting';
            // Calculate progress based on attestor count, cap at 99% (never show 100% until Approved)
            const rawProgress = (attestorCount / minRequiredAttestors) * 100;
            attestationProgress = Math.min(99, rawProgress);
        } else if (claim[6] === 2) { // ClaimStatus.Approved
            status = 'verified';
            attestationProgress = 100;
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
            proofHash: claim[4] ? `${claim[4].slice(0, 16)}...` : '0x997d8ca1388c...'
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

    // Calculate vault metrics
    const vaultMetrics = {
        principalEscrow: userBalanceEth,
        verifiedDistribution: 0, // This would need additional contract logic
        realizedPerformance: 0, // This would need additional contract logic
        totalActiveDisclosures: filteredAndSortedDisclosures.length
    };

    // Refetch data when transaction is confirmed
    useEffect(() => {
        if (isConfirmed) {
            refetchBalance();
            refetchClaimedData();
        }
    }, [isConfirmed, refetchBalance, refetchClaimedData]);

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
                                            className="form-input w-full appearance-none cursor-pointer"
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
                                        isLoading={isWritePending || isConfirming}
                                        disabled={!isConnected}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {!isWritePending && !isConfirming ? (
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
                                        isLoading={isWritePending || isConfirming}
                                        disabled={!isConnected || userBalanceEth === 0}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        {!isWritePending && !isConfirming ? (
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
                                            className="w-full h-10 bg-muted/80 border border-border rounded-lg px-3 py-2 text-sm hover:border-primary/50 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 transition-all duration-200 appearance-none cursor-pointer"
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
                                            className="h-10 bg-muted/80 border border-border rounded-lg px-3 py-2 text-sm min-w-[140px] hover:border-primary/50 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 transition-all duration-200 appearance-none cursor-pointer"
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
                                                                isLoading={isWritePending || isConfirming}
                                                                disabled={!isConnected}
                                                                variant="primary"
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
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <div className="text-xs">Period</div>
                                                    <div className="text-sm">{disclosure.period}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs">Yield</div>
                                                    <div className="text-sm">
                                                        {disclosure.yieldAmount.toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 6
                                                        })} MNT
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs">Status</div>
                                                    <div className="text-sm">
                                                        {disclosure.status === 'verified' ? 'Verified' :
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
                    <AnimatedSection delay={0.5}>
                        <Card className="p-4 cursor-pointer hover:bg-muted/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">Historical Payouts</span>
                                </div>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </Card>
                    </AnimatedSection>

                    <AnimatedSection delay={0.6}>
                        <Card className="p-4 cursor-pointer hover:bg-muted/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5" />
                                    <span className="font-medium">Vault Mechanics & Status</span>
                                </div>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </Card>
                    </AnimatedSection>

                    <AnimatedSection delay={0.7}>
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