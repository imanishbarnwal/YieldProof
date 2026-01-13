"use client"

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedSection, StaggeredContainer } from "@/components/ui/AnimatedSection";
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
    Sparkles,
    TrendingUp,
    Lock,
    CheckCircle2,
    Globe,
    Zap,
    Star,
    Award
} from "lucide-react";

export default function Home() {
    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse float-animation" />
                <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse float-animation-delayed" />
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse float-animation-slow" />
            </div>
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            
            <div className="relative z-10 w-full">
                {/* Hero Section */}
                <AnimatedSection className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center space-y-8 max-w-6xl mx-auto w-full">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-full shadow-lg shadow-emerald-500/20" pulse>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                                Live on Mantle Sepolia
                            </Badge>
                            <Badge variant="default" className="px-4 py-2 text-sm font-medium rounded-full shadow-lg shadow-blue-500/20">
                                <Star className="w-3 h-3 mr-1" />
                                Beta v1.0
                            </Badge>
                        </div>
                        
                        <div className="space-y-6">
                            <motion.h1 
                                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] font-inter"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                                    Trustless Yield
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 bg-clip-text text-transparent">
                                    Verification
                                </span>
                            </motion.h1>
                            
                            <motion.p 
                                className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-light"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                The first protocol enabling <span className="text-white font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Real World Asset (RWA)</span> issuers 
                                to prove yield generation on-chain through cryptographic verification and economic consensus.
                            </motion.p>
                        </div>

                        <motion.div 
                            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <Link href="/investor">
                                <Button 
                                    size="xl" 
                                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-0 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <PieChart className="w-5 h-5 mr-2" />
                                    Start Investing
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            
                            <Link href="/issuer">
                                <Button 
                                    variant="outline" 
                                    size="xl" 
                                    className="group relative overflow-hidden bg-slate-900/30 hover:bg-slate-800/50 border-2 border-slate-600/50 hover:border-slate-400/70 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-slate-900/25"
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-2" />
                                    Issuer Portal
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Enhanced Stats Section */}
                        <motion.div 
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <motion.div 
                                className="text-center space-y-2 p-4 rounded-xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">100%</div>
                                <div className="text-sm text-slate-400">Transparent</div>
                            </motion.div>
                            <motion.div 
                                className="text-center space-y-2 p-4 rounded-xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">0</div>
                                <div className="text-sm text-slate-400">Trust Required</div>
                            </motion.div>
                            <motion.div 
                                className="text-center space-y-2 p-4 rounded-xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
                                <div className="text-sm text-slate-400">Verification</div>
                            </motion.div>
                            <motion.div 
                                className="text-center space-y-2 p-4 rounded-xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">∞</div>
                                <div className="text-sm text-slate-400">Scalability</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </AnimatedSection>

                {/* Protocol Flow Section */}
                <AnimatedSection className="w-full py-32 px-4" delay={0.2}>
                    <div className="max-w-7xl mx-auto space-y-20">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-blue-400" />
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Protocol Flow</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">How YieldProof Works</h2>
                            <p className="text-slate-400 font-light text-xl max-w-3xl mx-auto">
                                End-to-end verification powered by cryptographic proofs, economic staking, and decentralized consensus.
                            </p>
                        </div>

                        {/* Interactive Flow Diagram */}
                        <div className="relative">
                            {/* Desktop Flow - Horizontal */}
                            <div className="hidden lg:block">
                                <div className="relative flex items-center justify-between max-w-6xl mx-auto">
                                    {/* Enhanced Connecting Lines */}
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2 z-0 rounded-full">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse rounded-full" />
                                    </div>
                                    
                                    {/* Enhanced Progress Indicators */}
                                    <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center -translate-y-1/2 z-10 px-20">
                                        <motion.div 
                                            className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/50"
                                            animate={{ 
                                                scale: [1, 1.3, 1],
                                                boxShadow: ["0 0 10px rgba(59, 130, 246, 0.5)", "0 0 20px rgba(59, 130, 246, 0.8)", "0 0 10px rgba(59, 130, 246, 0.5)"]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                                        />
                                        <motion.div 
                                            className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50"
                                            animate={{ 
                                                scale: [1, 1.3, 1],
                                                boxShadow: ["0 0 10px rgba(168, 85, 247, 0.5)", "0 0 20px rgba(168, 85, 247, 0.8)", "0 0 10px rgba(168, 85, 247, 0.5)"]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        />
                                        <motion.div 
                                            className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50"
                                            animate={{ 
                                                scale: [1, 1.3, 1],
                                                boxShadow: ["0 0 10px rgba(16, 185, 129, 0.5)", "0 0 20px rgba(16, 185, 129, 0.8)", "0 0 10px rgba(16, 185, 129, 0.5)"]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                        />
                                    </div>

                                    {/* Step Cards */}
                                    <StaggeredContainer className="flex justify-between w-full relative z-20" staggerDelay={0.2}>
                                        {/* Step 1 */}
                                        <motion.div
                                            whileHover={{ y: -10, scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Card className="relative w-64 p-6 text-center group cursor-pointer border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/30">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative space-y-4">
                                                    <motion.div 
                                                        className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30 mx-auto"
                                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        1
                                                    </motion.div>
                                                    <motion.div 
                                                        className="w-14 h-14 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto border border-slate-600/30"
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <FileCheck2 className="w-7 h-7 text-blue-300" />
                                                    </motion.div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-xl font-semibold text-white">Submit Proof</h3>
                                                        <p className="text-slate-400 text-sm leading-relaxed">
                                                            Issuer submits yield documentation with cryptographic hash recorded immutably on-chain.
                                                        </p>
                                                    </div>
                                                    <motion.div 
                                                        className="flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </motion.div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        {/* Step 2 */}
                                        <motion.div
                                            whileHover={{ y: -10, scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Card className="relative w-64 p-6 text-center group cursor-pointer border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/30">
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative space-y-4">
                                                    <motion.div 
                                                        className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30 mx-auto"
                                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        2
                                                    </motion.div>
                                                    <motion.div 
                                                        className="w-14 h-14 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto border border-slate-600/30"
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <Users className="w-7 h-7 text-purple-300" />
                                                    </motion.div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-xl font-semibold text-white">Attest & Stake</h3>
                                                        <p className="text-slate-400 text-sm leading-relaxed">
                                                            Independent verifiers inspect data and stake MNT tokens to attest validity and accuracy.
                                                        </p>
                                                    </div>
                                                    <motion.div 
                                                        className="flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </motion.div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        {/* Step 3 */}
                                        <motion.div
                                            whileHover={{ y: -10, scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Card className="relative w-64 p-6 text-center group cursor-pointer border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/30">
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative space-y-4">
                                                    <motion.div 
                                                        className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/30 mx-auto"
                                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        3
                                                    </motion.div>
                                                    <motion.div 
                                                        className="w-14 h-14 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto border border-slate-600/30"
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <Database className="w-7 h-7 text-emerald-300" />
                                                    </motion.div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-xl font-semibold text-white">Consensus</h3>
                                                        <p className="text-slate-400 text-sm leading-relaxed">
                                                            Once stake threshold is met, the claim achieves <span className="text-emerald-400 font-semibold">Verified</span> status.
                                                        </p>
                                                    </div>
                                                    <motion.div 
                                                        className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </motion.div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        {/* Step 4 */}
                                        <motion.div
                                            whileHover={{ y: -10, scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Card className="relative w-64 p-6 text-center group cursor-pointer border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/30">
                                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative space-y-4">
                                                    <motion.div 
                                                        className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-amber-500/30 mx-auto"
                                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        4
                                                    </motion.div>
                                                    <motion.div 
                                                        className="w-14 h-14 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto border border-slate-600/30"
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <Banknote className="w-7 h-7 text-amber-300" />
                                                    </motion.div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-xl font-semibold text-white">Yield Unlocked</h3>
                                                        <p className="text-slate-400 text-sm leading-relaxed">
                                                            Investors can confidently deposit into verified vaults with full transparency.
                                                        </p>
                                                    </div>
                                                    <motion.div 
                                                        className="flex items-center justify-center text-emerald-400"
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </motion.div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </StaggeredContainer>
                                </div>
                            </div>

                            {/* Mobile/Tablet Flow - Vertical */}
                            <div className="lg:hidden">
                                <div className="relative max-w-md mx-auto">
                                    {/* Vertical Connecting Line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 -translate-x-1/2 z-0">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/50 to-transparent animate-pulse" />
                                    </div>

                                    <StaggeredContainer className="space-y-12 relative z-10" staggerDelay={0.3}>
                                        {/* Mobile Step Cards */}
                                        {[
                                            { num: 1, icon: FileCheck2, title: "Submit Proof", desc: "Issuer submits yield documentation with cryptographic hash recorded immutably on-chain." },
                                            { num: 2, icon: Users, title: "Attest & Stake", desc: "Independent verifiers inspect data and stake MNT tokens to attest validity and accuracy." },
                                            { num: 3, icon: Database, title: "Consensus", desc: "Once stake threshold is met, the claim achieves Verified status." },
                                            { num: 4, icon: Banknote, title: "Yield Unlocked", desc: "Investors can confidently deposit into verified vaults with full transparency." }
                                        ].map((step, index) => (
                                            <motion.div
                                                key={step.num}
                                                whileHover={{ scale: 1.02 }}
                                                className="relative"
                                            >
                                                {/* Step Connector Dot */}
                                                <div className="absolute left-1/2 top-8 w-4 h-4 bg-slate-600 rounded-full border-4 border-slate-950 -translate-x-1/2 z-20" />
                                                
                                                <Card className="relative ml-8 p-6 border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
                                                    <div className="flex items-start gap-4">
                                                        <motion.div 
                                                            className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg flex-shrink-0"
                                                            whileHover={{ rotate: 5, scale: 1.1 }}
                                                        >
                                                            {step.num}
                                                        </motion.div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                                            <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </StaggeredContainer>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Details Section */}
                        <motion.div 
                            className="mt-16 p-8 bg-slate-800/20 rounded-2xl border border-slate-700/30 backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <div className="text-center space-y-6">
                                <div className="flex items-center justify-center gap-2">
                                    <Zap className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Key Benefits</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    <motion.div 
                                        className="text-center space-y-3"
                                        whileHover={{ y: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                            <Lock className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">Cryptographic Security</h4>
                                        <p className="text-slate-400 text-sm">Immutable on-chain proofs ensure data integrity</p>
                                    </motion.div>
                                    
                                    <motion.div 
                                        className="text-center space-y-3"
                                        whileHover={{ y: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                            <TrendingUp className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">Economic Consensus</h4>
                                        <p className="text-slate-400 text-sm">Stake-based verification aligns incentives</p>
                                    </motion.div>
                                    
                                    <motion.div 
                                        className="text-center space-y-3"
                                        whileHover={{ y: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                            <Globe className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-white">Decentralized Trust</h4>
                                        <p className="text-slate-400 text-sm">No single point of failure or control</p>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AnimatedSection>

                {/* Feature Cards */}
                <AnimatedSection className="w-full py-32 px-4" delay={0.4}>
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Award className="w-6 h-6 text-amber-400" />
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Ecosystem Roles</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">Built for Everyone</h2>
                            <p className="text-slate-400 font-light text-xl max-w-3xl mx-auto">
                                Whether you're issuing assets, verifying claims, or investing capital - YieldProof has you covered.
                            </p>
                        </div>

                        <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.2}>
                            <Link href="/issuer" className="group">
                                <Card className="relative h-full cursor-pointer overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative p-8 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                                            <LayoutDashboard className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white mb-4">For Issuers</CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative p-8 pt-0 text-center">
                                        <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                            Submit cryptographically verifiable proofs of off-chain yield generation for your RWA vaults with full transparency.
                                        </p>
                                        <div className="flex items-center justify-center text-blue-300 font-semibold group-hover:text-white transition-colors">
                                            <span>Submit Proof</span>
                                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/attestor" className="group">
                                <Card className="relative h-full cursor-pointer overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-900/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative p-8 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                                            <ShieldCheck className="w-8 h-8 text-emerald-300" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white mb-4">For Attestors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative p-8 pt-0 text-center">
                                        <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                            Verify documents and on-chain data to earn rewards while securing protocol integrity through economic consensus.
                                        </p>
                                        <div className="flex items-center justify-center text-emerald-300 font-semibold group-hover:text-white transition-colors">
                                            <span>Verify Claims</span>
                                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/investor" className="group">
                                <Card className="relative h-full cursor-pointer overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative p-8 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                                            <PieChart className="w-8 h-8 text-purple-300" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white mb-4">For Investors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative p-8 pt-0 text-center">
                                        <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                            Deposit into verified RWA vaults with complete transparency on yield sources and real-time verification status.
                                        </p>
                                        <div className="flex items-center justify-center text-purple-300 font-semibold group-hover:text-white transition-colors">
                                            <span>View Vaults</span>
                                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </StaggeredContainer>
                    </div>
                </AnimatedSection>

                {/* Trust & Security Section */}
                <AnimatedSection className="w-full py-32 px-4" delay={0.6}>
                    <div className="max-w-6xl mx-auto space-y-12">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Lock className="w-6 h-6 text-emerald-400" />
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Trust & Security</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">Built on Unbreakable Foundations</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Cryptographic Proofs</h3>
                                <p className="text-slate-400 text-sm">Immutable on-chain verification</p>
                            </div>
                            
                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <TrendingUp className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Economic Security</h3>
                                <p className="text-slate-400 text-sm">Stake-based consensus mechanism</p>
                            </div>
                            
                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <Globe className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Decentralized Network</h3>
                                <p className="text-slate-400 text-sm">No single point of failure</p>
                            </div>
                            
                            <div className="text-center space-y-4 p-6">
                                <div className="w-12 h-12 bg-slate-700/30 rounded-xl flex items-center justify-center mx-auto">
                                    <Zap className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Real-time Updates</h3>
                                <p className="text-slate-400 text-sm">Instant verification status</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* CTA Section */}
                <AnimatedSection className="w-full py-32 px-4" delay={0.8}>
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                                Ready to Transform RWA Verification?
                            </h2>
                            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                                Join the future of transparent, verifiable yield generation. Start building trust through cryptographic proof.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                            <Link href="/investor">
                                <Button 
                                    size="xl" 
                                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-10 py-5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-0 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Get Started Now
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            
                            <Link href="/showcase">
                                <Button 
                                    variant="outline" 
                                    size="xl" 
                                    className="group relative overflow-hidden bg-slate-900/30 hover:bg-slate-800/50 border-2 border-slate-600/50 hover:border-slate-400/70 text-white font-semibold px-10 py-5 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-slate-900/25"
                                >
                                    <Globe className="w-5 h-5 mr-2" />
                                    View Demo
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
}
