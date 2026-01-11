import { NextRequest, NextResponse } from "next/server";

// Ensure Node.js runtime (required for Pinata upload)
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ✅ ENV CHECK (temporary – remove after verification)
    console.log(
      "Pinata key loaded:",
      !!process.env.PINATA_API_KEY,
      !!process.env.PINATA_API_SECRET
    );

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_API_SECRET;

    if (!pinataApiKey || !pinataSecretApiKey) {
      console.error("Pinata API keys missing");
      return NextResponse.json(
        { error: "Server configuration error: missing Pinata keys" },
        { status: 500 }
      );
    }

    // Build Pinata form payload
    const body = new FormData();
    body.append("file", file);

    // Optional metadata
    body.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name || "yield-proof-upload",
      })
    );

    // Optional options
    body.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );

    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
        body,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Pinata upload failed (${res.status}): ${errorText}`
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      cid: data.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    });
  } catch (error: any) {
    console.error("IPFS Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
