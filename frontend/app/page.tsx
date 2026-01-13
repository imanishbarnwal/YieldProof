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
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

            <div className="relative z-10 w-full">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center px-4 py-20">
                    <div className="text-center space-y-12 max-w-5xl mx-auto w-full">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                                Live on Mantle Sepolia
                            </Badge>
                            <Badge variant="default" className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-600/50 bg-slate-800/50 text-slate-300">
                                Beta v1.0
                            </Badge>
                        </div>

                        <div className="space-y-8">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white">
                                Trustless Yield Verification
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                                The first protocol enabling Real World Asset (RWA) issuers
                                to prove yield generation on-chain through cryptographic verification and economic consensus.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link href="/investor">
                                <Button
                                    size="xl"
                                    className="relative overflow-hidden bg-blue-600/20 hover:bg-blue-500/30 border-2 border-blue-400/50 hover:border-blue-300/70 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/40"
                                    style={{
                                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/20 to-blue-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    <PieChart className="w-5 h-5 mr-2" />
                                    Start Investing
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>

                            <Link href="/issuer">
                                <Button
                                    variant="outline"
                                    size="xl"
                                    className="relative overflow-hidden bg-slate-900/20 hover:bg-slate-800/30 border-2 border-slate-500/40 hover:border-slate-400/60 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg shadow-slate-700/20"
                                    style={{
                                        boxShadow: '0 0 15px rgba(100, 116, 139, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-400/5 via-slate-300/10 to-slate-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    <LayoutDashboard className="w-5 h-5 mr-2" />
                                    Issuer Portal
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
                            <div className="text-center space-y-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="text-3xl font-bold text-white">100%</div>
                                <div className="text-sm text-slate-400">Transparent</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="text-3xl font-bold text-white">0</div>
                                <div className="text-sm text-slate-400">Trust Required</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-sm text-slate-400">Verification</div>
                            </div>
                            <div className="text-center space-y-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="text-3xl font-bold text-white">∞</div>
                                <div className="text-sm text-slate-400">Scalability</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Protocol Flow Section */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Protocol Flow</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white">How YieldProof Works</h2>
                            <p className="text-slate-300 font-light text-xl max-w-3xl mx-auto leading-relaxed">
                                End-to-end verification powered by cryptographic proofs, economic staking, and decentralized consensus.
                            </p>
                        </div>

                        {/* Desktop Flow - Horizontal */}
                        <div className="hidden lg:block">
                            <div className="relative flex items-center justify-between max-w-6xl mx-auto">
                                {/* Simple Connecting Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent -translate-y-1/2 z-0" />

                                {/* Progress Indicators */}
                                <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center -translate-y-1/2 z-10 px-20">
                                    <div className="w-2 h-2 bg-blue-400/60 rounded-full shadow-sm shadow-blue-400/30" />
                                    <div className="w-2 h-2 bg-purple-400/60 rounded-full shadow-sm shadow-purple-400/30" />
                                    <div className="w-2 h-2 bg-emerald-400/60 rounded-full shadow-sm shadow-emerald-400/30" />
                                    <div className="w-2 h-2 bg-amber-400/60 rounded-full shadow-sm shadow-amber-400/30" />
                                </div>

                                {/* Step Cards */}
                                <div className="flex justify-between w-full relative z-20">
                                    {/* Step 1 */}
                                    <Card className="w-64 p-6 text-center border border-slate-700/30 bg-slate-800/20 backdrop-blur-sm hover:border-blue-400/30 hover:bg-slate-800/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-xl flex items-center justify-center text-xl font-bold mx-auto shadow-sm shadow-blue-500/20">
                                                1
                                            </div>
                                            <div className="w-14 h-14 bg-slate-700/20 rounded-xl flex items-center justify-center mx-auto border border-slate-600/20">
                                                <FileCheck2 className="w-7 h-7 text-blue-300" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-semibold text-white">Submit Proof</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    Issuer submits yield documentation with cryptographic hash recorded on-chain.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Step 2 */}
                                    <Card className="w-64 p-6 text-center border border-slate-700/30 bg-slate-800/20 backdrop-blur-sm hover:border-purple-400/30 hover:bg-slate-800/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-purple-500/20 border border-purple-400/40 text-purple-300 rounded-xl flex items-center justify-center text-xl font-bold mx-auto shadow-sm shadow-purple-500/20">
                                                2
                                            </div>
                                            <div className="w-14 h-14 bg-slate-700/20 rounded-xl flex items-center justify-center mx-auto border border-slate-600/20">
                                                <Users className="w-7 h-7 text-purple-300" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-semibold text-white">Attest & Stake</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    Independent verifiers inspect data and stake MNT tokens to attest validity.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Step 3 */}
                                    <Card className="w-64 p-6 text-center border border-slate-700/30 bg-slate-800/20 backdrop-blur-sm hover:border-emerald-400/30 hover:bg-slate-800/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl flex items-center justify-center text-xl font-bold mx-auto shadow-sm shadow-emerald-500/20">
                                                3
                                            </div>
                                            <div className="w-14 h-14 bg-slate-700/20 rounded-xl flex items-center justify-center mx-auto border border-slate-600/20">
                                                <Database className="w-7 h-7 text-emerald-300" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-semibold text-white">Consensus</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    Once stake threshold is met, the claim achieves Verified status.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Step 4 */}
                                    <Card className="w-64 p-6 text-center border border-slate-700/30 bg-slate-800/20 backdrop-blur-sm hover:border-amber-400/30 hover:bg-slate-800/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-xl flex items-center justify-center text-xl font-bold mx-auto shadow-sm shadow-amber-500/20">
                                                4
                                            </div>
                                            <div className="w-14 h-14 bg-slate-700/20 rounded-xl flex items-center justify-center mx-auto border border-slate-600/20">
                                                <Banknote className="w-7 h-7 text-amber-300" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-semibold text-white">Yield Unlocked</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    Investors can confidently deposit into verified vaults with full transparency.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Mobile/Tablet Flow - Vertical */}
                        <div className="lg:hidden">
                            <div className="relative max-w-md mx-auto">
                                {/* Simple Vertical Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-500/50 to-transparent -translate-x-1/2 z-0" />

                                <div className="space-y-12 relative z-10">
                                    {[
                                        { num: 1, icon: FileCheck2, title: "Submit Proof", desc: "Issuer submits yield documentation with cryptographic hash recorded on-chain.", color: "blue" },
                                        { num: 2, icon: Users, title: "Attest & Stake", desc: "Independent verifiers inspect data and stake MNT tokens to attest validity.", color: "purple" },
                                        { num: 3, icon: Database, title: "Consensus", desc: "Once stake threshold is met, the claim achieves Verified status.", color: "emerald" },
                                        { num: 4, icon: Banknote, title: "Yield Unlocked", desc: "Investors can confidently deposit into verified vaults with full transparency.", color: "amber" }
                                    ].map((step, index) => {
                                        const colorClasses = {
                                            blue: { bg: "bg-blue-500/20", border: "border-blue-400/40", text: "text-blue-300", dot: "bg-blue-400/60", shadow: "shadow-blue-400/30" },
                                            purple: { bg: "bg-purple-500/20", border: "border-purple-400/40", text: "text-purple-300", dot: "bg-purple-400/60", shadow: "shadow-purple-400/30" },
                                            emerald: { bg: "bg-emerald-500/20", border: "border-emerald-400/40", text: "text-emerald-300", dot: "bg-emerald-400/60", shadow: "shadow-emerald-400/30" },
                                            amber: { bg: "bg-amber-500/20", border: "border-amber-400/40", text: "text-amber-300", dot: "bg-amber-400/60", shadow: "shadow-amber-400/30" }
                                        };
                                        const colors = colorClasses[step.color as keyof typeof colorClasses];

                                        return (
                                            <div key={step.num} className="relative">
                                                {/* Step Connector Dot */}
                                                <div className={`absolute left-1/2 top-8 w-3 h-3 ${colors.dot} rounded-full border-2 border-slate-800 -translate-x-1/2 z-20 shadow-sm ${colors.shadow}`} />

                                                <Card className="relative ml-8 p-6 border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 ${colors.bg} border ${colors.border} ${colors.text} rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm ${colors.shadow}`}>
                                                            {step.num}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                                            <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Key Benefits */}
                        <div className="mt-16 p-8 bg-slate-800/20 rounded-xl border border-slate-700/30 backdrop-blur-sm">
                            <div className="text-center space-y-8">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Key Benefits</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                                    <div className="text-center space-y-4">
                                        <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                            <Lock className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">Cryptographic Security</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">Immutable on-chain proofs ensure data integrity</p>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                            <TrendingUp className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">Economic Consensus</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">Stake-based verification aligns incentives</p>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                            <Globe className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">Decentralized Trust</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">No single point of failure or control</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Roles */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Award className="w-6 h-6 text-amber-400" />
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Ecosystem Roles</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white">Built for Everyone</h2>
                            <p className="text-slate-300 font-light text-xl max-w-3xl mx-auto leading-relaxed">
                                Whether you're issuing assets, verifying claims, or investing capital - YieldProof has you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link href="/issuer" className="group">
                                <Card className="h-full cursor-pointer border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300">
                                    <CardHeader className="p-8 text-center">
                                        <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                            <LayoutDashboard className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white mb-4">For Issuers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 text-center">
                                        <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                            Submit cryptographically verifiable proofs of off-chain yield generation for your RWA vaults with full transparency.
                                        </p>
                                        <div className="flex items-center justify-center text-blue-300 font-semibold group-hover:text-white transition-colors">
                                            <span>Submit Proof</span>
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/attestor" className="group">
                                <Card className="h-full cursor-pointer border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300">
                                    <CardHeader className="p-8 text-center">
                                        <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                            <ShieldCheck className="w-8 h-8 text-emerald-300" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white mb-4">For Attestors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 text-center">
                                        <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                            Verify documents and on-chain data to earn rewards while securing protocol integrity through economic consensus.
                                        </p>
                                        <div className="flex items-center justify-center text-emerald-300 font-semibold group-hover:text-white transition-colors">
                                            <span>Verify Claims</span>
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/investor" className="group">
                                <Card className="h-full cursor-pointer border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300">
                                    <CardHeader className="p-8 text-center">
                                        <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                            <PieChart className="w-8 h-8 text-purple-300" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white mb-4">For Investors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 text-center">
                                        <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                            Deposit into verified RWA vaults with complete transparency on yield sources and real-time verification status.
                                        </p>
                                        <div className="flex items-center justify-center text-purple-300 font-semibold group-hover:text-white transition-colors">
                                            <span>View Vaults</span>
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Trust & Security Section */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-6xl mx-auto space-y-16">
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Lock className="w-6 h-6 text-emerald-400" />
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Trust & Security</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white">Built on Unbreakable Foundations</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Cryptographic Proofs</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Immutable on-chain verification</p>
                            </div>

                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <TrendingUp className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Economic Security</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Stake-based consensus mechanism</p>
                            </div>

                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <Globe className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Decentralized Network</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">No single point of failure</p>
                            </div>

                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <Zap className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Real-time Updates</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Instant verification status</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-24 px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold text-white">
                                Ready to Transform RWA Verification?
                            </h2>
                            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                                Join the future of transparent, verifiable yield generation. Start building trust through cryptographic proof.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/investor">
                                <Button
                                    size="xl"
                                    className="relative overflow-hidden bg-blue-600/20 hover:bg-blue-500/30 border-2 border-blue-400/50 hover:border-blue-300/70 text-white font-semibold px-10 py-5 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/40"
                                    style={{
                                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/20 to-blue-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    <PieChart className="w-5 h-5 mr-2" />
                                    Start Investing
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>

                            <Link href="/issuer">
                                <Button
                                    variant="outline"
                                    size="xl"
                                    className="relative overflow-hidden bg-slate-900/20 hover:bg-slate-800/30 border-2 border-slate-500/40 hover:border-slate-400/60 text-white font-semibold px-10 py-5 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg shadow-slate-700/20"
                                    style={{
                                        boxShadow: '0 0 15px rgba(100, 116, 139, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-400/5 via-slate-300/10 to-slate-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
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
