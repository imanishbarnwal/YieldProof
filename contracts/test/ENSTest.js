const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ENSv2 Identity & Reputation Layer Integration", function () {
    let attestorRegistry, ensManager, mockWorldID;
    let owner, attestor1, attestor2, attacker;

    const sampleProof = [0, 1, 2, 3, 4, 5, 6, 7];
    const sampleRoot = 123456789;
    const nullifier1 = 987654321;
    const nullifier2 = 555666777;

    beforeEach(async function () {
        [owner, attestor1, attestor2, attacker] = await ethers.getSigners();

        // Deploy MockWorldID
        const MockWorldID = await ethers.getContractFactory("MockWorldID");
        mockWorldID = await MockWorldID.deploy();
        await mockWorldID.waitForDeployment();

        // Deploy AttestorRegistry
        const AttestorRegistry = await ethers.getContractFactory("AttestorRegistry");
        attestorRegistry = await AttestorRegistry.deploy();
        await attestorRegistry.waitForDeployment();

        // Configure World ID on AttestorRegistry
        await attestorRegistry.setWorldID(
            await mockWorldID.getAddress(),
            "app_staging_yieldproof",
            "verify-attestor"
        );

        // Deploy YieldProofENSManager
        const YieldProofENSManager = await ethers.getContractFactory("YieldProofENSManager");
        ensManager = await YieldProofENSManager.deploy(
            await attestorRegistry.getAddress(),
            "yieldproof.eth"
        );
        await ensManager.waitForDeployment();

        // Register attestor1 with World ID & stake
        await attestorRegistry.connect(attestor1).registerWithWorldID(
            sampleRoot,
            nullifier1,
            sampleProof,
            { value: ethers.parseEther("5.0") }
        );
    });

    it("1. Should allow a verified attestor to create an ENS subname", async function () {
        await expect(
            ensManager.connect(attestor1).createAttestorSubname("attestor-007")
        )
            .to.emit(ensManager, "SubnameCreated")
            .withArgs(
                attestor1.address,
                "attestor-007",
                "attestor-007.yieldproof.eth",
                await ensManager.subnode("attestor-007")
            );

        expect(await ensManager.attestorToSubname(attestor1.address)).to.equal("attestor-007.yieldproof.eth");
        expect(await ensManager.labelToAttestor("attestor-007")).to.equal(attestor1.address);
    });

    it("2. Should support automatic deterministic subname assignment", async function () {
        await ensManager.connect(attestor1).autoCreateAttestorSubname();
        expect(await ensManager.attestorToSubname(attestor1.address)).to.equal("attestor-1.yieldproof.eth");
    });

    it("3. Should prevent duplicate subname registration", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");

        // Register attestor2
        await attestorRegistry.connect(attestor2).registerWithWorldID(
            sampleRoot,
            nullifier2,
            sampleProof,
            { value: ethers.parseEther("2.0") }
        );

        // Attestor2 attempts to register the same label
        await expect(
            ensManager.connect(attestor2).createAttestorSubname("attestor-007")
        ).to.be.revertedWith("ENSManager: subname label already taken");
    });

    it("4. Should reject subname creation for non-attestor wallets", async function () {
        await expect(
            ensManager.connect(attacker).createAttestorSubname("attacker-001")
        ).to.be.revertedWith("ENSManager: caller is not a registered attestor");
    });

    it("5. Should resolve address via standard addr(node)", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");
        const node = await ensManager.subnode("attestor-007");

        expect(await ensManager.addr(node)).to.equal(attestor1.address);
    });

    it("6. Should dynamically resolve ENS text records directly from AttestorRegistry", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");
        const node = await ensManager.subnode("attestor-007");

        // Check text records
        expect(await ensManager.text(node, "app/yieldproof/status")).to.equal("Active");
        expect(await ensManager.text(node, "app/yieldproof/world-verified")).to.equal("true");
        expect(await ensManager.text(node, "app/yieldproof/stake")).to.equal("5 MNT");
        expect(await ensManager.text(node, "app/yieldproof/trust-score")).to.equal("0");
    });

    it("7. Should reject unauthorized text record modifications", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");
        const node = await ensManager.subnode("attestor-007");

        await expect(
            ensManager.connect(attacker).setText(node, "custom-key", "hacked")
        ).to.be.revertedWith("ENSManager: unauthorized to set text record");
    });

    it("8. Should allow owner/attestor to set custom text records", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");
        const node = await ensManager.subnode("attestor-007");

        await ensManager.connect(attestor1).setText(node, "url", "https://yieldproof.io");
        expect(await ensManager.text(node, "url")).to.equal("https://yieldproof.io");
    });

    it("9. Should return complete attestor profile via getAttestorProfile", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");

        const profile = await ensManager.getAttestorProfile("attestor-007");
        expect(profile.attestorAddress).to.equal(attestor1.address);
        expect(profile.fullSubname).to.equal("attestor-007.yieldproof.eth");
        expect(profile.isRegistered).to.be.true;
        expect(profile.isWorldIdVerified).to.be.true;
        expect(profile.stakeAmount).to.equal(ethers.parseEther("5.0"));
    });

    it("10. Should reject empty subname label", async function () {
        await expect(
            ensManager.connect(attestor1).createAttestorSubname("")
        ).to.be.revertedWith("ENSManager: label cannot be empty");
    });

    it("11. Should reject creating a second subname for the same attestor", async function () {
        await ensManager.connect(attestor1).createAttestorSubname("attestor-007");
        await expect(
            ensManager.connect(attestor1).createAttestorSubname("attestor-008")
        ).to.be.revertedWith("ENSManager: attestor already has an ENS subname");
    });

    it("12. Should reject unauthorized parent name updates", async function () {
        await expect(
            ensManager.connect(attacker).setParentName("hacked.eth")
        ).to.be.revertedWithCustomError(ensManager, "OwnableUnauthorizedAccount");
    });

    it("13. Should return empty profile for non-existent name", async function () {
        const profile = await ensManager.getAttestorProfile("nonexistent");
        expect(profile.attestorAddress).to.equal(ethers.ZeroAddress);
        expect(profile.isRegistered).to.be.false;
    });

    it("14. Should dynamically update text records when attestor earns reputation on-chain", async function () {
        // Deploy YieldProof
        const YieldProof = await ethers.getContractFactory("YieldProof");
        const yieldProof = await YieldProof.deploy(await attestorRegistry.getAddress());
        await yieldProof.waitForDeployment();

        // Register attestor2 and attestor3
        await attestorRegistry.connect(attestor2).registerWithWorldID(sampleRoot, nullifier2, sampleProof, { value: ethers.parseEther("2.0") });
        const [, , , , attestor3] = await ethers.getSigners();
        await attestorRegistry.connect(attestor3).registerWithWorldID(sampleRoot, 999111, sampleProof, { value: ethers.parseEther("2.0") });

        // Attestor1 creates ENS subname
        await ensManager.connect(attestor1).createAttestorSubname("top-attestor");
        const node = await ensManager.subnode("top-attestor");

        // Initial verified claims is 0
        expect(await ensManager.text(node, "app/yieldproof/claims-verified")).to.equal("0");

        // Submit and attest to a claim
        await yieldProof.connect(owner).submitClaim("RWA-GOLD-2026", "Q1", ethers.parseEther("10"), "ipfs://doc", { value: ethers.parseEther("0.9") });
        await attestorRegistry.connect(attestor1).attestToClaim(0);
        await attestorRegistry.connect(attestor2).attestToClaim(0);
        await attestorRegistry.connect(attestor3).attestToClaim(0);

        // Finalize claim
        await attestorRegistry.finalizeAndReward(0);

        // Dynamic ENS text record now resolves 1 verified claim without any ENS write transaction!
        expect(await ensManager.text(node, "app/yieldproof/claims-verified")).to.equal("1");
        expect(Number(await ensManager.text(node, "app/yieldproof/trust-score"))).to.be.greaterThan(0);
    });
});
