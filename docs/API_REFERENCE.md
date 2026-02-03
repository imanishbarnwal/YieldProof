# API Reference

## AttestorRegistry

### Read Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `attestors(address)` | `(bool isRegistered, uint256 stake)` | Attestor registration status |
| `hasAttested(uint256, address)` | `bool` | Check if attestor verified claim |
| `totalStakePerClaim(uint256)` | `uint256` | Total stake backing claim |
| `attestorCountPerClaim(uint256)` | `uint256` | Number of attestors |
| `getAttestors(uint256)` | `address[]` | List of attestors for claim |
| `getTrustScore(address)` | `uint256` | Trust score (0-100) |
| `getAttestorStats(address)` | `(uint256,uint256,uint256,uint256,uint256)` | Comprehensive stats |
| `getAttestationFee()` | `uint256` | Required fee (0.9 ETH) |
| `getRewardPoolBalance()` | `uint256` | Available rewards |

### Write Functions

| Function | Access | Description |
|----------|--------|-------------|
| `register()` | Public | Register as attestor |
| `stakeETH()` | Public | Add stake |
| `attestToClaim(uint256)` | Attestor | Verify claim |
| `flagClaim(uint256,string)` | Attestor | Flag suspicious claim |
| `finalizeAndReward(uint256)` | Public | Finalize claim with 3+ attestations |
| `claimRewards()` | Attestor | Withdraw earned rewards |
| `slash(address,uint256)` | Owner | Slash fraudulent attestor |

## YieldProof

### Read Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `claims(uint256)` | `YieldClaim` | Claim details by ID |
| `getTotalClaims()` | `uint256` | Total claims submitted |
| `getRequiredAttestationFee()` | `uint256` | Current fee from registry |

### Write Functions

| Function | Access | Description |
|----------|--------|-------------|
| `submitClaim(string,string,uint256,string)` | Public | Submit new yield claim |
| `updateClaimStatus(uint256)` | Public | Update claim based on attestations |
| `updateClaimStatus(uint256,ClaimStatus)` | Admin | Manually set status |

## YieldVault

### Read Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `balances(address)` | `uint256` | User balance |
| `totalDeposits()` | `uint256` | Total vault deposits |
| `canUnlockYield(uint256)` | `bool` | Check if claim can be unlocked |
| `getPendingDistributions()` | `uint256` | Total pending yield |

### Write Functions

| Function | Access | Description |
|----------|--------|-------------|
| `deposit()` | Public | Deposit ETH to vault |
| `withdraw(uint256)` | Public | Withdraw ETH from vault |
| `unlockYield(uint256)` | Public | Unlock verified yield claim |
| `claimYieldShare(uint256)` | Public | Claim proportional yield share |