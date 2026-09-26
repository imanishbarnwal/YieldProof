# YieldProof — Deployment Guide

## 1. Network Environments

### Primary Network: Mantle Sepolia Testnet
- **Network Name**: Mantle Sepolia
- **Chain ID**: `5003`
- **Currency**: `MNT` (18 decimals)
- **RPC Endpoint**: `https://rpc.sepolia.mantle.xyz`
- **Block Explorer**: [https://explorer.sepolia.mantle.xyz](https://explorer.sepolia.mantle.xyz)

---

## 2. Deployed Smart Contracts

| Contract | Address | Network | Description |
| :--- | :--- | :--- | :--- |
| **AttestorRegistry** | `0x1c152de6172BDB84b0871731Ef494d12C7691C07` | Mantle Sepolia | Staking, World ID Sybil nullifiers, reputation & rewards |
| **YieldProof** | `0x723A0992D07Ed6e6789Fcdcfd63b05634302586c` | Mantle Sepolia | RWA yield claim submission, IPFS proof hashes, multi-party consensus |
| **YieldVault** | `0x671dA4C8D9277429e58fbFCa46C3163a17b97294` | Mantle Sepolia | Institutional capital vault, automated yield distribution |
| **YieldProofENSManager** | `0xB300d6D41c2f9a8fa3Fa3F0544EF829e4a33C12f` | Mantle Sepolia (Chain 5003) | Portable `*.yieldproof.eth` subname issuance & dynamic reputation resolver |

---

## 3. Contract Deployment Procedure

From `contracts/`:

```bash
# 1. Compile contracts
npx hardhat compile

# 2. Deploy to Mantle Sepolia
npx hardhat run scripts/deploy.ts --network mantleSepolia
```

### Deployment Order:
1. `AttestorRegistry.sol`
2. `YieldProof.sol` (injects `AttestorRegistry` address)
3. `YieldVault.sol` (injects `YieldProof` and `AttestorRegistry` addresses)
4. `YieldProofENSManager.sol` (injects `AttestorRegistry` address and parent namespace `yieldproof.eth`)

---

## 4. Environment Variables Configuration

Copy `.env.example` or update `frontend/.env.local`:

```env
# Pinata IPFS for RWA Disclosure Documents
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret

# World ID Configuration
NEXT_PUBLIC_WLD_APP_ID=app_staging_yieldproof
NEXT_PUBLIC_WLD_ACTION=verify-attestor

# ENS Configuration
NEXT_PUBLIC_ENS_PARENT_NAME=yieldproof.eth
NEXT_PUBLIC_ENS_MANAGER_ADDRESS=0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8
```

---

## 5. Running the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run frontend:build
```
