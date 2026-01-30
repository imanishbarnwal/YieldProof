"use client"

import { TransactionProvider, useTransactionProgress } from "@/contexts/TransactionContext";
import { TransactionProgress } from "@/components/ui/TransactionProgress";

function TransactionProgressWrapper() {
    const { transactionState } = useTransactionProgress();

    return (
        <TransactionProgress
            isVisible={transactionState.isVisible}
            status={transactionState.status}
        />
    );
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <TransactionProvider>
            <TransactionProgressWrapper />
            {children}
        </TransactionProvider>
    );
}
