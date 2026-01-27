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

    // ============================
    // Events
    // ============================

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event YieldUnlocked(uint256 indexed claimId, uint256 totalStake);

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
     * @notice Checks if a specific claim has enough attestor stake to be "unlocked".
     * @param claimId The ID of the claim to check.
     * @return true if the claim is sufficiently attested.
     */
    function canUnlockYield(uint256 claimId) public view returns (bool) {
        uint256 currentStake = attestorRegistry.totalStakePerClaim(claimId);
        return currentStake >= minTotalStake;
    }

    /**
     * @notice Unlocks yield/rewards for a claim if it meets the stake threshold.
     * @dev This is a simplified action. In a real protocol, this might
     *      mint tokens, release escrowed funds, or distribute rewards to attestors.
     *      This function can only be called once per claim and marks it as claimed.
     * @param claimId The ID of the claim to unlock.
     */
    function unlockYield(uint256 claimId) external {
        require(!isClaimed[claimId], "YieldVault: claim already unlocked");
        require(canUnlockYield(claimId), "YieldVault: insufficient stake to unlock");

        // Mark the claim as claimed to prevent double-claiming
        isClaimed[claimId] = true;

        // NOTE: Actual distribution logic would go here.
        // For the MVP, we just emit the event to signal the off-chain indexer/UI.
        // In production, this would distribute yield proportionally to all depositors.

        uint256 stake = attestorRegistry.totalStakePerClaim(claimId);
        emit YieldUnlocked(claimId, stake);
    }
}
