"use client"

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedSection, StaggeredContainer } from "@/components/ui/AnimatedSection";
import { ArrowRight, ShieldCheck, PieChart, LayoutDashboard, FileCheck2, Database, Users, Banknote } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-20">
            {/* Hero Section */}
            <AnimatedSection className="text-center space-y-6 max-w-4xl">
                <Badge variant="success" className="mb-4" pulse>
                    Live on Mantle Sepolia
                </Badge>
                <h1 className="text-6xl md:text-8xl font-light tracking-tight text-white leading-tight">
                    Trustless Yield Verification
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                    YieldProof enables Real World Asset (RWA) issuers to prove yield generation on-chain,
                    unlocking transparent and verified investment opportunities.
                </p>
                <div className="flex gap-4 justify-center pt-6">
                    <Link href="/investor">
                        <Button size="xl" variant="default" className="text-lg font-medium">
                            Start Investing
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/issuer">
                        <Button variant="outline" size="xl" className="text-lg font-medium">
                            Issuer Portal
                        </Button>
                    </Link>
                </div>
            </AnimatedSection>

            {/* Protocol Flow Section */}
            <AnimatedSection className="w-full max-w-6xl px-4 space-y-10" delay={0.2}>
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-light text-white">How YieldProof Works</h2>
                    <p className="text-slate-400 font-light text-lg">End-to-end verification powered by cryptographic proofs and economic staking.</p>
                </div>

                <StaggeredContainer className="grid grid-cols-1 md:grid-cols-4 gap-4 relative" staggerDelay={0.15}>
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-700 -z-10" />

                    {/* Step 1 */}
                    <Card className="p-6 flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-lg font-medium shadow-lg z-10">1</div>
                        <FileCheck2 className="w-8 h-8 text-indigo-300" />
                        <div>
                            <h3 className="font-medium text-white mb-1 text-lg">Submit Proof</h3>
                            <p className="text-sm text-slate-400 leading-snug">Issuer submits yield docs. Hash recorded on-chain.</p>
                        </div>
                    </Card>

                    {/* Step 2 */}
                    <Card className="p-6 flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-lg font-medium shadow-lg z-10">2</div>
                        <Users className="w-8 h-8 text-indigo-300" />
                        <div>
                            <h3 className="font-medium text-white mb-1 text-lg">Attest & Stake</h3>
                            <p className="text-sm text-slate-400 leading-snug">Verifiers inspect data and stake MNT to attest validity.</p>
                        </div>
                    </Card>

                    {/* Step 3 */}
                    <Card className="p-6 flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-lg font-medium shadow-lg z-10">3</div>
                        <Database className="w-8 h-8 text-indigo-300" />
                        <div>
                            <h3 className="font-medium text-white mb-1 text-lg">Consensus</h3>
                            <p className="text-sm text-slate-400 leading-snug">Once stake threshold is met, the claim is <strong className="text-white font-medium">Verified</strong>.</p>
                        </div>
                    </Card>

                    {/* Step 4 */}
                    <Card className="p-6 flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-lg font-medium shadow-lg z-10">4</div>
                        <Banknote className="w-8 h-8 text-indigo-300" />
                        <div>
                            <h3 className="font-medium text-white mb-1 text-lg">Yield Unlocked</h3>
                            <p className="text-sm text-slate-400 leading-snug">Investors can now safely deposit into the verified vault.</p>
                        </div>
                    </Card>
                </StaggeredContainer>
            </AnimatedSection>

            {/* Feature Cards */}
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4" staggerDelay={0.2}>
                <Link href="/issuer" className="group">
                    <Card className="h-full cursor-pointer">
                        <CardHeader>
                            <LayoutDashboard className="w-10 h-10 text-indigo-400 mb-2" />
                            <CardTitle className="text-xl font-medium text-white">For Issuers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4 leading-relaxed">
                                Submit cryptographically verifiable proofs of off-chain yield generation for your RWA vaults.
                            </p>
                            <div className="flex items-center text-sm font-medium text-indigo-300">
                                Submit Proof <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/attestor" className="group">
                    <Card className="h-full cursor-pointer">
                        <CardHeader>
                            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2" />
                            <CardTitle className="text-xl font-medium text-white">For Attestors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4 leading-relaxed">
                                Verify documents and on-chain data to earn rewards by securing the protocol integrity.
                            </p>
                            <div className="flex items-center text-sm font-medium text-emerald-400">
                                Verify Claims <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/investor" className="group">
                    <Card className="h-full cursor-pointer">
                        <CardHeader>
                            <PieChart className="w-10 h-10 text-blue-400 mb-2" />
                            <CardTitle className="text-xl font-medium text-white">For Investors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4 leading-relaxed">
                                Deposit into verified RWA vaults with 100% transparency on yield sources and verification status.
                            </p>
                            <div className="flex items-center text-sm font-medium text-blue-400">
                                View Vaults <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </StaggeredContainer>
        </div>
    );
}
