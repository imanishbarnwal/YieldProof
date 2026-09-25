"use client";

import React from "react";
import { ENSProfileLookup } from "@/components/ens/ENSProfileLookup";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Badge } from "@/components/ui/Badge";
import { Globe, ShieldCheck, Sparkles } from "lucide-react";

export default function ENSPage() {
    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <AnimatedSection delay={0.05}>
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="default" className="px-3 py-1 bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
                                <Globe className="w-3.5 h-3.5 mr-1" />
                                ENSv2 Identity & Reputation Layer
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Attestor ENS Profiles
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
                            Every verified YieldProof attestor receives an ENSv2 subname containing their on-chain trust score, verified human credential, and attestation track record.
                        </p>
                    </div>
                </AnimatedSection>

                {/* Lookup Component */}
                <AnimatedSection delay={0.15}>
                    <ENSProfileLookup />
                </AnimatedSection>
            </div>
        </div>
    );
}
