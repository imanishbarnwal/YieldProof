# Integration Guide

## Overview

This guide provides comprehensive examples for integrating with YieldProof contracts for all user roles: Issuers, Attestors, and Investors.

## Contract Addresses (Mantle Sepolia)

```javascript
const CONTRACTS = {
    AttestorRegistry: "0x1c152de6172BDB84b0871731Ef494d12C7691C07",
    YieldProof: "0x723A0992D07Ed6e6789Fcdcfd63b05634302586c",
    YieldVault: "0x671dA4C8D9277429e58fbFCa46C3163a17b97294"
};

const MANTLE_SEPOLIA = {
    chainId: 5003,
    rpcUrl: "https://rpc.sepolia.mantle.xyz"
};
```

## For Issuers

### 1. Submit Yield Claim

```javascript
import { ethers } from 'ethers';

async function submitYieldClaim(
    assetId,
    period,
    yieldAmount,
    documentHash
) {
    // Get required attestation fee
    const fee = await yieldProofContract.getRequiredAttestationFee();
    console.log(`Required fee: ${ethers.utils.formatEther(fee)} MNT`);
    
    // Submit claim with fee
    const tx = await yieldProofContract.submitClaim(
        assetId,           // e.g., "TREASURY-VAULT-001"
        period,            // e.g., "2024-Q4"
        ethers.utils.parseEther(yieldAmount.toString()), // yield amount
        documentHash,      // IPFS hash: "QmHash123..."
        { value: fee }
    );
    
    const receipt = await tx.wait();
    
    // Extract claim ID from events
    const event = receipt.events.find(e => e.event === 'YieldClaimSubmitted');
    const claimId = event.args.claimId;
    
    console.log(`Claim submitted with ID: ${claimId}`);
    return claimId;
}

// Example usage
const claimId = await submitYieldClaim(
    "MANTLE-ETH-LP",
    "Q4-2024", 
    "150.5",
    "QmYourIPFSHashHere"
);
```

### 2. Monitor Claim Status

```javascript
async function monitorClaimStatus(claimId) {
    const claim = await yieldProofContract.claims(claimId);
    
    const statusNames = ['Pending', 'Attested', 'Approved', 'Challenged'];
    console.log(`Claim ${claimId} status: ${statusNames[claim.status]}`);
    
    // Check attestation progress
    const attestorCount = await attestorRegistryContract.attestorCountPerClaim(claimId);
    const totalStake = await attestorRegistryContract.totalStakePerClaim(claimId);
    
    console.log(`Attestations: ${attestorCount}/3 required`);
    console.log(`Total stake: ${ethers.utils.formatEther(totalStake)} MNT`);
    
    // Check if flagged
    const isFlagged = await attestorRegistryContract.isFlagged(claimId);
    if (isFlagged) {
        const reason = await attestorRegistryContract.flagReasons(claimId);
        console.log(`⚠️ Claim flagged: ${reason}`);
    }
    
    return {
        status: claim.status,
        attestorCount: attestorCount.toNumber(),
        totalStake: ethers.utils.formatEther(totalStake),
        isFlagged
    };
}
```

### 3. Update Claim Status

```javascript
async function updateClaimStatus(claimId) {
    // Anyone can call this to update status based on attestations
    const tx = await yieldProofContract.updateClaimStatus(claimId);
    await tx.wait();
    
    const updatedClaim = await yieldProofContract.claims(claimId);
    console.log(`Claim ${claimId} updated to status: ${updatedClaim.status}`);
}
```

## For Attestors

### 1. Register as Attestor

```javascript
async function registerAsAttestor(stakeAmount) {
    const stakeWei = ethers.utils.parseEther(stakeAmount.toString());
    
    // Register with initial stake
    const tx = await attestorRegistryContract.register({
        value: stakeWei
    });
    
    await tx.wait();
    console.log(`Registered as attestor with ${stakeAmount} MNT stake`);
    
    // Verify registration
    const attestorInfo = await attestorRegistryContract.attestors(address);
    console.log(`Registered: ${attestorInfo.isRegistered}`);
    console.log(`Stake: ${ethers.utils.formatEther(attestorInfo.stake)} MNT`);
}

// Example: Register with 5 MNT stake
await registerAsAttestor(5.0);
```

