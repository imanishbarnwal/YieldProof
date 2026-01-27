"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AnimatedSection, StaggeredContainer } from '@/components/ui/AnimatedSection';
import { Select } from '@/components/ui/Select';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, parseEther, type Abi } from 'viem';
import { CONTRACTS } from '@/app/config/contracts';
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
        startDate: '',
        endDate: '',
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

    // Contract Write Hook
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

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

                    let status = 'submitted';
                    if (claim[6] === 1) status = 'attesting';
                    else if (claim[6] === 2) status = 'verified';
                    else if (claim[6] === 3) status = 'flagged';

                    // Convert yield amount from wei to readable format
                    const yieldAmountWei = claim[3] ? BigInt(claim[3]) : BigInt(0);
                    const yieldAmountEther = parseFloat(formatEther(yieldAmountWei));

                    console.log('Yield amount conversion:', {
                        raw: claim[3],
                        wei: yieldAmountWei.toString(),
                        ether: yieldAmountEther
                    });

                    // Get real attestor count and stake data
                    const attestorList = attestorListsData[index]?.result as string[] || [];
                    const attestorCount = attestorList.length;
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
                        proofHash: `0x${claim[4]?.slice(2, 42) || 'generated_hash_placeholder'}`,
                        submittedAt: getCurrentDate() // Would need to track this separately
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

    // Refetch data when transaction is confirmed
    useEffect(() => {
        if (isConfirmed) {
            refetchTotalClaims();
            refetchClaims();
            refetchAttestorLists();
            refetchClaimStakes();
        }
    }, [isConfirmed, refetchTotalClaims, refetchClaims, refetchAttestorLists, refetchClaimStakes]);

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
        avgVerificationTime: '2.4 days',
        reputationScore: Math.min(100, disclosures.length * 15 + disclosures.filter(d => d.status === 'verified').length * 10)
    };

    // Calculate total escrow balance
    const totalEscrowBalance = escrowFundings
        .filter(f => f.status === 'confirmed')
        .reduce((sum, f) => sum + f.amount, 0);

    // Calculate pending distributions (verified disclosures that haven't been distributed)
    const pendingDistributions = disclosures
        .filter(d => d.status === 'verified')
        .reduce((sum, d) => sum + d.yieldAmount, 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time date validation
        if (name === 'startDate' || name === 'endDate') {
            const newFormData = { ...formData, [name]: value };
            validateDates(newFormData.startDate, newFormData.endDate);
        }
    };

    const validateDates = (startDateStr: string, endDateStr: string) => {
        setDateValidationError(null);

        if (!startDateStr || !endDateStr) {
            return; // Don't validate until both dates are selected
        }

        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        const now = getCurrentDate();

        // Set all dates to midnight for proper comparison (ignore time)
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (endDate > todayDate) {
            setDateValidationError(`End date cannot be in the future. Please select a date up to today (${todayDate.toLocaleDateString()}).`);
            return;
        }

        if (startDate >= endDate) {
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

    const formatPeriod = (startDate: string, endDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const fullOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const monthYearOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };

        if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            return start.toLocaleDateString('en-US', monthYearOptions);
        } else {
            return `${start.toLocaleDateString('en-US', fullOptions)} – ${end.toLocaleDateString('en-US', fullOptions)}`;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        // Validation
        if (!formData.startDate || !formData.endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        // Check if there are any date validation errors
        if (dateValidationError) {
            alert(dateValidationError);
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const now = getCurrentDate();

        // Set all dates to midnight for proper comparison (ignore time)
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Debug logging to help troubleshoot
        console.log('Date validation:', {
            startInput: formData.startDate,
            endInput: formData.endDate,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            todayDate: todayDate.toISOString().split('T')[0],
            endDateAfterToday: endDate > todayDate,
            startAfterEnd: startDate >= endDate
        });

        // Double-check validation (should be caught by real-time validation)
        if (endDate > todayDate) {
            alert(`End date cannot be in the future. Please select a date up to today (${todayDate.toLocaleDateString()}).`);
            return;
        }

        if (startDate >= endDate) {
            alert("Start date must be before the end date. Please check your date selection.");
            return;
        }

        if (!formData.assetId || !formData.yieldAmount || !formData.documentHash) {
            alert("Please fill in all required fields including asset ID, yield amount, and upload a document.");
            return;
        }

        const yieldAmount = parseFloat(formData.yieldAmount);
        if (isNaN(yieldAmount) || yieldAmount <= 0) {
            alert("Please enter a valid yield amount greater than 0.");
            return;
        }

        try {
            const period = formatPeriod(formData.startDate, formData.endDate);

            writeContract({
                address: CONTRACTS.YieldProof.address as `0x${string}`,
                abi: CONTRACTS.YieldProof.abi as Abi,
                functionName: 'submitClaim',
                args: [
                    formData.assetId,
                    period,
                    BigInt(Math.floor(parseFloat(formData.yieldAmount) * 1e18)), // Convert to wei
                    formData.documentHash
                ]
            });

            // Reset form
            setFormData({
                assetId: '',
                startDate: '',
                endDate: '',
                yieldAmount: '',
                documentHash: ''
            });
            setUploadedCid(null);
            setDateValidationError(null);

        } catch (error) {
            console.error("Submission failed", error);
            alert("Submission failed. Please try again.");
        }
    };

    const handleEscrowFunding = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        if (!escrowData.amount || parseFloat(escrowData.amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            writeContract({
                address: CONTRACTS.YieldVault.address as `0x${string}`,
                abi: CONTRACTS.YieldVault.abi as Abi,
                functionName: 'deposit',
                value: parseEther(escrowData.amount)
            });

            // Reset form
            setEscrowData(prev => ({ ...prev, amount: '' }));

        } catch (error) {
            console.error("Escrow funding failed", error);
            alert("Escrow funding failed. Please try again.");
        }
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
        <div className="min-h-screen bg-[#1A1A2E] text-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <AnimatedSection className="mb-12">
                    <div className="text-center space-y-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-full" pulse>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                                Live Dashboard
                            </Badge>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
                                Issuer Dashboard
                            </h1>
                            <p className="text-xl text-[#F8F9FA]/60 max-w-3xl mx-auto leading-relaxed font-light">
                                Submit transparent yield disclosures and build institutional trust through cryptographic verification.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto">
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-[#1A1A2E]/60 border border-[#FF6B35]/20">
                                <div className="text-2xl font-bold text-white font-display">{vaultMetrics.totalDisclosures}</div>
                                <div className="text-sm text-[#F8F9FA]/60">Total Disclosures</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-[#1A1A2E]/60 border border-[#FF6B35]/20">
                                <div className="text-2xl font-bold text-white font-display">{vaultMetrics.auditSuccessRate}%</div>
                                <div className="text-sm text-[#F8F9FA]/60">Success Rate</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-[#1A1A2E]/60 border border-[#FF6B35]/20">
                                <div className="text-2xl font-bold text-white font-display">{vaultMetrics.accuracyTier}</div>
                                <div className="text-sm text-[#F8F9FA]/60">Reputation</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-3xl bg-[#1A1A2E]/60 border border-[#FF6B35]/20">
                                <div className="text-2xl font-bold text-white font-display">{vaultMetrics.reputationScore}</div>
                                <div className="text-sm text-[#F8F9FA]/60">Score</div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Disclose Performance Form */}
                    <AnimatedSection delay={0.4}>
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] rounded-lg flex items-center justify-center shadow-lg">
                                        <PlusCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white">New Disclosure</CardTitle>
                                        <CardDescription className="text-[#F8F9FA]/60">
                                            Submit yield proof for verification
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <Select
                                        label="Select Vault"
                                        value={selectedVault}
                                        onChange={(e) => setSelectedVault(e.target.value)}
                                        helperText="Choose the vault for this yield disclosure"
                                    >
                                        <option>YieldProof Demo Vault</option>
                                    </Select>

                                    <Input
                                        label="Asset Sub-ID / Label"
                                        placeholder="e.g. MANTLE-MNT-LP-V3"
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleInputChange}
                                        helperText="Unique identifier for the asset generating yield"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Start Date"
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            max={formData.endDate || currentDate}
                                            helperText="Beginning of yield period"
                                        />
                                        <Input
                                            label="End Date"
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            min={formData.startDate}
                                            max={currentDate}
                                            helperText="Must be today or earlier"
                                        />
                                    </div>

                                    {/* Date validation feedback */}
                                    {dateValidationError && (
                                        <div className="flex items-start gap-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-red-300">{dateValidationError}</p>
                                        </div>
                                    )}

                                    {/* Success feedback when dates are valid */}
                                    {formData.startDate && formData.endDate && !dateValidationError && (
                                        <div className="flex items-start gap-2 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-emerald-300">
                                                <p className="font-medium">Valid date range selected</p>
                                                <p className="text-emerald-400/80 mt-1">Period: {formatPeriod(formData.startDate, formData.endDate)}</p>
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
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
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
                                                    <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin mx-auto mb-2" />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-[#F8F9FA]/60 mx-auto mb-2 group-hover:text-[#FF6B35] transition-colors" />
                                                )}
                                                <p className="text-[#F8F9FA]/80 font-medium">
                                                    {isUploading ? "Uploading to IPFS..." : "Click to Upload Proof"}
                                                </p>
                                                <p className="text-[#F8F9FA]/50 text-sm mt-1">PDF, CSV, Excel, Images</p>
                                            </div>
                                        ) : (
                                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-green-300 font-medium">Document uploaded</p>
                                                        <p className="text-green-400/70 text-sm">IPFS: {uploadedCid?.slice(0, 20)}...</p>
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
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#FF6B35] hover:bg-[#E85A2A] text-white font-medium rounded-full"
                                        disabled={isWritePending || isConfirming || isUploading || !isConnected || !!dateValidationError}
                                    >
                                        {isWritePending || isConfirming ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {isWritePending ? 'Confirming...' : 'Submitting to Blockchain...'}
                                            </>
                                        ) : (
                                            <>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Submit Disclosure
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-start gap-2 mt-4 p-3 bg-[#1A1A2E]/50 rounded-2xl border border-[#FF6B35]/20">
                                        <Info className="w-4 h-4 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-[#F8F9FA]/60">
                                            <span className="font-semibold text-[#F8F9FA]/80">MVP:</span> Proofs are public.
                                            <br />
                                            <span className="text-[#F8F9FA]/50">Encrypted proofs & ZK verification coming in V2.</span>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </AnimatedSection>

                    {/* Right Column - Disclosure History */}
                    <AnimatedSection delay={0.5}>
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#004E89]/20 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-[#004E89]" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-white">Disclosure History</CardTitle>
                                            <CardDescription className="text-[#F8F9FA]/60">
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
                                        className="text-[#F8F9FA]/60 hover:text-white"
                                    >
                                        <Activity className="w-4 h-4 mr-1" />
                                        Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {disclosures.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-[#1A1A2E]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-[#F8F9FA]/40" />
                                        </div>
                                        <h3 className="text-lg font-medium text-[#F8F9FA]/80 mb-2">No disclosures yet</h3>
                                        <p className="text-[#F8F9FA]/50 text-sm max-w-sm mx-auto">
                                            Submit your first yield disclosure to start building your reputation on-chain.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {disclosures.map((disclosure) => (
                                            <div key={disclosure.id} className="bg-[#1A1A2E]/30 rounded-2xl p-4 border border-[#FF6B35]/20 hover:border-[#FF6B35]/40 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium text-white">{disclosure.assetId}</h4>
                                                        <p className="text-sm text-[#F8F9FA]/60">{disclosure.period}</p>
                                                    </div>
                                                    <Badge variant={getStatusColor(disclosure.status) as any}>
                                                        {getStatusLabel(disclosure.status)}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-[#F8F9FA]/50">Yield Amount</p>
                                                        <p className="text-sm font-mono text-emerald-400">
                                                            {disclosure.yieldAmount.toLocaleString(undefined, {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 6
                                                            })} MNT
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#F8F9FA]/50">Submitted</p>
                                                        <p className="text-sm text-[#F8F9FA]/80">{disclosure.submittedAt.toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                {(disclosure.status === 'submitted' || disclosure.status === 'attesting') && (
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Attestation Progress</span>
                                                            <span>{disclosure.attestorCount} / {disclosure.minAttestors} attestors</span>
                                                        </div>
                                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${(disclosure.attestorCount / disclosure.minAttestors) * 100}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Total Stake: {disclosure.currentStake} MNT
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs text-slate-500 font-mono">
                                                            {disclosure.proofHash.slice(0, 10)}...
                                                        </span>
                                                    </div>
                                                    {disclosure.documentHash && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-400 hover:text-blue-300 p-1"
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

                {/* Enforce Distribution Section */}
                <AnimatedSection delay={0.6} className="mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Enforce Distribution Form */}
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                        <Scale className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white">Enforce Distribution</CardTitle>
                                        <CardDescription className="text-slate-400">
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
                                            className="form-input w-full appearance-none cursor-pointer"
                                        >
                                            <option>YieldProof Demo Vault (0 Pool)</option>
                                        </select>
                                        <p className="text-slate-400 text-sm mt-1">Select the vault to fund with realized yield</p>
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
                                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium"
                                        disabled={isWritePending || isConfirming || !isConnected}
                                    >
                                        {isWritePending || isConfirming ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {isWritePending ? 'Confirming...' : 'Processing Transaction...'}
                                            </>
                                        ) : (
                                            <>
                                                <Scale className="mr-2 h-4 w-4" />
                                                Enforce Escrow Funding
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-start gap-2 mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-slate-400">
                                            <span className="font-semibold text-slate-300">Funds are held in the vault contract and only released to verified claimants.</span>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Right Column - Escrow Status & Balance */}
                        <Card className="backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white">Escrow Balance</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Current funds available for distribution
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Balance Overview */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Coins className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-400">Available Balance</span>
                                            </div>
                                            <div className="text-xl font-medium text-white">{totalEscrowBalance.toLocaleString()} MNT</div>
                                        </div>

                                        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-400">Pending Distribution</span>
                                            </div>
                                            <div className="text-xl font-medium text-white">{pendingDistributions.toLocaleString()} MNT</div>
                                        </div>
                                    </div>

                                    {/* Recent Escrow Transactions */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Escrow Transactions</h4>
                                        {escrowFundings.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Coins className="w-6 h-6 text-slate-500" />
                                                </div>
                                                <p className="text-slate-500 text-sm">No escrow transactions yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {escrowFundings.slice(0, 3).map((funding) => (
                                                    <div key={funding.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${funding.status === 'confirmed' ? 'bg-slate-400' :
                                                                    funding.status === 'pending' ? 'bg-slate-500' : 'bg-slate-400'
                                                                    }`} />
                                                                <span className="text-sm font-medium text-white">
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
                                                        <div className="flex items-center justify-between text-xs text-slate-400">
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