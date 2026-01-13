"use client";

import { Loader2 } from 'lucide-react';

export function Loading() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Loading YieldProof</h3>
                    <p className="text-slate-400 text-sm">Initializing Web3 connections...</p>
                </div>
            </div>
        </div>
    );
}

export default Loading;