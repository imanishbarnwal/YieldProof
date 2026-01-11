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

    event AttestorRegistered(address indexed attestor);
    event StakeAdded(address indexed attestor, uint256 amount);
    event ClaimAttested(uint256 indexed claimId, address indexed attestor, uint256 stakeAmount);
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

        hasAttested[claimId][msg.sender] = true;
        uint256 stakeAmount = attestors[msg.sender].stake;
        totalStakePerClaim[claimId] += stakeAmount;

        emit ClaimAttested(claimId, msg.sender, stakeAmount);
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
}
