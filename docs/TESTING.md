# YieldProof — Testing & Validation Guide

## 1. Test Suite Architecture

YieldProof implements comprehensive automated test suites across all smart contract modules and frontend builds.

```
Total Contract Tests: 28 passing (100%)
- Core Economic Flow: 8 tests
- Lifetime Rewards Tracking: 5 tests
- World ID Sybil Resistance: 6 tests
- ENSv2 Identity & Reputation Layer: 9 tests
```

---

## 2. Running Tests

### A. Smart Contract Tests
```bash
npm run contracts:test
# or from root
npm test
```

### B. Frontend Production Build & Typecheck
```bash
npm run frontend:build
```

---

## 3. Test Coverage Breakdown

### 1. World ID Sybil Resistance (`contracts/test/WorldIDTest.js`)
* ✔ **Test 1**: Rejects registration of unverified wallets when `requireWorldID` is enabled.
* ✔ **Test 2**: Allows verified human to register with valid ZK proof and stake.
* ✔ **Test 3**: Rejects duplicate registration attempts reusing the same World ID nullifier across different wallet addresses.
* ✔ **Test 4**: Rejects invalid or forged ZK-SNARK proofs.
* ✔ **Test 5**: Blocks non-verified attestors from participating in claim voting.
* ✔ **Test 6**: Complete end-to-end consensus flow with 3 verified human attestors.

### 2. ENSv2 Identity & Dynamic Resolver (`contracts/test/ENSTest.js`)
* ✔ **Test 1**: Approved attestor can issue custom subname (`attestor-007.yieldproof.eth`).
* ✔ **Test 2**: Supports deterministic sequential subname auto-assignment (`attestor-1.yieldproof.eth`).
* ✔ **Test 3**: Prevents duplicate subname registration collisions.
* ✔ **Test 4**: Rejects subname issuance requests from non-attestor or unapproved wallets.
* ✔ **Test 5**: Resolves `addr(bytes32 node)` to the correct attestor address.
* ✔ **Test 6**: Dynamically resolves text records directly from live protocol state (`app/yieldproof/status`, `trust-score`, `world-verified`, `claims-verified`, `stake`).
* ✔ **Test 7**: Rejects unauthorized `setText` modifications.
* ✔ **Test 8**: Allows owner/attestor to set custom text records.
* ✔ **Test 9**: Returns complete aggregated profile via `getAttestorProfile`.

### 3. Core Economics & Multi-Party Attestation (`contracts/test/YieldProofNewEconomics.js` & `LifetimeRewardsTest.js`)
* ✔ Economic balance verification (fees = rewards = 0.9 MNT total, 0.3 MNT per attestor).
* ✔ Positive economic profitability for honest attestors.
* ✔ Multi-claim lifetime rewards tracking.
* ✔ Automated trust score calculation based on verification accuracy.

---

## 4. Manual Verification Flow for Demo

1. **Step 1 — Attestor Setup**: Navigate to `/attestor`, complete World ID verification via IDKit widget, and stake 2 MNT.
2. **Step 2 — ENS Identity**: Click **"Create ENS Identity"**, issue `attestor-007.yieldproof.eth`.
3. **Step 3 — ENS Lookup**: Navigate to `/ens`, search `attestor-007.yieldproof.eth`, verify that World ID status, Trust Score, and wallet match live on-chain state.
4. **Step 4 — Issuer Flow**: Navigate to `/issuer`, upload disclosure PDF to IPFS via Pinata, submit claim with 0.9 MNT fee.
5. **Step 5 — Attestation & Consensus**: 3 attestors approve the claim; status becomes Verified; rewards are distributed.
