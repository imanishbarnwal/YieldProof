"use client";

import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/app/config/contracts';
import { type Abi } from 'viem';
import { AlertTriangle } from 'lucide-react';

export function ContractGuardrail() {
    const [isVisible, setIsVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Try to read a constant from the contract. If this fails, the contract is likely un-deployed or address is wrong.
    const { data, isError, error, isLoading } = useReadContract({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'MIN_REQUIRED_ATTESTORS',
        query: {
            retry: 1, // Don't retry too many times
        }
    });

    useEffect(() => {
        if (isError) {
            console.error("Critical Contract Error:", error);
            setErrorMessage("Cannot connect to YieldProof contract. Address mismatch or not deployed.");
            setIsVisible(true);
        } else if (!isLoading && data === undefined) {
            // Sometimes data is undefined without explicit error if the node is down
            // But usually isError catches it. 
        }
    }, [isError, error, isLoading, data]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-3 shadow-xl flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <div className="font-semibold">
                SYSTEM ERROR: {errorMessage}
            </div>
            <div className="text-sm bg-destructive/80 px-2 py-1 rounded font-mono">
                {CONTRACTS.YieldProof.address}
            </div>
        </div>
    );
}
