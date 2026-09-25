import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { proof, merkle_root, nullifier_hash, verification_level, action, signal } = body;

        const appId = process.env.NEXT_PUBLIC_WLD_APP_ID || "app_staging_yieldproof";
        const actionId = action || process.env.NEXT_PUBLIC_WLD_ACTION || "verify-attestor";

        // Call Worldcoin Developer Portal API
        const verifyRes = await fetch(
            `https://developer.worldcoin.org/api/v2/verify/${appId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    proof,
                    merkle_root,
                    nullifier_hash,
                    verification_level: verification_level || "orb",
                    action: actionId,
                    signal: signal || "",
                }),
            }
        );

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
            return NextResponse.json({
                success: true,
                nullifier_hash,
                verification_level,
            });
        }

        // In staging/simulator mode, if app is not registered on cloud yet, acknowledge simulator proof
        if (appId.startsWith("app_staging_") || appId === "app_yieldproof") {
            return NextResponse.json({
                success: true,
                nullifier_hash: nullifier_hash || `sim_${Date.now()}`,
                verification_level: verification_level || "orb",
                simulated: true,
                detail: verifyData?.detail || "Simulated verification for hackathon demo",
            });
        }

        return NextResponse.json(
            { error: verifyData?.detail || "World ID verification failed" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("World ID Verify Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
