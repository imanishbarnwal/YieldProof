import { WorldIDVerificationPayload, WorldIDVerificationResponse } from "./types";

/**
 * Verifies a World ID proof via the YieldProof verification API route
 */
export async function verifyWorldIDProof(
    payload: WorldIDVerificationPayload
): Promise<WorldIDVerificationResponse> {
    const res = await fetch("/api/world-id/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data: WorldIDVerificationResponse = await res.json();
    if (!res.ok && !data.success) {
        throw new Error(data.error || "World ID verification failed");
    }

    return data;
}
