# YieldProof — Hackathon Architecture (ETHGlobal Tokyo 2026)

YieldProof is a decentralized Real World Asset (RWA) yield verification protocol enabling asset issuers to cryptographically prove off-chain/on-chain yield disclosures, validated by independent staked attestors, and enforced by programmatic vault distribution mechanisms.

---

## 1. System Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  USER / CLIENT                                    |
|   +-------------------+       +--------------------+       +------------------+   |
|   |  Issuer Portal    |       |  Attestor Portal   |       |  Investor Portal |   |
|   |  (/issuer)        |       |  (/attestor)       |       |  (/investor)     |   |
|   +---------+---------+       +---------+----------+       +---------+--------+   |
+-------------|---------------------------|----------------------------|------------+
              |                           |                            |
              | (Pinata IPFS Upload)      |                            |
              v                           |                            |
       [ IPFS Gateway ]                   |                            |
              |                           |                            |
+-------------v---------------------------v----------------------------v------------+
|                          FRONTEND WEB3 CLIENT LAYER                                |
|   - Next.js 16 (App Router + Turbopack)                                           |
|   - Wagmi v2 / Viem v2 / RainbowKit v2                                            |
|   - TanStack React Query v5                                                       |
|   - TailwindCSS + Framer Motion                                                   |
+-----------------------------------------------------------------------------------+
                                          |
                         RPC (Mantle Sepolia / Chain 5003)
                                          |
+-----------------------------------------v-----------------------------------------+
|                              SMART CONTRACT LAYER                                 |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                            YieldProof.sol                                 |   |
|   |   - submitClaim(assetId, period, yieldAmount, documentHash) {payable}     |   |
|   |   - forwards attestation fee (0.9 MNT) to AttestorRegistry                |   |
|   |   - records YieldClaim struct & status transitions                        |   |
|   +-------------------+-------------------------------------------------------+   |
|                       |                                                           |
|                       v                                                           |
|   +---------------------------------------------------------------------------+   |
|   |                          AttestorRegistry.sol                             |   |
|   |   - register() {payable} / stakeETH() {payable}                           |   |
|   |   - attestToClaim(claimId) / flagClaim(claimId, reason)                   |   |
|   |   - finalizeAndReward(claimId) [requires >= 3 attestors]                  |   |
|   |   - claimRewards() (0.3 MNT per attestor) / getTrustScore(attestor)       |   |
|   |   - slash(attestor, amount) [Owner/Governance]                            |   |
|   +-------------------+-------------------------------------------------------+   |
|                       |                                                           |
|                       v                                                           |
|   +---------------------------------------------------------------------------+   |
|   |                            YieldVault.sol                                 |   |
|   |   - deposit() {payable} / withdraw(amount)                                |   |
|   |   - canUnlockYield(claimId) [checks AttestorRegistry >= 3 & unflagged]    |   |
|   |   - unlockYield(claimId) [releases verified yield payout to depositors]   |   |
|   |   - claimYieldShare(claimId) [pro-rata distribution per investor]         |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Smart Contracts

| Contract | File Path | Role & Key Responsibilities |
| :--- | :--- | :--- |
| **`AttestorRegistry.sol`** | [`contracts/contracts/AttestorRegistry.sol`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/contracts/contracts/AttestorRegistry.sol) | Staking pool, attestor registration, consensus quorum tracking (`MIN_REQUIRED_ATTESTORS = 3`), reward pool management (`ATTESTATION_FEE = 0.9 MNT`, `REWARD_PER_ATTESTATION = 0.3 MNT`), slashing, and reputation/trust scoring. |
| **`YieldProof.sol`** | [`contracts/contracts/YieldProof.sol`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/contracts/contracts/YieldProof.sol) | Central registry of yield claims. Enforces fee payment on claim submission, holds claim metadata (asset ID, reporting period, claimed yield amount, IPFS document hash), and tracks claim status lifecycle (`Pending`, `Attested`, `Approved`, `Challenged`). |
| **`YieldVault.sol`** | [`contracts/contracts/YieldVault.sol`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/contracts/contracts/YieldVault.sol) | RealFi investor vault. Accepts liquidity deposits and enforces that yield distributions only unlock once claims achieve valid multi-attestor consensus in `AttestorRegistry`. |

---

## 3. Frontend Architecture

- **Framework**: Next.js 16.1.1 (App Router) with Turbopack compiler.
- **Web3 Integrations**:
  - `wagmi` `^2.19.5` + `viem` `^2.44.1`
  - `@rainbow-me/rainbowkit` `^2.2.10`
  - `@tanstack/react-query` `^5.90.16`
- **IPFS Evidence Pipeline**: Next.js Server Route [`/api/ipfs/upload`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/api/ipfs/upload/route.ts) connects to Pinata IPFS API (`pinFileToIPFS`) returning CIDs formatted as `https://gateway.pinata.cloud/ipfs/{cid}`.
- **Portals**:
  1. [`app/issuer/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/issuer/page.tsx): Document upload, claim creation with fee payment, disclosure tracking.
  2. [`app/attestor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/attestor/page.tsx): Attestor staking, claim review & verification/flagging, rewards withdrawal, trust score analytics.
  3. [`app/investor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/investor/page.tsx): Vault liquidity management, disclosure monitoring, verified yield unlocking and claiming.
  4. [`app/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/page.tsx): Protocol dashboard & high-level statistics.

