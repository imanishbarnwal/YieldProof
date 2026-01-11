export const DEMO_MODE = true;

export const MOCK_CLAIMS = [
    {
        id: 1,
        assetId: "RWA-2024-001",
        issuer: "0x1234...5678",
        yieldAmount: "5000 USDC",
        period: "Q1 2024",
        status: "verified",
        totalStake: "12.5 ETH",
        documentHash: "0xabc...def",
        timestamp: "2024-01-15",
    },
    {
        id: 2,
        assetId: "RWA-2024-002",
        issuer: "0x8765...4321",
        yieldAmount: "7500 USDC",
        period: "Q1 2024",
        status: "attested",
        totalStake: "8.0 ETH",
        documentHash: "0x123...456",
        timestamp: "2024-01-20",
    },
    {
        id: 3,
        assetId: "RWA-2024-003",
        issuer: "0x1234...5678",
        yieldAmount: "3000 USDC",
        period: "Jan 2024",
        status: "pending",
        totalStake: "2.1 ETH",
        documentHash: "0xdef...789",
        timestamp: "2024-01-25",
    },
] as const;

export const MOCK_STATS = {
    totalValueLocked: "$1.2M",
    activeVaults: 12,
    totalYieldDistributed: "$145K",
    minVerificationThreshold: "5.0 MNT",
};