### 2. Add More Stake

```javascript
async function addStake(additionalAmount) {
    const additionalWei = ethers.utils.parseEther(additionalAmount.toString());
    
    const tx = await attestorRegistryContract.stakeETH({
        value: additionalWei
    });
    
    await tx.wait();
    console.log(`Added ${additionalAmount} MNT to stake`);
}
```

### 3. View Pending Claims

```javascript
async function getPendingClaims() {
    const totalClaims = await yieldProofContract.getTotalClaims();
    const pendingClaims = [];
    
    for (let i = 0; i < totalClaims; i++) {
        const claim = await yieldProofContract.claims(i);
        const isFlagged = await attestorRegistryContract.isFlagged(i);
        const attestorCount = await attestorRegistryContract.attestorCountPerClaim(i);
        
        if (claim.status === 0 && !isFlagged && attestorCount < 3) { // Pending
            pendingClaims.push({
                claimId: i,
                assetId: claim.assetId,
                period: claim.period,
                yieldAmount: ethers.utils.formatEther(claim.yieldAmount),
                documentHash: claim.documentHash,
                issuer: claim.issuer,
                submittedAt: new Date(claim.submittedAt * 1000),
                attestorCount: attestorCount.toNumber()
            });
        }
    }
    
    return pendingClaims;
}

// Example usage
const pending = await getPendingClaims();
console.log(`Found ${pending.length} pending claims`);
pending.forEach(claim => {
    console.log(`Claim ${claim.claimId}: ${claim.assetId} - ${claim.yieldAmount} MNT`);
});
```

### 4. Attest to Claim

```javascript
async function attestToClaim(claimId) {
    // Check if already attested
    const hasAttested = await attestorRegistryContract.hasAttested(claimId, address);
    if (hasAttested) {
        console.log("Already attested to this claim");
        return;
    }
    
    // Check if claim is flagged
    const isFlagged = await attestorRegistryContract.isFlagged(claimId);
    if (isFlagged) {
        const reason = await attestorRegistryContract.flagReasons(claimId);
        console.log(`Cannot attest: Claim is flagged - ${reason}`);
        return;
    }
    
    // Attest to the claim
    const tx = await attestorRegistryContract.attestToClaim(claimId);
    await tx.wait();
    
    console.log(`Successfully attested to claim ${claimId}`);
    
    // Check if claim can now be finalized
    const attestorCount = await attestorRegistryContract.attestorCountPerClaim(claimId);
    if (attestorCount >= 3) {
        console.log("Claim now has 3+ attestations and can be finalized!");
    }
}
```

### 5. Flag Suspicious Claims

```javascript
async function flagClaim(claimId, reason) {
    const tx = await attestorRegistryContract.flagClaim(claimId, reason);
    await tx.wait();
    
    console.log(`Flagged claim ${claimId}: ${reason}`);
}

// Example usage
await flagClaim(5, "Document appears to be fabricated - inconsistent dates");
```

### 6. Check Trust Score and Stats

```javascript
async function getAttestorStats(attestorAddress) {
    const stats = await attestorRegistryContract.getAttestorStats(attestorAddress);
    const trustScore = await attestorRegistryContract.getTrustScore(attestorAddress);
    
    return {
        totalAttestations: stats.totalAttestations.toNumber(),
        successful: stats.successful.toNumber(),
        rewards: ethers.utils.formatEther(stats.rewards),
        totalClaimed: ethers.utils.formatEther(stats.totalClaimed),
        trustScore: trustScore.toNumber(),
        successRate: stats.totalAttestations > 0 
            ? (stats.successful * 100 / stats.totalAttestations).toFixed(1) + '%'
            : '0%'
    };
}

// Example usage
const myStats = await getAttestorStats(myAddress);
console.log(`Trust Score: ${myStats.trustScore}/100`);
console.log(`Success Rate: ${myStats.successRate}`);
console.log(`Pending Rewards: ${myStats.rewards} MNT`);
```

### 7. Claim Rewards

