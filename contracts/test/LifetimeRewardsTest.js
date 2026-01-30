const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lifetime Rewards Tracking Test", function () {
    let attestorRegistry, yieldProof, yieldVault;
    let owner, issuer, attestor1, attestor2, attestor3;
    let attestorRegistryAddress, yieldProofAddress, yieldVaultAddress;

    const ATTESTATION_FEE = ethers.parseEther("0.9"); // 0.9 MNT
    const REWARD_PER_ATTESTATION = ethers.parseEther("0.3"); // 0.3 MNT per attestor

    beforeEach(async function () {
        [owner, issuer, attestor1, attestor2, attestor3] = await ethers.getSigners();

        // Deploy contracts
        const AttestorRegistry = await ethers.getContractFactory("AttestorRegistry");
        attestorRegistry = await AttestorRegistry.deploy();
        await attestorRegistry.waitForDeployment();
        attestorRegistryAddress = await attestorRegistry.getAddress();

        const YieldProof = await ethers.getContractFactory("YieldProof");
        yieldProof = await YieldProof.deploy(attestorRegistryAddress);
        await yieldProof.waitForDeployment();
        yieldProofAddress = await yieldProof.getAddress();

        const YieldVault = await ethers.getContractFactory("YieldVault");
        yieldVault = await YieldVault.deploy(
            yieldProofAddress,
            attestorRegistryAddress,
            ethers.parseEther("1")
        );
        await yieldVault.waitForDeployment();
        yieldVaultAddress = await yieldVault.getAddress();

        // Register attestors
        const stakeAmount = ethers.parseEther("2.0");
        await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
        await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
        await attestorRegistry.connect(attestor3).register({ value: stakeAmount });
    });

    describe("Lifetime Rewards Tracking", function () {
        it("Should track total rewards claimed across multiple claims", async function () {
            // Submit and complete first claim
            await yieldProof.connect(issuer).submitClaim(
                "MANTLE-ETH-LP-1",
                "Q4-2024",
                ethers.parseEther("10.0"),
                "ipfs://test-hash-1",
                { value: ATTESTATION_FEE }
            );

            await attestorRegistry.connect(attestor1).attestToClaim(0);
            await attestorRegistry.connect(attestor2).attestToClaim(0);
            await attestorRegistry.connect(attestor3).attestToClaim(0);
            await attestorRegistry.finalizeAndReward(0);

            // Check initial stats
            let stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            expect(stats1.totalAttestations).to.equal(1);
            expect(stats1.successful).to.equal(1);
            expect(stats1.rewards).to.equal(REWARD_PER_ATTESTATION);
            expect(stats1.totalClaimed).to.equal(0); // Not claimed yet

            // Claim first rewards
            await attestorRegistry.connect(attestor1).claimRewards();

            // Check stats after first claim
            stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            expect(stats1.rewards).to.equal(0); // Reset after claiming
            expect(stats1.totalClaimed).to.equal(REWARD_PER_ATTESTATION); // First claim tracked

            console.log("✅ First claim completed and rewards claimed:");
            console.log(`  - Current rewards: ${ethers.formatEther(stats1.rewards)} MNT`);
            console.log(`  - Total claimed: ${ethers.formatEther(stats1.totalClaimed)} MNT`);

            // Submit and complete second claim
            await yieldProof.connect(issuer).submitClaim(
                "MANTLE-ETH-LP-2",
                "Q1-2025",
                ethers.parseEther("15.0"),
                "ipfs://test-hash-2",
                { value: ATTESTATION_FEE }
            );

            await attestorRegistry.connect(attestor1).attestToClaim(1);
            await attestorRegistry.connect(attestor2).attestToClaim(1);
            await attestorRegistry.connect(attestor3).attestToClaim(1);
            await attestorRegistry.finalizeAndReward(1);

            // Check stats after second finalization (before claiming)
            stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            expect(stats1.totalAttestations).to.equal(2);
            expect(stats1.successful).to.equal(2);
            expect(stats1.rewards).to.equal(REWARD_PER_ATTESTATION); // New reward earned
            expect(stats1.totalClaimed).to.equal(REWARD_PER_ATTESTATION); // Previous claim still tracked

            // Claim second rewards
            await attestorRegistry.connect(attestor1).claimRewards();

            // Check final stats
            stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            expect(stats1.rewards).to.equal(0); // Reset after claiming
            expect(stats1.totalClaimed).to.equal(REWARD_PER_ATTESTATION * 2n); // Both claims tracked

            console.log("✅ Second claim completed and rewards claimed:");
            console.log(`  - Current rewards: ${ethers.formatEther(stats1.rewards)} MNT`);
            console.log(`  - Total claimed: ${ethers.formatEther(stats1.totalClaimed)} MNT`);
            console.log(`  - Total attestations: ${stats1.totalAttestations}`);
            console.log(`  - Successful attestations: ${stats1.successful}`);
        });

        it("Should track individual attestor lifetime earnings separately", async function () {
            // Complete one claim with all attestors
            await yieldProof.connect(issuer).submitClaim(
                "MANTLE-ETH-LP",
                "Q4-2024",
                ethers.parseEther("10.0"),
                "ipfs://test-hash",
                { value: ATTESTATION_FEE }
            );

            await attestorRegistry.connect(attestor1).attestToClaim(0);
            await attestorRegistry.connect(attestor2).attestToClaim(0);
            await attestorRegistry.connect(attestor3).attestToClaim(0);
            await attestorRegistry.finalizeAndReward(0);

            // Only attestor1 claims rewards
            await attestorRegistry.connect(attestor1).claimRewards();

            // Check individual stats
            const stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            const stats2 = await attestorRegistry.getAttestorStats(attestor2.address);
            const stats3 = await attestorRegistry.getAttestorStats(attestor3.address);

            // Attestor1 claimed rewards
            expect(stats1.rewards).to.equal(0);
            expect(stats1.totalClaimed).to.equal(REWARD_PER_ATTESTATION);

            // Attestor2 and 3 haven't claimed yet
            expect(stats2.rewards).to.equal(REWARD_PER_ATTESTATION);
            expect(stats2.totalClaimed).to.equal(0);
            expect(stats3.rewards).to.equal(REWARD_PER_ATTESTATION);
            expect(stats3.totalClaimed).to.equal(0);

            console.log("✅ Individual tracking verified:");
            console.log(`  - Attestor1 claimed: ${ethers.formatEther(stats1.totalClaimed)} MNT`);
            console.log(`  - Attestor2 pending: ${ethers.formatEther(stats2.rewards)} MNT`);
            console.log(`  - Attestor3 pending: ${ethers.formatEther(stats3.rewards)} MNT`);

            // Attestor2 claims rewards
            await attestorRegistry.connect(attestor2).claimRewards();

            const stats2After = await attestorRegistry.getAttestorStats(attestor2.address);
            expect(stats2After.rewards).to.equal(0);
            expect(stats2After.totalClaimed).to.equal(REWARD_PER_ATTESTATION);

            console.log(`  - Attestor2 after claim: ${ethers.formatEther(stats2After.totalClaimed)} MNT`);
        });

        it("Should maintain lifetime tracking across contract interactions", async function () {
            // Complete multiple claims and verify cumulative tracking
            const numClaims = 3;

            for (let i = 0; i < numClaims; i++) {
                await yieldProof.connect(issuer).submitClaim(
                    `MANTLE-ETH-LP-${i}`,
                    `Q${i + 1}-2025`,
                    ethers.parseEther("10.0"),
                    `ipfs://test-hash-${i}`,
                    { value: ATTESTATION_FEE }
                );

                await attestorRegistry.connect(attestor1).attestToClaim(i);
                await attestorRegistry.connect(attestor2).attestToClaim(i);
                await attestorRegistry.connect(attestor3).attestToClaim(i);
                await attestorRegistry.finalizeAndReward(i);
            }

            // Check accumulated rewards before claiming
            let stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            expect(stats1.totalAttestations).to.equal(numClaims);
            expect(stats1.successful).to.equal(numClaims);
            expect(stats1.rewards).to.equal(REWARD_PER_ATTESTATION * BigInt(numClaims));
            expect(stats1.totalClaimed).to.equal(0);

            // Claim all accumulated rewards at once
            await attestorRegistry.connect(attestor1).claimRewards();

            // Verify final lifetime tracking
            stats1 = await attestorRegistry.getAttestorStats(attestor1.address);
            expect(stats1.rewards).to.equal(0);
            expect(stats1.totalClaimed).to.equal(REWARD_PER_ATTESTATION * BigInt(numClaims));

            console.log("✅ Cumulative tracking verified:");
            console.log(`  - Claims completed: ${numClaims}`);
            console.log(`  - Total lifetime claimed: ${ethers.formatEther(stats1.totalClaimed)} MNT`);
            console.log(`  - Expected: ${ethers.formatEther(REWARD_PER_ATTESTATION * BigInt(numClaims))} MNT`);
        });
    });
});