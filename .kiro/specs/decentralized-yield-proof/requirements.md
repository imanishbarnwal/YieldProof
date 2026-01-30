# Requirements Document

## Introduction

This specification defines the requirements for decentralizing a yield proof protocol by removing admin dependencies and implementing a challenge-response system. The protocol currently has three main contracts (YieldVault, YieldProof, AttestorRegistry) and a frontend serving three user types (Attestors, Issuers, Investors). The decentralization effort aims to eliminate centralization risks from admin-only functions while maintaining protocol security through economic incentives and community governance.

## Glossary

- **Challenge_Period**: A 7-day period during which claims can be disputed by the community
- **Yield_Claim**: A request by an issuer to unlock yield from deposited assets
- **Attestor**: A staked participant who validates yield claims and earns rewards
- **Issuer**: An entity that submits yield claims for validation
- **Investor**: A participant who deposits assets and receives yield distributions
- **Trust_Score**: A reputation metric for attestors based on historical accuracy
- **Slashing**: The penalty mechanism for malicious or incorrect attestations
- **Finalization**: The process of confirming a claim after the challenge period expires
- **Dispute_Resolution**: Community voting mechanism to resolve flagged claims
- **Yield_Vault**: Smart contract managing deposited assets and yield distribution
- **Yield_Proof**: Smart contract tracking claim states and challenge periods
- **Attestor_Registry**: Smart contract managing attestor stakes and rewards

## Requirements

### Requirement 1: Challenge Period System

**User Story:** As a protocol participant, I want claims to be validated through a time-based challenge system rather than admin approval, so that the protocol operates without centralized control.

#### Acceptance Criteria

1. WHEN an issuer submits a yield claim, THE Yield_Proof SHALL set the claim status to Pending until minimum attestation requirements are met
2. WHEN a claim reaches minimum total stake threshold through attestations, THE Yield_Proof SHALL set the claim status to InChallengePeriod and record a 7-day challenge period end timestamp
2. WHEN a claim is in challenge period, THE System SHALL allow any participant to flag the claim for dispute
3. WHEN the challenge period expires without disputes, THE System SHALL allow public finalization of the claim
4. WHEN a claim is flagged during challenge period, THE Yield_Proof SHALL set the claim status to Disputed
5. WHEN a claim reaches Finalized status, THE System SHALL enable yield unlock for the issuer

### Requirement 2: Automated Claim Finalization

**User Story:** As an issuer, I want to finalize my claims through a public function after the challenge period, so that I don't depend on admin intervention.

#### Acceptance Criteria

1. THE Attestor_Registry SHALL provide a public finalizeClaim function accessible to any participant
2. WHEN finalizeClaim is called on a valid claim, THE System SHALL verify the challenge period has expired without disputes
3. WHEN a claim is successfully finalized, THE Yield_Proof SHALL update the claim status to Finalized
4. WHEN a claim is finalized, THE System SHALL distribute rewards to attestors who validated the claim
5. WHEN finalizeClaim is called on an invalid claim, THE System SHALL revert with a descriptive error message

### Requirement 3: Decentralized Dispute Resolution

**User Story:** As a community member, I want to participate in resolving disputed claims through voting, so that the protocol maintains security without admin control.

#### Acceptance Criteria

1. WHEN a claim is disputed, THE Attestor_Registry SHALL initiate a community voting process
2. WHEN voting on disputes, THE System SHALL weight votes by attestor stake and trust score
3. WHEN dispute voting concludes, THE System SHALL automatically execute the majority decision
4. WHEN a dispute is resolved in favor of the claim, THE System SHALL move the claim directly to Finalized status bypassing further challenge periods
5. WHEN a dispute is resolved against the claim, THE System SHALL slash attestors who validated the invalid claim and reward the flagger

### Requirement 4: Autonomous Reward Distribution

**User Story:** As an attestor, I want to claim my rewards permissionlessly after successful attestations, so that I receive compensation without admin dependency.

#### Acceptance Criteria

1. THE Attestor_Registry SHALL provide a public claimRewards function for attestors
2. WHEN an attestor claims rewards, THE System SHALL calculate rewards based on finalized claims they validated
3. WHEN rewards are claimed, THE System SHALL transfer tokens directly to the attestor's address
4. WHEN calculating rewards, THE System SHALL apply trust score multipliers to reward amounts
5. WHEN an attestor has no unclaimed rewards, THE claimRewards function SHALL revert gracefully

### Requirement 5: Trust Score Management

**User Story:** As a protocol participant, I want attestor trust scores to update automatically based on performance, so that reputation reflects actual accuracy.

#### Acceptance Criteria

1. WHEN a claim is finalized, THE Attestor_Registry SHALL increase trust scores for attestors who validated correctly
2. WHEN a dispute resolves against an attestor, THE System SHALL decrease their trust score
3. WHEN calculating trust score changes, THE System SHALL use stake-weighted formulas based on attestation outcomes
4. THE System SHALL maintain trust scores between 0 and 100 with appropriate bounds checking
5. WHEN trust scores change, THE System SHALL emit events for frontend tracking

### Requirement 6: Yield Distribution Automation

**User Story:** As an investor, I want yield to be distributed automatically when claims are finalized, so that I receive returns without manual intervention.

#### Acceptance Criteria

