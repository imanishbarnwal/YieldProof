"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
    Globe,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    ExternalLink,
    Plus,
    Loader2,
    Copy,
    Check,
    Search
} from "lucide-react";
import { validateSubnameLabel, safeNormalizeENS } from "@/lib/ens/ensService";

interface ENSIdentityCardProps {
    subname?: string;
    isRegistered: boolean;
    isWorldIdVerified: boolean;
    trustScore: number;
    claimsVerified: number;
    stake: string;
    onCreateSubname: (label: string) => void;
    onAutoCreateSubname: () => void;
    onOpenLookupModal?: (subname: string) => void;
    isProcessing: boolean;
}

export function ENSIdentityCard({
    subname,
    isRegistered,
    isWorldIdVerified,
    trustScore,
    claimsVerified,
    stake,
    onCreateSubname,
    onAutoCreateSubname,
    onOpenLookupModal,
    isProcessing,
}: ENSIdentityCardProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [customLabel, setCustomLabel] = useState("");
    const [copied, setCopied] = useState(false);
    const [labelError, setLabelError] = useState<string | null>(null);

    const hasSubname = Boolean(subname && subname.length > 0);

    const handleCopy = () => {
        if (!subname) return;
        navigator.clipboard.writeText(subname);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateSubnameLabel(customLabel);
        if (!validation.valid) {
            setLabelError(validation.error || "Invalid label");
            return;
        }
        setLabelError(null);
        onCreateSubname(safeNormalizeENS(customLabel));
        setIsCreateModalOpen(false);
    };

    return (
        <Card className="backdrop-blur-xl border border-sky-500/20 overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 via-primary/5 to-transparent pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold">ENSv2 Identity</CardTitle>
                            <CardDescription className="text-xs">Portable On-Chain Reputation</CardDescription>
                        </div>
                    </div>
                    {hasSubname ? (
                        <Badge variant="success" className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
                            ENS Active ✓
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                            Unclaimed
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-3">
                {hasSubname ? (
                    <div className="space-y-3">
                        {/* Domain banner */}
                        <div className="p-3 rounded-xl bg-card/80 border border-sky-500/20 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-sky-300 truncate max-w-[200px]">
                                    {subname}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="text-muted-foreground hover:text-sky-300 transition-colors p-1"
                                    title="Copy ENS name"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {isWorldIdVerified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        World Verified
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-medium font-mono">
                                    Score: {trustScore}/100
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-[10px] font-medium font-mono">
                                    Verified: {claimsVerified}
                                </span>
                            </div>
                        </div>

                        {onOpenLookupModal && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenLookupModal(subname!)}
                                className="w-full text-xs font-medium border-sky-500/30 hover:bg-sky-500/10 text-sky-300"
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                View Public ENS Record
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Claim your portable <code className="text-sky-300 font-mono">*.yieldproof.eth</code> subname to publish your trust score and human verification records on ENSv2.
                        </p>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                disabled={!isRegistered || isProcessing}
                                variant="primary"
                                className="w-full text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white"
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                Create ENS Identity
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Subname Creation Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/85 backdrop-blur-md overflow-y-auto">
                    <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-card border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-border/50 shrink-0 bg-sky-500/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-foreground">Create ENS Subname</h3>
                                    <p className="text-xs text-muted-foreground">Issue your portable YieldProof reputation identity</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCustomSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground">Custom Attestor Label:</label>
                                    <div className="flex items-stretch rounded-xl border border-primary/30 bg-background/80 focus-within:border-sky-500/70 focus-within:ring-2 focus-within:ring-sky-500/20 overflow-hidden transition-all shadow-inner">
                                        <input
                                            type="text"
                                            placeholder="attestor-007"
                                            value={customLabel}
                                            onChange={(e) => {
                                                setCustomLabel(e.target.value);
                                                setLabelError(null);
                                            }}
                                            className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                            autoFocus
                                        />
                                        <span className="flex items-center px-3.5 bg-muted/80 border-l border-border text-xs font-mono text-sky-400 font-semibold select-none whitespace-nowrap">
                                            .yieldproof.eth
                                        </span>
                                    </div>
                                    {labelError && (
                                        <p className="text-xs text-destructive font-medium">{labelError}</p>
                                    )}
                                </div>

                                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/80 text-xs text-muted-foreground space-y-2">
                                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                                        Published ENSv2 Records:
                                    </p>
                                    <p className="break-words leading-relaxed text-foreground/80">
                                        • <code className="text-sky-300 font-mono">addr</code>: Your connected attestor wallet
                                    </p>
                                    <p className="break-words leading-relaxed text-foreground/80">
                                        • <code className="text-sky-300 font-mono">app/yieldproof/trust-score</code>: Live Trust Score
                                    </p>
                                    <p className="break-words leading-relaxed text-foreground/80">
                                        • <code className="text-sky-300 font-mono">app/yieldproof/world-verified</code>: True (ZK Human)
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer / Action Buttons */}
                            <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-full sm:w-1/3 text-xs order-3 sm:order-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        onAutoCreateSubname();
                                        setIsCreateModalOpen(false);
                                    }}
                                    disabled={isProcessing}
                                    className="w-full sm:w-1/3 text-xs border-sky-500/30 text-sky-300 hover:bg-sky-500/10 order-2"
                                >
                                    Auto Assign
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!customLabel.trim() || isProcessing}
                                    className="w-full sm:w-1/3 text-xs bg-sky-600 hover:bg-sky-500 text-white font-semibold order-1 sm:order-3"
                                >
                                    Claim Name
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
}
