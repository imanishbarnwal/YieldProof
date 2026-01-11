export const DEMO_MODE = false;

// Keeping types for reference but clearing static data
export interface DemoClaim {
    id: number;
    assetId: string;
    issuer: string;
    yieldAmount: string;
    period: string;
    status: 'pending' | 'attested' | 'verified' | 'rejected';
    totalStake: string;
    documentHash: string;
    timestamp: string;
}

export const MOCK_CLAIMS: DemoClaim[] = [];

export const MOCK_STATS = {
    totalValueLocked: "0.00",
    activeVaults: 0,
    totalYieldDistributed: "0.00",
    minVerificationThreshold: "10.0 MNT",
};
