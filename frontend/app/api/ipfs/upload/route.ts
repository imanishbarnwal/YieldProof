import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from "pinata-web3";

export const config = {
    api: {
        bodyParser: false,
    },
};

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const upload = await pinata.upload.file(file);
        return NextResponse.json(upload.IpfsHash, { status: 200 });

    } catch (e: any) {
        console.error("IPFS Upload Error:", e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
