"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";

export interface WorldIDProofResult {
    merkle_root: string;
    nullifier_hash: string;
    proof: string;
    verification_level: string;
}

interface WorldIDWidgetProps {
    onSuccess: (result: WorldIDProofResult) => void;
    isVerified?: boolean;
    disabled?: boolean;
    action?: string;
    signal?: string;
}

export function WorldIDWidget({
    onSuccess,
    isVerified = false,
    disabled = false,
    action = "verify-attestor",
    signal = "",
}: WorldIDWidgetProps) {
    const [verifying, setVerifying] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const appId = process.env.NEXT_PUBLIC_WLD_APP_ID || "app_staging_yieldproof";

    const handleSimulateVerification = async () => {
        setVerifying(true);
        setError(null);
        try {
            // Generate deterministic mock proof & nullifier for testnet demo
            const timestamp = Date.now();
            const mockNullifier = `0x${Math.floor(Math.random() * 1e16).toString(16).padStart(16, "0")}`;
            const mockRoot = `0x${Math.floor(Math.random() * 1e16).toString(16).padStart(16, "0")}`;
            const mockProof = JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7]);

            const res = await fetch("/api/world-id/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proof: mockProof,
                    merkle_root: mockRoot,
                    nullifier_hash: mockNullifier,
                    verification_level: "orb",
                    action,
                    signal,
                }),
            });

            const data = await res.json();
            if (!res.ok && !data.success) {
                throw new Error(data.error || "World ID verification failed");
            }

            onSuccess({
                merkle_root: mockRoot,
                nullifier_hash: mockNullifier,
                proof: mockProof,
                verification_level: "orb",
            });
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Proof verification error:", err);
            setError(err.message || "Failed to verify World ID proof");
        } finally {
            setVerifying(false);
        }
    };

    if (isVerified) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>World ID Verified (Human)</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={disabled || verifying}
                variant="outline"
                className="w-full border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 font-medium transition-all"
            >
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                Verify with World ID
            </Button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-md p-6 bg-card border border-emerald-500/30 rounded-2xl shadow-2xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-foreground">World ID Verification</h3>
                                <p className="text-xs text-muted-foreground">Proof of Personhood & Sybil Resistance</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border">
                            <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p>Guarantees 1 human = 1 attestor address without revealing your personal identity.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p>Generates zero-knowledge proof for action: <code className="text-emerald-300 font-mono text-xs">{action}</code></p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="w-1/2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleSimulateVerification}
                                isLoading={verifying}
                                className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Identity"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
