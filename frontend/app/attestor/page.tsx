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
import { formatEther, parseEther, formatUnits, decodeAbiParameters, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';
import { useTransaction } from '@/hooks/useTransaction';
import { WorldIDWidget, type WorldIDProofResult } from '@/components/WorldIDWidget';
import { HumanVerificationCard } from '@/components/world/HumanVerificationCard';
import { ENSIdentityCard } from '@/components/ens/ENSIdentityCard';
import { ENSProfileLookup } from '@/components/ens/ENSProfileLookup';
import { X } from 'lucide-react';

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

    // World ID state
    const [worldIdResult, setWorldIdResult] = useState<WorldIDProofResult | null>(null);
    const [lookupSubnameModal, setLookupSubnameModal] = useState<string | null>(null);

    // Read World ID status
    const { data: isWorldIdVerifiedData, refetch: refetchWorldId } = useReadContract({
        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
        abi: CONTRACTS.AttestorRegistry.abi as Abi,
        functionName: 'isWorldIdVerified',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    });
    const isWorldIdVerified = Boolean(isWorldIdVerifiedData);

    // Read ENS Subname
    const { data: attestorSubnameData, refetch: refetchSubname } = useReadContract({
        address: CONTRACTS.YieldProofENSManager.address as `0x${string}`,
        abi: CONTRACTS.YieldProofENSManager.abi as Abi,
        functionName: 'attestorToSubname',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    });
    const attestorSubname = attestorSubnameData as string | undefined;

    // Transaction hooks
    const { executeTransaction, isLoading: isTransactionLoading } = useTransaction({
        onSuccess: () => {
            refetchAttestor();
            refetchWorldId();
            refetchSubname();
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

    const decodeProof = (proofStr?: string): readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] => {
        try {
            if (proofStr?.startsWith('0x')) {
                const decoded = decodeAbiParameters([{ type: 'uint256[8]' }], proofStr as `0x${string}`)[0];
                return decoded as any;
            }
            if (proofStr) {
                const parsed = JSON.parse(proofStr);
                if (Array.isArray(parsed) && parsed.length === 8) {
                    return parsed.map((x: any) => BigInt(x)) as any;
                }
            }
        } catch {
            // Fallback for mock/simulation proofs
        }
        return [BigInt(0), BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5), BigInt(6), BigInt(7)];
    };

    // Handlers
    const handleStake = async () => {
        if (!isConnected || !stakeAmount) return;
        const value = parseEther(stakeAmount);
        if (value <= 0) return;

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'stakeETH',
            value,
        });
    };

    const handleRegister = async () => {
        if (!isConnected) return;
        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'register',
        });
    };

    const handleLinkWorldID = async () => {
        if (!isConnected || !worldIdResult) return;
        const root = BigInt(worldIdResult.merkle_root);
        const nullifier = BigInt(worldIdResult.nullifier_hash);
        const proofArray = decodeProof(worldIdResult.proof);

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'verifyWorldID',
            args: [root, nullifier, proofArray],
        });
    };

    const handleCreateSubname = async (label: string) => {
        if (!isConnected || !label) return;
        executeTransaction({
            address: CONTRACTS.YieldProofENSManager.address as `0x${string}`,
            abi: CONTRACTS.YieldProofENSManager.abi as Abi,
            functionName: 'createAttestorSubname',
            args: [label],
        });
    };

    const handleAutoCreateSubname = async () => {
        if (!isConnected) return;
        executeTransaction({
            address: CONTRACTS.YieldProofENSManager.address as `0x${string}`,
            abi: CONTRACTS.YieldProofENSManager.abi as Abi,
            functionName: 'autoCreateAttestorSubname',
        });
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Sidebar - Attestor Status, World ID, ENS & Staking */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        <AnimatedSection delay={0.1}>
                            <HumanVerificationCard
                                isConnected={isConnected}
                                walletAddress={address}
                                isRegistered={isRegistered}
                                isWorldIdVerified={isWorldIdVerified}
                                currentStake={currentStake}
                                stakeAmount={stakeAmount}
                                setStakeAmount={setStakeAmount}
                                onRegisterWithWorldID={() => {
                                    handleRegister();
                                }}
                                onStakeOnly={handleStake}
                                onLinkWorldID={(proofResult) => {
                                    const root = BigInt(proofResult.merkle_root);
                                    const nullifier = BigInt(proofResult.nullifier_hash);
                                    const proofArray = decodeProof(proofResult.proof);

                                    executeTransaction({
                                        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
                                        abi: CONTRACTS.AttestorRegistry.abi as Abi,
                                        functionName: 'verifyWorldID',
                                        args: [root, nullifier, proofArray],
                                    });
                                }}
                                isProcessing={isProcessing}
                            />
                        </AnimatedSection>

                        {/* ENSv2 Identity Card */}
                        <AnimatedSection delay={0.15}>
                            <ENSIdentityCard
                                subname={attestorSubname}
                                isRegistered={isRegistered}
                                isWorldIdVerified={isWorldIdVerified}
                                trustScore={Math.round(attestorStats.trustScore)}
                                claimsVerified={attestorStats.successfulAttestations}
                                stake={currentStake}
                                onCreateSubname={handleCreateSubname}
                                onAutoCreateSubname={handleAutoCreateSubname}
                                onOpenLookupModal={(subname) => setLookupSubnameModal(subname)}
                                isProcessing={isProcessing}
                            />
                        </AnimatedSection>

                        {/* Rewards & Performance Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {/* Claim Rewards Card */}
                            {isRegistered && (
                                <AnimatedSection delay={0.2}>
                                    <Card className="backdrop-blur-xl border border-border/70 h-full flex flex-col justify-between">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-primary" />
                                                Rewards Center
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Pending Rewards</span>
                                                <span className="font-mono font-bold text-primary">{attestorStats.rewardsEarned.toFixed(2)} MNT</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Lifetime Claimed</span>
                                                <span className="font-mono">{attestorStats.totalRewardsClaimed.toFixed(2)} MNT</span>
                                            </div>
                                            <Button
                                                onClick={handleClaimRewards}
                                                isLoading={isProcessing}
                                                disabled={!isConnected || attestorStats.rewardsEarned <= 0}
                                                variant="primary"
                                                className="w-full text-xs font-medium"
                                            >
                                                <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                                                Claim {attestorStats.rewardsEarned.toFixed(2)} MNT
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </AnimatedSection>
                            )}

                            {/* Performance Metrics */}
                            <AnimatedSection delay={0.25} className={isRegistered ? "" : "sm:col-span-2 lg:col-span-1"}>
                                <Card className="backdrop-blur-xl border border-border/70 h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center text-accent">
                                                <BarChart3 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">Performance</CardTitle>
                                                <CardDescription className="text-xs">Attestation metrics</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2.5 pt-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Success Rate</span>
                                            <span className="font-mono font-semibold">{attestorStats.accuracyRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Verified Claims</span>
                                            <span className="font-mono font-semibold">{attestorStats.successfulAttestations}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Rewards Earned</span>
                                            <span className="font-mono font-semibold">{attestorStats.rewardsEarned.toFixed(2)} MNT</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AnimatedSection>
                        </div>
                    </div>

                    {/* Main Content - Claims Verification Queue */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        {/* Tab Navigation & Search */}
                        <AnimatedSection delay={0.3}>
                            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                                <div className="flex bg-muted/50 rounded-xl p-1 border border-border overflow-x-auto no-scrollbar">
                                    {[
                                        { key: 'pending', label: 'Pending Verification', count: pendingClaims.length, icon: Clock },
                                        { key: 'attested', label: 'Attested', count: attestedClaims.length, icon: Eye },
                                        { key: 'history', label: 'History', count: historyClaims.length, icon: CheckCircle2 }
                                    ].map(({ key, label, count, icon: Icon }) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedTab(key as any)}
                                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedTab === key
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span>{label}</span>
                                            <Badge variant={selectedTab === key ? "secondary" : "outline"} className="ml-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                                                {count}
                                            </Badge>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Search claims..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full md:w-56 text-xs sm:text-sm"
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
                                        className="hover:bg-muted shrink-0 h-10 px-3"
                                        title="Refresh claims"
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
                                                <ShieldCheck className="w-8 h-8 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                                            <p className="text-sm max-w-sm mx-auto text-muted-foreground">
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
                                                <FileText className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">
                                                {selectedTab === 'pending' ? 'No Claims to Verify' :
                                                    selectedTab === 'attested' ? 'No Pending Attestations' :
                                                        'No Attestation History'}
                                            </h3>
                                            <p className="text-sm max-w-sm mx-auto text-muted-foreground">
                                                {selectedTab === 'pending' ? 'All claims have been verified or no new claims are available.' :
                                                    selectedTab === 'attested' ? 'You have no pending attestations waiting for finalization.' :
                                                        'You haven\'t completed any attestations yet.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <StaggeredContainer key={selectedTab} className="space-y-4" staggerDelay={0.1}>
                                        {filteredClaims.map((claim) => (
                                            <Card key={claim.id} className="hover:border-primary/40 transition-all duration-300 shadow-md">
                                                <CardContent className="p-5 sm:p-6 space-y-4">
                                                    {/* Header */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2.5">
                                                                <h3 className="text-base sm:text-lg font-bold text-foreground">{claim.assetId}</h3>
                                                                <Badge variant={getStatusColor(claim.status) as any} className="text-xs font-medium">
                                                                    {getStatusLabel(claim.status)}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">Period: <span className="font-mono text-foreground/80">{claim.period}</span></p>
                                                        </div>
                                                        <div className="sm:text-right bg-primary/5 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
                                                            <p className="text-xl sm:text-2xl font-bold font-display text-primary">
                                                                {claim.yieldAmount.toLocaleString(undefined, {
                                                                    minimumFractionDigits: 0,
                                                                    maximumFractionDigits: 6
                                                                })} <span className="text-sm font-sans font-medium text-foreground">MNT</span>
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">Claimed Yield</p>
                                                        </div>
                                                    </div>

                                                    {/* Metrics Grid */}
                                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                                        <div className="text-center p-2.5 sm:p-3 bg-muted/40 rounded-xl border border-border/50">
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">Attestors</p>
                                                            <p className="font-mono font-bold text-xs sm:text-sm mt-0.5">
                                                                {claim.attestorCount || 0} / {claim.requiredAttestors || 3}
                                                            </p>
                                                        </div>
                                                        <div className="text-center p-2.5 sm:p-3 bg-muted/40 rounded-xl border border-border/50">
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">Total Stake</p>
                                                            <p className="font-mono font-bold text-xs sm:text-sm mt-0.5">
                                                                {parseFloat(claim.currentBacking || '0').toFixed(2)} MNT
                                                            </p>
                                                        </div>
                                                        <div className="text-center p-2.5 sm:p-3 bg-muted/40 rounded-xl border border-border/50">
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">Progress</p>
                                                            <p className="font-mono font-bold text-xs sm:text-sm mt-0.5">
                                                                {Math.round((claim.attestorCount || 0) / (claim.requiredAttestors || 1) * 100)}%
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Attestation Progress</span>
                                                            <span className="font-mono">{claim.attestorCount || 0} / {claim.requiredAttestors || 3} required</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${Math.min(100, ((claim.attestorCount || 0) / (claim.requiredAttestors || 1)) * 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Document Link & Actions Row */}
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                            <span className="text-xs font-mono text-muted-foreground truncate max-w-[180px] sm:max-w-[220px]">
                                                                {claim.documentHash}
                                                            </span>
                                                            {claim.documentHash.startsWith('ipfs://') && (
                                                                <a
                                                                    href={`https://gateway.pinata.cloud/ipfs/${claim.documentHash.replace('ipfs://', '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-1 shrink-0"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    View Proof
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Actions according to tab */}
                                                        {selectedTab === 'pending' && (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {(claim.attestorCount || 0) >= (claim.requiredAttestors || 3) ? (
                                                                    <Button
                                                                        onClick={() => handleFinalizeClaim(claim.id)}
                                                                        isLoading={isProcessing}
                                                                        disabled={!isConnected}
                                                                        variant="success"
                                                                        size="sm"
                                                                        className="text-xs px-4"
                                                                    >
                                                                        {!isProcessing ? (
                                                                            <>
                                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                                                Finalize & Reward
                                                                            </>
                                                                        ) : null}
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() => handleAttest(claim.id)}
                                                                        isLoading={isProcessing}
                                                                        disabled={!isConnected || parseFloat(currentStake) <= 0}
                                                                        variant="primary"
                                                                        size="sm"
                                                                        className="text-xs px-4 font-semibold"
                                                                    >
                                                                        {!isProcessing ? (
                                                                            <>
                                                                                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                                                                Attest
                                                                            </>
                                                                        ) : null}
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleFlag(claim.id)}
                                                                    isLoading={isProcessing}
                                                                    className="text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Flag className="w-3.5 h-3.5 mr-1" />
                                                                    Flag
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {selectedTab === 'attested' && (
                                                            <div className="flex items-center gap-2 text-xs font-medium text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 shrink-0">
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                <span>Attestation active & awaiting final quorum...</span>
                                                            </div>
                                                        )}

                                                        {selectedTab === 'history' && (
                                                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>Verification Recorded ✓</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Warning for insufficient stake */}
                                                    {selectedTab === 'pending' && parseFloat(currentStake) <= 0 && (
                                                        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                                                            <div>
                                                                <p className="font-semibold">Insufficient Stake</p>
                                                                <p className="text-amber-300/80 mt-0.5">You must stake at least 1.0 MNT to participate in attestation.</p>
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

            {/* Profile Lookup Modal */}
            {lookupSubnameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/85 backdrop-blur-md overflow-y-auto">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-sky-500/30 rounded-2xl shadow-2xl p-6">
                        <ENSProfileLookup
                            initialQuery={lookupSubnameModal}
                            onClose={() => setLookupSubnameModal(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}