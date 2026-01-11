import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowRight, ShieldCheck, PieChart, LayoutDashboard, FileCheck2, Database, Users, Banknote } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-20 animate-in fade-in zoom-in-95 duration-700">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl">
                <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm text-slate-300">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    Live on Mantle Sepolia
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    Trustless Yield Verification
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    YieldProof enables Real World Asset (RWA) issuers to prove yield generation on-chain,
                    unlocking transparent and verified investment opportunities.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Link href="/investor">
                        <Button className="h-12 px-8 text-lg bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">
                            Start Investing
                        </Button>
                    </Link>
                    <Link href="/issuer">
                        <Button variant="outline" className="h-12 px-8 text-lg border-slate-700 bg-slate-900/50">
                            Issuer Portal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Protocol Flow Section (NEW) */}
            <div className="w-full max-w-6xl px-4 space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white">How YieldProof Works</h2>
                    <p className="text-slate-400">End-to-end verification powered by cryptographic proofs and economic staking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-indigo-500/50 via-emerald-500/50 to-blue-500/50 -z-10" />

                    {/* Step 1 */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg z-10">1</div>
                        <FileCheck2 className="w-8 h-8 text-indigo-400" />
                        <div>
                            <h3 className="font-semibold text-white mb-1">Submit Proof</h3>
                            <p className="text-sm text-slate-400 leading-snug">Issuer submits yield docs. Hash recorded on-chain.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg z-10">2</div>
                        <Users className="w-8 h-8 text-indigo-400" />
                        <div>
                            <h3 className="font-semibold text-white mb-1">Attest & Stake</h3>
                            <p className="text-sm text-slate-400 leading-snug">Verifiers inspect data and stake MNT to attest validity.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg z-10">3</div>
                        <Database className="w-8 h-8 text-emerald-400" />
                        <div>
                            <h3 className="font-semibold text-white mb-1">Consensus</h3>
                            <p className="text-sm text-slate-400 leading-snug">Once stake threshold is met, the claim is <strong>Verified</strong>.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center gap-4 relative">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg z-10">4</div>
                        <Banknote className="w-8 h-8 text-blue-400" />
                        <div>
                            <h3 className="font-semibold text-white mb-1">Yield Unlocked</h3>
                            <p className="text-sm text-slate-400 leading-snug">Investors can now safely deposit into the verified vault.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
                {/* ... existing cards ... */}
                <Link href="/issuer" className="group">
                    <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer group-hover:-translate-y-1">
                        <CardHeader>
                            <LayoutDashboard className="w-10 h-10 text-indigo-400 mb-2" />
                            <CardTitle className="text-white">For Issuers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4">
                                Submit cryptographically verifiable proofs of off-chain yield generation for your RWA vaults.
                            </p>
                            <div className="flex items-center text-sm font-medium text-indigo-400">
                                Submit Proof <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/attestor" className="group">
                    <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer group-hover:-translate-y-1">
                        <CardHeader>
                            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2" />
                            <CardTitle className="text-white">For Attestors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4">
                                Verify documents and on-chain data to earn rewards by securing the protocol integrity.
                            </p>
                            <div className="flex items-center text-sm font-medium text-emerald-400">
                                Verify Claims <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/investor" className="group">
                    <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer group-hover:-translate-y-1">
                        <CardHeader>
                            <PieChart className="w-10 h-10 text-blue-400 mb-2" />
                            <CardTitle className="text-white">For Investors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4">
                                Deposit into verified RWA vaults with 100% transparency on yield sources and verification status.
                            </p>
                            <div className="flex items-center text-sm font-medium text-blue-400">
                                View Vaults <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
