// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AttestorRegistry.sol";
import "./YieldProof.sol";

/**
 * @title YieldVault
 * @dev A simple "RealFi" vault for the Hackathon MVP.
 *      This contract does NOT generate yield itself. Instead, it enforces policies:
 *      Uses funds are deposited here, but "yield" (or unlocking of funds/rewards) 
 *      is only permitted if a YieldProof claim meets the minimum stake threshold 
 *      in the AttestorRegistry.
 */
contract YieldVault {
    // ============================
    // State Variables
    // ============================

    YieldProof public yieldProof;
    AttestorRegistry public attestorRegistry;
    
    /// @notice Minimum total stake required on a claim to unlock yield/rewards.
    uint256 public minTotalStake;

    /// @notice Total ETH deposited in the vault.
    uint256 public totalDeposits;

    /// @notice User ETH balances.
    mapping(address => uint256) public balances;

    /// @notice Tracks whether a claim has been claimed to prevent double-claiming
    mapping(uint256 => bool) public isClaimed;

    /// @notice Tracks whether a user has claimed yield from a specific claim
    mapping(address => mapping(uint256 => bool)) public hasClaimedYield;

    /// @notice Total yield amount from verified and claimed disclosures
    uint256 public verifiedDistribution;

    // ============================
    // Events
    // ============================

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event YieldUnlocked(uint256 indexed claimId, uint256 totalStake);
    event YieldDistributed(address indexed user, uint256 amount, uint256 indexed claimId);

    // ============================
    // Constructor
    // ============================

    constructor(
        address _yieldProof,
        address _attestorRegistry,
        uint256 _minTotalStake
    ) {
        yieldProof = YieldProof(_yieldProof);
        attestorRegistry = AttestorRegistry(_attestorRegistry);
        minTotalStake = _minTotalStake;
    }

    // ============================
    // External Functions
    // ============================

    /**
     * @notice Deposits ETH into the vault.
     */
    function deposit() external payable {
        require(msg.value > 0, "YieldVault: cannot deposit 0");

        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraws ETH from the vault.
     * @dev In a full production version, this would check for locked funds 
     *      tied to active claims. For this MVP, it allows withdrawal specific logic 
     *      to be added later.
     * @param amount The amount of ETH to withdraw.
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "YieldVault: insufficient balance");

        balances[msg.sender] -= amount;
        totalDeposits -= amount;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "YieldVault: failed to send ETH");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Checks if a specific claim has enough attestor count to be "unlocked".
     * @param claimId The ID of the claim to check.
     * @return true if the claim is sufficiently attested.
     */
    function canUnlockYield(uint256 claimId) public view returns (bool) {
        uint256 attestorCount = attestorRegistry.attestorCountPerClaim(claimId);
        uint256 minRequiredAttestors = 3; // Should match MIN_REQUIRED_ATTESTORS from YieldProof
        return attestorCount >= minRequiredAttestors && !attestorRegistry.isFlagged(claimId);
    }

    /**
     * @notice Unlocks yield/rewards for a claim if it meets the stake threshold.
     * @dev Distributes the claimed yield proportionally to all vault depositors.
     *      This function can only be called once per claim and marks it as claimed.
     * @param claimId The ID of the claim to unlock.
     */
    function unlockYield(uint256 claimId) external {
        require(!isClaimed[claimId], "YieldVault: claim already unlocked");
        require(canUnlockYield(claimId), "YieldVault: insufficient stake to unlock");

        // Mark the claim as claimed to prevent double-claiming
        isClaimed[claimId] = true;

        // Get the yield amount from the YieldProof contract
        (,,, uint256 yieldAmount,,,,) = yieldProof.claims(claimId);
        
        // Ensure we have enough balance in the vault to distribute
        require(address(this).balance >= yieldAmount, "YieldVault: insufficient vault balance for distribution");
        
        // Track verified distribution
        verifiedDistribution += yieldAmount;

        // Calculate and add the caller's proportional share to their balance
        if (totalDeposits > 0 && balances[msg.sender] > 0) {
            uint256 callerShare = (balances[msg.sender] * yieldAmount) / totalDeposits;
            balances[msg.sender] += callerShare;
            
            emit YieldDistributed(msg.sender, callerShare, claimId);
        }

        uint256 stake = attestorRegistry.totalStakePerClaim(claimId);
        emit YieldUnlocked(claimId, stake);
    }

    /**
     * @notice Allows any depositor to claim their proportional share of a verified yield claim.
     * @dev More gas-efficient than distributing to all users at once.
     * @param claimId The ID of the verified claim to claim yield from.
     */
    function claimYieldShare(uint256 claimId) external {
        require(isClaimed[claimId], "YieldVault: claim not yet unlocked");
        require(balances[msg.sender] > 0, "YieldVault: no deposit balance");
        require(!hasClaimedYield[msg.sender][claimId], "YieldVault: already claimed this yield");

        // Mark as claimed for this user
        hasClaimedYield[msg.sender][claimId] = true;

        // Get the yield amount from the YieldProof contract
        (,,, uint256 yieldAmount,,,,) = yieldProof.claims(claimId);
        
        // Calculate user's proportional share
        uint256 userShare = (balances[msg.sender] * yieldAmount) / totalDeposits;
        
        // Add to user's balance
        balances[msg.sender] += userShare;
        
        emit YieldDistributed(msg.sender, userShare, claimId);
    }

    /**
     * @notice Calculates the total pending distributions (verified claims not yet unlocked).
     * @dev This iterates through all claims, so gas cost increases with total claims.
     *      For production, consider maintaining this as a state variable.
     * @return pending The total yield amount of claims that can be unlocked but haven't been.
     */
    function getPendingDistributions() external view returns (uint256 pending) {
        uint256 totalClaims = yieldProof.getTotalClaims();
        for (uint256 i = 0; i < totalClaims; i++) {
            if (!isClaimed[i] && canUnlockYield(i)) {
                (,,, uint256 yieldAmount,,,,) = yieldProof.claims(i);
                pending += yieldAmount;
            }
        }
    }
}
