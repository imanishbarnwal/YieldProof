const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldProof Full Flow Test - New Economics", function () {
    let attestorRegistry, yieldProof, yieldVault;
    let owner, issuer, attestor1, attestor2, attestor3, investor;
    let attestorRegistryAddress, yieldProofAddress, yieldVaultAddress;

    // New economics constants
    const ATTESTATION_FEE = ethers.parseEther("0.9"); // 0.9 MNT
    const REWARD_PER_ATTESTATION = ethers.parseEther("0.3"); // 0.3 MNT per attestor
    const MIN_REQUIRED_ATTESTORS = 3;

    beforeEach(async function () {
        [owner, issuer, attestor1, attestor2, attestor3, investor] = await ethers.getSigners();

        // Deploy AttestorRegistry
        const AttestorRegistry = await ethers.getContractFactory("AttestorRegistry");
        attestorRegistry = await AttestorRegistry.deploy();
        await attestorRegistry.waitForDeployment();
        attestorRegistryAddress = await attestorRegistry.getAddress();

        // Deploy YieldProof
        const YieldProof = await ethers.getContractFactory("YieldProof");
        yieldProof = await YieldProof.deploy(attestorRegistryAddress);
        await yieldProof.waitForDeployment();
        yieldProofAddress = await yieldProof.getAddress();

        // Deploy YieldVault
        const YieldVault = await ethers.getContractFactory("YieldVault");
        yieldVault = await YieldVault.deploy(
            yieldProofAddress,
            attestorRegistryAddress,
            ethers.parseEther("1") // minTotalStake
        );
        await yieldVault.waitForDeployment();
        yieldVaultAddress = await yieldVault.getAddress();

        console.log("Contracts deployed:");
        console.log("AttestorRegistry:", attestorRegistryAddress);
        console.log("YieldProof:", yieldProofAddress);
        console.log("YieldVault:", yieldVaultAddress);
    });

    describe("1. Contract Constants Verification", function () {
        it("Should have correct new economic constants", async function () {
            expect(await attestorRegistry.ATTESTATION_FEE()).to.equal(ATTESTATION_FEE);
            expect(await attestorRegistry.REWARD_PER_ATTESTATION()).to.equal(REWARD_PER_ATTESTATION);
            expect(await attestorRegistry.MIN_REQUIRED_ATTESTORS()).to.equal(MIN_REQUIRED_ATTESTORS);

            console.log("✅ Economic constants verified:");
            console.log("  - Attestation Fee: 0.9 MNT");
            console.log("  - Reward per Attestation: 0.3 MNT");
            console.log("  - Min Required Attestors: 3");
        });

        it("Should have correct fee calculation", async function () {
            const fee = await yieldProof.getRequiredAttestationFee();
            expect(fee).to.equal(ATTESTATION_FEE);

            console.log("✅ YieldProof fee calculation correct: 0.9 MNT");
        });
    });

    describe("2. Attestor Registration and Staking", function () {
        it("Should allow attestors to register with stake", async function () {
            const stakeAmount = ethers.parseEther("2.0"); // 2 MNT stake

            // Register attestors with stake
            await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor3).register({ value: stakeAmount });

            // Verify registrations
            const attestor1Info = await attestorRegistry.attestors(attestor1.address);
            const attestor2Info = await attestorRegistry.attestors(attestor2.address);
            const attestor3Info = await attestorRegistry.attestors(attestor3.address);

            expect(attestor1Info.isRegistered).to.be.true;
            expect(attestor1Info.stake).to.equal(stakeAmount);
            expect(attestor2Info.isRegistered).to.be.true;
            expect(attestor2Info.stake).to.equal(stakeAmount);
            expect(attestor3Info.isRegistered).to.be.true;
            expect(attestor3Info.stake).to.equal(stakeAmount);

            console.log("✅ All 3 attestors registered with 2 MNT stake each");
        });
    });

    describe("3. Claim Submission with New Fee Structure", function () {
        beforeEach(async function () {
            // Register attestors
            const stakeAmount = ethers.parseEther("2.0");
            await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor3).register({ value: stakeAmount });
        });

        it("Should submit claim with 0.9 MNT attestation fee", async function () {
            const yieldAmount = ethers.parseEther("10.0"); // 10 MNT yield

            // Check initial balances
            const initialIssuerBalance = await ethers.provider.getBalance(issuer.address);
            const initialPoolBalance = await attestorRegistry.getRewardPoolBalance();

            // Submit claim with attestation fee
            const tx = await yieldProof.connect(issuer).submitClaim(
                "MANTLE-ETH-LP",
                "Q4-2024",
                yieldAmount,
                "ipfs://test-hash",
                { value: ATTESTATION_FEE }
            );

            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            // Verify claim was created
            const claim = await yieldProof.claims(0);
            expect(claim.issuer).to.equal(issuer.address);
            expect(claim.yieldAmount).to.equal(yieldAmount);
            expect(claim.status).to.equal(0); // Pending

            // Verify fee was transferred to reward pool
            const finalPoolBalance = await attestorRegistry.getRewardPoolBalance();
            expect(finalPoolBalance - initialPoolBalance).to.equal(ATTESTATION_FEE);

            // Verify issuer paid fee + gas
            const finalIssuerBalance = await ethers.provider.getBalance(issuer.address);
            const totalCost = initialIssuerBalance - finalIssuerBalance;
            expect(totalCost).to.be.greaterThan(ATTESTATION_FEE); // Fee + gas

            console.log("✅ Claim submitted successfully:");
            console.log(`  - Attestation fee paid: ${ethers.formatEther(ATTESTATION_FEE)} MNT`);
            console.log(`  - Gas cost: ${ethers.formatEther(gasUsed)} MNT`);
            console.log(`  - Total cost: ${ethers.formatEther(totalCost)} MNT`);
            console.log(`  - Reward pool balance: ${ethers.formatEther(finalPoolBalance)} MNT`);
        });

        it("Should reject claim with insufficient fee", async function () {
            const insufficientFee = ethers.parseEther("0.5"); // Less than 0.9 MNT

            await expect(
                yieldProof.connect(issuer).submitClaim(
                    "MANTLE-ETH-LP",
                    "Q4-2024",
                    ethers.parseEther("10.0"),
                    "ipfs://test-hash",
                    { value: insufficientFee }
                )
            ).to.be.revertedWith("YieldProof: insufficient attestation fee");

            console.log("✅ Insufficient fee rejection works correctly");
        });
    });

    describe("4. Attestation Process", function () {
        beforeEach(async function () {
            // Register attestors and submit claim
            const stakeAmount = ethers.parseEther("2.0");
            await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor3).register({ value: stakeAmount });

            await yieldProof.connect(issuer).submitClaim(
                "MANTLE-ETH-LP",
                "Q4-2024",
                ethers.parseEther("10.0"),
                "ipfs://test-hash",
                { value: ATTESTATION_FEE }
            );
        });

        it("Should allow attestors to attest to claim", async function () {
            const claimId = 0;

            // Attestors attest to the claim
            await attestorRegistry.connect(attestor1).attestToClaim(claimId);
            await attestorRegistry.connect(attestor2).attestToClaim(claimId);
            await attestorRegistry.connect(attestor3).attestToClaim(claimId);

            // Verify attestations
            expect(await attestorRegistry.hasAttested(claimId, attestor1.address)).to.be.true;
            expect(await attestorRegistry.hasAttested(claimId, attestor2.address)).to.be.true;
            expect(await attestorRegistry.hasAttested(claimId, attestor3.address)).to.be.true;

            // Verify attestor count
            expect(await attestorRegistry.attestorCountPerClaim(claimId)).to.equal(3);

            // Verify total stake
            const totalStake = await attestorRegistry.totalStakePerClaim(claimId);
            expect(totalStake).to.equal(ethers.parseEther("6.0")); // 3 attestors × 2 MNT each

            console.log("✅ All 3 attestors successfully attested");
            console.log(`  - Total stake on claim: ${ethers.formatEther(totalStake)} MNT`);
        });
    });

    describe("5. Claim Finalization and Reward Distribution", function () {
        beforeEach(async function () {
            // Setup: Register attestors, submit claim, and attest
            const stakeAmount = ethers.parseEther("2.0");
            await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor3).register({ value: stakeAmount });

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
        });

        it("Should finalize claim and distribute rewards", async function () {
            const claimId = 0;

            // Check initial reward balances
            const initialRewards1 = await attestorRegistry.rewardsEarned(attestor1.address);
            const initialRewards2 = await attestorRegistry.rewardsEarned(attestor2.address);
            const initialRewards3 = await attestorRegistry.rewardsEarned(attestor3.address);

            expect(initialRewards1).to.equal(0);
            expect(initialRewards2).to.equal(0);
            expect(initialRewards3).to.equal(0);

            // Finalize the claim (can be called by anyone)
            await attestorRegistry.connect(investor).finalizeAndReward(claimId);

            // Verify rewards were distributed
            const finalRewards1 = await attestorRegistry.rewardsEarned(attestor1.address);
            const finalRewards2 = await attestorRegistry.rewardsEarned(attestor2.address);
            const finalRewards3 = await attestorRegistry.rewardsEarned(attestor3.address);

            expect(finalRewards1).to.equal(REWARD_PER_ATTESTATION);
            expect(finalRewards2).to.equal(REWARD_PER_ATTESTATION);
            expect(finalRewards3).to.equal(REWARD_PER_ATTESTATION);

            // Verify verification was recorded
            expect(await attestorRegistry.verificationRecorded(claimId)).to.be.true;

            // Verify successful attestation counts
            expect(await attestorRegistry.successfulAttestations(attestor1.address)).to.equal(1);
            expect(await attestorRegistry.successfulAttestations(attestor2.address)).to.equal(1);
            expect(await attestorRegistry.successfulAttestations(attestor3.address)).to.equal(1);

            console.log("✅ Claim finalized and rewards distributed:");
            console.log(`  - Each attestor earned: ${ethers.formatEther(REWARD_PER_ATTESTATION)} MNT`);
            console.log(`  - Total rewards distributed: ${ethers.formatEther(REWARD_PER_ATTESTATION * 3n)} MNT`);
        });
    });

    describe("6. Reward Claiming", function () {
        beforeEach(async function () {
            // Complete full flow to finalization
            const stakeAmount = ethers.parseEther("2.0");
            await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor3).register({ value: stakeAmount });

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

            await attestorRegistry.connect(investor).finalizeAndReward(0);
        });

        it("Should allow attestors to claim their rewards", async function () {
            // Check initial balances
            const initialBalance1 = await ethers.provider.getBalance(attestor1.address);
            const initialBalance2 = await ethers.provider.getBalance(attestor2.address);

            // Claim rewards
            const tx1 = await attestorRegistry.connect(attestor1).claimRewards();
            const receipt1 = await tx1.wait();
            const gasUsed1 = receipt1.gasUsed * receipt1.gasPrice;

            const tx2 = await attestorRegistry.connect(attestor2).claimRewards();
            const receipt2 = await tx2.wait();
            const gasUsed2 = receipt2.gasUsed * receipt2.gasPrice;

            // Check final balances
            const finalBalance1 = await ethers.provider.getBalance(attestor1.address);
            const finalBalance2 = await ethers.provider.getBalance(attestor2.address);

            // Calculate net gains (rewards - gas costs)
            const netGain1 = finalBalance1 - initialBalance1;
            const netGain2 = finalBalance2 - initialBalance2;

            // Verify rewards were received (should be reward amount minus gas)
            expect(netGain1).to.be.closeTo(REWARD_PER_ATTESTATION - gasUsed1, ethers.parseEther("0.001"));
            expect(netGain2).to.be.closeTo(REWARD_PER_ATTESTATION - gasUsed2, ethers.parseEther("0.001"));

            // Verify reward balances were reset
            expect(await attestorRegistry.rewardsEarned(attestor1.address)).to.equal(0);
            expect(await attestorRegistry.rewardsEarned(attestor2.address)).to.equal(0);

            console.log("✅ Attestors successfully claimed rewards:");
            console.log(`  - Attestor 1 net gain: ${ethers.formatEther(netGain1)} MNT`);
            console.log(`  - Attestor 1 gas cost: ${ethers.formatEther(gasUsed1)} MNT`);
            console.log(`  - Attestor 2 net gain: ${ethers.formatEther(netGain2)} MNT`);
            console.log(`  - Attestor 2 gas cost: ${ethers.formatEther(gasUsed2)} MNT`);
        });
    });

    describe("7. Economic Viability Analysis", function () {
        it("Should analyze complete economic flow", async function () {
            // Setup and complete full flow
            const stakeAmount = ethers.parseEther("2.0");
            await attestorRegistry.connect(attestor1).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor2).register({ value: stakeAmount });
            await attestorRegistry.connect(attestor3).register({ value: stakeAmount });

            // Track issuer costs
            const initialIssuerBalance = await ethers.provider.getBalance(issuer.address);

            const submitTx = await yieldProof.connect(issuer).submitClaim(
                "MANTLE-ETH-LP",
                "Q4-2024",
                ethers.parseEther("10.0"),
                "ipfs://test-hash",
                { value: ATTESTATION_FEE }
            );
            const submitReceipt = await submitTx.wait();
            const submitGasCost = submitReceipt.gasUsed * submitReceipt.gasPrice;

            // Track attestor costs
            const initialAttestor1Balance = await ethers.provider.getBalance(attestor1.address);

            const attestTx1 = await attestorRegistry.connect(attestor1).attestToClaim(0);
            const attestReceipt1 = await attestTx1.wait();
            const attestGasCost1 = attestReceipt1.gasUsed * attestReceipt1.gasPrice;

            await attestorRegistry.connect(attestor2).attestToClaim(0);
            await attestorRegistry.connect(attestor3).attestToClaim(0);

            await attestorRegistry.connect(investor).finalizeAndReward(0);

            const claimTx1 = await attestorRegistry.connect(attestor1).claimRewards();
            const claimReceipt1 = await claimTx1.wait();
            const claimGasCost1 = claimReceipt1.gasUsed * claimReceipt1.gasPrice;

            const finalAttestor1Balance = await ethers.provider.getBalance(attestor1.address);
            const finalIssuerBalance = await ethers.provider.getBalance(issuer.address);

            // Calculate costs and profits
            const issuerTotalCost = initialIssuerBalance - finalIssuerBalance;
            const attestorTotalGasCost = attestGasCost1 + claimGasCost1;
            const attestorNetGain = finalAttestor1Balance - initialAttestor1Balance;

            console.log("\n📊 ECONOMIC ANALYSIS:");
            console.log("=".repeat(50));
            console.log("ISSUER COSTS:");
            console.log(`  - Attestation fee: ${ethers.formatEther(ATTESTATION_FEE)} MNT`);
            console.log(`  - Gas cost: ${ethers.formatEther(submitGasCost)} MNT`);
            console.log(`  - Total cost: ${ethers.formatEther(issuerTotalCost)} MNT`);
            console.log("\nATTESTOR ECONOMICS:");
            console.log(`  - Reward earned: ${ethers.formatEther(REWARD_PER_ATTESTATION)} MNT`);
            console.log(`  - Attestation gas: ${ethers.formatEther(attestGasCost1)} MNT`);
            console.log(`  - Claim gas: ${ethers.formatEther(claimGasCost1)} MNT`);
            console.log(`  - Total gas cost: ${ethers.formatEther(attestorTotalGasCost)} MNT`);
            console.log(`  - Net gain/loss: ${ethers.formatEther(attestorNetGain)} MNT`);
            console.log("\nVIABILITY:");

            if (attestorNetGain > 0) {
                console.log("  ✅ PROFITABLE: Attestors earn profit!");
            } else {
                console.log("  ⚠️  LOSS: Attestors lose money");
                console.log(`  💡 Break-even MNT price: ~$${(parseFloat(ethers.formatEther(attestorTotalGasCost)) / parseFloat(ethers.formatEther(REWARD_PER_ATTESTATION)) * 0.5).toFixed(0)}`);
            }

            // Verify economic balance
            const totalRewardsDistributed = REWARD_PER_ATTESTATION * 3n;
            expect(totalRewardsDistributed).to.equal(ATTESTATION_FEE);
            console.log("  ✅ Economic balance maintained: Fees = Rewards");
        });
    });

    describe("8. Trust Score Calculation", function () {
        it("Should calculate trust scores correctly", async function () {
            // Register attestor and complete successful attestation
            await attestorRegistry.connect(attestor1).register({ value: ethers.parseEther("2.0") });
            await attestorRegistry.connect(attestor2).register({ value: ethers.parseEther("2.0") });
            await attestorRegistry.connect(attestor3).register({ value: ethers.parseEther("2.0") });

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

            // Check trust scores
            const trustScore1 = await attestorRegistry.getTrustScore(attestor1.address);
            const stats1 = await attestorRegistry.getAttestorStats(attestor1.address);

            console.log("✅ Trust score calculation:");
            console.log(`  - Total attestations: ${stats1.totalAttestations}`);
            console.log(`  - Successful attestations: ${stats1.successful}`);
            console.log(`  - Trust score: ${trustScore1}/100`);

            expect(trustScore1).to.be.greaterThan(0);
            expect(stats1.totalAttestations).to.equal(1);
            expect(stats1.successful).to.equal(1);
        });
    });
});