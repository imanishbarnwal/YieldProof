import { AlertTriangle, WifiOff } from 'lucide-react';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { MANTLE_SEPOLIA } from '@/app/config/contracts';

export function NetworkWarning() {
    const { isConnected, isCorrectNetwork } = useRequireWalletAndNetwork();

    if (!isConnected) {
        return (
            <div className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-6 flex items-center gap-3 animate-in fade-in">
                <div className="p-2 bg-secondary/20 rounded-full">
                    <WifiOff className="w-5 h-5 text-secondary" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Wallet Disconnected</h3>
                    <p className="text-xs text-muted-foreground">Please connect your wallet to interact with the protocol.</p>
                </div>
            </div>
        );
    }

    if (!isCorrectNetwork) {
        return (
            <div className="w-full bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 flex items-center gap-3 animate-in fade-in">
                <div className="p-2 bg-accent/20 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Wrong Network</h3>
                    <p className="text-xs text-muted-foreground">Please switch to Mantle Sepolia (Chain ID: {MANTLE_SEPOLIA.chainId}).</p>
                </div>
            </div>
        );
    }

    return null;
}
