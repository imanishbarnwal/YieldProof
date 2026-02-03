# Project Structure

## Overview

YieldProof is organized as a monorepo with smart contracts and frontend application:

```
YieldProof/
├── contracts/                 # Smart contracts and deployment
├── frontend/                  # Next.js web application
├── docs/                     # Documentation
├── .kiro/                    # Kiro IDE configuration
└── README.md                 # Main project documentation
```

## Smart Contracts (`/contracts`)

```
contracts/
├── contracts/                # Solidity source files
│   ├── AttestorRegistry.sol  # Core attestation and staking logic
│   ├── YieldProof.sol       # Yield claim management
│   └── YieldVault.sol       # Investor capital management
├── scripts/                 # Deployment scripts
│   └── deploy.ts           # Main deployment script
├── test/                   # Contract tests
│   ├── FullFlowTest.js     # End-to-end integration tests
│   └── LifetimeRewardsTest.js # Reward tracking tests
├── artifacts/              # Compiled contract artifacts
├── cache/                  # Hardhat cache
├── hardhat.config.js       # Hardhat configuration
├── package.json           # Contract dependencies
└── tsconfig.json          # TypeScript configuration
```

### Key Contract Files

**AttestorRegistry.sol** (~400 LOC)
- Attestor registration and staking
- Multi-party attestation coordination
- Reward distribution and trust scoring
- Flagging and slashing mechanisms

**YieldProof.sol** (~200 LOC)
- Yield claim submission and lifecycle
- Integration with AttestorRegistry
- Status management and fee handling

**YieldVault.sol** (~200 LOC)
- Investor deposit management
- Yield distribution based on verified claims
- Proportional reward sharing

## Frontend Application (`/frontend`)

```
frontend/
├── app/                     # Next.js 14 App Router
│   ├── api/                # API routes
│   │   └── ipfs/          # IPFS upload endpoints
│   ├── attestor/          # Attestor dashboard
│   ├── config/            # Contract configurations
│   │   ├── chains.ts      # Network configurations
│   │   └── contracts.ts   # Contract addresses and ABIs
│   ├── investor/          # Investor dashboard
│   ├── issuer/            # Issuer dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx          # Home page
│   └── providers.tsx     # Web3 and theme providers
├── components/             # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx    # Button component
│   │   ├── Card.tsx      # Card component
│   │   ├── Input.tsx     # Input component
│   │   ├── Loading.tsx   # Loading states
│   │   ├── TransactionProgress.tsx # Transaction tracking
│   │   └── ...          # Other UI components
│   ├── ContractGuardrail.tsx # Contract interaction safety
│   ├── LayoutClient.tsx  # Client-side layout logic
│   ├── Navbar.tsx       # Navigation component
│   ├── NetworkWarning.tsx # Network mismatch warnings
│   └── WalletButton.tsx # Wallet connection
├── contexts/              # React contexts
│   └── TransactionContext.tsx # Transaction state management
├── hooks/                # Custom React hooks
│   ├── useRequireWalletAndNetwork.ts # Wallet validation
│   └── useTransaction.ts # Transaction handling
├── lib/                  # Utilities and configurations
│   ├── demoData.ts      # Sample data for development
│   └── utils.ts         # Utility functions
├── public/              # Static assets
├── .env                # Environment variables (local)
├── .env.example        # Environment template
├── components.json     # shadcn/ui configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Frontend dependencies
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

### Key Frontend Features

**Multi-Role Interface:**
- Issuer dashboard for claim submission
- Attestor dashboard for verification
- Investor dashboard for capital management

**Web3 Integration:**
- RainbowKit wallet connection
- Wagmi for contract interactions
- Viem for low-level blockchain operations

**UI/UX:**
- Glass-morphism design system
- Responsive mobile-first design
- Framer Motion animations
- Dark/light theme support

## Documentation (`/docs`)

```
docs/
├── API_REFERENCE.md        # Contract API documentation
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
├── PROJECT_STRUCTURE.md    # This file
├── SECURITY_ANALYSIS.md    # Security considerations
├── TEST_FLOW_GUIDE.md     # Testing workflows
├── TRANSACTION_PROGRESS_USAGE.md # Transaction UX guide
└── TRANSACTION_REFACTOR_EXAMPLE.md # Code examples
```

## Configuration Files

### Root Level
- `package.json` - Root package configuration
- `package-lock.json` - Dependency lock file
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `UPGRADE_NOTES.md` - Version upgrade notes

### IDE Configuration (`.kiro/`)
- Kiro IDE specific settings and specifications
- Development workflow configurations

## Key Dependencies

### Smart Contracts
- **Hardhat** - Development environment
- **OpenZeppelin** - Security-audited contract libraries
- **Ethers.js** - Ethereum library for testing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Viem** - TypeScript Ethereum library

## Development Workflow

### Local Development
1. **Contracts:** `cd contracts && npm test`
2. **Frontend:** `cd frontend && npm run dev`
3. **Full Stack:** Run both simultaneously

### Deployment
1. **Contracts:** `cd contracts && npm run deploy`
2. **Frontend:** `cd frontend && npm run build`
3. **Verification:** Update contract addresses in frontend config

### Testing
- **Unit Tests:** Individual contract function testing
- **Integration Tests:** Full workflow testing
- **Frontend Tests:** Component and interaction testing

## Architecture Patterns

### Smart Contracts
- **Modular Design:** Separate concerns across contracts
- **Upgradeable Pattern:** Owner-controlled upgrades (temporary)
- **Event-Driven:** Comprehensive event logging
- **Gas Optimization:** Efficient storage and computation

### Frontend
- **Component-Based:** Reusable UI components
- **Hook-Based State:** Custom hooks for Web3 interactions
- **Context Providers:** Global state management
- **Type Safety:** Full TypeScript coverage

### Integration
- **Contract ABIs:** Auto-generated and version-controlled
- **Environment Config:** Network-specific configurations
- **Error Handling:** Comprehensive error states and recovery
- **Transaction UX:** Progress tracking and user feedback

## Security Considerations

### Smart Contracts
- OpenZeppelin security patterns
- Comprehensive test coverage
- Access control mechanisms
- Economic security models

### Frontend
- Environment variable protection
- Input validation and sanitization
- Secure wallet integration
- HTTPS enforcement

### Infrastructure
- IPFS for decentralized storage
- Multiple RPC endpoints
- Contract verification on explorers
- Monitoring and alerting systems