"use client"

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface TransactionState {
    isVisible: boolean;
    status: 'pending' | 'confirming' | 'success' | 'error';
    message?: string;
    txHash?: string;
    progress?: number;
}

interface TransactionContextType {
    transactionState: TransactionState;
    showTransaction: (state: Omit<TransactionState, 'isVisible'>) => void;
    updateTransaction: (updates: Partial<TransactionState>) => void;
    hideTransaction: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [transactionState, setTransactionState] = useState<TransactionState>({
        isVisible: false,
        status: 'pending'
    });

    const showTransaction = useCallback((state: Omit<TransactionState, 'isVisible'>) => {
        setTransactionState({
            ...state,
            isVisible: true
        });
    }, []);

    const updateTransaction = useCallback((updates: Partial<TransactionState>) => {
        setTransactionState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    const hideTransaction = useCallback(() => {
        setTransactionState(prev => ({
            ...prev,
            isVisible: false
        }));

        // Clean up state after animation completes
        setTimeout(() => {
            setTransactionState({
                isVisible: false,
                status: 'pending'
            });
        }, 300);
    }, []);

    return (
        <TransactionContext.Provider value={{
            transactionState,
            showTransaction,
            updateTransaction,
            hideTransaction
        }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactionProgress() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactionProgress must be used within a TransactionProvider');
    }
    return context;
}