# World ID Integration — YieldProof (ETHGlobal Tokyo 2026)

YieldProof integrates **World ID** (Proof of Humanity & Sybil Resistance) to protect RWA yield verification consensus from Sybil attacks, collusive multi-voting, and validator spoofing.

---

## 1. Why World ID is Used

Real World Asset (RWA) protocols rely on independent human auditors and verification agents to review off-chain proof documents (bank attestations, treasury statements, SPV disclosures).

- **The Problem**: In permissionless stake-based systems, a malicious entity with capital can spin up 100 pseudo-identities, stake minimal capital across all of them, and self-attest/collude to validate false or overstated yield disclosures.
- **The Solution**: World ID provides cryptographic Proof of Personhood. By enforcing that every attestor wallet must be backed by a verified, unique human (1 human = 1 attestor nullifier), YieldProof guarantees that economic consensus represents independent, decentralized verification.

---

## 2. Threat Model & Security Properties

| Threat | Attack Vector | World ID Mitigation |
| :--- | :--- | :--- |
| **Sybil Consensus Flooding** | An attacker creates 10+ wallets to achieve the 3-attestor quorum on fraudulent claims. | **Mitigated**: Each World ID can only register **one** attestor address. Reusing the same nullifier with another wallet reverts on-chain with `AttestorRegistry: World ID already used`. |
| **Identity / Biometric Leakage** | Storing PII or biometric hashes violates user privacy and creates compliance liabilities. | **Zero Knowledge**: YieldProof never receives, handles, or stores names, emails, faces, or biometric data. Only zero-knowledge proofs and single-action nullifier hashes are verified. |
| **Replay & Cross-App Tracking** | Using global identity identifiers enables cross-application tracking of users. | **Isolated Action Nullifiers**: The external nullifier is derived from `hashToField(app_id, action_id)` (`verify-attestor`), ensuring nullifiers cannot be linked across different applications or actions. |
| **Front-Running & Signal Tampering** | An attacker intercepts a valid proof and submits it with their own wallet address. | **Signal Binding**: The caller's `msg.sender` address is encoded as the ZK signal (`abi.encodePacked(msg.sender).hashToField()`), invalidating the proof if used by any other wallet address. |

---

## 3. Architecture & Data Flow

```
[ User Wallet ]
      │
      ▼
[ Step 1: Connect Wallet ] (RainbowKit / Wagmi)
      │
      ▼
[ Step 2: World ID Verification ]
      │ ───► World App / Simulator
      │ ───► Generates ZK-SNARK Proof (merkle_root, nullifier_hash, proof)
      │ ───► Validated via /api/world-id/verify (Developer Portal API / Simulator)
      │
      ▼
[ Step 3: Set Stake Amount ] (e.g. 1.0 MNT)
      │
      ▼
[ Step 4: Register & Stake On-Chain ]
      │ ───► Calls AttestorRegistry.registerWithWorldID(root, nullifierHash, proof){value: stake}
      │ ───► IWorldID.verifyProof(root, groupId, signalHash, nullifierHash, externalNullifier, proof)
      │ ───► Stores nullifierHashes[nullifierHash] = true
      │ ───► Sets isWorldIdVerified[msg.sender] = true
      │ ───► Sets attestors[msg.sender].isRegistered = true & credits stake
      │
      ▼
[ Step 5: Active Attestor Privileges ]
      └── Attest to RWA yield claims, earn 0.3 MNT rewards per consensus, build Trust Score
```

---

## 4. On-Chain Contracts & Methods

### `AttestorRegistry.sol`
- **`registerWithWorldID(uint256 root, uint256 nullifierHash, uint256[8] calldata proof)`**:
  Atomic transaction that verifies the ZK proof, checks nullifier uniqueness, records World ID verified status, marks the address as registered, and locks initial stake.
- **`verifyWorldID(uint256 root, uint256 nullifierHash, uint256[8] calldata proof)`**:
  Allows existing attestors to link their World ID proof.
- **`setWorldID(address _worldId, string memory _appId, string memory _actionId)`**:
  Owner configuration to bind the router and action identifiers and enable `requireWorldID = true`.
- **`nullifierHashes(uint256) -> bool`**:
  Tracks spent nullifiers to prevent Sybil multi-wallet registrations.
- **`isWorldIdVerified(address) -> bool`**:
  Public getter indicating whether an address has active World ID verification.

---

## 5. Privacy & Data Storage Policy

YieldProof strictly conforms to the World ID privacy standard:
- ❌ **NEVER Stored**: Name, email, phone number, biometric iris/face hashes, IP addresses.
- ✅ **Stored On-Chain**:
  - `nullifierHash` (`uint256`): Action-scoped mathematical pseudonym guaranteeing uniqueness.
  - `isWorldIdVerified` (`bool`): Authorization status boolean.

---

## 6. Environment Variables

In `frontend/.env.local`:
```bash
# World ID Configuration
NEXT_PUBLIC_WLD_APP_ID=app_staging_yieldproof
NEXT_PUBLIC_WLD_ACTION=verify-attestor

# Pinata IPFS Storage
PINATA_API_KEY=799b320030b36b0b1f14
PINATA_API_SECRET=077e0d3abfcb3ba834c6dda91165329b023c67a70b37ad9971556acdc0fcb2ad
```

---

## 7. How to Test & Demo

### Running Smart Contract Tests
```bash
npm test
# or: npm run contracts:test
```
**Test Coverage Includes:**
1. Unverified wallet blocked from registering when World ID is required.
2. Verified wallet registers with World ID proof and stake in 1 atomic call.
3. Sybil attack prevention: duplicate World ID nullifier rejected on new wallet.
4. Failed proof verification rejected by verifier router.
5. Unverified attestors blocked from voting on claims.
6. Full end-to-end consensus, finalization, and reward claims with 3 verified humans.

### Running Frontend Locally
```bash
npm run dev
# Open http://localhost:3000/attestor
```

### Deterministic Demo Steps (for Judges):
1. **Connect Wallet**: Connect MetaMask/RainbowKit to Mantle Sepolia (Chain ID 5003).
2. **Observe Guardrail**: Notice registration is locked with message `"Complete World ID to Register"`.
3. **Click "Verify with World ID"**:
   - Opens the World ID verification dialog.
   - Click **"Verify Identity"** to execute zero-knowledge proof generation and API validation.
   - Status transitions to `Proof Ready ✓`.
4. **Stake & Register**:
   - Enter `1.0` MNT stake.
   - Click **"Register as Verified Attestor"**.
   - Transaction submits `registerWithWorldID(...)` with the ZK proof.
5. **Verified Dashboard**:
   - Status badge shows `Verified Human ✓ (ON-CHAIN ACTIVE)`.
   - Attestor privileges unlocked to verify pending RWA yield disclosures.
6. **Sybil Defense Demonstration**:
   - Switch wallet in MetaMask to a secondary account.
   - Attempting to register with the same human proof fails uniqueness enforcement.
