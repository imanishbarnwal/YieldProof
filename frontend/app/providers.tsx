"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mantleSepolia } from '@/app/config/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import Loading from '@/components/ui/Loading';

const config = getDefaultConfig({
    appName: 'YieldProof',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3b8bc031e63478d0c306c959f11467b3',
    chains: [mantleSepolia],
    ssr: true,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Disable queries during SSR to prevent fetch issues
            enabled: typeof window !== 'undefined',
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
                // Don't retry during SSR
                if (typeof window === 'undefined') return false;
                return failureCount < 3;
            },
        },
    },
});

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<Loading />}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                        theme={darkTheme({
                            accentColor: "#6366f1",
                            accentColorForeground: "white",
                            borderRadius: "large",
                        })}
                        modalSize="compact"
                        initialChain={mantleSepolia}
                    >
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </Suspense>
    );
}
