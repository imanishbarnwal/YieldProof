export interface WorldIDProofResult {
    merkle_root: string;
    nullifier_hash: string;
    proof: string;
    verification_level: "orb" | "device";
}

export interface WorldIDVerificationPayload {
    proof: string;
    merkle_root: string;
    nullifier_hash: string;
    verification_level?: "orb" | "device";
    action: string;
    signal?: string;
}

export interface WorldIDVerificationResponse {
    success: boolean;
    nullifier_hash?: string;
    verification_level?: string;
    error?: string;
    simulated?: boolean;
    detail?: string;
}