```javascript
async function claimRewards() {
    const stats = await attestorRegistryContract.getAttestorStats(address);
    const pendingRewards = ethers.utils.formatEther(stats.rewards);
    
    if (stats.rewards.eq(0)) {
        console.log("No rewards to claim");
        return;
    }
    
    console.log(`Claiming ${pendingRewards} MNT in rewards...`);
    
    const tx = await attestorRegistryContract.claimRewards();
    await tx.wait();
    
    console.log(`Successfully claimed ${pendingRewards} MNT`);
}
```

## For Investors

### 1. Deposit Capital to Vault

```javascript
async function depositToVault(amount) {
    const amountWei = ethers.utils.parseEther(amount.toString());
    
    const tx = await yieldVaultContract.deposit({
        value: amountWei
    });
    
    await tx.wait();
    console.log(`Deposited ${amount} MNT to vault`);
    
    // Check new balance
    const balance = await yieldVaultContract.balances(address);
    console.log(`Your vault balance: ${ethers.utils.formatEther(balance)} MNT`);
}
```

### 2. Query Verified Claims

```javascript
async function getVerifiedClaims() {
    const totalClaims = await yieldProofContract.getTotalClaims();
    const verifiedClaims = [];
    
    for (let i = 0; i < totalClaims; i++) {
        const claim = await yieldProofContract.claims(i);
        
        if (claim.status === 1 || claim.status === 2) { // Attested or Approved
            const attestorCount = await attestorRegistryContract.attestorCountPerClaim(i);
            const totalStake = await attestorRegistryContract.totalStakePerClaim(i);
            const attestors = await attestorRegistryContract.getAttestors(i);
            
            // Get attestor trust scores
            const attestorStats = [];
            for (const attestorAddr of attestors) {
                const trustScore = await attestorRegistryContract.getTrustScore(attestorAddr);
                const stats = await attestorRegistryContract.getAttestorStats(attestorAddr);
                attestorStats.push({
                    address: attestorAddr,
                    trustScore: trustScore.toNumber(),
                    successRate: stats.totalAttestations > 0 
                        ? (stats.successful * 100 / stats.totalAttestations).toFixed(1)
                        : '0'
                });
            }
            
            verifiedClaims.push({
                claimId: i,
                assetId: claim.assetId,
                period: claim.period,
                yieldAmount: ethers.utils.formatEther(claim.yieldAmount),
                documentHash: claim.documentHash,
                issuer: claim.issuer,
                status: claim.status === 1 ? 'Attested' : 'Approved',
                attestorCount: attestorCount.toNumber(),
                totalStake: ethers.utils.formatEther(totalStake),
                attestors: attestorStats
            });
        }
    }
    
    return verifiedClaims;
}

// Example usage
const verified = await getVerifiedClaims();
console.log(`Found ${verified.length} verified claims`);
verified.forEach(claim => {
    console.log(`${claim.assetId} (${claim.period}): ${claim.yieldAmount} MNT`);
    console.log(`  Verified by ${claim.attestorCount} attestors with ${claim.totalStake} MNT stake`);
    claim.attestors.forEach(attestor => {
        console.log(`    ${attestor.address}: ${attestor.trustScore}/100 trust, ${attestor.successRate}% success`);
    });
});
```

### 3. Check Unlockable Yields

```javascript
async function getUnlockableYields() {
    const totalClaims = await yieldProofContract.getTotalClaims();
    const unlockable = [];
    
    for (let i = 0; i < totalClaims; i++) {
        const canUnlock = await yieldVaultContract.canUnlockYield(i);
        const isClaimed = await yieldVaultContract.isClaimed(i);
        
        if (canUnlock && !isClaimed) {
            const claim = await yieldProofContract.claims(i);
            unlockable.push({
                claimId: i,
                assetId: claim.assetId,
                yieldAmount: ethers.utils.formatEther(claim.yieldAmount)
            });
        }
    }
    
    return unlockable;
}
```

### 4. Unlock Yield Distribution

