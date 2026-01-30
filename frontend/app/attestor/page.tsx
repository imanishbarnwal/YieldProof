"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AnimatedSection, StaggeredContainer } from '@/components/ui/AnimatedSection';
import {
    ShieldCheck,
    ExternalLink,
    Loader2,
    Flag,
    TrendingUp,
    Award,
    Eye,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Activity,
    Target,
    Star,
    Zap,
    BarChart3,
    DollarSign,
    Info,
    RefreshCw,
    Plus
} from 'lucide-react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, parseEther, formatUnits, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';
import { useTransaction } from '@/hooks/useTransaction';

// Enhanced data types
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
    issuer?: string;
    submittedAt?: Date;
    attestorCount?: number;
    requiredAttestors?: number;
}

interface AttestorStats {
    totalAttestations: number;
    successfulAttestations: number;
    trustScore: number;
    totalStaked: number;
    rewardsEarned: number;
    totalRewardsClaimed: number;
    accuracyRate: number;
}
export default function AttestorPage() {
    const { address, isConnected } = useAccount();
    const [stakeAmount, setStakeAmount] = useState('1.0');
    const [selectedTab, setSelectedTab] = useState<'pending' | 'attested' | 'history'>('pending');
    const [searchTerm, setSearchTerm] = useState('');

    // State for different claim categories - initialize with proper defaults
    const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
    const [attestedClaims, setAttestedClaims] = useState<Claim[]>([]);
    const [historyClaims, setHistoryClaims] = useState<Claim[]>([]);
    const [attestorStats, setAttestorStats] = useState<AttestorStats>({
        totalAttestations: 0,
        successfulAttestations: 0,
        trustScore: 0,
        totalStaked: 0,
        rewardsEarned: 0,
        totalRewardsClaimed: 0,
        accuracyRate: 0
    });

    // Transaction hooks
    const { executeTransaction, isLoading: isTransactionLoading } = useTransaction({
        onSuccess: () => {
            refetchAttestor();
            refetchClaims();
            refetchHasAttested();
            refetchTotalClaims();
            refetchClaimStakes();
            refetchAttestorLists();
            setStakeAmount('1.0'); // Reset stake amount on success
        }
    });

    // Read attestor info
    const { data: attestorInfo, refetch: refetchAttestor } = useReadContract({
        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
        abi: CONTRACTS.AttestorRegistry.abi as Abi,
        functionName: 'attestors',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const isRegistered = attestorInfo ? (attestorInfo as any)[0] : false;
    const currentStakeWei = attestorInfo ? (attestorInfo as any)[1] : BigInt(0);
    const currentStake = formatEther(currentStakeWei as bigint);

    // Read constants
    const { data: minAttestorsData } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'MIN_REQUIRED_ATTESTORS',
    });

    const minAttestors = minAttestorsData !== undefined ? Number(minAttestorsData) : null;
    // Read total claims
    const { data: totalClaimsData, refetch: refetchTotalClaims } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims',
    });

    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: totalClaims }, (_, i) => BigInt(i));

    // Read claims data
    const { data: claimsData, refetch: refetchClaims } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [id],
        })),
        query: { refetchInterval: 5000 }
    });

    // Read attestation status
    const { data: hasAttestedData, refetch: refetchHasAttested } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'hasAttested',
            args: [id, address],
        })),
        query: { refetchInterval: 5000 }
    });

    // Read stake amounts per claim
    const { data: claimStakesData, refetch: refetchClaimStakes } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [id],
        })),
        query: { refetchInterval: 5000 }
    });

    // Read attestor counts using getAttestors function
    const { data: attestorListsData, refetch: refetchAttestorLists } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'getAttestors',
            args: [id],
        })),
        query: { refetchInterval: 5000 }
    });

    // Read attestor stats from contract
    const { data: attestorStatsData } = useReadContract({
        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
        abi: CONTRACTS.AttestorRegistry.abi as Abi,
        functionName: 'getAttestorStats',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const isLoading = !isConnected || (totalClaims > 0 && (!claimsData || !hasAttestedData || !claimStakesData || !attestorListsData));

    // Process claims data
    useEffect(() => {
        if (claimsData && hasAttestedData && claimStakesData && attestorListsData && address) {
            const processedClaims = claimsData.map((result, i) => {
                const claim = result.result as any;
                if (!claim) return null;

                const hasAttested = !!(hasAttestedData[i]?.result);
                const stakeAmount = claimStakesData[i]?.result ? formatEther(claimStakesData[i].result as bigint) : '0';

                // Get attestor count from the attestor list
                const attestorList = attestorListsData[i]?.result as string[] || [];
                const attestorCount = attestorList.length;
                const requiredAttestors = minAttestors ?? 3;

                // Determine status based on attestor count and finalization
                const statusEnum = Number(claim[6]);
                let statusStr: string;

                if (statusEnum === 3) statusStr = 'flagged';
                else if (statusEnum === 4) statusStr = 'rejected';
                else if (attestorCount >= requiredAttestors) {
                    // Check if finalized via recordVerification or finalizeAndReward
                    statusStr = 'verified'; // Assume verified if enough attestors
                } else if (attestorCount > 0) statusStr = 'attesting';
                else statusStr = 'submitted';

                return {
                    id: Number(claim[0]),
                    assetId: claim[1],
                    period: claim[2],
                    yieldAmount: Number(formatUnits(claim[3], 18)), // Convert from wei
                    documentHash: claim[4],
                    issuer: claim[5],
                    status: statusStr as any,
                    alreadyAttested: hasAttested,
                    currentBacking: stakeAmount,
                    attestorCount,
                    requiredAttestors: minAttestors ?? 3,
                    submittedAt: claim[7] ? new Date(Number(claim[7]) * 1000) : new Date()
                };
            }).filter(Boolean) as Claim[];

            // Filter claims by category with improved logic
            const pending = processedClaims.filter(c => {
                // Claims that haven't been attested by this user and are still open for attestation
                return !c.alreadyAttested && (c.status === 'submitted' || c.status === 'attesting');
            });

            const attested = processedClaims.filter(c => {
                // Claims that have been attested by this user but haven't reached required attestor threshold yet
                // Only show claims still in progress (not yet verified/flagged/rejected)
                return c.alreadyAttested && (
                    c.status === 'submitted' ||
                    c.status === 'attesting'
                ) && c.attestorCount! < c.requiredAttestors!;
            });

            const history = processedClaims.filter(c => {
                // IMPORTANT: Only show claims that THIS USER has personally attested to (alreadyAttested = true)
                // AND that have been completed: verified, flagged, rejected, or reached attestor threshold
                return c.alreadyAttested && (
                    c.status === 'verified' ||
                    c.status === 'flagged' ||
                    c.status === 'rejected' ||
                    c.attestorCount! >= c.requiredAttestors!
                );
            });

            setPendingClaims(pending.reverse());
            setAttestedClaims(attested.reverse());
            setHistoryClaims(history.reverse());

            // Use on-chain attestor stats if available
            if (attestorStatsData) {
                const statsArray = attestorStatsData as [bigint, bigint, bigint, bigint, bigint];
                const totalAttestations = Number(statsArray[0]);
                const successfulAttestations = Number(statsArray[1]);
                const rewards = Number(formatEther(statsArray[2]));
                const totalClaimed = Number(formatEther(statsArray[3]));
                const trustScore = Number(statsArray[4]);
                const accuracyRate = totalAttestations > 0 ? (successfulAttestations / totalAttestations) * 100 : 0;

                setAttestorStats({
                    totalAttestations,
                    successfulAttestations,
                    trustScore,
                    totalStaked: parseFloat(currentStake),
                    rewardsEarned: rewards,
                    totalRewardsClaimed: totalClaimed,
                    accuracyRate
                });
            } else {
                // Fallback to local calculation if contract call fails
                const totalAttestations = attested.length + history.length;
                const successfulAttestations = history.filter(c => c.status === 'verified').length + attested.filter(c => c.status === 'verified').length;
                const accuracyRate = totalAttestations > 0 ? (successfulAttestations / totalAttestations) * 100 : 0;

                setAttestorStats({
                    totalAttestations,
                    successfulAttestations,
                    trustScore: Math.min(100, totalAttestations * 8 + accuracyRate * 0.2),
                    totalStaked: parseFloat(currentStake),
                    rewardsEarned: 0,
                    totalRewardsClaimed: 0,
                    accuracyRate
                });
            }
        }
    }, [claimsData, hasAttestedData, claimStakesData, attestorListsData, address, currentStake, minAttestors, attestorStatsData]);

    // Refetch on transaction success - handled by useTransaction hook now

    // Handlers
    const handleStake = async () => {
        if (!isConnected || !stakeAmount) return;

        const value = parseEther(stakeAmount);
        const functionName = !isRegistered ? 'register' : 'stakeETH';

        const transactionConfig: any = {
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName,
        };

        if (value > 0) {
            transactionConfig.value = value;
        }

        executeTransaction(transactionConfig);
    };

    const handleAttest = async (claimId: number) => {
        if (!isConnected) return;

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'attestToClaim',
            args: [BigInt(claimId)]
        });
    };

    const handleFlag = async (claimId: number) => {
        if (!isConnected) return;

        const reason = window.prompt("Why are you flagging this claim?");
        if (!reason) return;

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'flagClaim',
            args: [BigInt(claimId), reason]
        });
    };

    const handleClaimRewards = async () => {
        if (!isConnected) return;

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'claimRewards',
        });
    };

    const handleFinalizeClaim = async (claimId: number) => {
        if (!isConnected) return;

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'finalizeAndReward',
            args: [BigInt(claimId)]
        });
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'warning';
            case 'attesting': return 'info';
            case 'verified': return 'success';
            case 'flagged': return 'destructive';
            case 'rejected': return 'destructive';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'submitted': return 'Awaiting Attestors';
            case 'attesting': return 'In Verification';
            case 'verified': return 'Verified';
            case 'flagged': return 'Flagged';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    // Memoized filtered claims to ensure proper updates
    const filteredClaims = useMemo(() => {
        let claims: Claim[] = [];
        switch (selectedTab) {
            case 'pending':
                claims = pendingClaims || [];
                break;
            case 'attested':
                claims = attestedClaims || [];
                break;
            case 'history':
                claims = historyClaims || [];
                break;
            default:
                claims = [];
        }

        if (!searchTerm) return claims;

        return claims.filter(claim =>
            claim && claim.assetId && claim.period &&
            (claim.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                claim.period.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [selectedTab, pendingClaims, attestedClaims, historyClaims, searchTerm]);

    const isProcessing = isTransactionLoading;

    return (
        <div className="min-h-screen bg-background page-transition">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <AnimatedSection className="mb-12">
                    <div className="text-center space-y-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Badge variant={isRegistered ? "success" : "warning"} className="px-4 py-2 text-sm font-medium rounded-full" pulse>
                                <div className={`w-2 h-2 ${isRegistered ? 'bg-accent' : 'bg-destructive'} rounded-full mr-2 animate-pulse`} />
                                {isRegistered ? 'Active Attestor' : 'Registration Required'}
                            </Badge>
                            <Badge variant="default" className="px-4 py-2 text-sm font-medium rounded-full">
                                <Star className="w-3 h-3 mr-1" />
                                Trust Score: {attestorStats.trustScore.toFixed(0)}
                            </Badge>
                        </div>
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                                Attestor Dashboard
                            </h1>
                            <p className="text-xl max-w-3xl mx-auto leading-relaxed font-light">
                                Verify yield disclosures and earn rewards through cryptographic attestation and economic consensus.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-8 max-w-5xl mx-auto">
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{attestorStats.totalStaked.toFixed(2)}</div>
                                <div className="text-sm">MNT Staked</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{attestorStats.totalAttestations}</div>
                                <div className="text-sm">Total Attestations</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{attestorStats.accuracyRate.toFixed(0)}%</div>
                                <div className="text-sm">Accuracy Rate</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{attestorStats.rewardsEarned.toFixed(2)}</div>
                                <div className="text-sm">Pending MNT</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{attestorStats.totalRewardsClaimed.toFixed(2)}</div>
                                <div className="text-sm">Total Claimed</div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Attestor Status & Staking */}
                    <div className="lg:col-span-1 space-y-6">
                        <AnimatedSection delay={0.1}>
                            <Card className="backdrop-blur-xl">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Attestor Status</CardTitle>
                                            <CardDescription>Your verification power</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Registration Status */}
                                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                                        <div>
                                            <p className="font-medium">Registration</p>
                                            <p className="text-sm">{isRegistered ? 'Active' : 'Required'}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${isRegistered ? 'bg-accent' : 'bg-destructive'}`} />
                                    </div>

                                    {/* Current Stake */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Current Stake</span>
                                            <span className="font-mono text-lg">{parseFloat(currentStake).toFixed(2)} MNT</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Trust Score</span>
                                            <span className="font-mono">{attestorStats.trustScore.toFixed(0)}/100</span>
                                        </div>
                                    </div>

                                    {/* Staking Form */}
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <Input
                                            label="Stake Amount (MNT)"
                                            type="number"
                                            value={stakeAmount}
                                            onChange={(e) => setStakeAmount(e.target.value)}
                                            placeholder="1.0"
                                            helperText="Minimum 1.0 MNT required"
                                            step="0.1"
                                            min="0"
                                        />

                                        <Button
                                            onClick={handleStake}
                                            isLoading={isProcessing}
                                            disabled={!isConnected || !stakeAmount}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            {!isProcessing ? (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {isRegistered ? 'Add Stake' : 'Register & Stake'}
                                                </>
                                            ) : null}
                                        </Button>

                                        {/* Claim Rewards Button */}
                                        {isRegistered && attestorStats.rewardsEarned > 0 && (
                                            <Button
                                                onClick={handleClaimRewards}
                                                isLoading={isProcessing}
                                                disabled={!isConnected}
                                                variant="primary"
                                                className="w-full"
                                            >
                                                {!isProcessing ? (
                                                    <>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Claim {attestorStats.rewardsEarned.toFixed(2)} MNT
                                                    </>
                                                ) : null}
                                            </Button>
                                        )}
                                    </div>
                                    {!isRegistered && (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2 p-3 bg-accent/20 border border-accent/30 rounded-lg">
                                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs">
                                                    <p className="font-medium">Registration Required</p>
                                                    <p className="mt-1">Stake MNT to become an attestor and start earning rewards.</p>
                                                </div>
                                            </div>

                                            {/* Smart Contract Information */}
                                            <div className="flex items-start gap-2 p-3 bg-primary/20 border border-primary/30 rounded-lg">
                                                <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs">
                                                    <p className="font-medium">Smart Contract Updated!</p>
                                                    <p className="mt-1">
                                                        Enhanced with improved attestor tracking and automatic gas optimization for better reliability.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </AnimatedSection>

                        {/* Performance Metrics */}
                        <AnimatedSection delay={0.2}>
                            <Card className="backdrop-blur-xl">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Performance</CardTitle>
                                            <CardDescription>Your attestation metrics</CardDescription>
                                        </div>

                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Success Rate</span>
                                            <span className="font-mono">{attestorStats.accuracyRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Verified Claims</span>
                                            <span className="font-mono">{attestorStats.successfulAttestations}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Rewards Earned</span>
                                            <span className="font-mono">{attestorStats.rewardsEarned.toFixed(2)} MNT</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedSection>
                    </div>
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Tab Navigation & Search */}
                        <AnimatedSection delay={0.3}>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex bg-muted/50 rounded-lg p-1 border border-border">
                                    {[
                                        { key: 'pending', label: 'Pending Verification', count: pendingClaims.length, icon: Clock },
                                        { key: 'attested', label: 'Attested', count: attestedClaims.length, icon: Eye },
                                        { key: 'history', label: 'History', count: historyClaims.length, icon: CheckCircle2 }
                                    ].map(({ key, label, count, icon: Icon }) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedTab(key as any)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${selectedTab === key
                                                ? 'bg-primary shadow-lg'
                                                : 'hover:bg-muted'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{label}</span>
                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                {count}
                                            </Badge>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Search claims..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            refetchClaims();
                                            refetchHasAttested();
                                            refetchClaimStakes();
                                            refetchAttestorLists();
                                        }}
                                        className="hover:bg-muted"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </AnimatedSection>
                        {/* Claims List */}
                        <AnimatedSection delay={0.4}>
                            <div className="space-y-4">
                                {!isConnected ? (
                                    <Card>
                                        <CardContent className="text-center py-12">
                                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                                            <p className="text-sm max-w-sm mx-auto">
                                                Connect your wallet to view and attest to yield claims.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : isLoading ? (
                                    <StaggeredContainer key="loading" className="space-y-4" staggerDelay={0.1}>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Card key={i} className="animate-pulse">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-3 flex-1">
                                                            <div className="h-4 bg-muted rounded w-1/3"></div>
                                                            <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                                                            <div className="h-3 bg-muted/50 rounded w-1/4"></div>
                                                        </div>
                                                        <div className="h-10 w-24 bg-muted rounded"></div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </StaggeredContainer>
                                ) : filteredClaims.length === 0 ? (
                                    <Card>
                                        <CardContent className="text-center py-12">
                                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">
                                                {selectedTab === 'pending' ? 'No Claims to Verify' :
                                                    selectedTab === 'attested' ? 'No Pending Attestations' :
                                                        'No Attestation History'}
                                            </h3>
                                            <p className="text-sm max-w-sm mx-auto">
                                                {selectedTab === 'pending' ? 'All claims have been verified or no new claims are available.' :
                                                    selectedTab === 'attested' ? 'You have no pending attestations waiting for finalization.' :
                                                        'You haven\'t completed any attestations yet.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <StaggeredContainer key={selectedTab} className="space-y-4" staggerDelay={0.1}>
                                        {filteredClaims.map((claim) => (
                                            <Card key={claim.id} className="hover:bg-muted/30 transition-all duration-300">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 space-y-4">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h3 className="text-lg font-semibold">{claim.assetId}</h3>
                                                                        <Badge variant={getStatusColor(claim.status) as any}>
                                                                            {getStatusLabel(claim.status)}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm">Period: {claim.period}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-2xl font-bold">
                                                                        {claim.yieldAmount.toLocaleString(undefined, {
                                                                            minimumFractionDigits: 0,
                                                                            maximumFractionDigits: 6
                                                                        })} MNT
                                                                    </p>
                                                                    <p className="text-sm">Claimed Yield</p>
                                                                </div>
                                                            </div>

                                                            {/* Metrics */}
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="text-center p-3 bg-muted/30 rounded-lg">
                                                                    <p className="text-xs">Attestors</p>
                                                                    <p className="font-mono">
                                                                        {claim.attestorCount || 0}/{claim.requiredAttestors || 3}
                                                                    </p>
                                                                </div>
                                                                <div className="text-center p-3 bg-muted/30 rounded-lg">
                                                                    <p className="text-xs">Total Stake</p>
                                                                    <p className="font-mono">
                                                                        {parseFloat(claim.currentBacking || '0').toFixed(2)} MNT
                                                                    </p>
                                                                </div>
                                                                <div className="text-center p-3 bg-muted/30 rounded-lg">
                                                                    <p className="text-xs">Progress</p>
                                                                    <p className="font-mono">
                                                                        {Math.round((claim.attestorCount || 0) / (claim.requiredAttestors || 1) * 100)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {/* Progress Bar */}
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-xs">
                                                                    <span>Attestation Progress</span>
                                                                    <span>{claim.attestorCount || 0} / {claim.requiredAttestors || 3} required</span>
                                                                </div>
                                                                <div className="w-full bg-muted rounded-full h-2">
                                                                    <div
                                                                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                                                                        style={{
                                                                            width: `${Math.min(100, ((claim.attestorCount || 0) / (claim.requiredAttestors || 1)) * 100)}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Document Link */}
                                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4" />
                                                                    <span className="text-xs font-mono">
                                                                        {claim.documentHash.slice(0, 20)}...
                                                                    </span>
                                                                </div>
                                                                {selectedTab !== 'history' && (
                                                                    <a
                                                                        href={claim.documentHash.startsWith('ipfs://')
                                                                            ? `https://gateway.pinata.cloud/ipfs/${claim.documentHash.replace('ipfs://', '')}`
                                                                            : '#'}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" />
                                                                        View Proof
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Actions */}
                                                        {selectedTab === 'pending' && (
                                                            <div className="flex flex-col gap-3 ml-6">
                                                                {/* Show finalize button if claim has enough attestors */}
                                                                {(claim.attestorCount || 0) >= (claim.requiredAttestors || 3) && (
                                                                    <Button
                                                                        onClick={() => handleFinalizeClaim(claim.id)}
                                                                        isLoading={isProcessing}
                                                                        disabled={!isConnected}
                                                                        variant="success"
                                                                        className="px-6"
                                                                    >
                                                                        {!isProcessing ? (
                                                                            <>
                                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                                Finalize & Reward
                                                                            </>
                                                                        ) : null}
                                                                    </Button>
                                                                )}

                                                                {/* Regular attest button */}
                                                                {(claim.attestorCount || 0) < (claim.requiredAttestors || 3) && (
                                                                    <Button
                                                                        onClick={() => handleAttest(claim.id)}
                                                                        isLoading={isProcessing}
                                                                        disabled={!isConnected || parseFloat(currentStake) <= 0}
                                                                        variant="primary"
                                                                        className="px-6"
                                                                    >
                                                                        {!isProcessing ? (
                                                                            <>
                                                                                <ShieldCheck className="w-4 h-4 mr-2" />
                                                                                Attest
                                                                            </>
                                                                        ) : null}
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleFlag(claim.id)}
                                                                    isLoading={isProcessing}
                                                                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive/80"
                                                                >
                                                                    <Flag className="w-4 h-4 mr-2" />
                                                                    Flag
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {selectedTab === 'attested' && (
                                                            <div className="flex items-center gap-2 ml-6">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span className="text-sm font-medium">Verifying...</span>
                                                            </div>
                                                        )}

                                                        {selectedTab === 'history' && (
                                                            <div className="flex flex-col gap-3 ml-6">
                                                                <div className="bg-muted/50 rounded-lg p-4 border border-accent/30">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <CheckCircle2 className="w-5 h-5" />
                                                                        <span className="text-sm font-semibold">Attestation Complete</span>
                                                                    </div>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex justify-between items-center">
                                                                            <span>Required Attestors:</span>
                                                                            <span className="font-mono">{claim.requiredAttestors}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                            <span>Attestors Reached:</span>
                                                                            <span className="font-mono font-semibold">{claim.attestorCount || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center pt-2 border-t border-border">
                                                                            <span>Criteria Fulfilled:</span>
                                                                            <span className="font-mono font-bold">
                                                                                {claim.attestorCount || 0}/{claim.requiredAttestors || 3} ✓
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                            <span>Final Status:</span>
                                                                            <Badge variant={getStatusColor(claim.status) as any} className="ml-2">
                                                                                {getStatusLabel(claim.status)}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Warning for insufficient stake */}
                                                    {selectedTab === 'pending' && parseFloat(currentStake) <= 0 && (
                                                        <div className="mt-4 flex items-start gap-2 p-3 bg-accent/20 border border-accent/30 rounded-lg">
                                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            <div className="text-xs">
                                                                <p className="font-medium">Insufficient Stake</p>
                                                                <p className="mt-1">You must stake MNT to attest to claims.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </StaggeredContainer>
                                )}
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </div>
        </div>
    );
}