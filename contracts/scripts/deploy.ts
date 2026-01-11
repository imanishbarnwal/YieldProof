import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // 1. Deploy AttestorRegistry FIRST
    const AttestorRegistry = await ethers.getContractFactory("AttestorRegistry");
    const attestorRegistry = await AttestorRegistry.deploy();
    await attestorRegistry.waitForDeployment();
    const attestorRegistryAddress = await attestorRegistry.getAddress();
    console.log("AttestorRegistry:", attestorRegistryAddress);

    // 2. Deploy YieldProof with AttestorRegistry address
    const YieldProof = await ethers.getContractFactory("YieldProof");
    const yieldProof = await YieldProof.deploy(attestorRegistryAddress);
    await yieldProof.waitForDeployment();
    const yieldProofAddress = await yieldProof.getAddress();
    console.log("YieldProof:", yieldProofAddress);

    // 3. Deploy YieldVault with correct dependencies
    const YieldVault = await ethers.getContractFactory("YieldVault");
    const yieldVault = await YieldVault.deploy(
        yieldProofAddress,
        attestorRegistryAddress,
        ethers.parseEther("1") // minTotalStake
    );
    await yieldVault.waitForDeployment();
    const yieldVaultAddress = await yieldVault.getAddress();
    console.log("YieldVault:", yieldVaultAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
