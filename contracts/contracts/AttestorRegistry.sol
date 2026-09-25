// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWorldID.sol";
import "./helpers/ByteHasher.sol";

contract AttestorRegistry is Ownable {
    using ByteHasher for bytes;

    struct Attestor {
        bool isRegistered;
        uint256 stake;
    }

    mapping(address => Attestor) public attestors;
    // claimId => attestor => hasAttested
    mapping(uint256 => mapping(address => bool)) public hasAttested;
    // claimId => totalStake
    mapping(uint256 => uint256) public totalStakePerClaim;
    // claimId => attestor count
    mapping(uint256 => uint256) public attestorCountPerClaim;
    // claimId => array of attestors
    mapping(uint256 => address[]) public attestorsList;
    // claimId => flagging reason
    mapping(uint256 => string) public flagReasons;
    // claimId => is flagged
    mapping(uint256 => bool) public isFlagged;

    // ============================
    // World ID Integration
    // ============================

    /// @notice The World ID router instance
    IWorldID public worldId;

    /// @notice The World ID external nullifier hash (actionId / appId)
    uint256 public externalNullifierHash;

    /// @notice The World ID group ID (1 for Orb, 0 for Phone)
    uint256 public constant WORLD_ID_GROUP_ID = 1;

    /// @notice Whether a nullifier hash has already been used to prevent Sybil registration
    mapping(uint256 => bool) public nullifierHashes;

    /// @notice Track if an attestor is verified with World ID
    mapping(address => bool) public isWorldIdVerified;

    /// @notice Whether World ID proof is strictly required for attestors
    bool public requireWorldID;

    event WorldIDRequirementUpdated(bool required);

    // ============================
    // Attestor Statistics & Rewards
    // ============================

    // Attestor performance tracking
    mapping(address => uint256) public successfulAttestations;
    mapping(address => uint256) public totalAttestationsCount;

    // Rewards earned per attestor (in wei)
    mapping(address => uint256) public rewardsEarned;

    // Total rewards claimed by each attestor (lifetime tracking)
    mapping(address => uint256) public totalRewardsClaimed;

    // Track if verification was recorded for a claim
    mapping(uint256 => bool) public verificationRecorded;

    // Constants
    uint256 public constant MIN_REQUIRED_ATTESTORS = 3;
    uint256 public constant REWARD_PER_ATTESTATION = 3e17; // 0.3 ether per successful attestation
    uint256 public constant ATTESTATION_FEE = 9e17; // 0.9 ether fee per claim (covers 3 attestors)

    event AttestorRegistered(address indexed attestor);
    event AttestorWorldIDVerified(address indexed attestor, uint256 nullifierHash);
    event WorldIDConfigured(address indexed router, uint256 externalNullifierHash);
    event StakeAdded(address indexed attestor, uint256 amount);
    event ClaimAttested(uint256 indexed claimId, address indexed attestor, uint256 stakeAmount);
    event ClaimFlagged(uint256 indexed claimId, address indexed flagger, string reason);
    event AttestorSlashed(address indexed attestor, uint256 amount, address indexed slasher);
    event RewardAccrued(address indexed attestor, uint256 amount);
    event RewardsClaimed(address indexed attestor, uint256 amount);
    event VerificationRecorded(uint256 indexed claimId, bool success);
    event AttestationFeePaid(address indexed issuer, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers the caller as an attestor. Optionally accepts initial stake.
     * @dev When requireWorldID is active, caller must register via registerWithWorldID.
     */
    function register() external payable {
        require(!attestors[msg.sender].isRegistered, "AttestorRegistry: already registered");
        require(!requireWorldID || isWorldIdVerified[msg.sender], "AttestorRegistry: World ID verification required");
        
        attestors[msg.sender].isRegistered = true;
        
        emit AttestorRegistered(msg.sender);

        if (msg.value > 0) {
            _stakeETH(msg.sender, msg.value);
        }
    }

    /**
     * @notice Registers caller as an attestor with World ID proof to guarantee 1-human-1-attestor Sybil resistance.
     * @param root Merkle root of the World ID identity tree
     * @param nullifierHash Unique nullifier for the user and action
     * @param proof 8-element zkSNARK proof
     */
    function registerWithWorldID(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external payable {
        require(!attestors[msg.sender].isRegistered, "AttestorRegistry: already registered");
        require(!nullifierHashes[nullifierHash], "AttestorRegistry: World ID already used");

        if (address(worldId) != address(0)) {
            uint256 signalHash = abi.encodePacked(msg.sender).hashToField();
            worldId.verifyProof(
                root,
                WORLD_ID_GROUP_ID,
                signalHash,
                nullifierHash,
                externalNullifierHash,
                proof
            );
        }

        nullifierHashes[nullifierHash] = true;
        isWorldIdVerified[msg.sender] = true;
        attestors[msg.sender].isRegistered = true;

        emit AttestorRegistered(msg.sender);
        emit AttestorWorldIDVerified(msg.sender, nullifierHash);

        if (msg.value > 0) {
            _stakeETH(msg.sender, msg.value);
        }
    }

    /**
     * @notice Allows an already registered attestor to link and verify their World ID proof.
     */
    function verifyWorldID(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        require(attestors[msg.sender].isRegistered, "AttestorRegistry: not registered");
        require(!isWorldIdVerified[msg.sender], "AttestorRegistry: already World ID verified");
        require(!nullifierHashes[nullifierHash], "AttestorRegistry: World ID already used");

        if (address(worldId) != address(0)) {
            uint256 signalHash = abi.encodePacked(msg.sender).hashToField();
            worldId.verifyProof(
                root,
                WORLD_ID_GROUP_ID,
                signalHash,
                nullifierHash,
                externalNullifierHash,
                proof
            );
        }

        nullifierHashes[nullifierHash] = true;
        isWorldIdVerified[msg.sender] = true;

        emit AttestorWorldIDVerified(msg.sender, nullifierHash);
    }

    /**
     * @notice Enables or disables strict on-chain World ID requirement.
     */
    function setRequireWorldID(bool _required) external onlyOwner {
        requireWorldID = _required;
        emit WorldIDRequirementUpdated(_required);
    }

    /**
     * @notice Owner configuration for World ID router and action metadata.
     */
    function setWorldID(address _worldId, string memory _appId, string memory _actionId) external onlyOwner {
        worldId = IWorldID(_worldId);
        externalNullifierHash = abi.encodePacked(
            abi.encodePacked(_appId).hashToField(),
            _actionId
        ).hashToField();
        requireWorldID = true;
        emit WorldIDConfigured(_worldId, externalNullifierHash);
    }

    /**
     * @notice Allows a registered attestor to add more ETH stake.
     */
    function stakeETH() external payable {
        require(attestors[msg.sender].isRegistered, "AttestorRegistry: not registered");
        require(msg.value > 0, "AttestorRegistry: no value sent");
        
        _stakeETH(msg.sender, msg.value);
    }
    
    function _stakeETH(address staker, uint256 amount) internal {
        attestors[staker].stake += amount;
        emit StakeAdded(staker, amount);
    }

    /**
     * @notice Attests to a specific claim ID.
     * @param claimId The ID of the claim to attest to.
     */
    function attestToClaim(uint256 claimId) external {
        require(attestors[msg.sender].isRegistered, "AttestorRegistry: not registered");
        require(!requireWorldID || isWorldIdVerified[msg.sender], "AttestorRegistry: World ID verification required to attest");
        require(attestors[msg.sender].stake > 0, "AttestorRegistry: no stake");
        require(!hasAttested[claimId][msg.sender], "AttestorRegistry: already attested");
        require(!isFlagged[claimId], "AttestorRegistry: claim is flagged");

        hasAttested[claimId][msg.sender] = true;
        uint256 stakeAmount = attestors[msg.sender].stake;
        totalStakePerClaim[claimId] += stakeAmount;
        attestorCountPerClaim[claimId]++;
        attestorsList[claimId].push(msg.sender);

        // Track total attestations for this attestor
        totalAttestationsCount[msg.sender]++;

        emit ClaimAttested(claimId, msg.sender, stakeAmount);
    }

    /**
     * @notice Flags a claim as potentially fraudulent or invalid.
     * @param claimId The ID of the claim to flag.
     * @param reason The reason for flagging.
     */
    function flagClaim(uint256 claimId, string calldata reason) external {
        require(attestors[msg.sender].isRegistered, "AttestorRegistry: not registered");
        require(attestors[msg.sender].stake > 0, "AttestorRegistry: no stake");
        require(!isFlagged[claimId], "AttestorRegistry: already flagged");

        isFlagged[claimId] = true;
        flagReasons[claimId] = reason;

        emit ClaimFlagged(claimId, msg.sender, reason);
    }

    /**
     * @notice Get the list of attestors for a claim.
     * @param claimId The ID of the claim.
     * @return Array of attestor addresses.
     */
    function getAttestors(uint256 claimId) external view returns (address[] memory) {
        return attestorsList[claimId];
    }

    /**
     * @notice Admin-only function to slash an attestor's stake.
     * @param attestor The address of the attestor to slash.
     * @param amount The amount of ETH to slash.
     */
    function slash(address attestor, uint256 amount) external onlyOwner {
        require(attestors[attestor].stake >= amount, "AttestorRegistry: insufficient stake");
        
        attestors[attestor].stake -= amount;
        
        // Transfer slashed funds to the owner
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "AttestorRegistry: failed to send slashed funds");

        emit AttestorSlashed(attestor, amount, msg.sender);
    }

    /**
     * @notice Admin function to unflag a claim.
     * @param claimId The ID of the claim to unflag.
     */
    function unflagClaim(uint256 claimId) external onlyOwner {
        isFlagged[claimId] = false;
        delete flagReasons[claimId];
    }

    // ============================
    // Rewards & Trust Score Functions
    // ============================

    /**
     * @notice Records the verification outcome for a claim and updates attestor stats.
     * @dev Can only be called once per claim. Should be called when a claim is verified/rejected.
     * @param claimId The ID of the claim.
     * @param success Whether the verification was successful (true = verified, false = rejected).
     */
    function recordVerification(uint256 claimId, bool success) external onlyOwner {
        require(!verificationRecorded[claimId], "AttestorRegistry: verification already recorded");
        verificationRecorded[claimId] = true;

        address[] memory claimAttestors = attestorsList[claimId];

        for (uint256 i = 0; i < claimAttestors.length; i++) {
            address attestor = claimAttestors[i];

            if (success) {
                // Increment successful attestations and accrue rewards
                successfulAttestations[attestor]++;
                rewardsEarned[attestor] += REWARD_PER_ATTESTATION;
                emit RewardAccrued(attestor, REWARD_PER_ATTESTATION);
            }
        }

        emit VerificationRecorded(claimId, success);
    }

    /**
     * @notice Public function to finalize claims that meet attestor requirements.
     * @dev Anyone can call this to finalize valid claims and distribute rewards.
     * @param claimId The ID of the claim to finalize.
     */
    function finalizeAndReward(uint256 claimId) external {
        require(!isFlagged[claimId], "AttestorRegistry: claim is flagged");
        require(attestorCountPerClaim[claimId] >= MIN_REQUIRED_ATTESTORS, "AttestorRegistry: not enough attestors");
        require(!verificationRecorded[claimId], "AttestorRegistry: already recorded");
        
        // Mark verification as recorded
        verificationRecorded[claimId] = true;

        // Reward all attestors for this claim
        address[] memory claimAttestors = attestorsList[claimId];
        for (uint256 i = 0; i < claimAttestors.length; i++) {
            address attestor = claimAttestors[i];
            successfulAttestations[attestor]++;
            rewardsEarned[attestor] += REWARD_PER_ATTESTATION;
            emit RewardAccrued(attestor, REWARD_PER_ATTESTATION);
        }

        emit VerificationRecorded(claimId, true);
    }

    /**
     * @notice Allows attestors to claim their accumulated rewards.
     * @dev Transfers all earned rewards to the caller and resets their balance.
     */
    function claimRewards() external {
        uint256 rewards = rewardsEarned[msg.sender];
        require(rewards > 0, "AttestorRegistry: no rewards to claim");
        
        // Reset rewards before transfer to prevent reentrancy
        rewardsEarned[msg.sender] = 0;
        
        // Track total rewards claimed
        totalRewardsClaimed[msg.sender] += rewards;
        
        // Transfer rewards to attestor
        (bool sent, ) = msg.sender.call{value: rewards}("");
        require(sent, "AttestorRegistry: failed to send rewards");
        
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @notice Calculates a more intuitive trust score for an attestor (0-100).
     * @dev Formula: Base score from accuracy (0-70) + Experience bonus (0-30)
     * @param attestor The address of the attestor.
     * @return The trust score (0-100).
     */
    function getTrustScore(address attestor) public view returns (uint256) {
        uint256 total = totalAttestationsCount[attestor];
        if (total == 0) return 0;

        uint256 successful = successfulAttestations[attestor];
        uint256 accuracyRate = (successful * 100) / total;
        
        // Base score from accuracy: 0-70 points (70% of total score)
        uint256 accuracyScore = (accuracyRate * 70) / 100;
        
        // Experience bonus: 0-30 points based on total attestations
        // Caps at 15 attestations for max experience bonus
        uint256 experienceBonus = total >= 15 ? 30 : (total * 30) / 15;
        
        uint256 score = accuracyScore + experienceBonus;
        return score > 100 ? 100 : score;
    }

    /**
     * @notice Allows issuers to pay attestation fees to fund the reward pool.
     * @dev Should be called when submitting claims to ensure attestor rewards are funded.
     */
    function payAttestationFee() external payable {
        require(msg.value >= ATTESTATION_FEE, "AttestorRegistry: insufficient attestation fee");
        emit AttestationFeePaid(msg.sender, msg.value);
    }

    /**
     * @notice Gets the required attestation fee amount.
     * @return The attestation fee in wei.
     */
    function getAttestationFee() external pure returns (uint256) {
        return ATTESTATION_FEE;
    }

    /**
     * @notice Gets the contract's current balance available for rewards.
     * @return The contract balance in wei.
     */
    function getRewardPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Gets comprehensive statistics for an attestor.
     * @param attestor The address of the attestor.
     * @return totalAttestations Total number of attestations made.
     * @return successful Number of successful attestations.
     * @return rewards Total rewards currently earned but not claimed (in wei).
     * @return totalClaimed Total rewards claimed lifetime (in wei).
     * @return trustScore The calculated trust score (0-100).
     */
    function getAttestorStats(address attestor) external view returns (
        uint256 totalAttestations,
        uint256 successful,
        uint256 rewards,
        uint256 totalClaimed,
        uint256 trustScore
    ) {
        totalAttestations = totalAttestationsCount[attestor];
        successful = successfulAttestations[attestor];
        rewards = rewardsEarned[attestor];
        totalClaimed = totalRewardsClaimed[attestor];
        trustScore = getTrustScore(attestor);
    }
}
