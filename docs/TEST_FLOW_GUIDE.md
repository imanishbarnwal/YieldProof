# YieldProof System Flow Analysis & Test Plan

## 🎯 YieldProof Vision
**YieldProof is a decentralized credibility layer for institutional yield verification - not an investment platform.**

This system demonstrates how institutions can prove yield performance using cryptoeconomic verification, without exposing sensitive strategies or requiring custody of investor funds. The vault in this MVP is purely for demonstration purposes.

## 🔄 Complete Autonomous System Flow

### **Core Architecture**
YieldProof is a 3-sided verification marketplace with these key actors:
1. **Issuers** - Submit yield disclosures with cryptographic proof
2. **Attestors** - Verify disclosures by staking MNT tokens and earn rewards
3. **Investors** - Deposit capital, monitor verification, and receive verified yield distributions

### **Smart Contract Architecture**
- **YieldProof Contract** - Core claim submission and metadata management
- **AttestorRegistry Contract** - Attestor registration, staking, verification, and rewards
- **YieldVault Contract** - Capital deposits, withdrawals, and proportional yield distribution

**Network**: Mantle Sepolia (Chain ID: 5003)
**Explorer**: https://explorer.sepolia.mantle.xyz

### **🚀 Key Innovation: Fully Autonomous Operation**
**No admin approval required for any core operations:**
- Claims are finalized when they reach 3+ attestors
- Yield distribution happens automatically via smart contracts
- Attestors earn rewards through cryptoeconomic consensus
- Trust scores update in real-time based on performance

---

## 📋 Complete Test Flow & Validation Plan

### **Phase 1: Setup & Registration**

#### **Test 1.1: Attestor Registration & Staking**
**What to do:**
1. Navigate to `/attestor` page
2. Connect wallet with test MNT tokens
3. Enter stake amount (minimum 1.0 MNT)
4. Click "Register & Stake"

**Expected UI Updates:**
- Badge changes from "Registration Required" to "Active Attestor"
- Stats show: MNT Staked amount, Trust Score starts at 0
- Registration status indicator turns green
- "Register & Stake" button becomes "Add Stake"
- **New**: "Claim Rewards" button appears when rewards > 0

**Validation:**
- Transaction succeeds on Mantle Sepolia
- AttestorRegistry contract shows `isRegistered = true`
- Stake amount is recorded correctly
- Event `AttestorRegistered` emitted
- **New**: Trust score algorithm uses intuitive 70% accuracy + 30% experience formula

---

#### **Test 1.2: Investor Capital Deposit**
**What to do:**
1. Navigate to `/investor` page  
2. Connect wallet
3. Enter deposit amount (e.g., 5.0 MNT)
4. Click "Add Capital"

**Expected UI Updates:**
- "Principal Escrow" metric updates to show deposited amount
- "Available Balance" shows deposited funds
- Vault metrics refresh automatically
- Success notification appears
- **New**: "Your Share" percentages calculate automatically for all active claims

**Validation:**
- YieldVault contract `totalDeposits` increases
- User's `balances[address]` reflects deposit
- Transaction confirmed on blockchain
- Event `Deposited` emitted
- **New**: Share calculations are proportional: `(Your Deposit / Total Deposits) × Claim Amount`

---

### **Phase 2: Yield Disclosure & Escrow**

#### **Test 2.1: Issuer Escrow Funding (FIRST)**
**What to do:**
1. Navigate to `/issuer` page
2. Scroll to "Enforce Distribution" section
3. Enter yield amount (e.g., 2.5 MNT) - this is the actual yield to distribute
4. Click "Enforce Escrow Funding"

**Expected UI Updates:**
- "Available Balance" in escrow increases by deposited amount
- Vault balance shows real MNT tokens available for distribution
- Recent escrow transactions show new funding
- **New**: This creates the actual yield pool for later distribution

**Validation:**
- YieldVault `totalDeposits` increases by funded amount
- Real MNT tokens are held in contract
- **Critical**: This step must happen BEFORE or AFTER disclosure submission
- Funds are escrowed and ready for proportional distribution

---

#### **Test 2.2: Document Upload & Disclosure Submission**
**What to do:**
1. Still on `/issuer` page, fill out disclosure form:
   - Asset ID: "MANTLE-MNT-LP-V3"
   - Start Date: Previous month start
   - End Date: Previous month end  
   - Yield Amount: "2.5" MNT (should match escrow amount)
   - Upload PDF/CSV proof document
