const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RWA Tokenization & Yield Verification Flow (Curvegrid Track)", function () {
    let attestorRegistry, yieldProof, yieldVault, mockWorldID, ensManager;
    let owner, issuer, attestor1, attestor2, attestor3, attacker, investor;

    const sampleProof = [0, 1, 2, 3, 4, 5, 6, 7];
    const sampleRoot = 123456789;
    const nullifier1 = 987654321;
    const nullifier2 = 555666777;
    const nullifier3 = 111222333;

    const RWA_ASSET_ID = "RWA-US-TREASURY-BILL-2026-Q1";
    const RWA_PERIOD = "Jan 2026 - Mar 2026";
    const RWA_YIELD_AMOUNT = ethers.parseEther("50.0"); // 50 MNT
    const RWA_IPFS_DOC_HASH = "ipfs://bafybeidrii24m4r5t7p43y3qwefq3fq4fqwef";
    const ATTESTATION_FEE = ethers.parseEther("0.9");

    beforeEach(async function () {
        [owner, issuer, attestor1, attestor2, attestor3, attacker, investor] = await ethers.getSigners();

        // 1. Deploy MockWorldID
        const MockWorldID = await ethers.getContractFactory("MockWorldID");
        mockWorldID = await MockWorldID.deploy();
        await mockWorldID.waitForDeployment();

        // 2. Deploy AttestorRegistry
        const AttestorRegistry = await ethers.getContractFactory("AttestorRegistry");
        attestorRegistry = await AttestorRegistry.deploy();
        await attestorRegistry.waitForDeployment();

        // Configure World ID
        await attestorRegistry.setWorldID(
            await mockWorldID.getAddress(),
            "app_staging_yieldproof",
            "verify-attestor"
        );

        // 3. Deploy YieldProof
        const YieldProof = await ethers.getContractFactory("YieldProof");
        yieldProof = await YieldProof.deploy(await attestorRegistry.getAddress());
        await yieldProof.waitForDeployment();

        // 4. Deploy YieldVault
        const YieldVault = await ethers.getContractFactory("YieldVault");
        yieldVault = await YieldVault.deploy(
            await yieldProof.getAddress(),
            await attestorRegistry.getAddress(),
            ethers.parseEther("1.0") // minTotalStake
        );
        await yieldVault.waitForDeployment();

        // 5. Deploy YieldProofENSManager
        const YieldProofENSManager = await ethers.getContractFactory("YieldProofENSManager");
        ensManager = await YieldProofENSManager.deploy(
            await attestorRegistry.getAddress(),
            "yieldproof.eth"
        );
        await ensManager.waitForDeployment();
    });

    it("1. Issuer creates RWA yield claim with cryptographic IPFS evidence", async function () {
        await expect(
            yieldProof.connect(issuer).submitClaim(
                RWA_ASSET_ID,
                RWA_PERIOD,
                RWA_YIELD_AMOUNT,
                RWA_IPFS_DOC_HASH,
                { value: ATTESTATION_FEE }
            )
        ).to.emit(yieldProof, "YieldClaimSubmitted");

        const claim = await yieldProof.claims(0);
        expect(claim.assetId).to.equal(RWA_ASSET_ID);
        expect(claim.period).to.equal(RWA_PERIOD);
        expect(claim.yieldAmount).to.equal(RWA_YIELD_AMOUNT);
        expect(claim.documentHash).to.equal(RWA_IPFS_DOC_HASH);
        expect(claim.issuer).to.equal(issuer.address);
        expect(claim.status).to.equal(0); // Pending
    });

    it("2. Rejects RWA claim submission with insufficient attestation fee", async function () {
        await expect(
            yieldProof.connect(issuer).submitClaim(
                RWA_ASSET_ID,
                RWA_PERIOD,
                RWA_YIELD_AMOUNT,
                RWA_IPFS_DOC_HASH,
                { value: ethers.parseEther("0.5") }
            )
        ).to.be.revertedWith("YieldProof: insufficient attestation fee");
    });

    it("3. Independent human attestors register with World ID and stake capital", async function () {
        const stake = ethers.parseEther("2.0");

        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: stake });
        await attestorRegistry.connect(attestor2).registerWithWorldID(sampleRoot, nullifier2, sampleProof, { value: stake });
        await attestorRegistry.connect(attestor3).registerWithWorldID(sampleRoot, nullifier3, sampleProof, { value: stake });

        expect((await attestorRegistry.attestors(attestor1.address)).isRegistered).to.be.true;
        expect((await attestorRegistry.attestors(attestor1.address)).stake).to.equal(stake);
        expect(await attestorRegistry.isWorldIdVerified(attestor1.address)).to.be.true;
    });

    it("4. Multi-party attestation consensus reaches threshold and finalizes RWA verification", async function () {
        // Submit RWA claim
        await yieldProof.connect(issuer).submitClaim(
            RWA_ASSET_ID,
            RWA_PERIOD,
            RWA_YIELD_AMOUNT,
            RWA_IPFS_DOC_HASH,
            { value: ATTESTATION_FEE }
        );

        // Register 3 attestors with stake
        const stake = ethers.parseEther("2.0");
        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: stake });
        await attestorRegistry.connect(attestor2).registerWithWorldID(sampleRoot, nullifier2, sampleProof, { value: stake });
        await attestorRegistry.connect(attestor3).registerWithWorldID(sampleRoot, nullifier3, sampleProof, { value: stake });

        // Attestor 1 and 2 vote
        await attestorRegistry.connect(attestor1).attestToClaim(0);
        await attestorRegistry.connect(attestor2).attestToClaim(0);

        // Check canUnlockYield is false with only 2 attestors
        expect(await yieldVault.canUnlockYield(0)).to.be.false;

        // Attestor 3 votes -> Reaches 3/3 threshold
        await attestorRegistry.connect(attestor3).attestToClaim(0);
        expect(await yieldVault.canUnlockYield(0)).to.be.true;

        // Finalize claim
        await attestorRegistry.finalizeAndReward(0);

        // Rewards distributed to all 3 honest attestors (0.3 MNT each)
        expect(await attestorRegistry.rewardsEarned(attestor1.address)).to.equal(ethers.parseEther("0.3"));
        expect(await attestorRegistry.rewardsEarned(attestor2.address)).to.equal(ethers.parseEther("0.3"));
        expect(await attestorRegistry.rewardsEarned(attestor3.address)).to.equal(ethers.parseEther("0.3"));
    });

    it("5. Rejects duplicate attestation on the same RWA claim", async function () {
        await yieldProof.connect(issuer).submitClaim(RWA_ASSET_ID, RWA_PERIOD, RWA_YIELD_AMOUNT, RWA_IPFS_DOC_HASH, { value: ATTESTATION_FEE });
        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: ethers.parseEther("2.0") });

        await attestorRegistry.connect(attestor1).attestToClaim(0);
        await expect(
            attestorRegistry.connect(attestor1).attestToClaim(0)
        ).to.be.revertedWith("AttestorRegistry: already attested");
    });

    it("6. Honest attestor flags fraudulent RWA claim preventing payout", async function () {
        await yieldProof.connect(issuer).submitClaim(
            "FRAUDULENT-RWA-CLAIM",
            "2026",
            ethers.parseEther("100"),
            "ipfs://invalid-proof",
            { value: ATTESTATION_FEE }
        );

        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: ethers.parseEther("2.0") });

        // Flag the claim
        await expect(
            attestorRegistry.connect(attestor1).flagClaim(0, "Invalid bank statement signature")
        )
            .to.emit(attestorRegistry, "ClaimFlagged")
            .withArgs(0, attestor1.address, "Invalid bank statement signature");

        expect(await attestorRegistry.isFlagged(0)).to.be.true;
        expect(await yieldVault.canUnlockYield(0)).to.be.false;

        // Other attestors cannot attest to a flagged claim
        await attestorRegistry.connect(attestor2).registerWithWorldID(sampleRoot, nullifier2, sampleProof, { value: ethers.parseEther("2.0") });
        await expect(
            attestorRegistry.connect(attestor2).attestToClaim(0)
        ).to.be.revertedWith("AttestorRegistry: claim is flagged");
    });

    it("7. Slashes dishonest attestor stake upon governance review", async function () {
        await attestorRegistry.connect(attacker).registerWithWorldID(sampleRoot, 999888, sampleProof, { value: ethers.parseEther("5.0") });
        expect((await attestorRegistry.attestors(attacker.address)).stake).to.equal(ethers.parseEther("5.0"));

        // Admin slashes 2.5 MNT of attacker stake
        await expect(
            attestorRegistry.connect(owner).slash(attacker.address, ethers.parseEther("2.5"))
        )
            .to.emit(attestorRegistry, "AttestorSlashed")
            .withArgs(attacker.address, ethers.parseEther("2.5"), owner.address);

        expect((await attestorRegistry.attestors(attacker.address)).stake).to.equal(ethers.parseEther("2.5"));
    });

    it("8. Verified RWA claim unlocks institutional capital distribution in YieldVault", async function () {
        // Investor deposits capital into YieldVault
        await yieldVault.connect(investor).deposit({ value: ethers.parseEther("100.0") });
        expect(await yieldVault.balances(investor.address)).to.equal(ethers.parseEther("100.0"));

        // Issuer submits claim
        await yieldProof.connect(issuer).submitClaim(RWA_ASSET_ID, RWA_PERIOD, ethers.parseEther("10.0"), RWA_IPFS_DOC_HASH, { value: ATTESTATION_FEE });

        // 3 attestors verify
        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: ethers.parseEther("2.0") });
        await attestorRegistry.connect(attestor2).registerWithWorldID(sampleRoot, nullifier2, sampleProof, { value: ethers.parseEther("2.0") });
        await attestorRegistry.connect(attestor3).registerWithWorldID(sampleRoot, nullifier3, sampleProof, { value: ethers.parseEther("2.0") });

        await attestorRegistry.connect(attestor1).attestToClaim(0);
        await attestorRegistry.connect(attestor2).attestToClaim(0);
        await attestorRegistry.connect(attestor3).attestToClaim(0);

        // Unlock yield in vault
        await yieldVault.connect(investor).unlockYield(0);
        expect(await yieldVault.isClaimed(0)).to.be.true;
        expect(await yieldVault.verifiedDistribution()).to.equal(ethers.parseEther("10.0"));

        // Investor balance updated with verified yield share
        expect(await yieldVault.balances(investor.address)).to.equal(ethers.parseEther("110.0"));
    });

    it("9. Complete end-to-end integration: RWA verification reflects on ENS reputation", async function () {
        // Register attestor1
        await attestorRegistry.connect(attestor1).registerWithWorldID(sampleRoot, nullifier1, sampleProof, { value: ethers.parseEther("5.0") });
        await ensManager.connect(attestor1).createAttestorSubname("rwa-verifier-01");
        const node = await ensManager.subnode("rwa-verifier-01");

        // Profile lookup
        const profile = await ensManager.getAttestorProfile("rwa-verifier-01");
        expect(profile.attestorAddress).to.equal(attestor1.address);
        expect(profile.fullSubname).to.equal("rwa-verifier-01.yieldproof.eth");
        expect(profile.isWorldIdVerified).to.be.true;
        expect(profile.isRegistered).to.be.true;

        // ENS standard resolution
        expect(await ensManager.addr(node)).to.equal(attestor1.address);
        expect(await ensManager.text(node, "app/yieldproof/status")).to.equal("Active");
        expect(await ensManager.text(node, "app/yieldproof/world-verified")).to.equal("true");
    });
});
