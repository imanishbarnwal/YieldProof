# YieldProof — Integration Plan (ETHGlobal Tokyo 2026)

This document establishes the step-by-step roadmap and integration priority for YieldProof.

---

## Priority Overview

```
+-------------------------------------------------------------------------------+
|  P0: Baseline Stabilization [COMPLETED]                                       |
|  - Dependency resolution, Hardhat test suite passing (13/13), clean Next.js   |
|    Turbopack production build, monorepo scripts configured.                   |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|  P1: World ID Integration (Sybil-Proof Attestors & Issuers) [COMPLETED ✅]     |
|  - Identity verification via World ID (IDKit widget + On-chain verifier).     |
|  - Guarantees 1 human = 1 attestor; prevents self-collusion & Sybil voting.   |
|  - 18/18 smart contract tests passing; Next.js frontend builds cleanly.       |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|  P2: ENSv2 Integration (Decentralized Identity & Dynamic Profiles) [COMPLETED ✅] |
|  - Subname issuance (*.yieldproof.eth) & dynamic ENSv2 resolver records.      |
|  - Real-time resolution of trust scores, human verification, & active stake.  |
|  - 28/28 smart contract tests passing; Next.js ENS profile lookup active.     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|  P3: Curvegrid MultiBaas Integration (Fast Indexing & Audit Webhooks)         |
|  - MultiBaas REST API & event webhooks for real-time claim indexing.          |
|  - Enterprise audit logging for off-chain RWA auditors and institutional LPs. |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|  P4: Uniswap Integration (DeFi Yield Source Verification)                     |
|  - Verification of on-chain LP positions / fee yields from Uniswap V3/V4.     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|  P5: Stretch Goals & Extras (If Time Remains)                                 |
|  - Account Abstraction (ERC-4337) gas sponsorship for attestor claims.        |
|  - Push Protocol / Telegram notification alerts on new claims & rewards.      |
+-------------------------------------------------------------------------------+
```

---

## Phase Breakdown

### P0 — Baseline Stabilization (Status: Complete ✅)
- **Objective**: Ensure the existing codebase compiles, builds, and runs cleanly without any regressions or broken flows.
- **Completed Actions**:
  1. Resolved monorepo root scripts (`test`, `build`, `dev`, `contracts:*`, `frontend:*`).
  2. Verified smart contract compilation (`Solidity 0.8.20`) and complete test suite (`13 passing`).
  3. Verified Next.js 16 frontend production build (`next build` with Turbopack).
  4. Verified Pinata IPFS upload endpoint logic.

---

### P1 — World ID Integration
- **Objective**: Prevent Sybil attacks in the attestor consensus pool by requiring attestors to prove uniqueness via World ID before registering or attesting.
- **Contract Changes**:
  - Target: [`contracts/contracts/AttestorRegistry.sol`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/contracts/contracts/AttestorRegistry.sol)
  - Add World ID router address and action identifier (`app_id`, `action_id`).
  - Add `verifyProof` validation hook in `register()` or a dedicated `registerWithWorldID(uint256 root, uint256 nullifierHash, uint256[8] calldata proof)` function.
  - Store nullifier hashes to ensure 1 World ID cannot register multiple attestor addresses: `mapping(uint256 => bool) public nullifiers`.
- **Frontend Changes**:
  - Install `@worldcoin/idkit`.
  - Update [`frontend/app/attestor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/attestor/page.tsx) with `<IDKitWidget>` for biometric proof generation before calling `register()`.
  - Add visual "World ID Verified" badge for attestor cards and profiles.

---

### P2 — ENSv2 Integration
- **Objective**: Human-readable naming, avatars, and decentralized metadata for all network actors.
- **Contract / Metadata Changes**:
  - Custom resolver binding or CCIP-read gateway to expose attestor trust scores and historical volume under `.yieldproof.eth`.
- **Frontend Changes**:
  - Update [`frontend/components/Navbar.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/components/Navbar.tsx), [`frontend/app/attestor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/attestor/page.tsx), [`frontend/app/issuer/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/issuer/page.tsx), and [`frontend/app/investor/page.tsx`](file:///Users/imanishbarnwal/Downloads/yieldproof/YieldProof/frontend/app/investor/page.tsx) to resolve ENS primary names and avatars.
  - Fallback cleanly to truncated addresses when no ENS record exists.

---

### P3 — Curvegrid MultiBaas Integration
- **Objective**: MultiBaas blockchain middleware for real-time contract event ingestion, indexing, and enterprise audit dashboard queries.
- **Integration Points**:
  - Register `AttestorRegistry`, `YieldProof`, and `YieldVault` contracts with MultiBaas API.
  - Configure event listeners for `YieldClaimSubmitted`, `ClaimAttested`, `VerificationRecorded`, and `YieldUnlocked`.
  - Add frontend / API route consumer in Next.js querying MultiBaas endpoints for instant indexing.

---

### P4 — Uniswap Integration (If Useful)
- **Objective**: Support hybrid RWA + on-chain DeFi yield validation by querying Uniswap V3 LP positions or swap fees.
- **Integration Points**:
  - Integrate Uniswap V3 `NonfungiblePositionManager` or Pool contract interfaces for LP fee collection verification.

---

### P5 — Stretch Goals (Only if Time Remains)
- Gasless attestor actions via Account Abstraction (ERC-4337 / Paymaster).
- Real-time notification webhooks (Telegram / Push Protocol) when a new yield claim is submitted for attestation.
