"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AnimatedSection, StaggeredContainer } from '@/components/ui/AnimatedSection';
import { Select } from '@/components/ui/Select';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, parseEther, type Abi } from 'viem';
import { format, isAfter, isBefore, isValid } from 'date-fns';
import { CONTRACTS } from '@/app/config/contracts';
import { useTransaction } from '@/hooks/useTransaction';
import {
    Upload,
    FileText,
    PlusCircle,
    Loader2,
    ExternalLink,
    Info,
    CheckCircle2,
    Shield,
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    AlertTriangle,
    Eye,
    Download,
    Clock,
    Target,
    Zap,
    BarChart3,
    Activity,
    Sparkles,
    Scale,
    Lock,
    Coins
} from 'lucide-react';

// Types
interface Disclosure {
    id: string;
    vaultName: string;
    assetId: string;
    period: string;
    yieldAmount: number;
    documentHash: string;
    status: 'submitted' | 'attesting' | 'verified' | 'flagged' | 'rejected';
    currentStake: string;
    attestorCount: number;
    minAttestors: number;
    proofHash: string;
    submittedAt: Date;
    verifiedAt?: Date;
}

interface VaultMetrics {
    totalDisclosures: number;
    auditSuccessRate: number;
    accuracyTier: string;
    totalStaked: string;
    avgVerificationTime: string;
    reputationScore: number;
}

interface EscrowFunding {
    id: string;
    vaultName: string;
    amount: number;
    fundedAt: Date;
    status: 'pending' | 'confirmed' | 'distributed';
    txHash?: string;
}

