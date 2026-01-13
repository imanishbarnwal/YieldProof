// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AttestorRegistry is Ownable {
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

    // Constants
    uint256 public constant MIN_REQUIRED_ATTESTORS = 3;

    event AttestorRegistered(address indexed attestor);
    event StakeAdded(address indexed attestor, uint256 amount);
    event ClaimAttested(uint256 indexed claimId, address indexed attestor, uint256 stakeAmount);
    event ClaimFlagged(uint256 indexed claimId, address indexed flagger, string reason);
    event AttestorSlashed(address indexed attestor, uint256 amount, address indexed slasher);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers the caller as an attestor. Optionally accepts initial stake.
     */
    function register() external payable {
        require(!attestors[msg.sender].isRegistered, "AttestorRegistry: already registered");
        
        attestors[msg.sender].isRegistered = true;
        
        emit AttestorRegistered(msg.sender);

        if (msg.value > 0) {
            _stakeETH(msg.sender, msg.value);
        }
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
        require(attestors[msg.sender].stake > 0, "AttestorRegistry: no stake");
        require(!hasAttested[claimId][msg.sender], "AttestorRegistry: already attested");
        require(!isFlagged[claimId], "AttestorRegistry: claim is flagged");

        hasAttested[claimId][msg.sender] = true;
        uint256 stakeAmount = attestors[msg.sender].stake;
        totalStakePerClaim[claimId] += stakeAmount;
        attestorCountPerClaim[claimId]++;
        attestorsList[claimId].push(msg.sender);

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
}
