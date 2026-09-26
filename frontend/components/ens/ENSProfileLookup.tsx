"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    AlertCircle,
    Copy,
    Check
} from "lucide-react";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/app/config/contracts";
import { formatEther, isAddress, namehash } from "viem";

interface ENSProfileLookupProps {
    initialQuery?: string;
    onClose?: () => void;
}

interface ProfileState {
    address: string | null;
    subname: string;
    isRegistered: boolean;
    isWorldIdVerified: boolean;
    trustScore: number;
    successfulAttestations: number;
    totalAttestations: number;
    stakeAmount: string;
    totalRewardsClaimed: string;
}

export function ENSProfileLookup({ initialQuery = "", onClose }: ENSProfileLookupProps) {
    const defaultQuery = initialQuery || "attestor-1.yieldproof.eth";
    const [searchQuery, setSearchQuery] = useState(defaultQuery);
    const [activeQuery, setActiveQuery] = useState(defaultQuery);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [profile, setProfile] = useState<ProfileState | null>(null);

    const publicClient = usePublicClient();

    const resolveProfile = useCallback(async (queryStr: string) => {
        if (!publicClient || !queryStr.trim()) return;

        setIsLoading(true);
        const query = queryStr.trim().toLowerCase();

        try {
            let resolvedAddress: string | null = null;
            let fullSubname = "";

            const ensManagerAddress = CONTRACTS.YieldProofENSManager.address as `0x${string}`;
            const registryAddress = CONTRACTS.AttestorRegistry.address as `0x${string}`;

            if (isAddress(query)) {
                resolvedAddress = query;
                try {
                    const sub = await publicClient.readContract({
                        address: ensManagerAddress,
                        abi: [{ type: "function", name: "attestorToSubname", inputs: [{ type: "address" }], outputs: [{ type: "string" }], stateMutability: "view" }],
                        functionName: "attestorToSubname",
                        args: [resolvedAddress as `0x${string}`]
                    }) as string;
                    if (sub) fullSubname = sub;
                } catch {
                    // Ignore error
                }
            } else {
                // Try resolving via ENS namehash (full subname e.g. "attestor-1.yieldproof.eth")
                const fullNameToHash = query.includes(".") ? query : `${query}.yieldproof.eth`;
                try {
                    const node = namehash(fullNameToHash);
                    const addr = await publicClient.readContract({
                        address: ensManagerAddress,
                        abi: [{ type: "function", name: "nodeToAttestor", inputs: [{ type: "bytes32" }], outputs: [{ type: "address" }], stateMutability: "view" }],
                        functionName: "nodeToAttestor",
                        args: [node]
                    }) as string;

                    if (addr && addr !== "0x0000000000000000000000000000000000000000") {
                        resolvedAddress = addr;
                        fullSubname = fullNameToHash;
                    }
                } catch {
                    // Fallback to label
                }

                // Fallback: Try resolving via label (e.g. "attestor-1")
                if (!resolvedAddress || resolvedAddress === "0x0000000000000000000000000000000000000000") {
                    const label = query.split(".")[0];
                    try {
                        const addr = await publicClient.readContract({
                            address: ensManagerAddress,
                            abi: [{ type: "function", name: "labelToAttestor", inputs: [{ type: "string" }], outputs: [{ type: "address" }], stateMutability: "view" }],
                            functionName: "labelToAttestor",
                            args: [label]
                        }) as string;

                        if (addr && addr !== "0x0000000000000000000000000000000000000000") {
                            resolvedAddress = addr;
                        }
                    } catch {
                        // Ignore error
                    }
                }

                // Fetch official stored subname for address
                if (resolvedAddress && resolvedAddress !== "0x0000000000000000000000000000000000000000") {
                    try {
                        const storedName = await publicClient.readContract({
                            address: ensManagerAddress,
                            abi: [{ type: "function", name: "attestorToSubname", inputs: [{ type: "address" }], outputs: [{ type: "string" }], stateMutability: "view" }],
                            functionName: "attestorToSubname",
                            args: [resolvedAddress as `0x${string}`]
                        }) as string;
                        if (storedName) fullSubname = storedName;
                    } catch {
                        // Keep current subname
                    }
                }
            }

            if (!resolvedAddress || resolvedAddress === "0x0000000000000000000000000000000000000000") {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            // Fetch live Attestor details from AttestorRegistry
            let isRegistered = false;
            let stakeAmount = "0";
            let totalAttestations = 0;
            let successfulAttestations = 0;
            let totalRewardsClaimed = "0";
            let trustScore = 0;
            let isWorldIdVerified = false;

            try {
                const attestorData = await publicClient.readContract({
                    address: registryAddress,
                    abi: [{
                        type: "function",
                        name: "attestors",
                        inputs: [{ type: "address" }],
                        outputs: [{ type: "bool", name: "isRegistered" }, { type: "uint256", name: "stake" }],
                        stateMutability: "view"
                    }],
                    functionName: "attestors",
                    args: [resolvedAddress as `0x${string}`]
                }) as [boolean, bigint];

                isRegistered = attestorData[0];
                stakeAmount = formatEther(attestorData[1]);
            } catch (err) {
                console.warn("Attestor registry lookup error:", err);
            }

            try {
                const stats = await publicClient.readContract({
                    address: registryAddress,
                    abi: [{
                        type: "function",
                        name: "getAttestorStats",
                        inputs: [{ type: "address" }],
                        outputs: [
                            { type: "uint256", name: "totalAttestations" },
                            { type: "uint256", name: "successful" },
                            { type: "uint256", name: "rewards" },
                            { type: "uint256", name: "totalClaimed" },
                            { type: "uint256", name: "trustScore" }
                        ],
                        stateMutability: "view"
                    }],
                    functionName: "getAttestorStats",
                    args: [resolvedAddress as `0x${string}`]
                }) as [bigint, bigint, bigint, bigint, bigint];

                totalAttestations = Number(stats[0]);
                successfulAttestations = Number(stats[1]);
                totalRewardsClaimed = formatEther(stats[3]);
                trustScore = Number(stats[4]);
            } catch (err) {
                console.warn("Attestor stats lookup error:", err);
            }

            setProfile({
                address: resolvedAddress,
                subname: fullSubname || queryStr,
                isRegistered,
                isWorldIdVerified,
                trustScore,
                successfulAttestations,
                totalAttestations,
                stakeAmount,
                totalRewardsClaimed
            });
        } catch (err) {
            console.error("ENS lookup failure:", err);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    }, [publicClient]);

    useEffect(() => {
        resolveProfile(activeQuery);
    }, [activeQuery, resolveProfile]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setActiveQuery(searchQuery.trim());
        }
    };

    const copyAddress = () => {
        if (profile?.address) {
            navigator.clipboard.writeText(profile.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const hasResult = profile && profile.address !== null;

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
                        placeholder="Search ENS subname (e.g. attestor-1.yieldproof.eth or attestor-1)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-mono text-sm"
                    />
                    <Button type="submit" variant="primary" className="bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                        <Search className="w-4 h-4 mr-1.5" />
                        Lookup
                    </Button>
                </form>

                {/* Quick Shortcuts */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Try lookup:</span>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("attestor-1.yieldproof.eth");
                            setActiveQuery("attestor-1.yieldproof.eth");
                        }}
                        className="font-mono text-sky-400 hover:underline bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20"
                    >
                        attestor-1.yieldproof.eth
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("attestor-1");
                            setActiveQuery("attestor-1");
                        }}
                        className="font-mono text-sky-400 hover:underline bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20"
                    >
                        attestor-1
                    </button>
                </div>

                {/* Profile Result Display */}
                {isLoading ? (
                    <div className="p-8 text-center space-y-3">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-sky-400" />
                        <p className="text-xs text-muted-foreground">Resolving ENS records on Mantle Sepolia...</p>
                    </div>
                ) : hasResult ? (
                    <div className="space-y-4 p-5 rounded-2xl bg-card/70 border border-sky-500/20 shadow-inner">
                        {/* Header with Subname & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                            <div>
                                <h4 className="text-xl font-bold font-mono text-sky-300">
                                    {profile.subname}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono text-muted-foreground">
                                        Resolved to: <span className="text-foreground font-semibold">{profile.address}</span>
                                    </span>
                                    <button
                                        onClick={copyAddress}
                                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                                        title="Copy address"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <a
                                        href={`https://explorer.sepolia.mantle.xyz/address/${profile.address}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sky-400 hover:text-sky-300 p-1"
                                        title="View on Mantle Explorer"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.isRegistered && (
                                    <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Active Attestor
                                    </Badge>
                                )}
                                {profile.isWorldIdVerified ? (
                                    <Badge variant="success" className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        World ID Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                                        Standard Attestor
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Metric Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Trust Score</span>
                                <div className="text-xl font-bold font-mono text-primary">{profile.trustScore}/100</div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Total Attestations</span>
                                <div className="text-xl font-bold font-mono text-foreground">{profile.totalAttestations}</div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Staked Capital</span>
                                <div className="text-xl font-bold font-mono text-emerald-400">{parseFloat(profile.stakeAmount).toFixed(2)} MNT</div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-1">
                                <span className="text-xs text-muted-foreground">Total Claimed</span>
                                <div className="text-xl font-bold font-mono text-foreground">{parseFloat(profile.totalRewardsClaimed).toFixed(2)} MNT</div>
                            </div>
                        </div>

                        {/* ENSv2 Raw Text Records Preview */}
                        <div className="pt-3 space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Dynamic ENSv2 Text Records:
                            </span>
                            <div className="p-3 rounded-xl bg-muted/30 font-mono text-xs space-y-1.5 text-muted-foreground border border-border">
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/status</span>
                                    <span className="text-foreground">{profile.isRegistered ? "Active" : "Inactive"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/trust-score</span>
                                    <span className="text-foreground">{profile.trustScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/total-attestations</span>
                                    <span className="text-foreground">{profile.totalAttestations}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sky-300">app/yieldproof/stake</span>
                                    <span className="text-foreground">{profile.stakeAmount} MNT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center space-y-2 rounded-xl bg-muted/20 border border-border">
                        <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">No ENS Subname Record Found</p>
                        <p className="text-xs text-muted-foreground">
                            The query <code className="font-mono text-sky-300">{activeQuery}</code> has not been registered or issued yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