1. WHEN a yield claim is finalized, THE Yield_Vault SHALL calculate and record proportional yield entitlements for all depositors
2. WHEN yield entitlements are calculated, THE System SHALL use a pull-over-push pattern to avoid gas limit issues with large investor counts
3. THE Yield_Vault SHALL provide a public withdrawYield function for investors to claim their accumulated yield
4. WHEN yield entitlements are recorded, THE System SHALL emit events containing distribution amounts and recipient addresses
5. WHEN calculating entitlements, THE System SHALL handle rounding errors appropriately to prevent fund loss

### Requirement 7: Attestor Dashboard Interface

**User Story:** As an attestor, I want a comprehensive dashboard to manage my attestations and track performance, so that I can effectively participate in the protocol.

#### Acceptance Criteria

1. WHEN an attestor visits their dashboard, THE Interface SHALL display total stake, trust score, lifetime attestations, and unclaimed rewards
2. WHEN viewing claims to review, THE Interface SHALL show claim details with Attest and Flag action buttons
3. WHEN viewing active attestations, THE Interface SHALL display current status and expected finalization times
4. WHEN disputes require voting, THE Interface SHALL present dispute details with voting options
5. WHEN attestors interact with claims, THE Interface SHALL provide real-time feedback on transaction status

### Requirement 8: Issuer Pipeline Visualization

**User Story:** As an issuer, I want to track my claims through the validation pipeline, so that I understand the current status and required actions.

#### Acceptance Criteria

1. WHEN an issuer views their dashboard, THE Interface SHALL display claims in pipeline stages: Pending, Attested, In Challenge Period, Finalized
2. WHEN claims are in challenge period, THE Interface SHALL show progress bars indicating time remaining
3. WHEN claims are ready for finalization, THE Interface SHALL provide prominent finalization buttons
4. WHEN viewing claim details, THE Interface SHALL show attestor participation and any flags or disputes
5. WHEN claims change status, THE Interface SHALL update in real-time without requiring page refresh

### Requirement 9: Investor Transparency Dashboard

**User Story:** As an investor, I want visibility into vault performance and community actions, so that I can make informed decisions about my investments.

#### Acceptance Criteria

1. WHEN investors view their dashboard, THE Interface SHALL display vault performance metrics including APY and total value locked
2. WHEN community actions are available, THE Interface SHALL show a Community Action Board with available protocol interactions
3. WHEN viewing activity feeds, THE Interface SHALL display real-time protocol events including claims, disputes, and finalizations
4. WHEN yield is available for withdrawal, THE Interface SHALL provide clear withdrawal options with estimated gas costs
5. WHEN viewing vault details, THE Interface SHALL show transparency metrics including attestor participation rates

### Requirement 10: Economic Incentive Enforcement

**User Story:** As a protocol designer, I want economic incentives to align participant behavior with protocol security, so that decentralization maintains system integrity.

#### Acceptance Criteria

1. WHEN attestors behave honestly, THE System SHALL provide rewards proportional to their stake amount
2. WHEN disputes resolve against attestors, THE System SHALL slash their stake proportional to their attestation amount
3. WHEN disputes resolve against flaggers, THE System SHALL slash the flagger's bond and compensate affected parties
4. THE System SHALL maintain minimum stake requirements for attestor participation
5. WHEN stake falls below minimum requirements, THE System SHALL automatically remove attestor eligibility

### Requirement 11: Event-Based Architecture

**User Story:** As a frontend developer, I want comprehensive event emission from smart contracts, so that I can build responsive user interfaces.

#### Acceptance Criteria

1. WHEN claim states change, THE Smart_Contracts SHALL emit ClaimStatusChanged events with relevant details
2. WHEN attestations occur, THE System SHALL emit AttestationSubmitted events including attestor and claim information
3. WHEN disputes are initiated or resolved, THE System SHALL emit DisputeEvents with voting results and outcomes
4. WHEN rewards are distributed or claimed, THE System SHALL emit RewardEvents with amounts and recipients
5. WHEN trust scores update, THE System SHALL emit TrustScoreChanged events for tracking purposes

### Requirement 13: Spam Prevention

**User Story:** As a protocol participant, I want claim submission to have economic barriers, so that the system is protected from spam and low-quality submissions.

#### Acceptance Criteria

1. WHEN submitting a yield claim, THE Yield_Proof SHALL require a non-refundable submission fee
2. WHEN calculating submission fees, THE System SHALL set amounts that deter spam while remaining accessible to legitimate users
3. THE System SHALL collect submission fees regardless of claim outcome to prevent economic attacks
4. WHEN claims are finalized successfully, THE System SHALL not refund submission fees to maintain spam deterrence
5. THE System SHALL use collected fees for protocol maintenance or burn mechanisms

### Requirement 14: Indexer Service Integration

**User Story:** As a frontend application, I want efficient data querying through an indexer service, so that complex UI queries perform well.

#### Acceptance Criteria

1. THE Indexer_Service SHALL track all protocol events and maintain queryable state
2. WHEN querying historical data, THE Indexer SHALL provide paginated results with filtering options
3. WHEN calculating aggregate metrics, THE Indexer SHALL pre-compute common statistics for fast retrieval
4. THE Indexer SHALL provide GraphQL endpoints for flexible frontend data requirements
5. WHEN smart contract events are emitted, THE Indexer SHALL update its state within one block confirmation