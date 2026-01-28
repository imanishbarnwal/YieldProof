"use client"

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import {
    ArrowRight,
    ShieldCheck,
    PieChart,
    LayoutDashboard,
    FileCheck2,
    Database,
    Users,
    Banknote,
    TrendingUp,
    Lock,
    CheckCircle2,
    Globe,
    Zap,
    Award
} from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-background page-transition">

            <div className="relative z-10 w-full">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center px-4 py-20">
                    <div className="text-center space-y-12 max-w-5xl mx-auto w-full">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-xl">
                                Live on Mantle Sepolia
                            </Badge>
                            <Badge variant="default" className="px-4 py-2 text-sm font-medium rounded-xl border-border/50 bg-card/50">
                                Beta v1.0
                            </Badge>
                        </div>

                        <div className="space-y-8">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                                Trustless Yield Verification
                            </h1>

                            <p className="text-xl max-w-4xl mx-auto leading-relaxed">
                                The first protocol enabling Real World Asset (RWA) issuers
                                to prove yield generation on-chain through cryptographic verification and economic consensus.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link href="/investor">
                                <Button
                                    size="xl"
                                    variant="primary"
                                    className="font-semibold px-8 py-4 rounded-lg transition-colors duration-200"
                                >
                                    <PieChart className="w-5 h-5 mr-2" />
                                    Start Investing
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>

                            <Link href="/issuer">
                                <Button
                                    variant="outline"
                                    size="xl"
                                    className="border-border hover:bg-muted font-semibold px-8 py-4 rounded-lg transition-colors duration-200"
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-2" />
                                    Issuer Portal
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
                            <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 border border-border">
                                <div className="text-3xl font-bold">100%</div>
                                <div className="text-sm">Transparent</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 border border-border">
                                <div className="text-3xl font-bold">0</div>
                                <div className="text-sm">Trust Required</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 border border-border">
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-sm">Verification</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-lg bg-card/50 border border-border">
                                <div className="text-3xl font-bold">∞</div>
                                <div className="text-sm">Scalability</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Protocol Flow Section - Asymmetrical */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-right space-y-6 max-w-4xl ml-auto">
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <span className="font-medium uppercase tracking-wider text-sm">Protocol Flow</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">How YieldProof Works</h2>
                            <p className="text-xl max-w-3xl leading-relaxed">
                                End-to-end verification powered by cryptographic proofs, economic staking, and decentralized consensus.
                            </p>
                        </div>

                        {/* Desktop Flow - Asymmetrical Zigzag */}
                        <div className="hidden lg:block">
                            <div className="space-y-16">
                                {/* Step 1 & 2 - Left aligned */}
                                <div className="flex items-center gap-12 max-w-5xl">
                                    <Card className="w-80 p-8 border-border bg-card/70 hover:bg-card/90 transition-all duration-300 hover:scale-105">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center text-xl font-bold">
                                                    1
                                                </div>
                                                <div className="w-14 h-14 bg-muted/50 rounded-lg flex items-center justify-center border border-border/50">
                                                    <FileCheck2 className="w-7 h-7" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-semibold">Submit Proof</h3>
                                                <p className="leading-relaxed">
                                                    Issuer submits yield documentation with cryptographic hash recorded on-chain for immutable verification.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />

                                    <Card className="w-80 p-8 border-border bg-card/70 hover:bg-card/90 transition-all duration-300 hover:scale-105">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-accent/20 border border-accent/40 rounded-xl flex items-center justify-center text-xl font-bold">
                                                    2
                                                </div>
                                                <div className="w-14 h-14 bg-muted/50 rounded-lg flex items-center justify-center border border-border/50">
                                                    <Users className="w-7 h-7" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-semibold">Attest & Stake</h3>
                                                <p className="leading-relaxed">
                                                    Independent verifiers inspect data and stake MNT tokens to attest validity through economic consensus.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Step 3 & 4 - Right aligned */}
                                <div className="flex items-center gap-12 max-w-5xl ml-auto">
                                    <Card className="w-80 p-8 border-border bg-card/70 hover:bg-card/90 transition-all duration-300 hover:scale-105">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center text-xl font-bold">
                                                    3
                                                </div>
                                                <div className="w-14 h-14 bg-muted/50 rounded-lg flex items-center justify-center border border-border/50">
                                                    <Database className="w-7 h-7" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-semibold">Consensus</h3>
                                                <p className="leading-relaxed">
                                                    Once stake threshold is met, the claim achieves Verified status with full network consensus.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="flex-1 h-px bg-gradient-to-l from-primary/50 to-transparent" />

                                    <Card className="w-80 p-8 border-border bg-card/70 hover:bg-card/90 transition-all duration-300 hover:scale-105">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-accent/20 border border-accent/40 rounded-xl flex items-center justify-center text-xl font-bold">
                                                    4
                                                </div>
                                                <div className="w-14 h-14 bg-muted/50 rounded-lg flex items-center justify-center border border-border/50">
                                                    <Banknote className="w-7 h-7" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-semibold">Yield Unlocked</h3>
                                                <p className="leading-relaxed">
                                                    Investors can confidently deposit into verified vaults with full transparency and real-time updates.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Mobile/Tablet Flow - Clean Minimal */}
                        <div className="lg:hidden">
                            <div className="max-w-md mx-auto">
                                <div className="space-y-8">
                                    {[
                                        { num: 1, icon: FileCheck2, title: "Submit Proof", desc: "Issuer submits yield documentation with cryptographic hash recorded on-chain.", color: "primary" },
                                        { num: 2, icon: Users, title: "Attest & Stake", desc: "Independent verifiers inspect data and stake MNT tokens to attest validity.", color: "accent" },
                                        { num: 3, icon: Database, title: "Consensus", desc: "Once stake threshold is met, the claim achieves Verified status.", color: "primary" },
                                        { num: 4, icon: Banknote, title: "Yield Unlocked", desc: "Investors can confidently deposit into verified vaults with full transparency.", color: "accent" }
                                    ].map((step, index) => {
                                        const colorClasses = {
                                            primary: { bg: "bg-primary/20", border: "border-primary/40" },
                                            accent: { bg: "bg-accent/20", border: "border-accent/40" }
                                        };
                                        const colors = colorClasses[step.color as keyof typeof colorClasses];

                                        return (
                                            <Card key={step.num} className="p-6 border-border bg-card/70 hover:bg-card/90 transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0`}>
                                                        {step.num}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-semibold">{step.title}</h3>
                                                        <p className="text-sm leading-relaxed">{step.desc}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>


                    </div>
                </section>

                {/* Ecosystem Roles - 3 Column Layout */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-left space-y-6 max-w-4xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-6 h-6" />
                                <span className="font-medium uppercase tracking-wider text-sm">Ecosystem Roles</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">Built for Everyone</h2>
                            <p className="text-xl max-w-3xl leading-relaxed">
                                Whether you're issuing assets, verifying claims, or investing capital - YieldProof has you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link href="/issuer" className="group">
                                <Card className="h-full cursor-pointer border-border bg-card/80 hover:border-primary/40 hover:bg-card/90 transition-all duration-300 hover:scale-[1.02]">
                                    <CardHeader className="p-8 text-center">
                                        <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center mb-6 mx-auto">
                                            <LayoutDashboard className="w-8 h-8" />
                                        </div>
                                        <CardTitle className="text-2xl font-semibold mb-4">For Issuers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 text-center">
                                        <p className="mb-6 leading-relaxed text-lg">
                                            Submit cryptographically verifiable proofs of off-chain yield generation for your RWA vaults with full transparency.
                                        </p>
                                        <div className="flex items-center justify-center font-semibold group-hover:text-foreground transition-colors">
                                            <span>Submit Proof</span>
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/attestor" className="group">
                                <Card className="h-full cursor-pointer border-border bg-card/80 hover:border-accent/40 hover:bg-card/90 transition-all duration-300 hover:scale-[1.02]">
                                    <CardHeader className="p-8 text-center">
                                        <div className="w-16 h-16 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center mb-6 mx-auto">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <CardTitle className="text-2xl font-semibold mb-4">For Attestors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 text-center">
                                        <p className="mb-6 leading-relaxed text-lg">
                                            Verify documents and on-chain data to earn rewards while securing protocol integrity through economic consensus.
                                        </p>
                                        <div className="flex items-center justify-center font-semibold group-hover:text-foreground transition-colors">
                                            <span>Verify Claims</span>
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/investor" className="group">
                                <Card className="h-full cursor-pointer border-border bg-card/80 hover:border-primary/40 hover:bg-card/90 transition-all duration-300 hover:scale-[1.02]">
                                    <CardHeader className="p-8 text-center">
                                        <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center mb-6 mx-auto">
                                            <PieChart className="w-8 h-8" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold mb-4">For Investors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 text-center">
                                        <p className="mb-6 leading-relaxed text-lg">
                                            Deposit into verified RWA vaults with complete transparency on yield sources and real-time verification status.
                                        </p>
                                        <div className="flex items-center justify-center font-semibold group-hover:text-foreground transition-colors">
                                            <span>View Vaults</span>
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Trust & Security Section - Asymmetrical */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-6xl mx-auto space-y-16">
                        <div className="text-left space-y-6 max-w-4xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Lock className="w-6 h-6" />
                                <span className="font-medium uppercase tracking-wider text-sm">Trust & Security</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">Built on Unbreakable Foundations</h2>
                        </div>

                        {/* Asymmetrical Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                            {/* Large Feature Card */}
                            <div className="lg:col-span-3">
                                <div className="h-full p-8 rounded-xl bg-gradient-to-br from-card/80 to-card/60 border border-border hover:border-primary/30 transition-all duration-300">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-2xl font-bold">Cryptographic Proofs</h3>
                                        </div>
                                        <p className="text-lg leading-relaxed">
                                            Every yield claim is backed by immutable on-chain verification using advanced cryptographic techniques.
                                            Hash-based proofs ensure data integrity while maintaining privacy and scalability across the entire protocol.
                                        </p>
                                        <div className="flex items-center gap-2 font-medium">
                                            <span>Learn more about our cryptography</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Smaller Cards Stack */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 rounded-xl bg-card/50 border border-border hover:border-accent/30 transition-colors">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold">Economic Security</h3>
                                        <p className="text-sm leading-relaxed">Stake-based consensus mechanism ensures aligned incentives</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-colors">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold">Decentralized Network</h3>
                                        <p className="text-sm leading-relaxed">Distributed verification with no single point of failure</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-card/50 border border-border hover:border-accent/30 transition-colors">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold">Real-time Updates</h3>
                                        <p className="text-sm leading-relaxed">Instant verification status and live monitoring</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold">
                                Ready to Transform RWA Verification?
                            </h2>
                            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
                                Join the future of transparent, verifiable yield generation. Start building trust through cryptographic proof.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/investor">
                                <Button
                                    size="xl"
                                    variant="primary"
                                    className="font-semibold px-10 py-5 rounded-lg"
                                >
                                    <PieChart className="w-5 h-5 mr-2" />
                                    Start Investing
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>

                            <Link href="/issuer">
                                <Button
                                    variant="outline"
                                    size="xl"
                                    className="font-semibold px-10 py-5 rounded-lg"
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-2" />
                                    Issue Assets
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
