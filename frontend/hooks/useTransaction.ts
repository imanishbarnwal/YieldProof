import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useTransactionProgress } from '@/contexts/TransactionContext';
import { useCallback, useEffect, useRef } from 'react';

interface UseTransactionOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function useTransaction(options: UseTransactionOptions = {}) {
    const { showTransaction, hideTransaction } = useTransactionProgress();
    const { writeContract, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash });

    const isLoading = isWritePending || isConfirming;
    const error = writeError || confirmError;

    // Track if we've already handled success/error to prevent duplicate calls
    const hasHandledSuccess = useRef(false);
    const hasHandledError = useRef(false);
    const currentHash = useRef<string | null>(null);

    // Reset tracking when hash changes (new transaction)
    useEffect(() => {
        if (hash && hash !== currentHash.current) {
            currentHash.current = hash;
            hasHandledSuccess.current = false;
            hasHandledError.current = false;
        }
    }, [hash]);

    // Handle transaction states - show progress bar
    useEffect(() => {
        if (isWritePending) {
            showTransaction({ status: 'pending' });
        } else if (isConfirming && hash) {
            showTransaction({ status: 'confirming', txHash: hash });
        }
    }, [isWritePending, isConfirming, hash, showTransaction]);

    // Handle success
    useEffect(() => {
        if (isConfirmed && !hasHandledSuccess.current) {
            hasHandledSuccess.current = true;

            showTransaction({ status: 'success' });

            // Hide progress after 1.5 seconds
            setTimeout(() => {
                hideTransaction();
                reset();
            }, 1500);

            options.onSuccess?.();
        }
    }, [isConfirmed, showTransaction, hideTransaction, reset, options.onSuccess]);

    // Handle errors
    useEffect(() => {
        if (error && !hasHandledError.current) {
            hasHandledError.current = true;

            showTransaction({ status: 'error' });

            // Hide progress after 2 seconds
            setTimeout(() => {
                hideTransaction();
                reset();
            }, 2000);

            options.onError?.(error as Error);
        }
    }, [error, showTransaction, hideTransaction, reset, options.onError]);

    const executeTransaction = useCallback((contractCall: Parameters<typeof writeContract>[0]) => {
        // Reset tracking for new transaction
        hasHandledSuccess.current = false;
        hasHandledError.current = false;
        currentHash.current = null;
        writeContract(contractCall);
    }, [writeContract]);

    return {
        executeTransaction,
        isLoading,
        isConfirmed,
        error,
        hash
    };
}
