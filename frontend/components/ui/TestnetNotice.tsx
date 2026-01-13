"use client";

import { Info, X } from 'lucide-react';
import { useState } from 'react';

export function TestnetNotice() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-500/30 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Testnet Environment Notice
                        </h3>
                        <p className="text-xs text-blue-200/80">
                            MetaMask may show security warnings for this testnet deployment. This is expected and safe to proceed.
                            All contracts are verified on <a href="https://sepolia.mantlescan.xyz" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">Mantle Sepolia Explorer</a>.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-blue-300 hover:text-blue-100 transition-colors"
                        aria-label="Close notice"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
