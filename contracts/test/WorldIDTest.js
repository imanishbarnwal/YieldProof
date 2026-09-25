const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("World ID Sybil Resistance Integration", function () {
    let attestorRegistry, yieldProof, yieldVault, mockWorldID;
    let owner, issuer, attestor1, attestor2, attestor3, attacker;

    const sampleProof = [0, 1, 2, 3, 4, 5, 6, 7];
    const sampleRoot = 123456789;
    const nullifier1 = 987654321;
    const nullifier2 = 555666777;
    const nullifier3 = 111222333;

    beforeEach(async function () {
        [owner, issuer, attestor1, attestor2, attestor3, attacker] = await ethers.getSigners();

        // Deploy MockWorldID
        const MockWorldID = await ethers.getContractFactory("MockWorldID");
        mockWorldID = await MockWorldID.deploy();
        await mockWorldID.waitForDeployment();

        // Deploy AttestorRegistry
        const AttestorRegistry = await ethers.getContractFactory("AttestorRegistry");
        attestorRegistry = await AttestorRegistry.deploy();
        await attestorRegistry.waitForDeployment();

        // Deploy YieldProof
        const YieldProof = await ethers.getContractFactory("YieldProof");
        yieldProof = await YieldProof.deploy(await attestorRegistry.getAddress());
        await yieldProof.waitForDeployment();

        // Deploy YieldVault
        const YieldVault = await ethers.getContractFactory("YieldVault");
        yieldVault = await YieldVault.deploy(
            await yieldProof.getAddress(),
            await attestorRegistry.getAddress(),
            ethers.parseEther("1.0")
        );
        await yieldVault.waitForDeployment();

        // Configure World ID on AttestorRegistry (enables requireWorldID = true)
        await attestorRegistry.setWorldID(
            await mockWorldID.getAddress(),
            "app_staging_yieldproof",
            "verify-attestor"
        );
    });

    it("1. Should block unverified wallet from registering when World ID is required", async function () {
        await expect(
            attestorRegistry.connect(attacker).register({ value: ethers.parseEther("1.0") })
        ).to.be.revertedWith("AttestorRegistry: World ID verification required");
    });

    it("2. Should allow verified wallet to register with World ID and stake", async function () {
        const stakeAmount = ethers.parseEther("1.0");

        await expect(
            attestorRegistry.connect(attestor1).registerWithWorldID(
                sampleRoot,
                nullifier1,
                sampleProof,
                { value: stakeAmount }
            )
        )
            .to.emit(attestorRegistry, "AttestorRegistered")
            .withArgs(attestor1.address)
            .and.to.emit(attestorRegistry, "AttestorWorldIDVerified")
            .withArgs(attestor1.address, nullifier1);

        const attestorData = await attestorRegistry.attestors(attestor1.address);
        expect(attestorData.isRegistered).to.be.true;
        expect(attestorData.stake).to.equal(stakeAmount);
        expect(await attestorRegistry.isWorldIdVerified(attestor1.address)).to.be.true;
        expect(await attestorRegistry.nullifierHashes(nullifier1)).to.be.true;
    });

    it("3. Should prevent duplicate World identity from creating multiple independent attestor wallets", async function () {
        // Attestor 1 registers with nullifier1
        await attestorRegistry.connect(attestor1).registerWithWorldID(
            sampleRoot,
            nullifier1,
            sampleProof,
            { value: ethers.parseEther("1.0") }
        );

        // Attacker attempts to reuse nullifier1 with a different wallet
        await expect(
            attestorRegistry.connect(attacker).registerWithWorldID(
                sampleRoot,
                nullifier1,
                sampleProof,
                { value: ethers.parseEther("1.0") }
            )
        ).to.be.revertedWith("AttestorRegistry: World ID already used");
    });

    it("4. Should reject registration when World ID proof verification fails", async function () {
        await mockWorldID.setShouldPass(false);

        await expect(
            attestorRegistry.connect(attacker).registerWithWorldID(
                sampleRoot,
                999999,
                sampleProof,
                { value: ethers.parseEther("1.0") }
            )
        ).to.be.revertedWith("MockWorldID: invalid proof");
    });

    it("5. Should block unverified attestors from attesting to claims", async function () {
        // Submit claim
        const fee = ethers.parseEther("0.9");
        await yieldProof.connect(issuer).submitClaim(
            "RWA-TBILL-2026",
            "Q1-2026",
            ethers.parseEther("5.0"),
            "ipfs://test-doc",
            { value: fee }
        );

        // Temporarily disable requireWorldID to register an unverified account, then re-enable
        await attestorRegistry.setRequireWorldID(false);
        await attestorRegistry.connect(attacker).register({ value: ethers.parseEther("1.0") });
        await attestorRegistry.setRequireWorldID(true);

        // Attacker attempts to attest without World ID verification
        await expect(
            attestorRegistry.connect(attacker).attestToClaim(0)
        ).to.be.revertedWith("AttestorRegistry: World ID verification required to attest");
    });

    it("6. Should allow 3 World ID verified attestors to attest, finalize, and claim rewards", async function () {
        // Register 3 World ID verified attestors
        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: ethers.parseEther("2.0") });
        await attestorRegistry.connect(attestor2).registerWithWorldID(sampleRoot, nullifier2, sampleProof, { value: ethers.parseEther("2.0") });
        await attestorRegistry.connect(attestor3).registerWithWorldID(sampleRoot, nullifier3, sampleProof, { value: ethers.parseEther("2.0") });

        // Submit claim with fee
        const fee = ethers.parseEther("0.9");
        await yieldProof.connect(issuer).submitClaim(
            "RWA-TBILL-2026",
            "Q1-2026",
            ethers.parseEther("5.0"),
            "ipfs://test-doc",
            { value: fee }
        );

        // All 3 attest
        await attestorRegistry.connect(attestor1).attestToClaim(0);
        await attestorRegistry.connect(attestor2).attestToClaim(0);
        await attestorRegistry.connect(attestor3).attestToClaim(0);

        // Finalize and reward
        await attestorRegistry.finalizeAndReward(0);

        // Verify rewards accrued
        expect(await attestorRegistry.rewardsEarned(attestor1.address)).to.equal(ethers.parseEther("0.3"));
        expect(await attestorRegistry.rewardsEarned(attestor2.address)).to.equal(ethers.parseEther("0.3"));
        expect(await attestorRegistry.rewardsEarned(attestor3.address)).to.equal(ethers.parseEther("0.3"));

        // Claim rewards
        await attestorRegistry.connect(attestor1).claimRewards();
        expect(await attestorRegistry.rewardsEarned(attestor1.address)).to.equal(0);
        expect(await attestorRegistry.totalRewardsClaimed(attestor1.address)).to.equal(ethers.parseEther("0.3"));
    });
});
