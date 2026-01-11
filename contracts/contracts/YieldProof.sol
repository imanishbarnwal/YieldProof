// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AttestorRegistry.sol";

/**
 * @title YieldProof
 * @dev A simple Hackathon MVP contract for proving and tracking yield claims.
 *      Allows issuers to submit claims and an admin (mock governance) to update their status.
 */
contract YieldProof {
    // ============================
    // Type Definitions
    // ============================

    /// @notice Represents the current status of a submitted yield claim.
    enum ClaimStatus {
        Pending,    // Initial state after submission
        Attested,   // Verified by an off-chain or on-chain attestor (placeholder)
        Approved,   // Final approval by governance/admin
        Challenged  // Flagged as invalid or fraudulent
    }

    /// @notice variable struct holding all metadata for a specific yield claim.
    struct YieldClaim {
        uint256 claimId;        // Unique identifier for the claim
        string assetId;         // Identifier for the underlying asset (e.g., "USDC-LP-V3")
        string period;          // Time period covered (e.g., "2023-Q4")
        uint256 yieldAmount;    // The claimed yield amount (in smallest unit)
        string documentHash;    // IPFS hash or link to supporting documents/proofs
        address issuer;         // Address of the user submitting the claim
        ClaimStatus status;     // Current status of the claim
    }

    // ============================
    // State Variables
    // ============================

    /// @dev Counter for generating unique claim IDs.
    uint256 private nextClaimId;

    /// @notice Registry of all claims, mapped by their ID.
    mapping(uint256 => YieldClaim) public claims;

    /// @notice Governance/Admin address allowed to update statuses.
    address public admin;

    /// @notice Reference to the AttestorRegistry contract.
    AttestorRegistry public attestorRegistry;

    // ============================
    // Events
    // ============================

    /// @notice Emitted when a new yield claim is submitted.
    event YieldClaimSubmitted(
        uint256 indexed claimId,
        address indexed issuer,
        string assetId,
        uint256 yieldAmount
    );

    /// @notice Emitted when a claim's status is changed by the admin.
    event ClaimStatusUpdated(
        uint256 indexed claimId,
        ClaimStatus newStatus,
        address updatedBy
    );

    // ============================
    // Modifiers
    // ============================

    /// @dev Restricts access to the admin/governance address.
    modifier onlyAdmin() {
        require(msg.sender == admin, "YieldProof: caller is not the admin");
        _;
    }

    // ============================
    // Constructor
    // ============================

    constructor(address _attestorRegistry) {
        // Set the deployer as the initial admin
        admin = msg.sender;
        attestorRegistry = AttestorRegistry(_attestorRegistry);
    }

    // ============================
    // External Functions
    // ============================

    /**
     * @notice Allows an issuer to submit a new yield claim.
     * @dev The status is initialized to 'Pending'.
     * @param _assetId The string identifier of the asset (e.g., "MANTLE-ETH").
     * @param _period The string identifier for the period (e.g., "OCT-2023").
     * @param _yieldAmount The numeric amount of yield being claimed.
     * @param _documentHash An IPFS hash or URL pointing to proof documents.
     */
    function submitClaim(
        string calldata _assetId,
        string calldata _period,
        uint256 _yieldAmount,
        string calldata _documentHash
    ) external {
        uint256 claimId = nextClaimId;
        nextClaimId++;

        claims[claimId] = YieldClaim({
            claimId: claimId,
            assetId: _assetId,
            period: _period,
            yieldAmount: _yieldAmount,
            documentHash: _documentHash,
            issuer: msg.sender,
            status: ClaimStatus.Pending
        });

        emit YieldClaimSubmitted(claimId, msg.sender, _assetId, _yieldAmount);
    }

    /**
     * @notice Admin-only function to update the status of any claim.
     * @dev Acts as a mock governance mechanism for the hackathon MVP.
     * @param _claimId The ID of the claim to update.
     * @param _newStatus The new status to assign (0=Pending, 1=Attested, 2=Approved, 3=Challenged).
     */
    function updateClaimStatus(uint256 _claimId, ClaimStatus _newStatus) external onlyAdmin {
        // Ensure the claim exists (issuer should not be zero address)
        require(claims[_claimId].issuer != address(0), "YieldProof: claim does not exist");

        claims[_claimId].status = _newStatus;
        
        emit ClaimStatusUpdated(_claimId, _newStatus, msg.sender);
    }

    /**
     * @notice Updates the claim status based on AttestorRegistry data.
     * @dev This is a mock verification hook effectively.
     *      Anyone can call this to trigger the status update if conditions are met.
     * @param claimId The ID of the claim to check and update.
     */
    function updateClaimStatus(uint256 claimId) external {
        YieldClaim storage claim = claims[claimId];
        require(claim.issuer != address(0), "YieldProof: claim does not exist");
        require(claim.status == ClaimStatus.Pending, "YieldProof: claim not pending");

        // Check if there is any stake on this claim in the registry
        uint256 totalStake = attestorRegistry.totalStakePerClaim(claimId);

        if (totalStake > 0) {
            claim.status = ClaimStatus.Attested;
            emit ClaimStatusUpdated(claimId, ClaimStatus.Attested, msg.sender);
        }
    }

    /**
     * @notice Read-only helper to get the total number of claims submitted.
     */
    function getTotalClaims() external view returns (uint256) {
        return nextClaimId;
    }
}