```javascript
async function unlockYield(claimId) {
    const canUnlock = await yieldVaultContract.canUnlockYield(claimId);
    if (!canUnlock) {
        console.log("Claim cannot be unlocked yet");
        return;
    }
    
    const tx = await yieldVaultContract.unlockYield(claimId);
    await tx.wait();
    
    console.log(`Unlocked yield for claim ${claimId}`);
}
```

### 5. Withdraw from Vault

```javascript
async function withdrawFromVault(amount) {
    const balance = await yieldVaultContract.balances(address);
    const amountWei = ethers.utils.parseEther(amount.toString());
    
    if (amountWei.gt(balance)) {
        console.log("Insufficient balance");
        return;
    }
    
    const tx = await yieldVaultContract.withdraw(amountWei);
    await tx.wait();
    
    console.log(`Withdrew ${amount} MNT from vault`);
}
```

## Utility Functions

### 1. Contract Setup

```javascript
import { ethers } from 'ethers';

// Setup provider and contracts
function setupContracts(privateKey) {
    const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.sepolia.mantle.xyz"
    );
    
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const attestorRegistry = new ethers.Contract(
        CONTRACTS.AttestorRegistry,
        ATTESTOR_REGISTRY_ABI,
        wallet
    );
    
    const yieldProof = new ethers.Contract(
        CONTRACTS.YieldProof,
        YIELD_PROOF_ABI,
        wallet
    );
    
    const yieldVault = new ethers.Contract(
        CONTRACTS.YieldVault,
        YIELD_VAULT_ABI,
        wallet
    );
    
    return { provider, wallet, attestorRegistry, yieldProof, yieldVault };
}
```

### 2. Event Monitoring

```javascript
async function monitorEvents() {
    // Monitor claim submissions
    yieldProofContract.on('YieldClaimSubmitted', (claimId, issuer, assetId, yieldAmount, submittedAt) => {
        console.log(`New claim submitted: ${claimId} by ${issuer}`);
        console.log(`Asset: ${assetId}, Yield: ${ethers.utils.formatEther(yieldAmount)} MNT`);
    });
    
    // Monitor attestations
    attestorRegistryContract.on('ClaimAttested', (claimId, attestor, stakeAmount) => {
        console.log(`Claim ${claimId} attested by ${attestor}`);
        console.log(`Stake: ${ethers.utils.formatEther(stakeAmount)} MNT`);
    });
    
    // Monitor rewards
    attestorRegistryContract.on('RewardsClaimed', (attestor, amount) => {
        console.log(`${attestor} claimed ${ethers.utils.formatEther(amount)} MNT in rewards`);
    });
}
```

### 3. Error Handling

```javascript
async function safeContractCall(contractFunction, ...args) {
    try {
        const tx = await contractFunction(...args);
        const receipt = await tx.wait();
        return { success: true, receipt };
    } catch (error) {
        console.error('Contract call failed:', error.message);
        
        // Handle specific errors
        if (error.message.includes('insufficient funds')) {
            return { success: false, error: 'Insufficient funds for transaction' };
        } else if (error.message.includes('already attested')) {
            return { success: false, error: 'Already attested to this claim' };
        } else if (error.message.includes('not registered')) {
            return { success: false, error: 'Must register as attestor first' };
        }
        
        return { success: false, error: error.message };
    }
}

// Example usage
const result = await safeContractCall(
    attestorRegistryContract.attestToClaim,
    claimId
);

if (result.success) {
    console.log('Attestation successful');
} else {
    console.error('Attestation failed:', result.error);
}
```

## Best Practices

### 1. Gas Optimization
- Batch multiple operations when possible
- Use `estimateGas()` before transactions
- Monitor gas prices and adjust accordingly

### 2. Error Handling
- Always wrap contract calls in try-catch
- Provide meaningful error messages to users
- Implement retry logic for network issues

### 3. Security
- Validate all inputs before contract calls
- Never expose private keys in client-side code
- Use environment variables for sensitive data
- Implement proper access controls

### 4. User Experience
- Show transaction progress and confirmations
- Provide clear feedback for all actions
- Handle network switching gracefully
- Cache frequently accessed data

### 5. Monitoring
- Monitor contract events for real-time updates
- Track gas usage and optimize accordingly
- Log important actions for debugging
- Set up alerts for critical events