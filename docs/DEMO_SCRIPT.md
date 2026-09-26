# YieldProof — 3-Minute Live Demo Script

**ETHGlobal Tokyo 2026 Presentation Guide**

---

### Timing Breakdown (3:00 Max)

| Timestamp | Phase | Action / Screen | Key Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:20** | **The Problem** | Landing Page (`/`) | *"Real-World Assets are coming on-chain, but RWA yields occur off-chain in bank accounts and private credit ledgers. Traditional oracles can't read off-chain audit PDFs, and decentralized voting is vulnerable to Sybil manipulation."* |
| **0:20 - 0:45** | **RWA Claim Submission** | Issuer Portal (`/issuer`) | *"As an RWA asset originator, I submit a 200 MNT yield disclosure for US Treasury Bills. I attach an immutable IPFS document hash with signed custodian statements and deposit the 0.9 MNT attestation fee."* |
| **0:45 - 1:15** | **World ID Proof of Personhood** | Attestor Dashboard (`/attestor`) | *"To prevent a single attacker from creating multiple accounts to approve fraudulent claims, YieldProof requires World ID. I click 'Verify with World ID' to generate a zero-knowledge proof of unique humanness via IDKit without exposing personal data."* |
| **1:15 - 1:35** | **Attestor Staking & Onboarding** | Attestor Dashboard (`/attestor`) | *"With my proof of personhood validated on-chain, I register as an attestor and stake 1.0 MNT collateral. My staked capital creates economic accountability—if I approve fraud, I can be slashed."* |
| **1:35 - 2:00** | **ENSv2 Portable Identity** | Attestor Dashboard (`/attestor`) | *"YieldProof issues each verified attestor an ENSv2 subname. I click 'Create ENS Identity' and claim `attestor-007.yieldproof.eth`. This is a dynamic on-chain identity exposing my trust score, claims verified, and human verification status."* |
| **2:00 - 2:30** | **Attestation & Consensus** | Attestor Dashboard (`/attestor`) | *"I review the pending claim and IPFS proof, then submit my attestation. Once 3 independent human attestors reach consensus, the claim status switches to 'Verified' and a 0.3 MNT reward is accrued to each honest attestor."* |
| **2:30 - 2:45** | **ENS Resolution & Vault Settlement** | ENS Explorer (`/ens`) & Vault (`/investor`) | *"On the ENS profile explorer, querying `attestor-007.yieldproof.eth` instantly resolves my live accuracy score and human verification status. In `YieldVault.sol`, institutional investors can now unlock verified yield distributions."* |
| **2:45 - 3:00** | **Conclusion** | Landing Page (`/`) | *"YieldProof combines World ID Sybil defense, staked multi-party consensus, and ENSv2 portable reputation to build trustless verification infrastructure for the multi-trillion dollar RWA economy."* |

---

### Deterministic Demo Setup Checklist

1. **Terminal 1**: Start dev server `npm run dev` $\rightarrow$ [http://localhost:3000](http://localhost:3000).
2. **Wallet**: Connect MetaMask with Mantle Sepolia network (`Chain ID: 5003`).
3. **World ID Simulator**: Keep [https://simulator.worldcoin.org](https://simulator.worldcoin.org) open in an adjacent tab.
4. **Pre-funded Accounts**: Ensure deployer / testing wallet has testnet `MNT` for registration and claim fees.
