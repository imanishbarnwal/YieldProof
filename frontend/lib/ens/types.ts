export interface ENSProfile {
    address: string;
    subname: string;
    label: string;
    isRegistered: boolean;
    isWorldIdVerified: boolean;
    trustScore: number;
    successfulAttestations: number;
    totalAttestations: number;
    stake: string;
    totalRewardsClaimed: string;
}

export interface ENSResolutionQuery {
    name: string;
}