---

## 4. Current Deployment & Network Configuration

- **Primary Network**: Mantle Sepolia Testnet
  - **Chain ID**: `5003`
  - **RPC URL**: `https://rpc.sepolia.mantle.xyz`
  - **Explorer**: `https://explorer.sepolia.mantle.xyz`
  - **Native Token**: `MNT` (18 decimals)
- **Active Deployed Addresses**:
  - `AttestorRegistry`: `0x1c152de6172BDB84b0871731Ef494d12C7691C07`
  - `YieldProof`: `0x723A0992D07Ed6e6789Fcdcfd63b05634302586c`
  - `YieldVault`: `0x671dA4C8D9277429e58fbFCa46C3163a17b97294`
- **ABI & Config**: Defined in [`frontend/app/config/contracts.ts`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/config/contracts.ts).

---

## 5. End-to-End Current User Journey

```
[1. Wallet Connection]
  └── User connects wallet via RainbowKit on Mantle Sepolia (5003).

[2. Attestor Registration & Staking]
  └── User navigates to /attestor.
  └── Calls AttestorRegistry.register{value: stakeAmount}() (e.g. 1.0 MNT).
  └── Minimum required stake is locked; Attestor is now eligible to verify claims.

[3. Claim Creation by Issuer]
  └── RWA Issuer navigates to /issuer.
  └── Uploads supporting audit proof (PDF/statement) via Pinata IPFS -> receives CID.
  └── Fills claim details: Asset ID (e.g. 'TBILL-USD-2026'), Period ('Q1-2026'), Yield Amount.
  └── Calls YieldProof.submitClaim{value: 0.9 MNT}(...).
  └── 0.9 MNT attestation fee is forwarded to AttestorRegistry to fund attestor rewards.

[4. Attestor Participation]
  └── Registered attestors view pending claims on /attestor.
  └── Attestors inspect evidence link (IPFS document).
  └── If valid: Call AttestorRegistry.attestToClaim(claimId).
  └── If fraudulent/invalid: Call AttestorRegistry.flagClaim(claimId, reason).

[5. Consensus & Verification Finalization]
  └── Once >= 3 attestors have attested (and claim is unflagged), any party calls:
      AttestorRegistry.finalizeAndReward(claimId).
  └── Rewards (0.3 MNT each) are credited to the 3 attestors.
  └── Attestors can withdraw accumulated rewards via AttestorRegistry.claimRewards().
  └── Trust scores are automatically calculated (0-100) based on accuracy + history.

[6. Final Verified Result & Investor Distribution]
  └── Investor on /investor sees the claim status transition to 'Verified'.
  └── Investor / protocol calls YieldVault.unlockYield(claimId).
  └── Vault verifies consensus through canUnlockYield(claimId).
  └── Verified yield is unlocked and credited proportionally to all vault depositors.
```

---

## 6. Integration Points

### A. World ID Integration Points
- **Goal**: Sybil resistance and Proof of Humanity for Attestors (ensuring 1 human = 1 attestor) and verified Issuer credentialing.
- **Smart Contract Target**: [`contracts/contracts/AttestorRegistry.sol`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/contracts/contracts/AttestorRegistry.sol)
  - Add `IWorldID public worldIdRouter` and nullifier tracking: `mapping(uint256 => bool) public nullifierHashes`.
  - Update `register()` or add `registerWithWorldID(uint256 root, uint256 nullifierHash, uint256[8] calldata proof)`.
- **Frontend Target**:
  - Install `@worldcoin/idkit`.
  - Add IDKit widget modal to [`frontend/app/attestor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/attestor/page.tsx) prior to calling registration.
  - Optional badge on [`frontend/components/Navbar.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/components/Navbar.tsx) or attestor cards displaying "World ID Verified".

### B. ENSv2 Integration Points
- **Goal**: Web3 human-readable identities for Attestors & Issuers, trust score metadata in ENS records, and reverse resolution.
- **Smart Contract Target**:
  - Standard ERC-3668 / CCIP-Read or custom ENS text-record resolver integration if storing trust scores directly into subnames (e.g. `attestor1.yieldproof.eth`).
- **Frontend Target**:
  - Utilize Viem / Wagmi built-in `useEnsName` & `useEnsAvatar` across [`frontend/components/Navbar.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/components/Navbar.tsx), [`frontend/app/attestor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/attestor/page.tsx), and [`frontend/app/issuer/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/issuer/page.tsx).
  - Add ENS name display badge with fallback to truncated addresses.

### C. Curvegrid Integration Points
- **Goal**: MultiBaas API integration for enterprise blockchain indexing, smart contract event monitoring, and fast REST webhook queries for yield claims and attestations.
- **Backend / Integration Target**:
  - MultiBaas configuration script / webhook listener in Next.js API routes [`frontend/app/api/curvegrid/...`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/api) or deploy script integration.
  - MultiBaas contract deployment & event subscription sync (`YieldClaimSubmitted`, `ClaimAttested`, `VerificationRecorded`).

### D. Optional Uniswap / DeFi Integration Points
- **Goal**: Verify on-chain LP fee yield from Uniswap V3/V4 positions directly alongside RWA disclosures.
- **Smart Contract Target**: Adaptor interface querying Uniswap `NonfungiblePositionManager` or pool cumulative fee growth to substantiate claimed yield.