2. Click "Submit Disclosure"

**Expected UI Updates:**
- File upload shows "Document uploaded" with IPFS hash
- Form validates dates (no future dates allowed)
- Success message appears after submission
- New disclosure appears in "Disclosure History" sidebar
- Status shows "Awaiting Attestors"
- Progress bar shows 0/3 attestors
- **New**: Disclosure is just a CLAIM about yield, not the actual yield deposit

**Validation:**
- YieldProof contract `getTotalClaims()` increases by 1
- New claim has status `Pending` (0)
- Document hash stored correctly (IPFS format)
- Yield amount converted to wei properly (multiply by 1e18)
- Event `YieldClaimSubmitted` emitted
- **Important**: This is metadata only - actual yield was deposited in previous step

---

### **Phase 3: Decentralized Attestation Process**

#### **Test 3.1: First Attestation**
**What to do:**
1. Switch to `/attestor` page (same or different wallet)
2. Ensure attestor is registered with stake
3. Find the new claim in "Pending Verification" tab
4. Review document proof (click "View Proof")
5. Click "Attest" button

**Expected UI Updates:**
- Claim moves from "Pending Verification" to "Attested" tab
- Progress bar updates to 1/3 attestors (33%)
- Total stake amount increases
- Attestor stats update: Total Attestations +1
- Claim status changes to "In Verification"
- **New**: Trust score updates in real-time using improved algorithm

**Validation:**
- AttestorRegistry `hasAttested[claimId][attestor] = true`
- `totalStakePerClaim[claimId]` increases by attestor's stake
- `attestorCountPerClaim[claimId] = 1`
- **New**: Status determination now uses attestor count, not admin updates
- Event `ClaimAttested` emitted

---

#### **Test 3.2: Reaching Consensus (2nd & 3rd Attestations)**
**What to do:**
1. Register 2 more attestors (different wallets) with minimum 1.0 MNT each
2. Each attestor stakes MNT and attests to the same claim
3. Monitor progress after each attestation

**Expected UI Updates:**
- Progress bar: 2/3 (67%), then 3/3 (100%) attestors
- Total stake continues increasing
- **NEW BEHAVIOR**: After 3rd attestation, status shows "Ready to Finalize"
- **New**: "Finalize & Reward" button appears on both attestor AND investor pages
- Claim does NOT automatically become "verified" - needs finalization

**Validation:**
- After 3rd attestation: `attestorCountPerClaim[claimId] = 3`
- **New**: Claim status remains "attesting" until someone calls finalization
- **New**: `canUnlockYield(claimId)` returns true (uses attestor count, not stake)
- **New**: Both attestors and investors can see finalize button

---

### **Phase 4: Autonomous Finalization & Distribution**

#### **Test 4.1: Decentralized Claim Finalization**
**What to do:**
1. On either `/attestor` or `/investor` page, find claim with "Ready to Finalize" status
2. Click "Finalize & Reward" button (anyone can do this!)
3. Confirm transaction

**Expected UI Updates:**
- Claim status changes from "Ready to Finalize" to "Verified"
- "Finalize" button disappears, "Claim" button appears for investors
- Attestors see increased "MNT Earned" in their stats
- **New**: "Claim Rewards" button appears for attestors
- Progress shows 100% complete with green checkmark

**Validation:**
- **New**: `AttestorRegistry.finalizeAndReward()` function called
- `verificationRecorded[claimId] = true`
- All attestors receive `REWARD_PER_ATTESTATION` (0.1 MNT each)
- `successfulAttestations` count increases for each attestor
- **New**: This is fully decentralized - no admin needed!
- Events: `RewardAccrued` for each attestor, `VerificationRecorded`

---

#### **Test 4.2: Attestor Reward Claiming**
**What to do:**
1. Return to `/attestor` page
2. Check "MNT Earned" shows accumulated rewards
3. Click "Claim Rewards" button
4. Confirm transaction

**Expected UI Updates:**
- "MNT Earned" resets to 0.00
- "Claim Rewards" button disappears
- Success notification shows amount claimed
- **New**: This completes the economic loop for attestors

**Validation:**
- **New**: `AttestorRegistry.claimRewards()` function called
- Attestor receives actual MNT tokens (0.1 MNT per successful attestation)
- `rewardsEarned[attestor]` resets to 0
- Event `RewardsClaimed` emitted
- **New**: Attestors get paid automatically for honest work!

---

