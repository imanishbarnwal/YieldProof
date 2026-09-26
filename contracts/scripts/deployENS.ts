import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying YieldProofENSManager with:", deployer.address);

    const attestorRegistryAddress = "0x1c152de6172BDB84b0871731Ef494d12C7691C07";
    const parentName = "yieldproof.eth";

    const YieldProofENSManager = await ethers.getContractFactory("YieldProofENSManager");
    const ensManager = await YieldProofENSManager.deploy(
        attestorRegistryAddress,
        parentName
    );
    await ensManager.waitForDeployment();
    const ensManagerAddress = await ensManager.getAddress();

    console.log("=========================================");
    console.log("YieldProofENSManager deployed successfully!");
    console.log("Contract Address:", ensManagerAddress);
    console.log("AttestorRegistry:", attestorRegistryAddress);
    console.log("Parent Domain:", parentName);
    console.log("=========================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