export default function IssuerPage() {
    const { address, isConnected } = useAccount();
    const [selectedVault, setSelectedVault] = useState('YieldProof Demo Vault');
    const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
    const [escrowFundings, setEscrowFundings] = useState<EscrowFunding[]>([]);
    const [formData, setFormData] = useState({
        assetId: '',
        startDate: '' as string,
        endDate: '' as string,
        yieldAmount: '',
        documentHash: ''
    });
    const [escrowData, setEscrowData] = useState({
        vaultName: 'YieldProof Demo Vault (0 Pool)',
        amount: ''
    });
    const [uploadedCid, setUploadedCid] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dateValidationError, setDateValidationError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<string>('');

    // Set current date on client side only
    useEffect(() => {
        setCurrentDate(new Date().toISOString().split('T')[0]);
    }, []);

    // Helper function to get current date (client-side only)
    const getCurrentDate = () => {
        return new Date();
    };

    // Transaction hooks
    const { executeTransaction, isLoading: isTransactionLoading } = useTransaction({
        onSuccess: () => {
            refetchTotalClaims();
            refetchClaims();
            refetchAttestorLists();
            refetchClaimStakes();
            refetchTotalDeposits();
            refetchPendingDistributions();
            // Reset forms on success
            setFormData({
                assetId: '',
                startDate: '',
                endDate: '',
                yieldAmount: '',
                documentHash: ''
            });
            setUploadedCid(null);
            setDateValidationError(null);
            setEscrowData(prev => ({ ...prev, amount: '' }));
        }
    });

    // Read total claims count from YieldProof
    const { data: totalClaimsData, refetch: refetchTotalClaims } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'getTotalClaims'
    });

    const totalClaims = totalClaimsData ? Number(totalClaimsData) : 0;
    const claimIndexes = Array.from({ length: Math.min(totalClaims, 10) }, (_, i) => i);

    // Read individual claims data for user's claims
    const { data: claimsData, refetch: refetchClaims } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'claims',
            args: [BigInt(id)]
        })),
        query: { enabled: claimIndexes.length > 0 }
    });

    // Read attestor lists for each claim
    const { data: attestorListsData, refetch: refetchAttestorLists } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'getAttestors',
            args: [BigInt(id)],
        })),
        query: { enabled: claimIndexes.length > 0, refetchInterval: 5000 }
    });

    // Read stake amounts per claim
    const { data: claimStakesData, refetch: refetchClaimStakes } = useReadContracts({
        contracts: claimIndexes.map(id => ({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'totalStakePerClaim',
            args: [BigInt(id)],
        })),
        query: { enabled: claimIndexes.length > 0, refetchInterval: 5000 }
    });

    // Read total deposits from YieldVault for escrow balance
    const { data: totalDepositsData, refetch: refetchTotalDeposits } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'totalDeposits',
        query: { refetchInterval: 5000 }
    });

    // Read pending distributions from YieldVault
    const { data: pendingDistributionsData, refetch: refetchPendingDistributions } = useReadContract({
        address: CONTRACTS.YieldVault.address as `0x${string}`,
        abi: CONTRACTS.YieldVault.abi as Abi,
        functionName: 'getPendingDistributions',
        query: { refetchInterval: 5000 }
    });

    // Read attestation fee from AttestorRegistry
    const { data: attestationFeeData } = useReadContract({
        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
        abi: CONTRACTS.AttestorRegistry.abi as Abi,
        functionName: 'getAttestationFee',
    });

    // Read reward pool balance from AttestorRegistry
    const { data: rewardPoolBalanceData } = useReadContract({
        address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
        abi: CONTRACTS.AttestorRegistry.abi as Abi,
        functionName: 'getRewardPoolBalance',
        query: { refetchInterval: 5000 }
    });

    // Process claims data into disclosures (filter by user's address)
    useEffect(() => {
        if (claimsData && attestorListsData && claimStakesData && address) {
            console.log('Processing claims data:', { claimsData, address, totalClaims });

            const userDisclosures = claimsData
                .map((claimResult, index) => {
                    if (!claimResult.result) {
                        console.log(`No result for claim ${index}`);
                        return null;
                    }

                    const claim = claimResult.result as any[];
                    console.log(`Claim ${index}:`, claim);

                    // Ensure we have the expected array structure
                    if (!Array.isArray(claim) || claim.length < 7) {
                        console.log(`Invalid claim structure for claim ${index}:`, claim);
                        return null;
                    }

                    // Only include claims from current user (claim[5] is the issuer address)
                    if (!claim[5] || claim[5].toLowerCase() !== address.toLowerCase()) {
                        console.log(`Claim ${index} not from current user:`, claim[5], 'vs', address);
                        return null;
                    }

                    // Convert yield amount from wei to readable format
                    const yieldAmountWei = claim[3] ? BigInt(claim[3]) : BigInt(0);
                    const yieldAmountEther = parseFloat(formatEther(yieldAmountWei));

                    // Get real attestor count and stake data
                    const attestorList = attestorListsData[index]?.result as string[] || [];
                    const attestorCount = attestorList.length;
                    const requiredAttestors = 3;

                    // Determine status based on attestor count and verification state
                    let status = 'submitted';
                    if (claim[6] === 3) status = 'flagged'; // Flagged status (ClaimStatus.Challenged = 3)
                    else if (attestorCount >= requiredAttestors) {
                        // Has enough attestors - can be verified
                        status = 'verified';
                    } else if (attestorCount > 0) {
                        // Has some attestors but not enough yet
                        status = 'attesting';
                    }
                    const stakeAmount = claimStakesData[index]?.result ? formatEther(claimStakesData[index].result as bigint) : '0';

                    const disclosure = {
                        id: `disclosure-${claim[0]}`,
                        vaultName: selectedVault,
                        assetId: claim[1] || 'Unknown Asset',
                        period: claim[2] || 'Unknown Period',
                        yieldAmount: yieldAmountEther,
                        documentHash: claim[4] || '',
                        status: status as any,
                        currentStake: parseFloat(stakeAmount).toFixed(1),
                        attestorCount: attestorCount,
                        minAttestors: 3,
                        proofHash: claim[4] ? `${claim[4].slice(0, 16)}...` : 'N/A',
                        submittedAt: claim[7] ? new Date(Number(claim[7]) * 1000) : getCurrentDate()
                    };

                    console.log('Processed disclosure:', disclosure);
                    return disclosure;
                })
                .filter(Boolean) as Disclosure[];

            console.log('Final processed user disclosures:', userDisclosures);
            setDisclosures(userDisclosures);
        } else {
            console.log('No claims data or address:', { claimsData: !!claimsData, address });
            setDisclosures([]);
        }
    }, [claimsData, attestorListsData, claimStakesData, address, selectedVault]);

    // Refetch data when transaction is confirmed - handled by useTransaction hook now

    // Calculate dynamic metrics based on actual disclosures
    const vaultMetrics: VaultMetrics = {
        totalDisclosures: disclosures.length,
        auditSuccessRate: disclosures.length > 0
            ? Math.round((disclosures.filter(d => d.status === 'verified').length / disclosures.length) * 100)
            : 0,
        accuracyTier: disclosures.length === 0 ? 'NEW' :
            disclosures.length < 3 ? 'BUILDING' :
                disclosures.filter(d => d.status === 'verified').length / disclosures.length > 0.8 ? 'EXCELLENT' : 'GOOD',
        totalStaked: disclosures.reduce((sum, d) => sum + parseFloat(d.currentStake || '0'), 0).toFixed(1),
        avgVerificationTime: 'N/A', // Requires additional on-chain tracking
        reputationScore: Math.min(100, disclosures.length * 15 + disclosures.filter(d => d.status === 'verified').length * 10)
    };

    // Read total escrow balance from contract
    const totalEscrowBalance = totalDepositsData ? Number(formatEther(totalDepositsData as bigint)) : 0;

    // Read pending distributions from contract
    const pendingDistributions = pendingDistributionsData ? Number(formatEther(pendingDistributionsData as bigint)) : 0;

    // Calculate attestation fee and reward pool balance
    const attestationFee = attestationFeeData ? Number(formatEther(attestationFeeData as bigint)) : 0.9;
    const rewardPoolBalance = rewardPoolBalanceData ? Number(formatEther(rewardPoolBalanceData as bigint)) : 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: 'startDate' | 'endDate', date: string) => {
        setFormData(prev => ({ ...prev, [name]: date }));

        // Real-time date validation with string dates
        const newFormData = { ...formData, [name]: date };
        validateDates(newFormData.startDate, newFormData.endDate);
    };

    const validateDates = (startDateStr: string, endDateStr: string) => {
        setDateValidationError(null);

        if (!startDateStr || !endDateStr) {
            return; // Don't validate until both dates are selected
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (!isValid(startDate) || !isValid(endDate)) {
            setDateValidationError("Please select valid dates.");
            return;
        }

        const now = new Date();
        // Set all dates to midnight for proper comparison (ignore time)
        const startDateMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (isAfter(endDateMidnight, todayMidnight)) {
            setDateValidationError(`End date cannot be in the future. Please select a date up to today (${todayMidnight.toLocaleDateString()}).`);
            return;
        }

        if (!isBefore(startDateMidnight, endDateMidnight)) {
            setDateValidationError("Start date must be before the end date.");
            return;
        }

        // If we get here, dates are valid
        setDateValidationError(null);
    };

    const handleEscrowInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEscrowData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            const data = new FormData();
            data.set("file", file);

            const uploadRequest = await fetch("/api/ipfs/upload", {
                method: "POST",
                body: data,
            });

            const response = await uploadRequest.json();

            if (response.success && response.cid) {
                setUploadedCid(response.cid);
                setFormData(prev => ({ ...prev, documentHash: `ipfs://${response.cid}` }));
            } else {
                console.error("Upload failed:", response.error);
                // For development, fall back to a mock CID if Pinata fails
                if (response.error?.includes("Pinata")) {
                    console.log("Using mock upload for development");
                    const mockCid = `mock_${Date.now()}_dev_upload`;
                    setUploadedCid(mockCid);
                    setFormData(prev => ({ ...prev, documentHash: `ipfs://${mockCid}` }));
                } else {
                    throw new Error(response.error || "Upload failed");
                }
            }
        } catch (e: any) {
            console.error("Upload error:", e);
            // Fallback to mock upload for development
            console.log("Using mock upload due to error");
            const mockCid = `mock_${Date.now()}_fallback`;
            setUploadedCid(mockCid);
            setFormData(prev => ({ ...prev, documentHash: `ipfs://${mockCid}` }));
        } finally {
            setIsUploading(false);
        }
    };

    const formatPeriod = (startDateStr: string, endDateStr: string): string => {
        if (!startDateStr || !endDateStr) return '';

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const fullOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const monthYearOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };

        if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
            return startDate.toLocaleDateString('en-US', monthYearOptions);
        } else {
            return `${startDate.toLocaleDateString('en-US', fullOptions)} – ${endDate.toLocaleDateString('en-US', fullOptions)}`;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) return;

        // Validation
        if (!formData.startDate || !formData.endDate) return;
        if (dateValidationError) return;

        // Double-check validation (should be caught by real-time validation)
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = new Date(formData.endDate);
        const startDate = new Date(formData.startDate);
        const endDateMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const startDateMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

        if (endDateMidnight > todayMidnight || !isBefore(startDateMidnight, endDateMidnight)) return;
        if (!formData.assetId || !formData.yieldAmount || !formData.documentHash) return;

        const yieldAmount = parseFloat(formData.yieldAmount);
        if (isNaN(yieldAmount) || yieldAmount <= 0) return;

        const period = formatPeriod(formData.startDate, formData.endDate);

        // Submit claim with attestation fee included in single transaction
        executeTransaction({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'submitClaim',
            args: [
                formData.assetId,
                period,
                BigInt(Math.floor(parseFloat(formData.yieldAmount) * 1e18)), // Convert to wei
                formData.documentHash
            ],
            value: parseEther(attestationFee.toString()) // Include attestation fee in the transaction
        });
    };

    const handleEscrowFunding = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !escrowData.amount || parseFloat(escrowData.amount) <= 0) return;

        const transactionConfig: any = {
            address: CONTRACTS.YieldVault.address as `0x${string}`,
            abi: CONTRACTS.YieldVault.abi as Abi,
            functionName: 'deposit',
            value: parseEther(escrowData.amount)
        };

        executeTransaction(transactionConfig);
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

    return (
        <div className="min-h-screen bg-background page-transition">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <AnimatedSection className="mb-12">
                    <div className="text-center space-y-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-full" pulse>
                                <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
                                Live Dashboard
                            </Badge>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                                Issuer Dashboard
                            </h1>
                            <p className="text-xl max-w-3xl mx-auto leading-relaxed font-light">
                                Submit transparent yield disclosures and build institutional trust through cryptographic verification.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto">
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{vaultMetrics.totalDisclosures}</div>
                                <div className="text-sm">Total Disclosures</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{vaultMetrics.auditSuccessRate}%</div>
                                <div className="text-sm">Success Rate</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{vaultMetrics.accuracyTier}</div>
                                <div className="text-sm">Reputation</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-card/70 border border-primary/20">
                                <div className="text-2xl font-bold font-display">{vaultMetrics.reputationScore}</div>
                                <div className="text-sm">Score</div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Disclose Performance Form */}
                    <AnimatedSection delay={0.4} className="lg:col-span-2">
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                                        <PlusCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>New Disclosure</CardTitle>
                                        <CardDescription>
                                            Submit yield proof for verification
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <CustomSelect
                                        label="Select Vault"
                                        value={selectedVault}
                                        onChange={(value) => setSelectedVault(value)}
                                        helperText="Choose the vault for this yield disclosure"
                                        options={[
                                            { value: 'YieldProof Demo Vault', label: 'YieldProof Demo Vault' }
                                        ]}
                                    />

                                    <Input
                                        label="Asset Sub-ID / Label"
                                        placeholder="e.g. MANTLE-MNT-LP-V3"
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleInputChange}
                                        helperText="Unique identifier for the asset generating yield"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <DatePicker
                                            label="Start Date"
                                            value={formData.startDate}
                                            onChange={(date) => handleDateChange('startDate', date)}
                                            maxDate={formData.endDate || new Date().toISOString().split('T')[0]}
                                            helperText="Beginning of yield period"
                                        />
                                        <DatePicker
                                            label="End Date"
                                            value={formData.endDate}
                                            onChange={(date) => handleDateChange('endDate', date)}
                                            minDate={formData.startDate}
                                            maxDate={new Date().toISOString().split('T')[0]}
                                            helperText="Must be today or earlier"
                                        />
                                    </div>

                                    {/* Date validation feedback */}
                                    {dateValidationError && (
                                        <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-destructive-foreground">{dateValidationError}</p>
                                        </div>
                                    )}

                                    {/* Success feedback when dates are valid */}
                                    {formData.startDate && formData.endDate && !dateValidationError && (
                                        <div className="flex items-start gap-2 p-4 bg-accent/20 border border-accent/30 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-medium">Valid date range selected</p>
                                                <p className="mt-1">Period: {formatPeriod(formData.startDate, formData.endDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Input
                                        label="Yield Amount (MNT)"
                                        placeholder="0.00"
                                        name="yieldAmount"
                                        value={formData.yieldAmount}
                                        onChange={handleInputChange}
                                        helperText="Total yield generated during the specified period"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Yield Proof Document
                                        </label>

                                        {!uploadedCid ? (
                                            <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors group">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleFileUpload}
                                                    accept=".pdf,.csv,.xls,.xlsx,.jpg,.png"
                                                    disabled={isUploading}
                                                />
                                                {isUploading ? (
                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                                ) : (
                                                    <Upload className="w-8 h-8 mx-auto mb-2 group-hover:opacity-80 transition-colors" />
                                                )}
                                                <p className="font-medium">
                                                    {isUploading ? "Uploading to IPFS..." : "Click to Upload Proof"}
                                                </p>
                                                <p className="text-sm mt-1">PDF, CSV, Excel, Images</p>
                                            </div>
                                        ) : (
                                            <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Document uploaded</p>
                                                        <p className="text-sm">IPFS: {uploadedCid?.slice(0, 20)}...</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setUploadedCid(null);
                                                        setFormData(prev => ({ ...prev, documentHash: '' }));
                                                    }}
                                                    className="hover:bg-muted"
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        isLoading={isTransactionLoading || isUploading}
                                        disabled={!isConnected || !!dateValidationError}
                                    >
                                        {!isTransactionLoading ? (
                                            <>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Submit Disclosure + Pay Fee ({attestationFee.toFixed(1)} MNT)
                                            </>
                                        ) : null}
                                    </Button>

                                    <div className="flex items-start gap-2 mt-4 p-3 bg-info/20 border border-info/30 rounded-lg">
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs">
                                            <p className="font-semibold">Single Transaction:</p>
                                            <p className="mt-1">Submits your disclosure and pays the {attestationFee.toFixed(1)} MNT attestation fee in one transaction. This fee funds rewards for the 3 attestors who will verify your claim.</p>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </AnimatedSection>

                    {/* Right Column - Disclosure History */}
                    <AnimatedSection delay={0.5} className="lg:col-span-1">
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Disclosure History</CardTitle>
                                        <CardDescription>
                                            Track verification status of your submissions
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        refetchTotalClaims();
                                        refetchClaims();
                                        refetchAttestorLists();
                                        refetchClaimStakes();
                                    }}
                                    className="hover:bg-muted"
                                >
                                    <Activity className="w-4 h-4 mr-1" />
                                    Refresh
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {disclosures.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">No disclosures yet</h3>
                                        <p className="text-sm max-w-sm mx-auto">
                                            Submit your first yield disclosure to start building your reputation on-chain.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {disclosures.map((disclosure) => (
                                            <div key={disclosure.id} className="bg-card/30 rounded-2xl p-4 border border-primary/20 hover:border-primary/40 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium">{disclosure.assetId}</h4>
                                                        <p className="text-sm">{disclosure.period}</p>
                                                    </div>
                                                    <Badge variant={getStatusColor(disclosure.status) as any}>
                                                        {getStatusLabel(disclosure.status)}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs">Yield Amount</p>
                                                        <p className="text-sm font-mono">
                                                            {disclosure.yieldAmount.toLocaleString(undefined, {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 6
                                                            })} MNT
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs">Submitted</p>
                                                        <p className="text-sm">{disclosure.submittedAt.toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                {(disclosure.status === 'submitted' || disclosure.status === 'attesting') && (
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span>Attestation Progress</span>
                                                            <span>{disclosure.attestorCount} / {disclosure.minAttestors} attestors</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${(disclosure.attestorCount / disclosure.minAttestors) * 100}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs mt-1">
                                                            Total Stake: {disclosure.currentStake} MNT
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        <span className="text-xs font-mono">
                                                            {disclosure.proofHash.slice(0, 10)}...
                                                        </span>
                                                    </div>
                                                    {disclosure.documentHash && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:opacity-80 p-1"
                                                            onClick={() => window.open(
                                                                disclosure.documentHash.startsWith('ipfs://')
                                                                    ? `https://gateway.pinata.cloud/ipfs/${disclosure.documentHash.replace('ipfs://', '')}`
                                                                    : '#',
                                                                '_blank'
                                                            )}
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </AnimatedSection>
                </div>

                {/* Attestation Fee & Enforce Distribution Section */}
                <AnimatedSection delay={0.6} className="mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Attestation Fee Information */}
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Attestor Reward Pool</CardTitle>
                                        <CardDescription>
                                            Fees from claim submissions fund attestor rewards.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                                    <div className="text-sm mb-1">Attestation Fee per Claim</div>
                                    <div className="text-lg font-semibold">
                                        {attestationFee.toFixed(1)} MNT
                                    </div>
                                    <div className="text-xs mt-1">Automatically paid when submitting claims</div>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                                    <div className="text-sm mb-1">Current Reward Pool</div>
                                    <div className="text-lg font-semibold">
                                        {rewardPoolBalance.toFixed(2)} MNT
                                    </div>
                                    <div className="text-xs mt-1">Available for attestor rewards</div>
                                </div>

                                <div className="text-xs p-3 bg-info/20 border border-info/30 rounded-lg">
                                    <p className="font-medium">How it works:</p>
                                    <p className="mt-1">Each claim submission includes a {attestationFee.toFixed(1)} MNT fee that funds rewards for the 3 attestors who verify your claim (0.3 MNT each).</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Middle Column - Enforce Distribution Form */}
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                        <Scale className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Enforce Distribution</CardTitle>
                                        <CardDescription>
                                            Deposit realized yield into escrow for verified claimants.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEscrowFunding} className="space-y-6">
                                    <div>
                                        <label className="form-label">Vault Escrow</label>
                                        <select
                                            value={escrowData.vaultName}
                                            onChange={(e) => setEscrowData(prev => ({ ...prev, vaultName: e.target.value }))}
                                            className="form-input w-full appearance-none cursor-pointer custom-select"
                                        >
                                            <option>YieldProof Demo Vault (0 Pool)</option>
                                        </select>
                                        <p className="text-sm mt-1">Select the vault to fund with realized yield</p>
                                    </div>

                                    <Input
                                        label="Amount to Fund (MNT)"
                                        placeholder="0.00"
                                        name="amount"
                                        value={escrowData.amount}
                                        onChange={handleEscrowInputChange}
                                        helperText="Amount of realized yield to deposit into escrow"
                                    />

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        isLoading={isTransactionLoading}
                                        disabled={!isConnected}
                                    >
                                        {!isTransactionLoading ? (
                                            <>
                                                <Scale className="mr-2 h-4 w-4" />
                                                Enforce Escrow Funding
                                            </>
                                        ) : null}
                                    </Button>

                                    <div className="flex items-start gap-2 mt-4 p-3 bg-card/50 rounded-lg border border-border">
                                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs">
                                            <span className="font-semibold">Funds are held in the vault contract and only released to verified claimants.</span>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Right Column - Escrow Status & Balance */}
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Escrow Balance</CardTitle>
                                        <CardDescription>
                                            Current funds available for distribution
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Balance Overview */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-card/30 rounded-lg p-4 border border-border/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Coins className="w-4 h-4" />
                                                <span className="text-sm">Available Balance</span>
                                            </div>
                                            <div className="text-xl font-medium">{totalEscrowBalance.toLocaleString()} MNT</div>
                                        </div>

                                        <div className="bg-card/30 rounded-lg p-4 border border-border/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">Pending Distribution</span>
                                            </div>
                                            <div className="text-xl font-medium">{pendingDistributions.toLocaleString()} MNT</div>
                                        </div>
                                    </div>

                                    {/* Recent Escrow Transactions */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-3">Recent Escrow Transactions</h4>
                                        {escrowFundings.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Coins className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm">No escrow transactions yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {escrowFundings.slice(0, 3).map((funding) => (
                                                    <div key={funding.id} className="bg-card/30 rounded-lg p-3 border border-border/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${funding.status === 'confirmed' ? 'bg-success' :
                                                                    funding.status === 'pending' ? 'bg-warning' : 'bg-info'
                                                                    }`} />
                                                                <span className="text-sm font-medium">
                                                                    {funding.amount.toLocaleString()} MNT
                                                                </span>
                                                            </div>
                                                            <Badge variant={
                                                                funding.status === 'confirmed' ? 'success' :
                                                                    funding.status === 'pending' ? 'warning' : 'info'
                                                            }>
                                                                {funding.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span>{funding.fundedAt.toLocaleDateString()}</span>
                                                            {funding.txHash && (
                                                                <span className="font-mono">{funding.txHash.slice(0, 10)}...</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
}