#### **Test 4.3: Investor Yield Claiming**
**What to do:**
1. Navigate to `/investor` page
2. Find verified disclosure in "Active Disclosures"
3. Verify status shows "Verified" with green badge
4. Note "Your Share" amount (proportional to your deposit)
5. Click "Claim" button next to the disclosure

**Expected UI Updates:**
- Button changes from "Claim" to "Claimed" (disabled)
- "Verified Distribution" metric increases
- Your vault balance increases by your proportional share
- Success notification shows exact amount received
- **New**: Share calculation is transparent and real-time

**Validation:**
- **New**: `YieldVault.unlockYield()` distributes yield proportionally
- `isClaimed[claimId] = true` for the caller
- Caller's balance increases by `(userDeposit / totalDeposits) × yieldAmount`
- `verifiedDistribution` increases by claim amount
- **New**: Real MNT tokens transferred from escrow to user balance
- Event `YieldUnlocked` and `YieldDistributed` emitted

---

### **Phase 5: Advanced Autonomous Scenarios**

#### **Test 5.1: Multiple Investors Claiming**
**What to do:**
1. Have multiple investors deposit different amounts
2. After claim is verified, each investor claims their share
3. Verify proportional distribution

**Expected Results:**
- Each investor receives: `(Their Deposit / Total Deposits) × Yield Amount`
- Example: If Alice deposited 3 MNT, Bob 2 MNT (total 5 MNT), and yield is 1 MNT:
  - Alice gets: (3/5) × 1 = 0.6 MNT
  - Bob gets: (2/5) × 1 = 0.4 MNT
- **New**: Each investor can claim independently (gas efficient)

---

#### **Test 5.2: Claim Flagging & Dispute**
**What to do:**
1. Submit a suspicious/invalid claim as issuer
2. As attestor, click "Flag" instead of "Attest"
3. Provide flagging reason (e.g., "Invalid documentation")

**Expected UI Updates:**
- Claim status becomes "Flagged"
- Claim becomes unattestable and unclaimable
- Flagging reason visible to other users
- Red warning badge appears
- **New**: Flagged claims cannot be finalized by anyone

**Validation:**
- AttestorRegistry `isFlagged[claimId] = true`
- `flagReasons[claimId]` stores reason
- No further attestations or finalization possible
- **New**: `canUnlockYield()` returns false for flagged claims
- Event `ClaimFlagged` emitted
- **Note**: Dispute resolution still requires admin (by design)

---

#### **Test 5.3: Trust Score Evolution**
**What to do:**
1. Have an attestor participate in multiple claims (both successful and flagged)
2. Monitor trust score changes over time

**Expected Behavior:**
- **New Algorithm**: `(accuracyRate × 70) / 100 + experienceBonus`
- Accuracy Rate: Percentage of successful attestations (0-70 points)
- Experience Bonus: Based on total attestations, caps at 15 attestations (0-30 points)
- **Example**: 90% accuracy (63 points) + 10 attestations (20 points) = 83/100 trust score
- **New**: Much more intuitive than old formula

---

### **Phase 6: Withdrawal & Liquidity**

#### **Test 6.1: Investor Withdrawal**
**What to do:**
1. As investor, navigate to withdrawal section
2. Enter amount less than or equal to available balance (original + claimed yield)
3. Click "Withdraw"

**Expected UI Updates:**
- Available balance decreases by withdrawal amount
- Transaction confirmation
- Vault metrics update automatically
- Success notification with amount withdrawn

**Validation:**
- User receives MNT tokens back to their wallet
- YieldVault `balances[user]` decreases
- `totalDeposits` decreases accordingly
- Event `Withdrawn` emitted
- **New**: Can withdraw both original deposits AND claimed yield

---

## 🎯 Key Autonomous Behavior Validations

### **Real-time Decentralized Updates**
- All metrics refresh every 5 seconds via `refetchInterval`
- Status changes happen immediately when attestor thresholds are met
- **New**: Finalize buttons appear automatically when `attestorCount >= 3`
- **New**: No waiting for admin approval - everything is permissionless
- Trust scores update in real-time with each attestation

### **Economic Incentive Alignment**
- **New**: Attestors earn 0.1 MNT per successful attestation
- **New**: Investors get proportional yield based on their vault share
- **New**: Issuers must escrow real yield before distribution
- **New**: All parties have skin in the game - no free riders

### **Cross-Page Autonomous Consistency**
- Same claim data appears consistently across all three dashboards
- **New**: Finalize buttons appear on both attestor and investor pages
- **New**: Status logic is consistent: attestor count drives everything
- **New**: Real contract state drives all displays, no mock data

