import { useAccount, useChainId } from 'wagmi';
import { MANTLE_SEPOLIA } from '@/app/config/contracts';
import { useEffect, useState } from 'react';

export function useRequireWalletAndNetwork() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isCorrectNetwork = chainId === MANTLE_SEPOLIA.chainId;
    const isReady = isClient && isConnected && isCorrectNetwork;

    return {
        isConnected: isClient && isConnected,
        isCorrectNetwork: isClient ? isCorrectNetwork : false,
        address,
        isReady,
        chainId
    };
}
