"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface TransactionProgressProps {
    isVisible: boolean;
    status: 'pending' | 'confirming' | 'success' | 'error';
}

export function TransactionProgress({
    isVisible,
    status
}: TransactionProgressProps) {
    const isComplete = status === 'success' || status === 'error';
    const isPulsing = status === 'pending' || status === 'confirming';

    const getBarColor = () => {
        switch (status) {
            case 'pending':
                return 'bg-primary/70';
            case 'confirming':
                return 'bg-primary';
            case 'success':
                return 'bg-emerald-500';
            case 'error':
                return 'bg-destructive';
        }
    };

    const getWidth = () => {
        switch (status) {
            case 'pending':
                return '15%';
            case 'confirming':
                return '70%';
            case 'success':
            case 'error':
                return '100%';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed top-16 left-0 right-0 z-50">
                    {/* Progress bar */}
                    <div className="h-1 bg-transparent relative">
                        <motion.div
                            className={`h-full ${getBarColor()} relative`}
                            initial={{ width: '0%' }}
                            animate={{ width: getWidth() }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: isComplete ? 0.3 : 0.5,
                                ease: 'easeOut'
                            }}
                        >
                            {/* Pulse overlay for pending/confirming states */}
                            {isPulsing && (
                                <motion.div
                                    className="absolute inset-0 bg-white/30"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{
                                        duration: 1.5,
                                        ease: 'easeInOut',
                                        repeat: Infinity,
                                        repeatDelay: 0.5
                                    }}
                                />
                            )}
                        </motion.div>
                    </div>

                    {/* Success/Error tooltip */}
                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, delay: 0.2 }}
                                className="absolute left-1/2 -translate-x-1/2 top-2"
                            >
                                <div className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg
                                    ${status === 'success'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-destructive text-white'
                                    }
                                `}>
                                    {status === 'success' ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Success</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            <span>Failed</span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
}
