import { AlertTriangle, WifiOff } from 'lucide-react';
import { useRequireWalletAndNetwork } from '@/hooks/useRequireWalletAndNetwork';
import { MANTLE_SEPOLIA } from '@/app/config/contracts';

export function NetworkWarning() {
    const { isConnected, isCorrectNetwork } = useRequireWalletAndNetwork();

    if (!isConnected) {
        return (
            <div className="w-full bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mb-6 flex items-center gap-3 animate-in fade-in">
                <div className="p-2 bg-indigo-900/40 rounded-full">
                    <WifiOff className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Wallet Disconnected</h3>
                    <p className="text-xs text-slate-400">Please connect your wallet to interact with the protocol.</p>
                </div>
            </div>
        );
    }

    if (!isCorrectNetwork) {
        return (
            <div className="w-full bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6 flex items-center gap-3 animate-in fade-in">
                <div className="p-2 bg-amber-900/40 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Wrong Network</h3>
                    <p className="text-xs text-slate-400">Please switch to Mantle Sepolia (Chain ID: {MANTLE_SEPOLIA.chainId}).</p>
                </div>
            </div>
        );
    }

    return null;
}
