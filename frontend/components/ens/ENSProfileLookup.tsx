"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
    Search,
    Globe,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Award,
    Clock,
    User,
    ExternalLink,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/app/config/contracts";
import { formatEther, type Abi } from "viem";
import { safeNormalizeENS } from "@/lib/ens/ensService";

interface ENSProfileLookupProps {
    initialQuery?: string;
    onClose?: () => void;
}

export function ENSProfileLookup({ initialQuery = "", onClose }: ENSProfileLookupProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery || "attestor-1.yieldproof.eth");
    const [activeQuery, setActiveQuery] = useState(initialQuery || "attestor-1.yieldproof.eth");

    // Query on-chain profile from YieldProofENSManager
    const normalizedName = safeNormalizeENS(activeQuery);

    const { data: profileData, isLoading, error } = useReadContract({
        address: CONTRACTS.YieldProofENSManager.address as `0x${string}`,
        abi: CONTRACTS.YieldProofENSManager.abi as Abi,
        functionName: "getAttestorProfile",
        args: [normalizedName],
        query: { enabled: !!normalizedName && normalizedName.length > 0 }
    });

    const hasResult = profileData && (profileData as any)[0] !== "0x0000000000000000000000000000000000000000";
    const attestorAddress = hasResult ? (profileData as any)[0] : null;
    const fullSubname = hasResult ? (profileData as any)[1] : "";
    const isRegistered = hasResult ? (profileData as any)[2] : false;
    const isWorldIdVerified = hasResult ? (profileData as any)[3] : false;
    const trustScore = hasResult ? Number((profileData as any)[4]) : 0;
    const successfulAttestations = hasResult ? Number((profileData as any)[5]) : 0;
    const totalAttestations = hasResult ? Number((profileData as any)[6]) : 0;
    const stakeAmount = hasResult ? formatEther((profileData as any)[7]) : "0";
    const totalRewardsClaimed = hasResult ? formatEther((profileData as any)[8]) : "0";

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setActiveQuery(searchQuery.trim());
        }
    };

    return (
        <Card className="backdrop-blur-xl border border-sky-500/20 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 via-primary/5 to-transparent pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">ENSv2 Reputation Lookup</CardTitle>
                            <CardDescription className="text-xs">Verify public portable credentials of any YieldProof Attestor</CardDescription>
                        </div>
                    </div>
                    {onClose && (
                        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                            Close
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search ENS subname (e.g. attestor-1.yieldproof.eth)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-mono text-sm"
                    />
                    <Button type="submit" variant="primary" className="bg-sky-600 hover:bg-sky-500 text-white">
                        <Search className="w-4 h-4 mr-1.5" />
                        Lookup
                    </Button>
                </form>

                {/* Profile Result Display */}
                {isLoading ? (
                    <div className="p-8 text-center space-y-3">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-sky-400" />
                        <p className="text-xs text-muted-foreground">Resolving ENS records on-chain...</p>
                    </div>
                ) : hasResult ? (
                    <div className="space-y-4 p-5 rounded-2xl bg-card/70 border border-sky-500/20 shadow-inner">
                        {/* Header with Subname & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                            <div>
                                <h4 className="text-xl font-bold font-mono text-sky-300">
                                    {fullSubname || activeQuery}
                                </h4>
                                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                                    Resolved to: <span className="text-foreground">{attestorAddress}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {isWorldIdVerified ? (
                                    <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        World ID Verified (Human)
                                    </Badge>
                                ) : (
                                    <Badge variant="warning" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                        Unverified
                                    </Badge>
                                )}
                                {isRegistered && (
                                    <Badge variant="default" className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                                        Active Attestor
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Metric Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Trust Score</span>
                                <div className="text-xl font-bold font-mono text-primary">{trustScore}/100</div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Claims Verified</span>
                                <div className="text-xl font-bold font-mono text-foreground">{successfulAttestations}</div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Staked Capital</span>
                                <div className="text-xl font-bold font-mono text-emerald-400">{parseFloat(stakeAmount).toFixed(2)} MNT</div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Total Claimed</span>
                                <div className="text-xl font-bold font-mono text-foreground">{parseFloat(totalRewardsClaimed).toFixed(2)} MNT</div>
                            </div>
                        </div>

                        {/* ENSv2 Raw Text Records Preview */}
                        <div className="pt-3 space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Dynamic ENSv2 Text Records:
                            </span>
                            <div className="p-3 rounded-xl bg-muted/30 font-mono text-xs space-y-1 text-muted-foreground border border-border">
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/status</span>
                                    <span className="text-foreground">{isRegistered ? "Active" : "Inactive"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/world-verified</span>
                                    <span className="text-foreground">{isWorldIdVerified ? "true" : "false"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/trust-score</span>
                                    <span className="text-foreground">{trustScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/claims-verified</span>
                                    <span className="text-foreground">{successfulAttestations}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center space-y-2 rounded-xl bg-muted/20 border border-border">
                        <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">No ENS Subname Record Found</p>
                        <p className="text-xs text-muted-foreground">
                            The name <code className="font-mono text-sky-300">{activeQuery}</code> has not been issued to any registered attestor yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