---

## 🔍 Critical Success Metrics

### **Decentralization Metrics**
1. **Zero Admin Dependencies**: Core flow works without any admin intervention
2. **Permissionless Finalization**: Anyone can complete verified claims
3. **Autonomous Rewards**: Attestors get paid automatically
4. **Real Economic Flow**: Actual MNT tokens flow from escrow to investors

### **Technical Metrics**
1. **Transaction Success Rate**: All blockchain interactions complete successfully
2. **Data Consistency**: On-chain state matches UI display across all pages
3. **Real-time Sync**: UI updates within 5 seconds of blockchain changes
4. **Gas Efficiency**: Individual claiming vs mass distribution

### **User Experience Metrics**
1. **Attestor Flow**: Register → Stake → Attest → Finalize → Claim Rewards
2. **Issuer Flow**: Escrow Yield → Submit Disclosure → Monitor Progress
3. **Investor Flow**: Deposit → Monitor → Finalize → Claim Yield → Withdraw
4. **Cross-Integration**: All three roles can finalize the same claims

---

## 🚨 Edge Cases to Test

### **Autonomous Security Scenarios**
1. **Double Attestation**: Attempt to attest to same claim twice (should fail)
2. **Double Finalization**: Try to finalize same claim twice (should fail)
3. **Double Reward Claiming**: Try to claim rewards twice (should fail)
4. **Insufficient Escrow**: Try to claim yield when vault has insufficient balance
5. **Flagged Claim Finalization**: Try to finalize a flagged claim (should fail)

### **Economic Edge Cases**
1. **Zero Yield Claims**: Submit claim for 0 MNT yield
2. **Escrow Mismatch**: Escrow different amount than claimed yield
3. **Partial Claiming**: Multiple investors claiming from same yield pool
4. **Reward Accumulation**: Attestor participating in multiple claims before claiming

---

## 📊 Expected Final State (Fully Autonomous)

After completing all tests, the system should demonstrate:

### **Issuer Dashboard**
- Total Disclosures: Multiple claims submitted
- Success Rate: Based on verified vs flagged claims
- Reputation Score: Calculated from successful disclosures
- **New**: Clear separation between escrow (real money) and disclosure (claims)

### **Attestor Dashboard**
- MNT Staked: Amount staked during registration
- Total Attestations: Number of claims attested
- **New**: MNT Earned: 0.00 (after claiming rewards)
- **New**: Trust Score: Intuitive score based on accuracy and experience
- **New**: Claim Rewards functionality working

### **Investor Dashboard**
- Principal Escrow: Original amount deposited
- **New**: Verified Distribution: Actual yield claimed and added to balance
- **New**: Your Share: Clear calculation of proportional entitlement
- **New**: Finalize buttons for ready claims

### **System-Wide Validation**
- **Zero admin transactions** in the entire flow
- **Real MNT token transfers** from escrow to investors
- **Automatic reward distribution** to attestors
- **Consistent status updates** across all dashboards
- **Economic incentives working** as designed

---

## 🔧 Troubleshooting

### **Common Issues**
1. **"Insufficient Balance" Errors**: Ensure vault has enough escrowed yield
2. **"Already Attested" Errors**: Each attestor can only attest once per claim
3. **Missing Finalize Button**: Need exactly 3+ attestors and claim not flagged
4. **Reward Claiming Fails**: Must have earned rewards from successful attestations

### **Debug Tools**
- Mantle Sepolia Explorer: https://explorer.sepolia.mantle.xyz
- Contract Read Functions: Check `attestorCountPerClaim`, `verificationRecorded`, `rewardsEarned`
- Browser Console: Monitor real-time contract calls and responses
- **New**: Trust score calculation can be verified with `getTrustScore(address)`

---

## 🏆 Success Criteria: Fully Autonomous System

**The test is successful when:**
1. ✅ **Complete flow works without admin**: Submit → Attest → Finalize → Distribute
2. ✅ **Economic incentives function**: Attestors earn rewards, investors get yield
3. ✅ **Real value transfer**: Actual MNT tokens move from escrow to recipients
4. ✅ **Decentralized consensus**: Multiple parties can finalize valid claims
5. ✅ **Transparent verification**: All data visible and verifiable on-chain

**This demonstrates YieldProof as the credibility layer for institutional yield - proving performance without custody, strategy disclosure, or centralized control.**