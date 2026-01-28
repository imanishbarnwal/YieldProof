'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/Button';
import { Loader2, Wallet } from 'lucide-react';

export function WalletButton() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <Button
                variant="outline"
                onClick={() => disconnect()}
                className="gap-2 border-success/20 bg-success/10 text-success hover:bg-success/20 hover:text-success-foreground"
            >
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {formatAddress(address)}
            </Button>
        );
    }

    return (
        <Button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
            className="gap-2 bg-muted text-foreground hover:bg-muted/80"
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Wallet className="w-4 h-4" />
            )}
            Connect Wallet
        </Button>
    );
}
