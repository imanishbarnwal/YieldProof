# Deployment Guide

## Prerequisites

- Node.js 18+
- Hardhat
- Mantle Sepolia testnet MNT

## Contract Deployment Order

### 1. Deploy AttestorRegistry

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network mantleTestnet
```

The deployment script will deploy contracts in the correct order:
1. AttestorRegistry (standalone)
2. YieldProof (requires AttestorRegistry address)
3. YieldVault (requires YieldProof and AttestorRegistry addresses)

### 2. Verify Contracts

```bash
npx hardhat verify --network mantleTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
# Verify AttestorRegistry (no constructor args)
npx hardhat verify --network mantleTestnet 0x1c152de6172BDB84b0871731Ef494d12C7691C07

# Verify YieldProof (with AttestorRegistry address)
npx hardhat verify --network mantleTestnet 0x723A0992D07Ed6e6789Fcdcfd63b05634302586c 0x1c152de6172BDB84b0871731Ef494d12C7691C07

# Verify YieldVault (with YieldProof, AttestorRegistry, and minStake)
npx hardhat verify --network mantleTestnet 0x671dA4C8D9277429e58fbFCa46C3163a17b97294 0x723A0992D07Ed6e6789Fcdcfd63b05634302586c 0x1c152de6172BDB84b0871731Ef494d12C7691C07 1000000000000000000
```

## Frontend Configuration

### 1. Update Contract Addresses

Edit `frontend/app/config/contracts.ts`:

```typescript
export const CONTRACTS = {
    AttestorRegistry: {
        address: "0x1c152de6172BDB84b0871731Ef494d12C7691C07",
        abi: [/* ABI array */]
    },
    YieldProof: {
        address: "0x723A0992D07Ed6e6789Fcdcfd63b05634302586c",
        abi: [/* ABI array */]
    },
    YieldVault: {
        address: "0x671dA4C8D9277429e58fbFCa46C3163a17b97294",
        abi: [/* ABI array */]
    }
};
```

### 2. Environment Configuration

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false
```

### 3. Deploy Frontend

```bash
cd frontend
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel --prod
```

## Network Configuration

### Hardhat Config

Ensure `contracts/hardhat.config.js` includes:

```javascript
networks: {
    mantleTestnet: {
        url: "https://rpc.sepolia.mantle.xyz",
        accounts: [process.env.PRIVATE_KEY],
        chainId: 5003
    }
}
```

### Environment Variables

Create `contracts/.env`:
```env
PRIVATE_KEY=your_private_key_here
MANTLE_SEPOLIA_RPC=https://rpc.sepolia.mantle.xyz
```

## Post-Deployment Verification

### 1. Test Contract Interactions

```bash
cd contracts
npm test
```

### 2. Verify Frontend Integration

1. Visit deployed frontend URL
2. Connect wallet to Mantle Sepolia
3. Test each user role:
   - Issuer: Submit a test claim
   - Attestor: Register and attest
   - Investor: Deposit and view claims

### 3. Monitor Contract Events

Use Mantle Sepolia explorer to monitor:
- AttestorRegistered events
- YieldClaimSubmitted events
- ClaimAttested events
- RewardsClaimed events

## Troubleshooting

### Common Issues

1. **Gas Estimation Failed**
   - Ensure sufficient MNT balance
   - Check network connectivity
   - Verify contract addresses

2. **Transaction Reverted**
   - Check function requirements
   - Verify input parameters
   - Ensure proper access control

3. **Frontend Connection Issues**
   - Verify RPC URL
   - Check contract addresses
   - Ensure wallet is on correct network

### Debug Commands

```bash
# Check contract deployment
npx hardhat console --network mantleTestnet

# Verify contract code
npx hardhat verify --help

# Check network status
curl -X POST https://rpc.sepolia.mantle.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```