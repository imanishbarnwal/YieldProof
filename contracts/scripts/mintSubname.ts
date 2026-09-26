import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Minting ENS subname with wallet:", signer.address);

    const ensManagerAddress = "0xB300d6D41c2f9a8fa3Fa3F0544EF829e4a33C12f";
    const ensManager = await ethers.getContractAt("YieldProofENSManager", ensManagerAddress, signer);

    console.log("Sending autoCreateAttestorSubname transaction on Mantle Sepolia...");
    const tx = await ensManager.autoCreateAttestorSubname();
    console.log("Transaction Hash:", tx.hash);
    
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt?.blockNumber);

    const subname = await ensManager.attestorToSubname(signer.address);
    console.log("==================================================");
    console.log("🎉 SUCCESS! Minted ENS Subname:", subname);
    console.log("Attestor Address:", signer.address);
    console.log("ENS Manager:", ensManagerAddress);
    console.log("==================================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
